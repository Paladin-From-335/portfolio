import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, signal } from '@angular/core';

import '@mux/mux-player';

type MuxPlayerElement = HTMLElement & {
  paused: boolean;
  play(): Promise<void>;
  pause(): void;
};

@Component({
  selector: 'app-reel',
  imports: [],
  templateUrl: './reel.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './reel.component.scss',
})
export class ReelComponent {
  @Input({ required: true }) playbackId!: string;
  @Input() thumbnailUrl?: string;
  @Input() reelTitle = 'Reel';

  hasStarted = signal(false);
  isPlaying = signal(false);

  togglePlayback(element: HTMLElement): void {
    const player = element as MuxPlayerElement;
    if (player.paused) {
      void player.play();
    } else {
      player.pause();
    }
  }

  onPlay(): void {
    this.hasStarted.set(true);
    this.isPlaying.set(true);
  }

  onPause(): void {
    this.isPlaying.set(false);
  }
}
