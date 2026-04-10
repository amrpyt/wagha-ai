import type { NextConfig } from 'next'

const config: NextConfig = {
  serverExternalPackages: ['pdfjs-dist', 'sharp'],
  serverActions: {
    bodySizeLimit: '10mb',
  },
}

export default config
