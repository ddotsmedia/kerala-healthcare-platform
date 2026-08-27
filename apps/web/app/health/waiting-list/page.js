'use client'
import { useState, useEffect } from 'react'

export default function WaitingList() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/health/waiting-list')
      .then(r => r.json())
      .then(d => setList(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  const getStatusBadge = (status) => {
    const styles = {
      waiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
      notified: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
    }
    return styles[status] || styles.waiting
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Appointment Waiting List</h1>
        <p className="text-gray-600 text-sm mt-1">Queue position updates every 15 minutes</p>
      </div>

      {list.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
          <p className="text-gray-600">You're not on any waiting lists</p>
          <p className="text-gray-500 text-sm mt-1">Join a waiting list when a doctor's slots are full</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map(entry => (
            <div key={entry.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <p className="font-bold text-lg">Dr. {entry.doctor_name}</p>
                  <p className="text-gray-600 text-sm">
                    Appointment: {new Date(entry.scheduled_at).toLocaleDateString('en-IN')} at {new Date(entry.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(entry.status)}`}>
                  {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 p-4 rounded">
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase">Your Position</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">#{entry.queue_position}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 p-4 rounded">
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase">Ahead of You</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{entry.total_ahead - 1}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 p-4 rounded">
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase">Joined</p>
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium mt-1">
                    {new Date(entry.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 font-medium text-sm transition">
                  📍 Get Notifications
                </button>
                <button className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/40 font-medium text-sm transition">
                  Leave Queue
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
