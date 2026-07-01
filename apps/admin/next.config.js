/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@khp/db', '@khp/auth'],
  experimental: {
    serverComponentsExternalPackages: ['pg']
  }
};

export default nextConfig;
