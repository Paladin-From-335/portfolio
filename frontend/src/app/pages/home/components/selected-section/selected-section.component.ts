import { Component, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface SelectedWork {
  title: string;
  videoId: string;
  videoUrl: SafeResourceUrl;
  thumbnailUrl?: string
}

@Component({
  selector: 'app-selected-section',
  imports: [],
  templateUrl: './selected-section.component.html',
  styleUrl: './selected-section.component.scss',
})
export class SelectedSectionComponent {
  works: SelectedWork[];

  activeVideoId = signal<string | null>(null);

  playVideo(videoId: string) {
    this.activeVideoId.set(videoId);
  }

  isVideoActive(videoId: string): boolean {
    return this.activeVideoId() === videoId;
  }

  constructor(private sanitizer: DomSanitizer) {
    this.works = [
      {
        title: 'Mer de Glace',
        videoId: 'g17hO5fSrvg',
        videoUrl: this.getSafeYoutubeUrl('g17hO5fSrvg'),
        thumbnailUrl: 'photo.jpg'
      },
      {
        title: 'Work 2',
        videoId: '6_qf6Qz4bCQ',
        videoUrl: this.getSafeYoutubeUrl('6_qf6Qz4bCQ'),
        thumbnailUrl: 'photo.jpg'
      },
    ];
  }

  private getSafeYoutubeUrl(videoId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&rel=0`,
    );
  }
}
