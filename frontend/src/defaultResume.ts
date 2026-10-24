import type { Resume } from './types'

// Sample data shown the first time you open the app.
export const defaultResume: Resume = {
  fullName: 'Your Name',
  title: 'Your Job Title',
  email: 'you@example.com',
  phone: '+91 00000 00000',
  location: 'City, Country',
  summary:
    'Write 2-3 lines about who you are, what you do well and what you are looking for.',
  skills: 'AWS, Linux, Python, Git',
  experience: [
    {
      id: 'exp-1',
      company: 'Company Name',
      role: 'Your Role',
      period: 'Jan 2022 - Present',
      bullets:
        'Describe an achievement with a number if you can\nDescribe another achievement',
    },
  ],
  education: [
    {
      id: 'edu-1',
      school: 'University Name',
      degree: 'Your Degree',
      period: '2018 - 2022',
    },
  ],
}
