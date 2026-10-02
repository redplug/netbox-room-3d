"""Permission-aware planning, stale-reference repair and direct cable inspection."""
import hashlib
import json
import uuid
from copy import deepcopy
from functools import wraps

from django.contrib.auth.decorators import login_required
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.http import require_http_methods
from dcim import models as dcim

from .history import append_history, snapshot
from .models import RoomLayout
from .services import inventory, visible_scene
from .validation import SceneError, integer, validate_scene
from .views import response_data


class Conflict(SceneError):
    pass


def guarded(fn):
    @wraps(fn)
    def wrapped(request, *args, **kwargs):
        try:
            return fn(request, *args, **kwargs)
        except Conflict as exc:
            return JsonResponse({'error': str(exc)}, status=409)
        except (SceneError, ValidationError, json.JSONDecodeError, UnicodeDecodeError) as exc:
            return JsonResponse({'error': str(exc)}, status=400)
    return wrapped


def body(request):
    if len(request.body) > 2_000_000:
        raise SceneError('요청이 너무 큽니다.')
    value = json.loads(request.body)
    if not isinstance(value, dict):
        raise SceneError('JSON 객체가 필요합니다.')
    return value


def room_for(request, pk, write=False):
    location = get_object_or_404(dcim.Location.objects.restrict(request.user, 'view'), pk=pk)
    if write:
        dcim.Location.objects.select_for_update().get(pk=pk)
    existing = RoomLayout.objects.filter(location=location).first()
    if not existing:
        raise SceneError('현재 배치를 먼저 저장하세요.')
    queryset = RoomLayout.objects.restrict(request.user, 'view')
    if write:
        queryset = queryset.select_for_update()
    room = get_object_or_404(queryset, pk=existing.pk)
    if write and not RoomLayout.objects.restrict(request.user, 'change').filter(pk=room.pk).exists():
        raise PermissionDenied
    return location, room


def revision(room, payload):
    if integer(payload.get('revision'), '버전', 0, 2**31-1) != room.revision:
        raise Conflict('다른 사용자가 변경했습니다. 다시 불러오세요.')


def normalized(payload, user, location):
    racks = inventory(user, location, payload.get('include_descendants') is True)
    devices = {d['id']: d for rack in racks.values() for d in rack['devices']}
    valid = validate_scene(payload, racks, set(devices))
    for device_id, appearance in valid['scene']['appearances'].items():
        allowed = {image['id'] for image in devices[int(device_id)]['images']}
        if any(appearance.get(f'{face}_image_id') is not None and appearance[f'{face}_image_id'] not in allowed for face in ('front','rear')):
            raise SceneError('이미지 조회 권한이 없습니다.')
    return valid, racks


def plan_rows(room, user, location):
    result = []
    for item in (room.scene or {}).get('_plans', []):
        try:
            valid, _ = normalized(item['layout'], user, location)
        except SceneError:
            if user.is_superuser:
                result.append({**{k:item[k] for k in ('id','name','saved_at')}, 'valid':False})
            continue
        result.append({**{k:item[k] for k in ('id','name','saved_at')}, 'valid':True,
                       'layout': {**{k:v for k,v in valid.items() if k != 'scene'}, **valid['scene'], 'revision': room.revision}})
    return result


@login_required
@require_http_methods(['GET', 'POST'])
@guarded
def plans(request, pk):
    if request.method == 'GET':
        location, room = room_for(request, pk)
        return JsonResponse({'plans':plan_rows(room, request.user, location), 'revision':room.revision})
    payload = body(request)
    with transaction.atomic():
        location, room = room_for(request, pk, True)
        revision(room, payload)
        if not visible_scene(room, inventory(request.user, location, room.include_descendants))[1]:
            raise PermissionDenied
        stored = deepcopy((room.scene or {}).get('_plans', []))
        action = payload.get('action')
        if action in ('create','rename'):
            name = payload.get('name')
            if not isinstance(name, str) or not name.strip() or len(name) > 100:
                raise SceneError('배치안 이름은 1~100자여야 합니다.')
            name = name.strip()
            if any(p['name'] == name and p['id'] != payload.get('id') for p in stored):
                raise SceneError('같은 이름의 배치안이 있습니다.')
        if action == 'create':
            if len(stored) >= 10:
                raise SceneError('배치안은 최대 10개입니다.')
            draft = payload.get('layout')
            if not isinstance(draft, dict):
                raise SceneError('배치안을 입력하세요.')
            valid, _ = normalized(draft, request.user, location)
            stored.append({'id':str(uuid.uuid4()), 'name':name, 'saved_at':timezone.now().isoformat(),
                           'layout':{**{k:v for k,v in valid.items() if k != 'scene'}, **valid['scene'], 'revision':room.revision}})
        elif action in ('rename','delete'):
            allowed = {p['id'] for p in plan_rows(room, request.user, location)}
            if payload.get('id') not in allowed:
                raise PermissionDenied
            if action == 'delete':
                stored = [p for p in stored if p['id'] != payload['id']]
            else:
                for p in stored:
                    if p['id'] == payload['id']:
                        p['name'] = name
        else:
            raise SceneError('지원하지 않는 배치안 작업입니다.')
        if len(json.dumps(stored).encode()) > 8_000_000:
            raise SceneError('배치안 저장 공간 8MB를 초과합니다.')
        room.snapshot()
        room.scene = {**room.scene, '_plans':stored}
        room.revision += 1
        room.full_clean(); room.save()
        return JsonResponse({'plans':plan_rows(room, request.user, location), 'revision':room.revision})


def cleanup_preview(room, user, location):
    racks = inventory(user, location, room.include_descendants)
    current = snapshot(room, '')['layout']
    devices = {str(d['id']):d for rack in racks.values() for d in rack['devices']}
    removed = [p['rack_id'] for p in current.get('placements', []) if p['rack_id'] not in racks]
    current['placements'] = [p for p in current.get('placements', []) if p['rack_id'] in racks]
    removed_styles, removed_images = [], []
    for key in list(current.get('appearances', {})):
        if key not in devices:
            removed_styles.append(key); del current['appearances'][key]; continue
        allowed = {image['id'] for image in devices[key]['images']}
        for face in ('front','rear'):
            field = f'{face}_image_id'
            if field in current['appearances'][key] and current['appearances'][key][field] not in allowed:
                removed_images.append(f'{key}:{face}'); del current['appearances'][key][field]
    changes = {'rack_ids':removed, 'device_ids':removed_styles, 'images':removed_images}
    token = hashlib.sha256(json.dumps({'revision':room.revision, 'changes':changes}, sort_keys=True).encode()).hexdigest()
    return current, racks, changes, token


@login_required
@require_http_methods(['GET','POST'])
@guarded
def cleanup(request, pk):
    if not request.user.is_superuser:
        raise PermissionDenied
    if request.method == 'GET':
        location, room = room_for(request, pk)
        _, _, changes, token = cleanup_preview(room, request.user, location)
        return JsonResponse({'changes':changes, 'token':token, 'revision':room.revision})
    payload = body(request)
    with transaction.atomic():
        location, room = room_for(request, pk, True)
        revision(room, payload)
        current, racks, changes, token = cleanup_preview(room, request.user, location)
        if payload.get('confirm') is not True or payload.get('token') != token:
            raise Conflict('참조 상태가 변경되었습니다. 미리보기를 다시 확인하세요.')
        if any(changes.values()):
            valid, racks = normalized(current, request.user, location)
            valid['scene']['_history'] = append_history(room, timezone.now().isoformat())
            valid['scene']['_plans'] = deepcopy(room.scene.get('_plans', []))
            room.snapshot()
            for key, value in valid.items():
                setattr(room, key, value)
            room.revision += 1; room.full_clean(); room.save()
        return response_data(request, location, room, racks)


@login_required
@require_http_methods(['GET'])
@guarded
def cables(request, pk):
    location = get_object_or_404(dcim.Location.objects.restrict(request.user, 'view'), pk=pk)
    room = RoomLayout.objects.filter(location=location).first()
    if room and not RoomLayout.objects.restrict(request.user, 'view').filter(pk=room.pk).exists():
        raise PermissionDenied
    device_id = integer(int(request.GET.get('device','0')) if request.GET.get('device','0').isdigit() else 0, '장비', 1, 2**63-1)
    racks = inventory(request.user, location, bool(room and room.include_descendants))
    if device_id not in {d['id'] for r in racks.values() for d in r['devices']}:
        raise PermissionDenied
    cable_ids = dcim.CableTermination.objects.filter(_device_id=device_id).values('cable_id')
    found = list(dcim.Cable.objects.restrict(request.user, 'view').filter(pk__in=cable_ids).prefetch_related('terminations').order_by('pk')[:501])
    supported = {ContentType.objects.get_for_model(model).pk:model for model in
                 (dcim.Interface, dcim.FrontPort, dcim.RearPort, dcim.ConsolePort, dcim.ConsoleServerPort, dcim.PowerPort, dcim.PowerOutlet)}
    terminals = [t for cable in found for t in cable.terminations.all()]
    ports = {}
    for ct, model in supported.items():
        ids = [t.termination_id for t in terminals if t.termination_type_id == ct]
        for port in model.objects.restrict(request.user, 'view').filter(pk__in=ids):
            ports[(ct,port.pk)] = port
    devices = {d.pk:d for d in dcim.Device.objects.restrict(request.user, 'view').filter(pk__in=[p.device_id for p in ports.values()])}
    visible_racks = set(dcim.Rack.objects.restrict(request.user, 'view').filter(pk__in=[d.rack_id for d in devices.values() if d.rack_id]).values_list('pk',flat=True))
    result = []
    for cable in found[:500]:
        ends = []
        for terminal in cable.terminations.all():
            port = ports.get((terminal.termination_type_id,terminal.termination_id))
            device = devices.get(port.device_id) if port else None
            if not device or (device.rack_id and device.rack_id not in visible_racks):
                break
            ends.append({'side':terminal.cable_end, 'device_id':device.pk, 'device':device.name or str(device),
                         'rack_id':device.rack_id, 'port':port.name, 'port_id':port.pk, 'kind':port._meta.model_name})
        else:
            if {e['side'] for e in ends} == {'A','B'} and any(e['device_id'] == device_id for e in ends):
                result.append({'id':cable.pk, 'label':cable.label or f'Cable {cable.pk}', 'url':cable.get_absolute_url(),
                               'status':cable.status, 'color':'#'+(cable.color or '168a87'), 'ends':ends})
    return JsonResponse({'cables':result, 'truncated':len(found)>500})
