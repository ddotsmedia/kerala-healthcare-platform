// PWA manifest (Next.js 15). Served at /manifest.webmanifest.

export default function manifest() {
  return {
    name: 'MalayaliDoctor — Kerala Health Portal',
    short_name: 'MalayaliDoctor',
    description: 'Find doctors and hospitals in Kerala',
    start_url: '/ml',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0d9488',
    orientation: 'portrait',
    categories: ['health', 'medical'],
    lang: 'ml',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    shortcuts: [
      { name: 'Find Doctor', url: '/ml/doctors', description: 'Search for doctors' },
      { name: 'Emergency', url: '/ml/emergency', description: 'Emergency contacts' },
      { name: 'AI Assistant', url: '/ml/assistant', description: 'Health assistant' }
    ]
  };
}
