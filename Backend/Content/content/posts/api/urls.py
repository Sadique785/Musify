from django.urls import path
from .views import FirstView,VerifyUserView, SaveUploadView, UserUploadsListView


urlpatterns = [
    path('first/',FirstView.as_view(), name='first' ),
    path('verify-user/', VerifyUserView.as_view(), name='verify-user'),
    path('save-upload/', SaveUploadView.as_view(), name='save-upload'), 
    path('uploads/', UserUploadsListView.as_view(), name='user-uploads'), 


]