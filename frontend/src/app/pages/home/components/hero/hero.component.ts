import { Component, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ProjectService } from '../../../../core/services/project.service';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  readonly heroTitle = 'Video Director';
  readonly subtitle = 'Commercials, branded content and visual storytelling';
  private readonly projectService = inject(ProjectService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly settings = this.projectService.settings;
  readonly heroVideoUrl = computed(() => {
    const settings = this.settings();
    if (!settings) return null;
    // Only validated IDs are interpolated into a fixed Vimeo origin.
    const url = new URL(`https://player.vimeo.com/video/${settings.heroVimeoId}`);
    if (settings.heroVimeoHash) url.searchParams.set('h', settings.heroVimeoHash);
    for (const key of ['autoplay', 'muted', 'loop', 'background', 'playsinline', 'dnt']) {
      url.searchParams.set(key, '1');
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url.toString());
  });

  constructor() {
    void this.projectService.load();
  }
}
