from django.db import models
from django.urls import reverse
from netbox.models import NetBoxModel


class RoomLayout(NetBoxModel):
    name = models.CharField(max_length=100)
    location = models.OneToOneField('dcim.Location', on_delete=models.PROTECT, related_name='room_3d')
    width = models.PositiveIntegerField(default=12000)
    depth = models.PositiveIntegerField(default=8000)
    height = models.PositiveIntegerField(default=3000)
    grid = models.PositiveIntegerField(default=600)
    include_descendants = models.BooleanField(default=False)
    revision = models.PositiveIntegerField(default=1)
    # One atomic, versioned document keeps placement edits and appearance edits together.
    # All referenced Rack/Device IDs are validated against the location and user permissions.
    scene = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ('name',)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('plugins:netbox_room_3d:roomlayout', args=[self.pk])
