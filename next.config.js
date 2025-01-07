const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
      config.resolve.fallback = { 
        fs: false,
        net: false,
        tls: false 
      };
      return config;
    },
    output: 'standalone',
    reactStrictMode: true,
    swcMinify: true,
    
    // Configurasi environment
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_HUGGING_FACE_API_KEY: process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY,
      NEXT_PUBLIC_HUGGING_FACE_MODEL_NAME: process.env.NEXT_PUBLIC_HUGGING_FACE_MODEL_NAME,
      MUSICMATE_API_KEY: process.env.MUSICMATE_API_KEY,
      RECIPE_API_KEY: process.env.RECIPE_API_KEY,

    },

    images: {
      domains: [
        'enyvqjbqavjdzxmktahy.supabase.co',
        'smart-health-tst.up.railway.app'
      ],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'enyvqjbqavjdzxmktahy.supabase.co',
          port: '',
          pathname: '/storage/v1/object/public/**',
        },
        
      ],
      // Tambahkan konfigurasi ini untuk menghindari warning
    },

    async headers() {
      return [
        {
          source: '/api/recipes',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: 'https://fit-kitchen-frontend-tst.vercel.app' },
            { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
            { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-API-Key' },
          ],
          source: '/api/(.*)',
          headers: [
              { 
                  key: 'Connection', 
                  value: 'upgrade' 
              },
              { 
                  key: 'Upgrade', 
                  value: 'websocket' 
              }
          ]
        },
      ]
    }
  }
  
  module.exports = nextConfig