// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   output: 'export',
// }

// module.exports = nextConfig


module.exports = {
  webpack: (config) => {
    // This allows Phaser to be used client-side only
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },
};