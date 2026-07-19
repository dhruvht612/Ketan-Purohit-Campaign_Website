import LegalPage from './LegalPage.jsx'

const SECTIONS = [
  {
    heading: 'What we collect',
    body: [
      'When you volunteer, donate, or contact the campaign, we collect the information you choose to provide — such as your name, email, phone number, and neighbourhood. We only ask for what we need to respond to you and coordinate campaign activities.',
    ],
  },
  {
    heading: 'How we use it',
    body: [
      'Your information is used to follow up on your request, keep you informed about the campaign, and meet our obligations under Ontario elections law. We do not sell your personal information.',
    ],
  },
  {
    heading: 'Your choices',
    body: [
      'You can ask us to update or delete your information at any time, or unsubscribe from campaign updates using the link in any email. Contact us and we’ll take care of it promptly.',
    ],
  },
]

export default function Privacy() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Privacy Policy"
      lede="How the Ketan Purohit campaign handles your personal information. (Placeholder text — replace with your final policy.)"
      sections={SECTIONS}
    />
  )
}
