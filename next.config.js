/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost'],
    },
    env: {
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        SSLCOMMERZ_STORE_ID: process.env.SSLCOMMERZ_STORE_ID,
        SSLCOMMERZ_STORE_PASSWORD: process.env.SSLCOMMERZ_STORE_PASSWORD,
        SSLCOMMERZ_IS_LIVE: process.env.SSLCOMMERZ_IS_LIVE,
    },
}

module.exports = nextConfig
