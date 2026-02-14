# backend/aureon_backend/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),    # This creates /api/auth/me/
    # path('api/finance/', include('finance.urls')), # We will uncomment this later
]
