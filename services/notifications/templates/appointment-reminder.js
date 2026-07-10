// appointment-reminder.js — 24h / 2h reminder (ml + en).

function render(locale, c) {
  const when = c.window === '2h' ? (locale === 'ml' ? '2 മണിക്കൂറിനുള്ളിൽ' : 'in 2 hours') : (locale === 'ml' ? 'നാളെ' : 'tomorrow');
  const waLine = c.waLink
    ? (locale === 'ml' ? `\n\nഡോക്ടറെ WhatsApp-ൽ ഓർമ്മിപ്പിക്കാൻ ഇവിടെ ടാപ്പ് ചെയ്യുക: ${c.waLink}` : `\n\nTap to send a WhatsApp reminder to your doctor: ${c.waLink}`)
    : '';
  if (locale === 'ml') {
    return {
      sms: `ഓർമ്മപ്പെടുത്തൽ: ${c.provider_name} എന്നയാളുമായുള്ള അപ്പോയിന്റ്മെന്റ് ${when} (${c.slot_date} ${c.slot_start}). റഫ്: ${c.booking_ref}`,
      subject: `അപ്പോയിന്റ്മെന്റ് ഓർമ്മപ്പെടുത്തൽ — ${c.booking_ref}`,
      body: `${c.provider_name} എന്നയാളുമായുള്ള നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് ${when} ${c.slot_date} ${c.slot_start}-ന്.${waLine}`
    };
  }
  return {
    sms: `Reminder: appointment with ${c.provider_name} ${when} (${c.slot_date} ${c.slot_start}). Ref: ${c.booking_ref}`,
    subject: `Appointment reminder — ${c.booking_ref}`,
    body: `Your appointment with ${c.provider_name} is ${when}, on ${c.slot_date} at ${c.slot_start}.${waLine}`
  };
}

export { render };
