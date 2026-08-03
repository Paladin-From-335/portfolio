import { Component, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { YoutubeEmbedService } from '../../../../core/services/YoutubeEmbedService';

export type VideoPreviewVariant = 'default' | 'selected';

@Component({
  selector: 'app-youtube-video-preview',
  imports: [],
  templateUrl: './youtube-video-preview.component.html',
  styleUrl: './youtube-video-preview.component.scss',
})
export class YoutubeVideoPreviewComponent implements OnChanges {
  @Input({ required: true }) videoUrl!: string;
  @Input({ required: true }) thumbnailUrl?: string;
  @Input() videoPreviewTitle = 'YouTube video player';
  @Input() previewVariant: VideoPreviewVariant = 'default';

  isPlaying = signal(false);
  safeVideoUrl?: SafeResourceUrl;

  constructor(private readonly youtubeEmbedService: YoutubeEmbedService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoUrl'] && this.videoUrl) {
      this.safeVideoUrl = this.youtubeEmbedService.toSafeEmbedUrl(this.videoUrl);
      this.isPlaying.set(false);
    }
  }

  play(): void {
    this.isPlaying.set(true);
  }
}
