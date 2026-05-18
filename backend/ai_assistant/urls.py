from django.urls import path
from .views import ChatbotView, AIInsightsView

urlpatterns = [
    path('chat/', ChatbotView.as_view(), name='chatbot'),
    path('insights/', AIInsightsView.as_view(), name='ai-insights'),
]
