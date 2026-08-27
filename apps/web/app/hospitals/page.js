'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HospitalListing() {
  const [hospitals, setHospitals] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ type: 'all', accreditation: 'all', department: 'all', beds: 'all' })
  const [sortBy, setSortBy] = useState('rating')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/hospitals?sort=' + sortBy)
      .then(r => r.json())
      .then(h => { setHospitals(h); setLoading(false) })
      .catch(() => setLoading(false))
  }, [sortBy])

  useEffect(() => {
    let results = hospitals
    if (search) results = results.filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.city.toLowerCase().includes(search.toLowerCase()))
    if (filters.type !== 'all') results = results.filter(h => h.type === filters.type)
    if (filters.department !== 'all') results = results.filter(h => h.departments?.includes(filters.department))
    if (filters.beds !== 'all') results = results.filter(h => h.totalBeds >= parseInt(filters.beds))
    setFiltered(results)
  }, [hospitals, search, filters])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find a Hospital</h1>
          <p className="text-gray-600 dark:text-gray-400">Search from 500+ hospitals across Kerala</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl glass p-6 h-fit space-y-6">
            <input type="text" placeholder="Name or city..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" />
            <div>
              <label className="block font-bold mb-3">Type</label>
              <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                <option value="all">All</option>
                <option value="general">General</option>
                <option value="specialty">Specialty</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-3">Department</label>
              <select value={filters.department} onChange={(e) => setFilters({...filters, department: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                <option value="all">All</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Surgery">Surgery</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-3">Min Beds</label>
              <select value={filters.beds} onChange={(e) => setFilters({...filters, beds: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                <option value="all">Any</option>
                <option value="50">50+</option>
                <option value="100">100+</option>
                <option value="200">200+</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-3">Sort</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                <option value="rating">Highest Rating</option>
                <option value="beds">Most Beds</option>
              </select>
            </div>
          </div>

          <div className="col-span-3">
            {loading ? <div className="text-center py-12">Loading...</div> : filtered.length === 0 ? <div className="text-center py-12 text-gray-600">No hospitals found</div> : (
              <div className="space-y-4">
                {filtered.map(hospital => (
                  <div key={hospital.id} className="bg-white dark:bg-gray-800 rounded-2xl glass p-6 hover:shadow-lg transition-all animate-fadeIn">
                    <div className="grid grid-cols-4 gap-6">
                      <div><div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center"><span className="text-4xl">🏥</span></div></div>
                      <div className="col-span-2">
                        <h3 className="text-2xl font-bold mb-1">{hospital.name}</h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">{hospital.city}</p>
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div><p className="text-gray-500">Beds</p><p className="font-bold">{hospital.totalBeds}</p></div>
                          <div><p className="text-gray-500">Rating</p><p className="font-bold">⭐ {hospital.rating}</p></div>
                          <div><p className="text-gray-500">Type</p><p className="font-bold">{hospital.type}</p></div>
                          <div><p className="text-gray-500">Depts</p><p className="font-bold">{hospital.departments?.length}+</p></div>
                        </div>
                        <div className="flex gap-2">
                          {hospital.nabhAccredited && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">NABH</span>}
                          {hospital.aaciAccredited && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">AACI</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 justify-center">
                        <Link href={/hospitals/\} className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 text-center">View Details</Link>
                        <a href={	el:\} className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 text-center">Call Now</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
