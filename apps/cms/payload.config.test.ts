import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

console.log('[TEST] Minimal config loading...')

export default buildConfig({
  collections: [],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'test-secret',
})

console.log('[TEST] Config export complete')
