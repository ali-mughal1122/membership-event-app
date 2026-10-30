import { TranslatePipe } from '../../core/translate.pipe';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.scss'
})
export class ContactUs {
}
