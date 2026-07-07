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

export { physicianSchema, hospitalSchema, labSchema, medicalWebPageSchema, jobPostingSchema, SITE };
