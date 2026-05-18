import csv
import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from finance.models import Transaction
from datetime import datetime
from decimal import Decimal

class StatementUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        file = request.FILES['file']
        if not file.name.endswith('.csv'):
            return Response({"error": "Only CSV files are supported currently"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Read and parse CSV
            decoded_file = file.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            reader = csv.reader(io_string)
            
            # Skip headers (Optional: Could implement smart header detection)
            headers = next(reader, None)
            
            transactions_created = 0
            
            for row in reader:
                # Basic heuristic mapping assuming: Date, Description/Merchant, Amount
                if len(row) >= 3:
                    try:
                        # Attempt to parse date
                        date_str = row[0].strip()
                        if '/' in date_str:
                            # Try MM/DD/YYYY or DD/MM/YYYY
                            parts = date_str.split('/')
                            if len(parts[-1]) == 2: # e.g. 1/5/26
                                date_str = date_str[:-2] + '20' + date_str[-2:]
                            date_obj = datetime.strptime(date_str, '%m/%d/%Y').date()
                        else:
                            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
                            
                        merchant = row[1].strip()
                        amount_str = row[2].replace('$', '').replace(',', '').strip()
                        amount = Decimal(amount_str)
                        
                        # Basic auto-categorization
                        merchant_lower = merchant.lower()
                        if 'starbucks' in merchant_lower or 'coffee' in merchant_lower:
                            category = "Coffee & Cafes"
                            category_key = "coffee"
                        elif 'uber' in merchant_lower or 'shell' in merchant_lower or 'gas' in merchant_lower:
                            category = "Transportation"
                            category_key = "transportation"
                        elif 'target' in merchant_lower or 'walmart' in merchant_lower or 'whole foods' in merchant_lower:
                            category = "Groceries"
                            category_key = "groceries"
                        elif 'netflix' in merchant_lower or 'spotify' in merchant_lower:
                            category = "Entertainment"
                            category_key = "entertainment"
                        else:
                            category = "Miscellaneous"
                            category_key = "miscellaneous"

                        Transaction.objects.create(
                            user=request.user,
                            date=date_obj,
                            merchant=merchant,
                            amount=amount,
                            category=category,
                            category_key=category_key,
                        )
                        transactions_created += 1
                        
                    except Exception as parse_error:
                        print(f"Error parsing row {row}: {parse_error}")
                        continue
                        
            return Response({
                "message": f"Successfully processed statement. Created {transactions_created} transactions.",
                "count": transactions_created
            })
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
