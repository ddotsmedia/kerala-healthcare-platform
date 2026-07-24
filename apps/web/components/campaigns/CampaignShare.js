// CampaignShare.js — wa.me deep link for a campaign. Server component, plain anchor.

export default function CampaignShare({ title, url, locale = 'ml' }) {
  const ml = locale === 'ml';
  const message = ml
    ? `${title} — MalayaliDoctor-ൽ കൂടുതൽ അറിയൂ: ${url}`
    : `${title} — learn more on MalayaliDoctor: ${url}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={wa} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
    >
      💬 {ml ? 'WhatsApp-ൽ പങ്കിടുക' : 'Share on WhatsApp'}
    </a>
  );
}
