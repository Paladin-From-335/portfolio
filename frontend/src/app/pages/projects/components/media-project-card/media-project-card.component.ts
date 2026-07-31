import { Component, Input, OnChanges } from '@angular/core';
import { PhotoCarouselComponent } from '../../../../shared/components/photo-carousel/photo-carousel.component';
import { PROJECT_TYPES, ProjectCard, ReelProjectCard } from '../../../../core/models/project-card.model';
import { YoutubeVideoPreviewComponent } from '../../../../shared/components/video-preview/youtube/youtube-video-preview.component';
import { ReelCarouselComponent } from '../../../../shared/components/video-preview/reel-carousel/reel-carousel.component';

@Component({
  selector: 'app-media-project-card',
  imports: [PhotoCarouselComponent, YoutubeVideoPreviewComponent, ReelCarouselComponent],
  templateUrl: './media-project-card.component.html',
  styleUrl: './media-project-card.component.scss',
})
export class MediaProjectCardComponent implements OnChanges{
  @Input() project?: ProjectCard;
  @Input() projectList?: ReelProjectCard[];

  ngOnChanges(): void {
    const hasProject = this.project !== undefined;
    const hasProjectList = this.projectList !== undefined;
    if (hasProject === hasProjectList) {
      throw new Error('MediaProjectCardComponent requires exactly one input: project or projects.');
    }
  }

  protected readonly PROJECT_TYPES = PROJECT_TYPES;
}
