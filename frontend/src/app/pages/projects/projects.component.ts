import { Component, inject } from '@angular/core';

import { ProjectService } from '../../core/services/project.service';
import { ProjectCard } from '../../core/models/project-card.model';
import { ProjectCardComponent } from '../../shared/components/project-card/project-card.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    ProjectCardComponent
  ],
  templateUrl: './projects.component.html'
})
export class ProjectsComponent {

  private projectService = inject(ProjectService);

  projects: ProjectCard[] = this.projectService.getProjects();
}
