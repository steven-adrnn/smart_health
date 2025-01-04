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
      NEXT_PUBLIC_HUGGING_FACE_API_KEY: process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY,
      NEXT_PUBLIC_HUGGING_FACE_MODEL_NAME: process.env.NEXT_PUBLIC_HUGGING_FACE_MODEL_NAME,

    },

    images: {
      // domains: [
      //   'https://smart-health-tst.up.railway.app',
      //   'enyvqjbqavjdzxmktahy.supabase.co', // Sesuaikan dengan domain Supabase Anda
      // ],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'enyvqjbqavjdzxmktahy.supabase.co',
          port: '',
          pathname: '/storage/v1/object/public/**',
        },
        {
          protocol: 'https',
          hostname: 'smart-health-tst.up.railway.app',
          port: '',
          pathname: '/**',
        },
        
      ],
      // Tambahkan konfigurasi ini untuk menghindari warning
    },
  }
  
  module.exports = nextConfig