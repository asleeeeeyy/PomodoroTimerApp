import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SoundsService } from './sounds.service';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private workDuration = 25 * 60; 
  private breakDuration = 5 * 60; 
  
  private timer: any;
  private isWorkMode = true;
  private previousMode = ''; 
  private notificationInProgress = false; 
  
  timeLeft = new BehaviorSubject<number>(this.workDuration);
  isRunning = new BehaviorSubject<boolean>(false);
  mode = new BehaviorSubject<string>('work');
  currentTime = new BehaviorSubject<Date>(new Date());
  sessionCompleted = new BehaviorSubject<string>('');
  breakTimerAutoStarted = new BehaviorSubject<boolean>(false);
  notificationActive = new BehaviorSubject<boolean>(false);
  
  constructor(private soundsService: SoundsService) {
    setInterval(() => {
      this.currentTime.next(new Date());
    }, 1000);
  }
  
  startPomodoro() {
    if (this.isRunning.value || this.notificationInProgress) return;
    if (this.timeLeft.value <= 0) {
      if (this.mode.value === 'work') {
        this.isWorkMode = false;
        this.mode.next('break');
        this.timeLeft.next(this.breakDuration);
      } else {
        this.isWorkMode = true;
        this.mode.next('work');
        this.timeLeft.next(this.workDuration);
      }
    }
    
    this.startTimer();
  }
  
  private startTimer() {
    this.isRunning.next(true);
    
    if (this.mode.value === 'break') {
      this.breakTimerAutoStarted.next(true);
    }
    
    this.timer = setInterval(() => {
      const currentTime = this.timeLeft.value;
      
      if (currentTime <= 0) {
        this.handleTimerComplete();
      } else {
        this.timeLeft.next(currentTime - 1);
      }
    }, 1000);
  }
  
  private async handleTimerComplete() {
    clearInterval(this.timer);
    this.isRunning.next(false);
    this.notificationInProgress = true;
    this.notificationActive.next(true);
    
    if (this.isWorkMode) {
      this.previousMode = 'work';
      
      this.soundsService.playNotificationSound();
      await this.vibrateDevice(true);
      this.sessionCompleted.next('work');
      this.isWorkMode = false;
      this.mode.next('break');
      this.timeLeft.next(this.breakDuration);
      
      setTimeout(() => {
        this.notificationInProgress = false;
        this.notificationActive.next(false);
        this.startPomodoro(); 
      }, 300); 
      
    } else {
      this.previousMode = 'break';
      this.soundsService.playNotificationSound();
      await this.vibrateDevice(false);
      this.sessionCompleted.next('break');
      this.isWorkMode = true;
      this.mode.next('work');
      this.timeLeft.next(this.workDuration);
      
      setTimeout(() => {
        this.notificationInProgress = false;
        this.notificationActive.next(false);
      }, 300);
    }
  }
  

  acknowledgeSessionCompletion() {
    this.soundsService.stopSound();
    this.sessionCompleted.next('');
    this.notificationInProgress = false;
    this.notificationActive.next(false);
  }
  
  private async vibrateDevice(isWorkComplete: boolean) {
    try {
      if (isWorkComplete) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }
    } catch (error) {
      console.error('Error during vibration:', error);
    }
  }
  
  resetTimer() {
    clearInterval(this.timer);
    this.isRunning.next(false);
    
    this.soundsService.stopSound();
    
    this.notificationInProgress = false;
    this.notificationActive.next(false);
    this.sessionCompleted.next('');
    
    if (this.isWorkMode) {
      this.timeLeft.next(this.workDuration);
    } else {
      this.timeLeft.next(this.breakDuration);
    }
    
    if (this.mode.value === 'break') {
      this.breakTimerAutoStarted.next(false);
    }
  }
  
  setMode(newMode: string) {
    this.isWorkMode = newMode === 'work';
    this.mode.next(newMode);
    this.soundsService.stopSound();
    this.notificationInProgress = false;
    this.notificationActive.next(false);
    this.sessionCompleted.next('');
    
    if (newMode === 'work') {
      this.timeLeft.next(this.workDuration);
    } else {
      this.timeLeft.next(this.breakDuration);
      this.breakTimerAutoStarted.next(false);
    }
  }
  
  resetBreakTimer() {
    clearInterval(this.timer);
    this.isRunning.next(false);
    this.soundsService.stopSound();
    this.notificationInProgress = false;
    this.notificationActive.next(false);
    this.sessionCompleted.next('');
    this.timeLeft.next(this.breakDuration);
    this.mode.next('break');
    this.breakTimerAutoStarted.next(false);
  }
  
  createNewPomodoro() {
    clearInterval(this.timer);
    this.isRunning.next(false);
    this.soundsService.stopSound();
    this.notificationInProgress = false;
    this.notificationActive.next(false);
    this.sessionCompleted.next('');
    this.isWorkMode = true;
    this.mode.next('work');
    this.timeLeft.next(this.workDuration);
    
    this.breakTimerAutoStarted.next(false);
  }
  
  setCustomDurations(workMinutes: number = 25, breakMinutes: number = 5) {
    this.workDuration = workMinutes * 60;
    this.breakDuration = breakMinutes * 60;
    this.workDuration = Math.max(1, this.workDuration);
    this.breakDuration = Math.max(1, this.breakDuration);
    
    if (!this.isRunning.value) {
      if (this.mode.value === 'work') {
        this.timeLeft.next(this.workDuration);
      } else {
        this.timeLeft.next(this.breakDuration);
      }
    }
  }
  
  setFullCustomDurations(
    workHours: number = 0, 
    workMinutes: number = 25, 
    workSeconds: number = 0,
    breakHours: number = 0,
    breakMinutes: number = 5,
    breakSeconds: number = 0
  ) {
    this.workDuration = (workHours * 3600) + (workMinutes * 60) + workSeconds;
    
    this.breakDuration = (breakHours * 3600) + (breakMinutes * 60) + breakSeconds;
    
    this.workDuration = Math.max(1, this.workDuration);
    this.breakDuration = Math.max(1, this.breakDuration);
    
    if (!this.isRunning.value) {
      if (this.mode.value === 'work') {
        this.timeLeft.next(this.workDuration);
      } else {
        this.timeLeft.next(this.breakDuration);
      }
    }
  }
  
  getWorkDuration(): number {
    return this.workDuration;
  }
  
  getBreakDuration(): number {
    return this.breakDuration;
  }
  
  private async showNotification(title: string, body: string) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: new Date().getTime(),
            sound: "notificationsounds.wav",
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
}