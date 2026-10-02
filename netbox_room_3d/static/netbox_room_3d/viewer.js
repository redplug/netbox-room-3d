function Fe(i, t) {
  return { width: i.width, depth: i.depth, height: i.height, ...t?.dimensions };
}
function Ee(i) {
  const t = i.rotation === 90 || i.rotation === 270, e = t ? i.depth : i.width, n = t ? i.width : i.depth;
  return [i.x - e / 2, i.z - n / 2, i.x + e / 2, i.z + n / 2];
}
function dr(i, t) {
  return i = Ee(i), t = Ee(t), i[0] < t[2] - 0.01 && i[2] > t[0] + 0.01 && i[1] < t[3] - 0.01 && i[3] > t[1] + 0.01;
}
function pr(i, t) {
  if (!t?.enabled || i.rack_id == null) return i;
  const e = t.front || 0, n = t.rear || 0, r = (e - n) / 2, s = i.rotation || 0;
  return {
    ...i,
    depth: i.depth + e + n,
    x: i.x + (s === 90 ? -r : s === 270 ? r : 0),
    z: i.z + (s === 0 ? r : s === 180 ? -r : 0)
  };
}
function $a(i, t, e) {
  return [[i, t], [pr(i, e), t], [i, pr(t, e)]];
}
function Rn(i, t) {
  const e = [], n = [];
  for (const r of i.placements) {
    const s = t.find((o) => o.id === r.rack_id);
    if (!s) {
      e.push("배치된 랙을 찾을 수 없습니다. 다시 불러오세요.");
      continue;
    }
    const a = Fe(s, r);
    a.height < s.u_height * 44.45 + 80 && e.push(`${s.name}: 높이가 U 공간보다 작습니다.`), n.push({ ...r, ...a, name: s.name });
  }
  n.push(...i.blocks);
  for (const r of ["width", "depth", "height", "grid"])
    (!Number.isFinite(i[r]) || i[r] <= 0) && e.push("서버실 크기와 격자를 확인하세요.");
  n.forEach((r, s) => {
    const a = Ee(r);
    if (![r.x, r.z, r.width, r.depth, r.height].every(Number.isFinite) || r.width <= 0 || r.depth <= 0 || r.height <= 0 ? e.push(`${r.name}: 치수가 올바르지 않습니다.`) : (a[0] < 0 || a[1] < 0 || a[2] > i.width || a[3] > i.depth || r.height > i.height) && e.push(`${r.name}: 서버실 경계를 벗어납니다.`), n.slice(0, s).forEach((o) => {
      dr(r, o) && e.push(`${r.name} / ${o.name}: 서로 겹칩니다.`);
    }), i.clearance?.enabled) {
      const o = Ee(pr(r, i.clearance));
      (o[0] < 0 || o[1] < 0 || o[2] > i.width || o[3] > i.depth) && e.push(`${r.name}: 벽까지 작업 공간이 부족합니다.`), n.slice(0, s).forEach((l) => {
        !dr(r, l) && $a(r, l, i.clearance).some(([c, h]) => dr(c, h)) && e.push(`${r.name} / ${l.name}: 통로·작업 공간이 부족합니다.`);
      });
    }
  });
  for (const r of i.zones || []) {
    (![r.x, r.z, r.width, r.depth].every(Number.isFinite) || r.width < 100 || r.depth < 100 || !/^#[0-9a-fA-F]{6}$/.test(r.color) || !r.name?.trim() || r.name.length > 100) && e.push("구역의 이름·치수·색상을 확인하세요.");
    const s = Ee(r);
    (s[0] < 0 || s[1] < 0 || s[2] > i.width || s[3] > i.depth) && e.push(`${r.name}: 구역이 방 경계를 벗어납니다.`);
  }
  return (i.zones || []).length > 100 && e.push("구역은 최대 100개입니다."), e;
}
function qa(i, t) {
  if (t.position == null || t.u_height <= 0) return null;
  const e = t.position - i.starting_unit;
  return e < 0 || e + t.u_height > i.u_height ? null : (i.desc_units ? i.u_height - e - t.u_height : e) * 44.45;
}
function Vc(i, t, e = !0, n = 0) {
  return e ? n + Math.round((i - n) / t) * t : Math.round(i);
}
function Ya(i) {
  if (!i) return "";
  try {
    const t = new URL(i, window.location.href);
    return ["http:", "https:"].includes(t.protocol) ? t.href : "";
  } catch {
    return "";
  }
}
function ea(i) {
  const t = /* @__PURE__ */ new Set();
  for (const e of i.devices) {
    const n = qa(i, e);
    if (n != null)
      for (let r = Math.floor(n / 44.45 + 1e-8); r < Math.ceil(n / 44.45 + e.u_height - 1e-8); r++) t.add(r);
  }
  return {
    occupied: t,
    used: t.size,
    free: i.u_height - t.size,
    percent: Math.round(t.size / i.u_height * 100),
    count: i.devices.length
  };
}
function Eo(i, t, e = "") {
  const n = t.trim().toLowerCase();
  return (!e || i.status === e) && (!n || [i.name, ...i.ip_addresses || [], ...i.primary_ips || []].some((r) => r.toLowerCase().includes(n)));
}
function bo(i, t) {
  const e = [.../* @__PURE__ */ new Set([...i.primary_ips || [], ...i.ip_addresses || []])], n = e.filter((r) => r.toLowerCase().includes(t.trim().toLowerCase()));
  return { ips: n.length ? n : e, matched: !!t.trim() && n.length > 0 };
}
const Gc = (i) => ({ active: "#16a34a", planned: "#3b82f6", staged: "#a855f7", offline: "#64748b", failed: "#dc2626", inventory: "#d97706", decommissioning: "#ea580c" })[i] || "#64748b", Wc = (i) => i >= 90 ? "#dc2626" : i >= 70 ? "#d97706" : "#0d9488", mr = {
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
function To(i = !1) {
  const t = Array.from({ length: i ? 8 : 12 }, (e, n) => `<rect x="${28 + n * 34}" y="${i ? 22 : 16}" width="26" height="${i ? 24 : 37}" rx="2" fill="${i ? "#0e7490" : "#26374a"}" stroke="#566679"/><circle cx="${32 + n * 34}" cy="${i ? 27 : 45}" r="2" fill="#5eead4"/>`).join("");
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="70"><rect width="480" height="70" rx="4" fill="#a8b2c0"/><rect x="8" y="7" width="464" height="56" fill="#111c2b"/>${t}<text x="445" y="40" fill="#dbeafe" font-size="9" font-family="sans-serif" text-anchor="middle">${i ? "REAR" : "FRONT"}</text></svg>`)}`;
}
function Xc(i = 1) {
  const t = Array.from({ length: i === 1 ? 8 : 4 }, (e, n) => ({
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
      front_image: s === 2 || s === 3 ? To() : null,
      rear_image: s === 2 ? To(!0) : null,
      images: [],
      url: "",
      interfaces: s >= 2 ? [{ id: s * 2, name: "eth0" }, { id: s * 2 + 1, name: "eth1" }] : [],
      primary_ips: s >= 2 ? [`192.0.2.${10 + s}/24`] : []
    }))
  }));
  return {
    can_edit: !0,
    warning: "",
    racks: t,
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
      placements: t.slice(0, i === 1 ? 4 : 2).map((e, n) => ({ rack_id: e.id, x: 2400 + n * 1200, z: 3e3, rotation: 0, locked: !1, dimensions: {} })),
      blocks: [{ id: "pillar1", name: "기둥", x: 9e3, z: 6e3, width: 600, depth: 600, height: 3e3 }]
    }
  };
}
class $c {
  constructor(t) {
    this.demo = t.dataset.demo === "true", this.url = t.dataset.api, this.locations = [];
  }
  async request(t, e = {}) {
    const n = document.querySelector("[name=csrfmiddlewaretoken]")?.value || window.CSRF_TOKEN || "", r = await fetch(t, {
      credentials: "same-origin",
      ...e,
      headers: { "Content-Type": "application/json", "X-CSRFToken": n, ...e.headers }
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
  async load(t, e) {
    if (this.demo) {
      const r = Xc(t), s = localStorage.getItem(`room3d-demo-v1-${t}`);
      return s && (r.layout = JSON.parse(s)), r;
    }
    const n = new URL(this.locations.find((r) => r.id === t).url, window.location.href);
    return e !== void 0 && n.searchParams.set("descendants", e), this.request(n);
  }
  async save(t, e) {
    if (this.demo) {
      const n = await this.load(t);
      if (n.layout.revision !== e.revision) throw new Error("다른 탭에서 먼저 저장했습니다. 다시 불러오세요.");
      const r = structuredClone(e);
      r.revision++;
      const s = `room3d-history-${t}`, a = JSON.parse(localStorage.getItem(s) || "[]");
      return a.unshift({ saved_at: (/* @__PURE__ */ new Date()).toISOString(), layout: n.layout }), localStorage.setItem(s, JSON.stringify(a.slice(0, 20))), localStorage.setItem(`room3d-demo-v1-${t}`, JSON.stringify(r)), { ...n, layout: r };
    }
    return this.request(this.locations.find((n) => n.id === t).url, { method: "PUT", body: JSON.stringify(e) });
  }
  async history(t) {
    return this.demo ? { history: JSON.parse(localStorage.getItem(`room3d-history-${t}`) || "[]") } : this.request(`${this.locations.find((e) => e.id === t).url}history/`);
  }
}
function Cn(i, t) {
  const e = new Map(t.map((n) => [n.id, n]));
  return [...i.placements.flatMap((n) => {
    const r = e.get(n.rack_id);
    return r ? [{ ...n, ...Fe(r, n), key: `rack:${r.id}`, name: r.name, kind: "rack" }] : [];
  }), ...i.blocks.map((n) => ({ ...n, key: `block:${n.id}`, kind: "block" }))];
}
function Gl(i, t) {
  const e = Rn(i, t);
  if (i.blocks.length > 200 && e.unshift("룸 오브젝트는 최대 200개입니다."), e.length) throw new Error(e.slice(0, 3).join(" / "));
  return i;
}
function ja(i, t, e, n, r = {}) {
  const s = structuredClone(i), a = Cn(s, t).filter((l) => e.includes(l.key));
  if (!a.length) throw new Error("배치 대상을 선택하세요.");
  if (a.some((l) => l.locked)) throw new Error("잠긴 랙을 선택에서 제외하거나 잠금을 해제하세요.");
  const o = (l, c, h) => {
    const d = l.kind === "rack" ? s.placements.find((f) => f.rack_id === l.rack_id) : s.blocks.find((f) => f.id === l.id);
    Object.assign(d, { x: c, z: h });
  };
  if (n === "move") {
    if (![r.x, r.z].every(Number.isFinite)) throw new Error("이동 거리를 숫자로 입력하세요.");
    a.forEach((l) => o(l, l.x + r.x, l.z + r.z));
  } else if (n === "align") {
    if (a.length < 2) throw new Error("두 개 이상 선택하세요.");
    const l = a.map(Ee), c = { left: 0, top: 1, right: 2, bottom: 3 }[r.edge];
    if (c === void 0) throw new Error("정렬 방향을 선택하세요.");
    const h = (c < 2 ? Math.min : Math.max)(...l.map((d) => d[c]));
    a.forEach((d, f) => o(d, d.x + (c % 2 === 0 ? h - l[f][c] : 0), d.z + (c % 2 ? h - l[f][c] : 0)));
  } else if (n === "space") {
    if (a.length < 2 || !Number.isFinite(r.gap) || r.gap < 0) throw new Error("두 개 이상 선택하고 0 이상의 간격을 입력하세요.");
    const l = r.axis === "z" ? 1 : 0;
    a.sort((h, d) => Ee(h)[l] - Ee(d)[l]);
    let c = Ee(a[0])[l];
    a.forEach((h) => {
      const d = Ee(h), f = c - d[l];
      o(h, h.x + (l === 0 ? f : 0), h.z + (l === 1 ? f : 0)), c += d[l + 2] - d[l] + r.gap;
    });
  } else throw new Error("지원하지 않는 작업입니다.");
  return Gl(s, t);
}
function qc(i, t, e, n, r, s) {
  const a = Cn(i, t).find((p) => p.key === e && p.kind === "block");
  if (!a) throw new Error("룸 오브젝트 한 개를 선택하세요.");
  if (!Number.isInteger(n) || n < 1 || n > 199 || !Number.isFinite(s) || s < 0) throw new Error("복사 개수는 1~199, 간격은 0 이상이어야 합니다.");
  const o = structuredClone(i), l = Ee(a), c = new Set(o.blocks.map((p) => p.name)), h = ["up", "down"].includes(r) ? "z" : "x", d = ["up", "left"].includes(r) ? -1 : 1, f = (h === "x" ? l[2] - l[0] : l[3] - l[1]) + s;
  for (let p = 1; p <= n; p++) {
    let g = 1, _;
    do {
      const u = ` 복사본 ${g++}`;
      _ = a.name.slice(0, 100 - u.length) + u;
    } while (c.has(_));
    c.add(_);
    const m = structuredClone(i.blocks.find((u) => u.id === a.id));
    Object.assign(m, { id: crypto.randomUUID(), name: _, [h]: a[h] + d * f * p }), o.blocks.push(m);
  }
  return Gl(o, t);
}
function Yc(i, t, e) {
  const n = new Map(Cn(i, t).map((h) => [h.key, h])), r = e.map((h) => n.get(h)).filter(Boolean);
  if (!r.length) return null;
  const s = Ee(r[0]), a = { left: s[0], top: s[1], right: i.width - s[2], bottom: i.depth - s[3] };
  if (r.length !== 2) return { walls: a };
  const o = Ee(r[1]), l = Math.max(0, s[0] - o[2], o[0] - s[2]), c = Math.max(0, s[1] - o[3], o[1] - s[3]);
  return { walls: a, x: l, z: c, distance: Math.hypot(l, c) };
}
function jc(i, t) {
  const e = document.createElement("canvas");
  e.width = 2400, e.height = 1700;
  const n = e.getContext("2d"), r = Math.min(2160 / i.width, 1320 / i.depth), s = 120, a = 190;
  n.fillStyle = "#fff", n.fillRect(0, 0, e.width, e.height), n.fillStyle = "#172b3a", n.font = "bold 34px sans-serif", n.fillText(i.name, 100, 65), n.font = "22px sans-serif", n.fillText(`${i.width} × ${i.depth} mm | revision ${i.revision} | ${(/* @__PURE__ */ new Date()).toLocaleString()}`, 100, 108), n.fillText("좌상 원점 / mm · FRONT = 랙 전면 · 현재 화면의 미저장 배치 포함", 100, 145), n.strokeStyle = "#dce6e9", n.lineWidth = 1;
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
  for (const c of Cn(i, t)) {
    const h = Ee(c), d = s + h[0] * r, f = a + h[1] * r, p = (h[2] - h[0]) * r, g = (h[3] - h[1]) * r;
    if (n.fillStyle = c.kind === "rack" ? "#e2f2ef" : "#e9edf1", n.fillRect(d, f, p, g), n.strokeStyle = "#446473", n.lineWidth = 2, n.strokeRect(d, f, p, g), n.save(), n.beginPath(), n.rect(d + 2, f + 2, Math.max(1, p - 4), Math.max(1, g - 4)), n.clip(), n.fillStyle = "#172b3a", n.textAlign = "center", n.font = "bold 18px sans-serif", n.fillText(c.name, d + p / 2, f + g / 2 - 5, Math.max(1, p - 8)), n.font = "14px sans-serif", n.fillText(`${h[2] - h[0]} × ${h[3] - h[1]}`, d + p / 2, f + g / 2 + 16, Math.max(1, p - 8)), n.restore(), c.kind === "rack") {
      n.save(), n.translate(s + c.x * r, a + c.z * r), n.rotate((c.rotation || 0) * Math.PI / 180), n.fillStyle = "#087f78";
      const _ = c.depth * r / 2;
      n.beginPath(), n.moveTo(-8, _ - 12), n.lineTo(8, _ - 12), n.lineTo(0, _), n.fill(), n.restore();
    }
  }
  return n.textAlign = "left", n.fillStyle = "#647786", n.font = "20px sans-serif", n.fillText("Room 3D | FRONT: 녹색 삼각형 방향 | 도면은 축척에 맞춰 출력되며 글자는 이미지로 포함됩니다.", 100, 1650), e;
}
function Kc(i) {
  const t = atob(i.toDataURL("image/jpeg", 0.95).split(",")[1]), e = Uint8Array.from(t, (d) => d.charCodeAt(0)), n = new TextEncoder(), r = [], s = [0];
  let a = 0;
  const o = (d) => {
    const f = typeof d == "string" ? n.encode(d) : d;
    r.push(f), a += f.length;
  };
  o(`%PDF-1.4
`);
  const l = (d, f) => {
    s[d] = a, o(`${d} 0 obj
${f}
endobj
`);
  };
  l(1, "<< /Type /Catalog /Pages 2 0 R >>"), l(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>"), l(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 596] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>"), s[4] = a, o(`4 0 obj
<< /Type /XObject /Subtype /Image /Width ${i.width} /Height ${i.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${e.length} >>
stream
`), o(e), o(`
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
async function Zc(i, t, e) {
  await document.fonts.ready;
  const n = jc(i, t), r = e === "pdf" ? Kc(n) : await new Promise((o) => n.toBlob(o, "image/png")), s = URL.createObjectURL(r), a = document.createElement("a");
  a.href = s, a.download = `room3d-${i.name.replace(/[\\/:*?"<>|]/g, "_")}.${e}`, a.click(), setTimeout(() => URL.revokeObjectURL(s), 1e3);
}
const wr = (i) => String(i ?? "").replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]);
function Jc(i, t) {
  const e = /* @__PURE__ */ new Set();
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
    const f = l(d);
    if (!f.trim() || !Number.isFinite(Number(f))) throw new Error("숫자를 입력하세요.");
    return Number(f);
  };
  function h() {
    const d = t();
    if (!d.layout) {
      a.disabled = !0;
      return;
    }
    a.disabled = !1, r !== d.locationId && (r = d.locationId, e.clear(), n = [], o("#r3-history-list").replaceChildren());
    const f = Cn(d.layout, d.racks), p = new Set(f.map((m) => m.key));
    for (const m of e) p.has(m) || e.delete(m);
    o("#r3-pick-list").innerHTML = f.map((m) => `<label class="r3-check"><input type="checkbox" data-pick="${wr(m.key)}" ${e.has(m.key) ? "checked" : ""}>${wr(m.name)}${m.locked ? " (잠금)" : ""}</label>`).join(""), o("#r3-picked-count").textContent = `${e.size}개`, s.querySelectorAll("[data-write]").forEach((m) => m.disabled = !d.editable);
    const g = Yc(d.layout, d.racks, [...e]), _ = (m) => `${Math.round(m).toLocaleString()} mm`;
    o("#r3-measure").textContent = g ? `첫 선택 대상의 벽까지: 좌 ${_(g.walls.left)}, 상 ${_(g.walls.top)}, 우 ${_(g.walls.right)}, 하 ${_(g.walls.bottom)}${g.distance !== void 0 ? ` / 대상 사이: ${_(g.distance)} (X ${_(g.x)}, Z ${_(g.z)})` : ""}` : "하나 선택: 벽까지 거리 / 둘 선택: 가장자리 사이 최단 거리", d.mark([...e]);
  }
  return a.onclick = () => {
    h(), s.showModal();
  }, s.addEventListener("change", (d) => {
    if (d.target.dataset.pick) {
      const f = d.target.dataset.pick;
      d.target.checked ? e.add(f) : e.delete(f), h();
    }
  }), s.addEventListener("click", async (d) => {
    const f = d.target.closest("[data-tool]");
    if (!f || f.disabled) return;
    const p = t(), g = f.dataset.tool, _ = [...e];
    try {
      if (o("#r3-tool-status").textContent = "", g === "close") {
        s.close();
        return;
      }
      if (g === "all") Cn(p.layout, p.racks).forEach((m) => e.add(m.key));
      else if (g === "none") e.clear();
      else if (g === "move") p.apply(p.move(_, c("dx"), c("dz")));
      else if (["align", "space"].includes(g)) p.apply(ja(p.layout, p.racks, _, g, { edge: l("align"), axis: l("axis"), gap: c("gap") }));
      else if (g === "repeat") {
        if (e.size !== 1) throw new Error("룸 오브젝트 하나만 선택하세요.");
        p.apply(qc(p.layout, p.racks, _[0], c("repeat-count"), l("repeat-direction"), c("gap")));
      } else if (g === "png" || g === "pdf") await Zc(p.layout, p.racks, g);
      else if (g === "history") {
        const m = (await p.history()).history;
        if (t().locationId !== p.locationId) return;
        n = m, o("#r3-history-list").innerHTML = n.length ? n.map((u, T) => `<div class="r3-history-row"><span>r${u.layout.revision} · ${wr(u.saved_at)}<small>${wr(u.layout.name)} · 랙 ${u.layout.placements.length} / 오브젝트 ${u.layout.blocks.length}</small></span><button class="r3-btn small" data-tool="restore" data-index="${T}" data-write ${p.editable ? "" : "disabled"}>불러오기</button></div>`).join("") : "<p>저장 이력이 없습니다. 업데이트 이후 저장부터 기록됩니다.</p>";
      } else if (g === "restore") {
        const m = n[Number(f.dataset.index)];
        if (!m || !window.confirm("현재 편집 내용을 이 배치로 바꿀까요? 되돌리기로 취소할 수 있습니다.") || !await p.restore(m.layout)) return;
        o("#r3-tool-status").textContent = "배치를 불러왔습니다. 화면을 검토한 뒤 배치 저장으로 확정하세요.";
      }
      h(), ["move", "align", "space", "repeat"].includes(g) && (o("#r3-tool-status").textContent = "적용했습니다. 닫기 후 화면을 확인하고 배치 저장을 누르세요.");
    } catch (m) {
      o("#r3-tool-status").textContent = m.message;
    }
  }), { refresh: h, keys: e, toggle(d) {
    const f = d.blockId ? `block:${d.blockId}` : `rack:${d.rackId}`;
    e.has(f) ? e.delete(f) : e.add(f), h();
  } };
}
function Qc(i, t, e, n) {
  const r = structuredClone(i), s = new Set(i.placements.map((m) => m.rack_id));
  if (!e.length || new Set(e).size !== e.length || e.some((m) => s.has(m) || !t.some((u) => u.id === m))) throw new Error("미배치 랙을 선택하세요.");
  const { x: a, z: o, columns: l, gapX: c, gapZ: h, rotation: d } = n;
  if (![a, o, c, h].every((m) => Number.isFinite(m) && m >= 0) || !Number.isInteger(l) || l < 1 || ![0, 90, 180, 270].includes(d)) throw new Error("시작 좌표·열 개수·간격·방향을 확인하세요.");
  let f = a, p = o, g = 0;
  e.forEach((m, u) => {
    u && u % l === 0 && (f = a, p += g + h, g = 0);
    const T = t.find((R) => R.id === m), b = d === 90 || d === 270, y = b ? T.depth : T.width, w = b ? T.width : T.depth;
    r.placements.push({ rack_id: m, x: f + y / 2, z: p + w / 2, rotation: d, locked: !1, dimensions: {} }), f += y + c, g = Math.max(g, w);
  });
  const _ = Rn(r, t);
  if (_.length) throw new Error(_.slice(0, 3).join(" / "));
  return r;
}
function wo(i, t, e) {
  const n = (o) => [...Cn(o, e), ...(o.zones || []).map((l) => ({ ...l, key: `zone:${l.id}`, kind: "zone", height: 10 }))], r = new Map(n(i).map((o) => [o.key, o])), s = new Map(n(t).map((o) => [o.key, o])), a = [];
  for (const o of /* @__PURE__ */ new Set([...r.keys(), ...s.keys()])) {
    const l = r.get(o), c = s.get(o);
    if (!l) a.push({ key: o, name: c.name, type: "added", current: c });
    else if (!c) a.push({ key: o, name: l.name, type: "removed", old: l });
    else {
      const h = ["x", "z", "rotation", "width", "depth", "height", "locked", "name", "color"].filter((d) => JSON.stringify(l[d]) !== JSON.stringify(c[d]));
      h.length && a.push({ key: o, name: c.name, type: "changed", old: l, current: c, fields: h });
    }
  }
  for (const o of ["name", "width", "depth", "height", "grid", "grid_origin", "include_descendants", "clearance", "appearances"])
    JSON.stringify(i[o] ?? null) !== JSON.stringify(t[o] ?? null) && a.push({ key: `setting:${o}`, name: o, type: "setting" });
  return a;
}
function Ar(i) {
  return i && ["top", "3d"].includes(i.mode) && ["position", "target"].every((t) => Array.isArray(i[t]) && i[t].length === 3 && i[t].every((e) => Number.isFinite(e) && Math.abs(e) <= 1e3)) && i.position[1] > 0 && Math.hypot(...i.position.map((t, e) => t - i.target[e])) > 0.01;
}
async function th(i, t, e, n = "") {
  if (i.demo) {
    if (t === "cables") return { cables: [], demo: !0 };
    if (t === "cleanup") throw new Error("참조 정리는 NetBox 관리자 화면에서만 사용할 수 있습니다.");
    const o = `room3d-plans-v1-${i.locationId}`;
    let l = JSON.parse(localStorage.getItem(o) || "[]");
    if (e) {
      const c = String(e.name || "").trim();
      if (["create", "rename"].includes(e.action)) {
        if (!c || c.length > 100) throw new Error("이름은 1~100자여야 합니다.");
        if (l.some((h) => h.name === c && h.id !== e.id)) throw new Error("같은 이름의 배치안이 있습니다.");
      }
      if (e.action === "create") {
        if (l.length >= 10) throw new Error("배치안은 최대 10개입니다.");
        l.push({ id: crypto.randomUUID(), name: c, layout: structuredClone(e.layout), valid: !0, saved_at: (/* @__PURE__ */ new Date()).toISOString() });
      } else e.action === "rename" ? l = l.map((h) => h.id === e.id ? { ...h, name: c } : h) : e.action === "delete" && (l = l.filter((h) => h.id !== e.id));
      localStorage.setItem(o, JSON.stringify(l));
    }
    return { plans: l, revision: i.layout.revision };
  }
  if (!i.url) throw new Error("Location 주소가 없습니다.");
  const r = document.querySelector("[name=csrfmiddlewaretoken]")?.value || window.CSRF_TOKEN || "", s = await fetch(`${i.url.replace(/\/$/, "")}/${t}/${n}`, {
    method: e ? "POST" : "GET",
    credentials: "same-origin",
    headers: e ? { "Content-Type": "application/json", "X-CSRFToken": r } : {},
    body: e ? JSON.stringify(e) : void 0
  }), a = await s.json().catch(() => ({}));
  if (!s.ok) throw new Error(a.error || `요청 실패 (${s.status})`);
  return a;
}
const Ka = "180", Gi = { ROTATE: 0, DOLLY: 1, PAN: 2 }, zi = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 }, eh = 0, Ao = 1, nh = 2, Wl = 1, ih = 2, kn = 3, ti = 0, Ke = 1, ln = 2, Zn = 0, Wi = 1, Ro = 2, Co = 3, Po = 4, rh = 5, ui = 100, sh = 101, ah = 102, oh = 103, lh = 104, ch = 200, hh = 201, dh = 202, uh = 203, na = 204, ia = 205, fh = 206, ph = 207, mh = 208, gh = 209, _h = 210, vh = 211, xh = 212, Mh = 213, Sh = 214, ra = 0, sa = 1, aa = 2, Yi = 3, oa = 4, la = 5, ca = 6, ha = 7, Xl = 0, yh = 1, Eh = 2, Jn = 0, bh = 1, Th = 2, wh = 3, Ah = 4, Rh = 5, Ch = 6, Ph = 7, $l = 300, ji = 301, Ki = 302, da = 303, ua = 304, fs = 306, fa = 1e3, pi = 1001, pa = 1002, vn = 1003, Dh = 1004, Rr = 1005, bn = 1006, Ms = 1007, mi = 1008, Pn = 1009, ql = 1010, Yl = 1011, gr = 1012, Za = 1013, _i = 1014, zn = 1015, Er = 1016, Ja = 1017, Qa = 1018, _r = 1020, jl = 35902, Kl = 35899, Zl = 1021, Jl = 1022, _n = 1023, vr = 1026, xr = 1027, Ql = 1028, to = 1029, tc = 1030, eo = 1031, no = 1033, es = 33776, ns = 33777, is = 33778, rs = 33779, ma = 35840, ga = 35841, _a = 35842, va = 35843, xa = 36196, Ma = 37492, Sa = 37496, ya = 37808, Ea = 37809, ba = 37810, Ta = 37811, wa = 37812, Aa = 37813, Ra = 37814, Ca = 37815, Pa = 37816, Da = 37817, La = 37818, Ia = 37819, Ua = 37820, Na = 37821, Fa = 36492, Oa = 36494, ka = 36495, Ba = 36283, za = 36284, Ha = 36285, Va = 36286, Lh = 3200, Ih = 3201, ec = 0, Uh = 1, Kn = "", je = "srgb", Zi = "srgb-linear", as = "linear", ee = "srgb", bi = 7680, Do = 519, Nh = 512, Fh = 513, Oh = 514, nc = 515, kh = 516, Bh = 517, zh = 518, Hh = 519, Lo = 35044, Io = "300 es", Tn = 2e3, os = 2001;
class yi {
  /**
   * Adds the given event listener to the given event type.
   *
   * @param {string} type - The type of event to listen to.
   * @param {Function} listener - The function that gets called when the event is fired.
   */
  addEventListener(t, e) {
    this._listeners === void 0 && (this._listeners = {});
    const n = this._listeners;
    n[t] === void 0 && (n[t] = []), n[t].indexOf(e) === -1 && n[t].push(e);
  }
  /**
   * Returns `true` if the given event listener has been added to the given event type.
   *
   * @param {string} type - The type of event.
   * @param {Function} listener - The listener to check.
   * @return {boolean} Whether the given event listener has been added to the given event type.
   */
  hasEventListener(t, e) {
    const n = this._listeners;
    return n === void 0 ? !1 : n[t] !== void 0 && n[t].indexOf(e) !== -1;
  }
  /**
   * Removes the given event listener from the given event type.
   *
   * @param {string} type - The type of event.
   * @param {Function} listener - The listener to remove.
   */
  removeEventListener(t, e) {
    const n = this._listeners;
    if (n === void 0) return;
    const r = n[t];
    if (r !== void 0) {
      const s = r.indexOf(e);
      s !== -1 && r.splice(s, 1);
    }
  }
  /**
   * Dispatches an event object.
   *
   * @param {Object} event - The event that gets fired.
   */
  dispatchEvent(t) {
    const e = this._listeners;
    if (e === void 0) return;
    const n = e[t.type];
    if (n !== void 0) {
      t.target = this;
      const r = n.slice(0);
      for (let s = 0, a = r.length; s < a; s++)
        r[s].call(this, t);
      t.target = null;
    }
  }
}
const ke = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
let Uo = 1234567;
const Xi = Math.PI / 180, Mr = 180 / Math.PI;
function Qi() {
  const i = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
  return (ke[i & 255] + ke[i >> 8 & 255] + ke[i >> 16 & 255] + ke[i >> 24 & 255] + "-" + ke[t & 255] + ke[t >> 8 & 255] + "-" + ke[t >> 16 & 15 | 64] + ke[t >> 24 & 255] + "-" + ke[e & 63 | 128] + ke[e >> 8 & 255] + "-" + ke[e >> 16 & 255] + ke[e >> 24 & 255] + ke[n & 255] + ke[n >> 8 & 255] + ke[n >> 16 & 255] + ke[n >> 24 & 255]).toLowerCase();
}
function Gt(i, t, e) {
  return Math.max(t, Math.min(e, i));
}
function io(i, t) {
  return (i % t + t) % t;
}
function Vh(i, t, e, n, r) {
  return n + (i - t) * (r - n) / (e - t);
}
function Gh(i, t, e) {
  return i !== t ? (e - i) / (t - i) : 0;
}
function ur(i, t, e) {
  return (1 - e) * i + e * t;
}
function Wh(i, t, e, n) {
  return ur(i, t, 1 - Math.exp(-e * n));
}
function Xh(i, t = 1) {
  return t - Math.abs(io(i, t * 2) - t);
}
function $h(i, t, e) {
  return i <= t ? 0 : i >= e ? 1 : (i = (i - t) / (e - t), i * i * (3 - 2 * i));
}
function qh(i, t, e) {
  return i <= t ? 0 : i >= e ? 1 : (i = (i - t) / (e - t), i * i * i * (i * (i * 6 - 15) + 10));
}
function Yh(i, t) {
  return i + Math.floor(Math.random() * (t - i + 1));
}
function jh(i, t) {
  return i + Math.random() * (t - i);
}
function Kh(i) {
  return i * (0.5 - Math.random());
}
function Zh(i) {
  i !== void 0 && (Uo = i);
  let t = Uo += 1831565813;
  return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function Jh(i) {
  return i * Xi;
}
function Qh(i) {
  return i * Mr;
}
function td(i) {
  return (i & i - 1) === 0 && i !== 0;
}
function ed(i) {
  return Math.pow(2, Math.ceil(Math.log(i) / Math.LN2));
}
function nd(i) {
  return Math.pow(2, Math.floor(Math.log(i) / Math.LN2));
}
function id(i, t, e, n, r) {
  const s = Math.cos, a = Math.sin, o = s(e / 2), l = a(e / 2), c = s((t + n) / 2), h = a((t + n) / 2), d = s((t - n) / 2), f = a((t - n) / 2), p = s((n - t) / 2), g = a((n - t) / 2);
  switch (r) {
    case "XYX":
      i.set(o * h, l * d, l * f, o * c);
      break;
    case "YZY":
      i.set(l * f, o * h, l * d, o * c);
      break;
    case "ZXZ":
      i.set(l * d, l * f, o * h, o * c);
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
function Bi(i, t) {
  switch (t.constructor) {
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
function Ve(i, t) {
  switch (t.constructor) {
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
const ic = {
  DEG2RAD: Xi,
  RAD2DEG: Mr,
  /**
   * Generate a [UUID]{@link https://en.wikipedia.org/wiki/Universally_unique_identifier}
   * (universally unique identifier).
   *
   * @static
   * @method
   * @return {string} The UUID.
   */
  generateUUID: Qi,
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
  clamp: Gt,
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
  euclideanModulo: io,
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
  mapLinear: Vh,
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
  inverseLerp: Gh,
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
  lerp: ur,
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
  damp: Wh,
  /**
   * Returns a value that alternates between `0` and the given `length` parameter.
   *
   * @static
   * @method
   * @param {number} x - The value to pingpong.
   * @param {number} [length=1] - The positive value the function will pingpong to.
   * @return {number} The alternated value.
   */
  pingpong: Xh,
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
  smoothstep: $h,
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
  smootherstep: qh,
  /**
   * Returns a random integer from `<low, high>` interval.
   *
   * @static
   * @method
   * @param {number} low - The lower value boundary.
   * @param {number} high - The upper value boundary
   * @return {number} A random integer.
   */
  randInt: Yh,
  /**
   * Returns a random float from `<low, high>` interval.
   *
   * @static
   * @method
   * @param {number} low - The lower value boundary.
   * @param {number} high - The upper value boundary
   * @return {number} A random float.
   */
  randFloat: jh,
  /**
   * Returns a random integer from `<-range/2, range/2>` interval.
   *
   * @static
   * @method
   * @param {number} range - Defines the value range.
   * @return {number} A random float.
   */
  randFloatSpread: Kh,
  /**
   * Returns a deterministic pseudo-random float in the interval `[0, 1]`.
   *
   * @static
   * @method
   * @param {number} [s] - The integer seed.
   * @return {number} A random float.
   */
  seededRandom: Zh,
  /**
   * Converts degrees to radians.
   *
   * @static
   * @method
   * @param {number} degrees - A value in degrees.
   * @return {number} The converted value in radians.
   */
  degToRad: Jh,
  /**
   * Converts radians to degrees.
   *
   * @static
   * @method
   * @param {number} radians - A value in radians.
   * @return {number} The converted value in degrees.
   */
  radToDeg: Qh,
  /**
   * Returns `true` if the given number is a power of two.
   *
   * @static
   * @method
   * @param {number} value - The value to check.
   * @return {boolean} Whether the given number is a power of two or not.
   */
  isPowerOfTwo: td,
  /**
   * Returns the smallest power of two that is greater than or equal to the given number.
   *
   * @static
   * @method
   * @param {number} value - The value to find a POT for.
   * @return {number} The smallest power of two that is greater than or equal to the given number.
   */
  ceilPowerOfTwo: ed,
  /**
   * Returns the largest power of two that is less than or equal to the given number.
   *
   * @static
   * @method
   * @param {number} value - The value to find a POT for.
   * @return {number} The largest power of two that is less than or equal to the given number.
   */
  floorPowerOfTwo: nd,
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
  setQuaternionFromProperEuler: id,
  /**
   * Normalizes the given value according to the given typed array.
   *
   * @static
   * @method
   * @param {number} value - The float value in the range `[0,1]` to normalize.
   * @param {TypedArray} array - The typed array that defines the data type of the value.
   * @return {number} The normalize value.
   */
  normalize: Ve,
  /**
   * Denormalizes the given value according to the given typed array.
   *
   * @static
   * @method
   * @param {number} value - The value to denormalize.
   * @param {TypedArray} array - The typed array that defines the data type of the value.
   * @return {number} The denormalize (float) value in the range `[0,1]`.
   */
  denormalize: Bi
};
class It {
  /**
   * Constructs a new 2D vector.
   *
   * @param {number} [x=0] - The x value of this vector.
   * @param {number} [y=0] - The y value of this vector.
   */
  constructor(t = 0, e = 0) {
    It.prototype.isVector2 = !0, this.x = t, this.y = e;
  }
  /**
   * Alias for {@link Vector2#x}.
   *
   * @type {number}
   */
  get width() {
    return this.x;
  }
  set width(t) {
    this.x = t;
  }
  /**
   * Alias for {@link Vector2#y}.
   *
   * @type {number}
   */
  get height() {
    return this.y;
  }
  set height(t) {
    this.y = t;
  }
  /**
   * Sets the vector components.
   *
   * @param {number} x - The value of the x component.
   * @param {number} y - The value of the y component.
   * @return {Vector2} A reference to this vector.
   */
  set(t, e) {
    return this.x = t, this.y = e, this;
  }
  /**
   * Sets the vector components to the same value.
   *
   * @param {number} scalar - The value to set for all vector components.
   * @return {Vector2} A reference to this vector.
   */
  setScalar(t) {
    return this.x = t, this.y = t, this;
  }
  /**
   * Sets the vector's x component to the given value
   *
   * @param {number} x - The value to set.
   * @return {Vector2} A reference to this vector.
   */
  setX(t) {
    return this.x = t, this;
  }
  /**
   * Sets the vector's y component to the given value
   *
   * @param {number} y - The value to set.
   * @return {Vector2} A reference to this vector.
   */
  setY(t) {
    return this.y = t, this;
  }
  /**
   * Allows to set a vector component with an index.
   *
   * @param {number} index - The component index. `0` equals to x, `1` equals to y.
   * @param {number} value - The value to set.
   * @return {Vector2} A reference to this vector.
   */
  setComponent(t, e) {
    switch (t) {
      case 0:
        this.x = e;
        break;
      case 1:
        this.y = e;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  /**
   * Returns the value of the vector component which matches the given index.
   *
   * @param {number} index - The component index. `0` equals to x, `1` equals to y.
   * @return {number} A vector component value.
   */
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error("index is out of range: " + t);
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
  copy(t) {
    return this.x = t.x, this.y = t.y, this;
  }
  /**
   * Adds the given vector to this instance.
   *
   * @param {Vector2} v - The vector to add.
   * @return {Vector2} A reference to this vector.
   */
  add(t) {
    return this.x += t.x, this.y += t.y, this;
  }
  /**
   * Adds the given scalar value to all components of this instance.
   *
   * @param {number} s - The scalar to add.
   * @return {Vector2} A reference to this vector.
   */
  addScalar(t) {
    return this.x += t, this.y += t, this;
  }
  /**
   * Adds the given vectors and stores the result in this instance.
   *
   * @param {Vector2} a - The first vector.
   * @param {Vector2} b - The second vector.
   * @return {Vector2} A reference to this vector.
   */
  addVectors(t, e) {
    return this.x = t.x + e.x, this.y = t.y + e.y, this;
  }
  /**
   * Adds the given vector scaled by the given factor to this instance.
   *
   * @param {Vector2} v - The vector.
   * @param {number} s - The factor that scales `v`.
   * @return {Vector2} A reference to this vector.
   */
  addScaledVector(t, e) {
    return this.x += t.x * e, this.y += t.y * e, this;
  }
  /**
   * Subtracts the given vector from this instance.
   *
   * @param {Vector2} v - The vector to subtract.
   * @return {Vector2} A reference to this vector.
   */
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this;
  }
  /**
   * Subtracts the given scalar value from all components of this instance.
   *
   * @param {number} s - The scalar to subtract.
   * @return {Vector2} A reference to this vector.
   */
  subScalar(t) {
    return this.x -= t, this.y -= t, this;
  }
  /**
   * Subtracts the given vectors and stores the result in this instance.
   *
   * @param {Vector2} a - The first vector.
   * @param {Vector2} b - The second vector.
   * @return {Vector2} A reference to this vector.
   */
  subVectors(t, e) {
    return this.x = t.x - e.x, this.y = t.y - e.y, this;
  }
  /**
   * Multiplies the given vector with this instance.
   *
   * @param {Vector2} v - The vector to multiply.
   * @return {Vector2} A reference to this vector.
   */
  multiply(t) {
    return this.x *= t.x, this.y *= t.y, this;
  }
  /**
   * Multiplies the given scalar value with all components of this instance.
   *
   * @param {number} scalar - The scalar to multiply.
   * @return {Vector2} A reference to this vector.
   */
  multiplyScalar(t) {
    return this.x *= t, this.y *= t, this;
  }
  /**
   * Divides this instance by the given vector.
   *
   * @param {Vector2} v - The vector to divide.
   * @return {Vector2} A reference to this vector.
   */
  divide(t) {
    return this.x /= t.x, this.y /= t.y, this;
  }
  /**
   * Divides this vector by the given scalar.
   *
   * @param {number} scalar - The scalar to divide.
   * @return {Vector2} A reference to this vector.
   */
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  /**
   * Multiplies this vector (with an implicit 1 as the 3rd component) by
   * the given 3x3 matrix.
   *
   * @param {Matrix3} m - The matrix to apply.
   * @return {Vector2} A reference to this vector.
   */
  applyMatrix3(t) {
    const e = this.x, n = this.y, r = t.elements;
    return this.x = r[0] * e + r[3] * n + r[6], this.y = r[1] * e + r[4] * n + r[7], this;
  }
  /**
   * If this vector's x or y value is greater than the given vector's x or y
   * value, replace that value with the corresponding min value.
   *
   * @param {Vector2} v - The vector.
   * @return {Vector2} A reference to this vector.
   */
  min(t) {
    return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this;
  }
  /**
   * If this vector's x or y value is less than the given vector's x or y
   * value, replace that value with the corresponding max value.
   *
   * @param {Vector2} v - The vector.
   * @return {Vector2} A reference to this vector.
   */
  max(t) {
    return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this;
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
  clamp(t, e) {
    return this.x = Gt(this.x, t.x, e.x), this.y = Gt(this.y, t.y, e.y), this;
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
  clampScalar(t, e) {
    return this.x = Gt(this.x, t, e), this.y = Gt(this.y, t, e), this;
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
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Gt(n, t, e));
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
  dot(t) {
    return this.x * t.x + this.y * t.y;
  }
  /**
   * Calculates the cross product of the given vector with this instance.
   *
   * @param {Vector2} v - The vector to compute the cross product with.
   * @return {number} The result of the cross product.
   */
  cross(t) {
    return this.x * t.y - this.y * t.x;
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
  angleTo(t) {
    const e = Math.sqrt(this.lengthSq() * t.lengthSq());
    if (e === 0) return Math.PI / 2;
    const n = this.dot(t) / e;
    return Math.acos(Gt(n, -1, 1));
  }
  /**
   * Computes the distance from the given vector to this instance.
   *
   * @param {Vector2} v - The vector to compute the distance to.
   * @return {number} The distance.
   */
  distanceTo(t) {
    return Math.sqrt(this.distanceToSquared(t));
  }
  /**
   * Computes the squared distance from the given vector to this instance.
   * If you are just comparing the distance with another distance, you should compare
   * the distance squared instead as it is slightly more efficient to calculate.
   *
   * @param {Vector2} v - The vector to compute the squared distance to.
   * @return {number} The squared distance.
   */
  distanceToSquared(t) {
    const e = this.x - t.x, n = this.y - t.y;
    return e * e + n * n;
  }
  /**
   * Computes the Manhattan distance from the given vector to this instance.
   *
   * @param {Vector2} v - The vector to compute the Manhattan distance to.
   * @return {number} The Manhattan distance.
   */
  manhattanDistanceTo(t) {
    return Math.abs(this.x - t.x) + Math.abs(this.y - t.y);
  }
  /**
   * Sets this vector to a vector with the same direction as this one, but
   * with the specified length.
   *
   * @param {number} length - The new length of this vector.
   * @return {Vector2} A reference to this vector.
   */
  setLength(t) {
    return this.normalize().multiplyScalar(t);
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
  lerp(t, e) {
    return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this;
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
  lerpVectors(t, e, n) {
    return this.x = t.x + (e.x - t.x) * n, this.y = t.y + (e.y - t.y) * n, this;
  }
  /**
   * Returns `true` if this vector is equal with the given one.
   *
   * @param {Vector2} v - The vector to test for equality.
   * @return {boolean} Whether this vector is equal with the given one.
   */
  equals(t) {
    return t.x === this.x && t.y === this.y;
  }
  /**
   * Sets this vector's x value to be `array[ offset ]` and y
   * value to be `array[ offset + 1 ]`.
   *
   * @param {Array<number>} array - An array holding the vector component values.
   * @param {number} [offset=0] - The offset into the array.
   * @return {Vector2} A reference to this vector.
   */
  fromArray(t, e = 0) {
    return this.x = t[e], this.y = t[e + 1], this;
  }
  /**
   * Writes the components of this vector to the given array. If no array is provided,
   * the method returns a new instance.
   *
   * @param {Array<number>} [array=[]] - The target array holding the vector components.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Array<number>} The vector components.
   */
  toArray(t = [], e = 0) {
    return t[e] = this.x, t[e + 1] = this.y, t;
  }
  /**
   * Sets the components of this vector from the given buffer attribute.
   *
   * @param {BufferAttribute} attribute - The buffer attribute holding vector data.
   * @param {number} index - The index into the attribute.
   * @return {Vector2} A reference to this vector.
   */
  fromBufferAttribute(t, e) {
    return this.x = t.getX(e), this.y = t.getY(e), this;
  }
  /**
   * Rotates this vector around the given center by the given angle.
   *
   * @param {Vector2} center - The point around which to rotate.
   * @param {number} angle - The angle to rotate, in radians.
   * @return {Vector2} A reference to this vector.
   */
  rotateAround(t, e) {
    const n = Math.cos(e), r = Math.sin(e), s = this.x - t.x, a = this.y - t.y;
    return this.x = s * n - a * r + t.x, this.y = s * r + a * n + t.y, this;
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
class vi {
  /**
   * Constructs a new quaternion.
   *
   * @param {number} [x=0] - The x value of this quaternion.
   * @param {number} [y=0] - The y value of this quaternion.
   * @param {number} [z=0] - The z value of this quaternion.
   * @param {number} [w=1] - The w value of this quaternion.
   */
  constructor(t = 0, e = 0, n = 0, r = 1) {
    this.isQuaternion = !0, this._x = t, this._y = e, this._z = n, this._w = r;
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
  static slerpFlat(t, e, n, r, s, a, o) {
    let l = n[r + 0], c = n[r + 1], h = n[r + 2], d = n[r + 3];
    const f = s[a + 0], p = s[a + 1], g = s[a + 2], _ = s[a + 3];
    if (o === 0) {
      t[e + 0] = l, t[e + 1] = c, t[e + 2] = h, t[e + 3] = d;
      return;
    }
    if (o === 1) {
      t[e + 0] = f, t[e + 1] = p, t[e + 2] = g, t[e + 3] = _;
      return;
    }
    if (d !== _ || l !== f || c !== p || h !== g) {
      let m = 1 - o;
      const u = l * f + c * p + h * g + d * _, T = u >= 0 ? 1 : -1, b = 1 - u * u;
      if (b > Number.EPSILON) {
        const w = Math.sqrt(b), R = Math.atan2(w, u * T);
        m = Math.sin(m * R) / w, o = Math.sin(o * R) / w;
      }
      const y = o * T;
      if (l = l * m + f * y, c = c * m + p * y, h = h * m + g * y, d = d * m + _ * y, m === 1 - o) {
        const w = 1 / Math.sqrt(l * l + c * c + h * h + d * d);
        l *= w, c *= w, h *= w, d *= w;
      }
    }
    t[e] = l, t[e + 1] = c, t[e + 2] = h, t[e + 3] = d;
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
  static multiplyQuaternionsFlat(t, e, n, r, s, a) {
    const o = n[r], l = n[r + 1], c = n[r + 2], h = n[r + 3], d = s[a], f = s[a + 1], p = s[a + 2], g = s[a + 3];
    return t[e] = o * g + h * d + l * p - c * f, t[e + 1] = l * g + h * f + c * d - o * p, t[e + 2] = c * g + h * p + o * f - l * d, t[e + 3] = h * g - o * d - l * f - c * p, t;
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
  set x(t) {
    this._x = t, this._onChangeCallback();
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
  set y(t) {
    this._y = t, this._onChangeCallback();
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
  set z(t) {
    this._z = t, this._onChangeCallback();
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
  set w(t) {
    this._w = t, this._onChangeCallback();
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
  set(t, e, n, r) {
    return this._x = t, this._y = e, this._z = n, this._w = r, this._onChangeCallback(), this;
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
  copy(t) {
    return this._x = t.x, this._y = t.y, this._z = t.z, this._w = t.w, this._onChangeCallback(), this;
  }
  /**
   * Sets this quaternion from the rotation specified by the given
   * Euler angles.
   *
   * @param {Euler} euler - The Euler angles.
   * @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
   * @return {Quaternion} A reference to this quaternion.
   */
  setFromEuler(t, e = !0) {
    const n = t._x, r = t._y, s = t._z, a = t._order, o = Math.cos, l = Math.sin, c = o(n / 2), h = o(r / 2), d = o(s / 2), f = l(n / 2), p = l(r / 2), g = l(s / 2);
    switch (a) {
      case "XYZ":
        this._x = f * h * d + c * p * g, this._y = c * p * d - f * h * g, this._z = c * h * g + f * p * d, this._w = c * h * d - f * p * g;
        break;
      case "YXZ":
        this._x = f * h * d + c * p * g, this._y = c * p * d - f * h * g, this._z = c * h * g - f * p * d, this._w = c * h * d + f * p * g;
        break;
      case "ZXY":
        this._x = f * h * d - c * p * g, this._y = c * p * d + f * h * g, this._z = c * h * g + f * p * d, this._w = c * h * d - f * p * g;
        break;
      case "ZYX":
        this._x = f * h * d - c * p * g, this._y = c * p * d + f * h * g, this._z = c * h * g - f * p * d, this._w = c * h * d + f * p * g;
        break;
      case "YZX":
        this._x = f * h * d + c * p * g, this._y = c * p * d + f * h * g, this._z = c * h * g - f * p * d, this._w = c * h * d - f * p * g;
        break;
      case "XZY":
        this._x = f * h * d - c * p * g, this._y = c * p * d - f * h * g, this._z = c * h * g + f * p * d, this._w = c * h * d + f * p * g;
        break;
      default:
        console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + a);
    }
    return e === !0 && this._onChangeCallback(), this;
  }
  /**
   * Sets this quaternion from the given axis and angle.
   *
   * @param {Vector3} axis - The normalized axis.
   * @param {number} angle - The angle in radians.
   * @return {Quaternion} A reference to this quaternion.
   */
  setFromAxisAngle(t, e) {
    const n = e / 2, r = Math.sin(n);
    return this._x = t.x * r, this._y = t.y * r, this._z = t.z * r, this._w = Math.cos(n), this._onChangeCallback(), this;
  }
  /**
   * Sets this quaternion from the given rotation matrix.
   *
   * @param {Matrix4} m - A 4x4 matrix of which the upper 3x3 of matrix is a pure rotation matrix (i.e. unscaled).
   * @return {Quaternion} A reference to this quaternion.
   */
  setFromRotationMatrix(t) {
    const e = t.elements, n = e[0], r = e[4], s = e[8], a = e[1], o = e[5], l = e[9], c = e[2], h = e[6], d = e[10], f = n + o + d;
    if (f > 0) {
      const p = 0.5 / Math.sqrt(f + 1);
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
  setFromUnitVectors(t, e) {
    let n = t.dot(e) + 1;
    return n < 1e-8 ? (n = 0, Math.abs(t.x) > Math.abs(t.z) ? (this._x = -t.y, this._y = t.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -t.z, this._z = t.y, this._w = n)) : (this._x = t.y * e.z - t.z * e.y, this._y = t.z * e.x - t.x * e.z, this._z = t.x * e.y - t.y * e.x, this._w = n), this.normalize();
  }
  /**
   * Returns the angle between this quaternion and the given one in radians.
   *
   * @param {Quaternion} q - The quaternion to compute the angle with.
   * @return {number} The angle in radians.
   */
  angleTo(t) {
    return 2 * Math.acos(Math.abs(Gt(this.dot(t), -1, 1)));
  }
  /**
   * Rotates this quaternion by a given angular step to the given quaternion.
   * The method ensures that the final quaternion will not overshoot `q`.
   *
   * @param {Quaternion} q - The target quaternion.
   * @param {number} step - The angular step in radians.
   * @return {Quaternion} A reference to this quaternion.
   */
  rotateTowards(t, e) {
    const n = this.angleTo(t);
    if (n === 0) return this;
    const r = Math.min(1, e / n);
    return this.slerp(t, r), this;
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
  dot(t) {
    return this._x * t._x + this._y * t._y + this._z * t._z + this._w * t._w;
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
    let t = this.length();
    return t === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (t = 1 / t, this._x = this._x * t, this._y = this._y * t, this._z = this._z * t, this._w = this._w * t), this._onChangeCallback(), this;
  }
  /**
   * Multiplies this quaternion by the given one.
   *
   * @param {Quaternion} q - The quaternion.
   * @return {Quaternion} A reference to this quaternion.
   */
  multiply(t) {
    return this.multiplyQuaternions(this, t);
  }
  /**
   * Pre-multiplies this quaternion by the given one.
   *
   * @param {Quaternion} q - The quaternion.
   * @return {Quaternion} A reference to this quaternion.
   */
  premultiply(t) {
    return this.multiplyQuaternions(t, this);
  }
  /**
   * Multiplies the given quaternions and stores the result in this instance.
   *
   * @param {Quaternion} a - The first quaternion.
   * @param {Quaternion} b - The second quaternion.
   * @return {Quaternion} A reference to this quaternion.
   */
  multiplyQuaternions(t, e) {
    const n = t._x, r = t._y, s = t._z, a = t._w, o = e._x, l = e._y, c = e._z, h = e._w;
    return this._x = n * h + a * o + r * c - s * l, this._y = r * h + a * l + s * o - n * c, this._z = s * h + a * c + n * l - r * o, this._w = a * h - n * o - r * l - s * c, this._onChangeCallback(), this;
  }
  /**
   * Performs a spherical linear interpolation between quaternions.
   *
   * @param {Quaternion} qb - The target quaternion.
   * @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
   * @return {Quaternion} A reference to this quaternion.
   */
  slerp(t, e) {
    if (e === 0) return this;
    if (e === 1) return this.copy(t);
    const n = this._x, r = this._y, s = this._z, a = this._w;
    let o = a * t._w + n * t._x + r * t._y + s * t._z;
    if (o < 0 ? (this._w = -t._w, this._x = -t._x, this._y = -t._y, this._z = -t._z, o = -o) : this.copy(t), o >= 1)
      return this._w = a, this._x = n, this._y = r, this._z = s, this;
    const l = 1 - o * o;
    if (l <= Number.EPSILON) {
      const p = 1 - e;
      return this._w = p * a + e * this._w, this._x = p * n + e * this._x, this._y = p * r + e * this._y, this._z = p * s + e * this._z, this.normalize(), this;
    }
    const c = Math.sqrt(l), h = Math.atan2(c, o), d = Math.sin((1 - e) * h) / c, f = Math.sin(e * h) / c;
    return this._w = a * d + this._w * f, this._x = n * d + this._x * f, this._y = r * d + this._y * f, this._z = s * d + this._z * f, this._onChangeCallback(), this;
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
  slerpQuaternions(t, e, n) {
    return this.copy(t).slerp(e, n);
  }
  /**
   * Sets this quaternion to a uniformly random, normalized quaternion.
   *
   * @return {Quaternion} A reference to this quaternion.
   */
  random() {
    const t = 2 * Math.PI * Math.random(), e = 2 * Math.PI * Math.random(), n = Math.random(), r = Math.sqrt(1 - n), s = Math.sqrt(n);
    return this.set(
      r * Math.sin(t),
      r * Math.cos(t),
      s * Math.sin(e),
      s * Math.cos(e)
    );
  }
  /**
   * Returns `true` if this quaternion is equal with the given one.
   *
   * @param {Quaternion} quaternion - The quaternion to test for equality.
   * @return {boolean} Whether this quaternion is equal with the given one.
   */
  equals(t) {
    return t._x === this._x && t._y === this._y && t._z === this._z && t._w === this._w;
  }
  /**
   * Sets this quaternion's components from the given array.
   *
   * @param {Array<number>} array - An array holding the quaternion component values.
   * @param {number} [offset=0] - The offset into the array.
   * @return {Quaternion} A reference to this quaternion.
   */
  fromArray(t, e = 0) {
    return this._x = t[e], this._y = t[e + 1], this._z = t[e + 2], this._w = t[e + 3], this._onChangeCallback(), this;
  }
  /**
   * Writes the components of this quaternion to the given array. If no array is provided,
   * the method returns a new instance.
   *
   * @param {Array<number>} [array=[]] - The target array holding the quaternion components.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Array<number>} The quaternion components.
   */
  toArray(t = [], e = 0) {
    return t[e] = this._x, t[e + 1] = this._y, t[e + 2] = this._z, t[e + 3] = this._w, t;
  }
  /**
   * Sets the components of this quaternion from the given buffer attribute.
   *
   * @param {BufferAttribute} attribute - The buffer attribute holding quaternion data.
   * @param {number} index - The index into the attribute.
   * @return {Quaternion} A reference to this quaternion.
   */
  fromBufferAttribute(t, e) {
    return this._x = t.getX(e), this._y = t.getY(e), this._z = t.getZ(e), this._w = t.getW(e), this._onChangeCallback(), this;
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
  _onChange(t) {
    return this._onChangeCallback = t, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._w;
  }
}
class I {
  /**
   * Constructs a new 3D vector.
   *
   * @param {number} [x=0] - The x value of this vector.
   * @param {number} [y=0] - The y value of this vector.
   * @param {number} [z=0] - The z value of this vector.
   */
  constructor(t = 0, e = 0, n = 0) {
    I.prototype.isVector3 = !0, this.x = t, this.y = e, this.z = n;
  }
  /**
   * Sets the vector components.
   *
   * @param {number} x - The value of the x component.
   * @param {number} y - The value of the y component.
   * @param {number} z - The value of the z component.
   * @return {Vector3} A reference to this vector.
   */
  set(t, e, n) {
    return n === void 0 && (n = this.z), this.x = t, this.y = e, this.z = n, this;
  }
  /**
   * Sets the vector components to the same value.
   *
   * @param {number} scalar - The value to set for all vector components.
   * @return {Vector3} A reference to this vector.
   */
  setScalar(t) {
    return this.x = t, this.y = t, this.z = t, this;
  }
  /**
   * Sets the vector's x component to the given value
   *
   * @param {number} x - The value to set.
   * @return {Vector3} A reference to this vector.
   */
  setX(t) {
    return this.x = t, this;
  }
  /**
   * Sets the vector's y component to the given value
   *
   * @param {number} y - The value to set.
   * @return {Vector3} A reference to this vector.
   */
  setY(t) {
    return this.y = t, this;
  }
  /**
   * Sets the vector's z component to the given value
   *
   * @param {number} z - The value to set.
   * @return {Vector3} A reference to this vector.
   */
  setZ(t) {
    return this.z = t, this;
  }
  /**
   * Allows to set a vector component with an index.
   *
   * @param {number} index - The component index. `0` equals to x, `1` equals to y, `2` equals to z.
   * @param {number} value - The value to set.
   * @return {Vector3} A reference to this vector.
   */
  setComponent(t, e) {
    switch (t) {
      case 0:
        this.x = e;
        break;
      case 1:
        this.y = e;
        break;
      case 2:
        this.z = e;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  /**
   * Returns the value of the vector component which matches the given index.
   *
   * @param {number} index - The component index. `0` equals to x, `1` equals to y, `2` equals to z.
   * @return {number} A vector component value.
   */
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("index is out of range: " + t);
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
  copy(t) {
    return this.x = t.x, this.y = t.y, this.z = t.z, this;
  }
  /**
   * Adds the given vector to this instance.
   *
   * @param {Vector3} v - The vector to add.
   * @return {Vector3} A reference to this vector.
   */
  add(t) {
    return this.x += t.x, this.y += t.y, this.z += t.z, this;
  }
  /**
   * Adds the given scalar value to all components of this instance.
   *
   * @param {number} s - The scalar to add.
   * @return {Vector3} A reference to this vector.
   */
  addScalar(t) {
    return this.x += t, this.y += t, this.z += t, this;
  }
  /**
   * Adds the given vectors and stores the result in this instance.
   *
   * @param {Vector3} a - The first vector.
   * @param {Vector3} b - The second vector.
   * @return {Vector3} A reference to this vector.
   */
  addVectors(t, e) {
    return this.x = t.x + e.x, this.y = t.y + e.y, this.z = t.z + e.z, this;
  }
  /**
   * Adds the given vector scaled by the given factor to this instance.
   *
   * @param {Vector3|Vector4} v - The vector.
   * @param {number} s - The factor that scales `v`.
   * @return {Vector3} A reference to this vector.
   */
  addScaledVector(t, e) {
    return this.x += t.x * e, this.y += t.y * e, this.z += t.z * e, this;
  }
  /**
   * Subtracts the given vector from this instance.
   *
   * @param {Vector3} v - The vector to subtract.
   * @return {Vector3} A reference to this vector.
   */
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this.z -= t.z, this;
  }
  /**
   * Subtracts the given scalar value from all components of this instance.
   *
   * @param {number} s - The scalar to subtract.
   * @return {Vector3} A reference to this vector.
   */
  subScalar(t) {
    return this.x -= t, this.y -= t, this.z -= t, this;
  }
  /**
   * Subtracts the given vectors and stores the result in this instance.
   *
   * @param {Vector3} a - The first vector.
   * @param {Vector3} b - The second vector.
   * @return {Vector3} A reference to this vector.
   */
  subVectors(t, e) {
    return this.x = t.x - e.x, this.y = t.y - e.y, this.z = t.z - e.z, this;
  }
  /**
   * Multiplies the given vector with this instance.
   *
   * @param {Vector3} v - The vector to multiply.
   * @return {Vector3} A reference to this vector.
   */
  multiply(t) {
    return this.x *= t.x, this.y *= t.y, this.z *= t.z, this;
  }
  /**
   * Multiplies the given scalar value with all components of this instance.
   *
   * @param {number} scalar - The scalar to multiply.
   * @return {Vector3} A reference to this vector.
   */
  multiplyScalar(t) {
    return this.x *= t, this.y *= t, this.z *= t, this;
  }
  /**
   * Multiplies the given vectors and stores the result in this instance.
   *
   * @param {Vector3} a - The first vector.
   * @param {Vector3} b - The second vector.
   * @return {Vector3} A reference to this vector.
   */
  multiplyVectors(t, e) {
    return this.x = t.x * e.x, this.y = t.y * e.y, this.z = t.z * e.z, this;
  }
  /**
   * Applies the given Euler rotation to this vector.
   *
   * @param {Euler} euler - The Euler angles.
   * @return {Vector3} A reference to this vector.
   */
  applyEuler(t) {
    return this.applyQuaternion(No.setFromEuler(t));
  }
  /**
   * Applies a rotation specified by an axis and an angle to this vector.
   *
   * @param {Vector3} axis - A normalized vector representing the rotation axis.
   * @param {number} angle - The angle in radians.
   * @return {Vector3} A reference to this vector.
   */
  applyAxisAngle(t, e) {
    return this.applyQuaternion(No.setFromAxisAngle(t, e));
  }
  /**
   * Multiplies this vector with the given 3x3 matrix.
   *
   * @param {Matrix3} m - The 3x3 matrix.
   * @return {Vector3} A reference to this vector.
   */
  applyMatrix3(t) {
    const e = this.x, n = this.y, r = this.z, s = t.elements;
    return this.x = s[0] * e + s[3] * n + s[6] * r, this.y = s[1] * e + s[4] * n + s[7] * r, this.z = s[2] * e + s[5] * n + s[8] * r, this;
  }
  /**
   * Multiplies this vector by the given normal matrix and normalizes
   * the result.
   *
   * @param {Matrix3} m - The normal matrix.
   * @return {Vector3} A reference to this vector.
   */
  applyNormalMatrix(t) {
    return this.applyMatrix3(t).normalize();
  }
  /**
   * Multiplies this vector (with an implicit 1 in the 4th dimension) by m, and
   * divides by perspective.
   *
   * @param {Matrix4} m - The matrix to apply.
   * @return {Vector3} A reference to this vector.
   */
  applyMatrix4(t) {
    const e = this.x, n = this.y, r = this.z, s = t.elements, a = 1 / (s[3] * e + s[7] * n + s[11] * r + s[15]);
    return this.x = (s[0] * e + s[4] * n + s[8] * r + s[12]) * a, this.y = (s[1] * e + s[5] * n + s[9] * r + s[13]) * a, this.z = (s[2] * e + s[6] * n + s[10] * r + s[14]) * a, this;
  }
  /**
   * Applies the given Quaternion to this vector.
   *
   * @param {Quaternion} q - The Quaternion.
   * @return {Vector3} A reference to this vector.
   */
  applyQuaternion(t) {
    const e = this.x, n = this.y, r = this.z, s = t.x, a = t.y, o = t.z, l = t.w, c = 2 * (a * r - o * n), h = 2 * (o * e - s * r), d = 2 * (s * n - a * e);
    return this.x = e + l * c + a * d - o * h, this.y = n + l * h + o * c - s * d, this.z = r + l * d + s * h - a * c, this;
  }
  /**
   * Projects this vector from world space into the camera's normalized
   * device coordinate (NDC) space.
   *
   * @param {Camera} camera - The camera.
   * @return {Vector3} A reference to this vector.
   */
  project(t) {
    return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix);
  }
  /**
   * Unprojects this vector from the camera's normalized device coordinate (NDC)
   * space into world space.
   *
   * @param {Camera} camera - The camera.
   * @return {Vector3} A reference to this vector.
   */
  unproject(t) {
    return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld);
  }
  /**
   * Transforms the direction of this vector by a matrix (the upper left 3 x 3
   * subset of the given 4x4 matrix and then normalizes the result.
   *
   * @param {Matrix4} m - The matrix.
   * @return {Vector3} A reference to this vector.
   */
  transformDirection(t) {
    const e = this.x, n = this.y, r = this.z, s = t.elements;
    return this.x = s[0] * e + s[4] * n + s[8] * r, this.y = s[1] * e + s[5] * n + s[9] * r, this.z = s[2] * e + s[6] * n + s[10] * r, this.normalize();
  }
  /**
   * Divides this instance by the given vector.
   *
   * @param {Vector3} v - The vector to divide.
   * @return {Vector3} A reference to this vector.
   */
  divide(t) {
    return this.x /= t.x, this.y /= t.y, this.z /= t.z, this;
  }
  /**
   * Divides this vector by the given scalar.
   *
   * @param {number} scalar - The scalar to divide.
   * @return {Vector3} A reference to this vector.
   */
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  /**
   * If this vector's x, y or z value is greater than the given vector's x, y or z
   * value, replace that value with the corresponding min value.
   *
   * @param {Vector3} v - The vector.
   * @return {Vector3} A reference to this vector.
   */
  min(t) {
    return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), this;
  }
  /**
   * If this vector's x, y or z value is less than the given vector's x, y or z
   * value, replace that value with the corresponding max value.
   *
   * @param {Vector3} v - The vector.
   * @return {Vector3} A reference to this vector.
   */
  max(t) {
    return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), this;
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
  clamp(t, e) {
    return this.x = Gt(this.x, t.x, e.x), this.y = Gt(this.y, t.y, e.y), this.z = Gt(this.z, t.z, e.z), this;
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
  clampScalar(t, e) {
    return this.x = Gt(this.x, t, e), this.y = Gt(this.y, t, e), this.z = Gt(this.z, t, e), this;
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
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Gt(n, t, e));
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
  dot(t) {
    return this.x * t.x + this.y * t.y + this.z * t.z;
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
  setLength(t) {
    return this.normalize().multiplyScalar(t);
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
  lerp(t, e) {
    return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this.z += (t.z - this.z) * e, this;
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
  lerpVectors(t, e, n) {
    return this.x = t.x + (e.x - t.x) * n, this.y = t.y + (e.y - t.y) * n, this.z = t.z + (e.z - t.z) * n, this;
  }
  /**
   * Calculates the cross product of the given vector with this instance.
   *
   * @param {Vector3} v - The vector to compute the cross product with.
   * @return {Vector3} The result of the cross product.
   */
  cross(t) {
    return this.crossVectors(this, t);
  }
  /**
   * Calculates the cross product of the given vectors and stores the result
   * in this instance.
   *
   * @param {Vector3} a - The first vector.
   * @param {Vector3} b - The second vector.
   * @return {Vector3} A reference to this vector.
   */
  crossVectors(t, e) {
    const n = t.x, r = t.y, s = t.z, a = e.x, o = e.y, l = e.z;
    return this.x = r * l - s * o, this.y = s * a - n * l, this.z = n * o - r * a, this;
  }
  /**
   * Projects this vector onto the given one.
   *
   * @param {Vector3} v - The vector to project to.
   * @return {Vector3} A reference to this vector.
   */
  projectOnVector(t) {
    const e = t.lengthSq();
    if (e === 0) return this.set(0, 0, 0);
    const n = t.dot(this) / e;
    return this.copy(t).multiplyScalar(n);
  }
  /**
   * Projects this vector onto a plane by subtracting this
   * vector projected onto the plane's normal from this vector.
   *
   * @param {Vector3} planeNormal - The plane normal.
   * @return {Vector3} A reference to this vector.
   */
  projectOnPlane(t) {
    return Ss.copy(this).projectOnVector(t), this.sub(Ss);
  }
  /**
   * Reflects this vector off a plane orthogonal to the given normal vector.
   *
   * @param {Vector3} normal - The (normalized) normal vector.
   * @return {Vector3} A reference to this vector.
   */
  reflect(t) {
    return this.sub(Ss.copy(t).multiplyScalar(2 * this.dot(t)));
  }
  /**
   * Returns the angle between the given vector and this instance in radians.
   *
   * @param {Vector3} v - The vector to compute the angle with.
   * @return {number} The angle in radians.
   */
  angleTo(t) {
    const e = Math.sqrt(this.lengthSq() * t.lengthSq());
    if (e === 0) return Math.PI / 2;
    const n = this.dot(t) / e;
    return Math.acos(Gt(n, -1, 1));
  }
  /**
   * Computes the distance from the given vector to this instance.
   *
   * @param {Vector3} v - The vector to compute the distance to.
   * @return {number} The distance.
   */
  distanceTo(t) {
    return Math.sqrt(this.distanceToSquared(t));
  }
  /**
   * Computes the squared distance from the given vector to this instance.
   * If you are just comparing the distance with another distance, you should compare
   * the distance squared instead as it is slightly more efficient to calculate.
   *
   * @param {Vector3} v - The vector to compute the squared distance to.
   * @return {number} The squared distance.
   */
  distanceToSquared(t) {
    const e = this.x - t.x, n = this.y - t.y, r = this.z - t.z;
    return e * e + n * n + r * r;
  }
  /**
   * Computes the Manhattan distance from the given vector to this instance.
   *
   * @param {Vector3} v - The vector to compute the Manhattan distance to.
   * @return {number} The Manhattan distance.
   */
  manhattanDistanceTo(t) {
    return Math.abs(this.x - t.x) + Math.abs(this.y - t.y) + Math.abs(this.z - t.z);
  }
  /**
   * Sets the vector components from the given spherical coordinates.
   *
   * @param {Spherical} s - The spherical coordinates.
   * @return {Vector3} A reference to this vector.
   */
  setFromSpherical(t) {
    return this.setFromSphericalCoords(t.radius, t.phi, t.theta);
  }
  /**
   * Sets the vector components from the given spherical coordinates.
   *
   * @param {number} radius - The radius.
   * @param {number} phi - The phi angle in radians.
   * @param {number} theta - The theta angle in radians.
   * @return {Vector3} A reference to this vector.
   */
  setFromSphericalCoords(t, e, n) {
    const r = Math.sin(e) * t;
    return this.x = r * Math.sin(n), this.y = Math.cos(e) * t, this.z = r * Math.cos(n), this;
  }
  /**
   * Sets the vector components from the given cylindrical coordinates.
   *
   * @param {Cylindrical} c - The cylindrical coordinates.
   * @return {Vector3} A reference to this vector.
   */
  setFromCylindrical(t) {
    return this.setFromCylindricalCoords(t.radius, t.theta, t.y);
  }
  /**
   * Sets the vector components from the given cylindrical coordinates.
   *
   * @param {number} radius - The radius.
   * @param {number} theta - The theta angle in radians.
   * @param {number} y - The y value.
   * @return {Vector3} A reference to this vector.
   */
  setFromCylindricalCoords(t, e, n) {
    return this.x = t * Math.sin(e), this.y = n, this.z = t * Math.cos(e), this;
  }
  /**
   * Sets the vector components to the position elements of the
   * given transformation matrix.
   *
   * @param {Matrix4} m - The 4x4 matrix.
   * @return {Vector3} A reference to this vector.
   */
  setFromMatrixPosition(t) {
    const e = t.elements;
    return this.x = e[12], this.y = e[13], this.z = e[14], this;
  }
  /**
   * Sets the vector components to the scale elements of the
   * given transformation matrix.
   *
   * @param {Matrix4} m - The 4x4 matrix.
   * @return {Vector3} A reference to this vector.
   */
  setFromMatrixScale(t) {
    const e = this.setFromMatrixColumn(t, 0).length(), n = this.setFromMatrixColumn(t, 1).length(), r = this.setFromMatrixColumn(t, 2).length();
    return this.x = e, this.y = n, this.z = r, this;
  }
  /**
   * Sets the vector components from the specified matrix column.
   *
   * @param {Matrix4} m - The 4x4 matrix.
   * @param {number} index - The column index.
   * @return {Vector3} A reference to this vector.
   */
  setFromMatrixColumn(t, e) {
    return this.fromArray(t.elements, e * 4);
  }
  /**
   * Sets the vector components from the specified matrix column.
   *
   * @param {Matrix3} m - The 3x3 matrix.
   * @param {number} index - The column index.
   * @return {Vector3} A reference to this vector.
   */
  setFromMatrix3Column(t, e) {
    return this.fromArray(t.elements, e * 3);
  }
  /**
   * Sets the vector components from the given Euler angles.
   *
   * @param {Euler} e - The Euler angles to set.
   * @return {Vector3} A reference to this vector.
   */
  setFromEuler(t) {
    return this.x = t._x, this.y = t._y, this.z = t._z, this;
  }
  /**
   * Sets the vector components from the RGB components of the
   * given color.
   *
   * @param {Color} c - The color to set.
   * @return {Vector3} A reference to this vector.
   */
  setFromColor(t) {
    return this.x = t.r, this.y = t.g, this.z = t.b, this;
  }
  /**
   * Returns `true` if this vector is equal with the given one.
   *
   * @param {Vector3} v - The vector to test for equality.
   * @return {boolean} Whether this vector is equal with the given one.
   */
  equals(t) {
    return t.x === this.x && t.y === this.y && t.z === this.z;
  }
  /**
   * Sets this vector's x value to be `array[ offset ]`, y value to be `array[ offset + 1 ]`
   * and z value to be `array[ offset + 2 ]`.
   *
   * @param {Array<number>} array - An array holding the vector component values.
   * @param {number} [offset=0] - The offset into the array.
   * @return {Vector3} A reference to this vector.
   */
  fromArray(t, e = 0) {
    return this.x = t[e], this.y = t[e + 1], this.z = t[e + 2], this;
  }
  /**
   * Writes the components of this vector to the given array. If no array is provided,
   * the method returns a new instance.
   *
   * @param {Array<number>} [array=[]] - The target array holding the vector components.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Array<number>} The vector components.
   */
  toArray(t = [], e = 0) {
    return t[e] = this.x, t[e + 1] = this.y, t[e + 2] = this.z, t;
  }
  /**
   * Sets the components of this vector from the given buffer attribute.
   *
   * @param {BufferAttribute} attribute - The buffer attribute holding vector data.
   * @param {number} index - The index into the attribute.
   * @return {Vector3} A reference to this vector.
   */
  fromBufferAttribute(t, e) {
    return this.x = t.getX(e), this.y = t.getY(e), this.z = t.getZ(e), this;
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
    const t = Math.random() * Math.PI * 2, e = Math.random() * 2 - 1, n = Math.sqrt(1 - e * e);
    return this.x = n * Math.cos(t), this.y = e, this.z = n * Math.sin(t), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z;
  }
}
const Ss = /* @__PURE__ */ new I(), No = /* @__PURE__ */ new vi();
class zt {
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
  constructor(t, e, n, r, s, a, o, l, c) {
    zt.prototype.isMatrix3 = !0, this.elements = [
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ], t !== void 0 && this.set(t, e, n, r, s, a, o, l, c);
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
  set(t, e, n, r, s, a, o, l, c) {
    const h = this.elements;
    return h[0] = t, h[1] = r, h[2] = o, h[3] = e, h[4] = s, h[5] = l, h[6] = n, h[7] = a, h[8] = c, this;
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
  copy(t) {
    const e = this.elements, n = t.elements;
    return e[0] = n[0], e[1] = n[1], e[2] = n[2], e[3] = n[3], e[4] = n[4], e[5] = n[5], e[6] = n[6], e[7] = n[7], e[8] = n[8], this;
  }
  /**
   * Extracts the basis of this matrix into the three axis vectors provided.
   *
   * @param {Vector3} xAxis - The basis's x axis.
   * @param {Vector3} yAxis - The basis's y axis.
   * @param {Vector3} zAxis - The basis's z axis.
   * @return {Matrix3} A reference to this matrix.
   */
  extractBasis(t, e, n) {
    return t.setFromMatrix3Column(this, 0), e.setFromMatrix3Column(this, 1), n.setFromMatrix3Column(this, 2), this;
  }
  /**
   * Set this matrix to the upper 3x3 matrix of the given 4x4 matrix.
   *
   * @param {Matrix4} m - The 4x4 matrix.
   * @return {Matrix3} A reference to this matrix.
   */
  setFromMatrix4(t) {
    const e = t.elements;
    return this.set(
      e[0],
      e[4],
      e[8],
      e[1],
      e[5],
      e[9],
      e[2],
      e[6],
      e[10]
    ), this;
  }
  /**
   * Post-multiplies this matrix by the given 3x3 matrix.
   *
   * @param {Matrix3} m - The matrix to multiply with.
   * @return {Matrix3} A reference to this matrix.
   */
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
  /**
   * Pre-multiplies this matrix by the given 3x3 matrix.
   *
   * @param {Matrix3} m - The matrix to multiply with.
   * @return {Matrix3} A reference to this matrix.
   */
  premultiply(t) {
    return this.multiplyMatrices(t, this);
  }
  /**
   * Multiples the given 3x3 matrices and stores the result
   * in this matrix.
   *
   * @param {Matrix3} a - The first matrix.
   * @param {Matrix3} b - The second matrix.
   * @return {Matrix3} A reference to this matrix.
   */
  multiplyMatrices(t, e) {
    const n = t.elements, r = e.elements, s = this.elements, a = n[0], o = n[3], l = n[6], c = n[1], h = n[4], d = n[7], f = n[2], p = n[5], g = n[8], _ = r[0], m = r[3], u = r[6], T = r[1], b = r[4], y = r[7], w = r[2], R = r[5], C = r[8];
    return s[0] = a * _ + o * T + l * w, s[3] = a * m + o * b + l * R, s[6] = a * u + o * y + l * C, s[1] = c * _ + h * T + d * w, s[4] = c * m + h * b + d * R, s[7] = c * u + h * y + d * C, s[2] = f * _ + p * T + g * w, s[5] = f * m + p * b + g * R, s[8] = f * u + p * y + g * C, this;
  }
  /**
   * Multiplies every component of the matrix by the given scalar.
   *
   * @param {number} s - The scalar.
   * @return {Matrix3} A reference to this matrix.
   */
  multiplyScalar(t) {
    const e = this.elements;
    return e[0] *= t, e[3] *= t, e[6] *= t, e[1] *= t, e[4] *= t, e[7] *= t, e[2] *= t, e[5] *= t, e[8] *= t, this;
  }
  /**
   * Computes and returns the determinant of this matrix.
   *
   * @return {number} The determinant.
   */
  determinant() {
    const t = this.elements, e = t[0], n = t[1], r = t[2], s = t[3], a = t[4], o = t[5], l = t[6], c = t[7], h = t[8];
    return e * a * h - e * o * c - n * s * h + n * o * l + r * s * c - r * a * l;
  }
  /**
   * Inverts this matrix, using the [analytic method]{@link https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution}.
   * You can not invert with a determinant of zero. If you attempt this, the method produces
   * a zero matrix instead.
   *
   * @return {Matrix3} A reference to this matrix.
   */
  invert() {
    const t = this.elements, e = t[0], n = t[1], r = t[2], s = t[3], a = t[4], o = t[5], l = t[6], c = t[7], h = t[8], d = h * a - o * c, f = o * l - h * s, p = c * s - a * l, g = e * d + n * f + r * p;
    if (g === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const _ = 1 / g;
    return t[0] = d * _, t[1] = (r * c - h * n) * _, t[2] = (o * n - r * a) * _, t[3] = f * _, t[4] = (h * e - r * l) * _, t[5] = (r * s - o * e) * _, t[6] = p * _, t[7] = (n * l - c * e) * _, t[8] = (a * e - n * s) * _, this;
  }
  /**
   * Transposes this matrix in place.
   *
   * @return {Matrix3} A reference to this matrix.
   */
  transpose() {
    let t;
    const e = this.elements;
    return t = e[1], e[1] = e[3], e[3] = t, t = e[2], e[2] = e[6], e[6] = t, t = e[5], e[5] = e[7], e[7] = t, this;
  }
  /**
   * Computes the normal matrix which is the inverse transpose of the upper
   * left 3x3 portion of the given 4x4 matrix.
   *
   * @param {Matrix4} matrix4 - The 4x4 matrix.
   * @return {Matrix3} A reference to this matrix.
   */
  getNormalMatrix(t) {
    return this.setFromMatrix4(t).invert().transpose();
  }
  /**
   * Transposes this matrix into the supplied array, and returns itself unchanged.
   *
   * @param {Array<number>} r - An array to store the transposed matrix elements.
   * @return {Matrix3} A reference to this matrix.
   */
  transposeIntoArray(t) {
    const e = this.elements;
    return t[0] = e[0], t[1] = e[3], t[2] = e[6], t[3] = e[1], t[4] = e[4], t[5] = e[7], t[6] = e[2], t[7] = e[5], t[8] = e[8], this;
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
  setUvTransform(t, e, n, r, s, a, o) {
    const l = Math.cos(s), c = Math.sin(s);
    return this.set(
      n * l,
      n * c,
      -n * (l * a + c * o) + a + t,
      -r * c,
      r * l,
      -r * (-c * a + l * o) + o + e,
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
  scale(t, e) {
    return this.premultiply(ys.makeScale(t, e)), this;
  }
  /**
   * Rotates this matrix by the given angle.
   *
   * @param {number} theta - The rotation in radians.
   * @return {Matrix3} A reference to this matrix.
   */
  rotate(t) {
    return this.premultiply(ys.makeRotation(-t)), this;
  }
  /**
   * Translates this matrix by the given scalar values.
   *
   * @param {number} tx - The amount to translate in the X axis.
   * @param {number} ty - The amount to translate in the Y axis.
   * @return {Matrix3} A reference to this matrix.
   */
  translate(t, e) {
    return this.premultiply(ys.makeTranslation(t, e)), this;
  }
  // for 2D Transforms
  /**
   * Sets this matrix as a 2D translation transform.
   *
   * @param {number|Vector2} x - The amount to translate in the X axis or alternatively a translation vector.
   * @param {number} y - The amount to translate in the Y axis.
   * @return {Matrix3} A reference to this matrix.
   */
  makeTranslation(t, e) {
    return t.isVector2 ? this.set(
      1,
      0,
      t.x,
      0,
      1,
      t.y,
      0,
      0,
      1
    ) : this.set(
      1,
      0,
      t,
      0,
      1,
      e,
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
  makeRotation(t) {
    const e = Math.cos(t), n = Math.sin(t);
    return this.set(
      e,
      -n,
      0,
      n,
      e,
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
  makeScale(t, e) {
    return this.set(
      t,
      0,
      0,
      0,
      e,
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
  equals(t) {
    const e = this.elements, n = t.elements;
    for (let r = 0; r < 9; r++)
      if (e[r] !== n[r]) return !1;
    return !0;
  }
  /**
   * Sets the elements of the matrix from the given array.
   *
   * @param {Array<number>} array - The matrix elements in column-major order.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Matrix3} A reference to this matrix.
   */
  fromArray(t, e = 0) {
    for (let n = 0; n < 9; n++)
      this.elements[n] = t[n + e];
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
  toArray(t = [], e = 0) {
    const n = this.elements;
    return t[e] = n[0], t[e + 1] = n[1], t[e + 2] = n[2], t[e + 3] = n[3], t[e + 4] = n[4], t[e + 5] = n[5], t[e + 6] = n[6], t[e + 7] = n[7], t[e + 8] = n[8], t;
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
const ys = /* @__PURE__ */ new zt();
function rc(i) {
  for (let t = i.length - 1; t >= 0; --t)
    if (i[t] >= 65535) return !0;
  return !1;
}
function ls(i) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", i);
}
function rd() {
  const i = ls("canvas");
  return i.style.display = "block", i;
}
const Fo = {};
function Sr(i) {
  i in Fo || (Fo[i] = !0, console.warn(i));
}
function sd(i, t, e) {
  return new Promise(function(n, r) {
    function s() {
      switch (i.clientWaitSync(t, i.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case i.WAIT_FAILED:
          r();
          break;
        case i.TIMEOUT_EXPIRED:
          setTimeout(s, e);
          break;
        default:
          n();
      }
    }
    setTimeout(s, e);
  });
}
const Oo = /* @__PURE__ */ new zt().set(
  0.4123908,
  0.3575843,
  0.1804808,
  0.212639,
  0.7151687,
  0.0721923,
  0.0193308,
  0.1191948,
  0.9505322
), ko = /* @__PURE__ */ new zt().set(
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
function ad() {
  const i = {
    enabled: !0,
    workingColorSpace: Zi,
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
      return this.enabled === !1 || s === a || !s || !a || (this.spaces[s].transfer === ee && (r.r = Gn(r.r), r.g = Gn(r.g), r.b = Gn(r.b)), this.spaces[s].primaries !== this.spaces[a].primaries && (r.applyMatrix3(this.spaces[s].toXYZ), r.applyMatrix3(this.spaces[a].fromXYZ)), this.spaces[a].transfer === ee && (r.r = $i(r.r), r.g = $i(r.g), r.b = $i(r.b))), r;
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
      return r === Kn ? as : this.spaces[r].transfer;
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
      return Sr("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."), i.workingToColorSpace(r, s);
    },
    toWorkingColorSpace: function(r, s) {
      return Sr("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."), i.colorSpaceToWorking(r, s);
    }
  }, t = [0.64, 0.33, 0.3, 0.6, 0.15, 0.06], e = [0.2126, 0.7152, 0.0722], n = [0.3127, 0.329];
  return i.define({
    [Zi]: {
      primaries: t,
      whitePoint: n,
      transfer: as,
      toXYZ: Oo,
      fromXYZ: ko,
      luminanceCoefficients: e,
      workingColorSpaceConfig: { unpackColorSpace: je },
      outputColorSpaceConfig: { drawingBufferColorSpace: je }
    },
    [je]: {
      primaries: t,
      whitePoint: n,
      transfer: ee,
      toXYZ: Oo,
      fromXYZ: ko,
      luminanceCoefficients: e,
      outputColorSpaceConfig: { drawingBufferColorSpace: je }
    }
  }), i;
}
const Kt = /* @__PURE__ */ ad();
function Gn(i) {
  return i < 0.04045 ? i * 0.0773993808 : Math.pow(i * 0.9478672986 + 0.0521327014, 2.4);
}
function $i(i) {
  return i < 31308e-7 ? i * 12.92 : 1.055 * Math.pow(i, 0.41666) - 0.055;
}
let Ti;
class od {
  /**
   * Returns a data URI containing a representation of the given image.
   *
   * @param {(HTMLImageElement|HTMLCanvasElement)} image - The image object.
   * @param {string} [type='image/png'] - Indicates the image format.
   * @return {string} The data URI.
   */
  static getDataURL(t, e = "image/png") {
    if (/^data:/i.test(t.src) || typeof HTMLCanvasElement > "u")
      return t.src;
    let n;
    if (t instanceof HTMLCanvasElement)
      n = t;
    else {
      Ti === void 0 && (Ti = ls("canvas")), Ti.width = t.width, Ti.height = t.height;
      const r = Ti.getContext("2d");
      t instanceof ImageData ? r.putImageData(t, 0, 0) : r.drawImage(t, 0, 0, t.width, t.height), n = Ti;
    }
    return n.toDataURL(e);
  }
  /**
   * Converts the given sRGB image data to linear color space.
   *
   * @param {(HTMLImageElement|HTMLCanvasElement|ImageBitmap|Object)} image - The image object.
   * @return {HTMLCanvasElement|Object} The converted image.
   */
  static sRGBToLinear(t) {
    if (typeof HTMLImageElement < "u" && t instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && t instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && t instanceof ImageBitmap) {
      const e = ls("canvas");
      e.width = t.width, e.height = t.height;
      const n = e.getContext("2d");
      n.drawImage(t, 0, 0, t.width, t.height);
      const r = n.getImageData(0, 0, t.width, t.height), s = r.data;
      for (let a = 0; a < s.length; a++)
        s[a] = Gn(s[a] / 255) * 255;
      return n.putImageData(r, 0, 0), e;
    } else if (t.data) {
      const e = t.data.slice(0);
      for (let n = 0; n < e.length; n++)
        e instanceof Uint8Array || e instanceof Uint8ClampedArray ? e[n] = Math.floor(Gn(e[n] / 255) * 255) : e[n] = Gn(e[n]);
      return {
        data: e,
        width: t.width,
        height: t.height
      };
    } else
      return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), t;
  }
}
let ld = 0;
class ro {
  /**
   * Constructs a new video texture.
   *
   * @param {any} [data=null] - The data definition of a texture.
   */
  constructor(t = null) {
    this.isSource = !0, Object.defineProperty(this, "id", { value: ld++ }), this.uuid = Qi(), this.data = t, this.dataReady = !0, this.version = 0;
  }
  /**
   * Returns the dimensions of the source into the given target vector.
   *
   * @param {(Vector2|Vector3)} target - The target object the result is written into.
   * @return {(Vector2|Vector3)} The dimensions of the source.
   */
  getSize(t) {
    const e = this.data;
    return typeof HTMLVideoElement < "u" && e instanceof HTMLVideoElement ? t.set(e.videoWidth, e.videoHeight, 0) : e instanceof VideoFrame ? t.set(e.displayHeight, e.displayWidth, 0) : e !== null ? t.set(e.width, e.height, e.depth || 0) : t.set(0, 0, 0), t;
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
  set needsUpdate(t) {
    t === !0 && this.version++;
  }
  /**
   * Serializes the source into JSON.
   *
   * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
   * @return {Object} A JSON object representing the serialized source.
   * @see {@link ObjectLoader#parse}
   */
  toJSON(t) {
    const e = t === void 0 || typeof t == "string";
    if (!e && t.images[this.uuid] !== void 0)
      return t.images[this.uuid];
    const n = {
      uuid: this.uuid,
      url: ""
    }, r = this.data;
    if (r !== null) {
      let s;
      if (Array.isArray(r)) {
        s = [];
        for (let a = 0, o = r.length; a < o; a++)
          r[a].isDataTexture ? s.push(Es(r[a].image)) : s.push(Es(r[a]));
      } else
        s = Es(r);
      n.url = s;
    }
    return e || (t.images[this.uuid] = n), n;
  }
}
function Es(i) {
  return typeof HTMLImageElement < "u" && i instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && i instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && i instanceof ImageBitmap ? od.getDataURL(i) : i.data ? {
    data: Array.from(i.data),
    width: i.width,
    height: i.height,
    type: i.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let cd = 0;
const bs = /* @__PURE__ */ new I();
class $e extends yi {
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
  constructor(t = $e.DEFAULT_IMAGE, e = $e.DEFAULT_MAPPING, n = pi, r = pi, s = bn, a = mi, o = _n, l = Pn, c = $e.DEFAULT_ANISOTROPY, h = Kn) {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: cd++ }), this.uuid = Qi(), this.name = "", this.source = new ro(t), this.mipmaps = [], this.mapping = e, this.channel = 0, this.wrapS = n, this.wrapT = r, this.magFilter = s, this.minFilter = a, this.anisotropy = c, this.format = o, this.internalFormat = null, this.type = l, this.offset = new It(0, 0), this.repeat = new It(1, 1), this.center = new It(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new zt(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.updateRanges = [], this.version = 0, this.onUpdate = null, this.renderTarget = null, this.isRenderTargetTexture = !1, this.isArrayTexture = !!(t && t.depth && t.depth > 1), this.pmremVersion = 0;
  }
  /**
   * The width of the texture in pixels.
   */
  get width() {
    return this.source.getSize(bs).x;
  }
  /**
   * The height of the texture in pixels.
   */
  get height() {
    return this.source.getSize(bs).y;
  }
  /**
   * The depth of the texture in pixels.
   */
  get depth() {
    return this.source.getSize(bs).z;
  }
  /**
   * The image object holding the texture data.
   *
   * @type {?Object}
   */
  get image() {
    return this.source.data;
  }
  set image(t = null) {
    this.source.data = t;
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
  addUpdateRange(t, e) {
    this.updateRanges.push({ start: t, count: e });
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
  copy(t) {
    return this.name = t.name, this.source = t.source, this.mipmaps = t.mipmaps.slice(0), this.mapping = t.mapping, this.channel = t.channel, this.wrapS = t.wrapS, this.wrapT = t.wrapT, this.magFilter = t.magFilter, this.minFilter = t.minFilter, this.anisotropy = t.anisotropy, this.format = t.format, this.internalFormat = t.internalFormat, this.type = t.type, this.offset.copy(t.offset), this.repeat.copy(t.repeat), this.center.copy(t.center), this.rotation = t.rotation, this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrix.copy(t.matrix), this.generateMipmaps = t.generateMipmaps, this.premultiplyAlpha = t.premultiplyAlpha, this.flipY = t.flipY, this.unpackAlignment = t.unpackAlignment, this.colorSpace = t.colorSpace, this.renderTarget = t.renderTarget, this.isRenderTargetTexture = t.isRenderTargetTexture, this.isArrayTexture = t.isArrayTexture, this.userData = JSON.parse(JSON.stringify(t.userData)), this.needsUpdate = !0, this;
  }
  /**
   * Sets this texture's properties based on `values`.
   * @param {Object} values - A container with texture parameters.
   */
  setValues(t) {
    for (const e in t) {
      const n = t[e];
      if (n === void 0) {
        console.warn(`THREE.Texture.setValues(): parameter '${e}' has value of undefined.`);
        continue;
      }
      const r = this[e];
      if (r === void 0) {
        console.warn(`THREE.Texture.setValues(): property '${e}' does not exist.`);
        continue;
      }
      r && n && r.isVector2 && n.isVector2 || r && n && r.isVector3 && n.isVector3 || r && n && r.isMatrix3 && n.isMatrix3 ? r.copy(n) : this[e] = n;
    }
  }
  /**
   * Serializes the texture into JSON.
   *
   * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
   * @return {Object} A JSON object representing the serialized texture.
   * @see {@link ObjectLoader#parse}
   */
  toJSON(t) {
    const e = t === void 0 || typeof t == "string";
    if (!e && t.textures[this.uuid] !== void 0)
      return t.textures[this.uuid];
    const n = {
      metadata: {
        version: 4.7,
        type: "Texture",
        generator: "Texture.toJSON"
      },
      uuid: this.uuid,
      name: this.name,
      image: this.source.toJSON(t).uuid,
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
    return Object.keys(this.userData).length > 0 && (n.userData = this.userData), e || (t.textures[this.uuid] = n), n;
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
  transformUv(t) {
    if (this.mapping !== $l) return t;
    if (t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1)
      switch (this.wrapS) {
        case fa:
          t.x = t.x - Math.floor(t.x);
          break;
        case pi:
          t.x = t.x < 0 ? 0 : 1;
          break;
        case pa:
          Math.abs(Math.floor(t.x) % 2) === 1 ? t.x = Math.ceil(t.x) - t.x : t.x = t.x - Math.floor(t.x);
          break;
      }
    if (t.y < 0 || t.y > 1)
      switch (this.wrapT) {
        case fa:
          t.y = t.y - Math.floor(t.y);
          break;
        case pi:
          t.y = t.y < 0 ? 0 : 1;
          break;
        case pa:
          Math.abs(Math.floor(t.y) % 2) === 1 ? t.y = Math.ceil(t.y) - t.y : t.y = t.y - Math.floor(t.y);
          break;
      }
    return this.flipY && (t.y = 1 - t.y), t;
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
  set needsUpdate(t) {
    t === !0 && (this.version++, this.source.needsUpdate = !0);
  }
  /**
   * Setting this property to `true` indicates the engine the PMREM
   * must be regenerated.
   *
   * @type {boolean}
   * @default false
   * @param {boolean} value
   */
  set needsPMREMUpdate(t) {
    t === !0 && this.pmremVersion++;
  }
}
$e.DEFAULT_IMAGE = null;
$e.DEFAULT_MAPPING = $l;
$e.DEFAULT_ANISOTROPY = 1;
class ve {
  /**
   * Constructs a new 4D vector.
   *
   * @param {number} [x=0] - The x value of this vector.
   * @param {number} [y=0] - The y value of this vector.
   * @param {number} [z=0] - The z value of this vector.
   * @param {number} [w=1] - The w value of this vector.
   */
  constructor(t = 0, e = 0, n = 0, r = 1) {
    ve.prototype.isVector4 = !0, this.x = t, this.y = e, this.z = n, this.w = r;
  }
  /**
   * Alias for {@link Vector4#z}.
   *
   * @type {number}
   */
  get width() {
    return this.z;
  }
  set width(t) {
    this.z = t;
  }
  /**
   * Alias for {@link Vector4#w}.
   *
   * @type {number}
   */
  get height() {
    return this.w;
  }
  set height(t) {
    this.w = t;
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
  set(t, e, n, r) {
    return this.x = t, this.y = e, this.z = n, this.w = r, this;
  }
  /**
   * Sets the vector components to the same value.
   *
   * @param {number} scalar - The value to set for all vector components.
   * @return {Vector4} A reference to this vector.
   */
  setScalar(t) {
    return this.x = t, this.y = t, this.z = t, this.w = t, this;
  }
  /**
   * Sets the vector's x component to the given value
   *
   * @param {number} x - The value to set.
   * @return {Vector4} A reference to this vector.
   */
  setX(t) {
    return this.x = t, this;
  }
  /**
   * Sets the vector's y component to the given value
   *
   * @param {number} y - The value to set.
   * @return {Vector4} A reference to this vector.
   */
  setY(t) {
    return this.y = t, this;
  }
  /**
   * Sets the vector's z component to the given value
   *
   * @param {number} z - The value to set.
   * @return {Vector4} A reference to this vector.
   */
  setZ(t) {
    return this.z = t, this;
  }
  /**
   * Sets the vector's w component to the given value
   *
   * @param {number} w - The value to set.
   * @return {Vector4} A reference to this vector.
   */
  setW(t) {
    return this.w = t, this;
  }
  /**
   * Allows to set a vector component with an index.
   *
   * @param {number} index - The component index. `0` equals to x, `1` equals to y,
   * `2` equals to z, `3` equals to w.
   * @param {number} value - The value to set.
   * @return {Vector4} A reference to this vector.
   */
  setComponent(t, e) {
    switch (t) {
      case 0:
        this.x = e;
        break;
      case 1:
        this.y = e;
        break;
      case 2:
        this.z = e;
        break;
      case 3:
        this.w = e;
        break;
      default:
        throw new Error("index is out of range: " + t);
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
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("index is out of range: " + t);
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
  copy(t) {
    return this.x = t.x, this.y = t.y, this.z = t.z, this.w = t.w !== void 0 ? t.w : 1, this;
  }
  /**
   * Adds the given vector to this instance.
   *
   * @param {Vector4} v - The vector to add.
   * @return {Vector4} A reference to this vector.
   */
  add(t) {
    return this.x += t.x, this.y += t.y, this.z += t.z, this.w += t.w, this;
  }
  /**
   * Adds the given scalar value to all components of this instance.
   *
   * @param {number} s - The scalar to add.
   * @return {Vector4} A reference to this vector.
   */
  addScalar(t) {
    return this.x += t, this.y += t, this.z += t, this.w += t, this;
  }
  /**
   * Adds the given vectors and stores the result in this instance.
   *
   * @param {Vector4} a - The first vector.
   * @param {Vector4} b - The second vector.
   * @return {Vector4} A reference to this vector.
   */
  addVectors(t, e) {
    return this.x = t.x + e.x, this.y = t.y + e.y, this.z = t.z + e.z, this.w = t.w + e.w, this;
  }
  /**
   * Adds the given vector scaled by the given factor to this instance.
   *
   * @param {Vector4} v - The vector.
   * @param {number} s - The factor that scales `v`.
   * @return {Vector4} A reference to this vector.
   */
  addScaledVector(t, e) {
    return this.x += t.x * e, this.y += t.y * e, this.z += t.z * e, this.w += t.w * e, this;
  }
  /**
   * Subtracts the given vector from this instance.
   *
   * @param {Vector4} v - The vector to subtract.
   * @return {Vector4} A reference to this vector.
   */
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this.z -= t.z, this.w -= t.w, this;
  }
  /**
   * Subtracts the given scalar value from all components of this instance.
   *
   * @param {number} s - The scalar to subtract.
   * @return {Vector4} A reference to this vector.
   */
  subScalar(t) {
    return this.x -= t, this.y -= t, this.z -= t, this.w -= t, this;
  }
  /**
   * Subtracts the given vectors and stores the result in this instance.
   *
   * @param {Vector4} a - The first vector.
   * @param {Vector4} b - The second vector.
   * @return {Vector4} A reference to this vector.
   */
  subVectors(t, e) {
    return this.x = t.x - e.x, this.y = t.y - e.y, this.z = t.z - e.z, this.w = t.w - e.w, this;
  }
  /**
   * Multiplies the given vector with this instance.
   *
   * @param {Vector4} v - The vector to multiply.
   * @return {Vector4} A reference to this vector.
   */
  multiply(t) {
    return this.x *= t.x, this.y *= t.y, this.z *= t.z, this.w *= t.w, this;
  }
  /**
   * Multiplies the given scalar value with all components of this instance.
   *
   * @param {number} scalar - The scalar to multiply.
   * @return {Vector4} A reference to this vector.
   */
  multiplyScalar(t) {
    return this.x *= t, this.y *= t, this.z *= t, this.w *= t, this;
  }
  /**
   * Multiplies this vector with the given 4x4 matrix.
   *
   * @param {Matrix4} m - The 4x4 matrix.
   * @return {Vector4} A reference to this vector.
   */
  applyMatrix4(t) {
    const e = this.x, n = this.y, r = this.z, s = this.w, a = t.elements;
    return this.x = a[0] * e + a[4] * n + a[8] * r + a[12] * s, this.y = a[1] * e + a[5] * n + a[9] * r + a[13] * s, this.z = a[2] * e + a[6] * n + a[10] * r + a[14] * s, this.w = a[3] * e + a[7] * n + a[11] * r + a[15] * s, this;
  }
  /**
   * Divides this instance by the given vector.
   *
   * @param {Vector4} v - The vector to divide.
   * @return {Vector4} A reference to this vector.
   */
  divide(t) {
    return this.x /= t.x, this.y /= t.y, this.z /= t.z, this.w /= t.w, this;
  }
  /**
   * Divides this vector by the given scalar.
   *
   * @param {number} scalar - The scalar to divide.
   * @return {Vector4} A reference to this vector.
   */
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  /**
   * Sets the x, y and z components of this
   * vector to the quaternion's axis and w to the angle.
   *
   * @param {Quaternion} q - The Quaternion to set.
   * @return {Vector4} A reference to this vector.
   */
  setAxisAngleFromQuaternion(t) {
    this.w = 2 * Math.acos(t.w);
    const e = Math.sqrt(1 - t.w * t.w);
    return e < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = t.x / e, this.y = t.y / e, this.z = t.z / e), this;
  }
  /**
   * Sets the x, y and z components of this
   * vector to the axis of rotation and w to the angle.
   *
   * @param {Matrix4} m - A 4x4 matrix of which the upper left 3x3 matrix is a pure rotation matrix.
   * @return {Vector4} A reference to this vector.
   */
  setAxisAngleFromRotationMatrix(t) {
    let e, n, r, s;
    const l = t.elements, c = l[0], h = l[4], d = l[8], f = l[1], p = l[5], g = l[9], _ = l[2], m = l[6], u = l[10];
    if (Math.abs(h - f) < 0.01 && Math.abs(d - _) < 0.01 && Math.abs(g - m) < 0.01) {
      if (Math.abs(h + f) < 0.1 && Math.abs(d + _) < 0.1 && Math.abs(g + m) < 0.1 && Math.abs(c + p + u - 3) < 0.1)
        return this.set(1, 0, 0, 0), this;
      e = Math.PI;
      const b = (c + 1) / 2, y = (p + 1) / 2, w = (u + 1) / 2, R = (h + f) / 4, C = (d + _) / 4, F = (g + m) / 4;
      return b > y && b > w ? b < 0.01 ? (n = 0, r = 0.707106781, s = 0.707106781) : (n = Math.sqrt(b), r = R / n, s = C / n) : y > w ? y < 0.01 ? (n = 0.707106781, r = 0, s = 0.707106781) : (r = Math.sqrt(y), n = R / r, s = F / r) : w < 0.01 ? (n = 0.707106781, r = 0.707106781, s = 0) : (s = Math.sqrt(w), n = C / s, r = F / s), this.set(n, r, s, e), this;
    }
    let T = Math.sqrt((m - g) * (m - g) + (d - _) * (d - _) + (f - h) * (f - h));
    return Math.abs(T) < 1e-3 && (T = 1), this.x = (m - g) / T, this.y = (d - _) / T, this.z = (f - h) / T, this.w = Math.acos((c + p + u - 1) / 2), this;
  }
  /**
   * Sets the vector components to the position elements of the
   * given transformation matrix.
   *
   * @param {Matrix4} m - The 4x4 matrix.
   * @return {Vector4} A reference to this vector.
   */
  setFromMatrixPosition(t) {
    const e = t.elements;
    return this.x = e[12], this.y = e[13], this.z = e[14], this.w = e[15], this;
  }
  /**
   * If this vector's x, y, z or w value is greater than the given vector's x, y, z or w
   * value, replace that value with the corresponding min value.
   *
   * @param {Vector4} v - The vector.
   * @return {Vector4} A reference to this vector.
   */
  min(t) {
    return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), this.w = Math.min(this.w, t.w), this;
  }
  /**
   * If this vector's x, y, z or w value is less than the given vector's x, y, z or w
   * value, replace that value with the corresponding max value.
   *
   * @param {Vector4} v - The vector.
   * @return {Vector4} A reference to this vector.
   */
  max(t) {
    return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), this.w = Math.max(this.w, t.w), this;
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
  clamp(t, e) {
    return this.x = Gt(this.x, t.x, e.x), this.y = Gt(this.y, t.y, e.y), this.z = Gt(this.z, t.z, e.z), this.w = Gt(this.w, t.w, e.w), this;
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
  clampScalar(t, e) {
    return this.x = Gt(this.x, t, e), this.y = Gt(this.y, t, e), this.z = Gt(this.z, t, e), this.w = Gt(this.w, t, e), this;
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
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Gt(n, t, e));
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
  dot(t) {
    return this.x * t.x + this.y * t.y + this.z * t.z + this.w * t.w;
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
  setLength(t) {
    return this.normalize().multiplyScalar(t);
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
  lerp(t, e) {
    return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this.z += (t.z - this.z) * e, this.w += (t.w - this.w) * e, this;
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
  lerpVectors(t, e, n) {
    return this.x = t.x + (e.x - t.x) * n, this.y = t.y + (e.y - t.y) * n, this.z = t.z + (e.z - t.z) * n, this.w = t.w + (e.w - t.w) * n, this;
  }
  /**
   * Returns `true` if this vector is equal with the given one.
   *
   * @param {Vector4} v - The vector to test for equality.
   * @return {boolean} Whether this vector is equal with the given one.
   */
  equals(t) {
    return t.x === this.x && t.y === this.y && t.z === this.z && t.w === this.w;
  }
  /**
   * Sets this vector's x value to be `array[ offset ]`, y value to be `array[ offset + 1 ]`,
   * z value to be `array[ offset + 2 ]`, w value to be `array[ offset + 3 ]`.
   *
   * @param {Array<number>} array - An array holding the vector component values.
   * @param {number} [offset=0] - The offset into the array.
   * @return {Vector4} A reference to this vector.
   */
  fromArray(t, e = 0) {
    return this.x = t[e], this.y = t[e + 1], this.z = t[e + 2], this.w = t[e + 3], this;
  }
  /**
   * Writes the components of this vector to the given array. If no array is provided,
   * the method returns a new instance.
   *
   * @param {Array<number>} [array=[]] - The target array holding the vector components.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Array<number>} The vector components.
   */
  toArray(t = [], e = 0) {
    return t[e] = this.x, t[e + 1] = this.y, t[e + 2] = this.z, t[e + 3] = this.w, t;
  }
  /**
   * Sets the components of this vector from the given buffer attribute.
   *
   * @param {BufferAttribute} attribute - The buffer attribute holding vector data.
   * @param {number} index - The index into the attribute.
   * @return {Vector4} A reference to this vector.
   */
  fromBufferAttribute(t, e) {
    return this.x = t.getX(e), this.y = t.getY(e), this.z = t.getZ(e), this.w = t.getW(e), this;
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
class hd extends yi {
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
  constructor(t = 1, e = 1, n = {}) {
    super(), n = Object.assign({
      generateMipmaps: !1,
      internalFormat: null,
      minFilter: bn,
      depthBuffer: !0,
      stencilBuffer: !1,
      resolveDepthBuffer: !0,
      resolveStencilBuffer: !0,
      depthTexture: null,
      samples: 0,
      count: 1,
      depth: 1,
      multiview: !1
    }, n), this.isRenderTarget = !0, this.width = t, this.height = e, this.depth = n.depth, this.scissor = new ve(0, 0, t, e), this.scissorTest = !1, this.viewport = new ve(0, 0, t, e);
    const r = { width: t, height: e, depth: n.depth }, s = new $e(r);
    this.textures = [];
    const a = n.count;
    for (let o = 0; o < a; o++)
      this.textures[o] = s.clone(), this.textures[o].isRenderTargetTexture = !0, this.textures[o].renderTarget = this;
    this._setTextureOptions(n), this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.resolveDepthBuffer = n.resolveDepthBuffer, this.resolveStencilBuffer = n.resolveStencilBuffer, this._depthTexture = null, this.depthTexture = n.depthTexture, this.samples = n.samples, this.multiview = n.multiview;
  }
  _setTextureOptions(t = {}) {
    const e = {
      minFilter: bn,
      generateMipmaps: !1,
      flipY: !1,
      internalFormat: null
    };
    t.mapping !== void 0 && (e.mapping = t.mapping), t.wrapS !== void 0 && (e.wrapS = t.wrapS), t.wrapT !== void 0 && (e.wrapT = t.wrapT), t.wrapR !== void 0 && (e.wrapR = t.wrapR), t.magFilter !== void 0 && (e.magFilter = t.magFilter), t.minFilter !== void 0 && (e.minFilter = t.minFilter), t.format !== void 0 && (e.format = t.format), t.type !== void 0 && (e.type = t.type), t.anisotropy !== void 0 && (e.anisotropy = t.anisotropy), t.colorSpace !== void 0 && (e.colorSpace = t.colorSpace), t.flipY !== void 0 && (e.flipY = t.flipY), t.generateMipmaps !== void 0 && (e.generateMipmaps = t.generateMipmaps), t.internalFormat !== void 0 && (e.internalFormat = t.internalFormat);
    for (let n = 0; n < this.textures.length; n++)
      this.textures[n].setValues(e);
  }
  /**
   * The texture representing the default color attachment.
   *
   * @type {Texture}
   */
  get texture() {
    return this.textures[0];
  }
  set texture(t) {
    this.textures[0] = t;
  }
  set depthTexture(t) {
    this._depthTexture !== null && (this._depthTexture.renderTarget = null), t !== null && (t.renderTarget = this), this._depthTexture = t;
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
  setSize(t, e, n = 1) {
    if (this.width !== t || this.height !== e || this.depth !== n) {
      this.width = t, this.height = e, this.depth = n;
      for (let r = 0, s = this.textures.length; r < s; r++)
        this.textures[r].image.width = t, this.textures[r].image.height = e, this.textures[r].image.depth = n, this.textures[r].isArrayTexture = this.textures[r].image.depth > 1;
      this.dispose();
    }
    this.viewport.set(0, 0, t, e), this.scissor.set(0, 0, t, e);
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
  copy(t) {
    this.width = t.width, this.height = t.height, this.depth = t.depth, this.scissor.copy(t.scissor), this.scissorTest = t.scissorTest, this.viewport.copy(t.viewport), this.textures.length = 0;
    for (let e = 0, n = t.textures.length; e < n; e++) {
      this.textures[e] = t.textures[e].clone(), this.textures[e].isRenderTargetTexture = !0, this.textures[e].renderTarget = this;
      const r = Object.assign({}, t.textures[e].image);
      this.textures[e].source = new ro(r);
    }
    return this.depthBuffer = t.depthBuffer, this.stencilBuffer = t.stencilBuffer, this.resolveDepthBuffer = t.resolveDepthBuffer, this.resolveStencilBuffer = t.resolveStencilBuffer, t.depthTexture !== null && (this.depthTexture = t.depthTexture.clone()), this.samples = t.samples, this;
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
class xi extends hd {
  /**
   * Constructs a new 3D render target.
   *
   * @param {number} [width=1] - The width of the render target.
   * @param {number} [height=1] - The height of the render target.
   * @param {RenderTarget~Options} [options] - The configuration object.
   */
  constructor(t = 1, e = 1, n = {}) {
    super(t, e, n), this.isWebGLRenderTarget = !0;
  }
}
class sc extends $e {
  /**
   * Constructs a new data array texture.
   *
   * @param {?TypedArray} [data=null] - The buffer data.
   * @param {number} [width=1] - The width of the texture.
   * @param {number} [height=1] - The height of the texture.
   * @param {number} [depth=1] - The depth of the texture.
   */
  constructor(t = null, e = 1, n = 1, r = 1) {
    super(null), this.isDataArrayTexture = !0, this.image = { data: t, width: e, height: n, depth: r }, this.magFilter = vn, this.minFilter = vn, this.wrapR = pi, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
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
  addLayerUpdate(t) {
    this.layerUpdates.add(t);
  }
  /**
   * Resets the layer updates registry.
   */
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
}
class dd extends $e {
  /**
   * Constructs a new data array texture.
   *
   * @param {?TypedArray} [data=null] - The buffer data.
   * @param {number} [width=1] - The width of the texture.
   * @param {number} [height=1] - The height of the texture.
   * @param {number} [depth=1] - The depth of the texture.
   */
  constructor(t = null, e = 1, n = 1, r = 1) {
    super(null), this.isData3DTexture = !0, this.image = { data: t, width: e, height: n, depth: r }, this.magFilter = vn, this.minFilter = vn, this.wrapR = pi, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
class tr {
  /**
   * Constructs a new bounding box.
   *
   * @param {Vector3} [min=(Infinity,Infinity,Infinity)] - A vector representing the lower boundary of the box.
   * @param {Vector3} [max=(-Infinity,-Infinity,-Infinity)] - A vector representing the upper boundary of the box.
   */
  constructor(t = new I(1 / 0, 1 / 0, 1 / 0), e = new I(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = !0, this.min = t, this.max = e;
  }
  /**
   * Sets the lower and upper boundaries of this box.
   * Please note that this method only copies the values from the given objects.
   *
   * @param {Vector3} min - The lower boundary of the box.
   * @param {Vector3} max - The upper boundary of the box.
   * @return {Box3} A reference to this bounding box.
   */
  set(t, e) {
    return this.min.copy(t), this.max.copy(e), this;
  }
  /**
   * Sets the upper and lower bounds of this box so it encloses the position data
   * in the given array.
   *
   * @param {Array<number>} array - An array holding 3D position data.
   * @return {Box3} A reference to this bounding box.
   */
  setFromArray(t) {
    this.makeEmpty();
    for (let e = 0, n = t.length; e < n; e += 3)
      this.expandByPoint(dn.fromArray(t, e));
    return this;
  }
  /**
   * Sets the upper and lower bounds of this box so it encloses the position data
   * in the given buffer attribute.
   *
   * @param {BufferAttribute} attribute - A buffer attribute holding 3D position data.
   * @return {Box3} A reference to this bounding box.
   */
  setFromBufferAttribute(t) {
    this.makeEmpty();
    for (let e = 0, n = t.count; e < n; e++)
      this.expandByPoint(dn.fromBufferAttribute(t, e));
    return this;
  }
  /**
   * Sets the upper and lower bounds of this box so it encloses the position data
   * in the given array.
   *
   * @param {Array<Vector3>} points - An array holding 3D position data as instances of {@link Vector3}.
   * @return {Box3} A reference to this bounding box.
   */
  setFromPoints(t) {
    this.makeEmpty();
    for (let e = 0, n = t.length; e < n; e++)
      this.expandByPoint(t[e]);
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
  setFromCenterAndSize(t, e) {
    const n = dn.copy(e).multiplyScalar(0.5);
    return this.min.copy(t).sub(n), this.max.copy(t).add(n), this;
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
  setFromObject(t, e = !1) {
    return this.makeEmpty(), this.expandByObject(t, e);
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
  copy(t) {
    return this.min.copy(t.min), this.max.copy(t.max), this;
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
  getCenter(t) {
    return this.isEmpty() ? t.set(0, 0, 0) : t.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  /**
   * Returns the dimensions of this box.
   *
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The size.
   */
  getSize(t) {
    return this.isEmpty() ? t.set(0, 0, 0) : t.subVectors(this.max, this.min);
  }
  /**
   * Expands the boundaries of this box to include the given point.
   *
   * @param {Vector3} point - The point that should be included by the bounding box.
   * @return {Box3} A reference to this bounding box.
   */
  expandByPoint(t) {
    return this.min.min(t), this.max.max(t), this;
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
  expandByVector(t) {
    return this.min.sub(t), this.max.add(t), this;
  }
  /**
   * Expands each dimension of the box by the given scalar. If negative, the
   * dimensions of the box will be contracted.
   *
   * @param {number} scalar - The scalar value that should expand the bounding box.
   * @return {Box3} A reference to this bounding box.
   */
  expandByScalar(t) {
    return this.min.addScalar(-t), this.max.addScalar(t), this;
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
  expandByObject(t, e = !1) {
    t.updateWorldMatrix(!1, !1);
    const n = t.geometry;
    if (n !== void 0) {
      const s = n.getAttribute("position");
      if (e === !0 && s !== void 0 && t.isInstancedMesh !== !0)
        for (let a = 0, o = s.count; a < o; a++)
          t.isMesh === !0 ? t.getVertexPosition(a, dn) : dn.fromBufferAttribute(s, a), dn.applyMatrix4(t.matrixWorld), this.expandByPoint(dn);
      else
        t.boundingBox !== void 0 ? (t.boundingBox === null && t.computeBoundingBox(), Cr.copy(t.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), Cr.copy(n.boundingBox)), Cr.applyMatrix4(t.matrixWorld), this.union(Cr);
    }
    const r = t.children;
    for (let s = 0, a = r.length; s < a; s++)
      this.expandByObject(r[s], e);
    return this;
  }
  /**
   * Returns `true` if the given point lies within or on the boundaries of this box.
   *
   * @param {Vector3} point - The point to test.
   * @return {boolean} Whether the bounding box contains the given point or not.
   */
  containsPoint(t) {
    return t.x >= this.min.x && t.x <= this.max.x && t.y >= this.min.y && t.y <= this.max.y && t.z >= this.min.z && t.z <= this.max.z;
  }
  /**
   * Returns `true` if this bounding box includes the entirety of the given bounding box.
   * If this box and the given one are identical, this function also returns `true`.
   *
   * @param {Box3} box - The bounding box to test.
   * @return {boolean} Whether the bounding box contains the given bounding box or not.
   */
  containsBox(t) {
    return this.min.x <= t.min.x && t.max.x <= this.max.x && this.min.y <= t.min.y && t.max.y <= this.max.y && this.min.z <= t.min.z && t.max.z <= this.max.z;
  }
  /**
   * Returns a point as a proportion of this box's width, height and depth.
   *
   * @param {Vector3} point - A point in 3D space.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} A point as a proportion of this box's width, height and depth.
   */
  getParameter(t, e) {
    return e.set(
      (t.x - this.min.x) / (this.max.x - this.min.x),
      (t.y - this.min.y) / (this.max.y - this.min.y),
      (t.z - this.min.z) / (this.max.z - this.min.z)
    );
  }
  /**
   * Returns `true` if the given bounding box intersects with this bounding box.
   *
   * @param {Box3} box - The bounding box to test.
   * @return {boolean} Whether the given bounding box intersects with this bounding box.
   */
  intersectsBox(t) {
    return t.max.x >= this.min.x && t.min.x <= this.max.x && t.max.y >= this.min.y && t.min.y <= this.max.y && t.max.z >= this.min.z && t.min.z <= this.max.z;
  }
  /**
   * Returns `true` if the given bounding sphere intersects with this bounding box.
   *
   * @param {Sphere} sphere - The bounding sphere to test.
   * @return {boolean} Whether the given bounding sphere intersects with this bounding box.
   */
  intersectsSphere(t) {
    return this.clampPoint(t.center, dn), dn.distanceToSquared(t.center) <= t.radius * t.radius;
  }
  /**
   * Returns `true` if the given plane intersects with this bounding box.
   *
   * @param {Plane} plane - The plane to test.
   * @return {boolean} Whether the given plane intersects with this bounding box.
   */
  intersectsPlane(t) {
    let e, n;
    return t.normal.x > 0 ? (e = t.normal.x * this.min.x, n = t.normal.x * this.max.x) : (e = t.normal.x * this.max.x, n = t.normal.x * this.min.x), t.normal.y > 0 ? (e += t.normal.y * this.min.y, n += t.normal.y * this.max.y) : (e += t.normal.y * this.max.y, n += t.normal.y * this.min.y), t.normal.z > 0 ? (e += t.normal.z * this.min.z, n += t.normal.z * this.max.z) : (e += t.normal.z * this.max.z, n += t.normal.z * this.min.z), e <= -t.constant && n >= -t.constant;
  }
  /**
   * Returns `true` if the given triangle intersects with this bounding box.
   *
   * @param {Triangle} triangle - The triangle to test.
   * @return {boolean} Whether the given triangle intersects with this bounding box.
   */
  intersectsTriangle(t) {
    if (this.isEmpty())
      return !1;
    this.getCenter(sr), Pr.subVectors(this.max, sr), wi.subVectors(t.a, sr), Ai.subVectors(t.b, sr), Ri.subVectors(t.c, sr), Wn.subVectors(Ai, wi), Xn.subVectors(Ri, Ai), ri.subVectors(wi, Ri);
    let e = [
      0,
      -Wn.z,
      Wn.y,
      0,
      -Xn.z,
      Xn.y,
      0,
      -ri.z,
      ri.y,
      Wn.z,
      0,
      -Wn.x,
      Xn.z,
      0,
      -Xn.x,
      ri.z,
      0,
      -ri.x,
      -Wn.y,
      Wn.x,
      0,
      -Xn.y,
      Xn.x,
      0,
      -ri.y,
      ri.x,
      0
    ];
    return !Ts(e, wi, Ai, Ri, Pr) || (e = [1, 0, 0, 0, 1, 0, 0, 0, 1], !Ts(e, wi, Ai, Ri, Pr)) ? !1 : (Dr.crossVectors(Wn, Xn), e = [Dr.x, Dr.y, Dr.z], Ts(e, wi, Ai, Ri, Pr));
  }
  /**
   * Clamps the given point within the bounds of this box.
   *
   * @param {Vector3} point - The point to clamp.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The clamped point.
   */
  clampPoint(t, e) {
    return e.copy(t).clamp(this.min, this.max);
  }
  /**
   * Returns the euclidean distance from any edge of this box to the specified point. If
   * the given point lies inside of this box, the distance will be `0`.
   *
   * @param {Vector3} point - The point to compute the distance to.
   * @return {number} The euclidean distance.
   */
  distanceToPoint(t) {
    return this.clampPoint(t, dn).distanceTo(t);
  }
  /**
   * Returns a bounding sphere that encloses this bounding box.
   *
   * @param {Sphere} target - The target sphere that is used to store the method's result.
   * @return {Sphere} The bounding sphere that encloses this bounding box.
   */
  getBoundingSphere(t) {
    return this.isEmpty() ? t.makeEmpty() : (this.getCenter(t.center), t.radius = this.getSize(dn).length() * 0.5), t;
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
  intersect(t) {
    return this.min.max(t.min), this.max.min(t.max), this.isEmpty() && this.makeEmpty(), this;
  }
  /**
   * Computes the union of this box and another and the given one, setting the upper
   * bound of this box to the greater of the two boxes' upper bounds and the
   * lower bound of this box to the lesser of the two boxes' lower bounds.
   *
   * @param {Box3} box - The bounding box that will be unioned with this instance.
   * @return {Box3} A reference to this bounding box.
   */
  union(t) {
    return this.min.min(t.min), this.max.max(t.max), this;
  }
  /**
   * Transforms this bounding box by the given 4x4 transformation matrix.
   *
   * @param {Matrix4} matrix - The transformation matrix.
   * @return {Box3} A reference to this bounding box.
   */
  applyMatrix4(t) {
    return this.isEmpty() ? this : (In[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(t), In[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(t), In[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(t), In[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(t), In[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(t), In[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(t), In[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(t), In[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(t), this.setFromPoints(In), this);
  }
  /**
   * Adds the given offset to both the upper and lower bounds of this bounding box,
   * effectively moving it in 3D space.
   *
   * @param {Vector3} offset - The offset that should be used to translate the bounding box.
   * @return {Box3} A reference to this bounding box.
   */
  translate(t) {
    return this.min.add(t), this.max.add(t), this;
  }
  /**
   * Returns `true` if this bounding box is equal with the given one.
   *
   * @param {Box3} box - The box to test for equality.
   * @return {boolean} Whether this bounding box is equal with the given one.
   */
  equals(t) {
    return t.min.equals(this.min) && t.max.equals(this.max);
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
  fromJSON(t) {
    return this.min.fromArray(t.min), this.max.fromArray(t.max), this;
  }
}
const In = [
  /* @__PURE__ */ new I(),
  /* @__PURE__ */ new I(),
  /* @__PURE__ */ new I(),
  /* @__PURE__ */ new I(),
  /* @__PURE__ */ new I(),
  /* @__PURE__ */ new I(),
  /* @__PURE__ */ new I(),
  /* @__PURE__ */ new I()
], dn = /* @__PURE__ */ new I(), Cr = /* @__PURE__ */ new tr(), wi = /* @__PURE__ */ new I(), Ai = /* @__PURE__ */ new I(), Ri = /* @__PURE__ */ new I(), Wn = /* @__PURE__ */ new I(), Xn = /* @__PURE__ */ new I(), ri = /* @__PURE__ */ new I(), sr = /* @__PURE__ */ new I(), Pr = /* @__PURE__ */ new I(), Dr = /* @__PURE__ */ new I(), si = /* @__PURE__ */ new I();
function Ts(i, t, e, n, r) {
  for (let s = 0, a = i.length - 3; s <= a; s += 3) {
    si.fromArray(i, s);
    const o = r.x * Math.abs(si.x) + r.y * Math.abs(si.y) + r.z * Math.abs(si.z), l = t.dot(si), c = e.dot(si), h = n.dot(si);
    if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > o)
      return !1;
  }
  return !0;
}
const ud = /* @__PURE__ */ new tr(), ar = /* @__PURE__ */ new I(), ws = /* @__PURE__ */ new I();
class ps {
  /**
   * Constructs a new sphere.
   *
   * @param {Vector3} [center=(0,0,0)] - The center of the sphere
   * @param {number} [radius=-1] - The radius of the sphere.
   */
  constructor(t = new I(), e = -1) {
    this.isSphere = !0, this.center = t, this.radius = e;
  }
  /**
   * Sets the sphere's components by copying the given values.
   *
   * @param {Vector3} center - The center.
   * @param {number} radius - The radius.
   * @return {Sphere} A reference to this sphere.
   */
  set(t, e) {
    return this.center.copy(t), this.radius = e, this;
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
  setFromPoints(t, e) {
    const n = this.center;
    e !== void 0 ? n.copy(e) : ud.setFromPoints(t).getCenter(n);
    let r = 0;
    for (let s = 0, a = t.length; s < a; s++)
      r = Math.max(r, n.distanceToSquared(t[s]));
    return this.radius = Math.sqrt(r), this;
  }
  /**
   * Copies the values of the given sphere to this instance.
   *
   * @param {Sphere} sphere - The sphere to copy.
   * @return {Sphere} A reference to this sphere.
   */
  copy(t) {
    return this.center.copy(t.center), this.radius = t.radius, this;
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
  containsPoint(t) {
    return t.distanceToSquared(this.center) <= this.radius * this.radius;
  }
  /**
   * Returns the closest distance from the boundary of the sphere to the
   * given point. If the sphere contains the point, the distance will
   * be negative.
   *
   * @param {Vector3} point - The point to compute the distance to.
   * @return {number} The distance to the point.
   */
  distanceToPoint(t) {
    return t.distanceTo(this.center) - this.radius;
  }
  /**
   * Returns `true` if this sphere intersects with the given one.
   *
   * @param {Sphere} sphere - The sphere to test.
   * @return {boolean} Whether this sphere intersects with the given one or not.
   */
  intersectsSphere(t) {
    const e = this.radius + t.radius;
    return t.center.distanceToSquared(this.center) <= e * e;
  }
  /**
   * Returns `true` if this sphere intersects with the given box.
   *
   * @param {Box3} box - The box to test.
   * @return {boolean} Whether this sphere intersects with the given box or not.
   */
  intersectsBox(t) {
    return t.intersectsSphere(this);
  }
  /**
   * Returns `true` if this sphere intersects with the given plane.
   *
   * @param {Plane} plane - The plane to test.
   * @return {boolean} Whether this sphere intersects with the given plane or not.
   */
  intersectsPlane(t) {
    return Math.abs(t.distanceToPoint(this.center)) <= this.radius;
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
  clampPoint(t, e) {
    const n = this.center.distanceToSquared(t);
    return e.copy(t), n > this.radius * this.radius && (e.sub(this.center).normalize(), e.multiplyScalar(this.radius).add(this.center)), e;
  }
  /**
   * Returns a bounding box that encloses this sphere.
   *
   * @param {Box3} target - The target box that is used to store the method's result.
   * @return {Box3} The bounding box that encloses this sphere.
   */
  getBoundingBox(t) {
    return this.isEmpty() ? (t.makeEmpty(), t) : (t.set(this.center, this.center), t.expandByScalar(this.radius), t);
  }
  /**
   * Transforms this sphere with the given 4x4 transformation matrix.
   *
   * @param {Matrix4} matrix - The transformation matrix.
   * @return {Sphere} A reference to this sphere.
   */
  applyMatrix4(t) {
    return this.center.applyMatrix4(t), this.radius = this.radius * t.getMaxScaleOnAxis(), this;
  }
  /**
   * Translates the sphere's center by the given offset.
   *
   * @param {Vector3} offset - The offset.
   * @return {Sphere} A reference to this sphere.
   */
  translate(t) {
    return this.center.add(t), this;
  }
  /**
   * Expands the boundaries of this sphere to include the given point.
   *
   * @param {Vector3} point - The point to include.
   * @return {Sphere} A reference to this sphere.
   */
  expandByPoint(t) {
    if (this.isEmpty())
      return this.center.copy(t), this.radius = 0, this;
    ar.subVectors(t, this.center);
    const e = ar.lengthSq();
    if (e > this.radius * this.radius) {
      const n = Math.sqrt(e), r = (n - this.radius) * 0.5;
      this.center.addScaledVector(ar, r / n), this.radius += r;
    }
    return this;
  }
  /**
   * Expands this sphere to enclose both the original sphere and the given sphere.
   *
   * @param {Sphere} sphere - The sphere to include.
   * @return {Sphere} A reference to this sphere.
   */
  union(t) {
    return t.isEmpty() ? this : this.isEmpty() ? (this.copy(t), this) : (this.center.equals(t.center) === !0 ? this.radius = Math.max(this.radius, t.radius) : (ws.subVectors(t.center, this.center).setLength(t.radius), this.expandByPoint(ar.copy(t.center).add(ws)), this.expandByPoint(ar.copy(t.center).sub(ws))), this);
  }
  /**
   * Returns `true` if this sphere is equal with the given one.
   *
   * @param {Sphere} sphere - The sphere to test for equality.
   * @return {boolean} Whether this bounding sphere is equal with the given one.
   */
  equals(t) {
    return t.center.equals(this.center) && t.radius === this.radius;
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
  fromJSON(t) {
    return this.radius = t.radius, this.center.fromArray(t.center), this;
  }
}
const Un = /* @__PURE__ */ new I(), As = /* @__PURE__ */ new I(), Lr = /* @__PURE__ */ new I(), $n = /* @__PURE__ */ new I(), Rs = /* @__PURE__ */ new I(), Ir = /* @__PURE__ */ new I(), Cs = /* @__PURE__ */ new I();
class ms {
  /**
   * Constructs a new ray.
   *
   * @param {Vector3} [origin=(0,0,0)] - The origin of the ray.
   * @param {Vector3} [direction=(0,0,-1)] - The (normalized) direction of the ray.
   */
  constructor(t = new I(), e = new I(0, 0, -1)) {
    this.origin = t, this.direction = e;
  }
  /**
   * Sets the ray's components by copying the given values.
   *
   * @param {Vector3} origin - The origin.
   * @param {Vector3} direction - The direction.
   * @return {Ray} A reference to this ray.
   */
  set(t, e) {
    return this.origin.copy(t), this.direction.copy(e), this;
  }
  /**
   * Copies the values of the given ray to this instance.
   *
   * @param {Ray} ray - The ray to copy.
   * @return {Ray} A reference to this ray.
   */
  copy(t) {
    return this.origin.copy(t.origin), this.direction.copy(t.direction), this;
  }
  /**
   * Returns a vector that is located at a given distance along this ray.
   *
   * @param {number} t - The distance along the ray to retrieve a position for.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} A position on the ray.
   */
  at(t, e) {
    return e.copy(this.origin).addScaledVector(this.direction, t);
  }
  /**
   * Adjusts the direction of the ray to point at the given vector in world space.
   *
   * @param {Vector3} v - The target position.
   * @return {Ray} A reference to this ray.
   */
  lookAt(t) {
    return this.direction.copy(t).sub(this.origin).normalize(), this;
  }
  /**
   * Shift the origin of this ray along its direction by the given distance.
   *
   * @param {number} t - The distance along the ray to interpolate.
   * @return {Ray} A reference to this ray.
   */
  recast(t) {
    return this.origin.copy(this.at(t, Un)), this;
  }
  /**
   * Returns the point along this ray that is closest to the given point.
   *
   * @param {Vector3} point - A point in 3D space to get the closet location on the ray for.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The closest point on this ray.
   */
  closestPointToPoint(t, e) {
    e.subVectors(t, this.origin);
    const n = e.dot(this.direction);
    return n < 0 ? e.copy(this.origin) : e.copy(this.origin).addScaledVector(this.direction, n);
  }
  /**
   * Returns the distance of the closest approach between this ray and the given point.
   *
   * @param {Vector3} point - A point in 3D space to compute the distance to.
   * @return {number} The distance.
   */
  distanceToPoint(t) {
    return Math.sqrt(this.distanceSqToPoint(t));
  }
  /**
   * Returns the squared distance of the closest approach between this ray and the given point.
   *
   * @param {Vector3} point - A point in 3D space to compute the distance to.
   * @return {number} The squared distance.
   */
  distanceSqToPoint(t) {
    const e = Un.subVectors(t, this.origin).dot(this.direction);
    return e < 0 ? this.origin.distanceToSquared(t) : (Un.copy(this.origin).addScaledVector(this.direction, e), Un.distanceToSquared(t));
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
  distanceSqToSegment(t, e, n, r) {
    As.copy(t).add(e).multiplyScalar(0.5), Lr.copy(e).sub(t).normalize(), $n.copy(this.origin).sub(As);
    const s = t.distanceTo(e) * 0.5, a = -this.direction.dot(Lr), o = $n.dot(this.direction), l = -$n.dot(Lr), c = $n.lengthSq(), h = Math.abs(1 - a * a);
    let d, f, p, g;
    if (h > 0)
      if (d = a * l - o, f = a * o - l, g = s * h, d >= 0)
        if (f >= -g)
          if (f <= g) {
            const _ = 1 / h;
            d *= _, f *= _, p = d * (d + a * f + 2 * o) + f * (a * d + f + 2 * l) + c;
          } else
            f = s, d = Math.max(0, -(a * f + o)), p = -d * d + f * (f + 2 * l) + c;
        else
          f = -s, d = Math.max(0, -(a * f + o)), p = -d * d + f * (f + 2 * l) + c;
      else
        f <= -g ? (d = Math.max(0, -(-a * s + o)), f = d > 0 ? -s : Math.min(Math.max(-s, -l), s), p = -d * d + f * (f + 2 * l) + c) : f <= g ? (d = 0, f = Math.min(Math.max(-s, -l), s), p = f * (f + 2 * l) + c) : (d = Math.max(0, -(a * s + o)), f = d > 0 ? s : Math.min(Math.max(-s, -l), s), p = -d * d + f * (f + 2 * l) + c);
    else
      f = a > 0 ? -s : s, d = Math.max(0, -(a * f + o)), p = -d * d + f * (f + 2 * l) + c;
    return n && n.copy(this.origin).addScaledVector(this.direction, d), r && r.copy(As).addScaledVector(Lr, f), p;
  }
  /**
   * Intersects this ray with the given sphere, returning the intersection
   * point or `null` if there is no intersection.
   *
   * @param {Sphere} sphere - The sphere to intersect.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {?Vector3} The intersection point.
   */
  intersectSphere(t, e) {
    Un.subVectors(t.center, this.origin);
    const n = Un.dot(this.direction), r = Un.dot(Un) - n * n, s = t.radius * t.radius;
    if (r > s) return null;
    const a = Math.sqrt(s - r), o = n - a, l = n + a;
    return l < 0 ? null : o < 0 ? this.at(l, e) : this.at(o, e);
  }
  /**
   * Returns `true` if this ray intersects with the given sphere.
   *
   * @param {Sphere} sphere - The sphere to intersect.
   * @return {boolean} Whether this ray intersects with the given sphere or not.
   */
  intersectsSphere(t) {
    return t.radius < 0 ? !1 : this.distanceSqToPoint(t.center) <= t.radius * t.radius;
  }
  /**
   * Computes the distance from the ray's origin to the given plane. Returns `null` if the ray
   * does not intersect with the plane.
   *
   * @param {Plane} plane - The plane to compute the distance to.
   * @return {?number} Whether this ray intersects with the given sphere or not.
   */
  distanceToPlane(t) {
    const e = t.normal.dot(this.direction);
    if (e === 0)
      return t.distanceToPoint(this.origin) === 0 ? 0 : null;
    const n = -(this.origin.dot(t.normal) + t.constant) / e;
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
  intersectPlane(t, e) {
    const n = this.distanceToPlane(t);
    return n === null ? null : this.at(n, e);
  }
  /**
   * Returns `true` if this ray intersects with the given plane.
   *
   * @param {Plane} plane - The plane to intersect.
   * @return {boolean} Whether this ray intersects with the given plane or not.
   */
  intersectsPlane(t) {
    const e = t.distanceToPoint(this.origin);
    return e === 0 || t.normal.dot(this.direction) * e < 0;
  }
  /**
   * Intersects this ray with the given bounding box, returning the intersection
   * point or `null` if there is no intersection.
   *
   * @param {Box3} box - The box to intersect.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {?Vector3} The intersection point.
   */
  intersectBox(t, e) {
    let n, r, s, a, o, l;
    const c = 1 / this.direction.x, h = 1 / this.direction.y, d = 1 / this.direction.z, f = this.origin;
    return c >= 0 ? (n = (t.min.x - f.x) * c, r = (t.max.x - f.x) * c) : (n = (t.max.x - f.x) * c, r = (t.min.x - f.x) * c), h >= 0 ? (s = (t.min.y - f.y) * h, a = (t.max.y - f.y) * h) : (s = (t.max.y - f.y) * h, a = (t.min.y - f.y) * h), n > a || s > r || ((s > n || isNaN(n)) && (n = s), (a < r || isNaN(r)) && (r = a), d >= 0 ? (o = (t.min.z - f.z) * d, l = (t.max.z - f.z) * d) : (o = (t.max.z - f.z) * d, l = (t.min.z - f.z) * d), n > l || o > r) || ((o > n || n !== n) && (n = o), (l < r || r !== r) && (r = l), r < 0) ? null : this.at(n >= 0 ? n : r, e);
  }
  /**
   * Returns `true` if this ray intersects with the given box.
   *
   * @param {Box3} box - The box to intersect.
   * @return {boolean} Whether this ray intersects with the given box or not.
   */
  intersectsBox(t) {
    return this.intersectBox(t, Un) !== null;
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
  intersectTriangle(t, e, n, r, s) {
    Rs.subVectors(e, t), Ir.subVectors(n, t), Cs.crossVectors(Rs, Ir);
    let a = this.direction.dot(Cs), o;
    if (a > 0) {
      if (r) return null;
      o = 1;
    } else if (a < 0)
      o = -1, a = -a;
    else
      return null;
    $n.subVectors(this.origin, t);
    const l = o * this.direction.dot(Ir.crossVectors($n, Ir));
    if (l < 0)
      return null;
    const c = o * this.direction.dot(Rs.cross($n));
    if (c < 0 || l + c > a)
      return null;
    const h = -o * $n.dot(Cs);
    return h < 0 ? null : this.at(h / a, s);
  }
  /**
   * Transforms this ray with the given 4x4 transformation matrix.
   *
   * @param {Matrix4} matrix4 - The transformation matrix.
   * @return {Ray} A reference to this ray.
   */
  applyMatrix4(t) {
    return this.origin.applyMatrix4(t), this.direction.transformDirection(t), this;
  }
  /**
   * Returns `true` if this ray is equal with the given one.
   *
   * @param {Ray} ray - The ray to test for equality.
   * @return {boolean} Whether this ray is equal with the given one.
   */
  equals(t) {
    return t.origin.equals(this.origin) && t.direction.equals(this.direction);
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
class le {
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
  constructor(t, e, n, r, s, a, o, l, c, h, d, f, p, g, _, m) {
    le.prototype.isMatrix4 = !0, this.elements = [
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
    ], t !== void 0 && this.set(t, e, n, r, s, a, o, l, c, h, d, f, p, g, _, m);
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
  set(t, e, n, r, s, a, o, l, c, h, d, f, p, g, _, m) {
    const u = this.elements;
    return u[0] = t, u[4] = e, u[8] = n, u[12] = r, u[1] = s, u[5] = a, u[9] = o, u[13] = l, u[2] = c, u[6] = h, u[10] = d, u[14] = f, u[3] = p, u[7] = g, u[11] = _, u[15] = m, this;
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
    return new le().fromArray(this.elements);
  }
  /**
   * Copies the values of the given matrix to this instance.
   *
   * @param {Matrix4} m - The matrix to copy.
   * @return {Matrix4} A reference to this matrix.
   */
  copy(t) {
    const e = this.elements, n = t.elements;
    return e[0] = n[0], e[1] = n[1], e[2] = n[2], e[3] = n[3], e[4] = n[4], e[5] = n[5], e[6] = n[6], e[7] = n[7], e[8] = n[8], e[9] = n[9], e[10] = n[10], e[11] = n[11], e[12] = n[12], e[13] = n[13], e[14] = n[14], e[15] = n[15], this;
  }
  /**
   * Copies the translation component of the given matrix
   * into this matrix's translation component.
   *
   * @param {Matrix4} m - The matrix to copy the translation component.
   * @return {Matrix4} A reference to this matrix.
   */
  copyPosition(t) {
    const e = this.elements, n = t.elements;
    return e[12] = n[12], e[13] = n[13], e[14] = n[14], this;
  }
  /**
   * Set the upper 3x3 elements of this matrix to the values of given 3x3 matrix.
   *
   * @param {Matrix3} m - The 3x3 matrix.
   * @return {Matrix4} A reference to this matrix.
   */
  setFromMatrix3(t) {
    const e = t.elements;
    return this.set(
      e[0],
      e[3],
      e[6],
      0,
      e[1],
      e[4],
      e[7],
      0,
      e[2],
      e[5],
      e[8],
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
  extractBasis(t, e, n) {
    return t.setFromMatrixColumn(this, 0), e.setFromMatrixColumn(this, 1), n.setFromMatrixColumn(this, 2), this;
  }
  /**
   * Sets the given basis vectors to this matrix.
   *
   * @param {Vector3} xAxis - The basis's x axis.
   * @param {Vector3} yAxis - The basis's y axis.
   * @param {Vector3} zAxis - The basis's z axis.
   * @return {Matrix4} A reference to this matrix.
   */
  makeBasis(t, e, n) {
    return this.set(
      t.x,
      e.x,
      n.x,
      0,
      t.y,
      e.y,
      n.y,
      0,
      t.z,
      e.z,
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
  extractRotation(t) {
    const e = this.elements, n = t.elements, r = 1 / Ci.setFromMatrixColumn(t, 0).length(), s = 1 / Ci.setFromMatrixColumn(t, 1).length(), a = 1 / Ci.setFromMatrixColumn(t, 2).length();
    return e[0] = n[0] * r, e[1] = n[1] * r, e[2] = n[2] * r, e[3] = 0, e[4] = n[4] * s, e[5] = n[5] * s, e[6] = n[6] * s, e[7] = 0, e[8] = n[8] * a, e[9] = n[9] * a, e[10] = n[10] * a, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
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
  makeRotationFromEuler(t) {
    const e = this.elements, n = t.x, r = t.y, s = t.z, a = Math.cos(n), o = Math.sin(n), l = Math.cos(r), c = Math.sin(r), h = Math.cos(s), d = Math.sin(s);
    if (t.order === "XYZ") {
      const f = a * h, p = a * d, g = o * h, _ = o * d;
      e[0] = l * h, e[4] = -l * d, e[8] = c, e[1] = p + g * c, e[5] = f - _ * c, e[9] = -o * l, e[2] = _ - f * c, e[6] = g + p * c, e[10] = a * l;
    } else if (t.order === "YXZ") {
      const f = l * h, p = l * d, g = c * h, _ = c * d;
      e[0] = f + _ * o, e[4] = g * o - p, e[8] = a * c, e[1] = a * d, e[5] = a * h, e[9] = -o, e[2] = p * o - g, e[6] = _ + f * o, e[10] = a * l;
    } else if (t.order === "ZXY") {
      const f = l * h, p = l * d, g = c * h, _ = c * d;
      e[0] = f - _ * o, e[4] = -a * d, e[8] = g + p * o, e[1] = p + g * o, e[5] = a * h, e[9] = _ - f * o, e[2] = -a * c, e[6] = o, e[10] = a * l;
    } else if (t.order === "ZYX") {
      const f = a * h, p = a * d, g = o * h, _ = o * d;
      e[0] = l * h, e[4] = g * c - p, e[8] = f * c + _, e[1] = l * d, e[5] = _ * c + f, e[9] = p * c - g, e[2] = -c, e[6] = o * l, e[10] = a * l;
    } else if (t.order === "YZX") {
      const f = a * l, p = a * c, g = o * l, _ = o * c;
      e[0] = l * h, e[4] = _ - f * d, e[8] = g * d + p, e[1] = d, e[5] = a * h, e[9] = -o * h, e[2] = -c * h, e[6] = p * d + g, e[10] = f - _ * d;
    } else if (t.order === "XZY") {
      const f = a * l, p = a * c, g = o * l, _ = o * c;
      e[0] = l * h, e[4] = -d, e[8] = c * h, e[1] = f * d + _, e[5] = a * h, e[9] = p * d - g, e[2] = g * d - p, e[6] = o * h, e[10] = _ * d + f;
    }
    return e[3] = 0, e[7] = 0, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
  }
  /**
   * Sets the rotation component of this matrix to the rotation specified by
   * the given Quaternion as outlined [here]{@link https://en.wikipedia.org/wiki/Rotation_matrix#Quaternion}
   * The rest of the matrix is set to the identity.
   *
   * @param {Quaternion} q - The Quaternion.
   * @return {Matrix4} A reference to this matrix.
   */
  makeRotationFromQuaternion(t) {
    return this.compose(fd, t, pd);
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
  lookAt(t, e, n) {
    const r = this.elements;
    return Qe.subVectors(t, e), Qe.lengthSq() === 0 && (Qe.z = 1), Qe.normalize(), qn.crossVectors(n, Qe), qn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? Qe.x += 1e-4 : Qe.z += 1e-4, Qe.normalize(), qn.crossVectors(n, Qe)), qn.normalize(), Ur.crossVectors(Qe, qn), r[0] = qn.x, r[4] = Ur.x, r[8] = Qe.x, r[1] = qn.y, r[5] = Ur.y, r[9] = Qe.y, r[2] = qn.z, r[6] = Ur.z, r[10] = Qe.z, this;
  }
  /**
   * Post-multiplies this matrix by the given 4x4 matrix.
   *
   * @param {Matrix4} m - The matrix to multiply with.
   * @return {Matrix4} A reference to this matrix.
   */
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
  /**
   * Pre-multiplies this matrix by the given 4x4 matrix.
   *
   * @param {Matrix4} m - The matrix to multiply with.
   * @return {Matrix4} A reference to this matrix.
   */
  premultiply(t) {
    return this.multiplyMatrices(t, this);
  }
  /**
   * Multiples the given 4x4 matrices and stores the result
   * in this matrix.
   *
   * @param {Matrix4} a - The first matrix.
   * @param {Matrix4} b - The second matrix.
   * @return {Matrix4} A reference to this matrix.
   */
  multiplyMatrices(t, e) {
    const n = t.elements, r = e.elements, s = this.elements, a = n[0], o = n[4], l = n[8], c = n[12], h = n[1], d = n[5], f = n[9], p = n[13], g = n[2], _ = n[6], m = n[10], u = n[14], T = n[3], b = n[7], y = n[11], w = n[15], R = r[0], C = r[4], F = r[8], M = r[12], S = r[1], P = r[5], V = r[9], X = r[13], U = r[2], k = r[6], H = r[10], B = r[14], D = r[3], j = r[7], at = r[11], dt = r[15];
    return s[0] = a * R + o * S + l * U + c * D, s[4] = a * C + o * P + l * k + c * j, s[8] = a * F + o * V + l * H + c * at, s[12] = a * M + o * X + l * B + c * dt, s[1] = h * R + d * S + f * U + p * D, s[5] = h * C + d * P + f * k + p * j, s[9] = h * F + d * V + f * H + p * at, s[13] = h * M + d * X + f * B + p * dt, s[2] = g * R + _ * S + m * U + u * D, s[6] = g * C + _ * P + m * k + u * j, s[10] = g * F + _ * V + m * H + u * at, s[14] = g * M + _ * X + m * B + u * dt, s[3] = T * R + b * S + y * U + w * D, s[7] = T * C + b * P + y * k + w * j, s[11] = T * F + b * V + y * H + w * at, s[15] = T * M + b * X + y * B + w * dt, this;
  }
  /**
   * Multiplies every component of the matrix by the given scalar.
   *
   * @param {number} s - The scalar.
   * @return {Matrix4} A reference to this matrix.
   */
  multiplyScalar(t) {
    const e = this.elements;
    return e[0] *= t, e[4] *= t, e[8] *= t, e[12] *= t, e[1] *= t, e[5] *= t, e[9] *= t, e[13] *= t, e[2] *= t, e[6] *= t, e[10] *= t, e[14] *= t, e[3] *= t, e[7] *= t, e[11] *= t, e[15] *= t, this;
  }
  /**
   * Computes and returns the determinant of this matrix.
   *
   * Based on the method outlined [here]{@link http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.html}.
   *
   * @return {number} The determinant.
   */
  determinant() {
    const t = this.elements, e = t[0], n = t[4], r = t[8], s = t[12], a = t[1], o = t[5], l = t[9], c = t[13], h = t[2], d = t[6], f = t[10], p = t[14], g = t[3], _ = t[7], m = t[11], u = t[15];
    return g * (+s * l * d - r * c * d - s * o * f + n * c * f + r * o * p - n * l * p) + _ * (+e * l * p - e * c * f + s * a * f - r * a * p + r * c * h - s * l * h) + m * (+e * c * d - e * o * p - s * a * d + n * a * p + s * o * h - n * c * h) + u * (-r * o * h - e * l * d + e * o * f + r * a * d - n * a * f + n * l * h);
  }
  /**
   * Transposes this matrix in place.
   *
   * @return {Matrix4} A reference to this matrix.
   */
  transpose() {
    const t = this.elements;
    let e;
    return e = t[1], t[1] = t[4], t[4] = e, e = t[2], t[2] = t[8], t[8] = e, e = t[6], t[6] = t[9], t[9] = e, e = t[3], t[3] = t[12], t[12] = e, e = t[7], t[7] = t[13], t[13] = e, e = t[11], t[11] = t[14], t[14] = e, this;
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
  setPosition(t, e, n) {
    const r = this.elements;
    return t.isVector3 ? (r[12] = t.x, r[13] = t.y, r[14] = t.z) : (r[12] = t, r[13] = e, r[14] = n), this;
  }
  /**
   * Inverts this matrix, using the [analytic method]{@link https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution}.
   * You can not invert with a determinant of zero. If you attempt this, the method produces
   * a zero matrix instead.
   *
   * @return {Matrix4} A reference to this matrix.
   */
  invert() {
    const t = this.elements, e = t[0], n = t[1], r = t[2], s = t[3], a = t[4], o = t[5], l = t[6], c = t[7], h = t[8], d = t[9], f = t[10], p = t[11], g = t[12], _ = t[13], m = t[14], u = t[15], T = d * m * c - _ * f * c + _ * l * p - o * m * p - d * l * u + o * f * u, b = g * f * c - h * m * c - g * l * p + a * m * p + h * l * u - a * f * u, y = h * _ * c - g * d * c + g * o * p - a * _ * p - h * o * u + a * d * u, w = g * d * l - h * _ * l - g * o * f + a * _ * f + h * o * m - a * d * m, R = e * T + n * b + r * y + s * w;
    if (R === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const C = 1 / R;
    return t[0] = T * C, t[1] = (_ * f * s - d * m * s - _ * r * p + n * m * p + d * r * u - n * f * u) * C, t[2] = (o * m * s - _ * l * s + _ * r * c - n * m * c - o * r * u + n * l * u) * C, t[3] = (d * l * s - o * f * s - d * r * c + n * f * c + o * r * p - n * l * p) * C, t[4] = b * C, t[5] = (h * m * s - g * f * s + g * r * p - e * m * p - h * r * u + e * f * u) * C, t[6] = (g * l * s - a * m * s - g * r * c + e * m * c + a * r * u - e * l * u) * C, t[7] = (a * f * s - h * l * s + h * r * c - e * f * c - a * r * p + e * l * p) * C, t[8] = y * C, t[9] = (g * d * s - h * _ * s - g * n * p + e * _ * p + h * n * u - e * d * u) * C, t[10] = (a * _ * s - g * o * s + g * n * c - e * _ * c - a * n * u + e * o * u) * C, t[11] = (h * o * s - a * d * s - h * n * c + e * d * c + a * n * p - e * o * p) * C, t[12] = w * C, t[13] = (h * _ * r - g * d * r + g * n * f - e * _ * f - h * n * m + e * d * m) * C, t[14] = (g * o * r - a * _ * r - g * n * l + e * _ * l + a * n * m - e * o * m) * C, t[15] = (a * d * r - h * o * r + h * n * l - e * d * l - a * n * f + e * o * f) * C, this;
  }
  /**
   * Multiplies the columns of this matrix by the given vector.
   *
   * @param {Vector3} v - The scale vector.
   * @return {Matrix4} A reference to this matrix.
   */
  scale(t) {
    const e = this.elements, n = t.x, r = t.y, s = t.z;
    return e[0] *= n, e[4] *= r, e[8] *= s, e[1] *= n, e[5] *= r, e[9] *= s, e[2] *= n, e[6] *= r, e[10] *= s, e[3] *= n, e[7] *= r, e[11] *= s, this;
  }
  /**
   * Gets the maximum scale value of the three axes.
   *
   * @return {number} The maximum scale.
   */
  getMaxScaleOnAxis() {
    const t = this.elements, e = t[0] * t[0] + t[1] * t[1] + t[2] * t[2], n = t[4] * t[4] + t[5] * t[5] + t[6] * t[6], r = t[8] * t[8] + t[9] * t[9] + t[10] * t[10];
    return Math.sqrt(Math.max(e, n, r));
  }
  /**
   * Sets this matrix as a translation transform from the given vector.
   *
   * @param {number|Vector3} x - The amount to translate in the X axis or alternatively a translation vector.
   * @param {number} y - The amount to translate in the Y axis.
   * @param {number} z - The amount to translate in the z axis.
   * @return {Matrix4} A reference to this matrix.
   */
  makeTranslation(t, e, n) {
    return t.isVector3 ? this.set(
      1,
      0,
      0,
      t.x,
      0,
      1,
      0,
      t.y,
      0,
      0,
      1,
      t.z,
      0,
      0,
      0,
      1
    ) : this.set(
      1,
      0,
      0,
      t,
      0,
      1,
      0,
      e,
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
  makeRotationX(t) {
    const e = Math.cos(t), n = Math.sin(t);
    return this.set(
      1,
      0,
      0,
      0,
      0,
      e,
      -n,
      0,
      0,
      n,
      e,
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
  makeRotationY(t) {
    const e = Math.cos(t), n = Math.sin(t);
    return this.set(
      e,
      0,
      n,
      0,
      0,
      1,
      0,
      0,
      -n,
      0,
      e,
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
  makeRotationZ(t) {
    const e = Math.cos(t), n = Math.sin(t);
    return this.set(
      e,
      -n,
      0,
      0,
      n,
      e,
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
  makeRotationAxis(t, e) {
    const n = Math.cos(e), r = Math.sin(e), s = 1 - n, a = t.x, o = t.y, l = t.z, c = s * a, h = s * o;
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
  makeScale(t, e, n) {
    return this.set(
      t,
      0,
      0,
      0,
      0,
      e,
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
  makeShear(t, e, n, r, s, a) {
    return this.set(
      1,
      n,
      s,
      0,
      t,
      1,
      a,
      0,
      e,
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
  compose(t, e, n) {
    const r = this.elements, s = e._x, a = e._y, o = e._z, l = e._w, c = s + s, h = a + a, d = o + o, f = s * c, p = s * h, g = s * d, _ = a * h, m = a * d, u = o * d, T = l * c, b = l * h, y = l * d, w = n.x, R = n.y, C = n.z;
    return r[0] = (1 - (_ + u)) * w, r[1] = (p + y) * w, r[2] = (g - b) * w, r[3] = 0, r[4] = (p - y) * R, r[5] = (1 - (f + u)) * R, r[6] = (m + T) * R, r[7] = 0, r[8] = (g + b) * C, r[9] = (m - T) * C, r[10] = (1 - (f + _)) * C, r[11] = 0, r[12] = t.x, r[13] = t.y, r[14] = t.z, r[15] = 1, this;
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
  decompose(t, e, n) {
    const r = this.elements;
    let s = Ci.set(r[0], r[1], r[2]).length();
    const a = Ci.set(r[4], r[5], r[6]).length(), o = Ci.set(r[8], r[9], r[10]).length();
    this.determinant() < 0 && (s = -s), t.x = r[12], t.y = r[13], t.z = r[14], un.copy(this);
    const c = 1 / s, h = 1 / a, d = 1 / o;
    return un.elements[0] *= c, un.elements[1] *= c, un.elements[2] *= c, un.elements[4] *= h, un.elements[5] *= h, un.elements[6] *= h, un.elements[8] *= d, un.elements[9] *= d, un.elements[10] *= d, e.setFromRotationMatrix(un), n.x = s, n.y = a, n.z = o, this;
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
  makePerspective(t, e, n, r, s, a, o = Tn, l = !1) {
    const c = this.elements, h = 2 * s / (e - t), d = 2 * s / (n - r), f = (e + t) / (e - t), p = (n + r) / (n - r);
    let g, _;
    if (l)
      g = s / (a - s), _ = a * s / (a - s);
    else if (o === Tn)
      g = -(a + s) / (a - s), _ = -2 * a * s / (a - s);
    else if (o === os)
      g = -a / (a - s), _ = -a * s / (a - s);
    else
      throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
    return c[0] = h, c[4] = 0, c[8] = f, c[12] = 0, c[1] = 0, c[5] = d, c[9] = p, c[13] = 0, c[2] = 0, c[6] = 0, c[10] = g, c[14] = _, c[3] = 0, c[7] = 0, c[11] = -1, c[15] = 0, this;
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
  makeOrthographic(t, e, n, r, s, a, o = Tn, l = !1) {
    const c = this.elements, h = 2 / (e - t), d = 2 / (n - r), f = -(e + t) / (e - t), p = -(n + r) / (n - r);
    let g, _;
    if (l)
      g = 1 / (a - s), _ = a / (a - s);
    else if (o === Tn)
      g = -2 / (a - s), _ = -(a + s) / (a - s);
    else if (o === os)
      g = -1 / (a - s), _ = -s / (a - s);
    else
      throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
    return c[0] = h, c[4] = 0, c[8] = 0, c[12] = f, c[1] = 0, c[5] = d, c[9] = 0, c[13] = p, c[2] = 0, c[6] = 0, c[10] = g, c[14] = _, c[3] = 0, c[7] = 0, c[11] = 0, c[15] = 1, this;
  }
  /**
   * Returns `true` if this matrix is equal with the given one.
   *
   * @param {Matrix4} matrix - The matrix to test for equality.
   * @return {boolean} Whether this matrix is equal with the given one.
   */
  equals(t) {
    const e = this.elements, n = t.elements;
    for (let r = 0; r < 16; r++)
      if (e[r] !== n[r]) return !1;
    return !0;
  }
  /**
   * Sets the elements of the matrix from the given array.
   *
   * @param {Array<number>} array - The matrix elements in column-major order.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Matrix4} A reference to this matrix.
   */
  fromArray(t, e = 0) {
    for (let n = 0; n < 16; n++)
      this.elements[n] = t[n + e];
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
  toArray(t = [], e = 0) {
    const n = this.elements;
    return t[e] = n[0], t[e + 1] = n[1], t[e + 2] = n[2], t[e + 3] = n[3], t[e + 4] = n[4], t[e + 5] = n[5], t[e + 6] = n[6], t[e + 7] = n[7], t[e + 8] = n[8], t[e + 9] = n[9], t[e + 10] = n[10], t[e + 11] = n[11], t[e + 12] = n[12], t[e + 13] = n[13], t[e + 14] = n[14], t[e + 15] = n[15], t;
  }
}
const Ci = /* @__PURE__ */ new I(), un = /* @__PURE__ */ new le(), fd = /* @__PURE__ */ new I(0, 0, 0), pd = /* @__PURE__ */ new I(1, 1, 1), qn = /* @__PURE__ */ new I(), Ur = /* @__PURE__ */ new I(), Qe = /* @__PURE__ */ new I(), Bo = /* @__PURE__ */ new le(), zo = /* @__PURE__ */ new vi();
class Dn {
  /**
   * Constructs a new euler instance.
   *
   * @param {number} [x=0] - The angle of the x axis in radians.
   * @param {number} [y=0] - The angle of the y axis in radians.
   * @param {number} [z=0] - The angle of the z axis in radians.
   * @param {string} [order=Euler.DEFAULT_ORDER] - A string representing the order that the rotations are applied.
   */
  constructor(t = 0, e = 0, n = 0, r = Dn.DEFAULT_ORDER) {
    this.isEuler = !0, this._x = t, this._y = e, this._z = n, this._order = r;
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
  set x(t) {
    this._x = t, this._onChangeCallback();
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
  set y(t) {
    this._y = t, this._onChangeCallback();
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
  set z(t) {
    this._z = t, this._onChangeCallback();
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
  set order(t) {
    this._order = t, this._onChangeCallback();
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
  set(t, e, n, r = this._order) {
    return this._x = t, this._y = e, this._z = n, this._order = r, this._onChangeCallback(), this;
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
  copy(t) {
    return this._x = t._x, this._y = t._y, this._z = t._z, this._order = t._order, this._onChangeCallback(), this;
  }
  /**
   * Sets the angles of this Euler instance from a pure rotation matrix.
   *
   * @param {Matrix4} m - A 4x4 matrix of which the upper 3x3 of matrix is a pure rotation matrix (i.e. unscaled).
   * @param {string} [order] - A string representing the order that the rotations are applied.
   * @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
   * @return {Euler} A reference to this Euler instance.
   */
  setFromRotationMatrix(t, e = this._order, n = !0) {
    const r = t.elements, s = r[0], a = r[4], o = r[8], l = r[1], c = r[5], h = r[9], d = r[2], f = r[6], p = r[10];
    switch (e) {
      case "XYZ":
        this._y = Math.asin(Gt(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(-h, p), this._z = Math.atan2(-a, s)) : (this._x = Math.atan2(f, c), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-Gt(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(o, p), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-d, s), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(Gt(f, -1, 1)), Math.abs(f) < 0.9999999 ? (this._y = Math.atan2(-d, p), this._z = Math.atan2(-a, c)) : (this._y = 0, this._z = Math.atan2(l, s));
        break;
      case "ZYX":
        this._y = Math.asin(-Gt(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._x = Math.atan2(f, p), this._z = Math.atan2(l, s)) : (this._x = 0, this._z = Math.atan2(-a, c));
        break;
      case "YZX":
        this._z = Math.asin(Gt(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-d, s)) : (this._x = 0, this._y = Math.atan2(o, p));
        break;
      case "XZY":
        this._z = Math.asin(-Gt(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(f, c), this._y = Math.atan2(o, s)) : (this._x = Math.atan2(-h, p), this._y = 0);
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + e);
    }
    return this._order = e, n === !0 && this._onChangeCallback(), this;
  }
  /**
   * Sets the angles of this Euler instance from a normalized quaternion.
   *
   * @param {Quaternion} q - A normalized Quaternion.
   * @param {string} [order] - A string representing the order that the rotations are applied.
   * @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
   * @return {Euler} A reference to this Euler instance.
   */
  setFromQuaternion(t, e, n) {
    return Bo.makeRotationFromQuaternion(t), this.setFromRotationMatrix(Bo, e, n);
  }
  /**
   * Sets the angles of this Euler instance from the given vector.
   *
   * @param {Vector3} v - The vector.
   * @param {string} [order] - A string representing the order that the rotations are applied.
   * @return {Euler} A reference to this Euler instance.
   */
  setFromVector3(t, e = this._order) {
    return this.set(t.x, t.y, t.z, e);
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
  reorder(t) {
    return zo.setFromEuler(this), this.setFromQuaternion(zo, t);
  }
  /**
   * Returns `true` if this Euler instance is equal with the given one.
   *
   * @param {Euler} euler - The Euler instance to test for equality.
   * @return {boolean} Whether this Euler instance is equal with the given one.
   */
  equals(t) {
    return t._x === this._x && t._y === this._y && t._z === this._z && t._order === this._order;
  }
  /**
   * Sets this Euler instance's components to values from the given array. The first three
   * entries of the array are assign to the x,y and z components. An optional fourth entry
   * defines the Euler order.
   *
   * @param {Array<number,number,number,?string>} array - An array holding the Euler component values.
   * @return {Euler} A reference to this Euler instance.
   */
  fromArray(t) {
    return this._x = t[0], this._y = t[1], this._z = t[2], t[3] !== void 0 && (this._order = t[3]), this._onChangeCallback(), this;
  }
  /**
   * Writes the components of this Euler instance to the given array. If no array is provided,
   * the method returns a new instance.
   *
   * @param {Array<number,number,number,string>} [array=[]] - The target array holding the Euler components.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Array<number,number,number,string>} The Euler components.
   */
  toArray(t = [], e = 0) {
    return t[e] = this._x, t[e + 1] = this._y, t[e + 2] = this._z, t[e + 3] = this._order, t;
  }
  _onChange(t) {
    return this._onChangeCallback = t, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._order;
  }
}
Dn.DEFAULT_ORDER = "XYZ";
class so {
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
  set(t) {
    this.mask = (1 << t | 0) >>> 0;
  }
  /**
   * Adds membership of the given layer.
   *
   * @param {number} layer - The layer to enable.
   */
  enable(t) {
    this.mask |= 1 << t | 0;
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
  toggle(t) {
    this.mask ^= 1 << t | 0;
  }
  /**
   * Removes membership of the given layer.
   *
   * @param {number} layer - The layer to enable.
   */
  disable(t) {
    this.mask &= ~(1 << t | 0);
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
  test(t) {
    return (this.mask & t.mask) !== 0;
  }
  /**
   * Returns `true` if the given layer is enabled.
   *
   * @param {number} layer - The layer to test.
   * @return {boolean } Whether the given layer is enabled or not.
   */
  isEnabled(t) {
    return (this.mask & (1 << t | 0)) !== 0;
  }
}
let md = 0;
const Ho = /* @__PURE__ */ new I(), Pi = /* @__PURE__ */ new vi(), Nn = /* @__PURE__ */ new le(), Nr = /* @__PURE__ */ new I(), or = /* @__PURE__ */ new I(), gd = /* @__PURE__ */ new I(), _d = /* @__PURE__ */ new vi(), Vo = /* @__PURE__ */ new I(1, 0, 0), Go = /* @__PURE__ */ new I(0, 1, 0), Wo = /* @__PURE__ */ new I(0, 0, 1), Xo = { type: "added" }, vd = { type: "removed" }, Di = { type: "childadded", child: null }, Ps = { type: "childremoved", child: null };
class Te extends yi {
  /**
   * Constructs a new 3D object.
   */
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: md++ }), this.uuid = Qi(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = Te.DEFAULT_UP.clone();
    const t = new I(), e = new Dn(), n = new vi(), r = new I(1, 1, 1);
    function s() {
      n.setFromEuler(e, !1);
    }
    function a() {
      e.setFromQuaternion(n, void 0, !1);
    }
    e._onChange(s), n._onChange(a), Object.defineProperties(this, {
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
        value: t
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
        value: e
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
        value: new le()
      },
      /**
       * Represents the object's normal matrix.
       *
       * @name Object3D#normalMatrix
       * @type {Matrix3}
       */
      normalMatrix: {
        value: new zt()
      }
    }), this.matrix = new le(), this.matrixWorld = new le(), this.matrixAutoUpdate = Te.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = Te.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new so(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.customDepthMaterial = void 0, this.customDistanceMaterial = void 0, this.userData = {};
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
  applyMatrix4(t) {
    this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(t), this.matrix.decompose(this.position, this.quaternion, this.scale);
  }
  /**
   * Applies a rotation represented by given the quaternion to the 3D object.
   *
   * @param {Quaternion} q - The quaternion.
   * @return {Object3D} A reference to this instance.
   */
  applyQuaternion(t) {
    return this.quaternion.premultiply(t), this;
  }
  /**
   * Sets the given rotation represented as an axis/angle couple to the 3D object.
   *
   * @param {Vector3} axis - The (normalized) axis vector.
   * @param {number} angle - The angle in radians.
   */
  setRotationFromAxisAngle(t, e) {
    this.quaternion.setFromAxisAngle(t, e);
  }
  /**
   * Sets the given rotation represented as Euler angles to the 3D object.
   *
   * @param {Euler} euler - The Euler angles.
   */
  setRotationFromEuler(t) {
    this.quaternion.setFromEuler(t, !0);
  }
  /**
   * Sets the given rotation represented as rotation matrix to the 3D object.
   *
   * @param {Matrix4} m - Although a 4x4 matrix is expected, the upper 3x3 portion must be
   * a pure rotation matrix (i.e, unscaled).
   */
  setRotationFromMatrix(t) {
    this.quaternion.setFromRotationMatrix(t);
  }
  /**
   * Sets the given rotation represented as a Quaternion to the 3D object.
   *
   * @param {Quaternion} q - The Quaternion
   */
  setRotationFromQuaternion(t) {
    this.quaternion.copy(t);
  }
  /**
   * Rotates the 3D object along an axis in local space.
   *
   * @param {Vector3} axis - The (normalized) axis vector.
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateOnAxis(t, e) {
    return Pi.setFromAxisAngle(t, e), this.quaternion.multiply(Pi), this;
  }
  /**
   * Rotates the 3D object along an axis in world space.
   *
   * @param {Vector3} axis - The (normalized) axis vector.
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateOnWorldAxis(t, e) {
    return Pi.setFromAxisAngle(t, e), this.quaternion.premultiply(Pi), this;
  }
  /**
   * Rotates the 3D object around its X axis in local space.
   *
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateX(t) {
    return this.rotateOnAxis(Vo, t);
  }
  /**
   * Rotates the 3D object around its Y axis in local space.
   *
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateY(t) {
    return this.rotateOnAxis(Go, t);
  }
  /**
   * Rotates the 3D object around its Z axis in local space.
   *
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateZ(t) {
    return this.rotateOnAxis(Wo, t);
  }
  /**
   * Translate the 3D object by a distance along the given axis in local space.
   *
   * @param {Vector3} axis - The (normalized) axis vector.
   * @param {number} distance - The distance in world units.
   * @return {Object3D} A reference to this instance.
   */
  translateOnAxis(t, e) {
    return Ho.copy(t).applyQuaternion(this.quaternion), this.position.add(Ho.multiplyScalar(e)), this;
  }
  /**
   * Translate the 3D object by a distance along its X-axis in local space.
   *
   * @param {number} distance - The distance in world units.
   * @return {Object3D} A reference to this instance.
   */
  translateX(t) {
    return this.translateOnAxis(Vo, t);
  }
  /**
   * Translate the 3D object by a distance along its Y-axis in local space.
   *
   * @param {number} distance - The distance in world units.
   * @return {Object3D} A reference to this instance.
   */
  translateY(t) {
    return this.translateOnAxis(Go, t);
  }
  /**
   * Translate the 3D object by a distance along its Z-axis in local space.
   *
   * @param {number} distance - The distance in world units.
   * @return {Object3D} A reference to this instance.
   */
  translateZ(t) {
    return this.translateOnAxis(Wo, t);
  }
  /**
   * Converts the given vector from this 3D object's local space to world space.
   *
   * @param {Vector3} vector - The vector to convert.
   * @return {Vector3} The converted vector.
   */
  localToWorld(t) {
    return this.updateWorldMatrix(!0, !1), t.applyMatrix4(this.matrixWorld);
  }
  /**
   * Converts the given vector from this 3D object's word space to local space.
   *
   * @param {Vector3} vector - The vector to convert.
   * @return {Vector3} The converted vector.
   */
  worldToLocal(t) {
    return this.updateWorldMatrix(!0, !1), t.applyMatrix4(Nn.copy(this.matrixWorld).invert());
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
  lookAt(t, e, n) {
    t.isVector3 ? Nr.copy(t) : Nr.set(t, e, n);
    const r = this.parent;
    this.updateWorldMatrix(!0, !1), or.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? Nn.lookAt(or, Nr, this.up) : Nn.lookAt(Nr, or, this.up), this.quaternion.setFromRotationMatrix(Nn), r && (Nn.extractRotation(r.matrixWorld), Pi.setFromRotationMatrix(Nn), this.quaternion.premultiply(Pi.invert()));
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
  add(t) {
    if (arguments.length > 1) {
      for (let e = 0; e < arguments.length; e++)
        this.add(arguments[e]);
      return this;
    }
    return t === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", t), this) : (t && t.isObject3D ? (t.removeFromParent(), t.parent = this, this.children.push(t), t.dispatchEvent(Xo), Di.child = t, this.dispatchEvent(Di), Di.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", t), this);
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
  remove(t) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++)
        this.remove(arguments[n]);
      return this;
    }
    const e = this.children.indexOf(t);
    return e !== -1 && (t.parent = null, this.children.splice(e, 1), t.dispatchEvent(vd), Ps.child = t, this.dispatchEvent(Ps), Ps.child = null), this;
  }
  /**
   * Removes this 3D object from its current parent.
   *
   * @fires Object3D#removed
   * @fires Object3D#childremoved
   * @return {Object3D} A reference to this instance.
   */
  removeFromParent() {
    const t = this.parent;
    return t !== null && t.remove(this), this;
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
  attach(t) {
    return this.updateWorldMatrix(!0, !1), Nn.copy(this.matrixWorld).invert(), t.parent !== null && (t.parent.updateWorldMatrix(!0, !1), Nn.multiply(t.parent.matrixWorld)), t.applyMatrix4(Nn), t.removeFromParent(), t.parent = this, this.children.push(t), t.updateWorldMatrix(!1, !0), t.dispatchEvent(Xo), Di.child = t, this.dispatchEvent(Di), Di.child = null, this;
  }
  /**
   * Searches through the 3D object and its children, starting with the 3D object
   * itself, and returns the first with a matching ID.
   *
   * @param {number} id - The id.
   * @return {Object3D|undefined} The found 3D object. Returns `undefined` if no 3D object has been found.
   */
  getObjectById(t) {
    return this.getObjectByProperty("id", t);
  }
  /**
   * Searches through the 3D object and its children, starting with the 3D object
   * itself, and returns the first with a matching name.
   *
   * @param {string} name - The name.
   * @return {Object3D|undefined} The found 3D object. Returns `undefined` if no 3D object has been found.
   */
  getObjectByName(t) {
    return this.getObjectByProperty("name", t);
  }
  /**
   * Searches through the 3D object and its children, starting with the 3D object
   * itself, and returns the first with a matching property value.
   *
   * @param {string} name - The name of the property.
   * @param {any} value - The value.
   * @return {Object3D|undefined} The found 3D object. Returns `undefined` if no 3D object has been found.
   */
  getObjectByProperty(t, e) {
    if (this[t] === e) return this;
    for (let n = 0, r = this.children.length; n < r; n++) {
      const a = this.children[n].getObjectByProperty(t, e);
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
  getObjectsByProperty(t, e, n = []) {
    this[t] === e && n.push(this);
    const r = this.children;
    for (let s = 0, a = r.length; s < a; s++)
      r[s].getObjectsByProperty(t, e, n);
    return n;
  }
  /**
   * Returns a vector representing the position of the 3D object in world space.
   *
   * @param {Vector3} target - The target vector the result is stored to.
   * @return {Vector3} The 3D object's position in world space.
   */
  getWorldPosition(t) {
    return this.updateWorldMatrix(!0, !1), t.setFromMatrixPosition(this.matrixWorld);
  }
  /**
   * Returns a Quaternion representing the position of the 3D object in world space.
   *
   * @param {Quaternion} target - The target Quaternion the result is stored to.
   * @return {Quaternion} The 3D object's rotation in world space.
   */
  getWorldQuaternion(t) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(or, t, gd), t;
  }
  /**
   * Returns a vector representing the scale of the 3D object in world space.
   *
   * @param {Vector3} target - The target vector the result is stored to.
   * @return {Vector3} The 3D object's scale in world space.
   */
  getWorldScale(t) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(or, _d, t), t;
  }
  /**
   * Returns a vector representing the ("look") direction of the 3D object in world space.
   *
   * @param {Vector3} target - The target vector the result is stored to.
   * @return {Vector3} The 3D object's direction in world space.
   */
  getWorldDirection(t) {
    this.updateWorldMatrix(!0, !1);
    const e = this.matrixWorld.elements;
    return t.set(e[8], e[9], e[10]).normalize();
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
  traverse(t) {
    t(this);
    const e = this.children;
    for (let n = 0, r = e.length; n < r; n++)
      e[n].traverse(t);
  }
  /**
   * Like {@link Object3D#traverse}, but the callback will only be executed for visible 3D objects.
   * Descendants of invisible 3D objects are not traversed.
   *
   * Note: Modifying the scene graph inside the callback is discouraged.
   *
   * @param {Function} callback - A callback function that allows to process the current 3D object.
   */
  traverseVisible(t) {
    if (this.visible === !1) return;
    t(this);
    const e = this.children;
    for (let n = 0, r = e.length; n < r; n++)
      e[n].traverseVisible(t);
  }
  /**
   * Like {@link Object3D#traverse}, but the callback will only be executed for all ancestors.
   *
   * Note: Modifying the scene graph inside the callback is discouraged.
   *
   * @param {Function} callback - A callback function that allows to process the current 3D object.
   */
  traverseAncestors(t) {
    const e = this.parent;
    e !== null && (t(e), e.traverseAncestors(t));
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
  updateMatrixWorld(t) {
    this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || t) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, t = !0);
    const e = this.children;
    for (let n = 0, r = e.length; n < r; n++)
      e[n].updateMatrixWorld(t);
  }
  /**
   * An alternative version of {@link Object3D#updateMatrixWorld} with more control over the
   * update of ancestor and descendant nodes.
   *
   * @param {boolean} [updateParents=false] Whether ancestor nodes should be updated or not.
   * @param {boolean} [updateChildren=false] Whether descendant nodes should be updated or not.
   */
  updateWorldMatrix(t, e) {
    const n = this.parent;
    if (t === !0 && n !== null && n.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), e === !0) {
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
  toJSON(t) {
    const e = t === void 0 || typeof t == "string", n = {};
    e && (t = {
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
    })), r.instanceInfo = this._instanceInfo.map((o) => ({ ...o })), r.availableInstanceIds = this._availableInstanceIds.slice(), r.availableGeometryIds = this._availableGeometryIds.slice(), r.nextIndexStart = this._nextIndexStart, r.nextVertexStart = this._nextVertexStart, r.geometryCount = this._geometryCount, r.maxInstanceCount = this._maxInstanceCount, r.maxVertexCount = this._maxVertexCount, r.maxIndexCount = this._maxIndexCount, r.geometryInitialized = this._geometryInitialized, r.matricesTexture = this._matricesTexture.toJSON(t), r.indirectTexture = this._indirectTexture.toJSON(t), this._colorsTexture !== null && (r.colorsTexture = this._colorsTexture.toJSON(t)), this.boundingSphere !== null && (r.boundingSphere = this.boundingSphere.toJSON()), this.boundingBox !== null && (r.boundingBox = this.boundingBox.toJSON()));
    function s(o, l) {
      return o[l.uuid] === void 0 && (o[l.uuid] = l.toJSON(t)), l.uuid;
    }
    if (this.isScene)
      this.background && (this.background.isColor ? r.background = this.background.toJSON() : this.background.isTexture && (r.background = this.background.toJSON(t).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (r.environment = this.environment.toJSON(t).uuid);
    else if (this.isMesh || this.isLine || this.isPoints) {
      r.geometry = s(t.geometries, this.geometry);
      const o = this.geometry.parameters;
      if (o !== void 0 && o.shapes !== void 0) {
        const l = o.shapes;
        if (Array.isArray(l))
          for (let c = 0, h = l.length; c < h; c++) {
            const d = l[c];
            s(t.shapes, d);
          }
        else
          s(t.shapes, l);
      }
    }
    if (this.isSkinnedMesh && (r.bindMode = this.bindMode, r.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (s(t.skeletons, this.skeleton), r.skeleton = this.skeleton.uuid)), this.material !== void 0)
      if (Array.isArray(this.material)) {
        const o = [];
        for (let l = 0, c = this.material.length; l < c; l++)
          o.push(s(t.materials, this.material[l]));
        r.material = o;
      } else
        r.material = s(t.materials, this.material);
    if (this.children.length > 0) {
      r.children = [];
      for (let o = 0; o < this.children.length; o++)
        r.children.push(this.children[o].toJSON(t).object);
    }
    if (this.animations.length > 0) {
      r.animations = [];
      for (let o = 0; o < this.animations.length; o++) {
        const l = this.animations[o];
        r.animations.push(s(t.animations, l));
      }
    }
    if (e) {
      const o = a(t.geometries), l = a(t.materials), c = a(t.textures), h = a(t.images), d = a(t.shapes), f = a(t.skeletons), p = a(t.animations), g = a(t.nodes);
      o.length > 0 && (n.geometries = o), l.length > 0 && (n.materials = l), c.length > 0 && (n.textures = c), h.length > 0 && (n.images = h), d.length > 0 && (n.shapes = d), f.length > 0 && (n.skeletons = f), p.length > 0 && (n.animations = p), g.length > 0 && (n.nodes = g);
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
  clone(t) {
    return new this.constructor().copy(this, t);
  }
  /**
   * Copies the values of the given 3D object to this instance.
   *
   * @param {Object3D} source - The 3D object to copy.
   * @param {boolean} [recursive=true] - When set to `true`, descendants of the 3D object are cloned.
   * @return {Object3D} A reference to this instance.
   */
  copy(t, e = !0) {
    if (this.name = t.name, this.up.copy(t.up), this.position.copy(t.position), this.rotation.order = t.rotation.order, this.quaternion.copy(t.quaternion), this.scale.copy(t.scale), this.matrix.copy(t.matrix), this.matrixWorld.copy(t.matrixWorld), this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrixWorldAutoUpdate = t.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = t.matrixWorldNeedsUpdate, this.layers.mask = t.layers.mask, this.visible = t.visible, this.castShadow = t.castShadow, this.receiveShadow = t.receiveShadow, this.frustumCulled = t.frustumCulled, this.renderOrder = t.renderOrder, this.animations = t.animations.slice(), this.userData = JSON.parse(JSON.stringify(t.userData)), e === !0)
      for (let n = 0; n < t.children.length; n++) {
        const r = t.children[n];
        this.add(r.clone());
      }
    return this;
  }
}
Te.DEFAULT_UP = /* @__PURE__ */ new I(0, 1, 0);
Te.DEFAULT_MATRIX_AUTO_UPDATE = !0;
Te.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const fn = /* @__PURE__ */ new I(), Fn = /* @__PURE__ */ new I(), Ds = /* @__PURE__ */ new I(), On = /* @__PURE__ */ new I(), Li = /* @__PURE__ */ new I(), Ii = /* @__PURE__ */ new I(), $o = /* @__PURE__ */ new I(), Ls = /* @__PURE__ */ new I(), Is = /* @__PURE__ */ new I(), Us = /* @__PURE__ */ new I(), Ns = /* @__PURE__ */ new ve(), Fs = /* @__PURE__ */ new ve(), Os = /* @__PURE__ */ new ve();
class cn {
  /**
   * Constructs a new triangle.
   *
   * @param {Vector3} [a=(0,0,0)] - The first corner of the triangle.
   * @param {Vector3} [b=(0,0,0)] - The second corner of the triangle.
   * @param {Vector3} [c=(0,0,0)] - The third corner of the triangle.
   */
  constructor(t = new I(), e = new I(), n = new I()) {
    this.a = t, this.b = e, this.c = n;
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
  static getNormal(t, e, n, r) {
    r.subVectors(n, e), fn.subVectors(t, e), r.cross(fn);
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
  static getBarycoord(t, e, n, r, s) {
    fn.subVectors(r, e), Fn.subVectors(n, e), Ds.subVectors(t, e);
    const a = fn.dot(fn), o = fn.dot(Fn), l = fn.dot(Ds), c = Fn.dot(Fn), h = Fn.dot(Ds), d = a * c - o * o;
    if (d === 0)
      return s.set(0, 0, 0), null;
    const f = 1 / d, p = (c * l - o * h) * f, g = (a * h - o * l) * f;
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
  static containsPoint(t, e, n, r) {
    return this.getBarycoord(t, e, n, r, On) === null ? !1 : On.x >= 0 && On.y >= 0 && On.x + On.y <= 1;
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
  static getInterpolation(t, e, n, r, s, a, o, l) {
    return this.getBarycoord(t, e, n, r, On) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(s, On.x), l.addScaledVector(a, On.y), l.addScaledVector(o, On.z), l);
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
  static getInterpolatedAttribute(t, e, n, r, s, a) {
    return Ns.setScalar(0), Fs.setScalar(0), Os.setScalar(0), Ns.fromBufferAttribute(t, e), Fs.fromBufferAttribute(t, n), Os.fromBufferAttribute(t, r), a.setScalar(0), a.addScaledVector(Ns, s.x), a.addScaledVector(Fs, s.y), a.addScaledVector(Os, s.z), a;
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
  static isFrontFacing(t, e, n, r) {
    return fn.subVectors(n, e), Fn.subVectors(t, e), fn.cross(Fn).dot(r) < 0;
  }
  /**
   * Sets the triangle's vertices by copying the given values.
   *
   * @param {Vector3} a - The first corner of the triangle.
   * @param {Vector3} b - The second corner of the triangle.
   * @param {Vector3} c - The third corner of the triangle.
   * @return {Triangle} A reference to this triangle.
   */
  set(t, e, n) {
    return this.a.copy(t), this.b.copy(e), this.c.copy(n), this;
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
  setFromPointsAndIndices(t, e, n, r) {
    return this.a.copy(t[e]), this.b.copy(t[n]), this.c.copy(t[r]), this;
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
  setFromAttributeAndIndices(t, e, n, r) {
    return this.a.fromBufferAttribute(t, e), this.b.fromBufferAttribute(t, n), this.c.fromBufferAttribute(t, r), this;
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
  copy(t) {
    return this.a.copy(t.a), this.b.copy(t.b), this.c.copy(t.c), this;
  }
  /**
   * Computes the area of the triangle.
   *
   * @return {number} The triangle's area.
   */
  getArea() {
    return fn.subVectors(this.c, this.b), Fn.subVectors(this.a, this.b), fn.cross(Fn).length() * 0.5;
  }
  /**
   * Computes the midpoint of the triangle.
   *
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The triangle's midpoint.
   */
  getMidpoint(t) {
    return t.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  }
  /**
   * Computes the normal of the triangle.
   *
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The triangle's normal.
   */
  getNormal(t) {
    return cn.getNormal(this.a, this.b, this.c, t);
  }
  /**
   * Computes a plane the triangle lies within.
   *
   * @param {Plane} target - The target vector that is used to store the method's result.
   * @return {Plane} The plane the triangle lies within.
   */
  getPlane(t) {
    return t.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  /**
   * Computes a barycentric coordinates from the given vector.
   * Returns `null` if the triangle is degenerate.
   *
   * @param {Vector3} point - A point in 3D space.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {?Vector3} The barycentric coordinates for the given point
   */
  getBarycoord(t, e) {
    return cn.getBarycoord(t, this.a, this.b, this.c, e);
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
  getInterpolation(t, e, n, r, s) {
    return cn.getInterpolation(t, this.a, this.b, this.c, e, n, r, s);
  }
  /**
   * Returns `true` if the given point, when projected onto the plane of the
   * triangle, lies within the triangle.
   *
   * @param {Vector3} point - The point in 3D space to test.
   * @return {boolean} Whether the given point, when projected onto the plane of the
   * triangle, lies within the triangle or not.
   */
  containsPoint(t) {
    return cn.containsPoint(t, this.a, this.b, this.c);
  }
  /**
   * Returns `true` if the triangle is oriented towards the given direction.
   *
   * @param {Vector3} direction - The (normalized) direction vector.
   * @return {boolean} Whether the triangle is oriented towards the given direction or not.
   */
  isFrontFacing(t) {
    return cn.isFrontFacing(this.a, this.b, this.c, t);
  }
  /**
   * Returns `true` if this triangle intersects with the given box.
   *
   * @param {Box3} box - The box to intersect.
   * @return {boolean} Whether this triangle intersects with the given box or not.
   */
  intersectsBox(t) {
    return t.intersectsTriangle(this);
  }
  /**
   * Returns the closest point on the triangle to the given point.
   *
   * @param {Vector3} p - The point to compute the closest point for.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The closest point on the triangle.
   */
  closestPointToPoint(t, e) {
    const n = this.a, r = this.b, s = this.c;
    let a, o;
    Li.subVectors(r, n), Ii.subVectors(s, n), Ls.subVectors(t, n);
    const l = Li.dot(Ls), c = Ii.dot(Ls);
    if (l <= 0 && c <= 0)
      return e.copy(n);
    Is.subVectors(t, r);
    const h = Li.dot(Is), d = Ii.dot(Is);
    if (h >= 0 && d <= h)
      return e.copy(r);
    const f = l * d - h * c;
    if (f <= 0 && l >= 0 && h <= 0)
      return a = l / (l - h), e.copy(n).addScaledVector(Li, a);
    Us.subVectors(t, s);
    const p = Li.dot(Us), g = Ii.dot(Us);
    if (g >= 0 && p <= g)
      return e.copy(s);
    const _ = p * c - l * g;
    if (_ <= 0 && c >= 0 && g <= 0)
      return o = c / (c - g), e.copy(n).addScaledVector(Ii, o);
    const m = h * g - p * d;
    if (m <= 0 && d - h >= 0 && p - g >= 0)
      return $o.subVectors(s, r), o = (d - h) / (d - h + (p - g)), e.copy(r).addScaledVector($o, o);
    const u = 1 / (m + _ + f);
    return a = _ * u, o = f * u, e.copy(n).addScaledVector(Li, a).addScaledVector(Ii, o);
  }
  /**
   * Returns `true` if this triangle is equal with the given one.
   *
   * @param {Triangle} triangle - The triangle to test for equality.
   * @return {boolean} Whether this triangle is equal with the given one.
   */
  equals(t) {
    return t.a.equals(this.a) && t.b.equals(this.b) && t.c.equals(this.c);
  }
}
const ac = {
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
}, Yn = { h: 0, s: 0, l: 0 }, Fr = { h: 0, s: 0, l: 0 };
function ks(i, t, e) {
  return e < 0 && (e += 1), e > 1 && (e -= 1), e < 1 / 6 ? i + (t - i) * 6 * e : e < 1 / 2 ? t : e < 2 / 3 ? i + (t - i) * 6 * (2 / 3 - e) : i;
}
class Yt {
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
  constructor(t, e, n) {
    return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(t, e, n);
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
  set(t, e, n) {
    if (e === void 0 && n === void 0) {
      const r = t;
      r && r.isColor ? this.copy(r) : typeof r == "number" ? this.setHex(r) : typeof r == "string" && this.setStyle(r);
    } else
      this.setRGB(t, e, n);
    return this;
  }
  /**
   * Sets the colors's components to the given scalar value.
   *
   * @param {number} scalar - The scalar value.
   * @return {Color} A reference to this color.
   */
  setScalar(t) {
    return this.r = t, this.g = t, this.b = t, this;
  }
  /**
   * Sets this color from a hexadecimal value.
   *
   * @param {number} hex - The hexadecimal value.
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {Color} A reference to this color.
   */
  setHex(t, e = je) {
    return t = Math.floor(t), this.r = (t >> 16 & 255) / 255, this.g = (t >> 8 & 255) / 255, this.b = (t & 255) / 255, Kt.colorSpaceToWorking(this, e), this;
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
  setRGB(t, e, n, r = Kt.workingColorSpace) {
    return this.r = t, this.g = e, this.b = n, Kt.colorSpaceToWorking(this, r), this;
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
  setHSL(t, e, n, r = Kt.workingColorSpace) {
    if (t = io(t, 1), e = Gt(e, 0, 1), n = Gt(n, 0, 1), e === 0)
      this.r = this.g = this.b = n;
    else {
      const s = n <= 0.5 ? n * (1 + e) : n + e - n * e, a = 2 * n - s;
      this.r = ks(a, s, t + 1 / 3), this.g = ks(a, s, t), this.b = ks(a, s, t - 1 / 3);
    }
    return Kt.colorSpaceToWorking(this, r), this;
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
  setStyle(t, e = je) {
    function n(s) {
      s !== void 0 && parseFloat(s) < 1 && console.warn("THREE.Color: Alpha component of " + t + " will be ignored.");
    }
    let r;
    if (r = /^(\w+)\(([^\)]*)\)/.exec(t)) {
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
              e
            );
          if (s = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
            return n(s[4]), this.setRGB(
              Math.min(100, parseInt(s[1], 10)) / 100,
              Math.min(100, parseInt(s[2], 10)) / 100,
              Math.min(100, parseInt(s[3], 10)) / 100,
              e
            );
          break;
        case "hsl":
        case "hsla":
          if (s = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
            return n(s[4]), this.setHSL(
              parseFloat(s[1]) / 360,
              parseFloat(s[2]) / 100,
              parseFloat(s[3]) / 100,
              e
            );
          break;
        default:
          console.warn("THREE.Color: Unknown color model " + t);
      }
    } else if (r = /^\#([A-Fa-f\d]+)$/.exec(t)) {
      const s = r[1], a = s.length;
      if (a === 3)
        return this.setRGB(
          parseInt(s.charAt(0), 16) / 15,
          parseInt(s.charAt(1), 16) / 15,
          parseInt(s.charAt(2), 16) / 15,
          e
        );
      if (a === 6)
        return this.setHex(parseInt(s, 16), e);
      console.warn("THREE.Color: Invalid hex color " + t);
    } else if (t && t.length > 0)
      return this.setColorName(t, e);
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
  setColorName(t, e = je) {
    const n = ac[t.toLowerCase()];
    return n !== void 0 ? this.setHex(n, e) : console.warn("THREE.Color: Unknown color " + t), this;
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
  copy(t) {
    return this.r = t.r, this.g = t.g, this.b = t.b, this;
  }
  /**
   * Copies the given color into this color, and then converts this color from
   * `SRGBColorSpace` to `LinearSRGBColorSpace`.
   *
   * @param {Color} color - The color to copy/convert.
   * @return {Color} A reference to this color.
   */
  copySRGBToLinear(t) {
    return this.r = Gn(t.r), this.g = Gn(t.g), this.b = Gn(t.b), this;
  }
  /**
   * Copies the given color into this color, and then converts this color from
   * `LinearSRGBColorSpace` to `SRGBColorSpace`.
   *
   * @param {Color} color - The color to copy/convert.
   * @return {Color} A reference to this color.
   */
  copyLinearToSRGB(t) {
    return this.r = $i(t.r), this.g = $i(t.g), this.b = $i(t.b), this;
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
  getHex(t = je) {
    return Kt.workingToColorSpace(Be.copy(this), t), Math.round(Gt(Be.r * 255, 0, 255)) * 65536 + Math.round(Gt(Be.g * 255, 0, 255)) * 256 + Math.round(Gt(Be.b * 255, 0, 255));
  }
  /**
   * Returns the hexadecimal value of this color as a string (for example, 'FFFFFF').
   *
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {string} The hexadecimal value as a string.
   */
  getHexString(t = je) {
    return ("000000" + this.getHex(t).toString(16)).slice(-6);
  }
  /**
   * Converts the colors RGB values into the HSL format and stores them into the
   * given target object.
   *
   * @param {{h:number,s:number,l:number}} target - The target object that is used to store the method's result.
   * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
   * @return {{h:number,s:number,l:number}} The HSL representation of this color.
   */
  getHSL(t, e = Kt.workingColorSpace) {
    Kt.workingToColorSpace(Be.copy(this), e);
    const n = Be.r, r = Be.g, s = Be.b, a = Math.max(n, r, s), o = Math.min(n, r, s);
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
    return t.h = l, t.s = c, t.l = h, t;
  }
  /**
   * Returns the RGB values of this color and stores them into the given target object.
   *
   * @param {Color} target - The target color that is used to store the method's result.
   * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
   * @return {Color} The RGB representation of this color.
   */
  getRGB(t, e = Kt.workingColorSpace) {
    return Kt.workingToColorSpace(Be.copy(this), e), t.r = Be.r, t.g = Be.g, t.b = Be.b, t;
  }
  /**
   * Returns the value of this color as a CSS style string. Example: `rgb(255,0,0)`.
   *
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {string} The CSS representation of this color.
   */
  getStyle(t = je) {
    Kt.workingToColorSpace(Be.copy(this), t);
    const e = Be.r, n = Be.g, r = Be.b;
    return t !== je ? `color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})` : `rgb(${Math.round(e * 255)},${Math.round(n * 255)},${Math.round(r * 255)})`;
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
  offsetHSL(t, e, n) {
    return this.getHSL(Yn), this.setHSL(Yn.h + t, Yn.s + e, Yn.l + n);
  }
  /**
   * Adds the RGB values of the given color to the RGB values of this color.
   *
   * @param {Color} color - The color to add.
   * @return {Color} A reference to this color.
   */
  add(t) {
    return this.r += t.r, this.g += t.g, this.b += t.b, this;
  }
  /**
   * Adds the RGB values of the given colors and stores the result in this instance.
   *
   * @param {Color} color1 - The first color.
   * @param {Color} color2 - The second color.
   * @return {Color} A reference to this color.
   */
  addColors(t, e) {
    return this.r = t.r + e.r, this.g = t.g + e.g, this.b = t.b + e.b, this;
  }
  /**
   * Adds the given scalar value to the RGB values of this color.
   *
   * @param {number} s - The scalar to add.
   * @return {Color} A reference to this color.
   */
  addScalar(t) {
    return this.r += t, this.g += t, this.b += t, this;
  }
  /**
   * Subtracts the RGB values of the given color from the RGB values of this color.
   *
   * @param {Color} color - The color to subtract.
   * @return {Color} A reference to this color.
   */
  sub(t) {
    return this.r = Math.max(0, this.r - t.r), this.g = Math.max(0, this.g - t.g), this.b = Math.max(0, this.b - t.b), this;
  }
  /**
   * Multiplies the RGB values of the given color with the RGB values of this color.
   *
   * @param {Color} color - The color to multiply.
   * @return {Color} A reference to this color.
   */
  multiply(t) {
    return this.r *= t.r, this.g *= t.g, this.b *= t.b, this;
  }
  /**
   * Multiplies the given scalar value with the RGB values of this color.
   *
   * @param {number} s - The scalar to multiply.
   * @return {Color} A reference to this color.
   */
  multiplyScalar(t) {
    return this.r *= t, this.g *= t, this.b *= t, this;
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
  lerp(t, e) {
    return this.r += (t.r - this.r) * e, this.g += (t.g - this.g) * e, this.b += (t.b - this.b) * e, this;
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
  lerpColors(t, e, n) {
    return this.r = t.r + (e.r - t.r) * n, this.g = t.g + (e.g - t.g) * n, this.b = t.b + (e.b - t.b) * n, this;
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
  lerpHSL(t, e) {
    this.getHSL(Yn), t.getHSL(Fr);
    const n = ur(Yn.h, Fr.h, e), r = ur(Yn.s, Fr.s, e), s = ur(Yn.l, Fr.l, e);
    return this.setHSL(n, r, s), this;
  }
  /**
   * Sets the color's RGB components from the given 3D vector.
   *
   * @param {Vector3} v - The vector to set.
   * @return {Color} A reference to this color.
   */
  setFromVector3(t) {
    return this.r = t.x, this.g = t.y, this.b = t.z, this;
  }
  /**
   * Transforms this color with the given 3x3 matrix.
   *
   * @param {Matrix3} m - The matrix.
   * @return {Color} A reference to this color.
   */
  applyMatrix3(t) {
    const e = this.r, n = this.g, r = this.b, s = t.elements;
    return this.r = s[0] * e + s[3] * n + s[6] * r, this.g = s[1] * e + s[4] * n + s[7] * r, this.b = s[2] * e + s[5] * n + s[8] * r, this;
  }
  /**
   * Returns `true` if this color is equal with the given one.
   *
   * @param {Color} c - The color to test for equality.
   * @return {boolean} Whether this bounding color is equal with the given one.
   */
  equals(t) {
    return t.r === this.r && t.g === this.g && t.b === this.b;
  }
  /**
   * Sets this color's RGB components from the given array.
   *
   * @param {Array<number>} array - An array holding the RGB values.
   * @param {number} [offset=0] - The offset into the array.
   * @return {Color} A reference to this color.
   */
  fromArray(t, e = 0) {
    return this.r = t[e], this.g = t[e + 1], this.b = t[e + 2], this;
  }
  /**
   * Writes the RGB components of this color to the given array. If no array is provided,
   * the method returns a new instance.
   *
   * @param {Array<number>} [array=[]] - The target array holding the color components.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Array<number>} The color components.
   */
  toArray(t = [], e = 0) {
    return t[e] = this.r, t[e + 1] = this.g, t[e + 2] = this.b, t;
  }
  /**
   * Sets the components of this color from the given buffer attribute.
   *
   * @param {BufferAttribute} attribute - The buffer attribute holding color data.
   * @param {number} index - The index into the attribute.
   * @return {Color} A reference to this color.
   */
  fromBufferAttribute(t, e) {
    return this.r = t.getX(e), this.g = t.getY(e), this.b = t.getZ(e), this;
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
const Be = /* @__PURE__ */ new Yt();
Yt.NAMES = ac;
let xd = 0;
class er extends yi {
  /**
   * Constructs a new material.
   */
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: xd++ }), this.uuid = Qi(), this.name = "", this.type = "Material", this.blending = Wi, this.side = ti, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = na, this.blendDst = ia, this.blendEquation = ui, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new Yt(0, 0, 0), this.blendAlpha = 0, this.depthFunc = Yi, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = Do, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = bi, this.stencilZFail = bi, this.stencilZPass = bi, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.allowOverride = !0, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
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
  set alphaTest(t) {
    this._alphaTest > 0 != t > 0 && this.version++, this._alphaTest = t;
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
  setValues(t) {
    if (t !== void 0)
      for (const e in t) {
        const n = t[e];
        if (n === void 0) {
          console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);
          continue;
        }
        const r = this[e];
        if (r === void 0) {
          console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);
          continue;
        }
        r && r.isColor ? r.set(n) : r && r.isVector3 && n && n.isVector3 ? r.copy(n) : this[e] = n;
      }
  }
  /**
   * Serializes the material into JSON.
   *
   * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
   * @return {Object} A JSON object representing the serialized material.
   * @see {@link ObjectLoader#parse}
   */
  toJSON(t) {
    const e = t === void 0 || typeof t == "string";
    e && (t = {
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
    n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(t).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(t).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(t).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.sheenColorMap && this.sheenColorMap.isTexture && (n.sheenColorMap = this.sheenColorMap.toJSON(t).uuid), this.sheenRoughnessMap && this.sheenRoughnessMap.isTexture && (n.sheenRoughnessMap = this.sheenRoughnessMap.toJSON(t).uuid), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(t).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(t).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(t).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(t).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(t).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(t).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(t).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(t).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(t).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(t).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(t).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(t).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(t).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(t).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(t).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(t).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(t).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(t).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(t).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(t).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(t).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== Wi && (n.blending = this.blending), this.side !== ti && (n.side = this.side), this.vertexColors === !0 && (n.vertexColors = !0), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === !0 && (n.transparent = !0), this.blendSrc !== na && (n.blendSrc = this.blendSrc), this.blendDst !== ia && (n.blendDst = this.blendDst), this.blendEquation !== ui && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== Yi && (n.depthFunc = this.depthFunc), this.depthTest === !1 && (n.depthTest = this.depthTest), this.depthWrite === !1 && (n.depthWrite = this.depthWrite), this.colorWrite === !1 && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== Do && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== bi && (n.stencilFail = this.stencilFail), this.stencilZFail !== bi && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== bi && (n.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === !0 && (n.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === !0 && (n.dithering = !0), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === !0 && (n.alphaHash = !0), this.alphaToCoverage === !0 && (n.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0), this.forceSinglePass === !0 && (n.forceSinglePass = !0), this.wireframe === !0 && (n.wireframe = !0), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (n.flatShading = !0), this.visible === !1 && (n.visible = !1), this.toneMapped === !1 && (n.toneMapped = !1), this.fog === !1 && (n.fog = !1), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
    function r(s) {
      const a = [];
      for (const o in s) {
        const l = s[o];
        delete l.metadata, a.push(l);
      }
      return a;
    }
    if (e) {
      const s = r(t.textures), a = r(t.images);
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
  copy(t) {
    this.name = t.name, this.blending = t.blending, this.side = t.side, this.vertexColors = t.vertexColors, this.opacity = t.opacity, this.transparent = t.transparent, this.blendSrc = t.blendSrc, this.blendDst = t.blendDst, this.blendEquation = t.blendEquation, this.blendSrcAlpha = t.blendSrcAlpha, this.blendDstAlpha = t.blendDstAlpha, this.blendEquationAlpha = t.blendEquationAlpha, this.blendColor.copy(t.blendColor), this.blendAlpha = t.blendAlpha, this.depthFunc = t.depthFunc, this.depthTest = t.depthTest, this.depthWrite = t.depthWrite, this.stencilWriteMask = t.stencilWriteMask, this.stencilFunc = t.stencilFunc, this.stencilRef = t.stencilRef, this.stencilFuncMask = t.stencilFuncMask, this.stencilFail = t.stencilFail, this.stencilZFail = t.stencilZFail, this.stencilZPass = t.stencilZPass, this.stencilWrite = t.stencilWrite;
    const e = t.clippingPlanes;
    let n = null;
    if (e !== null) {
      const r = e.length;
      n = new Array(r);
      for (let s = 0; s !== r; ++s)
        n[s] = e[s].clone();
    }
    return this.clippingPlanes = n, this.clipIntersection = t.clipIntersection, this.clipShadows = t.clipShadows, this.shadowSide = t.shadowSide, this.colorWrite = t.colorWrite, this.precision = t.precision, this.polygonOffset = t.polygonOffset, this.polygonOffsetFactor = t.polygonOffsetFactor, this.polygonOffsetUnits = t.polygonOffsetUnits, this.dithering = t.dithering, this.alphaTest = t.alphaTest, this.alphaHash = t.alphaHash, this.alphaToCoverage = t.alphaToCoverage, this.premultipliedAlpha = t.premultipliedAlpha, this.forceSinglePass = t.forceSinglePass, this.visible = t.visible, this.toneMapped = t.toneMapped, this.userData = JSON.parse(JSON.stringify(t.userData)), this;
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
  set needsUpdate(t) {
    t === !0 && this.version++;
  }
}
class Mi extends er {
  /**
   * Constructs a new mesh basic material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(t) {
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new Yt(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Dn(), this.combine = Xl, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.specularMap = t.specularMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.combine = t.combine, this.reflectivity = t.reflectivity, this.refractionRatio = t.refractionRatio, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.fog = t.fog, this;
  }
}
const Se = /* @__PURE__ */ new I(), Or = /* @__PURE__ */ new It();
let Md = 0;
class xn {
  /**
   * Constructs a new buffer attribute.
   *
   * @param {TypedArray} array - The array holding the attribute data.
   * @param {number} itemSize - The item size.
   * @param {boolean} [normalized=false] - Whether the data are normalized or not.
   */
  constructor(t, e, n = !1) {
    if (Array.isArray(t))
      throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
    this.isBufferAttribute = !0, Object.defineProperty(this, "id", { value: Md++ }), this.name = "", this.array = t, this.itemSize = e, this.count = t !== void 0 ? t.length / e : 0, this.normalized = n, this.usage = Lo, this.updateRanges = [], this.gpuType = zn, this.version = 0;
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
  set needsUpdate(t) {
    t === !0 && this.version++;
  }
  /**
   * Sets the usage of this buffer attribute.
   *
   * @param {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)} value - The usage to set.
   * @return {BufferAttribute} A reference to this buffer attribute.
   */
  setUsage(t) {
    return this.usage = t, this;
  }
  /**
   * Adds a range of data in the data array to be updated on the GPU.
   *
   * @param {number} start - Position at which to start update.
   * @param {number} count - The number of components to update.
   */
  addUpdateRange(t, e) {
    this.updateRanges.push({ start: t, count: e });
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
  copy(t) {
    return this.name = t.name, this.array = new t.array.constructor(t.array), this.itemSize = t.itemSize, this.count = t.count, this.normalized = t.normalized, this.usage = t.usage, this.gpuType = t.gpuType, this;
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
  copyAt(t, e, n) {
    t *= this.itemSize, n *= e.itemSize;
    for (let r = 0, s = this.itemSize; r < s; r++)
      this.array[t + r] = e.array[n + r];
    return this;
  }
  /**
   * Copies the given array data into this buffer attribute.
   *
   * @param {(TypedArray|Array)} array - The array to copy.
   * @return {BufferAttribute} A reference to this instance.
   */
  copyArray(t) {
    return this.array.set(t), this;
  }
  /**
   * Applies the given 3x3 matrix to the given attribute. Works with
   * item size `2` and `3`.
   *
   * @param {Matrix3} m - The matrix to apply.
   * @return {BufferAttribute} A reference to this instance.
   */
  applyMatrix3(t) {
    if (this.itemSize === 2)
      for (let e = 0, n = this.count; e < n; e++)
        Or.fromBufferAttribute(this, e), Or.applyMatrix3(t), this.setXY(e, Or.x, Or.y);
    else if (this.itemSize === 3)
      for (let e = 0, n = this.count; e < n; e++)
        Se.fromBufferAttribute(this, e), Se.applyMatrix3(t), this.setXYZ(e, Se.x, Se.y, Se.z);
    return this;
  }
  /**
   * Applies the given 4x4 matrix to the given attribute. Only works with
   * item size `3`.
   *
   * @param {Matrix4} m - The matrix to apply.
   * @return {BufferAttribute} A reference to this instance.
   */
  applyMatrix4(t) {
    for (let e = 0, n = this.count; e < n; e++)
      Se.fromBufferAttribute(this, e), Se.applyMatrix4(t), this.setXYZ(e, Se.x, Se.y, Se.z);
    return this;
  }
  /**
   * Applies the given 3x3 normal matrix to the given attribute. Only works with
   * item size `3`.
   *
   * @param {Matrix3} m - The normal matrix to apply.
   * @return {BufferAttribute} A reference to this instance.
   */
  applyNormalMatrix(t) {
    for (let e = 0, n = this.count; e < n; e++)
      Se.fromBufferAttribute(this, e), Se.applyNormalMatrix(t), this.setXYZ(e, Se.x, Se.y, Se.z);
    return this;
  }
  /**
   * Applies the given 4x4 matrix to the given attribute. Only works with
   * item size `3` and with direction vectors.
   *
   * @param {Matrix4} m - The matrix to apply.
   * @return {BufferAttribute} A reference to this instance.
   */
  transformDirection(t) {
    for (let e = 0, n = this.count; e < n; e++)
      Se.fromBufferAttribute(this, e), Se.transformDirection(t), this.setXYZ(e, Se.x, Se.y, Se.z);
    return this;
  }
  /**
   * Sets the given array data in the buffer attribute.
   *
   * @param {(TypedArray|Array)} value - The array data to set.
   * @param {number} [offset=0] - The offset in this buffer attribute's array.
   * @return {BufferAttribute} A reference to this instance.
   */
  set(t, e = 0) {
    return this.array.set(t, e), this;
  }
  /**
   * Returns the given component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} component - The component index.
   * @return {number} The returned value.
   */
  getComponent(t, e) {
    let n = this.array[t * this.itemSize + e];
    return this.normalized && (n = Bi(n, this.array)), n;
  }
  /**
   * Sets the given value to the given component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} component - The component index.
   * @param {number} value - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setComponent(t, e, n) {
    return this.normalized && (n = Ve(n, this.array)), this.array[t * this.itemSize + e] = n, this;
  }
  /**
   * Returns the x component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @return {number} The x component.
   */
  getX(t) {
    let e = this.array[t * this.itemSize];
    return this.normalized && (e = Bi(e, this.array)), e;
  }
  /**
   * Sets the x component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} x - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setX(t, e) {
    return this.normalized && (e = Ve(e, this.array)), this.array[t * this.itemSize] = e, this;
  }
  /**
   * Returns the y component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @return {number} The y component.
   */
  getY(t) {
    let e = this.array[t * this.itemSize + 1];
    return this.normalized && (e = Bi(e, this.array)), e;
  }
  /**
   * Sets the y component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} y - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setY(t, e) {
    return this.normalized && (e = Ve(e, this.array)), this.array[t * this.itemSize + 1] = e, this;
  }
  /**
   * Returns the z component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @return {number} The z component.
   */
  getZ(t) {
    let e = this.array[t * this.itemSize + 2];
    return this.normalized && (e = Bi(e, this.array)), e;
  }
  /**
   * Sets the z component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} z - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setZ(t, e) {
    return this.normalized && (e = Ve(e, this.array)), this.array[t * this.itemSize + 2] = e, this;
  }
  /**
   * Returns the w component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @return {number} The w component.
   */
  getW(t) {
    let e = this.array[t * this.itemSize + 3];
    return this.normalized && (e = Bi(e, this.array)), e;
  }
  /**
   * Sets the w component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} w - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setW(t, e) {
    return this.normalized && (e = Ve(e, this.array)), this.array[t * this.itemSize + 3] = e, this;
  }
  /**
   * Sets the x and y component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} x - The value for the x component to set.
   * @param {number} y - The value for the y component to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setXY(t, e, n) {
    return t *= this.itemSize, this.normalized && (e = Ve(e, this.array), n = Ve(n, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this;
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
  setXYZ(t, e, n, r) {
    return t *= this.itemSize, this.normalized && (e = Ve(e, this.array), n = Ve(n, this.array), r = Ve(r, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = r, this;
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
  setXYZW(t, e, n, r, s) {
    return t *= this.itemSize, this.normalized && (e = Ve(e, this.array), n = Ve(n, this.array), r = Ve(r, this.array), s = Ve(s, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = r, this.array[t + 3] = s, this;
  }
  /**
   * Sets the given callback function that is executed after the Renderer has transferred
   * the attribute array data to the GPU. Can be used to perform clean-up operations after
   * the upload when attribute data are not needed anymore on the CPU side.
   *
   * @param {Function} callback - The `onUpload()` callback.
   * @return {BufferAttribute} A reference to this instance.
   */
  onUpload(t) {
    return this.onUploadCallback = t, this;
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
    const t = {
      itemSize: this.itemSize,
      type: this.array.constructor.name,
      array: Array.from(this.array),
      normalized: this.normalized
    };
    return this.name !== "" && (t.name = this.name), this.usage !== Lo && (t.usage = this.usage), t;
  }
}
class oc extends xn {
  /**
   * Constructs a new buffer attribute.
   *
   * @param {(Array<number>|Uint16Array)} array - The array holding the attribute data.
   * @param {number} itemSize - The item size.
   * @param {boolean} [normalized=false] - Whether the data are normalized or not.
   */
  constructor(t, e, n) {
    super(new Uint16Array(t), e, n);
  }
}
class lc extends xn {
  /**
   * Constructs a new buffer attribute.
   *
   * @param {(Array<number>|Uint32Array)} array - The array holding the attribute data.
   * @param {number} itemSize - The item size.
   * @param {boolean} [normalized=false] - Whether the data are normalized or not.
   */
  constructor(t, e, n) {
    super(new Uint32Array(t), e, n);
  }
}
class wn extends xn {
  /**
   * Constructs a new buffer attribute.
   *
   * @param {(Array<number>|Float32Array)} array - The array holding the attribute data.
   * @param {number} itemSize - The item size.
   * @param {boolean} [normalized=false] - Whether the data are normalized or not.
   */
  constructor(t, e, n) {
    super(new Float32Array(t), e, n);
  }
}
let Sd = 0;
const sn = /* @__PURE__ */ new le(), Bs = /* @__PURE__ */ new Te(), Ui = /* @__PURE__ */ new I(), tn = /* @__PURE__ */ new tr(), lr = /* @__PURE__ */ new tr(), Pe = /* @__PURE__ */ new I();
class hn extends yi {
  /**
   * Constructs a new geometry.
   */
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: Sd++ }), this.uuid = Qi(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
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
  setIndex(t) {
    return Array.isArray(t) ? this.index = new (rc(t) ? lc : oc)(t, 1) : this.index = t, this;
  }
  /**
   * Sets the given indirect attribute to this geometry.
   *
   * @param {BufferAttribute} indirect - The attribute holding indirect draw calls.
   * @return {BufferGeometry} A reference to this instance.
   */
  setIndirect(t) {
    return this.indirect = t, this;
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
  getAttribute(t) {
    return this.attributes[t];
  }
  /**
   * Sets the given attribute for the given name.
   *
   * @param {string} name - The attribute name.
   * @param {BufferAttribute|InterleavedBufferAttribute} attribute - The attribute to set.
   * @return {BufferGeometry} A reference to this instance.
   */
  setAttribute(t, e) {
    return this.attributes[t] = e, this;
  }
  /**
   * Deletes the attribute for the given name.
   *
   * @param {string} name - The attribute name to delete.
   * @return {BufferGeometry} A reference to this instance.
   */
  deleteAttribute(t) {
    return delete this.attributes[t], this;
  }
  /**
   * Returns `true` if this geometry has an attribute for the given name.
   *
   * @param {string} name - The attribute name.
   * @return {boolean} Whether this geometry has an attribute for the given name or not.
   */
  hasAttribute(t) {
    return this.attributes[t] !== void 0;
  }
  /**
   * Adds a group to this geometry.
   *
   * @param {number} start - The first element in this draw call. That is the first
   * vertex for non-indexed geometry, otherwise the first triangle index.
   * @param {number} count - Specifies how many vertices (or indices) are part of this group.
   * @param {number} [materialIndex=0] - The material array index to use.
   */
  addGroup(t, e, n = 0) {
    this.groups.push({
      start: t,
      count: e,
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
  setDrawRange(t, e) {
    this.drawRange.start = t, this.drawRange.count = e;
  }
  /**
   * Applies the given 4x4 transformation matrix to the geometry.
   *
   * @param {Matrix4} matrix - The matrix to apply.
   * @return {BufferGeometry} A reference to this instance.
   */
  applyMatrix4(t) {
    const e = this.attributes.position;
    e !== void 0 && (e.applyMatrix4(t), e.needsUpdate = !0);
    const n = this.attributes.normal;
    if (n !== void 0) {
      const s = new zt().getNormalMatrix(t);
      n.applyNormalMatrix(s), n.needsUpdate = !0;
    }
    const r = this.attributes.tangent;
    return r !== void 0 && (r.transformDirection(t), r.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  /**
   * Applies the rotation represented by the Quaternion to the geometry.
   *
   * @param {Quaternion} q - The Quaternion to apply.
   * @return {BufferGeometry} A reference to this instance.
   */
  applyQuaternion(t) {
    return sn.makeRotationFromQuaternion(t), this.applyMatrix4(sn), this;
  }
  /**
   * Rotates the geometry about the X axis. This is typically done as a one time
   * operation, and not during a loop. Use {@link Object3D#rotation} for typical
   * real-time mesh rotation.
   *
   * @param {number} angle - The angle in radians.
   * @return {BufferGeometry} A reference to this instance.
   */
  rotateX(t) {
    return sn.makeRotationX(t), this.applyMatrix4(sn), this;
  }
  /**
   * Rotates the geometry about the Y axis. This is typically done as a one time
   * operation, and not during a loop. Use {@link Object3D#rotation} for typical
   * real-time mesh rotation.
   *
   * @param {number} angle - The angle in radians.
   * @return {BufferGeometry} A reference to this instance.
   */
  rotateY(t) {
    return sn.makeRotationY(t), this.applyMatrix4(sn), this;
  }
  /**
   * Rotates the geometry about the Z axis. This is typically done as a one time
   * operation, and not during a loop. Use {@link Object3D#rotation} for typical
   * real-time mesh rotation.
   *
   * @param {number} angle - The angle in radians.
   * @return {BufferGeometry} A reference to this instance.
   */
  rotateZ(t) {
    return sn.makeRotationZ(t), this.applyMatrix4(sn), this;
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
  translate(t, e, n) {
    return sn.makeTranslation(t, e, n), this.applyMatrix4(sn), this;
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
  scale(t, e, n) {
    return sn.makeScale(t, e, n), this.applyMatrix4(sn), this;
  }
  /**
   * Rotates the geometry to face a point in 3D space. This is typically done as a one time
   * operation, and not during a loop. Use {@link Object3D#lookAt} for typical
   * real-time mesh rotation.
   *
   * @param {Vector3} vector - The target point.
   * @return {BufferGeometry} A reference to this instance.
   */
  lookAt(t) {
    return Bs.lookAt(t), Bs.updateMatrix(), this.applyMatrix4(Bs.matrix), this;
  }
  /**
   * Center the geometry based on its bounding box.
   *
   * @return {BufferGeometry} A reference to this instance.
   */
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(Ui).negate(), this.translate(Ui.x, Ui.y, Ui.z), this;
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
  setFromPoints(t) {
    const e = this.getAttribute("position");
    if (e === void 0) {
      const n = [];
      for (let r = 0, s = t.length; r < s; r++) {
        const a = t[r];
        n.push(a.x, a.y, a.z || 0);
      }
      this.setAttribute("position", new wn(n, 3));
    } else {
      const n = Math.min(t.length, e.count);
      for (let r = 0; r < n; r++) {
        const s = t[r];
        e.setXYZ(r, s.x, s.y, s.z || 0);
      }
      t.length > e.count && console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."), e.needsUpdate = !0;
    }
    return this;
  }
  /**
   * Computes the bounding box of the geometry, and updates the `boundingBox` member.
   * The bounding box is not computed by the engine; it must be computed by your app.
   * You may need to recompute the bounding box if the geometry vertices are modified.
   */
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new tr());
    const t = this.attributes.position, e = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(
        new I(-1 / 0, -1 / 0, -1 / 0),
        new I(1 / 0, 1 / 0, 1 / 0)
      );
      return;
    }
    if (t !== void 0) {
      if (this.boundingBox.setFromBufferAttribute(t), e)
        for (let n = 0, r = e.length; n < r; n++) {
          const s = e[n];
          tn.setFromBufferAttribute(s), this.morphTargetsRelative ? (Pe.addVectors(this.boundingBox.min, tn.min), this.boundingBox.expandByPoint(Pe), Pe.addVectors(this.boundingBox.max, tn.max), this.boundingBox.expandByPoint(Pe)) : (this.boundingBox.expandByPoint(tn.min), this.boundingBox.expandByPoint(tn.max));
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
    this.boundingSphere === null && (this.boundingSphere = new ps());
    const t = this.attributes.position, e = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new I(), 1 / 0);
      return;
    }
    if (t) {
      const n = this.boundingSphere.center;
      if (tn.setFromBufferAttribute(t), e)
        for (let s = 0, a = e.length; s < a; s++) {
          const o = e[s];
          lr.setFromBufferAttribute(o), this.morphTargetsRelative ? (Pe.addVectors(tn.min, lr.min), tn.expandByPoint(Pe), Pe.addVectors(tn.max, lr.max), tn.expandByPoint(Pe)) : (tn.expandByPoint(lr.min), tn.expandByPoint(lr.max));
        }
      tn.getCenter(n);
      let r = 0;
      for (let s = 0, a = t.count; s < a; s++)
        Pe.fromBufferAttribute(t, s), r = Math.max(r, n.distanceToSquared(Pe));
      if (e)
        for (let s = 0, a = e.length; s < a; s++) {
          const o = e[s], l = this.morphTargetsRelative;
          for (let c = 0, h = o.count; c < h; c++)
            Pe.fromBufferAttribute(o, c), l && (Ui.fromBufferAttribute(t, c), Pe.add(Ui)), r = Math.max(r, n.distanceToSquared(Pe));
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
    const t = this.index, e = this.attributes;
    if (t === null || e.position === void 0 || e.normal === void 0 || e.uv === void 0) {
      console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
      return;
    }
    const n = e.position, r = e.normal, s = e.uv;
    this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new xn(new Float32Array(4 * n.count), 4));
    const a = this.getAttribute("tangent"), o = [], l = [];
    for (let F = 0; F < n.count; F++)
      o[F] = new I(), l[F] = new I();
    const c = new I(), h = new I(), d = new I(), f = new It(), p = new It(), g = new It(), _ = new I(), m = new I();
    function u(F, M, S) {
      c.fromBufferAttribute(n, F), h.fromBufferAttribute(n, M), d.fromBufferAttribute(n, S), f.fromBufferAttribute(s, F), p.fromBufferAttribute(s, M), g.fromBufferAttribute(s, S), h.sub(c), d.sub(c), p.sub(f), g.sub(f);
      const P = 1 / (p.x * g.y - g.x * p.y);
      isFinite(P) && (_.copy(h).multiplyScalar(g.y).addScaledVector(d, -p.y).multiplyScalar(P), m.copy(d).multiplyScalar(p.x).addScaledVector(h, -g.x).multiplyScalar(P), o[F].add(_), o[M].add(_), o[S].add(_), l[F].add(m), l[M].add(m), l[S].add(m));
    }
    let T = this.groups;
    T.length === 0 && (T = [{
      start: 0,
      count: t.count
    }]);
    for (let F = 0, M = T.length; F < M; ++F) {
      const S = T[F], P = S.start, V = S.count;
      for (let X = P, U = P + V; X < U; X += 3)
        u(
          t.getX(X + 0),
          t.getX(X + 1),
          t.getX(X + 2)
        );
    }
    const b = new I(), y = new I(), w = new I(), R = new I();
    function C(F) {
      w.fromBufferAttribute(r, F), R.copy(w);
      const M = o[F];
      b.copy(M), b.sub(w.multiplyScalar(w.dot(M))).normalize(), y.crossVectors(R, M);
      const P = y.dot(l[F]) < 0 ? -1 : 1;
      a.setXYZW(F, b.x, b.y, b.z, P);
    }
    for (let F = 0, M = T.length; F < M; ++F) {
      const S = T[F], P = S.start, V = S.count;
      for (let X = P, U = P + V; X < U; X += 3)
        C(t.getX(X + 0)), C(t.getX(X + 1)), C(t.getX(X + 2));
    }
  }
  /**
   * Computes vertex normals for the given vertex data. For indexed geometries, the method sets
   * each vertex normal to be the average of the face normals of the faces that share that vertex.
   * For non-indexed geometries, vertices are not shared, and the method sets each vertex normal
   * to be the same as the face normal.
   */
  computeVertexNormals() {
    const t = this.index, e = this.getAttribute("position");
    if (e !== void 0) {
      let n = this.getAttribute("normal");
      if (n === void 0)
        n = new xn(new Float32Array(e.count * 3), 3), this.setAttribute("normal", n);
      else
        for (let f = 0, p = n.count; f < p; f++)
          n.setXYZ(f, 0, 0, 0);
      const r = new I(), s = new I(), a = new I(), o = new I(), l = new I(), c = new I(), h = new I(), d = new I();
      if (t)
        for (let f = 0, p = t.count; f < p; f += 3) {
          const g = t.getX(f + 0), _ = t.getX(f + 1), m = t.getX(f + 2);
          r.fromBufferAttribute(e, g), s.fromBufferAttribute(e, _), a.fromBufferAttribute(e, m), h.subVectors(a, s), d.subVectors(r, s), h.cross(d), o.fromBufferAttribute(n, g), l.fromBufferAttribute(n, _), c.fromBufferAttribute(n, m), o.add(h), l.add(h), c.add(h), n.setXYZ(g, o.x, o.y, o.z), n.setXYZ(_, l.x, l.y, l.z), n.setXYZ(m, c.x, c.y, c.z);
        }
      else
        for (let f = 0, p = e.count; f < p; f += 3)
          r.fromBufferAttribute(e, f + 0), s.fromBufferAttribute(e, f + 1), a.fromBufferAttribute(e, f + 2), h.subVectors(a, s), d.subVectors(r, s), h.cross(d), n.setXYZ(f + 0, h.x, h.y, h.z), n.setXYZ(f + 1, h.x, h.y, h.z), n.setXYZ(f + 2, h.x, h.y, h.z);
      this.normalizeNormals(), n.needsUpdate = !0;
    }
  }
  /**
   * Ensures every normal vector in a geometry will have a magnitude of `1`. This will
   * correct lighting on the geometry surfaces.
   */
  normalizeNormals() {
    const t = this.attributes.normal;
    for (let e = 0, n = t.count; e < n; e++)
      Pe.fromBufferAttribute(t, e), Pe.normalize(), t.setXYZ(e, Pe.x, Pe.y, Pe.z);
  }
  /**
   * Return a new non-index version of this indexed geometry. If the geometry
   * is already non-indexed, the method is a NOOP.
   *
   * @return {BufferGeometry} The non-indexed version of this indexed geometry.
   */
  toNonIndexed() {
    function t(o, l) {
      const c = o.array, h = o.itemSize, d = o.normalized, f = new c.constructor(l.length * h);
      let p = 0, g = 0;
      for (let _ = 0, m = l.length; _ < m; _++) {
        o.isInterleavedBufferAttribute ? p = l[_] * o.data.stride + o.offset : p = l[_] * h;
        for (let u = 0; u < h; u++)
          f[g++] = c[p++];
      }
      return new xn(f, h, d);
    }
    if (this.index === null)
      return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    const e = new hn(), n = this.index.array, r = this.attributes;
    for (const o in r) {
      const l = r[o], c = t(l, n);
      e.setAttribute(o, c);
    }
    const s = this.morphAttributes;
    for (const o in s) {
      const l = [], c = s[o];
      for (let h = 0, d = c.length; h < d; h++) {
        const f = c[h], p = t(f, n);
        l.push(p);
      }
      e.morphAttributes[o] = l;
    }
    e.morphTargetsRelative = this.morphTargetsRelative;
    const a = this.groups;
    for (let o = 0, l = a.length; o < l; o++) {
      const c = a[o];
      e.addGroup(c.start, c.count, c.materialIndex);
    }
    return e;
  }
  /**
   * Serializes the geometry into JSON.
   *
   * @return {Object} A JSON object representing the serialized geometry.
   */
  toJSON() {
    const t = {
      metadata: {
        version: 4.7,
        type: "BufferGeometry",
        generator: "BufferGeometry.toJSON"
      }
    };
    if (t.uuid = this.uuid, t.type = this.type, this.name !== "" && (t.name = this.name), Object.keys(this.userData).length > 0 && (t.userData = this.userData), this.parameters !== void 0) {
      const l = this.parameters;
      for (const c in l)
        l[c] !== void 0 && (t[c] = l[c]);
      return t;
    }
    t.data = { attributes: {} };
    const e = this.index;
    e !== null && (t.data.index = {
      type: e.array.constructor.name,
      array: Array.prototype.slice.call(e.array)
    });
    const n = this.attributes;
    for (const l in n) {
      const c = n[l];
      t.data.attributes[l] = c.toJSON(t.data);
    }
    const r = {};
    let s = !1;
    for (const l in this.morphAttributes) {
      const c = this.morphAttributes[l], h = [];
      for (let d = 0, f = c.length; d < f; d++) {
        const p = c[d];
        h.push(p.toJSON(t.data));
      }
      h.length > 0 && (r[l] = h, s = !0);
    }
    s && (t.data.morphAttributes = r, t.data.morphTargetsRelative = this.morphTargetsRelative);
    const a = this.groups;
    a.length > 0 && (t.data.groups = JSON.parse(JSON.stringify(a)));
    const o = this.boundingSphere;
    return o !== null && (t.data.boundingSphere = o.toJSON()), t;
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
  copy(t) {
    this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
    const e = {};
    this.name = t.name;
    const n = t.index;
    n !== null && this.setIndex(n.clone());
    const r = t.attributes;
    for (const c in r) {
      const h = r[c];
      this.setAttribute(c, h.clone(e));
    }
    const s = t.morphAttributes;
    for (const c in s) {
      const h = [], d = s[c];
      for (let f = 0, p = d.length; f < p; f++)
        h.push(d[f].clone(e));
      this.morphAttributes[c] = h;
    }
    this.morphTargetsRelative = t.morphTargetsRelative;
    const a = t.groups;
    for (let c = 0, h = a.length; c < h; c++) {
      const d = a[c];
      this.addGroup(d.start, d.count, d.materialIndex);
    }
    const o = t.boundingBox;
    o !== null && (this.boundingBox = o.clone());
    const l = t.boundingSphere;
    return l !== null && (this.boundingSphere = l.clone()), this.drawRange.start = t.drawRange.start, this.drawRange.count = t.drawRange.count, this.userData = t.userData, this;
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
const qo = /* @__PURE__ */ new le(), ai = /* @__PURE__ */ new ms(), kr = /* @__PURE__ */ new ps(), Yo = /* @__PURE__ */ new I(), Br = /* @__PURE__ */ new I(), zr = /* @__PURE__ */ new I(), Hr = /* @__PURE__ */ new I(), zs = /* @__PURE__ */ new I(), Vr = /* @__PURE__ */ new I(), jo = /* @__PURE__ */ new I(), Gr = /* @__PURE__ */ new I();
class Xe extends Te {
  /**
   * Constructs a new mesh.
   *
   * @param {BufferGeometry} [geometry] - The mesh geometry.
   * @param {Material|Array<Material>} [material] - The mesh material.
   */
  constructor(t = new hn(), e = new Mi()) {
    super(), this.isMesh = !0, this.type = "Mesh", this.geometry = t, this.material = e, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.count = 1, this.updateMorphTargets();
  }
  copy(t, e) {
    return super.copy(t, e), t.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = t.morphTargetInfluences.slice()), t.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, t.morphTargetDictionary)), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
  }
  /**
   * Sets the values of {@link Mesh#morphTargetDictionary} and {@link Mesh#morphTargetInfluences}
   * to make sure existing morph targets can influence this 3D object.
   */
  updateMorphTargets() {
    const e = this.geometry.morphAttributes, n = Object.keys(e);
    if (n.length > 0) {
      const r = e[n[0]];
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
  getVertexPosition(t, e) {
    const n = this.geometry, r = n.attributes.position, s = n.morphAttributes.position, a = n.morphTargetsRelative;
    e.fromBufferAttribute(r, t);
    const o = this.morphTargetInfluences;
    if (s && o) {
      Vr.set(0, 0, 0);
      for (let l = 0, c = s.length; l < c; l++) {
        const h = o[l], d = s[l];
        h !== 0 && (zs.fromBufferAttribute(d, t), a ? Vr.addScaledVector(zs, h) : Vr.addScaledVector(zs.sub(e), h));
      }
      e.add(Vr);
    }
    return e;
  }
  /**
   * Computes intersection points between a casted ray and this line.
   *
   * @param {Raycaster} raycaster - The raycaster.
   * @param {Array<Object>} intersects - The target array that holds the intersection points.
   */
  raycast(t, e) {
    const n = this.geometry, r = this.material, s = this.matrixWorld;
    r !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), kr.copy(n.boundingSphere), kr.applyMatrix4(s), ai.copy(t.ray).recast(t.near), !(kr.containsPoint(ai.origin) === !1 && (ai.intersectSphere(kr, Yo) === null || ai.origin.distanceToSquared(Yo) > (t.far - t.near) ** 2)) && (qo.copy(s).invert(), ai.copy(t.ray).applyMatrix4(qo), !(n.boundingBox !== null && ai.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(t, e, ai)));
  }
  _computeIntersections(t, e, n) {
    let r;
    const s = this.geometry, a = this.material, o = s.index, l = s.attributes.position, c = s.attributes.uv, h = s.attributes.uv1, d = s.attributes.normal, f = s.groups, p = s.drawRange;
    if (o !== null)
      if (Array.isArray(a))
        for (let g = 0, _ = f.length; g < _; g++) {
          const m = f[g], u = a[m.materialIndex], T = Math.max(m.start, p.start), b = Math.min(o.count, Math.min(m.start + m.count, p.start + p.count));
          for (let y = T, w = b; y < w; y += 3) {
            const R = o.getX(y), C = o.getX(y + 1), F = o.getX(y + 2);
            r = Wr(this, u, t, n, c, h, d, R, C, F), r && (r.faceIndex = Math.floor(y / 3), r.face.materialIndex = m.materialIndex, e.push(r));
          }
        }
      else {
        const g = Math.max(0, p.start), _ = Math.min(o.count, p.start + p.count);
        for (let m = g, u = _; m < u; m += 3) {
          const T = o.getX(m), b = o.getX(m + 1), y = o.getX(m + 2);
          r = Wr(this, a, t, n, c, h, d, T, b, y), r && (r.faceIndex = Math.floor(m / 3), e.push(r));
        }
      }
    else if (l !== void 0)
      if (Array.isArray(a))
        for (let g = 0, _ = f.length; g < _; g++) {
          const m = f[g], u = a[m.materialIndex], T = Math.max(m.start, p.start), b = Math.min(l.count, Math.min(m.start + m.count, p.start + p.count));
          for (let y = T, w = b; y < w; y += 3) {
            const R = y, C = y + 1, F = y + 2;
            r = Wr(this, u, t, n, c, h, d, R, C, F), r && (r.faceIndex = Math.floor(y / 3), r.face.materialIndex = m.materialIndex, e.push(r));
          }
        }
      else {
        const g = Math.max(0, p.start), _ = Math.min(l.count, p.start + p.count);
        for (let m = g, u = _; m < u; m += 3) {
          const T = m, b = m + 1, y = m + 2;
          r = Wr(this, a, t, n, c, h, d, T, b, y), r && (r.faceIndex = Math.floor(m / 3), e.push(r));
        }
      }
  }
}
function yd(i, t, e, n, r, s, a, o) {
  let l;
  if (t.side === Ke ? l = n.intersectTriangle(a, s, r, !0, o) : l = n.intersectTriangle(r, s, a, t.side === ti, o), l === null) return null;
  Gr.copy(o), Gr.applyMatrix4(i.matrixWorld);
  const c = e.ray.origin.distanceTo(Gr);
  return c < e.near || c > e.far ? null : {
    distance: c,
    point: Gr.clone(),
    object: i
  };
}
function Wr(i, t, e, n, r, s, a, o, l, c) {
  i.getVertexPosition(o, Br), i.getVertexPosition(l, zr), i.getVertexPosition(c, Hr);
  const h = yd(i, t, e, n, Br, zr, Hr, jo);
  if (h) {
    const d = new I();
    cn.getBarycoord(jo, Br, zr, Hr, d), r && (h.uv = cn.getInterpolatedAttribute(r, o, l, c, d, new It())), s && (h.uv1 = cn.getInterpolatedAttribute(s, o, l, c, d, new It())), a && (h.normal = cn.getInterpolatedAttribute(a, o, l, c, d, new I()), h.normal.dot(n.direction) > 0 && h.normal.multiplyScalar(-1));
    const f = {
      a: o,
      b: l,
      c,
      normal: new I(),
      materialIndex: 0
    };
    cn.getNormal(Br, zr, Hr, f.normal), h.face = f, h.barycoord = d;
  }
  return h;
}
class An extends hn {
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
  constructor(t = 1, e = 1, n = 1, r = 1, s = 1, a = 1) {
    super(), this.type = "BoxGeometry", this.parameters = {
      width: t,
      height: e,
      depth: n,
      widthSegments: r,
      heightSegments: s,
      depthSegments: a
    };
    const o = this;
    r = Math.floor(r), s = Math.floor(s), a = Math.floor(a);
    const l = [], c = [], h = [], d = [];
    let f = 0, p = 0;
    g("z", "y", "x", -1, -1, n, e, t, a, s, 0), g("z", "y", "x", 1, -1, n, e, -t, a, s, 1), g("x", "z", "y", 1, 1, t, n, e, r, a, 2), g("x", "z", "y", 1, -1, t, n, -e, r, a, 3), g("x", "y", "z", 1, -1, t, e, n, r, s, 4), g("x", "y", "z", -1, -1, t, e, -n, r, s, 5), this.setIndex(l), this.setAttribute("position", new wn(c, 3)), this.setAttribute("normal", new wn(h, 3)), this.setAttribute("uv", new wn(d, 2));
    function g(_, m, u, T, b, y, w, R, C, F, M) {
      const S = y / C, P = w / F, V = y / 2, X = w / 2, U = R / 2, k = C + 1, H = F + 1;
      let B = 0, D = 0;
      const j = new I();
      for (let at = 0; at < H; at++) {
        const dt = at * P - X;
        for (let Wt = 0; Wt < k; Wt++) {
          const Qt = Wt * S - V;
          j[_] = Qt * T, j[m] = dt * b, j[u] = U, c.push(j.x, j.y, j.z), j[_] = 0, j[m] = 0, j[u] = R > 0 ? 1 : -1, h.push(j.x, j.y, j.z), d.push(Wt / C), d.push(1 - at / F), B += 1;
        }
      }
      for (let at = 0; at < F; at++)
        for (let dt = 0; dt < C; dt++) {
          const Wt = f + dt + k * at, Qt = f + dt + k * (at + 1), Xt = f + (dt + 1) + k * (at + 1), kt = f + (dt + 1) + k * at;
          l.push(Wt, Qt, kt), l.push(Qt, Xt, kt), D += 6;
        }
      o.addGroup(p, D, M), p += D, f += B;
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  /**
   * Factory method for creating an instance of this class from the given
   * JSON object.
   *
   * @param {Object} data - A JSON object representing the serialized geometry.
   * @return {BoxGeometry} A new instance.
   */
  static fromJSON(t) {
    return new An(t.width, t.height, t.depth, t.widthSegments, t.heightSegments, t.depthSegments);
  }
}
function Ji(i) {
  const t = {};
  for (const e in i) {
    t[e] = {};
    for (const n in i[e]) {
      const r = i[e][n];
      r && (r.isColor || r.isMatrix3 || r.isMatrix4 || r.isVector2 || r.isVector3 || r.isVector4 || r.isTexture || r.isQuaternion) ? r.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), t[e][n] = null) : t[e][n] = r.clone() : Array.isArray(r) ? t[e][n] = r.slice() : t[e][n] = r;
    }
  }
  return t;
}
function Ge(i) {
  const t = {};
  for (let e = 0; e < i.length; e++) {
    const n = Ji(i[e]);
    for (const r in n)
      t[r] = n[r];
  }
  return t;
}
function Ed(i) {
  const t = [];
  for (let e = 0; e < i.length; e++)
    t.push(i[e].clone());
  return t;
}
function cc(i) {
  const t = i.getRenderTarget();
  return t === null ? i.outputColorSpace : t.isXRRenderTarget === !0 ? t.texture.colorSpace : Kt.workingColorSpace;
}
const bd = { clone: Ji, merge: Ge };
var Td = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, wd = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class ei extends er {
  /**
   * Constructs a new shader material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(t) {
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = Td, this.fragmentShader = wd, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
      clipCullDistance: !1,
      // set to use vertex shader clipping
      multiDraw: !1
      // set to use vertex shader multi_draw / enable gl_DrawID
    }, this.defaultAttributeValues = {
      color: [1, 1, 1],
      uv: [0, 0],
      uv1: [0, 0]
    }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, t !== void 0 && this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.fragmentShader = t.fragmentShader, this.vertexShader = t.vertexShader, this.uniforms = Ji(t.uniforms), this.uniformsGroups = Ed(t.uniformsGroups), this.defines = Object.assign({}, t.defines), this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.fog = t.fog, this.lights = t.lights, this.clipping = t.clipping, this.extensions = Object.assign({}, t.extensions), this.glslVersion = t.glslVersion, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    e.glslVersion = this.glslVersion, e.uniforms = {};
    for (const r in this.uniforms) {
      const a = this.uniforms[r].value;
      a && a.isTexture ? e.uniforms[r] = {
        type: "t",
        value: a.toJSON(t).uuid
      } : a && a.isColor ? e.uniforms[r] = {
        type: "c",
        value: a.getHex()
      } : a && a.isVector2 ? e.uniforms[r] = {
        type: "v2",
        value: a.toArray()
      } : a && a.isVector3 ? e.uniforms[r] = {
        type: "v3",
        value: a.toArray()
      } : a && a.isVector4 ? e.uniforms[r] = {
        type: "v4",
        value: a.toArray()
      } : a && a.isMatrix3 ? e.uniforms[r] = {
        type: "m3",
        value: a.toArray()
      } : a && a.isMatrix4 ? e.uniforms[r] = {
        type: "m4",
        value: a.toArray()
      } : e.uniforms[r] = {
        value: a
      };
    }
    Object.keys(this.defines).length > 0 && (e.defines = this.defines), e.vertexShader = this.vertexShader, e.fragmentShader = this.fragmentShader, e.lights = this.lights, e.clipping = this.clipping;
    const n = {};
    for (const r in this.extensions)
      this.extensions[r] === !0 && (n[r] = !0);
    return Object.keys(n).length > 0 && (e.extensions = n), e;
  }
}
class hc extends Te {
  /**
   * Constructs a new camera.
   */
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new le(), this.projectionMatrix = new le(), this.projectionMatrixInverse = new le(), this.coordinateSystem = Tn, this._reversedDepth = !1;
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
  copy(t, e) {
    return super.copy(t, e), this.matrixWorldInverse.copy(t.matrixWorldInverse), this.projectionMatrix.copy(t.projectionMatrix), this.projectionMatrixInverse.copy(t.projectionMatrixInverse), this.coordinateSystem = t.coordinateSystem, this;
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
  getWorldDirection(t) {
    return super.getWorldDirection(t).negate();
  }
  updateMatrixWorld(t) {
    super.updateMatrixWorld(t), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  updateWorldMatrix(t, e) {
    super.updateWorldMatrix(t, e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const jn = /* @__PURE__ */ new I(), Ko = /* @__PURE__ */ new It(), Zo = /* @__PURE__ */ new It();
class on extends hc {
  /**
   * Constructs a new perspective camera.
   *
   * @param {number} [fov=50] - The vertical field of view.
   * @param {number} [aspect=1] - The aspect ratio.
   * @param {number} [near=0.1] - The camera's near plane.
   * @param {number} [far=2000] - The camera's far plane.
   */
  constructor(t = 50, e = 1, n = 0.1, r = 2e3) {
    super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = t, this.zoom = 1, this.near = n, this.far = r, this.focus = 10, this.aspect = e, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
  }
  copy(t, e) {
    return super.copy(t, e), this.fov = t.fov, this.zoom = t.zoom, this.near = t.near, this.far = t.far, this.focus = t.focus, this.aspect = t.aspect, this.view = t.view === null ? null : Object.assign({}, t.view), this.filmGauge = t.filmGauge, this.filmOffset = t.filmOffset, this;
  }
  /**
   * Sets the FOV by focal length in respect to the current {@link PerspectiveCamera#filmGauge}.
   *
   * The default film gauge is 35, so that the focal length can be specified for
   * a 35mm (full frame) camera.
   *
   * @param {number} focalLength - Values for focal length and film gauge must have the same unit.
   */
  setFocalLength(t) {
    const e = 0.5 * this.getFilmHeight() / t;
    this.fov = Mr * 2 * Math.atan(e), this.updateProjectionMatrix();
  }
  /**
   * Returns the focal length from the current {@link PerspectiveCamera#fov} and
   * {@link PerspectiveCamera#filmGauge}.
   *
   * @return {number} The computed focal length.
   */
  getFocalLength() {
    const t = Math.tan(Xi * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / t;
  }
  /**
   * Returns the current vertical field of view angle in degrees considering {@link PerspectiveCamera#zoom}.
   *
   * @return {number} The effective FOV.
   */
  getEffectiveFOV() {
    return Mr * 2 * Math.atan(
      Math.tan(Xi * 0.5 * this.fov) / this.zoom
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
  getViewBounds(t, e, n) {
    jn.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), e.set(jn.x, jn.y).multiplyScalar(-t / jn.z), jn.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(jn.x, jn.y).multiplyScalar(-t / jn.z);
  }
  /**
   * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
   *
   * @param {number} distance - The viewing distance.
   * @param {Vector2} target - The target vector that is used to store result where x is width and y is height.
   * @returns {Vector2} The view size.
   */
  getViewSize(t, e) {
    return this.getViewBounds(t, Ko, Zo), e.subVectors(Zo, Ko);
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
  setViewOffset(t, e, n, r, s, a) {
    this.aspect = t / e, this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = t, this.view.fullHeight = e, this.view.offsetX = n, this.view.offsetY = r, this.view.width = s, this.view.height = a, this.updateProjectionMatrix();
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
    const t = this.near;
    let e = t * Math.tan(Xi * 0.5 * this.fov) / this.zoom, n = 2 * e, r = this.aspect * n, s = -0.5 * r;
    const a = this.view;
    if (this.view !== null && this.view.enabled) {
      const l = a.fullWidth, c = a.fullHeight;
      s += a.offsetX * r / l, e -= a.offsetY * n / c, r *= a.width / l, n *= a.height / c;
    }
    const o = this.filmOffset;
    o !== 0 && (s += t * o / this.getFilmWidth()), this.projectionMatrix.makePerspective(s, s + r, e, e - n, t, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return e.object.fov = this.fov, e.object.zoom = this.zoom, e.object.near = this.near, e.object.far = this.far, e.object.focus = this.focus, e.object.aspect = this.aspect, this.view !== null && (e.object.view = Object.assign({}, this.view)), e.object.filmGauge = this.filmGauge, e.object.filmOffset = this.filmOffset, e;
  }
}
const Ni = -90, Fi = 1;
class Ad extends Te {
  /**
   * Constructs a new cube camera.
   *
   * @param {number} near - The camera's near plane.
   * @param {number} far - The camera's far plane.
   * @param {WebGLCubeRenderTarget} renderTarget - The cube render target.
   */
  constructor(t, e, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const r = new on(Ni, Fi, t, e);
    r.layers = this.layers, this.add(r);
    const s = new on(Ni, Fi, t, e);
    s.layers = this.layers, this.add(s);
    const a = new on(Ni, Fi, t, e);
    a.layers = this.layers, this.add(a);
    const o = new on(Ni, Fi, t, e);
    o.layers = this.layers, this.add(o);
    const l = new on(Ni, Fi, t, e);
    l.layers = this.layers, this.add(l);
    const c = new on(Ni, Fi, t, e);
    c.layers = this.layers, this.add(c);
  }
  /**
   * Must be called when the coordinate system of the cube camera is changed.
   */
  updateCoordinateSystem() {
    const t = this.coordinateSystem, e = this.children.concat(), [n, r, s, a, o, l] = e;
    for (const c of e) this.remove(c);
    if (t === Tn)
      n.up.set(0, 1, 0), n.lookAt(1, 0, 0), r.up.set(0, 1, 0), r.lookAt(-1, 0, 0), s.up.set(0, 0, -1), s.lookAt(0, 1, 0), a.up.set(0, 0, 1), a.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), l.up.set(0, 1, 0), l.lookAt(0, 0, -1);
    else if (t === os)
      n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), r.up.set(0, -1, 0), r.lookAt(1, 0, 0), s.up.set(0, 0, 1), s.lookAt(0, 1, 0), a.up.set(0, 0, -1), a.lookAt(0, -1, 0), o.up.set(0, -1, 0), o.lookAt(0, 0, 1), l.up.set(0, -1, 0), l.lookAt(0, 0, -1);
    else
      throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + t);
    for (const c of e)
      this.add(c), c.updateMatrixWorld();
  }
  /**
   * Calling this method will render the given scene with the given renderer
   * into the cube render target of the camera.
   *
   * @param {(Renderer|WebGLRenderer)} renderer - The renderer.
   * @param {Scene} scene - The scene to render.
   */
  update(t, e) {
    this.parent === null && this.updateMatrixWorld();
    const { renderTarget: n, activeMipmapLevel: r } = this;
    this.coordinateSystem !== t.coordinateSystem && (this.coordinateSystem = t.coordinateSystem, this.updateCoordinateSystem());
    const [s, a, o, l, c, h] = this.children, d = t.getRenderTarget(), f = t.getActiveCubeFace(), p = t.getActiveMipmapLevel(), g = t.xr.enabled;
    t.xr.enabled = !1;
    const _ = n.texture.generateMipmaps;
    n.texture.generateMipmaps = !1, t.setRenderTarget(n, 0, r), t.render(e, s), t.setRenderTarget(n, 1, r), t.render(e, a), t.setRenderTarget(n, 2, r), t.render(e, o), t.setRenderTarget(n, 3, r), t.render(e, l), t.setRenderTarget(n, 4, r), t.render(e, c), n.texture.generateMipmaps = _, t.setRenderTarget(n, 5, r), t.render(e, h), t.setRenderTarget(d, f, p), t.xr.enabled = g, n.texture.needsPMREMUpdate = !0;
  }
}
class dc extends $e {
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
  constructor(t = [], e = ji, n, r, s, a, o, l, c, h) {
    super(t, e, n, r, s, a, o, l, c, h), this.isCubeTexture = !0, this.flipY = !1;
  }
  /**
   * Alias for {@link CubeTexture#image}.
   *
   * @type {Array<Image>}
   */
  get images() {
    return this.image;
  }
  set images(t) {
    this.image = t;
  }
}
class Rd extends xi {
  /**
   * Constructs a new cube render target.
   *
   * @param {number} [size=1] - The size of the render target.
   * @param {RenderTarget~Options} [options] - The configuration object.
   */
  constructor(t = 1, e = {}) {
    super(t, t, e), this.isWebGLCubeRenderTarget = !0;
    const n = { width: t, height: t, depth: 1 }, r = [n, n, n, n, n, n];
    this.texture = new dc(r), this._setTextureOptions(e), this.texture.isRenderTargetTexture = !0;
  }
  /**
   * Converts the given equirectangular texture to a cube map.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {Texture} texture - The equirectangular texture.
   * @return {WebGLCubeRenderTarget} A reference to this cube render target.
   */
  fromEquirectangularTexture(t, e) {
    this.texture.type = e.type, this.texture.colorSpace = e.colorSpace, this.texture.generateMipmaps = e.generateMipmaps, this.texture.minFilter = e.minFilter, this.texture.magFilter = e.magFilter;
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
    }, r = new An(5, 5, 5), s = new ei({
      name: "CubemapFromEquirect",
      uniforms: Ji(n.uniforms),
      vertexShader: n.vertexShader,
      fragmentShader: n.fragmentShader,
      side: Ke,
      blending: Zn
    });
    s.uniforms.tEquirect.value = e;
    const a = new Xe(r, s), o = e.minFilter;
    return e.minFilter === mi && (e.minFilter = bn), new Ad(1, 10, this).update(t, a), e.minFilter = o, a.geometry.dispose(), a.material.dispose(), this;
  }
  /**
   * Clears this cube render target.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {boolean} [color=true] - Whether the color buffer should be cleared or not.
   * @param {boolean} [depth=true] - Whether the depth buffer should be cleared or not.
   * @param {boolean} [stencil=true] - Whether the stencil buffer should be cleared or not.
   */
  clear(t, e = !0, n = !0, r = !0) {
    const s = t.getRenderTarget();
    for (let a = 0; a < 6; a++)
      t.setRenderTarget(this, a), t.clear(e, n, r);
    t.setRenderTarget(s);
  }
}
class en extends Te {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group";
  }
}
const Cd = { type: "move" };
class Hs {
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
    return this._hand === null && (this._hand = new en(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
  }
  /**
   * Returns a group representing the target ray space of the XR controller.
   *
   * @return {Group} A group representing the target ray space of the XR controller.
   */
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new en(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new I(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new I()), this._targetRay;
  }
  /**
   * Returns a group representing the grip space of the XR controller.
   *
   * @return {Group} A group representing the grip space of the XR controller.
   */
  getGripSpace() {
    return this._grip === null && (this._grip = new en(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new I(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new I()), this._grip;
  }
  /**
   * Dispatches the given event to the groups representing
   * the different coordinate spaces of the XR controller.
   *
   * @param {Object} event - The event to dispatch.
   * @return {WebXRController} A reference to this instance.
   */
  dispatchEvent(t) {
    return this._targetRay !== null && this._targetRay.dispatchEvent(t), this._grip !== null && this._grip.dispatchEvent(t), this._hand !== null && this._hand.dispatchEvent(t), this;
  }
  /**
   * Connects the controller with the given XR input source.
   *
   * @param {XRInputSource} inputSource - The input source.
   * @return {WebXRController} A reference to this instance.
   */
  connect(t) {
    if (t && t.hand) {
      const e = this._hand;
      if (e)
        for (const n of t.hand.values())
          this._getHandJoint(e, n);
    }
    return this.dispatchEvent({ type: "connected", data: t }), this;
  }
  /**
   * Disconnects the controller from the given XR input source.
   *
   * @param {XRInputSource} inputSource - The input source.
   * @return {WebXRController} A reference to this instance.
   */
  disconnect(t) {
    return this.dispatchEvent({ type: "disconnected", data: t }), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this;
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
  update(t, e, n) {
    let r = null, s = null, a = null;
    const o = this._targetRay, l = this._grip, c = this._hand;
    if (t && e.session.visibilityState !== "visible-blurred") {
      if (c && t.hand) {
        a = !0;
        for (const _ of t.hand.values()) {
          const m = e.getJointPose(_, n), u = this._getHandJoint(c, _);
          m !== null && (u.matrix.fromArray(m.transform.matrix), u.matrix.decompose(u.position, u.rotation, u.scale), u.matrixWorldNeedsUpdate = !0, u.jointRadius = m.radius), u.visible = m !== null;
        }
        const h = c.joints["index-finger-tip"], d = c.joints["thumb-tip"], f = h.position.distanceTo(d.position), p = 0.02, g = 5e-3;
        c.inputState.pinching && f > p + g ? (c.inputState.pinching = !1, this.dispatchEvent({
          type: "pinchend",
          handedness: t.handedness,
          target: this
        })) : !c.inputState.pinching && f <= p - g && (c.inputState.pinching = !0, this.dispatchEvent({
          type: "pinchstart",
          handedness: t.handedness,
          target: this
        }));
      } else
        l !== null && t.gripSpace && (s = e.getPose(t.gripSpace, n), s !== null && (l.matrix.fromArray(s.transform.matrix), l.matrix.decompose(l.position, l.rotation, l.scale), l.matrixWorldNeedsUpdate = !0, s.linearVelocity ? (l.hasLinearVelocity = !0, l.linearVelocity.copy(s.linearVelocity)) : l.hasLinearVelocity = !1, s.angularVelocity ? (l.hasAngularVelocity = !0, l.angularVelocity.copy(s.angularVelocity)) : l.hasAngularVelocity = !1));
      o !== null && (r = e.getPose(t.targetRaySpace, n), r === null && s !== null && (r = s), r !== null && (o.matrix.fromArray(r.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(r.linearVelocity)) : o.hasLinearVelocity = !1, r.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(r.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(Cd)));
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
  _getHandJoint(t, e) {
    if (t.joints[e.jointName] === void 0) {
      const n = new en();
      n.matrixAutoUpdate = !1, n.visible = !1, t.joints[e.jointName] = n, t.add(n);
    }
    return t.joints[e.jointName];
  }
}
class Pd extends Te {
  /**
   * Constructs a new scene.
   */
  constructor() {
    super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new Dn(), this.environmentIntensity = 1, this.environmentRotation = new Dn(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  copy(t, e) {
    return super.copy(t, e), t.background !== null && (this.background = t.background.clone()), t.environment !== null && (this.environment = t.environment.clone()), t.fog !== null && (this.fog = t.fog.clone()), this.backgroundBlurriness = t.backgroundBlurriness, this.backgroundIntensity = t.backgroundIntensity, this.backgroundRotation.copy(t.backgroundRotation), this.environmentIntensity = t.environmentIntensity, this.environmentRotation.copy(t.environmentRotation), t.overrideMaterial !== null && (this.overrideMaterial = t.overrideMaterial.clone()), this.matrixAutoUpdate = t.matrixAutoUpdate, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return this.fog !== null && (e.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (e.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (e.object.backgroundIntensity = this.backgroundIntensity), e.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (e.object.environmentIntensity = this.environmentIntensity), e.object.environmentRotation = this.environmentRotation.toArray(), e;
  }
}
const Vs = /* @__PURE__ */ new I(), Dd = /* @__PURE__ */ new I(), Ld = /* @__PURE__ */ new zt();
class Bn {
  /**
   * Constructs a new plane.
   *
   * @param {Vector3} [normal=(1,0,0)] - A unit length vector defining the normal of the plane.
   * @param {number} [constant=0] - The signed distance from the origin to the plane.
   */
  constructor(t = new I(1, 0, 0), e = 0) {
    this.isPlane = !0, this.normal = t, this.constant = e;
  }
  /**
   * Sets the plane components by copying the given values.
   *
   * @param {Vector3} normal - The normal.
   * @param {number} constant - The constant.
   * @return {Plane} A reference to this plane.
   */
  set(t, e) {
    return this.normal.copy(t), this.constant = e, this;
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
  setComponents(t, e, n, r) {
    return this.normal.set(t, e, n), this.constant = r, this;
  }
  /**
   * Sets the plane from the given normal and coplanar point (that is a point
   * that lies onto the plane).
   *
   * @param {Vector3} normal - The normal.
   * @param {Vector3} point - A coplanar point.
   * @return {Plane} A reference to this plane.
   */
  setFromNormalAndCoplanarPoint(t, e) {
    return this.normal.copy(t), this.constant = -e.dot(this.normal), this;
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
  setFromCoplanarPoints(t, e, n) {
    const r = Vs.subVectors(n, e).cross(Dd.subVectors(t, e)).normalize();
    return this.setFromNormalAndCoplanarPoint(r, t), this;
  }
  /**
   * Copies the values of the given plane to this instance.
   *
   * @param {Plane} plane - The plane to copy.
   * @return {Plane} A reference to this plane.
   */
  copy(t) {
    return this.normal.copy(t.normal), this.constant = t.constant, this;
  }
  /**
   * Normalizes the plane normal and adjusts the constant accordingly.
   *
   * @return {Plane} A reference to this plane.
   */
  normalize() {
    const t = 1 / this.normal.length();
    return this.normal.multiplyScalar(t), this.constant *= t, this;
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
  distanceToPoint(t) {
    return this.normal.dot(t) + this.constant;
  }
  /**
   * Returns the signed distance from the given sphere to this plane.
   *
   * @param {Sphere} sphere - The sphere to compute the distance for.
   * @return {number} The signed distance.
   */
  distanceToSphere(t) {
    return this.distanceToPoint(t.center) - t.radius;
  }
  /**
   * Projects a the given point onto the plane.
   *
   * @param {Vector3} point - The point to project.
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The projected point on the plane.
   */
  projectPoint(t, e) {
    return e.copy(t).addScaledVector(this.normal, -this.distanceToPoint(t));
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
  intersectLine(t, e) {
    const n = t.delta(Vs), r = this.normal.dot(n);
    if (r === 0)
      return this.distanceToPoint(t.start) === 0 ? e.copy(t.start) : null;
    const s = -(t.start.dot(this.normal) + this.constant) / r;
    return s < 0 || s > 1 ? null : e.copy(t.start).addScaledVector(n, s);
  }
  /**
   * Returns `true` if the given line segment intersects with (passes through) the plane.
   *
   * @param {Line3} line - The line to test.
   * @return {boolean} Whether the given line segment intersects with the plane or not.
   */
  intersectsLine(t) {
    const e = this.distanceToPoint(t.start), n = this.distanceToPoint(t.end);
    return e < 0 && n > 0 || n < 0 && e > 0;
  }
  /**
   * Returns `true` if the given bounding box intersects with the plane.
   *
   * @param {Box3} box - The bounding box to test.
   * @return {boolean} Whether the given bounding box intersects with the plane or not.
   */
  intersectsBox(t) {
    return t.intersectsPlane(this);
  }
  /**
   * Returns `true` if the given bounding sphere intersects with the plane.
   *
   * @param {Sphere} sphere - The bounding sphere to test.
   * @return {boolean} Whether the given bounding sphere intersects with the plane or not.
   */
  intersectsSphere(t) {
    return t.intersectsPlane(this);
  }
  /**
   * Returns a coplanar vector to the plane, by calculating the
   * projection of the normal at the origin onto the plane.
   *
   * @param {Vector3} target - The target vector that is used to store the method's result.
   * @return {Vector3} The coplanar point.
   */
  coplanarPoint(t) {
    return t.copy(this.normal).multiplyScalar(-this.constant);
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
  applyMatrix4(t, e) {
    const n = e || Ld.getNormalMatrix(t), r = this.coplanarPoint(Vs).applyMatrix4(t), s = this.normal.applyMatrix3(n).normalize();
    return this.constant = -r.dot(s), this;
  }
  /**
   * Translates the plane by the distance defined by the given offset vector.
   * Note that this only affects the plane constant and will not affect the normal vector.
   *
   * @param {Vector3} offset - The offset vector.
   * @return {Plane} A reference to this plane.
   */
  translate(t) {
    return this.constant -= t.dot(this.normal), this;
  }
  /**
   * Returns `true` if this plane is equal with the given one.
   *
   * @param {Plane} plane - The plane to test for equality.
   * @return {boolean} Whether this plane is equal with the given one.
   */
  equals(t) {
    return t.normal.equals(this.normal) && t.constant === this.constant;
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
const oi = /* @__PURE__ */ new ps(), Id = /* @__PURE__ */ new It(0.5, 0.5), Xr = /* @__PURE__ */ new I();
class ao {
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
  constructor(t = new Bn(), e = new Bn(), n = new Bn(), r = new Bn(), s = new Bn(), a = new Bn()) {
    this.planes = [t, e, n, r, s, a];
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
  set(t, e, n, r, s, a) {
    const o = this.planes;
    return o[0].copy(t), o[1].copy(e), o[2].copy(n), o[3].copy(r), o[4].copy(s), o[5].copy(a), this;
  }
  /**
   * Copies the values of the given frustum to this instance.
   *
   * @param {Frustum} frustum - The frustum to copy.
   * @return {Frustum} A reference to this frustum.
   */
  copy(t) {
    const e = this.planes;
    for (let n = 0; n < 6; n++)
      e[n].copy(t.planes[n]);
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
  setFromProjectionMatrix(t, e = Tn, n = !1) {
    const r = this.planes, s = t.elements, a = s[0], o = s[1], l = s[2], c = s[3], h = s[4], d = s[5], f = s[6], p = s[7], g = s[8], _ = s[9], m = s[10], u = s[11], T = s[12], b = s[13], y = s[14], w = s[15];
    if (r[0].setComponents(c - a, p - h, u - g, w - T).normalize(), r[1].setComponents(c + a, p + h, u + g, w + T).normalize(), r[2].setComponents(c + o, p + d, u + _, w + b).normalize(), r[3].setComponents(c - o, p - d, u - _, w - b).normalize(), n)
      r[4].setComponents(l, f, m, y).normalize(), r[5].setComponents(c - l, p - f, u - m, w - y).normalize();
    else if (r[4].setComponents(c - l, p - f, u - m, w - y).normalize(), e === Tn)
      r[5].setComponents(c + l, p + f, u + m, w + y).normalize();
    else if (e === os)
      r[5].setComponents(l, f, m, y).normalize();
    else
      throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + e);
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
  intersectsObject(t) {
    if (t.boundingSphere !== void 0)
      t.boundingSphere === null && t.computeBoundingSphere(), oi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);
    else {
      const e = t.geometry;
      e.boundingSphere === null && e.computeBoundingSphere(), oi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld);
    }
    return this.intersectsSphere(oi);
  }
  /**
   * Returns `true` if the given sprite is intersecting this frustum.
   *
   * @param {Sprite} sprite - The sprite to test.
   * @return {boolean} Whether the sprite is intersecting this frustum or not.
   */
  intersectsSprite(t) {
    oi.center.set(0, 0, 0);
    const e = Id.distanceTo(t.center);
    return oi.radius = 0.7071067811865476 + e, oi.applyMatrix4(t.matrixWorld), this.intersectsSphere(oi);
  }
  /**
   * Returns `true` if the given bounding sphere is intersecting this frustum.
   *
   * @param {Sphere} sphere - The bounding sphere to test.
   * @return {boolean} Whether the bounding sphere is intersecting this frustum or not.
   */
  intersectsSphere(t) {
    const e = this.planes, n = t.center, r = -t.radius;
    for (let s = 0; s < 6; s++)
      if (e[s].distanceToPoint(n) < r)
        return !1;
    return !0;
  }
  /**
   * Returns `true` if the given bounding box is intersecting this frustum.
   *
   * @param {Box3} box - The bounding box to test.
   * @return {boolean} Whether the bounding box is intersecting this frustum or not.
   */
  intersectsBox(t) {
    const e = this.planes;
    for (let n = 0; n < 6; n++) {
      const r = e[n];
      if (Xr.x = r.normal.x > 0 ? t.max.x : t.min.x, Xr.y = r.normal.y > 0 ? t.max.y : t.min.y, Xr.z = r.normal.z > 0 ? t.max.z : t.min.z, r.distanceToPoint(Xr) < 0)
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
  containsPoint(t) {
    const e = this.planes;
    for (let n = 0; n < 6; n++)
      if (e[n].distanceToPoint(t) < 0)
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
class Qn extends er {
  /**
   * Constructs a new line basic material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(t) {
    super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new Yt(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.linewidth = t.linewidth, this.linecap = t.linecap, this.linejoin = t.linejoin, this.fog = t.fog, this;
  }
}
const cs = /* @__PURE__ */ new I(), hs = /* @__PURE__ */ new I(), Jo = /* @__PURE__ */ new le(), cr = /* @__PURE__ */ new ms(), $r = /* @__PURE__ */ new ps(), Gs = /* @__PURE__ */ new I(), Qo = /* @__PURE__ */ new I();
class uc extends Te {
  /**
   * Constructs a new line.
   *
   * @param {BufferGeometry} [geometry] - The line geometry.
   * @param {Material|Array<Material>} [material] - The line material.
   */
  constructor(t = new hn(), e = new Qn()) {
    super(), this.isLine = !0, this.type = "Line", this.geometry = t, this.material = e, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets();
  }
  copy(t, e) {
    return super.copy(t, e), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
  }
  /**
   * Computes an array of distance values which are necessary for rendering dashed lines.
   * For each vertex in the geometry, the method calculates the cumulative length from the
   * current point to the very beginning of the line.
   *
   * @return {Line} A reference to this line.
   */
  computeLineDistances() {
    const t = this.geometry;
    if (t.index === null) {
      const e = t.attributes.position, n = [0];
      for (let r = 1, s = e.count; r < s; r++)
        cs.fromBufferAttribute(e, r - 1), hs.fromBufferAttribute(e, r), n[r] = n[r - 1], n[r] += cs.distanceTo(hs);
      t.setAttribute("lineDistance", new wn(n, 1));
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
  raycast(t, e) {
    const n = this.geometry, r = this.matrixWorld, s = t.params.Line.threshold, a = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), $r.copy(n.boundingSphere), $r.applyMatrix4(r), $r.radius += s, t.ray.intersectsSphere($r) === !1) return;
    Jo.copy(r).invert(), cr.copy(t.ray).applyMatrix4(Jo);
    const o = s / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = o * o, c = this.isLineSegments ? 2 : 1, h = n.index, f = n.attributes.position;
    if (h !== null) {
      const p = Math.max(0, a.start), g = Math.min(h.count, a.start + a.count);
      for (let _ = p, m = g - 1; _ < m; _ += c) {
        const u = h.getX(_), T = h.getX(_ + 1), b = qr(this, t, cr, l, u, T, _);
        b && e.push(b);
      }
      if (this.isLineLoop) {
        const _ = h.getX(g - 1), m = h.getX(p), u = qr(this, t, cr, l, _, m, g - 1);
        u && e.push(u);
      }
    } else {
      const p = Math.max(0, a.start), g = Math.min(f.count, a.start + a.count);
      for (let _ = p, m = g - 1; _ < m; _ += c) {
        const u = qr(this, t, cr, l, _, _ + 1, _);
        u && e.push(u);
      }
      if (this.isLineLoop) {
        const _ = qr(this, t, cr, l, g - 1, p, g - 1);
        _ && e.push(_);
      }
    }
  }
  /**
   * Sets the values of {@link Line#morphTargetDictionary} and {@link Line#morphTargetInfluences}
   * to make sure existing morph targets can influence this 3D object.
   */
  updateMorphTargets() {
    const e = this.geometry.morphAttributes, n = Object.keys(e);
    if (n.length > 0) {
      const r = e[n[0]];
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
function qr(i, t, e, n, r, s, a) {
  const o = i.geometry.attributes.position;
  if (cs.fromBufferAttribute(o, r), hs.fromBufferAttribute(o, s), e.distanceSqToSegment(cs, hs, Gs, Qo) > n) return;
  Gs.applyMatrix4(i.matrixWorld);
  const c = t.ray.origin.distanceTo(Gs);
  if (!(c < t.near || c > t.far))
    return {
      distance: c,
      // What do we want? intersection point on the ray or on the segment??
      // point: raycaster.ray.at( distance ),
      point: Qo.clone().applyMatrix4(i.matrixWorld),
      index: a,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: i
    };
}
const tl = /* @__PURE__ */ new I(), el = /* @__PURE__ */ new I();
class qi extends uc {
  /**
   * Constructs a new line segments.
   *
   * @param {BufferGeometry} [geometry] - The line geometry.
   * @param {Material|Array<Material>} [material] - The line material.
   */
  constructor(t, e) {
    super(t, e), this.isLineSegments = !0, this.type = "LineSegments";
  }
  computeLineDistances() {
    const t = this.geometry;
    if (t.index === null) {
      const e = t.attributes.position, n = [];
      for (let r = 0, s = e.count; r < s; r += 2)
        tl.fromBufferAttribute(e, r), el.fromBufferAttribute(e, r + 1), n[r] = r === 0 ? 0 : n[r - 1], n[r + 1] = n[r] + tl.distanceTo(el);
      t.setAttribute("lineDistance", new wn(n, 1));
    } else
      console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
}
class Ga extends $e {
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
  constructor(t, e, n, r, s, a, o, l, c) {
    super(t, e, n, r, s, a, o, l, c), this.isCanvasTexture = !0, this.needsUpdate = !0;
  }
}
class fc extends $e {
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
  constructor(t, e, n = _i, r, s, a, o = vn, l = vn, c, h = vr, d = 1) {
    if (h !== vr && h !== xr)
      throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    const f = { width: t, height: e, depth: d };
    super(f, r, s, a, o, l, h, n, c), this.isDepthTexture = !0, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
  }
  copy(t) {
    return super.copy(t), this.source = new ro(Object.assign({}, t.image)), this.compareFunction = t.compareFunction, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return this.compareFunction !== null && (e.compareFunction = this.compareFunction), e;
  }
}
class pc extends $e {
  /**
   * Creates a new raw texture.
   *
   * @param {?(WebGLTexture|GPUTexture)} [sourceTexture=null] - The external texture.
   */
  constructor(t = null) {
    super(), this.sourceTexture = t, this.isExternalTexture = !0;
  }
  copy(t) {
    return super.copy(t), this.sourceTexture = t.sourceTexture, this;
  }
}
const Yr = /* @__PURE__ */ new I(), jr = /* @__PURE__ */ new I(), Ws = /* @__PURE__ */ new I(), Kr = /* @__PURE__ */ new cn();
class fr extends hn {
  /**
   * Constructs a new edges geometry.
   *
   * @param {?BufferGeometry} [geometry=null] - The geometry.
   * @param {number} [thresholdAngle=1] - An edge is only rendered if the angle (in degrees)
   * between the face normals of the adjoining faces exceeds this value.
   */
  constructor(t = null, e = 1) {
    if (super(), this.type = "EdgesGeometry", this.parameters = {
      geometry: t,
      thresholdAngle: e
    }, t !== null) {
      const r = Math.pow(10, 4), s = Math.cos(Xi * e), a = t.getIndex(), o = t.getAttribute("position"), l = a ? a.count : o.count, c = [0, 0, 0], h = ["a", "b", "c"], d = new Array(3), f = {}, p = [];
      for (let g = 0; g < l; g += 3) {
        a ? (c[0] = a.getX(g), c[1] = a.getX(g + 1), c[2] = a.getX(g + 2)) : (c[0] = g, c[1] = g + 1, c[2] = g + 2);
        const { a: _, b: m, c: u } = Kr;
        if (_.fromBufferAttribute(o, c[0]), m.fromBufferAttribute(o, c[1]), u.fromBufferAttribute(o, c[2]), Kr.getNormal(Ws), d[0] = `${Math.round(_.x * r)},${Math.round(_.y * r)},${Math.round(_.z * r)}`, d[1] = `${Math.round(m.x * r)},${Math.round(m.y * r)},${Math.round(m.z * r)}`, d[2] = `${Math.round(u.x * r)},${Math.round(u.y * r)},${Math.round(u.z * r)}`, !(d[0] === d[1] || d[1] === d[2] || d[2] === d[0]))
          for (let T = 0; T < 3; T++) {
            const b = (T + 1) % 3, y = d[T], w = d[b], R = Kr[h[T]], C = Kr[h[b]], F = `${y}_${w}`, M = `${w}_${y}`;
            M in f && f[M] ? (Ws.dot(f[M].normal) <= s && (p.push(R.x, R.y, R.z), p.push(C.x, C.y, C.z)), f[M] = null) : F in f || (f[F] = {
              index0: c[T],
              index1: c[b],
              normal: Ws.clone()
            });
          }
      }
      for (const g in f)
        if (f[g]) {
          const { index0: _, index1: m } = f[g];
          Yr.fromBufferAttribute(o, _), jr.fromBufferAttribute(o, m), p.push(Yr.x, Yr.y, Yr.z), p.push(jr.x, jr.y, jr.z);
        }
      this.setAttribute("position", new wn(p, 3));
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
}
class Ud {
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
  getPointAt(t, e) {
    const n = this.getUtoTmapping(t);
    return this.getPoint(n, e);
  }
  /**
   * This method samples the curve via {@link Curve#getPoint} and returns an array of points representing
   * the curve shape.
   *
   * @param {number} [divisions=5] - The number of divisions.
   * @return {Array<(Vector2|Vector3)>} An array holding the sampled curve values. The number of points is `divisions + 1`.
   */
  getPoints(t = 5) {
    const e = [];
    for (let n = 0; n <= t; n++)
      e.push(this.getPoint(n / t));
    return e;
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
  getSpacedPoints(t = 5) {
    const e = [];
    for (let n = 0; n <= t; n++)
      e.push(this.getPointAt(n / t));
    return e;
  }
  /**
   * Returns the total arc length of the curve.
   *
   * @return {number} The length of the curve.
   */
  getLength() {
    const t = this.getLengths();
    return t[t.length - 1];
  }
  /**
   * Returns an array of cumulative segment lengths of the curve.
   *
   * @param {number} [divisions=this.arcLengthDivisions] - The number of divisions.
   * @return {Array<number>} An array holding the cumulative segment lengths.
   */
  getLengths(t = this.arcLengthDivisions) {
    if (this.cacheArcLengths && this.cacheArcLengths.length === t + 1 && !this.needsUpdate)
      return this.cacheArcLengths;
    this.needsUpdate = !1;
    const e = [];
    let n, r = this.getPoint(0), s = 0;
    e.push(0);
    for (let a = 1; a <= t; a++)
      n = this.getPoint(a / t), s += n.distanceTo(r), e.push(s), r = n;
    return this.cacheArcLengths = e, e;
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
  getUtoTmapping(t, e = null) {
    const n = this.getLengths();
    let r = 0;
    const s = n.length;
    let a;
    e ? a = e : a = t * n[s - 1];
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
    const h = n[r], f = n[r + 1] - h, p = (a - h) / f;
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
  getTangent(t, e) {
    let r = t - 1e-4, s = t + 1e-4;
    r < 0 && (r = 0), s > 1 && (s = 1);
    const a = this.getPoint(r), o = this.getPoint(s), l = e || (a.isVector2 ? new It() : new I());
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
  getTangentAt(t, e) {
    const n = this.getUtoTmapping(t);
    return this.getTangent(n, e);
  }
  /**
   * Generates the Frenet Frames. Requires a curve definition in 3D space. Used
   * in geometries like {@link TubeGeometry} or {@link ExtrudeGeometry}.
   *
   * @param {number} segments - The number of segments.
   * @param {boolean} [closed=false] - Whether the curve is closed or not.
   * @return {{tangents: Array<Vector3>, normals: Array<Vector3>, binormals: Array<Vector3>}} The Frenet Frames.
   */
  computeFrenetFrames(t, e = !1) {
    const n = new I(), r = [], s = [], a = [], o = new I(), l = new le();
    for (let p = 0; p <= t; p++) {
      const g = p / t;
      r[p] = this.getTangentAt(g, new I());
    }
    s[0] = new I(), a[0] = new I();
    let c = Number.MAX_VALUE;
    const h = Math.abs(r[0].x), d = Math.abs(r[0].y), f = Math.abs(r[0].z);
    h <= c && (c = h, n.set(1, 0, 0)), d <= c && (c = d, n.set(0, 1, 0)), f <= c && n.set(0, 0, 1), o.crossVectors(r[0], n).normalize(), s[0].crossVectors(r[0], o), a[0].crossVectors(r[0], s[0]);
    for (let p = 1; p <= t; p++) {
      if (s[p] = s[p - 1].clone(), a[p] = a[p - 1].clone(), o.crossVectors(r[p - 1], r[p]), o.length() > Number.EPSILON) {
        o.normalize();
        const g = Math.acos(Gt(r[p - 1].dot(r[p]), -1, 1));
        s[p].applyMatrix4(l.makeRotationAxis(o, g));
      }
      a[p].crossVectors(r[p], s[p]);
    }
    if (e === !0) {
      let p = Math.acos(Gt(s[0].dot(s[t]), -1, 1));
      p /= t, r[0].dot(o.crossVectors(s[0], s[t])) > 0 && (p = -p);
      for (let g = 1; g <= t; g++)
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
  copy(t) {
    return this.arcLengthDivisions = t.arcLengthDivisions, this;
  }
  /**
   * Serializes the curve into JSON.
   *
   * @return {Object} A JSON object representing the serialized curve.
   * @see {@link ObjectLoader#parse}
   */
  toJSON() {
    const t = {
      metadata: {
        version: 4.7,
        type: "Curve",
        generator: "Curve.toJSON"
      }
    };
    return t.arcLengthDivisions = this.arcLengthDivisions, t.type = this.type, t;
  }
  /**
   * Deserializes the curve from the given JSON.
   *
   * @param {Object} json - The JSON holding the serialized curve.
   * @return {Curve} A reference to this curve.
   */
  fromJSON(t) {
    return this.arcLengthDivisions = t.arcLengthDivisions, this;
  }
}
function Nd(i, t) {
  const e = 1 - i;
  return e * e * t;
}
function Fd(i, t) {
  return 2 * (1 - i) * i * t;
}
function Od(i, t) {
  return i * i * t;
}
function Xs(i, t, e, n) {
  return Nd(i, t) + Fd(i, e) + Od(i, n);
}
class kd extends Ud {
  /**
   * Constructs a new Quadratic Bezier curve.
   *
   * @param {Vector3} [v0] - The start point.
   * @param {Vector3} [v1] - The control point.
   * @param {Vector3} [v2] - The end point.
   */
  constructor(t = new I(), e = new I(), n = new I()) {
    super(), this.isQuadraticBezierCurve3 = !0, this.type = "QuadraticBezierCurve3", this.v0 = t, this.v1 = e, this.v2 = n;
  }
  /**
   * Returns a point on the curve.
   *
   * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
   * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
   * @return {Vector3} The position on the curve.
   */
  getPoint(t, e = new I()) {
    const n = e, r = this.v0, s = this.v1, a = this.v2;
    return n.set(
      Xs(t, r.x, s.x, a.x),
      Xs(t, r.y, s.y, a.y),
      Xs(t, r.z, s.z, a.z)
    ), n;
  }
  copy(t) {
    return super.copy(t), this.v0.copy(t.v0), this.v1.copy(t.v1), this.v2.copy(t.v2), this;
  }
  toJSON() {
    const t = super.toJSON();
    return t.v0 = this.v0.toArray(), t.v1 = this.v1.toArray(), t.v2 = this.v2.toArray(), t;
  }
  fromJSON(t) {
    return super.fromJSON(t), this.v0.fromArray(t.v0), this.v1.fromArray(t.v1), this.v2.fromArray(t.v2), this;
  }
}
class Si extends hn {
  /**
   * Constructs a new plane geometry.
   *
   * @param {number} [width=1] - The width along the X axis.
   * @param {number} [height=1] - The height along the Y axis
   * @param {number} [widthSegments=1] - The number of segments along the X axis.
   * @param {number} [heightSegments=1] - The number of segments along the Y axis.
   */
  constructor(t = 1, e = 1, n = 1, r = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = {
      width: t,
      height: e,
      widthSegments: n,
      heightSegments: r
    };
    const s = t / 2, a = e / 2, o = Math.floor(n), l = Math.floor(r), c = o + 1, h = l + 1, d = t / o, f = e / l, p = [], g = [], _ = [], m = [];
    for (let u = 0; u < h; u++) {
      const T = u * f - a;
      for (let b = 0; b < c; b++) {
        const y = b * d - s;
        g.push(y, -T, 0), _.push(0, 0, 1), m.push(b / o), m.push(1 - u / l);
      }
    }
    for (let u = 0; u < l; u++)
      for (let T = 0; T < o; T++) {
        const b = T + c * u, y = T + c * (u + 1), w = T + 1 + c * (u + 1), R = T + 1 + c * u;
        p.push(b, y, R), p.push(y, w, R);
      }
    this.setIndex(p), this.setAttribute("position", new wn(g, 3)), this.setAttribute("normal", new wn(_, 3)), this.setAttribute("uv", new wn(m, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  /**
   * Factory method for creating an instance of this class from the given
   * JSON object.
   *
   * @param {Object} data - A JSON object representing the serialized geometry.
   * @return {PlaneGeometry} A new instance.
   */
  static fromJSON(t) {
    return new Si(t.width, t.height, t.widthSegments, t.heightSegments);
  }
}
class mc extends er {
  /**
   * Constructs a new mesh standard material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(t) {
    super(), this.isMeshStandardMaterial = !0, this.type = "MeshStandardMaterial", this.defines = { STANDARD: "" }, this.color = new Yt(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Yt(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = ec, this.normalScale = new It(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Dn(), this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.defines = { STANDARD: "" }, this.color.copy(t.color), this.roughness = t.roughness, this.metalness = t.metalness, this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.emissive.copy(t.emissive), this.emissiveMap = t.emissiveMap, this.emissiveIntensity = t.emissiveIntensity, this.bumpMap = t.bumpMap, this.bumpScale = t.bumpScale, this.normalMap = t.normalMap, this.normalMapType = t.normalMapType, this.normalScale.copy(t.normalScale), this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.roughnessMap = t.roughnessMap, this.metalnessMap = t.metalnessMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.envMapIntensity = t.envMapIntensity, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.flatShading = t.flatShading, this.fog = t.fog, this;
  }
}
class Bd extends er {
  /**
   * Constructs a new mesh depth material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(t) {
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = Lh, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.depthPacking = t.depthPacking, this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this;
  }
}
class zd extends er {
  /**
   * Constructs a new mesh distance material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(t) {
    super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this;
  }
}
class gc extends Te {
  /**
   * Constructs a new light.
   *
   * @param {(number|Color|string)} [color=0xffffff] - The light's color.
   * @param {number} [intensity=1] - The light's strength/intensity.
   */
  constructor(t, e = 1) {
    super(), this.isLight = !0, this.type = "Light", this.color = new Yt(t), this.intensity = e;
  }
  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever this instance is no longer used in your app.
   */
  dispose() {
  }
  copy(t, e) {
    return super.copy(t, e), this.color.copy(t.color), this.intensity = t.intensity, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return e.object.color = this.color.getHex(), e.object.intensity = this.intensity, this.groundColor !== void 0 && (e.object.groundColor = this.groundColor.getHex()), this.distance !== void 0 && (e.object.distance = this.distance), this.angle !== void 0 && (e.object.angle = this.angle), this.decay !== void 0 && (e.object.decay = this.decay), this.penumbra !== void 0 && (e.object.penumbra = this.penumbra), this.shadow !== void 0 && (e.object.shadow = this.shadow.toJSON()), this.target !== void 0 && (e.object.target = this.target.uuid), e;
  }
}
class Hd extends gc {
  /**
   * Constructs a new hemisphere light.
   *
   * @param {(number|Color|string)} [skyColor=0xffffff] - The light's sky color.
   * @param {(number|Color|string)} [groundColor=0xffffff] - The light's ground color.
   * @param {number} [intensity=1] - The light's strength/intensity.
   */
  constructor(t, e, n) {
    super(t, n), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(Te.DEFAULT_UP), this.updateMatrix(), this.groundColor = new Yt(e);
  }
  copy(t, e) {
    return super.copy(t, e), this.groundColor.copy(t.groundColor), this;
  }
}
const $s = /* @__PURE__ */ new le(), nl = /* @__PURE__ */ new I(), il = /* @__PURE__ */ new I();
class Vd {
  /**
   * Constructs a new light shadow.
   *
   * @param {Camera} camera - The light's view of the world.
   */
  constructor(t) {
    this.camera = t, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new It(512, 512), this.mapType = Pn, this.map = null, this.mapPass = null, this.matrix = new le(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new ao(), this._frameExtents = new It(1, 1), this._viewportCount = 1, this._viewports = [
      new ve(0, 0, 1, 1)
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
  updateMatrices(t) {
    const e = this.camera, n = this.matrix;
    nl.setFromMatrixPosition(t.matrixWorld), e.position.copy(nl), il.setFromMatrixPosition(t.target.matrixWorld), e.lookAt(il), e.updateMatrixWorld(), $s.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse), this._frustum.setFromProjectionMatrix($s, e.coordinateSystem, e.reversedDepth), e.reversedDepth ? n.set(
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
    ), n.multiply($s);
  }
  /**
   * Returns a viewport definition for the given viewport index.
   *
   * @param {number} viewportIndex - The viewport index.
   * @return {Vector4} The viewport.
   */
  getViewport(t) {
    return this._viewports[t];
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
  copy(t) {
    return this.camera = t.camera.clone(), this.intensity = t.intensity, this.bias = t.bias, this.radius = t.radius, this.autoUpdate = t.autoUpdate, this.needsUpdate = t.needsUpdate, this.normalBias = t.normalBias, this.blurSamples = t.blurSamples, this.mapSize.copy(t.mapSize), this;
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
    const t = {};
    return this.intensity !== 1 && (t.intensity = this.intensity), this.bias !== 0 && (t.bias = this.bias), this.normalBias !== 0 && (t.normalBias = this.normalBias), this.radius !== 1 && (t.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (t.mapSize = this.mapSize.toArray()), t.camera = this.camera.toJSON(!1).object, delete t.camera.matrix, t;
  }
}
class _c extends hc {
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
  constructor(t = -1, e = 1, n = 1, r = -1, s = 0.1, a = 2e3) {
    super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = t, this.right = e, this.top = n, this.bottom = r, this.near = s, this.far = a, this.updateProjectionMatrix();
  }
  copy(t, e) {
    return super.copy(t, e), this.left = t.left, this.right = t.right, this.top = t.top, this.bottom = t.bottom, this.near = t.near, this.far = t.far, this.zoom = t.zoom, this.view = t.view === null ? null : Object.assign({}, t.view), this;
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
  setViewOffset(t, e, n, r, s, a) {
    this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = t, this.view.fullHeight = e, this.view.offsetX = n, this.view.offsetY = r, this.view.width = s, this.view.height = a, this.updateProjectionMatrix();
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
    const t = (this.right - this.left) / (2 * this.zoom), e = (this.top - this.bottom) / (2 * this.zoom), n = (this.right + this.left) / 2, r = (this.top + this.bottom) / 2;
    let s = n - t, a = n + t, o = r + e, l = r - e;
    if (this.view !== null && this.view.enabled) {
      const c = (this.right - this.left) / this.view.fullWidth / this.zoom, h = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      s += c * this.view.offsetX, a = s + c * this.view.width, o -= h * this.view.offsetY, l = o - h * this.view.height;
    }
    this.projectionMatrix.makeOrthographic(s, a, o, l, this.near, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return e.object.zoom = this.zoom, e.object.left = this.left, e.object.right = this.right, e.object.top = this.top, e.object.bottom = this.bottom, e.object.near = this.near, e.object.far = this.far, this.view !== null && (e.object.view = Object.assign({}, this.view)), e;
  }
}
class Gd extends Vd {
  /**
   * Constructs a new directional light shadow.
   */
  constructor() {
    super(new _c(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
  }
}
class Wd extends gc {
  /**
   * Constructs a new directional light.
   *
   * @param {(number|Color|string)} [color=0xffffff] - The light's color.
   * @param {number} [intensity=1] - The light's strength/intensity.
   */
  constructor(t, e) {
    super(t, e), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(Te.DEFAULT_UP), this.updateMatrix(), this.target = new Te(), this.shadow = new Gd();
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(t) {
    return super.copy(t), this.target = t.target.clone(), this.shadow = t.shadow.clone(), this;
  }
}
class Xd extends on {
  /**
   * Constructs a new array camera.
   *
   * @param {Array<PerspectiveCamera>} [array=[]] - An array of perspective sub cameras.
   */
  constructor(t = []) {
    super(), this.isArrayCamera = !0, this.isMultiViewCamera = !1, this.cameras = t;
  }
}
const rl = /* @__PURE__ */ new le();
class $d {
  /**
   * Constructs a new raycaster.
   *
   * @param {Vector3} origin - The origin vector where the ray casts from.
   * @param {Vector3} direction - The (normalized) direction vector that gives direction to the ray.
   * @param {number} [near=0] - All results returned are further away than near. Near can't be negative.
   * @param {number} [far=Infinity] - All results returned are closer than far. Far can't be lower than near.
   */
  constructor(t, e, n = 0, r = 1 / 0) {
    this.ray = new ms(t, e), this.near = n, this.far = r, this.camera = null, this.layers = new so(), this.params = {
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
  set(t, e) {
    this.ray.set(t, e);
  }
  /**
   * Uses the given coordinates and camera to compute a new origin and direction for the internal ray.
   *
   * @param {Vector2} coords - 2D coordinates of the mouse, in normalized device coordinates (NDC).
   * X and Y components should be between `-1` and `1`.
   * @param {Camera} camera - The camera from which the ray should originate.
   */
  setFromCamera(t, e) {
    e.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(t.x, t.y, 0.5).unproject(e).sub(this.ray.origin).normalize(), this.camera = e) : e.isOrthographicCamera ? (this.ray.origin.set(t.x, t.y, (e.near + e.far) / (e.near - e.far)).unproject(e), this.ray.direction.set(0, 0, -1).transformDirection(e.matrixWorld), this.camera = e) : console.error("THREE.Raycaster: Unsupported camera type: " + e.type);
  }
  /**
   * Uses the given WebXR controller to compute a new origin and direction for the internal ray.
   *
   * @param {WebXRController} controller - The controller to copy the position and direction from.
   * @return {Raycaster} A reference to this raycaster.
   */
  setFromXRController(t) {
    return rl.identity().extractRotation(t.matrixWorld), this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(rl), this;
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
  intersectObject(t, e = !0, n = []) {
    return Wa(t, this, n, e), n.sort(sl), n;
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
  intersectObjects(t, e = !0, n = []) {
    for (let r = 0, s = t.length; r < s; r++)
      Wa(t[r], this, n, e);
    return n.sort(sl), n;
  }
}
function sl(i, t) {
  return i.distance - t.distance;
}
function Wa(i, t, e, n) {
  let r = !0;
  if (i.layers.test(t.layers) && i.raycast(t, e) === !1 && (r = !1), r === !0 && n === !0) {
    const s = i.children;
    for (let a = 0, o = s.length; a < o; a++)
      Wa(s[a], t, e, !0);
  }
}
class al {
  /**
   * Constructs a new spherical.
   *
   * @param {number} [radius=1] - The radius, or the Euclidean distance (straight-line distance) from the point to the origin.
   * @param {number} [phi=0] - The polar angle in radians from the y (up) axis.
   * @param {number} [theta=0] - The equator/azimuthal angle in radians around the y (up) axis.
   */
  constructor(t = 1, e = 0, n = 0) {
    this.radius = t, this.phi = e, this.theta = n;
  }
  /**
   * Sets the spherical components by copying the given values.
   *
   * @param {number} radius - The radius.
   * @param {number} phi - The polar angle.
   * @param {number} theta - The azimuthal angle.
   * @return {Spherical} A reference to this spherical.
   */
  set(t, e, n) {
    return this.radius = t, this.phi = e, this.theta = n, this;
  }
  /**
   * Copies the values of the given spherical to this instance.
   *
   * @param {Spherical} other - The spherical to copy.
   * @return {Spherical} A reference to this spherical.
   */
  copy(t) {
    return this.radius = t.radius, this.phi = t.phi, this.theta = t.theta, this;
  }
  /**
   * Restricts the polar angle [page:.phi phi] to be between `0.000001` and pi -
   * `0.000001`.
   *
   * @return {Spherical} A reference to this spherical.
   */
  makeSafe() {
    return this.phi = Gt(this.phi, 1e-6, Math.PI - 1e-6), this;
  }
  /**
   * Sets the spherical components from the given vector which is assumed to hold
   * Cartesian coordinates.
   *
   * @param {Vector3} v - The vector to set.
   * @return {Spherical} A reference to this spherical.
   */
  setFromVector3(t) {
    return this.setFromCartesianCoords(t.x, t.y, t.z);
  }
  /**
   * Sets the spherical components from the given Cartesian coordinates.
   *
   * @param {number} x - The x value.
   * @param {number} y - The y value.
   * @param {number} z - The z value.
   * @return {Spherical} A reference to this spherical.
   */
  setFromCartesianCoords(t, e, n) {
    return this.radius = Math.sqrt(t * t + e * e + n * n), this.radius === 0 ? (this.theta = 0, this.phi = 0) : (this.theta = Math.atan2(t, n), this.phi = Math.acos(Gt(e / this.radius, -1, 1))), this;
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
class qd extends yi {
  /**
   * Constructs a new controls instance.
   *
   * @param {Object3D} object - The object that is managed by the controls.
   * @param {?HTMLDOMElement} domElement - The HTML element used for event listeners.
   */
  constructor(t, e = null) {
    super(), this.object = t, this.domElement = e, this.enabled = !0, this.state = -1, this.keys = {}, this.mouseButtons = { LEFT: null, MIDDLE: null, RIGHT: null }, this.touches = { ONE: null, TWO: null };
  }
  /**
   * Connects the controls to the DOM. This method has so called "side effects" since
   * it adds the module's event listeners to the DOM.
   *
   * @param {HTMLDOMElement} element - The DOM element to connect to.
   */
  connect(t) {
    if (t === void 0) {
      console.warn("THREE.Controls: connect() now requires an element.");
      return;
    }
    this.domElement !== null && this.disconnect(), this.domElement = t;
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
function ol(i, t, e, n) {
  const r = Yd(n);
  switch (e) {
    // https://registry.khronos.org/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
    case Zl:
      return i * t;
    case Ql:
      return i * t / r.components * r.byteLength;
    case to:
      return i * t / r.components * r.byteLength;
    case tc:
      return i * t * 2 / r.components * r.byteLength;
    case eo:
      return i * t * 2 / r.components * r.byteLength;
    case Jl:
      return i * t * 3 / r.components * r.byteLength;
    case _n:
      return i * t * 4 / r.components * r.byteLength;
    case no:
      return i * t * 4 / r.components * r.byteLength;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_s3tc_srgb/
    case es:
    case ns:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case is:
    case rs:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_pvrtc/
    case ga:
    case va:
      return Math.max(i, 16) * Math.max(t, 8) / 4;
    case ma:
    case _a:
      return Math.max(i, 8) * Math.max(t, 8) / 2;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_etc/
    case xa:
    case Ma:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case Sa:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_astc/
    case ya:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case Ea:
      return Math.floor((i + 4) / 5) * Math.floor((t + 3) / 4) * 16;
    case ba:
      return Math.floor((i + 4) / 5) * Math.floor((t + 4) / 5) * 16;
    case Ta:
      return Math.floor((i + 5) / 6) * Math.floor((t + 4) / 5) * 16;
    case wa:
      return Math.floor((i + 5) / 6) * Math.floor((t + 5) / 6) * 16;
    case Aa:
      return Math.floor((i + 7) / 8) * Math.floor((t + 4) / 5) * 16;
    case Ra:
      return Math.floor((i + 7) / 8) * Math.floor((t + 5) / 6) * 16;
    case Ca:
      return Math.floor((i + 7) / 8) * Math.floor((t + 7) / 8) * 16;
    case Pa:
      return Math.floor((i + 9) / 10) * Math.floor((t + 4) / 5) * 16;
    case Da:
      return Math.floor((i + 9) / 10) * Math.floor((t + 5) / 6) * 16;
    case La:
      return Math.floor((i + 9) / 10) * Math.floor((t + 7) / 8) * 16;
    case Ia:
      return Math.floor((i + 9) / 10) * Math.floor((t + 9) / 10) * 16;
    case Ua:
      return Math.floor((i + 11) / 12) * Math.floor((t + 9) / 10) * 16;
    case Na:
      return Math.floor((i + 11) / 12) * Math.floor((t + 11) / 12) * 16;
    // https://registry.khronos.org/webgl/extensions/EXT_texture_compression_bptc/
    case Fa:
    case Oa:
    case ka:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
    // https://registry.khronos.org/webgl/extensions/EXT_texture_compression_rgtc/
    case Ba:
    case za:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 8;
    case Ha:
    case Va:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
  }
  throw new Error(
    `Unable to determine texture byte length for ${e} format.`
  );
}
function Yd(i) {
  switch (i) {
    case Pn:
    case ql:
      return { byteLength: 1, components: 1 };
    case gr:
    case Yl:
    case Er:
      return { byteLength: 2, components: 1 };
    case Ja:
    case Qa:
      return { byteLength: 2, components: 4 };
    case _i:
    case Za:
    case zn:
      return { byteLength: 4, components: 1 };
    case jl:
    case Kl:
      return { byteLength: 4, components: 3 };
  }
  throw new Error(`Unknown texture type ${i}.`);
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: {
  revision: Ka
} }));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = Ka);
function vc() {
  let i = null, t = !1, e = null, n = null;
  function r(s, a) {
    e(s, a), n = i.requestAnimationFrame(r);
  }
  return {
    start: function() {
      t !== !0 && e !== null && (n = i.requestAnimationFrame(r), t = !0);
    },
    stop: function() {
      i.cancelAnimationFrame(n), t = !1;
    },
    setAnimationLoop: function(s) {
      e = s;
    },
    setContext: function(s) {
      i = s;
    }
  };
}
function jd(i) {
  const t = /* @__PURE__ */ new WeakMap();
  function e(o, l) {
    const c = o.array, h = o.usage, d = c.byteLength, f = i.createBuffer();
    i.bindBuffer(l, f), i.bufferData(l, c, h), o.onUploadCallback();
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
      buffer: f,
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
      let f = 0;
      for (let p = 1; p < d.length; p++) {
        const g = d[f], _ = d[p];
        _.start <= g.start + g.count + 1 ? g.count = Math.max(
          g.count,
          _.start + _.count - g.start
        ) : (++f, d[f] = _);
      }
      d.length = f + 1;
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
    return o.isInterleavedBufferAttribute && (o = o.data), t.get(o);
  }
  function s(o) {
    o.isInterleavedBufferAttribute && (o = o.data);
    const l = t.get(o);
    l && (i.deleteBuffer(l.buffer), t.delete(o));
  }
  function a(o, l) {
    if (o.isInterleavedBufferAttribute && (o = o.data), o.isGLBufferAttribute) {
      const h = t.get(o);
      (!h || h.version < o.version) && t.set(o, {
        buffer: o.buffer,
        type: o.type,
        bytesPerElement: o.elementSize,
        version: o.version
      });
      return;
    }
    const c = t.get(o);
    if (c === void 0)
      t.set(o, e(o, l));
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
var Kd = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, Zd = `#ifdef USE_ALPHAHASH
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
#endif`, Jd = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, Qd = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, tu = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, eu = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, nu = `#ifdef USE_AOMAP
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
#endif`, iu = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, ru = `#ifdef USE_BATCHING
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
#endif`, su = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`, au = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, ou = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, lu = `float G_BlinnPhong_Implicit( ) {
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
} // validated`, cu = `#ifdef USE_IRIDESCENCE
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
#endif`, hu = `#ifdef USE_BUMPMAP
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
#endif`, du = `#if NUM_CLIPPING_PLANES > 0
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
#endif`, uu = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, fu = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, pu = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, mu = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, gu = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, _u = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, vu = `#if defined( USE_COLOR_ALPHA )
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
#endif`, xu = `#define PI 3.141592653589793
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
} // validated`, Mu = `#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`, Su = `vec3 transformedNormal = objectNormal;
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
#endif`, yu = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, Eu = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, bu = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, Tu = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, wu = "gl_FragColor = linearToOutputTexel( gl_FragColor );", Au = `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`, Ru = `#ifdef USE_ENVMAP
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
#endif`, Cu = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, Pu = `#ifdef USE_ENVMAP
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
#endif`, Du = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, Lu = `#ifdef USE_ENVMAP
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
#endif`, Iu = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, Uu = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, Nu = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, Fu = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, Ou = `#ifdef USE_GRADIENTMAP
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
}`, ku = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, Bu = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, zu = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, Hu = `uniform bool receiveShadow;
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
#endif`, Vu = `#ifdef USE_ENVMAP
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
#endif`, Gu = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, Wu = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, Xu = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, $u = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, qu = `PhysicalMaterial material;
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
#endif`, Yu = `struct PhysicalMaterial {
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
}`, ju = `
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
#endif`, Ku = `#if defined( RE_IndirectDiffuse )
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
#endif`, Zu = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, Ju = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, Qu = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, tf = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, ef = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, nf = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, rf = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, sf = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`, af = `#if defined( USE_POINTS_UV )
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
#endif`, of = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, lf = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, cf = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, hf = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, df = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, uf = `#ifdef USE_MORPHTARGETS
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
#endif`, ff = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, pf = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`, mf = `#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`, gf = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, _f = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, vf = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, xf = `#ifdef USE_NORMALMAP
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
#endif`, Mf = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, Sf = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, yf = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, Ef = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, bf = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, Tf = `vec3 packNormalToRGB( const in vec3 normal ) {
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
}`, wf = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, Af = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, Rf = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, Cf = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, Pf = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, Df = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, Lf = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, If = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, Uf = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`, Nf = `float getShadowMask() {
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
}`, Ff = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, Of = `#ifdef USE_SKINNING
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
#endif`, kf = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, Bf = `#ifdef USE_SKINNING
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
#endif`, zf = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, Hf = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, Vf = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, Gf = `#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`, Wf = `#ifdef USE_TRANSMISSION
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
#endif`, Xf = `#ifdef USE_TRANSMISSION
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
#endif`, $f = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, qf = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, Yf = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, jf = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const Kf = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, Zf = `uniform sampler2D t2D;
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
}`, Jf = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, Qf = `#ifdef ENVMAP_TYPE_CUBE
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
}`, tp = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, ep = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, np = `#include <common>
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
}`, ip = `#if DEPTH_PACKING == 3200
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
}`, rp = `#define DISTANCE
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
}`, sp = `#define DISTANCE
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
}`, ap = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, op = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, lp = `uniform float scale;
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
}`, cp = `uniform vec3 diffuse;
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
}`, hp = `#include <common>
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
}`, dp = `uniform vec3 diffuse;
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
}`, up = `#define LAMBERT
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
}`, fp = `#define LAMBERT
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
}`, pp = `#define MATCAP
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
}`, mp = `#define MATCAP
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
}`, gp = `#define NORMAL
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
}`, _p = `#define NORMAL
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
}`, vp = `#define PHONG
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
}`, xp = `#define PHONG
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
}`, Mp = `#define STANDARD
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
}`, Sp = `#define STANDARD
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
}`, yp = `#define TOON
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
}`, Ep = `#define TOON
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
}`, bp = `uniform float size;
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
}`, Tp = `uniform vec3 diffuse;
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
}`, wp = `#include <common>
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
}`, Ap = `uniform vec3 color;
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
}`, Rp = `uniform float rotation;
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
}`, Cp = `uniform vec3 diffuse;
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
}`, Vt = {
  alphahash_fragment: Kd,
  alphahash_pars_fragment: Zd,
  alphamap_fragment: Jd,
  alphamap_pars_fragment: Qd,
  alphatest_fragment: tu,
  alphatest_pars_fragment: eu,
  aomap_fragment: nu,
  aomap_pars_fragment: iu,
  batching_pars_vertex: ru,
  batching_vertex: su,
  begin_vertex: au,
  beginnormal_vertex: ou,
  bsdfs: lu,
  iridescence_fragment: cu,
  bumpmap_pars_fragment: hu,
  clipping_planes_fragment: du,
  clipping_planes_pars_fragment: uu,
  clipping_planes_pars_vertex: fu,
  clipping_planes_vertex: pu,
  color_fragment: mu,
  color_pars_fragment: gu,
  color_pars_vertex: _u,
  color_vertex: vu,
  common: xu,
  cube_uv_reflection_fragment: Mu,
  defaultnormal_vertex: Su,
  displacementmap_pars_vertex: yu,
  displacementmap_vertex: Eu,
  emissivemap_fragment: bu,
  emissivemap_pars_fragment: Tu,
  colorspace_fragment: wu,
  colorspace_pars_fragment: Au,
  envmap_fragment: Ru,
  envmap_common_pars_fragment: Cu,
  envmap_pars_fragment: Pu,
  envmap_pars_vertex: Du,
  envmap_physical_pars_fragment: Vu,
  envmap_vertex: Lu,
  fog_vertex: Iu,
  fog_pars_vertex: Uu,
  fog_fragment: Nu,
  fog_pars_fragment: Fu,
  gradientmap_pars_fragment: Ou,
  lightmap_pars_fragment: ku,
  lights_lambert_fragment: Bu,
  lights_lambert_pars_fragment: zu,
  lights_pars_begin: Hu,
  lights_toon_fragment: Gu,
  lights_toon_pars_fragment: Wu,
  lights_phong_fragment: Xu,
  lights_phong_pars_fragment: $u,
  lights_physical_fragment: qu,
  lights_physical_pars_fragment: Yu,
  lights_fragment_begin: ju,
  lights_fragment_maps: Ku,
  lights_fragment_end: Zu,
  logdepthbuf_fragment: Ju,
  logdepthbuf_pars_fragment: Qu,
  logdepthbuf_pars_vertex: tf,
  logdepthbuf_vertex: ef,
  map_fragment: nf,
  map_pars_fragment: rf,
  map_particle_fragment: sf,
  map_particle_pars_fragment: af,
  metalnessmap_fragment: of,
  metalnessmap_pars_fragment: lf,
  morphinstance_vertex: cf,
  morphcolor_vertex: hf,
  morphnormal_vertex: df,
  morphtarget_pars_vertex: uf,
  morphtarget_vertex: ff,
  normal_fragment_begin: pf,
  normal_fragment_maps: mf,
  normal_pars_fragment: gf,
  normal_pars_vertex: _f,
  normal_vertex: vf,
  normalmap_pars_fragment: xf,
  clearcoat_normal_fragment_begin: Mf,
  clearcoat_normal_fragment_maps: Sf,
  clearcoat_pars_fragment: yf,
  iridescence_pars_fragment: Ef,
  opaque_fragment: bf,
  packing: Tf,
  premultiplied_alpha_fragment: wf,
  project_vertex: Af,
  dithering_fragment: Rf,
  dithering_pars_fragment: Cf,
  roughnessmap_fragment: Pf,
  roughnessmap_pars_fragment: Df,
  shadowmap_pars_fragment: Lf,
  shadowmap_pars_vertex: If,
  shadowmap_vertex: Uf,
  shadowmask_pars_fragment: Nf,
  skinbase_vertex: Ff,
  skinning_pars_vertex: Of,
  skinning_vertex: kf,
  skinnormal_vertex: Bf,
  specularmap_fragment: zf,
  specularmap_pars_fragment: Hf,
  tonemapping_fragment: Vf,
  tonemapping_pars_fragment: Gf,
  transmission_fragment: Wf,
  transmission_pars_fragment: Xf,
  uv_pars_fragment: $f,
  uv_pars_vertex: qf,
  uv_vertex: Yf,
  worldpos_vertex: jf,
  background_vert: Kf,
  background_frag: Zf,
  backgroundCube_vert: Jf,
  backgroundCube_frag: Qf,
  cube_vert: tp,
  cube_frag: ep,
  depth_vert: np,
  depth_frag: ip,
  distanceRGBA_vert: rp,
  distanceRGBA_frag: sp,
  equirect_vert: ap,
  equirect_frag: op,
  linedashed_vert: lp,
  linedashed_frag: cp,
  meshbasic_vert: hp,
  meshbasic_frag: dp,
  meshlambert_vert: up,
  meshlambert_frag: fp,
  meshmatcap_vert: pp,
  meshmatcap_frag: mp,
  meshnormal_vert: gp,
  meshnormal_frag: _p,
  meshphong_vert: vp,
  meshphong_frag: xp,
  meshphysical_vert: Mp,
  meshphysical_frag: Sp,
  meshtoon_vert: yp,
  meshtoon_frag: Ep,
  points_vert: bp,
  points_frag: Tp,
  shadow_vert: wp,
  shadow_frag: Ap,
  sprite_vert: Rp,
  sprite_frag: Cp
}, ot = {
  common: {
    diffuse: { value: /* @__PURE__ */ new Yt(16777215) },
    opacity: { value: 1 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new zt() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new zt() },
    alphaTest: { value: 0 }
  },
  specularmap: {
    specularMap: { value: null },
    specularMapTransform: { value: /* @__PURE__ */ new zt() }
  },
  envmap: {
    envMap: { value: null },
    envMapRotation: { value: /* @__PURE__ */ new zt() },
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
    aoMapTransform: { value: /* @__PURE__ */ new zt() }
  },
  lightmap: {
    lightMap: { value: null },
    lightMapIntensity: { value: 1 },
    lightMapTransform: { value: /* @__PURE__ */ new zt() }
  },
  bumpmap: {
    bumpMap: { value: null },
    bumpMapTransform: { value: /* @__PURE__ */ new zt() },
    bumpScale: { value: 1 }
  },
  normalmap: {
    normalMap: { value: null },
    normalMapTransform: { value: /* @__PURE__ */ new zt() },
    normalScale: { value: /* @__PURE__ */ new It(1, 1) }
  },
  displacementmap: {
    displacementMap: { value: null },
    displacementMapTransform: { value: /* @__PURE__ */ new zt() },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 }
  },
  emissivemap: {
    emissiveMap: { value: null },
    emissiveMapTransform: { value: /* @__PURE__ */ new zt() }
  },
  metalnessmap: {
    metalnessMap: { value: null },
    metalnessMapTransform: { value: /* @__PURE__ */ new zt() }
  },
  roughnessmap: {
    roughnessMap: { value: null },
    roughnessMapTransform: { value: /* @__PURE__ */ new zt() }
  },
  gradientmap: {
    gradientMap: { value: null }
  },
  fog: {
    fogDensity: { value: 25e-5 },
    fogNear: { value: 1 },
    fogFar: { value: 2e3 },
    fogColor: { value: /* @__PURE__ */ new Yt(16777215) }
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
    diffuse: { value: /* @__PURE__ */ new Yt(16777215) },
    opacity: { value: 1 },
    size: { value: 1 },
    scale: { value: 1 },
    map: { value: null },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new zt() },
    alphaTest: { value: 0 },
    uvTransform: { value: /* @__PURE__ */ new zt() }
  },
  sprite: {
    diffuse: { value: /* @__PURE__ */ new Yt(16777215) },
    opacity: { value: 1 },
    center: { value: /* @__PURE__ */ new It(0.5, 0.5) },
    rotation: { value: 0 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new zt() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new zt() },
    alphaTest: { value: 0 }
  }
}, yn = {
  basic: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.specularmap,
      ot.envmap,
      ot.aomap,
      ot.lightmap,
      ot.fog
    ]),
    vertexShader: Vt.meshbasic_vert,
    fragmentShader: Vt.meshbasic_frag
  },
  lambert: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.specularmap,
      ot.envmap,
      ot.aomap,
      ot.lightmap,
      ot.emissivemap,
      ot.bumpmap,
      ot.normalmap,
      ot.displacementmap,
      ot.fog,
      ot.lights,
      {
        emissive: { value: /* @__PURE__ */ new Yt(0) }
      }
    ]),
    vertexShader: Vt.meshlambert_vert,
    fragmentShader: Vt.meshlambert_frag
  },
  phong: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.specularmap,
      ot.envmap,
      ot.aomap,
      ot.lightmap,
      ot.emissivemap,
      ot.bumpmap,
      ot.normalmap,
      ot.displacementmap,
      ot.fog,
      ot.lights,
      {
        emissive: { value: /* @__PURE__ */ new Yt(0) },
        specular: { value: /* @__PURE__ */ new Yt(1118481) },
        shininess: { value: 30 }
      }
    ]),
    vertexShader: Vt.meshphong_vert,
    fragmentShader: Vt.meshphong_frag
  },
  standard: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.envmap,
      ot.aomap,
      ot.lightmap,
      ot.emissivemap,
      ot.bumpmap,
      ot.normalmap,
      ot.displacementmap,
      ot.roughnessmap,
      ot.metalnessmap,
      ot.fog,
      ot.lights,
      {
        emissive: { value: /* @__PURE__ */ new Yt(0) },
        roughness: { value: 1 },
        metalness: { value: 0 },
        envMapIntensity: { value: 1 }
      }
    ]),
    vertexShader: Vt.meshphysical_vert,
    fragmentShader: Vt.meshphysical_frag
  },
  toon: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.aomap,
      ot.lightmap,
      ot.emissivemap,
      ot.bumpmap,
      ot.normalmap,
      ot.displacementmap,
      ot.gradientmap,
      ot.fog,
      ot.lights,
      {
        emissive: { value: /* @__PURE__ */ new Yt(0) }
      }
    ]),
    vertexShader: Vt.meshtoon_vert,
    fragmentShader: Vt.meshtoon_frag
  },
  matcap: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.bumpmap,
      ot.normalmap,
      ot.displacementmap,
      ot.fog,
      {
        matcap: { value: null }
      }
    ]),
    vertexShader: Vt.meshmatcap_vert,
    fragmentShader: Vt.meshmatcap_frag
  },
  points: {
    uniforms: /* @__PURE__ */ Ge([
      ot.points,
      ot.fog
    ]),
    vertexShader: Vt.points_vert,
    fragmentShader: Vt.points_frag
  },
  dashed: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.fog,
      {
        scale: { value: 1 },
        dashSize: { value: 1 },
        totalSize: { value: 2 }
      }
    ]),
    vertexShader: Vt.linedashed_vert,
    fragmentShader: Vt.linedashed_frag
  },
  depth: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.displacementmap
    ]),
    vertexShader: Vt.depth_vert,
    fragmentShader: Vt.depth_frag
  },
  normal: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.bumpmap,
      ot.normalmap,
      ot.displacementmap,
      {
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Vt.meshnormal_vert,
    fragmentShader: Vt.meshnormal_frag
  },
  sprite: {
    uniforms: /* @__PURE__ */ Ge([
      ot.sprite,
      ot.fog
    ]),
    vertexShader: Vt.sprite_vert,
    fragmentShader: Vt.sprite_frag
  },
  background: {
    uniforms: {
      uvTransform: { value: /* @__PURE__ */ new zt() },
      t2D: { value: null },
      backgroundIntensity: { value: 1 }
    },
    vertexShader: Vt.background_vert,
    fragmentShader: Vt.background_frag
  },
  backgroundCube: {
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 },
      backgroundBlurriness: { value: 0 },
      backgroundIntensity: { value: 1 },
      backgroundRotation: { value: /* @__PURE__ */ new zt() }
    },
    vertexShader: Vt.backgroundCube_vert,
    fragmentShader: Vt.backgroundCube_frag
  },
  cube: {
    uniforms: {
      tCube: { value: null },
      tFlip: { value: -1 },
      opacity: { value: 1 }
    },
    vertexShader: Vt.cube_vert,
    fragmentShader: Vt.cube_frag
  },
  equirect: {
    uniforms: {
      tEquirect: { value: null }
    },
    vertexShader: Vt.equirect_vert,
    fragmentShader: Vt.equirect_frag
  },
  distanceRGBA: {
    uniforms: /* @__PURE__ */ Ge([
      ot.common,
      ot.displacementmap,
      {
        referencePosition: { value: /* @__PURE__ */ new I() },
        nearDistance: { value: 1 },
        farDistance: { value: 1e3 }
      }
    ]),
    vertexShader: Vt.distanceRGBA_vert,
    fragmentShader: Vt.distanceRGBA_frag
  },
  shadow: {
    uniforms: /* @__PURE__ */ Ge([
      ot.lights,
      ot.fog,
      {
        color: { value: /* @__PURE__ */ new Yt(0) },
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Vt.shadow_vert,
    fragmentShader: Vt.shadow_frag
  }
};
yn.physical = {
  uniforms: /* @__PURE__ */ Ge([
    yn.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: /* @__PURE__ */ new zt() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: /* @__PURE__ */ new zt() },
      clearcoatNormalScale: { value: /* @__PURE__ */ new It(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new zt() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: /* @__PURE__ */ new zt() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new zt() },
      sheen: { value: 0 },
      sheenColor: { value: /* @__PURE__ */ new Yt(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: /* @__PURE__ */ new zt() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: /* @__PURE__ */ new zt() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: /* @__PURE__ */ new zt() },
      transmissionSamplerSize: { value: /* @__PURE__ */ new It() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: /* @__PURE__ */ new zt() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: /* @__PURE__ */ new Yt(0) },
      specularColor: { value: /* @__PURE__ */ new Yt(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: /* @__PURE__ */ new zt() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: /* @__PURE__ */ new zt() },
      anisotropyVector: { value: /* @__PURE__ */ new It() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: /* @__PURE__ */ new zt() }
    }
  ]),
  vertexShader: Vt.meshphysical_vert,
  fragmentShader: Vt.meshphysical_frag
};
const Zr = { r: 0, b: 0, g: 0 }, li = /* @__PURE__ */ new Dn(), Pp = /* @__PURE__ */ new le();
function Dp(i, t, e, n, r, s, a) {
  const o = new Yt(0);
  let l = s === !0 ? 0 : 1, c, h, d = null, f = 0, p = null;
  function g(b) {
    let y = b.isScene === !0 ? b.background : null;
    return y && y.isTexture && (y = (b.backgroundBlurriness > 0 ? e : t).get(y)), y;
  }
  function _(b) {
    let y = !1;
    const w = g(b);
    w === null ? u(o, l) : w && w.isColor && (u(w, 1), y = !0);
    const R = i.xr.getEnvironmentBlendMode();
    R === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, a) : R === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, a), (i.autoClear || y) && (n.buffers.depth.setTest(!0), n.buffers.depth.setMask(!0), n.buffers.color.setMask(!0), i.clear(i.autoClearColor, i.autoClearDepth, i.autoClearStencil));
  }
  function m(b, y) {
    const w = g(y);
    w && (w.isCubeTexture || w.mapping === fs) ? (h === void 0 && (h = new Xe(
      new An(1, 1, 1),
      new ei({
        name: "BackgroundCubeMaterial",
        uniforms: Ji(yn.backgroundCube.uniforms),
        vertexShader: yn.backgroundCube.vertexShader,
        fragmentShader: yn.backgroundCube.fragmentShader,
        side: Ke,
        depthTest: !1,
        depthWrite: !1,
        fog: !1,
        allowOverride: !1
      })
    ), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(R, C, F) {
      this.matrixWorld.copyPosition(F.matrixWorld);
    }, Object.defineProperty(h.material, "envMap", {
      get: function() {
        return this.uniforms.envMap.value;
      }
    }), r.update(h)), li.copy(y.backgroundRotation), li.x *= -1, li.y *= -1, li.z *= -1, w.isCubeTexture && w.isRenderTargetTexture === !1 && (li.y *= -1, li.z *= -1), h.material.uniforms.envMap.value = w, h.material.uniforms.flipEnvMap.value = w.isCubeTexture && w.isRenderTargetTexture === !1 ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = y.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = y.backgroundIntensity, h.material.uniforms.backgroundRotation.value.setFromMatrix4(Pp.makeRotationFromEuler(li)), h.material.toneMapped = Kt.getTransfer(w.colorSpace) !== ee, (d !== w || f !== w.version || p !== i.toneMapping) && (h.material.needsUpdate = !0, d = w, f = w.version, p = i.toneMapping), h.layers.enableAll(), b.unshift(h, h.geometry, h.material, 0, 0, null)) : w && w.isTexture && (c === void 0 && (c = new Xe(
      new Si(2, 2),
      new ei({
        name: "BackgroundMaterial",
        uniforms: Ji(yn.background.uniforms),
        vertexShader: yn.background.vertexShader,
        fragmentShader: yn.background.fragmentShader,
        side: ti,
        depthTest: !1,
        depthWrite: !1,
        fog: !1,
        allowOverride: !1
      })
    ), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", {
      get: function() {
        return this.uniforms.t2D.value;
      }
    }), r.update(c)), c.material.uniforms.t2D.value = w, c.material.uniforms.backgroundIntensity.value = y.backgroundIntensity, c.material.toneMapped = Kt.getTransfer(w.colorSpace) !== ee, w.matrixAutoUpdate === !0 && w.updateMatrix(), c.material.uniforms.uvTransform.value.copy(w.matrix), (d !== w || f !== w.version || p !== i.toneMapping) && (c.material.needsUpdate = !0, d = w, f = w.version, p = i.toneMapping), c.layers.enableAll(), b.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function u(b, y) {
    b.getRGB(Zr, cc(i)), n.buffers.color.setClear(Zr.r, Zr.g, Zr.b, y, a);
  }
  function T() {
    h !== void 0 && (h.geometry.dispose(), h.material.dispose(), h = void 0), c !== void 0 && (c.geometry.dispose(), c.material.dispose(), c = void 0);
  }
  return {
    getClearColor: function() {
      return o;
    },
    setClearColor: function(b, y = 1) {
      o.set(b), l = y, u(o, l);
    },
    getClearAlpha: function() {
      return l;
    },
    setClearAlpha: function(b) {
      l = b, u(o, l);
    },
    render: _,
    addToRenderList: m,
    dispose: T
  };
}
function Lp(i, t) {
  const e = i.getParameter(i.MAX_VERTEX_ATTRIBS), n = {}, r = f(null);
  let s = r, a = !1;
  function o(S, P, V, X, U) {
    let k = !1;
    const H = d(X, V, P);
    s !== H && (s = H, c(s.object)), k = p(S, X, V, U), k && g(S, X, V, U), U !== null && t.update(U, i.ELEMENT_ARRAY_BUFFER), (k || a) && (a = !1, y(S, P, V, X), U !== null && i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, t.get(U).buffer));
  }
  function l() {
    return i.createVertexArray();
  }
  function c(S) {
    return i.bindVertexArray(S);
  }
  function h(S) {
    return i.deleteVertexArray(S);
  }
  function d(S, P, V) {
    const X = V.wireframe === !0;
    let U = n[S.id];
    U === void 0 && (U = {}, n[S.id] = U);
    let k = U[P.id];
    k === void 0 && (k = {}, U[P.id] = k);
    let H = k[X];
    return H === void 0 && (H = f(l()), k[X] = H), H;
  }
  function f(S) {
    const P = [], V = [], X = [];
    for (let U = 0; U < e; U++)
      P[U] = 0, V[U] = 0, X[U] = 0;
    return {
      // for backward compatibility on non-VAO support browser
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: P,
      enabledAttributes: V,
      attributeDivisors: X,
      object: S,
      attributes: {},
      index: null
    };
  }
  function p(S, P, V, X) {
    const U = s.attributes, k = P.attributes;
    let H = 0;
    const B = V.getAttributes();
    for (const D in B)
      if (B[D].location >= 0) {
        const at = U[D];
        let dt = k[D];
        if (dt === void 0 && (D === "instanceMatrix" && S.instanceMatrix && (dt = S.instanceMatrix), D === "instanceColor" && S.instanceColor && (dt = S.instanceColor)), at === void 0 || at.attribute !== dt || dt && at.data !== dt.data) return !0;
        H++;
      }
    return s.attributesNum !== H || s.index !== X;
  }
  function g(S, P, V, X) {
    const U = {}, k = P.attributes;
    let H = 0;
    const B = V.getAttributes();
    for (const D in B)
      if (B[D].location >= 0) {
        let at = k[D];
        at === void 0 && (D === "instanceMatrix" && S.instanceMatrix && (at = S.instanceMatrix), D === "instanceColor" && S.instanceColor && (at = S.instanceColor));
        const dt = {};
        dt.attribute = at, at && at.data && (dt.data = at.data), U[D] = dt, H++;
      }
    s.attributes = U, s.attributesNum = H, s.index = X;
  }
  function _() {
    const S = s.newAttributes;
    for (let P = 0, V = S.length; P < V; P++)
      S[P] = 0;
  }
  function m(S) {
    u(S, 0);
  }
  function u(S, P) {
    const V = s.newAttributes, X = s.enabledAttributes, U = s.attributeDivisors;
    V[S] = 1, X[S] === 0 && (i.enableVertexAttribArray(S), X[S] = 1), U[S] !== P && (i.vertexAttribDivisor(S, P), U[S] = P);
  }
  function T() {
    const S = s.newAttributes, P = s.enabledAttributes;
    for (let V = 0, X = P.length; V < X; V++)
      P[V] !== S[V] && (i.disableVertexAttribArray(V), P[V] = 0);
  }
  function b(S, P, V, X, U, k, H) {
    H === !0 ? i.vertexAttribIPointer(S, P, V, U, k) : i.vertexAttribPointer(S, P, V, X, U, k);
  }
  function y(S, P, V, X) {
    _();
    const U = X.attributes, k = V.getAttributes(), H = P.defaultAttributeValues;
    for (const B in k) {
      const D = k[B];
      if (D.location >= 0) {
        let j = U[B];
        if (j === void 0 && (B === "instanceMatrix" && S.instanceMatrix && (j = S.instanceMatrix), B === "instanceColor" && S.instanceColor && (j = S.instanceColor)), j !== void 0) {
          const at = j.normalized, dt = j.itemSize, Wt = t.get(j);
          if (Wt === void 0) continue;
          const Qt = Wt.buffer, Xt = Wt.type, kt = Wt.bytesPerElement, K = Xt === i.INT || Xt === i.UNSIGNED_INT || j.gpuType === Za;
          if (j.isInterleavedBufferAttribute) {
            const J = j.data, ft = J.stride, Lt = j.offset;
            if (J.isInstancedInterleavedBuffer) {
              for (let Et = 0; Et < D.locationSize; Et++)
                u(D.location + Et, J.meshPerAttribute);
              S.isInstancedMesh !== !0 && X._maxInstanceCount === void 0 && (X._maxInstanceCount = J.meshPerAttribute * J.count);
            } else
              for (let Et = 0; Et < D.locationSize; Et++)
                m(D.location + Et);
            i.bindBuffer(i.ARRAY_BUFFER, Qt);
            for (let Et = 0; Et < D.locationSize; Et++)
              b(
                D.location + Et,
                dt / D.locationSize,
                Xt,
                at,
                ft * kt,
                (Lt + dt / D.locationSize * Et) * kt,
                K
              );
          } else {
            if (j.isInstancedBufferAttribute) {
              for (let J = 0; J < D.locationSize; J++)
                u(D.location + J, j.meshPerAttribute);
              S.isInstancedMesh !== !0 && X._maxInstanceCount === void 0 && (X._maxInstanceCount = j.meshPerAttribute * j.count);
            } else
              for (let J = 0; J < D.locationSize; J++)
                m(D.location + J);
            i.bindBuffer(i.ARRAY_BUFFER, Qt);
            for (let J = 0; J < D.locationSize; J++)
              b(
                D.location + J,
                dt / D.locationSize,
                Xt,
                at,
                dt * kt,
                dt / D.locationSize * J * kt,
                K
              );
          }
        } else if (H !== void 0) {
          const at = H[B];
          if (at !== void 0)
            switch (at.length) {
              case 2:
                i.vertexAttrib2fv(D.location, at);
                break;
              case 3:
                i.vertexAttrib3fv(D.location, at);
                break;
              case 4:
                i.vertexAttrib4fv(D.location, at);
                break;
              default:
                i.vertexAttrib1fv(D.location, at);
            }
        }
      }
    }
    T();
  }
  function w() {
    F();
    for (const S in n) {
      const P = n[S];
      for (const V in P) {
        const X = P[V];
        for (const U in X)
          h(X[U].object), delete X[U];
        delete P[V];
      }
      delete n[S];
    }
  }
  function R(S) {
    if (n[S.id] === void 0) return;
    const P = n[S.id];
    for (const V in P) {
      const X = P[V];
      for (const U in X)
        h(X[U].object), delete X[U];
      delete P[V];
    }
    delete n[S.id];
  }
  function C(S) {
    for (const P in n) {
      const V = n[P];
      if (V[S.id] === void 0) continue;
      const X = V[S.id];
      for (const U in X)
        h(X[U].object), delete X[U];
      delete V[S.id];
    }
  }
  function F() {
    M(), a = !0, s !== r && (s = r, c(s.object));
  }
  function M() {
    r.geometry = null, r.program = null, r.wireframe = !1;
  }
  return {
    setup: o,
    reset: F,
    resetDefaultState: M,
    dispose: w,
    releaseStatesOfGeometry: R,
    releaseStatesOfProgram: C,
    initAttributes: _,
    enableAttribute: m,
    disableUnusedAttributes: T
  };
}
function Ip(i, t, e) {
  let n;
  function r(c) {
    n = c;
  }
  function s(c, h) {
    i.drawArrays(n, c, h), e.update(h, n, 1);
  }
  function a(c, h, d) {
    d !== 0 && (i.drawArraysInstanced(n, c, h, d), e.update(h, n, d));
  }
  function o(c, h, d) {
    if (d === 0) return;
    t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, c, 0, h, 0, d);
    let p = 0;
    for (let g = 0; g < d; g++)
      p += h[g];
    e.update(p, n, 1);
  }
  function l(c, h, d, f) {
    if (d === 0) return;
    const p = t.get("WEBGL_multi_draw");
    if (p === null)
      for (let g = 0; g < c.length; g++)
        a(c[g], h[g], f[g]);
    else {
      p.multiDrawArraysInstancedWEBGL(n, c, 0, h, 0, f, 0, d);
      let g = 0;
      for (let _ = 0; _ < d; _++)
        g += h[_] * f[_];
      e.update(g, n, 1);
    }
  }
  this.setMode = r, this.render = s, this.renderInstances = a, this.renderMultiDraw = o, this.renderMultiDrawInstances = l;
}
function Up(i, t, e, n) {
  let r;
  function s() {
    if (r !== void 0) return r;
    if (t.has("EXT_texture_filter_anisotropic") === !0) {
      const C = t.get("EXT_texture_filter_anisotropic");
      r = i.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else
      r = 0;
    return r;
  }
  function a(C) {
    return !(C !== _n && n.convert(C) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function o(C) {
    const F = C === Er && (t.has("EXT_color_buffer_half_float") || t.has("EXT_color_buffer_float"));
    return !(C !== Pn && n.convert(C) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
    C !== zn && !F);
  }
  function l(C) {
    if (C === "highp") {
      if (i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.HIGH_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.HIGH_FLOAT).precision > 0)
        return "highp";
      C = "mediump";
    }
    return C === "mediump" && i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.MEDIUM_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
  }
  let c = e.precision !== void 0 ? e.precision : "highp";
  const h = l(c);
  h !== c && (console.warn("THREE.WebGLRenderer:", c, "not supported, using", h, "instead."), c = h);
  const d = e.logarithmicDepthBuffer === !0, f = e.reversedDepthBuffer === !0 && t.has("EXT_clip_control"), p = i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS), g = i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS), _ = i.getParameter(i.MAX_TEXTURE_SIZE), m = i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE), u = i.getParameter(i.MAX_VERTEX_ATTRIBS), T = i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS), b = i.getParameter(i.MAX_VARYING_VECTORS), y = i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS), w = g > 0, R = i.getParameter(i.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    // keeping this for backwards compatibility
    getMaxAnisotropy: s,
    getMaxPrecision: l,
    textureFormatReadable: a,
    textureTypeReadable: o,
    precision: c,
    logarithmicDepthBuffer: d,
    reversedDepthBuffer: f,
    maxTextures: p,
    maxVertexTextures: g,
    maxTextureSize: _,
    maxCubemapSize: m,
    maxAttributes: u,
    maxVertexUniforms: T,
    maxVaryings: b,
    maxFragmentUniforms: y,
    vertexTextures: w,
    maxSamples: R
  };
}
function Np(i) {
  const t = this;
  let e = null, n = 0, r = !1, s = !1;
  const a = new Bn(), o = new zt(), l = { value: null, needsUpdate: !1 };
  this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(d, f) {
    const p = d.length !== 0 || f || // enable state of previous frame - the clipping code has to
    // run another frame in order to reset the state:
    n !== 0 || r;
    return r = f, n = d.length, p;
  }, this.beginShadows = function() {
    s = !0, h(null);
  }, this.endShadows = function() {
    s = !1;
  }, this.setGlobalState = function(d, f) {
    e = h(d, f, 0);
  }, this.setState = function(d, f, p) {
    const g = d.clippingPlanes, _ = d.clipIntersection, m = d.clipShadows, u = i.get(d);
    if (!r || g === null || g.length === 0 || s && !m)
      s ? h(null) : c();
    else {
      const T = s ? 0 : n, b = T * 4;
      let y = u.clippingState || null;
      l.value = y, y = h(g, f, b, p);
      for (let w = 0; w !== b; ++w)
        y[w] = e[w];
      u.clippingState = y, this.numIntersection = _ ? this.numPlanes : 0, this.numPlanes += T;
    }
  };
  function c() {
    l.value !== e && (l.value = e, l.needsUpdate = n > 0), t.numPlanes = n, t.numIntersection = 0;
  }
  function h(d, f, p, g) {
    const _ = d !== null ? d.length : 0;
    let m = null;
    if (_ !== 0) {
      if (m = l.value, g !== !0 || m === null) {
        const u = p + _ * 4, T = f.matrixWorldInverse;
        o.getNormalMatrix(T), (m === null || m.length < u) && (m = new Float32Array(u));
        for (let b = 0, y = p; b !== _; ++b, y += 4)
          a.copy(d[b]).applyMatrix4(T, o), a.normal.toArray(m, y), m[y + 3] = a.constant;
      }
      l.value = m, l.needsUpdate = !0;
    }
    return t.numPlanes = _, t.numIntersection = 0, m;
  }
}
function Fp(i) {
  let t = /* @__PURE__ */ new WeakMap();
  function e(a, o) {
    return o === da ? a.mapping = ji : o === ua && (a.mapping = Ki), a;
  }
  function n(a) {
    if (a && a.isTexture) {
      const o = a.mapping;
      if (o === da || o === ua)
        if (t.has(a)) {
          const l = t.get(a).texture;
          return e(l, a.mapping);
        } else {
          const l = a.image;
          if (l && l.height > 0) {
            const c = new Rd(l.height);
            return c.fromEquirectangularTexture(i, a), t.set(a, c), a.addEventListener("dispose", r), e(c.texture, a.mapping);
          } else
            return null;
        }
    }
    return a;
  }
  function r(a) {
    const o = a.target;
    o.removeEventListener("dispose", r);
    const l = t.get(o);
    l !== void 0 && (t.delete(o), l.dispose());
  }
  function s() {
    t = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: n,
    dispose: s
  };
}
const Hi = 4, ll = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], fi = 20, qs = /* @__PURE__ */ new _c(), cl = /* @__PURE__ */ new Yt();
let Ys = null, js = 0, Ks = 0, Zs = !1;
const hi = (1 + Math.sqrt(5)) / 2, Oi = 1 / hi, hl = [
  /* @__PURE__ */ new I(-hi, Oi, 0),
  /* @__PURE__ */ new I(hi, Oi, 0),
  /* @__PURE__ */ new I(-Oi, 0, hi),
  /* @__PURE__ */ new I(Oi, 0, hi),
  /* @__PURE__ */ new I(0, hi, -Oi),
  /* @__PURE__ */ new I(0, hi, Oi),
  /* @__PURE__ */ new I(-1, 1, -1),
  /* @__PURE__ */ new I(1, 1, -1),
  /* @__PURE__ */ new I(-1, 1, 1),
  /* @__PURE__ */ new I(1, 1, 1)
], Op = /* @__PURE__ */ new I();
class dl {
  /**
   * Constructs a new PMREM generator.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   */
  constructor(t) {
    this._renderer = t, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
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
  fromScene(t, e = 0, n = 0.1, r = 100, s = {}) {
    const {
      size: a = 256,
      position: o = Op
    } = s;
    Ys = this._renderer.getRenderTarget(), js = this._renderer.getActiveCubeFace(), Ks = this._renderer.getActiveMipmapLevel(), Zs = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(a);
    const l = this._allocateTargets();
    return l.depthBuffer = !0, this._sceneToCubeUV(t, n, r, l, o), e > 0 && this._blur(l, 0, 0, e), this._applyPMREM(l), this._cleanup(l), l;
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
  fromEquirectangular(t, e = null) {
    return this._fromTexture(t, e);
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
  fromCubemap(t, e = null) {
    return this._fromTexture(t, e);
  }
  /**
   * Pre-compiles the cubemap shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileCubemapShader() {
    this._cubemapMaterial === null && (this._cubemapMaterial = pl(), this._compileMaterial(this._cubemapMaterial));
  }
  /**
   * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = fl(), this._compileMaterial(this._equirectMaterial));
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
  _setSize(t) {
    this._lodMax = Math.floor(Math.log2(t)), this._cubeSize = Math.pow(2, this._lodMax);
  }
  _dispose() {
    this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
    for (let t = 0; t < this._lodPlanes.length; t++)
      this._lodPlanes[t].dispose();
  }
  _cleanup(t) {
    this._renderer.setRenderTarget(Ys, js, Ks), this._renderer.xr.enabled = Zs, t.scissorTest = !1, Jr(t, 0, 0, t.width, t.height);
  }
  _fromTexture(t, e) {
    t.mapping === ji || t.mapping === Ki ? this._setSize(t.image.length === 0 ? 16 : t.image[0].width || t.image[0].image.width) : this._setSize(t.image.width / 4), Ys = this._renderer.getRenderTarget(), js = this._renderer.getActiveCubeFace(), Ks = this._renderer.getActiveMipmapLevel(), Zs = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
    const n = e || this._allocateTargets();
    return this._textureToCubeUV(t, n), this._applyPMREM(n), this._cleanup(n), n;
  }
  _allocateTargets() {
    const t = 3 * Math.max(this._cubeSize, 112), e = 4 * this._cubeSize, n = {
      magFilter: bn,
      minFilter: bn,
      generateMipmaps: !1,
      type: Er,
      format: _n,
      colorSpace: Zi,
      depthBuffer: !1
    }, r = ul(t, e, n);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== t || this._pingPongRenderTarget.height !== e) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = ul(t, e, n);
      const { _lodMax: s } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = kp(s)), this._blurMaterial = Bp(s, t, e);
    }
    return r;
  }
  _compileMaterial(t) {
    const e = new Xe(this._lodPlanes[0], t);
    this._renderer.compile(e, qs);
  }
  _sceneToCubeUV(t, e, n, r, s) {
    const l = new on(90, 1, e, n), c = [1, -1, 1, 1, 1, 1], h = [1, 1, 1, -1, -1, -1], d = this._renderer, f = d.autoClear, p = d.toneMapping;
    d.getClearColor(cl), d.toneMapping = Jn, d.autoClear = !1, d.state.buffers.depth.getReversed() && (d.setRenderTarget(r), d.clearDepth(), d.setRenderTarget(null));
    const _ = new Mi({
      name: "PMREM.Background",
      side: Ke,
      depthWrite: !1,
      depthTest: !1
    }), m = new Xe(new An(), _);
    let u = !1;
    const T = t.background;
    T ? T.isColor && (_.color.copy(T), t.background = null, u = !0) : (_.color.copy(cl), u = !0);
    for (let b = 0; b < 6; b++) {
      const y = b % 3;
      y === 0 ? (l.up.set(0, c[b], 0), l.position.set(s.x, s.y, s.z), l.lookAt(s.x + h[b], s.y, s.z)) : y === 1 ? (l.up.set(0, 0, c[b]), l.position.set(s.x, s.y, s.z), l.lookAt(s.x, s.y + h[b], s.z)) : (l.up.set(0, c[b], 0), l.position.set(s.x, s.y, s.z), l.lookAt(s.x, s.y, s.z + h[b]));
      const w = this._cubeSize;
      Jr(r, y * w, b > 2 ? w : 0, w, w), d.setRenderTarget(r), u && d.render(m, l), d.render(t, l);
    }
    m.geometry.dispose(), m.material.dispose(), d.toneMapping = p, d.autoClear = f, t.background = T;
  }
  _textureToCubeUV(t, e) {
    const n = this._renderer, r = t.mapping === ji || t.mapping === Ki;
    r ? (this._cubemapMaterial === null && (this._cubemapMaterial = pl()), this._cubemapMaterial.uniforms.flipEnvMap.value = t.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = fl());
    const s = r ? this._cubemapMaterial : this._equirectMaterial, a = new Xe(this._lodPlanes[0], s), o = s.uniforms;
    o.envMap.value = t;
    const l = this._cubeSize;
    Jr(e, 0, 0, 3 * l, 2 * l), n.setRenderTarget(e), n.render(a, qs);
  }
  _applyPMREM(t) {
    const e = this._renderer, n = e.autoClear;
    e.autoClear = !1;
    const r = this._lodPlanes.length;
    for (let s = 1; s < r; s++) {
      const a = Math.sqrt(this._sigmas[s] * this._sigmas[s] - this._sigmas[s - 1] * this._sigmas[s - 1]), o = hl[(r - s - 1) % hl.length];
      this._blur(t, s - 1, s, a, o);
    }
    e.autoClear = n;
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
  _blur(t, e, n, r, s) {
    const a = this._pingPongRenderTarget;
    this._halfBlur(
      t,
      a,
      e,
      n,
      r,
      "latitudinal",
      s
    ), this._halfBlur(
      a,
      t,
      n,
      n,
      r,
      "longitudinal",
      s
    );
  }
  _halfBlur(t, e, n, r, s, a, o) {
    const l = this._renderer, c = this._blurMaterial;
    a !== "latitudinal" && a !== "longitudinal" && console.error(
      "blur direction must be either latitudinal or longitudinal!"
    );
    const h = 3, d = new Xe(this._lodPlanes[r], c), f = c.uniforms, p = this._sizeLods[n] - 1, g = isFinite(s) ? Math.PI / (2 * p) : 2 * Math.PI / (2 * fi - 1), _ = s / g, m = isFinite(s) ? 1 + Math.floor(h * _) : fi;
    m > fi && console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${fi}`);
    const u = [];
    let T = 0;
    for (let C = 0; C < fi; ++C) {
      const F = C / _, M = Math.exp(-F * F / 2);
      u.push(M), C === 0 ? T += M : C < m && (T += 2 * M);
    }
    for (let C = 0; C < u.length; C++)
      u[C] = u[C] / T;
    f.envMap.value = t.texture, f.samples.value = m, f.weights.value = u, f.latitudinal.value = a === "latitudinal", o && (f.poleAxis.value = o);
    const { _lodMax: b } = this;
    f.dTheta.value = g, f.mipInt.value = b - n;
    const y = this._sizeLods[r], w = 3 * y * (r > b - Hi ? r - b + Hi : 0), R = 4 * (this._cubeSize - y);
    Jr(e, w, R, 3 * y, 2 * y), l.setRenderTarget(e), l.render(d, qs);
  }
}
function kp(i) {
  const t = [], e = [], n = [];
  let r = i;
  const s = i - Hi + 1 + ll.length;
  for (let a = 0; a < s; a++) {
    const o = Math.pow(2, r);
    e.push(o);
    let l = 1 / o;
    a > i - Hi ? l = ll[a - i + Hi - 1] : a === 0 && (l = 0), n.push(l);
    const c = 1 / (o - 2), h = -c, d = 1 + c, f = [h, h, d, h, d, d, h, h, d, d, h, d], p = 6, g = 6, _ = 3, m = 2, u = 1, T = new Float32Array(_ * g * p), b = new Float32Array(m * g * p), y = new Float32Array(u * g * p);
    for (let R = 0; R < p; R++) {
      const C = R % 3 * 2 / 3 - 1, F = R > 2 ? 0 : -1, M = [
        C,
        F,
        0,
        C + 2 / 3,
        F,
        0,
        C + 2 / 3,
        F + 1,
        0,
        C,
        F,
        0,
        C + 2 / 3,
        F + 1,
        0,
        C,
        F + 1,
        0
      ];
      T.set(M, _ * g * R), b.set(f, m * g * R);
      const S = [R, R, R, R, R, R];
      y.set(S, u * g * R);
    }
    const w = new hn();
    w.setAttribute("position", new xn(T, _)), w.setAttribute("uv", new xn(b, m)), w.setAttribute("faceIndex", new xn(y, u)), t.push(w), r > Hi && r--;
  }
  return { lodPlanes: t, sizeLods: e, sigmas: n };
}
function ul(i, t, e) {
  const n = new xi(i, t, e);
  return n.texture.mapping = fs, n.texture.name = "PMREM.cubeUv", n.scissorTest = !0, n;
}
function Jr(i, t, e, n, r) {
  i.viewport.set(t, e, n, r), i.scissor.set(t, e, n, r);
}
function Bp(i, t, e) {
  const n = new Float32Array(fi), r = new I(0, 1, 0);
  return new ei({
    name: "SphericalGaussianBlur",
    defines: {
      n: fi,
      CUBEUV_TEXEL_WIDTH: 1 / t,
      CUBEUV_TEXEL_HEIGHT: 1 / e,
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
    vertexShader: oo(),
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
    blending: Zn,
    depthTest: !1,
    depthWrite: !1
  });
}
function fl() {
  return new ei({
    name: "EquirectangularToCubeUV",
    uniforms: {
      envMap: { value: null }
    },
    vertexShader: oo(),
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
    blending: Zn,
    depthTest: !1,
    depthWrite: !1
  });
}
function pl() {
  return new ei({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: oo(),
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
    blending: Zn,
    depthTest: !1,
    depthWrite: !1
  });
}
function oo() {
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
function zp(i) {
  let t = /* @__PURE__ */ new WeakMap(), e = null;
  function n(o) {
    if (o && o.isTexture) {
      const l = o.mapping, c = l === da || l === ua, h = l === ji || l === Ki;
      if (c || h) {
        let d = t.get(o);
        const f = d !== void 0 ? d.texture.pmremVersion : 0;
        if (o.isRenderTargetTexture && o.pmremVersion !== f)
          return e === null && (e = new dl(i)), d = c ? e.fromEquirectangular(o, d) : e.fromCubemap(o, d), d.texture.pmremVersion = o.pmremVersion, t.set(o, d), d.texture;
        if (d !== void 0)
          return d.texture;
        {
          const p = o.image;
          return c && p && p.height > 0 || h && p && r(p) ? (e === null && (e = new dl(i)), d = c ? e.fromEquirectangular(o) : e.fromCubemap(o), d.texture.pmremVersion = o.pmremVersion, t.set(o, d), o.addEventListener("dispose", s), d.texture) : null;
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
    const c = t.get(l);
    c !== void 0 && (t.delete(l), c.dispose());
  }
  function a() {
    t = /* @__PURE__ */ new WeakMap(), e !== null && (e.dispose(), e = null);
  }
  return {
    get: n,
    dispose: a
  };
}
function Hp(i) {
  const t = {};
  function e(n) {
    if (t[n] !== void 0)
      return t[n];
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
    return t[n] = r, r;
  }
  return {
    has: function(n) {
      return e(n) !== null;
    },
    init: function() {
      e("EXT_color_buffer_float"), e("WEBGL_clip_cull_distance"), e("OES_texture_float_linear"), e("EXT_color_buffer_half_float"), e("WEBGL_multisampled_render_to_texture"), e("WEBGL_render_shared_exponent");
    },
    get: function(n) {
      const r = e(n);
      return r === null && Sr("THREE.WebGLRenderer: " + n + " extension not supported."), r;
    }
  };
}
function Vp(i, t, e, n) {
  const r = {}, s = /* @__PURE__ */ new WeakMap();
  function a(d) {
    const f = d.target;
    f.index !== null && t.remove(f.index);
    for (const g in f.attributes)
      t.remove(f.attributes[g]);
    f.removeEventListener("dispose", a), delete r[f.id];
    const p = s.get(f);
    p && (t.remove(p), s.delete(f)), n.releaseStatesOfGeometry(f), f.isInstancedBufferGeometry === !0 && delete f._maxInstanceCount, e.memory.geometries--;
  }
  function o(d, f) {
    return r[f.id] === !0 || (f.addEventListener("dispose", a), r[f.id] = !0, e.memory.geometries++), f;
  }
  function l(d) {
    const f = d.attributes;
    for (const p in f)
      t.update(f[p], i.ARRAY_BUFFER);
  }
  function c(d) {
    const f = [], p = d.index, g = d.attributes.position;
    let _ = 0;
    if (p !== null) {
      const T = p.array;
      _ = p.version;
      for (let b = 0, y = T.length; b < y; b += 3) {
        const w = T[b + 0], R = T[b + 1], C = T[b + 2];
        f.push(w, R, R, C, C, w);
      }
    } else if (g !== void 0) {
      const T = g.array;
      _ = g.version;
      for (let b = 0, y = T.length / 3 - 1; b < y; b += 3) {
        const w = b + 0, R = b + 1, C = b + 2;
        f.push(w, R, R, C, C, w);
      }
    } else
      return;
    const m = new (rc(f) ? lc : oc)(f, 1);
    m.version = _;
    const u = s.get(d);
    u && t.remove(u), s.set(d, m);
  }
  function h(d) {
    const f = s.get(d);
    if (f) {
      const p = d.index;
      p !== null && f.version < p.version && c(d);
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
function Gp(i, t, e) {
  let n;
  function r(f) {
    n = f;
  }
  let s, a;
  function o(f) {
    s = f.type, a = f.bytesPerElement;
  }
  function l(f, p) {
    i.drawElements(n, p, s, f * a), e.update(p, n, 1);
  }
  function c(f, p, g) {
    g !== 0 && (i.drawElementsInstanced(n, p, s, f * a, g), e.update(p, n, g));
  }
  function h(f, p, g) {
    if (g === 0) return;
    t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, p, 0, s, f, 0, g);
    let m = 0;
    for (let u = 0; u < g; u++)
      m += p[u];
    e.update(m, n, 1);
  }
  function d(f, p, g, _) {
    if (g === 0) return;
    const m = t.get("WEBGL_multi_draw");
    if (m === null)
      for (let u = 0; u < f.length; u++)
        c(f[u] / a, p[u], _[u]);
    else {
      m.multiDrawElementsInstancedWEBGL(n, p, 0, s, f, 0, _, 0, g);
      let u = 0;
      for (let T = 0; T < g; T++)
        u += p[T] * _[T];
      e.update(u, n, 1);
    }
  }
  this.setMode = r, this.setIndex = o, this.render = l, this.renderInstances = c, this.renderMultiDraw = h, this.renderMultiDrawInstances = d;
}
function Wp(i) {
  const t = {
    geometries: 0,
    textures: 0
  }, e = {
    frame: 0,
    calls: 0,
    triangles: 0,
    points: 0,
    lines: 0
  };
  function n(s, a, o) {
    switch (e.calls++, a) {
      case i.TRIANGLES:
        e.triangles += o * (s / 3);
        break;
      case i.LINES:
        e.lines += o * (s / 2);
        break;
      case i.LINE_STRIP:
        e.lines += o * (s - 1);
        break;
      case i.LINE_LOOP:
        e.lines += o * s;
        break;
      case i.POINTS:
        e.points += o * s;
        break;
      default:
        console.error("THREE.WebGLInfo: Unknown draw mode:", a);
        break;
    }
  }
  function r() {
    e.calls = 0, e.triangles = 0, e.points = 0, e.lines = 0;
  }
  return {
    memory: t,
    render: e,
    programs: null,
    autoReset: !0,
    reset: r,
    update: n
  };
}
function Xp(i, t, e) {
  const n = /* @__PURE__ */ new WeakMap(), r = new ve();
  function s(a, o, l) {
    const c = a.morphTargetInfluences, h = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, d = h !== void 0 ? h.length : 0;
    let f = n.get(o);
    if (f === void 0 || f.count !== d) {
      let S = function() {
        F.dispose(), n.delete(o), o.removeEventListener("dispose", S);
      };
      var p = S;
      f !== void 0 && f.texture.dispose();
      const g = o.morphAttributes.position !== void 0, _ = o.morphAttributes.normal !== void 0, m = o.morphAttributes.color !== void 0, u = o.morphAttributes.position || [], T = o.morphAttributes.normal || [], b = o.morphAttributes.color || [];
      let y = 0;
      g === !0 && (y = 1), _ === !0 && (y = 2), m === !0 && (y = 3);
      let w = o.attributes.position.count * y, R = 1;
      w > t.maxTextureSize && (R = Math.ceil(w / t.maxTextureSize), w = t.maxTextureSize);
      const C = new Float32Array(w * R * 4 * d), F = new sc(C, w, R, d);
      F.type = zn, F.needsUpdate = !0;
      const M = y * 4;
      for (let P = 0; P < d; P++) {
        const V = u[P], X = T[P], U = b[P], k = w * R * 4 * P;
        for (let H = 0; H < V.count; H++) {
          const B = H * M;
          g === !0 && (r.fromBufferAttribute(V, H), C[k + B + 0] = r.x, C[k + B + 1] = r.y, C[k + B + 2] = r.z, C[k + B + 3] = 0), _ === !0 && (r.fromBufferAttribute(X, H), C[k + B + 4] = r.x, C[k + B + 5] = r.y, C[k + B + 6] = r.z, C[k + B + 7] = 0), m === !0 && (r.fromBufferAttribute(U, H), C[k + B + 8] = r.x, C[k + B + 9] = r.y, C[k + B + 10] = r.z, C[k + B + 11] = U.itemSize === 4 ? r.w : 1);
        }
      }
      f = {
        count: d,
        texture: F,
        size: new It(w, R)
      }, n.set(o, f), o.addEventListener("dispose", S);
    }
    if (a.isInstancedMesh === !0 && a.morphTexture !== null)
      l.getUniforms().setValue(i, "morphTexture", a.morphTexture, e);
    else {
      let g = 0;
      for (let m = 0; m < c.length; m++)
        g += c[m];
      const _ = o.morphTargetsRelative ? 1 : 1 - g;
      l.getUniforms().setValue(i, "morphTargetBaseInfluence", _), l.getUniforms().setValue(i, "morphTargetInfluences", c);
    }
    l.getUniforms().setValue(i, "morphTargetsTexture", f.texture, e), l.getUniforms().setValue(i, "morphTargetsTextureSize", f.size);
  }
  return {
    update: s
  };
}
function $p(i, t, e, n) {
  let r = /* @__PURE__ */ new WeakMap();
  function s(l) {
    const c = n.render.frame, h = l.geometry, d = t.get(l, h);
    if (r.get(d) !== c && (t.update(d), r.set(d, c)), l.isInstancedMesh && (l.hasEventListener("dispose", o) === !1 && l.addEventListener("dispose", o), r.get(l) !== c && (e.update(l.instanceMatrix, i.ARRAY_BUFFER), l.instanceColor !== null && e.update(l.instanceColor, i.ARRAY_BUFFER), r.set(l, c))), l.isSkinnedMesh) {
      const f = l.skeleton;
      r.get(f) !== c && (f.update(), r.set(f, c));
    }
    return d;
  }
  function a() {
    r = /* @__PURE__ */ new WeakMap();
  }
  function o(l) {
    const c = l.target;
    c.removeEventListener("dispose", o), e.remove(c.instanceMatrix), c.instanceColor !== null && e.remove(c.instanceColor);
  }
  return {
    update: s,
    dispose: a
  };
}
const xc = /* @__PURE__ */ new $e(), ml = /* @__PURE__ */ new fc(1, 1), Mc = /* @__PURE__ */ new sc(), Sc = /* @__PURE__ */ new dd(), yc = /* @__PURE__ */ new dc(), gl = [], _l = [], vl = new Float32Array(16), xl = new Float32Array(9), Ml = new Float32Array(4);
function nr(i, t, e) {
  const n = i[0];
  if (n <= 0 || n > 0) return i;
  const r = t * e;
  let s = gl[r];
  if (s === void 0 && (s = new Float32Array(r), gl[r] = s), t !== 0) {
    n.toArray(s, 0);
    for (let a = 1, o = 0; a !== t; ++a)
      o += e, i[a].toArray(s, o);
  }
  return s;
}
function Ae(i, t) {
  if (i.length !== t.length) return !1;
  for (let e = 0, n = i.length; e < n; e++)
    if (i[e] !== t[e]) return !1;
  return !0;
}
function Re(i, t) {
  for (let e = 0, n = t.length; e < n; e++)
    i[e] = t[e];
}
function gs(i, t) {
  let e = _l[t];
  e === void 0 && (e = new Int32Array(t), _l[t] = e);
  for (let n = 0; n !== t; ++n)
    e[n] = i.allocateTextureUnit();
  return e;
}
function qp(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1f(this.addr, t), e[0] = t);
}
function Yp(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) && (i.uniform2f(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (Ae(e, t)) return;
    i.uniform2fv(this.addr, t), Re(e, t);
  }
}
function jp(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3f(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else if (t.r !== void 0)
    (e[0] !== t.r || e[1] !== t.g || e[2] !== t.b) && (i.uniform3f(this.addr, t.r, t.g, t.b), e[0] = t.r, e[1] = t.g, e[2] = t.b);
  else {
    if (Ae(e, t)) return;
    i.uniform3fv(this.addr, t), Re(e, t);
  }
}
function Kp(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4f(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (Ae(e, t)) return;
    i.uniform4fv(this.addr, t), Re(e, t);
  }
}
function Zp(i, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (Ae(e, t)) return;
    i.uniformMatrix2fv(this.addr, !1, t), Re(e, t);
  } else {
    if (Ae(e, n)) return;
    Ml.set(n), i.uniformMatrix2fv(this.addr, !1, Ml), Re(e, n);
  }
}
function Jp(i, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (Ae(e, t)) return;
    i.uniformMatrix3fv(this.addr, !1, t), Re(e, t);
  } else {
    if (Ae(e, n)) return;
    xl.set(n), i.uniformMatrix3fv(this.addr, !1, xl), Re(e, n);
  }
}
function Qp(i, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (Ae(e, t)) return;
    i.uniformMatrix4fv(this.addr, !1, t), Re(e, t);
  } else {
    if (Ae(e, n)) return;
    vl.set(n), i.uniformMatrix4fv(this.addr, !1, vl), Re(e, n);
  }
}
function tm(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1i(this.addr, t), e[0] = t);
}
function em(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) && (i.uniform2i(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (Ae(e, t)) return;
    i.uniform2iv(this.addr, t), Re(e, t);
  }
}
function nm(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3i(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else {
    if (Ae(e, t)) return;
    i.uniform3iv(this.addr, t), Re(e, t);
  }
}
function im(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4i(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (Ae(e, t)) return;
    i.uniform4iv(this.addr, t), Re(e, t);
  }
}
function rm(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1ui(this.addr, t), e[0] = t);
}
function sm(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) && (i.uniform2ui(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (Ae(e, t)) return;
    i.uniform2uiv(this.addr, t), Re(e, t);
  }
}
function am(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3ui(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else {
    if (Ae(e, t)) return;
    i.uniform3uiv(this.addr, t), Re(e, t);
  }
}
function om(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4ui(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (Ae(e, t)) return;
    i.uniform4uiv(this.addr, t), Re(e, t);
  }
}
function lm(i, t, e) {
  const n = this.cache, r = e.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r);
  let s;
  this.type === i.SAMPLER_2D_SHADOW ? (ml.compareFunction = nc, s = ml) : s = xc, e.setTexture2D(t || s, r);
}
function cm(i, t, e) {
  const n = this.cache, r = e.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r), e.setTexture3D(t || Sc, r);
}
function hm(i, t, e) {
  const n = this.cache, r = e.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r), e.setTextureCube(t || yc, r);
}
function dm(i, t, e) {
  const n = this.cache, r = e.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r), e.setTexture2DArray(t || Mc, r);
}
function um(i) {
  switch (i) {
    case 5126:
      return qp;
    // FLOAT
    case 35664:
      return Yp;
    // _VEC2
    case 35665:
      return jp;
    // _VEC3
    case 35666:
      return Kp;
    // _VEC4
    case 35674:
      return Zp;
    // _MAT2
    case 35675:
      return Jp;
    // _MAT3
    case 35676:
      return Qp;
    // _MAT4
    case 5124:
    case 35670:
      return tm;
    // INT, BOOL
    case 35667:
    case 35671:
      return em;
    // _VEC2
    case 35668:
    case 35672:
      return nm;
    // _VEC3
    case 35669:
    case 35673:
      return im;
    // _VEC4
    case 5125:
      return rm;
    // UINT
    case 36294:
      return sm;
    // _VEC2
    case 36295:
      return am;
    // _VEC3
    case 36296:
      return om;
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
      return lm;
    case 35679:
    // SAMPLER_3D
    case 36299:
    // INT_SAMPLER_3D
    case 36307:
      return cm;
    case 35680:
    // SAMPLER_CUBE
    case 36300:
    // INT_SAMPLER_CUBE
    case 36308:
    // UNSIGNED_INT_SAMPLER_CUBE
    case 36293:
      return hm;
    case 36289:
    // SAMPLER_2D_ARRAY
    case 36303:
    // INT_SAMPLER_2D_ARRAY
    case 36311:
    // UNSIGNED_INT_SAMPLER_2D_ARRAY
    case 36292:
      return dm;
  }
}
function fm(i, t) {
  i.uniform1fv(this.addr, t);
}
function pm(i, t) {
  const e = nr(t, this.size, 2);
  i.uniform2fv(this.addr, e);
}
function mm(i, t) {
  const e = nr(t, this.size, 3);
  i.uniform3fv(this.addr, e);
}
function gm(i, t) {
  const e = nr(t, this.size, 4);
  i.uniform4fv(this.addr, e);
}
function _m(i, t) {
  const e = nr(t, this.size, 4);
  i.uniformMatrix2fv(this.addr, !1, e);
}
function vm(i, t) {
  const e = nr(t, this.size, 9);
  i.uniformMatrix3fv(this.addr, !1, e);
}
function xm(i, t) {
  const e = nr(t, this.size, 16);
  i.uniformMatrix4fv(this.addr, !1, e);
}
function Mm(i, t) {
  i.uniform1iv(this.addr, t);
}
function Sm(i, t) {
  i.uniform2iv(this.addr, t);
}
function ym(i, t) {
  i.uniform3iv(this.addr, t);
}
function Em(i, t) {
  i.uniform4iv(this.addr, t);
}
function bm(i, t) {
  i.uniform1uiv(this.addr, t);
}
function Tm(i, t) {
  i.uniform2uiv(this.addr, t);
}
function wm(i, t) {
  i.uniform3uiv(this.addr, t);
}
function Am(i, t) {
  i.uniform4uiv(this.addr, t);
}
function Rm(i, t, e) {
  const n = this.cache, r = t.length, s = gs(e, r);
  Ae(n, s) || (i.uniform1iv(this.addr, s), Re(n, s));
  for (let a = 0; a !== r; ++a)
    e.setTexture2D(t[a] || xc, s[a]);
}
function Cm(i, t, e) {
  const n = this.cache, r = t.length, s = gs(e, r);
  Ae(n, s) || (i.uniform1iv(this.addr, s), Re(n, s));
  for (let a = 0; a !== r; ++a)
    e.setTexture3D(t[a] || Sc, s[a]);
}
function Pm(i, t, e) {
  const n = this.cache, r = t.length, s = gs(e, r);
  Ae(n, s) || (i.uniform1iv(this.addr, s), Re(n, s));
  for (let a = 0; a !== r; ++a)
    e.setTextureCube(t[a] || yc, s[a]);
}
function Dm(i, t, e) {
  const n = this.cache, r = t.length, s = gs(e, r);
  Ae(n, s) || (i.uniform1iv(this.addr, s), Re(n, s));
  for (let a = 0; a !== r; ++a)
    e.setTexture2DArray(t[a] || Mc, s[a]);
}
function Lm(i) {
  switch (i) {
    case 5126:
      return fm;
    // FLOAT
    case 35664:
      return pm;
    // _VEC2
    case 35665:
      return mm;
    // _VEC3
    case 35666:
      return gm;
    // _VEC4
    case 35674:
      return _m;
    // _MAT2
    case 35675:
      return vm;
    // _MAT3
    case 35676:
      return xm;
    // _MAT4
    case 5124:
    case 35670:
      return Mm;
    // INT, BOOL
    case 35667:
    case 35671:
      return Sm;
    // _VEC2
    case 35668:
    case 35672:
      return ym;
    // _VEC3
    case 35669:
    case 35673:
      return Em;
    // _VEC4
    case 5125:
      return bm;
    // UINT
    case 36294:
      return Tm;
    // _VEC2
    case 36295:
      return wm;
    // _VEC3
    case 36296:
      return Am;
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
      return Rm;
    case 35679:
    // SAMPLER_3D
    case 36299:
    // INT_SAMPLER_3D
    case 36307:
      return Cm;
    case 35680:
    // SAMPLER_CUBE
    case 36300:
    // INT_SAMPLER_CUBE
    case 36308:
    // UNSIGNED_INT_SAMPLER_CUBE
    case 36293:
      return Pm;
    case 36289:
    // SAMPLER_2D_ARRAY
    case 36303:
    // INT_SAMPLER_2D_ARRAY
    case 36311:
    // UNSIGNED_INT_SAMPLER_2D_ARRAY
    case 36292:
      return Dm;
  }
}
class Im {
  constructor(t, e, n) {
    this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.setValue = um(e.type);
  }
}
class Um {
  constructor(t, e, n) {
    this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.size = e.size, this.setValue = Lm(e.type);
  }
}
class Nm {
  constructor(t) {
    this.id = t, this.seq = [], this.map = {};
  }
  setValue(t, e, n) {
    const r = this.seq;
    for (let s = 0, a = r.length; s !== a; ++s) {
      const o = r[s];
      o.setValue(t, e[o.id], n);
    }
  }
}
const Js = /(\w+)(\])?(\[|\.)?/g;
function Sl(i, t) {
  i.seq.push(t), i.map[t.id] = t;
}
function Fm(i, t, e) {
  const n = i.name, r = n.length;
  for (Js.lastIndex = 0; ; ) {
    const s = Js.exec(n), a = Js.lastIndex;
    let o = s[1];
    const l = s[2] === "]", c = s[3];
    if (l && (o = o | 0), c === void 0 || c === "[" && a + 2 === r) {
      Sl(e, c === void 0 ? new Im(o, i, t) : new Um(o, i, t));
      break;
    } else {
      let d = e.map[o];
      d === void 0 && (d = new Nm(o), Sl(e, d)), e = d;
    }
  }
}
class ss {
  constructor(t, e) {
    this.seq = [], this.map = {};
    const n = t.getProgramParameter(e, t.ACTIVE_UNIFORMS);
    for (let r = 0; r < n; ++r) {
      const s = t.getActiveUniform(e, r), a = t.getUniformLocation(e, s.name);
      Fm(s, a, this);
    }
  }
  setValue(t, e, n, r) {
    const s = this.map[e];
    s !== void 0 && s.setValue(t, n, r);
  }
  setOptional(t, e, n) {
    const r = e[n];
    r !== void 0 && this.setValue(t, n, r);
  }
  static upload(t, e, n, r) {
    for (let s = 0, a = e.length; s !== a; ++s) {
      const o = e[s], l = n[o.id];
      l.needsUpdate !== !1 && o.setValue(t, l.value, r);
    }
  }
  static seqWithValue(t, e) {
    const n = [];
    for (let r = 0, s = t.length; r !== s; ++r) {
      const a = t[r];
      a.id in e && n.push(a);
    }
    return n;
  }
}
function yl(i, t, e) {
  const n = i.createShader(t);
  return i.shaderSource(n, e), i.compileShader(n), n;
}
const Om = 37297;
let km = 0;
function Bm(i, t) {
  const e = i.split(`
`), n = [], r = Math.max(t - 6, 0), s = Math.min(t + 6, e.length);
  for (let a = r; a < s; a++) {
    const o = a + 1;
    n.push(`${o === t ? ">" : " "} ${o}: ${e[a]}`);
  }
  return n.join(`
`);
}
const El = /* @__PURE__ */ new zt();
function zm(i) {
  Kt._getMatrix(El, Kt.workingColorSpace, i);
  const t = `mat3( ${El.elements.map((e) => e.toFixed(4))} )`;
  switch (Kt.getTransfer(i)) {
    case as:
      return [t, "LinearTransferOETF"];
    case ee:
      return [t, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space: ", i), [t, "LinearTransferOETF"];
  }
}
function bl(i, t, e) {
  const n = i.getShaderParameter(t, i.COMPILE_STATUS), s = (i.getShaderInfoLog(t) || "").trim();
  if (n && s === "") return "";
  const a = /ERROR: 0:(\d+)/.exec(s);
  if (a) {
    const o = parseInt(a[1]);
    return e.toUpperCase() + `

` + s + `

` + Bm(i.getShaderSource(t), o);
  } else
    return s;
}
function Hm(i, t) {
  const e = zm(t);
  return [
    `vec4 ${i}( vec4 value ) {`,
    `	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,
    "}"
  ].join(`
`);
}
function Vm(i, t) {
  let e;
  switch (t) {
    case bh:
      e = "Linear";
      break;
    case Th:
      e = "Reinhard";
      break;
    case wh:
      e = "Cineon";
      break;
    case Ah:
      e = "ACESFilmic";
      break;
    case Ch:
      e = "AgX";
      break;
    case Ph:
      e = "Neutral";
      break;
    case Rh:
      e = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", t), e = "Linear";
  }
  return "vec3 " + i + "( vec3 color ) { return " + e + "ToneMapping( color ); }";
}
const Qr = /* @__PURE__ */ new I();
function Gm() {
  Kt.getLuminanceCoefficients(Qr);
  const i = Qr.x.toFixed(4), t = Qr.y.toFixed(4), e = Qr.z.toFixed(4);
  return [
    "float luminance( const in vec3 rgb ) {",
    `	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,
    "	return dot( weights, rgb );",
    "}"
  ].join(`
`);
}
function Wm(i) {
  return [
    i.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
    i.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
  ].filter(hr).join(`
`);
}
function Xm(i) {
  const t = [];
  for (const e in i) {
    const n = i[e];
    n !== !1 && t.push("#define " + e + " " + n);
  }
  return t.join(`
`);
}
function $m(i, t) {
  const e = {}, n = i.getProgramParameter(t, i.ACTIVE_ATTRIBUTES);
  for (let r = 0; r < n; r++) {
    const s = i.getActiveAttrib(t, r), a = s.name;
    let o = 1;
    s.type === i.FLOAT_MAT2 && (o = 2), s.type === i.FLOAT_MAT3 && (o = 3), s.type === i.FLOAT_MAT4 && (o = 4), e[a] = {
      type: s.type,
      location: i.getAttribLocation(t, a),
      locationSize: o
    };
  }
  return e;
}
function hr(i) {
  return i !== "";
}
function Tl(i, t) {
  const e = t.numSpotLightShadows + t.numSpotLightMaps - t.numSpotLightShadowsWithMaps;
  return i.replace(/NUM_DIR_LIGHTS/g, t.numDirLights).replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, e).replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, t.numPointLights).replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, t.numPointLightShadows);
}
function wl(i, t) {
  return i.replace(/NUM_CLIPPING_PLANES/g, t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, t.numClippingPlanes - t.numClipIntersection);
}
const qm = /^[ \t]*#include +<([\w\d./]+)>/gm;
function Xa(i) {
  return i.replace(qm, jm);
}
const Ym = /* @__PURE__ */ new Map();
function jm(i, t) {
  let e = Vt[t];
  if (e === void 0) {
    const n = Ym.get(t);
    if (n !== void 0)
      e = Vt[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', t, n);
    else
      throw new Error("Can not resolve #include <" + t + ">");
  }
  return Xa(e);
}
const Km = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function Al(i) {
  return i.replace(Km, Zm);
}
function Zm(i, t, e, n) {
  let r = "";
  for (let s = parseInt(t); s < parseInt(e); s++)
    r += n.replace(/\[\s*i\s*\]/g, "[ " + s + " ]").replace(/UNROLLED_LOOP_INDEX/g, s);
  return r;
}
function Rl(i) {
  let t = `precision ${i.precision} float;
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
  return i.precision === "highp" ? t += `
#define HIGH_PRECISION` : i.precision === "mediump" ? t += `
#define MEDIUM_PRECISION` : i.precision === "lowp" && (t += `
#define LOW_PRECISION`), t;
}
function Jm(i) {
  let t = "SHADOWMAP_TYPE_BASIC";
  return i.shadowMapType === Wl ? t = "SHADOWMAP_TYPE_PCF" : i.shadowMapType === ih ? t = "SHADOWMAP_TYPE_PCF_SOFT" : i.shadowMapType === kn && (t = "SHADOWMAP_TYPE_VSM"), t;
}
function Qm(i) {
  let t = "ENVMAP_TYPE_CUBE";
  if (i.envMap)
    switch (i.envMapMode) {
      case ji:
      case Ki:
        t = "ENVMAP_TYPE_CUBE";
        break;
      case fs:
        t = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
  return t;
}
function tg(i) {
  let t = "ENVMAP_MODE_REFLECTION";
  return i.envMap && i.envMapMode === Ki && (t = "ENVMAP_MODE_REFRACTION"), t;
}
function eg(i) {
  let t = "ENVMAP_BLENDING_NONE";
  if (i.envMap)
    switch (i.combine) {
      case Xl:
        t = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case yh:
        t = "ENVMAP_BLENDING_MIX";
        break;
      case Eh:
        t = "ENVMAP_BLENDING_ADD";
        break;
    }
  return t;
}
function ng(i) {
  const t = i.envMapCubeUVHeight;
  if (t === null) return null;
  const e = Math.log2(t) - 2, n = 1 / t;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, e), 112)), texelHeight: n, maxMip: e };
}
function ig(i, t, e, n) {
  const r = i.getContext(), s = e.defines;
  let a = e.vertexShader, o = e.fragmentShader;
  const l = Jm(e), c = Qm(e), h = tg(e), d = eg(e), f = ng(e), p = Wm(e), g = Xm(s), _ = r.createProgram();
  let m, u, T = e.glslVersion ? "#version " + e.glslVersion + `
` : "";
  e.isRawShaderMaterial ? (m = [
    "#define SHADER_TYPE " + e.shaderType,
    "#define SHADER_NAME " + e.shaderName,
    g
  ].filter(hr).join(`
`), m.length > 0 && (m += `
`), u = [
    "#define SHADER_TYPE " + e.shaderType,
    "#define SHADER_NAME " + e.shaderName,
    g
  ].filter(hr).join(`
`), u.length > 0 && (u += `
`)) : (m = [
    Rl(e),
    "#define SHADER_TYPE " + e.shaderType,
    "#define SHADER_NAME " + e.shaderName,
    g,
    e.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
    e.batching ? "#define USE_BATCHING" : "",
    e.batchingColor ? "#define USE_BATCHING_COLOR" : "",
    e.instancing ? "#define USE_INSTANCING" : "",
    e.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
    e.instancingMorph ? "#define USE_INSTANCING_MORPH" : "",
    e.useFog && e.fog ? "#define USE_FOG" : "",
    e.useFog && e.fogExp2 ? "#define FOG_EXP2" : "",
    e.map ? "#define USE_MAP" : "",
    e.envMap ? "#define USE_ENVMAP" : "",
    e.envMap ? "#define " + h : "",
    e.lightMap ? "#define USE_LIGHTMAP" : "",
    e.aoMap ? "#define USE_AOMAP" : "",
    e.bumpMap ? "#define USE_BUMPMAP" : "",
    e.normalMap ? "#define USE_NORMALMAP" : "",
    e.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    e.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    e.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
    e.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    e.anisotropy ? "#define USE_ANISOTROPY" : "",
    e.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    e.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    e.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    e.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    e.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    e.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    e.specularMap ? "#define USE_SPECULARMAP" : "",
    e.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    e.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    e.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    e.metalnessMap ? "#define USE_METALNESSMAP" : "",
    e.alphaMap ? "#define USE_ALPHAMAP" : "",
    e.alphaHash ? "#define USE_ALPHAHASH" : "",
    e.transmission ? "#define USE_TRANSMISSION" : "",
    e.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    e.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    e.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    e.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    //
    e.mapUv ? "#define MAP_UV " + e.mapUv : "",
    e.alphaMapUv ? "#define ALPHAMAP_UV " + e.alphaMapUv : "",
    e.lightMapUv ? "#define LIGHTMAP_UV " + e.lightMapUv : "",
    e.aoMapUv ? "#define AOMAP_UV " + e.aoMapUv : "",
    e.emissiveMapUv ? "#define EMISSIVEMAP_UV " + e.emissiveMapUv : "",
    e.bumpMapUv ? "#define BUMPMAP_UV " + e.bumpMapUv : "",
    e.normalMapUv ? "#define NORMALMAP_UV " + e.normalMapUv : "",
    e.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + e.displacementMapUv : "",
    e.metalnessMapUv ? "#define METALNESSMAP_UV " + e.metalnessMapUv : "",
    e.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + e.roughnessMapUv : "",
    e.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + e.anisotropyMapUv : "",
    e.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + e.clearcoatMapUv : "",
    e.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + e.clearcoatNormalMapUv : "",
    e.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + e.clearcoatRoughnessMapUv : "",
    e.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + e.iridescenceMapUv : "",
    e.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + e.iridescenceThicknessMapUv : "",
    e.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + e.sheenColorMapUv : "",
    e.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + e.sheenRoughnessMapUv : "",
    e.specularMapUv ? "#define SPECULARMAP_UV " + e.specularMapUv : "",
    e.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + e.specularColorMapUv : "",
    e.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + e.specularIntensityMapUv : "",
    e.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + e.transmissionMapUv : "",
    e.thicknessMapUv ? "#define THICKNESSMAP_UV " + e.thicknessMapUv : "",
    //
    e.vertexTangents && e.flatShading === !1 ? "#define USE_TANGENT" : "",
    e.vertexColors ? "#define USE_COLOR" : "",
    e.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    e.vertexUv1s ? "#define USE_UV1" : "",
    e.vertexUv2s ? "#define USE_UV2" : "",
    e.vertexUv3s ? "#define USE_UV3" : "",
    e.pointsUvs ? "#define USE_POINTS_UV" : "",
    e.flatShading ? "#define FLAT_SHADED" : "",
    e.skinning ? "#define USE_SKINNING" : "",
    e.morphTargets ? "#define USE_MORPHTARGETS" : "",
    e.morphNormals && e.flatShading === !1 ? "#define USE_MORPHNORMALS" : "",
    e.morphColors ? "#define USE_MORPHCOLORS" : "",
    e.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + e.morphTextureStride : "",
    e.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + e.morphTargetsCount : "",
    e.doubleSided ? "#define DOUBLE_SIDED" : "",
    e.flipSided ? "#define FLIP_SIDED" : "",
    e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    e.shadowMapEnabled ? "#define " + l : "",
    e.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
    e.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    e.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
    e.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
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
  ].filter(hr).join(`
`), u = [
    Rl(e),
    "#define SHADER_TYPE " + e.shaderType,
    "#define SHADER_NAME " + e.shaderName,
    g,
    e.useFog && e.fog ? "#define USE_FOG" : "",
    e.useFog && e.fogExp2 ? "#define FOG_EXP2" : "",
    e.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
    e.map ? "#define USE_MAP" : "",
    e.matcap ? "#define USE_MATCAP" : "",
    e.envMap ? "#define USE_ENVMAP" : "",
    e.envMap ? "#define " + c : "",
    e.envMap ? "#define " + h : "",
    e.envMap ? "#define " + d : "",
    f ? "#define CUBEUV_TEXEL_WIDTH " + f.texelWidth : "",
    f ? "#define CUBEUV_TEXEL_HEIGHT " + f.texelHeight : "",
    f ? "#define CUBEUV_MAX_MIP " + f.maxMip + ".0" : "",
    e.lightMap ? "#define USE_LIGHTMAP" : "",
    e.aoMap ? "#define USE_AOMAP" : "",
    e.bumpMap ? "#define USE_BUMPMAP" : "",
    e.normalMap ? "#define USE_NORMALMAP" : "",
    e.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    e.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    e.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    e.anisotropy ? "#define USE_ANISOTROPY" : "",
    e.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    e.clearcoat ? "#define USE_CLEARCOAT" : "",
    e.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    e.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    e.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    e.dispersion ? "#define USE_DISPERSION" : "",
    e.iridescence ? "#define USE_IRIDESCENCE" : "",
    e.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    e.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    e.specularMap ? "#define USE_SPECULARMAP" : "",
    e.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    e.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    e.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    e.metalnessMap ? "#define USE_METALNESSMAP" : "",
    e.alphaMap ? "#define USE_ALPHAMAP" : "",
    e.alphaTest ? "#define USE_ALPHATEST" : "",
    e.alphaHash ? "#define USE_ALPHAHASH" : "",
    e.sheen ? "#define USE_SHEEN" : "",
    e.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    e.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    e.transmission ? "#define USE_TRANSMISSION" : "",
    e.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    e.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    e.vertexTangents && e.flatShading === !1 ? "#define USE_TANGENT" : "",
    e.vertexColors || e.instancingColor || e.batchingColor ? "#define USE_COLOR" : "",
    e.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    e.vertexUv1s ? "#define USE_UV1" : "",
    e.vertexUv2s ? "#define USE_UV2" : "",
    e.vertexUv3s ? "#define USE_UV3" : "",
    e.pointsUvs ? "#define USE_POINTS_UV" : "",
    e.gradientMap ? "#define USE_GRADIENTMAP" : "",
    e.flatShading ? "#define FLAT_SHADED" : "",
    e.doubleSided ? "#define DOUBLE_SIDED" : "",
    e.flipSided ? "#define FLIP_SIDED" : "",
    e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    e.shadowMapEnabled ? "#define " + l : "",
    e.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
    e.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    e.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
    e.decodeVideoTextureEmissive ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE" : "",
    e.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
    e.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
    "uniform mat4 viewMatrix;",
    "uniform vec3 cameraPosition;",
    "uniform bool isOrthographic;",
    e.toneMapping !== Jn ? "#define TONE_MAPPING" : "",
    e.toneMapping !== Jn ? Vt.tonemapping_pars_fragment : "",
    // this code is required here because it is used by the toneMapping() function defined below
    e.toneMapping !== Jn ? Vm("toneMapping", e.toneMapping) : "",
    e.dithering ? "#define DITHERING" : "",
    e.opaque ? "#define OPAQUE" : "",
    Vt.colorspace_pars_fragment,
    // this code is required here because it is used by the various encoding/decoding function defined below
    Hm("linearToOutputTexel", e.outputColorSpace),
    Gm(),
    e.useDepthPacking ? "#define DEPTH_PACKING " + e.depthPacking : "",
    `
`
  ].filter(hr).join(`
`)), a = Xa(a), a = Tl(a, e), a = wl(a, e), o = Xa(o), o = Tl(o, e), o = wl(o, e), a = Al(a), o = Al(o), e.isRawShaderMaterial !== !0 && (T = `#version 300 es
`, m = [
    p,
    "#define attribute in",
    "#define varying out",
    "#define texture2D texture"
  ].join(`
`) + `
` + m, u = [
    "#define varying in",
    e.glslVersion === Io ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
    e.glslVersion === Io ? "" : "#define gl_FragColor pc_fragColor",
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
` + u);
  const b = T + m + a, y = T + u + o, w = yl(r, r.VERTEX_SHADER, b), R = yl(r, r.FRAGMENT_SHADER, y);
  r.attachShader(_, w), r.attachShader(_, R), e.index0AttributeName !== void 0 ? r.bindAttribLocation(_, 0, e.index0AttributeName) : e.morphTargets === !0 && r.bindAttribLocation(_, 0, "position"), r.linkProgram(_);
  function C(P) {
    if (i.debug.checkShaderErrors) {
      const V = r.getProgramInfoLog(_) || "", X = r.getShaderInfoLog(w) || "", U = r.getShaderInfoLog(R) || "", k = V.trim(), H = X.trim(), B = U.trim();
      let D = !0, j = !0;
      if (r.getProgramParameter(_, r.LINK_STATUS) === !1)
        if (D = !1, typeof i.debug.onShaderError == "function")
          i.debug.onShaderError(r, _, w, R);
        else {
          const at = bl(r, w, "vertex"), dt = bl(r, R, "fragment");
          console.error(
            "THREE.WebGLProgram: Shader Error " + r.getError() + " - VALIDATE_STATUS " + r.getProgramParameter(_, r.VALIDATE_STATUS) + `

Material Name: ` + P.name + `
Material Type: ` + P.type + `

Program Info Log: ` + k + `
` + at + `
` + dt
          );
        }
      else k !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", k) : (H === "" || B === "") && (j = !1);
      j && (P.diagnostics = {
        runnable: D,
        programLog: k,
        vertexShader: {
          log: H,
          prefix: m
        },
        fragmentShader: {
          log: B,
          prefix: u
        }
      });
    }
    r.deleteShader(w), r.deleteShader(R), F = new ss(r, _), M = $m(r, _);
  }
  let F;
  this.getUniforms = function() {
    return F === void 0 && C(this), F;
  };
  let M;
  this.getAttributes = function() {
    return M === void 0 && C(this), M;
  };
  let S = e.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function() {
    return S === !1 && (S = r.getProgramParameter(_, Om)), S;
  }, this.destroy = function() {
    n.releaseStatesOfProgram(this), r.deleteProgram(_), this.program = void 0;
  }, this.type = e.shaderType, this.name = e.shaderName, this.id = km++, this.cacheKey = t, this.usedTimes = 1, this.program = _, this.vertexShader = w, this.fragmentShader = R, this;
}
let rg = 0;
class sg {
  constructor() {
    this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
  }
  update(t) {
    const e = t.vertexShader, n = t.fragmentShader, r = this._getShaderStage(e), s = this._getShaderStage(n), a = this._getShaderCacheForMaterial(t);
    return a.has(r) === !1 && (a.add(r), r.usedTimes++), a.has(s) === !1 && (a.add(s), s.usedTimes++), this;
  }
  remove(t) {
    const e = this.materialCache.get(t);
    for (const n of e)
      n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code);
    return this.materialCache.delete(t), this;
  }
  getVertexShaderID(t) {
    return this._getShaderStage(t.vertexShader).id;
  }
  getFragmentShaderID(t) {
    return this._getShaderStage(t.fragmentShader).id;
  }
  dispose() {
    this.shaderCache.clear(), this.materialCache.clear();
  }
  _getShaderCacheForMaterial(t) {
    const e = this.materialCache;
    let n = e.get(t);
    return n === void 0 && (n = /* @__PURE__ */ new Set(), e.set(t, n)), n;
  }
  _getShaderStage(t) {
    const e = this.shaderCache;
    let n = e.get(t);
    return n === void 0 && (n = new ag(t), e.set(t, n)), n;
  }
}
class ag {
  constructor(t) {
    this.id = rg++, this.code = t, this.usedTimes = 0;
  }
}
function og(i, t, e, n, r, s, a) {
  const o = new so(), l = new sg(), c = /* @__PURE__ */ new Set(), h = [], d = r.logarithmicDepthBuffer, f = r.vertexTextures;
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
  function _(M) {
    return c.add(M), M === 0 ? "uv" : `uv${M}`;
  }
  function m(M, S, P, V, X) {
    const U = V.fog, k = X.geometry, H = M.isMeshStandardMaterial ? V.environment : null, B = (M.isMeshStandardMaterial ? e : t).get(M.envMap || H), D = B && B.mapping === fs ? B.image.height : null, j = g[M.type];
    M.precision !== null && (p = r.getMaxPrecision(M.precision), p !== M.precision && console.warn("THREE.WebGLProgram.getParameters:", M.precision, "not supported, using", p, "instead."));
    const at = k.morphAttributes.position || k.morphAttributes.normal || k.morphAttributes.color, dt = at !== void 0 ? at.length : 0;
    let Wt = 0;
    k.morphAttributes.position !== void 0 && (Wt = 1), k.morphAttributes.normal !== void 0 && (Wt = 2), k.morphAttributes.color !== void 0 && (Wt = 3);
    let Qt, Xt, kt, K;
    if (j) {
      const Zt = yn[j];
      Qt = Zt.vertexShader, Xt = Zt.fragmentShader;
    } else
      Qt = M.vertexShader, Xt = M.fragmentShader, l.update(M), kt = l.getVertexShaderID(M), K = l.getFragmentShaderID(M);
    const J = i.getRenderTarget(), ft = i.state.buffers.depth.getReversed(), Lt = X.isInstancedMesh === !0, Et = X.isBatchedMesh === !0, qt = !!M.map, Oe = !!M.matcap, A = !!B, he = !!M.aoMap, Ot = !!M.lightMap, Pt = !!M.bumpMap, _t = !!M.normalMap, de = !!M.displacementMap, vt = !!M.emissiveMap, Ht = !!M.metalnessMap, Ce = !!M.roughnessMap, xe = M.anisotropy > 0, E = M.clearcoat > 0, v = M.dispersion > 0, z = M.iridescence > 0, Y = M.sheen > 0, Q = M.transmission > 0, q = xe && !!M.anisotropyMap, yt = E && !!M.clearcoatMap, rt = E && !!M.clearcoatNormalMap, xt = E && !!M.clearcoatRoughnessMap, Mt = z && !!M.iridescenceMap, nt = z && !!M.iridescenceThicknessMap, ht = Y && !!M.sheenColorMap, Rt = Y && !!M.sheenRoughnessMap, St = !!M.specularMap, lt = !!M.specularColorMap, Bt = !!M.specularIntensityMap, L = Q && !!M.transmissionMap, it = Q && !!M.thicknessMap, st = !!M.gradientMap, pt = !!M.alphaMap, tt = M.alphaTest > 0, Z = !!M.alphaHash, gt = !!M.extensions;
    let Ft = Jn;
    M.toneMapped && (J === null || J.isXRRenderTarget === !0) && (Ft = i.toneMapping);
    const se = {
      shaderID: j,
      shaderType: M.type,
      shaderName: M.name,
      vertexShader: Qt,
      fragmentShader: Xt,
      defines: M.defines,
      customVertexShaderID: kt,
      customFragmentShaderID: K,
      isRawShaderMaterial: M.isRawShaderMaterial === !0,
      glslVersion: M.glslVersion,
      precision: p,
      batching: Et,
      batchingColor: Et && X._colorsTexture !== null,
      instancing: Lt,
      instancingColor: Lt && X.instanceColor !== null,
      instancingMorph: Lt && X.morphTexture !== null,
      supportsVertexTextures: f,
      outputColorSpace: J === null ? i.outputColorSpace : J.isXRRenderTarget === !0 ? J.texture.colorSpace : Zi,
      alphaToCoverage: !!M.alphaToCoverage,
      map: qt,
      matcap: Oe,
      envMap: A,
      envMapMode: A && B.mapping,
      envMapCubeUVHeight: D,
      aoMap: he,
      lightMap: Ot,
      bumpMap: Pt,
      normalMap: _t,
      displacementMap: f && de,
      emissiveMap: vt,
      normalMapObjectSpace: _t && M.normalMapType === Uh,
      normalMapTangentSpace: _t && M.normalMapType === ec,
      metalnessMap: Ht,
      roughnessMap: Ce,
      anisotropy: xe,
      anisotropyMap: q,
      clearcoat: E,
      clearcoatMap: yt,
      clearcoatNormalMap: rt,
      clearcoatRoughnessMap: xt,
      dispersion: v,
      iridescence: z,
      iridescenceMap: Mt,
      iridescenceThicknessMap: nt,
      sheen: Y,
      sheenColorMap: ht,
      sheenRoughnessMap: Rt,
      specularMap: St,
      specularColorMap: lt,
      specularIntensityMap: Bt,
      transmission: Q,
      transmissionMap: L,
      thicknessMap: it,
      gradientMap: st,
      opaque: M.transparent === !1 && M.blending === Wi && M.alphaToCoverage === !1,
      alphaMap: pt,
      alphaTest: tt,
      alphaHash: Z,
      combine: M.combine,
      //
      mapUv: qt && _(M.map.channel),
      aoMapUv: he && _(M.aoMap.channel),
      lightMapUv: Ot && _(M.lightMap.channel),
      bumpMapUv: Pt && _(M.bumpMap.channel),
      normalMapUv: _t && _(M.normalMap.channel),
      displacementMapUv: de && _(M.displacementMap.channel),
      emissiveMapUv: vt && _(M.emissiveMap.channel),
      metalnessMapUv: Ht && _(M.metalnessMap.channel),
      roughnessMapUv: Ce && _(M.roughnessMap.channel),
      anisotropyMapUv: q && _(M.anisotropyMap.channel),
      clearcoatMapUv: yt && _(M.clearcoatMap.channel),
      clearcoatNormalMapUv: rt && _(M.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: xt && _(M.clearcoatRoughnessMap.channel),
      iridescenceMapUv: Mt && _(M.iridescenceMap.channel),
      iridescenceThicknessMapUv: nt && _(M.iridescenceThicknessMap.channel),
      sheenColorMapUv: ht && _(M.sheenColorMap.channel),
      sheenRoughnessMapUv: Rt && _(M.sheenRoughnessMap.channel),
      specularMapUv: St && _(M.specularMap.channel),
      specularColorMapUv: lt && _(M.specularColorMap.channel),
      specularIntensityMapUv: Bt && _(M.specularIntensityMap.channel),
      transmissionMapUv: L && _(M.transmissionMap.channel),
      thicknessMapUv: it && _(M.thicknessMap.channel),
      alphaMapUv: pt && _(M.alphaMap.channel),
      //
      vertexTangents: !!k.attributes.tangent && (_t || xe),
      vertexColors: M.vertexColors,
      vertexAlphas: M.vertexColors === !0 && !!k.attributes.color && k.attributes.color.itemSize === 4,
      pointsUvs: X.isPoints === !0 && !!k.attributes.uv && (qt || pt),
      fog: !!U,
      useFog: M.fog === !0,
      fogExp2: !!U && U.isFogExp2,
      flatShading: M.flatShading === !0 && M.wireframe === !1,
      sizeAttenuation: M.sizeAttenuation === !0,
      logarithmicDepthBuffer: d,
      reversedDepthBuffer: ft,
      skinning: X.isSkinnedMesh === !0,
      morphTargets: k.morphAttributes.position !== void 0,
      morphNormals: k.morphAttributes.normal !== void 0,
      morphColors: k.morphAttributes.color !== void 0,
      morphTargetsCount: dt,
      morphTextureStride: Wt,
      numDirLights: S.directional.length,
      numPointLights: S.point.length,
      numSpotLights: S.spot.length,
      numSpotLightMaps: S.spotLightMap.length,
      numRectAreaLights: S.rectArea.length,
      numHemiLights: S.hemi.length,
      numDirLightShadows: S.directionalShadowMap.length,
      numPointLightShadows: S.pointShadowMap.length,
      numSpotLightShadows: S.spotShadowMap.length,
      numSpotLightShadowsWithMaps: S.numSpotLightShadowsWithMaps,
      numLightProbes: S.numLightProbes,
      numClippingPlanes: a.numPlanes,
      numClipIntersection: a.numIntersection,
      dithering: M.dithering,
      shadowMapEnabled: i.shadowMap.enabled && P.length > 0,
      shadowMapType: i.shadowMap.type,
      toneMapping: Ft,
      decodeVideoTexture: qt && M.map.isVideoTexture === !0 && Kt.getTransfer(M.map.colorSpace) === ee,
      decodeVideoTextureEmissive: vt && M.emissiveMap.isVideoTexture === !0 && Kt.getTransfer(M.emissiveMap.colorSpace) === ee,
      premultipliedAlpha: M.premultipliedAlpha,
      doubleSided: M.side === ln,
      flipSided: M.side === Ke,
      useDepthPacking: M.depthPacking >= 0,
      depthPacking: M.depthPacking || 0,
      index0AttributeName: M.index0AttributeName,
      extensionClipCullDistance: gt && M.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: (gt && M.extensions.multiDraw === !0 || Et) && n.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: M.customProgramCacheKey()
    };
    return se.vertexUv1s = c.has(1), se.vertexUv2s = c.has(2), se.vertexUv3s = c.has(3), c.clear(), se;
  }
  function u(M) {
    const S = [];
    if (M.shaderID ? S.push(M.shaderID) : (S.push(M.customVertexShaderID), S.push(M.customFragmentShaderID)), M.defines !== void 0)
      for (const P in M.defines)
        S.push(P), S.push(M.defines[P]);
    return M.isRawShaderMaterial === !1 && (T(S, M), b(S, M), S.push(i.outputColorSpace)), S.push(M.customProgramCacheKey), S.join();
  }
  function T(M, S) {
    M.push(S.precision), M.push(S.outputColorSpace), M.push(S.envMapMode), M.push(S.envMapCubeUVHeight), M.push(S.mapUv), M.push(S.alphaMapUv), M.push(S.lightMapUv), M.push(S.aoMapUv), M.push(S.bumpMapUv), M.push(S.normalMapUv), M.push(S.displacementMapUv), M.push(S.emissiveMapUv), M.push(S.metalnessMapUv), M.push(S.roughnessMapUv), M.push(S.anisotropyMapUv), M.push(S.clearcoatMapUv), M.push(S.clearcoatNormalMapUv), M.push(S.clearcoatRoughnessMapUv), M.push(S.iridescenceMapUv), M.push(S.iridescenceThicknessMapUv), M.push(S.sheenColorMapUv), M.push(S.sheenRoughnessMapUv), M.push(S.specularMapUv), M.push(S.specularColorMapUv), M.push(S.specularIntensityMapUv), M.push(S.transmissionMapUv), M.push(S.thicknessMapUv), M.push(S.combine), M.push(S.fogExp2), M.push(S.sizeAttenuation), M.push(S.morphTargetsCount), M.push(S.morphAttributeCount), M.push(S.numDirLights), M.push(S.numPointLights), M.push(S.numSpotLights), M.push(S.numSpotLightMaps), M.push(S.numHemiLights), M.push(S.numRectAreaLights), M.push(S.numDirLightShadows), M.push(S.numPointLightShadows), M.push(S.numSpotLightShadows), M.push(S.numSpotLightShadowsWithMaps), M.push(S.numLightProbes), M.push(S.shadowMapType), M.push(S.toneMapping), M.push(S.numClippingPlanes), M.push(S.numClipIntersection), M.push(S.depthPacking);
  }
  function b(M, S) {
    o.disableAll(), S.supportsVertexTextures && o.enable(0), S.instancing && o.enable(1), S.instancingColor && o.enable(2), S.instancingMorph && o.enable(3), S.matcap && o.enable(4), S.envMap && o.enable(5), S.normalMapObjectSpace && o.enable(6), S.normalMapTangentSpace && o.enable(7), S.clearcoat && o.enable(8), S.iridescence && o.enable(9), S.alphaTest && o.enable(10), S.vertexColors && o.enable(11), S.vertexAlphas && o.enable(12), S.vertexUv1s && o.enable(13), S.vertexUv2s && o.enable(14), S.vertexUv3s && o.enable(15), S.vertexTangents && o.enable(16), S.anisotropy && o.enable(17), S.alphaHash && o.enable(18), S.batching && o.enable(19), S.dispersion && o.enable(20), S.batchingColor && o.enable(21), S.gradientMap && o.enable(22), M.push(o.mask), o.disableAll(), S.fog && o.enable(0), S.useFog && o.enable(1), S.flatShading && o.enable(2), S.logarithmicDepthBuffer && o.enable(3), S.reversedDepthBuffer && o.enable(4), S.skinning && o.enable(5), S.morphTargets && o.enable(6), S.morphNormals && o.enable(7), S.morphColors && o.enable(8), S.premultipliedAlpha && o.enable(9), S.shadowMapEnabled && o.enable(10), S.doubleSided && o.enable(11), S.flipSided && o.enable(12), S.useDepthPacking && o.enable(13), S.dithering && o.enable(14), S.transmission && o.enable(15), S.sheen && o.enable(16), S.opaque && o.enable(17), S.pointsUvs && o.enable(18), S.decodeVideoTexture && o.enable(19), S.decodeVideoTextureEmissive && o.enable(20), S.alphaToCoverage && o.enable(21), M.push(o.mask);
  }
  function y(M) {
    const S = g[M.type];
    let P;
    if (S) {
      const V = yn[S];
      P = bd.clone(V.uniforms);
    } else
      P = M.uniforms;
    return P;
  }
  function w(M, S) {
    let P;
    for (let V = 0, X = h.length; V < X; V++) {
      const U = h[V];
      if (U.cacheKey === S) {
        P = U, ++P.usedTimes;
        break;
      }
    }
    return P === void 0 && (P = new ig(i, S, M, s), h.push(P)), P;
  }
  function R(M) {
    if (--M.usedTimes === 0) {
      const S = h.indexOf(M);
      h[S] = h[h.length - 1], h.pop(), M.destroy();
    }
  }
  function C(M) {
    l.remove(M);
  }
  function F() {
    l.dispose();
  }
  return {
    getParameters: m,
    getProgramCacheKey: u,
    getUniforms: y,
    acquireProgram: w,
    releaseProgram: R,
    releaseShaderCache: C,
    // Exposed for resource monitoring & error feedback via renderer.info:
    programs: h,
    dispose: F
  };
}
function lg() {
  let i = /* @__PURE__ */ new WeakMap();
  function t(a) {
    return i.has(a);
  }
  function e(a) {
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
    has: t,
    get: e,
    remove: n,
    update: r,
    dispose: s
  };
}
function cg(i, t) {
  return i.groupOrder !== t.groupOrder ? i.groupOrder - t.groupOrder : i.renderOrder !== t.renderOrder ? i.renderOrder - t.renderOrder : i.material.id !== t.material.id ? i.material.id - t.material.id : i.z !== t.z ? i.z - t.z : i.id - t.id;
}
function Cl(i, t) {
  return i.groupOrder !== t.groupOrder ? i.groupOrder - t.groupOrder : i.renderOrder !== t.renderOrder ? i.renderOrder - t.renderOrder : i.z !== t.z ? t.z - i.z : i.id - t.id;
}
function Pl() {
  const i = [];
  let t = 0;
  const e = [], n = [], r = [];
  function s() {
    t = 0, e.length = 0, n.length = 0, r.length = 0;
  }
  function a(d, f, p, g, _, m) {
    let u = i[t];
    return u === void 0 ? (u = {
      id: d.id,
      object: d,
      geometry: f,
      material: p,
      groupOrder: g,
      renderOrder: d.renderOrder,
      z: _,
      group: m
    }, i[t] = u) : (u.id = d.id, u.object = d, u.geometry = f, u.material = p, u.groupOrder = g, u.renderOrder = d.renderOrder, u.z = _, u.group = m), t++, u;
  }
  function o(d, f, p, g, _, m) {
    const u = a(d, f, p, g, _, m);
    p.transmission > 0 ? n.push(u) : p.transparent === !0 ? r.push(u) : e.push(u);
  }
  function l(d, f, p, g, _, m) {
    const u = a(d, f, p, g, _, m);
    p.transmission > 0 ? n.unshift(u) : p.transparent === !0 ? r.unshift(u) : e.unshift(u);
  }
  function c(d, f) {
    e.length > 1 && e.sort(d || cg), n.length > 1 && n.sort(f || Cl), r.length > 1 && r.sort(f || Cl);
  }
  function h() {
    for (let d = t, f = i.length; d < f; d++) {
      const p = i[d];
      if (p.id === null) break;
      p.id = null, p.object = null, p.geometry = null, p.material = null, p.group = null;
    }
  }
  return {
    opaque: e,
    transmissive: n,
    transparent: r,
    init: s,
    push: o,
    unshift: l,
    finish: h,
    sort: c
  };
}
function hg() {
  let i = /* @__PURE__ */ new WeakMap();
  function t(n, r) {
    const s = i.get(n);
    let a;
    return s === void 0 ? (a = new Pl(), i.set(n, [a])) : r >= s.length ? (a = new Pl(), s.push(a)) : a = s[r], a;
  }
  function e() {
    i = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: t,
    dispose: e
  };
}
function dg() {
  const i = {};
  return {
    get: function(t) {
      if (i[t.id] !== void 0)
        return i[t.id];
      let e;
      switch (t.type) {
        case "DirectionalLight":
          e = {
            direction: new I(),
            color: new Yt()
          };
          break;
        case "SpotLight":
          e = {
            position: new I(),
            direction: new I(),
            color: new Yt(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case "PointLight":
          e = {
            position: new I(),
            color: new Yt(),
            distance: 0,
            decay: 0
          };
          break;
        case "HemisphereLight":
          e = {
            direction: new I(),
            skyColor: new Yt(),
            groundColor: new Yt()
          };
          break;
        case "RectAreaLight":
          e = {
            color: new Yt(),
            position: new I(),
            halfWidth: new I(),
            halfHeight: new I()
          };
          break;
      }
      return i[t.id] = e, e;
    }
  };
}
function ug() {
  const i = {};
  return {
    get: function(t) {
      if (i[t.id] !== void 0)
        return i[t.id];
      let e;
      switch (t.type) {
        case "DirectionalLight":
          e = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new It()
          };
          break;
        case "SpotLight":
          e = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new It()
          };
          break;
        case "PointLight":
          e = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new It(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3
          };
          break;
      }
      return i[t.id] = e, e;
    }
  };
}
let fg = 0;
function pg(i, t) {
  return (t.castShadow ? 2 : 0) - (i.castShadow ? 2 : 0) + (t.map ? 1 : 0) - (i.map ? 1 : 0);
}
function mg(i) {
  const t = new dg(), e = ug(), n = {
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
  for (let c = 0; c < 9; c++) n.probe.push(new I());
  const r = new I(), s = new le(), a = new le();
  function o(c) {
    let h = 0, d = 0, f = 0;
    for (let M = 0; M < 9; M++) n.probe[M].set(0, 0, 0);
    let p = 0, g = 0, _ = 0, m = 0, u = 0, T = 0, b = 0, y = 0, w = 0, R = 0, C = 0;
    c.sort(pg);
    for (let M = 0, S = c.length; M < S; M++) {
      const P = c[M], V = P.color, X = P.intensity, U = P.distance, k = P.shadow && P.shadow.map ? P.shadow.map.texture : null;
      if (P.isAmbientLight)
        h += V.r * X, d += V.g * X, f += V.b * X;
      else if (P.isLightProbe) {
        for (let H = 0; H < 9; H++)
          n.probe[H].addScaledVector(P.sh.coefficients[H], X);
        C++;
      } else if (P.isDirectionalLight) {
        const H = t.get(P);
        if (H.color.copy(P.color).multiplyScalar(P.intensity), P.castShadow) {
          const B = P.shadow, D = e.get(P);
          D.shadowIntensity = B.intensity, D.shadowBias = B.bias, D.shadowNormalBias = B.normalBias, D.shadowRadius = B.radius, D.shadowMapSize = B.mapSize, n.directionalShadow[p] = D, n.directionalShadowMap[p] = k, n.directionalShadowMatrix[p] = P.shadow.matrix, T++;
        }
        n.directional[p] = H, p++;
      } else if (P.isSpotLight) {
        const H = t.get(P);
        H.position.setFromMatrixPosition(P.matrixWorld), H.color.copy(V).multiplyScalar(X), H.distance = U, H.coneCos = Math.cos(P.angle), H.penumbraCos = Math.cos(P.angle * (1 - P.penumbra)), H.decay = P.decay, n.spot[_] = H;
        const B = P.shadow;
        if (P.map && (n.spotLightMap[w] = P.map, w++, B.updateMatrices(P), P.castShadow && R++), n.spotLightMatrix[_] = B.matrix, P.castShadow) {
          const D = e.get(P);
          D.shadowIntensity = B.intensity, D.shadowBias = B.bias, D.shadowNormalBias = B.normalBias, D.shadowRadius = B.radius, D.shadowMapSize = B.mapSize, n.spotShadow[_] = D, n.spotShadowMap[_] = k, y++;
        }
        _++;
      } else if (P.isRectAreaLight) {
        const H = t.get(P);
        H.color.copy(V).multiplyScalar(X), H.halfWidth.set(P.width * 0.5, 0, 0), H.halfHeight.set(0, P.height * 0.5, 0), n.rectArea[m] = H, m++;
      } else if (P.isPointLight) {
        const H = t.get(P);
        if (H.color.copy(P.color).multiplyScalar(P.intensity), H.distance = P.distance, H.decay = P.decay, P.castShadow) {
          const B = P.shadow, D = e.get(P);
          D.shadowIntensity = B.intensity, D.shadowBias = B.bias, D.shadowNormalBias = B.normalBias, D.shadowRadius = B.radius, D.shadowMapSize = B.mapSize, D.shadowCameraNear = B.camera.near, D.shadowCameraFar = B.camera.far, n.pointShadow[g] = D, n.pointShadowMap[g] = k, n.pointShadowMatrix[g] = P.shadow.matrix, b++;
        }
        n.point[g] = H, g++;
      } else if (P.isHemisphereLight) {
        const H = t.get(P);
        H.skyColor.copy(P.color).multiplyScalar(X), H.groundColor.copy(P.groundColor).multiplyScalar(X), n.hemi[u] = H, u++;
      }
    }
    m > 0 && (i.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = ot.LTC_FLOAT_1, n.rectAreaLTC2 = ot.LTC_FLOAT_2) : (n.rectAreaLTC1 = ot.LTC_HALF_1, n.rectAreaLTC2 = ot.LTC_HALF_2)), n.ambient[0] = h, n.ambient[1] = d, n.ambient[2] = f;
    const F = n.hash;
    (F.directionalLength !== p || F.pointLength !== g || F.spotLength !== _ || F.rectAreaLength !== m || F.hemiLength !== u || F.numDirectionalShadows !== T || F.numPointShadows !== b || F.numSpotShadows !== y || F.numSpotMaps !== w || F.numLightProbes !== C) && (n.directional.length = p, n.spot.length = _, n.rectArea.length = m, n.point.length = g, n.hemi.length = u, n.directionalShadow.length = T, n.directionalShadowMap.length = T, n.pointShadow.length = b, n.pointShadowMap.length = b, n.spotShadow.length = y, n.spotShadowMap.length = y, n.directionalShadowMatrix.length = T, n.pointShadowMatrix.length = b, n.spotLightMatrix.length = y + w - R, n.spotLightMap.length = w, n.numSpotLightShadowsWithMaps = R, n.numLightProbes = C, F.directionalLength = p, F.pointLength = g, F.spotLength = _, F.rectAreaLength = m, F.hemiLength = u, F.numDirectionalShadows = T, F.numPointShadows = b, F.numSpotShadows = y, F.numSpotMaps = w, F.numLightProbes = C, n.version = fg++);
  }
  function l(c, h) {
    let d = 0, f = 0, p = 0, g = 0, _ = 0;
    const m = h.matrixWorldInverse;
    for (let u = 0, T = c.length; u < T; u++) {
      const b = c[u];
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
        const y = n.point[f];
        y.position.setFromMatrixPosition(b.matrixWorld), y.position.applyMatrix4(m), f++;
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
function Dl(i) {
  const t = new mg(i), e = [], n = [];
  function r(h) {
    c.camera = h, e.length = 0, n.length = 0;
  }
  function s(h) {
    e.push(h);
  }
  function a(h) {
    n.push(h);
  }
  function o() {
    t.setup(e);
  }
  function l(h) {
    t.setupView(e, h);
  }
  const c = {
    lightsArray: e,
    shadowsArray: n,
    camera: null,
    lights: t,
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
function gg(i) {
  let t = /* @__PURE__ */ new WeakMap();
  function e(r, s = 0) {
    const a = t.get(r);
    let o;
    return a === void 0 ? (o = new Dl(i), t.set(r, [o])) : s >= a.length ? (o = new Dl(i), a.push(o)) : o = a[s], o;
  }
  function n() {
    t = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: e,
    dispose: n
  };
}
const _g = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, vg = `uniform sampler2D shadow_pass;
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
function xg(i, t, e) {
  let n = new ao();
  const r = new It(), s = new It(), a = new ve(), o = new Bd({ depthPacking: Ih }), l = new zd(), c = {}, h = e.maxTextureSize, d = { [ti]: Ke, [Ke]: ti, [ln]: ln }, f = new ei({
    defines: {
      VSM_SAMPLES: 8
    },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new It() },
      radius: { value: 4 }
    },
    vertexShader: _g,
    fragmentShader: vg
  }), p = f.clone();
  p.defines.HORIZONTAL_PASS = 1;
  const g = new hn();
  g.setAttribute(
    "position",
    new xn(
      new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]),
      3
    )
  );
  const _ = new Xe(g, f), m = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = Wl;
  let u = this.type;
  this.render = function(R, C, F) {
    if (m.enabled === !1 || m.autoUpdate === !1 && m.needsUpdate === !1 || R.length === 0) return;
    const M = i.getRenderTarget(), S = i.getActiveCubeFace(), P = i.getActiveMipmapLevel(), V = i.state;
    V.setBlending(Zn), V.buffers.depth.getReversed() === !0 ? V.buffers.color.setClear(0, 0, 0, 0) : V.buffers.color.setClear(1, 1, 1, 1), V.buffers.depth.setTest(!0), V.setScissorTest(!1);
    const X = u !== kn && this.type === kn, U = u === kn && this.type !== kn;
    for (let k = 0, H = R.length; k < H; k++) {
      const B = R[k], D = B.shadow;
      if (D === void 0) {
        console.warn("THREE.WebGLShadowMap:", B, "has no shadow.");
        continue;
      }
      if (D.autoUpdate === !1 && D.needsUpdate === !1) continue;
      r.copy(D.mapSize);
      const j = D.getFrameExtents();
      if (r.multiply(j), s.copy(D.mapSize), (r.x > h || r.y > h) && (r.x > h && (s.x = Math.floor(h / j.x), r.x = s.x * j.x, D.mapSize.x = s.x), r.y > h && (s.y = Math.floor(h / j.y), r.y = s.y * j.y, D.mapSize.y = s.y)), D.map === null || X === !0 || U === !0) {
        const dt = this.type !== kn ? { minFilter: vn, magFilter: vn } : {};
        D.map !== null && D.map.dispose(), D.map = new xi(r.x, r.y, dt), D.map.texture.name = B.name + ".shadowMap", D.camera.updateProjectionMatrix();
      }
      i.setRenderTarget(D.map), i.clear();
      const at = D.getViewportCount();
      for (let dt = 0; dt < at; dt++) {
        const Wt = D.getViewport(dt);
        a.set(
          s.x * Wt.x,
          s.y * Wt.y,
          s.x * Wt.z,
          s.y * Wt.w
        ), V.viewport(a), D.updateMatrices(B, dt), n = D.getFrustum(), y(C, F, D.camera, B, this.type);
      }
      D.isPointLightShadow !== !0 && this.type === kn && T(D, F), D.needsUpdate = !1;
    }
    u = this.type, m.needsUpdate = !1, i.setRenderTarget(M, S, P);
  };
  function T(R, C) {
    const F = t.update(_);
    f.defines.VSM_SAMPLES !== R.blurSamples && (f.defines.VSM_SAMPLES = R.blurSamples, p.defines.VSM_SAMPLES = R.blurSamples, f.needsUpdate = !0, p.needsUpdate = !0), R.mapPass === null && (R.mapPass = new xi(r.x, r.y)), f.uniforms.shadow_pass.value = R.map.texture, f.uniforms.resolution.value = R.mapSize, f.uniforms.radius.value = R.radius, i.setRenderTarget(R.mapPass), i.clear(), i.renderBufferDirect(C, null, F, f, _, null), p.uniforms.shadow_pass.value = R.mapPass.texture, p.uniforms.resolution.value = R.mapSize, p.uniforms.radius.value = R.radius, i.setRenderTarget(R.map), i.clear(), i.renderBufferDirect(C, null, F, p, _, null);
  }
  function b(R, C, F, M) {
    let S = null;
    const P = F.isPointLight === !0 ? R.customDistanceMaterial : R.customDepthMaterial;
    if (P !== void 0)
      S = P;
    else if (S = F.isPointLight === !0 ? l : o, i.localClippingEnabled && C.clipShadows === !0 && Array.isArray(C.clippingPlanes) && C.clippingPlanes.length !== 0 || C.displacementMap && C.displacementScale !== 0 || C.alphaMap && C.alphaTest > 0 || C.map && C.alphaTest > 0 || C.alphaToCoverage === !0) {
      const V = S.uuid, X = C.uuid;
      let U = c[V];
      U === void 0 && (U = {}, c[V] = U);
      let k = U[X];
      k === void 0 && (k = S.clone(), U[X] = k, C.addEventListener("dispose", w)), S = k;
    }
    if (S.visible = C.visible, S.wireframe = C.wireframe, M === kn ? S.side = C.shadowSide !== null ? C.shadowSide : C.side : S.side = C.shadowSide !== null ? C.shadowSide : d[C.side], S.alphaMap = C.alphaMap, S.alphaTest = C.alphaToCoverage === !0 ? 0.5 : C.alphaTest, S.map = C.map, S.clipShadows = C.clipShadows, S.clippingPlanes = C.clippingPlanes, S.clipIntersection = C.clipIntersection, S.displacementMap = C.displacementMap, S.displacementScale = C.displacementScale, S.displacementBias = C.displacementBias, S.wireframeLinewidth = C.wireframeLinewidth, S.linewidth = C.linewidth, F.isPointLight === !0 && S.isMeshDistanceMaterial === !0) {
      const V = i.properties.get(S);
      V.light = F;
    }
    return S;
  }
  function y(R, C, F, M, S) {
    if (R.visible === !1) return;
    if (R.layers.test(C.layers) && (R.isMesh || R.isLine || R.isPoints) && (R.castShadow || R.receiveShadow && S === kn) && (!R.frustumCulled || n.intersectsObject(R))) {
      R.modelViewMatrix.multiplyMatrices(F.matrixWorldInverse, R.matrixWorld);
      const X = t.update(R), U = R.material;
      if (Array.isArray(U)) {
        const k = X.groups;
        for (let H = 0, B = k.length; H < B; H++) {
          const D = k[H], j = U[D.materialIndex];
          if (j && j.visible) {
            const at = b(R, j, M, S);
            R.onBeforeShadow(i, R, C, F, X, at, D), i.renderBufferDirect(F, null, X, at, R, D), R.onAfterShadow(i, R, C, F, X, at, D);
          }
        }
      } else if (U.visible) {
        const k = b(R, U, M, S);
        R.onBeforeShadow(i, R, C, F, X, k, null), i.renderBufferDirect(F, null, X, k, R, null), R.onAfterShadow(i, R, C, F, X, k, null);
      }
    }
    const V = R.children;
    for (let X = 0, U = V.length; X < U; X++)
      y(V[X], C, F, M, S);
  }
  function w(R) {
    R.target.removeEventListener("dispose", w);
    for (const F in c) {
      const M = c[F], S = R.target.uuid;
      S in M && (M[S].dispose(), delete M[S]);
    }
  }
}
const Mg = {
  [ra]: sa,
  [aa]: ca,
  [oa]: ha,
  [Yi]: la,
  [sa]: ra,
  [ca]: aa,
  [ha]: oa,
  [la]: Yi
};
function Sg(i, t) {
  function e() {
    let L = !1;
    const it = new ve();
    let st = null;
    const pt = new ve(0, 0, 0, 0);
    return {
      setMask: function(tt) {
        st !== tt && !L && (i.colorMask(tt, tt, tt, tt), st = tt);
      },
      setLocked: function(tt) {
        L = tt;
      },
      setClear: function(tt, Z, gt, Ft, se) {
        se === !0 && (tt *= Ft, Z *= Ft, gt *= Ft), it.set(tt, Z, gt, Ft), pt.equals(it) === !1 && (i.clearColor(tt, Z, gt, Ft), pt.copy(it));
      },
      reset: function() {
        L = !1, st = null, pt.set(-1, 0, 0, 0);
      }
    };
  }
  function n() {
    let L = !1, it = !1, st = null, pt = null, tt = null;
    return {
      setReversed: function(Z) {
        if (it !== Z) {
          const gt = t.get("EXT_clip_control");
          Z ? gt.clipControlEXT(gt.LOWER_LEFT_EXT, gt.ZERO_TO_ONE_EXT) : gt.clipControlEXT(gt.LOWER_LEFT_EXT, gt.NEGATIVE_ONE_TO_ONE_EXT), it = Z;
          const Ft = tt;
          tt = null, this.setClear(Ft);
        }
      },
      getReversed: function() {
        return it;
      },
      setTest: function(Z) {
        Z ? J(i.DEPTH_TEST) : ft(i.DEPTH_TEST);
      },
      setMask: function(Z) {
        st !== Z && !L && (i.depthMask(Z), st = Z);
      },
      setFunc: function(Z) {
        if (it && (Z = Mg[Z]), pt !== Z) {
          switch (Z) {
            case ra:
              i.depthFunc(i.NEVER);
              break;
            case sa:
              i.depthFunc(i.ALWAYS);
              break;
            case aa:
              i.depthFunc(i.LESS);
              break;
            case Yi:
              i.depthFunc(i.LEQUAL);
              break;
            case oa:
              i.depthFunc(i.EQUAL);
              break;
            case la:
              i.depthFunc(i.GEQUAL);
              break;
            case ca:
              i.depthFunc(i.GREATER);
              break;
            case ha:
              i.depthFunc(i.NOTEQUAL);
              break;
            default:
              i.depthFunc(i.LEQUAL);
          }
          pt = Z;
        }
      },
      setLocked: function(Z) {
        L = Z;
      },
      setClear: function(Z) {
        tt !== Z && (it && (Z = 1 - Z), i.clearDepth(Z), tt = Z);
      },
      reset: function() {
        L = !1, st = null, pt = null, tt = null, it = !1;
      }
    };
  }
  function r() {
    let L = !1, it = null, st = null, pt = null, tt = null, Z = null, gt = null, Ft = null, se = null;
    return {
      setTest: function(Zt) {
        L || (Zt ? J(i.STENCIL_TEST) : ft(i.STENCIL_TEST));
      },
      setMask: function(Zt) {
        it !== Zt && !L && (i.stencilMask(Zt), it = Zt);
      },
      setFunc: function(Zt, Ln, Sn) {
        (st !== Zt || pt !== Ln || tt !== Sn) && (i.stencilFunc(Zt, Ln, Sn), st = Zt, pt = Ln, tt = Sn);
      },
      setOp: function(Zt, Ln, Sn) {
        (Z !== Zt || gt !== Ln || Ft !== Sn) && (i.stencilOp(Zt, Ln, Sn), Z = Zt, gt = Ln, Ft = Sn);
      },
      setLocked: function(Zt) {
        L = Zt;
      },
      setClear: function(Zt) {
        se !== Zt && (i.clearStencil(Zt), se = Zt);
      },
      reset: function() {
        L = !1, it = null, st = null, pt = null, tt = null, Z = null, gt = null, Ft = null, se = null;
      }
    };
  }
  const s = new e(), a = new n(), o = new r(), l = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap();
  let h = {}, d = {}, f = /* @__PURE__ */ new WeakMap(), p = [], g = null, _ = !1, m = null, u = null, T = null, b = null, y = null, w = null, R = null, C = new Yt(0, 0, 0), F = 0, M = !1, S = null, P = null, V = null, X = null, U = null;
  const k = i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let H = !1, B = 0;
  const D = i.getParameter(i.VERSION);
  D.indexOf("WebGL") !== -1 ? (B = parseFloat(/^WebGL (\d)/.exec(D)[1]), H = B >= 1) : D.indexOf("OpenGL ES") !== -1 && (B = parseFloat(/^OpenGL ES (\d)/.exec(D)[1]), H = B >= 2);
  let j = null, at = {};
  const dt = i.getParameter(i.SCISSOR_BOX), Wt = i.getParameter(i.VIEWPORT), Qt = new ve().fromArray(dt), Xt = new ve().fromArray(Wt);
  function kt(L, it, st, pt) {
    const tt = new Uint8Array(4), Z = i.createTexture();
    i.bindTexture(L, Z), i.texParameteri(L, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(L, i.TEXTURE_MAG_FILTER, i.NEAREST);
    for (let gt = 0; gt < st; gt++)
      L === i.TEXTURE_3D || L === i.TEXTURE_2D_ARRAY ? i.texImage3D(it, 0, i.RGBA, 1, 1, pt, 0, i.RGBA, i.UNSIGNED_BYTE, tt) : i.texImage2D(it + gt, 0, i.RGBA, 1, 1, 0, i.RGBA, i.UNSIGNED_BYTE, tt);
    return Z;
  }
  const K = {};
  K[i.TEXTURE_2D] = kt(i.TEXTURE_2D, i.TEXTURE_2D, 1), K[i.TEXTURE_CUBE_MAP] = kt(i.TEXTURE_CUBE_MAP, i.TEXTURE_CUBE_MAP_POSITIVE_X, 6), K[i.TEXTURE_2D_ARRAY] = kt(i.TEXTURE_2D_ARRAY, i.TEXTURE_2D_ARRAY, 1, 1), K[i.TEXTURE_3D] = kt(i.TEXTURE_3D, i.TEXTURE_3D, 1, 1), s.setClear(0, 0, 0, 1), a.setClear(1), o.setClear(0), J(i.DEPTH_TEST), a.setFunc(Yi), Pt(!1), _t(Ao), J(i.CULL_FACE), he(Zn);
  function J(L) {
    h[L] !== !0 && (i.enable(L), h[L] = !0);
  }
  function ft(L) {
    h[L] !== !1 && (i.disable(L), h[L] = !1);
  }
  function Lt(L, it) {
    return d[L] !== it ? (i.bindFramebuffer(L, it), d[L] = it, L === i.DRAW_FRAMEBUFFER && (d[i.FRAMEBUFFER] = it), L === i.FRAMEBUFFER && (d[i.DRAW_FRAMEBUFFER] = it), !0) : !1;
  }
  function Et(L, it) {
    let st = p, pt = !1;
    if (L) {
      st = f.get(it), st === void 0 && (st = [], f.set(it, st));
      const tt = L.textures;
      if (st.length !== tt.length || st[0] !== i.COLOR_ATTACHMENT0) {
        for (let Z = 0, gt = tt.length; Z < gt; Z++)
          st[Z] = i.COLOR_ATTACHMENT0 + Z;
        st.length = tt.length, pt = !0;
      }
    } else
      st[0] !== i.BACK && (st[0] = i.BACK, pt = !0);
    pt && i.drawBuffers(st);
  }
  function qt(L) {
    return g !== L ? (i.useProgram(L), g = L, !0) : !1;
  }
  const Oe = {
    [ui]: i.FUNC_ADD,
    [sh]: i.FUNC_SUBTRACT,
    [ah]: i.FUNC_REVERSE_SUBTRACT
  };
  Oe[oh] = i.MIN, Oe[lh] = i.MAX;
  const A = {
    [ch]: i.ZERO,
    [hh]: i.ONE,
    [dh]: i.SRC_COLOR,
    [na]: i.SRC_ALPHA,
    [_h]: i.SRC_ALPHA_SATURATE,
    [mh]: i.DST_COLOR,
    [fh]: i.DST_ALPHA,
    [uh]: i.ONE_MINUS_SRC_COLOR,
    [ia]: i.ONE_MINUS_SRC_ALPHA,
    [gh]: i.ONE_MINUS_DST_COLOR,
    [ph]: i.ONE_MINUS_DST_ALPHA,
    [vh]: i.CONSTANT_COLOR,
    [xh]: i.ONE_MINUS_CONSTANT_COLOR,
    [Mh]: i.CONSTANT_ALPHA,
    [Sh]: i.ONE_MINUS_CONSTANT_ALPHA
  };
  function he(L, it, st, pt, tt, Z, gt, Ft, se, Zt) {
    if (L === Zn) {
      _ === !0 && (ft(i.BLEND), _ = !1);
      return;
    }
    if (_ === !1 && (J(i.BLEND), _ = !0), L !== rh) {
      if (L !== m || Zt !== M) {
        if ((u !== ui || y !== ui) && (i.blendEquation(i.FUNC_ADD), u = ui, y = ui), Zt)
          switch (L) {
            case Wi:
              i.blendFuncSeparate(i.ONE, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case Ro:
              i.blendFunc(i.ONE, i.ONE);
              break;
            case Co:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case Po:
              i.blendFuncSeparate(i.DST_COLOR, i.ONE_MINUS_SRC_ALPHA, i.ZERO, i.ONE);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", L);
              break;
          }
        else
          switch (L) {
            case Wi:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case Ro:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE, i.ONE, i.ONE);
              break;
            case Co:
              console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");
              break;
            case Po:
              console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", L);
              break;
          }
        T = null, b = null, w = null, R = null, C.set(0, 0, 0), F = 0, m = L, M = Zt;
      }
      return;
    }
    tt = tt || it, Z = Z || st, gt = gt || pt, (it !== u || tt !== y) && (i.blendEquationSeparate(Oe[it], Oe[tt]), u = it, y = tt), (st !== T || pt !== b || Z !== w || gt !== R) && (i.blendFuncSeparate(A[st], A[pt], A[Z], A[gt]), T = st, b = pt, w = Z, R = gt), (Ft.equals(C) === !1 || se !== F) && (i.blendColor(Ft.r, Ft.g, Ft.b, se), C.copy(Ft), F = se), m = L, M = !1;
  }
  function Ot(L, it) {
    L.side === ln ? ft(i.CULL_FACE) : J(i.CULL_FACE);
    let st = L.side === Ke;
    it && (st = !st), Pt(st), L.blending === Wi && L.transparent === !1 ? he(Zn) : he(L.blending, L.blendEquation, L.blendSrc, L.blendDst, L.blendEquationAlpha, L.blendSrcAlpha, L.blendDstAlpha, L.blendColor, L.blendAlpha, L.premultipliedAlpha), a.setFunc(L.depthFunc), a.setTest(L.depthTest), a.setMask(L.depthWrite), s.setMask(L.colorWrite);
    const pt = L.stencilWrite;
    o.setTest(pt), pt && (o.setMask(L.stencilWriteMask), o.setFunc(L.stencilFunc, L.stencilRef, L.stencilFuncMask), o.setOp(L.stencilFail, L.stencilZFail, L.stencilZPass)), vt(L.polygonOffset, L.polygonOffsetFactor, L.polygonOffsetUnits), L.alphaToCoverage === !0 ? J(i.SAMPLE_ALPHA_TO_COVERAGE) : ft(i.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function Pt(L) {
    S !== L && (L ? i.frontFace(i.CW) : i.frontFace(i.CCW), S = L);
  }
  function _t(L) {
    L !== eh ? (J(i.CULL_FACE), L !== P && (L === Ao ? i.cullFace(i.BACK) : L === nh ? i.cullFace(i.FRONT) : i.cullFace(i.FRONT_AND_BACK))) : ft(i.CULL_FACE), P = L;
  }
  function de(L) {
    L !== V && (H && i.lineWidth(L), V = L);
  }
  function vt(L, it, st) {
    L ? (J(i.POLYGON_OFFSET_FILL), (X !== it || U !== st) && (i.polygonOffset(it, st), X = it, U = st)) : ft(i.POLYGON_OFFSET_FILL);
  }
  function Ht(L) {
    L ? J(i.SCISSOR_TEST) : ft(i.SCISSOR_TEST);
  }
  function Ce(L) {
    L === void 0 && (L = i.TEXTURE0 + k - 1), j !== L && (i.activeTexture(L), j = L);
  }
  function xe(L, it, st) {
    st === void 0 && (j === null ? st = i.TEXTURE0 + k - 1 : st = j);
    let pt = at[st];
    pt === void 0 && (pt = { type: void 0, texture: void 0 }, at[st] = pt), (pt.type !== L || pt.texture !== it) && (j !== st && (i.activeTexture(st), j = st), i.bindTexture(L, it || K[L]), pt.type = L, pt.texture = it);
  }
  function E() {
    const L = at[j];
    L !== void 0 && L.type !== void 0 && (i.bindTexture(L.type, null), L.type = void 0, L.texture = void 0);
  }
  function v() {
    try {
      i.compressedTexImage2D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function z() {
    try {
      i.compressedTexImage3D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function Y() {
    try {
      i.texSubImage2D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function Q() {
    try {
      i.texSubImage3D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function q() {
    try {
      i.compressedTexSubImage2D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function yt() {
    try {
      i.compressedTexSubImage3D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function rt() {
    try {
      i.texStorage2D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function xt() {
    try {
      i.texStorage3D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function Mt() {
    try {
      i.texImage2D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function nt() {
    try {
      i.texImage3D(...arguments);
    } catch (L) {
      console.error("THREE.WebGLState:", L);
    }
  }
  function ht(L) {
    Qt.equals(L) === !1 && (i.scissor(L.x, L.y, L.z, L.w), Qt.copy(L));
  }
  function Rt(L) {
    Xt.equals(L) === !1 && (i.viewport(L.x, L.y, L.z, L.w), Xt.copy(L));
  }
  function St(L, it) {
    let st = c.get(it);
    st === void 0 && (st = /* @__PURE__ */ new WeakMap(), c.set(it, st));
    let pt = st.get(L);
    pt === void 0 && (pt = i.getUniformBlockIndex(it, L.name), st.set(L, pt));
  }
  function lt(L, it) {
    const pt = c.get(it).get(L);
    l.get(it) !== pt && (i.uniformBlockBinding(it, pt, L.__bindingPointIndex), l.set(it, pt));
  }
  function Bt() {
    i.disable(i.BLEND), i.disable(i.CULL_FACE), i.disable(i.DEPTH_TEST), i.disable(i.POLYGON_OFFSET_FILL), i.disable(i.SCISSOR_TEST), i.disable(i.STENCIL_TEST), i.disable(i.SAMPLE_ALPHA_TO_COVERAGE), i.blendEquation(i.FUNC_ADD), i.blendFunc(i.ONE, i.ZERO), i.blendFuncSeparate(i.ONE, i.ZERO, i.ONE, i.ZERO), i.blendColor(0, 0, 0, 0), i.colorMask(!0, !0, !0, !0), i.clearColor(0, 0, 0, 0), i.depthMask(!0), i.depthFunc(i.LESS), a.setReversed(!1), i.clearDepth(1), i.stencilMask(4294967295), i.stencilFunc(i.ALWAYS, 0, 4294967295), i.stencilOp(i.KEEP, i.KEEP, i.KEEP), i.clearStencil(0), i.cullFace(i.BACK), i.frontFace(i.CCW), i.polygonOffset(0, 0), i.activeTexture(i.TEXTURE0), i.bindFramebuffer(i.FRAMEBUFFER, null), i.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), i.bindFramebuffer(i.READ_FRAMEBUFFER, null), i.useProgram(null), i.lineWidth(1), i.scissor(0, 0, i.canvas.width, i.canvas.height), i.viewport(0, 0, i.canvas.width, i.canvas.height), h = {}, j = null, at = {}, d = {}, f = /* @__PURE__ */ new WeakMap(), p = [], g = null, _ = !1, m = null, u = null, T = null, b = null, y = null, w = null, R = null, C = new Yt(0, 0, 0), F = 0, M = !1, S = null, P = null, V = null, X = null, U = null, Qt.set(0, 0, i.canvas.width, i.canvas.height), Xt.set(0, 0, i.canvas.width, i.canvas.height), s.reset(), a.reset(), o.reset();
  }
  return {
    buffers: {
      color: s,
      depth: a,
      stencil: o
    },
    enable: J,
    disable: ft,
    bindFramebuffer: Lt,
    drawBuffers: Et,
    useProgram: qt,
    setBlending: he,
    setMaterial: Ot,
    setFlipSided: Pt,
    setCullFace: _t,
    setLineWidth: de,
    setPolygonOffset: vt,
    setScissorTest: Ht,
    activeTexture: Ce,
    bindTexture: xe,
    unbindTexture: E,
    compressedTexImage2D: v,
    compressedTexImage3D: z,
    texImage2D: Mt,
    texImage3D: nt,
    updateUBOMapping: St,
    uniformBlockBinding: lt,
    texStorage2D: rt,
    texStorage3D: xt,
    texSubImage2D: Y,
    texSubImage3D: Q,
    compressedTexSubImage2D: q,
    compressedTexSubImage3D: yt,
    scissor: ht,
    viewport: Rt,
    reset: Bt
  };
}
function yg(i, t, e, n, r, s, a) {
  const o = t.has("WEBGL_multisampled_render_to_texture") ? t.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), c = new It(), h = /* @__PURE__ */ new WeakMap();
  let d;
  const f = /* @__PURE__ */ new WeakMap();
  let p = !1;
  try {
    p = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
  }
  function g(E, v) {
    return p ? (
      // eslint-disable-next-line compat/compat
      new OffscreenCanvas(E, v)
    ) : ls("canvas");
  }
  function _(E, v, z) {
    let Y = 1;
    const Q = xe(E);
    if ((Q.width > z || Q.height > z) && (Y = z / Math.max(Q.width, Q.height)), Y < 1)
      if (typeof HTMLImageElement < "u" && E instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && E instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && E instanceof ImageBitmap || typeof VideoFrame < "u" && E instanceof VideoFrame) {
        const q = Math.floor(Y * Q.width), yt = Math.floor(Y * Q.height);
        d === void 0 && (d = g(q, yt));
        const rt = v ? g(q, yt) : d;
        return rt.width = q, rt.height = yt, rt.getContext("2d").drawImage(E, 0, 0, q, yt), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + Q.width + "x" + Q.height + ") to (" + q + "x" + yt + ")."), rt;
      } else
        return "data" in E && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + Q.width + "x" + Q.height + ")."), E;
    return E;
  }
  function m(E) {
    return E.generateMipmaps;
  }
  function u(E) {
    i.generateMipmap(E);
  }
  function T(E) {
    return E.isWebGLCubeRenderTarget ? i.TEXTURE_CUBE_MAP : E.isWebGL3DRenderTarget ? i.TEXTURE_3D : E.isWebGLArrayRenderTarget || E.isCompressedArrayTexture ? i.TEXTURE_2D_ARRAY : i.TEXTURE_2D;
  }
  function b(E, v, z, Y, Q = !1) {
    if (E !== null) {
      if (i[E] !== void 0) return i[E];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + E + "'");
    }
    let q = v;
    if (v === i.RED && (z === i.FLOAT && (q = i.R32F), z === i.HALF_FLOAT && (q = i.R16F), z === i.UNSIGNED_BYTE && (q = i.R8)), v === i.RED_INTEGER && (z === i.UNSIGNED_BYTE && (q = i.R8UI), z === i.UNSIGNED_SHORT && (q = i.R16UI), z === i.UNSIGNED_INT && (q = i.R32UI), z === i.BYTE && (q = i.R8I), z === i.SHORT && (q = i.R16I), z === i.INT && (q = i.R32I)), v === i.RG && (z === i.FLOAT && (q = i.RG32F), z === i.HALF_FLOAT && (q = i.RG16F), z === i.UNSIGNED_BYTE && (q = i.RG8)), v === i.RG_INTEGER && (z === i.UNSIGNED_BYTE && (q = i.RG8UI), z === i.UNSIGNED_SHORT && (q = i.RG16UI), z === i.UNSIGNED_INT && (q = i.RG32UI), z === i.BYTE && (q = i.RG8I), z === i.SHORT && (q = i.RG16I), z === i.INT && (q = i.RG32I)), v === i.RGB_INTEGER && (z === i.UNSIGNED_BYTE && (q = i.RGB8UI), z === i.UNSIGNED_SHORT && (q = i.RGB16UI), z === i.UNSIGNED_INT && (q = i.RGB32UI), z === i.BYTE && (q = i.RGB8I), z === i.SHORT && (q = i.RGB16I), z === i.INT && (q = i.RGB32I)), v === i.RGBA_INTEGER && (z === i.UNSIGNED_BYTE && (q = i.RGBA8UI), z === i.UNSIGNED_SHORT && (q = i.RGBA16UI), z === i.UNSIGNED_INT && (q = i.RGBA32UI), z === i.BYTE && (q = i.RGBA8I), z === i.SHORT && (q = i.RGBA16I), z === i.INT && (q = i.RGBA32I)), v === i.RGB && (z === i.UNSIGNED_INT_5_9_9_9_REV && (q = i.RGB9_E5), z === i.UNSIGNED_INT_10F_11F_11F_REV && (q = i.R11F_G11F_B10F)), v === i.RGBA) {
      const yt = Q ? as : Kt.getTransfer(Y);
      z === i.FLOAT && (q = i.RGBA32F), z === i.HALF_FLOAT && (q = i.RGBA16F), z === i.UNSIGNED_BYTE && (q = yt === ee ? i.SRGB8_ALPHA8 : i.RGBA8), z === i.UNSIGNED_SHORT_4_4_4_4 && (q = i.RGBA4), z === i.UNSIGNED_SHORT_5_5_5_1 && (q = i.RGB5_A1);
    }
    return (q === i.R16F || q === i.R32F || q === i.RG16F || q === i.RG32F || q === i.RGBA16F || q === i.RGBA32F) && t.get("EXT_color_buffer_float"), q;
  }
  function y(E, v) {
    let z;
    return E ? v === null || v === _i || v === _r ? z = i.DEPTH24_STENCIL8 : v === zn ? z = i.DEPTH32F_STENCIL8 : v === gr && (z = i.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : v === null || v === _i || v === _r ? z = i.DEPTH_COMPONENT24 : v === zn ? z = i.DEPTH_COMPONENT32F : v === gr && (z = i.DEPTH_COMPONENT16), z;
  }
  function w(E, v) {
    return m(E) === !0 || E.isFramebufferTexture && E.minFilter !== vn && E.minFilter !== bn ? Math.log2(Math.max(v.width, v.height)) + 1 : E.mipmaps !== void 0 && E.mipmaps.length > 0 ? E.mipmaps.length : E.isCompressedTexture && Array.isArray(E.image) ? v.mipmaps.length : 1;
  }
  function R(E) {
    const v = E.target;
    v.removeEventListener("dispose", R), F(v), v.isVideoTexture && h.delete(v);
  }
  function C(E) {
    const v = E.target;
    v.removeEventListener("dispose", C), S(v);
  }
  function F(E) {
    const v = n.get(E);
    if (v.__webglInit === void 0) return;
    const z = E.source, Y = f.get(z);
    if (Y) {
      const Q = Y[v.__cacheKey];
      Q.usedTimes--, Q.usedTimes === 0 && M(E), Object.keys(Y).length === 0 && f.delete(z);
    }
    n.remove(E);
  }
  function M(E) {
    const v = n.get(E);
    i.deleteTexture(v.__webglTexture);
    const z = E.source, Y = f.get(z);
    delete Y[v.__cacheKey], a.memory.textures--;
  }
  function S(E) {
    const v = n.get(E);
    if (E.depthTexture && (E.depthTexture.dispose(), n.remove(E.depthTexture)), E.isWebGLCubeRenderTarget)
      for (let Y = 0; Y < 6; Y++) {
        if (Array.isArray(v.__webglFramebuffer[Y]))
          for (let Q = 0; Q < v.__webglFramebuffer[Y].length; Q++) i.deleteFramebuffer(v.__webglFramebuffer[Y][Q]);
        else
          i.deleteFramebuffer(v.__webglFramebuffer[Y]);
        v.__webglDepthbuffer && i.deleteRenderbuffer(v.__webglDepthbuffer[Y]);
      }
    else {
      if (Array.isArray(v.__webglFramebuffer))
        for (let Y = 0; Y < v.__webglFramebuffer.length; Y++) i.deleteFramebuffer(v.__webglFramebuffer[Y]);
      else
        i.deleteFramebuffer(v.__webglFramebuffer);
      if (v.__webglDepthbuffer && i.deleteRenderbuffer(v.__webglDepthbuffer), v.__webglMultisampledFramebuffer && i.deleteFramebuffer(v.__webglMultisampledFramebuffer), v.__webglColorRenderbuffer)
        for (let Y = 0; Y < v.__webglColorRenderbuffer.length; Y++)
          v.__webglColorRenderbuffer[Y] && i.deleteRenderbuffer(v.__webglColorRenderbuffer[Y]);
      v.__webglDepthRenderbuffer && i.deleteRenderbuffer(v.__webglDepthRenderbuffer);
    }
    const z = E.textures;
    for (let Y = 0, Q = z.length; Y < Q; Y++) {
      const q = n.get(z[Y]);
      q.__webglTexture && (i.deleteTexture(q.__webglTexture), a.memory.textures--), n.remove(z[Y]);
    }
    n.remove(E);
  }
  let P = 0;
  function V() {
    P = 0;
  }
  function X() {
    const E = P;
    return E >= r.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + E + " texture units while this GPU supports only " + r.maxTextures), P += 1, E;
  }
  function U(E) {
    const v = [];
    return v.push(E.wrapS), v.push(E.wrapT), v.push(E.wrapR || 0), v.push(E.magFilter), v.push(E.minFilter), v.push(E.anisotropy), v.push(E.internalFormat), v.push(E.format), v.push(E.type), v.push(E.generateMipmaps), v.push(E.premultiplyAlpha), v.push(E.flipY), v.push(E.unpackAlignment), v.push(E.colorSpace), v.join();
  }
  function k(E, v) {
    const z = n.get(E);
    if (E.isVideoTexture && Ht(E), E.isRenderTargetTexture === !1 && E.isExternalTexture !== !0 && E.version > 0 && z.__version !== E.version) {
      const Y = E.image;
      if (Y === null)
        console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if (Y.complete === !1)
        console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        K(z, E, v);
        return;
      }
    } else E.isExternalTexture && (z.__webglTexture = E.sourceTexture ? E.sourceTexture : null);
    e.bindTexture(i.TEXTURE_2D, z.__webglTexture, i.TEXTURE0 + v);
  }
  function H(E, v) {
    const z = n.get(E);
    if (E.isRenderTargetTexture === !1 && E.version > 0 && z.__version !== E.version) {
      K(z, E, v);
      return;
    }
    e.bindTexture(i.TEXTURE_2D_ARRAY, z.__webglTexture, i.TEXTURE0 + v);
  }
  function B(E, v) {
    const z = n.get(E);
    if (E.isRenderTargetTexture === !1 && E.version > 0 && z.__version !== E.version) {
      K(z, E, v);
      return;
    }
    e.bindTexture(i.TEXTURE_3D, z.__webglTexture, i.TEXTURE0 + v);
  }
  function D(E, v) {
    const z = n.get(E);
    if (E.version > 0 && z.__version !== E.version) {
      J(z, E, v);
      return;
    }
    e.bindTexture(i.TEXTURE_CUBE_MAP, z.__webglTexture, i.TEXTURE0 + v);
  }
  const j = {
    [fa]: i.REPEAT,
    [pi]: i.CLAMP_TO_EDGE,
    [pa]: i.MIRRORED_REPEAT
  }, at = {
    [vn]: i.NEAREST,
    [Dh]: i.NEAREST_MIPMAP_NEAREST,
    [Rr]: i.NEAREST_MIPMAP_LINEAR,
    [bn]: i.LINEAR,
    [Ms]: i.LINEAR_MIPMAP_NEAREST,
    [mi]: i.LINEAR_MIPMAP_LINEAR
  }, dt = {
    [Nh]: i.NEVER,
    [Hh]: i.ALWAYS,
    [Fh]: i.LESS,
    [nc]: i.LEQUAL,
    [Oh]: i.EQUAL,
    [zh]: i.GEQUAL,
    [kh]: i.GREATER,
    [Bh]: i.NOTEQUAL
  };
  function Wt(E, v) {
    if (v.type === zn && t.has("OES_texture_float_linear") === !1 && (v.magFilter === bn || v.magFilter === Ms || v.magFilter === Rr || v.magFilter === mi || v.minFilter === bn || v.minFilter === Ms || v.minFilter === Rr || v.minFilter === mi) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), i.texParameteri(E, i.TEXTURE_WRAP_S, j[v.wrapS]), i.texParameteri(E, i.TEXTURE_WRAP_T, j[v.wrapT]), (E === i.TEXTURE_3D || E === i.TEXTURE_2D_ARRAY) && i.texParameteri(E, i.TEXTURE_WRAP_R, j[v.wrapR]), i.texParameteri(E, i.TEXTURE_MAG_FILTER, at[v.magFilter]), i.texParameteri(E, i.TEXTURE_MIN_FILTER, at[v.minFilter]), v.compareFunction && (i.texParameteri(E, i.TEXTURE_COMPARE_MODE, i.COMPARE_REF_TO_TEXTURE), i.texParameteri(E, i.TEXTURE_COMPARE_FUNC, dt[v.compareFunction])), t.has("EXT_texture_filter_anisotropic") === !0) {
      if (v.magFilter === vn || v.minFilter !== Rr && v.minFilter !== mi || v.type === zn && t.has("OES_texture_float_linear") === !1) return;
      if (v.anisotropy > 1 || n.get(v).__currentAnisotropy) {
        const z = t.get("EXT_texture_filter_anisotropic");
        i.texParameterf(E, z.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(v.anisotropy, r.getMaxAnisotropy())), n.get(v).__currentAnisotropy = v.anisotropy;
      }
    }
  }
  function Qt(E, v) {
    let z = !1;
    E.__webglInit === void 0 && (E.__webglInit = !0, v.addEventListener("dispose", R));
    const Y = v.source;
    let Q = f.get(Y);
    Q === void 0 && (Q = {}, f.set(Y, Q));
    const q = U(v);
    if (q !== E.__cacheKey) {
      Q[q] === void 0 && (Q[q] = {
        texture: i.createTexture(),
        usedTimes: 0
      }, a.memory.textures++, z = !0), Q[q].usedTimes++;
      const yt = Q[E.__cacheKey];
      yt !== void 0 && (Q[E.__cacheKey].usedTimes--, yt.usedTimes === 0 && M(v)), E.__cacheKey = q, E.__webglTexture = Q[q].texture;
    }
    return z;
  }
  function Xt(E, v, z) {
    return Math.floor(Math.floor(E / z) / v);
  }
  function kt(E, v, z, Y) {
    const q = E.updateRanges;
    if (q.length === 0)
      e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, v.width, v.height, z, Y, v.data);
    else {
      q.sort((nt, ht) => nt.start - ht.start);
      let yt = 0;
      for (let nt = 1; nt < q.length; nt++) {
        const ht = q[yt], Rt = q[nt], St = ht.start + ht.count, lt = Xt(Rt.start, v.width, 4), Bt = Xt(ht.start, v.width, 4);
        Rt.start <= St + 1 && lt === Bt && Xt(Rt.start + Rt.count - 1, v.width, 4) === lt ? ht.count = Math.max(
          ht.count,
          Rt.start + Rt.count - ht.start
        ) : (++yt, q[yt] = Rt);
      }
      q.length = yt + 1;
      const rt = i.getParameter(i.UNPACK_ROW_LENGTH), xt = i.getParameter(i.UNPACK_SKIP_PIXELS), Mt = i.getParameter(i.UNPACK_SKIP_ROWS);
      i.pixelStorei(i.UNPACK_ROW_LENGTH, v.width);
      for (let nt = 0, ht = q.length; nt < ht; nt++) {
        const Rt = q[nt], St = Math.floor(Rt.start / 4), lt = Math.ceil(Rt.count / 4), Bt = St % v.width, L = Math.floor(St / v.width), it = lt, st = 1;
        i.pixelStorei(i.UNPACK_SKIP_PIXELS, Bt), i.pixelStorei(i.UNPACK_SKIP_ROWS, L), e.texSubImage2D(i.TEXTURE_2D, 0, Bt, L, it, st, z, Y, v.data);
      }
      E.clearUpdateRanges(), i.pixelStorei(i.UNPACK_ROW_LENGTH, rt), i.pixelStorei(i.UNPACK_SKIP_PIXELS, xt), i.pixelStorei(i.UNPACK_SKIP_ROWS, Mt);
    }
  }
  function K(E, v, z) {
    let Y = i.TEXTURE_2D;
    (v.isDataArrayTexture || v.isCompressedArrayTexture) && (Y = i.TEXTURE_2D_ARRAY), v.isData3DTexture && (Y = i.TEXTURE_3D);
    const Q = Qt(E, v), q = v.source;
    e.bindTexture(Y, E.__webglTexture, i.TEXTURE0 + z);
    const yt = n.get(q);
    if (q.version !== yt.__version || Q === !0) {
      e.activeTexture(i.TEXTURE0 + z);
      const rt = Kt.getPrimaries(Kt.workingColorSpace), xt = v.colorSpace === Kn ? null : Kt.getPrimaries(v.colorSpace), Mt = v.colorSpace === Kn || rt === xt ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, v.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, v.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, v.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, Mt);
      let nt = _(v.image, !1, r.maxTextureSize);
      nt = Ce(v, nt);
      const ht = s.convert(v.format, v.colorSpace), Rt = s.convert(v.type);
      let St = b(v.internalFormat, ht, Rt, v.colorSpace, v.isVideoTexture);
      Wt(Y, v);
      let lt;
      const Bt = v.mipmaps, L = v.isVideoTexture !== !0, it = yt.__version === void 0 || Q === !0, st = q.dataReady, pt = w(v, nt);
      if (v.isDepthTexture)
        St = y(v.format === xr, v.type), it && (L ? e.texStorage2D(i.TEXTURE_2D, 1, St, nt.width, nt.height) : e.texImage2D(i.TEXTURE_2D, 0, St, nt.width, nt.height, 0, ht, Rt, null));
      else if (v.isDataTexture)
        if (Bt.length > 0) {
          L && it && e.texStorage2D(i.TEXTURE_2D, pt, St, Bt[0].width, Bt[0].height);
          for (let tt = 0, Z = Bt.length; tt < Z; tt++)
            lt = Bt[tt], L ? st && e.texSubImage2D(i.TEXTURE_2D, tt, 0, 0, lt.width, lt.height, ht, Rt, lt.data) : e.texImage2D(i.TEXTURE_2D, tt, St, lt.width, lt.height, 0, ht, Rt, lt.data);
          v.generateMipmaps = !1;
        } else
          L ? (it && e.texStorage2D(i.TEXTURE_2D, pt, St, nt.width, nt.height), st && kt(v, nt, ht, Rt)) : e.texImage2D(i.TEXTURE_2D, 0, St, nt.width, nt.height, 0, ht, Rt, nt.data);
      else if (v.isCompressedTexture)
        if (v.isCompressedArrayTexture) {
          L && it && e.texStorage3D(i.TEXTURE_2D_ARRAY, pt, St, Bt[0].width, Bt[0].height, nt.depth);
          for (let tt = 0, Z = Bt.length; tt < Z; tt++)
            if (lt = Bt[tt], v.format !== _n)
              if (ht !== null)
                if (L) {
                  if (st)
                    if (v.layerUpdates.size > 0) {
                      const gt = ol(lt.width, lt.height, v.format, v.type);
                      for (const Ft of v.layerUpdates) {
                        const se = lt.data.subarray(
                          Ft * gt / lt.data.BYTES_PER_ELEMENT,
                          (Ft + 1) * gt / lt.data.BYTES_PER_ELEMENT
                        );
                        e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, tt, 0, 0, Ft, lt.width, lt.height, 1, ht, se);
                      }
                      v.clearLayerUpdates();
                    } else
                      e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, tt, 0, 0, 0, lt.width, lt.height, nt.depth, ht, lt.data);
                } else
                  e.compressedTexImage3D(i.TEXTURE_2D_ARRAY, tt, St, lt.width, lt.height, nt.depth, 0, lt.data, 0, 0);
              else
                console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
            else
              L ? st && e.texSubImage3D(i.TEXTURE_2D_ARRAY, tt, 0, 0, 0, lt.width, lt.height, nt.depth, ht, Rt, lt.data) : e.texImage3D(i.TEXTURE_2D_ARRAY, tt, St, lt.width, lt.height, nt.depth, 0, ht, Rt, lt.data);
        } else {
          L && it && e.texStorage2D(i.TEXTURE_2D, pt, St, Bt[0].width, Bt[0].height);
          for (let tt = 0, Z = Bt.length; tt < Z; tt++)
            lt = Bt[tt], v.format !== _n ? ht !== null ? L ? st && e.compressedTexSubImage2D(i.TEXTURE_2D, tt, 0, 0, lt.width, lt.height, ht, lt.data) : e.compressedTexImage2D(i.TEXTURE_2D, tt, St, lt.width, lt.height, 0, lt.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : L ? st && e.texSubImage2D(i.TEXTURE_2D, tt, 0, 0, lt.width, lt.height, ht, Rt, lt.data) : e.texImage2D(i.TEXTURE_2D, tt, St, lt.width, lt.height, 0, ht, Rt, lt.data);
        }
      else if (v.isDataArrayTexture)
        if (L) {
          if (it && e.texStorage3D(i.TEXTURE_2D_ARRAY, pt, St, nt.width, nt.height, nt.depth), st)
            if (v.layerUpdates.size > 0) {
              const tt = ol(nt.width, nt.height, v.format, v.type);
              for (const Z of v.layerUpdates) {
                const gt = nt.data.subarray(
                  Z * tt / nt.data.BYTES_PER_ELEMENT,
                  (Z + 1) * tt / nt.data.BYTES_PER_ELEMENT
                );
                e.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, Z, nt.width, nt.height, 1, ht, Rt, gt);
              }
              v.clearLayerUpdates();
            } else
              e.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, 0, nt.width, nt.height, nt.depth, ht, Rt, nt.data);
        } else
          e.texImage3D(i.TEXTURE_2D_ARRAY, 0, St, nt.width, nt.height, nt.depth, 0, ht, Rt, nt.data);
      else if (v.isData3DTexture)
        L ? (it && e.texStorage3D(i.TEXTURE_3D, pt, St, nt.width, nt.height, nt.depth), st && e.texSubImage3D(i.TEXTURE_3D, 0, 0, 0, 0, nt.width, nt.height, nt.depth, ht, Rt, nt.data)) : e.texImage3D(i.TEXTURE_3D, 0, St, nt.width, nt.height, nt.depth, 0, ht, Rt, nt.data);
      else if (v.isFramebufferTexture) {
        if (it)
          if (L)
            e.texStorage2D(i.TEXTURE_2D, pt, St, nt.width, nt.height);
          else {
            let tt = nt.width, Z = nt.height;
            for (let gt = 0; gt < pt; gt++)
              e.texImage2D(i.TEXTURE_2D, gt, St, tt, Z, 0, ht, Rt, null), tt >>= 1, Z >>= 1;
          }
      } else if (Bt.length > 0) {
        if (L && it) {
          const tt = xe(Bt[0]);
          e.texStorage2D(i.TEXTURE_2D, pt, St, tt.width, tt.height);
        }
        for (let tt = 0, Z = Bt.length; tt < Z; tt++)
          lt = Bt[tt], L ? st && e.texSubImage2D(i.TEXTURE_2D, tt, 0, 0, ht, Rt, lt) : e.texImage2D(i.TEXTURE_2D, tt, St, ht, Rt, lt);
        v.generateMipmaps = !1;
      } else if (L) {
        if (it) {
          const tt = xe(nt);
          e.texStorage2D(i.TEXTURE_2D, pt, St, tt.width, tt.height);
        }
        st && e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, ht, Rt, nt);
      } else
        e.texImage2D(i.TEXTURE_2D, 0, St, ht, Rt, nt);
      m(v) && u(Y), yt.__version = q.version, v.onUpdate && v.onUpdate(v);
    }
    E.__version = v.version;
  }
  function J(E, v, z) {
    if (v.image.length !== 6) return;
    const Y = Qt(E, v), Q = v.source;
    e.bindTexture(i.TEXTURE_CUBE_MAP, E.__webglTexture, i.TEXTURE0 + z);
    const q = n.get(Q);
    if (Q.version !== q.__version || Y === !0) {
      e.activeTexture(i.TEXTURE0 + z);
      const yt = Kt.getPrimaries(Kt.workingColorSpace), rt = v.colorSpace === Kn ? null : Kt.getPrimaries(v.colorSpace), xt = v.colorSpace === Kn || yt === rt ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, v.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, v.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, v.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, xt);
      const Mt = v.isCompressedTexture || v.image[0].isCompressedTexture, nt = v.image[0] && v.image[0].isDataTexture, ht = [];
      for (let Z = 0; Z < 6; Z++)
        !Mt && !nt ? ht[Z] = _(v.image[Z], !0, r.maxCubemapSize) : ht[Z] = nt ? v.image[Z].image : v.image[Z], ht[Z] = Ce(v, ht[Z]);
      const Rt = ht[0], St = s.convert(v.format, v.colorSpace), lt = s.convert(v.type), Bt = b(v.internalFormat, St, lt, v.colorSpace), L = v.isVideoTexture !== !0, it = q.__version === void 0 || Y === !0, st = Q.dataReady;
      let pt = w(v, Rt);
      Wt(i.TEXTURE_CUBE_MAP, v);
      let tt;
      if (Mt) {
        L && it && e.texStorage2D(i.TEXTURE_CUBE_MAP, pt, Bt, Rt.width, Rt.height);
        for (let Z = 0; Z < 6; Z++) {
          tt = ht[Z].mipmaps;
          for (let gt = 0; gt < tt.length; gt++) {
            const Ft = tt[gt];
            v.format !== _n ? St !== null ? L ? st && e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Z, gt, 0, 0, Ft.width, Ft.height, St, Ft.data) : e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Z, gt, Bt, Ft.width, Ft.height, 0, Ft.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : L ? st && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Z, gt, 0, 0, Ft.width, Ft.height, St, lt, Ft.data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Z, gt, Bt, Ft.width, Ft.height, 0, St, lt, Ft.data);
          }
        }
      } else {
        if (tt = v.mipmaps, L && it) {
          tt.length > 0 && pt++;
          const Z = xe(ht[0]);
          e.texStorage2D(i.TEXTURE_CUBE_MAP, pt, Bt, Z.width, Z.height);
        }
        for (let Z = 0; Z < 6; Z++)
          if (nt) {
            L ? st && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Z, 0, 0, 0, ht[Z].width, ht[Z].height, St, lt, ht[Z].data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Z, 0, Bt, ht[Z].width, ht[Z].height, 0, St, lt, ht[Z].data);
            for (let gt = 0; gt < tt.length; gt++) {
              const se = tt[gt].image[Z].image;
              L ? st && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Z, gt + 1, 0, 0, se.width, se.height, St, lt, se.data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Z, gt + 1, Bt, se.width, se.height, 0, St, lt, se.data);
            }
          } else {
            L ? st && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Z, 0, 0, 0, St, lt, ht[Z]) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Z, 0, Bt, St, lt, ht[Z]);
            for (let gt = 0; gt < tt.length; gt++) {
              const Ft = tt[gt];
              L ? st && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Z, gt + 1, 0, 0, St, lt, Ft.image[Z]) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + Z, gt + 1, Bt, St, lt, Ft.image[Z]);
            }
          }
      }
      m(v) && u(i.TEXTURE_CUBE_MAP), q.__version = Q.version, v.onUpdate && v.onUpdate(v);
    }
    E.__version = v.version;
  }
  function ft(E, v, z, Y, Q, q) {
    const yt = s.convert(z.format, z.colorSpace), rt = s.convert(z.type), xt = b(z.internalFormat, yt, rt, z.colorSpace), Mt = n.get(v), nt = n.get(z);
    if (nt.__renderTarget = v, !Mt.__hasExternalTextures) {
      const ht = Math.max(1, v.width >> q), Rt = Math.max(1, v.height >> q);
      Q === i.TEXTURE_3D || Q === i.TEXTURE_2D_ARRAY ? e.texImage3D(Q, q, xt, ht, Rt, v.depth, 0, yt, rt, null) : e.texImage2D(Q, q, xt, ht, Rt, 0, yt, rt, null);
    }
    e.bindFramebuffer(i.FRAMEBUFFER, E), vt(v) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, Y, Q, nt.__webglTexture, 0, de(v)) : (Q === i.TEXTURE_2D || Q >= i.TEXTURE_CUBE_MAP_POSITIVE_X && Q <= i.TEXTURE_CUBE_MAP_NEGATIVE_Z) && i.framebufferTexture2D(i.FRAMEBUFFER, Y, Q, nt.__webglTexture, q), e.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function Lt(E, v, z) {
    if (i.bindRenderbuffer(i.RENDERBUFFER, E), v.depthBuffer) {
      const Y = v.depthTexture, Q = Y && Y.isDepthTexture ? Y.type : null, q = y(v.stencilBuffer, Q), yt = v.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, rt = de(v);
      vt(v) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, rt, q, v.width, v.height) : z ? i.renderbufferStorageMultisample(i.RENDERBUFFER, rt, q, v.width, v.height) : i.renderbufferStorage(i.RENDERBUFFER, q, v.width, v.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, yt, i.RENDERBUFFER, E);
    } else {
      const Y = v.textures;
      for (let Q = 0; Q < Y.length; Q++) {
        const q = Y[Q], yt = s.convert(q.format, q.colorSpace), rt = s.convert(q.type), xt = b(q.internalFormat, yt, rt, q.colorSpace), Mt = de(v);
        z && vt(v) === !1 ? i.renderbufferStorageMultisample(i.RENDERBUFFER, Mt, xt, v.width, v.height) : vt(v) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, Mt, xt, v.width, v.height) : i.renderbufferStorage(i.RENDERBUFFER, xt, v.width, v.height);
      }
    }
    i.bindRenderbuffer(i.RENDERBUFFER, null);
  }
  function Et(E, v) {
    if (v && v.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (e.bindFramebuffer(i.FRAMEBUFFER, E), !(v.depthTexture && v.depthTexture.isDepthTexture))
      throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    const Y = n.get(v.depthTexture);
    Y.__renderTarget = v, (!Y.__webglTexture || v.depthTexture.image.width !== v.width || v.depthTexture.image.height !== v.height) && (v.depthTexture.image.width = v.width, v.depthTexture.image.height = v.height, v.depthTexture.needsUpdate = !0), k(v.depthTexture, 0);
    const Q = Y.__webglTexture, q = de(v);
    if (v.depthTexture.format === vr)
      vt(v) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, Q, 0, q) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, Q, 0);
    else if (v.depthTexture.format === xr)
      vt(v) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, Q, 0, q) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, Q, 0);
    else
      throw new Error("Unknown depthTexture format");
  }
  function qt(E) {
    const v = n.get(E), z = E.isWebGLCubeRenderTarget === !0;
    if (v.__boundDepthTexture !== E.depthTexture) {
      const Y = E.depthTexture;
      if (v.__depthDisposeCallback && v.__depthDisposeCallback(), Y) {
        const Q = () => {
          delete v.__boundDepthTexture, delete v.__depthDisposeCallback, Y.removeEventListener("dispose", Q);
        };
        Y.addEventListener("dispose", Q), v.__depthDisposeCallback = Q;
      }
      v.__boundDepthTexture = Y;
    }
    if (E.depthTexture && !v.__autoAllocateDepthBuffer) {
      if (z) throw new Error("target.depthTexture not supported in Cube render targets");
      const Y = E.texture.mipmaps;
      Y && Y.length > 0 ? Et(v.__webglFramebuffer[0], E) : Et(v.__webglFramebuffer, E);
    } else if (z) {
      v.__webglDepthbuffer = [];
      for (let Y = 0; Y < 6; Y++)
        if (e.bindFramebuffer(i.FRAMEBUFFER, v.__webglFramebuffer[Y]), v.__webglDepthbuffer[Y] === void 0)
          v.__webglDepthbuffer[Y] = i.createRenderbuffer(), Lt(v.__webglDepthbuffer[Y], E, !1);
        else {
          const Q = E.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, q = v.__webglDepthbuffer[Y];
          i.bindRenderbuffer(i.RENDERBUFFER, q), i.framebufferRenderbuffer(i.FRAMEBUFFER, Q, i.RENDERBUFFER, q);
        }
    } else {
      const Y = E.texture.mipmaps;
      if (Y && Y.length > 0 ? e.bindFramebuffer(i.FRAMEBUFFER, v.__webglFramebuffer[0]) : e.bindFramebuffer(i.FRAMEBUFFER, v.__webglFramebuffer), v.__webglDepthbuffer === void 0)
        v.__webglDepthbuffer = i.createRenderbuffer(), Lt(v.__webglDepthbuffer, E, !1);
      else {
        const Q = E.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, q = v.__webglDepthbuffer;
        i.bindRenderbuffer(i.RENDERBUFFER, q), i.framebufferRenderbuffer(i.FRAMEBUFFER, Q, i.RENDERBUFFER, q);
      }
    }
    e.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function Oe(E, v, z) {
    const Y = n.get(E);
    v !== void 0 && ft(Y.__webglFramebuffer, E, E.texture, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, 0), z !== void 0 && qt(E);
  }
  function A(E) {
    const v = E.texture, z = n.get(E), Y = n.get(v);
    E.addEventListener("dispose", C);
    const Q = E.textures, q = E.isWebGLCubeRenderTarget === !0, yt = Q.length > 1;
    if (yt || (Y.__webglTexture === void 0 && (Y.__webglTexture = i.createTexture()), Y.__version = v.version, a.memory.textures++), q) {
      z.__webglFramebuffer = [];
      for (let rt = 0; rt < 6; rt++)
        if (v.mipmaps && v.mipmaps.length > 0) {
          z.__webglFramebuffer[rt] = [];
          for (let xt = 0; xt < v.mipmaps.length; xt++)
            z.__webglFramebuffer[rt][xt] = i.createFramebuffer();
        } else
          z.__webglFramebuffer[rt] = i.createFramebuffer();
    } else {
      if (v.mipmaps && v.mipmaps.length > 0) {
        z.__webglFramebuffer = [];
        for (let rt = 0; rt < v.mipmaps.length; rt++)
          z.__webglFramebuffer[rt] = i.createFramebuffer();
      } else
        z.__webglFramebuffer = i.createFramebuffer();
      if (yt)
        for (let rt = 0, xt = Q.length; rt < xt; rt++) {
          const Mt = n.get(Q[rt]);
          Mt.__webglTexture === void 0 && (Mt.__webglTexture = i.createTexture(), a.memory.textures++);
        }
      if (E.samples > 0 && vt(E) === !1) {
        z.__webglMultisampledFramebuffer = i.createFramebuffer(), z.__webglColorRenderbuffer = [], e.bindFramebuffer(i.FRAMEBUFFER, z.__webglMultisampledFramebuffer);
        for (let rt = 0; rt < Q.length; rt++) {
          const xt = Q[rt];
          z.__webglColorRenderbuffer[rt] = i.createRenderbuffer(), i.bindRenderbuffer(i.RENDERBUFFER, z.__webglColorRenderbuffer[rt]);
          const Mt = s.convert(xt.format, xt.colorSpace), nt = s.convert(xt.type), ht = b(xt.internalFormat, Mt, nt, xt.colorSpace, E.isXRRenderTarget === !0), Rt = de(E);
          i.renderbufferStorageMultisample(i.RENDERBUFFER, Rt, ht, E.width, E.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + rt, i.RENDERBUFFER, z.__webglColorRenderbuffer[rt]);
        }
        i.bindRenderbuffer(i.RENDERBUFFER, null), E.depthBuffer && (z.__webglDepthRenderbuffer = i.createRenderbuffer(), Lt(z.__webglDepthRenderbuffer, E, !0)), e.bindFramebuffer(i.FRAMEBUFFER, null);
      }
    }
    if (q) {
      e.bindTexture(i.TEXTURE_CUBE_MAP, Y.__webglTexture), Wt(i.TEXTURE_CUBE_MAP, v);
      for (let rt = 0; rt < 6; rt++)
        if (v.mipmaps && v.mipmaps.length > 0)
          for (let xt = 0; xt < v.mipmaps.length; xt++)
            ft(z.__webglFramebuffer[rt][xt], E, v, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + rt, xt);
        else
          ft(z.__webglFramebuffer[rt], E, v, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + rt, 0);
      m(v) && u(i.TEXTURE_CUBE_MAP), e.unbindTexture();
    } else if (yt) {
      for (let rt = 0, xt = Q.length; rt < xt; rt++) {
        const Mt = Q[rt], nt = n.get(Mt);
        let ht = i.TEXTURE_2D;
        (E.isWebGL3DRenderTarget || E.isWebGLArrayRenderTarget) && (ht = E.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY), e.bindTexture(ht, nt.__webglTexture), Wt(ht, Mt), ft(z.__webglFramebuffer, E, Mt, i.COLOR_ATTACHMENT0 + rt, ht, 0), m(Mt) && u(ht);
      }
      e.unbindTexture();
    } else {
      let rt = i.TEXTURE_2D;
      if ((E.isWebGL3DRenderTarget || E.isWebGLArrayRenderTarget) && (rt = E.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY), e.bindTexture(rt, Y.__webglTexture), Wt(rt, v), v.mipmaps && v.mipmaps.length > 0)
        for (let xt = 0; xt < v.mipmaps.length; xt++)
          ft(z.__webglFramebuffer[xt], E, v, i.COLOR_ATTACHMENT0, rt, xt);
      else
        ft(z.__webglFramebuffer, E, v, i.COLOR_ATTACHMENT0, rt, 0);
      m(v) && u(rt), e.unbindTexture();
    }
    E.depthBuffer && qt(E);
  }
  function he(E) {
    const v = E.textures;
    for (let z = 0, Y = v.length; z < Y; z++) {
      const Q = v[z];
      if (m(Q)) {
        const q = T(E), yt = n.get(Q).__webglTexture;
        e.bindTexture(q, yt), u(q), e.unbindTexture();
      }
    }
  }
  const Ot = [], Pt = [];
  function _t(E) {
    if (E.samples > 0) {
      if (vt(E) === !1) {
        const v = E.textures, z = E.width, Y = E.height;
        let Q = i.COLOR_BUFFER_BIT;
        const q = E.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, yt = n.get(E), rt = v.length > 1;
        if (rt)
          for (let Mt = 0; Mt < v.length; Mt++)
            e.bindFramebuffer(i.FRAMEBUFFER, yt.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + Mt, i.RENDERBUFFER, null), e.bindFramebuffer(i.FRAMEBUFFER, yt.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + Mt, i.TEXTURE_2D, null, 0);
        e.bindFramebuffer(i.READ_FRAMEBUFFER, yt.__webglMultisampledFramebuffer);
        const xt = E.texture.mipmaps;
        xt && xt.length > 0 ? e.bindFramebuffer(i.DRAW_FRAMEBUFFER, yt.__webglFramebuffer[0]) : e.bindFramebuffer(i.DRAW_FRAMEBUFFER, yt.__webglFramebuffer);
        for (let Mt = 0; Mt < v.length; Mt++) {
          if (E.resolveDepthBuffer && (E.depthBuffer && (Q |= i.DEPTH_BUFFER_BIT), E.stencilBuffer && E.resolveStencilBuffer && (Q |= i.STENCIL_BUFFER_BIT)), rt) {
            i.framebufferRenderbuffer(i.READ_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.RENDERBUFFER, yt.__webglColorRenderbuffer[Mt]);
            const nt = n.get(v[Mt]).__webglTexture;
            i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, nt, 0);
          }
          i.blitFramebuffer(0, 0, z, Y, 0, 0, z, Y, Q, i.NEAREST), l === !0 && (Ot.length = 0, Pt.length = 0, Ot.push(i.COLOR_ATTACHMENT0 + Mt), E.depthBuffer && E.resolveDepthBuffer === !1 && (Ot.push(q), Pt.push(q), i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, Pt)), i.invalidateFramebuffer(i.READ_FRAMEBUFFER, Ot));
        }
        if (e.bindFramebuffer(i.READ_FRAMEBUFFER, null), e.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), rt)
          for (let Mt = 0; Mt < v.length; Mt++) {
            e.bindFramebuffer(i.FRAMEBUFFER, yt.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + Mt, i.RENDERBUFFER, yt.__webglColorRenderbuffer[Mt]);
            const nt = n.get(v[Mt]).__webglTexture;
            e.bindFramebuffer(i.FRAMEBUFFER, yt.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + Mt, i.TEXTURE_2D, nt, 0);
          }
        e.bindFramebuffer(i.DRAW_FRAMEBUFFER, yt.__webglMultisampledFramebuffer);
      } else if (E.depthBuffer && E.resolveDepthBuffer === !1 && l) {
        const v = E.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT;
        i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, [v]);
      }
    }
  }
  function de(E) {
    return Math.min(r.maxSamples, E.samples);
  }
  function vt(E) {
    const v = n.get(E);
    return E.samples > 0 && t.has("WEBGL_multisampled_render_to_texture") === !0 && v.__useRenderToTexture !== !1;
  }
  function Ht(E) {
    const v = a.render.frame;
    h.get(E) !== v && (h.set(E, v), E.update());
  }
  function Ce(E, v) {
    const z = E.colorSpace, Y = E.format, Q = E.type;
    return E.isCompressedTexture === !0 || E.isVideoTexture === !0 || z !== Zi && z !== Kn && (Kt.getTransfer(z) === ee ? (Y !== _n || Q !== Pn) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", z)), v;
  }
  function xe(E) {
    return typeof HTMLImageElement < "u" && E instanceof HTMLImageElement ? (c.width = E.naturalWidth || E.width, c.height = E.naturalHeight || E.height) : typeof VideoFrame < "u" && E instanceof VideoFrame ? (c.width = E.displayWidth, c.height = E.displayHeight) : (c.width = E.width, c.height = E.height), c;
  }
  this.allocateTextureUnit = X, this.resetTextureUnits = V, this.setTexture2D = k, this.setTexture2DArray = H, this.setTexture3D = B, this.setTextureCube = D, this.rebindTextures = Oe, this.setupRenderTarget = A, this.updateRenderTargetMipmap = he, this.updateMultisampleRenderTarget = _t, this.setupDepthRenderbuffer = qt, this.setupFrameBufferTexture = ft, this.useMultisampledRTT = vt;
}
function Eg(i, t) {
  function e(n, r = Kn) {
    let s;
    const a = Kt.getTransfer(r);
    if (n === Pn) return i.UNSIGNED_BYTE;
    if (n === Ja) return i.UNSIGNED_SHORT_4_4_4_4;
    if (n === Qa) return i.UNSIGNED_SHORT_5_5_5_1;
    if (n === jl) return i.UNSIGNED_INT_5_9_9_9_REV;
    if (n === Kl) return i.UNSIGNED_INT_10F_11F_11F_REV;
    if (n === ql) return i.BYTE;
    if (n === Yl) return i.SHORT;
    if (n === gr) return i.UNSIGNED_SHORT;
    if (n === Za) return i.INT;
    if (n === _i) return i.UNSIGNED_INT;
    if (n === zn) return i.FLOAT;
    if (n === Er) return i.HALF_FLOAT;
    if (n === Zl) return i.ALPHA;
    if (n === Jl) return i.RGB;
    if (n === _n) return i.RGBA;
    if (n === vr) return i.DEPTH_COMPONENT;
    if (n === xr) return i.DEPTH_STENCIL;
    if (n === Ql) return i.RED;
    if (n === to) return i.RED_INTEGER;
    if (n === tc) return i.RG;
    if (n === eo) return i.RG_INTEGER;
    if (n === no) return i.RGBA_INTEGER;
    if (n === es || n === ns || n === is || n === rs)
      if (a === ee)
        if (s = t.get("WEBGL_compressed_texture_s3tc_srgb"), s !== null) {
          if (n === es) return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (n === ns) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (n === is) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (n === rs) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else
          return null;
      else if (s = t.get("WEBGL_compressed_texture_s3tc"), s !== null) {
        if (n === es) return s.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (n === ns) return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (n === is) return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (n === rs) return s.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else
        return null;
    if (n === ma || n === ga || n === _a || n === va)
      if (s = t.get("WEBGL_compressed_texture_pvrtc"), s !== null) {
        if (n === ma) return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === ga) return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === _a) return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === va) return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else
        return null;
    if (n === xa || n === Ma || n === Sa)
      if (s = t.get("WEBGL_compressed_texture_etc"), s !== null) {
        if (n === xa || n === Ma) return a === ee ? s.COMPRESSED_SRGB8_ETC2 : s.COMPRESSED_RGB8_ETC2;
        if (n === Sa) return a === ee ? s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : s.COMPRESSED_RGBA8_ETC2_EAC;
      } else
        return null;
    if (n === ya || n === Ea || n === ba || n === Ta || n === wa || n === Aa || n === Ra || n === Ca || n === Pa || n === Da || n === La || n === Ia || n === Ua || n === Na)
      if (s = t.get("WEBGL_compressed_texture_astc"), s !== null) {
        if (n === ya) return a === ee ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : s.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === Ea) return a === ee ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : s.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === ba) return a === ee ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : s.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === Ta) return a === ee ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : s.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === wa) return a === ee ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : s.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === Aa) return a === ee ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : s.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === Ra) return a === ee ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : s.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === Ca) return a === ee ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : s.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === Pa) return a === ee ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : s.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === Da) return a === ee ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : s.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === La) return a === ee ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : s.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === Ia) return a === ee ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : s.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === Ua) return a === ee ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : s.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === Na) return a === ee ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : s.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else
        return null;
    if (n === Fa || n === Oa || n === ka)
      if (s = t.get("EXT_texture_compression_bptc"), s !== null) {
        if (n === Fa) return a === ee ? s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : s.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === Oa) return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === ka) return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else
        return null;
    if (n === Ba || n === za || n === Ha || n === Va)
      if (s = t.get("EXT_texture_compression_rgtc"), s !== null) {
        if (n === Ba) return s.COMPRESSED_RED_RGTC1_EXT;
        if (n === za) return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === Ha) return s.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === Va) return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else
        return null;
    return n === _r ? i.UNSIGNED_INT_24_8 : i[n] !== void 0 ? i[n] : null;
  }
  return { convert: e };
}
const bg = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, Tg = `
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
class wg {
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
  init(t, e) {
    if (this.texture === null) {
      const n = new pc(t.texture);
      (t.depthNear !== e.depthNear || t.depthFar !== e.depthFar) && (this.depthNear = t.depthNear, this.depthFar = t.depthFar), this.texture = n;
    }
  }
  /**
   * Returns a plane mesh that visualizes the depth texture.
   *
   * @param {ArrayCamera} cameraXR - The XR camera.
   * @return {?Mesh} The plane mesh.
   */
  getMesh(t) {
    if (this.texture !== null && this.mesh === null) {
      const e = t.cameras[0].viewport, n = new ei({
        vertexShader: bg,
        fragmentShader: Tg,
        uniforms: {
          depthColor: { value: this.texture },
          depthWidth: { value: e.z },
          depthHeight: { value: e.w }
        }
      });
      this.mesh = new Xe(new Si(20, 20), n);
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
class Ag extends yi {
  /**
   * Constructs a new WebGL renderer.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGL2RenderingContext} gl - The rendering context.
   */
  constructor(t, e) {
    super();
    const n = this;
    let r = null, s = 1, a = null, o = "local-floor", l = 1, c = null, h = null, d = null, f = null, p = null, g = null;
    const _ = typeof XRWebGLBinding < "u", m = new wg(), u = {}, T = e.getContextAttributes();
    let b = null, y = null;
    const w = [], R = [], C = new It();
    let F = null;
    const M = new on();
    M.viewport = new ve();
    const S = new on();
    S.viewport = new ve();
    const P = [M, S], V = new Xd();
    let X = null, U = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(K) {
      let J = w[K];
      return J === void 0 && (J = new Hs(), w[K] = J), J.getTargetRaySpace();
    }, this.getControllerGrip = function(K) {
      let J = w[K];
      return J === void 0 && (J = new Hs(), w[K] = J), J.getGripSpace();
    }, this.getHand = function(K) {
      let J = w[K];
      return J === void 0 && (J = new Hs(), w[K] = J), J.getHandSpace();
    };
    function k(K) {
      const J = R.indexOf(K.inputSource);
      if (J === -1)
        return;
      const ft = w[J];
      ft !== void 0 && (ft.update(K.inputSource, K.frame, c || a), ft.dispatchEvent({ type: K.type, data: K.inputSource }));
    }
    function H() {
      r.removeEventListener("select", k), r.removeEventListener("selectstart", k), r.removeEventListener("selectend", k), r.removeEventListener("squeeze", k), r.removeEventListener("squeezestart", k), r.removeEventListener("squeezeend", k), r.removeEventListener("end", H), r.removeEventListener("inputsourceschange", B);
      for (let K = 0; K < w.length; K++) {
        const J = R[K];
        J !== null && (R[K] = null, w[K].disconnect(J));
      }
      X = null, U = null, m.reset();
      for (const K in u)
        delete u[K];
      t.setRenderTarget(b), p = null, f = null, d = null, r = null, y = null, kt.stop(), n.isPresenting = !1, t.setPixelRatio(F), t.setSize(C.width, C.height, !1), n.dispatchEvent({ type: "sessionend" });
    }
    this.setFramebufferScaleFactor = function(K) {
      s = K, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function(K) {
      o = K, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function() {
      return c || a;
    }, this.setReferenceSpace = function(K) {
      c = K;
    }, this.getBaseLayer = function() {
      return f !== null ? f : p;
    }, this.getBinding = function() {
      return d === null && _ && (d = new XRWebGLBinding(r, e)), d;
    }, this.getFrame = function() {
      return g;
    }, this.getSession = function() {
      return r;
    }, this.setSession = async function(K) {
      if (r = K, r !== null) {
        if (b = t.getRenderTarget(), r.addEventListener("select", k), r.addEventListener("selectstart", k), r.addEventListener("selectend", k), r.addEventListener("squeeze", k), r.addEventListener("squeezestart", k), r.addEventListener("squeezeend", k), r.addEventListener("end", H), r.addEventListener("inputsourceschange", B), T.xrCompatible !== !0 && await e.makeXRCompatible(), F = t.getPixelRatio(), t.getSize(C), _ && "createProjectionLayer" in XRWebGLBinding.prototype) {
          let ft = null, Lt = null, Et = null;
          T.depth && (Et = T.stencil ? e.DEPTH24_STENCIL8 : e.DEPTH_COMPONENT24, ft = T.stencil ? xr : vr, Lt = T.stencil ? _r : _i);
          const qt = {
            colorFormat: e.RGBA8,
            depthFormat: Et,
            scaleFactor: s
          };
          d = this.getBinding(), f = d.createProjectionLayer(qt), r.updateRenderState({ layers: [f] }), t.setPixelRatio(1), t.setSize(f.textureWidth, f.textureHeight, !1), y = new xi(
            f.textureWidth,
            f.textureHeight,
            {
              format: _n,
              type: Pn,
              depthTexture: new fc(f.textureWidth, f.textureHeight, Lt, void 0, void 0, void 0, void 0, void 0, void 0, ft),
              stencilBuffer: T.stencil,
              colorSpace: t.outputColorSpace,
              samples: T.antialias ? 4 : 0,
              resolveDepthBuffer: f.ignoreDepthValues === !1,
              resolveStencilBuffer: f.ignoreDepthValues === !1
            }
          );
        } else {
          const ft = {
            antialias: T.antialias,
            alpha: !0,
            depth: T.depth,
            stencil: T.stencil,
            framebufferScaleFactor: s
          };
          p = new XRWebGLLayer(r, e, ft), r.updateRenderState({ baseLayer: p }), t.setPixelRatio(1), t.setSize(p.framebufferWidth, p.framebufferHeight, !1), y = new xi(
            p.framebufferWidth,
            p.framebufferHeight,
            {
              format: _n,
              type: Pn,
              colorSpace: t.outputColorSpace,
              stencilBuffer: T.stencil,
              resolveDepthBuffer: p.ignoreDepthValues === !1,
              resolveStencilBuffer: p.ignoreDepthValues === !1
            }
          );
        }
        y.isXRRenderTarget = !0, this.setFoveation(l), c = null, a = await r.requestReferenceSpace(o), kt.setContext(r), kt.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (r !== null)
        return r.environmentBlendMode;
    }, this.getDepthTexture = function() {
      return m.getDepthTexture();
    };
    function B(K) {
      for (let J = 0; J < K.removed.length; J++) {
        const ft = K.removed[J], Lt = R.indexOf(ft);
        Lt >= 0 && (R[Lt] = null, w[Lt].disconnect(ft));
      }
      for (let J = 0; J < K.added.length; J++) {
        const ft = K.added[J];
        let Lt = R.indexOf(ft);
        if (Lt === -1) {
          for (let qt = 0; qt < w.length; qt++)
            if (qt >= R.length) {
              R.push(ft), Lt = qt;
              break;
            } else if (R[qt] === null) {
              R[qt] = ft, Lt = qt;
              break;
            }
          if (Lt === -1) break;
        }
        const Et = w[Lt];
        Et && Et.connect(ft);
      }
    }
    const D = new I(), j = new I();
    function at(K, J, ft) {
      D.setFromMatrixPosition(J.matrixWorld), j.setFromMatrixPosition(ft.matrixWorld);
      const Lt = D.distanceTo(j), Et = J.projectionMatrix.elements, qt = ft.projectionMatrix.elements, Oe = Et[14] / (Et[10] - 1), A = Et[14] / (Et[10] + 1), he = (Et[9] + 1) / Et[5], Ot = (Et[9] - 1) / Et[5], Pt = (Et[8] - 1) / Et[0], _t = (qt[8] + 1) / qt[0], de = Oe * Pt, vt = Oe * _t, Ht = Lt / (-Pt + _t), Ce = Ht * -Pt;
      if (J.matrixWorld.decompose(K.position, K.quaternion, K.scale), K.translateX(Ce), K.translateZ(Ht), K.matrixWorld.compose(K.position, K.quaternion, K.scale), K.matrixWorldInverse.copy(K.matrixWorld).invert(), Et[10] === -1)
        K.projectionMatrix.copy(J.projectionMatrix), K.projectionMatrixInverse.copy(J.projectionMatrixInverse);
      else {
        const xe = Oe + Ht, E = A + Ht, v = de - Ce, z = vt + (Lt - Ce), Y = he * A / E * xe, Q = Ot * A / E * xe;
        K.projectionMatrix.makePerspective(v, z, Y, Q, xe, E), K.projectionMatrixInverse.copy(K.projectionMatrix).invert();
      }
    }
    function dt(K, J) {
      J === null ? K.matrixWorld.copy(K.matrix) : K.matrixWorld.multiplyMatrices(J.matrixWorld, K.matrix), K.matrixWorldInverse.copy(K.matrixWorld).invert();
    }
    this.updateCamera = function(K) {
      if (r === null) return;
      let J = K.near, ft = K.far;
      m.texture !== null && (m.depthNear > 0 && (J = m.depthNear), m.depthFar > 0 && (ft = m.depthFar)), V.near = S.near = M.near = J, V.far = S.far = M.far = ft, (X !== V.near || U !== V.far) && (r.updateRenderState({
        depthNear: V.near,
        depthFar: V.far
      }), X = V.near, U = V.far), V.layers.mask = K.layers.mask | 6, M.layers.mask = V.layers.mask & 3, S.layers.mask = V.layers.mask & 5;
      const Lt = K.parent, Et = V.cameras;
      dt(V, Lt);
      for (let qt = 0; qt < Et.length; qt++)
        dt(Et[qt], Lt);
      Et.length === 2 ? at(V, M, S) : V.projectionMatrix.copy(M.projectionMatrix), Wt(K, V, Lt);
    };
    function Wt(K, J, ft) {
      ft === null ? K.matrix.copy(J.matrixWorld) : (K.matrix.copy(ft.matrixWorld), K.matrix.invert(), K.matrix.multiply(J.matrixWorld)), K.matrix.decompose(K.position, K.quaternion, K.scale), K.updateMatrixWorld(!0), K.projectionMatrix.copy(J.projectionMatrix), K.projectionMatrixInverse.copy(J.projectionMatrixInverse), K.isPerspectiveCamera && (K.fov = Mr * 2 * Math.atan(1 / K.projectionMatrix.elements[5]), K.zoom = 1);
    }
    this.getCamera = function() {
      return V;
    }, this.getFoveation = function() {
      if (!(f === null && p === null))
        return l;
    }, this.setFoveation = function(K) {
      l = K, f !== null && (f.fixedFoveation = K), p !== null && p.fixedFoveation !== void 0 && (p.fixedFoveation = K);
    }, this.hasDepthSensing = function() {
      return m.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return m.getMesh(V);
    }, this.getCameraTexture = function(K) {
      return u[K];
    };
    let Qt = null;
    function Xt(K, J) {
      if (h = J.getViewerPose(c || a), g = J, h !== null) {
        const ft = h.views;
        p !== null && (t.setRenderTargetFramebuffer(y, p.framebuffer), t.setRenderTarget(y));
        let Lt = !1;
        ft.length !== V.cameras.length && (V.cameras.length = 0, Lt = !0);
        for (let A = 0; A < ft.length; A++) {
          const he = ft[A];
          let Ot = null;
          if (p !== null)
            Ot = p.getViewport(he);
          else {
            const _t = d.getViewSubImage(f, he);
            Ot = _t.viewport, A === 0 && (t.setRenderTargetTextures(
              y,
              _t.colorTexture,
              _t.depthStencilTexture
            ), t.setRenderTarget(y));
          }
          let Pt = P[A];
          Pt === void 0 && (Pt = new on(), Pt.layers.enable(A), Pt.viewport = new ve(), P[A] = Pt), Pt.matrix.fromArray(he.transform.matrix), Pt.matrix.decompose(Pt.position, Pt.quaternion, Pt.scale), Pt.projectionMatrix.fromArray(he.projectionMatrix), Pt.projectionMatrixInverse.copy(Pt.projectionMatrix).invert(), Pt.viewport.set(Ot.x, Ot.y, Ot.width, Ot.height), A === 0 && (V.matrix.copy(Pt.matrix), V.matrix.decompose(V.position, V.quaternion, V.scale)), Lt === !0 && V.cameras.push(Pt);
        }
        const Et = r.enabledFeatures;
        if (Et && Et.includes("depth-sensing") && r.depthUsage == "gpu-optimized" && _) {
          d = n.getBinding();
          const A = d.getDepthInformation(ft[0]);
          A && A.isValid && A.texture && m.init(A, r.renderState);
        }
        if (Et && Et.includes("camera-access") && _) {
          t.state.unbindTexture(), d = n.getBinding();
          for (let A = 0; A < ft.length; A++) {
            const he = ft[A].camera;
            if (he) {
              let Ot = u[he];
              Ot || (Ot = new pc(), u[he] = Ot);
              const Pt = d.getCameraImage(he);
              Ot.sourceTexture = Pt;
            }
          }
        }
      }
      for (let ft = 0; ft < w.length; ft++) {
        const Lt = R[ft], Et = w[ft];
        Lt !== null && Et !== void 0 && Et.update(Lt, J, c || a);
      }
      Qt && Qt(K, J), J.detectedPlanes && n.dispatchEvent({ type: "planesdetected", data: J }), g = null;
    }
    const kt = new vc();
    kt.setAnimationLoop(Xt), this.setAnimationLoop = function(K) {
      Qt = K;
    }, this.dispose = function() {
    };
  }
}
const ci = /* @__PURE__ */ new Dn(), Rg = /* @__PURE__ */ new le();
function Cg(i, t) {
  function e(m, u) {
    m.matrixAutoUpdate === !0 && m.updateMatrix(), u.value.copy(m.matrix);
  }
  function n(m, u) {
    u.color.getRGB(m.fogColor.value, cc(i)), u.isFog ? (m.fogNear.value = u.near, m.fogFar.value = u.far) : u.isFogExp2 && (m.fogDensity.value = u.density);
  }
  function r(m, u, T, b, y) {
    u.isMeshBasicMaterial || u.isMeshLambertMaterial ? s(m, u) : u.isMeshToonMaterial ? (s(m, u), d(m, u)) : u.isMeshPhongMaterial ? (s(m, u), h(m, u)) : u.isMeshStandardMaterial ? (s(m, u), f(m, u), u.isMeshPhysicalMaterial && p(m, u, y)) : u.isMeshMatcapMaterial ? (s(m, u), g(m, u)) : u.isMeshDepthMaterial ? s(m, u) : u.isMeshDistanceMaterial ? (s(m, u), _(m, u)) : u.isMeshNormalMaterial ? s(m, u) : u.isLineBasicMaterial ? (a(m, u), u.isLineDashedMaterial && o(m, u)) : u.isPointsMaterial ? l(m, u, T, b) : u.isSpriteMaterial ? c(m, u) : u.isShadowMaterial ? (m.color.value.copy(u.color), m.opacity.value = u.opacity) : u.isShaderMaterial && (u.uniformsNeedUpdate = !1);
  }
  function s(m, u) {
    m.opacity.value = u.opacity, u.color && m.diffuse.value.copy(u.color), u.emissive && m.emissive.value.copy(u.emissive).multiplyScalar(u.emissiveIntensity), u.map && (m.map.value = u.map, e(u.map, m.mapTransform)), u.alphaMap && (m.alphaMap.value = u.alphaMap, e(u.alphaMap, m.alphaMapTransform)), u.bumpMap && (m.bumpMap.value = u.bumpMap, e(u.bumpMap, m.bumpMapTransform), m.bumpScale.value = u.bumpScale, u.side === Ke && (m.bumpScale.value *= -1)), u.normalMap && (m.normalMap.value = u.normalMap, e(u.normalMap, m.normalMapTransform), m.normalScale.value.copy(u.normalScale), u.side === Ke && m.normalScale.value.negate()), u.displacementMap && (m.displacementMap.value = u.displacementMap, e(u.displacementMap, m.displacementMapTransform), m.displacementScale.value = u.displacementScale, m.displacementBias.value = u.displacementBias), u.emissiveMap && (m.emissiveMap.value = u.emissiveMap, e(u.emissiveMap, m.emissiveMapTransform)), u.specularMap && (m.specularMap.value = u.specularMap, e(u.specularMap, m.specularMapTransform)), u.alphaTest > 0 && (m.alphaTest.value = u.alphaTest);
    const T = t.get(u), b = T.envMap, y = T.envMapRotation;
    b && (m.envMap.value = b, ci.copy(y), ci.x *= -1, ci.y *= -1, ci.z *= -1, b.isCubeTexture && b.isRenderTargetTexture === !1 && (ci.y *= -1, ci.z *= -1), m.envMapRotation.value.setFromMatrix4(Rg.makeRotationFromEuler(ci)), m.flipEnvMap.value = b.isCubeTexture && b.isRenderTargetTexture === !1 ? -1 : 1, m.reflectivity.value = u.reflectivity, m.ior.value = u.ior, m.refractionRatio.value = u.refractionRatio), u.lightMap && (m.lightMap.value = u.lightMap, m.lightMapIntensity.value = u.lightMapIntensity, e(u.lightMap, m.lightMapTransform)), u.aoMap && (m.aoMap.value = u.aoMap, m.aoMapIntensity.value = u.aoMapIntensity, e(u.aoMap, m.aoMapTransform));
  }
  function a(m, u) {
    m.diffuse.value.copy(u.color), m.opacity.value = u.opacity, u.map && (m.map.value = u.map, e(u.map, m.mapTransform));
  }
  function o(m, u) {
    m.dashSize.value = u.dashSize, m.totalSize.value = u.dashSize + u.gapSize, m.scale.value = u.scale;
  }
  function l(m, u, T, b) {
    m.diffuse.value.copy(u.color), m.opacity.value = u.opacity, m.size.value = u.size * T, m.scale.value = b * 0.5, u.map && (m.map.value = u.map, e(u.map, m.uvTransform)), u.alphaMap && (m.alphaMap.value = u.alphaMap, e(u.alphaMap, m.alphaMapTransform)), u.alphaTest > 0 && (m.alphaTest.value = u.alphaTest);
  }
  function c(m, u) {
    m.diffuse.value.copy(u.color), m.opacity.value = u.opacity, m.rotation.value = u.rotation, u.map && (m.map.value = u.map, e(u.map, m.mapTransform)), u.alphaMap && (m.alphaMap.value = u.alphaMap, e(u.alphaMap, m.alphaMapTransform)), u.alphaTest > 0 && (m.alphaTest.value = u.alphaTest);
  }
  function h(m, u) {
    m.specular.value.copy(u.specular), m.shininess.value = Math.max(u.shininess, 1e-4);
  }
  function d(m, u) {
    u.gradientMap && (m.gradientMap.value = u.gradientMap);
  }
  function f(m, u) {
    m.metalness.value = u.metalness, u.metalnessMap && (m.metalnessMap.value = u.metalnessMap, e(u.metalnessMap, m.metalnessMapTransform)), m.roughness.value = u.roughness, u.roughnessMap && (m.roughnessMap.value = u.roughnessMap, e(u.roughnessMap, m.roughnessMapTransform)), u.envMap && (m.envMapIntensity.value = u.envMapIntensity);
  }
  function p(m, u, T) {
    m.ior.value = u.ior, u.sheen > 0 && (m.sheenColor.value.copy(u.sheenColor).multiplyScalar(u.sheen), m.sheenRoughness.value = u.sheenRoughness, u.sheenColorMap && (m.sheenColorMap.value = u.sheenColorMap, e(u.sheenColorMap, m.sheenColorMapTransform)), u.sheenRoughnessMap && (m.sheenRoughnessMap.value = u.sheenRoughnessMap, e(u.sheenRoughnessMap, m.sheenRoughnessMapTransform))), u.clearcoat > 0 && (m.clearcoat.value = u.clearcoat, m.clearcoatRoughness.value = u.clearcoatRoughness, u.clearcoatMap && (m.clearcoatMap.value = u.clearcoatMap, e(u.clearcoatMap, m.clearcoatMapTransform)), u.clearcoatRoughnessMap && (m.clearcoatRoughnessMap.value = u.clearcoatRoughnessMap, e(u.clearcoatRoughnessMap, m.clearcoatRoughnessMapTransform)), u.clearcoatNormalMap && (m.clearcoatNormalMap.value = u.clearcoatNormalMap, e(u.clearcoatNormalMap, m.clearcoatNormalMapTransform), m.clearcoatNormalScale.value.copy(u.clearcoatNormalScale), u.side === Ke && m.clearcoatNormalScale.value.negate())), u.dispersion > 0 && (m.dispersion.value = u.dispersion), u.iridescence > 0 && (m.iridescence.value = u.iridescence, m.iridescenceIOR.value = u.iridescenceIOR, m.iridescenceThicknessMinimum.value = u.iridescenceThicknessRange[0], m.iridescenceThicknessMaximum.value = u.iridescenceThicknessRange[1], u.iridescenceMap && (m.iridescenceMap.value = u.iridescenceMap, e(u.iridescenceMap, m.iridescenceMapTransform)), u.iridescenceThicknessMap && (m.iridescenceThicknessMap.value = u.iridescenceThicknessMap, e(u.iridescenceThicknessMap, m.iridescenceThicknessMapTransform))), u.transmission > 0 && (m.transmission.value = u.transmission, m.transmissionSamplerMap.value = T.texture, m.transmissionSamplerSize.value.set(T.width, T.height), u.transmissionMap && (m.transmissionMap.value = u.transmissionMap, e(u.transmissionMap, m.transmissionMapTransform)), m.thickness.value = u.thickness, u.thicknessMap && (m.thicknessMap.value = u.thicknessMap, e(u.thicknessMap, m.thicknessMapTransform)), m.attenuationDistance.value = u.attenuationDistance, m.attenuationColor.value.copy(u.attenuationColor)), u.anisotropy > 0 && (m.anisotropyVector.value.set(u.anisotropy * Math.cos(u.anisotropyRotation), u.anisotropy * Math.sin(u.anisotropyRotation)), u.anisotropyMap && (m.anisotropyMap.value = u.anisotropyMap, e(u.anisotropyMap, m.anisotropyMapTransform))), m.specularIntensity.value = u.specularIntensity, m.specularColor.value.copy(u.specularColor), u.specularColorMap && (m.specularColorMap.value = u.specularColorMap, e(u.specularColorMap, m.specularColorMapTransform)), u.specularIntensityMap && (m.specularIntensityMap.value = u.specularIntensityMap, e(u.specularIntensityMap, m.specularIntensityMapTransform));
  }
  function g(m, u) {
    u.matcap && (m.matcap.value = u.matcap);
  }
  function _(m, u) {
    const T = t.get(u).light;
    m.referencePosition.value.setFromMatrixPosition(T.matrixWorld), m.nearDistance.value = T.shadow.camera.near, m.farDistance.value = T.shadow.camera.far;
  }
  return {
    refreshFogUniforms: n,
    refreshMaterialUniforms: r
  };
}
function Pg(i, t, e, n) {
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
    const R = t.render.frame;
    s[T.id] !== R && (f(T), s[T.id] = R);
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
  function f(T) {
    const b = r[T.id], y = T.uniforms, w = T.__cache;
    i.bindBuffer(i.UNIFORM_BUFFER, b);
    for (let R = 0, C = y.length; R < C; R++) {
      const F = Array.isArray(y[R]) ? y[R] : [y[R]];
      for (let M = 0, S = F.length; M < S; M++) {
        const P = F[M];
        if (p(P, R, M, w) === !0) {
          const V = P.__offset, X = Array.isArray(P.value) ? P.value : [P.value];
          let U = 0;
          for (let k = 0; k < X.length; k++) {
            const H = X[k], B = _(H);
            typeof H == "number" || typeof H == "boolean" ? (P.__data[0] = H, i.bufferSubData(i.UNIFORM_BUFFER, V + U, P.__data)) : H.isMatrix3 ? (P.__data[0] = H.elements[0], P.__data[1] = H.elements[1], P.__data[2] = H.elements[2], P.__data[3] = 0, P.__data[4] = H.elements[3], P.__data[5] = H.elements[4], P.__data[6] = H.elements[5], P.__data[7] = 0, P.__data[8] = H.elements[6], P.__data[9] = H.elements[7], P.__data[10] = H.elements[8], P.__data[11] = 0) : (H.toArray(P.__data, U), U += B.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          i.bufferSubData(i.UNIFORM_BUFFER, V, P.__data);
        }
      }
    }
    i.bindBuffer(i.UNIFORM_BUFFER, null);
  }
  function p(T, b, y, w) {
    const R = T.value, C = b + "_" + y;
    if (w[C] === void 0)
      return typeof R == "number" || typeof R == "boolean" ? w[C] = R : w[C] = R.clone(), !0;
    {
      const F = w[C];
      if (typeof R == "number" || typeof R == "boolean") {
        if (F !== R)
          return w[C] = R, !0;
      } else if (F.equals(R) === !1)
        return F.copy(R), !0;
    }
    return !1;
  }
  function g(T) {
    const b = T.uniforms;
    let y = 0;
    const w = 16;
    for (let C = 0, F = b.length; C < F; C++) {
      const M = Array.isArray(b[C]) ? b[C] : [b[C]];
      for (let S = 0, P = M.length; S < P; S++) {
        const V = M[S], X = Array.isArray(V.value) ? V.value : [V.value];
        for (let U = 0, k = X.length; U < k; U++) {
          const H = X[U], B = _(H), D = y % w, j = D % B.boundary, at = D + j;
          y += j, at !== 0 && w - at < B.storage && (y += w - at), V.__data = new Float32Array(B.storage / Float32Array.BYTES_PER_ELEMENT), V.__offset = y, y += B.storage;
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
  function u() {
    for (const T in r)
      i.deleteBuffer(r[T]);
    a = [], r = {}, s = {};
  }
  return {
    bind: l,
    update: c,
    dispose: u
  };
}
class Dg {
  /**
   * Constructs a new WebGL renderer.
   *
   * @param {WebGLRenderer~Options} [parameters] - The configuration parameter.
   */
  constructor(t = {}) {
    const {
      canvas: e = rd(),
      context: n = null,
      depth: r = !0,
      stencil: s = !1,
      alpha: a = !1,
      antialias: o = !1,
      premultipliedAlpha: l = !0,
      preserveDrawingBuffer: c = !1,
      powerPreference: h = "default",
      failIfMajorPerformanceCaveat: d = !1,
      reversedDepthBuffer: f = !1
    } = t;
    this.isWebGLRenderer = !0;
    let p;
    if (n !== null) {
      if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext)
        throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      p = n.getContextAttributes().alpha;
    } else
      p = a;
    const g = new Uint32Array(4), _ = new Int32Array(4);
    let m = null, u = null;
    const T = [], b = [];
    this.domElement = e, this.debug = {
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
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this.toneMapping = Jn, this.toneMappingExposure = 1, this.transmissionResolutionScale = 1;
    const y = this;
    let w = !1;
    this._outputColorSpace = je;
    let R = 0, C = 0, F = null, M = -1, S = null;
    const P = new ve(), V = new ve();
    let X = null;
    const U = new Yt(0);
    let k = 0, H = e.width, B = e.height, D = 1, j = null, at = null;
    const dt = new ve(0, 0, H, B), Wt = new ve(0, 0, H, B);
    let Qt = !1;
    const Xt = new ao();
    let kt = !1, K = !1;
    const J = new le(), ft = new I(), Lt = new ve(), Et = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 };
    let qt = !1;
    function Oe() {
      return F === null ? D : 1;
    }
    let A = n;
    function he(x, N) {
      return e.getContext(x, N);
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
      if ("setAttribute" in e && e.setAttribute("data-engine", `three.js r${Ka}`), e.addEventListener("webglcontextlost", st, !1), e.addEventListener("webglcontextrestored", pt, !1), e.addEventListener("webglcontextcreationerror", tt, !1), A === null) {
        const N = "webgl2";
        if (A = he(N, x), A === null)
          throw he(N) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (x) {
      throw console.error("THREE.WebGLRenderer: " + x.message), x;
    }
    let Ot, Pt, _t, de, vt, Ht, Ce, xe, E, v, z, Y, Q, q, yt, rt, xt, Mt, nt, ht, Rt, St, lt, Bt;
    function L() {
      Ot = new Hp(A), Ot.init(), St = new Eg(A, Ot), Pt = new Up(A, Ot, t, St), _t = new Sg(A, Ot), Pt.reversedDepthBuffer && f && _t.buffers.depth.setReversed(!0), de = new Wp(A), vt = new lg(), Ht = new yg(A, Ot, _t, vt, Pt, St, de), Ce = new Fp(y), xe = new zp(y), E = new jd(A), lt = new Lp(A, E), v = new Vp(A, E, de, lt), z = new $p(A, v, E, de), nt = new Xp(A, Pt, Ht), rt = new Np(vt), Y = new og(y, Ce, xe, Ot, Pt, lt, rt), Q = new Cg(y, vt), q = new hg(), yt = new gg(Ot), Mt = new Dp(y, Ce, xe, _t, z, p, l), xt = new xg(y, z, Pt), Bt = new Pg(A, de, Pt, _t), ht = new Ip(A, Ot, de), Rt = new Gp(A, Ot, de), de.programs = Y.programs, y.capabilities = Pt, y.extensions = Ot, y.properties = vt, y.renderLists = q, y.shadowMap = xt, y.state = _t, y.info = de;
    }
    L();
    const it = new Ag(y, A);
    this.xr = it, this.getContext = function() {
      return A;
    }, this.getContextAttributes = function() {
      return A.getContextAttributes();
    }, this.forceContextLoss = function() {
      const x = Ot.get("WEBGL_lose_context");
      x && x.loseContext();
    }, this.forceContextRestore = function() {
      const x = Ot.get("WEBGL_lose_context");
      x && x.restoreContext();
    }, this.getPixelRatio = function() {
      return D;
    }, this.setPixelRatio = function(x) {
      x !== void 0 && (D = x, this.setSize(H, B, !1));
    }, this.getSize = function(x) {
      return x.set(H, B);
    }, this.setSize = function(x, N, G = !0) {
      if (it.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      H = x, B = N, e.width = Math.floor(x * D), e.height = Math.floor(N * D), G === !0 && (e.style.width = x + "px", e.style.height = N + "px"), this.setViewport(0, 0, x, N);
    }, this.getDrawingBufferSize = function(x) {
      return x.set(H * D, B * D).floor();
    }, this.setDrawingBufferSize = function(x, N, G) {
      H = x, B = N, D = G, e.width = Math.floor(x * G), e.height = Math.floor(N * G), this.setViewport(0, 0, x, N);
    }, this.getCurrentViewport = function(x) {
      return x.copy(P);
    }, this.getViewport = function(x) {
      return x.copy(dt);
    }, this.setViewport = function(x, N, G, W) {
      x.isVector4 ? dt.set(x.x, x.y, x.z, x.w) : dt.set(x, N, G, W), _t.viewport(P.copy(dt).multiplyScalar(D).round());
    }, this.getScissor = function(x) {
      return x.copy(Wt);
    }, this.setScissor = function(x, N, G, W) {
      x.isVector4 ? Wt.set(x.x, x.y, x.z, x.w) : Wt.set(x, N, G, W), _t.scissor(V.copy(Wt).multiplyScalar(D).round());
    }, this.getScissorTest = function() {
      return Qt;
    }, this.setScissorTest = function(x) {
      _t.setScissorTest(Qt = x);
    }, this.setOpaqueSort = function(x) {
      j = x;
    }, this.setTransparentSort = function(x) {
      at = x;
    }, this.getClearColor = function(x) {
      return x.copy(Mt.getClearColor());
    }, this.setClearColor = function() {
      Mt.setClearColor(...arguments);
    }, this.getClearAlpha = function() {
      return Mt.getClearAlpha();
    }, this.setClearAlpha = function() {
      Mt.setClearAlpha(...arguments);
    }, this.clear = function(x = !0, N = !0, G = !0) {
      let W = 0;
      if (x) {
        let O = !1;
        if (F !== null) {
          const et = F.texture.format;
          O = et === no || et === eo || et === to;
        }
        if (O) {
          const et = F.texture.type, ct = et === Pn || et === _i || et === gr || et === _r || et === Ja || et === Qa, mt = Mt.getClearColor(), ut = Mt.getClearAlpha(), At = mt.r, Dt = mt.g, bt = mt.b;
          ct ? (g[0] = At, g[1] = Dt, g[2] = bt, g[3] = ut, A.clearBufferuiv(A.COLOR, 0, g)) : (_[0] = At, _[1] = Dt, _[2] = bt, _[3] = ut, A.clearBufferiv(A.COLOR, 0, _));
        } else
          W |= A.COLOR_BUFFER_BIT;
      }
      N && (W |= A.DEPTH_BUFFER_BIT), G && (W |= A.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), A.clear(W);
    }, this.clearColor = function() {
      this.clear(!0, !1, !1);
    }, this.clearDepth = function() {
      this.clear(!1, !0, !1);
    }, this.clearStencil = function() {
      this.clear(!1, !1, !0);
    }, this.dispose = function() {
      e.removeEventListener("webglcontextlost", st, !1), e.removeEventListener("webglcontextrestored", pt, !1), e.removeEventListener("webglcontextcreationerror", tt, !1), Mt.dispose(), q.dispose(), yt.dispose(), vt.dispose(), Ce.dispose(), xe.dispose(), z.dispose(), lt.dispose(), Bt.dispose(), Y.dispose(), it.dispose(), it.removeEventListener("sessionstart", Sn), it.removeEventListener("sessionend", _o), ni.stop();
    };
    function st(x) {
      x.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), w = !0;
    }
    function pt() {
      console.log("THREE.WebGLRenderer: Context Restored."), w = !1;
      const x = de.autoReset, N = xt.enabled, G = xt.autoUpdate, W = xt.needsUpdate, O = xt.type;
      L(), de.autoReset = x, xt.enabled = N, xt.autoUpdate = G, xt.needsUpdate = W, xt.type = O;
    }
    function tt(x) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", x.statusMessage);
    }
    function Z(x) {
      const N = x.target;
      N.removeEventListener("dispose", Z), gt(N);
    }
    function gt(x) {
      Ft(x), vt.remove(x);
    }
    function Ft(x) {
      const N = vt.get(x).programs;
      N !== void 0 && (N.forEach(function(G) {
        Y.releaseProgram(G);
      }), x.isShaderMaterial && Y.releaseShaderCache(x));
    }
    this.renderBufferDirect = function(x, N, G, W, O, et) {
      N === null && (N = Et);
      const ct = O.isMesh && O.matrixWorld.determinant() < 0, mt = Fc(x, N, G, W, O);
      _t.setMaterial(W, ct);
      let ut = G.index, At = 1;
      if (W.wireframe === !0) {
        if (ut = v.getWireframeAttribute(G), ut === void 0) return;
        At = 2;
      }
      const Dt = G.drawRange, bt = G.attributes.position;
      let $t = Dt.start * At, te = (Dt.start + Dt.count) * At;
      et !== null && ($t = Math.max($t, et.start * At), te = Math.min(te, (et.start + et.count) * At)), ut !== null ? ($t = Math.max($t, 0), te = Math.min(te, ut.count)) : bt != null && ($t = Math.max($t, 0), te = Math.min(te, bt.count));
      const ge = te - $t;
      if (ge < 0 || ge === 1 / 0) return;
      lt.setup(O, W, mt, G, ut);
      let ce, re = ht;
      if (ut !== null && (ce = E.get(ut), re = Rt, re.setIndex(ce)), O.isMesh)
        W.wireframe === !0 ? (_t.setLineWidth(W.wireframeLinewidth * Oe()), re.setMode(A.LINES)) : re.setMode(A.TRIANGLES);
      else if (O.isLine) {
        let wt = W.linewidth;
        wt === void 0 && (wt = 1), _t.setLineWidth(wt * Oe()), O.isLineSegments ? re.setMode(A.LINES) : O.isLineLoop ? re.setMode(A.LINE_LOOP) : re.setMode(A.LINE_STRIP);
      } else O.isPoints ? re.setMode(A.POINTS) : O.isSprite && re.setMode(A.TRIANGLES);
      if (O.isBatchedMesh)
        if (O._multiDrawInstances !== null)
          Sr("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."), re.renderMultiDrawInstances(O._multiDrawStarts, O._multiDrawCounts, O._multiDrawCount, O._multiDrawInstances);
        else if (Ot.get("WEBGL_multi_draw"))
          re.renderMultiDraw(O._multiDrawStarts, O._multiDrawCounts, O._multiDrawCount);
        else {
          const wt = O._multiDrawStarts, fe = O._multiDrawCounts, jt = O._multiDrawCount, Ze = ut ? E.get(ut).bytesPerElement : 1, Ei = vt.get(W).currentProgram.getUniforms();
          for (let Je = 0; Je < jt; Je++)
            Ei.setValue(A, "_gl_DrawID", Je), re.render(wt[Je] / Ze, fe[Je]);
        }
      else if (O.isInstancedMesh)
        re.renderInstances($t, ge, O.count);
      else if (G.isInstancedBufferGeometry) {
        const wt = G._maxInstanceCount !== void 0 ? G._maxInstanceCount : 1 / 0, fe = Math.min(G.instanceCount, wt);
        re.renderInstances($t, ge, fe);
      } else
        re.render($t, ge);
    };
    function se(x, N, G) {
      x.transparent === !0 && x.side === ln && x.forceSinglePass === !1 ? (x.side = Ke, x.needsUpdate = !0, Tr(x, N, G), x.side = ti, x.needsUpdate = !0, Tr(x, N, G), x.side = ln) : Tr(x, N, G);
    }
    this.compile = function(x, N, G = null) {
      G === null && (G = x), u = yt.get(G), u.init(N), b.push(u), G.traverseVisible(function(O) {
        O.isLight && O.layers.test(N.layers) && (u.pushLight(O), O.castShadow && u.pushShadow(O));
      }), x !== G && x.traverseVisible(function(O) {
        O.isLight && O.layers.test(N.layers) && (u.pushLight(O), O.castShadow && u.pushShadow(O));
      }), u.setupLights();
      const W = /* @__PURE__ */ new Set();
      return x.traverse(function(O) {
        if (!(O.isMesh || O.isPoints || O.isLine || O.isSprite))
          return;
        const et = O.material;
        if (et)
          if (Array.isArray(et))
            for (let ct = 0; ct < et.length; ct++) {
              const mt = et[ct];
              se(mt, G, O), W.add(mt);
            }
          else
            se(et, G, O), W.add(et);
      }), u = b.pop(), W;
    }, this.compileAsync = function(x, N, G = null) {
      const W = this.compile(x, N, G);
      return new Promise((O) => {
        function et() {
          if (W.forEach(function(ct) {
            vt.get(ct).currentProgram.isReady() && W.delete(ct);
          }), W.size === 0) {
            O(x);
            return;
          }
          setTimeout(et, 10);
        }
        Ot.get("KHR_parallel_shader_compile") !== null ? et() : setTimeout(et, 10);
      });
    };
    let Zt = null;
    function Ln(x) {
      Zt && Zt(x);
    }
    function Sn() {
      ni.stop();
    }
    function _o() {
      ni.start();
    }
    const ni = new vc();
    ni.setAnimationLoop(Ln), typeof self < "u" && ni.setContext(self), this.setAnimationLoop = function(x) {
      Zt = x, it.setAnimationLoop(x), x === null ? ni.stop() : ni.start();
    }, it.addEventListener("sessionstart", Sn), it.addEventListener("sessionend", _o), this.render = function(x, N) {
      if (N !== void 0 && N.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (w === !0) return;
      if (x.matrixWorldAutoUpdate === !0 && x.updateMatrixWorld(), N.parent === null && N.matrixWorldAutoUpdate === !0 && N.updateMatrixWorld(), it.enabled === !0 && it.isPresenting === !0 && (it.cameraAutoUpdate === !0 && it.updateCamera(N), N = it.getCamera()), x.isScene === !0 && x.onBeforeRender(y, x, N, F), u = yt.get(x, b.length), u.init(N), b.push(u), J.multiplyMatrices(N.projectionMatrix, N.matrixWorldInverse), Xt.setFromProjectionMatrix(J, Tn, N.reversedDepth), K = this.localClippingEnabled, kt = rt.init(this.clippingPlanes, K), m = q.get(x, T.length), m.init(), T.push(m), it.enabled === !0 && it.isPresenting === !0) {
        const et = y.xr.getDepthSensingMesh();
        et !== null && vs(et, N, -1 / 0, y.sortObjects);
      }
      vs(x, N, 0, y.sortObjects), m.finish(), y.sortObjects === !0 && m.sort(j, at), qt = it.enabled === !1 || it.isPresenting === !1 || it.hasDepthSensing() === !1, qt && Mt.addToRenderList(m, x), this.info.render.frame++, kt === !0 && rt.beginShadows();
      const G = u.state.shadowsArray;
      xt.render(G, x, N), kt === !0 && rt.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const W = m.opaque, O = m.transmissive;
      if (u.setupLights(), N.isArrayCamera) {
        const et = N.cameras;
        if (O.length > 0)
          for (let ct = 0, mt = et.length; ct < mt; ct++) {
            const ut = et[ct];
            xo(W, O, x, ut);
          }
        qt && Mt.render(x);
        for (let ct = 0, mt = et.length; ct < mt; ct++) {
          const ut = et[ct];
          vo(m, x, ut, ut.viewport);
        }
      } else
        O.length > 0 && xo(W, O, x, N), qt && Mt.render(x), vo(m, x, N);
      F !== null && C === 0 && (Ht.updateMultisampleRenderTarget(F), Ht.updateRenderTargetMipmap(F)), x.isScene === !0 && x.onAfterRender(y, x, N), lt.resetDefaultState(), M = -1, S = null, b.pop(), b.length > 0 ? (u = b[b.length - 1], kt === !0 && rt.setGlobalState(y.clippingPlanes, u.state.camera)) : u = null, T.pop(), T.length > 0 ? m = T[T.length - 1] : m = null;
    };
    function vs(x, N, G, W) {
      if (x.visible === !1) return;
      if (x.layers.test(N.layers)) {
        if (x.isGroup)
          G = x.renderOrder;
        else if (x.isLOD)
          x.autoUpdate === !0 && x.update(N);
        else if (x.isLight)
          u.pushLight(x), x.castShadow && u.pushShadow(x);
        else if (x.isSprite) {
          if (!x.frustumCulled || Xt.intersectsSprite(x)) {
            W && Lt.setFromMatrixPosition(x.matrixWorld).applyMatrix4(J);
            const ct = z.update(x), mt = x.material;
            mt.visible && m.push(x, ct, mt, G, Lt.z, null);
          }
        } else if ((x.isMesh || x.isLine || x.isPoints) && (!x.frustumCulled || Xt.intersectsObject(x))) {
          const ct = z.update(x), mt = x.material;
          if (W && (x.boundingSphere !== void 0 ? (x.boundingSphere === null && x.computeBoundingSphere(), Lt.copy(x.boundingSphere.center)) : (ct.boundingSphere === null && ct.computeBoundingSphere(), Lt.copy(ct.boundingSphere.center)), Lt.applyMatrix4(x.matrixWorld).applyMatrix4(J)), Array.isArray(mt)) {
            const ut = ct.groups;
            for (let At = 0, Dt = ut.length; At < Dt; At++) {
              const bt = ut[At], $t = mt[bt.materialIndex];
              $t && $t.visible && m.push(x, ct, $t, G, Lt.z, bt);
            }
          } else mt.visible && m.push(x, ct, mt, G, Lt.z, null);
        }
      }
      const et = x.children;
      for (let ct = 0, mt = et.length; ct < mt; ct++)
        vs(et[ct], N, G, W);
    }
    function vo(x, N, G, W) {
      const O = x.opaque, et = x.transmissive, ct = x.transparent;
      u.setupLightsView(G), kt === !0 && rt.setGlobalState(y.clippingPlanes, G), W && _t.viewport(P.copy(W)), O.length > 0 && br(O, N, G), et.length > 0 && br(et, N, G), ct.length > 0 && br(ct, N, G), _t.buffers.depth.setTest(!0), _t.buffers.depth.setMask(!0), _t.buffers.color.setMask(!0), _t.setPolygonOffset(!1);
    }
    function xo(x, N, G, W) {
      if ((G.isScene === !0 ? G.overrideMaterial : null) !== null)
        return;
      u.state.transmissionRenderTarget[W.id] === void 0 && (u.state.transmissionRenderTarget[W.id] = new xi(1, 1, {
        generateMipmaps: !0,
        type: Ot.has("EXT_color_buffer_half_float") || Ot.has("EXT_color_buffer_float") ? Er : Pn,
        minFilter: mi,
        samples: 4,
        stencilBuffer: s,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: Kt.workingColorSpace
      }));
      const et = u.state.transmissionRenderTarget[W.id], ct = W.viewport || P;
      et.setSize(ct.z * y.transmissionResolutionScale, ct.w * y.transmissionResolutionScale);
      const mt = y.getRenderTarget(), ut = y.getActiveCubeFace(), At = y.getActiveMipmapLevel();
      y.setRenderTarget(et), y.getClearColor(U), k = y.getClearAlpha(), k < 1 && y.setClearColor(16777215, 0.5), y.clear(), qt && Mt.render(G);
      const Dt = y.toneMapping;
      y.toneMapping = Jn;
      const bt = W.viewport;
      if (W.viewport !== void 0 && (W.viewport = void 0), u.setupLightsView(W), kt === !0 && rt.setGlobalState(y.clippingPlanes, W), br(x, G, W), Ht.updateMultisampleRenderTarget(et), Ht.updateRenderTargetMipmap(et), Ot.has("WEBGL_multisampled_render_to_texture") === !1) {
        let $t = !1;
        for (let te = 0, ge = N.length; te < ge; te++) {
          const ce = N[te], re = ce.object, wt = ce.geometry, fe = ce.material, jt = ce.group;
          if (fe.side === ln && re.layers.test(W.layers)) {
            const Ze = fe.side;
            fe.side = Ke, fe.needsUpdate = !0, Mo(re, G, W, wt, fe, jt), fe.side = Ze, fe.needsUpdate = !0, $t = !0;
          }
        }
        $t === !0 && (Ht.updateMultisampleRenderTarget(et), Ht.updateRenderTargetMipmap(et));
      }
      y.setRenderTarget(mt, ut, At), y.setClearColor(U, k), bt !== void 0 && (W.viewport = bt), y.toneMapping = Dt;
    }
    function br(x, N, G) {
      const W = N.isScene === !0 ? N.overrideMaterial : null;
      for (let O = 0, et = x.length; O < et; O++) {
        const ct = x[O], mt = ct.object, ut = ct.geometry, At = ct.group;
        let Dt = ct.material;
        Dt.allowOverride === !0 && W !== null && (Dt = W), mt.layers.test(G.layers) && Mo(mt, N, G, ut, Dt, At);
      }
    }
    function Mo(x, N, G, W, O, et) {
      x.onBeforeRender(y, N, G, W, O, et), x.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse, x.matrixWorld), x.normalMatrix.getNormalMatrix(x.modelViewMatrix), O.onBeforeRender(y, N, G, W, x, et), O.transparent === !0 && O.side === ln && O.forceSinglePass === !1 ? (O.side = Ke, O.needsUpdate = !0, y.renderBufferDirect(G, N, W, O, x, et), O.side = ti, O.needsUpdate = !0, y.renderBufferDirect(G, N, W, O, x, et), O.side = ln) : y.renderBufferDirect(G, N, W, O, x, et), x.onAfterRender(y, N, G, W, O, et);
    }
    function Tr(x, N, G) {
      N.isScene !== !0 && (N = Et);
      const W = vt.get(x), O = u.state.lights, et = u.state.shadowsArray, ct = O.state.version, mt = Y.getParameters(x, O.state, et, N, G), ut = Y.getProgramCacheKey(mt);
      let At = W.programs;
      W.environment = x.isMeshStandardMaterial ? N.environment : null, W.fog = N.fog, W.envMap = (x.isMeshStandardMaterial ? xe : Ce).get(x.envMap || W.environment), W.envMapRotation = W.environment !== null && x.envMap === null ? N.environmentRotation : x.envMapRotation, At === void 0 && (x.addEventListener("dispose", Z), At = /* @__PURE__ */ new Map(), W.programs = At);
      let Dt = At.get(ut);
      if (Dt !== void 0) {
        if (W.currentProgram === Dt && W.lightsStateVersion === ct)
          return yo(x, mt), Dt;
      } else
        mt.uniforms = Y.getUniforms(x), x.onBeforeCompile(mt, y), Dt = Y.acquireProgram(mt, ut), At.set(ut, Dt), W.uniforms = mt.uniforms;
      const bt = W.uniforms;
      return (!x.isShaderMaterial && !x.isRawShaderMaterial || x.clipping === !0) && (bt.clippingPlanes = rt.uniform), yo(x, mt), W.needsLights = kc(x), W.lightsStateVersion = ct, W.needsLights && (bt.ambientLightColor.value = O.state.ambient, bt.lightProbe.value = O.state.probe, bt.directionalLights.value = O.state.directional, bt.directionalLightShadows.value = O.state.directionalShadow, bt.spotLights.value = O.state.spot, bt.spotLightShadows.value = O.state.spotShadow, bt.rectAreaLights.value = O.state.rectArea, bt.ltc_1.value = O.state.rectAreaLTC1, bt.ltc_2.value = O.state.rectAreaLTC2, bt.pointLights.value = O.state.point, bt.pointLightShadows.value = O.state.pointShadow, bt.hemisphereLights.value = O.state.hemi, bt.directionalShadowMap.value = O.state.directionalShadowMap, bt.directionalShadowMatrix.value = O.state.directionalShadowMatrix, bt.spotShadowMap.value = O.state.spotShadowMap, bt.spotLightMatrix.value = O.state.spotLightMatrix, bt.spotLightMap.value = O.state.spotLightMap, bt.pointShadowMap.value = O.state.pointShadowMap, bt.pointShadowMatrix.value = O.state.pointShadowMatrix), W.currentProgram = Dt, W.uniformsList = null, Dt;
    }
    function So(x) {
      if (x.uniformsList === null) {
        const N = x.currentProgram.getUniforms();
        x.uniformsList = ss.seqWithValue(N.seq, x.uniforms);
      }
      return x.uniformsList;
    }
    function yo(x, N) {
      const G = vt.get(x);
      G.outputColorSpace = N.outputColorSpace, G.batching = N.batching, G.batchingColor = N.batchingColor, G.instancing = N.instancing, G.instancingColor = N.instancingColor, G.instancingMorph = N.instancingMorph, G.skinning = N.skinning, G.morphTargets = N.morphTargets, G.morphNormals = N.morphNormals, G.morphColors = N.morphColors, G.morphTargetsCount = N.morphTargetsCount, G.numClippingPlanes = N.numClippingPlanes, G.numIntersection = N.numClipIntersection, G.vertexAlphas = N.vertexAlphas, G.vertexTangents = N.vertexTangents, G.toneMapping = N.toneMapping;
    }
    function Fc(x, N, G, W, O) {
      N.isScene !== !0 && (N = Et), Ht.resetTextureUnits();
      const et = N.fog, ct = W.isMeshStandardMaterial ? N.environment : null, mt = F === null ? y.outputColorSpace : F.isXRRenderTarget === !0 ? F.texture.colorSpace : Zi, ut = (W.isMeshStandardMaterial ? xe : Ce).get(W.envMap || ct), At = W.vertexColors === !0 && !!G.attributes.color && G.attributes.color.itemSize === 4, Dt = !!G.attributes.tangent && (!!W.normalMap || W.anisotropy > 0), bt = !!G.morphAttributes.position, $t = !!G.morphAttributes.normal, te = !!G.morphAttributes.color;
      let ge = Jn;
      W.toneMapped && (F === null || F.isXRRenderTarget === !0) && (ge = y.toneMapping);
      const ce = G.morphAttributes.position || G.morphAttributes.normal || G.morphAttributes.color, re = ce !== void 0 ? ce.length : 0, wt = vt.get(W), fe = u.state.lights;
      if (kt === !0 && (K === !0 || x !== S)) {
        const He = x === S && W.id === M;
        rt.setState(W, x, He);
      }
      let jt = !1;
      W.version === wt.__version ? (wt.needsLights && wt.lightsStateVersion !== fe.state.version || wt.outputColorSpace !== mt || O.isBatchedMesh && wt.batching === !1 || !O.isBatchedMesh && wt.batching === !0 || O.isBatchedMesh && wt.batchingColor === !0 && O.colorTexture === null || O.isBatchedMesh && wt.batchingColor === !1 && O.colorTexture !== null || O.isInstancedMesh && wt.instancing === !1 || !O.isInstancedMesh && wt.instancing === !0 || O.isSkinnedMesh && wt.skinning === !1 || !O.isSkinnedMesh && wt.skinning === !0 || O.isInstancedMesh && wt.instancingColor === !0 && O.instanceColor === null || O.isInstancedMesh && wt.instancingColor === !1 && O.instanceColor !== null || O.isInstancedMesh && wt.instancingMorph === !0 && O.morphTexture === null || O.isInstancedMesh && wt.instancingMorph === !1 && O.morphTexture !== null || wt.envMap !== ut || W.fog === !0 && wt.fog !== et || wt.numClippingPlanes !== void 0 && (wt.numClippingPlanes !== rt.numPlanes || wt.numIntersection !== rt.numIntersection) || wt.vertexAlphas !== At || wt.vertexTangents !== Dt || wt.morphTargets !== bt || wt.morphNormals !== $t || wt.morphColors !== te || wt.toneMapping !== ge || wt.morphTargetsCount !== re) && (jt = !0) : (jt = !0, wt.__version = W.version);
      let Ze = wt.currentProgram;
      jt === !0 && (Ze = Tr(W, N, O));
      let Ei = !1, Je = !1, rr = !1;
      const pe = Ze.getUniforms(), nn = wt.uniforms;
      if (_t.useProgram(Ze.program) && (Ei = !0, Je = !0, rr = !0), W.id !== M && (M = W.id, Je = !0), Ei || S !== x) {
        _t.buffers.depth.getReversed() && x.reversedDepth !== !0 && (x._reversedDepth = !0, x.updateProjectionMatrix()), pe.setValue(A, "projectionMatrix", x.projectionMatrix), pe.setValue(A, "viewMatrix", x.matrixWorldInverse);
        const qe = pe.map.cameraPosition;
        qe !== void 0 && qe.setValue(A, ft.setFromMatrixPosition(x.matrixWorld)), Pt.logarithmicDepthBuffer && pe.setValue(
          A,
          "logDepthBufFC",
          2 / (Math.log(x.far + 1) / Math.LN2)
        ), (W.isMeshPhongMaterial || W.isMeshToonMaterial || W.isMeshLambertMaterial || W.isMeshBasicMaterial || W.isMeshStandardMaterial || W.isShaderMaterial) && pe.setValue(A, "isOrthographic", x.isOrthographicCamera === !0), S !== x && (S = x, Je = !0, rr = !0);
      }
      if (O.isSkinnedMesh) {
        pe.setOptional(A, O, "bindMatrix"), pe.setOptional(A, O, "bindMatrixInverse");
        const He = O.skeleton;
        He && (He.boneTexture === null && He.computeBoneTexture(), pe.setValue(A, "boneTexture", He.boneTexture, Ht));
      }
      O.isBatchedMesh && (pe.setOptional(A, O, "batchingTexture"), pe.setValue(A, "batchingTexture", O._matricesTexture, Ht), pe.setOptional(A, O, "batchingIdTexture"), pe.setValue(A, "batchingIdTexture", O._indirectTexture, Ht), pe.setOptional(A, O, "batchingColorTexture"), O._colorsTexture !== null && pe.setValue(A, "batchingColorTexture", O._colorsTexture, Ht));
      const rn = G.morphAttributes;
      if ((rn.position !== void 0 || rn.normal !== void 0 || rn.color !== void 0) && nt.update(O, G, Ze), (Je || wt.receiveShadow !== O.receiveShadow) && (wt.receiveShadow = O.receiveShadow, pe.setValue(A, "receiveShadow", O.receiveShadow)), W.isMeshGouraudMaterial && W.envMap !== null && (nn.envMap.value = ut, nn.flipEnvMap.value = ut.isCubeTexture && ut.isRenderTargetTexture === !1 ? -1 : 1), W.isMeshStandardMaterial && W.envMap === null && N.environment !== null && (nn.envMapIntensity.value = N.environmentIntensity), Je && (pe.setValue(A, "toneMappingExposure", y.toneMappingExposure), wt.needsLights && Oc(nn, rr), et && W.fog === !0 && Q.refreshFogUniforms(nn, et), Q.refreshMaterialUniforms(nn, W, D, B, u.state.transmissionRenderTarget[x.id]), ss.upload(A, So(wt), nn, Ht)), W.isShaderMaterial && W.uniformsNeedUpdate === !0 && (ss.upload(A, So(wt), nn, Ht), W.uniformsNeedUpdate = !1), W.isSpriteMaterial && pe.setValue(A, "center", O.center), pe.setValue(A, "modelViewMatrix", O.modelViewMatrix), pe.setValue(A, "normalMatrix", O.normalMatrix), pe.setValue(A, "modelMatrix", O.matrixWorld), W.isShaderMaterial || W.isRawShaderMaterial) {
        const He = W.uniformsGroups;
        for (let qe = 0, xs = He.length; qe < xs; qe++) {
          const ii = He[qe];
          Bt.update(ii, Ze), Bt.bind(ii, Ze);
        }
      }
      return Ze;
    }
    function Oc(x, N) {
      x.ambientLightColor.needsUpdate = N, x.lightProbe.needsUpdate = N, x.directionalLights.needsUpdate = N, x.directionalLightShadows.needsUpdate = N, x.pointLights.needsUpdate = N, x.pointLightShadows.needsUpdate = N, x.spotLights.needsUpdate = N, x.spotLightShadows.needsUpdate = N, x.rectAreaLights.needsUpdate = N, x.hemisphereLights.needsUpdate = N;
    }
    function kc(x) {
      return x.isMeshLambertMaterial || x.isMeshToonMaterial || x.isMeshPhongMaterial || x.isMeshStandardMaterial || x.isShadowMaterial || x.isShaderMaterial && x.lights === !0;
    }
    this.getActiveCubeFace = function() {
      return R;
    }, this.getActiveMipmapLevel = function() {
      return C;
    }, this.getRenderTarget = function() {
      return F;
    }, this.setRenderTargetTextures = function(x, N, G) {
      const W = vt.get(x);
      W.__autoAllocateDepthBuffer = x.resolveDepthBuffer === !1, W.__autoAllocateDepthBuffer === !1 && (W.__useRenderToTexture = !1), vt.get(x.texture).__webglTexture = N, vt.get(x.depthTexture).__webglTexture = W.__autoAllocateDepthBuffer ? void 0 : G, W.__hasExternalTextures = !0;
    }, this.setRenderTargetFramebuffer = function(x, N) {
      const G = vt.get(x);
      G.__webglFramebuffer = N, G.__useDefaultFramebuffer = N === void 0;
    };
    const Bc = A.createFramebuffer();
    this.setRenderTarget = function(x, N = 0, G = 0) {
      F = x, R = N, C = G;
      let W = !0, O = null, et = !1, ct = !1;
      if (x) {
        const ut = vt.get(x);
        if (ut.__useDefaultFramebuffer !== void 0)
          _t.bindFramebuffer(A.FRAMEBUFFER, null), W = !1;
        else if (ut.__webglFramebuffer === void 0)
          Ht.setupRenderTarget(x);
        else if (ut.__hasExternalTextures)
          Ht.rebindTextures(x, vt.get(x.texture).__webglTexture, vt.get(x.depthTexture).__webglTexture);
        else if (x.depthBuffer) {
          const bt = x.depthTexture;
          if (ut.__boundDepthTexture !== bt) {
            if (bt !== null && vt.has(bt) && (x.width !== bt.image.width || x.height !== bt.image.height))
              throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
            Ht.setupDepthRenderbuffer(x);
          }
        }
        const At = x.texture;
        (At.isData3DTexture || At.isDataArrayTexture || At.isCompressedArrayTexture) && (ct = !0);
        const Dt = vt.get(x).__webglFramebuffer;
        x.isWebGLCubeRenderTarget ? (Array.isArray(Dt[N]) ? O = Dt[N][G] : O = Dt[N], et = !0) : x.samples > 0 && Ht.useMultisampledRTT(x) === !1 ? O = vt.get(x).__webglMultisampledFramebuffer : Array.isArray(Dt) ? O = Dt[G] : O = Dt, P.copy(x.viewport), V.copy(x.scissor), X = x.scissorTest;
      } else
        P.copy(dt).multiplyScalar(D).floor(), V.copy(Wt).multiplyScalar(D).floor(), X = Qt;
      if (G !== 0 && (O = Bc), _t.bindFramebuffer(A.FRAMEBUFFER, O) && W && _t.drawBuffers(x, O), _t.viewport(P), _t.scissor(V), _t.setScissorTest(X), et) {
        const ut = vt.get(x.texture);
        A.framebufferTexture2D(A.FRAMEBUFFER, A.COLOR_ATTACHMENT0, A.TEXTURE_CUBE_MAP_POSITIVE_X + N, ut.__webglTexture, G);
      } else if (ct) {
        const ut = N;
        for (let At = 0; At < x.textures.length; At++) {
          const Dt = vt.get(x.textures[At]);
          A.framebufferTextureLayer(A.FRAMEBUFFER, A.COLOR_ATTACHMENT0 + At, Dt.__webglTexture, G, ut);
        }
      } else if (x !== null && G !== 0) {
        const ut = vt.get(x.texture);
        A.framebufferTexture2D(A.FRAMEBUFFER, A.COLOR_ATTACHMENT0, A.TEXTURE_2D, ut.__webglTexture, G);
      }
      M = -1;
    }, this.readRenderTargetPixels = function(x, N, G, W, O, et, ct, mt = 0) {
      if (!(x && x.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let ut = vt.get(x).__webglFramebuffer;
      if (x.isWebGLCubeRenderTarget && ct !== void 0 && (ut = ut[ct]), ut) {
        _t.bindFramebuffer(A.FRAMEBUFFER, ut);
        try {
          const At = x.textures[mt], Dt = At.format, bt = At.type;
          if (!Pt.textureFormatReadable(Dt)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!Pt.textureTypeReadable(bt)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          N >= 0 && N <= x.width - W && G >= 0 && G <= x.height - O && (x.textures.length > 1 && A.readBuffer(A.COLOR_ATTACHMENT0 + mt), A.readPixels(N, G, W, O, St.convert(Dt), St.convert(bt), et));
        } finally {
          const At = F !== null ? vt.get(F).__webglFramebuffer : null;
          _t.bindFramebuffer(A.FRAMEBUFFER, At);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(x, N, G, W, O, et, ct, mt = 0) {
      if (!(x && x.isWebGLRenderTarget))
        throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let ut = vt.get(x).__webglFramebuffer;
      if (x.isWebGLCubeRenderTarget && ct !== void 0 && (ut = ut[ct]), ut)
        if (N >= 0 && N <= x.width - W && G >= 0 && G <= x.height - O) {
          _t.bindFramebuffer(A.FRAMEBUFFER, ut);
          const At = x.textures[mt], Dt = At.format, bt = At.type;
          if (!Pt.textureFormatReadable(Dt))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
          if (!Pt.textureTypeReadable(bt))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
          const $t = A.createBuffer();
          A.bindBuffer(A.PIXEL_PACK_BUFFER, $t), A.bufferData(A.PIXEL_PACK_BUFFER, et.byteLength, A.STREAM_READ), x.textures.length > 1 && A.readBuffer(A.COLOR_ATTACHMENT0 + mt), A.readPixels(N, G, W, O, St.convert(Dt), St.convert(bt), 0);
          const te = F !== null ? vt.get(F).__webglFramebuffer : null;
          _t.bindFramebuffer(A.FRAMEBUFFER, te);
          const ge = A.fenceSync(A.SYNC_GPU_COMMANDS_COMPLETE, 0);
          return A.flush(), await sd(A, ge, 4), A.bindBuffer(A.PIXEL_PACK_BUFFER, $t), A.getBufferSubData(A.PIXEL_PACK_BUFFER, 0, et), A.deleteBuffer($t), A.deleteSync(ge), et;
        } else
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
    }, this.copyFramebufferToTexture = function(x, N = null, G = 0) {
      const W = Math.pow(2, -G), O = Math.floor(x.image.width * W), et = Math.floor(x.image.height * W), ct = N !== null ? N.x : 0, mt = N !== null ? N.y : 0;
      Ht.setTexture2D(x, 0), A.copyTexSubImage2D(A.TEXTURE_2D, G, 0, 0, ct, mt, O, et), _t.unbindTexture();
    };
    const zc = A.createFramebuffer(), Hc = A.createFramebuffer();
    this.copyTextureToTexture = function(x, N, G = null, W = null, O = 0, et = null) {
      et === null && (O !== 0 ? (Sr("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."), et = O, O = 0) : et = 0);
      let ct, mt, ut, At, Dt, bt, $t, te, ge;
      const ce = x.isCompressedTexture ? x.mipmaps[et] : x.image;
      if (G !== null)
        ct = G.max.x - G.min.x, mt = G.max.y - G.min.y, ut = G.isBox3 ? G.max.z - G.min.z : 1, At = G.min.x, Dt = G.min.y, bt = G.isBox3 ? G.min.z : 0;
      else {
        const rn = Math.pow(2, -O);
        ct = Math.floor(ce.width * rn), mt = Math.floor(ce.height * rn), x.isDataArrayTexture ? ut = ce.depth : x.isData3DTexture ? ut = Math.floor(ce.depth * rn) : ut = 1, At = 0, Dt = 0, bt = 0;
      }
      W !== null ? ($t = W.x, te = W.y, ge = W.z) : ($t = 0, te = 0, ge = 0);
      const re = St.convert(N.format), wt = St.convert(N.type);
      let fe;
      N.isData3DTexture ? (Ht.setTexture3D(N, 0), fe = A.TEXTURE_3D) : N.isDataArrayTexture || N.isCompressedArrayTexture ? (Ht.setTexture2DArray(N, 0), fe = A.TEXTURE_2D_ARRAY) : (Ht.setTexture2D(N, 0), fe = A.TEXTURE_2D), A.pixelStorei(A.UNPACK_FLIP_Y_WEBGL, N.flipY), A.pixelStorei(A.UNPACK_PREMULTIPLY_ALPHA_WEBGL, N.premultiplyAlpha), A.pixelStorei(A.UNPACK_ALIGNMENT, N.unpackAlignment);
      const jt = A.getParameter(A.UNPACK_ROW_LENGTH), Ze = A.getParameter(A.UNPACK_IMAGE_HEIGHT), Ei = A.getParameter(A.UNPACK_SKIP_PIXELS), Je = A.getParameter(A.UNPACK_SKIP_ROWS), rr = A.getParameter(A.UNPACK_SKIP_IMAGES);
      A.pixelStorei(A.UNPACK_ROW_LENGTH, ce.width), A.pixelStorei(A.UNPACK_IMAGE_HEIGHT, ce.height), A.pixelStorei(A.UNPACK_SKIP_PIXELS, At), A.pixelStorei(A.UNPACK_SKIP_ROWS, Dt), A.pixelStorei(A.UNPACK_SKIP_IMAGES, bt);
      const pe = x.isDataArrayTexture || x.isData3DTexture, nn = N.isDataArrayTexture || N.isData3DTexture;
      if (x.isDepthTexture) {
        const rn = vt.get(x), He = vt.get(N), qe = vt.get(rn.__renderTarget), xs = vt.get(He.__renderTarget);
        _t.bindFramebuffer(A.READ_FRAMEBUFFER, qe.__webglFramebuffer), _t.bindFramebuffer(A.DRAW_FRAMEBUFFER, xs.__webglFramebuffer);
        for (let ii = 0; ii < ut; ii++)
          pe && (A.framebufferTextureLayer(A.READ_FRAMEBUFFER, A.COLOR_ATTACHMENT0, vt.get(x).__webglTexture, O, bt + ii), A.framebufferTextureLayer(A.DRAW_FRAMEBUFFER, A.COLOR_ATTACHMENT0, vt.get(N).__webglTexture, et, ge + ii)), A.blitFramebuffer(At, Dt, ct, mt, $t, te, ct, mt, A.DEPTH_BUFFER_BIT, A.NEAREST);
        _t.bindFramebuffer(A.READ_FRAMEBUFFER, null), _t.bindFramebuffer(A.DRAW_FRAMEBUFFER, null);
      } else if (O !== 0 || x.isRenderTargetTexture || vt.has(x)) {
        const rn = vt.get(x), He = vt.get(N);
        _t.bindFramebuffer(A.READ_FRAMEBUFFER, zc), _t.bindFramebuffer(A.DRAW_FRAMEBUFFER, Hc);
        for (let qe = 0; qe < ut; qe++)
          pe ? A.framebufferTextureLayer(A.READ_FRAMEBUFFER, A.COLOR_ATTACHMENT0, rn.__webglTexture, O, bt + qe) : A.framebufferTexture2D(A.READ_FRAMEBUFFER, A.COLOR_ATTACHMENT0, A.TEXTURE_2D, rn.__webglTexture, O), nn ? A.framebufferTextureLayer(A.DRAW_FRAMEBUFFER, A.COLOR_ATTACHMENT0, He.__webglTexture, et, ge + qe) : A.framebufferTexture2D(A.DRAW_FRAMEBUFFER, A.COLOR_ATTACHMENT0, A.TEXTURE_2D, He.__webglTexture, et), O !== 0 ? A.blitFramebuffer(At, Dt, ct, mt, $t, te, ct, mt, A.COLOR_BUFFER_BIT, A.NEAREST) : nn ? A.copyTexSubImage3D(fe, et, $t, te, ge + qe, At, Dt, ct, mt) : A.copyTexSubImage2D(fe, et, $t, te, At, Dt, ct, mt);
        _t.bindFramebuffer(A.READ_FRAMEBUFFER, null), _t.bindFramebuffer(A.DRAW_FRAMEBUFFER, null);
      } else
        nn ? x.isDataTexture || x.isData3DTexture ? A.texSubImage3D(fe, et, $t, te, ge, ct, mt, ut, re, wt, ce.data) : N.isCompressedArrayTexture ? A.compressedTexSubImage3D(fe, et, $t, te, ge, ct, mt, ut, re, ce.data) : A.texSubImage3D(fe, et, $t, te, ge, ct, mt, ut, re, wt, ce) : x.isDataTexture ? A.texSubImage2D(A.TEXTURE_2D, et, $t, te, ct, mt, re, wt, ce.data) : x.isCompressedTexture ? A.compressedTexSubImage2D(A.TEXTURE_2D, et, $t, te, ce.width, ce.height, re, ce.data) : A.texSubImage2D(A.TEXTURE_2D, et, $t, te, ct, mt, re, wt, ce);
      A.pixelStorei(A.UNPACK_ROW_LENGTH, jt), A.pixelStorei(A.UNPACK_IMAGE_HEIGHT, Ze), A.pixelStorei(A.UNPACK_SKIP_PIXELS, Ei), A.pixelStorei(A.UNPACK_SKIP_ROWS, Je), A.pixelStorei(A.UNPACK_SKIP_IMAGES, rr), et === 0 && N.generateMipmaps && A.generateMipmap(fe), _t.unbindTexture();
    }, this.initRenderTarget = function(x) {
      vt.get(x).__webglFramebuffer === void 0 && Ht.setupRenderTarget(x);
    }, this.initTexture = function(x) {
      x.isCubeTexture ? Ht.setTextureCube(x, 0) : x.isData3DTexture ? Ht.setTexture3D(x, 0) : x.isDataArrayTexture || x.isCompressedArrayTexture ? Ht.setTexture2DArray(x, 0) : Ht.setTexture2D(x, 0), _t.unbindTexture();
    }, this.resetState = function() {
      R = 0, C = 0, F = null, _t.reset(), lt.reset();
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
    return Tn;
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
  set outputColorSpace(t) {
    this._outputColorSpace = t;
    const e = this.getContext();
    e.drawingBufferColorSpace = Kt._getDrawingBufferColorSpace(t), e.unpackColorSpace = Kt._getUnpackColorSpace();
  }
}
const Me = (i) => i / 1e3;
function Lg(i) {
  let t, e;
  function n() {
    t && (t.traverse((a) => {
      a.geometry?.dispose(), a.material && (a.material.map?.dispose(), a.material.dispose());
    }), t.removeFromParent(), t = null);
  }
  function r(a, o, l, c = 0.012) {
    const h = new Si(Me(a.width), Me(a.depth)), d = new Xe(h, new Mi({ color: o, transparent: !0, opacity: l, depthWrite: !1, side: ln }));
    d.rotation.set(-Math.PI / 2, 0, (a.rotation || 0) * Math.PI / 180), d.position.set(Me(a.x), c, Me(a.z)), t.add(d);
  }
  function s(a, o) {
    const l = new An(Me(a.width), Math.max(0.02, Me(a.height || 10)), Me(a.depth)), c = new fr(l);
    l.dispose();
    const h = new qi(c, new Qn({ color: o, transparent: !0, opacity: 0.9, depthTest: !1 }));
    h.position.set(Me(a.x), Math.max(0.02, Me(a.height || 10)) / 2 + 0.025, Me(a.z)), h.rotation.y = -(a.rotation || 0) * Math.PI / 180, h.renderOrder = 30, t.add(h);
  }
  return {
    update(a, o, l = [], c = []) {
      const h = JSON.stringify([a.zones, a.clearance, a.placements, o.map((d) => [d.id, d.width, d.depth, d.height]), l, c]);
      if (h !== e) {
        e = h, n(), t = new en(), i.scene.add(t);
        for (const d of a.zones || []) {
          r(d, d.color, 0.2);
          const f = document.createElement("canvas");
          f.width = 1024, f.height = 128;
          const p = f.getContext("2d");
          p.font = "bold 60px sans-serif", p.textAlign = "center", p.textBaseline = "middle", p.fillStyle = d.color, p.fillText(d.name, 512, 64, 1e3);
          const g = new Ga(f), _ = new Xe(new Si(Me(d.width) * 0.85, Math.min(Me(d.depth) * 0.4, Me(d.width) * 0.10625)), new Mi({ map: g, transparent: !0, depthWrite: !1, side: ln }));
          _.rotation.x = -Math.PI / 2, _.position.set(Me(d.x), 0.019, Me(d.z)), t.add(_);
        }
        if (a.clearance?.enabled) for (const d of a.placements) {
          const f = o.find((_) => _.id === d.rack_id);
          if (!f) continue;
          const p = { ...d, ...Fe(f, d) }, g = pr(p, a.clearance);
          r(g, "#d69b24", 0.13, 0.021);
        }
        for (const d of l)
          d.old && s(d.old, "#e66c59"), d.current && s(d.current, d.type === "added" ? "#19a783" : "#dda323");
        for (const d of c) {
          const f = d.ends.filter((g) => g.side === "A"), p = d.ends.filter((g) => g.side === "B");
          for (const g of f) for (const _ of p) {
            const m = a.placements.find((M) => M.rack_id === g.rack_id), u = a.placements.find((M) => M.rack_id === _.rack_id);
            if (!m || !u) continue;
            const T = o.find((M) => M.id === m.rack_id), b = o.find((M) => M.id === u.rack_id);
            if (!T || !b) continue;
            const y = new I(Me(m.x), Me(Fe(T, m).height) + 0.08, Me(m.z)), w = new I(Me(u.x), Me(Fe(b, u).height) + 0.08, Me(u.z)), R = y.clone().add(w).multiplyScalar(0.5);
            R.y = Math.max(y.y, w.y) + 0.5, m.rack_id === u.rack_id && (R.x += 0.5);
            const C = new kd(y, R, w), F = new uc(new hn().setFromPoints(C.getPoints(30)), new Qn({ color: /^#[0-9a-fA-F]{6}$/.test(d.color) ? d.color : "#168a87", depthTest: !1 }));
            F.renderOrder = 31, t.add(F);
          }
        }
        i.draw();
      }
    },
    dispose: n
  };
}
const me = (i) => String(i ?? "").replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]), Ig = ["통로", "구역", "변경 비교", "열 배치", "참조 정리", "시점", "배치안", "케이블"], ue = (i, t, e = !1, n = "") => `<button type="button" class="r3-btn small" data-op="${i}" data-id="${me(n)}" ${e ? "disabled" : ""}>${t}</button>`, pn = (i, t, e, n = 0, r = 1e5) => `<label>${t}<input name="${i}" type="number" value="${me(e)}" min="${n}" max="${r}" step="any" required></label>`;
function Ug(i, t) {
  const e = document.createElement("button");
  e.type = "button", e.id = "r3-operations-open", e.className = "r3-btn small", e.textContent = "운영 도구", i.querySelector(".r3-tools").append(e);
  const n = document.createElement("dialog");
  n.className = "r3-operations", n.id = "r3-operations", n.innerHTML = `<div class="r3-dialog-title"><h2>운영 도구</h2>${ue("close", "닫기")}</div><div class="r3-operation-tabs" role="tablist" aria-label="운영 도구">${Ig.map((U, k) => `<button class="r3-btn small" role="tab" data-tab="${k}" aria-selected="false">${k + 1}. ${U}</button>`).join("")}</div><form class="r3-operation-body"></form><div class="r3-operation-status" role="status" aria-live="polite"></div>`, i.append(n);
  const r = n.querySelector("form"), s = n.querySelector("[role=status]");
  let a = 0, o, l, c = [], h = null, d = null, f = [], p = !1, g = null, _ = !1;
  const m = Lg(t().scene), u = (U = "", k = !1) => {
    s.textContent = U, s.classList.toggle("error", k);
  }, T = (U) => r.elements.namedItem(U)?.value, b = (U) => Number(T(U)), y = () => `room3d-camera-v1-${t().locationId}`;
  function w() {
    try {
      const U = JSON.parse(localStorage.getItem(y()) || "[]");
      return Array.isArray(U) ? U.filter((k) => Ar(k.camera)).slice(0, 20) : [];
    } catch {
      return [];
    }
  }
  function R() {
    const U = t().scene, k = { mode: U.mode, position: U.camera.position.toArray(), target: U.controls.target.toArray() };
    if (!Ar(k)) throw new Error("워킹 모드를 종료한 뒤 시점을 저장하세요.");
    return k;
  }
  function C(U) {
    if (!Ar(U)) throw new Error("유효하지 않은 시점입니다.");
    const k = t();
    k.view(U.mode), k.scene.camera.position.fromArray(U.position), k.scene.controls.target.fromArray(U.target), k.scene.controls.update(), k.scene.draw();
  }
  function F(U, k = !0) {
    const H = t();
    if (!H.editable) throw new Error("읽기 전용입니다.");
    if (k) {
      const B = Rn(U, H.racks);
      if (B.length) throw new Error(B.slice(0, 3).join(" / "));
    }
    H.apply(U), u("편집본에 적용했습니다. 배치 저장을 눌러 확정하세요.");
  }
  function M() {
    const U = t();
    if (!U.layout) return;
    const k = U.layout, H = !U.editable || p;
    if (n.querySelectorAll("[data-tab]").forEach((B) => {
      B.setAttribute("aria-selected", String(Number(B.dataset.tab) === a)), B.disabled = p;
    }), a === 0) {
      const B = k.clearance || { enabled: !1, front: 1e3, rear: 800 };
      r.innerHTML = `<p>랙 전면·후면 작업 공간을 확보합니다. 작업 공간끼리는 공유할 수 있지만 랙·장애물이 침범하면 저장을 차단합니다.</p><label class="r3-check"><input name="enabled" type="checkbox" ${B.enabled ? "checked" : ""}> 통로 검사 사용</label><div class="r3-operation-grid">${pn("front", "전면 여유 (mm)", B.front, 0, 1e4)}${pn("rear", "후면 여유 (mm)", B.rear, 0, 1e4)}</div>${ue("clearance", "설정 적용", H)}<p class="r3-help">적용 후 경고가 있으면 좌표를 수정하거나 화면의 겹침 자동 수정을 사용하세요. 노란 음영은 작업 공간입니다.</p>`;
    } else if (a === 1) {
      const B = (k.zones || []).find((D) => D.id === g);
      r.innerHTML = `<p>구역은 바닥 표시 전용입니다. 랙 배치·워킹 이동을 막지 않습니다.</p><div class="r3-operation-list">${(k.zones || []).map((D) => `<div class="r3-operation-row"><strong>${me(D.name)}</strong> · ${D.width} × ${D.depth} mm ${ue("zone-edit", "편집", H, D.id)}${ue("zone-delete", "삭제", H, D.id)}</div>`).join("") || "등록된 구역 없음"}</div><label>구역 이름<input name="name" maxlength="100" required value="${me(B?.name || "")}"></label><label>색상<input name="color" type="color" value="${me(B?.color || "#277f9a")}"></label><div class="r3-operation-grid">${pn("x", "좌측 X (mm)", B ? B.x - B.width / 2 : 0)}${pn("z", "상단 Z (mm)", B ? B.z - B.depth / 2 : 0)}${pn("width", "폭 (mm)", B?.width || Math.min(3e3, k.width), 100)}${pn("depth", "깊이 (mm)", B?.depth || Math.min(2e3, k.depth), 100)}</div><div>${ue("zone-save", B ? "구역 수정" : "구역 추가", H)}${ue("zone-new", "새 구역", H)}</div>`;
    } else if (a === 2) {
      const B = wo(d || U.baseline, k, U.racks);
      r.innerHTML = `<p>기준: ${d ? "선택한 배치안" : "마지막 저장본"} / 비교 대상: 현재 편집본</p><p class="r3-zone-legend">빨강: 이전 위치·삭제 / 초록: 추가 / 노랑: 변경</p><div>${ue("diff-show", "3D 비교 표시")}${ue("diff-clear", "비교 표시 끄기")}${ue("diff-baseline", "저장본을 기준으로")}</div><div class="r3-operation-list">${B.map((D) => `<div class="r3-operation-row"><strong>${me(D.name || D.key)}</strong> · ${me({ added: "추가", removed: "삭제", changed: "변경", setting: "설정 변경" }[D.type])}${D.fields ? `<br>${me(D.fields.join(", "))}` : ""}</div>`).join("") || "변경 사항이 없습니다."}</div>`;
    } else if (a === 3) {
      const B = new Set(k.placements.map((j) => j.rack_id)), D = U.racks.filter((j) => !B.has(j.id));
      r.innerHTML = `<p>미배치 랙을 선택한 순서가 아닌 라이브러리 순서로 배치합니다. 좌표는 첫 랙의 좌측 상단 기준입니다. 실패하면 전체 배치를 유지합니다.</p><div class="r3-operation-list">${D.map((j) => `<label class="r3-check"><input type="checkbox" name="racks" value="${j.id}" checked> ${me(j.name)} · ${j.width} × ${j.depth} mm</label>`).join("") || "미배치 랙이 없습니다."}</div><div class="r3-operation-grid">${pn("x", "시작 X (mm)", 0)}${pn("z", "시작 Z (mm)", 0)}${pn("columns", "한 행의 랙 개수", 4, 1, 1e3)}${pn("gapX", "열 사이 간격 (mm)", 600)}${pn("gapZ", "행 사이 간격 (mm)", 1200)}<label>방향<select name="rotation" class="no-ts">${[0, 90, 180, 270].map((j) => `<option value="${j}">${j}도</option>`).join("")}</select></label></div>${ue("rows", "선택 랙 일괄 배치", H || !D.length)}`;
    } else if (a === 4)
      r.innerHTML = `<p>관리자 전용: 삭제되거나 다른 Location으로 이동한 랙의 배치 참조, 남은 장비 표시 설정과 이미지 참조를 정리합니다. NetBox 랙·장비 자체는 삭제하지 않습니다. 대체 배치안은 유지됩니다.</p>${ue("cleanup-preview", "정리 대상 미리보기", !U.canCleanup || p)}${h ? `<div class="r3-operation-row">랙 ID: ${me(h.changes.rack_ids.join(", ") || "없음")}<br>장비 표시 ID: ${me(h.changes.device_ids.join(", ") || "없음")}<br>이미지 참조: ${me(h.changes.images.join(", ") || "없음")}</div>${ue("cleanup-apply", "확인 후 참조 정리", !U.canCleanup || p || !Object.values(h.changes).some((B) => B.length))}` : ""}${U.canCleanup ? "" : "<p>NetBox 슈퍼유저로 저장된 배치를 열어야 사용할 수 있습니다.</p>"}`;
    else if (a === 5)
      r.innerHTML = `<p>즐겨찾기는 현재 브라우저·Location별로 저장됩니다. 공유 링크는 시점만 포함하며 NetBox 조회 권한을 우회하지 않습니다.</p><label>시점 이름<input name="name" maxlength="100" value="기본 시점"></label><div>${ue("camera-save", "현재 시점 저장")}${ue("camera-share", "공유 링크 만들기")}</div><label>공유 링크<input name="share" readonly aria-label="시점 공유 링크"></label><div class="r3-operation-list">${w().map((B) => `<div class="r3-operation-row">${me(B.name)} ${ue("camera-load", "이동", !1, B.id)}${ue("camera-delete", "삭제", !1, B.id)}</div>`).join("")}</div>`;
    else if (a === 6)
      r.innerHTML = `<p>Location마다 최대 10개의 배치안을 저장합니다. 불러온 안은 편집본이며 배치 저장을 눌러야 현재 배치가 바뀝니다.</p><label>새 배치안 이름<input name="name" maxlength="100" placeholder="예: 증설 검토안"></label><div>${ue("plan-create", "현재 편집본을 배치안으로 저장", H)}${ue("plans", "목록 새로고침", p)}</div><div class="r3-operation-list">${c.map((B) => `<div class="r3-operation-row"><strong>${me(B.name)}</strong><br>${me(B.saved_at)}${B.valid ? "" : "<p>참조가 유효하지 않은 배치안입니다.</p>"}<div>${ue("plan-load", "불러오기", H || !B.valid, B.id)}${ue("plan-compare", "현재 편집본과 비교", !B.valid, B.id)}${ue("plan-rename", "이름 변경", H, B.id)}${ue("plan-delete", "삭제", H, B.id)}</div></div>`).join("") || "목록 새로고침으로 저장된 배치안을 조회하세요."}</div>`;
    else {
      const B = U.racks.flatMap((D) => D.devices).find((D) => D.id === U.selected?.deviceId);
      r.innerHTML = `<p>선택 장비: <strong>${me(B?.name || "3D 화면에서 장비를 먼저 선택하세요")}</strong></p><p>직접 연결된 케이블만 조회합니다. 패치 패널을 통과한 전체 경로 추적은 포함하지 않습니다. 선은 랙 간 연결 개요이며 실제 케이블 경로·길이가 아닙니다.</p><div>${ue("cables", "선택 장비 케이블 조회", p || !B)}${ue("cables-clear", "연결선 숨기기")}</div><div class="r3-operation-list">${f.map((D) => {
        const j = Ya(D.url);
        return `<div class="r3-operation-row"><strong>${j ? `<a href="${me(j)}" target="_blank" rel="noopener noreferrer">${me(D.label)}</a>` : me(D.label)}</strong> · ${me(D.status)}<br>${D.ends.map((at) => `${me(at.side)}: ${me(at.device)} / ${me(at.port)}${k.placements.some((dt) => dt.rack_id === at.rack_id) ? "" : " (방 밖 또는 미배치)"}`).join("<br>")}</div>`;
      }).join("") || "조회 결과가 없습니다."}</div>`;
    }
  }
  let S = !1;
  function P() {
    const U = t();
    if (e.disabled = !U.layout || U.busy, !!U.layout && (o !== U.locationId && (o = U.locationId, c = [], h = null, d = null, f = [], S = !1, g = null, n.open && (M(), u())), l !== U.selected?.deviceId && (l = U.selected?.deviceId, f = [], n.open && a === 7 && M()), m.update(U.layout, U.racks, S ? wo(d || U.baseline, U.layout, U.racks) : [], f), !_)) {
      _ = !0;
      try {
        const k = new URLSearchParams(window.location.hash.slice(1)).get("view");
        if (k && k.length < 2e3) {
          const H = JSON.parse(k);
          Ar(H) && requestAnimationFrame(() => {
            o === U.locationId && C(H);
          });
        }
      } catch {
      }
    }
  }
  async function V(U, k, H = "") {
    const B = t(), D = B.locationId, j = JSON.stringify(B.layout);
    p = !0, B.setBusy(!0), M();
    try {
      const at = await th(B, U, k, H);
      if (t().locationId !== D || JSON.stringify(t().layout) !== j) throw new Error("화면이 변경되었습니다. 다시 조회하세요.");
      return at;
    } finally {
      p = !1, B.setBusy(!1);
    }
  }
  async function X(U, k) {
    const H = t(), B = structuredClone(H.layout);
    if (U === "close") {
      n.close();
      return;
    }
    if (!p) {
      if (U === "clearance") {
        if (!r.reportValidity()) return;
        B.clearance = { enabled: r.elements.enabled.checked, front: b("front"), rear: b("rear") }, F(B, !1);
      }
      if (U === "zone-edit" && (g = k, M()), U === "zone-new" && (g = null, M()), U === "zone-save") {
        if (!r.reportValidity()) return;
        const D = { id: g || crypto.randomUUID(), name: T("name").trim(), color: T("color"), width: b("width"), depth: b("depth"), x: b("x") + b("width") / 2, z: b("z") + b("depth") / 2 };
        B.zones = [...(B.zones || []).filter((j) => j.id !== D.id), D], F(B), g = null, M();
      }
      if (U === "zone-delete" && (B.zones = (B.zones || []).filter((D) => D.id !== k), F(B), g = null, M()), U === "diff-show" && (S = !0, P(), u("비교 표시를 켰습니다. 닫기를 누르면 3D 화면에서 확인할 수 있습니다.")), U === "diff-clear" && (S = !1, P()), U === "diff-baseline" && (d = null, M(), P()), U === "rows") {
        if (!r.reportValidity()) return;
        F(Qc(B, H.racks, [...r.querySelectorAll("input[name=racks]:checked")].map((D) => Number(D.value)), { x: b("x"), z: b("z"), columns: b("columns"), gapX: b("gapX"), gapZ: b("gapZ"), rotation: b("rotation") })), M();
      }
      if (U === "cleanup-preview" && (h = await V("cleanup"), M(), u("대상을 확인하세요. 저장하지 않은 변경은 실행 시 폐기됩니다.")), U === "cleanup-apply") {
        if (!h || !confirm("표시한 참조를 정리하고 저장하지 않은 편집을 버릴까요? NetBox 랙이나 장비 자체는 삭제하지 않습니다.")) return;
        const D = await V("cleanup", { revision: h.revision, token: h.token, confirm: !0 });
        t().replace(D), h = null, M(), u("참조를 정리하고 저장했습니다.");
      }
      if (U === "camera-save") {
        const D = T("name").trim();
        if (!D || D.length > 100) throw new Error("이름을 1~100자로 입력하세요.");
        const j = w();
        if (j.length >= 20) throw new Error("시점은 최대 20개입니다.");
        j.push({ id: crypto.randomUUID(), name: D, camera: R() }), localStorage.setItem(y(), JSON.stringify(j)), M(), u("현재 브라우저에 시점을 저장했습니다.");
      }
      if (U === "camera-load") {
        const D = w().find((j) => j.id === k);
        D && C(D.camera);
      }
      if (U === "camera-delete" && (localStorage.setItem(y(), JSON.stringify(w().filter((D) => D.id !== k))), M()), U === "camera-share") {
        const D = new URL(window.location.href);
        D.searchParams.set("location", H.locationId), D.hash = new URLSearchParams({ view: JSON.stringify(R()) }).toString(), r.elements.share.value = D.href, r.elements.share.select(), u("공유 링크를 선택했습니다. 복사해서 전달하세요.");
      }
      if (U === "plans" && (c = (await V("plans")).plans, M()), ["plan-create", "plan-rename", "plan-delete"].includes(U)) {
        if (!H.editable) throw new Error("읽기 전용입니다.");
        const D = U.slice(5), j = { action: D, id: k, revision: H.layout.revision };
        if (D === "create") {
          j.name = T("name"), j.layout = H.layout;
          const dt = Rn(H.layout, H.racks);
          if (dt.length) throw new Error(dt.join(" / "));
        }
        if (D === "rename" && (j.name = prompt("새 배치안 이름", c.find((dt) => dt.id === k)?.name), j.name === null) || D === "delete" && !confirm("이 배치안을 삭제할까요? 현재 배치는 유지됩니다.")) return;
        const at = await V("plans", j);
        t().revision(at.revision), c = at.plans, M(), u("배치안 목록을 저장했습니다. 현재 편집본은 유지됩니다.");
      }
      if (U === "plan-load") {
        const D = c.find((j) => j.id === k);
        D?.valid && confirm("현재 편집본을 선택한 배치안으로 바꿀까요? 적용 후 배치 저장이 필요합니다.") && (await H.restore(D.layout), M(), u("배치안을 편집본으로 불러왔습니다. 배치 저장으로 확정하세요."));
      }
      if (U === "plan-compare" && (d = structuredClone(c.find((D) => D.id === k)?.layout), d && (a = 2, S = !0, M(), P())), U === "cables") {
        const D = await V("cables", void 0, `?device=${H.selected.deviceId}`);
        f = D.cables, M(), P(), u(D.demo ? "데모에는 실제 NetBox 케이블이 없습니다." : `${f.length}개 직접 연결${D.truncated ? " (최대 500개)" : ""}`);
      }
      U === "cables-clear" && (f = [], P(), M());
    }
  }
  return e.addEventListener("click", () => {
    P(), M(), u(), n.showModal();
  }), n.addEventListener("click", (U) => {
    const k = U.target.closest("button");
    if (k) {
      if (k.dataset.tab !== void 0 && !p) {
        a = Number(k.dataset.tab), M(), u();
        return;
      }
      k.dataset.op && X(k.dataset.op, k.dataset.id).catch((H) => {
        M(), u(H.message, !0);
      });
    }
  }), r.addEventListener("submit", (U) => U.preventDefault()), n.addEventListener("cancel", (U) => {
    p && U.preventDefault();
  }), { refresh: P, dispose: () => {
    m.dispose(), n.remove(), e.remove();
  } };
}
const Ng = [[1, 0], [-1, 0], [0, 1], [0, -1]], Ec = (i, t, e) => ({ ...i, x: i.x + t, z: i.z + e }), lo = (i, t) => {
  const e = Ee(pr(i, t.clearance));
  return e[0] >= 0 && e[1] >= 0 && e[2] <= t.width && e[3] <= t.depth;
};
function bc(i, t) {
  const e = Rn(i, t);
  if (e.length) throw new Error(e.slice(0, 3).join(" / "));
  return i;
}
function Tc(i, t, e, n) {
  const r = t.kind === "rack" ? i.placements.find((s) => s.rack_id === t.rack_id) : i.blocks.find((s) => s.id === t.id);
  r.x = t.x + e, r.z = t.z + n;
}
function Ll(i, t, e, n) {
  const r = n[0] ? 0 : 1, s = n[r];
  let a = 0;
  for (let o = 0; o <= Math.min(512, i.length * t.length + 1); o++) {
    const l = i.map((h) => Ec(h, n[0] * a, n[1] * a));
    if (l.some((h) => !lo(h, e))) return null;
    let c = 0;
    for (const h of l) for (const d of t)
      for (const [f, p] of $a(h, d, e.clearance)) {
        if (!dr(f, p)) continue;
        const g = Ee(f), _ = Ee(p);
        c = Math.max(c, s > 0 ? _[r + 2] - g[r] : g[r + 2] - _[r]);
      }
    if (!c) return { x: n[0] * a, z: n[1] * a, distance: a };
    a += c;
  }
  return null;
}
function wc(i, t, e, n) {
  if (n) {
    const r = Ll(i, t, e, n);
    if (r) return r;
  }
  return Ng.map((r) => Ll(i, t, e, r)).filter(Boolean).sort((r, s) => r.distance - s.distance)[0];
}
function co(i, t, e, n) {
  const r = structuredClone(t), s = Cn(r, e), a = s.filter((p) => n.includes(p.key)), o = s.filter((p) => !n.includes(p.key));
  if (!a.length) throw new Error("이동할 대상을 선택하세요.");
  if (a.some((p) => p.locked)) throw new Error("잠긴 랙은 자동으로 이동할 수 없습니다.");
  if (a.some((p) => !lo(p, r))) throw new Error("서버실 경계를 벗어납니다. 이전 위치를 유지합니다.");
  const l = Cn(i, e).find((p) => p.key === a[0].key), c = l ? a[0].x - l.x : 0, h = l ? a[0].z - l.z : 0, d = c || h ? Math.abs(c) >= Math.abs(h) ? [-Math.sign(c), 0] : [0, -Math.sign(h)] : null, f = wc(a, o, r, d);
  if (!f) throw new Error("겹침을 피할 공간이 부족합니다. 이전 위치를 유지합니다.");
  return a.forEach((p) => Tc(r, p, f.x, f.z)), bc(r, e);
}
function Fg(i, t) {
  const e = structuredClone(i), n = Cn(e, t), r = n.filter((s) => s.locked);
  if (r.some((s, a) => !lo(s, e) || r.slice(0, a).some((o) => $a(s, o, e.clearance).some(([l, c]) => dr(l, c)))))
    throw new Error("잠긴 랙끼리 겹치거나 경계를 벗어납니다. 잠금을 해제하고 다시 시도하세요.");
  for (const s of n.filter((a) => !a.locked)) {
    const a = wc([s], r, e);
    if (!a) throw new Error("겹침을 자동 수정할 공간을 찾지 못했습니다. 배치를 변경하지 않았습니다.");
    Tc(e, s, a.x, a.z), r.push(Ec(s, a.x, a.z));
  }
  return bc(e, t);
}
const Og = "0.2.0", kg = {
  version: Og
}, Il = { type: "change" }, ho = { type: "start" }, Ac = { type: "end" }, ts = new ms(), Ul = new Bn(), Bg = Math.cos(70 * ic.DEG2RAD), be = new I(), Ye = 2 * Math.PI, ie = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6
}, Qs = 1e-6;
class zg extends qd {
  /**
   * Constructs a new controls instance.
   *
   * @param {Object3D} object - The object that is managed by the controls.
   * @param {?HTMLDOMElement} domElement - The HTML element used for event listeners.
   */
  constructor(t, e = null) {
    super(t, e), this.state = ie.NONE, this.target = new I(), this.cursor = new I(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" }, this.mouseButtons = { LEFT: Gi.ROTATE, MIDDLE: Gi.DOLLY, RIGHT: Gi.PAN }, this.touches = { ONE: zi.ROTATE, TWO: zi.DOLLY_PAN }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new I(), this._lastQuaternion = new vi(), this._lastTargetPosition = new I(), this._quat = new vi().setFromUnitVectors(t.up, new I(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new al(), this._sphericalDelta = new al(), this._scale = 1, this._panOffset = new I(), this._rotateStart = new It(), this._rotateEnd = new It(), this._rotateDelta = new It(), this._panStart = new It(), this._panEnd = new It(), this._panDelta = new It(), this._dollyStart = new It(), this._dollyEnd = new It(), this._dollyDelta = new It(), this._dollyDirection = new I(), this._mouse = new It(), this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = Vg.bind(this), this._onPointerDown = Hg.bind(this), this._onPointerUp = Gg.bind(this), this._onContextMenu = Kg.bind(this), this._onMouseWheel = $g.bind(this), this._onKeyDown = qg.bind(this), this._onTouchStart = Yg.bind(this), this._onTouchMove = jg.bind(this), this._onMouseDown = Wg.bind(this), this._onMouseMove = Xg.bind(this), this._interceptControlDown = Zg.bind(this), this._interceptControlUp = Jg.bind(this), this.domElement !== null && this.connect(this.domElement), this.update();
  }
  connect(t) {
    super.connect(t), this.domElement.addEventListener("pointerdown", this._onPointerDown), this.domElement.addEventListener("pointercancel", this._onPointerUp), this.domElement.addEventListener("contextmenu", this._onContextMenu), this.domElement.addEventListener("wheel", this._onMouseWheel, { passive: !1 }), this.domElement.getRootNode().addEventListener("keydown", this._interceptControlDown, { passive: !0, capture: !0 }), this.domElement.style.touchAction = "none";
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
  listenToKeyEvents(t) {
    t.addEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = t;
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
    this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(Il), this.update(), this.state = ie.NONE;
  }
  update(t = null) {
    const e = this.object.position;
    be.copy(e).sub(this.target), be.applyQuaternion(this._quat), this._spherical.setFromVector3(be), this.autoRotate && this.state === ie.NONE && this._rotateLeft(this._getAutoRotationAngle(t)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
    let n = this.minAzimuthAngle, r = this.maxAzimuthAngle;
    isFinite(n) && isFinite(r) && (n < -Math.PI ? n += Ye : n > Math.PI && (n -= Ye), r < -Math.PI ? r += Ye : r > Math.PI && (r -= Ye), n <= r ? this._spherical.theta = Math.max(n, Math.min(r, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (n + r) / 2 ? Math.max(n, this._spherical.theta) : Math.min(r, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0 ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
    let s = !1;
    if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera)
      this._spherical.radius = this._clampDistance(this._spherical.radius);
    else {
      const a = this._spherical.radius;
      this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), s = a != this._spherical.radius;
    }
    if (be.setFromSpherical(this._spherical), be.applyQuaternion(this._quatInverse), e.copy(this.target).add(be), this.object.lookAt(this.target), this.enableDamping === !0 ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
      let a = null;
      if (this.object.isPerspectiveCamera) {
        const o = be.length();
        a = this._clampDistance(o * this._scale);
        const l = o - a;
        this.object.position.addScaledVector(this._dollyDirection, l), this.object.updateMatrixWorld(), s = !!l;
      } else if (this.object.isOrthographicCamera) {
        const o = new I(this._mouse.x, this._mouse.y, 0);
        o.unproject(this.object);
        const l = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), s = l !== this.object.zoom;
        const c = new I(this._mouse.x, this._mouse.y, 0);
        c.unproject(this.object), this.object.position.sub(c).add(o), this.object.updateMatrixWorld(), a = be.length();
      } else
        console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
      a !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position) : (ts.origin.copy(this.object.position), ts.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(ts.direction)) < Bg ? this.object.lookAt(this.target) : (Ul.setFromNormalAndCoplanarPoint(this.object.up, this.target), ts.intersectPlane(Ul, this.target))));
    } else if (this.object.isOrthographicCamera) {
      const a = this.object.zoom;
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), a !== this.object.zoom && (this.object.updateProjectionMatrix(), s = !0);
    }
    return this._scale = 1, this._performCursorZoom = !1, s || this._lastPosition.distanceToSquared(this.object.position) > Qs || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > Qs || this._lastTargetPosition.distanceToSquared(this.target) > Qs ? (this.dispatchEvent(Il), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1;
  }
  _getAutoRotationAngle(t) {
    return t !== null ? Ye / 60 * this.autoRotateSpeed * t : Ye / 60 / 60 * this.autoRotateSpeed;
  }
  _getZoomScale(t) {
    const e = Math.abs(t * 0.01);
    return Math.pow(0.95, this.zoomSpeed * e);
  }
  _rotateLeft(t) {
    this._sphericalDelta.theta -= t;
  }
  _rotateUp(t) {
    this._sphericalDelta.phi -= t;
  }
  _panLeft(t, e) {
    be.setFromMatrixColumn(e, 0), be.multiplyScalar(-t), this._panOffset.add(be);
  }
  _panUp(t, e) {
    this.screenSpacePanning === !0 ? be.setFromMatrixColumn(e, 1) : (be.setFromMatrixColumn(e, 0), be.crossVectors(this.object.up, be)), be.multiplyScalar(t), this._panOffset.add(be);
  }
  // deltaX and deltaY are in pixels; right and down are positive
  _pan(t, e) {
    const n = this.domElement;
    if (this.object.isPerspectiveCamera) {
      const r = this.object.position;
      be.copy(r).sub(this.target);
      let s = be.length();
      s *= Math.tan(this.object.fov / 2 * Math.PI / 180), this._panLeft(2 * t * s / n.clientHeight, this.object.matrix), this._panUp(2 * e * s / n.clientHeight, this.object.matrix);
    } else this.object.isOrthographicCamera ? (this._panLeft(t * (this.object.right - this.object.left) / this.object.zoom / n.clientWidth, this.object.matrix), this._panUp(e * (this.object.top - this.object.bottom) / this.object.zoom / n.clientHeight, this.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), this.enablePan = !1);
  }
  _dollyOut(t) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale /= t : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1);
  }
  _dollyIn(t) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale *= t : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1);
  }
  _updateZoomParameters(t, e) {
    if (!this.zoomToCursor)
      return;
    this._performCursorZoom = !0;
    const n = this.domElement.getBoundingClientRect(), r = t - n.left, s = e - n.top, a = n.width, o = n.height;
    this._mouse.x = r / a * 2 - 1, this._mouse.y = -(s / o) * 2 + 1, this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();
  }
  _clampDistance(t) {
    return Math.max(this.minDistance, Math.min(this.maxDistance, t));
  }
  //
  // event callbacks - update the object state
  //
  _handleMouseDownRotate(t) {
    this._rotateStart.set(t.clientX, t.clientY);
  }
  _handleMouseDownDolly(t) {
    this._updateZoomParameters(t.clientX, t.clientX), this._dollyStart.set(t.clientX, t.clientY);
  }
  _handleMouseDownPan(t) {
    this._panStart.set(t.clientX, t.clientY);
  }
  _handleMouseMoveRotate(t) {
    this._rotateEnd.set(t.clientX, t.clientY), this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const e = this.domElement;
    this._rotateLeft(Ye * this._rotateDelta.x / e.clientHeight), this._rotateUp(Ye * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
  }
  _handleMouseMoveDolly(t) {
    this._dollyEnd.set(t.clientX, t.clientY), this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart), this._dollyDelta.y > 0 ? this._dollyOut(this._getZoomScale(this._dollyDelta.y)) : this._dollyDelta.y < 0 && this._dollyIn(this._getZoomScale(this._dollyDelta.y)), this._dollyStart.copy(this._dollyEnd), this.update();
  }
  _handleMouseMovePan(t) {
    this._panEnd.set(t.clientX, t.clientY), this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd), this.update();
  }
  _handleMouseWheel(t) {
    this._updateZoomParameters(t.clientX, t.clientY), t.deltaY < 0 ? this._dollyIn(this._getZoomScale(t.deltaY)) : t.deltaY > 0 && this._dollyOut(this._getZoomScale(t.deltaY)), this.update();
  }
  _handleKeyDown(t) {
    let e = !1;
    switch (t.code) {
      case this.keys.UP:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateUp(Ye * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), e = !0;
        break;
      case this.keys.BOTTOM:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateUp(-Ye * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), e = !0;
        break;
      case this.keys.LEFT:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateLeft(Ye * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), e = !0;
        break;
      case this.keys.RIGHT:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateLeft(-Ye * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), e = !0;
        break;
    }
    e && (t.preventDefault(), this.update());
  }
  _handleTouchStartRotate(t) {
    if (this._pointers.length === 1)
      this._rotateStart.set(t.pageX, t.pageY);
    else {
      const e = this._getSecondPointerPosition(t), n = 0.5 * (t.pageX + e.x), r = 0.5 * (t.pageY + e.y);
      this._rotateStart.set(n, r);
    }
  }
  _handleTouchStartPan(t) {
    if (this._pointers.length === 1)
      this._panStart.set(t.pageX, t.pageY);
    else {
      const e = this._getSecondPointerPosition(t), n = 0.5 * (t.pageX + e.x), r = 0.5 * (t.pageY + e.y);
      this._panStart.set(n, r);
    }
  }
  _handleTouchStartDolly(t) {
    const e = this._getSecondPointerPosition(t), n = t.pageX - e.x, r = t.pageY - e.y, s = Math.sqrt(n * n + r * r);
    this._dollyStart.set(0, s);
  }
  _handleTouchStartDollyPan(t) {
    this.enableZoom && this._handleTouchStartDolly(t), this.enablePan && this._handleTouchStartPan(t);
  }
  _handleTouchStartDollyRotate(t) {
    this.enableZoom && this._handleTouchStartDolly(t), this.enableRotate && this._handleTouchStartRotate(t);
  }
  _handleTouchMoveRotate(t) {
    if (this._pointers.length == 1)
      this._rotateEnd.set(t.pageX, t.pageY);
    else {
      const n = this._getSecondPointerPosition(t), r = 0.5 * (t.pageX + n.x), s = 0.5 * (t.pageY + n.y);
      this._rotateEnd.set(r, s);
    }
    this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const e = this.domElement;
    this._rotateLeft(Ye * this._rotateDelta.x / e.clientHeight), this._rotateUp(Ye * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd);
  }
  _handleTouchMovePan(t) {
    if (this._pointers.length === 1)
      this._panEnd.set(t.pageX, t.pageY);
    else {
      const e = this._getSecondPointerPosition(t), n = 0.5 * (t.pageX + e.x), r = 0.5 * (t.pageY + e.y);
      this._panEnd.set(n, r);
    }
    this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd);
  }
  _handleTouchMoveDolly(t) {
    const e = this._getSecondPointerPosition(t), n = t.pageX - e.x, r = t.pageY - e.y, s = Math.sqrt(n * n + r * r);
    this._dollyEnd.set(0, s), this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed)), this._dollyOut(this._dollyDelta.y), this._dollyStart.copy(this._dollyEnd);
    const a = (t.pageX + e.x) * 0.5, o = (t.pageY + e.y) * 0.5;
    this._updateZoomParameters(a, o);
  }
  _handleTouchMoveDollyPan(t) {
    this.enableZoom && this._handleTouchMoveDolly(t), this.enablePan && this._handleTouchMovePan(t);
  }
  _handleTouchMoveDollyRotate(t) {
    this.enableZoom && this._handleTouchMoveDolly(t), this.enableRotate && this._handleTouchMoveRotate(t);
  }
  // pointers
  _addPointer(t) {
    this._pointers.push(t.pointerId);
  }
  _removePointer(t) {
    delete this._pointerPositions[t.pointerId];
    for (let e = 0; e < this._pointers.length; e++)
      if (this._pointers[e] == t.pointerId) {
        this._pointers.splice(e, 1);
        return;
      }
  }
  _isTrackingPointer(t) {
    for (let e = 0; e < this._pointers.length; e++)
      if (this._pointers[e] == t.pointerId) return !0;
    return !1;
  }
  _trackPointer(t) {
    let e = this._pointerPositions[t.pointerId];
    e === void 0 && (e = new It(), this._pointerPositions[t.pointerId] = e), e.set(t.pageX, t.pageY);
  }
  _getSecondPointerPosition(t) {
    const e = t.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
    return this._pointerPositions[e];
  }
  //
  _customWheelEvent(t) {
    const e = t.deltaMode, n = {
      clientX: t.clientX,
      clientY: t.clientY,
      deltaY: t.deltaY
    };
    switch (e) {
      case 1:
        n.deltaY *= 16;
        break;
      case 2:
        n.deltaY *= 100;
        break;
    }
    return t.ctrlKey && !this._controlActive && (n.deltaY *= 10), n;
  }
}
function Hg(i) {
  this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(i.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(i) && (this._addPointer(i), i.pointerType === "touch" ? this._onTouchStart(i) : this._onMouseDown(i)));
}
function Vg(i) {
  this.enabled !== !1 && (i.pointerType === "touch" ? this._onTouchMove(i) : this._onMouseMove(i));
}
function Gg(i) {
  switch (this._removePointer(i), this._pointers.length) {
    case 0:
      this.domElement.releasePointerCapture(i.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(Ac), this.state = ie.NONE;
      break;
    case 1:
      const t = this._pointers[0], e = this._pointerPositions[t];
      this._onTouchStart({ pointerId: t, pageX: e.x, pageY: e.y });
      break;
  }
}
function Wg(i) {
  let t;
  switch (i.button) {
    case 0:
      t = this.mouseButtons.LEFT;
      break;
    case 1:
      t = this.mouseButtons.MIDDLE;
      break;
    case 2:
      t = this.mouseButtons.RIGHT;
      break;
    default:
      t = -1;
  }
  switch (t) {
    case Gi.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseDownDolly(i), this.state = ie.DOLLY;
      break;
    case Gi.ROTATE:
      if (i.ctrlKey || i.metaKey || i.shiftKey) {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(i), this.state = ie.PAN;
      } else {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(i), this.state = ie.ROTATE;
      }
      break;
    case Gi.PAN:
      if (i.ctrlKey || i.metaKey || i.shiftKey) {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(i), this.state = ie.ROTATE;
      } else {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(i), this.state = ie.PAN;
      }
      break;
    default:
      this.state = ie.NONE;
  }
  this.state !== ie.NONE && this.dispatchEvent(ho);
}
function Xg(i) {
  switch (this.state) {
    case ie.ROTATE:
      if (this.enableRotate === !1) return;
      this._handleMouseMoveRotate(i);
      break;
    case ie.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseMoveDolly(i);
      break;
    case ie.PAN:
      if (this.enablePan === !1) return;
      this._handleMouseMovePan(i);
      break;
  }
}
function $g(i) {
  this.enabled === !1 || this.enableZoom === !1 || this.state !== ie.NONE || (i.preventDefault(), this.dispatchEvent(ho), this._handleMouseWheel(this._customWheelEvent(i)), this.dispatchEvent(Ac));
}
function qg(i) {
  this.enabled !== !1 && this._handleKeyDown(i);
}
function Yg(i) {
  switch (this._trackPointer(i), this._pointers.length) {
    case 1:
      switch (this.touches.ONE) {
        case zi.ROTATE:
          if (this.enableRotate === !1) return;
          this._handleTouchStartRotate(i), this.state = ie.TOUCH_ROTATE;
          break;
        case zi.PAN:
          if (this.enablePan === !1) return;
          this._handleTouchStartPan(i), this.state = ie.TOUCH_PAN;
          break;
        default:
          this.state = ie.NONE;
      }
      break;
    case 2:
      switch (this.touches.TWO) {
        case zi.DOLLY_PAN:
          if (this.enableZoom === !1 && this.enablePan === !1) return;
          this._handleTouchStartDollyPan(i), this.state = ie.TOUCH_DOLLY_PAN;
          break;
        case zi.DOLLY_ROTATE:
          if (this.enableZoom === !1 && this.enableRotate === !1) return;
          this._handleTouchStartDollyRotate(i), this.state = ie.TOUCH_DOLLY_ROTATE;
          break;
        default:
          this.state = ie.NONE;
      }
      break;
    default:
      this.state = ie.NONE;
  }
  this.state !== ie.NONE && this.dispatchEvent(ho);
}
function jg(i) {
  switch (this._trackPointer(i), this.state) {
    case ie.TOUCH_ROTATE:
      if (this.enableRotate === !1) return;
      this._handleTouchMoveRotate(i), this.update();
      break;
    case ie.TOUCH_PAN:
      if (this.enablePan === !1) return;
      this._handleTouchMovePan(i), this.update();
      break;
    case ie.TOUCH_DOLLY_PAN:
      if (this.enableZoom === !1 && this.enablePan === !1) return;
      this._handleTouchMoveDollyPan(i), this.update();
      break;
    case ie.TOUCH_DOLLY_ROTATE:
      if (this.enableZoom === !1 && this.enableRotate === !1) return;
      this._handleTouchMoveDollyRotate(i), this.update();
      break;
    default:
      this.state = ie.NONE;
  }
}
function Kg(i) {
  this.enabled !== !1 && i.preventDefault();
}
function Zg(i) {
  i.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, { passive: !0, capture: !0 }));
}
function Jg(i) {
  i.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, { passive: !0, capture: !0 }));
}
class Nl extends Te {
  /**
   * Constructs a new CSS2D object.
   *
   * @param {DOMElement} [element] - The DOM element.
   */
  constructor(t = document.createElement("div")) {
    super(), this.isCSS2DObject = !0, this.element = t, this.element.style.position = "absolute", this.element.style.userSelect = "none", this.element.setAttribute("draggable", !1), this.center = new It(0.5, 0.5), this.addEventListener("removed", function() {
      this.traverse(function(e) {
        e.element instanceof e.element.ownerDocument.defaultView.Element && e.element.parentNode !== null && e.element.remove();
      });
    });
  }
  copy(t, e) {
    return super.copy(t, e), this.element = t.element.cloneNode(!0), this.center = t.center, this;
  }
}
const ki = new I(), Fl = new le(), Ol = new le(), kl = new I(), Bl = new I();
class Qg {
  /**
   * Constructs a new CSS2D renderer.
   *
   * @param {CSS2DRenderer~Parameters} [parameters] - The parameters.
   */
  constructor(t = {}) {
    const e = this;
    let n, r, s, a;
    const o = {
      objects: /* @__PURE__ */ new WeakMap()
    }, l = t.element !== void 0 ? t.element : document.createElement("div");
    l.style.overflow = "hidden", this.domElement = l, this.getSize = function() {
      return {
        width: n,
        height: r
      };
    }, this.render = function(g, _) {
      g.matrixWorldAutoUpdate === !0 && g.updateMatrixWorld(), _.parent === null && _.matrixWorldAutoUpdate === !0 && _.updateMatrixWorld(), Fl.copy(_.matrixWorldInverse), Ol.multiplyMatrices(_.projectionMatrix, Fl), h(g, g, _), p(g);
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
        ki.setFromMatrixPosition(g.matrixWorld), ki.applyMatrix4(Ol);
        const u = ki.z >= -1 && ki.z <= 1 && g.layers.test(m.layers) === !0, T = g.element;
        T.style.display = u === !0 ? "" : "none", u === !0 && (g.onBeforeRender(e, _, m), T.style.transform = "translate(" + -100 * g.center.x + "%," + -100 * g.center.y + "%)translate(" + (ki.x * s + s) + "px," + (-ki.y * a + a) + "px)", T.parentNode !== l && l.appendChild(T), g.onAfterRender(e, _, m));
        const b = {
          distanceToCameraSquared: d(m, g)
        };
        o.objects.set(g, b);
      }
      for (let u = 0, T = g.children.length; u < T; u++)
        h(g.children[u], _, m);
    }
    function d(g, _) {
      return kl.setFromMatrixPosition(g.matrixWorld), Bl.setFromMatrixPosition(_.matrixWorld), kl.distanceToSquared(Bl);
    }
    function f(g) {
      const _ = [];
      return g.traverseVisible(function(m) {
        m.isCSS2DObject && _.push(m);
      }), _;
    }
    function p(g) {
      const _ = f(g).sort(function(u, T) {
        if (u.renderOrder !== T.renderOrder)
          return T.renderOrder - u.renderOrder;
        const b = o.objects.get(u).distanceToCameraSquared, y = o.objects.get(T).distanceToCameraSquared;
        return b - y;
      }), m = _.length;
      for (let u = 0, T = _.length; u < T; u++)
        _[u].element.style.zIndex = m - u;
    }
  }
}
const De = (i) => i / 1e3;
function t_(i, t, e, n) {
  const r = Fe(t, i), s = De(r.width), a = De(r.depth), o = De(r.height), l = new en();
  l.position.set(De(i.x), 0, De(i.z)), l.rotation.y = -i.rotation * Math.PI / 180;
  const c = new en(), h = new en();
  l.add(c), this.content.add(l);
  const d = { rackId: t.id }, f = [];
  {
    const w = new Float32Array([-0.09, o + 0.015, a / 2 - 0.15, 0.09, o + 0.015, a / 2 - 0.15, 0, o + 0.015, a / 2 + 0.05]), R = new hn();
    R.setAttribute("position", new xn(w, 3));
    const C = new Xe(R, new Mi({ color: "#089b88", side: ln, depthTest: !1 }));
    C.userData = { ...d, frontMarker: !0 }, C.renderOrder = 10, h.add(C), f.push(this.label("앞 · FRONT", 0, o + 0.03, a / 2 + 0.2, h, "rack-front")), f.push(this.label("뒤", 0, o + 0.03, -a / 2 - 0.12, h, "rack-rear"));
  }
  const p = ea(t), g = "#273847";
  this.cube(s, 0.07, a, 0, o - 0.035, 0, g, h).userData = d;
  const _ = new qi(
    new fr(new An(s, 0.072, a)),
    new Qn({ color: "#d9e6ec", transparent: !0, opacity: 0.95, depthTest: !1 })
  );
  _.position.y = o - 0.035, _.renderOrder = 9, _.userData = d, h.add(_), this.cube(s, 0.07, a, 0, 0.035, 0, g, c).userData = d, this.cube(s, 0.07, a, 0, o - 0.035, 0, g, c, { transparent: !!n.transparent, opacity: n.transparent ? 0.18 : 1, depthWrite: !n.transparent }).userData = d;
  for (const w of [-s / 2 + 0.025, s / 2 - 0.025]) for (const R of [-a / 2 + 0.025, a / 2 - 0.025]) this.cube(0.04, o, 0.04, w, o / 2, R, g, c).userData = d;
  if (n.sides)
    for (const w of [-s / 2 + 0.012, s / 2 - 0.012]) {
      const R = this.cube(0.024, o - 0.14, a - 0.08, w, o / 2, 0, g, c);
      R.userData = { ...d, sidePanel: !0 };
    }
  const m = Math.min(De(t.rail_width || 482.6), s - 0.08), u = (o - De(t.u_height * 44.45)) / 2;
  if (n.units) for (let w = 0; w < t.u_height; w++) {
    const R = t.starting_unit + (t.desc_units ? t.u_height - w - 1 : w), C = u + De((w + 0.5) * 44.45);
    for (const F of [!1, !0]) {
      const M = (F ? -1 : 1) * (a / 2 + 3e-3);
      this.textPanel(String(R), 0.045, De(44.45) * 0.85, -s / 2 - 0.025, C, M, c, F, { ...d, unitLabel: !0 }), p.occupied.has(w) || (this.cube(m, 2e-3, 3e-3, 0, C, M, "#94a3b8", c).userData = d);
    }
  }
  for (const w of [-m / 2 - 0.012, m / 2 + 0.012]) for (const R of [-a / 2 + 0.065, a / 2 - 0.065]) this.cube(0.018, De(t.u_height * 44.45), 0.025, w, o / 2, R, "#82929f", c).userData = d;
  const T = n.labels || n.usage ? this.label("", 0, o + 0.18, 0, l, "rack-summary") : null;
  if (T) {
    const w = (R, C) => {
      const F = document.createElement("span");
      F.className = C, F.textContent = R, T.element.append(F);
    };
    n.labels && w(`${t.name}${i.locked ? " · 잠금" : ""}`, "rack-name"), n.usage && (w(`${p.used}/${t.u_height}U · ${p.percent}%`, "rack-usage"), w(`잔여 ${p.free}U · ${p.count}대`, "rack-usage-detail"), T.element.style.borderBottomColor = Wc(p.percent));
  }
  this.textPanel("FRONT · 전면", s * 0.85, 0.065, 0, o - 0.035, a / 2 + 2e-3, c, !1, d), this.textPanel("REAR · 후면", s * 0.85, 0.065, 0, o - 0.035, -a / 2 - 2e-3, c, !0, d);
  for (const w of t.devices) {
    const R = qa(t, w);
    if (R == null) continue;
    const C = e.appearances[String(w.id)] || {}, F = C.color || w.color || "#64748b", M = De(w.u_height * 44.45) - 3e-3, S = Math.min(De(C.depth || (w.full_depth ? r.depth - 140 : r.depth * 0.42)), a - 0.12), P = w.face === "rear", V = P ? -a / 2 + 0.065 + S / 2 : a / 2 - 0.065 - S / 2, X = new en();
    X.position.set(0, u + De(R) + M / 2, V), X.rotation.y = P ? Math.PI : 0, c.add(X);
    const U = { ...d, deviceId: w.id, deviceInfo: w }, k = this.cube(m, M, S, 0, 0, 0, F, X);
    k.userData = U;
    {
      const H = Array.from({ length: 6 }, (Xt, kt) => new mc({ color: (kt === 2 || kt === 3) && !n.deviceColors ? "#808890" : F, roughness: 0.8 }));
      for (const [Xt, kt] of [["front", 4], ["rear", 5]]) {
        const J = w.images.find((ft) => ft.id === C[`${Xt}_image_id`])?.url || w[`${Xt}_image`];
        J && (H[kt].color.set("#ffffff"), H[kt].map = this.texture(J, F, m / M), H[kt].userData.imageKey = H[kt].map.userData.poolKey);
      }
      if (k.material.dispose(), k.material = H, n.statuses) for (const Xt of [!1, !0]) this.textPanel(w.status_label || w.status, m * 0.35, Math.min(M * 0.3, 0.025), m * 0.3, -M * 0.3, (Xt ? -1 : 1) * (S / 2 + 4e-3), X, Xt, { ...U, statusColor: Gc(w.status) });
      const B = Math.min(M * 0.65, 0.04);
      this.textPanel(w.name, m * 0.94, B, 0, (M - B) / 2 - 1e-3, S / 2 + 1e-3, X, !1, U);
      const D = w.interfaces || [], j = 8, at = Math.ceil(D.length / j), dt = Math.min(De(44.45) / 2, M * 0.85 / Math.max(1, at) * 0.8, m * 0.94 / j * 0.8), Wt = dt * 1.25, Qt = dt * 1.25;
      D.forEach((Xt, kt) => this.textPanel(
        Xt.name,
        dt,
        dt,
        m * 0.47 - (kt % j + 0.5) * Wt,
        M * 0.425 - (Math.floor(kt / j) + 0.5) * Qt,
        -S / 2 - 2e-3,
        X,
        !0,
        { ...U, rearInfo: w, interfaceId: Xt.id, interfaceName: Xt.name, interfaceIPs: Xt.primary_ips || [], isPrimary: !!Xt.is_primary }
      ));
    }
  }
  const b = /* @__PURE__ */ new Map(), y = [];
  return l.add(h), l.traverse((w) => {
    w.isMesh && !Array.isArray(w.material) && !w.userData.deviceInfo && !w.userData.textPanel && w.material.color?.getHexString() === "273847" && y.push(w), w.isMesh && w.userData.deviceInfo && Array.isArray(w.material) && b.set(w.userData.deviceId, w);
  }), l.remove(h), { group: l, details: c, top: h, devices: b, frameMeshes: y, nameLabel: T, directionLabels: f, labelWidth: Math.min(s, a) };
}
function e_(i, t) {
  const e = new en();
  this.content.add(e);
  const n = De(i.width), r = De(i.depth), s = De(i.height);
  if (this.cube(n, 0.08, r, n / 2, -0.06, r / 2, "#fafcfd", e), t.grid) {
    const a = [], o = Math.max(0.1, De(i.grid)), l = i.grid_origin || "top-left", c = l.endsWith("right") ? n % o : 0, h = l.startsWith("bottom") ? r % o : 0;
    for (let f = c; f <= n; f += o) a.push(new I(f, 0, 0), new I(f, 0, r));
    for (let f = h; f <= r; f += o) a.push(new I(0, 0, f), new I(n, 0, f));
    const d = new qi(new hn().setFromPoints(a), new Qn({ color: "#8195a5", transparent: !0, opacity: 0.85, depthWrite: !1 }));
    d.position.y = 2e-3, d.userData.gridSize = i.grid, e.add(d);
  }
  return t.walls && (this.cube(n, s, 0.07, n / 2, s / 2, 0, "#cdd9df", e, { transparent: !0, opacity: 0.24, depthWrite: !1 }), this.cube(0.07, s, r, 0, s / 2, r / 2, "#cdd9df", e, { transparent: !0, opacity: 0.24, depthWrite: !1 })), this.label(n.toFixed(1) + " m", n / 2, 0.05, r + 0.4, e, "dimension"), this.label(r.toFixed(1) + " m", n + 0.45, 0.05, r / 2, e, "dimension"), e;
}
class n_ {
  constructor(t = 128) {
    this.entries = /* @__PURE__ */ new Map(), this.maxIdle = t, this.clock = 0, this.created = 0;
  }
  acquire(t, e) {
    let n = this.entries.get(t);
    return n || (n = { value: e(), refs: 0, used: 0 }, this.entries.set(t, n), this.created++), n.refs++, n.used = ++this.clock, n.value;
  }
  release(t) {
    const e = this.entries.get(t);
    if (!e || e.refs < 1) throw new Error(`Unbalanced resource release: ${t}`);
    e.refs--, e.used = ++this.clock;
  }
  prune() {
    const t = [...this.entries].filter(([, e]) => !e.refs).sort((e, n) => e[1].used - n[1].used);
    for (const [e, n] of t.slice(0, Math.max(0, t.length - this.maxIdle)))
      n.value.dispose(), this.entries.delete(e);
  }
  clear() {
    for (const t of this.entries.values()) t.value.dispose();
    this.entries.clear();
  }
  get stats() {
    return { entries: this.entries.size, idle: [...this.entries.values()].filter((t) => !t.refs).length, created: this.created };
  }
}
const Jt = (i) => i / 1e3;
function i_(i) {
  const t = i?.deviceInfo?.primary_ips || [];
  return t.length === 1 ? t : t.length > 1 && i.interfaceId ? (i.interfaceIPs || []).filter((e) => t.includes(e)) : [];
}
class r_ {
  constructor(t, e) {
    this.listeners = [], this.host = t, this.handlers = e, this.textures = /* @__PURE__ */ new Map(), this.mode = "3d", this.scene = new Pd(), this.scene.background = new Yt("#e8edf0"), this.renderer = new Dg({ antialias: !0, alpha: !1 }), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)), this.renderer.setClearColor("#e8edf0"), this.renderer.domElement.setAttribute("aria-label", "서버실 3D 배치 화면"), this.renderer.domElement.tabIndex = 0, t.appendChild(this.renderer.domElement), this.tooltip = document.createElement("div"), this.tooltip.className = "r3-device-tooltip", this.tooltip.hidden = !0, this.tooltip.setAttribute("role", "tooltip"), t.appendChild(this.tooltip), this.on(this.renderer.domElement, "pointerleave", () => {
      this.tooltip.hidden = !0;
    }), this.labels = new Qg(), Object.assign(this.labels.domElement.style, { position: "absolute", inset: "0", pointerEvents: "none" }), t.appendChild(this.labels.domElement), this.camera = new on(42, 1, 0.01, 300), this.controls = new zg(this.camera, this.renderer.domElement), this.controls.maxPolarAngle = Math.PI / 2 - 0.02, this.controls.minDistance = 0.6, this.controls.maxDistance = 100, this.on(this.controls, "change", () => this.draw()), this.scene.add(new Hd(16777215, 6649218, 2.5));
    const n = new Wd(16777215, 3);
    n.position.set(5, 12, 7), this.scene.add(n), this.content = new en(), this.scene.add(this.content), this.ray = new $d(), this.floor = new Bn(new I(0, 1, 0), 0), this.on(this.renderer.domElement, "pointerdown", (a) => this.down(a), { capture: !0 }), this.on(this.renderer.domElement, "pointermove", (a) => this.move(a)), this.on(this.renderer.domElement, "pointerup", (a) => this.up(a)), this.on(this.renderer.domElement, "pointercancel", () => this.cancelDrag()), this.on(this.renderer.domElement, "dragover", (a) => a.preventDefault()), this.on(this.renderer.domElement, "drop", (a) => {
      if (a.preventDefault(), this.mode === "walk") return;
      const o = this.floorPoint(a);
      o && e.drop(Number(a.dataTransfer.getData("text/plain")), o.x * 1e3, o.z * 1e3);
    }), this.observer = new ResizeObserver(() => this.resize()), this.observer.observe(t), this.keys = /* @__PURE__ */ new Set();
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
  on(t, e, n, r) {
    t.addEventListener(e, n, r), this.listeners.push(() => t.removeEventListener(e, n, r));
  }
  dispose() {
    if (!this.disposed) {
      this.cancelDrag(), this.disposed = !0;
      for (const t of ["drawRAF", "dragRAF", "walkRAF", "focusRAF"]) this[t] && cancelAnimationFrame(this[t]);
      for (const t of this.listeners || []) t();
      this.observer?.disconnect(), this.controls?.dispose(), this.clear(), this.pool.clear(), this.renderer?.dispose(), this.renderer?.domElement.remove(), this.labels?.domElement.remove(), this.tooltip?.remove();
    }
  }
  cancelDrag() {
    this.dragRAF && cancelAnimationFrame(this.dragRAF), this.dragRAF = null, this.pendingDrag = null;
    const t = this.drag;
    this.drag = null, this.walkPointer = null, this.pointerStart = null, this.controls.enabled = this.mode !== "walk", t && this.handlers.dragCancel?.();
  }
  flushDrag() {
    this.dragRAF && cancelAnimationFrame(this.dragRAF), this.dragRAF = null;
    const t = this.pendingDrag;
    if (this.pendingDrag = null, !t || !this.drag) return;
    const e = this.floorPoint(t);
    e && (this.drag.blockId ? this.handlers.dragBlock : this.handlers.drag)(this.drag.blockId || this.drag.id, e.x * 1e3 + this.drag.dx, e.z * 1e3 + this.drag.dz);
  }
  walkFree(t, e) {
    const r = this.layout;
    return t < 0.2 || e < 0.2 || t > Jt(r.width) - 0.2 || e > Jt(r.depth) - 0.2 ? !1 : !this.walkObstacles.some((s) => t > Jt(s[0]) - 0.2 && t < Jt(s[2]) + 0.2 && e > Jt(s[1]) - 0.2 && e < Jt(s[3]) + 0.2);
  }
  walkStart() {
    const t = Jt(this.layout.width), e = Jt(this.layout.depth);
    for (let n = e - 0.25; n >= 0.2; n -= Math.max(0.2, e / 150))
      for (let r = 0.25; r <= t - 0.2; r += Math.max(0.2, t / 150))
        if (this.walkFree(r, n)) return new I(r, Math.min(1.65, Jt(this.layout.height) - 0.1), n);
    return null;
  }
  walkFrame(t) {
    if (this.mode !== "walk") return;
    const e = Math.min((t - (this.walkTime ?? t)) / 1e3, 0.05);
    this.walkTime = t;
    const n = (...a) => a.some((o) => this.keys.has(o)), r = Number(n("KeyW", "ArrowUp")) - Number(n("KeyS", "ArrowDown")), s = Number(n("KeyD", "ArrowRight")) - Number(n("KeyA", "ArrowLeft"));
    if (r || s) {
      const a = Math.hypot(r, s), o = n("ShiftLeft", "ShiftRight") ? 2.8 : 1.4, l = (s * Math.cos(this.yaw) - r * Math.sin(this.yaw)) / a * o * e, c = (-r * Math.cos(this.yaw) - s * Math.sin(this.yaw)) / a * o * e, h = this.camera.position;
      this.walkFree(h.x + l, h.z) && (h.x += l), this.walkFree(h.x, h.z + c) && (h.z += c), this.draw();
    }
    this.walkRAF = requestAnimationFrame((a) => this.walkFrame(a));
  }
  resize() {
    const { width: t, height: e } = this.host.getBoundingClientRect();
    !t || !e || (this.renderer.setSize(t, e), this.labels.setSize(t, e), this.camera.aspect = t / e, this.camera.updateProjectionMatrix(), this.draw());
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
    const t = this.host.clientWidth;
    for (const e of this.rackNodes?.values() || []) {
      if (!e.nameLabel) continue;
      const n = e.nameLabel.getWorldPosition(new I()), r = new I(1, 0, 0).applyQuaternion(this.camera.quaternion).multiplyScalar(e.labelWidth / 2), s = n.clone().sub(r).project(this.camera), a = n.add(r).project(this.camera);
      e.nameLabel.element.style.maxWidth = `${Math.max(18, Math.min(180, Math.abs(a.x - s.x) * t / 2 - 6))}px`, e.nameLabel.element.classList.toggle("top-summary", this.mode === "top");
    }
  }
  point(t) {
    this.camera.updateMatrixWorld();
    const e = this.renderer.domElement.getBoundingClientRect();
    this.ray.setFromCamera(new It((t.clientX - e.left) / e.width * 2 - 1, -(t.clientY - e.top) / e.height * 2 + 1), this.camera);
  }
  floorPoint(t) {
    return this.point(t), this.ray.ray.intersectPlane(this.floor, new I());
  }
  isVisible(t) {
    for (let e = t; e; e = e.parent) if (!e.visible) return !1;
    return !0;
  }
  hit(t) {
    this.point(t), this.content.updateMatrixWorld(!0);
    for (const e of this.ray.intersectObjects(this.content.children, !0))
      if (!(!e.object.isMesh || !this.isVisible(e.object)) && (e.object.userData.rackId || e.object.userData.blockId))
        return e.object.userData;
    return null;
  }
  down(t) {
    if (t.button !== 0) return;
    if (t.shiftKey && this.mode === "top") {
      const n = this.hit(t);
      if (n) {
        this.pointerStart = null, this.handlers.multiSelect?.(n), t.stopImmediatePropagation();
        return;
      }
    }
    this.mode === "walk" && (this.renderer.domElement.focus(), this.walkPointer = { x: t.clientX, y: t.clientY }, this.renderer.domElement.setPointerCapture(t.pointerId));
    const e = this.hit(t);
    if (this.pointerStart = { x: t.clientX, y: t.clientY, hit: e }, e && this.mode === "top" && this.editable) {
      const n = e.blockId ? this.layout.blocks.find((s) => s.id === e.blockId) : this.layout.placements.find((s) => s.rack_id === e.rackId);
      if (!n || n.locked) return;
      const r = this.floorPoint(t);
      if (!r) return;
      this.drag = { id: e.rackId, blockId: e.blockId, dx: n.x - r.x * 1e3, dz: n.z - r.z * 1e3 }, this.handlers.dragStart?.(e), this.controls.enabled = !1, t.stopImmediatePropagation(), this.renderer.domElement.setPointerCapture(t.pointerId);
    }
  }
  move(t) {
    if (this.tooltip.hidden = !0, !this.drag && !this.walkPointer && this.mode !== "top") {
      this.point(t), this.content.updateMatrixWorld(!0);
      const e = this.ray.intersectObjects(this.content.children, !0).find((n) => this.isVisible(n.object) && n.object.isMesh && !(n.object.material.transparent && n.object.material.opacity < 0.5));
      if (e?.object.userData.deviceInfo) {
        const n = e.object.userData.deviceInfo, r = i_(e.object.userData);
        if (r.length) {
          this.tooltip.textContent = `${n.name}${e.object.userData.interfaceName ? " · " + e.object.userData.interfaceName : ""} · ${r.join(" / ")}`, this.tooltip.hidden = !1;
          const s = this.host.getBoundingClientRect();
          this.tooltip.style.left = `${Math.max(0, Math.min(t.clientX - s.left + 12, s.width - this.tooltip.offsetWidth))}px`, this.tooltip.style.top = `${Math.max(0, t.clientY - s.top - this.tooltip.offsetHeight - 10)}px`;
        }
      }
    }
    if (this.mode === "walk" && this.walkPointer) {
      this.yaw -= (t.clientX - this.walkPointer.x) * 4e-3, this.pitch = ic.clamp(this.pitch - (t.clientY - this.walkPointer.y) * 4e-3, -1.3, 1.3), this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ"), this.walkPointer = { x: t.clientX, y: t.clientY }, this.draw();
      return;
    }
    this.drag && (this.drag.moved = !0, this.pendingDrag = { clientX: t.clientX, clientY: t.clientY }, this.dragRAF || (this.dragRAF = requestAnimationFrame(() => this.flushDrag())));
  }
  up(t) {
    this.walkPointer = null;
    const e = this.pointerStart;
    this.drag && (this.drag.moved && (this.pendingDrag = { clientX: t.clientX, clientY: t.clientY }), this.flushDrag(), this.drag = null, this.controls.enabled = !0, this.handlers.dragEnd()), e && Math.hypot(t.clientX - e.x, t.clientY - e.y) < 5 && e.hit && (e.hit.blockId ? this.handlers.selectBlock(e.hit.blockId) : this.handlers.select(e.hit.rackId, this.mode === "top" ? null : e.hit.deviceId)), this.pointerStart = null;
  }
  cube(t, e, n, r, s, a, o, l = this.content, c = {}) {
    const h = new Xe(new An(t, e, n), new mc({ color: o, roughness: 0.78, ...c }));
    return h.position.set(r, s, a), l.add(h), h;
  }
  label(t, e, n, r, s, a = "") {
    const o = document.createElement("div");
    o.className = `r3-label ${a}`, o.textContent = t;
    const l = new Nl(o);
    return o.style.pointerEvents = "none", l.position.set(e, n, r), s.add(l), l;
  }
  texture(t, e, n) {
    this.state();
    const r = JSON.stringify(["image", t, e, n.toFixed(2)]);
    return this.pool.acquire(r, () => {
      const s = document.createElement("canvas");
      s.width = 1024, s.height = Math.max(32, Math.min(4096, Math.round(1024 / n)));
      const a = s.getContext("2d");
      a.fillStyle = e, a.fillRect(0, 0, s.width, s.height);
      const o = new Ga(s);
      o.colorSpace = je, o.userData.poolKey = r;
      const l = new Image();
      l.crossOrigin = "anonymous";
      let c = !1;
      return l.onload = () => {
        if (c) return;
        const h = Math.min(s.width / l.width, s.height / l.height);
        a.drawImage(l, (s.width - l.width * h) / 2, (s.height - l.height * h) / 2, l.width * h, l.height * h), o.needsUpdate = !0, this.draw();
      }, l.onerror = () => {
        c || this.handlers.imageError?.();
      }, l.src = t, { texture: o, dispose() {
        c = !0, l.onload = l.onerror = null, o.dispose();
      } };
    }).texture;
  }
  clear() {
    this.state(), this.clearFocus(), this.tooltip.hidden = !0;
    for (const t of this.rackNodes.values()) t.group.add(t.details, t.top);
    this.disposeGroup(this.content), this.content.clear(), this.rackNodes.clear(), this.blockNodes.clear(), this.environment = null, this.envKey = null, this.selectionKey = void 0, this.selectionObjects = [], this.pool.prune();
  }
  clearFocus() {
    this.focusRAF && cancelAnimationFrame(this.focusRAF), this.focusRAF = null, this.disposeGroup(this.focusGroup), this.focusGroup = null;
  }
  highlight(t) {
    this.clearFocus(), this.content.updateMatrixWorld(!0);
    const e = new tr();
    if (this.content.traverse((u) => {
      u.isMesh && u.userData.rackId === t.rackId && (!t.deviceId || u.userData.deviceId === t.deviceId) && e.expandByObject(u);
    }), e.isEmpty()) {
      t.deviceId && this.highlight({ rackId: t.rackId });
      return;
    }
    const n = e.getSize(new I()).addScalar(0.025), r = e.getCenter(new I()), s = new An(n.x, n.y, n.z), a = new Qn({ color: "#ffb000", transparent: !0, depthTest: !1 }), o = new qi(new fr(s), a);
    o.position.copy(r), o.renderOrder = 1e3, this.focusGroup = new en(), this.content.add(this.focusGroup), this.focusGroup.add(o);
    const l = new Mi({ color: "#ffc400", transparent: !0, opacity: 0.2, depthTest: !1, depthWrite: !1 }), c = new Xe(s, l);
    c.raycast = () => {
    }, c.position.copy(r), c.renderOrder = 999, this.focusGroup.add(c);
    const h = this.racks.find((u) => u.id === t.rackId), d = h?.devices.find((u) => u.id === t.deviceId), f = document.createElement("div");
    f.className = "r3-focus-tag", f.setAttribute("role", "status"), f.textContent = `▼ ${d?.name || h?.name} · 위치 강조`;
    const p = new Nl(f);
    p.position.set(r.x, e.max.y + 0.06, r.z), this.focusGroup.add(p);
    const g = performance.now(), _ = window.matchMedia("(prefers-reduced-motion: reduce)").matches, m = (u) => {
      const T = u - g < 5e3, b = T && !_ ? 0.55 + 0.45 * Math.cos((u - g) / 1200 * Math.PI * 2) : 0.8;
      a.opacity = b, l.opacity = 0.08 + b * 0.22, f.style.opacity = String(0.65 + b * 0.35), this.draw(), T && !_ ? this.focusRAF = requestAnimationFrame(m) : this.focusRAF = null;
    };
    m(g);
  }
  textPanel(t, e, n, r, s, a, o, l = !1, c = {}) {
    this.state();
    const h = JSON.stringify(["text", t, !!c.unitLabel, !!c.interfaceId, c.statusColor, !!c.isPrimary]), d = this.pool.acquire(h, () => {
      const p = document.createElement("canvas");
      p.width = c.unitLabel || c.interfaceId ? 128 : 512, p.height = c.interfaceId || c.unitLabel ? 128 : 64;
      const g = p.getContext("2d");
      g.fillStyle = c.statusColor || "#172d3b", g.fillRect(0, 0, p.width, p.height), g.fillStyle = "#f1f5f9", g.font = "bold " + (c.unitLabel ? 75 : c.interfaceId ? 23 : 45) + "px sans-serif", g.textAlign = "center", g.textBaseline = "middle", g.fillText(t, p.width / 2, p.height / 2, p.width - 12), c.interfaceId && (g.strokeStyle = c.isPrimary ? "#fbbf24" : "#82929f", g.lineWidth = c.isPrimary ? 4.5 : 2, g.strokeRect(2.5, 2.5, 123, 123));
      const _ = new Ga(p);
      _.colorSpace = je;
      const m = new Mi({ map: _ });
      return { material: m, dispose() {
        _.dispose(), m.dispose();
      } };
    }), f = new Xe(new Si(e, n), d.material);
    f.position.set(r, s, a), f.rotation.y = l ? Math.PI : 0, f.userData = { ...c, textPanel: !0, textKey: h }, o.add(f);
  }
  roomObject(t, e, n) {
    const r = t.type || "pillar", s = mr[r] || mr.pillar, a = Jt(t.width), o = Jt(t.depth), l = Jt(t.height), c = new en();
    c.position.set(Jt(t.x), 0, Jt(t.z)), c.rotation.y = -(t.rotation || 0) * Math.PI / 180, this.content.add(c);
    const h = e ? "#0d9488" : s.color, d = (f, p, g, _, m, u, T = h, b = {}) => {
      const y = this.cube(f, p, g, _, m, u, T, c, b);
      return y.userData = { blockId: t.id }, y;
    };
    if (r === "desk") {
      d(a, l * 0.09, o, 0, l * 0.955, 0);
      for (const f of [-a * 0.43, a * 0.43]) for (const p of [-o * 0.4, o * 0.4]) d(a * 0.045, l * 0.91, o * 0.06, f, l * 0.455, p, "#485560");
    } else if (r === "glass") {
      d(a, l, o * 0.35, 0, l / 2, 0, "#91d5e2", { transparent: !0, opacity: 0.3, depthWrite: !1 });
      for (const f of [-a * 0.48, a * 0.48]) d(a * 0.04, l, o, f, l / 2, 0, "#566977");
      for (const f of [l * 0.015, l * 0.985]) d(a, l * 0.03, o, 0, f, 0, "#566977");
    } else if (r === "door")
      d(a, l, o, 0, l / 2, 0, "#455966"), d(a * 0.88, l * 0.94, o * 0.9, 0, l * 0.47, o * 0.07), d(a * 0.04, l * 0.025, o * 0.15, a * 0.32, l * 0.46, o * 0.53, "#e5c16b");
    else if (d(a, l, o, 0, l / 2, 0), ["ups", "cooling", "battery"].includes(r)) {
      d(a * 0.3, l * 0.1, o * 0.012, -a * 0.15, l * 0.8, o * 0.506, "#142c36"), d(a * 0.12, l * 0.045, o * 0.014, -a * 0.15, l * 0.8, o * 0.52, "#65dec0");
      for (let f = 0; f < 7; f++) d(a * 0.74, l * 0.014, o * 0.012, 0, l * (0.15 + f * 0.065), o * 0.506, "#364b57");
      r === "battery" && d(a * 0.12, l * 0.09, o * 0.014, a * 0.25, l * 0.8, o * 0.52, "#f3c751");
    }
    return e && d(a + 0.06, 8e-3, o + 0.06, 0, 6e-3, 0, "#2dd4bf", { transparent: !0, opacity: 0.5 }), n.labels && this.label(t.name, 0, l + 0.12, 0, c, e ? "active" : "muted"), c;
  }
  state() {
    this.rackNodes ||= /* @__PURE__ */ new Map(), this.blockNodes ||= /* @__PURE__ */ new Map(), this.pool ||= new n_();
  }
  disposeGroup(t) {
    t && (t !== this.content && t.removeFromParent(), t.traverse((e) => {
      if (e.geometry?.dispose(), e.userData.textKey) this.pool.release(e.userData.textKey);
      else if (e.material) for (const n of Array.isArray(e.material) ? e.material : [e.material])
        n.userData.imageKey && this.pool.release(n.userData.imageKey), n.dispose();
      e.isCSS2DObject && e.element.remove();
    }));
  }
  removeRack(t) {
    t.group.add(t.details, t.top), this.disposeGroup(t.group);
  }
  syncMode() {
    for (const t of this.rackNodes?.values() || []) {
      const e = this.mode === "top" ? t.top : t.details, n = this.mode === "top" ? t.details : t.top;
      n.parent && (n.traverse((r) => {
        r.isCSS2DObject && r.element.remove();
      }), n.removeFromParent()), e.parent || t.group.add(e);
    }
  }
  movePlacement(t, e, n) {
    const r = (t === "block" ? this.blockNodes : this.rackNodes)?.get(e);
    r && (r.group.position.set(Jt(n.x), 0, Jt(n.z)), r.group.rotation.y = -(n.rotation || 0) * Math.PI / 180, this.draw());
  }
  setSelection(t) {
    const e = JSON.stringify(t || null);
    if (this.selectionKey === e) return;
    for (const l of this.rackNodes.values()) {
      for (const c of l.frameMeshes) c.material.color.set("#273847");
      l.nameLabel?.element.classList.remove("active");
    }
    for (const l of this.selectionObjects || []) this.disposeGroup(l);
    this.selectionObjects = [], this.selectionKey = e;
    const n = this.rackNodes.get(t?.rackId);
    if (!n) return;
    for (const l of n.frameMeshes) l.material.color.set("#0d9488");
    n.nameLabel?.element.classList.add("active");
    const r = this.layout.placements.find((l) => l.rack_id === t.rackId), s = Fe(this.racks.find((l) => l.id === t.rackId), r), a = this.cube(Jt(s.width) + 0.12, 0.012, Jt(s.depth) + 0.12, 0, 8e-3, 0, "#2dd4bf", n.group, { transparent: !0, opacity: 0.45 });
    this.selectionObjects.push(a);
    const o = n.devices.get(t.deviceId);
    if (o) {
      const l = new qi(new fr(o.geometry), new Qn({ color: "#fbbf24" }));
      o.parent.add(l), this.selectionObjects.push(l);
    }
  }
  markMany(t) {
    for (const e of this.multiMarkers || []) this.disposeGroup(e);
    this.multiMarkers = [];
    for (const e of t) {
      const [n, r] = e.split(":"), s = n === "rack" ? this.rackNodes?.get(Number(r)) : this.blockNodes?.get(r);
      if (!s) continue;
      const a = n === "rack" ? Fe(this.racks.find((h) => h.id === Number(r)), this.layout.placements.find((h) => h.rack_id === Number(r))) : this.layout.blocks.find((h) => h.id === r), o = new An(Jt(a.width) + 0.03, 0.02, Jt(a.depth) + 0.03), l = new fr(o);
      o.dispose();
      const c = new qi(l, new Qn({ color: "#e5a321", depthTest: !1 }));
      c.position.y = Jt(a.height) + 0.02, c.renderOrder = 20, s.group.add(c), this.multiMarkers.push(c);
    }
    this.draw();
  }
  update(t, e, n, r = {}) {
    this.state(), this.clearFocus(), this.layout = t, this.racks = e, this.editable = r.editable;
    const s = new Map(e.map((h) => [h.id, h]));
    if (this.walkObstacles = [...t.blocks, ...t.placements.flatMap((h) => {
      const d = s.get(h.rack_id);
      return d ? [{ ...h, ...Fe(d, h) }] : [];
    })].map(Ee), this.mode === "walk") {
      const h = this.camera.position;
      if (!this.walkFree(h.x, h.z)) {
        const d = this.walkStart();
        if (d) h.copy(d);
        else {
          this.handlers.exitWalk(), this.handlers.walkError();
          return;
        }
      }
      h.y = Math.min(1.65, Jt(t.height) - 0.1);
    }
    const a = JSON.stringify([t.width, t.depth, t.height, t.grid, t.grid_origin, r.grid, r.walls]);
    this.envKey !== a && (this.disposeGroup(this.environment), this.environment = e_.call(this, t, r), this.envKey = a);
    const o = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), c = [r.labels, r.units, r.usage, r.sides, r.transparent, r.deviceColors, r.statuses];
    for (const h of t.placements) {
      const d = s.get(h.rack_id);
      if (!d) continue;
      o.add(d.id);
      const f = JSON.stringify([d, Fe(d, h), h.locked, c, d.devices.map((g) => t.appearances[String(g.id)])]);
      let p = this.rackNodes.get(d.id);
      p?.key !== f && (p && this.removeRack(p), p = t_.call(this, h, d, t, r), p.key = f, this.rackNodes.set(d.id, p), this.selectionKey = void 0), this.movePlacement("rack", d.id, h);
      for (const g of p.devices.values())
        g.parent.visible = !r.statusFilter || g.userData.deviceInfo.status === r.statusFilter;
    }
    for (const [h, d] of this.rackNodes) o.has(h) || (this.removeRack(d), this.rackNodes.delete(h), this.selectionKey = void 0);
    for (const h of t.blocks) {
      l.add(h.id);
      const { x: d, z: f, rotation: p, ...g } = h, _ = JSON.stringify([g, r.labels, n?.blockId === h.id]);
      let m = this.blockNodes.get(h.id);
      m?.key !== _ && (this.disposeGroup(m?.group), m = { group: this.roomObject(h, n?.blockId === h.id, r), key: _ }, this.blockNodes.set(h.id, m)), this.movePlacement("block", h.id, h);
    }
    for (const [h, d] of this.blockNodes) l.has(h) || (this.disposeGroup(d.group), this.blockNodes.delete(h));
    this.setSelection(n), this.syncMode(), this.pool.prune(), this.draw();
  }
  view(t, e) {
    if (this.clearFocus(), cancelAnimationFrame(this.walkRAF), this.walkTime = null, this.keys.clear(), this.walkPointer = null, t === "walk") {
      const a = this.walkStart();
      if (!a) {
        this.handlers.walkError();
        return;
      }
      this.mode = "walk", this.syncMode(), this.controls.enabled = !1, this.camera.position.copy(a), this.yaw = 0, this.pitch = 0, this.camera.rotation.set(0, 0, 0, "YXZ"), this.renderer.domElement.focus(), this.draw(), this.walkRAF = requestAnimationFrame((o) => this.walkFrame(o));
      return;
    }
    this.controls.enabled = !0, this.mode = t === "top" ? "top" : "3d", this.syncMode(), this.controls.enableRotate = t !== "top";
    const n = this.layout;
    if (!n) return;
    const r = new I(Jt(n.width) / 2, 0, Jt(n.depth) / 2), s = Math.max(Jt(n.width), Jt(n.depth));
    if ((t === "front" || t === "rear") && e) {
      const a = n.placements.find((l) => l.rack_id === e.rackId), o = this.racks.find((l) => l.id === e.rackId);
      if (a && o) {
        const l = Fe(o, a), c = -a.rotation * Math.PI / 180;
        r.set(Jt(a.x), Jt(l.height) / 2, Jt(a.z));
        const h = new I(0, 0.12, (t === "rear" ? -1 : 1) * (Jt(l.depth) / 2 + 3.4)).applyAxisAngle(new I(0, 1, 0), c);
        this.camera.position.copy(r).add(h);
      }
    } else t === "top" ? this.camera.position.set(r.x, s * 1.5, r.z + 1e-3) : this.camera.position.set(r.x + s * 0.8, s * 0.8, r.z + s * 0.85);
    this.controls.target.copy(r), this.controls.update(), this.camera.updateMatrixWorld(), this.scene.updateMatrixWorld(!0), this.sizeLabels(), this.labels.render(this.scene, this.camera), this.draw();
  }
}
const ae = (i) => String(i ?? "").replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]), Le = (i) => structuredClone(i), we = document.querySelector("#room3d"), En = new $c(we);
let Ut, $, Hn, ds, Ne, di = [], Tt = null, oe, Ie = !1, Mn = !1, ze = [], gn, Rc = !1, Vn, Cc, ye = "3d", uo = "", Pc = !1, ta = 0;
const Ue = { units: !0, usage: !0, statuses: !0, statusFilter: "", grid: !0, walls: !0, labels: !0, transparent: !0, sides: !1, deviceColors: !1, snap: !0 };
we.innerHTML = `
  <div class="r3-app">
    <div class="r3-location-bar"><label>LOCATION <select class="no-ts" id="r3-location" aria-label="Location 선택"></select></label><label class="r3-check"><input type="checkbox" id="r3-only-rack-locations"> 랙이 배치된 Location만</label><span id="r3-room-summary"></span><div class="r3-location-actions"><button class="r3-btn small" data-action="room">서버실 설정</button><button class="r3-btn small" data-action="reload">다시 불러오기</button><span id="r3-save-state" role="status">불러오는 중</span><button data-action="cancel" class="r3-btn small">취소</button><button data-action="save" class="r3-btn small primary">배치 저장</button></div></div>
    <div id="r3-notice" role="status" aria-live="polite" hidden></div>
    <div class="r3-workspace">
      <aside class="r3-library"><div class="r3-section-title"><h2>랙 라이브러리</h2><span id="r3-rack-count"></span></div><p class="r3-help">기존 랙을 화면으로 끌어다 배치하세요.</p><input id="r3-search" type="search" placeholder="랙 · 서버명 · IP 검색" aria-label="랙 또는 서버 검색"><label>장비 상태<select class="no-ts" id="r3-status-filter"><option value="">전체 상태</option></select></label><div id="r3-search-results"></div><label class="r3-check"><input type="checkbox" id="r3-show-placed"> 배치된 랙 포함</label><div id="r3-rack-list"></div><div class="r3-library-bottom"><span class="r3-eyebrow">ROOM OBJECTS</span><label>오브젝트 종류<select class="no-ts" id="r3-object-type" aria-label="오브젝트 종류">${Object.entries(mr).map(([i, t]) => `<option value="${i}">${t.name}</option>`).join("")}</select></label><button data-action="add-block" class="r3-btn wide">＋ 룸 오브젝트 추가</button><div id="r3-block-list"></div></div></aside>
      <main class="r3-stage"><div class="r3-toolbar"><div class="r3-segment"><button data-action="view" data-view="3d" class="active">3D 보기</button><button data-action="view" data-view="top">평면 배치</button><button data-action="view" data-view="walk">워킹 모드</button></div><div class="r3-tools"><button data-action="fit" title="전체 보기">전체 보기</button><button data-action="undo" title="되돌리기">↶ 되돌리기</button><label><input id="r3-snap" type="checkbox" checked> 격자 맞춤</label></div></div><div id="r3-canvas"></div><div class="r3-stage-footer"><span id="r3-scene-stats"></span><span id="r3-controls-help">드래그 회전 · 우클릭 이동 · 휠 확대</span></div><div id="r3-invalid" role="alert" hidden></div></main>
      <aside id="r3-inspector" class="r3-inspector"></aside>
    </div>
    <footer class="r3-footer"><span><i></i> ${En.demo ? "샘플 데이터 · 이 브라우저에 저장됩니다" : "NetBox 인벤토리 · 레이아웃만 저장됩니다"}</span><div><label><input id="r3-units" type="checkbox" checked> U 번호·빈 슬롯</label><label><input id="r3-usage" type="checkbox" checked> 사용 현황</label><label><input id="r3-statuses" type="checkbox" checked> 상태 표시</label><label><input id="r3-grid" type="checkbox" checked> 격자 표시</label><label>한 칸 (mm)<input id="r3-grid-size" type="number" min="100" max="5000" step="1" required aria-label="격자 한 칸 (mm)"></label><label>격자 시작<select class="no-ts" id="r3-grid-origin" aria-label="격자 배치 시작 위치"><option value="top-left">좌상</option><option value="bottom-left">좌하</option><option value="top-right">우상</option><option value="bottom-right">우하</option></select></label><label><input id="r3-walls" type="checkbox" checked> 벽</label><label><input id="r3-labels" type="checkbox" checked> 이름</label><label><input id="r3-transparent" type="checkbox" checked> 투명 프레임</label><label><input id="r3-sides" type="checkbox"> 랙 측면 덮개</label><label><input id="r3-deviceColors" type="checkbox"> 서버 상·하단 할당 색상</label></div></footer>
  </div>
  <dialog id="r3-room-dialog"><form id="r3-room-form"><div class="r3-dialog-title"><h2>서버실 기본 설정</h2><button type="button" class="r3-icon-button" data-action="close-room" aria-label="닫기">×</button></div><p>선택한 Location에 공간을 연결합니다. 모든 치수는 mm입니다.</p><label>서버실 이름<input name="name" required maxlength="100"></label><div class="r3-form-grid"><label>가로 (mm)<input type="number" name="width" min="500" max="100000" required></label><label>세로 (mm)<input type="number" name="depth" min="500" max="100000" required></label><label>높이 (mm)<input type="number" name="height" min="500" max="100000" required></label><label>격자 크기 (mm)<input type="number" name="grid" min="100" max="5000" required></label></div><label class="r3-check"><input name="include_descendants" type="checkbox"> 하위 Location의 랙 포함</label><p class="r3-help">공간을 줄이면 기존 배치가 경계를 벗어날 수 있습니다.</p><div class="r3-dialog-actions"><button type="button" data-action="close-room" class="r3-btn">닫기</button><button type="submit" class="r3-btn primary">설정 적용</button></div></form></dialog>`;
const Ct = (i) => we.querySelector(i), _s = document.createElement("span");
_s.className = "r3-version";
_s.textContent = `Room 3D v${we.dataset.version || kg.version}`;
_s.setAttribute("aria-label", "Room 3D plugin version");
const fo = document.createElement("div");
fo.className = "r3-statusbar";
fo.append(Ct("#r3-scene-stats"), _s);
Ct(".r3-app").append(fo);
const po = document.createElement("div");
po.className = "r3-collision-controls";
po.innerHTML = '<label class="r3-check"><input id="r3-repel" type="checkbox" checked> 겹침 자동 밀림</label><button class="r3-btn small" data-action="fix-overlap">겹침 자동 수정</button>';
Ct(".r3-location-actions").prepend(po);
const gi = () => Ct("#r3-repel").checked;
function ir() {
  const i = Math.max(0, we.getBoundingClientRect().top), t = Math.max(240, (window.visualViewport?.height || window.innerHeight) - i - 12), e = `${Math.floor(t)}px`;
  we.style.getPropertyValue("--r3-available-height") !== e && we.style.setProperty("--r3-available-height", e);
}
ir();
window.addEventListener("resize", ir);
window.visualViewport?.addEventListener("resize", ir);
document.addEventListener("fullscreenchange", ir);
const s_ = new ResizeObserver(ir);
s_.observe(we.parentElement);
document.fonts?.ready.then(ir);
function ne(i = "", t = !1) {
  const e = Ct("#r3-notice");
  e.textContent = i, e.hidden = !i, e.className = t ? "error" : "";
}
function We() {
  ze.push({ layout: Le($), racks: Ut.racks }), ze.length > 30 && ze.shift();
}
function an(i = !1) {
  Ie = JSON.stringify($) !== JSON.stringify(Hn), _e(i);
}
function Nt() {
  return !!Ut?.can_edit && !Mn;
}
function Dc(i) {
  Mn = i, _e();
}
function mn(i, t, e, n = "placement", r = !1, s = 0) {
  return `<label>${i}<input type="number" min="${s}" step="any" data-edit="${n}" data-key="${t}" value="${ae(e)}" ${r || !Nt() ? "disabled" : ""}></label>`;
}
function a_(i) {
  const t = `${i} 복사본`, e = new Set($.blocks.map((n) => n.name));
  if (!e.has(t)) return t;
  for (let n = 2; ; n++) if (!e.has(`${t} ${n}`)) return `${t} ${n}`;
}
function us(i, t) {
  const e = $.grid_origin || "top-left", n = t === "x" ? e.endsWith("right") : e.startsWith("bottom");
  return Vc(i, $.grid, Ue.snap, n ? $[t === "x" ? "width" : "depth"] : 0);
}
function Vi(i) {
  const t = Ee(i);
  return { x: t[0], z: t[1] };
}
function yr(i, t, e) {
  const n = Ee({ ...i, x: t, z: e });
  return { x: t + us(n[0], "x") - n[0], z: e + us(n[1], "z") - n[1] };
}
function zl(i, t = null) {
  const e = (o, l) => ({ x: i.x, z: i.z } = yr(i, o, l), !Rn({ ...$, blocks: [...$.blocks, i] }, Ut.racks).length), n = Math.max(100, $.grid);
  if (t)
    for (let o = 1; o <= 12; o++) {
      for (let l = -o; l <= o; l++) for (const c of [-o, o]) if (e(t.x + c * n, t.z + l * n)) return !0;
      for (let l = -o + 1; l < o; l++) for (const c of [-o, o]) if (e(t.x + l * n, t.z + c * n)) return !0;
    }
  const r = Math.max(100, $.grid, $.width / 80, $.depth / 80), s = (o, l, c) => {
    const h = [];
    for (let d = l; d <= o - l; d += r) h.push(d);
    return c ? h.reverse() : h;
  }, a = $.grid_origin || "top-left";
  for (const o of s($.depth, i.depth / 2, a.startsWith("bottom")))
    for (const l of s($.width, i.width / 2, a.endsWith("right"))) if (e(l, o)) return !0;
  return !1;
}
function Lc(i, t) {
  const e = Ya(i);
  return e ? `<a href="${ae(e)}" target="_blank" rel="noopener noreferrer">${t} ↗</a>` : '<span class="r3-help">샘플 장비</span>';
}
function mo() {
  const i = di.filter((n) => !Rc || n.has_racks), t = i.some((n) => n.id === Ne), e = t ? "" : `<option value="" disabled selected>${i.length ? "Location 선택 (현재 화면 유지)" : "조건에 맞는 Location이 없습니다"}</option>`;
  Ct("#r3-location").innerHTML = e + i.map((n) => `<option value="${n.id}">${ae(n.site)} / ${ae(n.name)}</option>`).join(""), t && (Ct("#r3-location").value = String(Ne)), Ct("#r3-location").disabled = Mn || !i.length, Ct("#r3-only-rack-locations").disabled = Mn;
}
function _e(i = !1, t = !0) {
  if (!Ut || !$) return;
  const e = Rn($, Ut.racks);
  Ct("#r3-grid-size").value = $.grid, Ct("#r3-grid-size").disabled = !Nt(), Ct("#r3-grid-origin").value = $.grid_origin || "top-left", Ct("#r3-grid-origin").disabled = !Nt(), Ct("#r3-save-state").textContent = Ut.can_edit ? Mn ? "처리 중…" : Ie ? "저장하지 않은 변경" : `저장됨 · v${$.revision}` : "읽기 전용", Ct("#r3-save-state").className = Ie ? "unsaved" : "", Ct("[data-action=save]").disabled = !Nt() || !Ie || e.length > 0, Ct("[data-action=cancel]").disabled = Mn || !Ie, Ct("[data-action=undo]").disabled = !Nt() || !ze.length, Ct("[data-action=add-block]").disabled = !Nt(), Ct("[data-action=fix-overlap]").disabled = !Nt(), Ct("#r3-repel").disabled = !Nt(), mo(), Ct("[data-action=room]").disabled = !Nt(), Ct("#r3-room-summary").textContent = `${$.name} · ${$.width / 1e3} × ${$.depth / 1e3} m · ${$.height / 1e3} m 높이`, Ct("#r3-rack-count").textContent = `${Ut.racks.length}`;
  const n = new Set($.placements.map((l) => l.rack_id)), r = uo.trim().toLowerCase(), s = new Map(Ut.racks.flatMap((l) => l.devices.map((c) => [c.status, c.status_label || c.status])));
  Ue.statusFilter && !s.has(Ue.statusFilter) && (Ue.statusFilter = ""), Ct("#r3-status-filter").innerHTML = '<option value="">전체 상태</option>' + [...s].map(([l, c]) => `<option value="${ae(l)}" ${Ue.statusFilter === l ? "selected" : ""}>${ae(c)}</option>`).join("");
  const a = Ut.racks.flatMap((l) => l.devices.filter((c) => Eo(c, r, Ue.statusFilter)).map((c) => ({ r: l, d: c })));
  Ct("#r3-search-results").innerHTML = r || Ue.statusFilter ? `<p class="r3-help">장비 검색 ${a.length}개 · 현재 Location</p>` + a.map(({ r: l, d: c }) => `<button class="r3-btn wide" data-action="find-device" data-rack-id="${l.id}" data-id="${c.id}">${ae(c.name)} · ${ae(l.name)} · ${ae(c.status_label || c.status)}${n.has(l.id) ? "" : " · 미배치"}<small class="r3-result-ips">${bo(c, r).matched ? "일치 IP" : "IP"}: ${bo(c, r).ips.map((h) => ae(h)).join(" · ") || "조회 가능한 IP 없음"}</small></button>`).join("") : "";
  const o = Ut.racks.filter((l) => (Pc || r || Ue.statusFilter || !n.has(l.id)) && (!Ue.statusFilter || l.devices.some((c) => c.status === Ue.statusFilter)) && (!r || l.name.toLowerCase().includes(r) || l.devices.some((c) => Eo(c, r, Ue.statusFilter))));
  Ct("#r3-rack-list").innerHTML = o.length ? o.map((l) => `<div class="r3-rack-card ${Tt?.rackId === l.id ? "selected" : ""}" draggable="${Nt() && !n.has(l.id)}" data-rack="${l.id}"><button class="r3-rack-select" data-action="select" data-id="${l.id}"><span class="r3-rack-icon">▥</span><span><strong>${ae(l.name)}</strong><small>${l.u_height}U · ${l.width} × ${l.depth} mm</small></span></button><div class="r3-rack-meta"><span>${l.devices.length} 장비 · ${ea(l).used}/${l.u_height}U · 잔여 ${ea(l).free}U</span><button data-action="${n.has(l.id) ? "select" : "place"}" data-id="${l.id}" ${!n.has(l.id) && !Nt() ? "disabled" : ""}>${n.has(l.id) ? "배치됨 ↗" : "＋ 배치"}</button></div></div>`).join("") : '<div class="r3-empty">미배치 랙이 없습니다.<br>배치된 랙 포함을 켜서 확인하세요.</div>', Ct("#r3-block-list").innerHTML = $.blocks.map((l) => `<button class="r3-block-item" data-action="select-block" data-id="${ae(l.id)}">▧ ${ae(l.name)}</button>`).join(""), Ct("#r3-scene-stats").textContent = `${$.placements.length} / ${Ut.racks.length} 랙 배치 · ${Ut.racks.filter((l) => n.has(l.id)).reduce((l, c) => l + c.devices.length, 0)} 장비`, Ct("#r3-invalid").hidden = !e.length, Ct("#r3-invalid").textContent = e.length ? `저장 전 확인 · ${e.slice(0, 3).join(" / ")}` : "", Ct("#r3-controls-help").textContent = ye === "walk" ? "WASD / 방향키 이동 · 드래그 둘러보기 · Shift 빠르게 · Esc 종료" : ye === "top" ? "랙 드래그 배치 · 우클릭 이동 · 휠 확대" : "드래그 회전 · 우클릭 이동 · 휠 확대", Ct("[data-action=fit]").textContent = ye === "walk" ? "시작 위치" : "전체 보기", Ct("[data-action=fit]").title = ye === "walk" ? "워킹 시작 위치로 이동" : "전체 보기", we.querySelectorAll("[data-action=view]").forEach((l) => l.classList.toggle("active", l.dataset.view === ye)), i || Ic(), we.querySelectorAll("select").forEach((l) => l.classList.add("no-ts")), t && oe?.update($, Ut.racks, Tt, { ...Ue, editable: Nt() }), Vn?.refresh(), Cc?.refresh();
}
function Ic() {
  const i = Ct("#r3-inspector");
  if (Tt?.blockId) {
    const o = $.blocks.find((c) => c.id === Tt.blockId);
    if (!o)
      return Tt = null, Ic();
    const l = Vi(o);
    i.innerHTML = `<div class="r3-section-title"><h2>${ae(mr[o.type || "pillar"]?.name || "룸 오브젝트")}</h2><span class="r3-tag">BLOCK</span></div><label>이름<input data-edit="block" data-key="name" value="${ae(o.name)}" maxlength="100" ${Nt() ? "" : "disabled"}></label><div class="r3-form-grid">${mn("좌측 X (mm)", "x", l.x, "block")}${mn("상단 Z (mm)", "z", l.z, "block")}${mn("폭 (mm)", "width", o.width, "block", !1, 100)}${mn("깊이 (mm)", "depth", o.depth, "block", !1, 100)}${mn("높이 (mm)", "height", o.height, "block", !1, 100)}</div><label>방향<select data-edit="block" data-key="rotation" ${Nt() ? "" : "disabled"}>${[0, 90, 180, 270].map((c) => `<option value="${c}" ${c === (o.rotation || 0) ? "selected" : ""}>${c}°</option>`).join("")}</select></label><p class="r3-help">좌표는 오브젝트의 좌측 상단 기준입니다. 평면 모드에서 드래그하거나 좌표를 입력하세요.</p><button data-action="duplicate-block" class="r3-btn wide" ${Nt() ? "" : "disabled"}>오브젝트 복사</button><button data-action="remove-block" class="r3-btn danger wide" ${Nt() ? "" : "disabled"}>블록 제거</button>`;
    return;
  }
  const t = Ut.racks.find((o) => o.id === Tt?.rackId);
  if (!t) {
    i.innerHTML = '<div class="r3-section-title"><h2>선택 정보</h2></div><div class="r3-inspector-empty"><span>◇</span><h3>공간을 구성해 보세요</h3><p>랙을 선택하면 위치와 치수를<br>조정하고 내부 장비를 확인할 수 있습니다.</p></div><div class="r3-tip"><strong>시작하기</strong><p>① 서버실 크기를 설정하세요.<br>② 평면 모드에서 랙을 배치하세요.<br>③ 3D로 앞뒤를 확인하고 저장하세요.</p></div>';
    return;
  }
  const e = $.placements.find((o) => o.rack_id === t.id), n = Fe(t, e), r = t.devices.find((o) => o.id === Tt.deviceId), s = t.devices.filter((o) => qa(t, o) == null), a = e ? Vi({ ...e, ...n }) : null;
  i.innerHTML = `<div class="r3-section-title"><h2>${ae(t.name)}</h2><span class="r3-tag">${t.u_height}U</span></div>${Lc(t.url, "NetBox 랙 상세")}<div class="r3-view-buttons"><button data-action="front" ${e ? "" : "disabled"}>전면 보기</button><button data-action="rear" ${e ? "" : "disabled"}>후면 보기</button></div>
    ${e ? `<div class="r3-subtitle">배치 좌표 · 좌측 상단 기준 <label class="r3-check"><input type="checkbox" data-edit="placement" data-key="locked" ${e.locked ? "checked" : ""} ${Nt() ? "" : "disabled"}> 잠금</label></div><div class="r3-form-grid">${mn("좌측 X (mm)", "x", a.x, "placement", e.locked)}${mn("상단 Z (mm)", "z", a.z, "placement", e.locked)}</div><label>방향<select data-edit="placement" data-key="rotation" ${e.locked || !Nt() ? "disabled" : ""}>${[0, 90, 180, 270].map((o) => `<option value="${o}" ${o === e.rotation ? "selected" : ""}>${o}°</option>`).join("")}</select></label><details><summary>랙 표시 치수 보정</summary><p class="r3-help">원본 랙 치수는 변경되지 않습니다.${t.estimated.length ? " 일부 치수는 추정값입니다." : ""}</p><div class="r3-form-grid">${mn("폭 (mm)", "width", n.width, "dimensions", e.locked, 100)}${mn("깊이 (mm)", "depth", n.depth, "dimensions", e.locked, 100)}${mn("높이 (mm)", "height", n.height, "dimensions", e.locked, 100)}</div></details><button data-action="unplace" class="r3-btn danger wide" ${e.locked || !Nt() ? "disabled" : ""}>배치 해제</button>` : `<p class="r3-help">아직 배치되지 않은 랙입니다.</p><button data-action="place" data-id="${t.id}" class="r3-btn primary wide" ${Nt() ? "" : "disabled"}>서버실에 배치</button>`}
    <div class="r3-subtitle">장비 <span>${t.devices.length}</span></div>${t.desc_units ? '<p class="r3-help">U 번호: 위에서 아래로 증가</p>' : ""}${s.length ? `<p class="r3-warning">위치 없음·0U·범위 초과 ${s.length}개: 목록에서만 표시</p>` : ""}<div class="r3-devices">${t.devices.filter((o) => !Ue.statusFilter || o.status === Ue.statusFilter).map((o) => `<button data-action="device" data-id="${o.id}" class="r3-device ${r?.id === o.id ? "active" : ""}"><i style="background:${ae($.appearances[String(o.id)]?.color || o.color)}"></i><span>${ae(o.name)}<small>${ae(o.model)}</small></span><b>${o.position == null ? "—" : "U" + o.position}</b></button>`).join("") || '<p class="r3-help">장비가 없습니다.</p>'}</div>${r ? o_(r) : '<p class="r3-help">장비를 선택하면 이미지와 색상을 설정할 수 있습니다.</p>'}`;
}
function o_(i) {
  const t = $.appearances[String(i.id)] || {}, e = ["front", "rear"].map((n) => {
    const r = i.images.find((a) => a.id === t[`${n}_image_id`])?.url || i[`${n}_image`], s = En.demo ? r : Ya(r);
    return `<div class="r3-face-preview"><span>${n === "front" ? "전면" : "후면"}</span>${s ? `<img src="${ae(s)}" alt="${ae(i.name)} ${n === "front" ? "전면" : "후면"} 이미지">` : `<div style="background:${ae(t.color || i.color)}">설정 색상</div>`}</div>`;
  }).join("");
  return `<div class="r3-device-detail"><div class="r3-subtitle">${ae(i.name)}</div><p class="r3-help">${i.u_height}U · ${i.face === "rear" ? "후면 장착" : "전면 장착"} · ${ae(i.status)}</p>${Lc(i.url, "NetBox 장비 상세")}<div class="r3-previews">${e}</div><label>이미지가 없는 면의 색상<input type="color" data-edit="appearance" data-key="color" value="${ae(t.color || i.color)}" ${Nt() ? "" : "disabled"}></label>${mn("표시 깊이 (mm, 빈 값은 추정)", "depth", t.depth ?? "", "appearance", !1, 20)}${["front", "rear"].map((n) => `<label>${n === "front" ? "전면" : "후면"} 이미지<select data-edit="appearance" data-key="${n}_image_id" ${Nt() ? "" : "disabled"}><option value="">Device Type 이미지 사용</option>${i.images.map((r) => `<option value="${r.id}" ${t[`${n}_image_id`] === r.id ? "selected" : ""}>${ae(r.name)}</option>`).join("")}</select></label>`).join("")}<button data-action="reset-appearance" class="r3-btn small" ${Nt() ? "" : "disabled"}>장비 표시 설정 초기화</button></div>`;
}
async function go(i) {
  const t = ++ta;
  Mn = !0, Ct("#r3-location").disabled = !0, ne("서버실 정보를 불러오고 있습니다.");
  try {
    const e = await En.load(i);
    if (t !== ta) return;
    Ut = e, $ = Le(e.layout), Hn = Le($), ds = Ut.racks, Ne = i, Tt = $.placements[0] ? { rackId: $.placements[0].rack_id } : null, ze = [], Ie = !1, Ct("#r3-location").value = String(i), ne(Ut.warning), Mn = !1, _e(), oe?.view(ye, Tt);
  } catch (e) {
    if (t !== ta) return;
    Mn = !1, Ct("#r3-location").disabled = !1, ne(e.message, !0), Ne && (Ct("#r3-location").value = String(Ne)), _e();
  }
}
function Uc(i, t = $.width / 2, e = $.depth / 2, n = !0) {
  if (!Nt() || !Ut.racks.some((s) => s.id === i) || $.placements.some((s) => s.rack_id === i)) return;
  const r = Le($);
  r.placements.push({ rack_id: i, x: us(t, "x"), z: us(e, "z"), rotation: 0, locked: !1, dimensions: {} });
  try {
    const s = gi() ? co($, r, Ut.racks, [`rack:${i}`]) : r;
    We(), $ = s;
  } catch (s) {
    ne(s.message, !0);
    return;
  }
  Tt = { rackId: i }, n && an(), ne("랙을 배치했습니다. 평면 모드에서 위치를 조정한 뒤 저장하세요.");
}
we.addEventListener("dragstart", (i) => {
  const t = i.target.closest("[data-rack]");
  t && (i.dataTransfer.setData("text/plain", t.dataset.rack), i.dataTransfer.effectAllowed = "copy");
});
we.addEventListener("click", async (i) => {
  const t = i.target.closest("[data-action]");
  if (!t || t.disabled || !$) return;
  const e = t.dataset.action, n = Number(t.dataset.id);
  if (!(e === "find-device" || oe.drag))
    try {
      if (e === "fix-overlap" && Nt()) {
        const r = Fg($, Ut.racks);
        JSON.stringify(r) === JSON.stringify($) ? ne("수정할 겹침이 없습니다.") : (We(), $ = r, ne("겹침을 자동 수정했습니다. 확인 후 배치 저장을 누르세요."));
      } else if (e === "select")
        Tt = { rackId: n };
      else if (e === "select-block")
        Tt = { blockId: t.dataset.id };
      else if (e === "device")
        Tt.deviceId = n;
      else if (e === "place") Uc(n, void 0, void 0, !1);
      else if (e === "view")
        ye = t.dataset.view, oe.view(ye, Tt), ye = oe.mode;
      else if (e === "fit") oe.view(ye, Tt);
      else if (e === "front" || e === "rear")
        ye = "3d", oe.view(e, Tt);
      else if (e === "save" && Nt() && !Rn($, Ut.racks).length) {
        Dc(!0);
        const r = await En.save(Ne, $);
        Ut = r, $ = Le(r.layout), Hn = Le($), ds = Ut.racks, Ie = !1, ze = [], ne("배치를 저장했습니다.");
      } else if (e === "cancel")
        $ = Le(Hn), Ut.racks = ds, Ie = !1, ze = [], ne("저장 전 변경을 취소했습니다.");
      else if (e === "reload")
        (!Ie || window.confirm("저장하지 않은 변경을 버리고 다시 불러올까요?")) && await go(Ne);
      else if (e === "undo" && Nt() && ze.length) {
        const r = ze.pop();
        $ = r.layout, Ut.racks = r.racks, Ie = JSON.stringify($) !== JSON.stringify(Hn);
      } else if (e === "room") {
        const r = Ct("#r3-room-form");
        for (const s of ["name", "width", "depth", "height", "grid"]) r.elements[s].value = $[s];
        r.elements.include_descendants.checked = $.include_descendants, Ct("#r3-room-dialog").showModal();
      } else if (e === "close-room") Ct("#r3-room-dialog").close();
      else if (e === "unplace" && Nt())
        $.placements.find((s) => s.rack_id === Tt.rackId).locked || (We(), $.placements = $.placements.filter((s) => s.rack_id !== Tt.rackId));
      else if (e === "add-block" && Nt()) {
        const r = Ct("#r3-object-type").value, s = mr[r];
        if (!s) return;
        const a = crypto.randomUUID(), o = { id: a, type: r, name: s.name, rotation: 0, width: Math.min(s.width, $.width), depth: Math.min(s.depth, $.depth), height: Math.min(s.height, $.height), x: $.width / 2, z: $.depth / 2 }, l = zl(o);
        if (!l && gi()) {
          ne("빈 공간이 부족하여 오브젝트를 추가하지 않았습니다.", !0);
          return;
        }
        l || (o.x = $.width / 2, o.z = $.depth / 2, ne("빈 공간이 부족합니다. 좌표와 크기를 조정한 뒤 저장하세요.", !0)), We(), $.blocks.push(o), Tt = { blockId: a };
      } else if (e === "duplicate-block" && Nt()) {
        const r = $.blocks.find((o) => o.id === Tt.blockId);
        if (!r) return;
        const s = { ...Le(r), id: crypto.randomUUID(), name: a_(r.name) }, a = zl(s, r);
        if (!a && gi()) {
          ne("복사할 빈 공간이 부족하여 배치를 유지했습니다.", !0);
          return;
        }
        a || (s.x = r.x, s.z = r.z, ne("복사할 빈 공간이 부족합니다. 복사본의 좌표를 조정한 뒤 저장하세요.", !0)), We(), $.blocks.push(s), Tt = { blockId: s.id };
      } else e === "remove-block" && Nt() ? (We(), $.blocks = $.blocks.filter((r) => r.id !== Tt.blockId), Tt = null) : e === "reset-appearance" && Nt() && (We(), delete $.appearances[String(Tt.deviceId)]);
    } catch (r) {
      ne(r.message, !0);
    } finally {
      Mn = !1, $ && (Ie = JSON.stringify($) !== JSON.stringify(Hn), _e(!1, !["view", "fit", "front", "rear", "room", "close-room"].includes(e)), ["select", "device"].includes(e) && Tt && $.placements.some((r) => r.rack_id === Tt.rackId) && (uo.trim() && (ye = "3d", oe.view("front", Tt), _e(!1, !1)), oe.highlight(Tt)));
    }
});
we.addEventListener("click", (i) => {
  const t = i.target.closest("[data-action=find-device]");
  !t || !$ || (Tt = { rackId: Number(t.dataset.rackId), deviceId: Number(t.dataset.id) }, $.placements.some((e) => e.rack_id === Tt.rackId) ? (ye = "3d", oe.view("front", Tt), _e(), oe.highlight(Tt)) : (_e(), ne("미배치 랙의 장비입니다. 랙을 배치하면 3D 위치로 이동할 수 있습니다.")));
});
we.addEventListener("input", (i) => {
  i.target.id === "r3-search" && (uo = i.target.value, oe.clearFocus(), _e(!1, !1));
});
we.addEventListener("change", async (i) => {
  const t = i.target;
  if (t.id === "r3-grid-size") {
    const a = Number(t.value);
    if (!Nt()) {
      _e();
      return;
    }
    if (!t.validity.valid || !Number.isInteger(a) || a < 100 || a > 5e3) {
      ne("격자 한 칸은 100~5000 mm 정수로 입력하세요.", !0), _e();
      return;
    }
    a !== $.grid && (We(), $.grid = a, an(), ne("격자 크기를 적용했습니다. 배치 저장을 누르면 유지됩니다."));
    return;
  }
  if (t.id === "r3-grid-origin") {
    if (!Nt() || !["top-left", "bottom-left", "top-right", "bottom-right"].includes(t.value)) {
      _e();
      return;
    }
    t.value !== ($.grid_origin || "top-left") && (We(), $.grid_origin = t.value, an(), ne("격자 시작 위치를 적용했습니다. 기존 배치 좌표는 유지됩니다."));
    return;
  }
  if (t.id === "r3-status-filter") {
    Ue.statusFilter = t.value, _e();
    return;
  }
  if (t.id === "r3-only-rack-locations") {
    Rc = t.checked, mo();
    return;
  }
  if (t.id === "r3-location") {
    !Ie || window.confirm("저장하지 않은 변경을 버리고 Location을 전환할까요?") ? await go(Number(t.value)) : t.value = String(Ne);
    return;
  }
  if (t.id === "r3-show-placed") {
    Pc = t.checked, _e();
    return;
  }
  for (const a of Object.keys(Ue)) if (t.id === `r3-${a}`) {
    Ue[a] = t.checked, _e();
    return;
  }
  if (!t.dataset.edit || !Nt()) return;
  const e = t.dataset.key, n = t.dataset.edit;
  let r = t.type === "checkbox" ? t.checked : t.type === "number" || t.tagName === "SELECT" ? t.value === "" ? null : Number(t.value) : t.value;
  if (t.type === "number" && (t.value === "" && n !== "appearance" || t.value !== "" && (!t.validity.valid || !Number.isFinite(r)))) {
    ne("치수와 좌표 범위를 확인하세요.", !0), _e();
    return;
  }
  if (We(), n === "block") {
    const a = $.blocks.find((l) => l.id === Tt.blockId), o = Vi(a);
    if (e === "x" || e === "z") a[e] += r - o[e];
    else if (a[e] = r, ["width", "depth", "rotation"].includes(e)) {
      const l = Vi(a);
      a.x += o.x - l.x, a.z += o.z - l.z;
    }
  } else if (n === "appearance") {
    const a = $.appearances[String(Tt.deviceId)] ||= {};
    r == null ? delete a[e] : a[e] = r;
  } else {
    const a = $.placements.find((c) => c.rack_id === Tt.rackId);
    if (a.locked && e !== "locked") return;
    const o = Ut.racks.find((c) => c.id === Tt.rackId), l = Vi({ ...a, ...Fe(o, a) });
    if (n === "dimensions" ? a.dimensions[e] = r : e === "x" || e === "z" ? a[e] += r - l[e] : a[e] = r, n === "dimensions" && ["width", "depth"].includes(e) || n === "placement" && e === "rotation") {
      const c = Vi({ ...a, ...Fe(o, a) });
      a.x += l.x - c.x, a.z += l.z - c.z;
    }
  }
  let s = !1;
  if (gi() && n !== "appearance" && ["x", "z", "width", "depth", "rotation"].includes(e)) {
    const a = ze.at(-1).layout;
    try {
      const o = co(a, $, Ut.racks, [n === "block" ? `block:${Tt.blockId}` : `rack:${Tt.rackId}`]);
      s = JSON.stringify(o) !== JSON.stringify($), $ = o, s && ne("겹침을 피하도록 반대쪽 빈 공간으로 밀었습니다.");
    } catch (o) {
      $ = a, ze.pop(), ne(o.message, !0), s = !0;
    }
  }
  n === "appearance" && e === "color" && we.querySelectorAll(".r3-face-preview > div").forEach((a) => {
    a.style.background = r;
  }), an(!s && (t.type === "number" || t.type === "color" || n === "block" && e === "name"));
});
Ct("#r3-room-form").addEventListener("submit", async (i) => {
  if (i.preventDefault(), !Nt()) return;
  const t = i.target, e = Le($);
  if (e.name = t.elements.name.value.trim(), !!e.name) {
    for (const n of ["width", "depth", "height", "grid"]) e[n] = Number(t.elements[n].value);
    e.include_descendants = t.elements.include_descendants.checked;
    try {
      let n = Ut.racks;
      if (e.include_descendants !== $.include_descendants) {
        const r = await En.load(Ne, e.include_descendants), s = new Set(r.racks.map((o) => o.id));
        if (e.placements.some((o) => !s.has(o.rack_id))) throw new Error("하위 Location의 배치된 랙을 먼저 배치 해제하세요.");
        const a = new Set(r.racks.flatMap((o) => o.devices.map((l) => String(l.id))));
        if (Object.keys(e.appearances).some((o) => !a.has(o))) throw new Error("하위 Location 장비의 표시 설정을 먼저 초기화하세요.");
        n = r.racks;
      }
      We(), Ut.racks = n, $ = e, Ct("#r3-room-dialog").close(), an(), oe.view(ye, Tt);
    } catch (n) {
      ne(n.message, !0), Ct("#r3-room-dialog").close();
    }
  }
});
window.addEventListener("beforeunload", (i) => {
  Ie && (i.preventDefault(), i.returnValue = "");
});
async function l_() {
  try {
    if (oe = new r_(Ct("#r3-canvas"), {
      exitWalk: () => {
        ye = "3d", oe.view(ye, Tt), _e();
      },
      walkError: () => ne("걸어 다닐 빈 공간이 없습니다. 서버실 배치를 확인하세요.", !0),
      multiSelect: (t) => Vn?.toggle(t),
      selectBlock: (t) => {
        Tt = { blockId: t }, _e();
      },
      dragStart: (t) => {
        Tt = t.blockId ? { blockId: t.blockId } : { rackId: t.rackId }, _e(), Ct("[data-action=save]").disabled = !0;
      },
      dragBlock: (t, e, n) => {
        if (!Nt()) return;
        if (gi()) {
          Hl(`block:${t}`, e, n);
          return;
        }
        if (Vl(`block:${t}`, e, n)) return;
        const r = $.blocks.find((s) => s.id === t);
        r && (gn ||= { layout: Le($), racks: Ut.racks }, { x: r.x, z: r.z } = yr(r, e, n), Tt = { blockId: t }, Ie = !0, oe.movePlacement("block", t, r));
      },
      select: (t, e) => {
        Tt = { rackId: t, deviceId: e }, _e();
      },
      drop: Uc,
      drag: (t, e, n) => {
        if (!Nt()) return;
        if (gi()) {
          Hl(`rack:${t}`, e, n);
          return;
        }
        if (Vl(`rack:${t}`, e, n)) return;
        const r = $.placements.find((s) => s.rack_id === t);
        r.locked || (gn ||= { layout: Le($), racks: Ut.racks }, { x: r.x, z: r.z } = yr({ ...r, ...Fe(Ut.racks.find((s) => s.id === t), r) }, e, n), Tt = { rackId: t }, Ie = !0, oe.movePlacement("rack", t, r));
      },
      dragEnd: () => {
        gn && (JSON.stringify($) !== JSON.stringify(gn.layout) && (ze.push(gn), ze.length > 30 && ze.shift()), gn = null), an();
      },
      dragCancel: () => {
        gn && ($ = gn.layout, gn = null), an();
      },
      imageError: () => ne("일부 이미지를 불러오지 못해 해당 면을 장비 색상으로 표시합니다.", !0)
    }), Vn = Jc(we, () => ({
      layout: $,
      racks: Ut?.racks || [],
      locationId: Ne,
      editable: Nt(),
      mark: (t) => oe.markMany(t),
      apply: (t) => {
        if (!Nt()) throw new Error("읽기 전용입니다.");
        JSON.stringify(t) !== JSON.stringify($) && (We(), $ = t, an());
      },
      move: (t, e, n) => gi() ? Nc(t, e, n) : ja($, Ut.racks, t, "move", { x: e, z: n }),
      history: () => En.history(Ne),
      restore: async (t) => {
        if (!Nt()) throw new Error("읽기 전용입니다.");
        const e = Ne, n = $.revision, r = JSON.stringify($), s = await En.load(e, t.include_descendants);
        if (e !== Ne || r !== JSON.stringify($)) throw new Error("화면이 변경됐습니다. 이력을 다시 불러오세요.");
        if (!s.can_edit) throw new Error("현재 배치를 편집할 권한이 없습니다.");
        const a = { ...Le(t), revision: n }, o = Rn(a, s.racks);
        if (o.length) throw new Error(o.join(" / "));
        return We(), $ = a, Ut.racks = s.racks, Tt = null, an(), oe.view(ye, Tt), !0;
      }
    })), Cc = Ug(we, () => ({
      layout: $,
      baseline: Hn,
      racks: Ut?.racks || [],
      locationId: Ne,
      selected: Tt,
      scene: oe,
      editable: Nt(),
      busy: Mn,
      canCleanup: !!Ut?.can_cleanup,
      demo: En.demo,
      url: di.find((t) => t.id === Ne)?.url,
      setBusy: Dc,
      view: (t) => {
        ye = t, oe.view(ye, Tt), _e();
      },
      apply: (t) => {
        if (!Nt()) throw new Error("읽기 전용입니다.");
        We(), $ = t, an();
      },
      revision: (t) => {
        $.revision = t, Hn.revision = t, ze.forEach((e) => {
          e.layout.revision = t;
        }), an();
      },
      replace: (t) => {
        Ut = t, $ = Le(t.layout), Hn = Le($), ds = t.racks, Tt = null, ze = [], Ie = !1, _e();
      },
      restore: async (t) => {
        if (!Nt()) throw new Error("읽기 전용입니다.");
        const e = Ne, n = $.revision, r = JSON.stringify($), s = await En.load(e, t.include_descendants);
        if (e !== Ne || r !== JSON.stringify($)) throw new Error("화면이 변경되었습니다. 다시 불러오세요.");
        if (!s.can_edit) throw new Error("현재 배치를 편집할 권한이 없습니다.");
        const a = { ...Le(t), revision: n }, o = Rn(a, s.racks);
        if (o.length) throw new Error(o.join(" / "));
        We(), $ = a, Ut.racks = s.racks, Tt = null, an(), oe.view(ye, Tt);
      }
    })), di = await En.list(), mo(), !di.length) {
      ne("조회할 수 있는 Location이 없습니다. NetBox의 Location과 권한을 확인하세요.", !0);
      return;
    }
    const i = Number(we.dataset.initialLocation || new URLSearchParams(window.location.search).get("location"));
    await go(di.some((t) => t.id === i) ? i : di.find((t) => t.configured)?.id || di[0].id);
  } catch (i) {
    ne(`뷰어를 시작할 수 없습니다: ${i.message}`, !0);
  }
}
function Nc(i, t, e) {
  if (![t, e].every(Number.isFinite)) throw new Error("이동 거리를 숫자로 입력하세요.");
  const n = Le($);
  for (const r of n.placements) i.includes(`rack:${r.rack_id}`) && (r.x += t, r.z += e);
  for (const r of n.blocks) i.includes(`block:${r.id}`) && (r.x += t, r.z += e);
  return co($, n, Ut.racks, i);
}
function Hl(i, t, e) {
  const n = Vn?.keys.has(i) ? [...Vn.keys] : [i], [r, s] = i.split(":"), a = r === "rack" ? $.placements.find((c) => String(c.rack_id) === s) : $.blocks.find((c) => c.id === s);
  if (!a) return;
  const o = r === "rack" ? { ...a, ...Fe(Ut.racks.find((c) => c.id === a.rack_id), a) } : a, l = yr(o, t, e);
  try {
    const c = Nc(n, l.x - a.x, l.z - a.z);
    if (JSON.stringify(c) === JSON.stringify($)) return;
    gn ||= { layout: Le($), racks: Ut.racks }, $ = c, Ie = !0;
    for (const h of $.placements) oe.movePlacement("rack", h.rack_id, h);
    for (const h of $.blocks) oe.movePlacement("block", h.id, h);
  } catch (c) {
    ne(c.message, !0);
  }
}
function Vl(i, t, e) {
  if (!Vn || Vn.keys.size < 2 || !Vn.keys.has(i)) return !1;
  const [n, r] = i.split(":"), s = n === "rack" ? $.placements.find((l) => String(l.rack_id) === r) : $.blocks.find((l) => l.id === r), a = n === "rack" ? { ...s, ...Fe(Ut.racks.find((l) => l.id === s.rack_id), s) } : s, o = yr(a, t, e);
  try {
    const l = ja($, Ut.racks, [...Vn.keys], "move", { x: o.x - s.x, z: o.z - s.z });
    gn ||= { layout: Le($), racks: Ut.racks }, $ = l, Ie = !0;
    for (const c of $.placements) oe.movePlacement("rack", c.rack_id, c);
    for (const c of $.blocks) oe.movePlacement("block", c.id, c);
  } catch (l) {
    ne(l.message, !0);
  }
  return !0;
}
l_();
