'use client'
import { useEffect, useState } from 'react'

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [savedJobs, setSavedJobs] = useState([])
  const [tab, setTab] = useState('applications')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/jobs/my-applications').then(r => r.json()),
      fetch('/api/jobs/saved').then(r => r.json())
    ]).then(([apps, saved]) => {
      setApplications(apps || [])
      setSavedJobs(saved || [])
      setLoading(false)
    })
  }, [])

  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-700',
      reviewing: 'bg-yellow-100 text-yellow-700',
      shortlisted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      offer: 'bg-purple-100 text-purple-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">My Career Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg"><p className="text-gray-600 text-sm">Applications</p><p className="text-3xl font-bold">{applications.length}</p></div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg"><p className="text-gray-600 text-sm">Shortlisted</p><p className="text-3xl font-bold text-green-600">{applications.filter(a => a.status === 'shortlisted').length}</p></div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg"><p className="text-gray-600 text-sm">Saved Jobs</p><p className="text-3xl font-bold">{savedJobs.length}</p></div>
      </div>

      <div className="flex gap-4 border-b mb-6">
        <button onClick={() => setTab('applications')} className={`px-4 py-2 font-medium ${tab === 'applications' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}>Applications</button>
        <button onClick={() => setTab('saved')} className={`px-4 py-2 font-medium ${tab === 'saved' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}>Saved Jobs</button>
      </div>

      {loading ? <div>Loading...</div> : tab === 'applications' ? (
        <div className="space-y-4">
          {applications.length === 0 ? <div className="text-gray-600">No applications yet</div> : applications.map(app => (
            <div key={app.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3">
                  <h3 className="text-xl font-bold">{app.jobTitle}</h3>
                  <p className="text-gray-600">{app.employer}</p>
                  <p className="text-sm text-gray-500 mt-1">Applied: {new Date(app.appliedDate).toLocaleDateString()}</p>
                </div>
                <div><span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}>{app.status}</span></div>
                <div className="text-right"><p className="text-2xl font-bold text-green-600">₹{(app.salary / 100000).toFixed(1)}L</p></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.length === 0 ? <div className="text-gray-600">No saved jobs</div> : savedJobs.map(job => (
            <div key={job.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg flex justify-between items-center">
              <div><h3 className="text-xl font-bold">{job.title}</h3><p className="text-gray-600">{job.employer} • {job.location}</p></div>
              <button className="px-6 py-2 bg-blue-500 text-white rounded font-medium">Apply Now</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
