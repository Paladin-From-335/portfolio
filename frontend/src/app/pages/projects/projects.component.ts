import { Component, inject } from '@angular/core';

import { ProjectService } from '../../core/services/project.service';
import { ExpandableSectionComponent } from '../../shared/components/expandable-section/expandable-section.component';
import { MediaProjectCardComponent } from './components/media-project-card/media-project-card.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [ExpandableSectionComponent, MediaProjectCardComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  private readonly projectService = inject(ProjectService);
  private readonly projects = this.projectService.getProjects();
  commercialVideos = this.projectService.getCommercialVideos();
  noncommercialVideos = this.projectService.getNonCommercialVideos();
  reels = this.projectService.getReels();
  photos = this.projectService.getPhotos();
}
