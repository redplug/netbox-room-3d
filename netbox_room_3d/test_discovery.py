import json

from django.test import TestCase
from django.urls import reverse
from dcim.models import Device, DeviceType, Location, Rack

from .capacity import find_free_units
from .tests import RoomAPITest
from .validation import SceneError


class DiscoveryTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        RoomAPITest.setUpTestData.__func__(cls)

    setUp = RoomAPITest.setUp
    grant = RoomAPITest.grant

    def endpoint(self):
        return reverse('plugins:netbox_room_3d:devices')

    def test_identifiers_use_only_exact_custom_field_and_zero_is_present(self):
        self.device.custom_field_data = {'Asset_Number': 0, 'asset_number': 'WRONG'}
        self.device.asset_tag = 'NATIVE-NOT-USED'
        self.device.serial = 'SN-1'
        self.device.save()
        response = self.client.get(self.endpoint())
        row = response.json()['devices'][0]
        self.assertEqual(row['asset_number'], '0')
        self.assertEqual(row['serial'], 'SN-1')
        self.assertNotIn('NATIVE-NOT-USED', response.content.decode())
        self.assertEqual(row['rack_id'], self.rack.pk)
        self.assertEqual(row['location_id'], self.location.pk)
        self.assertEqual(response['Cache-Control'], 'private, no-store')

    def test_hidden_device_and_related_metadata_are_not_disclosed(self):
        self.grant(Device, ['view'])
        self.client.force_login(self.reader)
        response = self.client.get(self.endpoint())
        row = response.json()['devices'][0]
        self.assertIsNone(row['rack_id'])
        self.assertIsNone(row['location_id'])
        self.assertEqual(row['model'], '')
        self.assertTrue(row['context_unavailable'])
        self.assertEqual(row['primary_ips'], [])
        self.assertEqual(row['ip_addresses'], [])
        self.assertNotContains(response, self.rack.name)
        self.assertNotContains(response, self.device_type.model)

    def test_target_lookup_is_permission_filtered_and_read_only(self):
        self.grant(Location, ['view'])
        self.grant(Rack, ['view'])
        self.grant(DeviceType, ['view'])
        self.grant(Device, ['view'], {'id': 2147483647})
        self.client.force_login(self.reader)
        self.assertEqual(self.client.get(self.endpoint(), {'device': self.device.pk}).json()['devices'], [])
        self.assertEqual(self.client.post(self.endpoint(), '{}', content_type='application/json').status_code, 405)
        self.device.refresh_from_db()
        self.assertEqual(self.device.name, 'server')

    def test_free_u_endpoint_accepts_integer_height_and_rejects_fractional(self):
        url = reverse('plugins:netbox_room_3d:free_units', args=[self.location.pk])
        payload = {'height': 2, 'face': 'front', 'full_depth': True, 'planned_devices': [], 'include_descendants': False}
        response = self.client.post(url, json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200, response.content)
        self.assertTrue(response.json()['candidates'])
        payload['height'] = 1.5
        self.assertEqual(self.client.post(url, json.dumps(payload), content_type='application/json').status_code, 400)

    def test_free_u_unknown_rack_is_not_assumed_free(self):
        rack = {'id': 1, 'name': 'R', 'u_height': 4, 'starting_unit': 1, 'desc_units': False,
                'complete': False, 'devices': [], 'reservations': []}
        result = find_free_units([rack], [], [], 1, 'front')
        self.assertEqual(result['candidates'], [])
        self.assertEqual(result['unknown_racks'], 1)
        self.assertEqual(len(result['excluded']), 1)
        for height in (0, -1, 1.5, True, '1'):
            with self.assertRaises(SceneError):
                find_free_units([rack], [], [], height, 'front')
