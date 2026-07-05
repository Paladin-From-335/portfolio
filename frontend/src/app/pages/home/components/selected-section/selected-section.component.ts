import { Component } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { PROJECTS } from '../../../../core/data/project.data';
import { YoutubeVideoPreviewComponent } from '../../../../shared/components/video-preview/youtube-video-preview.component';

interface SelectedWork {
  title: string;
  videoId: string;
  videoUrl: SafeResourceUrl;
  thumbnailUrl?: string;
}

@Component({
  selector: 'app-selected-section',
  imports: [YoutubeVideoPreviewComponent],
  templateUrl: './selected-section.component.html',
  styleUrl: './selected-section.component.scss',
})
export class SelectedSectionComponent {
  readonly projects = PROJECTS.filter((p) => p.isSelected).slice(0, 2);
}
