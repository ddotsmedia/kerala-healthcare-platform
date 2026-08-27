'use client'
import { useState } from 'react'

export default function SalaryBenchmarking() {
  const [filters, setFilters] = useState({
    specialty: 'General Medicine',
    location: 'Kerala',
    experience: '5'
  })
  const [benchmarks, setBenchmarks] = useState(null)

  const handleSearch = () => {
    fetch(`/api/salary-benchmarks?specialty=${filters.specialty}&location=${filters.location}&experience=${filters.experience}`)
      .then(r => r.json())
      .then(data => setBenchmarks(data[0]))
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">Salary Benchmarking</h1>
      <p className="text-gray-600 mb-8">Explore salary trends in healthcare</p>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg h-fit">
          <h3 className="font-bold mb-4">Filters</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Specialty</label>
              <select value={filters.specialty} onChange={(e) => setFilters({...filters, specialty: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                <option>General Medicine</option>
                <option>Cardiology</option>
                <option>Nursing</option>
                <option>Lab Technician</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <select value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                <option>Kerala</option>
                <option>Kochi</option>
                <option>Thiruvananthapuram</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Experience (Years)</label>
              <select value={filters.experience} onChange={(e) => setFilters({...filters, experience: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                <option value="0">0-1 Years</option>
                <option value="2">2-5 Years</option>
                <option value="5">5-10 Years</option>
                <option value="10">10+ Years</option>
              </select>
            </div>
            <button onClick={handleSearch} className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold">Search</button>
          </div>
        </div>

        <div className="col-span-3">
          {benchmarks ? (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-6">{filters.specialty} in {filters.location}</h2>

                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 rounded-lg">
                    <p className="text-gray-600 text-sm mb-2">Average Salary</p>
                    <p className="text-3xl font-bold text-blue-600">₹{(benchmarks.average_salary / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-lg">
                    <p className="text-gray-600 text-sm mb-2">25th Percentile</p>
                    <p className="text-3xl font-bold text-green-600">₹{(benchmarks.p25_salary / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 p-6 rounded-lg">
                    <p className="text-gray-600 text-sm mb-2">75th Percentile</p>
                    <p className="text-3xl font-bold text-yellow-600">₹{(benchmarks.p75_salary / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 rounded-lg">
                    <p className="text-gray-600 text-sm mb-2">90th Percentile</p>
                    <p className="text-3xl font-bold text-purple-600">₹{(benchmarks.p90_salary / 100000).toFixed(1)}L</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                  <h3 className="font-bold mb-4">Salary Range</h3>
                  <div className="space-y-2 text-sm">
                    <p>• 25% of professionals earn less than ₹{(benchmarks.p25_salary / 100000).toFixed(1)}L</p>
                    <p>• 50% of professionals earn around ₹{(benchmarks.average_salary / 100000).toFixed(1)}L</p>
                    <p>• 75% of professionals earn up to ₹{(benchmarks.p75_salary / 100000).toFixed(1)}L</p>
                    <p>• Top 10% earn ₹{(benchmarks.p90_salary / 100000).toFixed(1)}L+</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-lg text-center text-gray-600">
              <p>Select filters and search to view salary benchmarks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
