import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        customOrder: resolve(__dirname, 'custom-order.html'),
        managerDashboard: resolve(__dirname, 'manager-dashboard.html'),
        orderTracking: resolve(__dirname, 'order-tracking.html'),
      },
    },
  },
});
