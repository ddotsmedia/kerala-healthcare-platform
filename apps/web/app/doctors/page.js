'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DoctorListing() {
  const [doctors, setDoctors] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ specialty: 'all', experience: 'all', rating: 'all', feeRange: 'all' })
  const [sortBy, setSortBy] = useState('rating')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/doctors?sort=' + sortBy)
      .then(r => r.json())
      .then(d => { setDoctors(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [sortBy])

  useEffect(() => {
    let results = doctors
    if (search) results = results.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase()))
    if (filters.specialty !== 'all') results = results.filter(d => d.specialty === filters.specialty)
    if (filters.experience !== 'all') results = results.filter(d => d.experience >= parseInt(filters.experience))
    if (filters.rating !== 'all') results = results.filter(d => d.rating >= parseFloat(filters.rating))
    if (filters.feeRange !== 'all') {
      const [min, max] = filters.feeRange.split('-').map(Number)
      results = results.filter(d => d.consultationFee >= min && d.consultationFee <= max)
    }
    setFiltered(results)
  }, [doctors, search, filters])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find a Doctor</h1>
          <p className="text-gray-600 dark:text-gray-400">Search from 5000+ verified doctors in Kerala</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl glass p-6 h-fit space-y-6">
            <div>
              <label className="block font-bold mb-3">Search</label>
              <input type="text" placeholder="Name or specialty..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" />
            </div>
            <div>
              <label className="block font-bold mb-3">Specialty</label>
              <select value={filters.specialty} onChange={(e) => setFilters({...filters, specialty: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                <option value="all">All</option>
                <option value="General Practice">General</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Orthopedics">Orthopedics</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-3">Experience</label>
              <select value={filters.experience} onChange={(e) => setFilters({...filters, experience: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                <option value="all">Any</option>
                <option value="5">5+ Years</option>
                <option value="10">10+ Years</option>
                <option value="20">20+ Years</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-3">Rating</label>
              <select value={filters.rating} onChange={(e) => setFilters({...filters, rating: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                <option value="all">Any</option>
                <option value="4.5">4.5+</option>
                <option value="4">4.0+</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-3">Fee</label>
              <select value={filters.feeRange} onChange={(e) => setFilters({...filters, feeRange: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                <option value="all">Any Fee</option>
                <option value="0-500">₹0 - ₹500</option>
                <option value="500-1000">₹500 - ₹1000</option>
                <option value="1000-2000">₹1000 - ₹2000</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-3">Sort</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                <option value="rating">Highest Rating</option>
                <option value="experience">Most Experience</option>
                <option value="fee">Lowest Fee</option>
              </select>
            </div>
          </div>

          <div className="col-span-3">
            {loading ? <div className="text-center py-12">Loading...</div> : filtered.length === 0 ? <div className="text-center py-12 text-gray-600">No doctors found</div> : (
              <div className="space-y-4">
                {filtered.map(doctor => (
                  <div key={doctor.id} className="bg-white dark:bg-gray-800 rounded-2xl glass p-6 hover:shadow-lg transition-all animate-fadeIn">
                    <div className="grid grid-cols-4 gap-6">
                      <div><div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center"><span className="text-4xl">👨‍⚕️</span></div></div>
                      <div className="col-span-2">
                        <h3 className="text-2xl font-bold mb-1">Dr. {doctor.name}</h3>
                        <p className="text-lg text-blue-600 font-semibold mb-3">{doctor.specialty}</p>
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div><p className="text-gray-500">Experience</p><p className="font-bold">{doctor.experience} Yrs</p></div>
                          <div><p className="text-gray-500">Rating</p><p className="font-bold">⭐ {doctor.rating}</p></div>
                          <div><p className="text-gray-500">Fee</p><p className="font-bold">₹{doctor.consultationFee}</p></div>
                          <div><p className="text-gray-500">Languages</p><p className="font-bold">{doctor.languages?.slice(0, 2).join(', ')}</p></div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 justify-center">
                        <Link href={/doctors/\} className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 text-center">View Profile</Link>
                        <Link href={/appointments/book/\} className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 text-center">Book Now</Link>
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
