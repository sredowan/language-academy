/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  // In production, /admin and /student are served by the monolith directly.
  // In dev, the gateway proxy handles routing, but these rewrites still work
  // as a convenience if running Next.js standalone.
  async rewrites() {
    // Only apply dev proxy rewrites when not in production
    if (process.env.NODE_ENV === 'production') return [];
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
