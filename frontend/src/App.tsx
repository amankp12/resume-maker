import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import ResumeForm from './components/ResumeForm'
import ResumePreview from './components/ResumePreview'
import {
  WrongKeyError,
  forgetWriteKey,
  getWriteKey,
  loadFromCloud,
  rememberWriteKey,
  saveToCloud,
} from './api'
import { defaultResume } from './defaultResume'
import { exportResume, importResume, loadResume, saveResume } from './storage'
import type { Resume } from './types'

export default function App() {
  // The whole resume lives in this one piece of state.
  const [resume, setResume] = useState<Resume>(loadResume)
  // A short message shown under the top bar ("Saved to cloud", errors...).
  const [status, setStatus] = useState('')
  // True while a cloud request is running, so buttons can be disabled.
  const [busy, setBusy] = useState(false)
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

  async function handleLoadFromCloud() {
    if (!confirm('Replace what is on screen with the version saved in the cloud?')) return
    setBusy(true)
    setStatus('Loading from the cloud...')
    try {
      const cloudResume = await loadFromCloud()
      if (cloudResume) {
        setResume(cloudResume)
        setStatus('Loaded from the cloud.')
      } else {
        setStatus('Nothing is saved in the cloud yet.')
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Load failed.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSaveToCloud() {
    // Use the remembered key, or ask for it the first time.
    let key = getWriteKey()
    if (!key) {
      key = prompt('Enter your write key (it is remembered in this browser only):')
      if (!key) return // cancelled
    }

    setBusy(true)
    setStatus('Saving to the cloud...')
    try {
      await saveToCloud(resume, key)
      rememberWriteKey(key)
      setStatus(`Saved to the cloud at ${new Date().toLocaleTimeString()}.`)
    } catch (error) {
      if (error instanceof WrongKeyError) {
        forgetWriteKey()
        setStatus('Wrong write key. Click "Save to cloud" to try again.')
      } else {
        setStatus(error instanceof Error ? error.message : 'Save failed.')
      }
    } finally {
      setBusy(false)
    }
  }

  const buttonClass =
    'rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50'

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar: hidden when printing */}
      <header className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3 shadow print:hidden">
        <h1 className="text-xl font-bold">Resume Maker</h1>
        <div className="flex flex-wrap gap-2">
          <button className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
          <button className={buttonClass} onClick={handleLoadFromCloud} disabled={busy}>
            Load from cloud
          </button>
          <button className={buttonClass} onClick={handleSaveToCloud} disabled={busy}>
            Save to cloud
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

      {status && (
        <p className="px-4 pt-3 text-center text-sm text-gray-700 print:hidden">{status}</p>
      )}

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
