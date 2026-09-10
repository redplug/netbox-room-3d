// Scene-owned, reference-counted cache. Active resources are never evicted.
// A small idle LRU avoids regenerating labels on option toggles without retaining
// every device/image ever viewed during a long browser session.
export class ResourcePool {
  constructor(maxIdle = 128) { this.entries = new Map(); this.maxIdle = maxIdle; this.clock = 0; this.created = 0; }
  acquire(key, create) {
    let entry = this.entries.get(key);
    if (!entry) { entry = { value: create(), refs: 0, used: 0 }; this.entries.set(key, entry); this.created++; }
    entry.refs++; entry.used = ++this.clock;
    return entry.value;
  }
  release(key) {
    const entry = this.entries.get(key);
    if (!entry || entry.refs < 1) throw new Error(`Unbalanced resource release: ${key}`);
    entry.refs--; entry.used = ++this.clock;
  }
  prune() {
    const idle = [...this.entries].filter(([, e]) => !e.refs).sort((a, b) => a[1].used - b[1].used);
    for (const [key, entry] of idle.slice(0, Math.max(0, idle.length - this.maxIdle))) {
      entry.value.dispose(); this.entries.delete(key);
    }
  }
  clear() { for (const entry of this.entries.values()) entry.value.dispose(); this.entries.clear(); }
  get stats() { return { entries: this.entries.size, idle: [...this.entries.values()].filter(e => !e.refs).length, created: this.created }; }
}
