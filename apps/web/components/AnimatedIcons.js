'use client'

export function AnimatedHeartbeat({ className = '' }) {
  return (
    <svg className={`inline-block ${className}`} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <style>{`@keyframes hb { 0%, 100% { transform: scale(1); } 25% { transform: scale(1.2); } }`}</style>
      <path
        d="M50 85 Q30 70 20 55 Q10 40 15 30 Q20 20 30 20 Q40 20 50 35 Q60 20 70 20 Q80 20 85 30 Q90 40 80 55 Q70 70 50 85 Z"
        fill="currentColor"
        style={{ animation: 'hb 1s infinite' }}
      />
    </svg>
  )
}

export function AnimatedCheckmark({ className = '' }) {
  return (
    <svg className={`inline-block ${className}`} viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <style>{`@keyframes check { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }`}</style>
      <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M 15 25 L 22 32 L 35 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: 'check 0.5s ease-out forwards' }}
        strokeDasharray="40"
      />
    </svg>
  )
}

export function AnimatedX({ className = '' }) {
  return (
    <svg className={`inline-block ${className}`} viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="15" y1="15" x2="35" y2="35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="35" y1="15" x2="15" y2="35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function LoadingSpinner({ className = '' }) {
  return (
    <svg className={`inline-block animate-spin ${className}`} viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.2" />
      <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4 94.2" />
    </svg>
  )
}

export function EmptyState({ message = 'No results found' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <svg className="w-24 h-24 text-gray-300 mb-4" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <style>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }`}</style>
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ animation: 'float 3s ease-in-out infinite' }}
        />
      </svg>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  )
}

export function AnimatedDot({ className = '' }) {
  return (
    <svg className={`inline-block ${className}`} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <style>{`@keyframes pulse { 0%, 100% { r: 3; opacity: 1; } 50% { r: 5; opacity: 0.5; } }`}</style>
      <circle cx="10" cy="10" r="3" fill="currentColor" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
    </svg>
  )
}
