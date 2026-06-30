/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@khp/db', '@khp/search', '@khp/ui'],
  experimental: {
    serverComponentsExternalPackages: ['pg']
  }
};

export default nextConfig;
