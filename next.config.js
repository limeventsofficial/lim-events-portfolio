/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['10.76.10.181', '172.20.10.2'], // replace with your actual IP
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig