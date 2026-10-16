from django.urls import path
from . import views
from . import operations
from . import device_inventory

urlpatterns = [
    path('', views.viewer, name='viewer'),
    path('layouts/<int:pk>/', views.viewer, name='roomlayout'),
    path('data/locations/', views.locations, name='locations'),
    path('data/devices/', device_inventory.devices, name='devices'),
    path('data/locations/<int:pk>/', views.location_scene, name='location_scene'),
    path('data/locations/<int:pk>/history/', views.layout_history, name='layout_history'),
    path('data/locations/<int:pk>/plans/', operations.plans, name='plans'),
    path('data/locations/<int:pk>/cleanup/', operations.cleanup, name='cleanup'),
    path('data/locations/<int:pk>/cables/', operations.cables, name='cables'),
    path('data/locations/<int:pk>/capacity/', operations.capacity, name='capacity'),
    path('data/locations/<int:pk>/recommendations/', operations.recommendations, name='recommendations'),
    path('data/locations/<int:pk>/free-units/', operations.free_units, name='free_units'),
    path('data/locations/<int:pk>/device-types/', operations.device_types, name='device_types'),
]
