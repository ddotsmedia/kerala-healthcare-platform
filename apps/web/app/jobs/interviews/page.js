'use client'
import { useEffect, useState } from 'react'

export default function InterviewScheduling() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInterview, setSelectedInterview] = useState(null)

  useEffect(() => {
    fetch('/api/jobs/interviews')
      .then(r => r.json())
      .then(data => {
        setInterviews(data || [])
        setLoading(false)
      })
  }, [])

  const getStatusBadge = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">My Interviews</h1>
      <p className="text-gray-600 mb-8">Track and prepare for your interviews</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-600 text-sm">Scheduled</p>
          <p className="text-3xl font-bold">{interviews.filter(i => i.status === 'scheduled').length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-3xl font-bold text-green-600">{interviews.filter(i => i.status === 'completed').length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-600 text-sm">Upcoming</p>
          <p className="text-3xl font-bold text-blue-600">{interviews.filter(i => new Date(i.interview_date) > new Date()).length}</p>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <p>No interviews scheduled yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map(interview => (
            <div key={interview.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3">
                  <h3 className="text-xl font-bold">{interview.job_title}</h3>
                  <p className="text-gray-600">{interview.company}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <p><strong>Interview Type:</strong> {interview.interview_type}</p>
                    <p><strong>Date:</strong> {new Date(interview.interview_date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {new Date(interview.interview_date).toLocaleTimeString()}</p>
                    {interview.rating && <p><strong>Rating:</strong> ⭐ {interview.rating}/5</p>}
                  </div>
                  {interview.notes && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                      <p className="font-medium mb-1">Notes:</p>
                      <p>{interview.notes}</p>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(interview.status)}`}>
                    {interview.status}
                  </span>
                </div>
                <div className="space-y-2">
                  {interview.interview_type === 'video' && interview.status === 'scheduled' && (
                    <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-bold">
                      📹 Join Interview
                    </button>
                  )}
                  <button className="w-full px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 text-sm font-medium">
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
