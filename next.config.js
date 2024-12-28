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
        'https://smart-health-tst.up.railway.app',
        'enyvqjbqavjdzxmktahy.supabase.co', // Sesuaikan dengan domain Supabase Anda
      ],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'enyvqjbqavjdzxmktahy.supabase.co',
          port: '',
          pathname: '/storage/v1/object/public/**',
        },
        {
          protocol: 'https',
          hostname: 'https://smart-health-tst.up.railway.app',
          port: '',
          pathname: '/**',
        }
      ],
    },
    // Tambahkan konfigurasi build
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false,
                net: false,
                tls: false,
            };
        }
        return config;
    },

    // Atur ulang timeout build
    staticPageGenerationTimeout: 120,
  }
  
  module.exports = nextConfig