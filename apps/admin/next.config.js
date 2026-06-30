/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@khp/db'],
  experimental: {
    serverComponentsExternalPackages: ['pg']
  }
};

export default nextConfig;
