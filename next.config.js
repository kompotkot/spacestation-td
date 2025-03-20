/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
    output: "export", // Enables static export mode for Next.js

    webpack: (config) => {
        // This allows Phaser to be used client-side only
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
        };

        return config;
    },
};
