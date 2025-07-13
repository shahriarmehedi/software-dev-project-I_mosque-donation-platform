/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
            },
        ],
    },
    experimental: {
        serverComponentsExternalPackages: ['@prisma/client'],
    },
}

module.exports = nextConfig
