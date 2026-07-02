// schema.js — Schema.org JSON-LD builders for SEO. No PII beyond public profile.

const SITE = process.env.NEXT_PUBLIC_APP_URL || 'https://keralahealthportal.in';

/** Physician structured data for a doctor profile. */
function physicianSchema(doctor, locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: doctor.display_name,
    url: `${SITE}/${locale}/doctors/${doctor.slug}`,
    image: doctor.photo_url || undefined,
    medicalSpecialty: doctor.specialty_en || doctor.specialty_ml || undefined,
    areaServed: doctor.district_en || doctor.district_ml || 'Kerala'
  };
}

/** Hospital structured data for a hospital profile. */
function hospitalSchema(hospital, locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Hospital',
    name: hospital.name_en || hospital.name_ml,
    url: `${SITE}/${locale}/hospitals/${hospital.slug}`,
    image: hospital.logo_url || undefined,
    address: hospital.address_en || hospital.address_ml || undefined,
    areaServed: hospital.district_en || hospital.district_ml || 'Kerala',
    availableService: hospital.emergency_24x7 ? 'Emergency 24x7' : undefined
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

export { physicianSchema, hospitalSchema, medicalWebPageSchema, jobPostingSchema, SITE };
