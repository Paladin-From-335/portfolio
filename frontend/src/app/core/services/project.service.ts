import { Injectable } from '@angular/core';
import {
  PhotoProjectCard,
  PROJECT_TYPES,
  ProjectCard,
  ReelProjectCard,
  VIDEO_CATEGORIES,
  VideoProjectCard,
} from '../models/project-card.model';
import { PROJECTS } from '../data/project.data';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  getProjects(): ProjectCard[] {
    return PROJECTS;
  }

  getVideos(): VideoProjectCard[] {
    return PROJECTS.filter((p): p is VideoProjectCard => p.type === PROJECT_TYPES.VIDEO);
  }

  getCommercialVideos(): VideoProjectCard[] {
    return this.getVideos().filter((p) => p.category === VIDEO_CATEGORIES.COMMERCIAL);
  }

  getNonCommercialVideos(): VideoProjectCard[] {
    return this.getVideos().filter((p) => p.category === VIDEO_CATEGORIES.NONCOMMERCIAL);
  }

  getSelectedCommercialVideos(): VideoProjectCard[] {
    return this.getCommercialVideos().filter((p) => p.isSelected);
  }

  getReels(): ReelProjectCard[] {
    return PROJECTS.filter((p): p is ReelProjectCard => p.type === PROJECT_TYPES.REEL);
  }

  getPhotos(): PhotoProjectCard[] {
    return PROJECTS.filter((p): p is PhotoProjectCard => p.type === PROJECT_TYPES.PHOTO);
  }
}
