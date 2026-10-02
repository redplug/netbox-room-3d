import copy
import json

from django.test import TestCase
from dcim.models import Device, DeviceType, Location, Rack, RackReservation

from . import tests as fixtures
from .models import RoomLayout


class CapacityTest(TestCase):
    setUpTestData = classmethod(fixtures.RoomAPITest.setUpTestData.__func__)
    grant = fixtures.RoomAPITest.grant

    def setUp(self):
        fixtures.RoomAPITest.setUp(self)
        self.device_type.is_full_depth = False; self.device_type.save()
        self.half = DeviceType.objects.create(manufacturer=self.device_type.manufacturer, model='Half U', slug='half-u', u_height=.5, is_full_depth=False)
        self.full = DeviceType.objects.create(manufacturer=self.device_type.manufacturer, model='Full depth', slug='full-depth', u_height=2, is_full_depth=True)

    def virtual(self, position=10, face='front', dt=None, rack=None, identifier='planned1'):
        return {'id': identifier, 'name': 'Expansion', 'rack_id': (rack or self.rack).pk,
                'device_type_id': (dt or self.half).pk, 'position': position, 'face': face}

    def preview(self, planned=None, include=False):
        return self.client.post(self.url + 'capacity/', json.dumps({'include_descendants': include, 'planned_devices': planned or []}), content_type='application/json')

    def save(self, planned=None):
        payload = copy.deepcopy(self.payload)
        payload['revision'] = RoomLayout.objects.filter(location=self.location).values_list('revision', flat=True).first() or 0
        if planned is not None:
            payload['planned_devices'] = planned
        return self.client.put(self.url, json.dumps(payload), content_type='application/json')

    def test_reservation_stats_and_all_statuses(self):
        for unit, status in ((5, 'pending'), (6, 'active'), (7, 'stale')):
            RackReservation.objects.create(rack=self.rack, units=[unit], status=status, user=self.admin, description=status)
        data = self.preview().json(); rack = data['racks'][0]
        self.assertTrue(rack['complete']); self.assertEqual(rack['before']['used_u'], 2)
        self.assertEqual(rack['before']['reserved_u'], 3); self.assertEqual(rack['before']['front']['free_u'], 37)
        self.assertEqual(rack['before']['rear']['free_u'], 39)
        self.assertEqual(len(rack['reservations']), 3)

    def test_half_u_faces_full_depth_and_duplicate_virtuals(self):
        data = self.preview([self.virtual(position=1, face='rear')]).json()
        self.assertEqual(data['issues'], []); self.assertEqual(data['racks'][0]['after']['used_u'], 2)
        self.assertEqual(data['racks'][0]['after']['rear']['free_u'], 41.5)
        self.assertEqual(self.preview([self.virtual(position=1, face='rear', dt=self.full)]).json()['issues'][0]['code'], 'collision')
        self.assertEqual(self.preview([self.virtual(), self.virtual(identifier='planned2')]).json()['issues'][0]['code'], 'collision')
        self.assertEqual(self.preview([self.virtual(position=10.1)]).status_code, 400)
        self.assertEqual(self.preview([self.virtual(), self.virtual()]).status_code, 400)

    def test_descending_nondefault_start_matches_netbox_grid(self):
        self.rack.starting_unit = 10; self.rack.u_height = 6; self.rack.desc_units = True; self.rack.save()
        self.device.position = 10; self.device.save()
        RackReservation.objects.create(rack=self.rack, units=[13], user=self.admin)
        response = self.client.post(self.url + 'recommendations/', json.dumps({'device_type_id': self.half.pk, 'face': 'front', 'planned_devices': []}), content_type='application/json')
        self.assertEqual(response.status_code, 200, response.content)
        positions = response.json()['candidates'][0]['positions']
        expected = {float(u) for u in self.rack.get_available_units(.5, rack_face='front')} - {13, 13.5}
        self.assertEqual(set(positions), expected)
        self.assertEqual(self.preview([self.virtual(position=12.5)]).json()['issues'], [])

    def test_missing_reservation_or_device_permissions_blocks_capacity(self):
        RackReservation.objects.create(rack=self.rack, units=[10], user=self.admin, description='Hidden reservation')
        for model in (Location, Rack, Device, DeviceType):
            self.grant(model, ['view'])
        self.client.force_login(self.reader)
        data = self.preview().json(); self.assertFalse(data['racks'][0]['complete'])
        self.assertIsNone(data['racks'][0]['before']); self.assertEqual(data['racks'][0]['reservations'], [])
        response = self.client.post(self.url + 'recommendations/', json.dumps({'device_type_id': self.half.pk, 'face': 'front', 'planned_devices': []}), content_type='application/json')
        self.assertEqual(response.json()['candidates'], [])
        self.assertNotIn('Hidden reservation', response.content.decode())

    def test_save_plan_history_and_old_payload_preserve_virtuals(self):
        row = self.virtual(); response = self.save([row]); self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()['layout']['planned_devices'][0]['position'], 10)
        self.assertEqual(self.save().status_code, 200)
        self.assertEqual(self.client.get(self.url).json()['layout']['planned_devices'], [row])
        history = self.client.get(self.url + 'history/').json()['history']
        self.assertEqual(history[0]['layout']['planned_devices'], [row])
        layout = self.client.get(self.url).json()['layout']
        result = self.client.post(self.url + 'plans/', json.dumps({'action': 'create', 'name': 'Expansion', 'revision': layout['revision'], 'layout': layout}), content_type='application/json')
        self.assertEqual(result.status_code, 200, result.content)
        self.assertEqual(result.json()['plans'][0]['layout']['planned_devices'], [row])

    def test_reservation_changed_after_plan_rejects_save_without_overwrite(self):
        self.assertEqual(self.save([self.virtual()]).status_code, 200)
        RackReservation.objects.create(rack=self.rack, units=[10], user=self.admin)
        self.assertEqual(self.preview([self.virtual()]).json()['issues'][0]['code'], 'collision')
        self.assertEqual(self.save([self.virtual()]).status_code, 400)
        self.assertEqual(RoomLayout.objects.get(location=self.location).revision, 1)
        self.assertEqual(self.save([]).status_code, 200)

    def test_deleted_type_cleanup_and_hidden_plan_type(self):
        self.assertEqual(self.save([self.virtual()]).status_code, 200)
        self.half.delete()
        loaded = self.client.get(self.url).json(); self.assertFalse(loaded['can_edit']); self.assertEqual(loaded['layout']['planned_devices'], [])
        preview = self.client.get(self.url + 'cleanup/').json(); self.assertEqual(preview['changes']['planned_ids'], ['planned1'])
        cleaned = self.client.post(self.url + 'cleanup/', json.dumps({**preview, 'confirm': True}), content_type='application/json')
        self.assertEqual(cleaned.status_code, 200, cleaned.content); self.assertEqual(cleaned.json()['layout']['planned_devices'], [])

    def test_zero_u_and_unknown_scope_rejected(self):
        self.half.u_height = 0; self.half.save()
        self.assertEqual(self.save([self.virtual()]).status_code, 400)
        self.assertEqual(self.preview([self.virtual(rack=self.foreign)]).json()['issues'][0]['code'], 'visibility')
        self.assertEqual(self.preview([self.virtual(rack=self.child_rack)], include=True).json()['issues'][0]['code'], 'height')

    def test_hidden_actual_device_is_not_treated_as_empty_space(self):
        Device.objects.create(name='Hidden peer', site=self.site, rack=self.rack, position=4, face='front', device_type=self.device_type, role=self.device.role)
        for model in (Location, Rack, DeviceType):
            self.grant(model, ['view'])
        self.grant(Device, ['view'], {'id': self.device.pk}); self.client.force_login(self.reader)
        result = self.preview().json(); self.assertFalse(result['racks'][0]['complete']); self.assertIsNone(result['racks'][0]['after'])

    def test_hidden_virtual_type_is_filtered_in_view_capacity_and_serializer(self):
        self.assertEqual(self.save([self.virtual()]).status_code, 200)
        for model in (Location, Rack, Device, RoomLayout):
            self.grant(model, ['view'])
        self.grant(DeviceType, ['view'], {'id': self.device_type.pk})
        self.client.force_login(self.reader)
        response = self.client.get(self.url)
        self.assertEqual(response.json()['layout']['planned_devices'], [])
        self.assertFalse(response.json()['can_edit'])
        result = self.client.get(self.url + 'capacity/').json()
        self.assertEqual(result['planned_devices'], []); self.assertFalse(result['racks'][0]['complete'])
        from .api.serializers import RoomLayoutSerializer
        scene = RoomLayoutSerializer(RoomLayout.objects.get(location=self.location), context={'request': response.wsgi_request}).data['scene']
        self.assertEqual(scene['planned_devices'], [])

    def test_recommendations_do_not_modify_inventory_and_query_count_is_bounded(self):
        before = (Device.objects.count(), RackReservation.objects.count())
        payload = {'device_type_id': self.half.pk, 'face': 'front', 'planned_devices': []}
        response = self.client.post(self.url + 'recommendations/', json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200, response.content); self.assertTrue(response.json()['candidates'])
        self.assertEqual((Device.objects.count(), RackReservation.objects.count()), before)
        from django.db import connection
        from django.test.utils import CaptureQueriesContext
        with CaptureQueriesContext(connection) as first:
            self.preview()
        for i in range(10):
            Rack.objects.create(name=f'Extra {i}', site=self.site, location=self.location)
        with CaptureQueriesContext(connection) as second:
            self.preview()
        self.assertLessEqual(len(second), len(first) + 2)
