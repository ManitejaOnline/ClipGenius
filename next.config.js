/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add node-loader for native modules
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['fluent-ffmpeg'],
  },
};

module.exports = nextConfig; 