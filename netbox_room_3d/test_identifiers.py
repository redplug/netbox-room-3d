from django.test import TestCase
from django.contrib.contenttypes.models import ContentType
from dcim.models import Device, DeviceType, Location, Rack
from extras.models import CustomField

from .tests import RoomAPITest


class DeviceIdentifiersTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        RoomAPITest.setUpTestData.__func__(cls)
        cls.asset_field = CustomField.objects.create(name='Asset_Number', label='자산번호', type='text')
        cls.asset_field.object_types.add(ContentType.objects.get_for_model(Device), ContentType.objects.get_for_model(Rack))

    setUp = RoomAPITest.setUp
    grant = RoomAPITest.grant

    def row(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200, response.content)
        return next(device for rack in response.json()['racks'] for device in rack['devices'] if device['id'] == self.device.pk)

    def test_identifiers_are_returned_without_inventory_changes(self):
        self.device.asset_tag = 'NATIVE-TAG-NOT-ASSET-NUMBER'
        self.device.custom_field_data = {'Asset_Number': 'ROOM3D-ASSET-001'}
        self.device.serial = 'ROOM3D-SERIAL-001'
        self.device.save()
        row = self.row()
        self.assertEqual(row['asset_number'], 'ROOM3D-ASSET-001')
        self.assertEqual(row['asset_tag'], 'NATIVE-TAG-NOT-ASSET-NUMBER')
        self.assertEqual(row['serial'], 'ROOM3D-SERIAL-001')
        self.device.refresh_from_db()
        self.assertEqual(self.device.custom_field_data, {'Asset_Number': 'ROOM3D-ASSET-001'})
        self.assertEqual(self.device.asset_tag, 'NATIVE-TAG-NOT-ASSET-NUMBER')
        self.assertEqual(self.device.serial, 'ROOM3D-SERIAL-001')

    def test_missing_identifiers_are_empty_strings(self):
        self.device.asset_tag = 'DO-NOT-SUBSTITUTE'
        self.device.serial = ''
        for value in (None, ''):
            with self.subTest(value=value):
                self.device.custom_field_data = {'Asset_Number': value}
                self.device.save()
                row = self.row()
                self.assertEqual(row['asset_number'], '')
                self.assertEqual(row['serial'], '')

    def test_missing_or_wrong_case_custom_field_does_not_use_asset_tag(self):
        self.device.asset_tag = 'DO-NOT-SUBSTITUTE'
        for fields in ({}, {'asset_number': 'WRONG-CASE'}):
            with self.subTest(fields=fields):
                self.device.custom_field_data = fields
                self.device.save()
                self.assertEqual(self.row()['asset_number'], '')

    def test_zero_custom_asset_number_is_not_treated_as_empty(self):
        self.device.custom_field_data = {'Asset_Number': 0}
        self.device.save()
        self.assertEqual(self.row()['asset_number'], '0')

    def test_hidden_devices_do_not_disclose_identifiers(self):
        self.device.asset_tag = 'HIDDEN-ASSET'
        self.device.custom_field_data = {'Asset_Number': 'HIDDEN-CUSTOM-ASSET'}
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
        self.assertNotContains(response, 'HIDDEN-CUSTOM-ASSET')
        self.assertNotContains(response, 'HIDDEN-SERIAL')
