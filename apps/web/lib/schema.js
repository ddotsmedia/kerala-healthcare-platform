// schema.js — Schema.org JSON-LD builders for SEO. No PII beyond public profile.

const SITE = process.env.NEXT_PUBLIC_APP_URL || 'https://keralahealthportal.in';

/** Physician structured data for a doctor profile (enhanced). */
function physicianSchema(doctor, locale) {
  const region = doctor.district_en || doctor.district_ml || 'Kerala';
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: doctor.display_name,
    url: `${SITE}/${locale}/doctors/${doctor.slug}`,
    image: doctor.photo_url || undefined,
    medicalSpecialty: doctor.specialty_en || doctor.specialty_ml || undefined,
    areaServed: region,
    address: { '@type': 'PostalAddress', addressRegion: region, addressCountry: 'IN' },
    availableService: {
      '@type': 'MedicalProcedure',
      name: doctor.specialty_en ? `${doctor.specialty_en} consultation` : 'Medical consultation'
    },
    ...(doctor.consultation_fee != null ? { priceRange: `₹${doctor.consultation_fee}` } : {}),
    ...(Array.isArray(doctor.languages) && doctor.languages.length ? { knowsLanguage: doctor.languages } : {})
  };
}

/** Hospital structured data for a hospital profile (enhanced). */
function hospitalSchema(hospital, locale, extra = {}) {
  const region = hospital.district_en || hospital.district_ml || 'Kerala';
  const departments = (extra.departments || hospital.departments || []).map((d) => d.name_en || d.name_ml).filter(Boolean);
  const services = (extra.services || hospital.services || []).map((s) => s.name_en || s.name_ml).filter(Boolean);
  if (hospital.emergency_24x7) services.push('Emergency 24x7');
  return {
    '@context': 'https://schema.org',
    '@type': 'Hospital',
    name: hospital.name_en || hospital.name_ml,
    url: `${SITE}/${locale}/hospitals/${hospital.slug}`,
    image: hospital.logo_url || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hospital.address_en || hospital.address_ml || undefined,
      addressRegion: region, addressCountry: 'IN'
    },
    areaServed: region,
    ...(hospital.latitude != null && hospital.longitude != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: hospital.latitude, longitude: hospital.longitude } }
      : {}),
    ...(departments.length ? { department: departments.map((name) => ({ '@type': 'MedicalClinic', name })) } : {}),
    ...(services.length ? { availableService: services.map((name) => ({ '@type': 'MedicalProcedure', name })) } : {})
  };
}

/** MedicalOrganization structured data for a diagnostic lab. */
function labSchema(lab, locale) {
  const region = lab.district_en || lab.district_ml || 'Kerala';
  const phones = Array.isArray(lab.phone) ? lab.phone : (lab.phone ? [lab.phone] : []);
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: lab.name_en || lab.name_ml,
    url: `${SITE}/${locale}/labs/${lab.slug}`,
    telephone: phones[0] || undefined,
    email: lab.email || undefined,
    medicalSpecialty: lab.type || 'Diagnostic',
    address: {
      '@type': 'PostalAddress',
      streetAddress: lab.address_en || lab.address_ml || undefined,
      addressRegion: region, addressCountry: 'IN'
    },
    areaServed: region,
    ...(lab.lat != null && lab.lng != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: lab.lat, longitude: lab.lng } }
      : {}),
    ...(lab.rating_count > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(lab.rating_avg), reviewCount: lab.rating_count } }
      : {}),
    ...(lab.is_nabl_accredited ? { hasCredential: 'NABL Accredited' } : {})
  };
}

/** Pharmacy structured data for a pharmacy profile. */
function pharmacySchema(ph, locale) {
  const region = ph.district_en || ph.district_ml || 'Kerala';
  const phones = Array.isArray(ph.phone) ? ph.phone : (ph.phone ? [ph.phone] : []);
  return {
    '@context': 'https://schema.org',
    '@type': 'Pharmacy',
    name: ph.name_en || ph.name_ml,
    url: `${SITE}/${locale}/pharmacies/${ph.slug}`,
    telephone: phones[0] || undefined,
    email: ph.email || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ph.address_en || ph.address_ml || undefined,
      addressRegion: region, addressCountry: 'IN'
    },
    areaServed: region,
    ...(ph.lat != null && ph.lng != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: ph.lat, longitude: ph.lng } }
      : {}),
    ...(ph.is_24hr ? { openingHours: 'Mo-Su 00:00-23:59' } : {}),
    ...(ph.rating_count > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(ph.rating_avg), reviewCount: ph.rating_count } }
      : {})
  };
}

/** MedicalOrganization structured data for a blood bank. */
function bloodBankSchema(bank, locale) {
  const region = bank.district_en || bank.district_ml || 'Kerala';
  const phones = Array.isArray(bank.phone) ? bank.phone : (bank.phone ? [bank.phone] : []);
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: bank.name_en || bank.name_ml,
    url: `${SITE}/${locale}/blood-banks/${bank.slug}`,
    medicalSpecialty: 'Hematology',
    telephone: bank.emergency_phone || phones[0] || undefined,
    email: bank.email || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: bank.address_en || bank.address_ml || undefined,
      addressRegion: region, addressCountry: 'IN'
    },
    areaServed: region,
    ...(bank.lat != null && bank.lng != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: bank.lat, longitude: bank.lng } }
      : {}),
    ...(bank.is_24hr ? { openingHours: 'Mo-Su 00:00-23:59' } : {})
  };
}

/** EmergencyService structured data for an ambulance provider. */
function ambulanceSchema(a, locale) {
  const region = a.district_en || a.district_ml || 'Kerala';
  const phones = Array.isArray(a.phone) ? a.phone : (a.phone ? [a.phone] : []);
  return {
    '@context': 'https://schema.org',
    '@type': 'EmergencyService',
    name: a.name_en || a.name_ml,
    url: `${SITE}/${locale}/ambulance/${a.slug}`,
    telephone: phones[0] || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: a.address_en || a.address_ml || undefined,
      addressRegion: region, addressCountry: 'IN'
    },
    areaServed: (Array.isArray(a.coverage_districts) && a.coverage_districts.length) ? a.coverage_districts : region,
    ...(a.is_24hr ? { openingHours: 'Mo-Su 00:00-23:59' } : {})
  };
}

/** Dentist structured data for a dental clinic profile. */
function dentalSchema(c, locale) {
  const region = c.district_en || c.district_ml || 'Kerala';
  const phones = Array.isArray(c.phone) ? c.phone : (c.phone ? [c.phone] : []);
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: c.name_en || c.name_ml,
    url: `${SITE}/${locale}/dental/${c.slug}`,
    telephone: phones[0] || undefined,
    email: c.email || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.address_en || c.address_ml || undefined,
      addressRegion: region, addressCountry: 'IN'
    },
    areaServed: region,
    ...(c.lat != null && c.lng != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng } }
      : {}),
    ...(Array.isArray(c.treatments_offered) && c.treatments_offered.length
      ? { availableService: c.treatments_offered.map((t) => ({ '@type': 'MedicalProcedure', name: t.replace('_', ' ') })) }
      : {}),
    ...(c.rating_count > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(c.rating_avg), reviewCount: c.rating_count } }
      : {})
  };
}

/** MedicalOrganization structured data for an eye centre. */
function eyeCentreSchema(e, locale) {
  const region = e.district_en || e.district_ml || 'Kerala';
  const phones = Array.isArray(e.phone) ? e.phone : (e.phone ? [e.phone] : []);
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: e.name_en || e.name_ml,
    url: `${SITE}/${locale}/eye-hospitals/${e.slug}`,
    medicalSpecialty: 'Ophthalmology',
    telephone: phones[0] || undefined,
    email: e.email || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: e.address_en || e.address_ml || undefined,
      addressRegion: region, addressCountry: 'IN'
    },
    areaServed: region,
    ...(e.lat != null && e.lng != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: e.lat, longitude: e.lng } }
      : {}),
    ...(Array.isArray(e.surgeries_offered) && e.surgeries_offered.length
      ? { availableService: e.surgeries_offered.map((s) => ({ '@type': 'MedicalProcedure', name: `${s} surgery` })) }
      : {}),
    ...(e.rating_count > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(e.rating_avg), reviewCount: e.rating_count } }
      : {})
  };
}

/** MedicalWebPage wrapper — every health-context page. */
function medicalWebPageSchema(title, description, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: title,
    description,
    url,
    lastReviewed: undefined
  };
}

/** JobPosting structured data for a job listing. */
function jobPostingSchema(job, locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || job.title,
    datePosted: job.created_at ? new Date(job.created_at).toISOString().slice(0, 10) : undefined,
    validThrough: job.application_deadline || undefined,
    employmentType: (job.employment_type || '').toUpperCase(),
    hiringOrganization: { '@type': 'Organization', name: job.org_name },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressRegion: job.district_en || 'Kerala', addressCountry: 'IN' }
    },
    url: `${SITE}/${locale}/jobs/${job.slug}`
  };
}

export { physicianSchema, hospitalSchema, labSchema, pharmacySchema, bloodBankSchema, ambulanceSchema, dentalSchema, eyeCentreSchema, medicalWebPageSchema, jobPostingSchema, SITE };
