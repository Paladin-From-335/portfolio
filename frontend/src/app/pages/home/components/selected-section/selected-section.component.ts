import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface SelectedWork {
  title: string;
  videoUrl: SafeResourceUrl;
}

@Component({
  selector: 'app-selected-section',
  imports: [],
  templateUrl: './selected-section.component.html',
  styleUrl: './selected-section.component.scss',
})
export class SelectedSectionComponent {
  works: SelectedWork[];

  constructor(private sanitizer: DomSanitizer) {
    this.works = [
      {
        title: 'Mer de Glace',
        videoUrl: this.getSafeYoutubeUrl('g17hO5fSrvg'),
      },
      {
        title: 'Work 2',
        videoUrl: this.getSafeYoutubeUrl('g17hO5fSrvg'),
      },
    ];
  }

  private getSafeYoutubeUrl(videoId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${videoId}`);
  }
}
