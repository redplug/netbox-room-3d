from netbox.api.serializers import NetBoxModelSerializer
from rest_framework import serializers

from netbox_room_3d.models import RoomLayout


class RoomLayoutSerializer(NetBoxModelSerializer):
    """Required by NetBox change events; writes go through the validated scene endpoint."""
    url = serializers.SerializerMethodField()

    def get_url(self, obj):
        return obj.get_absolute_url()

    class Meta:
        model = RoomLayout
        fields = ('id', 'url', 'display', 'name', 'location', 'width', 'depth', 'height', 'grid',
                  'include_descendants', 'revision', 'scene', 'tags', 'custom_fields', 'created', 'last_updated')
        brief_fields = ('id', 'url', 'display', 'name')
        read_only_fields = fields
