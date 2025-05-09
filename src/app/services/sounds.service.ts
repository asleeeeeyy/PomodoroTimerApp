import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SoundsService {
  private audio!: HTMLAudioElement;
  private isPlaying = false;
  private soundDuration = 500; 
  private soundTimer: any = null;
  private loopCount = 0;

  constructor(private platform: Platform) {
    this.initAudio();
  }

  private initAudio() {
    try {
      this.audio = new Audio('assets/notificationsounds.wav');
      
      this.audio.load();
      
      this.audio.onended = () => {
        if (this.isPlaying && this.loopCount < 5) { 
          this.loopCount++;
          this.audio.currentTime = 0;
          this.audio.play().catch(err => console.error('Error in loop playback:', err));
        } else {
          this.isPlaying = false;
          this.loopCount = 0;
        }
      };
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  playNotificationSound() {
    if (this.isPlaying) {
      return;
    }
    try {
      this.isPlaying = true;
      this.loopCount = 0;
      this.audio.currentTime = 0;
      
      if (this.platform.is('ios')) {
        document.addEventListener('touchend', () => {
          this.startSoundPlayback();
        }, { once: true });
      } else {
        this.startSoundPlayback();
      }
      
      this.soundTimer = setTimeout(() => {
        this.stopSound();
      }, this.soundDuration);
      
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }
  
  private startSoundPlayback() {
    this.audio.play().catch(err => {
      console.error('Audio play error:', err);
      this.isPlaying = false;
    });
  }

  stopSound() {
    try {
      if (this.audio && this.isPlaying) {
        if (this.soundTimer) {
          clearTimeout(this.soundTimer);
          this.soundTimer = null;
        }
        
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        this.loopCount = 0;
      }
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}