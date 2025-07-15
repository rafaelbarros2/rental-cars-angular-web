import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-title-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './title-content.component.html',
  styleUrls: ['./title-content.component.scss'],
})
export class TitleContentComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
}
