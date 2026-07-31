import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-expandable-section',
  standalone: true,
  templateUrl: './expandable-section.component.html',
  styleUrl: './expandable-section.component.scss',
})
export class ExpandableSectionComponent {
  title = input<string>();
  variant = input<'video' | 'commercial' | 'reel' | 'photo' | 'description'>('video');
  isExpanded = signal(false);

  toggleExpanded() {
    this.isExpanded.update((v) => !v);
  }
}
