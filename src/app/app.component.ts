// app.component.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    IonicModule,  // This import is crucial for Ionic components
    RouterModule  // This is needed for ion-router-outlet
  ],
})
export class AppComponent {
  constructor() {}
}