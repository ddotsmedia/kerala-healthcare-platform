import { sql } from '@khp/db'

export async function GET(req) {
  const url = new URL(req.url)
  const search = url.searchParams.get('search') || ''
  const specialty = url.searchParams.get('specialty') || 'all'
  const location = url.searchParams.get('location') || 'all'
  const experience = url.searchParams.get('experience') || 'all'
  const salary = url.searchParams.get('salary') || 'all'
  const jobType = url.searchParams.get('jobType') || 'all'
  const shift = url.searchParams.get('shift') || 'all'
  const sort = url.searchParams.get('sort') || 'recent'

  try {
    let query = `
      SELECT j.*,
             r.company_name as employer,
             COUNT(ja.id) as applications_count
      FROM jobs j
      LEFT JOIN recruiter_accounts r ON j.recruiter_id = r.user_id
      LEFT JOIN job_applications ja ON j.id = ja.job_id
      WHERE j.status = 'active' AND j.deleted_at IS NULL
    `

    const params = []

    if (search) {
      query += ` AND (j.title ILIKE $${params.length + 1} OR j.specialty ILIKE $${params.length + 1} OR j.location ILIKE $${params.length + 1})`
      params.push(`%${search}%`)
    }

    if (specialty !== 'all') {
      query += ` AND j.specialty = $${params.length + 1}`
      params.push(specialty)
    }

    if (location !== 'all') {
      query += ` AND j.location ILIKE $${params.length + 1}`
      params.push(`%${location}%`)
    }

    if (experience !== 'all') {
      query += ` AND j.experience_required <= $${params.length + 1}`
      params.push(parseInt(experience))
    }

    if (salary !== 'all') {
      const [min, max] = salary.split('-').map(Number)
      query += ` AND j.salary_min >= $${params.length + 1} AND j.salary_max <= $${params.length + 1}`
      params.push(min, max)
    }

    if (jobType !== 'all') {
      query += ` AND j.job_type = $${params.length + 1}`
      params.push(jobType)
    }

    if (shift !== 'all') {
      query += ` AND j.shift = $${params.length + 1}`
      params.push(shift)
    }

    query += ` GROUP BY j.id, r.company_name`

    if (sort === 'recent') query += ` ORDER BY j.posted_date DESC`
    else if (sort === 'salary') query += ` ORDER BY j.salary_max DESC`
    else if (sort === 'trending') query += ` ORDER BY j.views_count DESC`

    query += ` LIMIT 50`

    const jobs = await sql(query, params)
    return Response.json(jobs)
  } catch (error) {
    console.error('Job search error:', error)
    return Response.json({ error: 'Failed to search jobs' }, { status: 500 })
  }
}
