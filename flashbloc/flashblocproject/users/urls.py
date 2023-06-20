from django.urls import path, include
from .views import CustomUserCreate, BlacklistTokenUpdateView, accountView, findAccountView
from rest_framework.routers import DefaultRouter

app_name = 'users'

router = DefaultRouter()

# router.register('', accountView, basename="account")
router.register('', findAccountView, basename='')

urlpatterns = [
    path('create/', CustomUserCreate.as_view(), name="create_user"), 
    path('logout/blacklist/', BlacklistTokenUpdateView.as_view(), 
         name='blacklist'), 
    path('account/currLogin/<str:email>/', accountView.as_view({'get': 'get_currentLoginAccount'})), 
    path("", include(router.urls))
]   