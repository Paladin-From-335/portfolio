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
  photoAlts = input<string[]>([]);

  @ViewChild('track')
  private track?: ElementRef<HTMLDivElement>;
  private resizeObserver?: ResizeObserver;

  currentIndex = signal(0);
  isPaused = signal(false);
  transitionEnabled = signal(false);
  visibleCount = signal(3);
  loopedPhotos = computed(() => {
    const photos = this.photos();
    if (photos.length < 2) return photos;
    return [...photos, ...photos, ...photos];
  });

  trackTransform = 'translateX(0)';
  private isMoving = false;
  private intervalId?: number;
  private pauseTimeoutId?: number;
  private movementTimeoutId?: number;
  private layoutFrameId?: number;
  private setupFrameId?: number;
  private destroyed = false;
  private isHovered = false;
  private interactionPaused = false;
  private activePointerId?: number;
  // CSS transform duration is 400ms. Recover even if its completion event is lost.
  private readonly movementFallbackMs = 600;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly handleResize = (): void => {
    window.cancelAnimationFrame(this.layoutFrameId ?? 0);
    this.layoutFrameId = requestAnimationFrame(() => {
      if (this.destroyed) return;
      this.updateVisibleCount();
      this.finishMovement(true);
    });
  };

  private pointerStartX = 0;
  private pointerStartY = 0;
  private isPointerDown = false;

  private readonly swipeThreshold = 50;
  private readonly interactionPauseMs = 5000;

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
    this.setupFrameId = requestAnimationFrame(() => {
      this.setupFrameId = requestAnimationFrame(() => {
        if (this.destroyed) return;
        const item = this.track?.nativeElement.querySelector<HTMLElement>('.photo-carousel__item');
        if (!item) return;
        this.resizeObserver = new ResizeObserver(this.handleResize);
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
    this.destroyed = true;
    window.clearTimeout(this.movementTimeoutId);
    window.cancelAnimationFrame(this.layoutFrameId ?? 0);
    window.cancelAnimationFrame(this.setupFrameId ?? 0);
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

    this.finishMovement(event.type === 'transitioncancel');
  }

  private finishMovement(reposition = false): void {
    window.clearTimeout(this.movementTimeoutId);
    this.isMoving = false;
    const count = this.photos().length;
    const index = this.currentIndex();
    const normalized = count > 1 ? ((index % count) + count) % count + count : 0;
    if (normalized !== index || reposition) {
      this.currentIndex.set(normalized);
      this.moveToCurrentItem(false);
    }
  }

  onPointerEnter(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    this.isHovered = true;
    this.updatePaused();
  }

  onPointerLeave(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    this.isHovered = false;
    this.updatePaused();
  }

  private updatePaused(): void {
    this.isPaused.set(this.isHovered || this.isPointerDown || this.interactionPaused);
  }

  pauseTemporarily(): void {
    this.interactionPaused = true;
    this.updatePaused();
    this.resumeAfterDelay();
  }

  isSideItem(index: number): boolean {
    const relativeIndex = index - this.currentIndex();
    return relativeIndex === -1 || relativeIndex === this.visibleCount();
  }

  private moveToCurrentItem(animated: boolean): void {
    const track = this.track?.nativeElement;
    const item = track?.querySelector<HTMLElement>('.photo-carousel__item');

    if (!track || !item) {
      this.isMoving = false;
      return;
    }
    // Commit an instantaneous loop/resize correction before enabling the next transition.
    if (animated && !this.transitionEnabled()) void track.offsetWidth;
    this.transitionEnabled.set(animated);
    const itemWidth = item.getBoundingClientRect().width;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    let offset = this.currentIndex() * (itemWidth + gap);

    if (getComputedStyle(track).getPropertyValue('--center-active').trim() === '1') {
      const containerWidth =
        track.parentElement?.getBoundingClientRect().width ?? window.innerWidth;
      const centerOffset = (containerWidth - itemWidth) / 2;
      offset -= centerOffset;
    }
    const nextTransform = `translateX(-${offset}px)`;
    const changed = nextTransform !== this.trackTransform;
    this.trackTransform = nextTransform;
    window.clearTimeout(this.movementTimeoutId);
    if (animated && changed && itemWidth > 0) {
      this.movementTimeoutId = window.setTimeout(() => this.finishMovement(true), this.movementFallbackMs);
    } else {
      this.isMoving = false;
    }
    this.cdr.detectChanges();
  }

  private updateVisibleCount(): void {
    const track = this.track?.nativeElement;
    if (!track) return;
    const count = Number.parseInt(getComputedStyle(track).getPropertyValue('--visible-count'), 10);
    this.visibleCount.set(Number.isFinite(count) ? count : 3);
  }

  onPointerDown(event: PointerEvent): void {
    if (this.activePointerId !== undefined || (event.pointerType === 'mouse' && event.button !== 0)) return;
    this.activePointerId = event.pointerId;
    this.isPointerDown = true;
    this.pointerStartX = event.clientX;
    this.pointerStartY = event.clientY;

    window.clearTimeout(this.pauseTimeoutId);
    this.updatePaused();
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.isPointerDown || event.pointerId !== this.activePointerId) return;
    this.activePointerId = undefined;
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

    this.pauseTemporarily();
  }

  onPointerCancel(event: PointerEvent): void {
    if (event.pointerId !== this.activePointerId) return;
    this.releasePointer();
  }

  onWindowBlur(): void {
    this.isHovered = false;
    this.releasePointer();
  }

  private releasePointer(): void {
    this.activePointerId = undefined;
    this.isPointerDown = false;
    this.pauseTemporarily();
  }

  onCarouselClick(): void {
    this.pauseTemporarily();
  }

  private resumeAfterDelay(): void {
    window.clearTimeout(this.pauseTimeoutId);
    this.pauseTimeoutId = window.setTimeout(() => {
      this.interactionPaused = false;
      this.updatePaused();
    }, this.interactionPauseMs);
  }
}
