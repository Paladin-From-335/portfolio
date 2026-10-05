import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectService } from './project.service';
import { sanityConfig } from '../config/sanity.config';

const { fetchContent, createClientMock } = vi.hoisted(() => ({
  fetchContent: vi.fn(),
  createClientMock: vi.fn(),
}));
vi.mock('@sanity/client', () => ({ createClient: createClientMock }));
const originalProjectId = sanityConfig.projectId;
afterEach(() => {
  sanityConfig.projectId = originalProjectId;
});

const image = {
  asset: { _ref: 'image-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-1200x800-jpg' },
  alt: 'On set',
};
const video = (id: string, extra = {}) => ({
  _id: id,
  type: 'video',
  contentTitle: id,
  category: 'commercial',
  youtubeId: 'g17hO5fSrvg',
  isSelected: true,
  thumbnail: image,
  ...extra,
});
const settings = {
  heroVimeoId: '123456789',
  heroVimeoHash: 'abc123',
  heroVideoTitle: 'Showreel',
  heroPoster: image,
};

beforeEach(() => {
  vi.clearAllMocks();
  sanityConfig.projectId = 'portfolio';
  createClientMock.mockReturnValue({
    fetch: fetchContent,
    config: () => ({ projectId: 'portfolio', dataset: 'production' }),
  });
});

describe('ProjectService CMS loading', () => {
  it('deduplicates concurrent loads and keeps published content cached across routes', async () => {
    let resolve!: (content: unknown) => void;
    fetchContent.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const service = new ProjectService();
    const first = service.load();
    expect(service.loading()).toBe(true);
    expect(service.load()).toBe(first);
    expect(service.commercialVideos()).toEqual([]);
    resolve({
      projects: [video('1'), video('2'), video('3'), video('4', { category: 'noncommercial' })],
      settings,
    });
    await first;
    await service.load();
    expect(fetchContent).toHaveBeenCalledTimes(1);
    expect(createClientMock).toHaveBeenCalledWith(
      expect.objectContaining({ useCdn: true, perspective: 'published' }),
    );
    expect(fetchContent.mock.calls[0][0]).toContain('order(sortOrder asc, _id asc)');
    expect(service.loading()).toBe(false);
    expect(service.selectedCommercialVideos().map((p) => p.id)).toEqual(['1', '2']);
    expect(service.noncommercialVideos().length).toBe(1);
    expect(service.videos()[0].videoUrl).toBe('https://www.youtube.com/watch?v=g17hO5fSrvg');
    expect(service.settings()?.heroVimeoId).toBe('123456789');
  });

  it('does not turn a failure into a cached empty result and permits retry', async () => {
    fetchContent.mockRejectedValueOnce(new Error('offline'));
    const service = new ProjectService();
    await service.load();
    expect(service.error()).toBeTruthy();
    expect(service.loading()).toBe(false);
    expect(service.projects()).toEqual([]);
    fetchContent.mockResolvedValueOnce({ projects: [video('1')], settings: null });
    await service.load();
    expect(fetchContent).toHaveBeenCalledTimes(2);
    expect(service.error()).toBeNull();
    expect(service.projects().length).toBe(1);
  });

  it('rejects missing thumbnails, unfinished Mux assets and local paths as playback IDs', async () => {
    const reel = {
      _id: 'ready',
      type: 'reel',
      contentTitle: 'Reel',
      thumbnail: image,
      muxAsset: { status: 'ready', playbackId: 'MuxPlayback123' },
    };
    fetchContent.mockResolvedValue({
      projects: [
        reel,
        { ...reel, _id: 'no-poster', thumbnail: undefined },
        { ...reel, _id: 'processing', muxAsset: { status: 'preparing', playbackId: 'abc' } },
        {
          ...reel,
          _id: 'local',
          muxAsset: { status: 'ready', playbackId: '/assets/videos/reel.mp4' },
        },
        video('invalid', { youtubeId: 'https://example.com' }),
        video('no-thumbnail', { thumbnail: undefined }),
      ],
      settings: null,
    });
    const service = new ProjectService();
    await service.load();
    expect(service.projects().map((p) => p.id)).toEqual(['ready']);
    expect(service.reels()[0].thumbnailUrl).toContain('https://cdn.sanity.io/images/');
    expect(service.reels()[0].thumbnailUrl).not.toContain('image.mux.com');
  });

  it('preserves photo order and alt text, skipping missing image assets', async () => {
    fetchContent.mockResolvedValue({
      projects: [video('1', { photos: [image, {}, { ...image, alt: 'Second frame' }] })],
      settings,
    });
    const service = new ProjectService();
    await service.load();
    expect(service.videos()[0].frameImagesAlts).toEqual(['On set', 'Second frame']);
    expect(service.videos()[0].frameImagesUrls).toHaveLength(2);
    expect(service.videos()[0].frameImagesUrls![0]).toContain('w=1200');
    expect(service.settings()?.heroPosterUrl).toContain('w=1920');
  });

  it('accepts an empty portfolio and never embeds an arbitrary hero URL', async () => {
    fetchContent.mockResolvedValue({
      projects: [],
      settings: { ...settings, heroVimeoId: 'https://evil.example' },
    });
    const service = new ProjectService();
    await service.load();
    expect(service.error()).toBeNull();
    expect(service.projects()).toEqual([]);
    expect(service.settings()).toBeNull();
  });
});
