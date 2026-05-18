# backend/aureon_backend/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),    # This creates /api/auth/me/
    path('api/finance/', include('finance.urls')), # Finance API endpoints
    path('api/ai/', include('ai_assistant.urls')), # AI Chatbot endpoints
    path('api/importer/', include('importer.urls')), # Statement importer endpoints
]
