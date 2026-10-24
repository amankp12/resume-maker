// The shape of our resume data. Everything in the app uses these types.

export interface Experience {
  id: string
  company: string
  role: string
  period: string // e.g. "Jan 2022 - Present"
  bullets: string // one achievement per line
}

export interface Education {
  id: string
  school: string
  degree: string
  period: string
}

export interface Resume {
  fullName: string
  title: string // e.g. "Systems Engineer"
  email: string
  phone: string
  location: string
  summary: string
  skills: string // comma separated, e.g. "AWS, Linux, Python"
  experience: Experience[]
  education: Education[]
}
