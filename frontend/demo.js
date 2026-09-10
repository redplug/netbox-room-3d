function panel(rear = false) {
  const ports = Array.from({ length: rear ? 8 : 12 }, (_, i) => `<rect x="${28 + i * 34}" y="${rear ? 22 : 16}" width="26" height="${rear ? 24 : 37}" rx="2" fill="${rear ? '#0e7490' : '#26374a'}" stroke="#566679"/><circle cx="${32 + i * 34}" cy="${rear ? 27 : 45}" r="2" fill="#5eead4"/>`).join('');
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="70"><rect width="480" height="70" rx="4" fill="#a8b2c0"/><rect x="8" y="7" width="464" height="56" fill="#111c2b"/>${ports}<text x="445" y="40" fill="#dbeafe" font-size="9" font-family="sans-serif" text-anchor="middle">${rear ? 'REAR' : 'FRONT'}</text></svg>`)}`;
}
export function demoData(id = 1) {
  const racks = Array.from({ length: id === 1 ? 8 : 4 }, (_, i) => ({
    id: id * 100 + i + 1, name: `${id === 1 ? 'A' : 'B'}-${String(i + 1).padStart(2, '0')}`,
    width: i === 3 ? 800 : 600, depth: i === 3 ? 1200 : 1000, height: 2100,
    u_height: 42, starting_unit: 1, desc_units: i === 2, rail_width: 482.6,
    estimated: i === 4 ? ['depth'] : [], url: '',
    devices: Array.from({ length: 9 }, (_, n) => ({
      id: id * 10000 + i * 100 + n, name: `${n < 2 ? 'sw' : 'srv'}-${String(i + 1).padStart(2, '0')}-${String(n + 1).padStart(2, '0')}`,
      model: n < 2 ? '48-port switch' : 'Rack server · 2U', u_height: n < 2 ? 1 : 2,
      position: n < 2 ? 41 + n : 2 + (n - 2) * 4, face: i === 2 && n < 2 ? 'rear' : 'front', full_depth: n >= 2,
      status: 'active', color: n < 2 ? '#3b82f6' : ['#0d9488', '#64748b', '#8b5cf6'][i % 3],
      front_image: n === 2 || n === 3 ? panel() : null,
      rear_image: n === 2 ? panel(true) : null, images: [], url: '',
      interfaces: n >= 2 ? [{ id: n * 2, name: 'eth0' }, { id: n * 2 + 1, name: 'eth1' }] : [],
      primary_ips: n >= 2 ? [`192.0.2.${10 + n}/24`] : [],
    })),
  }));
  return {
    can_edit: true, warning: '', racks,
    layout: { name: id === 1 ? '서버실 A' : '네트워크실 B', width: 12000, depth: 8000, height: 3000, grid: 600,
      include_descendants: false, revision: 0, appearances: {},
      placements: racks.slice(0, id === 1 ? 4 : 2).map((r, i) => ({ rack_id: r.id, x: 2400 + i * 1200, z: 3000, rotation: 0, locked: false, dimensions: {} })),
      blocks: [{ id: 'pillar1', name: '기둥', x: 9000, z: 6000, width: 600, depth: 600, height: 3000 }],
    },
  };
}
