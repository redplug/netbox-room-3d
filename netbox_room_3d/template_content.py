from netbox.plugins import PluginTemplateExtension


class LocationRoomLink(PluginTemplateExtension):
    models = ['dcim.location']

    def buttons(self):
        return self.render('netbox_room_3d/location_button.html')


template_extensions = [LocationRoomLink]
