import { demoData } from './demo.js';
import { capacityPreview, demoRacks, demoTypes } from './capacity.js';

export class API {
  constructor(root) { this.demo = root.dataset.demo === 'true'; this.url = root.dataset.api; this.locations = []; }
  async request(url, options = {}) {
    const token = document.querySelector('[name=csrfmiddlewaretoken]')?.value || window.CSRF_TOKEN || '';
    const response = await fetch(url, { credentials: 'same-origin', ...options,
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': token, ...options.headers } });
    let data;
    try { data = await response.json(); } catch (error) { if(error.name==='AbortError')throw error; throw new Error('응답을 읽을 수 없습니다. 로그인 상태와 서버 로그를 확인하세요.'); }
    if (!response.ok) throw new Error(data.error || `요청 실패 (${response.status})`);
    return data;
  }
  async list() {
    this.locations = this.demo ? [{ id: 1, site: 'DEMO IDC', name: '서버실 A', has_racks: true }, { id: 2, site: 'DEMO IDC', name: '네트워크실 B', has_racks: true }] : (await this.request(this.url)).locations;
    return this.locations;
  }
  async load(id, descendants) {
    if (this.demo) {
      const data = demoData(id);
      const saved = localStorage.getItem(`room3d-demo-v1-${id}`);
      if (saved) data.layout = JSON.parse(saved);
      return data;
    }
    const url = new URL(this.locations.find(l => l.id === id).url, window.location.href);
    if (descendants !== undefined) url.searchParams.set('descendants', descendants);
    return this.request(url);
  }
  async save(id, layout) {
    if (this.demo) {
      const current = await this.load(id);
      const issues = capacityPreview(demoRacks(current.racks),demoTypes,layout.planned_devices||[]).issues;
      if (issues.length) throw new Error(issues.map(i=>i.message).join(' / '));
      if (current.layout.revision !== layout.revision) throw new Error('다른 탭에서 먼저 저장했습니다. 다시 불러오세요.');
      const saved = structuredClone(layout); saved.revision++;
      const historyKey = `room3d-history-${id}`, history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      history.unshift({ saved_at: new Date().toISOString(), layout: current.layout });
      localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 20)));
      localStorage.setItem(`room3d-demo-v1-${id}`, JSON.stringify(saved));
      return { ...current, layout: saved };
    }
    return this.request(this.locations.find(l => l.id === id).url, { method: 'PUT', body: JSON.stringify(layout) });
  }
  async history(id) {
    if (this.demo) return { history: JSON.parse(localStorage.getItem(`room3d-history-${id}`) || '[]') };
    return this.request(`${this.locations.find(l => l.id === id).url}history/`);
  }
  async devices(id, {signal} = {}) {
    signal?.throwIfAborted();
    if(this.demo) {
      const rows=[];
      for(const loc of this.locations)for(const rack of demoData(loc.id).racks)for(const d of rack.devices)
        rows.push({...d,rack_id:rack.id,rack:rack.name,location_id:loc.id,location:loc.name,rack_unassigned:false,location_unassigned:false});
      return {devices:id==null?rows:rows.filter(d=>d.id===id)};
    }
    const url=new URL('../devices/',new URL(this.url,window.location.href));
    if(id!=null)url.searchParams.set('device',id);
    return this.request(url, {signal});
  }
}
