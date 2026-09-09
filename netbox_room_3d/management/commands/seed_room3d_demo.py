"""Local fixture data only. Never enabled by the production plugin configuration."""
import io
import os

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from dcim.models import Device, DeviceRole, DeviceType, Location, Manufacturer, Rack, Site
from PIL import Image, ImageDraw

from netbox_room_3d.models import RoomLayout


def panel(rear=False):
    image = Image.new('RGB', (960, 178), '#a8b2c0')
    draw = ImageDraw.Draw(image)
    draw.rectangle((12, 12, 948, 166), fill='#111c2b')
    for i in range(12 if not rear else 8):
        x = 35 + i * 68
        draw.rounded_rectangle((x, 35, x + 54, 140), radius=4, fill='#0e7490' if rear else '#26374a', outline='#82929f', width=2)
        draw.ellipse((x + 5, 117, x + 12, 124), fill='#5eead4')
    draw.text((870, 80), 'REAR' if rear else 'FRONT', fill='white')
    buffer = io.BytesIO(); image.save(buffer, format='PNG')
    return ContentFile(buffer.getvalue())


class Command(BaseCommand):
    help = 'Create isolated Room3D demo inventory (requires ROOM3D_DEMO=true).'

    @transaction.atomic
    def handle(self, *args, **options):
        if os.environ.get('ROOM3D_DEMO') != 'true':
            raise CommandError('Only permitted in the local Compose demo environment.')
        user, created = get_user_model().objects.get_or_create(username='room3d-demo', defaults={'is_superuser': True})
        if created:
            user.set_password('room3d-local-demo'); user.save()
        site, _ = Site.objects.get_or_create(slug='room3d-demo', defaults={'name': 'Room3D Demo IDC'})
        location, _ = Location.objects.get_or_create(site=site, slug='room3d-room-a', defaults={'name': '서버실 A'})
        Location.objects.get_or_create(site=site, slug='room3d-room-b', defaults={'name': '네트워크실 B'})
        manufacturer, _ = Manufacturer.objects.get_or_create(slug='room3d-demo', defaults={'name': 'Room3D Demo'})
        role, _ = DeviceRole.objects.get_or_create(slug='room3d-server', defaults={'name': 'Room3D Server', 'color': '0d9488'})
        switch_role, _ = DeviceRole.objects.get_or_create(slug='room3d-switch', defaults={'name': 'Room3D Switch', 'color': '3b82f6'})
        server_type, _ = DeviceType.objects.get_or_create(manufacturer=manufacturer, slug='room3d-2u-image', defaults={'model': 'Demo 2U with images', 'u_height': 2, 'is_full_depth': True})
        if not server_type.front_image or not server_type.front_image.storage.exists(server_type.front_image.name):
            server_type.front_image.save('room3d-front.png', panel(), save=False)
        if not server_type.rear_image or not server_type.rear_image.storage.exists(server_type.rear_image.name):
            server_type.rear_image.save('room3d-rear.png', panel(True), save=False)
        server_type.save()
        plain_type, _ = DeviceType.objects.get_or_create(manufacturer=manufacturer, slug='room3d-2u-color', defaults={'model': 'Demo 2U color', 'u_height': 2, 'is_full_depth': True})
        switch_type, _ = DeviceType.objects.get_or_create(manufacturer=manufacturer, slug='room3d-1u', defaults={'model': 'Demo 1U switch', 'u_height': 1, 'is_full_depth': False})
        racks = []
        for i in range(6):
            rack, _ = Rack.objects.get_or_create(site=site, location=location, name=f'A-{i + 1:02}', defaults={
                'u_height': 42, 'width': 19, 'outer_width': 600, 'outer_depth': 1000, 'outer_height': 2100,
                'outer_unit': 'mm', 'status': 'active', 'desc_units': i == 2,
            })
            racks.append(rack)
            for n, pos in enumerate((2, 6, 10, 14, 18, 22, 26, 41)):
                dt = switch_type if n == 7 else server_type if n < 2 else plain_type
                Device.objects.get_or_create(site=site, name=f'room3d-{"sw" if n == 7 else "srv"}-{i + 1:02}-{n + 1:02}', defaults={
                    'location': location, 'rack': rack, 'device_type': dt, 'role': switch_role if n == 7 else role,
                    'position': pos, 'face': 'rear' if i == 2 and n == 7 else 'front', 'status': 'active',
                })
        RoomLayout.objects.get_or_create(location=location, defaults={'name': location.name, 'scene': {
            'placements': [{'rack_id': r.pk, 'x': 2400 + i * 1200, 'z': 3000, 'rotation': 0, 'locked': False, 'dimensions': {}} for i, r in enumerate(racks[:4])],
            'blocks': [{'id': 'pillar', 'name': '기둥', 'x': 9000, 'z': 6000, 'width': 600, 'depth': 600, 'height': 3000}],
            'appearances': {},
        }})
        self.stdout.write(self.style.SUCCESS('Local demo ready: 2 Locations, 6 racks, 48 devices. Existing layouts preserved.'))
