import {TestBed, ComponentFixture} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {PhotoCarouselComponent} from './photo-carousel.component';

 describe('Photo carousel recovery and pause', () => {
  let fixture: ComponentFixture<PhotoCarouselComponent>;
  let component: PhotoCarouselComponent;
  let resize: () => void;
  const pointer = (type = 'touch', id = 1) => ({pointerId: id, pointerType: type, button: 0, clientX: 100, clientY: 100}) as PointerEvent;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: () => void) { resize = callback; }
      observe() {}
      disconnect() {}
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({width: 300, height: 169, x: 0, y: 0, top: 0, left: 0, right: 300, bottom: 169, toJSON() {}});
    await TestBed.configureTestingModule({imports: [PhotoCarouselComponent]}).compileComponents();
    fixture = TestBed.createComponent(PhotoCarouselComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('photos', ['one.jpg', 'two.jpg', 'three.jpg']);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(50);
  });

  afterEach(() => {
    fixture.destroy();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('unlocks navigation when resize interrupts a movement', async () => {
    component.next();
    resize();
    await vi.advanceTimersByTimeAsync(30);
    const index = component.currentIndex();
    component.next();
    expect(component.currentIndex()).toBe(index + 1);
  });

  it('recovers from a missing transition event and normalizes the loop', async () => {
    for (let i = 0; i < 4; i++) {
      component.next();
      await vi.advanceTimersByTimeAsync(650);
    }
    expect(component.currentIndex()).toBe(4);
    component.previous();
    expect(component.currentIndex()).toBe(3);
  });

  it('unlocks on transition cancellation', () => {
    component.next();
    const track = fixture.nativeElement.querySelector('.photo-carousel__track');
    const event = new Event('transitioncancel');
    Object.defineProperty(event, 'propertyName', {value: 'transform'});
    track.dispatchEvent(event);
    component.previous();
    expect(component.currentIndex()).toBe(3);
  });

  it('keeps a mobile hold paused and resumes five seconds after release outside the carousel', async () => {
    component.onPointerEnter(pointer());
    expect(component.isPaused()).toBe(false);
    component.pauseTemporarily();
    component.onPointerDown(pointer());
    const index = component.currentIndex();
    await vi.advanceTimersByTimeAsync(10000);
    expect(component.isPaused()).toBe(true);
    expect(component.currentIndex()).toBe(index);
    const release = new Event('pointerup');
    Object.assign(release, pointer());
    window.dispatchEvent(release);
    await vi.advanceTimersByTimeAsync(4999);
    expect(component.isPaused()).toBe(true);
    await vi.advanceTimersByTimeAsync(1);
    expect(component.isPaused()).toBe(false);
    await vi.advanceTimersByTimeAsync(3000);
    expect(component.currentIndex()).not.toBe(index);
  });

  it('does not resume during mouse hover and recovers cancelled touches', async () => {
    component.onPointerEnter(pointer('mouse'));
    component.pauseTemporarily();
    await vi.advanceTimersByTimeAsync(5000);
    expect(component.isPaused()).toBe(true);
    component.onPointerLeave(pointer('mouse'));
    expect(component.isPaused()).toBe(false);
    component.onPointerDown(pointer());
    component.onPointerCancel(pointer());
    await vi.advanceTimersByTimeAsync(5000);
    expect(component.isPaused()).toBe(false);
  });
});
