import { computed, Injectable, signal } from '@angular/core';
import { createClient } from '@sanity/client';
import { createImageUrlBuilder, SanityImageSource } from '@sanity/image-url';
import { sanityConfig } from '../config/sanity.config';
import {
  PhotoProjectCard,
  ProjectCard,
  ReelProjectCard,
  VideoProjectCard,
} from '../models/project-card.model';
import { SiteSettings } from '../models/site-settings.model';

interface CmsImage {
  asset?: { _ref: string };
  alt?: string;
  crop?: { top: number; bottom: number; left: number; right: number };
  hotspot?: { x: number; y: number; width: number; height: number };
}

interface CmsProject {
  _id: string;
  contentTitle?: string;
  type?: string;
  category?: string;
  description?: string;
  tags?: string[];
  isSelected?: boolean;
  youtubeId?: string;
  thumbnail?: CmsImage;
  photos?: CmsImage[];
  muxAsset?: { playbackId?: string; status?: string };
}

interface CmsContent {
  projects: CmsProject[];
  settings: {
    heroVimeoId?: string;
    heroVimeoHash?: string;
    heroVideoTitle?: string;
    heroPoster?: CmsImage;
  } | null;
}

// One CDN request per app session; no polling or realtime subscription.
const CONTENT_QUERY = `{
  "projects": *[_type == "project"] | order(sortOrder asc, _id asc) {
    _id, contentTitle, type, category, description, tags, isSelected, youtubeId,
    thumbnail, photos, "muxAsset": muxVideo.asset->{playbackId, status}
  },
  "settings": *[_type == "siteSettings" && _id == "siteSettings"][0] {
    heroVimeoId, heroVimeoHash, heroVideoTitle, heroPoster
  }
}`;

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly projectState = signal<ProjectCard[]>([]);
  private readonly settingsState = signal<SiteSettings | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private loaded = false;
  private inFlight?: Promise<void>;

  readonly projects = this.projectState.asReadonly();
  readonly settings = this.settingsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly videos = computed(() =>
    this.projects().filter((p): p is VideoProjectCard => p.type === 'video'),
  );
  readonly commercialVideos = computed(() =>
    this.videos().filter((p) => p.category === 'commercial'),
  );
  readonly noncommercialVideos = computed(() =>
    this.videos().filter((p) => p.category === 'noncommercial'),
  );
  readonly selectedCommercialVideos = computed(() =>
    this.commercialVideos()
      .filter((p) => p.isSelected)
      .slice(0, 2),
  );
  readonly reels = computed(() =>
    this.projects().filter((p): p is ReelProjectCard => p.type === 'reel'),
  );
  readonly photos = computed(() =>
    this.projects().filter((p): p is PhotoProjectCard => p.type === 'photo'),
  );

  load(): Promise<void> {
    if (this.inFlight) return this.inFlight;
    if (this.loaded) return Promise.resolve();
    this.loadingState.set(true);
    this.errorState.set(null);
    this.inFlight = this.fetchContent().finally(() => {
      this.loadingState.set(false);
      this.inFlight = undefined;
    });
    return this.inFlight;
  }

  private async fetchContent(): Promise<void> {
    try {
      if (!sanityConfig.projectId) throw new Error('Sanity project ID is not configured.');
      const client = createClient({ ...sanityConfig, timeout: 15000, maxRetries: 1 });
      const builder = createImageUrlBuilder(client);
      const imageUrl = (image: CmsImage | undefined, width: number): string | undefined => {
        if (!image?.asset?._ref) return undefined;
        try {
          return builder
            .image(image as SanityImageSource)
            .width(width)
            .fit('max')
            .auto('format')
            .quality(80)
            .url();
        } catch {
          return undefined;
        }
      };
      const content = await client.fetch<CmsContent>(CONTENT_QUERY);
      const projects: ProjectCard[] = [];
      for (const project of content.projects ?? []) {
        if (!project._id || !project.contentTitle) continue;
        const base = {
          id: project._id,
          contentTitle: project.contentTitle,
          description: project.description,
          tags: project.tags ?? [],
          isSelected: project.isSelected === true,
        };
        const thumbnailUrl = imageUrl(project.thumbnail, 960);
        const images = (project.photos ?? []).flatMap((photo) => {
          const url = imageUrl(photo, 1200);
          return url ? [{ url, alt: photo.alt ?? '' }] : [];
        });
        const frameImagesUrls = images.map((image) => image.url);
        const frameImagesAlts = images.map((image) => image.alt);
        if (
          project.type === 'video' &&
          /^[\w-]{11}$/.test(project.youtubeId ?? '') &&
          (project.category === 'commercial' || project.category === 'noncommercial') &&
          thumbnailUrl
        ) {
          projects.push({
            ...base,
            type: 'video',
            category: project.category,
            videoId: project.youtubeId,
            videoUrl: `https://www.youtube.com/watch?v=${project.youtubeId}`,
            thumbnailUrl,
            frameImagesUrls,
            frameImagesAlts,
          });
        } else if (
          project.type === 'reel' &&
          project.muxAsset?.status === 'ready' &&
          /^[a-zA-Z0-9]+$/.test(project.muxAsset.playbackId ?? '') &&
          thumbnailUrl
        ) {
          // Always use an explicit Sanity thumbnail, never a generated Mux poster.
          projects.push({
            ...base,
            type: 'reel',
            playbackId: project.muxAsset.playbackId!,
            thumbnailUrl,
          });
        } else if (project.type === 'photo' && images.length) {
          projects.push({ ...base, type: 'photo', frameImagesUrls, frameImagesAlts });
        }
      }
      const settings = content.settings;
      const poster = imageUrl(settings?.heroPoster, 1920);
      this.settingsState.set(
        settings && /^\d+$/.test(settings.heroVimeoId ?? '') && poster
          ? {
              heroVimeoId: settings.heroVimeoId!,
              heroVimeoHash: /^[a-zA-Z0-9]+$/.test(settings.heroVimeoHash ?? '')
                ? settings.heroVimeoHash
                : undefined,
              heroVideoTitle: settings.heroVideoTitle || 'Showreel',
              heroPosterUrl: poster,
              heroPosterAlt: settings.heroPoster?.alt ?? '',
            }
          : null,
      );
      this.projectState.set(projects);
      this.loaded = true;
    } catch {
      this.errorState.set('Content is unavailable. Please try again.');
    }
  }
}
