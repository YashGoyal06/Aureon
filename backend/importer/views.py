import csv
import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from finance.models import Transaction
from finance.category_engine import categorize_transaction
from datetime import datetime
from decimal import Decimal

class StatementUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        file = request.FILES['file']
        transactions_created = 0

        try:
            if file.name.endswith('.csv'):
                # Read and parse CSV
                decoded_file = file.read().decode('utf-8')
                io_string = io.StringIO(decoded_file)
                reader = csv.reader(io_string)
                
                # Skip headers
                headers = next(reader, None)
                
                for row in reader:
                    if len(row) >= 3:
                        try:
                            date_str = row[0].strip()
                            if '/' in date_str:
                                parts = date_str.split('/')
                                if len(parts[-1]) == 2:
                                    date_str = date_str[:-2] + '20' + date_str[-2:]
                                date_obj = datetime.strptime(date_str, '%m/%d/%Y').date()
                            else:
                                date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
                                
                            merchant = row[1].strip()
                            amount_str = row[2].replace('$', '').replace(',', '').strip()
                            amount = Decimal(amount_str)
                            
                            prediction = categorize_transaction(merchant, amount=amount)

                            Transaction.objects.create(
                                user=request.user,
                                date=date_obj,
                                merchant=merchant,
                                amount=amount,
                                category=prediction["category"],
                                category_key=prediction["category_key"],
                            )
                            transactions_created += 1
                            
                        except Exception as parse_error:
                            print(f"Error parsing row {row}: {parse_error}")
                            continue
                            
            elif file.name.endswith('.pdf'):
                from pypdf import PdfReader
                import os
                import requests
                import json
                
                reader = PdfReader(file)
                full_text = ""
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n"
                
                if not full_text.strip():
                    return Response({"error": "Could not extract text from PDF. It might be scanned or password protected."}, status=status.HTTP_400_BAD_REQUEST)
                
                # Call Hugging Face API to parse transactions
                hf_api_key = os.getenv('HUGGINGFACE_API_KEY')
                if not hf_api_key:
                    return Response({"error": "Hugging Face API Key is not configured on the server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                # Get the first 6000 and the last 4000 characters of the text to ensure we capture the closing balance section printed at the end
                if len(full_text) <= 10000:
                    prompt_text = full_text
                else:
                    prompt_text = full_text[:6000] + "\n... [TRUNCATED] ...\n" + full_text[-4000:]
                
                prompt = f"""You are a financial data extraction assistant. Analyze the bank statement text to extract the final/closing balance of the account and all transactions.
Return the output STRICTLY as a JSON object with the following keys. Do not include markdown code block formatting (like ```json), other tags, or explanations.
Keys:
- "closing_balance": number (the final/closing/ending balance of the account as shown in the statement. Look for phrases like "Closing Balance", "Ending Balance", "Balance Carried Forward", "Available Balance", or the balance listed in the last transaction row. Do not include currency symbols or commas, just a clean float/decimal.)
- "transactions": a JSON array of objects, where each object has these exact keys:
  - "date": string in YYYY-MM-DD format
  - "merchant": string (clean name of the merchant or person. Remove raw UPI IDs, transaction codes like UPI/DR/..., and account numbers to make it look clean).
  - "amount": number (positive number always)
  - "type": "expense" or "income" (CRITICAL: Use "expense" if the transaction is a debit, withdrawal, marked with "DR", "UPI/DR", "Paid out", "Sent to", or in the Debit/Withdrawal column. Use "income" if the transaction is a credit, deposit, marked with "CR", "UPI/CR", "Received in", "Received from", or in the Credit/Deposit column. Pay extreme attention to DR/CR markers in UPI transaction descriptions as they determine the true direction of the funds!)
  - "category_key": one of ["income", "dining", "coffee", "groceries", "transportation", "entertainment", "shopping", "healthcare", "education", "housing", "miscellaneous"]
  - "category": the corresponding display name (e.g. "Food & Dining" for "dining", "Income" for "income", "Miscellaneous" for "miscellaneous")

Text:
{prompt_text}
"""
                
                API_URL = "https://router.huggingface.co/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {hf_api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": "meta-llama/Llama-3.1-8B-Instruct",
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 3000,
                    "temperature": 0.1
                }
                
                try:
                    response = requests.post(API_URL, headers=headers, json=payload)
                    if response.status_code == 200:
                        result = response.json()
                        bot_reply = result['choices'][0]['message']['content'].strip() if ('choices' in result and len(result['choices']) > 0) else ""
                        
                        # Robustly extract JSON using regex
                        import re
                        parsed_data = None
                        
                        # Try to extract the JSON object first
                        object_match = re.search(r'\{.*\}', bot_reply, re.DOTALL)
                        if object_match:
                            try:
                                parsed_data = json.loads(object_match.group(0))
                            except Exception as parse_err:
                                print(f"Failed to parse JSON object from match: {parse_err}")
                        
                        # Fallback: if no object or object parsing failed, check for array
                        if not parsed_data:
                            array_match = re.search(r'\[.*\]', bot_reply, re.DOTALL)
                            if array_match:
                                try:
                                    transactions_data = json.loads(array_match.group(0))
                                    parsed_data = {"transactions": transactions_data, "closing_balance": None}
                                except Exception as parse_err:
                                    print(f"Failed to parse JSON array from match: {parse_err}")
                        
                        if not parsed_data:
                            print(f"Failed to parse JSON from AI reply. Reply was: {bot_reply}")
                            return Response({"error": "AI generated invalid JSON structure. Please try again."}, status=status.HTTP_502_BAD_GATEWAY)
                        
                        # Extract components
                        if isinstance(parsed_data, dict):
                            transactions_data = parsed_data.get('transactions', [])
                            closing_balance = parsed_data.get('closing_balance')
                        else:
                            transactions_data = parsed_data
                            closing_balance = None
                        
                        for tx in transactions_data:
                            try:
                                date_obj = datetime.strptime(tx['date'], '%Y-%m-%d').date()
                                merchant = tx['merchant']
                                amount = Decimal(str(tx['amount']))
                                
                                # Handle debit/credit sign based on type
                                if tx.get('type') == 'expense':
                                    amount = -abs(amount)
                                elif tx.get('type') == 'income':
                                    amount = abs(amount)
                                
                                category = tx.get('category')
                                category_key = tx.get('category_key')
                                
                                # Fallback if AI didn't provide category
                                if not category or not category_key:
                                    prediction = categorize_transaction(merchant, amount=amount)
                                    category = prediction["category"]
                                    category_key = prediction["category_key"]
                                
                                Transaction.objects.create(
                                    user=request.user,
                                    date=date_obj,
                                    merchant=merchant,
                                    amount=amount,
                                    category=category,
                                    category_key=category_key,
                                )
                                transactions_created += 1
                            except Exception as e:
                                print(f"Error creating transaction from AI data: {e}")
                                continue
                        
                        # If a closing balance was successfully parsed, set user's profile balance to it
                        if closing_balance is not None:
                            try:
                                closing_dec = Decimal(str(closing_balance))
                                from users.models import FinancialProfile
                                profile, _ = FinancialProfile.objects.get_or_create(user=request.user)
                                profile.cash_available = closing_dec
                                profile.net_worth = closing_dec + profile.invested_amount - profile.credit_used
                                profile.save()
                                print(f"Successfully updated user profile cash_available to: {closing_dec}")
                            except Exception as profile_err:
                                print(f"Error updating user profile balance: {profile_err}")
                                
                    else:
                        print(f"AI model error: {response.text}")
                        return Response({"error": f"AI model error: {response.text}"}, status=status.HTTP_502_BAD_GATEWAY)
                except Exception as e:
                    print(f"Exception during AI parsing: {e}")
                    return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response({"error": "Only CSV and PDF files are supported"}, status=status.HTTP_400_BAD_REQUEST)
                
            return Response({
                "message": f"Successfully processed statement. Created {transactions_created} transactions.",
                "count": transactions_created
            })
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
