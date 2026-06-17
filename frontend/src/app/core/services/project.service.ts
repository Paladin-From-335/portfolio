import { Injectable } from '@angular/core';
import { ProjectCard } from '../models/project-card.model';
import { PROJECTS } from '../data/project.data';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  getProjects(): ProjectCard[] {
    return PROJECTS;
  }
}
