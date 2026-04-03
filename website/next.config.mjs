/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: 'http://localhost:5174/admin/',
      },
      {
        source: '/admin/:path*',
        destination: 'http://localhost:5174/admin/:path*',
      },
    ];
  },
};

export default nextConfig;
