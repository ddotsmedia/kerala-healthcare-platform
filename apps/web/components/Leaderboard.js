'use client'

import { useEffect, useState } from 'react'

export function Leaderboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard?limit=10')
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6 text-center text-gray-500">Loading leaderboard...</div>
  if (users.length === 0) return null

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg glass space-y-3">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">🏆 Top Players</h3>
      <div className="space-y-2">
        {users.map((u, i) => (
          <div key={u.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            <div className="flex items-center gap-3">
              <span className={`text-xl font-bold ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                <p className="text-xs text-gray-500">Level {u.level}</p>
              </div>
            </div>
            <p className="font-bold text-blue-500">{u.points} pts</p>
          </div>
        ))}
      </div>
    </div>
  )
}
