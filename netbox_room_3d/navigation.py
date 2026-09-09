from netbox.plugins import PluginMenu, PluginMenuItem

menu = PluginMenu(
    label='Room 3D',
    groups=(('서버실', (PluginMenuItem(link='plugins:netbox_room_3d:viewer', link_text='3D 랙 배치', permissions=['dcim.view_location']),)),),
    icon_class='mdi mdi-cube-outline',
)
