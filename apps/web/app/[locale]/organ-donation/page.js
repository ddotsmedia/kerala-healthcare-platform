// Organ Donation Awareness — education, myths vs facts, KNOS info, pledge form,
// live counter, WhatsApp share. Awareness only — pledging here is not legal
// registration; the official registry is Kerala KNOS.

import { resolveLocale } from '@/lib/i18n';
import { listDistricts } from '@/lib/providers';
import { pledgeCount, KNOS_URL } from '@/lib/organDonation';
import { FullBleed } from '@/components/home/HomeSections';
import PledgeSection from '@/components/organ/PledgeSection';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'അവയവദാനം — ജീവന്റെ സമ്മാനം | MalayaliDoctor' : 'Organ Donation — Give the Gift of Life | MalayaliDoctor',
    description: ml
      ? 'അവയവദാനത്തെക്കുറിച്ച് അറിയൂ, മിഥ്യാധാരണകൾ മാറ്റൂ, കേരള KNOS-മായി രജിസ്റ്റർ ചെയ്യൂ, പ്രതിജ്ഞ എടുക്കൂ.'
      : 'Learn about organ donation, bust the myths, register with Kerala KNOS and take the pledge on MalayaliDoctor.'
  };
}

const FACTS = [
  { ml: ['ഒരു ദാതാവിന് 8 ജീവൻ വരെ രക്ഷിക്കാം', 'ഒരാളുടെ അവയവങ്ങളും കോശങ്ങളും എട്ടോളം പേരുടെ ജീവൻ രക്ഷിക്കുകയും നിരവധി പേരുടെ ജീവിതം മെച്ചപ്പെടുത്തുകയും ചെയ്യാം.'],
    en: ['One donor can save up to 8 lives', 'A single donor’s organs and tissues can save up to eight lives and improve many more.'] },
  { ml: ['എല്ലാ മതങ്ങളും അവയവദാനത്തെ പിന്തുണയ്ക്കുന്നു', 'മിക്ക പ്രധാന വിശ്വാസങ്ങളും അവയവദാനത്തെ കാരുണ്യത്തിന്റെ പ്രവൃത്തിയായി കാണുന്നു.'],
    en: ['Major faiths support donation', 'Most major religions regard organ donation as an act of compassion and charity.'] },
  { ml: ['പ്രായം ഒരു തടസ്സമല്ല', 'ആരോഗ്യസ്ഥിതി അനുസരിച്ച് ഏത് പ്രായത്തിലുള്ളവർക്കും ദാതാവാകാം — വൈദ്യപരിശോധന തീരുമാനിക്കും.'],
    en: ['Age is rarely a barrier', 'People of almost any age can donate; medical suitability is assessed at the time, not by age alone.'] }
];

const MYTHS = [
  { ml: ['ഡോക്ടർമാർ എന്നെ രക്ഷിക്കാൻ കുറച്ച് ശ്രമിക്കും', 'തെറ്റ്. നിങ്ങളുടെ ജീവൻ രക്ഷിക്കുകയാണ് ചികിത്സാ സംഘത്തിന്റെ ഏക ലക്ഷ്യം; ദാനം പരിഗണിക്കുന്നത് മരണം സ്ഥിരീകരിച്ചതിന് ശേഷം മാത്രം.'],
    en: ['“Doctors won’t try as hard to save me”', 'False. The medical team’s only goal is to save your life; donation is considered only after death is confirmed.'] },
  { ml: ['എന്റെ കുടുംബത്തിന് ചെലവ് വരും', 'തെറ്റ്. ദാനവുമായി ബന്ധപ്പെട്ട ചെലവുകൾ ദാതാവിന്റെ കുടുംബം വഹിക്കേണ്ടതില്ല.'],
    en: ['“It will cost my family”', 'False. The donor’s family is not charged for costs related to organ donation.'] },
  { ml: ['ധനികർക്ക് മാത്രമേ അവയവം കിട്ടൂ', 'തെറ്റ്. അവയവങ്ങൾ വൈദ്യശാസ്ത്രപരമായ ആവശ്യകത അനുസരിച്ചാണ് വിതരണം ചെയ്യുന്നത്, സമ്പത്ത് അനുസരിച്ചല്ല.'],
    en: ['“Only the rich get organs”', 'False. Organs are allocated by medical need and matching, never by wealth or status.'] }
];

function Accordion({ items, tone }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <details key={i} className={`group rounded-xl border ${tone} p-3`}>
          <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
            <span className="mr-1 text-gray-400 group-open:hidden">＋</span>
            <span className="mr-1 hidden text-gray-400 group-open:inline">−</span>
            {it[0]}
          </summary>
          <p className="mt-2 text-sm text-gray-600">{it[1]}</p>
        </details>
      ))}
    </div>
  );
}

export default async function OrganDonationPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const [districts, count] = await Promise.all([listDistricts(), pledgeCount()]);
  const pick = (o) => (ml ? o.ml : o.en);

  return (
    <div className="-my-6">
      <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-12 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-extrabold">💚 {ml ? 'അവയവദാനം — ജീവന്റെ സമ്മാനം' : 'Organ Donation — Give the Gift of Life'}</h1>
          <p className="mt-2 text-sm text-white/90">
            {ml ? 'ഒരു തീരുമാനം. എട്ടോളം ജീവനുകൾ. ഇന്ന് പ്രതിജ്ഞ എടുക്കൂ.' : 'One decision. Up to eight lives. Take the pledge today.'}
          </p>
        </div>
      </FullBleed>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        {/* What is organ donation */}
        <section>
          <h2 className="mb-2 text-xl font-bold text-gray-900">{ml ? 'അവയവദാനം എന്നാൽ എന്ത്?' : 'What is organ donation?'}</h2>
          <p className="text-sm leading-relaxed text-gray-700">
            {ml
              ? 'ഒരു വ്യക്തി തന്റെ ആരോഗ്യമുള്ള അവയവങ്ങളും കോശങ്ങളും മറ്റൊരാളിലേക്ക് മാറ്റിവയ്ക്കാൻ ദാനം ചെയ്യുന്നതാണ് അവയവദാനം. ജീവിച്ചിരിക്കുമ്പോൾ (ഉദാ. ഒരു വൃക്ക) അല്ലെങ്കിൽ മരണശേഷം ദാനം ചെയ്യാം. ഇത് അവയവ പരാജയമുള്ള രോഗികൾക്ക് പുതുജീവൻ നൽകുന്നു.'
              : 'Organ donation is giving a healthy organ or tissue so it can be transplanted into someone whose own has failed. It can happen while living (e.g. one kidney) or after death, offering a second chance at life to patients in need.'}
          </p>
        </section>

        {/* Facts */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900">{ml ? 'വസ്തുതകൾ' : 'The facts'}</h2>
          <Accordion items={FACTS.map(pick)} tone="border-teal-200 bg-teal-50/40" />
        </section>

        {/* Myths vs facts */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900">{ml ? 'മിഥ്യാധാരണകൾ vs വസ്തുതകൾ' : 'Myths vs facts'}</h2>
          <Accordion items={MYTHS.map(pick)} tone="border-amber-200 bg-amber-50/40" />
        </section>

        {/* KNOS */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-bold text-gray-900">{ml ? 'കേരള KNOS' : 'Kerala KNOS'}</h2>
          <p className="mt-1 text-sm text-gray-700">
            {ml
              ? 'കേരള നെറ്റ്‌വർക്ക് ഓഫ് ഓർഗൻ ഷെയറിംഗ് (KNOS / "മൃതസഞ്ജീവനി") ആണ് സംസ്ഥാനത്തെ ഔദ്യോഗിക അവയവദാന-വിതരണ സംവിധാനം. ഔദ്യോഗിക രജിസ്ട്രേഷനായി അവരുടെ വെബ്സൈറ്റ് സന്ദർശിക്കുക.'
              : 'The Kerala Network of Organ Sharing (KNOS / "Mrithasanjeevani") is the state’s official organ donation & allocation body. Complete your official registration on their website.'}
          </p>
          <a href={KNOS_URL} target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-block rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
            {ml ? 'ഔദ്യോഗിക KNOS സൈറ്റ് →' : 'Official KNOS site →'}
          </a>
        </section>

        {/* Pledge + live counter */}
        <section id="pledge">
          <PledgeSection locale={locale} districts={districts} initialCount={count} knosUrl={KNOS_URL} />
        </section>

        <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          {ml
            ? 'ഈ പേജ് പൊതു അവബോധത്തിന് മാത്രം. ഇവിടെ എടുക്കുന്ന പ്രതിജ്ഞ ഒരു നിയമപരമായ ദാതൃ രജിസ്ട്രേഷനല്ല — ഔദ്യോഗിക രജിസ്ട്രേഷനായി KNOS സന്ദർശിക്കുക. ആരോഗ്യ കാര്യങ്ങൾക്ക് ഡോക്ടറെ സമീപിക്കുക.'
            : 'This page is for general awareness only. A pledge here is not a legal donor registration — complete official registration with KNOS. For health matters, consult a qualified doctor.'}
        </div>
      </main>
    </div>
  );
}
