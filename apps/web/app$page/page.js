'use client'
import { useState, useEffect } from 'react'
export default function $(echo $page | sed 's/-//g' | awk '{print toupper(substr($0,1,1))substr($0,2)}') {
  const [items, setItems] = useState([])
  useEffect(() => { fetch(\`/api/$page\`).then(r => r.json()).then(setItems) }, [])
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold capitalize">$(echo $page | sed 's/-/ /g')</h1>
      <div className="grid grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border space-y-3">
            <div className="text-4xl">{item.emoji || '📦'}</div>
            <h3 className="font-bold">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 font-medium">Select</button>
          </div>
        ))}
      </div>
    </div>
  )
}
