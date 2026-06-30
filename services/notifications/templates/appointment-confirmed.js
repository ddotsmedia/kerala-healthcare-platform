// appointment-confirmed.js — booking confirmation (ml + en).

function render(locale, c) {
  const room = c.consultation_room ? `\nConsultation room: ${c.roomUrl || c.consultation_room}` : '';
  if (locale === 'ml') {
    return {
      sms: `നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് സ്ഥിരീകരിച്ചു. ${c.provider_name}, ${c.slot_date} ${c.slot_start}. റഫ്: ${c.booking_ref}${room}`,
      subject: `അപ്പോയിന്റ്മെന്റ് സ്ഥിരീകരണം — ${c.booking_ref}`,
      body: `${c.provider_name} എന്നയാളുമായുള്ള നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് ${c.slot_date} ${c.slot_start}-ന് സ്ഥിരീകരിച്ചു.${room}`
    };
  }
  return {
    sms: `Your appointment is confirmed. ${c.provider_name}, ${c.slot_date} ${c.slot_start}. Ref: ${c.booking_ref}${room}`,
    subject: `Appointment confirmed — ${c.booking_ref}`,
    body: `Your appointment with ${c.provider_name} on ${c.slot_date} at ${c.slot_start} is confirmed.${room}`
  };
}

export { render };
