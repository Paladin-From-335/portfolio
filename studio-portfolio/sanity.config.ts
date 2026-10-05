import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {muxInput} from 'sanity-plugin-mux-input'
import {schemaTypes} from './schemaTypes'
import {visionTool} from '@sanity/vision'

export default defineConfig({
  name: 'default',
  title: 'Portfolio',
  projectId: 't1niydk5',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.documentTypeListItem('project').title('Projects'),
            S.listItem()
              .title('Site settings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
          ]),
    }),
    visionTool({defaultApiVersion: '2026-09-30'}),
    muxInput({
      video_quality: 'basic',
      max_resolution_tier: '1080p',
      static_renditions: [],
      defaultPublic: true,
      defaultSigned: false,
      defaultDrm: false,
      disableUploadConfig: true,
      disableTextTrackConfig: true,
      acceptedMimeTypes: ['video/*'],
      tool: {title: 'Reels (10 asset limit)'},
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter((template) => template.schemaType !== 'siteSettings'),
  },
  document: {
    actions: (actions, context) =>
      context.schemaType === 'siteSettings'
        ? actions.filter((action) => action.action !== 'duplicate' && action.action !== 'delete')
        : actions,
  },
})
