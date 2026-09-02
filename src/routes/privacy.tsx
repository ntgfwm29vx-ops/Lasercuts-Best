import { Link, createFileRoute } from '@tanstack/react-router'
import {
  BUSINESS_EMAIL,
  BUSINESS_NAME,
  BUSINESS_PHONE,
  DEFAULT_SITE_URL,
} from '../../businessConfig'
import { SiteMenu } from '../components/SiteMenu'

const lastUpdated = 'September 1, 2026'

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: `Privacy Policy | ${BUSINESS_NAME}` },
      {
        name: 'description',
        content: `Read the ${BUSINESS_NAME} privacy policy for quote requests, advertising forms, and website visitors.`,
      },
    ],
    links: [{ rel: 'canonical', href: new URL('/privacy', DEFAULT_SITE_URL).toString() }],
  }),
  component: PrivacyPolicy,
})

function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label={`Back to ${BUSINESS_NAME} home`}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-600 font-black italic text-white">L</span>
            <span className="truncate text-base font-black uppercase italic tracking-tighter sm:text-xl">{BUSINESS_NAME}</span>
          </Link>
          <SiteMenu />
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-green-700">Legal</p>
        <h1 className="mt-3 text-4xl font-black uppercase italic tracking-tighter sm:text-6xl">Privacy Policy</h1>
        <p className="mt-4 text-sm font-bold text-gray-500">Last updated: {lastUpdated}</p>

        <div className="mt-10 space-y-9 rounded-[28px] border border-gray-200 bg-white p-6 text-base font-medium leading-relaxed text-gray-700 shadow-sm sm:p-10">
          <section>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Information We Collect</h2>
            <p className="mt-3">When you request a quote, contact us, or submit a lead form through our website or advertising, we may collect your name, email address, phone number, service address, requested service, and message.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">How We Use Information</h2>
            <p className="mt-3">We use this information to respond to your request, prepare or provide lawn-mowing services, communicate about your quote, improve our website and advertising, and prevent spam or misuse.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Advertising And Analytics</h2>
            <p className="mt-3">We may use advertising and measurement tools, including Meta technologies, to understand ad performance and show relevant advertising. These providers may use cookies or similar technologies according to their own privacy policies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Sharing Information</h2>
            <p className="mt-3">We do not sell your personal information. We only share information with service providers that help operate our website, manage quote requests, deliver communications, or measure advertising, when necessary for those purposes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Data Retention And Security</h2>
            <p className="mt-3">We keep quote and contact information only as long as reasonably needed for customer service, records, and business operations. We use reasonable safeguards, but no online system can guarantee complete security.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Your Choices</h2>
            <p className="mt-3">You may ask us to update or delete the information you provided, subject to legal or operational recordkeeping needs. You can also opt out of marketing messages by contacting us.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Contact Us</h2>
            <p className="mt-3">For privacy questions, contact {BUSINESS_NAME} at <a className="font-bold text-green-700 underline decoration-green-300 underline-offset-4" href={`mailto:${BUSINESS_EMAIL}`}>{BUSINESS_EMAIL}</a> or <a className="font-bold text-green-700 underline decoration-green-300 underline-offset-4" href={`tel:${BUSINESS_PHONE.replace(/-/g, '')}`}>{BUSINESS_PHONE}</a>.</p>
          </section>
        </div>

        <Link to="/" className="mt-8 inline-flex rounded-2xl bg-green-600 px-6 py-4 text-sm font-black uppercase tracking-tight text-white transition hover:bg-green-700">
          Back To Home
        </Link>
      </article>
    </main>
  )
}
