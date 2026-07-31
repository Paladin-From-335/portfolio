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
  private readonly projectService = inject(ProjectService);
  readonly selectedProjects = this.projectService.getSelectedCommercialVideos().slice(0, 2);
}
