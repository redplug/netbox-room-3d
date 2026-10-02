"""Permission-complete, half-U capacity calculations. Never writes NetBox inventory."""
import math
from collections import defaultdict

from dcim.models import Device, DeviceType, Location, Rack, RackReservation

from .validation import SceneError, clean_planned_devices


def type_row(obj):
    return {'id': obj.pk, 'model': obj.model, 'u_height': float(obj.u_height), 'full_depth': obj.is_full_depth}


def capacity_inventory(user, location, include=False):
    location_ids = [location.pk]
    if include:
        location_ids = Location.objects.restrict(user, 'view').filter(
            pk__in=location.get_descendants(include_self=True).values('pk')).values_list('pk', flat=True)
    racks = list(Rack.objects.restrict(user, 'view').filter(location_id__in=location_ids).order_by('name', 'pk'))
    ids = [r.pk for r in racks]
    # Unrestricted rows are used only to establish completeness, never to expose hidden data.
    devices = list(Device.objects.filter(rack_id__in=ids).select_related('device_type'))
    visible_devices = set(Device.objects.restrict(user, 'view').filter(rack_id__in=ids).values_list('pk', flat=True))
    visible_types = set(DeviceType.objects.restrict(user, 'view').filter(pk__in=[d.device_type_id for d in devices]).values_list('pk', flat=True))
    reservations = list(RackReservation.objects.filter(rack_id__in=ids))
    visible_reservations = set(RackReservation.objects.restrict(user, 'view').filter(rack_id__in=ids).values_list('pk', flat=True))
    per_rack, bookings = defaultdict(list), defaultdict(list)
    for device in devices:
        per_rack[device.rack_id].append(device)
    for booking in reservations:
        bookings[booking.rack_id].append(booking)
    result = []
    for rack in racks:
        complete = all(d.pk in visible_devices and d.device_type_id in visible_types for d in per_rack[rack.pk])
        complete = complete and all(b.pk in visible_reservations for b in bookings[rack.pk])
        result.append({'id': rack.pk, 'name': rack.name, 'u_height': rack.u_height,
                       'starting_unit': rack.starting_unit, 'desc_units': rack.desc_units, 'complete': complete,
                       'devices': [{'position': float(d.position) if d.position is not None else None,
                                    'u_height': float(d.device_type.u_height), 'full_depth': d.device_type.is_full_depth,
                                    'face': d.face} for d in per_rack[rack.pk]] if complete else [],
                       'reservations': [{'id': b.pk, 'units': list(b.units), 'status': b.status,
                                         'description': b.description, 'url': b.get_absolute_url()}
                                        for b in bookings[rack.pk] if b.pk in visible_reservations]})
    return result


def cells(position, height):
    return set(range(int(position * 2), int(position * 2) + math.ceil(height * 2)))


def state(rack):
    base = set(range(rack['starting_unit'] * 2, (rack['starting_unit'] + rack['u_height']) * 2))
    actual = {'front': set(), 'rear': set()}
    reserved = set()
    complete = rack.get('complete', True)
    for device in rack.get('devices', []):
        if device['position'] is None or device['u_height'] <= 0:
            continue
        footprint = cells(device['position'], device['u_height'])
        if device['position'] * 2 != int(device['position'] * 2) or not footprint <= base:
            complete = False
        for face in ('front', 'rear') if device['full_depth'] else (device['face'],):
            if face in actual:
                actual[face].update(footprint & base)
            else:
                complete = False
    for booking in rack.get('reservations', []):
        for unit in booking['units']:
            footprint = cells(unit, 1)
            if not footprint <= base:
                complete = False
            reserved.update(footprint & base)
    return {'rack': rack, 'base': base, 'actual': actual, 'reserved': reserved,
            'planned': {'front': set(), 'rear': set()}, 'complete': complete}


def longest(free):
    best = run = 0
    previous = None
    for cell in sorted(free):
        run = run + 1 if previous is not None and cell == previous + 1 else 1
        best = max(best, run); previous = cell
    return best / 2


def stats(item, forecast=False):
    actual, reserved, planned, base = item['actual'], item['reserved'], item['planned'], item['base']
    installed = actual['front'] | actual['rear']
    virtual = (planned['front'] | planned['rear']) if forecast else set()
    occupied = installed | reserved | virtual
    result = {'total_u': len(base) / 2, 'used_u': len(installed) / 2,
              'reserved_u': len(reserved - installed) / 2, 'planned_u': len(virtual - installed - reserved) / 2,
              'free_u': len(base - occupied) / 2, 'occupancy_percent': round(len(occupied) / len(base) * 100) if base else 0}
    for face in ('front', 'rear'):
        free = base - actual[face] - reserved - (planned[face] if forecast else set())
        result[face] = {'free_u': len(free) / 2, 'max_contiguous_u': longest(free)}
    return result


def prepare(racks, types, planned):
    items = {rack['id']: state(rack) for rack in racks}
    catalog = {row['id']: row for row in types}
    enriched, issues = [], []
    for row in clean_planned_devices(planned):
        rack, dt = items.get(row['rack_id']), catalog.get(row['device_type_id'])
        entry = {**row, 'valid': False}
        code, error = '', ''
        if not rack or not dt or not rack['complete']:
            code, error = 'visibility', '랙·장비 유형·장비·예약의 조회 범위가 부족하거나 참조가 유효하지 않습니다.'
        elif dt['u_height'] <= 0:
            code, error = 'height', '0U 장비는 U 공간 증설 계획을 지원하지 않습니다.'
        else:
            footprint = cells(row['position'], dt['u_height'])
            faces = ('front', 'rear') if dt['full_depth'] else (row['face'],)
            if not footprint <= rack['base']:
                code, error = 'bounds', '가상 장비가 랙 U 범위를 벗어납니다.'
            elif any(footprint & (rack['actual'][face] | rack['reserved'] | rack['planned'][face]) for face in faces):
                code, error = 'collision', '가상 장비가 실제 장비·예약·다른 가상 장비와 겹칩니다.'
            else:
                for face in faces:
                    rack['planned'][face].update(footprint)
                entry['valid'] = True
        if dt:
            entry.update({key: dt[key] for key in ('model', 'u_height', 'full_depth')})
        if error:
            entry['error'] = error
            issues.append({'id': row['id'], 'code': code, 'message': f"{row['name']}: {error}"})
        enriched.append(entry)
    return items, enriched, issues


def analyze(racks, types, planned):
    items, enriched, issues = prepare(racks, types, planned)
    rows = []
    totals = {key: {'total_u': 0, 'used_u': 0, 'reserved_u': 0, 'planned_u': 0, 'free_u': 0} for key in ('before', 'after')}
    for item in items.values():
        rack = item['rack']
        row = {key: rack[key] for key in ('id', 'name', 'u_height', 'starting_unit', 'desc_units', 'reservations')}
        row.update({'complete': item['complete'], 'before': None, 'after': None})
        if item['complete']:
            for key, forecast in (('before', False), ('after', True)):
                row[key] = stats(item, forecast)
                for metric in totals[key]:
                    totals[key][metric] += row[key][metric]
        rows.append(row)
    for total in totals.values():
        total['occupancy_percent'] = round((total['total_u'] - total['free_u']) / total['total_u'] * 100) if total['total_u'] else 0
    return {'racks': rows, 'planned_devices': enriched, 'issues': issues, 'totals': totals,
            'complete_racks': sum(r['complete'] for r in rows), 'unknown_racks': sum(not r['complete'] for r in rows)}


def recommend(racks, types, planned, type_id, face):
    catalog = {row['id']: row for row in types}
    dt = catalog.get(type_id)
    if not dt or face not in ('front', 'rear'):
        raise SceneError('조회 가능한 장비 유형과 전·후면을 선택하세요.')
    if dt['u_height'] <= 0:
        raise SceneError('0U 장비는 U 공간 추천을 지원하지 않습니다.')
    items, _, issues = prepare(racks, types, planned)
    if issues:
        raise SceneError('가상 증설 계획을 먼저 수정하세요. ' + issues[0]['message'])
    candidates = []
    for item in items.values():
        if not item['complete']:
            continue
        free = set(item['base'])
        for side in ('front', 'rear') if dt['full_depth'] else (face,):
            free -= item['actual'][side] | item['reserved'] | item['planned'][side]
        positions = [cell / 2 for cell in sorted(free) if cells(cell / 2, dt['u_height']) <= free]
        if positions:
            candidates.append({'rack_id': item['rack']['id'], 'rack': item['rack']['name'], 'positions': positions,
                               'free_u': len(free) / 2, 'max_contiguous_u': longest(free)})
    candidates.sort(key=lambda c: (-c['free_u'], -c['max_contiguous_u'], c['rack'], c['rack_id']))
    return {'candidates': candidates, 'device_type': dt, 'unknown_racks': sum(not i['complete'] for i in items.values())}


def planned_types(user, planned, extra=()):
    ids = {row['device_type_id'] for row in clean_planned_devices(planned)} | set(extra)
    return [type_row(dt) for dt in DeviceType.objects.restrict(user, 'view').filter(pk__in=ids)]


def validate_planned(user, location, include, planned, strict=True):
    clean = clean_planned_devices(planned)
    if not clean:
        return clean
    result = analyze(capacity_inventory(user, location, include), planned_types(user, clean), clean)
    errors = [i['message'] for i in result['issues'] if strict or i['code'] == 'visibility']
    if errors:
        raise SceneError(' / '.join(errors[:3]))
    return clean
