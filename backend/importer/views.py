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
                
                # Limit text to avoid token limits (approx 5000 chars)
                prompt_text = full_text[:5000]
                
                prompt = f"""You are a financial data extraction assistant. Extract all transactions from the following bank statement text.
Return the output STRICTLY as a JSON array of objects. Do not include markdown code block formatting (like ```json), other tags, or explanations. Each object must have these exact keys:
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
                        
                        # Robustly extract JSON array using regex
                        import re
                        json_match = re.search(r'\[.*\]', bot_reply, re.DOTALL)
                        if json_match:
                            bot_reply = json_match.group(0)
                        
                        try:
                            transactions_data = json.loads(bot_reply)
                        except Exception as e:
                            print(f"Failed to parse JSON from AI: {e}. Reply was: {bot_reply}")
                            return Response({"error": "AI generated invalid JSON. Please try again."}, status=status.HTTP_502_BAD_GATEWAY)
                        
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
