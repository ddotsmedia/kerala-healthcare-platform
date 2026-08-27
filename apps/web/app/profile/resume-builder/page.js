'use client'
import { useState } from 'react'

export default function ResumeBuilder() {
  const [step, setStep] = useState(1)
  const [resume, setResume] = useState({
    fullName: '',
    email: '',
    phone: '',
    summary: '',
    education: [],
    experience: [],
    skills: [],
    certifications: []
  })
  const [template, setTemplate] = useState('modern')
  const [aiSuggestions, setAiSuggestions] = useState([])

  const handleAddExperience = () => {
    setResume({...resume, experience: [...resume.experience, {
      jobTitle: '', company: '', startDate: '', endDate: '', description: ''
    }]})
  }

  const handleAddEducation = () => {
    setResume({...resume, education: [...resume.education, {
      degree: '', institution: '', year: '', specialization: ''
    }]})
  }

  const handleGetAISuggestions = () => {
    fetch('/api/resume/ai-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resume)
    }).then(r => r.json()).then(data => setAiSuggestions(data.suggestions || []))
  }

  const handleDownloadPDF = () => {
    fetch('/api/resume/download', {
      method: 'POST',
      body: JSON.stringify(resume)
    }).then(r => r.blob()).then(blob => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resume.fullName}_Resume.pdf`
      a.click()
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">Resume Builder</h1>
      <p className="text-gray-600 mb-8">Create a professional resume with AI assistance</p>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map(s => (
              <button key={s} onClick={() => setStep(s)} className={`flex-1 mx-1 py-3 rounded-lg font-bold ${s <= step ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                {s === 1 && '📋 Personal'} {s === 2 && '🎓 Education'} {s === 3 && '💼 Experience'} {s === 4 && '🏆 Skills'}
              </button>
            ))}
          </div>

          {step === 1 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg space-y-4">
              <h2 className="text-2xl font-bold">Personal Information</h2>
              <input type="text" placeholder="Full Name" value={resume.fullName} onChange={(e) => setResume({...resume, fullName: e.target.value})} className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
              <input type="email" placeholder="Email" value={resume.email} onChange={(e) => setResume({...resume, email: e.target.value})} className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
              <input type="tel" placeholder="Phone" value={resume.phone} onChange={(e) => setResume({...resume, phone: e.target.value})} className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
              <textarea placeholder="Professional Summary" value={resume.summary} onChange={(e) => setResume({...resume, summary: e.target.value})} rows="4" className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
              <button onClick={() => setStep(2)} className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-bold">Next →</button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg space-y-4">
              <h2 className="text-2xl font-bold">Education</h2>
              {resume.education.map((edu, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-2">
                  <input type="text" placeholder="Degree" value={edu.degree} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 text-sm" />
                  <input type="text" placeholder="Institution" value={edu.institution} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 text-sm" />
                  <input type="text" placeholder="Year" value={edu.year} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 text-sm" />
                </div>
              ))}
              <button onClick={handleAddEducation} className="w-full px-4 py-2 border border-blue-500 text-blue-500 rounded-lg">+ Add Education</button>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 px-6 py-3 border border-blue-500 rounded-lg">← Back</button>
                <button onClick={() => setStep(3)} className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-bold">Next →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg space-y-4">
              <h2 className="text-2xl font-bold">Experience</h2>
              {resume.experience.map((exp, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-2">
                  <input type="text" placeholder="Job Title" value={exp.jobTitle} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 text-sm" />
                  <input type="text" placeholder="Company" value={exp.company} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 text-sm" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={exp.startDate} className="px-4 py-2 border rounded-lg dark:bg-gray-700 text-sm" />
                    <input type="date" value={exp.endDate} className="px-4 py-2 border rounded-lg dark:bg-gray-700 text-sm" />
                  </div>
                  <textarea placeholder="Description" value={exp.description} rows="2" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 text-sm" />
                </div>
              ))}
              <button onClick={handleAddExperience} className="w-full px-4 py-2 border border-blue-500 text-blue-500 rounded-lg">+ Add Experience</button>
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex-1 px-6 py-3 border border-blue-500 rounded-lg">← Back</button>
                <button onClick={() => setStep(4)} className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-bold">Next →</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg space-y-4">
              <h2 className="text-2xl font-bold">Skills & Achievements</h2>
              <input type="text" placeholder="Skills (comma separated)" value={resume.skills.join(', ')} onChange={(e) => setResume({...resume, skills: e.target.value.split(',').map(s => s.trim())})} className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
              <button onClick={handleGetAISuggestions} className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg font-bold">✨ Get AI Suggestions</button>
              {aiSuggestions.length > 0 && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                  <h3 className="font-bold mb-2">💡 Suggestions:</h3>
                  <ul className="space-y-1 text-sm">{aiSuggestions.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setStep(3)} className="flex-1 px-6 py-3 border border-blue-500 rounded-lg">← Back</button>
                <button onClick={handleDownloadPDF} className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-bold">📥 Download PDF</button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-bold mb-3">Template</h3>
            {['modern', 'professional', 'creative', 'minimal'].map(t => (
              <button key={t} onClick={() => setTemplate(t)} className={`w-full px-4 py-2 rounded-lg mb-2 capitalize font-medium ${template === t ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
