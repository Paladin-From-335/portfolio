import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { ProjectsComponent } from './projects.component';
import { ProjectService } from '../../core/services/project.service';
import { VideoProjectCard } from '../../core/models/project-card.model';

describe('Projects CMS states', () => {
  it('waits for content, renders existing sections only, and exposes retry', async () => {
    const loading = signal(true);
    const error = signal<string | null>(null);
    const commercialVideos = signal<VideoProjectCard[]>([]);
    const load = vi.fn().mockResolvedValue(undefined);
    await TestBed.configureTestingModule({ imports: [ProjectsComponent], providers: [{
      provide: ProjectService, useValue: { loading, error, commercialVideos, reels: signal([]), load },
    }] }).compileComponents();
    const fixture = TestBed.createComponent(ProjectsComponent);
    fixture.detectChanges();
    expect(load).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.textContent).toContain('Loading projects');
    expect(fixture.nativeElement.querySelector('app-photo-carousel')).toBeNull();
    commercialVideos.set([{ id: 'cms-project', type: 'video', category: 'commercial', brandName: 'From CMS',
      tags: [], isSelected: true, description: 'CMS description', frameImagesUrls: [],
      videoUrl: 'https://www.youtube.com/watch?v=g17hO5fSrvg', thumbnailUrl: 'https://cdn.sanity.io/poster.jpg' }]);
    loading.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('CMS description');
    expect(fixture.nativeElement.querySelectorAll('app-expandable-section')).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('app-photo-carousel')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-reel-carousel')).toBeNull();
    error.set('Content is unavailable. Please try again.');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(load).toHaveBeenCalledTimes(2);
  });
});
