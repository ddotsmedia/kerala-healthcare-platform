'use client'
import { useState, useEffect } from 'react'
export default function Challenges() {
  const [challenges, setChallenges] = useState([])
  useEffect(() => { fetch('/api/health/challenges').then(r => r.json()).then(setChallenges) }, [])
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Health Challenges</h1>
      <div className="grid grid-cols-3 gap-4">
        {challenges.map(c => (
          <div key={c.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border space-y-3">
            <div className="text-4xl">{c.emoji}</div>
            <h3 className="font-bold">{c.name}</h3>
            <p className="text-xs text-gray-600">{c.description}</p>
            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">Join Challenge</button>
          </div>
        ))}
      </div>
    </div>
  )
}
