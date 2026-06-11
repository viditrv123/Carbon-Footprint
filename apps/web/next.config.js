/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lets Next.js compile @carbon/types from source — no pre-build step needed on Vercel
  transpilePackages: ['@carbon/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },
};

module.exports = nextConfig;
