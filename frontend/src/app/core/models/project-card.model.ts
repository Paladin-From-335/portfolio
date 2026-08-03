export const PROJECT_TYPES = {
  VIDEO: 'video',
  REEL: 'reel',
  PHOTO: 'photo',
} as const;

export type ProjectType =
  (typeof PROJECT_TYPES)[keyof typeof PROJECT_TYPES];

export const VIDEO_CATEGORIES = {
  COMMERCIAL: 'commercial',
  NONCOMMERCIAL: 'noncommercial',
} as const;

export type VideoCategory =
  (typeof VIDEO_CATEGORIES)[keyof typeof VIDEO_CATEGORIES];

export interface BaseProjectCard {
  id: string;
  contentTitle: string;
  tags: string[];
  isSelected: boolean;
  type: ProjectType;
  description?: string;
}

export interface VideoProjectCard extends BaseProjectCard {
  type: typeof PROJECT_TYPES.VIDEO;
  category: VideoCategory;
  description?: string;
  frameImagesUrls?: string[];
  videoId?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface ReelProjectCard extends BaseProjectCard {
  type: typeof PROJECT_TYPES.REEL;
  playbackId: string;
  thumbnailUrl: string;
}

export interface PhotoProjectCard extends BaseProjectCard {
  type: typeof PROJECT_TYPES.PHOTO;
  frameImagesUrls: string[];
}


export type ProjectCard =
  | VideoProjectCard
  | ReelProjectCard
  | PhotoProjectCard;
