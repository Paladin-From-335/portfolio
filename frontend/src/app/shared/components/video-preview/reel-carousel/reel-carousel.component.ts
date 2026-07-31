import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';
import { ReelComponent } from '../reel/reel.component';
import { ReelProjectCard } from '../../../../core/models/project-card.model';

@Component({
  selector: 'app-reel-carousel',
  imports: [ReelComponent],
  templateUrl: './reel-carousel.component.html',
  styleUrl: './reel-carousel.component.scss',
})
export class ReelCarouselComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) reels!: ReelProjectCard[];
  @ViewChild('viewport')
  private viewport!: ElementRef<HTMLElement>;
  @ViewChild('track')
  private track!: ElementRef<HTMLElement>;
  private readonly cdr = inject(ChangeDetectorRef);

  displayedReels: ReelProjectCard[] = [];
  currentIndex = 1;
  isAnimated = false;
  isMoving = false;
  trackTransform = 'translateX(0)';

  ngOnChanges(): void {
    this.createInfiniteList();
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.moveToCurrentItem(false);
    });
  }

  next(): void {
    if (this.isMoving || this.reels.length < 2) {
      return;
    }
    this.isMoving = true;
    this.currentIndex++;
    this.moveToCurrentItem(true);
  }

  previous(): void {
    if (this.isMoving || this.reels.length < 2) {
      return;
    }
    this.isMoving = true;
    this.currentIndex--;
    this.moveToCurrentItem(true);
  }

  onTransitionEnd(event: Event): void {
    const transitionEvent = event as TransitionEvent;
    if (
      transitionEvent.target !== this.track.nativeElement ||
      transitionEvent.propertyName !== 'transform'
    ) {
      return;
    }

    if (this.currentIndex === this.displayedReels.length - 1) {
      // First clone → first real reel
      this.currentIndex = 1;
      this.moveToCurrentItem(false);
    } else if (this.currentIndex === 0) {
      // Last clone → last real reel
      this.currentIndex = this.displayedReels.length - 2;
      this.moveToCurrentItem(false);
    }
    this.isMoving = false;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.moveToCurrentItem(false);
  }

  private createInfiniteList(): void {
    if (!this.reels?.length) {
      this.displayedReels = [];
      return;
    }
    if (this.reels.length === 1) {
      this.displayedReels = [...this.reels];
      this.currentIndex = 0;
      return;
    }
    this.displayedReels = [this.reels[this.reels.length - 1], ...this.reels, this.reels[0]];
    this.currentIndex = 1;
  }

  private moveToCurrentItem(animated: boolean): void {
    if (!this.viewport || !this.track) {
      return;
    }
    const item = this.track.nativeElement.querySelector<HTMLElement>('.reel-carousel__item');
    if (!item) {
      return;
    }
    this.isAnimated = animated;
    const itemWidth = item.getBoundingClientRect().width;
    const viewportWidth = this.viewport.nativeElement.getBoundingClientRect().width;
    const gap = Number.parseFloat(getComputedStyle(this.track.nativeElement).columnGap) || 0;

    // Centers the current reel exactly in the viewport.
    const offset = viewportWidth / 2 - itemWidth / 2 - this.currentIndex * (itemWidth + gap);
    this.trackTransform = `translateX(${offset}px)`;
    this.cdr.detectChanges();
  }
}
