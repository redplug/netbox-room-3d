"""Pure validation; mm coordinates refer to object centres on the X/Z floor plane."""
import math
import re


class SceneError(ValueError):
    pass


def number(value, label, minimum=0, maximum=100000):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
        raise SceneError(f'{label}: 유효한 숫자가 필요합니다.')
    if not minimum <= value <= maximum:
        raise SceneError(f'{label}: {minimum}~{maximum} 범위로 입력하세요.')
    return float(value)


def integer(value, label, minimum=0, maximum=100000):
    value = number(value, label, minimum, maximum)
    if value != int(value):
        raise SceneError(f'{label}: 정수로 입력하세요.')
    return int(value)


def box(item):
    w, d = item['width'], item['depth']
    if item.get('rotation', 0) in (90, 270):
        w, d = d, w
    return (item['x'] - w / 2, item['z'] - d / 2, item['x'] + w / 2, item['z'] + d / 2)


def overlaps(a, b):
    a, b = box(a), box(b)
    return a[0] < b[2] - .01 and a[2] > b[0] + .01 and a[1] < b[3] - .01 and a[3] > b[1] + .01


def validate_scene(payload, racks, device_ids):
    if not isinstance(payload, dict):
        raise SceneError('JSON 객체가 필요합니다.')
    name = payload.get('name', '')
    if not isinstance(name, str) or not name.strip() or len(name) > 100:
        raise SceneError('서버실 이름은 1~100자여야 합니다.')
    result = {'name': name.strip()}
    for key in ('width', 'depth', 'height'):
        result[key] = integer(payload.get(key), key, 500, 100000)
    result['grid'] = integer(payload.get('grid'), '격자', 100, 5000)
    include = payload.get('include_descendants', False)
    if not isinstance(include, bool):
        raise SceneError('하위 Location 포함 값은 true/false여야 합니다.')
    result['include_descendants'] = include
    placements, blocks, appearances = [], [], {}
    source = payload.get('placements', [])
    raw_blocks = payload.get('blocks', [])
    raw_appearances = payload.get('appearances', {})
    if not isinstance(source, list) or len(source) > 1000 or not isinstance(raw_blocks, list) or len(raw_blocks) > 200:
        raise SceneError('랙은 최대 1,000개, 장애물은 최대 200개까지 지원합니다.')
    if not isinstance(raw_appearances, dict) or len(raw_appearances) > 20000:
        raise SceneError('장비 표시 설정 형식이 잘못되었습니다.')
    seen = set()
    for item in source:
        if not isinstance(item, dict):
            raise SceneError('랙 배치 형식이 잘못되었습니다.')
        rack_id = integer(item.get('rack_id'), '랙 ID', 1, 2**63 - 1)
        if rack_id in seen or rack_id not in racks:
            raise SceneError('중복 랙이거나 이 Location에서 조회할 수 없는 랙입니다.')
        seen.add(rack_id)
        rack = racks[rack_id]
        placement = {'rack_id': rack_id}
        for key in ('x', 'z'):
            placement[key] = number(item.get(key), key)
        rotation = integer(item.get('rotation', 0), '회전', 0, 270)
        if rotation not in (0, 90, 180, 270):
            raise SceneError('회전은 0, 90, 180, 270도만 지원합니다.')
        placement['rotation'] = rotation
        if not isinstance(item.get('locked', False), bool):
            raise SceneError('잠금 값은 true/false여야 합니다.')
        placement['locked'] = item.get('locked', False)
        dimensions = item.get('dimensions', {})
        if not isinstance(dimensions, dict) or set(dimensions) - {'width', 'depth', 'height'}:
            raise SceneError('랙 치수 형식이 잘못되었습니다.')
        placement['dimensions'] = {k: number(v, k, 100, 10000) for k, v in dimensions.items()}
        effective = {k: placement['dimensions'].get(k, rack[k]) for k in ('width', 'depth', 'height')}
        if effective['height'] < rack['u_height'] * 44.45 + 80:
            raise SceneError(f"{rack['name']}: 랙 높이가 U 공간보다 작습니다.")
        placements.append({**placement, **effective, 'label': rack['name']})
    block_ids = set()
    for item in raw_blocks:
        if not isinstance(item, dict):
            raise SceneError('장애물 형식이 잘못되었습니다.')
        block_id = str(item.get('id', ''))
        if not re.fullmatch(r'[A-Za-z0-9_-]{1,64}', block_id) or block_id in block_ids:
            raise SceneError('장애물 ID가 잘못되었거나 중복되었습니다.')
        block_ids.add(block_id)
        label = item.get('name', '기둥')
        if not isinstance(label, str) or len(label) > 100:
            raise SceneError('장애물 이름은 100자 이하여야 합니다.')
        block = {'id': block_id, 'name': label, 'label': label, 'rotation': 0}
        for key in ('x', 'z'):
            block[key] = number(item.get(key), key)
        for key in ('width', 'depth', 'height'):
            block[key] = number(item.get(key), key, 100)
        blocks.append(block)
    all_boxes = placements + blocks
    for i, item in enumerate(all_boxes):
        bounds = box(item)
        if bounds[0] < 0 or bounds[1] < 0 or bounds[2] > result['width'] or bounds[3] > result['depth'] or item['height'] > result['height']:
            raise SceneError(f"{item['label']}: 서버실 경계를 벗어납니다.")
        for other in all_boxes[:i]:
            if overlaps(item, other):
                raise SceneError(f"{item['label']} / {other['label']}: 서로 겹칩니다.")
    for device_id, appearance in raw_appearances.items():
        if not isinstance(device_id, str) or not device_id.isdigit() or int(device_id) not in device_ids or not isinstance(appearance, dict):
            raise SceneError('조회할 수 없는 장비의 표시 설정입니다.')
        entry = {}
        color = appearance.get('color', '')
        if color:
            if not isinstance(color, str) or not re.fullmatch(r'#[0-9a-fA-F]{6}', color):
                raise SceneError('색상은 #RRGGBB 형식이어야 합니다.')
            entry['color'] = color.lower()
        # IDs reference ImageAttachments owned by this device, checked by the service layer.
        for face in ('front', 'rear'):
            if appearance.get(f'{face}_image_id') is not None:
                entry[f'{face}_image_id'] = integer(appearance[f'{face}_image_id'], '이미지 ID', 1, 2**63 - 1)
        if appearance.get('depth') is not None:
            entry['depth'] = number(appearance['depth'], '장비 깊이', 20, 3000)
        appearances[device_id] = entry
    result['scene'] = {
        'placements': [{k: v for k, v in p.items() if k not in ('width', 'depth', 'height', 'label')} for p in placements],
        'blocks': [{k: v for k, v in b.items() if k != 'label'} for b in blocks],
        'appearances': appearances,
    }
    return result
