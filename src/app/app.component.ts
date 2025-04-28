import { Component } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { App as CapacitorApp } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule]
})
export class AppComponent {
  constructor(private platform: Platform, private router: Router) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(9999, () => {
        if (this.router.url === '/home' || this.router.url === '/') {
          CapacitorApp.exitApp();
        }
      });
    });
  }
}