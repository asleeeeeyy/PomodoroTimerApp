import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.pomodoroTimer',
  appName: 'Pomodoro Timer',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#4285F4",
      sound: "beep.wav",
    },
  },
};

export default config;