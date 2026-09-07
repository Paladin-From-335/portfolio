import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-photo-carousel',
  imports: [],
  templateUrl: './photo-carousel.component.html',
  styleUrl: './photo-carousel.component.scss',
})
export class PhotoCarouselComponent implements AfterViewInit, OnDestroy {
  photos = input.required<string[]>();

  @ViewChild('track')
  private track?: ElementRef<HTMLDivElement>;
  private resizeObserver?: ResizeObserver;

  currentIndex = signal(0);
  isPaused = signal(false);
  transitionEnabled = signal(false);
  visibleCount = signal(3);
  slideSlots = signal(3.5);
  loopedPhotos = computed(() => {
    const photos = this.photos();
    if (photos.length < 2) return photos;
    return [...photos, ...photos, ...photos];
  });

  trackTransform = 'translateX(0)';
  private isMoving = false;
  private intervalId?: number;
  private pauseTimeoutId?: number;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly handleResize = (): void => {
    this.updateVisibleCount();
    requestAnimationFrame(() => {
      this.moveToCurrentItem(false);
    });
  };

  private pointerStartX = 0;
  private pointerStartY = 0;
  private isPointerDown = false;

  private readonly swipeThreshold = 50;
  private readonly interactionPauseMs = 5000;
  private pointerDownAt = 0;
  private readonly longPressThresholdMs = 500;

  private lastSwipeAt = 0;
  private readonly swipeCooldownMs = 800;

  ngAfterViewInit(): void {
    this.updateVisibleCount();
    this.cdr.detectChanges();
    window.addEventListener('resize', this.handleResize);
    const photosLength = this.photos().length;
    if (photosLength === 0) return;

    // Start from the beginning of the middle copy.
    this.currentIndex.set(photosLength);
    this.cdr.detectChanges();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const item = this.track?.nativeElement.querySelector<HTMLElement>('.photo-carousel__item');
        if (!item) return;
        this.resizeObserver = new ResizeObserver(() => this.moveToCurrentItem(false));
        this.resizeObserver.observe(item);
      });
    });

    this.intervalId = window.setInterval(() => {
      if (!this.isPaused() && !this.isMoving) {
        this.next();
      }
    }, 3000);
  }

  ngOnDestroy(): void {
    window.clearInterval(this.intervalId);
    window.clearTimeout(this.pauseTimeoutId);
    window.removeEventListener('resize', this.handleResize);
    this.resizeObserver?.disconnect();
  }

  next(): void {
    if (this.isMoving || this.photos().length < 2) {
      return;
    }

    this.isMoving = true;
    this.currentIndex.update((index) => index + 1);
    this.moveToCurrentItem(true);
  }

  previous(): void {
    if (this.isMoving || this.photos().length < 2) {
      return;
    }

    this.isMoving = true;
    this.currentIndex.update((index) => index - 1);
    this.moveToCurrentItem(true);
  }

  nextManually(): void {
    this.pauseTemporarily();
    this.next();
  }

  previousManually(): void {
    this.pauseTemporarily();
    this.previous();
  }

  onTransitionEnd(event: Event): void {
    const transitionEvent = event as TransitionEvent;
    const track = this.track?.nativeElement;

    if (
      !track ||
      transitionEvent.target !== track ||
      transitionEvent.propertyName !== 'transform'
    ) {
      return;
    }

    const photosLength = this.photos().length;
    if (this.currentIndex() >= photosLength * 2) {
      // First photo of third copy → first photo of middle copy.
      this.currentIndex.set(photosLength);
      this.moveToCurrentItem(false);
    } else if (this.currentIndex() < photosLength) {
      // Last photo of first copy → last photo of middle copy.
      this.currentIndex.set(photosLength * 2 - 1);
      this.moveToCurrentItem(false);
    }
    this.isMoving = false;
  }

  pause(): void {
    this.isPaused.set(true);
  }

  resume(): void {
    this.isPaused.set(false);
  }

  pauseTemporarily(): void {
    this.pause();
    this.resumeAfterDelay();
  }

  isSideItem(index: number): boolean {
    const relativeIndex = index - this.currentIndex();
    return relativeIndex === -1 || relativeIndex === this.visibleCount();
  }

  private moveToCurrentItem(animated: boolean): void {
    const track = this.track?.nativeElement;
    const item = track?.querySelector<HTMLElement>('.photo-carousel__item');

    if (!track || !item) return;
    this.transitionEnabled.set(animated);
    const itemWidth = item.getBoundingClientRect().width;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    let offset = this.currentIndex() * (itemWidth + gap);

    if (window.innerWidth < 768) {
      const containerWidth =
        track.parentElement?.getBoundingClientRect().width ?? window.innerWidth;
      const centerOffset = (containerWidth - itemWidth) / 2;
      offset -= centerOffset;
    }
    this.trackTransform = `translateX(-${offset}px)`;
    this.cdr.detectChanges();
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

  onPointerDown(event: PointerEvent): void {
    this.isPointerDown = true;
    this.pointerStartX = event.clientX;
    this.pointerStartY = event.clientY;
    this.pointerDownAt = Date.now();

    window.clearTimeout(this.pauseTimeoutId);
    this.pause();
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;
    const deltaX = event.clientX - this.pointerStartX;
    const deltaY = event.clientY - this.pointerStartY;
    const isHorizontalSwipe =
      Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) >= this.swipeThreshold;
    if (isHorizontalSwipe) {
      const now = Date.now();
      if (now - this.lastSwipeAt >= this.swipeCooldownMs) {
        this.lastSwipeAt = now;
        if (deltaX < 0) {
          this.next();
        } else {
          this.previous();
        }
      }
    }

    this.resumeAfterDelay();
  }

  onPointerCancel(): void {
    this.isPointerDown = false;
    this.resumeAfterDelay();
  }

  onCarouselClick(): void {
    const pressDuration = Date.now() - this.pointerDownAt;
    if (pressDuration > this.longPressThresholdMs) {
      return;
    }
    this.pauseTemporarily();
  }

  private resumeAfterDelay(): void {
    window.clearTimeout(this.pauseTimeoutId);

    this.pauseTimeoutId = window.setTimeout(() => {
      this.resume();
    }, this.interactionPauseMs);
  }
}
