// Security headers applied to every response (no new package — Next headers()).
const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; img-src 'self' https: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' https: data:; connect-src 'self' https://api.anthropic.com" }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@khp/db', '@khp/search', '@khp/ui', '@khp/appointments', '@khp/notifications', '@khp/auth', '@khp/ai-assistant', '@khp/cache', '@khp/ratelimit'],
  experimental: {
    serverComponentsExternalPackages: ['pg']
  },
  async headers() {
    return [{ source: '/(.*)', headers: SECURITY_HEADERS }];
  }
};

export default nextConfig;
