from netbox.api.serializers import NetBoxModelSerializer
from rest_framework import serializers

from netbox_room_3d.models import RoomLayout


class RoomLayoutSerializer(NetBoxModelSerializer):
    """Required by NetBox change events; writes go through the validated scene endpoint."""
    url = serializers.SerializerMethodField()
    scene = serializers.SerializerMethodField()

    def get_scene(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from netbox_room_3d.services import inventory, visible_scene
            return visible_scene(obj, inventory(request.user, obj.location, obj.include_descendants), request.user)[0]
        return {key: value for key, value in (obj.scene or {}).items() if not key.startswith('_') and key != 'planned_devices'}

    def get_url(self, obj):
        return obj.get_absolute_url()

    class Meta:
        model = RoomLayout
        fields = ('id', 'url', 'display', 'name', 'location', 'width', 'depth', 'height', 'grid',
                  'include_descendants', 'revision', 'scene', 'tags', 'custom_fields', 'created', 'last_updated')
        brief_fields = ('id', 'url', 'display', 'name')
        read_only_fields = fields
