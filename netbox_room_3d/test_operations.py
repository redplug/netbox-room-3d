import copy
import json

from django.test import Client, TestCase
from dcim.models import Cable, Device, DeviceType, Interface, Location, Rack

from .models import RoomLayout
from . import tests as fixtures


class OperationsTest(TestCase):
    setUpTestData = classmethod(fixtures.RoomAPITest.setUpTestData.__func__)
    setUp = fixtures.RoomAPITest.setUp
    grant = fixtures.RoomAPITest.grant

    def save_room(self):
        response = self.client.put(self.url, json.dumps(self.payload), content_type='application/json')
        self.assertEqual(response.status_code, 200, response.content)
        return response.json()['layout']

    def post(self, resource, payload):
        return self.client.post(self.url + resource + '/', json.dumps(payload), content_type='application/json')

    def test_clearance_zone_atomicity(self):
        payload = self.save_room()
        payload['zones'] = [{'id': 'floor', 'name': 'Zone', 'color': '#168a87', 'x': 1200, 'z': 1800, 'width': 1000, 'depth': 1000}]
        payload['clearance'] = {'enabled': True, 'front': 400, 'rear': 400}
        response = self.client.put(self.url, json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200, response.content)
        saved = response.json()['layout']; saved['clearance']['front'] = 10000
        self.assertEqual(self.client.put(self.url, json.dumps(saved), content_type='application/json').status_code, 400)
        self.assertEqual(self.client.get(self.url).json()['layout']['clearance']['front'], 400)

    def test_plans_revision_preservation_and_privacy(self):
        layout = self.save_room()
        result = self.post('plans', {'action': 'create', 'revision': 1, 'name': 'Plan A', 'layout': layout})
        self.assertEqual(result.status_code, 200, result.content)
        plan_id = result.json()['plans'][0]['id']
        self.assertEqual(self.post('plans', {'action': 'delete', 'id': plan_id, 'revision': 1}).status_code, 409)
        current = self.client.get(self.url).json()['layout']; self.assertNotIn('_plans', current)
        current['name'] = 'Changed'
        self.assertEqual(self.client.put(self.url, json.dumps(current), content_type='application/json').status_code, 200)
        self.assertEqual(len(self.client.get(self.url + 'plans/').json()['plans']), 1)
        renamed = self.post('plans', {'action': 'rename', 'id': plan_id, 'name': 'Plan B', 'revision': 3})
        self.assertEqual(renamed.json()['plans'][0]['name'], 'Plan B')
        self.assertEqual(self.post('plans', {'action': 'delete', 'id': plan_id, 'revision': 4}).json()['plans'], [])

    def test_cleanup_preserves_inventory(self):
        self.save_room(); self.rack.location = self.other; self.rack.save()
        preview = self.client.get(self.url + 'cleanup/').json()
        self.assertEqual(preview['changes']['rack_ids'], [self.rack.pk])
        self.assertEqual(self.post('cleanup', {'revision': preview['revision'], 'token': 'wrong', 'confirm': True}).status_code, 409)
        result = self.post('cleanup', {**preview, 'confirm': True})
        self.assertEqual(result.status_code, 200, result.content)
        self.assertEqual(result.json()['layout']['placements'], [])
        self.assertTrue(Rack.objects.filter(pk=self.rack.pk).exists())
        self.assertTrue(Device.objects.filter(pk=self.device.pk).exists())

    def test_permissions_and_csrf(self):
        layout = self.save_room()
        for model in (Location, RoomLayout, Rack, Device, DeviceType):
            self.grant(model, ['view'])
        self.client.force_login(self.reader)
        self.assertEqual(self.client.get(self.url + 'plans/').status_code, 200)
        self.assertEqual(self.post('plans', {'action': 'create', 'revision': 1, 'name': 'Denied', 'layout': layout}).status_code, 403)
        self.assertEqual(self.client.get(self.url + 'cleanup/').status_code, 403)
        strict = Client(enforce_csrf_checks=True); strict.force_login(self.admin)
        self.assertEqual(strict.post(self.url + 'plans/', '{}', content_type='application/json').status_code, 403)

    def test_direct_cable_hidden_peer(self):
        self.save_room()
        peer = Device.objects.create(name='Peer', site=self.site, rack=self.rack, position=3, face='front', device_type=self.device_type, role=self.device.role)
        a = Interface.objects.create(device=self.device, name='eth0', type='1000base-t')
        b = Interface.objects.create(device=peer, name='eth0', type='1000base-t')
        cable = Cable(a_terminations=[a], b_terminations=[b], status='connected', label='QA Cable'); cable.full_clean(); cable.save()
        endpoint = self.url + f'cables/?device={self.device.pk}'
        self.assertEqual(len(self.client.get(endpoint).json()['cables']), 1)
        for model in (Location, RoomLayout, Rack, Cable, Interface):
            self.grant(model, ['view'])
        self.grant(Device, ['view'], {'id': self.device.pk}); self.client.force_login(self.reader)
        self.assertEqual(self.client.get(endpoint).json()['cables'], [])

    def test_hidden_plan_not_disclosed(self):
        layout = self.save_room()
        self.assertEqual(self.post('plans', {'action': 'create', 'revision': 1, 'name': 'Hidden', 'layout': layout}).status_code, 200)
        self.grant(Location, ['view']); self.grant(RoomLayout, ['view']); self.client.force_login(self.reader)
        self.assertEqual(self.client.get(self.url + 'plans/').json()['plans'], [])
