import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      // Exclude large data files from the file watcher to prevent EBUSY errors
      ignored: ['**/src/data/**', '**/BR_Municipios_2025.json'],
    },
  },
});
