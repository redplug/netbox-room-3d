"""Bounded layout snapshots stored with the layout, never accepted from clients."""
from copy import deepcopy
import json

FIELDS = ('name', 'width', 'depth', 'height', 'grid', 'revision', 'include_descendants')


def snapshot(room, saved_at):
    layout = {key: getattr(room, key) for key in FIELDS}
    layout.update({key: deepcopy(value) for key, value in (room.scene or {}).items() if not key.startswith('_')})
    return {'saved_at': saved_at, 'layout': layout}


def append_history(room, saved_at):
    history = [snapshot(room, saved_at), *(room.scene or {}).get('_history', [])][:20]
    while len(history) > 1 and len(json.dumps(history).encode('utf-8')) > 8_000_000:
        history.pop()
    return history
