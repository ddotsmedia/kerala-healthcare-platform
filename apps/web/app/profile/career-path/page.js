'use client'
import { useEffect, useState } from 'react'

export default function CareerPath() {
  const [careerPath, setCareerPath] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profile/career-path')
      .then(r => r.json())
      .then(data => {
        setCareerPath(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">Your Career Path</h1>
      <p className="text-gray-600 mb-8">Plan your professional growth in healthcare</p>

      {careerPath ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold">{careerPath.specialty}</h2>
                <p className="text-gray-600">Specialty: {careerPath.current_level}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{careerPath.progress_percentage}%</p>
                <p className="text-gray-600 text-sm">Progress</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{width: `${careerPath.progress_percentage}%`}}></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Current Level</p>
                <p className="text-xl font-bold">{careerPath.current_level}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Target Level</p>
                <p className="text-xl font-bold">{careerPath.target_level}</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Years to Goal</p>
                <p className="text-xl font-bold">{careerPath.years_to_goal} years</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Required Skills</h3>
              <div className="grid grid-cols-2 gap-3">
                {careerPath.required_skills?.map((skill, i) => (
                  <div key={i} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-xl mr-2">✓</span>
                    <span className="text-sm">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Recommended Next Jobs</h3>
              <div className="space-y-3">
                {careerPath.recommended_jobs?.slice(0, 3).map((job, i) => (
                  <div key={i} className="p-4 border rounded-lg hover:shadow-lg transition">
                    <p className="font-bold text-sm text-blue-600">{job}</p>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold">View Recommended Jobs</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg text-center">
          <p className="text-gray-600 mb-4">No career path set yet</p>
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold">Create Career Path</button>
        </div>
      )}
    </div>
  )
}
