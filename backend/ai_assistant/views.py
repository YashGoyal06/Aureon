import os
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Sum
from finance.models import Transaction, Budget

class ChatbotView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_message = request.data.get('message')
        if not user_message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Gather User Context
        user = request.user
        
        # Calculate cash available from profile
        cash_available = getattr(user, 'profile', None) and user.profile.cash_available or 0
        net_worth = getattr(user, 'profile', None) and user.profile.net_worth or 0
        
        # Get budgets
        budgets = Budget.objects.filter(user=user)
        budget_context = "\n".join([f"- {b.name}: ${b.spent_amount} spent out of ${b.budget_amount} ({b.status})" for b in budgets])
        
        # Get recent transactions
        recent_tx = Transaction.objects.filter(user=user).order_by('-date')[:5]
        tx_context = "\n".join([f"- {t.date}: ${t.amount} at {t.merchant} ({t.category})" for t in recent_tx])
        
        context_prompt = f"""You are Aureon's premium AI Financial Assistant. You give concise, professional, and helpful financial advice.
User Profile:
- Available Cash: ${cash_available}
- Net Worth: ${net_worth}
Active Budgets:
{budget_context if budget_context else "No active budgets."}
Recent Transactions:
{tx_context if tx_context else "No recent transactions."}

Based strictly on this data, answer the user's question. Do not make up data not present here.
User Question: "{user_message}"
"""

        # 2. Call Hugging Face API
        hf_api_key = os.getenv('HUGGINGFACE_API_KEY')
        if not hf_api_key:
            return Response({"error": "Hugging Face API Key is not configured on the server. Please add HUGGINGFACE_API_KEY to your .env file."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Using Llama 3.1 8B Instruct via modern Hugging Face OpenAI-compatible Router Endpoint
        API_URL = "https://router.huggingface.co/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {hf_api_key}",
            "Content-Type": "application/json"
        }
        
        # OpenAI-compatible context-aware payload
        payload = {
            "model": "meta-llama/Llama-3.1-8B-Instruct",
            "messages": [
                {"role": "system", "content": context_prompt},
                {"role": "user", "content": user_message}
            ],
            "max_tokens": 300,
            "temperature": 0.5
        }

        try:
            response = requests.post(API_URL, headers=headers, json=payload)
            if response.status_code == 200:
                result = response.json()
                if 'choices' in result and len(result['choices']) > 0:
                    bot_reply = result['choices'][0]['message']['content'].strip()
                else:
                    bot_reply = "I'm sorry, I couldn't generate a response at this time."
                
                return Response({"reply": bot_reply})
            else:
                return Response({"error": f"AI model error: {response.text}"}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


import json

class AIInsightsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        cash_available = getattr(user, 'profile', None) and user.profile.cash_available or 0
        net_worth = getattr(user, 'profile', None) and user.profile.net_worth or 0
        
        # Get budgets
        budgets = Budget.objects.filter(user=user)
        budget_context = "\n".join([f"- {b.name}: ${b.spent_amount} spent out of ${b.budget_amount} ({b.status})" for b in budgets])
        
        # Get recent transactions
        recent_tx = Transaction.objects.filter(user=user).order_by('-date')[:5]
        tx_context = "\n".join([f"- {t.date}: ${t.amount} at {t.merchant} ({t.category})" for t in recent_tx])

        context_prompt = f"""You are Aureon's premium AI Financial Assistant. Based on the user's financial profile, generate exactly three helpful financial insights.
User Profile:
- Available Cash: ${cash_available}
- Net Worth: ${net_worth}
Active Budgets:
{budget_context if budget_context else "No active budgets."}
Recent Transactions:
{tx_context if tx_context else "No recent transactions."}

Provide the output strictly as a JSON array of three objects. Do not include markdown code block formatting (like ```json), other tags, or explanations. Each object must have these exactly:
- "id": unique number 1, 2, 3
- "type": one of "success", "warning", "suggestion", "pattern"
- "title": a very short title
- "message": a helpful one-sentence message
- "savings": optional, an integer number of potential savings in dollars (e.g. 42)
- "detail": a short secondary detail string (e.g. "Keep it up!")
- "options": optional array of 2 strings if type is "suggestion"

Example:
[
  {{"id": 1, "type": "success", "title": "Great news!", "message": "You spent 15% less this week on food.", "savings": 25, "detail": "Keep it up!"}},
  {{"id": 2, "type": "warning", "title": "Watch out!", "message": "Your subscriptions total $45 this month.", "detail": "Consider cancelling unused ones."}},
  {{"id": 3, "type": "suggestion", "title": "Smart Suggestion", "message": "You have extra cash.", "options": ["Invest it", "Add to goal"]}}
]
"""

        hf_api_key = os.getenv('HUGGINGFACE_API_KEY')
        if not hf_api_key:
            fallback_insights = [
                {"id": 1, "type": "success", "title": "Welcome Aboard!", "message": "Your Aureon setup is complete. Let's start tracking your finances.", "detail": "Nice job!"},
                {"id": 2, "type": "warning", "title": "No Transactions Yet", "message": "Upload a CSV bank statement to get deep Llama-powered insights.", "detail": "Visit Data Import page."},
                {"id": 3, "type": "suggestion", "title": "Set a Saving Goal", "message": "Create your first goal to help Llama calculate targets.", "options": ["Go to Goals", "View suggestions"]}
            ]
            return Response(fallback_insights)

        # Using Llama 3.1 8B Instruct via modern Hugging Face OpenAI-compatible Router Endpoint
        API_URL = "https://router.huggingface.co/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {hf_api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "meta-llama/Llama-3.1-8B-Instruct",
            "messages": [
                {"role": "user", "content": context_prompt}
            ],
            "max_tokens": 500,
            "temperature": 0.3
        }

        try:
            response = requests.post(API_URL, headers=headers, json=payload)
            if response.status_code == 200:
                result = response.json()
                bot_reply = result['choices'][0]['message']['content'].strip() if ('choices' in result and len(result['choices']) > 0) else ""
                if bot_reply.startswith("```"):
                    bot_reply = bot_reply.strip("`").strip("json").strip()
                parsed_insights = json.loads(bot_reply)
                return Response(parsed_insights)
            else:
                raise Exception(response.text)
        except Exception as e:
            fallback_insights = [
                {"id": 1, "type": "success", "title": "Safe Balance", "message": f"Your current cash balance is ${cash_available}.", "detail": "Good liquidity status."},
                {"id": 2, "type": "suggestion", "title": "Create a Budget", "message": "Setting up budgets helps Llama suggest dynamic saving paths.", "detail": "Create one in the Budget tab."},
                {"id": 3, "type": "pattern", "title": "Clean Sheet", "message": "No abnormal spending patterns detected this week.", "detail": "Nice work!"}
            ]
            return Response(fallback_insights)
