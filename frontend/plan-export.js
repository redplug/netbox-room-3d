import { entries } from './layout-tools.js';
import { footprint } from './geometry.js';

export function planCanvas(layout, racks) {
  const canvas = document.createElement('canvas'); canvas.width = 2400; canvas.height = 1700;
  const ctx = canvas.getContext('2d'), scale = Math.min(2160 / layout.width, 1320 / layout.depth), ox = 120, oz = 190;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#172b3a'; ctx.font = 'bold 34px sans-serif'; ctx.fillText(layout.name, 100, 65);
  ctx.font = '22px sans-serif'; ctx.fillText(`${layout.width} × ${layout.depth} mm | revision ${layout.revision} | ${new Date().toLocaleString()}`, 100, 108);
  ctx.fillText('좌상 원점 / mm · FRONT = 랙 전면 · 현재 화면의 미저장 배치 포함', 100, 145);
  ctx.strokeStyle = '#dce6e9'; ctx.lineWidth = 1;
  const origin = layout.grid_origin || 'top-left', step = Math.max(layout.grid, Math.ceil(Math.max(layout.width, layout.depth) / 200 / layout.grid) * layout.grid);
  for (let x = 0; x <= layout.width; x += step) { const v = origin.endsWith('right') ? layout.width - x : x; ctx.beginPath(); ctx.moveTo(ox + v * scale, oz); ctx.lineTo(ox + v * scale, oz + layout.depth * scale); ctx.stroke(); }
  for (let z = 0; z <= layout.depth; z += step) { const v = origin.startsWith('bottom') ? layout.depth - z : z; ctx.beginPath(); ctx.moveTo(ox, oz + v * scale); ctx.lineTo(ox + layout.width * scale, oz + v * scale); ctx.stroke(); }
  ctx.strokeStyle = '#172b3a'; ctx.lineWidth = 3; ctx.strokeRect(ox, oz, layout.width * scale, layout.depth * scale);
  for (const item of entries(layout, racks)) {
    const b = footprint(item), x = ox + b[0] * scale, z = oz + b[1] * scale, w = (b[2] - b[0]) * scale, d = (b[3] - b[1]) * scale;
    ctx.fillStyle = item.kind === 'rack' ? '#e2f2ef' : '#e9edf1'; ctx.fillRect(x, z, w, d);
    ctx.strokeStyle = '#446473'; ctx.lineWidth = 2; ctx.strokeRect(x, z, w, d);
    ctx.save(); ctx.beginPath(); ctx.rect(x + 2, z + 2, Math.max(1, w - 4), Math.max(1, d - 4)); ctx.clip();
    ctx.fillStyle = '#172b3a'; ctx.textAlign = 'center'; ctx.font = 'bold 18px sans-serif'; ctx.fillText(item.name, x + w / 2, z + d / 2 - 5, Math.max(1, w - 8));
    ctx.font = '14px sans-serif'; ctx.fillText(`${b[2] - b[0]} × ${b[3] - b[1]}`, x + w / 2, z + d / 2 + 16, Math.max(1, w - 8)); ctx.restore();
    if (item.kind === 'rack') {
      ctx.save(); ctx.translate(ox + item.x * scale, oz + item.z * scale); ctx.rotate((item.rotation || 0) * Math.PI / 180);
      ctx.fillStyle = '#087f78'; const edge = item.depth * scale / 2; ctx.beginPath(); ctx.moveTo(-8, edge - 12); ctx.lineTo(8, edge - 12); ctx.lineTo(0, edge); ctx.fill(); ctx.restore();
    }
  }
  ctx.textAlign = 'left'; ctx.fillStyle = '#647786'; ctx.font = '20px sans-serif'; ctx.fillText('Room 3D | FRONT: 녹색 삼각형 방향 | 도면은 축척에 맞춰 출력되며 글자는 이미지로 포함됩니다.', 100, 1650);
  return canvas;
}
// Single-page PDF with a JPEG image: Korean labels stay identical to the PNG.
export function canvasPDF(canvas) {
  const raw = atob(canvas.toDataURL('image/jpeg', .95).split(',')[1]), jpg = Uint8Array.from(raw, c => c.charCodeAt(0)), enc = new TextEncoder();
  const parts = [], offsets = [0]; let length = 0;
  const add = value => { const bytes = typeof value === 'string' ? enc.encode(value) : value; parts.push(bytes); length += bytes.length; };
  add('%PDF-1.4\n');
  const obj = (id, body) => { offsets[id] = length; add(`${id} 0 obj\n${body}\nendobj\n`); };
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>'); obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 596] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
  offsets[4] = length; add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`); add(jpg); add('\nendstream\nendobj\n');
  const content = 'q 842 0 0 596 0 0 cm /Im0 Do Q'; obj(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  const start = length; add('xref\n0 6\n0000000000 65535 f \n'); offsets.slice(1).forEach(n => add(`${String(n).padStart(10, '0')} 00000 n \n`));
  add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`);
  return new Blob(parts, { type: 'application/pdf' });
}
export async function exportPlan(layout, racks, format) {
  await document.fonts.ready;
  const canvas = planCanvas(layout, racks), blob = format === 'pdf' ? canvasPDF(canvas) : await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = `room3d-${layout.name.replace(/[\\/:*?"<>|]/g, '_')}.${format}`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
