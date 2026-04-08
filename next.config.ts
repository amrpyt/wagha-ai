import type { NextConfig } from 'next'

const config: NextConfig = {
  serverExternalPackages: ['@supabase/supabase-js', '@supabase/ssr', 'pdfmake-rtl', 'pdfjs-dist']
}

export default config
