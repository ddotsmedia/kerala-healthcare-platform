/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@khp/db', '@khp/auth', '@khp/cache'],
  experimental: {
    serverComponentsExternalPackages: ['pg']
  }
};

export default nextConfig;
