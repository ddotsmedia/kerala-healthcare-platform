'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function RecommendedDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/recommendations/doctors')
      .then((r) => r.json())
      .then((d) => {
        setDoctors(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>
  if (doctors.length === 0) return null

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg glass space-y-4">
      <h3 className="text-lg font-bold">✨ Recommended For You</h3>
      <div className="space-y-3">
        {doctors.map((d) => (
          <div key={d.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{d.display_name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{d.specialty_en}</p>
              <p className="text-sm text-yellow-500">⭐ {(d.rating || 0).toFixed(1)}</p>
            </div>
            <Link href={`/doctors/${d.id}`} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all">
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
