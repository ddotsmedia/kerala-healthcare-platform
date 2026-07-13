// med-reminder.js — medication reminder email (ml + en).

function render(locale, c) {
  const dose = c.dosage ? ` (${c.dosage})` : '';
  if (locale === 'ml') {
    return {
      subject: `🕐 മരുന്ന് ഓർമ്മപ്പെടുത്തൽ: ${c.medication_name}`,
      body: `<div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:16px">
        <h2 style="font-size:18px;color:#111">🕐 മരുന്ന് ഓർമ്മപ്പെടുത്തൽ</h2>
        <p style="font-size:15px;color:#333">${c.time}-ന് <b>${c.medication_name}</b>${dose} കഴിക്കാൻ സമയമായി.</p>
        <p style="font-size:12px;color:#888">ഡോക്ടറുടെ നിർദേശപ്രകാരം മാത്രം മരുന്ന് കഴിക്കുക.</p>
      </div>`
    };
  }
  return {
    subject: `🕐 Medication reminder: ${c.medication_name}`,
    body: `<div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:16px">
      <h2 style="font-size:18px;color:#111">🕐 Medication reminder</h2>
      <p style="font-size:15px;color:#333">It's time to take <b>${c.medication_name}</b>${dose} at ${c.time}.</p>
      <p style="font-size:12px;color:#888">Take medication only as directed by your doctor.</p>
    </div>`
  };
}

export { render };
