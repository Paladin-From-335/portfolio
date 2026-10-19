import {PlayIcon} from '@sanity/icons/Play'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const project = defineType({
  name: 'project',
  icon: PlayIcon,
  title: 'Project',
  type: 'document',
  initialValue: {type: 'video', category: 'commercial', isSelected: false, tags: [], sortOrder: 0},
  orderings: [
    {
      title: 'Portfolio order',
      name: 'portfolioOrder',
      by: [{field: 'sortOrder', direction: 'asc'}],
    },
  ],
  fields: [
    defineField({
      name: 'contentTitle',
      title: 'Brand name',
      description: 'Stored in the existing title field to preserve previously saved project titles.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'projectName', title: 'Project name', type: 'string'}),
    defineField({name: 'date', title: 'Date', type: 'string'}),
    defineField({
      name: 'type',
      type: 'string',
      options: {
        list: [
          {title: 'YouTube video', value: 'video'},
          {title: 'Mux reel', value: 'reel'},
          {title: 'Photos (not displayed yet)', value: 'photo'},
        ],
      },
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            ['video', 'reel', 'photo'].includes(value ?? '')
              ? true
              : 'Choose a supported project type.',
          ),
    }),
    defineField({name: 'description', type: 'text', rows: 4}),
    defineField({name: 'tags', type: 'array', of: [defineArrayMember({type: 'string'})]}),
    defineField({
      name: 'isSelected',
      title: 'Selected for home',
      type: 'boolean',
      description:
        'Home displays the first two selected commercial YouTube videos, in portfolio order.',
    }),
    defineField({
      name: 'sortOrder',
      type: 'number',
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {list: ['commercial', 'noncommercial']},
      description: 'The noncommercial section is not displayed yet.',
      hidden: ({document}) => document?.type !== 'video',
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.type !== 'video' || value === 'commercial' || value === 'noncommercial'
            ? true
            : 'Choose a video category.',
        ),
    }),
    defineField({
      name: 'youtubeId',
      title: 'YouTube video ID',
      type: 'string',
      description: 'The 11-character ID from the YouTube URL, not the full URL.',
      hidden: ({document}) => document?.type !== 'video',
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.type !== 'video' || /^[\w-]{11}$/.test(value ?? '')
            ? true
            : 'Enter a valid 11-character YouTube ID.',
        ),
    }),
    defineField({
      name: 'muxVideo',
      title: 'Reel video',
      type: 'mux.video',
      description:
        'Reels only. Mux Free allows 10 stored assets across the account, including unused uploads. Reuse existing assets; remove unused assets in Mux before uploading at capacity. Keep public playback enabled and paid features off.',
      hidden: ({document}) => document?.type !== 'reel',
      validation: (rule) =>
        rule.custom(async (value, context) => {
          if (context.document?.type !== 'reel') return true
          const ref = (value as {asset?: {_ref?: string}} | undefined)?.asset?._ref
          if (!ref) return 'Upload or select a reel.'
          try {
            const asset = await context.getClient({apiVersion: '2026-09-30'}).fetch<{
              status?: string
              playbackId?: string
              data?: {playback_ids?: {id: string; policy: string}[]}
            } | null>('*[_id == $id][0]{status, playbackId, data{playback_ids}}', {id: ref})
            if (asset?.status !== 'ready' || !asset.playbackId)
              return 'Wait until Mux processing is ready.'
            return asset.data?.playback_ids?.some(
              (id) => id.id === asset.playbackId && id.policy === 'public',
            )
              ? true
              : 'Choose a public playback asset. Signed playback is not supported.'
          } catch {
            return 'Could not check the Mux asset. Check the connection and retry.'
          }
        }),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {hotspot: true},
      description:
        'Upload an explicit thumbnail for every YouTube video and reel. Mux thumbnails are not used.',
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
      validation: (rule) =>
        rule.custom((value, context) =>
          !['video', 'reel'].includes(String(context.document?.type)) || value?.asset?._ref
            ? true
            : 'Upload a thumbnail for this video or reel.',
        ),
    }),
    defineField({
      name: 'photos',
      title: 'Photos / video stills',
      type: 'array',
      hidden: ({document}) => document?.type === 'reel',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative text',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
          validation: (rule) => rule.required().assetRequired(),
        }),
      ],
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.type !== 'photo' || value?.length ? true : 'Add at least one photo.',
        ),
    }),
  ],
  preview: {select: {title: 'contentTitle', subtitle: 'type', media: 'thumbnail'}},
})
