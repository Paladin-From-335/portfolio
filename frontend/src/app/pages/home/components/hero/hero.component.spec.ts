import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HeroComponent } from './hero.component';
import { ProjectService } from '../../../../core/services/project.service';
import { SiteSettings } from '../../../../core/models/site-settings.model';
import { describe, expect, it, vi } from 'vitest';

describe('CMS Vimeo hero', () => {
  it('renders a CMS poster and Vimeo embed after settings arrive', async () => {
    const settings = signal<SiteSettings | null>(null);
    await TestBed.configureTestingModule({
      imports: [HeroComponent],
      providers: [
        {
          provide: ProjectService,
          useValue: { settings, load: vi.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(HeroComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('iframe')).toBeNull();
    settings.set({
      heroVimeoId: '123456789',
      heroVimeoHash: 'abc123',
      heroVideoTitle: 'Director reel',
      heroPosterUrl: 'https://cdn.sanity.io/poster.jpg',
      heroPosterAlt: 'Film still',
    });
    fixture.detectChanges();
    const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    const url = new URL(iframe.src);
    expect(url.origin).toBe('https://player.vimeo.com');
    expect(url.pathname).toBe('/video/123456789');
    expect(url.searchParams.get('h')).toBe('abc123');
    expect(url.searchParams.get('muted')).toBe('1');
    expect(iframe.title).toBe('Director reel');
    expect(fixture.nativeElement.querySelector('img').alt).toBe('Film still');
    expect(fixture.nativeElement.querySelector('mux-player')).toBeNull();
  });
});
