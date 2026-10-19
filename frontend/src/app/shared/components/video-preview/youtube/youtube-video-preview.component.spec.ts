import {TestBed} from '@angular/core/testing';
import {YoutubeVideoPreviewComponent} from './youtube-video-preview.component';

describe('Project heading', () => {
  it('shows optional project name and date in both variants without dangling separators', async () => {
    await TestBed.configureTestingModule({imports: [YoutubeVideoPreviewComponent]}).compileComponents();
    const fixture = TestBed.createComponent(YoutubeVideoPreviewComponent);
    fixture.componentRef.setInput('brandName', 'Brand');
    fixture.componentRef.setInput('videoUrl', 'https://www.youtube.com/watch?v=g17hO5fSrvg');
    fixture.componentRef.setInput('thumbnailUrl', 'https://example.com/poster.jpg');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h3').textContent).toBe('Brand');
    expect(fixture.nativeElement.querySelector('.video-date')).toBeNull();
    fixture.componentRef.setInput('projectName', 'Campaign');
    fixture.componentRef.setInput('date', 'Autumn 2026');
    for (const variant of ['default', 'selected']) {
      fixture.componentRef.setInput('previewVariant', variant);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('h3').textContent).toBe('Brand - Campaign');
      expect(fixture.nativeElement.querySelector('.video-date').textContent).toBe('Autumn 2026');
      expect(fixture.nativeElement.querySelector('img').alt).toBe('Brand - Campaign');
    }
  });
});
