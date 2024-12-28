const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.resolve.alias['@'] = path.resolve(__dirname);
        return config;
    },
    output: 'standalone',
    reactStrictMode: true,
    swcMinify: true,
    
    // Configurasi environment
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },

    images: {
      domains: [
        'https://enyvqjbqavjdzxmktahy.supabase.co', // Sesuaikan dengan domain Supabase Anda
        'storage.googleapis.com',
        'example.com'
      ]
    },
  }
  
  module.exports = nextConfig