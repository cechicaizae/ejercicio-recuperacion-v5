/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  // Desactivar Turbopack
  webpack: (config) => {
    return config;
  }
};

module.exports = nextConfig; 