'use client'
import { useEffect, useState } from 'react'

export default function RecruiterDashboard() {
  const [stats, setStats] = useState(null)
  const [activeJobs, setActiveJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [showPostJob, setShowPostJob] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    Promise.all([
      fetch('/api/recruiter/stats').then(r => r.json()),
      fetch('/api/recruiter/jobs').then(r => r.json()),
      fetch(`/api/recruiter/applications?status=${filterStatus}`).then(r => r.json())
    ]).then(([s, j, a]) => {
      setStats(s)
      setActiveJobs(j || [])
      setApplications(a || [])
    })
  }, [filterStatus])

  const handlePostJob = (jobData) => {
    fetch('/api/recruiter/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    }).then(r => r.json()).then(data => {
      setActiveJobs([...activeJobs, data])
      setShowPostJob(false)
      alert('Job posted!')
    })
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Recruiter Dashboard</h1>
        <button onClick={() => setShowPostJob(true)} className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold">+ Post Job</button>
      </div>

      {stats && (
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg"><p className="text-gray-600 text-sm">Active Jobs</p><p className="text-3xl font-bold">{stats.activeJobs}</p></div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg"><p className="text-gray-600 text-sm">Applications</p><p className="text-3xl font-bold">{stats.totalApplications}</p></div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg"><p className="text-gray-600 text-sm">Hired This Month</p><p className="text-3xl font-bold text-green-600">{stats.hiredThisMonth}</p></div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg"><p className="text-gray-600 text-sm">Avg Response Time</p><p className="text-3xl font-bold">{stats.avgResponseTime}h</p></div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg"><p className="text-gray-600 text-sm">Profile Views</p><p className="text-3xl font-bold">{stats.profileViews}</p></div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <h2 className="text-2xl font-bold mb-4">Active Job Postings</h2>
          <div className="space-y-4">
            {activeJobs.map(job => (
              <div key={job.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold">{job.title}</h3>
                    <p className="text-gray-600">{job.specialty} • {job.location}</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{job.applications_count} 👥</p>
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm mb-3">
                  <p><strong>Posted:</strong> {new Date(job.posted_date).toLocaleDateString()}</p>
                  <p><strong>Type:</strong> {job.job_type}</p>
                  <p><strong>Salary:</strong> ₹{(job.salary_min / 100000).toFixed(1)}L</p>
                  <p><strong>Views:</strong> {job.views_count}</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium">View Applications</button>
                  <button className="px-4 py-2 border rounded text-sm">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Applications Pipeline</h2>
          <div className="flex gap-2 mb-4 flex-wrap">
            {['all', 'new', 'reviewing', 'selected'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1 rounded-full text-xs font-bold ${filterStatus === s ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>{s}</button>
            ))}
          </div>
          <div className="space-y-3">
            {applications.slice(0, 5).map(app => (
              <div key={app.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <p className="font-bold text-sm">{app.candidateName}</p>
                <p className="text-xs text-gray-600">{app.appliedFor}</p>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 px-2 py-1 bg-green-500 text-white rounded text-xs">✓</button>
                  <button className="flex-1 px-2 py-1 border border-red-500 text-red-500 rounded text-xs">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
