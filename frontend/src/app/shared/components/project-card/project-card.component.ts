import { Component, input } from '@angular/core';
import { ProjectCard } from '../../../core/models/project-card.model';

@Component({
  selector: 'app-project-card',
  standalone: true,
  templateUrl: './project-card.component.html',
})
export class ProjectCardComponent {
  project = input.required<ProjectCard>();
}
