'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function JobRecommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch(`/api/jobs/recommendations?filter=${filter}`)
      .then(r => r.json())
      .then(data => {
        setRecommendations(data || [])
        setLoading(false)
      })
  }, [filter])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">Recommended Jobs</h1>
      <p className="text-gray-600 mb-6">Based on your profile & preferences</p>

      <div className="flex gap-2 border-b mb-6">
        {['all', 'matching', 'trending', 'new'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 font-medium capitalize ${filter === f ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}>
            {f === 'all' && '📋 All'} {f === 'matching' && '⭐ Best'} {f === 'trending' && '🔥 Trending'} {f === 'new' && '✨ New'}
          </button>
        ))}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-12 text-gray-600">No recommendations yet</div>
      ) : (
        <div className="space-y-4">
          {recommendations.map(job => (
            <div key={job.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border-l-4 border-blue-500">
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3">
                  <Link href={`/jobs/${job.id}`}><h3 className="text-xl font-bold text-blue-600 hover:underline">{job.title}</h3></Link>
                  <p className="text-gray-600">{job.employer}</p>
                  <p className="text-gray-700 text-sm mt-2">{job.description?.substring(0, 120)}...</p>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <p><strong>Specialty:</strong> {job.specialty}</p>
                    <p><strong>Experience:</strong> {job.experience_required}+ yrs</p>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p><strong>Type:</strong> {job.job_type}</p>
                  </div>
                  {job.reason && <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">✓ {job.reason}</span>}
                </div>
                <div className="text-center">
                  {job.match_percentage && (
                    <>
                      <div className="text-2xl font-bold text-green-600">{job.match_percentage}%</div>
                      <p className="text-xs text-gray-600">Match</p>
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <p className="text-2xl font-bold text-green-600">₹{(job.salary_min / 100000).toFixed(1)}L</p>
                    <p className="text-xs text-gray-600">to ₹{(job.salary_max / 100000).toFixed(1)}L</p>
                  </div>
                  <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-bold">Apply Now</button>
                  <button className="w-full px-4 py-2 border rounded-lg hover:bg-gray-100 text-sm">❤️ Save</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
