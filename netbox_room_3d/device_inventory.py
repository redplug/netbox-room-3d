"""Read-only device discovery. Related metadata is independently permission filtered."""
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from dcim.models import Device, DeviceType, Interface, Location, Rack
from ipam.models import IPAddress


@login_required
@require_GET
def devices(request):
    locations = {obj.pk: obj for obj in Location.objects.restrict(request.user, 'view')}
    racks = {obj.pk: obj for obj in Rack.objects.restrict(request.user, 'view')}
    types = {obj.pk: obj.model for obj in DeviceType.objects.restrict(request.user, 'view')}
    queryset = Device.objects.restrict(request.user, 'view').order_by('pk')
    target = request.GET.get('device')
    if target is not None:
        if not target.isdecimal() or len(target) > 18:
            return JsonResponse({'devices': []})
        queryset = queryset.filter(pk=int(target))
    objects = list(queryset)
    device_ids = [obj.pk for obj in objects]
    interfaces = dict(Interface.objects.restrict(request.user, 'view').filter(
        device_id__in=device_ids).values_list('pk', 'device_id'))
    ips = {}
    for ip in IPAddress.objects.restrict(request.user, 'view').filter(
            assigned_object_type__app_label='dcim', assigned_object_type__model='interface',
            assigned_object_id__in=interfaces):
        ips.setdefault(interfaces[ip.assigned_object_id], []).append(str(ip.address))
    primary_ids = {pk for obj in objects for pk in (obj.primary_ip4_id, obj.primary_ip6_id) if pk}
    primary = dict(IPAddress.objects.restrict(request.user, 'view').filter(
        pk__in=primary_ids).values_list('pk', 'address'))
    rows = []
    for obj in objects:
        rack = racks.get(obj.rack_id)
        # Do not resolve hidden Rack metadata even when Device itself is visible.
        location_id = rack.location_id if rack else obj.location_id if not obj.rack_id else None
        location = locations.get(location_id)
        asset = (obj.custom_field_data or {}).get('Asset_Number')
        rows.append({
            'id': obj.pk, 'name': obj.name or str(obj.pk), 'url': obj.get_absolute_url(),
            'asset_number': '' if asset is None else str(asset), 'serial': obj.serial or '',
            'model': types.get(obj.device_type_id, ''), 'status': obj.status,
            'status_label': str(obj.get_status_display()),
            'primary_ips': [str(primary[pk]) for pk in (obj.primary_ip4_id, obj.primary_ip6_id) if pk in primary],
            'ip_addresses': sorted(ips.get(obj.pk, [])),
            'rack_id': rack.pk if rack else None, 'rack': rack.name if rack else '',
            'location_id': location.pk if location else None, 'location': location.name if location else '',
            'position': float(obj.position) if rack and obj.position is not None else None,
            'face': obj.face if rack else '', 'rack_unassigned': obj.rack_id is None,
            'location_unassigned': not obj.rack_id and obj.location_id is None or bool(rack and rack.location_id is None),
            'context_unavailable': bool(obj.rack_id and not rack or location_id and not location),
        })
    response = JsonResponse({'devices': rows, 'scope': 'permission-filtered'})
    response['Cache-Control'] = 'private, no-store'
    return response
