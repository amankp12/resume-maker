import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import ResumeForm from './components/ResumeForm'
import ResumePreview from './components/ResumePreview'
import { defaultResume } from './defaultResume'
import { exportResume, importResume, loadResume, saveResume } from './storage'
import type { Resume } from './types'

export default function App() {
  // The whole resume lives in this one piece of state.
  const [resume, setResume] = useState<Resume>(loadResume)
  const fileInput = useRef<HTMLInputElement>(null)

  // Save to the browser every time the resume changes.
  useEffect(() => {
    saveResume(resume)
  }, [resume])

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setResume(await importResume(file))
    } catch {
      alert('That file is not a valid resume JSON file.')
    }
    e.target.value = '' // allow choosing the same file again
  }

  function handleReset() {
    if (confirm('Reset everything back to the sample resume?')) {
      setResume(defaultResume)
    }
  }

  const buttonClass =
    'rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50'

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar: hidden when printing */}
      <header className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3 shadow print:hidden">
        <h1 className="text-xl font-bold">Resume Maker by Aman Kumar</h1>
        <div className="flex flex-wrap gap-2">
          <button className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
          <button className={buttonClass} onClick={() => exportResume(resume)}>
            Export JSON
          </button>
          <button className={buttonClass} onClick={() => fileInput.current?.click()}>
            Import JSON
          </button>
          <button className={buttonClass} onClick={handleReset}>
            Reset
          </button>
          <input ref={fileInput} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-2 print:block print:max-w-none print:p-0">
        {/* Form: hidden when printing */}
        <div className="print:hidden">
          <ResumeForm resume={resume} onChange={setResume} />
        </div>
        <ResumePreview resume={resume} />
      </main>
    </div>
  )
}
