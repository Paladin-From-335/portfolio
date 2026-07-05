export interface ProjectCard {
  id: string;
  title: string;
  description?: string;
  frameImagesUrls?: string[];
  videoId?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  tags: string[];
  isSelected: boolean;
}
