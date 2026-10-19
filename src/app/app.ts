import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast/toast';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, ProgressBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('membership-event-app');
}

