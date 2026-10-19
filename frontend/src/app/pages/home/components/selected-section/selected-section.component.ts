import { Component, inject } from '@angular/core';
import { YoutubeVideoPreviewComponent } from '../../../../shared/components/video-preview/youtube/youtube-video-preview.component';
import { ProjectService } from '../../../../core/services/project.service';

@Component({
  selector: 'app-selected-section',
  imports: [YoutubeVideoPreviewComponent],
  templateUrl: './selected-section.component.html',
  styleUrl: './selected-section.component.scss',
})
export class SelectedSectionComponent {
  readonly projectService = inject(ProjectService);
  readonly selectedProjects = this.projectService.selectedCommercialVideos;

  constructor() {
    void this.projectService.load();
  }
}
