// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shadowspeak.app',
  appName: 'ShadowSpeak',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#F7F4EC',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#F7F4EC',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_shadowspeak',
      iconColor: '#1A2A18',
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    backgroundColor: '#F7F4EC',
  },
  android: {
    backgroundColor: '#F7F4EC',
  },
};

export default config;
