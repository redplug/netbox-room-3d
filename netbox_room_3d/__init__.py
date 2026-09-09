from netbox.plugins import PluginConfig


class Room3DConfig(PluginConfig):
    name = 'netbox_room_3d'
    verbose_name = 'Room 3D'
    description = 'Location-based 3D rack layouts'
    version = '0.1.2'
    base_url = 'room-3d'
    min_version = '4.5.0'
    max_version = '4.5.99'
    default_settings = {}


config = Room3DConfig
