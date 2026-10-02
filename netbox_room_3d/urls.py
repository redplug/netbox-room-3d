from django.urls import path
from . import views
from . import operations

urlpatterns = [
    path('', views.viewer, name='viewer'),
    path('layouts/<int:pk>/', views.viewer, name='roomlayout'),
    path('data/locations/', views.locations, name='locations'),
    path('data/locations/<int:pk>/', views.location_scene, name='location_scene'),
    path('data/locations/<int:pk>/history/', views.layout_history, name='layout_history'),
    path('data/locations/<int:pk>/plans/', operations.plans, name='plans'),
    path('data/locations/<int:pk>/cleanup/', operations.cleanup, name='cleanup'),
    path('data/locations/<int:pk>/cables/', operations.cables, name='cables'),
]
