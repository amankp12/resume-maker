import type { Resume } from '../types'

// Turn "a, b, c" into ["a", "b", "c"] and drop empty items.
const splitCommas = (text: string) =>
  text.split(',').map((s) => s.trim()).filter(Boolean)

// Turn multi-line text into a list of non-empty lines.
const splitLines = (text: string) =>
  text.split('\n').map((s) => s.trim()).filter(Boolean)

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mt-5 mb-2 border-b border-gray-400 pb-1 text-sm font-bold tracking-wider text-gray-800 uppercase">
      {children}
    </h2>
  )
}

export default function ResumePreview({ resume }: { resume: Resume }) {
  const contact = [resume.email, resume.phone, resume.location].filter(Boolean)
  const skills = splitCommas(resume.skills)

  return (
    <article className="mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white p-10 text-black shadow print:min-h-0 print:max-w-none print:p-0 print:shadow-none">
      <header className="text-center">
        <h1 className="text-3xl font-bold">{resume.fullName}</h1>
        {resume.title && <p className="text-lg text-gray-700">{resume.title}</p>}
        {contact.length > 0 && (
          <p className="mt-1 text-sm text-gray-600">{contact.join('  |  ')}</p>
        )}
      </header>

      {resume.summary.trim() && (
        <>
          <SectionTitle>Summary</SectionTitle>
          <p className="text-sm leading-relaxed">{resume.summary}</p>
        </>
      )}

      {skills.length > 0 && (
        <>
          <SectionTitle>Skills</SectionTitle>
          <p className="text-sm">{skills.join('  •  ')}</p>
        </>
      )}

      {resume.experience.length > 0 && (
        <>
          <SectionTitle>Experience</SectionTitle>
          {resume.experience.map((exp) => (
            <div key={exp.id} className="mb-3 break-inside-avoid">
              <div className="flex justify-between gap-4">
                <p className="text-sm font-semibold">
                  {exp.role}
                  {exp.role && exp.company ? ', ' : ''}
                  {exp.company}
                </p>
                <p className="text-sm whitespace-nowrap text-gray-600">{exp.period}</p>
              </div>
              <ul className="mt-1 list-disc pl-5 text-sm leading-relaxed">
                {splitLines(exp.bullets).map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}

      {resume.education.length > 0 && (
        <>
          <SectionTitle>Education</SectionTitle>
          {resume.education.map((edu) => (
            <div key={edu.id} className="mb-2 flex justify-between gap-4 break-inside-avoid">
              <p className="text-sm">
                <span className="font-semibold">{edu.degree}</span>
                {edu.degree && edu.school ? ', ' : ''}
                {edu.school}
              </p>
              <p className="text-sm whitespace-nowrap text-gray-600">{edu.period}</p>
            </div>
          ))}
        </>
      )}
    </article>
  )
}
