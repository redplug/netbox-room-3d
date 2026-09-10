const Zi = {
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
function Ya(i = !1) {
  const t = Array.from({ length: i ? 8 : 12 }, (e, n) => `<rect x="${28 + n * 34}" y="${i ? 22 : 16}" width="26" height="${i ? 24 : 37}" rx="2" fill="${i ? "#0e7490" : "#26374a"}" stroke="#566679"/><circle cx="${32 + n * 34}" cy="${i ? 27 : 45}" r="2" fill="#5eead4"/>`).join("");
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="70"><rect width="480" height="70" rx="4" fill="#a8b2c0"/><rect x="8" y="7" width="464" height="56" fill="#111c2b"/>${t}<text x="445" y="40" fill="#dbeafe" font-size="9" font-family="sans-serif" text-anchor="middle">${i ? "REAR" : "FRONT"}</text></svg>`)}`;
}
function ec(i = 1) {
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
      status: "active",
      color: s < 2 ? "#3b82f6" : ["#0d9488", "#64748b", "#8b5cf6"][n % 3],
      front_image: s === 2 || s === 3 ? Ya() : null,
      rear_image: s === 2 ? Ya(!0) : null,
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
      include_descendants: !1,
      revision: 0,
      appearances: {},
      placements: t.slice(0, i === 1 ? 4 : 2).map((e, n) => ({ rack_id: e.id, x: 2400 + n * 1200, z: 3e3, rotation: 0, locked: !1, dimensions: {} })),
      blocks: [{ id: "pillar1", name: "기둥", x: 9e3, z: 6e3, width: 600, depth: 600, height: 3e3 }]
    }
  };
}
class nc {
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
      const r = ec(t), s = localStorage.getItem(`room3d-demo-v1-${t}`);
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
      return r.revision++, localStorage.setItem(`room3d-demo-v1-${t}`, JSON.stringify(r)), { ...n, layout: r };
    }
    return this.request(this.locations.find((n) => n.id === t).url, { method: "PUT", body: JSON.stringify(e) });
  }
}
const ba = "180", wi = { ROTATE: 0, DOLLY: 1, PAN: 2 }, Ei = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 }, ic = 0, qa = 1, rc = 2, ll = 1, sc = 2, vn = 3, Bn = 0, Ne = 1, Mn = 2, Nn = 0, Ri = 1, $a = 2, ja = 3, Ka = 4, ac = 5, jn = 100, oc = 101, lc = 102, cc = 103, hc = 104, dc = 200, uc = 201, fc = 202, pc = 203, Is = 204, Us = 205, mc = 206, _c = 207, gc = 208, vc = 209, xc = 210, Mc = 211, Sc = 212, Ec = 213, yc = 214, Ns = 0, Fs = 1, Os = 2, Di = 3, Bs = 4, ks = 5, zs = 6, Hs = 7, cl = 0, bc = 1, Tc = 2, Fn = 0, Ac = 1, wc = 2, Rc = 3, Cc = 4, Pc = 5, Dc = 6, Lc = 7, hl = 300, Li = 301, Ii = 302, Vs = 303, Gs = 304, qr = 306, Ws = 1e3, Zn = 1001, Xs = 1002, Je = 1003, Ic = 1004, cr = 1005, nn = 1006, Qr = 1007, Jn = 1008, cn = 1009, dl = 1010, ul = 1011, Ji = 1012, Ta = 1013, ti = 1014, Sn = 1015, rr = 1016, Aa = 1017, wa = 1018, Qi = 1020, fl = 35902, pl = 35899, ml = 1021, _l = 1022, Ke = 1023, tr = 1026, er = 1027, gl = 1028, Ra = 1029, vl = 1030, Ca = 1031, Pa = 1033, Fr = 33776, Or = 33777, Br = 33778, kr = 33779, Ys = 35840, qs = 35841, $s = 35842, js = 35843, Ks = 36196, Zs = 37492, Js = 37496, Qs = 37808, ta = 37809, ea = 37810, na = 37811, ia = 37812, ra = 37813, sa = 37814, aa = 37815, oa = 37816, la = 37817, ca = 37818, ha = 37819, da = 37820, ua = 37821, fa = 36492, pa = 36494, ma = 36495, _a = 36283, ga = 36284, va = 36285, xa = 36286, Uc = 3200, Nc = 3201, xl = 0, Fc = 1, In = "", Le = "srgb", Ui = "srgb-linear", Hr = "linear", te = "srgb", si = 7680, Za = 519, Oc = 512, Bc = 513, kc = 514, Ml = 515, zc = 516, Hc = 517, Vc = 518, Gc = 519, Ja = 35044, Qa = "300 es", rn = 2e3, Vr = 2001;
class ii {
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
const be = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
let to = 1234567;
const Ci = Math.PI / 180, nr = 180 / Math.PI;
function Fi() {
  const i = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
  return (be[i & 255] + be[i >> 8 & 255] + be[i >> 16 & 255] + be[i >> 24 & 255] + "-" + be[t & 255] + be[t >> 8 & 255] + "-" + be[t >> 16 & 15 | 64] + be[t >> 24 & 255] + "-" + be[e & 63 | 128] + be[e >> 8 & 255] + "-" + be[e >> 16 & 255] + be[e >> 24 & 255] + be[n & 255] + be[n >> 8 & 255] + be[n >> 16 & 255] + be[n >> 24 & 255]).toLowerCase();
}
function Ht(i, t, e) {
  return Math.max(t, Math.min(e, i));
}
function Da(i, t) {
  return (i % t + t) % t;
}
function Wc(i, t, e, n, r) {
  return n + (i - t) * (r - n) / (e - t);
}
function Xc(i, t, e) {
  return i !== t ? (e - i) / (t - i) : 0;
}
function ji(i, t, e) {
  return (1 - e) * i + e * t;
}
function Yc(i, t, e, n) {
  return ji(i, t, 1 - Math.exp(-e * n));
}
function qc(i, t = 1) {
  return t - Math.abs(Da(i, t * 2) - t);
}
function $c(i, t, e) {
  return i <= t ? 0 : i >= e ? 1 : (i = (i - t) / (e - t), i * i * (3 - 2 * i));
}
function jc(i, t, e) {
  return i <= t ? 0 : i >= e ? 1 : (i = (i - t) / (e - t), i * i * i * (i * (i * 6 - 15) + 10));
}
function Kc(i, t) {
  return i + Math.floor(Math.random() * (t - i + 1));
}
function Zc(i, t) {
  return i + Math.random() * (t - i);
}
function Jc(i) {
  return i * (0.5 - Math.random());
}
function Qc(i) {
  i !== void 0 && (to = i);
  let t = to += 1831565813;
  return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function th(i) {
  return i * Ci;
}
function eh(i) {
  return i * nr;
}
function nh(i) {
  return (i & i - 1) === 0 && i !== 0;
}
function ih(i) {
  return Math.pow(2, Math.ceil(Math.log(i) / Math.LN2));
}
function rh(i) {
  return Math.pow(2, Math.floor(Math.log(i) / Math.LN2));
}
function sh(i, t, e, n, r) {
  const s = Math.cos, a = Math.sin, o = s(e / 2), l = a(e / 2), c = s((t + n) / 2), u = a((t + n) / 2), d = s((t - n) / 2), f = a((t - n) / 2), m = s((n - t) / 2), _ = a((n - t) / 2);
  switch (r) {
    case "XYX":
      i.set(o * u, l * d, l * f, o * c);
      break;
    case "YZY":
      i.set(l * f, o * u, l * d, o * c);
      break;
    case "ZXZ":
      i.set(l * d, l * f, o * u, o * c);
      break;
    case "XZX":
      i.set(o * u, l * _, l * m, o * c);
      break;
    case "YXY":
      i.set(l * m, o * u, l * _, o * c);
      break;
    case "ZYZ":
      i.set(l * _, l * m, o * u, o * c);
      break;
    default:
      console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + r);
  }
}
function Mi(i, t) {
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
function we(i, t) {
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
const Sl = {
  DEG2RAD: Ci,
  RAD2DEG: nr,
  /**
   * Generate a [UUID]{@link https://en.wikipedia.org/wiki/Universally_unique_identifier}
   * (universally unique identifier).
   *
   * @static
   * @method
   * @return {string} The UUID.
   */
  generateUUID: Fi,
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
  clamp: Ht,
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
  euclideanModulo: Da,
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
  mapLinear: Wc,
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
  inverseLerp: Xc,
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
  lerp: ji,
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
  damp: Yc,
  /**
   * Returns a value that alternates between `0` and the given `length` parameter.
   *
   * @static
   * @method
   * @param {number} x - The value to pingpong.
   * @param {number} [length=1] - The positive value the function will pingpong to.
   * @return {number} The alternated value.
   */
  pingpong: qc,
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
  smoothstep: $c,
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
  smootherstep: jc,
  /**
   * Returns a random integer from `<low, high>` interval.
   *
   * @static
   * @method
   * @param {number} low - The lower value boundary.
   * @param {number} high - The upper value boundary
   * @return {number} A random integer.
   */
  randInt: Kc,
  /**
   * Returns a random float from `<low, high>` interval.
   *
   * @static
   * @method
   * @param {number} low - The lower value boundary.
   * @param {number} high - The upper value boundary
   * @return {number} A random float.
   */
  randFloat: Zc,
  /**
   * Returns a random integer from `<-range/2, range/2>` interval.
   *
   * @static
   * @method
   * @param {number} range - Defines the value range.
   * @return {number} A random float.
   */
  randFloatSpread: Jc,
  /**
   * Returns a deterministic pseudo-random float in the interval `[0, 1]`.
   *
   * @static
   * @method
   * @param {number} [s] - The integer seed.
   * @return {number} A random float.
   */
  seededRandom: Qc,
  /**
   * Converts degrees to radians.
   *
   * @static
   * @method
   * @param {number} degrees - A value in degrees.
   * @return {number} The converted value in radians.
   */
  degToRad: th,
  /**
   * Converts radians to degrees.
   *
   * @static
   * @method
   * @param {number} radians - A value in radians.
   * @return {number} The converted value in degrees.
   */
  radToDeg: eh,
  /**
   * Returns `true` if the given number is a power of two.
   *
   * @static
   * @method
   * @param {number} value - The value to check.
   * @return {boolean} Whether the given number is a power of two or not.
   */
  isPowerOfTwo: nh,
  /**
   * Returns the smallest power of two that is greater than or equal to the given number.
   *
   * @static
   * @method
   * @param {number} value - The value to find a POT for.
   * @return {number} The smallest power of two that is greater than or equal to the given number.
   */
  ceilPowerOfTwo: ih,
  /**
   * Returns the largest power of two that is less than or equal to the given number.
   *
   * @static
   * @method
   * @param {number} value - The value to find a POT for.
   * @return {number} The largest power of two that is less than or equal to the given number.
   */
  floorPowerOfTwo: rh,
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
  setQuaternionFromProperEuler: sh,
  /**
   * Normalizes the given value according to the given typed array.
   *
   * @static
   * @method
   * @param {number} value - The float value in the range `[0,1]` to normalize.
   * @param {TypedArray} array - The typed array that defines the data type of the value.
   * @return {number} The normalize value.
   */
  normalize: we,
  /**
   * Denormalizes the given value according to the given typed array.
   *
   * @static
   * @method
   * @param {number} value - The value to denormalize.
   * @param {TypedArray} array - The typed array that defines the data type of the value.
   * @return {number} The denormalize (float) value in the range `[0,1]`.
   */
  denormalize: Mi
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
    return this.x = Ht(this.x, t.x, e.x), this.y = Ht(this.y, t.y, e.y), this;
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
    return this.x = Ht(this.x, t, e), this.y = Ht(this.y, t, e), this;
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
    return this.divideScalar(n || 1).multiplyScalar(Ht(n, t, e));
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
    return Math.acos(Ht(n, -1, 1));
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
class ei {
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
    let l = n[r + 0], c = n[r + 1], u = n[r + 2], d = n[r + 3];
    const f = s[a + 0], m = s[a + 1], _ = s[a + 2], v = s[a + 3];
    if (o === 0) {
      t[e + 0] = l, t[e + 1] = c, t[e + 2] = u, t[e + 3] = d;
      return;
    }
    if (o === 1) {
      t[e + 0] = f, t[e + 1] = m, t[e + 2] = _, t[e + 3] = v;
      return;
    }
    if (d !== v || l !== f || c !== m || u !== _) {
      let p = 1 - o;
      const h = l * f + c * m + u * _ + d * v, b = h >= 0 ? 1 : -1, T = 1 - h * h;
      if (T > Number.EPSILON) {
        const R = Math.sqrt(T), C = Math.atan2(R, h * b);
        p = Math.sin(p * C) / R, o = Math.sin(o * C) / R;
      }
      const M = o * b;
      if (l = l * p + f * M, c = c * p + m * M, u = u * p + _ * M, d = d * p + v * M, p === 1 - o) {
        const R = 1 / Math.sqrt(l * l + c * c + u * u + d * d);
        l *= R, c *= R, u *= R, d *= R;
      }
    }
    t[e] = l, t[e + 1] = c, t[e + 2] = u, t[e + 3] = d;
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
    const o = n[r], l = n[r + 1], c = n[r + 2], u = n[r + 3], d = s[a], f = s[a + 1], m = s[a + 2], _ = s[a + 3];
    return t[e] = o * _ + u * d + l * m - c * f, t[e + 1] = l * _ + u * f + c * d - o * m, t[e + 2] = c * _ + u * m + o * f - l * d, t[e + 3] = u * _ - o * d - l * f - c * m, t;
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
    const n = t._x, r = t._y, s = t._z, a = t._order, o = Math.cos, l = Math.sin, c = o(n / 2), u = o(r / 2), d = o(s / 2), f = l(n / 2), m = l(r / 2), _ = l(s / 2);
    switch (a) {
      case "XYZ":
        this._x = f * u * d + c * m * _, this._y = c * m * d - f * u * _, this._z = c * u * _ + f * m * d, this._w = c * u * d - f * m * _;
        break;
      case "YXZ":
        this._x = f * u * d + c * m * _, this._y = c * m * d - f * u * _, this._z = c * u * _ - f * m * d, this._w = c * u * d + f * m * _;
        break;
      case "ZXY":
        this._x = f * u * d - c * m * _, this._y = c * m * d + f * u * _, this._z = c * u * _ + f * m * d, this._w = c * u * d - f * m * _;
        break;
      case "ZYX":
        this._x = f * u * d - c * m * _, this._y = c * m * d + f * u * _, this._z = c * u * _ - f * m * d, this._w = c * u * d + f * m * _;
        break;
      case "YZX":
        this._x = f * u * d + c * m * _, this._y = c * m * d + f * u * _, this._z = c * u * _ - f * m * d, this._w = c * u * d - f * m * _;
        break;
      case "XZY":
        this._x = f * u * d - c * m * _, this._y = c * m * d - f * u * _, this._z = c * u * _ + f * m * d, this._w = c * u * d + f * m * _;
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
    const e = t.elements, n = e[0], r = e[4], s = e[8], a = e[1], o = e[5], l = e[9], c = e[2], u = e[6], d = e[10], f = n + o + d;
    if (f > 0) {
      const m = 0.5 / Math.sqrt(f + 1);
      this._w = 0.25 / m, this._x = (u - l) * m, this._y = (s - c) * m, this._z = (a - r) * m;
    } else if (n > o && n > d) {
      const m = 2 * Math.sqrt(1 + n - o - d);
      this._w = (u - l) / m, this._x = 0.25 * m, this._y = (r + a) / m, this._z = (s + c) / m;
    } else if (o > d) {
      const m = 2 * Math.sqrt(1 + o - n - d);
      this._w = (s - c) / m, this._x = (r + a) / m, this._y = 0.25 * m, this._z = (l + u) / m;
    } else {
      const m = 2 * Math.sqrt(1 + d - n - o);
      this._w = (a - r) / m, this._x = (s + c) / m, this._y = (l + u) / m, this._z = 0.25 * m;
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
    return 2 * Math.acos(Math.abs(Ht(this.dot(t), -1, 1)));
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
    const n = t._x, r = t._y, s = t._z, a = t._w, o = e._x, l = e._y, c = e._z, u = e._w;
    return this._x = n * u + a * o + r * c - s * l, this._y = r * u + a * l + s * o - n * c, this._z = s * u + a * c + n * l - r * o, this._w = a * u - n * o - r * l - s * c, this._onChangeCallback(), this;
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
      const m = 1 - e;
      return this._w = m * a + e * this._w, this._x = m * n + e * this._x, this._y = m * r + e * this._y, this._z = m * s + e * this._z, this.normalize(), this;
    }
    const c = Math.sqrt(l), u = Math.atan2(c, o), d = Math.sin((1 - e) * u) / c, f = Math.sin(e * u) / c;
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
    return this.applyQuaternion(eo.setFromEuler(t));
  }
  /**
   * Applies a rotation specified by an axis and an angle to this vector.
   *
   * @param {Vector3} axis - A normalized vector representing the rotation axis.
   * @param {number} angle - The angle in radians.
   * @return {Vector3} A reference to this vector.
   */
  applyAxisAngle(t, e) {
    return this.applyQuaternion(eo.setFromAxisAngle(t, e));
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
    const e = this.x, n = this.y, r = this.z, s = t.x, a = t.y, o = t.z, l = t.w, c = 2 * (a * r - o * n), u = 2 * (o * e - s * r), d = 2 * (s * n - a * e);
    return this.x = e + l * c + a * d - o * u, this.y = n + l * u + o * c - s * d, this.z = r + l * d + s * u - a * c, this;
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
    return this.x = Ht(this.x, t.x, e.x), this.y = Ht(this.y, t.y, e.y), this.z = Ht(this.z, t.z, e.z), this;
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
    return this.x = Ht(this.x, t, e), this.y = Ht(this.y, t, e), this.z = Ht(this.z, t, e), this;
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
    return this.divideScalar(n || 1).multiplyScalar(Ht(n, t, e));
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
    return ts.copy(this).projectOnVector(t), this.sub(ts);
  }
  /**
   * Reflects this vector off a plane orthogonal to the given normal vector.
   *
   * @param {Vector3} normal - The (normalized) normal vector.
   * @return {Vector3} A reference to this vector.
   */
  reflect(t) {
    return this.sub(ts.copy(t).multiplyScalar(2 * this.dot(t)));
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
    return Math.acos(Ht(n, -1, 1));
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
const ts = /* @__PURE__ */ new I(), eo = /* @__PURE__ */ new ei();
class Nt {
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
    Nt.prototype.isMatrix3 = !0, this.elements = [
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
    const u = this.elements;
    return u[0] = t, u[1] = r, u[2] = o, u[3] = e, u[4] = s, u[5] = l, u[6] = n, u[7] = a, u[8] = c, this;
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
    const n = t.elements, r = e.elements, s = this.elements, a = n[0], o = n[3], l = n[6], c = n[1], u = n[4], d = n[7], f = n[2], m = n[5], _ = n[8], v = r[0], p = r[3], h = r[6], b = r[1], T = r[4], M = r[7], R = r[2], C = r[5], w = r[8];
    return s[0] = a * v + o * b + l * R, s[3] = a * p + o * T + l * C, s[6] = a * h + o * M + l * w, s[1] = c * v + u * b + d * R, s[4] = c * p + u * T + d * C, s[7] = c * h + u * M + d * w, s[2] = f * v + m * b + _ * R, s[5] = f * p + m * T + _ * C, s[8] = f * h + m * M + _ * w, this;
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
    const t = this.elements, e = t[0], n = t[1], r = t[2], s = t[3], a = t[4], o = t[5], l = t[6], c = t[7], u = t[8];
    return e * a * u - e * o * c - n * s * u + n * o * l + r * s * c - r * a * l;
  }
  /**
   * Inverts this matrix, using the [analytic method]{@link https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution}.
   * You can not invert with a determinant of zero. If you attempt this, the method produces
   * a zero matrix instead.
   *
   * @return {Matrix3} A reference to this matrix.
   */
  invert() {
    const t = this.elements, e = t[0], n = t[1], r = t[2], s = t[3], a = t[4], o = t[5], l = t[6], c = t[7], u = t[8], d = u * a - o * c, f = o * l - u * s, m = c * s - a * l, _ = e * d + n * f + r * m;
    if (_ === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const v = 1 / _;
    return t[0] = d * v, t[1] = (r * c - u * n) * v, t[2] = (o * n - r * a) * v, t[3] = f * v, t[4] = (u * e - r * l) * v, t[5] = (r * s - o * e) * v, t[6] = m * v, t[7] = (n * l - c * e) * v, t[8] = (a * e - n * s) * v, this;
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
    return this.premultiply(es.makeScale(t, e)), this;
  }
  /**
   * Rotates this matrix by the given angle.
   *
   * @param {number} theta - The rotation in radians.
   * @return {Matrix3} A reference to this matrix.
   */
  rotate(t) {
    return this.premultiply(es.makeRotation(-t)), this;
  }
  /**
   * Translates this matrix by the given scalar values.
   *
   * @param {number} tx - The amount to translate in the X axis.
   * @param {number} ty - The amount to translate in the Y axis.
   * @return {Matrix3} A reference to this matrix.
   */
  translate(t, e) {
    return this.premultiply(es.makeTranslation(t, e)), this;
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
const es = /* @__PURE__ */ new Nt();
function El(i) {
  for (let t = i.length - 1; t >= 0; --t)
    if (i[t] >= 65535) return !0;
  return !1;
}
function Gr(i) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", i);
}
function ah() {
  const i = Gr("canvas");
  return i.style.display = "block", i;
}
const no = {};
function ir(i) {
  i in no || (no[i] = !0, console.warn(i));
}
function oh(i, t, e) {
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
const io = /* @__PURE__ */ new Nt().set(
  0.4123908,
  0.3575843,
  0.1804808,
  0.212639,
  0.7151687,
  0.0721923,
  0.0193308,
  0.1191948,
  0.9505322
), ro = /* @__PURE__ */ new Nt().set(
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
function lh() {
  const i = {
    enabled: !0,
    workingColorSpace: Ui,
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
      return this.enabled === !1 || s === a || !s || !a || (this.spaces[s].transfer === te && (r.r = bn(r.r), r.g = bn(r.g), r.b = bn(r.b)), this.spaces[s].primaries !== this.spaces[a].primaries && (r.applyMatrix3(this.spaces[s].toXYZ), r.applyMatrix3(this.spaces[a].fromXYZ)), this.spaces[a].transfer === te && (r.r = Pi(r.r), r.g = Pi(r.g), r.b = Pi(r.b))), r;
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
      return r === In ? Hr : this.spaces[r].transfer;
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
      return ir("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."), i.workingToColorSpace(r, s);
    },
    toWorkingColorSpace: function(r, s) {
      return ir("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."), i.colorSpaceToWorking(r, s);
    }
  }, t = [0.64, 0.33, 0.3, 0.6, 0.15, 0.06], e = [0.2126, 0.7152, 0.0722], n = [0.3127, 0.329];
  return i.define({
    [Ui]: {
      primaries: t,
      whitePoint: n,
      transfer: Hr,
      toXYZ: io,
      fromXYZ: ro,
      luminanceCoefficients: e,
      workingColorSpaceConfig: { unpackColorSpace: Le },
      outputColorSpaceConfig: { drawingBufferColorSpace: Le }
    },
    [Le]: {
      primaries: t,
      whitePoint: n,
      transfer: te,
      toXYZ: io,
      fromXYZ: ro,
      luminanceCoefficients: e,
      outputColorSpaceConfig: { drawingBufferColorSpace: Le }
    }
  }), i;
}
const $t = /* @__PURE__ */ lh();
function bn(i) {
  return i < 0.04045 ? i * 0.0773993808 : Math.pow(i * 0.9478672986 + 0.0521327014, 2.4);
}
function Pi(i) {
  return i < 31308e-7 ? i * 12.92 : 1.055 * Math.pow(i, 0.41666) - 0.055;
}
let ai;
class ch {
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
      ai === void 0 && (ai = Gr("canvas")), ai.width = t.width, ai.height = t.height;
      const r = ai.getContext("2d");
      t instanceof ImageData ? r.putImageData(t, 0, 0) : r.drawImage(t, 0, 0, t.width, t.height), n = ai;
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
      const e = Gr("canvas");
      e.width = t.width, e.height = t.height;
      const n = e.getContext("2d");
      n.drawImage(t, 0, 0, t.width, t.height);
      const r = n.getImageData(0, 0, t.width, t.height), s = r.data;
      for (let a = 0; a < s.length; a++)
        s[a] = bn(s[a] / 255) * 255;
      return n.putImageData(r, 0, 0), e;
    } else if (t.data) {
      const e = t.data.slice(0);
      for (let n = 0; n < e.length; n++)
        e instanceof Uint8Array || e instanceof Uint8ClampedArray ? e[n] = Math.floor(bn(e[n] / 255) * 255) : e[n] = bn(e[n]);
      return {
        data: e,
        width: t.width,
        height: t.height
      };
    } else
      return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), t;
  }
}
let hh = 0;
class La {
  /**
   * Constructs a new video texture.
   *
   * @param {any} [data=null] - The data definition of a texture.
   */
  constructor(t = null) {
    this.isSource = !0, Object.defineProperty(this, "id", { value: hh++ }), this.uuid = Fi(), this.data = t, this.dataReady = !0, this.version = 0;
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
          r[a].isDataTexture ? s.push(ns(r[a].image)) : s.push(ns(r[a]));
      } else
        s = ns(r);
      n.url = s;
    }
    return e || (t.images[this.uuid] = n), n;
  }
}
function ns(i) {
  return typeof HTMLImageElement < "u" && i instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && i instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && i instanceof ImageBitmap ? ch.getDataURL(i) : i.data ? {
    data: Array.from(i.data),
    width: i.width,
    height: i.height,
    type: i.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let dh = 0;
const is = /* @__PURE__ */ new I();
class Ce extends ii {
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
  constructor(t = Ce.DEFAULT_IMAGE, e = Ce.DEFAULT_MAPPING, n = Zn, r = Zn, s = nn, a = Jn, o = Ke, l = cn, c = Ce.DEFAULT_ANISOTROPY, u = In) {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: dh++ }), this.uuid = Fi(), this.name = "", this.source = new La(t), this.mipmaps = [], this.mapping = e, this.channel = 0, this.wrapS = n, this.wrapT = r, this.magFilter = s, this.minFilter = a, this.anisotropy = c, this.format = o, this.internalFormat = null, this.type = l, this.offset = new Dt(0, 0), this.repeat = new Dt(1, 1), this.center = new Dt(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Nt(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = u, this.userData = {}, this.updateRanges = [], this.version = 0, this.onUpdate = null, this.renderTarget = null, this.isRenderTargetTexture = !1, this.isArrayTexture = !!(t && t.depth && t.depth > 1), this.pmremVersion = 0;
  }
  /**
   * The width of the texture in pixels.
   */
  get width() {
    return this.source.getSize(is).x;
  }
  /**
   * The height of the texture in pixels.
   */
  get height() {
    return this.source.getSize(is).y;
  }
  /**
   * The depth of the texture in pixels.
   */
  get depth() {
    return this.source.getSize(is).z;
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
    if (this.mapping !== hl) return t;
    if (t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1)
      switch (this.wrapS) {
        case Ws:
          t.x = t.x - Math.floor(t.x);
          break;
        case Zn:
          t.x = t.x < 0 ? 0 : 1;
          break;
        case Xs:
          Math.abs(Math.floor(t.x) % 2) === 1 ? t.x = Math.ceil(t.x) - t.x : t.x = t.x - Math.floor(t.x);
          break;
      }
    if (t.y < 0 || t.y > 1)
      switch (this.wrapT) {
        case Ws:
          t.y = t.y - Math.floor(t.y);
          break;
        case Zn:
          t.y = t.y < 0 ? 0 : 1;
          break;
        case Xs:
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
Ce.DEFAULT_IMAGE = null;
Ce.DEFAULT_MAPPING = hl;
Ce.DEFAULT_ANISOTROPY = 1;
class ue {
  /**
   * Constructs a new 4D vector.
   *
   * @param {number} [x=0] - The x value of this vector.
   * @param {number} [y=0] - The y value of this vector.
   * @param {number} [z=0] - The z value of this vector.
   * @param {number} [w=1] - The w value of this vector.
   */
  constructor(t = 0, e = 0, n = 0, r = 1) {
    ue.prototype.isVector4 = !0, this.x = t, this.y = e, this.z = n, this.w = r;
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
    const l = t.elements, c = l[0], u = l[4], d = l[8], f = l[1], m = l[5], _ = l[9], v = l[2], p = l[6], h = l[10];
    if (Math.abs(u - f) < 0.01 && Math.abs(d - v) < 0.01 && Math.abs(_ - p) < 0.01) {
      if (Math.abs(u + f) < 0.1 && Math.abs(d + v) < 0.1 && Math.abs(_ + p) < 0.1 && Math.abs(c + m + h - 3) < 0.1)
        return this.set(1, 0, 0, 0), this;
      e = Math.PI;
      const T = (c + 1) / 2, M = (m + 1) / 2, R = (h + 1) / 2, C = (u + f) / 4, w = (d + v) / 4, N = (_ + p) / 4;
      return T > M && T > R ? T < 0.01 ? (n = 0, r = 0.707106781, s = 0.707106781) : (n = Math.sqrt(T), r = C / n, s = w / n) : M > R ? M < 0.01 ? (n = 0.707106781, r = 0, s = 0.707106781) : (r = Math.sqrt(M), n = C / r, s = N / r) : R < 0.01 ? (n = 0.707106781, r = 0.707106781, s = 0) : (s = Math.sqrt(R), n = w / s, r = N / s), this.set(n, r, s, e), this;
    }
    let b = Math.sqrt((p - _) * (p - _) + (d - v) * (d - v) + (f - u) * (f - u));
    return Math.abs(b) < 1e-3 && (b = 1), this.x = (p - _) / b, this.y = (d - v) / b, this.z = (f - u) / b, this.w = Math.acos((c + m + h - 1) / 2), this;
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
    return this.x = Ht(this.x, t.x, e.x), this.y = Ht(this.y, t.y, e.y), this.z = Ht(this.z, t.z, e.z), this.w = Ht(this.w, t.w, e.w), this;
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
    return this.x = Ht(this.x, t, e), this.y = Ht(this.y, t, e), this.z = Ht(this.z, t, e), this.w = Ht(this.w, t, e), this;
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
    return this.divideScalar(n || 1).multiplyScalar(Ht(n, t, e));
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
class uh extends ii {
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
      minFilter: nn,
      depthBuffer: !0,
      stencilBuffer: !1,
      resolveDepthBuffer: !0,
      resolveStencilBuffer: !0,
      depthTexture: null,
      samples: 0,
      count: 1,
      depth: 1,
      multiview: !1
    }, n), this.isRenderTarget = !0, this.width = t, this.height = e, this.depth = n.depth, this.scissor = new ue(0, 0, t, e), this.scissorTest = !1, this.viewport = new ue(0, 0, t, e);
    const r = { width: t, height: e, depth: n.depth }, s = new Ce(r);
    this.textures = [];
    const a = n.count;
    for (let o = 0; o < a; o++)
      this.textures[o] = s.clone(), this.textures[o].isRenderTargetTexture = !0, this.textures[o].renderTarget = this;
    this._setTextureOptions(n), this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.resolveDepthBuffer = n.resolveDepthBuffer, this.resolveStencilBuffer = n.resolveStencilBuffer, this._depthTexture = null, this.depthTexture = n.depthTexture, this.samples = n.samples, this.multiview = n.multiview;
  }
  _setTextureOptions(t = {}) {
    const e = {
      minFilter: nn,
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
      this.textures[e].source = new La(r);
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
class ni extends uh {
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
class yl extends Ce {
  /**
   * Constructs a new data array texture.
   *
   * @param {?TypedArray} [data=null] - The buffer data.
   * @param {number} [width=1] - The width of the texture.
   * @param {number} [height=1] - The height of the texture.
   * @param {number} [depth=1] - The depth of the texture.
   */
  constructor(t = null, e = 1, n = 1, r = 1) {
    super(null), this.isDataArrayTexture = !0, this.image = { data: t, width: e, height: n, depth: r }, this.magFilter = Je, this.minFilter = Je, this.wrapR = Zn, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
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
class fh extends Ce {
  /**
   * Constructs a new data array texture.
   *
   * @param {?TypedArray} [data=null] - The buffer data.
   * @param {number} [width=1] - The width of the texture.
   * @param {number} [height=1] - The height of the texture.
   * @param {number} [depth=1] - The depth of the texture.
   */
  constructor(t = null, e = 1, n = 1, r = 1) {
    super(null), this.isData3DTexture = !0, this.image = { data: t, width: e, height: n, depth: r }, this.magFilter = Je, this.minFilter = Je, this.wrapR = Zn, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
class sr {
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
      this.expandByPoint(Ye.fromArray(t, e));
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
      this.expandByPoint(Ye.fromBufferAttribute(t, e));
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
    const n = Ye.copy(e).multiplyScalar(0.5);
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
          t.isMesh === !0 ? t.getVertexPosition(a, Ye) : Ye.fromBufferAttribute(s, a), Ye.applyMatrix4(t.matrixWorld), this.expandByPoint(Ye);
      else
        t.boundingBox !== void 0 ? (t.boundingBox === null && t.computeBoundingBox(), hr.copy(t.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), hr.copy(n.boundingBox)), hr.applyMatrix4(t.matrixWorld), this.union(hr);
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
    return this.clampPoint(t.center, Ye), Ye.distanceToSquared(t.center) <= t.radius * t.radius;
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
    this.getCenter(Vi), dr.subVectors(this.max, Vi), oi.subVectors(t.a, Vi), li.subVectors(t.b, Vi), ci.subVectors(t.c, Vi), wn.subVectors(li, oi), Rn.subVectors(ci, li), Vn.subVectors(oi, ci);
    let e = [
      0,
      -wn.z,
      wn.y,
      0,
      -Rn.z,
      Rn.y,
      0,
      -Vn.z,
      Vn.y,
      wn.z,
      0,
      -wn.x,
      Rn.z,
      0,
      -Rn.x,
      Vn.z,
      0,
      -Vn.x,
      -wn.y,
      wn.x,
      0,
      -Rn.y,
      Rn.x,
      0,
      -Vn.y,
      Vn.x,
      0
    ];
    return !rs(e, oi, li, ci, dr) || (e = [1, 0, 0, 0, 1, 0, 0, 0, 1], !rs(e, oi, li, ci, dr)) ? !1 : (ur.crossVectors(wn, Rn), e = [ur.x, ur.y, ur.z], rs(e, oi, li, ci, dr));
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
    return this.clampPoint(t, Ye).distanceTo(t);
  }
  /**
   * Returns a bounding sphere that encloses this bounding box.
   *
   * @param {Sphere} target - The target sphere that is used to store the method's result.
   * @return {Sphere} The bounding sphere that encloses this bounding box.
   */
  getBoundingSphere(t) {
    return this.isEmpty() ? t.makeEmpty() : (this.getCenter(t.center), t.radius = this.getSize(Ye).length() * 0.5), t;
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
    return this.isEmpty() ? this : (fn[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(t), fn[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(t), fn[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(t), fn[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(t), fn[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(t), fn[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(t), fn[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(t), fn[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(t), this.setFromPoints(fn), this);
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
const fn = [
  /* @__PURE__ */ new I(),
  /* @__PURE__ */ new I(),
  /* @__PURE__ */ new I(),
  /* @__PURE__ */ new I(),
  /* @__PURE__ */ new I(),
  /* @__PURE__ */ new I(),
  /* @__PURE__ */ new I(),
  /* @__PURE__ */ new I()
], Ye = /* @__PURE__ */ new I(), hr = /* @__PURE__ */ new sr(), oi = /* @__PURE__ */ new I(), li = /* @__PURE__ */ new I(), ci = /* @__PURE__ */ new I(), wn = /* @__PURE__ */ new I(), Rn = /* @__PURE__ */ new I(), Vn = /* @__PURE__ */ new I(), Vi = /* @__PURE__ */ new I(), dr = /* @__PURE__ */ new I(), ur = /* @__PURE__ */ new I(), Gn = /* @__PURE__ */ new I();
function rs(i, t, e, n, r) {
  for (let s = 0, a = i.length - 3; s <= a; s += 3) {
    Gn.fromArray(i, s);
    const o = r.x * Math.abs(Gn.x) + r.y * Math.abs(Gn.y) + r.z * Math.abs(Gn.z), l = t.dot(Gn), c = e.dot(Gn), u = n.dot(Gn);
    if (Math.max(-Math.max(l, c, u), Math.min(l, c, u)) > o)
      return !1;
  }
  return !0;
}
const ph = /* @__PURE__ */ new sr(), Gi = /* @__PURE__ */ new I(), ss = /* @__PURE__ */ new I();
class $r {
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
    e !== void 0 ? n.copy(e) : ph.setFromPoints(t).getCenter(n);
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
    Gi.subVectors(t, this.center);
    const e = Gi.lengthSq();
    if (e > this.radius * this.radius) {
      const n = Math.sqrt(e), r = (n - this.radius) * 0.5;
      this.center.addScaledVector(Gi, r / n), this.radius += r;
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
    return t.isEmpty() ? this : this.isEmpty() ? (this.copy(t), this) : (this.center.equals(t.center) === !0 ? this.radius = Math.max(this.radius, t.radius) : (ss.subVectors(t.center, this.center).setLength(t.radius), this.expandByPoint(Gi.copy(t.center).add(ss)), this.expandByPoint(Gi.copy(t.center).sub(ss))), this);
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
const pn = /* @__PURE__ */ new I(), as = /* @__PURE__ */ new I(), fr = /* @__PURE__ */ new I(), Cn = /* @__PURE__ */ new I(), os = /* @__PURE__ */ new I(), pr = /* @__PURE__ */ new I(), ls = /* @__PURE__ */ new I();
class jr {
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
    return this.origin.copy(this.at(t, pn)), this;
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
    const e = pn.subVectors(t, this.origin).dot(this.direction);
    return e < 0 ? this.origin.distanceToSquared(t) : (pn.copy(this.origin).addScaledVector(this.direction, e), pn.distanceToSquared(t));
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
    as.copy(t).add(e).multiplyScalar(0.5), fr.copy(e).sub(t).normalize(), Cn.copy(this.origin).sub(as);
    const s = t.distanceTo(e) * 0.5, a = -this.direction.dot(fr), o = Cn.dot(this.direction), l = -Cn.dot(fr), c = Cn.lengthSq(), u = Math.abs(1 - a * a);
    let d, f, m, _;
    if (u > 0)
      if (d = a * l - o, f = a * o - l, _ = s * u, d >= 0)
        if (f >= -_)
          if (f <= _) {
            const v = 1 / u;
            d *= v, f *= v, m = d * (d + a * f + 2 * o) + f * (a * d + f + 2 * l) + c;
          } else
            f = s, d = Math.max(0, -(a * f + o)), m = -d * d + f * (f + 2 * l) + c;
        else
          f = -s, d = Math.max(0, -(a * f + o)), m = -d * d + f * (f + 2 * l) + c;
      else
        f <= -_ ? (d = Math.max(0, -(-a * s + o)), f = d > 0 ? -s : Math.min(Math.max(-s, -l), s), m = -d * d + f * (f + 2 * l) + c) : f <= _ ? (d = 0, f = Math.min(Math.max(-s, -l), s), m = f * (f + 2 * l) + c) : (d = Math.max(0, -(a * s + o)), f = d > 0 ? s : Math.min(Math.max(-s, -l), s), m = -d * d + f * (f + 2 * l) + c);
    else
      f = a > 0 ? -s : s, d = Math.max(0, -(a * f + o)), m = -d * d + f * (f + 2 * l) + c;
    return n && n.copy(this.origin).addScaledVector(this.direction, d), r && r.copy(as).addScaledVector(fr, f), m;
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
    pn.subVectors(t.center, this.origin);
    const n = pn.dot(this.direction), r = pn.dot(pn) - n * n, s = t.radius * t.radius;
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
    const c = 1 / this.direction.x, u = 1 / this.direction.y, d = 1 / this.direction.z, f = this.origin;
    return c >= 0 ? (n = (t.min.x - f.x) * c, r = (t.max.x - f.x) * c) : (n = (t.max.x - f.x) * c, r = (t.min.x - f.x) * c), u >= 0 ? (s = (t.min.y - f.y) * u, a = (t.max.y - f.y) * u) : (s = (t.max.y - f.y) * u, a = (t.min.y - f.y) * u), n > a || s > r || ((s > n || isNaN(n)) && (n = s), (a < r || isNaN(r)) && (r = a), d >= 0 ? (o = (t.min.z - f.z) * d, l = (t.max.z - f.z) * d) : (o = (t.max.z - f.z) * d, l = (t.min.z - f.z) * d), n > l || o > r) || ((o > n || n !== n) && (n = o), (l < r || r !== r) && (r = l), r < 0) ? null : this.at(n >= 0 ? n : r, e);
  }
  /**
   * Returns `true` if this ray intersects with the given box.
   *
   * @param {Box3} box - The box to intersect.
   * @return {boolean} Whether this ray intersects with the given box or not.
   */
  intersectsBox(t) {
    return this.intersectBox(t, pn) !== null;
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
    os.subVectors(e, t), pr.subVectors(n, t), ls.crossVectors(os, pr);
    let a = this.direction.dot(ls), o;
    if (a > 0) {
      if (r) return null;
      o = 1;
    } else if (a < 0)
      o = -1, a = -a;
    else
      return null;
    Cn.subVectors(this.origin, t);
    const l = o * this.direction.dot(pr.crossVectors(Cn, pr));
    if (l < 0)
      return null;
    const c = o * this.direction.dot(os.cross(Cn));
    if (c < 0 || l + c > a)
      return null;
    const u = -o * Cn.dot(ls);
    return u < 0 ? null : this.at(u / a, s);
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
class se {
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
  constructor(t, e, n, r, s, a, o, l, c, u, d, f, m, _, v, p) {
    se.prototype.isMatrix4 = !0, this.elements = [
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
    ], t !== void 0 && this.set(t, e, n, r, s, a, o, l, c, u, d, f, m, _, v, p);
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
  set(t, e, n, r, s, a, o, l, c, u, d, f, m, _, v, p) {
    const h = this.elements;
    return h[0] = t, h[4] = e, h[8] = n, h[12] = r, h[1] = s, h[5] = a, h[9] = o, h[13] = l, h[2] = c, h[6] = u, h[10] = d, h[14] = f, h[3] = m, h[7] = _, h[11] = v, h[15] = p, this;
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
    return new se().fromArray(this.elements);
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
    const e = this.elements, n = t.elements, r = 1 / hi.setFromMatrixColumn(t, 0).length(), s = 1 / hi.setFromMatrixColumn(t, 1).length(), a = 1 / hi.setFromMatrixColumn(t, 2).length();
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
    const e = this.elements, n = t.x, r = t.y, s = t.z, a = Math.cos(n), o = Math.sin(n), l = Math.cos(r), c = Math.sin(r), u = Math.cos(s), d = Math.sin(s);
    if (t.order === "XYZ") {
      const f = a * u, m = a * d, _ = o * u, v = o * d;
      e[0] = l * u, e[4] = -l * d, e[8] = c, e[1] = m + _ * c, e[5] = f - v * c, e[9] = -o * l, e[2] = v - f * c, e[6] = _ + m * c, e[10] = a * l;
    } else if (t.order === "YXZ") {
      const f = l * u, m = l * d, _ = c * u, v = c * d;
      e[0] = f + v * o, e[4] = _ * o - m, e[8] = a * c, e[1] = a * d, e[5] = a * u, e[9] = -o, e[2] = m * o - _, e[6] = v + f * o, e[10] = a * l;
    } else if (t.order === "ZXY") {
      const f = l * u, m = l * d, _ = c * u, v = c * d;
      e[0] = f - v * o, e[4] = -a * d, e[8] = _ + m * o, e[1] = m + _ * o, e[5] = a * u, e[9] = v - f * o, e[2] = -a * c, e[6] = o, e[10] = a * l;
    } else if (t.order === "ZYX") {
      const f = a * u, m = a * d, _ = o * u, v = o * d;
      e[0] = l * u, e[4] = _ * c - m, e[8] = f * c + v, e[1] = l * d, e[5] = v * c + f, e[9] = m * c - _, e[2] = -c, e[6] = o * l, e[10] = a * l;
    } else if (t.order === "YZX") {
      const f = a * l, m = a * c, _ = o * l, v = o * c;
      e[0] = l * u, e[4] = v - f * d, e[8] = _ * d + m, e[1] = d, e[5] = a * u, e[9] = -o * u, e[2] = -c * u, e[6] = m * d + _, e[10] = f - v * d;
    } else if (t.order === "XZY") {
      const f = a * l, m = a * c, _ = o * l, v = o * c;
      e[0] = l * u, e[4] = -d, e[8] = c * u, e[1] = f * d + v, e[5] = a * u, e[9] = m * d - _, e[2] = _ * d - m, e[6] = o * u, e[10] = v * d + f;
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
    return this.compose(mh, t, _h);
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
    return Be.subVectors(t, e), Be.lengthSq() === 0 && (Be.z = 1), Be.normalize(), Pn.crossVectors(n, Be), Pn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? Be.x += 1e-4 : Be.z += 1e-4, Be.normalize(), Pn.crossVectors(n, Be)), Pn.normalize(), mr.crossVectors(Be, Pn), r[0] = Pn.x, r[4] = mr.x, r[8] = Be.x, r[1] = Pn.y, r[5] = mr.y, r[9] = Be.y, r[2] = Pn.z, r[6] = mr.z, r[10] = Be.z, this;
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
    const n = t.elements, r = e.elements, s = this.elements, a = n[0], o = n[4], l = n[8], c = n[12], u = n[1], d = n[5], f = n[9], m = n[13], _ = n[2], v = n[6], p = n[10], h = n[14], b = n[3], T = n[7], M = n[11], R = n[15], C = r[0], w = r[4], N = r[8], E = r[12], S = r[1], D = r[5], O = r[9], H = r[13], $ = r[2], W = r[6], Y = r[10], j = r[14], z = r[3], rt = r[7], ct = r[11], St = r[15];
    return s[0] = a * C + o * S + l * $ + c * z, s[4] = a * w + o * D + l * W + c * rt, s[8] = a * N + o * O + l * Y + c * ct, s[12] = a * E + o * H + l * j + c * St, s[1] = u * C + d * S + f * $ + m * z, s[5] = u * w + d * D + f * W + m * rt, s[9] = u * N + d * O + f * Y + m * ct, s[13] = u * E + d * H + f * j + m * St, s[2] = _ * C + v * S + p * $ + h * z, s[6] = _ * w + v * D + p * W + h * rt, s[10] = _ * N + v * O + p * Y + h * ct, s[14] = _ * E + v * H + p * j + h * St, s[3] = b * C + T * S + M * $ + R * z, s[7] = b * w + T * D + M * W + R * rt, s[11] = b * N + T * O + M * Y + R * ct, s[15] = b * E + T * H + M * j + R * St, this;
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
    const t = this.elements, e = t[0], n = t[4], r = t[8], s = t[12], a = t[1], o = t[5], l = t[9], c = t[13], u = t[2], d = t[6], f = t[10], m = t[14], _ = t[3], v = t[7], p = t[11], h = t[15];
    return _ * (+s * l * d - r * c * d - s * o * f + n * c * f + r * o * m - n * l * m) + v * (+e * l * m - e * c * f + s * a * f - r * a * m + r * c * u - s * l * u) + p * (+e * c * d - e * o * m - s * a * d + n * a * m + s * o * u - n * c * u) + h * (-r * o * u - e * l * d + e * o * f + r * a * d - n * a * f + n * l * u);
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
    const t = this.elements, e = t[0], n = t[1], r = t[2], s = t[3], a = t[4], o = t[5], l = t[6], c = t[7], u = t[8], d = t[9], f = t[10], m = t[11], _ = t[12], v = t[13], p = t[14], h = t[15], b = d * p * c - v * f * c + v * l * m - o * p * m - d * l * h + o * f * h, T = _ * f * c - u * p * c - _ * l * m + a * p * m + u * l * h - a * f * h, M = u * v * c - _ * d * c + _ * o * m - a * v * m - u * o * h + a * d * h, R = _ * d * l - u * v * l - _ * o * f + a * v * f + u * o * p - a * d * p, C = e * b + n * T + r * M + s * R;
    if (C === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const w = 1 / C;
    return t[0] = b * w, t[1] = (v * f * s - d * p * s - v * r * m + n * p * m + d * r * h - n * f * h) * w, t[2] = (o * p * s - v * l * s + v * r * c - n * p * c - o * r * h + n * l * h) * w, t[3] = (d * l * s - o * f * s - d * r * c + n * f * c + o * r * m - n * l * m) * w, t[4] = T * w, t[5] = (u * p * s - _ * f * s + _ * r * m - e * p * m - u * r * h + e * f * h) * w, t[6] = (_ * l * s - a * p * s - _ * r * c + e * p * c + a * r * h - e * l * h) * w, t[7] = (a * f * s - u * l * s + u * r * c - e * f * c - a * r * m + e * l * m) * w, t[8] = M * w, t[9] = (_ * d * s - u * v * s - _ * n * m + e * v * m + u * n * h - e * d * h) * w, t[10] = (a * v * s - _ * o * s + _ * n * c - e * v * c - a * n * h + e * o * h) * w, t[11] = (u * o * s - a * d * s - u * n * c + e * d * c + a * n * m - e * o * m) * w, t[12] = R * w, t[13] = (u * v * r - _ * d * r + _ * n * f - e * v * f - u * n * p + e * d * p) * w, t[14] = (_ * o * r - a * v * r - _ * n * l + e * v * l + a * n * p - e * o * p) * w, t[15] = (a * d * r - u * o * r + u * n * l - e * d * l - a * n * f + e * o * f) * w, this;
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
    const n = Math.cos(e), r = Math.sin(e), s = 1 - n, a = t.x, o = t.y, l = t.z, c = s * a, u = s * o;
    return this.set(
      c * a + n,
      c * o - r * l,
      c * l + r * o,
      0,
      c * o + r * l,
      u * o + n,
      u * l - r * a,
      0,
      c * l - r * o,
      u * l + r * a,
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
    const r = this.elements, s = e._x, a = e._y, o = e._z, l = e._w, c = s + s, u = a + a, d = o + o, f = s * c, m = s * u, _ = s * d, v = a * u, p = a * d, h = o * d, b = l * c, T = l * u, M = l * d, R = n.x, C = n.y, w = n.z;
    return r[0] = (1 - (v + h)) * R, r[1] = (m + M) * R, r[2] = (_ - T) * R, r[3] = 0, r[4] = (m - M) * C, r[5] = (1 - (f + h)) * C, r[6] = (p + b) * C, r[7] = 0, r[8] = (_ + T) * w, r[9] = (p - b) * w, r[10] = (1 - (f + v)) * w, r[11] = 0, r[12] = t.x, r[13] = t.y, r[14] = t.z, r[15] = 1, this;
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
    let s = hi.set(r[0], r[1], r[2]).length();
    const a = hi.set(r[4], r[5], r[6]).length(), o = hi.set(r[8], r[9], r[10]).length();
    this.determinant() < 0 && (s = -s), t.x = r[12], t.y = r[13], t.z = r[14], qe.copy(this);
    const c = 1 / s, u = 1 / a, d = 1 / o;
    return qe.elements[0] *= c, qe.elements[1] *= c, qe.elements[2] *= c, qe.elements[4] *= u, qe.elements[5] *= u, qe.elements[6] *= u, qe.elements[8] *= d, qe.elements[9] *= d, qe.elements[10] *= d, e.setFromRotationMatrix(qe), n.x = s, n.y = a, n.z = o, this;
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
  makePerspective(t, e, n, r, s, a, o = rn, l = !1) {
    const c = this.elements, u = 2 * s / (e - t), d = 2 * s / (n - r), f = (e + t) / (e - t), m = (n + r) / (n - r);
    let _, v;
    if (l)
      _ = s / (a - s), v = a * s / (a - s);
    else if (o === rn)
      _ = -(a + s) / (a - s), v = -2 * a * s / (a - s);
    else if (o === Vr)
      _ = -a / (a - s), v = -a * s / (a - s);
    else
      throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
    return c[0] = u, c[4] = 0, c[8] = f, c[12] = 0, c[1] = 0, c[5] = d, c[9] = m, c[13] = 0, c[2] = 0, c[6] = 0, c[10] = _, c[14] = v, c[3] = 0, c[7] = 0, c[11] = -1, c[15] = 0, this;
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
  makeOrthographic(t, e, n, r, s, a, o = rn, l = !1) {
    const c = this.elements, u = 2 / (e - t), d = 2 / (n - r), f = -(e + t) / (e - t), m = -(n + r) / (n - r);
    let _, v;
    if (l)
      _ = 1 / (a - s), v = a / (a - s);
    else if (o === rn)
      _ = -2 / (a - s), v = -(a + s) / (a - s);
    else if (o === Vr)
      _ = -1 / (a - s), v = -s / (a - s);
    else
      throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
    return c[0] = u, c[4] = 0, c[8] = 0, c[12] = f, c[1] = 0, c[5] = d, c[9] = 0, c[13] = m, c[2] = 0, c[6] = 0, c[10] = _, c[14] = v, c[3] = 0, c[7] = 0, c[11] = 0, c[15] = 1, this;
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
const hi = /* @__PURE__ */ new I(), qe = /* @__PURE__ */ new se(), mh = /* @__PURE__ */ new I(0, 0, 0), _h = /* @__PURE__ */ new I(1, 1, 1), Pn = /* @__PURE__ */ new I(), mr = /* @__PURE__ */ new I(), Be = /* @__PURE__ */ new I(), so = /* @__PURE__ */ new se(), ao = /* @__PURE__ */ new ei();
class hn {
  /**
   * Constructs a new euler instance.
   *
   * @param {number} [x=0] - The angle of the x axis in radians.
   * @param {number} [y=0] - The angle of the y axis in radians.
   * @param {number} [z=0] - The angle of the z axis in radians.
   * @param {string} [order=Euler.DEFAULT_ORDER] - A string representing the order that the rotations are applied.
   */
  constructor(t = 0, e = 0, n = 0, r = hn.DEFAULT_ORDER) {
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
    const r = t.elements, s = r[0], a = r[4], o = r[8], l = r[1], c = r[5], u = r[9], d = r[2], f = r[6], m = r[10];
    switch (e) {
      case "XYZ":
        this._y = Math.asin(Ht(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(-u, m), this._z = Math.atan2(-a, s)) : (this._x = Math.atan2(f, c), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-Ht(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._y = Math.atan2(o, m), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-d, s), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(Ht(f, -1, 1)), Math.abs(f) < 0.9999999 ? (this._y = Math.atan2(-d, m), this._z = Math.atan2(-a, c)) : (this._y = 0, this._z = Math.atan2(l, s));
        break;
      case "ZYX":
        this._y = Math.asin(-Ht(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._x = Math.atan2(f, m), this._z = Math.atan2(l, s)) : (this._x = 0, this._z = Math.atan2(-a, c));
        break;
      case "YZX":
        this._z = Math.asin(Ht(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-u, c), this._y = Math.atan2(-d, s)) : (this._x = 0, this._y = Math.atan2(o, m));
        break;
      case "XZY":
        this._z = Math.asin(-Ht(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(f, c), this._y = Math.atan2(o, s)) : (this._x = Math.atan2(-u, m), this._y = 0);
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
    return so.makeRotationFromQuaternion(t), this.setFromRotationMatrix(so, e, n);
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
    return ao.setFromEuler(this), this.setFromQuaternion(ao, t);
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
hn.DEFAULT_ORDER = "XYZ";
class Ia {
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
let gh = 0;
const oo = /* @__PURE__ */ new I(), di = /* @__PURE__ */ new ei(), mn = /* @__PURE__ */ new se(), _r = /* @__PURE__ */ new I(), Wi = /* @__PURE__ */ new I(), vh = /* @__PURE__ */ new I(), xh = /* @__PURE__ */ new ei(), lo = /* @__PURE__ */ new I(1, 0, 0), co = /* @__PURE__ */ new I(0, 1, 0), ho = /* @__PURE__ */ new I(0, 0, 1), uo = { type: "added" }, Mh = { type: "removed" }, ui = { type: "childadded", child: null }, cs = { type: "childremoved", child: null };
class ge extends ii {
  /**
   * Constructs a new 3D object.
   */
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: gh++ }), this.uuid = Fi(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = ge.DEFAULT_UP.clone();
    const t = new I(), e = new hn(), n = new ei(), r = new I(1, 1, 1);
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
        value: new se()
      },
      /**
       * Represents the object's normal matrix.
       *
       * @name Object3D#normalMatrix
       * @type {Matrix3}
       */
      normalMatrix: {
        value: new Nt()
      }
    }), this.matrix = new se(), this.matrixWorld = new se(), this.matrixAutoUpdate = ge.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = ge.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new Ia(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.customDepthMaterial = void 0, this.customDistanceMaterial = void 0, this.userData = {};
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
    return di.setFromAxisAngle(t, e), this.quaternion.multiply(di), this;
  }
  /**
   * Rotates the 3D object along an axis in world space.
   *
   * @param {Vector3} axis - The (normalized) axis vector.
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateOnWorldAxis(t, e) {
    return di.setFromAxisAngle(t, e), this.quaternion.premultiply(di), this;
  }
  /**
   * Rotates the 3D object around its X axis in local space.
   *
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateX(t) {
    return this.rotateOnAxis(lo, t);
  }
  /**
   * Rotates the 3D object around its Y axis in local space.
   *
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateY(t) {
    return this.rotateOnAxis(co, t);
  }
  /**
   * Rotates the 3D object around its Z axis in local space.
   *
   * @param {number} angle - The angle in radians.
   * @return {Object3D} A reference to this instance.
   */
  rotateZ(t) {
    return this.rotateOnAxis(ho, t);
  }
  /**
   * Translate the 3D object by a distance along the given axis in local space.
   *
   * @param {Vector3} axis - The (normalized) axis vector.
   * @param {number} distance - The distance in world units.
   * @return {Object3D} A reference to this instance.
   */
  translateOnAxis(t, e) {
    return oo.copy(t).applyQuaternion(this.quaternion), this.position.add(oo.multiplyScalar(e)), this;
  }
  /**
   * Translate the 3D object by a distance along its X-axis in local space.
   *
   * @param {number} distance - The distance in world units.
   * @return {Object3D} A reference to this instance.
   */
  translateX(t) {
    return this.translateOnAxis(lo, t);
  }
  /**
   * Translate the 3D object by a distance along its Y-axis in local space.
   *
   * @param {number} distance - The distance in world units.
   * @return {Object3D} A reference to this instance.
   */
  translateY(t) {
    return this.translateOnAxis(co, t);
  }
  /**
   * Translate the 3D object by a distance along its Z-axis in local space.
   *
   * @param {number} distance - The distance in world units.
   * @return {Object3D} A reference to this instance.
   */
  translateZ(t) {
    return this.translateOnAxis(ho, t);
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
    return this.updateWorldMatrix(!0, !1), t.applyMatrix4(mn.copy(this.matrixWorld).invert());
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
    t.isVector3 ? _r.copy(t) : _r.set(t, e, n);
    const r = this.parent;
    this.updateWorldMatrix(!0, !1), Wi.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? mn.lookAt(Wi, _r, this.up) : mn.lookAt(_r, Wi, this.up), this.quaternion.setFromRotationMatrix(mn), r && (mn.extractRotation(r.matrixWorld), di.setFromRotationMatrix(mn), this.quaternion.premultiply(di.invert()));
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
    return t === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", t), this) : (t && t.isObject3D ? (t.removeFromParent(), t.parent = this, this.children.push(t), t.dispatchEvent(uo), ui.child = t, this.dispatchEvent(ui), ui.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", t), this);
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
    return e !== -1 && (t.parent = null, this.children.splice(e, 1), t.dispatchEvent(Mh), cs.child = t, this.dispatchEvent(cs), cs.child = null), this;
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
    return this.updateWorldMatrix(!0, !1), mn.copy(this.matrixWorld).invert(), t.parent !== null && (t.parent.updateWorldMatrix(!0, !1), mn.multiply(t.parent.matrixWorld)), t.applyMatrix4(mn), t.removeFromParent(), t.parent = this, this.children.push(t), t.updateWorldMatrix(!1, !0), t.dispatchEvent(uo), ui.child = t, this.dispatchEvent(ui), ui.child = null, this;
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
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Wi, t, vh), t;
  }
  /**
   * Returns a vector representing the scale of the 3D object in world space.
   *
   * @param {Vector3} target - The target vector the result is stored to.
   * @return {Vector3} The 3D object's scale in world space.
   */
  getWorldScale(t) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Wi, xh, t), t;
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
          for (let c = 0, u = l.length; c < u; c++) {
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
      const o = a(t.geometries), l = a(t.materials), c = a(t.textures), u = a(t.images), d = a(t.shapes), f = a(t.skeletons), m = a(t.animations), _ = a(t.nodes);
      o.length > 0 && (n.geometries = o), l.length > 0 && (n.materials = l), c.length > 0 && (n.textures = c), u.length > 0 && (n.images = u), d.length > 0 && (n.shapes = d), f.length > 0 && (n.skeletons = f), m.length > 0 && (n.animations = m), _.length > 0 && (n.nodes = _);
    }
    return n.object = r, n;
    function a(o) {
      const l = [];
      for (const c in o) {
        const u = o[c];
        delete u.metadata, l.push(u);
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
ge.DEFAULT_UP = /* @__PURE__ */ new I(0, 1, 0);
ge.DEFAULT_MATRIX_AUTO_UPDATE = !0;
ge.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const $e = /* @__PURE__ */ new I(), _n = /* @__PURE__ */ new I(), hs = /* @__PURE__ */ new I(), gn = /* @__PURE__ */ new I(), fi = /* @__PURE__ */ new I(), pi = /* @__PURE__ */ new I(), fo = /* @__PURE__ */ new I(), ds = /* @__PURE__ */ new I(), us = /* @__PURE__ */ new I(), fs = /* @__PURE__ */ new I(), ps = /* @__PURE__ */ new ue(), ms = /* @__PURE__ */ new ue(), _s = /* @__PURE__ */ new ue();
class Xe {
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
    r.subVectors(n, e), $e.subVectors(t, e), r.cross($e);
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
    $e.subVectors(r, e), _n.subVectors(n, e), hs.subVectors(t, e);
    const a = $e.dot($e), o = $e.dot(_n), l = $e.dot(hs), c = _n.dot(_n), u = _n.dot(hs), d = a * c - o * o;
    if (d === 0)
      return s.set(0, 0, 0), null;
    const f = 1 / d, m = (c * l - o * u) * f, _ = (a * u - o * l) * f;
    return s.set(1 - m - _, _, m);
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
    return this.getBarycoord(t, e, n, r, gn) === null ? !1 : gn.x >= 0 && gn.y >= 0 && gn.x + gn.y <= 1;
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
    return this.getBarycoord(t, e, n, r, gn) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(s, gn.x), l.addScaledVector(a, gn.y), l.addScaledVector(o, gn.z), l);
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
    return ps.setScalar(0), ms.setScalar(0), _s.setScalar(0), ps.fromBufferAttribute(t, e), ms.fromBufferAttribute(t, n), _s.fromBufferAttribute(t, r), a.setScalar(0), a.addScaledVector(ps, s.x), a.addScaledVector(ms, s.y), a.addScaledVector(_s, s.z), a;
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
    return $e.subVectors(n, e), _n.subVectors(t, e), $e.cross(_n).dot(r) < 0;
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
    return $e.subVectors(this.c, this.b), _n.subVectors(this.a, this.b), $e.cross(_n).length() * 0.5;
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
    return Xe.getNormal(this.a, this.b, this.c, t);
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
    return Xe.getBarycoord(t, this.a, this.b, this.c, e);
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
    return Xe.getInterpolation(t, this.a, this.b, this.c, e, n, r, s);
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
    return Xe.containsPoint(t, this.a, this.b, this.c);
  }
  /**
   * Returns `true` if the triangle is oriented towards the given direction.
   *
   * @param {Vector3} direction - The (normalized) direction vector.
   * @return {boolean} Whether the triangle is oriented towards the given direction or not.
   */
  isFrontFacing(t) {
    return Xe.isFrontFacing(this.a, this.b, this.c, t);
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
    fi.subVectors(r, n), pi.subVectors(s, n), ds.subVectors(t, n);
    const l = fi.dot(ds), c = pi.dot(ds);
    if (l <= 0 && c <= 0)
      return e.copy(n);
    us.subVectors(t, r);
    const u = fi.dot(us), d = pi.dot(us);
    if (u >= 0 && d <= u)
      return e.copy(r);
    const f = l * d - u * c;
    if (f <= 0 && l >= 0 && u <= 0)
      return a = l / (l - u), e.copy(n).addScaledVector(fi, a);
    fs.subVectors(t, s);
    const m = fi.dot(fs), _ = pi.dot(fs);
    if (_ >= 0 && m <= _)
      return e.copy(s);
    const v = m * c - l * _;
    if (v <= 0 && c >= 0 && _ <= 0)
      return o = c / (c - _), e.copy(n).addScaledVector(pi, o);
    const p = u * _ - m * d;
    if (p <= 0 && d - u >= 0 && m - _ >= 0)
      return fo.subVectors(s, r), o = (d - u) / (d - u + (m - _)), e.copy(r).addScaledVector(fo, o);
    const h = 1 / (p + v + f);
    return a = v * h, o = f * h, e.copy(n).addScaledVector(fi, a).addScaledVector(pi, o);
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
const bl = {
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
}, Dn = { h: 0, s: 0, l: 0 }, gr = { h: 0, s: 0, l: 0 };
function gs(i, t, e) {
  return e < 0 && (e += 1), e > 1 && (e -= 1), e < 1 / 6 ? i + (t - i) * 6 * e : e < 1 / 2 ? t : e < 2 / 3 ? i + (t - i) * 6 * (2 / 3 - e) : i;
}
class Xt {
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
  setHex(t, e = Le) {
    return t = Math.floor(t), this.r = (t >> 16 & 255) / 255, this.g = (t >> 8 & 255) / 255, this.b = (t & 255) / 255, $t.colorSpaceToWorking(this, e), this;
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
  setRGB(t, e, n, r = $t.workingColorSpace) {
    return this.r = t, this.g = e, this.b = n, $t.colorSpaceToWorking(this, r), this;
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
  setHSL(t, e, n, r = $t.workingColorSpace) {
    if (t = Da(t, 1), e = Ht(e, 0, 1), n = Ht(n, 0, 1), e === 0)
      this.r = this.g = this.b = n;
    else {
      const s = n <= 0.5 ? n * (1 + e) : n + e - n * e, a = 2 * n - s;
      this.r = gs(a, s, t + 1 / 3), this.g = gs(a, s, t), this.b = gs(a, s, t - 1 / 3);
    }
    return $t.colorSpaceToWorking(this, r), this;
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
  setStyle(t, e = Le) {
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
  setColorName(t, e = Le) {
    const n = bl[t.toLowerCase()];
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
    return this.r = bn(t.r), this.g = bn(t.g), this.b = bn(t.b), this;
  }
  /**
   * Copies the given color into this color, and then converts this color from
   * `LinearSRGBColorSpace` to `SRGBColorSpace`.
   *
   * @param {Color} color - The color to copy/convert.
   * @return {Color} A reference to this color.
   */
  copyLinearToSRGB(t) {
    return this.r = Pi(t.r), this.g = Pi(t.g), this.b = Pi(t.b), this;
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
  getHex(t = Le) {
    return $t.workingToColorSpace(Te.copy(this), t), Math.round(Ht(Te.r * 255, 0, 255)) * 65536 + Math.round(Ht(Te.g * 255, 0, 255)) * 256 + Math.round(Ht(Te.b * 255, 0, 255));
  }
  /**
   * Returns the hexadecimal value of this color as a string (for example, 'FFFFFF').
   *
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {string} The hexadecimal value as a string.
   */
  getHexString(t = Le) {
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
  getHSL(t, e = $t.workingColorSpace) {
    $t.workingToColorSpace(Te.copy(this), e);
    const n = Te.r, r = Te.g, s = Te.b, a = Math.max(n, r, s), o = Math.min(n, r, s);
    let l, c;
    const u = (o + a) / 2;
    if (o === a)
      l = 0, c = 0;
    else {
      const d = a - o;
      switch (c = u <= 0.5 ? d / (a + o) : d / (2 - a - o), a) {
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
    return t.h = l, t.s = c, t.l = u, t;
  }
  /**
   * Returns the RGB values of this color and stores them into the given target object.
   *
   * @param {Color} target - The target color that is used to store the method's result.
   * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
   * @return {Color} The RGB representation of this color.
   */
  getRGB(t, e = $t.workingColorSpace) {
    return $t.workingToColorSpace(Te.copy(this), e), t.r = Te.r, t.g = Te.g, t.b = Te.b, t;
  }
  /**
   * Returns the value of this color as a CSS style string. Example: `rgb(255,0,0)`.
   *
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {string} The CSS representation of this color.
   */
  getStyle(t = Le) {
    $t.workingToColorSpace(Te.copy(this), t);
    const e = Te.r, n = Te.g, r = Te.b;
    return t !== Le ? `color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})` : `rgb(${Math.round(e * 255)},${Math.round(n * 255)},${Math.round(r * 255)})`;
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
    return this.getHSL(Dn), this.setHSL(Dn.h + t, Dn.s + e, Dn.l + n);
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
    this.getHSL(Dn), t.getHSL(gr);
    const n = ji(Dn.h, gr.h, e), r = ji(Dn.s, gr.s, e), s = ji(Dn.l, gr.l, e);
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
const Te = /* @__PURE__ */ new Xt();
Xt.NAMES = bl;
let Sh = 0;
class Oi extends ii {
  /**
   * Constructs a new material.
   */
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: Sh++ }), this.uuid = Fi(), this.name = "", this.type = "Material", this.blending = Ri, this.side = Bn, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = Is, this.blendDst = Us, this.blendEquation = jn, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new Xt(0, 0, 0), this.blendAlpha = 0, this.depthFunc = Di, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = Za, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = si, this.stencilZFail = si, this.stencilZPass = si, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.allowOverride = !0, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
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
    n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(t).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(t).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(t).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.sheenColorMap && this.sheenColorMap.isTexture && (n.sheenColorMap = this.sheenColorMap.toJSON(t).uuid), this.sheenRoughnessMap && this.sheenRoughnessMap.isTexture && (n.sheenRoughnessMap = this.sheenRoughnessMap.toJSON(t).uuid), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(t).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(t).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(t).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(t).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(t).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(t).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(t).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(t).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(t).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(t).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(t).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(t).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(t).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(t).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(t).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(t).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(t).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(t).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(t).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(t).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(t).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== Ri && (n.blending = this.blending), this.side !== Bn && (n.side = this.side), this.vertexColors === !0 && (n.vertexColors = !0), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === !0 && (n.transparent = !0), this.blendSrc !== Is && (n.blendSrc = this.blendSrc), this.blendDst !== Us && (n.blendDst = this.blendDst), this.blendEquation !== jn && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== Di && (n.depthFunc = this.depthFunc), this.depthTest === !1 && (n.depthTest = this.depthTest), this.depthWrite === !1 && (n.depthWrite = this.depthWrite), this.colorWrite === !1 && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== Za && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== si && (n.stencilFail = this.stencilFail), this.stencilZFail !== si && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== si && (n.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === !0 && (n.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === !0 && (n.dithering = !0), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === !0 && (n.alphaHash = !0), this.alphaToCoverage === !0 && (n.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0), this.forceSinglePass === !0 && (n.forceSinglePass = !0), this.wireframe === !0 && (n.wireframe = !0), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (n.flatShading = !0), this.visible === !1 && (n.visible = !1), this.toneMapped === !1 && (n.toneMapped = !1), this.fog === !1 && (n.fog = !1), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
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
class Ua extends Oi {
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
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new Xt(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new hn(), this.combine = cl, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.specularMap = t.specularMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.combine = t.combine, this.reflectivity = t.reflectivity, this.refractionRatio = t.refractionRatio, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.fog = t.fog, this;
  }
}
const pe = /* @__PURE__ */ new I(), vr = /* @__PURE__ */ new Dt();
let Eh = 0;
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
    this.isBufferAttribute = !0, Object.defineProperty(this, "id", { value: Eh++ }), this.name = "", this.array = t, this.itemSize = e, this.count = t !== void 0 ? t.length / e : 0, this.normalized = n, this.usage = Ja, this.updateRanges = [], this.gpuType = Sn, this.version = 0;
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
        vr.fromBufferAttribute(this, e), vr.applyMatrix3(t), this.setXY(e, vr.x, vr.y);
    else if (this.itemSize === 3)
      for (let e = 0, n = this.count; e < n; e++)
        pe.fromBufferAttribute(this, e), pe.applyMatrix3(t), this.setXYZ(e, pe.x, pe.y, pe.z);
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
      pe.fromBufferAttribute(this, e), pe.applyMatrix4(t), this.setXYZ(e, pe.x, pe.y, pe.z);
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
      pe.fromBufferAttribute(this, e), pe.applyNormalMatrix(t), this.setXYZ(e, pe.x, pe.y, pe.z);
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
      pe.fromBufferAttribute(this, e), pe.transformDirection(t), this.setXYZ(e, pe.x, pe.y, pe.z);
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
    return this.normalized && (n = Mi(n, this.array)), n;
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
    return this.normalized && (n = we(n, this.array)), this.array[t * this.itemSize + e] = n, this;
  }
  /**
   * Returns the x component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @return {number} The x component.
   */
  getX(t) {
    let e = this.array[t * this.itemSize];
    return this.normalized && (e = Mi(e, this.array)), e;
  }
  /**
   * Sets the x component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} x - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setX(t, e) {
    return this.normalized && (e = we(e, this.array)), this.array[t * this.itemSize] = e, this;
  }
  /**
   * Returns the y component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @return {number} The y component.
   */
  getY(t) {
    let e = this.array[t * this.itemSize + 1];
    return this.normalized && (e = Mi(e, this.array)), e;
  }
  /**
   * Sets the y component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} y - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setY(t, e) {
    return this.normalized && (e = we(e, this.array)), this.array[t * this.itemSize + 1] = e, this;
  }
  /**
   * Returns the z component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @return {number} The z component.
   */
  getZ(t) {
    let e = this.array[t * this.itemSize + 2];
    return this.normalized && (e = Mi(e, this.array)), e;
  }
  /**
   * Sets the z component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} z - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setZ(t, e) {
    return this.normalized && (e = we(e, this.array)), this.array[t * this.itemSize + 2] = e, this;
  }
  /**
   * Returns the w component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @return {number} The w component.
   */
  getW(t) {
    let e = this.array[t * this.itemSize + 3];
    return this.normalized && (e = Mi(e, this.array)), e;
  }
  /**
   * Sets the w component of the vector at the given index.
   *
   * @param {number} index - The index into the buffer attribute.
   * @param {number} w - The value to set.
   * @return {BufferAttribute} A reference to this instance.
   */
  setW(t, e) {
    return this.normalized && (e = we(e, this.array)), this.array[t * this.itemSize + 3] = e, this;
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
    return t *= this.itemSize, this.normalized && (e = we(e, this.array), n = we(n, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this;
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
    return t *= this.itemSize, this.normalized && (e = we(e, this.array), n = we(n, this.array), r = we(r, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = r, this;
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
    return t *= this.itemSize, this.normalized && (e = we(e, this.array), n = we(n, this.array), r = we(r, this.array), s = we(s, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = r, this.array[t + 3] = s, this;
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
    return this.name !== "" && (t.name = this.name), this.usage !== Ja && (t.usage = this.usage), t;
  }
}
class Tl extends an {
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
class Al extends an {
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
class on extends an {
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
let yh = 0;
const Ge = /* @__PURE__ */ new se(), vs = /* @__PURE__ */ new ge(), mi = /* @__PURE__ */ new I(), ke = /* @__PURE__ */ new sr(), Xi = /* @__PURE__ */ new sr(), Se = /* @__PURE__ */ new I();
class dn extends ii {
  /**
   * Constructs a new geometry.
   */
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: yh++ }), this.uuid = Fi(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
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
    return Array.isArray(t) ? this.index = new (El(t) ? Al : Tl)(t, 1) : this.index = t, this;
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
      const s = new Nt().getNormalMatrix(t);
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
    return Ge.makeRotationFromQuaternion(t), this.applyMatrix4(Ge), this;
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
    return Ge.makeRotationX(t), this.applyMatrix4(Ge), this;
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
    return Ge.makeRotationY(t), this.applyMatrix4(Ge), this;
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
    return Ge.makeRotationZ(t), this.applyMatrix4(Ge), this;
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
    return Ge.makeTranslation(t, e, n), this.applyMatrix4(Ge), this;
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
    return Ge.makeScale(t, e, n), this.applyMatrix4(Ge), this;
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
    return vs.lookAt(t), vs.updateMatrix(), this.applyMatrix4(vs.matrix), this;
  }
  /**
   * Center the geometry based on its bounding box.
   *
   * @return {BufferGeometry} A reference to this instance.
   */
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(mi).negate(), this.translate(mi.x, mi.y, mi.z), this;
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
      this.setAttribute("position", new on(n, 3));
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
    this.boundingBox === null && (this.boundingBox = new sr());
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
          ke.setFromBufferAttribute(s), this.morphTargetsRelative ? (Se.addVectors(this.boundingBox.min, ke.min), this.boundingBox.expandByPoint(Se), Se.addVectors(this.boundingBox.max, ke.max), this.boundingBox.expandByPoint(Se)) : (this.boundingBox.expandByPoint(ke.min), this.boundingBox.expandByPoint(ke.max));
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
    this.boundingSphere === null && (this.boundingSphere = new $r());
    const t = this.attributes.position, e = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new I(), 1 / 0);
      return;
    }
    if (t) {
      const n = this.boundingSphere.center;
      if (ke.setFromBufferAttribute(t), e)
        for (let s = 0, a = e.length; s < a; s++) {
          const o = e[s];
          Xi.setFromBufferAttribute(o), this.morphTargetsRelative ? (Se.addVectors(ke.min, Xi.min), ke.expandByPoint(Se), Se.addVectors(ke.max, Xi.max), ke.expandByPoint(Se)) : (ke.expandByPoint(Xi.min), ke.expandByPoint(Xi.max));
        }
      ke.getCenter(n);
      let r = 0;
      for (let s = 0, a = t.count; s < a; s++)
        Se.fromBufferAttribute(t, s), r = Math.max(r, n.distanceToSquared(Se));
      if (e)
        for (let s = 0, a = e.length; s < a; s++) {
          const o = e[s], l = this.morphTargetsRelative;
          for (let c = 0, u = o.count; c < u; c++)
            Se.fromBufferAttribute(o, c), l && (mi.fromBufferAttribute(t, c), Se.add(mi)), r = Math.max(r, n.distanceToSquared(Se));
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
    this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new an(new Float32Array(4 * n.count), 4));
    const a = this.getAttribute("tangent"), o = [], l = [];
    for (let N = 0; N < n.count; N++)
      o[N] = new I(), l[N] = new I();
    const c = new I(), u = new I(), d = new I(), f = new Dt(), m = new Dt(), _ = new Dt(), v = new I(), p = new I();
    function h(N, E, S) {
      c.fromBufferAttribute(n, N), u.fromBufferAttribute(n, E), d.fromBufferAttribute(n, S), f.fromBufferAttribute(s, N), m.fromBufferAttribute(s, E), _.fromBufferAttribute(s, S), u.sub(c), d.sub(c), m.sub(f), _.sub(f);
      const D = 1 / (m.x * _.y - _.x * m.y);
      isFinite(D) && (v.copy(u).multiplyScalar(_.y).addScaledVector(d, -m.y).multiplyScalar(D), p.copy(d).multiplyScalar(m.x).addScaledVector(u, -_.x).multiplyScalar(D), o[N].add(v), o[E].add(v), o[S].add(v), l[N].add(p), l[E].add(p), l[S].add(p));
    }
    let b = this.groups;
    b.length === 0 && (b = [{
      start: 0,
      count: t.count
    }]);
    for (let N = 0, E = b.length; N < E; ++N) {
      const S = b[N], D = S.start, O = S.count;
      for (let H = D, $ = D + O; H < $; H += 3)
        h(
          t.getX(H + 0),
          t.getX(H + 1),
          t.getX(H + 2)
        );
    }
    const T = new I(), M = new I(), R = new I(), C = new I();
    function w(N) {
      R.fromBufferAttribute(r, N), C.copy(R);
      const E = o[N];
      T.copy(E), T.sub(R.multiplyScalar(R.dot(E))).normalize(), M.crossVectors(C, E);
      const D = M.dot(l[N]) < 0 ? -1 : 1;
      a.setXYZW(N, T.x, T.y, T.z, D);
    }
    for (let N = 0, E = b.length; N < E; ++N) {
      const S = b[N], D = S.start, O = S.count;
      for (let H = D, $ = D + O; H < $; H += 3)
        w(t.getX(H + 0)), w(t.getX(H + 1)), w(t.getX(H + 2));
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
      const r = new I(), s = new I(), a = new I(), o = new I(), l = new I(), c = new I(), u = new I(), d = new I();
      if (t)
        for (let f = 0, m = t.count; f < m; f += 3) {
          const _ = t.getX(f + 0), v = t.getX(f + 1), p = t.getX(f + 2);
          r.fromBufferAttribute(e, _), s.fromBufferAttribute(e, v), a.fromBufferAttribute(e, p), u.subVectors(a, s), d.subVectors(r, s), u.cross(d), o.fromBufferAttribute(n, _), l.fromBufferAttribute(n, v), c.fromBufferAttribute(n, p), o.add(u), l.add(u), c.add(u), n.setXYZ(_, o.x, o.y, o.z), n.setXYZ(v, l.x, l.y, l.z), n.setXYZ(p, c.x, c.y, c.z);
        }
      else
        for (let f = 0, m = e.count; f < m; f += 3)
          r.fromBufferAttribute(e, f + 0), s.fromBufferAttribute(e, f + 1), a.fromBufferAttribute(e, f + 2), u.subVectors(a, s), d.subVectors(r, s), u.cross(d), n.setXYZ(f + 0, u.x, u.y, u.z), n.setXYZ(f + 1, u.x, u.y, u.z), n.setXYZ(f + 2, u.x, u.y, u.z);
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
      Se.fromBufferAttribute(t, e), Se.normalize(), t.setXYZ(e, Se.x, Se.y, Se.z);
  }
  /**
   * Return a new non-index version of this indexed geometry. If the geometry
   * is already non-indexed, the method is a NOOP.
   *
   * @return {BufferGeometry} The non-indexed version of this indexed geometry.
   */
  toNonIndexed() {
    function t(o, l) {
      const c = o.array, u = o.itemSize, d = o.normalized, f = new c.constructor(l.length * u);
      let m = 0, _ = 0;
      for (let v = 0, p = l.length; v < p; v++) {
        o.isInterleavedBufferAttribute ? m = l[v] * o.data.stride + o.offset : m = l[v] * u;
        for (let h = 0; h < u; h++)
          f[_++] = c[m++];
      }
      return new an(f, u, d);
    }
    if (this.index === null)
      return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    const e = new dn(), n = this.index.array, r = this.attributes;
    for (const o in r) {
      const l = r[o], c = t(l, n);
      e.setAttribute(o, c);
    }
    const s = this.morphAttributes;
    for (const o in s) {
      const l = [], c = s[o];
      for (let u = 0, d = c.length; u < d; u++) {
        const f = c[u], m = t(f, n);
        l.push(m);
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
      const c = this.morphAttributes[l], u = [];
      for (let d = 0, f = c.length; d < f; d++) {
        const m = c[d];
        u.push(m.toJSON(t.data));
      }
      u.length > 0 && (r[l] = u, s = !0);
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
      const u = r[c];
      this.setAttribute(c, u.clone(e));
    }
    const s = t.morphAttributes;
    for (const c in s) {
      const u = [], d = s[c];
      for (let f = 0, m = d.length; f < m; f++)
        u.push(d[f].clone(e));
      this.morphAttributes[c] = u;
    }
    this.morphTargetsRelative = t.morphTargetsRelative;
    const a = t.groups;
    for (let c = 0, u = a.length; c < u; c++) {
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
const po = /* @__PURE__ */ new se(), Wn = /* @__PURE__ */ new jr(), xr = /* @__PURE__ */ new $r(), mo = /* @__PURE__ */ new I(), Mr = /* @__PURE__ */ new I(), Sr = /* @__PURE__ */ new I(), Er = /* @__PURE__ */ new I(), xs = /* @__PURE__ */ new I(), yr = /* @__PURE__ */ new I(), _o = /* @__PURE__ */ new I(), br = /* @__PURE__ */ new I();
class Ze extends ge {
  /**
   * Constructs a new mesh.
   *
   * @param {BufferGeometry} [geometry] - The mesh geometry.
   * @param {Material|Array<Material>} [material] - The mesh material.
   */
  constructor(t = new dn(), e = new Ua()) {
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
      yr.set(0, 0, 0);
      for (let l = 0, c = s.length; l < c; l++) {
        const u = o[l], d = s[l];
        u !== 0 && (xs.fromBufferAttribute(d, t), a ? yr.addScaledVector(xs, u) : yr.addScaledVector(xs.sub(e), u));
      }
      e.add(yr);
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
    r !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), xr.copy(n.boundingSphere), xr.applyMatrix4(s), Wn.copy(t.ray).recast(t.near), !(xr.containsPoint(Wn.origin) === !1 && (Wn.intersectSphere(xr, mo) === null || Wn.origin.distanceToSquared(mo) > (t.far - t.near) ** 2)) && (po.copy(s).invert(), Wn.copy(t.ray).applyMatrix4(po), !(n.boundingBox !== null && Wn.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(t, e, Wn)));
  }
  _computeIntersections(t, e, n) {
    let r;
    const s = this.geometry, a = this.material, o = s.index, l = s.attributes.position, c = s.attributes.uv, u = s.attributes.uv1, d = s.attributes.normal, f = s.groups, m = s.drawRange;
    if (o !== null)
      if (Array.isArray(a))
        for (let _ = 0, v = f.length; _ < v; _++) {
          const p = f[_], h = a[p.materialIndex], b = Math.max(p.start, m.start), T = Math.min(o.count, Math.min(p.start + p.count, m.start + m.count));
          for (let M = b, R = T; M < R; M += 3) {
            const C = o.getX(M), w = o.getX(M + 1), N = o.getX(M + 2);
            r = Tr(this, h, t, n, c, u, d, C, w, N), r && (r.faceIndex = Math.floor(M / 3), r.face.materialIndex = p.materialIndex, e.push(r));
          }
        }
      else {
        const _ = Math.max(0, m.start), v = Math.min(o.count, m.start + m.count);
        for (let p = _, h = v; p < h; p += 3) {
          const b = o.getX(p), T = o.getX(p + 1), M = o.getX(p + 2);
          r = Tr(this, a, t, n, c, u, d, b, T, M), r && (r.faceIndex = Math.floor(p / 3), e.push(r));
        }
      }
    else if (l !== void 0)
      if (Array.isArray(a))
        for (let _ = 0, v = f.length; _ < v; _++) {
          const p = f[_], h = a[p.materialIndex], b = Math.max(p.start, m.start), T = Math.min(l.count, Math.min(p.start + p.count, m.start + m.count));
          for (let M = b, R = T; M < R; M += 3) {
            const C = M, w = M + 1, N = M + 2;
            r = Tr(this, h, t, n, c, u, d, C, w, N), r && (r.faceIndex = Math.floor(M / 3), r.face.materialIndex = p.materialIndex, e.push(r));
          }
        }
      else {
        const _ = Math.max(0, m.start), v = Math.min(l.count, m.start + m.count);
        for (let p = _, h = v; p < h; p += 3) {
          const b = p, T = p + 1, M = p + 2;
          r = Tr(this, a, t, n, c, u, d, b, T, M), r && (r.faceIndex = Math.floor(p / 3), e.push(r));
        }
      }
  }
}
function bh(i, t, e, n, r, s, a, o) {
  let l;
  if (t.side === Ne ? l = n.intersectTriangle(a, s, r, !0, o) : l = n.intersectTriangle(r, s, a, t.side === Bn, o), l === null) return null;
  br.copy(o), br.applyMatrix4(i.matrixWorld);
  const c = e.ray.origin.distanceTo(br);
  return c < e.near || c > e.far ? null : {
    distance: c,
    point: br.clone(),
    object: i
  };
}
function Tr(i, t, e, n, r, s, a, o, l, c) {
  i.getVertexPosition(o, Mr), i.getVertexPosition(l, Sr), i.getVertexPosition(c, Er);
  const u = bh(i, t, e, n, Mr, Sr, Er, _o);
  if (u) {
    const d = new I();
    Xe.getBarycoord(_o, Mr, Sr, Er, d), r && (u.uv = Xe.getInterpolatedAttribute(r, o, l, c, d, new Dt())), s && (u.uv1 = Xe.getInterpolatedAttribute(s, o, l, c, d, new Dt())), a && (u.normal = Xe.getInterpolatedAttribute(a, o, l, c, d, new I()), u.normal.dot(n.direction) > 0 && u.normal.multiplyScalar(-1));
    const f = {
      a: o,
      b: l,
      c,
      normal: new I(),
      materialIndex: 0
    };
    Xe.getNormal(Mr, Sr, Er, f.normal), u.face = f, u.barycoord = d;
  }
  return u;
}
class Bi extends dn {
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
    const l = [], c = [], u = [], d = [];
    let f = 0, m = 0;
    _("z", "y", "x", -1, -1, n, e, t, a, s, 0), _("z", "y", "x", 1, -1, n, e, -t, a, s, 1), _("x", "z", "y", 1, 1, t, n, e, r, a, 2), _("x", "z", "y", 1, -1, t, n, -e, r, a, 3), _("x", "y", "z", 1, -1, t, e, n, r, s, 4), _("x", "y", "z", -1, -1, t, e, -n, r, s, 5), this.setIndex(l), this.setAttribute("position", new on(c, 3)), this.setAttribute("normal", new on(u, 3)), this.setAttribute("uv", new on(d, 2));
    function _(v, p, h, b, T, M, R, C, w, N, E) {
      const S = M / w, D = R / N, O = M / 2, H = R / 2, $ = C / 2, W = w + 1, Y = N + 1;
      let j = 0, z = 0;
      const rt = new I();
      for (let ct = 0; ct < Y; ct++) {
        const St = ct * D - H;
        for (let Bt = 0; Bt < W; Bt++) {
          const zt = Bt * S - O;
          rt[v] = zt * b, rt[p] = St * T, rt[h] = $, c.push(rt.x, rt.y, rt.z), rt[v] = 0, rt[p] = 0, rt[h] = C > 0 ? 1 : -1, u.push(rt.x, rt.y, rt.z), d.push(Bt / w), d.push(1 - ct / N), j += 1;
        }
      }
      for (let ct = 0; ct < N; ct++)
        for (let St = 0; St < w; St++) {
          const Bt = f + St + W * ct, zt = f + St + W * (ct + 1), Yt = f + (St + 1) + W * (ct + 1), jt = f + (St + 1) + W * ct;
          l.push(Bt, zt, jt), l.push(zt, Yt, jt), z += 6;
        }
      o.addGroup(m, z, E), m += z, f += j;
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
    return new Bi(t.width, t.height, t.depth, t.widthSegments, t.heightSegments, t.depthSegments);
  }
}
function Ni(i) {
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
function Re(i) {
  const t = {};
  for (let e = 0; e < i.length; e++) {
    const n = Ni(i[e]);
    for (const r in n)
      t[r] = n[r];
  }
  return t;
}
function Th(i) {
  const t = [];
  for (let e = 0; e < i.length; e++)
    t.push(i[e].clone());
  return t;
}
function wl(i) {
  const t = i.getRenderTarget();
  return t === null ? i.outputColorSpace : t.isXRRenderTarget === !0 ? t.texture.colorSpace : $t.workingColorSpace;
}
const Ah = { clone: Ni, merge: Re };
var wh = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, Rh = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class kn extends Oi {
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
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = wh, this.fragmentShader = Rh, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
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
    return super.copy(t), this.fragmentShader = t.fragmentShader, this.vertexShader = t.vertexShader, this.uniforms = Ni(t.uniforms), this.uniformsGroups = Th(t.uniformsGroups), this.defines = Object.assign({}, t.defines), this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.fog = t.fog, this.lights = t.lights, this.clipping = t.clipping, this.extensions = Object.assign({}, t.extensions), this.glslVersion = t.glslVersion, this;
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
class Rl extends ge {
  /**
   * Constructs a new camera.
   */
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new se(), this.projectionMatrix = new se(), this.projectionMatrixInverse = new se(), this.coordinateSystem = rn, this._reversedDepth = !1;
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
const Ln = /* @__PURE__ */ new I(), go = /* @__PURE__ */ new Dt(), vo = /* @__PURE__ */ new Dt();
class We extends Rl {
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
    this.fov = nr * 2 * Math.atan(e), this.updateProjectionMatrix();
  }
  /**
   * Returns the focal length from the current {@link PerspectiveCamera#fov} and
   * {@link PerspectiveCamera#filmGauge}.
   *
   * @return {number} The computed focal length.
   */
  getFocalLength() {
    const t = Math.tan(Ci * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / t;
  }
  /**
   * Returns the current vertical field of view angle in degrees considering {@link PerspectiveCamera#zoom}.
   *
   * @return {number} The effective FOV.
   */
  getEffectiveFOV() {
    return nr * 2 * Math.atan(
      Math.tan(Ci * 0.5 * this.fov) / this.zoom
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
    Ln.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), e.set(Ln.x, Ln.y).multiplyScalar(-t / Ln.z), Ln.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(Ln.x, Ln.y).multiplyScalar(-t / Ln.z);
  }
  /**
   * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
   *
   * @param {number} distance - The viewing distance.
   * @param {Vector2} target - The target vector that is used to store result where x is width and y is height.
   * @returns {Vector2} The view size.
   */
  getViewSize(t, e) {
    return this.getViewBounds(t, go, vo), e.subVectors(vo, go);
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
    let e = t * Math.tan(Ci * 0.5 * this.fov) / this.zoom, n = 2 * e, r = this.aspect * n, s = -0.5 * r;
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
const _i = -90, gi = 1;
class Ch extends ge {
  /**
   * Constructs a new cube camera.
   *
   * @param {number} near - The camera's near plane.
   * @param {number} far - The camera's far plane.
   * @param {WebGLCubeRenderTarget} renderTarget - The cube render target.
   */
  constructor(t, e, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const r = new We(_i, gi, t, e);
    r.layers = this.layers, this.add(r);
    const s = new We(_i, gi, t, e);
    s.layers = this.layers, this.add(s);
    const a = new We(_i, gi, t, e);
    a.layers = this.layers, this.add(a);
    const o = new We(_i, gi, t, e);
    o.layers = this.layers, this.add(o);
    const l = new We(_i, gi, t, e);
    l.layers = this.layers, this.add(l);
    const c = new We(_i, gi, t, e);
    c.layers = this.layers, this.add(c);
  }
  /**
   * Must be called when the coordinate system of the cube camera is changed.
   */
  updateCoordinateSystem() {
    const t = this.coordinateSystem, e = this.children.concat(), [n, r, s, a, o, l] = e;
    for (const c of e) this.remove(c);
    if (t === rn)
      n.up.set(0, 1, 0), n.lookAt(1, 0, 0), r.up.set(0, 1, 0), r.lookAt(-1, 0, 0), s.up.set(0, 0, -1), s.lookAt(0, 1, 0), a.up.set(0, 0, 1), a.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), l.up.set(0, 1, 0), l.lookAt(0, 0, -1);
    else if (t === Vr)
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
    const [s, a, o, l, c, u] = this.children, d = t.getRenderTarget(), f = t.getActiveCubeFace(), m = t.getActiveMipmapLevel(), _ = t.xr.enabled;
    t.xr.enabled = !1;
    const v = n.texture.generateMipmaps;
    n.texture.generateMipmaps = !1, t.setRenderTarget(n, 0, r), t.render(e, s), t.setRenderTarget(n, 1, r), t.render(e, a), t.setRenderTarget(n, 2, r), t.render(e, o), t.setRenderTarget(n, 3, r), t.render(e, l), t.setRenderTarget(n, 4, r), t.render(e, c), n.texture.generateMipmaps = v, t.setRenderTarget(n, 5, r), t.render(e, u), t.setRenderTarget(d, f, m), t.xr.enabled = _, n.texture.needsPMREMUpdate = !0;
  }
}
class Cl extends Ce {
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
  constructor(t = [], e = Li, n, r, s, a, o, l, c, u) {
    super(t, e, n, r, s, a, o, l, c, u), this.isCubeTexture = !0, this.flipY = !1;
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
class Ph extends ni {
  /**
   * Constructs a new cube render target.
   *
   * @param {number} [size=1] - The size of the render target.
   * @param {RenderTarget~Options} [options] - The configuration object.
   */
  constructor(t = 1, e = {}) {
    super(t, t, e), this.isWebGLCubeRenderTarget = !0;
    const n = { width: t, height: t, depth: 1 }, r = [n, n, n, n, n, n];
    this.texture = new Cl(r), this._setTextureOptions(e), this.texture.isRenderTargetTexture = !0;
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
    }, r = new Bi(5, 5, 5), s = new kn({
      name: "CubemapFromEquirect",
      uniforms: Ni(n.uniforms),
      vertexShader: n.vertexShader,
      fragmentShader: n.fragmentShader,
      side: Ne,
      blending: Nn
    });
    s.uniforms.tEquirect.value = e;
    const a = new Ze(r, s), o = e.minFilter;
    return e.minFilter === Jn && (e.minFilter = nn), new Ch(1, 10, this).update(t, a), e.minFilter = o, a.geometry.dispose(), a.material.dispose(), this;
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
class Un extends ge {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group";
  }
}
const Dh = { type: "move" };
class Ms {
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
    return this._hand === null && (this._hand = new Un(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
  }
  /**
   * Returns a group representing the target ray space of the XR controller.
   *
   * @return {Group} A group representing the target ray space of the XR controller.
   */
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new Un(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new I(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new I()), this._targetRay;
  }
  /**
   * Returns a group representing the grip space of the XR controller.
   *
   * @return {Group} A group representing the grip space of the XR controller.
   */
  getGripSpace() {
    return this._grip === null && (this._grip = new Un(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new I(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new I()), this._grip;
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
        for (const v of t.hand.values()) {
          const p = e.getJointPose(v, n), h = this._getHandJoint(c, v);
          p !== null && (h.matrix.fromArray(p.transform.matrix), h.matrix.decompose(h.position, h.rotation, h.scale), h.matrixWorldNeedsUpdate = !0, h.jointRadius = p.radius), h.visible = p !== null;
        }
        const u = c.joints["index-finger-tip"], d = c.joints["thumb-tip"], f = u.position.distanceTo(d.position), m = 0.02, _ = 5e-3;
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
        l !== null && t.gripSpace && (s = e.getPose(t.gripSpace, n), s !== null && (l.matrix.fromArray(s.transform.matrix), l.matrix.decompose(l.position, l.rotation, l.scale), l.matrixWorldNeedsUpdate = !0, s.linearVelocity ? (l.hasLinearVelocity = !0, l.linearVelocity.copy(s.linearVelocity)) : l.hasLinearVelocity = !1, s.angularVelocity ? (l.hasAngularVelocity = !0, l.angularVelocity.copy(s.angularVelocity)) : l.hasAngularVelocity = !1));
      o !== null && (r = e.getPose(t.targetRaySpace, n), r === null && s !== null && (r = s), r !== null && (o.matrix.fromArray(r.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(r.linearVelocity)) : o.hasLinearVelocity = !1, r.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(r.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(Dh)));
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
      const n = new Un();
      n.matrixAutoUpdate = !1, n.visible = !1, t.joints[e.jointName] = n, t.add(n);
    }
    return t.joints[e.jointName];
  }
}
class Lh extends ge {
  /**
   * Constructs a new scene.
   */
  constructor() {
    super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new hn(), this.environmentIntensity = 1, this.environmentRotation = new hn(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  copy(t, e) {
    return super.copy(t, e), t.background !== null && (this.background = t.background.clone()), t.environment !== null && (this.environment = t.environment.clone()), t.fog !== null && (this.fog = t.fog.clone()), this.backgroundBlurriness = t.backgroundBlurriness, this.backgroundIntensity = t.backgroundIntensity, this.backgroundRotation.copy(t.backgroundRotation), this.environmentIntensity = t.environmentIntensity, this.environmentRotation.copy(t.environmentRotation), t.overrideMaterial !== null && (this.overrideMaterial = t.overrideMaterial.clone()), this.matrixAutoUpdate = t.matrixAutoUpdate, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return this.fog !== null && (e.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (e.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (e.object.backgroundIntensity = this.backgroundIntensity), e.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (e.object.environmentIntensity = this.environmentIntensity), e.object.environmentRotation = this.environmentRotation.toArray(), e;
  }
}
const Ss = /* @__PURE__ */ new I(), Ih = /* @__PURE__ */ new I(), Uh = /* @__PURE__ */ new Nt();
class xn {
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
    const r = Ss.subVectors(n, e).cross(Ih.subVectors(t, e)).normalize();
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
    const n = t.delta(Ss), r = this.normal.dot(n);
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
    const n = e || Uh.getNormalMatrix(t), r = this.coplanarPoint(Ss).applyMatrix4(t), s = this.normal.applyMatrix3(n).normalize();
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
const Xn = /* @__PURE__ */ new $r(), Nh = /* @__PURE__ */ new Dt(0.5, 0.5), Ar = /* @__PURE__ */ new I();
class Na {
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
  constructor(t = new xn(), e = new xn(), n = new xn(), r = new xn(), s = new xn(), a = new xn()) {
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
  setFromProjectionMatrix(t, e = rn, n = !1) {
    const r = this.planes, s = t.elements, a = s[0], o = s[1], l = s[2], c = s[3], u = s[4], d = s[5], f = s[6], m = s[7], _ = s[8], v = s[9], p = s[10], h = s[11], b = s[12], T = s[13], M = s[14], R = s[15];
    if (r[0].setComponents(c - a, m - u, h - _, R - b).normalize(), r[1].setComponents(c + a, m + u, h + _, R + b).normalize(), r[2].setComponents(c + o, m + d, h + v, R + T).normalize(), r[3].setComponents(c - o, m - d, h - v, R - T).normalize(), n)
      r[4].setComponents(l, f, p, M).normalize(), r[5].setComponents(c - l, m - f, h - p, R - M).normalize();
    else if (r[4].setComponents(c - l, m - f, h - p, R - M).normalize(), e === rn)
      r[5].setComponents(c + l, m + f, h + p, R + M).normalize();
    else if (e === Vr)
      r[5].setComponents(l, f, p, M).normalize();
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
      t.boundingSphere === null && t.computeBoundingSphere(), Xn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);
    else {
      const e = t.geometry;
      e.boundingSphere === null && e.computeBoundingSphere(), Xn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld);
    }
    return this.intersectsSphere(Xn);
  }
  /**
   * Returns `true` if the given sprite is intersecting this frustum.
   *
   * @param {Sprite} sprite - The sprite to test.
   * @return {boolean} Whether the sprite is intersecting this frustum or not.
   */
  intersectsSprite(t) {
    Xn.center.set(0, 0, 0);
    const e = Nh.distanceTo(t.center);
    return Xn.radius = 0.7071067811865476 + e, Xn.applyMatrix4(t.matrixWorld), this.intersectsSphere(Xn);
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
      if (Ar.x = r.normal.x > 0 ? t.max.x : t.min.x, Ar.y = r.normal.y > 0 ? t.max.y : t.min.y, Ar.z = r.normal.z > 0 ? t.max.z : t.min.z, r.distanceToPoint(Ar) < 0)
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
class Ma extends Oi {
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
    super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new Xt(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.color.copy(t.color), this.map = t.map, this.linewidth = t.linewidth, this.linecap = t.linecap, this.linejoin = t.linejoin, this.fog = t.fog, this;
  }
}
const Wr = /* @__PURE__ */ new I(), Xr = /* @__PURE__ */ new I(), xo = /* @__PURE__ */ new se(), Yi = /* @__PURE__ */ new jr(), wr = /* @__PURE__ */ new $r(), Es = /* @__PURE__ */ new I(), Mo = /* @__PURE__ */ new I();
class Fh extends ge {
  /**
   * Constructs a new line.
   *
   * @param {BufferGeometry} [geometry] - The line geometry.
   * @param {Material|Array<Material>} [material] - The line material.
   */
  constructor(t = new dn(), e = new Ma()) {
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
        Wr.fromBufferAttribute(e, r - 1), Xr.fromBufferAttribute(e, r), n[r] = n[r - 1], n[r] += Wr.distanceTo(Xr);
      t.setAttribute("lineDistance", new on(n, 1));
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
    if (n.boundingSphere === null && n.computeBoundingSphere(), wr.copy(n.boundingSphere), wr.applyMatrix4(r), wr.radius += s, t.ray.intersectsSphere(wr) === !1) return;
    xo.copy(r).invert(), Yi.copy(t.ray).applyMatrix4(xo);
    const o = s / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = o * o, c = this.isLineSegments ? 2 : 1, u = n.index, f = n.attributes.position;
    if (u !== null) {
      const m = Math.max(0, a.start), _ = Math.min(u.count, a.start + a.count);
      for (let v = m, p = _ - 1; v < p; v += c) {
        const h = u.getX(v), b = u.getX(v + 1), T = Rr(this, t, Yi, l, h, b, v);
        T && e.push(T);
      }
      if (this.isLineLoop) {
        const v = u.getX(_ - 1), p = u.getX(m), h = Rr(this, t, Yi, l, v, p, _ - 1);
        h && e.push(h);
      }
    } else {
      const m = Math.max(0, a.start), _ = Math.min(f.count, a.start + a.count);
      for (let v = m, p = _ - 1; v < p; v += c) {
        const h = Rr(this, t, Yi, l, v, v + 1, v);
        h && e.push(h);
      }
      if (this.isLineLoop) {
        const v = Rr(this, t, Yi, l, _ - 1, m, _ - 1);
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
function Rr(i, t, e, n, r, s, a) {
  const o = i.geometry.attributes.position;
  if (Wr.fromBufferAttribute(o, r), Xr.fromBufferAttribute(o, s), e.distanceSqToSegment(Wr, Xr, Es, Mo) > n) return;
  Es.applyMatrix4(i.matrixWorld);
  const c = t.ray.origin.distanceTo(Es);
  if (!(c < t.near || c > t.far))
    return {
      distance: c,
      // What do we want? intersection point on the ray or on the segment??
      // point: raycaster.ray.at( distance ),
      point: Mo.clone().applyMatrix4(i.matrixWorld),
      index: a,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: i
    };
}
const So = /* @__PURE__ */ new I(), Eo = /* @__PURE__ */ new I();
class yo extends Fh {
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
        So.fromBufferAttribute(e, r), Eo.fromBufferAttribute(e, r + 1), n[r] = r === 0 ? 0 : n[r - 1], n[r + 1] = n[r] + So.distanceTo(Eo);
      t.setAttribute("lineDistance", new on(n, 1));
    } else
      console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
}
class bo extends Ce {
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
class Pl extends Ce {
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
  constructor(t, e, n = ti, r, s, a, o = Je, l = Je, c, u = tr, d = 1) {
    if (u !== tr && u !== er)
      throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    const f = { width: t, height: e, depth: d };
    super(f, r, s, a, o, l, u, n, c), this.isDepthTexture = !0, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
  }
  copy(t) {
    return super.copy(t), this.source = new La(Object.assign({}, t.image)), this.compareFunction = t.compareFunction, this;
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return this.compareFunction !== null && (e.compareFunction = this.compareFunction), e;
  }
}
class Dl extends Ce {
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
const Cr = /* @__PURE__ */ new I(), Pr = /* @__PURE__ */ new I(), ys = /* @__PURE__ */ new I(), Dr = /* @__PURE__ */ new Xe();
class Oh extends dn {
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
      const r = Math.pow(10, 4), s = Math.cos(Ci * e), a = t.getIndex(), o = t.getAttribute("position"), l = a ? a.count : o.count, c = [0, 0, 0], u = ["a", "b", "c"], d = new Array(3), f = {}, m = [];
      for (let _ = 0; _ < l; _ += 3) {
        a ? (c[0] = a.getX(_), c[1] = a.getX(_ + 1), c[2] = a.getX(_ + 2)) : (c[0] = _, c[1] = _ + 1, c[2] = _ + 2);
        const { a: v, b: p, c: h } = Dr;
        if (v.fromBufferAttribute(o, c[0]), p.fromBufferAttribute(o, c[1]), h.fromBufferAttribute(o, c[2]), Dr.getNormal(ys), d[0] = `${Math.round(v.x * r)},${Math.round(v.y * r)},${Math.round(v.z * r)}`, d[1] = `${Math.round(p.x * r)},${Math.round(p.y * r)},${Math.round(p.z * r)}`, d[2] = `${Math.round(h.x * r)},${Math.round(h.y * r)},${Math.round(h.z * r)}`, !(d[0] === d[1] || d[1] === d[2] || d[2] === d[0]))
          for (let b = 0; b < 3; b++) {
            const T = (b + 1) % 3, M = d[b], R = d[T], C = Dr[u[b]], w = Dr[u[T]], N = `${M}_${R}`, E = `${R}_${M}`;
            E in f && f[E] ? (ys.dot(f[E].normal) <= s && (m.push(C.x, C.y, C.z), m.push(w.x, w.y, w.z)), f[E] = null) : N in f || (f[N] = {
              index0: c[b],
              index1: c[T],
              normal: ys.clone()
            });
          }
      }
      for (const _ in f)
        if (f[_]) {
          const { index0: v, index1: p } = f[_];
          Cr.fromBufferAttribute(o, v), Pr.fromBufferAttribute(o, p), m.push(Cr.x, Cr.y, Cr.z), m.push(Pr.x, Pr.y, Pr.z);
        }
      this.setAttribute("position", new on(m, 3));
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
}
class ar extends dn {
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
    const s = t / 2, a = e / 2, o = Math.floor(n), l = Math.floor(r), c = o + 1, u = l + 1, d = t / o, f = e / l, m = [], _ = [], v = [], p = [];
    for (let h = 0; h < u; h++) {
      const b = h * f - a;
      for (let T = 0; T < c; T++) {
        const M = T * d - s;
        _.push(M, -b, 0), v.push(0, 0, 1), p.push(T / o), p.push(1 - h / l);
      }
    }
    for (let h = 0; h < l; h++)
      for (let b = 0; b < o; b++) {
        const T = b + c * h, M = b + c * (h + 1), R = b + 1 + c * (h + 1), C = b + 1 + c * h;
        m.push(T, M, C), m.push(M, R, C);
      }
    this.setIndex(m), this.setAttribute("position", new on(_, 3)), this.setAttribute("normal", new on(v, 3)), this.setAttribute("uv", new on(p, 2));
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
    return new ar(t.width, t.height, t.widthSegments, t.heightSegments);
  }
}
class To extends Oi {
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
    super(), this.isMeshStandardMaterial = !0, this.type = "MeshStandardMaterial", this.defines = { STANDARD: "" }, this.color = new Xt(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Xt(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = xl, this.normalScale = new Dt(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new hn(), this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.defines = { STANDARD: "" }, this.color.copy(t.color), this.roughness = t.roughness, this.metalness = t.metalness, this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.emissive.copy(t.emissive), this.emissiveMap = t.emissiveMap, this.emissiveIntensity = t.emissiveIntensity, this.bumpMap = t.bumpMap, this.bumpScale = t.bumpScale, this.normalMap = t.normalMap, this.normalMapType = t.normalMapType, this.normalScale.copy(t.normalScale), this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.roughnessMap = t.roughnessMap, this.metalnessMap = t.metalnessMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.envMapIntensity = t.envMapIntensity, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.flatShading = t.flatShading, this.fog = t.fog, this;
  }
}
class Bh extends Oi {
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
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = Uc, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(t);
  }
  copy(t) {
    return super.copy(t), this.depthPacking = t.depthPacking, this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this;
  }
}
class kh extends Oi {
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
class Ll extends ge {
  /**
   * Constructs a new light.
   *
   * @param {(number|Color|string)} [color=0xffffff] - The light's color.
   * @param {number} [intensity=1] - The light's strength/intensity.
   */
  constructor(t, e = 1) {
    super(), this.isLight = !0, this.type = "Light", this.color = new Xt(t), this.intensity = e;
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
class zh extends Ll {
  /**
   * Constructs a new hemisphere light.
   *
   * @param {(number|Color|string)} [skyColor=0xffffff] - The light's sky color.
   * @param {(number|Color|string)} [groundColor=0xffffff] - The light's ground color.
   * @param {number} [intensity=1] - The light's strength/intensity.
   */
  constructor(t, e, n) {
    super(t, n), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(ge.DEFAULT_UP), this.updateMatrix(), this.groundColor = new Xt(e);
  }
  copy(t, e) {
    return super.copy(t, e), this.groundColor.copy(t.groundColor), this;
  }
}
const bs = /* @__PURE__ */ new se(), Ao = /* @__PURE__ */ new I(), wo = /* @__PURE__ */ new I();
class Hh {
  /**
   * Constructs a new light shadow.
   *
   * @param {Camera} camera - The light's view of the world.
   */
  constructor(t) {
    this.camera = t, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new Dt(512, 512), this.mapType = cn, this.map = null, this.mapPass = null, this.matrix = new se(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new Na(), this._frameExtents = new Dt(1, 1), this._viewportCount = 1, this._viewports = [
      new ue(0, 0, 1, 1)
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
    Ao.setFromMatrixPosition(t.matrixWorld), e.position.copy(Ao), wo.setFromMatrixPosition(t.target.matrixWorld), e.lookAt(wo), e.updateMatrixWorld(), bs.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse), this._frustum.setFromProjectionMatrix(bs, e.coordinateSystem, e.reversedDepth), e.reversedDepth ? n.set(
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
    ), n.multiply(bs);
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
class Il extends Rl {
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
      const c = (this.right - this.left) / this.view.fullWidth / this.zoom, u = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      s += c * this.view.offsetX, a = s + c * this.view.width, o -= u * this.view.offsetY, l = o - u * this.view.height;
    }
    this.projectionMatrix.makeOrthographic(s, a, o, l, this.near, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return e.object.zoom = this.zoom, e.object.left = this.left, e.object.right = this.right, e.object.top = this.top, e.object.bottom = this.bottom, e.object.near = this.near, e.object.far = this.far, this.view !== null && (e.object.view = Object.assign({}, this.view)), e;
  }
}
class Vh extends Hh {
  /**
   * Constructs a new directional light shadow.
   */
  constructor() {
    super(new Il(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
  }
}
class Gh extends Ll {
  /**
   * Constructs a new directional light.
   *
   * @param {(number|Color|string)} [color=0xffffff] - The light's color.
   * @param {number} [intensity=1] - The light's strength/intensity.
   */
  constructor(t, e) {
    super(t, e), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(ge.DEFAULT_UP), this.updateMatrix(), this.target = new ge(), this.shadow = new Vh();
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(t) {
    return super.copy(t), this.target = t.target.clone(), this.shadow = t.shadow.clone(), this;
  }
}
class Wh extends We {
  /**
   * Constructs a new array camera.
   *
   * @param {Array<PerspectiveCamera>} [array=[]] - An array of perspective sub cameras.
   */
  constructor(t = []) {
    super(), this.isArrayCamera = !0, this.isMultiViewCamera = !1, this.cameras = t;
  }
}
const Ro = /* @__PURE__ */ new se();
class Xh {
  /**
   * Constructs a new raycaster.
   *
   * @param {Vector3} origin - The origin vector where the ray casts from.
   * @param {Vector3} direction - The (normalized) direction vector that gives direction to the ray.
   * @param {number} [near=0] - All results returned are further away than near. Near can't be negative.
   * @param {number} [far=Infinity] - All results returned are closer than far. Far can't be lower than near.
   */
  constructor(t, e, n = 0, r = 1 / 0) {
    this.ray = new jr(t, e), this.near = n, this.far = r, this.camera = null, this.layers = new Ia(), this.params = {
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
    return Ro.identity().extractRotation(t.matrixWorld), this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(Ro), this;
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
    return Sa(t, this, n, e), n.sort(Co), n;
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
      Sa(t[r], this, n, e);
    return n.sort(Co), n;
  }
}
function Co(i, t) {
  return i.distance - t.distance;
}
function Sa(i, t, e, n) {
  let r = !0;
  if (i.layers.test(t.layers) && i.raycast(t, e) === !1 && (r = !1), r === !0 && n === !0) {
    const s = i.children;
    for (let a = 0, o = s.length; a < o; a++)
      Sa(s[a], t, e, !0);
  }
}
class Po {
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
    return this.phi = Ht(this.phi, 1e-6, Math.PI - 1e-6), this;
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
    return this.radius = Math.sqrt(t * t + e * e + n * n), this.radius === 0 ? (this.theta = 0, this.phi = 0) : (this.theta = Math.atan2(t, n), this.phi = Math.acos(Ht(e / this.radius, -1, 1))), this;
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
class Yh extends ii {
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
function Do(i, t, e, n) {
  const r = qh(n);
  switch (e) {
    // https://registry.khronos.org/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
    case ml:
      return i * t;
    case gl:
      return i * t / r.components * r.byteLength;
    case Ra:
      return i * t / r.components * r.byteLength;
    case vl:
      return i * t * 2 / r.components * r.byteLength;
    case Ca:
      return i * t * 2 / r.components * r.byteLength;
    case _l:
      return i * t * 3 / r.components * r.byteLength;
    case Ke:
      return i * t * 4 / r.components * r.byteLength;
    case Pa:
      return i * t * 4 / r.components * r.byteLength;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_s3tc_srgb/
    case Fr:
    case Or:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case Br:
    case kr:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_pvrtc/
    case qs:
    case js:
      return Math.max(i, 16) * Math.max(t, 8) / 4;
    case Ys:
    case $s:
      return Math.max(i, 8) * Math.max(t, 8) / 2;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_etc/
    case Ks:
    case Zs:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case Js:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_astc/
    case Qs:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case ta:
      return Math.floor((i + 4) / 5) * Math.floor((t + 3) / 4) * 16;
    case ea:
      return Math.floor((i + 4) / 5) * Math.floor((t + 4) / 5) * 16;
    case na:
      return Math.floor((i + 5) / 6) * Math.floor((t + 4) / 5) * 16;
    case ia:
      return Math.floor((i + 5) / 6) * Math.floor((t + 5) / 6) * 16;
    case ra:
      return Math.floor((i + 7) / 8) * Math.floor((t + 4) / 5) * 16;
    case sa:
      return Math.floor((i + 7) / 8) * Math.floor((t + 5) / 6) * 16;
    case aa:
      return Math.floor((i + 7) / 8) * Math.floor((t + 7) / 8) * 16;
    case oa:
      return Math.floor((i + 9) / 10) * Math.floor((t + 4) / 5) * 16;
    case la:
      return Math.floor((i + 9) / 10) * Math.floor((t + 5) / 6) * 16;
    case ca:
      return Math.floor((i + 9) / 10) * Math.floor((t + 7) / 8) * 16;
    case ha:
      return Math.floor((i + 9) / 10) * Math.floor((t + 9) / 10) * 16;
    case da:
      return Math.floor((i + 11) / 12) * Math.floor((t + 9) / 10) * 16;
    case ua:
      return Math.floor((i + 11) / 12) * Math.floor((t + 11) / 12) * 16;
    // https://registry.khronos.org/webgl/extensions/EXT_texture_compression_bptc/
    case fa:
    case pa:
    case ma:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
    // https://registry.khronos.org/webgl/extensions/EXT_texture_compression_rgtc/
    case _a:
    case ga:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 8;
    case va:
    case xa:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
  }
  throw new Error(
    `Unable to determine texture byte length for ${e} format.`
  );
}
function qh(i) {
  switch (i) {
    case cn:
    case dl:
      return { byteLength: 1, components: 1 };
    case Ji:
    case ul:
    case rr:
      return { byteLength: 2, components: 1 };
    case Aa:
    case wa:
      return { byteLength: 2, components: 4 };
    case ti:
    case Ta:
    case Sn:
      return { byteLength: 4, components: 1 };
    case fl:
    case pl:
      return { byteLength: 4, components: 3 };
  }
  throw new Error(`Unknown texture type ${i}.`);
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: {
  revision: ba
} }));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = ba);
function Ul() {
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
function $h(i) {
  const t = /* @__PURE__ */ new WeakMap();
  function e(o, l) {
    const c = o.array, u = o.usage, d = c.byteLength, f = i.createBuffer();
    i.bindBuffer(l, f), i.bufferData(l, c, u), o.onUploadCallback();
    let m;
    if (c instanceof Float32Array)
      m = i.FLOAT;
    else if (typeof Float16Array < "u" && c instanceof Float16Array)
      m = i.HALF_FLOAT;
    else if (c instanceof Uint16Array)
      o.isFloat16BufferAttribute ? m = i.HALF_FLOAT : m = i.UNSIGNED_SHORT;
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
      version: o.version,
      size: d
    };
  }
  function n(o, l, c) {
    const u = l.array, d = l.updateRanges;
    if (i.bindBuffer(c, o), d.length === 0)
      i.bufferSubData(c, 0, u);
    else {
      d.sort((m, _) => m.start - _.start);
      let f = 0;
      for (let m = 1; m < d.length; m++) {
        const _ = d[f], v = d[m];
        v.start <= _.start + _.count + 1 ? _.count = Math.max(
          _.count,
          v.start + v.count - _.start
        ) : (++f, d[f] = v);
      }
      d.length = f + 1;
      for (let m = 0, _ = d.length; m < _; m++) {
        const v = d[m];
        i.bufferSubData(
          c,
          v.start * u.BYTES_PER_ELEMENT,
          u,
          v.start,
          v.count
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
      const u = t.get(o);
      (!u || u.version < o.version) && t.set(o, {
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
var jh = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, Kh = `#ifdef USE_ALPHAHASH
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
#endif`, Zh = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, Jh = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, Qh = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, td = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, ed = `#ifdef USE_AOMAP
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
#endif`, nd = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, id = `#ifdef USE_BATCHING
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
#endif`, rd = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`, sd = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, ad = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, od = `float G_BlinnPhong_Implicit( ) {
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
} // validated`, ld = `#ifdef USE_IRIDESCENCE
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
#endif`, cd = `#ifdef USE_BUMPMAP
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
#endif`, hd = `#if NUM_CLIPPING_PLANES > 0
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
#endif`, dd = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, ud = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, fd = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, pd = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, md = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, _d = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, gd = `#if defined( USE_COLOR_ALPHA )
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
#endif`, vd = `#define PI 3.141592653589793
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
} // validated`, xd = `#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`, Md = `vec3 transformedNormal = objectNormal;
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
#endif`, Sd = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, Ed = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, yd = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, bd = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, Td = "gl_FragColor = linearToOutputTexel( gl_FragColor );", Ad = `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`, wd = `#ifdef USE_ENVMAP
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
#endif`, Rd = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, Cd = `#ifdef USE_ENVMAP
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
#endif`, Pd = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, Dd = `#ifdef USE_ENVMAP
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
#endif`, Ld = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, Id = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, Ud = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, Nd = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, Fd = `#ifdef USE_GRADIENTMAP
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
}`, Od = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, Bd = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, kd = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, zd = `uniform bool receiveShadow;
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
#endif`, Hd = `#ifdef USE_ENVMAP
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
#endif`, Vd = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, Gd = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, Wd = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, Xd = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, Yd = `PhysicalMaterial material;
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
#endif`, qd = `struct PhysicalMaterial {
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
}`, $d = `
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
#endif`, jd = `#if defined( RE_IndirectDiffuse )
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
#endif`, Kd = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, Zd = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, Jd = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, Qd = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, tu = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, eu = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, nu = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, iu = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`, ru = `#if defined( USE_POINTS_UV )
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
#endif`, su = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, au = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, ou = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, lu = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, cu = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, hu = `#ifdef USE_MORPHTARGETS
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
#endif`, du = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, uu = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`, fu = `#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`, pu = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, mu = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, _u = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, gu = `#ifdef USE_NORMALMAP
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
#endif`, vu = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, xu = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, Mu = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, Su = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, Eu = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, yu = `vec3 packNormalToRGB( const in vec3 normal ) {
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
}`, bu = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, Tu = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, Au = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, wu = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, Ru = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, Cu = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, Pu = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, Du = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, Lu = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`, Iu = `float getShadowMask() {
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
}`, Uu = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, Nu = `#ifdef USE_SKINNING
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
#endif`, Fu = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, Ou = `#ifdef USE_SKINNING
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
#endif`, Bu = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, ku = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, zu = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, Hu = `#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`, Vu = `#ifdef USE_TRANSMISSION
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
#endif`, Gu = `#ifdef USE_TRANSMISSION
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
#endif`, Wu = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, Xu = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, Yu = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, qu = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const $u = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, ju = `uniform sampler2D t2D;
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
}`, Ku = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, Zu = `#ifdef ENVMAP_TYPE_CUBE
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
}`, Ju = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, Qu = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, tf = `#include <common>
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
}`, ef = `#if DEPTH_PACKING == 3200
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
}`, nf = `#define DISTANCE
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
}`, rf = `#define DISTANCE
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
}`, sf = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, af = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, of = `uniform float scale;
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
}`, lf = `uniform vec3 diffuse;
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
}`, cf = `#include <common>
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
}`, hf = `uniform vec3 diffuse;
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
}`, df = `#define LAMBERT
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
}`, uf = `#define LAMBERT
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
}`, ff = `#define MATCAP
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
}`, pf = `#define MATCAP
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
}`, mf = `#define NORMAL
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
}`, _f = `#define NORMAL
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
}`, gf = `#define PHONG
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
}`, vf = `#define PHONG
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
}`, xf = `#define STANDARD
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
}`, Mf = `#define STANDARD
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
}`, Sf = `#define TOON
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
}`, Ef = `#define TOON
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
}`, yf = `uniform float size;
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
}`, bf = `uniform vec3 diffuse;
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
}`, Tf = `#include <common>
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
}`, Af = `uniform vec3 color;
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
}`, wf = `uniform float rotation;
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
}`, Rf = `uniform vec3 diffuse;
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
}`, Ot = {
  alphahash_fragment: jh,
  alphahash_pars_fragment: Kh,
  alphamap_fragment: Zh,
  alphamap_pars_fragment: Jh,
  alphatest_fragment: Qh,
  alphatest_pars_fragment: td,
  aomap_fragment: ed,
  aomap_pars_fragment: nd,
  batching_pars_vertex: id,
  batching_vertex: rd,
  begin_vertex: sd,
  beginnormal_vertex: ad,
  bsdfs: od,
  iridescence_fragment: ld,
  bumpmap_pars_fragment: cd,
  clipping_planes_fragment: hd,
  clipping_planes_pars_fragment: dd,
  clipping_planes_pars_vertex: ud,
  clipping_planes_vertex: fd,
  color_fragment: pd,
  color_pars_fragment: md,
  color_pars_vertex: _d,
  color_vertex: gd,
  common: vd,
  cube_uv_reflection_fragment: xd,
  defaultnormal_vertex: Md,
  displacementmap_pars_vertex: Sd,
  displacementmap_vertex: Ed,
  emissivemap_fragment: yd,
  emissivemap_pars_fragment: bd,
  colorspace_fragment: Td,
  colorspace_pars_fragment: Ad,
  envmap_fragment: wd,
  envmap_common_pars_fragment: Rd,
  envmap_pars_fragment: Cd,
  envmap_pars_vertex: Pd,
  envmap_physical_pars_fragment: Hd,
  envmap_vertex: Dd,
  fog_vertex: Ld,
  fog_pars_vertex: Id,
  fog_fragment: Ud,
  fog_pars_fragment: Nd,
  gradientmap_pars_fragment: Fd,
  lightmap_pars_fragment: Od,
  lights_lambert_fragment: Bd,
  lights_lambert_pars_fragment: kd,
  lights_pars_begin: zd,
  lights_toon_fragment: Vd,
  lights_toon_pars_fragment: Gd,
  lights_phong_fragment: Wd,
  lights_phong_pars_fragment: Xd,
  lights_physical_fragment: Yd,
  lights_physical_pars_fragment: qd,
  lights_fragment_begin: $d,
  lights_fragment_maps: jd,
  lights_fragment_end: Kd,
  logdepthbuf_fragment: Zd,
  logdepthbuf_pars_fragment: Jd,
  logdepthbuf_pars_vertex: Qd,
  logdepthbuf_vertex: tu,
  map_fragment: eu,
  map_pars_fragment: nu,
  map_particle_fragment: iu,
  map_particle_pars_fragment: ru,
  metalnessmap_fragment: su,
  metalnessmap_pars_fragment: au,
  morphinstance_vertex: ou,
  morphcolor_vertex: lu,
  morphnormal_vertex: cu,
  morphtarget_pars_vertex: hu,
  morphtarget_vertex: du,
  normal_fragment_begin: uu,
  normal_fragment_maps: fu,
  normal_pars_fragment: pu,
  normal_pars_vertex: mu,
  normal_vertex: _u,
  normalmap_pars_fragment: gu,
  clearcoat_normal_fragment_begin: vu,
  clearcoat_normal_fragment_maps: xu,
  clearcoat_pars_fragment: Mu,
  iridescence_pars_fragment: Su,
  opaque_fragment: Eu,
  packing: yu,
  premultiplied_alpha_fragment: bu,
  project_vertex: Tu,
  dithering_fragment: Au,
  dithering_pars_fragment: wu,
  roughnessmap_fragment: Ru,
  roughnessmap_pars_fragment: Cu,
  shadowmap_pars_fragment: Pu,
  shadowmap_pars_vertex: Du,
  shadowmap_vertex: Lu,
  shadowmask_pars_fragment: Iu,
  skinbase_vertex: Uu,
  skinning_pars_vertex: Nu,
  skinning_vertex: Fu,
  skinnormal_vertex: Ou,
  specularmap_fragment: Bu,
  specularmap_pars_fragment: ku,
  tonemapping_fragment: zu,
  tonemapping_pars_fragment: Hu,
  transmission_fragment: Vu,
  transmission_pars_fragment: Gu,
  uv_pars_fragment: Wu,
  uv_pars_vertex: Xu,
  uv_vertex: Yu,
  worldpos_vertex: qu,
  background_vert: $u,
  background_frag: ju,
  backgroundCube_vert: Ku,
  backgroundCube_frag: Zu,
  cube_vert: Ju,
  cube_frag: Qu,
  depth_vert: tf,
  depth_frag: ef,
  distanceRGBA_vert: nf,
  distanceRGBA_frag: rf,
  equirect_vert: sf,
  equirect_frag: af,
  linedashed_vert: of,
  linedashed_frag: lf,
  meshbasic_vert: cf,
  meshbasic_frag: hf,
  meshlambert_vert: df,
  meshlambert_frag: uf,
  meshmatcap_vert: ff,
  meshmatcap_frag: pf,
  meshnormal_vert: mf,
  meshnormal_frag: _f,
  meshphong_vert: gf,
  meshphong_frag: vf,
  meshphysical_vert: xf,
  meshphysical_frag: Mf,
  meshtoon_vert: Sf,
  meshtoon_frag: Ef,
  points_vert: yf,
  points_frag: bf,
  shadow_vert: Tf,
  shadow_frag: Af,
  sprite_vert: wf,
  sprite_frag: Rf
}, st = {
  common: {
    diffuse: { value: /* @__PURE__ */ new Xt(16777215) },
    opacity: { value: 1 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Nt() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Nt() },
    alphaTest: { value: 0 }
  },
  specularmap: {
    specularMap: { value: null },
    specularMapTransform: { value: /* @__PURE__ */ new Nt() }
  },
  envmap: {
    envMap: { value: null },
    envMapRotation: { value: /* @__PURE__ */ new Nt() },
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
    aoMapTransform: { value: /* @__PURE__ */ new Nt() }
  },
  lightmap: {
    lightMap: { value: null },
    lightMapIntensity: { value: 1 },
    lightMapTransform: { value: /* @__PURE__ */ new Nt() }
  },
  bumpmap: {
    bumpMap: { value: null },
    bumpMapTransform: { value: /* @__PURE__ */ new Nt() },
    bumpScale: { value: 1 }
  },
  normalmap: {
    normalMap: { value: null },
    normalMapTransform: { value: /* @__PURE__ */ new Nt() },
    normalScale: { value: /* @__PURE__ */ new Dt(1, 1) }
  },
  displacementmap: {
    displacementMap: { value: null },
    displacementMapTransform: { value: /* @__PURE__ */ new Nt() },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 }
  },
  emissivemap: {
    emissiveMap: { value: null },
    emissiveMapTransform: { value: /* @__PURE__ */ new Nt() }
  },
  metalnessmap: {
    metalnessMap: { value: null },
    metalnessMapTransform: { value: /* @__PURE__ */ new Nt() }
  },
  roughnessmap: {
    roughnessMap: { value: null },
    roughnessMapTransform: { value: /* @__PURE__ */ new Nt() }
  },
  gradientmap: {
    gradientMap: { value: null }
  },
  fog: {
    fogDensity: { value: 25e-5 },
    fogNear: { value: 1 },
    fogFar: { value: 2e3 },
    fogColor: { value: /* @__PURE__ */ new Xt(16777215) }
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
    diffuse: { value: /* @__PURE__ */ new Xt(16777215) },
    opacity: { value: 1 },
    size: { value: 1 },
    scale: { value: 1 },
    map: { value: null },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Nt() },
    alphaTest: { value: 0 },
    uvTransform: { value: /* @__PURE__ */ new Nt() }
  },
  sprite: {
    diffuse: { value: /* @__PURE__ */ new Xt(16777215) },
    opacity: { value: 1 },
    center: { value: /* @__PURE__ */ new Dt(0.5, 0.5) },
    rotation: { value: 0 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Nt() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Nt() },
    alphaTest: { value: 0 }
  }
}, en = {
  basic: {
    uniforms: /* @__PURE__ */ Re([
      st.common,
      st.specularmap,
      st.envmap,
      st.aomap,
      st.lightmap,
      st.fog
    ]),
    vertexShader: Ot.meshbasic_vert,
    fragmentShader: Ot.meshbasic_frag
  },
  lambert: {
    uniforms: /* @__PURE__ */ Re([
      st.common,
      st.specularmap,
      st.envmap,
      st.aomap,
      st.lightmap,
      st.emissivemap,
      st.bumpmap,
      st.normalmap,
      st.displacementmap,
      st.fog,
      st.lights,
      {
        emissive: { value: /* @__PURE__ */ new Xt(0) }
      }
    ]),
    vertexShader: Ot.meshlambert_vert,
    fragmentShader: Ot.meshlambert_frag
  },
  phong: {
    uniforms: /* @__PURE__ */ Re([
      st.common,
      st.specularmap,
      st.envmap,
      st.aomap,
      st.lightmap,
      st.emissivemap,
      st.bumpmap,
      st.normalmap,
      st.displacementmap,
      st.fog,
      st.lights,
      {
        emissive: { value: /* @__PURE__ */ new Xt(0) },
        specular: { value: /* @__PURE__ */ new Xt(1118481) },
        shininess: { value: 30 }
      }
    ]),
    vertexShader: Ot.meshphong_vert,
    fragmentShader: Ot.meshphong_frag
  },
  standard: {
    uniforms: /* @__PURE__ */ Re([
      st.common,
      st.envmap,
      st.aomap,
      st.lightmap,
      st.emissivemap,
      st.bumpmap,
      st.normalmap,
      st.displacementmap,
      st.roughnessmap,
      st.metalnessmap,
      st.fog,
      st.lights,
      {
        emissive: { value: /* @__PURE__ */ new Xt(0) },
        roughness: { value: 1 },
        metalness: { value: 0 },
        envMapIntensity: { value: 1 }
      }
    ]),
    vertexShader: Ot.meshphysical_vert,
    fragmentShader: Ot.meshphysical_frag
  },
  toon: {
    uniforms: /* @__PURE__ */ Re([
      st.common,
      st.aomap,
      st.lightmap,
      st.emissivemap,
      st.bumpmap,
      st.normalmap,
      st.displacementmap,
      st.gradientmap,
      st.fog,
      st.lights,
      {
        emissive: { value: /* @__PURE__ */ new Xt(0) }
      }
    ]),
    vertexShader: Ot.meshtoon_vert,
    fragmentShader: Ot.meshtoon_frag
  },
  matcap: {
    uniforms: /* @__PURE__ */ Re([
      st.common,
      st.bumpmap,
      st.normalmap,
      st.displacementmap,
      st.fog,
      {
        matcap: { value: null }
      }
    ]),
    vertexShader: Ot.meshmatcap_vert,
    fragmentShader: Ot.meshmatcap_frag
  },
  points: {
    uniforms: /* @__PURE__ */ Re([
      st.points,
      st.fog
    ]),
    vertexShader: Ot.points_vert,
    fragmentShader: Ot.points_frag
  },
  dashed: {
    uniforms: /* @__PURE__ */ Re([
      st.common,
      st.fog,
      {
        scale: { value: 1 },
        dashSize: { value: 1 },
        totalSize: { value: 2 }
      }
    ]),
    vertexShader: Ot.linedashed_vert,
    fragmentShader: Ot.linedashed_frag
  },
  depth: {
    uniforms: /* @__PURE__ */ Re([
      st.common,
      st.displacementmap
    ]),
    vertexShader: Ot.depth_vert,
    fragmentShader: Ot.depth_frag
  },
  normal: {
    uniforms: /* @__PURE__ */ Re([
      st.common,
      st.bumpmap,
      st.normalmap,
      st.displacementmap,
      {
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Ot.meshnormal_vert,
    fragmentShader: Ot.meshnormal_frag
  },
  sprite: {
    uniforms: /* @__PURE__ */ Re([
      st.sprite,
      st.fog
    ]),
    vertexShader: Ot.sprite_vert,
    fragmentShader: Ot.sprite_frag
  },
  background: {
    uniforms: {
      uvTransform: { value: /* @__PURE__ */ new Nt() },
      t2D: { value: null },
      backgroundIntensity: { value: 1 }
    },
    vertexShader: Ot.background_vert,
    fragmentShader: Ot.background_frag
  },
  backgroundCube: {
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 },
      backgroundBlurriness: { value: 0 },
      backgroundIntensity: { value: 1 },
      backgroundRotation: { value: /* @__PURE__ */ new Nt() }
    },
    vertexShader: Ot.backgroundCube_vert,
    fragmentShader: Ot.backgroundCube_frag
  },
  cube: {
    uniforms: {
      tCube: { value: null },
      tFlip: { value: -1 },
      opacity: { value: 1 }
    },
    vertexShader: Ot.cube_vert,
    fragmentShader: Ot.cube_frag
  },
  equirect: {
    uniforms: {
      tEquirect: { value: null }
    },
    vertexShader: Ot.equirect_vert,
    fragmentShader: Ot.equirect_frag
  },
  distanceRGBA: {
    uniforms: /* @__PURE__ */ Re([
      st.common,
      st.displacementmap,
      {
        referencePosition: { value: /* @__PURE__ */ new I() },
        nearDistance: { value: 1 },
        farDistance: { value: 1e3 }
      }
    ]),
    vertexShader: Ot.distanceRGBA_vert,
    fragmentShader: Ot.distanceRGBA_frag
  },
  shadow: {
    uniforms: /* @__PURE__ */ Re([
      st.lights,
      st.fog,
      {
        color: { value: /* @__PURE__ */ new Xt(0) },
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Ot.shadow_vert,
    fragmentShader: Ot.shadow_frag
  }
};
en.physical = {
  uniforms: /* @__PURE__ */ Re([
    en.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: /* @__PURE__ */ new Nt() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: /* @__PURE__ */ new Nt() },
      clearcoatNormalScale: { value: /* @__PURE__ */ new Dt(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new Nt() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: /* @__PURE__ */ new Nt() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new Nt() },
      sheen: { value: 0 },
      sheenColor: { value: /* @__PURE__ */ new Xt(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: /* @__PURE__ */ new Nt() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: /* @__PURE__ */ new Nt() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: /* @__PURE__ */ new Nt() },
      transmissionSamplerSize: { value: /* @__PURE__ */ new Dt() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: /* @__PURE__ */ new Nt() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: /* @__PURE__ */ new Xt(0) },
      specularColor: { value: /* @__PURE__ */ new Xt(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: /* @__PURE__ */ new Nt() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: /* @__PURE__ */ new Nt() },
      anisotropyVector: { value: /* @__PURE__ */ new Dt() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: /* @__PURE__ */ new Nt() }
    }
  ]),
  vertexShader: Ot.meshphysical_vert,
  fragmentShader: Ot.meshphysical_frag
};
const Lr = { r: 0, b: 0, g: 0 }, Yn = /* @__PURE__ */ new hn(), Cf = /* @__PURE__ */ new se();
function Pf(i, t, e, n, r, s, a) {
  const o = new Xt(0);
  let l = s === !0 ? 0 : 1, c, u, d = null, f = 0, m = null;
  function _(T) {
    let M = T.isScene === !0 ? T.background : null;
    return M && M.isTexture && (M = (T.backgroundBlurriness > 0 ? e : t).get(M)), M;
  }
  function v(T) {
    let M = !1;
    const R = _(T);
    R === null ? h(o, l) : R && R.isColor && (h(R, 1), M = !0);
    const C = i.xr.getEnvironmentBlendMode();
    C === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, a) : C === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, a), (i.autoClear || M) && (n.buffers.depth.setTest(!0), n.buffers.depth.setMask(!0), n.buffers.color.setMask(!0), i.clear(i.autoClearColor, i.autoClearDepth, i.autoClearStencil));
  }
  function p(T, M) {
    const R = _(M);
    R && (R.isCubeTexture || R.mapping === qr) ? (u === void 0 && (u = new Ze(
      new Bi(1, 1, 1),
      new kn({
        name: "BackgroundCubeMaterial",
        uniforms: Ni(en.backgroundCube.uniforms),
        vertexShader: en.backgroundCube.vertexShader,
        fragmentShader: en.backgroundCube.fragmentShader,
        side: Ne,
        depthTest: !1,
        depthWrite: !1,
        fog: !1,
        allowOverride: !1
      })
    ), u.geometry.deleteAttribute("normal"), u.geometry.deleteAttribute("uv"), u.onBeforeRender = function(C, w, N) {
      this.matrixWorld.copyPosition(N.matrixWorld);
    }, Object.defineProperty(u.material, "envMap", {
      get: function() {
        return this.uniforms.envMap.value;
      }
    }), r.update(u)), Yn.copy(M.backgroundRotation), Yn.x *= -1, Yn.y *= -1, Yn.z *= -1, R.isCubeTexture && R.isRenderTargetTexture === !1 && (Yn.y *= -1, Yn.z *= -1), u.material.uniforms.envMap.value = R, u.material.uniforms.flipEnvMap.value = R.isCubeTexture && R.isRenderTargetTexture === !1 ? -1 : 1, u.material.uniforms.backgroundBlurriness.value = M.backgroundBlurriness, u.material.uniforms.backgroundIntensity.value = M.backgroundIntensity, u.material.uniforms.backgroundRotation.value.setFromMatrix4(Cf.makeRotationFromEuler(Yn)), u.material.toneMapped = $t.getTransfer(R.colorSpace) !== te, (d !== R || f !== R.version || m !== i.toneMapping) && (u.material.needsUpdate = !0, d = R, f = R.version, m = i.toneMapping), u.layers.enableAll(), T.unshift(u, u.geometry, u.material, 0, 0, null)) : R && R.isTexture && (c === void 0 && (c = new Ze(
      new ar(2, 2),
      new kn({
        name: "BackgroundMaterial",
        uniforms: Ni(en.background.uniforms),
        vertexShader: en.background.vertexShader,
        fragmentShader: en.background.fragmentShader,
        side: Bn,
        depthTest: !1,
        depthWrite: !1,
        fog: !1,
        allowOverride: !1
      })
    ), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", {
      get: function() {
        return this.uniforms.t2D.value;
      }
    }), r.update(c)), c.material.uniforms.t2D.value = R, c.material.uniforms.backgroundIntensity.value = M.backgroundIntensity, c.material.toneMapped = $t.getTransfer(R.colorSpace) !== te, R.matrixAutoUpdate === !0 && R.updateMatrix(), c.material.uniforms.uvTransform.value.copy(R.matrix), (d !== R || f !== R.version || m !== i.toneMapping) && (c.material.needsUpdate = !0, d = R, f = R.version, m = i.toneMapping), c.layers.enableAll(), T.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function h(T, M) {
    T.getRGB(Lr, wl(i)), n.buffers.color.setClear(Lr.r, Lr.g, Lr.b, M, a);
  }
  function b() {
    u !== void 0 && (u.geometry.dispose(), u.material.dispose(), u = void 0), c !== void 0 && (c.geometry.dispose(), c.material.dispose(), c = void 0);
  }
  return {
    getClearColor: function() {
      return o;
    },
    setClearColor: function(T, M = 1) {
      o.set(T), l = M, h(o, l);
    },
    getClearAlpha: function() {
      return l;
    },
    setClearAlpha: function(T) {
      l = T, h(o, l);
    },
    render: v,
    addToRenderList: p,
    dispose: b
  };
}
function Df(i, t) {
  const e = i.getParameter(i.MAX_VERTEX_ATTRIBS), n = {}, r = f(null);
  let s = r, a = !1;
  function o(S, D, O, H, $) {
    let W = !1;
    const Y = d(H, O, D);
    s !== Y && (s = Y, c(s.object)), W = m(S, H, O, $), W && _(S, H, O, $), $ !== null && t.update($, i.ELEMENT_ARRAY_BUFFER), (W || a) && (a = !1, M(S, D, O, H), $ !== null && i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, t.get($).buffer));
  }
  function l() {
    return i.createVertexArray();
  }
  function c(S) {
    return i.bindVertexArray(S);
  }
  function u(S) {
    return i.deleteVertexArray(S);
  }
  function d(S, D, O) {
    const H = O.wireframe === !0;
    let $ = n[S.id];
    $ === void 0 && ($ = {}, n[S.id] = $);
    let W = $[D.id];
    W === void 0 && (W = {}, $[D.id] = W);
    let Y = W[H];
    return Y === void 0 && (Y = f(l()), W[H] = Y), Y;
  }
  function f(S) {
    const D = [], O = [], H = [];
    for (let $ = 0; $ < e; $++)
      D[$] = 0, O[$] = 0, H[$] = 0;
    return {
      // for backward compatibility on non-VAO support browser
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: D,
      enabledAttributes: O,
      attributeDivisors: H,
      object: S,
      attributes: {},
      index: null
    };
  }
  function m(S, D, O, H) {
    const $ = s.attributes, W = D.attributes;
    let Y = 0;
    const j = O.getAttributes();
    for (const z in j)
      if (j[z].location >= 0) {
        const ct = $[z];
        let St = W[z];
        if (St === void 0 && (z === "instanceMatrix" && S.instanceMatrix && (St = S.instanceMatrix), z === "instanceColor" && S.instanceColor && (St = S.instanceColor)), ct === void 0 || ct.attribute !== St || St && ct.data !== St.data) return !0;
        Y++;
      }
    return s.attributesNum !== Y || s.index !== H;
  }
  function _(S, D, O, H) {
    const $ = {}, W = D.attributes;
    let Y = 0;
    const j = O.getAttributes();
    for (const z in j)
      if (j[z].location >= 0) {
        let ct = W[z];
        ct === void 0 && (z === "instanceMatrix" && S.instanceMatrix && (ct = S.instanceMatrix), z === "instanceColor" && S.instanceColor && (ct = S.instanceColor));
        const St = {};
        St.attribute = ct, ct && ct.data && (St.data = ct.data), $[z] = St, Y++;
      }
    s.attributes = $, s.attributesNum = Y, s.index = H;
  }
  function v() {
    const S = s.newAttributes;
    for (let D = 0, O = S.length; D < O; D++)
      S[D] = 0;
  }
  function p(S) {
    h(S, 0);
  }
  function h(S, D) {
    const O = s.newAttributes, H = s.enabledAttributes, $ = s.attributeDivisors;
    O[S] = 1, H[S] === 0 && (i.enableVertexAttribArray(S), H[S] = 1), $[S] !== D && (i.vertexAttribDivisor(S, D), $[S] = D);
  }
  function b() {
    const S = s.newAttributes, D = s.enabledAttributes;
    for (let O = 0, H = D.length; O < H; O++)
      D[O] !== S[O] && (i.disableVertexAttribArray(O), D[O] = 0);
  }
  function T(S, D, O, H, $, W, Y) {
    Y === !0 ? i.vertexAttribIPointer(S, D, O, $, W) : i.vertexAttribPointer(S, D, O, H, $, W);
  }
  function M(S, D, O, H) {
    v();
    const $ = H.attributes, W = O.getAttributes(), Y = D.defaultAttributeValues;
    for (const j in W) {
      const z = W[j];
      if (z.location >= 0) {
        let rt = $[j];
        if (rt === void 0 && (j === "instanceMatrix" && S.instanceMatrix && (rt = S.instanceMatrix), j === "instanceColor" && S.instanceColor && (rt = S.instanceColor)), rt !== void 0) {
          const ct = rt.normalized, St = rt.itemSize, Bt = t.get(rt);
          if (Bt === void 0) continue;
          const zt = Bt.buffer, Yt = Bt.type, jt = Bt.bytesPerElement, X = Yt === i.INT || Yt === i.UNSIGNED_INT || rt.gpuType === Ta;
          if (rt.isInterleavedBufferAttribute) {
            const K = rt.data, ft = K.stride, Pt = rt.offset;
            if (K.isInstancedInterleavedBuffer) {
              for (let yt = 0; yt < z.locationSize; yt++)
                h(z.location + yt, K.meshPerAttribute);
              S.isInstancedMesh !== !0 && H._maxInstanceCount === void 0 && (H._maxInstanceCount = K.meshPerAttribute * K.count);
            } else
              for (let yt = 0; yt < z.locationSize; yt++)
                p(z.location + yt);
            i.bindBuffer(i.ARRAY_BUFFER, zt);
            for (let yt = 0; yt < z.locationSize; yt++)
              T(
                z.location + yt,
                St / z.locationSize,
                Yt,
                ct,
                ft * jt,
                (Pt + St / z.locationSize * yt) * jt,
                X
              );
          } else {
            if (rt.isInstancedBufferAttribute) {
              for (let K = 0; K < z.locationSize; K++)
                h(z.location + K, rt.meshPerAttribute);
              S.isInstancedMesh !== !0 && H._maxInstanceCount === void 0 && (H._maxInstanceCount = rt.meshPerAttribute * rt.count);
            } else
              for (let K = 0; K < z.locationSize; K++)
                p(z.location + K);
            i.bindBuffer(i.ARRAY_BUFFER, zt);
            for (let K = 0; K < z.locationSize; K++)
              T(
                z.location + K,
                St / z.locationSize,
                Yt,
                ct,
                St * jt,
                St / z.locationSize * K * jt,
                X
              );
          }
        } else if (Y !== void 0) {
          const ct = Y[j];
          if (ct !== void 0)
            switch (ct.length) {
              case 2:
                i.vertexAttrib2fv(z.location, ct);
                break;
              case 3:
                i.vertexAttrib3fv(z.location, ct);
                break;
              case 4:
                i.vertexAttrib4fv(z.location, ct);
                break;
              default:
                i.vertexAttrib1fv(z.location, ct);
            }
        }
      }
    }
    b();
  }
  function R() {
    N();
    for (const S in n) {
      const D = n[S];
      for (const O in D) {
        const H = D[O];
        for (const $ in H)
          u(H[$].object), delete H[$];
        delete D[O];
      }
      delete n[S];
    }
  }
  function C(S) {
    if (n[S.id] === void 0) return;
    const D = n[S.id];
    for (const O in D) {
      const H = D[O];
      for (const $ in H)
        u(H[$].object), delete H[$];
      delete D[O];
    }
    delete n[S.id];
  }
  function w(S) {
    for (const D in n) {
      const O = n[D];
      if (O[S.id] === void 0) continue;
      const H = O[S.id];
      for (const $ in H)
        u(H[$].object), delete H[$];
      delete O[S.id];
    }
  }
  function N() {
    E(), a = !0, s !== r && (s = r, c(s.object));
  }
  function E() {
    r.geometry = null, r.program = null, r.wireframe = !1;
  }
  return {
    setup: o,
    reset: N,
    resetDefaultState: E,
    dispose: R,
    releaseStatesOfGeometry: C,
    releaseStatesOfProgram: w,
    initAttributes: v,
    enableAttribute: p,
    disableUnusedAttributes: b
  };
}
function Lf(i, t, e) {
  let n;
  function r(c) {
    n = c;
  }
  function s(c, u) {
    i.drawArrays(n, c, u), e.update(u, n, 1);
  }
  function a(c, u, d) {
    d !== 0 && (i.drawArraysInstanced(n, c, u, d), e.update(u, n, d));
  }
  function o(c, u, d) {
    if (d === 0) return;
    t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, c, 0, u, 0, d);
    let m = 0;
    for (let _ = 0; _ < d; _++)
      m += u[_];
    e.update(m, n, 1);
  }
  function l(c, u, d, f) {
    if (d === 0) return;
    const m = t.get("WEBGL_multi_draw");
    if (m === null)
      for (let _ = 0; _ < c.length; _++)
        a(c[_], u[_], f[_]);
    else {
      m.multiDrawArraysInstancedWEBGL(n, c, 0, u, 0, f, 0, d);
      let _ = 0;
      for (let v = 0; v < d; v++)
        _ += u[v] * f[v];
      e.update(_, n, 1);
    }
  }
  this.setMode = r, this.render = s, this.renderInstances = a, this.renderMultiDraw = o, this.renderMultiDrawInstances = l;
}
function If(i, t, e, n) {
  let r;
  function s() {
    if (r !== void 0) return r;
    if (t.has("EXT_texture_filter_anisotropic") === !0) {
      const w = t.get("EXT_texture_filter_anisotropic");
      r = i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else
      r = 0;
    return r;
  }
  function a(w) {
    return !(w !== Ke && n.convert(w) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function o(w) {
    const N = w === rr && (t.has("EXT_color_buffer_half_float") || t.has("EXT_color_buffer_float"));
    return !(w !== cn && n.convert(w) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
    w !== Sn && !N);
  }
  function l(w) {
    if (w === "highp") {
      if (i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.HIGH_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.HIGH_FLOAT).precision > 0)
        return "highp";
      w = "mediump";
    }
    return w === "mediump" && i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.MEDIUM_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
  }
  let c = e.precision !== void 0 ? e.precision : "highp";
  const u = l(c);
  u !== c && (console.warn("THREE.WebGLRenderer:", c, "not supported, using", u, "instead."), c = u);
  const d = e.logarithmicDepthBuffer === !0, f = e.reversedDepthBuffer === !0 && t.has("EXT_clip_control"), m = i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS), _ = i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS), v = i.getParameter(i.MAX_TEXTURE_SIZE), p = i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE), h = i.getParameter(i.MAX_VERTEX_ATTRIBS), b = i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS), T = i.getParameter(i.MAX_VARYING_VECTORS), M = i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS), R = _ > 0, C = i.getParameter(i.MAX_SAMPLES);
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
    maxTextures: m,
    maxVertexTextures: _,
    maxTextureSize: v,
    maxCubemapSize: p,
    maxAttributes: h,
    maxVertexUniforms: b,
    maxVaryings: T,
    maxFragmentUniforms: M,
    vertexTextures: R,
    maxSamples: C
  };
}
function Uf(i) {
  const t = this;
  let e = null, n = 0, r = !1, s = !1;
  const a = new xn(), o = new Nt(), l = { value: null, needsUpdate: !1 };
  this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(d, f) {
    const m = d.length !== 0 || f || // enable state of previous frame - the clipping code has to
    // run another frame in order to reset the state:
    n !== 0 || r;
    return r = f, n = d.length, m;
  }, this.beginShadows = function() {
    s = !0, u(null);
  }, this.endShadows = function() {
    s = !1;
  }, this.setGlobalState = function(d, f) {
    e = u(d, f, 0);
  }, this.setState = function(d, f, m) {
    const _ = d.clippingPlanes, v = d.clipIntersection, p = d.clipShadows, h = i.get(d);
    if (!r || _ === null || _.length === 0 || s && !p)
      s ? u(null) : c();
    else {
      const b = s ? 0 : n, T = b * 4;
      let M = h.clippingState || null;
      l.value = M, M = u(_, f, T, m);
      for (let R = 0; R !== T; ++R)
        M[R] = e[R];
      h.clippingState = M, this.numIntersection = v ? this.numPlanes : 0, this.numPlanes += b;
    }
  };
  function c() {
    l.value !== e && (l.value = e, l.needsUpdate = n > 0), t.numPlanes = n, t.numIntersection = 0;
  }
  function u(d, f, m, _) {
    const v = d !== null ? d.length : 0;
    let p = null;
    if (v !== 0) {
      if (p = l.value, _ !== !0 || p === null) {
        const h = m + v * 4, b = f.matrixWorldInverse;
        o.getNormalMatrix(b), (p === null || p.length < h) && (p = new Float32Array(h));
        for (let T = 0, M = m; T !== v; ++T, M += 4)
          a.copy(d[T]).applyMatrix4(b, o), a.normal.toArray(p, M), p[M + 3] = a.constant;
      }
      l.value = p, l.needsUpdate = !0;
    }
    return t.numPlanes = v, t.numIntersection = 0, p;
  }
}
function Nf(i) {
  let t = /* @__PURE__ */ new WeakMap();
  function e(a, o) {
    return o === Vs ? a.mapping = Li : o === Gs && (a.mapping = Ii), a;
  }
  function n(a) {
    if (a && a.isTexture) {
      const o = a.mapping;
      if (o === Vs || o === Gs)
        if (t.has(a)) {
          const l = t.get(a).texture;
          return e(l, a.mapping);
        } else {
          const l = a.image;
          if (l && l.height > 0) {
            const c = new Ph(l.height);
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
const yi = 4, Lo = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], Kn = 20, Ts = /* @__PURE__ */ new Il(), Io = /* @__PURE__ */ new Xt();
let As = null, ws = 0, Rs = 0, Cs = !1;
const $n = (1 + Math.sqrt(5)) / 2, vi = 1 / $n, Uo = [
  /* @__PURE__ */ new I(-$n, vi, 0),
  /* @__PURE__ */ new I($n, vi, 0),
  /* @__PURE__ */ new I(-vi, 0, $n),
  /* @__PURE__ */ new I(vi, 0, $n),
  /* @__PURE__ */ new I(0, $n, -vi),
  /* @__PURE__ */ new I(0, $n, vi),
  /* @__PURE__ */ new I(-1, 1, -1),
  /* @__PURE__ */ new I(1, 1, -1),
  /* @__PURE__ */ new I(-1, 1, 1),
  /* @__PURE__ */ new I(1, 1, 1)
], Ff = /* @__PURE__ */ new I();
class No {
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
      position: o = Ff
    } = s;
    As = this._renderer.getRenderTarget(), ws = this._renderer.getActiveCubeFace(), Rs = this._renderer.getActiveMipmapLevel(), Cs = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(a);
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
    this._cubemapMaterial === null && (this._cubemapMaterial = Bo(), this._compileMaterial(this._cubemapMaterial));
  }
  /**
   * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = Oo(), this._compileMaterial(this._equirectMaterial));
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
    this._renderer.setRenderTarget(As, ws, Rs), this._renderer.xr.enabled = Cs, t.scissorTest = !1, Ir(t, 0, 0, t.width, t.height);
  }
  _fromTexture(t, e) {
    t.mapping === Li || t.mapping === Ii ? this._setSize(t.image.length === 0 ? 16 : t.image[0].width || t.image[0].image.width) : this._setSize(t.image.width / 4), As = this._renderer.getRenderTarget(), ws = this._renderer.getActiveCubeFace(), Rs = this._renderer.getActiveMipmapLevel(), Cs = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
    const n = e || this._allocateTargets();
    return this._textureToCubeUV(t, n), this._applyPMREM(n), this._cleanup(n), n;
  }
  _allocateTargets() {
    const t = 3 * Math.max(this._cubeSize, 112), e = 4 * this._cubeSize, n = {
      magFilter: nn,
      minFilter: nn,
      generateMipmaps: !1,
      type: rr,
      format: Ke,
      colorSpace: Ui,
      depthBuffer: !1
    }, r = Fo(t, e, n);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== t || this._pingPongRenderTarget.height !== e) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = Fo(t, e, n);
      const { _lodMax: s } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = Of(s)), this._blurMaterial = Bf(s, t, e);
    }
    return r;
  }
  _compileMaterial(t) {
    const e = new Ze(this._lodPlanes[0], t);
    this._renderer.compile(e, Ts);
  }
  _sceneToCubeUV(t, e, n, r, s) {
    const l = new We(90, 1, e, n), c = [1, -1, 1, 1, 1, 1], u = [1, 1, 1, -1, -1, -1], d = this._renderer, f = d.autoClear, m = d.toneMapping;
    d.getClearColor(Io), d.toneMapping = Fn, d.autoClear = !1, d.state.buffers.depth.getReversed() && (d.setRenderTarget(r), d.clearDepth(), d.setRenderTarget(null));
    const v = new Ua({
      name: "PMREM.Background",
      side: Ne,
      depthWrite: !1,
      depthTest: !1
    }), p = new Ze(new Bi(), v);
    let h = !1;
    const b = t.background;
    b ? b.isColor && (v.color.copy(b), t.background = null, h = !0) : (v.color.copy(Io), h = !0);
    for (let T = 0; T < 6; T++) {
      const M = T % 3;
      M === 0 ? (l.up.set(0, c[T], 0), l.position.set(s.x, s.y, s.z), l.lookAt(s.x + u[T], s.y, s.z)) : M === 1 ? (l.up.set(0, 0, c[T]), l.position.set(s.x, s.y, s.z), l.lookAt(s.x, s.y + u[T], s.z)) : (l.up.set(0, c[T], 0), l.position.set(s.x, s.y, s.z), l.lookAt(s.x, s.y, s.z + u[T]));
      const R = this._cubeSize;
      Ir(r, M * R, T > 2 ? R : 0, R, R), d.setRenderTarget(r), h && d.render(p, l), d.render(t, l);
    }
    p.geometry.dispose(), p.material.dispose(), d.toneMapping = m, d.autoClear = f, t.background = b;
  }
  _textureToCubeUV(t, e) {
    const n = this._renderer, r = t.mapping === Li || t.mapping === Ii;
    r ? (this._cubemapMaterial === null && (this._cubemapMaterial = Bo()), this._cubemapMaterial.uniforms.flipEnvMap.value = t.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = Oo());
    const s = r ? this._cubemapMaterial : this._equirectMaterial, a = new Ze(this._lodPlanes[0], s), o = s.uniforms;
    o.envMap.value = t;
    const l = this._cubeSize;
    Ir(e, 0, 0, 3 * l, 2 * l), n.setRenderTarget(e), n.render(a, Ts);
  }
  _applyPMREM(t) {
    const e = this._renderer, n = e.autoClear;
    e.autoClear = !1;
    const r = this._lodPlanes.length;
    for (let s = 1; s < r; s++) {
      const a = Math.sqrt(this._sigmas[s] * this._sigmas[s] - this._sigmas[s - 1] * this._sigmas[s - 1]), o = Uo[(r - s - 1) % Uo.length];
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
    const u = 3, d = new Ze(this._lodPlanes[r], c), f = c.uniforms, m = this._sizeLods[n] - 1, _ = isFinite(s) ? Math.PI / (2 * m) : 2 * Math.PI / (2 * Kn - 1), v = s / _, p = isFinite(s) ? 1 + Math.floor(u * v) : Kn;
    p > Kn && console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Kn}`);
    const h = [];
    let b = 0;
    for (let w = 0; w < Kn; ++w) {
      const N = w / v, E = Math.exp(-N * N / 2);
      h.push(E), w === 0 ? b += E : w < p && (b += 2 * E);
    }
    for (let w = 0; w < h.length; w++)
      h[w] = h[w] / b;
    f.envMap.value = t.texture, f.samples.value = p, f.weights.value = h, f.latitudinal.value = a === "latitudinal", o && (f.poleAxis.value = o);
    const { _lodMax: T } = this;
    f.dTheta.value = _, f.mipInt.value = T - n;
    const M = this._sizeLods[r], R = 3 * M * (r > T - yi ? r - T + yi : 0), C = 4 * (this._cubeSize - M);
    Ir(e, R, C, 3 * M, 2 * M), l.setRenderTarget(e), l.render(d, Ts);
  }
}
function Of(i) {
  const t = [], e = [], n = [];
  let r = i;
  const s = i - yi + 1 + Lo.length;
  for (let a = 0; a < s; a++) {
    const o = Math.pow(2, r);
    e.push(o);
    let l = 1 / o;
    a > i - yi ? l = Lo[a - i + yi - 1] : a === 0 && (l = 0), n.push(l);
    const c = 1 / (o - 2), u = -c, d = 1 + c, f = [u, u, d, u, d, d, u, u, d, d, u, d], m = 6, _ = 6, v = 3, p = 2, h = 1, b = new Float32Array(v * _ * m), T = new Float32Array(p * _ * m), M = new Float32Array(h * _ * m);
    for (let C = 0; C < m; C++) {
      const w = C % 3 * 2 / 3 - 1, N = C > 2 ? 0 : -1, E = [
        w,
        N,
        0,
        w + 2 / 3,
        N,
        0,
        w + 2 / 3,
        N + 1,
        0,
        w,
        N,
        0,
        w + 2 / 3,
        N + 1,
        0,
        w,
        N + 1,
        0
      ];
      b.set(E, v * _ * C), T.set(f, p * _ * C);
      const S = [C, C, C, C, C, C];
      M.set(S, h * _ * C);
    }
    const R = new dn();
    R.setAttribute("position", new an(b, v)), R.setAttribute("uv", new an(T, p)), R.setAttribute("faceIndex", new an(M, h)), t.push(R), r > yi && r--;
  }
  return { lodPlanes: t, sizeLods: e, sigmas: n };
}
function Fo(i, t, e) {
  const n = new ni(i, t, e);
  return n.texture.mapping = qr, n.texture.name = "PMREM.cubeUv", n.scissorTest = !0, n;
}
function Ir(i, t, e, n, r) {
  i.viewport.set(t, e, n, r), i.scissor.set(t, e, n, r);
}
function Bf(i, t, e) {
  const n = new Float32Array(Kn), r = new I(0, 1, 0);
  return new kn({
    name: "SphericalGaussianBlur",
    defines: {
      n: Kn,
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
    vertexShader: Fa(),
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
    blending: Nn,
    depthTest: !1,
    depthWrite: !1
  });
}
function Oo() {
  return new kn({
    name: "EquirectangularToCubeUV",
    uniforms: {
      envMap: { value: null }
    },
    vertexShader: Fa(),
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
    blending: Nn,
    depthTest: !1,
    depthWrite: !1
  });
}
function Bo() {
  return new kn({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: Fa(),
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
    blending: Nn,
    depthTest: !1,
    depthWrite: !1
  });
}
function Fa() {
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
function kf(i) {
  let t = /* @__PURE__ */ new WeakMap(), e = null;
  function n(o) {
    if (o && o.isTexture) {
      const l = o.mapping, c = l === Vs || l === Gs, u = l === Li || l === Ii;
      if (c || u) {
        let d = t.get(o);
        const f = d !== void 0 ? d.texture.pmremVersion : 0;
        if (o.isRenderTargetTexture && o.pmremVersion !== f)
          return e === null && (e = new No(i)), d = c ? e.fromEquirectangular(o, d) : e.fromCubemap(o, d), d.texture.pmremVersion = o.pmremVersion, t.set(o, d), d.texture;
        if (d !== void 0)
          return d.texture;
        {
          const m = o.image;
          return c && m && m.height > 0 || u && m && r(m) ? (e === null && (e = new No(i)), d = c ? e.fromEquirectangular(o) : e.fromCubemap(o), d.texture.pmremVersion = o.pmremVersion, t.set(o, d), o.addEventListener("dispose", s), d.texture) : null;
        }
      }
    }
    return o;
  }
  function r(o) {
    let l = 0;
    const c = 6;
    for (let u = 0; u < c; u++)
      o[u] !== void 0 && l++;
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
function zf(i) {
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
      return r === null && ir("THREE.WebGLRenderer: " + n + " extension not supported."), r;
    }
  };
}
function Hf(i, t, e, n) {
  const r = {}, s = /* @__PURE__ */ new WeakMap();
  function a(d) {
    const f = d.target;
    f.index !== null && t.remove(f.index);
    for (const _ in f.attributes)
      t.remove(f.attributes[_]);
    f.removeEventListener("dispose", a), delete r[f.id];
    const m = s.get(f);
    m && (t.remove(m), s.delete(f)), n.releaseStatesOfGeometry(f), f.isInstancedBufferGeometry === !0 && delete f._maxInstanceCount, e.memory.geometries--;
  }
  function o(d, f) {
    return r[f.id] === !0 || (f.addEventListener("dispose", a), r[f.id] = !0, e.memory.geometries++), f;
  }
  function l(d) {
    const f = d.attributes;
    for (const m in f)
      t.update(f[m], i.ARRAY_BUFFER);
  }
  function c(d) {
    const f = [], m = d.index, _ = d.attributes.position;
    let v = 0;
    if (m !== null) {
      const b = m.array;
      v = m.version;
      for (let T = 0, M = b.length; T < M; T += 3) {
        const R = b[T + 0], C = b[T + 1], w = b[T + 2];
        f.push(R, C, C, w, w, R);
      }
    } else if (_ !== void 0) {
      const b = _.array;
      v = _.version;
      for (let T = 0, M = b.length / 3 - 1; T < M; T += 3) {
        const R = T + 0, C = T + 1, w = T + 2;
        f.push(R, C, C, w, w, R);
      }
    } else
      return;
    const p = new (El(f) ? Al : Tl)(f, 1);
    p.version = v;
    const h = s.get(d);
    h && t.remove(h), s.set(d, p);
  }
  function u(d) {
    const f = s.get(d);
    if (f) {
      const m = d.index;
      m !== null && f.version < m.version && c(d);
    } else
      c(d);
    return s.get(d);
  }
  return {
    get: o,
    update: l,
    getWireframeAttribute: u
  };
}
function Vf(i, t, e) {
  let n;
  function r(f) {
    n = f;
  }
  let s, a;
  function o(f) {
    s = f.type, a = f.bytesPerElement;
  }
  function l(f, m) {
    i.drawElements(n, m, s, f * a), e.update(m, n, 1);
  }
  function c(f, m, _) {
    _ !== 0 && (i.drawElementsInstanced(n, m, s, f * a, _), e.update(m, n, _));
  }
  function u(f, m, _) {
    if (_ === 0) return;
    t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, m, 0, s, f, 0, _);
    let p = 0;
    for (let h = 0; h < _; h++)
      p += m[h];
    e.update(p, n, 1);
  }
  function d(f, m, _, v) {
    if (_ === 0) return;
    const p = t.get("WEBGL_multi_draw");
    if (p === null)
      for (let h = 0; h < f.length; h++)
        c(f[h] / a, m[h], v[h]);
    else {
      p.multiDrawElementsInstancedWEBGL(n, m, 0, s, f, 0, v, 0, _);
      let h = 0;
      for (let b = 0; b < _; b++)
        h += m[b] * v[b];
      e.update(h, n, 1);
    }
  }
  this.setMode = r, this.setIndex = o, this.render = l, this.renderInstances = c, this.renderMultiDraw = u, this.renderMultiDrawInstances = d;
}
function Gf(i) {
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
function Wf(i, t, e) {
  const n = /* @__PURE__ */ new WeakMap(), r = new ue();
  function s(a, o, l) {
    const c = a.morphTargetInfluences, u = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, d = u !== void 0 ? u.length : 0;
    let f = n.get(o);
    if (f === void 0 || f.count !== d) {
      let S = function() {
        N.dispose(), n.delete(o), o.removeEventListener("dispose", S);
      };
      var m = S;
      f !== void 0 && f.texture.dispose();
      const _ = o.morphAttributes.position !== void 0, v = o.morphAttributes.normal !== void 0, p = o.morphAttributes.color !== void 0, h = o.morphAttributes.position || [], b = o.morphAttributes.normal || [], T = o.morphAttributes.color || [];
      let M = 0;
      _ === !0 && (M = 1), v === !0 && (M = 2), p === !0 && (M = 3);
      let R = o.attributes.position.count * M, C = 1;
      R > t.maxTextureSize && (C = Math.ceil(R / t.maxTextureSize), R = t.maxTextureSize);
      const w = new Float32Array(R * C * 4 * d), N = new yl(w, R, C, d);
      N.type = Sn, N.needsUpdate = !0;
      const E = M * 4;
      for (let D = 0; D < d; D++) {
        const O = h[D], H = b[D], $ = T[D], W = R * C * 4 * D;
        for (let Y = 0; Y < O.count; Y++) {
          const j = Y * E;
          _ === !0 && (r.fromBufferAttribute(O, Y), w[W + j + 0] = r.x, w[W + j + 1] = r.y, w[W + j + 2] = r.z, w[W + j + 3] = 0), v === !0 && (r.fromBufferAttribute(H, Y), w[W + j + 4] = r.x, w[W + j + 5] = r.y, w[W + j + 6] = r.z, w[W + j + 7] = 0), p === !0 && (r.fromBufferAttribute($, Y), w[W + j + 8] = r.x, w[W + j + 9] = r.y, w[W + j + 10] = r.z, w[W + j + 11] = $.itemSize === 4 ? r.w : 1);
        }
      }
      f = {
        count: d,
        texture: N,
        size: new Dt(R, C)
      }, n.set(o, f), o.addEventListener("dispose", S);
    }
    if (a.isInstancedMesh === !0 && a.morphTexture !== null)
      l.getUniforms().setValue(i, "morphTexture", a.morphTexture, e);
    else {
      let _ = 0;
      for (let p = 0; p < c.length; p++)
        _ += c[p];
      const v = o.morphTargetsRelative ? 1 : 1 - _;
      l.getUniforms().setValue(i, "morphTargetBaseInfluence", v), l.getUniforms().setValue(i, "morphTargetInfluences", c);
    }
    l.getUniforms().setValue(i, "morphTargetsTexture", f.texture, e), l.getUniforms().setValue(i, "morphTargetsTextureSize", f.size);
  }
  return {
    update: s
  };
}
function Xf(i, t, e, n) {
  let r = /* @__PURE__ */ new WeakMap();
  function s(l) {
    const c = n.render.frame, u = l.geometry, d = t.get(l, u);
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
const Nl = /* @__PURE__ */ new Ce(), ko = /* @__PURE__ */ new Pl(1, 1), Fl = /* @__PURE__ */ new yl(), Ol = /* @__PURE__ */ new fh(), Bl = /* @__PURE__ */ new Cl(), zo = [], Ho = [], Vo = new Float32Array(16), Go = new Float32Array(9), Wo = new Float32Array(4);
function ki(i, t, e) {
  const n = i[0];
  if (n <= 0 || n > 0) return i;
  const r = t * e;
  let s = zo[r];
  if (s === void 0 && (s = new Float32Array(r), zo[r] = s), t !== 0) {
    n.toArray(s, 0);
    for (let a = 1, o = 0; a !== t; ++a)
      o += e, i[a].toArray(s, o);
  }
  return s;
}
function ve(i, t) {
  if (i.length !== t.length) return !1;
  for (let e = 0, n = i.length; e < n; e++)
    if (i[e] !== t[e]) return !1;
  return !0;
}
function xe(i, t) {
  for (let e = 0, n = t.length; e < n; e++)
    i[e] = t[e];
}
function Kr(i, t) {
  let e = Ho[t];
  e === void 0 && (e = new Int32Array(t), Ho[t] = e);
  for (let n = 0; n !== t; ++n)
    e[n] = i.allocateTextureUnit();
  return e;
}
function Yf(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1f(this.addr, t), e[0] = t);
}
function qf(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) && (i.uniform2f(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (ve(e, t)) return;
    i.uniform2fv(this.addr, t), xe(e, t);
  }
}
function $f(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3f(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else if (t.r !== void 0)
    (e[0] !== t.r || e[1] !== t.g || e[2] !== t.b) && (i.uniform3f(this.addr, t.r, t.g, t.b), e[0] = t.r, e[1] = t.g, e[2] = t.b);
  else {
    if (ve(e, t)) return;
    i.uniform3fv(this.addr, t), xe(e, t);
  }
}
function jf(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4f(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (ve(e, t)) return;
    i.uniform4fv(this.addr, t), xe(e, t);
  }
}
function Kf(i, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (ve(e, t)) return;
    i.uniformMatrix2fv(this.addr, !1, t), xe(e, t);
  } else {
    if (ve(e, n)) return;
    Wo.set(n), i.uniformMatrix2fv(this.addr, !1, Wo), xe(e, n);
  }
}
function Zf(i, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (ve(e, t)) return;
    i.uniformMatrix3fv(this.addr, !1, t), xe(e, t);
  } else {
    if (ve(e, n)) return;
    Go.set(n), i.uniformMatrix3fv(this.addr, !1, Go), xe(e, n);
  }
}
function Jf(i, t) {
  const e = this.cache, n = t.elements;
  if (n === void 0) {
    if (ve(e, t)) return;
    i.uniformMatrix4fv(this.addr, !1, t), xe(e, t);
  } else {
    if (ve(e, n)) return;
    Vo.set(n), i.uniformMatrix4fv(this.addr, !1, Vo), xe(e, n);
  }
}
function Qf(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1i(this.addr, t), e[0] = t);
}
function tp(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) && (i.uniform2i(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (ve(e, t)) return;
    i.uniform2iv(this.addr, t), xe(e, t);
  }
}
function ep(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3i(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else {
    if (ve(e, t)) return;
    i.uniform3iv(this.addr, t), xe(e, t);
  }
}
function np(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4i(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (ve(e, t)) return;
    i.uniform4iv(this.addr, t), xe(e, t);
  }
}
function ip(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1ui(this.addr, t), e[0] = t);
}
function rp(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) && (i.uniform2ui(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
  else {
    if (ve(e, t)) return;
    i.uniform2uiv(this.addr, t), xe(e, t);
  }
}
function sp(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3ui(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
  else {
    if (ve(e, t)) return;
    i.uniform3uiv(this.addr, t), xe(e, t);
  }
}
function ap(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4ui(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
  else {
    if (ve(e, t)) return;
    i.uniform4uiv(this.addr, t), xe(e, t);
  }
}
function op(i, t, e) {
  const n = this.cache, r = e.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r);
  let s;
  this.type === i.SAMPLER_2D_SHADOW ? (ko.compareFunction = Ml, s = ko) : s = Nl, e.setTexture2D(t || s, r);
}
function lp(i, t, e) {
  const n = this.cache, r = e.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r), e.setTexture3D(t || Ol, r);
}
function cp(i, t, e) {
  const n = this.cache, r = e.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r), e.setTextureCube(t || Bl, r);
}
function hp(i, t, e) {
  const n = this.cache, r = e.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r), e.setTexture2DArray(t || Fl, r);
}
function dp(i) {
  switch (i) {
    case 5126:
      return Yf;
    // FLOAT
    case 35664:
      return qf;
    // _VEC2
    case 35665:
      return $f;
    // _VEC3
    case 35666:
      return jf;
    // _VEC4
    case 35674:
      return Kf;
    // _MAT2
    case 35675:
      return Zf;
    // _MAT3
    case 35676:
      return Jf;
    // _MAT4
    case 5124:
    case 35670:
      return Qf;
    // INT, BOOL
    case 35667:
    case 35671:
      return tp;
    // _VEC2
    case 35668:
    case 35672:
      return ep;
    // _VEC3
    case 35669:
    case 35673:
      return np;
    // _VEC4
    case 5125:
      return ip;
    // UINT
    case 36294:
      return rp;
    // _VEC2
    case 36295:
      return sp;
    // _VEC3
    case 36296:
      return ap;
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
      return op;
    case 35679:
    // SAMPLER_3D
    case 36299:
    // INT_SAMPLER_3D
    case 36307:
      return lp;
    case 35680:
    // SAMPLER_CUBE
    case 36300:
    // INT_SAMPLER_CUBE
    case 36308:
    // UNSIGNED_INT_SAMPLER_CUBE
    case 36293:
      return cp;
    case 36289:
    // SAMPLER_2D_ARRAY
    case 36303:
    // INT_SAMPLER_2D_ARRAY
    case 36311:
    // UNSIGNED_INT_SAMPLER_2D_ARRAY
    case 36292:
      return hp;
  }
}
function up(i, t) {
  i.uniform1fv(this.addr, t);
}
function fp(i, t) {
  const e = ki(t, this.size, 2);
  i.uniform2fv(this.addr, e);
}
function pp(i, t) {
  const e = ki(t, this.size, 3);
  i.uniform3fv(this.addr, e);
}
function mp(i, t) {
  const e = ki(t, this.size, 4);
  i.uniform4fv(this.addr, e);
}
function _p(i, t) {
  const e = ki(t, this.size, 4);
  i.uniformMatrix2fv(this.addr, !1, e);
}
function gp(i, t) {
  const e = ki(t, this.size, 9);
  i.uniformMatrix3fv(this.addr, !1, e);
}
function vp(i, t) {
  const e = ki(t, this.size, 16);
  i.uniformMatrix4fv(this.addr, !1, e);
}
function xp(i, t) {
  i.uniform1iv(this.addr, t);
}
function Mp(i, t) {
  i.uniform2iv(this.addr, t);
}
function Sp(i, t) {
  i.uniform3iv(this.addr, t);
}
function Ep(i, t) {
  i.uniform4iv(this.addr, t);
}
function yp(i, t) {
  i.uniform1uiv(this.addr, t);
}
function bp(i, t) {
  i.uniform2uiv(this.addr, t);
}
function Tp(i, t) {
  i.uniform3uiv(this.addr, t);
}
function Ap(i, t) {
  i.uniform4uiv(this.addr, t);
}
function wp(i, t, e) {
  const n = this.cache, r = t.length, s = Kr(e, r);
  ve(n, s) || (i.uniform1iv(this.addr, s), xe(n, s));
  for (let a = 0; a !== r; ++a)
    e.setTexture2D(t[a] || Nl, s[a]);
}
function Rp(i, t, e) {
  const n = this.cache, r = t.length, s = Kr(e, r);
  ve(n, s) || (i.uniform1iv(this.addr, s), xe(n, s));
  for (let a = 0; a !== r; ++a)
    e.setTexture3D(t[a] || Ol, s[a]);
}
function Cp(i, t, e) {
  const n = this.cache, r = t.length, s = Kr(e, r);
  ve(n, s) || (i.uniform1iv(this.addr, s), xe(n, s));
  for (let a = 0; a !== r; ++a)
    e.setTextureCube(t[a] || Bl, s[a]);
}
function Pp(i, t, e) {
  const n = this.cache, r = t.length, s = Kr(e, r);
  ve(n, s) || (i.uniform1iv(this.addr, s), xe(n, s));
  for (let a = 0; a !== r; ++a)
    e.setTexture2DArray(t[a] || Fl, s[a]);
}
function Dp(i) {
  switch (i) {
    case 5126:
      return up;
    // FLOAT
    case 35664:
      return fp;
    // _VEC2
    case 35665:
      return pp;
    // _VEC3
    case 35666:
      return mp;
    // _VEC4
    case 35674:
      return _p;
    // _MAT2
    case 35675:
      return gp;
    // _MAT3
    case 35676:
      return vp;
    // _MAT4
    case 5124:
    case 35670:
      return xp;
    // INT, BOOL
    case 35667:
    case 35671:
      return Mp;
    // _VEC2
    case 35668:
    case 35672:
      return Sp;
    // _VEC3
    case 35669:
    case 35673:
      return Ep;
    // _VEC4
    case 5125:
      return yp;
    // UINT
    case 36294:
      return bp;
    // _VEC2
    case 36295:
      return Tp;
    // _VEC3
    case 36296:
      return Ap;
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
      return wp;
    case 35679:
    // SAMPLER_3D
    case 36299:
    // INT_SAMPLER_3D
    case 36307:
      return Rp;
    case 35680:
    // SAMPLER_CUBE
    case 36300:
    // INT_SAMPLER_CUBE
    case 36308:
    // UNSIGNED_INT_SAMPLER_CUBE
    case 36293:
      return Cp;
    case 36289:
    // SAMPLER_2D_ARRAY
    case 36303:
    // INT_SAMPLER_2D_ARRAY
    case 36311:
    // UNSIGNED_INT_SAMPLER_2D_ARRAY
    case 36292:
      return Pp;
  }
}
class Lp {
  constructor(t, e, n) {
    this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.setValue = dp(e.type);
  }
}
class Ip {
  constructor(t, e, n) {
    this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.size = e.size, this.setValue = Dp(e.type);
  }
}
class Up {
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
const Ps = /(\w+)(\])?(\[|\.)?/g;
function Xo(i, t) {
  i.seq.push(t), i.map[t.id] = t;
}
function Np(i, t, e) {
  const n = i.name, r = n.length;
  for (Ps.lastIndex = 0; ; ) {
    const s = Ps.exec(n), a = Ps.lastIndex;
    let o = s[1];
    const l = s[2] === "]", c = s[3];
    if (l && (o = o | 0), c === void 0 || c === "[" && a + 2 === r) {
      Xo(e, c === void 0 ? new Lp(o, i, t) : new Ip(o, i, t));
      break;
    } else {
      let d = e.map[o];
      d === void 0 && (d = new Up(o), Xo(e, d)), e = d;
    }
  }
}
class zr {
  constructor(t, e) {
    this.seq = [], this.map = {};
    const n = t.getProgramParameter(e, t.ACTIVE_UNIFORMS);
    for (let r = 0; r < n; ++r) {
      const s = t.getActiveUniform(e, r), a = t.getUniformLocation(e, s.name);
      Np(s, a, this);
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
function Yo(i, t, e) {
  const n = i.createShader(t);
  return i.shaderSource(n, e), i.compileShader(n), n;
}
const Fp = 37297;
let Op = 0;
function Bp(i, t) {
  const e = i.split(`
`), n = [], r = Math.max(t - 6, 0), s = Math.min(t + 6, e.length);
  for (let a = r; a < s; a++) {
    const o = a + 1;
    n.push(`${o === t ? ">" : " "} ${o}: ${e[a]}`);
  }
  return n.join(`
`);
}
const qo = /* @__PURE__ */ new Nt();
function kp(i) {
  $t._getMatrix(qo, $t.workingColorSpace, i);
  const t = `mat3( ${qo.elements.map((e) => e.toFixed(4))} )`;
  switch ($t.getTransfer(i)) {
    case Hr:
      return [t, "LinearTransferOETF"];
    case te:
      return [t, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space: ", i), [t, "LinearTransferOETF"];
  }
}
function $o(i, t, e) {
  const n = i.getShaderParameter(t, i.COMPILE_STATUS), s = (i.getShaderInfoLog(t) || "").trim();
  if (n && s === "") return "";
  const a = /ERROR: 0:(\d+)/.exec(s);
  if (a) {
    const o = parseInt(a[1]);
    return e.toUpperCase() + `

` + s + `

` + Bp(i.getShaderSource(t), o);
  } else
    return s;
}
function zp(i, t) {
  const e = kp(t);
  return [
    `vec4 ${i}( vec4 value ) {`,
    `	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,
    "}"
  ].join(`
`);
}
function Hp(i, t) {
  let e;
  switch (t) {
    case Ac:
      e = "Linear";
      break;
    case wc:
      e = "Reinhard";
      break;
    case Rc:
      e = "Cineon";
      break;
    case Cc:
      e = "ACESFilmic";
      break;
    case Dc:
      e = "AgX";
      break;
    case Lc:
      e = "Neutral";
      break;
    case Pc:
      e = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", t), e = "Linear";
  }
  return "vec3 " + i + "( vec3 color ) { return " + e + "ToneMapping( color ); }";
}
const Ur = /* @__PURE__ */ new I();
function Vp() {
  $t.getLuminanceCoefficients(Ur);
  const i = Ur.x.toFixed(4), t = Ur.y.toFixed(4), e = Ur.z.toFixed(4);
  return [
    "float luminance( const in vec3 rgb ) {",
    `	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,
    "	return dot( weights, rgb );",
    "}"
  ].join(`
`);
}
function Gp(i) {
  return [
    i.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
    i.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
  ].filter($i).join(`
`);
}
function Wp(i) {
  const t = [];
  for (const e in i) {
    const n = i[e];
    n !== !1 && t.push("#define " + e + " " + n);
  }
  return t.join(`
`);
}
function Xp(i, t) {
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
function $i(i) {
  return i !== "";
}
function jo(i, t) {
  const e = t.numSpotLightShadows + t.numSpotLightMaps - t.numSpotLightShadowsWithMaps;
  return i.replace(/NUM_DIR_LIGHTS/g, t.numDirLights).replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, e).replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, t.numPointLights).replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, t.numPointLightShadows);
}
function Ko(i, t) {
  return i.replace(/NUM_CLIPPING_PLANES/g, t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, t.numClippingPlanes - t.numClipIntersection);
}
const Yp = /^[ \t]*#include +<([\w\d./]+)>/gm;
function Ea(i) {
  return i.replace(Yp, $p);
}
const qp = /* @__PURE__ */ new Map();
function $p(i, t) {
  let e = Ot[t];
  if (e === void 0) {
    const n = qp.get(t);
    if (n !== void 0)
      e = Ot[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', t, n);
    else
      throw new Error("Can not resolve #include <" + t + ">");
  }
  return Ea(e);
}
const jp = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function Zo(i) {
  return i.replace(jp, Kp);
}
function Kp(i, t, e, n) {
  let r = "";
  for (let s = parseInt(t); s < parseInt(e); s++)
    r += n.replace(/\[\s*i\s*\]/g, "[ " + s + " ]").replace(/UNROLLED_LOOP_INDEX/g, s);
  return r;
}
function Jo(i) {
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
function Zp(i) {
  let t = "SHADOWMAP_TYPE_BASIC";
  return i.shadowMapType === ll ? t = "SHADOWMAP_TYPE_PCF" : i.shadowMapType === sc ? t = "SHADOWMAP_TYPE_PCF_SOFT" : i.shadowMapType === vn && (t = "SHADOWMAP_TYPE_VSM"), t;
}
function Jp(i) {
  let t = "ENVMAP_TYPE_CUBE";
  if (i.envMap)
    switch (i.envMapMode) {
      case Li:
      case Ii:
        t = "ENVMAP_TYPE_CUBE";
        break;
      case qr:
        t = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
  return t;
}
function Qp(i) {
  let t = "ENVMAP_MODE_REFLECTION";
  return i.envMap && i.envMapMode === Ii && (t = "ENVMAP_MODE_REFRACTION"), t;
}
function tm(i) {
  let t = "ENVMAP_BLENDING_NONE";
  if (i.envMap)
    switch (i.combine) {
      case cl:
        t = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case bc:
        t = "ENVMAP_BLENDING_MIX";
        break;
      case Tc:
        t = "ENVMAP_BLENDING_ADD";
        break;
    }
  return t;
}
function em(i) {
  const t = i.envMapCubeUVHeight;
  if (t === null) return null;
  const e = Math.log2(t) - 2, n = 1 / t;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, e), 112)), texelHeight: n, maxMip: e };
}
function nm(i, t, e, n) {
  const r = i.getContext(), s = e.defines;
  let a = e.vertexShader, o = e.fragmentShader;
  const l = Zp(e), c = Jp(e), u = Qp(e), d = tm(e), f = em(e), m = Gp(e), _ = Wp(s), v = r.createProgram();
  let p, h, b = e.glslVersion ? "#version " + e.glslVersion + `
` : "";
  e.isRawShaderMaterial ? (p = [
    "#define SHADER_TYPE " + e.shaderType,
    "#define SHADER_NAME " + e.shaderName,
    _
  ].filter($i).join(`
`), p.length > 0 && (p += `
`), h = [
    "#define SHADER_TYPE " + e.shaderType,
    "#define SHADER_NAME " + e.shaderName,
    _
  ].filter($i).join(`
`), h.length > 0 && (h += `
`)) : (p = [
    Jo(e),
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
    e.envMap ? "#define " + u : "",
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
  ].filter($i).join(`
`), h = [
    Jo(e),
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
    e.envMap ? "#define " + u : "",
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
    e.toneMapping !== Fn ? "#define TONE_MAPPING" : "",
    e.toneMapping !== Fn ? Ot.tonemapping_pars_fragment : "",
    // this code is required here because it is used by the toneMapping() function defined below
    e.toneMapping !== Fn ? Hp("toneMapping", e.toneMapping) : "",
    e.dithering ? "#define DITHERING" : "",
    e.opaque ? "#define OPAQUE" : "",
    Ot.colorspace_pars_fragment,
    // this code is required here because it is used by the various encoding/decoding function defined below
    zp("linearToOutputTexel", e.outputColorSpace),
    Vp(),
    e.useDepthPacking ? "#define DEPTH_PACKING " + e.depthPacking : "",
    `
`
  ].filter($i).join(`
`)), a = Ea(a), a = jo(a, e), a = Ko(a, e), o = Ea(o), o = jo(o, e), o = Ko(o, e), a = Zo(a), o = Zo(o), e.isRawShaderMaterial !== !0 && (b = `#version 300 es
`, p = [
    m,
    "#define attribute in",
    "#define varying out",
    "#define texture2D texture"
  ].join(`
`) + `
` + p, h = [
    "#define varying in",
    e.glslVersion === Qa ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
    e.glslVersion === Qa ? "" : "#define gl_FragColor pc_fragColor",
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
` + h);
  const T = b + p + a, M = b + h + o, R = Yo(r, r.VERTEX_SHADER, T), C = Yo(r, r.FRAGMENT_SHADER, M);
  r.attachShader(v, R), r.attachShader(v, C), e.index0AttributeName !== void 0 ? r.bindAttribLocation(v, 0, e.index0AttributeName) : e.morphTargets === !0 && r.bindAttribLocation(v, 0, "position"), r.linkProgram(v);
  function w(D) {
    if (i.debug.checkShaderErrors) {
      const O = r.getProgramInfoLog(v) || "", H = r.getShaderInfoLog(R) || "", $ = r.getShaderInfoLog(C) || "", W = O.trim(), Y = H.trim(), j = $.trim();
      let z = !0, rt = !0;
      if (r.getProgramParameter(v, r.LINK_STATUS) === !1)
        if (z = !1, typeof i.debug.onShaderError == "function")
          i.debug.onShaderError(r, v, R, C);
        else {
          const ct = $o(r, R, "vertex"), St = $o(r, C, "fragment");
          console.error(
            "THREE.WebGLProgram: Shader Error " + r.getError() + " - VALIDATE_STATUS " + r.getProgramParameter(v, r.VALIDATE_STATUS) + `

Material Name: ` + D.name + `
Material Type: ` + D.type + `

Program Info Log: ` + W + `
` + ct + `
` + St
          );
        }
      else W !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", W) : (Y === "" || j === "") && (rt = !1);
      rt && (D.diagnostics = {
        runnable: z,
        programLog: W,
        vertexShader: {
          log: Y,
          prefix: p
        },
        fragmentShader: {
          log: j,
          prefix: h
        }
      });
    }
    r.deleteShader(R), r.deleteShader(C), N = new zr(r, v), E = Xp(r, v);
  }
  let N;
  this.getUniforms = function() {
    return N === void 0 && w(this), N;
  };
  let E;
  this.getAttributes = function() {
    return E === void 0 && w(this), E;
  };
  let S = e.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function() {
    return S === !1 && (S = r.getProgramParameter(v, Fp)), S;
  }, this.destroy = function() {
    n.releaseStatesOfProgram(this), r.deleteProgram(v), this.program = void 0;
  }, this.type = e.shaderType, this.name = e.shaderName, this.id = Op++, this.cacheKey = t, this.usedTimes = 1, this.program = v, this.vertexShader = R, this.fragmentShader = C, this;
}
let im = 0;
class rm {
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
    return n === void 0 && (n = new sm(t), e.set(t, n)), n;
  }
}
class sm {
  constructor(t) {
    this.id = im++, this.code = t, this.usedTimes = 0;
  }
}
function am(i, t, e, n, r, s, a) {
  const o = new Ia(), l = new rm(), c = /* @__PURE__ */ new Set(), u = [], d = r.logarithmicDepthBuffer, f = r.vertexTextures;
  let m = r.precision;
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
  function v(E) {
    return c.add(E), E === 0 ? "uv" : `uv${E}`;
  }
  function p(E, S, D, O, H) {
    const $ = O.fog, W = H.geometry, Y = E.isMeshStandardMaterial ? O.environment : null, j = (E.isMeshStandardMaterial ? e : t).get(E.envMap || Y), z = j && j.mapping === qr ? j.image.height : null, rt = _[E.type];
    E.precision !== null && (m = r.getMaxPrecision(E.precision), m !== E.precision && console.warn("THREE.WebGLProgram.getParameters:", E.precision, "not supported, using", m, "instead."));
    const ct = W.morphAttributes.position || W.morphAttributes.normal || W.morphAttributes.color, St = ct !== void 0 ? ct.length : 0;
    let Bt = 0;
    W.morphAttributes.position !== void 0 && (Bt = 1), W.morphAttributes.normal !== void 0 && (Bt = 2), W.morphAttributes.color !== void 0 && (Bt = 3);
    let zt, Yt, jt, X;
    if (rt) {
      const Zt = en[rt];
      zt = Zt.vertexShader, Yt = Zt.fragmentShader;
    } else
      zt = E.vertexShader, Yt = E.fragmentShader, l.update(E), jt = l.getVertexShaderID(E), X = l.getFragmentShaderID(E);
    const K = i.getRenderTarget(), ft = i.state.buffers.depth.getReversed(), Pt = H.isInstancedMesh === !0, yt = H.isBatchedMesh === !0, Wt = !!E.map, ye = !!E.matcap, A = !!j, ae = !!E.aoMap, It = !!E.lightMap, Rt = !!E.bumpMap, _t = !!E.normalMap, oe = !!E.displacementMap, gt = !!E.emissiveMap, Ft = !!E.metalnessMap, Me = !!E.roughnessMap, fe = E.anisotropy > 0, y = E.clearcoat > 0, g = E.dispersion > 0, F = E.iridescence > 0, G = E.sheen > 0, Z = E.transmission > 0, V = fe && !!E.anisotropyMap, Et = y && !!E.clearcoatMap, nt = y && !!E.clearcoatNormalMap, vt = y && !!E.clearcoatRoughnessMap, xt = F && !!E.iridescenceMap, tt = F && !!E.iridescenceThicknessMap, ht = G && !!E.sheenColorMap, wt = G && !!E.sheenRoughnessMap, Mt = !!E.specularMap, ot = !!E.specularColorMap, Ut = !!E.specularIntensityMap, P = Z && !!E.transmissionMap, et = Z && !!E.thicknessMap, it = !!E.gradientMap, ut = !!E.alphaMap, J = E.alphaTest > 0, q = !!E.alphaHash, mt = !!E.extensions;
    let Lt = Fn;
    E.toneMapped && (K === null || K.isXRRenderTarget === !0) && (Lt = i.toneMapping);
    const ie = {
      shaderID: rt,
      shaderType: E.type,
      shaderName: E.name,
      vertexShader: zt,
      fragmentShader: Yt,
      defines: E.defines,
      customVertexShaderID: jt,
      customFragmentShaderID: X,
      isRawShaderMaterial: E.isRawShaderMaterial === !0,
      glslVersion: E.glslVersion,
      precision: m,
      batching: yt,
      batchingColor: yt && H._colorsTexture !== null,
      instancing: Pt,
      instancingColor: Pt && H.instanceColor !== null,
      instancingMorph: Pt && H.morphTexture !== null,
      supportsVertexTextures: f,
      outputColorSpace: K === null ? i.outputColorSpace : K.isXRRenderTarget === !0 ? K.texture.colorSpace : Ui,
      alphaToCoverage: !!E.alphaToCoverage,
      map: Wt,
      matcap: ye,
      envMap: A,
      envMapMode: A && j.mapping,
      envMapCubeUVHeight: z,
      aoMap: ae,
      lightMap: It,
      bumpMap: Rt,
      normalMap: _t,
      displacementMap: f && oe,
      emissiveMap: gt,
      normalMapObjectSpace: _t && E.normalMapType === Fc,
      normalMapTangentSpace: _t && E.normalMapType === xl,
      metalnessMap: Ft,
      roughnessMap: Me,
      anisotropy: fe,
      anisotropyMap: V,
      clearcoat: y,
      clearcoatMap: Et,
      clearcoatNormalMap: nt,
      clearcoatRoughnessMap: vt,
      dispersion: g,
      iridescence: F,
      iridescenceMap: xt,
      iridescenceThicknessMap: tt,
      sheen: G,
      sheenColorMap: ht,
      sheenRoughnessMap: wt,
      specularMap: Mt,
      specularColorMap: ot,
      specularIntensityMap: Ut,
      transmission: Z,
      transmissionMap: P,
      thicknessMap: et,
      gradientMap: it,
      opaque: E.transparent === !1 && E.blending === Ri && E.alphaToCoverage === !1,
      alphaMap: ut,
      alphaTest: J,
      alphaHash: q,
      combine: E.combine,
      //
      mapUv: Wt && v(E.map.channel),
      aoMapUv: ae && v(E.aoMap.channel),
      lightMapUv: It && v(E.lightMap.channel),
      bumpMapUv: Rt && v(E.bumpMap.channel),
      normalMapUv: _t && v(E.normalMap.channel),
      displacementMapUv: oe && v(E.displacementMap.channel),
      emissiveMapUv: gt && v(E.emissiveMap.channel),
      metalnessMapUv: Ft && v(E.metalnessMap.channel),
      roughnessMapUv: Me && v(E.roughnessMap.channel),
      anisotropyMapUv: V && v(E.anisotropyMap.channel),
      clearcoatMapUv: Et && v(E.clearcoatMap.channel),
      clearcoatNormalMapUv: nt && v(E.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: vt && v(E.clearcoatRoughnessMap.channel),
      iridescenceMapUv: xt && v(E.iridescenceMap.channel),
      iridescenceThicknessMapUv: tt && v(E.iridescenceThicknessMap.channel),
      sheenColorMapUv: ht && v(E.sheenColorMap.channel),
      sheenRoughnessMapUv: wt && v(E.sheenRoughnessMap.channel),
      specularMapUv: Mt && v(E.specularMap.channel),
      specularColorMapUv: ot && v(E.specularColorMap.channel),
      specularIntensityMapUv: Ut && v(E.specularIntensityMap.channel),
      transmissionMapUv: P && v(E.transmissionMap.channel),
      thicknessMapUv: et && v(E.thicknessMap.channel),
      alphaMapUv: ut && v(E.alphaMap.channel),
      //
      vertexTangents: !!W.attributes.tangent && (_t || fe),
      vertexColors: E.vertexColors,
      vertexAlphas: E.vertexColors === !0 && !!W.attributes.color && W.attributes.color.itemSize === 4,
      pointsUvs: H.isPoints === !0 && !!W.attributes.uv && (Wt || ut),
      fog: !!$,
      useFog: E.fog === !0,
      fogExp2: !!$ && $.isFogExp2,
      flatShading: E.flatShading === !0 && E.wireframe === !1,
      sizeAttenuation: E.sizeAttenuation === !0,
      logarithmicDepthBuffer: d,
      reversedDepthBuffer: ft,
      skinning: H.isSkinnedMesh === !0,
      morphTargets: W.morphAttributes.position !== void 0,
      morphNormals: W.morphAttributes.normal !== void 0,
      morphColors: W.morphAttributes.color !== void 0,
      morphTargetsCount: St,
      morphTextureStride: Bt,
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
      dithering: E.dithering,
      shadowMapEnabled: i.shadowMap.enabled && D.length > 0,
      shadowMapType: i.shadowMap.type,
      toneMapping: Lt,
      decodeVideoTexture: Wt && E.map.isVideoTexture === !0 && $t.getTransfer(E.map.colorSpace) === te,
      decodeVideoTextureEmissive: gt && E.emissiveMap.isVideoTexture === !0 && $t.getTransfer(E.emissiveMap.colorSpace) === te,
      premultipliedAlpha: E.premultipliedAlpha,
      doubleSided: E.side === Mn,
      flipSided: E.side === Ne,
      useDepthPacking: E.depthPacking >= 0,
      depthPacking: E.depthPacking || 0,
      index0AttributeName: E.index0AttributeName,
      extensionClipCullDistance: mt && E.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: (mt && E.extensions.multiDraw === !0 || yt) && n.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: E.customProgramCacheKey()
    };
    return ie.vertexUv1s = c.has(1), ie.vertexUv2s = c.has(2), ie.vertexUv3s = c.has(3), c.clear(), ie;
  }
  function h(E) {
    const S = [];
    if (E.shaderID ? S.push(E.shaderID) : (S.push(E.customVertexShaderID), S.push(E.customFragmentShaderID)), E.defines !== void 0)
      for (const D in E.defines)
        S.push(D), S.push(E.defines[D]);
    return E.isRawShaderMaterial === !1 && (b(S, E), T(S, E), S.push(i.outputColorSpace)), S.push(E.customProgramCacheKey), S.join();
  }
  function b(E, S) {
    E.push(S.precision), E.push(S.outputColorSpace), E.push(S.envMapMode), E.push(S.envMapCubeUVHeight), E.push(S.mapUv), E.push(S.alphaMapUv), E.push(S.lightMapUv), E.push(S.aoMapUv), E.push(S.bumpMapUv), E.push(S.normalMapUv), E.push(S.displacementMapUv), E.push(S.emissiveMapUv), E.push(S.metalnessMapUv), E.push(S.roughnessMapUv), E.push(S.anisotropyMapUv), E.push(S.clearcoatMapUv), E.push(S.clearcoatNormalMapUv), E.push(S.clearcoatRoughnessMapUv), E.push(S.iridescenceMapUv), E.push(S.iridescenceThicknessMapUv), E.push(S.sheenColorMapUv), E.push(S.sheenRoughnessMapUv), E.push(S.specularMapUv), E.push(S.specularColorMapUv), E.push(S.specularIntensityMapUv), E.push(S.transmissionMapUv), E.push(S.thicknessMapUv), E.push(S.combine), E.push(S.fogExp2), E.push(S.sizeAttenuation), E.push(S.morphTargetsCount), E.push(S.morphAttributeCount), E.push(S.numDirLights), E.push(S.numPointLights), E.push(S.numSpotLights), E.push(S.numSpotLightMaps), E.push(S.numHemiLights), E.push(S.numRectAreaLights), E.push(S.numDirLightShadows), E.push(S.numPointLightShadows), E.push(S.numSpotLightShadows), E.push(S.numSpotLightShadowsWithMaps), E.push(S.numLightProbes), E.push(S.shadowMapType), E.push(S.toneMapping), E.push(S.numClippingPlanes), E.push(S.numClipIntersection), E.push(S.depthPacking);
  }
  function T(E, S) {
    o.disableAll(), S.supportsVertexTextures && o.enable(0), S.instancing && o.enable(1), S.instancingColor && o.enable(2), S.instancingMorph && o.enable(3), S.matcap && o.enable(4), S.envMap && o.enable(5), S.normalMapObjectSpace && o.enable(6), S.normalMapTangentSpace && o.enable(7), S.clearcoat && o.enable(8), S.iridescence && o.enable(9), S.alphaTest && o.enable(10), S.vertexColors && o.enable(11), S.vertexAlphas && o.enable(12), S.vertexUv1s && o.enable(13), S.vertexUv2s && o.enable(14), S.vertexUv3s && o.enable(15), S.vertexTangents && o.enable(16), S.anisotropy && o.enable(17), S.alphaHash && o.enable(18), S.batching && o.enable(19), S.dispersion && o.enable(20), S.batchingColor && o.enable(21), S.gradientMap && o.enable(22), E.push(o.mask), o.disableAll(), S.fog && o.enable(0), S.useFog && o.enable(1), S.flatShading && o.enable(2), S.logarithmicDepthBuffer && o.enable(3), S.reversedDepthBuffer && o.enable(4), S.skinning && o.enable(5), S.morphTargets && o.enable(6), S.morphNormals && o.enable(7), S.morphColors && o.enable(8), S.premultipliedAlpha && o.enable(9), S.shadowMapEnabled && o.enable(10), S.doubleSided && o.enable(11), S.flipSided && o.enable(12), S.useDepthPacking && o.enable(13), S.dithering && o.enable(14), S.transmission && o.enable(15), S.sheen && o.enable(16), S.opaque && o.enable(17), S.pointsUvs && o.enable(18), S.decodeVideoTexture && o.enable(19), S.decodeVideoTextureEmissive && o.enable(20), S.alphaToCoverage && o.enable(21), E.push(o.mask);
  }
  function M(E) {
    const S = _[E.type];
    let D;
    if (S) {
      const O = en[S];
      D = Ah.clone(O.uniforms);
    } else
      D = E.uniforms;
    return D;
  }
  function R(E, S) {
    let D;
    for (let O = 0, H = u.length; O < H; O++) {
      const $ = u[O];
      if ($.cacheKey === S) {
        D = $, ++D.usedTimes;
        break;
      }
    }
    return D === void 0 && (D = new nm(i, S, E, s), u.push(D)), D;
  }
  function C(E) {
    if (--E.usedTimes === 0) {
      const S = u.indexOf(E);
      u[S] = u[u.length - 1], u.pop(), E.destroy();
    }
  }
  function w(E) {
    l.remove(E);
  }
  function N() {
    l.dispose();
  }
  return {
    getParameters: p,
    getProgramCacheKey: h,
    getUniforms: M,
    acquireProgram: R,
    releaseProgram: C,
    releaseShaderCache: w,
    // Exposed for resource monitoring & error feedback via renderer.info:
    programs: u,
    dispose: N
  };
}
function om() {
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
function lm(i, t) {
  return i.groupOrder !== t.groupOrder ? i.groupOrder - t.groupOrder : i.renderOrder !== t.renderOrder ? i.renderOrder - t.renderOrder : i.material.id !== t.material.id ? i.material.id - t.material.id : i.z !== t.z ? i.z - t.z : i.id - t.id;
}
function Qo(i, t) {
  return i.groupOrder !== t.groupOrder ? i.groupOrder - t.groupOrder : i.renderOrder !== t.renderOrder ? i.renderOrder - t.renderOrder : i.z !== t.z ? t.z - i.z : i.id - t.id;
}
function tl() {
  const i = [];
  let t = 0;
  const e = [], n = [], r = [];
  function s() {
    t = 0, e.length = 0, n.length = 0, r.length = 0;
  }
  function a(d, f, m, _, v, p) {
    let h = i[t];
    return h === void 0 ? (h = {
      id: d.id,
      object: d,
      geometry: f,
      material: m,
      groupOrder: _,
      renderOrder: d.renderOrder,
      z: v,
      group: p
    }, i[t] = h) : (h.id = d.id, h.object = d, h.geometry = f, h.material = m, h.groupOrder = _, h.renderOrder = d.renderOrder, h.z = v, h.group = p), t++, h;
  }
  function o(d, f, m, _, v, p) {
    const h = a(d, f, m, _, v, p);
    m.transmission > 0 ? n.push(h) : m.transparent === !0 ? r.push(h) : e.push(h);
  }
  function l(d, f, m, _, v, p) {
    const h = a(d, f, m, _, v, p);
    m.transmission > 0 ? n.unshift(h) : m.transparent === !0 ? r.unshift(h) : e.unshift(h);
  }
  function c(d, f) {
    e.length > 1 && e.sort(d || lm), n.length > 1 && n.sort(f || Qo), r.length > 1 && r.sort(f || Qo);
  }
  function u() {
    for (let d = t, f = i.length; d < f; d++) {
      const m = i[d];
      if (m.id === null) break;
      m.id = null, m.object = null, m.geometry = null, m.material = null, m.group = null;
    }
  }
  return {
    opaque: e,
    transmissive: n,
    transparent: r,
    init: s,
    push: o,
    unshift: l,
    finish: u,
    sort: c
  };
}
function cm() {
  let i = /* @__PURE__ */ new WeakMap();
  function t(n, r) {
    const s = i.get(n);
    let a;
    return s === void 0 ? (a = new tl(), i.set(n, [a])) : r >= s.length ? (a = new tl(), s.push(a)) : a = s[r], a;
  }
  function e() {
    i = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: t,
    dispose: e
  };
}
function hm() {
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
            color: new Xt()
          };
          break;
        case "SpotLight":
          e = {
            position: new I(),
            direction: new I(),
            color: new Xt(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case "PointLight":
          e = {
            position: new I(),
            color: new Xt(),
            distance: 0,
            decay: 0
          };
          break;
        case "HemisphereLight":
          e = {
            direction: new I(),
            skyColor: new Xt(),
            groundColor: new Xt()
          };
          break;
        case "RectAreaLight":
          e = {
            color: new Xt(),
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
function dm() {
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
let um = 0;
function fm(i, t) {
  return (t.castShadow ? 2 : 0) - (i.castShadow ? 2 : 0) + (t.map ? 1 : 0) - (i.map ? 1 : 0);
}
function pm(i) {
  const t = new hm(), e = dm(), n = {
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
  const r = new I(), s = new se(), a = new se();
  function o(c) {
    let u = 0, d = 0, f = 0;
    for (let E = 0; E < 9; E++) n.probe[E].set(0, 0, 0);
    let m = 0, _ = 0, v = 0, p = 0, h = 0, b = 0, T = 0, M = 0, R = 0, C = 0, w = 0;
    c.sort(fm);
    for (let E = 0, S = c.length; E < S; E++) {
      const D = c[E], O = D.color, H = D.intensity, $ = D.distance, W = D.shadow && D.shadow.map ? D.shadow.map.texture : null;
      if (D.isAmbientLight)
        u += O.r * H, d += O.g * H, f += O.b * H;
      else if (D.isLightProbe) {
        for (let Y = 0; Y < 9; Y++)
          n.probe[Y].addScaledVector(D.sh.coefficients[Y], H);
        w++;
      } else if (D.isDirectionalLight) {
        const Y = t.get(D);
        if (Y.color.copy(D.color).multiplyScalar(D.intensity), D.castShadow) {
          const j = D.shadow, z = e.get(D);
          z.shadowIntensity = j.intensity, z.shadowBias = j.bias, z.shadowNormalBias = j.normalBias, z.shadowRadius = j.radius, z.shadowMapSize = j.mapSize, n.directionalShadow[m] = z, n.directionalShadowMap[m] = W, n.directionalShadowMatrix[m] = D.shadow.matrix, b++;
        }
        n.directional[m] = Y, m++;
      } else if (D.isSpotLight) {
        const Y = t.get(D);
        Y.position.setFromMatrixPosition(D.matrixWorld), Y.color.copy(O).multiplyScalar(H), Y.distance = $, Y.coneCos = Math.cos(D.angle), Y.penumbraCos = Math.cos(D.angle * (1 - D.penumbra)), Y.decay = D.decay, n.spot[v] = Y;
        const j = D.shadow;
        if (D.map && (n.spotLightMap[R] = D.map, R++, j.updateMatrices(D), D.castShadow && C++), n.spotLightMatrix[v] = j.matrix, D.castShadow) {
          const z = e.get(D);
          z.shadowIntensity = j.intensity, z.shadowBias = j.bias, z.shadowNormalBias = j.normalBias, z.shadowRadius = j.radius, z.shadowMapSize = j.mapSize, n.spotShadow[v] = z, n.spotShadowMap[v] = W, M++;
        }
        v++;
      } else if (D.isRectAreaLight) {
        const Y = t.get(D);
        Y.color.copy(O).multiplyScalar(H), Y.halfWidth.set(D.width * 0.5, 0, 0), Y.halfHeight.set(0, D.height * 0.5, 0), n.rectArea[p] = Y, p++;
      } else if (D.isPointLight) {
        const Y = t.get(D);
        if (Y.color.copy(D.color).multiplyScalar(D.intensity), Y.distance = D.distance, Y.decay = D.decay, D.castShadow) {
          const j = D.shadow, z = e.get(D);
          z.shadowIntensity = j.intensity, z.shadowBias = j.bias, z.shadowNormalBias = j.normalBias, z.shadowRadius = j.radius, z.shadowMapSize = j.mapSize, z.shadowCameraNear = j.camera.near, z.shadowCameraFar = j.camera.far, n.pointShadow[_] = z, n.pointShadowMap[_] = W, n.pointShadowMatrix[_] = D.shadow.matrix, T++;
        }
        n.point[_] = Y, _++;
      } else if (D.isHemisphereLight) {
        const Y = t.get(D);
        Y.skyColor.copy(D.color).multiplyScalar(H), Y.groundColor.copy(D.groundColor).multiplyScalar(H), n.hemi[h] = Y, h++;
      }
    }
    p > 0 && (i.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = st.LTC_FLOAT_1, n.rectAreaLTC2 = st.LTC_FLOAT_2) : (n.rectAreaLTC1 = st.LTC_HALF_1, n.rectAreaLTC2 = st.LTC_HALF_2)), n.ambient[0] = u, n.ambient[1] = d, n.ambient[2] = f;
    const N = n.hash;
    (N.directionalLength !== m || N.pointLength !== _ || N.spotLength !== v || N.rectAreaLength !== p || N.hemiLength !== h || N.numDirectionalShadows !== b || N.numPointShadows !== T || N.numSpotShadows !== M || N.numSpotMaps !== R || N.numLightProbes !== w) && (n.directional.length = m, n.spot.length = v, n.rectArea.length = p, n.point.length = _, n.hemi.length = h, n.directionalShadow.length = b, n.directionalShadowMap.length = b, n.pointShadow.length = T, n.pointShadowMap.length = T, n.spotShadow.length = M, n.spotShadowMap.length = M, n.directionalShadowMatrix.length = b, n.pointShadowMatrix.length = T, n.spotLightMatrix.length = M + R - C, n.spotLightMap.length = R, n.numSpotLightShadowsWithMaps = C, n.numLightProbes = w, N.directionalLength = m, N.pointLength = _, N.spotLength = v, N.rectAreaLength = p, N.hemiLength = h, N.numDirectionalShadows = b, N.numPointShadows = T, N.numSpotShadows = M, N.numSpotMaps = R, N.numLightProbes = w, n.version = um++);
  }
  function l(c, u) {
    let d = 0, f = 0, m = 0, _ = 0, v = 0;
    const p = u.matrixWorldInverse;
    for (let h = 0, b = c.length; h < b; h++) {
      const T = c[h];
      if (T.isDirectionalLight) {
        const M = n.directional[d];
        M.direction.setFromMatrixPosition(T.matrixWorld), r.setFromMatrixPosition(T.target.matrixWorld), M.direction.sub(r), M.direction.transformDirection(p), d++;
      } else if (T.isSpotLight) {
        const M = n.spot[m];
        M.position.setFromMatrixPosition(T.matrixWorld), M.position.applyMatrix4(p), M.direction.setFromMatrixPosition(T.matrixWorld), r.setFromMatrixPosition(T.target.matrixWorld), M.direction.sub(r), M.direction.transformDirection(p), m++;
      } else if (T.isRectAreaLight) {
        const M = n.rectArea[_];
        M.position.setFromMatrixPosition(T.matrixWorld), M.position.applyMatrix4(p), a.identity(), s.copy(T.matrixWorld), s.premultiply(p), a.extractRotation(s), M.halfWidth.set(T.width * 0.5, 0, 0), M.halfHeight.set(0, T.height * 0.5, 0), M.halfWidth.applyMatrix4(a), M.halfHeight.applyMatrix4(a), _++;
      } else if (T.isPointLight) {
        const M = n.point[f];
        M.position.setFromMatrixPosition(T.matrixWorld), M.position.applyMatrix4(p), f++;
      } else if (T.isHemisphereLight) {
        const M = n.hemi[v];
        M.direction.setFromMatrixPosition(T.matrixWorld), M.direction.transformDirection(p), v++;
      }
    }
  }
  return {
    setup: o,
    setupView: l,
    state: n
  };
}
function el(i) {
  const t = new pm(i), e = [], n = [];
  function r(u) {
    c.camera = u, e.length = 0, n.length = 0;
  }
  function s(u) {
    e.push(u);
  }
  function a(u) {
    n.push(u);
  }
  function o() {
    t.setup(e);
  }
  function l(u) {
    t.setupView(e, u);
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
function mm(i) {
  let t = /* @__PURE__ */ new WeakMap();
  function e(r, s = 0) {
    const a = t.get(r);
    let o;
    return a === void 0 ? (o = new el(i), t.set(r, [o])) : s >= a.length ? (o = new el(i), a.push(o)) : o = a[s], o;
  }
  function n() {
    t = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: e,
    dispose: n
  };
}
const _m = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, gm = `uniform sampler2D shadow_pass;
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
function vm(i, t, e) {
  let n = new Na();
  const r = new Dt(), s = new Dt(), a = new ue(), o = new Bh({ depthPacking: Nc }), l = new kh(), c = {}, u = e.maxTextureSize, d = { [Bn]: Ne, [Ne]: Bn, [Mn]: Mn }, f = new kn({
    defines: {
      VSM_SAMPLES: 8
    },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new Dt() },
      radius: { value: 4 }
    },
    vertexShader: _m,
    fragmentShader: gm
  }), m = f.clone();
  m.defines.HORIZONTAL_PASS = 1;
  const _ = new dn();
  _.setAttribute(
    "position",
    new an(
      new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]),
      3
    )
  );
  const v = new Ze(_, f), p = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = ll;
  let h = this.type;
  this.render = function(C, w, N) {
    if (p.enabled === !1 || p.autoUpdate === !1 && p.needsUpdate === !1 || C.length === 0) return;
    const E = i.getRenderTarget(), S = i.getActiveCubeFace(), D = i.getActiveMipmapLevel(), O = i.state;
    O.setBlending(Nn), O.buffers.depth.getReversed() === !0 ? O.buffers.color.setClear(0, 0, 0, 0) : O.buffers.color.setClear(1, 1, 1, 1), O.buffers.depth.setTest(!0), O.setScissorTest(!1);
    const H = h !== vn && this.type === vn, $ = h === vn && this.type !== vn;
    for (let W = 0, Y = C.length; W < Y; W++) {
      const j = C[W], z = j.shadow;
      if (z === void 0) {
        console.warn("THREE.WebGLShadowMap:", j, "has no shadow.");
        continue;
      }
      if (z.autoUpdate === !1 && z.needsUpdate === !1) continue;
      r.copy(z.mapSize);
      const rt = z.getFrameExtents();
      if (r.multiply(rt), s.copy(z.mapSize), (r.x > u || r.y > u) && (r.x > u && (s.x = Math.floor(u / rt.x), r.x = s.x * rt.x, z.mapSize.x = s.x), r.y > u && (s.y = Math.floor(u / rt.y), r.y = s.y * rt.y, z.mapSize.y = s.y)), z.map === null || H === !0 || $ === !0) {
        const St = this.type !== vn ? { minFilter: Je, magFilter: Je } : {};
        z.map !== null && z.map.dispose(), z.map = new ni(r.x, r.y, St), z.map.texture.name = j.name + ".shadowMap", z.camera.updateProjectionMatrix();
      }
      i.setRenderTarget(z.map), i.clear();
      const ct = z.getViewportCount();
      for (let St = 0; St < ct; St++) {
        const Bt = z.getViewport(St);
        a.set(
          s.x * Bt.x,
          s.y * Bt.y,
          s.x * Bt.z,
          s.y * Bt.w
        ), O.viewport(a), z.updateMatrices(j, St), n = z.getFrustum(), M(w, N, z.camera, j, this.type);
      }
      z.isPointLightShadow !== !0 && this.type === vn && b(z, N), z.needsUpdate = !1;
    }
    h = this.type, p.needsUpdate = !1, i.setRenderTarget(E, S, D);
  };
  function b(C, w) {
    const N = t.update(v);
    f.defines.VSM_SAMPLES !== C.blurSamples && (f.defines.VSM_SAMPLES = C.blurSamples, m.defines.VSM_SAMPLES = C.blurSamples, f.needsUpdate = !0, m.needsUpdate = !0), C.mapPass === null && (C.mapPass = new ni(r.x, r.y)), f.uniforms.shadow_pass.value = C.map.texture, f.uniforms.resolution.value = C.mapSize, f.uniforms.radius.value = C.radius, i.setRenderTarget(C.mapPass), i.clear(), i.renderBufferDirect(w, null, N, f, v, null), m.uniforms.shadow_pass.value = C.mapPass.texture, m.uniforms.resolution.value = C.mapSize, m.uniforms.radius.value = C.radius, i.setRenderTarget(C.map), i.clear(), i.renderBufferDirect(w, null, N, m, v, null);
  }
  function T(C, w, N, E) {
    let S = null;
    const D = N.isPointLight === !0 ? C.customDistanceMaterial : C.customDepthMaterial;
    if (D !== void 0)
      S = D;
    else if (S = N.isPointLight === !0 ? l : o, i.localClippingEnabled && w.clipShadows === !0 && Array.isArray(w.clippingPlanes) && w.clippingPlanes.length !== 0 || w.displacementMap && w.displacementScale !== 0 || w.alphaMap && w.alphaTest > 0 || w.map && w.alphaTest > 0 || w.alphaToCoverage === !0) {
      const O = S.uuid, H = w.uuid;
      let $ = c[O];
      $ === void 0 && ($ = {}, c[O] = $);
      let W = $[H];
      W === void 0 && (W = S.clone(), $[H] = W, w.addEventListener("dispose", R)), S = W;
    }
    if (S.visible = w.visible, S.wireframe = w.wireframe, E === vn ? S.side = w.shadowSide !== null ? w.shadowSide : w.side : S.side = w.shadowSide !== null ? w.shadowSide : d[w.side], S.alphaMap = w.alphaMap, S.alphaTest = w.alphaToCoverage === !0 ? 0.5 : w.alphaTest, S.map = w.map, S.clipShadows = w.clipShadows, S.clippingPlanes = w.clippingPlanes, S.clipIntersection = w.clipIntersection, S.displacementMap = w.displacementMap, S.displacementScale = w.displacementScale, S.displacementBias = w.displacementBias, S.wireframeLinewidth = w.wireframeLinewidth, S.linewidth = w.linewidth, N.isPointLight === !0 && S.isMeshDistanceMaterial === !0) {
      const O = i.properties.get(S);
      O.light = N;
    }
    return S;
  }
  function M(C, w, N, E, S) {
    if (C.visible === !1) return;
    if (C.layers.test(w.layers) && (C.isMesh || C.isLine || C.isPoints) && (C.castShadow || C.receiveShadow && S === vn) && (!C.frustumCulled || n.intersectsObject(C))) {
      C.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse, C.matrixWorld);
      const H = t.update(C), $ = C.material;
      if (Array.isArray($)) {
        const W = H.groups;
        for (let Y = 0, j = W.length; Y < j; Y++) {
          const z = W[Y], rt = $[z.materialIndex];
          if (rt && rt.visible) {
            const ct = T(C, rt, E, S);
            C.onBeforeShadow(i, C, w, N, H, ct, z), i.renderBufferDirect(N, null, H, ct, C, z), C.onAfterShadow(i, C, w, N, H, ct, z);
          }
        }
      } else if ($.visible) {
        const W = T(C, $, E, S);
        C.onBeforeShadow(i, C, w, N, H, W, null), i.renderBufferDirect(N, null, H, W, C, null), C.onAfterShadow(i, C, w, N, H, W, null);
      }
    }
    const O = C.children;
    for (let H = 0, $ = O.length; H < $; H++)
      M(O[H], w, N, E, S);
  }
  function R(C) {
    C.target.removeEventListener("dispose", R);
    for (const N in c) {
      const E = c[N], S = C.target.uuid;
      S in E && (E[S].dispose(), delete E[S]);
    }
  }
}
const xm = {
  [Ns]: Fs,
  [Os]: zs,
  [Bs]: Hs,
  [Di]: ks,
  [Fs]: Ns,
  [zs]: Os,
  [Hs]: Bs,
  [ks]: Di
};
function Mm(i, t) {
  function e() {
    let P = !1;
    const et = new ue();
    let it = null;
    const ut = new ue(0, 0, 0, 0);
    return {
      setMask: function(J) {
        it !== J && !P && (i.colorMask(J, J, J, J), it = J);
      },
      setLocked: function(J) {
        P = J;
      },
      setClear: function(J, q, mt, Lt, ie) {
        ie === !0 && (J *= Lt, q *= Lt, mt *= Lt), et.set(J, q, mt, Lt), ut.equals(et) === !1 && (i.clearColor(J, q, mt, Lt), ut.copy(et));
      },
      reset: function() {
        P = !1, it = null, ut.set(-1, 0, 0, 0);
      }
    };
  }
  function n() {
    let P = !1, et = !1, it = null, ut = null, J = null;
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
        q ? K(i.DEPTH_TEST) : ft(i.DEPTH_TEST);
      },
      setMask: function(q) {
        it !== q && !P && (i.depthMask(q), it = q);
      },
      setFunc: function(q) {
        if (et && (q = xm[q]), ut !== q) {
          switch (q) {
            case Ns:
              i.depthFunc(i.NEVER);
              break;
            case Fs:
              i.depthFunc(i.ALWAYS);
              break;
            case Os:
              i.depthFunc(i.LESS);
              break;
            case Di:
              i.depthFunc(i.LEQUAL);
              break;
            case Bs:
              i.depthFunc(i.EQUAL);
              break;
            case ks:
              i.depthFunc(i.GEQUAL);
              break;
            case zs:
              i.depthFunc(i.GREATER);
              break;
            case Hs:
              i.depthFunc(i.NOTEQUAL);
              break;
            default:
              i.depthFunc(i.LEQUAL);
          }
          ut = q;
        }
      },
      setLocked: function(q) {
        P = q;
      },
      setClear: function(q) {
        J !== q && (et && (q = 1 - q), i.clearDepth(q), J = q);
      },
      reset: function() {
        P = !1, it = null, ut = null, J = null, et = !1;
      }
    };
  }
  function r() {
    let P = !1, et = null, it = null, ut = null, J = null, q = null, mt = null, Lt = null, ie = null;
    return {
      setTest: function(Zt) {
        P || (Zt ? K(i.STENCIL_TEST) : ft(i.STENCIL_TEST));
      },
      setMask: function(Zt) {
        et !== Zt && !P && (i.stencilMask(Zt), et = Zt);
      },
      setFunc: function(Zt, un, tn) {
        (it !== Zt || ut !== un || J !== tn) && (i.stencilFunc(Zt, un, tn), it = Zt, ut = un, J = tn);
      },
      setOp: function(Zt, un, tn) {
        (q !== Zt || mt !== un || Lt !== tn) && (i.stencilOp(Zt, un, tn), q = Zt, mt = un, Lt = tn);
      },
      setLocked: function(Zt) {
        P = Zt;
      },
      setClear: function(Zt) {
        ie !== Zt && (i.clearStencil(Zt), ie = Zt);
      },
      reset: function() {
        P = !1, et = null, it = null, ut = null, J = null, q = null, mt = null, Lt = null, ie = null;
      }
    };
  }
  const s = new e(), a = new n(), o = new r(), l = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap();
  let u = {}, d = {}, f = /* @__PURE__ */ new WeakMap(), m = [], _ = null, v = !1, p = null, h = null, b = null, T = null, M = null, R = null, C = null, w = new Xt(0, 0, 0), N = 0, E = !1, S = null, D = null, O = null, H = null, $ = null;
  const W = i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let Y = !1, j = 0;
  const z = i.getParameter(i.VERSION);
  z.indexOf("WebGL") !== -1 ? (j = parseFloat(/^WebGL (\d)/.exec(z)[1]), Y = j >= 1) : z.indexOf("OpenGL ES") !== -1 && (j = parseFloat(/^OpenGL ES (\d)/.exec(z)[1]), Y = j >= 2);
  let rt = null, ct = {};
  const St = i.getParameter(i.SCISSOR_BOX), Bt = i.getParameter(i.VIEWPORT), zt = new ue().fromArray(St), Yt = new ue().fromArray(Bt);
  function jt(P, et, it, ut) {
    const J = new Uint8Array(4), q = i.createTexture();
    i.bindTexture(P, q), i.texParameteri(P, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(P, i.TEXTURE_MAG_FILTER, i.NEAREST);
    for (let mt = 0; mt < it; mt++)
      P === i.TEXTURE_3D || P === i.TEXTURE_2D_ARRAY ? i.texImage3D(et, 0, i.RGBA, 1, 1, ut, 0, i.RGBA, i.UNSIGNED_BYTE, J) : i.texImage2D(et + mt, 0, i.RGBA, 1, 1, 0, i.RGBA, i.UNSIGNED_BYTE, J);
    return q;
  }
  const X = {};
  X[i.TEXTURE_2D] = jt(i.TEXTURE_2D, i.TEXTURE_2D, 1), X[i.TEXTURE_CUBE_MAP] = jt(i.TEXTURE_CUBE_MAP, i.TEXTURE_CUBE_MAP_POSITIVE_X, 6), X[i.TEXTURE_2D_ARRAY] = jt(i.TEXTURE_2D_ARRAY, i.TEXTURE_2D_ARRAY, 1, 1), X[i.TEXTURE_3D] = jt(i.TEXTURE_3D, i.TEXTURE_3D, 1, 1), s.setClear(0, 0, 0, 1), a.setClear(1), o.setClear(0), K(i.DEPTH_TEST), a.setFunc(Di), Rt(!1), _t(qa), K(i.CULL_FACE), ae(Nn);
  function K(P) {
    u[P] !== !0 && (i.enable(P), u[P] = !0);
  }
  function ft(P) {
    u[P] !== !1 && (i.disable(P), u[P] = !1);
  }
  function Pt(P, et) {
    return d[P] !== et ? (i.bindFramebuffer(P, et), d[P] = et, P === i.DRAW_FRAMEBUFFER && (d[i.FRAMEBUFFER] = et), P === i.FRAMEBUFFER && (d[i.DRAW_FRAMEBUFFER] = et), !0) : !1;
  }
  function yt(P, et) {
    let it = m, ut = !1;
    if (P) {
      it = f.get(et), it === void 0 && (it = [], f.set(et, it));
      const J = P.textures;
      if (it.length !== J.length || it[0] !== i.COLOR_ATTACHMENT0) {
        for (let q = 0, mt = J.length; q < mt; q++)
          it[q] = i.COLOR_ATTACHMENT0 + q;
        it.length = J.length, ut = !0;
      }
    } else
      it[0] !== i.BACK && (it[0] = i.BACK, ut = !0);
    ut && i.drawBuffers(it);
  }
  function Wt(P) {
    return _ !== P ? (i.useProgram(P), _ = P, !0) : !1;
  }
  const ye = {
    [jn]: i.FUNC_ADD,
    [oc]: i.FUNC_SUBTRACT,
    [lc]: i.FUNC_REVERSE_SUBTRACT
  };
  ye[cc] = i.MIN, ye[hc] = i.MAX;
  const A = {
    [dc]: i.ZERO,
    [uc]: i.ONE,
    [fc]: i.SRC_COLOR,
    [Is]: i.SRC_ALPHA,
    [xc]: i.SRC_ALPHA_SATURATE,
    [gc]: i.DST_COLOR,
    [mc]: i.DST_ALPHA,
    [pc]: i.ONE_MINUS_SRC_COLOR,
    [Us]: i.ONE_MINUS_SRC_ALPHA,
    [vc]: i.ONE_MINUS_DST_COLOR,
    [_c]: i.ONE_MINUS_DST_ALPHA,
    [Mc]: i.CONSTANT_COLOR,
    [Sc]: i.ONE_MINUS_CONSTANT_COLOR,
    [Ec]: i.CONSTANT_ALPHA,
    [yc]: i.ONE_MINUS_CONSTANT_ALPHA
  };
  function ae(P, et, it, ut, J, q, mt, Lt, ie, Zt) {
    if (P === Nn) {
      v === !0 && (ft(i.BLEND), v = !1);
      return;
    }
    if (v === !1 && (K(i.BLEND), v = !0), P !== ac) {
      if (P !== p || Zt !== E) {
        if ((h !== jn || M !== jn) && (i.blendEquation(i.FUNC_ADD), h = jn, M = jn), Zt)
          switch (P) {
            case Ri:
              i.blendFuncSeparate(i.ONE, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case $a:
              i.blendFunc(i.ONE, i.ONE);
              break;
            case ja:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case Ka:
              i.blendFuncSeparate(i.DST_COLOR, i.ONE_MINUS_SRC_ALPHA, i.ZERO, i.ONE);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", P);
              break;
          }
        else
          switch (P) {
            case Ri:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case $a:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE, i.ONE, i.ONE);
              break;
            case ja:
              console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");
              break;
            case Ka:
              console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", P);
              break;
          }
        b = null, T = null, R = null, C = null, w.set(0, 0, 0), N = 0, p = P, E = Zt;
      }
      return;
    }
    J = J || et, q = q || it, mt = mt || ut, (et !== h || J !== M) && (i.blendEquationSeparate(ye[et], ye[J]), h = et, M = J), (it !== b || ut !== T || q !== R || mt !== C) && (i.blendFuncSeparate(A[it], A[ut], A[q], A[mt]), b = it, T = ut, R = q, C = mt), (Lt.equals(w) === !1 || ie !== N) && (i.blendColor(Lt.r, Lt.g, Lt.b, ie), w.copy(Lt), N = ie), p = P, E = !1;
  }
  function It(P, et) {
    P.side === Mn ? ft(i.CULL_FACE) : K(i.CULL_FACE);
    let it = P.side === Ne;
    et && (it = !it), Rt(it), P.blending === Ri && P.transparent === !1 ? ae(Nn) : ae(P.blending, P.blendEquation, P.blendSrc, P.blendDst, P.blendEquationAlpha, P.blendSrcAlpha, P.blendDstAlpha, P.blendColor, P.blendAlpha, P.premultipliedAlpha), a.setFunc(P.depthFunc), a.setTest(P.depthTest), a.setMask(P.depthWrite), s.setMask(P.colorWrite);
    const ut = P.stencilWrite;
    o.setTest(ut), ut && (o.setMask(P.stencilWriteMask), o.setFunc(P.stencilFunc, P.stencilRef, P.stencilFuncMask), o.setOp(P.stencilFail, P.stencilZFail, P.stencilZPass)), gt(P.polygonOffset, P.polygonOffsetFactor, P.polygonOffsetUnits), P.alphaToCoverage === !0 ? K(i.SAMPLE_ALPHA_TO_COVERAGE) : ft(i.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function Rt(P) {
    S !== P && (P ? i.frontFace(i.CW) : i.frontFace(i.CCW), S = P);
  }
  function _t(P) {
    P !== ic ? (K(i.CULL_FACE), P !== D && (P === qa ? i.cullFace(i.BACK) : P === rc ? i.cullFace(i.FRONT) : i.cullFace(i.FRONT_AND_BACK))) : ft(i.CULL_FACE), D = P;
  }
  function oe(P) {
    P !== O && (Y && i.lineWidth(P), O = P);
  }
  function gt(P, et, it) {
    P ? (K(i.POLYGON_OFFSET_FILL), (H !== et || $ !== it) && (i.polygonOffset(et, it), H = et, $ = it)) : ft(i.POLYGON_OFFSET_FILL);
  }
  function Ft(P) {
    P ? K(i.SCISSOR_TEST) : ft(i.SCISSOR_TEST);
  }
  function Me(P) {
    P === void 0 && (P = i.TEXTURE0 + W - 1), rt !== P && (i.activeTexture(P), rt = P);
  }
  function fe(P, et, it) {
    it === void 0 && (rt === null ? it = i.TEXTURE0 + W - 1 : it = rt);
    let ut = ct[it];
    ut === void 0 && (ut = { type: void 0, texture: void 0 }, ct[it] = ut), (ut.type !== P || ut.texture !== et) && (rt !== it && (i.activeTexture(it), rt = it), i.bindTexture(P, et || X[P]), ut.type = P, ut.texture = et);
  }
  function y() {
    const P = ct[rt];
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
  function nt() {
    try {
      i.texStorage2D(...arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function vt() {
    try {
      i.texStorage3D(...arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function xt() {
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
  function ht(P) {
    zt.equals(P) === !1 && (i.scissor(P.x, P.y, P.z, P.w), zt.copy(P));
  }
  function wt(P) {
    Yt.equals(P) === !1 && (i.viewport(P.x, P.y, P.z, P.w), Yt.copy(P));
  }
  function Mt(P, et) {
    let it = c.get(et);
    it === void 0 && (it = /* @__PURE__ */ new WeakMap(), c.set(et, it));
    let ut = it.get(P);
    ut === void 0 && (ut = i.getUniformBlockIndex(et, P.name), it.set(P, ut));
  }
  function ot(P, et) {
    const ut = c.get(et).get(P);
    l.get(et) !== ut && (i.uniformBlockBinding(et, ut, P.__bindingPointIndex), l.set(et, ut));
  }
  function Ut() {
    i.disable(i.BLEND), i.disable(i.CULL_FACE), i.disable(i.DEPTH_TEST), i.disable(i.POLYGON_OFFSET_FILL), i.disable(i.SCISSOR_TEST), i.disable(i.STENCIL_TEST), i.disable(i.SAMPLE_ALPHA_TO_COVERAGE), i.blendEquation(i.FUNC_ADD), i.blendFunc(i.ONE, i.ZERO), i.blendFuncSeparate(i.ONE, i.ZERO, i.ONE, i.ZERO), i.blendColor(0, 0, 0, 0), i.colorMask(!0, !0, !0, !0), i.clearColor(0, 0, 0, 0), i.depthMask(!0), i.depthFunc(i.LESS), a.setReversed(!1), i.clearDepth(1), i.stencilMask(4294967295), i.stencilFunc(i.ALWAYS, 0, 4294967295), i.stencilOp(i.KEEP, i.KEEP, i.KEEP), i.clearStencil(0), i.cullFace(i.BACK), i.frontFace(i.CCW), i.polygonOffset(0, 0), i.activeTexture(i.TEXTURE0), i.bindFramebuffer(i.FRAMEBUFFER, null), i.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), i.bindFramebuffer(i.READ_FRAMEBUFFER, null), i.useProgram(null), i.lineWidth(1), i.scissor(0, 0, i.canvas.width, i.canvas.height), i.viewport(0, 0, i.canvas.width, i.canvas.height), u = {}, rt = null, ct = {}, d = {}, f = /* @__PURE__ */ new WeakMap(), m = [], _ = null, v = !1, p = null, h = null, b = null, T = null, M = null, R = null, C = null, w = new Xt(0, 0, 0), N = 0, E = !1, S = null, D = null, O = null, H = null, $ = null, zt.set(0, 0, i.canvas.width, i.canvas.height), Yt.set(0, 0, i.canvas.width, i.canvas.height), s.reset(), a.reset(), o.reset();
  }
  return {
    buffers: {
      color: s,
      depth: a,
      stencil: o
    },
    enable: K,
    disable: ft,
    bindFramebuffer: Pt,
    drawBuffers: yt,
    useProgram: Wt,
    setBlending: ae,
    setMaterial: It,
    setFlipSided: Rt,
    setCullFace: _t,
    setLineWidth: oe,
    setPolygonOffset: gt,
    setScissorTest: Ft,
    activeTexture: Me,
    bindTexture: fe,
    unbindTexture: y,
    compressedTexImage2D: g,
    compressedTexImage3D: F,
    texImage2D: xt,
    texImage3D: tt,
    updateUBOMapping: Mt,
    uniformBlockBinding: ot,
    texStorage2D: nt,
    texStorage3D: vt,
    texSubImage2D: G,
    texSubImage3D: Z,
    compressedTexSubImage2D: V,
    compressedTexSubImage3D: Et,
    scissor: ht,
    viewport: wt,
    reset: Ut
  };
}
function Sm(i, t, e, n, r, s, a) {
  const o = t.has("WEBGL_multisampled_render_to_texture") ? t.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), c = new Dt(), u = /* @__PURE__ */ new WeakMap();
  let d;
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
    ) : Gr("canvas");
  }
  function v(y, g, F) {
    let G = 1;
    const Z = fe(y);
    if ((Z.width > F || Z.height > F) && (G = F / Math.max(Z.width, Z.height)), G < 1)
      if (typeof HTMLImageElement < "u" && y instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && y instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && y instanceof ImageBitmap || typeof VideoFrame < "u" && y instanceof VideoFrame) {
        const V = Math.floor(G * Z.width), Et = Math.floor(G * Z.height);
        d === void 0 && (d = _(V, Et));
        const nt = g ? _(V, Et) : d;
        return nt.width = V, nt.height = Et, nt.getContext("2d").drawImage(y, 0, 0, V, Et), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + Z.width + "x" + Z.height + ") to (" + V + "x" + Et + ")."), nt;
      } else
        return "data" in y && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + Z.width + "x" + Z.height + ")."), y;
    return y;
  }
  function p(y) {
    return y.generateMipmaps;
  }
  function h(y) {
    i.generateMipmap(y);
  }
  function b(y) {
    return y.isWebGLCubeRenderTarget ? i.TEXTURE_CUBE_MAP : y.isWebGL3DRenderTarget ? i.TEXTURE_3D : y.isWebGLArrayRenderTarget || y.isCompressedArrayTexture ? i.TEXTURE_2D_ARRAY : i.TEXTURE_2D;
  }
  function T(y, g, F, G, Z = !1) {
    if (y !== null) {
      if (i[y] !== void 0) return i[y];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + y + "'");
    }
    let V = g;
    if (g === i.RED && (F === i.FLOAT && (V = i.R32F), F === i.HALF_FLOAT && (V = i.R16F), F === i.UNSIGNED_BYTE && (V = i.R8)), g === i.RED_INTEGER && (F === i.UNSIGNED_BYTE && (V = i.R8UI), F === i.UNSIGNED_SHORT && (V = i.R16UI), F === i.UNSIGNED_INT && (V = i.R32UI), F === i.BYTE && (V = i.R8I), F === i.SHORT && (V = i.R16I), F === i.INT && (V = i.R32I)), g === i.RG && (F === i.FLOAT && (V = i.RG32F), F === i.HALF_FLOAT && (V = i.RG16F), F === i.UNSIGNED_BYTE && (V = i.RG8)), g === i.RG_INTEGER && (F === i.UNSIGNED_BYTE && (V = i.RG8UI), F === i.UNSIGNED_SHORT && (V = i.RG16UI), F === i.UNSIGNED_INT && (V = i.RG32UI), F === i.BYTE && (V = i.RG8I), F === i.SHORT && (V = i.RG16I), F === i.INT && (V = i.RG32I)), g === i.RGB_INTEGER && (F === i.UNSIGNED_BYTE && (V = i.RGB8UI), F === i.UNSIGNED_SHORT && (V = i.RGB16UI), F === i.UNSIGNED_INT && (V = i.RGB32UI), F === i.BYTE && (V = i.RGB8I), F === i.SHORT && (V = i.RGB16I), F === i.INT && (V = i.RGB32I)), g === i.RGBA_INTEGER && (F === i.UNSIGNED_BYTE && (V = i.RGBA8UI), F === i.UNSIGNED_SHORT && (V = i.RGBA16UI), F === i.UNSIGNED_INT && (V = i.RGBA32UI), F === i.BYTE && (V = i.RGBA8I), F === i.SHORT && (V = i.RGBA16I), F === i.INT && (V = i.RGBA32I)), g === i.RGB && (F === i.UNSIGNED_INT_5_9_9_9_REV && (V = i.RGB9_E5), F === i.UNSIGNED_INT_10F_11F_11F_REV && (V = i.R11F_G11F_B10F)), g === i.RGBA) {
      const Et = Z ? Hr : $t.getTransfer(G);
      F === i.FLOAT && (V = i.RGBA32F), F === i.HALF_FLOAT && (V = i.RGBA16F), F === i.UNSIGNED_BYTE && (V = Et === te ? i.SRGB8_ALPHA8 : i.RGBA8), F === i.UNSIGNED_SHORT_4_4_4_4 && (V = i.RGBA4), F === i.UNSIGNED_SHORT_5_5_5_1 && (V = i.RGB5_A1);
    }
    return (V === i.R16F || V === i.R32F || V === i.RG16F || V === i.RG32F || V === i.RGBA16F || V === i.RGBA32F) && t.get("EXT_color_buffer_float"), V;
  }
  function M(y, g) {
    let F;
    return y ? g === null || g === ti || g === Qi ? F = i.DEPTH24_STENCIL8 : g === Sn ? F = i.DEPTH32F_STENCIL8 : g === Ji && (F = i.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : g === null || g === ti || g === Qi ? F = i.DEPTH_COMPONENT24 : g === Sn ? F = i.DEPTH_COMPONENT32F : g === Ji && (F = i.DEPTH_COMPONENT16), F;
  }
  function R(y, g) {
    return p(y) === !0 || y.isFramebufferTexture && y.minFilter !== Je && y.minFilter !== nn ? Math.log2(Math.max(g.width, g.height)) + 1 : y.mipmaps !== void 0 && y.mipmaps.length > 0 ? y.mipmaps.length : y.isCompressedTexture && Array.isArray(y.image) ? g.mipmaps.length : 1;
  }
  function C(y) {
    const g = y.target;
    g.removeEventListener("dispose", C), N(g), g.isVideoTexture && u.delete(g);
  }
  function w(y) {
    const g = y.target;
    g.removeEventListener("dispose", w), S(g);
  }
  function N(y) {
    const g = n.get(y);
    if (g.__webglInit === void 0) return;
    const F = y.source, G = f.get(F);
    if (G) {
      const Z = G[g.__cacheKey];
      Z.usedTimes--, Z.usedTimes === 0 && E(y), Object.keys(G).length === 0 && f.delete(F);
    }
    n.remove(y);
  }
  function E(y) {
    const g = n.get(y);
    i.deleteTexture(g.__webglTexture);
    const F = y.source, G = f.get(F);
    delete G[g.__cacheKey], a.memory.textures--;
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
      V.__webglTexture && (i.deleteTexture(V.__webglTexture), a.memory.textures--), n.remove(F[G]);
    }
    n.remove(y);
  }
  let D = 0;
  function O() {
    D = 0;
  }
  function H() {
    const y = D;
    return y >= r.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + y + " texture units while this GPU supports only " + r.maxTextures), D += 1, y;
  }
  function $(y) {
    const g = [];
    return g.push(y.wrapS), g.push(y.wrapT), g.push(y.wrapR || 0), g.push(y.magFilter), g.push(y.minFilter), g.push(y.anisotropy), g.push(y.internalFormat), g.push(y.format), g.push(y.type), g.push(y.generateMipmaps), g.push(y.premultiplyAlpha), g.push(y.flipY), g.push(y.unpackAlignment), g.push(y.colorSpace), g.join();
  }
  function W(y, g) {
    const F = n.get(y);
    if (y.isVideoTexture && Ft(y), y.isRenderTargetTexture === !1 && y.isExternalTexture !== !0 && y.version > 0 && F.__version !== y.version) {
      const G = y.image;
      if (G === null)
        console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if (G.complete === !1)
        console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        X(F, y, g);
        return;
      }
    } else y.isExternalTexture && (F.__webglTexture = y.sourceTexture ? y.sourceTexture : null);
    e.bindTexture(i.TEXTURE_2D, F.__webglTexture, i.TEXTURE0 + g);
  }
  function Y(y, g) {
    const F = n.get(y);
    if (y.isRenderTargetTexture === !1 && y.version > 0 && F.__version !== y.version) {
      X(F, y, g);
      return;
    }
    e.bindTexture(i.TEXTURE_2D_ARRAY, F.__webglTexture, i.TEXTURE0 + g);
  }
  function j(y, g) {
    const F = n.get(y);
    if (y.isRenderTargetTexture === !1 && y.version > 0 && F.__version !== y.version) {
      X(F, y, g);
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
  const rt = {
    [Ws]: i.REPEAT,
    [Zn]: i.CLAMP_TO_EDGE,
    [Xs]: i.MIRRORED_REPEAT
  }, ct = {
    [Je]: i.NEAREST,
    [Ic]: i.NEAREST_MIPMAP_NEAREST,
    [cr]: i.NEAREST_MIPMAP_LINEAR,
    [nn]: i.LINEAR,
    [Qr]: i.LINEAR_MIPMAP_NEAREST,
    [Jn]: i.LINEAR_MIPMAP_LINEAR
  }, St = {
    [Oc]: i.NEVER,
    [Gc]: i.ALWAYS,
    [Bc]: i.LESS,
    [Ml]: i.LEQUAL,
    [kc]: i.EQUAL,
    [Vc]: i.GEQUAL,
    [zc]: i.GREATER,
    [Hc]: i.NOTEQUAL
  };
  function Bt(y, g) {
    if (g.type === Sn && t.has("OES_texture_float_linear") === !1 && (g.magFilter === nn || g.magFilter === Qr || g.magFilter === cr || g.magFilter === Jn || g.minFilter === nn || g.minFilter === Qr || g.minFilter === cr || g.minFilter === Jn) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), i.texParameteri(y, i.TEXTURE_WRAP_S, rt[g.wrapS]), i.texParameteri(y, i.TEXTURE_WRAP_T, rt[g.wrapT]), (y === i.TEXTURE_3D || y === i.TEXTURE_2D_ARRAY) && i.texParameteri(y, i.TEXTURE_WRAP_R, rt[g.wrapR]), i.texParameteri(y, i.TEXTURE_MAG_FILTER, ct[g.magFilter]), i.texParameteri(y, i.TEXTURE_MIN_FILTER, ct[g.minFilter]), g.compareFunction && (i.texParameteri(y, i.TEXTURE_COMPARE_MODE, i.COMPARE_REF_TO_TEXTURE), i.texParameteri(y, i.TEXTURE_COMPARE_FUNC, St[g.compareFunction])), t.has("EXT_texture_filter_anisotropic") === !0) {
      if (g.magFilter === Je || g.minFilter !== cr && g.minFilter !== Jn || g.type === Sn && t.has("OES_texture_float_linear") === !1) return;
      if (g.anisotropy > 1 || n.get(g).__currentAnisotropy) {
        const F = t.get("EXT_texture_filter_anisotropic");
        i.texParameterf(y, F.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(g.anisotropy, r.getMaxAnisotropy())), n.get(g).__currentAnisotropy = g.anisotropy;
      }
    }
  }
  function zt(y, g) {
    let F = !1;
    y.__webglInit === void 0 && (y.__webglInit = !0, g.addEventListener("dispose", C));
    const G = g.source;
    let Z = f.get(G);
    Z === void 0 && (Z = {}, f.set(G, Z));
    const V = $(g);
    if (V !== y.__cacheKey) {
      Z[V] === void 0 && (Z[V] = {
        texture: i.createTexture(),
        usedTimes: 0
      }, a.memory.textures++, F = !0), Z[V].usedTimes++;
      const Et = Z[y.__cacheKey];
      Et !== void 0 && (Z[y.__cacheKey].usedTimes--, Et.usedTimes === 0 && E(g)), y.__cacheKey = V, y.__webglTexture = Z[V].texture;
    }
    return F;
  }
  function Yt(y, g, F) {
    return Math.floor(Math.floor(y / F) / g);
  }
  function jt(y, g, F, G) {
    const V = y.updateRanges;
    if (V.length === 0)
      e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, g.width, g.height, F, G, g.data);
    else {
      V.sort((tt, ht) => tt.start - ht.start);
      let Et = 0;
      for (let tt = 1; tt < V.length; tt++) {
        const ht = V[Et], wt = V[tt], Mt = ht.start + ht.count, ot = Yt(wt.start, g.width, 4), Ut = Yt(ht.start, g.width, 4);
        wt.start <= Mt + 1 && ot === Ut && Yt(wt.start + wt.count - 1, g.width, 4) === ot ? ht.count = Math.max(
          ht.count,
          wt.start + wt.count - ht.start
        ) : (++Et, V[Et] = wt);
      }
      V.length = Et + 1;
      const nt = i.getParameter(i.UNPACK_ROW_LENGTH), vt = i.getParameter(i.UNPACK_SKIP_PIXELS), xt = i.getParameter(i.UNPACK_SKIP_ROWS);
      i.pixelStorei(i.UNPACK_ROW_LENGTH, g.width);
      for (let tt = 0, ht = V.length; tt < ht; tt++) {
        const wt = V[tt], Mt = Math.floor(wt.start / 4), ot = Math.ceil(wt.count / 4), Ut = Mt % g.width, P = Math.floor(Mt / g.width), et = ot, it = 1;
        i.pixelStorei(i.UNPACK_SKIP_PIXELS, Ut), i.pixelStorei(i.UNPACK_SKIP_ROWS, P), e.texSubImage2D(i.TEXTURE_2D, 0, Ut, P, et, it, F, G, g.data);
      }
      y.clearUpdateRanges(), i.pixelStorei(i.UNPACK_ROW_LENGTH, nt), i.pixelStorei(i.UNPACK_SKIP_PIXELS, vt), i.pixelStorei(i.UNPACK_SKIP_ROWS, xt);
    }
  }
  function X(y, g, F) {
    let G = i.TEXTURE_2D;
    (g.isDataArrayTexture || g.isCompressedArrayTexture) && (G = i.TEXTURE_2D_ARRAY), g.isData3DTexture && (G = i.TEXTURE_3D);
    const Z = zt(y, g), V = g.source;
    e.bindTexture(G, y.__webglTexture, i.TEXTURE0 + F);
    const Et = n.get(V);
    if (V.version !== Et.__version || Z === !0) {
      e.activeTexture(i.TEXTURE0 + F);
      const nt = $t.getPrimaries($t.workingColorSpace), vt = g.colorSpace === In ? null : $t.getPrimaries(g.colorSpace), xt = g.colorSpace === In || nt === vt ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, g.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, g.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, g.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, xt);
      let tt = v(g.image, !1, r.maxTextureSize);
      tt = Me(g, tt);
      const ht = s.convert(g.format, g.colorSpace), wt = s.convert(g.type);
      let Mt = T(g.internalFormat, ht, wt, g.colorSpace, g.isVideoTexture);
      Bt(G, g);
      let ot;
      const Ut = g.mipmaps, P = g.isVideoTexture !== !0, et = Et.__version === void 0 || Z === !0, it = V.dataReady, ut = R(g, tt);
      if (g.isDepthTexture)
        Mt = M(g.format === er, g.type), et && (P ? e.texStorage2D(i.TEXTURE_2D, 1, Mt, tt.width, tt.height) : e.texImage2D(i.TEXTURE_2D, 0, Mt, tt.width, tt.height, 0, ht, wt, null));
      else if (g.isDataTexture)
        if (Ut.length > 0) {
          P && et && e.texStorage2D(i.TEXTURE_2D, ut, Mt, Ut[0].width, Ut[0].height);
          for (let J = 0, q = Ut.length; J < q; J++)
            ot = Ut[J], P ? it && e.texSubImage2D(i.TEXTURE_2D, J, 0, 0, ot.width, ot.height, ht, wt, ot.data) : e.texImage2D(i.TEXTURE_2D, J, Mt, ot.width, ot.height, 0, ht, wt, ot.data);
          g.generateMipmaps = !1;
        } else
          P ? (et && e.texStorage2D(i.TEXTURE_2D, ut, Mt, tt.width, tt.height), it && jt(g, tt, ht, wt)) : e.texImage2D(i.TEXTURE_2D, 0, Mt, tt.width, tt.height, 0, ht, wt, tt.data);
      else if (g.isCompressedTexture)
        if (g.isCompressedArrayTexture) {
          P && et && e.texStorage3D(i.TEXTURE_2D_ARRAY, ut, Mt, Ut[0].width, Ut[0].height, tt.depth);
          for (let J = 0, q = Ut.length; J < q; J++)
            if (ot = Ut[J], g.format !== Ke)
              if (ht !== null)
                if (P) {
                  if (it)
                    if (g.layerUpdates.size > 0) {
                      const mt = Do(ot.width, ot.height, g.format, g.type);
                      for (const Lt of g.layerUpdates) {
                        const ie = ot.data.subarray(
                          Lt * mt / ot.data.BYTES_PER_ELEMENT,
                          (Lt + 1) * mt / ot.data.BYTES_PER_ELEMENT
                        );
                        e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, J, 0, 0, Lt, ot.width, ot.height, 1, ht, ie);
                      }
                      g.clearLayerUpdates();
                    } else
                      e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, J, 0, 0, 0, ot.width, ot.height, tt.depth, ht, ot.data);
                } else
                  e.compressedTexImage3D(i.TEXTURE_2D_ARRAY, J, Mt, ot.width, ot.height, tt.depth, 0, ot.data, 0, 0);
              else
                console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
            else
              P ? it && e.texSubImage3D(i.TEXTURE_2D_ARRAY, J, 0, 0, 0, ot.width, ot.height, tt.depth, ht, wt, ot.data) : e.texImage3D(i.TEXTURE_2D_ARRAY, J, Mt, ot.width, ot.height, tt.depth, 0, ht, wt, ot.data);
        } else {
          P && et && e.texStorage2D(i.TEXTURE_2D, ut, Mt, Ut[0].width, Ut[0].height);
          for (let J = 0, q = Ut.length; J < q; J++)
            ot = Ut[J], g.format !== Ke ? ht !== null ? P ? it && e.compressedTexSubImage2D(i.TEXTURE_2D, J, 0, 0, ot.width, ot.height, ht, ot.data) : e.compressedTexImage2D(i.TEXTURE_2D, J, Mt, ot.width, ot.height, 0, ot.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : P ? it && e.texSubImage2D(i.TEXTURE_2D, J, 0, 0, ot.width, ot.height, ht, wt, ot.data) : e.texImage2D(i.TEXTURE_2D, J, Mt, ot.width, ot.height, 0, ht, wt, ot.data);
        }
      else if (g.isDataArrayTexture)
        if (P) {
          if (et && e.texStorage3D(i.TEXTURE_2D_ARRAY, ut, Mt, tt.width, tt.height, tt.depth), it)
            if (g.layerUpdates.size > 0) {
              const J = Do(tt.width, tt.height, g.format, g.type);
              for (const q of g.layerUpdates) {
                const mt = tt.data.subarray(
                  q * J / tt.data.BYTES_PER_ELEMENT,
                  (q + 1) * J / tt.data.BYTES_PER_ELEMENT
                );
                e.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, q, tt.width, tt.height, 1, ht, wt, mt);
              }
              g.clearLayerUpdates();
            } else
              e.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, 0, tt.width, tt.height, tt.depth, ht, wt, tt.data);
        } else
          e.texImage3D(i.TEXTURE_2D_ARRAY, 0, Mt, tt.width, tt.height, tt.depth, 0, ht, wt, tt.data);
      else if (g.isData3DTexture)
        P ? (et && e.texStorage3D(i.TEXTURE_3D, ut, Mt, tt.width, tt.height, tt.depth), it && e.texSubImage3D(i.TEXTURE_3D, 0, 0, 0, 0, tt.width, tt.height, tt.depth, ht, wt, tt.data)) : e.texImage3D(i.TEXTURE_3D, 0, Mt, tt.width, tt.height, tt.depth, 0, ht, wt, tt.data);
      else if (g.isFramebufferTexture) {
        if (et)
          if (P)
            e.texStorage2D(i.TEXTURE_2D, ut, Mt, tt.width, tt.height);
          else {
            let J = tt.width, q = tt.height;
            for (let mt = 0; mt < ut; mt++)
              e.texImage2D(i.TEXTURE_2D, mt, Mt, J, q, 0, ht, wt, null), J >>= 1, q >>= 1;
          }
      } else if (Ut.length > 0) {
        if (P && et) {
          const J = fe(Ut[0]);
          e.texStorage2D(i.TEXTURE_2D, ut, Mt, J.width, J.height);
        }
        for (let J = 0, q = Ut.length; J < q; J++)
          ot = Ut[J], P ? it && e.texSubImage2D(i.TEXTURE_2D, J, 0, 0, ht, wt, ot) : e.texImage2D(i.TEXTURE_2D, J, Mt, ht, wt, ot);
        g.generateMipmaps = !1;
      } else if (P) {
        if (et) {
          const J = fe(tt);
          e.texStorage2D(i.TEXTURE_2D, ut, Mt, J.width, J.height);
        }
        it && e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, ht, wt, tt);
      } else
        e.texImage2D(i.TEXTURE_2D, 0, Mt, ht, wt, tt);
      p(g) && h(G), Et.__version = V.version, g.onUpdate && g.onUpdate(g);
    }
    y.__version = g.version;
  }
  function K(y, g, F) {
    if (g.image.length !== 6) return;
    const G = zt(y, g), Z = g.source;
    e.bindTexture(i.TEXTURE_CUBE_MAP, y.__webglTexture, i.TEXTURE0 + F);
    const V = n.get(Z);
    if (Z.version !== V.__version || G === !0) {
      e.activeTexture(i.TEXTURE0 + F);
      const Et = $t.getPrimaries($t.workingColorSpace), nt = g.colorSpace === In ? null : $t.getPrimaries(g.colorSpace), vt = g.colorSpace === In || Et === nt ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, g.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, g.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, g.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, vt);
      const xt = g.isCompressedTexture || g.image[0].isCompressedTexture, tt = g.image[0] && g.image[0].isDataTexture, ht = [];
      for (let q = 0; q < 6; q++)
        !xt && !tt ? ht[q] = v(g.image[q], !0, r.maxCubemapSize) : ht[q] = tt ? g.image[q].image : g.image[q], ht[q] = Me(g, ht[q]);
      const wt = ht[0], Mt = s.convert(g.format, g.colorSpace), ot = s.convert(g.type), Ut = T(g.internalFormat, Mt, ot, g.colorSpace), P = g.isVideoTexture !== !0, et = V.__version === void 0 || G === !0, it = Z.dataReady;
      let ut = R(g, wt);
      Bt(i.TEXTURE_CUBE_MAP, g);
      let J;
      if (xt) {
        P && et && e.texStorage2D(i.TEXTURE_CUBE_MAP, ut, Ut, wt.width, wt.height);
        for (let q = 0; q < 6; q++) {
          J = ht[q].mipmaps;
          for (let mt = 0; mt < J.length; mt++) {
            const Lt = J[mt];
            g.format !== Ke ? Mt !== null ? P ? it && e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, mt, 0, 0, Lt.width, Lt.height, Mt, Lt.data) : e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, mt, Ut, Lt.width, Lt.height, 0, Lt.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : P ? it && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, mt, 0, 0, Lt.width, Lt.height, Mt, ot, Lt.data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, mt, Ut, Lt.width, Lt.height, 0, Mt, ot, Lt.data);
          }
        }
      } else {
        if (J = g.mipmaps, P && et) {
          J.length > 0 && ut++;
          const q = fe(ht[0]);
          e.texStorage2D(i.TEXTURE_CUBE_MAP, ut, Ut, q.width, q.height);
        }
        for (let q = 0; q < 6; q++)
          if (tt) {
            P ? it && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, 0, 0, 0, ht[q].width, ht[q].height, Mt, ot, ht[q].data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, 0, Ut, ht[q].width, ht[q].height, 0, Mt, ot, ht[q].data);
            for (let mt = 0; mt < J.length; mt++) {
              const ie = J[mt].image[q].image;
              P ? it && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, mt + 1, 0, 0, ie.width, ie.height, Mt, ot, ie.data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, mt + 1, Ut, ie.width, ie.height, 0, Mt, ot, ie.data);
            }
          } else {
            P ? it && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, 0, 0, 0, Mt, ot, ht[q]) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, 0, Ut, Mt, ot, ht[q]);
            for (let mt = 0; mt < J.length; mt++) {
              const Lt = J[mt];
              P ? it && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, mt + 1, 0, 0, Mt, ot, Lt.image[q]) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, mt + 1, Ut, Mt, ot, Lt.image[q]);
            }
          }
      }
      p(g) && h(i.TEXTURE_CUBE_MAP), V.__version = Z.version, g.onUpdate && g.onUpdate(g);
    }
    y.__version = g.version;
  }
  function ft(y, g, F, G, Z, V) {
    const Et = s.convert(F.format, F.colorSpace), nt = s.convert(F.type), vt = T(F.internalFormat, Et, nt, F.colorSpace), xt = n.get(g), tt = n.get(F);
    if (tt.__renderTarget = g, !xt.__hasExternalTextures) {
      const ht = Math.max(1, g.width >> V), wt = Math.max(1, g.height >> V);
      Z === i.TEXTURE_3D || Z === i.TEXTURE_2D_ARRAY ? e.texImage3D(Z, V, vt, ht, wt, g.depth, 0, Et, nt, null) : e.texImage2D(Z, V, vt, ht, wt, 0, Et, nt, null);
    }
    e.bindFramebuffer(i.FRAMEBUFFER, y), gt(g) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, G, Z, tt.__webglTexture, 0, oe(g)) : (Z === i.TEXTURE_2D || Z >= i.TEXTURE_CUBE_MAP_POSITIVE_X && Z <= i.TEXTURE_CUBE_MAP_NEGATIVE_Z) && i.framebufferTexture2D(i.FRAMEBUFFER, G, Z, tt.__webglTexture, V), e.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function Pt(y, g, F) {
    if (i.bindRenderbuffer(i.RENDERBUFFER, y), g.depthBuffer) {
      const G = g.depthTexture, Z = G && G.isDepthTexture ? G.type : null, V = M(g.stencilBuffer, Z), Et = g.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, nt = oe(g);
      gt(g) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, nt, V, g.width, g.height) : F ? i.renderbufferStorageMultisample(i.RENDERBUFFER, nt, V, g.width, g.height) : i.renderbufferStorage(i.RENDERBUFFER, V, g.width, g.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, Et, i.RENDERBUFFER, y);
    } else {
      const G = g.textures;
      for (let Z = 0; Z < G.length; Z++) {
        const V = G[Z], Et = s.convert(V.format, V.colorSpace), nt = s.convert(V.type), vt = T(V.internalFormat, Et, nt, V.colorSpace), xt = oe(g);
        F && gt(g) === !1 ? i.renderbufferStorageMultisample(i.RENDERBUFFER, xt, vt, g.width, g.height) : gt(g) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, xt, vt, g.width, g.height) : i.renderbufferStorage(i.RENDERBUFFER, vt, g.width, g.height);
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
    const Z = G.__webglTexture, V = oe(g);
    if (g.depthTexture.format === tr)
      gt(g) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, Z, 0, V) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, Z, 0);
    else if (g.depthTexture.format === er)
      gt(g) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, Z, 0, V) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, Z, 0);
    else
      throw new Error("Unknown depthTexture format");
  }
  function Wt(y) {
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
  function ye(y, g, F) {
    const G = n.get(y);
    g !== void 0 && ft(G.__webglFramebuffer, y, y.texture, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, 0), F !== void 0 && Wt(y);
  }
  function A(y) {
    const g = y.texture, F = n.get(y), G = n.get(g);
    y.addEventListener("dispose", w);
    const Z = y.textures, V = y.isWebGLCubeRenderTarget === !0, Et = Z.length > 1;
    if (Et || (G.__webglTexture === void 0 && (G.__webglTexture = i.createTexture()), G.__version = g.version, a.memory.textures++), V) {
      F.__webglFramebuffer = [];
      for (let nt = 0; nt < 6; nt++)
        if (g.mipmaps && g.mipmaps.length > 0) {
          F.__webglFramebuffer[nt] = [];
          for (let vt = 0; vt < g.mipmaps.length; vt++)
            F.__webglFramebuffer[nt][vt] = i.createFramebuffer();
        } else
          F.__webglFramebuffer[nt] = i.createFramebuffer();
    } else {
      if (g.mipmaps && g.mipmaps.length > 0) {
        F.__webglFramebuffer = [];
        for (let nt = 0; nt < g.mipmaps.length; nt++)
          F.__webglFramebuffer[nt] = i.createFramebuffer();
      } else
        F.__webglFramebuffer = i.createFramebuffer();
      if (Et)
        for (let nt = 0, vt = Z.length; nt < vt; nt++) {
          const xt = n.get(Z[nt]);
          xt.__webglTexture === void 0 && (xt.__webglTexture = i.createTexture(), a.memory.textures++);
        }
      if (y.samples > 0 && gt(y) === !1) {
        F.__webglMultisampledFramebuffer = i.createFramebuffer(), F.__webglColorRenderbuffer = [], e.bindFramebuffer(i.FRAMEBUFFER, F.__webglMultisampledFramebuffer);
        for (let nt = 0; nt < Z.length; nt++) {
          const vt = Z[nt];
          F.__webglColorRenderbuffer[nt] = i.createRenderbuffer(), i.bindRenderbuffer(i.RENDERBUFFER, F.__webglColorRenderbuffer[nt]);
          const xt = s.convert(vt.format, vt.colorSpace), tt = s.convert(vt.type), ht = T(vt.internalFormat, xt, tt, vt.colorSpace, y.isXRRenderTarget === !0), wt = oe(y);
          i.renderbufferStorageMultisample(i.RENDERBUFFER, wt, ht, y.width, y.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + nt, i.RENDERBUFFER, F.__webglColorRenderbuffer[nt]);
        }
        i.bindRenderbuffer(i.RENDERBUFFER, null), y.depthBuffer && (F.__webglDepthRenderbuffer = i.createRenderbuffer(), Pt(F.__webglDepthRenderbuffer, y, !0)), e.bindFramebuffer(i.FRAMEBUFFER, null);
      }
    }
    if (V) {
      e.bindTexture(i.TEXTURE_CUBE_MAP, G.__webglTexture), Bt(i.TEXTURE_CUBE_MAP, g);
      for (let nt = 0; nt < 6; nt++)
        if (g.mipmaps && g.mipmaps.length > 0)
          for (let vt = 0; vt < g.mipmaps.length; vt++)
            ft(F.__webglFramebuffer[nt][vt], y, g, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + nt, vt);
        else
          ft(F.__webglFramebuffer[nt], y, g, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + nt, 0);
      p(g) && h(i.TEXTURE_CUBE_MAP), e.unbindTexture();
    } else if (Et) {
      for (let nt = 0, vt = Z.length; nt < vt; nt++) {
        const xt = Z[nt], tt = n.get(xt);
        let ht = i.TEXTURE_2D;
        (y.isWebGL3DRenderTarget || y.isWebGLArrayRenderTarget) && (ht = y.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY), e.bindTexture(ht, tt.__webglTexture), Bt(ht, xt), ft(F.__webglFramebuffer, y, xt, i.COLOR_ATTACHMENT0 + nt, ht, 0), p(xt) && h(ht);
      }
      e.unbindTexture();
    } else {
      let nt = i.TEXTURE_2D;
      if ((y.isWebGL3DRenderTarget || y.isWebGLArrayRenderTarget) && (nt = y.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY), e.bindTexture(nt, G.__webglTexture), Bt(nt, g), g.mipmaps && g.mipmaps.length > 0)
        for (let vt = 0; vt < g.mipmaps.length; vt++)
          ft(F.__webglFramebuffer[vt], y, g, i.COLOR_ATTACHMENT0, nt, vt);
      else
        ft(F.__webglFramebuffer, y, g, i.COLOR_ATTACHMENT0, nt, 0);
      p(g) && h(nt), e.unbindTexture();
    }
    y.depthBuffer && Wt(y);
  }
  function ae(y) {
    const g = y.textures;
    for (let F = 0, G = g.length; F < G; F++) {
      const Z = g[F];
      if (p(Z)) {
        const V = b(y), Et = n.get(Z).__webglTexture;
        e.bindTexture(V, Et), h(V), e.unbindTexture();
      }
    }
  }
  const It = [], Rt = [];
  function _t(y) {
    if (y.samples > 0) {
      if (gt(y) === !1) {
        const g = y.textures, F = y.width, G = y.height;
        let Z = i.COLOR_BUFFER_BIT;
        const V = y.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, Et = n.get(y), nt = g.length > 1;
        if (nt)
          for (let xt = 0; xt < g.length; xt++)
            e.bindFramebuffer(i.FRAMEBUFFER, Et.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + xt, i.RENDERBUFFER, null), e.bindFramebuffer(i.FRAMEBUFFER, Et.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + xt, i.TEXTURE_2D, null, 0);
        e.bindFramebuffer(i.READ_FRAMEBUFFER, Et.__webglMultisampledFramebuffer);
        const vt = y.texture.mipmaps;
        vt && vt.length > 0 ? e.bindFramebuffer(i.DRAW_FRAMEBUFFER, Et.__webglFramebuffer[0]) : e.bindFramebuffer(i.DRAW_FRAMEBUFFER, Et.__webglFramebuffer);
        for (let xt = 0; xt < g.length; xt++) {
          if (y.resolveDepthBuffer && (y.depthBuffer && (Z |= i.DEPTH_BUFFER_BIT), y.stencilBuffer && y.resolveStencilBuffer && (Z |= i.STENCIL_BUFFER_BIT)), nt) {
            i.framebufferRenderbuffer(i.READ_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.RENDERBUFFER, Et.__webglColorRenderbuffer[xt]);
            const tt = n.get(g[xt]).__webglTexture;
            i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, tt, 0);
          }
          i.blitFramebuffer(0, 0, F, G, 0, 0, F, G, Z, i.NEAREST), l === !0 && (It.length = 0, Rt.length = 0, It.push(i.COLOR_ATTACHMENT0 + xt), y.depthBuffer && y.resolveDepthBuffer === !1 && (It.push(V), Rt.push(V), i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, Rt)), i.invalidateFramebuffer(i.READ_FRAMEBUFFER, It));
        }
        if (e.bindFramebuffer(i.READ_FRAMEBUFFER, null), e.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), nt)
          for (let xt = 0; xt < g.length; xt++) {
            e.bindFramebuffer(i.FRAMEBUFFER, Et.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + xt, i.RENDERBUFFER, Et.__webglColorRenderbuffer[xt]);
            const tt = n.get(g[xt]).__webglTexture;
            e.bindFramebuffer(i.FRAMEBUFFER, Et.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + xt, i.TEXTURE_2D, tt, 0);
          }
        e.bindFramebuffer(i.DRAW_FRAMEBUFFER, Et.__webglMultisampledFramebuffer);
      } else if (y.depthBuffer && y.resolveDepthBuffer === !1 && l) {
        const g = y.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT;
        i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, [g]);
      }
    }
  }
  function oe(y) {
    return Math.min(r.maxSamples, y.samples);
  }
  function gt(y) {
    const g = n.get(y);
    return y.samples > 0 && t.has("WEBGL_multisampled_render_to_texture") === !0 && g.__useRenderToTexture !== !1;
  }
  function Ft(y) {
    const g = a.render.frame;
    u.get(y) !== g && (u.set(y, g), y.update());
  }
  function Me(y, g) {
    const F = y.colorSpace, G = y.format, Z = y.type;
    return y.isCompressedTexture === !0 || y.isVideoTexture === !0 || F !== Ui && F !== In && ($t.getTransfer(F) === te ? (G !== Ke || Z !== cn) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", F)), g;
  }
  function fe(y) {
    return typeof HTMLImageElement < "u" && y instanceof HTMLImageElement ? (c.width = y.naturalWidth || y.width, c.height = y.naturalHeight || y.height) : typeof VideoFrame < "u" && y instanceof VideoFrame ? (c.width = y.displayWidth, c.height = y.displayHeight) : (c.width = y.width, c.height = y.height), c;
  }
  this.allocateTextureUnit = H, this.resetTextureUnits = O, this.setTexture2D = W, this.setTexture2DArray = Y, this.setTexture3D = j, this.setTextureCube = z, this.rebindTextures = ye, this.setupRenderTarget = A, this.updateRenderTargetMipmap = ae, this.updateMultisampleRenderTarget = _t, this.setupDepthRenderbuffer = Wt, this.setupFrameBufferTexture = ft, this.useMultisampledRTT = gt;
}
function Em(i, t) {
  function e(n, r = In) {
    let s;
    const a = $t.getTransfer(r);
    if (n === cn) return i.UNSIGNED_BYTE;
    if (n === Aa) return i.UNSIGNED_SHORT_4_4_4_4;
    if (n === wa) return i.UNSIGNED_SHORT_5_5_5_1;
    if (n === fl) return i.UNSIGNED_INT_5_9_9_9_REV;
    if (n === pl) return i.UNSIGNED_INT_10F_11F_11F_REV;
    if (n === dl) return i.BYTE;
    if (n === ul) return i.SHORT;
    if (n === Ji) return i.UNSIGNED_SHORT;
    if (n === Ta) return i.INT;
    if (n === ti) return i.UNSIGNED_INT;
    if (n === Sn) return i.FLOAT;
    if (n === rr) return i.HALF_FLOAT;
    if (n === ml) return i.ALPHA;
    if (n === _l) return i.RGB;
    if (n === Ke) return i.RGBA;
    if (n === tr) return i.DEPTH_COMPONENT;
    if (n === er) return i.DEPTH_STENCIL;
    if (n === gl) return i.RED;
    if (n === Ra) return i.RED_INTEGER;
    if (n === vl) return i.RG;
    if (n === Ca) return i.RG_INTEGER;
    if (n === Pa) return i.RGBA_INTEGER;
    if (n === Fr || n === Or || n === Br || n === kr)
      if (a === te)
        if (s = t.get("WEBGL_compressed_texture_s3tc_srgb"), s !== null) {
          if (n === Fr) return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (n === Or) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (n === Br) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (n === kr) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else
          return null;
      else if (s = t.get("WEBGL_compressed_texture_s3tc"), s !== null) {
        if (n === Fr) return s.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (n === Or) return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (n === Br) return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (n === kr) return s.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else
        return null;
    if (n === Ys || n === qs || n === $s || n === js)
      if (s = t.get("WEBGL_compressed_texture_pvrtc"), s !== null) {
        if (n === Ys) return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === qs) return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === $s) return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === js) return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else
        return null;
    if (n === Ks || n === Zs || n === Js)
      if (s = t.get("WEBGL_compressed_texture_etc"), s !== null) {
        if (n === Ks || n === Zs) return a === te ? s.COMPRESSED_SRGB8_ETC2 : s.COMPRESSED_RGB8_ETC2;
        if (n === Js) return a === te ? s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : s.COMPRESSED_RGBA8_ETC2_EAC;
      } else
        return null;
    if (n === Qs || n === ta || n === ea || n === na || n === ia || n === ra || n === sa || n === aa || n === oa || n === la || n === ca || n === ha || n === da || n === ua)
      if (s = t.get("WEBGL_compressed_texture_astc"), s !== null) {
        if (n === Qs) return a === te ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : s.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === ta) return a === te ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : s.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === ea) return a === te ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : s.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === na) return a === te ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : s.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === ia) return a === te ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : s.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === ra) return a === te ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : s.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === sa) return a === te ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : s.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === aa) return a === te ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : s.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === oa) return a === te ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : s.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === la) return a === te ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : s.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === ca) return a === te ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : s.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === ha) return a === te ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : s.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === da) return a === te ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : s.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === ua) return a === te ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : s.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else
        return null;
    if (n === fa || n === pa || n === ma)
      if (s = t.get("EXT_texture_compression_bptc"), s !== null) {
        if (n === fa) return a === te ? s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : s.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === pa) return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === ma) return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else
        return null;
    if (n === _a || n === ga || n === va || n === xa)
      if (s = t.get("EXT_texture_compression_rgtc"), s !== null) {
        if (n === _a) return s.COMPRESSED_RED_RGTC1_EXT;
        if (n === ga) return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === va) return s.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === xa) return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else
        return null;
    return n === Qi ? i.UNSIGNED_INT_24_8 : i[n] !== void 0 ? i[n] : null;
  }
  return { convert: e };
}
const ym = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, bm = `
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
class Tm {
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
      const n = new Dl(t.texture);
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
      const e = t.cameras[0].viewport, n = new kn({
        vertexShader: ym,
        fragmentShader: bm,
        uniforms: {
          depthColor: { value: this.texture },
          depthWidth: { value: e.z },
          depthHeight: { value: e.w }
        }
      });
      this.mesh = new Ze(new ar(20, 20), n);
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
class Am extends ii {
  /**
   * Constructs a new WebGL renderer.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {WebGL2RenderingContext} gl - The rendering context.
   */
  constructor(t, e) {
    super();
    const n = this;
    let r = null, s = 1, a = null, o = "local-floor", l = 1, c = null, u = null, d = null, f = null, m = null, _ = null;
    const v = typeof XRWebGLBinding < "u", p = new Tm(), h = {}, b = e.getContextAttributes();
    let T = null, M = null;
    const R = [], C = [], w = new Dt();
    let N = null;
    const E = new We();
    E.viewport = new ue();
    const S = new We();
    S.viewport = new ue();
    const D = [E, S], O = new Wh();
    let H = null, $ = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(X) {
      let K = R[X];
      return K === void 0 && (K = new Ms(), R[X] = K), K.getTargetRaySpace();
    }, this.getControllerGrip = function(X) {
      let K = R[X];
      return K === void 0 && (K = new Ms(), R[X] = K), K.getGripSpace();
    }, this.getHand = function(X) {
      let K = R[X];
      return K === void 0 && (K = new Ms(), R[X] = K), K.getHandSpace();
    };
    function W(X) {
      const K = C.indexOf(X.inputSource);
      if (K === -1)
        return;
      const ft = R[K];
      ft !== void 0 && (ft.update(X.inputSource, X.frame, c || a), ft.dispatchEvent({ type: X.type, data: X.inputSource }));
    }
    function Y() {
      r.removeEventListener("select", W), r.removeEventListener("selectstart", W), r.removeEventListener("selectend", W), r.removeEventListener("squeeze", W), r.removeEventListener("squeezestart", W), r.removeEventListener("squeezeend", W), r.removeEventListener("end", Y), r.removeEventListener("inputsourceschange", j);
      for (let X = 0; X < R.length; X++) {
        const K = C[X];
        K !== null && (C[X] = null, R[X].disconnect(K));
      }
      H = null, $ = null, p.reset();
      for (const X in h)
        delete h[X];
      t.setRenderTarget(T), m = null, f = null, d = null, r = null, M = null, jt.stop(), n.isPresenting = !1, t.setPixelRatio(N), t.setSize(w.width, w.height, !1), n.dispatchEvent({ type: "sessionend" });
    }
    this.setFramebufferScaleFactor = function(X) {
      s = X, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function(X) {
      o = X, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function() {
      return c || a;
    }, this.setReferenceSpace = function(X) {
      c = X;
    }, this.getBaseLayer = function() {
      return f !== null ? f : m;
    }, this.getBinding = function() {
      return d === null && v && (d = new XRWebGLBinding(r, e)), d;
    }, this.getFrame = function() {
      return _;
    }, this.getSession = function() {
      return r;
    }, this.setSession = async function(X) {
      if (r = X, r !== null) {
        if (T = t.getRenderTarget(), r.addEventListener("select", W), r.addEventListener("selectstart", W), r.addEventListener("selectend", W), r.addEventListener("squeeze", W), r.addEventListener("squeezestart", W), r.addEventListener("squeezeend", W), r.addEventListener("end", Y), r.addEventListener("inputsourceschange", j), b.xrCompatible !== !0 && await e.makeXRCompatible(), N = t.getPixelRatio(), t.getSize(w), v && "createProjectionLayer" in XRWebGLBinding.prototype) {
          let ft = null, Pt = null, yt = null;
          b.depth && (yt = b.stencil ? e.DEPTH24_STENCIL8 : e.DEPTH_COMPONENT24, ft = b.stencil ? er : tr, Pt = b.stencil ? Qi : ti);
          const Wt = {
            colorFormat: e.RGBA8,
            depthFormat: yt,
            scaleFactor: s
          };
          d = this.getBinding(), f = d.createProjectionLayer(Wt), r.updateRenderState({ layers: [f] }), t.setPixelRatio(1), t.setSize(f.textureWidth, f.textureHeight, !1), M = new ni(
            f.textureWidth,
            f.textureHeight,
            {
              format: Ke,
              type: cn,
              depthTexture: new Pl(f.textureWidth, f.textureHeight, Pt, void 0, void 0, void 0, void 0, void 0, void 0, ft),
              stencilBuffer: b.stencil,
              colorSpace: t.outputColorSpace,
              samples: b.antialias ? 4 : 0,
              resolveDepthBuffer: f.ignoreDepthValues === !1,
              resolveStencilBuffer: f.ignoreDepthValues === !1
            }
          );
        } else {
          const ft = {
            antialias: b.antialias,
            alpha: !0,
            depth: b.depth,
            stencil: b.stencil,
            framebufferScaleFactor: s
          };
          m = new XRWebGLLayer(r, e, ft), r.updateRenderState({ baseLayer: m }), t.setPixelRatio(1), t.setSize(m.framebufferWidth, m.framebufferHeight, !1), M = new ni(
            m.framebufferWidth,
            m.framebufferHeight,
            {
              format: Ke,
              type: cn,
              colorSpace: t.outputColorSpace,
              stencilBuffer: b.stencil,
              resolveDepthBuffer: m.ignoreDepthValues === !1,
              resolveStencilBuffer: m.ignoreDepthValues === !1
            }
          );
        }
        M.isXRRenderTarget = !0, this.setFoveation(l), c = null, a = await r.requestReferenceSpace(o), jt.setContext(r), jt.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (r !== null)
        return r.environmentBlendMode;
    }, this.getDepthTexture = function() {
      return p.getDepthTexture();
    };
    function j(X) {
      for (let K = 0; K < X.removed.length; K++) {
        const ft = X.removed[K], Pt = C.indexOf(ft);
        Pt >= 0 && (C[Pt] = null, R[Pt].disconnect(ft));
      }
      for (let K = 0; K < X.added.length; K++) {
        const ft = X.added[K];
        let Pt = C.indexOf(ft);
        if (Pt === -1) {
          for (let Wt = 0; Wt < R.length; Wt++)
            if (Wt >= C.length) {
              C.push(ft), Pt = Wt;
              break;
            } else if (C[Wt] === null) {
              C[Wt] = ft, Pt = Wt;
              break;
            }
          if (Pt === -1) break;
        }
        const yt = R[Pt];
        yt && yt.connect(ft);
      }
    }
    const z = new I(), rt = new I();
    function ct(X, K, ft) {
      z.setFromMatrixPosition(K.matrixWorld), rt.setFromMatrixPosition(ft.matrixWorld);
      const Pt = z.distanceTo(rt), yt = K.projectionMatrix.elements, Wt = ft.projectionMatrix.elements, ye = yt[14] / (yt[10] - 1), A = yt[14] / (yt[10] + 1), ae = (yt[9] + 1) / yt[5], It = (yt[9] - 1) / yt[5], Rt = (yt[8] - 1) / yt[0], _t = (Wt[8] + 1) / Wt[0], oe = ye * Rt, gt = ye * _t, Ft = Pt / (-Rt + _t), Me = Ft * -Rt;
      if (K.matrixWorld.decompose(X.position, X.quaternion, X.scale), X.translateX(Me), X.translateZ(Ft), X.matrixWorld.compose(X.position, X.quaternion, X.scale), X.matrixWorldInverse.copy(X.matrixWorld).invert(), yt[10] === -1)
        X.projectionMatrix.copy(K.projectionMatrix), X.projectionMatrixInverse.copy(K.projectionMatrixInverse);
      else {
        const fe = ye + Ft, y = A + Ft, g = oe - Me, F = gt + (Pt - Me), G = ae * A / y * fe, Z = It * A / y * fe;
        X.projectionMatrix.makePerspective(g, F, G, Z, fe, y), X.projectionMatrixInverse.copy(X.projectionMatrix).invert();
      }
    }
    function St(X, K) {
      K === null ? X.matrixWorld.copy(X.matrix) : X.matrixWorld.multiplyMatrices(K.matrixWorld, X.matrix), X.matrixWorldInverse.copy(X.matrixWorld).invert();
    }
    this.updateCamera = function(X) {
      if (r === null) return;
      let K = X.near, ft = X.far;
      p.texture !== null && (p.depthNear > 0 && (K = p.depthNear), p.depthFar > 0 && (ft = p.depthFar)), O.near = S.near = E.near = K, O.far = S.far = E.far = ft, (H !== O.near || $ !== O.far) && (r.updateRenderState({
        depthNear: O.near,
        depthFar: O.far
      }), H = O.near, $ = O.far), O.layers.mask = X.layers.mask | 6, E.layers.mask = O.layers.mask & 3, S.layers.mask = O.layers.mask & 5;
      const Pt = X.parent, yt = O.cameras;
      St(O, Pt);
      for (let Wt = 0; Wt < yt.length; Wt++)
        St(yt[Wt], Pt);
      yt.length === 2 ? ct(O, E, S) : O.projectionMatrix.copy(E.projectionMatrix), Bt(X, O, Pt);
    };
    function Bt(X, K, ft) {
      ft === null ? X.matrix.copy(K.matrixWorld) : (X.matrix.copy(ft.matrixWorld), X.matrix.invert(), X.matrix.multiply(K.matrixWorld)), X.matrix.decompose(X.position, X.quaternion, X.scale), X.updateMatrixWorld(!0), X.projectionMatrix.copy(K.projectionMatrix), X.projectionMatrixInverse.copy(K.projectionMatrixInverse), X.isPerspectiveCamera && (X.fov = nr * 2 * Math.atan(1 / X.projectionMatrix.elements[5]), X.zoom = 1);
    }
    this.getCamera = function() {
      return O;
    }, this.getFoveation = function() {
      if (!(f === null && m === null))
        return l;
    }, this.setFoveation = function(X) {
      l = X, f !== null && (f.fixedFoveation = X), m !== null && m.fixedFoveation !== void 0 && (m.fixedFoveation = X);
    }, this.hasDepthSensing = function() {
      return p.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return p.getMesh(O);
    }, this.getCameraTexture = function(X) {
      return h[X];
    };
    let zt = null;
    function Yt(X, K) {
      if (u = K.getViewerPose(c || a), _ = K, u !== null) {
        const ft = u.views;
        m !== null && (t.setRenderTargetFramebuffer(M, m.framebuffer), t.setRenderTarget(M));
        let Pt = !1;
        ft.length !== O.cameras.length && (O.cameras.length = 0, Pt = !0);
        for (let A = 0; A < ft.length; A++) {
          const ae = ft[A];
          let It = null;
          if (m !== null)
            It = m.getViewport(ae);
          else {
            const _t = d.getViewSubImage(f, ae);
            It = _t.viewport, A === 0 && (t.setRenderTargetTextures(
              M,
              _t.colorTexture,
              _t.depthStencilTexture
            ), t.setRenderTarget(M));
          }
          let Rt = D[A];
          Rt === void 0 && (Rt = new We(), Rt.layers.enable(A), Rt.viewport = new ue(), D[A] = Rt), Rt.matrix.fromArray(ae.transform.matrix), Rt.matrix.decompose(Rt.position, Rt.quaternion, Rt.scale), Rt.projectionMatrix.fromArray(ae.projectionMatrix), Rt.projectionMatrixInverse.copy(Rt.projectionMatrix).invert(), Rt.viewport.set(It.x, It.y, It.width, It.height), A === 0 && (O.matrix.copy(Rt.matrix), O.matrix.decompose(O.position, O.quaternion, O.scale)), Pt === !0 && O.cameras.push(Rt);
        }
        const yt = r.enabledFeatures;
        if (yt && yt.includes("depth-sensing") && r.depthUsage == "gpu-optimized" && v) {
          d = n.getBinding();
          const A = d.getDepthInformation(ft[0]);
          A && A.isValid && A.texture && p.init(A, r.renderState);
        }
        if (yt && yt.includes("camera-access") && v) {
          t.state.unbindTexture(), d = n.getBinding();
          for (let A = 0; A < ft.length; A++) {
            const ae = ft[A].camera;
            if (ae) {
              let It = h[ae];
              It || (It = new Dl(), h[ae] = It);
              const Rt = d.getCameraImage(ae);
              It.sourceTexture = Rt;
            }
          }
        }
      }
      for (let ft = 0; ft < R.length; ft++) {
        const Pt = C[ft], yt = R[ft];
        Pt !== null && yt !== void 0 && yt.update(Pt, K, c || a);
      }
      zt && zt(X, K), K.detectedPlanes && n.dispatchEvent({ type: "planesdetected", data: K }), _ = null;
    }
    const jt = new Ul();
    jt.setAnimationLoop(Yt), this.setAnimationLoop = function(X) {
      zt = X;
    }, this.dispose = function() {
    };
  }
}
const qn = /* @__PURE__ */ new hn(), wm = /* @__PURE__ */ new se();
function Rm(i, t) {
  function e(p, h) {
    p.matrixAutoUpdate === !0 && p.updateMatrix(), h.value.copy(p.matrix);
  }
  function n(p, h) {
    h.color.getRGB(p.fogColor.value, wl(i)), h.isFog ? (p.fogNear.value = h.near, p.fogFar.value = h.far) : h.isFogExp2 && (p.fogDensity.value = h.density);
  }
  function r(p, h, b, T, M) {
    h.isMeshBasicMaterial || h.isMeshLambertMaterial ? s(p, h) : h.isMeshToonMaterial ? (s(p, h), d(p, h)) : h.isMeshPhongMaterial ? (s(p, h), u(p, h)) : h.isMeshStandardMaterial ? (s(p, h), f(p, h), h.isMeshPhysicalMaterial && m(p, h, M)) : h.isMeshMatcapMaterial ? (s(p, h), _(p, h)) : h.isMeshDepthMaterial ? s(p, h) : h.isMeshDistanceMaterial ? (s(p, h), v(p, h)) : h.isMeshNormalMaterial ? s(p, h) : h.isLineBasicMaterial ? (a(p, h), h.isLineDashedMaterial && o(p, h)) : h.isPointsMaterial ? l(p, h, b, T) : h.isSpriteMaterial ? c(p, h) : h.isShadowMaterial ? (p.color.value.copy(h.color), p.opacity.value = h.opacity) : h.isShaderMaterial && (h.uniformsNeedUpdate = !1);
  }
  function s(p, h) {
    p.opacity.value = h.opacity, h.color && p.diffuse.value.copy(h.color), h.emissive && p.emissive.value.copy(h.emissive).multiplyScalar(h.emissiveIntensity), h.map && (p.map.value = h.map, e(h.map, p.mapTransform)), h.alphaMap && (p.alphaMap.value = h.alphaMap, e(h.alphaMap, p.alphaMapTransform)), h.bumpMap && (p.bumpMap.value = h.bumpMap, e(h.bumpMap, p.bumpMapTransform), p.bumpScale.value = h.bumpScale, h.side === Ne && (p.bumpScale.value *= -1)), h.normalMap && (p.normalMap.value = h.normalMap, e(h.normalMap, p.normalMapTransform), p.normalScale.value.copy(h.normalScale), h.side === Ne && p.normalScale.value.negate()), h.displacementMap && (p.displacementMap.value = h.displacementMap, e(h.displacementMap, p.displacementMapTransform), p.displacementScale.value = h.displacementScale, p.displacementBias.value = h.displacementBias), h.emissiveMap && (p.emissiveMap.value = h.emissiveMap, e(h.emissiveMap, p.emissiveMapTransform)), h.specularMap && (p.specularMap.value = h.specularMap, e(h.specularMap, p.specularMapTransform)), h.alphaTest > 0 && (p.alphaTest.value = h.alphaTest);
    const b = t.get(h), T = b.envMap, M = b.envMapRotation;
    T && (p.envMap.value = T, qn.copy(M), qn.x *= -1, qn.y *= -1, qn.z *= -1, T.isCubeTexture && T.isRenderTargetTexture === !1 && (qn.y *= -1, qn.z *= -1), p.envMapRotation.value.setFromMatrix4(wm.makeRotationFromEuler(qn)), p.flipEnvMap.value = T.isCubeTexture && T.isRenderTargetTexture === !1 ? -1 : 1, p.reflectivity.value = h.reflectivity, p.ior.value = h.ior, p.refractionRatio.value = h.refractionRatio), h.lightMap && (p.lightMap.value = h.lightMap, p.lightMapIntensity.value = h.lightMapIntensity, e(h.lightMap, p.lightMapTransform)), h.aoMap && (p.aoMap.value = h.aoMap, p.aoMapIntensity.value = h.aoMapIntensity, e(h.aoMap, p.aoMapTransform));
  }
  function a(p, h) {
    p.diffuse.value.copy(h.color), p.opacity.value = h.opacity, h.map && (p.map.value = h.map, e(h.map, p.mapTransform));
  }
  function o(p, h) {
    p.dashSize.value = h.dashSize, p.totalSize.value = h.dashSize + h.gapSize, p.scale.value = h.scale;
  }
  function l(p, h, b, T) {
    p.diffuse.value.copy(h.color), p.opacity.value = h.opacity, p.size.value = h.size * b, p.scale.value = T * 0.5, h.map && (p.map.value = h.map, e(h.map, p.uvTransform)), h.alphaMap && (p.alphaMap.value = h.alphaMap, e(h.alphaMap, p.alphaMapTransform)), h.alphaTest > 0 && (p.alphaTest.value = h.alphaTest);
  }
  function c(p, h) {
    p.diffuse.value.copy(h.color), p.opacity.value = h.opacity, p.rotation.value = h.rotation, h.map && (p.map.value = h.map, e(h.map, p.mapTransform)), h.alphaMap && (p.alphaMap.value = h.alphaMap, e(h.alphaMap, p.alphaMapTransform)), h.alphaTest > 0 && (p.alphaTest.value = h.alphaTest);
  }
  function u(p, h) {
    p.specular.value.copy(h.specular), p.shininess.value = Math.max(h.shininess, 1e-4);
  }
  function d(p, h) {
    h.gradientMap && (p.gradientMap.value = h.gradientMap);
  }
  function f(p, h) {
    p.metalness.value = h.metalness, h.metalnessMap && (p.metalnessMap.value = h.metalnessMap, e(h.metalnessMap, p.metalnessMapTransform)), p.roughness.value = h.roughness, h.roughnessMap && (p.roughnessMap.value = h.roughnessMap, e(h.roughnessMap, p.roughnessMapTransform)), h.envMap && (p.envMapIntensity.value = h.envMapIntensity);
  }
  function m(p, h, b) {
    p.ior.value = h.ior, h.sheen > 0 && (p.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen), p.sheenRoughness.value = h.sheenRoughness, h.sheenColorMap && (p.sheenColorMap.value = h.sheenColorMap, e(h.sheenColorMap, p.sheenColorMapTransform)), h.sheenRoughnessMap && (p.sheenRoughnessMap.value = h.sheenRoughnessMap, e(h.sheenRoughnessMap, p.sheenRoughnessMapTransform))), h.clearcoat > 0 && (p.clearcoat.value = h.clearcoat, p.clearcoatRoughness.value = h.clearcoatRoughness, h.clearcoatMap && (p.clearcoatMap.value = h.clearcoatMap, e(h.clearcoatMap, p.clearcoatMapTransform)), h.clearcoatRoughnessMap && (p.clearcoatRoughnessMap.value = h.clearcoatRoughnessMap, e(h.clearcoatRoughnessMap, p.clearcoatRoughnessMapTransform)), h.clearcoatNormalMap && (p.clearcoatNormalMap.value = h.clearcoatNormalMap, e(h.clearcoatNormalMap, p.clearcoatNormalMapTransform), p.clearcoatNormalScale.value.copy(h.clearcoatNormalScale), h.side === Ne && p.clearcoatNormalScale.value.negate())), h.dispersion > 0 && (p.dispersion.value = h.dispersion), h.iridescence > 0 && (p.iridescence.value = h.iridescence, p.iridescenceIOR.value = h.iridescenceIOR, p.iridescenceThicknessMinimum.value = h.iridescenceThicknessRange[0], p.iridescenceThicknessMaximum.value = h.iridescenceThicknessRange[1], h.iridescenceMap && (p.iridescenceMap.value = h.iridescenceMap, e(h.iridescenceMap, p.iridescenceMapTransform)), h.iridescenceThicknessMap && (p.iridescenceThicknessMap.value = h.iridescenceThicknessMap, e(h.iridescenceThicknessMap, p.iridescenceThicknessMapTransform))), h.transmission > 0 && (p.transmission.value = h.transmission, p.transmissionSamplerMap.value = b.texture, p.transmissionSamplerSize.value.set(b.width, b.height), h.transmissionMap && (p.transmissionMap.value = h.transmissionMap, e(h.transmissionMap, p.transmissionMapTransform)), p.thickness.value = h.thickness, h.thicknessMap && (p.thicknessMap.value = h.thicknessMap, e(h.thicknessMap, p.thicknessMapTransform)), p.attenuationDistance.value = h.attenuationDistance, p.attenuationColor.value.copy(h.attenuationColor)), h.anisotropy > 0 && (p.anisotropyVector.value.set(h.anisotropy * Math.cos(h.anisotropyRotation), h.anisotropy * Math.sin(h.anisotropyRotation)), h.anisotropyMap && (p.anisotropyMap.value = h.anisotropyMap, e(h.anisotropyMap, p.anisotropyMapTransform))), p.specularIntensity.value = h.specularIntensity, p.specularColor.value.copy(h.specularColor), h.specularColorMap && (p.specularColorMap.value = h.specularColorMap, e(h.specularColorMap, p.specularColorMapTransform)), h.specularIntensityMap && (p.specularIntensityMap.value = h.specularIntensityMap, e(h.specularIntensityMap, p.specularIntensityMapTransform));
  }
  function _(p, h) {
    h.matcap && (p.matcap.value = h.matcap);
  }
  function v(p, h) {
    const b = t.get(h).light;
    p.referencePosition.value.setFromMatrixPosition(b.matrixWorld), p.nearDistance.value = b.shadow.camera.near, p.farDistance.value = b.shadow.camera.far;
  }
  return {
    refreshFogUniforms: n,
    refreshMaterialUniforms: r
  };
}
function Cm(i, t, e, n) {
  let r = {}, s = {}, a = [];
  const o = i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(b, T) {
    const M = T.program;
    n.uniformBlockBinding(b, M);
  }
  function c(b, T) {
    let M = r[b.id];
    M === void 0 && (_(b), M = u(b), r[b.id] = M, b.addEventListener("dispose", p));
    const R = T.program;
    n.updateUBOMapping(b, R);
    const C = t.render.frame;
    s[b.id] !== C && (f(b), s[b.id] = C);
  }
  function u(b) {
    const T = d();
    b.__bindingPointIndex = T;
    const M = i.createBuffer(), R = b.__size, C = b.usage;
    return i.bindBuffer(i.UNIFORM_BUFFER, M), i.bufferData(i.UNIFORM_BUFFER, R, C), i.bindBuffer(i.UNIFORM_BUFFER, null), i.bindBufferBase(i.UNIFORM_BUFFER, T, M), M;
  }
  function d() {
    for (let b = 0; b < o; b++)
      if (a.indexOf(b) === -1)
        return a.push(b), b;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function f(b) {
    const T = r[b.id], M = b.uniforms, R = b.__cache;
    i.bindBuffer(i.UNIFORM_BUFFER, T);
    for (let C = 0, w = M.length; C < w; C++) {
      const N = Array.isArray(M[C]) ? M[C] : [M[C]];
      for (let E = 0, S = N.length; E < S; E++) {
        const D = N[E];
        if (m(D, C, E, R) === !0) {
          const O = D.__offset, H = Array.isArray(D.value) ? D.value : [D.value];
          let $ = 0;
          for (let W = 0; W < H.length; W++) {
            const Y = H[W], j = v(Y);
            typeof Y == "number" || typeof Y == "boolean" ? (D.__data[0] = Y, i.bufferSubData(i.UNIFORM_BUFFER, O + $, D.__data)) : Y.isMatrix3 ? (D.__data[0] = Y.elements[0], D.__data[1] = Y.elements[1], D.__data[2] = Y.elements[2], D.__data[3] = 0, D.__data[4] = Y.elements[3], D.__data[5] = Y.elements[4], D.__data[6] = Y.elements[5], D.__data[7] = 0, D.__data[8] = Y.elements[6], D.__data[9] = Y.elements[7], D.__data[10] = Y.elements[8], D.__data[11] = 0) : (Y.toArray(D.__data, $), $ += j.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          i.bufferSubData(i.UNIFORM_BUFFER, O, D.__data);
        }
      }
    }
    i.bindBuffer(i.UNIFORM_BUFFER, null);
  }
  function m(b, T, M, R) {
    const C = b.value, w = T + "_" + M;
    if (R[w] === void 0)
      return typeof C == "number" || typeof C == "boolean" ? R[w] = C : R[w] = C.clone(), !0;
    {
      const N = R[w];
      if (typeof C == "number" || typeof C == "boolean") {
        if (N !== C)
          return R[w] = C, !0;
      } else if (N.equals(C) === !1)
        return N.copy(C), !0;
    }
    return !1;
  }
  function _(b) {
    const T = b.uniforms;
    let M = 0;
    const R = 16;
    for (let w = 0, N = T.length; w < N; w++) {
      const E = Array.isArray(T[w]) ? T[w] : [T[w]];
      for (let S = 0, D = E.length; S < D; S++) {
        const O = E[S], H = Array.isArray(O.value) ? O.value : [O.value];
        for (let $ = 0, W = H.length; $ < W; $++) {
          const Y = H[$], j = v(Y), z = M % R, rt = z % j.boundary, ct = z + rt;
          M += rt, ct !== 0 && R - ct < j.storage && (M += R - ct), O.__data = new Float32Array(j.storage / Float32Array.BYTES_PER_ELEMENT), O.__offset = M, M += j.storage;
        }
      }
    }
    const C = M % R;
    return C > 0 && (M += R - C), b.__size = M, b.__cache = {}, this;
  }
  function v(b) {
    const T = {
      boundary: 0,
      // bytes
      storage: 0
      // bytes
    };
    return typeof b == "number" || typeof b == "boolean" ? (T.boundary = 4, T.storage = 4) : b.isVector2 ? (T.boundary = 8, T.storage = 8) : b.isVector3 || b.isColor ? (T.boundary = 16, T.storage = 12) : b.isVector4 ? (T.boundary = 16, T.storage = 16) : b.isMatrix3 ? (T.boundary = 48, T.storage = 48) : b.isMatrix4 ? (T.boundary = 64, T.storage = 64) : b.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", b), T;
  }
  function p(b) {
    const T = b.target;
    T.removeEventListener("dispose", p);
    const M = a.indexOf(T.__bindingPointIndex);
    a.splice(M, 1), i.deleteBuffer(r[T.id]), delete r[T.id], delete s[T.id];
  }
  function h() {
    for (const b in r)
      i.deleteBuffer(r[b]);
    a = [], r = {}, s = {};
  }
  return {
    bind: l,
    update: c,
    dispose: h
  };
}
class Pm {
  /**
   * Constructs a new WebGL renderer.
   *
   * @param {WebGLRenderer~Options} [parameters] - The configuration parameter.
   */
  constructor(t = {}) {
    const {
      canvas: e = ah(),
      context: n = null,
      depth: r = !0,
      stencil: s = !1,
      alpha: a = !1,
      antialias: o = !1,
      premultipliedAlpha: l = !0,
      preserveDrawingBuffer: c = !1,
      powerPreference: u = "default",
      failIfMajorPerformanceCaveat: d = !1,
      reversedDepthBuffer: f = !1
    } = t;
    this.isWebGLRenderer = !0;
    let m;
    if (n !== null) {
      if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext)
        throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      m = n.getContextAttributes().alpha;
    } else
      m = a;
    const _ = new Uint32Array(4), v = new Int32Array(4);
    let p = null, h = null;
    const b = [], T = [];
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
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this.toneMapping = Fn, this.toneMappingExposure = 1, this.transmissionResolutionScale = 1;
    const M = this;
    let R = !1;
    this._outputColorSpace = Le;
    let C = 0, w = 0, N = null, E = -1, S = null;
    const D = new ue(), O = new ue();
    let H = null;
    const $ = new Xt(0);
    let W = 0, Y = e.width, j = e.height, z = 1, rt = null, ct = null;
    const St = new ue(0, 0, Y, j), Bt = new ue(0, 0, Y, j);
    let zt = !1;
    const Yt = new Na();
    let jt = !1, X = !1;
    const K = new se(), ft = new I(), Pt = new ue(), yt = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 };
    let Wt = !1;
    function ye() {
      return N === null ? z : 1;
    }
    let A = n;
    function ae(x, L) {
      return e.getContext(x, L);
    }
    try {
      const x = {
        alpha: !0,
        depth: r,
        stencil: s,
        antialias: o,
        premultipliedAlpha: l,
        preserveDrawingBuffer: c,
        powerPreference: u,
        failIfMajorPerformanceCaveat: d
      };
      if ("setAttribute" in e && e.setAttribute("data-engine", `three.js r${ba}`), e.addEventListener("webglcontextlost", it, !1), e.addEventListener("webglcontextrestored", ut, !1), e.addEventListener("webglcontextcreationerror", J, !1), A === null) {
        const L = "webgl2";
        if (A = ae(L, x), A === null)
          throw ae(L) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (x) {
      throw console.error("THREE.WebGLRenderer: " + x.message), x;
    }
    let It, Rt, _t, oe, gt, Ft, Me, fe, y, g, F, G, Z, V, Et, nt, vt, xt, tt, ht, wt, Mt, ot, Ut;
    function P() {
      It = new zf(A), It.init(), Mt = new Em(A, It), Rt = new If(A, It, t, Mt), _t = new Mm(A, It), Rt.reversedDepthBuffer && f && _t.buffers.depth.setReversed(!0), oe = new Gf(A), gt = new om(), Ft = new Sm(A, It, _t, gt, Rt, Mt, oe), Me = new Nf(M), fe = new kf(M), y = new $h(A), ot = new Df(A, y), g = new Hf(A, y, oe, ot), F = new Xf(A, g, y, oe), tt = new Wf(A, Rt, Ft), nt = new Uf(gt), G = new am(M, Me, fe, It, Rt, ot, nt), Z = new Rm(M, gt), V = new cm(), Et = new mm(It), xt = new Pf(M, Me, fe, _t, F, m, l), vt = new vm(M, F, Rt), Ut = new Cm(A, oe, Rt, _t), ht = new Lf(A, It, oe), wt = new Vf(A, It, oe), oe.programs = G.programs, M.capabilities = Rt, M.extensions = It, M.properties = gt, M.renderLists = V, M.shadowMap = vt, M.state = _t, M.info = oe;
    }
    P();
    const et = new Am(M, A);
    this.xr = et, this.getContext = function() {
      return A;
    }, this.getContextAttributes = function() {
      return A.getContextAttributes();
    }, this.forceContextLoss = function() {
      const x = It.get("WEBGL_lose_context");
      x && x.loseContext();
    }, this.forceContextRestore = function() {
      const x = It.get("WEBGL_lose_context");
      x && x.restoreContext();
    }, this.getPixelRatio = function() {
      return z;
    }, this.setPixelRatio = function(x) {
      x !== void 0 && (z = x, this.setSize(Y, j, !1));
    }, this.getSize = function(x) {
      return x.set(Y, j);
    }, this.setSize = function(x, L, B = !0) {
      if (et.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      Y = x, j = L, e.width = Math.floor(x * z), e.height = Math.floor(L * z), B === !0 && (e.style.width = x + "px", e.style.height = L + "px"), this.setViewport(0, 0, x, L);
    }, this.getDrawingBufferSize = function(x) {
      return x.set(Y * z, j * z).floor();
    }, this.setDrawingBufferSize = function(x, L, B) {
      Y = x, j = L, z = B, e.width = Math.floor(x * B), e.height = Math.floor(L * B), this.setViewport(0, 0, x, L);
    }, this.getCurrentViewport = function(x) {
      return x.copy(D);
    }, this.getViewport = function(x) {
      return x.copy(St);
    }, this.setViewport = function(x, L, B, k) {
      x.isVector4 ? St.set(x.x, x.y, x.z, x.w) : St.set(x, L, B, k), _t.viewport(D.copy(St).multiplyScalar(z).round());
    }, this.getScissor = function(x) {
      return x.copy(Bt);
    }, this.setScissor = function(x, L, B, k) {
      x.isVector4 ? Bt.set(x.x, x.y, x.z, x.w) : Bt.set(x, L, B, k), _t.scissor(O.copy(Bt).multiplyScalar(z).round());
    }, this.getScissorTest = function() {
      return zt;
    }, this.setScissorTest = function(x) {
      _t.setScissorTest(zt = x);
    }, this.setOpaqueSort = function(x) {
      rt = x;
    }, this.setTransparentSort = function(x) {
      ct = x;
    }, this.getClearColor = function(x) {
      return x.copy(xt.getClearColor());
    }, this.setClearColor = function() {
      xt.setClearColor(...arguments);
    }, this.getClearAlpha = function() {
      return xt.getClearAlpha();
    }, this.setClearAlpha = function() {
      xt.setClearAlpha(...arguments);
    }, this.clear = function(x = !0, L = !0, B = !0) {
      let k = 0;
      if (x) {
        let U = !1;
        if (N !== null) {
          const Q = N.texture.format;
          U = Q === Pa || Q === Ca || Q === Ra;
        }
        if (U) {
          const Q = N.texture.type, lt = Q === cn || Q === ti || Q === Ji || Q === Qi || Q === Aa || Q === wa, pt = xt.getClearColor(), dt = xt.getClearAlpha(), At = pt.r, Ct = pt.g, bt = pt.b;
          lt ? (_[0] = At, _[1] = Ct, _[2] = bt, _[3] = dt, A.clearBufferuiv(A.COLOR, 0, _)) : (v[0] = At, v[1] = Ct, v[2] = bt, v[3] = dt, A.clearBufferiv(A.COLOR, 0, v));
        } else
          k |= A.COLOR_BUFFER_BIT;
      }
      L && (k |= A.DEPTH_BUFFER_BIT), B && (k |= A.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), A.clear(k);
    }, this.clearColor = function() {
      this.clear(!0, !1, !1);
    }, this.clearDepth = function() {
      this.clear(!1, !0, !1);
    }, this.clearStencil = function() {
      this.clear(!1, !1, !0);
    }, this.dispose = function() {
      e.removeEventListener("webglcontextlost", it, !1), e.removeEventListener("webglcontextrestored", ut, !1), e.removeEventListener("webglcontextcreationerror", J, !1), xt.dispose(), V.dispose(), Et.dispose(), gt.dispose(), Me.dispose(), fe.dispose(), F.dispose(), ot.dispose(), Ut.dispose(), G.dispose(), et.dispose(), et.removeEventListener("sessionstart", tn), et.removeEventListener("sessionend", za), zn.stop();
    };
    function it(x) {
      x.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), R = !0;
    }
    function ut() {
      console.log("THREE.WebGLRenderer: Context Restored."), R = !1;
      const x = oe.autoReset, L = vt.enabled, B = vt.autoUpdate, k = vt.needsUpdate, U = vt.type;
      P(), oe.autoReset = x, vt.enabled = L, vt.autoUpdate = B, vt.needsUpdate = k, vt.type = U;
    }
    function J(x) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", x.statusMessage);
    }
    function q(x) {
      const L = x.target;
      L.removeEventListener("dispose", q), mt(L);
    }
    function mt(x) {
      Lt(x), gt.remove(x);
    }
    function Lt(x) {
      const L = gt.get(x).programs;
      L !== void 0 && (L.forEach(function(B) {
        G.releaseProgram(B);
      }), x.isShaderMaterial && G.releaseShaderCache(x));
    }
    this.renderBufferDirect = function(x, L, B, k, U, Q) {
      L === null && (L = yt);
      const lt = U.isMesh && U.matrixWorld.determinant() < 0, pt = jl(x, L, B, k, U);
      _t.setMaterial(k, lt);
      let dt = B.index, At = 1;
      if (k.wireframe === !0) {
        if (dt = g.getWireframeAttribute(B), dt === void 0) return;
        At = 2;
      }
      const Ct = B.drawRange, bt = B.attributes.position;
      let Vt = Ct.start * At, Qt = (Ct.start + Ct.count) * At;
      Q !== null && (Vt = Math.max(Vt, Q.start * At), Qt = Math.min(Qt, (Q.start + Q.count) * At)), dt !== null ? (Vt = Math.max(Vt, 0), Qt = Math.min(Qt, dt.count)) : bt != null && (Vt = Math.max(Vt, 0), Qt = Math.min(Qt, bt.count));
      const de = Qt - Vt;
      if (de < 0 || de === 1 / 0) return;
      ot.setup(U, k, pt, B, dt);
      let re, ne = ht;
      if (dt !== null && (re = y.get(dt), ne = wt, ne.setIndex(re)), U.isMesh)
        k.wireframe === !0 ? (_t.setLineWidth(k.wireframeLinewidth * ye()), ne.setMode(A.LINES)) : ne.setMode(A.TRIANGLES);
      else if (U.isLine) {
        let Tt = k.linewidth;
        Tt === void 0 && (Tt = 1), _t.setLineWidth(Tt * ye()), U.isLineSegments ? ne.setMode(A.LINES) : U.isLineLoop ? ne.setMode(A.LINE_LOOP) : ne.setMode(A.LINE_STRIP);
      } else U.isPoints ? ne.setMode(A.POINTS) : U.isSprite && ne.setMode(A.TRIANGLES);
      if (U.isBatchedMesh)
        if (U._multiDrawInstances !== null)
          ir("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."), ne.renderMultiDrawInstances(U._multiDrawStarts, U._multiDrawCounts, U._multiDrawCount, U._multiDrawInstances);
        else if (It.get("WEBGL_multi_draw"))
          ne.renderMultiDraw(U._multiDrawStarts, U._multiDrawCounts, U._multiDrawCount);
        else {
          const Tt = U._multiDrawStarts, ce = U._multiDrawCounts, qt = U._multiDrawCount, Fe = dt ? y.get(dt).bytesPerElement : 1, ri = gt.get(k).currentProgram.getUniforms();
          for (let Oe = 0; Oe < qt; Oe++)
            ri.setValue(A, "_gl_DrawID", Oe), ne.render(Tt[Oe] / Fe, ce[Oe]);
        }
      else if (U.isInstancedMesh)
        ne.renderInstances(Vt, de, U.count);
      else if (B.isInstancedBufferGeometry) {
        const Tt = B._maxInstanceCount !== void 0 ? B._maxInstanceCount : 1 / 0, ce = Math.min(B.instanceCount, Tt);
        ne.renderInstances(Vt, de, ce);
      } else
        ne.render(Vt, de);
    };
    function ie(x, L, B) {
      x.transparent === !0 && x.side === Mn && x.forceSinglePass === !1 ? (x.side = Ne, x.needsUpdate = !0, lr(x, L, B), x.side = Bn, x.needsUpdate = !0, lr(x, L, B), x.side = Mn) : lr(x, L, B);
    }
    this.compile = function(x, L, B = null) {
      B === null && (B = x), h = Et.get(B), h.init(L), T.push(h), B.traverseVisible(function(U) {
        U.isLight && U.layers.test(L.layers) && (h.pushLight(U), U.castShadow && h.pushShadow(U));
      }), x !== B && x.traverseVisible(function(U) {
        U.isLight && U.layers.test(L.layers) && (h.pushLight(U), U.castShadow && h.pushShadow(U));
      }), h.setupLights();
      const k = /* @__PURE__ */ new Set();
      return x.traverse(function(U) {
        if (!(U.isMesh || U.isPoints || U.isLine || U.isSprite))
          return;
        const Q = U.material;
        if (Q)
          if (Array.isArray(Q))
            for (let lt = 0; lt < Q.length; lt++) {
              const pt = Q[lt];
              ie(pt, B, U), k.add(pt);
            }
          else
            ie(Q, B, U), k.add(Q);
      }), h = T.pop(), k;
    }, this.compileAsync = function(x, L, B = null) {
      const k = this.compile(x, L, B);
      return new Promise((U) => {
        function Q() {
          if (k.forEach(function(lt) {
            gt.get(lt).currentProgram.isReady() && k.delete(lt);
          }), k.size === 0) {
            U(x);
            return;
          }
          setTimeout(Q, 10);
        }
        It.get("KHR_parallel_shader_compile") !== null ? Q() : setTimeout(Q, 10);
      });
    };
    let Zt = null;
    function un(x) {
      Zt && Zt(x);
    }
    function tn() {
      zn.stop();
    }
    function za() {
      zn.start();
    }
    const zn = new Ul();
    zn.setAnimationLoop(un), typeof self < "u" && zn.setContext(self), this.setAnimationLoop = function(x) {
      Zt = x, et.setAnimationLoop(x), x === null ? zn.stop() : zn.start();
    }, et.addEventListener("sessionstart", tn), et.addEventListener("sessionend", za), this.render = function(x, L) {
      if (L !== void 0 && L.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (R === !0) return;
      if (x.matrixWorldAutoUpdate === !0 && x.updateMatrixWorld(), L.parent === null && L.matrixWorldAutoUpdate === !0 && L.updateMatrixWorld(), et.enabled === !0 && et.isPresenting === !0 && (et.cameraAutoUpdate === !0 && et.updateCamera(L), L = et.getCamera()), x.isScene === !0 && x.onBeforeRender(M, x, L, N), h = Et.get(x, T.length), h.init(L), T.push(h), K.multiplyMatrices(L.projectionMatrix, L.matrixWorldInverse), Yt.setFromProjectionMatrix(K, rn, L.reversedDepth), X = this.localClippingEnabled, jt = nt.init(this.clippingPlanes, X), p = V.get(x, b.length), p.init(), b.push(p), et.enabled === !0 && et.isPresenting === !0) {
        const Q = M.xr.getDepthSensingMesh();
        Q !== null && Zr(Q, L, -1 / 0, M.sortObjects);
      }
      Zr(x, L, 0, M.sortObjects), p.finish(), M.sortObjects === !0 && p.sort(rt, ct), Wt = et.enabled === !1 || et.isPresenting === !1 || et.hasDepthSensing() === !1, Wt && xt.addToRenderList(p, x), this.info.render.frame++, jt === !0 && nt.beginShadows();
      const B = h.state.shadowsArray;
      vt.render(B, x, L), jt === !0 && nt.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const k = p.opaque, U = p.transmissive;
      if (h.setupLights(), L.isArrayCamera) {
        const Q = L.cameras;
        if (U.length > 0)
          for (let lt = 0, pt = Q.length; lt < pt; lt++) {
            const dt = Q[lt];
            Va(k, U, x, dt);
          }
        Wt && xt.render(x);
        for (let lt = 0, pt = Q.length; lt < pt; lt++) {
          const dt = Q[lt];
          Ha(p, x, dt, dt.viewport);
        }
      } else
        U.length > 0 && Va(k, U, x, L), Wt && xt.render(x), Ha(p, x, L);
      N !== null && w === 0 && (Ft.updateMultisampleRenderTarget(N), Ft.updateRenderTargetMipmap(N)), x.isScene === !0 && x.onAfterRender(M, x, L), ot.resetDefaultState(), E = -1, S = null, T.pop(), T.length > 0 ? (h = T[T.length - 1], jt === !0 && nt.setGlobalState(M.clippingPlanes, h.state.camera)) : h = null, b.pop(), b.length > 0 ? p = b[b.length - 1] : p = null;
    };
    function Zr(x, L, B, k) {
      if (x.visible === !1) return;
      if (x.layers.test(L.layers)) {
        if (x.isGroup)
          B = x.renderOrder;
        else if (x.isLOD)
          x.autoUpdate === !0 && x.update(L);
        else if (x.isLight)
          h.pushLight(x), x.castShadow && h.pushShadow(x);
        else if (x.isSprite) {
          if (!x.frustumCulled || Yt.intersectsSprite(x)) {
            k && Pt.setFromMatrixPosition(x.matrixWorld).applyMatrix4(K);
            const lt = F.update(x), pt = x.material;
            pt.visible && p.push(x, lt, pt, B, Pt.z, null);
          }
        } else if ((x.isMesh || x.isLine || x.isPoints) && (!x.frustumCulled || Yt.intersectsObject(x))) {
          const lt = F.update(x), pt = x.material;
          if (k && (x.boundingSphere !== void 0 ? (x.boundingSphere === null && x.computeBoundingSphere(), Pt.copy(x.boundingSphere.center)) : (lt.boundingSphere === null && lt.computeBoundingSphere(), Pt.copy(lt.boundingSphere.center)), Pt.applyMatrix4(x.matrixWorld).applyMatrix4(K)), Array.isArray(pt)) {
            const dt = lt.groups;
            for (let At = 0, Ct = dt.length; At < Ct; At++) {
              const bt = dt[At], Vt = pt[bt.materialIndex];
              Vt && Vt.visible && p.push(x, lt, Vt, B, Pt.z, bt);
            }
          } else pt.visible && p.push(x, lt, pt, B, Pt.z, null);
        }
      }
      const Q = x.children;
      for (let lt = 0, pt = Q.length; lt < pt; lt++)
        Zr(Q[lt], L, B, k);
    }
    function Ha(x, L, B, k) {
      const U = x.opaque, Q = x.transmissive, lt = x.transparent;
      h.setupLightsView(B), jt === !0 && nt.setGlobalState(M.clippingPlanes, B), k && _t.viewport(D.copy(k)), U.length > 0 && or(U, L, B), Q.length > 0 && or(Q, L, B), lt.length > 0 && or(lt, L, B), _t.buffers.depth.setTest(!0), _t.buffers.depth.setMask(!0), _t.buffers.color.setMask(!0), _t.setPolygonOffset(!1);
    }
    function Va(x, L, B, k) {
      if ((B.isScene === !0 ? B.overrideMaterial : null) !== null)
        return;
      h.state.transmissionRenderTarget[k.id] === void 0 && (h.state.transmissionRenderTarget[k.id] = new ni(1, 1, {
        generateMipmaps: !0,
        type: It.has("EXT_color_buffer_half_float") || It.has("EXT_color_buffer_float") ? rr : cn,
        minFilter: Jn,
        samples: 4,
        stencilBuffer: s,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: $t.workingColorSpace
      }));
      const Q = h.state.transmissionRenderTarget[k.id], lt = k.viewport || D;
      Q.setSize(lt.z * M.transmissionResolutionScale, lt.w * M.transmissionResolutionScale);
      const pt = M.getRenderTarget(), dt = M.getActiveCubeFace(), At = M.getActiveMipmapLevel();
      M.setRenderTarget(Q), M.getClearColor($), W = M.getClearAlpha(), W < 1 && M.setClearColor(16777215, 0.5), M.clear(), Wt && xt.render(B);
      const Ct = M.toneMapping;
      M.toneMapping = Fn;
      const bt = k.viewport;
      if (k.viewport !== void 0 && (k.viewport = void 0), h.setupLightsView(k), jt === !0 && nt.setGlobalState(M.clippingPlanes, k), or(x, B, k), Ft.updateMultisampleRenderTarget(Q), Ft.updateRenderTargetMipmap(Q), It.has("WEBGL_multisampled_render_to_texture") === !1) {
        let Vt = !1;
        for (let Qt = 0, de = L.length; Qt < de; Qt++) {
          const re = L[Qt], ne = re.object, Tt = re.geometry, ce = re.material, qt = re.group;
          if (ce.side === Mn && ne.layers.test(k.layers)) {
            const Fe = ce.side;
            ce.side = Ne, ce.needsUpdate = !0, Ga(ne, B, k, Tt, ce, qt), ce.side = Fe, ce.needsUpdate = !0, Vt = !0;
          }
        }
        Vt === !0 && (Ft.updateMultisampleRenderTarget(Q), Ft.updateRenderTargetMipmap(Q));
      }
      M.setRenderTarget(pt, dt, At), M.setClearColor($, W), bt !== void 0 && (k.viewport = bt), M.toneMapping = Ct;
    }
    function or(x, L, B) {
      const k = L.isScene === !0 ? L.overrideMaterial : null;
      for (let U = 0, Q = x.length; U < Q; U++) {
        const lt = x[U], pt = lt.object, dt = lt.geometry, At = lt.group;
        let Ct = lt.material;
        Ct.allowOverride === !0 && k !== null && (Ct = k), pt.layers.test(B.layers) && Ga(pt, L, B, dt, Ct, At);
      }
    }
    function Ga(x, L, B, k, U, Q) {
      x.onBeforeRender(M, L, B, k, U, Q), x.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse, x.matrixWorld), x.normalMatrix.getNormalMatrix(x.modelViewMatrix), U.onBeforeRender(M, L, B, k, x, Q), U.transparent === !0 && U.side === Mn && U.forceSinglePass === !1 ? (U.side = Ne, U.needsUpdate = !0, M.renderBufferDirect(B, L, k, U, x, Q), U.side = Bn, U.needsUpdate = !0, M.renderBufferDirect(B, L, k, U, x, Q), U.side = Mn) : M.renderBufferDirect(B, L, k, U, x, Q), x.onAfterRender(M, L, B, k, U, Q);
    }
    function lr(x, L, B) {
      L.isScene !== !0 && (L = yt);
      const k = gt.get(x), U = h.state.lights, Q = h.state.shadowsArray, lt = U.state.version, pt = G.getParameters(x, U.state, Q, L, B), dt = G.getProgramCacheKey(pt);
      let At = k.programs;
      k.environment = x.isMeshStandardMaterial ? L.environment : null, k.fog = L.fog, k.envMap = (x.isMeshStandardMaterial ? fe : Me).get(x.envMap || k.environment), k.envMapRotation = k.environment !== null && x.envMap === null ? L.environmentRotation : x.envMapRotation, At === void 0 && (x.addEventListener("dispose", q), At = /* @__PURE__ */ new Map(), k.programs = At);
      let Ct = At.get(dt);
      if (Ct !== void 0) {
        if (k.currentProgram === Ct && k.lightsStateVersion === lt)
          return Xa(x, pt), Ct;
      } else
        pt.uniforms = G.getUniforms(x), x.onBeforeCompile(pt, M), Ct = G.acquireProgram(pt, dt), At.set(dt, Ct), k.uniforms = pt.uniforms;
      const bt = k.uniforms;
      return (!x.isShaderMaterial && !x.isRawShaderMaterial || x.clipping === !0) && (bt.clippingPlanes = nt.uniform), Xa(x, pt), k.needsLights = Zl(x), k.lightsStateVersion = lt, k.needsLights && (bt.ambientLightColor.value = U.state.ambient, bt.lightProbe.value = U.state.probe, bt.directionalLights.value = U.state.directional, bt.directionalLightShadows.value = U.state.directionalShadow, bt.spotLights.value = U.state.spot, bt.spotLightShadows.value = U.state.spotShadow, bt.rectAreaLights.value = U.state.rectArea, bt.ltc_1.value = U.state.rectAreaLTC1, bt.ltc_2.value = U.state.rectAreaLTC2, bt.pointLights.value = U.state.point, bt.pointLightShadows.value = U.state.pointShadow, bt.hemisphereLights.value = U.state.hemi, bt.directionalShadowMap.value = U.state.directionalShadowMap, bt.directionalShadowMatrix.value = U.state.directionalShadowMatrix, bt.spotShadowMap.value = U.state.spotShadowMap, bt.spotLightMatrix.value = U.state.spotLightMatrix, bt.spotLightMap.value = U.state.spotLightMap, bt.pointShadowMap.value = U.state.pointShadowMap, bt.pointShadowMatrix.value = U.state.pointShadowMatrix), k.currentProgram = Ct, k.uniformsList = null, Ct;
    }
    function Wa(x) {
      if (x.uniformsList === null) {
        const L = x.currentProgram.getUniforms();
        x.uniformsList = zr.seqWithValue(L.seq, x.uniforms);
      }
      return x.uniformsList;
    }
    function Xa(x, L) {
      const B = gt.get(x);
      B.outputColorSpace = L.outputColorSpace, B.batching = L.batching, B.batchingColor = L.batchingColor, B.instancing = L.instancing, B.instancingColor = L.instancingColor, B.instancingMorph = L.instancingMorph, B.skinning = L.skinning, B.morphTargets = L.morphTargets, B.morphNormals = L.morphNormals, B.morphColors = L.morphColors, B.morphTargetsCount = L.morphTargetsCount, B.numClippingPlanes = L.numClippingPlanes, B.numIntersection = L.numClipIntersection, B.vertexAlphas = L.vertexAlphas, B.vertexTangents = L.vertexTangents, B.toneMapping = L.toneMapping;
    }
    function jl(x, L, B, k, U) {
      L.isScene !== !0 && (L = yt), Ft.resetTextureUnits();
      const Q = L.fog, lt = k.isMeshStandardMaterial ? L.environment : null, pt = N === null ? M.outputColorSpace : N.isXRRenderTarget === !0 ? N.texture.colorSpace : Ui, dt = (k.isMeshStandardMaterial ? fe : Me).get(k.envMap || lt), At = k.vertexColors === !0 && !!B.attributes.color && B.attributes.color.itemSize === 4, Ct = !!B.attributes.tangent && (!!k.normalMap || k.anisotropy > 0), bt = !!B.morphAttributes.position, Vt = !!B.morphAttributes.normal, Qt = !!B.morphAttributes.color;
      let de = Fn;
      k.toneMapped && (N === null || N.isXRRenderTarget === !0) && (de = M.toneMapping);
      const re = B.morphAttributes.position || B.morphAttributes.normal || B.morphAttributes.color, ne = re !== void 0 ? re.length : 0, Tt = gt.get(k), ce = h.state.lights;
      if (jt === !0 && (X === !0 || x !== S)) {
        const Ae = x === S && k.id === E;
        nt.setState(k, x, Ae);
      }
      let qt = !1;
      k.version === Tt.__version ? (Tt.needsLights && Tt.lightsStateVersion !== ce.state.version || Tt.outputColorSpace !== pt || U.isBatchedMesh && Tt.batching === !1 || !U.isBatchedMesh && Tt.batching === !0 || U.isBatchedMesh && Tt.batchingColor === !0 && U.colorTexture === null || U.isBatchedMesh && Tt.batchingColor === !1 && U.colorTexture !== null || U.isInstancedMesh && Tt.instancing === !1 || !U.isInstancedMesh && Tt.instancing === !0 || U.isSkinnedMesh && Tt.skinning === !1 || !U.isSkinnedMesh && Tt.skinning === !0 || U.isInstancedMesh && Tt.instancingColor === !0 && U.instanceColor === null || U.isInstancedMesh && Tt.instancingColor === !1 && U.instanceColor !== null || U.isInstancedMesh && Tt.instancingMorph === !0 && U.morphTexture === null || U.isInstancedMesh && Tt.instancingMorph === !1 && U.morphTexture !== null || Tt.envMap !== dt || k.fog === !0 && Tt.fog !== Q || Tt.numClippingPlanes !== void 0 && (Tt.numClippingPlanes !== nt.numPlanes || Tt.numIntersection !== nt.numIntersection) || Tt.vertexAlphas !== At || Tt.vertexTangents !== Ct || Tt.morphTargets !== bt || Tt.morphNormals !== Vt || Tt.morphColors !== Qt || Tt.toneMapping !== de || Tt.morphTargetsCount !== ne) && (qt = !0) : (qt = !0, Tt.__version = k.version);
      let Fe = Tt.currentProgram;
      qt === !0 && (Fe = lr(k, L, U));
      let ri = !1, Oe = !1, Hi = !1;
      const he = Fe.getUniforms(), He = Tt.uniforms;
      if (_t.useProgram(Fe.program) && (ri = !0, Oe = !0, Hi = !0), k.id !== E && (E = k.id, Oe = !0), ri || S !== x) {
        _t.buffers.depth.getReversed() && x.reversedDepth !== !0 && (x._reversedDepth = !0, x.updateProjectionMatrix()), he.setValue(A, "projectionMatrix", x.projectionMatrix), he.setValue(A, "viewMatrix", x.matrixWorldInverse);
        const Pe = he.map.cameraPosition;
        Pe !== void 0 && Pe.setValue(A, ft.setFromMatrixPosition(x.matrixWorld)), Rt.logarithmicDepthBuffer && he.setValue(
          A,
          "logDepthBufFC",
          2 / (Math.log(x.far + 1) / Math.LN2)
        ), (k.isMeshPhongMaterial || k.isMeshToonMaterial || k.isMeshLambertMaterial || k.isMeshBasicMaterial || k.isMeshStandardMaterial || k.isShaderMaterial) && he.setValue(A, "isOrthographic", x.isOrthographicCamera === !0), S !== x && (S = x, Oe = !0, Hi = !0);
      }
      if (U.isSkinnedMesh) {
        he.setOptional(A, U, "bindMatrix"), he.setOptional(A, U, "bindMatrixInverse");
        const Ae = U.skeleton;
        Ae && (Ae.boneTexture === null && Ae.computeBoneTexture(), he.setValue(A, "boneTexture", Ae.boneTexture, Ft));
      }
      U.isBatchedMesh && (he.setOptional(A, U, "batchingTexture"), he.setValue(A, "batchingTexture", U._matricesTexture, Ft), he.setOptional(A, U, "batchingIdTexture"), he.setValue(A, "batchingIdTexture", U._indirectTexture, Ft), he.setOptional(A, U, "batchingColorTexture"), U._colorsTexture !== null && he.setValue(A, "batchingColorTexture", U._colorsTexture, Ft));
      const Ve = B.morphAttributes;
      if ((Ve.position !== void 0 || Ve.normal !== void 0 || Ve.color !== void 0) && tt.update(U, B, Fe), (Oe || Tt.receiveShadow !== U.receiveShadow) && (Tt.receiveShadow = U.receiveShadow, he.setValue(A, "receiveShadow", U.receiveShadow)), k.isMeshGouraudMaterial && k.envMap !== null && (He.envMap.value = dt, He.flipEnvMap.value = dt.isCubeTexture && dt.isRenderTargetTexture === !1 ? -1 : 1), k.isMeshStandardMaterial && k.envMap === null && L.environment !== null && (He.envMapIntensity.value = L.environmentIntensity), Oe && (he.setValue(A, "toneMappingExposure", M.toneMappingExposure), Tt.needsLights && Kl(He, Hi), Q && k.fog === !0 && Z.refreshFogUniforms(He, Q), Z.refreshMaterialUniforms(He, k, z, j, h.state.transmissionRenderTarget[x.id]), zr.upload(A, Wa(Tt), He, Ft)), k.isShaderMaterial && k.uniformsNeedUpdate === !0 && (zr.upload(A, Wa(Tt), He, Ft), k.uniformsNeedUpdate = !1), k.isSpriteMaterial && he.setValue(A, "center", U.center), he.setValue(A, "modelViewMatrix", U.modelViewMatrix), he.setValue(A, "normalMatrix", U.normalMatrix), he.setValue(A, "modelMatrix", U.matrixWorld), k.isShaderMaterial || k.isRawShaderMaterial) {
        const Ae = k.uniformsGroups;
        for (let Pe = 0, Jr = Ae.length; Pe < Jr; Pe++) {
          const Hn = Ae[Pe];
          Ut.update(Hn, Fe), Ut.bind(Hn, Fe);
        }
      }
      return Fe;
    }
    function Kl(x, L) {
      x.ambientLightColor.needsUpdate = L, x.lightProbe.needsUpdate = L, x.directionalLights.needsUpdate = L, x.directionalLightShadows.needsUpdate = L, x.pointLights.needsUpdate = L, x.pointLightShadows.needsUpdate = L, x.spotLights.needsUpdate = L, x.spotLightShadows.needsUpdate = L, x.rectAreaLights.needsUpdate = L, x.hemisphereLights.needsUpdate = L;
    }
    function Zl(x) {
      return x.isMeshLambertMaterial || x.isMeshToonMaterial || x.isMeshPhongMaterial || x.isMeshStandardMaterial || x.isShadowMaterial || x.isShaderMaterial && x.lights === !0;
    }
    this.getActiveCubeFace = function() {
      return C;
    }, this.getActiveMipmapLevel = function() {
      return w;
    }, this.getRenderTarget = function() {
      return N;
    }, this.setRenderTargetTextures = function(x, L, B) {
      const k = gt.get(x);
      k.__autoAllocateDepthBuffer = x.resolveDepthBuffer === !1, k.__autoAllocateDepthBuffer === !1 && (k.__useRenderToTexture = !1), gt.get(x.texture).__webglTexture = L, gt.get(x.depthTexture).__webglTexture = k.__autoAllocateDepthBuffer ? void 0 : B, k.__hasExternalTextures = !0;
    }, this.setRenderTargetFramebuffer = function(x, L) {
      const B = gt.get(x);
      B.__webglFramebuffer = L, B.__useDefaultFramebuffer = L === void 0;
    };
    const Jl = A.createFramebuffer();
    this.setRenderTarget = function(x, L = 0, B = 0) {
      N = x, C = L, w = B;
      let k = !0, U = null, Q = !1, lt = !1;
      if (x) {
        const dt = gt.get(x);
        if (dt.__useDefaultFramebuffer !== void 0)
          _t.bindFramebuffer(A.FRAMEBUFFER, null), k = !1;
        else if (dt.__webglFramebuffer === void 0)
          Ft.setupRenderTarget(x);
        else if (dt.__hasExternalTextures)
          Ft.rebindTextures(x, gt.get(x.texture).__webglTexture, gt.get(x.depthTexture).__webglTexture);
        else if (x.depthBuffer) {
          const bt = x.depthTexture;
          if (dt.__boundDepthTexture !== bt) {
            if (bt !== null && gt.has(bt) && (x.width !== bt.image.width || x.height !== bt.image.height))
              throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
            Ft.setupDepthRenderbuffer(x);
          }
        }
        const At = x.texture;
        (At.isData3DTexture || At.isDataArrayTexture || At.isCompressedArrayTexture) && (lt = !0);
        const Ct = gt.get(x).__webglFramebuffer;
        x.isWebGLCubeRenderTarget ? (Array.isArray(Ct[L]) ? U = Ct[L][B] : U = Ct[L], Q = !0) : x.samples > 0 && Ft.useMultisampledRTT(x) === !1 ? U = gt.get(x).__webglMultisampledFramebuffer : Array.isArray(Ct) ? U = Ct[B] : U = Ct, D.copy(x.viewport), O.copy(x.scissor), H = x.scissorTest;
      } else
        D.copy(St).multiplyScalar(z).floor(), O.copy(Bt).multiplyScalar(z).floor(), H = zt;
      if (B !== 0 && (U = Jl), _t.bindFramebuffer(A.FRAMEBUFFER, U) && k && _t.drawBuffers(x, U), _t.viewport(D), _t.scissor(O), _t.setScissorTest(H), Q) {
        const dt = gt.get(x.texture);
        A.framebufferTexture2D(A.FRAMEBUFFER, A.COLOR_ATTACHMENT0, A.TEXTURE_CUBE_MAP_POSITIVE_X + L, dt.__webglTexture, B);
      } else if (lt) {
        const dt = L;
        for (let At = 0; At < x.textures.length; At++) {
          const Ct = gt.get(x.textures[At]);
          A.framebufferTextureLayer(A.FRAMEBUFFER, A.COLOR_ATTACHMENT0 + At, Ct.__webglTexture, B, dt);
        }
      } else if (x !== null && B !== 0) {
        const dt = gt.get(x.texture);
        A.framebufferTexture2D(A.FRAMEBUFFER, A.COLOR_ATTACHMENT0, A.TEXTURE_2D, dt.__webglTexture, B);
      }
      E = -1;
    }, this.readRenderTargetPixels = function(x, L, B, k, U, Q, lt, pt = 0) {
      if (!(x && x.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let dt = gt.get(x).__webglFramebuffer;
      if (x.isWebGLCubeRenderTarget && lt !== void 0 && (dt = dt[lt]), dt) {
        _t.bindFramebuffer(A.FRAMEBUFFER, dt);
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
          L >= 0 && L <= x.width - k && B >= 0 && B <= x.height - U && (x.textures.length > 1 && A.readBuffer(A.COLOR_ATTACHMENT0 + pt), A.readPixels(L, B, k, U, Mt.convert(Ct), Mt.convert(bt), Q));
        } finally {
          const At = N !== null ? gt.get(N).__webglFramebuffer : null;
          _t.bindFramebuffer(A.FRAMEBUFFER, At);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(x, L, B, k, U, Q, lt, pt = 0) {
      if (!(x && x.isWebGLRenderTarget))
        throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let dt = gt.get(x).__webglFramebuffer;
      if (x.isWebGLCubeRenderTarget && lt !== void 0 && (dt = dt[lt]), dt)
        if (L >= 0 && L <= x.width - k && B >= 0 && B <= x.height - U) {
          _t.bindFramebuffer(A.FRAMEBUFFER, dt);
          const At = x.textures[pt], Ct = At.format, bt = At.type;
          if (!Rt.textureFormatReadable(Ct))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
          if (!Rt.textureTypeReadable(bt))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
          const Vt = A.createBuffer();
          A.bindBuffer(A.PIXEL_PACK_BUFFER, Vt), A.bufferData(A.PIXEL_PACK_BUFFER, Q.byteLength, A.STREAM_READ), x.textures.length > 1 && A.readBuffer(A.COLOR_ATTACHMENT0 + pt), A.readPixels(L, B, k, U, Mt.convert(Ct), Mt.convert(bt), 0);
          const Qt = N !== null ? gt.get(N).__webglFramebuffer : null;
          _t.bindFramebuffer(A.FRAMEBUFFER, Qt);
          const de = A.fenceSync(A.SYNC_GPU_COMMANDS_COMPLETE, 0);
          return A.flush(), await oh(A, de, 4), A.bindBuffer(A.PIXEL_PACK_BUFFER, Vt), A.getBufferSubData(A.PIXEL_PACK_BUFFER, 0, Q), A.deleteBuffer(Vt), A.deleteSync(de), Q;
        } else
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
    }, this.copyFramebufferToTexture = function(x, L = null, B = 0) {
      const k = Math.pow(2, -B), U = Math.floor(x.image.width * k), Q = Math.floor(x.image.height * k), lt = L !== null ? L.x : 0, pt = L !== null ? L.y : 0;
      Ft.setTexture2D(x, 0), A.copyTexSubImage2D(A.TEXTURE_2D, B, 0, 0, lt, pt, U, Q), _t.unbindTexture();
    };
    const Ql = A.createFramebuffer(), tc = A.createFramebuffer();
    this.copyTextureToTexture = function(x, L, B = null, k = null, U = 0, Q = null) {
      Q === null && (U !== 0 ? (ir("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."), Q = U, U = 0) : Q = 0);
      let lt, pt, dt, At, Ct, bt, Vt, Qt, de;
      const re = x.isCompressedTexture ? x.mipmaps[Q] : x.image;
      if (B !== null)
        lt = B.max.x - B.min.x, pt = B.max.y - B.min.y, dt = B.isBox3 ? B.max.z - B.min.z : 1, At = B.min.x, Ct = B.min.y, bt = B.isBox3 ? B.min.z : 0;
      else {
        const Ve = Math.pow(2, -U);
        lt = Math.floor(re.width * Ve), pt = Math.floor(re.height * Ve), x.isDataArrayTexture ? dt = re.depth : x.isData3DTexture ? dt = Math.floor(re.depth * Ve) : dt = 1, At = 0, Ct = 0, bt = 0;
      }
      k !== null ? (Vt = k.x, Qt = k.y, de = k.z) : (Vt = 0, Qt = 0, de = 0);
      const ne = Mt.convert(L.format), Tt = Mt.convert(L.type);
      let ce;
      L.isData3DTexture ? (Ft.setTexture3D(L, 0), ce = A.TEXTURE_3D) : L.isDataArrayTexture || L.isCompressedArrayTexture ? (Ft.setTexture2DArray(L, 0), ce = A.TEXTURE_2D_ARRAY) : (Ft.setTexture2D(L, 0), ce = A.TEXTURE_2D), A.pixelStorei(A.UNPACK_FLIP_Y_WEBGL, L.flipY), A.pixelStorei(A.UNPACK_PREMULTIPLY_ALPHA_WEBGL, L.premultiplyAlpha), A.pixelStorei(A.UNPACK_ALIGNMENT, L.unpackAlignment);
      const qt = A.getParameter(A.UNPACK_ROW_LENGTH), Fe = A.getParameter(A.UNPACK_IMAGE_HEIGHT), ri = A.getParameter(A.UNPACK_SKIP_PIXELS), Oe = A.getParameter(A.UNPACK_SKIP_ROWS), Hi = A.getParameter(A.UNPACK_SKIP_IMAGES);
      A.pixelStorei(A.UNPACK_ROW_LENGTH, re.width), A.pixelStorei(A.UNPACK_IMAGE_HEIGHT, re.height), A.pixelStorei(A.UNPACK_SKIP_PIXELS, At), A.pixelStorei(A.UNPACK_SKIP_ROWS, Ct), A.pixelStorei(A.UNPACK_SKIP_IMAGES, bt);
      const he = x.isDataArrayTexture || x.isData3DTexture, He = L.isDataArrayTexture || L.isData3DTexture;
      if (x.isDepthTexture) {
        const Ve = gt.get(x), Ae = gt.get(L), Pe = gt.get(Ve.__renderTarget), Jr = gt.get(Ae.__renderTarget);
        _t.bindFramebuffer(A.READ_FRAMEBUFFER, Pe.__webglFramebuffer), _t.bindFramebuffer(A.DRAW_FRAMEBUFFER, Jr.__webglFramebuffer);
        for (let Hn = 0; Hn < dt; Hn++)
          he && (A.framebufferTextureLayer(A.READ_FRAMEBUFFER, A.COLOR_ATTACHMENT0, gt.get(x).__webglTexture, U, bt + Hn), A.framebufferTextureLayer(A.DRAW_FRAMEBUFFER, A.COLOR_ATTACHMENT0, gt.get(L).__webglTexture, Q, de + Hn)), A.blitFramebuffer(At, Ct, lt, pt, Vt, Qt, lt, pt, A.DEPTH_BUFFER_BIT, A.NEAREST);
        _t.bindFramebuffer(A.READ_FRAMEBUFFER, null), _t.bindFramebuffer(A.DRAW_FRAMEBUFFER, null);
      } else if (U !== 0 || x.isRenderTargetTexture || gt.has(x)) {
        const Ve = gt.get(x), Ae = gt.get(L);
        _t.bindFramebuffer(A.READ_FRAMEBUFFER, Ql), _t.bindFramebuffer(A.DRAW_FRAMEBUFFER, tc);
        for (let Pe = 0; Pe < dt; Pe++)
          he ? A.framebufferTextureLayer(A.READ_FRAMEBUFFER, A.COLOR_ATTACHMENT0, Ve.__webglTexture, U, bt + Pe) : A.framebufferTexture2D(A.READ_FRAMEBUFFER, A.COLOR_ATTACHMENT0, A.TEXTURE_2D, Ve.__webglTexture, U), He ? A.framebufferTextureLayer(A.DRAW_FRAMEBUFFER, A.COLOR_ATTACHMENT0, Ae.__webglTexture, Q, de + Pe) : A.framebufferTexture2D(A.DRAW_FRAMEBUFFER, A.COLOR_ATTACHMENT0, A.TEXTURE_2D, Ae.__webglTexture, Q), U !== 0 ? A.blitFramebuffer(At, Ct, lt, pt, Vt, Qt, lt, pt, A.COLOR_BUFFER_BIT, A.NEAREST) : He ? A.copyTexSubImage3D(ce, Q, Vt, Qt, de + Pe, At, Ct, lt, pt) : A.copyTexSubImage2D(ce, Q, Vt, Qt, At, Ct, lt, pt);
        _t.bindFramebuffer(A.READ_FRAMEBUFFER, null), _t.bindFramebuffer(A.DRAW_FRAMEBUFFER, null);
      } else
        He ? x.isDataTexture || x.isData3DTexture ? A.texSubImage3D(ce, Q, Vt, Qt, de, lt, pt, dt, ne, Tt, re.data) : L.isCompressedArrayTexture ? A.compressedTexSubImage3D(ce, Q, Vt, Qt, de, lt, pt, dt, ne, re.data) : A.texSubImage3D(ce, Q, Vt, Qt, de, lt, pt, dt, ne, Tt, re) : x.isDataTexture ? A.texSubImage2D(A.TEXTURE_2D, Q, Vt, Qt, lt, pt, ne, Tt, re.data) : x.isCompressedTexture ? A.compressedTexSubImage2D(A.TEXTURE_2D, Q, Vt, Qt, re.width, re.height, ne, re.data) : A.texSubImage2D(A.TEXTURE_2D, Q, Vt, Qt, lt, pt, ne, Tt, re);
      A.pixelStorei(A.UNPACK_ROW_LENGTH, qt), A.pixelStorei(A.UNPACK_IMAGE_HEIGHT, Fe), A.pixelStorei(A.UNPACK_SKIP_PIXELS, ri), A.pixelStorei(A.UNPACK_SKIP_ROWS, Oe), A.pixelStorei(A.UNPACK_SKIP_IMAGES, Hi), Q === 0 && L.generateMipmaps && A.generateMipmap(ce), _t.unbindTexture();
    }, this.initRenderTarget = function(x) {
      gt.get(x).__webglFramebuffer === void 0 && Ft.setupRenderTarget(x);
    }, this.initTexture = function(x) {
      x.isCubeTexture ? Ft.setTextureCube(x, 0) : x.isData3DTexture ? Ft.setTexture3D(x, 0) : x.isDataArrayTexture || x.isCompressedArrayTexture ? Ft.setTexture2DArray(x, 0) : Ft.setTexture2D(x, 0), _t.unbindTexture();
    }, this.resetState = function() {
      C = 0, w = 0, N = null, _t.reset(), ot.reset();
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
    return rn;
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
    e.drawingBufferColorSpace = $t._getDrawingBufferColorSpace(t), e.unpackColorSpace = $t._getUnpackColorSpace();
  }
}
const nl = { type: "change" }, Oa = { type: "start" }, kl = { type: "end" }, Nr = new jr(), il = new xn(), Dm = Math.cos(70 * Sl.DEG2RAD), _e = new I(), De = 2 * Math.PI, ee = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6
}, Ds = 1e-6;
class Lm extends Yh {
  /**
   * Constructs a new controls instance.
   *
   * @param {Object3D} object - The object that is managed by the controls.
   * @param {?HTMLDOMElement} domElement - The HTML element used for event listeners.
   */
  constructor(t, e = null) {
    super(t, e), this.state = ee.NONE, this.target = new I(), this.cursor = new I(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" }, this.mouseButtons = { LEFT: wi.ROTATE, MIDDLE: wi.DOLLY, RIGHT: wi.PAN }, this.touches = { ONE: Ei.ROTATE, TWO: Ei.DOLLY_PAN }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new I(), this._lastQuaternion = new ei(), this._lastTargetPosition = new I(), this._quat = new ei().setFromUnitVectors(t.up, new I(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new Po(), this._sphericalDelta = new Po(), this._scale = 1, this._panOffset = new I(), this._rotateStart = new Dt(), this._rotateEnd = new Dt(), this._rotateDelta = new Dt(), this._panStart = new Dt(), this._panEnd = new Dt(), this._panDelta = new Dt(), this._dollyStart = new Dt(), this._dollyEnd = new Dt(), this._dollyDelta = new Dt(), this._dollyDirection = new I(), this._mouse = new Dt(), this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = Um.bind(this), this._onPointerDown = Im.bind(this), this._onPointerUp = Nm.bind(this), this._onContextMenu = Vm.bind(this), this._onMouseWheel = Bm.bind(this), this._onKeyDown = km.bind(this), this._onTouchStart = zm.bind(this), this._onTouchMove = Hm.bind(this), this._onMouseDown = Fm.bind(this), this._onMouseMove = Om.bind(this), this._interceptControlDown = Gm.bind(this), this._interceptControlUp = Wm.bind(this), this.domElement !== null && this.connect(this.domElement), this.update();
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
    this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(nl), this.update(), this.state = ee.NONE;
  }
  update(t = null) {
    const e = this.object.position;
    _e.copy(e).sub(this.target), _e.applyQuaternion(this._quat), this._spherical.setFromVector3(_e), this.autoRotate && this.state === ee.NONE && this._rotateLeft(this._getAutoRotationAngle(t)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
    let n = this.minAzimuthAngle, r = this.maxAzimuthAngle;
    isFinite(n) && isFinite(r) && (n < -Math.PI ? n += De : n > Math.PI && (n -= De), r < -Math.PI ? r += De : r > Math.PI && (r -= De), n <= r ? this._spherical.theta = Math.max(n, Math.min(r, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (n + r) / 2 ? Math.max(n, this._spherical.theta) : Math.min(r, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0 ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
    let s = !1;
    if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera)
      this._spherical.radius = this._clampDistance(this._spherical.radius);
    else {
      const a = this._spherical.radius;
      this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), s = a != this._spherical.radius;
    }
    if (_e.setFromSpherical(this._spherical), _e.applyQuaternion(this._quatInverse), e.copy(this.target).add(_e), this.object.lookAt(this.target), this.enableDamping === !0 ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
      let a = null;
      if (this.object.isPerspectiveCamera) {
        const o = _e.length();
        a = this._clampDistance(o * this._scale);
        const l = o - a;
        this.object.position.addScaledVector(this._dollyDirection, l), this.object.updateMatrixWorld(), s = !!l;
      } else if (this.object.isOrthographicCamera) {
        const o = new I(this._mouse.x, this._mouse.y, 0);
        o.unproject(this.object);
        const l = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), s = l !== this.object.zoom;
        const c = new I(this._mouse.x, this._mouse.y, 0);
        c.unproject(this.object), this.object.position.sub(c).add(o), this.object.updateMatrixWorld(), a = _e.length();
      } else
        console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
      a !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position) : (Nr.origin.copy(this.object.position), Nr.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(Nr.direction)) < Dm ? this.object.lookAt(this.target) : (il.setFromNormalAndCoplanarPoint(this.object.up, this.target), Nr.intersectPlane(il, this.target))));
    } else if (this.object.isOrthographicCamera) {
      const a = this.object.zoom;
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), a !== this.object.zoom && (this.object.updateProjectionMatrix(), s = !0);
    }
    return this._scale = 1, this._performCursorZoom = !1, s || this._lastPosition.distanceToSquared(this.object.position) > Ds || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > Ds || this._lastTargetPosition.distanceToSquared(this.target) > Ds ? (this.dispatchEvent(nl), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1;
  }
  _getAutoRotationAngle(t) {
    return t !== null ? De / 60 * this.autoRotateSpeed * t : De / 60 / 60 * this.autoRotateSpeed;
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
    _e.setFromMatrixColumn(e, 0), _e.multiplyScalar(-t), this._panOffset.add(_e);
  }
  _panUp(t, e) {
    this.screenSpacePanning === !0 ? _e.setFromMatrixColumn(e, 1) : (_e.setFromMatrixColumn(e, 0), _e.crossVectors(this.object.up, _e)), _e.multiplyScalar(t), this._panOffset.add(_e);
  }
  // deltaX and deltaY are in pixels; right and down are positive
  _pan(t, e) {
    const n = this.domElement;
    if (this.object.isPerspectiveCamera) {
      const r = this.object.position;
      _e.copy(r).sub(this.target);
      let s = _e.length();
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
    this._rotateLeft(De * this._rotateDelta.x / e.clientHeight), this._rotateUp(De * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
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
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateUp(De * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), e = !0;
        break;
      case this.keys.BOTTOM:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateUp(-De * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), e = !0;
        break;
      case this.keys.LEFT:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateLeft(De * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), e = !0;
        break;
      case this.keys.RIGHT:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateLeft(-De * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), e = !0;
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
    this._rotateLeft(De * this._rotateDelta.x / e.clientHeight), this._rotateUp(De * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd);
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
function Im(i) {
  this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(i.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(i) && (this._addPointer(i), i.pointerType === "touch" ? this._onTouchStart(i) : this._onMouseDown(i)));
}
function Um(i) {
  this.enabled !== !1 && (i.pointerType === "touch" ? this._onTouchMove(i) : this._onMouseMove(i));
}
function Nm(i) {
  switch (this._removePointer(i), this._pointers.length) {
    case 0:
      this.domElement.releasePointerCapture(i.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(kl), this.state = ee.NONE;
      break;
    case 1:
      const t = this._pointers[0], e = this._pointerPositions[t];
      this._onTouchStart({ pointerId: t, pageX: e.x, pageY: e.y });
      break;
  }
}
function Fm(i) {
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
    case wi.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseDownDolly(i), this.state = ee.DOLLY;
      break;
    case wi.ROTATE:
      if (i.ctrlKey || i.metaKey || i.shiftKey) {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(i), this.state = ee.PAN;
      } else {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(i), this.state = ee.ROTATE;
      }
      break;
    case wi.PAN:
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
  this.state !== ee.NONE && this.dispatchEvent(Oa);
}
function Om(i) {
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
function Bm(i) {
  this.enabled === !1 || this.enableZoom === !1 || this.state !== ee.NONE || (i.preventDefault(), this.dispatchEvent(Oa), this._handleMouseWheel(this._customWheelEvent(i)), this.dispatchEvent(kl));
}
function km(i) {
  this.enabled !== !1 && this._handleKeyDown(i);
}
function zm(i) {
  switch (this._trackPointer(i), this._pointers.length) {
    case 1:
      switch (this.touches.ONE) {
        case Ei.ROTATE:
          if (this.enableRotate === !1) return;
          this._handleTouchStartRotate(i), this.state = ee.TOUCH_ROTATE;
          break;
        case Ei.PAN:
          if (this.enablePan === !1) return;
          this._handleTouchStartPan(i), this.state = ee.TOUCH_PAN;
          break;
        default:
          this.state = ee.NONE;
      }
      break;
    case 2:
      switch (this.touches.TWO) {
        case Ei.DOLLY_PAN:
          if (this.enableZoom === !1 && this.enablePan === !1) return;
          this._handleTouchStartDollyPan(i), this.state = ee.TOUCH_DOLLY_PAN;
          break;
        case Ei.DOLLY_ROTATE:
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
  this.state !== ee.NONE && this.dispatchEvent(Oa);
}
function Hm(i) {
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
function Vm(i) {
  this.enabled !== !1 && i.preventDefault();
}
function Gm(i) {
  i.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, { passive: !0, capture: !0 }));
}
function Wm(i) {
  i.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, { passive: !0, capture: !0 }));
}
class Xm extends ge {
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
const xi = new I(), rl = new se(), sl = new se(), al = new I(), ol = new I();
class Ym {
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
    }, this.render = function(_, v) {
      _.matrixWorldAutoUpdate === !0 && _.updateMatrixWorld(), v.parent === null && v.matrixWorldAutoUpdate === !0 && v.updateMatrixWorld(), rl.copy(v.matrixWorldInverse), sl.multiplyMatrices(v.projectionMatrix, rl), u(_, _, v), m(_);
    }, this.setSize = function(_, v) {
      n = _, r = v, s = n / 2, a = r / 2, l.style.width = _ + "px", l.style.height = v + "px";
    };
    function c(_) {
      _.isCSS2DObject && (_.element.style.display = "none");
      for (let v = 0, p = _.children.length; v < p; v++)
        c(_.children[v]);
    }
    function u(_, v, p) {
      if (_.visible === !1) {
        c(_);
        return;
      }
      if (_.isCSS2DObject) {
        xi.setFromMatrixPosition(_.matrixWorld), xi.applyMatrix4(sl);
        const h = xi.z >= -1 && xi.z <= 1 && _.layers.test(p.layers) === !0, b = _.element;
        b.style.display = h === !0 ? "" : "none", h === !0 && (_.onBeforeRender(e, v, p), b.style.transform = "translate(" + -100 * _.center.x + "%," + -100 * _.center.y + "%)translate(" + (xi.x * s + s) + "px," + (-xi.y * a + a) + "px)", b.parentNode !== l && l.appendChild(b), _.onAfterRender(e, v, p));
        const T = {
          distanceToCameraSquared: d(p, _)
        };
        o.objects.set(_, T);
      }
      for (let h = 0, b = _.children.length; h < b; h++)
        u(_.children[h], v, p);
    }
    function d(_, v) {
      return al.setFromMatrixPosition(_.matrixWorld), ol.setFromMatrixPosition(v.matrixWorld), al.distanceToSquared(ol);
    }
    function f(_) {
      const v = [];
      return _.traverseVisible(function(p) {
        p.isCSS2DObject && v.push(p);
      }), v;
    }
    function m(_) {
      const v = f(_).sort(function(h, b) {
        if (h.renderOrder !== b.renderOrder)
          return b.renderOrder - h.renderOrder;
        const T = o.objects.get(h).distanceToCameraSquared, M = o.objects.get(b).distanceToCameraSquared;
        return T - M;
      }), p = v.length;
      for (let h = 0, b = v.length; h < b; h++)
        v[h].element.style.zIndex = p - h;
    }
  }
}
const bi = 44.45;
function Ki(i, t) {
  return { width: i.width, depth: i.depth, height: i.height, ...t?.dimensions };
}
function Yr(i) {
  const t = i.rotation === 90 || i.rotation === 270, e = t ? i.depth : i.width, n = t ? i.width : i.depth;
  return [i.x - e / 2, i.z - n / 2, i.x + e / 2, i.z + n / 2];
}
function qm(i, t) {
  return i = Yr(i), t = Yr(t), i[0] < t[2] - 0.01 && i[2] > t[0] + 0.01 && i[1] < t[3] - 0.01 && i[3] > t[1] + 0.01;
}
function zl(i, t) {
  const e = [], n = [];
  for (const r of i.placements) {
    const s = t.find((o) => o.id === r.rack_id);
    if (!s) {
      e.push("배치된 랙을 찾을 수 없습니다. 다시 불러오세요.");
      continue;
    }
    const a = Ki(s, r);
    a.height < s.u_height * bi + 80 && e.push(`${s.name}: 높이가 U 공간보다 작습니다.`), n.push({ ...r, ...a, name: s.name });
  }
  n.push(...i.blocks);
  for (const r of ["width", "depth", "height", "grid"])
    (!Number.isFinite(i[r]) || i[r] <= 0) && e.push("서버실 크기와 격자를 확인하세요.");
  return n.forEach((r, s) => {
    const a = Yr(r);
    ![r.x, r.z, r.width, r.depth, r.height].every(Number.isFinite) || r.width <= 0 || r.depth <= 0 || r.height <= 0 ? e.push(`${r.name}: 치수가 올바르지 않습니다.`) : (a[0] < 0 || a[1] < 0 || a[2] > i.width || a[3] > i.depth || r.height > i.height) && e.push(`${r.name}: 서버실 경계를 벗어납니다.`), n.slice(0, s).forEach((o) => {
      qm(r, o) && e.push(`${r.name} / ${o.name}: 서로 겹칩니다.`);
    });
  }), e;
}
function Hl(i, t) {
  if (t.position == null || t.u_height <= 0) return null;
  const e = t.position - i.starting_unit;
  return e < 0 || e + t.u_height > i.u_height ? null : (i.desc_units ? i.u_height - e - t.u_height : e) * bi;
}
function Ti(i, t, e = !0) {
  return e ? Math.round(i / t) * t : Math.round(i);
}
function Vl(i) {
  if (!i) return "";
  try {
    const t = new URL(i, window.location.href);
    return ["http:", "https:"].includes(t.protocol) ? t.href : "";
  } catch {
    return "";
  }
}
const kt = (i) => i / 1e3;
function $m(i) {
  const t = i?.deviceInfo?.primary_ips || [];
  return t.length === 1 ? t : t.length > 1 && i.interfaceId ? (i.interfaceIPs || []).filter((e) => t.includes(e)) : [];
}
class jm {
  constructor(t, e) {
    this.host = t, this.handlers = e, this.textures = /* @__PURE__ */ new Map(), this.mode = "3d", this.scene = new Lh(), this.scene.background = new Xt("#e8edf0"), this.renderer = new Pm({ antialias: !0, alpha: !1 }), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)), this.renderer.setClearColor("#e8edf0"), this.renderer.domElement.setAttribute("aria-label", "서버실 3D 배치 화면"), this.renderer.domElement.tabIndex = 0, t.appendChild(this.renderer.domElement), this.tooltip = document.createElement("div"), this.tooltip.className = "r3-device-tooltip", this.tooltip.hidden = !0, this.tooltip.setAttribute("role", "tooltip"), t.appendChild(this.tooltip), this.renderer.domElement.addEventListener("pointerleave", () => {
      this.tooltip.hidden = !0;
    }), this.labels = new Ym(), Object.assign(this.labels.domElement.style, { position: "absolute", inset: "0", pointerEvents: "none" }), t.appendChild(this.labels.domElement), this.camera = new We(42, 1, 0.01, 300), this.controls = new Lm(this.camera, this.renderer.domElement), this.controls.maxPolarAngle = Math.PI / 2 - 0.02, this.controls.minDistance = 0.6, this.controls.maxDistance = 100, this.controls.addEventListener("change", () => this.draw()), this.scene.add(new zh(16777215, 6649218, 2.5));
    const n = new Gh(16777215, 3);
    n.position.set(5, 12, 7), this.scene.add(n), this.content = new Un(), this.scene.add(this.content), this.ray = new Xh(), this.floor = new xn(new I(0, 1, 0), 0), this.renderer.domElement.addEventListener("pointerdown", (a) => this.down(a), { capture: !0 }), this.renderer.domElement.addEventListener("pointermove", (a) => this.move(a)), this.renderer.domElement.addEventListener("pointerup", (a) => this.up(a)), this.renderer.domElement.addEventListener("pointercancel", () => {
      this.drag = null, this.walkPointer = null, this.pointerStart = null, this.controls.enabled = this.mode !== "walk";
    }), this.renderer.domElement.addEventListener("dragover", (a) => a.preventDefault()), this.renderer.domElement.addEventListener("drop", (a) => {
      if (a.preventDefault(), this.mode === "walk") return;
      const o = this.floorPoint(a);
      o && e.drop(Number(a.dataTransfer.getData("text/plain")), o.x * 1e3, o.z * 1e3);
    }), this.observer = new ResizeObserver(() => this.resize()), this.observer.observe(t), this.keys = /* @__PURE__ */ new Set();
    const r = this.renderer.domElement;
    r.addEventListener("keydown", (a) => {
      if (this.mode === "walk") {
        if (a.code === "Escape") {
          this.handlers.exitWalk();
          return;
        }
        ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"].includes(a.code) && (a.preventDefault(), this.keys.add(a.code));
      }
    }), r.addEventListener("keyup", (a) => this.keys.delete(a.code));
    const s = () => {
      this.keys.clear(), this.walkPointer = null, this.pointerStart = null;
    };
    r.addEventListener("blur", s), window.addEventListener("blur", s), document.addEventListener("visibilitychange", s), r.addEventListener("lostpointercapture", () => {
      this.walkPointer = null;
    }), this.resize();
  }
  walkFree(t, e) {
    const r = this.layout;
    return t < 0.2 || e < 0.2 || t > kt(r.width) - 0.2 || e > kt(r.depth) - 0.2 ? !1 : !this.walkObstacles.some((s) => t > kt(s[0]) - 0.2 && t < kt(s[2]) + 0.2 && e > kt(s[1]) - 0.2 && e < kt(s[3]) + 0.2);
  }
  walkStart() {
    const t = kt(this.layout.width), e = kt(this.layout.depth);
    for (let n = e - 0.25; n >= 0.2; n -= Math.max(0.2, e / 150))
      for (let r = 0.25; r <= t - 0.2; r += Math.max(0.2, t / 150))
        if (this.walkFree(r, n)) return new I(r, Math.min(1.65, kt(this.layout.height) - 0.1), n);
    return null;
  }
  walkFrame(t) {
    if (this.mode !== "walk") return;
    const e = Math.min((t - (this.walkTime ?? t)) / 1e3, 0.05);
    this.walkTime = t;
    const n = (...a) => a.some((o) => this.keys.has(o)), r = Number(n("KeyW", "ArrowUp")) - Number(n("KeyS", "ArrowDown")), s = Number(n("KeyD", "ArrowRight")) - Number(n("KeyA", "ArrowLeft"));
    if (r || s) {
      const a = Math.hypot(r, s), o = n("ShiftLeft", "ShiftRight") ? 2.8 : 1.4, l = (s * Math.cos(this.yaw) - r * Math.sin(this.yaw)) / a * o * e, c = (-r * Math.cos(this.yaw) - s * Math.sin(this.yaw)) / a * o * e, u = this.camera.position;
      this.walkFree(u.x + l, u.z) && (u.x += l), this.walkFree(u.x, u.z + c) && (u.z += c), this.draw();
    }
    this.walkRAF = requestAnimationFrame((a) => this.walkFrame(a));
  }
  resize() {
    const { width: t, height: e } = this.host.getBoundingClientRect();
    !t || !e || (this.renderer.setSize(t, e), this.labels.setSize(t, e), this.camera.aspect = t / e, this.camera.updateProjectionMatrix(), this.draw());
  }
  draw() {
    this.renderer.render(this.scene, this.camera), this.labels.render(this.scene, this.camera);
  }
  point(t) {
    const e = this.renderer.domElement.getBoundingClientRect();
    this.ray.setFromCamera(new Dt((t.clientX - e.left) / e.width * 2 - 1, -(t.clientY - e.top) / e.height * 2 + 1), this.camera);
  }
  floorPoint(t) {
    return this.point(t), this.ray.ray.intersectPlane(this.floor, new I());
  }
  hit(t) {
    this.point(t);
    for (const e of this.ray.intersectObjects(this.content.children, !0))
      if (e.object.userData.rackId || e.object.userData.blockId) return e.object.userData;
    return null;
  }
  down(t) {
    if (t.button !== 0) return;
    this.mode === "walk" && (this.renderer.domElement.focus(), this.walkPointer = { x: t.clientX, y: t.clientY }, this.renderer.domElement.setPointerCapture(t.pointerId));
    const e = this.hit(t);
    if (this.pointerStart = { x: t.clientX, y: t.clientY, hit: e }, e && this.mode === "top" && this.editable) {
      const n = e.blockId ? this.layout.blocks.find((s) => s.id === e.blockId) : this.layout.placements.find((s) => s.rack_id === e.rackId);
      if (!n || n.locked) return;
      const r = this.floorPoint(t);
      if (!r) return;
      this.drag = { id: e.rackId, blockId: e.blockId, dx: n.x - r.x * 1e3, dz: n.z - r.z * 1e3 }, this.controls.enabled = !1, t.stopImmediatePropagation(), this.renderer.domElement.setPointerCapture(t.pointerId);
    }
  }
  move(t) {
    if (this.tooltip.hidden = !0, !this.drag && !this.walkPointer && this.mode !== "top") {
      this.point(t);
      const n = this.ray.intersectObjects(this.content.children, !0).find((r) => r.object.isMesh && !(r.object.material.transparent && r.object.material.opacity < 0.5));
      if (n?.object.userData.deviceInfo) {
        const r = n.object.userData.deviceInfo, s = $m(n.object.userData);
        if (s.length) {
          this.tooltip.textContent = `${r.name}${n.object.userData.interfaceName ? " · " + n.object.userData.interfaceName : ""} · ${s.join(" / ")}`, this.tooltip.hidden = !1;
          const a = this.host.getBoundingClientRect();
          this.tooltip.style.left = `${Math.max(0, Math.min(t.clientX - a.left + 12, a.width - this.tooltip.offsetWidth))}px`, this.tooltip.style.top = `${Math.max(0, t.clientY - a.top - this.tooltip.offsetHeight - 10)}px`;
        }
      }
    }
    if (this.mode === "walk" && this.walkPointer) {
      this.yaw -= (t.clientX - this.walkPointer.x) * 4e-3, this.pitch = Sl.clamp(this.pitch - (t.clientY - this.walkPointer.y) * 4e-3, -1.3, 1.3), this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ"), this.walkPointer = { x: t.clientX, y: t.clientY }, this.draw();
      return;
    }
    if (!this.drag) return;
    const e = this.floorPoint(t);
    e && (this.drag.blockId ? this.handlers.dragBlock : this.handlers.drag)(this.drag.blockId || this.drag.id, e.x * 1e3 + this.drag.dx, e.z * 1e3 + this.drag.dz);
  }
  up(t) {
    this.walkPointer = null;
    const e = this.pointerStart;
    this.drag && (this.drag = null, this.controls.enabled = !0, this.handlers.dragEnd()), e && Math.hypot(t.clientX - e.x, t.clientY - e.y) < 5 && e.hit && (e.hit.blockId ? this.handlers.selectBlock(e.hit.blockId) : this.handlers.select(e.hit.rackId, this.mode === "top" ? null : e.hit.deviceId)), this.pointerStart = null;
  }
  cube(t, e, n, r, s, a, o, l = this.content, c = {}) {
    const u = new Ze(new Bi(t, e, n), new To({ color: o, roughness: 0.78, ...c }));
    return u.position.set(r, s, a), l.add(u), u;
  }
  label(t, e, n, r, s, a = "") {
    const o = document.createElement("div");
    o.className = `r3-label ${a}`, o.textContent = t;
    const l = new Xm(o);
    l.position.set(e, n, r), s.add(l);
  }
  texture(t, e, n) {
    const r = `${t}|${e}|${n.toFixed(2)}`;
    if (this.textures.has(r)) return this.textures.get(r);
    const s = document.createElement("canvas");
    s.width = 1024, s.height = Math.max(32, Math.round(1024 / n));
    const a = s.getContext("2d");
    a.fillStyle = e, a.fillRect(0, 0, s.width, s.height);
    const o = new bo(s);
    o.colorSpace = Le, this.textures.set(r, o);
    const l = new Image();
    return l.crossOrigin = "anonymous", l.onload = () => {
      const c = Math.min(s.width / l.width, s.height / l.height);
      a.drawImage(l, (s.width - l.width * c) / 2, (s.height - l.height * c) / 2, l.width * c, l.height * c), o.needsUpdate = !0, this.draw();
    }, l.onerror = () => this.handlers.imageError?.(), l.src = t, o;
  }
  clear() {
    this.tooltip.hidden = !0, this.content.traverse((t) => {
      t.userData.textPanel && t.material.map?.dispose();
    }), this.content.traverse((t) => {
      t.geometry?.dispose(), t.material && (Array.isArray(t.material) ? t.material : [t.material]).forEach((e) => e.dispose()), t.isCSS2DObject && t.element.remove();
    }), this.content.clear();
  }
  textPanel(t, e, n, r, s, a, o, l = !1, c = {}) {
    const u = document.createElement("canvas");
    u.width = 512, u.height = c.interfaceId ? 512 : 64;
    const d = u.getContext("2d");
    d.fillStyle = "#172d3b", d.fillRect(0, 0, 512, u.height), d.fillStyle = "#f1f5f9", d.font = `bold ${c.interfaceId ? 90 : 45}px sans-serif`, d.textAlign = "center", d.textBaseline = "middle", d.fillText(t, 256, u.height / 2, 470), c.interfaceId && (d.strokeStyle = c.isPrimary ? "#fbbf24" : "#82929f", d.lineWidth = c.isPrimary ? 18 : 8, d.strokeRect(10, 10, 492, 492));
    const f = new bo(u);
    f.colorSpace = Le;
    const m = new Ze(new ar(e, n), new Ua({ map: f }));
    m.position.set(r, s, a), m.rotation.y = l ? Math.PI : 0, m.userData = { ...c, textPanel: !0 }, o.add(m);
  }
  roomObject(t, e, n) {
    const r = t.type || "pillar", s = Zi[r] || Zi.pillar, a = kt(t.width), o = kt(t.depth), l = kt(t.height), c = new Un();
    c.position.set(kt(t.x), 0, kt(t.z)), c.rotation.y = -(t.rotation || 0) * Math.PI / 180, this.content.add(c);
    const u = e ? "#0d9488" : s.color, d = (f, m, _, v, p, h, b = u, T = {}) => {
      const M = this.cube(f, m, _, v, p, h, b, c, T);
      return M.userData = { blockId: t.id }, M;
    };
    if (r === "desk") {
      d(a, l * 0.09, o, 0, l * 0.955, 0);
      for (const f of [-a * 0.43, a * 0.43]) for (const m of [-o * 0.4, o * 0.4]) d(a * 0.045, l * 0.91, o * 0.06, f, l * 0.455, m, "#485560");
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
    e && d(a + 0.06, 8e-3, o + 0.06, 0, 6e-3, 0, "#2dd4bf", { transparent: !0, opacity: 0.5 }), n.labels && this.label(t.name, 0, l + 0.12, 0, c, e ? "active" : "muted");
  }
  update(t, e, n, r = {}) {
    if (this.layout = t, this.racks = e, this.walkObstacles = [...t.blocks, ...t.placements.flatMap((l) => {
      const c = e.find((u) => u.id === l.rack_id);
      return c ? [{ ...l, ...Ki(c, l) }] : [];
    })].map(Yr), this.mode === "walk") {
      const l = this.camera.position;
      if (!this.walkFree(l.x, l.z)) {
        const c = this.walkStart();
        if (c) l.copy(c);
        else {
          this.handlers.exitWalk(), this.handlers.walkError();
          return;
        }
      }
      l.y = Math.min(1.65, kt(t.height) - 0.1);
    }
    this.editable = r.editable, this.clear();
    const s = kt(t.width), a = kt(t.depth), o = kt(t.height);
    if (this.cube(s, 0.08, a, s / 2, -0.06, a / 2, "#fafcfd"), r.grid) {
      const l = [], c = Math.max(0.1, kt(t.grid));
      for (let d = 0; d <= s; d += c) l.push(new I(d, 0, 0), new I(d, 0, a));
      for (let d = 0; d <= a; d += c) l.push(new I(0, 0, d), new I(s, 0, d));
      const u = new yo(new dn().setFromPoints(l), new Ma({ color: "#cbd5df", transparent: !0, opacity: 0.65 }));
      this.content.add(u);
    }
    r.walls && (this.cube(s, o, 0.07, s / 2, o / 2, 0, "#cdd9df", this.content, { transparent: !0, opacity: 0.24, depthWrite: !1 }), this.cube(0.07, o, a, 0, o / 2, a / 2, "#cdd9df", this.content, { transparent: !0, opacity: 0.24, depthWrite: !1 })), this.label(`${s.toFixed(1)} m`, s / 2, 0.05, a + 0.4, this.content, "dimension"), this.label(`${a.toFixed(1)} m`, s + 0.45, 0.05, a / 2, this.content, "dimension");
    for (const l of t.blocks)
      this.roomObject(l, n?.blockId === l.id, r);
    for (const l of t.placements) {
      const c = e.find((M) => M.id === l.rack_id);
      if (!c) continue;
      const u = Ki(c, l), d = kt(u.width), f = kt(u.depth), m = kt(u.height), _ = new Un();
      _.position.set(kt(l.x), 0, kt(l.z)), _.rotation.y = -l.rotation * Math.PI / 180, this.content.add(_);
      const v = { rackId: c.id }, p = n?.rackId === c.id, h = p ? "#0d9488" : "#273847";
      this.cube(d, 0.07, f, 0, 0.035, 0, h, _).userData = v, this.cube(d, 0.07, f, 0, m - 0.035, 0, h, _, { transparent: !!r.transparent, opacity: r.transparent ? 0.18 : 1, depthWrite: !r.transparent }).userData = v;
      for (const M of [-d / 2 + 0.025, d / 2 - 0.025]) for (const R of [-f / 2 + 0.025, f / 2 - 0.025]) this.cube(0.04, m, 0.04, M, m / 2, R, h, _).userData = v;
      if (r.sides)
        for (const M of [-d / 2 + 0.012, d / 2 - 0.012]) {
          const R = this.cube(0.024, m - 0.14, f - 0.08, M, m / 2, 0, h, _);
          R.userData = { ...v, sidePanel: !0 };
        }
      const b = Math.min(kt(c.rail_width || 482.6), d - 0.08), T = (m - kt(c.u_height * bi)) / 2;
      for (const M of [-b / 2 - 0.012, b / 2 + 0.012]) for (const R of [-f / 2 + 0.065, f / 2 - 0.065]) this.cube(0.018, kt(c.u_height * bi), 0.025, M, m / 2, R, "#82929f", _).userData = v;
      if (r.labels && this.label(`${c.name}${l.locked ? " · 잠금" : ""}`, 0, m + 0.18, 0, _, p ? "active" : ""), this.textPanel("FRONT · 전면", d * 0.85, 0.065, 0, m - 0.035, f / 2 + 2e-3, _, !1, v), this.textPanel("REAR · 후면", d * 0.85, 0.065, 0, m - 0.035, -f / 2 - 2e-3, _, !0, v), p) {
        const M = this.cube(d + 0.12, 0.012, f + 0.12, 0, 8e-3, 0, "#2dd4bf", _, { transparent: !0, opacity: 0.45 });
        M.userData = v;
      }
      for (const M of c.devices) {
        const R = Hl(c, M);
        if (R == null) continue;
        const C = t.appearances[String(M.id)] || {}, w = C.color || M.color || "#64748b", N = kt(M.u_height * bi) - 3e-3, E = Math.min(kt(C.depth || (M.full_depth ? u.depth - 140 : u.depth * 0.42)), f - 0.12), S = M.face === "rear", D = S ? -f / 2 + 0.065 + E / 2 : f / 2 - 0.065 - E / 2, O = new Un();
        O.position.set(0, T + kt(R) + N / 2, D), O.rotation.y = S ? Math.PI : 0, _.add(O);
        const H = { ...v, deviceId: M.id, deviceInfo: M }, $ = this.cube(b, N, E, 0, 0, 0, w, O);
        $.userData = H;
        {
          const W = Array.from({ length: 6 }, (zt, Yt) => new To({ color: (Yt === 2 || Yt === 3) && !r.deviceColors ? "#808890" : w, roughness: 0.8 }));
          for (const [zt, Yt] of [["front", 4], ["rear", 5]]) {
            const X = M.images.find((K) => K.id === C[`${zt}_image_id`])?.url || M[`${zt}_image`];
            X && (W[Yt].color.set("#ffffff"), W[Yt].map = this.texture(X, w, b / N));
          }
          $.material.dispose(), $.material = W;
          const Y = Math.min(N * 0.65, 0.04);
          this.textPanel(M.name, b * 0.94, Y, 0, (N - Y) / 2 - 1e-3, E / 2 + 1e-3, O, !1, H);
          const j = M.interfaces || [], z = 8, rt = Math.ceil(j.length / z), ct = Math.min(kt(bi) / 2, N * 0.85 / Math.max(1, rt) * 0.8, b * 0.94 / z * 0.8), St = ct * 1.25, Bt = ct * 1.25;
          if (j.forEach((zt, Yt) => this.textPanel(
            zt.name,
            ct,
            ct,
            b * 0.47 - (Yt % z + 0.5) * St,
            N * 0.425 - (Math.floor(Yt / z) + 0.5) * Bt,
            -E / 2 - 2e-3,
            O,
            !0,
            { ...H, rearInfo: M, interfaceId: zt.id, interfaceName: zt.name, interfaceIPs: zt.primary_ips || [], isPrimary: !!zt.is_primary }
          )), n?.deviceId === M.id) {
            const zt = new yo(new Oh($.geometry), new Ma({ color: "#fbbf24" }));
            O.add(zt);
          }
        }
      }
    }
    this.draw();
  }
  view(t, e) {
    if (cancelAnimationFrame(this.walkRAF), this.walkTime = null, this.keys.clear(), this.walkPointer = null, t === "walk") {
      const a = this.walkStart();
      if (!a) {
        this.handlers.walkError();
        return;
      }
      this.mode = "walk", this.controls.enabled = !1, this.camera.position.copy(a), this.yaw = 0, this.pitch = 0, this.camera.rotation.set(0, 0, 0, "YXZ"), this.renderer.domElement.focus(), this.draw(), this.walkRAF = requestAnimationFrame((o) => this.walkFrame(o));
      return;
    }
    this.controls.enabled = !0, this.mode = t === "top" ? "top" : "3d", this.controls.enableRotate = t !== "top";
    const n = this.layout;
    if (!n) return;
    const r = new I(kt(n.width) / 2, 0, kt(n.depth) / 2), s = Math.max(kt(n.width), kt(n.depth));
    if ((t === "front" || t === "rear") && e) {
      const a = n.placements.find((l) => l.rack_id === e.rackId), o = this.racks.find((l) => l.id === e.rackId);
      if (a && o) {
        const l = Ki(o, a), c = -a.rotation * Math.PI / 180;
        r.set(kt(a.x), kt(l.height) / 2, kt(a.z));
        const u = new I(0, 0.12, (t === "rear" ? -1 : 1) * (kt(l.depth) / 2 + 3.4)).applyAxisAngle(new I(0, 1, 0), c);
        this.camera.position.copy(r).add(u);
      }
    } else t === "top" ? this.camera.position.set(r.x, s * 1.5, r.z + 1e-3) : this.camera.position.set(r.x + s * 0.8, s * 0.8, r.z + s * 0.85);
    this.controls.target.copy(r), this.controls.update(), this.draw();
  }
}
const me = (i) => String(i ?? "").replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]), Tn = (i) => structuredClone(i), Qe = document.querySelector("#room3d"), zi = new nc(Qe);
let le, at, Ai, ya, An, Si = [], Kt = null, En, ze = !1, ln = !1, sn = [], qi, Gl = !1, Ie = "3d", Wl = "", Xl = !1, Ls = 0;
const yn = { grid: !0, walls: !0, labels: !0, transparent: !0, sides: !1, deviceColors: !1, snap: !0 };
Qe.innerHTML = `
  <div class="r3-app">
    <div class="r3-location-bar"><label>LOCATION <select class="no-ts" id="r3-location" aria-label="Location 선택"></select></label><label class="r3-check"><input type="checkbox" id="r3-only-rack-locations"> 랙이 배치된 Location만</label><span id="r3-room-summary"></span><div class="r3-location-actions"><button class="r3-btn small" data-action="room">서버실 설정</button><button class="r3-btn small" data-action="reload">다시 불러오기</button><span id="r3-save-state" role="status">불러오는 중</span><button data-action="cancel" class="r3-btn small">취소</button><button data-action="save" class="r3-btn small primary">배치 저장</button></div></div>
    <div id="r3-notice" role="status" aria-live="polite" hidden></div>
    <div class="r3-workspace">
      <aside class="r3-library"><div class="r3-section-title"><h2>랙 라이브러리</h2><span id="r3-rack-count"></span></div><p class="r3-help">기존 랙을 화면으로 끌어다 배치하세요.</p><input id="r3-search" type="search" placeholder="랙 또는 서버 검색" aria-label="랙 또는 서버 검색"><label class="r3-check"><input type="checkbox" id="r3-show-placed"> 배치된 랙 포함</label><div id="r3-rack-list"></div><div class="r3-library-bottom"><span class="r3-eyebrow">ROOM OBJECTS</span><label>오브젝트 종류<select class="no-ts" id="r3-object-type" aria-label="오브젝트 종류">${Object.entries(Zi).map(([i, t]) => `<option value="${i}">${t.name}</option>`).join("")}</select></label><button data-action="add-block" class="r3-btn wide">＋ 룸 오브젝트 추가</button><div id="r3-block-list"></div></div></aside>
      <main class="r3-stage"><div class="r3-toolbar"><div class="r3-segment"><button data-action="view" data-view="3d" class="active">3D 보기</button><button data-action="view" data-view="top">평면 배치</button><button data-action="view" data-view="walk">워킹 모드</button></div><div class="r3-tools"><button data-action="fit" title="전체 보기">전체 보기</button><button data-action="undo" title="되돌리기">↶ 되돌리기</button><label><input id="r3-snap" type="checkbox" checked> 격자 맞춤</label></div></div><div id="r3-canvas"></div><div class="r3-stage-footer"><span id="r3-scene-stats"></span><span id="r3-controls-help">드래그 회전 · 우클릭 이동 · 휠 확대</span></div><div id="r3-invalid" role="alert" hidden></div></main>
      <aside id="r3-inspector" class="r3-inspector"></aside>
    </div>
    <footer class="r3-footer"><span><i></i> ${zi.demo ? "샘플 데이터 · 이 브라우저에 저장됩니다" : "NetBox 인벤토리 · 레이아웃만 저장됩니다"}</span><div><label><input id="r3-grid" type="checkbox" checked> 격자</label><label><input id="r3-walls" type="checkbox" checked> 벽</label><label><input id="r3-labels" type="checkbox" checked> 이름</label><label><input id="r3-transparent" type="checkbox" checked> 투명 프레임</label><label><input id="r3-sides" type="checkbox"> 랙 측면 덮개</label><label><input id="r3-deviceColors" type="checkbox"> 서버 상·하단 할당 색상</label></div></footer>
  </div>
  <dialog id="r3-room-dialog"><form id="r3-room-form"><div class="r3-dialog-title"><h2>서버실 기본 설정</h2><button type="button" class="r3-icon-button" data-action="close-room" aria-label="닫기">×</button></div><p>선택한 Location에 공간을 연결합니다. 모든 치수는 mm입니다.</p><label>서버실 이름<input name="name" required maxlength="100"></label><div class="r3-form-grid"><label>가로 (mm)<input type="number" name="width" min="500" max="100000" required></label><label>세로 (mm)<input type="number" name="depth" min="500" max="100000" required></label><label>높이 (mm)<input type="number" name="height" min="500" max="100000" required></label><label>격자 크기 (mm)<input type="number" name="grid" min="100" max="5000" required></label></div><label class="r3-check"><input name="include_descendants" type="checkbox"> 하위 Location의 랙 포함</label><p class="r3-help">공간을 줄이면 기존 배치가 경계를 벗어날 수 있습니다.</p><div class="r3-dialog-actions"><button type="button" data-action="close-room" class="r3-btn">닫기</button><button type="submit" class="r3-btn primary">설정 적용</button></div></form></dialog>`;
const Gt = (i) => Qe.querySelector(i);
function Ue(i = "", t = !1) {
  const e = Gt("#r3-notice");
  e.textContent = i, e.hidden = !i, e.className = t ? "error" : "";
}
function Qn() {
  sn.push({ layout: Tn(at), racks: le.racks }), sn.length > 30 && sn.shift();
}
function On(i = !1) {
  ze = JSON.stringify(at) !== JSON.stringify(Ai), Ee(i);
}
function Jt() {
  return !!le?.can_edit && !ln;
}
function Km(i) {
  ln = i, Ee();
}
function je(i, t, e, n = "placement", r = !1, s = 0) {
  return `<label>${i}<input type="number" min="${s}" step="any" data-edit="${n}" data-key="${t}" value="${me(e)}" ${r || !Jt() ? "disabled" : ""}></label>`;
}
function Yl(i, t) {
  const e = Vl(i);
  return e ? `<a href="${me(e)}" target="_blank" rel="noopener noreferrer">${t} ↗</a>` : '<span class="r3-help">샘플 장비</span>';
}
function Ba() {
  const i = Si.filter((n) => !Gl || n.has_racks), t = i.some((n) => n.id === An), e = t ? "" : `<option value="" disabled selected>${i.length ? "Location 선택 (현재 화면 유지)" : "조건에 맞는 Location이 없습니다"}</option>`;
  Gt("#r3-location").innerHTML = e + i.map((n) => `<option value="${n.id}">${me(n.site)} / ${me(n.name)}</option>`).join(""), t && (Gt("#r3-location").value = String(An)), Gt("#r3-location").disabled = ln || !i.length, Gt("#r3-only-rack-locations").disabled = ln;
}
function Ee(i = !1) {
  if (!le || !at) return;
  const t = zl(at, le.racks);
  Gt("#r3-save-state").textContent = le.can_edit ? ln ? "처리 중…" : ze ? "저장하지 않은 변경" : `저장됨 · v${at.revision}` : "읽기 전용", Gt("#r3-save-state").className = ze ? "unsaved" : "", Gt("[data-action=save]").disabled = !Jt() || !ze || t.length > 0, Gt("[data-action=cancel]").disabled = ln || !ze, Gt("[data-action=undo]").disabled = !Jt() || !sn.length, Gt("[data-action=add-block]").disabled = !Jt(), Ba(), Gt("[data-action=room]").disabled = !Jt(), Gt("#r3-room-summary").textContent = `${at.name} · ${at.width / 1e3} × ${at.depth / 1e3} m · ${at.height / 1e3} m 높이`, Gt("#r3-rack-count").textContent = `${le.racks.length}`;
  const e = new Set(at.placements.map((s) => s.rack_id)), n = Wl.toLowerCase(), r = le.racks.filter((s) => (Xl || !e.has(s.id)) && (!n || s.name.toLowerCase().includes(n) || s.devices.some((a) => a.name.toLowerCase().includes(n))));
  Gt("#r3-rack-list").innerHTML = r.length ? r.map((s) => `<div class="r3-rack-card ${Kt?.rackId === s.id ? "selected" : ""}" draggable="${Jt() && !e.has(s.id)}" data-rack="${s.id}"><button class="r3-rack-select" data-action="select" data-id="${s.id}"><span class="r3-rack-icon">▥</span><span><strong>${me(s.name)}</strong><small>${s.u_height}U · ${s.width} × ${s.depth} mm</small></span></button><div class="r3-rack-meta"><span>${s.devices.length} 장비</span><button data-action="${e.has(s.id) ? "select" : "place"}" data-id="${s.id}" ${!e.has(s.id) && !Jt() ? "disabled" : ""}>${e.has(s.id) ? "배치됨 ↗" : "＋ 배치"}</button></div></div>`).join("") : '<div class="r3-empty">미배치 랙이 없습니다.<br>배치된 랙 포함을 켜서 확인하세요.</div>', Gt("#r3-block-list").innerHTML = at.blocks.map((s) => `<button class="r3-block-item" data-action="select-block" data-id="${me(s.id)}">▧ ${me(s.name)}</button>`).join(""), Gt("#r3-scene-stats").textContent = `${at.placements.length} / ${le.racks.length} 랙 배치 · ${le.racks.filter((s) => e.has(s.id)).reduce((s, a) => s + a.devices.length, 0)} 장비`, Gt("#r3-invalid").hidden = !t.length, Gt("#r3-invalid").textContent = t.length ? `저장 전 확인 · ${t.slice(0, 3).join(" / ")}` : "", Gt("#r3-controls-help").textContent = Ie === "walk" ? "WASD / 방향키 이동 · 드래그 둘러보기 · Shift 빠르게 · Esc 종료" : Ie === "top" ? "랙 드래그 배치 · 우클릭 이동 · 휠 확대" : "드래그 회전 · 우클릭 이동 · 휠 확대", Gt("[data-action=fit]").textContent = Ie === "walk" ? "시작 위치" : "전체 보기", Gt("[data-action=fit]").title = Ie === "walk" ? "워킹 시작 위치로 이동" : "전체 보기", Qe.querySelectorAll("[data-action=view]").forEach((s) => s.classList.toggle("active", s.dataset.view === Ie)), i || ql(), Qe.querySelectorAll("select").forEach((s) => s.classList.add("no-ts")), En?.update(at, le.racks, Kt, { ...yn, editable: Jt() });
}
function ql() {
  const i = Gt("#r3-inspector");
  if (Kt?.blockId) {
    const a = at.blocks.find((o) => o.id === Kt.blockId);
    if (!a)
      return Kt = null, ql();
    i.innerHTML = `<div class="r3-section-title"><h2>${me(Zi[a.type || "pillar"]?.name || "룸 오브젝트")}</h2><span class="r3-tag">BLOCK</span></div><label>이름<input data-edit="block" data-key="name" value="${me(a.name)}" maxlength="100" ${Jt() ? "" : "disabled"}></label><div class="r3-form-grid">${je("X (mm)", "x", a.x, "block")}${je("Z (mm)", "z", a.z, "block")}${je("폭 (mm)", "width", a.width, "block", !1, 100)}${je("깊이 (mm)", "depth", a.depth, "block", !1, 100)}${je("높이 (mm)", "height", a.height, "block", !1, 100)}</div><label>방향<select data-edit="block" data-key="rotation" ${Jt() ? "" : "disabled"}>${[0, 90, 180, 270].map((o) => `<option value="${o}" ${o === (a.rotation || 0) ? "selected" : ""}>${o}°</option>`).join("")}</select></label><p class="r3-help">평면 모드에서 드래그하거나 좌표를 입력하세요. 문은 닫힌 문으로 표시합니다.</p><button data-action="remove-block" class="r3-btn danger wide" ${Jt() ? "" : "disabled"}>블록 제거</button>`;
    return;
  }
  const t = le.racks.find((a) => a.id === Kt?.rackId);
  if (!t) {
    i.innerHTML = '<div class="r3-section-title"><h2>선택 정보</h2></div><div class="r3-inspector-empty"><span>◇</span><h3>공간을 구성해 보세요</h3><p>랙을 선택하면 위치와 치수를<br>조정하고 내부 장비를 확인할 수 있습니다.</p></div><div class="r3-tip"><strong>시작하기</strong><p>① 서버실 크기를 설정하세요.<br>② 평면 모드에서 랙을 배치하세요.<br>③ 3D로 앞뒤를 확인하고 저장하세요.</p></div>';
    return;
  }
  const e = at.placements.find((a) => a.rack_id === t.id), n = Ki(t, e), r = t.devices.find((a) => a.id === Kt.deviceId), s = t.devices.filter((a) => Hl(t, a) == null);
  i.innerHTML = `<div class="r3-section-title"><h2>${me(t.name)}</h2><span class="r3-tag">${t.u_height}U</span></div>${Yl(t.url, "NetBox 랙 상세")}<div class="r3-view-buttons"><button data-action="front" ${e ? "" : "disabled"}>전면 보기</button><button data-action="rear" ${e ? "" : "disabled"}>후면 보기</button></div>
    ${e ? `<div class="r3-subtitle">배치 좌표 <label class="r3-check"><input type="checkbox" data-edit="placement" data-key="locked" ${e.locked ? "checked" : ""} ${Jt() ? "" : "disabled"}> 잠금</label></div><div class="r3-form-grid">${je("X (mm)", "x", e.x, "placement", e.locked)}${je("Z (mm)", "z", e.z, "placement", e.locked)}</div><label>방향<select data-edit="placement" data-key="rotation" ${e.locked || !Jt() ? "disabled" : ""}>${[0, 90, 180, 270].map((a) => `<option value="${a}" ${a === e.rotation ? "selected" : ""}>${a}°</option>`).join("")}</select></label><details><summary>랙 표시 치수 보정</summary><p class="r3-help">원본 랙 치수는 변경되지 않습니다.${t.estimated.length ? " 일부 치수는 추정값입니다." : ""}</p><div class="r3-form-grid">${je("폭 (mm)", "width", n.width, "dimensions", e.locked, 100)}${je("깊이 (mm)", "depth", n.depth, "dimensions", e.locked, 100)}${je("높이 (mm)", "height", n.height, "dimensions", e.locked, 100)}</div></details><button data-action="unplace" class="r3-btn danger wide" ${e.locked || !Jt() ? "disabled" : ""}>배치 해제</button>` : `<p class="r3-help">아직 배치되지 않은 랙입니다.</p><button data-action="place" data-id="${t.id}" class="r3-btn primary wide" ${Jt() ? "" : "disabled"}>서버실에 배치</button>`}
    <div class="r3-subtitle">장비 <span>${t.devices.length}</span></div>${t.desc_units ? '<p class="r3-help">U 번호: 위에서 아래로 증가</p>' : ""}${s.length ? `<p class="r3-warning">위치 없음·0U·범위 초과 ${s.length}개: 목록에서만 표시</p>` : ""}<div class="r3-devices">${t.devices.map((a) => `<button data-action="device" data-id="${a.id}" class="r3-device ${r?.id === a.id ? "active" : ""}"><i style="background:${me(at.appearances[String(a.id)]?.color || a.color)}"></i><span>${me(a.name)}<small>${me(a.model)}</small></span><b>${a.position == null ? "—" : "U" + a.position}</b></button>`).join("") || '<p class="r3-help">장비가 없습니다.</p>'}</div>${r ? Zm(r) : '<p class="r3-help">장비를 선택하면 이미지와 색상을 설정할 수 있습니다.</p>'}`;
}
function Zm(i) {
  const t = at.appearances[String(i.id)] || {}, e = ["front", "rear"].map((n) => {
    const r = i.images.find((a) => a.id === t[`${n}_image_id`])?.url || i[`${n}_image`], s = zi.demo ? r : Vl(r);
    return `<div class="r3-face-preview"><span>${n === "front" ? "전면" : "후면"}</span>${s ? `<img src="${me(s)}" alt="${me(i.name)} ${n === "front" ? "전면" : "후면"} 이미지">` : `<div style="background:${me(t.color || i.color)}">설정 색상</div>`}</div>`;
  }).join("");
  return `<div class="r3-device-detail"><div class="r3-subtitle">${me(i.name)}</div><p class="r3-help">${i.u_height}U · ${i.face === "rear" ? "후면 장착" : "전면 장착"} · ${me(i.status)}</p>${Yl(i.url, "NetBox 장비 상세")}<div class="r3-previews">${e}</div><label>이미지가 없는 면의 색상<input type="color" data-edit="appearance" data-key="color" value="${me(t.color || i.color)}" ${Jt() ? "" : "disabled"}></label>${je("표시 깊이 (mm, 빈 값은 추정)", "depth", t.depth ?? "", "appearance", !1, 20)}${["front", "rear"].map((n) => `<label>${n === "front" ? "전면" : "후면"} 이미지<select data-edit="appearance" data-key="${n}_image_id" ${Jt() ? "" : "disabled"}><option value="">Device Type 이미지 사용</option>${i.images.map((r) => `<option value="${r.id}" ${t[`${n}_image_id`] === r.id ? "selected" : ""}>${me(r.name)}</option>`).join("")}</select></label>`).join("")}<button data-action="reset-appearance" class="r3-btn small" ${Jt() ? "" : "disabled"}>장비 표시 설정 초기화</button></div>`;
}
async function ka(i) {
  const t = ++Ls;
  ln = !0, Gt("#r3-location").disabled = !0, Ue("서버실 정보를 불러오고 있습니다.");
  try {
    const e = await zi.load(i);
    if (t !== Ls) return;
    le = e, at = Tn(e.layout), Ai = Tn(at), ya = le.racks, An = i, Kt = at.placements[0] ? { rackId: at.placements[0].rack_id } : null, sn = [], ze = !1, Gt("#r3-location").value = String(i), Ue(le.warning), ln = !1, Ee(), En?.view(Ie, Kt);
  } catch (e) {
    if (t !== Ls) return;
    ln = !1, Gt("#r3-location").disabled = !1, Ue(e.message, !0), An && (Gt("#r3-location").value = String(An)), Ee();
  }
}
function $l(i, t = at.width / 2, e = at.depth / 2) {
  !Jt() || !le.racks.some((n) => n.id === i) || at.placements.some((n) => n.rack_id === i) || (Qn(), at.placements.push({ rack_id: i, x: Ti(t, at.grid, yn.snap), z: Ti(e, at.grid, yn.snap), rotation: 0, locked: !1, dimensions: {} }), Kt = { rackId: i }, On(), Ue("랙을 배치했습니다. 평면 모드에서 위치를 조정한 뒤 저장하세요."));
}
Qe.addEventListener("dragstart", (i) => {
  const t = i.target.closest("[data-rack]");
  t && (i.dataTransfer.setData("text/plain", t.dataset.rack), i.dataTransfer.effectAllowed = "copy");
});
Qe.addEventListener("click", async (i) => {
  const t = i.target.closest("[data-action]");
  if (!t || t.disabled || !at) return;
  const e = t.dataset.action, n = Number(t.dataset.id);
  try {
    if (e === "select")
      Kt = { rackId: n }, Ee();
    else if (e === "select-block")
      Kt = { blockId: t.dataset.id }, Ee();
    else if (e === "device")
      Kt.deviceId = n, Ee();
    else if (e === "place") $l(n);
    else if (e === "view")
      Ie = t.dataset.view, En.view(Ie, Kt), Ie = En.mode, Ee();
    else if (e === "fit") En.view(Ie, Kt);
    else if (e === "front" || e === "rear")
      Ie = "3d", En.view(e, Kt), Ee();
    else if (e === "save" && Jt()) {
      Km(!0);
      const r = await zi.save(An, at);
      le = r, at = Tn(r.layout), Ai = Tn(at), ya = le.racks, ze = !1, sn = [], Ue("배치를 저장했습니다.");
    } else if (e === "cancel")
      at = Tn(Ai), le.racks = ya, ze = !1, sn = [], Ue("저장 전 변경을 취소했습니다.");
    else if (e === "reload")
      (!ze || window.confirm("저장하지 않은 변경을 버리고 다시 불러올까요?")) && await ka(An);
    else if (e === "undo" && Jt() && sn.length) {
      const r = sn.pop();
      at = r.layout, le.racks = r.racks, ze = JSON.stringify(at) !== JSON.stringify(Ai);
    } else if (e === "room") {
      const r = Gt("#r3-room-form");
      for (const s of ["name", "width", "depth", "height", "grid"]) r.elements[s].value = at[s];
      r.elements.include_descendants.checked = at.include_descendants, Gt("#r3-room-dialog").showModal();
    } else if (e === "close-room") Gt("#r3-room-dialog").close();
    else if (e === "unplace" && Jt())
      at.placements.find((s) => s.rack_id === Kt.rackId).locked || (Qn(), at.placements = at.placements.filter((s) => s.rack_id !== Kt.rackId));
    else if (e === "add-block" && Jt()) {
      const r = Gt("#r3-object-type").value, s = Zi[r];
      if (!s) return;
      const a = crypto.randomUUID(), o = { id: a, type: r, name: s.name, rotation: 0, width: Math.min(s.width, at.width), depth: Math.min(s.depth, at.depth), height: Math.min(s.height, at.height), x: at.width / 2, z: at.depth / 2 };
      let l = !1;
      for (let c = o.depth / 2; c <= at.depth - o.depth / 2 && !l; c += Math.max(100, at.grid, at.depth / 80))
        for (let u = o.width / 2; u <= at.width - o.width / 2; u += Math.max(100, at.grid, at.width / 80))
          if (o.x = u, o.z = c, !zl({ ...at, blocks: [...at.blocks, o] }, le.racks).length) {
            l = !0;
            break;
          }
      l || (o.x = at.width / 2, o.z = at.depth / 2, Ue("빈 공간이 부족합니다. 좌표와 크기를 조정한 뒤 저장하세요.", !0)), Qn(), at.blocks.push(o), Kt = { blockId: a }, On();
    } else e === "remove-block" && Jt() ? (Qn(), at.blocks = at.blocks.filter((r) => r.id !== Kt.blockId), Kt = null, On()) : e === "reset-appearance" && Jt() && (Qn(), delete at.appearances[String(Kt.deviceId)], On());
  } catch (r) {
    Ue(r.message, !0);
  } finally {
    ln = !1, at && (ze = JSON.stringify(at) !== JSON.stringify(Ai), Ee());
  }
});
Qe.addEventListener("input", (i) => {
  i.target.id === "r3-search" && (Wl = i.target.value, Ee());
});
Qe.addEventListener("change", async (i) => {
  const t = i.target;
  if (t.id === "r3-only-rack-locations") {
    Gl = t.checked, Ba();
    return;
  }
  if (t.id === "r3-location") {
    !ze || window.confirm("저장하지 않은 변경을 버리고 Location을 전환할까요?") ? await ka(Number(t.value)) : t.value = String(An);
    return;
  }
  if (t.id === "r3-show-placed") {
    Xl = t.checked, Ee();
    return;
  }
  for (const s of Object.keys(yn)) if (t.id === `r3-${s}`) {
    yn[s] = t.checked, Ee();
    return;
  }
  if (!t.dataset.edit || !Jt()) return;
  const e = t.dataset.key, n = t.dataset.edit;
  let r = t.type === "checkbox" ? t.checked : t.type === "number" || t.tagName === "SELECT" ? t.value === "" ? null : Number(t.value) : t.value;
  if (t.type === "number" && (t.value === "" && n !== "appearance" || t.value !== "" && (!t.validity.valid || !Number.isFinite(r)))) {
    Ue("치수와 좌표 범위를 확인하세요.", !0), Ee();
    return;
  }
  if (Qn(), n === "block") at.blocks.find((s) => s.id === Kt.blockId)[e] = r;
  else if (n === "appearance") {
    const s = at.appearances[String(Kt.deviceId)] ||= {};
    r == null ? delete s[e] : s[e] = r;
  } else {
    const s = at.placements.find((a) => a.rack_id === Kt.rackId);
    if (s.locked && e !== "locked") return;
    n === "dimensions" ? s.dimensions[e] = r : s[e] = r;
  }
  n === "appearance" && e === "color" && Qe.querySelectorAll(".r3-face-preview > div").forEach((s) => {
    s.style.background = r;
  }), On(t.type === "number" || t.type === "color" || n === "block" && e === "name");
});
Gt("#r3-room-form").addEventListener("submit", async (i) => {
  if (i.preventDefault(), !Jt()) return;
  const t = i.target, e = Tn(at);
  if (e.name = t.elements.name.value.trim(), !!e.name) {
    for (const n of ["width", "depth", "height", "grid"]) e[n] = Number(t.elements[n].value);
    e.include_descendants = t.elements.include_descendants.checked;
    try {
      let n = le.racks;
      if (e.include_descendants !== at.include_descendants) {
        const r = await zi.load(An, e.include_descendants), s = new Set(r.racks.map((o) => o.id));
        if (e.placements.some((o) => !s.has(o.rack_id))) throw new Error("하위 Location의 배치된 랙을 먼저 배치 해제하세요.");
        const a = new Set(r.racks.flatMap((o) => o.devices.map((l) => String(l.id))));
        if (Object.keys(e.appearances).some((o) => !a.has(o))) throw new Error("하위 Location 장비의 표시 설정을 먼저 초기화하세요.");
        n = r.racks;
      }
      Qn(), le.racks = n, at = e, Gt("#r3-room-dialog").close(), On(), En.view(Ie, Kt);
    } catch (n) {
      Ue(n.message, !0), Gt("#r3-room-dialog").close();
    }
  }
});
window.addEventListener("beforeunload", (i) => {
  ze && (i.preventDefault(), i.returnValue = "");
});
async function Jm() {
  try {
    if (En = new jm(Gt("#r3-canvas"), {
      exitWalk: () => {
        Ie = "3d", En.view(Ie, Kt), Ee();
      },
      walkError: () => Ue("걸어 다닐 빈 공간이 없습니다. 서버실 배치를 확인하세요.", !0),
      selectBlock: (t) => {
        Kt = { blockId: t }, Ee();
      },
      dragBlock: (t, e, n) => {
        if (!Jt()) return;
        const r = at.blocks.find((s) => s.id === t);
        r && (qi ||= { layout: Tn(at), racks: le.racks }, r.x = Ti(e, at.grid, yn.snap), r.z = Ti(n, at.grid, yn.snap), Kt = { blockId: t }, On());
      },
      select: (t, e) => {
        Kt = { rackId: t, deviceId: e }, Ee();
      },
      drop: $l,
      drag: (t, e, n) => {
        if (!Jt()) return;
        const r = at.placements.find((s) => s.rack_id === t);
        r.locked || (qi ||= { layout: Tn(at), racks: le.racks }, r.x = Ti(e, at.grid, yn.snap), r.z = Ti(n, at.grid, yn.snap), Kt = { rackId: t }, On());
      },
      dragEnd: () => {
        qi && (sn.push(qi), qi = null, Ee());
      },
      imageError: () => Ue("일부 이미지를 불러오지 못해 해당 면을 장비 색상으로 표시합니다.", !0)
    }), Si = await zi.list(), Ba(), !Si.length) {
      Ue("조회할 수 있는 Location이 없습니다. NetBox의 Location과 권한을 확인하세요.", !0);
      return;
    }
    const i = Number(Qe.dataset.initialLocation || new URLSearchParams(window.location.search).get("location"));
    await ka(Si.some((t) => t.id === i) ? i : Si.find((t) => t.configured)?.id || Si[0].id);
  } catch (i) {
    Ue(`뷰어를 시작할 수 없습니다: ${i.message}`, !0);
  }
}
Jm();
