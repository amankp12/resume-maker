import type { Resume } from './types'
import { defaultResume } from './defaultResume'

const KEY = 'resume-maker:v1'

// Read the saved resume from the browser. Fall back to the sample data.
export function loadResume(): Resume {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Resume
  } catch {
    // ignore broken data and use the default
  }
  return defaultResume
}

// Save the resume in the browser (runs after every change).
export function saveResume(resume: Resume): void {
  localStorage.setItem(KEY, JSON.stringify(resume))
}

// Download the resume as a .json file.
export function exportResume(resume: Resume): void {
  const blob = new Blob([JSON.stringify(resume, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'resume.json'
  link.click()
  URL.revokeObjectURL(url)
}

// Read a .json file chosen by the user and check it looks like a resume.
export async function importResume(file: File): Promise<Resume> {
  const data = JSON.parse(await file.text())
  const looksValid =
    typeof data.fullName === 'string' &&
    Array.isArray(data.experience) &&
    Array.isArray(data.education)
  if (!looksValid) throw new Error('Not a resume file')
  return data as Resume
}
