import { deviceBottom, U } from './geometry.js';

export function rackUsage(rack) {
  const occupied = new Set();
  for (const device of rack.devices) {
    const bottom = deviceBottom(rack, device);
    if (bottom == null) continue;
    for (let i = Math.floor(bottom / U + 1e-8); i < Math.ceil(bottom / U + device.u_height - 1e-8); i++) occupied.add(i);
  }
  return { occupied, used: occupied.size, free: rack.u_height - occupied.size,
    percent: Math.round(occupied.size / rack.u_height * 100), count: rack.devices.length };
}
export function deviceMatches(device, query, status = '') {
  const q = query.trim().toLowerCase();
  return (!status || device.status === status) && (!q || [device.name, ...(device.ip_addresses || []), ...(device.primary_ips || [])].some(v => v.toLowerCase().includes(q)));
}
export function searchIPs(device, query) {
  const ips = [...new Set([...(device.primary_ips || []), ...(device.ip_addresses || [])])];
  const matching = ips.filter(ip => ip.toLowerCase().includes(query.trim().toLowerCase()));
  return { ips: matching.length ? matching : ips, matched: !!query.trim() && matching.length > 0 };
}
export const statusColor = status => ({ active: '#16a34a', planned: '#3b82f6', staged: '#a855f7', offline: '#64748b', failed: '#dc2626', inventory: '#d97706', decommissioning: '#ea580c' })[status] || '#64748b';
export const usageColor = percent => percent >= 90 ? '#dc2626' : percent >= 70 ? '#d97706' : '#0d9488';
