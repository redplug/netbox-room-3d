function un(i, t) {
  return { width: i.width, depth: i.depth, height: i.height, ...t?.dimensions };
}
function Ui(i) {
  const t = i.rotation === 90 || i.rotation === 270, e = t ? i.depth : i.width, n = t ? i.width : i.depth;
  return [i.x - e / 2, i.z - n / 2, i.x + e / 2, i.z + n / 2];
}
function hc(i, t) {
  return i = Ui(i), t = Ui(t), i[0] < t[2] - 0.01 && i[2] > t[0] + 0.01 && i[1] < t[3] - 0.01 && i[3] > t[1] + 0.01;
}
function Da(i, t) {
  const e = [], n = [];
  for (const s of i.placements) {
    const r = t.find((a) => a.id === s.rack_id);
    if (!r) {
      e.push("배치된 랙을 찾을 수 없습니다. 다시 불러오세요.");
      continue;
    }
    const o = un(r, s);
    o.height < r.u_height * 44.45 + 80 && e.push(`${r.name}: 높이가 U 공간보다 작습니다.`), n.push({ ...s, ...o, name: r.name });
  }
  n.push(...i.blocks);
  for (const s of ["width", "depth", "height", "grid"])
    (!Number.isFinite(i[s]) || i[s] <= 0) && e.push("서버실 크기와 격자를 확인하세요.");
  return n.forEach((s, r) => {
    const o = Ui(s);
    ![s.x, s.z, s.width, s.depth, s.height].every(Number.isFinite) || s.width <= 0 || s.depth <= 0 || s.height <= 0 ? e.push(`${s.name}: 치수가 올바르지 않습니다.`) : (o[0] < 0 || o[1] < 0 || o[2] > i.width || o[3] > i.depth || s.height > i.height) && e.push(`${s.name}: 서버실 경계를 벗어납니다.`), n.slice(0, r).forEach((a) => {
      hc(s, a) && e.push(`${s.name} / ${a.name}: 서로 겹칩니다.`);
    });
  }), e;
}
function La(i, t) {
  if (t.position == null || t.u_height <= 0) return null;
  const e = t.position - i.starting_unit;
  return e < 0 || e + t.u_height > i.u_height ? null : (i.desc_units ? i.u_height - e - t.u_height : e) * 44.45;
}
function dc(i, t, e = !0, n = 0) {
  return e ? n + Math.round((i - n) / t) * t : Math.round(i);
}
function xl(i) {
  if (!i) return "";
  try {
    const t = new URL(i, window.location.href);
    return ["http:", "https:"].includes(t.protocol) ? t.href : "";
  } catch {
    return "";
  }
}
function Br(i) {
  const t = /* @__PURE__ */ new Set();
  for (const e of i.devices) {
    const n = La(i, e);
    if (n != null)
      for (let s = Math.floor(n / 44.45 + 1e-8); s < Math.ceil(n / 44.45 + e.u_height - 1e-8); s++) t.add(s);
  }
  return {
    occupied: t,
    used: t.size,
    free: i.u_height - t.size,
    percent: Math.round(t.size / i.u_height * 100),
    count: i.devices.length
  };
}
function eo(i, t, e = "") {
  const n = t.trim().toLowerCase();
  return (!e || i.status === e) && (!n || [i.name, ...i.ip_addresses || [], ...i.primary_ips || []].some((s) => s.toLowerCase().includes(n)));
}
function no(i, t) {
  const e = [.../* @__PURE__ */ new Set([...i.primary_ips || [], ...i.ip_addresses || []])], n = e.filter((s) => s.toLowerCase().includes(t.trim().toLowerCase()));
  return { ips: n.length ? n : e, matched: !!t.trim() && n.length > 0 };
}
const uc = (i) => ({ active: "#16a34a", planned: "#3b82f6", staged: "#a855f7", offline: "#64748b", failed: "#dc2626", inventory: "#d97706", decommissioning: "#ea580c" })[i] || "#64748b", fc = (i) => i >= 90 ? "#dc2626" : i >= 70 ? "#d97706" : "#0d9488", ts = {
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
function io(i = !1) {
  const t = Array.from({ length: i ? 8 : 12 }, (e, n) => `<rect x="${28 + n * 34}" y="${i ? 22 : 16}" width="26" height="${i ? 24 : 37}" rx="2" fill="${i ? "#0e7490" : "#26374a"}" stroke="#566679"/><circle cx="${32 + n * 34}" cy="${i ? 27 : 45}" r="2" fill="#5eead4"/>`).join("");
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="70"><rect width="480" height="70" rx="4" fill="#a8b2c0"/><rect x="8" y="7" width="464" height="56" fill="#111c2b"/>${t}<text x="445" y="40" fill="#dbeafe" font-size="9" font-family="sans-serif" text-anchor="middle">${i ? "REAR" : "FRONT"}</text></svg>`)}`;
}
function pc(i = 1) {
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
    devices: Array.from({ length: 9 }, (s, r) => ({
      id: i * 1e4 + n * 100 + r,
      name: `${r < 2 ? "sw" : "srv"}-${String(n + 1).padStart(2, "0")}-${String(r + 1).padStart(2, "0")}`,
      model: r < 2 ? "48-port switch" : "Rack server · 2U",
      u_height: r < 2 ? 1 : 2,
      position: r < 2 ? 41 + r : 2 + (r - 2) * 4,
      face: n === 2 && r < 2 ? "rear" : "front",
      full_depth: r >= 2,
      status: r === 8 ? "offline" : "active",
      color: r < 2 ? "#3b82f6" : ["#0d9488", "#64748b", "#8b5cf6"][n % 3],
      front_image: r === 2 || r === 3 ? io() : null,
      rear_image: r === 2 ? io(!0) : null,
      images: [],
      url: "",
      interfaces: r >= 2 ? [{ id: r * 2, name: "eth0" }, { id: r * 2 + 1, name: "eth1" }] : [],
      primary_ips: r >= 2 ? [`192.0.2.${10 + r}/24`] : []
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
class mc {
  constructor(t) {
    this.demo = t.dataset.demo === "true", this.url = t.dataset.api, this.locations = [];
  }
  async request(t, e = {}) {
    const n = document.querySelector("[name=csrfmiddlewaretoken]")?.value || window.CSRF_TOKEN || "", s = await fetch(t, {
      credentials: "same-origin",
      ...e,
      headers: { "Content-Type": "application/json", "X-CSRFToken": n, ...e.headers }
    });
    let r;
    try {
      r = await s.json();
    } catch {
      throw new Error("응답을 읽을 수 없습니다. 로그인 상태와 서버 로그를 확인하세요.");
    }
    if (!s.ok) throw new Error(r.error || `요청 실패 (${s.status})`);
    return r;
  }
  async list() {
    return this.locations = this.demo ? [{ id: 1, site: "DEMO IDC", name: "서버실 A", has_racks: !0 }, { id: 2, site: "DEMO IDC", name: "네트워크실 B", has_racks: !0 }] : (await this.request(this.url)).locations, this.locations;
  }
  async load(t, e) {
    if (this.demo) {
      const s = pc(t), r = localStorage.getItem(`room3d-demo-v1-${t}`);
      return r && (s.layout = JSON.parse(r)), s;
    }
    const n = new URL(this.locations.find((s) => s.id === t).url, window.location.href);
    return e !== void 0 && n.searchParams.set("descendants", e), this.request(n);
  }
  async save(t, e) {
    if (this.demo) {
      const n = await this.load(t);
      if (n.layout.revision !== e.revision) throw new Error("다른 탭에서 먼저 저장했습니다. 다시 불러오세요.");
      const s = structuredClone(e);
      return s.revision++, localStorage.setItem(`room3d-demo-v1-${t}`, JSON.stringify(s)), { ...n, layout: s };
    }
    return this.request(this.locations.find((n) => n.id === t).url, { method: "PUT", body: JSON.stringify(e) });
  }
}
const Ia = "180", Pi = { ROTATE: 0, DOLLY: 1, PAN: 2 }, Ai = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 }, _c = 0, so = 1, gc = 2, Ml = 1, vc = 2, wn = 3, Hn = 0, ze = 1, hn = 2, kn = 0, Di = 1, ro = 2, ao = 3, oo = 4, xc = 5, Qn = 100, Mc = 101, Sc = 102, Ec = 103, yc = 104, bc = 200, Tc = 201, Ac = 202, wc = 203, kr = 204, zr = 205, Rc = 206, Cc = 207, Pc = 208, Dc = 209, Lc = 210, Ic = 211, Uc = 212, Nc = 213, Fc = 214, Hr = 0, Vr = 1, Gr = 2, Ni = 3, Wr = 4, Xr = 5, $r = 6, qr = 7, Sl = 0, Oc = 1, Bc = 2, zn = 0, kc = 1, zc = 2, Hc = 3, Vc = 4, Gc = 5, Wc = 6, Xc = 7, El = 300, Fi = 301, Oi = 302, Yr = 303, jr = 304, Js = 306, Kr = 1e3, ei = 1001, Zr = 1002, rn = 1003, $c = 1004, fs = 1005, fn = 1006, sr = 1007, ni = 1008, vn = 1009, yl = 1010, bl = 1011, es = 1012, Ua = 1013, si = 1014, Cn = 1015, cs = 1016, Na = 1017, Fa = 1018, ns = 1020, Tl = 35902, Al = 35899, wl = 1021, Rl = 1022, sn = 1023, is = 1026, ss = 1027, Cl = 1028, Oa = 1029, Pl = 1030, Ba = 1031, ka = 1033, zs = 33776, Hs = 33777, Vs = 33778, Gs = 33779, Jr = 35840, Qr = 35841, ta = 35842, ea = 35843, na = 36196, ia = 37492, sa = 37496, ra = 37808, aa = 37809, oa = 37810, la = 37811, ca = 37812, ha = 37813, da = 37814, ua = 37815, fa = 37816, pa = 37817, ma = 37818, _a = 37819, ga = 37820, va = 37821, xa = 36492, Ma = 36494, Sa = 36495, Ea = 36283, ya = 36284, ba = 36285, Ta = 36286, qc = 3200, Yc = 3201, Dl = 0, jc = 1, Bn = "", ke = "srgb", Bi = "srgb-linear", Xs = "linear", te = "srgb", ci = 7680, lo = 519, Kc = 512, Zc = 513, Jc = 514, Ll = 515, Qc = 516, th = 517, eh = 518, nh = 519, co = 35044, ho = "300 es", pn = 2e3, $s = 2001;
class oi {
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
    const s = n[t];
    if (s !== void 0) {
      const r = s.indexOf(e);
      r !== -1 && s.splice(r, 1);
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
      const s = n.slice(0);
      for (let r = 0, o = s.length; r < o; r++)
        s[r].call(this, t);
      t.target = null;
    }
  }
}
const Re = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
let uo = 1234567;
const Li = Math.PI / 180, rs = 180 / Math.PI;
function zi() {
  const i = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
  return (Re[i & 255] + Re[i >> 8 & 255] + Re[i >> 16 & 255] + Re[i >> 24 & 255] + "-" + Re[t & 255] + Re[t >> 8 & 255] + "-" + Re[t >> 16 & 15 | 64] + Re[t >> 24 & 255] + "-" + Re[e & 63 | 128] + Re[e >> 8 & 255] + "-" + Re[e >> 16 & 255] + Re[e >> 24 & 255] + Re[n & 255] + Re[n >> 8 & 255] + Re[n >> 16 & 255] + Re[n >> 24 & 255]).toLowerCase();
}
function Vt(i, t, e) {
  return Math.max(t, Math.min(e, i));
}
function za(i, t) {
  return (i % t + t) % t;
}
function ih(i, t, e, n, s) {
  return n + (i - t) * (s - n) / (e - t);
}
function sh(i, t, e) {
  return i !== t ? (e - i) / (t - i) : 0;
}
function Qi(i, t, e) {
  return (1 - e) * i + e * t;
}
function rh(i, t, e, n) {
  return Qi(i, t, 1 - Math.exp(-e * n));
}
function ah(i, t = 1) {
  return t - Math.abs(za(i, t * 2) - t);
}
function oh(i, t, e) {
  return i <= t ? 0 : i >= e ? 1 : (i = (i - t) / (e - t), i * i * (3 - 2 * i));
}
function lh(i, t, e) {
  return i <= t ? 0 : i >= e ? 1 : (i = (i - t) / (e - t), i * i * i * (i * (i * 6 - 15) + 10));
}
function ch(i, t) {
  return i + Math.floor(Math.random() * (t - i + 1));
}
function hh(i, t) {
  return i + Math.random() * (t - i);
}
function dh(i) {
  return i * (0.5 - Math.random());
}
function uh(i) {
  i !== void 0 && (uo = i);
  let t = uo += 1831565813;
  return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function fh(i) {
  return i * Li;
}
function ph(i) {
  return i * rs;
}
function mh(i) {
  return (i & i - 1) === 0 && i !== 0;
}
function _h(i) {
  return Math.pow(2, Math.ceil(Math.log(i) / Math.LN2));
}
function gh(i) {
  return Math.pow(2, Math.floor(Math.log(i) / Math.LN2));
}
function vh(i, t, e, n, s) {
  const r = Math.cos, o = Math.sin, a = r(e / 2), l = o(e / 2), c = r((t + n) / 2), h = o((t + n) / 2), u = r((t - n) / 2), f = o((t - n) / 2), m = r((n - t) / 2), _ = o((n - t) / 2);
  switch (s) {
    case "XYX":
      i.set(a * h, l * u, l * f, a * c);
      break;
    case "YZY":
      i.set(l * f, a * h, l * u, a * c);
      break;
    case "ZXZ":
      i.set(l * u, l * f, a * h, a * c);
      break;
    case "XZX":
      i.set(a * h, l * _, l * m, a * c);
      break;
    case "YXY":
      i.set(l * m, a * h, l * _, a * c);
      break;
    case "ZYZ":
      i.set(l * _, l * m, a * h, a * c);
      break;
    default:
      console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + s);
  }
}
function bi(i, t) {
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
function Ie(i, t) {
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
const Il = {
  DEG2RAD: Li,
  RAD2DEG: rs,
  /**
   * Generate a [UUID]{@link https://en.wikipedia.org/wiki/Universally_unique_identifier}
   * (universally unique identifier).
   *
   * @static
   * @method
   * @return {string} The UUID.
   */
  generateUUID: zi,
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
  clamp: Vt,
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
  euclideanModulo: za,
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
  mapLinear: ih,
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
  inverseLerp: sh,
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
  lerp: Qi,
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
  damp: rh,
  /**
   * Returns a value that alternates between `0` and the given `length` parameter.
   *
   * @static
   * @method
   * @param {number} x - The value to pingpong.
   * @param {number} [length=1] - The positive value the function will pingpong to.
   * @return {number} The alternated value.
   */
  pingpong: ah,
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
  smoothstep: oh,
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
  smootherstep: lh,
  /**
   * Returns a random integer from `<low, high>` interval.
   *
   * @static
   * @method
   * @param {number} low - The lower value boundary.
   * @param {number} high - The upper value boundary
   * @return {number} A random integer.
   */
  randInt: ch,
  /**
   * Returns a random float from `<low, high>` interval.
   *
   * @static
   * @method
   * @param {number} low - The lower value boundary.
   * @param {number} high - The upper value boundary
   * @return {number} A random float.
   */
  randFloat: hh,
  /**
   * Returns a random integer from `<-range/2, range/2>` interval.
   *
   * @static
   * @method
   * @param {number} range - Defines the value range.
   * @return {number} A random float.
   */
  randFloatSpread: dh,
  /**
   * Returns a deterministic pseudo-random float in the interval `[0, 1]`.
   *
   * @static
   * @method
   * @param {number} [s] - The integer seed.
   * @return {number} A random float.
   */
  seededRandom: uh,
  /**
   * Converts degrees to radians.
   *
   * @static
   * @method
   * @param {number} degrees - A value in degrees.
   * @return {number} The converted value in radians.
   */
  degToRad: fh,
  /**
   * Converts radians to degrees.
   *
   * @static
   * @method
   * @param {number} radians - A value in radians.
   * @return {number} The converted value in degrees.
   */
  radToDeg: ph,
  /**
   * Returns `true` if the given number is a power of two.
   *
   * @static
   * @method
   * @param {number} value - The value to check.
   * @return {boolean} Whether the given number is a power of two or not.
   */
  isPowerOfTwo: mh,
  /**
   * Returns the smallest power of two that is greater than or equal to the given number.
   *
   * @static
   * @method
   * @param {number} value - The value to find a POT for.
   * @return {number} The smallest power of two that is greater than or equal to the given number.
   */
  ceilPowerOfTwo: _h,
  /**
   * Returns the largest power of two that is less than or equal to the given number.
   *
   * @static
   * @method
   * @param {number} value - The value to find a POT for.
   * @return {number} The largest power of two that is less than or equal to the given number.
   */
  floorPowerOfTwo: gh,
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
  setQuaternionFromProperEuler: vh,
  /**
   * Normalizes the given value according to the given typed array.
   *
   * @static
   * @method
   * @param {number} value - The float value in the range `[0,1]` to normalize.
   * @param {TypedArray} array - The typed array that defines the data type of the value.
   * @return {number} The normalize value.
   */
  normalize: Ie,
  /**
   * Denormalizes the given value according to the given typed array.
   *
   * @static
   * @method
   * @param {number} value - The value to denormalize.
   * @param {TypedArray} array - The typed array that defines the data type of the value.
   * @return {number} The denormalize (float) value in the range `[0,1]`.
   */
  denormalize: bi
};
class Dt {
  /**
   * Constructs a new 2D vector.
   *
   * @param {number} [x=0] - The x value of this vector.
   * @param {number} [y=0] - The y value of this vector.
   */
  constructor(t = 0, e = 0) {
    Dt.prototype.isVector2 = !0, this.x = t, this.y = e;
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
    const e = this.x, n = this.y, s = t.elements;
    return this.x = s[0] * e + s[3] * n + s[6], this.y = s[1] * e + s[4] * n + s[7], this;
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
    return this.x = Vt(this.x, t.x, e.x), this.y = Vt(this.y, t.y, e.y), this;
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
    return this.x = Vt(this.x, t, e), this.y = Vt(this.y, t, e), this;
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
    return this.divideScalar(n || 1).multiplyScalar(Vt(n, t, e));
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
    return Math.acos(Vt(n, -1, 1));
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
    const n = Math.cos(e), s = Math.sin(e), r = this.x - t.x, o = this.y - t.y;
    return this.x = r * n - o * s + t.x, this.y = r * s + o * n + t.y, this;
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
class ri {
  /**
   * Constructs a new quaternion.
   *
   * @param {number} [x=0] - The x value of this quaternion.
   * @param {number} [y=0] - The y value of this quaternion.
   * @param {number} [z=0] - The z value of this quaternion.
   * @param {number} [w=1] - The w value of this quaternion.
   */
  constructor(t = 0, e = 0, n = 0, s = 1) {
    this.isQuaternion = !0, this._x = t, this._y = e, this._z = n, this._w = s;
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
  static slerpFlat(t, e, n, s, r, o, a) {
    let l = n[s + 0], c = n[s + 1], h = n[s + 2], u = n[s + 3];
    const f = r[o + 0], m = r[o + 1], _ = r[o + 2], v = r[o + 3];
    if (a === 0) {
      t[e + 0] = l, t[e + 1] = c, t[e + 2] = h, t[e + 3] = u;
      return;
    }
    if (a === 1) {
      t[e + 0] = f, t[e + 1] = m, t[e + 2] = _, t[e + 3] = v;
      return;
    }
    if (u !== v || l !== f || c !== m || h !== _) {
      let p = 1 - a;
      const d = l * f + c * m + h * _ + u * v, T = d >= 0 ? 1 : -1, A = 1 - d * d;
      if (A > Number.EPSILON) {
        const b = Math.sqrt(A), R = Math.atan2(b, d * T);
        p = Math.sin(p * R) / b, a = Math.sin(a * R) / b;
      }
      const E = a * T;
      if (l = l * p + f * E, c = c * p + m * E, h = h * p + _ * E, u = u * p + v * E, p === 1 - a) {
        const b = 1 / Math.sqrt(l * l + c * c + h * h + u * u);
        l *= b, c *= b, h *= b, u *= b;
      }
    }
    t[e] = l, t[e + 1] = c, t[e + 2] = h, t[e + 3] = u;
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
  static multiplyQuaternionsFlat(t, e, n, s, r, o) {
    const a = n[s], l = n[s + 1], c = n[s + 2], h = n[s + 3], u = r[o], f = r[o + 1], m = r[o + 2], _ = r[o + 3];
    return t[e] = a * _ + h * u + l * m - c * f, t[e + 1] = l * _ + h * f + c * u - a * m, t[e + 2] = c * _ + h * m + a * f - l * u, t[e + 3] = h * _ - a * u - l * f - c * m, t;
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
  set(t, e, n, s) {
    return this._x = t, this._y = e, this._z = n, this._w = s, this._onChangeCallback(), this;
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
    const n = t._x, s = t._y, r = t._z, o = t._order, a = Math.cos, l = Math.sin, c = a(n / 2), h = a(s / 2), u = a(r / 2), f = l(n / 2), m = l(s / 2), _ = l(r / 2);
    switch (o) {
      case "XYZ":
        this._x = f * h * u + c * m * _, this._y = c * m * u - f * h * _, this._z = c * h * _ + f * m * u, this._w = c * h * u - f * m * _;
        break;
      case "YXZ":
        this._x = f * h * u + c * m * _, this._y = c * m * u - f * h * _, this._z = c * h * _ - f * m * u, this._w = c * h * u + f * m * _;
        break;
      case "ZXY":
        this._x = f * h * u - c * m * _, this._y = c * m * u + f * h * _, this._z = c * h * _ + f * m * u, this._w = c * h * u - f * m * _;
        break;
      case "ZYX":
        this._x = f * h * u - c * m * _, this._y = c * m * u + f * h * _, this._z = c * h * _ - f * m * u, this._w = c * h * u + f * m * _;
        break;
      case "YZX":
        this._x = f * h * u + c * m * _, this._y = c * m * u + f * h * _, this._z = c * h * _ - f * m * u, this._w = c * h * u - f * m * _;
        break;
      case "XZY":
        this._x = f * h * u - c * m * _, this._y = c * m * u - f * h * _, this._z = c * h * _ + f * m * u, this._w = c * h * u + f * m * _;
        break;
      default:
        console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + o);
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
    const n = e / 2, s = Math.sin(n);
    return this._x = t.x * s, this._y = t.y * s, this._z = t.z * s, this._w = Math.cos(n), this._onChangeCallback(), this;
  }
  /**
   * Sets this quaternion from the given rotation matrix.
   *
   * @param {Matrix4} m - A 4x4 matrix of which the upper 3x3 of matrix is a pure rotation matrix (i.e. unscaled).
   * @return {Quaternion} A reference to this quaternion.
   */
  setFromRotationMatrix(t) {
    const e = t.elements, n = e[0], s = e[4], r = e[8], o = e[1], a = e[5], l = e[9], c = e[2], h = e[6], u = e[10], f = n + a + u;
    if (f > 0) {
      const m = 0.5 / Math.sqrt(f + 1);
      this._w = 0.25 / m, this._x = (h - l) * m, this._y = (r - c) * m, this._z = (o - s) * m;
    } else if (n > a && n > u) {
      const m = 2 * Math.sqrt(1 + n - a - u);
      this._w = (h - l) / m, this._x = 0.25 * m, this._y = (s + o) / m, this._z = (r + c) / m;
    } else if (a > u) {
      const m = 2 * Math.sqrt(1 + a - n - u);
      this._w = (r - c) / m, this._x = (s + o) / m, this._y = 0.25 * m, this._z = (l + h) / m;
    } else {
      const m = 2 * Math.sqrt(1 + u - n - a);
      this._w = (o - s) / m, this._x = (r + c) / m, this._y = (l + h) / m, this._z = 0.25 * m;
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
    return 2 * Math.acos(Math.abs(Vt(this.dot(t), -1, 1)));
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
    const s = Math.min(1, e / n);
    return this.slerp(t, s), this;
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
    const n = t._x, s = t._y, r = t._z, o = t._w, a = e._x, l = e._y, c = e._z, h = e._w;
    return this._x = n * h + o * a + s * c - r * l, this._y = s * h + o * l + r * a - n * c, this._z = r * h + o * c + n * l - s * a, this._w = o * h - n * a - s * l - r * c, this._onChangeCallback(), this;
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
    const n = this._x, s = this._y, r = this._z, o = this._w;
    let a = o * t._w + n * t._x + s * t._y + r * t._z;
    if (a < 0 ? (this._w = -t._w, this._x = -t._x, this._y = -t._y, this._z = -t._z, a = -a) : this.copy(t), a >= 1)
      return this._w = o, this._x = n, this._y = s, this._z = r, this;
    const l = 1 - a * a;
    if (l <= Number.EPSILON) {
      const m = 1 - e;
      return this._w = m * o + e * this._w, this._x = m * n + e * this._x, this._y = m * s + e * this._y, this._z = m * r + e * this._z, this.normalize(), this;
    }
    const c = Math.sqrt(l), h = Math.atan2(c, a), u = Math.sin((1 - e) * h) / c, f = Math.sin(e * h) / c;
    return this._w = o * u + this._w * f, this._x = n * u + this._x * f, this._y = s * u + this._y * f, this._z = r * u + this._z * f, this._onChangeCallback(), this;
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
    const t = 2 * Math.PI * Math.random(), e = 2 * Math.PI * Math.random(), n = Math.random(), s = Math.sqrt(1 - n), r = Math.sqrt(n);
    return this.set(
      s * Math.sin(t),
      s * Math.cos(t),
      r * Math.sin(e),
      r * Math.cos(e)
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
class L {
  /**
   * Constructs a new 3D vector.
   *
   * @param {number} [x=0] - The x value of this vector.
   * @param {number} [y=0] - The y value of this vector.
   * @param {number} [z=0] - The z value of this vector.
   */
  constructor(t = 0, e = 0, n = 0) {
    L.prototype.isVector3 = !0, this.x = t, this.y = e, this.z = n;
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
    return this.applyQuaternion(fo.setFromEuler(t));
  }
  /**
   * Applies a rotation specified by an axis and an angle to this vector.
   *
   * @param {Vector3} axis - A normalized vector representing the rotation axis.
   * @param {number} angle - The angle in radians.
   * @return {Vector3} A reference to this vector.
   */
  applyAxisAngle(t, e) {
    return this.applyQuaternion(fo.setFromAxisAngle(t, e));
  }
  /**
   * Multiplies this vector with the given 3x3 matrix.
   *
   * @param {Matrix3} m - The 3x3 matrix.
   * @return {Vector3} A reference to this vector.
   */
  applyMatrix3(t) {
    const e = this.x, n = this.y, s = this.z, r = t.elements;
    return this.x = r[0] * e + r[3] * n + r[6] * s, this.y = r[1] * e + r[4] * n + r[7] * s, this.z = r[2] * e + r[5] * n + r[8] * s, this;
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
    const e = this.x, n = this.y, s = this.z, r = t.elements, o = 1 / (r[3] * e + r[7] * n + r[11] * s + r[15]);
    return this.x = (r[0] * e + r[4] * n + r[8] * s + r[12]) * o, this.y = (r[1] * e + r[5] * n + r[9] * s + r[13]) * o, this.z = (r[2] * e + r[6] * n + r[10] * s + r[14]) * o, this;
  }
  /**
   * Applies the given Quaternion to this vector.
   *
   * @param {Quaternion} q - The Quaternion.
   * @return {Vector3} A reference to this vector.
   */
  applyQuaternion(t) {
    const e = this.x, n = this.y, s = this.z, r = t.x, o = t.y, a = t.z, l = t.w, c = 2 * (o * s - a * n), h = 2 * (a * e - r * s), u = 2 * (r * n - o * e);
    return this.x = e + l * c + o * u - a * h, this.y = n + l * h + a * c - r * u, this.z = s + l * u + r * h - o * c, this;
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
    const e = this.x, n = this.y, s = this.z, r = t.elements;
    return this.x = r[0] * e + r[4] * n + r[8] * s, this.y = r[1] * e + r[5] * n + r[9] * s, this.z = r[2] * e + r[6] * n + r[10] * s, this.normalize();
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
    return this.x = Vt(this.x, t.x, e.x), this.y = Vt(this.y, t.y, e.y), this.z = Vt(this.z, t.z, e.z), this;
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
    return this.x = Vt(this.x, t, e), this.y = Vt(this.y, t, e), this.z = Vt(this.z, t, e), this;
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
    return this.divideScalar(n || 1).multiplyScalar(Vt(n, t, e));
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
    const n = t.x, s = t.y, r = t.z, o = e.x, a = e.y, l = e.z;
    return this.x = s * l - r * a, this.y = r * o - n * l, this.z = n * a - s * o, this;
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
    return rr.copy(this).projectOnVector(t), this.sub(rr);
  }
  /**
   * Reflects this vector off a plane orthogonal to the given normal vector.
   *
   * @param {Vector3} normal - The (normalized) normal vector.
   * @return {Vector3} A reference to this vector.
   */
  reflect(t) {
    return this.sub(rr.copy(t).multiplyScalar(2 * this.dot(t)));
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
    return Math.acos(Vt(n, -1, 1));
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
    const e = this.x - t.x, n = this.y - t.y, s = this.z - t.z;
    return e * e + n * n + s * s;
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
    const s = Math.sin(e) * t;
    return this.x = s * Math.sin(n), this.y = Math.cos(e) * t, this.z = s * Math.cos(n), this;
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
    const e = this.setFromMatrixColumn(t, 0).length(), n = this.setFromMatrixColumn(t, 1).length(), s = this.setFromMatrixColumn(t, 2).length();
    return this.x = e, this.y = n, this.z = s, this;
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
const rr = /* @__PURE__ */ new L(), fo = /* @__PURE__ */ new ri();
class Bt {
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
  constructor(t, e, n, s, r, o, a, l, c) {
    Bt.prototype.isMatrix3 = !0, this.elements = [
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ], t !== void 0 && this.set(t, e, n, s, r, o, a, l, c);
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
  set(t, e, n, s, r, o, a, l, c) {
    const h = this.elements;
    return h[0] = t, h[1] = s, h[2] = a, h[3] = e, h[4] = r, h[5] = l, h[6] = n, h[7] = o, h[8] = c, this;
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
    const n = t.elements, s = e.elements, r = this.elements, o = n[0], a = n[3], l = n[6], c = n[1], h = n[4], u = n[7], f = n[2], m = n[5], _ = n[8], v = s[0], p = s[3], d = s[6], T = s[1], A = s[4], E = s[7], b = s[2], R = s[5], C = s[8];
    return r[0] = o * v + a * T + l * b, r[3] = o * p + a * A + l * R, r[6] = o * d + a * E + l * C, r[1] = c * v + h * T + u * b, r[4] = c * p + h * A + u * R, r[7] = c * d + h * E + u * C, r[2] = f * v + m * T + _ * b, r[5] = f * p + m * A + _ * R, r[8] = f * d + m * E + _ * C, this;
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
    const t = this.elements, e = t[0], n = t[1], s = t[2], r = t[3], o = t[4], a = t[5], l = t[6], c = t[7], h = t[8];
    return e * o * h - e * a * c - n * r * h + n * a * l + s * r * c - s * o * l;
  }
  /**
   * Inverts this matrix, using the [analytic method]{@link https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution}.
   * You can not invert with a determinant of zero. If you attempt this, the method produces
   * a zero matrix instead.
   *
   * @return {Matrix3} A reference to this matrix.
   */
  invert() {
    const t = this.elements, e = t[0], n = t[1], s = t[2], r = t[3], o = t[4], a = t[5], l = t[6], c = t[7], h = t[8], u = h * o - a * c, f = a * l - h * r, m = c * r - o * l, _ = e * u + n * f + s * m;
    if (_ === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const v = 1 / _;
    return t[0] = u * v, t[1] = (s * c - h * n) * v, t[2] = (a * n - s * o) * v, t[3] = f * v, t[4] = (h * e - s * l) * v, t[5] = (s * r - a * e) * v, t[6] = m * v, t[7] = (n * l - c * e) * v, t[8] = (o * e - n * r) * v, this;
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
  setUvTransform(t, e, n, s, r, o, a) {
    const l = Math.cos(r), c = Math.sin(r);
    return this.set(
      n * l,
      n * c,
      -n * (l * o + c * a) + o + t,
      -s * c,
      s * l,
      -s * (-c * o + l * a) + a + e,
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
    return this.premultiply(ar.makeScale(t, e)), this;
  }
  /**
   * Rotates this matrix by the given angle.
   *
   * @param {number} theta - The rotation in radians.
   * @return {Matrix3} A reference to this matrix.
   */
  rotate(t) {
    return this.premultiply(ar.makeRotation(-t)), this;
  }
  /**
   * Translates this matrix by the given scalar values.
   *
   * @param {number} tx - The amount to translate in the X axis.
   * @param {number} ty - The amount to translate in the Y axis.
   * @return {Matrix3} A reference to this matrix.
   */
  translate(t, e) {
    return this.premultiply(ar.makeTranslation(t, e)), this;
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
    for (let s = 0; s < 9; s++)
      if (e[s] !== n[s]) return !1;
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
const ar = /* @__PURE__ */ new Bt();
function Ul(i) {
  for (let t = i.length - 1; t >= 0; --t)
    if (i[t] >= 65535) return !0;
  return !1;
}
function qs(i) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", i);
}
function xh() {
  const i = qs("canvas");
  return i.style.display = "block", i;
}
const po = {};
function as(i) {
  i in po || (po[i] = !0, console.warn(i));
}
function Mh(i, t, e) {
  return new Promise(function(n, s) {
    function r() {
      switch (i.clientWaitSync(t, i.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case i.WAIT_FAILED:
          s();
          break;
        case i.TIMEOUT_EXPIRED:
          setTimeout(r, e);
          break;
        default:
          n();
      }
    }
    setTimeout(r, e);
  });
}
const mo = /* @__PURE__ */ new Bt().set(
  0.4123908,
  0.3575843,
  0.1804808,
  0.212639,
  0.7151687,
  0.0721923,
  0.0193308,
  0.1191948,
  0.9505322
), _o = /* @__PURE__ */ new Bt().set(
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
function Sh() {
  const i = {
    enabled: !0,
    workingColorSpace: Bi,
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
    convert: function(s, r, o) {
      return this.enabled === !1 || r === o || !r || !o || (this.spaces[r].transfer === te && (s.r = Pn(s.r), s.g = Pn(s.g), s.b = Pn(s.b)), this.spaces[r].primaries !== this.spaces[o].primaries && (s.applyMatrix3(this.spaces[r].toXYZ), s.applyMatrix3(this.spaces[o].fromXYZ)), this.spaces[o].transfer === te && (s.r = Ii(s.r), s.g = Ii(s.g), s.b = Ii(s.b))), s;
    },
    workingToColorSpace: function(s, r) {
      return this.convert(s, this.workingColorSpace, r);
    },
    colorSpaceToWorking: function(s, r) {
      return this.convert(s, r, this.workingColorSpace);
    },
    getPrimaries: function(s) {
      return this.spaces[s].primaries;
    },
    getTransfer: function(s) {
      return s === Bn ? Xs : this.spaces[s].transfer;
    },
    getToneMappingMode: function(s) {
      return this.spaces[s].outputColorSpaceConfig.toneMappingMode || "standard";
    },
    getLuminanceCoefficients: function(s, r = this.workingColorSpace) {
      return s.fromArray(this.spaces[r].luminanceCoefficients);
    },
    define: function(s) {
      Object.assign(this.spaces, s);
    },
    // Internal APIs
    _getMatrix: function(s, r, o) {
      return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ);
    },
    _getDrawingBufferColorSpace: function(s) {
      return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace;
    },
    _getUnpackColorSpace: function(s = this.workingColorSpace) {
      return this.spaces[s].workingColorSpaceConfig.unpackColorSpace;
    },
    // Deprecated
    fromWorkingColorSpace: function(s, r) {
      return as("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."), i.workingToColorSpace(s, r);
    },
    toWorkingColorSpace: function(s, r) {
      return as("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."), i.colorSpaceToWorking(s, r);
    }
  }, t = [0.64, 0.33, 0.3, 0.6, 0.15, 0.06], e = [0.2126, 0.7152, 0.0722], n = [0.3127, 0.329];
  return i.define({
    [Bi]: {
      primaries: t,
      whitePoint: n,
      transfer: Xs,
      toXYZ: mo,
      fromXYZ: _o,
      luminanceCoefficients: e,
      workingColorSpaceConfig: { unpackColorSpace: ke },
      outputColorSpaceConfig: { drawingBufferColorSpace: ke }
    },
    [ke]: {
      primaries: t,
      whitePoint: n,
      transfer: te,
      toXYZ: mo,
      fromXYZ: _o,
      luminanceCoefficients: e,
      outputColorSpaceConfig: { drawingBufferColorSpace: ke }
    }
  }), i;
}
const jt = /* @__PURE__ */ Sh();
function Pn(i) {
  return i < 0.04045 ? i * 0.0773993808 : Math.pow(i * 0.9478672986 + 0.0521327014, 2.4);
}
function Ii(i) {
  return i < 31308e-7 ? i * 12.92 : 1.055 * Math.pow(i, 0.41666) - 0.055;
}
let hi;
class Eh {
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
      hi === void 0 && (hi = qs("canvas")), hi.width = t.width, hi.height = t.height;
      const s = hi.getContext("2d");
      t instanceof ImageData ? s.putImageData(t, 0, 0) : s.drawImage(t, 0, 0, t.width, t.height), n = hi;
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
      const e = qs("canvas");
      e.width = t.width, e.height = t.height;
      const n = e.getContext("2d");
      n.drawImage(t, 0, 0, t.width, t.height);
      const s = n.getImageData(0, 0, t.width, t.height), r = s.data;
      for (let o = 0; o < r.length; o++)
        r[o] = Pn(r[o] / 255) * 255;
      return n.putImageData(s, 0, 0), e;
    } else if (t.data) {
      const e = t.data.slice(0);
      for (let n = 0; n < e.length; n++)
        e instanceof Uint8Array || e instanceof Uint8ClampedArray ? e[n] = Math.floor(Pn(e[n] / 255) * 255) : e[n] = Pn(e[n]);
      return {
        data: e,
        width: t.width,
        height: t.height
      };
    } else
      return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), t;
  }
}
let yh = 0;
class Ha {
  /**
   * Constructs a new video texture.
   *
   * @param {any} [data=null] - The data definition of a texture.
   */
  constructor(t = null) {
    this.isSource = !0, Object.defineProperty(this, "id", { value: yh++ }), this.uuid = zi(), this.data = t, this.dataReady = !0, this.version = 0;
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
    }, s = this.data;
    if (s !== null) {
      let r;
      if (Array.isArray(s)) {
        r = [];
        for (let o = 0, a = s.length; o < a; o++)
          s[o].isDataTexture ? r.push(or(s[o].image)) : r.push(or(s[o]));
      } else
        r = or(s);
      n.url = r;
    }
    return e || (t.images[this.uuid] = n), n;
  }
}
function or(i) {
  return typeof HTMLImageElement < "u" && i instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && i instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && i instanceof ImageBitmap ? Eh.getDataURL(i) : i.data ? {
    data: Array.from(i.data),
    width: i.width,
    height: i.height,
    type: i.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let bh = 0;
const lr = /* @__PURE__ */ new L();
class Fe extends oi {
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
  constructor(t = Fe.DEFAULT_IMAGE, e = Fe.DEFAULT_MAPPING, n = ei, s = ei, r = fn, o = ni, a = sn, l = vn, c = Fe.DEFAULT_ANISOTROPY, h = Bn) {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: bh++ }), this.uuid = zi(), this.name = "", this.source = new Ha(t), this.mipmaps = [], this.mapping = e, this.channel = 0, this.wrapS = n, this.wrapT = s, this.magFilter = r, this.minFilter = o, this.anisotropy = c, this.format = a, this.internalFormat = null, this.type = l, this.offset = new Dt(0, 0), this.repeat = new Dt(1, 1), this.center = new Dt(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Bt(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.updateRanges = [], this.version = 0, this.onUpdate = null, this.renderTarget = null, this.isRenderTargetTexture = !1, this.isArrayTexture = !!(t && t.depth && t.depth > 1), this.pmremVersion = 0;
  }
  /**
   * The width of the texture in pixels.
   */
  get width() {
    return this.source.getSize(lr).x;
  }
  /**
   * The height of the texture in pixels.
   */
  get height() {
    return this.source.getSize(lr).y;
  }
  /**
   * The depth of the texture in pixels.
   */
  get depth() {
    return this.source.getSize(lr).z;
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
      const s = this[e];
      if (s === void 0) {
        console.warn(`THREE.Texture.setValues(): property '${e}' does not exist.`);
        continue;
      }
      s && n && s.isVector2 && n.isVector2 || s && n && s.isVector3 && n.isVector3 || s && n && s.isMatrix3 && n.isMatrix3 ? s.copy(n) : this[e] = n;
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
    if (this.mapping !== El) return t;
    if (t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1)
      switch (this.wrapS) {
        case Kr:
          t.x = t.x - Math.floor(t.x);
          break;
        case ei:
          t.x = t.x < 0 ? 0 : 1;
          break;
        case Zr:
          Math.abs(Math.floor(t.x) % 2) === 1 ? t.x = Math.ceil(t.x) - t.x : t.x = t.x - Math.floor(t.x);
          break;
      }
    if (t.y < 0 || t.y > 1)
      switch (this.wrapT) {
        case Kr:
          t.y = t.y - Math.floor(t.y);
          break;
        case ei:
          t.y = t.y < 0 ? 0 : 1;
          break;
        case Zr:
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
Fe.DEFAULT_IMAGE = null;
Fe.DEFAULT_MAPPING = El;
Fe.DEFAULT_ANISOTROPY = 1;
class fe {
  /**
   * Constructs a new 4D vector.
   *
   * @param {number} [x=0] - The x value of this vector.
   * @param {number} [y=0] - The y value of this vector.
   * @param {number} [z=0] - The z value of this vector.
   * @param {number} [w=1] - The w value of this vector.
   */
  constructor(t = 0, e = 0, n = 0, s = 1) {
    fe.prototype.isVector4 = !0, this.x = t, this.y = e, this.z = n, this.w = s;
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
  set(t, e, n, s) {
    return this.x = t, this.y = e, this.z = n, this.w = s, this;
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
    const e = this.x, n = this.y, s = this.z, r = this.w, o = t.elements;
    return this.x = o[0] * e + o[4] * n + o[8] * s + o[12] * r, this.y = o[1] * e + o[5] * n + o[9] * s + o[13] * r, this.z = o[2] * e + o[6] * n + o[10] * s + o[14] * r, this.w = o[3] * e + o[7] * n + o[11] * s + o[15] * r, this;
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
    let e, n, s, r;
    const l = t.elements, c = l[0], h = l[4], u = l[8], f = l[1], m = l[5], _ = l[9], v = l[2], p = l[6], d = l[10];
    if (Math.abs(h - f) < 0.01 && Math.abs(u - v) < 0.01 && Math.abs(_ - p) < 0.01) {
      if (Math.abs(h + f) < 0.1 && Math.abs(u + v) < 0.1 && Math.abs(_ + p) < 0.1 && Math.abs(c + m + d - 3) < 0.1)
        return this.set(1, 0, 0, 0), this;
      e = Math.PI;
      const A = (c + 1) / 2, E = (m + 1) / 2, b = (d + 1) / 2, R = (h + f) / 4, C = (u + v) / 4, N = (_ + p) / 4;
      return A > E && A > b ? A < 0.01 ? (n = 0, s = 0.707106781, r = 0.707106781) : (n = Math.sqrt(A), s = R / n, r = C / n) : E > b ? E < 0.01 ? (n = 0.707106781, s = 0, r = 0.707106781) : (s = Math.sqrt(E), n = R / s, r = N / s) : b < 0.01 ? (n = 0.707106781, s = 0.707106781, r = 0) : (r = Math.sqrt(b), n = C / r, s = N / r), this.set(n, s, r, e), this;
    }
    let T = Math.sqrt((p - _) * (p - _) + (u - v) * (u - v) + (f - h) * (f - h));
    return Math.abs(T) < 1e-3 && (T = 1), this.x = (p - _) / T, this.y = (u - v) / T, this.z = (f - h) / T, this.w = Math.acos((c + m + d - 1) / 2), this;
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
    return this.x = Vt(this.x, t.x, e.x), this.y = Vt(this.y, t.y, e.y), this.z = Vt(this.z, t.z, e.z), this.w = Vt(this.w, t.w, e.w), this;
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
    return this.x = Vt(this.x, t, e), this.y = Vt(this.y, t, e), this.z = Vt(this.z, t, e), this.w = Vt(this.w, t, e), this;
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
    return this.divideScalar(n || 1).multiplyScalar(Vt(n, t, e));
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
class Th extends oi {
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
      minFilter: fn,
      depthBuffer: !0,
      stencilBuffer: !1,
      resolveDepthBuffer: !0,
      resolveStencilBuffer: !0,
      depthTexture: null,
      samples: 0,
      count: 1,
      depth: 1,
      multiview: !1
    }, n), this.isRenderTarget = !0, this.width = t, this.height = e, this.depth = n.depth, this.scissor = new fe(0, 0, t, e), this.scissorTest = !1, this.viewport = new fe(0, 0, t, e);
    const s = { width: t, height: e, depth: n.depth }, r = new Fe(s);
    this.textures = [];
    const o = n.count;
    for (let a = 0; a < o; a++)
      this.textures[a] = r.clone(), this.textures[a].isRenderTargetTexture = !0, this.textures[a].renderTarget = this;
    this._setTextureOptions(n), this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.resolveDepthBuffer = n.resolveDepthBuffer, this.resolveStencilBuffer = n.resolveStencilBuffer, this._depthTexture = null, this.depthTexture = n.depthTexture, this.samples = n.samples, this.multiview = n.multiview;
  }
  _setTextureOptions(t = {}) {
    const e = {
      minFilter: fn,
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
      for (let s = 0, r = this.textures.length; s < r; s++)
        this.textures[s].image.width = t, this.textures[s].image.height = e, this.textures[s].image.depth = n, this.textures[s].isArrayTexture = this.textures[s].image.depth > 1;
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
      const s = Object.assign({}, t.textures[e].image);
      this.textures[e].source = new Ha(s);
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
class ai extends Th {
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
class Nl extends Fe {
  /**
   * Constructs a new data array texture.
   *
   * @param {?TypedArray} [data=null] - The buffer data.
   * @param {number} [width=1] - The width of the texture.
   * @param {number} [height=1] - The height of the texture.
   * @param {number} [depth=1] - The depth of the texture.
   */
  constructor(t = null, e = 1, n = 1, s = 1) {
    super(null), this.isDataArrayTexture = !0, this.image = { data: t, width: e, height: n, depth: s }, this.magFilter = rn, this.minFilter = rn, this.wrapR = ei, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
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
class Ah extends Fe {
  /**
   * Constructs a new data array texture.
   *
   * @param {?TypedArray} [data=null] - The buffer data.
   * @param {number} [width=1] - The width of the texture.
   * @param {number} [height=1] - The height of the texture.
   * @param {number} [depth=1] - The depth of the texture.
   */
  constructor(t = null, e = 1, n = 1, s = 1) {
    super(null), this.isData3DTexture = !0, this.image = { data: t, width: e, height: n, depth: s }, this.magFilter = rn, this.minFilter = rn, this.wrapR = ei, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
class Hi {
  /**
   * Constructs a new bounding box.
   *
   * @param {Vector3} [min=(Infinity,Infinity,Infinity)] - A vector representing the lower boundary of the box.
   * @param {Vector3} [max=(-Infinity,-Infinity,-Infinity)] - A vector representing the upper boundary of the box.
   */
  constructor(t = new L(1 / 0, 1 / 0, 1 / 0), e = new L(-1 / 0, -1 / 0, -1 / 0)) {
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
      this.expandByPoint(Qe.fromArray(t, e));
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
      this.expandByPoint(Qe.fromBufferAttribute(t, e));
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
    const n = Qe.copy(e).multiplyScalar(0.5);
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
      const r = n.getAttribute("position");
      if (e === !0 && r !== void 0 && t.isInstancedMesh !== !0)
        for (let o = 0, a = r.count; o < a; o++)
          t.isMesh === !0 ? t.getVertexPosition(o, Qe) : Qe.fromBufferAttribute(r, o), Qe.applyMatrix4(t.matrixWorld), this.expandByPoint(Qe);
      else
        t.boundingBox !== void 0 ? (t.boundingBox === null && t.computeBoundingBox(), ps.copy(t.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), ps.copy(n.boundingBox)), ps.applyMatrix4(t.matrixWorld), this.union(ps);
    }
    const s = t.children;
    for (let r = 0, o = s.length; r < o; r++)
      this.expandByObject(s[r], e);
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
    return this.clampPoint(t.center, Qe), Qe.distanceToSquared(t.center) <= t.radius * t.radius;
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
    this.getCenter(qi), ms.subVectors(this.max, qi), di.subVectors(t.a, qi), ui.subVectors(t.b, qi), fi.subVectors(t.c, qi), Ln.subVectors(ui, di), In.subVectors(fi, ui), $n.subVectors(di, fi);
    let e = [
      0,
      -Ln.z,
      Ln.y,
      0,
      -In.z,
      In.y,
      0,
      -$n.z,
      $n.y,
      Ln.z,
      0,
      -Ln.x,
      In.z,
      0,
      -In.x,
      $n.z,
      0,
      -$n.x,
      -Ln.y,
      Ln.x,
      0,
      -In.y,
      In.x,
      0,
      -$n.y,
      $n.x,
      0
    ];
    return !cr(e, di, ui, fi, ms) || (e = [1, 0, 0, 0, 1, 0, 0, 0, 1], !cr(e, di, ui, fi, ms)) ? !1 : (_s.crossVectors(Ln, In), e = [_s.x, _s.y, _s.z], cr(e, di, ui, fi, ms));
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
    return this.clampPoint(t, Qe).distanceTo(t);
  }
  /**
   * Returns a bounding sphere that encloses this bounding box.
   *
   * @param {Sphere} target - The target sphere that is used to store the method's result.
   * @return {Sphere} The bounding sphere that encloses this bounding box.
   */
  getBoundingSphere(t) {
    return this.isEmpty() ? t.makeEmpty() : (this.getCenter(t.center), t.radius = this.getSize(Qe).length() * 0.5), t;
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
    return this.isEmpty() ? this : (Sn[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(t), Sn[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(t), Sn[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(t), Sn[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(t), Sn[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(t), Sn[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(t), Sn[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(t), Sn[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(t), this.setFromPoints(Sn), this);
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
const Sn = [
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L()
], Qe = /* @__PURE__ */ new L(), ps = /* @__PURE__ */ new Hi(), di = /* @__PURE__ */ new L(), ui = /* @__PURE__ */ new L(), fi = /* @__PURE__ */ new L(), Ln = /* @__PURE__ */ new L(), In = /* @__PURE__ */ new L(), $n = /* @__PURE__ */ new L(), qi = /* @__PURE__ */ new L(), ms = /* @__PURE__ */ new L(), _s = /* @__PURE__ */ new L(), qn = /* @__PURE__ */ new L();
function cr(i, t, e, n, s) {
  for (let r = 0, o = i.length - 3; r <= o; r += 3) {
    qn.fromArray(i, r);
    const a = s.x * Math.abs(qn.x) + s.y * Math.abs(qn.y) + s.z * Math.abs(qn.z), l = t.dot(qn), c = e.dot(qn), h = n.dot(qn);
    if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > a)
      return !1;
  }
  return !0;
}
const wh = /* @__PURE__ */ new Hi(), Yi = /* @__PURE__ */ new L(), hr = /* @__PURE__ */ new L();
class Qs {
  /**
   * Constructs a new sphere.
   *
   * @param {Vector3} [center=(0,0,0)] - The center of the sphere
   * @param {number} [radius=-1] - The radius of the sphere.
   */
  constructor(t = new L(), e = -1) {
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
    e !== void 0 ? n.copy(e) : wh.setFromPoints(t).getCenter(n);
    let s = 0;
    for (let r = 0, o = t.length; r < o; r++)
      s = Math.max(s, n.distanceToSquared(t[r]));
    return this.radius = Math.sqrt(s), this;
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
    Yi.subVectors(t, this.center);
    const e = Yi.lengthSq();
    if (e > this.radius * this.radius) {
      const n = Math.sqrt(e), s = (n - this.radius) * 0.5;
      this.center.addScaledVector(Yi, s / n), this.radius += s;
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
    return t.isEmpty() ? this : this.isEmpty() ? (this.copy(t), this) : (this.center.equals(t.center) === !0 ? this.radius = Math.max(this.radius, t.radius) : (hr.subVectors(t.center, this.center).setLength(t.radius), this.expandByPoint(Yi.copy(t.center).add(hr)), this.expandByPoint(Yi.copy(t.center).sub(hr))), this);
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
const En = /* @__PURE__ */ new L(), dr = /* @__PURE__ */ new L(), gs = /* @__PURE__ */ new L(), Un = /* @__PURE__ */ new L(), ur = /* @__PURE__ */ new L(), vs = /* @__PURE__ */ new L(), fr = /* @__PURE__ */ new L();
class tr {
  /**
   * Constructs a new ray.
   *
   * @param {Vector3} [origin=(0,0,0)] - The origin of the ray.
   * @param {Vector3} [direction=(0,0,-1)] - The (normalized) direction of the ray.
   */
  constructor(t = new L(), e = new L(0, 0, -1)) {
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
    return this.origin.copy(this.at(t, En)), this;
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
    const e = En.subVectors(t, this.origin).dot(this.direction);
    return e < 0 ? this.origin.distanceToSquared(t) : (En.copy(this.origin).addScaledVector(this.direction, e), En.distanceToSquared(t));
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
  distanceSqToSegment(t, e, n, s) {
    dr.copy(t).add(e).multiplyScalar(0.5), gs.copy(e).sub(t).normalize(), Un.copy(this.origin).sub(dr);
    const r = t.distanceTo(e) * 0.5, o = -this.direction.dot(gs), a = Un.dot(this.direction), l = -Un.dot(gs), c = Un.lengthSq(), h = Math.abs(1 - o * o);
    let u, f, m, _;
    if (h > 0)
      if (u = o * l - a, f = o * a - l, _ = r * h, u >= 0)
        if (f >= -_)
          if (f <= _) {
            const v = 1 / h;
            u *= v, f *= v, m = u * (u + o * f + 2 * a) + f * (o * u + f + 2 * l) + c;
          } else
            f = r, u = Math.max(0, -(o * f + a)), m = -u * u + f * (f + 2 * l) + c;
        else
          f = -r, u = Math.max(0, -(o * f + a)), m = -u * u + f * (f + 2 * l) + c;
      else
        f <= -_ ? (u = Math.max(0, -(-o * r + a)), f = u > 0 ? -r : Math.min(Math.max(-r, -l), r), m = -u * u + f * (f + 2 * l) + c) : f <= _ ? (u = 0, f = Math.min(Math.max(-r, -l), r), m = f * (f + 2 * l) + c) : (u = Math.max(0, -(o * r + a)), f = u > 0 ? r : Math.min(Math.max(-r, -l), r), m = -u * u + f * (f + 2 * l) + c);
    else
      f = o > 0 ? -r : r, u = Math.max(0, -(o * f + a)), m = -u * u + f * (f + 2 * l) + c;
    return n && n.copy(this.origin).addScaledVector(this.direction, u), s && s.copy(dr).addScaledVector(gs, f), m;
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
    En.subVectors(t.center, this.origin);
    const n = En.dot(this.direction), s = En.dot(En) - n * n, r = t.radius * t.radius;
    if (s > r) return null;
    const o = Math.sqrt(r - s), a = n - o, l = n + o;
    return l < 0 ? null : a < 0 ? this.at(l, e) : this.at(a, e);
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
    let n, s, r, o, a, l;
    const c = 1 / this.direction.x, h = 1 / this.direction.y, u = 1 / this.direction.z, f = this.origin;
    return c >= 0 ? (n = (t.min.x - f.x) * c, s = (t.max.x - f.x) * c) : (n = (t.max.x - f.x) * c, s = (t.min.x - f.x) * c), h >= 0 ? (r = (t.min.y - f.y) * h, o = (t.max.y - f.y) * h) : (r = (t.max.y - f.y) * h, o = (t.min.y - f.y) * h), n > o || r > s || ((r > n || isNaN(n)) && (n = r), (o < s || isNaN(s)) && (s = o), u >= 0 ? (a = (t.min.z - f.z) * u, l = (t.max.z - f.z) * u) : (a = (t.max.z - f.z) * u, l = (t.min.z - f.z) * u), n > l || a > s) || ((a > n || n !== n) && (n = a), (l < s || s !== s) && (s = l), s < 0) ? null : this.at(n >= 0 ? n : s, e);
  }
  /**
   * Returns `true` if this ray intersects with the given box.
   *
   * @param {Box3} box - The box to intersect.
   * @return {boolean} Whether this ray intersects with the given box or not.
   */
  intersectsBox(t) {
    return this.intersectBox(t, En) !== null;
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
  intersectTriangle(t, e, n, s, r) {
    ur.subVectors(e, t), vs.subVectors(n, t), fr.crossVectors(ur, vs);
    let o = this.direction.dot(fr), a;
    if (o > 0) {
      if (s) return null;
      a = 1;
    } else if (o < 0)
      a = -1, o = -o;
    else
      return null;
    Un.subVectors(this.origin, t);
    const l = a * this.direction.dot(vs.crossVectors(Un, vs));
    if (l < 0)
      return null;
    const c = a * this.direction.dot(ur.cross(Un));
    if (c < 0 || l + c > o)
      return null;
    const h = -a * Un.dot(fr);
    return h < 0 ? null : this.at(h / o, r);
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
class oe {
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
  constructor(t, e, n, s, r, o, a, l, c, h, u, f, m, _, v, p) {
    oe.prototype.isMatrix4 = !0, this.elements = [
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
    ], t !== void 0 && this.set(t, e, n, s, r, o, a, l, c, h, u, f, m, _, v, p);
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
  set(t, e, n, s, r, o, a, l, c, h, u, f, m, _, v, p) {
    const d = this.elements;
    return d[0] = t, d[4] = e, d[8] = n, d[12] = s, d[1] = r, d[5] = o, d[9] = a, d[13] = l, d[2] = c, d[6] = h, d[10] = u, d[14] = f, d[3] = m, d[7] = _, d[11] = v, d[15] = p, this;
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
    return new oe().fromArray(this.elements);
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
    const e = this.elements, n = t.elements, s = 1 / pi.setFromMatrixColumn(t, 0).length(), r = 1 / pi.setFromMatrixColumn(t, 1).length(), o = 1 / pi.setFromMatrixColumn(t, 2).length();
    return e[0] = n[0] * s, e[1] = n[1] * s, e[2] = n[2] * s, e[3] = 0, e[4] = n[4] * r, e[5] = n[5] * r, e[6] = n[6] * r, e[7] = 0, e[8] = n[8] * o, e[9] = n[9] * o, e[10] = n[10] * o, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
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
    const e = this.elements, n = t.x, s = t.y, r = t.z, o = Math.cos(n), a = Math.sin(n), l = Math.cos(s), c = Math.sin(s), h = Math.cos(r), u = Math.sin(r);
    if (t.order === "XYZ") {
      const f = o * h, m = o * u, _ = a * h, v = a * u;
      e[0] = l * h, e[4] = -l * u, e[8] = c, e[1] = m + _ * c, e[5] = f - v * c, e[9] = -a * l, e[2] = v - f * c, e[6] = _ + m * c, e[10] = o * l;
    } else if (t.order === "YXZ") {
      const f = l * h, m = l * u, _ = c * h, v = c * u;
      e[0] = f + v * a, e[4] = _ * a - m, e[8] = o * c, e[1] = o * u, e[5] = o * h, e[9] = -a, e[2] = m * a - _, e[6] = v + f * a, e[10] = o * l;
    } else if (t.order === "ZXY") {
      const f = l * h, m = l * u, _ = c * h, v = c * u;
      e[0] = f - v * a, e[4] = -o * u, e[8] = _ + m * a, e[1] = m + _ * a, e[5] = o * h, e[9] = v - f * a, e[2] = -o * c, e[6] = a, e[10] = o * l;
    } else if (t.order === "ZYX") {
      const f = o * h, m = o * u, _ = a * h, v = a * u;
      e[0] = l * h, e[4] = _ * c - m, e[8] = f * c + v, e[1] = l * u, e[5] = v * c + f, e[9] = m * c - _, e[2] = -c, e[6] = a * l, e[10] = o * l;
    } else if (t.order === "YZX") {
      const f = o * l, m = o * c, _ = a * l, v = a * c;
      e[0] = l * h, e[4] = v - f * u, e[8] = _ * u + m, e[1] = u, e[5] = o * h, e[9] = -a * h, e[2] = -c * h, e[6] = m * u + _, e[10] = f - v * u;
    } else if (t.order === "XZY") {
      const f = o * l, m = o * c, _ = a * l, v = a * c;
      e[0] = l * h, e[4] = -u, e[8] = c * h, e[1] = f * u + v, e[5] = o * h, e[9] = m * u - _, e[2] = _ * u - m, e[6] = a * h, e[10] = v * u + f;
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
    return this.compose(Rh, t, Ch);
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
    const s = this.elements;
    return Ge.subVectors(t, e), Ge.lengthSq() === 0 && (Ge.z = 1), Ge.normalize(), Nn.crossVectors(n, Ge), Nn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? Ge.x += 1e-4 : Ge.z += 1e-4, Ge.normalize(), Nn.crossVectors(n, Ge)), Nn.normalize(), xs.crossVectors(Ge, Nn), s[0] = Nn.x, s[4] = xs.x, s[8] = Ge.x, s[1] = Nn.y, s[5] = xs.y, s[9] = Ge.y, s[2] = Nn.z, s[6] = xs.z, s[10] = Ge.z, this;
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
    const n = t.elements, s = e.elements, r = this.elements, o = n[0], a = n[4], l = n[8], c = n[12], h = n[1], u = n[5], f = n[9], m = n[13], _ = n[2], v = n[6], p = n[10], d = n[14], T = n[3], A = n[7], E = n[11], b = n[15], R = s[0], C = s[4], N = s[8], M = s[12], S = s[1], D = s[5], k = s[9], H = s[13], Y = s[2], W = s[6], X = s[10], j = s[14], z = s[3], st = s[7], ht = s[11], _t = s[15];
    return r[0] = o * R + a * S + l * Y + c * z, r[4] = o * C + a * D + l * W + c * st, r[8] = o * N + a * k + l * X + c * ht, r[12] = o * M + a * H + l * j + c * _t, r[1] = h * R + u * S + f * Y + m * z, r[5] = h * C + u * D + f * W + m * st, r[9] = h * N + u * k + f * X + m * ht, r[13] = h * M + u * H + f * j + m * _t, r[2] = _ * R + v * S + p * Y + d * z, r[6] = _ * C + v * D + p * W + d * st, r[10] = _ * N + v * k + p * X + d * ht, r[14] = _ * M + v * H + p * j + d * _t, r[3] = T * R + A * S + E * Y + b * z, r[7] = T * C + A * D + E * W + b * st, r[11] = T * N + A * k + E * X + b * ht, r[15] = T * M + A * H + E * j + b * _t, this;
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
    const t = this.elements, e = t[0], n = t[4], s = t[8], r = t[12], o = t[1], a = t[5], l = t[9], c = t[13], h = t[2], u = t[6], f = t[10], m = t[14], _ = t[3], v = t[7], p = t[11], d = t[15];
    return _ * (+r * l * u - s * c * u - r * a * f + n * c * f + s * a * m - n * l * m) + v * (+e * l * m - e * c * f + r * o * f - s * o * m + s * c * h - r * l * h) + p * (+e * c * u - e * a * m - r * o * u + n * o * m + r * a * h - n * c * h) + d * (-s * a * h - e * l * u + e * a * f + s * o * u - n * o * f + n * l * h);
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
    const s = this.elements;
    return t.isVector3 ? (s[12] = t.x, s[13] = t.y, s[14] = t.z) : (s[12] = t, s[13] = e, s[14] = n), this;
  }
  /**
   * Inverts this matrix, using the [analytic method]{@link https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution}.
   * You can not invert with a determinant of zero. If you attempt this, the method produces
   * a zero matrix instead.
   *
   * @return {Matrix4} A reference to this matrix.
   */
  invert() {
    const t = this.elements, e = t[0], n = t[1], s = t[2], r = t[3], o = t[4], a = t[5], l = t[6], c = t[7], h = t[8], u = t[9], f = t[10], m = t[11], _ = t[12], v = t[13], p = t[14], d = t[15], T = u * p * c - v * f * c + v * l * m - a * p * m - u * l * d + a * f * d, A = _ * f * c - h * p * c - _ * l * m + o * p * m + h * l * d - o * f * d, E = h * v * c - _ * u * c + _ * a * m - o * v * m - h * a * d + o * u * d, b = _ * u * l - h * v * l - _ * a * f + o * v * f + h * a * p - o * u * p, R = e * T + n * A + s * E + r * b;
    if (R === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const C = 1 / R;
    return t[0] = T * C, t[1] = (v * f * r - u * p * r - v * s * m + n * p * m + u * s * d - n * f * d) * C, t[2] = (a * p * r - v * l * r + v * s * c - n * p * c - a * s * d + n * l * d) * C, t[3] = (u * l * r - a * f * r - u * s * c + n * f * c + a * s * m - n * l * m) * C, t[4] = A * C, t[5] = (h * p * r - _ * f * r + _ * s * m - e * p * m - h * s * d + e * f * d) * C, t[6] = (_ * l * r - o * p * r - _ * s * c + e * p * c + o * s * d - e * l * d) * C, t[7] = (o * f * r - h * l * r + h * s * c - e * f * c - o * s * m + e * l * m) * C, t[8] = E * C, t[9] = (_ * u * r - h * v * r - _ * n * m + e * v * m + h * n * d - e * u * d) * C, t[10] = (o * v * r - _ * a * r + _ * n * c - e * v * c - o * n * d + e * a * d) * C, t[11] = (h * a * r - o * u * r - h * n * c + e * u * c + o * n * m - e * a * m) * C, t[12] = b * C, t[13] = (h * v * s - _ * u * s + _ * n * f - e * v * f - h * n * p + e * u * p) * C, t[14] = (_ * a * s - o * v * s - _ * n * l + e * v * l + o * n * p - e * a * p) * C, t[15] = (o * u * s - h * a * s + h * n * l - e * u * l - o * n * f + e * a * f) * C, this;
  }
  /**
   * Multiplies the columns of this matrix by the given vector.
   *
   * @param {Vector3} v - The scale vector.
   * @return {Matrix4} A reference to this matrix.
   */
  scale(t) {
    const e = this.elements, n = t.x, s = t.y, r = t.z;
    return e[0] *= n, e[4] *= s, e[8] *= r, e[1] *= n, e[5] *= s, e[9] *= r, e[2] *= n, e[6] *= s, e[10] *= r, e[3] *= n, e[7] *= s, e[11] *= r, this;
  }
  /**
   * Gets the maximum scale value of the three axes.
   *
   * @return {number} The maximum scale.
   */
  getMaxScaleOnAxis() {
    const t = this.elements, e = t[0] * t[0] + t[1] * t[1] + t[2] * t[2], n = t[4] * t[4] + t[5] * t[5] + t[6] * t[6], s = t[8] * t[8] + t[9] * t[9] + t[10] * t[10];
    return Math.sqrt(Math.max(e, n, s));
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
    const n = Math.cos(e), s = Math.sin(e), r = 1 - n, o = t.x, a = t.y, l = t.z, c = r * o, h = r * a;
    return this.set(
      c * o + n,
      c * a - s * l,
      c * l + s * a,
      0,
      c * a + s * l,
      h * a + n,
      h * l - s * o,
      0,
      c * l - s * a,
      h * l + s * o,
      r * l * l + n,
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
  makeShear(t, e, n, s, r, o) {
    return this.set(
      1,
      n,
      r,
      0,
      t,
      1,
      o,
      0,
      e,
      s,
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
    const s = this.elements, r = e._x, o = e._y, a = e._z, l = e._w, c = r + r, h = o + o, u = a + a, f = r * c, m = r * h, _ = r * u, v = o * h, p = o * u, d = a * u, T = l * c, A = l * h, E = l * u, b = n.x, R = n.y, C = n.z;
    return s[0] = (1 - (v + d)) * b, s[1] = (m + E) * b, s[2] = (_ - A) * b, s[3] = 0, s[4] = (m - E) * R, s[5] = (1 - (f + d)) * R, s[6] = (p + T) * R, s[7] = 0, s[8] = (_ + A) * C, s[9] = (p - T) * C, s[10] = (1 - (f + v)) * C, s[11] = 0, s[12] = t.x, s[13] = t.y, s[14] = t.z, s[15] = 1, this;
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
    const s = this.elements;
    let r = pi.set(s[0], s[1], s[2]).length();
    const o = pi.set(s[4], s[5], s[6]).length(), a = pi.set(s[8], s[9], s[10]).length();
    this.determinant() < 0 && (r = -r), t.x = s[12], t.y = s[13], t.z = s[14], tn.copy(this);
    const c = 1 / r, h = 1 / o, u = 1 / a;
    return tn.elements[0] *= c, tn.elements[1] *= c, tn.elements[2] *= c, tn.elements[4] *= h, tn.elements[5] *= h, tn.elements[6] *= h, tn.elements[8] *= u, tn.elements[9] *= u, tn.elements[10] *= u, e.setFromRotationMatrix(tn), n.x = r, n.y = o, n.z = a, this;
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
  makePerspective(t, e, n, s, r, o, a = pn, l = !1) {
    const c = this.elements, h = 2 * r / (e - t), u = 2 * r / (n - s), f = (e + t) / (e - t), m = (n + s) / (n - s);
    let _, v;
    if (l)
      _ = r / (o - r), v = o * r / (o - r);
    else if (a === pn)
      _ = -(o + r) / (o - r), v = -2 * o * r / (o - r);
    else if (a === $s)
      _ = -o / (o - r), v = -o * r / (o - r);
    else
      throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + a);
    return c[0] = h, c[4] = 0, c[8] = f, c[12] = 0, c[1] = 0, c[5] = u, c[9] = m, c[13] = 0, c[2] = 0, c[6] = 0, c[10] = _, c[14] = v, c[3] = 0, c[7] = 0, c[11] = -1, c[15] = 0, this;
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
  makeOrthographic(t, e, n, s, r, o, a = pn, l = !1) {
    const c = this.elements, h = 2 / (e - t), u = 2 / (n - s), f = -(e + t) / (e - t), m = -(n + s) / (n - s);
    let _, v;
    if (l)
      _ = 1 / (o - r), v = o / (o - r);
    else if (a === pn)
      _ = -2 / (o - r), v = -(o + r) / (o - r);
    else if (a === $s)
      _ = -1 / (o - r), v = -r / (o - r);
    else
      throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + a);
    return c[0] = h, c[4] = 0, c[8] = 0, c[12] = f, c[1] = 0, c[5] = u, c[9] = 0, c[13] = m, c[2] = 0, c[6] = 0, c[10] = _, c[14] = v, c[3] = 0, c[7] = 0, c[11] = 0, c[15] = 1, this;
  }
  /**
   * Returns `true` if this matrix is equal with the given one.
   *
   * @param {Matrix4} matrix - The matrix to test for equality.
   * @return {boolean} Whether this matrix is equal with the given one.
   */
  equals(t) {
    const e = this.elements, n = t.elements;
    for (let s = 0; s < 16; s++)
      if (e[s] !== n[s]) return !1;
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
const pi = /* @__PURE__ */ new L(), tn = /* @__PURE__ */ new oe(), Rh = /* @__PURE__ */ new L(0, 0, 0), Ch = /* @__PURE__ */ new L(1, 1, 1), Nn = /* @__PURE__ */ new L(), xs = /* @__PURE__ */ new L(), Ge = /* @__PURE__ */ new L(), go = /* @__PURE__ */ new oe(), vo = /* @__PURE__ */ new ri();
class xn {
  /**
   * Constructs a new euler instance.
   *
   * @param {number} [x=0] - The angle of the x axis in radians.
   * @param {number} [y=0] - The angle of the y axis in radians.
   * @param {number} [z=0] - The angle of the z axis in radians.
   * @param {string} [order=Euler.DEFAULT_ORDER] - A string representing the order that the rotations are applied.
   */
  constructor(t = 0, e = 0, n = 0, s = xn.DEFAULT_ORDER) {
    this.isEuler = !0, this._x = t, this._y = e, this._z = n, this._order = s;
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
  set(t, e, n, s = this._order) {
    return this._x = t, this._y = e, this._z = n, this._order = s, this._onChangeCallback(), this;
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
    const s = t.elements, r = s[0], o = s[4], a = s[8], l = s[1], c = s[5], h = s[9], u = s[2], f = s[6], m = s[10];
    switch (e) {
      case "XYZ":
        this._y = Math.asin(Vt(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(-h, m), this._z = Math.atan2(-o, r)) : (this._x = Math.atan2(f, c), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-Vt(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(a, m), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-u, r), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(Vt(f, -1, 1)), Math.abs(f) < 0.9999999 ? (this._y = Math.atan2(-u, m), this._z = Math.atan2(-o, c)) : (this._y = 0, this._z = Math.atan2(l, r));
        break;
      case "ZYX":
        this._y = Math.asin(-Vt(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._x = Math.atan2(f, m), this._z = Math.atan2(l, r)) : (this._x = 0, this._z = Math.atan2(-o, c));
        break;
      case "YZX":
        this._z = Math.asin(Vt(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-u, r)) : (this._x = 0, this._y = Math.atan2(a, m));
        break;
      case "XZY":
        this._z = Math.asin(-Vt(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(f, c), this._y = Math.atan2(a, r)) : (this._x = Math.atan2(-h, m), this._y = 0);
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
    return go.makeRotationFromQuaternion(t), this.setFromRotationMatrix(go, e, n);
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
    return vo.setFromEuler(this), this.setFromQuaternion(vo, t);
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
xn.DEFAULT_ORDER = "XYZ";
class Va {
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
let Ph = 0;
const xo = /* @__PURE__ */ new L(), mi = /* @__PURE__ */ new ri(), yn = /* @__PURE__ */ new oe(), Ms = /* @__PURE__ */ new L(), ji = /* @__PURE__ */ new L(), Dh = /* @__PURE__ */ new L(), Lh = /* @__PURE__ */ new ri(), Mo = /* @__PURE__ */ new L(1, 0, 0), So = /* @__PURE__ */ new L(0, 1, 0), Eo = /* @__PURE__ */ new L(0, 0, 1), yo = { type: "added" }, Ih = { type: "removed" }, _i = { type: "childadded", child: null }, pr = { type: "childremoved", child: null };
class xe extends oi {
  /**
   * Constructs a new 3D object.
   */
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: Ph++ }), this.uuid = zi(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = xe.DEFAULT_UP.clone();
    const t = new L(), e = new xn(), n = new ri(), s = new L(1, 1, 1);
    function r() {
      n.setFromEuler(e, !1);
    }
    function o() {
      e.setFromQuaternion(n, void 0, !1);
    }
    e._onChange(r), n._onChange(o), Object.defineProperties(this, {
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
        value: s
      },
      /**
       * Represents the object's model-view matrix.
       *
       * @name Object3D#modelViewMatrix
       * @type {Matrix4}
       */
      modelViewMatrix: {
        value: new oe()
      },
      /**
       * Represents the object's normal matrix.
       *
       * @name Object3D#normalMatrix
       * @type {Matrix3}
       */
      normalMatrix: {
        value: new Bt()
      }
    }), this.matrix = new oe(), this.matrixWorld = new oe(), this.matrixAutoUpdate = xe.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = xe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new Va(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.customDepthMaterial = void 0, this.customDistanceMaterial = void 0, this.userData = {};
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
    return mi.setFromAxisAngle(t, e), this.quaternion.multiply(mi), this;
  }
  /**
   * Rotates the 3D object along an axis in world space.
   *
   * @param {Vector3} axis - The (normalized) axis vector.
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateOnWorldAxis(t, e) {
    return mi.setFromAxisAngle(t, e), this.quaternion.premultiply(mi), this;
  }
  /**
   * Rotates the 3D object around its X axis in local space.
   *
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateX(t) {
    return this.rotateOnAxis(Mo, t);
  }
  /**
   * Rotates the 3D object around its Y axis in local space.
   *
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateY(t) {
    return this.rotateOnAxis(So, t);
  }
  /**
   * Rotates the 3D object around its Z axis in local space.
   *
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateZ(t) {
    return this.rotateOnAxis(Eo, t);
  }
  /**
   * Translate the 3D object by a distance along the given axis in local space.
   *
   * @param {Vector3} axis - The (normalized) axis vector.
   * @param {number} distance - The distance in world units.
   * @return {Object3D} A reference to this instance.
   */
  translateOnAxis(t, e) {
    return xo.copy(t).applyQuaternion(this.quaternion), this.position.add(xo.multiplyScalar(e)), this;
  }
  /**
   * Translate the 3D object by a distance along its X-axis in local space.
   *
   * @param {number} distance - The distance in world units.
   * @return {Object3D} A reference to this instance.
   */
  translateX(t) {
    return this.translateOnAxis(Mo, t);
  }
  /**
   * Translate the 3D object by a distance along its Y-axis in local space.
   *
   * @param {number} distance - The distance in world units.
   * @return {Object3D} A reference to this instance.
   */
  translateY(t) {
    return this.translateOnAxis(So, t);
  }
  /**
   * Translate the 3D object by a distance along its Z-axis in local space.
   *
   * @param {number} distance - The distance in world units.
   * @return {Object3D} A reference to this instance.
   */
  translateZ(t) {
    return this.translateOnAxis(Eo, t);
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
    return this.updateWorldMatrix(!0, !1), t.applyMatrix4(yn.copy(this.matrixWorld).invert());
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
    t.isVector3 ? Ms.copy(t) : Ms.set(t, e, n);
    const s = this.parent;
    this.updateWorldMatrix(!0, !1), ji.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? yn.lookAt(ji, Ms, this.up) : yn.lookAt(Ms, ji, this.up), this.quaternion.setFromRotationMatrix(yn), s && (yn.extractRotation(s.matrixWorld), mi.setFromRotationMatrix(yn), this.quaternion.premultiply(mi.invert()));
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
    return t === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", t), this) : (t && t.isObject3D ? (t.removeFromParent(), t.parent = this, this.children.push(t), t.dispatchEvent(yo), _i.child = t, this.dispatchEvent(_i), _i.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", t), this);
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
    return e !== -1 && (t.parent = null, this.children.splice(e, 1), t.dispatchEvent(Ih), pr.child = t, this.dispatchEvent(pr), pr.child = null), this;
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
    return this.updateWorldMatrix(!0, !1), yn.copy(this.matrixWorld).invert(), t.parent !== null && (t.parent.updateWorldMatrix(!0, !1), yn.multiply(t.parent.matrixWorld)), t.applyMatrix4(yn), t.removeFromParent(), t.parent = this, this.children.push(t), t.updateWorldMatrix(!1, !0), t.dispatchEvent(yo), _i.child = t, this.dispatchEvent(_i), _i.child = null, this;
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
    for (let n = 0, s = this.children.length; n < s; n++) {
      const o = this.children[n].getObjectByProperty(t, e);
      if (o !== void 0)
        return o;
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
    const s = this.children;
    for (let r = 0, o = s.length; r < o; r++)
      s[r].getObjectsByProperty(t, e, n);
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
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(ji, t, Dh), t;
  }
  /**
   * Returns a vector representing the scale of the 3D object in world space.
   *
   * @param {Vector3} target - The target vector the result is stored to.
   * @return {Vector3} The 3D object's scale in world space.
   */
  getWorldScale(t) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(ji, Lh, t), t;
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
    for (let n = 0, s = e.length; n < s; n++)
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
    for (let n = 0, s = e.length; n < s; n++)
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
    for (let n = 0, s = e.length; n < s; n++)
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
      const s = this.children;
      for (let r = 0, o = s.length; r < o; r++)
        s[r].updateWorldMatrix(!1, !0);
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
    const s = {};
    s.uuid = this.uuid, s.type = this.type, this.name !== "" && (s.name = this.name), this.castShadow === !0 && (s.castShadow = !0), this.receiveShadow === !0 && (s.receiveShadow = !0), this.visible === !1 && (s.visible = !1), this.frustumCulled === !1 && (s.frustumCulled = !1), this.renderOrder !== 0 && (s.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (s.userData = this.userData), s.layers = this.layers.mask, s.matrix = this.matrix.toArray(), s.up = this.up.toArray(), this.matrixAutoUpdate === !1 && (s.matrixAutoUpdate = !1), this.isInstancedMesh && (s.type = "InstancedMesh", s.count = this.count, s.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (s.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (s.type = "BatchedMesh", s.perObjectFrustumCulled = this.perObjectFrustumCulled, s.sortObjects = this.sortObjects, s.drawRanges = this._drawRanges, s.reservedRanges = this._reservedRanges, s.geometryInfo = this._geometryInfo.map((a) => ({
      ...a,
      boundingBox: a.boundingBox ? a.boundingBox.toJSON() : void 0,
      boundingSphere: a.boundingSphere ? a.boundingSphere.toJSON() : void 0
    })), s.instanceInfo = this._instanceInfo.map((a) => ({ ...a })), s.availableInstanceIds = this._availableInstanceIds.slice(), s.availableGeometryIds = this._availableGeometryIds.slice(), s.nextIndexStart = this._nextIndexStart, s.nextVertexStart = this._nextVertexStart, s.geometryCount = this._geometryCount, s.maxInstanceCount = this._maxInstanceCount, s.maxVertexCount = this._maxVertexCount, s.maxIndexCount = this._maxIndexCount, s.geometryInitialized = this._geometryInitialized, s.matricesTexture = this._matricesTexture.toJSON(t), s.indirectTexture = this._indirectTexture.toJSON(t), this._colorsTexture !== null && (s.colorsTexture = this._colorsTexture.toJSON(t)), this.boundingSphere !== null && (s.boundingSphere = this.boundingSphere.toJSON()), this.boundingBox !== null && (s.boundingBox = this.boundingBox.toJSON()));
    function r(a, l) {
      return a[l.uuid] === void 0 && (a[l.uuid] = l.toJSON(t)), l.uuid;
    }
    if (this.isScene)
      this.background && (this.background.isColor ? s.background = this.background.toJSON() : this.background.isTexture && (s.background = this.background.toJSON(t).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (s.environment = this.environment.toJSON(t).uuid);
    else if (this.isMesh || this.isLine || this.isPoints) {
      s.geometry = r(t.geometries, this.geometry);
      const a = this.geometry.parameters;
      if (a !== void 0 && a.shapes !== void 0) {
        const l = a.shapes;
        if (Array.isArray(l))
          for (let c = 0, h = l.length; c < h; c++) {
            const u = l[c];
            r(t.shapes, u);
          }
        else
          r(t.shapes, l);
      }
    }
    if (this.isSkinnedMesh && (s.bindMode = this.bindMode, s.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (r(t.skeletons, this.skeleton), s.skeleton = this.skeleton.uuid)), this.material !== void 0)
      if (Array.isArray(this.material)) {
        const a = [];
        for (let l = 0, c = this.material.length; l < c; l++)
          a.push(r(t.materials, this.material[l]));
        s.material = a;
      } else
        s.material = r(t.materials, this.material);
    if (this.children.length > 0) {
      s.children = [];
      for (let a = 0; a < this.children.length; a++)
        s.children.push(this.children[a].toJSON(t).object);
    }
    if (this.animations.length > 0) {
      s.animations = [];
      for (let a = 0; a < this.animations.length; a++) {
        const l = this.animations[a];
        s.animations.push(r(t.animations, l));
      }
    }
    if (e) {
      const a = o(t.geometries), l = o(t.materials), c = o(t.textures), h = o(t.images), u = o(t.shapes), f = o(t.skeletons), m = o(t.animations), _ = o(t.nodes);
      a.length > 0 && (n.geometries = a), l.length > 0 && (n.materials = l), c.length > 0 && (n.textures = c), h.length > 0 && (n.images = h), u.length > 0 && (n.shapes = u), f.length > 0 && (n.skeletons = f), m.length > 0 && (n.animations = m), _.length > 0 && (n.nodes = _);
    }
    return n.object = s, n;
    function o(a) {
      const l = [];
      for (const c in a) {
        const h = a[c];
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
        const s = t.children[n];
        this.add(s.clone());
      }
    return this;
  }
}
xe.DEFAULT_UP = /* @__PURE__ */ new L(0, 1, 0);
xe.DEFAULT_MATRIX_AUTO_UPDATE = !0;
xe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const en = /* @__PURE__ */ new L(), bn = /* @__PURE__ */ new L(), mr = /* @__PURE__ */ new L(), Tn = /* @__PURE__ */ new L(), gi = /* @__PURE__ */ new L(), vi = /* @__PURE__ */ new L(), bo = /* @__PURE__ */ new L(), _r = /* @__PURE__ */ new L(), gr = /* @__PURE__ */ new L(), vr = /* @__PURE__ */ new L(), xr = /* @__PURE__ */ new fe(), Mr = /* @__PURE__ */ new fe(), Sr = /* @__PURE__ */ new fe();
class Ke {
  /**
   * Constructs a new triangle.
   *
   * @param {Vector3} [a=(0,0,0)] - The first corner of the triangle.
   * @param {Vector3} [b=(0,0,0)] - The second corner of the triangle.
   * @param {Vector3} [c=(0,0,0)] - The third corner of the triangle.
   */
  constructor(t = new L(), e = new L(), n = new L()) {
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
  static getNormal(t, e, n, s) {
    s.subVectors(n, e), en.subVectors(t, e), s.cross(en);
    const r = s.lengthSq();
    return r > 0 ? s.multiplyScalar(1 / Math.sqrt(r)) : s.set(0, 0, 0);
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
  static getBarycoord(t, e, n, s, r) {
    en.subVectors(s, e), bn.subVectors(n, e), mr.subVectors(t, e);
    const o = en.dot(en), a = en.dot(bn), l = en.dot(mr), c = bn.dot(bn), h = bn.dot(mr), u = o * c - a * a;
    if (u === 0)
      return r.set(0, 0, 0), null;
    const f = 1 / u, m = (c * l - a * h) * f, _ = (o * h - a * l) * f;
    return r.set(1 - m - _, _, m);
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
  static containsPoint(t, e, n, s) {
    return this.getBarycoord(t, e, n, s, Tn) === null ? !1 : Tn.x >= 0 && Tn.y >= 0 && Tn.x + Tn.y <= 1;
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
  static getInterpolation(t, e, n, s, r, o, a, l) {
    return this.getBarycoord(t, e, n, s, Tn) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(r, Tn.x), l.addScaledVector(o, Tn.y), l.addScaledVector(a, Tn.z), l);
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
  static getInterpolatedAttribute(t, e, n, s, r, o) {
    return xr.setScalar(0), Mr.setScalar(0), Sr.setScalar(0), xr.fromBufferAttribute(t, e), Mr.fromBufferAttribute(t, n), Sr.fromBufferAttribute(t, s), o.setScalar(0), o.addScaledVector(xr, r.x), o.addScaledVector(Mr, r.y), o.addScaledVector(Sr, r.z), o;
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
  static isFrontFacing(t, e, n, s) {
    return en.subVectors(n, e), bn.subVectors(t, e), en.cross(bn).dot(s) < 0;
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
  setFromPointsAndIndices(t, e, n, s) {
    return this.a.copy(t[e]), this.b.copy(t[n]), this.c.copy(t[s]), this;
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
  setFromAttributeAndIndices(t, e, n, s) {
    return this.a.fromBufferAttribute(t, e), this.b.fromBufferAttribute(t, n), this.c.fromBufferAttribute(t, s), this;
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
    return en.subVectors(this.c, this.b), bn.subVectors(this.a, this.b), en.cross(bn).length() * 0.5;
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
    return Ke.getNormal(this.a, this.b, this.c, t);
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
    return Ke.getBarycoord(t, this.a, this.b, this.c, e);
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
  getInterpolation(t, e, n, s, r) {
    return Ke.getInterpolation(t, this.a, this.b, this.c, e, n, s, r);
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
    return Ke.containsPoint(t, this.a, this.b, this.c);
  }
  /**
   * Returns `true` if the triangle is oriented towards the given direction.
   *
   * @param {Vector3} direction - The (normalized) direction vector.
   * @return {boolean} Whether the triangle is oriented towards the given direction or not.
   */
  isFrontFacing(t) {
    return Ke.isFrontFacing(this.a, this.b, this.c, t);
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
    const n = this.a, s = this.b, r = this.c;
    let o, a;
    gi.subVectors(s, n), vi.subVectors(r, n), _r.subVectors(t, n);
    const l = gi.dot(_r), c = vi.dot(_r);
    if (l <= 0 && c <= 0)
      return e.copy(n);
    gr.subVectors(t, s);
    const h = gi.dot(gr), u = vi.dot(gr);
    if (h >= 0 && u <= h)
      return e.copy(s);
    const f = l * u - h * c;
    if (f <= 0 && l >= 0 && h <= 0)
      return o = l / (l - h), e.copy(n).addScaledVector(gi, o);
    vr.subVectors(t, r);
    const m = gi.dot(vr), _ = vi.dot(vr);
    if (_ >= 0 && m <= _)
      return e.copy(r);
    const v = m * c - l * _;
    if (v <= 0 && c >= 0 && _ <= 0)
      return a = c / (c - _), e.copy(n).addScaledVector(vi, a);
    const p = h * _ - m * u;
    if (p <= 0 && u - h >= 0 && m - _ >= 0)
      return bo.subVectors(r, s), a = (u - h) / (u - h + (m - _)), e.copy(s).addScaledVector(bo, a);
    const d = 1 / (p + v + f);
    return o = v * d, a = f * d, e.copy(n).addScaledVector(gi, o).addScaledVector(vi, a);
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
const Fl = {
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
}, Fn = { h: 0, s: 0, l: 0 }, Ss = { h: 0, s: 0, l: 0 };
function Er(i, t, e) {
  return e < 0 && (e += 1), e > 1 && (e -= 1), e < 1 / 6 ? i + (t - i) * 6 * e : e < 1 / 2 ? t : e < 2 / 3 ? i + (t - i) * 6 * (2 / 3 - e) : i;
}
class qt {
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
      const s = t;
      s && s.isColor ? this.copy(s) : typeof s == "number" ? this.setHex(s) : typeof s == "string" && this.setStyle(s);
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
  setHex(t, e = ke) {
    return t = Math.floor(t), this.r = (t >> 16 & 255) / 255, this.g = (t >> 8 & 255) / 255, this.b = (t & 255) / 255, jt.colorSpaceToWorking(this, e), this;
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
  setRGB(t, e, n, s = jt.workingColorSpace) {
    return this.r = t, this.g = e, this.b = n, jt.colorSpaceToWorking(this, s), this;
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
  setHSL(t, e, n, s = jt.workingColorSpace) {
    if (t = za(t, 1), e = Vt(e, 0, 1), n = Vt(n, 0, 1), e === 0)
      this.r = this.g = this.b = n;
    else {
      const r = n <= 0.5 ? n * (1 + e) : n + e - n * e, o = 2 * n - r;
      this.r = Er(o, r, t + 1 / 3), this.g = Er(o, r, t), this.b = Er(o, r, t - 1 / 3);
    }
    return jt.colorSpaceToWorking(this, s), this;
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
  setStyle(t, e = ke) {
    function n(r) {
      r !== void 0 && parseFloat(r) < 1 && console.warn("THREE.Color: Alpha component of " + t + " will be ignored.");
    }
    let s;
    if (s = /^(\w+)\(([^\)]*)\)/.exec(t)) {
      let r;
      const o = s[1], a = s[2];
      switch (o) {
        case "rgb":
        case "rgba":
          if (r = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))
            return n(r[4]), this.setRGB(
              Math.min(255, parseInt(r[1], 10)) / 255,
              Math.min(255, parseInt(r[2], 10)) / 255,
              Math.min(255, parseInt(r[3], 10)) / 255,
              e
            );
          if (r = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))
            return n(r[4]), this.setRGB(
              Math.min(100, parseInt(r[1], 10)) / 100,
              Math.min(100, parseInt(r[2], 10)) / 100,
              Math.min(100, parseInt(r[3], 10)) / 100,
              e
            );
          break;
        case "hsl":
        case "hsla":
          if (r = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))
            return n(r[4]), this.setHSL(
              parseFloat(r[1]) / 360,
              parseFloat(r[2]) / 100,
              parseFloat(r[3]) / 100,
              e
            );
          break;
        default:
          console.warn("THREE.Color: Unknown color model " + t);
      }
    } else if (s = /^\#([A-Fa-f\d]+)$/.exec(t)) {
      const r = s[1], o = r.length;
      if (o === 3)
        return this.setRGB(
          parseInt(r.charAt(0), 16) / 15,
          parseInt(r.charAt(1), 16) / 15,
          parseInt(r.charAt(2), 16) / 15,
          e
        );
      if (o === 6)
        return this.setHex(parseInt(r, 16), e);
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
  setColorName(t, e = ke) {
    const n = Fl[t.toLowerCase()];
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
    return this.r = Pn(t.r), this.g = Pn(t.g), this.b = Pn(t.b), this;
  }
  /**
   * Copies the given color into this color, and then converts this color from
   * `LinearSRGBColorSpace` to `SRGBColorSpace`.
   *
   * @param {Color} color - The color to copy/convert.
   * @return {Color} A reference to this color.
   */
  copyLinearToSRGB(t) {
    return this.r = Ii(t.r), this.g = Ii(t.g), this.b = Ii(t.b), this;
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
  getHex(t = ke) {
    return jt.workingToColorSpace(Ce.copy(this), t), Math.round(Vt(Ce.r * 255, 0, 255)) * 65536 + Math.round(Vt(Ce.g * 255, 0, 255)) * 256 + Math.round(Vt(Ce.b * 255, 0, 255));
  }
  /**
   * Returns the hexadecimal value of this color as a string (for example, 'FFFFFF').
   *
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {string} The hexadecimal value as a string.
   */
  getHexString(t = ke) {
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
  getHSL(t, e = jt.workingColorSpace) {
    jt.workingToColorSpace(Ce.copy(this), e);
    const n = Ce.r, s = Ce.g, r = Ce.b, o = Math.max(n, s, r), a = Math.min(n, s, r);
    let l, c;
    const h = (a + o) / 2;
    if (a === o)
      l = 0, c = 0;
    else {
      const u = o - a;
      switch (c = h <= 0.5 ? u / (o + a) : u / (2 - o - a), o) {
        case n:
          l = (s - r) / u + (s < r ? 6 : 0);
          break;
        case s:
          l = (r - n) / u + 2;
          break;
        case r:
          l = (n - s) / u + 4;
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
  getRGB(t, e = jt.workingColorSpace) {
    return jt.workingToColorSpace(Ce.copy(this), e), t.r = Ce.r, t.g = Ce.g, t.b = Ce.b, t;
  }
  /**
   * Returns the value of this color as a CSS style string. Example: `rgb(255,0,0)`.
   *
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {string} The CSS representation of this color.
   */
  getStyle(t = ke) {
    jt.workingToColorSpace(Ce.copy(this), t);
    const e = Ce.r, n = Ce.g, s = Ce.b;
    return t !== ke ? `color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})` : `rgb(${Math.round(e * 255)},${Math.round(n * 255)},${Math.round(s * 255)})`;
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
    return this.getHSL(Fn), this.setHSL(Fn.h + t, Fn.s + e, Fn.l + n);
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
    this.getHSL(Fn), t.getHSL(Ss);
    const n = Qi(Fn.h, Ss.h, e), s = Qi(Fn.s, Ss.s, e), r = Qi(Fn.l, Ss.l, e);
    return this.setHSL(n, s, r), this;
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
    const e = this.r, n = this.g, s = this.b, r = t.elements;
    return this.r = r[0] * e + r[3] * n + r[6] * s, this.g = r[1] * e + r[4] * n + r[7] * s, this.b = r[2] * e + r[5] * n + r[8] * s, this;
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
const Ce = /* @__PURE__ */ new qt();
qt.NAMES = Fl;
let Uh = 0;
class Vi extends oi {
  /**
   * Constructs a new material.
   */
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: Uh++ }), this.uuid = zi(), this.name = "", this.type = "Material", this.blending = Di, this.side = Hn, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = kr, this.blendDst = zr, this.blendEquation = Qn, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new qt(0, 0, 0), this.blendAlpha = 0, this.depthFunc = Ni, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = lo, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = ci, this.stencilZFail = ci, this.stencilZPass = ci, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.allowOverride = !0, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
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
        const s = this[e];
        if (s === void 0) {
          console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);
          continue;
        }
        s && s.isColor ? s.set(n) : s && s.isVector3 && n && n.isVector3 ? s.copy(n) : this[e] = n;
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
    n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(t).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(t).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(t).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.sheenColorMap && this.sheenColorMap.isTexture && (n.sheenColorMap = this.sheenColorMap.toJSON(t).uuid), this.sheenRoughnessMap && this.sheenRoughnessMap.isTexture && (n.sheenRoughnessMap = this.sheenRoughnessMap.toJSON(t).uuid), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(t).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(t).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(t).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(t).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(t).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(t).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(t).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(t).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(t).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(t).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(t).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(t).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(t).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(t).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(t).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(t).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(t).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(t).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(t).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(t).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(t).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== Di && (n.blending = this.blending), this.side !== Hn && (n.side = this.side), this.vertexColors === !0 && (n.vertexColors = !0), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === !0 && (n.transparent = !0), this.blendSrc !== kr && (n.blendSrc = this.blendSrc), this.blendDst !== zr && (n.blendDst = this.blendDst), this.blendEquation !== Qn && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== Ni && (n.depthFunc = this.depthFunc), this.depthTest === !1 && (n.depthTest = this.depthTest), this.depthWrite === !1 && (n.depthWrite = this.depthWrite), this.colorWrite === !1 && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== lo && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== ci && (n.stencilFail = this.stencilFail), this.stencilZFail !== ci && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== ci && (n.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === !0 && (n.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === !0 && (n.dithering = !0), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === !0 && (n.alphaHash = !0), this.alphaToCoverage === !0 && (n.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0), this.forceSinglePass === !0 && (n.forceSinglePass = !0), this.wireframe === !0 && (n.wireframe = !0), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (n.flatShading = !0), this.visible === !1 && (n.visible = !1), this.toneMapped === !1 && (n.toneMapped = !1), this.fog === !1 && (n.fog = !1), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
    function s(r) {
      const o = [];
      for (const a in r) {
        const l = r[a];
        delete l.metadata, o.push(l);
      }
      return o;
    }
    if (e) {
      const r = s(t.textures), o = s(t.images);
      r.length > 0 && (n.textures = r), o.length > 0 && (n.images = o);
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
      const s = e.length;
      n = new Array(s);
      for (let r = 0; r !== s; ++r)
        n[r] = e[r].clone();
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
class os extends Vi {
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
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new qt(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new xn(), this.combine = Sl, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.specularMap = t.specularMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.combine = t.combine, this.reflectivity = t.reflectivity, this.refractionRatio = t.refractionRatio, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.fog = t.fog, this;
  }
}
const me = /* @__PURE__ */ new L(), Es = /* @__PURE__ */ new Dt();
let Nh = 0;
class an {
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
    this.isBufferAttribute = !0, Object.defineProperty(this, "id", { value: Nh++ }), this.name = "", this.array = t, this.itemSize = e, this.count = t !== void 0 ? t.length / e : 0, this.normalized = n, this.usage = co, this.updateRanges = [], this.gpuType = Cn, this.version = 0;
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
    for (let s = 0, r = this.itemSize; s < r; s++)
      this.array[t + s] = e.array[n + s];
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
        Es.fromBufferAttribute(this, e), Es.applyMatrix3(t), this.setXY(e, Es.x, Es.y);
    else if (this.itemSize === 3)
      for (let e = 0, n = this.count; e < n; e++)
        me.fromBufferAttribute(this, e), me.applyMatrix3(t), this.setXYZ(e, me.x, me.y, me.z);
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
      me.fromBufferAttribute(this, e), me.applyMatrix4(t), this.setXYZ(e, me.x, me.y, me.z);
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
      me.fromBufferAttribute(this, e), me.applyNormalMatrix(t), this.setXYZ(e, me.x, me.y, me.z);
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
      me.fromBufferAttribute(this, e), me.transformDirection(t), this.setXYZ(e, me.x, me.y, me.z);
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
    return this.normalized && (n = bi(n, this.array)), n;
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
    return this.normalized && (n = Ie(n, this.array)), this.array[t * this.itemSize + e] = n, this;
  }
  /**
   * Returns the x component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @return {number} The x component.
   */
  getX(t) {
    let e = this.array[t * this.itemSize];
    return this.normalized && (e = bi(e, this.array)), e;
  }
  /**
   * Sets the x component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} x - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setX(t, e) {
    return this.normalized && (e = Ie(e, this.array)), this.array[t * this.itemSize] = e, this;
  }
  /**
   * Returns the y component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @return {number} The y component.
   */
  getY(t) {
    let e = this.array[t * this.itemSize + 1];
    return this.normalized && (e = bi(e, this.array)), e;
  }
  /**
   * Sets the y component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} y - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setY(t, e) {
    return this.normalized && (e = Ie(e, this.array)), this.array[t * this.itemSize + 1] = e, this;
  }
  /**
   * Returns the z component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @return {number} The z component.
   */
  getZ(t) {
    let e = this.array[t * this.itemSize + 2];
    return this.normalized && (e = bi(e, this.array)), e;
  }
  /**
   * Sets the z component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} z - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setZ(t, e) {
    return this.normalized && (e = Ie(e, this.array)), this.array[t * this.itemSize + 2] = e, this;
  }
  /**
   * Returns the w component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @return {number} The w component.
   */
  getW(t) {
    let e = this.array[t * this.itemSize + 3];
    return this.normalized && (e = bi(e, this.array)), e;
  }
  /**
   * Sets the w component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} w - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setW(t, e) {
    return this.normalized && (e = Ie(e, this.array)), this.array[t * this.itemSize + 3] = e, this;
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
    return t *= this.itemSize, this.normalized && (e = Ie(e, this.array), n = Ie(n, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this;
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
  setXYZ(t, e, n, s) {
    return t *= this.itemSize, this.normalized && (e = Ie(e, this.array), n = Ie(n, this.array), s = Ie(s, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = s, this;
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
  setXYZW(t, e, n, s, r) {
    return t *= this.itemSize, this.normalized && (e = Ie(e, this.array), n = Ie(n, this.array), s = Ie(s, this.array), r = Ie(r, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = s, this.array[t + 3] = r, this;
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
    return this.name !== "" && (t.name = this.name), this.usage !== co && (t.usage = this.usage), t;
  }
}
class Ol extends an {
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
class Bl extends an {
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
class _n extends an {
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
let Fh = 0;
const Ye = /* @__PURE__ */ new oe(), yr = /* @__PURE__ */ new xe(), xi = /* @__PURE__ */ new L(), We = /* @__PURE__ */ new Hi(), Ki = /* @__PURE__ */ new Hi(), ye = /* @__PURE__ */ new L();
class on extends oi {
  /**
   * Constructs a new geometry.
   */
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: Fh++ }), this.uuid = zi(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
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
    return Array.isArray(t) ? this.index = new (Ul(t) ? Bl : Ol)(t, 1) : this.index = t, this;
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
      const r = new Bt().getNormalMatrix(t);
      n.applyNormalMatrix(r), n.needsUpdate = !0;
    }
    const s = this.attributes.tangent;
    return s !== void 0 && (s.transformDirection(t), s.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  /**
   * Applies the rotation represented by the Quaternion to the geometry.
   *
   * @param {Quaternion} q - The Quaternion to apply.
   * @return {BufferGeometry} A reference to this instance.
   */
  applyQuaternion(t) {
    return Ye.makeRotationFromQuaternion(t), this.applyMatrix4(Ye), this;
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
    return Ye.makeRotationX(t), this.applyMatrix4(Ye), this;
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
    return Ye.makeRotationY(t), this.applyMatrix4(Ye), this;
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
    return Ye.makeRotationZ(t), this.applyMatrix4(Ye), this;
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
    return Ye.makeTranslation(t, e, n), this.applyMatrix4(Ye), this;
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
    return Ye.makeScale(t, e, n), this.applyMatrix4(Ye), this;
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
    return yr.lookAt(t), yr.updateMatrix(), this.applyMatrix4(yr.matrix), this;
  }
  /**
   * Center the geometry based on its bounding box.
   *
   * @return {BufferGeometry} A reference to this instance.
   */
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(xi).negate(), this.translate(xi.x, xi.y, xi.z), this;
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
      for (let s = 0, r = t.length; s < r; s++) {
        const o = t[s];
        n.push(o.x, o.y, o.z || 0);
      }
      this.setAttribute("position", new _n(n, 3));
    } else {
      const n = Math.min(t.length, e.count);
      for (let s = 0; s < n; s++) {
        const r = t[s];
        e.setXYZ(s, r.x, r.y, r.z || 0);
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
    this.boundingBox === null && (this.boundingBox = new Hi());
    const t = this.attributes.position, e = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(
        new L(-1 / 0, -1 / 0, -1 / 0),
        new L(1 / 0, 1 / 0, 1 / 0)
      );
      return;
    }
    if (t !== void 0) {
      if (this.boundingBox.setFromBufferAttribute(t), e)
        for (let n = 0, s = e.length; n < s; n++) {
          const r = e[n];
          We.setFromBufferAttribute(r), this.morphTargetsRelative ? (ye.addVectors(this.boundingBox.min, We.min), this.boundingBox.expandByPoint(ye), ye.addVectors(this.boundingBox.max, We.max), this.boundingBox.expandByPoint(ye)) : (this.boundingBox.expandByPoint(We.min), this.boundingBox.expandByPoint(We.max));
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
    this.boundingSphere === null && (this.boundingSphere = new Qs());
    const t = this.attributes.position, e = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new L(), 1 / 0);
      return;
    }
    if (t) {
      const n = this.boundingSphere.center;
      if (We.setFromBufferAttribute(t), e)
        for (let r = 0, o = e.length; r < o; r++) {
          const a = e[r];
          Ki.setFromBufferAttribute(a), this.morphTargetsRelative ? (ye.addVectors(We.min, Ki.min), We.expandByPoint(ye), ye.addVectors(We.max, Ki.max), We.expandByPoint(ye)) : (We.expandByPoint(Ki.min), We.expandByPoint(Ki.max));
        }
      We.getCenter(n);
      let s = 0;
      for (let r = 0, o = t.count; r < o; r++)
        ye.fromBufferAttribute(t, r), s = Math.max(s, n.distanceToSquared(ye));
      if (e)
        for (let r = 0, o = e.length; r < o; r++) {
          const a = e[r], l = this.morphTargetsRelative;
          for (let c = 0, h = a.count; c < h; c++)
            ye.fromBufferAttribute(a, c), l && (xi.fromBufferAttribute(t, c), ye.add(xi)), s = Math.max(s, n.distanceToSquared(ye));
        }
      this.boundingSphere.radius = Math.sqrt(s), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
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
    const n = e.position, s = e.normal, r = e.uv;
    this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new an(new Float32Array(4 * n.count), 4));
    const o = this.getAttribute("tangent"), a = [], l = [];
    for (let N = 0; N < n.count; N++)
      a[N] = new L(), l[N] = new L();
    const c = new L(), h = new L(), u = new L(), f = new Dt(), m = new Dt(), _ = new Dt(), v = new L(), p = new L();
    function d(N, M, S) {
      c.fromBufferAttribute(n, N), h.fromBufferAttribute(n, M), u.fromBufferAttribute(n, S), f.fromBufferAttribute(r, N), m.fromBufferAttribute(r, M), _.fromBufferAttribute(r, S), h.sub(c), u.sub(c), m.sub(f), _.sub(f);
      const D = 1 / (m.x * _.y - _.x * m.y);
      isFinite(D) && (v.copy(h).multiplyScalar(_.y).addScaledVector(u, -m.y).multiplyScalar(D), p.copy(u).multiplyScalar(m.x).addScaledVector(h, -_.x).multiplyScalar(D), a[N].add(v), a[M].add(v), a[S].add(v), l[N].add(p), l[M].add(p), l[S].add(p));
    }
    let T = this.groups;
    T.length === 0 && (T = [{
      start: 0,
      count: t.count
    }]);
    for (let N = 0, M = T.length; N < M; ++N) {
      const S = T[N], D = S.start, k = S.count;
      for (let H = D, Y = D + k; H < Y; H += 3)
        d(
          t.getX(H + 0),
          t.getX(H + 1),
          t.getX(H + 2)
        );
    }
    const A = new L(), E = new L(), b = new L(), R = new L();
    function C(N) {
      b.fromBufferAttribute(s, N), R.copy(b);
      const M = a[N];
      A.copy(M), A.sub(b.multiplyScalar(b.dot(M))).normalize(), E.crossVectors(R, M);
      const D = E.dot(l[N]) < 0 ? -1 : 1;
      o.setXYZW(N, A.x, A.y, A.z, D);
    }
    for (let N = 0, M = T.length; N < M; ++N) {
      const S = T[N], D = S.start, k = S.count;
      for (let H = D, Y = D + k; H < Y; H += 3)
        C(t.getX(H + 0)), C(t.getX(H + 1)), C(t.getX(H + 2));
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
        n = new an(new Float32Array(e.count * 3), 3), this.setAttribute("normal", n);
      else
        for (let f = 0, m = n.count; f < m; f++)
          n.setXYZ(f, 0, 0, 0);
      const s = new L(), r = new L(), o = new L(), a = new L(), l = new L(), c = new L(), h = new L(), u = new L();
      if (t)
        for (let f = 0, m = t.count; f < m; f += 3) {
          const _ = t.getX(f + 0), v = t.getX(f + 1), p = t.getX(f + 2);
          s.fromBufferAttribute(e, _), r.fromBufferAttribute(e, v), o.fromBufferAttribute(e, p), h.subVectors(o, r), u.subVectors(s, r), h.cross(u), a.fromBufferAttribute(n, _), l.fromBufferAttribute(n, v), c.fromBufferAttribute(n, p), a.add(h), l.add(h), c.add(h), n.setXYZ(_, a.x, a.y, a.z), n.setXYZ(v, l.x, l.y, l.z), n.setXYZ(p, c.x, c.y, c.z);
        }
      else
        for (let f = 0, m = e.count; f < m; f += 3)
          s.fromBufferAttribute(e, f + 0), r.fromBufferAttribute(e, f + 1), o.fromBufferAttribute(e, f + 2), h.subVectors(o, r), u.subVectors(s, r), h.cross(u), n.setXYZ(f + 0, h.x, h.y, h.z), n.setXYZ(f + 1, h.x, h.y, h.z), n.setXYZ(f + 2, h.x, h.y, h.z);
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
      ye.fromBufferAttribute(t, e), ye.normalize(), t.setXYZ(e, ye.x, ye.y, ye.z);
  }
  /**
   * Return a new non-index version of this indexed geometry. If the geometry
   * is already non-indexed, the method is a NOOP.
   *
   * @return {BufferGeometry} The non-indexed version of this indexed geometry.
   */
  toNonIndexed() {
    function t(a, l) {
      const c = a.array, h = a.itemSize, u = a.normalized, f = new c.constructor(l.length * h);
      let m = 0, _ = 0;
      for (let v = 0, p = l.length; v < p; v++) {
        a.isInterleavedBufferAttribute ? m = l[v] * a.data.stride + a.offset : m = l[v] * h;
        for (let d = 0; d < h; d++)
          f[_++] = c[m++];
      }
      return new an(f, h, u);
    }
    if (this.index === null)
      return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    const e = new on(), n = this.index.array, s = this.attributes;
    for (const a in s) {
      const l = s[a], c = t(l, n);
      e.setAttribute(a, c);
    }
    const r = this.morphAttributes;
    for (const a in r) {
      const l = [], c = r[a];
      for (let h = 0, u = c.length; h < u; h++) {
        const f = c[h], m = t(f, n);
        l.push(m);
      }
      e.morphAttributes[a] = l;
    }
    e.morphTargetsRelative = this.morphTargetsRelative;
    const o = this.groups;
    for (let a = 0, l = o.length; a < l; a++) {
      const c = o[a];
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
    const s = {};
    let r = !1;
    for (const l in this.morphAttributes) {
      const c = this.morphAttributes[l], h = [];
      for (let u = 0, f = c.length; u < f; u++) {
        const m = c[u];
        h.push(m.toJSON(t.data));
      }
      h.length > 0 && (s[l] = h, r = !0);
    }
    r && (t.data.morphAttributes = s, t.data.morphTargetsRelative = this.morphTargetsRelative);
    const o = this.groups;
    o.length > 0 && (t.data.groups = JSON.parse(JSON.stringify(o)));
    const a = this.boundingSphere;
    return a !== null && (t.data.boundingSphere = a.toJSON()), t;
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
    const s = t.attributes;
    for (const c in s) {
      const h = s[c];
      this.setAttribute(c, h.clone(e));
    }
    const r = t.morphAttributes;
    for (const c in r) {
      const h = [], u = r[c];
      for (let f = 0, m = u.length; f < m; f++)
        h.push(u[f].clone(e));
      this.morphAttributes[c] = h;
    }
    this.morphTargetsRelative = t.morphTargetsRelative;
    const o = t.groups;
    for (let c = 0, h = o.length; c < h; c++) {
      const u = o[c];
      this.addGroup(u.start, u.count, u.materialIndex);
    }
    const a = t.boundingBox;
    a !== null && (this.boundingBox = a.clone());
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
const To = /* @__PURE__ */ new oe(), Yn = /* @__PURE__ */ new tr(), ys = /* @__PURE__ */ new Qs(), Ao = /* @__PURE__ */ new L(), bs = /* @__PURE__ */ new L(), Ts = /* @__PURE__ */ new L(), As = /* @__PURE__ */ new L(), br = /* @__PURE__ */ new L(), ws = /* @__PURE__ */ new L(), wo = /* @__PURE__ */ new L(), Rs = /* @__PURE__ */ new L();
class Xe extends xe {
  /**
   * Constructs a new mesh.
   *
   * @param {BufferGeometry} [geometry] - The mesh geometry.
   * @param {Material|Array<Material>} [material] - The mesh material.
   */
  constructor(t = new on(), e = new os()) {
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
      const s = e[n[0]];
      if (s !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let r = 0, o = s.length; r < o; r++) {
          const a = s[r].name || String(r);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[a] = r;
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
    const n = this.geometry, s = n.attributes.position, r = n.morphAttributes.position, o = n.morphTargetsRelative;
    e.fromBufferAttribute(s, t);
    const a = this.morphTargetInfluences;
    if (r && a) {
      ws.set(0, 0, 0);
      for (let l = 0, c = r.length; l < c; l++) {
        const h = a[l], u = r[l];
        h !== 0 && (br.fromBufferAttribute(u, t), o ? ws.addScaledVector(br, h) : ws.addScaledVector(br.sub(e), h));
      }
      e.add(ws);
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
    const n = this.geometry, s = this.material, r = this.matrixWorld;
    s !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), ys.copy(n.boundingSphere), ys.applyMatrix4(r), Yn.copy(t.ray).recast(t.near), !(ys.containsPoint(Yn.origin) === !1 && (Yn.intersectSphere(ys, Ao) === null || Yn.origin.distanceToSquared(Ao) > (t.far - t.near) ** 2)) && (To.copy(r).invert(), Yn.copy(t.ray).applyMatrix4(To), !(n.boundingBox !== null && Yn.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(t, e, Yn)));
  }
  _computeIntersections(t, e, n) {
    let s;
    const r = this.geometry, o = this.material, a = r.index, l = r.attributes.position, c = r.attributes.uv, h = r.attributes.uv1, u = r.attributes.normal, f = r.groups, m = r.drawRange;
    if (a !== null)
      if (Array.isArray(o))
        for (let _ = 0, v = f.length; _ < v; _++) {
          const p = f[_], d = o[p.materialIndex], T = Math.max(p.start, m.start), A = Math.min(a.count, Math.min(p.start + p.count, m.start + m.count));
          for (let E = T, b = A; E < b; E += 3) {
            const R = a.getX(E), C = a.getX(E + 1), N = a.getX(E + 2);
            s = Cs(this, d, t, n, c, h, u, R, C, N), s && (s.faceIndex = Math.floor(E / 3), s.face.materialIndex = p.materialIndex, e.push(s));
          }
        }
      else {
        const _ = Math.max(0, m.start), v = Math.min(a.count, m.start + m.count);
        for (let p = _, d = v; p < d; p += 3) {
          const T = a.getX(p), A = a.getX(p + 1), E = a.getX(p + 2);
          s = Cs(this, o, t, n, c, h, u, T, A, E), s && (s.faceIndex = Math.floor(p / 3), e.push(s));
        }
      }
    else if (l !== void 0)
      if (Array.isArray(o))
        for (let _ = 0, v = f.length; _ < v; _++) {
          const p = f[_], d = o[p.materialIndex], T = Math.max(p.start, m.start), A = Math.min(l.count, Math.min(p.start + p.count, m.start + m.count));
          for (let E = T, b = A; E < b; E += 3) {
            const R = E, C = E + 1, N = E + 2;
            s = Cs(this, d, t, n, c, h, u, R, C, N), s && (s.faceIndex = Math.floor(E / 3), s.face.materialIndex = p.materialIndex, e.push(s));
          }
        }
      else {
        const _ = Math.max(0, m.start), v = Math.min(l.count, m.start + m.count);
        for (let p = _, d = v; p < d; p += 3) {
          const T = p, A = p + 1, E = p + 2;
          s = Cs(this, o, t, n, c, h, u, T, A, E), s && (s.faceIndex = Math.floor(p / 3), e.push(s));
        }
      }
  }
}
function Oh(i, t, e, n, s, r, o, a) {
  let l;
  if (t.side === ze ? l = n.intersectTriangle(o, r, s, !0, a) : l = n.intersectTriangle(s, r, o, t.side === Hn, a), l === null) return null;
  Rs.copy(a), Rs.applyMatrix4(i.matrixWorld);
  const c = e.ray.origin.distanceTo(Rs);
  return c < e.near || c > e.far ? null : {
    distance: c,
    point: Rs.clone(),
    object: i
  };
}
function Cs(i, t, e, n, s, r, o, a, l, c) {
  i.getVertexPosition(a, bs), i.getVertexPosition(l, Ts), i.getVertexPosition(c, As);
  const h = Oh(i, t, e, n, bs, Ts, As, wo);
  if (h) {
    const u = new L();
    Ke.getBarycoord(wo, bs, Ts, As, u), s && (h.uv = Ke.getInterpolatedAttribute(s, a, l, c, u, new Dt())), r && (h.uv1 = Ke.getInterpolatedAttribute(r, a, l, c, u, new Dt())), o && (h.normal = Ke.getInterpolatedAttribute(o, a, l, c, u, new L()), h.normal.dot(n.direction) > 0 && h.normal.multiplyScalar(-1));
    const f = {
      a,
      b: l,
      c,
      normal: new L(),
      materialIndex: 0
    };
    Ke.getNormal(bs, Ts, As, f.normal), h.face = f, h.barycoord = u;
  }
  return h;
}
class Vn extends on {
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
  constructor(t = 1, e = 1, n = 1, s = 1, r = 1, o = 1) {
    super(), this.type = "BoxGeometry", this.parameters = {
      width: t,
      height: e,
      depth: n,
      widthSegments: s,
      heightSegments: r,
      depthSegments: o
    };
    const a = this;
    s = Math.floor(s), r = Math.floor(r), o = Math.floor(o);
    const l = [], c = [], h = [], u = [];
    let f = 0, m = 0;
    _("z", "y", "x", -1, -1, n, e, t, o, r, 0), _("z", "y", "x", 1, -1, n, e, -t, o, r, 1), _("x", "z", "y", 1, 1, t, n, e, s, o, 2), _("x", "z", "y", 1, -1, t, n, -e, s, o, 3), _("x", "y", "z", 1, -1, t, e, n, s, r, 4), _("x", "y", "z", -1, -1, t, e, -n, s, r, 5), this.setIndex(l), this.setAttribute("position", new _n(c, 3)), this.setAttribute("normal", new _n(h, 3)), this.setAttribute("uv", new _n(u, 2));
    function _(v, p, d, T, A, E, b, R, C, N, M) {
      const S = E / C, D = b / N, k = E / 2, H = b / 2, Y = R / 2, W = C + 1, X = N + 1;
      let j = 0, z = 0;
      const st = new L();
      for (let ht = 0; ht < X; ht++) {
        const _t = ht * D - H;
        for (let Ht = 0; Ht < W; Ht++) {
          const Jt = Ht * S - k;
          st[v] = Jt * T, st[p] = _t * A, st[d] = Y, c.push(st.x, st.y, st.z), st[v] = 0, st[p] = 0, st[d] = R > 0 ? 1 : -1, h.push(st.x, st.y, st.z), u.push(Ht / C), u.push(1 - ht / N), j += 1;
        }
      }
      for (let ht = 0; ht < N; ht++)
        for (let _t = 0; _t < C; _t++) {
          const Ht = f + _t + W * ht, Jt = f + _t + W * (ht + 1), Gt = f + (_t + 1) + W * (ht + 1), Ft = f + (_t + 1) + W * ht;
          l.push(Ht, Jt, Ft), l.push(Jt, Gt, Ft), z += 6;
        }
      a.addGroup(m, z, M), m += z, f += j;
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
    return new Vn(t.width, t.height, t.depth, t.widthSegments, t.heightSegments, t.depthSegments);
  }
}
function ki(i) {
  const t = {};
  for (const e in i) {
    t[e] = {};
    for (const n in i[e]) {
      const s = i[e][n];
      s && (s.isColor || s.isMatrix3 || s.isMatrix4 || s.isVector2 || s.isVector3 || s.isVector4 || s.isTexture || s.isQuaternion) ? s.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), t[e][n] = null) : t[e][n] = s.clone() : Array.isArray(s) ? t[e][n] = s.slice() : t[e][n] = s;
    }
  }
  return t;
}
function Ue(i) {
  const t = {};
  for (let e = 0; e < i.length; e++) {
    const n = ki(i[e]);
    for (const s in n)
      t[s] = n[s];
  }
  return t;
}
function Bh(i) {
  const t = [];
  for (let e = 0; e < i.length; e++)
    t.push(i[e].clone());
  return t;
}
function kl(i) {
  const t = i.getRenderTarget();
  return t === null ? i.outputColorSpace : t.isXRRenderTarget === !0 ? t.texture.colorSpace : jt.workingColorSpace;
}
const kh = { clone: ki, merge: Ue };
var zh = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, Hh = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class Gn extends Vi {
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
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = zh, this.fragmentShader = Hh, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
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
    return super.copy(t), this.fragmentShader = t.fragmentShader, this.vertexShader = t.vertexShader, this.uniforms = ki(t.uniforms), this.uniformsGroups = Bh(t.uniformsGroups), this.defines = Object.assign({}, t.defines), this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.fog = t.fog, this.lights = t.lights, this.clipping = t.clipping, this.extensions = Object.assign({}, t.extensions), this.glslVersion = t.glslVersion, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    e.glslVersion = this.glslVersion, e.uniforms = {};
    for (const s in this.uniforms) {
      const o = this.uniforms[s].value;
      o && o.isTexture ? e.uniforms[s] = {
        type: "t",
        value: o.toJSON(t).uuid
      } : o && o.isColor ? e.uniforms[s] = {
        type: "c",
        value: o.getHex()
      } : o && o.isVector2 ? e.uniforms[s] = {
        type: "v2",
        value: o.toArray()
      } : o && o.isVector3 ? e.uniforms[s] = {
        type: "v3",
        value: o.toArray()
      } : o && o.isVector4 ? e.uniforms[s] = {
        type: "v4",
        value: o.toArray()
      } : o && o.isMatrix3 ? e.uniforms[s] = {
        type: "m3",
        value: o.toArray()
      } : o && o.isMatrix4 ? e.uniforms[s] = {
        type: "m4",
        value: o.toArray()
      } : e.uniforms[s] = {
        value: o
      };
    }
    Object.keys(this.defines).length > 0 && (e.defines = this.defines), e.vertexShader = this.vertexShader, e.fragmentShader = this.fragmentShader, e.lights = this.lights, e.clipping = this.clipping;
    const n = {};
    for (const s in this.extensions)
      this.extensions[s] === !0 && (n[s] = !0);
    return Object.keys(n).length > 0 && (e.extensions = n), e;
  }
}
class zl extends xe {
  /**
   * Constructs a new camera.
   */
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new oe(), this.projectionMatrix = new oe(), this.projectionMatrixInverse = new oe(), this.coordinateSystem = pn, this._reversedDepth = !1;
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
const On = /* @__PURE__ */ new L(), Ro = /* @__PURE__ */ new Dt(), Co = /* @__PURE__ */ new Dt();
class je extends zl {
  /**
   * Constructs a new perspective camera.
   *
   * @param {number} [fov=50] - The vertical field of view.
   * @param {number} [aspect=1] - The aspect ratio.
   * @param {number} [near=0.1] - The camera's near plane.
   * @param {number} [far=2000] - The camera's far plane.
   */
  constructor(t = 50, e = 1, n = 0.1, s = 2e3) {
    super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = t, this.zoom = 1, this.near = n, this.far = s, this.focus = 10, this.aspect = e, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
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
    this.fov = rs * 2 * Math.atan(e), this.updateProjectionMatrix();
  }
  /**
   * Returns the focal length from the current {@link PerspectiveCamera#fov} and
   * {@link PerspectiveCamera#filmGauge}.
   *
   * @return {number} The computed focal length.
   */
  getFocalLength() {
    const t = Math.tan(Li * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / t;
  }
  /**
   * Returns the current vertical field of view angle in degrees considering {@link PerspectiveCamera#zoom}.
   *
   * @return {number} The effective FOV.
   */
  getEffectiveFOV() {
    return rs * 2 * Math.atan(
      Math.tan(Li * 0.5 * this.fov) / this.zoom
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
    On.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), e.set(On.x, On.y).multiplyScalar(-t / On.z), On.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(On.x, On.y).multiplyScalar(-t / On.z);
  }
  /**
   * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
   *
   * @param {number} distance - The viewing distance.
   * @param {Vector2} target - The target vector that is used to store result where x is width and y is height.
   * @returns {Vector2} The view size.
   */
  getViewSize(t, e) {
    return this.getViewBounds(t, Ro, Co), e.subVectors(Co, Ro);
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
  setViewOffset(t, e, n, s, r, o) {
    this.aspect = t / e, this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = t, this.view.fullHeight = e, this.view.offsetX = n, this.view.offsetY = s, this.view.width = r, this.view.height = o, this.updateProjectionMatrix();
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
    let e = t * Math.tan(Li * 0.5 * this.fov) / this.zoom, n = 2 * e, s = this.aspect * n, r = -0.5 * s;
    const o = this.view;
    if (this.view !== null && this.view.enabled) {
      const l = o.fullWidth, c = o.fullHeight;
      r += o.offsetX * s / l, e -= o.offsetY * n / c, s *= o.width / l, n *= o.height / c;
    }
    const a = this.filmOffset;
    a !== 0 && (r += t * a / this.getFilmWidth()), this.projectionMatrix.makePerspective(r, r + s, e, e - n, t, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return e.object.fov = this.fov, e.object.zoom = this.zoom, e.object.near = this.near, e.object.far = this.far, e.object.focus = this.focus, e.object.aspect = this.aspect, this.view !== null && (e.object.view = Object.assign({}, this.view)), e.object.filmGauge = this.filmGauge, e.object.filmOffset = this.filmOffset, e;
  }
}
const Mi = -90, Si = 1;
class Vh extends xe {
  /**
   * Constructs a new cube camera.
   *
   * @param {number} near - The camera's near plane.
   * @param {number} far - The camera's far plane.
   * @param {WebGLCubeRenderTarget} renderTarget - The cube render target.
   */
  constructor(t, e, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const s = new je(Mi, Si, t, e);
    s.layers = this.layers, this.add(s);
    const r = new je(Mi, Si, t, e);
    r.layers = this.layers, this.add(r);
    const o = new je(Mi, Si, t, e);
    o.layers = this.layers, this.add(o);
    const a = new je(Mi, Si, t, e);
    a.layers = this.layers, this.add(a);
    const l = new je(Mi, Si, t, e);
    l.layers = this.layers, this.add(l);
    const c = new je(Mi, Si, t, e);
    c.layers = this.layers, this.add(c);
  }
  /**
   * Must be called when the coordinate system of the cube camera is changed.
   */
  updateCoordinateSystem() {
    const t = this.coordinateSystem, e = this.children.concat(), [n, s, r, o, a, l] = e;
    for (const c of e) this.remove(c);
    if (t === pn)
      n.up.set(0, 1, 0), n.lookAt(1, 0, 0), s.up.set(0, 1, 0), s.lookAt(-1, 0, 0), r.up.set(0, 0, -1), r.lookAt(0, 1, 0), o.up.set(0, 0, 1), o.lookAt(0, -1, 0), a.up.set(0, 1, 0), a.lookAt(0, 0, 1), l.up.set(0, 1, 0), l.lookAt(0, 0, -1);
    else if (t === $s)
      n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), s.up.set(0, -1, 0), s.lookAt(1, 0, 0), r.up.set(0, 0, 1), r.lookAt(0, 1, 0), o.up.set(0, 0, -1), o.lookAt(0, -1, 0), a.up.set(0, -1, 0), a.lookAt(0, 0, 1), l.up.set(0, -1, 0), l.lookAt(0, 0, -1);
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
    const { renderTarget: n, activeMipmapLevel: s } = this;
    this.coordinateSystem !== t.coordinateSystem && (this.coordinateSystem = t.coordinateSystem, this.updateCoordinateSystem());
    const [r, o, a, l, c, h] = this.children, u = t.getRenderTarget(), f = t.getActiveCubeFace(), m = t.getActiveMipmapLevel(), _ = t.xr.enabled;
    t.xr.enabled = !1;
    const v = n.texture.generateMipmaps;
    n.texture.generateMipmaps = !1, t.setRenderTarget(n, 0, s), t.render(e, r), t.setRenderTarget(n, 1, s), t.render(e, o), t.setRenderTarget(n, 2, s), t.render(e, a), t.setRenderTarget(n, 3, s), t.render(e, l), t.setRenderTarget(n, 4, s), t.render(e, c), n.texture.generateMipmaps = v, t.setRenderTarget(n, 5, s), t.render(e, h), t.setRenderTarget(u, f, m), t.xr.enabled = _, n.texture.needsPMREMUpdate = !0;
  }
}
class Hl extends Fe {
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
  constructor(t = [], e = Fi, n, s, r, o, a, l, c, h) {
    super(t, e, n, s, r, o, a, l, c, h), this.isCubeTexture = !0, this.flipY = !1;
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
class Gh extends ai {
  /**
   * Constructs a new cube render target.
   *
   * @param {number} [size=1] - The size of the render target.
   * @param {RenderTarget~Options} [options] - The configuration object.
   */
  constructor(t = 1, e = {}) {
    super(t, t, e), this.isWebGLCubeRenderTarget = !0;
    const n = { width: t, height: t, depth: 1 }, s = [n, n, n, n, n, n];
    this.texture = new Hl(s), this._setTextureOptions(e), this.texture.isRenderTargetTexture = !0;
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
    }, s = new Vn(5, 5, 5), r = new Gn({
      name: "CubemapFromEquirect",
      uniforms: ki(n.uniforms),
      vertexShader: n.vertexShader,
      fragmentShader: n.fragmentShader,
      side: ze,
      blending: kn
    });
    r.uniforms.tEquirect.value = e;
    const o = new Xe(s, r), a = e.minFilter;
    return e.minFilter === ni && (e.minFilter = fn), new Vh(1, 10, this).update(t, o), e.minFilter = a, o.geometry.dispose(), o.material.dispose(), this;
  }
  /**
   * Clears this cube render target.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {boolean} [color=true] - Whether the color buffer should be cleared or not.
   * @param {boolean} [depth=true] - Whether the depth buffer should be cleared or not.
   * @param {boolean} [stencil=true] - Whether the stencil buffer should be cleared or not.
   */
  clear(t, e = !0, n = !0, s = !0) {
    const r = t.getRenderTarget();
    for (let o = 0; o < 6; o++)
      t.setRenderTarget(this, o), t.clear(e, n, s);
    t.setRenderTarget(r);
  }
}
class Ze extends xe {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group";
  }
}
const Wh = { type: "move" };
class Tr {
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
    return this._hand === null && (this._hand = new Ze(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
  }
  /**
   * Returns a group representing the target ray space of the XR controller.
   *
   * @return {Group} A group representing the target ray space of the XR controller.
   */
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new Ze(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new L(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new L()), this._targetRay;
  }
  /**
   * Returns a group representing the grip space of the XR controller.
   *
   * @return {Group} A group representing the grip space of the XR controller.
   */
  getGripSpace() {
    return this._grip === null && (this._grip = new Ze(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new L(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new L()), this._grip;
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
    let s = null, r = null, o = null;
    const a = this._targetRay, l = this._grip, c = this._hand;
    if (t && e.session.visibilityState !== "visible-blurred") {
      if (c && t.hand) {
        o = !0;
        for (const v of t.hand.values()) {
          const p = e.getJointPose(v, n), d = this._getHandJoint(c, v);
          p !== null && (d.matrix.fromArray(p.transform.matrix), d.matrix.decompose(d.position, d.rotation, d.scale), d.matrixWorldNeedsUpdate = !0, d.jointRadius = p.radius), d.visible = p !== null;
        }
        const h = c.joints["index-finger-tip"], u = c.joints["thumb-tip"], f = h.position.distanceTo(u.position), m = 0.02, _ = 5e-3;
        c.inputState.pinching && f > m + _ ? (c.inputState.pinching = !1, this.dispatchEvent({
          type: "pinchend",
          handedness: t.handedness,
          target: this
        })) : !c.inputState.pinching && f <= m - _ && (c.inputState.pinching = !0, this.dispatchEvent({
          type: "pinchstart",
          handedness: t.handedness,
          target: this
        }));
      } else
        l !== null && t.gripSpace && (r = e.getPose(t.gripSpace, n), r !== null && (l.matrix.fromArray(r.transform.matrix), l.matrix.decompose(l.position, l.rotation, l.scale), l.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (l.hasLinearVelocity = !0, l.linearVelocity.copy(r.linearVelocity)) : l.hasLinearVelocity = !1, r.angularVelocity ? (l.hasAngularVelocity = !0, l.angularVelocity.copy(r.angularVelocity)) : l.hasAngularVelocity = !1));
      a !== null && (s = e.getPose(t.targetRaySpace, n), s === null && r !== null && (s = r), s !== null && (a.matrix.fromArray(s.transform.matrix), a.matrix.decompose(a.position, a.rotation, a.scale), a.matrixWorldNeedsUpdate = !0, s.linearVelocity ? (a.hasLinearVelocity = !0, a.linearVelocity.copy(s.linearVelocity)) : a.hasLinearVelocity = !1, s.angularVelocity ? (a.hasAngularVelocity = !0, a.angularVelocity.copy(s.angularVelocity)) : a.hasAngularVelocity = !1, this.dispatchEvent(Wh)));
    }
    return a !== null && (a.visible = s !== null), l !== null && (l.visible = r !== null), c !== null && (c.visible = o !== null), this;
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
      const n = new Ze();
      n.matrixAutoUpdate = !1, n.visible = !1, t.joints[e.jointName] = n, t.add(n);
    }
    return t.joints[e.jointName];
  }
}
class Xh extends xe {
  /**
   * Constructs a new scene.
   */
  constructor() {
    super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new xn(), this.environmentIntensity = 1, this.environmentRotation = new xn(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  copy(t, e) {
    return super.copy(t, e), t.background !== null && (this.background = t.background.clone()), t.environment !== null && (this.environment = t.environment.clone()), t.fog !== null && (this.fog = t.fog.clone()), this.backgroundBlurriness = t.backgroundBlurriness, this.backgroundIntensity = t.backgroundIntensity, this.backgroundRotation.copy(t.backgroundRotation), this.environmentIntensity = t.environmentIntensity, this.environmentRotation.copy(t.environmentRotation), t.overrideMaterial !== null && (this.overrideMaterial = t.overrideMaterial.clone()), this.matrixAutoUpdate = t.matrixAutoUpdate, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return this.fog !== null && (e.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (e.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (e.object.backgroundIntensity = this.backgroundIntensity), e.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (e.object.environmentIntensity = this.environmentIntensity), e.object.environmentRotation = this.environmentRotation.toArray(), e;
  }
}
const Ar = /* @__PURE__ */ new L(), $h = /* @__PURE__ */ new L(), qh = /* @__PURE__ */ new Bt();
class Rn {
  /**
   * Constructs a new plane.
   *
   * @param {Vector3} [normal=(1,0,0)] - A unit length vector defining the normal of the plane.
   * @param {number} [constant=0] - The signed distance from the origin to the plane.
   */
  constructor(t = new L(1, 0, 0), e = 0) {
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
  setComponents(t, e, n, s) {
    return this.normal.set(t, e, n), this.constant = s, this;
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
    const s = Ar.subVectors(n, e).cross($h.subVectors(t, e)).normalize();
    return this.setFromNormalAndCoplanarPoint(s, t), this;
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
    const n = t.delta(Ar), s = this.normal.dot(n);
    if (s === 0)
      return this.distanceToPoint(t.start) === 0 ? e.copy(t.start) : null;
    const r = -(t.start.dot(this.normal) + this.constant) / s;
    return r < 0 || r > 1 ? null : e.copy(t.start).addScaledVector(n, r);
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
    const n = e || qh.getNormalMatrix(t), s = this.coplanarPoint(Ar).applyMatrix4(t), r = this.normal.applyMatrix3(n).normalize();
    return this.constant = -s.dot(r), this;
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
const jn = /* @__PURE__ */ new Qs(), Yh = /* @__PURE__ */ new Dt(0.5, 0.5), Ps = /* @__PURE__ */ new L();
class Ga {
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
  constructor(t = new Rn(), e = new Rn(), n = new Rn(), s = new Rn(), r = new Rn(), o = new Rn()) {
    this.planes = [t, e, n, s, r, o];
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
  set(t, e, n, s, r, o) {
    const a = this.planes;
    return a[0].copy(t), a[1].copy(e), a[2].copy(n), a[3].copy(s), a[4].copy(r), a[5].copy(o), this;
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
  setFromProjectionMatrix(t, e = pn, n = !1) {
    const s = this.planes, r = t.elements, o = r[0], a = r[1], l = r[2], c = r[3], h = r[4], u = r[5], f = r[6], m = r[7], _ = r[8], v = r[9], p = r[10], d = r[11], T = r[12], A = r[13], E = r[14], b = r[15];
    if (s[0].setComponents(c - o, m - h, d - _, b - T).normalize(), s[1].setComponents(c + o, m + h, d + _, b + T).normalize(), s[2].setComponents(c + a, m + u, d + v, b + A).normalize(), s[3].setComponents(c - a, m - u, d - v, b - A).normalize(), n)
      s[4].setComponents(l, f, p, E).normalize(), s[5].setComponents(c - l, m - f, d - p, b - E).normalize();
    else if (s[4].setComponents(c - l, m - f, d - p, b - E).normalize(), e === pn)
      s[5].setComponents(c + l, m + f, d + p, b + E).normalize();
    else if (e === $s)
      s[5].setComponents(l, f, p, E).normalize();
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
      t.boundingSphere === null && t.computeBoundingSphere(), jn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);
    else {
      const e = t.geometry;
      e.boundingSphere === null && e.computeBoundingSphere(), jn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld);
    }
    return this.intersectsSphere(jn);
  }
  /**
   * Returns `true` if the given sprite is intersecting this frustum.
   *
   * @param {Sprite} sprite - The sprite to test.
   * @return {boolean} Whether the sprite is intersecting this frustum or not.
   */
  intersectsSprite(t) {
    jn.center.set(0, 0, 0);
    const e = Yh.distanceTo(t.center);
    return jn.radius = 0.7071067811865476 + e, jn.applyMatrix4(t.matrixWorld), this.intersectsSphere(jn);
  }
  /**
   * Returns `true` if the given bounding sphere is intersecting this frustum.
   *
   * @param {Sphere} sphere - The bounding sphere to test.
   * @return {boolean} Whether the bounding sphere is intersecting this frustum or not.
   */
  intersectsSphere(t) {
    const e = this.planes, n = t.center, s = -t.radius;
    for (let r = 0; r < 6; r++)
      if (e[r].distanceToPoint(n) < s)
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
      const s = e[n];
      if (Ps.x = s.normal.x > 0 ? t.max.x : t.min.x, Ps.y = s.normal.y > 0 ? t.max.y : t.min.y, Ps.z = s.normal.z > 0 ? t.max.z : t.min.z, s.distanceToPoint(Ps) < 0)
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
class ls extends Vi {
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
    super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new qt(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.linewidth = t.linewidth, this.linecap = t.linecap, this.linejoin = t.linejoin, this.fog = t.fog, this;
  }
}
const Ys = /* @__PURE__ */ new L(), js = /* @__PURE__ */ new L(), Po = /* @__PURE__ */ new oe(), Zi = /* @__PURE__ */ new tr(), Ds = /* @__PURE__ */ new Qs(), wr = /* @__PURE__ */ new L(), Do = /* @__PURE__ */ new L();
class jh extends xe {
  /**
   * Constructs a new line.
   *
   * @param {BufferGeometry} [geometry] - The line geometry.
   * @param {Material|Array<Material>} [material] - The line material.
   */
  constructor(t = new on(), e = new ls()) {
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
      for (let s = 1, r = e.count; s < r; s++)
        Ys.fromBufferAttribute(e, s - 1), js.fromBufferAttribute(e, s), n[s] = n[s - 1], n[s] += Ys.distanceTo(js);
      t.setAttribute("lineDistance", new _n(n, 1));
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
    const n = this.geometry, s = this.matrixWorld, r = t.params.Line.threshold, o = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), Ds.copy(n.boundingSphere), Ds.applyMatrix4(s), Ds.radius += r, t.ray.intersectsSphere(Ds) === !1) return;
    Po.copy(s).invert(), Zi.copy(t.ray).applyMatrix4(Po);
    const a = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = a * a, c = this.isLineSegments ? 2 : 1, h = n.index, f = n.attributes.position;
    if (h !== null) {
      const m = Math.max(0, o.start), _ = Math.min(h.count, o.start + o.count);
      for (let v = m, p = _ - 1; v < p; v += c) {
        const d = h.getX(v), T = h.getX(v + 1), A = Ls(this, t, Zi, l, d, T, v);
        A && e.push(A);
      }
      if (this.isLineLoop) {
        const v = h.getX(_ - 1), p = h.getX(m), d = Ls(this, t, Zi, l, v, p, _ - 1);
        d && e.push(d);
      }
    } else {
      const m = Math.max(0, o.start), _ = Math.min(f.count, o.start + o.count);
      for (let v = m, p = _ - 1; v < p; v += c) {
        const d = Ls(this, t, Zi, l, v, v + 1, v);
        d && e.push(d);
      }
      if (this.isLineLoop) {
        const v = Ls(this, t, Zi, l, _ - 1, m, _ - 1);
        v && e.push(v);
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
      const s = e[n[0]];
      if (s !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let r = 0, o = s.length; r < o; r++) {
          const a = s[r].name || String(r);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[a] = r;
        }
      }
    }
  }
}
function Ls(i, t, e, n, s, r, o) {
  const a = i.geometry.attributes.position;
  if (Ys.fromBufferAttribute(a, s), js.fromBufferAttribute(a, r), e.distanceSqToSegment(Ys, js, wr, Do) > n) return;
  wr.applyMatrix4(i.matrixWorld);
  const c = t.ray.origin.distanceTo(wr);
  if (!(c < t.near || c > t.far))
    return {
      distance: c,
      // What do we want? intersection point on the ray or on the segment??
      // point: raycaster.ray.at( distance ),
      point: Do.clone().applyMatrix4(i.matrixWorld),
      index: o,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: i
    };
}
const Lo = /* @__PURE__ */ new L(), Io = /* @__PURE__ */ new L();
class Ks extends jh {
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
      for (let s = 0, r = e.count; s < r; s += 2)
        Lo.fromBufferAttribute(e, s), Io.fromBufferAttribute(e, s + 1), n[s] = s === 0 ? 0 : n[s - 1], n[s + 1] = n[s] + Lo.distanceTo(Io);
      t.setAttribute("lineDistance", new _n(n, 1));
    } else
      console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
}
class Uo extends Fe {
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
  constructor(t, e, n, s, r, o, a, l, c) {
    super(t, e, n, s, r, o, a, l, c), this.isCanvasTexture = !0, this.needsUpdate = !0;
  }
}
class Vl extends Fe {
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
  constructor(t, e, n = si, s, r, o, a = rn, l = rn, c, h = is, u = 1) {
    if (h !== is && h !== ss)
      throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    const f = { width: t, height: e, depth: u };
    super(f, s, r, o, a, l, h, n, c), this.isDepthTexture = !0, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
  }
  copy(t) {
    return super.copy(t), this.source = new Ha(Object.assign({}, t.image)), this.compareFunction = t.compareFunction, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return this.compareFunction !== null && (e.compareFunction = this.compareFunction), e;
  }
}
class Gl extends Fe {
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
const Is = /* @__PURE__ */ new L(), Us = /* @__PURE__ */ new L(), Rr = /* @__PURE__ */ new L(), Ns = /* @__PURE__ */ new Ke();
class Aa extends on {
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
      const s = Math.pow(10, 4), r = Math.cos(Li * e), o = t.getIndex(), a = t.getAttribute("position"), l = o ? o.count : a.count, c = [0, 0, 0], h = ["a", "b", "c"], u = new Array(3), f = {}, m = [];
      for (let _ = 0; _ < l; _ += 3) {
        o ? (c[0] = o.getX(_), c[1] = o.getX(_ + 1), c[2] = o.getX(_ + 2)) : (c[0] = _, c[1] = _ + 1, c[2] = _ + 2);
        const { a: v, b: p, c: d } = Ns;
        if (v.fromBufferAttribute(a, c[0]), p.fromBufferAttribute(a, c[1]), d.fromBufferAttribute(a, c[2]), Ns.getNormal(Rr), u[0] = `${Math.round(v.x * s)},${Math.round(v.y * s)},${Math.round(v.z * s)}`, u[1] = `${Math.round(p.x * s)},${Math.round(p.y * s)},${Math.round(p.z * s)}`, u[2] = `${Math.round(d.x * s)},${Math.round(d.y * s)},${Math.round(d.z * s)}`, !(u[0] === u[1] || u[1] === u[2] || u[2] === u[0]))
          for (let T = 0; T < 3; T++) {
            const A = (T + 1) % 3, E = u[T], b = u[A], R = Ns[h[T]], C = Ns[h[A]], N = `${E}_${b}`, M = `${b}_${E}`;
            M in f && f[M] ? (Rr.dot(f[M].normal) <= r && (m.push(R.x, R.y, R.z), m.push(C.x, C.y, C.z)), f[M] = null) : N in f || (f[N] = {
              index0: c[T],
              index1: c[A],
              normal: Rr.clone()
            });
          }
      }
      for (const _ in f)
        if (f[_]) {
          const { index0: v, index1: p } = f[_];
          Is.fromBufferAttribute(a, v), Us.fromBufferAttribute(a, p), m.push(Is.x, Is.y, Is.z), m.push(Us.x, Us.y, Us.z);
        }
      this.setAttribute("position", new _n(m, 3));
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
}
class hs extends on {
  /**
   * Constructs a new plane geometry.
   *
   * @param {number} [width=1] - The width along the X axis.
   * @param {number} [height=1] - The height along the Y axis
   * @param {number} [widthSegments=1] - The number of segments along the X axis.
   * @param {number} [heightSegments=1] - The number of segments along the Y axis.
   */
  constructor(t = 1, e = 1, n = 1, s = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = {
      width: t,
      height: e,
      widthSegments: n,
      heightSegments: s
    };
    const r = t / 2, o = e / 2, a = Math.floor(n), l = Math.floor(s), c = a + 1, h = l + 1, u = t / a, f = e / l, m = [], _ = [], v = [], p = [];
    for (let d = 0; d < h; d++) {
      const T = d * f - o;
      for (let A = 0; A < c; A++) {
        const E = A * u - r;
        _.push(E, -T, 0), v.push(0, 0, 1), p.push(A / a), p.push(1 - d / l);
      }
    }
    for (let d = 0; d < l; d++)
      for (let T = 0; T < a; T++) {
        const A = T + c * d, E = T + c * (d + 1), b = T + 1 + c * (d + 1), R = T + 1 + c * d;
        m.push(A, E, R), m.push(E, b, R);
      }
    this.setIndex(m), this.setAttribute("position", new _n(_, 3)), this.setAttribute("normal", new _n(v, 3)), this.setAttribute("uv", new _n(p, 2));
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
    return new hs(t.width, t.height, t.widthSegments, t.heightSegments);
  }
}
class Wl extends Vi {
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
    super(), this.isMeshStandardMaterial = !0, this.type = "MeshStandardMaterial", this.defines = { STANDARD: "" }, this.color = new qt(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new qt(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = Dl, this.normalScale = new Dt(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new xn(), this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.defines = { STANDARD: "" }, this.color.copy(t.color), this.roughness = t.roughness, this.metalness = t.metalness, this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.emissive.copy(t.emissive), this.emissiveMap = t.emissiveMap, this.emissiveIntensity = t.emissiveIntensity, this.bumpMap = t.bumpMap, this.bumpScale = t.bumpScale, this.normalMap = t.normalMap, this.normalMapType = t.normalMapType, this.normalScale.copy(t.normalScale), this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.roughnessMap = t.roughnessMap, this.metalnessMap = t.metalnessMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.envMapIntensity = t.envMapIntensity, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.flatShading = t.flatShading, this.fog = t.fog, this;
  }
}
class Kh extends Vi {
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
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = qc, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.depthPacking = t.depthPacking, this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this;
  }
}
class Zh extends Vi {
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
class Xl extends xe {
  /**
   * Constructs a new light.
   *
   * @param {(number|Color|string)} [color=0xffffff] - The light's color.
   * @param {number} [intensity=1] - The light's strength/intensity.
   */
  constructor(t, e = 1) {
    super(), this.isLight = !0, this.type = "Light", this.color = new qt(t), this.intensity = e;
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
class Jh extends Xl {
  /**
   * Constructs a new hemisphere light.
   *
   * @param {(number|Color|string)} [skyColor=0xffffff] - The light's sky color.
   * @param {(number|Color|string)} [groundColor=0xffffff] - The light's ground color.
   * @param {number} [intensity=1] - The light's strength/intensity.
   */
  constructor(t, e, n) {
    super(t, n), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(xe.DEFAULT_UP), this.updateMatrix(), this.groundColor = new qt(e);
  }
  copy(t, e) {
    return super.copy(t, e), this.groundColor.copy(t.groundColor), this;
  }
}
const Cr = /* @__PURE__ */ new oe(), No = /* @__PURE__ */ new L(), Fo = /* @__PURE__ */ new L();
class Qh {
  /**
   * Constructs a new light shadow.
   *
   * @param {Camera} camera - The light's view of the world.
   */
  constructor(t) {
    this.camera = t, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new Dt(512, 512), this.mapType = vn, this.map = null, this.mapPass = null, this.matrix = new oe(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new Ga(), this._frameExtents = new Dt(1, 1), this._viewportCount = 1, this._viewports = [
      new fe(0, 0, 1, 1)
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
    No.setFromMatrixPosition(t.matrixWorld), e.position.copy(No), Fo.setFromMatrixPosition(t.target.matrixWorld), e.lookAt(Fo), e.updateMatrixWorld(), Cr.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse), this._frustum.setFromProjectionMatrix(Cr, e.coordinateSystem, e.reversedDepth), e.reversedDepth ? n.set(
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
    ), n.multiply(Cr);
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
class $l extends zl {
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
  constructor(t = -1, e = 1, n = 1, s = -1, r = 0.1, o = 2e3) {
    super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = t, this.right = e, this.top = n, this.bottom = s, this.near = r, this.far = o, this.updateProjectionMatrix();
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
  setViewOffset(t, e, n, s, r, o) {
    this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = t, this.view.fullHeight = e, this.view.offsetX = n, this.view.offsetY = s, this.view.width = r, this.view.height = o, this.updateProjectionMatrix();
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
    const t = (this.right - this.left) / (2 * this.zoom), e = (this.top - this.bottom) / (2 * this.zoom), n = (this.right + this.left) / 2, s = (this.top + this.bottom) / 2;
    let r = n - t, o = n + t, a = s + e, l = s - e;
    if (this.view !== null && this.view.enabled) {
      const c = (this.right - this.left) / this.view.fullWidth / this.zoom, h = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      r += c * this.view.offsetX, o = r + c * this.view.width, a -= h * this.view.offsetY, l = a - h * this.view.height;
    }
    this.projectionMatrix.makeOrthographic(r, o, a, l, this.near, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return e.object.zoom = this.zoom, e.object.left = this.left, e.object.right = this.right, e.object.top = this.top, e.object.bottom = this.bottom, e.object.near = this.near, e.object.far = this.far, this.view !== null && (e.object.view = Object.assign({}, this.view)), e;
  }
}
class td extends Qh {
  /**
   * Constructs a new directional light shadow.
   */
  constructor() {
    super(new $l(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
  }
}
class ed extends Xl {
  /**
   * Constructs a new directional light.
   *
   * @param {(number|Color|string)} [color=0xffffff] - The light's color.
   * @param {number} [intensity=1] - The light's strength/intensity.
   */
  constructor(t, e) {
    super(t, e), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(xe.DEFAULT_UP), this.updateMatrix(), this.target = new xe(), this.shadow = new td();
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(t) {
    return super.copy(t), this.target = t.target.clone(), this.shadow = t.shadow.clone(), this;
  }
}
class nd extends je {
  /**
   * Constructs a new array camera.
   *
   * @param {Array<PerspectiveCamera>} [array=[]] - An array of perspective sub cameras.
   */
  constructor(t = []) {
    super(), this.isArrayCamera = !0, this.isMultiViewCamera = !1, this.cameras = t;
  }
}
const Oo = /* @__PURE__ */ new oe();
class id {
  /**
   * Constructs a new raycaster.
   *
   * @param {Vector3} origin - The origin vector where the ray casts from.
   * @param {Vector3} direction - The (normalized) direction vector that gives direction to the ray.
   * @param {number} [near=0] - All results returned are further away than near. Near can't be negative.
   * @param {number} [far=Infinity] - All results returned are closer than far. Far can't be lower than near.
   */
  constructor(t, e, n = 0, s = 1 / 0) {
    this.ray = new tr(t, e), this.near = n, this.far = s, this.camera = null, this.layers = new Va(), this.params = {
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
    return Oo.identity().extractRotation(t.matrixWorld), this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(Oo), this;
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
    return wa(t, this, n, e), n.sort(Bo), n;
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
    for (let s = 0, r = t.length; s < r; s++)
      wa(t[s], this, n, e);
    return n.sort(Bo), n;
  }
}
function Bo(i, t) {
  return i.distance - t.distance;
}
function wa(i, t, e, n) {
  let s = !0;
  if (i.layers.test(t.layers) && i.raycast(t, e) === !1 && (s = !1), s === !0 && n === !0) {
    const r = i.children;
    for (let o = 0, a = r.length; o < a; o++)
      wa(r[o], t, e, !0);
  }
}
class ko {
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
    return this.phi = Vt(this.phi, 1e-6, Math.PI - 1e-6), this;
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
    return this.radius = Math.sqrt(t * t + e * e + n * n), this.radius === 0 ? (this.theta = 0, this.phi = 0) : (this.theta = Math.atan2(t, n), this.phi = Math.acos(Vt(e / this.radius, -1, 1))), this;
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
class sd extends oi {
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
function zo(i, t, e, n) {
  const s = rd(n);
  switch (e) {
    // https://registry.khronos.org/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
    case wl:
      return i * t;
    case Cl:
      return i * t / s.components * s.byteLength;
    case Oa:
      return i * t / s.components * s.byteLength;
    case Pl:
      return i * t * 2 / s.components * s.byteLength;
    case Ba:
      return i * t * 2 / s.components * s.byteLength;
    case Rl:
      return i * t * 3 / s.components * s.byteLength;
    case sn:
      return i * t * 4 / s.components * s.byteLength;
    case ka:
      return i * t * 4 / s.components * s.byteLength;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_s3tc_srgb/
    case zs:
    case Hs:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case Vs:
    case Gs:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_pvrtc/
    case Qr:
    case ea:
      return Math.max(i, 16) * Math.max(t, 8) / 4;
    case Jr:
    case ta:
      return Math.max(i, 8) * Math.max(t, 8) / 2;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_etc/
    case na:
    case ia:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case sa:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_astc/
    case ra:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case aa:
      return Math.floor((i + 4) / 5) * Math.floor((t + 3) / 4) * 16;
    case oa:
      return Math.floor((i + 4) / 5) * Math.floor((t + 4) / 5) * 16;
    case la:
      return Math.floor((i + 5) / 6) * Math.floor((t + 4) / 5) * 16;
    case ca:
      return Math.floor((i + 5) / 6) * Math.floor((t + 5) / 6) * 16;
    case ha:
      return Math.floor((i + 7) / 8) * Math.floor((t + 4) / 5) * 16;
    case da:
      return Math.floor((i + 7) / 8) * Math.floor((t + 5) / 6) * 16;
    case ua:
      return Math.floor((i + 7) / 8) * Math.floor((t + 7) / 8) * 16;
    case fa:
      return Math.floor((i + 9) / 10) * Math.floor((t + 4) / 5) * 16;
    case pa:
      return Math.floor((i + 9) / 10) * Math.floor((t + 5) / 6) * 16;
    case ma:
      return Math.floor((i + 9) / 10) * Math.floor((t + 7) / 8) * 16;
    case _a:
      return Math.floor((i + 9) / 10) * Math.floor((t + 9) / 10) * 16;
    case ga:
      return Math.floor((i + 11) / 12) * Math.floor((t + 9) / 10) * 16;
    case va:
      return Math.floor((i + 11) / 12) * Math.floor((t + 11) / 12) * 16;
    // https://registry.khronos.org/webgl/extensions/EXT_texture_compression_bptc/
    case xa:
    case Ma:
    case Sa:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
    // https://registry.khronos.org/webgl/extensions/EXT_texture_compression_rgtc/
    case Ea:
    case ya:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 8;
    case ba:
    case Ta:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
  }
  throw new Error(
    `Unable to determine texture byte length for ${e} format.`
  );
}
function rd(i) {
  switch (i) {
    case vn:
    case yl:
      return { byteLength: 1, components: 1 };
    case es:
    case bl:
    case cs:
      return { byteLength: 2, components: 1 };
    case Na:
    case Fa:
      return { byteLength: 2, components: 4 };
    case si:
    case Ua:
    case Cn:
      return { byteLength: 4, components: 1 };
    case Tl:
    case Al:
      return { byteLength: 4, components: 3 };
  }
  throw new Error(`Unknown texture type ${i}.`);
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: {
  revision: Ia
} }));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = Ia);
function ql() {
  let i = null, t = !1, e = null, n = null;
  function s(r, o) {
    e(r, o), n = i.requestAnimationFrame(s);
  }
  return {
    start: function() {
      t !== !0 && e !== null && (n = i.requestAnimationFrame(s), t = !0);
    },
    stop: function() {
      i.cancelAnimationFrame(n), t = !1;
    },
    setAnimationLoop: function(r) {
      e = r;
    },
    setContext: function(r) {
      i = r;
    }
  };
}
function ad(i) {
  const t = /* @__PURE__ */ new WeakMap();
  function e(a, l) {
    const c = a.array, h = a.usage, u = c.byteLength, f = i.createBuffer();
    i.bindBuffer(l, f), i.bufferData(l, c, h), a.onUploadCallback();
    let m;
    if (c instanceof Float32Array)
      m = i.FLOAT;
    else if (typeof Float16Array < "u" && c instanceof Float16Array)
      m = i.HALF_FLOAT;
    else if (c instanceof Uint16Array)
      a.isFloat16BufferAttribute ? m = i.HALF_FLOAT : m = i.UNSIGNED_SHORT;
    else if (c instanceof Int16Array)
      m = i.SHORT;
    else if (c instanceof Uint32Array)
      m = i.UNSIGNED_INT;
    else if (c instanceof Int32Array)
      m = i.INT;
    else if (c instanceof Int8Array)
      m = i.BYTE;
    else if (c instanceof Uint8Array)
      m = i.UNSIGNED_BYTE;
    else if (c instanceof Uint8ClampedArray)
      m = i.UNSIGNED_BYTE;
    else
      throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + c);
    return {
      buffer: f,
      type: m,
      bytesPerElement: c.BYTES_PER_ELEMENT,
      version: a.version,
      size: u
    };
  }
  function n(a, l, c) {
    const h = l.array, u = l.updateRanges;
    if (i.bindBuffer(c, a), u.length === 0)
      i.bufferSubData(c, 0, h);
    else {
      u.sort((m, _) => m.start - _.start);
      let f = 0;
      for (let m = 1; m < u.length; m++) {
        const _ = u[f], v = u[m];
        v.start <= _.start + _.count + 1 ? _.count = Math.max(
          _.count,
          v.start + v.count - _.start
        ) : (++f, u[f] = v);
      }
      u.length = f + 1;
      for (let m = 0, _ = u.length; m < _; m++) {
        const v = u[m];
        i.bufferSubData(
          c,
          v.start * h.BYTES_PER_ELEMENT,
          h,
          v.start,
          v.count
        );
      }
      l.clearUpdateRanges();
    }
    l.onUploadCallback();
  }
  function s(a) {
    return a.isInterleavedBufferAttribute && (a = a.data), t.get(a);
  }
  function r(a) {
    a.isInterleavedBufferAttribute && (a = a.data);
    const l = t.get(a);
    l && (i.deleteBuffer(l.buffer), t.delete(a));
  }
  function o(a, l) {
    if (a.isInterleavedBufferAttribute && (a = a.data), a.isGLBufferAttribute) {
      const h = t.get(a);
      (!h || h.version < a.version) && t.set(a, {
        buffer: a.buffer,
        type: a.type,
        bytesPerElement: a.elementSize,
        version: a.version
      });
      return;
    }
    const c = t.get(a);
    if (c === void 0)
      t.set(a, e(a, l));
    else if (c.version < a.version) {
      if (c.size !== a.array.byteLength)
        throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
      n(c.buffer, a, l), c.version = a.version;
    }
  }
  return {
    get: s,
    remove: r,
    update: o
  };
}
var od = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, ld = `#ifdef USE_ALPHAHASH
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
#endif`, cd = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, hd = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, dd = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, ud = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, fd = `#ifdef USE_AOMAP
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
#endif`, pd = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, md = `#ifdef USE_BATCHING
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
#endif`, _d = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`, gd = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, vd = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, xd = `float G_BlinnPhong_Implicit( ) {
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
} // validated`, Md = `#ifdef USE_IRIDESCENCE
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
#endif`, Sd = `#ifdef USE_BUMPMAP
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
#endif`, Ed = `#if NUM_CLIPPING_PLANES > 0
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
#endif`, yd = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, bd = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, Td = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, Ad = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, wd = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, Rd = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, Cd = `#if defined( USE_COLOR_ALPHA )
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
#endif`, Pd = `#define PI 3.141592653589793
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
} // validated`, Dd = `#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`, Ld = `vec3 transformedNormal = objectNormal;
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
#endif`, Id = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, Ud = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, Nd = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, Fd = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, Od = "gl_FragColor = linearToOutputTexel( gl_FragColor );", Bd = `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`, kd = `#ifdef USE_ENVMAP
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
#endif`, zd = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, Hd = `#ifdef USE_ENVMAP
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
#endif`, Vd = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, Gd = `#ifdef USE_ENVMAP
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
#endif`, Wd = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, Xd = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, $d = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, qd = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, Yd = `#ifdef USE_GRADIENTMAP
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
}`, jd = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, Kd = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, Zd = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, Jd = `uniform bool receiveShadow;
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
#endif`, Qd = `#ifdef USE_ENVMAP
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
#endif`, tu = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, eu = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, nu = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, iu = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, su = `PhysicalMaterial material;
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
#endif`, ru = `struct PhysicalMaterial {
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
}`, au = `
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
#endif`, ou = `#if defined( RE_IndirectDiffuse )
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
#endif`, lu = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, cu = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, hu = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, du = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, uu = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, fu = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, pu = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, mu = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`, _u = `#if defined( USE_POINTS_UV )
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
#endif`, gu = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, vu = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, xu = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, Mu = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, Su = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, Eu = `#ifdef USE_MORPHTARGETS
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
#endif`, yu = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, bu = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`, Tu = `#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`, Au = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, wu = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, Ru = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, Cu = `#ifdef USE_NORMALMAP
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
#endif`, Pu = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, Du = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, Lu = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, Iu = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, Uu = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, Nu = `vec3 packNormalToRGB( const in vec3 normal ) {
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
}`, Fu = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, Ou = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, Bu = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, ku = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, zu = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, Hu = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, Vu = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, Gu = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, Wu = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`, Xu = `float getShadowMask() {
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
}`, $u = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, qu = `#ifdef USE_SKINNING
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
#endif`, Yu = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, ju = `#ifdef USE_SKINNING
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
#endif`, Ku = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, Zu = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, Ju = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, Qu = `#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`, tf = `#ifdef USE_TRANSMISSION
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
#endif`, ef = `#ifdef USE_TRANSMISSION
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
#endif`, nf = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, sf = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, rf = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, af = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const of = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, lf = `uniform sampler2D t2D;
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
}`, cf = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, hf = `#ifdef ENVMAP_TYPE_CUBE
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
}`, df = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, uf = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, ff = `#include <common>
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
}`, pf = `#if DEPTH_PACKING == 3200
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
}`, mf = `#define DISTANCE
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
}`, _f = `#define DISTANCE
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
}`, gf = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, vf = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, xf = `uniform float scale;
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
}`, Mf = `uniform vec3 diffuse;
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
}`, Sf = `#include <common>
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
}`, Ef = `uniform vec3 diffuse;
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
}`, yf = `#define LAMBERT
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
}`, bf = `#define LAMBERT
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
}`, Tf = `#define MATCAP
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
}`, Af = `#define MATCAP
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
}`, wf = `#define NORMAL
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
}`, Rf = `#define NORMAL
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
}`, Cf = `#define PHONG
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
}`, Pf = `#define PHONG
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
}`, Df = `#define STANDARD
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
}`, Lf = `#define STANDARD
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
}`, If = `#define TOON
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
}`, Uf = `#define TOON
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
}`, Nf = `uniform float size;
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
}`, Ff = `uniform vec3 diffuse;
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
}`, Of = `#include <common>
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
}`, Bf = `uniform vec3 color;
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
}`, kf = `uniform float rotation;
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
}`, zf = `uniform vec3 diffuse;
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
}`, zt = {
  alphahash_fragment: od,
  alphahash_pars_fragment: ld,
  alphamap_fragment: cd,
  alphamap_pars_fragment: hd,
  alphatest_fragment: dd,
  alphatest_pars_fragment: ud,
  aomap_fragment: fd,
  aomap_pars_fragment: pd,
  batching_pars_vertex: md,
  batching_vertex: _d,
  begin_vertex: gd,
  beginnormal_vertex: vd,
  bsdfs: xd,
  iridescence_fragment: Md,
  bumpmap_pars_fragment: Sd,
  clipping_planes_fragment: Ed,
  clipping_planes_pars_fragment: yd,
  clipping_planes_pars_vertex: bd,
  clipping_planes_vertex: Td,
  color_fragment: Ad,
  color_pars_fragment: wd,
  color_pars_vertex: Rd,
  color_vertex: Cd,
  common: Pd,
  cube_uv_reflection_fragment: Dd,
  defaultnormal_vertex: Ld,
  displacementmap_pars_vertex: Id,
  displacementmap_vertex: Ud,
  emissivemap_fragment: Nd,
  emissivemap_pars_fragment: Fd,
  colorspace_fragment: Od,
  colorspace_pars_fragment: Bd,
  envmap_fragment: kd,
  envmap_common_pars_fragment: zd,
  envmap_pars_fragment: Hd,
  envmap_pars_vertex: Vd,
  envmap_physical_pars_fragment: Qd,
  envmap_vertex: Gd,
  fog_vertex: Wd,
  fog_pars_vertex: Xd,
  fog_fragment: $d,
  fog_pars_fragment: qd,
  gradientmap_pars_fragment: Yd,
  lightmap_pars_fragment: jd,
  lights_lambert_fragment: Kd,
  lights_lambert_pars_fragment: Zd,
  lights_pars_begin: Jd,
  lights_toon_fragment: tu,
  lights_toon_pars_fragment: eu,
  lights_phong_fragment: nu,
  lights_phong_pars_fragment: iu,
  lights_physical_fragment: su,
  lights_physical_pars_fragment: ru,
  lights_fragment_begin: au,
  lights_fragment_maps: ou,
  lights_fragment_end: lu,
  logdepthbuf_fragment: cu,
  logdepthbuf_pars_fragment: hu,
  logdepthbuf_pars_vertex: du,
  logdepthbuf_vertex: uu,
  map_fragment: fu,
  map_pars_fragment: pu,
  map_particle_fragment: mu,
  map_particle_pars_fragment: _u,
  metalnessmap_fragment: gu,
  metalnessmap_pars_fragment: vu,
  morphinstance_vertex: xu,
  morphcolor_vertex: Mu,
  morphnormal_vertex: Su,
  morphtarget_pars_vertex: Eu,
  morphtarget_vertex: yu,
  normal_fragment_begin: bu,
  normal_fragment_maps: Tu,
  normal_pars_fragment: Au,
  normal_pars_vertex: wu,
  normal_vertex: Ru,
  normalmap_pars_fragment: Cu,
  clearcoat_normal_fragment_begin: Pu,
  clearcoat_normal_fragment_maps: Du,
  clearcoat_pars_fragment: Lu,
  iridescence_pars_fragment: Iu,
  opaque_fragment: Uu,
  packing: Nu,
  premultiplied_alpha_fragment: Fu,
  project_vertex: Ou,
  dithering_fragment: Bu,
  dithering_pars_fragment: ku,
  roughnessmap_fragment: zu,
  roughnessmap_pars_fragment: Hu,
  shadowmap_pars_fragment: Vu,
  shadowmap_pars_vertex: Gu,
  shadowmap_vertex: Wu,
  shadowmask_pars_fragment: Xu,
  skinbase_vertex: $u,
  skinning_pars_vertex: qu,
  skinning_vertex: Yu,
  skinnormal_vertex: ju,
  specularmap_fragment: Ku,
  specularmap_pars_fragment: Zu,
  tonemapping_fragment: Ju,
  tonemapping_pars_fragment: Qu,
  transmission_fragment: tf,
  transmission_pars_fragment: ef,
  uv_pars_fragment: nf,
  uv_pars_vertex: sf,
  uv_vertex: rf,
  worldpos_vertex: af,
  background_vert: of,
  background_frag: lf,
  backgroundCube_vert: cf,
  backgroundCube_frag: hf,
  cube_vert: df,
  cube_frag: uf,
  depth_vert: ff,
  depth_frag: pf,
  distanceRGBA_vert: mf,
  distanceRGBA_frag: _f,
  equirect_vert: gf,
  equirect_frag: vf,
  linedashed_vert: xf,
  linedashed_frag: Mf,
  meshbasic_vert: Sf,
  meshbasic_frag: Ef,
  meshlambert_vert: yf,
  meshlambert_frag: bf,
  meshmatcap_vert: Tf,
  meshmatcap_frag: Af,
  meshnormal_vert: wf,
  meshnormal_frag: Rf,
  meshphong_vert: Cf,
  meshphong_frag: Pf,
  meshphysical_vert: Df,
  meshphysical_frag: Lf,
  meshtoon_vert: If,
  meshtoon_frag: Uf,
  points_vert: Nf,
  points_frag: Ff,
  shadow_vert: Of,
  shadow_frag: Bf,
  sprite_vert: kf,
  sprite_frag: zf
}, at = {
  common: {
    diffuse: { value: /* @__PURE__ */ new qt(16777215) },
    opacity: { value: 1 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Bt() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Bt() },
    alphaTest: { value: 0 }
  },
  specularmap: {
    specularMap: { value: null },
    specularMapTransform: { value: /* @__PURE__ */ new Bt() }
  },
  envmap: {
    envMap: { value: null },
    envMapRotation: { value: /* @__PURE__ */ new Bt() },
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
    aoMapTransform: { value: /* @__PURE__ */ new Bt() }
  },
  lightmap: {
    lightMap: { value: null },
    lightMapIntensity: { value: 1 },
    lightMapTransform: { value: /* @__PURE__ */ new Bt() }
  },
  bumpmap: {
    bumpMap: { value: null },
    bumpMapTransform: { value: /* @__PURE__ */ new Bt() },
    bumpScale: { value: 1 }
  },
  normalmap: {
    normalMap: { value: null },
    normalMapTransform: { value: /* @__PURE__ */ new Bt() },
    normalScale: { value: /* @__PURE__ */ new Dt(1, 1) }
  },
  displacementmap: {
    displacementMap: { value: null },
    displacementMapTransform: { value: /* @__PURE__ */ new Bt() },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 }
  },
  emissivemap: {
    emissiveMap: { value: null },
    emissiveMapTransform: { value: /* @__PURE__ */ new Bt() }
  },
  metalnessmap: {
    metalnessMap: { value: null },
    metalnessMapTransform: { value: /* @__PURE__ */ new Bt() }
  },
  roughnessmap: {
    roughnessMap: { value: null },
    roughnessMapTransform: { value: /* @__PURE__ */ new Bt() }
  },
  gradientmap: {
    gradientMap: { value: null }
  },
  fog: {
    fogDensity: { value: 25e-5 },
    fogNear: { value: 1 },
    fogFar: { value: 2e3 },
    fogColor: { value: /* @__PURE__ */ new qt(16777215) }
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
    diffuse: { value: /* @__PURE__ */ new qt(16777215) },
    opacity: { value: 1 },
    size: { value: 1 },
    scale: { value: 1 },
    map: { value: null },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Bt() },
    alphaTest: { value: 0 },
    uvTransform: { value: /* @__PURE__ */ new Bt() }
  },
  sprite: {
    diffuse: { value: /* @__PURE__ */ new qt(16777215) },
    opacity: { value: 1 },
    center: { value: /* @__PURE__ */ new Dt(0.5, 0.5) },
    rotation: { value: 0 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Bt() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Bt() },
    alphaTest: { value: 0 }
  }
}, cn = {
  basic: {
    uniforms: /* @__PURE__ */ Ue([
      at.common,
      at.specularmap,
      at.envmap,
      at.aomap,
      at.lightmap,
      at.fog
    ]),
    vertexShader: zt.meshbasic_vert,
    fragmentShader: zt.meshbasic_frag
  },
  lambert: {
    uniforms: /* @__PURE__ */ Ue([
      at.common,
      at.specularmap,
      at.envmap,
      at.aomap,
      at.lightmap,
      at.emissivemap,
      at.bumpmap,
      at.normalmap,
      at.displacementmap,
      at.fog,
      at.lights,
      {
        emissive: { value: /* @__PURE__ */ new qt(0) }
      }
    ]),
    vertexShader: zt.meshlambert_vert,
    fragmentShader: zt.meshlambert_frag
  },
  phong: {
    uniforms: /* @__PURE__ */ Ue([
      at.common,
      at.specularmap,
      at.envmap,
      at.aomap,
      at.lightmap,
      at.emissivemap,
      at.bumpmap,
      at.normalmap,
      at.displacementmap,
      at.fog,
      at.lights,
      {
        emissive: { value: /* @__PURE__ */ new qt(0) },
        specular: { value: /* @__PURE__ */ new qt(1118481) },
        shininess: { value: 30 }
      }
    ]),
    vertexShader: zt.meshphong_vert,
    fragmentShader: zt.meshphong_frag
  },
  standard: {
    uniforms: /* @__PURE__ */ Ue([
      at.common,
      at.envmap,
      at.aomap,
      at.lightmap,
      at.emissivemap,
      at.bumpmap,
      at.normalmap,
      at.displacementmap,
      at.roughnessmap,
      at.metalnessmap,
      at.fog,
      at.lights,
      {
        emissive: { value: /* @__PURE__ */ new qt(0) },
        roughness: { value: 1 },
        metalness: { value: 0 },
        envMapIntensity: { value: 1 }
      }
    ]),
    vertexShader: zt.meshphysical_vert,
    fragmentShader: zt.meshphysical_frag
  },
  toon: {
    uniforms: /* @__PURE__ */ Ue([
      at.common,
      at.aomap,
      at.lightmap,
      at.emissivemap,
      at.bumpmap,
      at.normalmap,
      at.displacementmap,
      at.gradientmap,
      at.fog,
      at.lights,
      {
        emissive: { value: /* @__PURE__ */ new qt(0) }
      }
    ]),
    vertexShader: zt.meshtoon_vert,
    fragmentShader: zt.meshtoon_frag
  },
  matcap: {
    uniforms: /* @__PURE__ */ Ue([
      at.common,
      at.bumpmap,
      at.normalmap,
      at.displacementmap,
      at.fog,
      {
        matcap: { value: null }
      }
    ]),
    vertexShader: zt.meshmatcap_vert,
    fragmentShader: zt.meshmatcap_frag
  },
  points: {
    uniforms: /* @__PURE__ */ Ue([
      at.points,
      at.fog
    ]),
    vertexShader: zt.points_vert,
    fragmentShader: zt.points_frag
  },
  dashed: {
    uniforms: /* @__PURE__ */ Ue([
      at.common,
      at.fog,
      {
        scale: { value: 1 },
        dashSize: { value: 1 },
        totalSize: { value: 2 }
      }
    ]),
    vertexShader: zt.linedashed_vert,
    fragmentShader: zt.linedashed_frag
  },
  depth: {
    uniforms: /* @__PURE__ */ Ue([
      at.common,
      at.displacementmap
    ]),
    vertexShader: zt.depth_vert,
    fragmentShader: zt.depth_frag
  },
  normal: {
    uniforms: /* @__PURE__ */ Ue([
      at.common,
      at.bumpmap,
      at.normalmap,
      at.displacementmap,
      {
        opacity: { value: 1 }
      }
    ]),
    vertexShader: zt.meshnormal_vert,
    fragmentShader: zt.meshnormal_frag
  },
  sprite: {
    uniforms: /* @__PURE__ */ Ue([
      at.sprite,
      at.fog
    ]),
    vertexShader: zt.sprite_vert,
    fragmentShader: zt.sprite_frag
  },
  background: {
    uniforms: {
      uvTransform: { value: /* @__PURE__ */ new Bt() },
      t2D: { value: null },
      backgroundIntensity: { value: 1 }
    },
    vertexShader: zt.background_vert,
    fragmentShader: zt.background_frag
  },
  backgroundCube: {
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 },
      backgroundBlurriness: { value: 0 },
      backgroundIntensity: { value: 1 },
      backgroundRotation: { value: /* @__PURE__ */ new Bt() }
    },
    vertexShader: zt.backgroundCube_vert,
    fragmentShader: zt.backgroundCube_frag
  },
  cube: {
    uniforms: {
      tCube: { value: null },
      tFlip: { value: -1 },
      opacity: { value: 1 }
    },
    vertexShader: zt.cube_vert,
    fragmentShader: zt.cube_frag
  },
  equirect: {
    uniforms: {
      tEquirect: { value: null }
    },
    vertexShader: zt.equirect_vert,
    fragmentShader: zt.equirect_frag
  },
  distanceRGBA: {
    uniforms: /* @__PURE__ */ Ue([
      at.common,
      at.displacementmap,
      {
        referencePosition: { value: /* @__PURE__ */ new L() },
        nearDistance: { value: 1 },
        farDistance: { value: 1e3 }
      }
    ]),
    vertexShader: zt.distanceRGBA_vert,
    fragmentShader: zt.distanceRGBA_frag
  },
  shadow: {
    uniforms: /* @__PURE__ */ Ue([
      at.lights,
      at.fog,
      {
        color: { value: /* @__PURE__ */ new qt(0) },
        opacity: { value: 1 }
      }
    ]),
    vertexShader: zt.shadow_vert,
    fragmentShader: zt.shadow_frag
  }
};
cn.physical = {
  uniforms: /* @__PURE__ */ Ue([
    cn.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: /* @__PURE__ */ new Bt() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: /* @__PURE__ */ new Bt() },
      clearcoatNormalScale: { value: /* @__PURE__ */ new Dt(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new Bt() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: /* @__PURE__ */ new Bt() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new Bt() },
      sheen: { value: 0 },
      sheenColor: { value: /* @__PURE__ */ new qt(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: /* @__PURE__ */ new Bt() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: /* @__PURE__ */ new Bt() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: /* @__PURE__ */ new Bt() },
      transmissionSamplerSize: { value: /* @__PURE__ */ new Dt() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: /* @__PURE__ */ new Bt() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: /* @__PURE__ */ new qt(0) },
      specularColor: { value: /* @__PURE__ */ new qt(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: /* @__PURE__ */ new Bt() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: /* @__PURE__ */ new Bt() },
      anisotropyVector: { value: /* @__PURE__ */ new Dt() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: /* @__PURE__ */ new Bt() }
    }
  ]),
  vertexShader: zt.meshphysical_vert,
  fragmentShader: zt.meshphysical_frag
};
const Fs = { r: 0, b: 0, g: 0 }, Kn = /* @__PURE__ */ new xn(), Hf = /* @__PURE__ */ new oe();
function Vf(i, t, e, n, s, r, o) {
  const a = new qt(0);
  let l = r === !0 ? 0 : 1, c, h, u = null, f = 0, m = null;
  function _(A) {
    let E = A.isScene === !0 ? A.background : null;
    return E && E.isTexture && (E = (A.backgroundBlurriness > 0 ? e : t).get(E)), E;
  }
  function v(A) {
    let E = !1;
    const b = _(A);
    b === null ? d(a, l) : b && b.isColor && (d(b, 1), E = !0);
    const R = i.xr.getEnvironmentBlendMode();
    R === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, o) : R === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, o), (i.autoClear || E) && (n.buffers.depth.setTest(!0), n.buffers.depth.setMask(!0), n.buffers.color.setMask(!0), i.clear(i.autoClearColor, i.autoClearDepth, i.autoClearStencil));
  }
  function p(A, E) {
    const b = _(E);
    b && (b.isCubeTexture || b.mapping === Js) ? (h === void 0 && (h = new Xe(
      new Vn(1, 1, 1),
      new Gn({
        name: "BackgroundCubeMaterial",
        uniforms: ki(cn.backgroundCube.uniforms),
        vertexShader: cn.backgroundCube.vertexShader,
        fragmentShader: cn.backgroundCube.fragmentShader,
        side: ze,
        depthTest: !1,
        depthWrite: !1,
        fog: !1,
        allowOverride: !1
      })
    ), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(R, C, N) {
      this.matrixWorld.copyPosition(N.matrixWorld);
    }, Object.defineProperty(h.material, "envMap", {
      get: function() {
        return this.uniforms.envMap.value;
      }
    }), s.update(h)), Kn.copy(E.backgroundRotation), Kn.x *= -1, Kn.y *= -1, Kn.z *= -1, b.isCubeTexture && b.isRenderTargetTexture === !1 && (Kn.y *= -1, Kn.z *= -1), h.material.uniforms.envMap.value = b, h.material.uniforms.flipEnvMap.value = b.isCubeTexture && b.isRenderTargetTexture === !1 ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = E.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = E.backgroundIntensity, h.material.uniforms.backgroundRotation.value.setFromMatrix4(Hf.makeRotationFromEuler(Kn)), h.material.toneMapped = jt.getTransfer(b.colorSpace) !== te, (u !== b || f !== b.version || m !== i.toneMapping) && (h.material.needsUpdate = !0, u = b, f = b.version, m = i.toneMapping), h.layers.enableAll(), A.unshift(h, h.geometry, h.material, 0, 0, null)) : b && b.isTexture && (c === void 0 && (c = new Xe(
      new hs(2, 2),
      new Gn({
        name: "BackgroundMaterial",
        uniforms: ki(cn.background.uniforms),
        vertexShader: cn.background.vertexShader,
        fragmentShader: cn.background.fragmentShader,
        side: Hn,
        depthTest: !1,
        depthWrite: !1,
        fog: !1,
        allowOverride: !1
      })
    ), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", {
      get: function() {
        return this.uniforms.t2D.value;
      }
    }), s.update(c)), c.material.uniforms.t2D.value = b, c.material.uniforms.backgroundIntensity.value = E.backgroundIntensity, c.material.toneMapped = jt.getTransfer(b.colorSpace) !== te, b.matrixAutoUpdate === !0 && b.updateMatrix(), c.material.uniforms.uvTransform.value.copy(b.matrix), (u !== b || f !== b.version || m !== i.toneMapping) && (c.material.needsUpdate = !0, u = b, f = b.version, m = i.toneMapping), c.layers.enableAll(), A.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function d(A, E) {
    A.getRGB(Fs, kl(i)), n.buffers.color.setClear(Fs.r, Fs.g, Fs.b, E, o);
  }
  function T() {
    h !== void 0 && (h.geometry.dispose(), h.material.dispose(), h = void 0), c !== void 0 && (c.geometry.dispose(), c.material.dispose(), c = void 0);
  }
  return {
    getClearColor: function() {
      return a;
    },
    setClearColor: function(A, E = 1) {
      a.set(A), l = E, d(a, l);
    },
    getClearAlpha: function() {
      return l;
    },
    setClearAlpha: function(A) {
      l = A, d(a, l);
    },
    render: v,
    addToRenderList: p,
    dispose: T
  };
}
function Gf(i, t) {
  const e = i.getParameter(i.MAX_VERTEX_ATTRIBS), n = {}, s = f(null);
  let r = s, o = !1;
  function a(S, D, k, H, Y) {
    let W = !1;
    const X = u(H, k, D);
    r !== X && (r = X, c(r.object)), W = m(S, H, k, Y), W && _(S, H, k, Y), Y !== null && t.update(Y, i.ELEMENT_ARRAY_BUFFER), (W || o) && (o = !1, E(S, D, k, H), Y !== null && i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, t.get(Y).buffer));
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
  function u(S, D, k) {
    const H = k.wireframe === !0;
    let Y = n[S.id];
    Y === void 0 && (Y = {}, n[S.id] = Y);
    let W = Y[D.id];
    W === void 0 && (W = {}, Y[D.id] = W);
    let X = W[H];
    return X === void 0 && (X = f(l()), W[H] = X), X;
  }
  function f(S) {
    const D = [], k = [], H = [];
    for (let Y = 0; Y < e; Y++)
      D[Y] = 0, k[Y] = 0, H[Y] = 0;
    return {
      // for backward compatibility on non-VAO support browser
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: D,
      enabledAttributes: k,
      attributeDivisors: H,
      object: S,
      attributes: {},
      index: null
    };
  }
  function m(S, D, k, H) {
    const Y = r.attributes, W = D.attributes;
    let X = 0;
    const j = k.getAttributes();
    for (const z in j)
      if (j[z].location >= 0) {
        const ht = Y[z];
        let _t = W[z];
        if (_t === void 0 && (z === "instanceMatrix" && S.instanceMatrix && (_t = S.instanceMatrix), z === "instanceColor" && S.instanceColor && (_t = S.instanceColor)), ht === void 0 || ht.attribute !== _t || _t && ht.data !== _t.data) return !0;
        X++;
      }
    return r.attributesNum !== X || r.index !== H;
  }
  function _(S, D, k, H) {
    const Y = {}, W = D.attributes;
    let X = 0;
    const j = k.getAttributes();
    for (const z in j)
      if (j[z].location >= 0) {
        let ht = W[z];
        ht === void 0 && (z === "instanceMatrix" && S.instanceMatrix && (ht = S.instanceMatrix), z === "instanceColor" && S.instanceColor && (ht = S.instanceColor));
        const _t = {};
        _t.attribute = ht, ht && ht.data && (_t.data = ht.data), Y[z] = _t, X++;
      }
    r.attributes = Y, r.attributesNum = X, r.index = H;
  }
  function v() {
    const S = r.newAttributes;
    for (let D = 0, k = S.length; D < k; D++)
      S[D] = 0;
  }
  function p(S) {
    d(S, 0);
  }
  function d(S, D) {
    const k = r.newAttributes, H = r.enabledAttributes, Y = r.attributeDivisors;
    k[S] = 1, H[S] === 0 && (i.enableVertexAttribArray(S), H[S] = 1), Y[S] !== D && (i.vertexAttribDivisor(S, D), Y[S] = D);
  }
  function T() {
    const S = r.newAttributes, D = r.enabledAttributes;
    for (let k = 0, H = D.length; k < H; k++)
      D[k] !== S[k] && (i.disableVertexAttribArray(k), D[k] = 0);
  }
  function A(S, D, k, H, Y, W, X) {
    X === !0 ? i.vertexAttribIPointer(S, D, k, Y, W) : i.vertexAttribPointer(S, D, k, H, Y, W);
  }
  function E(S, D, k, H) {
    v();
    const Y = H.attributes, W = k.getAttributes(), X = D.defaultAttributeValues;
    for (const j in W) {
      const z = W[j];
      if (z.location >= 0) {
        let st = Y[j];
        if (st === void 0 && (j === "instanceMatrix" && S.instanceMatrix && (st = S.instanceMatrix), j === "instanceColor" && S.instanceColor && (st = S.instanceColor)), st !== void 0) {
          const ht = st.normalized, _t = st.itemSize, Ht = t.get(st);
          if (Ht === void 0) continue;
          const Jt = Ht.buffer, Gt = Ht.type, Ft = Ht.bytesPerElement, $ = Gt === i.INT || Gt === i.UNSIGNED_INT || st.gpuType === Ua;
          if (st.isInterleavedBufferAttribute) {
            const K = st.data, ut = K.stride, Pt = st.offset;
            if (K.isInstancedInterleavedBuffer) {
              for (let yt = 0; yt < z.locationSize; yt++)
                d(z.location + yt, K.meshPerAttribute);
              S.isInstancedMesh !== !0 && H._maxInstanceCount === void 0 && (H._maxInstanceCount = K.meshPerAttribute * K.count);
            } else
              for (let yt = 0; yt < z.locationSize; yt++)
                p(z.location + yt);
            i.bindBuffer(i.ARRAY_BUFFER, Jt);
            for (let yt = 0; yt < z.locationSize; yt++)
              A(
                z.location + yt,
                _t / z.locationSize,
                Gt,
                ht,
                ut * Ft,
                (Pt + _t / z.locationSize * yt) * Ft,
                $
              );
          } else {
            if (st.isInstancedBufferAttribute) {
              for (let K = 0; K < z.locationSize; K++)
                d(z.location + K, st.meshPerAttribute);
              S.isInstancedMesh !== !0 && H._maxInstanceCount === void 0 && (H._maxInstanceCount = st.meshPerAttribute * st.count);
            } else
              for (let K = 0; K < z.locationSize; K++)
                p(z.location + K);
            i.bindBuffer(i.ARRAY_BUFFER, Jt);
            for (let K = 0; K < z.locationSize; K++)
              A(
                z.location + K,
                _t / z.locationSize,
                Gt,
                ht,
                _t * Ft,
                _t / z.locationSize * K * Ft,
                $
              );
          }
        } else if (X !== void 0) {
          const ht = X[j];
          if (ht !== void 0)
            switch (ht.length) {
              case 2:
                i.vertexAttrib2fv(z.location, ht);
                break;
              case 3:
                i.vertexAttrib3fv(z.location, ht);
                break;
              case 4:
                i.vertexAttrib4fv(z.location, ht);
                break;
              default:
                i.vertexAttrib1fv(z.location, ht);
            }
        }
      }
    }
    T();
  }
  function b() {
    N();
    for (const S in n) {
      const D = n[S];
      for (const k in D) {
        const H = D[k];
        for (const Y in H)
          h(H[Y].object), delete H[Y];
        delete D[k];
      }
      delete n[S];
    }
  }
  function R(S) {
    if (n[S.id] === void 0) return;
    const D = n[S.id];
    for (const k in D) {
      const H = D[k];
      for (const Y in H)
        h(H[Y].object), delete H[Y];
      delete D[k];
    }
    delete n[S.id];
  }
  function C(S) {
    for (const D in n) {
      const k = n[D];
      if (k[S.id] === void 0) continue;
      const H = k[S.id];
      for (const Y in H)
        h(H[Y].object), delete H[Y];
      delete k[S.id];
    }
  }
  function N() {
    M(), o = !0, r !== s && (r = s, c(r.object));
  }
  function M() {
    s.geometry = null, s.program = null, s.wireframe = !1;
  }
  return {
    setup: a,
    reset: N,
    resetDefaultState: M,
    dispose: b,
    releaseStatesOfGeometry: R,
    releaseStatesOfProgram: C,
    initAttributes: v,
    enableAttribute: p,
    disableUnusedAttributes: T
  };
}
function Wf(i, t, e) {
  let n;
  function s(c) {
    n = c;
  }
  function r(c, h) {
    i.drawArrays(n, c, h), e.update(h, n, 1);
  }
  function o(c, h, u) {
    u !== 0 && (i.drawArraysInstanced(n, c, h, u), e.update(h, n, u));
  }
  function a(c, h, u) {
    if (u === 0) return;
    t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, c, 0, h, 0, u);
    let m = 0;
    for (let _ = 0; _ < u; _++)
      m += h[_];
    e.update(m, n, 1);
  }
  function l(c, h, u, f) {
    if (u === 0) return;
    const m = t.get("WEBGL_multi_draw");
    if (m === null)
      for (let _ = 0; _ < c.length; _++)
        o(c[_], h[_], f[_]);
    else {
      m.multiDrawArraysInstancedWEBGL(n, c, 0, h, 0, f, 0, u);
      let _ = 0;
      for (let v = 0; v < u; v++)
        _ += h[v] * f[v];
      e.update(_, n, 1);
    }
  }
  this.setMode = s, this.render = r, this.renderInstances = o, this.renderMultiDraw = a, this.renderMultiDrawInstances = l;
}
function Xf(i, t, e, n) {
  let s;
  function r() {
    if (s !== void 0) return s;
    if (t.has("EXT_texture_filter_anisotropic") === !0) {
      const C = t.get("EXT_texture_filter_anisotropic");
      s = i.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else
      s = 0;
    return s;
  }
  function o(C) {
    return !(C !== sn && n.convert(C) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function a(C) {
    const N = C === cs && (t.has("EXT_color_buffer_half_float") || t.has("EXT_color_buffer_float"));
    return !(C !== vn && n.convert(C) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
    C !== Cn && !N);
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
  const u = e.logarithmicDepthBuffer === !0, f = e.reversedDepthBuffer === !0 && t.has("EXT_clip_control"), m = i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS), _ = i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS), v = i.getParameter(i.MAX_TEXTURE_SIZE), p = i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE), d = i.getParameter(i.MAX_VERTEX_ATTRIBS), T = i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS), A = i.getParameter(i.MAX_VARYING_VECTORS), E = i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS), b = _ > 0, R = i.getParameter(i.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    // keeping this for backwards compatibility
    getMaxAnisotropy: r,
    getMaxPrecision: l,
    textureFormatReadable: o,
    textureTypeReadable: a,
    precision: c,
    logarithmicDepthBuffer: u,
    reversedDepthBuffer: f,
    maxTextures: m,
    maxVertexTextures: _,
    maxTextureSize: v,
    maxCubemapSize: p,
    maxAttributes: d,
    maxVertexUniforms: T,
    maxVaryings: A,
    maxFragmentUniforms: E,
    vertexTextures: b,
    maxSamples: R
  };
}
function $f(i) {
  const t = this;
  let e = null, n = 0, s = !1, r = !1;
  const o = new Rn(), a = new Bt(), l = { value: null, needsUpdate: !1 };
  this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(u, f) {
    const m = u.length !== 0 || f || // enable state of previous frame - the clipping code has to
    // run another frame in order to reset the state:
    n !== 0 || s;
    return s = f, n = u.length, m;
  }, this.beginShadows = function() {
    r = !0, h(null);
  }, this.endShadows = function() {
    r = !1;
  }, this.setGlobalState = function(u, f) {
    e = h(u, f, 0);
  }, this.setState = function(u, f, m) {
    const _ = u.clippingPlanes, v = u.clipIntersection, p = u.clipShadows, d = i.get(u);
    if (!s || _ === null || _.length === 0 || r && !p)
      r ? h(null) : c();
    else {
      const T = r ? 0 : n, A = T * 4;
      let E = d.clippingState || null;
      l.value = E, E = h(_, f, A, m);
      for (let b = 0; b !== A; ++b)
        E[b] = e[b];
      d.clippingState = E, this.numIntersection = v ? this.numPlanes : 0, this.numPlanes += T;
    }
  };
  function c() {
    l.value !== e && (l.value = e, l.needsUpdate = n > 0), t.numPlanes = n, t.numIntersection = 0;
  }
  function h(u, f, m, _) {
    const v = u !== null ? u.length : 0;
    let p = null;
    if (v !== 0) {
      if (p = l.value, _ !== !0 || p === null) {
        const d = m + v * 4, T = f.matrixWorldInverse;
        a.getNormalMatrix(T), (p === null || p.length < d) && (p = new Float32Array(d));
        for (let A = 0, E = m; A !== v; ++A, E += 4)
          o.copy(u[A]).applyMatrix4(T, a), o.normal.toArray(p, E), p[E + 3] = o.constant;
      }
      l.value = p, l.needsUpdate = !0;
    }
    return t.numPlanes = v, t.numIntersection = 0, p;
  }
}
function qf(i) {
  let t = /* @__PURE__ */ new WeakMap();
  function e(o, a) {
    return a === Yr ? o.mapping = Fi : a === jr && (o.mapping = Oi), o;
  }
  function n(o) {
    if (o && o.isTexture) {
      const a = o.mapping;
      if (a === Yr || a === jr)
        if (t.has(o)) {
          const l = t.get(o).texture;
          return e(l, o.mapping);
        } else {
          const l = o.image;
          if (l && l.height > 0) {
            const c = new Gh(l.height);
            return c.fromEquirectangularTexture(i, o), t.set(o, c), o.addEventListener("dispose", s), e(c.texture, o.mapping);
          } else
            return null;
        }
    }
    return o;
  }
  function s(o) {
    const a = o.target;
    a.removeEventListener("dispose", s);
    const l = t.get(a);
    l !== void 0 && (t.delete(a), l.dispose());
  }
  function r() {
    t = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: n,
    dispose: r
  };
}
const wi = 4, Ho = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], ti = 20, Pr = /* @__PURE__ */ new $l(), Vo = /* @__PURE__ */ new qt();
let Dr = null, Lr = 0, Ir = 0, Ur = !1;
const Jn = (1 + Math.sqrt(5)) / 2, Ei = 1 / Jn, Go = [
  /* @__PURE__ */ new L(-Jn, Ei, 0),
  /* @__PURE__ */ new L(Jn, Ei, 0),
  /* @__PURE__ */ new L(-Ei, 0, Jn),
  /* @__PURE__ */ new L(Ei, 0, Jn),
  /* @__PURE__ */ new L(0, Jn, -Ei),
  /* @__PURE__ */ new L(0, Jn, Ei),
  /* @__PURE__ */ new L(-1, 1, -1),
  /* @__PURE__ */ new L(1, 1, -1),
  /* @__PURE__ */ new L(-1, 1, 1),
  /* @__PURE__ */ new L(1, 1, 1)
], Yf = /* @__PURE__ */ new L();
class Wo {
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
  fromScene(t, e = 0, n = 0.1, s = 100, r = {}) {
    const {
      size: o = 256,
      position: a = Yf
    } = r;
    Dr = this._renderer.getRenderTarget(), Lr = this._renderer.getActiveCubeFace(), Ir = this._renderer.getActiveMipmapLevel(), Ur = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(o);
    const l = this._allocateTargets();
    return l.depthBuffer = !0, this._sceneToCubeUV(t, n, s, l, a), e > 0 && this._blur(l, 0, 0, e), this._applyPMREM(l), this._cleanup(l), l;
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
    this._cubemapMaterial === null && (this._cubemapMaterial = qo(), this._compileMaterial(this._cubemapMaterial));
  }
  /**
   * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = $o(), this._compileMaterial(this._equirectMaterial));
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
    this._renderer.setRenderTarget(Dr, Lr, Ir), this._renderer.xr.enabled = Ur, t.scissorTest = !1, Os(t, 0, 0, t.width, t.height);
  }
  _fromTexture(t, e) {
    t.mapping === Fi || t.mapping === Oi ? this._setSize(t.image.length === 0 ? 16 : t.image[0].width || t.image[0].image.width) : this._setSize(t.image.width / 4), Dr = this._renderer.getRenderTarget(), Lr = this._renderer.getActiveCubeFace(), Ir = this._renderer.getActiveMipmapLevel(), Ur = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
    const n = e || this._allocateTargets();
    return this._textureToCubeUV(t, n), this._applyPMREM(n), this._cleanup(n), n;
  }
  _allocateTargets() {
    const t = 3 * Math.max(this._cubeSize, 112), e = 4 * this._cubeSize, n = {
      magFilter: fn,
      minFilter: fn,
      generateMipmaps: !1,
      type: cs,
      format: sn,
      colorSpace: Bi,
      depthBuffer: !1
    }, s = Xo(t, e, n);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== t || this._pingPongRenderTarget.height !== e) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = Xo(t, e, n);
      const { _lodMax: r } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = jf(r)), this._blurMaterial = Kf(r, t, e);
    }
    return s;
  }
  _compileMaterial(t) {
    const e = new Xe(this._lodPlanes[0], t);
    this._renderer.compile(e, Pr);
  }
  _sceneToCubeUV(t, e, n, s, r) {
    const l = new je(90, 1, e, n), c = [1, -1, 1, 1, 1, 1], h = [1, 1, 1, -1, -1, -1], u = this._renderer, f = u.autoClear, m = u.toneMapping;
    u.getClearColor(Vo), u.toneMapping = zn, u.autoClear = !1, u.state.buffers.depth.getReversed() && (u.setRenderTarget(s), u.clearDepth(), u.setRenderTarget(null));
    const v = new os({
      name: "PMREM.Background",
      side: ze,
      depthWrite: !1,
      depthTest: !1
    }), p = new Xe(new Vn(), v);
    let d = !1;
    const T = t.background;
    T ? T.isColor && (v.color.copy(T), t.background = null, d = !0) : (v.color.copy(Vo), d = !0);
    for (let A = 0; A < 6; A++) {
      const E = A % 3;
      E === 0 ? (l.up.set(0, c[A], 0), l.position.set(r.x, r.y, r.z), l.lookAt(r.x + h[A], r.y, r.z)) : E === 1 ? (l.up.set(0, 0, c[A]), l.position.set(r.x, r.y, r.z), l.lookAt(r.x, r.y + h[A], r.z)) : (l.up.set(0, c[A], 0), l.position.set(r.x, r.y, r.z), l.lookAt(r.x, r.y, r.z + h[A]));
      const b = this._cubeSize;
      Os(s, E * b, A > 2 ? b : 0, b, b), u.setRenderTarget(s), d && u.render(p, l), u.render(t, l);
    }
    p.geometry.dispose(), p.material.dispose(), u.toneMapping = m, u.autoClear = f, t.background = T;
  }
  _textureToCubeUV(t, e) {
    const n = this._renderer, s = t.mapping === Fi || t.mapping === Oi;
    s ? (this._cubemapMaterial === null && (this._cubemapMaterial = qo()), this._cubemapMaterial.uniforms.flipEnvMap.value = t.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = $o());
    const r = s ? this._cubemapMaterial : this._equirectMaterial, o = new Xe(this._lodPlanes[0], r), a = r.uniforms;
    a.envMap.value = t;
    const l = this._cubeSize;
    Os(e, 0, 0, 3 * l, 2 * l), n.setRenderTarget(e), n.render(o, Pr);
  }
  _applyPMREM(t) {
    const e = this._renderer, n = e.autoClear;
    e.autoClear = !1;
    const s = this._lodPlanes.length;
    for (let r = 1; r < s; r++) {
      const o = Math.sqrt(this._sigmas[r] * this._sigmas[r] - this._sigmas[r - 1] * this._sigmas[r - 1]), a = Go[(s - r - 1) % Go.length];
      this._blur(t, r - 1, r, o, a);
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
  _blur(t, e, n, s, r) {
    const o = this._pingPongRenderTarget;
    this._halfBlur(
      t,
      o,
      e,
      n,
      s,
      "latitudinal",
      r
    ), this._halfBlur(
      o,
      t,
      n,
      n,
      s,
      "longitudinal",
      r
    );
  }
  _halfBlur(t, e, n, s, r, o, a) {
    const l = this._renderer, c = this._blurMaterial;
    o !== "latitudinal" && o !== "longitudinal" && console.error(
      "blur direction must be either latitudinal or longitudinal!"
    );
    const h = 3, u = new Xe(this._lodPlanes[s], c), f = c.uniforms, m = this._sizeLods[n] - 1, _ = isFinite(r) ? Math.PI / (2 * m) : 2 * Math.PI / (2 * ti - 1), v = r / _, p = isFinite(r) ? 1 + Math.floor(h * v) : ti;
    p > ti && console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${ti}`);
    const d = [];
    let T = 0;
    for (let C = 0; C < ti; ++C) {
      const N = C / v, M = Math.exp(-N * N / 2);
      d.push(M), C === 0 ? T += M : C < p && (T += 2 * M);
    }
    for (let C = 0; C < d.length; C++)
      d[C] = d[C] / T;
    f.envMap.value = t.texture, f.samples.value = p, f.weights.value = d, f.latitudinal.value = o === "latitudinal", a && (f.poleAxis.value = a);
    const { _lodMax: A } = this;
    f.dTheta.value = _, f.mipInt.value = A - n;
    const E = this._sizeLods[s], b = 3 * E * (s > A - wi ? s - A + wi : 0), R = 4 * (this._cubeSize - E);
    Os(e, b, R, 3 * E, 2 * E), l.setRenderTarget(e), l.render(u, Pr);
  }
}
function jf(i) {
  const t = [], e = [], n = [];
  let s = i;
  const r = i - wi + 1 + Ho.length;
  for (let o = 0; o < r; o++) {
    const a = Math.pow(2, s);
    e.push(a);
    let l = 1 / a;
    o > i - wi ? l = Ho[o - i + wi - 1] : o === 0 && (l = 0), n.push(l);
    const c = 1 / (a - 2), h = -c, u = 1 + c, f = [h, h, u, h, u, u, h, h, u, u, h, u], m = 6, _ = 6, v = 3, p = 2, d = 1, T = new Float32Array(v * _ * m), A = new Float32Array(p * _ * m), E = new Float32Array(d * _ * m);
    for (let R = 0; R < m; R++) {
      const C = R % 3 * 2 / 3 - 1, N = R > 2 ? 0 : -1, M = [
        C,
        N,
        0,
        C + 2 / 3,
        N,
        0,
        C + 2 / 3,
        N + 1,
        0,
        C,
        N,
        0,
        C + 2 / 3,
        N + 1,
        0,
        C,
        N + 1,
        0
      ];
      T.set(M, v * _ * R), A.set(f, p * _ * R);
      const S = [R, R, R, R, R, R];
      E.set(S, d * _ * R);
    }
    const b = new on();
    b.setAttribute("position", new an(T, v)), b.setAttribute("uv", new an(A, p)), b.setAttribute("faceIndex", new an(E, d)), t.push(b), s > wi && s--;
  }
  return { lodPlanes: t, sizeLods: e, sigmas: n };
}
function Xo(i, t, e) {
  const n = new ai(i, t, e);
  return n.texture.mapping = Js, n.texture.name = "PMREM.cubeUv", n.scissorTest = !0, n;
}
function Os(i, t, e, n, s) {
  i.viewport.set(t, e, n, s), i.scissor.set(t, e, n, s);
}
function Kf(i, t, e) {
  const n = new Float32Array(ti), s = new L(0, 1, 0);
  return new Gn({
    name: "SphericalGaussianBlur",
    defines: {
      n: ti,
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
      poleAxis: { value: s }
    },
    vertexShader: Wa(),
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
    blending: kn,
    depthTest: !1,
    depthWrite: !1
  });
}
function $o() {
  return new Gn({
    name: "EquirectangularToCubeUV",
    uniforms: {
      envMap: { value: null }
    },
    vertexShader: Wa(),
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
    blending: kn,
    depthTest: !1,
    depthWrite: !1
  });
}
function qo() {
  return new Gn({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: Wa(),
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
    blending: kn,
    depthTest: !1,
    depthWrite: !1
  });
}
function Wa() {
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
function Zf(i) {
  let t = /* @__PURE__ */ new WeakMap(), e = null;
  function n(a) {
    if (a && a.isTexture) {
      const l = a.mapping, c = l === Yr || l === jr, h = l === Fi || l === Oi;
      if (c || h) {
        let u = t.get(a);
        const f = u !== void 0 ? u.texture.pmremVersion : 0;
        if (a.isRenderTargetTexture && a.pmremVersion !== f)
          return e === null && (e = new Wo(i)), u = c ? e.fromEquirectangular(a, u) : e.fromCubemap(a, u), u.texture.pmremVersion = a.pmremVersion, t.set(a, u), u.texture;
        if (u !== void 0)
          return u.texture;
        {
          const m = a.image;
          return c && m && m.height > 0 || h && m && s(m) ? (e === null && (e = new Wo(i)), u = c ? e.fromEquirectangular(a) : e.fromCubemap(a), u.texture.pmremVersion = a.pmremVersion, t.set(a, u), a.addEventListener("dispose", r), u.texture) : null;
        }
      }
    }
    return a;
  }
  function s(a) {
    let l = 0;
    const c = 6;
    for (let h = 0; h < c; h++)
      a[h] !== void 0 && l++;
    return l === c;
  }
  function r(a) {
    const l = a.target;
    l.removeEventListener("dispose", r);
    const c = t.get(l);
    c !== void 0 && (t.delete(l), c.dispose());
  }
  function o() {
    t = /* @__PURE__ */ new WeakMap(), e !== null && (e.dispose(), e = null);
  }
  return {
    get: n,
    dispose: o
  };
}
function Jf(i) {
  const t = {};
  function e(n) {
    if (t[n] !== void 0)
      return t[n];
    let s;
    switch (n) {
      case "WEBGL_depth_texture":
        s = i.getExtension("WEBGL_depth_texture") || i.getExtension("MOZ_WEBGL_depth_texture") || i.getExtension("WEBKIT_WEBGL_depth_texture");
        break;
      case "EXT_texture_filter_anisotropic":
        s = i.getExtension("EXT_texture_filter_anisotropic") || i.getExtension("MOZ_EXT_texture_filter_anisotropic") || i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
        break;
      case "WEBGL_compressed_texture_s3tc":
        s = i.getExtension("WEBGL_compressed_texture_s3tc") || i.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        break;
      case "WEBGL_compressed_texture_pvrtc":
        s = i.getExtension("WEBGL_compressed_texture_pvrtc") || i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;
      default:
        s = i.getExtension(n);
    }
    return t[n] = s, s;
  }
  return {
    has: function(n) {
      return e(n) !== null;
    },
    init: function() {
      e("EXT_color_buffer_float"), e("WEBGL_clip_cull_distance"), e("OES_texture_float_linear"), e("EXT_color_buffer_half_float"), e("WEBGL_multisampled_render_to_texture"), e("WEBGL_render_shared_exponent");
    },
    get: function(n) {
      const s = e(n);
      return s === null && as("THREE.WebGLRenderer: " + n + " extension not supported."), s;
    }
  };
}
function Qf(i, t, e, n) {
  const s = {}, r = /* @__PURE__ */ new WeakMap();
  function o(u) {
    const f = u.target;
    f.index !== null && t.remove(f.index);
    for (const _ in f.attributes)
      t.remove(f.attributes[_]);
    f.removeEventListener("dispose", o), delete s[f.id];
    const m = r.get(f);
    m && (t.remove(m), r.delete(f)), n.releaseStatesOfGeometry(f), f.isInstancedBufferGeometry === !0 && delete f._maxInstanceCount, e.memory.geometries--;
  }
  function a(u, f) {
    return s[f.id] === !0 || (f.addEventListener("dispose", o), s[f.id] = !0, e.memory.geometries++), f;
  }
  function l(u) {
    const f = u.attributes;
    for (const m in f)
      t.update(f[m], i.ARRAY_BUFFER);
  }
  function c(u) {
    const f = [], m = u.index, _ = u.attributes.position;
    let v = 0;
    if (m !== null) {
      const T = m.array;
      v = m.version;
      for (let A = 0, E = T.length; A < E; A += 3) {
        const b = T[A + 0], R = T[A + 1], C = T[A + 2];
        f.push(b, R, R, C, C, b);
      }
    } else if (_ !== void 0) {
      const T = _.array;
      v = _.version;
      for (let A = 0, E = T.length / 3 - 1; A < E; A += 3) {
        const b = A + 0, R = A + 1, C = A + 2;
        f.push(b, R, R, C, C, b);
      }
    } else
      return;
    const p = new (Ul(f) ? Bl : Ol)(f, 1);
    p.version = v;
    const d = r.get(u);
    d && t.remove(d), r.set(u, p);
  }
  function h(u) {
    const f = r.get(u);
    if (f) {
      const m = u.index;
      m !== null && f.version < m.version && c(u);
    } else
      c(u);
    return r.get(u);
  }
  return {
    get: a,
    update: l,
    getWireframeAttribute: h
  };
}
function tp(i, t, e) {
  let n;
  function s(f) {
    n = f;
  }
  let r, o;
  function a(f) {
    r = f.type, o = f.bytesPerElement;
  }
  function l(f, m) {
    i.drawElements(n, m, r, f * o), e.update(m, n, 1);
  }
  function c(f, m, _) {
    _ !== 0 && (i.drawElementsInstanced(n, m, r, f * o, _), e.update(m, n, _));
  }
  function h(f, m, _) {
    if (_ === 0) return;
    t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, m, 0, r, f, 0, _);
    let p = 0;
    for (let d = 0; d < _; d++)
      p += m[d];
    e.update(p, n, 1);
  }
  function u(f, m, _, v) {
    if (_ === 0) return;
    const p = t.get("WEBGL_multi_draw");
    if (p === null)
      for (let d = 0; d < f.length; d++)
        c(f[d] / o, m[d], v[d]);
    else {
      p.multiDrawElementsInstancedWEBGL(n, m, 0, r, f, 0, v, 0, _);
      let d = 0;
      for (let T = 0; T < _; T++)
        d += m[T] * v[T];
      e.update(d, n, 1);
    }
  }
  this.setMode = s, this.setIndex = a, this.render = l, this.renderInstances = c, this.renderMultiDraw = h, this.renderMultiDrawInstances = u;
}
function ep(i) {
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
  function n(r, o, a) {
    switch (e.calls++, o) {
      case i.TRIANGLES:
        e.triangles += a * (r / 3);
        break;
      case i.LINES:
        e.lines += a * (r / 2);
        break;
      case i.LINE_STRIP:
        e.lines += a * (r - 1);
        break;
      case i.LINE_LOOP:
        e.lines += a * r;
        break;
      case i.POINTS:
        e.points += a * r;
        break;
      default:
        console.error("THREE.WebGLInfo: Unknown draw mode:", o);
        break;
    }
  }
  function s() {
    e.calls = 0, e.triangles = 0, e.points = 0, e.lines = 0;
  }
  return {
    memory: t,
    render: e,
    programs: null,
    autoReset: !0,
    reset: s,
    update: n
  };
}
function np(i, t, e) {
  const n = /* @__PURE__ */ new WeakMap(), s = new fe();
  function r(o, a, l) {
    const c = o.morphTargetInfluences, h = a.morphAttributes.position || a.morphAttributes.normal || a.morphAttributes.color, u = h !== void 0 ? h.length : 0;
    let f = n.get(a);
    if (f === void 0 || f.count !== u) {
      let S = function() {
        N.dispose(), n.delete(a), a.removeEventListener("dispose", S);
      };
      var m = S;
      f !== void 0 && f.texture.dispose();
      const _ = a.morphAttributes.position !== void 0, v = a.morphAttributes.normal !== void 0, p = a.morphAttributes.color !== void 0, d = a.morphAttributes.position || [], T = a.morphAttributes.normal || [], A = a.morphAttributes.color || [];
      let E = 0;
      _ === !0 && (E = 1), v === !0 && (E = 2), p === !0 && (E = 3);
      let b = a.attributes.position.count * E, R = 1;
      b > t.maxTextureSize && (R = Math.ceil(b / t.maxTextureSize), b = t.maxTextureSize);
      const C = new Float32Array(b * R * 4 * u), N = new Nl(C, b, R, u);
      N.type = Cn, N.needsUpdate = !0;
      const M = E * 4;
      for (let D = 0; D < u; D++) {
        const k = d[D], H = T[D], Y = A[D], W = b * R * 4 * D;
        for (let X = 0; X < k.count; X++) {
          const j = X * M;
          _ === !0 && (s.fromBufferAttribute(k, X), C[W + j + 0] = s.x, C[W + j + 1] = s.y, C[W + j + 2] = s.z, C[W + j + 3] = 0), v === !0 && (s.fromBufferAttribute(H, X), C[W + j + 4] = s.x, C[W + j + 5] = s.y, C[W + j + 6] = s.z, C[W + j + 7] = 0), p === !0 && (s.fromBufferAttribute(Y, X), C[W + j + 8] = s.x, C[W + j + 9] = s.y, C[W + j + 10] = s.z, C[W + j + 11] = Y.itemSize === 4 ? s.w : 1);
        }
      }
      f = {
        count: u,
        texture: N,
        size: new Dt(b, R)
      }, n.set(a, f), a.addEventListener("dispose", S);
    }
    if (o.isInstancedMesh === !0 && o.morphTexture !== null)
      l.getUniforms().setValue(i, "morphTexture", o.morphTexture, e);
    else {
      let _ = 0;
      for (let p = 0; p < c.length; p++)
        _ += c[p];
      const v = a.morphTargetsRelative ? 1 : 1 - _;
      l.getUniforms().setValue(i, "morphTargetBaseInfluence", v), l.getUniforms().setValue(i, "morphTargetInfluences", c);
    }
    l.getUniforms().setValue(i, "morphTargetsTexture", f.texture, e), l.getUniforms().setValue(i, "morphTargetsTextureSize", f.size);
  }
  return {
    update: r
  };
}
function ip(i, t, e, n) {
  let s = /* @__PURE__ */ new WeakMap();
  function r(l) {
    const c = n.render.frame, h = l.geometry, u = t.get(l, h);
    if (s.get(u) !== c && (t.update(u), s.set(u, c)), l.isInstancedMesh && (l.hasEventListener("dispose", a) === !1 && l.addEventListener("dispose", a), s.get(l) !== c && (e.update(l.instanceMatrix, i.ARRAY_BUFFER), l.instanceColor !== null && e.update(l.instanceColor, i.ARRAY_BUFFER), s.set(l, c))), l.isSkinnedMesh) {
      const f = l.skeleton;
      s.get(f) !== c && (f.update(), s.set(f, c));
    }
    return u;
  }
  function o() {
    s = /* @__PURE__ */ new WeakMap();
  }
  function a(l) {
    const c = l.target;
    c.removeEventListener("dispose", a), e.remove(c.instanceMatrix), c.instanceColor !== null && e.remove(c.instanceColor);
  }
  return {
    update: r,
    dispose: o
  };
}
const Yl = /* @__PURE__ */ new Fe(), Yo = /* @__PURE__ */ new Vl(1, 1), jl = /* @__PURE__ */ new Nl(), Kl = /* @__PURE__ */ new Ah(), Zl = /* @__PURE__ */ new Hl(), jo = [], Ko = [], Zo = new Float32Array(16), Jo = new Float32Array(9), Qo = new Float32Array(4);
function Gi(i, t, e) {
  const n = i[0];
  if (n <= 0 || n > 0) return i;
  const s = t * e;
  let r = jo[s];
  if (r === void 0 && (r = new Float32Array(s), jo[s] = r), t !== 0) {
    n.toArray(r, 0);
    for (let o = 1, a = 0; o !== t; ++o)
      a += e, i[o].toArray(r, a);
  }
  return r;
}
function Me(i, t) {
  if (i.length !== t.length) return !1;
  for (let e = 0, n = i.length; e < n; e++)
    if (i[e] !== t[e]) return !1;
  return !0;
}
function Se(i, t) {
  for (let e = 0, n = t.length; e < n; e++)
    i[e] = t[e];
}
function er(i, t) {
  let e = Ko[t];
  e === void 0 && (e = new Int32Array(t), Ko[t] = e);
  for (let n = 0; n !== t; ++n)
    e[n] = i.allocateTextureUnit();
  return e;
}
function sp(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1f(this.addr, t), e[0] = t);
}
function rp(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) && (i.uniform2f(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (Me(e, t)) return;
    i.uniform2fv(this.addr, t), Se(e, t);
  }
}
function ap(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3f(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else if (t.r !== void 0)
    (e[0] !== t.r || e[1] !== t.g || e[2] !== t.b) && (i.uniform3f(this.addr, t.r, t.g, t.b), e[0] = t.r, e[1] = t.g, e[2] = t.b);
  else {
    if (Me(e, t)) return;
    i.uniform3fv(this.addr, t), Se(e, t);
  }
}
function op(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4f(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (Me(e, t)) return;
    i.uniform4fv(this.addr, t), Se(e, t);
  }
}
function lp(i, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (Me(e, t)) return;
    i.uniformMatrix2fv(this.addr, !1, t), Se(e, t);
  } else {
    if (Me(e, n)) return;
    Qo.set(n), i.uniformMatrix2fv(this.addr, !1, Qo), Se(e, n);
  }
}
function cp(i, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (Me(e, t)) return;
    i.uniformMatrix3fv(this.addr, !1, t), Se(e, t);
  } else {
    if (Me(e, n)) return;
    Jo.set(n), i.uniformMatrix3fv(this.addr, !1, Jo), Se(e, n);
  }
}
function hp(i, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (Me(e, t)) return;
    i.uniformMatrix4fv(this.addr, !1, t), Se(e, t);
  } else {
    if (Me(e, n)) return;
    Zo.set(n), i.uniformMatrix4fv(this.addr, !1, Zo), Se(e, n);
  }
}
function dp(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1i(this.addr, t), e[0] = t);
}
function up(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) && (i.uniform2i(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (Me(e, t)) return;
    i.uniform2iv(this.addr, t), Se(e, t);
  }
}
function fp(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3i(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else {
    if (Me(e, t)) return;
    i.uniform3iv(this.addr, t), Se(e, t);
  }
}
function pp(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4i(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (Me(e, t)) return;
    i.uniform4iv(this.addr, t), Se(e, t);
  }
}
function mp(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1ui(this.addr, t), e[0] = t);
}
function _p(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) && (i.uniform2ui(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (Me(e, t)) return;
    i.uniform2uiv(this.addr, t), Se(e, t);
  }
}
function gp(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3ui(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else {
    if (Me(e, t)) return;
    i.uniform3uiv(this.addr, t), Se(e, t);
  }
}
function vp(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4ui(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (Me(e, t)) return;
    i.uniform4uiv(this.addr, t), Se(e, t);
  }
}
function xp(i, t, e) {
  const n = this.cache, s = e.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s);
  let r;
  this.type === i.SAMPLER_2D_SHADOW ? (Yo.compareFunction = Ll, r = Yo) : r = Yl, e.setTexture2D(t || r, s);
}
function Mp(i, t, e) {
  const n = this.cache, s = e.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTexture3D(t || Kl, s);
}
function Sp(i, t, e) {
  const n = this.cache, s = e.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTextureCube(t || Zl, s);
}
function Ep(i, t, e) {
  const n = this.cache, s = e.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTexture2DArray(t || jl, s);
}
function yp(i) {
  switch (i) {
    case 5126:
      return sp;
    // FLOAT
    case 35664:
      return rp;
    // _VEC2
    case 35665:
      return ap;
    // _VEC3
    case 35666:
      return op;
    // _VEC4
    case 35674:
      return lp;
    // _MAT2
    case 35675:
      return cp;
    // _MAT3
    case 35676:
      return hp;
    // _MAT4
    case 5124:
    case 35670:
      return dp;
    // INT, BOOL
    case 35667:
    case 35671:
      return up;
    // _VEC2
    case 35668:
    case 35672:
      return fp;
    // _VEC3
    case 35669:
    case 35673:
      return pp;
    // _VEC4
    case 5125:
      return mp;
    // UINT
    case 36294:
      return _p;
    // _VEC2
    case 36295:
      return gp;
    // _VEC3
    case 36296:
      return vp;
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
      return xp;
    case 35679:
    // SAMPLER_3D
    case 36299:
    // INT_SAMPLER_3D
    case 36307:
      return Mp;
    case 35680:
    // SAMPLER_CUBE
    case 36300:
    // INT_SAMPLER_CUBE
    case 36308:
    // UNSIGNED_INT_SAMPLER_CUBE
    case 36293:
      return Sp;
    case 36289:
    // SAMPLER_2D_ARRAY
    case 36303:
    // INT_SAMPLER_2D_ARRAY
    case 36311:
    // UNSIGNED_INT_SAMPLER_2D_ARRAY
    case 36292:
      return Ep;
  }
}
function bp(i, t) {
  i.uniform1fv(this.addr, t);
}
function Tp(i, t) {
  const e = Gi(t, this.size, 2);
  i.uniform2fv(this.addr, e);
}
function Ap(i, t) {
  const e = Gi(t, this.size, 3);
  i.uniform3fv(this.addr, e);
}
function wp(i, t) {
  const e = Gi(t, this.size, 4);
  i.uniform4fv(this.addr, e);
}
function Rp(i, t) {
  const e = Gi(t, this.size, 4);
  i.uniformMatrix2fv(this.addr, !1, e);
}
function Cp(i, t) {
  const e = Gi(t, this.size, 9);
  i.uniformMatrix3fv(this.addr, !1, e);
}
function Pp(i, t) {
  const e = Gi(t, this.size, 16);
  i.uniformMatrix4fv(this.addr, !1, e);
}
function Dp(i, t) {
  i.uniform1iv(this.addr, t);
}
function Lp(i, t) {
  i.uniform2iv(this.addr, t);
}
function Ip(i, t) {
  i.uniform3iv(this.addr, t);
}
function Up(i, t) {
  i.uniform4iv(this.addr, t);
}
function Np(i, t) {
  i.uniform1uiv(this.addr, t);
}
function Fp(i, t) {
  i.uniform2uiv(this.addr, t);
}
function Op(i, t) {
  i.uniform3uiv(this.addr, t);
}
function Bp(i, t) {
  i.uniform4uiv(this.addr, t);
}
function kp(i, t, e) {
  const n = this.cache, s = t.length, r = er(e, s);
  Me(n, r) || (i.uniform1iv(this.addr, r), Se(n, r));
  for (let o = 0; o !== s; ++o)
    e.setTexture2D(t[o] || Yl, r[o]);
}
function zp(i, t, e) {
  const n = this.cache, s = t.length, r = er(e, s);
  Me(n, r) || (i.uniform1iv(this.addr, r), Se(n, r));
  for (let o = 0; o !== s; ++o)
    e.setTexture3D(t[o] || Kl, r[o]);
}
function Hp(i, t, e) {
  const n = this.cache, s = t.length, r = er(e, s);
  Me(n, r) || (i.uniform1iv(this.addr, r), Se(n, r));
  for (let o = 0; o !== s; ++o)
    e.setTextureCube(t[o] || Zl, r[o]);
}
function Vp(i, t, e) {
  const n = this.cache, s = t.length, r = er(e, s);
  Me(n, r) || (i.uniform1iv(this.addr, r), Se(n, r));
  for (let o = 0; o !== s; ++o)
    e.setTexture2DArray(t[o] || jl, r[o]);
}
function Gp(i) {
  switch (i) {
    case 5126:
      return bp;
    // FLOAT
    case 35664:
      return Tp;
    // _VEC2
    case 35665:
      return Ap;
    // _VEC3
    case 35666:
      return wp;
    // _VEC4
    case 35674:
      return Rp;
    // _MAT2
    case 35675:
      return Cp;
    // _MAT3
    case 35676:
      return Pp;
    // _MAT4
    case 5124:
    case 35670:
      return Dp;
    // INT, BOOL
    case 35667:
    case 35671:
      return Lp;
    // _VEC2
    case 35668:
    case 35672:
      return Ip;
    // _VEC3
    case 35669:
    case 35673:
      return Up;
    // _VEC4
    case 5125:
      return Np;
    // UINT
    case 36294:
      return Fp;
    // _VEC2
    case 36295:
      return Op;
    // _VEC3
    case 36296:
      return Bp;
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
      return kp;
    case 35679:
    // SAMPLER_3D
    case 36299:
    // INT_SAMPLER_3D
    case 36307:
      return zp;
    case 35680:
    // SAMPLER_CUBE
    case 36300:
    // INT_SAMPLER_CUBE
    case 36308:
    // UNSIGNED_INT_SAMPLER_CUBE
    case 36293:
      return Hp;
    case 36289:
    // SAMPLER_2D_ARRAY
    case 36303:
    // INT_SAMPLER_2D_ARRAY
    case 36311:
    // UNSIGNED_INT_SAMPLER_2D_ARRAY
    case 36292:
      return Vp;
  }
}
class Wp {
  constructor(t, e, n) {
    this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.setValue = yp(e.type);
  }
}
class Xp {
  constructor(t, e, n) {
    this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.size = e.size, this.setValue = Gp(e.type);
  }
}
class $p {
  constructor(t) {
    this.id = t, this.seq = [], this.map = {};
  }
  setValue(t, e, n) {
    const s = this.seq;
    for (let r = 0, o = s.length; r !== o; ++r) {
      const a = s[r];
      a.setValue(t, e[a.id], n);
    }
  }
}
const Nr = /(\w+)(\])?(\[|\.)?/g;
function tl(i, t) {
  i.seq.push(t), i.map[t.id] = t;
}
function qp(i, t, e) {
  const n = i.name, s = n.length;
  for (Nr.lastIndex = 0; ; ) {
    const r = Nr.exec(n), o = Nr.lastIndex;
    let a = r[1];
    const l = r[2] === "]", c = r[3];
    if (l && (a = a | 0), c === void 0 || c === "[" && o + 2 === s) {
      tl(e, c === void 0 ? new Wp(a, i, t) : new Xp(a, i, t));
      break;
    } else {
      let u = e.map[a];
      u === void 0 && (u = new $p(a), tl(e, u)), e = u;
    }
  }
}
class Ws {
  constructor(t, e) {
    this.seq = [], this.map = {};
    const n = t.getProgramParameter(e, t.ACTIVE_UNIFORMS);
    for (let s = 0; s < n; ++s) {
      const r = t.getActiveUniform(e, s), o = t.getUniformLocation(e, r.name);
      qp(r, o, this);
    }
  }
  setValue(t, e, n, s) {
    const r = this.map[e];
    r !== void 0 && r.setValue(t, n, s);
  }
  setOptional(t, e, n) {
    const s = e[n];
    s !== void 0 && this.setValue(t, n, s);
  }
  static upload(t, e, n, s) {
    for (let r = 0, o = e.length; r !== o; ++r) {
      const a = e[r], l = n[a.id];
      l.needsUpdate !== !1 && a.setValue(t, l.value, s);
    }
  }
  static seqWithValue(t, e) {
    const n = [];
    for (let s = 0, r = t.length; s !== r; ++s) {
      const o = t[s];
      o.id in e && n.push(o);
    }
    return n;
  }
}
function el(i, t, e) {
  const n = i.createShader(t);
  return i.shaderSource(n, e), i.compileShader(n), n;
}
const Yp = 37297;
let jp = 0;
function Kp(i, t) {
  const e = i.split(`
`), n = [], s = Math.max(t - 6, 0), r = Math.min(t + 6, e.length);
  for (let o = s; o < r; o++) {
    const a = o + 1;
    n.push(`${a === t ? ">" : " "} ${a}: ${e[o]}`);
  }
  return n.join(`
`);
}
const nl = /* @__PURE__ */ new Bt();
function Zp(i) {
  jt._getMatrix(nl, jt.workingColorSpace, i);
  const t = `mat3( ${nl.elements.map((e) => e.toFixed(4))} )`;
  switch (jt.getTransfer(i)) {
    case Xs:
      return [t, "LinearTransferOETF"];
    case te:
      return [t, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space: ", i), [t, "LinearTransferOETF"];
  }
}
function il(i, t, e) {
  const n = i.getShaderParameter(t, i.COMPILE_STATUS), r = (i.getShaderInfoLog(t) || "").trim();
  if (n && r === "") return "";
  const o = /ERROR: 0:(\d+)/.exec(r);
  if (o) {
    const a = parseInt(o[1]);
    return e.toUpperCase() + `

` + r + `

` + Kp(i.getShaderSource(t), a);
  } else
    return r;
}
function Jp(i, t) {
  const e = Zp(t);
  return [
    `vec4 ${i}( vec4 value ) {`,
    `	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,
    "}"
  ].join(`
`);
}
function Qp(i, t) {
  let e;
  switch (t) {
    case kc:
      e = "Linear";
      break;
    case zc:
      e = "Reinhard";
      break;
    case Hc:
      e = "Cineon";
      break;
    case Vc:
      e = "ACESFilmic";
      break;
    case Wc:
      e = "AgX";
      break;
    case Xc:
      e = "Neutral";
      break;
    case Gc:
      e = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", t), e = "Linear";
  }
  return "vec3 " + i + "( vec3 color ) { return " + e + "ToneMapping( color ); }";
}
const Bs = /* @__PURE__ */ new L();
function tm() {
  jt.getLuminanceCoefficients(Bs);
  const i = Bs.x.toFixed(4), t = Bs.y.toFixed(4), e = Bs.z.toFixed(4);
  return [
    "float luminance( const in vec3 rgb ) {",
    `	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,
    "	return dot( weights, rgb );",
    "}"
  ].join(`
`);
}
function em(i) {
  return [
    i.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
    i.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
  ].filter(Ji).join(`
`);
}
function nm(i) {
  const t = [];
  for (const e in i) {
    const n = i[e];
    n !== !1 && t.push("#define " + e + " " + n);
  }
  return t.join(`
`);
}
function im(i, t) {
  const e = {}, n = i.getProgramParameter(t, i.ACTIVE_ATTRIBUTES);
  for (let s = 0; s < n; s++) {
    const r = i.getActiveAttrib(t, s), o = r.name;
    let a = 1;
    r.type === i.FLOAT_MAT2 && (a = 2), r.type === i.FLOAT_MAT3 && (a = 3), r.type === i.FLOAT_MAT4 && (a = 4), e[o] = {
      type: r.type,
      location: i.getAttribLocation(t, o),
      locationSize: a
    };
  }
  return e;
}
function Ji(i) {
  return i !== "";
}
function sl(i, t) {
  const e = t.numSpotLightShadows + t.numSpotLightMaps - t.numSpotLightShadowsWithMaps;
  return i.replace(/NUM_DIR_LIGHTS/g, t.numDirLights).replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, e).replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, t.numPointLights).replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, t.numPointLightShadows);
}
function rl(i, t) {
  return i.replace(/NUM_CLIPPING_PLANES/g, t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, t.numClippingPlanes - t.numClipIntersection);
}
const sm = /^[ \t]*#include +<([\w\d./]+)>/gm;
function Ra(i) {
  return i.replace(sm, am);
}
const rm = /* @__PURE__ */ new Map();
function am(i, t) {
  let e = zt[t];
  if (e === void 0) {
    const n = rm.get(t);
    if (n !== void 0)
      e = zt[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', t, n);
    else
      throw new Error("Can not resolve #include <" + t + ">");
  }
  return Ra(e);
}
const om = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function al(i) {
  return i.replace(om, lm);
}
function lm(i, t, e, n) {
  let s = "";
  for (let r = parseInt(t); r < parseInt(e); r++)
    s += n.replace(/\[\s*i\s*\]/g, "[ " + r + " ]").replace(/UNROLLED_LOOP_INDEX/g, r);
  return s;
}
function ol(i) {
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
function cm(i) {
  let t = "SHADOWMAP_TYPE_BASIC";
  return i.shadowMapType === Ml ? t = "SHADOWMAP_TYPE_PCF" : i.shadowMapType === vc ? t = "SHADOWMAP_TYPE_PCF_SOFT" : i.shadowMapType === wn && (t = "SHADOWMAP_TYPE_VSM"), t;
}
function hm(i) {
  let t = "ENVMAP_TYPE_CUBE";
  if (i.envMap)
    switch (i.envMapMode) {
      case Fi:
      case Oi:
        t = "ENVMAP_TYPE_CUBE";
        break;
      case Js:
        t = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
  return t;
}
function dm(i) {
  let t = "ENVMAP_MODE_REFLECTION";
  return i.envMap && i.envMapMode === Oi && (t = "ENVMAP_MODE_REFRACTION"), t;
}
function um(i) {
  let t = "ENVMAP_BLENDING_NONE";
  if (i.envMap)
    switch (i.combine) {
      case Sl:
        t = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case Oc:
        t = "ENVMAP_BLENDING_MIX";
        break;
      case Bc:
        t = "ENVMAP_BLENDING_ADD";
        break;
    }
  return t;
}
function fm(i) {
  const t = i.envMapCubeUVHeight;
  if (t === null) return null;
  const e = Math.log2(t) - 2, n = 1 / t;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, e), 112)), texelHeight: n, maxMip: e };
}
function pm(i, t, e, n) {
  const s = i.getContext(), r = e.defines;
  let o = e.vertexShader, a = e.fragmentShader;
  const l = cm(e), c = hm(e), h = dm(e), u = um(e), f = fm(e), m = em(e), _ = nm(r), v = s.createProgram();
  let p, d, T = e.glslVersion ? "#version " + e.glslVersion + `
` : "";
  e.isRawShaderMaterial ? (p = [
    "#define SHADER_TYPE " + e.shaderType,
    "#define SHADER_NAME " + e.shaderName,
    _
  ].filter(Ji).join(`
`), p.length > 0 && (p += `
`), d = [
    "#define SHADER_TYPE " + e.shaderType,
    "#define SHADER_NAME " + e.shaderName,
    _
  ].filter(Ji).join(`
`), d.length > 0 && (d += `
`)) : (p = [
    ol(e),
    "#define SHADER_TYPE " + e.shaderType,
    "#define SHADER_NAME " + e.shaderName,
    _,
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
  ].filter(Ji).join(`
`), d = [
    ol(e),
    "#define SHADER_TYPE " + e.shaderType,
    "#define SHADER_NAME " + e.shaderName,
    _,
    e.useFog && e.fog ? "#define USE_FOG" : "",
    e.useFog && e.fogExp2 ? "#define FOG_EXP2" : "",
    e.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
    e.map ? "#define USE_MAP" : "",
    e.matcap ? "#define USE_MATCAP" : "",
    e.envMap ? "#define USE_ENVMAP" : "",
    e.envMap ? "#define " + c : "",
    e.envMap ? "#define " + h : "",
    e.envMap ? "#define " + u : "",
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
    e.toneMapping !== zn ? "#define TONE_MAPPING" : "",
    e.toneMapping !== zn ? zt.tonemapping_pars_fragment : "",
    // this code is required here because it is used by the toneMapping() function defined below
    e.toneMapping !== zn ? Qp("toneMapping", e.toneMapping) : "",
    e.dithering ? "#define DITHERING" : "",
    e.opaque ? "#define OPAQUE" : "",
    zt.colorspace_pars_fragment,
    // this code is required here because it is used by the various encoding/decoding function defined below
    Jp("linearToOutputTexel", e.outputColorSpace),
    tm(),
    e.useDepthPacking ? "#define DEPTH_PACKING " + e.depthPacking : "",
    `
`
  ].filter(Ji).join(`
`)), o = Ra(o), o = sl(o, e), o = rl(o, e), a = Ra(a), a = sl(a, e), a = rl(a, e), o = al(o), a = al(a), e.isRawShaderMaterial !== !0 && (T = `#version 300 es
`, p = [
    m,
    "#define attribute in",
    "#define varying out",
    "#define texture2D texture"
  ].join(`
`) + `
` + p, d = [
    "#define varying in",
    e.glslVersion === ho ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
    e.glslVersion === ho ? "" : "#define gl_FragColor pc_fragColor",
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
` + d);
  const A = T + p + o, E = T + d + a, b = el(s, s.VERTEX_SHADER, A), R = el(s, s.FRAGMENT_SHADER, E);
  s.attachShader(v, b), s.attachShader(v, R), e.index0AttributeName !== void 0 ? s.bindAttribLocation(v, 0, e.index0AttributeName) : e.morphTargets === !0 && s.bindAttribLocation(v, 0, "position"), s.linkProgram(v);
  function C(D) {
    if (i.debug.checkShaderErrors) {
      const k = s.getProgramInfoLog(v) || "", H = s.getShaderInfoLog(b) || "", Y = s.getShaderInfoLog(R) || "", W = k.trim(), X = H.trim(), j = Y.trim();
      let z = !0, st = !0;
      if (s.getProgramParameter(v, s.LINK_STATUS) === !1)
        if (z = !1, typeof i.debug.onShaderError == "function")
          i.debug.onShaderError(s, v, b, R);
        else {
          const ht = il(s, b, "vertex"), _t = il(s, R, "fragment");
          console.error(
            "THREE.WebGLProgram: Shader Error " + s.getError() + " - VALIDATE_STATUS " + s.getProgramParameter(v, s.VALIDATE_STATUS) + `

Material Name: ` + D.name + `
Material Type: ` + D.type + `

Program Info Log: ` + W + `
` + ht + `
` + _t
          );
        }
      else W !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", W) : (X === "" || j === "") && (st = !1);
      st && (D.diagnostics = {
        runnable: z,
        programLog: W,
        vertexShader: {
          log: X,
          prefix: p
        },
        fragmentShader: {
          log: j,
          prefix: d
        }
      });
    }
    s.deleteShader(b), s.deleteShader(R), N = new Ws(s, v), M = im(s, v);
  }
  let N;
  this.getUniforms = function() {
    return N === void 0 && C(this), N;
  };
  let M;
  this.getAttributes = function() {
    return M === void 0 && C(this), M;
  };
  let S = e.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function() {
    return S === !1 && (S = s.getProgramParameter(v, Yp)), S;
  }, this.destroy = function() {
    n.releaseStatesOfProgram(this), s.deleteProgram(v), this.program = void 0;
  }, this.type = e.shaderType, this.name = e.shaderName, this.id = jp++, this.cacheKey = t, this.usedTimes = 1, this.program = v, this.vertexShader = b, this.fragmentShader = R, this;
}
let mm = 0;
class _m {
  constructor() {
    this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
  }
  update(t) {
    const e = t.vertexShader, n = t.fragmentShader, s = this._getShaderStage(e), r = this._getShaderStage(n), o = this._getShaderCacheForMaterial(t);
    return o.has(s) === !1 && (o.add(s), s.usedTimes++), o.has(r) === !1 && (o.add(r), r.usedTimes++), this;
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
    return n === void 0 && (n = new gm(t), e.set(t, n)), n;
  }
}
class gm {
  constructor(t) {
    this.id = mm++, this.code = t, this.usedTimes = 0;
  }
}
function vm(i, t, e, n, s, r, o) {
  const a = new Va(), l = new _m(), c = /* @__PURE__ */ new Set(), h = [], u = s.logarithmicDepthBuffer, f = s.vertexTextures;
  let m = s.precision;
  const _ = {
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
  function v(M) {
    return c.add(M), M === 0 ? "uv" : `uv${M}`;
  }
  function p(M, S, D, k, H) {
    const Y = k.fog, W = H.geometry, X = M.isMeshStandardMaterial ? k.environment : null, j = (M.isMeshStandardMaterial ? e : t).get(M.envMap || X), z = j && j.mapping === Js ? j.image.height : null, st = _[M.type];
    M.precision !== null && (m = s.getMaxPrecision(M.precision), m !== M.precision && console.warn("THREE.WebGLProgram.getParameters:", M.precision, "not supported, using", m, "instead."));
    const ht = W.morphAttributes.position || W.morphAttributes.normal || W.morphAttributes.color, _t = ht !== void 0 ? ht.length : 0;
    let Ht = 0;
    W.morphAttributes.position !== void 0 && (Ht = 1), W.morphAttributes.normal !== void 0 && (Ht = 2), W.morphAttributes.color !== void 0 && (Ht = 3);
    let Jt, Gt, Ft, $;
    if (st) {
      const Kt = cn[st];
      Jt = Kt.vertexShader, Gt = Kt.fragmentShader;
    } else
      Jt = M.vertexShader, Gt = M.fragmentShader, l.update(M), Ft = l.getVertexShaderID(M), $ = l.getFragmentShaderID(M);
    const K = i.getRenderTarget(), ut = i.state.buffers.depth.getReversed(), Pt = H.isInstancedMesh === !0, yt = H.isBatchedMesh === !0, $t = !!M.map, we = !!M.matcap, w = !!j, le = !!M.aoMap, Ut = !!M.lightMap, Rt = !!M.bumpMap, gt = !!M.normalMap, ce = !!M.displacementMap, vt = !!M.emissiveMap, kt = !!M.metalnessMap, Ee = !!M.roughnessMap, pe = M.anisotropy > 0, y = M.clearcoat > 0, g = M.dispersion > 0, F = M.iridescence > 0, G = M.sheen > 0, Z = M.transmission > 0, V = pe && !!M.anisotropyMap, Et = y && !!M.clearcoatMap, it = y && !!M.clearcoatNormalMap, xt = y && !!M.clearcoatRoughnessMap, Mt = F && !!M.iridescenceMap, tt = F && !!M.iridescenceThicknessMap, ct = G && !!M.sheenColorMap, wt = G && !!M.sheenRoughnessMap, St = !!M.specularMap, ot = !!M.specularColorMap, Ot = !!M.specularIntensityMap, P = Z && !!M.transmissionMap, et = Z && !!M.thicknessMap, rt = !!M.gradientMap, ft = !!M.alphaMap, J = M.alphaTest > 0, q = !!M.alphaHash, mt = !!M.extensions;
    let Lt = zn;
    M.toneMapped && (K === null || K.isXRRenderTarget === !0) && (Lt = i.toneMapping);
    const se = {
      shaderID: st,
      shaderType: M.type,
      shaderName: M.name,
      vertexShader: Jt,
      fragmentShader: Gt,
      defines: M.defines,
      customVertexShaderID: Ft,
      customFragmentShaderID: $,
      isRawShaderMaterial: M.isRawShaderMaterial === !0,
      glslVersion: M.glslVersion,
      precision: m,
      batching: yt,
      batchingColor: yt && H._colorsTexture !== null,
      instancing: Pt,
      instancingColor: Pt && H.instanceColor !== null,
      instancingMorph: Pt && H.morphTexture !== null,
      supportsVertexTextures: f,
      outputColorSpace: K === null ? i.outputColorSpace : K.isXRRenderTarget === !0 ? K.texture.colorSpace : Bi,
      alphaToCoverage: !!M.alphaToCoverage,
      map: $t,
      matcap: we,
      envMap: w,
      envMapMode: w && j.mapping,
      envMapCubeUVHeight: z,
      aoMap: le,
      lightMap: Ut,
      bumpMap: Rt,
      normalMap: gt,
      displacementMap: f && ce,
      emissiveMap: vt,
      normalMapObjectSpace: gt && M.normalMapType === jc,
      normalMapTangentSpace: gt && M.normalMapType === Dl,
      metalnessMap: kt,
      roughnessMap: Ee,
      anisotropy: pe,
      anisotropyMap: V,
      clearcoat: y,
      clearcoatMap: Et,
      clearcoatNormalMap: it,
      clearcoatRoughnessMap: xt,
      dispersion: g,
      iridescence: F,
      iridescenceMap: Mt,
      iridescenceThicknessMap: tt,
      sheen: G,
      sheenColorMap: ct,
      sheenRoughnessMap: wt,
      specularMap: St,
      specularColorMap: ot,
      specularIntensityMap: Ot,
      transmission: Z,
      transmissionMap: P,
      thicknessMap: et,
      gradientMap: rt,
      opaque: M.transparent === !1 && M.blending === Di && M.alphaToCoverage === !1,
      alphaMap: ft,
      alphaTest: J,
      alphaHash: q,
      combine: M.combine,
      //
      mapUv: $t && v(M.map.channel),
      aoMapUv: le && v(M.aoMap.channel),
      lightMapUv: Ut && v(M.lightMap.channel),
      bumpMapUv: Rt && v(M.bumpMap.channel),
      normalMapUv: gt && v(M.normalMap.channel),
      displacementMapUv: ce && v(M.displacementMap.channel),
      emissiveMapUv: vt && v(M.emissiveMap.channel),
      metalnessMapUv: kt && v(M.metalnessMap.channel),
      roughnessMapUv: Ee && v(M.roughnessMap.channel),
      anisotropyMapUv: V && v(M.anisotropyMap.channel),
      clearcoatMapUv: Et && v(M.clearcoatMap.channel),
      clearcoatNormalMapUv: it && v(M.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: xt && v(M.clearcoatRoughnessMap.channel),
      iridescenceMapUv: Mt && v(M.iridescenceMap.channel),
      iridescenceThicknessMapUv: tt && v(M.iridescenceThicknessMap.channel),
      sheenColorMapUv: ct && v(M.sheenColorMap.channel),
      sheenRoughnessMapUv: wt && v(M.sheenRoughnessMap.channel),
      specularMapUv: St && v(M.specularMap.channel),
      specularColorMapUv: ot && v(M.specularColorMap.channel),
      specularIntensityMapUv: Ot && v(M.specularIntensityMap.channel),
      transmissionMapUv: P && v(M.transmissionMap.channel),
      thicknessMapUv: et && v(M.thicknessMap.channel),
      alphaMapUv: ft && v(M.alphaMap.channel),
      //
      vertexTangents: !!W.attributes.tangent && (gt || pe),
      vertexColors: M.vertexColors,
      vertexAlphas: M.vertexColors === !0 && !!W.attributes.color && W.attributes.color.itemSize === 4,
      pointsUvs: H.isPoints === !0 && !!W.attributes.uv && ($t || ft),
      fog: !!Y,
      useFog: M.fog === !0,
      fogExp2: !!Y && Y.isFogExp2,
      flatShading: M.flatShading === !0 && M.wireframe === !1,
      sizeAttenuation: M.sizeAttenuation === !0,
      logarithmicDepthBuffer: u,
      reversedDepthBuffer: ut,
      skinning: H.isSkinnedMesh === !0,
      morphTargets: W.morphAttributes.position !== void 0,
      morphNormals: W.morphAttributes.normal !== void 0,
      morphColors: W.morphAttributes.color !== void 0,
      morphTargetsCount: _t,
      morphTextureStride: Ht,
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
      numClippingPlanes: o.numPlanes,
      numClipIntersection: o.numIntersection,
      dithering: M.dithering,
      shadowMapEnabled: i.shadowMap.enabled && D.length > 0,
      shadowMapType: i.shadowMap.type,
      toneMapping: Lt,
      decodeVideoTexture: $t && M.map.isVideoTexture === !0 && jt.getTransfer(M.map.colorSpace) === te,
      decodeVideoTextureEmissive: vt && M.emissiveMap.isVideoTexture === !0 && jt.getTransfer(M.emissiveMap.colorSpace) === te,
      premultipliedAlpha: M.premultipliedAlpha,
      doubleSided: M.side === hn,
      flipSided: M.side === ze,
      useDepthPacking: M.depthPacking >= 0,
      depthPacking: M.depthPacking || 0,
      index0AttributeName: M.index0AttributeName,
      extensionClipCullDistance: mt && M.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: (mt && M.extensions.multiDraw === !0 || yt) && n.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: M.customProgramCacheKey()
    };
    return se.vertexUv1s = c.has(1), se.vertexUv2s = c.has(2), se.vertexUv3s = c.has(3), c.clear(), se;
  }
  function d(M) {
    const S = [];
    if (M.shaderID ? S.push(M.shaderID) : (S.push(M.customVertexShaderID), S.push(M.customFragmentShaderID)), M.defines !== void 0)
      for (const D in M.defines)
        S.push(D), S.push(M.defines[D]);
    return M.isRawShaderMaterial === !1 && (T(S, M), A(S, M), S.push(i.outputColorSpace)), S.push(M.customProgramCacheKey), S.join();
  }
  function T(M, S) {
    M.push(S.precision), M.push(S.outputColorSpace), M.push(S.envMapMode), M.push(S.envMapCubeUVHeight), M.push(S.mapUv), M.push(S.alphaMapUv), M.push(S.lightMapUv), M.push(S.aoMapUv), M.push(S.bumpMapUv), M.push(S.normalMapUv), M.push(S.displacementMapUv), M.push(S.emissiveMapUv), M.push(S.metalnessMapUv), M.push(S.roughnessMapUv), M.push(S.anisotropyMapUv), M.push(S.clearcoatMapUv), M.push(S.clearcoatNormalMapUv), M.push(S.clearcoatRoughnessMapUv), M.push(S.iridescenceMapUv), M.push(S.iridescenceThicknessMapUv), M.push(S.sheenColorMapUv), M.push(S.sheenRoughnessMapUv), M.push(S.specularMapUv), M.push(S.specularColorMapUv), M.push(S.specularIntensityMapUv), M.push(S.transmissionMapUv), M.push(S.thicknessMapUv), M.push(S.combine), M.push(S.fogExp2), M.push(S.sizeAttenuation), M.push(S.morphTargetsCount), M.push(S.morphAttributeCount), M.push(S.numDirLights), M.push(S.numPointLights), M.push(S.numSpotLights), M.push(S.numSpotLightMaps), M.push(S.numHemiLights), M.push(S.numRectAreaLights), M.push(S.numDirLightShadows), M.push(S.numPointLightShadows), M.push(S.numSpotLightShadows), M.push(S.numSpotLightShadowsWithMaps), M.push(S.numLightProbes), M.push(S.shadowMapType), M.push(S.toneMapping), M.push(S.numClippingPlanes), M.push(S.numClipIntersection), M.push(S.depthPacking);
  }
  function A(M, S) {
    a.disableAll(), S.supportsVertexTextures && a.enable(0), S.instancing && a.enable(1), S.instancingColor && a.enable(2), S.instancingMorph && a.enable(3), S.matcap && a.enable(4), S.envMap && a.enable(5), S.normalMapObjectSpace && a.enable(6), S.normalMapTangentSpace && a.enable(7), S.clearcoat && a.enable(8), S.iridescence && a.enable(9), S.alphaTest && a.enable(10), S.vertexColors && a.enable(11), S.vertexAlphas && a.enable(12), S.vertexUv1s && a.enable(13), S.vertexUv2s && a.enable(14), S.vertexUv3s && a.enable(15), S.vertexTangents && a.enable(16), S.anisotropy && a.enable(17), S.alphaHash && a.enable(18), S.batching && a.enable(19), S.dispersion && a.enable(20), S.batchingColor && a.enable(21), S.gradientMap && a.enable(22), M.push(a.mask), a.disableAll(), S.fog && a.enable(0), S.useFog && a.enable(1), S.flatShading && a.enable(2), S.logarithmicDepthBuffer && a.enable(3), S.reversedDepthBuffer && a.enable(4), S.skinning && a.enable(5), S.morphTargets && a.enable(6), S.morphNormals && a.enable(7), S.morphColors && a.enable(8), S.premultipliedAlpha && a.enable(9), S.shadowMapEnabled && a.enable(10), S.doubleSided && a.enable(11), S.flipSided && a.enable(12), S.useDepthPacking && a.enable(13), S.dithering && a.enable(14), S.transmission && a.enable(15), S.sheen && a.enable(16), S.opaque && a.enable(17), S.pointsUvs && a.enable(18), S.decodeVideoTexture && a.enable(19), S.decodeVideoTextureEmissive && a.enable(20), S.alphaToCoverage && a.enable(21), M.push(a.mask);
  }
  function E(M) {
    const S = _[M.type];
    let D;
    if (S) {
      const k = cn[S];
      D = kh.clone(k.uniforms);
    } else
      D = M.uniforms;
    return D;
  }
  function b(M, S) {
    let D;
    for (let k = 0, H = h.length; k < H; k++) {
      const Y = h[k];
      if (Y.cacheKey === S) {
        D = Y, ++D.usedTimes;
        break;
      }
    }
    return D === void 0 && (D = new pm(i, S, M, r), h.push(D)), D;
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
  function N() {
    l.dispose();
  }
  return {
    getParameters: p,
    getProgramCacheKey: d,
    getUniforms: E,
    acquireProgram: b,
    releaseProgram: R,
    releaseShaderCache: C,
    // Exposed for resource monitoring & error feedback via renderer.info:
    programs: h,
    dispose: N
  };
}
function xm() {
  let i = /* @__PURE__ */ new WeakMap();
  function t(o) {
    return i.has(o);
  }
  function e(o) {
    let a = i.get(o);
    return a === void 0 && (a = {}, i.set(o, a)), a;
  }
  function n(o) {
    i.delete(o);
  }
  function s(o, a, l) {
    i.get(o)[a] = l;
  }
  function r() {
    i = /* @__PURE__ */ new WeakMap();
  }
  return {
    has: t,
    get: e,
    remove: n,
    update: s,
    dispose: r
  };
}
function Mm(i, t) {
  return i.groupOrder !== t.groupOrder ? i.groupOrder - t.groupOrder : i.renderOrder !== t.renderOrder ? i.renderOrder - t.renderOrder : i.material.id !== t.material.id ? i.material.id - t.material.id : i.z !== t.z ? i.z - t.z : i.id - t.id;
}
function ll(i, t) {
  return i.groupOrder !== t.groupOrder ? i.groupOrder - t.groupOrder : i.renderOrder !== t.renderOrder ? i.renderOrder - t.renderOrder : i.z !== t.z ? t.z - i.z : i.id - t.id;
}
function cl() {
  const i = [];
  let t = 0;
  const e = [], n = [], s = [];
  function r() {
    t = 0, e.length = 0, n.length = 0, s.length = 0;
  }
  function o(u, f, m, _, v, p) {
    let d = i[t];
    return d === void 0 ? (d = {
      id: u.id,
      object: u,
      geometry: f,
      material: m,
      groupOrder: _,
      renderOrder: u.renderOrder,
      z: v,
      group: p
    }, i[t] = d) : (d.id = u.id, d.object = u, d.geometry = f, d.material = m, d.groupOrder = _, d.renderOrder = u.renderOrder, d.z = v, d.group = p), t++, d;
  }
  function a(u, f, m, _, v, p) {
    const d = o(u, f, m, _, v, p);
    m.transmission > 0 ? n.push(d) : m.transparent === !0 ? s.push(d) : e.push(d);
  }
  function l(u, f, m, _, v, p) {
    const d = o(u, f, m, _, v, p);
    m.transmission > 0 ? n.unshift(d) : m.transparent === !0 ? s.unshift(d) : e.unshift(d);
  }
  function c(u, f) {
    e.length > 1 && e.sort(u || Mm), n.length > 1 && n.sort(f || ll), s.length > 1 && s.sort(f || ll);
  }
  function h() {
    for (let u = t, f = i.length; u < f; u++) {
      const m = i[u];
      if (m.id === null) break;
      m.id = null, m.object = null, m.geometry = null, m.material = null, m.group = null;
    }
  }
  return {
    opaque: e,
    transmissive: n,
    transparent: s,
    init: r,
    push: a,
    unshift: l,
    finish: h,
    sort: c
  };
}
function Sm() {
  let i = /* @__PURE__ */ new WeakMap();
  function t(n, s) {
    const r = i.get(n);
    let o;
    return r === void 0 ? (o = new cl(), i.set(n, [o])) : s >= r.length ? (o = new cl(), r.push(o)) : o = r[s], o;
  }
  function e() {
    i = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: t,
    dispose: e
  };
}
function Em() {
  const i = {};
  return {
    get: function(t) {
      if (i[t.id] !== void 0)
        return i[t.id];
      let e;
      switch (t.type) {
        case "DirectionalLight":
          e = {
            direction: new L(),
            color: new qt()
          };
          break;
        case "SpotLight":
          e = {
            position: new L(),
            direction: new L(),
            color: new qt(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case "PointLight":
          e = {
            position: new L(),
            color: new qt(),
            distance: 0,
            decay: 0
          };
          break;
        case "HemisphereLight":
          e = {
            direction: new L(),
            skyColor: new qt(),
            groundColor: new qt()
          };
          break;
        case "RectAreaLight":
          e = {
            color: new qt(),
            position: new L(),
            halfWidth: new L(),
            halfHeight: new L()
          };
          break;
      }
      return i[t.id] = e, e;
    }
  };
}
function ym() {
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
            shadowMapSize: new Dt()
          };
          break;
        case "SpotLight":
          e = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Dt()
          };
          break;
        case "PointLight":
          e = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Dt(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3
          };
          break;
      }
      return i[t.id] = e, e;
    }
  };
}
let bm = 0;
function Tm(i, t) {
  return (t.castShadow ? 2 : 0) - (i.castShadow ? 2 : 0) + (t.map ? 1 : 0) - (i.map ? 1 : 0);
}
function Am(i) {
  const t = new Em(), e = ym(), n = {
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
  for (let c = 0; c < 9; c++) n.probe.push(new L());
  const s = new L(), r = new oe(), o = new oe();
  function a(c) {
    let h = 0, u = 0, f = 0;
    for (let M = 0; M < 9; M++) n.probe[M].set(0, 0, 0);
    let m = 0, _ = 0, v = 0, p = 0, d = 0, T = 0, A = 0, E = 0, b = 0, R = 0, C = 0;
    c.sort(Tm);
    for (let M = 0, S = c.length; M < S; M++) {
      const D = c[M], k = D.color, H = D.intensity, Y = D.distance, W = D.shadow && D.shadow.map ? D.shadow.map.texture : null;
      if (D.isAmbientLight)
        h += k.r * H, u += k.g * H, f += k.b * H;
      else if (D.isLightProbe) {
        for (let X = 0; X < 9; X++)
          n.probe[X].addScaledVector(D.sh.coefficients[X], H);
        C++;
      } else if (D.isDirectionalLight) {
        const X = t.get(D);
        if (X.color.copy(D.color).multiplyScalar(D.intensity), D.castShadow) {
          const j = D.shadow, z = e.get(D);
          z.shadowIntensity = j.intensity, z.shadowBias = j.bias, z.shadowNormalBias = j.normalBias, z.shadowRadius = j.radius, z.shadowMapSize = j.mapSize, n.directionalShadow[m] = z, n.directionalShadowMap[m] = W, n.directionalShadowMatrix[m] = D.shadow.matrix, T++;
        }
        n.directional[m] = X, m++;
      } else if (D.isSpotLight) {
        const X = t.get(D);
        X.position.setFromMatrixPosition(D.matrixWorld), X.color.copy(k).multiplyScalar(H), X.distance = Y, X.coneCos = Math.cos(D.angle), X.penumbraCos = Math.cos(D.angle * (1 - D.penumbra)), X.decay = D.decay, n.spot[v] = X;
        const j = D.shadow;
        if (D.map && (n.spotLightMap[b] = D.map, b++, j.updateMatrices(D), D.castShadow && R++), n.spotLightMatrix[v] = j.matrix, D.castShadow) {
          const z = e.get(D);
          z.shadowIntensity = j.intensity, z.shadowBias = j.bias, z.shadowNormalBias = j.normalBias, z.shadowRadius = j.radius, z.shadowMapSize = j.mapSize, n.spotShadow[v] = z, n.spotShadowMap[v] = W, E++;
        }
        v++;
      } else if (D.isRectAreaLight) {
        const X = t.get(D);
        X.color.copy(k).multiplyScalar(H), X.halfWidth.set(D.width * 0.5, 0, 0), X.halfHeight.set(0, D.height * 0.5, 0), n.rectArea[p] = X, p++;
      } else if (D.isPointLight) {
        const X = t.get(D);
        if (X.color.copy(D.color).multiplyScalar(D.intensity), X.distance = D.distance, X.decay = D.decay, D.castShadow) {
          const j = D.shadow, z = e.get(D);
          z.shadowIntensity = j.intensity, z.shadowBias = j.bias, z.shadowNormalBias = j.normalBias, z.shadowRadius = j.radius, z.shadowMapSize = j.mapSize, z.shadowCameraNear = j.camera.near, z.shadowCameraFar = j.camera.far, n.pointShadow[_] = z, n.pointShadowMap[_] = W, n.pointShadowMatrix[_] = D.shadow.matrix, A++;
        }
        n.point[_] = X, _++;
      } else if (D.isHemisphereLight) {
        const X = t.get(D);
        X.skyColor.copy(D.color).multiplyScalar(H), X.groundColor.copy(D.groundColor).multiplyScalar(H), n.hemi[d] = X, d++;
      }
    }
    p > 0 && (i.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = at.LTC_FLOAT_1, n.rectAreaLTC2 = at.LTC_FLOAT_2) : (n.rectAreaLTC1 = at.LTC_HALF_1, n.rectAreaLTC2 = at.LTC_HALF_2)), n.ambient[0] = h, n.ambient[1] = u, n.ambient[2] = f;
    const N = n.hash;
    (N.directionalLength !== m || N.pointLength !== _ || N.spotLength !== v || N.rectAreaLength !== p || N.hemiLength !== d || N.numDirectionalShadows !== T || N.numPointShadows !== A || N.numSpotShadows !== E || N.numSpotMaps !== b || N.numLightProbes !== C) && (n.directional.length = m, n.spot.length = v, n.rectArea.length = p, n.point.length = _, n.hemi.length = d, n.directionalShadow.length = T, n.directionalShadowMap.length = T, n.pointShadow.length = A, n.pointShadowMap.length = A, n.spotShadow.length = E, n.spotShadowMap.length = E, n.directionalShadowMatrix.length = T, n.pointShadowMatrix.length = A, n.spotLightMatrix.length = E + b - R, n.spotLightMap.length = b, n.numSpotLightShadowsWithMaps = R, n.numLightProbes = C, N.directionalLength = m, N.pointLength = _, N.spotLength = v, N.rectAreaLength = p, N.hemiLength = d, N.numDirectionalShadows = T, N.numPointShadows = A, N.numSpotShadows = E, N.numSpotMaps = b, N.numLightProbes = C, n.version = bm++);
  }
  function l(c, h) {
    let u = 0, f = 0, m = 0, _ = 0, v = 0;
    const p = h.matrixWorldInverse;
    for (let d = 0, T = c.length; d < T; d++) {
      const A = c[d];
      if (A.isDirectionalLight) {
        const E = n.directional[u];
        E.direction.setFromMatrixPosition(A.matrixWorld), s.setFromMatrixPosition(A.target.matrixWorld), E.direction.sub(s), E.direction.transformDirection(p), u++;
      } else if (A.isSpotLight) {
        const E = n.spot[m];
        E.position.setFromMatrixPosition(A.matrixWorld), E.position.applyMatrix4(p), E.direction.setFromMatrixPosition(A.matrixWorld), s.setFromMatrixPosition(A.target.matrixWorld), E.direction.sub(s), E.direction.transformDirection(p), m++;
      } else if (A.isRectAreaLight) {
        const E = n.rectArea[_];
        E.position.setFromMatrixPosition(A.matrixWorld), E.position.applyMatrix4(p), o.identity(), r.copy(A.matrixWorld), r.premultiply(p), o.extractRotation(r), E.halfWidth.set(A.width * 0.5, 0, 0), E.halfHeight.set(0, A.height * 0.5, 0), E.halfWidth.applyMatrix4(o), E.halfHeight.applyMatrix4(o), _++;
      } else if (A.isPointLight) {
        const E = n.point[f];
        E.position.setFromMatrixPosition(A.matrixWorld), E.position.applyMatrix4(p), f++;
      } else if (A.isHemisphereLight) {
        const E = n.hemi[v];
        E.direction.setFromMatrixPosition(A.matrixWorld), E.direction.transformDirection(p), v++;
      }
    }
  }
  return {
    setup: a,
    setupView: l,
    state: n
  };
}
function hl(i) {
  const t = new Am(i), e = [], n = [];
  function s(h) {
    c.camera = h, e.length = 0, n.length = 0;
  }
  function r(h) {
    e.push(h);
  }
  function o(h) {
    n.push(h);
  }
  function a() {
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
    init: s,
    state: c,
    setupLights: a,
    setupLightsView: l,
    pushLight: r,
    pushShadow: o
  };
}
function wm(i) {
  let t = /* @__PURE__ */ new WeakMap();
  function e(s, r = 0) {
    const o = t.get(s);
    let a;
    return o === void 0 ? (a = new hl(i), t.set(s, [a])) : r >= o.length ? (a = new hl(i), o.push(a)) : a = o[r], a;
  }
  function n() {
    t = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: e,
    dispose: n
  };
}
const Rm = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, Cm = `uniform sampler2D shadow_pass;
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
function Pm(i, t, e) {
  let n = new Ga();
  const s = new Dt(), r = new Dt(), o = new fe(), a = new Kh({ depthPacking: Yc }), l = new Zh(), c = {}, h = e.maxTextureSize, u = { [Hn]: ze, [ze]: Hn, [hn]: hn }, f = new Gn({
    defines: {
      VSM_SAMPLES: 8
    },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new Dt() },
      radius: { value: 4 }
    },
    vertexShader: Rm,
    fragmentShader: Cm
  }), m = f.clone();
  m.defines.HORIZONTAL_PASS = 1;
  const _ = new on();
  _.setAttribute(
    "position",
    new an(
      new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]),
      3
    )
  );
  const v = new Xe(_, f), p = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = Ml;
  let d = this.type;
  this.render = function(R, C, N) {
    if (p.enabled === !1 || p.autoUpdate === !1 && p.needsUpdate === !1 || R.length === 0) return;
    const M = i.getRenderTarget(), S = i.getActiveCubeFace(), D = i.getActiveMipmapLevel(), k = i.state;
    k.setBlending(kn), k.buffers.depth.getReversed() === !0 ? k.buffers.color.setClear(0, 0, 0, 0) : k.buffers.color.setClear(1, 1, 1, 1), k.buffers.depth.setTest(!0), k.setScissorTest(!1);
    const H = d !== wn && this.type === wn, Y = d === wn && this.type !== wn;
    for (let W = 0, X = R.length; W < X; W++) {
      const j = R[W], z = j.shadow;
      if (z === void 0) {
        console.warn("THREE.WebGLShadowMap:", j, "has no shadow.");
        continue;
      }
      if (z.autoUpdate === !1 && z.needsUpdate === !1) continue;
      s.copy(z.mapSize);
      const st = z.getFrameExtents();
      if (s.multiply(st), r.copy(z.mapSize), (s.x > h || s.y > h) && (s.x > h && (r.x = Math.floor(h / st.x), s.x = r.x * st.x, z.mapSize.x = r.x), s.y > h && (r.y = Math.floor(h / st.y), s.y = r.y * st.y, z.mapSize.y = r.y)), z.map === null || H === !0 || Y === !0) {
        const _t = this.type !== wn ? { minFilter: rn, magFilter: rn } : {};
        z.map !== null && z.map.dispose(), z.map = new ai(s.x, s.y, _t), z.map.texture.name = j.name + ".shadowMap", z.camera.updateProjectionMatrix();
      }
      i.setRenderTarget(z.map), i.clear();
      const ht = z.getViewportCount();
      for (let _t = 0; _t < ht; _t++) {
        const Ht = z.getViewport(_t);
        o.set(
          r.x * Ht.x,
          r.y * Ht.y,
          r.x * Ht.z,
          r.y * Ht.w
        ), k.viewport(o), z.updateMatrices(j, _t), n = z.getFrustum(), E(C, N, z.camera, j, this.type);
      }
      z.isPointLightShadow !== !0 && this.type === wn && T(z, N), z.needsUpdate = !1;
    }
    d = this.type, p.needsUpdate = !1, i.setRenderTarget(M, S, D);
  };
  function T(R, C) {
    const N = t.update(v);
    f.defines.VSM_SAMPLES !== R.blurSamples && (f.defines.VSM_SAMPLES = R.blurSamples, m.defines.VSM_SAMPLES = R.blurSamples, f.needsUpdate = !0, m.needsUpdate = !0), R.mapPass === null && (R.mapPass = new ai(s.x, s.y)), f.uniforms.shadow_pass.value = R.map.texture, f.uniforms.resolution.value = R.mapSize, f.uniforms.radius.value = R.radius, i.setRenderTarget(R.mapPass), i.clear(), i.renderBufferDirect(C, null, N, f, v, null), m.uniforms.shadow_pass.value = R.mapPass.texture, m.uniforms.resolution.value = R.mapSize, m.uniforms.radius.value = R.radius, i.setRenderTarget(R.map), i.clear(), i.renderBufferDirect(C, null, N, m, v, null);
  }
  function A(R, C, N, M) {
    let S = null;
    const D = N.isPointLight === !0 ? R.customDistanceMaterial : R.customDepthMaterial;
    if (D !== void 0)
      S = D;
    else if (S = N.isPointLight === !0 ? l : a, i.localClippingEnabled && C.clipShadows === !0 && Array.isArray(C.clippingPlanes) && C.clippingPlanes.length !== 0 || C.displacementMap && C.displacementScale !== 0 || C.alphaMap && C.alphaTest > 0 || C.map && C.alphaTest > 0 || C.alphaToCoverage === !0) {
      const k = S.uuid, H = C.uuid;
      let Y = c[k];
      Y === void 0 && (Y = {}, c[k] = Y);
      let W = Y[H];
      W === void 0 && (W = S.clone(), Y[H] = W, C.addEventListener("dispose", b)), S = W;
    }
    if (S.visible = C.visible, S.wireframe = C.wireframe, M === wn ? S.side = C.shadowSide !== null ? C.shadowSide : C.side : S.side = C.shadowSide !== null ? C.shadowSide : u[C.side], S.alphaMap = C.alphaMap, S.alphaTest = C.alphaToCoverage === !0 ? 0.5 : C.alphaTest, S.map = C.map, S.clipShadows = C.clipShadows, S.clippingPlanes = C.clippingPlanes, S.clipIntersection = C.clipIntersection, S.displacementMap = C.displacementMap, S.displacementScale = C.displacementScale, S.displacementBias = C.displacementBias, S.wireframeLinewidth = C.wireframeLinewidth, S.linewidth = C.linewidth, N.isPointLight === !0 && S.isMeshDistanceMaterial === !0) {
      const k = i.properties.get(S);
      k.light = N;
    }
    return S;
  }
  function E(R, C, N, M, S) {
    if (R.visible === !1) return;
    if (R.layers.test(C.layers) && (R.isMesh || R.isLine || R.isPoints) && (R.castShadow || R.receiveShadow && S === wn) && (!R.frustumCulled || n.intersectsObject(R))) {
      R.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse, R.matrixWorld);
      const H = t.update(R), Y = R.material;
      if (Array.isArray(Y)) {
        const W = H.groups;
        for (let X = 0, j = W.length; X < j; X++) {
          const z = W[X], st = Y[z.materialIndex];
          if (st && st.visible) {
            const ht = A(R, st, M, S);
            R.onBeforeShadow(i, R, C, N, H, ht, z), i.renderBufferDirect(N, null, H, ht, R, z), R.onAfterShadow(i, R, C, N, H, ht, z);
          }
        }
      } else if (Y.visible) {
        const W = A(R, Y, M, S);
        R.onBeforeShadow(i, R, C, N, H, W, null), i.renderBufferDirect(N, null, H, W, R, null), R.onAfterShadow(i, R, C, N, H, W, null);
      }
    }
    const k = R.children;
    for (let H = 0, Y = k.length; H < Y; H++)
      E(k[H], C, N, M, S);
  }
  function b(R) {
    R.target.removeEventListener("dispose", b);
    for (const N in c) {
      const M = c[N], S = R.target.uuid;
      S in M && (M[S].dispose(), delete M[S]);
    }
  }
}
const Dm = {
  [Hr]: Vr,
  [Gr]: $r,
  [Wr]: qr,
  [Ni]: Xr,
  [Vr]: Hr,
  [$r]: Gr,
  [qr]: Wr,
  [Xr]: Ni
};
function Lm(i, t) {
  function e() {
    let P = !1;
    const et = new fe();
    let rt = null;
    const ft = new fe(0, 0, 0, 0);
    return {
      setMask: function(J) {
        rt !== J && !P && (i.colorMask(J, J, J, J), rt = J);
      },
      setLocked: function(J) {
        P = J;
      },
      setClear: function(J, q, mt, Lt, se) {
        se === !0 && (J *= Lt, q *= Lt, mt *= Lt), et.set(J, q, mt, Lt), ft.equals(et) === !1 && (i.clearColor(J, q, mt, Lt), ft.copy(et));
      },
      reset: function() {
        P = !1, rt = null, ft.set(-1, 0, 0, 0);
      }
    };
  }
  function n() {
    let P = !1, et = !1, rt = null, ft = null, J = null;
    return {
      setReversed: function(q) {
        if (et !== q) {
          const mt = t.get("EXT_clip_control");
          q ? mt.clipControlEXT(mt.LOWER_LEFT_EXT, mt.ZERO_TO_ONE_EXT) : mt.clipControlEXT(mt.LOWER_LEFT_EXT, mt.NEGATIVE_ONE_TO_ONE_EXT), et = q;
          const Lt = J;
          J = null, this.setClear(Lt);
        }
      },
      getReversed: function() {
        return et;
      },
      setTest: function(q) {
        q ? K(i.DEPTH_TEST) : ut(i.DEPTH_TEST);
      },
      setMask: function(q) {
        rt !== q && !P && (i.depthMask(q), rt = q);
      },
      setFunc: function(q) {
        if (et && (q = Dm[q]), ft !== q) {
          switch (q) {
            case Hr:
              i.depthFunc(i.NEVER);
              break;
            case Vr:
              i.depthFunc(i.ALWAYS);
              break;
            case Gr:
              i.depthFunc(i.LESS);
              break;
            case Ni:
              i.depthFunc(i.LEQUAL);
              break;
            case Wr:
              i.depthFunc(i.EQUAL);
              break;
            case Xr:
              i.depthFunc(i.GEQUAL);
              break;
            case $r:
              i.depthFunc(i.GREATER);
              break;
            case qr:
              i.depthFunc(i.NOTEQUAL);
              break;
            default:
              i.depthFunc(i.LEQUAL);
          }
          ft = q;
        }
      },
      setLocked: function(q) {
        P = q;
      },
      setClear: function(q) {
        J !== q && (et && (q = 1 - q), i.clearDepth(q), J = q);
      },
      reset: function() {
        P = !1, rt = null, ft = null, J = null, et = !1;
      }
    };
  }
  function s() {
    let P = !1, et = null, rt = null, ft = null, J = null, q = null, mt = null, Lt = null, se = null;
    return {
      setTest: function(Kt) {
        P || (Kt ? K(i.STENCIL_TEST) : ut(i.STENCIL_TEST));
      },
      setMask: function(Kt) {
        et !== Kt && !P && (i.stencilMask(Kt), et = Kt);
      },
      setFunc: function(Kt, Mn, ln) {
        (rt !== Kt || ft !== Mn || J !== ln) && (i.stencilFunc(Kt, Mn, ln), rt = Kt, ft = Mn, J = ln);
      },
      setOp: function(Kt, Mn, ln) {
        (q !== Kt || mt !== Mn || Lt !== ln) && (i.stencilOp(Kt, Mn, ln), q = Kt, mt = Mn, Lt = ln);
      },
      setLocked: function(Kt) {
        P = Kt;
      },
      setClear: function(Kt) {
        se !== Kt && (i.clearStencil(Kt), se = Kt);
      },
      reset: function() {
        P = !1, et = null, rt = null, ft = null, J = null, q = null, mt = null, Lt = null, se = null;
      }
    };
  }
  const r = new e(), o = new n(), a = new s(), l = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap();
  let h = {}, u = {}, f = /* @__PURE__ */ new WeakMap(), m = [], _ = null, v = !1, p = null, d = null, T = null, A = null, E = null, b = null, R = null, C = new qt(0, 0, 0), N = 0, M = !1, S = null, D = null, k = null, H = null, Y = null;
  const W = i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let X = !1, j = 0;
  const z = i.getParameter(i.VERSION);
  z.indexOf("WebGL") !== -1 ? (j = parseFloat(/^WebGL (\d)/.exec(z)[1]), X = j >= 1) : z.indexOf("OpenGL ES") !== -1 && (j = parseFloat(/^OpenGL ES (\d)/.exec(z)[1]), X = j >= 2);
  let st = null, ht = {};
  const _t = i.getParameter(i.SCISSOR_BOX), Ht = i.getParameter(i.VIEWPORT), Jt = new fe().fromArray(_t), Gt = new fe().fromArray(Ht);
  function Ft(P, et, rt, ft) {
    const J = new Uint8Array(4), q = i.createTexture();
    i.bindTexture(P, q), i.texParameteri(P, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(P, i.TEXTURE_MAG_FILTER, i.NEAREST);
    for (let mt = 0; mt < rt; mt++)
      P === i.TEXTURE_3D || P === i.TEXTURE_2D_ARRAY ? i.texImage3D(et, 0, i.RGBA, 1, 1, ft, 0, i.RGBA, i.UNSIGNED_BYTE, J) : i.texImage2D(et + mt, 0, i.RGBA, 1, 1, 0, i.RGBA, i.UNSIGNED_BYTE, J);
    return q;
  }
  const $ = {};
  $[i.TEXTURE_2D] = Ft(i.TEXTURE_2D, i.TEXTURE_2D, 1), $[i.TEXTURE_CUBE_MAP] = Ft(i.TEXTURE_CUBE_MAP, i.TEXTURE_CUBE_MAP_POSITIVE_X, 6), $[i.TEXTURE_2D_ARRAY] = Ft(i.TEXTURE_2D_ARRAY, i.TEXTURE_2D_ARRAY, 1, 1), $[i.TEXTURE_3D] = Ft(i.TEXTURE_3D, i.TEXTURE_3D, 1, 1), r.setClear(0, 0, 0, 1), o.setClear(1), a.setClear(0), K(i.DEPTH_TEST), o.setFunc(Ni), Rt(!1), gt(so), K(i.CULL_FACE), le(kn);
  function K(P) {
    h[P] !== !0 && (i.enable(P), h[P] = !0);
  }
  function ut(P) {
    h[P] !== !1 && (i.disable(P), h[P] = !1);
  }
  function Pt(P, et) {
    return u[P] !== et ? (i.bindFramebuffer(P, et), u[P] = et, P === i.DRAW_FRAMEBUFFER && (u[i.FRAMEBUFFER] = et), P === i.FRAMEBUFFER && (u[i.DRAW_FRAMEBUFFER] = et), !0) : !1;
  }
  function yt(P, et) {
    let rt = m, ft = !1;
    if (P) {
      rt = f.get(et), rt === void 0 && (rt = [], f.set(et, rt));
      const J = P.textures;
      if (rt.length !== J.length || rt[0] !== i.COLOR_ATTACHMENT0) {
        for (let q = 0, mt = J.length; q < mt; q++)
          rt[q] = i.COLOR_ATTACHMENT0 + q;
        rt.length = J.length, ft = !0;
      }
    } else
      rt[0] !== i.BACK && (rt[0] = i.BACK, ft = !0);
    ft && i.drawBuffers(rt);
  }
  function $t(P) {
    return _ !== P ? (i.useProgram(P), _ = P, !0) : !1;
  }
  const we = {
    [Qn]: i.FUNC_ADD,
    [Mc]: i.FUNC_SUBTRACT,
    [Sc]: i.FUNC_REVERSE_SUBTRACT
  };
  we[Ec] = i.MIN, we[yc] = i.MAX;
  const w = {
    [bc]: i.ZERO,
    [Tc]: i.ONE,
    [Ac]: i.SRC_COLOR,
    [kr]: i.SRC_ALPHA,
    [Lc]: i.SRC_ALPHA_SATURATE,
    [Pc]: i.DST_COLOR,
    [Rc]: i.DST_ALPHA,
    [wc]: i.ONE_MINUS_SRC_COLOR,
    [zr]: i.ONE_MINUS_SRC_ALPHA,
    [Dc]: i.ONE_MINUS_DST_COLOR,
    [Cc]: i.ONE_MINUS_DST_ALPHA,
    [Ic]: i.CONSTANT_COLOR,
    [Uc]: i.ONE_MINUS_CONSTANT_COLOR,
    [Nc]: i.CONSTANT_ALPHA,
    [Fc]: i.ONE_MINUS_CONSTANT_ALPHA
  };
  function le(P, et, rt, ft, J, q, mt, Lt, se, Kt) {
    if (P === kn) {
      v === !0 && (ut(i.BLEND), v = !1);
      return;
    }
    if (v === !1 && (K(i.BLEND), v = !0), P !== xc) {
      if (P !== p || Kt !== M) {
        if ((d !== Qn || E !== Qn) && (i.blendEquation(i.FUNC_ADD), d = Qn, E = Qn), Kt)
          switch (P) {
            case Di:
              i.blendFuncSeparate(i.ONE, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case ro:
              i.blendFunc(i.ONE, i.ONE);
              break;
            case ao:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case oo:
              i.blendFuncSeparate(i.DST_COLOR, i.ONE_MINUS_SRC_ALPHA, i.ZERO, i.ONE);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", P);
              break;
          }
        else
          switch (P) {
            case Di:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case ro:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE, i.ONE, i.ONE);
              break;
            case ao:
              console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");
              break;
            case oo:
              console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", P);
              break;
          }
        T = null, A = null, b = null, R = null, C.set(0, 0, 0), N = 0, p = P, M = Kt;
      }
      return;
    }
    J = J || et, q = q || rt, mt = mt || ft, (et !== d || J !== E) && (i.blendEquationSeparate(we[et], we[J]), d = et, E = J), (rt !== T || ft !== A || q !== b || mt !== R) && (i.blendFuncSeparate(w[rt], w[ft], w[q], w[mt]), T = rt, A = ft, b = q, R = mt), (Lt.equals(C) === !1 || se !== N) && (i.blendColor(Lt.r, Lt.g, Lt.b, se), C.copy(Lt), N = se), p = P, M = !1;
  }
  function Ut(P, et) {
    P.side === hn ? ut(i.CULL_FACE) : K(i.CULL_FACE);
    let rt = P.side === ze;
    et && (rt = !rt), Rt(rt), P.blending === Di && P.transparent === !1 ? le(kn) : le(P.blending, P.blendEquation, P.blendSrc, P.blendDst, P.blendEquationAlpha, P.blendSrcAlpha, P.blendDstAlpha, P.blendColor, P.blendAlpha, P.premultipliedAlpha), o.setFunc(P.depthFunc), o.setTest(P.depthTest), o.setMask(P.depthWrite), r.setMask(P.colorWrite);
    const ft = P.stencilWrite;
    a.setTest(ft), ft && (a.setMask(P.stencilWriteMask), a.setFunc(P.stencilFunc, P.stencilRef, P.stencilFuncMask), a.setOp(P.stencilFail, P.stencilZFail, P.stencilZPass)), vt(P.polygonOffset, P.polygonOffsetFactor, P.polygonOffsetUnits), P.alphaToCoverage === !0 ? K(i.SAMPLE_ALPHA_TO_COVERAGE) : ut(i.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function Rt(P) {
    S !== P && (P ? i.frontFace(i.CW) : i.frontFace(i.CCW), S = P);
  }
  function gt(P) {
    P !== _c ? (K(i.CULL_FACE), P !== D && (P === so ? i.cullFace(i.BACK) : P === gc ? i.cullFace(i.FRONT) : i.cullFace(i.FRONT_AND_BACK))) : ut(i.CULL_FACE), D = P;
  }
  function ce(P) {
    P !== k && (X && i.lineWidth(P), k = P);
  }
  function vt(P, et, rt) {
    P ? (K(i.POLYGON_OFFSET_FILL), (H !== et || Y !== rt) && (i.polygonOffset(et, rt), H = et, Y = rt)) : ut(i.POLYGON_OFFSET_FILL);
  }
  function kt(P) {
    P ? K(i.SCISSOR_TEST) : ut(i.SCISSOR_TEST);
  }
  function Ee(P) {
    P === void 0 && (P = i.TEXTURE0 + W - 1), st !== P && (i.activeTexture(P), st = P);
  }
  function pe(P, et, rt) {
    rt === void 0 && (st === null ? rt = i.TEXTURE0 + W - 1 : rt = st);
    let ft = ht[rt];
    ft === void 0 && (ft = { type: void 0, texture: void 0 }, ht[rt] = ft), (ft.type !== P || ft.texture !== et) && (st !== rt && (i.activeTexture(rt), st = rt), i.bindTexture(P, et || $[P]), ft.type = P, ft.texture = et);
  }
  function y() {
    const P = ht[st];
    P !== void 0 && P.type !== void 0 && (i.bindTexture(P.type, null), P.type = void 0, P.texture = void 0);
  }
  function g() {
    try {
      i.compressedTexImage2D(...arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function F() {
    try {
      i.compressedTexImage3D(...arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function G() {
    try {
      i.texSubImage2D(...arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function Z() {
    try {
      i.texSubImage3D(...arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function V() {
    try {
      i.compressedTexSubImage2D(...arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function Et() {
    try {
      i.compressedTexSubImage3D(...arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function it() {
    try {
      i.texStorage2D(...arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function xt() {
    try {
      i.texStorage3D(...arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function Mt() {
    try {
      i.texImage2D(...arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function tt() {
    try {
      i.texImage3D(...arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function ct(P) {
    Jt.equals(P) === !1 && (i.scissor(P.x, P.y, P.z, P.w), Jt.copy(P));
  }
  function wt(P) {
    Gt.equals(P) === !1 && (i.viewport(P.x, P.y, P.z, P.w), Gt.copy(P));
  }
  function St(P, et) {
    let rt = c.get(et);
    rt === void 0 && (rt = /* @__PURE__ */ new WeakMap(), c.set(et, rt));
    let ft = rt.get(P);
    ft === void 0 && (ft = i.getUniformBlockIndex(et, P.name), rt.set(P, ft));
  }
  function ot(P, et) {
    const ft = c.get(et).get(P);
    l.get(et) !== ft && (i.uniformBlockBinding(et, ft, P.__bindingPointIndex), l.set(et, ft));
  }
  function Ot() {
    i.disable(i.BLEND), i.disable(i.CULL_FACE), i.disable(i.DEPTH_TEST), i.disable(i.POLYGON_OFFSET_FILL), i.disable(i.SCISSOR_TEST), i.disable(i.STENCIL_TEST), i.disable(i.SAMPLE_ALPHA_TO_COVERAGE), i.blendEquation(i.FUNC_ADD), i.blendFunc(i.ONE, i.ZERO), i.blendFuncSeparate(i.ONE, i.ZERO, i.ONE, i.ZERO), i.blendColor(0, 0, 0, 0), i.colorMask(!0, !0, !0, !0), i.clearColor(0, 0, 0, 0), i.depthMask(!0), i.depthFunc(i.LESS), o.setReversed(!1), i.clearDepth(1), i.stencilMask(4294967295), i.stencilFunc(i.ALWAYS, 0, 4294967295), i.stencilOp(i.KEEP, i.KEEP, i.KEEP), i.clearStencil(0), i.cullFace(i.BACK), i.frontFace(i.CCW), i.polygonOffset(0, 0), i.activeTexture(i.TEXTURE0), i.bindFramebuffer(i.FRAMEBUFFER, null), i.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), i.bindFramebuffer(i.READ_FRAMEBUFFER, null), i.useProgram(null), i.lineWidth(1), i.scissor(0, 0, i.canvas.width, i.canvas.height), i.viewport(0, 0, i.canvas.width, i.canvas.height), h = {}, st = null, ht = {}, u = {}, f = /* @__PURE__ */ new WeakMap(), m = [], _ = null, v = !1, p = null, d = null, T = null, A = null, E = null, b = null, R = null, C = new qt(0, 0, 0), N = 0, M = !1, S = null, D = null, k = null, H = null, Y = null, Jt.set(0, 0, i.canvas.width, i.canvas.height), Gt.set(0, 0, i.canvas.width, i.canvas.height), r.reset(), o.reset(), a.reset();
  }
  return {
    buffers: {
      color: r,
      depth: o,
      stencil: a
    },
    enable: K,
    disable: ut,
    bindFramebuffer: Pt,
    drawBuffers: yt,
    useProgram: $t,
    setBlending: le,
    setMaterial: Ut,
    setFlipSided: Rt,
    setCullFace: gt,
    setLineWidth: ce,
    setPolygonOffset: vt,
    setScissorTest: kt,
    activeTexture: Ee,
    bindTexture: pe,
    unbindTexture: y,
    compressedTexImage2D: g,
    compressedTexImage3D: F,
    texImage2D: Mt,
    texImage3D: tt,
    updateUBOMapping: St,
    uniformBlockBinding: ot,
    texStorage2D: it,
    texStorage3D: xt,
    texSubImage2D: G,
    texSubImage3D: Z,
    compressedTexSubImage2D: V,
    compressedTexSubImage3D: Et,
    scissor: ct,
    viewport: wt,
    reset: Ot
  };
}
function Im(i, t, e, n, s, r, o) {
  const a = t.has("WEBGL_multisampled_render_to_texture") ? t.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), c = new Dt(), h = /* @__PURE__ */ new WeakMap();
  let u;
  const f = /* @__PURE__ */ new WeakMap();
  let m = !1;
  try {
    m = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
  }
  function _(y, g) {
    return m ? (
      // eslint-disable-next-line compat/compat
      new OffscreenCanvas(y, g)
    ) : qs("canvas");
  }
  function v(y, g, F) {
    let G = 1;
    const Z = pe(y);
    if ((Z.width > F || Z.height > F) && (G = F / Math.max(Z.width, Z.height)), G < 1)
      if (typeof HTMLImageElement < "u" && y instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && y instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && y instanceof ImageBitmap || typeof VideoFrame < "u" && y instanceof VideoFrame) {
        const V = Math.floor(G * Z.width), Et = Math.floor(G * Z.height);
        u === void 0 && (u = _(V, Et));
        const it = g ? _(V, Et) : u;
        return it.width = V, it.height = Et, it.getContext("2d").drawImage(y, 0, 0, V, Et), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + Z.width + "x" + Z.height + ") to (" + V + "x" + Et + ")."), it;
      } else
        return "data" in y && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + Z.width + "x" + Z.height + ")."), y;
    return y;
  }
  function p(y) {
    return y.generateMipmaps;
  }
  function d(y) {
    i.generateMipmap(y);
  }
  function T(y) {
    return y.isWebGLCubeRenderTarget ? i.TEXTURE_CUBE_MAP : y.isWebGL3DRenderTarget ? i.TEXTURE_3D : y.isWebGLArrayRenderTarget || y.isCompressedArrayTexture ? i.TEXTURE_2D_ARRAY : i.TEXTURE_2D;
  }
  function A(y, g, F, G, Z = !1) {
    if (y !== null) {
      if (i[y] !== void 0) return i[y];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + y + "'");
    }
    let V = g;
    if (g === i.RED && (F === i.FLOAT && (V = i.R32F), F === i.HALF_FLOAT && (V = i.R16F), F === i.UNSIGNED_BYTE && (V = i.R8)), g === i.RED_INTEGER && (F === i.UNSIGNED_BYTE && (V = i.R8UI), F === i.UNSIGNED_SHORT && (V = i.R16UI), F === i.UNSIGNED_INT && (V = i.R32UI), F === i.BYTE && (V = i.R8I), F === i.SHORT && (V = i.R16I), F === i.INT && (V = i.R32I)), g === i.RG && (F === i.FLOAT && (V = i.RG32F), F === i.HALF_FLOAT && (V = i.RG16F), F === i.UNSIGNED_BYTE && (V = i.RG8)), g === i.RG_INTEGER && (F === i.UNSIGNED_BYTE && (V = i.RG8UI), F === i.UNSIGNED_SHORT && (V = i.RG16UI), F === i.UNSIGNED_INT && (V = i.RG32UI), F === i.BYTE && (V = i.RG8I), F === i.SHORT && (V = i.RG16I), F === i.INT && (V = i.RG32I)), g === i.RGB_INTEGER && (F === i.UNSIGNED_BYTE && (V = i.RGB8UI), F === i.UNSIGNED_SHORT && (V = i.RGB16UI), F === i.UNSIGNED_INT && (V = i.RGB32UI), F === i.BYTE && (V = i.RGB8I), F === i.SHORT && (V = i.RGB16I), F === i.INT && (V = i.RGB32I)), g === i.RGBA_INTEGER && (F === i.UNSIGNED_BYTE && (V = i.RGBA8UI), F === i.UNSIGNED_SHORT && (V = i.RGBA16UI), F === i.UNSIGNED_INT && (V = i.RGBA32UI), F === i.BYTE && (V = i.RGBA8I), F === i.SHORT && (V = i.RGBA16I), F === i.INT && (V = i.RGBA32I)), g === i.RGB && (F === i.UNSIGNED_INT_5_9_9_9_REV && (V = i.RGB9_E5), F === i.UNSIGNED_INT_10F_11F_11F_REV && (V = i.R11F_G11F_B10F)), g === i.RGBA) {
      const Et = Z ? Xs : jt.getTransfer(G);
      F === i.FLOAT && (V = i.RGBA32F), F === i.HALF_FLOAT && (V = i.RGBA16F), F === i.UNSIGNED_BYTE && (V = Et === te ? i.SRGB8_ALPHA8 : i.RGBA8), F === i.UNSIGNED_SHORT_4_4_4_4 && (V = i.RGBA4), F === i.UNSIGNED_SHORT_5_5_5_1 && (V = i.RGB5_A1);
    }
    return (V === i.R16F || V === i.R32F || V === i.RG16F || V === i.RG32F || V === i.RGBA16F || V === i.RGBA32F) && t.get("EXT_color_buffer_float"), V;
  }
  function E(y, g) {
    let F;
    return y ? g === null || g === si || g === ns ? F = i.DEPTH24_STENCIL8 : g === Cn ? F = i.DEPTH32F_STENCIL8 : g === es && (F = i.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : g === null || g === si || g === ns ? F = i.DEPTH_COMPONENT24 : g === Cn ? F = i.DEPTH_COMPONENT32F : g === es && (F = i.DEPTH_COMPONENT16), F;
  }
  function b(y, g) {
    return p(y) === !0 || y.isFramebufferTexture && y.minFilter !== rn && y.minFilter !== fn ? Math.log2(Math.max(g.width, g.height)) + 1 : y.mipmaps !== void 0 && y.mipmaps.length > 0 ? y.mipmaps.length : y.isCompressedTexture && Array.isArray(y.image) ? g.mipmaps.length : 1;
  }
  function R(y) {
    const g = y.target;
    g.removeEventListener("dispose", R), N(g), g.isVideoTexture && h.delete(g);
  }
  function C(y) {
    const g = y.target;
    g.removeEventListener("dispose", C), S(g);
  }
  function N(y) {
    const g = n.get(y);
    if (g.__webglInit === void 0) return;
    const F = y.source, G = f.get(F);
    if (G) {
      const Z = G[g.__cacheKey];
      Z.usedTimes--, Z.usedTimes === 0 && M(y), Object.keys(G).length === 0 && f.delete(F);
    }
    n.remove(y);
  }
  function M(y) {
    const g = n.get(y);
    i.deleteTexture(g.__webglTexture);
    const F = y.source, G = f.get(F);
    delete G[g.__cacheKey], o.memory.textures--;
  }
  function S(y) {
    const g = n.get(y);
    if (y.depthTexture && (y.depthTexture.dispose(), n.remove(y.depthTexture)), y.isWebGLCubeRenderTarget)
      for (let G = 0; G < 6; G++) {
        if (Array.isArray(g.__webglFramebuffer[G]))
          for (let Z = 0; Z < g.__webglFramebuffer[G].length; Z++) i.deleteFramebuffer(g.__webglFramebuffer[G][Z]);
        else
          i.deleteFramebuffer(g.__webglFramebuffer[G]);
        g.__webglDepthbuffer && i.deleteRenderbuffer(g.__webglDepthbuffer[G]);
      }
    else {
      if (Array.isArray(g.__webglFramebuffer))
        for (let G = 0; G < g.__webglFramebuffer.length; G++) i.deleteFramebuffer(g.__webglFramebuffer[G]);
      else
        i.deleteFramebuffer(g.__webglFramebuffer);
      if (g.__webglDepthbuffer && i.deleteRenderbuffer(g.__webglDepthbuffer), g.__webglMultisampledFramebuffer && i.deleteFramebuffer(g.__webglMultisampledFramebuffer), g.__webglColorRenderbuffer)
        for (let G = 0; G < g.__webglColorRenderbuffer.length; G++)
          g.__webglColorRenderbuffer[G] && i.deleteRenderbuffer(g.__webglColorRenderbuffer[G]);
      g.__webglDepthRenderbuffer && i.deleteRenderbuffer(g.__webglDepthRenderbuffer);
    }
    const F = y.textures;
    for (let G = 0, Z = F.length; G < Z; G++) {
      const V = n.get(F[G]);
      V.__webglTexture && (i.deleteTexture(V.__webglTexture), o.memory.textures--), n.remove(F[G]);
    }
    n.remove(y);
  }
  let D = 0;
  function k() {
    D = 0;
  }
  function H() {
    const y = D;
    return y >= s.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + y + " texture units while this GPU supports only " + s.maxTextures), D += 1, y;
  }
  function Y(y) {
    const g = [];
    return g.push(y.wrapS), g.push(y.wrapT), g.push(y.wrapR || 0), g.push(y.magFilter), g.push(y.minFilter), g.push(y.anisotropy), g.push(y.internalFormat), g.push(y.format), g.push(y.type), g.push(y.generateMipmaps), g.push(y.premultiplyAlpha), g.push(y.flipY), g.push(y.unpackAlignment), g.push(y.colorSpace), g.join();
  }
  function W(y, g) {
    const F = n.get(y);
    if (y.isVideoTexture && kt(y), y.isRenderTargetTexture === !1 && y.isExternalTexture !== !0 && y.version > 0 && F.__version !== y.version) {
      const G = y.image;
      if (G === null)
        console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if (G.complete === !1)
        console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        $(F, y, g);
        return;
      }
    } else y.isExternalTexture && (F.__webglTexture = y.sourceTexture ? y.sourceTexture : null);
    e.bindTexture(i.TEXTURE_2D, F.__webglTexture, i.TEXTURE0 + g);
  }
  function X(y, g) {
    const F = n.get(y);
    if (y.isRenderTargetTexture === !1 && y.version > 0 && F.__version !== y.version) {
      $(F, y, g);
      return;
    }
    e.bindTexture(i.TEXTURE_2D_ARRAY, F.__webglTexture, i.TEXTURE0 + g);
  }
  function j(y, g) {
    const F = n.get(y);
    if (y.isRenderTargetTexture === !1 && y.version > 0 && F.__version !== y.version) {
      $(F, y, g);
      return;
    }
    e.bindTexture(i.TEXTURE_3D, F.__webglTexture, i.TEXTURE0 + g);
  }
  function z(y, g) {
    const F = n.get(y);
    if (y.version > 0 && F.__version !== y.version) {
      K(F, y, g);
      return;
    }
    e.bindTexture(i.TEXTURE_CUBE_MAP, F.__webglTexture, i.TEXTURE0 + g);
  }
  const st = {
    [Kr]: i.REPEAT,
    [ei]: i.CLAMP_TO_EDGE,
    [Zr]: i.MIRRORED_REPEAT
  }, ht = {
    [rn]: i.NEAREST,
    [$c]: i.NEAREST_MIPMAP_NEAREST,
    [fs]: i.NEAREST_MIPMAP_LINEAR,
    [fn]: i.LINEAR,
    [sr]: i.LINEAR_MIPMAP_NEAREST,
    [ni]: i.LINEAR_MIPMAP_LINEAR
  }, _t = {
    [Kc]: i.NEVER,
    [nh]: i.ALWAYS,
    [Zc]: i.LESS,
    [Ll]: i.LEQUAL,
    [Jc]: i.EQUAL,
    [eh]: i.GEQUAL,
    [Qc]: i.GREATER,
    [th]: i.NOTEQUAL
  };
  function Ht(y, g) {
    if (g.type === Cn && t.has("OES_texture_float_linear") === !1 && (g.magFilter === fn || g.magFilter === sr || g.magFilter === fs || g.magFilter === ni || g.minFilter === fn || g.minFilter === sr || g.minFilter === fs || g.minFilter === ni) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), i.texParameteri(y, i.TEXTURE_WRAP_S, st[g.wrapS]), i.texParameteri(y, i.TEXTURE_WRAP_T, st[g.wrapT]), (y === i.TEXTURE_3D || y === i.TEXTURE_2D_ARRAY) && i.texParameteri(y, i.TEXTURE_WRAP_R, st[g.wrapR]), i.texParameteri(y, i.TEXTURE_MAG_FILTER, ht[g.magFilter]), i.texParameteri(y, i.TEXTURE_MIN_FILTER, ht[g.minFilter]), g.compareFunction && (i.texParameteri(y, i.TEXTURE_COMPARE_MODE, i.COMPARE_REF_TO_TEXTURE), i.texParameteri(y, i.TEXTURE_COMPARE_FUNC, _t[g.compareFunction])), t.has("EXT_texture_filter_anisotropic") === !0) {
      if (g.magFilter === rn || g.minFilter !== fs && g.minFilter !== ni || g.type === Cn && t.has("OES_texture_float_linear") === !1) return;
      if (g.anisotropy > 1 || n.get(g).__currentAnisotropy) {
        const F = t.get("EXT_texture_filter_anisotropic");
        i.texParameterf(y, F.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(g.anisotropy, s.getMaxAnisotropy())), n.get(g).__currentAnisotropy = g.anisotropy;
      }
    }
  }
  function Jt(y, g) {
    let F = !1;
    y.__webglInit === void 0 && (y.__webglInit = !0, g.addEventListener("dispose", R));
    const G = g.source;
    let Z = f.get(G);
    Z === void 0 && (Z = {}, f.set(G, Z));
    const V = Y(g);
    if (V !== y.__cacheKey) {
      Z[V] === void 0 && (Z[V] = {
        texture: i.createTexture(),
        usedTimes: 0
      }, o.memory.textures++, F = !0), Z[V].usedTimes++;
      const Et = Z[y.__cacheKey];
      Et !== void 0 && (Z[y.__cacheKey].usedTimes--, Et.usedTimes === 0 && M(g)), y.__cacheKey = V, y.__webglTexture = Z[V].texture;
    }
    return F;
  }
  function Gt(y, g, F) {
    return Math.floor(Math.floor(y / F) / g);
  }
  function Ft(y, g, F, G) {
    const V = y.updateRanges;
    if (V.length === 0)
      e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, g.width, g.height, F, G, g.data);
    else {
      V.sort((tt, ct) => tt.start - ct.start);
      let Et = 0;
      for (let tt = 1; tt < V.length; tt++) {
        const ct = V[Et], wt = V[tt], St = ct.start + ct.count, ot = Gt(wt.start, g.width, 4), Ot = Gt(ct.start, g.width, 4);
        wt.start <= St + 1 && ot === Ot && Gt(wt.start + wt.count - 1, g.width, 4) === ot ? ct.count = Math.max(
          ct.count,
          wt.start + wt.count - ct.start
        ) : (++Et, V[Et] = wt);
      }
      V.length = Et + 1;
      const it = i.getParameter(i.UNPACK_ROW_LENGTH), xt = i.getParameter(i.UNPACK_SKIP_PIXELS), Mt = i.getParameter(i.UNPACK_SKIP_ROWS);
      i.pixelStorei(i.UNPACK_ROW_LENGTH, g.width);
      for (let tt = 0, ct = V.length; tt < ct; tt++) {
        const wt = V[tt], St = Math.floor(wt.start / 4), ot = Math.ceil(wt.count / 4), Ot = St % g.width, P = Math.floor(St / g.width), et = ot, rt = 1;
        i.pixelStorei(i.UNPACK_SKIP_PIXELS, Ot), i.pixelStorei(i.UNPACK_SKIP_ROWS, P), e.texSubImage2D(i.TEXTURE_2D, 0, Ot, P, et, rt, F, G, g.data);
      }
      y.clearUpdateRanges(), i.pixelStorei(i.UNPACK_ROW_LENGTH, it), i.pixelStorei(i.UNPACK_SKIP_PIXELS, xt), i.pixelStorei(i.UNPACK_SKIP_ROWS, Mt);
    }
  }
  function $(y, g, F) {
    let G = i.TEXTURE_2D;
    (g.isDataArrayTexture || g.isCompressedArrayTexture) && (G = i.TEXTURE_2D_ARRAY), g.isData3DTexture && (G = i.TEXTURE_3D);
    const Z = Jt(y, g), V = g.source;
    e.bindTexture(G, y.__webglTexture, i.TEXTURE0 + F);
    const Et = n.get(V);
    if (V.version !== Et.__version || Z === !0) {
      e.activeTexture(i.TEXTURE0 + F);
      const it = jt.getPrimaries(jt.workingColorSpace), xt = g.colorSpace === Bn ? null : jt.getPrimaries(g.colorSpace), Mt = g.colorSpace === Bn || it === xt ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, g.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, g.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, g.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, Mt);
      let tt = v(g.image, !1, s.maxTextureSize);
      tt = Ee(g, tt);
      const ct = r.convert(g.format, g.colorSpace), wt = r.convert(g.type);
      let St = A(g.internalFormat, ct, wt, g.colorSpace, g.isVideoTexture);
      Ht(G, g);
      let ot;
      const Ot = g.mipmaps, P = g.isVideoTexture !== !0, et = Et.__version === void 0 || Z === !0, rt = V.dataReady, ft = b(g, tt);
      if (g.isDepthTexture)
        St = E(g.format === ss, g.type), et && (P ? e.texStorage2D(i.TEXTURE_2D, 1, St, tt.width, tt.height) : e.texImage2D(i.TEXTURE_2D, 0, St, tt.width, tt.height, 0, ct, wt, null));
      else if (g.isDataTexture)
        if (Ot.length > 0) {
          P && et && e.texStorage2D(i.TEXTURE_2D, ft, St, Ot[0].width, Ot[0].height);
          for (let J = 0, q = Ot.length; J < q; J++)
            ot = Ot[J], P ? rt && e.texSubImage2D(i.TEXTURE_2D, J, 0, 0, ot.width, ot.height, ct, wt, ot.data) : e.texImage2D(i.TEXTURE_2D, J, St, ot.width, ot.height, 0, ct, wt, ot.data);
          g.generateMipmaps = !1;
        } else
          P ? (et && e.texStorage2D(i.TEXTURE_2D, ft, St, tt.width, tt.height), rt && Ft(g, tt, ct, wt)) : e.texImage2D(i.TEXTURE_2D, 0, St, tt.width, tt.height, 0, ct, wt, tt.data);
      else if (g.isCompressedTexture)
        if (g.isCompressedArrayTexture) {
          P && et && e.texStorage3D(i.TEXTURE_2D_ARRAY, ft, St, Ot[0].width, Ot[0].height, tt.depth);
          for (let J = 0, q = Ot.length; J < q; J++)
            if (ot = Ot[J], g.format !== sn)
              if (ct !== null)
                if (P) {
                  if (rt)
                    if (g.layerUpdates.size > 0) {
                      const mt = zo(ot.width, ot.height, g.format, g.type);
                      for (const Lt of g.layerUpdates) {
                        const se = ot.data.subarray(
                          Lt * mt / ot.data.BYTES_PER_ELEMENT,
                          (Lt + 1) * mt / ot.data.BYTES_PER_ELEMENT
                        );
                        e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, J, 0, 0, Lt, ot.width, ot.height, 1, ct, se);
                      }
                      g.clearLayerUpdates();
                    } else
                      e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, J, 0, 0, 0, ot.width, ot.height, tt.depth, ct, ot.data);
                } else
                  e.compressedTexImage3D(i.TEXTURE_2D_ARRAY, J, St, ot.width, ot.height, tt.depth, 0, ot.data, 0, 0);
              else
                console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
            else
              P ? rt && e.texSubImage3D(i.TEXTURE_2D_ARRAY, J, 0, 0, 0, ot.width, ot.height, tt.depth, ct, wt, ot.data) : e.texImage3D(i.TEXTURE_2D_ARRAY, J, St, ot.width, ot.height, tt.depth, 0, ct, wt, ot.data);
        } else {
          P && et && e.texStorage2D(i.TEXTURE_2D, ft, St, Ot[0].width, Ot[0].height);
          for (let J = 0, q = Ot.length; J < q; J++)
            ot = Ot[J], g.format !== sn ? ct !== null ? P ? rt && e.compressedTexSubImage2D(i.TEXTURE_2D, J, 0, 0, ot.width, ot.height, ct, ot.data) : e.compressedTexImage2D(i.TEXTURE_2D, J, St, ot.width, ot.height, 0, ot.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : P ? rt && e.texSubImage2D(i.TEXTURE_2D, J, 0, 0, ot.width, ot.height, ct, wt, ot.data) : e.texImage2D(i.TEXTURE_2D, J, St, ot.width, ot.height, 0, ct, wt, ot.data);
        }
      else if (g.isDataArrayTexture)
        if (P) {
          if (et && e.texStorage3D(i.TEXTURE_2D_ARRAY, ft, St, tt.width, tt.height, tt.depth), rt)
            if (g.layerUpdates.size > 0) {
              const J = zo(tt.width, tt.height, g.format, g.type);
              for (const q of g.layerUpdates) {
                const mt = tt.data.subarray(
                  q * J / tt.data.BYTES_PER_ELEMENT,
                  (q + 1) * J / tt.data.BYTES_PER_ELEMENT
                );
                e.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, q, tt.width, tt.height, 1, ct, wt, mt);
              }
              g.clearLayerUpdates();
            } else
              e.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, 0, tt.width, tt.height, tt.depth, ct, wt, tt.data);
        } else
          e.texImage3D(i.TEXTURE_2D_ARRAY, 0, St, tt.width, tt.height, tt.depth, 0, ct, wt, tt.data);
      else if (g.isData3DTexture)
        P ? (et && e.texStorage3D(i.TEXTURE_3D, ft, St, tt.width, tt.height, tt.depth), rt && e.texSubImage3D(i.TEXTURE_3D, 0, 0, 0, 0, tt.width, tt.height, tt.depth, ct, wt, tt.data)) : e.texImage3D(i.TEXTURE_3D, 0, St, tt.width, tt.height, tt.depth, 0, ct, wt, tt.data);
      else if (g.isFramebufferTexture) {
        if (et)
          if (P)
            e.texStorage2D(i.TEXTURE_2D, ft, St, tt.width, tt.height);
          else {
            let J = tt.width, q = tt.height;
            for (let mt = 0; mt < ft; mt++)
              e.texImage2D(i.TEXTURE_2D, mt, St, J, q, 0, ct, wt, null), J >>= 1, q >>= 1;
          }
      } else if (Ot.length > 0) {
        if (P && et) {
          const J = pe(Ot[0]);
          e.texStorage2D(i.TEXTURE_2D, ft, St, J.width, J.height);
        }
        for (let J = 0, q = Ot.length; J < q; J++)
          ot = Ot[J], P ? rt && e.texSubImage2D(i.TEXTURE_2D, J, 0, 0, ct, wt, ot) : e.texImage2D(i.TEXTURE_2D, J, St, ct, wt, ot);
        g.generateMipmaps = !1;
      } else if (P) {
        if (et) {
          const J = pe(tt);
          e.texStorage2D(i.TEXTURE_2D, ft, St, J.width, J.height);
        }
        rt && e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, ct, wt, tt);
      } else
        e.texImage2D(i.TEXTURE_2D, 0, St, ct, wt, tt);
      p(g) && d(G), Et.__version = V.version, g.onUpdate && g.onUpdate(g);
    }
    y.__version = g.version;
  }
  function K(y, g, F) {
    if (g.image.length !== 6) return;
    const G = Jt(y, g), Z = g.source;
    e.bindTexture(i.TEXTURE_CUBE_MAP, y.__webglTexture, i.TEXTURE0 + F);
    const V = n.get(Z);
    if (Z.version !== V.__version || G === !0) {
      e.activeTexture(i.TEXTURE0 + F);
      const Et = jt.getPrimaries(jt.workingColorSpace), it = g.colorSpace === Bn ? null : jt.getPrimaries(g.colorSpace), xt = g.colorSpace === Bn || Et === it ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, g.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, g.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, g.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, xt);
      const Mt = g.isCompressedTexture || g.image[0].isCompressedTexture, tt = g.image[0] && g.image[0].isDataTexture, ct = [];
      for (let q = 0; q < 6; q++)
        !Mt && !tt ? ct[q] = v(g.image[q], !0, s.maxCubemapSize) : ct[q] = tt ? g.image[q].image : g.image[q], ct[q] = Ee(g, ct[q]);
      const wt = ct[0], St = r.convert(g.format, g.colorSpace), ot = r.convert(g.type), Ot = A(g.internalFormat, St, ot, g.colorSpace), P = g.isVideoTexture !== !0, et = V.__version === void 0 || G === !0, rt = Z.dataReady;
      let ft = b(g, wt);
      Ht(i.TEXTURE_CUBE_MAP, g);
      let J;
      if (Mt) {
        P && et && e.texStorage2D(i.TEXTURE_CUBE_MAP, ft, Ot, wt.width, wt.height);
        for (let q = 0; q < 6; q++) {
          J = ct[q].mipmaps;
          for (let mt = 0; mt < J.length; mt++) {
            const Lt = J[mt];
            g.format !== sn ? St !== null ? P ? rt && e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, mt, 0, 0, Lt.width, Lt.height, St, Lt.data) : e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, mt, Ot, Lt.width, Lt.height, 0, Lt.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : P ? rt && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, mt, 0, 0, Lt.width, Lt.height, St, ot, Lt.data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, mt, Ot, Lt.width, Lt.height, 0, St, ot, Lt.data);
          }
        }
      } else {
        if (J = g.mipmaps, P && et) {
          J.length > 0 && ft++;
          const q = pe(ct[0]);
          e.texStorage2D(i.TEXTURE_CUBE_MAP, ft, Ot, q.width, q.height);
        }
        for (let q = 0; q < 6; q++)
          if (tt) {
            P ? rt && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, 0, 0, 0, ct[q].width, ct[q].height, St, ot, ct[q].data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, 0, Ot, ct[q].width, ct[q].height, 0, St, ot, ct[q].data);
            for (let mt = 0; mt < J.length; mt++) {
              const se = J[mt].image[q].image;
              P ? rt && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, mt + 1, 0, 0, se.width, se.height, St, ot, se.data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, mt + 1, Ot, se.width, se.height, 0, St, ot, se.data);
            }
          } else {
            P ? rt && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, 0, 0, 0, St, ot, ct[q]) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, 0, Ot, St, ot, ct[q]);
            for (let mt = 0; mt < J.length; mt++) {
              const Lt = J[mt];
              P ? rt && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, mt + 1, 0, 0, St, ot, Lt.image[q]) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, mt + 1, Ot, St, ot, Lt.image[q]);
            }
          }
      }
      p(g) && d(i.TEXTURE_CUBE_MAP), V.__version = Z.version, g.onUpdate && g.onUpdate(g);
    }
    y.__version = g.version;
  }
  function ut(y, g, F, G, Z, V) {
    const Et = r.convert(F.format, F.colorSpace), it = r.convert(F.type), xt = A(F.internalFormat, Et, it, F.colorSpace), Mt = n.get(g), tt = n.get(F);
    if (tt.__renderTarget = g, !Mt.__hasExternalTextures) {
      const ct = Math.max(1, g.width >> V), wt = Math.max(1, g.height >> V);
      Z === i.TEXTURE_3D || Z === i.TEXTURE_2D_ARRAY ? e.texImage3D(Z, V, xt, ct, wt, g.depth, 0, Et, it, null) : e.texImage2D(Z, V, xt, ct, wt, 0, Et, it, null);
    }
    e.bindFramebuffer(i.FRAMEBUFFER, y), vt(g) ? a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, G, Z, tt.__webglTexture, 0, ce(g)) : (Z === i.TEXTURE_2D || Z >= i.TEXTURE_CUBE_MAP_POSITIVE_X && Z <= i.TEXTURE_CUBE_MAP_NEGATIVE_Z) && i.framebufferTexture2D(i.FRAMEBUFFER, G, Z, tt.__webglTexture, V), e.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function Pt(y, g, F) {
    if (i.bindRenderbuffer(i.RENDERBUFFER, y), g.depthBuffer) {
      const G = g.depthTexture, Z = G && G.isDepthTexture ? G.type : null, V = E(g.stencilBuffer, Z), Et = g.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, it = ce(g);
      vt(g) ? a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, it, V, g.width, g.height) : F ? i.renderbufferStorageMultisample(i.RENDERBUFFER, it, V, g.width, g.height) : i.renderbufferStorage(i.RENDERBUFFER, V, g.width, g.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, Et, i.RENDERBUFFER, y);
    } else {
      const G = g.textures;
      for (let Z = 0; Z < G.length; Z++) {
        const V = G[Z], Et = r.convert(V.format, V.colorSpace), it = r.convert(V.type), xt = A(V.internalFormat, Et, it, V.colorSpace), Mt = ce(g);
        F && vt(g) === !1 ? i.renderbufferStorageMultisample(i.RENDERBUFFER, Mt, xt, g.width, g.height) : vt(g) ? a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, Mt, xt, g.width, g.height) : i.renderbufferStorage(i.RENDERBUFFER, xt, g.width, g.height);
      }
    }
    i.bindRenderbuffer(i.RENDERBUFFER, null);
  }
  function yt(y, g) {
    if (g && g.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (e.bindFramebuffer(i.FRAMEBUFFER, y), !(g.depthTexture && g.depthTexture.isDepthTexture))
      throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    const G = n.get(g.depthTexture);
    G.__renderTarget = g, (!G.__webglTexture || g.depthTexture.image.width !== g.width || g.depthTexture.image.height !== g.height) && (g.depthTexture.image.width = g.width, g.depthTexture.image.height = g.height, g.depthTexture.needsUpdate = !0), W(g.depthTexture, 0);
    const Z = G.__webglTexture, V = ce(g);
    if (g.depthTexture.format === is)
      vt(g) ? a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, Z, 0, V) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, Z, 0);
    else if (g.depthTexture.format === ss)
      vt(g) ? a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, Z, 0, V) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, Z, 0);
    else
      throw new Error("Unknown depthTexture format");
  }
  function $t(y) {
    const g = n.get(y), F = y.isWebGLCubeRenderTarget === !0;
    if (g.__boundDepthTexture !== y.depthTexture) {
      const G = y.depthTexture;
      if (g.__depthDisposeCallback && g.__depthDisposeCallback(), G) {
        const Z = () => {
          delete g.__boundDepthTexture, delete g.__depthDisposeCallback, G.removeEventListener("dispose", Z);
        };
        G.addEventListener("dispose", Z), g.__depthDisposeCallback = Z;
      }
      g.__boundDepthTexture = G;
    }
    if (y.depthTexture && !g.__autoAllocateDepthBuffer) {
      if (F) throw new Error("target.depthTexture not supported in Cube render targets");
      const G = y.texture.mipmaps;
      G && G.length > 0 ? yt(g.__webglFramebuffer[0], y) : yt(g.__webglFramebuffer, y);
    } else if (F) {
      g.__webglDepthbuffer = [];
      for (let G = 0; G < 6; G++)
        if (e.bindFramebuffer(i.FRAMEBUFFER, g.__webglFramebuffer[G]), g.__webglDepthbuffer[G] === void 0)
          g.__webglDepthbuffer[G] = i.createRenderbuffer(), Pt(g.__webglDepthbuffer[G], y, !1);
        else {
          const Z = y.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, V = g.__webglDepthbuffer[G];
          i.bindRenderbuffer(i.RENDERBUFFER, V), i.framebufferRenderbuffer(i.FRAMEBUFFER, Z, i.RENDERBUFFER, V);
        }
    } else {
      const G = y.texture.mipmaps;
      if (G && G.length > 0 ? e.bindFramebuffer(i.FRAMEBUFFER, g.__webglFramebuffer[0]) : e.bindFramebuffer(i.FRAMEBUFFER, g.__webglFramebuffer), g.__webglDepthbuffer === void 0)
        g.__webglDepthbuffer = i.createRenderbuffer(), Pt(g.__webglDepthbuffer, y, !1);
      else {
        const Z = y.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, V = g.__webglDepthbuffer;
        i.bindRenderbuffer(i.RENDERBUFFER, V), i.framebufferRenderbuffer(i.FRAMEBUFFER, Z, i.RENDERBUFFER, V);
      }
    }
    e.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function we(y, g, F) {
    const G = n.get(y);
    g !== void 0 && ut(G.__webglFramebuffer, y, y.texture, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, 0), F !== void 0 && $t(y);
  }
  function w(y) {
    const g = y.texture, F = n.get(y), G = n.get(g);
    y.addEventListener("dispose", C);
    const Z = y.textures, V = y.isWebGLCubeRenderTarget === !0, Et = Z.length > 1;
    if (Et || (G.__webglTexture === void 0 && (G.__webglTexture = i.createTexture()), G.__version = g.version, o.memory.textures++), V) {
      F.__webglFramebuffer = [];
      for (let it = 0; it < 6; it++)
        if (g.mipmaps && g.mipmaps.length > 0) {
          F.__webglFramebuffer[it] = [];
          for (let xt = 0; xt < g.mipmaps.length; xt++)
            F.__webglFramebuffer[it][xt] = i.createFramebuffer();
        } else
          F.__webglFramebuffer[it] = i.createFramebuffer();
    } else {
      if (g.mipmaps && g.mipmaps.length > 0) {
        F.__webglFramebuffer = [];
        for (let it = 0; it < g.mipmaps.length; it++)
          F.__webglFramebuffer[it] = i.createFramebuffer();
      } else
        F.__webglFramebuffer = i.createFramebuffer();
      if (Et)
        for (let it = 0, xt = Z.length; it < xt; it++) {
          const Mt = n.get(Z[it]);
          Mt.__webglTexture === void 0 && (Mt.__webglTexture = i.createTexture(), o.memory.textures++);
        }
      if (y.samples > 0 && vt(y) === !1) {
        F.__webglMultisampledFramebuffer = i.createFramebuffer(), F.__webglColorRenderbuffer = [], e.bindFramebuffer(i.FRAMEBUFFER, F.__webglMultisampledFramebuffer);
        for (let it = 0; it < Z.length; it++) {
          const xt = Z[it];
          F.__webglColorRenderbuffer[it] = i.createRenderbuffer(), i.bindRenderbuffer(i.RENDERBUFFER, F.__webglColorRenderbuffer[it]);
          const Mt = r.convert(xt.format, xt.colorSpace), tt = r.convert(xt.type), ct = A(xt.internalFormat, Mt, tt, xt.colorSpace, y.isXRRenderTarget === !0), wt = ce(y);
          i.renderbufferStorageMultisample(i.RENDERBUFFER, wt, ct, y.width, y.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + it, i.RENDERBUFFER, F.__webglColorRenderbuffer[it]);
        }
        i.bindRenderbuffer(i.RENDERBUFFER, null), y.depthBuffer && (F.__webglDepthRenderbuffer = i.createRenderbuffer(), Pt(F.__webglDepthRenderbuffer, y, !0)), e.bindFramebuffer(i.FRAMEBUFFER, null);
      }
    }
    if (V) {
      e.bindTexture(i.TEXTURE_CUBE_MAP, G.__webglTexture), Ht(i.TEXTURE_CUBE_MAP, g);
      for (let it = 0; it < 6; it++)
        if (g.mipmaps && g.mipmaps.length > 0)
          for (let xt = 0; xt < g.mipmaps.length; xt++)
            ut(F.__webglFramebuffer[it][xt], y, g, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + it, xt);
        else
          ut(F.__webglFramebuffer[it], y, g, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + it, 0);
      p(g) && d(i.TEXTURE_CUBE_MAP), e.unbindTexture();
    } else if (Et) {
      for (let it = 0, xt = Z.length; it < xt; it++) {
        const Mt = Z[it], tt = n.get(Mt);
        let ct = i.TEXTURE_2D;
        (y.isWebGL3DRenderTarget || y.isWebGLArrayRenderTarget) && (ct = y.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY), e.bindTexture(ct, tt.__webglTexture), Ht(ct, Mt), ut(F.__webglFramebuffer, y, Mt, i.COLOR_ATTACHMENT0 + it, ct, 0), p(Mt) && d(ct);
      }
      e.unbindTexture();
    } else {
      let it = i.TEXTURE_2D;
      if ((y.isWebGL3DRenderTarget || y.isWebGLArrayRenderTarget) && (it = y.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY), e.bindTexture(it, G.__webglTexture), Ht(it, g), g.mipmaps && g.mipmaps.length > 0)
        for (let xt = 0; xt < g.mipmaps.length; xt++)
          ut(F.__webglFramebuffer[xt], y, g, i.COLOR_ATTACHMENT0, it, xt);
      else
        ut(F.__webglFramebuffer, y, g, i.COLOR_ATTACHMENT0, it, 0);
      p(g) && d(it), e.unbindTexture();
    }
    y.depthBuffer && $t(y);
  }
  function le(y) {
    const g = y.textures;
    for (let F = 0, G = g.length; F < G; F++) {
      const Z = g[F];
      if (p(Z)) {
        const V = T(y), Et = n.get(Z).__webglTexture;
        e.bindTexture(V, Et), d(V), e.unbindTexture();
      }
    }
  }
  const Ut = [], Rt = [];
  function gt(y) {
    if (y.samples > 0) {
      if (vt(y) === !1) {
        const g = y.textures, F = y.width, G = y.height;
        let Z = i.COLOR_BUFFER_BIT;
        const V = y.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, Et = n.get(y), it = g.length > 1;
        if (it)
          for (let Mt = 0; Mt < g.length; Mt++)
            e.bindFramebuffer(i.FRAMEBUFFER, Et.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + Mt, i.RENDERBUFFER, null), e.bindFramebuffer(i.FRAMEBUFFER, Et.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + Mt, i.TEXTURE_2D, null, 0);
        e.bindFramebuffer(i.READ_FRAMEBUFFER, Et.__webglMultisampledFramebuffer);
        const xt = y.texture.mipmaps;
        xt && xt.length > 0 ? e.bindFramebuffer(i.DRAW_FRAMEBUFFER, Et.__webglFramebuffer[0]) : e.bindFramebuffer(i.DRAW_FRAMEBUFFER, Et.__webglFramebuffer);
        for (let Mt = 0; Mt < g.length; Mt++) {
          if (y.resolveDepthBuffer && (y.depthBuffer && (Z |= i.DEPTH_BUFFER_BIT), y.stencilBuffer && y.resolveStencilBuffer && (Z |= i.STENCIL_BUFFER_BIT)), it) {
            i.framebufferRenderbuffer(i.READ_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.RENDERBUFFER, Et.__webglColorRenderbuffer[Mt]);
            const tt = n.get(g[Mt]).__webglTexture;
            i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, tt, 0);
          }
          i.blitFramebuffer(0, 0, F, G, 0, 0, F, G, Z, i.NEAREST), l === !0 && (Ut.length = 0, Rt.length = 0, Ut.push(i.COLOR_ATTACHMENT0 + Mt), y.depthBuffer && y.resolveDepthBuffer === !1 && (Ut.push(V), Rt.push(V), i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, Rt)), i.invalidateFramebuffer(i.READ_FRAMEBUFFER, Ut));
        }
        if (e.bindFramebuffer(i.READ_FRAMEBUFFER, null), e.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), it)
          for (let Mt = 0; Mt < g.length; Mt++) {
            e.bindFramebuffer(i.FRAMEBUFFER, Et.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + Mt, i.RENDERBUFFER, Et.__webglColorRenderbuffer[Mt]);
            const tt = n.get(g[Mt]).__webglTexture;
            e.bindFramebuffer(i.FRAMEBUFFER, Et.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + Mt, i.TEXTURE_2D, tt, 0);
          }
        e.bindFramebuffer(i.DRAW_FRAMEBUFFER, Et.__webglMultisampledFramebuffer);
      } else if (y.depthBuffer && y.resolveDepthBuffer === !1 && l) {
        const g = y.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT;
        i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, [g]);
      }
    }
  }
  function ce(y) {
    return Math.min(s.maxSamples, y.samples);
  }
  function vt(y) {
    const g = n.get(y);
    return y.samples > 0 && t.has("WEBGL_multisampled_render_to_texture") === !0 && g.__useRenderToTexture !== !1;
  }
  function kt(y) {
    const g = o.render.frame;
    h.get(y) !== g && (h.set(y, g), y.update());
  }
  function Ee(y, g) {
    const F = y.colorSpace, G = y.format, Z = y.type;
    return y.isCompressedTexture === !0 || y.isVideoTexture === !0 || F !== Bi && F !== Bn && (jt.getTransfer(F) === te ? (G !== sn || Z !== vn) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", F)), g;
  }
  function pe(y) {
    return typeof HTMLImageElement < "u" && y instanceof HTMLImageElement ? (c.width = y.naturalWidth || y.width, c.height = y.naturalHeight || y.height) : typeof VideoFrame < "u" && y instanceof VideoFrame ? (c.width = y.displayWidth, c.height = y.displayHeight) : (c.width = y.width, c.height = y.height), c;
  }
  this.allocateTextureUnit = H, this.resetTextureUnits = k, this.setTexture2D = W, this.setTexture2DArray = X, this.setTexture3D = j, this.setTextureCube = z, this.rebindTextures = we, this.setupRenderTarget = w, this.updateRenderTargetMipmap = le, this.updateMultisampleRenderTarget = gt, this.setupDepthRenderbuffer = $t, this.setupFrameBufferTexture = ut, this.useMultisampledRTT = vt;
}
function Um(i, t) {
  function e(n, s = Bn) {
    let r;
    const o = jt.getTransfer(s);
    if (n === vn) return i.UNSIGNED_BYTE;
    if (n === Na) return i.UNSIGNED_SHORT_4_4_4_4;
    if (n === Fa) return i.UNSIGNED_SHORT_5_5_5_1;
    if (n === Tl) return i.UNSIGNED_INT_5_9_9_9_REV;
    if (n === Al) return i.UNSIGNED_INT_10F_11F_11F_REV;
    if (n === yl) return i.BYTE;
    if (n === bl) return i.SHORT;
    if (n === es) return i.UNSIGNED_SHORT;
    if (n === Ua) return i.INT;
    if (n === si) return i.UNSIGNED_INT;
    if (n === Cn) return i.FLOAT;
    if (n === cs) return i.HALF_FLOAT;
    if (n === wl) return i.ALPHA;
    if (n === Rl) return i.RGB;
    if (n === sn) return i.RGBA;
    if (n === is) return i.DEPTH_COMPONENT;
    if (n === ss) return i.DEPTH_STENCIL;
    if (n === Cl) return i.RED;
    if (n === Oa) return i.RED_INTEGER;
    if (n === Pl) return i.RG;
    if (n === Ba) return i.RG_INTEGER;
    if (n === ka) return i.RGBA_INTEGER;
    if (n === zs || n === Hs || n === Vs || n === Gs)
      if (o === te)
        if (r = t.get("WEBGL_compressed_texture_s3tc_srgb"), r !== null) {
          if (n === zs) return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (n === Hs) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (n === Vs) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (n === Gs) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else
          return null;
      else if (r = t.get("WEBGL_compressed_texture_s3tc"), r !== null) {
        if (n === zs) return r.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (n === Hs) return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (n === Vs) return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (n === Gs) return r.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else
        return null;
    if (n === Jr || n === Qr || n === ta || n === ea)
      if (r = t.get("WEBGL_compressed_texture_pvrtc"), r !== null) {
        if (n === Jr) return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === Qr) return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === ta) return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === ea) return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else
        return null;
    if (n === na || n === ia || n === sa)
      if (r = t.get("WEBGL_compressed_texture_etc"), r !== null) {
        if (n === na || n === ia) return o === te ? r.COMPRESSED_SRGB8_ETC2 : r.COMPRESSED_RGB8_ETC2;
        if (n === sa) return o === te ? r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : r.COMPRESSED_RGBA8_ETC2_EAC;
      } else
        return null;
    if (n === ra || n === aa || n === oa || n === la || n === ca || n === ha || n === da || n === ua || n === fa || n === pa || n === ma || n === _a || n === ga || n === va)
      if (r = t.get("WEBGL_compressed_texture_astc"), r !== null) {
        if (n === ra) return o === te ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : r.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === aa) return o === te ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : r.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === oa) return o === te ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : r.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === la) return o === te ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : r.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === ca) return o === te ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : r.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === ha) return o === te ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : r.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === da) return o === te ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : r.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === ua) return o === te ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : r.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === fa) return o === te ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : r.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === pa) return o === te ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : r.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === ma) return o === te ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : r.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === _a) return o === te ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : r.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === ga) return o === te ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : r.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === va) return o === te ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : r.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else
        return null;
    if (n === xa || n === Ma || n === Sa)
      if (r = t.get("EXT_texture_compression_bptc"), r !== null) {
        if (n === xa) return o === te ? r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : r.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === Ma) return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === Sa) return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else
        return null;
    if (n === Ea || n === ya || n === ba || n === Ta)
      if (r = t.get("EXT_texture_compression_rgtc"), r !== null) {
        if (n === Ea) return r.COMPRESSED_RED_RGTC1_EXT;
        if (n === ya) return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === ba) return r.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === Ta) return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else
        return null;
    return n === ns ? i.UNSIGNED_INT_24_8 : i[n] !== void 0 ? i[n] : null;
  }
  return { convert: e };
}
const Nm = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, Fm = `
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
class Om {
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
      const n = new Gl(t.texture);
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
      const e = t.cameras[0].viewport, n = new Gn({
        vertexShader: Nm,
        fragmentShader: Fm,
        uniforms: {
          depthColor: { value: this.texture },
          depthWidth: { value: e.z },
          depthHeight: { value: e.w }
        }
      });
      this.mesh = new Xe(new hs(20, 20), n);
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
class Bm extends oi {
  /**
   * Constructs a new WebGL renderer.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGL2RenderingContext} gl - The rendering context.
   */
  constructor(t, e) {
    super();
    const n = this;
    let s = null, r = 1, o = null, a = "local-floor", l = 1, c = null, h = null, u = null, f = null, m = null, _ = null;
    const v = typeof XRWebGLBinding < "u", p = new Om(), d = {}, T = e.getContextAttributes();
    let A = null, E = null;
    const b = [], R = [], C = new Dt();
    let N = null;
    const M = new je();
    M.viewport = new fe();
    const S = new je();
    S.viewport = new fe();
    const D = [M, S], k = new nd();
    let H = null, Y = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function($) {
      let K = b[$];
      return K === void 0 && (K = new Tr(), b[$] = K), K.getTargetRaySpace();
    }, this.getControllerGrip = function($) {
      let K = b[$];
      return K === void 0 && (K = new Tr(), b[$] = K), K.getGripSpace();
    }, this.getHand = function($) {
      let K = b[$];
      return K === void 0 && (K = new Tr(), b[$] = K), K.getHandSpace();
    };
    function W($) {
      const K = R.indexOf($.inputSource);
      if (K === -1)
        return;
      const ut = b[K];
      ut !== void 0 && (ut.update($.inputSource, $.frame, c || o), ut.dispatchEvent({ type: $.type, data: $.inputSource }));
    }
    function X() {
      s.removeEventListener("select", W), s.removeEventListener("selectstart", W), s.removeEventListener("selectend", W), s.removeEventListener("squeeze", W), s.removeEventListener("squeezestart", W), s.removeEventListener("squeezeend", W), s.removeEventListener("end", X), s.removeEventListener("inputsourceschange", j);
      for (let $ = 0; $ < b.length; $++) {
        const K = R[$];
        K !== null && (R[$] = null, b[$].disconnect(K));
      }
      H = null, Y = null, p.reset();
      for (const $ in d)
        delete d[$];
      t.setRenderTarget(A), m = null, f = null, u = null, s = null, E = null, Ft.stop(), n.isPresenting = !1, t.setPixelRatio(N), t.setSize(C.width, C.height, !1), n.dispatchEvent({ type: "sessionend" });
    }
    this.setFramebufferScaleFactor = function($) {
      r = $, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function($) {
      a = $, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function() {
      return c || o;
    }, this.setReferenceSpace = function($) {
      c = $;
    }, this.getBaseLayer = function() {
      return f !== null ? f : m;
    }, this.getBinding = function() {
      return u === null && v && (u = new XRWebGLBinding(s, e)), u;
    }, this.getFrame = function() {
      return _;
    }, this.getSession = function() {
      return s;
    }, this.setSession = async function($) {
      if (s = $, s !== null) {
        if (A = t.getRenderTarget(), s.addEventListener("select", W), s.addEventListener("selectstart", W), s.addEventListener("selectend", W), s.addEventListener("squeeze", W), s.addEventListener("squeezestart", W), s.addEventListener("squeezeend", W), s.addEventListener("end", X), s.addEventListener("inputsourceschange", j), T.xrCompatible !== !0 && await e.makeXRCompatible(), N = t.getPixelRatio(), t.getSize(C), v && "createProjectionLayer" in XRWebGLBinding.prototype) {
          let ut = null, Pt = null, yt = null;
          T.depth && (yt = T.stencil ? e.DEPTH24_STENCIL8 : e.DEPTH_COMPONENT24, ut = T.stencil ? ss : is, Pt = T.stencil ? ns : si);
          const $t = {
            colorFormat: e.RGBA8,
            depthFormat: yt,
            scaleFactor: r
          };
          u = this.getBinding(), f = u.createProjectionLayer($t), s.updateRenderState({ layers: [f] }), t.setPixelRatio(1), t.setSize(f.textureWidth, f.textureHeight, !1), E = new ai(
            f.textureWidth,
            f.textureHeight,
            {
              format: sn,
              type: vn,
              depthTexture: new Vl(f.textureWidth, f.textureHeight, Pt, void 0, void 0, void 0, void 0, void 0, void 0, ut),
              stencilBuffer: T.stencil,
              colorSpace: t.outputColorSpace,
              samples: T.antialias ? 4 : 0,
              resolveDepthBuffer: f.ignoreDepthValues === !1,
              resolveStencilBuffer: f.ignoreDepthValues === !1
            }
          );
        } else {
          const ut = {
            antialias: T.antialias,
            alpha: !0,
            depth: T.depth,
            stencil: T.stencil,
            framebufferScaleFactor: r
          };
          m = new XRWebGLLayer(s, e, ut), s.updateRenderState({ baseLayer: m }), t.setPixelRatio(1), t.setSize(m.framebufferWidth, m.framebufferHeight, !1), E = new ai(
            m.framebufferWidth,
            m.framebufferHeight,
            {
              format: sn,
              type: vn,
              colorSpace: t.outputColorSpace,
              stencilBuffer: T.stencil,
              resolveDepthBuffer: m.ignoreDepthValues === !1,
              resolveStencilBuffer: m.ignoreDepthValues === !1
            }
          );
        }
        E.isXRRenderTarget = !0, this.setFoveation(l), c = null, o = await s.requestReferenceSpace(a), Ft.setContext(s), Ft.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (s !== null)
        return s.environmentBlendMode;
    }, this.getDepthTexture = function() {
      return p.getDepthTexture();
    };
    function j($) {
      for (let K = 0; K < $.removed.length; K++) {
        const ut = $.removed[K], Pt = R.indexOf(ut);
        Pt >= 0 && (R[Pt] = null, b[Pt].disconnect(ut));
      }
      for (let K = 0; K < $.added.length; K++) {
        const ut = $.added[K];
        let Pt = R.indexOf(ut);
        if (Pt === -1) {
          for (let $t = 0; $t < b.length; $t++)
            if ($t >= R.length) {
              R.push(ut), Pt = $t;
              break;
            } else if (R[$t] === null) {
              R[$t] = ut, Pt = $t;
              break;
            }
          if (Pt === -1) break;
        }
        const yt = b[Pt];
        yt && yt.connect(ut);
      }
    }
    const z = new L(), st = new L();
    function ht($, K, ut) {
      z.setFromMatrixPosition(K.matrixWorld), st.setFromMatrixPosition(ut.matrixWorld);
      const Pt = z.distanceTo(st), yt = K.projectionMatrix.elements, $t = ut.projectionMatrix.elements, we = yt[14] / (yt[10] - 1), w = yt[14] / (yt[10] + 1), le = (yt[9] + 1) / yt[5], Ut = (yt[9] - 1) / yt[5], Rt = (yt[8] - 1) / yt[0], gt = ($t[8] + 1) / $t[0], ce = we * Rt, vt = we * gt, kt = Pt / (-Rt + gt), Ee = kt * -Rt;
      if (K.matrixWorld.decompose($.position, $.quaternion, $.scale), $.translateX(Ee), $.translateZ(kt), $.matrixWorld.compose($.position, $.quaternion, $.scale), $.matrixWorldInverse.copy($.matrixWorld).invert(), yt[10] === -1)
        $.projectionMatrix.copy(K.projectionMatrix), $.projectionMatrixInverse.copy(K.projectionMatrixInverse);
      else {
        const pe = we + kt, y = w + kt, g = ce - Ee, F = vt + (Pt - Ee), G = le * w / y * pe, Z = Ut * w / y * pe;
        $.projectionMatrix.makePerspective(g, F, G, Z, pe, y), $.projectionMatrixInverse.copy($.projectionMatrix).invert();
      }
    }
    function _t($, K) {
      K === null ? $.matrixWorld.copy($.matrix) : $.matrixWorld.multiplyMatrices(K.matrixWorld, $.matrix), $.matrixWorldInverse.copy($.matrixWorld).invert();
    }
    this.updateCamera = function($) {
      if (s === null) return;
      let K = $.near, ut = $.far;
      p.texture !== null && (p.depthNear > 0 && (K = p.depthNear), p.depthFar > 0 && (ut = p.depthFar)), k.near = S.near = M.near = K, k.far = S.far = M.far = ut, (H !== k.near || Y !== k.far) && (s.updateRenderState({
        depthNear: k.near,
        depthFar: k.far
      }), H = k.near, Y = k.far), k.layers.mask = $.layers.mask | 6, M.layers.mask = k.layers.mask & 3, S.layers.mask = k.layers.mask & 5;
      const Pt = $.parent, yt = k.cameras;
      _t(k, Pt);
      for (let $t = 0; $t < yt.length; $t++)
        _t(yt[$t], Pt);
      yt.length === 2 ? ht(k, M, S) : k.projectionMatrix.copy(M.projectionMatrix), Ht($, k, Pt);
    };
    function Ht($, K, ut) {
      ut === null ? $.matrix.copy(K.matrixWorld) : ($.matrix.copy(ut.matrixWorld), $.matrix.invert(), $.matrix.multiply(K.matrixWorld)), $.matrix.decompose($.position, $.quaternion, $.scale), $.updateMatrixWorld(!0), $.projectionMatrix.copy(K.projectionMatrix), $.projectionMatrixInverse.copy(K.projectionMatrixInverse), $.isPerspectiveCamera && ($.fov = rs * 2 * Math.atan(1 / $.projectionMatrix.elements[5]), $.zoom = 1);
    }
    this.getCamera = function() {
      return k;
    }, this.getFoveation = function() {
      if (!(f === null && m === null))
        return l;
    }, this.setFoveation = function($) {
      l = $, f !== null && (f.fixedFoveation = $), m !== null && m.fixedFoveation !== void 0 && (m.fixedFoveation = $);
    }, this.hasDepthSensing = function() {
      return p.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return p.getMesh(k);
    }, this.getCameraTexture = function($) {
      return d[$];
    };
    let Jt = null;
    function Gt($, K) {
      if (h = K.getViewerPose(c || o), _ = K, h !== null) {
        const ut = h.views;
        m !== null && (t.setRenderTargetFramebuffer(E, m.framebuffer), t.setRenderTarget(E));
        let Pt = !1;
        ut.length !== k.cameras.length && (k.cameras.length = 0, Pt = !0);
        for (let w = 0; w < ut.length; w++) {
          const le = ut[w];
          let Ut = null;
          if (m !== null)
            Ut = m.getViewport(le);
          else {
            const gt = u.getViewSubImage(f, le);
            Ut = gt.viewport, w === 0 && (t.setRenderTargetTextures(
              E,
              gt.colorTexture,
              gt.depthStencilTexture
            ), t.setRenderTarget(E));
          }
          let Rt = D[w];
          Rt === void 0 && (Rt = new je(), Rt.layers.enable(w), Rt.viewport = new fe(), D[w] = Rt), Rt.matrix.fromArray(le.transform.matrix), Rt.matrix.decompose(Rt.position, Rt.quaternion, Rt.scale), Rt.projectionMatrix.fromArray(le.projectionMatrix), Rt.projectionMatrixInverse.copy(Rt.projectionMatrix).invert(), Rt.viewport.set(Ut.x, Ut.y, Ut.width, Ut.height), w === 0 && (k.matrix.copy(Rt.matrix), k.matrix.decompose(k.position, k.quaternion, k.scale)), Pt === !0 && k.cameras.push(Rt);
        }
        const yt = s.enabledFeatures;
        if (yt && yt.includes("depth-sensing") && s.depthUsage == "gpu-optimized" && v) {
          u = n.getBinding();
          const w = u.getDepthInformation(ut[0]);
          w && w.isValid && w.texture && p.init(w, s.renderState);
        }
        if (yt && yt.includes("camera-access") && v) {
          t.state.unbindTexture(), u = n.getBinding();
          for (let w = 0; w < ut.length; w++) {
            const le = ut[w].camera;
            if (le) {
              let Ut = d[le];
              Ut || (Ut = new Gl(), d[le] = Ut);
              const Rt = u.getCameraImage(le);
              Ut.sourceTexture = Rt;
            }
          }
        }
      }
      for (let ut = 0; ut < b.length; ut++) {
        const Pt = R[ut], yt = b[ut];
        Pt !== null && yt !== void 0 && yt.update(Pt, K, c || o);
      }
      Jt && Jt($, K), K.detectedPlanes && n.dispatchEvent({ type: "planesdetected", data: K }), _ = null;
    }
    const Ft = new ql();
    Ft.setAnimationLoop(Gt), this.setAnimationLoop = function($) {
      Jt = $;
    }, this.dispose = function() {
    };
  }
}
const Zn = /* @__PURE__ */ new xn(), km = /* @__PURE__ */ new oe();
function zm(i, t) {
  function e(p, d) {
    p.matrixAutoUpdate === !0 && p.updateMatrix(), d.value.copy(p.matrix);
  }
  function n(p, d) {
    d.color.getRGB(p.fogColor.value, kl(i)), d.isFog ? (p.fogNear.value = d.near, p.fogFar.value = d.far) : d.isFogExp2 && (p.fogDensity.value = d.density);
  }
  function s(p, d, T, A, E) {
    d.isMeshBasicMaterial || d.isMeshLambertMaterial ? r(p, d) : d.isMeshToonMaterial ? (r(p, d), u(p, d)) : d.isMeshPhongMaterial ? (r(p, d), h(p, d)) : d.isMeshStandardMaterial ? (r(p, d), f(p, d), d.isMeshPhysicalMaterial && m(p, d, E)) : d.isMeshMatcapMaterial ? (r(p, d), _(p, d)) : d.isMeshDepthMaterial ? r(p, d) : d.isMeshDistanceMaterial ? (r(p, d), v(p, d)) : d.isMeshNormalMaterial ? r(p, d) : d.isLineBasicMaterial ? (o(p, d), d.isLineDashedMaterial && a(p, d)) : d.isPointsMaterial ? l(p, d, T, A) : d.isSpriteMaterial ? c(p, d) : d.isShadowMaterial ? (p.color.value.copy(d.color), p.opacity.value = d.opacity) : d.isShaderMaterial && (d.uniformsNeedUpdate = !1);
  }
  function r(p, d) {
    p.opacity.value = d.opacity, d.color && p.diffuse.value.copy(d.color), d.emissive && p.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity), d.map && (p.map.value = d.map, e(d.map, p.mapTransform)), d.alphaMap && (p.alphaMap.value = d.alphaMap, e(d.alphaMap, p.alphaMapTransform)), d.bumpMap && (p.bumpMap.value = d.bumpMap, e(d.bumpMap, p.bumpMapTransform), p.bumpScale.value = d.bumpScale, d.side === ze && (p.bumpScale.value *= -1)), d.normalMap && (p.normalMap.value = d.normalMap, e(d.normalMap, p.normalMapTransform), p.normalScale.value.copy(d.normalScale), d.side === ze && p.normalScale.value.negate()), d.displacementMap && (p.displacementMap.value = d.displacementMap, e(d.displacementMap, p.displacementMapTransform), p.displacementScale.value = d.displacementScale, p.displacementBias.value = d.displacementBias), d.emissiveMap && (p.emissiveMap.value = d.emissiveMap, e(d.emissiveMap, p.emissiveMapTransform)), d.specularMap && (p.specularMap.value = d.specularMap, e(d.specularMap, p.specularMapTransform)), d.alphaTest > 0 && (p.alphaTest.value = d.alphaTest);
    const T = t.get(d), A = T.envMap, E = T.envMapRotation;
    A && (p.envMap.value = A, Zn.copy(E), Zn.x *= -1, Zn.y *= -1, Zn.z *= -1, A.isCubeTexture && A.isRenderTargetTexture === !1 && (Zn.y *= -1, Zn.z *= -1), p.envMapRotation.value.setFromMatrix4(km.makeRotationFromEuler(Zn)), p.flipEnvMap.value = A.isCubeTexture && A.isRenderTargetTexture === !1 ? -1 : 1, p.reflectivity.value = d.reflectivity, p.ior.value = d.ior, p.refractionRatio.value = d.refractionRatio), d.lightMap && (p.lightMap.value = d.lightMap, p.lightMapIntensity.value = d.lightMapIntensity, e(d.lightMap, p.lightMapTransform)), d.aoMap && (p.aoMap.value = d.aoMap, p.aoMapIntensity.value = d.aoMapIntensity, e(d.aoMap, p.aoMapTransform));
  }
  function o(p, d) {
    p.diffuse.value.copy(d.color), p.opacity.value = d.opacity, d.map && (p.map.value = d.map, e(d.map, p.mapTransform));
  }
  function a(p, d) {
    p.dashSize.value = d.dashSize, p.totalSize.value = d.dashSize + d.gapSize, p.scale.value = d.scale;
  }
  function l(p, d, T, A) {
    p.diffuse.value.copy(d.color), p.opacity.value = d.opacity, p.size.value = d.size * T, p.scale.value = A * 0.5, d.map && (p.map.value = d.map, e(d.map, p.uvTransform)), d.alphaMap && (p.alphaMap.value = d.alphaMap, e(d.alphaMap, p.alphaMapTransform)), d.alphaTest > 0 && (p.alphaTest.value = d.alphaTest);
  }
  function c(p, d) {
    p.diffuse.value.copy(d.color), p.opacity.value = d.opacity, p.rotation.value = d.rotation, d.map && (p.map.value = d.map, e(d.map, p.mapTransform)), d.alphaMap && (p.alphaMap.value = d.alphaMap, e(d.alphaMap, p.alphaMapTransform)), d.alphaTest > 0 && (p.alphaTest.value = d.alphaTest);
  }
  function h(p, d) {
    p.specular.value.copy(d.specular), p.shininess.value = Math.max(d.shininess, 1e-4);
  }
  function u(p, d) {
    d.gradientMap && (p.gradientMap.value = d.gradientMap);
  }
  function f(p, d) {
    p.metalness.value = d.metalness, d.metalnessMap && (p.metalnessMap.value = d.metalnessMap, e(d.metalnessMap, p.metalnessMapTransform)), p.roughness.value = d.roughness, d.roughnessMap && (p.roughnessMap.value = d.roughnessMap, e(d.roughnessMap, p.roughnessMapTransform)), d.envMap && (p.envMapIntensity.value = d.envMapIntensity);
  }
  function m(p, d, T) {
    p.ior.value = d.ior, d.sheen > 0 && (p.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen), p.sheenRoughness.value = d.sheenRoughness, d.sheenColorMap && (p.sheenColorMap.value = d.sheenColorMap, e(d.sheenColorMap, p.sheenColorMapTransform)), d.sheenRoughnessMap && (p.sheenRoughnessMap.value = d.sheenRoughnessMap, e(d.sheenRoughnessMap, p.sheenRoughnessMapTransform))), d.clearcoat > 0 && (p.clearcoat.value = d.clearcoat, p.clearcoatRoughness.value = d.clearcoatRoughness, d.clearcoatMap && (p.clearcoatMap.value = d.clearcoatMap, e(d.clearcoatMap, p.clearcoatMapTransform)), d.clearcoatRoughnessMap && (p.clearcoatRoughnessMap.value = d.clearcoatRoughnessMap, e(d.clearcoatRoughnessMap, p.clearcoatRoughnessMapTransform)), d.clearcoatNormalMap && (p.clearcoatNormalMap.value = d.clearcoatNormalMap, e(d.clearcoatNormalMap, p.clearcoatNormalMapTransform), p.clearcoatNormalScale.value.copy(d.clearcoatNormalScale), d.side === ze && p.clearcoatNormalScale.value.negate())), d.dispersion > 0 && (p.dispersion.value = d.dispersion), d.iridescence > 0 && (p.iridescence.value = d.iridescence, p.iridescenceIOR.value = d.iridescenceIOR, p.iridescenceThicknessMinimum.value = d.iridescenceThicknessRange[0], p.iridescenceThicknessMaximum.value = d.iridescenceThicknessRange[1], d.iridescenceMap && (p.iridescenceMap.value = d.iridescenceMap, e(d.iridescenceMap, p.iridescenceMapTransform)), d.iridescenceThicknessMap && (p.iridescenceThicknessMap.value = d.iridescenceThicknessMap, e(d.iridescenceThicknessMap, p.iridescenceThicknessMapTransform))), d.transmission > 0 && (p.transmission.value = d.transmission, p.transmissionSamplerMap.value = T.texture, p.transmissionSamplerSize.value.set(T.width, T.height), d.transmissionMap && (p.transmissionMap.value = d.transmissionMap, e(d.transmissionMap, p.transmissionMapTransform)), p.thickness.value = d.thickness, d.thicknessMap && (p.thicknessMap.value = d.thicknessMap, e(d.thicknessMap, p.thicknessMapTransform)), p.attenuationDistance.value = d.attenuationDistance, p.attenuationColor.value.copy(d.attenuationColor)), d.anisotropy > 0 && (p.anisotropyVector.value.set(d.anisotropy * Math.cos(d.anisotropyRotation), d.anisotropy * Math.sin(d.anisotropyRotation)), d.anisotropyMap && (p.anisotropyMap.value = d.anisotropyMap, e(d.anisotropyMap, p.anisotropyMapTransform))), p.specularIntensity.value = d.specularIntensity, p.specularColor.value.copy(d.specularColor), d.specularColorMap && (p.specularColorMap.value = d.specularColorMap, e(d.specularColorMap, p.specularColorMapTransform)), d.specularIntensityMap && (p.specularIntensityMap.value = d.specularIntensityMap, e(d.specularIntensityMap, p.specularIntensityMapTransform));
  }
  function _(p, d) {
    d.matcap && (p.matcap.value = d.matcap);
  }
  function v(p, d) {
    const T = t.get(d).light;
    p.referencePosition.value.setFromMatrixPosition(T.matrixWorld), p.nearDistance.value = T.shadow.camera.near, p.farDistance.value = T.shadow.camera.far;
  }
  return {
    refreshFogUniforms: n,
    refreshMaterialUniforms: s
  };
}
function Hm(i, t, e, n) {
  let s = {}, r = {}, o = [];
  const a = i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(T, A) {
    const E = A.program;
    n.uniformBlockBinding(T, E);
  }
  function c(T, A) {
    let E = s[T.id];
    E === void 0 && (_(T), E = h(T), s[T.id] = E, T.addEventListener("dispose", p));
    const b = A.program;
    n.updateUBOMapping(T, b);
    const R = t.render.frame;
    r[T.id] !== R && (f(T), r[T.id] = R);
  }
  function h(T) {
    const A = u();
    T.__bindingPointIndex = A;
    const E = i.createBuffer(), b = T.__size, R = T.usage;
    return i.bindBuffer(i.UNIFORM_BUFFER, E), i.bufferData(i.UNIFORM_BUFFER, b, R), i.bindBuffer(i.UNIFORM_BUFFER, null), i.bindBufferBase(i.UNIFORM_BUFFER, A, E), E;
  }
  function u() {
    for (let T = 0; T < a; T++)
      if (o.indexOf(T) === -1)
        return o.push(T), T;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function f(T) {
    const A = s[T.id], E = T.uniforms, b = T.__cache;
    i.bindBuffer(i.UNIFORM_BUFFER, A);
    for (let R = 0, C = E.length; R < C; R++) {
      const N = Array.isArray(E[R]) ? E[R] : [E[R]];
      for (let M = 0, S = N.length; M < S; M++) {
        const D = N[M];
        if (m(D, R, M, b) === !0) {
          const k = D.__offset, H = Array.isArray(D.value) ? D.value : [D.value];
          let Y = 0;
          for (let W = 0; W < H.length; W++) {
            const X = H[W], j = v(X);
            typeof X == "number" || typeof X == "boolean" ? (D.__data[0] = X, i.bufferSubData(i.UNIFORM_BUFFER, k + Y, D.__data)) : X.isMatrix3 ? (D.__data[0] = X.elements[0], D.__data[1] = X.elements[1], D.__data[2] = X.elements[2], D.__data[3] = 0, D.__data[4] = X.elements[3], D.__data[5] = X.elements[4], D.__data[6] = X.elements[5], D.__data[7] = 0, D.__data[8] = X.elements[6], D.__data[9] = X.elements[7], D.__data[10] = X.elements[8], D.__data[11] = 0) : (X.toArray(D.__data, Y), Y += j.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          i.bufferSubData(i.UNIFORM_BUFFER, k, D.__data);
        }
      }
    }
    i.bindBuffer(i.UNIFORM_BUFFER, null);
  }
  function m(T, A, E, b) {
    const R = T.value, C = A + "_" + E;
    if (b[C] === void 0)
      return typeof R == "number" || typeof R == "boolean" ? b[C] = R : b[C] = R.clone(), !0;
    {
      const N = b[C];
      if (typeof R == "number" || typeof R == "boolean") {
        if (N !== R)
          return b[C] = R, !0;
      } else if (N.equals(R) === !1)
        return N.copy(R), !0;
    }
    return !1;
  }
  function _(T) {
    const A = T.uniforms;
    let E = 0;
    const b = 16;
    for (let C = 0, N = A.length; C < N; C++) {
      const M = Array.isArray(A[C]) ? A[C] : [A[C]];
      for (let S = 0, D = M.length; S < D; S++) {
        const k = M[S], H = Array.isArray(k.value) ? k.value : [k.value];
        for (let Y = 0, W = H.length; Y < W; Y++) {
          const X = H[Y], j = v(X), z = E % b, st = z % j.boundary, ht = z + st;
          E += st, ht !== 0 && b - ht < j.storage && (E += b - ht), k.__data = new Float32Array(j.storage / Float32Array.BYTES_PER_ELEMENT), k.__offset = E, E += j.storage;
        }
      }
    }
    const R = E % b;
    return R > 0 && (E += b - R), T.__size = E, T.__cache = {}, this;
  }
  function v(T) {
    const A = {
      boundary: 0,
      // bytes
      storage: 0
      // bytes
    };
    return typeof T == "number" || typeof T == "boolean" ? (A.boundary = 4, A.storage = 4) : T.isVector2 ? (A.boundary = 8, A.storage = 8) : T.isVector3 || T.isColor ? (A.boundary = 16, A.storage = 12) : T.isVector4 ? (A.boundary = 16, A.storage = 16) : T.isMatrix3 ? (A.boundary = 48, A.storage = 48) : T.isMatrix4 ? (A.boundary = 64, A.storage = 64) : T.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", T), A;
  }
  function p(T) {
    const A = T.target;
    A.removeEventListener("dispose", p);
    const E = o.indexOf(A.__bindingPointIndex);
    o.splice(E, 1), i.deleteBuffer(s[A.id]), delete s[A.id], delete r[A.id];
  }
  function d() {
    for (const T in s)
      i.deleteBuffer(s[T]);
    o = [], s = {}, r = {};
  }
  return {
    bind: l,
    update: c,
    dispose: d
  };
}
class Vm {
  /**
   * Constructs a new WebGL renderer.
   *
   * @param {WebGLRenderer~Options} [parameters] - The configuration parameter.
   */
  constructor(t = {}) {
    const {
      canvas: e = xh(),
      context: n = null,
      depth: s = !0,
      stencil: r = !1,
      alpha: o = !1,
      antialias: a = !1,
      premultipliedAlpha: l = !0,
      preserveDrawingBuffer: c = !1,
      powerPreference: h = "default",
      failIfMajorPerformanceCaveat: u = !1,
      reversedDepthBuffer: f = !1
    } = t;
    this.isWebGLRenderer = !0;
    let m;
    if (n !== null) {
      if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext)
        throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      m = n.getContextAttributes().alpha;
    } else
      m = o;
    const _ = new Uint32Array(4), v = new Int32Array(4);
    let p = null, d = null;
    const T = [], A = [];
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
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this.toneMapping = zn, this.toneMappingExposure = 1, this.transmissionResolutionScale = 1;
    const E = this;
    let b = !1;
    this._outputColorSpace = ke;
    let R = 0, C = 0, N = null, M = -1, S = null;
    const D = new fe(), k = new fe();
    let H = null;
    const Y = new qt(0);
    let W = 0, X = e.width, j = e.height, z = 1, st = null, ht = null;
    const _t = new fe(0, 0, X, j), Ht = new fe(0, 0, X, j);
    let Jt = !1;
    const Gt = new Ga();
    let Ft = !1, $ = !1;
    const K = new oe(), ut = new L(), Pt = new fe(), yt = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 };
    let $t = !1;
    function we() {
      return N === null ? z : 1;
    }
    let w = n;
    function le(x, I) {
      return e.getContext(x, I);
    }
    try {
      const x = {
        alpha: !0,
        depth: s,
        stencil: r,
        antialias: a,
        premultipliedAlpha: l,
        preserveDrawingBuffer: c,
        powerPreference: h,
        failIfMajorPerformanceCaveat: u
      };
      if ("setAttribute" in e && e.setAttribute("data-engine", `three.js r${Ia}`), e.addEventListener("webglcontextlost", rt, !1), e.addEventListener("webglcontextrestored", ft, !1), e.addEventListener("webglcontextcreationerror", J, !1), w === null) {
        const I = "webgl2";
        if (w = le(I, x), w === null)
          throw le(I) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (x) {
      throw console.error("THREE.WebGLRenderer: " + x.message), x;
    }
    let Ut, Rt, gt, ce, vt, kt, Ee, pe, y, g, F, G, Z, V, Et, it, xt, Mt, tt, ct, wt, St, ot, Ot;
    function P() {
      Ut = new Jf(w), Ut.init(), St = new Um(w, Ut), Rt = new Xf(w, Ut, t, St), gt = new Lm(w, Ut), Rt.reversedDepthBuffer && f && gt.buffers.depth.setReversed(!0), ce = new ep(w), vt = new xm(), kt = new Im(w, Ut, gt, vt, Rt, St, ce), Ee = new qf(E), pe = new Zf(E), y = new ad(w), ot = new Gf(w, y), g = new Qf(w, y, ce, ot), F = new ip(w, g, y, ce), tt = new np(w, Rt, kt), it = new $f(vt), G = new vm(E, Ee, pe, Ut, Rt, ot, it), Z = new zm(E, vt), V = new Sm(), Et = new wm(Ut), Mt = new Vf(E, Ee, pe, gt, F, m, l), xt = new Pm(E, F, Rt), Ot = new Hm(w, ce, Rt, gt), ct = new Wf(w, Ut, ce), wt = new tp(w, Ut, ce), ce.programs = G.programs, E.capabilities = Rt, E.extensions = Ut, E.properties = vt, E.renderLists = V, E.shadowMap = xt, E.state = gt, E.info = ce;
    }
    P();
    const et = new Bm(E, w);
    this.xr = et, this.getContext = function() {
      return w;
    }, this.getContextAttributes = function() {
      return w.getContextAttributes();
    }, this.forceContextLoss = function() {
      const x = Ut.get("WEBGL_lose_context");
      x && x.loseContext();
    }, this.forceContextRestore = function() {
      const x = Ut.get("WEBGL_lose_context");
      x && x.restoreContext();
    }, this.getPixelRatio = function() {
      return z;
    }, this.setPixelRatio = function(x) {
      x !== void 0 && (z = x, this.setSize(X, j, !1));
    }, this.getSize = function(x) {
      return x.set(X, j);
    }, this.setSize = function(x, I, O = !0) {
      if (et.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      X = x, j = I, e.width = Math.floor(x * z), e.height = Math.floor(I * z), O === !0 && (e.style.width = x + "px", e.style.height = I + "px"), this.setViewport(0, 0, x, I);
    }, this.getDrawingBufferSize = function(x) {
      return x.set(X * z, j * z).floor();
    }, this.setDrawingBufferSize = function(x, I, O) {
      X = x, j = I, z = O, e.width = Math.floor(x * O), e.height = Math.floor(I * O), this.setViewport(0, 0, x, I);
    }, this.getCurrentViewport = function(x) {
      return x.copy(D);
    }, this.getViewport = function(x) {
      return x.copy(_t);
    }, this.setViewport = function(x, I, O, B) {
      x.isVector4 ? _t.set(x.x, x.y, x.z, x.w) : _t.set(x, I, O, B), gt.viewport(D.copy(_t).multiplyScalar(z).round());
    }, this.getScissor = function(x) {
      return x.copy(Ht);
    }, this.setScissor = function(x, I, O, B) {
      x.isVector4 ? Ht.set(x.x, x.y, x.z, x.w) : Ht.set(x, I, O, B), gt.scissor(k.copy(Ht).multiplyScalar(z).round());
    }, this.getScissorTest = function() {
      return Jt;
    }, this.setScissorTest = function(x) {
      gt.setScissorTest(Jt = x);
    }, this.setOpaqueSort = function(x) {
      st = x;
    }, this.setTransparentSort = function(x) {
      ht = x;
    }, this.getClearColor = function(x) {
      return x.copy(Mt.getClearColor());
    }, this.setClearColor = function() {
      Mt.setClearColor(...arguments);
    }, this.getClearAlpha = function() {
      return Mt.getClearAlpha();
    }, this.setClearAlpha = function() {
      Mt.setClearAlpha(...arguments);
    }, this.clear = function(x = !0, I = !0, O = !0) {
      let B = 0;
      if (x) {
        let U = !1;
        if (N !== null) {
          const Q = N.texture.format;
          U = Q === ka || Q === Ba || Q === Oa;
        }
        if (U) {
          const Q = N.texture.type, lt = Q === vn || Q === si || Q === es || Q === ns || Q === Na || Q === Fa, pt = Mt.getClearColor(), dt = Mt.getClearAlpha(), At = pt.r, Ct = pt.g, bt = pt.b;
          lt ? (_[0] = At, _[1] = Ct, _[2] = bt, _[3] = dt, w.clearBufferuiv(w.COLOR, 0, _)) : (v[0] = At, v[1] = Ct, v[2] = bt, v[3] = dt, w.clearBufferiv(w.COLOR, 0, v));
        } else
          B |= w.COLOR_BUFFER_BIT;
      }
      I && (B |= w.DEPTH_BUFFER_BIT), O && (B |= w.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), w.clear(B);
    }, this.clearColor = function() {
      this.clear(!0, !1, !1);
    }, this.clearDepth = function() {
      this.clear(!1, !0, !1);
    }, this.clearStencil = function() {
      this.clear(!1, !1, !0);
    }, this.dispose = function() {
      e.removeEventListener("webglcontextlost", rt, !1), e.removeEventListener("webglcontextrestored", ft, !1), e.removeEventListener("webglcontextcreationerror", J, !1), Mt.dispose(), V.dispose(), Et.dispose(), vt.dispose(), Ee.dispose(), pe.dispose(), F.dispose(), ot.dispose(), Ot.dispose(), G.dispose(), et.dispose(), et.removeEventListener("sessionstart", ln), et.removeEventListener("sessionend", ja), Wn.stop();
    };
    function rt(x) {
      x.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), b = !0;
    }
    function ft() {
      console.log("THREE.WebGLRenderer: Context Restored."), b = !1;
      const x = ce.autoReset, I = xt.enabled, O = xt.autoUpdate, B = xt.needsUpdate, U = xt.type;
      P(), ce.autoReset = x, xt.enabled = I, xt.autoUpdate = O, xt.needsUpdate = B, xt.type = U;
    }
    function J(x) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", x.statusMessage);
    }
    function q(x) {
      const I = x.target;
      I.removeEventListener("dispose", q), mt(I);
    }
    function mt(x) {
      Lt(x), vt.remove(x);
    }
    function Lt(x) {
      const I = vt.get(x).programs;
      I !== void 0 && (I.forEach(function(O) {
        G.releaseProgram(O);
      }), x.isShaderMaterial && G.releaseShaderCache(x));
    }
    this.renderBufferDirect = function(x, I, O, B, U, Q) {
      I === null && (I = yt);
      const lt = U.isMesh && U.matrixWorld.determinant() < 0, pt = sc(x, I, O, B, U);
      gt.setMaterial(B, lt);
      let dt = O.index, At = 1;
      if (B.wireframe === !0) {
        if (dt = g.getWireframeAttribute(O), dt === void 0) return;
        At = 2;
      }
      const Ct = O.drawRange, bt = O.attributes.position;
      let Wt = Ct.start * At, Qt = (Ct.start + Ct.count) * At;
      Q !== null && (Wt = Math.max(Wt, Q.start * At), Qt = Math.min(Qt, (Q.start + Q.count) * At)), dt !== null ? (Wt = Math.max(Wt, 0), Qt = Math.min(Qt, dt.count)) : bt != null && (Wt = Math.max(Wt, 0), Qt = Math.min(Qt, bt.count));
      const ue = Qt - Wt;
      if (ue < 0 || ue === 1 / 0) return;
      ot.setup(U, B, pt, O, dt);
      let ae, ne = ct;
      if (dt !== null && (ae = y.get(dt), ne = wt, ne.setIndex(ae)), U.isMesh)
        B.wireframe === !0 ? (gt.setLineWidth(B.wireframeLinewidth * we()), ne.setMode(w.LINES)) : ne.setMode(w.TRIANGLES);
      else if (U.isLine) {
        let Tt = B.linewidth;
        Tt === void 0 && (Tt = 1), gt.setLineWidth(Tt * we()), U.isLineSegments ? ne.setMode(w.LINES) : U.isLineLoop ? ne.setMode(w.LINE_LOOP) : ne.setMode(w.LINE_STRIP);
      } else U.isPoints ? ne.setMode(w.POINTS) : U.isSprite && ne.setMode(w.TRIANGLES);
      if (U.isBatchedMesh)
        if (U._multiDrawInstances !== null)
          as("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."), ne.renderMultiDrawInstances(U._multiDrawStarts, U._multiDrawCounts, U._multiDrawCount, U._multiDrawInstances);
        else if (Ut.get("WEBGL_multi_draw"))
          ne.renderMultiDraw(U._multiDrawStarts, U._multiDrawCounts, U._multiDrawCount);
        else {
          const Tt = U._multiDrawStarts, he = U._multiDrawCounts, Yt = U._multiDrawCount, He = dt ? y.get(dt).bytesPerElement : 1, li = vt.get(B).currentProgram.getUniforms();
          for (let Ve = 0; Ve < Yt; Ve++)
            li.setValue(w, "_gl_DrawID", Ve), ne.render(Tt[Ve] / He, he[Ve]);
        }
      else if (U.isInstancedMesh)
        ne.renderInstances(Wt, ue, U.count);
      else if (O.isInstancedBufferGeometry) {
        const Tt = O._maxInstanceCount !== void 0 ? O._maxInstanceCount : 1 / 0, he = Math.min(O.instanceCount, Tt);
        ne.renderInstances(Wt, ue, he);
      } else
        ne.render(Wt, ue);
    };
    function se(x, I, O) {
      x.transparent === !0 && x.side === hn && x.forceSinglePass === !1 ? (x.side = ze, x.needsUpdate = !0, us(x, I, O), x.side = Hn, x.needsUpdate = !0, us(x, I, O), x.side = hn) : us(x, I, O);
    }
    this.compile = function(x, I, O = null) {
      O === null && (O = x), d = Et.get(O), d.init(I), A.push(d), O.traverseVisible(function(U) {
        U.isLight && U.layers.test(I.layers) && (d.pushLight(U), U.castShadow && d.pushShadow(U));
      }), x !== O && x.traverseVisible(function(U) {
        U.isLight && U.layers.test(I.layers) && (d.pushLight(U), U.castShadow && d.pushShadow(U));
      }), d.setupLights();
      const B = /* @__PURE__ */ new Set();
      return x.traverse(function(U) {
        if (!(U.isMesh || U.isPoints || U.isLine || U.isSprite))
          return;
        const Q = U.material;
        if (Q)
          if (Array.isArray(Q))
            for (let lt = 0; lt < Q.length; lt++) {
              const pt = Q[lt];
              se(pt, O, U), B.add(pt);
            }
          else
            se(Q, O, U), B.add(Q);
      }), d = A.pop(), B;
    }, this.compileAsync = function(x, I, O = null) {
      const B = this.compile(x, I, O);
      return new Promise((U) => {
        function Q() {
          if (B.forEach(function(lt) {
            vt.get(lt).currentProgram.isReady() && B.delete(lt);
          }), B.size === 0) {
            U(x);
            return;
          }
          setTimeout(Q, 10);
        }
        Ut.get("KHR_parallel_shader_compile") !== null ? Q() : setTimeout(Q, 10);
      });
    };
    let Kt = null;
    function Mn(x) {
      Kt && Kt(x);
    }
    function ln() {
      Wn.stop();
    }
    function ja() {
      Wn.start();
    }
    const Wn = new ql();
    Wn.setAnimationLoop(Mn), typeof self < "u" && Wn.setContext(self), this.setAnimationLoop = function(x) {
      Kt = x, et.setAnimationLoop(x), x === null ? Wn.stop() : Wn.start();
    }, et.addEventListener("sessionstart", ln), et.addEventListener("sessionend", ja), this.render = function(x, I) {
      if (I !== void 0 && I.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (b === !0) return;
      if (x.matrixWorldAutoUpdate === !0 && x.updateMatrixWorld(), I.parent === null && I.matrixWorldAutoUpdate === !0 && I.updateMatrixWorld(), et.enabled === !0 && et.isPresenting === !0 && (et.cameraAutoUpdate === !0 && et.updateCamera(I), I = et.getCamera()), x.isScene === !0 && x.onBeforeRender(E, x, I, N), d = Et.get(x, A.length), d.init(I), A.push(d), K.multiplyMatrices(I.projectionMatrix, I.matrixWorldInverse), Gt.setFromProjectionMatrix(K, pn, I.reversedDepth), $ = this.localClippingEnabled, Ft = it.init(this.clippingPlanes, $), p = V.get(x, T.length), p.init(), T.push(p), et.enabled === !0 && et.isPresenting === !0) {
        const Q = E.xr.getDepthSensingMesh();
        Q !== null && nr(Q, I, -1 / 0, E.sortObjects);
      }
      nr(x, I, 0, E.sortObjects), p.finish(), E.sortObjects === !0 && p.sort(st, ht), $t = et.enabled === !1 || et.isPresenting === !1 || et.hasDepthSensing() === !1, $t && Mt.addToRenderList(p, x), this.info.render.frame++, Ft === !0 && it.beginShadows();
      const O = d.state.shadowsArray;
      xt.render(O, x, I), Ft === !0 && it.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const B = p.opaque, U = p.transmissive;
      if (d.setupLights(), I.isArrayCamera) {
        const Q = I.cameras;
        if (U.length > 0)
          for (let lt = 0, pt = Q.length; lt < pt; lt++) {
            const dt = Q[lt];
            Za(B, U, x, dt);
          }
        $t && Mt.render(x);
        for (let lt = 0, pt = Q.length; lt < pt; lt++) {
          const dt = Q[lt];
          Ka(p, x, dt, dt.viewport);
        }
      } else
        U.length > 0 && Za(B, U, x, I), $t && Mt.render(x), Ka(p, x, I);
      N !== null && C === 0 && (kt.updateMultisampleRenderTarget(N), kt.updateRenderTargetMipmap(N)), x.isScene === !0 && x.onAfterRender(E, x, I), ot.resetDefaultState(), M = -1, S = null, A.pop(), A.length > 0 ? (d = A[A.length - 1], Ft === !0 && it.setGlobalState(E.clippingPlanes, d.state.camera)) : d = null, T.pop(), T.length > 0 ? p = T[T.length - 1] : p = null;
    };
    function nr(x, I, O, B) {
      if (x.visible === !1) return;
      if (x.layers.test(I.layers)) {
        if (x.isGroup)
          O = x.renderOrder;
        else if (x.isLOD)
          x.autoUpdate === !0 && x.update(I);
        else if (x.isLight)
          d.pushLight(x), x.castShadow && d.pushShadow(x);
        else if (x.isSprite) {
          if (!x.frustumCulled || Gt.intersectsSprite(x)) {
            B && Pt.setFromMatrixPosition(x.matrixWorld).applyMatrix4(K);
            const lt = F.update(x), pt = x.material;
            pt.visible && p.push(x, lt, pt, O, Pt.z, null);
          }
        } else if ((x.isMesh || x.isLine || x.isPoints) && (!x.frustumCulled || Gt.intersectsObject(x))) {
          const lt = F.update(x), pt = x.material;
          if (B && (x.boundingSphere !== void 0 ? (x.boundingSphere === null && x.computeBoundingSphere(), Pt.copy(x.boundingSphere.center)) : (lt.boundingSphere === null && lt.computeBoundingSphere(), Pt.copy(lt.boundingSphere.center)), Pt.applyMatrix4(x.matrixWorld).applyMatrix4(K)), Array.isArray(pt)) {
            const dt = lt.groups;
            for (let At = 0, Ct = dt.length; At < Ct; At++) {
              const bt = dt[At], Wt = pt[bt.materialIndex];
              Wt && Wt.visible && p.push(x, lt, Wt, O, Pt.z, bt);
            }
          } else pt.visible && p.push(x, lt, pt, O, Pt.z, null);
        }
      }
      const Q = x.children;
      for (let lt = 0, pt = Q.length; lt < pt; lt++)
        nr(Q[lt], I, O, B);
    }
    function Ka(x, I, O, B) {
      const U = x.opaque, Q = x.transmissive, lt = x.transparent;
      d.setupLightsView(O), Ft === !0 && it.setGlobalState(E.clippingPlanes, O), B && gt.viewport(D.copy(B)), U.length > 0 && ds(U, I, O), Q.length > 0 && ds(Q, I, O), lt.length > 0 && ds(lt, I, O), gt.buffers.depth.setTest(!0), gt.buffers.depth.setMask(!0), gt.buffers.color.setMask(!0), gt.setPolygonOffset(!1);
    }
    function Za(x, I, O, B) {
      if ((O.isScene === !0 ? O.overrideMaterial : null) !== null)
        return;
      d.state.transmissionRenderTarget[B.id] === void 0 && (d.state.transmissionRenderTarget[B.id] = new ai(1, 1, {
        generateMipmaps: !0,
        type: Ut.has("EXT_color_buffer_half_float") || Ut.has("EXT_color_buffer_float") ? cs : vn,
        minFilter: ni,
        samples: 4,
        stencilBuffer: r,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: jt.workingColorSpace
      }));
      const Q = d.state.transmissionRenderTarget[B.id], lt = B.viewport || D;
      Q.setSize(lt.z * E.transmissionResolutionScale, lt.w * E.transmissionResolutionScale);
      const pt = E.getRenderTarget(), dt = E.getActiveCubeFace(), At = E.getActiveMipmapLevel();
      E.setRenderTarget(Q), E.getClearColor(Y), W = E.getClearAlpha(), W < 1 && E.setClearColor(16777215, 0.5), E.clear(), $t && Mt.render(O);
      const Ct = E.toneMapping;
      E.toneMapping = zn;
      const bt = B.viewport;
      if (B.viewport !== void 0 && (B.viewport = void 0), d.setupLightsView(B), Ft === !0 && it.setGlobalState(E.clippingPlanes, B), ds(x, O, B), kt.updateMultisampleRenderTarget(Q), kt.updateRenderTargetMipmap(Q), Ut.has("WEBGL_multisampled_render_to_texture") === !1) {
        let Wt = !1;
        for (let Qt = 0, ue = I.length; Qt < ue; Qt++) {
          const ae = I[Qt], ne = ae.object, Tt = ae.geometry, he = ae.material, Yt = ae.group;
          if (he.side === hn && ne.layers.test(B.layers)) {
            const He = he.side;
            he.side = ze, he.needsUpdate = !0, Ja(ne, O, B, Tt, he, Yt), he.side = He, he.needsUpdate = !0, Wt = !0;
          }
        }
        Wt === !0 && (kt.updateMultisampleRenderTarget(Q), kt.updateRenderTargetMipmap(Q));
      }
      E.setRenderTarget(pt, dt, At), E.setClearColor(Y, W), bt !== void 0 && (B.viewport = bt), E.toneMapping = Ct;
    }
    function ds(x, I, O) {
      const B = I.isScene === !0 ? I.overrideMaterial : null;
      for (let U = 0, Q = x.length; U < Q; U++) {
        const lt = x[U], pt = lt.object, dt = lt.geometry, At = lt.group;
        let Ct = lt.material;
        Ct.allowOverride === !0 && B !== null && (Ct = B), pt.layers.test(O.layers) && Ja(pt, I, O, dt, Ct, At);
      }
    }
    function Ja(x, I, O, B, U, Q) {
      x.onBeforeRender(E, I, O, B, U, Q), x.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse, x.matrixWorld), x.normalMatrix.getNormalMatrix(x.modelViewMatrix), U.onBeforeRender(E, I, O, B, x, Q), U.transparent === !0 && U.side === hn && U.forceSinglePass === !1 ? (U.side = ze, U.needsUpdate = !0, E.renderBufferDirect(O, I, B, U, x, Q), U.side = Hn, U.needsUpdate = !0, E.renderBufferDirect(O, I, B, U, x, Q), U.side = hn) : E.renderBufferDirect(O, I, B, U, x, Q), x.onAfterRender(E, I, O, B, U, Q);
    }
    function us(x, I, O) {
      I.isScene !== !0 && (I = yt);
      const B = vt.get(x), U = d.state.lights, Q = d.state.shadowsArray, lt = U.state.version, pt = G.getParameters(x, U.state, Q, I, O), dt = G.getProgramCacheKey(pt);
      let At = B.programs;
      B.environment = x.isMeshStandardMaterial ? I.environment : null, B.fog = I.fog, B.envMap = (x.isMeshStandardMaterial ? pe : Ee).get(x.envMap || B.environment), B.envMapRotation = B.environment !== null && x.envMap === null ? I.environmentRotation : x.envMapRotation, At === void 0 && (x.addEventListener("dispose", q), At = /* @__PURE__ */ new Map(), B.programs = At);
      let Ct = At.get(dt);
      if (Ct !== void 0) {
        if (B.currentProgram === Ct && B.lightsStateVersion === lt)
          return to(x, pt), Ct;
      } else
        pt.uniforms = G.getUniforms(x), x.onBeforeCompile(pt, E), Ct = G.acquireProgram(pt, dt), At.set(dt, Ct), B.uniforms = pt.uniforms;
      const bt = B.uniforms;
      return (!x.isShaderMaterial && !x.isRawShaderMaterial || x.clipping === !0) && (bt.clippingPlanes = it.uniform), to(x, pt), B.needsLights = ac(x), B.lightsStateVersion = lt, B.needsLights && (bt.ambientLightColor.value = U.state.ambient, bt.lightProbe.value = U.state.probe, bt.directionalLights.value = U.state.directional, bt.directionalLightShadows.value = U.state.directionalShadow, bt.spotLights.value = U.state.spot, bt.spotLightShadows.value = U.state.spotShadow, bt.rectAreaLights.value = U.state.rectArea, bt.ltc_1.value = U.state.rectAreaLTC1, bt.ltc_2.value = U.state.rectAreaLTC2, bt.pointLights.value = U.state.point, bt.pointLightShadows.value = U.state.pointShadow, bt.hemisphereLights.value = U.state.hemi, bt.directionalShadowMap.value = U.state.directionalShadowMap, bt.directionalShadowMatrix.value = U.state.directionalShadowMatrix, bt.spotShadowMap.value = U.state.spotShadowMap, bt.spotLightMatrix.value = U.state.spotLightMatrix, bt.spotLightMap.value = U.state.spotLightMap, bt.pointShadowMap.value = U.state.pointShadowMap, bt.pointShadowMatrix.value = U.state.pointShadowMatrix), B.currentProgram = Ct, B.uniformsList = null, Ct;
    }
    function Qa(x) {
      if (x.uniformsList === null) {
        const I = x.currentProgram.getUniforms();
        x.uniformsList = Ws.seqWithValue(I.seq, x.uniforms);
      }
      return x.uniformsList;
    }
    function to(x, I) {
      const O = vt.get(x);
      O.outputColorSpace = I.outputColorSpace, O.batching = I.batching, O.batchingColor = I.batchingColor, O.instancing = I.instancing, O.instancingColor = I.instancingColor, O.instancingMorph = I.instancingMorph, O.skinning = I.skinning, O.morphTargets = I.morphTargets, O.morphNormals = I.morphNormals, O.morphColors = I.morphColors, O.morphTargetsCount = I.morphTargetsCount, O.numClippingPlanes = I.numClippingPlanes, O.numIntersection = I.numClipIntersection, O.vertexAlphas = I.vertexAlphas, O.vertexTangents = I.vertexTangents, O.toneMapping = I.toneMapping;
    }
    function sc(x, I, O, B, U) {
      I.isScene !== !0 && (I = yt), kt.resetTextureUnits();
      const Q = I.fog, lt = B.isMeshStandardMaterial ? I.environment : null, pt = N === null ? E.outputColorSpace : N.isXRRenderTarget === !0 ? N.texture.colorSpace : Bi, dt = (B.isMeshStandardMaterial ? pe : Ee).get(B.envMap || lt), At = B.vertexColors === !0 && !!O.attributes.color && O.attributes.color.itemSize === 4, Ct = !!O.attributes.tangent && (!!B.normalMap || B.anisotropy > 0), bt = !!O.morphAttributes.position, Wt = !!O.morphAttributes.normal, Qt = !!O.morphAttributes.color;
      let ue = zn;
      B.toneMapped && (N === null || N.isXRRenderTarget === !0) && (ue = E.toneMapping);
      const ae = O.morphAttributes.position || O.morphAttributes.normal || O.morphAttributes.color, ne = ae !== void 0 ? ae.length : 0, Tt = vt.get(B), he = d.state.lights;
      if (Ft === !0 && ($ === !0 || x !== S)) {
        const Le = x === S && B.id === M;
        it.setState(B, x, Le);
      }
      let Yt = !1;
      B.version === Tt.__version ? (Tt.needsLights && Tt.lightsStateVersion !== he.state.version || Tt.outputColorSpace !== pt || U.isBatchedMesh && Tt.batching === !1 || !U.isBatchedMesh && Tt.batching === !0 || U.isBatchedMesh && Tt.batchingColor === !0 && U.colorTexture === null || U.isBatchedMesh && Tt.batchingColor === !1 && U.colorTexture !== null || U.isInstancedMesh && Tt.instancing === !1 || !U.isInstancedMesh && Tt.instancing === !0 || U.isSkinnedMesh && Tt.skinning === !1 || !U.isSkinnedMesh && Tt.skinning === !0 || U.isInstancedMesh && Tt.instancingColor === !0 && U.instanceColor === null || U.isInstancedMesh && Tt.instancingColor === !1 && U.instanceColor !== null || U.isInstancedMesh && Tt.instancingMorph === !0 && U.morphTexture === null || U.isInstancedMesh && Tt.instancingMorph === !1 && U.morphTexture !== null || Tt.envMap !== dt || B.fog === !0 && Tt.fog !== Q || Tt.numClippingPlanes !== void 0 && (Tt.numClippingPlanes !== it.numPlanes || Tt.numIntersection !== it.numIntersection) || Tt.vertexAlphas !== At || Tt.vertexTangents !== Ct || Tt.morphTargets !== bt || Tt.morphNormals !== Wt || Tt.morphColors !== Qt || Tt.toneMapping !== ue || Tt.morphTargetsCount !== ne) && (Yt = !0) : (Yt = !0, Tt.__version = B.version);
      let He = Tt.currentProgram;
      Yt === !0 && (He = us(B, I, U));
      let li = !1, Ve = !1, $i = !1;
      const de = He.getUniforms(), $e = Tt.uniforms;
      if (gt.useProgram(He.program) && (li = !0, Ve = !0, $i = !0), B.id !== M && (M = B.id, Ve = !0), li || S !== x) {
        gt.buffers.depth.getReversed() && x.reversedDepth !== !0 && (x._reversedDepth = !0, x.updateProjectionMatrix()), de.setValue(w, "projectionMatrix", x.projectionMatrix), de.setValue(w, "viewMatrix", x.matrixWorldInverse);
        const Oe = de.map.cameraPosition;
        Oe !== void 0 && Oe.setValue(w, ut.setFromMatrixPosition(x.matrixWorld)), Rt.logarithmicDepthBuffer && de.setValue(
          w,
          "logDepthBufFC",
          2 / (Math.log(x.far + 1) / Math.LN2)
        ), (B.isMeshPhongMaterial || B.isMeshToonMaterial || B.isMeshLambertMaterial || B.isMeshBasicMaterial || B.isMeshStandardMaterial || B.isShaderMaterial) && de.setValue(w, "isOrthographic", x.isOrthographicCamera === !0), S !== x && (S = x, Ve = !0, $i = !0);
      }
      if (U.isSkinnedMesh) {
        de.setOptional(w, U, "bindMatrix"), de.setOptional(w, U, "bindMatrixInverse");
        const Le = U.skeleton;
        Le && (Le.boneTexture === null && Le.computeBoneTexture(), de.setValue(w, "boneTexture", Le.boneTexture, kt));
      }
      U.isBatchedMesh && (de.setOptional(w, U, "batchingTexture"), de.setValue(w, "batchingTexture", U._matricesTexture, kt), de.setOptional(w, U, "batchingIdTexture"), de.setValue(w, "batchingIdTexture", U._indirectTexture, kt), de.setOptional(w, U, "batchingColorTexture"), U._colorsTexture !== null && de.setValue(w, "batchingColorTexture", U._colorsTexture, kt));
      const qe = O.morphAttributes;
      if ((qe.position !== void 0 || qe.normal !== void 0 || qe.color !== void 0) && tt.update(U, O, He), (Ve || Tt.receiveShadow !== U.receiveShadow) && (Tt.receiveShadow = U.receiveShadow, de.setValue(w, "receiveShadow", U.receiveShadow)), B.isMeshGouraudMaterial && B.envMap !== null && ($e.envMap.value = dt, $e.flipEnvMap.value = dt.isCubeTexture && dt.isRenderTargetTexture === !1 ? -1 : 1), B.isMeshStandardMaterial && B.envMap === null && I.environment !== null && ($e.envMapIntensity.value = I.environmentIntensity), Ve && (de.setValue(w, "toneMappingExposure", E.toneMappingExposure), Tt.needsLights && rc($e, $i), Q && B.fog === !0 && Z.refreshFogUniforms($e, Q), Z.refreshMaterialUniforms($e, B, z, j, d.state.transmissionRenderTarget[x.id]), Ws.upload(w, Qa(Tt), $e, kt)), B.isShaderMaterial && B.uniformsNeedUpdate === !0 && (Ws.upload(w, Qa(Tt), $e, kt), B.uniformsNeedUpdate = !1), B.isSpriteMaterial && de.setValue(w, "center", U.center), de.setValue(w, "modelViewMatrix", U.modelViewMatrix), de.setValue(w, "normalMatrix", U.normalMatrix), de.setValue(w, "modelMatrix", U.matrixWorld), B.isShaderMaterial || B.isRawShaderMaterial) {
        const Le = B.uniformsGroups;
        for (let Oe = 0, ir = Le.length; Oe < ir; Oe++) {
          const Xn = Le[Oe];
          Ot.update(Xn, He), Ot.bind(Xn, He);
        }
      }
      return He;
    }
    function rc(x, I) {
      x.ambientLightColor.needsUpdate = I, x.lightProbe.needsUpdate = I, x.directionalLights.needsUpdate = I, x.directionalLightShadows.needsUpdate = I, x.pointLights.needsUpdate = I, x.pointLightShadows.needsUpdate = I, x.spotLights.needsUpdate = I, x.spotLightShadows.needsUpdate = I, x.rectAreaLights.needsUpdate = I, x.hemisphereLights.needsUpdate = I;
    }
    function ac(x) {
      return x.isMeshLambertMaterial || x.isMeshToonMaterial || x.isMeshPhongMaterial || x.isMeshStandardMaterial || x.isShadowMaterial || x.isShaderMaterial && x.lights === !0;
    }
    this.getActiveCubeFace = function() {
      return R;
    }, this.getActiveMipmapLevel = function() {
      return C;
    }, this.getRenderTarget = function() {
      return N;
    }, this.setRenderTargetTextures = function(x, I, O) {
      const B = vt.get(x);
      B.__autoAllocateDepthBuffer = x.resolveDepthBuffer === !1, B.__autoAllocateDepthBuffer === !1 && (B.__useRenderToTexture = !1), vt.get(x.texture).__webglTexture = I, vt.get(x.depthTexture).__webglTexture = B.__autoAllocateDepthBuffer ? void 0 : O, B.__hasExternalTextures = !0;
    }, this.setRenderTargetFramebuffer = function(x, I) {
      const O = vt.get(x);
      O.__webglFramebuffer = I, O.__useDefaultFramebuffer = I === void 0;
    };
    const oc = w.createFramebuffer();
    this.setRenderTarget = function(x, I = 0, O = 0) {
      N = x, R = I, C = O;
      let B = !0, U = null, Q = !1, lt = !1;
      if (x) {
        const dt = vt.get(x);
        if (dt.__useDefaultFramebuffer !== void 0)
          gt.bindFramebuffer(w.FRAMEBUFFER, null), B = !1;
        else if (dt.__webglFramebuffer === void 0)
          kt.setupRenderTarget(x);
        else if (dt.__hasExternalTextures)
          kt.rebindTextures(x, vt.get(x.texture).__webglTexture, vt.get(x.depthTexture).__webglTexture);
        else if (x.depthBuffer) {
          const bt = x.depthTexture;
          if (dt.__boundDepthTexture !== bt) {
            if (bt !== null && vt.has(bt) && (x.width !== bt.image.width || x.height !== bt.image.height))
              throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
            kt.setupDepthRenderbuffer(x);
          }
        }
        const At = x.texture;
        (At.isData3DTexture || At.isDataArrayTexture || At.isCompressedArrayTexture) && (lt = !0);
        const Ct = vt.get(x).__webglFramebuffer;
        x.isWebGLCubeRenderTarget ? (Array.isArray(Ct[I]) ? U = Ct[I][O] : U = Ct[I], Q = !0) : x.samples > 0 && kt.useMultisampledRTT(x) === !1 ? U = vt.get(x).__webglMultisampledFramebuffer : Array.isArray(Ct) ? U = Ct[O] : U = Ct, D.copy(x.viewport), k.copy(x.scissor), H = x.scissorTest;
      } else
        D.copy(_t).multiplyScalar(z).floor(), k.copy(Ht).multiplyScalar(z).floor(), H = Jt;
      if (O !== 0 && (U = oc), gt.bindFramebuffer(w.FRAMEBUFFER, U) && B && gt.drawBuffers(x, U), gt.viewport(D), gt.scissor(k), gt.setScissorTest(H), Q) {
        const dt = vt.get(x.texture);
        w.framebufferTexture2D(w.FRAMEBUFFER, w.COLOR_ATTACHMENT0, w.TEXTURE_CUBE_MAP_POSITIVE_X + I, dt.__webglTexture, O);
      } else if (lt) {
        const dt = I;
        for (let At = 0; At < x.textures.length; At++) {
          const Ct = vt.get(x.textures[At]);
          w.framebufferTextureLayer(w.FRAMEBUFFER, w.COLOR_ATTACHMENT0 + At, Ct.__webglTexture, O, dt);
        }
      } else if (x !== null && O !== 0) {
        const dt = vt.get(x.texture);
        w.framebufferTexture2D(w.FRAMEBUFFER, w.COLOR_ATTACHMENT0, w.TEXTURE_2D, dt.__webglTexture, O);
      }
      M = -1;
    }, this.readRenderTargetPixels = function(x, I, O, B, U, Q, lt, pt = 0) {
      if (!(x && x.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let dt = vt.get(x).__webglFramebuffer;
      if (x.isWebGLCubeRenderTarget && lt !== void 0 && (dt = dt[lt]), dt) {
        gt.bindFramebuffer(w.FRAMEBUFFER, dt);
        try {
          const At = x.textures[pt], Ct = At.format, bt = At.type;
          if (!Rt.textureFormatReadable(Ct)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!Rt.textureTypeReadable(bt)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          I >= 0 && I <= x.width - B && O >= 0 && O <= x.height - U && (x.textures.length > 1 && w.readBuffer(w.COLOR_ATTACHMENT0 + pt), w.readPixels(I, O, B, U, St.convert(Ct), St.convert(bt), Q));
        } finally {
          const At = N !== null ? vt.get(N).__webglFramebuffer : null;
          gt.bindFramebuffer(w.FRAMEBUFFER, At);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(x, I, O, B, U, Q, lt, pt = 0) {
      if (!(x && x.isWebGLRenderTarget))
        throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let dt = vt.get(x).__webglFramebuffer;
      if (x.isWebGLCubeRenderTarget && lt !== void 0 && (dt = dt[lt]), dt)
        if (I >= 0 && I <= x.width - B && O >= 0 && O <= x.height - U) {
          gt.bindFramebuffer(w.FRAMEBUFFER, dt);
          const At = x.textures[pt], Ct = At.format, bt = At.type;
          if (!Rt.textureFormatReadable(Ct))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
          if (!Rt.textureTypeReadable(bt))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
          const Wt = w.createBuffer();
          w.bindBuffer(w.PIXEL_PACK_BUFFER, Wt), w.bufferData(w.PIXEL_PACK_BUFFER, Q.byteLength, w.STREAM_READ), x.textures.length > 1 && w.readBuffer(w.COLOR_ATTACHMENT0 + pt), w.readPixels(I, O, B, U, St.convert(Ct), St.convert(bt), 0);
          const Qt = N !== null ? vt.get(N).__webglFramebuffer : null;
          gt.bindFramebuffer(w.FRAMEBUFFER, Qt);
          const ue = w.fenceSync(w.SYNC_GPU_COMMANDS_COMPLETE, 0);
          return w.flush(), await Mh(w, ue, 4), w.bindBuffer(w.PIXEL_PACK_BUFFER, Wt), w.getBufferSubData(w.PIXEL_PACK_BUFFER, 0, Q), w.deleteBuffer(Wt), w.deleteSync(ue), Q;
        } else
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
    }, this.copyFramebufferToTexture = function(x, I = null, O = 0) {
      const B = Math.pow(2, -O), U = Math.floor(x.image.width * B), Q = Math.floor(x.image.height * B), lt = I !== null ? I.x : 0, pt = I !== null ? I.y : 0;
      kt.setTexture2D(x, 0), w.copyTexSubImage2D(w.TEXTURE_2D, O, 0, 0, lt, pt, U, Q), gt.unbindTexture();
    };
    const lc = w.createFramebuffer(), cc = w.createFramebuffer();
    this.copyTextureToTexture = function(x, I, O = null, B = null, U = 0, Q = null) {
      Q === null && (U !== 0 ? (as("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."), Q = U, U = 0) : Q = 0);
      let lt, pt, dt, At, Ct, bt, Wt, Qt, ue;
      const ae = x.isCompressedTexture ? x.mipmaps[Q] : x.image;
      if (O !== null)
        lt = O.max.x - O.min.x, pt = O.max.y - O.min.y, dt = O.isBox3 ? O.max.z - O.min.z : 1, At = O.min.x, Ct = O.min.y, bt = O.isBox3 ? O.min.z : 0;
      else {
        const qe = Math.pow(2, -U);
        lt = Math.floor(ae.width * qe), pt = Math.floor(ae.height * qe), x.isDataArrayTexture ? dt = ae.depth : x.isData3DTexture ? dt = Math.floor(ae.depth * qe) : dt = 1, At = 0, Ct = 0, bt = 0;
      }
      B !== null ? (Wt = B.x, Qt = B.y, ue = B.z) : (Wt = 0, Qt = 0, ue = 0);
      const ne = St.convert(I.format), Tt = St.convert(I.type);
      let he;
      I.isData3DTexture ? (kt.setTexture3D(I, 0), he = w.TEXTURE_3D) : I.isDataArrayTexture || I.isCompressedArrayTexture ? (kt.setTexture2DArray(I, 0), he = w.TEXTURE_2D_ARRAY) : (kt.setTexture2D(I, 0), he = w.TEXTURE_2D), w.pixelStorei(w.UNPACK_FLIP_Y_WEBGL, I.flipY), w.pixelStorei(w.UNPACK_PREMULTIPLY_ALPHA_WEBGL, I.premultiplyAlpha), w.pixelStorei(w.UNPACK_ALIGNMENT, I.unpackAlignment);
      const Yt = w.getParameter(w.UNPACK_ROW_LENGTH), He = w.getParameter(w.UNPACK_IMAGE_HEIGHT), li = w.getParameter(w.UNPACK_SKIP_PIXELS), Ve = w.getParameter(w.UNPACK_SKIP_ROWS), $i = w.getParameter(w.UNPACK_SKIP_IMAGES);
      w.pixelStorei(w.UNPACK_ROW_LENGTH, ae.width), w.pixelStorei(w.UNPACK_IMAGE_HEIGHT, ae.height), w.pixelStorei(w.UNPACK_SKIP_PIXELS, At), w.pixelStorei(w.UNPACK_SKIP_ROWS, Ct), w.pixelStorei(w.UNPACK_SKIP_IMAGES, bt);
      const de = x.isDataArrayTexture || x.isData3DTexture, $e = I.isDataArrayTexture || I.isData3DTexture;
      if (x.isDepthTexture) {
        const qe = vt.get(x), Le = vt.get(I), Oe = vt.get(qe.__renderTarget), ir = vt.get(Le.__renderTarget);
        gt.bindFramebuffer(w.READ_FRAMEBUFFER, Oe.__webglFramebuffer), gt.bindFramebuffer(w.DRAW_FRAMEBUFFER, ir.__webglFramebuffer);
        for (let Xn = 0; Xn < dt; Xn++)
          de && (w.framebufferTextureLayer(w.READ_FRAMEBUFFER, w.COLOR_ATTACHMENT0, vt.get(x).__webglTexture, U, bt + Xn), w.framebufferTextureLayer(w.DRAW_FRAMEBUFFER, w.COLOR_ATTACHMENT0, vt.get(I).__webglTexture, Q, ue + Xn)), w.blitFramebuffer(At, Ct, lt, pt, Wt, Qt, lt, pt, w.DEPTH_BUFFER_BIT, w.NEAREST);
        gt.bindFramebuffer(w.READ_FRAMEBUFFER, null), gt.bindFramebuffer(w.DRAW_FRAMEBUFFER, null);
      } else if (U !== 0 || x.isRenderTargetTexture || vt.has(x)) {
        const qe = vt.get(x), Le = vt.get(I);
        gt.bindFramebuffer(w.READ_FRAMEBUFFER, lc), gt.bindFramebuffer(w.DRAW_FRAMEBUFFER, cc);
        for (let Oe = 0; Oe < dt; Oe++)
          de ? w.framebufferTextureLayer(w.READ_FRAMEBUFFER, w.COLOR_ATTACHMENT0, qe.__webglTexture, U, bt + Oe) : w.framebufferTexture2D(w.READ_FRAMEBUFFER, w.COLOR_ATTACHMENT0, w.TEXTURE_2D, qe.__webglTexture, U), $e ? w.framebufferTextureLayer(w.DRAW_FRAMEBUFFER, w.COLOR_ATTACHMENT0, Le.__webglTexture, Q, ue + Oe) : w.framebufferTexture2D(w.DRAW_FRAMEBUFFER, w.COLOR_ATTACHMENT0, w.TEXTURE_2D, Le.__webglTexture, Q), U !== 0 ? w.blitFramebuffer(At, Ct, lt, pt, Wt, Qt, lt, pt, w.COLOR_BUFFER_BIT, w.NEAREST) : $e ? w.copyTexSubImage3D(he, Q, Wt, Qt, ue + Oe, At, Ct, lt, pt) : w.copyTexSubImage2D(he, Q, Wt, Qt, At, Ct, lt, pt);
        gt.bindFramebuffer(w.READ_FRAMEBUFFER, null), gt.bindFramebuffer(w.DRAW_FRAMEBUFFER, null);
      } else
        $e ? x.isDataTexture || x.isData3DTexture ? w.texSubImage3D(he, Q, Wt, Qt, ue, lt, pt, dt, ne, Tt, ae.data) : I.isCompressedArrayTexture ? w.compressedTexSubImage3D(he, Q, Wt, Qt, ue, lt, pt, dt, ne, ae.data) : w.texSubImage3D(he, Q, Wt, Qt, ue, lt, pt, dt, ne, Tt, ae) : x.isDataTexture ? w.texSubImage2D(w.TEXTURE_2D, Q, Wt, Qt, lt, pt, ne, Tt, ae.data) : x.isCompressedTexture ? w.compressedTexSubImage2D(w.TEXTURE_2D, Q, Wt, Qt, ae.width, ae.height, ne, ae.data) : w.texSubImage2D(w.TEXTURE_2D, Q, Wt, Qt, lt, pt, ne, Tt, ae);
      w.pixelStorei(w.UNPACK_ROW_LENGTH, Yt), w.pixelStorei(w.UNPACK_IMAGE_HEIGHT, He), w.pixelStorei(w.UNPACK_SKIP_PIXELS, li), w.pixelStorei(w.UNPACK_SKIP_ROWS, Ve), w.pixelStorei(w.UNPACK_SKIP_IMAGES, $i), Q === 0 && I.generateMipmaps && w.generateMipmap(he), gt.unbindTexture();
    }, this.initRenderTarget = function(x) {
      vt.get(x).__webglFramebuffer === void 0 && kt.setupRenderTarget(x);
    }, this.initTexture = function(x) {
      x.isCubeTexture ? kt.setTextureCube(x, 0) : x.isData3DTexture ? kt.setTexture3D(x, 0) : x.isDataArrayTexture || x.isCompressedArrayTexture ? kt.setTexture2DArray(x, 0) : kt.setTexture2D(x, 0), gt.unbindTexture();
    }, this.resetState = function() {
      R = 0, C = 0, N = null, gt.reset(), ot.reset();
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
    return pn;
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
    e.drawingBufferColorSpace = jt._getDrawingBufferColorSpace(t), e.unpackColorSpace = jt._getUnpackColorSpace();
  }
}
const dl = { type: "change" }, Xa = { type: "start" }, Jl = { type: "end" }, ks = new tr(), ul = new Rn(), Gm = Math.cos(70 * Il.DEG2RAD), ge = new L(), Be = 2 * Math.PI, ee = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6
}, Fr = 1e-6;
class Wm extends sd {
  /**
   * Constructs a new controls instance.
   *
   * @param {Object3D} object - The object that is managed by the controls.
   * @param {?HTMLDOMElement} domElement - The HTML element used for event listeners.
   */
  constructor(t, e = null) {
    super(t, e), this.state = ee.NONE, this.target = new L(), this.cursor = new L(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" }, this.mouseButtons = { LEFT: Pi.ROTATE, MIDDLE: Pi.DOLLY, RIGHT: Pi.PAN }, this.touches = { ONE: Ai.ROTATE, TWO: Ai.DOLLY_PAN }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new L(), this._lastQuaternion = new ri(), this._lastTargetPosition = new L(), this._quat = new ri().setFromUnitVectors(t.up, new L(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new ko(), this._sphericalDelta = new ko(), this._scale = 1, this._panOffset = new L(), this._rotateStart = new Dt(), this._rotateEnd = new Dt(), this._rotateDelta = new Dt(), this._panStart = new Dt(), this._panEnd = new Dt(), this._panDelta = new Dt(), this._dollyStart = new Dt(), this._dollyEnd = new Dt(), this._dollyDelta = new Dt(), this._dollyDirection = new L(), this._mouse = new Dt(), this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = $m.bind(this), this._onPointerDown = Xm.bind(this), this._onPointerUp = qm.bind(this), this._onContextMenu = t_.bind(this), this._onMouseWheel = Km.bind(this), this._onKeyDown = Zm.bind(this), this._onTouchStart = Jm.bind(this), this._onTouchMove = Qm.bind(this), this._onMouseDown = Ym.bind(this), this._onMouseMove = jm.bind(this), this._interceptControlDown = e_.bind(this), this._interceptControlUp = n_.bind(this), this.domElement !== null && this.connect(this.domElement), this.update();
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
    this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(dl), this.update(), this.state = ee.NONE;
  }
  update(t = null) {
    const e = this.object.position;
    ge.copy(e).sub(this.target), ge.applyQuaternion(this._quat), this._spherical.setFromVector3(ge), this.autoRotate && this.state === ee.NONE && this._rotateLeft(this._getAutoRotationAngle(t)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
    let n = this.minAzimuthAngle, s = this.maxAzimuthAngle;
    isFinite(n) && isFinite(s) && (n < -Math.PI ? n += Be : n > Math.PI && (n -= Be), s < -Math.PI ? s += Be : s > Math.PI && (s -= Be), n <= s ? this._spherical.theta = Math.max(n, Math.min(s, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (n + s) / 2 ? Math.max(n, this._spherical.theta) : Math.min(s, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0 ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
    let r = !1;
    if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera)
      this._spherical.radius = this._clampDistance(this._spherical.radius);
    else {
      const o = this._spherical.radius;
      this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), r = o != this._spherical.radius;
    }
    if (ge.setFromSpherical(this._spherical), ge.applyQuaternion(this._quatInverse), e.copy(this.target).add(ge), this.object.lookAt(this.target), this.enableDamping === !0 ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
      let o = null;
      if (this.object.isPerspectiveCamera) {
        const a = ge.length();
        o = this._clampDistance(a * this._scale);
        const l = a - o;
        this.object.position.addScaledVector(this._dollyDirection, l), this.object.updateMatrixWorld(), r = !!l;
      } else if (this.object.isOrthographicCamera) {
        const a = new L(this._mouse.x, this._mouse.y, 0);
        a.unproject(this.object);
        const l = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), r = l !== this.object.zoom;
        const c = new L(this._mouse.x, this._mouse.y, 0);
        c.unproject(this.object), this.object.position.sub(c).add(a), this.object.updateMatrixWorld(), o = ge.length();
      } else
        console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
      o !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position) : (ks.origin.copy(this.object.position), ks.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(ks.direction)) < Gm ? this.object.lookAt(this.target) : (ul.setFromNormalAndCoplanarPoint(this.object.up, this.target), ks.intersectPlane(ul, this.target))));
    } else if (this.object.isOrthographicCamera) {
      const o = this.object.zoom;
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), o !== this.object.zoom && (this.object.updateProjectionMatrix(), r = !0);
    }
    return this._scale = 1, this._performCursorZoom = !1, r || this._lastPosition.distanceToSquared(this.object.position) > Fr || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > Fr || this._lastTargetPosition.distanceToSquared(this.target) > Fr ? (this.dispatchEvent(dl), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1;
  }
  _getAutoRotationAngle(t) {
    return t !== null ? Be / 60 * this.autoRotateSpeed * t : Be / 60 / 60 * this.autoRotateSpeed;
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
    ge.setFromMatrixColumn(e, 0), ge.multiplyScalar(-t), this._panOffset.add(ge);
  }
  _panUp(t, e) {
    this.screenSpacePanning === !0 ? ge.setFromMatrixColumn(e, 1) : (ge.setFromMatrixColumn(e, 0), ge.crossVectors(this.object.up, ge)), ge.multiplyScalar(t), this._panOffset.add(ge);
  }
  // deltaX and deltaY are in pixels; right and down are positive
  _pan(t, e) {
    const n = this.domElement;
    if (this.object.isPerspectiveCamera) {
      const s = this.object.position;
      ge.copy(s).sub(this.target);
      let r = ge.length();
      r *= Math.tan(this.object.fov / 2 * Math.PI / 180), this._panLeft(2 * t * r / n.clientHeight, this.object.matrix), this._panUp(2 * e * r / n.clientHeight, this.object.matrix);
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
    const n = this.domElement.getBoundingClientRect(), s = t - n.left, r = e - n.top, o = n.width, a = n.height;
    this._mouse.x = s / o * 2 - 1, this._mouse.y = -(r / a) * 2 + 1, this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();
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
    this._rotateLeft(Be * this._rotateDelta.x / e.clientHeight), this._rotateUp(Be * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
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
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateUp(Be * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), e = !0;
        break;
      case this.keys.BOTTOM:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateUp(-Be * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), e = !0;
        break;
      case this.keys.LEFT:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateLeft(Be * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), e = !0;
        break;
      case this.keys.RIGHT:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateLeft(-Be * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), e = !0;
        break;
    }
    e && (t.preventDefault(), this.update());
  }
  _handleTouchStartRotate(t) {
    if (this._pointers.length === 1)
      this._rotateStart.set(t.pageX, t.pageY);
    else {
      const e = this._getSecondPointerPosition(t), n = 0.5 * (t.pageX + e.x), s = 0.5 * (t.pageY + e.y);
      this._rotateStart.set(n, s);
    }
  }
  _handleTouchStartPan(t) {
    if (this._pointers.length === 1)
      this._panStart.set(t.pageX, t.pageY);
    else {
      const e = this._getSecondPointerPosition(t), n = 0.5 * (t.pageX + e.x), s = 0.5 * (t.pageY + e.y);
      this._panStart.set(n, s);
    }
  }
  _handleTouchStartDolly(t) {
    const e = this._getSecondPointerPosition(t), n = t.pageX - e.x, s = t.pageY - e.y, r = Math.sqrt(n * n + s * s);
    this._dollyStart.set(0, r);
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
      const n = this._getSecondPointerPosition(t), s = 0.5 * (t.pageX + n.x), r = 0.5 * (t.pageY + n.y);
      this._rotateEnd.set(s, r);
    }
    this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const e = this.domElement;
    this._rotateLeft(Be * this._rotateDelta.x / e.clientHeight), this._rotateUp(Be * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd);
  }
  _handleTouchMovePan(t) {
    if (this._pointers.length === 1)
      this._panEnd.set(t.pageX, t.pageY);
    else {
      const e = this._getSecondPointerPosition(t), n = 0.5 * (t.pageX + e.x), s = 0.5 * (t.pageY + e.y);
      this._panEnd.set(n, s);
    }
    this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd);
  }
  _handleTouchMoveDolly(t) {
    const e = this._getSecondPointerPosition(t), n = t.pageX - e.x, s = t.pageY - e.y, r = Math.sqrt(n * n + s * s);
    this._dollyEnd.set(0, r), this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed)), this._dollyOut(this._dollyDelta.y), this._dollyStart.copy(this._dollyEnd);
    const o = (t.pageX + e.x) * 0.5, a = (t.pageY + e.y) * 0.5;
    this._updateZoomParameters(o, a);
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
    e === void 0 && (e = new Dt(), this._pointerPositions[t.pointerId] = e), e.set(t.pageX, t.pageY);
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
function Xm(i) {
  this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(i.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(i) && (this._addPointer(i), i.pointerType === "touch" ? this._onTouchStart(i) : this._onMouseDown(i)));
}
function $m(i) {
  this.enabled !== !1 && (i.pointerType === "touch" ? this._onTouchMove(i) : this._onMouseMove(i));
}
function qm(i) {
  switch (this._removePointer(i), this._pointers.length) {
    case 0:
      this.domElement.releasePointerCapture(i.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(Jl), this.state = ee.NONE;
      break;
    case 1:
      const t = this._pointers[0], e = this._pointerPositions[t];
      this._onTouchStart({ pointerId: t, pageX: e.x, pageY: e.y });
      break;
  }
}
function Ym(i) {
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
    case Pi.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseDownDolly(i), this.state = ee.DOLLY;
      break;
    case Pi.ROTATE:
      if (i.ctrlKey || i.metaKey || i.shiftKey) {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(i), this.state = ee.PAN;
      } else {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(i), this.state = ee.ROTATE;
      }
      break;
    case Pi.PAN:
      if (i.ctrlKey || i.metaKey || i.shiftKey) {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(i), this.state = ee.ROTATE;
      } else {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(i), this.state = ee.PAN;
      }
      break;
    default:
      this.state = ee.NONE;
  }
  this.state !== ee.NONE && this.dispatchEvent(Xa);
}
function jm(i) {
  switch (this.state) {
    case ee.ROTATE:
      if (this.enableRotate === !1) return;
      this._handleMouseMoveRotate(i);
      break;
    case ee.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseMoveDolly(i);
      break;
    case ee.PAN:
      if (this.enablePan === !1) return;
      this._handleMouseMovePan(i);
      break;
  }
}
function Km(i) {
  this.enabled === !1 || this.enableZoom === !1 || this.state !== ee.NONE || (i.preventDefault(), this.dispatchEvent(Xa), this._handleMouseWheel(this._customWheelEvent(i)), this.dispatchEvent(Jl));
}
function Zm(i) {
  this.enabled !== !1 && this._handleKeyDown(i);
}
function Jm(i) {
  switch (this._trackPointer(i), this._pointers.length) {
    case 1:
      switch (this.touches.ONE) {
        case Ai.ROTATE:
          if (this.enableRotate === !1) return;
          this._handleTouchStartRotate(i), this.state = ee.TOUCH_ROTATE;
          break;
        case Ai.PAN:
          if (this.enablePan === !1) return;
          this._handleTouchStartPan(i), this.state = ee.TOUCH_PAN;
          break;
        default:
          this.state = ee.NONE;
      }
      break;
    case 2:
      switch (this.touches.TWO) {
        case Ai.DOLLY_PAN:
          if (this.enableZoom === !1 && this.enablePan === !1) return;
          this._handleTouchStartDollyPan(i), this.state = ee.TOUCH_DOLLY_PAN;
          break;
        case Ai.DOLLY_ROTATE:
          if (this.enableZoom === !1 && this.enableRotate === !1) return;
          this._handleTouchStartDollyRotate(i), this.state = ee.TOUCH_DOLLY_ROTATE;
          break;
        default:
          this.state = ee.NONE;
      }
      break;
    default:
      this.state = ee.NONE;
  }
  this.state !== ee.NONE && this.dispatchEvent(Xa);
}
function Qm(i) {
  switch (this._trackPointer(i), this.state) {
    case ee.TOUCH_ROTATE:
      if (this.enableRotate === !1) return;
      this._handleTouchMoveRotate(i), this.update();
      break;
    case ee.TOUCH_PAN:
      if (this.enablePan === !1) return;
      this._handleTouchMovePan(i), this.update();
      break;
    case ee.TOUCH_DOLLY_PAN:
      if (this.enableZoom === !1 && this.enablePan === !1) return;
      this._handleTouchMoveDollyPan(i), this.update();
      break;
    case ee.TOUCH_DOLLY_ROTATE:
      if (this.enableZoom === !1 && this.enableRotate === !1) return;
      this._handleTouchMoveDollyRotate(i), this.update();
      break;
    default:
      this.state = ee.NONE;
  }
}
function t_(i) {
  this.enabled !== !1 && i.preventDefault();
}
function e_(i) {
  i.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, { passive: !0, capture: !0 }));
}
function n_(i) {
  i.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, { passive: !0, capture: !0 }));
}
class fl extends xe {
  /**
   * Constructs a new CSS2D object.
   *
   * @param {DOMElement} [element] - The DOM element.
   */
  constructor(t = document.createElement("div")) {
    super(), this.isCSS2DObject = !0, this.element = t, this.element.style.position = "absolute", this.element.style.userSelect = "none", this.element.setAttribute("draggable", !1), this.center = new Dt(0.5, 0.5), this.addEventListener("removed", function() {
      this.traverse(function(e) {
        e.element instanceof e.element.ownerDocument.defaultView.Element && e.element.parentNode !== null && e.element.remove();
      });
    });
  }
  copy(t, e) {
    return super.copy(t, e), this.element = t.element.cloneNode(!0), this.center = t.center, this;
  }
}
const yi = new L(), pl = new oe(), ml = new oe(), _l = new L(), gl = new L();
class i_ {
  /**
   * Constructs a new CSS2D renderer.
   *
   * @param {CSS2DRenderer~Parameters} [parameters] - The parameters.
   */
  constructor(t = {}) {
    const e = this;
    let n, s, r, o;
    const a = {
      objects: /* @__PURE__ */ new WeakMap()
    }, l = t.element !== void 0 ? t.element : document.createElement("div");
    l.style.overflow = "hidden", this.domElement = l, this.getSize = function() {
      return {
        width: n,
        height: s
      };
    }, this.render = function(_, v) {
      _.matrixWorldAutoUpdate === !0 && _.updateMatrixWorld(), v.parent === null && v.matrixWorldAutoUpdate === !0 && v.updateMatrixWorld(), pl.copy(v.matrixWorldInverse), ml.multiplyMatrices(v.projectionMatrix, pl), h(_, _, v), m(_);
    }, this.setSize = function(_, v) {
      n = _, s = v, r = n / 2, o = s / 2, l.style.width = _ + "px", l.style.height = v + "px";
    };
    function c(_) {
      _.isCSS2DObject && (_.element.style.display = "none");
      for (let v = 0, p = _.children.length; v < p; v++)
        c(_.children[v]);
    }
    function h(_, v, p) {
      if (_.visible === !1) {
        c(_);
        return;
      }
      if (_.isCSS2DObject) {
        yi.setFromMatrixPosition(_.matrixWorld), yi.applyMatrix4(ml);
        const d = yi.z >= -1 && yi.z <= 1 && _.layers.test(p.layers) === !0, T = _.element;
        T.style.display = d === !0 ? "" : "none", d === !0 && (_.onBeforeRender(e, v, p), T.style.transform = "translate(" + -100 * _.center.x + "%," + -100 * _.center.y + "%)translate(" + (yi.x * r + r) + "px," + (-yi.y * o + o) + "px)", T.parentNode !== l && l.appendChild(T), _.onAfterRender(e, v, p));
        const A = {
          distanceToCameraSquared: u(p, _)
        };
        a.objects.set(_, A);
      }
      for (let d = 0, T = _.children.length; d < T; d++)
        h(_.children[d], v, p);
    }
    function u(_, v) {
      return _l.setFromMatrixPosition(_.matrixWorld), gl.setFromMatrixPosition(v.matrixWorld), _l.distanceToSquared(gl);
    }
    function f(_) {
      const v = [];
      return _.traverseVisible(function(p) {
        p.isCSS2DObject && v.push(p);
      }), v;
    }
    function m(_) {
      const v = f(_).sort(function(d, T) {
        if (d.renderOrder !== T.renderOrder)
          return T.renderOrder - d.renderOrder;
        const A = a.objects.get(d).distanceToCameraSquared, E = a.objects.get(T).distanceToCameraSquared;
        return A - E;
      }), p = v.length;
      for (let d = 0, T = v.length; d < T; d++)
        v[d].element.style.zIndex = p - d;
    }
  }
}
const be = (i) => i / 1e3;
function s_(i, t, e, n) {
  const s = un(t, i), r = be(s.width), o = be(s.depth), a = be(s.height), l = new Ze();
  l.position.set(be(i.x), 0, be(i.z)), l.rotation.y = -i.rotation * Math.PI / 180;
  const c = new Ze(), h = new Ze();
  l.add(c), this.content.add(l);
  const u = { rackId: t.id }, f = [];
  {
    const b = new Float32Array([-0.09, a + 0.015, o / 2 - 0.15, 0.09, a + 0.015, o / 2 - 0.15, 0, a + 0.015, o / 2 + 0.05]), R = new on();
    R.setAttribute("position", new an(b, 3));
    const C = new Xe(R, new os({ color: "#089b88", side: hn, depthTest: !1 }));
    C.userData = { ...u, frontMarker: !0 }, C.renderOrder = 10, h.add(C), f.push(this.label("앞 · FRONT", 0, a + 0.03, o / 2 + 0.2, h, "rack-front")), f.push(this.label("뒤", 0, a + 0.03, -o / 2 - 0.12, h, "rack-rear"));
  }
  const m = Br(t), _ = "#273847";
  this.cube(r, 0.07, o, 0, a - 0.035, 0, _, c).userData = u;
  const v = new Ks(
    new Aa(new Vn(r, 0.072, o)),
    new ls({ color: "#d9e6ec", transparent: !0, opacity: 0.95, depthTest: !1 })
  );
  v.position.y = a - 0.035, v.renderOrder = 9, v.userData = u, h.add(v), this.cube(r, 0.07, o, 0, 0.035, 0, _, c).userData = u, this.cube(r, 0.07, o, 0, a - 0.035, 0, _, c, { transparent: !!n.transparent, opacity: n.transparent ? 0.18 : 1, depthWrite: !n.transparent }).userData = u;
  for (const b of [-r / 2 + 0.025, r / 2 - 0.025]) for (const R of [-o / 2 + 0.025, o / 2 - 0.025]) this.cube(0.04, a, 0.04, b, a / 2, R, _, c).userData = u;
  if (n.sides)
    for (const b of [-r / 2 + 0.012, r / 2 - 0.012]) {
      const R = this.cube(0.024, a - 0.14, o - 0.08, b, a / 2, 0, _, c);
      R.userData = { ...u, sidePanel: !0 };
    }
  const p = Math.min(be(t.rail_width || 482.6), r - 0.08), d = (a - be(t.u_height * 44.45)) / 2;
  if (n.units) for (let b = 0; b < t.u_height; b++) {
    const R = t.starting_unit + (t.desc_units ? t.u_height - b - 1 : b), C = d + be((b + 0.5) * 44.45);
    for (const N of [!1, !0]) {
      const M = (N ? -1 : 1) * (o / 2 + 3e-3);
      this.textPanel(String(R), 0.045, be(44.45) * 0.85, -r / 2 - 0.025, C, M, c, N, { ...u, unitLabel: !0 }), m.occupied.has(b) || (this.cube(p, 2e-3, 3e-3, 0, C, M, "#94a3b8", c).userData = u);
    }
  }
  for (const b of [-p / 2 - 0.012, p / 2 + 0.012]) for (const R of [-o / 2 + 0.065, o / 2 - 0.065]) this.cube(0.018, be(t.u_height * 44.45), 0.025, b, a / 2, R, "#82929f", c).userData = u;
  const T = n.labels || n.usage ? this.label("", 0, a + 0.18, 0, l, "rack-summary") : null;
  if (T) {
    const b = (R, C) => {
      const N = document.createElement("span");
      N.className = C, N.textContent = R, T.element.append(N);
    };
    n.labels && b(`${t.name}${i.locked ? " · 잠금" : ""}`, "rack-name"), n.usage && (b(`${m.used}/${t.u_height}U · ${m.percent}%`, "rack-usage"), b(`잔여 ${m.free}U · ${m.count}대`, "rack-usage-detail"), T.element.style.borderBottomColor = fc(m.percent));
  }
  this.textPanel("FRONT · 전면", r * 0.85, 0.065, 0, a - 0.035, o / 2 + 2e-3, c, !1, u), this.textPanel("REAR · 후면", r * 0.85, 0.065, 0, a - 0.035, -o / 2 - 2e-3, c, !0, u);
  for (const b of t.devices) {
    const R = La(t, b);
    if (R == null) continue;
    const C = e.appearances[String(b.id)] || {}, N = C.color || b.color || "#64748b", M = be(b.u_height * 44.45) - 3e-3, S = Math.min(be(C.depth || (b.full_depth ? s.depth - 140 : s.depth * 0.42)), o - 0.12), D = b.face === "rear", k = D ? -o / 2 + 0.065 + S / 2 : o / 2 - 0.065 - S / 2, H = new Ze();
    H.position.set(0, d + be(R) + M / 2, k), H.rotation.y = D ? Math.PI : 0, c.add(H);
    const Y = { ...u, deviceId: b.id, deviceInfo: b }, W = this.cube(p, M, S, 0, 0, 0, N, H);
    W.userData = Y;
    {
      const X = Array.from({ length: 6 }, (Gt, Ft) => new Wl({ color: (Ft === 2 || Ft === 3) && !n.deviceColors ? "#808890" : N, roughness: 0.8 }));
      for (const [Gt, Ft] of [["front", 4], ["rear", 5]]) {
        const K = b.images.find((ut) => ut.id === C[`${Gt}_image_id`])?.url || b[`${Gt}_image`];
        K && (X[Ft].color.set("#ffffff"), X[Ft].map = this.texture(K, N, p / M), X[Ft].userData.imageKey = X[Ft].map.userData.poolKey);
      }
      if (W.material.dispose(), W.material = X, n.statuses) for (const Gt of [!1, !0]) this.textPanel(b.status_label || b.status, p * 0.35, Math.min(M * 0.3, 0.025), p * 0.3, -M * 0.3, (Gt ? -1 : 1) * (S / 2 + 4e-3), H, Gt, { ...Y, statusColor: uc(b.status) });
      const j = Math.min(M * 0.65, 0.04);
      this.textPanel(b.name, p * 0.94, j, 0, (M - j) / 2 - 1e-3, S / 2 + 1e-3, H, !1, Y);
      const z = b.interfaces || [], st = 8, ht = Math.ceil(z.length / st), _t = Math.min(be(44.45) / 2, M * 0.85 / Math.max(1, ht) * 0.8, p * 0.94 / st * 0.8), Ht = _t * 1.25, Jt = _t * 1.25;
      z.forEach((Gt, Ft) => this.textPanel(
        Gt.name,
        _t,
        _t,
        p * 0.47 - (Ft % st + 0.5) * Ht,
        M * 0.425 - (Math.floor(Ft / st) + 0.5) * Jt,
        -S / 2 - 2e-3,
        H,
        !0,
        { ...Y, rearInfo: b, interfaceId: Gt.id, interfaceName: Gt.name, interfaceIPs: Gt.primary_ips || [], isPrimary: !!Gt.is_primary }
      ));
    }
  }
  const A = /* @__PURE__ */ new Map(), E = [];
  return l.add(h), l.traverse((b) => {
    b.isMesh && !Array.isArray(b.material) && !b.userData.deviceInfo && !b.userData.textPanel && b.material.color?.getHexString() === "273847" && E.push(b), b.isMesh && b.userData.deviceInfo && Array.isArray(b.material) && A.set(b.userData.deviceId, b);
  }), l.remove(h), { group: l, details: c, top: h, devices: A, frameMeshes: E, nameLabel: T, directionLabels: f, labelWidth: Math.min(r, o) };
}
function r_(i, t) {
  const e = new Ze();
  this.content.add(e);
  const n = be(i.width), s = be(i.depth), r = be(i.height);
  if (this.cube(n, 0.08, s, n / 2, -0.06, s / 2, "#fafcfd", e), t.grid) {
    const o = [], a = Math.max(0.1, be(i.grid)), l = i.grid_origin || "top-left", c = l.endsWith("right") ? n % a : 0, h = l.startsWith("bottom") ? s % a : 0;
    for (let f = c; f <= n; f += a) o.push(new L(f, 0, 0), new L(f, 0, s));
    for (let f = h; f <= s; f += a) o.push(new L(0, 0, f), new L(n, 0, f));
    const u = new Ks(new on().setFromPoints(o), new ls({ color: "#8195a5", transparent: !0, opacity: 0.85, depthWrite: !1 }));
    u.position.y = 2e-3, u.userData.gridSize = i.grid, e.add(u);
  }
  return t.walls && (this.cube(n, r, 0.07, n / 2, r / 2, 0, "#cdd9df", e, { transparent: !0, opacity: 0.24, depthWrite: !1 }), this.cube(0.07, r, s, 0, r / 2, s / 2, "#cdd9df", e, { transparent: !0, opacity: 0.24, depthWrite: !1 })), this.label(n.toFixed(1) + " m", n / 2, 0.05, s + 0.4, e, "dimension"), this.label(s.toFixed(1) + " m", n + 0.45, 0.05, s / 2, e, "dimension"), e;
}
class a_ {
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
const ie = (i) => i / 1e3;
function o_(i) {
  const t = i?.deviceInfo?.primary_ips || [];
  return t.length === 1 ? t : t.length > 1 && i.interfaceId ? (i.interfaceIPs || []).filter((e) => t.includes(e)) : [];
}
class l_ {
  constructor(t, e) {
    this.listeners = [], this.host = t, this.handlers = e, this.textures = /* @__PURE__ */ new Map(), this.mode = "3d", this.scene = new Xh(), this.scene.background = new qt("#e8edf0"), this.renderer = new Vm({ antialias: !0, alpha: !1 }), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)), this.renderer.setClearColor("#e8edf0"), this.renderer.domElement.setAttribute("aria-label", "서버실 3D 배치 화면"), this.renderer.domElement.tabIndex = 0, t.appendChild(this.renderer.domElement), this.tooltip = document.createElement("div"), this.tooltip.className = "r3-device-tooltip", this.tooltip.hidden = !0, this.tooltip.setAttribute("role", "tooltip"), t.appendChild(this.tooltip), this.on(this.renderer.domElement, "pointerleave", () => {
      this.tooltip.hidden = !0;
    }), this.labels = new i_(), Object.assign(this.labels.domElement.style, { position: "absolute", inset: "0", pointerEvents: "none" }), t.appendChild(this.labels.domElement), this.camera = new je(42, 1, 0.01, 300), this.controls = new Wm(this.camera, this.renderer.domElement), this.controls.maxPolarAngle = Math.PI / 2 - 0.02, this.controls.minDistance = 0.6, this.controls.maxDistance = 100, this.on(this.controls, "change", () => this.draw()), this.scene.add(new Jh(16777215, 6649218, 2.5));
    const n = new ed(16777215, 3);
    n.position.set(5, 12, 7), this.scene.add(n), this.content = new Ze(), this.scene.add(this.content), this.ray = new id(), this.floor = new Rn(new L(0, 1, 0), 0), this.on(this.renderer.domElement, "pointerdown", (o) => this.down(o), { capture: !0 }), this.on(this.renderer.domElement, "pointermove", (o) => this.move(o)), this.on(this.renderer.domElement, "pointerup", (o) => this.up(o)), this.on(this.renderer.domElement, "pointercancel", () => this.cancelDrag()), this.on(this.renderer.domElement, "dragover", (o) => o.preventDefault()), this.on(this.renderer.domElement, "drop", (o) => {
      if (o.preventDefault(), this.mode === "walk") return;
      const a = this.floorPoint(o);
      a && e.drop(Number(o.dataTransfer.getData("text/plain")), a.x * 1e3, a.z * 1e3);
    }), this.observer = new ResizeObserver(() => this.resize()), this.observer.observe(t), this.keys = /* @__PURE__ */ new Set();
    const s = this.renderer.domElement;
    this.on(s, "keydown", (o) => {
      if (o.code === "Escape" && this.drag) {
        this.cancelDrag();
        return;
      }
      if (this.mode === "walk") {
        if (o.code === "Escape") {
          this.handlers.exitWalk();
          return;
        }
        ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"].includes(o.code) && (o.preventDefault(), this.keys.add(o.code));
      }
    }), this.on(s, "keyup", (o) => this.keys.delete(o.code));
    const r = () => {
      this.cancelDrag(), this.keys.clear(), this.walkPointer = null, this.pointerStart = null;
    };
    this.on(s, "blur", r), this.on(window, "blur", r), this.on(document, "visibilitychange", r), this.on(s, "lostpointercapture", () => this.cancelDrag()), this.resize();
  }
  on(t, e, n, s) {
    t.addEventListener(e, n, s), this.listeners.push(() => t.removeEventListener(e, n, s));
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
    const s = this.layout;
    return t < 0.2 || e < 0.2 || t > ie(s.width) - 0.2 || e > ie(s.depth) - 0.2 ? !1 : !this.walkObstacles.some((r) => t > ie(r[0]) - 0.2 && t < ie(r[2]) + 0.2 && e > ie(r[1]) - 0.2 && e < ie(r[3]) + 0.2);
  }
  walkStart() {
    const t = ie(this.layout.width), e = ie(this.layout.depth);
    for (let n = e - 0.25; n >= 0.2; n -= Math.max(0.2, e / 150))
      for (let s = 0.25; s <= t - 0.2; s += Math.max(0.2, t / 150))
        if (this.walkFree(s, n)) return new L(s, Math.min(1.65, ie(this.layout.height) - 0.1), n);
    return null;
  }
  walkFrame(t) {
    if (this.mode !== "walk") return;
    const e = Math.min((t - (this.walkTime ?? t)) / 1e3, 0.05);
    this.walkTime = t;
    const n = (...o) => o.some((a) => this.keys.has(a)), s = Number(n("KeyW", "ArrowUp")) - Number(n("KeyS", "ArrowDown")), r = Number(n("KeyD", "ArrowRight")) - Number(n("KeyA", "ArrowLeft"));
    if (s || r) {
      const o = Math.hypot(s, r), a = n("ShiftLeft", "ShiftRight") ? 2.8 : 1.4, l = (r * Math.cos(this.yaw) - s * Math.sin(this.yaw)) / o * a * e, c = (-s * Math.cos(this.yaw) - r * Math.sin(this.yaw)) / o * a * e, h = this.camera.position;
      this.walkFree(h.x + l, h.z) && (h.x += l), this.walkFree(h.x, h.z + c) && (h.z += c), this.draw();
    }
    this.walkRAF = requestAnimationFrame((o) => this.walkFrame(o));
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
      const n = e.nameLabel.getWorldPosition(new L()), s = new L(1, 0, 0).applyQuaternion(this.camera.quaternion).multiplyScalar(e.labelWidth / 2), r = n.clone().sub(s).project(this.camera), o = n.add(s).project(this.camera);
      e.nameLabel.element.style.maxWidth = `${Math.max(18, Math.min(180, Math.abs(o.x - r.x) * t / 2 - 6))}px`, e.nameLabel.element.classList.toggle("top-summary", this.mode === "top");
    }
  }
  point(t) {
    this.camera.updateMatrixWorld();
    const e = this.renderer.domElement.getBoundingClientRect();
    this.ray.setFromCamera(new Dt((t.clientX - e.left) / e.width * 2 - 1, -(t.clientY - e.top) / e.height * 2 + 1), this.camera);
  }
  floorPoint(t) {
    return this.point(t), this.ray.ray.intersectPlane(this.floor, new L());
  }
  isVisible(t) {
    for (let e = t; e; e = e.parent) if (!e.visible) return !1;
    return !0;
  }
  hit(t) {
    this.point(t), this.content.updateMatrixWorld(!0);
    for (const e of this.ray.intersectObjects(this.content.children, !0))
      if (this.isVisible(e.object) && (e.object.userData.rackId || e.object.userData.blockId))
        return e.object.userData;
    return null;
  }
  down(t) {
    if (t.button !== 0) return;
    this.mode === "walk" && (this.renderer.domElement.focus(), this.walkPointer = { x: t.clientX, y: t.clientY }, this.renderer.domElement.setPointerCapture(t.pointerId));
    const e = this.hit(t);
    if (this.pointerStart = { x: t.clientX, y: t.clientY, hit: e }, e && this.mode === "top" && this.editable) {
      const n = e.blockId ? this.layout.blocks.find((r) => r.id === e.blockId) : this.layout.placements.find((r) => r.rack_id === e.rackId);
      if (!n || n.locked) return;
      const s = this.floorPoint(t);
      if (!s) return;
      this.drag = { id: e.rackId, blockId: e.blockId, dx: n.x - s.x * 1e3, dz: n.z - s.z * 1e3 }, this.handlers.dragStart?.(e), this.controls.enabled = !1, t.stopImmediatePropagation(), this.renderer.domElement.setPointerCapture(t.pointerId);
    }
  }
  move(t) {
    if (this.tooltip.hidden = !0, !this.drag && !this.walkPointer && this.mode !== "top") {
      this.point(t), this.content.updateMatrixWorld(!0);
      const e = this.ray.intersectObjects(this.content.children, !0).find((n) => this.isVisible(n.object) && n.object.isMesh && !(n.object.material.transparent && n.object.material.opacity < 0.5));
      if (e?.object.userData.deviceInfo) {
        const n = e.object.userData.deviceInfo, s = o_(e.object.userData);
        if (s.length) {
          this.tooltip.textContent = `${n.name}${e.object.userData.interfaceName ? " · " + e.object.userData.interfaceName : ""} · ${s.join(" / ")}`, this.tooltip.hidden = !1;
          const r = this.host.getBoundingClientRect();
          this.tooltip.style.left = `${Math.max(0, Math.min(t.clientX - r.left + 12, r.width - this.tooltip.offsetWidth))}px`, this.tooltip.style.top = `${Math.max(0, t.clientY - r.top - this.tooltip.offsetHeight - 10)}px`;
        }
      }
    }
    if (this.mode === "walk" && this.walkPointer) {
      this.yaw -= (t.clientX - this.walkPointer.x) * 4e-3, this.pitch = Il.clamp(this.pitch - (t.clientY - this.walkPointer.y) * 4e-3, -1.3, 1.3), this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ"), this.walkPointer = { x: t.clientX, y: t.clientY }, this.draw();
      return;
    }
    this.drag && (this.drag.moved = !0, this.pendingDrag = { clientX: t.clientX, clientY: t.clientY }, this.dragRAF || (this.dragRAF = requestAnimationFrame(() => this.flushDrag())));
  }
  up(t) {
    this.walkPointer = null;
    const e = this.pointerStart;
    this.drag && (this.drag.moved && (this.pendingDrag = { clientX: t.clientX, clientY: t.clientY }), this.flushDrag(), this.drag = null, this.controls.enabled = !0, this.handlers.dragEnd()), e && Math.hypot(t.clientX - e.x, t.clientY - e.y) < 5 && e.hit && (e.hit.blockId ? this.handlers.selectBlock(e.hit.blockId) : this.handlers.select(e.hit.rackId, this.mode === "top" ? null : e.hit.deviceId)), this.pointerStart = null;
  }
  cube(t, e, n, s, r, o, a, l = this.content, c = {}) {
    const h = new Xe(new Vn(t, e, n), new Wl({ color: a, roughness: 0.78, ...c }));
    return h.position.set(s, r, o), l.add(h), h;
  }
  label(t, e, n, s, r, o = "") {
    const a = document.createElement("div");
    a.className = `r3-label ${o}`, a.textContent = t;
    const l = new fl(a);
    return a.style.pointerEvents = "none", l.position.set(e, n, s), r.add(l), l;
  }
  texture(t, e, n) {
    this.state();
    const s = JSON.stringify(["image", t, e, n.toFixed(2)]);
    return this.pool.acquire(s, () => {
      const r = document.createElement("canvas");
      r.width = 1024, r.height = Math.max(32, Math.min(4096, Math.round(1024 / n)));
      const o = r.getContext("2d");
      o.fillStyle = e, o.fillRect(0, 0, r.width, r.height);
      const a = new Uo(r);
      a.colorSpace = ke, a.userData.poolKey = s;
      const l = new Image();
      l.crossOrigin = "anonymous";
      let c = !1;
      return l.onload = () => {
        if (c) return;
        const h = Math.min(r.width / l.width, r.height / l.height);
        o.drawImage(l, (r.width - l.width * h) / 2, (r.height - l.height * h) / 2, l.width * h, l.height * h), a.needsUpdate = !0, this.draw();
      }, l.onerror = () => {
        c || this.handlers.imageError?.();
      }, l.src = t, { texture: a, dispose() {
        c = !0, l.onload = l.onerror = null, a.dispose();
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
    const e = new Hi();
    if (this.content.traverse((d) => {
      d.isMesh && d.userData.rackId === t.rackId && (!t.deviceId || d.userData.deviceId === t.deviceId) && e.expandByObject(d);
    }), e.isEmpty()) {
      t.deviceId && this.highlight({ rackId: t.rackId });
      return;
    }
    const n = e.getSize(new L()).addScalar(0.025), s = e.getCenter(new L()), r = new Vn(n.x, n.y, n.z), o = new ls({ color: "#ffb000", transparent: !0, depthTest: !1 }), a = new Ks(new Aa(r), o);
    a.position.copy(s), a.renderOrder = 1e3, this.focusGroup = new Ze(), this.content.add(this.focusGroup), this.focusGroup.add(a);
    const l = new os({ color: "#ffc400", transparent: !0, opacity: 0.2, depthTest: !1, depthWrite: !1 }), c = new Xe(r, l);
    c.raycast = () => {
    }, c.position.copy(s), c.renderOrder = 999, this.focusGroup.add(c);
    const h = this.racks.find((d) => d.id === t.rackId), u = h?.devices.find((d) => d.id === t.deviceId), f = document.createElement("div");
    f.className = "r3-focus-tag", f.setAttribute("role", "status"), f.textContent = `▼ ${u?.name || h?.name} · 위치 강조`;
    const m = new fl(f);
    m.position.set(s.x, e.max.y + 0.06, s.z), this.focusGroup.add(m);
    const _ = performance.now(), v = window.matchMedia("(prefers-reduced-motion: reduce)").matches, p = (d) => {
      const T = d - _ < 5e3, A = T && !v ? 0.55 + 0.45 * Math.cos((d - _) / 1200 * Math.PI * 2) : 0.8;
      o.opacity = A, l.opacity = 0.08 + A * 0.22, f.style.opacity = String(0.65 + A * 0.35), this.draw(), T && !v ? this.focusRAF = requestAnimationFrame(p) : this.focusRAF = null;
    };
    p(_);
  }
  textPanel(t, e, n, s, r, o, a, l = !1, c = {}) {
    this.state();
    const h = JSON.stringify(["text", t, !!c.unitLabel, !!c.interfaceId, c.statusColor, !!c.isPrimary]), u = this.pool.acquire(h, () => {
      const m = document.createElement("canvas");
      m.width = c.unitLabel || c.interfaceId ? 128 : 512, m.height = c.interfaceId || c.unitLabel ? 128 : 64;
      const _ = m.getContext("2d");
      _.fillStyle = c.statusColor || "#172d3b", _.fillRect(0, 0, m.width, m.height), _.fillStyle = "#f1f5f9", _.font = "bold " + (c.unitLabel ? 75 : c.interfaceId ? 23 : 45) + "px sans-serif", _.textAlign = "center", _.textBaseline = "middle", _.fillText(t, m.width / 2, m.height / 2, m.width - 12), c.interfaceId && (_.strokeStyle = c.isPrimary ? "#fbbf24" : "#82929f", _.lineWidth = c.isPrimary ? 4.5 : 2, _.strokeRect(2.5, 2.5, 123, 123));
      const v = new Uo(m);
      v.colorSpace = ke;
      const p = new os({ map: v });
      return { material: p, dispose() {
        v.dispose(), p.dispose();
      } };
    }), f = new Xe(new hs(e, n), u.material);
    f.position.set(s, r, o), f.rotation.y = l ? Math.PI : 0, f.userData = { ...c, textPanel: !0, textKey: h }, a.add(f);
  }
  roomObject(t, e, n) {
    const s = t.type || "pillar", r = ts[s] || ts.pillar, o = ie(t.width), a = ie(t.depth), l = ie(t.height), c = new Ze();
    c.position.set(ie(t.x), 0, ie(t.z)), c.rotation.y = -(t.rotation || 0) * Math.PI / 180, this.content.add(c);
    const h = e ? "#0d9488" : r.color, u = (f, m, _, v, p, d, T = h, A = {}) => {
      const E = this.cube(f, m, _, v, p, d, T, c, A);
      return E.userData = { blockId: t.id }, E;
    };
    if (s === "desk") {
      u(o, l * 0.09, a, 0, l * 0.955, 0);
      for (const f of [-o * 0.43, o * 0.43]) for (const m of [-a * 0.4, a * 0.4]) u(o * 0.045, l * 0.91, a * 0.06, f, l * 0.455, m, "#485560");
    } else if (s === "glass") {
      u(o, l, a * 0.35, 0, l / 2, 0, "#91d5e2", { transparent: !0, opacity: 0.3, depthWrite: !1 });
      for (const f of [-o * 0.48, o * 0.48]) u(o * 0.04, l, a, f, l / 2, 0, "#566977");
      for (const f of [l * 0.015, l * 0.985]) u(o, l * 0.03, a, 0, f, 0, "#566977");
    } else if (s === "door")
      u(o, l, a, 0, l / 2, 0, "#455966"), u(o * 0.88, l * 0.94, a * 0.9, 0, l * 0.47, a * 0.07), u(o * 0.04, l * 0.025, a * 0.15, o * 0.32, l * 0.46, a * 0.53, "#e5c16b");
    else if (u(o, l, a, 0, l / 2, 0), ["ups", "cooling", "battery"].includes(s)) {
      u(o * 0.3, l * 0.1, a * 0.012, -o * 0.15, l * 0.8, a * 0.506, "#142c36"), u(o * 0.12, l * 0.045, a * 0.014, -o * 0.15, l * 0.8, a * 0.52, "#65dec0");
      for (let f = 0; f < 7; f++) u(o * 0.74, l * 0.014, a * 0.012, 0, l * (0.15 + f * 0.065), a * 0.506, "#364b57");
      s === "battery" && u(o * 0.12, l * 0.09, a * 0.014, o * 0.25, l * 0.8, a * 0.52, "#f3c751");
    }
    return e && u(o + 0.06, 8e-3, a + 0.06, 0, 6e-3, 0, "#2dd4bf", { transparent: !0, opacity: 0.5 }), n.labels && this.label(t.name, 0, l + 0.12, 0, c, e ? "active" : "muted"), c;
  }
  state() {
    this.rackNodes ||= /* @__PURE__ */ new Map(), this.blockNodes ||= /* @__PURE__ */ new Map(), this.pool ||= new a_();
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
      n.parent && (n.traverse((s) => {
        s.isCSS2DObject && s.element.remove();
      }), n.removeFromParent()), e.parent || t.group.add(e);
    }
  }
  movePlacement(t, e, n) {
    const s = (t === "block" ? this.blockNodes : this.rackNodes)?.get(e);
    s && (s.group.position.set(ie(n.x), 0, ie(n.z)), s.group.rotation.y = -(n.rotation || 0) * Math.PI / 180, this.draw());
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
    const s = this.layout.placements.find((l) => l.rack_id === t.rackId), r = un(this.racks.find((l) => l.id === t.rackId), s), o = this.cube(ie(r.width) + 0.12, 0.012, ie(r.depth) + 0.12, 0, 8e-3, 0, "#2dd4bf", n.group, { transparent: !0, opacity: 0.45 });
    this.selectionObjects.push(o);
    const a = n.devices.get(t.deviceId);
    if (a) {
      const l = new Ks(new Aa(a.geometry), new ls({ color: "#fbbf24" }));
      a.parent.add(l), this.selectionObjects.push(l);
    }
  }
  update(t, e, n, s = {}) {
    this.state(), this.clearFocus(), this.layout = t, this.racks = e, this.editable = s.editable;
    const r = new Map(e.map((h) => [h.id, h]));
    if (this.walkObstacles = [...t.blocks, ...t.placements.flatMap((h) => {
      const u = r.get(h.rack_id);
      return u ? [{ ...h, ...un(u, h) }] : [];
    })].map(Ui), this.mode === "walk") {
      const h = this.camera.position;
      if (!this.walkFree(h.x, h.z)) {
        const u = this.walkStart();
        if (u) h.copy(u);
        else {
          this.handlers.exitWalk(), this.handlers.walkError();
          return;
        }
      }
      h.y = Math.min(1.65, ie(t.height) - 0.1);
    }
    const o = JSON.stringify([t.width, t.depth, t.height, t.grid, t.grid_origin, s.grid, s.walls]);
    this.envKey !== o && (this.disposeGroup(this.environment), this.environment = r_.call(this, t, s), this.envKey = o);
    const a = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), c = [s.labels, s.units, s.usage, s.sides, s.transparent, s.deviceColors, s.statuses];
    for (const h of t.placements) {
      const u = r.get(h.rack_id);
      if (!u) continue;
      a.add(u.id);
      const f = JSON.stringify([u, un(u, h), h.locked, c, u.devices.map((_) => t.appearances[String(_.id)])]);
      let m = this.rackNodes.get(u.id);
      m?.key !== f && (m && this.removeRack(m), m = s_.call(this, h, u, t, s), m.key = f, this.rackNodes.set(u.id, m), this.selectionKey = void 0), this.movePlacement("rack", u.id, h);
      for (const _ of m.devices.values())
        _.parent.visible = !s.statusFilter || _.userData.deviceInfo.status === s.statusFilter;
    }
    for (const [h, u] of this.rackNodes) a.has(h) || (this.removeRack(u), this.rackNodes.delete(h), this.selectionKey = void 0);
    for (const h of t.blocks) {
      l.add(h.id);
      const { x: u, z: f, rotation: m, ..._ } = h, v = JSON.stringify([_, s.labels, n?.blockId === h.id]);
      let p = this.blockNodes.get(h.id);
      p?.key !== v && (this.disposeGroup(p?.group), p = { group: this.roomObject(h, n?.blockId === h.id, s), key: v }, this.blockNodes.set(h.id, p)), this.movePlacement("block", h.id, h);
    }
    for (const [h, u] of this.blockNodes) l.has(h) || (this.disposeGroup(u.group), this.blockNodes.delete(h));
    this.setSelection(n), this.syncMode(), this.pool.prune(), this.draw();
  }
  view(t, e) {
    if (this.clearFocus(), cancelAnimationFrame(this.walkRAF), this.walkTime = null, this.keys.clear(), this.walkPointer = null, t === "walk") {
      const o = this.walkStart();
      if (!o) {
        this.handlers.walkError();
        return;
      }
      this.mode = "walk", this.syncMode(), this.controls.enabled = !1, this.camera.position.copy(o), this.yaw = 0, this.pitch = 0, this.camera.rotation.set(0, 0, 0, "YXZ"), this.renderer.domElement.focus(), this.draw(), this.walkRAF = requestAnimationFrame((a) => this.walkFrame(a));
      return;
    }
    this.controls.enabled = !0, this.mode = t === "top" ? "top" : "3d", this.syncMode(), this.controls.enableRotate = t !== "top";
    const n = this.layout;
    if (!n) return;
    const s = new L(ie(n.width) / 2, 0, ie(n.depth) / 2), r = Math.max(ie(n.width), ie(n.depth));
    if ((t === "front" || t === "rear") && e) {
      const o = n.placements.find((l) => l.rack_id === e.rackId), a = this.racks.find((l) => l.id === e.rackId);
      if (o && a) {
        const l = un(a, o), c = -o.rotation * Math.PI / 180;
        s.set(ie(o.x), ie(l.height) / 2, ie(o.z));
        const h = new L(0, 0.12, (t === "rear" ? -1 : 1) * (ie(l.depth) / 2 + 3.4)).applyAxisAngle(new L(0, 1, 0), c);
        this.camera.position.copy(s).add(h);
      }
    } else t === "top" ? this.camera.position.set(s.x, r * 1.5, s.z + 1e-3) : this.camera.position.set(s.x + r * 0.8, r * 0.8, s.z + r * 0.85);
    this.controls.target.copy(s), this.controls.update(), this.camera.updateMatrixWorld(), this.scene.updateMatrixWorld(!0), this.sizeLabels(), this.labels.render(this.scene, this.camera), this.draw();
  }
}
const re = (i) => String(i ?? "").replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]), mn = (i) => structuredClone(i), De = document.querySelector("#room3d"), Wi = new mc(De);
let Zt, nt, Ri, Ca, Dn, Ti = [], It = null, Ae, Ne = !1, gn = !1, Je = [], An, Ql = !1, Pe = "3d", $a = "", tc = !1, Or = 0;
const Te = { units: !0, usage: !0, statuses: !0, statusFilter: "", grid: !0, walls: !0, labels: !0, transparent: !0, sides: !1, deviceColors: !1, snap: !0 };
De.innerHTML = `
  <div class="r3-app">
    <div class="r3-location-bar"><label>LOCATION <select class="no-ts" id="r3-location" aria-label="Location 선택"></select></label><label class="r3-check"><input type="checkbox" id="r3-only-rack-locations"> 랙이 배치된 Location만</label><span id="r3-room-summary"></span><div class="r3-location-actions"><button class="r3-btn small" data-action="room">서버실 설정</button><button class="r3-btn small" data-action="reload">다시 불러오기</button><span id="r3-save-state" role="status">불러오는 중</span><button data-action="cancel" class="r3-btn small">취소</button><button data-action="save" class="r3-btn small primary">배치 저장</button></div></div>
    <div id="r3-notice" role="status" aria-live="polite" hidden></div>
    <div class="r3-workspace">
      <aside class="r3-library"><div class="r3-section-title"><h2>랙 라이브러리</h2><span id="r3-rack-count"></span></div><p class="r3-help">기존 랙을 화면으로 끌어다 배치하세요.</p><input id="r3-search" type="search" placeholder="랙 · 서버명 · IP 검색" aria-label="랙 또는 서버 검색"><label>장비 상태<select class="no-ts" id="r3-status-filter"><option value="">전체 상태</option></select></label><div id="r3-search-results"></div><label class="r3-check"><input type="checkbox" id="r3-show-placed"> 배치된 랙 포함</label><div id="r3-rack-list"></div><div class="r3-library-bottom"><span class="r3-eyebrow">ROOM OBJECTS</span><label>오브젝트 종류<select class="no-ts" id="r3-object-type" aria-label="오브젝트 종류">${Object.entries(ts).map(([i, t]) => `<option value="${i}">${t.name}</option>`).join("")}</select></label><button data-action="add-block" class="r3-btn wide">＋ 룸 오브젝트 추가</button><div id="r3-block-list"></div></div></aside>
      <main class="r3-stage"><div class="r3-toolbar"><div class="r3-segment"><button data-action="view" data-view="3d" class="active">3D 보기</button><button data-action="view" data-view="top">평면 배치</button><button data-action="view" data-view="walk">워킹 모드</button></div><div class="r3-tools"><button data-action="fit" title="전체 보기">전체 보기</button><button data-action="undo" title="되돌리기">↶ 되돌리기</button><label><input id="r3-snap" type="checkbox" checked> 격자 맞춤</label></div></div><div id="r3-canvas"></div><div class="r3-stage-footer"><span id="r3-scene-stats"></span><span id="r3-controls-help">드래그 회전 · 우클릭 이동 · 휠 확대</span></div><div id="r3-invalid" role="alert" hidden></div></main>
      <aside id="r3-inspector" class="r3-inspector"></aside>
    </div>
    <footer class="r3-footer"><span><i></i> ${Wi.demo ? "샘플 데이터 · 이 브라우저에 저장됩니다" : "NetBox 인벤토리 · 레이아웃만 저장됩니다"}</span><div><label><input id="r3-units" type="checkbox" checked> U 번호·빈 슬롯</label><label><input id="r3-usage" type="checkbox" checked> 사용 현황</label><label><input id="r3-statuses" type="checkbox" checked> 상태 표시</label><label><input id="r3-grid" type="checkbox" checked> 격자 표시</label><label>한 칸 (mm)<input id="r3-grid-size" type="number" min="100" max="5000" step="1" required aria-label="격자 한 칸 (mm)"></label><label>격자 시작<select class="no-ts" id="r3-grid-origin" aria-label="격자 배치 시작 위치"><option value="top-left">좌상</option><option value="bottom-left">좌하</option><option value="top-right">우상</option><option value="bottom-right">우하</option></select></label><label><input id="r3-walls" type="checkbox" checked> 벽</label><label><input id="r3-labels" type="checkbox" checked> 이름</label><label><input id="r3-transparent" type="checkbox" checked> 투명 프레임</label><label><input id="r3-sides" type="checkbox"> 랙 측면 덮개</label><label><input id="r3-deviceColors" type="checkbox"> 서버 상·하단 할당 색상</label></div></footer>
  </div>
  <dialog id="r3-room-dialog"><form id="r3-room-form"><div class="r3-dialog-title"><h2>서버실 기본 설정</h2><button type="button" class="r3-icon-button" data-action="close-room" aria-label="닫기">×</button></div><p>선택한 Location에 공간을 연결합니다. 모든 치수는 mm입니다.</p><label>서버실 이름<input name="name" required maxlength="100"></label><div class="r3-form-grid"><label>가로 (mm)<input type="number" name="width" min="500" max="100000" required></label><label>세로 (mm)<input type="number" name="depth" min="500" max="100000" required></label><label>높이 (mm)<input type="number" name="height" min="500" max="100000" required></label><label>격자 크기 (mm)<input type="number" name="grid" min="100" max="5000" required></label></div><label class="r3-check"><input name="include_descendants" type="checkbox"> 하위 Location의 랙 포함</label><p class="r3-help">공간을 줄이면 기존 배치가 경계를 벗어날 수 있습니다.</p><div class="r3-dialog-actions"><button type="button" data-action="close-room" class="r3-btn">닫기</button><button type="submit" class="r3-btn primary">설정 적용</button></div></form></dialog>`;
const Nt = (i) => De.querySelector(i);
function Xi() {
  const i = Math.max(0, De.getBoundingClientRect().top), t = Math.max(240, (window.visualViewport?.height || window.innerHeight) - i - 12), e = `${Math.floor(t)}px`;
  De.style.getPropertyValue("--r3-available-height") !== e && De.style.setProperty("--r3-available-height", e);
}
Xi();
window.addEventListener("resize", Xi);
window.visualViewport?.addEventListener("resize", Xi);
document.addEventListener("fullscreenchange", Xi);
const c_ = new ResizeObserver(Xi);
c_.observe(De.parentElement);
document.fonts?.ready.then(Xi);
function ve(i = "", t = !1) {
  const e = Nt("#r3-notice");
  e.textContent = i, e.hidden = !i, e.className = t ? "error" : "";
}
function dn() {
  Je.push({ layout: mn(nt), racks: Zt.racks }), Je.length > 30 && Je.shift();
}
function ii(i = !1) {
  Ne = JSON.stringify(nt) !== JSON.stringify(Ri), _e(i);
}
function Xt() {
  return !!Zt?.can_edit && !gn;
}
function h_(i) {
  gn = i, _e();
}
function nn(i, t, e, n = "placement", s = !1, r = 0) {
  return `<label>${i}<input type="number" min="${r}" step="any" data-edit="${n}" data-key="${t}" value="${re(e)}" ${s || !Xt() ? "disabled" : ""}></label>`;
}
function d_(i) {
  const t = `${i} 복사본`, e = new Set(nt.blocks.map((n) => n.name));
  if (!e.has(t)) return t;
  for (let n = 2; ; n++) if (!e.has(`${t} ${n}`)) return `${t} ${n}`;
}
function Zs(i, t) {
  const e = nt.grid_origin || "top-left", n = t === "x" ? e.endsWith("right") : e.startsWith("bottom");
  return dc(i, nt.grid, Te.snap, n ? nt[t === "x" ? "width" : "depth"] : 0);
}
function Ci(i) {
  const t = Ui(i);
  return { x: t[0], z: t[1] };
}
function Pa(i, t, e) {
  const n = Ui({ ...i, x: t, z: e });
  return { x: t + Zs(n[0], "x") - n[0], z: e + Zs(n[1], "z") - n[1] };
}
function vl(i, t = null) {
  const e = (a, l) => ({ x: i.x, z: i.z } = Pa(i, a, l), !Da({ ...nt, blocks: [...nt.blocks, i] }, Zt.racks).length), n = Math.max(100, nt.grid);
  if (t)
    for (let a = 1; a <= 12; a++) {
      for (let l = -a; l <= a; l++) for (const c of [-a, a]) if (e(t.x + c * n, t.z + l * n)) return !0;
      for (let l = -a + 1; l < a; l++) for (const c of [-a, a]) if (e(t.x + l * n, t.z + c * n)) return !0;
    }
  const s = Math.max(100, nt.grid, nt.width / 80, nt.depth / 80), r = (a, l, c) => {
    const h = [];
    for (let u = l; u <= a - l; u += s) h.push(u);
    return c ? h.reverse() : h;
  }, o = nt.grid_origin || "top-left";
  for (const a of r(nt.depth, i.depth / 2, o.startsWith("bottom")))
    for (const l of r(nt.width, i.width / 2, o.endsWith("right"))) if (e(l, a)) return !0;
  return !1;
}
function ec(i, t) {
  const e = xl(i);
  return e ? `<a href="${re(e)}" target="_blank" rel="noopener noreferrer">${t} ↗</a>` : '<span class="r3-help">샘플 장비</span>';
}
function qa() {
  const i = Ti.filter((n) => !Ql || n.has_racks), t = i.some((n) => n.id === Dn), e = t ? "" : `<option value="" disabled selected>${i.length ? "Location 선택 (현재 화면 유지)" : "조건에 맞는 Location이 없습니다"}</option>`;
  Nt("#r3-location").innerHTML = e + i.map((n) => `<option value="${n.id}">${re(n.site)} / ${re(n.name)}</option>`).join(""), t && (Nt("#r3-location").value = String(Dn)), Nt("#r3-location").disabled = gn || !i.length, Nt("#r3-only-rack-locations").disabled = gn;
}
function _e(i = !1, t = !0) {
  if (!Zt || !nt) return;
  const e = Da(nt, Zt.racks);
  Nt("#r3-grid-size").value = nt.grid, Nt("#r3-grid-size").disabled = !Xt(), Nt("#r3-grid-origin").value = nt.grid_origin || "top-left", Nt("#r3-grid-origin").disabled = !Xt(), Nt("#r3-save-state").textContent = Zt.can_edit ? gn ? "처리 중…" : Ne ? "저장하지 않은 변경" : `저장됨 · v${nt.revision}` : "읽기 전용", Nt("#r3-save-state").className = Ne ? "unsaved" : "", Nt("[data-action=save]").disabled = !Xt() || !Ne || e.length > 0, Nt("[data-action=cancel]").disabled = gn || !Ne, Nt("[data-action=undo]").disabled = !Xt() || !Je.length, Nt("[data-action=add-block]").disabled = !Xt(), qa(), Nt("[data-action=room]").disabled = !Xt(), Nt("#r3-room-summary").textContent = `${nt.name} · ${nt.width / 1e3} × ${nt.depth / 1e3} m · ${nt.height / 1e3} m 높이`, Nt("#r3-rack-count").textContent = `${Zt.racks.length}`;
  const n = new Set(nt.placements.map((l) => l.rack_id)), s = $a.trim().toLowerCase(), r = new Map(Zt.racks.flatMap((l) => l.devices.map((c) => [c.status, c.status_label || c.status])));
  Te.statusFilter && !r.has(Te.statusFilter) && (Te.statusFilter = ""), Nt("#r3-status-filter").innerHTML = '<option value="">전체 상태</option>' + [...r].map(([l, c]) => `<option value="${re(l)}" ${Te.statusFilter === l ? "selected" : ""}>${re(c)}</option>`).join("");
  const o = Zt.racks.flatMap((l) => l.devices.filter((c) => eo(c, s, Te.statusFilter)).map((c) => ({ r: l, d: c })));
  Nt("#r3-search-results").innerHTML = s || Te.statusFilter ? `<p class="r3-help">장비 검색 ${o.length}개 · 현재 Location</p>` + o.map(({ r: l, d: c }) => `<button class="r3-btn wide" data-action="find-device" data-rack-id="${l.id}" data-id="${c.id}">${re(c.name)} · ${re(l.name)} · ${re(c.status_label || c.status)}${n.has(l.id) ? "" : " · 미배치"}<small class="r3-result-ips">${no(c, s).matched ? "일치 IP" : "IP"}: ${no(c, s).ips.map((h) => re(h)).join(" · ") || "조회 가능한 IP 없음"}</small></button>`).join("") : "";
  const a = Zt.racks.filter((l) => (tc || s || Te.statusFilter || !n.has(l.id)) && (!Te.statusFilter || l.devices.some((c) => c.status === Te.statusFilter)) && (!s || l.name.toLowerCase().includes(s) || l.devices.some((c) => eo(c, s, Te.statusFilter))));
  Nt("#r3-rack-list").innerHTML = a.length ? a.map((l) => `<div class="r3-rack-card ${It?.rackId === l.id ? "selected" : ""}" draggable="${Xt() && !n.has(l.id)}" data-rack="${l.id}"><button class="r3-rack-select" data-action="select" data-id="${l.id}"><span class="r3-rack-icon">▥</span><span><strong>${re(l.name)}</strong><small>${l.u_height}U · ${l.width} × ${l.depth} mm</small></span></button><div class="r3-rack-meta"><span>${l.devices.length} 장비 · ${Br(l).used}/${l.u_height}U · 잔여 ${Br(l).free}U</span><button data-action="${n.has(l.id) ? "select" : "place"}" data-id="${l.id}" ${!n.has(l.id) && !Xt() ? "disabled" : ""}>${n.has(l.id) ? "배치됨 ↗" : "＋ 배치"}</button></div></div>`).join("") : '<div class="r3-empty">미배치 랙이 없습니다.<br>배치된 랙 포함을 켜서 확인하세요.</div>', Nt("#r3-block-list").innerHTML = nt.blocks.map((l) => `<button class="r3-block-item" data-action="select-block" data-id="${re(l.id)}">▧ ${re(l.name)}</button>`).join(""), Nt("#r3-scene-stats").textContent = `${nt.placements.length} / ${Zt.racks.length} 랙 배치 · ${Zt.racks.filter((l) => n.has(l.id)).reduce((l, c) => l + c.devices.length, 0)} 장비`, Nt("#r3-invalid").hidden = !e.length, Nt("#r3-invalid").textContent = e.length ? `저장 전 확인 · ${e.slice(0, 3).join(" / ")}` : "", Nt("#r3-controls-help").textContent = Pe === "walk" ? "WASD / 방향키 이동 · 드래그 둘러보기 · Shift 빠르게 · Esc 종료" : Pe === "top" ? "랙 드래그 배치 · 우클릭 이동 · 휠 확대" : "드래그 회전 · 우클릭 이동 · 휠 확대", Nt("[data-action=fit]").textContent = Pe === "walk" ? "시작 위치" : "전체 보기", Nt("[data-action=fit]").title = Pe === "walk" ? "워킹 시작 위치로 이동" : "전체 보기", De.querySelectorAll("[data-action=view]").forEach((l) => l.classList.toggle("active", l.dataset.view === Pe)), i || nc(), De.querySelectorAll("select").forEach((l) => l.classList.add("no-ts")), t && Ae?.update(nt, Zt.racks, It, { ...Te, editable: Xt() });
}
function nc() {
  const i = Nt("#r3-inspector");
  if (It?.blockId) {
    const a = nt.blocks.find((c) => c.id === It.blockId);
    if (!a)
      return It = null, nc();
    const l = Ci(a);
    i.innerHTML = `<div class="r3-section-title"><h2>${re(ts[a.type || "pillar"]?.name || "룸 오브젝트")}</h2><span class="r3-tag">BLOCK</span></div><label>이름<input data-edit="block" data-key="name" value="${re(a.name)}" maxlength="100" ${Xt() ? "" : "disabled"}></label><div class="r3-form-grid">${nn("좌측 X (mm)", "x", l.x, "block")}${nn("상단 Z (mm)", "z", l.z, "block")}${nn("폭 (mm)", "width", a.width, "block", !1, 100)}${nn("깊이 (mm)", "depth", a.depth, "block", !1, 100)}${nn("높이 (mm)", "height", a.height, "block", !1, 100)}</div><label>방향<select data-edit="block" data-key="rotation" ${Xt() ? "" : "disabled"}>${[0, 90, 180, 270].map((c) => `<option value="${c}" ${c === (a.rotation || 0) ? "selected" : ""}>${c}°</option>`).join("")}</select></label><p class="r3-help">좌표는 오브젝트의 좌측 상단 기준입니다. 평면 모드에서 드래그하거나 좌표를 입력하세요.</p><button data-action="duplicate-block" class="r3-btn wide" ${Xt() ? "" : "disabled"}>오브젝트 복사</button><button data-action="remove-block" class="r3-btn danger wide" ${Xt() ? "" : "disabled"}>블록 제거</button>`;
    return;
  }
  const t = Zt.racks.find((a) => a.id === It?.rackId);
  if (!t) {
    i.innerHTML = '<div class="r3-section-title"><h2>선택 정보</h2></div><div class="r3-inspector-empty"><span>◇</span><h3>공간을 구성해 보세요</h3><p>랙을 선택하면 위치와 치수를<br>조정하고 내부 장비를 확인할 수 있습니다.</p></div><div class="r3-tip"><strong>시작하기</strong><p>① 서버실 크기를 설정하세요.<br>② 평면 모드에서 랙을 배치하세요.<br>③ 3D로 앞뒤를 확인하고 저장하세요.</p></div>';
    return;
  }
  const e = nt.placements.find((a) => a.rack_id === t.id), n = un(t, e), s = t.devices.find((a) => a.id === It.deviceId), r = t.devices.filter((a) => La(t, a) == null), o = e ? Ci({ ...e, ...n }) : null;
  i.innerHTML = `<div class="r3-section-title"><h2>${re(t.name)}</h2><span class="r3-tag">${t.u_height}U</span></div>${ec(t.url, "NetBox 랙 상세")}<div class="r3-view-buttons"><button data-action="front" ${e ? "" : "disabled"}>전면 보기</button><button data-action="rear" ${e ? "" : "disabled"}>후면 보기</button></div>
    ${e ? `<div class="r3-subtitle">배치 좌표 · 좌측 상단 기준 <label class="r3-check"><input type="checkbox" data-edit="placement" data-key="locked" ${e.locked ? "checked" : ""} ${Xt() ? "" : "disabled"}> 잠금</label></div><div class="r3-form-grid">${nn("좌측 X (mm)", "x", o.x, "placement", e.locked)}${nn("상단 Z (mm)", "z", o.z, "placement", e.locked)}</div><label>방향<select data-edit="placement" data-key="rotation" ${e.locked || !Xt() ? "disabled" : ""}>${[0, 90, 180, 270].map((a) => `<option value="${a}" ${a === e.rotation ? "selected" : ""}>${a}°</option>`).join("")}</select></label><details><summary>랙 표시 치수 보정</summary><p class="r3-help">원본 랙 치수는 변경되지 않습니다.${t.estimated.length ? " 일부 치수는 추정값입니다." : ""}</p><div class="r3-form-grid">${nn("폭 (mm)", "width", n.width, "dimensions", e.locked, 100)}${nn("깊이 (mm)", "depth", n.depth, "dimensions", e.locked, 100)}${nn("높이 (mm)", "height", n.height, "dimensions", e.locked, 100)}</div></details><button data-action="unplace" class="r3-btn danger wide" ${e.locked || !Xt() ? "disabled" : ""}>배치 해제</button>` : `<p class="r3-help">아직 배치되지 않은 랙입니다.</p><button data-action="place" data-id="${t.id}" class="r3-btn primary wide" ${Xt() ? "" : "disabled"}>서버실에 배치</button>`}
    <div class="r3-subtitle">장비 <span>${t.devices.length}</span></div>${t.desc_units ? '<p class="r3-help">U 번호: 위에서 아래로 증가</p>' : ""}${r.length ? `<p class="r3-warning">위치 없음·0U·범위 초과 ${r.length}개: 목록에서만 표시</p>` : ""}<div class="r3-devices">${t.devices.filter((a) => !Te.statusFilter || a.status === Te.statusFilter).map((a) => `<button data-action="device" data-id="${a.id}" class="r3-device ${s?.id === a.id ? "active" : ""}"><i style="background:${re(nt.appearances[String(a.id)]?.color || a.color)}"></i><span>${re(a.name)}<small>${re(a.model)}</small></span><b>${a.position == null ? "—" : "U" + a.position}</b></button>`).join("") || '<p class="r3-help">장비가 없습니다.</p>'}</div>${s ? u_(s) : '<p class="r3-help">장비를 선택하면 이미지와 색상을 설정할 수 있습니다.</p>'}`;
}
function u_(i) {
  const t = nt.appearances[String(i.id)] || {}, e = ["front", "rear"].map((n) => {
    const s = i.images.find((o) => o.id === t[`${n}_image_id`])?.url || i[`${n}_image`], r = Wi.demo ? s : xl(s);
    return `<div class="r3-face-preview"><span>${n === "front" ? "전면" : "후면"}</span>${r ? `<img src="${re(r)}" alt="${re(i.name)} ${n === "front" ? "전면" : "후면"} 이미지">` : `<div style="background:${re(t.color || i.color)}">설정 색상</div>`}</div>`;
  }).join("");
  return `<div class="r3-device-detail"><div class="r3-subtitle">${re(i.name)}</div><p class="r3-help">${i.u_height}U · ${i.face === "rear" ? "후면 장착" : "전면 장착"} · ${re(i.status)}</p>${ec(i.url, "NetBox 장비 상세")}<div class="r3-previews">${e}</div><label>이미지가 없는 면의 색상<input type="color" data-edit="appearance" data-key="color" value="${re(t.color || i.color)}" ${Xt() ? "" : "disabled"}></label>${nn("표시 깊이 (mm, 빈 값은 추정)", "depth", t.depth ?? "", "appearance", !1, 20)}${["front", "rear"].map((n) => `<label>${n === "front" ? "전면" : "후면"} 이미지<select data-edit="appearance" data-key="${n}_image_id" ${Xt() ? "" : "disabled"}><option value="">Device Type 이미지 사용</option>${i.images.map((s) => `<option value="${s.id}" ${t[`${n}_image_id`] === s.id ? "selected" : ""}>${re(s.name)}</option>`).join("")}</select></label>`).join("")}<button data-action="reset-appearance" class="r3-btn small" ${Xt() ? "" : "disabled"}>장비 표시 설정 초기화</button></div>`;
}
async function Ya(i) {
  const t = ++Or;
  gn = !0, Nt("#r3-location").disabled = !0, ve("서버실 정보를 불러오고 있습니다.");
  try {
    const e = await Wi.load(i);
    if (t !== Or) return;
    Zt = e, nt = mn(e.layout), Ri = mn(nt), Ca = Zt.racks, Dn = i, It = nt.placements[0] ? { rackId: nt.placements[0].rack_id } : null, Je = [], Ne = !1, Nt("#r3-location").value = String(i), ve(Zt.warning), gn = !1, _e(), Ae?.view(Pe, It);
  } catch (e) {
    if (t !== Or) return;
    gn = !1, Nt("#r3-location").disabled = !1, ve(e.message, !0), Dn && (Nt("#r3-location").value = String(Dn)), _e();
  }
}
function ic(i, t = nt.width / 2, e = nt.depth / 2, n = !0) {
  !Xt() || !Zt.racks.some((s) => s.id === i) || nt.placements.some((s) => s.rack_id === i) || (dn(), nt.placements.push({ rack_id: i, x: Zs(t, "x"), z: Zs(e, "z"), rotation: 0, locked: !1, dimensions: {} }), It = { rackId: i }, n && ii(), ve("랙을 배치했습니다. 평면 모드에서 위치를 조정한 뒤 저장하세요."));
}
De.addEventListener("dragstart", (i) => {
  const t = i.target.closest("[data-rack]");
  t && (i.dataTransfer.setData("text/plain", t.dataset.rack), i.dataTransfer.effectAllowed = "copy");
});
De.addEventListener("click", async (i) => {
  const t = i.target.closest("[data-action]");
  if (!t || t.disabled || !nt) return;
  const e = t.dataset.action, n = Number(t.dataset.id);
  if (!(e === "find-device" || Ae.drag))
    try {
      if (e === "select")
        It = { rackId: n };
      else if (e === "select-block")
        It = { blockId: t.dataset.id };
      else if (e === "device")
        It.deviceId = n;
      else if (e === "place") ic(n, void 0, void 0, !1);
      else if (e === "view")
        Pe = t.dataset.view, Ae.view(Pe, It), Pe = Ae.mode;
      else if (e === "fit") Ae.view(Pe, It);
      else if (e === "front" || e === "rear")
        Pe = "3d", Ae.view(e, It);
      else if (e === "save" && Xt() && !Da(nt, Zt.racks).length) {
        h_(!0);
        const s = await Wi.save(Dn, nt);
        Zt = s, nt = mn(s.layout), Ri = mn(nt), Ca = Zt.racks, Ne = !1, Je = [], ve("배치를 저장했습니다.");
      } else if (e === "cancel")
        nt = mn(Ri), Zt.racks = Ca, Ne = !1, Je = [], ve("저장 전 변경을 취소했습니다.");
      else if (e === "reload")
        (!Ne || window.confirm("저장하지 않은 변경을 버리고 다시 불러올까요?")) && await Ya(Dn);
      else if (e === "undo" && Xt() && Je.length) {
        const s = Je.pop();
        nt = s.layout, Zt.racks = s.racks, Ne = JSON.stringify(nt) !== JSON.stringify(Ri);
      } else if (e === "room") {
        const s = Nt("#r3-room-form");
        for (const r of ["name", "width", "depth", "height", "grid"]) s.elements[r].value = nt[r];
        s.elements.include_descendants.checked = nt.include_descendants, Nt("#r3-room-dialog").showModal();
      } else if (e === "close-room") Nt("#r3-room-dialog").close();
      else if (e === "unplace" && Xt())
        nt.placements.find((r) => r.rack_id === It.rackId).locked || (dn(), nt.placements = nt.placements.filter((r) => r.rack_id !== It.rackId));
      else if (e === "add-block" && Xt()) {
        const s = Nt("#r3-object-type").value, r = ts[s];
        if (!r) return;
        const o = crypto.randomUUID(), a = { id: o, type: s, name: r.name, rotation: 0, width: Math.min(r.width, nt.width), depth: Math.min(r.depth, nt.depth), height: Math.min(r.height, nt.height), x: nt.width / 2, z: nt.depth / 2 };
        vl(a) || (a.x = nt.width / 2, a.z = nt.depth / 2, ve("빈 공간이 부족합니다. 좌표와 크기를 조정한 뒤 저장하세요.", !0)), dn(), nt.blocks.push(a), It = { blockId: o };
      } else if (e === "duplicate-block" && Xt()) {
        const s = nt.blocks.find((a) => a.id === It.blockId);
        if (!s) return;
        const r = { ...mn(s), id: crypto.randomUUID(), name: d_(s.name) };
        vl(r, s) || (r.x = s.x, r.z = s.z, ve("복사할 빈 공간이 부족합니다. 복사본의 좌표를 조정한 뒤 저장하세요.", !0)), dn(), nt.blocks.push(r), It = { blockId: r.id };
      } else e === "remove-block" && Xt() ? (dn(), nt.blocks = nt.blocks.filter((s) => s.id !== It.blockId), It = null) : e === "reset-appearance" && Xt() && (dn(), delete nt.appearances[String(It.deviceId)]);
    } catch (s) {
      ve(s.message, !0);
    } finally {
      gn = !1, nt && (Ne = JSON.stringify(nt) !== JSON.stringify(Ri), _e(!1, !["view", "fit", "front", "rear", "room", "close-room"].includes(e)), ["select", "device"].includes(e) && It && nt.placements.some((s) => s.rack_id === It.rackId) && ($a.trim() && (Pe = "3d", Ae.view("front", It), _e(!1, !1)), Ae.highlight(It)));
    }
});
De.addEventListener("click", (i) => {
  const t = i.target.closest("[data-action=find-device]");
  !t || !nt || (It = { rackId: Number(t.dataset.rackId), deviceId: Number(t.dataset.id) }, nt.placements.some((e) => e.rack_id === It.rackId) ? (Pe = "3d", Ae.view("front", It), _e(), Ae.highlight(It)) : (_e(), ve("미배치 랙의 장비입니다. 랙을 배치하면 3D 위치로 이동할 수 있습니다.")));
});
De.addEventListener("input", (i) => {
  i.target.id === "r3-search" && ($a = i.target.value, Ae.clearFocus(), _e(!1, !1));
});
De.addEventListener("change", async (i) => {
  const t = i.target;
  if (t.id === "r3-grid-size") {
    const r = Number(t.value);
    if (!Xt()) {
      _e();
      return;
    }
    if (!t.validity.valid || !Number.isInteger(r) || r < 100 || r > 5e3) {
      ve("격자 한 칸은 100~5000 mm 정수로 입력하세요.", !0), _e();
      return;
    }
    r !== nt.grid && (dn(), nt.grid = r, ii(), ve("격자 크기를 적용했습니다. 배치 저장을 누르면 유지됩니다."));
    return;
  }
  if (t.id === "r3-grid-origin") {
    if (!Xt() || !["top-left", "bottom-left", "top-right", "bottom-right"].includes(t.value)) {
      _e();
      return;
    }
    t.value !== (nt.grid_origin || "top-left") && (dn(), nt.grid_origin = t.value, ii(), ve("격자 시작 위치를 적용했습니다. 기존 배치 좌표는 유지됩니다."));
    return;
  }
  if (t.id === "r3-status-filter") {
    Te.statusFilter = t.value, _e();
    return;
  }
  if (t.id === "r3-only-rack-locations") {
    Ql = t.checked, qa();
    return;
  }
  if (t.id === "r3-location") {
    !Ne || window.confirm("저장하지 않은 변경을 버리고 Location을 전환할까요?") ? await Ya(Number(t.value)) : t.value = String(Dn);
    return;
  }
  if (t.id === "r3-show-placed") {
    tc = t.checked, _e();
    return;
  }
  for (const r of Object.keys(Te)) if (t.id === `r3-${r}`) {
    Te[r] = t.checked, _e();
    return;
  }
  if (!t.dataset.edit || !Xt()) return;
  const e = t.dataset.key, n = t.dataset.edit;
  let s = t.type === "checkbox" ? t.checked : t.type === "number" || t.tagName === "SELECT" ? t.value === "" ? null : Number(t.value) : t.value;
  if (t.type === "number" && (t.value === "" && n !== "appearance" || t.value !== "" && (!t.validity.valid || !Number.isFinite(s)))) {
    ve("치수와 좌표 범위를 확인하세요.", !0), _e();
    return;
  }
  if (dn(), n === "block") {
    const r = nt.blocks.find((a) => a.id === It.blockId), o = Ci(r);
    if (e === "x" || e === "z") r[e] += s - o[e];
    else if (r[e] = s, ["width", "depth", "rotation"].includes(e)) {
      const a = Ci(r);
      r.x += o.x - a.x, r.z += o.z - a.z;
    }
  } else if (n === "appearance") {
    const r = nt.appearances[String(It.deviceId)] ||= {};
    s == null ? delete r[e] : r[e] = s;
  } else {
    const r = nt.placements.find((l) => l.rack_id === It.rackId);
    if (r.locked && e !== "locked") return;
    const o = Zt.racks.find((l) => l.id === It.rackId), a = Ci({ ...r, ...un(o, r) });
    if (n === "dimensions" ? r.dimensions[e] = s : e === "x" || e === "z" ? r[e] += s - a[e] : r[e] = s, n === "dimensions" && ["width", "depth"].includes(e) || n === "placement" && e === "rotation") {
      const l = Ci({ ...r, ...un(o, r) });
      r.x += a.x - l.x, r.z += a.z - l.z;
    }
  }
  n === "appearance" && e === "color" && De.querySelectorAll(".r3-face-preview > div").forEach((r) => {
    r.style.background = s;
  }), ii(t.type === "number" || t.type === "color" || n === "block" && e === "name");
});
Nt("#r3-room-form").addEventListener("submit", async (i) => {
  if (i.preventDefault(), !Xt()) return;
  const t = i.target, e = mn(nt);
  if (e.name = t.elements.name.value.trim(), !!e.name) {
    for (const n of ["width", "depth", "height", "grid"]) e[n] = Number(t.elements[n].value);
    e.include_descendants = t.elements.include_descendants.checked;
    try {
      let n = Zt.racks;
      if (e.include_descendants !== nt.include_descendants) {
        const s = await Wi.load(Dn, e.include_descendants), r = new Set(s.racks.map((a) => a.id));
        if (e.placements.some((a) => !r.has(a.rack_id))) throw new Error("하위 Location의 배치된 랙을 먼저 배치 해제하세요.");
        const o = new Set(s.racks.flatMap((a) => a.devices.map((l) => String(l.id))));
        if (Object.keys(e.appearances).some((a) => !o.has(a))) throw new Error("하위 Location 장비의 표시 설정을 먼저 초기화하세요.");
        n = s.racks;
      }
      dn(), Zt.racks = n, nt = e, Nt("#r3-room-dialog").close(), ii(), Ae.view(Pe, It);
    } catch (n) {
      ve(n.message, !0), Nt("#r3-room-dialog").close();
    }
  }
});
window.addEventListener("beforeunload", (i) => {
  Ne && (i.preventDefault(), i.returnValue = "");
});
async function f_() {
  try {
    if (Ae = new l_(Nt("#r3-canvas"), {
      exitWalk: () => {
        Pe = "3d", Ae.view(Pe, It), _e();
      },
      walkError: () => ve("걸어 다닐 빈 공간이 없습니다. 서버실 배치를 확인하세요.", !0),
      selectBlock: (t) => {
        It = { blockId: t }, _e();
      },
      dragStart: (t) => {
        It = t.blockId ? { blockId: t.blockId } : { rackId: t.rackId }, _e(), Nt("[data-action=save]").disabled = !0;
      },
      dragBlock: (t, e, n) => {
        if (!Xt()) return;
        const s = nt.blocks.find((r) => r.id === t);
        s && (An ||= { layout: mn(nt), racks: Zt.racks }, { x: s.x, z: s.z } = Pa(s, e, n), It = { blockId: t }, Ne = !0, Ae.movePlacement("block", t, s));
      },
      select: (t, e) => {
        It = { rackId: t, deviceId: e }, _e();
      },
      drop: ic,
      drag: (t, e, n) => {
        if (!Xt()) return;
        const s = nt.placements.find((r) => r.rack_id === t);
        s.locked || (An ||= { layout: mn(nt), racks: Zt.racks }, { x: s.x, z: s.z } = Pa({ ...s, ...un(Zt.racks.find((r) => r.id === t), s) }, e, n), It = { rackId: t }, Ne = !0, Ae.movePlacement("rack", t, s));
      },
      dragEnd: () => {
        An && (JSON.stringify(nt) !== JSON.stringify(An.layout) && (Je.push(An), Je.length > 30 && Je.shift()), An = null), ii();
      },
      dragCancel: () => {
        An && (nt = An.layout, An = null), ii();
      },
      imageError: () => ve("일부 이미지를 불러오지 못해 해당 면을 장비 색상으로 표시합니다.", !0)
    }), Ti = await Wi.list(), qa(), !Ti.length) {
      ve("조회할 수 있는 Location이 없습니다. NetBox의 Location과 권한을 확인하세요.", !0);
      return;
    }
    const i = Number(De.dataset.initialLocation || new URLSearchParams(window.location.search).get("location"));
    await Ya(Ti.some((t) => t.id === i) ? i : Ti.find((t) => t.configured)?.id || Ti[0].id);
  } catch (i) {
    ve(`뷰어를 시작할 수 없습니다: ${i.message}`, !0);
  }
}
f_();
