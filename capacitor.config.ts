import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aonestar.app',
  appName: 'A ONE STAR',
  webDir: 'dist',
  server: {
    url: 'https://a-one-star.vercel.app',
    cleartext: true
  }
};

export default config;
