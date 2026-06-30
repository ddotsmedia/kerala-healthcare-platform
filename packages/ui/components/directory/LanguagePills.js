// LanguagePills.js — render a list of language codes as pills.

const LABELS = { ml: 'മലയാളം', en: 'English', ta: 'தமிழ்', hi: 'हिन्दी' };

export default function LanguagePills({ languages }) {
  if (!languages || languages.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {languages.map((code) => (
        <span key={code} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">
          {LABELS[code] || code}
        </span>
      ))}
    </div>
  );
}
