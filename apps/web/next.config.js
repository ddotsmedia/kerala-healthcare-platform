/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@khp/db', '@khp/search', '@khp/ui', '@khp/appointments', '@khp/notifications', '@khp/auth', '@khp/ai-assistant', '@khp/cache', '@khp/ratelimit'],
  experimental: {
    serverComponentsExternalPackages: ['pg']
  }
};

export default nextConfig;
