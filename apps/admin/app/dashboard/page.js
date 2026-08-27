'use client'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard/stats')
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6">Loading...</div>
  if (!stats) return <div className="p-6">Error loading stats</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <p className="text-gray-500 text-sm">Total Users</p>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
          <p className="text-green-500 text-xs mt-1">+{stats.usersThisMonth} this month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <p className="text-gray-500 text-sm">Total Appointments</p>
          <p className="text-3xl font-bold">{stats.totalAppointments}</p>
          <p className="text-blue-500 text-xs mt-1">{stats.appointmentsThisMonth} this month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <p className="text-gray-500 text-sm">Active Doctors</p>
          <p className="text-3xl font-bold">{stats.activeDoctors}</p>
          <p className="text-yellow-500 text-xs mt-1">{stats.pendingDoctors} pending</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
          <p className="text-purple-500 text-xs mt-1">₹{(stats.revenueThisMonth || 0).toLocaleString()} this month</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Recent Users</h2>
          <div className="space-y-2">
            {stats.recentUsers?.map(u => (
              <div key={u.id} className="flex justify-between p-2 border-b text-sm">
                <span>{u.name}</span>
                <span className="text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Recent Appointments</h2>
          <div className="space-y-2">
            {stats.recentAppointments?.map(a => (
              <div key={a.id} className="flex justify-between p-2 border-b text-sm">
                <span className="truncate">{a.patientName} → {a.doctorName}</span>
                <span className="text-xs text-gray-500">{new Date(a.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
