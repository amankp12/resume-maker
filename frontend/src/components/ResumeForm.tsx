import type { Education, Experience, Resume } from '../types'

interface Props {
  resume: Resume
  onChange: (resume: Resume) => void
}

const inputClass =
  'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none'

// A label + input (or textarea) used for every field in the form.
function Field(props: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  rows?: number
  placeholder?: string
}) {
  const { label, value, onChange, multiline, rows = 3, placeholder } = props
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </span>
      {multiline ? (
        <textarea
          className={inputClass}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={inputClass}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  )
}

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg bg-white p-4 shadow">
      <h2 className="text-lg font-semibold">{props.title}</h2>
      {props.children}
    </section>
  )
}

export default function ResumeForm({ resume, onChange }: Props) {
  // Change one top-level field and tell the parent about the new resume.
  const set = <K extends keyof Resume>(key: K, value: Resume[K]) =>
    onChange({ ...resume, [key]: value })

  // ----- Experience -----
  const updateExperience = (id: string, patch: Partial<Experience>) =>
    set(
      'experience',
      resume.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    )
  const addExperience = () =>
    set('experience', [
      ...resume.experience,
      { id: crypto.randomUUID(), company: '', role: '', period: '', bullets: '' },
    ])
  const removeExperience = (id: string) =>
    set(
      'experience',
      resume.experience.filter((e) => e.id !== id),
    )

  // ----- Education -----
  const updateEducation = (id: string, patch: Partial<Education>) =>
    set(
      'education',
      resume.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    )
  const addEducation = () =>
    set('education', [
      ...resume.education,
      { id: crypto.randomUUID(), school: '', degree: '', period: '' },
    ])
  const removeEducation = (id: string) =>
    set(
      'education',
      resume.education.filter((e) => e.id !== id),
    )

  return (
    <div className="space-y-4">
      <Card title="Personal details">
        <Field label="Full name" value={resume.fullName} onChange={(v) => set('fullName', v)} />
        <Field label="Job title" value={resume.title} onChange={(v) => set('title', v)} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Email" value={resume.email} onChange={(v) => set('email', v)} />
          <Field label="Phone" value={resume.phone} onChange={(v) => set('phone', v)} />
          <Field label="Location" value={resume.location} onChange={(v) => set('location', v)} />
        </div>
      </Card>

      <Card title="Summary">
        <Field label="About you" multiline value={resume.summary} onChange={(v) => set('summary', v)} />
      </Card>

      <Card title="Skills">
        <Field
          label="Separate skills with commas"
          value={resume.skills}
          onChange={(v) => set('skills', v)}
        />
      </Card>

      <Card title="Experience">
        {resume.experience.map((exp) => (
          <div key={exp.id} className="space-y-3 rounded border border-gray-200 p-3">
            <Field label="Company" value={exp.company} onChange={(v) => updateExperience(exp.id, { company: v })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Role" value={exp.role} onChange={(v) => updateExperience(exp.id, { role: v })} />
              <Field label="Period" value={exp.period} onChange={(v) => updateExperience(exp.id, { period: v })} />
            </div>
            <Field
              label="Achievements (one per line)"
              multiline
              rows={4}
              value={exp.bullets}
              onChange={(v) => updateExperience(exp.id, { bullets: v })}
            />
            <button
              type="button"
              onClick={() => removeExperience(exp.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove this job
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addExperience}
          className="rounded bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-700"
        >
          + Add job
        </button>
      </Card>

      <Card title="Education">
        {resume.education.map((edu) => (
          <div key={edu.id} className="space-y-3 rounded border border-gray-200 p-3">
            <Field label="School / University" value={edu.school} onChange={(v) => updateEducation(edu.id, { school: v })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Degree" value={edu.degree} onChange={(v) => updateEducation(edu.id, { degree: v })} />
              <Field label="Period" value={edu.period} onChange={(v) => updateEducation(edu.id, { period: v })} />
            </div>
            <button
              type="button"
              onClick={() => removeEducation(edu.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove this entry
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addEducation}
          className="rounded bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-700"
        >
          + Add education
        </button>
      </Card>
    </div>
  )
}
