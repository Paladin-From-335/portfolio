import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class YoutubeEmbedService {
  constructor(private readonly sanitizer: DomSanitizer) {}

  toSafeEmbedUrl(videoUrl: string): SafeResourceUrl {
    const embedUrl = this.toEmbedUrl(videoUrl);

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  private toEmbedUrl(videoUrl: string): string {
    const url = new URL(videoUrl);
    const videoId = url.searchParams.get('v');

    if (!videoId) {
      throw new Error(`Invalid YouTube URL: ${videoUrl}`);
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`;
  }
}
