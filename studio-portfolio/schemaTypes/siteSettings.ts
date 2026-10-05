import {CogIcon} from '@sanity/icons/Cog'
import {defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  icon: CogIcon,
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'heroVimeoId',
      title: 'Hero Vimeo ID',
      type: 'string',
      description: 'Numeric Vimeo video ID. The hero stays on Vimeo and never consumes a Mux slot.',
      validation: (rule) => rule.required().regex(/^\d+$/, {name: 'numeric Vimeo ID'}),
    }),
    defineField({
      name: 'heroVimeoHash',
      title: 'Vimeo privacy hash (optional)',
      type: 'string',
      description: 'For an unlisted video, copy the h parameter from its embed URL.',
      validation: (rule) => rule.regex(/^[a-zA-Z0-9]+$/, {name: 'Vimeo privacy hash'}),
    }),
    defineField({
      name: 'heroVideoTitle',
      title: 'Hero video title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroPoster',
      title: 'Hero poster',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
      validation: (rule) => rule.required().assetRequired(),
    }),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})
