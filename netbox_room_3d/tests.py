import copy
import json

from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.test import Client, TestCase
from django.urls import reverse
from dcim.models import Device, DeviceRole, DeviceType, Location, Manufacturer, Rack, Site
from users.models import ObjectPermission

from .models import RoomLayout
from .services import rack_data
from .validation import SceneError, validate_scene


class RoomAPITest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin = get_user_model().objects.create_superuser(username='test-admin', password='test-only-password')
        cls.reader = get_user_model().objects.create_user(username='test-reader')
        cls.site = Site.objects.create(name='Test IDC', slug='test-idc')
        cls.location = Location.objects.create(site=cls.site, name='Room', slug='room')
        cls.other = Location.objects.create(site=cls.site, name='Other', slug='other')
        cls.child = Location.objects.create(site=cls.site, parent=cls.location, name='Child', slug='child')
        cls.rack = Rack.objects.create(site=cls.site, location=cls.location, name='R1', u_height=42, width=19,
                                      outer_width=600, outer_depth=1000, outer_height=2100, outer_unit='mm')
        cls.foreign = Rack.objects.create(site=cls.site, location=cls.other, name='OtherRack')
        cls.child_rack = Rack.objects.create(site=cls.site, location=cls.child, name='ChildRack')
        manufacturer = Manufacturer.objects.create(name='Test', slug='test')
        cls.device_type = DeviceType.objects.create(manufacturer=manufacturer, model='Test 2U', slug='test-2u', u_height=2)
        role = DeviceRole.objects.create(name='Server', slug='server', color='0d9488')
        cls.device = Device.objects.create(name='server', site=cls.site, rack=cls.rack, device_type=cls.device_type,
                                          role=role, position=1, face='front')
        cls.payload = {
            'name': 'Room', 'width': 12000, 'depth': 8000, 'height': 3000, 'grid': 600,
            'revision': 0, 'include_descendants': False, 'placements': [
                {'rack_id': cls.rack.pk, 'x': 1200, 'z': 1800, 'rotation': 90, 'locked': False, 'dimensions': {}}],
            'blocks': [], 'appearances': {str(cls.device.pk): {'color': '#ff8800'}},
        }

    def setUp(self):
        self.client.force_login(self.admin)
        self.url = reverse('plugins:netbox_room_3d:location_scene', args=[self.location.pk])

    def save(self, payload=None):
        return self.client.put(self.url, json.dumps(payload or self.payload), content_type='application/json')

    def grant(self, model, actions, constraints=None):
        p = ObjectPermission.objects.create(name=f'Permission {model.__name__}', actions=actions, constraints=constraints)
        p.object_types.add(ContentType.objects.get_for_model(model)); p.users.add(self.reader)

    def test_round_trip_and_inventory_is_unchanged(self):
        response = self.save()
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()['layout']['revision'], 1)
        loaded = self.client.get(self.url).json()
        self.assertEqual(loaded['layout']['placements'], self.payload['placements'])
        self.assertEqual(loaded['layout']['appearances'], self.payload['appearances'])
        self.rack.refresh_from_db(); self.device.refresh_from_db()
        self.assertEqual(self.rack.location_id, self.location.pk)
        self.assertEqual(self.device.position, 1)

    def test_stale_revision_rejected_without_overwrite(self):
        self.assertEqual(self.save().status_code, 200)
        stale = copy.deepcopy(self.payload); stale['name'] = 'Overwrite'
        self.assertEqual(self.save(stale).status_code, 409)
        self.assertEqual(RoomLayout.objects.get().name, 'Room')

    def test_collision_and_boundary_rejected(self):
        payload = copy.deepcopy(self.payload)
        payload['blocks'] = [{'id': 'pillar', 'name': '기둥', 'x': 1200, 'z': 1800, 'width': 300, 'depth': 300, 'height': 1000}]
        self.assertEqual(self.save(payload).status_code, 400)
        payload['blocks'] = []; payload['placements'][0]['x'] = 0
        self.assertEqual(self.save(payload).status_code, 400)
        self.assertFalse(RoomLayout.objects.exists())

    def test_out_of_scope_and_duplicate_racks_rejected(self):
        payload = copy.deepcopy(self.payload); payload['placements'][0]['rack_id'] = self.foreign.pk
        self.assertEqual(self.save(payload).status_code, 400)
        payload = copy.deepcopy(self.payload); payload['placements'] *= 2
        self.assertEqual(self.save(payload).status_code, 400)

    def test_descendant_scope_is_explicit(self):
        self.assertEqual(len(self.client.get(self.url).json()['racks']), 1)
        self.assertEqual(len(self.client.get(self.url + '?descendants=true').json()['racks']), 2)
        payload = copy.deepcopy(self.payload); payload['placements'][0]['rack_id'] = self.child_rack.pk
        self.assertEqual(self.save(payload).status_code, 400)
        payload['include_descendants'] = True
        self.assertEqual(self.save(payload).status_code, 200)

    def test_read_only_user_cannot_save(self):
        self.assertEqual(self.save().status_code, 200)
        for model in (Location, Rack, Device, DeviceType, RoomLayout):
            self.grant(model, ['view'])
        self.client.force_login(self.reader)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()['can_edit'])
        self.assertEqual(self.save().status_code, 403)

    def test_hidden_rack_and_settings_are_not_exposed(self):
        self.assertEqual(self.save().status_code, 200)
        self.grant(Location, ['view']); self.grant(RoomLayout, ['view', 'change'])
        self.grant(Rack, ['view'], {'id': self.foreign.pk})
        self.client.force_login(self.reader)
        response = self.client.get(self.url).json()
        self.assertEqual(response['racks'], [])
        self.assertEqual(response['layout']['placements'], [])
        self.assertEqual(response['layout']['appearances'], {})
        self.assertFalse(response['can_edit'])

    def test_invalid_appearance_image_and_color_rejected(self):
        payload = copy.deepcopy(self.payload); payload['appearances'][str(self.device.pk)]['front_image_id'] = 999999
        self.assertEqual(self.save(payload).status_code, 400)
        payload = copy.deepcopy(self.payload); payload['appearances'][str(self.device.pk)]['color'] = 'javascript:bad'
        self.assertEqual(self.save(payload).status_code, 400)

    def test_csrf_enforced(self):
        client = Client(enforce_csrf_checks=True); client.force_login(self.admin)
        response = client.put(self.url, json.dumps(self.payload), content_type='application/json')
        self.assertEqual(response.status_code, 403)

    def test_malformed_numeric_payload_rejected(self):
        for value in (None, True, float('nan'), -1, '12000'):
            payload = copy.deepcopy(self.payload); payload['width'] = value
            self.assertEqual(self.save(payload).status_code, 400)

    def test_inch_conversion_and_missing_dimensions(self):
        self.rack.outer_unit = 'in'; self.rack.outer_width = 24
        self.assertAlmostEqual(rack_data(self.rack)['width'], 609.6)
        self.rack.outer_depth = None
        self.assertIn('depth', rack_data(self.rack)['estimated'])

    def test_version_and_page(self):
        response = self.client.get(reverse('plugins:netbox_room_3d:viewer'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'netbox_room_3d/viewer.js')
