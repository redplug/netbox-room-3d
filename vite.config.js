import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    outDir: 'netbox_room_3d/static/netbox_room_3d',
    emptyOutDir: true,
    lib: { entry: resolve('frontend/main.js'), formats: ['es'], fileName: () => 'viewer.js', cssFileName: 'viewer' },
  },
});
