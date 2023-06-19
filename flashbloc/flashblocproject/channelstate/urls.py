from django.urls import path, include
from .views import channelStateView
from rest_framework.routers import DefaultRouter
from django.urls import reverse


app_name = 'channelstate'

router = DefaultRouter()
router.register('', channelStateView, basename='')


urlpatterns = [
    path("", include(router.urls)),
]   

