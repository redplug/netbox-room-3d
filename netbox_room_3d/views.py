import json

from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_http_methods
from dcim.models import Location

from .models import RoomLayout
from .services import inventory, visible_scene
from .validation import SceneError, integer, validate_scene


@login_required
@ensure_csrf_cookie
def viewer(request, pk=None):
    initial = request.GET.get('location', '')
    if pk:
        room = get_object_or_404(RoomLayout.objects.restrict(request.user, 'view'), pk=pk)
        initial = room.location_id
    return render(request, 'netbox_room_3d/viewer.html', {'initial_location': initial})


@login_required
@require_GET
def locations(request):
    objects = Location.objects.restrict(request.user, 'view').select_related('site').order_by('site__name', 'name')
    rooms = {r.location_id: r for r in RoomLayout.objects.restrict(request.user, 'view')}
    return JsonResponse({'locations': [{
        'id': loc.pk, 'name': loc.name, 'site': loc.site.name,
        'url': reverse('plugins:netbox_room_3d:location_scene', args=[loc.pk]),
        'configured': loc.pk in rooms,
    } for loc in objects]})


def response_data(request, location, room, racks):
    if room:
        scene, complete = visible_scene(room, racks)
        can_edit = complete and RoomLayout.objects.restrict(request.user, 'change').filter(pk=room.pk).exists()
        layout = {k: getattr(room, k) for k in ('name', 'width', 'depth', 'height', 'grid', 'revision', 'include_descendants')}
        layout.update(scene)
    else:
        can_edit = request.user.has_perm('netbox_room_3d.add_roomlayout')
        complete = True
        layout = {'name': location.name, 'width': 12000, 'depth': 8000, 'height': 3000, 'grid': 600,
                  'revision': 0, 'include_descendants': False, 'placements': [], 'blocks': [], 'appearances': {}}
    return JsonResponse({'layout': layout, 'racks': list(racks.values()), 'can_edit': can_edit,
                         'warning': '' if complete else '일부 배치 대상이 이동·삭제되었거나 조회 권한이 없어 읽기 전용으로 표시합니다. 관리자에게 레이아웃 정리를 요청하세요.'})


@login_required
@require_http_methods(['GET', 'PUT'])
def location_scene(request, pk):
    location = get_object_or_404(Location.objects.restrict(request.user, 'view'), pk=pk)
    # A room the user cannot view must not be silently replaced by a blank one.
    existing = RoomLayout.objects.filter(location=location).first()
    if existing and not RoomLayout.objects.restrict(request.user, 'view').filter(pk=existing.pk).exists():
        raise PermissionDenied
    if request.method == 'GET':
        include = request.GET.get('descendants')
        include = include == 'true' if include is not None else bool(existing and existing.include_descendants)
        racks = inventory(request.user, location, include)
        return response_data(request, location, existing, racks)
    if len(request.body) > 2_000_000:
        return JsonResponse({'error': '레이아웃 데이터가 너무 큽니다.'}, status=413)
    try:
        payload = json.loads(request.body)
        if not isinstance(payload, dict):
            raise SceneError('JSON 객체가 필요합니다.')
        revision = integer(payload.get('revision'), '저장 버전', 0, 2**31 - 1)
        with transaction.atomic():
            # Location row serializes first creation too (room may not yet exist).
            Location.objects.select_for_update().get(pk=location.pk)
            room = RoomLayout.objects.select_for_update().filter(location=location).first()
            if room:
                if not RoomLayout.objects.restrict(request.user, 'view').filter(pk=room.pk).exists() or not RoomLayout.objects.restrict(request.user, 'change').filter(pk=room.pk).exists():
                    raise PermissionDenied
            elif not request.user.has_perm('netbox_room_3d.add_roomlayout'):
                raise PermissionDenied
            if revision != (room.revision if room else 0):
                return JsonResponse({'error': '다른 사용자가 먼저 저장했습니다. 변경 내용을 기록한 뒤 다시 불러오세요.'}, status=409)
            racks = inventory(request.user, location, payload.get('include_descendants') is True)
            if room:
                # Check the old scope so explicitly removing descendants is allowed.
                previous_racks = inventory(request.user, location, room.include_descendants)
                if not visible_scene(room, previous_racks)[1]:
                    raise PermissionDenied('조회할 수 없는 기존 배치가 포함되어 있습니다.')
            device_map = {d['id']: d for r in racks.values() for d in r['devices']}
            validated = validate_scene(payload, racks, set(device_map))
            for device_id, appearance in validated['scene']['appearances'].items():
                image_ids = {a['id'] for a in device_map[int(device_id)]['images']}
                for face in ('front', 'rear'):
                    if appearance.get(f'{face}_image_id') is not None and appearance[f'{face}_image_id'] not in image_ids:
                        raise SceneError('장비에 연결되지 않았거나 조회 권한이 없는 이미지입니다.')
            action = 'change' if room else 'add'
            if room:
                room.snapshot()
            else:
                room = RoomLayout(location=location)
            for key, value in validated.items():
                setattr(room, key, value)
            room.revision = revision + 1
            room.full_clean()
            room.save()
            if not RoomLayout.objects.restrict(request.user, action).filter(pk=room.pk).exists():
                raise PermissionDenied
            return response_data(request, location, room, racks)
    except (SceneError, json.JSONDecodeError, UnicodeDecodeError) as exc:
        return JsonResponse({'error': str(exc)}, status=400)
    except ValidationError as exc:
        return JsonResponse({'error': '; '.join(exc.messages)}, status=400)
    except IntegrityError:
        return JsonResponse({'error': '동시에 변경된 데이터가 있습니다. 다시 불러오세요.'}, status=409)
