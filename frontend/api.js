import { demoData } from './demo.js';

export class API {
  constructor(root) { this.demo = root.dataset.demo === 'true'; this.url = root.dataset.api; this.locations = []; }
  async request(url, options = {}) {
    const token = document.querySelector('[name=csrfmiddlewaretoken]')?.value || window.CSRF_TOKEN || '';
    const response = await fetch(url, { credentials: 'same-origin', ...options,
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': token, ...options.headers } });
    let data;
    try { data = await response.json(); } catch { throw new Error('응답을 읽을 수 없습니다. 로그인 상태와 서버 로그를 확인하세요.'); }
    if (!response.ok) throw new Error(data.error || `요청 실패 (${response.status})`);
    return data;
  }
  async list() {
    this.locations = this.demo ? [{ id: 1, site: 'DEMO IDC', name: '서버실 A' }, { id: 2, site: 'DEMO IDC', name: '네트워크실 B' }] : (await this.request(this.url)).locations;
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
      if (current.layout.revision !== layout.revision) throw new Error('다른 탭에서 먼저 저장했습니다. 다시 불러오세요.');
      const saved = structuredClone(layout); saved.revision++;
      localStorage.setItem(`room3d-demo-v1-${id}`, JSON.stringify(saved));
      return { ...current, layout: saved };
    }
    return this.request(this.locations.find(l => l.id === id).url, { method: 'PUT', body: JSON.stringify(layout) });
  }
}
