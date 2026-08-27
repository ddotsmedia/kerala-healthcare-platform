'use client'
import { useState, useEffect } from 'react'

export default function Challenges() {
  const [challenges, setChallenges] = useState([])
  const [joined, setJoined] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(null)

  useEffect(() => {
    fetch('/api/health/challenges')
      .then(r => r.json())
      .then(d => setChallenges(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  const joinChallenge = async (challengeId, challengeName, rewardPoints) => {
    setJoining(challengeId)
    try {
      const res = await fetch('/api/health/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge_id: challengeId })
      })
      if (res.ok) {
        setJoined(new Set([...joined, challengeId]))
        alert(`🎉 Joined "${challengeName}"! Earn ${rewardPoints} points!`)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to join challenge')
      }
    } finally {
      setJoining(null)
    }
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🏃 Health Challenges</h1>
        <p className="text-gray-600 text-sm mt-1">Complete challenges to earn points and unlock rewards</p>
      </div>

      {challenges.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
          <p className="text-gray-600">No active challenges at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map(c => (
            <div
              key={c.id}
              className={`rounded-lg border transition transform hover:scale-105 ${
                joined.has(c.id)
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-5xl">{c.emoji}</div>
                  {joined.has(c.id) && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">✓ Joined</span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-lg">{c.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{c.description}</p>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-3 rounded flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Reward</p>
                    <p className="font-bold text-lg text-orange-600 dark:text-orange-400">{c.reward_points} pts</p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Duration: {c.target_days} days
                </div>

                <button
                  onClick={() => joinChallenge(c.id, c.name, c.reward_points)}
                  disabled={joined.has(c.id) || joining === c.id}
                  className={`w-full px-4 py-2 rounded font-medium text-sm transition ${
                    joined.has(c.id)
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {joining === c.id ? '⏳ Joining...' : joined.has(c.id) ? '✓ Joined!' : '🎯 Join Challenge'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-bold text-blue-900 dark:text-blue-100">💡 Tip</h3>
        <p className="text-blue-800 dark:text-blue-200 text-sm mt-2">
          Join multiple challenges to earn bonus multiplier rewards. Share your progress with friends to unlock social achievements!
        </p>
      </div>
    </div>
  )
}
