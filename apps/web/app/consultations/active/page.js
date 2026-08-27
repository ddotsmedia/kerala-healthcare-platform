'use client'
import { useEffect, useState } from 'react'

export default function ActiveConsultation() {
  const [consultation, setConsultation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [roomReady, setRoomReady] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)

  useEffect(() => {
    const appointmentId = new URLSearchParams(window.location.search).get('id')
    if (!appointmentId) {
      alert('No appointment ID provided')
      return
    }

    fetch(`/api/appointments/${appointmentId}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setConsultation(d.data)
          initializeJitsi(d.data)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const initializeJitsi = (data) => {
    if (typeof window !== 'undefined' && window.JitsiMeetExternalAPI) {
      const domain = 'meet.jit.si'
      const options = {
        roomName: data.jitsi_room_id || `consultation-${data.id}`,
        width: '100%',
        height: '100%',
        parentNode: document.querySelector('#jitsi-container'),
        configOverwrite: {
          startAudioOnly: false,
          disableModeratorIndicator: true,
          startWithAudioMuted: false,
          startWithVideoMuted: false
        },
        interfaceConfigOverwrite: {
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_CHROME_EXTENSION_BANNER: false
        },
        userInfo: {
          displayName: data.patient_name || 'Patient'
        }
      }

      const api = new window.JitsiMeetExternalAPI(domain, options)

      api.addEventListener('videoConferenceJoined', () => {
        console.log('Video conference joined')
        setRoomReady(true)
      })

      api.addEventListener('readyToClose', () => {
        console.log('Ready to close')
        handleEndConsultation()
      })

      return () => api.dispose()
    } else {
      console.log('Jitsi not loaded, loading script...')
      const script = document.createElement('script')
      script.src = 'https://meet.jit.si/external_api.js'
      script.async = true
      document.body.appendChild(script)
    }
  }

  const handleEndConsultation = async () => {
    try {
      await fetch(`/api/video-consultations/${consultation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', ended_at: new Date().toISOString() })
      })
      alert('Consultation ended. Thank you!')
      window.location.href = '/health'
    } catch (error) {
      console.error('Error ending consultation:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full"></div>
          </div>
          <p className="text-white">Loading video consultation...</p>
        </div>
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <p className="text-xl">Consultation not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      <div id="jitsi-container" className="flex-1" />

      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4 flex justify-between items-center">
        <div className="text-white text-sm">
          <p className="font-medium">Dr. {consultation.doctor_name}</p>
          <p className="text-gray-400 text-xs">Consultation in progress</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`px-4 py-2 rounded font-medium transition ${
              audioEnabled
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {audioEnabled ? '🎤 Audio On' : '🔇 Audio Off'}
          </button>
          <button
            onClick={() => setVideoEnabled(!videoEnabled)}
            className={`px-4 py-2 rounded font-medium transition ${
              videoEnabled
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {videoEnabled ? '📹 Video On' : '📹 Video Off'}
          </button>
          <button
            onClick={handleEndConsultation}
            className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition"
          >
            📞 End Call
          </button>
        </div>
      </div>
    </div>
  )
}
