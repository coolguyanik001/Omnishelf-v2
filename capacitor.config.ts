// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId:   'com.omnishelf.app',
  appName: 'OmniShelf',
  webDir:  'dist',
  server: {
    androidScheme: 'https',
    // For development: point to Vite dev server on LAN
    // url: 'http://192.168.x.x:5173',
    // cleartext: true,
  },
  android: {
    buildOptions: {
      keystorePath:       'release.keystore',
      keystoreAlias:      'omnishelf',
      releaseType:        'APK',
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration:  2000,
      backgroundColor:     '#0f172a',
      androidSplashResourceName: 'splash',
      showSpinner:         false,
    },
  },
};

export default config;
