from collections import defaultdict
from copy import deepcopy

from dcim.models import Device, DeviceType, Interface, Location, Rack
from ipam.models import IPAddress
from extras.models import ImageAttachment


def image_url(image):
    return image.url if image else None


def rack_data(rack):
    source = rack.rack_type or rack
    unit = getattr(source, 'outer_unit', None)
    multiplier = 25.4 if unit == 'in' else 1
    dimensions, estimated = {}, []
    for key, fallback in (('width', 600), ('depth', 1000), ('height', rack.u_height * 44.45 + 150)):
        raw = getattr(source, f'outer_{key}', None)
        dimensions[key] = round(raw * multiplier, 2) if raw and unit in ('mm', 'in') else fallback
        if not raw or unit not in ('mm', 'in'):
            estimated.append(key)
    return {
        'id': rack.pk, 'name': rack.name, 'url': rack.get_absolute_url(),
        'u_height': rack.u_height, 'starting_unit': rack.starting_unit,
        'desc_units': rack.desc_units, 'rail_width': rack.width * 25.4,
        'estimated': estimated, **dimensions, 'devices': [],
    }


def inventory(user, location, include_descendants=False):
    location_ids = [location.pk]
    if include_descendants:
        location_ids = list(Location.objects.restrict(user, 'view').filter(
            pk__in=location.get_descendants(include_self=True).values('pk')).values_list('pk', flat=True))
    rack_qs = Rack.objects.restrict(user, 'view').filter(location_id__in=location_ids).select_related('rack_type')
    racks = {rack.pk: rack_data(rack) for rack in rack_qs}
    devices = list(Device.objects.restrict(user, 'view').filter(rack_id__in=racks).select_related('device_type', 'role'))
    type_ids = set(DeviceType.objects.restrict(user, 'view').filter(pk__in=[d.device_type_id for d in devices]).values_list('pk', flat=True))
    interfaces = defaultdict(list)
    for interface in Interface.objects.restrict(user, 'view').filter(device_id__in=[d.pk for d in devices]).order_by('name'):
        interfaces[interface.device_id].append({'id': interface.pk, 'name': interface.name})
    primary_ids = {pk for d in devices for pk in (d.primary_ip4_id, d.primary_ip6_id) if pk}
    primary_ips = dict(IPAddress.objects.restrict(user, 'view').filter(pk__in=primary_ids).values_list('pk', 'address'))
    primary_ports = dict(IPAddress.objects.restrict(user, 'view').filter(
        pk__in=primary_ids, assigned_object_type__app_label='dcim', assigned_object_type__model='interface'
    ).values_list('pk', 'assigned_object_id'))
    attachments = defaultdict(list)
    for a in ImageAttachment.objects.restrict(user, 'view').filter(
        object_type__app_label='dcim', object_type__model='device', object_id__in=[d.pk for d in devices]
    ):
        attachments[a.object_id].append({'id': a.pk, 'name': a.name or f'Image {a.pk}', 'url': image_url(a.image)})
    for device in devices:
        assigned_primary_ports = {primary_ports.get(pk) for pk in (device.primary_ip4_id, device.primary_ip6_id)} - {None}
        for interface in interfaces[device.pk]:
            interface['is_primary'] = interface['id'] in assigned_primary_ports
            interface['primary_ips'] = [str(primary_ips[pk]) for pk in (device.primary_ip4_id, device.primary_ip6_id)
                                        if pk in primary_ips and primary_ports.get(pk) == interface['id']]
        dt = device.device_type
        # DeviceType visibility controls access to its image/model metadata.
        type_visible = dt.pk in type_ids
        racks[device.rack_id]['devices'].append({
            'id': device.pk, 'name': device.name or str(device), 'url': device.get_absolute_url(),
            'model': dt.model if type_visible else '제한된 장비 유형',
            'position': float(device.position) if device.position is not None else None,
            'face': device.face, 'u_height': float(dt.u_height), 'full_depth': dt.is_full_depth,
            'status': device.status, 'color': '#' + device.role.color,
            'front_image': image_url(dt.front_image) if type_visible else None,
            'rear_image': image_url(dt.rear_image) if type_visible else None,
            'images': attachments[device.pk],
            'interfaces': interfaces[device.pk],
            'primary_ips': [str(primary_ips[pk]) for pk in (device.primary_ip4_id, device.primary_ip6_id) if pk in primary_ips],
        })
    return racks


def visible_scene(room, racks):
    """Never send hidden inventory IDs or settings to the client."""
    scene = deepcopy(room.scene or {})
    device_ids = {str(d['id']) for r in racks.values() for d in r['devices']}
    placements = scene.get('placements', [])
    appearances = scene.get('appearances', {})
    scene['placements'] = [p for p in placements if p['rack_id'] in racks]
    scene['appearances'] = {k: v for k, v in appearances.items() if k in device_ids}
    scene.setdefault('blocks', [])
    complete = len(placements) == len(scene['placements']) and len(appearances) == len(scene['appearances'])
    return scene, complete
