"""Independent inventory QA against Django's isolated test database."""
import json
from django.test import TestCase
from django.urls import reverse
from dcim.models import Device, DeviceType, Location, Rack, RackReservation
from . import tests as fixtures
from . import test_capacity as capacity_fixtures

class InventoryQATest(TestCase):
    setUpTestData = classmethod(fixtures.RoomAPITest.setUpTestData.__func__)
    setUp = capacity_fixtures.CapacityTest.setUp
    grant = fixtures.RoomAPITest.grant

    def free(self, **changes):
        payload = {'height': 1, 'face': 'front', 'full_depth': False, 'planned_devices': []}
        payload.update(changes)
        return self.client.post(self.url + 'free-units/', json.dumps(payload), content_type='application/json')

    def test_free_endpoint_reservation_plans_faces_and_inventory_preservation(self):
        RackReservation.objects.create(rack=self.rack, units=[5], user=self.admin, description='QA reservation')
        before = list(Device.objects.values('pk', 'rack_id', 'position', 'face'))
        plan = {'id': 'qa', 'name': 'QA plan', 'rack_id': self.rack.pk, 'device_type_id': self.full.pk, 'position': 10, 'face': 'rear'}
        result = self.free(planned_devices=[plan])
        self.assertEqual(result.status_code, 200)
        positions = result.json()['candidates'][0]['positions']
        for occupied in (1, 1.5, 4.5, 5, 10, 10.5, 11):
            self.assertNotIn(occupied, positions)
        self.assertIn(1, self.free(face='rear').json()['candidates'][0]['positions'])
        self.assertNotIn(1, self.free(face='rear', full_depth=True).json()['candidates'][0]['positions'])
        self.assertEqual(list(Device.objects.values('pk', 'rack_id', 'position', 'face')), before)

    def test_free_endpoint_restricted_reservations_fail_closed_without_leak(self):
        RackReservation.objects.create(rack=self.rack, units=[5], user=self.admin, description='SECRET-QA-RESERVATION')
        for model in (Location, Rack, Device, DeviceType):
            self.grant(model, ['view'])
        self.client.force_login(self.reader)
        result = self.free()
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.json()['candidates'], [])
        self.assertGreater(result.json()['unknown_racks'], 0)
        self.assertNotContains(result, 'SECRET-QA-RESERVATION')

    def test_discovery_hidden_device_literal_unauthorized_and_method(self):
        self.grant(Device, ['view'], {'id': 2147483647})
        self.client.force_login(self.reader)
        url = reverse('plugins:netbox_room_3d:devices')
        result = self.client.get(url, {'device': self.device.pk})
        self.assertEqual(result.json()['devices'], [])
        self.assertNotContains(result, self.device.name)
        self.assertEqual(self.client.post(url).status_code, 405)
        self.client.logout()
        self.assertEqual(self.client.get(url).status_code, 302)
