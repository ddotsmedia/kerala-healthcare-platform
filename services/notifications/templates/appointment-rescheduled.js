// appointment-rescheduled.js — reschedule notice (ml + en).

function render(locale, c) {
  if (locale === 'ml') {
    return {
      sms: `നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് (${c.booking_ref}) പുനഃക്രമീകരിച്ചു: ${c.slot_date} ${c.slot_start}.`,
      subject: `അപ്പോയിന്റ്മെന്റ് പുനഃക്രമീകരിച്ചു — ${c.booking_ref}`,
      body: `${c.provider_name} എന്നയാളുമായുള്ള അപ്പോയിന്റ്മെന്റ് ${c.slot_date} ${c.slot_start}-ലേക്ക് മാറ്റി.`
    };
  }
  return {
    sms: `Your appointment (${c.booking_ref}) has been rescheduled to ${c.slot_date} ${c.slot_start}.`,
    subject: `Appointment rescheduled — ${c.booking_ref}`,
    body: `The appointment with ${c.provider_name} has been moved to ${c.slot_date} at ${c.slot_start}.`
  };
}

export { render };
