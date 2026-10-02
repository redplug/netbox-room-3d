function Ut(i, e) {
  return { width: i.width, depth: i.depth, height: i.height, ...e?.dimensions };
}
function bt(i) {
  const e = i.rotation === 90 || i.rotation === 270, t = e ? i.depth : i.width, n = e ? i.width : i.depth;
  return [i.x - t / 2, i.z - n / 2, i.x + t / 2, i.z + n / 2];
}
function gr(i, e) {
  return i = bt(i), e = bt(e), i[0] < e[2] - 0.01 && i[2] > e[0] + 0.01 && i[1] < e[3] - 0.01 && i[3] > e[1] + 0.01;
}
function vr(i, e) {
  if (!e?.enabled || i.rack_id == null) return i;
  const t = e.front || 0, n = e.rear || 0, r = (t - n) / 2, s = i.rotation || 0;
  return {
    ...i,
    depth: i.depth + t + n,
    x: i.x + (s === 90 ? -r : s === 270 ? r : 0),
    z: i.z + (s === 0 ? r : s === 180 ? -r : 0)
  };
}
function no(i, e, t) {
  return [[i, e], [vr(i, t), e], [i, vr(e, t)]];
}
function Pn(i, e) {
  const t = [], n = [];
  for (const r of i.placements) {
    const s = e.find((o) => o.id === r.rack_id);
    if (!s) {
      t.push("배치된 랙을 찾을 수 없습니다. 다시 불러오세요.");
      continue;
    }
    const a = Ut(s, r);
    a.height < s.u_height * 44.45 + 80 && t.push(`${s.name}: 높이가 U 공간보다 작습니다.`), n.push({ ...r, ...a, name: s.name });
  }
  n.push(...i.blocks);
  for (const r of ["width", "depth", "height", "grid"])
    (!Number.isFinite(i[r]) || i[r] <= 0) && t.push("서버실 크기와 격자를 확인하세요.");
  n.forEach((r, s) => {
    const a = bt(r);
    if (![r.x, r.z, r.width, r.depth, r.height].every(Number.isFinite) || r.width <= 0 || r.depth <= 0 || r.height <= 0 ? t.push(`${r.name}: 치수가 올바르지 않습니다.`) : (a[0] < 0 || a[1] < 0 || a[2] > i.width || a[3] > i.depth || r.height > i.height) && t.push(`${r.name}: 서버실 경계를 벗어납니다.`), n.slice(0, s).forEach((o) => {
      gr(r, o) && t.push(`${r.name} / ${o.name}: 서로 겹칩니다.`);
    }), i.clearance?.enabled) {
      const o = bt(vr(r, i.clearance));
      (o[0] < 0 || o[1] < 0 || o[2] > i.width || o[3] > i.depth) && t.push(`${r.name}: 벽까지 작업 공간이 부족합니다.`), n.slice(0, s).forEach((l) => {
        !gr(r, l) && no(r, l, i.clearance).some(([c, h]) => gr(c, h)) && t.push(`${r.name} / ${l.name}: 통로·작업 공간이 부족합니다.`);
      });
    }
  });
  for (const r of i.zones || []) {
    (![r.x, r.z, r.width, r.depth].every(Number.isFinite) || r.width < 100 || r.depth < 100 || !/^#[0-9a-fA-F]{6}$/.test(r.color) || !r.name?.trim() || r.name.length > 100) && t.push("구역의 이름·치수·색상을 확인하세요.");
    const s = bt(r);
    (s[0] < 0 || s[1] < 0 || s[2] > i.width || s[3] > i.depth) && t.push(`${r.name}: 구역이 방 경계를 벗어납니다.`);
  }
  return (i.zones || []).length > 100 && t.push("구역은 최대 100개입니다."), t;
}
function Ms(i, e) {
  if (e.position == null || e.u_height <= 0) return null;
  const t = e.position - i.starting_unit;
  return t < 0 || t + e.u_height > i.u_height ? null : (i.desc_units ? i.u_height - t - e.u_height : t) * 44.45;
}
function eh(i, e, t = !0, n = 0) {
  return t ? n + Math.round((i - n) / e) * e : Math.round(i);
}
function Ss(i) {
  if (!i) return "";
  try {
    const e = new URL(i, window.location.href);
    return ["http:", "https:"].includes(e.protocol) ? e.href : "";
  } catch {
    return "";
  }
}
function ha(i) {
  const e = /* @__PURE__ */ new Set();
  for (const t of i.devices) {
    const n = Ms(i, t);
    if (n != null)
      for (let r = Math.floor(n / 44.45 + 1e-8); r < Math.ceil(n / 44.45 + t.u_height - 1e-8); r++) e.add(r);
  }
  return {
    occupied: e,
    used: e.size,
    free: i.u_height - e.size,
    percent: Math.round(e.size / i.u_height * 100),
    count: i.devices.length
  };
}
function Do(i, e, t = "") {
  const n = e.trim().toLowerCase();
  return (!t || i.status === t) && (!n || [i.name, ...i.ip_addresses || [], ...i.primary_ips || []].some((r) => r.toLowerCase().includes(n)));
}
function Lo(i, e) {
  const t = [.../* @__PURE__ */ new Set([...i.primary_ips || [], ...i.ip_addresses || []])], n = t.filter((r) => r.toLowerCase().includes(e.trim().toLowerCase()));
  return { ips: n.length ? n : t, matched: !!e.trim() && n.length > 0 };
}
const th = (i) => ({ active: "#16a34a", planned: "#3b82f6", staged: "#a855f7", offline: "#64748b", failed: "#dc2626", inventory: "#d97706", decommissioning: "#ea580c" })[i] || "#64748b", nh = (i) => i >= 90 ? "#dc2626" : i >= 70 ? "#d97706" : "#0d9488", xr = {
  pillar: { name: "기둥", width: 600, depth: 600, height: 3e3, color: "#b9c3cc" },
  ups: { name: "UPS", width: 800, depth: 1e3, height: 1900, color: "#344454" },
  cooling: { name: "항온항습기", width: 1200, depth: 900, height: 2200, color: "#d3dee5" },
  battery: { name: "배터리 캐비닛", width: 800, depth: 900, height: 1800, color: "#596674" },
  desk: { name: "책상", width: 1400, depth: 700, height: 750, color: "#b78e67" },
  door: { name: "문", width: 1e3, depth: 150, height: 2100, color: "#8c9ba7" },
  glass: { name: "유리벽", width: 2e3, depth: 100, height: 2700, color: "#91d5e2" },
  wall: { name: "벽", width: 2e3, depth: 200, height: 3e3, color: "#c4cdd3" },
  solid: { name: "사용 불가 공간", width: 2e3, depth: 2e3, height: 3e3, color: "#939da7" }
};
function Io(i = !1) {
  const e = Array.from({ length: i ? 8 : 12 }, (t, n) => `<rect x="${28 + n * 34}" y="${i ? 22 : 16}" width="26" height="${i ? 24 : 37}" rx="2" fill="${i ? "#0e7490" : "#26374a"}" stroke="#566679"/><circle cx="${32 + n * 34}" cy="${i ? 27 : 45}" r="2" fill="#5eead4"/>`).join("");
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="70"><rect width="480" height="70" rx="4" fill="#a8b2c0"/><rect x="8" y="7" width="464" height="56" fill="#111c2b"/>${e}<text x="445" y="40" fill="#dbeafe" font-size="9" font-family="sans-serif" text-anchor="middle">${i ? "REAR" : "FRONT"}</text></svg>`)}`;
}
function ih(i = 1) {
  const e = Array.from({ length: i === 1 ? 8 : 4 }, (t, n) => ({
    id: i * 100 + n + 1,
    name: `${i === 1 ? "A" : "B"}-${String(n + 1).padStart(2, "0")}`,
    width: n === 3 ? 800 : 600,
    depth: n === 3 ? 1200 : 1e3,
    height: 2100,
    u_height: 42,
    starting_unit: 1,
    desc_units: n === 2,
    rail_width: 482.6,
    estimated: n === 4 ? ["depth"] : [],
    url: "",
    devices: Array.from({ length: 9 }, (r, s) => ({
      id: i * 1e4 + n * 100 + s,
      name: `${s < 2 ? "sw" : "srv"}-${String(n + 1).padStart(2, "0")}-${String(s + 1).padStart(2, "0")}`,
      model: s < 2 ? "48-port switch" : "Rack server · 2U",
      u_height: s < 2 ? 1 : 2,
      position: s < 2 ? 41 + s : 2 + (s - 2) * 4,
      face: n === 2 && s < 2 ? "rear" : "front",
      full_depth: s >= 2,
      status: s === 8 ? "offline" : "active",
      color: s < 2 ? "#3b82f6" : ["#0d9488", "#64748b", "#8b5cf6"][n % 3],
      front_image: s === 2 || s === 3 ? Io() : null,
      rear_image: s === 2 ? Io(!0) : null,
      images: [],
      url: "",
      interfaces: s >= 2 ? [{ id: s * 2, name: "eth0" }, { id: s * 2 + 1, name: "eth1" }] : [],
      primary_ips: s >= 2 ? [`192.0.2.${10 + s}/24`] : []
    }))
  }));
  return {
    can_edit: !0,
    warning: "",
    racks: e,
    layout: {
      name: i === 1 ? "서버실 A" : "네트워크실 B",
      width: 12e3,
      depth: 8e3,
      height: 3e3,
      grid: 600,
      grid_origin: "top-left",
      include_descendants: !1,
      revision: 0,
      appearances: {},
      placements: e.slice(0, i === 1 ? 4 : 2).map((t, n) => ({ rack_id: t.id, x: 2400 + n * 1200, z: 3e3, rotation: 0, locked: !1, dimensions: {} })),
      blocks: [{ id: "pillar1", name: "기둥", x: 9e3, z: 6e3, width: 600, depth: 600, height: 3e3 }]
    }
  };
}
const ss = [
  { id: 1, model: "샘플 1U · 반깊이", u_height: 1, full_depth: !1 },
  { id: 2, model: "샘플 2U · 전체 깊이", u_height: 2, full_depth: !0 },
  { id: 3, model: "샘플 0.5U · 반깊이", u_height: 0.5, full_depth: !1 }
], da = (i) => i.map((e) => ({ ...e, complete: !0, reservations: [{ id: `demo-${e.id}`, units: [35, 36], status: "pending", description: "샘플 예약 공간", url: "" }] })), Mi = (...i) => new Set(i.flatMap((e) => [...e])), pr = (i, ...e) => {
  const t = Mi(...e);
  return new Set([...i].filter((n) => !t.has(n)));
}, as = (i, e) => new Set(Array.from({ length: Math.ceil(e * 2) }, (t, n) => Math.round(i * 2) + n)), os = (i, e) => [...i].every((t) => e.has(t));
function Zl(i) {
  let e = 0, t = 0, n;
  for (const r of [...i].sort((s, a) => s - a))
    t = r === n + 1 ? t + 1 : 1, e = Math.max(e, t), n = r;
  return e / 2;
}
function Jl(i, e, t) {
  if (!Array.isArray(t) || t.length > 1e3) throw Error("가상 장비는 최대 1,000개입니다.");
  const n = new Map(i.map((l) => [l.id, { rack: l, base: new Set(Array.from({ length: l.u_height * 2 }, (c, h) => l.starting_unit * 2 + h)), actual: { front: /* @__PURE__ */ new Set(), rear: /* @__PURE__ */ new Set() }, planned: { front: /* @__PURE__ */ new Set(), rear: /* @__PURE__ */ new Set() }, reserved: /* @__PURE__ */ new Set(), complete: l.complete !== !1 }]));
  for (const l of n.values()) {
    for (const c of l.rack.devices) {
      if (c.position == null || c.u_height <= 0) continue;
      const h = as(c.position, c.u_height);
      (c.position * 2 !== Math.round(c.position * 2) || !os(h, l.base)) && (l.complete = !1);
      for (const d of c.full_depth ? ["front", "rear"] : [c.face]) {
        if (!l.actual[d]) {
          l.complete = !1;
          continue;
        }
        l.actual[d] = Mi(l.actual[d], new Set([...h].filter((u) => l.base.has(u))));
      }
    }
    for (const c of l.rack.reservations || []) for (const h of c.units) {
      const d = as(h, 1);
      os(d, l.base) || (l.complete = !1), l.reserved = Mi(l.reserved, new Set([...d].filter((u) => l.base.has(u))));
    }
  }
  const r = new Map(e.map((l) => [l.id, l])), s = [], a = [], o = /* @__PURE__ */ new Set();
  for (const l of t) {
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(l.id) || o.has(l.id) || !l.name?.trim() || l.name.length > 100 || !Number.isInteger(l.rack_id) || !Number.isInteger(l.device_type_id) || !Number.isFinite(l.position) || l.position < 0.5 || l.position * 2 !== Math.round(l.position * 2) || !["front", "rear"].includes(l.face)) throw Error("가상 장비 이름·식별자·0.5U 위치·장착면을 확인하세요.");
    o.add(l.id);
    const c = n.get(l.rack_id), h = r.get(l.device_type_id), d = { ...l, valid: !1 };
    let u = "", p = "";
    if (!c || !h || !c.complete)
      p = "visibility", u = "랙·장비 유형·장비·예약의 조회 범위가 부족하거나 참조가 유효하지 않습니다.";
    else if (h.u_height <= 0)
      p = "height", u = "0U 장비는 U 공간 증설 계획을 지원하지 않습니다.";
    else {
      const g = as(l.position, h.u_height), _ = h.full_depth ? ["front", "rear"] : [l.face];
      if (!os(g, c.base))
        p = "bounds", u = "가상 장비가 랙 U 범위를 벗어납니다.";
      else if (_.some((m) => [...g].some((f) => c.actual[m].has(f) || c.reserved.has(f) || c.planned[m].has(f))))
        p = "collision", u = "가상 장비가 실제 장비·예약·다른 가상 장비와 겹칩니다.";
      else {
        for (const m of _) c.planned[m] = Mi(c.planned[m], g);
        d.valid = !0;
      }
    }
    h && Object.assign(d, { model: h.model, u_height: h.u_height, full_depth: h.full_depth }), u && (d.error = u, a.push({ id: l.id, code: p, message: `${l.name}: ${u}` })), s.push(d);
  }
  return { map: n, enriched: s, issues: a, catalog: r };
}
function rh(i, e) {
  const t = Mi(i.actual.front, i.actual.rear), n = e ? Mi(i.planned.front, i.planned.rear) : /* @__PURE__ */ new Set(), r = Mi(t, i.reserved, n), s = { total_u: i.base.size / 2, used_u: t.size / 2, reserved_u: pr(i.reserved, t).size / 2, planned_u: pr(n, t, i.reserved).size / 2, free_u: pr(i.base, r).size / 2, occupancy_percent: Math.round(r.size / i.base.size * 100) };
  for (const a of ["front", "rear"]) {
    const o = pr(i.base, i.actual[a], i.reserved, e ? i.planned[a] : /* @__PURE__ */ new Set());
    s[a] = { free_u: o.size / 2, max_contiguous_u: Zl(o) };
  }
  return s;
}
function Ql(i, e, t = []) {
  const { map: n, enriched: r, issues: s } = Jl(i, e, t), a = [], o = {};
  for (const l of ["before", "after"]) o[l] = { total_u: 0, used_u: 0, reserved_u: 0, planned_u: 0, free_u: 0 };
  for (const l of n.values()) {
    const c = l.rack, h = { id: c.id, name: c.name, u_height: c.u_height, starting_unit: c.starting_unit, desc_units: c.desc_units, reservations: c.reservations || [], complete: l.complete, before: null, after: null };
    if (l.complete) for (const d of ["before", "after"]) {
      h[d] = rh(l, d === "after");
      for (const u in o[d]) o[d][u] += h[d][u];
    }
    a.push(h);
  }
  for (const l of Object.values(o)) l.occupancy_percent = l.total_u ? Math.round((l.total_u - l.free_u) / l.total_u * 100) : 0;
  return { racks: a, planned_devices: r, issues: s, totals: o, complete_racks: a.filter((l) => l.complete).length, unknown_racks: a.filter((l) => !l.complete).length };
}
function sh(i, e, t, n, r) {
  const { map: s, catalog: a, issues: o } = Jl(i, e, t), l = a.get(n);
  if (!l || !["front", "rear"].includes(r)) throw Error("조회 가능한 장비 유형과 전·후면을 선택하세요.");
  if (l.u_height <= 0) throw Error("0U 장비는 U 공간 추천을 지원하지 않습니다.");
  if (o.length) throw Error(`가상 증설 계획을 먼저 수정하세요. ${o[0].message}`);
  const c = [];
  for (const h of s.values()) {
    if (!h.complete) continue;
    let d = new Set(h.base);
    for (const p of l.full_depth ? ["front", "rear"] : [r]) d = pr(d, h.actual[p], h.reserved, h.planned[p]);
    const u = [...d].sort((p, g) => p - g).filter((p) => os(as(p / 2, l.u_height), d)).map((p) => p / 2);
    u.length && c.push({ rack_id: h.rack.id, rack: h.rack.name, positions: u, free_u: d.size / 2, max_contiguous_u: Zl(d) });
  }
  return c.sort((h, d) => d.free_u - h.free_u || d.max_contiguous_u - h.max_contiguous_u || (h.rack < d.rack ? -1 : h.rack > d.rack ? 1 : 0) || h.rack_id - d.rack_id), { candidates: c, device_type: l, unknown_racks: [...s.values()].filter((h) => !h.complete).length };
}
class ah {
  constructor(e) {
    this.demo = e.dataset.demo === "true", this.url = e.dataset.api, this.locations = [];
  }
  async request(e, t = {}) {
    const n = document.querySelector("[name=csrfmiddlewaretoken]")?.value || window.CSRF_TOKEN || "", r = await fetch(e, {
      credentials: "same-origin",
      ...t,
      headers: { "Content-Type": "application/json", "X-CSRFToken": n, ...t.headers }
    });
    let s;
    try {
      s = await r.json();
    } catch {
      throw new Error("응답을 읽을 수 없습니다. 로그인 상태와 서버 로그를 확인하세요.");
    }
    if (!r.ok) throw new Error(s.error || `요청 실패 (${r.status})`);
    return s;
  }
  async list() {
    return this.locations = this.demo ? [{ id: 1, site: "DEMO IDC", name: "서버실 A", has_racks: !0 }, { id: 2, site: "DEMO IDC", name: "네트워크실 B", has_racks: !0 }] : (await this.request(this.url)).locations, this.locations;
  }
  async load(e, t) {
    if (this.demo) {
      const r = ih(e), s = localStorage.getItem(`room3d-demo-v1-${e}`);
      return s && (r.layout = JSON.parse(s)), r;
    }
    const n = new URL(this.locations.find((r) => r.id === e).url, window.location.href);
    return t !== void 0 && n.searchParams.set("descendants", t), this.request(n);
  }
  async save(e, t) {
    if (this.demo) {
      const n = await this.load(e), r = Ql(da(n.racks), ss, t.planned_devices || []).issues;
      if (r.length) throw new Error(r.map((l) => l.message).join(" / "));
      if (n.layout.revision !== t.revision) throw new Error("다른 탭에서 먼저 저장했습니다. 다시 불러오세요.");
      const s = structuredClone(t);
      s.revision++;
      const a = `room3d-history-${e}`, o = JSON.parse(localStorage.getItem(a) || "[]");
      return o.unshift({ saved_at: (/* @__PURE__ */ new Date()).toISOString(), layout: n.layout }), localStorage.setItem(a, JSON.stringify(o.slice(0, 20))), localStorage.setItem(`room3d-demo-v1-${e}`, JSON.stringify(s)), { ...n, layout: s };
    }
    return this.request(this.locations.find((n) => n.id === e).url, { method: "PUT", body: JSON.stringify(t) });
  }
  async history(e) {
    return this.demo ? { history: JSON.parse(localStorage.getItem(`room3d-history-${e}`) || "[]") } : this.request(`${this.locations.find((t) => t.id === e).url}history/`);
  }
}
function Dn(i, e) {
  const t = new Map(e.map((n) => [n.id, n]));
  return [...i.placements.flatMap((n) => {
    const r = t.get(n.rack_id);
    return r ? [{ ...n, ...Ut(r, n), key: `rack:${r.id}`, name: r.name, kind: "rack" }] : [];
  }), ...i.blocks.map((n) => ({ ...n, key: `block:${n.id}`, kind: "block" }))];
}
function ec(i, e) {
  const t = Pn(i, e);
  if (i.blocks.length > 200 && t.unshift("룸 오브젝트는 최대 200개입니다."), t.length) throw new Error(t.slice(0, 3).join(" / "));
  return i;
}
function io(i, e, t, n, r = {}) {
  const s = structuredClone(i), a = Dn(s, e).filter((l) => t.includes(l.key));
  if (!a.length) throw new Error("배치 대상을 선택하세요.");
  if (a.some((l) => l.locked)) throw new Error("잠긴 랙을 선택에서 제외하거나 잠금을 해제하세요.");
  const o = (l, c, h) => {
    const d = l.kind === "rack" ? s.placements.find((u) => u.rack_id === l.rack_id) : s.blocks.find((u) => u.id === l.id);
    Object.assign(d, { x: c, z: h });
  };
  if (n === "move") {
    if (![r.x, r.z].every(Number.isFinite)) throw new Error("이동 거리를 숫자로 입력하세요.");
    a.forEach((l) => o(l, l.x + r.x, l.z + r.z));
  } else if (n === "align") {
    if (a.length < 2) throw new Error("두 개 이상 선택하세요.");
    const l = a.map(bt), c = { left: 0, top: 1, right: 2, bottom: 3 }[r.edge];
    if (c === void 0) throw new Error("정렬 방향을 선택하세요.");
    const h = (c < 2 ? Math.min : Math.max)(...l.map((d) => d[c]));
    a.forEach((d, u) => o(d, d.x + (c % 2 === 0 ? h - l[u][c] : 0), d.z + (c % 2 ? h - l[u][c] : 0)));
  } else if (n === "space") {
    if (a.length < 2 || !Number.isFinite(r.gap) || r.gap < 0) throw new Error("두 개 이상 선택하고 0 이상의 간격을 입력하세요.");
    const l = r.axis === "z" ? 1 : 0;
    a.sort((h, d) => bt(h)[l] - bt(d)[l]);
    let c = bt(a[0])[l];
    a.forEach((h) => {
      const d = bt(h), u = c - d[l];
      o(h, h.x + (l === 0 ? u : 0), h.z + (l === 1 ? u : 0)), c += d[l + 2] - d[l] + r.gap;
    });
  } else throw new Error("지원하지 않는 작업입니다.");
  return ec(s, e);
}
function oh(i, e, t, n, r, s) {
  const a = Dn(i, e).find((p) => p.key === t && p.kind === "block");
  if (!a) throw new Error("룸 오브젝트 한 개를 선택하세요.");
  if (!Number.isInteger(n) || n < 1 || n > 199 || !Number.isFinite(s) || s < 0) throw new Error("복사 개수는 1~199, 간격은 0 이상이어야 합니다.");
  const o = structuredClone(i), l = bt(a), c = new Set(o.blocks.map((p) => p.name)), h = ["up", "down"].includes(r) ? "z" : "x", d = ["up", "left"].includes(r) ? -1 : 1, u = (h === "x" ? l[2] - l[0] : l[3] - l[1]) + s;
  for (let p = 1; p <= n; p++) {
    let g = 1, _;
    do {
      const f = ` 복사본 ${g++}`;
      _ = a.name.slice(0, 100 - f.length) + f;
    } while (c.has(_));
    c.add(_);
    const m = structuredClone(i.blocks.find((f) => f.id === a.id));
    Object.assign(m, { id: crypto.randomUUID(), name: _, [h]: a[h] + d * u * p }), o.blocks.push(m);
  }
  return ec(o, e);
}
function lh(i, e, t) {
  const n = new Map(Dn(i, e).map((h) => [h.key, h])), r = t.map((h) => n.get(h)).filter(Boolean);
  if (!r.length) return null;
  const s = bt(r[0]), a = { left: s[0], top: s[1], right: i.width - s[2], bottom: i.depth - s[3] };
  if (r.length !== 2) return { walls: a };
  const o = bt(r[1]), l = Math.max(0, s[0] - o[2], o[0] - s[2]), c = Math.max(0, s[1] - o[3], o[1] - s[3]);
  return { walls: a, x: l, z: c, distance: Math.hypot(l, c) };
}
function ch(i, e) {
  const t = document.createElement("canvas");
  t.width = 2400, t.height = 1700;
  const n = t.getContext("2d"), r = Math.min(2160 / i.width, 1320 / i.depth), s = 120, a = 190;
  n.fillStyle = "#fff", n.fillRect(0, 0, t.width, t.height), n.fillStyle = "#172b3a", n.font = "bold 34px sans-serif", n.fillText(i.name, 100, 65), n.font = "22px sans-serif", n.fillText(`${i.width} × ${i.depth} mm | revision ${i.revision} | ${(/* @__PURE__ */ new Date()).toLocaleString()}`, 100, 108), n.fillText("좌상 원점 / mm · FRONT = 랙 전면 · 현재 화면의 미저장 배치 포함", 100, 145), n.strokeStyle = "#dce6e9", n.lineWidth = 1;
  const o = i.grid_origin || "top-left", l = Math.max(i.grid, Math.ceil(Math.max(i.width, i.depth) / 200 / i.grid) * i.grid);
  for (let c = 0; c <= i.width; c += l) {
    const h = o.endsWith("right") ? i.width - c : c;
    n.beginPath(), n.moveTo(s + h * r, a), n.lineTo(s + h * r, a + i.depth * r), n.stroke();
  }
  for (let c = 0; c <= i.depth; c += l) {
    const h = o.startsWith("bottom") ? i.depth - c : c;
    n.beginPath(), n.moveTo(s, a + h * r), n.lineTo(s + i.width * r, a + h * r), n.stroke();
  }
  n.strokeStyle = "#172b3a", n.lineWidth = 3, n.strokeRect(s, a, i.width * r, i.depth * r);
  for (const c of Dn(i, e)) {
    const h = bt(c), d = s + h[0] * r, u = a + h[1] * r, p = (h[2] - h[0]) * r, g = (h[3] - h[1]) * r;
    if (n.fillStyle = c.kind === "rack" ? "#e2f2ef" : "#e9edf1", n.fillRect(d, u, p, g), n.strokeStyle = "#446473", n.lineWidth = 2, n.strokeRect(d, u, p, g), n.save(), n.beginPath(), n.rect(d + 2, u + 2, Math.max(1, p - 4), Math.max(1, g - 4)), n.clip(), n.fillStyle = "#172b3a", n.textAlign = "center", n.font = "bold 18px sans-serif", n.fillText(c.name, d + p / 2, u + g / 2 - 5, Math.max(1, p - 8)), n.font = "14px sans-serif", n.fillText(`${h[2] - h[0]} × ${h[3] - h[1]}`, d + p / 2, u + g / 2 + 16, Math.max(1, p - 8)), n.restore(), c.kind === "rack") {
      n.save(), n.translate(s + c.x * r, a + c.z * r), n.rotate((c.rotation || 0) * Math.PI / 180), n.fillStyle = "#087f78";
      const _ = c.depth * r / 2;
      n.beginPath(), n.moveTo(-8, _ - 12), n.lineTo(8, _ - 12), n.lineTo(0, _), n.fill(), n.restore();
    }
  }
  return n.textAlign = "left", n.fillStyle = "#647786", n.font = "20px sans-serif", n.fillText("Room 3D | FRONT: 녹색 삼각형 방향 | 도면은 축척에 맞춰 출력되며 글자는 이미지로 포함됩니다.", 100, 1650), t;
}
function hh(i) {
  const e = atob(i.toDataURL("image/jpeg", 0.95).split(",")[1]), t = Uint8Array.from(e, (d) => d.charCodeAt(0)), n = new TextEncoder(), r = [], s = [0];
  let a = 0;
  const o = (d) => {
    const u = typeof d == "string" ? n.encode(d) : d;
    r.push(u), a += u.length;
  };
  o(`%PDF-1.4
`);
  const l = (d, u) => {
    s[d] = a, o(`${d} 0 obj
${u}
endobj
`);
  };
  l(1, "<< /Type /Catalog /Pages 2 0 R >>"), l(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>"), l(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 596] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>"), s[4] = a, o(`4 0 obj
<< /Type /XObject /Subtype /Image /Width ${i.width} /Height ${i.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${t.length} >>
stream
`), o(t), o(`
endstream
endobj
`);
  const c = "q 842 0 0 596 0 0 cm /Im0 Do Q";
  l(5, `<< /Length ${c.length} >>
stream
${c}
endstream`);
  const h = a;
  return o(`xref
0 6
0000000000 65535 f 
`), s.slice(1).forEach((d) => o(`${String(d).padStart(10, "0")} 00000 n 
`)), o(`trailer
<< /Size 6 /Root 1 0 R >>
startxref
${h}
%%EOF
`), new Blob(r, { type: "application/pdf" });
}
async function dh(i, e, t) {
  await document.fonts.ready;
  const n = ch(i, e), r = t === "pdf" ? hh(n) : await new Promise((o) => n.toBlob(o, "image/png")), s = URL.createObjectURL(r), a = document.createElement("a");
  a.href = s, a.download = `room3d-${i.name.replace(/[\\/:*?"<>|]/g, "_")}.${t}`, a.click(), setTimeout(() => URL.revokeObjectURL(s), 1e3);
}
const Pr = (i) => String(i ?? "").replace(/[&<>"']/g, (e) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[e]);
function uh(i, e) {
  const t = /* @__PURE__ */ new Set();
  let n = [], r;
  const s = document.createElement("dialog");
  s.id = "r3-studio", s.innerHTML = `<div class="r3-dialog-title"><h2>배치 도구</h2><button type="button" class="r3-icon-button" data-tool="close" aria-label="배치 도구 닫기">×</button></div>
    <p>대상을 체크하거나 평면에서 Shift+클릭으로 선택하세요. 선택한 대상은 함께 드래그할 수 있습니다.</p>
    <div class="r3-studio-grid"><section><h3>다중 선택 <span id="r3-picked-count"></span></h3><button class="r3-btn small" data-tool="all">전체 선택</button> <button class="r3-btn small" data-tool="none">선택 해제</button><div id="r3-pick-list"></div></section>
    <section><h3>일괄 이동</h3><div class="r3-form-grid"><label>X 이동 (mm)<input id="r3-dx" type="number" value="0"></label><label>Z 이동 (mm)<input id="r3-dz" type="number" value="0"></label></div><button class="r3-btn" data-tool="move" data-write>이동 적용</button>
    <h3>정렬 / 간격</h3><label>정렬 기준<select id="r3-align"><option value="left">좌측</option><option value="right">우측</option><option value="top">상단</option><option value="bottom">하단</option></select></label><button class="r3-btn" data-tool="align" data-write>정렬 적용</button>
    <div class="r3-form-grid"><label>배치 축<select id="r3-axis"><option value="x">가로 X</option><option value="z">세로 Z</option></select></label><label>가장자리 간격 (mm)<input id="r3-gap" type="number" min="0" value="600"></label></div><button class="r3-btn" data-tool="space" data-write>간격 적용</button><p>간격 0은 붙여 배치입니다. 정렬·간격은 충돌 시 거부하며, 이동은 상단 자동 밀림 설정을 따릅니다.</p>
    <h3>룸 오브젝트 반복 복사</h3><div class="r3-form-grid"><label>추가 개수<input id="r3-repeat-count" type="number" min="1" max="199" value="2"></label><label>복사 방향<select id="r3-repeat-direction"><option value="right">오른쪽</option><option value="left">왼쪽</option><option value="down">아래</option><option value="up">위</option></select></label></div><p>위의 가장자리 간격을 사용합니다. 룸 오브젝트 하나를 선택하세요.</p><button class="r3-btn" data-tool="repeat" data-write>반복 복사</button>
    <h3>거리 측정</h3><p id="r3-measure"></p>
    <h3>평면도 내보내기</h3><button class="r3-btn" data-tool="png">PNG 다운로드</button> <button class="r3-btn" data-tool="pdf">PDF 다운로드</button><p>이름·치수·전면 방향을 포함한 전체 평면도입니다.</p>
    <h3>저장 이력</h3><button class="r3-btn" data-tool="history">이력 불러오기</button><div id="r3-history-list"></div><p>최근 20개 저장 전 배치. 복원 후 검토하고 배치 저장을 눌러 확정하세요.</p></section></div><p id="r3-tool-status" role="status"></p>`, s.querySelectorAll("select").forEach((d) => d.classList.add("no-ts")), i.append(s);
  const a = document.createElement("button");
  a.className = "r3-btn small", a.textContent = "배치 도구", a.id = "r3-studio-open", i.querySelector(".r3-location-actions").prepend(a);
  const o = (d) => s.querySelector(d), l = (d) => o(`#r3-${d}`).value, c = (d) => {
    const u = l(d);
    if (!u.trim() || !Number.isFinite(Number(u))) throw new Error("숫자를 입력하세요.");
    return Number(u);
  };
  function h() {
    const d = e();
    if (!d.layout) {
      a.disabled = !0;
      return;
    }
    a.disabled = !1, r !== d.locationId && (r = d.locationId, t.clear(), n = [], o("#r3-history-list").replaceChildren());
    const u = Dn(d.layout, d.racks), p = new Set(u.map((m) => m.key));
    for (const m of t) p.has(m) || t.delete(m);
    o("#r3-pick-list").innerHTML = u.map((m) => `<label class="r3-check"><input type="checkbox" data-pick="${Pr(m.key)}" ${t.has(m.key) ? "checked" : ""}>${Pr(m.name)}${m.locked ? " (잠금)" : ""}</label>`).join(""), o("#r3-picked-count").textContent = `${t.size}개`, s.querySelectorAll("[data-write]").forEach((m) => m.disabled = !d.editable);
    const g = lh(d.layout, d.racks, [...t]), _ = (m) => `${Math.round(m).toLocaleString()} mm`;
    o("#r3-measure").textContent = g ? `첫 선택 대상의 벽까지: 좌 ${_(g.walls.left)}, 상 ${_(g.walls.top)}, 우 ${_(g.walls.right)}, 하 ${_(g.walls.bottom)}${g.distance !== void 0 ? ` / 대상 사이: ${_(g.distance)} (X ${_(g.x)}, Z ${_(g.z)})` : ""}` : "하나 선택: 벽까지 거리 / 둘 선택: 가장자리 사이 최단 거리", d.mark([...t]);
  }
  return a.onclick = () => {
    h(), s.showModal();
  }, s.addEventListener("change", (d) => {
    if (d.target.dataset.pick) {
      const u = d.target.dataset.pick;
      d.target.checked ? t.add(u) : t.delete(u), h();
    }
  }), s.addEventListener("click", async (d) => {
    const u = d.target.closest("[data-tool]");
    if (!u || u.disabled) return;
    const p = e(), g = u.dataset.tool, _ = [...t];
    try {
      if (o("#r3-tool-status").textContent = "", g === "close") {
        s.close();
        return;
      }
      if (g === "all") Dn(p.layout, p.racks).forEach((m) => t.add(m.key));
      else if (g === "none") t.clear();
      else if (g === "move") p.apply(p.move(_, c("dx"), c("dz")));
      else if (["align", "space"].includes(g)) p.apply(io(p.layout, p.racks, _, g, { edge: l("align"), axis: l("axis"), gap: c("gap") }));
      else if (g === "repeat") {
        if (t.size !== 1) throw new Error("룸 오브젝트 하나만 선택하세요.");
        p.apply(oh(p.layout, p.racks, _[0], c("repeat-count"), l("repeat-direction"), c("gap")));
      } else if (g === "png" || g === "pdf") await dh(p.layout, p.racks, g);
      else if (g === "history") {
        const m = (await p.history()).history;
        if (e().locationId !== p.locationId) return;
        n = m, o("#r3-history-list").innerHTML = n.length ? n.map((f, T) => `<div class="r3-history-row"><span>r${f.layout.revision} · ${Pr(f.saved_at)}<small>${Pr(f.layout.name)} · 랙 ${f.layout.placements.length} / 오브젝트 ${f.layout.blocks.length}</small></span><button class="r3-btn small" data-tool="restore" data-index="${T}" data-write ${p.editable ? "" : "disabled"}>불러오기</button></div>`).join("") : "<p>저장 이력이 없습니다. 업데이트 이후 저장부터 기록됩니다.</p>";
      } else if (g === "restore") {
        const m = n[Number(u.dataset.index)];
        if (!m || !window.confirm("현재 편집 내용을 이 배치로 바꿀까요? 되돌리기로 취소할 수 있습니다.") || !await p.restore(m.layout)) return;
        o("#r3-tool-status").textContent = "배치를 불러왔습니다. 화면을 검토한 뒤 배치 저장으로 확정하세요.";
      }
      h(), ["move", "align", "space", "repeat"].includes(g) && (o("#r3-tool-status").textContent = "적용했습니다. 닫기 후 화면을 확인하고 배치 저장을 누르세요.");
    } catch (m) {
      o("#r3-tool-status").textContent = m.message;
    }
  }), { refresh: h, keys: t, toggle(d) {
    const u = d.blockId ? `block:${d.blockId}` : `rack:${d.rackId}`;
    t.has(u) ? t.delete(u) : t.add(u), h();
  } };
}
function fh(i, e, t, n) {
  const r = structuredClone(i), s = new Set(i.placements.map((m) => m.rack_id));
  if (!t.length || new Set(t).size !== t.length || t.some((m) => s.has(m) || !e.some((f) => f.id === m))) throw new Error("미배치 랙을 선택하세요.");
  const { x: a, z: o, columns: l, gapX: c, gapZ: h, rotation: d } = n;
  if (![a, o, c, h].every((m) => Number.isFinite(m) && m >= 0) || !Number.isInteger(l) || l < 1 || ![0, 90, 180, 270].includes(d)) throw new Error("시작 좌표·열 개수·간격·방향을 확인하세요.");
  let u = a, p = o, g = 0;
  t.forEach((m, f) => {
    f && f % l === 0 && (u = a, p += g + h, g = 0);
    const T = e.find((R) => R.id === m), b = d === 90 || d === 270, y = b ? T.depth : T.width, w = b ? T.width : T.depth;
    r.placements.push({ rack_id: m, x: u + y / 2, z: p + w / 2, rotation: d, locked: !1, dimensions: {} }), u += y + c, g = Math.max(g, w);
  });
  const _ = Pn(r, e);
  if (_.length) throw new Error(_.slice(0, 3).join(" / "));
  return r;
}
function Uo(i, e, t) {
  const n = (o) => [...Dn(o, t), ...(o.zones || []).map((l) => ({ ...l, key: `zone:${l.id}`, kind: "zone", height: 10 })), ...(o.planned_devices || []).map((l) => ({ ...l, key: `planned:${l.id}`, kind: "planned" }))], r = new Map(n(i).map((o) => [o.key, o])), s = new Map(n(e).map((o) => [o.key, o])), a = [];
  for (const o of /* @__PURE__ */ new Set([...r.keys(), ...s.keys()])) {
    const l = r.get(o), c = s.get(o);
    if (!l) a.push({ key: o, name: c.name, type: "added", current: c });
    else if (!c) a.push({ key: o, name: l.name, type: "removed", old: l });
    else {
      const h = ["x", "z", "rotation", "width", "depth", "height", "locked", "name", "color", "rack_id", "position", "face", "device_type_id"].filter((d) => JSON.stringify(l[d]) !== JSON.stringify(c[d]));
      h.length && a.push({ key: o, name: c.name, type: "changed", old: l, current: c, fields: h });
    }
  }
  for (const o of ["name", "width", "depth", "height", "grid", "grid_origin", "include_descendants", "clearance", "appearances"])
    JSON.stringify(i[o] ?? null) !== JSON.stringify(e[o] ?? null) && a.push({ key: `setting:${o}`, name: o, type: "setting" });
  return a;
}
function Dr(i) {
  return i && ["top", "3d"].includes(i.mode) && ["position", "target"].every((e) => Array.isArray(i[e]) && i[e].length === 3 && i[e].every((t) => Number.isFinite(t) && Math.abs(t) <= 1e3)) && i.position[1] > 0 && Math.hypot(...i.position.map((e, t) => e - i.target[t])) > 0.01;
}
async function tc(i, e, t, n = "") {
  if (i.demo) {
    if (e === "device-types") return { device_types: ss.filter((c) => c.model.includes(new URLSearchParams(n.replace(/^\?/, "")).get("q") || "")), truncated: !1 };
    if (e === "capacity") return Ql(da(i.racks), ss, t?.planned_devices ?? i.layout.planned_devices ?? []);
    if (e === "recommendations") return sh(da(i.racks), ss, t.planned_devices || [], t.device_type_id, t.face);
    if (e === "cables") return { cables: [], demo: !0 };
    if (e === "cleanup") throw new Error("참조 정리는 NetBox 관리자 화면에서만 사용할 수 있습니다.");
    const o = `room3d-plans-v1-${i.locationId}`;
    let l = JSON.parse(localStorage.getItem(o) || "[]");
    if (t) {
      const c = String(t.name || "").trim();
      if (["create", "rename"].includes(t.action)) {
        if (!c || c.length > 100) throw new Error("이름은 1~100자여야 합니다.");
        if (l.some((h) => h.name === c && h.id !== t.id)) throw new Error("같은 이름의 배치안이 있습니다.");
      }
      if (t.action === "create") {
        if (l.length >= 10) throw new Error("배치안은 최대 10개입니다.");
        l.push({ id: crypto.randomUUID(), name: c, layout: structuredClone(t.layout), valid: !0, saved_at: (/* @__PURE__ */ new Date()).toISOString() });
      } else t.action === "rename" ? l = l.map((h) => h.id === t.id ? { ...h, name: c } : h) : t.action === "delete" && (l = l.filter((h) => h.id !== t.id));
      localStorage.setItem(o, JSON.stringify(l));
    }
    return { plans: l, revision: i.layout.revision };
  }
  if (!i.url) throw new Error("Location 주소가 없습니다.");
  const r = document.querySelector("[name=csrfmiddlewaretoken]")?.value || window.CSRF_TOKEN || "", s = await fetch(`${i.url.replace(/\/$/, "")}/${e}/${n}`, {
    method: t ? "POST" : "GET",
    credentials: "same-origin",
    headers: t ? { "Content-Type": "application/json", "X-CSRFToken": r } : {},
    body: t ? JSON.stringify(t) : void 0
  }), a = await s.json().catch(() => ({}));
  if (!s.ok) throw new Error(a.error || `요청 실패 (${s.status})`);
  return a;
}
const ro = "180", qi = { ROTATE: 0, DOLLY: 1, PAN: 2 }, Wi = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 }, ph = 0, No = 1, mh = 2, nc = 1, gh = 2, zn = 3, ii = 0, Jt = 1, rn = 2, ti = 0, Yi = 1, Fo = 2, Oo = 3, ko = 4, _h = 5, gi = 100, vh = 101, xh = 102, Mh = 103, Sh = 104, yh = 200, bh = 201, Eh = 202, wh = 203, ua = 204, fa = 205, Th = 206, Ah = 207, Rh = 208, Ch = 209, Ph = 210, Dh = 211, Lh = 212, Ih = 213, Uh = 214, pa = 0, ma = 1, ga = 2, Ji = 3, _a = 4, va = 5, xa = 6, Ma = 7, ic = 0, Nh = 1, Fh = 2, ni = 0, Oh = 1, kh = 2, Bh = 3, zh = 4, Hh = 5, Vh = 6, Gh = 7, rc = 300, Qi = 301, er = 302, Sa = 303, ya = 304, ys = 306, ba = 1e3, vi = 1001, Ea = 1002, Mn = 1003, Wh = 1004, Lr = 1005, An = 1006, Cs = 1007, xi = 1008, Ln = 1009, sc = 1010, ac = 1011, Mr = 1012, so = 1013, bi = 1014, Vn = 1015, Ar = 1016, ao = 1017, oo = 1018, Sr = 1020, oc = 35902, lc = 35899, cc = 1021, hc = 1022, xn = 1023, yr = 1026, br = 1027, dc = 1028, lo = 1029, uc = 1030, co = 1031, ho = 1033, ls = 33776, cs = 33777, hs = 33778, ds = 33779, wa = 35840, Ta = 35841, Aa = 35842, Ra = 35843, Ca = 36196, Pa = 37492, Da = 37496, La = 37808, Ia = 37809, Ua = 37810, Na = 37811, Fa = 37812, Oa = 37813, ka = 37814, Ba = 37815, za = 37816, Ha = 37817, Va = 37818, Ga = 37819, Wa = 37820, $a = 37821, Xa = 36492, qa = 36494, Ya = 36495, ja = 36283, Ka = 36284, Za = 36285, Ja = 36286, $h = 3200, Xh = 3201, fc = 0, qh = 1, ei = "", Zt = "srgb", tr = "srgb-linear", fs = "linear", et = "srgb", Ri = 7680, Bo = 519, Yh = 512, jh = 513, Kh = 514, pc = 515, Zh = 516, Jh = 517, Qh = 518, ed = 519, zo = 35044, Ho = "300 es", Rn = 2e3, ps = 2001;
class Ti {
  /**
   * Adds the given event listener to the given event type.
   *
   * @param {string} type - The type of event to listen to.
   * @param {Function} listener - The function that gets called when the event is fired.
   */
  addEventListener(e, t) {
    this._listeners === void 0 && (this._listeners = {});
    const n = this._listeners;
    n[e] === void 0 && (n[e] = []), n[e].indexOf(t) === -1 && n[e].push(t);
  }
  /**
   * Returns `true` if the given event listener has been added to the given event type.
   *
   * @param {string} type - The type of event.
   * @param {Function} listener - The listener to check.
   * @return {boolean} Whether the given event listener has been added to the given event type.
   */
  hasEventListener(e, t) {
    const n = this._listeners;
    return n === void 0 ? !1 : n[e] !== void 0 && n[e].indexOf(t) !== -1;
  }
  /**
   * Removes the given event listener from the given event type.
   *
   * @param {string} type - The type of event.
   * @param {Function} listener - The listener to remove.
   */
  removeEventListener(e, t) {
    const n = this._listeners;
    if (n === void 0) return;
    const r = n[e];
    if (r !== void 0) {
      const s = r.indexOf(t);
      s !== -1 && r.splice(s, 1);
    }
  }
  /**
   * Dispatches an event object.
   *
   * @param {Object} event - The event that gets fired.
   */
  dispatchEvent(e) {
    const t = this._listeners;
    if (t === void 0) return;
    const n = t[e.type];
    if (n !== void 0) {
      e.target = this;
      const r = n.slice(0);
      for (let s = 0, a = r.length; s < a; s++)
        r[s].call(this, e);
      e.target = null;
    }
  }
}
const Bt = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
let Vo = 1234567;
const ji = Math.PI / 180, Er = 180 / Math.PI;
function ir() {
  const i = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
  return (Bt[i & 255] + Bt[i >> 8 & 255] + Bt[i >> 16 & 255] + Bt[i >> 24 & 255] + "-" + Bt[e & 255] + Bt[e >> 8 & 255] + "-" + Bt[e >> 16 & 15 | 64] + Bt[e >> 24 & 255] + "-" + Bt[t & 63 | 128] + Bt[t >> 8 & 255] + "-" + Bt[t >> 16 & 255] + Bt[t >> 24 & 255] + Bt[n & 255] + Bt[n >> 8 & 255] + Bt[n >> 16 & 255] + Bt[n >> 24 & 255]).toLowerCase();
}
function Ge(i, e, t) {
  return Math.max(e, Math.min(t, i));
}
function uo(i, e) {
  return (i % e + e) % e;
}
function td(i, e, t, n, r) {
  return n + (i - e) * (r - n) / (t - e);
}
function nd(i, e, t) {
  return i !== e ? (t - i) / (e - i) : 0;
}
function _r(i, e, t) {
  return (1 - t) * i + t * e;
}
function id(i, e, t, n) {
  return _r(i, e, 1 - Math.exp(-t * n));
}
function rd(i, e = 1) {
  return e - Math.abs(uo(i, e * 2) - e);
}
function sd(i, e, t) {
  return i <= e ? 0 : i >= t ? 1 : (i = (i - e) / (t - e), i * i * (3 - 2 * i));
}
function ad(i, e, t) {
  return i <= e ? 0 : i >= t ? 1 : (i = (i - e) / (t - e), i * i * i * (i * (i * 6 - 15) + 10));
}
function od(i, e) {
  return i + Math.floor(Math.random() * (e - i + 1));
}
function ld(i, e) {
  return i + Math.random() * (e - i);
}
function cd(i) {
  return i * (0.5 - Math.random());
}
function hd(i) {
  i !== void 0 && (Vo = i);
  let e = Vo += 1831565813;
  return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
}
function dd(i) {
  return i * ji;
}
function ud(i) {
  return i * Er;
}
function fd(i) {
  return (i & i - 1) === 0 && i !== 0;
}
function pd(i) {
  return Math.pow(2, Math.ceil(Math.log(i) / Math.LN2));
}
function md(i) {
  return Math.pow(2, Math.floor(Math.log(i) / Math.LN2));
}
function gd(i, e, t, n, r) {
  const s = Math.cos, a = Math.sin, o = s(t / 2), l = a(t / 2), c = s((e + n) / 2), h = a((e + n) / 2), d = s((e - n) / 2), u = a((e - n) / 2), p = s((n - e) / 2), g = a((n - e) / 2);
  switch (r) {
    case "XYX":
      i.set(o * h, l * d, l * u, o * c);
      break;
    case "YZY":
      i.set(l * u, o * h, l * d, o * c);
      break;
    case "ZXZ":
      i.set(l * d, l * u, o * h, o * c);
      break;
    case "XZX":
      i.set(o * h, l * g, l * p, o * c);
      break;
    case "YXY":
      i.set(l * p, o * h, l * g, o * c);
      break;
    case "ZYZ":
      i.set(l * g, l * p, o * h, o * c);
      break;
    default:
      console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + r);
  }
}
function Gi(i, e) {
  switch (e.constructor) {
    case Float32Array:
      return i;
    case Uint32Array:
      return i / 4294967295;
    case Uint16Array:
      return i / 65535;
    case Uint8Array:
      return i / 255;
    case Int32Array:
      return Math.max(i / 2147483647, -1);
    case Int16Array:
      return Math.max(i / 32767, -1);
    case Int8Array:
      return Math.max(i / 127, -1);
    default:
      throw new Error("Invalid component type.");
  }
}
function Gt(i, e) {
  switch (e.constructor) {
    case Float32Array:
      return i;
    case Uint32Array:
      return Math.round(i * 4294967295);
    case Uint16Array:
      return Math.round(i * 65535);
    case Uint8Array:
      return Math.round(i * 255);
    case Int32Array:
      return Math.round(i * 2147483647);
    case Int16Array:
      return Math.round(i * 32767);
    case Int8Array:
      return Math.round(i * 127);
    default:
      throw new Error("Invalid component type.");
  }
}
const mc = {
  DEG2RAD: ji,
  RAD2DEG: Er,
  /**
   * Generate a [UUID]{@link https://en.wikipedia.org/wiki/Universally_unique_identifier}
   * (universally unique identifier).
   *
   * @static
   * @method
   * @return {string} The UUID.
   */
  generateUUID: ir,
  /**
   * Clamps the given value between min and max.
   *
   * @static
   * @method
   * @param {number} value - The value to clamp.
   * @param {number} min - The min value.
   * @param {number} max - The max value.
   * @return {number} The clamped value.
   */
  clamp: Ge,
  /**
   * Computes the Euclidean modulo of the given parameters that
   * is `( ( n % m ) + m ) % m`.
   *
   * @static
   * @method
   * @param {number} n - The first parameter.
   * @param {number} m - The second parameter.
   * @return {number} The Euclidean modulo.
   */
  euclideanModulo: uo,
  /**
   * Performs a linear mapping from range `<a1, a2>` to range `<b1, b2>`
   * for the given value.
   *
   * @static
   * @method
   * @param {number} x - The value to be mapped.
   * @param {number} a1 - Minimum value for range A.
   * @param {number} a2 - Maximum value for range A.
   * @param {number} b1 - Minimum value for range B.
   * @param {number} b2 - Maximum value for range B.
   * @return {number} The mapped value.
   */
  mapLinear: td,
  /**
   * Returns the percentage in the closed interval `[0, 1]` of the given value
   * between the start and end point.
   *
   * @static
   * @method
   * @param {number} x - The start point
   * @param {number} y - The end point.
   * @param {number} value - A value between start and end.
   * @return {number} The interpolation factor.
   */
  inverseLerp: nd,
  /**
   * Returns a value linearly interpolated from two known points based on the given interval -
   * `t = 0` will return `x` and `t = 1` will return `y`.
   *
   * @static
   * @method
   * @param {number} x - The start point
   * @param {number} y - The end point.
   * @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
   * @return {number} The interpolated value.
   */
  lerp: _r,
  /**
   * Smoothly interpolate a number from `x` to `y` in  a spring-like manner using a delta
   * time to maintain frame rate independent movement. For details, see
   * [Frame rate independent damping using lerp]{@link http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/}.
   *
   * @static
   * @method
   * @param {number} x - The current point.
   * @param {number} y - The target point.
   * @param {number} lambda - A higher lambda value will make the movement more sudden,
   * and a lower value will make the movement more gradual.
   * @param {number} dt - Delta time in seconds.
   * @return {number} The interpolated value.
   */
  damp: id,
  /**
   * Returns a value that alternates between `0` and the given `length` parameter.
   *
   * @static
   * @method
   * @param {number} x - The value to pingpong.
   * @param {number} [length=1] - The positive value the function will pingpong to.
   * @return {number} The alternated value.
   */
  pingpong: rd,
  /**
   * Returns a value in the range `[0,1]` that represents the percentage that `x` has
   * moved between `min` and `max`, but smoothed or slowed down the closer `x` is to
   * the `min` and `max`.
   *
   * See [Smoothstep]{@link http://en.wikipedia.org/wiki/Smoothstep} for more details.
   *
   * @static
   * @method
   * @param {number} x - The value to evaluate based on its position between min and max.
   * @param {number} min - The min value. Any x value below min will be `0`.
   * @param {number} max - The max value. Any x value above max will be `1`.
   * @return {number} The alternated value.
   */
  smoothstep: sd,
  /**
   * A [variation on smoothstep]{@link https://en.wikipedia.org/wiki/Smoothstep#Variations}
   * that has zero 1st and 2nd order derivatives at x=0 and x=1.
   *
   * @static
   * @method
   * @param {number} x - The value to evaluate based on its position between min and max.
   * @param {number} min - The min value. Any x value below min will be `0`.
   * @param {number} max - The max value. Any x value above max will be `1`.
   * @return {number} The alternated value.
   */
  smootherstep: ad,
  /**
   * Returns a random integer from `<low, high>` interval.
   *
   * @static
   * @method
   * @param {number} low - The lower value boundary.
   * @param {number} high - The upper value boundary
   * @return {number} A random integer.
   */
  randInt: od,
  /**
   * Returns a random float from `<low, high>` interval.
   *
   * @static
   * @method
   * @param {number} low - The lower value boundary.
   * @param {number} high - The upper value boundary
   * @return {number} A random float.
   */
  randFloat: ld,
  /**
   * Returns a random integer from `<-range/2, range/2>` interval.
   *
   * @static
   * @method
   * @param {number} range - Defines the value range.
   * @return {number} A random float.
   */
  randFloatSpread: cd,
  /**
   * Returns a deterministic pseudo-random float in the interval `[0, 1]`.
   *
   * @static
   * @method
   * @param {number} [s] - The integer seed.
   * @return {number} A random float.
   */
  seededRandom: hd,
  /**
   * Converts degrees to radians.
   *
   * @static
   * @method
   * @param {number} degrees - A value in degrees.
   * @return {number} The converted value in radians.
   */
  degToRad: dd,
  /**
   * Converts radians to degrees.
   *
   * @static
   * @method
   * @param {number} radians - A value in radians.
   * @return {number} The converted value in degrees.
   */
  radToDeg: ud,
  /**
   * Returns `true` if the given number is a power of two.
   *
   * @static
   * @method
   * @param {number} value - The value to check.
   * @return {boolean} Whether the given number is a power of two or not.
   */
  isPowerOfTwo: fd,
  /**
   * Returns the smallest power of two that is greater than or equal to the given number.
   *
   * @static
   * @method
   * @param {number} value - The value to find a POT for.
   * @return {number} The smallest power of two that is greater than or equal to the given number.
   */
  ceilPowerOfTwo: pd,
  /**
   * Returns the largest power of two that is less than or equal to the given number.
   *
   * @static
   * @method
   * @param {number} value - The value to find a POT for.
   * @return {number} The largest power of two that is less than or equal to the given number.
   */
  floorPowerOfTwo: md,
  /**
   * Sets the given quaternion from the [Intrinsic Proper Euler Angles]{@link https://en.wikipedia.org/wiki/Euler_angles}
   * defined by the given angles and order.
   *
   * Rotations are applied to the axes in the order specified by order:
   * rotation by angle `a` is applied first, then by angle `b`, then by angle `c`.
   *
   * @static
   * @method
   * @param {Quaternion} q - The quaternion to set.
   * @param {number} a - The rotation applied to the first axis, in radians.
   * @param {number} b - The rotation applied to the second axis, in radians.
   * @param {number} c - The rotation applied to the third axis, in radians.
   * @param {('XYX'|'XZX'|'YXY'|'YZY'|'ZXZ'|'ZYZ')} order - A string specifying the axes order.
   */
  setQuaternionFromProperEuler: gd,
  /**
   * Normalizes the given value according to the given typed array.
   *
   * @static
   * @method
   * @param {number} value - The float value in the range `[0,1]` to normalize.
   * @param {TypedArray} array - The typed array that defines the data type of the value.
   * @return {number} The normalize value.
   */
  normalize: Gt,
  /**
   * Denormalizes the given value according to the given typed array.
   *
   * @static
   * @method
   * @param {number} value - The value to denormalize.
   * @param {TypedArray} array - The typed array that defines the data type of the value.
   * @return {number} The denormalize (float) value in the range `[0,1]`.
   */
  denormalize: Gi
};
class Ue {
  /**
   * Constructs a new 2D vector.
   *
   * @param {number} [x=0] - The x value of this vector.
   * @param {number} [y=0] - The y value of this vector.
   */
  constructor(e = 0, t = 0) {
    Ue.prototype.isVector2 = !0, this.x = e, this.y = t;
  }
  /**
   * Alias for {@link Vector2#x}.
   *
   * @type {number}
   */
  get width() {
    return this.x;
  }
  set width(e) {
    this.x = e;
  }
  /**
   * Alias for {@link Vector2#y}.
   *
   * @type {number}
   */
  get height() {
    return this.y;
  }
  set height(e) {
    this.y = e;
  }
  /**
   * Sets the vector components.
   *
   * @param {number} x - The value of the x component.
   * @param {number} y - The value of the y component.
   * @return {Vector2} A reference to this vector.
   */
  set(e, t) {
    return this.x = e, this.y = t, this;
  }
  /**
   * Sets the vector components to the same value.
   *
   * @param {number} scalar - The value to set for all vector components.
   * @return {Vector2} A reference to this vector.
   */
  setScalar(e) {
    return this.x = e, this.y = e, this;
  }
  /**
   * Sets the vector's x component to the given value
   *
   * @param {number} x - The value to set.
   * @return {Vector2} A reference to this vector.
   */
  setX(e) {
    return this.x = e, this;
  }
  /**
   * Sets the vector's y component to the given value
   *
   * @param {number} y - The value to set.
   * @return {Vector2} A reference to this vector.
   */
  setY(e) {
    return this.y = e, this;
  }
  /**
   * Allows to set a vector component with an index.
   *
   * @param {number} index - The component index. `0` equals to x, `1` equals to y.
   * @param {number} value - The value to set.
   * @return {Vector2} A reference to this vector.
   */
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      default:
        throw new Error("index is out of range: " + e);
    }
    return this;
  }
  /**
   * Returns the value of the vector component which matches the given index.
   *
   * @param {number} index - The component index. `0` equals to x, `1` equals to y.
   * @return {number} A vector component value.
   */
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  /**
   * Returns a new vector with copied values from this instance.
   *
   * @return {Vector2} A clone of this instance.
   */
  clone() {
    return new this.constructor(this.x, this.y);
  }
  /**
   * Copies the values of the given vector to this instance.
   *
   * @param {Vector2} v - The vector to copy.
   * @return {Vector2} A reference to this vector.
   */
  copy(e) {
    return this.x = e.x, this.y = e.y, this;
  }
  /**
   * Adds the given vector to this instance.
   *
   * @param {Vector2} v - The vector to add.
   * @return {Vector2} A reference to this vector.
   */
  add(e) {
    return this.x += e.x, this.y += e.y, this;
  }
  /**
   * Adds the given scalar value to all components of this instance.
   *
   * @param {number} s - The scalar to add.
   * @return {Vector2} A reference to this vector.
   */
  addScalar(e) {
    return this.x += e, this.y += e, this;
  }
  /**
   * Adds the given vectors and stores the result in this instance.
   *
   * @param {Vector2} a - The first vector.
   * @param {Vector2} b - The second vector.
   * @return {Vector2} A reference to this vector.
   */
  addVectors(e, t) {
    return this.x = e.x + t.x, this.y = e.y + t.y, this;
  }
  /**
   * Adds the given vector scaled by the given factor to this instance.
   *
   * @param {Vector2} v - The vector.
   * @param {number} s - The factor that scales `v`.
   * @return {Vector2} A reference to this vector.
   */
  addScaledVector(e, t) {
    return this.x += e.x * t, this.y += e.y * t, this;
  }
  /**
   * Subtracts the given vector from this instance.
   *
   * @param {Vector2} v - The vector to subtract.
   * @return {Vector2} A reference to this vector.
   */
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this;
  }
  /**
   * Subtracts the given scalar value from all components of this instance.
   *
   * @param {number} s - The scalar to subtract.
   * @return {Vector2} A reference to this vector.
   */
  subScalar(e) {
    return this.x -= e, this.y -= e, this;
  }
  /**
   * Subtracts the given vectors and stores the result in this instance.
   *
   * @param {Vector2} a - The first vector.
   * @param {Vector2} b - The second vector.
   * @return {Vector2} A reference to this vector.
   */
  subVectors(e, t) {
    return this.x = e.x - t.x, this.y = e.y - t.y, this;
  }
  /**
   * Multiplies the given vector with this instance.
   *
   * @param {Vector2} v - The vector to multiply.
   * @return {Vector2} A reference to this vector.
   */
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this;
  }
  /**
   * Multiplies the given scalar value with all components of this instance.
   *
   * @param {number} scalar - The scalar to multiply.
   * @return {Vector2} A reference to this vector.
   */
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this;
  }
  /**
   * Divides this instance by the given vector.
   *
   * @param {Vector2} v - The vector to divide.
   * @return {Vector2} A reference to this vector.
   */
  divide(e) {
    return this.x /= e.x, this.y /= e.y, this;
  }
  /**
   * Divides this vector by the given scalar.
   *
   * @param {number} scalar - The scalar to divide.
   * @return {Vector2} A reference to this vector.
   */
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  /**
   * Multiplies this vector (with an implicit 1 as the 3rd component) by
   * the given 3x3 matrix.
   *
   * @param {Matrix3} m - The matrix to apply.
   * @return {Vector2} A reference to this vector.
   */
  applyMatrix3(e) {
    const t = this.x, n = this.y, r = e.elements;
    return this.x = r[0] * t + r[3] * n + r[6], this.y = r[1] * t + r[4] * n + r[7], this;
  }
  /**
   * If this vector's x or y value is greater than the given vector's x or y
   * value, replace that value with the corresponding min value.
   *
   * @param {Vector2} v - The vector.
   * @return {Vector2} A reference to this vector.
   */
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this;
  }
  /**
   * If this vector's x or y value is less than the given vector's x or y
   * value, replace that value with the corresponding max value.
   *
   * @param {Vector2} v - The vector.
   * @return {Vector2} A reference to this vector.
   */
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this;
  }
  /**
   * If this vector's x or y value is greater than the max vector's x or y
   * value, it is replaced by the corresponding value.
   * If this vector's x or y value is less than the min vector's x or y value,
   * it is replaced by the corresponding value.
   *
   * @param {Vector2} min - The minimum x and y values.
   * @param {Vector2} max - The maximum x and y values in the desired range.
   * @return {Vector2} A reference to this vector.
   */
  clamp(e, t) {
    return this.x = Ge(this.x, e.x, t.x), this.y = Ge(this.y, e.y, t.y), this;
  }
  /**
   * If this vector's x or y values are greater than the max value, they are
   * replaced by the max value.
   * If this vector's x or y values are less than the min value, they are
   * replaced by the min value.
   *
   * @param {number} minVal - The minimum value the components will be clamped to.
   * @param {number} maxVal - The maximum value the components will be clamped to.
   * @return {Vector2} A reference to this vector.
   */
  clampScalar(e, t) {
    return this.x = Ge(this.x, e, t), this.y = Ge(this.y, e, t), this;
  }
  /**
   * If this vector's length is greater than the max value, it is replaced by
   * the max value.
   * If this vector's length is less than the min value, it is replaced by the
   * min value.
   *
   * @param {number} min - The minimum value the vector length will be clamped to.
   * @param {number} max - The maximum value the vector length will be clamped to.
   * @return {Vector2} A reference to this vector.
   */
  clampLength(e, t) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Ge(n, e, t));
  }
  /**
   * The components of this vector are rounded down to the nearest integer value.
   *
   * @return {Vector2} A reference to this vector.
   */
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
  }
  /**
   * The components of this vector are rounded up to the nearest integer value.
   *
   * @return {Vector2} A reference to this vector.
   */
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
  }
  /**
   * The components of this vector are rounded to the nearest integer value
   *
   * @return {Vector2} A reference to this vector.
   */
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
  }
  /**
   * The components of this vector are rounded towards zero (up if negative,
   * down if positive) to an integer value.
   *
   * @return {Vector2} A reference to this vector.
   */
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this;
  }
  /**
   * Inverts this vector - i.e. sets x = -x and y = -y.
   *
   * @return {Vector2} A reference to this vector.
   */
  negate() {
    return this.x = -this.x, this.y = -this.y, this;
  }
  /**
   * Calculates the dot product of the given vector with this instance.
   *
   * @param {Vector2} v - The vector to compute the dot product with.
   * @return {number} The result of the dot product.
   */
  dot(e) {
    return this.x * e.x + this.y * e.y;
  }
  /**
   * Calculates the cross product of the given vector with this instance.
   *
   * @param {Vector2} v - The vector to compute the cross product with.
   * @return {number} The result of the cross product.
   */
  cross(e) {
    return this.x * e.y - this.y * e.x;
  }
  /**
   * Computes the square of the Euclidean length (straight-line length) from
   * (0, 0) to (x, y). If you are comparing the lengths of vectors, you should
   * compare the length squared instead as it is slightly more efficient to calculate.
   *
   * @return {number} The square length of this vector.
   */
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }
  /**
   * Computes the  Euclidean length (straight-line length) from (0, 0) to (x, y).
   *
   * @return {number} The length of this vector.
   */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  /**
   * Computes the Manhattan length of this vector.
   *
   * @return {number} The length of this vector.
   */
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }
  /**
   * Converts this vector to a unit vector - that is, sets it equal to a vector
   * with the same direction as this one, but with a vector length of `1`.
   *
   * @return {Vector2} A reference to this vector.
   */
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  /**
   * Computes the angle in radians of this vector with respect to the positive x-axis.
   *
   * @return {number} The angle in radians.
   */
  angle() {
    return Math.atan2(-this.y, -this.x) + Math.PI;
  }
  /**
   * Returns the angle between the given vector and this instance in radians.
   *
   * @param {Vector2} v - The vector to compute the angle with.
   * @return {number} The angle in radians.
   */
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0) return Math.PI / 2;
    const n = this.dot(e) / t;
    return Math.acos(Ge(n, -1, 1));
  }
  /**
   * Computes the distance from the given vector to this instance.
   *
   * @param {Vector2} v - The vector to compute the distance to.
   * @return {number} The distance.
   */
  distanceTo(e) {
    return Math.sqrt(this.distanceToSquared(e));
  }
  /**
   * Computes the squared distance from the given vector to this instance.
   * If you are just comparing the distance with another distance, you should compare
   * the distance squared instead as it is slightly more efficient to calculate.
   *
   * @param {Vector2} v - The vector to compute the squared distance to.
   * @return {number} The squared distance.
   */
  distanceToSquared(e) {
    const t = this.x - e.x, n = this.y - e.y;
    return t * t + n * n;
  }
  /**
   * Computes the Manhattan distance from the given vector to this instance.
   *
   * @param {Vector2} v - The vector to compute the Manhattan distance to.
   * @return {number} The Manhattan distance.
   */
  manhattanDistanceTo(e) {
    return Math.abs(this.x - e.x) + Math.abs(this.y - e.y);
  }
  /**
   * Sets this vector to a vector with the same direction as this one, but
   * with the specified length.
   *
   * @param {number} length - The new length of this vector.
   * @return {Vector2} A reference to this vector.
   */
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  /**
   * Linearly interpolates between the given vector and this instance, where
   * alpha is the percent distance along the line - alpha = 0 will be this
   * vector, and alpha = 1 will be the given one.
   *
   * @param {Vector2} v - The vector to interpolate towards.
   * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
   * @return {Vector2} A reference to this vector.
   */
  lerp(e, t) {
    return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this;
  }
  /**
   * Linearly interpolates between the given vectors, where alpha is the percent
   * distance along the line - alpha = 0 will be first vector, and alpha = 1 will
   * be the second one. The result is stored in this instance.
   *
   * @param {Vector2} v1 - The first vector.
   * @param {Vector2} v2 - The second vector.
   * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
   * @return {Vector2} A reference to this vector.
   */
  lerpVectors(e, t, n) {
    return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this;
  }
  /**
   * Returns `true` if this vector is equal with the given one.
   *
   * @param {Vector2} v - The vector to test for equality.
   * @return {boolean} Whether this vector is equal with the given one.
   */
  equals(e) {
    return e.x === this.x && e.y === this.y;
  }
  /**
   * Sets this vector's x value to be `array[ offset ]` and y
   * value to be `array[ offset + 1 ]`.
   *
   * @param {Array<number>} array - An array holding the vector component values.
   * @param {number} [offset=0] - The offset into the array.
   * @return {Vector2} A reference to this vector.
   */
  fromArray(e, t = 0) {
    return this.x = e[t], this.y = e[t + 1], this;
  }
  /**
   * Writes the components of this vector to the given array. If no array is provided,
   * the method returns a new instance.
   *
   * @param {Array<number>} [array=[]] - The target array holding the vector components.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Array<number>} The vector components.
   */
  toArray(e = [], t = 0) {
    return e[t] = this.x, e[t + 1] = this.y, e;
  }
  /**
   * Sets the components of this vector from the given buffer attribute.
   *
   * @param {BufferAttribute} attribute - The buffer attribute holding vector data.
   * @param {number} index - The index into the attribute.
   * @return {Vector2} A reference to this vector.
   */
  fromBufferAttribute(e, t) {
    return this.x = e.getX(t), this.y = e.getY(t), this;
  }
  /**
   * Rotates this vector around the given center by the given angle.
   *
   * @param {Vector2} center - The point around which to rotate.
   * @param {number} angle - The angle to rotate, in radians.
   * @return {Vector2} A reference to this vector.
   */
  rotateAround(e, t) {
    const n = Math.cos(t), r = Math.sin(t), s = this.x - e.x, a = this.y - e.y;
    return this.x = s * n - a * r + e.x, this.y = s * r + a * n + e.y, this;
  }
  /**
   * Sets each component of this vector to a pseudo-random value between `0` and
   * `1`, excluding `1`.
   *
   * @return {Vector2} A reference to this vector.
   */
  random() {
    return this.x = Math.random(), this.y = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y;
  }
}
class Ei {
  /**
   * Constructs a new quaternion.
   *
   * @param {number} [x=0] - The x value of this quaternion.
   * @param {number} [y=0] - The y value of this quaternion.
   * @param {number} [z=0] - The z value of this quaternion.
   * @param {number} [w=1] - The w value of this quaternion.
   */
  constructor(e = 0, t = 0, n = 0, r = 1) {
    this.isQuaternion = !0, this._x = e, this._y = t, this._z = n, this._w = r;
  }
  /**
   * Interpolates between two quaternions via SLERP. This implementation assumes the
   * quaternion data are managed  in flat arrays.
   *
   * @param {Array<number>} dst - The destination array.
   * @param {number} dstOffset - An offset into the destination array.
   * @param {Array<number>} src0 - The source array of the first quaternion.
   * @param {number} srcOffset0 - An offset into the first source array.
   * @param {Array<number>} src1 -  The source array of the second quaternion.
   * @param {number} srcOffset1 - An offset into the second source array.
   * @param {number} t - The interpolation factor in the range `[0,1]`.
   * @see {@link Quaternion#slerp}
   */
  static slerpFlat(e, t, n, r, s, a, o) {
    let l = n[r + 0], c = n[r + 1], h = n[r + 2], d = n[r + 3];
    const u = s[a + 0], p = s[a + 1], g = s[a + 2], _ = s[a + 3];
    if (o === 0) {
      e[t + 0] = l, e[t + 1] = c, e[t + 2] = h, e[t + 3] = d;
      return;
    }
    if (o === 1) {
      e[t + 0] = u, e[t + 1] = p, e[t + 2] = g, e[t + 3] = _;
      return;
    }
    if (d !== _ || l !== u || c !== p || h !== g) {
      let m = 1 - o;
      const f = l * u + c * p + h * g + d * _, T = f >= 0 ? 1 : -1, b = 1 - f * f;
      if (b > Number.EPSILON) {
        const w = Math.sqrt(b), R = Math.atan2(w, f * T);
        m = Math.sin(m * R) / w, o = Math.sin(o * R) / w;
      }
      const y = o * T;
      if (l = l * m + u * y, c = c * m + p * y, h = h * m + g * y, d = d * m + _ * y, m === 1 - o) {
        const w = 1 / Math.sqrt(l * l + c * c + h * h + d * d);
        l *= w, c *= w, h *= w, d *= w;
      }
    }
    e[t] = l, e[t + 1] = c, e[t + 2] = h, e[t + 3] = d;
  }
  /**
   * Multiplies two quaternions. This implementation assumes the quaternion data are managed
   * in flat arrays.
   *
   * @param {Array<number>} dst - The destination array.
   * @param {number} dstOffset - An offset into the destination array.
   * @param {Array<number>} src0 - The source array of the first quaternion.
   * @param {number} srcOffset0 - An offset into the first source array.
   * @param {Array<number>} src1 -  The source array of the second quaternion.
   * @param {number} srcOffset1 - An offset into the second source array.
   * @return {Array<number>} The destination array.
   * @see {@link Quaternion#multiplyQuaternions}.
   */
  static multiplyQuaternionsFlat(e, t, n, r, s, a) {
    const o = n[r], l = n[r + 1], c = n[r + 2], h = n[r + 3], d = s[a], u = s[a + 1], p = s[a + 2], g = s[a + 3];
    return e[t] = o * g + h * d + l * p - c * u, e[t + 1] = l * g + h * u + c * d - o * p, e[t + 2] = c * g + h * p + o * u - l * d, e[t + 3] = h * g - o * d - l * u - c * p, e;
  }
  /**
   * The x value of this quaternion.
   *
   * @type {number}
   * @default 0
   */
  get x() {
    return this._x;
  }
  set x(e) {
    this._x = e, this._onChangeCallback();
  }
  /**
   * The y value of this quaternion.
   *
   * @type {number}
   * @default 0
   */
  get y() {
    return this._y;
  }
  set y(e) {
    this._y = e, this._onChangeCallback();
  }
  /**
   * The z value of this quaternion.
   *
   * @type {number}
   * @default 0
   */
  get z() {
    return this._z;
  }
  set z(e) {
    this._z = e, this._onChangeCallback();
  }
  /**
   * The w value of this quaternion.
   *
   * @type {number}
   * @default 1
   */
  get w() {
    return this._w;
  }
  set w(e) {
    this._w = e, this._onChangeCallback();
  }
  /**
   * Sets the quaternion components.
   *
   * @param {number} x - The x value of this quaternion.
   * @param {number} y - The y value of this quaternion.
   * @param {number} z - The z value of this quaternion.
   * @param {number} w - The w value of this quaternion.
   * @return {Quaternion} A reference to this quaternion.
   */
  set(e, t, n, r) {
    return this._x = e, this._y = t, this._z = n, this._w = r, this._onChangeCallback(), this;
  }
  /**
   * Returns a new quaternion with copied values from this instance.
   *
   * @return {Quaternion} A clone of this instance.
   */
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._w);
  }
  /**
   * Copies the values of the given quaternion to this instance.
   *
   * @param {Quaternion} quaternion - The quaternion to copy.
   * @return {Quaternion} A reference to this quaternion.
   */
  copy(e) {
    return this._x = e.x, this._y = e.y, this._z = e.z, this._w = e.w, this._onChangeCallback(), this;
  }
  /**
   * Sets this quaternion from the rotation specified by the given
   * Euler angles.
   *
   * @param {Euler} euler - The Euler angles.
   * @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
   * @return {Quaternion} A reference to this quaternion.
   */
  setFromEuler(e, t = !0) {
    const n = e._x, r = e._y, s = e._z, a = e._order, o = Math.cos, l = Math.sin, c = o(n / 2), h = o(r / 2), d = o(s / 2), u = l(n / 2), p = l(r / 2), g = l(s / 2);
    switch (a) {
      case "XYZ":
        this._x = u * h * d + c * p * g, this._y = c * p * d - u * h * g, this._z = c * h * g + u * p * d, this._w = c * h * d - u * p * g;
        break;
      case "YXZ":
        this._x = u * h * d + c * p * g, this._y = c * p * d - u * h * g, this._z = c * h * g - u * p * d, this._w = c * h * d + u * p * g;
        break;
      case "ZXY":
        this._x = u * h * d - c * p * g, this._y = c * p * d + u * h * g, this._z = c * h * g + u * p * d, this._w = c * h * d - u * p * g;
        break;
      case "ZYX":
        this._x = u * h * d - c * p * g, this._y = c * p * d + u * h * g, this._z = c * h * g - u * p * d, this._w = c * h * d + u * p * g;
        break;
      case "YZX":
        this._x = u * h * d + c * p * g, this._y = c * p * d + u * h * g, this._z = c * h * g - u * p * d, this._w = c * h * d - u * p * g;
        break;
      case "XZY":
        this._x = u * h * d - c * p * g, this._y = c * p * d - u * h * g, this._z = c * h * g + u * p * d, this._w = c * h * d + u * p * g;
        break;
      default:
        console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + a);
    }
    return t === !0 && this._onChangeCallback(), this;
  }
  /**
   * Sets this quaternion from the given axis and angle.
   *
   * @param {Vector3} axis - The normalized axis.
   * @param {number} angle - The angle in radians.
   * @return {Quaternion} A reference to this quaternion.
   */
  setFromAxisAngle(e, t) {
    const n = t / 2, r = Math.sin(n);
    return this._x = e.x * r, this._y = e.y * r, this._z = e.z * r, this._w = Math.cos(n), this._onChangeCallback(), this;
  }
  /**
   * Sets this quaternion from the given rotation matrix.
   *
   * @param {Matrix4} m - A 4x4 matrix of which the upper 3x3 of matrix is a pure rotation matrix (i.e. unscaled).
   * @return {Quaternion} A reference to this quaternion.
   */
  setFromRotationMatrix(e) {
    const t = e.elements, n = t[0], r = t[4], s = t[8], a = t[1], o = t[5], l = t[9], c = t[2], h = t[6], d = t[10], u = n + o + d;
    if (u > 0) {
      const p = 0.5 / Math.sqrt(u + 1);
      this._w = 0.25 / p, this._x = (h - l) * p, this._y = (s - c) * p, this._z = (a - r) * p;
    } else if (n > o && n > d) {
      const p = 2 * Math.sqrt(1 + n - o - d);
      this._w = (h - l) / p, this._x = 0.25 * p, this._y = (r + a) / p, this._z = (s + c) / p;
    } else if (o > d) {
      const p = 2 * Math.sqrt(1 + o - n - d);
      this._w = (s - c) / p, this._x = (r + a) / p, this._y = 0.25 * p, this._z = (l + h) / p;
    } else {
      const p = 2 * Math.sqrt(1 + d - n - o);
      this._w = (a - r) / p, this._x = (s + c) / p, this._y = (l + h) / p, this._z = 0.25 * p;
    }
    return this._onChangeCallback(), this;
  }
  /**
   * Sets this quaternion to the rotation required to rotate the direction vector
   * `vFrom` to the direction vector `vTo`.
   *
   * @param {Vector3} vFrom - The first (normalized) direction vector.
   * @param {Vector3} vTo - The second (normalized) direction vector.
   * @return {Quaternion} A reference to this quaternion.
   */
  setFromUnitVectors(e, t) {
    let n = e.dot(t) + 1;
    return n < 1e-8 ? (n = 0, Math.abs(e.x) > Math.abs(e.z) ? (this._x = -e.y, this._y = e.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -e.z, this._z = e.y, this._w = n)) : (this._x = e.y * t.z - e.z * t.y, this._y = e.z * t.x - e.x * t.z, this._z = e.x * t.y - e.y * t.x, this._w = n), this.normalize();
  }
  /**
   * Returns the angle between this quaternion and the given one in radians.
   *
   * @param {Quaternion} q - The quaternion to compute the angle with.
   * @return {number} The angle in radians.
   */
  angleTo(e) {
    return 2 * Math.acos(Math.abs(Ge(this.dot(e), -1, 1)));
  }
  /**
   * Rotates this quaternion by a given angular step to the given quaternion.
   * The method ensures that the final quaternion will not overshoot `q`.
   *
   * @param {Quaternion} q - The target quaternion.
   * @param {number} step - The angular step in radians.
   * @return {Quaternion} A reference to this quaternion.
   */
  rotateTowards(e, t) {
    const n = this.angleTo(e);
    if (n === 0) return this;
    const r = Math.min(1, t / n);
    return this.slerp(e, r), this;
  }
  /**
   * Sets this quaternion to the identity quaternion; that is, to the
   * quaternion that represents "no rotation".
   *
   * @return {Quaternion} A reference to this quaternion.
   */
  identity() {
    return this.set(0, 0, 0, 1);
  }
  /**
   * Inverts this quaternion via {@link Quaternion#conjugate}. The
   * quaternion is assumed to have unit length.
   *
   * @return {Quaternion} A reference to this quaternion.
   */
  invert() {
    return this.conjugate();
  }
  /**
   * Returns the rotational conjugate of this quaternion. The conjugate of a
   * quaternion represents the same rotation in the opposite direction about
   * the rotational axis.
   *
   * @return {Quaternion} A reference to this quaternion.
   */
  conjugate() {
    return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
  }
  /**
   * Calculates the dot product of this quaternion and the given one.
   *
   * @param {Quaternion} v - The quaternion to compute the dot product with.
   * @return {number} The result of the dot product.
   */
  dot(e) {
    return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w;
  }
  /**
   * Computes the squared Euclidean length (straight-line length) of this quaternion,
   * considered as a 4 dimensional vector. This can be useful if you are comparing the
   * lengths of two quaternions, as this is a slightly more efficient calculation than
   * {@link Quaternion#length}.
   *
   * @return {number} The squared Euclidean length.
   */
  lengthSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
  }
  /**
   * Computes the Euclidean length (straight-line length) of this quaternion,
   * considered as a 4 dimensional vector.
   *
   * @return {number} The Euclidean length.
   */
  length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
  }
  /**
   * Normalizes this quaternion - that is, calculated the quaternion that performs
   * the same rotation as this one, but has a length equal to `1`.
   *
   * @return {Quaternion} A reference to this quaternion.
   */
  normalize() {
    let e = this.length();
    return e === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (e = 1 / e, this._x = this._x * e, this._y = this._y * e, this._z = this._z * e, this._w = this._w * e), this._onChangeCallback(), this;
  }
  /**
   * Multiplies this quaternion by the given one.
   *
   * @param {Quaternion} q - The quaternion.
   * @return {Quaternion} A reference to this quaternion.
   */
  multiply(e) {
    return this.multiplyQuaternions(this, e);
  }
  /**
   * Pre-multiplies this quaternion by the given one.
   *
   * @param {Quaternion} q - The quaternion.
   * @return {Quaternion} A reference to this quaternion.
   */
  premultiply(e) {
    return this.multiplyQuaternions(e, this);
  }
  /**
   * Multiplies the given quaternions and stores the result in this instance.
   *
   * @param {Quaternion} a - The first quaternion.
   * @param {Quaternion} b - The second quaternion.
   * @return {Quaternion} A reference to this quaternion.
   */
  multiplyQuaternions(e, t) {
    const n = e._x, r = e._y, s = e._z, a = e._w, o = t._x, l = t._y, c = t._z, h = t._w;
    return this._x = n * h + a * o + r * c - s * l, this._y = r * h + a * l + s * o - n * c, this._z = s * h + a * c + n * l - r * o, this._w = a * h - n * o - r * l - s * c, this._onChangeCallback(), this;
  }
  /**
   * Performs a spherical linear interpolation between quaternions.
   *
   * @param {Quaternion} qb - The target quaternion.
   * @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
   * @return {Quaternion} A reference to this quaternion.
   */
  slerp(e, t) {
    if (t === 0) return this;
    if (t === 1) return this.copy(e);
    const n = this._x, r = this._y, s = this._z, a = this._w;
    let o = a * e._w + n * e._x + r * e._y + s * e._z;
    if (o < 0 ? (this._w = -e._w, this._x = -e._x, this._y = -e._y, this._z = -e._z, o = -o) : this.copy(e), o >= 1)
      return this._w = a, this._x = n, this._y = r, this._z = s, this;
    const l = 1 - o * o;
    if (l <= Number.EPSILON) {
      const p = 1 - t;
      return this._w = p * a + t * this._w, this._x = p * n + t * this._x, this._y = p * r + t * this._y, this._z = p * s + t * this._z, this.normalize(), this;
    }
    const c = Math.sqrt(l), h = Math.atan2(c, o), d = Math.sin((1 - t) * h) / c, u = Math.sin(t * h) / c;
    return this._w = a * d + this._w * u, this._x = n * d + this._x * u, this._y = r * d + this._y * u, this._z = s * d + this._z * u, this._onChangeCallback(), this;
  }
  /**
   * Performs a spherical linear interpolation between the given quaternions
   * and stores the result in this quaternion.
   *
   * @param {Quaternion} qa - The source quaternion.
   * @param {Quaternion} qb - The target quaternion.
   * @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
   * @return {Quaternion} A reference to this quaternion.
   */
  slerpQuaternions(e, t, n) {
    return this.copy(e).slerp(t, n);
  }
  /**
   * Sets this quaternion to a uniformly random, normalized quaternion.
   *
   * @return {Quaternion} A reference to this quaternion.
   */
  random() {
    const e = 2 * Math.PI * Math.random(), t = 2 * Math.PI * Math.random(), n = Math.random(), r = Math.sqrt(1 - n), s = Math.sqrt(n);
    return this.set(
      r * Math.sin(e),
      r * Math.cos(e),
      s * Math.sin(t),
      s * Math.cos(t)
    );
  }
  /**
   * Returns `true` if this quaternion is equal with the given one.
   *
   * @param {Quaternion} quaternion - The quaternion to test for equality.
   * @return {boolean} Whether this quaternion is equal with the given one.
   */
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w;
  }
  /**
   * Sets this quaternion's components from the given array.
   *
   * @param {Array<number>} array - An array holding the quaternion component values.
   * @param {number} [offset=0] - The offset into the array.
   * @return {Quaternion} A reference to this quaternion.
   */
  fromArray(e, t = 0) {
    return this._x = e[t], this._y = e[t + 1], this._z = e[t + 2], this._w = e[t + 3], this._onChangeCallback(), this;
  }
  /**
   * Writes the components of this quaternion to the given array. If no array is provided,
   * the method returns a new instance.
   *
   * @param {Array<number>} [array=[]] - The target array holding the quaternion components.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Array<number>} The quaternion components.
   */
  toArray(e = [], t = 0) {
    return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._w, e;
  }
  /**
   * Sets the components of this quaternion from the given buffer attribute.
   *
   * @param {BufferAttribute} attribute - The buffer attribute holding quaternion data.
   * @param {number} index - The index into the attribute.
   * @return {Quaternion} A reference to this quaternion.
   */
  fromBufferAttribute(e, t) {
    return this._x = e.getX(t), this._y = e.getY(t), this._z = e.getZ(t), this._w = e.getW(t), this._onChangeCallback(), this;
  }
  /**
   * This methods defines the serialization result of this class. Returns the
   * numerical elements of this quaternion in an array of format `[x, y, z, w]`.
   *
   * @return {Array<number>} The serialized quaternion.
   */
  toJSON() {
    return this.toArray();
  }
  _onChange(e) {
    return this._onChangeCallback = e, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._w;
  }
}
class N {
  /**
   * Constructs a new 3D vector.
   *
   * @param {number} [x=0] - The x value of this vector.
   * @param {number} [y=0] - The y value of this vector.
   * @param {number} [z=0] - The z value of this vector.
   */
  constructor(e = 0, t = 0, n = 0) {
    N.prototype.isVector3 = !0, this.x = e, this.y = t, this.z = n;
  }
  /**
   * Sets the vector components.
   *
   * @param {number} x - The value of the x component.
   * @param {number} y - The value of the y component.
   * @param {number} z - The value of the z component.
   * @return {Vector3} A reference to this vector.
   */
  set(e, t, n) {
    return n === void 0 && (n = this.z), this.x = e, this.y = t, this.z = n, this;
  }
  /**
   * Sets the vector components to the same value.
   *
   * @param {number} scalar - The value to set for all vector components.
   * @return {Vector3} A reference to this vector.
   */
  setScalar(e) {
    return this.x = e, this.y = e, this.z = e, this;
  }
  /**
   * Sets the vector's x component to the given value
   *
   * @param {number} x - The value to set.
   * @return {Vector3} A reference to this vector.
   */
  setX(e) {
    return this.x = e, this;
  }
  /**
   * Sets the vector's y component to the given value
   *
   * @param {number} y - The value to set.
   * @return {Vector3} A reference to this vector.
   */
  setY(e) {
    return this.y = e, this;
  }
  /**
   * Sets the vector's z component to the given value
   *
   * @param {number} z - The value to set.
   * @return {Vector3} A reference to this vector.
   */
  setZ(e) {
    return this.z = e, this;
  }
  /**
   * Allows to set a vector component with an index.
   *
   * @param {number} index - The component index. `0` equals to x, `1` equals to y, `2` equals to z.
   * @param {number} value - The value to set.
   * @return {Vector3} A reference to this vector.
   */
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      case 2:
        this.z = t;
        break;
      default:
        throw new Error("index is out of range: " + e);
    }
    return this;
  }
  /**
   * Returns the value of the vector component which matches the given index.
   *
   * @param {number} index - The component index. `0` equals to x, `1` equals to y, `2` equals to z.
   * @return {number} A vector component value.
   */
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  /**
   * Returns a new vector with copied values from this instance.
   *
   * @return {Vector3} A clone of this instance.
   */
  clone() {
    return new this.constructor(this.x, this.y, this.z);
  }
  /**
   * Copies the values of the given vector to this instance.
   *
   * @param {Vector3} v - The vector to copy.
   * @return {Vector3} A reference to this vector.
   */
  copy(e) {
    return this.x = e.x, this.y = e.y, this.z = e.z, this;
  }
  /**
   * Adds the given vector to this instance.
   *
   * @param {Vector3} v - The vector to add.
   * @return {Vector3} A reference to this vector.
   */
  add(e) {
    return this.x += e.x, this.y += e.y, this.z += e.z, this;
  }
  /**
   * Adds the given scalar value to all components of this instance.
   *
   * @param {number} s - The scalar to add.
   * @return {Vector3} A reference to this vector.
   */
  addScalar(e) {
    return this.x += e, this.y += e, this.z += e, this;
  }
  /**
   * Adds the given vectors and stores the result in this instance.
   *
   * @param {Vector3} a - The first vector.
   * @param {Vector3} b - The second vector.
   * @return {Vector3} A reference to this vector.
   */
  addVectors(e, t) {
    return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this;
  }
  /**
   * Adds the given vector scaled by the given factor to this instance.
   *
   * @param {Vector3|Vector4} v - The vector.
   * @param {number} s - The factor that scales `v`.
   * @return {Vector3} A reference to this vector.
   */
  addScaledVector(e, t) {
    return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this;
  }
  /**
   * Subtracts the given vector from this instance.
   *
   * @param {Vector3} v - The vector to subtract.
   * @return {Vector3} A reference to this vector.
   */
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this.z -= e.z, this;
  }
  /**
   * Subtracts the given scalar value from all components of this instance.
   *
   * @param {number} s - The scalar to subtract.
   * @return {Vector3} A reference to this vector.
   */
  subScalar(e) {
    return this.x -= e, this.y -= e, this.z -= e, this;
  }
  /**
   * Subtracts the given vectors and stores the result in this instance.
   *
   * @param {Vector3} a - The first vector.
   * @param {Vector3} b - The second vector.
   * @return {Vector3} A reference to this vector.
   */
  subVectors(e, t) {
    return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this;
  }
  /**
   * Multiplies the given vector with this instance.
   *
   * @param {Vector3} v - The vector to multiply.
   * @return {Vector3} A reference to this vector.
   */
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this.z *= e.z, this;
  }
  /**
   * Multiplies the given scalar value with all components of this instance.
   *
   * @param {number} scalar - The scalar to multiply.
   * @return {Vector3} A reference to this vector.
   */
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this.z *= e, this;
  }
  /**
   * Multiplies the given vectors and stores the result in this instance.
   *
   * @param {Vector3} a - The first vector.
   * @param {Vector3} b - The second vector.
   * @return {Vector3} A reference to this vector.
   */
  multiplyVectors(e, t) {
    return this.x = e.x * t.x, this.y = e.y * t.y, this.z = e.z * t.z, this;
  }
  /**
   * Applies the given Euler rotation to this vector.
   *
   * @param {Euler} euler - The Euler angles.
   * @return {Vector3} A reference to this vector.
   */
  applyEuler(e) {
    return this.applyQuaternion(Go.setFromEuler(e));
  }
  /**
   * Applies a rotation specified by an axis and an angle to this vector.
   *
   * @param {Vector3} axis - A normalized vector representing the rotation axis.
   * @param {number} angle - The angle in radians.
   * @return {Vector3} A reference to this vector.
   */
  applyAxisAngle(e, t) {
    return this.applyQuaternion(Go.setFromAxisAngle(e, t));
  }
  /**
   * Multiplies this vector with the given 3x3 matrix.
   *
   * @param {Matrix3} m - The 3x3 matrix.
   * @return {Vector3} A reference to this vector.
   */
  applyMatrix3(e) {
    const t = this.x, n = this.y, r = this.z, s = e.elements;
    return this.x = s[0] * t + s[3] * n + s[6] * r, this.y = s[1] * t + s[4] * n + s[7] * r, this.z = s[2] * t + s[5] * n + s[8] * r, this;
  }
  /**
   * Multiplies this vector by the given normal matrix and normalizes
   * the result.
   *
   * @param {Matrix3} m - The normal matrix.
   * @return {Vector3} A reference to this vector.
   */
  applyNormalMatrix(e) {
    return this.applyMatrix3(e).normalize();
  }
  /**
   * Multiplies this vector (with an implicit 1 in the 4th dimension) by m, and
   * divides by perspective.
   *
   * @param {Matrix4} m - The matrix to apply.
   * @return {Vector3} A reference to this vector.
   */
  applyMatrix4(e) {
    const t = this.x, n = this.y, r = this.z, s = e.elements, a = 1 / (s[3] * t + s[7] * n + s[11] * r + s[15]);
    return this.x = (s[0] * t + s[4] * n + s[8] * r + s[12]) * a, this.y = (s[1] * t + s[5] * n + s[9] * r + s[13]) * a, this.z = (s[2] * t + s[6] * n + s[10] * r + s[14]) * a, this;
  }
  /**
   * Applies the given Quaternion to this vector.
   *
   * @param {Quaternion} q - The Quaternion.
   * @return {Vector3} A reference to this vector.
   */
  applyQuaternion(e) {
    const t = this.x, n = this.y, r = this.z, s = e.x, a = e.y, o = e.z, l = e.w, c = 2 * (a * r - o * n), h = 2 * (o * t - s * r), d = 2 * (s * n - a * t);
    return this.x = t + l * c + a * d - o * h, this.y = n + l * h + o * c - s * d, this.z = r + l * d + s * h - a * c, this;
  }
  /**
   * Projects this vector from world space into the camera's normalized
   * device coordinate (NDC) space.
   *
   * @param {Camera} camera - The camera.
   * @return {Vector3} A reference to this vector.
   */
  project(e) {
    return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix);
  }
  /**
   * Unprojects this vector from the camera's normalized device coordinate (NDC)
   * space into world space.
   *
   * @param {Camera} camera - The camera.
   * @return {Vector3} A reference to this vector.
   */
  unproject(e) {
    return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld);
  }
  /**
   * Transforms the direction of this vector by a matrix (the upper left 3 x 3
   * subset of the given 4x4 matrix and then normalizes the result.
   *
   * @param {Matrix4} m - The matrix.
   * @return {Vector3} A reference to this vector.
   */
  transformDirection(e) {
    const t = this.x, n = this.y, r = this.z, s = e.elements;
    return this.x = s[0] * t + s[4] * n + s[8] * r, this.y = s[1] * t + s[5] * n + s[9] * r, this.z = s[2] * t + s[6] * n + s[10] * r, this.normalize();
  }
  /**
   * Divides this instance by the given vector.
   *
   * @param {Vector3} v - The vector to divide.
   * @return {Vector3} A reference to this vector.
   */
  divide(e) {
    return this.x /= e.x, this.y /= e.y, this.z /= e.z, this;
  }
  /**
   * Divides this vector by the given scalar.
   *
   * @param {number} scalar - The scalar to divide.
   * @return {Vector3} A reference to this vector.
   */
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  /**
   * If this vector's x, y or z value is greater than the given vector's x, y or z
   * value, replace that value with the corresponding min value.
   *
   * @param {Vector3} v - The vector.
   * @return {Vector3} A reference to this vector.
   */
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this;
  }
  /**
   * If this vector's x, y or z value is less than the given vector's x, y or z
   * value, replace that value with the corresponding max value.
   *
   * @param {Vector3} v - The vector.
   * @return {Vector3} A reference to this vector.
   */
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this;
  }
  /**
   * If this vector's x, y or z value is greater than the max vector's x, y or z
   * value, it is replaced by the corresponding value.
   * If this vector's x, y or z value is less than the min vector's x, y or z value,
   * it is replaced by the corresponding value.
   *
   * @param {Vector3} min - The minimum x, y and z values.
   * @param {Vector3} max - The maximum x, y and z values in the desired range.
   * @return {Vector3} A reference to this vector.
   */
  clamp(e, t) {
    return this.x = Ge(this.x, e.x, t.x), this.y = Ge(this.y, e.y, t.y), this.z = Ge(this.z, e.z, t.z), this;
  }
  /**
   * If this vector's x, y or z values are greater than the max value, they are
   * replaced by the max value.
   * If this vector's x, y or z values are less than the min value, they are
   * replaced by the min value.
   *
   * @param {number} minVal - The minimum value the components will be clamped to.
   * @param {number} maxVal - The maximum value the components will be clamped to.
   * @return {Vector3} A reference to this vector.
   */
  clampScalar(e, t) {
    return this.x = Ge(this.x, e, t), this.y = Ge(this.y, e, t), this.z = Ge(this.z, e, t), this;
  }
  /**
   * If this vector's length is greater than the max value, it is replaced by
   * the max value.
   * If this vector's length is less than the min value, it is replaced by the
   * min value.
   *
   * @param {number} min - The minimum value the vector length will be clamped to.
   * @param {number} max - The maximum value the vector length will be clamped to.
   * @return {Vector3} A reference to this vector.
   */
  clampLength(e, t) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Ge(n, e, t));
  }
  /**
   * The components of this vector are rounded down to the nearest integer value.
   *
   * @return {Vector3} A reference to this vector.
   */
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this;
  }
  /**
   * The components of this vector are rounded up to the nearest integer value.
   *
   * @return {Vector3} A reference to this vector.
   */
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this;
  }
  /**
   * The components of this vector are rounded to the nearest integer value
   *
   * @return {Vector3} A reference to this vector.
   */
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this;
  }
  /**
   * The components of this vector are rounded towards zero (up if negative,
   * down if positive) to an integer value.
   *
   * @return {Vector3} A reference to this vector.
   */
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this;
  }
  /**
   * Inverts this vector - i.e. sets x = -x, y = -y and z = -z.
   *
   * @return {Vector3} A reference to this vector.
   */
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
  }
  /**
   * Calculates the dot product of the given vector with this instance.
   *
   * @param {Vector3} v - The vector to compute the dot product with.
   * @return {number} The result of the dot product.
   */
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z;
  }
  // TODO lengthSquared?
  /**
   * Computes the square of the Euclidean length (straight-line length) from
   * (0, 0, 0) to (x, y, z). If you are comparing the lengths of vectors, you should
   * compare the length squared instead as it is slightly more efficient to calculate.
   *
   * @return {number} The square length of this vector.
   */
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  /**
   * Computes the  Euclidean length (straight-line length) from (0, 0, 0) to (x, y, z).
   *
   * @return {number} The length of this vector.
   */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  /**
   * Computes the Manhattan length of this vector.
   *
   * @return {number} The length of this vector.
   */
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }
  /**
   * Converts this vector to a unit vector - that is, sets it equal to a vector
   * with the same direction as this one, but with a vector length of `1`.
   *
   * @return {Vector3} A reference to this vector.
   */
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  /**
   * Sets this vector to a vector with the same direction as this one, but
   * with the specified length.
   *
   * @param {number} length - The new length of this vector.
   * @return {Vector3} A reference to this vector.
   */
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  /**
   * Linearly interpolates between the given vector and this instance, where
   * alpha is the percent distance along the line - alpha = 0 will be this
   * vector, and alpha = 1 will be the given one.
   *
   * @param {Vector3} v - The vector to interpolate towards.
   * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
   * @return {Vector3} A reference to this vector.
   */
  lerp(e, t) {
    return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this;
  }
  /**
   * Linearly interpolates between the given vectors, where alpha is the percent
   * distance along the line - alpha = 0 will be first vector, and alpha = 1 will
   * be the second one. The result is stored in this instance.
   *
   * @param {Vector3} v1 - The first vector.
   * @param {Vector3} v2 - The second vector.
   * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
   * @return {Vector3} A reference to this vector.
   */
  lerpVectors(e, t, n) {
    return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this;
  }
  /**
   * Calculates the cross product of the given vector with this instance.
   *
   * @param {Vector3} v - The vector to compute the cross product with.
   * @return {Vector3} The result of the cross product.
   */
  cross(e) {
    return this.crossVectors(this, e);
  }
  /**
   * Calculates the cross product of the given vectors and stores the result
   * in this instance.
   *
   * @param {Vector3} a - The first vector.
   * @param {Vector3} b - The second vector.
   * @return {Vector3} A reference to this vector.
   */
  crossVectors(e, t) {
    const n = e.x, r = e.y, s = e.z, a = t.x, o = t.y, l = t.z;
    return this.x = r * l - s * o, this.y = s * a - n * l, this.z = n * o - r * a, this;
  }
  /**
   * Projects this vector onto the given one.
   *
   * @param {Vector3} v - The vector to project to.
   * @return {Vector3} A reference to this vector.
   */
  projectOnVector(e) {
    const t = e.lengthSq();
    if (t === 0) return this.set(0, 0, 0);
    const n = e.dot(this) / t;
    return this.copy(e).multiplyScalar(n);
  }
  /**
   * Projects this vector onto a plane by subtracting this
   * vector projected onto the plane's normal from this vector.
   *
   * @param {Vector3} planeNormal - The plane normal.
   * @return {Vector3} A reference to this vector.
   */
  projectOnPlane(e) {
    return Ps.copy(this).projectOnVector(e), this.sub(Ps);
  }
  /**
   * Reflects this vector off a plane orthogonal to the given normal vector.
   *
   * @param {Vector3} normal - The (normalized) normal vector.
   * @return {Vector3} A reference to this vector.
   */
  reflect(e) {
    return this.sub(Ps.copy(e).multiplyScalar(2 * this.dot(e)));
  }
  /**
   * Returns the angle between the given vector and this instance in radians.
   *
   * @param {Vector3} v - The vector to compute the angle with.
   * @return {number} The angle in radians.
   */
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0) return Math.PI / 2;
    const n = this.dot(e) / t;
    return Math.acos(Ge(n, -1, 1));
  }
  /**
   * Computes the distance from the given vector to this instance.
   *
   * @param {Vector3} v - The vector to compute the distance to.
   * @return {number} The distance.
   */
  distanceTo(e) {
    return Math.sqrt(this.distanceToSquared(e));
  }
  /**
   * Computes the squared distance from the given vector to this instance.
   * If you are just comparing the distance with another distance, you should compare
   * the distance squared instead as it is slightly more efficient to calculate.
   *
   * @param {Vector3} v - The vector to compute the squared distance to.
   * @return {number} The squared distance.
   */
  distanceToSquared(e) {
    const t = this.x - e.x, n = this.y - e.y, r = this.z - e.z;
    return t * t + n * n + r * r;
  }
  /**
   * Computes the Manhattan distance from the given vector to this instance.
   *
   * @param {Vector3} v - The vector to compute the Manhattan distance to.
   * @return {number} The Manhattan distance.
   */
  manhattanDistanceTo(e) {
    return Math.abs(this.x - e.x) + Math.abs(this.y - e.y) + Math.abs(this.z - e.z);
  }
  /**
   * Sets the vector components from the given spherical coordinates.
   *
   * @param {Spherical} s - The spherical coordinates.
   * @return {Vector3} A reference to this vector.
   */
  setFromSpherical(e) {
    return this.setFromSphericalCoords(e.radius, e.phi, e.theta);
  }
  /**
   * Sets the vector components from the given spherical coordinates.
   *
   * @param {number} radius - The radius.
   * @param {number} phi - The phi angle in radians.
   * @param {number} theta - The theta angle in radians.
   * @return {Vector3} A reference to this vector.
   */
  setFromSphericalCoords(e, t, n) {
    const r = Math.sin(t) * e;
    return this.x = r * Math.sin(n), this.y = Math.cos(t) * e, this.z = r * Math.cos(n), this;
  }
  /**
   * Sets the vector components from the given cylindrical coordinates.
   *
   * @param {Cylindrical} c - The cylindrical coordinates.
   * @return {Vector3} A reference to this vector.
   */
  setFromCylindrical(e) {
    return this.setFromCylindricalCoords(e.radius, e.theta, e.y);
  }
  /**
   * Sets the vector components from the given cylindrical coordinates.
   *
   * @param {number} radius - The radius.
   * @param {number} theta - The theta angle in radians.
   * @param {number} y - The y value.
   * @return {Vector3} A reference to this vector.
   */
  setFromCylindricalCoords(e, t, n) {
    return this.x = e * Math.sin(t), this.y = n, this.z = e * Math.cos(t), this;
  }
  /**
   * Sets the vector components to the position elements of the
   * given transformation matrix.
   *
   * @param {Matrix4} m - The 4x4 matrix.
   * @return {Vector3} A reference to this vector.
   */
  setFromMatrixPosition(e) {
    const t = e.elements;
    return this.x = t[12], this.y = t[13], this.z = t[14], this;
  }
  /**
   * Sets the vector components to the scale elements of the
   * given transformation matrix.
   *
   * @param {Matrix4} m - The 4x4 matrix.
   * @return {Vector3} A reference to this vector.
   */
  setFromMatrixScale(e) {
    const t = this.setFromMatrixColumn(e, 0).length(), n = this.setFromMatrixColumn(e, 1).length(), r = this.setFromMatrixColumn(e, 2).length();
    return this.x = t, this.y = n, this.z = r, this;
  }
  /**
   * Sets the vector components from the specified matrix column.
   *
   * @param {Matrix4} m - The 4x4 matrix.
   * @param {number} index - The column index.
   * @return {Vector3} A reference to this vector.
   */
  setFromMatrixColumn(e, t) {
    return this.fromArray(e.elements, t * 4);
  }
  /**
   * Sets the vector components from the specified matrix column.
   *
   * @param {Matrix3} m - The 3x3 matrix.
   * @param {number} index - The column index.
   * @return {Vector3} A reference to this vector.
   */
  setFromMatrix3Column(e, t) {
    return this.fromArray(e.elements, t * 3);
  }
  /**
   * Sets the vector components from the given Euler angles.
   *
   * @param {Euler} e - The Euler angles to set.
   * @return {Vector3} A reference to this vector.
   */
  setFromEuler(e) {
    return this.x = e._x, this.y = e._y, this.z = e._z, this;
  }
  /**
   * Sets the vector components from the RGB components of the
   * given color.
   *
   * @param {Color} c - The color to set.
   * @return {Vector3} A reference to this vector.
   */
  setFromColor(e) {
    return this.x = e.r, this.y = e.g, this.z = e.b, this;
  }
  /**
   * Returns `true` if this vector is equal with the given one.
   *
   * @param {Vector3} v - The vector to test for equality.
   * @return {boolean} Whether this vector is equal with the given one.
   */
  equals(e) {
    return e.x === this.x && e.y === this.y && e.z === this.z;
  }
  /**
   * Sets this vector's x value to be `array[ offset ]`, y value to be `array[ offset + 1 ]`
   * and z value to be `array[ offset + 2 ]`.
   *
   * @param {Array<number>} array - An array holding the vector component values.
   * @param {number} [offset=0] - The offset into the array.
   * @return {Vector3} A reference to this vector.
   */
  fromArray(e, t = 0) {
    return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this;
  }
  /**
   * Writes the components of this vector to the given array. If no array is provided,
   * the method returns a new instance.
   *
   * @param {Array<number>} [array=[]] - The target array holding the vector components.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Array<number>} The vector components.
   */
  toArray(e = [], t = 0) {
    return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e;
  }
  /**
   * Sets the components of this vector from the given buffer attribute.
   *
   * @param {BufferAttribute} attribute - The buffer attribute holding vector data.
   * @param {number} index - The index into the attribute.
   * @return {Vector3} A reference to this vector.
   */
  fromBufferAttribute(e, t) {
    return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this;
  }
  /**
   * Sets each component of this vector to a pseudo-random value between `0` and
   * `1`, excluding `1`.
   *
   * @return {Vector3} A reference to this vector.
   */
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
  }
  /**
   * Sets this vector to a uniformly random point on a unit sphere.
   *
   * @return {Vector3} A reference to this vector.
   */
  randomDirection() {
    const e = Math.random() * Math.PI * 2, t = Math.random() * 2 - 1, n = Math.sqrt(1 - t * t);
    return this.x = n * Math.cos(e), this.y = t, this.z = n * Math.sin(e), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z;
  }
}
const Ps = /* @__PURE__ */ new N(), Go = /* @__PURE__ */ new Ei();
class ze {
  /**
   * Constructs a new 3x3 matrix. The arguments are supposed to be
   * in row-major order. If no arguments are provided, the constructor
   * initializes the matrix as an identity matrix.
   *
   * @param {number} [n11] - 1-1 matrix element.
   * @param {number} [n12] - 1-2 matrix element.
   * @param {number} [n13] - 1-3 matrix element.
   * @param {number} [n21] - 2-1 matrix element.
   * @param {number} [n22] - 2-2 matrix element.
   * @param {number} [n23] - 2-3 matrix element.
   * @param {number} [n31] - 3-1 matrix element.
   * @param {number} [n32] - 3-2 matrix element.
   * @param {number} [n33] - 3-3 matrix element.
   */
  constructor(e, t, n, r, s, a, o, l, c) {
    ze.prototype.isMatrix3 = !0, this.elements = [
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ], e !== void 0 && this.set(e, t, n, r, s, a, o, l, c);
  }
  /**
   * Sets the elements of the matrix.The arguments are supposed to be
   * in row-major order.
   *
   * @param {number} [n11] - 1-1 matrix element.
   * @param {number} [n12] - 1-2 matrix element.
   * @param {number} [n13] - 1-3 matrix element.
   * @param {number} [n21] - 2-1 matrix element.
   * @param {number} [n22] - 2-2 matrix element.
   * @param {number} [n23] - 2-3 matrix element.
   * @param {number} [n31] - 3-1 matrix element.
   * @param {number} [n32] - 3-2 matrix element.
   * @param {number} [n33] - 3-3 matrix element.
   * @return {Matrix3} A reference to this matrix.
   */
  set(e, t, n, r, s, a, o, l, c) {
    const h = this.elements;
    return h[0] = e, h[1] = r, h[2] = o, h[3] = t, h[4] = s, h[5] = l, h[6] = n, h[7] = a, h[8] = c, this;
  }
  /**
   * Sets this matrix to the 3x3 identity matrix.
   *
   * @return {Matrix3} A reference to this matrix.
   */
  identity() {
    return this.set(
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ), this;
  }
  /**
   * Copies the values of the given matrix to this instance.
   *
   * @param {Matrix3} m - The matrix to copy.
   * @return {Matrix3} A reference to this matrix.
   */
  copy(e) {
    const t = this.elements, n = e.elements;
    return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], this;
  }
  /**
   * Extracts the basis of this matrix into the three axis vectors provided.
   *
   * @param {Vector3} xAxis - The basis's x axis.
   * @param {Vector3} yAxis - The basis's y axis.
   * @param {Vector3} zAxis - The basis's z axis.
   * @return {Matrix3} A reference to this matrix.
   */
  extractBasis(e, t, n) {
    return e.setFromMatrix3Column(this, 0), t.setFromMatrix3Column(this, 1), n.setFromMatrix3Column(this, 2), this;
  }
  /**
   * Set this matrix to the upper 3x3 matrix of the given 4x4 matrix.
   *
   * @param {Matrix4} m - The 4x4 matrix.
   * @return {Matrix3} A reference to this matrix.
   */
  setFromMatrix4(e) {
    const t = e.elements;
    return this.set(
      t[0],
      t[4],
      t[8],
      t[1],
      t[5],
      t[9],
      t[2],
      t[6],
      t[10]
    ), this;
  }
  /**
   * Post-multiplies this matrix by the given 3x3 matrix.
   *
   * @param {Matrix3} m - The matrix to multiply with.
   * @return {Matrix3} A reference to this matrix.
   */
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  /**
   * Pre-multiplies this matrix by the given 3x3 matrix.
   *
   * @param {Matrix3} m - The matrix to multiply with.
   * @return {Matrix3} A reference to this matrix.
   */
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  /**
   * Multiples the given 3x3 matrices and stores the result
   * in this matrix.
   *
   * @param {Matrix3} a - The first matrix.
   * @param {Matrix3} b - The second matrix.
   * @return {Matrix3} A reference to this matrix.
   */
  multiplyMatrices(e, t) {
    const n = e.elements, r = t.elements, s = this.elements, a = n[0], o = n[3], l = n[6], c = n[1], h = n[4], d = n[7], u = n[2], p = n[5], g = n[8], _ = r[0], m = r[3], f = r[6], T = r[1], b = r[4], y = r[7], w = r[2], R = r[5], P = r[8];
    return s[0] = a * _ + o * T + l * w, s[3] = a * m + o * b + l * R, s[6] = a * f + o * y + l * P, s[1] = c * _ + h * T + d * w, s[4] = c * m + h * b + d * R, s[7] = c * f + h * y + d * P, s[2] = u * _ + p * T + g * w, s[5] = u * m + p * b + g * R, s[8] = u * f + p * y + g * P, this;
  }
  /**
   * Multiplies every component of the matrix by the given scalar.
   *
   * @param {number} s - The scalar.
   * @return {Matrix3} A reference to this matrix.
   */
  multiplyScalar(e) {
    const t = this.elements;
    return t[0] *= e, t[3] *= e, t[6] *= e, t[1] *= e, t[4] *= e, t[7] *= e, t[2] *= e, t[5] *= e, t[8] *= e, this;
  }
  /**
   * Computes and returns the determinant of this matrix.
   *
   * @return {number} The determinant.
   */
  determinant() {
    const e = this.elements, t = e[0], n = e[1], r = e[2], s = e[3], a = e[4], o = e[5], l = e[6], c = e[7], h = e[8];
    return t * a * h - t * o * c - n * s * h + n * o * l + r * s * c - r * a * l;
  }
  /**
   * Inverts this matrix, using the [analytic method]{@link https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution}.
   * You can not invert with a determinant of zero. If you attempt this, the method produces
   * a zero matrix instead.
   *
   * @return {Matrix3} A reference to this matrix.
   */
  invert() {
    const e = this.elements, t = e[0], n = e[1], r = e[2], s = e[3], a = e[4], o = e[5], l = e[6], c = e[7], h = e[8], d = h * a - o * c, u = o * l - h * s, p = c * s - a * l, g = t * d + n * u + r * p;
    if (g === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const _ = 1 / g;
    return e[0] = d * _, e[1] = (r * c - h * n) * _, e[2] = (o * n - r * a) * _, e[3] = u * _, e[4] = (h * t - r * l) * _, e[5] = (r * s - o * t) * _, e[6] = p * _, e[7] = (n * l - c * t) * _, e[8] = (a * t - n * s) * _, this;
  }
  /**
   * Transposes this matrix in place.
   *
   * @return {Matrix3} A reference to this matrix.
   */
  transpose() {
    let e;
    const t = this.elements;
    return e = t[1], t[1] = t[3], t[3] = e, e = t[2], t[2] = t[6], t[6] = e, e = t[5], t[5] = t[7], t[7] = e, this;
  }
  /**
   * Computes the normal matrix which is the inverse transpose of the upper
   * left 3x3 portion of the given 4x4 matrix.
   *
   * @param {Matrix4} matrix4 - The 4x4 matrix.
   * @return {Matrix3} A reference to this matrix.
   */
  getNormalMatrix(e) {
    return this.setFromMatrix4(e).invert().transpose();
  }
  /**
   * Transposes this matrix into the supplied array, and returns itself unchanged.
   *
   * @param {Array<number>} r - An array to store the transposed matrix elements.
   * @return {Matrix3} A reference to this matrix.
   */
  transposeIntoArray(e) {
    const t = this.elements;
    return e[0] = t[0], e[1] = t[3], e[2] = t[6], e[3] = t[1], e[4] = t[4], e[5] = t[7], e[6] = t[2], e[7] = t[5], e[8] = t[8], this;
  }
  /**
   * Sets the UV transform matrix from offset, repeat, rotation, and center.
   *
   * @param {number} tx - Offset x.
   * @param {number} ty - Offset y.
   * @param {number} sx - Repeat x.
   * @param {number} sy - Repeat y.
   * @param {number} rotation - Rotation, in radians. Positive values rotate counterclockwise.
   * @param {number} cx - Center x of rotation.
   * @param {number} cy - Center y of rotation
   * @return {Matrix3} A reference to this matrix.
   */
  setUvTransform(e, t, n, r, s, a, o) {
    const l = Math.cos(s), c = Math.sin(s);
    return this.set(
      n * l,
      n * c,
      -n * (l * a + c * o) + a + e,
      -r * c,
      r * l,
      -r * (-c * a + l * o) + o + t,
      0,
      0,
      1
    ), this;
  }
  /**
   * Scales this matrix with the given scalar values.
   *
   * @param {number} sx - The amount to scale in the X axis.
   * @param {number} sy - The amount to scale in the Y axis.
   * @return {Matrix3} A reference to this matrix.
   */
  scale(e, t) {
    return this.premultiply(Ds.makeScale(e, t)), this;
  }
  /**
   * Rotates this matrix by the given angle.
   *
   * @param {number} theta - The rotation in radians.
   * @return {Matrix3} A reference to this matrix.
   */
  rotate(e) {
    return this.premultiply(Ds.makeRotation(-e)), this;
  }
  /**
   * Translates this matrix by the given scalar values.
   *
   * @param {number} tx - The amount to translate in the X axis.
   * @param {number} ty - The amount to translate in the Y axis.
   * @return {Matrix3} A reference to this matrix.
   */
  translate(e, t) {
    return this.premultiply(Ds.makeTranslation(e, t)), this;
  }
  // for 2D Transforms
  /**
   * Sets this matrix as a 2D translation transform.
   *
   * @param {number|Vector2} x - The amount to translate in the X axis or alternatively a translation vector.
   * @param {number} y - The amount to translate in the Y axis.
   * @return {Matrix3} A reference to this matrix.
   */
  makeTranslation(e, t) {
    return e.isVector2 ? this.set(
      1,
      0,
      e.x,
      0,
      1,
      e.y,
      0,
      0,
      1
    ) : this.set(
      1,
      0,
      e,
      0,
      1,
      t,
      0,
      0,
      1
    ), this;
  }
  /**
   * Sets this matrix as a 2D rotational transformation.
   *
   * @param {number} theta - The rotation in radians.
   * @return {Matrix3} A reference to this matrix.
   */
  makeRotation(e) {
    const t = Math.cos(e), n = Math.sin(e);
    return this.set(
      t,
      -n,
      0,
      n,
      t,
      0,
      0,
      0,
      1
    ), this;
  }
  /**
   * Sets this matrix as a 2D scale transform.
   *
   * @param {number} x - The amount to scale in the X axis.
   * @param {number} y - The amount to scale in the Y axis.
   * @return {Matrix3} A reference to this matrix.
   */
  makeScale(e, t) {
    return this.set(
      e,
      0,
      0,
      0,
      t,
      0,
      0,
      0,
      1
    ), this;
  }
  /**
   * Returns `true` if this matrix is equal with the given one.
   *
   * @param {Matrix3} matrix - The matrix to test for equality.
   * @return {boolean} Whether this matrix is equal with the given one.
   */
  equals(e) {
    const t = this.elements, n = e.elements;
    for (let r = 0; r < 9; r++)
      if (t[r] !== n[r]) return !1;
    return !0;
  }
  /**
   * Sets the elements of the matrix from the given array.
   *
   * @param {Array<number>} array - The matrix elements in column-major order.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Matrix3} A reference to this matrix.
   */
  fromArray(e, t = 0) {
    for (let n = 0; n < 9; n++)
      this.elements[n] = e[n + t];
    return this;
  }
  /**
   * Writes the elements of this matrix to the given array. If no array is provided,
   * the method returns a new instance.
   *
   * @param {Array<number>} [array=[]] - The target array holding the matrix elements in column-major order.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Array<number>} The matrix elements in column-major order.
   */
  toArray(e = [], t = 0) {
    const n = this.elements;
    return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e;
  }
  /**
   * Returns a matrix with copied values from this instance.
   *
   * @return {Matrix3} A clone of this instance.
   */
  clone() {
    return new this.constructor().fromArray(this.elements);
  }
}
const Ds = /* @__PURE__ */ new ze();
function gc(i) {
  for (let e = i.length - 1; e >= 0; --e)
    if (i[e] >= 65535) return !0;
  return !1;
}
function ms(i) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", i);
}
function _d() {
  const i = ms("canvas");
  return i.style.display = "block", i;
}
const Wo = {};
function wr(i) {
  i in Wo || (Wo[i] = !0, console.warn(i));
}
function vd(i, e, t) {
  return new Promise(function(n, r) {
    function s() {
      switch (i.clientWaitSync(e, i.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case i.WAIT_FAILED:
          r();
          break;
        case i.TIMEOUT_EXPIRED:
          setTimeout(s, t);
          break;
        default:
          n();
      }
    }
    setTimeout(s, t);
  });
}
const $o = /* @__PURE__ */ new ze().set(
  0.4123908,
  0.3575843,
  0.1804808,
  0.212639,
  0.7151687,
  0.0721923,
  0.0193308,
  0.1191948,
  0.9505322
), Xo = /* @__PURE__ */ new ze().set(
  3.2409699,
  -1.5373832,
  -0.4986108,
  -0.9692436,
  1.8759675,
  0.0415551,
  0.0556301,
  -0.203977,
  1.0569715
);
function xd() {
  const i = {
    enabled: !0,
    workingColorSpace: tr,
    /**
     * Implementations of supported color spaces.
     *
     * Required:
     *	- primaries: chromaticity coordinates [ rx ry gx gy bx by ]
     *	- whitePoint: reference white [ x y ]
     *	- transfer: transfer function (pre-defined)
     *	- toXYZ: Matrix3 RGB to XYZ transform
     *	- fromXYZ: Matrix3 XYZ to RGB transform
     *	- luminanceCoefficients: RGB luminance coefficients
     *
     * Optional:
     *  - outputColorSpaceConfig: { drawingBufferColorSpace: ColorSpace, toneMappingMode: 'extended' | 'standard' }
     *  - workingColorSpaceConfig: { unpackColorSpace: ColorSpace }
     *
     * Reference:
     * - https://www.russellcottrell.com/photo/matrixCalculator.htm
     */
    spaces: {},
    convert: function(r, s, a) {
      return this.enabled === !1 || s === a || !s || !a || (this.spaces[s].transfer === et && (r.r = $n(r.r), r.g = $n(r.g), r.b = $n(r.b)), this.spaces[s].primaries !== this.spaces[a].primaries && (r.applyMatrix3(this.spaces[s].toXYZ), r.applyMatrix3(this.spaces[a].fromXYZ)), this.spaces[a].transfer === et && (r.r = Ki(r.r), r.g = Ki(r.g), r.b = Ki(r.b))), r;
    },
    workingToColorSpace: function(r, s) {
      return this.convert(r, this.workingColorSpace, s);
    },
    colorSpaceToWorking: function(r, s) {
      return this.convert(r, s, this.workingColorSpace);
    },
    getPrimaries: function(r) {
      return this.spaces[r].primaries;
    },
    getTransfer: function(r) {
      return r === ei ? fs : this.spaces[r].transfer;
    },
    getToneMappingMode: function(r) {
      return this.spaces[r].outputColorSpaceConfig.toneMappingMode || "standard";
    },
    getLuminanceCoefficients: function(r, s = this.workingColorSpace) {
      return r.fromArray(this.spaces[s].luminanceCoefficients);
    },
    define: function(r) {
      Object.assign(this.spaces, r);
    },
    // Internal APIs
    _getMatrix: function(r, s, a) {
      return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ);
    },
    _getDrawingBufferColorSpace: function(r) {
      return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace;
    },
    _getUnpackColorSpace: function(r = this.workingColorSpace) {
      return this.spaces[r].workingColorSpaceConfig.unpackColorSpace;
    },
    // Deprecated
    fromWorkingColorSpace: function(r, s) {
      return wr("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."), i.workingToColorSpace(r, s);
    },
    toWorkingColorSpace: function(r, s) {
      return wr("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."), i.colorSpaceToWorking(r, s);
    }
  }, e = [0.64, 0.33, 0.3, 0.6, 0.15, 0.06], t = [0.2126, 0.7152, 0.0722], n = [0.3127, 0.329];
  return i.define({
    [tr]: {
      primaries: e,
      whitePoint: n,
      transfer: fs,
      toXYZ: $o,
      fromXYZ: Xo,
      luminanceCoefficients: t,
      workingColorSpaceConfig: { unpackColorSpace: Zt },
      outputColorSpaceConfig: { drawingBufferColorSpace: Zt }
    },
    [Zt]: {
      primaries: e,
      whitePoint: n,
      transfer: et,
      toXYZ: $o,
      fromXYZ: Xo,
      luminanceCoefficients: t,
      outputColorSpaceConfig: { drawingBufferColorSpace: Zt }
    }
  }), i;
}
const je = /* @__PURE__ */ xd();
function $n(i) {
  return i < 0.04045 ? i * 0.0773993808 : Math.pow(i * 0.9478672986 + 0.0521327014, 2.4);
}
function Ki(i) {
  return i < 31308e-7 ? i * 12.92 : 1.055 * Math.pow(i, 0.41666) - 0.055;
}
let Ci;
class Md {
  /**
   * Returns a data URI containing a representation of the given image.
   *
   * @param {(HTMLImageElement|HTMLCanvasElement)} image - The image object.
   * @param {string} [type='image/png'] - Indicates the image format.
   * @return {string} The data URI.
   */
  static getDataURL(e, t = "image/png") {
    if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u")
      return e.src;
    let n;
    if (e instanceof HTMLCanvasElement)
      n = e;
    else {
      Ci === void 0 && (Ci = ms("canvas")), Ci.width = e.width, Ci.height = e.height;
      const r = Ci.getContext("2d");
      e instanceof ImageData ? r.putImageData(e, 0, 0) : r.drawImage(e, 0, 0, e.width, e.height), n = Ci;
    }
    return n.toDataURL(t);
  }
  /**
   * Converts the given sRGB image data to linear color space.
   *
   * @param {(HTMLImageElement|HTMLCanvasElement|ImageBitmap|Object)} image - The image object.
   * @return {HTMLCanvasElement|Object} The converted image.
   */
  static sRGBToLinear(e) {
    if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
      const t = ms("canvas");
      t.width = e.width, t.height = e.height;
      const n = t.getContext("2d");
      n.drawImage(e, 0, 0, e.width, e.height);
      const r = n.getImageData(0, 0, e.width, e.height), s = r.data;
      for (let a = 0; a < s.length; a++)
        s[a] = $n(s[a] / 255) * 255;
      return n.putImageData(r, 0, 0), t;
    } else if (e.data) {
      const t = e.data.slice(0);
      for (let n = 0; n < t.length; n++)
        t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[n] = Math.floor($n(t[n] / 255) * 255) : t[n] = $n(t[n]);
      return {
        data: t,
        width: e.width,
        height: e.height
      };
    } else
      return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
  }
}
let Sd = 0;
class fo {
  /**
   * Constructs a new video texture.
   *
   * @param {any} [data=null] - The data definition of a texture.
   */
  constructor(e = null) {
    this.isSource = !0, Object.defineProperty(this, "id", { value: Sd++ }), this.uuid = ir(), this.data = e, this.dataReady = !0, this.version = 0;
  }
  /**
   * Returns the dimensions of the source into the given target vector.
   *
   * @param {(Vector2|Vector3)} target - The target object the result is written into.
   * @return {(Vector2|Vector3)} The dimensions of the source.
   */
  getSize(e) {
    const t = this.data;
    return typeof HTMLVideoElement < "u" && t instanceof HTMLVideoElement ? e.set(t.videoWidth, t.videoHeight, 0) : t instanceof VideoFrame ? e.set(t.displayHeight, t.displayWidth, 0) : t !== null ? e.set(t.width, t.height, t.depth || 0) : e.set(0, 0, 0), e;
  }
  /**
   * When the property is set to `true`, the engine allocates the memory
   * for the texture (if necessary) and triggers the actual texture upload
   * to the GPU next time the source is used.
   *
   * @type {boolean}
   * @default false
   * @param {boolean} value
   */
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  /**
   * Serializes the source into JSON.
   *
   * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
   * @return {Object} A JSON object representing the serialized source.
   * @see {@link ObjectLoader#parse}
   */
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    if (!t && e.images[this.uuid] !== void 0)
      return e.images[this.uuid];
    const n = {
      uuid: this.uuid,
      url: ""
    }, r = this.data;
    if (r !== null) {
      let s;
      if (Array.isArray(r)) {
        s = [];
        for (let a = 0, o = r.length; a < o; a++)
          r[a].isDataTexture ? s.push(Ls(r[a].image)) : s.push(Ls(r[a]));
      } else
        s = Ls(r);
      n.url = s;
    }
    return t || (e.images[this.uuid] = n), n;
  }
}
function Ls(i) {
  return typeof HTMLImageElement < "u" && i instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && i instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && i instanceof ImageBitmap ? Md.getDataURL(i) : i.data ? {
    data: Array.from(i.data),
    width: i.width,
    height: i.height,
    type: i.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let yd = 0;
const Is = /* @__PURE__ */ new N();
class Yt extends Ti {
  /**
   * Constructs a new texture.
   *
   * @param {?Object} [image=Texture.DEFAULT_IMAGE] - The image holding the texture data.
   * @param {number} [mapping=Texture.DEFAULT_MAPPING] - The texture mapping.
   * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
   * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
   * @param {number} [magFilter=LinearFilter] - The mag filter value.
   * @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
   * @param {number} [format=RGBAFormat] - The texture format.
   * @param {number} [type=UnsignedByteType] - The texture type.
   * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
   * @param {string} [colorSpace=NoColorSpace] - The color space.
   */
  constructor(e = Yt.DEFAULT_IMAGE, t = Yt.DEFAULT_MAPPING, n = vi, r = vi, s = An, a = xi, o = xn, l = Ln, c = Yt.DEFAULT_ANISOTROPY, h = ei) {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: yd++ }), this.uuid = ir(), this.name = "", this.source = new fo(e), this.mipmaps = [], this.mapping = t, this.channel = 0, this.wrapS = n, this.wrapT = r, this.magFilter = s, this.minFilter = a, this.anisotropy = c, this.format = o, this.internalFormat = null, this.type = l, this.offset = new Ue(0, 0), this.repeat = new Ue(1, 1), this.center = new Ue(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new ze(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.updateRanges = [], this.version = 0, this.onUpdate = null, this.renderTarget = null, this.isRenderTargetTexture = !1, this.isArrayTexture = !!(e && e.depth && e.depth > 1), this.pmremVersion = 0;
  }
  /**
   * The width of the texture in pixels.
   */
  get width() {
    return this.source.getSize(Is).x;
  }
  /**
   * The height of the texture in pixels.
   */
  get height() {
    return this.source.getSize(Is).y;
  }
  /**
   * The depth of the texture in pixels.
   */
  get depth() {
    return this.source.getSize(Is).z;
  }
  /**
   * The image object holding the texture data.
   *
   * @type {?Object}
   */
  get image() {
    return this.source.data;
  }
  set image(e = null) {
    this.source.data = e;
  }
  /**
   * Updates the texture transformation matrix from the from the properties {@link Texture#offset},
   * {@link Texture#repeat}, {@link Texture#rotation}, and {@link Texture#center}.
   */
  updateMatrix() {
    this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
  }
  /**
   * Adds a range of data in the data texture to be updated on the GPU.
   *
   * @param {number} start - Position at which to start update.
   * @param {number} count - The number of components to update.
   */
  addUpdateRange(e, t) {
    this.updateRanges.push({ start: e, count: t });
  }
  /**
   * Clears the update ranges.
   */
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  /**
   * Returns a new texture with copied values from this instance.
   *
   * @return {Texture} A clone of this instance.
   */
  clone() {
    return new this.constructor().copy(this);
  }
  /**
   * Copies the values of the given texture to this instance.
   *
   * @param {Texture} source - The texture to copy.
   * @return {Texture} A reference to this instance.
   */
  copy(e) {
    return this.name = e.name, this.source = e.source, this.mipmaps = e.mipmaps.slice(0), this.mapping = e.mapping, this.channel = e.channel, this.wrapS = e.wrapS, this.wrapT = e.wrapT, this.magFilter = e.magFilter, this.minFilter = e.minFilter, this.anisotropy = e.anisotropy, this.format = e.format, this.internalFormat = e.internalFormat, this.type = e.type, this.offset.copy(e.offset), this.repeat.copy(e.repeat), this.center.copy(e.center), this.rotation = e.rotation, this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrix.copy(e.matrix), this.generateMipmaps = e.generateMipmaps, this.premultiplyAlpha = e.premultiplyAlpha, this.flipY = e.flipY, this.unpackAlignment = e.unpackAlignment, this.colorSpace = e.colorSpace, this.renderTarget = e.renderTarget, this.isRenderTargetTexture = e.isRenderTargetTexture, this.isArrayTexture = e.isArrayTexture, this.userData = JSON.parse(JSON.stringify(e.userData)), this.needsUpdate = !0, this;
  }
  /**
   * Sets this texture's properties based on `values`.
   * @param {Object} values - A container with texture parameters.
   */
  setValues(e) {
    for (const t in e) {
      const n = e[t];
      if (n === void 0) {
        console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);
        continue;
      }
      const r = this[t];
      if (r === void 0) {
        console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);
        continue;
      }
      r && n && r.isVector2 && n.isVector2 || r && n && r.isVector3 && n.isVector3 || r && n && r.isMatrix3 && n.isMatrix3 ? r.copy(n) : this[t] = n;
    }
  }
  /**
   * Serializes the texture into JSON.
   *
   * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
   * @return {Object} A JSON object representing the serialized texture.
   * @see {@link ObjectLoader#parse}
   */
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    if (!t && e.textures[this.uuid] !== void 0)
      return e.textures[this.uuid];
    const n = {
      metadata: {
        version: 4.7,
        type: "Texture",
        generator: "Texture.toJSON"
      },
      uuid: this.uuid,
      name: this.name,
      image: this.source.toJSON(e).uuid,
      mapping: this.mapping,
      channel: this.channel,
      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,
      wrap: [this.wrapS, this.wrapT],
      format: this.format,
      internalFormat: this.internalFormat,
      type: this.type,
      colorSpace: this.colorSpace,
      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,
      flipY: this.flipY,
      generateMipmaps: this.generateMipmaps,
      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment
    };
    return Object.keys(this.userData).length > 0 && (n.userData = this.userData), t || (e.textures[this.uuid] = n), n;
  }
  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever this instance is no longer used in your app.
   *
   * @fires Texture#dispose
   */
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  /**
   * Transforms the given uv vector with the textures uv transformation matrix.
   *
   * @param {Vector2} uv - The uv vector.
   * @return {Vector2} The transformed uv vector.
   */
  transformUv(e) {
    if (this.mapping !== rc) return e;
    if (e.applyMatrix3(this.matrix), e.x < 0 || e.x > 1)
      switch (this.wrapS) {
        case ba:
          e.x = e.x - Math.floor(e.x);
          break;
        case vi:
          e.x = e.x < 0 ? 0 : 1;
          break;
        case Ea:
          Math.abs(Math.floor(e.x) % 2) === 1 ? e.x = Math.ceil(e.x) - e.x : e.x = e.x - Math.floor(e.x);
          break;
      }
    if (e.y < 0 || e.y > 1)
      switch (this.wrapT) {
        case ba:
          e.y = e.y - Math.floor(e.y);
          break;
        case vi:
          e.y = e.y < 0 ? 0 : 1;
          break;
        case Ea:
          Math.abs(Math.floor(e.y) % 2) === 1 ? e.y = Math.ceil(e.y) - e.y : e.y = e.y - Math.floor(e.y);
          break;
      }
    return this.flipY && (e.y = 1 - e.y), e;
  }
  /**
   * Setting this property to `true` indicates the engine the texture
   * must be updated in the next render. This triggers a texture upload
   * to the GPU and ensures correct texture parameter configuration.
   *
   * @type {boolean}
   * @default false
   * @param {boolean} value
   */
  set needsUpdate(e) {
    e === !0 && (this.version++, this.source.needsUpdate = !0);
  }
  /**
   * Setting this property to `true` indicates the engine the PMREM
   * must be regenerated.
   *
   * @type {boolean}
   * @default false
   * @param {boolean} value
   */
  set needsPMREMUpdate(e) {
    e === !0 && this.pmremVersion++;
  }
}
Yt.DEFAULT_IMAGE = null;
Yt.DEFAULT_MAPPING = rc;
Yt.DEFAULT_ANISOTROPY = 1;
class vt {
  /**
   * Constructs a new 4D vector.
   *
   * @param {number} [x=0] - The x value of this vector.
   * @param {number} [y=0] - The y value of this vector.
   * @param {number} [z=0] - The z value of this vector.
   * @param {number} [w=1] - The w value of this vector.
   */
  constructor(e = 0, t = 0, n = 0, r = 1) {
    vt.prototype.isVector4 = !0, this.x = e, this.y = t, this.z = n, this.w = r;
  }
  /**
   * Alias for {@link Vector4#z}.
   *
   * @type {number}
   */
  get width() {
    return this.z;
  }
  set width(e) {
    this.z = e;
  }
  /**
   * Alias for {@link Vector4#w}.
   *
   * @type {number}
   */
  get height() {
    return this.w;
  }
  set height(e) {
    this.w = e;
  }
  /**
   * Sets the vector components.
   *
   * @param {number} x - The value of the x component.
   * @param {number} y - The value of the y component.
   * @param {number} z - The value of the z component.
   * @param {number} w - The value of the w component.
   * @return {Vector4} A reference to this vector.
   */
  set(e, t, n, r) {
    return this.x = e, this.y = t, this.z = n, this.w = r, this;
  }
  /**
   * Sets the vector components to the same value.
   *
   * @param {number} scalar - The value to set for all vector components.
   * @return {Vector4} A reference to this vector.
   */
  setScalar(e) {
    return this.x = e, this.y = e, this.z = e, this.w = e, this;
  }
  /**
   * Sets the vector's x component to the given value
   *
   * @param {number} x - The value to set.
   * @return {Vector4} A reference to this vector.
   */
  setX(e) {
    return this.x = e, this;
  }
  /**
   * Sets the vector's y component to the given value
   *
   * @param {number} y - The value to set.
   * @return {Vector4} A reference to this vector.
   */
  setY(e) {
    return this.y = e, this;
  }
  /**
   * Sets the vector's z component to the given value
   *
   * @param {number} z - The value to set.
   * @return {Vector4} A reference to this vector.
   */
  setZ(e) {
    return this.z = e, this;
  }
  /**
   * Sets the vector's w component to the given value
   *
   * @param {number} w - The value to set.
   * @return {Vector4} A reference to this vector.
   */
  setW(e) {
    return this.w = e, this;
  }
  /**
   * Allows to set a vector component with an index.
   *
   * @param {number} index - The component index. `0` equals to x, `1` equals to y,
   * `2` equals to z, `3` equals to w.
   * @param {number} value - The value to set.
   * @return {Vector4} A reference to this vector.
   */
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      case 2:
        this.z = t;
        break;
      case 3:
        this.w = t;
        break;
      default:
        throw new Error("index is out of range: " + e);
    }
    return this;
  }
  /**
   * Returns the value of the vector component which matches the given index.
   *
   * @param {number} index - The component index. `0` equals to x, `1` equals to y,
   * `2` equals to z, `3` equals to w.
   * @return {number} A vector component value.
   */
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  /**
   * Returns a new vector with copied values from this instance.
   *
   * @return {Vector4} A clone of this instance.
   */
  clone() {
    return new this.constructor(this.x, this.y, this.z, this.w);
  }
  /**
   * Copies the values of the given vector to this instance.
   *
   * @param {Vector3|Vector4} v - The vector to copy.
   * @return {Vector4} A reference to this vector.
   */
  copy(e) {
    return this.x = e.x, this.y = e.y, this.z = e.z, this.w = e.w !== void 0 ? e.w : 1, this;
  }
  /**
   * Adds the given vector to this instance.
   *
   * @param {Vector4} v - The vector to add.
   * @return {Vector4} A reference to this vector.
   */
  add(e) {
    return this.x += e.x, this.y += e.y, this.z += e.z, this.w += e.w, this;
  }
  /**
   * Adds the given scalar value to all components of this instance.
   *
   * @param {number} s - The scalar to add.
   * @return {Vector4} A reference to this vector.
   */
  addScalar(e) {
    return this.x += e, this.y += e, this.z += e, this.w += e, this;
  }
  /**
   * Adds the given vectors and stores the result in this instance.
   *
   * @param {Vector4} a - The first vector.
   * @param {Vector4} b - The second vector.
   * @return {Vector4} A reference to this vector.
   */
  addVectors(e, t) {
    return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this.w = e.w + t.w, this;
  }
  /**
   * Adds the given vector scaled by the given factor to this instance.
   *
   * @param {Vector4} v - The vector.
   * @param {number} s - The factor that scales `v`.
   * @return {Vector4} A reference to this vector.
   */
  addScaledVector(e, t) {
    return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this.w += e.w * t, this;
  }
  /**
   * Subtracts the given vector from this instance.
   *
   * @param {Vector4} v - The vector to subtract.
   * @return {Vector4} A reference to this vector.
   */
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this.z -= e.z, this.w -= e.w, this;
  }
  /**
   * Subtracts the given scalar value from all components of this instance.
   *
   * @param {number} s - The scalar to subtract.
   * @return {Vector4} A reference to this vector.
   */
  subScalar(e) {
    return this.x -= e, this.y -= e, this.z -= e, this.w -= e, this;
  }
  /**
   * Subtracts the given vectors and stores the result in this instance.
   *
   * @param {Vector4} a - The first vector.
   * @param {Vector4} b - The second vector.
   * @return {Vector4} A reference to this vector.
   */
  subVectors(e, t) {
    return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this.w = e.w - t.w, this;
  }
  /**
   * Multiplies the given vector with this instance.
   *
   * @param {Vector4} v - The vector to multiply.
   * @return {Vector4} A reference to this vector.
   */
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this.z *= e.z, this.w *= e.w, this;
  }
  /**
   * Multiplies the given scalar value with all components of this instance.
   *
   * @param {number} scalar - The scalar to multiply.
   * @return {Vector4} A reference to this vector.
   */
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this.z *= e, this.w *= e, this;
  }
  /**
   * Multiplies this vector with the given 4x4 matrix.
   *
   * @param {Matrix4} m - The 4x4 matrix.
   * @return {Vector4} A reference to this vector.
   */
  applyMatrix4(e) {
    const t = this.x, n = this.y, r = this.z, s = this.w, a = e.elements;
    return this.x = a[0] * t + a[4] * n + a[8] * r + a[12] * s, this.y = a[1] * t + a[5] * n + a[9] * r + a[13] * s, this.z = a[2] * t + a[6] * n + a[10] * r + a[14] * s, this.w = a[3] * t + a[7] * n + a[11] * r + a[15] * s, this;
  }
  /**
   * Divides this instance by the given vector.
   *
   * @param {Vector4} v - The vector to divide.
   * @return {Vector4} A reference to this vector.
   */
  divide(e) {
    return this.x /= e.x, this.y /= e.y, this.z /= e.z, this.w /= e.w, this;
  }
  /**
   * Divides this vector by the given scalar.
   *
   * @param {number} scalar - The scalar to divide.
   * @return {Vector4} A reference to this vector.
   */
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  /**
   * Sets the x, y and z components of this
   * vector to the quaternion's axis and w to the angle.
   *
   * @param {Quaternion} q - The Quaternion to set.
   * @return {Vector4} A reference to this vector.
   */
  setAxisAngleFromQuaternion(e) {
    this.w = 2 * Math.acos(e.w);
    const t = Math.sqrt(1 - e.w * e.w);
    return t < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = e.x / t, this.y = e.y / t, this.z = e.z / t), this;
  }
  /**
   * Sets the x, y and z components of this
   * vector to the axis of rotation and w to the angle.
   *
   * @param {Matrix4} m - A 4x4 matrix of which the upper left 3x3 matrix is a pure rotation matrix.
   * @return {Vector4} A reference to this vector.
   */
  setAxisAngleFromRotationMatrix(e) {
    let t, n, r, s;
    const l = e.elements, c = l[0], h = l[4], d = l[8], u = l[1], p = l[5], g = l[9], _ = l[2], m = l[6], f = l[10];
    if (Math.abs(h - u) < 0.01 && Math.abs(d - _) < 0.01 && Math.abs(g - m) < 0.01) {
      if (Math.abs(h + u) < 0.1 && Math.abs(d + _) < 0.1 && Math.abs(g + m) < 0.1 && Math.abs(c + p + f - 3) < 0.1)
        return this.set(1, 0, 0, 0), this;
      t = Math.PI;
      const b = (c + 1) / 2, y = (p + 1) / 2, w = (f + 1) / 2, R = (h + u) / 4, P = (d + _) / 4, O = (g + m) / 4;
      return b > y && b > w ? b < 0.01 ? (n = 0, r = 0.707106781, s = 0.707106781) : (n = Math.sqrt(b), r = R / n, s = P / n) : y > w ? y < 0.01 ? (n = 0.707106781, r = 0, s = 0.707106781) : (r = Math.sqrt(y), n = R / r, s = O / r) : w < 0.01 ? (n = 0.707106781, r = 0.707106781, s = 0) : (s = Math.sqrt(w), n = P / s, r = O / s), this.set(n, r, s, t), this;
    }
    let T = Math.sqrt((m - g) * (m - g) + (d - _) * (d - _) + (u - h) * (u - h));
    return Math.abs(T) < 1e-3 && (T = 1), this.x = (m - g) / T, this.y = (d - _) / T, this.z = (u - h) / T, this.w = Math.acos((c + p + f - 1) / 2), this;
  }
  /**
   * Sets the vector components to the position elements of the
   * given transformation matrix.
   *
   * @param {Matrix4} m - The 4x4 matrix.
   * @return {Vector4} A reference to this vector.
   */
  setFromMatrixPosition(e) {
    const t = e.elements;
    return this.x = t[12], this.y = t[13], this.z = t[14], this.w = t[15], this;
  }
  /**
   * If this vector's x, y, z or w value is greater than the given vector's x, y, z or w
   * value, replace that value with the corresponding min value.
   *
   * @param {Vector4} v - The vector.
   * @return {Vector4} A reference to this vector.
   */
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this.w = Math.min(this.w, e.w), this;
  }
  /**
   * If this vector's x, y, z or w value is less than the given vector's x, y, z or w
   * value, replace that value with the corresponding max value.
   *
   * @param {Vector4} v - The vector.
   * @return {Vector4} A reference to this vector.
   */
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this.w = Math.max(this.w, e.w), this;
  }
  /**
   * If this vector's x, y, z or w value is greater than the max vector's x, y, z or w
   * value, it is replaced by the corresponding value.
   * If this vector's x, y, z or w value is less than the min vector's x, y, z or w value,
   * it is replaced by the corresponding value.
   *
   * @param {Vector4} min - The minimum x, y and z values.
   * @param {Vector4} max - The maximum x, y and z values in the desired range.
   * @return {Vector4} A reference to this vector.
   */
  clamp(e, t) {
    return this.x = Ge(this.x, e.x, t.x), this.y = Ge(this.y, e.y, t.y), this.z = Ge(this.z, e.z, t.z), this.w = Ge(this.w, e.w, t.w), this;
  }
  /**
   * If this vector's x, y, z or w values are greater than the max value, they are
   * replaced by the max value.
   * If this vector's x, y, z or w values are less than the min value, they are
   * replaced by the min value.
   *
   * @param {number} minVal - The minimum value the components will be clamped to.
   * @param {number} maxVal - The maximum value the components will be clamped to.
   * @return {Vector4} A reference to this vector.
   */
  clampScalar(e, t) {
    return this.x = Ge(this.x, e, t), this.y = Ge(this.y, e, t), this.z = Ge(this.z, e, t), this.w = Ge(this.w, e, t), this;
  }
  /**
   * If this vector's length is greater than the max value, it is replaced by
   * the max value.
   * If this vector's length is less than the min value, it is replaced by the
   * min value.
   *
   * @param {number} min - The minimum value the vector length will be clamped to.
   * @param {number} max - The maximum value the vector length will be clamped to.
   * @return {Vector4} A reference to this vector.
   */
  clampLength(e, t) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Ge(n, e, t));
  }
  /**
   * The components of this vector are rounded down to the nearest integer value.
   *
   * @return {Vector4} A reference to this vector.
   */
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this;
  }
  /**
   * The components of this vector are rounded up to the nearest integer value.
   *
   * @return {Vector4} A reference to this vector.
   */
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this;
  }
  /**
   * The components of this vector are rounded to the nearest integer value
   *
   * @return {Vector4} A reference to this vector.
   */
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this;
  }
  /**
   * The components of this vector are rounded towards zero (up if negative,
   * down if positive) to an integer value.
   *
   * @return {Vector4} A reference to this vector.
   */
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this;
  }
  /**
   * Inverts this vector - i.e. sets x = -x, y = -y, z = -z, w = -w.
   *
   * @return {Vector4} A reference to this vector.
   */
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
  }
  /**
   * Calculates the dot product of the given vector with this instance.
   *
   * @param {Vector4} v - The vector to compute the dot product with.
   * @return {number} The result of the dot product.
   */
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w;
  }
  /**
   * Computes the square of the Euclidean length (straight-line length) from
   * (0, 0, 0, 0) to (x, y, z, w). If you are comparing the lengths of vectors, you should
   * compare the length squared instead as it is slightly more efficient to calculate.
   *
   * @return {number} The square length of this vector.
   */
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }
  /**
   * Computes the  Euclidean length (straight-line length) from (0, 0, 0, 0) to (x, y, z, w).
   *
   * @return {number} The length of this vector.
   */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  /**
   * Computes the Manhattan length of this vector.
   *
   * @return {number} The length of this vector.
   */
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
  }
  /**
   * Converts this vector to a unit vector - that is, sets it equal to a vector
   * with the same direction as this one, but with a vector length of `1`.
   *
   * @return {Vector4} A reference to this vector.
   */
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  /**
   * Sets this vector to a vector with the same direction as this one, but
   * with the specified length.
   *
   * @param {number} length - The new length of this vector.
   * @return {Vector4} A reference to this vector.
   */
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  /**
   * Linearly interpolates between the given vector and this instance, where
   * alpha is the percent distance along the line - alpha = 0 will be this
   * vector, and alpha = 1 will be the given one.
   *
   * @param {Vector4} v - The vector to interpolate towards.
   * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
   * @return {Vector4} A reference to this vector.
   */
  lerp(e, t) {
    return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this.w += (e.w - this.w) * t, this;
  }
  /**
   * Linearly interpolates between the given vectors, where alpha is the percent
   * distance along the line - alpha = 0 will be first vector, and alpha = 1 will
   * be the second one. The result is stored in this instance.
   *
   * @param {Vector4} v1 - The first vector.
   * @param {Vector4} v2 - The second vector.
   * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
   * @return {Vector4} A reference to this vector.
   */
  lerpVectors(e, t, n) {
    return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this.w = e.w + (t.w - e.w) * n, this;
  }
  /**
   * Returns `true` if this vector is equal with the given one.
   *
   * @param {Vector4} v - The vector to test for equality.
   * @return {boolean} Whether this vector is equal with the given one.
   */
  equals(e) {
    return e.x === this.x && e.y === this.y && e.z === this.z && e.w === this.w;
  }
  /**
   * Sets this vector's x value to be `array[ offset ]`, y value to be `array[ offset + 1 ]`,
   * z value to be `array[ offset + 2 ]`, w value to be `array[ offset + 3 ]`.
   *
   * @param {Array<number>} array - An array holding the vector component values.
   * @param {number} [offset=0] - The offset into the array.
   * @return {Vector4} A reference to this vector.
   */
  fromArray(e, t = 0) {
    return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this.w = e[t + 3], this;
  }
  /**
   * Writes the components of this vector to the given array. If no array is provided,
   * the method returns a new instance.
   *
   * @param {Array<number>} [array=[]] - The target array holding the vector components.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Array<number>} The vector components.
   */
  toArray(e = [], t = 0) {
    return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e[t + 3] = this.w, e;
  }
  /**
   * Sets the components of this vector from the given buffer attribute.
   *
   * @param {BufferAttribute} attribute - The buffer attribute holding vector data.
   * @param {number} index - The index into the attribute.
   * @return {Vector4} A reference to this vector.
   */
  fromBufferAttribute(e, t) {
    return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this.w = e.getW(t), this;
  }
  /**
   * Sets each component of this vector to a pseudo-random value between `0` and
   * `1`, excluding `1`.
   *
   * @return {Vector4} A reference to this vector.
   */
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z, yield this.w;
  }
}
class bd extends Ti {
  /**
   * Render target options.
   *
   * @typedef {Object} RenderTarget~Options
   * @property {boolean} [generateMipmaps=false] - Whether to generate mipmaps or not.
   * @property {number} [magFilter=LinearFilter] - The mag filter.
   * @property {number} [minFilter=LinearFilter] - The min filter.
   * @property {number} [format=RGBAFormat] - The texture format.
   * @property {number} [type=UnsignedByteType] - The texture type.
   * @property {?string} [internalFormat=null] - The texture's internal format.
   * @property {number} [wrapS=ClampToEdgeWrapping] - The texture's uv wrapping mode.
   * @property {number} [wrapT=ClampToEdgeWrapping] - The texture's uv wrapping mode.
   * @property {number} [anisotropy=1] - The texture's anisotropy value.
   * @property {string} [colorSpace=NoColorSpace] - The texture's color space.
   * @property {boolean} [depthBuffer=true] - Whether to allocate a depth buffer or not.
   * @property {boolean} [stencilBuffer=false] - Whether to allocate a stencil buffer or not.
   * @property {boolean} [resolveDepthBuffer=true] - Whether to resolve the depth buffer or not.
   * @property {boolean} [resolveStencilBuffer=true] - Whether  to resolve the stencil buffer or not.
   * @property {?Texture} [depthTexture=null] - Reference to a depth texture.
   * @property {number} [samples=0] - The MSAA samples count.
   * @property {number} [count=1] - Defines the number of color attachments . Must be at least `1`.
   * @property {number} [depth=1] - The texture depth.
   * @property {boolean} [multiview=false] - Whether this target is used for multiview rendering.
   */
  /**
   * Constructs a new render target.
   *
   * @param {number} [width=1] - The width of the render target.
   * @param {number} [height=1] - The height of the render target.
   * @param {RenderTarget~Options} [options] - The configuration object.
   */
  constructor(e = 1, t = 1, n = {}) {
    super(), n = Object.assign({
      generateMipmaps: !1,
      internalFormat: null,
      minFilter: An,
      depthBuffer: !0,
      stencilBuffer: !1,
      resolveDepthBuffer: !0,
      resolveStencilBuffer: !0,
      depthTexture: null,
      samples: 0,
      count: 1,
      depth: 1,
      multiview: !1
    }, n), this.isRenderTarget = !0, this.width = e, this.height = t, this.depth = n.depth, this.scissor = new vt(0, 0, e, t), this.scissorTest = !1, this.viewport = new vt(0, 0, e, t);
    const r = { width: e, height: t, depth: n.depth }, s = new Yt(r);
    this.textures = [];
    const a = n.count;
    for (let o = 0; o < a; o++)
      this.textures[o] = s.clone(), this.textures[o].isRenderTargetTexture = !0, this.textures[o].renderTarget = this;
    this._setTextureOptions(n), this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.resolveDepthBuffer = n.resolveDepthBuffer, this.resolveStencilBuffer = n.resolveStencilBuffer, this._depthTexture = null, this.depthTexture = n.depthTexture, this.samples = n.samples, this.multiview = n.multiview;
  }
  _setTextureOptions(e = {}) {
    const t = {
      minFilter: An,
      generateMipmaps: !1,
      flipY: !1,
      internalFormat: null
    };
    e.mapping !== void 0 && (t.mapping = e.mapping), e.wrapS !== void 0 && (t.wrapS = e.wrapS), e.wrapT !== void 0 && (t.wrapT = e.wrapT), e.wrapR !== void 0 && (t.wrapR = e.wrapR), e.magFilter !== void 0 && (t.magFilter = e.magFilter), e.minFilter !== void 0 && (t.minFilter = e.minFilter), e.format !== void 0 && (t.format = e.format), e.type !== void 0 && (t.type = e.type), e.anisotropy !== void 0 && (t.anisotropy = e.anisotropy), e.colorSpace !== void 0 && (t.colorSpace = e.colorSpace), e.flipY !== void 0 && (t.flipY = e.flipY), e.generateMipmaps !== void 0 && (t.generateMipmaps = e.generateMipmaps), e.internalFormat !== void 0 && (t.internalFormat = e.internalFormat);
    for (let n = 0; n < this.textures.length; n++)
      this.textures[n].setValues(t);
  }
  /**
   * The texture representing the default color attachment.
   *
   * @type {Texture}
   */
  get texture() {
    return this.textures[0];
  }
  set texture(e) {
    this.textures[0] = e;
  }
  set depthTexture(e) {
    this._depthTexture !== null && (this._depthTexture.renderTarget = null), e !== null && (e.renderTarget = this), this._depthTexture = e;
  }
  /**
   * Instead of saving the depth in a renderbuffer, a texture
   * can be used instead which is useful for further processing
   * e.g. in context of post-processing.
   *
   * @type {?DepthTexture}
   * @default null
   */
  get depthTexture() {
    return this._depthTexture;
  }
  /**
   * Sets the size of this render target.
   *
   * @param {number} width - The width.
   * @param {number} height - The height.
   * @param {number} [depth=1] - The depth.
   */
  setSize(e, t, n = 1) {
    if (this.width !== e || this.height !== t || this.depth !== n) {
      this.width = e, this.height = t, this.depth = n;
      for (let r = 0, s = this.textures.length; r < s; r++)
        this.textures[r].image.width = e, this.textures[r].image.height = t, this.textures[r].image.depth = n, this.textures[r].isArrayTexture = this.textures[r].image.depth > 1;
      this.dispose();
    }
    this.viewport.set(0, 0, e, t), this.scissor.set(0, 0, e, t);
  }
  /**
   * Returns a new render target with copied values from this instance.
   *
   * @return {RenderTarget} A clone of this instance.
   */
  clone() {
    return new this.constructor().copy(this);
  }
  /**
   * Copies the settings of the given render target. This is a structural copy so
   * no resources are shared between render targets after the copy. That includes
   * all MRT textures and the depth texture.
   *
   * @param {RenderTarget} source - The render target to copy.
   * @return {RenderTarget} A reference to this instance.
   */
  copy(e) {
    this.width = e.width, this.height = e.height, this.depth = e.depth, this.scissor.copy(e.scissor), this.scissorTest = e.scissorTest, this.viewport.copy(e.viewport), this.textures.length = 0;
    for (let t = 0, n = e.textures.length; t < n; t++) {
      this.textures[t] = e.textures[t].clone(), this.textures[t].isRenderTargetTexture = !0, this.textures[t].renderTarget = this;
      const r = Object.assign({}, e.textures[t].image);
      this.textures[t].source = new fo(r);
    }
    return this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.resolveDepthBuffer = e.resolveDepthBuffer, this.resolveStencilBuffer = e.resolveStencilBuffer, e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()), this.samples = e.samples, this;
  }
  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever this instance is no longer used in your app.
   *
   * @fires RenderTarget#dispose
   */
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
class wi extends bd {
  /**
   * Constructs a new 3D render target.
   *
   * @param {number} [width=1] - The width of the render target.
   * @param {number} [height=1] - The height of the render target.
   * @param {RenderTarget~Options} [options] - The configuration object.
   */
  constructor(e = 1, t = 1, n = {}) {
    super(e, t, n), this.isWebGLRenderTarget = !0;
  }
}
class _c extends Yt {
  /**
   * Constructs a new data array texture.
   *
   * @param {?TypedArray} [data=null] - The buffer data.
   * @param {number} [width=1] - The width of the texture.
   * @param {number} [height=1] - The height of the texture.
   * @param {number} [depth=1] - The depth of the texture.
   */
  constructor(e = null, t = 1, n = 1, r = 1) {
    super(null), this.isDataArrayTexture = !0, this.image = { data: e, width: t, height: n, depth: r }, this.magFilter = Mn, this.minFilter = Mn, this.wrapR = vi, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
  }
  /**
   * Describes that a specific layer of the texture needs to be updated.
   * Normally when {@link Texture#needsUpdate} is set to `true`, the
   * entire data texture array is sent to the GPU. Marking specific
   * layers will only transmit subsets of all mipmaps associated with a
   * specific depth in the array which is often much more performant.
   *
   * @param {number} layerIndex - The layer index that should be updated.
   */
  addLayerUpdate(e) {
    this.layerUpdates.add(e);
  }
  /**
   * Resets the layer updates registry.
   */
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
}
class Ed extends Yt {
  /**
   * Constructs a new data array texture.
   *
   * @param {?TypedArray} [data=null] - The buffer data.
   * @param {number} [width=1] - The width of the texture.
   * @param {number} [height=1] - The height of the texture.
   * @param {number} [depth=1] - The depth of the texture.
   */
  constructor(e = null, t = 1, n = 1, r = 1) {
    super(null), this.isData3DTexture = !0, this.image = { data: e, width: t, height: n, depth: r }, this.magFilter = Mn, this.minFilter = Mn, this.wrapR = vi, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
class rr {
  /**
   * Constructs a new bounding box.
   *
   * @param {Vector3} [min=(Infinity,Infinity,Infinity)] - A vector representing the lower boundary of the box.
   * @param {Vector3} [max=(-Infinity,-Infinity,-Infinity)] - A vector representing the upper boundary of the box.
   */
  constructor(e = new N(1 / 0, 1 / 0, 1 / 0), t = new N(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = !0, this.min = e, this.max = t;
  }
  /**
   * Sets the lower and upper boundaries of this box.
   * Please note that this method only copies the values from the given objects.
   *
   * @param {Vector3} min - The lower boundary of the box.
   * @param {Vector3} max - The upper boundary of the box.
   * @return {Box3} A reference to this bounding box.
   */
  set(e, t) {
    return this.min.copy(e), this.max.copy(t), this;
  }
  /**
   * Sets the upper and lower bounds of this box so it encloses the position data
   * in the given array.
   *
   * @param {Array<number>} array - An array holding 3D position data.
   * @return {Box3} A reference to this bounding box.
   */
  setFromArray(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t += 3)
      this.expandByPoint(fn.fromArray(e, t));
    return this;
  }
  /**
   * Sets the upper and lower bounds of this box so it encloses the position data
   * in the given buffer attribute.
   *
   * @param {BufferAttribute} attribute - A buffer attribute holding 3D position data.
   * @return {Box3} A reference to this bounding box.
   */
  setFromBufferAttribute(e) {
    this.makeEmpty();
    for (let t = 0, n = e.count; t < n; t++)
      this.expandByPoint(fn.fromBufferAttribute(e, t));
    return this;
  }
  /**
   * Sets the upper and lower bounds of this box so it encloses the position data
   * in the given array.
   *
   * @param {Array<Vector3>} points - An array holding 3D position data as instances of {@link Vector3}.
   * @return {Box3} A reference to this bounding box.
   */
  setFromPoints(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t++)
      this.expandByPoint(e[t]);
    return this;
  }
  /**
   * Centers this box on the given center vector and sets this box's width, height and
   * depth to the given size values.
   *
   * @param {Vector3} center - The center of the box.
   * @param {Vector3} size - The x, y and z dimensions of the box.
   * @return {Box3} A reference to this bounding box.
   */
  setFromCenterAndSize(e, t) {
    const n = fn.copy(t).multiplyScalar(0.5);
    return this.min.copy(e).sub(n), this.max.copy(e).add(n), this;
  }
  /**
   * Computes the world-axis-aligned bounding box for the given 3D object
   * (including its children), accounting for the object's, and children's,
   * world transforms. The function may result in a larger box than strictly necessary.
   *
   * @param {Object3D} object - The 3D object to compute the bounding box for.
   * @param {boolean} [precise=false] - If set to `true`, the method computes the smallest
   * world-axis-aligned bounding box at the expense of more computation.
   * @return {Box3} A reference to this bounding box.
   */
  setFromObject(e, t = !1) {
    return this.makeEmpty(), this.expandByObject(e, t);
  }
  /**
   * Returns a new box with copied values from this instance.
   *
   * @return {Box3} A clone of this instance.
   */
  clone() {
    return new this.constructor().copy(this);
  }
  /**
   * Copies the values of the given box to this instance.
   *
   * @param {Box3} box - The box to copy.
   * @return {Box3} A reference to this bounding box.
   */
  copy(e) {
    return this.min.copy(e.min), this.max.copy(e.max), this;
  }
  /**
   * Makes this box empty which means in encloses a zero space in 3D.
   *
   * @return {Box3} A reference to this bounding box.
   */
  makeEmpty() {
    return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this;
  }
  /**
   * Returns true if this box includes zero points within its bounds.
   * Note that a box with equal lower and upper bounds still includes one
   * point, the one both bounds share.
   *
   * @return {boolean} Whether this box is empty or not.
   */
  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
  }
  /**
   * Returns the center point of this box.
   *
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The center point.
   */
  getCenter(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  /**
   * Returns the dimensions of this box.
   *
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The size.
   */
  getSize(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min);
  }
  /**
   * Expands the boundaries of this box to include the given point.
   *
   * @param {Vector3} point - The point that should be included by the bounding box.
   * @return {Box3} A reference to this bounding box.
   */
  expandByPoint(e) {
    return this.min.min(e), this.max.max(e), this;
  }
  /**
   * Expands this box equilaterally by the given vector. The width of this
   * box will be expanded by the x component of the vector in both
   * directions. The height of this box will be expanded by the y component of
   * the vector in both directions. The depth of this box will be
   * expanded by the z component of the vector in both directions.
   *
   * @param {Vector3} vector - The vector that should expand the bounding box.
   * @return {Box3} A reference to this bounding box.
   */
  expandByVector(e) {
    return this.min.sub(e), this.max.add(e), this;
  }
  /**
   * Expands each dimension of the box by the given scalar. If negative, the
   * dimensions of the box will be contracted.
   *
   * @param {number} scalar - The scalar value that should expand the bounding box.
   * @return {Box3} A reference to this bounding box.
   */
  expandByScalar(e) {
    return this.min.addScalar(-e), this.max.addScalar(e), this;
  }
  /**
   * Expands the boundaries of this box to include the given 3D object and
   * its children, accounting for the object's, and children's, world
   * transforms. The function may result in a larger box than strictly
   * necessary (unless the precise parameter is set to true).
   *
   * @param {Object3D} object - The 3D object that should expand the bounding box.
   * @param {boolean} precise - If set to `true`, the method expands the bounding box
   * as little as necessary at the expense of more computation.
   * @return {Box3} A reference to this bounding box.
   */
  expandByObject(e, t = !1) {
    e.updateWorldMatrix(!1, !1);
    const n = e.geometry;
    if (n !== void 0) {
      const s = n.getAttribute("position");
      if (t === !0 && s !== void 0 && e.isInstancedMesh !== !0)
        for (let a = 0, o = s.count; a < o; a++)
          e.isMesh === !0 ? e.getVertexPosition(a, fn) : fn.fromBufferAttribute(s, a), fn.applyMatrix4(e.matrixWorld), this.expandByPoint(fn);
      else
        e.boundingBox !== void 0 ? (e.boundingBox === null && e.computeBoundingBox(), Ir.copy(e.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), Ir.copy(n.boundingBox)), Ir.applyMatrix4(e.matrixWorld), this.union(Ir);
    }
    const r = e.children;
    for (let s = 0, a = r.length; s < a; s++)
      this.expandByObject(r[s], t);
    return this;
  }
  /**
   * Returns `true` if the given point lies within or on the boundaries of this box.
   *
   * @param {Vector3} point - The point to test.
   * @return {boolean} Whether the bounding box contains the given point or not.
   */
  containsPoint(e) {
    return e.x >= this.min.x && e.x <= this.max.x && e.y >= this.min.y && e.y <= this.max.y && e.z >= this.min.z && e.z <= this.max.z;
  }
  /**
   * Returns `true` if this bounding box includes the entirety of the given bounding box.
   * If this box and the given one are identical, this function also returns `true`.
   *
   * @param {Box3} box - The bounding box to test.
   * @return {boolean} Whether the bounding box contains the given bounding box or not.
   */
  containsBox(e) {
    return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y && this.min.z <= e.min.z && e.max.z <= this.max.z;
  }
  /**
   * Returns a point as a proportion of this box's width, height and depth.
   *
   * @param {Vector3} point - A point in 3D space.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} A point as a proportion of this box's width, height and depth.
   */
  getParameter(e, t) {
    return t.set(
      (e.x - this.min.x) / (this.max.x - this.min.x),
      (e.y - this.min.y) / (this.max.y - this.min.y),
      (e.z - this.min.z) / (this.max.z - this.min.z)
    );
  }
  /**
   * Returns `true` if the given bounding box intersects with this bounding box.
   *
   * @param {Box3} box - The bounding box to test.
   * @return {boolean} Whether the given bounding box intersects with this bounding box.
   */
  intersectsBox(e) {
    return e.max.x >= this.min.x && e.min.x <= this.max.x && e.max.y >= this.min.y && e.min.y <= this.max.y && e.max.z >= this.min.z && e.min.z <= this.max.z;
  }
  /**
   * Returns `true` if the given bounding sphere intersects with this bounding box.
   *
   * @param {Sphere} sphere - The bounding sphere to test.
   * @return {boolean} Whether the given bounding sphere intersects with this bounding box.
   */
  intersectsSphere(e) {
    return this.clampPoint(e.center, fn), fn.distanceToSquared(e.center) <= e.radius * e.radius;
  }
  /**
   * Returns `true` if the given plane intersects with this bounding box.
   *
   * @param {Plane} plane - The plane to test.
   * @return {boolean} Whether the given plane intersects with this bounding box.
   */
  intersectsPlane(e) {
    let t, n;
    return e.normal.x > 0 ? (t = e.normal.x * this.min.x, n = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, n = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, n += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, n += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, n += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, n += e.normal.z * this.min.z), t <= -e.constant && n >= -e.constant;
  }
  /**
   * Returns `true` if the given triangle intersects with this bounding box.
   *
   * @param {Triangle} triangle - The triangle to test.
   * @return {boolean} Whether the given triangle intersects with this bounding box.
   */
  intersectsTriangle(e) {
    if (this.isEmpty())
      return !1;
    this.getCenter(cr), Ur.subVectors(this.max, cr), Pi.subVectors(e.a, cr), Di.subVectors(e.b, cr), Li.subVectors(e.c, cr), Yn.subVectors(Di, Pi), jn.subVectors(Li, Di), li.subVectors(Pi, Li);
    let t = [
      0,
      -Yn.z,
      Yn.y,
      0,
      -jn.z,
      jn.y,
      0,
      -li.z,
      li.y,
      Yn.z,
      0,
      -Yn.x,
      jn.z,
      0,
      -jn.x,
      li.z,
      0,
      -li.x,
      -Yn.y,
      Yn.x,
      0,
      -jn.y,
      jn.x,
      0,
      -li.y,
      li.x,
      0
    ];
    return !Us(t, Pi, Di, Li, Ur) || (t = [1, 0, 0, 0, 1, 0, 0, 0, 1], !Us(t, Pi, Di, Li, Ur)) ? !1 : (Nr.crossVectors(Yn, jn), t = [Nr.x, Nr.y, Nr.z], Us(t, Pi, Di, Li, Ur));
  }
  /**
   * Clamps the given point within the bounds of this box.
   *
   * @param {Vector3} point - The point to clamp.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The clamped point.
   */
  clampPoint(e, t) {
    return t.copy(e).clamp(this.min, this.max);
  }
  /**
   * Returns the euclidean distance from any edge of this box to the specified point. If
   * the given point lies inside of this box, the distance will be `0`.
   *
   * @param {Vector3} point - The point to compute the distance to.
   * @return {number} The euclidean distance.
   */
  distanceToPoint(e) {
    return this.clampPoint(e, fn).distanceTo(e);
  }
  /**
   * Returns a bounding sphere that encloses this bounding box.
   *
   * @param {Sphere} target - The target sphere that is used to store the method's result.
   * @return {Sphere} The bounding sphere that encloses this bounding box.
   */
  getBoundingSphere(e) {
    return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(fn).length() * 0.5), e;
  }
  /**
   * Computes the intersection of this bounding box and the given one, setting the upper
   * bound of this box to the lesser of the two boxes' upper bounds and the
   * lower bound of this box to the greater of the two boxes' lower bounds. If
   * there's no overlap, makes this box empty.
   *
   * @param {Box3} box - The bounding box to intersect with.
   * @return {Box3} A reference to this bounding box.
   */
  intersect(e) {
    return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
  }
  /**
   * Computes the union of this box and another and the given one, setting the upper
   * bound of this box to the greater of the two boxes' upper bounds and the
   * lower bound of this box to the lesser of the two boxes' lower bounds.
   *
   * @param {Box3} box - The bounding box that will be unioned with this instance.
   * @return {Box3} A reference to this bounding box.
   */
  union(e) {
    return this.min.min(e.min), this.max.max(e.max), this;
  }
  /**
   * Transforms this bounding box by the given 4x4 transformation matrix.
   *
   * @param {Matrix4} matrix - The transformation matrix.
   * @return {Box3} A reference to this bounding box.
   */
  applyMatrix4(e) {
    return this.isEmpty() ? this : (Nn[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), Nn[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), Nn[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), Nn[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), Nn[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), Nn[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), Nn[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), Nn[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(Nn), this);
  }
  /**
   * Adds the given offset to both the upper and lower bounds of this bounding box,
   * effectively moving it in 3D space.
   *
   * @param {Vector3} offset - The offset that should be used to translate the bounding box.
   * @return {Box3} A reference to this bounding box.
   */
  translate(e) {
    return this.min.add(e), this.max.add(e), this;
  }
  /**
   * Returns `true` if this bounding box is equal with the given one.
   *
   * @param {Box3} box - The box to test for equality.
   * @return {boolean} Whether this bounding box is equal with the given one.
   */
  equals(e) {
    return e.min.equals(this.min) && e.max.equals(this.max);
  }
  /**
   * Returns a serialized structure of the bounding box.
   *
   * @return {Object} Serialized structure with fields representing the object state.
   */
  toJSON() {
    return {
      min: this.min.toArray(),
      max: this.max.toArray()
    };
  }
  /**
   * Returns a serialized structure of the bounding box.
   *
   * @param {Object} json - The serialized json to set the box from.
   * @return {Box3} A reference to this bounding box.
   */
  fromJSON(e) {
    return this.min.fromArray(e.min), this.max.fromArray(e.max), this;
  }
}
const Nn = [
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N()
], fn = /* @__PURE__ */ new N(), Ir = /* @__PURE__ */ new rr(), Pi = /* @__PURE__ */ new N(), Di = /* @__PURE__ */ new N(), Li = /* @__PURE__ */ new N(), Yn = /* @__PURE__ */ new N(), jn = /* @__PURE__ */ new N(), li = /* @__PURE__ */ new N(), cr = /* @__PURE__ */ new N(), Ur = /* @__PURE__ */ new N(), Nr = /* @__PURE__ */ new N(), ci = /* @__PURE__ */ new N();
function Us(i, e, t, n, r) {
  for (let s = 0, a = i.length - 3; s <= a; s += 3) {
    ci.fromArray(i, s);
    const o = r.x * Math.abs(ci.x) + r.y * Math.abs(ci.y) + r.z * Math.abs(ci.z), l = e.dot(ci), c = t.dot(ci), h = n.dot(ci);
    if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > o)
      return !1;
  }
  return !0;
}
const wd = /* @__PURE__ */ new rr(), hr = /* @__PURE__ */ new N(), Ns = /* @__PURE__ */ new N();
class bs {
  /**
   * Constructs a new sphere.
   *
   * @param {Vector3} [center=(0,0,0)] - The center of the sphere
   * @param {number} [radius=-1] - The radius of the sphere.
   */
  constructor(e = new N(), t = -1) {
    this.isSphere = !0, this.center = e, this.radius = t;
  }
  /**
   * Sets the sphere's components by copying the given values.
   *
   * @param {Vector3} center - The center.
   * @param {number} radius - The radius.
   * @return {Sphere} A reference to this sphere.
   */
  set(e, t) {
    return this.center.copy(e), this.radius = t, this;
  }
  /**
   * Computes the minimum bounding sphere for list of points.
   * If the optional center point is given, it is used as the sphere's
   * center. Otherwise, the center of the axis-aligned bounding box
   * encompassing the points is calculated.
   *
   * @param {Array<Vector3>} points - A list of points in 3D space.
   * @param {Vector3} [optionalCenter] - The center of the sphere.
   * @return {Sphere} A reference to this sphere.
   */
  setFromPoints(e, t) {
    const n = this.center;
    t !== void 0 ? n.copy(t) : wd.setFromPoints(e).getCenter(n);
    let r = 0;
    for (let s = 0, a = e.length; s < a; s++)
      r = Math.max(r, n.distanceToSquared(e[s]));
    return this.radius = Math.sqrt(r), this;
  }
  /**
   * Copies the values of the given sphere to this instance.
   *
   * @param {Sphere} sphere - The sphere to copy.
   * @return {Sphere} A reference to this sphere.
   */
  copy(e) {
    return this.center.copy(e.center), this.radius = e.radius, this;
  }
  /**
   * Returns `true` if the sphere is empty (the radius set to a negative number).
   *
   * Spheres with a radius of `0` contain only their center point and are not
   * considered to be empty.
   *
   * @return {boolean} Whether this sphere is empty or not.
   */
  isEmpty() {
    return this.radius < 0;
  }
  /**
   * Makes this sphere empty which means in encloses a zero space in 3D.
   *
   * @return {Sphere} A reference to this sphere.
   */
  makeEmpty() {
    return this.center.set(0, 0, 0), this.radius = -1, this;
  }
  /**
   * Returns `true` if this sphere contains the given point inclusive of
   * the surface of the sphere.
   *
   * @param {Vector3} point - The point to check.
   * @return {boolean} Whether this sphere contains the given point or not.
   */
  containsPoint(e) {
    return e.distanceToSquared(this.center) <= this.radius * this.radius;
  }
  /**
   * Returns the closest distance from the boundary of the sphere to the
   * given point. If the sphere contains the point, the distance will
   * be negative.
   *
   * @param {Vector3} point - The point to compute the distance to.
   * @return {number} The distance to the point.
   */
  distanceToPoint(e) {
    return e.distanceTo(this.center) - this.radius;
  }
  /**
   * Returns `true` if this sphere intersects with the given one.
   *
   * @param {Sphere} sphere - The sphere to test.
   * @return {boolean} Whether this sphere intersects with the given one or not.
   */
  intersectsSphere(e) {
    const t = this.radius + e.radius;
    return e.center.distanceToSquared(this.center) <= t * t;
  }
  /**
   * Returns `true` if this sphere intersects with the given box.
   *
   * @param {Box3} box - The box to test.
   * @return {boolean} Whether this sphere intersects with the given box or not.
   */
  intersectsBox(e) {
    return e.intersectsSphere(this);
  }
  /**
   * Returns `true` if this sphere intersects with the given plane.
   *
   * @param {Plane} plane - The plane to test.
   * @return {boolean} Whether this sphere intersects with the given plane or not.
   */
  intersectsPlane(e) {
    return Math.abs(e.distanceToPoint(this.center)) <= this.radius;
  }
  /**
   * Clamps a point within the sphere. If the point is outside the sphere, it
   * will clamp it to the closest point on the edge of the sphere. Points
   * already inside the sphere will not be affected.
   *
   * @param {Vector3} point - The plane to clamp.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The clamped point.
   */
  clampPoint(e, t) {
    const n = this.center.distanceToSquared(e);
    return t.copy(e), n > this.radius * this.radius && (t.sub(this.center).normalize(), t.multiplyScalar(this.radius).add(this.center)), t;
  }
  /**
   * Returns a bounding box that encloses this sphere.
   *
   * @param {Box3} target - The target box that is used to store the method's result.
   * @return {Box3} The bounding box that encloses this sphere.
   */
  getBoundingBox(e) {
    return this.isEmpty() ? (e.makeEmpty(), e) : (e.set(this.center, this.center), e.expandByScalar(this.radius), e);
  }
  /**
   * Transforms this sphere with the given 4x4 transformation matrix.
   *
   * @param {Matrix4} matrix - The transformation matrix.
   * @return {Sphere} A reference to this sphere.
   */
  applyMatrix4(e) {
    return this.center.applyMatrix4(e), this.radius = this.radius * e.getMaxScaleOnAxis(), this;
  }
  /**
   * Translates the sphere's center by the given offset.
   *
   * @param {Vector3} offset - The offset.
   * @return {Sphere} A reference to this sphere.
   */
  translate(e) {
    return this.center.add(e), this;
  }
  /**
   * Expands the boundaries of this sphere to include the given point.
   *
   * @param {Vector3} point - The point to include.
   * @return {Sphere} A reference to this sphere.
   */
  expandByPoint(e) {
    if (this.isEmpty())
      return this.center.copy(e), this.radius = 0, this;
    hr.subVectors(e, this.center);
    const t = hr.lengthSq();
    if (t > this.radius * this.radius) {
      const n = Math.sqrt(t), r = (n - this.radius) * 0.5;
      this.center.addScaledVector(hr, r / n), this.radius += r;
    }
    return this;
  }
  /**
   * Expands this sphere to enclose both the original sphere and the given sphere.
   *
   * @param {Sphere} sphere - The sphere to include.
   * @return {Sphere} A reference to this sphere.
   */
  union(e) {
    return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (Ns.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(hr.copy(e.center).add(Ns)), this.expandByPoint(hr.copy(e.center).sub(Ns))), this);
  }
  /**
   * Returns `true` if this sphere is equal with the given one.
   *
   * @param {Sphere} sphere - The sphere to test for equality.
   * @return {boolean} Whether this bounding sphere is equal with the given one.
   */
  equals(e) {
    return e.center.equals(this.center) && e.radius === this.radius;
  }
  /**
   * Returns a new sphere with copied values from this instance.
   *
   * @return {Sphere} A clone of this instance.
   */
  clone() {
    return new this.constructor().copy(this);
  }
  /**
   * Returns a serialized structure of the bounding sphere.
   *
   * @return {Object} Serialized structure with fields representing the object state.
   */
  toJSON() {
    return {
      radius: this.radius,
      center: this.center.toArray()
    };
  }
  /**
   * Returns a serialized structure of the bounding sphere.
   *
   * @param {Object} json - The serialized json to set the sphere from.
   * @return {Box3} A reference to this bounding sphere.
   */
  fromJSON(e) {
    return this.radius = e.radius, this.center.fromArray(e.center), this;
  }
}
const Fn = /* @__PURE__ */ new N(), Fs = /* @__PURE__ */ new N(), Fr = /* @__PURE__ */ new N(), Kn = /* @__PURE__ */ new N(), Os = /* @__PURE__ */ new N(), Or = /* @__PURE__ */ new N(), ks = /* @__PURE__ */ new N();
class Es {
  /**
   * Constructs a new ray.
   *
   * @param {Vector3} [origin=(0,0,0)] - The origin of the ray.
   * @param {Vector3} [direction=(0,0,-1)] - The (normalized) direction of the ray.
   */
  constructor(e = new N(), t = new N(0, 0, -1)) {
    this.origin = e, this.direction = t;
  }
  /**
   * Sets the ray's components by copying the given values.
   *
   * @param {Vector3} origin - The origin.
   * @param {Vector3} direction - The direction.
   * @return {Ray} A reference to this ray.
   */
  set(e, t) {
    return this.origin.copy(e), this.direction.copy(t), this;
  }
  /**
   * Copies the values of the given ray to this instance.
   *
   * @param {Ray} ray - The ray to copy.
   * @return {Ray} A reference to this ray.
   */
  copy(e) {
    return this.origin.copy(e.origin), this.direction.copy(e.direction), this;
  }
  /**
   * Returns a vector that is located at a given distance along this ray.
   *
   * @param {number} t - The distance along the ray to retrieve a position for.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} A position on the ray.
   */
  at(e, t) {
    return t.copy(this.origin).addScaledVector(this.direction, e);
  }
  /**
   * Adjusts the direction of the ray to point at the given vector in world space.
   *
   * @param {Vector3} v - The target position.
   * @return {Ray} A reference to this ray.
   */
  lookAt(e) {
    return this.direction.copy(e).sub(this.origin).normalize(), this;
  }
  /**
   * Shift the origin of this ray along its direction by the given distance.
   *
   * @param {number} t - The distance along the ray to interpolate.
   * @return {Ray} A reference to this ray.
   */
  recast(e) {
    return this.origin.copy(this.at(e, Fn)), this;
  }
  /**
   * Returns the point along this ray that is closest to the given point.
   *
   * @param {Vector3} point - A point in 3D space to get the closet location on the ray for.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The closest point on this ray.
   */
  closestPointToPoint(e, t) {
    t.subVectors(e, this.origin);
    const n = t.dot(this.direction);
    return n < 0 ? t.copy(this.origin) : t.copy(this.origin).addScaledVector(this.direction, n);
  }
  /**
   * Returns the distance of the closest approach between this ray and the given point.
   *
   * @param {Vector3} point - A point in 3D space to compute the distance to.
   * @return {number} The distance.
   */
  distanceToPoint(e) {
    return Math.sqrt(this.distanceSqToPoint(e));
  }
  /**
   * Returns the squared distance of the closest approach between this ray and the given point.
   *
   * @param {Vector3} point - A point in 3D space to compute the distance to.
   * @return {number} The squared distance.
   */
  distanceSqToPoint(e) {
    const t = Fn.subVectors(e, this.origin).dot(this.direction);
    return t < 0 ? this.origin.distanceToSquared(e) : (Fn.copy(this.origin).addScaledVector(this.direction, t), Fn.distanceToSquared(e));
  }
  /**
   * Returns the squared distance between this ray and the given line segment.
   *
   * @param {Vector3} v0 - The start point of the line segment.
   * @param {Vector3} v1 - The end point of the line segment.
   * @param {Vector3} [optionalPointOnRay] - When provided, it receives the point on this ray that is closest to the segment.
   * @param {Vector3} [optionalPointOnSegment] - When provided, it receives the point on the line segment that is closest to this ray.
   * @return {number} The squared distance.
   */
  distanceSqToSegment(e, t, n, r) {
    Fs.copy(e).add(t).multiplyScalar(0.5), Fr.copy(t).sub(e).normalize(), Kn.copy(this.origin).sub(Fs);
    const s = e.distanceTo(t) * 0.5, a = -this.direction.dot(Fr), o = Kn.dot(this.direction), l = -Kn.dot(Fr), c = Kn.lengthSq(), h = Math.abs(1 - a * a);
    let d, u, p, g;
    if (h > 0)
      if (d = a * l - o, u = a * o - l, g = s * h, d >= 0)
        if (u >= -g)
          if (u <= g) {
            const _ = 1 / h;
            d *= _, u *= _, p = d * (d + a * u + 2 * o) + u * (a * d + u + 2 * l) + c;
          } else
            u = s, d = Math.max(0, -(a * u + o)), p = -d * d + u * (u + 2 * l) + c;
        else
          u = -s, d = Math.max(0, -(a * u + o)), p = -d * d + u * (u + 2 * l) + c;
      else
        u <= -g ? (d = Math.max(0, -(-a * s + o)), u = d > 0 ? -s : Math.min(Math.max(-s, -l), s), p = -d * d + u * (u + 2 * l) + c) : u <= g ? (d = 0, u = Math.min(Math.max(-s, -l), s), p = u * (u + 2 * l) + c) : (d = Math.max(0, -(a * s + o)), u = d > 0 ? s : Math.min(Math.max(-s, -l), s), p = -d * d + u * (u + 2 * l) + c);
    else
      u = a > 0 ? -s : s, d = Math.max(0, -(a * u + o)), p = -d * d + u * (u + 2 * l) + c;
    return n && n.copy(this.origin).addScaledVector(this.direction, d), r && r.copy(Fs).addScaledVector(Fr, u), p;
  }
  /**
   * Intersects this ray with the given sphere, returning the intersection
   * point or `null` if there is no intersection.
   *
   * @param {Sphere} sphere - The sphere to intersect.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {?Vector3} The intersection point.
   */
  intersectSphere(e, t) {
    Fn.subVectors(e.center, this.origin);
    const n = Fn.dot(this.direction), r = Fn.dot(Fn) - n * n, s = e.radius * e.radius;
    if (r > s) return null;
    const a = Math.sqrt(s - r), o = n - a, l = n + a;
    return l < 0 ? null : o < 0 ? this.at(l, t) : this.at(o, t);
  }
  /**
   * Returns `true` if this ray intersects with the given sphere.
   *
   * @param {Sphere} sphere - The sphere to intersect.
   * @return {boolean} Whether this ray intersects with the given sphere or not.
   */
  intersectsSphere(e) {
    return e.radius < 0 ? !1 : this.distanceSqToPoint(e.center) <= e.radius * e.radius;
  }
  /**
   * Computes the distance from the ray's origin to the given plane. Returns `null` if the ray
   * does not intersect with the plane.
   *
   * @param {Plane} plane - The plane to compute the distance to.
   * @return {?number} Whether this ray intersects with the given sphere or not.
   */
  distanceToPlane(e) {
    const t = e.normal.dot(this.direction);
    if (t === 0)
      return e.distanceToPoint(this.origin) === 0 ? 0 : null;
    const n = -(this.origin.dot(e.normal) + e.constant) / t;
    return n >= 0 ? n : null;
  }
  /**
   * Intersects this ray with the given plane, returning the intersection
   * point or `null` if there is no intersection.
   *
   * @param {Plane} plane - The plane to intersect.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {?Vector3} The intersection point.
   */
  intersectPlane(e, t) {
    const n = this.distanceToPlane(e);
    return n === null ? null : this.at(n, t);
  }
  /**
   * Returns `true` if this ray intersects with the given plane.
   *
   * @param {Plane} plane - The plane to intersect.
   * @return {boolean} Whether this ray intersects with the given plane or not.
   */
  intersectsPlane(e) {
    const t = e.distanceToPoint(this.origin);
    return t === 0 || e.normal.dot(this.direction) * t < 0;
  }
  /**
   * Intersects this ray with the given bounding box, returning the intersection
   * point or `null` if there is no intersection.
   *
   * @param {Box3} box - The box to intersect.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {?Vector3} The intersection point.
   */
  intersectBox(e, t) {
    let n, r, s, a, o, l;
    const c = 1 / this.direction.x, h = 1 / this.direction.y, d = 1 / this.direction.z, u = this.origin;
    return c >= 0 ? (n = (e.min.x - u.x) * c, r = (e.max.x - u.x) * c) : (n = (e.max.x - u.x) * c, r = (e.min.x - u.x) * c), h >= 0 ? (s = (e.min.y - u.y) * h, a = (e.max.y - u.y) * h) : (s = (e.max.y - u.y) * h, a = (e.min.y - u.y) * h), n > a || s > r || ((s > n || isNaN(n)) && (n = s), (a < r || isNaN(r)) && (r = a), d >= 0 ? (o = (e.min.z - u.z) * d, l = (e.max.z - u.z) * d) : (o = (e.max.z - u.z) * d, l = (e.min.z - u.z) * d), n > l || o > r) || ((o > n || n !== n) && (n = o), (l < r || r !== r) && (r = l), r < 0) ? null : this.at(n >= 0 ? n : r, t);
  }
  /**
   * Returns `true` if this ray intersects with the given box.
   *
   * @param {Box3} box - The box to intersect.
   * @return {boolean} Whether this ray intersects with the given box or not.
   */
  intersectsBox(e) {
    return this.intersectBox(e, Fn) !== null;
  }
  /**
   * Intersects this ray with the given triangle, returning the intersection
   * point or `null` if there is no intersection.
   *
   * @param {Vector3} a - The first vertex of the triangle.
   * @param {Vector3} b - The second vertex of the triangle.
   * @param {Vector3} c - The third vertex of the triangle.
   * @param {boolean} backfaceCulling - Whether to use backface culling or not.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {?Vector3} The intersection point.
   */
  intersectTriangle(e, t, n, r, s) {
    Os.subVectors(t, e), Or.subVectors(n, e), ks.crossVectors(Os, Or);
    let a = this.direction.dot(ks), o;
    if (a > 0) {
      if (r) return null;
      o = 1;
    } else if (a < 0)
      o = -1, a = -a;
    else
      return null;
    Kn.subVectors(this.origin, e);
    const l = o * this.direction.dot(Or.crossVectors(Kn, Or));
    if (l < 0)
      return null;
    const c = o * this.direction.dot(Os.cross(Kn));
    if (c < 0 || l + c > a)
      return null;
    const h = -o * Kn.dot(ks);
    return h < 0 ? null : this.at(h / a, s);
  }
  /**
   * Transforms this ray with the given 4x4 transformation matrix.
   *
   * @param {Matrix4} matrix4 - The transformation matrix.
   * @return {Ray} A reference to this ray.
   */
  applyMatrix4(e) {
    return this.origin.applyMatrix4(e), this.direction.transformDirection(e), this;
  }
  /**
   * Returns `true` if this ray is equal with the given one.
   *
   * @param {Ray} ray - The ray to test for equality.
   * @return {boolean} Whether this ray is equal with the given one.
   */
  equals(e) {
    return e.origin.equals(this.origin) && e.direction.equals(this.direction);
  }
  /**
   * Returns a new ray with copied values from this instance.
   *
   * @return {Ray} A clone of this instance.
   */
  clone() {
    return new this.constructor().copy(this);
  }
}
class lt {
  /**
   * Constructs a new 4x4 matrix. The arguments are supposed to be
   * in row-major order. If no arguments are provided, the constructor
   * initializes the matrix as an identity matrix.
   *
   * @param {number} [n11] - 1-1 matrix element.
   * @param {number} [n12] - 1-2 matrix element.
   * @param {number} [n13] - 1-3 matrix element.
   * @param {number} [n14] - 1-4 matrix element.
   * @param {number} [n21] - 2-1 matrix element.
   * @param {number} [n22] - 2-2 matrix element.
   * @param {number} [n23] - 2-3 matrix element.
   * @param {number} [n24] - 2-4 matrix element.
   * @param {number} [n31] - 3-1 matrix element.
   * @param {number} [n32] - 3-2 matrix element.
   * @param {number} [n33] - 3-3 matrix element.
   * @param {number} [n34] - 3-4 matrix element.
   * @param {number} [n41] - 4-1 matrix element.
   * @param {number} [n42] - 4-2 matrix element.
   * @param {number} [n43] - 4-3 matrix element.
   * @param {number} [n44] - 4-4 matrix element.
   */
  constructor(e, t, n, r, s, a, o, l, c, h, d, u, p, g, _, m) {
    lt.prototype.isMatrix4 = !0, this.elements = [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ], e !== void 0 && this.set(e, t, n, r, s, a, o, l, c, h, d, u, p, g, _, m);
  }
  /**
   * Sets the elements of the matrix.The arguments are supposed to be
   * in row-major order.
   *
   * @param {number} [n11] - 1-1 matrix element.
   * @param {number} [n12] - 1-2 matrix element.
   * @param {number} [n13] - 1-3 matrix element.
   * @param {number} [n14] - 1-4 matrix element.
   * @param {number} [n21] - 2-1 matrix element.
   * @param {number} [n22] - 2-2 matrix element.
   * @param {number} [n23] - 2-3 matrix element.
   * @param {number} [n24] - 2-4 matrix element.
   * @param {number} [n31] - 3-1 matrix element.
   * @param {number} [n32] - 3-2 matrix element.
   * @param {number} [n33] - 3-3 matrix element.
   * @param {number} [n34] - 3-4 matrix element.
   * @param {number} [n41] - 4-1 matrix element.
   * @param {number} [n42] - 4-2 matrix element.
   * @param {number} [n43] - 4-3 matrix element.
   * @param {number} [n44] - 4-4 matrix element.
   * @return {Matrix4} A reference to this matrix.
   */
  set(e, t, n, r, s, a, o, l, c, h, d, u, p, g, _, m) {
    const f = this.elements;
    return f[0] = e, f[4] = t, f[8] = n, f[12] = r, f[1] = s, f[5] = a, f[9] = o, f[13] = l, f[2] = c, f[6] = h, f[10] = d, f[14] = u, f[3] = p, f[7] = g, f[11] = _, f[15] = m, this;
  }
  /**
   * Sets this matrix to the 4x4 identity matrix.
   *
   * @return {Matrix4} A reference to this matrix.
   */
  identity() {
    return this.set(
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  /**
   * Returns a matrix with copied values from this instance.
   *
   * @return {Matrix4} A clone of this instance.
   */
  clone() {
    return new lt().fromArray(this.elements);
  }
  /**
   * Copies the values of the given matrix to this instance.
   *
   * @param {Matrix4} m - The matrix to copy.
   * @return {Matrix4} A reference to this matrix.
   */
  copy(e) {
    const t = this.elements, n = e.elements;
    return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], t[9] = n[9], t[10] = n[10], t[11] = n[11], t[12] = n[12], t[13] = n[13], t[14] = n[14], t[15] = n[15], this;
  }
  /**
   * Copies the translation component of the given matrix
   * into this matrix's translation component.
   *
   * @param {Matrix4} m - The matrix to copy the translation component.
   * @return {Matrix4} A reference to this matrix.
   */
  copyPosition(e) {
    const t = this.elements, n = e.elements;
    return t[12] = n[12], t[13] = n[13], t[14] = n[14], this;
  }
  /**
   * Set the upper 3x3 elements of this matrix to the values of given 3x3 matrix.
   *
   * @param {Matrix3} m - The 3x3 matrix.
   * @return {Matrix4} A reference to this matrix.
   */
  setFromMatrix3(e) {
    const t = e.elements;
    return this.set(
      t[0],
      t[3],
      t[6],
      0,
      t[1],
      t[4],
      t[7],
      0,
      t[2],
      t[5],
      t[8],
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  /**
   * Extracts the basis of this matrix into the three axis vectors provided.
   *
   * @param {Vector3} xAxis - The basis's x axis.
   * @param {Vector3} yAxis - The basis's y axis.
   * @param {Vector3} zAxis - The basis's z axis.
   * @return {Matrix4} A reference to this matrix.
   */
  extractBasis(e, t, n) {
    return e.setFromMatrixColumn(this, 0), t.setFromMatrixColumn(this, 1), n.setFromMatrixColumn(this, 2), this;
  }
  /**
   * Sets the given basis vectors to this matrix.
   *
   * @param {Vector3} xAxis - The basis's x axis.
   * @param {Vector3} yAxis - The basis's y axis.
   * @param {Vector3} zAxis - The basis's z axis.
   * @return {Matrix4} A reference to this matrix.
   */
  makeBasis(e, t, n) {
    return this.set(
      e.x,
      t.x,
      n.x,
      0,
      e.y,
      t.y,
      n.y,
      0,
      e.z,
      t.z,
      n.z,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  /**
   * Extracts the rotation component of the given matrix
   * into this matrix's rotation component.
   *
   * Note: This method does not support reflection matrices.
   *
   * @param {Matrix4} m - The matrix.
   * @return {Matrix4} A reference to this matrix.
   */
  extractRotation(e) {
    const t = this.elements, n = e.elements, r = 1 / Ii.setFromMatrixColumn(e, 0).length(), s = 1 / Ii.setFromMatrixColumn(e, 1).length(), a = 1 / Ii.setFromMatrixColumn(e, 2).length();
    return t[0] = n[0] * r, t[1] = n[1] * r, t[2] = n[2] * r, t[3] = 0, t[4] = n[4] * s, t[5] = n[5] * s, t[6] = n[6] * s, t[7] = 0, t[8] = n[8] * a, t[9] = n[9] * a, t[10] = n[10] * a, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
  }
  /**
   * Sets the rotation component (the upper left 3x3 matrix) of this matrix to
   * the rotation specified by the given Euler angles. The rest of
   * the matrix is set to the identity. Depending on the {@link Euler#order},
   * there are six possible outcomes. See [this page]{@link https://en.wikipedia.org/wiki/Euler_angles#Rotation_matrix}
   * for a complete list.
   *
   * @param {Euler} euler - The Euler angles.
   * @return {Matrix4} A reference to this matrix.
   */
  makeRotationFromEuler(e) {
    const t = this.elements, n = e.x, r = e.y, s = e.z, a = Math.cos(n), o = Math.sin(n), l = Math.cos(r), c = Math.sin(r), h = Math.cos(s), d = Math.sin(s);
    if (e.order === "XYZ") {
      const u = a * h, p = a * d, g = o * h, _ = o * d;
      t[0] = l * h, t[4] = -l * d, t[8] = c, t[1] = p + g * c, t[5] = u - _ * c, t[9] = -o * l, t[2] = _ - u * c, t[6] = g + p * c, t[10] = a * l;
    } else if (e.order === "YXZ") {
      const u = l * h, p = l * d, g = c * h, _ = c * d;
      t[0] = u + _ * o, t[4] = g * o - p, t[8] = a * c, t[1] = a * d, t[5] = a * h, t[9] = -o, t[2] = p * o - g, t[6] = _ + u * o, t[10] = a * l;
    } else if (e.order === "ZXY") {
      const u = l * h, p = l * d, g = c * h, _ = c * d;
      t[0] = u - _ * o, t[4] = -a * d, t[8] = g + p * o, t[1] = p + g * o, t[5] = a * h, t[9] = _ - u * o, t[2] = -a * c, t[6] = o, t[10] = a * l;
    } else if (e.order === "ZYX") {
      const u = a * h, p = a * d, g = o * h, _ = o * d;
      t[0] = l * h, t[4] = g * c - p, t[8] = u * c + _, t[1] = l * d, t[5] = _ * c + u, t[9] = p * c - g, t[2] = -c, t[6] = o * l, t[10] = a * l;
    } else if (e.order === "YZX") {
      const u = a * l, p = a * c, g = o * l, _ = o * c;
      t[0] = l * h, t[4] = _ - u * d, t[8] = g * d + p, t[1] = d, t[5] = a * h, t[9] = -o * h, t[2] = -c * h, t[6] = p * d + g, t[10] = u - _ * d;
    } else if (e.order === "XZY") {
      const u = a * l, p = a * c, g = o * l, _ = o * c;
      t[0] = l * h, t[4] = -d, t[8] = c * h, t[1] = u * d + _, t[5] = a * h, t[9] = p * d - g, t[2] = g * d - p, t[6] = o * h, t[10] = _ * d + u;
    }
    return t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
  }
  /**
   * Sets the rotation component of this matrix to the rotation specified by
   * the given Quaternion as outlined [here]{@link https://en.wikipedia.org/wiki/Rotation_matrix#Quaternion}
   * The rest of the matrix is set to the identity.
   *
   * @param {Quaternion} q - The Quaternion.
   * @return {Matrix4} A reference to this matrix.
   */
  makeRotationFromQuaternion(e) {
    return this.compose(Td, e, Ad);
  }
  /**
   * Sets the rotation component of the transformation matrix, looking from `eye` towards
   * `target`, and oriented by the up-direction.
   *
   * @param {Vector3} eye - The eye vector.
   * @param {Vector3} target - The target vector.
   * @param {Vector3} up - The up vector.
   * @return {Matrix4} A reference to this matrix.
   */
  lookAt(e, t, n) {
    const r = this.elements;
    return tn.subVectors(e, t), tn.lengthSq() === 0 && (tn.z = 1), tn.normalize(), Zn.crossVectors(n, tn), Zn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? tn.x += 1e-4 : tn.z += 1e-4, tn.normalize(), Zn.crossVectors(n, tn)), Zn.normalize(), kr.crossVectors(tn, Zn), r[0] = Zn.x, r[4] = kr.x, r[8] = tn.x, r[1] = Zn.y, r[5] = kr.y, r[9] = tn.y, r[2] = Zn.z, r[6] = kr.z, r[10] = tn.z, this;
  }
  /**
   * Post-multiplies this matrix by the given 4x4 matrix.
   *
   * @param {Matrix4} m - The matrix to multiply with.
   * @return {Matrix4} A reference to this matrix.
   */
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  /**
   * Pre-multiplies this matrix by the given 4x4 matrix.
   *
   * @param {Matrix4} m - The matrix to multiply with.
   * @return {Matrix4} A reference to this matrix.
   */
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  /**
   * Multiples the given 4x4 matrices and stores the result
   * in this matrix.
   *
   * @param {Matrix4} a - The first matrix.
   * @param {Matrix4} b - The second matrix.
   * @return {Matrix4} A reference to this matrix.
   */
  multiplyMatrices(e, t) {
    const n = e.elements, r = t.elements, s = this.elements, a = n[0], o = n[4], l = n[8], c = n[12], h = n[1], d = n[5], u = n[9], p = n[13], g = n[2], _ = n[6], m = n[10], f = n[14], T = n[3], b = n[7], y = n[11], w = n[15], R = r[0], P = r[4], O = r[8], S = r[12], M = r[1], L = r[5], H = r[9], $ = r[13], Z = r[2], A = r[6], U = r[10], V = r[14], D = r[3], F = r[7], X = r[11], ne = r[15];
    return s[0] = a * R + o * M + l * Z + c * D, s[4] = a * P + o * L + l * A + c * F, s[8] = a * O + o * H + l * U + c * X, s[12] = a * S + o * $ + l * V + c * ne, s[1] = h * R + d * M + u * Z + p * D, s[5] = h * P + d * L + u * A + p * F, s[9] = h * O + d * H + u * U + p * X, s[13] = h * S + d * $ + u * V + p * ne, s[2] = g * R + _ * M + m * Z + f * D, s[6] = g * P + _ * L + m * A + f * F, s[10] = g * O + _ * H + m * U + f * X, s[14] = g * S + _ * $ + m * V + f * ne, s[3] = T * R + b * M + y * Z + w * D, s[7] = T * P + b * L + y * A + w * F, s[11] = T * O + b * H + y * U + w * X, s[15] = T * S + b * $ + y * V + w * ne, this;
  }
  /**
   * Multiplies every component of the matrix by the given scalar.
   *
   * @param {number} s - The scalar.
   * @return {Matrix4} A reference to this matrix.
   */
  multiplyScalar(e) {
    const t = this.elements;
    return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this;
  }
  /**
   * Computes and returns the determinant of this matrix.
   *
   * Based on the method outlined [here]{@link http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.html}.
   *
   * @return {number} The determinant.
   */
  determinant() {
    const e = this.elements, t = e[0], n = e[4], r = e[8], s = e[12], a = e[1], o = e[5], l = e[9], c = e[13], h = e[2], d = e[6], u = e[10], p = e[14], g = e[3], _ = e[7], m = e[11], f = e[15];
    return g * (+s * l * d - r * c * d - s * o * u + n * c * u + r * o * p - n * l * p) + _ * (+t * l * p - t * c * u + s * a * u - r * a * p + r * c * h - s * l * h) + m * (+t * c * d - t * o * p - s * a * d + n * a * p + s * o * h - n * c * h) + f * (-r * o * h - t * l * d + t * o * u + r * a * d - n * a * u + n * l * h);
  }
  /**
   * Transposes this matrix in place.
   *
   * @return {Matrix4} A reference to this matrix.
   */
  transpose() {
    const e = this.elements;
    let t;
    return t = e[1], e[1] = e[4], e[4] = t, t = e[2], e[2] = e[8], e[8] = t, t = e[6], e[6] = e[9], e[9] = t, t = e[3], e[3] = e[12], e[12] = t, t = e[7], e[7] = e[13], e[13] = t, t = e[11], e[11] = e[14], e[14] = t, this;
  }
  /**
   * Sets the position component for this matrix from the given vector,
   * without affecting the rest of the matrix.
   *
   * @param {number|Vector3} x - The x component of the vector or alternatively the vector object.
   * @param {number} y - The y component of the vector.
   * @param {number} z - The z component of the vector.
   * @return {Matrix4} A reference to this matrix.
   */
  setPosition(e, t, n) {
    const r = this.elements;
    return e.isVector3 ? (r[12] = e.x, r[13] = e.y, r[14] = e.z) : (r[12] = e, r[13] = t, r[14] = n), this;
  }
  /**
   * Inverts this matrix, using the [analytic method]{@link https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution}.
   * You can not invert with a determinant of zero. If you attempt this, the method produces
   * a zero matrix instead.
   *
   * @return {Matrix4} A reference to this matrix.
   */
  invert() {
    const e = this.elements, t = e[0], n = e[1], r = e[2], s = e[3], a = e[4], o = e[5], l = e[6], c = e[7], h = e[8], d = e[9], u = e[10], p = e[11], g = e[12], _ = e[13], m = e[14], f = e[15], T = d * m * c - _ * u * c + _ * l * p - o * m * p - d * l * f + o * u * f, b = g * u * c - h * m * c - g * l * p + a * m * p + h * l * f - a * u * f, y = h * _ * c - g * d * c + g * o * p - a * _ * p - h * o * f + a * d * f, w = g * d * l - h * _ * l - g * o * u + a * _ * u + h * o * m - a * d * m, R = t * T + n * b + r * y + s * w;
    if (R === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const P = 1 / R;
    return e[0] = T * P, e[1] = (_ * u * s - d * m * s - _ * r * p + n * m * p + d * r * f - n * u * f) * P, e[2] = (o * m * s - _ * l * s + _ * r * c - n * m * c - o * r * f + n * l * f) * P, e[3] = (d * l * s - o * u * s - d * r * c + n * u * c + o * r * p - n * l * p) * P, e[4] = b * P, e[5] = (h * m * s - g * u * s + g * r * p - t * m * p - h * r * f + t * u * f) * P, e[6] = (g * l * s - a * m * s - g * r * c + t * m * c + a * r * f - t * l * f) * P, e[7] = (a * u * s - h * l * s + h * r * c - t * u * c - a * r * p + t * l * p) * P, e[8] = y * P, e[9] = (g * d * s - h * _ * s - g * n * p + t * _ * p + h * n * f - t * d * f) * P, e[10] = (a * _ * s - g * o * s + g * n * c - t * _ * c - a * n * f + t * o * f) * P, e[11] = (h * o * s - a * d * s - h * n * c + t * d * c + a * n * p - t * o * p) * P, e[12] = w * P, e[13] = (h * _ * r - g * d * r + g * n * u - t * _ * u - h * n * m + t * d * m) * P, e[14] = (g * o * r - a * _ * r - g * n * l + t * _ * l + a * n * m - t * o * m) * P, e[15] = (a * d * r - h * o * r + h * n * l - t * d * l - a * n * u + t * o * u) * P, this;
  }
  /**
   * Multiplies the columns of this matrix by the given vector.
   *
   * @param {Vector3} v - The scale vector.
   * @return {Matrix4} A reference to this matrix.
   */
  scale(e) {
    const t = this.elements, n = e.x, r = e.y, s = e.z;
    return t[0] *= n, t[4] *= r, t[8] *= s, t[1] *= n, t[5] *= r, t[9] *= s, t[2] *= n, t[6] *= r, t[10] *= s, t[3] *= n, t[7] *= r, t[11] *= s, this;
  }
  /**
   * Gets the maximum scale value of the three axes.
   *
   * @return {number} The maximum scale.
   */
  getMaxScaleOnAxis() {
    const e = this.elements, t = e[0] * e[0] + e[1] * e[1] + e[2] * e[2], n = e[4] * e[4] + e[5] * e[5] + e[6] * e[6], r = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
    return Math.sqrt(Math.max(t, n, r));
  }
  /**
   * Sets this matrix as a translation transform from the given vector.
   *
   * @param {number|Vector3} x - The amount to translate in the X axis or alternatively a translation vector.
   * @param {number} y - The amount to translate in the Y axis.
   * @param {number} z - The amount to translate in the z axis.
   * @return {Matrix4} A reference to this matrix.
   */
  makeTranslation(e, t, n) {
    return e.isVector3 ? this.set(
      1,
      0,
      0,
      e.x,
      0,
      1,
      0,
      e.y,
      0,
      0,
      1,
      e.z,
      0,
      0,
      0,
      1
    ) : this.set(
      1,
      0,
      0,
      e,
      0,
      1,
      0,
      t,
      0,
      0,
      1,
      n,
      0,
      0,
      0,
      1
    ), this;
  }
  /**
   * Sets this matrix as a rotational transformation around the X axis by
   * the given angle.
   *
   * @param {number} theta - The rotation in radians.
   * @return {Matrix4} A reference to this matrix.
   */
  makeRotationX(e) {
    const t = Math.cos(e), n = Math.sin(e);
    return this.set(
      1,
      0,
      0,
      0,
      0,
      t,
      -n,
      0,
      0,
      n,
      t,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  /**
   * Sets this matrix as a rotational transformation around the Y axis by
   * the given angle.
   *
   * @param {number} theta - The rotation in radians.
   * @return {Matrix4} A reference to this matrix.
   */
  makeRotationY(e) {
    const t = Math.cos(e), n = Math.sin(e);
    return this.set(
      t,
      0,
      n,
      0,
      0,
      1,
      0,
      0,
      -n,
      0,
      t,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  /**
   * Sets this matrix as a rotational transformation around the Z axis by
   * the given angle.
   *
   * @param {number} theta - The rotation in radians.
   * @return {Matrix4} A reference to this matrix.
   */
  makeRotationZ(e) {
    const t = Math.cos(e), n = Math.sin(e);
    return this.set(
      t,
      -n,
      0,
      0,
      n,
      t,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  /**
   * Sets this matrix as a rotational transformation around the given axis by
   * the given angle.
   *
   * This is a somewhat controversial but mathematically sound alternative to
   * rotating via Quaternions. See the discussion [here]{@link https://www.gamedev.net/articles/programming/math-and-physics/do-we-really-need-quaternions-r1199}.
   *
   * @param {Vector3} axis - The normalized rotation axis.
   * @param {number} angle - The rotation in radians.
   * @return {Matrix4} A reference to this matrix.
   */
  makeRotationAxis(e, t) {
    const n = Math.cos(t), r = Math.sin(t), s = 1 - n, a = e.x, o = e.y, l = e.z, c = s * a, h = s * o;
    return this.set(
      c * a + n,
      c * o - r * l,
      c * l + r * o,
      0,
      c * o + r * l,
      h * o + n,
      h * l - r * a,
      0,
      c * l - r * o,
      h * l + r * a,
      s * l * l + n,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  /**
   * Sets this matrix as a scale transformation.
   *
   * @param {number} x - The amount to scale in the X axis.
   * @param {number} y - The amount to scale in the Y axis.
   * @param {number} z - The amount to scale in the Z axis.
   * @return {Matrix4} A reference to this matrix.
   */
  makeScale(e, t, n) {
    return this.set(
      e,
      0,
      0,
      0,
      0,
      t,
      0,
      0,
      0,
      0,
      n,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  /**
   * Sets this matrix as a shear transformation.
   *
   * @param {number} xy - The amount to shear X by Y.
   * @param {number} xz - The amount to shear X by Z.
   * @param {number} yx - The amount to shear Y by X.
   * @param {number} yz - The amount to shear Y by Z.
   * @param {number} zx - The amount to shear Z by X.
   * @param {number} zy - The amount to shear Z by Y.
   * @return {Matrix4} A reference to this matrix.
   */
  makeShear(e, t, n, r, s, a) {
    return this.set(
      1,
      n,
      s,
      0,
      e,
      1,
      a,
      0,
      t,
      r,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  /**
   * Sets this matrix to the transformation composed of the given position,
   * rotation (Quaternion) and scale.
   *
   * @param {Vector3} position - The position vector.
   * @param {Quaternion} quaternion - The rotation as a Quaternion.
   * @param {Vector3} scale - The scale vector.
   * @return {Matrix4} A reference to this matrix.
   */
  compose(e, t, n) {
    const r = this.elements, s = t._x, a = t._y, o = t._z, l = t._w, c = s + s, h = a + a, d = o + o, u = s * c, p = s * h, g = s * d, _ = a * h, m = a * d, f = o * d, T = l * c, b = l * h, y = l * d, w = n.x, R = n.y, P = n.z;
    return r[0] = (1 - (_ + f)) * w, r[1] = (p + y) * w, r[2] = (g - b) * w, r[3] = 0, r[4] = (p - y) * R, r[5] = (1 - (u + f)) * R, r[6] = (m + T) * R, r[7] = 0, r[8] = (g + b) * P, r[9] = (m - T) * P, r[10] = (1 - (u + _)) * P, r[11] = 0, r[12] = e.x, r[13] = e.y, r[14] = e.z, r[15] = 1, this;
  }
  /**
   * Decomposes this matrix into its position, rotation and scale components
   * and provides the result in the given objects.
   *
   * Note: Not all matrices are decomposable in this way. For example, if an
   * object has a non-uniformly scaled parent, then the object's world matrix
   * may not be decomposable, and this method may not be appropriate.
   *
   * @param {Vector3} position - The position vector.
   * @param {Quaternion} quaternion - The rotation as a Quaternion.
   * @param {Vector3} scale - The scale vector.
   * @return {Matrix4} A reference to this matrix.
   */
  decompose(e, t, n) {
    const r = this.elements;
    let s = Ii.set(r[0], r[1], r[2]).length();
    const a = Ii.set(r[4], r[5], r[6]).length(), o = Ii.set(r[8], r[9], r[10]).length();
    this.determinant() < 0 && (s = -s), e.x = r[12], e.y = r[13], e.z = r[14], pn.copy(this);
    const c = 1 / s, h = 1 / a, d = 1 / o;
    return pn.elements[0] *= c, pn.elements[1] *= c, pn.elements[2] *= c, pn.elements[4] *= h, pn.elements[5] *= h, pn.elements[6] *= h, pn.elements[8] *= d, pn.elements[9] *= d, pn.elements[10] *= d, t.setFromRotationMatrix(pn), n.x = s, n.y = a, n.z = o, this;
  }
  /**
  	 * Creates a perspective projection matrix. This is used internally by
  	 * {@link PerspectiveCamera#updateProjectionMatrix}.
  
  	 * @param {number} left - Left boundary of the viewing frustum at the near plane.
  	 * @param {number} right - Right boundary of the viewing frustum at the near plane.
  	 * @param {number} top - Top boundary of the viewing frustum at the near plane.
  	 * @param {number} bottom - Bottom boundary of the viewing frustum at the near plane.
  	 * @param {number} near - The distance from the camera to the near plane.
  	 * @param {number} far - The distance from the camera to the far plane.
  	 * @param {(WebGLCoordinateSystem|WebGPUCoordinateSystem)} [coordinateSystem=WebGLCoordinateSystem] - The coordinate system.
  	 * @param {boolean} [reversedDepth=false] - Whether to use a reversed depth.
  	 * @return {Matrix4} A reference to this matrix.
  	 */
  makePerspective(e, t, n, r, s, a, o = Rn, l = !1) {
    const c = this.elements, h = 2 * s / (t - e), d = 2 * s / (n - r), u = (t + e) / (t - e), p = (n + r) / (n - r);
    let g, _;
    if (l)
      g = s / (a - s), _ = a * s / (a - s);
    else if (o === Rn)
      g = -(a + s) / (a - s), _ = -2 * a * s / (a - s);
    else if (o === ps)
      g = -a / (a - s), _ = -a * s / (a - s);
    else
      throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
    return c[0] = h, c[4] = 0, c[8] = u, c[12] = 0, c[1] = 0, c[5] = d, c[9] = p, c[13] = 0, c[2] = 0, c[6] = 0, c[10] = g, c[14] = _, c[3] = 0, c[7] = 0, c[11] = -1, c[15] = 0, this;
  }
  /**
  	 * Creates a orthographic projection matrix. This is used internally by
  	 * {@link OrthographicCamera#updateProjectionMatrix}.
  
  	 * @param {number} left - Left boundary of the viewing frustum at the near plane.
  	 * @param {number} right - Right boundary of the viewing frustum at the near plane.
  	 * @param {number} top - Top boundary of the viewing frustum at the near plane.
  	 * @param {number} bottom - Bottom boundary of the viewing frustum at the near plane.
  	 * @param {number} near - The distance from the camera to the near plane.
  	 * @param {number} far - The distance from the camera to the far plane.
  	 * @param {(WebGLCoordinateSystem|WebGPUCoordinateSystem)} [coordinateSystem=WebGLCoordinateSystem] - The coordinate system.
  	 * @param {boolean} [reversedDepth=false] - Whether to use a reversed depth.
  	 * @return {Matrix4} A reference to this matrix.
  	 */
  makeOrthographic(e, t, n, r, s, a, o = Rn, l = !1) {
    const c = this.elements, h = 2 / (t - e), d = 2 / (n - r), u = -(t + e) / (t - e), p = -(n + r) / (n - r);
    let g, _;
    if (l)
      g = 1 / (a - s), _ = a / (a - s);
    else if (o === Rn)
      g = -2 / (a - s), _ = -(a + s) / (a - s);
    else if (o === ps)
      g = -1 / (a - s), _ = -s / (a - s);
    else
      throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
    return c[0] = h, c[4] = 0, c[8] = 0, c[12] = u, c[1] = 0, c[5] = d, c[9] = 0, c[13] = p, c[2] = 0, c[6] = 0, c[10] = g, c[14] = _, c[3] = 0, c[7] = 0, c[11] = 0, c[15] = 1, this;
  }
  /**
   * Returns `true` if this matrix is equal with the given one.
   *
   * @param {Matrix4} matrix - The matrix to test for equality.
   * @return {boolean} Whether this matrix is equal with the given one.
   */
  equals(e) {
    const t = this.elements, n = e.elements;
    for (let r = 0; r < 16; r++)
      if (t[r] !== n[r]) return !1;
    return !0;
  }
  /**
   * Sets the elements of the matrix from the given array.
   *
   * @param {Array<number>} array - The matrix elements in column-major order.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Matrix4} A reference to this matrix.
   */
  fromArray(e, t = 0) {
    for (let n = 0; n < 16; n++)
      this.elements[n] = e[n + t];
    return this;
  }
  /**
   * Writes the elements of this matrix to the given array. If no array is provided,
   * the method returns a new instance.
   *
   * @param {Array<number>} [array=[]] - The target array holding the matrix elements in column-major order.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Array<number>} The matrix elements in column-major order.
   */
  toArray(e = [], t = 0) {
    const n = this.elements;
    return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e[t + 9] = n[9], e[t + 10] = n[10], e[t + 11] = n[11], e[t + 12] = n[12], e[t + 13] = n[13], e[t + 14] = n[14], e[t + 15] = n[15], e;
  }
}
const Ii = /* @__PURE__ */ new N(), pn = /* @__PURE__ */ new lt(), Td = /* @__PURE__ */ new N(0, 0, 0), Ad = /* @__PURE__ */ new N(1, 1, 1), Zn = /* @__PURE__ */ new N(), kr = /* @__PURE__ */ new N(), tn = /* @__PURE__ */ new N(), qo = /* @__PURE__ */ new lt(), Yo = /* @__PURE__ */ new Ei();
class In {
  /**
   * Constructs a new euler instance.
   *
   * @param {number} [x=0] - The angle of the x axis in radians.
   * @param {number} [y=0] - The angle of the y axis in radians.
   * @param {number} [z=0] - The angle of the z axis in radians.
   * @param {string} [order=Euler.DEFAULT_ORDER] - A string representing the order that the rotations are applied.
   */
  constructor(e = 0, t = 0, n = 0, r = In.DEFAULT_ORDER) {
    this.isEuler = !0, this._x = e, this._y = t, this._z = n, this._order = r;
  }
  /**
   * The angle of the x axis in radians.
   *
   * @type {number}
   * @default 0
   */
  get x() {
    return this._x;
  }
  set x(e) {
    this._x = e, this._onChangeCallback();
  }
  /**
   * The angle of the y axis in radians.
   *
   * @type {number}
   * @default 0
   */
  get y() {
    return this._y;
  }
  set y(e) {
    this._y = e, this._onChangeCallback();
  }
  /**
   * The angle of the z axis in radians.
   *
   * @type {number}
   * @default 0
   */
  get z() {
    return this._z;
  }
  set z(e) {
    this._z = e, this._onChangeCallback();
  }
  /**
   * A string representing the order that the rotations are applied.
   *
   * @type {string}
   * @default 'XYZ'
   */
  get order() {
    return this._order;
  }
  set order(e) {
    this._order = e, this._onChangeCallback();
  }
  /**
   * Sets the Euler components.
   *
   * @param {number} x - The angle of the x axis in radians.
   * @param {number} y - The angle of the y axis in radians.
   * @param {number} z - The angle of the z axis in radians.
   * @param {string} [order] - A string representing the order that the rotations are applied.
   * @return {Euler} A reference to this Euler instance.
   */
  set(e, t, n, r = this._order) {
    return this._x = e, this._y = t, this._z = n, this._order = r, this._onChangeCallback(), this;
  }
  /**
   * Returns a new Euler instance with copied values from this instance.
   *
   * @return {Euler} A clone of this instance.
   */
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._order);
  }
  /**
   * Copies the values of the given Euler instance to this instance.
   *
   * @param {Euler} euler - The Euler instance to copy.
   * @return {Euler} A reference to this Euler instance.
   */
  copy(e) {
    return this._x = e._x, this._y = e._y, this._z = e._z, this._order = e._order, this._onChangeCallback(), this;
  }
  /**
   * Sets the angles of this Euler instance from a pure rotation matrix.
   *
   * @param {Matrix4} m - A 4x4 matrix of which the upper 3x3 of matrix is a pure rotation matrix (i.e. unscaled).
   * @param {string} [order] - A string representing the order that the rotations are applied.
   * @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
   * @return {Euler} A reference to this Euler instance.
   */
  setFromRotationMatrix(e, t = this._order, n = !0) {
    const r = e.elements, s = r[0], a = r[4], o = r[8], l = r[1], c = r[5], h = r[9], d = r[2], u = r[6], p = r[10];
    switch (t) {
      case "XYZ":
        this._y = Math.asin(Ge(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(-h, p), this._z = Math.atan2(-a, s)) : (this._x = Math.atan2(u, c), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-Ge(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(o, p), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-d, s), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(Ge(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._y = Math.atan2(-d, p), this._z = Math.atan2(-a, c)) : (this._y = 0, this._z = Math.atan2(l, s));
        break;
      case "ZYX":
        this._y = Math.asin(-Ge(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._x = Math.atan2(u, p), this._z = Math.atan2(l, s)) : (this._x = 0, this._z = Math.atan2(-a, c));
        break;
      case "YZX":
        this._z = Math.asin(Ge(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-d, s)) : (this._x = 0, this._y = Math.atan2(o, p));
        break;
      case "XZY":
        this._z = Math.asin(-Ge(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(u, c), this._y = Math.atan2(o, s)) : (this._x = Math.atan2(-h, p), this._y = 0);
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + t);
    }
    return this._order = t, n === !0 && this._onChangeCallback(), this;
  }
  /**
   * Sets the angles of this Euler instance from a normalized quaternion.
   *
   * @param {Quaternion} q - A normalized Quaternion.
   * @param {string} [order] - A string representing the order that the rotations are applied.
   * @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
   * @return {Euler} A reference to this Euler instance.
   */
  setFromQuaternion(e, t, n) {
    return qo.makeRotationFromQuaternion(e), this.setFromRotationMatrix(qo, t, n);
  }
  /**
   * Sets the angles of this Euler instance from the given vector.
   *
   * @param {Vector3} v - The vector.
   * @param {string} [order] - A string representing the order that the rotations are applied.
   * @return {Euler} A reference to this Euler instance.
   */
  setFromVector3(e, t = this._order) {
    return this.set(e.x, e.y, e.z, t);
  }
  /**
   * Resets the euler angle with a new order by creating a quaternion from this
   * euler angle and then setting this euler angle with the quaternion and the
   * new order.
   *
   * Warning: This discards revolution information.
   *
   * @param {string} [newOrder] - A string representing the new order that the rotations are applied.
   * @return {Euler} A reference to this Euler instance.
   */
  reorder(e) {
    return Yo.setFromEuler(this), this.setFromQuaternion(Yo, e);
  }
  /**
   * Returns `true` if this Euler instance is equal with the given one.
   *
   * @param {Euler} euler - The Euler instance to test for equality.
   * @return {boolean} Whether this Euler instance is equal with the given one.
   */
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._order === this._order;
  }
  /**
   * Sets this Euler instance's components to values from the given array. The first three
   * entries of the array are assign to the x,y and z components. An optional fourth entry
   * defines the Euler order.
   *
   * @param {Array<number,number,number,?string>} array - An array holding the Euler component values.
   * @return {Euler} A reference to this Euler instance.
   */
  fromArray(e) {
    return this._x = e[0], this._y = e[1], this._z = e[2], e[3] !== void 0 && (this._order = e[3]), this._onChangeCallback(), this;
  }
  /**
   * Writes the components of this Euler instance to the given array. If no array is provided,
   * the method returns a new instance.
   *
   * @param {Array<number,number,number,string>} [array=[]] - The target array holding the Euler components.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Array<number,number,number,string>} The Euler components.
   */
  toArray(e = [], t = 0) {
    return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._order, e;
  }
  _onChange(e) {
    return this._onChangeCallback = e, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._order;
  }
}
In.DEFAULT_ORDER = "XYZ";
class po {
  /**
   * Constructs a new layers instance, with membership
   * initially set to layer `0`.
   */
  constructor() {
    this.mask = 1;
  }
  /**
   * Sets membership to the given layer, and remove membership all other layers.
   *
   * @param {number} layer - The layer to set.
   */
  set(e) {
    this.mask = (1 << e | 0) >>> 0;
  }
  /**
   * Adds membership of the given layer.
   *
   * @param {number} layer - The layer to enable.
   */
  enable(e) {
    this.mask |= 1 << e | 0;
  }
  /**
   * Adds membership to all layers.
   */
  enableAll() {
    this.mask = -1;
  }
  /**
   * Toggles the membership of the given layer.
   *
   * @param {number} layer - The layer to toggle.
   */
  toggle(e) {
    this.mask ^= 1 << e | 0;
  }
  /**
   * Removes membership of the given layer.
   *
   * @param {number} layer - The layer to enable.
   */
  disable(e) {
    this.mask &= ~(1 << e | 0);
  }
  /**
   * Removes the membership from all layers.
   */
  disableAll() {
    this.mask = 0;
  }
  /**
   * Returns `true` if this and the given layers object have at least one
   * layer in common.
   *
   * @param {Layers} layers - The layers to test.
   * @return {boolean } Whether this and the given layers object have at least one layer in common or not.
   */
  test(e) {
    return (this.mask & e.mask) !== 0;
  }
  /**
   * Returns `true` if the given layer is enabled.
   *
   * @param {number} layer - The layer to test.
   * @return {boolean } Whether the given layer is enabled or not.
   */
  isEnabled(e) {
    return (this.mask & (1 << e | 0)) !== 0;
  }
}
let Rd = 0;
const jo = /* @__PURE__ */ new N(), Ui = /* @__PURE__ */ new Ei(), On = /* @__PURE__ */ new lt(), Br = /* @__PURE__ */ new N(), dr = /* @__PURE__ */ new N(), Cd = /* @__PURE__ */ new N(), Pd = /* @__PURE__ */ new Ei(), Ko = /* @__PURE__ */ new N(1, 0, 0), Zo = /* @__PURE__ */ new N(0, 1, 0), Jo = /* @__PURE__ */ new N(0, 0, 1), Qo = { type: "added" }, Dd = { type: "removed" }, Ni = { type: "childadded", child: null }, Bs = { type: "childremoved", child: null };
class wt extends Ti {
  /**
   * Constructs a new 3D object.
   */
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: Rd++ }), this.uuid = ir(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = wt.DEFAULT_UP.clone();
    const e = new N(), t = new In(), n = new Ei(), r = new N(1, 1, 1);
    function s() {
      n.setFromEuler(t, !1);
    }
    function a() {
      t.setFromQuaternion(n, void 0, !1);
    }
    t._onChange(s), n._onChange(a), Object.defineProperties(this, {
      /**
       * Represents the object's local position.
       *
       * @name Object3D#position
       * @type {Vector3}
       * @default (0,0,0)
       */
      position: {
        configurable: !0,
        enumerable: !0,
        value: e
      },
      /**
       * Represents the object's local rotation as Euler angles, in radians.
       *
       * @name Object3D#rotation
       * @type {Euler}
       * @default (0,0,0)
       */
      rotation: {
        configurable: !0,
        enumerable: !0,
        value: t
      },
      /**
       * Represents the object's local rotation as Quaternions.
       *
       * @name Object3D#quaternion
       * @type {Quaternion}
       */
      quaternion: {
        configurable: !0,
        enumerable: !0,
        value: n
      },
      /**
       * Represents the object's local scale.
       *
       * @name Object3D#scale
       * @type {Vector3}
       * @default (1,1,1)
       */
      scale: {
        configurable: !0,
        enumerable: !0,
        value: r
      },
      /**
       * Represents the object's model-view matrix.
       *
       * @name Object3D#modelViewMatrix
       * @type {Matrix4}
       */
      modelViewMatrix: {
        value: new lt()
      },
      /**
       * Represents the object's normal matrix.
       *
       * @name Object3D#normalMatrix
       * @type {Matrix3}
       */
      normalMatrix: {
        value: new ze()
      }
    }), this.matrix = new lt(), this.matrixWorld = new lt(), this.matrixAutoUpdate = wt.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = wt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new po(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.customDepthMaterial = void 0, this.customDistanceMaterial = void 0, this.userData = {};
  }
  /**
   * A callback that is executed immediately before a 3D object is rendered to a shadow map.
   *
   * @param {Renderer|WebGLRenderer} renderer - The renderer.
   * @param {Object3D} object - The 3D object.
   * @param {Camera} camera - The camera that is used to render the scene.
   * @param {Camera} shadowCamera - The shadow camera.
   * @param {BufferGeometry} geometry - The 3D object's geometry.
   * @param {Material} depthMaterial - The depth material.
   * @param {Object} group - The geometry group data.
   */
  onBeforeShadow() {
  }
  /**
   * A callback that is executed immediately after a 3D object is rendered to a shadow map.
   *
   * @param {Renderer|WebGLRenderer} renderer - The renderer.
   * @param {Object3D} object - The 3D object.
   * @param {Camera} camera - The camera that is used to render the scene.
   * @param {Camera} shadowCamera - The shadow camera.
   * @param {BufferGeometry} geometry - The 3D object's geometry.
   * @param {Material} depthMaterial - The depth material.
   * @param {Object} group - The geometry group data.
   */
  onAfterShadow() {
  }
  /**
   * A callback that is executed immediately before a 3D object is rendered.
   *
   * @param {Renderer|WebGLRenderer} renderer - The renderer.
   * @param {Object3D} object - The 3D object.
   * @param {Camera} camera - The camera that is used to render the scene.
   * @param {BufferGeometry} geometry - The 3D object's geometry.
   * @param {Material} material - The 3D object's material.
   * @param {Object} group - The geometry group data.
   */
  onBeforeRender() {
  }
  /**
   * A callback that is executed immediately after a 3D object is rendered.
   *
   * @param {Renderer|WebGLRenderer} renderer - The renderer.
   * @param {Object3D} object - The 3D object.
   * @param {Camera} camera - The camera that is used to render the scene.
   * @param {BufferGeometry} geometry - The 3D object's geometry.
   * @param {Material} material - The 3D object's material.
   * @param {Object} group - The geometry group data.
   */
  onAfterRender() {
  }
  /**
   * Applies the given transformation matrix to the object and updates the object's position,
   * rotation and scale.
   *
   * @param {Matrix4} matrix - The transformation matrix.
   */
  applyMatrix4(e) {
    this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(e), this.matrix.decompose(this.position, this.quaternion, this.scale);
  }
  /**
   * Applies a rotation represented by given the quaternion to the 3D object.
   *
   * @param {Quaternion} q - The quaternion.
   * @return {Object3D} A reference to this instance.
   */
  applyQuaternion(e) {
    return this.quaternion.premultiply(e), this;
  }
  /**
   * Sets the given rotation represented as an axis/angle couple to the 3D object.
   *
   * @param {Vector3} axis - The (normalized) axis vector.
   * @param {number} angle - The angle in radians.
   */
  setRotationFromAxisAngle(e, t) {
    this.quaternion.setFromAxisAngle(e, t);
  }
  /**
   * Sets the given rotation represented as Euler angles to the 3D object.
   *
   * @param {Euler} euler - The Euler angles.
   */
  setRotationFromEuler(e) {
    this.quaternion.setFromEuler(e, !0);
  }
  /**
   * Sets the given rotation represented as rotation matrix to the 3D object.
   *
   * @param {Matrix4} m - Although a 4x4 matrix is expected, the upper 3x3 portion must be
   * a pure rotation matrix (i.e, unscaled).
   */
  setRotationFromMatrix(e) {
    this.quaternion.setFromRotationMatrix(e);
  }
  /**
   * Sets the given rotation represented as a Quaternion to the 3D object.
   *
   * @param {Quaternion} q - The Quaternion
   */
  setRotationFromQuaternion(e) {
    this.quaternion.copy(e);
  }
  /**
   * Rotates the 3D object along an axis in local space.
   *
   * @param {Vector3} axis - The (normalized) axis vector.
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateOnAxis(e, t) {
    return Ui.setFromAxisAngle(e, t), this.quaternion.multiply(Ui), this;
  }
  /**
   * Rotates the 3D object along an axis in world space.
   *
   * @param {Vector3} axis - The (normalized) axis vector.
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateOnWorldAxis(e, t) {
    return Ui.setFromAxisAngle(e, t), this.quaternion.premultiply(Ui), this;
  }
  /**
   * Rotates the 3D object around its X axis in local space.
   *
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateX(e) {
    return this.rotateOnAxis(Ko, e);
  }
  /**
   * Rotates the 3D object around its Y axis in local space.
   *
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateY(e) {
    return this.rotateOnAxis(Zo, e);
  }
  /**
   * Rotates the 3D object around its Z axis in local space.
   *
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateZ(e) {
    return this.rotateOnAxis(Jo, e);
  }
  /**
   * Translate the 3D object by a distance along the given axis in local space.
   *
   * @param {Vector3} axis - The (normalized) axis vector.
   * @param {number} distance - The distance in world units.
   * @return {Object3D} A reference to this instance.
   */
  translateOnAxis(e, t) {
    return jo.copy(e).applyQuaternion(this.quaternion), this.position.add(jo.multiplyScalar(t)), this;
  }
  /**
   * Translate the 3D object by a distance along its X-axis in local space.
   *
   * @param {number} distance - The distance in world units.
   * @return {Object3D} A reference to this instance.
   */
  translateX(e) {
    return this.translateOnAxis(Ko, e);
  }
  /**
   * Translate the 3D object by a distance along its Y-axis in local space.
   *
   * @param {number} distance - The distance in world units.
   * @return {Object3D} A reference to this instance.
   */
  translateY(e) {
    return this.translateOnAxis(Zo, e);
  }
  /**
   * Translate the 3D object by a distance along its Z-axis in local space.
   *
   * @param {number} distance - The distance in world units.
   * @return {Object3D} A reference to this instance.
   */
  translateZ(e) {
    return this.translateOnAxis(Jo, e);
  }
  /**
   * Converts the given vector from this 3D object's local space to world space.
   *
   * @param {Vector3} vector - The vector to convert.
   * @return {Vector3} The converted vector.
   */
  localToWorld(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld);
  }
  /**
   * Converts the given vector from this 3D object's word space to local space.
   *
   * @param {Vector3} vector - The vector to convert.
   * @return {Vector3} The converted vector.
   */
  worldToLocal(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(On.copy(this.matrixWorld).invert());
  }
  /**
   * Rotates the object to face a point in world space.
   *
   * This method does not support objects having non-uniformly-scaled parent(s).
   *
   * @param {number|Vector3} x - The x coordinate in world space. Alternatively, a vector representing a position in world space
   * @param {number} [y] - The y coordinate in world space.
   * @param {number} [z] - The z coordinate in world space.
   */
  lookAt(e, t, n) {
    e.isVector3 ? Br.copy(e) : Br.set(e, t, n);
    const r = this.parent;
    this.updateWorldMatrix(!0, !1), dr.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? On.lookAt(dr, Br, this.up) : On.lookAt(Br, dr, this.up), this.quaternion.setFromRotationMatrix(On), r && (On.extractRotation(r.matrixWorld), Ui.setFromRotationMatrix(On), this.quaternion.premultiply(Ui.invert()));
  }
  /**
   * Adds the given 3D object as a child to this 3D object. An arbitrary number of
   * objects may be added. Any current parent on an object passed in here will be
   * removed, since an object can have at most one parent.
   *
   * @fires Object3D#added
   * @fires Object3D#childadded
   * @param {Object3D} object - The 3D object to add.
   * @return {Object3D} A reference to this instance.
   */
  add(e) {
    if (arguments.length > 1) {
      for (let t = 0; t < arguments.length; t++)
        this.add(arguments[t]);
      return this;
    }
    return e === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.removeFromParent(), e.parent = this, this.children.push(e), e.dispatchEvent(Qo), Ni.child = e, this.dispatchEvent(Ni), Ni.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", e), this);
  }
  /**
   * Removes the given 3D object as child from this 3D object.
   * An arbitrary number of objects may be removed.
   *
   * @fires Object3D#removed
   * @fires Object3D#childremoved
   * @param {Object3D} object - The 3D object to remove.
   * @return {Object3D} A reference to this instance.
   */
  remove(e) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++)
        this.remove(arguments[n]);
      return this;
    }
    const t = this.children.indexOf(e);
    return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(Dd), Bs.child = e, this.dispatchEvent(Bs), Bs.child = null), this;
  }
  /**
   * Removes this 3D object from its current parent.
   *
   * @fires Object3D#removed
   * @fires Object3D#childremoved
   * @return {Object3D} A reference to this instance.
   */
  removeFromParent() {
    const e = this.parent;
    return e !== null && e.remove(this), this;
  }
  /**
   * Removes all child objects.
   *
   * @fires Object3D#removed
   * @fires Object3D#childremoved
   * @return {Object3D} A reference to this instance.
   */
  clear() {
    return this.remove(...this.children);
  }
  /**
   * Adds the given 3D object as a child of this 3D object, while maintaining the object's world
   * transform. This method does not support scene graphs having non-uniformly-scaled nodes(s).
   *
   * @fires Object3D#added
   * @fires Object3D#childadded
   * @param {Object3D} object - The 3D object to attach.
   * @return {Object3D} A reference to this instance.
   */
  attach(e) {
    return this.updateWorldMatrix(!0, !1), On.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), On.multiply(e.parent.matrixWorld)), e.applyMatrix4(On), e.removeFromParent(), e.parent = this, this.children.push(e), e.updateWorldMatrix(!1, !0), e.dispatchEvent(Qo), Ni.child = e, this.dispatchEvent(Ni), Ni.child = null, this;
  }
  /**
   * Searches through the 3D object and its children, starting with the 3D object
   * itself, and returns the first with a matching ID.
   *
   * @param {number} id - The id.
   * @return {Object3D|undefined} The found 3D object. Returns `undefined` if no 3D object has been found.
   */
  getObjectById(e) {
    return this.getObjectByProperty("id", e);
  }
  /**
   * Searches through the 3D object and its children, starting with the 3D object
   * itself, and returns the first with a matching name.
   *
   * @param {string} name - The name.
   * @return {Object3D|undefined} The found 3D object. Returns `undefined` if no 3D object has been found.
   */
  getObjectByName(e) {
    return this.getObjectByProperty("name", e);
  }
  /**
   * Searches through the 3D object and its children, starting with the 3D object
   * itself, and returns the first with a matching property value.
   *
   * @param {string} name - The name of the property.
   * @param {any} value - The value.
   * @return {Object3D|undefined} The found 3D object. Returns `undefined` if no 3D object has been found.
   */
  getObjectByProperty(e, t) {
    if (this[e] === t) return this;
    for (let n = 0, r = this.children.length; n < r; n++) {
      const a = this.children[n].getObjectByProperty(e, t);
      if (a !== void 0)
        return a;
    }
  }
  /**
   * Searches through the 3D object and its children, starting with the 3D object
   * itself, and returns all 3D objects with a matching property value.
   *
   * @param {string} name - The name of the property.
   * @param {any} value - The value.
   * @param {Array<Object3D>} result - The method stores the result in this array.
   * @return {Array<Object3D>} The found 3D objects.
   */
  getObjectsByProperty(e, t, n = []) {
    this[e] === t && n.push(this);
    const r = this.children;
    for (let s = 0, a = r.length; s < a; s++)
      r[s].getObjectsByProperty(e, t, n);
    return n;
  }
  /**
   * Returns a vector representing the position of the 3D object in world space.
   *
   * @param {Vector3} target - The target vector the result is stored to.
   * @return {Vector3} The 3D object's position in world space.
   */
  getWorldPosition(e) {
    return this.updateWorldMatrix(!0, !1), e.setFromMatrixPosition(this.matrixWorld);
  }
  /**
   * Returns a Quaternion representing the position of the 3D object in world space.
   *
   * @param {Quaternion} target - The target Quaternion the result is stored to.
   * @return {Quaternion} The 3D object's rotation in world space.
   */
  getWorldQuaternion(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(dr, e, Cd), e;
  }
  /**
   * Returns a vector representing the scale of the 3D object in world space.
   *
   * @param {Vector3} target - The target vector the result is stored to.
   * @return {Vector3} The 3D object's scale in world space.
   */
  getWorldScale(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(dr, Pd, e), e;
  }
  /**
   * Returns a vector representing the ("look") direction of the 3D object in world space.
   *
   * @param {Vector3} target - The target vector the result is stored to.
   * @return {Vector3} The 3D object's direction in world space.
   */
  getWorldDirection(e) {
    this.updateWorldMatrix(!0, !1);
    const t = this.matrixWorld.elements;
    return e.set(t[8], t[9], t[10]).normalize();
  }
  /**
   * Abstract method to get intersections between a casted ray and this
   * 3D object. Renderable 3D objects such as {@link Mesh}, {@link Line} or {@link Points}
   * implement this method in order to use raycasting.
   *
   * @abstract
   * @param {Raycaster} raycaster - The raycaster.
   * @param {Array<Object>} intersects - An array holding the result of the method.
   */
  raycast() {
  }
  /**
   * Executes the callback on this 3D object and all descendants.
   *
   * Note: Modifying the scene graph inside the callback is discouraged.
   *
   * @param {Function} callback - A callback function that allows to process the current 3D object.
   */
  traverse(e) {
    e(this);
    const t = this.children;
    for (let n = 0, r = t.length; n < r; n++)
      t[n].traverse(e);
  }
  /**
   * Like {@link Object3D#traverse}, but the callback will only be executed for visible 3D objects.
   * Descendants of invisible 3D objects are not traversed.
   *
   * Note: Modifying the scene graph inside the callback is discouraged.
   *
   * @param {Function} callback - A callback function that allows to process the current 3D object.
   */
  traverseVisible(e) {
    if (this.visible === !1) return;
    e(this);
    const t = this.children;
    for (let n = 0, r = t.length; n < r; n++)
      t[n].traverseVisible(e);
  }
  /**
   * Like {@link Object3D#traverse}, but the callback will only be executed for all ancestors.
   *
   * Note: Modifying the scene graph inside the callback is discouraged.
   *
   * @param {Function} callback - A callback function that allows to process the current 3D object.
   */
  traverseAncestors(e) {
    const t = this.parent;
    t !== null && (e(t), t.traverseAncestors(e));
  }
  /**
   * Updates the transformation matrix in local space by computing it from the current
   * position, rotation and scale values.
   */
  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0;
  }
  /**
   * Updates the transformation matrix in world space of this 3D objects and its descendants.
   *
   * To ensure correct results, this method also recomputes the 3D object's transformation matrix in
   * local space. The computation of the local and world matrix can be controlled with the
   * {@link Object3D#matrixAutoUpdate} and {@link Object3D#matrixWorldAutoUpdate} flags which are both
   * `true` by default.  Set these flags to `false` if you need more control over the update matrix process.
   *
   * @param {boolean} [force=false] - When set to `true`, a recomputation of world matrices is forced even
   * when {@link Object3D#matrixWorldAutoUpdate} is set to `false`.
   */
  updateMatrixWorld(e) {
    this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || e) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, e = !0);
    const t = this.children;
    for (let n = 0, r = t.length; n < r; n++)
      t[n].updateMatrixWorld(e);
  }
  /**
   * An alternative version of {@link Object3D#updateMatrixWorld} with more control over the
   * update of ancestor and descendant nodes.
   *
   * @param {boolean} [updateParents=false] Whether ancestor nodes should be updated or not.
   * @param {boolean} [updateChildren=false] Whether descendant nodes should be updated or not.
   */
  updateWorldMatrix(e, t) {
    const n = this.parent;
    if (e === !0 && n !== null && n.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), t === !0) {
      const r = this.children;
      for (let s = 0, a = r.length; s < a; s++)
        r[s].updateWorldMatrix(!1, !0);
    }
  }
  /**
   * Serializes the 3D object into JSON.
   *
   * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
   * @return {Object} A JSON object representing the serialized 3D object.
   * @see {@link ObjectLoader#parse}
   */
  toJSON(e) {
    const t = e === void 0 || typeof e == "string", n = {};
    t && (e = {
      geometries: {},
      materials: {},
      textures: {},
      images: {},
      shapes: {},
      skeletons: {},
      animations: {},
      nodes: {}
    }, n.metadata = {
      version: 4.7,
      type: "Object",
      generator: "Object3D.toJSON"
    });
    const r = {};
    r.uuid = this.uuid, r.type = this.type, this.name !== "" && (r.name = this.name), this.castShadow === !0 && (r.castShadow = !0), this.receiveShadow === !0 && (r.receiveShadow = !0), this.visible === !1 && (r.visible = !1), this.frustumCulled === !1 && (r.frustumCulled = !1), this.renderOrder !== 0 && (r.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (r.userData = this.userData), r.layers = this.layers.mask, r.matrix = this.matrix.toArray(), r.up = this.up.toArray(), this.matrixAutoUpdate === !1 && (r.matrixAutoUpdate = !1), this.isInstancedMesh && (r.type = "InstancedMesh", r.count = this.count, r.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (r.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (r.type = "BatchedMesh", r.perObjectFrustumCulled = this.perObjectFrustumCulled, r.sortObjects = this.sortObjects, r.drawRanges = this._drawRanges, r.reservedRanges = this._reservedRanges, r.geometryInfo = this._geometryInfo.map((o) => ({
      ...o,
      boundingBox: o.boundingBox ? o.boundingBox.toJSON() : void 0,
      boundingSphere: o.boundingSphere ? o.boundingSphere.toJSON() : void 0
    })), r.instanceInfo = this._instanceInfo.map((o) => ({ ...o })), r.availableInstanceIds = this._availableInstanceIds.slice(), r.availableGeometryIds = this._availableGeometryIds.slice(), r.nextIndexStart = this._nextIndexStart, r.nextVertexStart = this._nextVertexStart, r.geometryCount = this._geometryCount, r.maxInstanceCount = this._maxInstanceCount, r.maxVertexCount = this._maxVertexCount, r.maxIndexCount = this._maxIndexCount, r.geometryInitialized = this._geometryInitialized, r.matricesTexture = this._matricesTexture.toJSON(e), r.indirectTexture = this._indirectTexture.toJSON(e), this._colorsTexture !== null && (r.colorsTexture = this._colorsTexture.toJSON(e)), this.boundingSphere !== null && (r.boundingSphere = this.boundingSphere.toJSON()), this.boundingBox !== null && (r.boundingBox = this.boundingBox.toJSON()));
    function s(o, l) {
      return o[l.uuid] === void 0 && (o[l.uuid] = l.toJSON(e)), l.uuid;
    }
    if (this.isScene)
      this.background && (this.background.isColor ? r.background = this.background.toJSON() : this.background.isTexture && (r.background = this.background.toJSON(e).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (r.environment = this.environment.toJSON(e).uuid);
    else if (this.isMesh || this.isLine || this.isPoints) {
      r.geometry = s(e.geometries, this.geometry);
      const o = this.geometry.parameters;
      if (o !== void 0 && o.shapes !== void 0) {
        const l = o.shapes;
        if (Array.isArray(l))
          for (let c = 0, h = l.length; c < h; c++) {
            const d = l[c];
            s(e.shapes, d);
          }
        else
          s(e.shapes, l);
      }
    }
    if (this.isSkinnedMesh && (r.bindMode = this.bindMode, r.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (s(e.skeletons, this.skeleton), r.skeleton = this.skeleton.uuid)), this.material !== void 0)
      if (Array.isArray(this.material)) {
        const o = [];
        for (let l = 0, c = this.material.length; l < c; l++)
          o.push(s(e.materials, this.material[l]));
        r.material = o;
      } else
        r.material = s(e.materials, this.material);
    if (this.children.length > 0) {
      r.children = [];
      for (let o = 0; o < this.children.length; o++)
        r.children.push(this.children[o].toJSON(e).object);
    }
    if (this.animations.length > 0) {
      r.animations = [];
      for (let o = 0; o < this.animations.length; o++) {
        const l = this.animations[o];
        r.animations.push(s(e.animations, l));
      }
    }
    if (t) {
      const o = a(e.geometries), l = a(e.materials), c = a(e.textures), h = a(e.images), d = a(e.shapes), u = a(e.skeletons), p = a(e.animations), g = a(e.nodes);
      o.length > 0 && (n.geometries = o), l.length > 0 && (n.materials = l), c.length > 0 && (n.textures = c), h.length > 0 && (n.images = h), d.length > 0 && (n.shapes = d), u.length > 0 && (n.skeletons = u), p.length > 0 && (n.animations = p), g.length > 0 && (n.nodes = g);
    }
    return n.object = r, n;
    function a(o) {
      const l = [];
      for (const c in o) {
        const h = o[c];
        delete h.metadata, l.push(h);
      }
      return l;
    }
  }
  /**
   * Returns a new 3D object with copied values from this instance.
   *
   * @param {boolean} [recursive=true] - When set to `true`, descendants of the 3D object are also cloned.
   * @return {Object3D} A clone of this instance.
   */
  clone(e) {
    return new this.constructor().copy(this, e);
  }
  /**
   * Copies the values of the given 3D object to this instance.
   *
   * @param {Object3D} source - The 3D object to copy.
   * @param {boolean} [recursive=true] - When set to `true`, descendants of the 3D object are cloned.
   * @return {Object3D} A reference to this instance.
   */
  copy(e, t = !0) {
    if (this.name = e.name, this.up.copy(e.up), this.position.copy(e.position), this.rotation.order = e.rotation.order, this.quaternion.copy(e.quaternion), this.scale.copy(e.scale), this.matrix.copy(e.matrix), this.matrixWorld.copy(e.matrixWorld), this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrixWorldAutoUpdate = e.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = e.matrixWorldNeedsUpdate, this.layers.mask = e.layers.mask, this.visible = e.visible, this.castShadow = e.castShadow, this.receiveShadow = e.receiveShadow, this.frustumCulled = e.frustumCulled, this.renderOrder = e.renderOrder, this.animations = e.animations.slice(), this.userData = JSON.parse(JSON.stringify(e.userData)), t === !0)
      for (let n = 0; n < e.children.length; n++) {
        const r = e.children[n];
        this.add(r.clone());
      }
    return this;
  }
}
wt.DEFAULT_UP = /* @__PURE__ */ new N(0, 1, 0);
wt.DEFAULT_MATRIX_AUTO_UPDATE = !0;
wt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const mn = /* @__PURE__ */ new N(), kn = /* @__PURE__ */ new N(), zs = /* @__PURE__ */ new N(), Bn = /* @__PURE__ */ new N(), Fi = /* @__PURE__ */ new N(), Oi = /* @__PURE__ */ new N(), el = /* @__PURE__ */ new N(), Hs = /* @__PURE__ */ new N(), Vs = /* @__PURE__ */ new N(), Gs = /* @__PURE__ */ new N(), Ws = /* @__PURE__ */ new vt(), $s = /* @__PURE__ */ new vt(), Xs = /* @__PURE__ */ new vt();
class dn {
  /**
   * Constructs a new triangle.
   *
   * @param {Vector3} [a=(0,0,0)] - The first corner of the triangle.
   * @param {Vector3} [b=(0,0,0)] - The second corner of the triangle.
   * @param {Vector3} [c=(0,0,0)] - The third corner of the triangle.
   */
  constructor(e = new N(), t = new N(), n = new N()) {
    this.a = e, this.b = t, this.c = n;
  }
  /**
   * Computes the normal vector of a triangle.
   *
   * @param {Vector3} a - The first corner of the triangle.
   * @param {Vector3} b - The second corner of the triangle.
   * @param {Vector3} c - The third corner of the triangle.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The triangle's normal.
   */
  static getNormal(e, t, n, r) {
    r.subVectors(n, t), mn.subVectors(e, t), r.cross(mn);
    const s = r.lengthSq();
    return s > 0 ? r.multiplyScalar(1 / Math.sqrt(s)) : r.set(0, 0, 0);
  }
  /**
   * Computes a barycentric coordinates from the given vector.
   * Returns `null` if the triangle is degenerate.
   *
   * @param {Vector3} point - A point in 3D space.
   * @param {Vector3} a - The first corner of the triangle.
   * @param {Vector3} b - The second corner of the triangle.
   * @param {Vector3} c - The third corner of the triangle.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {?Vector3} The barycentric coordinates for the given point
   */
  static getBarycoord(e, t, n, r, s) {
    mn.subVectors(r, t), kn.subVectors(n, t), zs.subVectors(e, t);
    const a = mn.dot(mn), o = mn.dot(kn), l = mn.dot(zs), c = kn.dot(kn), h = kn.dot(zs), d = a * c - o * o;
    if (d === 0)
      return s.set(0, 0, 0), null;
    const u = 1 / d, p = (c * l - o * h) * u, g = (a * h - o * l) * u;
    return s.set(1 - p - g, g, p);
  }
  /**
   * Returns `true` if the given point, when projected onto the plane of the
   * triangle, lies within the triangle.
   *
   * @param {Vector3} point - The point in 3D space to test.
   * @param {Vector3} a - The first corner of the triangle.
   * @param {Vector3} b - The second corner of the triangle.
   * @param {Vector3} c - The third corner of the triangle.
   * @return {boolean} Whether the given point, when projected onto the plane of the
   * triangle, lies within the triangle or not.
   */
  static containsPoint(e, t, n, r) {
    return this.getBarycoord(e, t, n, r, Bn) === null ? !1 : Bn.x >= 0 && Bn.y >= 0 && Bn.x + Bn.y <= 1;
  }
  /**
   * Computes the value barycentrically interpolated for the given point on the
   * triangle. Returns `null` if the triangle is degenerate.
   *
   * @param {Vector3} point - Position of interpolated point.
   * @param {Vector3} p1 - The first corner of the triangle.
   * @param {Vector3} p2 - The second corner of the triangle.
   * @param {Vector3} p3 - The third corner of the triangle.
   * @param {Vector3} v1 - Value to interpolate of first vertex.
   * @param {Vector3} v2 - Value to interpolate of second vertex.
   * @param {Vector3} v3 - Value to interpolate of third vertex.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {?Vector3} The interpolated value.
   */
  static getInterpolation(e, t, n, r, s, a, o, l) {
    return this.getBarycoord(e, t, n, r, Bn) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(s, Bn.x), l.addScaledVector(a, Bn.y), l.addScaledVector(o, Bn.z), l);
  }
  /**
   * Computes the value barycentrically interpolated for the given attribute and indices.
   *
   * @param {BufferAttribute} attr - The attribute to interpolate.
   * @param {number} i1 - Index of first vertex.
   * @param {number} i2 - Index of second vertex.
   * @param {number} i3 - Index of third vertex.
   * @param {Vector3} barycoord - The barycoordinate value to use to interpolate.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The interpolated attribute value.
   */
  static getInterpolatedAttribute(e, t, n, r, s, a) {
    return Ws.setScalar(0), $s.setScalar(0), Xs.setScalar(0), Ws.fromBufferAttribute(e, t), $s.fromBufferAttribute(e, n), Xs.fromBufferAttribute(e, r), a.setScalar(0), a.addScaledVector(Ws, s.x), a.addScaledVector($s, s.y), a.addScaledVector(Xs, s.z), a;
  }
  /**
   * Returns `true` if the triangle is oriented towards the given direction.
   *
   * @param {Vector3} a - The first corner of the triangle.
   * @param {Vector3} b - The second corner of the triangle.
   * @param {Vector3} c - The third corner of the triangle.
   * @param {Vector3} direction - The (normalized) direction vector.
   * @return {boolean} Whether the triangle is oriented towards the given direction or not.
   */
  static isFrontFacing(e, t, n, r) {
    return mn.subVectors(n, t), kn.subVectors(e, t), mn.cross(kn).dot(r) < 0;
  }
  /**
   * Sets the triangle's vertices by copying the given values.
   *
   * @param {Vector3} a - The first corner of the triangle.
   * @param {Vector3} b - The second corner of the triangle.
   * @param {Vector3} c - The third corner of the triangle.
   * @return {Triangle} A reference to this triangle.
   */
  set(e, t, n) {
    return this.a.copy(e), this.b.copy(t), this.c.copy(n), this;
  }
  /**
   * Sets the triangle's vertices by copying the given array values.
   *
   * @param {Array<Vector3>} points - An array with 3D points.
   * @param {number} i0 - The array index representing the first corner of the triangle.
   * @param {number} i1 - The array index representing the second corner of the triangle.
   * @param {number} i2 - The array index representing the third corner of the triangle.
   * @return {Triangle} A reference to this triangle.
   */
  setFromPointsAndIndices(e, t, n, r) {
    return this.a.copy(e[t]), this.b.copy(e[n]), this.c.copy(e[r]), this;
  }
  /**
   * Sets the triangle's vertices by copying the given attribute values.
   *
   * @param {BufferAttribute} attribute - A buffer attribute with 3D points data.
   * @param {number} i0 - The attribute index representing the first corner of the triangle.
   * @param {number} i1 - The attribute index representing the second corner of the triangle.
   * @param {number} i2 - The attribute index representing the third corner of the triangle.
   * @return {Triangle} A reference to this triangle.
   */
  setFromAttributeAndIndices(e, t, n, r) {
    return this.a.fromBufferAttribute(e, t), this.b.fromBufferAttribute(e, n), this.c.fromBufferAttribute(e, r), this;
  }
  /**
   * Returns a new triangle with copied values from this instance.
   *
   * @return {Triangle} A clone of this instance.
   */
  clone() {
    return new this.constructor().copy(this);
  }
  /**
   * Copies the values of the given triangle to this instance.
   *
   * @param {Triangle} triangle - The triangle to copy.
   * @return {Triangle} A reference to this triangle.
   */
  copy(e) {
    return this.a.copy(e.a), this.b.copy(e.b), this.c.copy(e.c), this;
  }
  /**
   * Computes the area of the triangle.
   *
   * @return {number} The triangle's area.
   */
  getArea() {
    return mn.subVectors(this.c, this.b), kn.subVectors(this.a, this.b), mn.cross(kn).length() * 0.5;
  }
  /**
   * Computes the midpoint of the triangle.
   *
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The triangle's midpoint.
   */
  getMidpoint(e) {
    return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  }
  /**
   * Computes the normal of the triangle.
   *
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The triangle's normal.
   */
  getNormal(e) {
    return dn.getNormal(this.a, this.b, this.c, e);
  }
  /**
   * Computes a plane the triangle lies within.
   *
   * @param {Plane} target - The target vector that is used to store the method's result.
   * @return {Plane} The plane the triangle lies within.
   */
  getPlane(e) {
    return e.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  /**
   * Computes a barycentric coordinates from the given vector.
   * Returns `null` if the triangle is degenerate.
   *
   * @param {Vector3} point - A point in 3D space.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {?Vector3} The barycentric coordinates for the given point
   */
  getBarycoord(e, t) {
    return dn.getBarycoord(e, this.a, this.b, this.c, t);
  }
  /**
   * Computes the value barycentrically interpolated for the given point on the
   * triangle. Returns `null` if the triangle is degenerate.
   *
   * @param {Vector3} point - Position of interpolated point.
   * @param {Vector3} v1 - Value to interpolate of first vertex.
   * @param {Vector3} v2 - Value to interpolate of second vertex.
   * @param {Vector3} v3 - Value to interpolate of third vertex.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {?Vector3} The interpolated value.
   */
  getInterpolation(e, t, n, r, s) {
    return dn.getInterpolation(e, this.a, this.b, this.c, t, n, r, s);
  }
  /**
   * Returns `true` if the given point, when projected onto the plane of the
   * triangle, lies within the triangle.
   *
   * @param {Vector3} point - The point in 3D space to test.
   * @return {boolean} Whether the given point, when projected onto the plane of the
   * triangle, lies within the triangle or not.
   */
  containsPoint(e) {
    return dn.containsPoint(e, this.a, this.b, this.c);
  }
  /**
   * Returns `true` if the triangle is oriented towards the given direction.
   *
   * @param {Vector3} direction - The (normalized) direction vector.
   * @return {boolean} Whether the triangle is oriented towards the given direction or not.
   */
  isFrontFacing(e) {
    return dn.isFrontFacing(this.a, this.b, this.c, e);
  }
  /**
   * Returns `true` if this triangle intersects with the given box.
   *
   * @param {Box3} box - The box to intersect.
   * @return {boolean} Whether this triangle intersects with the given box or not.
   */
  intersectsBox(e) {
    return e.intersectsTriangle(this);
  }
  /**
   * Returns the closest point on the triangle to the given point.
   *
   * @param {Vector3} p - The point to compute the closest point for.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The closest point on the triangle.
   */
  closestPointToPoint(e, t) {
    const n = this.a, r = this.b, s = this.c;
    let a, o;
    Fi.subVectors(r, n), Oi.subVectors(s, n), Hs.subVectors(e, n);
    const l = Fi.dot(Hs), c = Oi.dot(Hs);
    if (l <= 0 && c <= 0)
      return t.copy(n);
    Vs.subVectors(e, r);
    const h = Fi.dot(Vs), d = Oi.dot(Vs);
    if (h >= 0 && d <= h)
      return t.copy(r);
    const u = l * d - h * c;
    if (u <= 0 && l >= 0 && h <= 0)
      return a = l / (l - h), t.copy(n).addScaledVector(Fi, a);
    Gs.subVectors(e, s);
    const p = Fi.dot(Gs), g = Oi.dot(Gs);
    if (g >= 0 && p <= g)
      return t.copy(s);
    const _ = p * c - l * g;
    if (_ <= 0 && c >= 0 && g <= 0)
      return o = c / (c - g), t.copy(n).addScaledVector(Oi, o);
    const m = h * g - p * d;
    if (m <= 0 && d - h >= 0 && p - g >= 0)
      return el.subVectors(s, r), o = (d - h) / (d - h + (p - g)), t.copy(r).addScaledVector(el, o);
    const f = 1 / (m + _ + u);
    return a = _ * f, o = u * f, t.copy(n).addScaledVector(Fi, a).addScaledVector(Oi, o);
  }
  /**
   * Returns `true` if this triangle is equal with the given one.
   *
   * @param {Triangle} triangle - The triangle to test for equality.
   * @return {boolean} Whether this triangle is equal with the given one.
   */
  equals(e) {
    return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
  }
}
const vc = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
}, Jn = { h: 0, s: 0, l: 0 }, zr = { h: 0, s: 0, l: 0 };
function qs(i, e, t) {
  return t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? i + (e - i) * 6 * t : t < 1 / 2 ? e : t < 2 / 3 ? i + (e - i) * 6 * (2 / 3 - t) : i;
}
class Xe {
  /**
   * Constructs a new color.
   *
   * Note that standard method of specifying color in three.js is with a hexadecimal triplet,
   * and that method is used throughout the rest of the documentation.
   *
   * @param {(number|string|Color)} [r] - The red component of the color. If `g` and `b` are
   * not provided, it can be hexadecimal triplet, a CSS-style string or another `Color` instance.
   * @param {number} [g] - The green component.
   * @param {number} [b] - The blue component.
   */
  constructor(e, t, n) {
    return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(e, t, n);
  }
  /**
   * Sets the colors's components from the given values.
   *
   * @param {(number|string|Color)} [r] - The red component of the color. If `g` and `b` are
   * not provided, it can be hexadecimal triplet, a CSS-style string or another `Color` instance.
   * @param {number} [g] - The green component.
   * @param {number} [b] - The blue component.
   * @return {Color} A reference to this color.
   */
  set(e, t, n) {
    if (t === void 0 && n === void 0) {
      const r = e;
      r && r.isColor ? this.copy(r) : typeof r == "number" ? this.setHex(r) : typeof r == "string" && this.setStyle(r);
    } else
      this.setRGB(e, t, n);
    return this;
  }
  /**
   * Sets the colors's components to the given scalar value.
   *
   * @param {number} scalar - The scalar value.
   * @return {Color} A reference to this color.
   */
  setScalar(e) {
    return this.r = e, this.g = e, this.b = e, this;
  }
  /**
   * Sets this color from a hexadecimal value.
   *
   * @param {number} hex - The hexadecimal value.
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {Color} A reference to this color.
   */
  setHex(e, t = Zt) {
    return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, je.colorSpaceToWorking(this, t), this;
  }
  /**
   * Sets this color from RGB values.
   *
   * @param {number} r - Red channel value between `0.0` and `1.0`.
   * @param {number} g - Green channel value between `0.0` and `1.0`.
   * @param {number} b - Blue channel value between `0.0` and `1.0`.
   * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
   * @return {Color} A reference to this color.
   */
  setRGB(e, t, n, r = je.workingColorSpace) {
    return this.r = e, this.g = t, this.b = n, je.colorSpaceToWorking(this, r), this;
  }
  /**
   * Sets this color from RGB values.
   *
   * @param {number} h - Hue value between `0.0` and `1.0`.
   * @param {number} s - Saturation value between `0.0` and `1.0`.
   * @param {number} l - Lightness value between `0.0` and `1.0`.
   * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
   * @return {Color} A reference to this color.
   */
  setHSL(e, t, n, r = je.workingColorSpace) {
    if (e = uo(e, 1), t = Ge(t, 0, 1), n = Ge(n, 0, 1), t === 0)
      this.r = this.g = this.b = n;
    else {
      const s = n <= 0.5 ? n * (1 + t) : n + t - n * t, a = 2 * n - s;
      this.r = qs(a, s, e + 1 / 3), this.g = qs(a, s, e), this.b = qs(a, s, e - 1 / 3);
    }
    return je.colorSpaceToWorking(this, r), this;
  }
  /**
   * Sets this color from a CSS-style string. For example, `rgb(250, 0,0)`,
   * `rgb(100%, 0%, 0%)`, `hsl(0, 100%, 50%)`, `#ff0000`, `#f00`, or `red` ( or
   * any [X11 color name]{@link https://en.wikipedia.org/wiki/X11_color_names#Color_name_chart} -
   * all 140 color names are supported).
   *
   * @param {string} style - Color as a CSS-style string.
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {Color} A reference to this color.
   */
  setStyle(e, t = Zt) {
    function n(s) {
      s !== void 0 && parseFloat(s) < 1 && console.warn("THREE.Color: Alpha component of " + e + " will be ignored.");
    }
    let r;
    if (r = /^(\w+)\(([^\)]*)\)/.exec(e)) {
      let s;
      const a = r[1], o = r[2];
      switch (a) {
        case "rgb":
        case "rgba":
          if (s = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
            return n(s[4]), this.setRGB(
              Math.min(255, parseInt(s[1], 10)) / 255,
              Math.min(255, parseInt(s[2], 10)) / 255,
              Math.min(255, parseInt(s[3], 10)) / 255,
              t
            );
          if (s = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
            return n(s[4]), this.setRGB(
              Math.min(100, parseInt(s[1], 10)) / 100,
              Math.min(100, parseInt(s[2], 10)) / 100,
              Math.min(100, parseInt(s[3], 10)) / 100,
              t
            );
          break;
        case "hsl":
        case "hsla":
          if (s = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
            return n(s[4]), this.setHSL(
              parseFloat(s[1]) / 360,
              parseFloat(s[2]) / 100,
              parseFloat(s[3]) / 100,
              t
            );
          break;
        default:
          console.warn("THREE.Color: Unknown color model " + e);
      }
    } else if (r = /^\#([A-Fa-f\d]+)$/.exec(e)) {
      const s = r[1], a = s.length;
      if (a === 3)
        return this.setRGB(
          parseInt(s.charAt(0), 16) / 15,
          parseInt(s.charAt(1), 16) / 15,
          parseInt(s.charAt(2), 16) / 15,
          t
        );
      if (a === 6)
        return this.setHex(parseInt(s, 16), t);
      console.warn("THREE.Color: Invalid hex color " + e);
    } else if (e && e.length > 0)
      return this.setColorName(e, t);
    return this;
  }
  /**
   * Sets this color from a color name. Faster than {@link Color#setStyle} if
   * you don't need the other CSS-style formats.
   *
   * For convenience, the list of names is exposed in `Color.NAMES` as a hash.
   * ```js
   * Color.NAMES.aliceblue // returns 0xF0F8FF
   * ```
   *
   * @param {string} style - The color name.
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {Color} A reference to this color.
   */
  setColorName(e, t = Zt) {
    const n = vc[e.toLowerCase()];
    return n !== void 0 ? this.setHex(n, t) : console.warn("THREE.Color: Unknown color " + e), this;
  }
  /**
   * Returns a new color with copied values from this instance.
   *
   * @return {Color} A clone of this instance.
   */
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  /**
   * Copies the values of the given color to this instance.
   *
   * @param {Color} color - The color to copy.
   * @return {Color} A reference to this color.
   */
  copy(e) {
    return this.r = e.r, this.g = e.g, this.b = e.b, this;
  }
  /**
   * Copies the given color into this color, and then converts this color from
   * `SRGBColorSpace` to `LinearSRGBColorSpace`.
   *
   * @param {Color} color - The color to copy/convert.
   * @return {Color} A reference to this color.
   */
  copySRGBToLinear(e) {
    return this.r = $n(e.r), this.g = $n(e.g), this.b = $n(e.b), this;
  }
  /**
   * Copies the given color into this color, and then converts this color from
   * `LinearSRGBColorSpace` to `SRGBColorSpace`.
   *
   * @param {Color} color - The color to copy/convert.
   * @return {Color} A reference to this color.
   */
  copyLinearToSRGB(e) {
    return this.r = Ki(e.r), this.g = Ki(e.g), this.b = Ki(e.b), this;
  }
  /**
   * Converts this color from `SRGBColorSpace` to `LinearSRGBColorSpace`.
   *
   * @return {Color} A reference to this color.
   */
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  /**
   * Converts this color from `LinearSRGBColorSpace` to `SRGBColorSpace`.
   *
   * @return {Color} A reference to this color.
   */
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  /**
   * Returns the hexadecimal value of this color.
   *
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {number} The hexadecimal value.
   */
  getHex(e = Zt) {
    return je.workingToColorSpace(zt.copy(this), e), Math.round(Ge(zt.r * 255, 0, 255)) * 65536 + Math.round(Ge(zt.g * 255, 0, 255)) * 256 + Math.round(Ge(zt.b * 255, 0, 255));
  }
  /**
   * Returns the hexadecimal value of this color as a string (for example, 'FFFFFF').
   *
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {string} The hexadecimal value as a string.
   */
  getHexString(e = Zt) {
    return ("000000" + this.getHex(e).toString(16)).slice(-6);
  }
  /**
   * Converts the colors RGB values into the HSL format and stores them into the
   * given target object.
   *
   * @param {{h:number,s:number,l:number}} target - The target object that is used to store the method's result.
   * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
   * @return {{h:number,s:number,l:number}} The HSL representation of this color.
   */
  getHSL(e, t = je.workingColorSpace) {
    je.workingToColorSpace(zt.copy(this), t);
    const n = zt.r, r = zt.g, s = zt.b, a = Math.max(n, r, s), o = Math.min(n, r, s);
    let l, c;
    const h = (o + a) / 2;
    if (o === a)
      l = 0, c = 0;
    else {
      const d = a - o;
      switch (c = h <= 0.5 ? d / (a + o) : d / (2 - a - o), a) {
        case n:
          l = (r - s) / d + (r < s ? 6 : 0);
          break;
        case r:
          l = (s - n) / d + 2;
          break;
        case s:
          l = (n - r) / d + 4;
          break;
      }
      l /= 6;
    }
    return e.h = l, e.s = c, e.l = h, e;
  }
  /**
   * Returns the RGB values of this color and stores them into the given target object.
   *
   * @param {Color} target - The target color that is used to store the method's result.
   * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
   * @return {Color} The RGB representation of this color.
   */
  getRGB(e, t = je.workingColorSpace) {
    return je.workingToColorSpace(zt.copy(this), t), e.r = zt.r, e.g = zt.g, e.b = zt.b, e;
  }
  /**
   * Returns the value of this color as a CSS style string. Example: `rgb(255,0,0)`.
   *
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {string} The CSS representation of this color.
   */
  getStyle(e = Zt) {
    je.workingToColorSpace(zt.copy(this), e);
    const t = zt.r, n = zt.g, r = zt.b;
    return e !== Zt ? `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})` : `rgb(${Math.round(t * 255)},${Math.round(n * 255)},${Math.round(r * 255)})`;
  }
  /**
   * Adds the given HSL values to this color's values.
   * Internally, this converts the color's RGB values to HSL, adds HSL
   * and then converts the color back to RGB.
   *
   * @param {number} h - Hue value between `0.0` and `1.0`.
   * @param {number} s - Saturation value between `0.0` and `1.0`.
   * @param {number} l - Lightness value between `0.0` and `1.0`.
   * @return {Color} A reference to this color.
   */
  offsetHSL(e, t, n) {
    return this.getHSL(Jn), this.setHSL(Jn.h + e, Jn.s + t, Jn.l + n);
  }
  /**
   * Adds the RGB values of the given color to the RGB values of this color.
   *
   * @param {Color} color - The color to add.
   * @return {Color} A reference to this color.
   */
  add(e) {
    return this.r += e.r, this.g += e.g, this.b += e.b, this;
  }
  /**
   * Adds the RGB values of the given colors and stores the result in this instance.
   *
   * @param {Color} color1 - The first color.
   * @param {Color} color2 - The second color.
   * @return {Color} A reference to this color.
   */
  addColors(e, t) {
    return this.r = e.r + t.r, this.g = e.g + t.g, this.b = e.b + t.b, this;
  }
  /**
   * Adds the given scalar value to the RGB values of this color.
   *
   * @param {number} s - The scalar to add.
   * @return {Color} A reference to this color.
   */
  addScalar(e) {
    return this.r += e, this.g += e, this.b += e, this;
  }
  /**
   * Subtracts the RGB values of the given color from the RGB values of this color.
   *
   * @param {Color} color - The color to subtract.
   * @return {Color} A reference to this color.
   */
  sub(e) {
    return this.r = Math.max(0, this.r - e.r), this.g = Math.max(0, this.g - e.g), this.b = Math.max(0, this.b - e.b), this;
  }
  /**
   * Multiplies the RGB values of the given color with the RGB values of this color.
   *
   * @param {Color} color - The color to multiply.
   * @return {Color} A reference to this color.
   */
  multiply(e) {
    return this.r *= e.r, this.g *= e.g, this.b *= e.b, this;
  }
  /**
   * Multiplies the given scalar value with the RGB values of this color.
   *
   * @param {number} s - The scalar to multiply.
   * @return {Color} A reference to this color.
   */
  multiplyScalar(e) {
    return this.r *= e, this.g *= e, this.b *= e, this;
  }
  /**
   * Linearly interpolates this color's RGB values toward the RGB values of the
   * given color. The alpha argument can be thought of as the ratio between
   * the two colors, where `0.0` is this color and `1.0` is the first argument.
   *
   * @param {Color} color - The color to converge on.
   * @param {number} alpha - The interpolation factor in the closed interval `[0,1]`.
   * @return {Color} A reference to this color.
   */
  lerp(e, t) {
    return this.r += (e.r - this.r) * t, this.g += (e.g - this.g) * t, this.b += (e.b - this.b) * t, this;
  }
  /**
   * Linearly interpolates between the given colors and stores the result in this instance.
   * The alpha argument can be thought of as the ratio between the two colors, where `0.0`
   * is the first and `1.0` is the second color.
   *
   * @param {Color} color1 - The first color.
   * @param {Color} color2 - The second color.
   * @param {number} alpha - The interpolation factor in the closed interval `[0,1]`.
   * @return {Color} A reference to this color.
   */
  lerpColors(e, t, n) {
    return this.r = e.r + (t.r - e.r) * n, this.g = e.g + (t.g - e.g) * n, this.b = e.b + (t.b - e.b) * n, this;
  }
  /**
   * Linearly interpolates this color's HSL values toward the HSL values of the
   * given color. It differs from {@link Color#lerp} by not interpolating straight
   * from one color to the other, but instead going through all the hues in between
   * those two colors. The alpha argument can be thought of as the ratio between
   * the two colors, where 0.0 is this color and 1.0 is the first argument.
   *
   * @param {Color} color - The color to converge on.
   * @param {number} alpha - The interpolation factor in the closed interval `[0,1]`.
   * @return {Color} A reference to this color.
   */
  lerpHSL(e, t) {
    this.getHSL(Jn), e.getHSL(zr);
    const n = _r(Jn.h, zr.h, t), r = _r(Jn.s, zr.s, t), s = _r(Jn.l, zr.l, t);
    return this.setHSL(n, r, s), this;
  }
  /**
   * Sets the color's RGB components from the given 3D vector.
   *
   * @param {Vector3} v - The vector to set.
   * @return {Color} A reference to this color.
   */
  setFromVector3(e) {
    return this.r = e.x, this.g = e.y, this.b = e.z, this;
  }
  /**
   * Transforms this color with the given 3x3 matrix.
   *
   * @param {Matrix3} m - The matrix.
   * @return {Color} A reference to this color.
   */
  applyMatrix3(e) {
    const t = this.r, n = this.g, r = this.b, s = e.elements;
    return this.r = s[0] * t + s[3] * n + s[6] * r, this.g = s[1] * t + s[4] * n + s[7] * r, this.b = s[2] * t + s[5] * n + s[8] * r, this;
  }
  /**
   * Returns `true` if this color is equal with the given one.
   *
   * @param {Color} c - The color to test for equality.
   * @return {boolean} Whether this bounding color is equal with the given one.
   */
  equals(e) {
    return e.r === this.r && e.g === this.g && e.b === this.b;
  }
  /**
   * Sets this color's RGB components from the given array.
   *
   * @param {Array<number>} array - An array holding the RGB values.
   * @param {number} [offset=0] - The offset into the array.
   * @return {Color} A reference to this color.
   */
  fromArray(e, t = 0) {
    return this.r = e[t], this.g = e[t + 1], this.b = e[t + 2], this;
  }
  /**
   * Writes the RGB components of this color to the given array. If no array is provided,
   * the method returns a new instance.
   *
   * @param {Array<number>} [array=[]] - The target array holding the color components.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Array<number>} The color components.
   */
  toArray(e = [], t = 0) {
    return e[t] = this.r, e[t + 1] = this.g, e[t + 2] = this.b, e;
  }
  /**
   * Sets the components of this color from the given buffer attribute.
   *
   * @param {BufferAttribute} attribute - The buffer attribute holding color data.
   * @param {number} index - The index into the attribute.
   * @return {Color} A reference to this color.
   */
  fromBufferAttribute(e, t) {
    return this.r = e.getX(t), this.g = e.getY(t), this.b = e.getZ(t), this;
  }
  /**
   * This methods defines the serialization result of this class. Returns the color
   * as a hexadecimal value.
   *
   * @return {number} The hexadecimal value.
   */
  toJSON() {
    return this.getHex();
  }
  *[Symbol.iterator]() {
    yield this.r, yield this.g, yield this.b;
  }
}
const zt = /* @__PURE__ */ new Xe();
Xe.NAMES = vc;
let Ld = 0;
class sr extends Ti {
  /**
   * Constructs a new material.
   */
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: Ld++ }), this.uuid = ir(), this.name = "", this.type = "Material", this.blending = Yi, this.side = ii, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = ua, this.blendDst = fa, this.blendEquation = gi, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new Xe(0, 0, 0), this.blendAlpha = 0, this.depthFunc = Ji, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = Bo, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = Ri, this.stencilZFail = Ri, this.stencilZPass = Ri, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.allowOverride = !0, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
  }
  /**
   * Sets the alpha value to be used when running an alpha test. The material
   * will not be rendered if the opacity is lower than this value.
   *
   * @type {number}
   * @readonly
   * @default 0
   */
  get alphaTest() {
    return this._alphaTest;
  }
  set alphaTest(e) {
    this._alphaTest > 0 != e > 0 && this.version++, this._alphaTest = e;
  }
  /**
   * An optional callback that is executed immediately before the material is used to render a 3D object.
   *
   * This method can only be used when rendering with {@link WebGLRenderer}.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {Scene} scene - The scene.
   * @param {Camera} camera - The camera that is used to render the scene.
   * @param {BufferGeometry} geometry - The 3D object's geometry.
   * @param {Object3D} object - The 3D object.
   * @param {Object} group - The geometry group data.
   */
  onBeforeRender() {
  }
  /**
   * An optional callback that is executed immediately before the shader
   * program is compiled. This function is called with the shader source code
   * as a parameter. Useful for the modification of built-in materials.
   *
   * This method can only be used when rendering with {@link WebGLRenderer}. The
   * recommended approach when customizing materials is to use `WebGPURenderer` with the new
   * Node Material system and [TSL]{@link https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language}.
   *
   * @param {{vertexShader:string,fragmentShader:string,uniforms:Object}} shaderobject - The object holds the uniforms and the vertex and fragment shader source.
   * @param {WebGLRenderer} renderer - A reference to the renderer.
   */
  onBeforeCompile() {
  }
  /**
   * In case {@link Material#onBeforeCompile} is used, this callback can be used to identify
   * values of settings used in `onBeforeCompile()`, so three.js can reuse a cached
   * shader or recompile the shader for this material as needed.
   *
   * This method can only be used when rendering with {@link WebGLRenderer}.
   *
   * @return {string} The custom program cache key.
   */
  customProgramCacheKey() {
    return this.onBeforeCompile.toString();
  }
  /**
   * This method can be used to set default values from parameter objects.
   * It is a generic implementation so it can be used with different types
   * of materials.
   *
   * @param {Object} [values] - The material values to set.
   */
  setValues(e) {
    if (e !== void 0)
      for (const t in e) {
        const n = e[t];
        if (n === void 0) {
          console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);
          continue;
        }
        const r = this[t];
        if (r === void 0) {
          console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);
          continue;
        }
        r && r.isColor ? r.set(n) : r && r.isVector3 && n && n.isVector3 ? r.copy(n) : this[t] = n;
      }
  }
  /**
   * Serializes the material into JSON.
   *
   * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
   * @return {Object} A JSON object representing the serialized material.
   * @see {@link ObjectLoader#parse}
   */
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    t && (e = {
      textures: {},
      images: {}
    });
    const n = {
      metadata: {
        version: 4.7,
        type: "Material",
        generator: "Material.toJSON"
      }
    };
    n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(e).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.sheenColorMap && this.sheenColorMap.isTexture && (n.sheenColorMap = this.sheenColorMap.toJSON(e).uuid), this.sheenRoughnessMap && this.sheenRoughnessMap.isTexture && (n.sheenRoughnessMap = this.sheenRoughnessMap.toJSON(e).uuid), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(e).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(e).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(e).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(e).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(e).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(e).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(e).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(e).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(e).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(e).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(e).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(e).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(e).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(e).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(e).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(e).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(e).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(e).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(e).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== Yi && (n.blending = this.blending), this.side !== ii && (n.side = this.side), this.vertexColors === !0 && (n.vertexColors = !0), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === !0 && (n.transparent = !0), this.blendSrc !== ua && (n.blendSrc = this.blendSrc), this.blendDst !== fa && (n.blendDst = this.blendDst), this.blendEquation !== gi && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== Ji && (n.depthFunc = this.depthFunc), this.depthTest === !1 && (n.depthTest = this.depthTest), this.depthWrite === !1 && (n.depthWrite = this.depthWrite), this.colorWrite === !1 && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== Bo && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== Ri && (n.stencilFail = this.stencilFail), this.stencilZFail !== Ri && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== Ri && (n.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === !0 && (n.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === !0 && (n.dithering = !0), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === !0 && (n.alphaHash = !0), this.alphaToCoverage === !0 && (n.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0), this.forceSinglePass === !0 && (n.forceSinglePass = !0), this.wireframe === !0 && (n.wireframe = !0), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (n.flatShading = !0), this.visible === !1 && (n.visible = !1), this.toneMapped === !1 && (n.toneMapped = !1), this.fog === !1 && (n.fog = !1), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
    function r(s) {
      const a = [];
      for (const o in s) {
        const l = s[o];
        delete l.metadata, a.push(l);
      }
      return a;
    }
    if (t) {
      const s = r(e.textures), a = r(e.images);
      s.length > 0 && (n.textures = s), a.length > 0 && (n.images = a);
    }
    return n;
  }
  /**
   * Returns a new material with copied values from this instance.
   *
   * @return {Material} A clone of this instance.
   */
  clone() {
    return new this.constructor().copy(this);
  }
  /**
   * Copies the values of the given material to this instance.
   *
   * @param {Material} source - The material to copy.
   * @return {Material} A reference to this instance.
   */
  copy(e) {
    this.name = e.name, this.blending = e.blending, this.side = e.side, this.vertexColors = e.vertexColors, this.opacity = e.opacity, this.transparent = e.transparent, this.blendSrc = e.blendSrc, this.blendDst = e.blendDst, this.blendEquation = e.blendEquation, this.blendSrcAlpha = e.blendSrcAlpha, this.blendDstAlpha = e.blendDstAlpha, this.blendEquationAlpha = e.blendEquationAlpha, this.blendColor.copy(e.blendColor), this.blendAlpha = e.blendAlpha, this.depthFunc = e.depthFunc, this.depthTest = e.depthTest, this.depthWrite = e.depthWrite, this.stencilWriteMask = e.stencilWriteMask, this.stencilFunc = e.stencilFunc, this.stencilRef = e.stencilRef, this.stencilFuncMask = e.stencilFuncMask, this.stencilFail = e.stencilFail, this.stencilZFail = e.stencilZFail, this.stencilZPass = e.stencilZPass, this.stencilWrite = e.stencilWrite;
    const t = e.clippingPlanes;
    let n = null;
    if (t !== null) {
      const r = t.length;
      n = new Array(r);
      for (let s = 0; s !== r; ++s)
        n[s] = t[s].clone();
    }
    return this.clippingPlanes = n, this.clipIntersection = e.clipIntersection, this.clipShadows = e.clipShadows, this.shadowSide = e.shadowSide, this.colorWrite = e.colorWrite, this.precision = e.precision, this.polygonOffset = e.polygonOffset, this.polygonOffsetFactor = e.polygonOffsetFactor, this.polygonOffsetUnits = e.polygonOffsetUnits, this.dithering = e.dithering, this.alphaTest = e.alphaTest, this.alphaHash = e.alphaHash, this.alphaToCoverage = e.alphaToCoverage, this.premultipliedAlpha = e.premultipliedAlpha, this.forceSinglePass = e.forceSinglePass, this.visible = e.visible, this.toneMapped = e.toneMapped, this.userData = JSON.parse(JSON.stringify(e.userData)), this;
  }
  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever this instance is no longer used in your app.
   *
   * @fires Material#dispose
   */
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  /**
   * Setting this property to `true` indicates the engine the material
   * needs to be recompiled.
   *
   * @type {boolean}
   * @default false
   * @param {boolean} value
   */
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
}
class qn extends sr {
  /**
   * Constructs a new mesh basic material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(e) {
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new Xe(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new In(), this.combine = ic, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this;
  }
}
const yt = /* @__PURE__ */ new N(), Hr = /* @__PURE__ */ new Ue();
let Id = 0;
class Sn {
  /**
   * Constructs a new buffer attribute.
   *
   * @param {TypedArray} array - The array holding the attribute data.
   * @param {number} itemSize - The item size.
   * @param {boolean} [normalized=false] - Whether the data are normalized or not.
   */
  constructor(e, t, n = !1) {
    if (Array.isArray(e))
      throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
    this.isBufferAttribute = !0, Object.defineProperty(this, "id", { value: Id++ }), this.name = "", this.array = e, this.itemSize = t, this.count = e !== void 0 ? e.length / t : 0, this.normalized = n, this.usage = zo, this.updateRanges = [], this.gpuType = Vn, this.version = 0;
  }
  /**
   * A callback function that is executed after the renderer has transferred the attribute
   * array data to the GPU.
   */
  onUploadCallback() {
  }
  /**
   * Flag to indicate that this attribute has changed and should be re-sent to
   * the GPU. Set this to `true` when you modify the value of the array.
   *
   * @type {number}
   * @default false
   * @param {boolean} value
   */
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  /**
   * Sets the usage of this buffer attribute.
   *
   * @param {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)} value - The usage to set.
   * @return {BufferAttribute} A reference to this buffer attribute.
   */
  setUsage(e) {
    return this.usage = e, this;
  }
  /**
   * Adds a range of data in the data array to be updated on the GPU.
   *
   * @param {number} start - Position at which to start update.
   * @param {number} count - The number of components to update.
   */
  addUpdateRange(e, t) {
    this.updateRanges.push({ start: e, count: t });
  }
  /**
   * Clears the update ranges.
   */
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  /**
   * Copies the values of the given buffer attribute to this instance.
   *
   * @param {BufferAttribute} source - The buffer attribute to copy.
   * @return {BufferAttribute} A reference to this instance.
   */
  copy(e) {
    return this.name = e.name, this.array = new e.array.constructor(e.array), this.itemSize = e.itemSize, this.count = e.count, this.normalized = e.normalized, this.usage = e.usage, this.gpuType = e.gpuType, this;
  }
  /**
   * Copies a vector from the given buffer attribute to this one. The start
   * and destination position in the attribute buffers are represented by the
   * given indices.
   *
   * @param {number} index1 - The destination index into this buffer attribute.
   * @param {BufferAttribute} attribute - The buffer attribute to copy from.
   * @param {number} index2 - The source index into the given buffer attribute.
   * @return {BufferAttribute} A reference to this instance.
   */
  copyAt(e, t, n) {
    e *= this.itemSize, n *= t.itemSize;
    for (let r = 0, s = this.itemSize; r < s; r++)
      this.array[e + r] = t.array[n + r];
    return this;
  }
  /**
   * Copies the given array data into this buffer attribute.
   *
   * @param {(TypedArray|Array)} array - The array to copy.
   * @return {BufferAttribute} A reference to this instance.
   */
  copyArray(e) {
    return this.array.set(e), this;
  }
  /**
   * Applies the given 3x3 matrix to the given attribute. Works with
   * item size `2` and `3`.
   *
   * @param {Matrix3} m - The matrix to apply.
   * @return {BufferAttribute} A reference to this instance.
   */
  applyMatrix3(e) {
    if (this.itemSize === 2)
      for (let t = 0, n = this.count; t < n; t++)
        Hr.fromBufferAttribute(this, t), Hr.applyMatrix3(e), this.setXY(t, Hr.x, Hr.y);
    else if (this.itemSize === 3)
      for (let t = 0, n = this.count; t < n; t++)
        yt.fromBufferAttribute(this, t), yt.applyMatrix3(e), this.setXYZ(t, yt.x, yt.y, yt.z);
    return this;
  }
  /**
   * Applies the given 4x4 matrix to the given attribute. Only works with
   * item size `3`.
   *
   * @param {Matrix4} m - The matrix to apply.
   * @return {BufferAttribute} A reference to this instance.
   */
  applyMatrix4(e) {
    for (let t = 0, n = this.count; t < n; t++)
      yt.fromBufferAttribute(this, t), yt.applyMatrix4(e), this.setXYZ(t, yt.x, yt.y, yt.z);
    return this;
  }
  /**
   * Applies the given 3x3 normal matrix to the given attribute. Only works with
   * item size `3`.
   *
   * @param {Matrix3} m - The normal matrix to apply.
   * @return {BufferAttribute} A reference to this instance.
   */
  applyNormalMatrix(e) {
    for (let t = 0, n = this.count; t < n; t++)
      yt.fromBufferAttribute(this, t), yt.applyNormalMatrix(e), this.setXYZ(t, yt.x, yt.y, yt.z);
    return this;
  }
  /**
   * Applies the given 4x4 matrix to the given attribute. Only works with
   * item size `3` and with direction vectors.
   *
   * @param {Matrix4} m - The matrix to apply.
   * @return {BufferAttribute} A reference to this instance.
   */
  transformDirection(e) {
    for (let t = 0, n = this.count; t < n; t++)
      yt.fromBufferAttribute(this, t), yt.transformDirection(e), this.setXYZ(t, yt.x, yt.y, yt.z);
    return this;
  }
  /**
   * Sets the given array data in the buffer attribute.
   *
   * @param {(TypedArray|Array)} value - The array data to set.
   * @param {number} [offset=0] - The offset in this buffer attribute's array.
   * @return {BufferAttribute} A reference to this instance.
   */
  set(e, t = 0) {
    return this.array.set(e, t), this;
  }
  /**
   * Returns the given component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} component - The component index.
   * @return {number} The returned value.
   */
  getComponent(e, t) {
    let n = this.array[e * this.itemSize + t];
    return this.normalized && (n = Gi(n, this.array)), n;
  }
  /**
   * Sets the given value to the given component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} component - The component index.
   * @param {number} value - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setComponent(e, t, n) {
    return this.normalized && (n = Gt(n, this.array)), this.array[e * this.itemSize + t] = n, this;
  }
  /**
   * Returns the x component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @return {number} The x component.
   */
  getX(e) {
    let t = this.array[e * this.itemSize];
    return this.normalized && (t = Gi(t, this.array)), t;
  }
  /**
   * Sets the x component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} x - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setX(e, t) {
    return this.normalized && (t = Gt(t, this.array)), this.array[e * this.itemSize] = t, this;
  }
  /**
   * Returns the y component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @return {number} The y component.
   */
  getY(e) {
    let t = this.array[e * this.itemSize + 1];
    return this.normalized && (t = Gi(t, this.array)), t;
  }
  /**
   * Sets the y component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} y - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setY(e, t) {
    return this.normalized && (t = Gt(t, this.array)), this.array[e * this.itemSize + 1] = t, this;
  }
  /**
   * Returns the z component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @return {number} The z component.
   */
  getZ(e) {
    let t = this.array[e * this.itemSize + 2];
    return this.normalized && (t = Gi(t, this.array)), t;
  }
  /**
   * Sets the z component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} z - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setZ(e, t) {
    return this.normalized && (t = Gt(t, this.array)), this.array[e * this.itemSize + 2] = t, this;
  }
  /**
   * Returns the w component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @return {number} The w component.
   */
  getW(e) {
    let t = this.array[e * this.itemSize + 3];
    return this.normalized && (t = Gi(t, this.array)), t;
  }
  /**
   * Sets the w component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} w - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setW(e, t) {
    return this.normalized && (t = Gt(t, this.array)), this.array[e * this.itemSize + 3] = t, this;
  }
  /**
   * Sets the x and y component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} x - The value for the x component to set.
   * @param {number} y - The value for the y component to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setXY(e, t, n) {
    return e *= this.itemSize, this.normalized && (t = Gt(t, this.array), n = Gt(n, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this;
  }
  /**
   * Sets the x, y and z component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} x - The value for the x component to set.
   * @param {number} y - The value for the y component to set.
   * @param {number} z - The value for the z component to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setXYZ(e, t, n, r) {
    return e *= this.itemSize, this.normalized && (t = Gt(t, this.array), n = Gt(n, this.array), r = Gt(r, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = r, this;
  }
  /**
   * Sets the x, y, z and w component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} x - The value for the x component to set.
   * @param {number} y - The value for the y component to set.
   * @param {number} z - The value for the z component to set.
   * @param {number} w - The value for the w component to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setXYZW(e, t, n, r, s) {
    return e *= this.itemSize, this.normalized && (t = Gt(t, this.array), n = Gt(n, this.array), r = Gt(r, this.array), s = Gt(s, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = r, this.array[e + 3] = s, this;
  }
  /**
   * Sets the given callback function that is executed after the Renderer has transferred
   * the attribute array data to the GPU. Can be used to perform clean-up operations after
   * the upload when attribute data are not needed anymore on the CPU side.
   *
   * @param {Function} callback - The `onUpload()` callback.
   * @return {BufferAttribute} A reference to this instance.
   */
  onUpload(e) {
    return this.onUploadCallback = e, this;
  }
  /**
   * Returns a new buffer attribute with copied values from this instance.
   *
   * @return {BufferAttribute} A clone of this instance.
   */
  clone() {
    return new this.constructor(this.array, this.itemSize).copy(this);
  }
  /**
   * Serializes the buffer attribute into JSON.
   *
   * @return {Object} A JSON object representing the serialized buffer attribute.
   */
  toJSON() {
    const e = {
      itemSize: this.itemSize,
      type: this.array.constructor.name,
      array: Array.from(this.array),
      normalized: this.normalized
    };
    return this.name !== "" && (e.name = this.name), this.usage !== zo && (e.usage = this.usage), e;
  }
}
class xc extends Sn {
  /**
   * Constructs a new buffer attribute.
   *
   * @param {(Array<number>|Uint16Array)} array - The array holding the attribute data.
   * @param {number} itemSize - The item size.
   * @param {boolean} [normalized=false] - Whether the data are normalized or not.
   */
  constructor(e, t, n) {
    super(new Uint16Array(e), t, n);
  }
}
class Mc extends Sn {
  /**
   * Constructs a new buffer attribute.
   *
   * @param {(Array<number>|Uint32Array)} array - The array holding the attribute data.
   * @param {number} itemSize - The item size.
   * @param {boolean} [normalized=false] - Whether the data are normalized or not.
   */
  constructor(e, t, n) {
    super(new Uint32Array(e), t, n);
  }
}
class Cn extends Sn {
  /**
   * Constructs a new buffer attribute.
   *
   * @param {(Array<number>|Float32Array)} array - The array holding the attribute data.
   * @param {number} itemSize - The item size.
   * @param {boolean} [normalized=false] - Whether the data are normalized or not.
   */
  constructor(e, t, n) {
    super(new Float32Array(e), t, n);
  }
}
let Ud = 0;
const on = /* @__PURE__ */ new lt(), Ys = /* @__PURE__ */ new wt(), ki = /* @__PURE__ */ new N(), nn = /* @__PURE__ */ new rr(), ur = /* @__PURE__ */ new rr(), Pt = /* @__PURE__ */ new N();
class un extends Ti {
  /**
   * Constructs a new geometry.
   */
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: Ud++ }), this.uuid = ir(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
  }
  /**
   * Returns the index of this geometry.
   *
   * @return {?BufferAttribute} The index. Returns `null` if no index is defined.
   */
  getIndex() {
    return this.index;
  }
  /**
   * Sets the given index to this geometry.
   *
   * @param {Array<number>|BufferAttribute} index - The index to set.
   * @return {BufferGeometry} A reference to this instance.
   */
  setIndex(e) {
    return Array.isArray(e) ? this.index = new (gc(e) ? Mc : xc)(e, 1) : this.index = e, this;
  }
  /**
   * Sets the given indirect attribute to this geometry.
   *
   * @param {BufferAttribute} indirect - The attribute holding indirect draw calls.
   * @return {BufferGeometry} A reference to this instance.
   */
  setIndirect(e) {
    return this.indirect = e, this;
  }
  /**
   * Returns the indirect attribute of this geometry.
   *
   * @return {?BufferAttribute} The indirect attribute. Returns `null` if no indirect attribute is defined.
   */
  getIndirect() {
    return this.indirect;
  }
  /**
   * Returns the buffer attribute for the given name.
   *
   * @param {string} name - The attribute name.
   * @return {BufferAttribute|InterleavedBufferAttribute|undefined} The buffer attribute.
   * Returns `undefined` if not attribute has been found.
   */
  getAttribute(e) {
    return this.attributes[e];
  }
  /**
   * Sets the given attribute for the given name.
   *
   * @param {string} name - The attribute name.
   * @param {BufferAttribute|InterleavedBufferAttribute} attribute - The attribute to set.
   * @return {BufferGeometry} A reference to this instance.
   */
  setAttribute(e, t) {
    return this.attributes[e] = t, this;
  }
  /**
   * Deletes the attribute for the given name.
   *
   * @param {string} name - The attribute name to delete.
   * @return {BufferGeometry} A reference to this instance.
   */
  deleteAttribute(e) {
    return delete this.attributes[e], this;
  }
  /**
   * Returns `true` if this geometry has an attribute for the given name.
   *
   * @param {string} name - The attribute name.
   * @return {boolean} Whether this geometry has an attribute for the given name or not.
   */
  hasAttribute(e) {
    return this.attributes[e] !== void 0;
  }
  /**
   * Adds a group to this geometry.
   *
   * @param {number} start - The first element in this draw call. That is the first
   * vertex for non-indexed geometry, otherwise the first triangle index.
   * @param {number} count - Specifies how many vertices (or indices) are part of this group.
   * @param {number} [materialIndex=0] - The material array index to use.
   */
  addGroup(e, t, n = 0) {
    this.groups.push({
      start: e,
      count: t,
      materialIndex: n
    });
  }
  /**
   * Clears all groups.
   */
  clearGroups() {
    this.groups = [];
  }
  /**
   * Sets the draw range for this geometry.
   *
   * @param {number} start - The first vertex for non-indexed geometry, otherwise the first triangle index.
   * @param {number} count - For non-indexed BufferGeometry, `count` is the number of vertices to render.
   * For indexed BufferGeometry, `count` is the number of indices to render.
   */
  setDrawRange(e, t) {
    this.drawRange.start = e, this.drawRange.count = t;
  }
  /**
   * Applies the given 4x4 transformation matrix to the geometry.
   *
   * @param {Matrix4} matrix - The matrix to apply.
   * @return {BufferGeometry} A reference to this instance.
   */
  applyMatrix4(e) {
    const t = this.attributes.position;
    t !== void 0 && (t.applyMatrix4(e), t.needsUpdate = !0);
    const n = this.attributes.normal;
    if (n !== void 0) {
      const s = new ze().getNormalMatrix(e);
      n.applyNormalMatrix(s), n.needsUpdate = !0;
    }
    const r = this.attributes.tangent;
    return r !== void 0 && (r.transformDirection(e), r.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  /**
   * Applies the rotation represented by the Quaternion to the geometry.
   *
   * @param {Quaternion} q - The Quaternion to apply.
   * @return {BufferGeometry} A reference to this instance.
   */
  applyQuaternion(e) {
    return on.makeRotationFromQuaternion(e), this.applyMatrix4(on), this;
  }
  /**
   * Rotates the geometry about the X axis. This is typically done as a one time
   * operation, and not during a loop. Use {@link Object3D#rotation} for typical
   * real-time mesh rotation.
   *
   * @param {number} angle - The angle in radians.
   * @return {BufferGeometry} A reference to this instance.
   */
  rotateX(e) {
    return on.makeRotationX(e), this.applyMatrix4(on), this;
  }
  /**
   * Rotates the geometry about the Y axis. This is typically done as a one time
   * operation, and not during a loop. Use {@link Object3D#rotation} for typical
   * real-time mesh rotation.
   *
   * @param {number} angle - The angle in radians.
   * @return {BufferGeometry} A reference to this instance.
   */
  rotateY(e) {
    return on.makeRotationY(e), this.applyMatrix4(on), this;
  }
  /**
   * Rotates the geometry about the Z axis. This is typically done as a one time
   * operation, and not during a loop. Use {@link Object3D#rotation} for typical
   * real-time mesh rotation.
   *
   * @param {number} angle - The angle in radians.
   * @return {BufferGeometry} A reference to this instance.
   */
  rotateZ(e) {
    return on.makeRotationZ(e), this.applyMatrix4(on), this;
  }
  /**
   * Translates the geometry. This is typically done as a one time
   * operation, and not during a loop. Use {@link Object3D#position} for typical
   * real-time mesh rotation.
   *
   * @param {number} x - The x offset.
   * @param {number} y - The y offset.
   * @param {number} z - The z offset.
   * @return {BufferGeometry} A reference to this instance.
   */
  translate(e, t, n) {
    return on.makeTranslation(e, t, n), this.applyMatrix4(on), this;
  }
  /**
   * Scales the geometry. This is typically done as a one time
   * operation, and not during a loop. Use {@link Object3D#scale} for typical
   * real-time mesh rotation.
   *
   * @param {number} x - The x scale.
   * @param {number} y - The y scale.
   * @param {number} z - The z scale.
   * @return {BufferGeometry} A reference to this instance.
   */
  scale(e, t, n) {
    return on.makeScale(e, t, n), this.applyMatrix4(on), this;
  }
  /**
   * Rotates the geometry to face a point in 3D space. This is typically done as a one time
   * operation, and not during a loop. Use {@link Object3D#lookAt} for typical
   * real-time mesh rotation.
   *
   * @param {Vector3} vector - The target point.
   * @return {BufferGeometry} A reference to this instance.
   */
  lookAt(e) {
    return Ys.lookAt(e), Ys.updateMatrix(), this.applyMatrix4(Ys.matrix), this;
  }
  /**
   * Center the geometry based on its bounding box.
   *
   * @return {BufferGeometry} A reference to this instance.
   */
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(ki).negate(), this.translate(ki.x, ki.y, ki.z), this;
  }
  /**
   * Defines a geometry by creating a `position` attribute based on the given array of points. The array
   * can hold 2D or 3D vectors. When using two-dimensional data, the `z` coordinate for all vertices is
   * set to `0`.
   *
   * If the method is used with an existing `position` attribute, the vertex data are overwritten with the
   * data from the array. The length of the array must match the vertex count.
   *
   * @param {Array<Vector2>|Array<Vector3>} points - The points.
   * @return {BufferGeometry} A reference to this instance.
   */
  setFromPoints(e) {
    const t = this.getAttribute("position");
    if (t === void 0) {
      const n = [];
      for (let r = 0, s = e.length; r < s; r++) {
        const a = e[r];
        n.push(a.x, a.y, a.z || 0);
      }
      this.setAttribute("position", new Cn(n, 3));
    } else {
      const n = Math.min(e.length, t.count);
      for (let r = 0; r < n; r++) {
        const s = e[r];
        t.setXYZ(r, s.x, s.y, s.z || 0);
      }
      e.length > t.count && console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."), t.needsUpdate = !0;
    }
    return this;
  }
  /**
   * Computes the bounding box of the geometry, and updates the `boundingBox` member.
   * The bounding box is not computed by the engine; it must be computed by your app.
   * You may need to recompute the bounding box if the geometry vertices are modified.
   */
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new rr());
    const e = this.attributes.position, t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(
        new N(-1 / 0, -1 / 0, -1 / 0),
        new N(1 / 0, 1 / 0, 1 / 0)
      );
      return;
    }
    if (e !== void 0) {
      if (this.boundingBox.setFromBufferAttribute(e), t)
        for (let n = 0, r = t.length; n < r; n++) {
          const s = t[n];
          nn.setFromBufferAttribute(s), this.morphTargetsRelative ? (Pt.addVectors(this.boundingBox.min, nn.min), this.boundingBox.expandByPoint(Pt), Pt.addVectors(this.boundingBox.max, nn.max), this.boundingBox.expandByPoint(Pt)) : (this.boundingBox.expandByPoint(nn.min), this.boundingBox.expandByPoint(nn.max));
        }
    } else
      this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
  }
  /**
   * Computes the bounding sphere of the geometry, and updates the `boundingSphere` member.
   * The engine automatically computes the bounding sphere when it is needed, e.g., for ray casting or view frustum culling.
   * You may need to recompute the bounding sphere if the geometry vertices are modified.
   */
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new bs());
    const e = this.attributes.position, t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new N(), 1 / 0);
      return;
    }
    if (e) {
      const n = this.boundingSphere.center;
      if (nn.setFromBufferAttribute(e), t)
        for (let s = 0, a = t.length; s < a; s++) {
          const o = t[s];
          ur.setFromBufferAttribute(o), this.morphTargetsRelative ? (Pt.addVectors(nn.min, ur.min), nn.expandByPoint(Pt), Pt.addVectors(nn.max, ur.max), nn.expandByPoint(Pt)) : (nn.expandByPoint(ur.min), nn.expandByPoint(ur.max));
        }
      nn.getCenter(n);
      let r = 0;
      for (let s = 0, a = e.count; s < a; s++)
        Pt.fromBufferAttribute(e, s), r = Math.max(r, n.distanceToSquared(Pt));
      if (t)
        for (let s = 0, a = t.length; s < a; s++) {
          const o = t[s], l = this.morphTargetsRelative;
          for (let c = 0, h = o.count; c < h; c++)
            Pt.fromBufferAttribute(o, c), l && (ki.fromBufferAttribute(e, c), Pt.add(ki)), r = Math.max(r, n.distanceToSquared(Pt));
        }
      this.boundingSphere.radius = Math.sqrt(r), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
    }
  }
  /**
   * Calculates and adds a tangent attribute to this geometry.
   *
   * The computation is only supported for indexed geometries and if position, normal, and uv attributes
   * are defined. When using a tangent space normal map, prefer the MikkTSpace algorithm provided by
   * {@link BufferGeometryUtils#computeMikkTSpaceTangents} instead.
   */
  computeTangents() {
    const e = this.index, t = this.attributes;
    if (e === null || t.position === void 0 || t.normal === void 0 || t.uv === void 0) {
      console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
      return;
    }
    const n = t.position, r = t.normal, s = t.uv;
    this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new Sn(new Float32Array(4 * n.count), 4));
    const a = this.getAttribute("tangent"), o = [], l = [];
    for (let O = 0; O < n.count; O++)
      o[O] = new N(), l[O] = new N();
    const c = new N(), h = new N(), d = new N(), u = new Ue(), p = new Ue(), g = new Ue(), _ = new N(), m = new N();
    function f(O, S, M) {
      c.fromBufferAttribute(n, O), h.fromBufferAttribute(n, S), d.fromBufferAttribute(n, M), u.fromBufferAttribute(s, O), p.fromBufferAttribute(s, S), g.fromBufferAttribute(s, M), h.sub(c), d.sub(c), p.sub(u), g.sub(u);
      const L = 1 / (p.x * g.y - g.x * p.y);
      isFinite(L) && (_.copy(h).multiplyScalar(g.y).addScaledVector(d, -p.y).multiplyScalar(L), m.copy(d).multiplyScalar(p.x).addScaledVector(h, -g.x).multiplyScalar(L), o[O].add(_), o[S].add(_), o[M].add(_), l[O].add(m), l[S].add(m), l[M].add(m));
    }
    let T = this.groups;
    T.length === 0 && (T = [{
      start: 0,
      count: e.count
    }]);
    for (let O = 0, S = T.length; O < S; ++O) {
      const M = T[O], L = M.start, H = M.count;
      for (let $ = L, Z = L + H; $ < Z; $ += 3)
        f(
          e.getX($ + 0),
          e.getX($ + 1),
          e.getX($ + 2)
        );
    }
    const b = new N(), y = new N(), w = new N(), R = new N();
    function P(O) {
      w.fromBufferAttribute(r, O), R.copy(w);
      const S = o[O];
      b.copy(S), b.sub(w.multiplyScalar(w.dot(S))).normalize(), y.crossVectors(R, S);
      const L = y.dot(l[O]) < 0 ? -1 : 1;
      a.setXYZW(O, b.x, b.y, b.z, L);
    }
    for (let O = 0, S = T.length; O < S; ++O) {
      const M = T[O], L = M.start, H = M.count;
      for (let $ = L, Z = L + H; $ < Z; $ += 3)
        P(e.getX($ + 0)), P(e.getX($ + 1)), P(e.getX($ + 2));
    }
  }
  /**
   * Computes vertex normals for the given vertex data. For indexed geometries, the method sets
   * each vertex normal to be the average of the face normals of the faces that share that vertex.
   * For non-indexed geometries, vertices are not shared, and the method sets each vertex normal
   * to be the same as the face normal.
   */
  computeVertexNormals() {
    const e = this.index, t = this.getAttribute("position");
    if (t !== void 0) {
      let n = this.getAttribute("normal");
      if (n === void 0)
        n = new Sn(new Float32Array(t.count * 3), 3), this.setAttribute("normal", n);
      else
        for (let u = 0, p = n.count; u < p; u++)
          n.setXYZ(u, 0, 0, 0);
      const r = new N(), s = new N(), a = new N(), o = new N(), l = new N(), c = new N(), h = new N(), d = new N();
      if (e)
        for (let u = 0, p = e.count; u < p; u += 3) {
          const g = e.getX(u + 0), _ = e.getX(u + 1), m = e.getX(u + 2);
          r.fromBufferAttribute(t, g), s.fromBufferAttribute(t, _), a.fromBufferAttribute(t, m), h.subVectors(a, s), d.subVectors(r, s), h.cross(d), o.fromBufferAttribute(n, g), l.fromBufferAttribute(n, _), c.fromBufferAttribute(n, m), o.add(h), l.add(h), c.add(h), n.setXYZ(g, o.x, o.y, o.z), n.setXYZ(_, l.x, l.y, l.z), n.setXYZ(m, c.x, c.y, c.z);
        }
      else
        for (let u = 0, p = t.count; u < p; u += 3)
          r.fromBufferAttribute(t, u + 0), s.fromBufferAttribute(t, u + 1), a.fromBufferAttribute(t, u + 2), h.subVectors(a, s), d.subVectors(r, s), h.cross(d), n.setXYZ(u + 0, h.x, h.y, h.z), n.setXYZ(u + 1, h.x, h.y, h.z), n.setXYZ(u + 2, h.x, h.y, h.z);
      this.normalizeNormals(), n.needsUpdate = !0;
    }
  }
  /**
   * Ensures every normal vector in a geometry will have a magnitude of `1`. This will
   * correct lighting on the geometry surfaces.
   */
  normalizeNormals() {
    const e = this.attributes.normal;
    for (let t = 0, n = e.count; t < n; t++)
      Pt.fromBufferAttribute(e, t), Pt.normalize(), e.setXYZ(t, Pt.x, Pt.y, Pt.z);
  }
  /**
   * Return a new non-index version of this indexed geometry. If the geometry
   * is already non-indexed, the method is a NOOP.
   *
   * @return {BufferGeometry} The non-indexed version of this indexed geometry.
   */
  toNonIndexed() {
    function e(o, l) {
      const c = o.array, h = o.itemSize, d = o.normalized, u = new c.constructor(l.length * h);
      let p = 0, g = 0;
      for (let _ = 0, m = l.length; _ < m; _++) {
        o.isInterleavedBufferAttribute ? p = l[_] * o.data.stride + o.offset : p = l[_] * h;
        for (let f = 0; f < h; f++)
          u[g++] = c[p++];
      }
      return new Sn(u, h, d);
    }
    if (this.index === null)
      return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    const t = new un(), n = this.index.array, r = this.attributes;
    for (const o in r) {
      const l = r[o], c = e(l, n);
      t.setAttribute(o, c);
    }
    const s = this.morphAttributes;
    for (const o in s) {
      const l = [], c = s[o];
      for (let h = 0, d = c.length; h < d; h++) {
        const u = c[h], p = e(u, n);
        l.push(p);
      }
      t.morphAttributes[o] = l;
    }
    t.morphTargetsRelative = this.morphTargetsRelative;
    const a = this.groups;
    for (let o = 0, l = a.length; o < l; o++) {
      const c = a[o];
      t.addGroup(c.start, c.count, c.materialIndex);
    }
    return t;
  }
  /**
   * Serializes the geometry into JSON.
   *
   * @return {Object} A JSON object representing the serialized geometry.
   */
  toJSON() {
    const e = {
      metadata: {
        version: 4.7,
        type: "BufferGeometry",
        generator: "BufferGeometry.toJSON"
      }
    };
    if (e.uuid = this.uuid, e.type = this.type, this.name !== "" && (e.name = this.name), Object.keys(this.userData).length > 0 && (e.userData = this.userData), this.parameters !== void 0) {
      const l = this.parameters;
      for (const c in l)
        l[c] !== void 0 && (e[c] = l[c]);
      return e;
    }
    e.data = { attributes: {} };
    const t = this.index;
    t !== null && (e.data.index = {
      type: t.array.constructor.name,
      array: Array.prototype.slice.call(t.array)
    });
    const n = this.attributes;
    for (const l in n) {
      const c = n[l];
      e.data.attributes[l] = c.toJSON(e.data);
    }
    const r = {};
    let s = !1;
    for (const l in this.morphAttributes) {
      const c = this.morphAttributes[l], h = [];
      for (let d = 0, u = c.length; d < u; d++) {
        const p = c[d];
        h.push(p.toJSON(e.data));
      }
      h.length > 0 && (r[l] = h, s = !0);
    }
    s && (e.data.morphAttributes = r, e.data.morphTargetsRelative = this.morphTargetsRelative);
    const a = this.groups;
    a.length > 0 && (e.data.groups = JSON.parse(JSON.stringify(a)));
    const o = this.boundingSphere;
    return o !== null && (e.data.boundingSphere = o.toJSON()), e;
  }
  /**
   * Returns a new geometry with copied values from this instance.
   *
   * @return {BufferGeometry} A clone of this instance.
   */
  clone() {
    return new this.constructor().copy(this);
  }
  /**
   * Copies the values of the given geometry to this instance.
   *
   * @param {BufferGeometry} source - The geometry to copy.
   * @return {BufferGeometry} A reference to this instance.
   */
  copy(e) {
    this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
    const t = {};
    this.name = e.name;
    const n = e.index;
    n !== null && this.setIndex(n.clone());
    const r = e.attributes;
    for (const c in r) {
      const h = r[c];
      this.setAttribute(c, h.clone(t));
    }
    const s = e.morphAttributes;
    for (const c in s) {
      const h = [], d = s[c];
      for (let u = 0, p = d.length; u < p; u++)
        h.push(d[u].clone(t));
      this.morphAttributes[c] = h;
    }
    this.morphTargetsRelative = e.morphTargetsRelative;
    const a = e.groups;
    for (let c = 0, h = a.length; c < h; c++) {
      const d = a[c];
      this.addGroup(d.start, d.count, d.materialIndex);
    }
    const o = e.boundingBox;
    o !== null && (this.boundingBox = o.clone());
    const l = e.boundingSphere;
    return l !== null && (this.boundingSphere = l.clone()), this.drawRange.start = e.drawRange.start, this.drawRange.count = e.drawRange.count, this.userData = e.userData, this;
  }
  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever this instance is no longer used in your app.
   *
   * @fires BufferGeometry#dispose
   */
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
const tl = /* @__PURE__ */ new lt(), hi = /* @__PURE__ */ new Es(), Vr = /* @__PURE__ */ new bs(), nl = /* @__PURE__ */ new N(), Gr = /* @__PURE__ */ new N(), Wr = /* @__PURE__ */ new N(), $r = /* @__PURE__ */ new N(), js = /* @__PURE__ */ new N(), Xr = /* @__PURE__ */ new N(), il = /* @__PURE__ */ new N(), qr = /* @__PURE__ */ new N();
class Ot extends wt {
  /**
   * Constructs a new mesh.
   *
   * @param {BufferGeometry} [geometry] - The mesh geometry.
   * @param {Material|Array<Material>} [material] - The mesh material.
   */
  constructor(e = new un(), t = new qn()) {
    super(), this.isMesh = !0, this.type = "Mesh", this.geometry = e, this.material = t, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.count = 1, this.updateMorphTargets();
  }
  copy(e, t) {
    return super.copy(e, t), e.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = e.morphTargetInfluences.slice()), e.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary)), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  /**
   * Sets the values of {@link Mesh#morphTargetDictionary} and {@link Mesh#morphTargetInfluences}
   * to make sure existing morph targets can influence this 3D object.
   */
  updateMorphTargets() {
    const t = this.geometry.morphAttributes, n = Object.keys(t);
    if (n.length > 0) {
      const r = t[n[0]];
      if (r !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let s = 0, a = r.length; s < a; s++) {
          const o = r[s].name || String(s);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = s;
        }
      }
    }
  }
  /**
   * Returns the local-space position of the vertex at the given index, taking into
   * account the current animation state of both morph targets and skinning.
   *
   * @param {number} index - The vertex index.
   * @param {Vector3} target - The target object that is used to store the method's result.
   * @return {Vector3} The vertex position in local space.
   */
  getVertexPosition(e, t) {
    const n = this.geometry, r = n.attributes.position, s = n.morphAttributes.position, a = n.morphTargetsRelative;
    t.fromBufferAttribute(r, e);
    const o = this.morphTargetInfluences;
    if (s && o) {
      Xr.set(0, 0, 0);
      for (let l = 0, c = s.length; l < c; l++) {
        const h = o[l], d = s[l];
        h !== 0 && (js.fromBufferAttribute(d, e), a ? Xr.addScaledVector(js, h) : Xr.addScaledVector(js.sub(t), h));
      }
      t.add(Xr);
    }
    return t;
  }
  /**
   * Computes intersection points between a casted ray and this line.
   *
   * @param {Raycaster} raycaster - The raycaster.
   * @param {Array<Object>} intersects - The target array that holds the intersection points.
   */
  raycast(e, t) {
    const n = this.geometry, r = this.material, s = this.matrixWorld;
    r !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), Vr.copy(n.boundingSphere), Vr.applyMatrix4(s), hi.copy(e.ray).recast(e.near), !(Vr.containsPoint(hi.origin) === !1 && (hi.intersectSphere(Vr, nl) === null || hi.origin.distanceToSquared(nl) > (e.far - e.near) ** 2)) && (tl.copy(s).invert(), hi.copy(e.ray).applyMatrix4(tl), !(n.boundingBox !== null && hi.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(e, t, hi)));
  }
  _computeIntersections(e, t, n) {
    let r;
    const s = this.geometry, a = this.material, o = s.index, l = s.attributes.position, c = s.attributes.uv, h = s.attributes.uv1, d = s.attributes.normal, u = s.groups, p = s.drawRange;
    if (o !== null)
      if (Array.isArray(a))
        for (let g = 0, _ = u.length; g < _; g++) {
          const m = u[g], f = a[m.materialIndex], T = Math.max(m.start, p.start), b = Math.min(o.count, Math.min(m.start + m.count, p.start + p.count));
          for (let y = T, w = b; y < w; y += 3) {
            const R = o.getX(y), P = o.getX(y + 1), O = o.getX(y + 2);
            r = Yr(this, f, e, n, c, h, d, R, P, O), r && (r.faceIndex = Math.floor(y / 3), r.face.materialIndex = m.materialIndex, t.push(r));
          }
        }
      else {
        const g = Math.max(0, p.start), _ = Math.min(o.count, p.start + p.count);
        for (let m = g, f = _; m < f; m += 3) {
          const T = o.getX(m), b = o.getX(m + 1), y = o.getX(m + 2);
          r = Yr(this, a, e, n, c, h, d, T, b, y), r && (r.faceIndex = Math.floor(m / 3), t.push(r));
        }
      }
    else if (l !== void 0)
      if (Array.isArray(a))
        for (let g = 0, _ = u.length; g < _; g++) {
          const m = u[g], f = a[m.materialIndex], T = Math.max(m.start, p.start), b = Math.min(l.count, Math.min(m.start + m.count, p.start + p.count));
          for (let y = T, w = b; y < w; y += 3) {
            const R = y, P = y + 1, O = y + 2;
            r = Yr(this, f, e, n, c, h, d, R, P, O), r && (r.faceIndex = Math.floor(y / 3), r.face.materialIndex = m.materialIndex, t.push(r));
          }
        }
      else {
        const g = Math.max(0, p.start), _ = Math.min(l.count, p.start + p.count);
        for (let m = g, f = _; m < f; m += 3) {
          const T = m, b = m + 1, y = m + 2;
          r = Yr(this, a, e, n, c, h, d, T, b, y), r && (r.faceIndex = Math.floor(m / 3), t.push(r));
        }
      }
  }
}
function Nd(i, e, t, n, r, s, a, o) {
  let l;
  if (e.side === Jt ? l = n.intersectTriangle(a, s, r, !0, o) : l = n.intersectTriangle(r, s, a, e.side === ii, o), l === null) return null;
  qr.copy(o), qr.applyMatrix4(i.matrixWorld);
  const c = t.ray.origin.distanceTo(qr);
  return c < t.near || c > t.far ? null : {
    distance: c,
    point: qr.clone(),
    object: i
  };
}
function Yr(i, e, t, n, r, s, a, o, l, c) {
  i.getVertexPosition(o, Gr), i.getVertexPosition(l, Wr), i.getVertexPosition(c, $r);
  const h = Nd(i, e, t, n, Gr, Wr, $r, il);
  if (h) {
    const d = new N();
    dn.getBarycoord(il, Gr, Wr, $r, d), r && (h.uv = dn.getInterpolatedAttribute(r, o, l, c, d, new Ue())), s && (h.uv1 = dn.getInterpolatedAttribute(s, o, l, c, d, new Ue())), a && (h.normal = dn.getInterpolatedAttribute(a, o, l, c, d, new N()), h.normal.dot(n.direction) > 0 && h.normal.multiplyScalar(-1));
    const u = {
      a: o,
      b: l,
      c,
      normal: new N(),
      materialIndex: 0
    };
    dn.getNormal(Gr, Wr, $r, u.normal), h.face = u, h.barycoord = d;
  }
  return h;
}
class yn extends un {
  /**
   * Constructs a new box geometry.
   *
   * @param {number} [width=1] - The width. That is, the length of the edges parallel to the X axis.
   * @param {number} [height=1] - The height. That is, the length of the edges parallel to the Y axis.
   * @param {number} [depth=1] - The depth. That is, the length of the edges parallel to the Z axis.
   * @param {number} [widthSegments=1] - Number of segmented rectangular faces along the width of the sides.
   * @param {number} [heightSegments=1] - Number of segmented rectangular faces along the height of the sides.
   * @param {number} [depthSegments=1] - Number of segmented rectangular faces along the depth of the sides.
   */
  constructor(e = 1, t = 1, n = 1, r = 1, s = 1, a = 1) {
    super(), this.type = "BoxGeometry", this.parameters = {
      width: e,
      height: t,
      depth: n,
      widthSegments: r,
      heightSegments: s,
      depthSegments: a
    };
    const o = this;
    r = Math.floor(r), s = Math.floor(s), a = Math.floor(a);
    const l = [], c = [], h = [], d = [];
    let u = 0, p = 0;
    g("z", "y", "x", -1, -1, n, t, e, a, s, 0), g("z", "y", "x", 1, -1, n, t, -e, a, s, 1), g("x", "z", "y", 1, 1, e, n, t, r, a, 2), g("x", "z", "y", 1, -1, e, n, -t, r, a, 3), g("x", "y", "z", 1, -1, e, t, n, r, s, 4), g("x", "y", "z", -1, -1, e, t, -n, r, s, 5), this.setIndex(l), this.setAttribute("position", new Cn(c, 3)), this.setAttribute("normal", new Cn(h, 3)), this.setAttribute("uv", new Cn(d, 2));
    function g(_, m, f, T, b, y, w, R, P, O, S) {
      const M = y / P, L = w / O, H = y / 2, $ = w / 2, Z = R / 2, A = P + 1, U = O + 1;
      let V = 0, D = 0;
      const F = new N();
      for (let X = 0; X < U; X++) {
        const ne = X * L - $;
        for (let Pe = 0; Pe < A; Pe++) {
          const Ke = Pe * M - H;
          F[_] = Ke * T, F[m] = ne * b, F[f] = Z, c.push(F.x, F.y, F.z), F[_] = 0, F[m] = 0, F[f] = R > 0 ? 1 : -1, h.push(F.x, F.y, F.z), d.push(Pe / P), d.push(1 - X / O), V += 1;
        }
      }
      for (let X = 0; X < O; X++)
        for (let ne = 0; ne < P; ne++) {
          const Pe = u + ne + A * X, Ke = u + ne + A * (X + 1), st = u + (ne + 1) + A * (X + 1), qe = u + (ne + 1) + A * X;
          l.push(Pe, Ke, qe), l.push(Ke, st, qe), D += 6;
        }
      o.addGroup(p, D, S), p += D, u += V;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  /**
   * Factory method for creating an instance of this class from the given
   * JSON object.
   *
   * @param {Object} data - A JSON object representing the serialized geometry.
   * @return {BoxGeometry} A new instance.
   */
  static fromJSON(e) {
    return new yn(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments);
  }
}
function nr(i) {
  const e = {};
  for (const t in i) {
    e[t] = {};
    for (const n in i[t]) {
      const r = i[t][n];
      r && (r.isColor || r.isMatrix3 || r.isMatrix4 || r.isVector2 || r.isVector3 || r.isVector4 || r.isTexture || r.isQuaternion) ? r.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), e[t][n] = null) : e[t][n] = r.clone() : Array.isArray(r) ? e[t][n] = r.slice() : e[t][n] = r;
    }
  }
  return e;
}
function $t(i) {
  const e = {};
  for (let t = 0; t < i.length; t++) {
    const n = nr(i[t]);
    for (const r in n)
      e[r] = n[r];
  }
  return e;
}
function Fd(i) {
  const e = [];
  for (let t = 0; t < i.length; t++)
    e.push(i[t].clone());
  return e;
}
function Sc(i) {
  const e = i.getRenderTarget();
  return e === null ? i.outputColorSpace : e.isXRRenderTarget === !0 ? e.texture.colorSpace : je.workingColorSpace;
}
const Od = { clone: nr, merge: $t };
var kd = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, Bd = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class ri extends sr {
  /**
   * Constructs a new shader material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(e) {
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = kd, this.fragmentShader = Bd, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
      clipCullDistance: !1,
      // set to use vertex shader clipping
      multiDraw: !1
      // set to use vertex shader multi_draw / enable gl_DrawID
    }, this.defaultAttributeValues = {
      color: [1, 1, 1],
      uv: [0, 0],
      uv1: [0, 0]
    }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, e !== void 0 && this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = nr(e.uniforms), this.uniformsGroups = Fd(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    t.glslVersion = this.glslVersion, t.uniforms = {};
    for (const r in this.uniforms) {
      const a = this.uniforms[r].value;
      a && a.isTexture ? t.uniforms[r] = {
        type: "t",
        value: a.toJSON(e).uuid
      } : a && a.isColor ? t.uniforms[r] = {
        type: "c",
        value: a.getHex()
      } : a && a.isVector2 ? t.uniforms[r] = {
        type: "v2",
        value: a.toArray()
      } : a && a.isVector3 ? t.uniforms[r] = {
        type: "v3",
        value: a.toArray()
      } : a && a.isVector4 ? t.uniforms[r] = {
        type: "v4",
        value: a.toArray()
      } : a && a.isMatrix3 ? t.uniforms[r] = {
        type: "m3",
        value: a.toArray()
      } : a && a.isMatrix4 ? t.uniforms[r] = {
        type: "m4",
        value: a.toArray()
      } : t.uniforms[r] = {
        value: a
      };
    }
    Object.keys(this.defines).length > 0 && (t.defines = this.defines), t.vertexShader = this.vertexShader, t.fragmentShader = this.fragmentShader, t.lights = this.lights, t.clipping = this.clipping;
    const n = {};
    for (const r in this.extensions)
      this.extensions[r] === !0 && (n[r] = !0);
    return Object.keys(n).length > 0 && (t.extensions = n), t;
  }
}
class yc extends wt {
  /**
   * Constructs a new camera.
   */
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new lt(), this.projectionMatrix = new lt(), this.projectionMatrixInverse = new lt(), this.coordinateSystem = Rn, this._reversedDepth = !1;
  }
  /**
   * The flag that indicates whether the camera uses a reversed depth buffer.
   *
   * @type {boolean}
   * @default false
   */
  get reversedDepth() {
    return this._reversedDepth;
  }
  copy(e, t) {
    return super.copy(e, t), this.matrixWorldInverse.copy(e.matrixWorldInverse), this.projectionMatrix.copy(e.projectionMatrix), this.projectionMatrixInverse.copy(e.projectionMatrixInverse), this.coordinateSystem = e.coordinateSystem, this;
  }
  /**
   * Returns a vector representing the ("look") direction of the 3D object in world space.
   *
   * This method is overwritten since cameras have a different forward vector compared to other
   * 3D objects. A camera looks down its local, negative z-axis by default.
   *
   * @param {Vector3} target - The target vector the result is stored to.
   * @return {Vector3} The 3D object's direction in world space.
   */
  getWorldDirection(e) {
    return super.getWorldDirection(e).negate();
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  updateWorldMatrix(e, t) {
    super.updateWorldMatrix(e, t), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const Qn = /* @__PURE__ */ new N(), rl = /* @__PURE__ */ new Ue(), sl = /* @__PURE__ */ new Ue();
class hn extends yc {
  /**
   * Constructs a new perspective camera.
   *
   * @param {number} [fov=50] - The vertical field of view.
   * @param {number} [aspect=1] - The aspect ratio.
   * @param {number} [near=0.1] - The camera's near plane.
   * @param {number} [far=2000] - The camera's far plane.
   */
  constructor(e = 50, t = 1, n = 0.1, r = 2e3) {
    super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = e, this.zoom = 1, this.near = n, this.far = r, this.focus = 10, this.aspect = t, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
  }
  copy(e, t) {
    return super.copy(e, t), this.fov = e.fov, this.zoom = e.zoom, this.near = e.near, this.far = e.far, this.focus = e.focus, this.aspect = e.aspect, this.view = e.view === null ? null : Object.assign({}, e.view), this.filmGauge = e.filmGauge, this.filmOffset = e.filmOffset, this;
  }
  /**
   * Sets the FOV by focal length in respect to the current {@link PerspectiveCamera#filmGauge}.
   *
   * The default film gauge is 35, so that the focal length can be specified for
   * a 35mm (full frame) camera.
   *
   * @param {number} focalLength - Values for focal length and film gauge must have the same unit.
   */
  setFocalLength(e) {
    const t = 0.5 * this.getFilmHeight() / e;
    this.fov = Er * 2 * Math.atan(t), this.updateProjectionMatrix();
  }
  /**
   * Returns the focal length from the current {@link PerspectiveCamera#fov} and
   * {@link PerspectiveCamera#filmGauge}.
   *
   * @return {number} The computed focal length.
   */
  getFocalLength() {
    const e = Math.tan(ji * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / e;
  }
  /**
   * Returns the current vertical field of view angle in degrees considering {@link PerspectiveCamera#zoom}.
   *
   * @return {number} The effective FOV.
   */
  getEffectiveFOV() {
    return Er * 2 * Math.atan(
      Math.tan(ji * 0.5 * this.fov) / this.zoom
    );
  }
  /**
   * Returns the width of the image on the film. If {@link PerspectiveCamera#aspect} is greater than or
   * equal to one (landscape format), the result equals {@link PerspectiveCamera#filmGauge}.
   *
   * @return {number} The film width.
   */
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  /**
   * Returns the height of the image on the film. If {@link PerspectiveCamera#aspect} is greater than or
   * equal to one (landscape format), the result equals {@link PerspectiveCamera#filmGauge}.
   *
   * @return {number} The film width.
   */
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  /**
   * Computes the 2D bounds of the camera's viewable rectangle at a given distance along the viewing direction.
   * Sets `minTarget` and `maxTarget` to the coordinates of the lower-left and upper-right corners of the view rectangle.
   *
   * @param {number} distance - The viewing distance.
   * @param {Vector2} minTarget - The lower-left corner of the view rectangle is written into this vector.
   * @param {Vector2} maxTarget - The upper-right corner of the view rectangle is written into this vector.
   */
  getViewBounds(e, t, n) {
    Qn.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), t.set(Qn.x, Qn.y).multiplyScalar(-e / Qn.z), Qn.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(Qn.x, Qn.y).multiplyScalar(-e / Qn.z);
  }
  /**
   * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
   *
   * @param {number} distance - The viewing distance.
   * @param {Vector2} target - The target vector that is used to store result where x is width and y is height.
   * @returns {Vector2} The view size.
   */
  getViewSize(e, t) {
    return this.getViewBounds(e, rl, sl), t.subVectors(sl, rl);
  }
  /**
   * Sets an offset in a larger frustum. This is useful for multi-window or
   * multi-monitor/multi-machine setups.
   *
   * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
   * the monitors are in grid like this
   *```
   *   +---+---+---+
   *   | A | B | C |
   *   +---+---+---+
   *   | D | E | F |
   *   +---+---+---+
   *```
   * then for each monitor you would call it like this:
   *```js
   * const w = 1920;
   * const h = 1080;
   * const fullWidth = w * 3;
   * const fullHeight = h * 2;
   *
   * // --A--
   * camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
   * // --B--
   * camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
   * // --C--
   * camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
   * // --D--
   * camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
   * // --E--
   * camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
   * // --F--
   * camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
   * ```
   *
   * Note there is no reason monitors have to be the same size or in a grid.
   *
   * @param {number} fullWidth - The full width of multiview setup.
   * @param {number} fullHeight - The full height of multiview setup.
   * @param {number} x - The horizontal offset of the subcamera.
   * @param {number} y - The vertical offset of the subcamera.
   * @param {number} width - The width of subcamera.
   * @param {number} height - The height of subcamera.
   */
  setViewOffset(e, t, n, r, s, a) {
    this.aspect = e / t, this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = r, this.view.width = s, this.view.height = a, this.updateProjectionMatrix();
  }
  /**
   * Removes the view offset from the projection matrix.
   */
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  /**
   * Updates the camera's projection matrix. Must be called after any change of
   * camera properties.
   */
  updateProjectionMatrix() {
    const e = this.near;
    let t = e * Math.tan(ji * 0.5 * this.fov) / this.zoom, n = 2 * t, r = this.aspect * n, s = -0.5 * r;
    const a = this.view;
    if (this.view !== null && this.view.enabled) {
      const l = a.fullWidth, c = a.fullHeight;
      s += a.offsetX * r / l, t -= a.offsetY * n / c, r *= a.width / l, n *= a.height / c;
    }
    const o = this.filmOffset;
    o !== 0 && (s += e * o / this.getFilmWidth()), this.projectionMatrix.makePerspective(s, s + r, t, t - n, e, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.fov = this.fov, t.object.zoom = this.zoom, t.object.near = this.near, t.object.far = this.far, t.object.focus = this.focus, t.object.aspect = this.aspect, this.view !== null && (t.object.view = Object.assign({}, this.view)), t.object.filmGauge = this.filmGauge, t.object.filmOffset = this.filmOffset, t;
  }
}
const Bi = -90, zi = 1;
class zd extends wt {
  /**
   * Constructs a new cube camera.
   *
   * @param {number} near - The camera's near plane.
   * @param {number} far - The camera's far plane.
   * @param {WebGLCubeRenderTarget} renderTarget - The cube render target.
   */
  constructor(e, t, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const r = new hn(Bi, zi, e, t);
    r.layers = this.layers, this.add(r);
    const s = new hn(Bi, zi, e, t);
    s.layers = this.layers, this.add(s);
    const a = new hn(Bi, zi, e, t);
    a.layers = this.layers, this.add(a);
    const o = new hn(Bi, zi, e, t);
    o.layers = this.layers, this.add(o);
    const l = new hn(Bi, zi, e, t);
    l.layers = this.layers, this.add(l);
    const c = new hn(Bi, zi, e, t);
    c.layers = this.layers, this.add(c);
  }
  /**
   * Must be called when the coordinate system of the cube camera is changed.
   */
  updateCoordinateSystem() {
    const e = this.coordinateSystem, t = this.children.concat(), [n, r, s, a, o, l] = t;
    for (const c of t) this.remove(c);
    if (e === Rn)
      n.up.set(0, 1, 0), n.lookAt(1, 0, 0), r.up.set(0, 1, 0), r.lookAt(-1, 0, 0), s.up.set(0, 0, -1), s.lookAt(0, 1, 0), a.up.set(0, 0, 1), a.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), l.up.set(0, 1, 0), l.lookAt(0, 0, -1);
    else if (e === ps)
      n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), r.up.set(0, -1, 0), r.lookAt(1, 0, 0), s.up.set(0, 0, 1), s.lookAt(0, 1, 0), a.up.set(0, 0, -1), a.lookAt(0, -1, 0), o.up.set(0, -1, 0), o.lookAt(0, 0, 1), l.up.set(0, -1, 0), l.lookAt(0, 0, -1);
    else
      throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + e);
    for (const c of t)
      this.add(c), c.updateMatrixWorld();
  }
  /**
   * Calling this method will render the given scene with the given renderer
   * into the cube render target of the camera.
   *
   * @param {(Renderer|WebGLRenderer)} renderer - The renderer.
   * @param {Scene} scene - The scene to render.
   */
  update(e, t) {
    this.parent === null && this.updateMatrixWorld();
    const { renderTarget: n, activeMipmapLevel: r } = this;
    this.coordinateSystem !== e.coordinateSystem && (this.coordinateSystem = e.coordinateSystem, this.updateCoordinateSystem());
    const [s, a, o, l, c, h] = this.children, d = e.getRenderTarget(), u = e.getActiveCubeFace(), p = e.getActiveMipmapLevel(), g = e.xr.enabled;
    e.xr.enabled = !1;
    const _ = n.texture.generateMipmaps;
    n.texture.generateMipmaps = !1, e.setRenderTarget(n, 0, r), e.render(t, s), e.setRenderTarget(n, 1, r), e.render(t, a), e.setRenderTarget(n, 2, r), e.render(t, o), e.setRenderTarget(n, 3, r), e.render(t, l), e.setRenderTarget(n, 4, r), e.render(t, c), n.texture.generateMipmaps = _, e.setRenderTarget(n, 5, r), e.render(t, h), e.setRenderTarget(d, u, p), e.xr.enabled = g, n.texture.needsPMREMUpdate = !0;
  }
}
class bc extends Yt {
  /**
   * Constructs a new cube texture.
   *
   * @param {Array<Image>} [images=[]] - An array holding a image for each side of a cube.
   * @param {number} [mapping=CubeReflectionMapping] - The texture mapping.
   * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
   * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
   * @param {number} [magFilter=LinearFilter] - The mag filter value.
   * @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
   * @param {number} [format=RGBAFormat] - The texture format.
   * @param {number} [type=UnsignedByteType] - The texture type.
   * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
   * @param {string} [colorSpace=NoColorSpace] - The color space value.
   */
  constructor(e = [], t = Qi, n, r, s, a, o, l, c, h) {
    super(e, t, n, r, s, a, o, l, c, h), this.isCubeTexture = !0, this.flipY = !1;
  }
  /**
   * Alias for {@link CubeTexture#image}.
   *
   * @type {Array<Image>}
   */
  get images() {
    return this.image;
  }
  set images(e) {
    this.image = e;
  }
}
class Hd extends wi {
  /**
   * Constructs a new cube render target.
   *
   * @param {number} [size=1] - The size of the render target.
   * @param {RenderTarget~Options} [options] - The configuration object.
   */
  constructor(e = 1, t = {}) {
    super(e, e, t), this.isWebGLCubeRenderTarget = !0;
    const n = { width: e, height: e, depth: 1 }, r = [n, n, n, n, n, n];
    this.texture = new bc(r), this._setTextureOptions(t), this.texture.isRenderTargetTexture = !0;
  }
  /**
   * Converts the given equirectangular texture to a cube map.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {Texture} texture - The equirectangular texture.
   * @return {WebGLCubeRenderTarget} A reference to this cube render target.
   */
  fromEquirectangularTexture(e, t) {
    this.texture.type = t.type, this.texture.colorSpace = t.colorSpace, this.texture.generateMipmaps = t.generateMipmaps, this.texture.minFilter = t.minFilter, this.texture.magFilter = t.magFilter;
    const n = {
      uniforms: {
        tEquirect: { value: null }
      },
      vertexShader: (
        /* glsl */
        `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`
      ),
      fragmentShader: (
        /* glsl */
        `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
      )
    }, r = new yn(5, 5, 5), s = new ri({
      name: "CubemapFromEquirect",
      uniforms: nr(n.uniforms),
      vertexShader: n.vertexShader,
      fragmentShader: n.fragmentShader,
      side: Jt,
      blending: ti
    });
    s.uniforms.tEquirect.value = t;
    const a = new Ot(r, s), o = t.minFilter;
    return t.minFilter === xi && (t.minFilter = An), new zd(1, 10, this).update(e, a), t.minFilter = o, a.geometry.dispose(), a.material.dispose(), this;
  }
  /**
   * Clears this cube render target.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {boolean} [color=true] - Whether the color buffer should be cleared or not.
   * @param {boolean} [depth=true] - Whether the depth buffer should be cleared or not.
   * @param {boolean} [stencil=true] - Whether the stencil buffer should be cleared or not.
   */
  clear(e, t = !0, n = !0, r = !0) {
    const s = e.getRenderTarget();
    for (let a = 0; a < 6; a++)
      e.setRenderTarget(this, a), e.clear(t, n, r);
    e.setRenderTarget(s);
  }
}
class qt extends wt {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group";
  }
}
const Vd = { type: "move" };
class Ks {
  /**
   * Constructs a new XR controller.
   */
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  /**
   * Returns a group representing the hand space of the XR controller.
   *
   * @return {Group} A group representing the hand space of the XR controller.
   */
  getHandSpace() {
    return this._hand === null && (this._hand = new qt(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
  }
  /**
   * Returns a group representing the target ray space of the XR controller.
   *
   * @return {Group} A group representing the target ray space of the XR controller.
   */
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new qt(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new N(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new N()), this._targetRay;
  }
  /**
   * Returns a group representing the grip space of the XR controller.
   *
   * @return {Group} A group representing the grip space of the XR controller.
   */
  getGripSpace() {
    return this._grip === null && (this._grip = new qt(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new N(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new N()), this._grip;
  }
  /**
   * Dispatches the given event to the groups representing
   * the different coordinate spaces of the XR controller.
   *
   * @param {Object} event - The event to dispatch.
   * @return {WebXRController} A reference to this instance.
   */
  dispatchEvent(e) {
    return this._targetRay !== null && this._targetRay.dispatchEvent(e), this._grip !== null && this._grip.dispatchEvent(e), this._hand !== null && this._hand.dispatchEvent(e), this;
  }
  /**
   * Connects the controller with the given XR input source.
   *
   * @param {XRInputSource} inputSource - The input source.
   * @return {WebXRController} A reference to this instance.
   */
  connect(e) {
    if (e && e.hand) {
      const t = this._hand;
      if (t)
        for (const n of e.hand.values())
          this._getHandJoint(t, n);
    }
    return this.dispatchEvent({ type: "connected", data: e }), this;
  }
  /**
   * Disconnects the controller from the given XR input source.
   *
   * @param {XRInputSource} inputSource - The input source.
   * @return {WebXRController} A reference to this instance.
   */
  disconnect(e) {
    return this.dispatchEvent({ type: "disconnected", data: e }), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this;
  }
  /**
   * Updates the controller with the given input source, XR frame and reference space.
   * This updates the transformations of the groups that represent the different
   * coordinate systems of the controller.
   *
   * @param {XRInputSource} inputSource - The input source.
   * @param {XRFrame} frame - The XR frame.
   * @param {XRReferenceSpace} referenceSpace - The reference space.
   * @return {WebXRController} A reference to this instance.
   */
  update(e, t, n) {
    let r = null, s = null, a = null;
    const o = this._targetRay, l = this._grip, c = this._hand;
    if (e && t.session.visibilityState !== "visible-blurred") {
      if (c && e.hand) {
        a = !0;
        for (const _ of e.hand.values()) {
          const m = t.getJointPose(_, n), f = this._getHandJoint(c, _);
          m !== null && (f.matrix.fromArray(m.transform.matrix), f.matrix.decompose(f.position, f.rotation, f.scale), f.matrixWorldNeedsUpdate = !0, f.jointRadius = m.radius), f.visible = m !== null;
        }
        const h = c.joints["index-finger-tip"], d = c.joints["thumb-tip"], u = h.position.distanceTo(d.position), p = 0.02, g = 5e-3;
        c.inputState.pinching && u > p + g ? (c.inputState.pinching = !1, this.dispatchEvent({
          type: "pinchend",
          handedness: e.handedness,
          target: this
        })) : !c.inputState.pinching && u <= p - g && (c.inputState.pinching = !0, this.dispatchEvent({
          type: "pinchstart",
          handedness: e.handedness,
          target: this
        }));
      } else
        l !== null && e.gripSpace && (s = t.getPose(e.gripSpace, n), s !== null && (l.matrix.fromArray(s.transform.matrix), l.matrix.decompose(l.position, l.rotation, l.scale), l.matrixWorldNeedsUpdate = !0, s.linearVelocity ? (l.hasLinearVelocity = !0, l.linearVelocity.copy(s.linearVelocity)) : l.hasLinearVelocity = !1, s.angularVelocity ? (l.hasAngularVelocity = !0, l.angularVelocity.copy(s.angularVelocity)) : l.hasAngularVelocity = !1));
      o !== null && (r = t.getPose(e.targetRaySpace, n), r === null && s !== null && (r = s), r !== null && (o.matrix.fromArray(r.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(r.linearVelocity)) : o.hasLinearVelocity = !1, r.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(r.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(Vd)));
    }
    return o !== null && (o.visible = r !== null), l !== null && (l.visible = s !== null), c !== null && (c.visible = a !== null), this;
  }
  /**
   * Returns a group representing the hand joint for the given input joint.
   *
   * @private
   * @param {Group} hand - The group representing the hand space.
   * @param {XRJointSpace} inputjoint - The hand joint data.
   * @return {Group} A group representing the hand joint for the given input joint.
   */
  _getHandJoint(e, t) {
    if (e.joints[t.jointName] === void 0) {
      const n = new qt();
      n.matrixAutoUpdate = !1, n.visible = !1, e.joints[t.jointName] = n, e.add(n);
    }
    return e.joints[t.jointName];
  }
}
class Gd extends wt {
  /**
   * Constructs a new scene.
   */
  constructor() {
    super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new In(), this.environmentIntensity = 1, this.environmentRotation = new In(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  copy(e, t) {
    return super.copy(e, t), e.background !== null && (this.background = e.background.clone()), e.environment !== null && (this.environment = e.environment.clone()), e.fog !== null && (this.fog = e.fog.clone()), this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, this.backgroundRotation.copy(e.backgroundRotation), this.environmentIntensity = e.environmentIntensity, this.environmentRotation.copy(e.environmentRotation), e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()), this.matrixAutoUpdate = e.matrixAutoUpdate, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.fog !== null && (t.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (t.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (t.object.backgroundIntensity = this.backgroundIntensity), t.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (t.object.environmentIntensity = this.environmentIntensity), t.object.environmentRotation = this.environmentRotation.toArray(), t;
  }
}
const Zs = /* @__PURE__ */ new N(), Wd = /* @__PURE__ */ new N(), $d = /* @__PURE__ */ new ze();
class Hn {
  /**
   * Constructs a new plane.
   *
   * @param {Vector3} [normal=(1,0,0)] - A unit length vector defining the normal of the plane.
   * @param {number} [constant=0] - The signed distance from the origin to the plane.
   */
  constructor(e = new N(1, 0, 0), t = 0) {
    this.isPlane = !0, this.normal = e, this.constant = t;
  }
  /**
   * Sets the plane components by copying the given values.
   *
   * @param {Vector3} normal - The normal.
   * @param {number} constant - The constant.
   * @return {Plane} A reference to this plane.
   */
  set(e, t) {
    return this.normal.copy(e), this.constant = t, this;
  }
  /**
   * Sets the plane components by defining `x`, `y`, `z` as the
   * plane normal and `w` as the constant.
   *
   * @param {number} x - The value for the normal's x component.
   * @param {number} y - The value for the normal's y component.
   * @param {number} z - The value for the normal's z component.
   * @param {number} w - The constant value.
   * @return {Plane} A reference to this plane.
   */
  setComponents(e, t, n, r) {
    return this.normal.set(e, t, n), this.constant = r, this;
  }
  /**
   * Sets the plane from the given normal and coplanar point (that is a point
   * that lies onto the plane).
   *
   * @param {Vector3} normal - The normal.
   * @param {Vector3} point - A coplanar point.
   * @return {Plane} A reference to this plane.
   */
  setFromNormalAndCoplanarPoint(e, t) {
    return this.normal.copy(e), this.constant = -t.dot(this.normal), this;
  }
  /**
   * Sets the plane from three coplanar points. The winding order is
   * assumed to be counter-clockwise, and determines the direction of
   * the plane normal.
   *
   * @param {Vector3} a - The first coplanar point.
   * @param {Vector3} b - The second coplanar point.
   * @param {Vector3} c - The third coplanar point.
   * @return {Plane} A reference to this plane.
   */
  setFromCoplanarPoints(e, t, n) {
    const r = Zs.subVectors(n, t).cross(Wd.subVectors(e, t)).normalize();
    return this.setFromNormalAndCoplanarPoint(r, e), this;
  }
  /**
   * Copies the values of the given plane to this instance.
   *
   * @param {Plane} plane - The plane to copy.
   * @return {Plane} A reference to this plane.
   */
  copy(e) {
    return this.normal.copy(e.normal), this.constant = e.constant, this;
  }
  /**
   * Normalizes the plane normal and adjusts the constant accordingly.
   *
   * @return {Plane} A reference to this plane.
   */
  normalize() {
    const e = 1 / this.normal.length();
    return this.normal.multiplyScalar(e), this.constant *= e, this;
  }
  /**
   * Negates both the plane normal and the constant.
   *
   * @return {Plane} A reference to this plane.
   */
  negate() {
    return this.constant *= -1, this.normal.negate(), this;
  }
  /**
   * Returns the signed distance from the given point to this plane.
   *
   * @param {Vector3} point - The point to compute the distance for.
   * @return {number} The signed distance.
   */
  distanceToPoint(e) {
    return this.normal.dot(e) + this.constant;
  }
  /**
   * Returns the signed distance from the given sphere to this plane.
   *
   * @param {Sphere} sphere - The sphere to compute the distance for.
   * @return {number} The signed distance.
   */
  distanceToSphere(e) {
    return this.distanceToPoint(e.center) - e.radius;
  }
  /**
   * Projects a the given point onto the plane.
   *
   * @param {Vector3} point - The point to project.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The projected point on the plane.
   */
  projectPoint(e, t) {
    return t.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e));
  }
  /**
   * Returns the intersection point of the passed line and the plane. Returns
   * `null` if the line does not intersect. Returns the line's starting point if
   * the line is coplanar with the plane.
   *
   * @param {Line3} line - The line to compute the intersection for.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {?Vector3} The intersection point.
   */
  intersectLine(e, t) {
    const n = e.delta(Zs), r = this.normal.dot(n);
    if (r === 0)
      return this.distanceToPoint(e.start) === 0 ? t.copy(e.start) : null;
    const s = -(e.start.dot(this.normal) + this.constant) / r;
    return s < 0 || s > 1 ? null : t.copy(e.start).addScaledVector(n, s);
  }
  /**
   * Returns `true` if the given line segment intersects with (passes through) the plane.
   *
   * @param {Line3} line - The line to test.
   * @return {boolean} Whether the given line segment intersects with the plane or not.
   */
  intersectsLine(e) {
    const t = this.distanceToPoint(e.start), n = this.distanceToPoint(e.end);
    return t < 0 && n > 0 || n < 0 && t > 0;
  }
  /**
   * Returns `true` if the given bounding box intersects with the plane.
   *
   * @param {Box3} box - The bounding box to test.
   * @return {boolean} Whether the given bounding box intersects with the plane or not.
   */
  intersectsBox(e) {
    return e.intersectsPlane(this);
  }
  /**
   * Returns `true` if the given bounding sphere intersects with the plane.
   *
   * @param {Sphere} sphere - The bounding sphere to test.
   * @return {boolean} Whether the given bounding sphere intersects with the plane or not.
   */
  intersectsSphere(e) {
    return e.intersectsPlane(this);
  }
  /**
   * Returns a coplanar vector to the plane, by calculating the
   * projection of the normal at the origin onto the plane.
   *
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The coplanar point.
   */
  coplanarPoint(e) {
    return e.copy(this.normal).multiplyScalar(-this.constant);
  }
  /**
   * Apply a 4x4 matrix to the plane. The matrix must be an affine, homogeneous transform.
   *
   * The optional normal matrix can be pre-computed like so:
   * ```js
   * const optionalNormalMatrix = new THREE.Matrix3().getNormalMatrix( matrix );
   * ```
   *
   * @param {Matrix4} matrix - The transformation matrix.
   * @param {Matrix4} [optionalNormalMatrix] - A pre-computed normal matrix.
   * @return {Plane} A reference to this plane.
   */
  applyMatrix4(e, t) {
    const n = t || $d.getNormalMatrix(e), r = this.coplanarPoint(Zs).applyMatrix4(e), s = this.normal.applyMatrix3(n).normalize();
    return this.constant = -r.dot(s), this;
  }
  /**
   * Translates the plane by the distance defined by the given offset vector.
   * Note that this only affects the plane constant and will not affect the normal vector.
   *
   * @param {Vector3} offset - The offset vector.
   * @return {Plane} A reference to this plane.
   */
  translate(e) {
    return this.constant -= e.dot(this.normal), this;
  }
  /**
   * Returns `true` if this plane is equal with the given one.
   *
   * @param {Plane} plane - The plane to test for equality.
   * @return {boolean} Whether this plane is equal with the given one.
   */
  equals(e) {
    return e.normal.equals(this.normal) && e.constant === this.constant;
  }
  /**
   * Returns a new plane with copied values from this instance.
   *
   * @return {Plane} A clone of this instance.
   */
  clone() {
    return new this.constructor().copy(this);
  }
}
const di = /* @__PURE__ */ new bs(), Xd = /* @__PURE__ */ new Ue(0.5, 0.5), jr = /* @__PURE__ */ new N();
class mo {
  /**
   * Constructs a new frustum.
   *
   * @param {Plane} [p0] - The first plane that encloses the frustum.
   * @param {Plane} [p1] - The second plane that encloses the frustum.
   * @param {Plane} [p2] - The third plane that encloses the frustum.
   * @param {Plane} [p3] - The fourth plane that encloses the frustum.
   * @param {Plane} [p4] - The fifth plane that encloses the frustum.
   * @param {Plane} [p5] - The sixth plane that encloses the frustum.
   */
  constructor(e = new Hn(), t = new Hn(), n = new Hn(), r = new Hn(), s = new Hn(), a = new Hn()) {
    this.planes = [e, t, n, r, s, a];
  }
  /**
   * Sets the frustum planes by copying the given planes.
   *
   * @param {Plane} [p0] - The first plane that encloses the frustum.
   * @param {Plane} [p1] - The second plane that encloses the frustum.
   * @param {Plane} [p2] - The third plane that encloses the frustum.
   * @param {Plane} [p3] - The fourth plane that encloses the frustum.
   * @param {Plane} [p4] - The fifth plane that encloses the frustum.
   * @param {Plane} [p5] - The sixth plane that encloses the frustum.
   * @return {Frustum} A reference to this frustum.
   */
  set(e, t, n, r, s, a) {
    const o = this.planes;
    return o[0].copy(e), o[1].copy(t), o[2].copy(n), o[3].copy(r), o[4].copy(s), o[5].copy(a), this;
  }
  /**
   * Copies the values of the given frustum to this instance.
   *
   * @param {Frustum} frustum - The frustum to copy.
   * @return {Frustum} A reference to this frustum.
   */
  copy(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++)
      t[n].copy(e.planes[n]);
    return this;
  }
  /**
   * Sets the frustum planes from the given projection matrix.
   *
   * @param {Matrix4} m - The projection matrix.
   * @param {(WebGLCoordinateSystem|WebGPUCoordinateSystem)} coordinateSystem - The coordinate system.
   * @param {boolean} [reversedDepth=false] - Whether to use a reversed depth.
   * @return {Frustum} A reference to this frustum.
   */
  setFromProjectionMatrix(e, t = Rn, n = !1) {
    const r = this.planes, s = e.elements, a = s[0], o = s[1], l = s[2], c = s[3], h = s[4], d = s[5], u = s[6], p = s[7], g = s[8], _ = s[9], m = s[10], f = s[11], T = s[12], b = s[13], y = s[14], w = s[15];
    if (r[0].setComponents(c - a, p - h, f - g, w - T).normalize(), r[1].setComponents(c + a, p + h, f + g, w + T).normalize(), r[2].setComponents(c + o, p + d, f + _, w + b).normalize(), r[3].setComponents(c - o, p - d, f - _, w - b).normalize(), n)
      r[4].setComponents(l, u, m, y).normalize(), r[5].setComponents(c - l, p - u, f - m, w - y).normalize();
    else if (r[4].setComponents(c - l, p - u, f - m, w - y).normalize(), t === Rn)
      r[5].setComponents(c + l, p + u, f + m, w + y).normalize();
    else if (t === ps)
      r[5].setComponents(l, u, m, y).normalize();
    else
      throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + t);
    return this;
  }
  /**
   * Returns `true` if the 3D object's bounding sphere is intersecting this frustum.
   *
   * Note that the 3D object must have a geometry so that the bounding sphere can be calculated.
   *
   * @param {Object3D} object - The 3D object to test.
   * @return {boolean} Whether the 3D object's bounding sphere is intersecting this frustum or not.
   */
  intersectsObject(e) {
    if (e.boundingSphere !== void 0)
      e.boundingSphere === null && e.computeBoundingSphere(), di.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
    else {
      const t = e.geometry;
      t.boundingSphere === null && t.computeBoundingSphere(), di.copy(t.boundingSphere).applyMatrix4(e.matrixWorld);
    }
    return this.intersectsSphere(di);
  }
  /**
   * Returns `true` if the given sprite is intersecting this frustum.
   *
   * @param {Sprite} sprite - The sprite to test.
   * @return {boolean} Whether the sprite is intersecting this frustum or not.
   */
  intersectsSprite(e) {
    di.center.set(0, 0, 0);
    const t = Xd.distanceTo(e.center);
    return di.radius = 0.7071067811865476 + t, di.applyMatrix4(e.matrixWorld), this.intersectsSphere(di);
  }
  /**
   * Returns `true` if the given bounding sphere is intersecting this frustum.
   *
   * @param {Sphere} sphere - The bounding sphere to test.
   * @return {boolean} Whether the bounding sphere is intersecting this frustum or not.
   */
  intersectsSphere(e) {
    const t = this.planes, n = e.center, r = -e.radius;
    for (let s = 0; s < 6; s++)
      if (t[s].distanceToPoint(n) < r)
        return !1;
    return !0;
  }
  /**
   * Returns `true` if the given bounding box is intersecting this frustum.
   *
   * @param {Box3} box - The bounding box to test.
   * @return {boolean} Whether the bounding box is intersecting this frustum or not.
   */
  intersectsBox(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++) {
      const r = t[n];
      if (jr.x = r.normal.x > 0 ? e.max.x : e.min.x, jr.y = r.normal.y > 0 ? e.max.y : e.min.y, jr.z = r.normal.z > 0 ? e.max.z : e.min.z, r.distanceToPoint(jr) < 0)
        return !1;
    }
    return !0;
  }
  /**
   * Returns `true` if the given point lies within the frustum.
   *
   * @param {Vector3} point - The point to test.
   * @return {boolean} Whether the point lies within this frustum or not.
   */
  containsPoint(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++)
      if (t[n].distanceToPoint(e) < 0)
        return !1;
    return !0;
  }
  /**
   * Returns a new frustum with copied values from this instance.
   *
   * @return {Frustum} A clone of this instance.
   */
  clone() {
    return new this.constructor().copy(this);
  }
}
class Xn extends sr {
  /**
   * Constructs a new line basic material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(e) {
    super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new Xe(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.linewidth = e.linewidth, this.linecap = e.linecap, this.linejoin = e.linejoin, this.fog = e.fog, this;
  }
}
const gs = /* @__PURE__ */ new N(), _s = /* @__PURE__ */ new N(), al = /* @__PURE__ */ new lt(), fr = /* @__PURE__ */ new Es(), Kr = /* @__PURE__ */ new bs(), Js = /* @__PURE__ */ new N(), ol = /* @__PURE__ */ new N();
class Ec extends wt {
  /**
   * Constructs a new line.
   *
   * @param {BufferGeometry} [geometry] - The line geometry.
   * @param {Material|Array<Material>} [material] - The line material.
   */
  constructor(e = new un(), t = new Xn()) {
    super(), this.isLine = !0, this.type = "Line", this.geometry = e, this.material = t, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets();
  }
  copy(e, t) {
    return super.copy(e, t), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  /**
   * Computes an array of distance values which are necessary for rendering dashed lines.
   * For each vertex in the geometry, the method calculates the cumulative length from the
   * current point to the very beginning of the line.
   *
   * @return {Line} A reference to this line.
   */
  computeLineDistances() {
    const e = this.geometry;
    if (e.index === null) {
      const t = e.attributes.position, n = [0];
      for (let r = 1, s = t.count; r < s; r++)
        gs.fromBufferAttribute(t, r - 1), _s.fromBufferAttribute(t, r), n[r] = n[r - 1], n[r] += gs.distanceTo(_s);
      e.setAttribute("lineDistance", new Cn(n, 1));
    } else
      console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
  /**
   * Computes intersection points between a casted ray and this line.
   *
   * @param {Raycaster} raycaster - The raycaster.
   * @param {Array<Object>} intersects - The target array that holds the intersection points.
   */
  raycast(e, t) {
    const n = this.geometry, r = this.matrixWorld, s = e.params.Line.threshold, a = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), Kr.copy(n.boundingSphere), Kr.applyMatrix4(r), Kr.radius += s, e.ray.intersectsSphere(Kr) === !1) return;
    al.copy(r).invert(), fr.copy(e.ray).applyMatrix4(al);
    const o = s / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = o * o, c = this.isLineSegments ? 2 : 1, h = n.index, u = n.attributes.position;
    if (h !== null) {
      const p = Math.max(0, a.start), g = Math.min(h.count, a.start + a.count);
      for (let _ = p, m = g - 1; _ < m; _ += c) {
        const f = h.getX(_), T = h.getX(_ + 1), b = Zr(this, e, fr, l, f, T, _);
        b && t.push(b);
      }
      if (this.isLineLoop) {
        const _ = h.getX(g - 1), m = h.getX(p), f = Zr(this, e, fr, l, _, m, g - 1);
        f && t.push(f);
      }
    } else {
      const p = Math.max(0, a.start), g = Math.min(u.count, a.start + a.count);
      for (let _ = p, m = g - 1; _ < m; _ += c) {
        const f = Zr(this, e, fr, l, _, _ + 1, _);
        f && t.push(f);
      }
      if (this.isLineLoop) {
        const _ = Zr(this, e, fr, l, g - 1, p, g - 1);
        _ && t.push(_);
      }
    }
  }
  /**
   * Sets the values of {@link Line#morphTargetDictionary} and {@link Line#morphTargetInfluences}
   * to make sure existing morph targets can influence this 3D object.
   */
  updateMorphTargets() {
    const t = this.geometry.morphAttributes, n = Object.keys(t);
    if (n.length > 0) {
      const r = t[n[0]];
      if (r !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let s = 0, a = r.length; s < a; s++) {
          const o = r[s].name || String(s);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = s;
        }
      }
    }
  }
}
function Zr(i, e, t, n, r, s, a) {
  const o = i.geometry.attributes.position;
  if (gs.fromBufferAttribute(o, r), _s.fromBufferAttribute(o, s), t.distanceSqToSegment(gs, _s, Js, ol) > n) return;
  Js.applyMatrix4(i.matrixWorld);
  const c = e.ray.origin.distanceTo(Js);
  if (!(c < e.near || c > e.far))
    return {
      distance: c,
      // What do we want? intersection point on the ray or on the segment??
      // point: raycaster.ray.at( distance ),
      point: ol.clone().applyMatrix4(i.matrixWorld),
      index: a,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: i
    };
}
const ll = /* @__PURE__ */ new N(), cl = /* @__PURE__ */ new N();
class Si extends Ec {
  /**
   * Constructs a new line segments.
   *
   * @param {BufferGeometry} [geometry] - The line geometry.
   * @param {Material|Array<Material>} [material] - The line material.
   */
  constructor(e, t) {
    super(e, t), this.isLineSegments = !0, this.type = "LineSegments";
  }
  computeLineDistances() {
    const e = this.geometry;
    if (e.index === null) {
      const t = e.attributes.position, n = [];
      for (let r = 0, s = t.count; r < s; r += 2)
        ll.fromBufferAttribute(t, r), cl.fromBufferAttribute(t, r + 1), n[r] = r === 0 ? 0 : n[r - 1], n[r + 1] = n[r] + ll.distanceTo(cl);
      e.setAttribute("lineDistance", new Cn(n, 1));
    } else
      console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
}
class Qa extends Yt {
  /**
   * Constructs a new texture.
   *
   * @param {HTMLCanvasElement} [canvas] - The HTML canvas element.
   * @param {number} [mapping=Texture.DEFAULT_MAPPING] - The texture mapping.
   * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
   * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
   * @param {number} [magFilter=LinearFilter] - The mag filter value.
   * @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
   * @param {number} [format=RGBAFormat] - The texture format.
   * @param {number} [type=UnsignedByteType] - The texture type.
   * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
   */
  constructor(e, t, n, r, s, a, o, l, c) {
    super(e, t, n, r, s, a, o, l, c), this.isCanvasTexture = !0, this.needsUpdate = !0;
  }
}
class wc extends Yt {
  /**
   * Constructs a new depth texture.
   *
   * @param {number} width - The width of the texture.
   * @param {number} height - The height of the texture.
   * @param {number} [type=UnsignedIntType] - The texture type.
   * @param {number} [mapping=Texture.DEFAULT_MAPPING] - The texture mapping.
   * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
   * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
   * @param {number} [magFilter=LinearFilter] - The mag filter value.
   * @param {number} [minFilter=LinearFilter] - The min filter value.
   * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
   * @param {number} [format=DepthFormat] - The texture format.
   * @param {number} [depth=1] - The depth of the texture.
   */
  constructor(e, t, n = bi, r, s, a, o = Mn, l = Mn, c, h = yr, d = 1) {
    if (h !== yr && h !== br)
      throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    const u = { width: e, height: t, depth: d };
    super(u, r, s, a, o, l, h, n, c), this.isDepthTexture = !0, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
  }
  copy(e) {
    return super.copy(e), this.source = new fo(Object.assign({}, e.image)), this.compareFunction = e.compareFunction, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.compareFunction !== null && (t.compareFunction = this.compareFunction), t;
  }
}
class Tc extends Yt {
  /**
   * Creates a new raw texture.
   *
   * @param {?(WebGLTexture|GPUTexture)} [sourceTexture=null] - The external texture.
   */
  constructor(e = null) {
    super(), this.sourceTexture = e, this.isExternalTexture = !0;
  }
  copy(e) {
    return super.copy(e), this.sourceTexture = e.sourceTexture, this;
  }
}
const Jr = /* @__PURE__ */ new N(), Qr = /* @__PURE__ */ new N(), Qs = /* @__PURE__ */ new N(), es = /* @__PURE__ */ new dn();
class Zi extends un {
  /**
   * Constructs a new edges geometry.
   *
   * @param {?BufferGeometry} [geometry=null] - The geometry.
   * @param {number} [thresholdAngle=1] - An edge is only rendered if the angle (in degrees)
   * between the face normals of the adjoining faces exceeds this value.
   */
  constructor(e = null, t = 1) {
    if (super(), this.type = "EdgesGeometry", this.parameters = {
      geometry: e,
      thresholdAngle: t
    }, e !== null) {
      const r = Math.pow(10, 4), s = Math.cos(ji * t), a = e.getIndex(), o = e.getAttribute("position"), l = a ? a.count : o.count, c = [0, 0, 0], h = ["a", "b", "c"], d = new Array(3), u = {}, p = [];
      for (let g = 0; g < l; g += 3) {
        a ? (c[0] = a.getX(g), c[1] = a.getX(g + 1), c[2] = a.getX(g + 2)) : (c[0] = g, c[1] = g + 1, c[2] = g + 2);
        const { a: _, b: m, c: f } = es;
        if (_.fromBufferAttribute(o, c[0]), m.fromBufferAttribute(o, c[1]), f.fromBufferAttribute(o, c[2]), es.getNormal(Qs), d[0] = `${Math.round(_.x * r)},${Math.round(_.y * r)},${Math.round(_.z * r)}`, d[1] = `${Math.round(m.x * r)},${Math.round(m.y * r)},${Math.round(m.z * r)}`, d[2] = `${Math.round(f.x * r)},${Math.round(f.y * r)},${Math.round(f.z * r)}`, !(d[0] === d[1] || d[1] === d[2] || d[2] === d[0]))
          for (let T = 0; T < 3; T++) {
            const b = (T + 1) % 3, y = d[T], w = d[b], R = es[h[T]], P = es[h[b]], O = `${y}_${w}`, S = `${w}_${y}`;
            S in u && u[S] ? (Qs.dot(u[S].normal) <= s && (p.push(R.x, R.y, R.z), p.push(P.x, P.y, P.z)), u[S] = null) : O in u || (u[O] = {
              index0: c[T],
              index1: c[b],
              normal: Qs.clone()
            });
          }
      }
      for (const g in u)
        if (u[g]) {
          const { index0: _, index1: m } = u[g];
          Jr.fromBufferAttribute(o, _), Qr.fromBufferAttribute(o, m), p.push(Jr.x, Jr.y, Jr.z), p.push(Qr.x, Qr.y, Qr.z);
        }
      this.setAttribute("position", new Cn(p, 3));
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
}
class qd {
  /**
   * Constructs a new curve.
   */
  constructor() {
    this.type = "Curve", this.arcLengthDivisions = 200, this.needsUpdate = !1, this.cacheArcLengths = null;
  }
  /**
   * This method returns a vector in 2D or 3D space (depending on the curve definition)
   * for the given interpolation factor.
   *
   * @abstract
   * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
   * @param {(Vector2|Vector3)} [optionalTarget] - The optional target vector the result is written to.
   * @return {(Vector2|Vector3)} The position on the curve. It can be a 2D or 3D vector depending on the curve definition.
   */
  getPoint() {
    console.warn("THREE.Curve: .getPoint() not implemented.");
  }
  /**
   * This method returns a vector in 2D or 3D space (depending on the curve definition)
   * for the given interpolation factor. Unlike {@link Curve#getPoint}, this method honors the length
   * of the curve which equidistant samples.
   *
   * @param {number} u - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
   * @param {(Vector2|Vector3)} [optionalTarget] - The optional target vector the result is written to.
   * @return {(Vector2|Vector3)} The position on the curve. It can be a 2D or 3D vector depending on the curve definition.
   */
  getPointAt(e, t) {
    const n = this.getUtoTmapping(e);
    return this.getPoint(n, t);
  }
  /**
   * This method samples the curve via {@link Curve#getPoint} and returns an array of points representing
   * the curve shape.
   *
   * @param {number} [divisions=5] - The number of divisions.
   * @return {Array<(Vector2|Vector3)>} An array holding the sampled curve values. The number of points is `divisions + 1`.
   */
  getPoints(e = 5) {
    const t = [];
    for (let n = 0; n <= e; n++)
      t.push(this.getPoint(n / e));
    return t;
  }
  // Get sequence of points using getPointAt( u )
  /**
   * This method samples the curve via {@link Curve#getPointAt} and returns an array of points representing
   * the curve shape. Unlike {@link Curve#getPoints}, this method returns equi-spaced points across the entire
   * curve.
   *
   * @param {number} [divisions=5] - The number of divisions.
   * @return {Array<(Vector2|Vector3)>} An array holding the sampled curve values. The number of points is `divisions + 1`.
   */
  getSpacedPoints(e = 5) {
    const t = [];
    for (let n = 0; n <= e; n++)
      t.push(this.getPointAt(n / e));
    return t;
  }
  /**
   * Returns the total arc length of the curve.
   *
   * @return {number} The length of the curve.
   */
  getLength() {
    const e = this.getLengths();
    return e[e.length - 1];
  }
  /**
   * Returns an array of cumulative segment lengths of the curve.
   *
   * @param {number} [divisions=this.arcLengthDivisions] - The number of divisions.
   * @return {Array<number>} An array holding the cumulative segment lengths.
   */
  getLengths(e = this.arcLengthDivisions) {
    if (this.cacheArcLengths && this.cacheArcLengths.length === e + 1 && !this.needsUpdate)
      return this.cacheArcLengths;
    this.needsUpdate = !1;
    const t = [];
    let n, r = this.getPoint(0), s = 0;
    t.push(0);
    for (let a = 1; a <= e; a++)
      n = this.getPoint(a / e), s += n.distanceTo(r), t.push(s), r = n;
    return this.cacheArcLengths = t, t;
  }
  /**
   * Update the cumulative segment distance cache. The method must be called
   * every time curve parameters are changed. If an updated curve is part of a
   * composed curve like {@link CurvePath}, this method must be called on the
   * composed curve, too.
   */
  updateArcLengths() {
    this.needsUpdate = !0, this.getLengths();
  }
  /**
   * Given an interpolation factor in the range `[0,1]`, this method returns an updated
   * interpolation factor in the same range that can be ued to sample equidistant points
   * from a curve.
   *
   * @param {number} u - The interpolation factor.
   * @param {?number} distance - An optional distance on the curve.
   * @return {number} The updated interpolation factor.
   */
  getUtoTmapping(e, t = null) {
    const n = this.getLengths();
    let r = 0;
    const s = n.length;
    let a;
    t ? a = t : a = e * n[s - 1];
    let o = 0, l = s - 1, c;
    for (; o <= l; )
      if (r = Math.floor(o + (l - o) / 2), c = n[r] - a, c < 0)
        o = r + 1;
      else if (c > 0)
        l = r - 1;
      else {
        l = r;
        break;
      }
    if (r = l, n[r] === a)
      return r / (s - 1);
    const h = n[r], u = n[r + 1] - h, p = (a - h) / u;
    return (r + p) / (s - 1);
  }
  /**
   * Returns a unit vector tangent for the given interpolation factor.
   * If the derived curve does not implement its tangent derivation,
   * two points a small delta apart will be used to find its gradient
   * which seems to give a reasonable approximation.
   *
   * @param {number} t - The interpolation factor.
   * @param {(Vector2|Vector3)} [optionalTarget] - The optional target vector the result is written to.
   * @return {(Vector2|Vector3)} The tangent vector.
   */
  getTangent(e, t) {
    let r = e - 1e-4, s = e + 1e-4;
    r < 0 && (r = 0), s > 1 && (s = 1);
    const a = this.getPoint(r), o = this.getPoint(s), l = t || (a.isVector2 ? new Ue() : new N());
    return l.copy(o).sub(a).normalize(), l;
  }
  /**
   * Same as {@link Curve#getTangent} but with equidistant samples.
   *
   * @param {number} u - The interpolation factor.
   * @param {(Vector2|Vector3)} [optionalTarget] - The optional target vector the result is written to.
   * @return {(Vector2|Vector3)} The tangent vector.
   * @see {@link Curve#getPointAt}
   */
  getTangentAt(e, t) {
    const n = this.getUtoTmapping(e);
    return this.getTangent(n, t);
  }
  /**
   * Generates the Frenet Frames. Requires a curve definition in 3D space. Used
   * in geometries like {@link TubeGeometry} or {@link ExtrudeGeometry}.
   *
   * @param {number} segments - The number of segments.
   * @param {boolean} [closed=false] - Whether the curve is closed or not.
   * @return {{tangents: Array<Vector3>, normals: Array<Vector3>, binormals: Array<Vector3>}} The Frenet Frames.
   */
  computeFrenetFrames(e, t = !1) {
    const n = new N(), r = [], s = [], a = [], o = new N(), l = new lt();
    for (let p = 0; p <= e; p++) {
      const g = p / e;
      r[p] = this.getTangentAt(g, new N());
    }
    s[0] = new N(), a[0] = new N();
    let c = Number.MAX_VALUE;
    const h = Math.abs(r[0].x), d = Math.abs(r[0].y), u = Math.abs(r[0].z);
    h <= c && (c = h, n.set(1, 0, 0)), d <= c && (c = d, n.set(0, 1, 0)), u <= c && n.set(0, 0, 1), o.crossVectors(r[0], n).normalize(), s[0].crossVectors(r[0], o), a[0].crossVectors(r[0], s[0]);
    for (let p = 1; p <= e; p++) {
      if (s[p] = s[p - 1].clone(), a[p] = a[p - 1].clone(), o.crossVectors(r[p - 1], r[p]), o.length() > Number.EPSILON) {
        o.normalize();
        const g = Math.acos(Ge(r[p - 1].dot(r[p]), -1, 1));
        s[p].applyMatrix4(l.makeRotationAxis(o, g));
      }
      a[p].crossVectors(r[p], s[p]);
    }
    if (t === !0) {
      let p = Math.acos(Ge(s[0].dot(s[e]), -1, 1));
      p /= e, r[0].dot(o.crossVectors(s[0], s[e])) > 0 && (p = -p);
      for (let g = 1; g <= e; g++)
        s[g].applyMatrix4(l.makeRotationAxis(r[g], p * g)), a[g].crossVectors(r[g], s[g]);
    }
    return {
      tangents: r,
      normals: s,
      binormals: a
    };
  }
  /**
   * Returns a new curve with copied values from this instance.
   *
   * @return {Curve} A clone of this instance.
   */
  clone() {
    return new this.constructor().copy(this);
  }
  /**
   * Copies the values of the given curve to this instance.
   *
   * @param {Curve} source - The curve to copy.
   * @return {Curve} A reference to this curve.
   */
  copy(e) {
    return this.arcLengthDivisions = e.arcLengthDivisions, this;
  }
  /**
   * Serializes the curve into JSON.
   *
   * @return {Object} A JSON object representing the serialized curve.
   * @see {@link ObjectLoader#parse}
   */
  toJSON() {
    const e = {
      metadata: {
        version: 4.7,
        type: "Curve",
        generator: "Curve.toJSON"
      }
    };
    return e.arcLengthDivisions = this.arcLengthDivisions, e.type = this.type, e;
  }
  /**
   * Deserializes the curve from the given JSON.
   *
   * @param {Object} json - The JSON holding the serialized curve.
   * @return {Curve} A reference to this curve.
   */
  fromJSON(e) {
    return this.arcLengthDivisions = e.arcLengthDivisions, this;
  }
}
function Yd(i, e) {
  const t = 1 - i;
  return t * t * e;
}
function jd(i, e) {
  return 2 * (1 - i) * i * e;
}
function Kd(i, e) {
  return i * i * e;
}
function ea(i, e, t, n) {
  return Yd(i, e) + jd(i, t) + Kd(i, n);
}
class Zd extends qd {
  /**
   * Constructs a new Quadratic Bezier curve.
   *
   * @param {Vector3} [v0] - The start point.
   * @param {Vector3} [v1] - The control point.
   * @param {Vector3} [v2] - The end point.
   */
  constructor(e = new N(), t = new N(), n = new N()) {
    super(), this.isQuadraticBezierCurve3 = !0, this.type = "QuadraticBezierCurve3", this.v0 = e, this.v1 = t, this.v2 = n;
  }
  /**
   * Returns a point on the curve.
   *
   * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
   * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
   * @return {Vector3} The position on the curve.
   */
  getPoint(e, t = new N()) {
    const n = t, r = this.v0, s = this.v1, a = this.v2;
    return n.set(
      ea(e, r.x, s.x, a.x),
      ea(e, r.y, s.y, a.y),
      ea(e, r.z, s.z, a.z)
    ), n;
  }
  copy(e) {
    return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
  }
}
class si extends un {
  /**
   * Constructs a new plane geometry.
   *
   * @param {number} [width=1] - The width along the X axis.
   * @param {number} [height=1] - The height along the Y axis
   * @param {number} [widthSegments=1] - The number of segments along the X axis.
   * @param {number} [heightSegments=1] - The number of segments along the Y axis.
   */
  constructor(e = 1, t = 1, n = 1, r = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = {
      width: e,
      height: t,
      widthSegments: n,
      heightSegments: r
    };
    const s = e / 2, a = t / 2, o = Math.floor(n), l = Math.floor(r), c = o + 1, h = l + 1, d = e / o, u = t / l, p = [], g = [], _ = [], m = [];
    for (let f = 0; f < h; f++) {
      const T = f * u - a;
      for (let b = 0; b < c; b++) {
        const y = b * d - s;
        g.push(y, -T, 0), _.push(0, 0, 1), m.push(b / o), m.push(1 - f / l);
      }
    }
    for (let f = 0; f < l; f++)
      for (let T = 0; T < o; T++) {
        const b = T + c * f, y = T + c * (f + 1), w = T + 1 + c * (f + 1), R = T + 1 + c * f;
        p.push(b, y, R), p.push(y, w, R);
      }
    this.setIndex(p), this.setAttribute("position", new Cn(g, 3)), this.setAttribute("normal", new Cn(_, 3)), this.setAttribute("uv", new Cn(m, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  /**
   * Factory method for creating an instance of this class from the given
   * JSON object.
   *
   * @param {Object} data - A JSON object representing the serialized geometry.
   * @return {PlaneGeometry} A new instance.
   */
  static fromJSON(e) {
    return new si(e.width, e.height, e.widthSegments, e.heightSegments);
  }
}
class Ac extends sr {
  /**
   * Constructs a new mesh standard material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(e) {
    super(), this.isMeshStandardMaterial = !0, this.type = "MeshStandardMaterial", this.defines = { STANDARD: "" }, this.color = new Xe(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Xe(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = fc, this.normalScale = new Ue(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new In(), this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.defines = { STANDARD: "" }, this.color.copy(e.color), this.roughness = e.roughness, this.metalness = e.metalness, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.roughnessMap = e.roughnessMap, this.metalnessMap = e.metalnessMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.envMapIntensity = e.envMapIntensity, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}
class Jd extends sr {
  /**
   * Constructs a new mesh depth material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(e) {
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = $h, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this;
  }
}
class Qd extends sr {
  /**
   * Constructs a new mesh distance material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(e) {
    super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
  }
}
class Rc extends wt {
  /**
   * Constructs a new light.
   *
   * @param {(number|Color|string)} [color=0xffffff] - The light's color.
   * @param {number} [intensity=1] - The light's strength/intensity.
   */
  constructor(e, t = 1) {
    super(), this.isLight = !0, this.type = "Light", this.color = new Xe(e), this.intensity = t;
  }
  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever this instance is no longer used in your app.
   */
  dispose() {
  }
  copy(e, t) {
    return super.copy(e, t), this.color.copy(e.color), this.intensity = e.intensity, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.color = this.color.getHex(), t.object.intensity = this.intensity, this.groundColor !== void 0 && (t.object.groundColor = this.groundColor.getHex()), this.distance !== void 0 && (t.object.distance = this.distance), this.angle !== void 0 && (t.object.angle = this.angle), this.decay !== void 0 && (t.object.decay = this.decay), this.penumbra !== void 0 && (t.object.penumbra = this.penumbra), this.shadow !== void 0 && (t.object.shadow = this.shadow.toJSON()), this.target !== void 0 && (t.object.target = this.target.uuid), t;
  }
}
class eu extends Rc {
  /**
   * Constructs a new hemisphere light.
   *
   * @param {(number|Color|string)} [skyColor=0xffffff] - The light's sky color.
   * @param {(number|Color|string)} [groundColor=0xffffff] - The light's ground color.
   * @param {number} [intensity=1] - The light's strength/intensity.
   */
  constructor(e, t, n) {
    super(e, n), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(wt.DEFAULT_UP), this.updateMatrix(), this.groundColor = new Xe(t);
  }
  copy(e, t) {
    return super.copy(e, t), this.groundColor.copy(e.groundColor), this;
  }
}
const ta = /* @__PURE__ */ new lt(), hl = /* @__PURE__ */ new N(), dl = /* @__PURE__ */ new N();
class tu {
  /**
   * Constructs a new light shadow.
   *
   * @param {Camera} camera - The light's view of the world.
   */
  constructor(e) {
    this.camera = e, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new Ue(512, 512), this.mapType = Ln, this.map = null, this.mapPass = null, this.matrix = new lt(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new mo(), this._frameExtents = new Ue(1, 1), this._viewportCount = 1, this._viewports = [
      new vt(0, 0, 1, 1)
    ];
  }
  /**
   * Used internally by the renderer to get the number of viewports that need
   * to be rendered for this shadow.
   *
   * @return {number} The viewport count.
   */
  getViewportCount() {
    return this._viewportCount;
  }
  /**
   * Gets the shadow cameras frustum. Used internally by the renderer to cull objects.
   *
   * @return {Frustum} The shadow camera frustum.
   */
  getFrustum() {
    return this._frustum;
  }
  /**
   * Update the matrices for the camera and shadow, used internally by the renderer.
   *
   * @param {Light} light - The light for which the shadow is being rendered.
   */
  updateMatrices(e) {
    const t = this.camera, n = this.matrix;
    hl.setFromMatrixPosition(e.matrixWorld), t.position.copy(hl), dl.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(dl), t.updateMatrixWorld(), ta.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this._frustum.setFromProjectionMatrix(ta, t.coordinateSystem, t.reversedDepth), t.reversedDepth ? n.set(
      0.5,
      0,
      0,
      0.5,
      0,
      0.5,
      0,
      0.5,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ) : n.set(
      0.5,
      0,
      0,
      0.5,
      0,
      0.5,
      0,
      0.5,
      0,
      0,
      0.5,
      0.5,
      0,
      0,
      0,
      1
    ), n.multiply(ta);
  }
  /**
   * Returns a viewport definition for the given viewport index.
   *
   * @param {number} viewportIndex - The viewport index.
   * @return {Vector4} The viewport.
   */
  getViewport(e) {
    return this._viewports[e];
  }
  /**
   * Returns the frame extends.
   *
   * @return {Vector2} The frame extends.
   */
  getFrameExtents() {
    return this._frameExtents;
  }
  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever this instance is no longer used in your app.
   */
  dispose() {
    this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
  }
  /**
   * Copies the values of the given light shadow instance to this instance.
   *
   * @param {LightShadow} source - The light shadow to copy.
   * @return {LightShadow} A reference to this light shadow instance.
   */
  copy(e) {
    return this.camera = e.camera.clone(), this.intensity = e.intensity, this.bias = e.bias, this.radius = e.radius, this.autoUpdate = e.autoUpdate, this.needsUpdate = e.needsUpdate, this.normalBias = e.normalBias, this.blurSamples = e.blurSamples, this.mapSize.copy(e.mapSize), this;
  }
  /**
   * Returns a new light shadow instance with copied values from this instance.
   *
   * @return {LightShadow} A clone of this instance.
   */
  clone() {
    return new this.constructor().copy(this);
  }
  /**
   * Serializes the light shadow into JSON.
   *
   * @return {Object} A JSON object representing the serialized light shadow.
   * @see {@link ObjectLoader#parse}
   */
  toJSON() {
    const e = {};
    return this.intensity !== 1 && (e.intensity = this.intensity), this.bias !== 0 && (e.bias = this.bias), this.normalBias !== 0 && (e.normalBias = this.normalBias), this.radius !== 1 && (e.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (e.mapSize = this.mapSize.toArray()), e.camera = this.camera.toJSON(!1).object, delete e.camera.matrix, e;
  }
}
class Cc extends yc {
  /**
   * Constructs a new orthographic camera.
   *
   * @param {number} [left=-1] - The left plane of the camera's frustum.
   * @param {number} [right=1] - The right plane of the camera's frustum.
   * @param {number} [top=1] - The top plane of the camera's frustum.
   * @param {number} [bottom=-1] - The bottom plane of the camera's frustum.
   * @param {number} [near=0.1] - The camera's near plane.
   * @param {number} [far=2000] - The camera's far plane.
   */
  constructor(e = -1, t = 1, n = 1, r = -1, s = 0.1, a = 2e3) {
    super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = e, this.right = t, this.top = n, this.bottom = r, this.near = s, this.far = a, this.updateProjectionMatrix();
  }
  copy(e, t) {
    return super.copy(e, t), this.left = e.left, this.right = e.right, this.top = e.top, this.bottom = e.bottom, this.near = e.near, this.far = e.far, this.zoom = e.zoom, this.view = e.view === null ? null : Object.assign({}, e.view), this;
  }
  /**
   * Sets an offset in a larger frustum. This is useful for multi-window or
   * multi-monitor/multi-machine setups.
   *
   * @param {number} fullWidth - The full width of multiview setup.
   * @param {number} fullHeight - The full height of multiview setup.
   * @param {number} x - The horizontal offset of the subcamera.
   * @param {number} y - The vertical offset of the subcamera.
   * @param {number} width - The width of subcamera.
   * @param {number} height - The height of subcamera.
   * @see {@link PerspectiveCamera#setViewOffset}
   */
  setViewOffset(e, t, n, r, s, a) {
    this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = r, this.view.width = s, this.view.height = a, this.updateProjectionMatrix();
  }
  /**
   * Removes the view offset from the projection matrix.
   */
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  /**
   * Updates the camera's projection matrix. Must be called after any change of
   * camera properties.
   */
  updateProjectionMatrix() {
    const e = (this.right - this.left) / (2 * this.zoom), t = (this.top - this.bottom) / (2 * this.zoom), n = (this.right + this.left) / 2, r = (this.top + this.bottom) / 2;
    let s = n - e, a = n + e, o = r + t, l = r - t;
    if (this.view !== null && this.view.enabled) {
      const c = (this.right - this.left) / this.view.fullWidth / this.zoom, h = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      s += c * this.view.offsetX, a = s + c * this.view.width, o -= h * this.view.offsetY, l = o - h * this.view.height;
    }
    this.projectionMatrix.makeOrthographic(s, a, o, l, this.near, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.zoom = this.zoom, t.object.left = this.left, t.object.right = this.right, t.object.top = this.top, t.object.bottom = this.bottom, t.object.near = this.near, t.object.far = this.far, this.view !== null && (t.object.view = Object.assign({}, this.view)), t;
  }
}
class nu extends tu {
  /**
   * Constructs a new directional light shadow.
   */
  constructor() {
    super(new Cc(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
  }
}
class iu extends Rc {
  /**
   * Constructs a new directional light.
   *
   * @param {(number|Color|string)} [color=0xffffff] - The light's color.
   * @param {number} [intensity=1] - The light's strength/intensity.
   */
  constructor(e, t) {
    super(e, t), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(wt.DEFAULT_UP), this.updateMatrix(), this.target = new wt(), this.shadow = new nu();
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e) {
    return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
  }
}
class ru extends hn {
  /**
   * Constructs a new array camera.
   *
   * @param {Array<PerspectiveCamera>} [array=[]] - An array of perspective sub cameras.
   */
  constructor(e = []) {
    super(), this.isArrayCamera = !0, this.isMultiViewCamera = !1, this.cameras = e;
  }
}
const ul = /* @__PURE__ */ new lt();
class su {
  /**
   * Constructs a new raycaster.
   *
   * @param {Vector3} origin - The origin vector where the ray casts from.
   * @param {Vector3} direction - The (normalized) direction vector that gives direction to the ray.
   * @param {number} [near=0] - All results returned are further away than near. Near can't be negative.
   * @param {number} [far=Infinity] - All results returned are closer than far. Far can't be lower than near.
   */
  constructor(e, t, n = 0, r = 1 / 0) {
    this.ray = new Es(e, t), this.near = n, this.far = r, this.camera = null, this.layers = new po(), this.params = {
      Mesh: {},
      Line: { threshold: 1 },
      LOD: {},
      Points: { threshold: 1 },
      Sprite: {}
    };
  }
  /**
   * Updates the ray with a new origin and direction by copying the values from the arguments.
   *
   * @param {Vector3} origin - The origin vector where the ray casts from.
   * @param {Vector3} direction - The (normalized) direction vector that gives direction to the ray.
   */
  set(e, t) {
    this.ray.set(e, t);
  }
  /**
   * Uses the given coordinates and camera to compute a new origin and direction for the internal ray.
   *
   * @param {Vector2} coords - 2D coordinates of the mouse, in normalized device coordinates (NDC).
   * X and Y components should be between `-1` and `1`.
   * @param {Camera} camera - The camera from which the ray should originate.
   */
  setFromCamera(e, t) {
    t.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(e.x, e.y, 0.5).unproject(t).sub(this.ray.origin).normalize(), this.camera = t) : t.isOrthographicCamera ? (this.ray.origin.set(e.x, e.y, (t.near + t.far) / (t.near - t.far)).unproject(t), this.ray.direction.set(0, 0, -1).transformDirection(t.matrixWorld), this.camera = t) : console.error("THREE.Raycaster: Unsupported camera type: " + t.type);
  }
  /**
   * Uses the given WebXR controller to compute a new origin and direction for the internal ray.
   *
   * @param {WebXRController} controller - The controller to copy the position and direction from.
   * @return {Raycaster} A reference to this raycaster.
   */
  setFromXRController(e) {
    return ul.identity().extractRotation(e.matrixWorld), this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(ul), this;
  }
  /**
   * The intersection point of a raycaster intersection test.
   * @typedef {Object} Raycaster~Intersection
   * @property {number} distance - The distance from the ray's origin to the intersection point.
   * @property {number} distanceToRay -  Some 3D objects e.g. {@link Points} provide the distance of the
   * intersection to the nearest point on the ray. For other objects it will be `undefined`.
   * @property {Vector3} point - The intersection point, in world coordinates.
   * @property {Object} face - The face that has been intersected.
   * @property {number} faceIndex - The face index.
   * @property {Object3D} object - The 3D object that has been intersected.
   * @property {Vector2} uv - U,V coordinates at point of intersection.
   * @property {Vector2} uv1 - Second set of U,V coordinates at point of intersection.
   * @property {Vector3} uv1 - Interpolated normal vector at point of intersection.
   * @property {number} instanceId - The index number of the instance where the ray
   * intersects the {@link InstancedMesh}.
   */
  /**
   * Checks all intersection between the ray and the object with or without the
   * descendants. Intersections are returned sorted by distance, closest first.
   *
   * `Raycaster` delegates to the `raycast()` method of the passed 3D object, when
   * evaluating whether the ray intersects the object or not. This allows meshes to respond
   * differently to ray casting than lines or points.
   *
   * Note that for meshes, faces must be pointed towards the origin of the ray in order
   * to be detected; intersections of the ray passing through the back of a face will not
   * be detected. To raycast against both faces of an object, you'll want to set  {@link Material#side}
   * to `THREE.DoubleSide`.
   *
   * @param {Object3D} object - The 3D object to check for intersection with the ray.
   * @param {boolean} [recursive=true] - If set to `true`, it also checks all descendants.
   * Otherwise it only checks intersection with the object.
   * @param {Array<Raycaster~Intersection>} [intersects=[]] The target array that holds the result of the method.
   * @return {Array<Raycaster~Intersection>} An array holding the intersection points.
   */
  intersectObject(e, t = !0, n = []) {
    return eo(e, this, n, t), n.sort(fl), n;
  }
  /**
   * Checks all intersection between the ray and the objects with or without
   * the descendants. Intersections are returned sorted by distance, closest first.
   *
   * @param {Array<Object3D>} objects - The 3D objects to check for intersection with the ray.
   * @param {boolean} [recursive=true] - If set to `true`, it also checks all descendants.
   * Otherwise it only checks intersection with the object.
   * @param {Array<Raycaster~Intersection>} [intersects=[]] The target array that holds the result of the method.
   * @return {Array<Raycaster~Intersection>} An array holding the intersection points.
   */
  intersectObjects(e, t = !0, n = []) {
    for (let r = 0, s = e.length; r < s; r++)
      eo(e[r], this, n, t);
    return n.sort(fl), n;
  }
}
function fl(i, e) {
  return i.distance - e.distance;
}
function eo(i, e, t, n) {
  let r = !0;
  if (i.layers.test(e.layers) && i.raycast(e, t) === !1 && (r = !1), r === !0 && n === !0) {
    const s = i.children;
    for (let a = 0, o = s.length; a < o; a++)
      eo(s[a], e, t, !0);
  }
}
class pl {
  /**
   * Constructs a new spherical.
   *
   * @param {number} [radius=1] - The radius, or the Euclidean distance (straight-line distance) from the point to the origin.
   * @param {number} [phi=0] - The polar angle in radians from the y (up) axis.
   * @param {number} [theta=0] - The equator/azimuthal angle in radians around the y (up) axis.
   */
  constructor(e = 1, t = 0, n = 0) {
    this.radius = e, this.phi = t, this.theta = n;
  }
  /**
   * Sets the spherical components by copying the given values.
   *
   * @param {number} radius - The radius.
   * @param {number} phi - The polar angle.
   * @param {number} theta - The azimuthal angle.
   * @return {Spherical} A reference to this spherical.
   */
  set(e, t, n) {
    return this.radius = e, this.phi = t, this.theta = n, this;
  }
  /**
   * Copies the values of the given spherical to this instance.
   *
   * @param {Spherical} other - The spherical to copy.
   * @return {Spherical} A reference to this spherical.
   */
  copy(e) {
    return this.radius = e.radius, this.phi = e.phi, this.theta = e.theta, this;
  }
  /**
   * Restricts the polar angle [page:.phi phi] to be between `0.000001` and pi -
   * `0.000001`.
   *
   * @return {Spherical} A reference to this spherical.
   */
  makeSafe() {
    return this.phi = Ge(this.phi, 1e-6, Math.PI - 1e-6), this;
  }
  /**
   * Sets the spherical components from the given vector which is assumed to hold
   * Cartesian coordinates.
   *
   * @param {Vector3} v - The vector to set.
   * @return {Spherical} A reference to this spherical.
   */
  setFromVector3(e) {
    return this.setFromCartesianCoords(e.x, e.y, e.z);
  }
  /**
   * Sets the spherical components from the given Cartesian coordinates.
   *
   * @param {number} x - The x value.
   * @param {number} y - The y value.
   * @param {number} z - The z value.
   * @return {Spherical} A reference to this spherical.
   */
  setFromCartesianCoords(e, t, n) {
    return this.radius = Math.sqrt(e * e + t * t + n * n), this.radius === 0 ? (this.theta = 0, this.phi = 0) : (this.theta = Math.atan2(e, n), this.phi = Math.acos(Ge(t / this.radius, -1, 1))), this;
  }
  /**
   * Returns a new spherical with copied values from this instance.
   *
   * @return {Spherical} A clone of this instance.
   */
  clone() {
    return new this.constructor().copy(this);
  }
}
class au extends Ti {
  /**
   * Constructs a new controls instance.
   *
   * @param {Object3D} object - The object that is managed by the controls.
   * @param {?HTMLDOMElement} domElement - The HTML element used for event listeners.
   */
  constructor(e, t = null) {
    super(), this.object = e, this.domElement = t, this.enabled = !0, this.state = -1, this.keys = {}, this.mouseButtons = { LEFT: null, MIDDLE: null, RIGHT: null }, this.touches = { ONE: null, TWO: null };
  }
  /**
   * Connects the controls to the DOM. This method has so called "side effects" since
   * it adds the module's event listeners to the DOM.
   *
   * @param {HTMLDOMElement} element - The DOM element to connect to.
   */
  connect(e) {
    if (e === void 0) {
      console.warn("THREE.Controls: connect() now requires an element.");
      return;
    }
    this.domElement !== null && this.disconnect(), this.domElement = e;
  }
  /**
   * Disconnects the controls from the DOM.
   */
  disconnect() {
  }
  /**
   * Call this method if you no longer want use to the controls. It frees all internal
   * resources and removes all event listeners.
   */
  dispose() {
  }
  /**
   * Controls should implement this method if they have to update their internal state
   * per simulation step.
   *
   * @param {number} [delta] - The time delta in seconds.
   */
  update() {
  }
}
function ml(i, e, t, n) {
  const r = ou(n);
  switch (t) {
    // https://registry.khronos.org/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
    case cc:
      return i * e;
    case dc:
      return i * e / r.components * r.byteLength;
    case lo:
      return i * e / r.components * r.byteLength;
    case uc:
      return i * e * 2 / r.components * r.byteLength;
    case co:
      return i * e * 2 / r.components * r.byteLength;
    case hc:
      return i * e * 3 / r.components * r.byteLength;
    case xn:
      return i * e * 4 / r.components * r.byteLength;
    case ho:
      return i * e * 4 / r.components * r.byteLength;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_s3tc_srgb/
    case ls:
    case cs:
      return Math.floor((i + 3) / 4) * Math.floor((e + 3) / 4) * 8;
    case hs:
    case ds:
      return Math.floor((i + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_pvrtc/
    case Ta:
    case Ra:
      return Math.max(i, 16) * Math.max(e, 8) / 4;
    case wa:
    case Aa:
      return Math.max(i, 8) * Math.max(e, 8) / 2;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_etc/
    case Ca:
    case Pa:
      return Math.floor((i + 3) / 4) * Math.floor((e + 3) / 4) * 8;
    case Da:
      return Math.floor((i + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_astc/
    case La:
      return Math.floor((i + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case Ia:
      return Math.floor((i + 4) / 5) * Math.floor((e + 3) / 4) * 16;
    case Ua:
      return Math.floor((i + 4) / 5) * Math.floor((e + 4) / 5) * 16;
    case Na:
      return Math.floor((i + 5) / 6) * Math.floor((e + 4) / 5) * 16;
    case Fa:
      return Math.floor((i + 5) / 6) * Math.floor((e + 5) / 6) * 16;
    case Oa:
      return Math.floor((i + 7) / 8) * Math.floor((e + 4) / 5) * 16;
    case ka:
      return Math.floor((i + 7) / 8) * Math.floor((e + 5) / 6) * 16;
    case Ba:
      return Math.floor((i + 7) / 8) * Math.floor((e + 7) / 8) * 16;
    case za:
      return Math.floor((i + 9) / 10) * Math.floor((e + 4) / 5) * 16;
    case Ha:
      return Math.floor((i + 9) / 10) * Math.floor((e + 5) / 6) * 16;
    case Va:
      return Math.floor((i + 9) / 10) * Math.floor((e + 7) / 8) * 16;
    case Ga:
      return Math.floor((i + 9) / 10) * Math.floor((e + 9) / 10) * 16;
    case Wa:
      return Math.floor((i + 11) / 12) * Math.floor((e + 9) / 10) * 16;
    case $a:
      return Math.floor((i + 11) / 12) * Math.floor((e + 11) / 12) * 16;
    // https://registry.khronos.org/webgl/extensions/EXT_texture_compression_bptc/
    case Xa:
    case qa:
    case Ya:
      return Math.ceil(i / 4) * Math.ceil(e / 4) * 16;
    // https://registry.khronos.org/webgl/extensions/EXT_texture_compression_rgtc/
    case ja:
    case Ka:
      return Math.ceil(i / 4) * Math.ceil(e / 4) * 8;
    case Za:
    case Ja:
      return Math.ceil(i / 4) * Math.ceil(e / 4) * 16;
  }
  throw new Error(
    `Unable to determine texture byte length for ${t} format.`
  );
}
function ou(i) {
  switch (i) {
    case Ln:
    case sc:
      return { byteLength: 1, components: 1 };
    case Mr:
    case ac:
    case Ar:
      return { byteLength: 2, components: 1 };
    case ao:
    case oo:
      return { byteLength: 2, components: 4 };
    case bi:
    case so:
    case Vn:
      return { byteLength: 4, components: 1 };
    case oc:
    case lc:
      return { byteLength: 4, components: 3 };
  }
  throw new Error(`Unknown texture type ${i}.`);
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: {
  revision: ro
} }));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = ro);
function Pc() {
  let i = null, e = !1, t = null, n = null;
  function r(s, a) {
    t(s, a), n = i.requestAnimationFrame(r);
  }
  return {
    start: function() {
      e !== !0 && t !== null && (n = i.requestAnimationFrame(r), e = !0);
    },
    stop: function() {
      i.cancelAnimationFrame(n), e = !1;
    },
    setAnimationLoop: function(s) {
      t = s;
    },
    setContext: function(s) {
      i = s;
    }
  };
}
function lu(i) {
  const e = /* @__PURE__ */ new WeakMap();
  function t(o, l) {
    const c = o.array, h = o.usage, d = c.byteLength, u = i.createBuffer();
    i.bindBuffer(l, u), i.bufferData(l, c, h), o.onUploadCallback();
    let p;
    if (c instanceof Float32Array)
      p = i.FLOAT;
    else if (typeof Float16Array < "u" && c instanceof Float16Array)
      p = i.HALF_FLOAT;
    else if (c instanceof Uint16Array)
      o.isFloat16BufferAttribute ? p = i.HALF_FLOAT : p = i.UNSIGNED_SHORT;
    else if (c instanceof Int16Array)
      p = i.SHORT;
    else if (c instanceof Uint32Array)
      p = i.UNSIGNED_INT;
    else if (c instanceof Int32Array)
      p = i.INT;
    else if (c instanceof Int8Array)
      p = i.BYTE;
    else if (c instanceof Uint8Array)
      p = i.UNSIGNED_BYTE;
    else if (c instanceof Uint8ClampedArray)
      p = i.UNSIGNED_BYTE;
    else
      throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + c);
    return {
      buffer: u,
      type: p,
      bytesPerElement: c.BYTES_PER_ELEMENT,
      version: o.version,
      size: d
    };
  }
  function n(o, l, c) {
    const h = l.array, d = l.updateRanges;
    if (i.bindBuffer(c, o), d.length === 0)
      i.bufferSubData(c, 0, h);
    else {
      d.sort((p, g) => p.start - g.start);
      let u = 0;
      for (let p = 1; p < d.length; p++) {
        const g = d[u], _ = d[p];
        _.start <= g.start + g.count + 1 ? g.count = Math.max(
          g.count,
          _.start + _.count - g.start
        ) : (++u, d[u] = _);
      }
      d.length = u + 1;
      for (let p = 0, g = d.length; p < g; p++) {
        const _ = d[p];
        i.bufferSubData(
          c,
          _.start * h.BYTES_PER_ELEMENT,
          h,
          _.start,
          _.count
        );
      }
      l.clearUpdateRanges();
    }
    l.onUploadCallback();
  }
  function r(o) {
    return o.isInterleavedBufferAttribute && (o = o.data), e.get(o);
  }
  function s(o) {
    o.isInterleavedBufferAttribute && (o = o.data);
    const l = e.get(o);
    l && (i.deleteBuffer(l.buffer), e.delete(o));
  }
  function a(o, l) {
    if (o.isInterleavedBufferAttribute && (o = o.data), o.isGLBufferAttribute) {
      const h = e.get(o);
      (!h || h.version < o.version) && e.set(o, {
        buffer: o.buffer,
        type: o.type,
        bytesPerElement: o.elementSize,
        version: o.version
      });
      return;
    }
    const c = e.get(o);
    if (c === void 0)
      e.set(o, t(o, l));
    else if (c.version < o.version) {
      if (c.size !== o.array.byteLength)
        throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
      n(c.buffer, o, l), c.version = o.version;
    }
  }
  return {
    get: r,
    remove: s,
    update: a
  };
}
var cu = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, hu = `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`, du = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, uu = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, fu = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, pu = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, mu = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`, gu = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, _u = `#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`, vu = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`, xu = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, Mu = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, Su = `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`, yu = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`, bu = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`, Eu = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`, wu = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, Tu = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, Au = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, Ru = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, Cu = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, Pu = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, Du = `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`, Lu = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`, Iu = `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`, Uu = `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`, Nu = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, Fu = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, Ou = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, ku = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, Bu = "gl_FragColor = linearToOutputTexel( gl_FragColor );", zu = `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`, Hu = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`, Vu = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, Gu = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`, Wu = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, $u = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`, Xu = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, qu = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, Yu = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, ju = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, Ku = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`, Zu = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, Ju = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, Qu = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, ef = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`, tf = `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`, nf = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, rf = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, sf = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, af = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, of = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`, lf = `struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`, cf = `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`, hf = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`, df = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, uf = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, ff = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, pf = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, mf = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, gf = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, _f = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, vf = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`, xf = `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, Mf = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, Sf = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, yf = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, bf = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, Ef = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, wf = `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`, Tf = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, Af = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`, Rf = `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`, Cf = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, Pf = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, Df = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, Lf = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`, If = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, Uf = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, Nf = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, Ff = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, Of = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, kf = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`, Bf = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, zf = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, Hf = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, Vf = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, Gf = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, Wf = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, $f = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`, Xf = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`, qf = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`, Yf = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`, jf = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, Kf = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`, Zf = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, Jf = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`, Qf = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, ep = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, tp = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, np = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`, ip = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`, rp = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`, sp = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`, ap = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`, op = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`, lp = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const cp = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, hp = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, dp = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, up = `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, fp = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, pp = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, mp = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`, gp = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`, _p = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`, vp = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`, xp = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, Mp = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, Sp = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`, yp = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`, bp = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`, Ep = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, wp = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, Tp = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Ap = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`, Rp = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Cp = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`, Pp = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`, Dp = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, Lp = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Ip = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`, Up = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Np = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, Fp = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Op = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`, kp = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`, Bp = `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, zp = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`, Hp = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`, Vp = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`, Ve = {
  alphahash_fragment: cu,
  alphahash_pars_fragment: hu,
  alphamap_fragment: du,
  alphamap_pars_fragment: uu,
  alphatest_fragment: fu,
  alphatest_pars_fragment: pu,
  aomap_fragment: mu,
  aomap_pars_fragment: gu,
  batching_pars_vertex: _u,
  batching_vertex: vu,
  begin_vertex: xu,
  beginnormal_vertex: Mu,
  bsdfs: Su,
  iridescence_fragment: yu,
  bumpmap_pars_fragment: bu,
  clipping_planes_fragment: Eu,
  clipping_planes_pars_fragment: wu,
  clipping_planes_pars_vertex: Tu,
  clipping_planes_vertex: Au,
  color_fragment: Ru,
  color_pars_fragment: Cu,
  color_pars_vertex: Pu,
  color_vertex: Du,
  common: Lu,
  cube_uv_reflection_fragment: Iu,
  defaultnormal_vertex: Uu,
  displacementmap_pars_vertex: Nu,
  displacementmap_vertex: Fu,
  emissivemap_fragment: Ou,
  emissivemap_pars_fragment: ku,
  colorspace_fragment: Bu,
  colorspace_pars_fragment: zu,
  envmap_fragment: Hu,
  envmap_common_pars_fragment: Vu,
  envmap_pars_fragment: Gu,
  envmap_pars_vertex: Wu,
  envmap_physical_pars_fragment: tf,
  envmap_vertex: $u,
  fog_vertex: Xu,
  fog_pars_vertex: qu,
  fog_fragment: Yu,
  fog_pars_fragment: ju,
  gradientmap_pars_fragment: Ku,
  lightmap_pars_fragment: Zu,
  lights_lambert_fragment: Ju,
  lights_lambert_pars_fragment: Qu,
  lights_pars_begin: ef,
  lights_toon_fragment: nf,
  lights_toon_pars_fragment: rf,
  lights_phong_fragment: sf,
  lights_phong_pars_fragment: af,
  lights_physical_fragment: of,
  lights_physical_pars_fragment: lf,
  lights_fragment_begin: cf,
  lights_fragment_maps: hf,
  lights_fragment_end: df,
  logdepthbuf_fragment: uf,
  logdepthbuf_pars_fragment: ff,
  logdepthbuf_pars_vertex: pf,
  logdepthbuf_vertex: mf,
  map_fragment: gf,
  map_pars_fragment: _f,
  map_particle_fragment: vf,
  map_particle_pars_fragment: xf,
  metalnessmap_fragment: Mf,
  metalnessmap_pars_fragment: Sf,
  morphinstance_vertex: yf,
  morphcolor_vertex: bf,
  morphnormal_vertex: Ef,
  morphtarget_pars_vertex: wf,
  morphtarget_vertex: Tf,
  normal_fragment_begin: Af,
  normal_fragment_maps: Rf,
  normal_pars_fragment: Cf,
  normal_pars_vertex: Pf,
  normal_vertex: Df,
  normalmap_pars_fragment: Lf,
  clearcoat_normal_fragment_begin: If,
  clearcoat_normal_fragment_maps: Uf,
  clearcoat_pars_fragment: Nf,
  iridescence_pars_fragment: Ff,
  opaque_fragment: Of,
  packing: kf,
  premultiplied_alpha_fragment: Bf,
  project_vertex: zf,
  dithering_fragment: Hf,
  dithering_pars_fragment: Vf,
  roughnessmap_fragment: Gf,
  roughnessmap_pars_fragment: Wf,
  shadowmap_pars_fragment: $f,
  shadowmap_pars_vertex: Xf,
  shadowmap_vertex: qf,
  shadowmask_pars_fragment: Yf,
  skinbase_vertex: jf,
  skinning_pars_vertex: Kf,
  skinning_vertex: Zf,
  skinnormal_vertex: Jf,
  specularmap_fragment: Qf,
  specularmap_pars_fragment: ep,
  tonemapping_fragment: tp,
  tonemapping_pars_fragment: np,
  transmission_fragment: ip,
  transmission_pars_fragment: rp,
  uv_pars_fragment: sp,
  uv_pars_vertex: ap,
  uv_vertex: op,
  worldpos_vertex: lp,
  background_vert: cp,
  background_frag: hp,
  backgroundCube_vert: dp,
  backgroundCube_frag: up,
  cube_vert: fp,
  cube_frag: pp,
  depth_vert: mp,
  depth_frag: gp,
  distanceRGBA_vert: _p,
  distanceRGBA_frag: vp,
  equirect_vert: xp,
  equirect_frag: Mp,
  linedashed_vert: Sp,
  linedashed_frag: yp,
  meshbasic_vert: bp,
  meshbasic_frag: Ep,
  meshlambert_vert: wp,
  meshlambert_frag: Tp,
  meshmatcap_vert: Ap,
  meshmatcap_frag: Rp,
  meshnormal_vert: Cp,
  meshnormal_frag: Pp,
  meshphong_vert: Dp,
  meshphong_frag: Lp,
  meshphysical_vert: Ip,
  meshphysical_frag: Up,
  meshtoon_vert: Np,
  meshtoon_frag: Fp,
  points_vert: Op,
  points_frag: kp,
  shadow_vert: Bp,
  shadow_frag: zp,
  sprite_vert: Hp,
  sprite_frag: Vp
}, le = {
  common: {
    diffuse: { value: /* @__PURE__ */ new Xe(16777215) },
    opacity: { value: 1 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new ze() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new ze() },
    alphaTest: { value: 0 }
  },
  specularmap: {
    specularMap: { value: null },
    specularMapTransform: { value: /* @__PURE__ */ new ze() }
  },
  envmap: {
    envMap: { value: null },
    envMapRotation: { value: /* @__PURE__ */ new ze() },
    flipEnvMap: { value: -1 },
    reflectivity: { value: 1 },
    // basic, lambert, phong
    ior: { value: 1.5 },
    // physical
    refractionRatio: { value: 0.98 }
    // basic, lambert, phong
  },
  aomap: {
    aoMap: { value: null },
    aoMapIntensity: { value: 1 },
    aoMapTransform: { value: /* @__PURE__ */ new ze() }
  },
  lightmap: {
    lightMap: { value: null },
    lightMapIntensity: { value: 1 },
    lightMapTransform: { value: /* @__PURE__ */ new ze() }
  },
  bumpmap: {
    bumpMap: { value: null },
    bumpMapTransform: { value: /* @__PURE__ */ new ze() },
    bumpScale: { value: 1 }
  },
  normalmap: {
    normalMap: { value: null },
    normalMapTransform: { value: /* @__PURE__ */ new ze() },
    normalScale: { value: /* @__PURE__ */ new Ue(1, 1) }
  },
  displacementmap: {
    displacementMap: { value: null },
    displacementMapTransform: { value: /* @__PURE__ */ new ze() },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 }
  },
  emissivemap: {
    emissiveMap: { value: null },
    emissiveMapTransform: { value: /* @__PURE__ */ new ze() }
  },
  metalnessmap: {
    metalnessMap: { value: null },
    metalnessMapTransform: { value: /* @__PURE__ */ new ze() }
  },
  roughnessmap: {
    roughnessMap: { value: null },
    roughnessMapTransform: { value: /* @__PURE__ */ new ze() }
  },
  gradientmap: {
    gradientMap: { value: null }
  },
  fog: {
    fogDensity: { value: 25e-5 },
    fogNear: { value: 1 },
    fogFar: { value: 2e3 },
    fogColor: { value: /* @__PURE__ */ new Xe(16777215) }
  },
  lights: {
    ambientLightColor: { value: [] },
    lightProbe: { value: [] },
    directionalLights: { value: [], properties: {
      direction: {},
      color: {}
    } },
    directionalLightShadows: { value: [], properties: {
      shadowIntensity: 1,
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {}
    } },
    directionalShadowMap: { value: [] },
    directionalShadowMatrix: { value: [] },
    spotLights: { value: [], properties: {
      color: {},
      position: {},
      direction: {},
      distance: {},
      coneCos: {},
      penumbraCos: {},
      decay: {}
    } },
    spotLightShadows: { value: [], properties: {
      shadowIntensity: 1,
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {}
    } },
    spotLightMap: { value: [] },
    spotShadowMap: { value: [] },
    spotLightMatrix: { value: [] },
    pointLights: { value: [], properties: {
      color: {},
      position: {},
      decay: {},
      distance: {}
    } },
    pointLightShadows: { value: [], properties: {
      shadowIntensity: 1,
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {},
      shadowCameraNear: {},
      shadowCameraFar: {}
    } },
    pointShadowMap: { value: [] },
    pointShadowMatrix: { value: [] },
    hemisphereLights: { value: [], properties: {
      direction: {},
      skyColor: {},
      groundColor: {}
    } },
    // TODO (abelnation): RectAreaLight BRDF data needs to be moved from example to main src
    rectAreaLights: { value: [], properties: {
      color: {},
      position: {},
      width: {},
      height: {}
    } },
    ltc_1: { value: null },
    ltc_2: { value: null }
  },
  points: {
    diffuse: { value: /* @__PURE__ */ new Xe(16777215) },
    opacity: { value: 1 },
    size: { value: 1 },
    scale: { value: 1 },
    map: { value: null },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new ze() },
    alphaTest: { value: 0 },
    uvTransform: { value: /* @__PURE__ */ new ze() }
  },
  sprite: {
    diffuse: { value: /* @__PURE__ */ new Xe(16777215) },
    opacity: { value: 1 },
    center: { value: /* @__PURE__ */ new Ue(0.5, 0.5) },
    rotation: { value: 0 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new ze() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new ze() },
    alphaTest: { value: 0 }
  }
}, wn = {
  basic: {
    uniforms: /* @__PURE__ */ $t([
      le.common,
      le.specularmap,
      le.envmap,
      le.aomap,
      le.lightmap,
      le.fog
    ]),
    vertexShader: Ve.meshbasic_vert,
    fragmentShader: Ve.meshbasic_frag
  },
  lambert: {
    uniforms: /* @__PURE__ */ $t([
      le.common,
      le.specularmap,
      le.envmap,
      le.aomap,
      le.lightmap,
      le.emissivemap,
      le.bumpmap,
      le.normalmap,
      le.displacementmap,
      le.fog,
      le.lights,
      {
        emissive: { value: /* @__PURE__ */ new Xe(0) }
      }
    ]),
    vertexShader: Ve.meshlambert_vert,
    fragmentShader: Ve.meshlambert_frag
  },
  phong: {
    uniforms: /* @__PURE__ */ $t([
      le.common,
      le.specularmap,
      le.envmap,
      le.aomap,
      le.lightmap,
      le.emissivemap,
      le.bumpmap,
      le.normalmap,
      le.displacementmap,
      le.fog,
      le.lights,
      {
        emissive: { value: /* @__PURE__ */ new Xe(0) },
        specular: { value: /* @__PURE__ */ new Xe(1118481) },
        shininess: { value: 30 }
      }
    ]),
    vertexShader: Ve.meshphong_vert,
    fragmentShader: Ve.meshphong_frag
  },
  standard: {
    uniforms: /* @__PURE__ */ $t([
      le.common,
      le.envmap,
      le.aomap,
      le.lightmap,
      le.emissivemap,
      le.bumpmap,
      le.normalmap,
      le.displacementmap,
      le.roughnessmap,
      le.metalnessmap,
      le.fog,
      le.lights,
      {
        emissive: { value: /* @__PURE__ */ new Xe(0) },
        roughness: { value: 1 },
        metalness: { value: 0 },
        envMapIntensity: { value: 1 }
      }
    ]),
    vertexShader: Ve.meshphysical_vert,
    fragmentShader: Ve.meshphysical_frag
  },
  toon: {
    uniforms: /* @__PURE__ */ $t([
      le.common,
      le.aomap,
      le.lightmap,
      le.emissivemap,
      le.bumpmap,
      le.normalmap,
      le.displacementmap,
      le.gradientmap,
      le.fog,
      le.lights,
      {
        emissive: { value: /* @__PURE__ */ new Xe(0) }
      }
    ]),
    vertexShader: Ve.meshtoon_vert,
    fragmentShader: Ve.meshtoon_frag
  },
  matcap: {
    uniforms: /* @__PURE__ */ $t([
      le.common,
      le.bumpmap,
      le.normalmap,
      le.displacementmap,
      le.fog,
      {
        matcap: { value: null }
      }
    ]),
    vertexShader: Ve.meshmatcap_vert,
    fragmentShader: Ve.meshmatcap_frag
  },
  points: {
    uniforms: /* @__PURE__ */ $t([
      le.points,
      le.fog
    ]),
    vertexShader: Ve.points_vert,
    fragmentShader: Ve.points_frag
  },
  dashed: {
    uniforms: /* @__PURE__ */ $t([
      le.common,
      le.fog,
      {
        scale: { value: 1 },
        dashSize: { value: 1 },
        totalSize: { value: 2 }
      }
    ]),
    vertexShader: Ve.linedashed_vert,
    fragmentShader: Ve.linedashed_frag
  },
  depth: {
    uniforms: /* @__PURE__ */ $t([
      le.common,
      le.displacementmap
    ]),
    vertexShader: Ve.depth_vert,
    fragmentShader: Ve.depth_frag
  },
  normal: {
    uniforms: /* @__PURE__ */ $t([
      le.common,
      le.bumpmap,
      le.normalmap,
      le.displacementmap,
      {
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Ve.meshnormal_vert,
    fragmentShader: Ve.meshnormal_frag
  },
  sprite: {
    uniforms: /* @__PURE__ */ $t([
      le.sprite,
      le.fog
    ]),
    vertexShader: Ve.sprite_vert,
    fragmentShader: Ve.sprite_frag
  },
  background: {
    uniforms: {
      uvTransform: { value: /* @__PURE__ */ new ze() },
      t2D: { value: null },
      backgroundIntensity: { value: 1 }
    },
    vertexShader: Ve.background_vert,
    fragmentShader: Ve.background_frag
  },
  backgroundCube: {
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 },
      backgroundBlurriness: { value: 0 },
      backgroundIntensity: { value: 1 },
      backgroundRotation: { value: /* @__PURE__ */ new ze() }
    },
    vertexShader: Ve.backgroundCube_vert,
    fragmentShader: Ve.backgroundCube_frag
  },
  cube: {
    uniforms: {
      tCube: { value: null },
      tFlip: { value: -1 },
      opacity: { value: 1 }
    },
    vertexShader: Ve.cube_vert,
    fragmentShader: Ve.cube_frag
  },
  equirect: {
    uniforms: {
      tEquirect: { value: null }
    },
    vertexShader: Ve.equirect_vert,
    fragmentShader: Ve.equirect_frag
  },
  distanceRGBA: {
    uniforms: /* @__PURE__ */ $t([
      le.common,
      le.displacementmap,
      {
        referencePosition: { value: /* @__PURE__ */ new N() },
        nearDistance: { value: 1 },
        farDistance: { value: 1e3 }
      }
    ]),
    vertexShader: Ve.distanceRGBA_vert,
    fragmentShader: Ve.distanceRGBA_frag
  },
  shadow: {
    uniforms: /* @__PURE__ */ $t([
      le.lights,
      le.fog,
      {
        color: { value: /* @__PURE__ */ new Xe(0) },
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Ve.shadow_vert,
    fragmentShader: Ve.shadow_frag
  }
};
wn.physical = {
  uniforms: /* @__PURE__ */ $t([
    wn.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: /* @__PURE__ */ new ze() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: /* @__PURE__ */ new ze() },
      clearcoatNormalScale: { value: /* @__PURE__ */ new Ue(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new ze() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: /* @__PURE__ */ new ze() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new ze() },
      sheen: { value: 0 },
      sheenColor: { value: /* @__PURE__ */ new Xe(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: /* @__PURE__ */ new ze() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: /* @__PURE__ */ new ze() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: /* @__PURE__ */ new ze() },
      transmissionSamplerSize: { value: /* @__PURE__ */ new Ue() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: /* @__PURE__ */ new ze() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: /* @__PURE__ */ new Xe(0) },
      specularColor: { value: /* @__PURE__ */ new Xe(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: /* @__PURE__ */ new ze() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: /* @__PURE__ */ new ze() },
      anisotropyVector: { value: /* @__PURE__ */ new Ue() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: /* @__PURE__ */ new ze() }
    }
  ]),
  vertexShader: Ve.meshphysical_vert,
  fragmentShader: Ve.meshphysical_frag
};
const ts = { r: 0, b: 0, g: 0 }, ui = /* @__PURE__ */ new In(), Gp = /* @__PURE__ */ new lt();
function Wp(i, e, t, n, r, s, a) {
  const o = new Xe(0);
  let l = s === !0 ? 0 : 1, c, h, d = null, u = 0, p = null;
  function g(b) {
    let y = b.isScene === !0 ? b.background : null;
    return y && y.isTexture && (y = (b.backgroundBlurriness > 0 ? t : e).get(y)), y;
  }
  function _(b) {
    let y = !1;
    const w = g(b);
    w === null ? f(o, l) : w && w.isColor && (f(w, 1), y = !0);
    const R = i.xr.getEnvironmentBlendMode();
    R === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, a) : R === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, a), (i.autoClear || y) && (n.buffers.depth.setTest(!0), n.buffers.depth.setMask(!0), n.buffers.color.setMask(!0), i.clear(i.autoClearColor, i.autoClearDepth, i.autoClearStencil));
  }
  function m(b, y) {
    const w = g(y);
    w && (w.isCubeTexture || w.mapping === ys) ? (h === void 0 && (h = new Ot(
      new yn(1, 1, 1),
      new ri({
        name: "BackgroundCubeMaterial",
        uniforms: nr(wn.backgroundCube.uniforms),
        vertexShader: wn.backgroundCube.vertexShader,
        fragmentShader: wn.backgroundCube.fragmentShader,
        side: Jt,
        depthTest: !1,
        depthWrite: !1,
        fog: !1,
        allowOverride: !1
      })
    ), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(R, P, O) {
      this.matrixWorld.copyPosition(O.matrixWorld);
    }, Object.defineProperty(h.material, "envMap", {
      get: function() {
        return this.uniforms.envMap.value;
      }
    }), r.update(h)), ui.copy(y.backgroundRotation), ui.x *= -1, ui.y *= -1, ui.z *= -1, w.isCubeTexture && w.isRenderTargetTexture === !1 && (ui.y *= -1, ui.z *= -1), h.material.uniforms.envMap.value = w, h.material.uniforms.flipEnvMap.value = w.isCubeTexture && w.isRenderTargetTexture === !1 ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = y.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = y.backgroundIntensity, h.material.uniforms.backgroundRotation.value.setFromMatrix4(Gp.makeRotationFromEuler(ui)), h.material.toneMapped = je.getTransfer(w.colorSpace) !== et, (d !== w || u !== w.version || p !== i.toneMapping) && (h.material.needsUpdate = !0, d = w, u = w.version, p = i.toneMapping), h.layers.enableAll(), b.unshift(h, h.geometry, h.material, 0, 0, null)) : w && w.isTexture && (c === void 0 && (c = new Ot(
      new si(2, 2),
      new ri({
        name: "BackgroundMaterial",
        uniforms: nr(wn.background.uniforms),
        vertexShader: wn.background.vertexShader,
        fragmentShader: wn.background.fragmentShader,
        side: ii,
        depthTest: !1,
        depthWrite: !1,
        fog: !1,
        allowOverride: !1
      })
    ), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", {
      get: function() {
        return this.uniforms.t2D.value;
      }
    }), r.update(c)), c.material.uniforms.t2D.value = w, c.material.uniforms.backgroundIntensity.value = y.backgroundIntensity, c.material.toneMapped = je.getTransfer(w.colorSpace) !== et, w.matrixAutoUpdate === !0 && w.updateMatrix(), c.material.uniforms.uvTransform.value.copy(w.matrix), (d !== w || u !== w.version || p !== i.toneMapping) && (c.material.needsUpdate = !0, d = w, u = w.version, p = i.toneMapping), c.layers.enableAll(), b.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function f(b, y) {
    b.getRGB(ts, Sc(i)), n.buffers.color.setClear(ts.r, ts.g, ts.b, y, a);
  }
  function T() {
    h !== void 0 && (h.geometry.dispose(), h.material.dispose(), h = void 0), c !== void 0 && (c.geometry.dispose(), c.material.dispose(), c = void 0);
  }
  return {
    getClearColor: function() {
      return o;
    },
    setClearColor: function(b, y = 1) {
      o.set(b), l = y, f(o, l);
    },
    getClearAlpha: function() {
      return l;
    },
    setClearAlpha: function(b) {
      l = b, f(o, l);
    },
    render: _,
    addToRenderList: m,
    dispose: T
  };
}
function $p(i, e) {
  const t = i.getParameter(i.MAX_VERTEX_ATTRIBS), n = {}, r = u(null);
  let s = r, a = !1;
  function o(M, L, H, $, Z) {
    let A = !1;
    const U = d($, H, L);
    s !== U && (s = U, c(s.object)), A = p(M, $, H, Z), A && g(M, $, H, Z), Z !== null && e.update(Z, i.ELEMENT_ARRAY_BUFFER), (A || a) && (a = !1, y(M, L, H, $), Z !== null && i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, e.get(Z).buffer));
  }
  function l() {
    return i.createVertexArray();
  }
  function c(M) {
    return i.bindVertexArray(M);
  }
  function h(M) {
    return i.deleteVertexArray(M);
  }
  function d(M, L, H) {
    const $ = H.wireframe === !0;
    let Z = n[M.id];
    Z === void 0 && (Z = {}, n[M.id] = Z);
    let A = Z[L.id];
    A === void 0 && (A = {}, Z[L.id] = A);
    let U = A[$];
    return U === void 0 && (U = u(l()), A[$] = U), U;
  }
  function u(M) {
    const L = [], H = [], $ = [];
    for (let Z = 0; Z < t; Z++)
      L[Z] = 0, H[Z] = 0, $[Z] = 0;
    return {
      // for backward compatibility on non-VAO support browser
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: L,
      enabledAttributes: H,
      attributeDivisors: $,
      object: M,
      attributes: {},
      index: null
    };
  }
  function p(M, L, H, $) {
    const Z = s.attributes, A = L.attributes;
    let U = 0;
    const V = H.getAttributes();
    for (const D in V)
      if (V[D].location >= 0) {
        const X = Z[D];
        let ne = A[D];
        if (ne === void 0 && (D === "instanceMatrix" && M.instanceMatrix && (ne = M.instanceMatrix), D === "instanceColor" && M.instanceColor && (ne = M.instanceColor)), X === void 0 || X.attribute !== ne || ne && X.data !== ne.data) return !0;
        U++;
      }
    return s.attributesNum !== U || s.index !== $;
  }
  function g(M, L, H, $) {
    const Z = {}, A = L.attributes;
    let U = 0;
    const V = H.getAttributes();
    for (const D in V)
      if (V[D].location >= 0) {
        let X = A[D];
        X === void 0 && (D === "instanceMatrix" && M.instanceMatrix && (X = M.instanceMatrix), D === "instanceColor" && M.instanceColor && (X = M.instanceColor));
        const ne = {};
        ne.attribute = X, X && X.data && (ne.data = X.data), Z[D] = ne, U++;
      }
    s.attributes = Z, s.attributesNum = U, s.index = $;
  }
  function _() {
    const M = s.newAttributes;
    for (let L = 0, H = M.length; L < H; L++)
      M[L] = 0;
  }
  function m(M) {
    f(M, 0);
  }
  function f(M, L) {
    const H = s.newAttributes, $ = s.enabledAttributes, Z = s.attributeDivisors;
    H[M] = 1, $[M] === 0 && (i.enableVertexAttribArray(M), $[M] = 1), Z[M] !== L && (i.vertexAttribDivisor(M, L), Z[M] = L);
  }
  function T() {
    const M = s.newAttributes, L = s.enabledAttributes;
    for (let H = 0, $ = L.length; H < $; H++)
      L[H] !== M[H] && (i.disableVertexAttribArray(H), L[H] = 0);
  }
  function b(M, L, H, $, Z, A, U) {
    U === !0 ? i.vertexAttribIPointer(M, L, H, Z, A) : i.vertexAttribPointer(M, L, H, $, Z, A);
  }
  function y(M, L, H, $) {
    _();
    const Z = $.attributes, A = H.getAttributes(), U = L.defaultAttributeValues;
    for (const V in A) {
      const D = A[V];
      if (D.location >= 0) {
        let F = Z[V];
        if (F === void 0 && (V === "instanceMatrix" && M.instanceMatrix && (F = M.instanceMatrix), V === "instanceColor" && M.instanceColor && (F = M.instanceColor)), F !== void 0) {
          const X = F.normalized, ne = F.itemSize, Pe = e.get(F);
          if (Pe === void 0) continue;
          const Ke = Pe.buffer, st = Pe.type, qe = Pe.bytesPerElement, Y = st === i.INT || st === i.UNSIGNED_INT || F.gpuType === so;
          if (F.isInterleavedBufferAttribute) {
            const J = F.data, fe = J.stride, Ae = F.offset;
            if (J.isInstancedInterleavedBuffer) {
              for (let Me = 0; Me < D.locationSize; Me++)
                f(D.location + Me, J.meshPerAttribute);
              M.isInstancedMesh !== !0 && $._maxInstanceCount === void 0 && ($._maxInstanceCount = J.meshPerAttribute * J.count);
            } else
              for (let Me = 0; Me < D.locationSize; Me++)
                m(D.location + Me);
            i.bindBuffer(i.ARRAY_BUFFER, Ke);
            for (let Me = 0; Me < D.locationSize; Me++)
              b(
                D.location + Me,
                ne / D.locationSize,
                st,
                X,
                fe * qe,
                (Ae + ne / D.locationSize * Me) * qe,
                Y
              );
          } else {
            if (F.isInstancedBufferAttribute) {
              for (let J = 0; J < D.locationSize; J++)
                f(D.location + J, F.meshPerAttribute);
              M.isInstancedMesh !== !0 && $._maxInstanceCount === void 0 && ($._maxInstanceCount = F.meshPerAttribute * F.count);
            } else
              for (let J = 0; J < D.locationSize; J++)
                m(D.location + J);
            i.bindBuffer(i.ARRAY_BUFFER, Ke);
            for (let J = 0; J < D.locationSize; J++)
              b(
                D.location + J,
                ne / D.locationSize,
                st,
                X,
                ne * qe,
                ne / D.locationSize * J * qe,
                Y
              );
          }
        } else if (U !== void 0) {
          const X = U[V];
          if (X !== void 0)
            switch (X.length) {
              case 2:
                i.vertexAttrib2fv(D.location, X);
                break;
              case 3:
                i.vertexAttrib3fv(D.location, X);
                break;
              case 4:
                i.vertexAttrib4fv(D.location, X);
                break;
              default:
                i.vertexAttrib1fv(D.location, X);
            }
        }
      }
    }
    T();
  }
  function w() {
    O();
    for (const M in n) {
      const L = n[M];
      for (const H in L) {
        const $ = L[H];
        for (const Z in $)
          h($[Z].object), delete $[Z];
        delete L[H];
      }
      delete n[M];
    }
  }
  function R(M) {
    if (n[M.id] === void 0) return;
    const L = n[M.id];
    for (const H in L) {
      const $ = L[H];
      for (const Z in $)
        h($[Z].object), delete $[Z];
      delete L[H];
    }
    delete n[M.id];
  }
  function P(M) {
    for (const L in n) {
      const H = n[L];
      if (H[M.id] === void 0) continue;
      const $ = H[M.id];
      for (const Z in $)
        h($[Z].object), delete $[Z];
      delete H[M.id];
    }
  }
  function O() {
    S(), a = !0, s !== r && (s = r, c(s.object));
  }
  function S() {
    r.geometry = null, r.program = null, r.wireframe = !1;
  }
  return {
    setup: o,
    reset: O,
    resetDefaultState: S,
    dispose: w,
    releaseStatesOfGeometry: R,
    releaseStatesOfProgram: P,
    initAttributes: _,
    enableAttribute: m,
    disableUnusedAttributes: T
  };
}
function Xp(i, e, t) {
  let n;
  function r(c) {
    n = c;
  }
  function s(c, h) {
    i.drawArrays(n, c, h), t.update(h, n, 1);
  }
  function a(c, h, d) {
    d !== 0 && (i.drawArraysInstanced(n, c, h, d), t.update(h, n, d));
  }
  function o(c, h, d) {
    if (d === 0) return;
    e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, c, 0, h, 0, d);
    let p = 0;
    for (let g = 0; g < d; g++)
      p += h[g];
    t.update(p, n, 1);
  }
  function l(c, h, d, u) {
    if (d === 0) return;
    const p = e.get("WEBGL_multi_draw");
    if (p === null)
      for (let g = 0; g < c.length; g++)
        a(c[g], h[g], u[g]);
    else {
      p.multiDrawArraysInstancedWEBGL(n, c, 0, h, 0, u, 0, d);
      let g = 0;
      for (let _ = 0; _ < d; _++)
        g += h[_] * u[_];
      t.update(g, n, 1);
    }
  }
  this.setMode = r, this.render = s, this.renderInstances = a, this.renderMultiDraw = o, this.renderMultiDrawInstances = l;
}
function qp(i, e, t, n) {
  let r;
  function s() {
    if (r !== void 0) return r;
    if (e.has("EXT_texture_filter_anisotropic") === !0) {
      const P = e.get("EXT_texture_filter_anisotropic");
      r = i.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else
      r = 0;
    return r;
  }
  function a(P) {
    return !(P !== xn && n.convert(P) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function o(P) {
    const O = P === Ar && (e.has("EXT_color_buffer_half_float") || e.has("EXT_color_buffer_float"));
    return !(P !== Ln && n.convert(P) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
    P !== Vn && !O);
  }
  function l(P) {
    if (P === "highp") {
      if (i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.HIGH_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.HIGH_FLOAT).precision > 0)
        return "highp";
      P = "mediump";
    }
    return P === "mediump" && i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.MEDIUM_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
  }
  let c = t.precision !== void 0 ? t.precision : "highp";
  const h = l(c);
  h !== c && (console.warn("THREE.WebGLRenderer:", c, "not supported, using", h, "instead."), c = h);
  const d = t.logarithmicDepthBuffer === !0, u = t.reversedDepthBuffer === !0 && e.has("EXT_clip_control"), p = i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS), g = i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS), _ = i.getParameter(i.MAX_TEXTURE_SIZE), m = i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE), f = i.getParameter(i.MAX_VERTEX_ATTRIBS), T = i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS), b = i.getParameter(i.MAX_VARYING_VECTORS), y = i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS), w = g > 0, R = i.getParameter(i.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    // keeping this for backwards compatibility
    getMaxAnisotropy: s,
    getMaxPrecision: l,
    textureFormatReadable: a,
    textureTypeReadable: o,
    precision: c,
    logarithmicDepthBuffer: d,
    reversedDepthBuffer: u,
    maxTextures: p,
    maxVertexTextures: g,
    maxTextureSize: _,
    maxCubemapSize: m,
    maxAttributes: f,
    maxVertexUniforms: T,
    maxVaryings: b,
    maxFragmentUniforms: y,
    vertexTextures: w,
    maxSamples: R
  };
}
function Yp(i) {
  const e = this;
  let t = null, n = 0, r = !1, s = !1;
  const a = new Hn(), o = new ze(), l = { value: null, needsUpdate: !1 };
  this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(d, u) {
    const p = d.length !== 0 || u || // enable state of previous frame - the clipping code has to
    // run another frame in order to reset the state:
    n !== 0 || r;
    return r = u, n = d.length, p;
  }, this.beginShadows = function() {
    s = !0, h(null);
  }, this.endShadows = function() {
    s = !1;
  }, this.setGlobalState = function(d, u) {
    t = h(d, u, 0);
  }, this.setState = function(d, u, p) {
    const g = d.clippingPlanes, _ = d.clipIntersection, m = d.clipShadows, f = i.get(d);
    if (!r || g === null || g.length === 0 || s && !m)
      s ? h(null) : c();
    else {
      const T = s ? 0 : n, b = T * 4;
      let y = f.clippingState || null;
      l.value = y, y = h(g, u, b, p);
      for (let w = 0; w !== b; ++w)
        y[w] = t[w];
      f.clippingState = y, this.numIntersection = _ ? this.numPlanes : 0, this.numPlanes += T;
    }
  };
  function c() {
    l.value !== t && (l.value = t, l.needsUpdate = n > 0), e.numPlanes = n, e.numIntersection = 0;
  }
  function h(d, u, p, g) {
    const _ = d !== null ? d.length : 0;
    let m = null;
    if (_ !== 0) {
      if (m = l.value, g !== !0 || m === null) {
        const f = p + _ * 4, T = u.matrixWorldInverse;
        o.getNormalMatrix(T), (m === null || m.length < f) && (m = new Float32Array(f));
        for (let b = 0, y = p; b !== _; ++b, y += 4)
          a.copy(d[b]).applyMatrix4(T, o), a.normal.toArray(m, y), m[y + 3] = a.constant;
      }
      l.value = m, l.needsUpdate = !0;
    }
    return e.numPlanes = _, e.numIntersection = 0, m;
  }
}
function jp(i) {
  let e = /* @__PURE__ */ new WeakMap();
  function t(a, o) {
    return o === Sa ? a.mapping = Qi : o === ya && (a.mapping = er), a;
  }
  function n(a) {
    if (a && a.isTexture) {
      const o = a.mapping;
      if (o === Sa || o === ya)
        if (e.has(a)) {
          const l = e.get(a).texture;
          return t(l, a.mapping);
        } else {
          const l = a.image;
          if (l && l.height > 0) {
            const c = new Hd(l.height);
            return c.fromEquirectangularTexture(i, a), e.set(a, c), a.addEventListener("dispose", r), t(c.texture, a.mapping);
          } else
            return null;
        }
    }
    return a;
  }
  function r(a) {
    const o = a.target;
    o.removeEventListener("dispose", r);
    const l = e.get(o);
    l !== void 0 && (e.delete(o), l.dispose());
  }
  function s() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: n,
    dispose: s
  };
}
const $i = 4, gl = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], _i = 20, na = /* @__PURE__ */ new Cc(), _l = /* @__PURE__ */ new Xe();
let ia = null, ra = 0, sa = 0, aa = !1;
const pi = (1 + Math.sqrt(5)) / 2, Hi = 1 / pi, vl = [
  /* @__PURE__ */ new N(-pi, Hi, 0),
  /* @__PURE__ */ new N(pi, Hi, 0),
  /* @__PURE__ */ new N(-Hi, 0, pi),
  /* @__PURE__ */ new N(Hi, 0, pi),
  /* @__PURE__ */ new N(0, pi, -Hi),
  /* @__PURE__ */ new N(0, pi, Hi),
  /* @__PURE__ */ new N(-1, 1, -1),
  /* @__PURE__ */ new N(1, 1, -1),
  /* @__PURE__ */ new N(-1, 1, 1),
  /* @__PURE__ */ new N(1, 1, 1)
], Kp = /* @__PURE__ */ new N();
class xl {
  /**
   * Constructs a new PMREM generator.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   */
  constructor(e) {
    this._renderer = e, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
  }
  /**
   * Generates a PMREM from a supplied Scene, which can be faster than using an
   * image if networking bandwidth is low. Optional sigma specifies a blur radius
   * in radians to be applied to the scene before PMREM generation. Optional near
   * and far planes ensure the scene is rendered in its entirety.
   *
   * @param {Scene} scene - The scene to be captured.
   * @param {number} [sigma=0] - The blur radius in radians.
   * @param {number} [near=0.1] - The near plane distance.
   * @param {number} [far=100] - The far plane distance.
   * @param {Object} [options={}] - The configuration options.
   * @param {number} [options.size=256] - The texture size of the PMREM.
   * @param {Vector3} [options.renderTarget=origin] - The position of the internal cube camera that renders the scene.
   * @return {WebGLRenderTarget} The resulting PMREM.
   */
  fromScene(e, t = 0, n = 0.1, r = 100, s = {}) {
    const {
      size: a = 256,
      position: o = Kp
    } = s;
    ia = this._renderer.getRenderTarget(), ra = this._renderer.getActiveCubeFace(), sa = this._renderer.getActiveMipmapLevel(), aa = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(a);
    const l = this._allocateTargets();
    return l.depthBuffer = !0, this._sceneToCubeUV(e, n, r, l, o), t > 0 && this._blur(l, 0, 0, t), this._applyPMREM(l), this._cleanup(l), l;
  }
  /**
   * Generates a PMREM from an equirectangular texture, which can be either LDR
   * or HDR. The ideal input image size is 1k (1024 x 512),
   * as this matches best with the 256 x 256 cubemap output.
   *
   * @param {Texture} equirectangular - The equirectangular texture to be converted.
   * @param {?WebGLRenderTarget} [renderTarget=null] - The render target to use.
   * @return {WebGLRenderTarget} The resulting PMREM.
   */
  fromEquirectangular(e, t = null) {
    return this._fromTexture(e, t);
  }
  /**
   * Generates a PMREM from an cubemap texture, which can be either LDR
   * or HDR. The ideal input cube size is 256 x 256,
   * as this matches best with the 256 x 256 cubemap output.
   *
   * @param {Texture} cubemap - The cubemap texture to be converted.
   * @param {?WebGLRenderTarget} [renderTarget=null] - The render target to use.
   * @return {WebGLRenderTarget} The resulting PMREM.
   */
  fromCubemap(e, t = null) {
    return this._fromTexture(e, t);
  }
  /**
   * Pre-compiles the cubemap shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileCubemapShader() {
    this._cubemapMaterial === null && (this._cubemapMaterial = yl(), this._compileMaterial(this._cubemapMaterial));
  }
  /**
   * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = Sl(), this._compileMaterial(this._equirectMaterial));
  }
  /**
   * Disposes of the PMREMGenerator's internal memory. Note that PMREMGenerator is a static class,
   * so you should not need more than one PMREMGenerator object. If you do, calling dispose() on
   * one of them will cause any others to also become unusable.
   */
  dispose() {
    this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose();
  }
  // private interface
  _setSize(e) {
    this._lodMax = Math.floor(Math.log2(e)), this._cubeSize = Math.pow(2, this._lodMax);
  }
  _dispose() {
    this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
    for (let e = 0; e < this._lodPlanes.length; e++)
      this._lodPlanes[e].dispose();
  }
  _cleanup(e) {
    this._renderer.setRenderTarget(ia, ra, sa), this._renderer.xr.enabled = aa, e.scissorTest = !1, ns(e, 0, 0, e.width, e.height);
  }
  _fromTexture(e, t) {
    e.mapping === Qi || e.mapping === er ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), ia = this._renderer.getRenderTarget(), ra = this._renderer.getActiveCubeFace(), sa = this._renderer.getActiveMipmapLevel(), aa = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
    const n = t || this._allocateTargets();
    return this._textureToCubeUV(e, n), this._applyPMREM(n), this._cleanup(n), n;
  }
  _allocateTargets() {
    const e = 3 * Math.max(this._cubeSize, 112), t = 4 * this._cubeSize, n = {
      magFilter: An,
      minFilter: An,
      generateMipmaps: !1,
      type: Ar,
      format: xn,
      colorSpace: tr,
      depthBuffer: !1
    }, r = Ml(e, t, n);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== t) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = Ml(e, t, n);
      const { _lodMax: s } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = Zp(s)), this._blurMaterial = Jp(s, e, t);
    }
    return r;
  }
  _compileMaterial(e) {
    const t = new Ot(this._lodPlanes[0], e);
    this._renderer.compile(t, na);
  }
  _sceneToCubeUV(e, t, n, r, s) {
    const l = new hn(90, 1, t, n), c = [1, -1, 1, 1, 1, 1], h = [1, 1, 1, -1, -1, -1], d = this._renderer, u = d.autoClear, p = d.toneMapping;
    d.getClearColor(_l), d.toneMapping = ni, d.autoClear = !1, d.state.buffers.depth.getReversed() && (d.setRenderTarget(r), d.clearDepth(), d.setRenderTarget(null));
    const _ = new qn({
      name: "PMREM.Background",
      side: Jt,
      depthWrite: !1,
      depthTest: !1
    }), m = new Ot(new yn(), _);
    let f = !1;
    const T = e.background;
    T ? T.isColor && (_.color.copy(T), e.background = null, f = !0) : (_.color.copy(_l), f = !0);
    for (let b = 0; b < 6; b++) {
      const y = b % 3;
      y === 0 ? (l.up.set(0, c[b], 0), l.position.set(s.x, s.y, s.z), l.lookAt(s.x + h[b], s.y, s.z)) : y === 1 ? (l.up.set(0, 0, c[b]), l.position.set(s.x, s.y, s.z), l.lookAt(s.x, s.y + h[b], s.z)) : (l.up.set(0, c[b], 0), l.position.set(s.x, s.y, s.z), l.lookAt(s.x, s.y, s.z + h[b]));
      const w = this._cubeSize;
      ns(r, y * w, b > 2 ? w : 0, w, w), d.setRenderTarget(r), f && d.render(m, l), d.render(e, l);
    }
    m.geometry.dispose(), m.material.dispose(), d.toneMapping = p, d.autoClear = u, e.background = T;
  }
  _textureToCubeUV(e, t) {
    const n = this._renderer, r = e.mapping === Qi || e.mapping === er;
    r ? (this._cubemapMaterial === null && (this._cubemapMaterial = yl()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = Sl());
    const s = r ? this._cubemapMaterial : this._equirectMaterial, a = new Ot(this._lodPlanes[0], s), o = s.uniforms;
    o.envMap.value = e;
    const l = this._cubeSize;
    ns(t, 0, 0, 3 * l, 2 * l), n.setRenderTarget(t), n.render(a, na);
  }
  _applyPMREM(e) {
    const t = this._renderer, n = t.autoClear;
    t.autoClear = !1;
    const r = this._lodPlanes.length;
    for (let s = 1; s < r; s++) {
      const a = Math.sqrt(this._sigmas[s] * this._sigmas[s] - this._sigmas[s - 1] * this._sigmas[s - 1]), o = vl[(r - s - 1) % vl.length];
      this._blur(e, s - 1, s, a, o);
    }
    t.autoClear = n;
  }
  /**
   * This is a two-pass Gaussian blur for a cubemap. Normally this is done
   * vertically and horizontally, but this breaks down on a cube. Here we apply
   * the blur latitudinally (around the poles), and then longitudinally (towards
   * the poles) to approximate the orthogonally-separable blur. It is least
   * accurate at the poles, but still does a decent job.
   *
   * @private
   * @param {WebGLRenderTarget} cubeUVRenderTarget
   * @param {number} lodIn
   * @param {number} lodOut
   * @param {number} sigma
   * @param {Vector3} [poleAxis]
   */
  _blur(e, t, n, r, s) {
    const a = this._pingPongRenderTarget;
    this._halfBlur(
      e,
      a,
      t,
      n,
      r,
      "latitudinal",
      s
    ), this._halfBlur(
      a,
      e,
      n,
      n,
      r,
      "longitudinal",
      s
    );
  }
  _halfBlur(e, t, n, r, s, a, o) {
    const l = this._renderer, c = this._blurMaterial;
    a !== "latitudinal" && a !== "longitudinal" && console.error(
      "blur direction must be either latitudinal or longitudinal!"
    );
    const h = 3, d = new Ot(this._lodPlanes[r], c), u = c.uniforms, p = this._sizeLods[n] - 1, g = isFinite(s) ? Math.PI / (2 * p) : 2 * Math.PI / (2 * _i - 1), _ = s / g, m = isFinite(s) ? 1 + Math.floor(h * _) : _i;
    m > _i && console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${_i}`);
    const f = [];
    let T = 0;
    for (let P = 0; P < _i; ++P) {
      const O = P / _, S = Math.exp(-O * O / 2);
      f.push(S), P === 0 ? T += S : P < m && (T += 2 * S);
    }
    for (let P = 0; P < f.length; P++)
      f[P] = f[P] / T;
    u.envMap.value = e.texture, u.samples.value = m, u.weights.value = f, u.latitudinal.value = a === "latitudinal", o && (u.poleAxis.value = o);
    const { _lodMax: b } = this;
    u.dTheta.value = g, u.mipInt.value = b - n;
    const y = this._sizeLods[r], w = 3 * y * (r > b - $i ? r - b + $i : 0), R = 4 * (this._cubeSize - y);
    ns(t, w, R, 3 * y, 2 * y), l.setRenderTarget(t), l.render(d, na);
  }
}
function Zp(i) {
  const e = [], t = [], n = [];
  let r = i;
  const s = i - $i + 1 + gl.length;
  for (let a = 0; a < s; a++) {
    const o = Math.pow(2, r);
    t.push(o);
    let l = 1 / o;
    a > i - $i ? l = gl[a - i + $i - 1] : a === 0 && (l = 0), n.push(l);
    const c = 1 / (o - 2), h = -c, d = 1 + c, u = [h, h, d, h, d, d, h, h, d, d, h, d], p = 6, g = 6, _ = 3, m = 2, f = 1, T = new Float32Array(_ * g * p), b = new Float32Array(m * g * p), y = new Float32Array(f * g * p);
    for (let R = 0; R < p; R++) {
      const P = R % 3 * 2 / 3 - 1, O = R > 2 ? 0 : -1, S = [
        P,
        O,
        0,
        P + 2 / 3,
        O,
        0,
        P + 2 / 3,
        O + 1,
        0,
        P,
        O,
        0,
        P + 2 / 3,
        O + 1,
        0,
        P,
        O + 1,
        0
      ];
      T.set(S, _ * g * R), b.set(u, m * g * R);
      const M = [R, R, R, R, R, R];
      y.set(M, f * g * R);
    }
    const w = new un();
    w.setAttribute("position", new Sn(T, _)), w.setAttribute("uv", new Sn(b, m)), w.setAttribute("faceIndex", new Sn(y, f)), e.push(w), r > $i && r--;
  }
  return { lodPlanes: e, sizeLods: t, sigmas: n };
}
function Ml(i, e, t) {
  const n = new wi(i, e, t);
  return n.texture.mapping = ys, n.texture.name = "PMREM.cubeUv", n.scissorTest = !0, n;
}
function ns(i, e, t, n, r) {
  i.viewport.set(e, t, n, r), i.scissor.set(e, t, n, r);
}
function Jp(i, e, t) {
  const n = new Float32Array(_i), r = new N(0, 1, 0);
  return new ri({
    name: "SphericalGaussianBlur",
    defines: {
      n: _i,
      CUBEUV_TEXEL_WIDTH: 1 / e,
      CUBEUV_TEXEL_HEIGHT: 1 / t,
      CUBEUV_MAX_MIP: `${i}.0`
    },
    uniforms: {
      envMap: { value: null },
      samples: { value: 1 },
      weights: { value: n },
      latitudinal: { value: !1 },
      dTheta: { value: 0 },
      mipInt: { value: 0 },
      poleAxis: { value: r }
    },
    vertexShader: go(),
    fragmentShader: (
      /* glsl */
      `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`
    ),
    blending: ti,
    depthTest: !1,
    depthWrite: !1
  });
}
function Sl() {
  return new ri({
    name: "EquirectangularToCubeUV",
    uniforms: {
      envMap: { value: null }
    },
    vertexShader: go(),
    fragmentShader: (
      /* glsl */
      `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`
    ),
    blending: ti,
    depthTest: !1,
    depthWrite: !1
  });
}
function yl() {
  return new ri({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: go(),
    fragmentShader: (
      /* glsl */
      `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`
    ),
    blending: ti,
    depthTest: !1,
    depthWrite: !1
  });
}
function go() {
  return (
    /* glsl */
    `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`
  );
}
function Qp(i) {
  let e = /* @__PURE__ */ new WeakMap(), t = null;
  function n(o) {
    if (o && o.isTexture) {
      const l = o.mapping, c = l === Sa || l === ya, h = l === Qi || l === er;
      if (c || h) {
        let d = e.get(o);
        const u = d !== void 0 ? d.texture.pmremVersion : 0;
        if (o.isRenderTargetTexture && o.pmremVersion !== u)
          return t === null && (t = new xl(i)), d = c ? t.fromEquirectangular(o, d) : t.fromCubemap(o, d), d.texture.pmremVersion = o.pmremVersion, e.set(o, d), d.texture;
        if (d !== void 0)
          return d.texture;
        {
          const p = o.image;
          return c && p && p.height > 0 || h && p && r(p) ? (t === null && (t = new xl(i)), d = c ? t.fromEquirectangular(o) : t.fromCubemap(o), d.texture.pmremVersion = o.pmremVersion, e.set(o, d), o.addEventListener("dispose", s), d.texture) : null;
        }
      }
    }
    return o;
  }
  function r(o) {
    let l = 0;
    const c = 6;
    for (let h = 0; h < c; h++)
      o[h] !== void 0 && l++;
    return l === c;
  }
  function s(o) {
    const l = o.target;
    l.removeEventListener("dispose", s);
    const c = e.get(l);
    c !== void 0 && (e.delete(l), c.dispose());
  }
  function a() {
    e = /* @__PURE__ */ new WeakMap(), t !== null && (t.dispose(), t = null);
  }
  return {
    get: n,
    dispose: a
  };
}
function em(i) {
  const e = {};
  function t(n) {
    if (e[n] !== void 0)
      return e[n];
    let r;
    switch (n) {
      case "WEBGL_depth_texture":
        r = i.getExtension("WEBGL_depth_texture") || i.getExtension("MOZ_WEBGL_depth_texture") || i.getExtension("WEBKIT_WEBGL_depth_texture");
        break;
      case "EXT_texture_filter_anisotropic":
        r = i.getExtension("EXT_texture_filter_anisotropic") || i.getExtension("MOZ_EXT_texture_filter_anisotropic") || i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
        break;
      case "WEBGL_compressed_texture_s3tc":
        r = i.getExtension("WEBGL_compressed_texture_s3tc") || i.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        break;
      case "WEBGL_compressed_texture_pvrtc":
        r = i.getExtension("WEBGL_compressed_texture_pvrtc") || i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;
      default:
        r = i.getExtension(n);
    }
    return e[n] = r, r;
  }
  return {
    has: function(n) {
      return t(n) !== null;
    },
    init: function() {
      t("EXT_color_buffer_float"), t("WEBGL_clip_cull_distance"), t("OES_texture_float_linear"), t("EXT_color_buffer_half_float"), t("WEBGL_multisampled_render_to_texture"), t("WEBGL_render_shared_exponent");
    },
    get: function(n) {
      const r = t(n);
      return r === null && wr("THREE.WebGLRenderer: " + n + " extension not supported."), r;
    }
  };
}
function tm(i, e, t, n) {
  const r = {}, s = /* @__PURE__ */ new WeakMap();
  function a(d) {
    const u = d.target;
    u.index !== null && e.remove(u.index);
    for (const g in u.attributes)
      e.remove(u.attributes[g]);
    u.removeEventListener("dispose", a), delete r[u.id];
    const p = s.get(u);
    p && (e.remove(p), s.delete(u)), n.releaseStatesOfGeometry(u), u.isInstancedBufferGeometry === !0 && delete u._maxInstanceCount, t.memory.geometries--;
  }
  function o(d, u) {
    return r[u.id] === !0 || (u.addEventListener("dispose", a), r[u.id] = !0, t.memory.geometries++), u;
  }
  function l(d) {
    const u = d.attributes;
    for (const p in u)
      e.update(u[p], i.ARRAY_BUFFER);
  }
  function c(d) {
    const u = [], p = d.index, g = d.attributes.position;
    let _ = 0;
    if (p !== null) {
      const T = p.array;
      _ = p.version;
      for (let b = 0, y = T.length; b < y; b += 3) {
        const w = T[b + 0], R = T[b + 1], P = T[b + 2];
        u.push(w, R, R, P, P, w);
      }
    } else if (g !== void 0) {
      const T = g.array;
      _ = g.version;
      for (let b = 0, y = T.length / 3 - 1; b < y; b += 3) {
        const w = b + 0, R = b + 1, P = b + 2;
        u.push(w, R, R, P, P, w);
      }
    } else
      return;
    const m = new (gc(u) ? Mc : xc)(u, 1);
    m.version = _;
    const f = s.get(d);
    f && e.remove(f), s.set(d, m);
  }
  function h(d) {
    const u = s.get(d);
    if (u) {
      const p = d.index;
      p !== null && u.version < p.version && c(d);
    } else
      c(d);
    return s.get(d);
  }
  return {
    get: o,
    update: l,
    getWireframeAttribute: h
  };
}
function nm(i, e, t) {
  let n;
  function r(u) {
    n = u;
  }
  let s, a;
  function o(u) {
    s = u.type, a = u.bytesPerElement;
  }
  function l(u, p) {
    i.drawElements(n, p, s, u * a), t.update(p, n, 1);
  }
  function c(u, p, g) {
    g !== 0 && (i.drawElementsInstanced(n, p, s, u * a, g), t.update(p, n, g));
  }
  function h(u, p, g) {
    if (g === 0) return;
    e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, p, 0, s, u, 0, g);
    let m = 0;
    for (let f = 0; f < g; f++)
      m += p[f];
    t.update(m, n, 1);
  }
  function d(u, p, g, _) {
    if (g === 0) return;
    const m = e.get("WEBGL_multi_draw");
    if (m === null)
      for (let f = 0; f < u.length; f++)
        c(u[f] / a, p[f], _[f]);
    else {
      m.multiDrawElementsInstancedWEBGL(n, p, 0, s, u, 0, _, 0, g);
      let f = 0;
      for (let T = 0; T < g; T++)
        f += p[T] * _[T];
      t.update(f, n, 1);
    }
  }
  this.setMode = r, this.setIndex = o, this.render = l, this.renderInstances = c, this.renderMultiDraw = h, this.renderMultiDrawInstances = d;
}
function im(i) {
  const e = {
    geometries: 0,
    textures: 0
  }, t = {
    frame: 0,
    calls: 0,
    triangles: 0,
    points: 0,
    lines: 0
  };
  function n(s, a, o) {
    switch (t.calls++, a) {
      case i.TRIANGLES:
        t.triangles += o * (s / 3);
        break;
      case i.LINES:
        t.lines += o * (s / 2);
        break;
      case i.LINE_STRIP:
        t.lines += o * (s - 1);
        break;
      case i.LINE_LOOP:
        t.lines += o * s;
        break;
      case i.POINTS:
        t.points += o * s;
        break;
      default:
        console.error("THREE.WebGLInfo: Unknown draw mode:", a);
        break;
    }
  }
  function r() {
    t.calls = 0, t.triangles = 0, t.points = 0, t.lines = 0;
  }
  return {
    memory: e,
    render: t,
    programs: null,
    autoReset: !0,
    reset: r,
    update: n
  };
}
function rm(i, e, t) {
  const n = /* @__PURE__ */ new WeakMap(), r = new vt();
  function s(a, o, l) {
    const c = a.morphTargetInfluences, h = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, d = h !== void 0 ? h.length : 0;
    let u = n.get(o);
    if (u === void 0 || u.count !== d) {
      let M = function() {
        O.dispose(), n.delete(o), o.removeEventListener("dispose", M);
      };
      var p = M;
      u !== void 0 && u.texture.dispose();
      const g = o.morphAttributes.position !== void 0, _ = o.morphAttributes.normal !== void 0, m = o.morphAttributes.color !== void 0, f = o.morphAttributes.position || [], T = o.morphAttributes.normal || [], b = o.morphAttributes.color || [];
      let y = 0;
      g === !0 && (y = 1), _ === !0 && (y = 2), m === !0 && (y = 3);
      let w = o.attributes.position.count * y, R = 1;
      w > e.maxTextureSize && (R = Math.ceil(w / e.maxTextureSize), w = e.maxTextureSize);
      const P = new Float32Array(w * R * 4 * d), O = new _c(P, w, R, d);
      O.type = Vn, O.needsUpdate = !0;
      const S = y * 4;
      for (let L = 0; L < d; L++) {
        const H = f[L], $ = T[L], Z = b[L], A = w * R * 4 * L;
        for (let U = 0; U < H.count; U++) {
          const V = U * S;
          g === !0 && (r.fromBufferAttribute(H, U), P[A + V + 0] = r.x, P[A + V + 1] = r.y, P[A + V + 2] = r.z, P[A + V + 3] = 0), _ === !0 && (r.fromBufferAttribute($, U), P[A + V + 4] = r.x, P[A + V + 5] = r.y, P[A + V + 6] = r.z, P[A + V + 7] = 0), m === !0 && (r.fromBufferAttribute(Z, U), P[A + V + 8] = r.x, P[A + V + 9] = r.y, P[A + V + 10] = r.z, P[A + V + 11] = Z.itemSize === 4 ? r.w : 1);
        }
      }
      u = {
        count: d,
        texture: O,
        size: new Ue(w, R)
      }, n.set(o, u), o.addEventListener("dispose", M);
    }
    if (a.isInstancedMesh === !0 && a.morphTexture !== null)
      l.getUniforms().setValue(i, "morphTexture", a.morphTexture, t);
    else {
      let g = 0;
      for (let m = 0; m < c.length; m++)
        g += c[m];
      const _ = o.morphTargetsRelative ? 1 : 1 - g;
      l.getUniforms().setValue(i, "morphTargetBaseInfluence", _), l.getUniforms().setValue(i, "morphTargetInfluences", c);
    }
    l.getUniforms().setValue(i, "morphTargetsTexture", u.texture, t), l.getUniforms().setValue(i, "morphTargetsTextureSize", u.size);
  }
  return {
    update: s
  };
}
function sm(i, e, t, n) {
  let r = /* @__PURE__ */ new WeakMap();
  function s(l) {
    const c = n.render.frame, h = l.geometry, d = e.get(l, h);
    if (r.get(d) !== c && (e.update(d), r.set(d, c)), l.isInstancedMesh && (l.hasEventListener("dispose", o) === !1 && l.addEventListener("dispose", o), r.get(l) !== c && (t.update(l.instanceMatrix, i.ARRAY_BUFFER), l.instanceColor !== null && t.update(l.instanceColor, i.ARRAY_BUFFER), r.set(l, c))), l.isSkinnedMesh) {
      const u = l.skeleton;
      r.get(u) !== c && (u.update(), r.set(u, c));
    }
    return d;
  }
  function a() {
    r = /* @__PURE__ */ new WeakMap();
  }
  function o(l) {
    const c = l.target;
    c.removeEventListener("dispose", o), t.remove(c.instanceMatrix), c.instanceColor !== null && t.remove(c.instanceColor);
  }
  return {
    update: s,
    dispose: a
  };
}
const Dc = /* @__PURE__ */ new Yt(), bl = /* @__PURE__ */ new wc(1, 1), Lc = /* @__PURE__ */ new _c(), Ic = /* @__PURE__ */ new Ed(), Uc = /* @__PURE__ */ new bc(), El = [], wl = [], Tl = new Float32Array(16), Al = new Float32Array(9), Rl = new Float32Array(4);
function ar(i, e, t) {
  const n = i[0];
  if (n <= 0 || n > 0) return i;
  const r = e * t;
  let s = El[r];
  if (s === void 0 && (s = new Float32Array(r), El[r] = s), e !== 0) {
    n.toArray(s, 0);
    for (let a = 1, o = 0; a !== e; ++a)
      o += t, i[a].toArray(s, o);
  }
  return s;
}
function At(i, e) {
  if (i.length !== e.length) return !1;
  for (let t = 0, n = i.length; t < n; t++)
    if (i[t] !== e[t]) return !1;
  return !0;
}
function Rt(i, e) {
  for (let t = 0, n = e.length; t < n; t++)
    i[t] = e[t];
}
function ws(i, e) {
  let t = wl[e];
  t === void 0 && (t = new Int32Array(e), wl[e] = t);
  for (let n = 0; n !== e; ++n)
    t[n] = i.allocateTextureUnit();
  return t;
}
function am(i, e) {
  const t = this.cache;
  t[0] !== e && (i.uniform1f(this.addr, e), t[0] = e);
}
function om(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (i.uniform2f(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (At(t, e)) return;
    i.uniform2fv(this.addr, e), Rt(t, e);
  }
}
function lm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (i.uniform3f(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else if (e.r !== void 0)
    (t[0] !== e.r || t[1] !== e.g || t[2] !== e.b) && (i.uniform3f(this.addr, e.r, e.g, e.b), t[0] = e.r, t[1] = e.g, t[2] = e.b);
  else {
    if (At(t, e)) return;
    i.uniform3fv(this.addr, e), Rt(t, e);
  }
}
function cm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (i.uniform4f(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (At(t, e)) return;
    i.uniform4fv(this.addr, e), Rt(t, e);
  }
}
function hm(i, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (At(t, e)) return;
    i.uniformMatrix2fv(this.addr, !1, e), Rt(t, e);
  } else {
    if (At(t, n)) return;
    Rl.set(n), i.uniformMatrix2fv(this.addr, !1, Rl), Rt(t, n);
  }
}
function dm(i, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (At(t, e)) return;
    i.uniformMatrix3fv(this.addr, !1, e), Rt(t, e);
  } else {
    if (At(t, n)) return;
    Al.set(n), i.uniformMatrix3fv(this.addr, !1, Al), Rt(t, n);
  }
}
function um(i, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (At(t, e)) return;
    i.uniformMatrix4fv(this.addr, !1, e), Rt(t, e);
  } else {
    if (At(t, n)) return;
    Tl.set(n), i.uniformMatrix4fv(this.addr, !1, Tl), Rt(t, n);
  }
}
function fm(i, e) {
  const t = this.cache;
  t[0] !== e && (i.uniform1i(this.addr, e), t[0] = e);
}
function pm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (i.uniform2i(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (At(t, e)) return;
    i.uniform2iv(this.addr, e), Rt(t, e);
  }
}
function mm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (i.uniform3i(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (At(t, e)) return;
    i.uniform3iv(this.addr, e), Rt(t, e);
  }
}
function gm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (i.uniform4i(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (At(t, e)) return;
    i.uniform4iv(this.addr, e), Rt(t, e);
  }
}
function _m(i, e) {
  const t = this.cache;
  t[0] !== e && (i.uniform1ui(this.addr, e), t[0] = e);
}
function vm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (i.uniform2ui(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (At(t, e)) return;
    i.uniform2uiv(this.addr, e), Rt(t, e);
  }
}
function xm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (i.uniform3ui(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (At(t, e)) return;
    i.uniform3uiv(this.addr, e), Rt(t, e);
  }
}
function Mm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (i.uniform4ui(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (At(t, e)) return;
    i.uniform4uiv(this.addr, e), Rt(t, e);
  }
}
function Sm(i, e, t) {
  const n = this.cache, r = t.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r);
  let s;
  this.type === i.SAMPLER_2D_SHADOW ? (bl.compareFunction = pc, s = bl) : s = Dc, t.setTexture2D(e || s, r);
}
function ym(i, e, t) {
  const n = this.cache, r = t.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r), t.setTexture3D(e || Ic, r);
}
function bm(i, e, t) {
  const n = this.cache, r = t.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r), t.setTextureCube(e || Uc, r);
}
function Em(i, e, t) {
  const n = this.cache, r = t.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r), t.setTexture2DArray(e || Lc, r);
}
function wm(i) {
  switch (i) {
    case 5126:
      return am;
    // FLOAT
    case 35664:
      return om;
    // _VEC2
    case 35665:
      return lm;
    // _VEC3
    case 35666:
      return cm;
    // _VEC4
    case 35674:
      return hm;
    // _MAT2
    case 35675:
      return dm;
    // _MAT3
    case 35676:
      return um;
    // _MAT4
    case 5124:
    case 35670:
      return fm;
    // INT, BOOL
    case 35667:
    case 35671:
      return pm;
    // _VEC2
    case 35668:
    case 35672:
      return mm;
    // _VEC3
    case 35669:
    case 35673:
      return gm;
    // _VEC4
    case 5125:
      return _m;
    // UINT
    case 36294:
      return vm;
    // _VEC2
    case 36295:
      return xm;
    // _VEC3
    case 36296:
      return Mm;
    // _VEC4
    case 35678:
    // SAMPLER_2D
    case 36198:
    // SAMPLER_EXTERNAL_OES
    case 36298:
    // INT_SAMPLER_2D
    case 36306:
    // UNSIGNED_INT_SAMPLER_2D
    case 35682:
      return Sm;
    case 35679:
    // SAMPLER_3D
    case 36299:
    // INT_SAMPLER_3D
    case 36307:
      return ym;
    case 35680:
    // SAMPLER_CUBE
    case 36300:
    // INT_SAMPLER_CUBE
    case 36308:
    // UNSIGNED_INT_SAMPLER_CUBE
    case 36293:
      return bm;
    case 36289:
    // SAMPLER_2D_ARRAY
    case 36303:
    // INT_SAMPLER_2D_ARRAY
    case 36311:
    // UNSIGNED_INT_SAMPLER_2D_ARRAY
    case 36292:
      return Em;
  }
}
function Tm(i, e) {
  i.uniform1fv(this.addr, e);
}
function Am(i, e) {
  const t = ar(e, this.size, 2);
  i.uniform2fv(this.addr, t);
}
function Rm(i, e) {
  const t = ar(e, this.size, 3);
  i.uniform3fv(this.addr, t);
}
function Cm(i, e) {
  const t = ar(e, this.size, 4);
  i.uniform4fv(this.addr, t);
}
function Pm(i, e) {
  const t = ar(e, this.size, 4);
  i.uniformMatrix2fv(this.addr, !1, t);
}
function Dm(i, e) {
  const t = ar(e, this.size, 9);
  i.uniformMatrix3fv(this.addr, !1, t);
}
function Lm(i, e) {
  const t = ar(e, this.size, 16);
  i.uniformMatrix4fv(this.addr, !1, t);
}
function Im(i, e) {
  i.uniform1iv(this.addr, e);
}
function Um(i, e) {
  i.uniform2iv(this.addr, e);
}
function Nm(i, e) {
  i.uniform3iv(this.addr, e);
}
function Fm(i, e) {
  i.uniform4iv(this.addr, e);
}
function Om(i, e) {
  i.uniform1uiv(this.addr, e);
}
function km(i, e) {
  i.uniform2uiv(this.addr, e);
}
function Bm(i, e) {
  i.uniform3uiv(this.addr, e);
}
function zm(i, e) {
  i.uniform4uiv(this.addr, e);
}
function Hm(i, e, t) {
  const n = this.cache, r = e.length, s = ws(t, r);
  At(n, s) || (i.uniform1iv(this.addr, s), Rt(n, s));
  for (let a = 0; a !== r; ++a)
    t.setTexture2D(e[a] || Dc, s[a]);
}
function Vm(i, e, t) {
  const n = this.cache, r = e.length, s = ws(t, r);
  At(n, s) || (i.uniform1iv(this.addr, s), Rt(n, s));
  for (let a = 0; a !== r; ++a)
    t.setTexture3D(e[a] || Ic, s[a]);
}
function Gm(i, e, t) {
  const n = this.cache, r = e.length, s = ws(t, r);
  At(n, s) || (i.uniform1iv(this.addr, s), Rt(n, s));
  for (let a = 0; a !== r; ++a)
    t.setTextureCube(e[a] || Uc, s[a]);
}
function Wm(i, e, t) {
  const n = this.cache, r = e.length, s = ws(t, r);
  At(n, s) || (i.uniform1iv(this.addr, s), Rt(n, s));
  for (let a = 0; a !== r; ++a)
    t.setTexture2DArray(e[a] || Lc, s[a]);
}
function $m(i) {
  switch (i) {
    case 5126:
      return Tm;
    // FLOAT
    case 35664:
      return Am;
    // _VEC2
    case 35665:
      return Rm;
    // _VEC3
    case 35666:
      return Cm;
    // _VEC4
    case 35674:
      return Pm;
    // _MAT2
    case 35675:
      return Dm;
    // _MAT3
    case 35676:
      return Lm;
    // _MAT4
    case 5124:
    case 35670:
      return Im;
    // INT, BOOL
    case 35667:
    case 35671:
      return Um;
    // _VEC2
    case 35668:
    case 35672:
      return Nm;
    // _VEC3
    case 35669:
    case 35673:
      return Fm;
    // _VEC4
    case 5125:
      return Om;
    // UINT
    case 36294:
      return km;
    // _VEC2
    case 36295:
      return Bm;
    // _VEC3
    case 36296:
      return zm;
    // _VEC4
    case 35678:
    // SAMPLER_2D
    case 36198:
    // SAMPLER_EXTERNAL_OES
    case 36298:
    // INT_SAMPLER_2D
    case 36306:
    // UNSIGNED_INT_SAMPLER_2D
    case 35682:
      return Hm;
    case 35679:
    // SAMPLER_3D
    case 36299:
    // INT_SAMPLER_3D
    case 36307:
      return Vm;
    case 35680:
    // SAMPLER_CUBE
    case 36300:
    // INT_SAMPLER_CUBE
    case 36308:
    // UNSIGNED_INT_SAMPLER_CUBE
    case 36293:
      return Gm;
    case 36289:
    // SAMPLER_2D_ARRAY
    case 36303:
    // INT_SAMPLER_2D_ARRAY
    case 36311:
    // UNSIGNED_INT_SAMPLER_2D_ARRAY
    case 36292:
      return Wm;
  }
}
class Xm {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.setValue = wm(t.type);
  }
}
class qm {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = $m(t.type);
  }
}
class Ym {
  constructor(e) {
    this.id = e, this.seq = [], this.map = {};
  }
  setValue(e, t, n) {
    const r = this.seq;
    for (let s = 0, a = r.length; s !== a; ++s) {
      const o = r[s];
      o.setValue(e, t[o.id], n);
    }
  }
}
const oa = /(\w+)(\])?(\[|\.)?/g;
function Cl(i, e) {
  i.seq.push(e), i.map[e.id] = e;
}
function jm(i, e, t) {
  const n = i.name, r = n.length;
  for (oa.lastIndex = 0; ; ) {
    const s = oa.exec(n), a = oa.lastIndex;
    let o = s[1];
    const l = s[2] === "]", c = s[3];
    if (l && (o = o | 0), c === void 0 || c === "[" && a + 2 === r) {
      Cl(t, c === void 0 ? new Xm(o, i, e) : new qm(o, i, e));
      break;
    } else {
      let d = t.map[o];
      d === void 0 && (d = new Ym(o), Cl(t, d)), t = d;
    }
  }
}
class us {
  constructor(e, t) {
    this.seq = [], this.map = {};
    const n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
    for (let r = 0; r < n; ++r) {
      const s = e.getActiveUniform(t, r), a = e.getUniformLocation(t, s.name);
      jm(s, a, this);
    }
  }
  setValue(e, t, n, r) {
    const s = this.map[t];
    s !== void 0 && s.setValue(e, n, r);
  }
  setOptional(e, t, n) {
    const r = t[n];
    r !== void 0 && this.setValue(e, n, r);
  }
  static upload(e, t, n, r) {
    for (let s = 0, a = t.length; s !== a; ++s) {
      const o = t[s], l = n[o.id];
      l.needsUpdate !== !1 && o.setValue(e, l.value, r);
    }
  }
  static seqWithValue(e, t) {
    const n = [];
    for (let r = 0, s = e.length; r !== s; ++r) {
      const a = e[r];
      a.id in t && n.push(a);
    }
    return n;
  }
}
function Pl(i, e, t) {
  const n = i.createShader(e);
  return i.shaderSource(n, t), i.compileShader(n), n;
}
const Km = 37297;
let Zm = 0;
function Jm(i, e) {
  const t = i.split(`
`), n = [], r = Math.max(e - 6, 0), s = Math.min(e + 6, t.length);
  for (let a = r; a < s; a++) {
    const o = a + 1;
    n.push(`${o === e ? ">" : " "} ${o}: ${t[a]}`);
  }
  return n.join(`
`);
}
const Dl = /* @__PURE__ */ new ze();
function Qm(i) {
  je._getMatrix(Dl, je.workingColorSpace, i);
  const e = `mat3( ${Dl.elements.map((t) => t.toFixed(4))} )`;
  switch (je.getTransfer(i)) {
    case fs:
      return [e, "LinearTransferOETF"];
    case et:
      return [e, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space: ", i), [e, "LinearTransferOETF"];
  }
}
function Ll(i, e, t) {
  const n = i.getShaderParameter(e, i.COMPILE_STATUS), s = (i.getShaderInfoLog(e) || "").trim();
  if (n && s === "") return "";
  const a = /ERROR: 0:(\d+)/.exec(s);
  if (a) {
    const o = parseInt(a[1]);
    return t.toUpperCase() + `

` + s + `

` + Jm(i.getShaderSource(e), o);
  } else
    return s;
}
function eg(i, e) {
  const t = Qm(e);
  return [
    `vec4 ${i}( vec4 value ) {`,
    `	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,
    "}"
  ].join(`
`);
}
function tg(i, e) {
  let t;
  switch (e) {
    case Oh:
      t = "Linear";
      break;
    case kh:
      t = "Reinhard";
      break;
    case Bh:
      t = "Cineon";
      break;
    case zh:
      t = "ACESFilmic";
      break;
    case Vh:
      t = "AgX";
      break;
    case Gh:
      t = "Neutral";
      break;
    case Hh:
      t = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", e), t = "Linear";
  }
  return "vec3 " + i + "( vec3 color ) { return " + t + "ToneMapping( color ); }";
}
const is = /* @__PURE__ */ new N();
function ng() {
  je.getLuminanceCoefficients(is);
  const i = is.x.toFixed(4), e = is.y.toFixed(4), t = is.z.toFixed(4);
  return [
    "float luminance( const in vec3 rgb ) {",
    `	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,
    "	return dot( weights, rgb );",
    "}"
  ].join(`
`);
}
function ig(i) {
  return [
    i.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
    i.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
  ].filter(mr).join(`
`);
}
function rg(i) {
  const e = [];
  for (const t in i) {
    const n = i[t];
    n !== !1 && e.push("#define " + t + " " + n);
  }
  return e.join(`
`);
}
function sg(i, e) {
  const t = {}, n = i.getProgramParameter(e, i.ACTIVE_ATTRIBUTES);
  for (let r = 0; r < n; r++) {
    const s = i.getActiveAttrib(e, r), a = s.name;
    let o = 1;
    s.type === i.FLOAT_MAT2 && (o = 2), s.type === i.FLOAT_MAT3 && (o = 3), s.type === i.FLOAT_MAT4 && (o = 4), t[a] = {
      type: s.type,
      location: i.getAttribLocation(e, a),
      locationSize: o
    };
  }
  return t;
}
function mr(i) {
  return i !== "";
}
function Il(i, e) {
  const t = e.numSpotLightShadows + e.numSpotLightMaps - e.numSpotLightShadowsWithMaps;
  return i.replace(/NUM_DIR_LIGHTS/g, e.numDirLights).replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, t).replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, e.numPointLights).replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows);
}
function Ul(i, e) {
  return i.replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection);
}
const ag = /^[ \t]*#include +<([\w\d./]+)>/gm;
function to(i) {
  return i.replace(ag, lg);
}
const og = /* @__PURE__ */ new Map();
function lg(i, e) {
  let t = Ve[e];
  if (t === void 0) {
    const n = og.get(e);
    if (n !== void 0)
      t = Ve[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', e, n);
    else
      throw new Error("Can not resolve #include <" + e + ">");
  }
  return to(t);
}
const cg = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function Nl(i) {
  return i.replace(cg, hg);
}
function hg(i, e, t, n) {
  let r = "";
  for (let s = parseInt(e); s < parseInt(t); s++)
    r += n.replace(/\[\s*i\s*\]/g, "[ " + s + " ]").replace(/UNROLLED_LOOP_INDEX/g, s);
  return r;
}
function Fl(i) {
  let e = `precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;
  return i.precision === "highp" ? e += `
#define HIGH_PRECISION` : i.precision === "mediump" ? e += `
#define MEDIUM_PRECISION` : i.precision === "lowp" && (e += `
#define LOW_PRECISION`), e;
}
function dg(i) {
  let e = "SHADOWMAP_TYPE_BASIC";
  return i.shadowMapType === nc ? e = "SHADOWMAP_TYPE_PCF" : i.shadowMapType === gh ? e = "SHADOWMAP_TYPE_PCF_SOFT" : i.shadowMapType === zn && (e = "SHADOWMAP_TYPE_VSM"), e;
}
function ug(i) {
  let e = "ENVMAP_TYPE_CUBE";
  if (i.envMap)
    switch (i.envMapMode) {
      case Qi:
      case er:
        e = "ENVMAP_TYPE_CUBE";
        break;
      case ys:
        e = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
  return e;
}
function fg(i) {
  let e = "ENVMAP_MODE_REFLECTION";
  return i.envMap && i.envMapMode === er && (e = "ENVMAP_MODE_REFRACTION"), e;
}
function pg(i) {
  let e = "ENVMAP_BLENDING_NONE";
  if (i.envMap)
    switch (i.combine) {
      case ic:
        e = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case Nh:
        e = "ENVMAP_BLENDING_MIX";
        break;
      case Fh:
        e = "ENVMAP_BLENDING_ADD";
        break;
    }
  return e;
}
function mg(i) {
  const e = i.envMapCubeUVHeight;
  if (e === null) return null;
  const t = Math.log2(e) - 2, n = 1 / e;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, t), 112)), texelHeight: n, maxMip: t };
}
function gg(i, e, t, n) {
  const r = i.getContext(), s = t.defines;
  let a = t.vertexShader, o = t.fragmentShader;
  const l = dg(t), c = ug(t), h = fg(t), d = pg(t), u = mg(t), p = ig(t), g = rg(s), _ = r.createProgram();
  let m, f, T = t.glslVersion ? "#version " + t.glslVersion + `
` : "";
  t.isRawShaderMaterial ? (m = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g
  ].filter(mr).join(`
`), m.length > 0 && (m += `
`), f = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g
  ].filter(mr).join(`
`), f.length > 0 && (f += `
`)) : (m = [
    Fl(t),
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g,
    t.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
    t.batching ? "#define USE_BATCHING" : "",
    t.batchingColor ? "#define USE_BATCHING_COLOR" : "",
    t.instancing ? "#define USE_INSTANCING" : "",
    t.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
    t.instancingMorph ? "#define USE_INSTANCING_MORPH" : "",
    t.useFog && t.fog ? "#define USE_FOG" : "",
    t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "",
    t.map ? "#define USE_MAP" : "",
    t.envMap ? "#define USE_ENVMAP" : "",
    t.envMap ? "#define " + h : "",
    t.lightMap ? "#define USE_LIGHTMAP" : "",
    t.aoMap ? "#define USE_AOMAP" : "",
    t.bumpMap ? "#define USE_BUMPMAP" : "",
    t.normalMap ? "#define USE_NORMALMAP" : "",
    t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    t.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
    t.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    t.anisotropy ? "#define USE_ANISOTROPY" : "",
    t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    t.specularMap ? "#define USE_SPECULARMAP" : "",
    t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    t.metalnessMap ? "#define USE_METALNESSMAP" : "",
    t.alphaMap ? "#define USE_ALPHAMAP" : "",
    t.alphaHash ? "#define USE_ALPHAHASH" : "",
    t.transmission ? "#define USE_TRANSMISSION" : "",
    t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    t.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    //
    t.mapUv ? "#define MAP_UV " + t.mapUv : "",
    t.alphaMapUv ? "#define ALPHAMAP_UV " + t.alphaMapUv : "",
    t.lightMapUv ? "#define LIGHTMAP_UV " + t.lightMapUv : "",
    t.aoMapUv ? "#define AOMAP_UV " + t.aoMapUv : "",
    t.emissiveMapUv ? "#define EMISSIVEMAP_UV " + t.emissiveMapUv : "",
    t.bumpMapUv ? "#define BUMPMAP_UV " + t.bumpMapUv : "",
    t.normalMapUv ? "#define NORMALMAP_UV " + t.normalMapUv : "",
    t.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + t.displacementMapUv : "",
    t.metalnessMapUv ? "#define METALNESSMAP_UV " + t.metalnessMapUv : "",
    t.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + t.roughnessMapUv : "",
    t.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + t.anisotropyMapUv : "",
    t.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + t.clearcoatMapUv : "",
    t.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + t.clearcoatNormalMapUv : "",
    t.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + t.clearcoatRoughnessMapUv : "",
    t.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + t.iridescenceMapUv : "",
    t.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + t.iridescenceThicknessMapUv : "",
    t.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + t.sheenColorMapUv : "",
    t.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + t.sheenRoughnessMapUv : "",
    t.specularMapUv ? "#define SPECULARMAP_UV " + t.specularMapUv : "",
    t.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + t.specularColorMapUv : "",
    t.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + t.specularIntensityMapUv : "",
    t.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + t.transmissionMapUv : "",
    t.thicknessMapUv ? "#define THICKNESSMAP_UV " + t.thicknessMapUv : "",
    //
    t.vertexTangents && t.flatShading === !1 ? "#define USE_TANGENT" : "",
    t.vertexColors ? "#define USE_COLOR" : "",
    t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    t.vertexUv1s ? "#define USE_UV1" : "",
    t.vertexUv2s ? "#define USE_UV2" : "",
    t.vertexUv3s ? "#define USE_UV3" : "",
    t.pointsUvs ? "#define USE_POINTS_UV" : "",
    t.flatShading ? "#define FLAT_SHADED" : "",
    t.skinning ? "#define USE_SKINNING" : "",
    t.morphTargets ? "#define USE_MORPHTARGETS" : "",
    t.morphNormals && t.flatShading === !1 ? "#define USE_MORPHNORMALS" : "",
    t.morphColors ? "#define USE_MORPHCOLORS" : "",
    t.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + t.morphTextureStride : "",
    t.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + t.morphTargetsCount : "",
    t.doubleSided ? "#define DOUBLE_SIDED" : "",
    t.flipSided ? "#define FLIP_SIDED" : "",
    t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    t.shadowMapEnabled ? "#define " + l : "",
    t.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
    t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    t.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
    t.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
    "uniform mat4 modelMatrix;",
    "uniform mat4 modelViewMatrix;",
    "uniform mat4 projectionMatrix;",
    "uniform mat4 viewMatrix;",
    "uniform mat3 normalMatrix;",
    "uniform vec3 cameraPosition;",
    "uniform bool isOrthographic;",
    "#ifdef USE_INSTANCING",
    "	attribute mat4 instanceMatrix;",
    "#endif",
    "#ifdef USE_INSTANCING_COLOR",
    "	attribute vec3 instanceColor;",
    "#endif",
    "#ifdef USE_INSTANCING_MORPH",
    "	uniform sampler2D morphTexture;",
    "#endif",
    "attribute vec3 position;",
    "attribute vec3 normal;",
    "attribute vec2 uv;",
    "#ifdef USE_UV1",
    "	attribute vec2 uv1;",
    "#endif",
    "#ifdef USE_UV2",
    "	attribute vec2 uv2;",
    "#endif",
    "#ifdef USE_UV3",
    "	attribute vec2 uv3;",
    "#endif",
    "#ifdef USE_TANGENT",
    "	attribute vec4 tangent;",
    "#endif",
    "#if defined( USE_COLOR_ALPHA )",
    "	attribute vec4 color;",
    "#elif defined( USE_COLOR )",
    "	attribute vec3 color;",
    "#endif",
    "#ifdef USE_SKINNING",
    "	attribute vec4 skinIndex;",
    "	attribute vec4 skinWeight;",
    "#endif",
    `
`
  ].filter(mr).join(`
`), f = [
    Fl(t),
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g,
    t.useFog && t.fog ? "#define USE_FOG" : "",
    t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "",
    t.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
    t.map ? "#define USE_MAP" : "",
    t.matcap ? "#define USE_MATCAP" : "",
    t.envMap ? "#define USE_ENVMAP" : "",
    t.envMap ? "#define " + c : "",
    t.envMap ? "#define " + h : "",
    t.envMap ? "#define " + d : "",
    u ? "#define CUBEUV_TEXEL_WIDTH " + u.texelWidth : "",
    u ? "#define CUBEUV_TEXEL_HEIGHT " + u.texelHeight : "",
    u ? "#define CUBEUV_MAX_MIP " + u.maxMip + ".0" : "",
    t.lightMap ? "#define USE_LIGHTMAP" : "",
    t.aoMap ? "#define USE_AOMAP" : "",
    t.bumpMap ? "#define USE_BUMPMAP" : "",
    t.normalMap ? "#define USE_NORMALMAP" : "",
    t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    t.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    t.anisotropy ? "#define USE_ANISOTROPY" : "",
    t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    t.clearcoat ? "#define USE_CLEARCOAT" : "",
    t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    t.dispersion ? "#define USE_DISPERSION" : "",
    t.iridescence ? "#define USE_IRIDESCENCE" : "",
    t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    t.specularMap ? "#define USE_SPECULARMAP" : "",
    t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    t.metalnessMap ? "#define USE_METALNESSMAP" : "",
    t.alphaMap ? "#define USE_ALPHAMAP" : "",
    t.alphaTest ? "#define USE_ALPHATEST" : "",
    t.alphaHash ? "#define USE_ALPHAHASH" : "",
    t.sheen ? "#define USE_SHEEN" : "",
    t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    t.transmission ? "#define USE_TRANSMISSION" : "",
    t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    t.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    t.vertexTangents && t.flatShading === !1 ? "#define USE_TANGENT" : "",
    t.vertexColors || t.instancingColor || t.batchingColor ? "#define USE_COLOR" : "",
    t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    t.vertexUv1s ? "#define USE_UV1" : "",
    t.vertexUv2s ? "#define USE_UV2" : "",
    t.vertexUv3s ? "#define USE_UV3" : "",
    t.pointsUvs ? "#define USE_POINTS_UV" : "",
    t.gradientMap ? "#define USE_GRADIENTMAP" : "",
    t.flatShading ? "#define FLAT_SHADED" : "",
    t.doubleSided ? "#define DOUBLE_SIDED" : "",
    t.flipSided ? "#define FLIP_SIDED" : "",
    t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    t.shadowMapEnabled ? "#define " + l : "",
    t.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
    t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    t.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
    t.decodeVideoTextureEmissive ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE" : "",
    t.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
    t.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
    "uniform mat4 viewMatrix;",
    "uniform vec3 cameraPosition;",
    "uniform bool isOrthographic;",
    t.toneMapping !== ni ? "#define TONE_MAPPING" : "",
    t.toneMapping !== ni ? Ve.tonemapping_pars_fragment : "",
    // this code is required here because it is used by the toneMapping() function defined below
    t.toneMapping !== ni ? tg("toneMapping", t.toneMapping) : "",
    t.dithering ? "#define DITHERING" : "",
    t.opaque ? "#define OPAQUE" : "",
    Ve.colorspace_pars_fragment,
    // this code is required here because it is used by the various encoding/decoding function defined below
    eg("linearToOutputTexel", t.outputColorSpace),
    ng(),
    t.useDepthPacking ? "#define DEPTH_PACKING " + t.depthPacking : "",
    `
`
  ].filter(mr).join(`
`)), a = to(a), a = Il(a, t), a = Ul(a, t), o = to(o), o = Il(o, t), o = Ul(o, t), a = Nl(a), o = Nl(o), t.isRawShaderMaterial !== !0 && (T = `#version 300 es
`, m = [
    p,
    "#define attribute in",
    "#define varying out",
    "#define texture2D texture"
  ].join(`
`) + `
` + m, f = [
    "#define varying in",
    t.glslVersion === Ho ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
    t.glslVersion === Ho ? "" : "#define gl_FragColor pc_fragColor",
    "#define gl_FragDepthEXT gl_FragDepth",
    "#define texture2D texture",
    "#define textureCube texture",
    "#define texture2DProj textureProj",
    "#define texture2DLodEXT textureLod",
    "#define texture2DProjLodEXT textureProjLod",
    "#define textureCubeLodEXT textureLod",
    "#define texture2DGradEXT textureGrad",
    "#define texture2DProjGradEXT textureProjGrad",
    "#define textureCubeGradEXT textureGrad"
  ].join(`
`) + `
` + f);
  const b = T + m + a, y = T + f + o, w = Pl(r, r.VERTEX_SHADER, b), R = Pl(r, r.FRAGMENT_SHADER, y);
  r.attachShader(_, w), r.attachShader(_, R), t.index0AttributeName !== void 0 ? r.bindAttribLocation(_, 0, t.index0AttributeName) : t.morphTargets === !0 && r.bindAttribLocation(_, 0, "position"), r.linkProgram(_);
  function P(L) {
    if (i.debug.checkShaderErrors) {
      const H = r.getProgramInfoLog(_) || "", $ = r.getShaderInfoLog(w) || "", Z = r.getShaderInfoLog(R) || "", A = H.trim(), U = $.trim(), V = Z.trim();
      let D = !0, F = !0;
      if (r.getProgramParameter(_, r.LINK_STATUS) === !1)
        if (D = !1, typeof i.debug.onShaderError == "function")
          i.debug.onShaderError(r, _, w, R);
        else {
          const X = Ll(r, w, "vertex"), ne = Ll(r, R, "fragment");
          console.error(
            "THREE.WebGLProgram: Shader Error " + r.getError() + " - VALIDATE_STATUS " + r.getProgramParameter(_, r.VALIDATE_STATUS) + `

Material Name: ` + L.name + `
Material Type: ` + L.type + `

Program Info Log: ` + A + `
` + X + `
` + ne
          );
        }
      else A !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", A) : (U === "" || V === "") && (F = !1);
      F && (L.diagnostics = {
        runnable: D,
        programLog: A,
        vertexShader: {
          log: U,
          prefix: m
        },
        fragmentShader: {
          log: V,
          prefix: f
        }
      });
    }
    r.deleteShader(w), r.deleteShader(R), O = new us(r, _), S = sg(r, _);
  }
  let O;
  this.getUniforms = function() {
    return O === void 0 && P(this), O;
  };
  let S;
  this.getAttributes = function() {
    return S === void 0 && P(this), S;
  };
  let M = t.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function() {
    return M === !1 && (M = r.getProgramParameter(_, Km)), M;
  }, this.destroy = function() {
    n.releaseStatesOfProgram(this), r.deleteProgram(_), this.program = void 0;
  }, this.type = t.shaderType, this.name = t.shaderName, this.id = Zm++, this.cacheKey = e, this.usedTimes = 1, this.program = _, this.vertexShader = w, this.fragmentShader = R, this;
}
let _g = 0;
class vg {
  constructor() {
    this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
  }
  update(e) {
    const t = e.vertexShader, n = e.fragmentShader, r = this._getShaderStage(t), s = this._getShaderStage(n), a = this._getShaderCacheForMaterial(e);
    return a.has(r) === !1 && (a.add(r), r.usedTimes++), a.has(s) === !1 && (a.add(s), s.usedTimes++), this;
  }
  remove(e) {
    const t = this.materialCache.get(e);
    for (const n of t)
      n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code);
    return this.materialCache.delete(e), this;
  }
  getVertexShaderID(e) {
    return this._getShaderStage(e.vertexShader).id;
  }
  getFragmentShaderID(e) {
    return this._getShaderStage(e.fragmentShader).id;
  }
  dispose() {
    this.shaderCache.clear(), this.materialCache.clear();
  }
  _getShaderCacheForMaterial(e) {
    const t = this.materialCache;
    let n = t.get(e);
    return n === void 0 && (n = /* @__PURE__ */ new Set(), t.set(e, n)), n;
  }
  _getShaderStage(e) {
    const t = this.shaderCache;
    let n = t.get(e);
    return n === void 0 && (n = new xg(e), t.set(e, n)), n;
  }
}
class xg {
  constructor(e) {
    this.id = _g++, this.code = e, this.usedTimes = 0;
  }
}
function Mg(i, e, t, n, r, s, a) {
  const o = new po(), l = new vg(), c = /* @__PURE__ */ new Set(), h = [], d = r.logarithmicDepthBuffer, u = r.vertexTextures;
  let p = r.precision;
  const g = {
    MeshDepthMaterial: "depth",
    MeshDistanceMaterial: "distanceRGBA",
    MeshNormalMaterial: "normal",
    MeshBasicMaterial: "basic",
    MeshLambertMaterial: "lambert",
    MeshPhongMaterial: "phong",
    MeshToonMaterial: "toon",
    MeshStandardMaterial: "physical",
    MeshPhysicalMaterial: "physical",
    MeshMatcapMaterial: "matcap",
    LineBasicMaterial: "basic",
    LineDashedMaterial: "dashed",
    PointsMaterial: "points",
    ShadowMaterial: "shadow",
    SpriteMaterial: "sprite"
  };
  function _(S) {
    return c.add(S), S === 0 ? "uv" : `uv${S}`;
  }
  function m(S, M, L, H, $) {
    const Z = H.fog, A = $.geometry, U = S.isMeshStandardMaterial ? H.environment : null, V = (S.isMeshStandardMaterial ? t : e).get(S.envMap || U), D = V && V.mapping === ys ? V.image.height : null, F = g[S.type];
    S.precision !== null && (p = r.getMaxPrecision(S.precision), p !== S.precision && console.warn("THREE.WebGLProgram.getParameters:", S.precision, "not supported, using", p, "instead."));
    const X = A.morphAttributes.position || A.morphAttributes.normal || A.morphAttributes.color, ne = X !== void 0 ? X.length : 0;
    let Pe = 0;
    A.morphAttributes.position !== void 0 && (Pe = 1), A.morphAttributes.normal !== void 0 && (Pe = 2), A.morphAttributes.color !== void 0 && (Pe = 3);
    let Ke, st, qe, Y;
    if (F) {
      const Ze = wn[F];
      Ke = Ze.vertexShader, st = Ze.fragmentShader;
    } else
      Ke = S.vertexShader, st = S.fragmentShader, l.update(S), qe = l.getVertexShaderID(S), Y = l.getFragmentShaderID(S);
    const J = i.getRenderTarget(), fe = i.state.buffers.depth.getReversed(), Ae = $.isInstancedMesh === !0, Me = $.isBatchedMesh === !0, $e = !!S.map, kt = !!S.matcap, C = !!V, ht = !!S.aoMap, ke = !!S.lightMap, Le = !!S.bumpMap, _e = !!S.normalMap, dt = !!S.displacementMap, ve = !!S.emissiveMap, He = !!S.metalnessMap, Ct = !!S.roughnessMap, xt = S.anisotropy > 0, E = S.clearcoat > 0, v = S.dispersion > 0, z = S.iridescence > 0, K = S.sheen > 0, ee = S.transmission > 0, j = xt && !!S.anisotropyMap, be = E && !!S.clearcoatMap, ae = E && !!S.clearcoatNormalMap, xe = E && !!S.clearcoatRoughnessMap, Se = z && !!S.iridescenceMap, re = z && !!S.iridescenceThicknessMap, de = K && !!S.sheenColorMap, De = K && !!S.sheenRoughnessMap, ye = !!S.specularMap, ce = !!S.specularColorMap, Be = !!S.specularIntensityMap, I = ee && !!S.transmissionMap, se = ee && !!S.thicknessMap, oe = !!S.gradientMap, pe = !!S.alphaMap, te = S.alphaTest > 0, Q = !!S.alphaHash, ge = !!S.extensions;
    let Oe = ni;
    S.toneMapped && (J === null || J.isXRRenderTarget === !0) && (Oe = i.toneMapping);
    const at = {
      shaderID: F,
      shaderType: S.type,
      shaderName: S.name,
      vertexShader: Ke,
      fragmentShader: st,
      defines: S.defines,
      customVertexShaderID: qe,
      customFragmentShaderID: Y,
      isRawShaderMaterial: S.isRawShaderMaterial === !0,
      glslVersion: S.glslVersion,
      precision: p,
      batching: Me,
      batchingColor: Me && $._colorsTexture !== null,
      instancing: Ae,
      instancingColor: Ae && $.instanceColor !== null,
      instancingMorph: Ae && $.morphTexture !== null,
      supportsVertexTextures: u,
      outputColorSpace: J === null ? i.outputColorSpace : J.isXRRenderTarget === !0 ? J.texture.colorSpace : tr,
      alphaToCoverage: !!S.alphaToCoverage,
      map: $e,
      matcap: kt,
      envMap: C,
      envMapMode: C && V.mapping,
      envMapCubeUVHeight: D,
      aoMap: ht,
      lightMap: ke,
      bumpMap: Le,
      normalMap: _e,
      displacementMap: u && dt,
      emissiveMap: ve,
      normalMapObjectSpace: _e && S.normalMapType === qh,
      normalMapTangentSpace: _e && S.normalMapType === fc,
      metalnessMap: He,
      roughnessMap: Ct,
      anisotropy: xt,
      anisotropyMap: j,
      clearcoat: E,
      clearcoatMap: be,
      clearcoatNormalMap: ae,
      clearcoatRoughnessMap: xe,
      dispersion: v,
      iridescence: z,
      iridescenceMap: Se,
      iridescenceThicknessMap: re,
      sheen: K,
      sheenColorMap: de,
      sheenRoughnessMap: De,
      specularMap: ye,
      specularColorMap: ce,
      specularIntensityMap: Be,
      transmission: ee,
      transmissionMap: I,
      thicknessMap: se,
      gradientMap: oe,
      opaque: S.transparent === !1 && S.blending === Yi && S.alphaToCoverage === !1,
      alphaMap: pe,
      alphaTest: te,
      alphaHash: Q,
      combine: S.combine,
      //
      mapUv: $e && _(S.map.channel),
      aoMapUv: ht && _(S.aoMap.channel),
      lightMapUv: ke && _(S.lightMap.channel),
      bumpMapUv: Le && _(S.bumpMap.channel),
      normalMapUv: _e && _(S.normalMap.channel),
      displacementMapUv: dt && _(S.displacementMap.channel),
      emissiveMapUv: ve && _(S.emissiveMap.channel),
      metalnessMapUv: He && _(S.metalnessMap.channel),
      roughnessMapUv: Ct && _(S.roughnessMap.channel),
      anisotropyMapUv: j && _(S.anisotropyMap.channel),
      clearcoatMapUv: be && _(S.clearcoatMap.channel),
      clearcoatNormalMapUv: ae && _(S.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: xe && _(S.clearcoatRoughnessMap.channel),
      iridescenceMapUv: Se && _(S.iridescenceMap.channel),
      iridescenceThicknessMapUv: re && _(S.iridescenceThicknessMap.channel),
      sheenColorMapUv: de && _(S.sheenColorMap.channel),
      sheenRoughnessMapUv: De && _(S.sheenRoughnessMap.channel),
      specularMapUv: ye && _(S.specularMap.channel),
      specularColorMapUv: ce && _(S.specularColorMap.channel),
      specularIntensityMapUv: Be && _(S.specularIntensityMap.channel),
      transmissionMapUv: I && _(S.transmissionMap.channel),
      thicknessMapUv: se && _(S.thicknessMap.channel),
      alphaMapUv: pe && _(S.alphaMap.channel),
      //
      vertexTangents: !!A.attributes.tangent && (_e || xt),
      vertexColors: S.vertexColors,
      vertexAlphas: S.vertexColors === !0 && !!A.attributes.color && A.attributes.color.itemSize === 4,
      pointsUvs: $.isPoints === !0 && !!A.attributes.uv && ($e || pe),
      fog: !!Z,
      useFog: S.fog === !0,
      fogExp2: !!Z && Z.isFogExp2,
      flatShading: S.flatShading === !0 && S.wireframe === !1,
      sizeAttenuation: S.sizeAttenuation === !0,
      logarithmicDepthBuffer: d,
      reversedDepthBuffer: fe,
      skinning: $.isSkinnedMesh === !0,
      morphTargets: A.morphAttributes.position !== void 0,
      morphNormals: A.morphAttributes.normal !== void 0,
      morphColors: A.morphAttributes.color !== void 0,
      morphTargetsCount: ne,
      morphTextureStride: Pe,
      numDirLights: M.directional.length,
      numPointLights: M.point.length,
      numSpotLights: M.spot.length,
      numSpotLightMaps: M.spotLightMap.length,
      numRectAreaLights: M.rectArea.length,
      numHemiLights: M.hemi.length,
      numDirLightShadows: M.directionalShadowMap.length,
      numPointLightShadows: M.pointShadowMap.length,
      numSpotLightShadows: M.spotShadowMap.length,
      numSpotLightShadowsWithMaps: M.numSpotLightShadowsWithMaps,
      numLightProbes: M.numLightProbes,
      numClippingPlanes: a.numPlanes,
      numClipIntersection: a.numIntersection,
      dithering: S.dithering,
      shadowMapEnabled: i.shadowMap.enabled && L.length > 0,
      shadowMapType: i.shadowMap.type,
      toneMapping: Oe,
      decodeVideoTexture: $e && S.map.isVideoTexture === !0 && je.getTransfer(S.map.colorSpace) === et,
      decodeVideoTextureEmissive: ve && S.emissiveMap.isVideoTexture === !0 && je.getTransfer(S.emissiveMap.colorSpace) === et,
      premultipliedAlpha: S.premultipliedAlpha,
      doubleSided: S.side === rn,
      flipSided: S.side === Jt,
      useDepthPacking: S.depthPacking >= 0,
      depthPacking: S.depthPacking || 0,
      index0AttributeName: S.index0AttributeName,
      extensionClipCullDistance: ge && S.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: (ge && S.extensions.multiDraw === !0 || Me) && n.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: S.customProgramCacheKey()
    };
    return at.vertexUv1s = c.has(1), at.vertexUv2s = c.has(2), at.vertexUv3s = c.has(3), c.clear(), at;
  }
  function f(S) {
    const M = [];
    if (S.shaderID ? M.push(S.shaderID) : (M.push(S.customVertexShaderID), M.push(S.customFragmentShaderID)), S.defines !== void 0)
      for (const L in S.defines)
        M.push(L), M.push(S.defines[L]);
    return S.isRawShaderMaterial === !1 && (T(M, S), b(M, S), M.push(i.outputColorSpace)), M.push(S.customProgramCacheKey), M.join();
  }
  function T(S, M) {
    S.push(M.precision), S.push(M.outputColorSpace), S.push(M.envMapMode), S.push(M.envMapCubeUVHeight), S.push(M.mapUv), S.push(M.alphaMapUv), S.push(M.lightMapUv), S.push(M.aoMapUv), S.push(M.bumpMapUv), S.push(M.normalMapUv), S.push(M.displacementMapUv), S.push(M.emissiveMapUv), S.push(M.metalnessMapUv), S.push(M.roughnessMapUv), S.push(M.anisotropyMapUv), S.push(M.clearcoatMapUv), S.push(M.clearcoatNormalMapUv), S.push(M.clearcoatRoughnessMapUv), S.push(M.iridescenceMapUv), S.push(M.iridescenceThicknessMapUv), S.push(M.sheenColorMapUv), S.push(M.sheenRoughnessMapUv), S.push(M.specularMapUv), S.push(M.specularColorMapUv), S.push(M.specularIntensityMapUv), S.push(M.transmissionMapUv), S.push(M.thicknessMapUv), S.push(M.combine), S.push(M.fogExp2), S.push(M.sizeAttenuation), S.push(M.morphTargetsCount), S.push(M.morphAttributeCount), S.push(M.numDirLights), S.push(M.numPointLights), S.push(M.numSpotLights), S.push(M.numSpotLightMaps), S.push(M.numHemiLights), S.push(M.numRectAreaLights), S.push(M.numDirLightShadows), S.push(M.numPointLightShadows), S.push(M.numSpotLightShadows), S.push(M.numSpotLightShadowsWithMaps), S.push(M.numLightProbes), S.push(M.shadowMapType), S.push(M.toneMapping), S.push(M.numClippingPlanes), S.push(M.numClipIntersection), S.push(M.depthPacking);
  }
  function b(S, M) {
    o.disableAll(), M.supportsVertexTextures && o.enable(0), M.instancing && o.enable(1), M.instancingColor && o.enable(2), M.instancingMorph && o.enable(3), M.matcap && o.enable(4), M.envMap && o.enable(5), M.normalMapObjectSpace && o.enable(6), M.normalMapTangentSpace && o.enable(7), M.clearcoat && o.enable(8), M.iridescence && o.enable(9), M.alphaTest && o.enable(10), M.vertexColors && o.enable(11), M.vertexAlphas && o.enable(12), M.vertexUv1s && o.enable(13), M.vertexUv2s && o.enable(14), M.vertexUv3s && o.enable(15), M.vertexTangents && o.enable(16), M.anisotropy && o.enable(17), M.alphaHash && o.enable(18), M.batching && o.enable(19), M.dispersion && o.enable(20), M.batchingColor && o.enable(21), M.gradientMap && o.enable(22), S.push(o.mask), o.disableAll(), M.fog && o.enable(0), M.useFog && o.enable(1), M.flatShading && o.enable(2), M.logarithmicDepthBuffer && o.enable(3), M.reversedDepthBuffer && o.enable(4), M.skinning && o.enable(5), M.morphTargets && o.enable(6), M.morphNormals && o.enable(7), M.morphColors && o.enable(8), M.premultipliedAlpha && o.enable(9), M.shadowMapEnabled && o.enable(10), M.doubleSided && o.enable(11), M.flipSided && o.enable(12), M.useDepthPacking && o.enable(13), M.dithering && o.enable(14), M.transmission && o.enable(15), M.sheen && o.enable(16), M.opaque && o.enable(17), M.pointsUvs && o.enable(18), M.decodeVideoTexture && o.enable(19), M.decodeVideoTextureEmissive && o.enable(20), M.alphaToCoverage && o.enable(21), S.push(o.mask);
  }
  function y(S) {
    const M = g[S.type];
    let L;
    if (M) {
      const H = wn[M];
      L = Od.clone(H.uniforms);
    } else
      L = S.uniforms;
    return L;
  }
  function w(S, M) {
    let L;
    for (let H = 0, $ = h.length; H < $; H++) {
      const Z = h[H];
      if (Z.cacheKey === M) {
        L = Z, ++L.usedTimes;
        break;
      }
    }
    return L === void 0 && (L = new gg(i, M, S, s), h.push(L)), L;
  }
  function R(S) {
    if (--S.usedTimes === 0) {
      const M = h.indexOf(S);
      h[M] = h[h.length - 1], h.pop(), S.destroy();
    }
  }
  function P(S) {
    l.remove(S);
  }
  function O() {
    l.dispose();
  }
  return {
    getParameters: m,
    getProgramCacheKey: f,
    getUniforms: y,
    acquireProgram: w,
    releaseProgram: R,
    releaseShaderCache: P,
    // Exposed for resource monitoring & error feedback via renderer.info:
    programs: h,
    dispose: O
  };
}
function Sg() {
  let i = /* @__PURE__ */ new WeakMap();
  function e(a) {
    return i.has(a);
  }
  function t(a) {
    let o = i.get(a);
    return o === void 0 && (o = {}, i.set(a, o)), o;
  }
  function n(a) {
    i.delete(a);
  }
  function r(a, o, l) {
    i.get(a)[o] = l;
  }
  function s() {
    i = /* @__PURE__ */ new WeakMap();
  }
  return {
    has: e,
    get: t,
    remove: n,
    update: r,
    dispose: s
  };
}
function yg(i, e) {
  return i.groupOrder !== e.groupOrder ? i.groupOrder - e.groupOrder : i.renderOrder !== e.renderOrder ? i.renderOrder - e.renderOrder : i.material.id !== e.material.id ? i.material.id - e.material.id : i.z !== e.z ? i.z - e.z : i.id - e.id;
}
function Ol(i, e) {
  return i.groupOrder !== e.groupOrder ? i.groupOrder - e.groupOrder : i.renderOrder !== e.renderOrder ? i.renderOrder - e.renderOrder : i.z !== e.z ? e.z - i.z : i.id - e.id;
}
function kl() {
  const i = [];
  let e = 0;
  const t = [], n = [], r = [];
  function s() {
    e = 0, t.length = 0, n.length = 0, r.length = 0;
  }
  function a(d, u, p, g, _, m) {
    let f = i[e];
    return f === void 0 ? (f = {
      id: d.id,
      object: d,
      geometry: u,
      material: p,
      groupOrder: g,
      renderOrder: d.renderOrder,
      z: _,
      group: m
    }, i[e] = f) : (f.id = d.id, f.object = d, f.geometry = u, f.material = p, f.groupOrder = g, f.renderOrder = d.renderOrder, f.z = _, f.group = m), e++, f;
  }
  function o(d, u, p, g, _, m) {
    const f = a(d, u, p, g, _, m);
    p.transmission > 0 ? n.push(f) : p.transparent === !0 ? r.push(f) : t.push(f);
  }
  function l(d, u, p, g, _, m) {
    const f = a(d, u, p, g, _, m);
    p.transmission > 0 ? n.unshift(f) : p.transparent === !0 ? r.unshift(f) : t.unshift(f);
  }
  function c(d, u) {
    t.length > 1 && t.sort(d || yg), n.length > 1 && n.sort(u || Ol), r.length > 1 && r.sort(u || Ol);
  }
  function h() {
    for (let d = e, u = i.length; d < u; d++) {
      const p = i[d];
      if (p.id === null) break;
      p.id = null, p.object = null, p.geometry = null, p.material = null, p.group = null;
    }
  }
  return {
    opaque: t,
    transmissive: n,
    transparent: r,
    init: s,
    push: o,
    unshift: l,
    finish: h,
    sort: c
  };
}
function bg() {
  let i = /* @__PURE__ */ new WeakMap();
  function e(n, r) {
    const s = i.get(n);
    let a;
    return s === void 0 ? (a = new kl(), i.set(n, [a])) : r >= s.length ? (a = new kl(), s.push(a)) : a = s[r], a;
  }
  function t() {
    i = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: e,
    dispose: t
  };
}
function Eg() {
  const i = {};
  return {
    get: function(e) {
      if (i[e.id] !== void 0)
        return i[e.id];
      let t;
      switch (e.type) {
        case "DirectionalLight":
          t = {
            direction: new N(),
            color: new Xe()
          };
          break;
        case "SpotLight":
          t = {
            position: new N(),
            direction: new N(),
            color: new Xe(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case "PointLight":
          t = {
            position: new N(),
            color: new Xe(),
            distance: 0,
            decay: 0
          };
          break;
        case "HemisphereLight":
          t = {
            direction: new N(),
            skyColor: new Xe(),
            groundColor: new Xe()
          };
          break;
        case "RectAreaLight":
          t = {
            color: new Xe(),
            position: new N(),
            halfWidth: new N(),
            halfHeight: new N()
          };
          break;
      }
      return i[e.id] = t, t;
    }
  };
}
function wg() {
  const i = {};
  return {
    get: function(e) {
      if (i[e.id] !== void 0)
        return i[e.id];
      let t;
      switch (e.type) {
        case "DirectionalLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Ue()
          };
          break;
        case "SpotLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Ue()
          };
          break;
        case "PointLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Ue(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3
          };
          break;
      }
      return i[e.id] = t, t;
    }
  };
}
let Tg = 0;
function Ag(i, e) {
  return (e.castShadow ? 2 : 0) - (i.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (i.map ? 1 : 0);
}
function Rg(i) {
  const e = new Eg(), t = wg(), n = {
    version: 0,
    hash: {
      directionalLength: -1,
      pointLength: -1,
      spotLength: -1,
      rectAreaLength: -1,
      hemiLength: -1,
      numDirectionalShadows: -1,
      numPointShadows: -1,
      numSpotShadows: -1,
      numSpotMaps: -1,
      numLightProbes: -1
    },
    ambient: [0, 0, 0],
    probe: [],
    directional: [],
    directionalShadow: [],
    directionalShadowMap: [],
    directionalShadowMatrix: [],
    spot: [],
    spotLightMap: [],
    spotShadow: [],
    spotShadowMap: [],
    spotLightMatrix: [],
    rectArea: [],
    rectAreaLTC1: null,
    rectAreaLTC2: null,
    point: [],
    pointShadow: [],
    pointShadowMap: [],
    pointShadowMatrix: [],
    hemi: [],
    numSpotLightShadowsWithMaps: 0,
    numLightProbes: 0
  };
  for (let c = 0; c < 9; c++) n.probe.push(new N());
  const r = new N(), s = new lt(), a = new lt();
  function o(c) {
    let h = 0, d = 0, u = 0;
    for (let S = 0; S < 9; S++) n.probe[S].set(0, 0, 0);
    let p = 0, g = 0, _ = 0, m = 0, f = 0, T = 0, b = 0, y = 0, w = 0, R = 0, P = 0;
    c.sort(Ag);
    for (let S = 0, M = c.length; S < M; S++) {
      const L = c[S], H = L.color, $ = L.intensity, Z = L.distance, A = L.shadow && L.shadow.map ? L.shadow.map.texture : null;
      if (L.isAmbientLight)
        h += H.r * $, d += H.g * $, u += H.b * $;
      else if (L.isLightProbe) {
        for (let U = 0; U < 9; U++)
          n.probe[U].addScaledVector(L.sh.coefficients[U], $);
        P++;
      } else if (L.isDirectionalLight) {
        const U = e.get(L);
        if (U.color.copy(L.color).multiplyScalar(L.intensity), L.castShadow) {
          const V = L.shadow, D = t.get(L);
          D.shadowIntensity = V.intensity, D.shadowBias = V.bias, D.shadowNormalBias = V.normalBias, D.shadowRadius = V.radius, D.shadowMapSize = V.mapSize, n.directionalShadow[p] = D, n.directionalShadowMap[p] = A, n.directionalShadowMatrix[p] = L.shadow.matrix, T++;
        }
        n.directional[p] = U, p++;
      } else if (L.isSpotLight) {
        const U = e.get(L);
        U.position.setFromMatrixPosition(L.matrixWorld), U.color.copy(H).multiplyScalar($), U.distance = Z, U.coneCos = Math.cos(L.angle), U.penumbraCos = Math.cos(L.angle * (1 - L.penumbra)), U.decay = L.decay, n.spot[_] = U;
        const V = L.shadow;
        if (L.map && (n.spotLightMap[w] = L.map, w++, V.updateMatrices(L), L.castShadow && R++), n.spotLightMatrix[_] = V.matrix, L.castShadow) {
          const D = t.get(L);
          D.shadowIntensity = V.intensity, D.shadowBias = V.bias, D.shadowNormalBias = V.normalBias, D.shadowRadius = V.radius, D.shadowMapSize = V.mapSize, n.spotShadow[_] = D, n.spotShadowMap[_] = A, y++;
        }
        _++;
      } else if (L.isRectAreaLight) {
        const U = e.get(L);
        U.color.copy(H).multiplyScalar($), U.halfWidth.set(L.width * 0.5, 0, 0), U.halfHeight.set(0, L.height * 0.5, 0), n.rectArea[m] = U, m++;
      } else if (L.isPointLight) {
        const U = e.get(L);
        if (U.color.copy(L.color).multiplyScalar(L.intensity), U.distance = L.distance, U.decay = L.decay, L.castShadow) {
          const V = L.shadow, D = t.get(L);
          D.shadowIntensity = V.intensity, D.shadowBias = V.bias, D.shadowNormalBias = V.normalBias, D.shadowRadius = V.radius, D.shadowMapSize = V.mapSize, D.shadowCameraNear = V.camera.near, D.shadowCameraFar = V.camera.far, n.pointShadow[g] = D, n.pointShadowMap[g] = A, n.pointShadowMatrix[g] = L.shadow.matrix, b++;
        }
        n.point[g] = U, g++;
      } else if (L.isHemisphereLight) {
        const U = e.get(L);
        U.skyColor.copy(L.color).multiplyScalar($), U.groundColor.copy(L.groundColor).multiplyScalar($), n.hemi[f] = U, f++;
      }
    }
    m > 0 && (i.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = le.LTC_FLOAT_1, n.rectAreaLTC2 = le.LTC_FLOAT_2) : (n.rectAreaLTC1 = le.LTC_HALF_1, n.rectAreaLTC2 = le.LTC_HALF_2)), n.ambient[0] = h, n.ambient[1] = d, n.ambient[2] = u;
    const O = n.hash;
    (O.directionalLength !== p || O.pointLength !== g || O.spotLength !== _ || O.rectAreaLength !== m || O.hemiLength !== f || O.numDirectionalShadows !== T || O.numPointShadows !== b || O.numSpotShadows !== y || O.numSpotMaps !== w || O.numLightProbes !== P) && (n.directional.length = p, n.spot.length = _, n.rectArea.length = m, n.point.length = g, n.hemi.length = f, n.directionalShadow.length = T, n.directionalShadowMap.length = T, n.pointShadow.length = b, n.pointShadowMap.length = b, n.spotShadow.length = y, n.spotShadowMap.length = y, n.directionalShadowMatrix.length = T, n.pointShadowMatrix.length = b, n.spotLightMatrix.length = y + w - R, n.spotLightMap.length = w, n.numSpotLightShadowsWithMaps = R, n.numLightProbes = P, O.directionalLength = p, O.pointLength = g, O.spotLength = _, O.rectAreaLength = m, O.hemiLength = f, O.numDirectionalShadows = T, O.numPointShadows = b, O.numSpotShadows = y, O.numSpotMaps = w, O.numLightProbes = P, n.version = Tg++);
  }
  function l(c, h) {
    let d = 0, u = 0, p = 0, g = 0, _ = 0;
    const m = h.matrixWorldInverse;
    for (let f = 0, T = c.length; f < T; f++) {
      const b = c[f];
      if (b.isDirectionalLight) {
        const y = n.directional[d];
        y.direction.setFromMatrixPosition(b.matrixWorld), r.setFromMatrixPosition(b.target.matrixWorld), y.direction.sub(r), y.direction.transformDirection(m), d++;
      } else if (b.isSpotLight) {
        const y = n.spot[p];
        y.position.setFromMatrixPosition(b.matrixWorld), y.position.applyMatrix4(m), y.direction.setFromMatrixPosition(b.matrixWorld), r.setFromMatrixPosition(b.target.matrixWorld), y.direction.sub(r), y.direction.transformDirection(m), p++;
      } else if (b.isRectAreaLight) {
        const y = n.rectArea[g];
        y.position.setFromMatrixPosition(b.matrixWorld), y.position.applyMatrix4(m), a.identity(), s.copy(b.matrixWorld), s.premultiply(m), a.extractRotation(s), y.halfWidth.set(b.width * 0.5, 0, 0), y.halfHeight.set(0, b.height * 0.5, 0), y.halfWidth.applyMatrix4(a), y.halfHeight.applyMatrix4(a), g++;
      } else if (b.isPointLight) {
        const y = n.point[u];
        y.position.setFromMatrixPosition(b.matrixWorld), y.position.applyMatrix4(m), u++;
      } else if (b.isHemisphereLight) {
        const y = n.hemi[_];
        y.direction.setFromMatrixPosition(b.matrixWorld), y.direction.transformDirection(m), _++;
      }
    }
  }
  return {
    setup: o,
    setupView: l,
    state: n
  };
}
function Bl(i) {
  const e = new Rg(i), t = [], n = [];
  function r(h) {
    c.camera = h, t.length = 0, n.length = 0;
  }
  function s(h) {
    t.push(h);
  }
  function a(h) {
    n.push(h);
  }
  function o() {
    e.setup(t);
  }
  function l(h) {
    e.setupView(t, h);
  }
  const c = {
    lightsArray: t,
    shadowsArray: n,
    camera: null,
    lights: e,
    transmissionRenderTarget: {}
  };
  return {
    init: r,
    state: c,
    setupLights: o,
    setupLightsView: l,
    pushLight: s,
    pushShadow: a
  };
}
function Cg(i) {
  let e = /* @__PURE__ */ new WeakMap();
  function t(r, s = 0) {
    const a = e.get(r);
    let o;
    return a === void 0 ? (o = new Bl(i), e.set(r, [o])) : s >= a.length ? (o = new Bl(i), a.push(o)) : o = a[s], o;
  }
  function n() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: t,
    dispose: n
  };
}
const Pg = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, Dg = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;
function Lg(i, e, t) {
  let n = new mo();
  const r = new Ue(), s = new Ue(), a = new vt(), o = new Jd({ depthPacking: Xh }), l = new Qd(), c = {}, h = t.maxTextureSize, d = { [ii]: Jt, [Jt]: ii, [rn]: rn }, u = new ri({
    defines: {
      VSM_SAMPLES: 8
    },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new Ue() },
      radius: { value: 4 }
    },
    vertexShader: Pg,
    fragmentShader: Dg
  }), p = u.clone();
  p.defines.HORIZONTAL_PASS = 1;
  const g = new un();
  g.setAttribute(
    "position",
    new Sn(
      new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]),
      3
    )
  );
  const _ = new Ot(g, u), m = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = nc;
  let f = this.type;
  this.render = function(R, P, O) {
    if (m.enabled === !1 || m.autoUpdate === !1 && m.needsUpdate === !1 || R.length === 0) return;
    const S = i.getRenderTarget(), M = i.getActiveCubeFace(), L = i.getActiveMipmapLevel(), H = i.state;
    H.setBlending(ti), H.buffers.depth.getReversed() === !0 ? H.buffers.color.setClear(0, 0, 0, 0) : H.buffers.color.setClear(1, 1, 1, 1), H.buffers.depth.setTest(!0), H.setScissorTest(!1);
    const $ = f !== zn && this.type === zn, Z = f === zn && this.type !== zn;
    for (let A = 0, U = R.length; A < U; A++) {
      const V = R[A], D = V.shadow;
      if (D === void 0) {
        console.warn("THREE.WebGLShadowMap:", V, "has no shadow.");
        continue;
      }
      if (D.autoUpdate === !1 && D.needsUpdate === !1) continue;
      r.copy(D.mapSize);
      const F = D.getFrameExtents();
      if (r.multiply(F), s.copy(D.mapSize), (r.x > h || r.y > h) && (r.x > h && (s.x = Math.floor(h / F.x), r.x = s.x * F.x, D.mapSize.x = s.x), r.y > h && (s.y = Math.floor(h / F.y), r.y = s.y * F.y, D.mapSize.y = s.y)), D.map === null || $ === !0 || Z === !0) {
        const ne = this.type !== zn ? { minFilter: Mn, magFilter: Mn } : {};
        D.map !== null && D.map.dispose(), D.map = new wi(r.x, r.y, ne), D.map.texture.name = V.name + ".shadowMap", D.camera.updateProjectionMatrix();
      }
      i.setRenderTarget(D.map), i.clear();
      const X = D.getViewportCount();
      for (let ne = 0; ne < X; ne++) {
        const Pe = D.getViewport(ne);
        a.set(
          s.x * Pe.x,
          s.y * Pe.y,
          s.x * Pe.z,
          s.y * Pe.w
        ), H.viewport(a), D.updateMatrices(V, ne), n = D.getFrustum(), y(P, O, D.camera, V, this.type);
      }
      D.isPointLightShadow !== !0 && this.type === zn && T(D, O), D.needsUpdate = !1;
    }
    f = this.type, m.needsUpdate = !1, i.setRenderTarget(S, M, L);
  };
  function T(R, P) {
    const O = e.update(_);
    u.defines.VSM_SAMPLES !== R.blurSamples && (u.defines.VSM_SAMPLES = R.blurSamples, p.defines.VSM_SAMPLES = R.blurSamples, u.needsUpdate = !0, p.needsUpdate = !0), R.mapPass === null && (R.mapPass = new wi(r.x, r.y)), u.uniforms.shadow_pass.value = R.map.texture, u.uniforms.resolution.value = R.mapSize, u.uniforms.radius.value = R.radius, i.setRenderTarget(R.mapPass), i.clear(), i.renderBufferDirect(P, null, O, u, _, null), p.uniforms.shadow_pass.value = R.mapPass.texture, p.uniforms.resolution.value = R.mapSize, p.uniforms.radius.value = R.radius, i.setRenderTarget(R.map), i.clear(), i.renderBufferDirect(P, null, O, p, _, null);
  }
  function b(R, P, O, S) {
    let M = null;
    const L = O.isPointLight === !0 ? R.customDistanceMaterial : R.customDepthMaterial;
    if (L !== void 0)
      M = L;
    else if (M = O.isPointLight === !0 ? l : o, i.localClippingEnabled && P.clipShadows === !0 && Array.isArray(P.clippingPlanes) && P.clippingPlanes.length !== 0 || P.displacementMap && P.displacementScale !== 0 || P.alphaMap && P.alphaTest > 0 || P.map && P.alphaTest > 0 || P.alphaToCoverage === !0) {
      const H = M.uuid, $ = P.uuid;
      let Z = c[H];
      Z === void 0 && (Z = {}, c[H] = Z);
      let A = Z[$];
      A === void 0 && (A = M.clone(), Z[$] = A, P.addEventListener("dispose", w)), M = A;
    }
    if (M.visible = P.visible, M.wireframe = P.wireframe, S === zn ? M.side = P.shadowSide !== null ? P.shadowSide : P.side : M.side = P.shadowSide !== null ? P.shadowSide : d[P.side], M.alphaMap = P.alphaMap, M.alphaTest = P.alphaToCoverage === !0 ? 0.5 : P.alphaTest, M.map = P.map, M.clipShadows = P.clipShadows, M.clippingPlanes = P.clippingPlanes, M.clipIntersection = P.clipIntersection, M.displacementMap = P.displacementMap, M.displacementScale = P.displacementScale, M.displacementBias = P.displacementBias, M.wireframeLinewidth = P.wireframeLinewidth, M.linewidth = P.linewidth, O.isPointLight === !0 && M.isMeshDistanceMaterial === !0) {
      const H = i.properties.get(M);
      H.light = O;
    }
    return M;
  }
  function y(R, P, O, S, M) {
    if (R.visible === !1) return;
    if (R.layers.test(P.layers) && (R.isMesh || R.isLine || R.isPoints) && (R.castShadow || R.receiveShadow && M === zn) && (!R.frustumCulled || n.intersectsObject(R))) {
      R.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse, R.matrixWorld);
      const $ = e.update(R), Z = R.material;
      if (Array.isArray(Z)) {
        const A = $.groups;
        for (let U = 0, V = A.length; U < V; U++) {
          const D = A[U], F = Z[D.materialIndex];
          if (F && F.visible) {
            const X = b(R, F, S, M);
            R.onBeforeShadow(i, R, P, O, $, X, D), i.renderBufferDirect(O, null, $, X, R, D), R.onAfterShadow(i, R, P, O, $, X, D);
          }
        }
      } else if (Z.visible) {
        const A = b(R, Z, S, M);
        R.onBeforeShadow(i, R, P, O, $, A, null), i.renderBufferDirect(O, null, $, A, R, null), R.onAfterShadow(i, R, P, O, $, A, null);
      }
    }
    const H = R.children;
    for (let $ = 0, Z = H.length; $ < Z; $++)
      y(H[$], P, O, S, M);
  }
  function w(R) {
    R.target.removeEventListener("dispose", w);
    for (const O in c) {
      const S = c[O], M = R.target.uuid;
      M in S && (S[M].dispose(), delete S[M]);
    }
  }
}
const Ig = {
  [pa]: ma,
  [ga]: xa,
  [_a]: Ma,
  [Ji]: va,
  [ma]: pa,
  [xa]: ga,
  [Ma]: _a,
  [va]: Ji
};
function Ug(i, e) {
  function t() {
    let I = !1;
    const se = new vt();
    let oe = null;
    const pe = new vt(0, 0, 0, 0);
    return {
      setMask: function(te) {
        oe !== te && !I && (i.colorMask(te, te, te, te), oe = te);
      },
      setLocked: function(te) {
        I = te;
      },
      setClear: function(te, Q, ge, Oe, at) {
        at === !0 && (te *= Oe, Q *= Oe, ge *= Oe), se.set(te, Q, ge, Oe), pe.equals(se) === !1 && (i.clearColor(te, Q, ge, Oe), pe.copy(se));
      },
      reset: function() {
        I = !1, oe = null, pe.set(-1, 0, 0, 0);
      }
    };
  }
  function n() {
    let I = !1, se = !1, oe = null, pe = null, te = null;
    return {
      setReversed: function(Q) {
        if (se !== Q) {
          const ge = e.get("EXT_clip_control");
          Q ? ge.clipControlEXT(ge.LOWER_LEFT_EXT, ge.ZERO_TO_ONE_EXT) : ge.clipControlEXT(ge.LOWER_LEFT_EXT, ge.NEGATIVE_ONE_TO_ONE_EXT), se = Q;
          const Oe = te;
          te = null, this.setClear(Oe);
        }
      },
      getReversed: function() {
        return se;
      },
      setTest: function(Q) {
        Q ? J(i.DEPTH_TEST) : fe(i.DEPTH_TEST);
      },
      setMask: function(Q) {
        oe !== Q && !I && (i.depthMask(Q), oe = Q);
      },
      setFunc: function(Q) {
        if (se && (Q = Ig[Q]), pe !== Q) {
          switch (Q) {
            case pa:
              i.depthFunc(i.NEVER);
              break;
            case ma:
              i.depthFunc(i.ALWAYS);
              break;
            case ga:
              i.depthFunc(i.LESS);
              break;
            case Ji:
              i.depthFunc(i.LEQUAL);
              break;
            case _a:
              i.depthFunc(i.EQUAL);
              break;
            case va:
              i.depthFunc(i.GEQUAL);
              break;
            case xa:
              i.depthFunc(i.GREATER);
              break;
            case Ma:
              i.depthFunc(i.NOTEQUAL);
              break;
            default:
              i.depthFunc(i.LEQUAL);
          }
          pe = Q;
        }
      },
      setLocked: function(Q) {
        I = Q;
      },
      setClear: function(Q) {
        te !== Q && (se && (Q = 1 - Q), i.clearDepth(Q), te = Q);
      },
      reset: function() {
        I = !1, oe = null, pe = null, te = null, se = !1;
      }
    };
  }
  function r() {
    let I = !1, se = null, oe = null, pe = null, te = null, Q = null, ge = null, Oe = null, at = null;
    return {
      setTest: function(Ze) {
        I || (Ze ? J(i.STENCIL_TEST) : fe(i.STENCIL_TEST));
      },
      setMask: function(Ze) {
        se !== Ze && !I && (i.stencilMask(Ze), se = Ze);
      },
      setFunc: function(Ze, Un, En) {
        (oe !== Ze || pe !== Un || te !== En) && (i.stencilFunc(Ze, Un, En), oe = Ze, pe = Un, te = En);
      },
      setOp: function(Ze, Un, En) {
        (Q !== Ze || ge !== Un || Oe !== En) && (i.stencilOp(Ze, Un, En), Q = Ze, ge = Un, Oe = En);
      },
      setLocked: function(Ze) {
        I = Ze;
      },
      setClear: function(Ze) {
        at !== Ze && (i.clearStencil(Ze), at = Ze);
      },
      reset: function() {
        I = !1, se = null, oe = null, pe = null, te = null, Q = null, ge = null, Oe = null, at = null;
      }
    };
  }
  const s = new t(), a = new n(), o = new r(), l = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap();
  let h = {}, d = {}, u = /* @__PURE__ */ new WeakMap(), p = [], g = null, _ = !1, m = null, f = null, T = null, b = null, y = null, w = null, R = null, P = new Xe(0, 0, 0), O = 0, S = !1, M = null, L = null, H = null, $ = null, Z = null;
  const A = i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let U = !1, V = 0;
  const D = i.getParameter(i.VERSION);
  D.indexOf("WebGL") !== -1 ? (V = parseFloat(/^WebGL (\d)/.exec(D)[1]), U = V >= 1) : D.indexOf("OpenGL ES") !== -1 && (V = parseFloat(/^OpenGL ES (\d)/.exec(D)[1]), U = V >= 2);
  let F = null, X = {};
  const ne = i.getParameter(i.SCISSOR_BOX), Pe = i.getParameter(i.VIEWPORT), Ke = new vt().fromArray(ne), st = new vt().fromArray(Pe);
  function qe(I, se, oe, pe) {
    const te = new Uint8Array(4), Q = i.createTexture();
    i.bindTexture(I, Q), i.texParameteri(I, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(I, i.TEXTURE_MAG_FILTER, i.NEAREST);
    for (let ge = 0; ge < oe; ge++)
      I === i.TEXTURE_3D || I === i.TEXTURE_2D_ARRAY ? i.texImage3D(se, 0, i.RGBA, 1, 1, pe, 0, i.RGBA, i.UNSIGNED_BYTE, te) : i.texImage2D(se + ge, 0, i.RGBA, 1, 1, 0, i.RGBA, i.UNSIGNED_BYTE, te);
    return Q;
  }
  const Y = {};
  Y[i.TEXTURE_2D] = qe(i.TEXTURE_2D, i.TEXTURE_2D, 1), Y[i.TEXTURE_CUBE_MAP] = qe(i.TEXTURE_CUBE_MAP, i.TEXTURE_CUBE_MAP_POSITIVE_X, 6), Y[i.TEXTURE_2D_ARRAY] = qe(i.TEXTURE_2D_ARRAY, i.TEXTURE_2D_ARRAY, 1, 1), Y[i.TEXTURE_3D] = qe(i.TEXTURE_3D, i.TEXTURE_3D, 1, 1), s.setClear(0, 0, 0, 1), a.setClear(1), o.setClear(0), J(i.DEPTH_TEST), a.setFunc(Ji), Le(!1), _e(No), J(i.CULL_FACE), ht(ti);
  function J(I) {
    h[I] !== !0 && (i.enable(I), h[I] = !0);
  }
  function fe(I) {
    h[I] !== !1 && (i.disable(I), h[I] = !1);
  }
  function Ae(I, se) {
    return d[I] !== se ? (i.bindFramebuffer(I, se), d[I] = se, I === i.DRAW_FRAMEBUFFER && (d[i.FRAMEBUFFER] = se), I === i.FRAMEBUFFER && (d[i.DRAW_FRAMEBUFFER] = se), !0) : !1;
  }
  function Me(I, se) {
    let oe = p, pe = !1;
    if (I) {
      oe = u.get(se), oe === void 0 && (oe = [], u.set(se, oe));
      const te = I.textures;
      if (oe.length !== te.length || oe[0] !== i.COLOR_ATTACHMENT0) {
        for (let Q = 0, ge = te.length; Q < ge; Q++)
          oe[Q] = i.COLOR_ATTACHMENT0 + Q;
        oe.length = te.length, pe = !0;
      }
    } else
      oe[0] !== i.BACK && (oe[0] = i.BACK, pe = !0);
    pe && i.drawBuffers(oe);
  }
  function $e(I) {
    return g !== I ? (i.useProgram(I), g = I, !0) : !1;
  }
  const kt = {
    [gi]: i.FUNC_ADD,
    [vh]: i.FUNC_SUBTRACT,
    [xh]: i.FUNC_REVERSE_SUBTRACT
  };
  kt[Mh] = i.MIN, kt[Sh] = i.MAX;
  const C = {
    [yh]: i.ZERO,
    [bh]: i.ONE,
    [Eh]: i.SRC_COLOR,
    [ua]: i.SRC_ALPHA,
    [Ph]: i.SRC_ALPHA_SATURATE,
    [Rh]: i.DST_COLOR,
    [Th]: i.DST_ALPHA,
    [wh]: i.ONE_MINUS_SRC_COLOR,
    [fa]: i.ONE_MINUS_SRC_ALPHA,
    [Ch]: i.ONE_MINUS_DST_COLOR,
    [Ah]: i.ONE_MINUS_DST_ALPHA,
    [Dh]: i.CONSTANT_COLOR,
    [Lh]: i.ONE_MINUS_CONSTANT_COLOR,
    [Ih]: i.CONSTANT_ALPHA,
    [Uh]: i.ONE_MINUS_CONSTANT_ALPHA
  };
  function ht(I, se, oe, pe, te, Q, ge, Oe, at, Ze) {
    if (I === ti) {
      _ === !0 && (fe(i.BLEND), _ = !1);
      return;
    }
    if (_ === !1 && (J(i.BLEND), _ = !0), I !== _h) {
      if (I !== m || Ze !== S) {
        if ((f !== gi || y !== gi) && (i.blendEquation(i.FUNC_ADD), f = gi, y = gi), Ze)
          switch (I) {
            case Yi:
              i.blendFuncSeparate(i.ONE, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case Fo:
              i.blendFunc(i.ONE, i.ONE);
              break;
            case Oo:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case ko:
              i.blendFuncSeparate(i.DST_COLOR, i.ONE_MINUS_SRC_ALPHA, i.ZERO, i.ONE);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", I);
              break;
          }
        else
          switch (I) {
            case Yi:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case Fo:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE, i.ONE, i.ONE);
              break;
            case Oo:
              console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");
              break;
            case ko:
              console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", I);
              break;
          }
        T = null, b = null, w = null, R = null, P.set(0, 0, 0), O = 0, m = I, S = Ze;
      }
      return;
    }
    te = te || se, Q = Q || oe, ge = ge || pe, (se !== f || te !== y) && (i.blendEquationSeparate(kt[se], kt[te]), f = se, y = te), (oe !== T || pe !== b || Q !== w || ge !== R) && (i.blendFuncSeparate(C[oe], C[pe], C[Q], C[ge]), T = oe, b = pe, w = Q, R = ge), (Oe.equals(P) === !1 || at !== O) && (i.blendColor(Oe.r, Oe.g, Oe.b, at), P.copy(Oe), O = at), m = I, S = !1;
  }
  function ke(I, se) {
    I.side === rn ? fe(i.CULL_FACE) : J(i.CULL_FACE);
    let oe = I.side === Jt;
    se && (oe = !oe), Le(oe), I.blending === Yi && I.transparent === !1 ? ht(ti) : ht(I.blending, I.blendEquation, I.blendSrc, I.blendDst, I.blendEquationAlpha, I.blendSrcAlpha, I.blendDstAlpha, I.blendColor, I.blendAlpha, I.premultipliedAlpha), a.setFunc(I.depthFunc), a.setTest(I.depthTest), a.setMask(I.depthWrite), s.setMask(I.colorWrite);
    const pe = I.stencilWrite;
    o.setTest(pe), pe && (o.setMask(I.stencilWriteMask), o.setFunc(I.stencilFunc, I.stencilRef, I.stencilFuncMask), o.setOp(I.stencilFail, I.stencilZFail, I.stencilZPass)), ve(I.polygonOffset, I.polygonOffsetFactor, I.polygonOffsetUnits), I.alphaToCoverage === !0 ? J(i.SAMPLE_ALPHA_TO_COVERAGE) : fe(i.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function Le(I) {
    M !== I && (I ? i.frontFace(i.CW) : i.frontFace(i.CCW), M = I);
  }
  function _e(I) {
    I !== ph ? (J(i.CULL_FACE), I !== L && (I === No ? i.cullFace(i.BACK) : I === mh ? i.cullFace(i.FRONT) : i.cullFace(i.FRONT_AND_BACK))) : fe(i.CULL_FACE), L = I;
  }
  function dt(I) {
    I !== H && (U && i.lineWidth(I), H = I);
  }
  function ve(I, se, oe) {
    I ? (J(i.POLYGON_OFFSET_FILL), ($ !== se || Z !== oe) && (i.polygonOffset(se, oe), $ = se, Z = oe)) : fe(i.POLYGON_OFFSET_FILL);
  }
  function He(I) {
    I ? J(i.SCISSOR_TEST) : fe(i.SCISSOR_TEST);
  }
  function Ct(I) {
    I === void 0 && (I = i.TEXTURE0 + A - 1), F !== I && (i.activeTexture(I), F = I);
  }
  function xt(I, se, oe) {
    oe === void 0 && (F === null ? oe = i.TEXTURE0 + A - 1 : oe = F);
    let pe = X[oe];
    pe === void 0 && (pe = { type: void 0, texture: void 0 }, X[oe] = pe), (pe.type !== I || pe.texture !== se) && (F !== oe && (i.activeTexture(oe), F = oe), i.bindTexture(I, se || Y[I]), pe.type = I, pe.texture = se);
  }
  function E() {
    const I = X[F];
    I !== void 0 && I.type !== void 0 && (i.bindTexture(I.type, null), I.type = void 0, I.texture = void 0);
  }
  function v() {
    try {
      i.compressedTexImage2D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function z() {
    try {
      i.compressedTexImage3D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function K() {
    try {
      i.texSubImage2D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function ee() {
    try {
      i.texSubImage3D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function j() {
    try {
      i.compressedTexSubImage2D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function be() {
    try {
      i.compressedTexSubImage3D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function ae() {
    try {
      i.texStorage2D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function xe() {
    try {
      i.texStorage3D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function Se() {
    try {
      i.texImage2D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function re() {
    try {
      i.texImage3D(...arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function de(I) {
    Ke.equals(I) === !1 && (i.scissor(I.x, I.y, I.z, I.w), Ke.copy(I));
  }
  function De(I) {
    st.equals(I) === !1 && (i.viewport(I.x, I.y, I.z, I.w), st.copy(I));
  }
  function ye(I, se) {
    let oe = c.get(se);
    oe === void 0 && (oe = /* @__PURE__ */ new WeakMap(), c.set(se, oe));
    let pe = oe.get(I);
    pe === void 0 && (pe = i.getUniformBlockIndex(se, I.name), oe.set(I, pe));
  }
  function ce(I, se) {
    const pe = c.get(se).get(I);
    l.get(se) !== pe && (i.uniformBlockBinding(se, pe, I.__bindingPointIndex), l.set(se, pe));
  }
  function Be() {
    i.disable(i.BLEND), i.disable(i.CULL_FACE), i.disable(i.DEPTH_TEST), i.disable(i.POLYGON_OFFSET_FILL), i.disable(i.SCISSOR_TEST), i.disable(i.STENCIL_TEST), i.disable(i.SAMPLE_ALPHA_TO_COVERAGE), i.blendEquation(i.FUNC_ADD), i.blendFunc(i.ONE, i.ZERO), i.blendFuncSeparate(i.ONE, i.ZERO, i.ONE, i.ZERO), i.blendColor(0, 0, 0, 0), i.colorMask(!0, !0, !0, !0), i.clearColor(0, 0, 0, 0), i.depthMask(!0), i.depthFunc(i.LESS), a.setReversed(!1), i.clearDepth(1), i.stencilMask(4294967295), i.stencilFunc(i.ALWAYS, 0, 4294967295), i.stencilOp(i.KEEP, i.KEEP, i.KEEP), i.clearStencil(0), i.cullFace(i.BACK), i.frontFace(i.CCW), i.polygonOffset(0, 0), i.activeTexture(i.TEXTURE0), i.bindFramebuffer(i.FRAMEBUFFER, null), i.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), i.bindFramebuffer(i.READ_FRAMEBUFFER, null), i.useProgram(null), i.lineWidth(1), i.scissor(0, 0, i.canvas.width, i.canvas.height), i.viewport(0, 0, i.canvas.width, i.canvas.height), h = {}, F = null, X = {}, d = {}, u = /* @__PURE__ */ new WeakMap(), p = [], g = null, _ = !1, m = null, f = null, T = null, b = null, y = null, w = null, R = null, P = new Xe(0, 0, 0), O = 0, S = !1, M = null, L = null, H = null, $ = null, Z = null, Ke.set(0, 0, i.canvas.width, i.canvas.height), st.set(0, 0, i.canvas.width, i.canvas.height), s.reset(), a.reset(), o.reset();
  }
  return {
    buffers: {
      color: s,
      depth: a,
      stencil: o
    },
    enable: J,
    disable: fe,
    bindFramebuffer: Ae,
    drawBuffers: Me,
    useProgram: $e,
    setBlending: ht,
    setMaterial: ke,
    setFlipSided: Le,
    setCullFace: _e,
    setLineWidth: dt,
    setPolygonOffset: ve,
    setScissorTest: He,
    activeTexture: Ct,
    bindTexture: xt,
    unbindTexture: E,
    compressedTexImage2D: v,
    compressedTexImage3D: z,
    texImage2D: Se,
    texImage3D: re,
    updateUBOMapping: ye,
    uniformBlockBinding: ce,
    texStorage2D: ae,
    texStorage3D: xe,
    texSubImage2D: K,
    texSubImage3D: ee,
    compressedTexSubImage2D: j,
    compressedTexSubImage3D: be,
    scissor: de,
    viewport: De,
    reset: Be
  };
}
function Ng(i, e, t, n, r, s, a) {
  const o = e.has("WEBGL_multisampled_render_to_texture") ? e.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), c = new Ue(), h = /* @__PURE__ */ new WeakMap();
  let d;
  const u = /* @__PURE__ */ new WeakMap();
  let p = !1;
  try {
    p = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
  }
  function g(E, v) {
    return p ? (
      // eslint-disable-next-line compat/compat
      new OffscreenCanvas(E, v)
    ) : ms("canvas");
  }
  function _(E, v, z) {
    let K = 1;
    const ee = xt(E);
    if ((ee.width > z || ee.height > z) && (K = z / Math.max(ee.width, ee.height)), K < 1)
      if (typeof HTMLImageElement < "u" && E instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && E instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && E instanceof ImageBitmap || typeof VideoFrame < "u" && E instanceof VideoFrame) {
        const j = Math.floor(K * ee.width), be = Math.floor(K * ee.height);
        d === void 0 && (d = g(j, be));
        const ae = v ? g(j, be) : d;
        return ae.width = j, ae.height = be, ae.getContext("2d").drawImage(E, 0, 0, j, be), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + ee.width + "x" + ee.height + ") to (" + j + "x" + be + ")."), ae;
      } else
        return "data" in E && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + ee.width + "x" + ee.height + ")."), E;
    return E;
  }
  function m(E) {
    return E.generateMipmaps;
  }
  function f(E) {
    i.generateMipmap(E);
  }
  function T(E) {
    return E.isWebGLCubeRenderTarget ? i.TEXTURE_CUBE_MAP : E.isWebGL3DRenderTarget ? i.TEXTURE_3D : E.isWebGLArrayRenderTarget || E.isCompressedArrayTexture ? i.TEXTURE_2D_ARRAY : i.TEXTURE_2D;
  }
  function b(E, v, z, K, ee = !1) {
    if (E !== null) {
      if (i[E] !== void 0) return i[E];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + E + "'");
    }
    let j = v;
    if (v === i.RED && (z === i.FLOAT && (j = i.R32F), z === i.HALF_FLOAT && (j = i.R16F), z === i.UNSIGNED_BYTE && (j = i.R8)), v === i.RED_INTEGER && (z === i.UNSIGNED_BYTE && (j = i.R8UI), z === i.UNSIGNED_SHORT && (j = i.R16UI), z === i.UNSIGNED_INT && (j = i.R32UI), z === i.BYTE && (j = i.R8I), z === i.SHORT && (j = i.R16I), z === i.INT && (j = i.R32I)), v === i.RG && (z === i.FLOAT && (j = i.RG32F), z === i.HALF_FLOAT && (j = i.RG16F), z === i.UNSIGNED_BYTE && (j = i.RG8)), v === i.RG_INTEGER && (z === i.UNSIGNED_BYTE && (j = i.RG8UI), z === i.UNSIGNED_SHORT && (j = i.RG16UI), z === i.UNSIGNED_INT && (j = i.RG32UI), z === i.BYTE && (j = i.RG8I), z === i.SHORT && (j = i.RG16I), z === i.INT && (j = i.RG32I)), v === i.RGB_INTEGER && (z === i.UNSIGNED_BYTE && (j = i.RGB8UI), z === i.UNSIGNED_SHORT && (j = i.RGB16UI), z === i.UNSIGNED_INT && (j = i.RGB32UI), z === i.BYTE && (j = i.RGB8I), z === i.SHORT && (j = i.RGB16I), z === i.INT && (j = i.RGB32I)), v === i.RGBA_INTEGER && (z === i.UNSIGNED_BYTE && (j = i.RGBA8UI), z === i.UNSIGNED_SHORT && (j = i.RGBA16UI), z === i.UNSIGNED_INT && (j = i.RGBA32UI), z === i.BYTE && (j = i.RGBA8I), z === i.SHORT && (j = i.RGBA16I), z === i.INT && (j = i.RGBA32I)), v === i.RGB && (z === i.UNSIGNED_INT_5_9_9_9_REV && (j = i.RGB9_E5), z === i.UNSIGNED_INT_10F_11F_11F_REV && (j = i.R11F_G11F_B10F)), v === i.RGBA) {
      const be = ee ? fs : je.getTransfer(K);
      z === i.FLOAT && (j = i.RGBA32F), z === i.HALF_FLOAT && (j = i.RGBA16F), z === i.UNSIGNED_BYTE && (j = be === et ? i.SRGB8_ALPHA8 : i.RGBA8), z === i.UNSIGNED_SHORT_4_4_4_4 && (j = i.RGBA4), z === i.UNSIGNED_SHORT_5_5_5_1 && (j = i.RGB5_A1);
    }
    return (j === i.R16F || j === i.R32F || j === i.RG16F || j === i.RG32F || j === i.RGBA16F || j === i.RGBA32F) && e.get("EXT_color_buffer_float"), j;
  }
  function y(E, v) {
    let z;
    return E ? v === null || v === bi || v === Sr ? z = i.DEPTH24_STENCIL8 : v === Vn ? z = i.DEPTH32F_STENCIL8 : v === Mr && (z = i.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : v === null || v === bi || v === Sr ? z = i.DEPTH_COMPONENT24 : v === Vn ? z = i.DEPTH_COMPONENT32F : v === Mr && (z = i.DEPTH_COMPONENT16), z;
  }
  function w(E, v) {
    return m(E) === !0 || E.isFramebufferTexture && E.minFilter !== Mn && E.minFilter !== An ? Math.log2(Math.max(v.width, v.height)) + 1 : E.mipmaps !== void 0 && E.mipmaps.length > 0 ? E.mipmaps.length : E.isCompressedTexture && Array.isArray(E.image) ? v.mipmaps.length : 1;
  }
  function R(E) {
    const v = E.target;
    v.removeEventListener("dispose", R), O(v), v.isVideoTexture && h.delete(v);
  }
  function P(E) {
    const v = E.target;
    v.removeEventListener("dispose", P), M(v);
  }
  function O(E) {
    const v = n.get(E);
    if (v.__webglInit === void 0) return;
    const z = E.source, K = u.get(z);
    if (K) {
      const ee = K[v.__cacheKey];
      ee.usedTimes--, ee.usedTimes === 0 && S(E), Object.keys(K).length === 0 && u.delete(z);
    }
    n.remove(E);
  }
  function S(E) {
    const v = n.get(E);
    i.deleteTexture(v.__webglTexture);
    const z = E.source, K = u.get(z);
    delete K[v.__cacheKey], a.memory.textures--;
  }
  function M(E) {
    const v = n.get(E);
    if (E.depthTexture && (E.depthTexture.dispose(), n.remove(E.depthTexture)), E.isWebGLCubeRenderTarget)
      for (let K = 0; K < 6; K++) {
        if (Array.isArray(v.__webglFramebuffer[K]))
          for (let ee = 0; ee < v.__webglFramebuffer[K].length; ee++) i.deleteFramebuffer(v.__webglFramebuffer[K][ee]);
        else
          i.deleteFramebuffer(v.__webglFramebuffer[K]);
        v.__webglDepthbuffer && i.deleteRenderbuffer(v.__webglDepthbuffer[K]);
      }
    else {
      if (Array.isArray(v.__webglFramebuffer))
        for (let K = 0; K < v.__webglFramebuffer.length; K++) i.deleteFramebuffer(v.__webglFramebuffer[K]);
      else
        i.deleteFramebuffer(v.__webglFramebuffer);
      if (v.__webglDepthbuffer && i.deleteRenderbuffer(v.__webglDepthbuffer), v.__webglMultisampledFramebuffer && i.deleteFramebuffer(v.__webglMultisampledFramebuffer), v.__webglColorRenderbuffer)
        for (let K = 0; K < v.__webglColorRenderbuffer.length; K++)
          v.__webglColorRenderbuffer[K] && i.deleteRenderbuffer(v.__webglColorRenderbuffer[K]);
      v.__webglDepthRenderbuffer && i.deleteRenderbuffer(v.__webglDepthRenderbuffer);
    }
    const z = E.textures;
    for (let K = 0, ee = z.length; K < ee; K++) {
      const j = n.get(z[K]);
      j.__webglTexture && (i.deleteTexture(j.__webglTexture), a.memory.textures--), n.remove(z[K]);
    }
    n.remove(E);
  }
  let L = 0;
  function H() {
    L = 0;
  }
  function $() {
    const E = L;
    return E >= r.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + E + " texture units while this GPU supports only " + r.maxTextures), L += 1, E;
  }
  function Z(E) {
    const v = [];
    return v.push(E.wrapS), v.push(E.wrapT), v.push(E.wrapR || 0), v.push(E.magFilter), v.push(E.minFilter), v.push(E.anisotropy), v.push(E.internalFormat), v.push(E.format), v.push(E.type), v.push(E.generateMipmaps), v.push(E.premultiplyAlpha), v.push(E.flipY), v.push(E.unpackAlignment), v.push(E.colorSpace), v.join();
  }
  function A(E, v) {
    const z = n.get(E);
    if (E.isVideoTexture && He(E), E.isRenderTargetTexture === !1 && E.isExternalTexture !== !0 && E.version > 0 && z.__version !== E.version) {
      const K = E.image;
      if (K === null)
        console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if (K.complete === !1)
        console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        Y(z, E, v);
        return;
      }
    } else E.isExternalTexture && (z.__webglTexture = E.sourceTexture ? E.sourceTexture : null);
    t.bindTexture(i.TEXTURE_2D, z.__webglTexture, i.TEXTURE0 + v);
  }
  function U(E, v) {
    const z = n.get(E);
    if (E.isRenderTargetTexture === !1 && E.version > 0 && z.__version !== E.version) {
      Y(z, E, v);
      return;
    }
    t.bindTexture(i.TEXTURE_2D_ARRAY, z.__webglTexture, i.TEXTURE0 + v);
  }
  function V(E, v) {
    const z = n.get(E);
    if (E.isRenderTargetTexture === !1 && E.version > 0 && z.__version !== E.version) {
      Y(z, E, v);
      return;
    }
    t.bindTexture(i.TEXTURE_3D, z.__webglTexture, i.TEXTURE0 + v);
  }
  function D(E, v) {
    const z = n.get(E);
    if (E.version > 0 && z.__version !== E.version) {
      J(z, E, v);
      return;
    }
    t.bindTexture(i.TEXTURE_CUBE_MAP, z.__webglTexture, i.TEXTURE0 + v);
  }
  const F = {
    [ba]: i.REPEAT,
    [vi]: i.CLAMP_TO_EDGE,
    [Ea]: i.MIRRORED_REPEAT
  }, X = {
    [Mn]: i.NEAREST,
    [Wh]: i.NEAREST_MIPMAP_NEAREST,
    [Lr]: i.NEAREST_MIPMAP_LINEAR,
    [An]: i.LINEAR,
    [Cs]: i.LINEAR_MIPMAP_NEAREST,
    [xi]: i.LINEAR_MIPMAP_LINEAR
  }, ne = {
    [Yh]: i.NEVER,
    [ed]: i.ALWAYS,
    [jh]: i.LESS,
    [pc]: i.LEQUAL,
    [Kh]: i.EQUAL,
    [Qh]: i.GEQUAL,
    [Zh]: i.GREATER,
    [Jh]: i.NOTEQUAL
  };
  function Pe(E, v) {
    if (v.type === Vn && e.has("OES_texture_float_linear") === !1 && (v.magFilter === An || v.magFilter === Cs || v.magFilter === Lr || v.magFilter === xi || v.minFilter === An || v.minFilter === Cs || v.minFilter === Lr || v.minFilter === xi) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), i.texParameteri(E, i.TEXTURE_WRAP_S, F[v.wrapS]), i.texParameteri(E, i.TEXTURE_WRAP_T, F[v.wrapT]), (E === i.TEXTURE_3D || E === i.TEXTURE_2D_ARRAY) && i.texParameteri(E, i.TEXTURE_WRAP_R, F[v.wrapR]), i.texParameteri(E, i.TEXTURE_MAG_FILTER, X[v.magFilter]), i.texParameteri(E, i.TEXTURE_MIN_FILTER, X[v.minFilter]), v.compareFunction && (i.texParameteri(E, i.TEXTURE_COMPARE_MODE, i.COMPARE_REF_TO_TEXTURE), i.texParameteri(E, i.TEXTURE_COMPARE_FUNC, ne[v.compareFunction])), e.has("EXT_texture_filter_anisotropic") === !0) {
      if (v.magFilter === Mn || v.minFilter !== Lr && v.minFilter !== xi || v.type === Vn && e.has("OES_texture_float_linear") === !1) return;
      if (v.anisotropy > 1 || n.get(v).__currentAnisotropy) {
        const z = e.get("EXT_texture_filter_anisotropic");
        i.texParameterf(E, z.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(v.anisotropy, r.getMaxAnisotropy())), n.get(v).__currentAnisotropy = v.anisotropy;
      }
    }
  }
  function Ke(E, v) {
    let z = !1;
    E.__webglInit === void 0 && (E.__webglInit = !0, v.addEventListener("dispose", R));
    const K = v.source;
    let ee = u.get(K);
    ee === void 0 && (ee = {}, u.set(K, ee));
    const j = Z(v);
    if (j !== E.__cacheKey) {
      ee[j] === void 0 && (ee[j] = {
        texture: i.createTexture(),
        usedTimes: 0
      }, a.memory.textures++, z = !0), ee[j].usedTimes++;
      const be = ee[E.__cacheKey];
      be !== void 0 && (ee[E.__cacheKey].usedTimes--, be.usedTimes === 0 && S(v)), E.__cacheKey = j, E.__webglTexture = ee[j].texture;
    }
    return z;
  }
  function st(E, v, z) {
    return Math.floor(Math.floor(E / z) / v);
  }
  function qe(E, v, z, K) {
    const j = E.updateRanges;
    if (j.length === 0)
      t.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, v.width, v.height, z, K, v.data);
    else {
      j.sort((re, de) => re.start - de.start);
      let be = 0;
      for (let re = 1; re < j.length; re++) {
        const de = j[be], De = j[re], ye = de.start + de.count, ce = st(De.start, v.width, 4), Be = st(de.start, v.width, 4);
        De.start <= ye + 1 && ce === Be && st(De.start + De.count - 1, v.width, 4) === ce ? de.count = Math.max(
          de.count,
          De.start + De.count - de.start
        ) : (++be, j[be] = De);
      }
      j.length = be + 1;
      const ae = i.getParameter(i.UNPACK_ROW_LENGTH), xe = i.getParameter(i.UNPACK_SKIP_PIXELS), Se = i.getParameter(i.UNPACK_SKIP_ROWS);
      i.pixelStorei(i.UNPACK_ROW_LENGTH, v.width);
      for (let re = 0, de = j.length; re < de; re++) {
        const De = j[re], ye = Math.floor(De.start / 4), ce = Math.ceil(De.count / 4), Be = ye % v.width, I = Math.floor(ye / v.width), se = ce, oe = 1;
        i.pixelStorei(i.UNPACK_SKIP_PIXELS, Be), i.pixelStorei(i.UNPACK_SKIP_ROWS, I), t.texSubImage2D(i.TEXTURE_2D, 0, Be, I, se, oe, z, K, v.data);
      }
      E.clearUpdateRanges(), i.pixelStorei(i.UNPACK_ROW_LENGTH, ae), i.pixelStorei(i.UNPACK_SKIP_PIXELS, xe), i.pixelStorei(i.UNPACK_SKIP_ROWS, Se);
    }
  }
  function Y(E, v, z) {
    let K = i.TEXTURE_2D;
    (v.isDataArrayTexture || v.isCompressedArrayTexture) && (K = i.TEXTURE_2D_ARRAY), v.isData3DTexture && (K = i.TEXTURE_3D);
    const ee = Ke(E, v), j = v.source;
    t.bindTexture(K, E.__webglTexture, i.TEXTURE0 + z);
    const be = n.get(j);
    if (j.version !== be.__version || ee === !0) {
      t.activeTexture(i.TEXTURE0 + z);
      const ae = je.getPrimaries(je.workingColorSpace), xe = v.colorSpace === ei ? null : je.getPrimaries(v.colorSpace), Se = v.colorSpace === ei || ae === xe ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, v.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, v.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, v.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, Se);
      let re = _(v.image, !1, r.maxTextureSize);
      re = Ct(v, re);
      const de = s.convert(v.format, v.colorSpace), De = s.convert(v.type);
      let ye = b(v.internalFormat, de, De, v.colorSpace, v.isVideoTexture);
      Pe(K, v);
      let ce;
      const Be = v.mipmaps, I = v.isVideoTexture !== !0, se = be.__version === void 0 || ee === !0, oe = j.dataReady, pe = w(v, re);
      if (v.isDepthTexture)
        ye = y(v.format === br, v.type), se && (I ? t.texStorage2D(i.TEXTURE_2D, 1, ye, re.width, re.height) : t.texImage2D(i.TEXTURE_2D, 0, ye, re.width, re.height, 0, de, De, null));
      else if (v.isDataTexture)
        if (Be.length > 0) {
          I && se && t.texStorage2D(i.TEXTURE_2D, pe, ye, Be[0].width, Be[0].height);
          for (let te = 0, Q = Be.length; te < Q; te++)
            ce = Be[te], I ? oe && t.texSubImage2D(i.TEXTURE_2D, te, 0, 0, ce.width, ce.height, de, De, ce.data) : t.texImage2D(i.TEXTURE_2D, te, ye, ce.width, ce.height, 0, de, De, ce.data);
          v.generateMipmaps = !1;
        } else
          I ? (se && t.texStorage2D(i.TEXTURE_2D, pe, ye, re.width, re.height), oe && qe(v, re, de, De)) : t.texImage2D(i.TEXTURE_2D, 0, ye, re.width, re.height, 0, de, De, re.data);
      else if (v.isCompressedTexture)
        if (v.isCompressedArrayTexture) {
          I && se && t.texStorage3D(i.TEXTURE_2D_ARRAY, pe, ye, Be[0].width, Be[0].height, re.depth);
          for (let te = 0, Q = Be.length; te < Q; te++)
            if (ce = Be[te], v.format !== xn)
              if (de !== null)
                if (I) {
                  if (oe)
                    if (v.layerUpdates.size > 0) {
                      const ge = ml(ce.width, ce.height, v.format, v.type);
                      for (const Oe of v.layerUpdates) {
                        const at = ce.data.subarray(
                          Oe * ge / ce.data.BYTES_PER_ELEMENT,
                          (Oe + 1) * ge / ce.data.BYTES_PER_ELEMENT
                        );
                        t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, te, 0, 0, Oe, ce.width, ce.height, 1, de, at);
                      }
                      v.clearLayerUpdates();
                    } else
                      t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, te, 0, 0, 0, ce.width, ce.height, re.depth, de, ce.data);
                } else
                  t.compressedTexImage3D(i.TEXTURE_2D_ARRAY, te, ye, ce.width, ce.height, re.depth, 0, ce.data, 0, 0);
              else
                console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
            else
              I ? oe && t.texSubImage3D(i.TEXTURE_2D_ARRAY, te, 0, 0, 0, ce.width, ce.height, re.depth, de, De, ce.data) : t.texImage3D(i.TEXTURE_2D_ARRAY, te, ye, ce.width, ce.height, re.depth, 0, de, De, ce.data);
        } else {
          I && se && t.texStorage2D(i.TEXTURE_2D, pe, ye, Be[0].width, Be[0].height);
          for (let te = 0, Q = Be.length; te < Q; te++)
            ce = Be[te], v.format !== xn ? de !== null ? I ? oe && t.compressedTexSubImage2D(i.TEXTURE_2D, te, 0, 0, ce.width, ce.height, de, ce.data) : t.compressedTexImage2D(i.TEXTURE_2D, te, ye, ce.width, ce.height, 0, ce.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : I ? oe && t.texSubImage2D(i.TEXTURE_2D, te, 0, 0, ce.width, ce.height, de, De, ce.data) : t.texImage2D(i.TEXTURE_2D, te, ye, ce.width, ce.height, 0, de, De, ce.data);
        }
      else if (v.isDataArrayTexture)
        if (I) {
          if (se && t.texStorage3D(i.TEXTURE_2D_ARRAY, pe, ye, re.width, re.height, re.depth), oe)
            if (v.layerUpdates.size > 0) {
              const te = ml(re.width, re.height, v.format, v.type);
              for (const Q of v.layerUpdates) {
                const ge = re.data.subarray(
                  Q * te / re.data.BYTES_PER_ELEMENT,
                  (Q + 1) * te / re.data.BYTES_PER_ELEMENT
                );
                t.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, Q, re.width, re.height, 1, de, De, ge);
              }
              v.clearLayerUpdates();
            } else
              t.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, 0, re.width, re.height, re.depth, de, De, re.data);
        } else
          t.texImage3D(i.TEXTURE_2D_ARRAY, 0, ye, re.width, re.height, re.depth, 0, de, De, re.data);
      else if (v.isData3DTexture)
        I ? (se && t.texStorage3D(i.TEXTURE_3D, pe, ye, re.width, re.height, re.depth), oe && t.texSubImage3D(i.TEXTURE_3D, 0, 0, 0, 0, re.width, re.height, re.depth, de, De, re.data)) : t.texImage3D(i.TEXTURE_3D, 0, ye, re.width, re.height, re.depth, 0, de, De, re.data);
      else if (v.isFramebufferTexture) {
        if (se)
          if (I)
            t.texStorage2D(i.TEXTURE_2D, pe, ye, re.width, re.height);
          else {
            let te = re.width, Q = re.height;
            for (let ge = 0; ge < pe; ge++)
              t.texImage2D(i.TEXTURE_2D, ge, ye, te, Q, 0, de, De, null), te >>= 1, Q >>= 1;
          }
      } else if (Be.length > 0) {
        if (I && se) {
          const te = xt(Be[0]);
          t.texStorage2D(i.TEXTURE_2D, pe, ye, te.width, te.height);
        }
        for (let te = 0, Q = Be.length; te < Q; te++)
          ce = Be[te], I ? oe && t.texSubImage2D(i.TEXTURE_2D, te, 0, 0, de, De, ce) : t.texImage2D(i.TEXTURE_2D, te, ye, de, De, ce);
        v.generateMipmaps = !1;
      } else if (I) {
        if (se) {
          const te = xt(re);
          t.texStorage2D(i.TEXTURE_2D, pe, ye, te.width, te.height);
        }
        oe && t.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, de, De, re);
      } else
        t.texImage2D(i.TEXTURE_2D, 0, ye, de, De, re);
      m(v) && f(K), be.__version = j.version, v.onUpdate && v.onUpdate(v);
    }
    E.__version = v.version;
  }
  function J(E, v, z) {
    if (v.image.length !== 6) return;
    const K = Ke(E, v), ee = v.source;
    t.bindTexture(i.TEXTURE_CUBE_MAP, E.__webglTexture, i.TEXTURE0 + z);
    const j = n.get(ee);
    if (ee.version !== j.__version || K === !0) {
      t.activeTexture(i.TEXTURE0 + z);
      const be = je.getPrimaries(je.workingColorSpace), ae = v.colorSpace === ei ? null : je.getPrimaries(v.colorSpace), xe = v.colorSpace === ei || be === ae ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, v.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, v.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, v.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, xe);
      const Se = v.isCompressedTexture || v.image[0].isCompressedTexture, re = v.image[0] && v.image[0].isDataTexture, de = [];
      for (let Q = 0; Q < 6; Q++)
        !Se && !re ? de[Q] = _(v.image[Q], !0, r.maxCubemapSize) : de[Q] = re ? v.image[Q].image : v.image[Q], de[Q] = Ct(v, de[Q]);
      const De = de[0], ye = s.convert(v.format, v.colorSpace), ce = s.convert(v.type), Be = b(v.internalFormat, ye, ce, v.colorSpace), I = v.isVideoTexture !== !0, se = j.__version === void 0 || K === !0, oe = ee.dataReady;
      let pe = w(v, De);
      Pe(i.TEXTURE_CUBE_MAP, v);
      let te;
      if (Se) {
        I && se && t.texStorage2D(i.TEXTURE_CUBE_MAP, pe, Be, De.width, De.height);
        for (let Q = 0; Q < 6; Q++) {
          te = de[Q].mipmaps;
          for (let ge = 0; ge < te.length; ge++) {
            const Oe = te[ge];
            v.format !== xn ? ye !== null ? I ? oe && t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ge, 0, 0, Oe.width, Oe.height, ye, Oe.data) : t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ge, Be, Oe.width, Oe.height, 0, Oe.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : I ? oe && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ge, 0, 0, Oe.width, Oe.height, ye, ce, Oe.data) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ge, Be, Oe.width, Oe.height, 0, ye, ce, Oe.data);
          }
        }
      } else {
        if (te = v.mipmaps, I && se) {
          te.length > 0 && pe++;
          const Q = xt(de[0]);
          t.texStorage2D(i.TEXTURE_CUBE_MAP, pe, Be, Q.width, Q.height);
        }
        for (let Q = 0; Q < 6; Q++)
          if (re) {
            I ? oe && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, 0, 0, 0, de[Q].width, de[Q].height, ye, ce, de[Q].data) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, 0, Be, de[Q].width, de[Q].height, 0, ye, ce, de[Q].data);
            for (let ge = 0; ge < te.length; ge++) {
              const at = te[ge].image[Q].image;
              I ? oe && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ge + 1, 0, 0, at.width, at.height, ye, ce, at.data) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ge + 1, Be, at.width, at.height, 0, ye, ce, at.data);
            }
          } else {
            I ? oe && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, 0, 0, 0, ye, ce, de[Q]) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, 0, Be, ye, ce, de[Q]);
            for (let ge = 0; ge < te.length; ge++) {
              const Oe = te[ge];
              I ? oe && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ge + 1, 0, 0, ye, ce, Oe.image[Q]) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Q, ge + 1, Be, ye, ce, Oe.image[Q]);
            }
          }
      }
      m(v) && f(i.TEXTURE_CUBE_MAP), j.__version = ee.version, v.onUpdate && v.onUpdate(v);
    }
    E.__version = v.version;
  }
  function fe(E, v, z, K, ee, j) {
    const be = s.convert(z.format, z.colorSpace), ae = s.convert(z.type), xe = b(z.internalFormat, be, ae, z.colorSpace), Se = n.get(v), re = n.get(z);
    if (re.__renderTarget = v, !Se.__hasExternalTextures) {
      const de = Math.max(1, v.width >> j), De = Math.max(1, v.height >> j);
      ee === i.TEXTURE_3D || ee === i.TEXTURE_2D_ARRAY ? t.texImage3D(ee, j, xe, de, De, v.depth, 0, be, ae, null) : t.texImage2D(ee, j, xe, de, De, 0, be, ae, null);
    }
    t.bindFramebuffer(i.FRAMEBUFFER, E), ve(v) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, K, ee, re.__webglTexture, 0, dt(v)) : (ee === i.TEXTURE_2D || ee >= i.TEXTURE_CUBE_MAP_POSITIVE_X && ee <= i.TEXTURE_CUBE_MAP_NEGATIVE_Z) && i.framebufferTexture2D(i.FRAMEBUFFER, K, ee, re.__webglTexture, j), t.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function Ae(E, v, z) {
    if (i.bindRenderbuffer(i.RENDERBUFFER, E), v.depthBuffer) {
      const K = v.depthTexture, ee = K && K.isDepthTexture ? K.type : null, j = y(v.stencilBuffer, ee), be = v.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, ae = dt(v);
      ve(v) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, ae, j, v.width, v.height) : z ? i.renderbufferStorageMultisample(i.RENDERBUFFER, ae, j, v.width, v.height) : i.renderbufferStorage(i.RENDERBUFFER, j, v.width, v.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, be, i.RENDERBUFFER, E);
    } else {
      const K = v.textures;
      for (let ee = 0; ee < K.length; ee++) {
        const j = K[ee], be = s.convert(j.format, j.colorSpace), ae = s.convert(j.type), xe = b(j.internalFormat, be, ae, j.colorSpace), Se = dt(v);
        z && ve(v) === !1 ? i.renderbufferStorageMultisample(i.RENDERBUFFER, Se, xe, v.width, v.height) : ve(v) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, Se, xe, v.width, v.height) : i.renderbufferStorage(i.RENDERBUFFER, xe, v.width, v.height);
      }
    }
    i.bindRenderbuffer(i.RENDERBUFFER, null);
  }
  function Me(E, v) {
    if (v && v.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (t.bindFramebuffer(i.FRAMEBUFFER, E), !(v.depthTexture && v.depthTexture.isDepthTexture))
      throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    const K = n.get(v.depthTexture);
    K.__renderTarget = v, (!K.__webglTexture || v.depthTexture.image.width !== v.width || v.depthTexture.image.height !== v.height) && (v.depthTexture.image.width = v.width, v.depthTexture.image.height = v.height, v.depthTexture.needsUpdate = !0), A(v.depthTexture, 0);
    const ee = K.__webglTexture, j = dt(v);
    if (v.depthTexture.format === yr)
      ve(v) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, ee, 0, j) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, ee, 0);
    else if (v.depthTexture.format === br)
      ve(v) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, ee, 0, j) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, ee, 0);
    else
      throw new Error("Unknown depthTexture format");
  }
  function $e(E) {
    const v = n.get(E), z = E.isWebGLCubeRenderTarget === !0;
    if (v.__boundDepthTexture !== E.depthTexture) {
      const K = E.depthTexture;
      if (v.__depthDisposeCallback && v.__depthDisposeCallback(), K) {
        const ee = () => {
          delete v.__boundDepthTexture, delete v.__depthDisposeCallback, K.removeEventListener("dispose", ee);
        };
        K.addEventListener("dispose", ee), v.__depthDisposeCallback = ee;
      }
      v.__boundDepthTexture = K;
    }
    if (E.depthTexture && !v.__autoAllocateDepthBuffer) {
      if (z) throw new Error("target.depthTexture not supported in Cube render targets");
      const K = E.texture.mipmaps;
      K && K.length > 0 ? Me(v.__webglFramebuffer[0], E) : Me(v.__webglFramebuffer, E);
    } else if (z) {
      v.__webglDepthbuffer = [];
      for (let K = 0; K < 6; K++)
        if (t.bindFramebuffer(i.FRAMEBUFFER, v.__webglFramebuffer[K]), v.__webglDepthbuffer[K] === void 0)
          v.__webglDepthbuffer[K] = i.createRenderbuffer(), Ae(v.__webglDepthbuffer[K], E, !1);
        else {
          const ee = E.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, j = v.__webglDepthbuffer[K];
          i.bindRenderbuffer(i.RENDERBUFFER, j), i.framebufferRenderbuffer(i.FRAMEBUFFER, ee, i.RENDERBUFFER, j);
        }
    } else {
      const K = E.texture.mipmaps;
      if (K && K.length > 0 ? t.bindFramebuffer(i.FRAMEBUFFER, v.__webglFramebuffer[0]) : t.bindFramebuffer(i.FRAMEBUFFER, v.__webglFramebuffer), v.__webglDepthbuffer === void 0)
        v.__webglDepthbuffer = i.createRenderbuffer(), Ae(v.__webglDepthbuffer, E, !1);
      else {
        const ee = E.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, j = v.__webglDepthbuffer;
        i.bindRenderbuffer(i.RENDERBUFFER, j), i.framebufferRenderbuffer(i.FRAMEBUFFER, ee, i.RENDERBUFFER, j);
      }
    }
    t.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function kt(E, v, z) {
    const K = n.get(E);
    v !== void 0 && fe(K.__webglFramebuffer, E, E.texture, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, 0), z !== void 0 && $e(E);
  }
  function C(E) {
    const v = E.texture, z = n.get(E), K = n.get(v);
    E.addEventListener("dispose", P);
    const ee = E.textures, j = E.isWebGLCubeRenderTarget === !0, be = ee.length > 1;
    if (be || (K.__webglTexture === void 0 && (K.__webglTexture = i.createTexture()), K.__version = v.version, a.memory.textures++), j) {
      z.__webglFramebuffer = [];
      for (let ae = 0; ae < 6; ae++)
        if (v.mipmaps && v.mipmaps.length > 0) {
          z.__webglFramebuffer[ae] = [];
          for (let xe = 0; xe < v.mipmaps.length; xe++)
            z.__webglFramebuffer[ae][xe] = i.createFramebuffer();
        } else
          z.__webglFramebuffer[ae] = i.createFramebuffer();
    } else {
      if (v.mipmaps && v.mipmaps.length > 0) {
        z.__webglFramebuffer = [];
        for (let ae = 0; ae < v.mipmaps.length; ae++)
          z.__webglFramebuffer[ae] = i.createFramebuffer();
      } else
        z.__webglFramebuffer = i.createFramebuffer();
      if (be)
        for (let ae = 0, xe = ee.length; ae < xe; ae++) {
          const Se = n.get(ee[ae]);
          Se.__webglTexture === void 0 && (Se.__webglTexture = i.createTexture(), a.memory.textures++);
        }
      if (E.samples > 0 && ve(E) === !1) {
        z.__webglMultisampledFramebuffer = i.createFramebuffer(), z.__webglColorRenderbuffer = [], t.bindFramebuffer(i.FRAMEBUFFER, z.__webglMultisampledFramebuffer);
        for (let ae = 0; ae < ee.length; ae++) {
          const xe = ee[ae];
          z.__webglColorRenderbuffer[ae] = i.createRenderbuffer(), i.bindRenderbuffer(i.RENDERBUFFER, z.__webglColorRenderbuffer[ae]);
          const Se = s.convert(xe.format, xe.colorSpace), re = s.convert(xe.type), de = b(xe.internalFormat, Se, re, xe.colorSpace, E.isXRRenderTarget === !0), De = dt(E);
          i.renderbufferStorageMultisample(i.RENDERBUFFER, De, de, E.width, E.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + ae, i.RENDERBUFFER, z.__webglColorRenderbuffer[ae]);
        }
        i.bindRenderbuffer(i.RENDERBUFFER, null), E.depthBuffer && (z.__webglDepthRenderbuffer = i.createRenderbuffer(), Ae(z.__webglDepthRenderbuffer, E, !0)), t.bindFramebuffer(i.FRAMEBUFFER, null);
      }
    }
    if (j) {
      t.bindTexture(i.TEXTURE_CUBE_MAP, K.__webglTexture), Pe(i.TEXTURE_CUBE_MAP, v);
      for (let ae = 0; ae < 6; ae++)
        if (v.mipmaps && v.mipmaps.length > 0)
          for (let xe = 0; xe < v.mipmaps.length; xe++)
            fe(z.__webglFramebuffer[ae][xe], E, v, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + ae, xe);
        else
          fe(z.__webglFramebuffer[ae], E, v, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + ae, 0);
      m(v) && f(i.TEXTURE_CUBE_MAP), t.unbindTexture();
    } else if (be) {
      for (let ae = 0, xe = ee.length; ae < xe; ae++) {
        const Se = ee[ae], re = n.get(Se);
        let de = i.TEXTURE_2D;
        (E.isWebGL3DRenderTarget || E.isWebGLArrayRenderTarget) && (de = E.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY), t.bindTexture(de, re.__webglTexture), Pe(de, Se), fe(z.__webglFramebuffer, E, Se, i.COLOR_ATTACHMENT0 + ae, de, 0), m(Se) && f(de);
      }
      t.unbindTexture();
    } else {
      let ae = i.TEXTURE_2D;
      if ((E.isWebGL3DRenderTarget || E.isWebGLArrayRenderTarget) && (ae = E.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY), t.bindTexture(ae, K.__webglTexture), Pe(ae, v), v.mipmaps && v.mipmaps.length > 0)
        for (let xe = 0; xe < v.mipmaps.length; xe++)
          fe(z.__webglFramebuffer[xe], E, v, i.COLOR_ATTACHMENT0, ae, xe);
      else
        fe(z.__webglFramebuffer, E, v, i.COLOR_ATTACHMENT0, ae, 0);
      m(v) && f(ae), t.unbindTexture();
    }
    E.depthBuffer && $e(E);
  }
  function ht(E) {
    const v = E.textures;
    for (let z = 0, K = v.length; z < K; z++) {
      const ee = v[z];
      if (m(ee)) {
        const j = T(E), be = n.get(ee).__webglTexture;
        t.bindTexture(j, be), f(j), t.unbindTexture();
      }
    }
  }
  const ke = [], Le = [];
  function _e(E) {
    if (E.samples > 0) {
      if (ve(E) === !1) {
        const v = E.textures, z = E.width, K = E.height;
        let ee = i.COLOR_BUFFER_BIT;
        const j = E.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, be = n.get(E), ae = v.length > 1;
        if (ae)
          for (let Se = 0; Se < v.length; Se++)
            t.bindFramebuffer(i.FRAMEBUFFER, be.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + Se, i.RENDERBUFFER, null), t.bindFramebuffer(i.FRAMEBUFFER, be.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + Se, i.TEXTURE_2D, null, 0);
        t.bindFramebuffer(i.READ_FRAMEBUFFER, be.__webglMultisampledFramebuffer);
        const xe = E.texture.mipmaps;
        xe && xe.length > 0 ? t.bindFramebuffer(i.DRAW_FRAMEBUFFER, be.__webglFramebuffer[0]) : t.bindFramebuffer(i.DRAW_FRAMEBUFFER, be.__webglFramebuffer);
        for (let Se = 0; Se < v.length; Se++) {
          if (E.resolveDepthBuffer && (E.depthBuffer && (ee |= i.DEPTH_BUFFER_BIT), E.stencilBuffer && E.resolveStencilBuffer && (ee |= i.STENCIL_BUFFER_BIT)), ae) {
            i.framebufferRenderbuffer(i.READ_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.RENDERBUFFER, be.__webglColorRenderbuffer[Se]);
            const re = n.get(v[Se]).__webglTexture;
            i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, re, 0);
          }
          i.blitFramebuffer(0, 0, z, K, 0, 0, z, K, ee, i.NEAREST), l === !0 && (ke.length = 0, Le.length = 0, ke.push(i.COLOR_ATTACHMENT0 + Se), E.depthBuffer && E.resolveDepthBuffer === !1 && (ke.push(j), Le.push(j), i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, Le)), i.invalidateFramebuffer(i.READ_FRAMEBUFFER, ke));
        }
        if (t.bindFramebuffer(i.READ_FRAMEBUFFER, null), t.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), ae)
          for (let Se = 0; Se < v.length; Se++) {
            t.bindFramebuffer(i.FRAMEBUFFER, be.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + Se, i.RENDERBUFFER, be.__webglColorRenderbuffer[Se]);
            const re = n.get(v[Se]).__webglTexture;
            t.bindFramebuffer(i.FRAMEBUFFER, be.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + Se, i.TEXTURE_2D, re, 0);
          }
        t.bindFramebuffer(i.DRAW_FRAMEBUFFER, be.__webglMultisampledFramebuffer);
      } else if (E.depthBuffer && E.resolveDepthBuffer === !1 && l) {
        const v = E.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT;
        i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, [v]);
      }
    }
  }
  function dt(E) {
    return Math.min(r.maxSamples, E.samples);
  }
  function ve(E) {
    const v = n.get(E);
    return E.samples > 0 && e.has("WEBGL_multisampled_render_to_texture") === !0 && v.__useRenderToTexture !== !1;
  }
  function He(E) {
    const v = a.render.frame;
    h.get(E) !== v && (h.set(E, v), E.update());
  }
  function Ct(E, v) {
    const z = E.colorSpace, K = E.format, ee = E.type;
    return E.isCompressedTexture === !0 || E.isVideoTexture === !0 || z !== tr && z !== ei && (je.getTransfer(z) === et ? (K !== xn || ee !== Ln) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", z)), v;
  }
  function xt(E) {
    return typeof HTMLImageElement < "u" && E instanceof HTMLImageElement ? (c.width = E.naturalWidth || E.width, c.height = E.naturalHeight || E.height) : typeof VideoFrame < "u" && E instanceof VideoFrame ? (c.width = E.displayWidth, c.height = E.displayHeight) : (c.width = E.width, c.height = E.height), c;
  }
  this.allocateTextureUnit = $, this.resetTextureUnits = H, this.setTexture2D = A, this.setTexture2DArray = U, this.setTexture3D = V, this.setTextureCube = D, this.rebindTextures = kt, this.setupRenderTarget = C, this.updateRenderTargetMipmap = ht, this.updateMultisampleRenderTarget = _e, this.setupDepthRenderbuffer = $e, this.setupFrameBufferTexture = fe, this.useMultisampledRTT = ve;
}
function Fg(i, e) {
  function t(n, r = ei) {
    let s;
    const a = je.getTransfer(r);
    if (n === Ln) return i.UNSIGNED_BYTE;
    if (n === ao) return i.UNSIGNED_SHORT_4_4_4_4;
    if (n === oo) return i.UNSIGNED_SHORT_5_5_5_1;
    if (n === oc) return i.UNSIGNED_INT_5_9_9_9_REV;
    if (n === lc) return i.UNSIGNED_INT_10F_11F_11F_REV;
    if (n === sc) return i.BYTE;
    if (n === ac) return i.SHORT;
    if (n === Mr) return i.UNSIGNED_SHORT;
    if (n === so) return i.INT;
    if (n === bi) return i.UNSIGNED_INT;
    if (n === Vn) return i.FLOAT;
    if (n === Ar) return i.HALF_FLOAT;
    if (n === cc) return i.ALPHA;
    if (n === hc) return i.RGB;
    if (n === xn) return i.RGBA;
    if (n === yr) return i.DEPTH_COMPONENT;
    if (n === br) return i.DEPTH_STENCIL;
    if (n === dc) return i.RED;
    if (n === lo) return i.RED_INTEGER;
    if (n === uc) return i.RG;
    if (n === co) return i.RG_INTEGER;
    if (n === ho) return i.RGBA_INTEGER;
    if (n === ls || n === cs || n === hs || n === ds)
      if (a === et)
        if (s = e.get("WEBGL_compressed_texture_s3tc_srgb"), s !== null) {
          if (n === ls) return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (n === cs) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (n === hs) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (n === ds) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else
          return null;
      else if (s = e.get("WEBGL_compressed_texture_s3tc"), s !== null) {
        if (n === ls) return s.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (n === cs) return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (n === hs) return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (n === ds) return s.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else
        return null;
    if (n === wa || n === Ta || n === Aa || n === Ra)
      if (s = e.get("WEBGL_compressed_texture_pvrtc"), s !== null) {
        if (n === wa) return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === Ta) return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === Aa) return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === Ra) return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else
        return null;
    if (n === Ca || n === Pa || n === Da)
      if (s = e.get("WEBGL_compressed_texture_etc"), s !== null) {
        if (n === Ca || n === Pa) return a === et ? s.COMPRESSED_SRGB8_ETC2 : s.COMPRESSED_RGB8_ETC2;
        if (n === Da) return a === et ? s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : s.COMPRESSED_RGBA8_ETC2_EAC;
      } else
        return null;
    if (n === La || n === Ia || n === Ua || n === Na || n === Fa || n === Oa || n === ka || n === Ba || n === za || n === Ha || n === Va || n === Ga || n === Wa || n === $a)
      if (s = e.get("WEBGL_compressed_texture_astc"), s !== null) {
        if (n === La) return a === et ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : s.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === Ia) return a === et ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : s.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === Ua) return a === et ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : s.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === Na) return a === et ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : s.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === Fa) return a === et ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : s.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === Oa) return a === et ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : s.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === ka) return a === et ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : s.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === Ba) return a === et ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : s.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === za) return a === et ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : s.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === Ha) return a === et ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : s.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === Va) return a === et ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : s.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === Ga) return a === et ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : s.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === Wa) return a === et ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : s.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === $a) return a === et ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : s.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else
        return null;
    if (n === Xa || n === qa || n === Ya)
      if (s = e.get("EXT_texture_compression_bptc"), s !== null) {
        if (n === Xa) return a === et ? s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : s.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === qa) return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === Ya) return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else
        return null;
    if (n === ja || n === Ka || n === Za || n === Ja)
      if (s = e.get("EXT_texture_compression_rgtc"), s !== null) {
        if (n === ja) return s.COMPRESSED_RED_RGTC1_EXT;
        if (n === Ka) return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === Za) return s.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === Ja) return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else
        return null;
    return n === Sr ? i.UNSIGNED_INT_24_8 : i[n] !== void 0 ? i[n] : null;
  }
  return { convert: t };
}
const Og = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, kg = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;
class Bg {
  /**
   * Constructs a new depth sensing module.
   */
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
  }
  /**
   * Inits the depth sensing module
   *
   * @param {XRWebGLDepthInformation} depthData - The XR depth data.
   * @param {XRRenderState} renderState - The XR render state.
   */
  init(e, t) {
    if (this.texture === null) {
      const n = new Tc(e.texture);
      (e.depthNear !== t.depthNear || e.depthFar !== t.depthFar) && (this.depthNear = e.depthNear, this.depthFar = e.depthFar), this.texture = n;
    }
  }
  /**
   * Returns a plane mesh that visualizes the depth texture.
   *
   * @param {ArrayCamera} cameraXR - The XR camera.
   * @return {?Mesh} The plane mesh.
   */
  getMesh(e) {
    if (this.texture !== null && this.mesh === null) {
      const t = e.cameras[0].viewport, n = new ri({
        vertexShader: Og,
        fragmentShader: kg,
        uniforms: {
          depthColor: { value: this.texture },
          depthWidth: { value: t.z },
          depthHeight: { value: t.w }
        }
      });
      this.mesh = new Ot(new si(20, 20), n);
    }
    return this.mesh;
  }
  /**
   * Resets the module
   */
  reset() {
    this.texture = null, this.mesh = null;
  }
  /**
   * Returns a texture representing the depth of the user's environment.
   *
   * @return {?ExternalTexture} The depth texture.
   */
  getDepthTexture() {
    return this.texture;
  }
}
class zg extends Ti {
  /**
   * Constructs a new WebGL renderer.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGL2RenderingContext} gl - The rendering context.
   */
  constructor(e, t) {
    super();
    const n = this;
    let r = null, s = 1, a = null, o = "local-floor", l = 1, c = null, h = null, d = null, u = null, p = null, g = null;
    const _ = typeof XRWebGLBinding < "u", m = new Bg(), f = {}, T = t.getContextAttributes();
    let b = null, y = null;
    const w = [], R = [], P = new Ue();
    let O = null;
    const S = new hn();
    S.viewport = new vt();
    const M = new hn();
    M.viewport = new vt();
    const L = [S, M], H = new ru();
    let $ = null, Z = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(Y) {
      let J = w[Y];
      return J === void 0 && (J = new Ks(), w[Y] = J), J.getTargetRaySpace();
    }, this.getControllerGrip = function(Y) {
      let J = w[Y];
      return J === void 0 && (J = new Ks(), w[Y] = J), J.getGripSpace();
    }, this.getHand = function(Y) {
      let J = w[Y];
      return J === void 0 && (J = new Ks(), w[Y] = J), J.getHandSpace();
    };
    function A(Y) {
      const J = R.indexOf(Y.inputSource);
      if (J === -1)
        return;
      const fe = w[J];
      fe !== void 0 && (fe.update(Y.inputSource, Y.frame, c || a), fe.dispatchEvent({ type: Y.type, data: Y.inputSource }));
    }
    function U() {
      r.removeEventListener("select", A), r.removeEventListener("selectstart", A), r.removeEventListener("selectend", A), r.removeEventListener("squeeze", A), r.removeEventListener("squeezestart", A), r.removeEventListener("squeezeend", A), r.removeEventListener("end", U), r.removeEventListener("inputsourceschange", V);
      for (let Y = 0; Y < w.length; Y++) {
        const J = R[Y];
        J !== null && (R[Y] = null, w[Y].disconnect(J));
      }
      $ = null, Z = null, m.reset();
      for (const Y in f)
        delete f[Y];
      e.setRenderTarget(b), p = null, u = null, d = null, r = null, y = null, qe.stop(), n.isPresenting = !1, e.setPixelRatio(O), e.setSize(P.width, P.height, !1), n.dispatchEvent({ type: "sessionend" });
    }
    this.setFramebufferScaleFactor = function(Y) {
      s = Y, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function(Y) {
      o = Y, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function() {
      return c || a;
    }, this.setReferenceSpace = function(Y) {
      c = Y;
    }, this.getBaseLayer = function() {
      return u !== null ? u : p;
    }, this.getBinding = function() {
      return d === null && _ && (d = new XRWebGLBinding(r, t)), d;
    }, this.getFrame = function() {
      return g;
    }, this.getSession = function() {
      return r;
    }, this.setSession = async function(Y) {
      if (r = Y, r !== null) {
        if (b = e.getRenderTarget(), r.addEventListener("select", A), r.addEventListener("selectstart", A), r.addEventListener("selectend", A), r.addEventListener("squeeze", A), r.addEventListener("squeezestart", A), r.addEventListener("squeezeend", A), r.addEventListener("end", U), r.addEventListener("inputsourceschange", V), T.xrCompatible !== !0 && await t.makeXRCompatible(), O = e.getPixelRatio(), e.getSize(P), _ && "createProjectionLayer" in XRWebGLBinding.prototype) {
          let fe = null, Ae = null, Me = null;
          T.depth && (Me = T.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, fe = T.stencil ? br : yr, Ae = T.stencil ? Sr : bi);
          const $e = {
            colorFormat: t.RGBA8,
            depthFormat: Me,
            scaleFactor: s
          };
          d = this.getBinding(), u = d.createProjectionLayer($e), r.updateRenderState({ layers: [u] }), e.setPixelRatio(1), e.setSize(u.textureWidth, u.textureHeight, !1), y = new wi(
            u.textureWidth,
            u.textureHeight,
            {
              format: xn,
              type: Ln,
              depthTexture: new wc(u.textureWidth, u.textureHeight, Ae, void 0, void 0, void 0, void 0, void 0, void 0, fe),
              stencilBuffer: T.stencil,
              colorSpace: e.outputColorSpace,
              samples: T.antialias ? 4 : 0,
              resolveDepthBuffer: u.ignoreDepthValues === !1,
              resolveStencilBuffer: u.ignoreDepthValues === !1
            }
          );
        } else {
          const fe = {
            antialias: T.antialias,
            alpha: !0,
            depth: T.depth,
            stencil: T.stencil,
            framebufferScaleFactor: s
          };
          p = new XRWebGLLayer(r, t, fe), r.updateRenderState({ baseLayer: p }), e.setPixelRatio(1), e.setSize(p.framebufferWidth, p.framebufferHeight, !1), y = new wi(
            p.framebufferWidth,
            p.framebufferHeight,
            {
              format: xn,
              type: Ln,
              colorSpace: e.outputColorSpace,
              stencilBuffer: T.stencil,
              resolveDepthBuffer: p.ignoreDepthValues === !1,
              resolveStencilBuffer: p.ignoreDepthValues === !1
            }
          );
        }
        y.isXRRenderTarget = !0, this.setFoveation(l), c = null, a = await r.requestReferenceSpace(o), qe.setContext(r), qe.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (r !== null)
        return r.environmentBlendMode;
    }, this.getDepthTexture = function() {
      return m.getDepthTexture();
    };
    function V(Y) {
      for (let J = 0; J < Y.removed.length; J++) {
        const fe = Y.removed[J], Ae = R.indexOf(fe);
        Ae >= 0 && (R[Ae] = null, w[Ae].disconnect(fe));
      }
      for (let J = 0; J < Y.added.length; J++) {
        const fe = Y.added[J];
        let Ae = R.indexOf(fe);
        if (Ae === -1) {
          for (let $e = 0; $e < w.length; $e++)
            if ($e >= R.length) {
              R.push(fe), Ae = $e;
              break;
            } else if (R[$e] === null) {
              R[$e] = fe, Ae = $e;
              break;
            }
          if (Ae === -1) break;
        }
        const Me = w[Ae];
        Me && Me.connect(fe);
      }
    }
    const D = new N(), F = new N();
    function X(Y, J, fe) {
      D.setFromMatrixPosition(J.matrixWorld), F.setFromMatrixPosition(fe.matrixWorld);
      const Ae = D.distanceTo(F), Me = J.projectionMatrix.elements, $e = fe.projectionMatrix.elements, kt = Me[14] / (Me[10] - 1), C = Me[14] / (Me[10] + 1), ht = (Me[9] + 1) / Me[5], ke = (Me[9] - 1) / Me[5], Le = (Me[8] - 1) / Me[0], _e = ($e[8] + 1) / $e[0], dt = kt * Le, ve = kt * _e, He = Ae / (-Le + _e), Ct = He * -Le;
      if (J.matrixWorld.decompose(Y.position, Y.quaternion, Y.scale), Y.translateX(Ct), Y.translateZ(He), Y.matrixWorld.compose(Y.position, Y.quaternion, Y.scale), Y.matrixWorldInverse.copy(Y.matrixWorld).invert(), Me[10] === -1)
        Y.projectionMatrix.copy(J.projectionMatrix), Y.projectionMatrixInverse.copy(J.projectionMatrixInverse);
      else {
        const xt = kt + He, E = C + He, v = dt - Ct, z = ve + (Ae - Ct), K = ht * C / E * xt, ee = ke * C / E * xt;
        Y.projectionMatrix.makePerspective(v, z, K, ee, xt, E), Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert();
      }
    }
    function ne(Y, J) {
      J === null ? Y.matrixWorld.copy(Y.matrix) : Y.matrixWorld.multiplyMatrices(J.matrixWorld, Y.matrix), Y.matrixWorldInverse.copy(Y.matrixWorld).invert();
    }
    this.updateCamera = function(Y) {
      if (r === null) return;
      let J = Y.near, fe = Y.far;
      m.texture !== null && (m.depthNear > 0 && (J = m.depthNear), m.depthFar > 0 && (fe = m.depthFar)), H.near = M.near = S.near = J, H.far = M.far = S.far = fe, ($ !== H.near || Z !== H.far) && (r.updateRenderState({
        depthNear: H.near,
        depthFar: H.far
      }), $ = H.near, Z = H.far), H.layers.mask = Y.layers.mask | 6, S.layers.mask = H.layers.mask & 3, M.layers.mask = H.layers.mask & 5;
      const Ae = Y.parent, Me = H.cameras;
      ne(H, Ae);
      for (let $e = 0; $e < Me.length; $e++)
        ne(Me[$e], Ae);
      Me.length === 2 ? X(H, S, M) : H.projectionMatrix.copy(S.projectionMatrix), Pe(Y, H, Ae);
    };
    function Pe(Y, J, fe) {
      fe === null ? Y.matrix.copy(J.matrixWorld) : (Y.matrix.copy(fe.matrixWorld), Y.matrix.invert(), Y.matrix.multiply(J.matrixWorld)), Y.matrix.decompose(Y.position, Y.quaternion, Y.scale), Y.updateMatrixWorld(!0), Y.projectionMatrix.copy(J.projectionMatrix), Y.projectionMatrixInverse.copy(J.projectionMatrixInverse), Y.isPerspectiveCamera && (Y.fov = Er * 2 * Math.atan(1 / Y.projectionMatrix.elements[5]), Y.zoom = 1);
    }
    this.getCamera = function() {
      return H;
    }, this.getFoveation = function() {
      if (!(u === null && p === null))
        return l;
    }, this.setFoveation = function(Y) {
      l = Y, u !== null && (u.fixedFoveation = Y), p !== null && p.fixedFoveation !== void 0 && (p.fixedFoveation = Y);
    }, this.hasDepthSensing = function() {
      return m.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return m.getMesh(H);
    }, this.getCameraTexture = function(Y) {
      return f[Y];
    };
    let Ke = null;
    function st(Y, J) {
      if (h = J.getViewerPose(c || a), g = J, h !== null) {
        const fe = h.views;
        p !== null && (e.setRenderTargetFramebuffer(y, p.framebuffer), e.setRenderTarget(y));
        let Ae = !1;
        fe.length !== H.cameras.length && (H.cameras.length = 0, Ae = !0);
        for (let C = 0; C < fe.length; C++) {
          const ht = fe[C];
          let ke = null;
          if (p !== null)
            ke = p.getViewport(ht);
          else {
            const _e = d.getViewSubImage(u, ht);
            ke = _e.viewport, C === 0 && (e.setRenderTargetTextures(
              y,
              _e.colorTexture,
              _e.depthStencilTexture
            ), e.setRenderTarget(y));
          }
          let Le = L[C];
          Le === void 0 && (Le = new hn(), Le.layers.enable(C), Le.viewport = new vt(), L[C] = Le), Le.matrix.fromArray(ht.transform.matrix), Le.matrix.decompose(Le.position, Le.quaternion, Le.scale), Le.projectionMatrix.fromArray(ht.projectionMatrix), Le.projectionMatrixInverse.copy(Le.projectionMatrix).invert(), Le.viewport.set(ke.x, ke.y, ke.width, ke.height), C === 0 && (H.matrix.copy(Le.matrix), H.matrix.decompose(H.position, H.quaternion, H.scale)), Ae === !0 && H.cameras.push(Le);
        }
        const Me = r.enabledFeatures;
        if (Me && Me.includes("depth-sensing") && r.depthUsage == "gpu-optimized" && _) {
          d = n.getBinding();
          const C = d.getDepthInformation(fe[0]);
          C && C.isValid && C.texture && m.init(C, r.renderState);
        }
        if (Me && Me.includes("camera-access") && _) {
          e.state.unbindTexture(), d = n.getBinding();
          for (let C = 0; C < fe.length; C++) {
            const ht = fe[C].camera;
            if (ht) {
              let ke = f[ht];
              ke || (ke = new Tc(), f[ht] = ke);
              const Le = d.getCameraImage(ht);
              ke.sourceTexture = Le;
            }
          }
        }
      }
      for (let fe = 0; fe < w.length; fe++) {
        const Ae = R[fe], Me = w[fe];
        Ae !== null && Me !== void 0 && Me.update(Ae, J, c || a);
      }
      Ke && Ke(Y, J), J.detectedPlanes && n.dispatchEvent({ type: "planesdetected", data: J }), g = null;
    }
    const qe = new Pc();
    qe.setAnimationLoop(st), this.setAnimationLoop = function(Y) {
      Ke = Y;
    }, this.dispose = function() {
    };
  }
}
const fi = /* @__PURE__ */ new In(), Hg = /* @__PURE__ */ new lt();
function Vg(i, e) {
  function t(m, f) {
    m.matrixAutoUpdate === !0 && m.updateMatrix(), f.value.copy(m.matrix);
  }
  function n(m, f) {
    f.color.getRGB(m.fogColor.value, Sc(i)), f.isFog ? (m.fogNear.value = f.near, m.fogFar.value = f.far) : f.isFogExp2 && (m.fogDensity.value = f.density);
  }
  function r(m, f, T, b, y) {
    f.isMeshBasicMaterial || f.isMeshLambertMaterial ? s(m, f) : f.isMeshToonMaterial ? (s(m, f), d(m, f)) : f.isMeshPhongMaterial ? (s(m, f), h(m, f)) : f.isMeshStandardMaterial ? (s(m, f), u(m, f), f.isMeshPhysicalMaterial && p(m, f, y)) : f.isMeshMatcapMaterial ? (s(m, f), g(m, f)) : f.isMeshDepthMaterial ? s(m, f) : f.isMeshDistanceMaterial ? (s(m, f), _(m, f)) : f.isMeshNormalMaterial ? s(m, f) : f.isLineBasicMaterial ? (a(m, f), f.isLineDashedMaterial && o(m, f)) : f.isPointsMaterial ? l(m, f, T, b) : f.isSpriteMaterial ? c(m, f) : f.isShadowMaterial ? (m.color.value.copy(f.color), m.opacity.value = f.opacity) : f.isShaderMaterial && (f.uniformsNeedUpdate = !1);
  }
  function s(m, f) {
    m.opacity.value = f.opacity, f.color && m.diffuse.value.copy(f.color), f.emissive && m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity), f.map && (m.map.value = f.map, t(f.map, m.mapTransform)), f.alphaMap && (m.alphaMap.value = f.alphaMap, t(f.alphaMap, m.alphaMapTransform)), f.bumpMap && (m.bumpMap.value = f.bumpMap, t(f.bumpMap, m.bumpMapTransform), m.bumpScale.value = f.bumpScale, f.side === Jt && (m.bumpScale.value *= -1)), f.normalMap && (m.normalMap.value = f.normalMap, t(f.normalMap, m.normalMapTransform), m.normalScale.value.copy(f.normalScale), f.side === Jt && m.normalScale.value.negate()), f.displacementMap && (m.displacementMap.value = f.displacementMap, t(f.displacementMap, m.displacementMapTransform), m.displacementScale.value = f.displacementScale, m.displacementBias.value = f.displacementBias), f.emissiveMap && (m.emissiveMap.value = f.emissiveMap, t(f.emissiveMap, m.emissiveMapTransform)), f.specularMap && (m.specularMap.value = f.specularMap, t(f.specularMap, m.specularMapTransform)), f.alphaTest > 0 && (m.alphaTest.value = f.alphaTest);
    const T = e.get(f), b = T.envMap, y = T.envMapRotation;
    b && (m.envMap.value = b, fi.copy(y), fi.x *= -1, fi.y *= -1, fi.z *= -1, b.isCubeTexture && b.isRenderTargetTexture === !1 && (fi.y *= -1, fi.z *= -1), m.envMapRotation.value.setFromMatrix4(Hg.makeRotationFromEuler(fi)), m.flipEnvMap.value = b.isCubeTexture && b.isRenderTargetTexture === !1 ? -1 : 1, m.reflectivity.value = f.reflectivity, m.ior.value = f.ior, m.refractionRatio.value = f.refractionRatio), f.lightMap && (m.lightMap.value = f.lightMap, m.lightMapIntensity.value = f.lightMapIntensity, t(f.lightMap, m.lightMapTransform)), f.aoMap && (m.aoMap.value = f.aoMap, m.aoMapIntensity.value = f.aoMapIntensity, t(f.aoMap, m.aoMapTransform));
  }
  function a(m, f) {
    m.diffuse.value.copy(f.color), m.opacity.value = f.opacity, f.map && (m.map.value = f.map, t(f.map, m.mapTransform));
  }
  function o(m, f) {
    m.dashSize.value = f.dashSize, m.totalSize.value = f.dashSize + f.gapSize, m.scale.value = f.scale;
  }
  function l(m, f, T, b) {
    m.diffuse.value.copy(f.color), m.opacity.value = f.opacity, m.size.value = f.size * T, m.scale.value = b * 0.5, f.map && (m.map.value = f.map, t(f.map, m.uvTransform)), f.alphaMap && (m.alphaMap.value = f.alphaMap, t(f.alphaMap, m.alphaMapTransform)), f.alphaTest > 0 && (m.alphaTest.value = f.alphaTest);
  }
  function c(m, f) {
    m.diffuse.value.copy(f.color), m.opacity.value = f.opacity, m.rotation.value = f.rotation, f.map && (m.map.value = f.map, t(f.map, m.mapTransform)), f.alphaMap && (m.alphaMap.value = f.alphaMap, t(f.alphaMap, m.alphaMapTransform)), f.alphaTest > 0 && (m.alphaTest.value = f.alphaTest);
  }
  function h(m, f) {
    m.specular.value.copy(f.specular), m.shininess.value = Math.max(f.shininess, 1e-4);
  }
  function d(m, f) {
    f.gradientMap && (m.gradientMap.value = f.gradientMap);
  }
  function u(m, f) {
    m.metalness.value = f.metalness, f.metalnessMap && (m.metalnessMap.value = f.metalnessMap, t(f.metalnessMap, m.metalnessMapTransform)), m.roughness.value = f.roughness, f.roughnessMap && (m.roughnessMap.value = f.roughnessMap, t(f.roughnessMap, m.roughnessMapTransform)), f.envMap && (m.envMapIntensity.value = f.envMapIntensity);
  }
  function p(m, f, T) {
    m.ior.value = f.ior, f.sheen > 0 && (m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen), m.sheenRoughness.value = f.sheenRoughness, f.sheenColorMap && (m.sheenColorMap.value = f.sheenColorMap, t(f.sheenColorMap, m.sheenColorMapTransform)), f.sheenRoughnessMap && (m.sheenRoughnessMap.value = f.sheenRoughnessMap, t(f.sheenRoughnessMap, m.sheenRoughnessMapTransform))), f.clearcoat > 0 && (m.clearcoat.value = f.clearcoat, m.clearcoatRoughness.value = f.clearcoatRoughness, f.clearcoatMap && (m.clearcoatMap.value = f.clearcoatMap, t(f.clearcoatMap, m.clearcoatMapTransform)), f.clearcoatRoughnessMap && (m.clearcoatRoughnessMap.value = f.clearcoatRoughnessMap, t(f.clearcoatRoughnessMap, m.clearcoatRoughnessMapTransform)), f.clearcoatNormalMap && (m.clearcoatNormalMap.value = f.clearcoatNormalMap, t(f.clearcoatNormalMap, m.clearcoatNormalMapTransform), m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale), f.side === Jt && m.clearcoatNormalScale.value.negate())), f.dispersion > 0 && (m.dispersion.value = f.dispersion), f.iridescence > 0 && (m.iridescence.value = f.iridescence, m.iridescenceIOR.value = f.iridescenceIOR, m.iridescenceThicknessMinimum.value = f.iridescenceThicknessRange[0], m.iridescenceThicknessMaximum.value = f.iridescenceThicknessRange[1], f.iridescenceMap && (m.iridescenceMap.value = f.iridescenceMap, t(f.iridescenceMap, m.iridescenceMapTransform)), f.iridescenceThicknessMap && (m.iridescenceThicknessMap.value = f.iridescenceThicknessMap, t(f.iridescenceThicknessMap, m.iridescenceThicknessMapTransform))), f.transmission > 0 && (m.transmission.value = f.transmission, m.transmissionSamplerMap.value = T.texture, m.transmissionSamplerSize.value.set(T.width, T.height), f.transmissionMap && (m.transmissionMap.value = f.transmissionMap, t(f.transmissionMap, m.transmissionMapTransform)), m.thickness.value = f.thickness, f.thicknessMap && (m.thicknessMap.value = f.thicknessMap, t(f.thicknessMap, m.thicknessMapTransform)), m.attenuationDistance.value = f.attenuationDistance, m.attenuationColor.value.copy(f.attenuationColor)), f.anisotropy > 0 && (m.anisotropyVector.value.set(f.anisotropy * Math.cos(f.anisotropyRotation), f.anisotropy * Math.sin(f.anisotropyRotation)), f.anisotropyMap && (m.anisotropyMap.value = f.anisotropyMap, t(f.anisotropyMap, m.anisotropyMapTransform))), m.specularIntensity.value = f.specularIntensity, m.specularColor.value.copy(f.specularColor), f.specularColorMap && (m.specularColorMap.value = f.specularColorMap, t(f.specularColorMap, m.specularColorMapTransform)), f.specularIntensityMap && (m.specularIntensityMap.value = f.specularIntensityMap, t(f.specularIntensityMap, m.specularIntensityMapTransform));
  }
  function g(m, f) {
    f.matcap && (m.matcap.value = f.matcap);
  }
  function _(m, f) {
    const T = e.get(f).light;
    m.referencePosition.value.setFromMatrixPosition(T.matrixWorld), m.nearDistance.value = T.shadow.camera.near, m.farDistance.value = T.shadow.camera.far;
  }
  return {
    refreshFogUniforms: n,
    refreshMaterialUniforms: r
  };
}
function Gg(i, e, t, n) {
  let r = {}, s = {}, a = [];
  const o = i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(T, b) {
    const y = b.program;
    n.uniformBlockBinding(T, y);
  }
  function c(T, b) {
    let y = r[T.id];
    y === void 0 && (g(T), y = h(T), r[T.id] = y, T.addEventListener("dispose", m));
    const w = b.program;
    n.updateUBOMapping(T, w);
    const R = e.render.frame;
    s[T.id] !== R && (u(T), s[T.id] = R);
  }
  function h(T) {
    const b = d();
    T.__bindingPointIndex = b;
    const y = i.createBuffer(), w = T.__size, R = T.usage;
    return i.bindBuffer(i.UNIFORM_BUFFER, y), i.bufferData(i.UNIFORM_BUFFER, w, R), i.bindBuffer(i.UNIFORM_BUFFER, null), i.bindBufferBase(i.UNIFORM_BUFFER, b, y), y;
  }
  function d() {
    for (let T = 0; T < o; T++)
      if (a.indexOf(T) === -1)
        return a.push(T), T;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function u(T) {
    const b = r[T.id], y = T.uniforms, w = T.__cache;
    i.bindBuffer(i.UNIFORM_BUFFER, b);
    for (let R = 0, P = y.length; R < P; R++) {
      const O = Array.isArray(y[R]) ? y[R] : [y[R]];
      for (let S = 0, M = O.length; S < M; S++) {
        const L = O[S];
        if (p(L, R, S, w) === !0) {
          const H = L.__offset, $ = Array.isArray(L.value) ? L.value : [L.value];
          let Z = 0;
          for (let A = 0; A < $.length; A++) {
            const U = $[A], V = _(U);
            typeof U == "number" || typeof U == "boolean" ? (L.__data[0] = U, i.bufferSubData(i.UNIFORM_BUFFER, H + Z, L.__data)) : U.isMatrix3 ? (L.__data[0] = U.elements[0], L.__data[1] = U.elements[1], L.__data[2] = U.elements[2], L.__data[3] = 0, L.__data[4] = U.elements[3], L.__data[5] = U.elements[4], L.__data[6] = U.elements[5], L.__data[7] = 0, L.__data[8] = U.elements[6], L.__data[9] = U.elements[7], L.__data[10] = U.elements[8], L.__data[11] = 0) : (U.toArray(L.__data, Z), Z += V.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          i.bufferSubData(i.UNIFORM_BUFFER, H, L.__data);
        }
      }
    }
    i.bindBuffer(i.UNIFORM_BUFFER, null);
  }
  function p(T, b, y, w) {
    const R = T.value, P = b + "_" + y;
    if (w[P] === void 0)
      return typeof R == "number" || typeof R == "boolean" ? w[P] = R : w[P] = R.clone(), !0;
    {
      const O = w[P];
      if (typeof R == "number" || typeof R == "boolean") {
        if (O !== R)
          return w[P] = R, !0;
      } else if (O.equals(R) === !1)
        return O.copy(R), !0;
    }
    return !1;
  }
  function g(T) {
    const b = T.uniforms;
    let y = 0;
    const w = 16;
    for (let P = 0, O = b.length; P < O; P++) {
      const S = Array.isArray(b[P]) ? b[P] : [b[P]];
      for (let M = 0, L = S.length; M < L; M++) {
        const H = S[M], $ = Array.isArray(H.value) ? H.value : [H.value];
        for (let Z = 0, A = $.length; Z < A; Z++) {
          const U = $[Z], V = _(U), D = y % w, F = D % V.boundary, X = D + F;
          y += F, X !== 0 && w - X < V.storage && (y += w - X), H.__data = new Float32Array(V.storage / Float32Array.BYTES_PER_ELEMENT), H.__offset = y, y += V.storage;
        }
      }
    }
    const R = y % w;
    return R > 0 && (y += w - R), T.__size = y, T.__cache = {}, this;
  }
  function _(T) {
    const b = {
      boundary: 0,
      // bytes
      storage: 0
      // bytes
    };
    return typeof T == "number" || typeof T == "boolean" ? (b.boundary = 4, b.storage = 4) : T.isVector2 ? (b.boundary = 8, b.storage = 8) : T.isVector3 || T.isColor ? (b.boundary = 16, b.storage = 12) : T.isVector4 ? (b.boundary = 16, b.storage = 16) : T.isMatrix3 ? (b.boundary = 48, b.storage = 48) : T.isMatrix4 ? (b.boundary = 64, b.storage = 64) : T.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", T), b;
  }
  function m(T) {
    const b = T.target;
    b.removeEventListener("dispose", m);
    const y = a.indexOf(b.__bindingPointIndex);
    a.splice(y, 1), i.deleteBuffer(r[b.id]), delete r[b.id], delete s[b.id];
  }
  function f() {
    for (const T in r)
      i.deleteBuffer(r[T]);
    a = [], r = {}, s = {};
  }
  return {
    bind: l,
    update: c,
    dispose: f
  };
}
class Wg {
  /**
   * Constructs a new WebGL renderer.
   *
   * @param {WebGLRenderer~Options} [parameters] - The configuration parameter.
   */
  constructor(e = {}) {
    const {
      canvas: t = _d(),
      context: n = null,
      depth: r = !0,
      stencil: s = !1,
      alpha: a = !1,
      antialias: o = !1,
      premultipliedAlpha: l = !0,
      preserveDrawingBuffer: c = !1,
      powerPreference: h = "default",
      failIfMajorPerformanceCaveat: d = !1,
      reversedDepthBuffer: u = !1
    } = e;
    this.isWebGLRenderer = !0;
    let p;
    if (n !== null) {
      if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext)
        throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      p = n.getContextAttributes().alpha;
    } else
      p = a;
    const g = new Uint32Array(4), _ = new Int32Array(4);
    let m = null, f = null;
    const T = [], b = [];
    this.domElement = t, this.debug = {
      /**
       * Enables error checking and reporting when shader programs are being compiled.
       * @type {boolean}
       */
      checkShaderErrors: !0,
      /**
       * Callback for custom error reporting.
       * @type {?Function}
       */
      onShaderError: null
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this.toneMapping = ni, this.toneMappingExposure = 1, this.transmissionResolutionScale = 1;
    const y = this;
    let w = !1;
    this._outputColorSpace = Zt;
    let R = 0, P = 0, O = null, S = -1, M = null;
    const L = new vt(), H = new vt();
    let $ = null;
    const Z = new Xe(0);
    let A = 0, U = t.width, V = t.height, D = 1, F = null, X = null;
    const ne = new vt(0, 0, U, V), Pe = new vt(0, 0, U, V);
    let Ke = !1;
    const st = new mo();
    let qe = !1, Y = !1;
    const J = new lt(), fe = new N(), Ae = new vt(), Me = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 };
    let $e = !1;
    function kt() {
      return O === null ? D : 1;
    }
    let C = n;
    function ht(x, k) {
      return t.getContext(x, k);
    }
    try {
      const x = {
        alpha: !0,
        depth: r,
        stencil: s,
        antialias: o,
        premultipliedAlpha: l,
        preserveDrawingBuffer: c,
        powerPreference: h,
        failIfMajorPerformanceCaveat: d
      };
      if ("setAttribute" in t && t.setAttribute("data-engine", `three.js r${ro}`), t.addEventListener("webglcontextlost", oe, !1), t.addEventListener("webglcontextrestored", pe, !1), t.addEventListener("webglcontextcreationerror", te, !1), C === null) {
        const k = "webgl2";
        if (C = ht(k, x), C === null)
          throw ht(k) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (x) {
      throw console.error("THREE.WebGLRenderer: " + x.message), x;
    }
    let ke, Le, _e, dt, ve, He, Ct, xt, E, v, z, K, ee, j, be, ae, xe, Se, re, de, De, ye, ce, Be;
    function I() {
      ke = new em(C), ke.init(), ye = new Fg(C, ke), Le = new qp(C, ke, e, ye), _e = new Ug(C, ke), Le.reversedDepthBuffer && u && _e.buffers.depth.setReversed(!0), dt = new im(C), ve = new Sg(), He = new Ng(C, ke, _e, ve, Le, ye, dt), Ct = new jp(y), xt = new Qp(y), E = new lu(C), ce = new $p(C, E), v = new tm(C, E, dt, ce), z = new sm(C, v, E, dt), re = new rm(C, Le, He), ae = new Yp(ve), K = new Mg(y, Ct, xt, ke, Le, ce, ae), ee = new Vg(y, ve), j = new bg(), be = new Cg(ke), Se = new Wp(y, Ct, xt, _e, z, p, l), xe = new Lg(y, z, Le), Be = new Gg(C, dt, Le, _e), de = new Xp(C, ke, dt), De = new nm(C, ke, dt), dt.programs = K.programs, y.capabilities = Le, y.extensions = ke, y.properties = ve, y.renderLists = j, y.shadowMap = xe, y.state = _e, y.info = dt;
    }
    I();
    const se = new zg(y, C);
    this.xr = se, this.getContext = function() {
      return C;
    }, this.getContextAttributes = function() {
      return C.getContextAttributes();
    }, this.forceContextLoss = function() {
      const x = ke.get("WEBGL_lose_context");
      x && x.loseContext();
    }, this.forceContextRestore = function() {
      const x = ke.get("WEBGL_lose_context");
      x && x.restoreContext();
    }, this.getPixelRatio = function() {
      return D;
    }, this.setPixelRatio = function(x) {
      x !== void 0 && (D = x, this.setSize(U, V, !1));
    }, this.getSize = function(x) {
      return x.set(U, V);
    }, this.setSize = function(x, k, G = !0) {
      if (se.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      U = x, V = k, t.width = Math.floor(x * D), t.height = Math.floor(k * D), G === !0 && (t.style.width = x + "px", t.style.height = k + "px"), this.setViewport(0, 0, x, k);
    }, this.getDrawingBufferSize = function(x) {
      return x.set(U * D, V * D).floor();
    }, this.setDrawingBufferSize = function(x, k, G) {
      U = x, V = k, D = G, t.width = Math.floor(x * G), t.height = Math.floor(k * G), this.setViewport(0, 0, x, k);
    }, this.getCurrentViewport = function(x) {
      return x.copy(L);
    }, this.getViewport = function(x) {
      return x.copy(ne);
    }, this.setViewport = function(x, k, G, W) {
      x.isVector4 ? ne.set(x.x, x.y, x.z, x.w) : ne.set(x, k, G, W), _e.viewport(L.copy(ne).multiplyScalar(D).round());
    }, this.getScissor = function(x) {
      return x.copy(Pe);
    }, this.setScissor = function(x, k, G, W) {
      x.isVector4 ? Pe.set(x.x, x.y, x.z, x.w) : Pe.set(x, k, G, W), _e.scissor(H.copy(Pe).multiplyScalar(D).round());
    }, this.getScissorTest = function() {
      return Ke;
    }, this.setScissorTest = function(x) {
      _e.setScissorTest(Ke = x);
    }, this.setOpaqueSort = function(x) {
      F = x;
    }, this.setTransparentSort = function(x) {
      X = x;
    }, this.getClearColor = function(x) {
      return x.copy(Se.getClearColor());
    }, this.setClearColor = function() {
      Se.setClearColor(...arguments);
    }, this.getClearAlpha = function() {
      return Se.getClearAlpha();
    }, this.setClearAlpha = function() {
      Se.setClearAlpha(...arguments);
    }, this.clear = function(x = !0, k = !0, G = !0) {
      let W = 0;
      if (x) {
        let B = !1;
        if (O !== null) {
          const ie = O.texture.format;
          B = ie === ho || ie === co || ie === lo;
        }
        if (B) {
          const ie = O.texture.type, he = ie === Ln || ie === bi || ie === Mr || ie === Sr || ie === ao || ie === oo, me = Se.getClearColor(), ue = Se.getClearAlpha(), Re = me.r, Ie = me.g, we = me.b;
          he ? (g[0] = Re, g[1] = Ie, g[2] = we, g[3] = ue, C.clearBufferuiv(C.COLOR, 0, g)) : (_[0] = Re, _[1] = Ie, _[2] = we, _[3] = ue, C.clearBufferiv(C.COLOR, 0, _));
        } else
          W |= C.COLOR_BUFFER_BIT;
      }
      k && (W |= C.DEPTH_BUFFER_BIT), G && (W |= C.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), C.clear(W);
    }, this.clearColor = function() {
      this.clear(!0, !1, !1);
    }, this.clearDepth = function() {
      this.clear(!1, !0, !1);
    }, this.clearStencil = function() {
      this.clear(!1, !1, !0);
    }, this.dispose = function() {
      t.removeEventListener("webglcontextlost", oe, !1), t.removeEventListener("webglcontextrestored", pe, !1), t.removeEventListener("webglcontextcreationerror", te, !1), Se.dispose(), j.dispose(), be.dispose(), ve.dispose(), Ct.dispose(), xt.dispose(), z.dispose(), ce.dispose(), Be.dispose(), K.dispose(), se.dispose(), se.removeEventListener("sessionstart", En), se.removeEventListener("sessionend", wo), ai.stop();
    };
    function oe(x) {
      x.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), w = !0;
    }
    function pe() {
      console.log("THREE.WebGLRenderer: Context Restored."), w = !1;
      const x = dt.autoReset, k = xe.enabled, G = xe.autoUpdate, W = xe.needsUpdate, B = xe.type;
      I(), dt.autoReset = x, xe.enabled = k, xe.autoUpdate = G, xe.needsUpdate = W, xe.type = B;
    }
    function te(x) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", x.statusMessage);
    }
    function Q(x) {
      const k = x.target;
      k.removeEventListener("dispose", Q), ge(k);
    }
    function ge(x) {
      Oe(x), ve.remove(x);
    }
    function Oe(x) {
      const k = ve.get(x).programs;
      k !== void 0 && (k.forEach(function(G) {
        K.releaseProgram(G);
      }), x.isShaderMaterial && K.releaseShaderCache(x));
    }
    this.renderBufferDirect = function(x, k, G, W, B, ie) {
      k === null && (k = Me);
      const he = B.isMesh && B.matrixWorld.determinant() < 0, me = Yc(x, k, G, W, B);
      _e.setMaterial(W, he);
      let ue = G.index, Re = 1;
      if (W.wireframe === !0) {
        if (ue = v.getWireframeAttribute(G), ue === void 0) return;
        Re = 2;
      }
      const Ie = G.drawRange, we = G.attributes.position;
      let We = Ie.start * Re, Qe = (Ie.start + Ie.count) * Re;
      ie !== null && (We = Math.max(We, ie.start * Re), Qe = Math.min(Qe, (ie.start + ie.count) * Re)), ue !== null ? (We = Math.max(We, 0), Qe = Math.min(Qe, ue.count)) : we != null && (We = Math.max(We, 0), Qe = Math.min(Qe, we.count));
      const _t = Qe - We;
      if (_t < 0 || _t === 1 / 0) return;
      ce.setup(B, W, me, G, ue);
      let ct, it = de;
      if (ue !== null && (ct = E.get(ue), it = De, it.setIndex(ct)), B.isMesh)
        W.wireframe === !0 ? (_e.setLineWidth(W.wireframeLinewidth * kt()), it.setMode(C.LINES)) : it.setMode(C.TRIANGLES);
      else if (B.isLine) {
        let Te = W.linewidth;
        Te === void 0 && (Te = 1), _e.setLineWidth(Te * kt()), B.isLineSegments ? it.setMode(C.LINES) : B.isLineLoop ? it.setMode(C.LINE_LOOP) : it.setMode(C.LINE_STRIP);
      } else B.isPoints ? it.setMode(C.POINTS) : B.isSprite && it.setMode(C.TRIANGLES);
      if (B.isBatchedMesh)
        if (B._multiDrawInstances !== null)
          wr("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."), it.renderMultiDrawInstances(B._multiDrawStarts, B._multiDrawCounts, B._multiDrawCount, B._multiDrawInstances);
        else if (ke.get("WEBGL_multi_draw"))
          it.renderMultiDraw(B._multiDrawStarts, B._multiDrawCounts, B._multiDrawCount);
        else {
          const Te = B._multiDrawStarts, ft = B._multiDrawCounts, Ye = B._multiDrawCount, Qt = ue ? E.get(ue).bytesPerElement : 1, Ai = ve.get(W).currentProgram.getUniforms();
          for (let en = 0; en < Ye; en++)
            Ai.setValue(C, "_gl_DrawID", en), it.render(Te[en] / Qt, ft[en]);
        }
      else if (B.isInstancedMesh)
        it.renderInstances(We, _t, B.count);
      else if (G.isInstancedBufferGeometry) {
        const Te = G._maxInstanceCount !== void 0 ? G._maxInstanceCount : 1 / 0, ft = Math.min(G.instanceCount, Te);
        it.renderInstances(We, _t, ft);
      } else
        it.render(We, _t);
    };
    function at(x, k, G) {
      x.transparent === !0 && x.side === rn && x.forceSinglePass === !1 ? (x.side = Jt, x.needsUpdate = !0, Cr(x, k, G), x.side = ii, x.needsUpdate = !0, Cr(x, k, G), x.side = rn) : Cr(x, k, G);
    }
    this.compile = function(x, k, G = null) {
      G === null && (G = x), f = be.get(G), f.init(k), b.push(f), G.traverseVisible(function(B) {
        B.isLight && B.layers.test(k.layers) && (f.pushLight(B), B.castShadow && f.pushShadow(B));
      }), x !== G && x.traverseVisible(function(B) {
        B.isLight && B.layers.test(k.layers) && (f.pushLight(B), B.castShadow && f.pushShadow(B));
      }), f.setupLights();
      const W = /* @__PURE__ */ new Set();
      return x.traverse(function(B) {
        if (!(B.isMesh || B.isPoints || B.isLine || B.isSprite))
          return;
        const ie = B.material;
        if (ie)
          if (Array.isArray(ie))
            for (let he = 0; he < ie.length; he++) {
              const me = ie[he];
              at(me, G, B), W.add(me);
            }
          else
            at(ie, G, B), W.add(ie);
      }), f = b.pop(), W;
    }, this.compileAsync = function(x, k, G = null) {
      const W = this.compile(x, k, G);
      return new Promise((B) => {
        function ie() {
          if (W.forEach(function(he) {
            ve.get(he).currentProgram.isReady() && W.delete(he);
          }), W.size === 0) {
            B(x);
            return;
          }
          setTimeout(ie, 10);
        }
        ke.get("KHR_parallel_shader_compile") !== null ? ie() : setTimeout(ie, 10);
      });
    };
    let Ze = null;
    function Un(x) {
      Ze && Ze(x);
    }
    function En() {
      ai.stop();
    }
    function wo() {
      ai.start();
    }
    const ai = new Pc();
    ai.setAnimationLoop(Un), typeof self < "u" && ai.setContext(self), this.setAnimationLoop = function(x) {
      Ze = x, se.setAnimationLoop(x), x === null ? ai.stop() : ai.start();
    }, se.addEventListener("sessionstart", En), se.addEventListener("sessionend", wo), this.render = function(x, k) {
      if (k !== void 0 && k.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (w === !0) return;
      if (x.matrixWorldAutoUpdate === !0 && x.updateMatrixWorld(), k.parent === null && k.matrixWorldAutoUpdate === !0 && k.updateMatrixWorld(), se.enabled === !0 && se.isPresenting === !0 && (se.cameraAutoUpdate === !0 && se.updateCamera(k), k = se.getCamera()), x.isScene === !0 && x.onBeforeRender(y, x, k, O), f = be.get(x, b.length), f.init(k), b.push(f), J.multiplyMatrices(k.projectionMatrix, k.matrixWorldInverse), st.setFromProjectionMatrix(J, Rn, k.reversedDepth), Y = this.localClippingEnabled, qe = ae.init(this.clippingPlanes, Y), m = j.get(x, T.length), m.init(), T.push(m), se.enabled === !0 && se.isPresenting === !0) {
        const ie = y.xr.getDepthSensingMesh();
        ie !== null && As(ie, k, -1 / 0, y.sortObjects);
      }
      As(x, k, 0, y.sortObjects), m.finish(), y.sortObjects === !0 && m.sort(F, X), $e = se.enabled === !1 || se.isPresenting === !1 || se.hasDepthSensing() === !1, $e && Se.addToRenderList(m, x), this.info.render.frame++, qe === !0 && ae.beginShadows();
      const G = f.state.shadowsArray;
      xe.render(G, x, k), qe === !0 && ae.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const W = m.opaque, B = m.transmissive;
      if (f.setupLights(), k.isArrayCamera) {
        const ie = k.cameras;
        if (B.length > 0)
          for (let he = 0, me = ie.length; he < me; he++) {
            const ue = ie[he];
            Ao(W, B, x, ue);
          }
        $e && Se.render(x);
        for (let he = 0, me = ie.length; he < me; he++) {
          const ue = ie[he];
          To(m, x, ue, ue.viewport);
        }
      } else
        B.length > 0 && Ao(W, B, x, k), $e && Se.render(x), To(m, x, k);
      O !== null && P === 0 && (He.updateMultisampleRenderTarget(O), He.updateRenderTargetMipmap(O)), x.isScene === !0 && x.onAfterRender(y, x, k), ce.resetDefaultState(), S = -1, M = null, b.pop(), b.length > 0 ? (f = b[b.length - 1], qe === !0 && ae.setGlobalState(y.clippingPlanes, f.state.camera)) : f = null, T.pop(), T.length > 0 ? m = T[T.length - 1] : m = null;
    };
    function As(x, k, G, W) {
      if (x.visible === !1) return;
      if (x.layers.test(k.layers)) {
        if (x.isGroup)
          G = x.renderOrder;
        else if (x.isLOD)
          x.autoUpdate === !0 && x.update(k);
        else if (x.isLight)
          f.pushLight(x), x.castShadow && f.pushShadow(x);
        else if (x.isSprite) {
          if (!x.frustumCulled || st.intersectsSprite(x)) {
            W && Ae.setFromMatrixPosition(x.matrixWorld).applyMatrix4(J);
            const he = z.update(x), me = x.material;
            me.visible && m.push(x, he, me, G, Ae.z, null);
          }
        } else if ((x.isMesh || x.isLine || x.isPoints) && (!x.frustumCulled || st.intersectsObject(x))) {
          const he = z.update(x), me = x.material;
          if (W && (x.boundingSphere !== void 0 ? (x.boundingSphere === null && x.computeBoundingSphere(), Ae.copy(x.boundingSphere.center)) : (he.boundingSphere === null && he.computeBoundingSphere(), Ae.copy(he.boundingSphere.center)), Ae.applyMatrix4(x.matrixWorld).applyMatrix4(J)), Array.isArray(me)) {
            const ue = he.groups;
            for (let Re = 0, Ie = ue.length; Re < Ie; Re++) {
              const we = ue[Re], We = me[we.materialIndex];
              We && We.visible && m.push(x, he, We, G, Ae.z, we);
            }
          } else me.visible && m.push(x, he, me, G, Ae.z, null);
        }
      }
      const ie = x.children;
      for (let he = 0, me = ie.length; he < me; he++)
        As(ie[he], k, G, W);
    }
    function To(x, k, G, W) {
      const B = x.opaque, ie = x.transmissive, he = x.transparent;
      f.setupLightsView(G), qe === !0 && ae.setGlobalState(y.clippingPlanes, G), W && _e.viewport(L.copy(W)), B.length > 0 && Rr(B, k, G), ie.length > 0 && Rr(ie, k, G), he.length > 0 && Rr(he, k, G), _e.buffers.depth.setTest(!0), _e.buffers.depth.setMask(!0), _e.buffers.color.setMask(!0), _e.setPolygonOffset(!1);
    }
    function Ao(x, k, G, W) {
      if ((G.isScene === !0 ? G.overrideMaterial : null) !== null)
        return;
      f.state.transmissionRenderTarget[W.id] === void 0 && (f.state.transmissionRenderTarget[W.id] = new wi(1, 1, {
        generateMipmaps: !0,
        type: ke.has("EXT_color_buffer_half_float") || ke.has("EXT_color_buffer_float") ? Ar : Ln,
        minFilter: xi,
        samples: 4,
        stencilBuffer: s,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: je.workingColorSpace
      }));
      const ie = f.state.transmissionRenderTarget[W.id], he = W.viewport || L;
      ie.setSize(he.z * y.transmissionResolutionScale, he.w * y.transmissionResolutionScale);
      const me = y.getRenderTarget(), ue = y.getActiveCubeFace(), Re = y.getActiveMipmapLevel();
      y.setRenderTarget(ie), y.getClearColor(Z), A = y.getClearAlpha(), A < 1 && y.setClearColor(16777215, 0.5), y.clear(), $e && Se.render(G);
      const Ie = y.toneMapping;
      y.toneMapping = ni;
      const we = W.viewport;
      if (W.viewport !== void 0 && (W.viewport = void 0), f.setupLightsView(W), qe === !0 && ae.setGlobalState(y.clippingPlanes, W), Rr(x, G, W), He.updateMultisampleRenderTarget(ie), He.updateRenderTargetMipmap(ie), ke.has("WEBGL_multisampled_render_to_texture") === !1) {
        let We = !1;
        for (let Qe = 0, _t = k.length; Qe < _t; Qe++) {
          const ct = k[Qe], it = ct.object, Te = ct.geometry, ft = ct.material, Ye = ct.group;
          if (ft.side === rn && it.layers.test(W.layers)) {
            const Qt = ft.side;
            ft.side = Jt, ft.needsUpdate = !0, Ro(it, G, W, Te, ft, Ye), ft.side = Qt, ft.needsUpdate = !0, We = !0;
          }
        }
        We === !0 && (He.updateMultisampleRenderTarget(ie), He.updateRenderTargetMipmap(ie));
      }
      y.setRenderTarget(me, ue, Re), y.setClearColor(Z, A), we !== void 0 && (W.viewport = we), y.toneMapping = Ie;
    }
    function Rr(x, k, G) {
      const W = k.isScene === !0 ? k.overrideMaterial : null;
      for (let B = 0, ie = x.length; B < ie; B++) {
        const he = x[B], me = he.object, ue = he.geometry, Re = he.group;
        let Ie = he.material;
        Ie.allowOverride === !0 && W !== null && (Ie = W), me.layers.test(G.layers) && Ro(me, k, G, ue, Ie, Re);
      }
    }
    function Ro(x, k, G, W, B, ie) {
      x.onBeforeRender(y, k, G, W, B, ie), x.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse, x.matrixWorld), x.normalMatrix.getNormalMatrix(x.modelViewMatrix), B.onBeforeRender(y, k, G, W, x, ie), B.transparent === !0 && B.side === rn && B.forceSinglePass === !1 ? (B.side = Jt, B.needsUpdate = !0, y.renderBufferDirect(G, k, W, B, x, ie), B.side = ii, B.needsUpdate = !0, y.renderBufferDirect(G, k, W, B, x, ie), B.side = rn) : y.renderBufferDirect(G, k, W, B, x, ie), x.onAfterRender(y, k, G, W, B, ie);
    }
    function Cr(x, k, G) {
      k.isScene !== !0 && (k = Me);
      const W = ve.get(x), B = f.state.lights, ie = f.state.shadowsArray, he = B.state.version, me = K.getParameters(x, B.state, ie, k, G), ue = K.getProgramCacheKey(me);
      let Re = W.programs;
      W.environment = x.isMeshStandardMaterial ? k.environment : null, W.fog = k.fog, W.envMap = (x.isMeshStandardMaterial ? xt : Ct).get(x.envMap || W.environment), W.envMapRotation = W.environment !== null && x.envMap === null ? k.environmentRotation : x.envMapRotation, Re === void 0 && (x.addEventListener("dispose", Q), Re = /* @__PURE__ */ new Map(), W.programs = Re);
      let Ie = Re.get(ue);
      if (Ie !== void 0) {
        if (W.currentProgram === Ie && W.lightsStateVersion === he)
          return Po(x, me), Ie;
      } else
        me.uniforms = K.getUniforms(x), x.onBeforeCompile(me, y), Ie = K.acquireProgram(me, ue), Re.set(ue, Ie), W.uniforms = me.uniforms;
      const we = W.uniforms;
      return (!x.isShaderMaterial && !x.isRawShaderMaterial || x.clipping === !0) && (we.clippingPlanes = ae.uniform), Po(x, me), W.needsLights = Kc(x), W.lightsStateVersion = he, W.needsLights && (we.ambientLightColor.value = B.state.ambient, we.lightProbe.value = B.state.probe, we.directionalLights.value = B.state.directional, we.directionalLightShadows.value = B.state.directionalShadow, we.spotLights.value = B.state.spot, we.spotLightShadows.value = B.state.spotShadow, we.rectAreaLights.value = B.state.rectArea, we.ltc_1.value = B.state.rectAreaLTC1, we.ltc_2.value = B.state.rectAreaLTC2, we.pointLights.value = B.state.point, we.pointLightShadows.value = B.state.pointShadow, we.hemisphereLights.value = B.state.hemi, we.directionalShadowMap.value = B.state.directionalShadowMap, we.directionalShadowMatrix.value = B.state.directionalShadowMatrix, we.spotShadowMap.value = B.state.spotShadowMap, we.spotLightMatrix.value = B.state.spotLightMatrix, we.spotLightMap.value = B.state.spotLightMap, we.pointShadowMap.value = B.state.pointShadowMap, we.pointShadowMatrix.value = B.state.pointShadowMatrix), W.currentProgram = Ie, W.uniformsList = null, Ie;
    }
    function Co(x) {
      if (x.uniformsList === null) {
        const k = x.currentProgram.getUniforms();
        x.uniformsList = us.seqWithValue(k.seq, x.uniforms);
      }
      return x.uniformsList;
    }
    function Po(x, k) {
      const G = ve.get(x);
      G.outputColorSpace = k.outputColorSpace, G.batching = k.batching, G.batchingColor = k.batchingColor, G.instancing = k.instancing, G.instancingColor = k.instancingColor, G.instancingMorph = k.instancingMorph, G.skinning = k.skinning, G.morphTargets = k.morphTargets, G.morphNormals = k.morphNormals, G.morphColors = k.morphColors, G.morphTargetsCount = k.morphTargetsCount, G.numClippingPlanes = k.numClippingPlanes, G.numIntersection = k.numClipIntersection, G.vertexAlphas = k.vertexAlphas, G.vertexTangents = k.vertexTangents, G.toneMapping = k.toneMapping;
    }
    function Yc(x, k, G, W, B) {
      k.isScene !== !0 && (k = Me), He.resetTextureUnits();
      const ie = k.fog, he = W.isMeshStandardMaterial ? k.environment : null, me = O === null ? y.outputColorSpace : O.isXRRenderTarget === !0 ? O.texture.colorSpace : tr, ue = (W.isMeshStandardMaterial ? xt : Ct).get(W.envMap || he), Re = W.vertexColors === !0 && !!G.attributes.color && G.attributes.color.itemSize === 4, Ie = !!G.attributes.tangent && (!!W.normalMap || W.anisotropy > 0), we = !!G.morphAttributes.position, We = !!G.morphAttributes.normal, Qe = !!G.morphAttributes.color;
      let _t = ni;
      W.toneMapped && (O === null || O.isXRRenderTarget === !0) && (_t = y.toneMapping);
      const ct = G.morphAttributes.position || G.morphAttributes.normal || G.morphAttributes.color, it = ct !== void 0 ? ct.length : 0, Te = ve.get(W), ft = f.state.lights;
      if (qe === !0 && (Y === !0 || x !== M)) {
        const Vt = x === M && W.id === S;
        ae.setState(W, x, Vt);
      }
      let Ye = !1;
      W.version === Te.__version ? (Te.needsLights && Te.lightsStateVersion !== ft.state.version || Te.outputColorSpace !== me || B.isBatchedMesh && Te.batching === !1 || !B.isBatchedMesh && Te.batching === !0 || B.isBatchedMesh && Te.batchingColor === !0 && B.colorTexture === null || B.isBatchedMesh && Te.batchingColor === !1 && B.colorTexture !== null || B.isInstancedMesh && Te.instancing === !1 || !B.isInstancedMesh && Te.instancing === !0 || B.isSkinnedMesh && Te.skinning === !1 || !B.isSkinnedMesh && Te.skinning === !0 || B.isInstancedMesh && Te.instancingColor === !0 && B.instanceColor === null || B.isInstancedMesh && Te.instancingColor === !1 && B.instanceColor !== null || B.isInstancedMesh && Te.instancingMorph === !0 && B.morphTexture === null || B.isInstancedMesh && Te.instancingMorph === !1 && B.morphTexture !== null || Te.envMap !== ue || W.fog === !0 && Te.fog !== ie || Te.numClippingPlanes !== void 0 && (Te.numClippingPlanes !== ae.numPlanes || Te.numIntersection !== ae.numIntersection) || Te.vertexAlphas !== Re || Te.vertexTangents !== Ie || Te.morphTargets !== we || Te.morphNormals !== We || Te.morphColors !== Qe || Te.toneMapping !== _t || Te.morphTargetsCount !== it) && (Ye = !0) : (Ye = !0, Te.__version = W.version);
      let Qt = Te.currentProgram;
      Ye === !0 && (Qt = Cr(W, k, B));
      let Ai = !1, en = !1, lr = !1;
      const pt = Qt.getUniforms(), sn = Te.uniforms;
      if (_e.useProgram(Qt.program) && (Ai = !0, en = !0, lr = !0), W.id !== S && (S = W.id, en = !0), Ai || M !== x) {
        _e.buffers.depth.getReversed() && x.reversedDepth !== !0 && (x._reversedDepth = !0, x.updateProjectionMatrix()), pt.setValue(C, "projectionMatrix", x.projectionMatrix), pt.setValue(C, "viewMatrix", x.matrixWorldInverse);
        const jt = pt.map.cameraPosition;
        jt !== void 0 && jt.setValue(C, fe.setFromMatrixPosition(x.matrixWorld)), Le.logarithmicDepthBuffer && pt.setValue(
          C,
          "logDepthBufFC",
          2 / (Math.log(x.far + 1) / Math.LN2)
        ), (W.isMeshPhongMaterial || W.isMeshToonMaterial || W.isMeshLambertMaterial || W.isMeshBasicMaterial || W.isMeshStandardMaterial || W.isShaderMaterial) && pt.setValue(C, "isOrthographic", x.isOrthographicCamera === !0), M !== x && (M = x, en = !0, lr = !0);
      }
      if (B.isSkinnedMesh) {
        pt.setOptional(C, B, "bindMatrix"), pt.setOptional(C, B, "bindMatrixInverse");
        const Vt = B.skeleton;
        Vt && (Vt.boneTexture === null && Vt.computeBoneTexture(), pt.setValue(C, "boneTexture", Vt.boneTexture, He));
      }
      B.isBatchedMesh && (pt.setOptional(C, B, "batchingTexture"), pt.setValue(C, "batchingTexture", B._matricesTexture, He), pt.setOptional(C, B, "batchingIdTexture"), pt.setValue(C, "batchingIdTexture", B._indirectTexture, He), pt.setOptional(C, B, "batchingColorTexture"), B._colorsTexture !== null && pt.setValue(C, "batchingColorTexture", B._colorsTexture, He));
      const an = G.morphAttributes;
      if ((an.position !== void 0 || an.normal !== void 0 || an.color !== void 0) && re.update(B, G, Qt), (en || Te.receiveShadow !== B.receiveShadow) && (Te.receiveShadow = B.receiveShadow, pt.setValue(C, "receiveShadow", B.receiveShadow)), W.isMeshGouraudMaterial && W.envMap !== null && (sn.envMap.value = ue, sn.flipEnvMap.value = ue.isCubeTexture && ue.isRenderTargetTexture === !1 ? -1 : 1), W.isMeshStandardMaterial && W.envMap === null && k.environment !== null && (sn.envMapIntensity.value = k.environmentIntensity), en && (pt.setValue(C, "toneMappingExposure", y.toneMappingExposure), Te.needsLights && jc(sn, lr), ie && W.fog === !0 && ee.refreshFogUniforms(sn, ie), ee.refreshMaterialUniforms(sn, W, D, V, f.state.transmissionRenderTarget[x.id]), us.upload(C, Co(Te), sn, He)), W.isShaderMaterial && W.uniformsNeedUpdate === !0 && (us.upload(C, Co(Te), sn, He), W.uniformsNeedUpdate = !1), W.isSpriteMaterial && pt.setValue(C, "center", B.center), pt.setValue(C, "modelViewMatrix", B.modelViewMatrix), pt.setValue(C, "normalMatrix", B.normalMatrix), pt.setValue(C, "modelMatrix", B.matrixWorld), W.isShaderMaterial || W.isRawShaderMaterial) {
        const Vt = W.uniformsGroups;
        for (let jt = 0, Rs = Vt.length; jt < Rs; jt++) {
          const oi = Vt[jt];
          Be.update(oi, Qt), Be.bind(oi, Qt);
        }
      }
      return Qt;
    }
    function jc(x, k) {
      x.ambientLightColor.needsUpdate = k, x.lightProbe.needsUpdate = k, x.directionalLights.needsUpdate = k, x.directionalLightShadows.needsUpdate = k, x.pointLights.needsUpdate = k, x.pointLightShadows.needsUpdate = k, x.spotLights.needsUpdate = k, x.spotLightShadows.needsUpdate = k, x.rectAreaLights.needsUpdate = k, x.hemisphereLights.needsUpdate = k;
    }
    function Kc(x) {
      return x.isMeshLambertMaterial || x.isMeshToonMaterial || x.isMeshPhongMaterial || x.isMeshStandardMaterial || x.isShadowMaterial || x.isShaderMaterial && x.lights === !0;
    }
    this.getActiveCubeFace = function() {
      return R;
    }, this.getActiveMipmapLevel = function() {
      return P;
    }, this.getRenderTarget = function() {
      return O;
    }, this.setRenderTargetTextures = function(x, k, G) {
      const W = ve.get(x);
      W.__autoAllocateDepthBuffer = x.resolveDepthBuffer === !1, W.__autoAllocateDepthBuffer === !1 && (W.__useRenderToTexture = !1), ve.get(x.texture).__webglTexture = k, ve.get(x.depthTexture).__webglTexture = W.__autoAllocateDepthBuffer ? void 0 : G, W.__hasExternalTextures = !0;
    }, this.setRenderTargetFramebuffer = function(x, k) {
      const G = ve.get(x);
      G.__webglFramebuffer = k, G.__useDefaultFramebuffer = k === void 0;
    };
    const Zc = C.createFramebuffer();
    this.setRenderTarget = function(x, k = 0, G = 0) {
      O = x, R = k, P = G;
      let W = !0, B = null, ie = !1, he = !1;
      if (x) {
        const ue = ve.get(x);
        if (ue.__useDefaultFramebuffer !== void 0)
          _e.bindFramebuffer(C.FRAMEBUFFER, null), W = !1;
        else if (ue.__webglFramebuffer === void 0)
          He.setupRenderTarget(x);
        else if (ue.__hasExternalTextures)
          He.rebindTextures(x, ve.get(x.texture).__webglTexture, ve.get(x.depthTexture).__webglTexture);
        else if (x.depthBuffer) {
          const we = x.depthTexture;
          if (ue.__boundDepthTexture !== we) {
            if (we !== null && ve.has(we) && (x.width !== we.image.width || x.height !== we.image.height))
              throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
            He.setupDepthRenderbuffer(x);
          }
        }
        const Re = x.texture;
        (Re.isData3DTexture || Re.isDataArrayTexture || Re.isCompressedArrayTexture) && (he = !0);
        const Ie = ve.get(x).__webglFramebuffer;
        x.isWebGLCubeRenderTarget ? (Array.isArray(Ie[k]) ? B = Ie[k][G] : B = Ie[k], ie = !0) : x.samples > 0 && He.useMultisampledRTT(x) === !1 ? B = ve.get(x).__webglMultisampledFramebuffer : Array.isArray(Ie) ? B = Ie[G] : B = Ie, L.copy(x.viewport), H.copy(x.scissor), $ = x.scissorTest;
      } else
        L.copy(ne).multiplyScalar(D).floor(), H.copy(Pe).multiplyScalar(D).floor(), $ = Ke;
      if (G !== 0 && (B = Zc), _e.bindFramebuffer(C.FRAMEBUFFER, B) && W && _e.drawBuffers(x, B), _e.viewport(L), _e.scissor(H), _e.setScissorTest($), ie) {
        const ue = ve.get(x.texture);
        C.framebufferTexture2D(C.FRAMEBUFFER, C.COLOR_ATTACHMENT0, C.TEXTURE_CUBE_MAP_POSITIVE_X + k, ue.__webglTexture, G);
      } else if (he) {
        const ue = k;
        for (let Re = 0; Re < x.textures.length; Re++) {
          const Ie = ve.get(x.textures[Re]);
          C.framebufferTextureLayer(C.FRAMEBUFFER, C.COLOR_ATTACHMENT0 + Re, Ie.__webglTexture, G, ue);
        }
      } else if (x !== null && G !== 0) {
        const ue = ve.get(x.texture);
        C.framebufferTexture2D(C.FRAMEBUFFER, C.COLOR_ATTACHMENT0, C.TEXTURE_2D, ue.__webglTexture, G);
      }
      S = -1;
    }, this.readRenderTargetPixels = function(x, k, G, W, B, ie, he, me = 0) {
      if (!(x && x.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let ue = ve.get(x).__webglFramebuffer;
      if (x.isWebGLCubeRenderTarget && he !== void 0 && (ue = ue[he]), ue) {
        _e.bindFramebuffer(C.FRAMEBUFFER, ue);
        try {
          const Re = x.textures[me], Ie = Re.format, we = Re.type;
          if (!Le.textureFormatReadable(Ie)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!Le.textureTypeReadable(we)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          k >= 0 && k <= x.width - W && G >= 0 && G <= x.height - B && (x.textures.length > 1 && C.readBuffer(C.COLOR_ATTACHMENT0 + me), C.readPixels(k, G, W, B, ye.convert(Ie), ye.convert(we), ie));
        } finally {
          const Re = O !== null ? ve.get(O).__webglFramebuffer : null;
          _e.bindFramebuffer(C.FRAMEBUFFER, Re);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(x, k, G, W, B, ie, he, me = 0) {
      if (!(x && x.isWebGLRenderTarget))
        throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let ue = ve.get(x).__webglFramebuffer;
      if (x.isWebGLCubeRenderTarget && he !== void 0 && (ue = ue[he]), ue)
        if (k >= 0 && k <= x.width - W && G >= 0 && G <= x.height - B) {
          _e.bindFramebuffer(C.FRAMEBUFFER, ue);
          const Re = x.textures[me], Ie = Re.format, we = Re.type;
          if (!Le.textureFormatReadable(Ie))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
          if (!Le.textureTypeReadable(we))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
          const We = C.createBuffer();
          C.bindBuffer(C.PIXEL_PACK_BUFFER, We), C.bufferData(C.PIXEL_PACK_BUFFER, ie.byteLength, C.STREAM_READ), x.textures.length > 1 && C.readBuffer(C.COLOR_ATTACHMENT0 + me), C.readPixels(k, G, W, B, ye.convert(Ie), ye.convert(we), 0);
          const Qe = O !== null ? ve.get(O).__webglFramebuffer : null;
          _e.bindFramebuffer(C.FRAMEBUFFER, Qe);
          const _t = C.fenceSync(C.SYNC_GPU_COMMANDS_COMPLETE, 0);
          return C.flush(), await vd(C, _t, 4), C.bindBuffer(C.PIXEL_PACK_BUFFER, We), C.getBufferSubData(C.PIXEL_PACK_BUFFER, 0, ie), C.deleteBuffer(We), C.deleteSync(_t), ie;
        } else
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
    }, this.copyFramebufferToTexture = function(x, k = null, G = 0) {
      const W = Math.pow(2, -G), B = Math.floor(x.image.width * W), ie = Math.floor(x.image.height * W), he = k !== null ? k.x : 0, me = k !== null ? k.y : 0;
      He.setTexture2D(x, 0), C.copyTexSubImage2D(C.TEXTURE_2D, G, 0, 0, he, me, B, ie), _e.unbindTexture();
    };
    const Jc = C.createFramebuffer(), Qc = C.createFramebuffer();
    this.copyTextureToTexture = function(x, k, G = null, W = null, B = 0, ie = null) {
      ie === null && (B !== 0 ? (wr("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."), ie = B, B = 0) : ie = 0);
      let he, me, ue, Re, Ie, we, We, Qe, _t;
      const ct = x.isCompressedTexture ? x.mipmaps[ie] : x.image;
      if (G !== null)
        he = G.max.x - G.min.x, me = G.max.y - G.min.y, ue = G.isBox3 ? G.max.z - G.min.z : 1, Re = G.min.x, Ie = G.min.y, we = G.isBox3 ? G.min.z : 0;
      else {
        const an = Math.pow(2, -B);
        he = Math.floor(ct.width * an), me = Math.floor(ct.height * an), x.isDataArrayTexture ? ue = ct.depth : x.isData3DTexture ? ue = Math.floor(ct.depth * an) : ue = 1, Re = 0, Ie = 0, we = 0;
      }
      W !== null ? (We = W.x, Qe = W.y, _t = W.z) : (We = 0, Qe = 0, _t = 0);
      const it = ye.convert(k.format), Te = ye.convert(k.type);
      let ft;
      k.isData3DTexture ? (He.setTexture3D(k, 0), ft = C.TEXTURE_3D) : k.isDataArrayTexture || k.isCompressedArrayTexture ? (He.setTexture2DArray(k, 0), ft = C.TEXTURE_2D_ARRAY) : (He.setTexture2D(k, 0), ft = C.TEXTURE_2D), C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL, k.flipY), C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL, k.premultiplyAlpha), C.pixelStorei(C.UNPACK_ALIGNMENT, k.unpackAlignment);
      const Ye = C.getParameter(C.UNPACK_ROW_LENGTH), Qt = C.getParameter(C.UNPACK_IMAGE_HEIGHT), Ai = C.getParameter(C.UNPACK_SKIP_PIXELS), en = C.getParameter(C.UNPACK_SKIP_ROWS), lr = C.getParameter(C.UNPACK_SKIP_IMAGES);
      C.pixelStorei(C.UNPACK_ROW_LENGTH, ct.width), C.pixelStorei(C.UNPACK_IMAGE_HEIGHT, ct.height), C.pixelStorei(C.UNPACK_SKIP_PIXELS, Re), C.pixelStorei(C.UNPACK_SKIP_ROWS, Ie), C.pixelStorei(C.UNPACK_SKIP_IMAGES, we);
      const pt = x.isDataArrayTexture || x.isData3DTexture, sn = k.isDataArrayTexture || k.isData3DTexture;
      if (x.isDepthTexture) {
        const an = ve.get(x), Vt = ve.get(k), jt = ve.get(an.__renderTarget), Rs = ve.get(Vt.__renderTarget);
        _e.bindFramebuffer(C.READ_FRAMEBUFFER, jt.__webglFramebuffer), _e.bindFramebuffer(C.DRAW_FRAMEBUFFER, Rs.__webglFramebuffer);
        for (let oi = 0; oi < ue; oi++)
          pt && (C.framebufferTextureLayer(C.READ_FRAMEBUFFER, C.COLOR_ATTACHMENT0, ve.get(x).__webglTexture, B, we + oi), C.framebufferTextureLayer(C.DRAW_FRAMEBUFFER, C.COLOR_ATTACHMENT0, ve.get(k).__webglTexture, ie, _t + oi)), C.blitFramebuffer(Re, Ie, he, me, We, Qe, he, me, C.DEPTH_BUFFER_BIT, C.NEAREST);
        _e.bindFramebuffer(C.READ_FRAMEBUFFER, null), _e.bindFramebuffer(C.DRAW_FRAMEBUFFER, null);
      } else if (B !== 0 || x.isRenderTargetTexture || ve.has(x)) {
        const an = ve.get(x), Vt = ve.get(k);
        _e.bindFramebuffer(C.READ_FRAMEBUFFER, Jc), _e.bindFramebuffer(C.DRAW_FRAMEBUFFER, Qc);
        for (let jt = 0; jt < ue; jt++)
          pt ? C.framebufferTextureLayer(C.READ_FRAMEBUFFER, C.COLOR_ATTACHMENT0, an.__webglTexture, B, we + jt) : C.framebufferTexture2D(C.READ_FRAMEBUFFER, C.COLOR_ATTACHMENT0, C.TEXTURE_2D, an.__webglTexture, B), sn ? C.framebufferTextureLayer(C.DRAW_FRAMEBUFFER, C.COLOR_ATTACHMENT0, Vt.__webglTexture, ie, _t + jt) : C.framebufferTexture2D(C.DRAW_FRAMEBUFFER, C.COLOR_ATTACHMENT0, C.TEXTURE_2D, Vt.__webglTexture, ie), B !== 0 ? C.blitFramebuffer(Re, Ie, he, me, We, Qe, he, me, C.COLOR_BUFFER_BIT, C.NEAREST) : sn ? C.copyTexSubImage3D(ft, ie, We, Qe, _t + jt, Re, Ie, he, me) : C.copyTexSubImage2D(ft, ie, We, Qe, Re, Ie, he, me);
        _e.bindFramebuffer(C.READ_FRAMEBUFFER, null), _e.bindFramebuffer(C.DRAW_FRAMEBUFFER, null);
      } else
        sn ? x.isDataTexture || x.isData3DTexture ? C.texSubImage3D(ft, ie, We, Qe, _t, he, me, ue, it, Te, ct.data) : k.isCompressedArrayTexture ? C.compressedTexSubImage3D(ft, ie, We, Qe, _t, he, me, ue, it, ct.data) : C.texSubImage3D(ft, ie, We, Qe, _t, he, me, ue, it, Te, ct) : x.isDataTexture ? C.texSubImage2D(C.TEXTURE_2D, ie, We, Qe, he, me, it, Te, ct.data) : x.isCompressedTexture ? C.compressedTexSubImage2D(C.TEXTURE_2D, ie, We, Qe, ct.width, ct.height, it, ct.data) : C.texSubImage2D(C.TEXTURE_2D, ie, We, Qe, he, me, it, Te, ct);
      C.pixelStorei(C.UNPACK_ROW_LENGTH, Ye), C.pixelStorei(C.UNPACK_IMAGE_HEIGHT, Qt), C.pixelStorei(C.UNPACK_SKIP_PIXELS, Ai), C.pixelStorei(C.UNPACK_SKIP_ROWS, en), C.pixelStorei(C.UNPACK_SKIP_IMAGES, lr), ie === 0 && k.generateMipmaps && C.generateMipmap(ft), _e.unbindTexture();
    }, this.initRenderTarget = function(x) {
      ve.get(x).__webglFramebuffer === void 0 && He.setupRenderTarget(x);
    }, this.initTexture = function(x) {
      x.isCubeTexture ? He.setTextureCube(x, 0) : x.isData3DTexture ? He.setTexture3D(x, 0) : x.isDataArrayTexture || x.isCompressedArrayTexture ? He.setTexture2DArray(x, 0) : He.setTexture2D(x, 0), _e.unbindTexture();
    }, this.resetState = function() {
      R = 0, P = 0, O = null, _e.reset(), ce.reset();
    }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  /**
   * Defines the coordinate system of the renderer.
   *
   * In `WebGLRenderer`, the value is always `WebGLCoordinateSystem`.
   *
   * @type {WebGLCoordinateSystem|WebGPUCoordinateSystem}
   * @default WebGLCoordinateSystem
   * @readonly
   */
  get coordinateSystem() {
    return Rn;
  }
  /**
   * Defines the output color space of the renderer.
   *
   * @type {SRGBColorSpace|LinearSRGBColorSpace}
   * @default SRGBColorSpace
   */
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(e) {
    this._outputColorSpace = e;
    const t = this.getContext();
    t.drawingBufferColorSpace = je._getDrawingBufferColorSpace(e), t.unpackColorSpace = je._getUnpackColorSpace();
  }
}
const Mt = (i) => i / 1e3;
function $g(i) {
  let e, t;
  function n() {
    e && (e.traverse((a) => {
      a.geometry?.dispose(), a.material && (a.material.map?.dispose(), a.material.dispose());
    }), e.removeFromParent(), e = null);
  }
  function r(a, o, l, c = 0.012) {
    const h = new si(Mt(a.width), Mt(a.depth)), d = new Ot(h, new qn({ color: o, transparent: !0, opacity: l, depthWrite: !1, side: rn }));
    d.rotation.set(-Math.PI / 2, 0, (a.rotation || 0) * Math.PI / 180), d.position.set(Mt(a.x), c, Mt(a.z)), e.add(d);
  }
  function s(a, o) {
    if (![a.x, a.z, a.width, a.depth].every(Number.isFinite)) return;
    const l = new yn(Mt(a.width), Math.max(0.02, Mt(a.height || 10)), Mt(a.depth)), c = new Zi(l);
    l.dispose();
    const h = new Si(c, new Xn({ color: o, transparent: !0, opacity: 0.9, depthTest: !1 }));
    h.position.set(Mt(a.x), Math.max(0.02, Mt(a.height || 10)) / 2 + 0.025, Mt(a.z)), h.rotation.y = -(a.rotation || 0) * Math.PI / 180, h.renderOrder = 30, e.add(h);
  }
  return {
    update(a, o, l = [], c = []) {
      const h = JSON.stringify([a.zones, a.clearance, a.placements, o.map((d) => [d.id, d.width, d.depth, d.height]), l, c]);
      if (h !== t) {
        t = h, n(), e = new qt(), i.scene.add(e);
        for (const d of a.zones || []) {
          r(d, d.color, 0.2);
          const u = document.createElement("canvas");
          u.width = 1024, u.height = 128;
          const p = u.getContext("2d");
          p.font = "bold 60px sans-serif", p.textAlign = "center", p.textBaseline = "middle", p.fillStyle = d.color, p.fillText(d.name, 512, 64, 1e3);
          const g = new Qa(u), _ = new Ot(new si(Mt(d.width) * 0.85, Math.min(Mt(d.depth) * 0.4, Mt(d.width) * 0.10625)), new qn({ map: g, transparent: !0, depthWrite: !1, side: rn }));
          _.rotation.x = -Math.PI / 2, _.position.set(Mt(d.x), 0.019, Mt(d.z)), e.add(_);
        }
        if (a.clearance?.enabled) for (const d of a.placements) {
          const u = o.find((_) => _.id === d.rack_id);
          if (!u) continue;
          const p = { ...d, ...Ut(u, d) }, g = vr(p, a.clearance);
          r(g, "#d69b24", 0.13, 0.021);
        }
        for (const d of l)
          d.old && s(d.old, "#e66c59"), d.current && s(d.current, d.type === "added" ? "#19a783" : "#dda323");
        for (const d of c) {
          const u = d.ends.filter((g) => g.side === "A"), p = d.ends.filter((g) => g.side === "B");
          for (const g of u) for (const _ of p) {
            const m = a.placements.find((S) => S.rack_id === g.rack_id), f = a.placements.find((S) => S.rack_id === _.rack_id);
            if (!m || !f) continue;
            const T = o.find((S) => S.id === m.rack_id), b = o.find((S) => S.id === f.rack_id);
            if (!T || !b) continue;
            const y = new N(Mt(m.x), Mt(Ut(T, m).height) + 0.08, Mt(m.z)), w = new N(Mt(f.x), Mt(Ut(b, f).height) + 0.08, Mt(f.z)), R = y.clone().add(w).multiplyScalar(0.5);
            R.y = Math.max(y.y, w.y) + 0.5, m.rack_id === f.rack_id && (R.x += 0.5);
            const P = new Zd(y, R, w), O = new Ec(new un().setFromPoints(P.getPoints(30)), new Xn({ color: /^#[0-9a-fA-F]{6}$/.test(d.color) ? d.color : "#168a87", depthTest: !1 }));
            O.renderOrder = 31, e.add(O);
          }
        }
        i.draw();
      }
    },
    dispose: n
  };
}
function Xg(i) {
  let e, t;
  const n = () => {
    e && (e.traverse((r) => {
      r.geometry?.dispose(), r.material?.dispose(), r.element?.remove();
    }), e.removeFromParent(), e = null);
  };
  return { update(r, s, a, o) {
    const l = JSON.stringify([r.placements, s.map((c) => [c.id, c.width, c.depth, c.height, c.u_height, c.starting_unit, c.desc_units]), a, o]);
    if (l !== t && (t = l, n(), !(!a || !o))) {
      e = new qt(), i.scene.add(e);
      for (const c of r.placements) {
        const h = s.find((b) => b.id === c.rack_id), d = a.racks.find((b) => b.id === c.rack_id);
        if (!h || !d) continue;
        const u = Ut(h, c), p = u.width / 1e3, g = u.depth / 1e3, _ = u.height / 1e3, m = new qt();
        if (m.position.set(c.x / 1e3, 0, c.z / 1e3), m.rotation.y = -(c.rotation || 0) * Math.PI / 180, e.add(m), d.complete) {
          const b = d.after.occupancy_percent, y = b >= 90 ? "#d95547" : b >= 70 ? "#dda323" : "#168a87", w = new Ot(new si(p, g), new qn({ color: y, transparent: !0, opacity: 0.25, depthWrite: !1, side: rn }));
          w.rotation.x = -Math.PI / 2, w.position.y = 0.026, m.add(w);
        }
        const f = (b, y, w) => {
          const R = Ms(h, b);
          if (R == null) return;
          const P = b.u_height * 44.45 / 1e3, O = b.full_depth ? g - 0.08 : g * 0.42, S = new Ot(new yn(Math.min((h.rail_width || 482.6) / 1e3, p - 0.08), Math.max(8e-3, P - 3e-3), O), new qn({ color: y, transparent: !0, opacity: w, depthWrite: !1, depthTest: !1 }));
          S.position.set(0, (_ - h.u_height * 44.45 / 1e3) / 2 + R / 1e3 + P / 2, b.full_depth ? 0 : (b.face === "rear" ? -1 : 1) * (g / 2 - O / 2 - 0.03)), S.renderOrder = 35, m.add(S);
          const M = new Zi(S.geometry), L = new Si(M, new Xn({ color: y, depthTest: !1 }));
          L.position.copy(S.position), L.renderOrder = 36, m.add(L);
        };
        for (const b of d.reservations) for (const y of b.units) f({ position: y, u_height: 1, face: "front", full_depth: !0 }, "#d69b24", 0.12);
        const T = a.planned_devices.filter((b) => b.rack_id === h.id);
        for (const b of T) b.u_height && f(b, b.valid ? "#008fcb" : "#d95547", 0.42);
        T.length && i.label(`가상 ${T.length}대`, p * 0.85, _ + 0.1, 0, m, "planned-device");
      }
      i.draw();
    }
  }, dispose: n };
}
const Wt = (i) => String(i ?? "").replace(/[&<>"']/g, (e) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[e]), ln = (i, e, t = "", n = !1) => `<button type="button" class="r3-btn small" data-op="${i}" data-id="${Wt(t)}" ${n ? "disabled" : ""}>${e}</button>`;
function qg({ body: i, get: e, request: t, apply: n, message: r, render: s, redraw: a }) {
  let o = null, l = null, c = [], h, d = "", u = "", p = "", g = "front", _ = null, m = !0, f = "", T, b, y = "";
  const w = Xg(e().scene), R = (A) => JSON.stringify([A.locationId, A.layout.include_descendants, A.layout.planned_devices || []]), P = (A) => ({ include_descendants: e().layout.include_descendants, planned_devices: A ?? e().layout.planned_devices ?? [] }), O = (A) => i.elements.namedItem(A)?.value;
  function S() {
    const A = e();
    if (!A.layout) return;
    h !== A.locationId && (h = A.locationId, o = null, l = null, c = [], _ = null, p = "", d = "", f = ""), b !== A.racks && (b = A.racks, o = null, u = "", y = "");
    const U = R(A);
    if (U !== d && (d = U, u !== U && (o = null, l = null)), w.update(A.layout, A.racks, o, m), (A.layout.planned_devices || []).length && u !== U && y !== U) {
      clearTimeout(T);
      const V = A, D = P(), F = U;
      T = setTimeout(async () => {
        if (u !== F)
          try {
            const X = await tc(V, "capacity", D);
            R(e()) === F && (M(X), a());
          } catch {
            y = F;
          }
      }, 150);
    }
  }
  function M(A) {
    o = A, u = R(e()), S();
  }
  async function L(A) {
    return t("capacity", P(A));
  }
  function H(A) {
    return `${A.used_u}U 사용 · ${A.reserved_u}U 예약 · ${A.planned_u}U 가상 · ${A.free_u}U 가용 · 점유 ${A.occupancy_percent}%`;
  }
  function $(A) {
    const U = e(), V = !U.editable || U.busy, D = U.layout.planned_devices || [];
    if (A === 0)
      i.innerHTML = `<p>예약은 모든 상태를 공간 점유로 반영합니다. 점유율은 양면 중복을 제거하고, 전·후면 가용 공간은 별도로 계산합니다.</p><div>${ln("capacity-refresh", "최신 용량 계산", "", U.busy)}${ln("capacity-overlay", m ? "3D 표시 끄기" : "3D 표시 켜기")}</div>${o ? `<p>${o.complete_racks}개 랙 계산 완료 · ${o.unknown_racks}개 계산 불가</p><div class="r3-operation-row"><strong>서버실 전체 · 계산 가능한 랙 기준</strong><br>현재: ${H(o.totals.before)}<br>증설 후: ${H(o.totals.after)}</div><div class="r3-operation-list">${o.racks.map((F) => `<div class="r3-operation-row"><strong>${Wt(F.name)}</strong>${F.complete ? `<br>${H(F.after)}<br>전면: 가용 ${F.after.front.free_u}U / 최대 연속 ${F.after.front.max_contiguous_u}U<br>후면: 가용 ${F.after.rear.free_u}U / 최대 연속 ${F.after.rear.max_contiguous_u}U` : "<p>조회 범위 부족 또는 배치 정보 오류로 계산할 수 없습니다.</p>"}${F.reservations.map((X) => {
        const ne = Ss(X.url);
        return `<p>예약 U${Wt(X.units.join(", "))} · ${Wt(X.status)} · ${ne ? `<a href="${Wt(ne)}" target="_blank" rel="noopener noreferrer">${Wt(X.description || "예약 상세")}</a>` : Wt(X.description)}</p>`;
      }).join("")}${ln("capacity-focus", "랙 보기", F.id)}</div>`).join("")}</div>` : "<p>최신 용량 계산을 눌러 예약과 가용 U를 조회하세요.</p>"}`;
    else if (A === 1)
      i.innerHTML = `<p>U 공간 조건에 맞는 후보입니다. 전력·중량·실측 깊이는 별도로 확인하세요. 0U 장비는 추천하지 않습니다.</p><label>장비 유형 검색<input name="type-query" value="${Wt(f)}" maxlength="100"></label>${ln("capacity-types", "장비 유형 조회", "", U.busy)}<div class="r3-operation-grid"><label>Device Type<select class="no-ts" name="device-type">${c.map((F) => `<option value="${F.id}" ${String(F.id) === String(p) ? "selected" : ""}>${Wt(F.model)} · ${F.u_height}U · ${F.full_depth ? "전체 깊이" : "반깊이"}</option>`).join("")}</select></label><label>장착면<select class="no-ts" name="face"><option value="front" ${g === "front" ? "selected" : ""}>전면</option><option value="rear" ${g === "rear" ? "selected" : ""}>후면</option></select></label></div>${ln("capacity-recommend", "설치 후보 조회", "", U.busy || !c.length)}${l ? `<p>${l.candidates.length}개 후보 · ${l.unknown_racks}개 계산 불가</p><div class="r3-operation-list">${l.candidates.map((F) => `<div class="r3-operation-row"><strong>${Wt(F.rack)}</strong>${U.layout.placements.some((X) => X.rack_id === F.rack_id) ? "" : " · 3D 미배치"}<br>가용 ${F.free_u}U · 최대 연속 ${F.max_contiguous_u}U<label>시작 U<select name="candidate-${F.rack_id}" class="no-ts">${F.positions.map((X) => `<option value="${X}">U${X}</option>`).join("")}</select></label>${ln("capacity-add", "가상 장비 추가", F.rack_id, V)}${ln("capacity-focus", "랙 보기", F.rack_id)}</div>`).join("") || "설치 가능한 후보가 없습니다."}</div>` : ""}`;
    else {
      const F = D.find((X) => X.id === _);
      i.innerHTML = `<p>가상 장비는 Room 3D 배치안에만 저장됩니다. 장비 추가는 설치 후보 탭을 사용하세요.</p><div>${ln("capacity-refresh", "현재 계획 재검사", "", U.busy)}${ln("capacity-overlay", m ? "3D 표시 끄기" : "3D 표시 켜기")}</div>${o ? `<div class="r3-operation-row">현재: ${H(o.totals.before)}<br>증설 후: ${H(o.totals.after)}</div>${o.issues.map((X) => `<p class="error">${Wt(X.message)}</p>`).join("")}` : ""}<div class="r3-operation-list">${D.map((X) => `<div class="r3-operation-row"><strong>${Wt(X.name)}</strong> · ${Wt(U.racks.find((ne) => ne.id === X.rack_id)?.name || "참조 없음")} · U${X.position} · ${X.face === "rear" ? "후면" : "전면"}${ln("capacity-edit", "이동·이름 변경", X.id, V)}${ln("capacity-delete", "삭제", X.id, V)}</div>`).join("") || "가상 장비가 없습니다."}</div>${F ? `<label>가상 장비 이름<input name="planned-name" value="${Wt(F.name)}" maxlength="100" required></label><div class="r3-operation-grid"><label>랙<select name="planned-rack" class="no-ts">${U.racks.map((X) => `<option value="${X.id}" ${F.rack_id === X.id ? "selected" : ""}>${Wt(X.name)}</option>`).join("")}</select></label><label>시작 U<input name="planned-position" type="number" min="0.5" step="0.5" value="${F.position}" required></label><label>장착면<select name="planned-face" class="no-ts"><option value="front" ${F.face === "front" ? "selected" : ""}>전면</option><option value="rear" ${F.face === "rear" ? "selected" : ""}>후면</option></select></label></div>${ln("capacity-move", "변경 적용", F.id, V)}` : ""}`;
    }
  }
  async function Z(A, U) {
    if (!A.startsWith("capacity-")) return !1;
    const V = e();
    if (A === "capacity-overlay")
      return m = !m, S(), s(), !0;
    if (A === "capacity-focus")
      return V.highlight(Number(U)), r("닫기를 눌러 선택한 랙을 확인하세요."), !0;
    if (A === "capacity-refresh")
      return M(await L()), s(), r(o.issues.length ? "계획 충돌을 수정한 뒤 배치 저장을 누르세요." : "최신 예약과 인벤토리로 계산했습니다.", o.issues.length > 0), !0;
    if (A === "capacity-types") {
      f = O("type-query") || "";
      const ne = await t("device-types", void 0, `?q=${encodeURIComponent(f)}`);
      return c = ne.device_types, s(), r(ne.truncated ? "200개를 표시합니다. 검색어를 더 구체적으로 입력하세요." : "조회 가능한 장비 유형을 불러왔습니다."), !0;
    }
    if (A === "capacity-recommend")
      return p = O("device-type"), g = O("face"), l = await t("recommendations", { ...P(), device_type_id: Number(p), face: g }), s(), r("후보의 시작 U를 선택해 가상 장비를 추가하세요."), !0;
    if (A === "capacity-edit")
      return _ = U, s(), !0;
    if (!V.editable) throw Error("읽기 전용입니다.");
    const D = structuredClone(V.layout);
    if (D.planned_devices ??= [], A === "capacity-add") {
      const ne = l?.device_type;
      if (!ne) throw Error("후보를 다시 조회하세요.");
      D.planned_devices.push({ id: crypto.randomUUID(), name: `${ne.model} 증설`.slice(0, 100), device_type_id: ne.id, rack_id: Number(U), position: Number(O(`candidate-${U}`)), face: g });
    } else if (A === "capacity-delete")
      D.planned_devices = D.planned_devices.filter((ne) => ne.id !== U), _ = null;
    else if (A === "capacity-move") {
      if (!i.reportValidity()) return !0;
      const ne = D.planned_devices.find((Pe) => Pe.id === U);
      if (!ne) throw Error("가상 장비를 다시 선택하세요.");
      Object.assign(ne, { name: O("planned-name").trim(), rack_id: Number(O("planned-rack")), position: Number(O("planned-position")), face: O("planned-face") });
    } else return !0;
    const F = await L(D.planned_devices), X = F.issues.filter((ne) => A === "capacity-add" || ne.id === U);
    if (X.length)
      throw M(await L()), Error(X.map((ne) => ne.message).join(" / "));
    return n(D, !1), M(F), l = null, s(), a(), r(F.issues.length ? "편집본에 적용했습니다. 남은 계획 충돌을 수정한 뒤 배치 저장을 누르세요." : "가상 증설 편집본에 적용했습니다. 배치 저장으로 확정하세요.", F.issues.length > 0), !0;
  }
  return { render: $, action: Z, sync: S, dispose: () => {
    clearTimeout(T), w.dispose();
  } };
}
const mt = (i) => String(i ?? "").replace(/[&<>"']/g, (e) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[e]), Yg = ["통로", "구역", "변경 비교", "열 배치", "참조 정리", "시점", "배치안", "케이블", "예약·용량", "설치 후보", "가상 증설"], ut = (i, e, t = !1, n = "") => `<button type="button" class="r3-btn small" data-op="${i}" data-id="${mt(n)}" ${t ? "disabled" : ""}>${e}</button>`, gn = (i, e, t, n = 0, r = 1e5) => `<label>${e}<input name="${i}" type="number" value="${mt(t)}" min="${n}" max="${r}" step="any" required></label>`;
function jg(i, e) {
  const t = document.createElement("button");
  t.type = "button", t.id = "r3-operations-open", t.className = "r3-btn small", t.textContent = "운영 도구", i.querySelector(".r3-tools").append(t);
  const n = document.createElement("dialog");
  n.className = "r3-operations", n.id = "r3-operations", n.innerHTML = `<div class="r3-dialog-title"><h2>운영 도구</h2>${ut("close", "닫기")}</div><div class="r3-operation-tabs" role="tablist" aria-label="운영 도구">${Yg.map((A, U) => `<button class="r3-btn small" role="tab" data-tab="${U}" aria-selected="false">${U + 1}. ${A}</button>`).join("")}</div><form class="r3-operation-body"></form><div class="r3-operation-status" role="status" aria-live="polite"></div>`, i.append(n);
  const r = n.querySelector("form"), s = n.querySelector("[role=status]");
  let a = 0, o, l, c = [], h = null, d = null, u = [], p = !1, g = null, _ = !1;
  const m = $g(e().scene), f = (A = "", U = !1) => {
    s.textContent = A, s.classList.toggle("error", U);
  }, T = (A) => r.elements.namedItem(A)?.value, b = (A) => Number(T(A)), y = qg({ body: r, get: e, request: $, apply: S, message: f, render: M, redraw: H }), w = () => `room3d-camera-v1-${e().locationId}`;
  function R() {
    try {
      const A = JSON.parse(localStorage.getItem(w()) || "[]");
      return Array.isArray(A) ? A.filter((U) => Dr(U.camera)).slice(0, 20) : [];
    } catch {
      return [];
    }
  }
  function P() {
    const A = e().scene, U = { mode: A.mode, position: A.camera.position.toArray(), target: A.controls.target.toArray() };
    if (!Dr(U)) throw new Error("워킹 모드를 종료한 뒤 시점을 저장하세요.");
    return U;
  }
  function O(A) {
    if (!Dr(A)) throw new Error("유효하지 않은 시점입니다.");
    const U = e();
    U.view(A.mode), U.scene.camera.position.fromArray(A.position), U.scene.controls.target.fromArray(A.target), U.scene.controls.update(), U.scene.draw();
  }
  function S(A, U = !0) {
    const V = e();
    if (!V.editable) throw new Error("읽기 전용입니다.");
    if (U) {
      const D = Pn(A, V.racks);
      if (D.length) throw new Error(D.slice(0, 3).join(" / "));
    }
    V.apply(A), f("편집본에 적용했습니다. 배치 저장을 눌러 확정하세요.");
  }
  function M() {
    const A = e();
    if (!A.layout) return;
    const U = A.layout, V = !A.editable || p;
    if (n.querySelectorAll("[data-tab]").forEach((D) => {
      D.setAttribute("aria-selected", String(Number(D.dataset.tab) === a)), D.disabled = p;
    }), a === 0) {
      const D = U.clearance || { enabled: !1, front: 1e3, rear: 800 };
      r.innerHTML = `<p>랙 전면·후면 작업 공간을 확보합니다. 작업 공간끼리는 공유할 수 있지만 랙·장애물이 침범하면 저장을 차단합니다.</p><label class="r3-check"><input name="enabled" type="checkbox" ${D.enabled ? "checked" : ""}> 통로 검사 사용</label><div class="r3-operation-grid">${gn("front", "전면 여유 (mm)", D.front, 0, 1e4)}${gn("rear", "후면 여유 (mm)", D.rear, 0, 1e4)}</div>${ut("clearance", "설정 적용", V)}<p class="r3-help">적용 후 경고가 있으면 좌표를 수정하거나 화면의 겹침 자동 수정을 사용하세요. 노란 음영은 작업 공간입니다.</p>`;
    } else if (a === 1) {
      const D = (U.zones || []).find((F) => F.id === g);
      r.innerHTML = `<p>구역은 바닥 표시 전용입니다. 랙 배치·워킹 이동을 막지 않습니다.</p><div class="r3-operation-list">${(U.zones || []).map((F) => `<div class="r3-operation-row"><strong>${mt(F.name)}</strong> · ${F.width} × ${F.depth} mm ${ut("zone-edit", "편집", V, F.id)}${ut("zone-delete", "삭제", V, F.id)}</div>`).join("") || "등록된 구역 없음"}</div><label>구역 이름<input name="name" maxlength="100" required value="${mt(D?.name || "")}"></label><label>색상<input name="color" type="color" value="${mt(D?.color || "#277f9a")}"></label><div class="r3-operation-grid">${gn("x", "좌측 X (mm)", D ? D.x - D.width / 2 : 0)}${gn("z", "상단 Z (mm)", D ? D.z - D.depth / 2 : 0)}${gn("width", "폭 (mm)", D?.width || Math.min(3e3, U.width), 100)}${gn("depth", "깊이 (mm)", D?.depth || Math.min(2e3, U.depth), 100)}</div><div>${ut("zone-save", D ? "구역 수정" : "구역 추가", V)}${ut("zone-new", "새 구역", V)}</div>`;
    } else if (a === 2) {
      const D = Uo(d || A.baseline, U, A.racks);
      r.innerHTML = `<p>기준: ${d ? "선택한 배치안" : "마지막 저장본"} / 비교 대상: 현재 편집본</p><p class="r3-zone-legend">빨강: 이전 위치·삭제 / 초록: 추가 / 노랑: 변경</p><div>${ut("diff-show", "3D 비교 표시")}${ut("diff-clear", "비교 표시 끄기")}${ut("diff-baseline", "저장본을 기준으로")}</div><div class="r3-operation-list">${D.map((F) => `<div class="r3-operation-row"><strong>${mt(F.name || F.key)}</strong> · ${mt({ added: "추가", removed: "삭제", changed: "변경", setting: "설정 변경" }[F.type])}${F.fields ? `<br>${mt(F.fields.join(", "))}` : ""}</div>`).join("") || "변경 사항이 없습니다."}</div>`;
    } else if (a === 3) {
      const D = new Set(U.placements.map((X) => X.rack_id)), F = A.racks.filter((X) => !D.has(X.id));
      r.innerHTML = `<p>미배치 랙을 선택한 순서가 아닌 라이브러리 순서로 배치합니다. 좌표는 첫 랙의 좌측 상단 기준입니다. 실패하면 전체 배치를 유지합니다.</p><div class="r3-operation-list">${F.map((X) => `<label class="r3-check"><input type="checkbox" name="racks" value="${X.id}" checked> ${mt(X.name)} · ${X.width} × ${X.depth} mm</label>`).join("") || "미배치 랙이 없습니다."}</div><div class="r3-operation-grid">${gn("x", "시작 X (mm)", 0)}${gn("z", "시작 Z (mm)", 0)}${gn("columns", "한 행의 랙 개수", 4, 1, 1e3)}${gn("gapX", "열 사이 간격 (mm)", 600)}${gn("gapZ", "행 사이 간격 (mm)", 1200)}<label>방향<select name="rotation" class="no-ts">${[0, 90, 180, 270].map((X) => `<option value="${X}">${X}도</option>`).join("")}</select></label></div>${ut("rows", "선택 랙 일괄 배치", V || !F.length)}`;
    } else if (a === 4)
      r.innerHTML = `<p>관리자 전용: 삭제되거나 다른 Location으로 이동한 랙의 배치 참조, 남은 장비 표시 설정과 이미지 참조를 정리합니다. NetBox 랙·장비 자체는 삭제하지 않습니다. 대체 배치안은 유지됩니다.</p>${ut("cleanup-preview", "정리 대상 미리보기", !A.canCleanup || p)}${h ? `<div class="r3-operation-row">랙 ID: ${mt(h.changes.rack_ids.join(", ") || "없음")}<br>장비 표시 ID: ${mt(h.changes.device_ids.join(", ") || "없음")}<br>이미지 참조: ${mt(h.changes.images.join(", ") || "없음")}</div>${ut("cleanup-apply", "확인 후 참조 정리", !A.canCleanup || p || !Object.values(h.changes).some((D) => D.length))}` : ""}${A.canCleanup ? "" : "<p>NetBox 슈퍼유저로 저장된 배치를 열어야 사용할 수 있습니다.</p>"}`;
    else if (a === 5)
      r.innerHTML = `<p>즐겨찾기는 현재 브라우저·Location별로 저장됩니다. 공유 링크는 시점만 포함하며 NetBox 조회 권한을 우회하지 않습니다.</p><label>시점 이름<input name="name" maxlength="100" value="기본 시점"></label><div>${ut("camera-save", "현재 시점 저장")}${ut("camera-share", "공유 링크 만들기")}</div><label>공유 링크<input name="share" readonly aria-label="시점 공유 링크"></label><div class="r3-operation-list">${R().map((D) => `<div class="r3-operation-row">${mt(D.name)} ${ut("camera-load", "이동", !1, D.id)}${ut("camera-delete", "삭제", !1, D.id)}</div>`).join("")}</div>`;
    else if (a === 6)
      r.innerHTML = `<p>Location마다 최대 10개의 배치안을 저장합니다. 불러온 안은 편집본이며 배치 저장을 눌러야 현재 배치가 바뀝니다.</p><label>새 배치안 이름<input name="name" maxlength="100" placeholder="예: 증설 검토안"></label><div>${ut("plan-create", "현재 편집본을 배치안으로 저장", V)}${ut("plans", "목록 새로고침", p)}</div><div class="r3-operation-list">${c.map((D) => `<div class="r3-operation-row"><strong>${mt(D.name)}</strong><br>${mt(D.saved_at)}${D.valid ? "" : "<p>참조가 유효하지 않은 배치안입니다.</p>"}<div>${ut("plan-load", "불러오기", V || !D.valid, D.id)}${ut("plan-compare", "현재 편집본과 비교", !D.valid, D.id)}${ut("plan-rename", "이름 변경", V, D.id)}${ut("plan-delete", "삭제", V, D.id)}</div></div>`).join("") || "목록 새로고침으로 저장된 배치안을 조회하세요."}</div>`;
    else if (a === 7) {
      const D = A.racks.flatMap((F) => F.devices).find((F) => F.id === A.selected?.deviceId);
      r.innerHTML = `<p>선택 장비: <strong>${mt(D?.name || "3D 화면에서 장비를 먼저 선택하세요")}</strong></p><p>직접 연결된 케이블만 조회합니다. 패치 패널을 통과한 전체 경로 추적은 포함하지 않습니다. 선은 랙 간 연결 개요이며 실제 케이블 경로·길이가 아닙니다.</p><div>${ut("cables", "선택 장비 케이블 조회", p || !D)}${ut("cables-clear", "연결선 숨기기")}</div><div class="r3-operation-list">${u.map((F) => {
        const X = Ss(F.url);
        return `<div class="r3-operation-row"><strong>${X ? `<a href="${mt(X)}" target="_blank" rel="noopener noreferrer">${mt(F.label)}</a>` : mt(F.label)}</strong> · ${mt(F.status)}<br>${F.ends.map((ne) => `${mt(ne.side)}: ${mt(ne.device)} / ${mt(ne.port)}${U.placements.some((Pe) => Pe.rack_id === ne.rack_id) ? "" : " (방 밖 또는 미배치)"}`).join("<br>")}</div>`;
      }).join("") || "조회 결과가 없습니다."}</div>`;
    } else
      y.render(a - 8);
  }
  let L = !1;
  function H() {
    const A = e();
    if (t.disabled = !A.layout || A.busy, !!A.layout && (o !== A.locationId && (o = A.locationId, c = [], h = null, d = null, u = [], L = !1, g = null, n.open && (M(), f())), l !== A.selected?.deviceId && (l = A.selected?.deviceId, u = [], n.open && a === 7 && M()), m.update(A.layout, A.racks, L ? Uo(d || A.baseline, A.layout, A.racks) : [], u), y.sync(), !_)) {
      _ = !0;
      try {
        const U = new URLSearchParams(window.location.hash.slice(1)).get("view");
        if (U && U.length < 2e3) {
          const V = JSON.parse(U);
          Dr(V) && requestAnimationFrame(() => {
            o === A.locationId && O(V);
          });
        }
      } catch {
      }
    }
  }
  async function $(A, U, V = "") {
    const D = e(), F = D.locationId, X = JSON.stringify(D.layout);
    p = !0, D.setBusy(!0), M();
    try {
      const ne = await tc(D, A, U, V);
      if (e().locationId !== F || JSON.stringify(e().layout) !== X) throw new Error("화면이 변경되었습니다. 다시 조회하세요.");
      return ne;
    } finally {
      p = !1, D.setBusy(!1);
    }
  }
  async function Z(A, U) {
    const V = e(), D = structuredClone(V.layout);
    if (A === "close") {
      n.close();
      return;
    }
    if (!p && !await y.action(A, U)) {
      if (A === "clearance") {
        if (!r.reportValidity()) return;
        D.clearance = { enabled: r.elements.enabled.checked, front: b("front"), rear: b("rear") }, S(D, !1);
      }
      if (A === "zone-edit" && (g = U, M()), A === "zone-new" && (g = null, M()), A === "zone-save") {
        if (!r.reportValidity()) return;
        const F = { id: g || crypto.randomUUID(), name: T("name").trim(), color: T("color"), width: b("width"), depth: b("depth"), x: b("x") + b("width") / 2, z: b("z") + b("depth") / 2 };
        D.zones = [...(D.zones || []).filter((X) => X.id !== F.id), F], S(D), g = null, M();
      }
      if (A === "zone-delete" && (D.zones = (D.zones || []).filter((F) => F.id !== U), S(D), g = null, M()), A === "diff-show" && (L = !0, H(), f("비교 표시를 켰습니다. 닫기를 누르면 3D 화면에서 확인할 수 있습니다.")), A === "diff-clear" && (L = !1, H()), A === "diff-baseline" && (d = null, M(), H()), A === "rows") {
        if (!r.reportValidity()) return;
        S(fh(D, V.racks, [...r.querySelectorAll("input[name=racks]:checked")].map((F) => Number(F.value)), { x: b("x"), z: b("z"), columns: b("columns"), gapX: b("gapX"), gapZ: b("gapZ"), rotation: b("rotation") })), M();
      }
      if (A === "cleanup-preview" && (h = await $("cleanup"), M(), f(`대상을 확인하세요. 저장하지 않은 변경은 실행 시 폐기됩니다.${h.changes.planned_ids?.length ? ` 가상 장비 참조: ${h.changes.planned_ids.join(", ")}` : ""}`)), A === "cleanup-apply") {
        if (!h || !confirm("표시한 참조를 정리하고 저장하지 않은 편집을 버릴까요? NetBox 랙이나 장비 자체는 삭제하지 않습니다.")) return;
        const F = await $("cleanup", { revision: h.revision, token: h.token, confirm: !0 });
        e().replace(F), h = null, M(), f("참조를 정리하고 저장했습니다.");
      }
      if (A === "camera-save") {
        const F = T("name").trim();
        if (!F || F.length > 100) throw new Error("이름을 1~100자로 입력하세요.");
        const X = R();
        if (X.length >= 20) throw new Error("시점은 최대 20개입니다.");
        X.push({ id: crypto.randomUUID(), name: F, camera: P() }), localStorage.setItem(w(), JSON.stringify(X)), M(), f("현재 브라우저에 시점을 저장했습니다.");
      }
      if (A === "camera-load") {
        const F = R().find((X) => X.id === U);
        F && O(F.camera);
      }
      if (A === "camera-delete" && (localStorage.setItem(w(), JSON.stringify(R().filter((F) => F.id !== U))), M()), A === "camera-share") {
        const F = new URL(window.location.href);
        F.searchParams.set("location", V.locationId), F.hash = new URLSearchParams({ view: JSON.stringify(P()) }).toString(), r.elements.share.value = F.href, r.elements.share.select(), f("공유 링크를 선택했습니다. 복사해서 전달하세요.");
      }
      if (A === "plans" && (c = (await $("plans")).plans, M()), ["plan-create", "plan-rename", "plan-delete"].includes(A)) {
        if (!V.editable) throw new Error("읽기 전용입니다.");
        const F = A.slice(5), X = { action: F, id: U, revision: V.layout.revision };
        if (F === "create") {
          X.name = T("name"), X.layout = V.layout;
          const Pe = Pn(V.layout, V.racks);
          if (Pe.length) throw new Error(Pe.join(" / "));
        }
        if (F === "rename" && (X.name = prompt("새 배치안 이름", c.find((Pe) => Pe.id === U)?.name), X.name === null) || F === "delete" && !confirm("이 배치안을 삭제할까요? 현재 배치는 유지됩니다.")) return;
        const ne = await $("plans", X);
        e().revision(ne.revision), c = ne.plans, M(), f("배치안 목록을 저장했습니다. 현재 편집본은 유지됩니다.");
      }
      if (A === "plan-load") {
        const F = c.find((X) => X.id === U);
        F?.valid && confirm("현재 편집본을 선택한 배치안으로 바꿀까요? 적용 후 배치 저장이 필요합니다.") && (await V.restore(F.layout), M(), f("배치안을 편집본으로 불러왔습니다. 배치 저장으로 확정하세요."));
      }
      if (A === "plan-compare" && (d = structuredClone(c.find((F) => F.id === U)?.layout), d && (a = 2, L = !0, M(), H())), A === "cables") {
        const F = await $("cables", void 0, `?device=${V.selected.deviceId}`);
        u = F.cables, M(), H(), f(F.demo ? "데모에는 실제 NetBox 케이블이 없습니다." : `${u.length}개 직접 연결${F.truncated ? " (최대 500개)" : ""}`);
      }
      A === "cables-clear" && (u = [], H(), M());
    }
  }
  return t.addEventListener("click", () => {
    H(), M(), f(), n.showModal();
  }), n.addEventListener("click", (A) => {
    const U = A.target.closest("button");
    if (U) {
      if (U.dataset.tab !== void 0 && !p) {
        a = Number(U.dataset.tab), M(), f();
        return;
      }
      U.dataset.op && Z(U.dataset.op, U.dataset.id).catch((V) => {
        M(), f(V.message, !0);
      });
    }
  }), r.addEventListener("submit", (A) => A.preventDefault()), n.addEventListener("cancel", (A) => {
    p && A.preventDefault();
  }), { refresh: H, dispose: () => {
    m.dispose(), y.dispose(), n.remove(), t.remove();
  } };
}
const Kg = [[1, 0], [-1, 0], [0, 1], [0, -1]], Nc = (i, e, t) => ({ ...i, x: i.x + e, z: i.z + t }), _o = (i, e) => {
  const t = bt(vr(i, e.clearance));
  return t[0] >= 0 && t[1] >= 0 && t[2] <= e.width && t[3] <= e.depth;
};
function Fc(i, e) {
  const t = Pn(i, e);
  if (t.length) throw new Error(t.slice(0, 3).join(" / "));
  return i;
}
function Oc(i, e, t, n) {
  const r = e.kind === "rack" ? i.placements.find((s) => s.rack_id === e.rack_id) : i.blocks.find((s) => s.id === e.id);
  r.x = e.x + t, r.z = e.z + n;
}
function zl(i, e, t, n) {
  const r = n[0] ? 0 : 1, s = n[r];
  let a = 0;
  for (let o = 0; o <= Math.min(512, i.length * e.length + 1); o++) {
    const l = i.map((h) => Nc(h, n[0] * a, n[1] * a));
    if (l.some((h) => !_o(h, t))) return null;
    let c = 0;
    for (const h of l) for (const d of e)
      for (const [u, p] of no(h, d, t.clearance)) {
        if (!gr(u, p)) continue;
        const g = bt(u), _ = bt(p);
        c = Math.max(c, s > 0 ? _[r + 2] - g[r] : g[r + 2] - _[r]);
      }
    if (!c) return { x: n[0] * a, z: n[1] * a, distance: a };
    a += c;
  }
  return null;
}
function kc(i, e, t, n) {
  if (n) {
    const r = zl(i, e, t, n);
    if (r) return r;
  }
  return Kg.map((r) => zl(i, e, t, r)).filter(Boolean).sort((r, s) => r.distance - s.distance)[0];
}
function vo(i, e, t, n) {
  const r = structuredClone(e), s = Dn(r, t), a = s.filter((p) => n.includes(p.key)), o = s.filter((p) => !n.includes(p.key));
  if (!a.length) throw new Error("이동할 대상을 선택하세요.");
  if (a.some((p) => p.locked)) throw new Error("잠긴 랙은 자동으로 이동할 수 없습니다.");
  if (a.some((p) => !_o(p, r))) throw new Error("서버실 경계를 벗어납니다. 이전 위치를 유지합니다.");
  const l = Dn(i, t).find((p) => p.key === a[0].key), c = l ? a[0].x - l.x : 0, h = l ? a[0].z - l.z : 0, d = c || h ? Math.abs(c) >= Math.abs(h) ? [-Math.sign(c), 0] : [0, -Math.sign(h)] : null, u = kc(a, o, r, d);
  if (!u) throw new Error("겹침을 피할 공간이 부족합니다. 이전 위치를 유지합니다.");
  return a.forEach((p) => Oc(r, p, u.x, u.z)), Fc(r, t);
}
function Zg(i, e) {
  const t = structuredClone(i), n = Dn(t, e), r = n.filter((s) => s.locked);
  if (r.some((s, a) => !_o(s, t) || r.slice(0, a).some((o) => no(s, o, t.clearance).some(([l, c]) => gr(l, c)))))
    throw new Error("잠긴 랙끼리 겹치거나 경계를 벗어납니다. 잠금을 해제하고 다시 시도하세요.");
  for (const s of n.filter((a) => !a.locked)) {
    const a = kc([s], r, t);
    if (!a) throw new Error("겹침을 자동 수정할 공간을 찾지 못했습니다. 배치를 변경하지 않았습니다.");
    Oc(t, s, a.x, a.z), r.push(Nc(s, a.x, a.z));
  }
  return Fc(t, e);
}
const Jg = "0.3.1", Qg = {
  version: Jg
}, Hl = { type: "change" }, xo = { type: "start" }, Bc = { type: "end" }, rs = new Es(), Vl = new Hn(), e_ = Math.cos(70 * mc.DEG2RAD), Et = new N(), Kt = 2 * Math.PI, nt = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6
}, la = 1e-6;
class t_ extends au {
  /**
   * Constructs a new controls instance.
   *
   * @param {Object3D} object - The object that is managed by the controls.
   * @param {?HTMLDOMElement} domElement - The HTML element used for event listeners.
   */
  constructor(e, t = null) {
    super(e, t), this.state = nt.NONE, this.target = new N(), this.cursor = new N(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" }, this.mouseButtons = { LEFT: qi.ROTATE, MIDDLE: qi.DOLLY, RIGHT: qi.PAN }, this.touches = { ONE: Wi.ROTATE, TWO: Wi.DOLLY_PAN }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new N(), this._lastQuaternion = new Ei(), this._lastTargetPosition = new N(), this._quat = new Ei().setFromUnitVectors(e.up, new N(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new pl(), this._sphericalDelta = new pl(), this._scale = 1, this._panOffset = new N(), this._rotateStart = new Ue(), this._rotateEnd = new Ue(), this._rotateDelta = new Ue(), this._panStart = new Ue(), this._panEnd = new Ue(), this._panDelta = new Ue(), this._dollyStart = new Ue(), this._dollyEnd = new Ue(), this._dollyDelta = new Ue(), this._dollyDirection = new N(), this._mouse = new Ue(), this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = i_.bind(this), this._onPointerDown = n_.bind(this), this._onPointerUp = r_.bind(this), this._onContextMenu = d_.bind(this), this._onMouseWheel = o_.bind(this), this._onKeyDown = l_.bind(this), this._onTouchStart = c_.bind(this), this._onTouchMove = h_.bind(this), this._onMouseDown = s_.bind(this), this._onMouseMove = a_.bind(this), this._interceptControlDown = u_.bind(this), this._interceptControlUp = f_.bind(this), this.domElement !== null && this.connect(this.domElement), this.update();
  }
  connect(e) {
    super.connect(e), this.domElement.addEventListener("pointerdown", this._onPointerDown), this.domElement.addEventListener("pointercancel", this._onPointerUp), this.domElement.addEventListener("contextmenu", this._onContextMenu), this.domElement.addEventListener("wheel", this._onMouseWheel, { passive: !1 }), this.domElement.getRootNode().addEventListener("keydown", this._interceptControlDown, { passive: !0, capture: !0 }), this.domElement.style.touchAction = "none";
  }
  disconnect() {
    this.domElement.removeEventListener("pointerdown", this._onPointerDown), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.domElement.removeEventListener("pointercancel", this._onPointerUp), this.domElement.removeEventListener("wheel", this._onMouseWheel), this.domElement.removeEventListener("contextmenu", this._onContextMenu), this.stopListenToKeyEvents(), this.domElement.getRootNode().removeEventListener("keydown", this._interceptControlDown, { capture: !0 }), this.domElement.style.touchAction = "auto";
  }
  dispose() {
    this.disconnect();
  }
  /**
   * Get the current vertical rotation, in radians.
   *
   * @return {number} The current vertical rotation, in radians.
   */
  getPolarAngle() {
    return this._spherical.phi;
  }
  /**
   * Get the current horizontal rotation, in radians.
   *
   * @return {number} The current horizontal rotation, in radians.
   */
  getAzimuthalAngle() {
    return this._spherical.theta;
  }
  /**
   * Returns the distance from the camera to the target.
   *
   * @return {number} The distance from the camera to the target.
   */
  getDistance() {
    return this.object.position.distanceTo(this.target);
  }
  /**
   * Adds key event listeners to the given DOM element.
   * `window` is a recommended argument for using this method.
   *
   * @param {HTMLDOMElement} domElement - The DOM element
   */
  listenToKeyEvents(e) {
    e.addEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = e;
  }
  /**
   * Removes the key event listener previously defined with `listenToKeyEvents()`.
   */
  stopListenToKeyEvents() {
    this._domElementKeyEvents !== null && (this._domElementKeyEvents.removeEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = null);
  }
  /**
   * Save the current state of the controls. This can later be recovered with `reset()`.
   */
  saveState() {
    this.target0.copy(this.target), this.position0.copy(this.object.position), this.zoom0 = this.object.zoom;
  }
  /**
   * Reset the controls to their state from either the last time the `saveState()`
   * was called, or the initial state.
   */
  reset() {
    this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(Hl), this.update(), this.state = nt.NONE;
  }
  update(e = null) {
    const t = this.object.position;
    Et.copy(t).sub(this.target), Et.applyQuaternion(this._quat), this._spherical.setFromVector3(Et), this.autoRotate && this.state === nt.NONE && this._rotateLeft(this._getAutoRotationAngle(e)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
    let n = this.minAzimuthAngle, r = this.maxAzimuthAngle;
    isFinite(n) && isFinite(r) && (n < -Math.PI ? n += Kt : n > Math.PI && (n -= Kt), r < -Math.PI ? r += Kt : r > Math.PI && (r -= Kt), n <= r ? this._spherical.theta = Math.max(n, Math.min(r, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (n + r) / 2 ? Math.max(n, this._spherical.theta) : Math.min(r, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0 ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
    let s = !1;
    if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera)
      this._spherical.radius = this._clampDistance(this._spherical.radius);
    else {
      const a = this._spherical.radius;
      this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), s = a != this._spherical.radius;
    }
    if (Et.setFromSpherical(this._spherical), Et.applyQuaternion(this._quatInverse), t.copy(this.target).add(Et), this.object.lookAt(this.target), this.enableDamping === !0 ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
      let a = null;
      if (this.object.isPerspectiveCamera) {
        const o = Et.length();
        a = this._clampDistance(o * this._scale);
        const l = o - a;
        this.object.position.addScaledVector(this._dollyDirection, l), this.object.updateMatrixWorld(), s = !!l;
      } else if (this.object.isOrthographicCamera) {
        const o = new N(this._mouse.x, this._mouse.y, 0);
        o.unproject(this.object);
        const l = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), s = l !== this.object.zoom;
        const c = new N(this._mouse.x, this._mouse.y, 0);
        c.unproject(this.object), this.object.position.sub(c).add(o), this.object.updateMatrixWorld(), a = Et.length();
      } else
        console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
      a !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position) : (rs.origin.copy(this.object.position), rs.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(rs.direction)) < e_ ? this.object.lookAt(this.target) : (Vl.setFromNormalAndCoplanarPoint(this.object.up, this.target), rs.intersectPlane(Vl, this.target))));
    } else if (this.object.isOrthographicCamera) {
      const a = this.object.zoom;
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), a !== this.object.zoom && (this.object.updateProjectionMatrix(), s = !0);
    }
    return this._scale = 1, this._performCursorZoom = !1, s || this._lastPosition.distanceToSquared(this.object.position) > la || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > la || this._lastTargetPosition.distanceToSquared(this.target) > la ? (this.dispatchEvent(Hl), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1;
  }
  _getAutoRotationAngle(e) {
    return e !== null ? Kt / 60 * this.autoRotateSpeed * e : Kt / 60 / 60 * this.autoRotateSpeed;
  }
  _getZoomScale(e) {
    const t = Math.abs(e * 0.01);
    return Math.pow(0.95, this.zoomSpeed * t);
  }
  _rotateLeft(e) {
    this._sphericalDelta.theta -= e;
  }
  _rotateUp(e) {
    this._sphericalDelta.phi -= e;
  }
  _panLeft(e, t) {
    Et.setFromMatrixColumn(t, 0), Et.multiplyScalar(-e), this._panOffset.add(Et);
  }
  _panUp(e, t) {
    this.screenSpacePanning === !0 ? Et.setFromMatrixColumn(t, 1) : (Et.setFromMatrixColumn(t, 0), Et.crossVectors(this.object.up, Et)), Et.multiplyScalar(e), this._panOffset.add(Et);
  }
  // deltaX and deltaY are in pixels; right and down are positive
  _pan(e, t) {
    const n = this.domElement;
    if (this.object.isPerspectiveCamera) {
      const r = this.object.position;
      Et.copy(r).sub(this.target);
      let s = Et.length();
      s *= Math.tan(this.object.fov / 2 * Math.PI / 180), this._panLeft(2 * e * s / n.clientHeight, this.object.matrix), this._panUp(2 * t * s / n.clientHeight, this.object.matrix);
    } else this.object.isOrthographicCamera ? (this._panLeft(e * (this.object.right - this.object.left) / this.object.zoom / n.clientWidth, this.object.matrix), this._panUp(t * (this.object.top - this.object.bottom) / this.object.zoom / n.clientHeight, this.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), this.enablePan = !1);
  }
  _dollyOut(e) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale /= e : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1);
  }
  _dollyIn(e) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale *= e : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1);
  }
  _updateZoomParameters(e, t) {
    if (!this.zoomToCursor)
      return;
    this._performCursorZoom = !0;
    const n = this.domElement.getBoundingClientRect(), r = e - n.left, s = t - n.top, a = n.width, o = n.height;
    this._mouse.x = r / a * 2 - 1, this._mouse.y = -(s / o) * 2 + 1, this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();
  }
  _clampDistance(e) {
    return Math.max(this.minDistance, Math.min(this.maxDistance, e));
  }
  //
  // event callbacks - update the object state
  //
  _handleMouseDownRotate(e) {
    this._rotateStart.set(e.clientX, e.clientY);
  }
  _handleMouseDownDolly(e) {
    this._updateZoomParameters(e.clientX, e.clientX), this._dollyStart.set(e.clientX, e.clientY);
  }
  _handleMouseDownPan(e) {
    this._panStart.set(e.clientX, e.clientY);
  }
  _handleMouseMoveRotate(e) {
    this._rotateEnd.set(e.clientX, e.clientY), this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const t = this.domElement;
    this._rotateLeft(Kt * this._rotateDelta.x / t.clientHeight), this._rotateUp(Kt * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
  }
  _handleMouseMoveDolly(e) {
    this._dollyEnd.set(e.clientX, e.clientY), this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart), this._dollyDelta.y > 0 ? this._dollyOut(this._getZoomScale(this._dollyDelta.y)) : this._dollyDelta.y < 0 && this._dollyIn(this._getZoomScale(this._dollyDelta.y)), this._dollyStart.copy(this._dollyEnd), this.update();
  }
  _handleMouseMovePan(e) {
    this._panEnd.set(e.clientX, e.clientY), this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd), this.update();
  }
  _handleMouseWheel(e) {
    this._updateZoomParameters(e.clientX, e.clientY), e.deltaY < 0 ? this._dollyIn(this._getZoomScale(e.deltaY)) : e.deltaY > 0 && this._dollyOut(this._getZoomScale(e.deltaY)), this.update();
  }
  _handleKeyDown(e) {
    let t = !1;
    switch (e.code) {
      case this.keys.UP:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(Kt * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), t = !0;
        break;
      case this.keys.BOTTOM:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(-Kt * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), t = !0;
        break;
      case this.keys.LEFT:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(Kt * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), t = !0;
        break;
      case this.keys.RIGHT:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(-Kt * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), t = !0;
        break;
    }
    t && (e.preventDefault(), this.update());
  }
  _handleTouchStartRotate(e) {
    if (this._pointers.length === 1)
      this._rotateStart.set(e.pageX, e.pageY);
    else {
      const t = this._getSecondPointerPosition(e), n = 0.5 * (e.pageX + t.x), r = 0.5 * (e.pageY + t.y);
      this._rotateStart.set(n, r);
    }
  }
  _handleTouchStartPan(e) {
    if (this._pointers.length === 1)
      this._panStart.set(e.pageX, e.pageY);
    else {
      const t = this._getSecondPointerPosition(e), n = 0.5 * (e.pageX + t.x), r = 0.5 * (e.pageY + t.y);
      this._panStart.set(n, r);
    }
  }
  _handleTouchStartDolly(e) {
    const t = this._getSecondPointerPosition(e), n = e.pageX - t.x, r = e.pageY - t.y, s = Math.sqrt(n * n + r * r);
    this._dollyStart.set(0, s);
  }
  _handleTouchStartDollyPan(e) {
    this.enableZoom && this._handleTouchStartDolly(e), this.enablePan && this._handleTouchStartPan(e);
  }
  _handleTouchStartDollyRotate(e) {
    this.enableZoom && this._handleTouchStartDolly(e), this.enableRotate && this._handleTouchStartRotate(e);
  }
  _handleTouchMoveRotate(e) {
    if (this._pointers.length == 1)
      this._rotateEnd.set(e.pageX, e.pageY);
    else {
      const n = this._getSecondPointerPosition(e), r = 0.5 * (e.pageX + n.x), s = 0.5 * (e.pageY + n.y);
      this._rotateEnd.set(r, s);
    }
    this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const t = this.domElement;
    this._rotateLeft(Kt * this._rotateDelta.x / t.clientHeight), this._rotateUp(Kt * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd);
  }
  _handleTouchMovePan(e) {
    if (this._pointers.length === 1)
      this._panEnd.set(e.pageX, e.pageY);
    else {
      const t = this._getSecondPointerPosition(e), n = 0.5 * (e.pageX + t.x), r = 0.5 * (e.pageY + t.y);
      this._panEnd.set(n, r);
    }
    this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd);
  }
  _handleTouchMoveDolly(e) {
    const t = this._getSecondPointerPosition(e), n = e.pageX - t.x, r = e.pageY - t.y, s = Math.sqrt(n * n + r * r);
    this._dollyEnd.set(0, s), this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed)), this._dollyOut(this._dollyDelta.y), this._dollyStart.copy(this._dollyEnd);
    const a = (e.pageX + t.x) * 0.5, o = (e.pageY + t.y) * 0.5;
    this._updateZoomParameters(a, o);
  }
  _handleTouchMoveDollyPan(e) {
    this.enableZoom && this._handleTouchMoveDolly(e), this.enablePan && this._handleTouchMovePan(e);
  }
  _handleTouchMoveDollyRotate(e) {
    this.enableZoom && this._handleTouchMoveDolly(e), this.enableRotate && this._handleTouchMoveRotate(e);
  }
  // pointers
  _addPointer(e) {
    this._pointers.push(e.pointerId);
  }
  _removePointer(e) {
    delete this._pointerPositions[e.pointerId];
    for (let t = 0; t < this._pointers.length; t++)
      if (this._pointers[t] == e.pointerId) {
        this._pointers.splice(t, 1);
        return;
      }
  }
  _isTrackingPointer(e) {
    for (let t = 0; t < this._pointers.length; t++)
      if (this._pointers[t] == e.pointerId) return !0;
    return !1;
  }
  _trackPointer(e) {
    let t = this._pointerPositions[e.pointerId];
    t === void 0 && (t = new Ue(), this._pointerPositions[e.pointerId] = t), t.set(e.pageX, e.pageY);
  }
  _getSecondPointerPosition(e) {
    const t = e.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
    return this._pointerPositions[t];
  }
  //
  _customWheelEvent(e) {
    const t = e.deltaMode, n = {
      clientX: e.clientX,
      clientY: e.clientY,
      deltaY: e.deltaY
    };
    switch (t) {
      case 1:
        n.deltaY *= 16;
        break;
      case 2:
        n.deltaY *= 100;
        break;
    }
    return e.ctrlKey && !this._controlActive && (n.deltaY *= 10), n;
  }
}
function n_(i) {
  this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(i.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(i) && (this._addPointer(i), i.pointerType === "touch" ? this._onTouchStart(i) : this._onMouseDown(i)));
}
function i_(i) {
  this.enabled !== !1 && (i.pointerType === "touch" ? this._onTouchMove(i) : this._onMouseMove(i));
}
function r_(i) {
  switch (this._removePointer(i), this._pointers.length) {
    case 0:
      this.domElement.releasePointerCapture(i.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(Bc), this.state = nt.NONE;
      break;
    case 1:
      const e = this._pointers[0], t = this._pointerPositions[e];
      this._onTouchStart({ pointerId: e, pageX: t.x, pageY: t.y });
      break;
  }
}
function s_(i) {
  let e;
  switch (i.button) {
    case 0:
      e = this.mouseButtons.LEFT;
      break;
    case 1:
      e = this.mouseButtons.MIDDLE;
      break;
    case 2:
      e = this.mouseButtons.RIGHT;
      break;
    default:
      e = -1;
  }
  switch (e) {
    case qi.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseDownDolly(i), this.state = nt.DOLLY;
      break;
    case qi.ROTATE:
      if (i.ctrlKey || i.metaKey || i.shiftKey) {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(i), this.state = nt.PAN;
      } else {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(i), this.state = nt.ROTATE;
      }
      break;
    case qi.PAN:
      if (i.ctrlKey || i.metaKey || i.shiftKey) {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(i), this.state = nt.ROTATE;
      } else {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(i), this.state = nt.PAN;
      }
      break;
    default:
      this.state = nt.NONE;
  }
  this.state !== nt.NONE && this.dispatchEvent(xo);
}
function a_(i) {
  switch (this.state) {
    case nt.ROTATE:
      if (this.enableRotate === !1) return;
      this._handleMouseMoveRotate(i);
      break;
    case nt.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseMoveDolly(i);
      break;
    case nt.PAN:
      if (this.enablePan === !1) return;
      this._handleMouseMovePan(i);
      break;
  }
}
function o_(i) {
  this.enabled === !1 || this.enableZoom === !1 || this.state !== nt.NONE || (i.preventDefault(), this.dispatchEvent(xo), this._handleMouseWheel(this._customWheelEvent(i)), this.dispatchEvent(Bc));
}
function l_(i) {
  this.enabled !== !1 && this._handleKeyDown(i);
}
function c_(i) {
  switch (this._trackPointer(i), this._pointers.length) {
    case 1:
      switch (this.touches.ONE) {
        case Wi.ROTATE:
          if (this.enableRotate === !1) return;
          this._handleTouchStartRotate(i), this.state = nt.TOUCH_ROTATE;
          break;
        case Wi.PAN:
          if (this.enablePan === !1) return;
          this._handleTouchStartPan(i), this.state = nt.TOUCH_PAN;
          break;
        default:
          this.state = nt.NONE;
      }
      break;
    case 2:
      switch (this.touches.TWO) {
        case Wi.DOLLY_PAN:
          if (this.enableZoom === !1 && this.enablePan === !1) return;
          this._handleTouchStartDollyPan(i), this.state = nt.TOUCH_DOLLY_PAN;
          break;
        case Wi.DOLLY_ROTATE:
          if (this.enableZoom === !1 && this.enableRotate === !1) return;
          this._handleTouchStartDollyRotate(i), this.state = nt.TOUCH_DOLLY_ROTATE;
          break;
        default:
          this.state = nt.NONE;
      }
      break;
    default:
      this.state = nt.NONE;
  }
  this.state !== nt.NONE && this.dispatchEvent(xo);
}
function h_(i) {
  switch (this._trackPointer(i), this.state) {
    case nt.TOUCH_ROTATE:
      if (this.enableRotate === !1) return;
      this._handleTouchMoveRotate(i), this.update();
      break;
    case nt.TOUCH_PAN:
      if (this.enablePan === !1) return;
      this._handleTouchMovePan(i), this.update();
      break;
    case nt.TOUCH_DOLLY_PAN:
      if (this.enableZoom === !1 && this.enablePan === !1) return;
      this._handleTouchMoveDollyPan(i), this.update();
      break;
    case nt.TOUCH_DOLLY_ROTATE:
      if (this.enableZoom === !1 && this.enableRotate === !1) return;
      this._handleTouchMoveDollyRotate(i), this.update();
      break;
    default:
      this.state = nt.NONE;
  }
}
function d_(i) {
  this.enabled !== !1 && i.preventDefault();
}
function u_(i) {
  i.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, { passive: !0, capture: !0 }));
}
function f_(i) {
  i.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, { passive: !0, capture: !0 }));
}
class Gl extends wt {
  /**
   * Constructs a new CSS2D object.
   *
   * @param {DOMElement} [element] - The DOM element.
   */
  constructor(e = document.createElement("div")) {
    super(), this.isCSS2DObject = !0, this.element = e, this.element.style.position = "absolute", this.element.style.userSelect = "none", this.element.setAttribute("draggable", !1), this.center = new Ue(0.5, 0.5), this.addEventListener("removed", function() {
      this.traverse(function(t) {
        t.element instanceof t.element.ownerDocument.defaultView.Element && t.element.parentNode !== null && t.element.remove();
      });
    });
  }
  copy(e, t) {
    return super.copy(e, t), this.element = e.element.cloneNode(!0), this.center = e.center, this;
  }
}
const Vi = new N(), Wl = new lt(), $l = new lt(), Xl = new N(), ql = new N();
class p_ {
  /**
   * Constructs a new CSS2D renderer.
   *
   * @param {CSS2DRenderer~Parameters} [parameters] - The parameters.
   */
  constructor(e = {}) {
    const t = this;
    let n, r, s, a;
    const o = {
      objects: /* @__PURE__ */ new WeakMap()
    }, l = e.element !== void 0 ? e.element : document.createElement("div");
    l.style.overflow = "hidden", this.domElement = l, this.getSize = function() {
      return {
        width: n,
        height: r
      };
    }, this.render = function(g, _) {
      g.matrixWorldAutoUpdate === !0 && g.updateMatrixWorld(), _.parent === null && _.matrixWorldAutoUpdate === !0 && _.updateMatrixWorld(), Wl.copy(_.matrixWorldInverse), $l.multiplyMatrices(_.projectionMatrix, Wl), h(g, g, _), p(g);
    }, this.setSize = function(g, _) {
      n = g, r = _, s = n / 2, a = r / 2, l.style.width = g + "px", l.style.height = _ + "px";
    };
    function c(g) {
      g.isCSS2DObject && (g.element.style.display = "none");
      for (let _ = 0, m = g.children.length; _ < m; _++)
        c(g.children[_]);
    }
    function h(g, _, m) {
      if (g.visible === !1) {
        c(g);
        return;
      }
      if (g.isCSS2DObject) {
        Vi.setFromMatrixPosition(g.matrixWorld), Vi.applyMatrix4($l);
        const f = Vi.z >= -1 && Vi.z <= 1 && g.layers.test(m.layers) === !0, T = g.element;
        T.style.display = f === !0 ? "" : "none", f === !0 && (g.onBeforeRender(t, _, m), T.style.transform = "translate(" + -100 * g.center.x + "%," + -100 * g.center.y + "%)translate(" + (Vi.x * s + s) + "px," + (-Vi.y * a + a) + "px)", T.parentNode !== l && l.appendChild(T), g.onAfterRender(t, _, m));
        const b = {
          distanceToCameraSquared: d(m, g)
        };
        o.objects.set(g, b);
      }
      for (let f = 0, T = g.children.length; f < T; f++)
        h(g.children[f], _, m);
    }
    function d(g, _) {
      return Xl.setFromMatrixPosition(g.matrixWorld), ql.setFromMatrixPosition(_.matrixWorld), Xl.distanceToSquared(ql);
    }
    function u(g) {
      const _ = [];
      return g.traverseVisible(function(m) {
        m.isCSS2DObject && _.push(m);
      }), _;
    }
    function p(g) {
      const _ = u(g).sort(function(f, T) {
        if (f.renderOrder !== T.renderOrder)
          return T.renderOrder - f.renderOrder;
        const b = o.objects.get(f).distanceToCameraSquared, y = o.objects.get(T).distanceToCameraSquared;
        return b - y;
      }), m = _.length;
      for (let f = 0, T = _.length; f < T; f++)
        _[f].element.style.zIndex = m - f;
    }
  }
}
const Dt = (i) => i / 1e3;
function m_(i, e, t, n) {
  const r = Ut(e, i), s = Dt(r.width), a = Dt(r.depth), o = Dt(r.height), l = new qt();
  l.position.set(Dt(i.x), 0, Dt(i.z)), l.rotation.y = -i.rotation * Math.PI / 180;
  const c = new qt(), h = new qt();
  l.add(c), this.content.add(l);
  const d = { rackId: e.id }, u = [];
  {
    const w = new Float32Array([-0.09, o + 0.015, a / 2 - 0.15, 0.09, o + 0.015, a / 2 - 0.15, 0, o + 0.015, a / 2 + 0.05]), R = new un();
    R.setAttribute("position", new Sn(w, 3));
    const P = new Ot(R, new qn({ color: "#089b88", side: rn, depthTest: !1 }));
    P.userData = { ...d, frontMarker: !0 }, P.renderOrder = 10, h.add(P), u.push(this.label("앞 · FRONT", 0, o + 0.03, a / 2 + 0.2, h, "rack-front")), u.push(this.label("뒤", 0, o + 0.03, -a / 2 - 0.12, h, "rack-rear"));
  }
  const p = ha(e), g = "#273847";
  this.cube(s, 0.07, a, 0, o - 0.035, 0, g, h).userData = d;
  const _ = new Si(
    new Zi(new yn(s, 0.072, a)),
    new Xn({ color: "#d9e6ec", transparent: !0, opacity: 0.95, depthTest: !1 })
  );
  _.position.y = o - 0.035, _.renderOrder = 9, _.userData = d, h.add(_), this.cube(s, 0.07, a, 0, 0.035, 0, g, c).userData = d, this.cube(s, 0.07, a, 0, o - 0.035, 0, g, c, { transparent: !!n.transparent, opacity: n.transparent ? 0.18 : 1, depthWrite: !n.transparent }).userData = d;
  for (const w of [-s / 2 + 0.025, s / 2 - 0.025]) for (const R of [-a / 2 + 0.025, a / 2 - 0.025]) this.cube(0.04, o, 0.04, w, o / 2, R, g, c).userData = d;
  if (n.sides)
    for (const w of [-s / 2 + 0.012, s / 2 - 0.012]) {
      const R = this.cube(0.024, o - 0.14, a - 0.08, w, o / 2, 0, g, c);
      R.userData = { ...d, sidePanel: !0 };
    }
  const m = Math.min(Dt(e.rail_width || 482.6), s - 0.08), f = (o - Dt(e.u_height * 44.45)) / 2;
  if (n.units) for (let w = 0; w < e.u_height; w++) {
    const R = e.starting_unit + (e.desc_units ? e.u_height - w - 1 : w), P = f + Dt((w + 0.5) * 44.45);
    for (const O of [!1, !0]) {
      const S = (O ? -1 : 1) * (a / 2 + 3e-3);
      this.textPanel(String(R), 0.045, Dt(44.45) * 0.85, -s / 2 - 0.025, P, S, c, O, { ...d, unitLabel: !0 }), p.occupied.has(w) || (this.cube(m, 2e-3, 3e-3, 0, P, S, "#94a3b8", c).userData = d);
    }
  }
  for (const w of [-m / 2 - 0.012, m / 2 + 0.012]) for (const R of [-a / 2 + 0.065, a / 2 - 0.065]) this.cube(0.018, Dt(e.u_height * 44.45), 0.025, w, o / 2, R, "#82929f", c).userData = d;
  const T = n.labels || n.usage ? this.label("", 0, o + 0.18, 0, l, "rack-summary") : null;
  if (T) {
    const w = (R, P) => {
      const O = document.createElement("span");
      O.className = P, O.textContent = R, T.element.append(O);
    };
    n.labels && w(`${e.name}${i.locked ? " · 잠금" : ""}`, "rack-name"), n.usage && (w(`${p.used}/${e.u_height}U · ${p.percent}%`, "rack-usage"), w(`잔여 ${p.free}U · ${p.count}대`, "rack-usage-detail"), T.element.style.borderBottomColor = nh(p.percent));
  }
  this.textPanel("FRONT · 전면", s * 0.85, 0.065, 0, o - 0.035, a / 2 + 2e-3, c, !1, d), this.textPanel("REAR · 후면", s * 0.85, 0.065, 0, o - 0.035, -a / 2 - 2e-3, c, !0, d);
  for (const w of e.devices) {
    const R = Ms(e, w);
    if (R == null) continue;
    const P = t.appearances[String(w.id)] || {}, O = P.color || w.color || "#64748b", S = Dt(w.u_height * 44.45) - 3e-3, M = Math.min(Dt(P.depth || (w.full_depth ? r.depth - 140 : r.depth * 0.42)), a - 0.12), L = w.face === "rear", H = L ? -a / 2 + 0.065 + M / 2 : a / 2 - 0.065 - M / 2, $ = new qt();
    $.position.set(0, f + Dt(R) + S / 2, H), $.rotation.y = L ? Math.PI : 0, c.add($);
    const Z = { ...d, deviceId: w.id, deviceInfo: w }, A = this.cube(m, S, M, 0, 0, 0, O, $);
    A.userData = Z;
    {
      const U = Array.from({ length: 6 }, (Y, J) => new Ac({ color: (J === 2 || J === 3) && !n.deviceColors ? "#808890" : O, roughness: 0.8 }));
      for (const [Y, J] of [["front", 4], ["rear", 5]]) {
        const Ae = w.images.find((Me) => Me.id === P[`${Y}_image_id`])?.url || w[`${Y}_image`];
        Ae && (U[J].color.set("#ffffff"), U[J].map = this.texture(Ae, O, m / S), U[J].userData.imageKey = U[J].map.userData.poolKey);
      }
      if (A.material.dispose(), A.material = U, n.statuses) for (const Y of [!1, !0]) this.textPanel(w.status_label || w.status, m * 0.35, Math.min(S * 0.3, 0.025), m * 0.3, -S * 0.3, (Y ? -1 : 1) * (M / 2 + 4e-3), $, Y, { ...Z, statusColor: th(w.status) });
      const V = [];
      n.assetTags && String(w.asset_tag ?? "").trim() && V.push(["asset_tag", `자산: ${w.asset_tag}`]), n.serialNumbers && String(w.serial ?? "").trim() && V.push(["serial", `시리얼: ${w.serial}`]);
      const D = Math.min((S - 2e-3) * 0.22, 0.018);
      for (const Y of [!1, !0]) V.forEach(([J, fe], Ae) => {
        this.textPanel(
          fe,
          m * 0.58,
          D,
          -m * 0.18,
          -S / 2 + 1e-3 + (Ae + 0.5) * D,
          (Y ? -1 : 1) * (M / 2 + 6e-3),
          $,
          Y,
          { ...Z, identifierKind: J }
        );
      });
      const F = Math.min(S * (V.length ? 0.42 : 0.65), 0.04);
      this.textPanel(w.name, m * 0.94, F, 0, (S - F) / 2 - 1e-3, M / 2 + 1e-3, $, !1, Z);
      const X = w.interfaces || [], ne = 8, Pe = Math.ceil(X.length / ne), Ke = Math.min(Dt(44.45) / 2, (S * 0.85 - V.length * D) / Math.max(1, Pe) * 0.8, m * 0.94 / ne * 0.8), st = Ke * 1.25, qe = Ke * 1.25;
      X.forEach((Y, J) => this.textPanel(
        Y.name,
        Ke,
        Ke,
        m * 0.47 - (J % ne + 0.5) * st,
        S * 0.425 - (Math.floor(J / ne) + 0.5) * qe,
        -M / 2 - 2e-3,
        $,
        !0,
        { ...Z, rearInfo: w, interfaceId: Y.id, interfaceName: Y.name, interfaceIPs: Y.primary_ips || [], isPrimary: !!Y.is_primary }
      ));
    }
  }
  const b = /* @__PURE__ */ new Map(), y = [];
  return l.add(h), l.traverse((w) => {
    w.isMesh && !Array.isArray(w.material) && !w.userData.deviceInfo && !w.userData.textPanel && w.material.color?.getHexString() === "273847" && y.push(w), w.isMesh && w.userData.deviceInfo && Array.isArray(w.material) && b.set(w.userData.deviceId, w);
  }), l.remove(h), { group: l, details: c, top: h, devices: b, frameMeshes: y, nameLabel: T, directionLabels: u, labelWidth: Math.min(s, a) };
}
function g_(i, e) {
  const t = new qt();
  this.content.add(t);
  const n = Dt(i.width), r = Dt(i.depth), s = Dt(i.height);
  if (this.cube(n, 0.08, r, n / 2, -0.06, r / 2, "#fafcfd", t), e.grid) {
    const a = [], o = Math.max(0.1, Dt(i.grid)), l = i.grid_origin || "top-left", c = l.endsWith("right") ? n % o : 0, h = l.startsWith("bottom") ? r % o : 0;
    for (let u = c; u <= n; u += o) a.push(new N(u, 0, 0), new N(u, 0, r));
    for (let u = h; u <= r; u += o) a.push(new N(0, 0, u), new N(n, 0, u));
    const d = new Si(new un().setFromPoints(a), new Xn({ color: "#8195a5", transparent: !0, opacity: 0.85, depthWrite: !1 }));
    d.position.y = 2e-3, d.userData.gridSize = i.grid, t.add(d);
  }
  return e.walls && (this.cube(n, s, 0.07, n / 2, s / 2, 0, "#cdd9df", t, { transparent: !0, opacity: 0.24, depthWrite: !1 }), this.cube(0.07, s, r, 0, s / 2, r / 2, "#cdd9df", t, { transparent: !0, opacity: 0.24, depthWrite: !1 })), this.label(n.toFixed(1) + " m", n / 2, 0.05, r + 0.4, t, "dimension"), this.label(r.toFixed(1) + " m", n + 0.45, 0.05, r / 2, t, "dimension"), t;
}
class __ {
  constructor(e = 128) {
    this.entries = /* @__PURE__ */ new Map(), this.maxIdle = e, this.clock = 0, this.created = 0;
  }
  acquire(e, t) {
    let n = this.entries.get(e);
    return n || (n = { value: t(), refs: 0, used: 0 }, this.entries.set(e, n), this.created++), n.refs++, n.used = ++this.clock, n.value;
  }
  release(e) {
    const t = this.entries.get(e);
    if (!t || t.refs < 1) throw new Error(`Unbalanced resource release: ${e}`);
    t.refs--, t.used = ++this.clock;
  }
  prune() {
    const e = [...this.entries].filter(([, t]) => !t.refs).sort((t, n) => t[1].used - n[1].used);
    for (const [t, n] of e.slice(0, Math.max(0, e.length - this.maxIdle)))
      n.value.dispose(), this.entries.delete(t);
  }
  clear() {
    for (const e of this.entries.values()) e.value.dispose();
    this.entries.clear();
  }
  get stats() {
    return { entries: this.entries.size, idle: [...this.entries.values()].filter((e) => !e.refs).length, created: this.created };
  }
}
const Je = (i) => i / 1e3;
function v_(i) {
  const e = i?.deviceInfo?.primary_ips || [];
  return e.length === 1 ? e : e.length > 1 && i.interfaceId ? (i.interfaceIPs || []).filter((t) => e.includes(t)) : [];
}
class x_ {
  constructor(e, t) {
    this.listeners = [], this.host = e, this.handlers = t, this.textures = /* @__PURE__ */ new Map(), this.mode = "3d", this.scene = new Gd(), this.scene.background = new Xe("#e8edf0"), this.renderer = new Wg({ antialias: !0, alpha: !1 }), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)), this.renderer.setClearColor("#e8edf0"), this.renderer.domElement.setAttribute("aria-label", "서버실 3D 배치 화면"), this.renderer.domElement.tabIndex = 0, e.appendChild(this.renderer.domElement), this.tooltip = document.createElement("div"), this.tooltip.className = "r3-device-tooltip", this.tooltip.hidden = !0, this.tooltip.setAttribute("role", "tooltip"), e.appendChild(this.tooltip), this.on(this.renderer.domElement, "pointerleave", () => {
      this.tooltip.hidden = !0;
    }), this.labels = new p_(), Object.assign(this.labels.domElement.style, { position: "absolute", inset: "0", pointerEvents: "none" }), e.appendChild(this.labels.domElement), this.camera = new hn(42, 1, 0.01, 300), this.controls = new t_(this.camera, this.renderer.domElement), this.controls.maxPolarAngle = Math.PI / 2 - 0.02, this.controls.minDistance = 0.6, this.controls.maxDistance = 100, this.on(this.controls, "change", () => this.draw()), this.scene.add(new eu(16777215, 6649218, 2.5));
    const n = new iu(16777215, 3);
    n.position.set(5, 12, 7), this.scene.add(n), this.content = new qt(), this.scene.add(this.content), this.ray = new su(), this.floor = new Hn(new N(0, 1, 0), 0), this.on(this.renderer.domElement, "pointerdown", (a) => this.down(a), { capture: !0 }), this.on(this.renderer.domElement, "pointermove", (a) => this.move(a)), this.on(this.renderer.domElement, "pointerup", (a) => this.up(a)), this.on(this.renderer.domElement, "pointercancel", () => this.cancelDrag()), this.on(this.renderer.domElement, "dragover", (a) => a.preventDefault()), this.on(this.renderer.domElement, "drop", (a) => {
      if (a.preventDefault(), this.mode === "walk") return;
      const o = this.floorPoint(a);
      o && t.drop(Number(a.dataTransfer.getData("text/plain")), o.x * 1e3, o.z * 1e3);
    }), this.observer = new ResizeObserver(() => this.resize()), this.observer.observe(e), this.keys = /* @__PURE__ */ new Set();
    const r = this.renderer.domElement;
    this.on(r, "keydown", (a) => {
      if (a.code === "Escape" && this.drag) {
        this.cancelDrag();
        return;
      }
      if (this.mode === "walk") {
        if (a.code === "Escape") {
          this.handlers.exitWalk();
          return;
        }
        ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"].includes(a.code) && (a.preventDefault(), this.keys.add(a.code));
      }
    }), this.on(r, "keyup", (a) => this.keys.delete(a.code));
    const s = () => {
      this.cancelDrag(), this.keys.clear(), this.walkPointer = null, this.pointerStart = null;
    };
    this.on(r, "blur", s), this.on(window, "blur", s), this.on(document, "visibilitychange", s), this.on(r, "lostpointercapture", () => this.cancelDrag()), this.resize();
  }
  on(e, t, n, r) {
    e.addEventListener(t, n, r), this.listeners.push(() => e.removeEventListener(t, n, r));
  }
  dispose() {
    if (!this.disposed) {
      this.cancelDrag(), this.disposed = !0;
      for (const e of ["drawRAF", "dragRAF", "walkRAF", "focusRAF"]) this[e] && cancelAnimationFrame(this[e]);
      for (const e of this.listeners || []) e();
      this.observer?.disconnect(), this.controls?.dispose(), this.clear(), this.pool.clear(), this.renderer?.dispose(), this.renderer?.domElement.remove(), this.labels?.domElement.remove(), this.tooltip?.remove();
    }
  }
  cancelDrag() {
    this.dragRAF && cancelAnimationFrame(this.dragRAF), this.dragRAF = null, this.pendingDrag = null;
    const e = this.drag;
    this.drag = null, this.walkPointer = null, this.pointerStart = null, this.controls.enabled = this.mode !== "walk", e && this.handlers.dragCancel?.();
  }
  flushDrag() {
    this.dragRAF && cancelAnimationFrame(this.dragRAF), this.dragRAF = null;
    const e = this.pendingDrag;
    if (this.pendingDrag = null, !e || !this.drag) return;
    const t = this.floorPoint(e);
    t && (this.drag.blockId ? this.handlers.dragBlock : this.handlers.drag)(this.drag.blockId || this.drag.id, t.x * 1e3 + this.drag.dx, t.z * 1e3 + this.drag.dz);
  }
  walkFree(e, t) {
    const r = this.layout;
    return e < 0.2 || t < 0.2 || e > Je(r.width) - 0.2 || t > Je(r.depth) - 0.2 ? !1 : !this.walkObstacles.some((s) => e > Je(s[0]) - 0.2 && e < Je(s[2]) + 0.2 && t > Je(s[1]) - 0.2 && t < Je(s[3]) + 0.2);
  }
  walkStart() {
    const e = Je(this.layout.width), t = Je(this.layout.depth);
    for (let n = t - 0.25; n >= 0.2; n -= Math.max(0.2, t / 150))
      for (let r = 0.25; r <= e - 0.2; r += Math.max(0.2, e / 150))
        if (this.walkFree(r, n)) return new N(r, Math.min(1.65, Je(this.layout.height) - 0.1), n);
    return null;
  }
  walkFrame(e) {
    if (this.mode !== "walk") return;
    const t = Math.min((e - (this.walkTime ?? e)) / 1e3, 0.05);
    this.walkTime = e;
    const n = (...a) => a.some((o) => this.keys.has(o)), r = Number(n("KeyW", "ArrowUp")) - Number(n("KeyS", "ArrowDown")), s = Number(n("KeyD", "ArrowRight")) - Number(n("KeyA", "ArrowLeft"));
    if (r || s) {
      const a = Math.hypot(r, s), o = n("ShiftLeft", "ShiftRight") ? 2.8 : 1.4, l = (s * Math.cos(this.yaw) - r * Math.sin(this.yaw)) / a * o * t, c = (-r * Math.cos(this.yaw) - s * Math.sin(this.yaw)) / a * o * t, h = this.camera.position;
      this.walkFree(h.x + l, h.z) && (h.x += l), this.walkFree(h.x, h.z + c) && (h.z += c), this.draw();
    }
    this.walkRAF = requestAnimationFrame((a) => this.walkFrame(a));
  }
  resize() {
    const { width: e, height: t } = this.host.getBoundingClientRect();
    !e || !t || (this.renderer.setSize(e, t), this.labels.setSize(e, t), this.camera.aspect = e / t, this.camera.updateProjectionMatrix(), this.draw());
  }
  draw() {
    this.disposed || this.drawRAF || (this.drawRAF = requestAnimationFrame(() => {
      this.drawRAF = null, this.flushDraw();
    }));
  }
  flushDraw() {
    this.disposed || (this.renderer.render(this.scene, this.camera), this.sizeLabels(), this.labels.render(this.scene, this.camera));
  }
  sizeLabels() {
    const e = this.host.clientWidth;
    for (const t of this.rackNodes?.values() || []) {
      if (!t.nameLabel) continue;
      const n = t.nameLabel.getWorldPosition(new N()), r = new N(1, 0, 0).applyQuaternion(this.camera.quaternion).multiplyScalar(t.labelWidth / 2), s = n.clone().sub(r).project(this.camera), a = n.add(r).project(this.camera);
      t.nameLabel.element.style.maxWidth = `${Math.max(18, Math.min(180, Math.abs(a.x - s.x) * e / 2 - 6))}px`, t.nameLabel.element.classList.toggle("top-summary", this.mode === "top");
    }
  }
  point(e) {
    this.camera.updateMatrixWorld();
    const t = this.renderer.domElement.getBoundingClientRect();
    this.ray.setFromCamera(new Ue((e.clientX - t.left) / t.width * 2 - 1, -(e.clientY - t.top) / t.height * 2 + 1), this.camera);
  }
  floorPoint(e) {
    return this.point(e), this.ray.ray.intersectPlane(this.floor, new N());
  }
  isVisible(e) {
    for (let t = e; t; t = t.parent) if (!t.visible) return !1;
    return !0;
  }
  hit(e) {
    this.point(e), this.content.updateMatrixWorld(!0);
    for (const t of this.ray.intersectObjects(this.content.children, !0))
      if (!(!t.object.isMesh || !this.isVisible(t.object)) && (t.object.userData.rackId || t.object.userData.blockId))
        return t.object.userData;
    return null;
  }
  down(e) {
    if (e.button !== 0) return;
    if (e.shiftKey && this.mode === "top") {
      const n = this.hit(e);
      if (n) {
        this.pointerStart = null, this.handlers.multiSelect?.(n), e.stopImmediatePropagation();
        return;
      }
    }
    this.mode === "walk" && (this.renderer.domElement.focus(), this.walkPointer = { x: e.clientX, y: e.clientY }, this.renderer.domElement.setPointerCapture(e.pointerId));
    const t = this.hit(e);
    if (this.pointerStart = { x: e.clientX, y: e.clientY, hit: t }, t && this.mode === "top" && this.editable) {
      const n = t.blockId ? this.layout.blocks.find((s) => s.id === t.blockId) : this.layout.placements.find((s) => s.rack_id === t.rackId);
      if (!n || n.locked) return;
      const r = this.floorPoint(e);
      if (!r) return;
      this.drag = { id: t.rackId, blockId: t.blockId, dx: n.x - r.x * 1e3, dz: n.z - r.z * 1e3 }, this.handlers.dragStart?.(t), this.controls.enabled = !1, e.stopImmediatePropagation(), this.renderer.domElement.setPointerCapture(e.pointerId);
    }
  }
  move(e) {
    if (this.tooltip.hidden = !0, !this.drag && !this.walkPointer && this.mode !== "top") {
      this.point(e), this.content.updateMatrixWorld(!0);
      const t = this.ray.intersectObjects(this.content.children, !0).find((n) => this.isVisible(n.object) && n.object.isMesh && !(n.object.material.transparent && n.object.material.opacity < 0.5));
      if (t?.object.userData.deviceInfo) {
        const n = t.object.userData.deviceInfo, r = v_(t.object.userData);
        if (r.length) {
          this.tooltip.textContent = `${n.name}${t.object.userData.interfaceName ? " · " + t.object.userData.interfaceName : ""} · ${r.join(" / ")}`, this.tooltip.hidden = !1;
          const s = this.host.getBoundingClientRect();
          this.tooltip.style.left = `${Math.max(0, Math.min(e.clientX - s.left + 12, s.width - this.tooltip.offsetWidth))}px`, this.tooltip.style.top = `${Math.max(0, e.clientY - s.top - this.tooltip.offsetHeight - 10)}px`;
        }
      }
    }
    if (this.mode === "walk" && this.walkPointer) {
      this.yaw -= (e.clientX - this.walkPointer.x) * 4e-3, this.pitch = mc.clamp(this.pitch - (e.clientY - this.walkPointer.y) * 4e-3, -1.3, 1.3), this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ"), this.walkPointer = { x: e.clientX, y: e.clientY }, this.draw();
      return;
    }
    this.drag && (this.drag.moved = !0, this.pendingDrag = { clientX: e.clientX, clientY: e.clientY }, this.dragRAF || (this.dragRAF = requestAnimationFrame(() => this.flushDrag())));
  }
  up(e) {
    this.walkPointer = null;
    const t = this.pointerStart;
    this.drag && (this.drag.moved && (this.pendingDrag = { clientX: e.clientX, clientY: e.clientY }), this.flushDrag(), this.drag = null, this.controls.enabled = !0, this.handlers.dragEnd()), t && Math.hypot(e.clientX - t.x, e.clientY - t.y) < 5 && t.hit && (t.hit.blockId ? this.handlers.selectBlock(t.hit.blockId) : this.handlers.select(t.hit.rackId, this.mode === "top" ? null : t.hit.deviceId)), this.pointerStart = null;
  }
  cube(e, t, n, r, s, a, o, l = this.content, c = {}) {
    const h = new Ot(new yn(e, t, n), new Ac({ color: o, roughness: 0.78, ...c }));
    return h.position.set(r, s, a), l.add(h), h;
  }
  label(e, t, n, r, s, a = "") {
    const o = document.createElement("div");
    o.className = `r3-label ${a}`, o.textContent = e;
    const l = new Gl(o);
    return o.style.pointerEvents = "none", l.position.set(t, n, r), s.add(l), l;
  }
  texture(e, t, n) {
    this.state();
    const r = JSON.stringify(["image", e, t, n.toFixed(2)]);
    return this.pool.acquire(r, () => {
      const s = document.createElement("canvas");
      s.width = 1024, s.height = Math.max(32, Math.min(4096, Math.round(1024 / n)));
      const a = s.getContext("2d");
      a.fillStyle = t, a.fillRect(0, 0, s.width, s.height);
      const o = new Qa(s);
      o.colorSpace = Zt, o.userData.poolKey = r;
      const l = new Image();
      l.crossOrigin = "anonymous";
      let c = !1;
      return l.onload = () => {
        if (c) return;
        const h = Math.min(s.width / l.width, s.height / l.height);
        a.drawImage(l, (s.width - l.width * h) / 2, (s.height - l.height * h) / 2, l.width * h, l.height * h), o.needsUpdate = !0, this.draw();
      }, l.onerror = () => {
        c || this.handlers.imageError?.();
      }, l.src = e, { texture: o, dispose() {
        c = !0, l.onload = l.onerror = null, o.dispose();
      } };
    }).texture;
  }
  clear() {
    this.state(), this.clearFocus(), this.tooltip.hidden = !0;
    for (const e of this.rackNodes.values()) e.group.add(e.details, e.top);
    this.disposeGroup(this.content), this.content.clear(), this.rackNodes.clear(), this.blockNodes.clear(), this.environment = null, this.envKey = null, this.selectionKey = void 0, this.selectionObjects = [], this.pool.prune();
  }
  clearFocus() {
    this.focusRAF && cancelAnimationFrame(this.focusRAF), this.focusRAF = null, this.disposeGroup(this.focusGroup), this.focusGroup = null;
  }
  highlight(e) {
    this.clearFocus(), this.content.updateMatrixWorld(!0);
    const t = new rr();
    if (this.content.traverse((f) => {
      f.isMesh && f.userData.rackId === e.rackId && (!e.deviceId || f.userData.deviceId === e.deviceId) && t.expandByObject(f);
    }), t.isEmpty()) {
      e.deviceId && this.highlight({ rackId: e.rackId });
      return;
    }
    const n = t.getSize(new N()).addScalar(0.025), r = t.getCenter(new N()), s = new yn(n.x, n.y, n.z), a = new Xn({ color: "#ffb000", transparent: !0, depthTest: !1 }), o = new Si(new Zi(s), a);
    o.position.copy(r), o.renderOrder = 1e3, this.focusGroup = new qt(), this.content.add(this.focusGroup), this.focusGroup.add(o);
    const l = new qn({ color: "#ffc400", transparent: !0, opacity: 0.2, depthTest: !1, depthWrite: !1 }), c = new Ot(s, l);
    c.raycast = () => {
    }, c.position.copy(r), c.renderOrder = 999, this.focusGroup.add(c);
    const h = this.racks.find((f) => f.id === e.rackId), d = h?.devices.find((f) => f.id === e.deviceId), u = document.createElement("div");
    u.className = "r3-focus-tag", u.setAttribute("role", "status"), u.textContent = `▼ ${d?.name || h?.name} · 위치 강조`;
    const p = new Gl(u);
    p.position.set(r.x, t.max.y + 0.06, r.z), this.focusGroup.add(p);
    const g = performance.now(), _ = window.matchMedia("(prefers-reduced-motion: reduce)").matches, m = (f) => {
      const T = f - g < 5e3, b = T && !_ ? 0.55 + 0.45 * Math.cos((f - g) / 1200 * Math.PI * 2) : 0.8;
      a.opacity = b, l.opacity = 0.08 + b * 0.22, u.style.opacity = String(0.65 + b * 0.35), this.draw(), T && !_ ? this.focusRAF = requestAnimationFrame(m) : this.focusRAF = null;
    };
    m(g);
  }
  textPanel(e, t, n, r, s, a, o, l = !1, c = {}) {
    this.state();
    const h = JSON.stringify(["text", e, !!c.unitLabel, !!c.interfaceId, c.statusColor, !!c.isPrimary]), d = this.pool.acquire(h, () => {
      const p = document.createElement("canvas");
      p.width = c.unitLabel || c.interfaceId ? 128 : 512, p.height = c.interfaceId || c.unitLabel ? 128 : 64;
      const g = p.getContext("2d");
      g.fillStyle = c.statusColor || "#172d3b", g.fillRect(0, 0, p.width, p.height), g.fillStyle = "#f1f5f9", g.font = "bold " + (c.unitLabel ? 75 : c.interfaceId ? 23 : 45) + "px sans-serif", g.textAlign = "center", g.textBaseline = "middle", g.fillText(e, p.width / 2, p.height / 2, p.width - 12), c.interfaceId && (g.strokeStyle = c.isPrimary ? "#fbbf24" : "#82929f", g.lineWidth = c.isPrimary ? 4.5 : 2, g.strokeRect(2.5, 2.5, 123, 123));
      const _ = new Qa(p);
      _.colorSpace = Zt;
      const m = new qn({ map: _ });
      return { material: m, dispose() {
        _.dispose(), m.dispose();
      } };
    }), u = new Ot(new si(t, n), d.material);
    u.position.set(r, s, a), u.rotation.y = l ? Math.PI : 0, u.userData = { ...c, textPanel: !0, textKey: h }, o.add(u);
  }
  roomObject(e, t, n) {
    const r = e.type || "pillar", s = xr[r] || xr.pillar, a = Je(e.width), o = Je(e.depth), l = Je(e.height), c = new qt();
    c.position.set(Je(e.x), 0, Je(e.z)), c.rotation.y = -(e.rotation || 0) * Math.PI / 180, this.content.add(c);
    const h = t ? "#0d9488" : s.color, d = (u, p, g, _, m, f, T = h, b = {}) => {
      const y = this.cube(u, p, g, _, m, f, T, c, b);
      return y.userData = { blockId: e.id }, y;
    };
    if (r === "desk") {
      d(a, l * 0.09, o, 0, l * 0.955, 0);
      for (const u of [-a * 0.43, a * 0.43]) for (const p of [-o * 0.4, o * 0.4]) d(a * 0.045, l * 0.91, o * 0.06, u, l * 0.455, p, "#485560");
    } else if (r === "glass") {
      d(a, l, o * 0.35, 0, l / 2, 0, "#91d5e2", { transparent: !0, opacity: 0.3, depthWrite: !1 });
      for (const u of [-a * 0.48, a * 0.48]) d(a * 0.04, l, o, u, l / 2, 0, "#566977");
      for (const u of [l * 0.015, l * 0.985]) d(a, l * 0.03, o, 0, u, 0, "#566977");
    } else if (r === "door")
      d(a, l, o, 0, l / 2, 0, "#455966"), d(a * 0.88, l * 0.94, o * 0.9, 0, l * 0.47, o * 0.07), d(a * 0.04, l * 0.025, o * 0.15, a * 0.32, l * 0.46, o * 0.53, "#e5c16b");
    else if (d(a, l, o, 0, l / 2, 0), ["ups", "cooling", "battery"].includes(r)) {
      d(a * 0.3, l * 0.1, o * 0.012, -a * 0.15, l * 0.8, o * 0.506, "#142c36"), d(a * 0.12, l * 0.045, o * 0.014, -a * 0.15, l * 0.8, o * 0.52, "#65dec0");
      for (let u = 0; u < 7; u++) d(a * 0.74, l * 0.014, o * 0.012, 0, l * (0.15 + u * 0.065), o * 0.506, "#364b57");
      r === "battery" && d(a * 0.12, l * 0.09, o * 0.014, a * 0.25, l * 0.8, o * 0.52, "#f3c751");
    }
    return t && d(a + 0.06, 8e-3, o + 0.06, 0, 6e-3, 0, "#2dd4bf", { transparent: !0, opacity: 0.5 }), n.labels && this.label(e.name, 0, l + 0.12, 0, c, t ? "active" : "muted"), c;
  }
  state() {
    this.rackNodes ||= /* @__PURE__ */ new Map(), this.blockNodes ||= /* @__PURE__ */ new Map(), this.pool ||= new __();
  }
  disposeGroup(e) {
    e && (e !== this.content && e.removeFromParent(), e.traverse((t) => {
      if (t.geometry?.dispose(), t.userData.textKey) this.pool.release(t.userData.textKey);
      else if (t.material) for (const n of Array.isArray(t.material) ? t.material : [t.material])
        n.userData.imageKey && this.pool.release(n.userData.imageKey), n.dispose();
      t.isCSS2DObject && t.element.remove();
    }));
  }
  removeRack(e) {
    e.group.add(e.details, e.top), this.disposeGroup(e.group);
  }
  syncMode() {
    for (const e of this.rackNodes?.values() || []) {
      const t = this.mode === "top" ? e.top : e.details, n = this.mode === "top" ? e.details : e.top;
      n.parent && (n.traverse((r) => {
        r.isCSS2DObject && r.element.remove();
      }), n.removeFromParent()), t.parent || e.group.add(t);
    }
  }
  movePlacement(e, t, n) {
    const r = (e === "block" ? this.blockNodes : this.rackNodes)?.get(t);
    r && (r.group.position.set(Je(n.x), 0, Je(n.z)), r.group.rotation.y = -(n.rotation || 0) * Math.PI / 180, this.draw());
  }
  setSelection(e) {
    const t = JSON.stringify(e || null);
    if (this.selectionKey === t) return;
    for (const l of this.rackNodes.values()) {
      for (const c of l.frameMeshes) c.material.color.set("#273847");
      l.nameLabel?.element.classList.remove("active");
    }
    for (const l of this.selectionObjects || []) this.disposeGroup(l);
    this.selectionObjects = [], this.selectionKey = t;
    const n = this.rackNodes.get(e?.rackId);
    if (!n) return;
    for (const l of n.frameMeshes) l.material.color.set("#0d9488");
    n.nameLabel?.element.classList.add("active");
    const r = this.layout.placements.find((l) => l.rack_id === e.rackId), s = Ut(this.racks.find((l) => l.id === e.rackId), r), a = this.cube(Je(s.width) + 0.12, 0.012, Je(s.depth) + 0.12, 0, 8e-3, 0, "#2dd4bf", n.group, { transparent: !0, opacity: 0.45 });
    this.selectionObjects.push(a);
    const o = n.devices.get(e.deviceId);
    if (o) {
      const l = new Si(new Zi(o.geometry), new Xn({ color: "#fbbf24" }));
      o.parent.add(l), this.selectionObjects.push(l);
    }
  }
  markMany(e) {
    for (const t of this.multiMarkers || []) this.disposeGroup(t);
    this.multiMarkers = [];
    for (const t of e) {
      const [n, r] = t.split(":"), s = n === "rack" ? this.rackNodes?.get(Number(r)) : this.blockNodes?.get(r);
      if (!s) continue;
      const a = n === "rack" ? Ut(this.racks.find((h) => h.id === Number(r)), this.layout.placements.find((h) => h.rack_id === Number(r))) : this.layout.blocks.find((h) => h.id === r), o = new yn(Je(a.width) + 0.03, 0.02, Je(a.depth) + 0.03), l = new Zi(o);
      o.dispose();
      const c = new Si(l, new Xn({ color: "#e5a321", depthTest: !1 }));
      c.position.y = Je(a.height) + 0.02, c.renderOrder = 20, s.group.add(c), this.multiMarkers.push(c);
    }
    this.draw();
  }
  update(e, t, n, r = {}) {
    this.state(), this.clearFocus(), this.layout = e, this.racks = t, this.editable = r.editable;
    const s = new Map(t.map((h) => [h.id, h]));
    if (this.walkObstacles = [...e.blocks, ...e.placements.flatMap((h) => {
      const d = s.get(h.rack_id);
      return d ? [{ ...h, ...Ut(d, h) }] : [];
    })].map(bt), this.mode === "walk") {
      const h = this.camera.position;
      if (!this.walkFree(h.x, h.z)) {
        const d = this.walkStart();
        if (d) h.copy(d);
        else {
          this.handlers.exitWalk(), this.handlers.walkError();
          return;
        }
      }
      h.y = Math.min(1.65, Je(e.height) - 0.1);
    }
    const a = JSON.stringify([e.width, e.depth, e.height, e.grid, e.grid_origin, r.grid, r.walls]);
    this.envKey !== a && (this.disposeGroup(this.environment), this.environment = g_.call(this, e, r), this.envKey = a);
    const o = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), c = [r.labels, r.units, r.usage, r.sides, r.transparent, r.deviceColors, r.statuses, r.assetTags, r.serialNumbers];
    for (const h of e.placements) {
      const d = s.get(h.rack_id);
      if (!d) continue;
      o.add(d.id);
      const u = JSON.stringify([d, Ut(d, h), h.locked, c, d.devices.map((g) => e.appearances[String(g.id)])]);
      let p = this.rackNodes.get(d.id);
      p?.key !== u && (p && this.removeRack(p), p = m_.call(this, h, d, e, r), p.key = u, this.rackNodes.set(d.id, p), this.selectionKey = void 0), this.movePlacement("rack", d.id, h);
      for (const g of p.devices.values())
        g.parent.visible = !r.statusFilter || g.userData.deviceInfo.status === r.statusFilter;
    }
    for (const [h, d] of this.rackNodes) o.has(h) || (this.removeRack(d), this.rackNodes.delete(h), this.selectionKey = void 0);
    for (const h of e.blocks) {
      l.add(h.id);
      const { x: d, z: u, rotation: p, ...g } = h, _ = JSON.stringify([g, r.labels, n?.blockId === h.id]);
      let m = this.blockNodes.get(h.id);
      m?.key !== _ && (this.disposeGroup(m?.group), m = { group: this.roomObject(h, n?.blockId === h.id, r), key: _ }, this.blockNodes.set(h.id, m)), this.movePlacement("block", h.id, h);
    }
    for (const [h, d] of this.blockNodes) l.has(h) || (this.disposeGroup(d.group), this.blockNodes.delete(h));
    this.setSelection(n), this.syncMode(), this.pool.prune(), this.draw();
  }
  view(e, t) {
    if (this.clearFocus(), cancelAnimationFrame(this.walkRAF), this.walkTime = null, this.keys.clear(), this.walkPointer = null, e === "walk") {
      const a = this.walkStart();
      if (!a) {
        this.handlers.walkError();
        return;
      }
      this.mode = "walk", this.syncMode(), this.controls.enabled = !1, this.camera.position.copy(a), this.yaw = 0, this.pitch = 0, this.camera.rotation.set(0, 0, 0, "YXZ"), this.renderer.domElement.focus(), this.draw(), this.walkRAF = requestAnimationFrame((o) => this.walkFrame(o));
      return;
    }
    this.controls.enabled = !0, this.mode = e === "top" ? "top" : "3d", this.syncMode(), this.controls.enableRotate = e !== "top";
    const n = this.layout;
    if (!n) return;
    const r = new N(Je(n.width) / 2, 0, Je(n.depth) / 2), s = Math.max(Je(n.width), Je(n.depth));
    if ((e === "front" || e === "rear") && t) {
      const a = n.placements.find((l) => l.rack_id === t.rackId), o = this.racks.find((l) => l.id === t.rackId);
      if (a && o) {
        const l = Ut(o, a), c = -a.rotation * Math.PI / 180;
        r.set(Je(a.x), Je(l.height) / 2, Je(a.z));
        const h = new N(0, 0.12, (e === "rear" ? -1 : 1) * (Je(l.depth) / 2 + 3.4)).applyAxisAngle(new N(0, 1, 0), c);
        this.camera.position.copy(r).add(h);
      }
    } else e === "top" ? this.camera.position.set(r.x, s * 1.5, r.z + 1e-3) : this.camera.position.set(r.x + s * 0.8, s * 0.8, r.z + s * 0.85);
    this.controls.target.copy(r), this.controls.update(), this.camera.updateMatrixWorld(), this.scene.updateMatrixWorld(!0), this.sizeLabels(), this.labels.render(this.scene, this.camera), this.draw();
  }
}
const ot = (i) => String(i ?? "").replace(/[&<>"']/g, (e) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[e]), It = (i) => structuredClone(i), Tt = document.querySelector("#room3d"), Tn = new ah(Tt);
let Ne, q, Gn, vs, Ft, mi = [], Ee = null, rt, Nt = !1, bn = !1, Ht = [], vn, zc = !1, Wn, Hc, St = "3d", Mo = "", Vc = !1, ca = 0;
const Lt = { units: !0, usage: !0, statuses: !0, statusFilter: "", grid: !0, walls: !0, labels: !0, transparent: !0, sides: !1, deviceColors: !1, assetTags: !0, serialNumbers: !0, snap: !0 };
Tt.innerHTML = `
  <div class="r3-app">
    <div class="r3-location-bar"><label>LOCATION <select class="no-ts" id="r3-location" aria-label="Location 선택"></select></label><label class="r3-check"><input type="checkbox" id="r3-only-rack-locations"> 랙이 배치된 Location만</label><span id="r3-room-summary"></span><div class="r3-location-actions"><button class="r3-btn small" data-action="room">서버실 설정</button><button class="r3-btn small" data-action="reload">다시 불러오기</button><span id="r3-save-state" role="status">불러오는 중</span><button data-action="cancel" class="r3-btn small">취소</button><button data-action="save" class="r3-btn small primary">배치 저장</button></div></div>
    <div id="r3-notice" role="status" aria-live="polite" hidden></div>
    <div class="r3-workspace">
      <aside class="r3-library"><div class="r3-section-title"><h2>랙 라이브러리</h2><span id="r3-rack-count"></span></div><p class="r3-help">기존 랙을 화면으로 끌어다 배치하세요.</p><input id="r3-search" type="search" placeholder="랙 · 서버명 · IP 검색" aria-label="랙 또는 서버 검색"><label>장비 상태<select class="no-ts" id="r3-status-filter"><option value="">전체 상태</option></select></label><div id="r3-search-results"></div><label class="r3-check"><input type="checkbox" id="r3-show-placed"> 배치된 랙 포함</label><div id="r3-rack-list"></div><div class="r3-library-bottom"><span class="r3-eyebrow">ROOM OBJECTS</span><label>오브젝트 종류<select class="no-ts" id="r3-object-type" aria-label="오브젝트 종류">${Object.entries(xr).map(([i, e]) => `<option value="${i}">${e.name}</option>`).join("")}</select></label><button data-action="add-block" class="r3-btn wide">＋ 룸 오브젝트 추가</button><div id="r3-block-list"></div></div></aside>
      <main class="r3-stage"><div class="r3-toolbar"><div class="r3-segment"><button data-action="view" data-view="3d" class="active">3D 보기</button><button data-action="view" data-view="top">평면 배치</button><button data-action="view" data-view="walk">워킹 모드</button></div><div class="r3-tools"><button data-action="fit" title="전체 보기">전체 보기</button><button data-action="undo" title="되돌리기">↶ 되돌리기</button><label><input id="r3-snap" type="checkbox" checked> 격자 맞춤</label></div></div><div id="r3-canvas"></div><div class="r3-stage-footer"><span id="r3-scene-stats"></span><span id="r3-controls-help">드래그 회전 · 우클릭 이동 · 휠 확대</span></div><div id="r3-invalid" role="alert" hidden></div></main>
      <aside id="r3-inspector" class="r3-inspector"></aside>
    </div>
    <footer class="r3-footer"><span><i></i> ${Tn.demo ? "샘플 데이터 · 이 브라우저에 저장됩니다" : "NetBox 인벤토리 · 레이아웃만 저장됩니다"}</span><div><label><input id="r3-units" type="checkbox" checked> U 번호·빈 슬롯</label><label><input id="r3-usage" type="checkbox" checked> 사용 현황</label><label><input id="r3-statuses" type="checkbox" checked> 상태 표시</label><label><input id="r3-grid" type="checkbox" checked> 격자 표시</label><label>한 칸 (mm)<input id="r3-grid-size" type="number" min="100" max="5000" step="1" required aria-label="격자 한 칸 (mm)"></label><label>격자 시작<select class="no-ts" id="r3-grid-origin" aria-label="격자 배치 시작 위치"><option value="top-left">좌상</option><option value="bottom-left">좌하</option><option value="top-right">우상</option><option value="bottom-right">우하</option></select></label><label><input id="r3-walls" type="checkbox" checked> 벽</label><label><input id="r3-labels" type="checkbox" checked> 이름</label><label><input id="r3-transparent" type="checkbox" checked> 투명 프레임</label><label><input id="r3-sides" type="checkbox"> 랙 측면 덮개</label><label><input id="r3-deviceColors" type="checkbox"> 서버 상·하단 할당 색상</label></div></footer>
  </div>
  <dialog id="r3-room-dialog"><form id="r3-room-form"><div class="r3-dialog-title"><h2>서버실 기본 설정</h2><button type="button" class="r3-icon-button" data-action="close-room" aria-label="닫기">×</button></div><p>선택한 Location에 공간을 연결합니다. 모든 치수는 mm입니다.</p><label>서버실 이름<input name="name" required maxlength="100"></label><div class="r3-form-grid"><label>가로 (mm)<input type="number" name="width" min="500" max="100000" required></label><label>세로 (mm)<input type="number" name="depth" min="500" max="100000" required></label><label>높이 (mm)<input type="number" name="height" min="500" max="100000" required></label><label>격자 크기 (mm)<input type="number" name="grid" min="100" max="5000" required></label></div><label class="r3-check"><input name="include_descendants" type="checkbox"> 하위 Location의 랙 포함</label><p class="r3-help">공간을 줄이면 기존 배치가 경계를 벗어날 수 있습니다.</p><div class="r3-dialog-actions"><button type="button" data-action="close-room" class="r3-btn">닫기</button><button type="submit" class="r3-btn primary">설정 적용</button></div></form></dialog>`;
const Ce = (i) => Tt.querySelector(i);
for (const [i, e] of [["assetTags", "자산번호 전체 표시"], ["serialNumbers", "시리얼 번호 전체 표시"]]) {
  const t = document.createElement("label"), n = document.createElement("input");
  n.type = "checkbox", n.id = `r3-${i}`, n.checked = Lt[i], t.append(n, document.createTextNode(` ${e}`)), Ce(".r3-footer > div").append(t);
}
const Ts = document.createElement("span");
Ts.className = "r3-version";
Ts.textContent = `Room 3D v${Tt.dataset.version || Qg.version}`;
Ts.setAttribute("aria-label", "Room 3D plugin version");
const So = document.createElement("div");
So.className = "r3-statusbar";
So.append(Ce("#r3-scene-stats"), Ts);
Ce(".r3-app").append(So);
const yo = document.createElement("div");
yo.className = "r3-collision-controls";
yo.innerHTML = '<label class="r3-check"><input id="r3-repel" type="checkbox" checked> 겹침 자동 밀림</label><button class="r3-btn small" data-action="fix-overlap">겹침 자동 수정</button>';
Ce(".r3-location-actions").prepend(yo);
const yi = () => Ce("#r3-repel").checked;
function or() {
  const i = Math.max(0, Tt.getBoundingClientRect().top), e = Math.max(240, (window.visualViewport?.height || window.innerHeight) - i - 12), t = `${Math.floor(e)}px`;
  Tt.style.getPropertyValue("--r3-available-height") !== t && Tt.style.setProperty("--r3-available-height", t);
}
or();
window.addEventListener("resize", or);
window.visualViewport?.addEventListener("resize", or);
document.addEventListener("fullscreenchange", or);
const M_ = new ResizeObserver(or);
M_.observe(Tt.parentElement);
document.fonts?.ready.then(or);
function tt(i = "", e = !1) {
  const t = Ce("#r3-notice");
  t.textContent = i, t.hidden = !i, t.className = e ? "error" : "";
}
function Xt() {
  Ht.push({ layout: It(q), racks: Ne.racks }), Ht.length > 30 && Ht.shift();
}
function cn(i = !1) {
  Nt = JSON.stringify(q) !== JSON.stringify(Gn), gt(i);
}
function Fe() {
  return !!Ne?.can_edit && !bn;
}
function Gc(i) {
  bn = i, gt();
}
function _n(i, e, t, n = "placement", r = !1, s = 0) {
  return `<label>${i}<input type="number" min="${s}" step="any" data-edit="${n}" data-key="${e}" value="${ot(t)}" ${r || !Fe() ? "disabled" : ""}></label>`;
}
function S_(i) {
  const e = `${i} 복사본`, t = new Set(q.blocks.map((n) => n.name));
  if (!t.has(e)) return e;
  for (let n = 2; ; n++) if (!t.has(`${e} ${n}`)) return `${e} ${n}`;
}
function xs(i, e) {
  const t = q.grid_origin || "top-left", n = e === "x" ? t.endsWith("right") : t.startsWith("bottom");
  return eh(i, q.grid, Lt.snap, n ? q[e === "x" ? "width" : "depth"] : 0);
}
function Xi(i) {
  const e = bt(i);
  return { x: e[0], z: e[1] };
}
function Tr(i, e, t) {
  const n = bt({ ...i, x: e, z: t });
  return { x: e + xs(n[0], "x") - n[0], z: t + xs(n[1], "z") - n[1] };
}
function Yl(i, e = null) {
  const t = (o, l) => ({ x: i.x, z: i.z } = Tr(i, o, l), !Pn({ ...q, blocks: [...q.blocks, i] }, Ne.racks).length), n = Math.max(100, q.grid);
  if (e)
    for (let o = 1; o <= 12; o++) {
      for (let l = -o; l <= o; l++) for (const c of [-o, o]) if (t(e.x + c * n, e.z + l * n)) return !0;
      for (let l = -o + 1; l < o; l++) for (const c of [-o, o]) if (t(e.x + l * n, e.z + c * n)) return !0;
    }
  const r = Math.max(100, q.grid, q.width / 80, q.depth / 80), s = (o, l, c) => {
    const h = [];
    for (let d = l; d <= o - l; d += r) h.push(d);
    return c ? h.reverse() : h;
  }, a = q.grid_origin || "top-left";
  for (const o of s(q.depth, i.depth / 2, a.startsWith("bottom")))
    for (const l of s(q.width, i.width / 2, a.endsWith("right"))) if (t(l, o)) return !0;
  return !1;
}
function Wc(i, e) {
  const t = Ss(i);
  return t ? `<a href="${ot(t)}" target="_blank" rel="noopener noreferrer">${e} ↗</a>` : '<span class="r3-help">샘플 장비</span>';
}
function bo() {
  const i = mi.filter((n) => !zc || n.has_racks), e = i.some((n) => n.id === Ft), t = e ? "" : `<option value="" disabled selected>${i.length ? "Location 선택 (현재 화면 유지)" : "조건에 맞는 Location이 없습니다"}</option>`;
  Ce("#r3-location").innerHTML = t + i.map((n) => `<option value="${n.id}">${ot(n.site)} / ${ot(n.name)}</option>`).join(""), e && (Ce("#r3-location").value = String(Ft)), Ce("#r3-location").disabled = bn || !i.length, Ce("#r3-only-rack-locations").disabled = bn;
}
function gt(i = !1, e = !0) {
  if (!Ne || !q) return;
  const t = Pn(q, Ne.racks);
  Ce("#r3-grid-size").value = q.grid, Ce("#r3-grid-size").disabled = !Fe(), Ce("#r3-grid-origin").value = q.grid_origin || "top-left", Ce("#r3-grid-origin").disabled = !Fe(), Ce("#r3-save-state").textContent = Ne.can_edit ? bn ? "처리 중…" : Nt ? "저장하지 않은 변경" : `저장됨 · v${q.revision}` : "읽기 전용", Ce("#r3-save-state").className = Nt ? "unsaved" : "", Ce("[data-action=save]").disabled = !Fe() || !Nt || t.length > 0, Ce("[data-action=cancel]").disabled = bn || !Nt, Ce("[data-action=undo]").disabled = !Fe() || !Ht.length, Ce("[data-action=add-block]").disabled = !Fe(), Ce("[data-action=fix-overlap]").disabled = !Fe(), Ce("#r3-repel").disabled = !Fe(), bo(), Ce("[data-action=room]").disabled = !Fe(), Ce("#r3-room-summary").textContent = `${q.name} · ${q.width / 1e3} × ${q.depth / 1e3} m · ${q.height / 1e3} m 높이`, Ce("#r3-rack-count").textContent = `${Ne.racks.length}`;
  const n = new Set(q.placements.map((l) => l.rack_id)), r = Mo.trim().toLowerCase(), s = new Map(Ne.racks.flatMap((l) => l.devices.map((c) => [c.status, c.status_label || c.status])));
  Lt.statusFilter && !s.has(Lt.statusFilter) && (Lt.statusFilter = ""), Ce("#r3-status-filter").innerHTML = '<option value="">전체 상태</option>' + [...s].map(([l, c]) => `<option value="${ot(l)}" ${Lt.statusFilter === l ? "selected" : ""}>${ot(c)}</option>`).join("");
  const a = Ne.racks.flatMap((l) => l.devices.filter((c) => Do(c, r, Lt.statusFilter)).map((c) => ({ r: l, d: c })));
  Ce("#r3-search-results").innerHTML = r || Lt.statusFilter ? `<p class="r3-help">장비 검색 ${a.length}개 · 현재 Location</p>` + a.map(({ r: l, d: c }) => `<button class="r3-btn wide" data-action="find-device" data-rack-id="${l.id}" data-id="${c.id}">${ot(c.name)} · ${ot(l.name)} · ${ot(c.status_label || c.status)}${n.has(l.id) ? "" : " · 미배치"}<small class="r3-result-ips">${Lo(c, r).matched ? "일치 IP" : "IP"}: ${Lo(c, r).ips.map((h) => ot(h)).join(" · ") || "조회 가능한 IP 없음"}</small></button>`).join("") : "";
  const o = Ne.racks.filter((l) => (Vc || r || Lt.statusFilter || !n.has(l.id)) && (!Lt.statusFilter || l.devices.some((c) => c.status === Lt.statusFilter)) && (!r || l.name.toLowerCase().includes(r) || l.devices.some((c) => Do(c, r, Lt.statusFilter))));
  Ce("#r3-rack-list").innerHTML = o.length ? o.map((l) => `<div class="r3-rack-card ${Ee?.rackId === l.id ? "selected" : ""}" draggable="${Fe() && !n.has(l.id)}" data-rack="${l.id}"><button class="r3-rack-select" data-action="select" data-id="${l.id}"><span class="r3-rack-icon">▥</span><span><strong>${ot(l.name)}</strong><small>${l.u_height}U · ${l.width} × ${l.depth} mm</small></span></button><div class="r3-rack-meta"><span>${l.devices.length} 장비 · ${ha(l).used}/${l.u_height}U · 잔여 ${ha(l).free}U</span><button data-action="${n.has(l.id) ? "select" : "place"}" data-id="${l.id}" ${!n.has(l.id) && !Fe() ? "disabled" : ""}>${n.has(l.id) ? "배치됨 ↗" : "＋ 배치"}</button></div></div>`).join("") : '<div class="r3-empty">미배치 랙이 없습니다.<br>배치된 랙 포함을 켜서 확인하세요.</div>', Ce("#r3-block-list").innerHTML = q.blocks.map((l) => `<button class="r3-block-item" data-action="select-block" data-id="${ot(l.id)}">▧ ${ot(l.name)}</button>`).join(""), Ce("#r3-scene-stats").textContent = `${q.placements.length} / ${Ne.racks.length} 랙 배치 · ${Ne.racks.filter((l) => n.has(l.id)).reduce((l, c) => l + c.devices.length, 0)} 장비`, Ce("#r3-invalid").hidden = !t.length, Ce("#r3-invalid").textContent = t.length ? `저장 전 확인 · ${t.slice(0, 3).join(" / ")}` : "", Ce("#r3-controls-help").textContent = St === "walk" ? "WASD / 방향키 이동 · 드래그 둘러보기 · Shift 빠르게 · Esc 종료" : St === "top" ? "랙 드래그 배치 · 우클릭 이동 · 휠 확대" : "드래그 회전 · 우클릭 이동 · 휠 확대", Ce("[data-action=fit]").textContent = St === "walk" ? "시작 위치" : "전체 보기", Ce("[data-action=fit]").title = St === "walk" ? "워킹 시작 위치로 이동" : "전체 보기", Tt.querySelectorAll("[data-action=view]").forEach((l) => l.classList.toggle("active", l.dataset.view === St)), i || $c(), Tt.querySelectorAll("select").forEach((l) => l.classList.add("no-ts")), e && rt?.update(q, Ne.racks, Ee, { ...Lt, editable: Fe() }), Wn?.refresh(), Hc?.refresh();
}
function $c() {
  const i = Ce("#r3-inspector");
  if (Ee?.blockId) {
    const o = q.blocks.find((c) => c.id === Ee.blockId);
    if (!o)
      return Ee = null, $c();
    const l = Xi(o);
    i.innerHTML = `<div class="r3-section-title"><h2>${ot(xr[o.type || "pillar"]?.name || "룸 오브젝트")}</h2><span class="r3-tag">BLOCK</span></div><label>이름<input data-edit="block" data-key="name" value="${ot(o.name)}" maxlength="100" ${Fe() ? "" : "disabled"}></label><div class="r3-form-grid">${_n("좌측 X (mm)", "x", l.x, "block")}${_n("상단 Z (mm)", "z", l.z, "block")}${_n("폭 (mm)", "width", o.width, "block", !1, 100)}${_n("깊이 (mm)", "depth", o.depth, "block", !1, 100)}${_n("높이 (mm)", "height", o.height, "block", !1, 100)}</div><label>방향<select data-edit="block" data-key="rotation" ${Fe() ? "" : "disabled"}>${[0, 90, 180, 270].map((c) => `<option value="${c}" ${c === (o.rotation || 0) ? "selected" : ""}>${c}°</option>`).join("")}</select></label><p class="r3-help">좌표는 오브젝트의 좌측 상단 기준입니다. 평면 모드에서 드래그하거나 좌표를 입력하세요.</p><button data-action="duplicate-block" class="r3-btn wide" ${Fe() ? "" : "disabled"}>오브젝트 복사</button><button data-action="remove-block" class="r3-btn danger wide" ${Fe() ? "" : "disabled"}>블록 제거</button>`;
    return;
  }
  const e = Ne.racks.find((o) => o.id === Ee?.rackId);
  if (!e) {
    i.innerHTML = '<div class="r3-section-title"><h2>선택 정보</h2></div><div class="r3-inspector-empty"><span>◇</span><h3>공간을 구성해 보세요</h3><p>랙을 선택하면 위치와 치수를<br>조정하고 내부 장비를 확인할 수 있습니다.</p></div><div class="r3-tip"><strong>시작하기</strong><p>① 서버실 크기를 설정하세요.<br>② 평면 모드에서 랙을 배치하세요.<br>③ 3D로 앞뒤를 확인하고 저장하세요.</p></div>';
    return;
  }
  const t = q.placements.find((o) => o.rack_id === e.id), n = Ut(e, t), r = e.devices.find((o) => o.id === Ee.deviceId), s = e.devices.filter((o) => Ms(e, o) == null), a = t ? Xi({ ...t, ...n }) : null;
  i.innerHTML = `<div class="r3-section-title"><h2>${ot(e.name)}</h2><span class="r3-tag">${e.u_height}U</span></div>${Wc(e.url, "NetBox 랙 상세")}<div class="r3-view-buttons"><button data-action="front" ${t ? "" : "disabled"}>전면 보기</button><button data-action="rear" ${t ? "" : "disabled"}>후면 보기</button></div>
    ${t ? `<div class="r3-subtitle">배치 좌표 · 좌측 상단 기준 <label class="r3-check"><input type="checkbox" data-edit="placement" data-key="locked" ${t.locked ? "checked" : ""} ${Fe() ? "" : "disabled"}> 잠금</label></div><div class="r3-form-grid">${_n("좌측 X (mm)", "x", a.x, "placement", t.locked)}${_n("상단 Z (mm)", "z", a.z, "placement", t.locked)}</div><label>방향<select data-edit="placement" data-key="rotation" ${t.locked || !Fe() ? "disabled" : ""}>${[0, 90, 180, 270].map((o) => `<option value="${o}" ${o === t.rotation ? "selected" : ""}>${o}°</option>`).join("")}</select></label><details><summary>랙 표시 치수 보정</summary><p class="r3-help">원본 랙 치수는 변경되지 않습니다.${e.estimated.length ? " 일부 치수는 추정값입니다." : ""}</p><div class="r3-form-grid">${_n("폭 (mm)", "width", n.width, "dimensions", t.locked, 100)}${_n("깊이 (mm)", "depth", n.depth, "dimensions", t.locked, 100)}${_n("높이 (mm)", "height", n.height, "dimensions", t.locked, 100)}</div></details><button data-action="unplace" class="r3-btn danger wide" ${t.locked || !Fe() ? "disabled" : ""}>배치 해제</button>` : `<p class="r3-help">아직 배치되지 않은 랙입니다.</p><button data-action="place" data-id="${e.id}" class="r3-btn primary wide" ${Fe() ? "" : "disabled"}>서버실에 배치</button>`}
    <div class="r3-subtitle">장비 <span>${e.devices.length}</span></div>${e.desc_units ? '<p class="r3-help">U 번호: 위에서 아래로 증가</p>' : ""}${s.length ? `<p class="r3-warning">위치 없음·0U·범위 초과 ${s.length}개: 목록에서만 표시</p>` : ""}<div class="r3-devices">${e.devices.filter((o) => !Lt.statusFilter || o.status === Lt.statusFilter).map((o) => `<button data-action="device" data-id="${o.id}" class="r3-device ${r?.id === o.id ? "active" : ""}"><i style="background:${ot(q.appearances[String(o.id)]?.color || o.color)}"></i><span>${ot(o.name)}<small>${ot(o.model)}</small></span><b>${o.position == null ? "—" : "U" + o.position}</b></button>`).join("") || '<p class="r3-help">장비가 없습니다.</p>'}</div>${r ? y_(r) : '<p class="r3-help">장비를 선택하면 이미지와 색상을 설정할 수 있습니다.</p>'}`;
}
function y_(i) {
  const e = q.appearances[String(i.id)] || {}, t = ["front", "rear"].map((n) => {
    const r = i.images.find((a) => a.id === e[`${n}_image_id`])?.url || i[`${n}_image`], s = Tn.demo ? r : Ss(r);
    return `<div class="r3-face-preview"><span>${n === "front" ? "전면" : "후면"}</span>${s ? `<img src="${ot(s)}" alt="${ot(i.name)} ${n === "front" ? "전면" : "후면"} 이미지">` : `<div style="background:${ot(e.color || i.color)}">설정 색상</div>`}</div>`;
  }).join("");
  return `<div class="r3-device-detail"><div class="r3-subtitle">${ot(i.name)}</div><p class="r3-help">${i.u_height}U · ${i.face === "rear" ? "후면 장착" : "전면 장착"} · ${ot(i.status)}</p>${Wc(i.url, "NetBox 장비 상세")}<div class="r3-previews">${t}</div><label>이미지가 없는 면의 색상<input type="color" data-edit="appearance" data-key="color" value="${ot(e.color || i.color)}" ${Fe() ? "" : "disabled"}></label>${_n("표시 깊이 (mm, 빈 값은 추정)", "depth", e.depth ?? "", "appearance", !1, 20)}${["front", "rear"].map((n) => `<label>${n === "front" ? "전면" : "후면"} 이미지<select data-edit="appearance" data-key="${n}_image_id" ${Fe() ? "" : "disabled"}><option value="">Device Type 이미지 사용</option>${i.images.map((r) => `<option value="${r.id}" ${e[`${n}_image_id`] === r.id ? "selected" : ""}>${ot(r.name)}</option>`).join("")}</select></label>`).join("")}<button data-action="reset-appearance" class="r3-btn small" ${Fe() ? "" : "disabled"}>장비 표시 설정 초기화</button></div>`;
}
async function Eo(i) {
  const e = ++ca;
  bn = !0, Ce("#r3-location").disabled = !0, tt("서버실 정보를 불러오고 있습니다.");
  try {
    const t = await Tn.load(i);
    if (e !== ca) return;
    Ne = t, q = It(t.layout), Gn = It(q), vs = Ne.racks, Ft = i, Ee = q.placements[0] ? { rackId: q.placements[0].rack_id } : null, Ht = [], Nt = !1, Ce("#r3-location").value = String(i), tt(Ne.warning), bn = !1, gt(), rt?.view(St, Ee);
  } catch (t) {
    if (e !== ca) return;
    bn = !1, Ce("#r3-location").disabled = !1, tt(t.message, !0), Ft && (Ce("#r3-location").value = String(Ft)), gt();
  }
}
function Xc(i, e = q.width / 2, t = q.depth / 2, n = !0) {
  if (!Fe() || !Ne.racks.some((s) => s.id === i) || q.placements.some((s) => s.rack_id === i)) return;
  const r = It(q);
  r.placements.push({ rack_id: i, x: xs(e, "x"), z: xs(t, "z"), rotation: 0, locked: !1, dimensions: {} });
  try {
    const s = yi() ? vo(q, r, Ne.racks, [`rack:${i}`]) : r;
    Xt(), q = s;
  } catch (s) {
    tt(s.message, !0);
    return;
  }
  Ee = { rackId: i }, n && cn(), tt("랙을 배치했습니다. 평면 모드에서 위치를 조정한 뒤 저장하세요.");
}
Tt.addEventListener("dragstart", (i) => {
  const e = i.target.closest("[data-rack]");
  e && (i.dataTransfer.setData("text/plain", e.dataset.rack), i.dataTransfer.effectAllowed = "copy");
});
Tt.addEventListener("click", async (i) => {
  const e = i.target.closest("[data-action]");
  if (!e || e.disabled || !q) return;
  const t = e.dataset.action, n = Number(e.dataset.id);
  if (!(t === "find-device" || rt.drag))
    try {
      if (t === "fix-overlap" && Fe()) {
        const r = Zg(q, Ne.racks);
        JSON.stringify(r) === JSON.stringify(q) ? tt("수정할 겹침이 없습니다.") : (Xt(), q = r, tt("겹침을 자동 수정했습니다. 확인 후 배치 저장을 누르세요."));
      } else if (t === "select")
        Ee = { rackId: n };
      else if (t === "select-block")
        Ee = { blockId: e.dataset.id };
      else if (t === "device")
        Ee.deviceId = n;
      else if (t === "place") Xc(n, void 0, void 0, !1);
      else if (t === "view")
        St = e.dataset.view, rt.view(St, Ee), St = rt.mode;
      else if (t === "fit") rt.view(St, Ee);
      else if (t === "front" || t === "rear")
        St = "3d", rt.view(t, Ee);
      else if (t === "save" && Fe() && !Pn(q, Ne.racks).length) {
        Gc(!0);
        const r = await Tn.save(Ft, q);
        Ne = r, q = It(r.layout), Gn = It(q), vs = Ne.racks, Nt = !1, Ht = [], tt("배치를 저장했습니다.");
      } else if (t === "cancel")
        q = It(Gn), Ne.racks = vs, Nt = !1, Ht = [], tt("저장 전 변경을 취소했습니다.");
      else if (t === "reload")
        (!Nt || window.confirm("저장하지 않은 변경을 버리고 다시 불러올까요?")) && await Eo(Ft);
      else if (t === "undo" && Fe() && Ht.length) {
        const r = Ht.pop();
        q = r.layout, Ne.racks = r.racks, Nt = JSON.stringify(q) !== JSON.stringify(Gn);
      } else if (t === "room") {
        const r = Ce("#r3-room-form");
        for (const s of ["name", "width", "depth", "height", "grid"]) r.elements[s].value = q[s];
        r.elements.include_descendants.checked = q.include_descendants, Ce("#r3-room-dialog").showModal();
      } else if (t === "close-room") Ce("#r3-room-dialog").close();
      else if (t === "unplace" && Fe())
        q.placements.find((s) => s.rack_id === Ee.rackId).locked || (Xt(), q.placements = q.placements.filter((s) => s.rack_id !== Ee.rackId));
      else if (t === "add-block" && Fe()) {
        const r = Ce("#r3-object-type").value, s = xr[r];
        if (!s) return;
        const a = crypto.randomUUID(), o = { id: a, type: r, name: s.name, rotation: 0, width: Math.min(s.width, q.width), depth: Math.min(s.depth, q.depth), height: Math.min(s.height, q.height), x: q.width / 2, z: q.depth / 2 }, l = Yl(o);
        if (!l && yi()) {
          tt("빈 공간이 부족하여 오브젝트를 추가하지 않았습니다.", !0);
          return;
        }
        l || (o.x = q.width / 2, o.z = q.depth / 2, tt("빈 공간이 부족합니다. 좌표와 크기를 조정한 뒤 저장하세요.", !0)), Xt(), q.blocks.push(o), Ee = { blockId: a };
      } else if (t === "duplicate-block" && Fe()) {
        const r = q.blocks.find((o) => o.id === Ee.blockId);
        if (!r) return;
        const s = { ...It(r), id: crypto.randomUUID(), name: S_(r.name) }, a = Yl(s, r);
        if (!a && yi()) {
          tt("복사할 빈 공간이 부족하여 배치를 유지했습니다.", !0);
          return;
        }
        a || (s.x = r.x, s.z = r.z, tt("복사할 빈 공간이 부족합니다. 복사본의 좌표를 조정한 뒤 저장하세요.", !0)), Xt(), q.blocks.push(s), Ee = { blockId: s.id };
      } else t === "remove-block" && Fe() ? (Xt(), q.blocks = q.blocks.filter((r) => r.id !== Ee.blockId), Ee = null) : t === "reset-appearance" && Fe() && (Xt(), delete q.appearances[String(Ee.deviceId)]);
    } catch (r) {
      tt(r.message, !0);
    } finally {
      bn = !1, q && (Nt = JSON.stringify(q) !== JSON.stringify(Gn), gt(!1, !["view", "fit", "front", "rear", "room", "close-room"].includes(t)), ["select", "device"].includes(t) && Ee && q.placements.some((r) => r.rack_id === Ee.rackId) && (Mo.trim() && (St = "3d", rt.view("front", Ee), gt(!1, !1)), rt.highlight(Ee)));
    }
});
Tt.addEventListener("click", (i) => {
  const e = i.target.closest("[data-action=find-device]");
  !e || !q || (Ee = { rackId: Number(e.dataset.rackId), deviceId: Number(e.dataset.id) }, q.placements.some((t) => t.rack_id === Ee.rackId) ? (St = "3d", rt.view("front", Ee), gt(), rt.highlight(Ee)) : (gt(), tt("미배치 랙의 장비입니다. 랙을 배치하면 3D 위치로 이동할 수 있습니다.")));
});
Tt.addEventListener("input", (i) => {
  i.target.id === "r3-search" && (Mo = i.target.value, rt.clearFocus(), gt(!1, !1));
});
Tt.addEventListener("change", async (i) => {
  const e = i.target;
  if (e.id === "r3-grid-size") {
    const a = Number(e.value);
    if (!Fe()) {
      gt();
      return;
    }
    if (!e.validity.valid || !Number.isInteger(a) || a < 100 || a > 5e3) {
      tt("격자 한 칸은 100~5000 mm 정수로 입력하세요.", !0), gt();
      return;
    }
    a !== q.grid && (Xt(), q.grid = a, cn(), tt("격자 크기를 적용했습니다. 배치 저장을 누르면 유지됩니다."));
    return;
  }
  if (e.id === "r3-grid-origin") {
    if (!Fe() || !["top-left", "bottom-left", "top-right", "bottom-right"].includes(e.value)) {
      gt();
      return;
    }
    e.value !== (q.grid_origin || "top-left") && (Xt(), q.grid_origin = e.value, cn(), tt("격자 시작 위치를 적용했습니다. 기존 배치 좌표는 유지됩니다."));
    return;
  }
  if (e.id === "r3-status-filter") {
    Lt.statusFilter = e.value, gt();
    return;
  }
  if (e.id === "r3-only-rack-locations") {
    zc = e.checked, bo();
    return;
  }
  if (e.id === "r3-location") {
    !Nt || window.confirm("저장하지 않은 변경을 버리고 Location을 전환할까요?") ? await Eo(Number(e.value)) : e.value = String(Ft);
    return;
  }
  if (e.id === "r3-show-placed") {
    Vc = e.checked, gt();
    return;
  }
  for (const a of Object.keys(Lt)) if (e.id === `r3-${a}`) {
    Lt[a] = e.checked, gt();
    return;
  }
  if (!e.dataset.edit || !Fe()) return;
  const t = e.dataset.key, n = e.dataset.edit;
  let r = e.type === "checkbox" ? e.checked : e.type === "number" || e.tagName === "SELECT" ? e.value === "" ? null : Number(e.value) : e.value;
  if (e.type === "number" && (e.value === "" && n !== "appearance" || e.value !== "" && (!e.validity.valid || !Number.isFinite(r)))) {
    tt("치수와 좌표 범위를 확인하세요.", !0), gt();
    return;
  }
  if (Xt(), n === "block") {
    const a = q.blocks.find((l) => l.id === Ee.blockId), o = Xi(a);
    if (t === "x" || t === "z") a[t] += r - o[t];
    else if (a[t] = r, ["width", "depth", "rotation"].includes(t)) {
      const l = Xi(a);
      a.x += o.x - l.x, a.z += o.z - l.z;
    }
  } else if (n === "appearance") {
    const a = q.appearances[String(Ee.deviceId)] ||= {};
    r == null ? delete a[t] : a[t] = r;
  } else {
    const a = q.placements.find((c) => c.rack_id === Ee.rackId);
    if (a.locked && t !== "locked") return;
    const o = Ne.racks.find((c) => c.id === Ee.rackId), l = Xi({ ...a, ...Ut(o, a) });
    if (n === "dimensions" ? a.dimensions[t] = r : t === "x" || t === "z" ? a[t] += r - l[t] : a[t] = r, n === "dimensions" && ["width", "depth"].includes(t) || n === "placement" && t === "rotation") {
      const c = Xi({ ...a, ...Ut(o, a) });
      a.x += l.x - c.x, a.z += l.z - c.z;
    }
  }
  let s = !1;
  if (yi() && n !== "appearance" && ["x", "z", "width", "depth", "rotation"].includes(t)) {
    const a = Ht.at(-1).layout;
    try {
      const o = vo(a, q, Ne.racks, [n === "block" ? `block:${Ee.blockId}` : `rack:${Ee.rackId}`]);
      s = JSON.stringify(o) !== JSON.stringify(q), q = o, s && tt("겹침을 피하도록 반대쪽 빈 공간으로 밀었습니다.");
    } catch (o) {
      q = a, Ht.pop(), tt(o.message, !0), s = !0;
    }
  }
  n === "appearance" && t === "color" && Tt.querySelectorAll(".r3-face-preview > div").forEach((a) => {
    a.style.background = r;
  }), cn(!s && (e.type === "number" || e.type === "color" || n === "block" && t === "name"));
});
Ce("#r3-room-form").addEventListener("submit", async (i) => {
  if (i.preventDefault(), !Fe()) return;
  const e = i.target, t = It(q);
  if (t.name = e.elements.name.value.trim(), !!t.name) {
    for (const n of ["width", "depth", "height", "grid"]) t[n] = Number(e.elements[n].value);
    t.include_descendants = e.elements.include_descendants.checked;
    try {
      let n = Ne.racks;
      if (t.include_descendants !== q.include_descendants) {
        const r = await Tn.load(Ft, t.include_descendants), s = new Set(r.racks.map((o) => o.id));
        if (t.placements.some((o) => !s.has(o.rack_id))) throw new Error("하위 Location의 배치된 랙을 먼저 배치 해제하세요.");
        const a = new Set(r.racks.flatMap((o) => o.devices.map((l) => String(l.id))));
        if (Object.keys(t.appearances).some((o) => !a.has(o))) throw new Error("하위 Location 장비의 표시 설정을 먼저 초기화하세요.");
        n = r.racks;
      }
      Xt(), Ne.racks = n, q = t, Ce("#r3-room-dialog").close(), cn(), rt.view(St, Ee);
    } catch (n) {
      tt(n.message, !0), Ce("#r3-room-dialog").close();
    }
  }
});
window.addEventListener("beforeunload", (i) => {
  Nt && (i.preventDefault(), i.returnValue = "");
});
async function b_() {
  try {
    if (rt = new x_(Ce("#r3-canvas"), {
      exitWalk: () => {
        St = "3d", rt.view(St, Ee), gt();
      },
      walkError: () => tt("걸어 다닐 빈 공간이 없습니다. 서버실 배치를 확인하세요.", !0),
      multiSelect: (e) => Wn?.toggle(e),
      selectBlock: (e) => {
        Ee = { blockId: e }, gt();
      },
      dragStart: (e) => {
        Ee = e.blockId ? { blockId: e.blockId } : { rackId: e.rackId }, gt(), Ce("[data-action=save]").disabled = !0;
      },
      dragBlock: (e, t, n) => {
        if (!Fe()) return;
        if (yi()) {
          jl(`block:${e}`, t, n);
          return;
        }
        if (Kl(`block:${e}`, t, n)) return;
        const r = q.blocks.find((s) => s.id === e);
        r && (vn ||= { layout: It(q), racks: Ne.racks }, { x: r.x, z: r.z } = Tr(r, t, n), Ee = { blockId: e }, Nt = !0, rt.movePlacement("block", e, r));
      },
      select: (e, t) => {
        Ee = { rackId: e, deviceId: t }, gt();
      },
      drop: Xc,
      drag: (e, t, n) => {
        if (!Fe()) return;
        if (yi()) {
          jl(`rack:${e}`, t, n);
          return;
        }
        if (Kl(`rack:${e}`, t, n)) return;
        const r = q.placements.find((s) => s.rack_id === e);
        r.locked || (vn ||= { layout: It(q), racks: Ne.racks }, { x: r.x, z: r.z } = Tr({ ...r, ...Ut(Ne.racks.find((s) => s.id === e), r) }, t, n), Ee = { rackId: e }, Nt = !0, rt.movePlacement("rack", e, r));
      },
      dragEnd: () => {
        vn && (JSON.stringify(q) !== JSON.stringify(vn.layout) && (Ht.push(vn), Ht.length > 30 && Ht.shift()), vn = null), cn();
      },
      dragCancel: () => {
        vn && (q = vn.layout, vn = null), cn();
      },
      imageError: () => tt("일부 이미지를 불러오지 못해 해당 면을 장비 색상으로 표시합니다.", !0)
    }), Wn = uh(Tt, () => ({
      layout: q,
      racks: Ne?.racks || [],
      locationId: Ft,
      editable: Fe(),
      mark: (e) => rt.markMany(e),
      apply: (e) => {
        if (!Fe()) throw new Error("읽기 전용입니다.");
        JSON.stringify(e) !== JSON.stringify(q) && (Xt(), q = e, cn());
      },
      move: (e, t, n) => yi() ? qc(e, t, n) : io(q, Ne.racks, e, "move", { x: t, z: n }),
      history: () => Tn.history(Ft),
      restore: async (e) => {
        if (!Fe()) throw new Error("읽기 전용입니다.");
        const t = Ft, n = q.revision, r = JSON.stringify(q), s = await Tn.load(t, e.include_descendants);
        if (t !== Ft || r !== JSON.stringify(q)) throw new Error("화면이 변경됐습니다. 이력을 다시 불러오세요.");
        if (!s.can_edit) throw new Error("현재 배치를 편집할 권한이 없습니다.");
        const a = { ...It(e), revision: n }, o = Pn(a, s.racks);
        if (o.length) throw new Error(o.join(" / "));
        return Xt(), q = a, Ne.racks = s.racks, Ee = null, cn(), rt.view(St, Ee), !0;
      }
    })), Hc = jg(Tt, () => ({
      layout: q,
      baseline: Gn,
      racks: Ne?.racks || [],
      locationId: Ft,
      selected: Ee,
      scene: rt,
      editable: Fe(),
      busy: bn,
      canCleanup: !!Ne?.can_cleanup,
      demo: Tn.demo,
      url: mi.find((e) => e.id === Ft)?.url,
      setBusy: Gc,
      view: (e) => {
        St = e, rt.view(St, Ee), gt();
      },
      highlight: (e) => {
        Ee = { rackId: e }, St = "3d", gt(), rt.view("front", Ee);
      },
      apply: (e) => {
        if (!Fe()) throw new Error("읽기 전용입니다.");
        Xt(), q = e, cn();
      },
      revision: (e) => {
        q.revision = e, Gn.revision = e, Ht.forEach((t) => {
          t.layout.revision = e;
        }), cn();
      },
      replace: (e) => {
        Ne = e, q = It(e.layout), Gn = It(q), vs = e.racks, Ee = null, Ht = [], Nt = !1, gt();
      },
      restore: async (e) => {
        if (!Fe()) throw new Error("읽기 전용입니다.");
        const t = Ft, n = q.revision, r = JSON.stringify(q), s = await Tn.load(t, e.include_descendants);
        if (t !== Ft || r !== JSON.stringify(q)) throw new Error("화면이 변경되었습니다. 다시 불러오세요.");
        if (!s.can_edit) throw new Error("현재 배치를 편집할 권한이 없습니다.");
        const a = { ...It(e), revision: n }, o = Pn(a, s.racks);
        if (o.length) throw new Error(o.join(" / "));
        Xt(), q = a, Ne.racks = s.racks, Ee = null, cn(), rt.view(St, Ee);
      }
    })), mi = await Tn.list(), bo(), !mi.length) {
      tt("조회할 수 있는 Location이 없습니다. NetBox의 Location과 권한을 확인하세요.", !0);
      return;
    }
    const i = Number(Tt.dataset.initialLocation || new URLSearchParams(window.location.search).get("location"));
    await Eo(mi.some((e) => e.id === i) ? i : mi.find((e) => e.configured)?.id || mi[0].id);
  } catch (i) {
    tt(`뷰어를 시작할 수 없습니다: ${i.message}`, !0);
  }
}
function qc(i, e, t) {
  if (![e, t].every(Number.isFinite)) throw new Error("이동 거리를 숫자로 입력하세요.");
  const n = It(q);
  for (const r of n.placements) i.includes(`rack:${r.rack_id}`) && (r.x += e, r.z += t);
  for (const r of n.blocks) i.includes(`block:${r.id}`) && (r.x += e, r.z += t);
  return vo(q, n, Ne.racks, i);
}
function jl(i, e, t) {
  const n = Wn?.keys.has(i) ? [...Wn.keys] : [i], [r, s] = i.split(":"), a = r === "rack" ? q.placements.find((c) => String(c.rack_id) === s) : q.blocks.find((c) => c.id === s);
  if (!a) return;
  const o = r === "rack" ? { ...a, ...Ut(Ne.racks.find((c) => c.id === a.rack_id), a) } : a, l = Tr(o, e, t);
  try {
    const c = qc(n, l.x - a.x, l.z - a.z);
    if (JSON.stringify(c) === JSON.stringify(q)) return;
    vn ||= { layout: It(q), racks: Ne.racks }, q = c, Nt = !0;
    for (const h of q.placements) rt.movePlacement("rack", h.rack_id, h);
    for (const h of q.blocks) rt.movePlacement("block", h.id, h);
  } catch (c) {
    tt(c.message, !0);
  }
}
function Kl(i, e, t) {
  if (!Wn || Wn.keys.size < 2 || !Wn.keys.has(i)) return !1;
  const [n, r] = i.split(":"), s = n === "rack" ? q.placements.find((l) => String(l.rack_id) === r) : q.blocks.find((l) => l.id === r), a = n === "rack" ? { ...s, ...Ut(Ne.racks.find((l) => l.id === s.rack_id), s) } : s, o = Tr(a, e, t);
  try {
    const l = io(q, Ne.racks, [...Wn.keys], "move", { x: o.x - s.x, z: o.z - s.z });
    vn ||= { layout: It(q), racks: Ne.racks }, q = l, Nt = !0;
    for (const c of q.placements) rt.movePlacement("rack", c.rack_id, c);
    for (const c of q.blocks) rt.movePlacement("block", c.id, c);
  } catch (l) {
    tt(l.message, !0);
  }
  return !0;
}
b_();
