from django.urls import path
from .views import StatementUploadView, StatementScanView, StatementConfirmView

urlpatterns = [
    path('upload/', StatementUploadView.as_view(), name='statement-upload'),
    path('scan/', StatementScanView.as_view(), name='statement-scan'),
    path('confirm/', StatementConfirmView.as_view(), name='statement-confirm'),
]
