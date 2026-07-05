import { Component, Input } from '@angular/core';
import { PhotoCarouselComponent } from '../../../../shared/components/photo-carousel/photo-carousel.component';
import { ProjectCard } from '../../../../core/models/project-card.model';
import { YoutubeVideoPreviewComponent } from '../../../../shared/components/video-preview/youtube-video-preview.component';

@Component({
  selector: 'app-media-project-card',
  imports: [PhotoCarouselComponent, YoutubeVideoPreviewComponent],
  templateUrl: './media-project-card.component.html',
  styleUrl: './media-project-card.component.scss',
})
export class MediaProjectCardComponent {
  @Input({ required: true }) project!: ProjectCard;
}
