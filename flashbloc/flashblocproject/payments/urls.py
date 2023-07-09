from django.urls import path, include
from .views import PtpPaymentsViewSet, LocalPaymentsViewSet, TopUpPaymentsViewSet
from rest_framework.routers import DefaultRouter
from django.urls import reverse


app_name = 'payments'

router = DefaultRouter()
router.register('ptp', PtpPaymentsViewSet, basename='ptp')
router.register('local', LocalPaymentsViewSet, basename='local')
router.register('topup', TopUpPaymentsViewSet, basename='topup')


urlpatterns = [
    path("", include(router.urls)),
]   