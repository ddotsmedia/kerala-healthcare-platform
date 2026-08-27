'use client'

import { useEffect, useState } from 'react'

export function UserLevelBadge() {
  const [gamif, setGamif] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/gamification')
      .then((r) => r.json())
      .then(setGamif)
      .finally(() => setLoading(false))
  }, [])

  if (loading || !gamif) return null

  const levels = ['🥉 Bronze', '🥈 Silver', '🥇 Gold', '💎 Platinum', '👑 Diamond'];
  const levelLabel = levels[Math.min(gamif.level - 1, levels.length - 1)] || 'Unknown';
  const nextLevelPoints = gamif.level * 1000 + 1000;
  const progress = ((gamif.points % 1000) / 1000) * 100;

  return (
    <div className="text-center p-4 glass rounded-lg bg-white dark:bg-gray-800 animate-slideInUp">
      <div className="text-4xl mb-2">{levelLabel.split(' ')[0]}</div>
      <p className="font-bold text-gray-900 dark:text-white">{levelLabel}</p>
      <p className="text-sm text-gray-500">{gamif.points} / {nextLevelPoints} points</p>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2 overflow-hidden">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">🔥 Streak: {gamif.current_streak} days</p>
    </div>
  )
}
