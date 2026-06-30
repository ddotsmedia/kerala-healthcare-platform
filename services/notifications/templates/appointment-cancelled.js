// appointment-cancelled.js — cancellation notice (ml + en).

function render(locale, c) {
  if (locale === 'ml') {
    return {
      sms: `നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് (${c.booking_ref}, ${c.slot_date} ${c.slot_start}) റദ്ദാക്കി.`,
      subject: `അപ്പോയിന്റ്മെന്റ് റദ്ദാക്കി — ${c.booking_ref}`,
      body: `${c.provider_name} എന്നയാളുമായുള്ള ${c.slot_date} ${c.slot_start} അപ്പോയിന്റ്മെന്റ് റദ്ദാക്കിയിരിക്കുന്നു.`
    };
  }
  return {
    sms: `Your appointment (${c.booking_ref}, ${c.slot_date} ${c.slot_start}) has been cancelled.`,
    subject: `Appointment cancelled — ${c.booking_ref}`,
    body: `The appointment with ${c.provider_name} on ${c.slot_date} at ${c.slot_start} has been cancelled.`
  };
}

export { render };
