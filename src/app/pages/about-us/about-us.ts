import { TranslatePipe } from '../../core/translate.pipe';
import { Component } from '@angular/core';

@Component({
  selector: 'app-about-us',
  imports: [TranslatePipe],
  templateUrl: './about-us.html',
  styleUrl: './about-us.scss',
})
export class AboutUs {}
