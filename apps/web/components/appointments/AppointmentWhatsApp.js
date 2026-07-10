// AppointmentWhatsApp.js — wa.me action links for an appointment. Server component;
// the links are plain anchors (no JS). Shows "Remind doctor" (if the doctor has a
// WhatsApp number) + "Share with family".
import { generateWhatsAppReminderLink, shareAppointmentLink } from '@khp/notifications/whatsapp.js';

export default function AppointmentWhatsApp({ appointment, locale = 'ml', compact = false }) {
  const ml = locale === 'ml';
  const remind = generateWhatsAppReminderLink(appointment, locale);
  const share = shareAppointmentLink(appointment, locale);
  const base = 'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold';
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? '' : 'mt-2'}`}>
      {remind && (
        <a href={remind} target="_blank" rel="noopener noreferrer" className={`${base} bg-green-600 text-white hover:bg-green-700`}>
          💬 {ml ? 'ഡോക്ടറെ ഓർമ്മിപ്പിക്കുക' : 'Remind Doctor'}
        </a>
      )}
      <a href={share} target="_blank" rel="noopener noreferrer" className={`${base} border border-green-600 text-green-700 hover:bg-green-50`}>
        📤 {ml ? 'കുടുംബവുമായി പങ്കിടുക' : 'Share with family'}
      </a>
    </div>
  );
}
