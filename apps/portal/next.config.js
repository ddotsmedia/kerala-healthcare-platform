/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@khp/db', '@khp/search', '@khp/ui', '@khp/appointments', '@khp/notifications'],
  experimental: {
    serverComponentsExternalPackages: ['pg']
  }
};

export default nextConfig;
