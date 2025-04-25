import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimerService } from '../services/timer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule] // Add these imports
})
export class HomePage implements OnInit, OnDestroy {
  currentTime: string = '';
  timeLeft: number = 0;
  isRunning: boolean = false;
  mode: string = 'work';
  
  private timeSubscription: Subscription = new Subscription();
  private runningSubscription: Subscription = new Subscription();
  private modeSubscription: Subscription = new Subscription();
  private clockInterval: any;
  
  constructor(private timerService: TimerService) {}
  
  ngOnInit() {
    this.updateCurrentTime();
    this.clockInterval = setInterval(() => {
      this.updateCurrentTime();
    }, 1000);
    
    this.timeSubscription = this.timerService.timeLeft.subscribe(time => {
      this.timeLeft = time;
    });
    
    this.runningSubscription = this.timerService.isRunning.subscribe(running => {
      this.isRunning = running;
    });
    
    this.modeSubscription = this.timerService.mode.subscribe(mode => {
      this.mode = mode;
    });
  }
  
  ngOnDestroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    
    this.timeSubscription.unsubscribe();
    this.runningSubscription.unsubscribe();
    this.modeSubscription.unsubscribe();
  }
  
  updateCurrentTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  
  startPomodoro() {
    this.timerService.startPomodoro();
  }
  
  resetTimer() {
    this.timerService.resetTimer();
  }
  
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  getProgressPercentage(): number {
    const totalSeconds = this.mode === 'work' ? 25 * 60 : 5 * 60;
    return (1 - this.timeLeft / totalSeconds) * 283;
  }
}