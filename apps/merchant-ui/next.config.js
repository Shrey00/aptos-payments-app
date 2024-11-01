/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.shopify.com',
                port: '',
                pathname: '/s/files/**',
            },
            {
                protocol: 'https',
                hostname: 'arweave.net',
                port: '',
                pathname: '/**',
            },
        ],
    },
    env: {
        BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    },
};

module.exports = nextConfig;
