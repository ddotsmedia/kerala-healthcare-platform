'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function JobSearch() {
  const [jobs, setJobs] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    specialty: 'all', experience: 'all', salary: 'all', jobType: 'all',
    shift: 'all', location: 'all', employmentType: 'all'
  })
  const [sortBy, setSortBy] = useState('recent')
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    fetch(`/api/jobs/search?sort=${sortBy}`)
      .then(r => r.json())
      .then(d => { setJobs(d); setLoading(false) })
  }, [sortBy])

  useEffect(() => {
    let results = jobs
    if (search) results = results.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.specialty.toLowerCase().includes(search.toLowerCase()))
    if (filters.specialty !== 'all') results = results.filter(j => j.specialty === filters.specialty)
    if (filters.experience !== 'all') results = results.filter(j => j.experience_required <= parseInt(filters.experience))
    if (filters.salary !== 'all') {
      const [min, max] = filters.salary.split('-').map(Number)
      results = results.filter(j => j.salary_min >= min && j.salary_max <= max)
    }
    if (filters.jobType !== 'all') results = results.filter(j => j.job_type === filters.jobType)
    if (filters.shift !== 'all') results = results.filter(j => j.shift === filters.shift)
    if (filters.location !== 'all') results = results.filter(j => j.location.includes(filters.location))
    setFiltered(results)
  }, [jobs, search, filters])

  const specialties = ['General Medicine', 'Cardiology', 'Neurology', 'Nursing', 'Lab Technician', 'Radiography', 'Physiotherapy']
  const locations = ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Pan-Kerala']

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Medical Jobs in Kerala</h1>
        <div className="flex gap-2 mb-6">
          <input type="text" placeholder="Job title, specialty..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 px-6 py-3 border rounded-lg dark:bg-gray-800" />
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold">🔍</button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 h-fit space-y-4">
            <select value={filters.specialty} onChange={(e) => setFilters({...filters, specialty: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
              <option value="all">All Specialties</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.experience} onChange={(e) => setFilters({...filters, experience: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
              <option value="all">Any Experience</option>
              <option value="0">Fresher</option>
              <option value="5">5+ Years</option>
              <option value="10">10+ Years</option>
            </select>
            <select value={filters.salary} onChange={(e) => setFilters({...filters, salary: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
              <option value="all">Any Salary</option>
              <option value="0-300000">₹0 - ₹3L</option>
              <option value="300000-600000">₹3L - ₹6L</option>
              <option value="600000-1000000">₹6L - ₹10L</option>
            </select>
            <select value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
              <option value="all">All Locations</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="col-span-3">
            <div className="flex justify-between mb-4">
              <p className="font-bold">Found {filtered.length} jobs</p>
              <div className="flex gap-2">
                <button onClick={() => setViewMode('grid')} className={`px-3 py-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>⊞</button>
                <button onClick={() => setViewMode('list')} className={`px-3 py-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>≡</button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
              {loading ? <div>Loading...</div> : filtered.length === 0 ? <div>No jobs found</div> : filtered.map(job => (
                <div key={job.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg hover:shadow-lg">
                  <Link href={`/jobs/${job.id}`}><h3 className="text-lg font-bold text-blue-600">{job.title}</h3></Link>
                  <p className="text-gray-600">{job.employer}</p>
                  <p className="text-sm mt-2"><strong>Specialty:</strong> {job.specialty}</p>
                  <p className="text-sm"><strong>Location:</strong> {job.location}</p>
                  <p className="text-2xl font-bold text-green-600 mt-3">₹{(job.salary_min / 100000).toFixed(1)}L</p>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded text-sm">Apply</button>
                    <button className="px-4 py-2 border text-sm">❤️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
