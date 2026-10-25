import type { Resume } from './types'

// The API lives on the same address as the website, under /api.
const API_URL = '/api/resume'

// Where the secret write key is remembered in this browser.
const KEY_STORAGE = 'resume-maker:write-key'

export class WrongKeyError extends Error {}

export function getWriteKey(): string | null {
  return localStorage.getItem(KEY_STORAGE)
}

export function rememberWriteKey(key: string): void {
  localStorage.setItem(KEY_STORAGE, key)
}

export function forgetWriteKey(): void {
  localStorage.removeItem(KEY_STORAGE)
}

// Ask the API for the saved resume. Returns null if nothing is saved yet.
export async function loadFromCloud(): Promise<Resume | null> {
  const response = await fetch(API_URL)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Load failed (error ${response.status})`)

  const data: unknown = await response.json()
  if (typeof (data as { fullName?: unknown })?.fullName !== 'string') {
    throw new Error('The cloud data does not look like a resume')
  }
  return data as Resume
}

// Send the resume to the API. The write key proves it is really you.
export async function saveToCloud(resume: Resume, writeKey: string): Promise<void> {
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      'x-write-key': writeKey,
    },
    body: JSON.stringify(resume),
  })
  if (response.status === 401) throw new WrongKeyError('Wrong write key')
  if (!response.ok) throw new Error(`Save failed (error ${response.status})`)
}