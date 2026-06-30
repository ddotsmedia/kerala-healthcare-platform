// ConsultationModeChip.js — in_person | video | phone pill badge.

const LABELS = {
  in_person: { ml: 'നേരിട്ട്', en: 'In-person' },
  video: { ml: 'വീഡിയോ', en: 'Video' },
  phone: { ml: 'ഫോൺ', en: 'Phone' }
};

export default function ConsultationModeChip({ mode, locale = 'ml' }) {
  const l = LABELS[mode];
  if (!l) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
      {l[locale] || l.en}
    </span>
  );
}
