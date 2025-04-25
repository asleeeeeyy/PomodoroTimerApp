// src/app/services/timer.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Platform } from '@ionic/angular';
import { Haptics } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private workDuration = 25 * 60; // 25 minutes in seconds
  private breakDuration = 5 * 60; // 5 minutes in seconds
  
  private timer: any;
  private isWorkMode = true;
  
  timeLeft = new BehaviorSubject<number>(this.workDuration);
  isRunning = new BehaviorSubject<boolean>(false);
  mode = new BehaviorSubject<string>('work');
  currentTime = new BehaviorSubject<Date>(new Date());
  
  constructor(private platform: Platform) {
    // Update current time every second
    setInterval(() => {
      this.currentTime.next(new Date());
    }, 1000);
    
    // Handle back button
    this.platform.backButton.subscribeWithPriority(10, () => {
      App.exitApp();
    });
  }
  
  startPomodoro() {
    if (this.isRunning.value) return;
    
    this.isWorkMode = true;
    this.mode.next('work');
    this.timeLeft.next(this.workDuration);
    this.startTimer();
  }
  
  private startTimer() {
    this.isRunning.next(true);
    
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
    
    if (this.isWorkMode) {
      // Work session completed
      await this.showNotification('Work session completed!', 'Time for a break.');
      this.isWorkMode = false;
      this.mode.next('break');
      this.timeLeft.next(this.breakDuration);
      this.startTimer();
    } else {
      // Break completed
      await this.showNotification('Break completed!', 'Ready for another Pomodoro?');
      this.isRunning.next(false);
      this.isWorkMode = true;
      this.mode.next('work');
      this.timeLeft.next(this.workDuration);
    }
  }
  
  resetTimer() {
    clearInterval(this.timer);
    this.isRunning.next(false);
    this.isWorkMode = true;
    this.mode.next('work');
    this.timeLeft.next(this.workDuration);
  }
  
  private async showNotification(title: string, body: string) {
    try {
      // Vibrate the device
      await Haptics.vibrate();
      
      // Show notification
      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: new Date().getTime(),
            sound: 'default',
            extra: null
          }
        ]
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
}