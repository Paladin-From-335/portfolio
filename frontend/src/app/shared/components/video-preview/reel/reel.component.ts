import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, signal } from '@angular/core';

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
  playbackError = signal(false);
  private playerReady?: Promise<unknown>;

  constructor() {
    // Split the player out of the initial bundle; load it only when reels are mounted.
    void this.loadPlayer().catch(() => this.playbackError.set(true));
  }

  private loadPlayer(): Promise<unknown> {
    return (this.playerReady ??= import('@mux/mux-player').catch((error) => {
      this.playerReady = undefined;
      throw error;
    }));
  }

  async togglePlayback(element: HTMLElement): Promise<void> {
    this.playbackError.set(false);
    try {
      await this.loadPlayer();
      const player = element as MuxPlayerElement;
      if (player.paused) {
        await player.play();
      } else {
        player.pause();
      }
    } catch {
      this.playbackError.set(true);
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
