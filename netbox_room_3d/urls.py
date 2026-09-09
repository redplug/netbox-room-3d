from django.urls import path
from . import views

urlpatterns = [
    path('', views.viewer, name='viewer'),
    path('layouts/<int:pk>/', views.viewer, name='roomlayout'),
    path('data/locations/', views.locations, name='locations'),
    path('data/locations/<int:pk>/', views.location_scene, name='location_scene'),
]
