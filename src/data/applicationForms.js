/** Application form definitions for Work With Us routes. */

export const APPLICATION_FORMS = {
  fullTime: {
    formType: 'FullTime',
    path: '/apply-for-a-full-time-position',
    title: 'Apply Now!',
    subtitle: null,
    sheetTab: 'FullTime',
    fields: [
      {
        name: 'fullName',
        label: 'Full Name',
        type: 'text',
        placeholder: 'Enter your full Name',
        required: true,
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'johndoe@gmail.com',
        required: true,
      },
      {
        name: 'skillOverview',
        label:
          'Please provide a brief overview of your skill set and work experience',
        type: 'text',
        placeholder: '',
        required: true,
      },
      {
        name: 'roles',
        label:
          'Which positions or roles are you applying for or interested in applying for?',
        type: 'text',
        placeholder: '',
        required: true,
      },
      {
        name: 'linkedin',
        label: 'LinkedIn profile',
        type: 'url',
        placeholder: 'https://www.linkedin.com/in/',
        required: true,
      },
      {
        name: 'portfolio',
        label: 'Could you provide a link to your portfolio or resume?',
        type: 'url',
        placeholder: '',
        required: true,
      },
    ],
  },

  cofoundathon: {
    formType: 'Cofoundathon',
    path: '/apply-to-cofoundathon',
    title: 'Start Your Co-Foundathon Journey',
    subtitle:
      'Tell us a bit about yourself so we can evaluate your fit for the program and prepare your onboarding call.',
    sheetTab: 'Cofoundathon',
    fields: [
      {
        name: 'fullName',
        label: 'Full Name',
        type: 'text',
        placeholder: 'Enter your full Name',
        required: true,
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'johndoe@gmail.com',
        required: true,
      },
      {
        name: 'phone',
        label: 'Phone No.',
        type: 'tel',
        placeholder: 'Your Phone No.',
        required: true,
      },
      {
        name: 'linkedin',
        label: 'LinkedIn profile',
        type: 'url',
        placeholder: 'https://www.linkedin.com/in/',
        required: true,
      },
      {
        name: 'loomVideo',
        label:
          'Please record a Loom video and share the link, detailing everything we should know about you and your startup idea?',
        type: 'url',
        placeholder: '',
        required: true,
        help: 'Feel free to dive deep—this is open-ended for a reason! Just be sure to include your name, age, and location.',
      },
    ],
  },

  investor: {
    formType: 'Investor',
    path: '/investor-application',
    title: 'Become one of our Investors',
    subtitle: null,
    sheetTab: 'Investor',
    fields: [
      {
        name: 'investTarget',
        label:
          "Are you looking to apply to invest in Persist's Rolling Fund OR a specific portfolio company?",
        type: 'text',
        placeholder: '',
        required: true,
      },
      {
        name: 'investorClass',
        label: 'What class of investor best represents you?',
        type: 'text',
        placeholder: 'Angel Investor, Private Investor',
        required: true,
      },
      {
        name: 'fullName',
        label: 'Full name',
        type: 'text',
        placeholder: 'John Doe',
        required: true,
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'johndoe@gmail.com',
        required: true,
      },
      {
        name: 'linkedin',
        label: 'LinkedIn profile',
        type: 'url',
        placeholder: 'https://www.linkedin.com/in/',
        required: true,
      },
      {
        name: 'phone',
        label: 'What is your phone number?',
        type: 'tel',
        placeholder: 'Enter phone number',
        required: true,
      },
      {
        name: 'howFoundUs',
        label: 'How did you find us?',
        type: 'text',
        placeholder: '',
        required: true,
      },
    ],
  },
}

export const WORK_WITH_US_LINKS = [
  {
    label: 'Job Application',
    to: '/apply-for-a-full-time-position',
    formKey: 'fullTime',
  },
  {
    label: 'Co-Foundathon',
    to: '/apply-to-cofoundathon',
    formKey: 'cofoundathon',
  },
  {
    label: 'Investor Application',
    to: '/investor-application',
    formKey: 'investor',
  },
]

export function emptyFormState(formKey) {
  const def = APPLICATION_FORMS[formKey]
  if (!def) return {}
  return Object.fromEntries(def.fields.map((f) => [f.name, '']))
}
