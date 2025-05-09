import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimerService } from '../services/timer.service';
import { Subscription } from 'rxjs';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit, OnDestroy {
  currentTime: string = '';
  timeLeft: number = 0;
  isRunning: boolean = false;
  mode: string = 'work';
  realTimeClock: string = '';
  previousMode: string = 'work';
  breakTimerAutoStarted: boolean = false;
  notificationActive: boolean = false;
  
  private timeSubscription: Subscription = new Subscription();
  private runningSubscription: Subscription = new Subscription();
  private modeSubscription: Subscription = new Subscription();
  private clockSubscription: Subscription = new Subscription();
  private sessionCompletedSubscription: Subscription = new Subscription();
  private breakTimerAutoStartedSubscription: Subscription = new Subscription();
  private notificationActiveSubscription: Subscription = new Subscription();
  
  constructor(
    public timerService: TimerService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}
  
  ngOnInit() {
    this.timeSubscription = this.timerService.timeLeft.subscribe(time => {
      this.timeLeft = time;
      this.currentTime = this.formatTime(time);
    });
    
    this.runningSubscription = this.timerService.isRunning.subscribe(running => {
      this.isRunning = running;
    });
    
    this.modeSubscription = this.timerService.mode.subscribe(mode => {
      this.mode = mode;
      
      this.previousMode = mode;
    });
    
    this.clockSubscription = this.timerService.currentTime.subscribe(time => {
      this.realTimeClock = this.formatRealTime(time);
    });
    
    this.sessionCompletedSubscription = this.timerService.sessionCompleted.subscribe(
      (sessionType) => {
        if (sessionType === 'work') {
          this.showToast('Work session completed! Time for a break.');
        } else if (sessionType === 'break') {
          this.showToast('Break completed! Starting new work session.');
        }
      }
    );
    
    this.breakTimerAutoStartedSubscription = this.timerService.breakTimerAutoStarted.subscribe(
      (autoStarted) => {
        this.breakTimerAutoStarted = autoStarted;
      }
    );
    
    this.notificationActiveSubscription = this.timerService.notificationActive.subscribe(
      (active) => {
        this.notificationActive = active;
      }
    );
  }
  
  ngOnDestroy() {
    this.timeSubscription.unsubscribe();
    this.runningSubscription.unsubscribe();
    this.modeSubscription.unsubscribe();
    this.clockSubscription.unsubscribe();
    this.sessionCompletedSubscription.unsubscribe();
    this.breakTimerAutoStartedSubscription.unsubscribe();
    this.notificationActiveSubscription.unsubscribe();
  }
  
  onOkButtonClick() {
    this.timerService.acknowledgeSessionCompletion();
  }
  
  resetBreakTimer() {
    this.timerService.resetBreakTimer();
  }
  
  createNewPomodoro() {
    this.timerService.setMode('work');
    this.timerService.resetTimer();
  }
  
  resetTimer() {
    this.timerService.resetTimer();
  }
  
  onModeChange(event: CustomEvent) {
    if (event.detail.value) {
      this.timerService.setMode(event.detail.value);
    }
  }
  
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1000, 
      position: 'top',
      cssClass: 'toast-message',
      animated: true
    });
    toast.present();
  }
  
  acknowledgeSessionCompletion() {
    this.timerService.acknowledgeSessionCompletion();
  }
  
  async selectPresetTimer() {
  const alert = await this.alertController.create({
    header: 'Select Timer Option',
    buttons: [
      {
        text: 'OK',
        handler: (data) => {
          if (data === 'presets') {
            this.showPresetOptions();
          } else if (data === 'custom') {
            this.showCustomTimerOptions();
          }
          return true;
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ],
    inputs: [
      {
        type: 'radio',
        label: 'Preset Timers',
        value: 'presets',
        checked: true
      },
      {
        type: 'radio',
        label: 'Custom Timer',
        value: 'custom'
      }
    ],
    cssClass: 'centered-alert'
  });
  
  await alert.present();
}
  
  async showPresetOptions() {
  const alert = await this.alertController.create({
    header: 'Select Timer Duration',
    inputs: [
      {
        name: 'pomodoro25',
        type: 'radio',
        label: '25/5 - Standard Pomodoro',
        value: { work: 25, break: 5 },
        checked: true
      },
      {
        name: 'pomodoro15',
        type: 'radio',
        label: '15/3 - Short Pomodoro',
        value: { work: 15, break: 3 }
      },
      {
        name: 'pomodoro50',
        type: 'radio',
        label: '50/10 - Long Pomodoro',
        value: { work: 50, break: 10 }
      },
      {
        name: 'pomodoro90',
        type: 'radio',
        label: '90/20 - Extended Focus',
        value: { work: 90, break: 20 }
      }
    ],
    buttons: [
      {
        text: 'OK',
        handler: (data) => {
          if (data) {
            this.timerService.setCustomDurations(data.work, data.break);
            this.timerService.resetTimer();
          }
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ],
    cssClass: 'centered-alert'
  });
  await alert.present();
}
  
  async showCustomTimerOptions() {
  const workAlert = await this.alertController.create({
    header: 'Work Duration',
    inputs: [
      {
        name: 'hours',
        type: 'number',
        placeholder: 'Hours',
        min: 0,
        max: 24
      },
      {
        name: 'minutes',
        type: 'number',
        placeholder: 'Minutes',
        min: 0,
        max: 59
      },
      {
        name: 'seconds',
        type: 'number',
        placeholder: 'Seconds',
        min: 0,
        max: 59
      }
    ],
    buttons: [
      {
        text: 'Next',
        handler: (workData) => {
          const workHours = workData.hours ? parseInt(workData.hours) : 0;
          const workMinutes = workData.minutes ? parseInt(workData.minutes) : 25;
          const workSeconds = workData.seconds ? parseInt(workData.seconds) : 0;
          
          this.showBreakDurationAlert(workHours, workMinutes, workSeconds);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ],
    cssClass: 'centered-alert'
  });
  await workAlert.present();
}
  
  async showBreakDurationAlert(workHours: number, workMinutes: number, workSeconds: number) {
  const breakAlert = await this.alertController.create({
    header: 'Break Duration',
    inputs: [
      {
        name: 'hours',
        type: 'number',
        placeholder: 'Hours',
        min: 0,
        max: 24
      },
      {
        name: 'minutes',
        type: 'number',
        placeholder: 'Minutes',
        min: 0,
        max: 59
      },
      {
        name: 'seconds',
        type: 'number',
        placeholder: 'Seconds',
        min: 0,
        max: 59
      }
    ],
    buttons: [
      {
        text: 'Set Timer',
        handler: (breakData) => {
          const breakHours = breakData.hours ? parseInt(breakData.hours) : 0;
          const breakMinutes = breakData.minutes ? parseInt(breakData.minutes) : 5;
          const breakSeconds = breakData.seconds ? parseInt(breakData.seconds) : 0;
          
          this.timerService.setFullCustomDurations(
            workHours,
            workMinutes,
            workSeconds,
            breakHours,
            breakMinutes,
            breakSeconds
          );
          
          this.timerService.resetTimer();
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ],
    cssClass: 'centered-alert'
  });
  await breakAlert.present();
}
  
  startPomodoro() {
    if (this.timeLeft === 0) {
      if (this.mode === 'work') {
        this.timerService.setMode('break');
      } else {
        this.timerService.setMode('work');
      }
    }
    
    this.timerService.startPomodoro();
  }
  
  formatTime(seconds: number): string {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }
  
  formatRealTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  
  getProgressPercentage(): number {
  let totalSeconds = this.mode === 'work' 
    ? this.timerService.getWorkDuration() 
    : this.timerService.getBreakDuration();
  
  return (this.timeLeft / totalSeconds) * 283;
}
  
  shouldDisableStartButton(): boolean {
    if (this.isRunning) return true;
    
    if (this.notificationActive) return true;
    
    if (this.mode === 'break' && this.breakTimerAutoStarted) return true;
    
    return false;
  }
}