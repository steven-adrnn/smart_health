/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    swcMinify: true,
    
    // Disable static generation for problematic pages
    experimental: {
      staticPageGenerationTimeout: 60,
    },
    
    // Configurasi environment
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  }
  
  module.exports = nextConfig