import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  title = 'Video Director';
  subtitle = 'Commercials, branded content and visual storytelling';

  private readonly vimeoVideoId = '76979871';

  heroVideoUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.heroVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://player.vimeo.com/video/${this.vimeoVideoId}?autoplay=1&muted=1&loop=1&background=1`,
    );
  }
}
