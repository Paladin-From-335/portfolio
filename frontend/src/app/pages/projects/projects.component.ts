import { Component, inject } from '@angular/core';

import { ProjectService } from '../../core/services/project.service';
import { ProjectCard } from '../../core/models/project-card.model';
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
  private projectService = inject(ProjectService);

  projects: ProjectCard[] = this.projectService.getProjects();
}
