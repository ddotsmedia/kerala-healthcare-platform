/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@khp/db', '@khp/search', '@khp/ui', '@khp/appointments'],
  experimental: {
    serverComponentsExternalPackages: ['pg']
  }
};

export default nextConfig;
