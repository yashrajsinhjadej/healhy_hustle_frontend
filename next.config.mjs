/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable ESLint during builds for better code quality
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Enable TypeScript checking during builds
  typescript: {
    ignoreBuildErrors: false,
  },
  // Optimize images for Vercel
  images: {
    unoptimized: false,
    domains: ['health-hustle-j3bf2u5on-yashrajsinhjadejs-projects.vercel.app'],
  },
  // Enable experimental features for better performance
  experimental: {
    // optimizeCss: true, // Disabled due to critters module issues
  },
  // Output configuration for Vercel
  output: 'standalone',
  // Enable compression
  compress: true,
  // Optimize bundle
  swcMinify: true,
}

export default nextConfig
