import { Component, computed, ElementRef, input, signal, ViewChild } from '@angular/core';

@Component({
  selector: 'app-photo-carousel',
  imports: [],
  templateUrl: './photo-carousel.component.html',
  styleUrl: './photo-carousel.component.scss',
})
export class PhotoCarouselComponent {
  photos = input.required<string[]>();

  @ViewChild('track') track?: ElementRef<HTMLDivElement>;

  currentIndex = signal(0);
  isPaused = signal(false);
  transitionEnabled = signal(true);
  visibleCount = signal(3);
  slideSlots = signal(3.5);
  loopedPhotos = computed(() => {
    const photos = this.photos();
    return [...photos, ...photos, ...photos];
  });

  private intervalId?: number;
  private pauseTimeoutId?: number;
  private readonly handleResize = (): void => this.updateVisibleCount();

  ngAfterViewInit(): void {
    this.updateVisibleCount();
    window.addEventListener('resize', this.handleResize);
    this.currentIndex.set(this.photos().length);

    this.intervalId = window.setInterval(() => {
      if (!this.isPaused()) {
        this.next();
      }
    }, 3000);
  }

  ngOnDestroy(): void {
    window.clearInterval(this.intervalId);
    window.clearTimeout(this.pauseTimeoutId);
    window.removeEventListener('resize', this.handleResize);
  }

  private updateVisibleCount(): void {
    const width = window.innerWidth;
    if (width < 768) {
      this.visibleCount.set(1);
      this.slideSlots.set(1.5);
    } else if (width < 1024) {
      this.visibleCount.set(2);
      this.slideSlots.set(2.5);
    } else {
      this.visibleCount.set(3);
      this.slideSlots.set(3.5);
    }
  }

  trackTransform(): string {
    return `translateX(-${this.currentIndex() * (100 / this.visibleCount())}%)`;
  }

  pause(): void {
    this.isPaused.set(true);
  }

  resume(): void {
    this.isPaused.set(false);
  }

  pauseTemporarily(): void {
    this.pause();

    window.clearTimeout(this.pauseTimeoutId);

    this.pauseTimeoutId = window.setTimeout(() => {
      this.resume();
    }, 20000);
  }

  next(): void {
    this.transitionEnabled.set(true);
    this.currentIndex.update((index) => index + 1);
  }

  onTransitionEnd(): void {
    const photosLength = this.photos().length;

    if (this.currentIndex() >= photosLength * 2) {
      this.jumpWithoutAnimation(photosLength);
    }

    if (this.currentIndex() < photosLength) {
      this.jumpWithoutAnimation(photosLength * 2 - 1);
    }
  }

  private jumpWithoutAnimation(index: number): void {
    this.transitionEnabled.set(false);
    this.currentIndex.set(index);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.transitionEnabled.set(true);
      });
    });
  }

  previousManually(): void {
    this.pauseTemporarily();
    this.transitionEnabled.set(true);
    this.currentIndex.update((index) => index - 1);
  }

  nextManually(): void {
    this.pauseTemporarily();
    this.next();
  }

  isSideItem(index: number): boolean {
    const relativeIndex = index - this.currentIndex();
    return relativeIndex === -1 || relativeIndex === this.visibleCount();
  }
}
