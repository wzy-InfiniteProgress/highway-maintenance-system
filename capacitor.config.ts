import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.highway.maintenance',
  appName: '机电维护',
  webDir: 'out',
  server: {
    androidScheme: 'http',
    hostname: '192.168.2.11',
    allowNavigation: ['192.168.2.11', 'localhost', '127.0.0.1']
  },
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: true
  }
};

export default config;
