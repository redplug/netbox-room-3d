// A dialog owns at most one discovery lookup; canceled tickets never become current again.
export function createDiscoveryScope() {
  let active = null;
  return {
    start() {
      active?.abort();
      const controller = new AbortController();
      active = controller;
      return {signal: controller.signal, current: () => active === controller && !controller.signal.aborted};
    },
    cancel() {active?.abort();active = null;},
  };
}

export function candidateOverlayKey(context) {
  return JSON.stringify([context.locationId, context.layout?.placements,
    context.layout?.include_descendants, context.layout?.planned_devices, context.racks]);
}
