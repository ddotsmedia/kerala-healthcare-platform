// robots.txt (Next.js 15). Served at /robots.txt.

const SITE = process.env.NEXT_PUBLIC_APP_URL || 'https://malayalidoctor.com';

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/api/', '/admin', '/patient/', '/portal/'] }
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE
  };
}
