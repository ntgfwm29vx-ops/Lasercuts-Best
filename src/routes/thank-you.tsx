import { createFileRoute, Link } from '@tanstack/react-router'
import { BUSINESS_EMAIL, BUSINESS_PHONE } from '../../businessConfig'

export const Route = createFileRoute('/thank-you')({
  head: () => ({
    meta: [
      { title: 'Thank You | Laser Cuts' },
      {
        name: 'description',
        content: 'Thank you for requesting a Laser Cuts lawn care quote.',
      },
    ],
  }),
  component: ThankYou,
})

function ThankYou() {
  return (
    <div className="min-h-screen bg-green-600 px-4 py-24 text-white">
      <div className="mx-auto max-w-3xl rounded-[40px] border-b-[12px] border-green-800 bg-white p-12 text-center text-gray-900 shadow-2xl">
        <div className="mb-6 text-7xl">✅</div>
        <h1 className="mb-4 text-5xl font-black uppercase italic tracking-tighter">
          Thank You!
        </h1>
        <p className="mb-10 text-xl font-bold text-gray-600">
          Your quote request was sent. Trey will get back to you shortly.
        </p>

        <div className="mb-10 space-y-3 text-lg font-bold text-gray-700">
          <p>Call or text: {BUSINESS_PHONE}</p>
          <p>Email: {BUSINESS_EMAIL}</p>
        </div>

        <Link
          to="/"
          className="inline-block rounded-2xl bg-green-600 px-10 py-5 text-xl font-black uppercase tracking-tighter text-white shadow-xl hover:bg-green-700"
        >
          Back To Home
        </Link>
      </div>
    </div>
  )
}
