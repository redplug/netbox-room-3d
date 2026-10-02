from django.test import TestCase
from dcim.models import Device, DeviceType, Location, Rack

from .tests import RoomAPITest


class DeviceIdentifiersTest(TestCase):
    setUpTestData = classmethod(RoomAPITest.setUpTestData.__func__)
    setUp = RoomAPITest.setUp
    grant = RoomAPITest.grant

    def row(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200, response.content)
        return next(device for rack in response.json()['racks'] for device in rack['devices'] if device['id'] == self.device.pk)

    def test_identifiers_are_returned_without_inventory_changes(self):
        self.device.asset_tag = 'ROOM3D-ASSET-001'
        self.device.serial = 'ROOM3D-SERIAL-001'
        self.device.save()
        row = self.row()
        self.assertEqual(row['asset_tag'], 'ROOM3D-ASSET-001')
        self.assertEqual(row['serial'], 'ROOM3D-SERIAL-001')
        self.device.refresh_from_db()
        self.assertEqual(self.device.asset_tag, 'ROOM3D-ASSET-001')
        self.assertEqual(self.device.serial, 'ROOM3D-SERIAL-001')

    def test_missing_identifiers_are_empty_strings(self):
        self.device.asset_tag = None
        self.device.serial = ''
        self.device.save()
        row = self.row()
        self.assertEqual(row['asset_tag'], '')
        self.assertEqual(row['serial'], '')

    def test_hidden_devices_do_not_disclose_identifiers(self):
        self.device.asset_tag = 'HIDDEN-ASSET'
        self.device.serial = 'HIDDEN-SERIAL'
        self.device.save()
        for model in (Location, Rack, DeviceType):
            self.grant(model, ['view'])
        self.grant(Device, ['view'], {'id': 2147483647})
        self.client.force_login(self.reader)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200, response.content)
        self.assertTrue(response.json()['racks'])
        self.assertTrue(all(not rack['devices'] for rack in response.json()['racks']))
        self.assertNotContains(response, 'HIDDEN-ASSET')
        self.assertNotContains(response, 'HIDDEN-SERIAL')
