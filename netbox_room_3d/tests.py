import copy
import json

from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.test import Client, TestCase
from django.urls import reverse
from dcim.models import Device, DeviceRole, DeviceType, Interface, Location, Manufacturer, Rack, Site
from ipam.models import IPAddress
from users.models import ObjectPermission

from .models import RoomLayout
from .services import inventory, rack_data
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

    def test_network_metadata_respects_object_permissions(self):
        port = Interface.objects.create(device=self.device, name='eth0', type='1000base-t')
        ip = IPAddress.objects.create(address='192.0.2.10/24')
        ip.assigned_object = port
        ip.save()
        other_port = Interface.objects.create(device=self.device, name='eth1', type='1000base-t')
        self.device.primary_ip4 = ip
        self.device.save()
        row = inventory(self.admin, self.location)[self.rack.pk]['devices'][0]
        self.assertEqual(row['interfaces'], [{'id': port.pk, 'name': 'eth0', 'is_primary': True, 'primary_ips': ['192.0.2.10/24']},
                                             {'id': other_port.pk, 'name': 'eth1', 'is_primary': False, 'primary_ips': []}])
        self.assertEqual(row['primary_ips'], ['192.0.2.10/24'])

        self.grant(Rack, ['view']); self.grant(Device, ['view'])
        row = inventory(self.reader, self.location)[self.rack.pk]['devices'][0]
        self.assertEqual(row['interfaces'], [])
        self.assertEqual(row['primary_ips'], [])
        self.grant(Interface, ['view']); self.grant(IPAddress, ['view'])
        row = inventory(get_user_model().objects.get(pk=self.reader.pk), self.location)[self.rack.pk]['devices'][0]
        self.assertEqual(len(row['interfaces']), 2)
        self.assertEqual(row['primary_ips'], ['192.0.2.10/24'])

    def test_multiple_primary_ips_map_to_their_own_interfaces(self):
        p4 = Interface.objects.create(device=self.device, name='nic-1', type='1000base-t')
        p6 = Interface.objects.create(device=self.device, name='nic-2', type='1000base-t')
        ip4 = IPAddress(address='192.0.2.20/24', assigned_object=p4); ip4.save()
        ip6 = IPAddress(address='2001:db8::20/64', assigned_object=p6); ip6.save()
        self.device.primary_ip4 = ip4; self.device.primary_ip6 = ip6; self.device.save()
        row = inventory(self.admin, self.location)[self.rack.pk]['devices'][0]
        self.assertEqual(row['interfaces'][0]['primary_ips'], ['192.0.2.20/24'])
        self.assertEqual(row['interfaces'][1]['primary_ips'], ['2001:db8::20/64'])
        self.assertEqual(set(row['ip_addresses']), {'192.0.2.20/24', '2001:db8::20/64'})
        self.grant(Rack, ['view']); self.grant(Device, ['view'])
        hidden = inventory(self.reader, self.location)[self.rack.pk]['devices'][0]
        self.assertEqual(hidden['ip_addresses'], [])

    def test_room_object_types_round_trip_and_validation(self):
        for kind in ('pillar', 'ups', 'cooling', 'battery', 'desk', 'door', 'glass', 'wall', 'solid'):
            payload = copy.deepcopy(self.payload)
            payload['blocks'] = [{'id': 'object1', 'name': kind, 'type': kind,
                                  'x': 5000, 'z': 5000, 'width': 1000, 'depth': 200,
                                  'height': 2000, 'rotation': 90}]
            payload['revision'] = RoomLayout.objects.filter(location=self.location).values_list('revision', flat=True).first() or 0
            response = self.client.put(self.url, data=json.dumps(payload), content_type='application/json')
            self.assertEqual(response.status_code, 200, response.content)
            block = self.client.get(self.url).json()['layout']['blocks'][0]
            self.assertEqual(block['type'], kind)
            self.assertEqual(block['rotation'], 90)
        payload['revision'] = RoomLayout.objects.get(location=self.location).revision
        payload['blocks'][0]['type'] = 'unsupported'
        self.assertEqual(self.client.put(self.url, data=json.dumps(payload), content_type='application/json').status_code, 400)
        payload['blocks'][0]['type'] = 'ups'
        payload['blocks'][0]['rotation'] = 45
        self.assertEqual(self.client.put(self.url, data=json.dumps(payload), content_type='application/json').status_code, 400)

    def test_location_filter_uses_visible_assigned_racks(self):
        empty = Location.objects.create(site=self.site, name='Empty', slug='empty')
        url = reverse('plugins:netbox_room_3d:locations')
        rows = {row['id']: row for row in self.client.get(url).json()['locations']}
        self.assertTrue(rows[self.location.pk]['has_racks'])
        self.assertFalse(rows[self.location.pk]['configured'])
        self.assertFalse(rows[empty.pk]['has_racks'])
        self.grant(Location, ['view'])
        self.grant(Rack, ['view'], {'id': self.foreign.pk})
        self.client.force_login(self.reader)
        rows = {row['id']: row for row in self.client.get(url).json()['locations']}
        self.assertFalse(rows[self.location.pk]['has_racks'])
        self.assertTrue(rows[self.other.pk]['has_racks'])

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
