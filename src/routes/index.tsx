import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useEffect, useRef, useState } from 'react'
import { api } from '../../convex/_generated/api'
import {
  BASE_CUT_PRICE,
  BUSINESS_EMAIL,
  BUSINESS_LOCATION,
  BUSINESS_NAME,
  BUSINESS_PHONE,
  BUSINESS_REGION,
  DEFAULT_SITE_URL,
  NEW_CUSTOMER_PRICE,
  SITE_PATHS,
} from '../../businessConfig'
import { quoteServiceValues } from '../../quoteOptions'
import { parseQuoteSubmission } from '../../quoteValidation'
import { SiteMenu } from '../components/SiteMenu'
import { galleryPhotos } from '../galleryPhotos'
import type { FormEvent } from 'react'

const siteUrl = import.meta.env.VITE_SITE_URL ?? DEFAULT_SITE_URL
const canonicalUrl = new URL(SITE_PATHS.home, siteUrl).toString()
const ogImageUrl = new URL(SITE_PATHS.ogImage, siteUrl).toString()
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  additionalType: 'https://schema.org/LawnCare',
  name: BUSINESS_NAME,
  url: siteUrl,
  image: ogImageUrl,
  areaServed: BUSINESS_REGION,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Fort Wayne',
    addressRegion: 'IN',
    addressCountry: 'US',
  },
  telephone: BUSINESS_PHONE,
  email: BUSINESS_EMAIL,
  description:
    'Mowing-first residential lawn care with optional edging, weed control, mulch, and cleanup services in Fort Wayne and surrounding areas.',
  priceRange: `${NEW_CUSTOMER_PRICE}-${BASE_CUT_PRICE}+`,
  knowsAbout: [
    'Lawn mowing',
    'String trimming',
    'Lawn edging',
    'Weed control',
    'Mulch installation',
    'Yard cleanup',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Laser Cuts Mowing Services',
    itemListElement: [
      'Lawn mowing',
      'String trimming',
      'Edging',
      'Weed spraying',
      'Mulch installation',
      'Yard cleanup',
    ].map((name) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name,
      },
    })),
  },
}

const featuredReviews = [
  {
    name: 'Michael bean',
    review:
      'Absolutely impressed with the work! The team was professional, on time, and paid attention to every detail. They transformed the yard and made everything look clean and polished. Great communication, fair pricing, and you can tell they really care about the quality of their work. I’d definitely recommend them to anyone looking for reliable landscaping services!',
  },
  {
    name: 'Doreen Adjei',
    review:
      'I wasn’t sure what to expect hiring a high schooler to take care of my lawn, but Trey and his team really impressed me. His attention to detail stood out right away. He was also very respectful, easy to communicate with, and made sure to do exactly what I asked (and even went a bit beyond that). Overall, a great experience, and I’d definitely recommend him to others.',
  },
  {
    name: 'Micah Silveus',
    review:
      'Very good and fast people. They did it clean and quick and were a nice group.',
  },
] as const

type MowingPackage = {
  service: string
  title: string
  price: string
  description: string
  details: string
  features: ReadonlyArray<string>
  badge?: string
  note?: string
  buttonLabel: string
}

const mowingPackages: ReadonlyArray<MowingPackage> = [
  {
    service: 'Basic Cut',
    title: 'Basic Cut',
    price: '$45',
    description: 'A reliable, clean cut for regularly maintained lawns.',
    details: 'Best for lawns that are cut regularly and only need routine mowing, weed eating, mulching, and blow-off.',
    features: [
      'Clean, reliable lawn mowing',
      'Weed eating around the property',
      'Grass clippings mulched when conditions allow',
      'Driveway and sidewalk blow-off',
    ],
    buttonLabel: 'Select Basic',
  },
  {
    service: 'Complete Cut',
    title: 'Complete Cut',
    price: '$50',
    description: 'Our most popular option for a complete, sharp regular-maintenance finish.',
    details: 'Choose Complete for everything in Basic Cut plus precise blade edging and more detailed cleanup around the property.',
    features: [
      'Everything in Basic Cut',
      'More detailed weed eating around landscaping, fences, and obstacles',
      'Complete and precise blade edging',
      'Detailed cleanup for a polished finish',
    ],
    badge: 'Most Popular',
    buttonLabel: 'Select Complete',
  },
] as const

const serviceGroups = [
  {
    title: 'Yard Care Requests',
    icon: '🌱',
    services: [
      ['String Trimming / Weed Whacking', 'String Trimming / Weed Whacking'],
      ['Professional Edging', 'Sidewalk & Driveway Edging'],
      ['Weed Removal & Pulling', 'Weed Removal & Pulling'],
      ['Weed Spraying & Prevention', 'Weed Spraying'],
    ],
  },
  {
    title: 'Landscaping Requests',
    icon: '🌿',
    services: [
      ['Mulch & Rock Installation', 'Mulch Installation'],
      ['Planting & Seasonal Flowers', 'Planting (Flowers, Shrubs, etc.)'],
      ['Shrub & Bush Trimming', 'Shrub & Bush Trimming'],
      ['Leaf Cleanup & Removal', 'Leaf Cleanup & Removal'],
    ],
  },
] as const

const addOns = [
  ['Grass Bagging', 'From +$5', 'Clippings are collected and removed instead of mulched. Final price depends on lawn size and clipping volume.'],
  ['Edge Restoration', 'From +$10', 'For sidewalks or driveways with heavily overgrown turf that needs the edge re-established.'],
  ['Overgrown Lawn', 'From +$10', 'May apply when extra cutting, passes, or cleanup are needed beyond routine maintenance.'],
  ['Every-Other-Week Service', 'About 15% more per visit', 'Bi-weekly lawns typically need more cutting, trimming, and cleanup. Basic is about $52, and Complete about $58.'],
  ['Heavy Cleanup', 'From +$5', 'May apply when unusually heavy clippings or debris require extra cleanup time.'],
  ['Large / Complex Property', 'Custom quote', 'Larger yards, steep areas, extensive fencing, many obstacles, or difficult access may need customized pricing.'],
] as const

function InfoTip({ label, message }: { label: string; message: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const infoRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const closeTip = (event: PointerEvent) => {
      if (!infoRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeTip)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('pointerdown', closeTip)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  return (
    <span
      ref={infoRef}
      className="relative inline-flex"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        onFocus={() => setIsOpen(true)}
        className="inline-flex size-5 items-center justify-center rounded-full border border-current text-[0.7rem] font-black leading-none transition hover:bg-green-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-600/40"
      >
        i
      </button>
      {isOpen && (
        <span role="tooltip" className="fixed inset-x-4 bottom-4 z-50 w-auto rounded-2xl bg-gray-900 px-5 py-4 text-left text-sm font-medium normal-case leading-relaxed tracking-normal text-white shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-[calc(100%+0.65rem)] sm:left-1/2 sm:w-72 sm:-translate-x-1/2 sm:px-4 sm:py-3 sm:shadow-xl">
          {message}
        </span>
      )}
    </span>
  )
}

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title: 'Laser Cuts Mowing | Lawn Mowing in Fort Wayne, IN',
      },
      {
        name: 'description',
        content:
          'Laser Cuts Mowing provides professional residential lawn mowing in Fort Wayne, Indiana. Get a free quote for mowing or special-request outdoor services today.',
      },
      {
        property: 'og:title',
        content: 'Laser Cuts Mowing | Lawn Mowing in Fort Wayne',
      },
      {
        property: 'og:description',
        content:
          'Reliable residential lawn mowing with straightforward pricing and special-request outdoor services in Fort Wayne.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content: canonicalUrl,
      },
      {
        property: 'og:image',
        content: ogImageUrl,
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Laser Cuts Mowing | Lawn Mowing in Fort Wayne',
      },
      {
        name: 'twitter:description',
        content:
          'Reliable residential lawn mowing with straightforward pricing and special-request outdoor services in Fort Wayne.',
      },
      {
        name: 'twitter:image',
        content: ogImageUrl,
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: canonicalUrl,
      },
    ],
  }),
  component: Home,
})

function Home() {
  const navigate = useNavigate()
  const phone = BUSINESS_PHONE
  const email = BUSINESS_EMAIL
  const submitQuote = useMutation(api.quotes.submit)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [fingerprint, setFingerprint] = useState('')
  const [selectedService, setSelectedService] = useState('')

  useEffect(() => {
    const storageKey = 'laser-cuts-quote-fingerprint'
    const existingFingerprint = window.localStorage.getItem(storageKey)

    if (existingFingerprint) {
      setFingerprint(existingFingerprint)
      return
    }

    const generatedFingerprint = window.crypto.randomUUID()

    window.localStorage.setItem(storageKey, generatedFingerprint)
    setFingerprint(generatedFingerprint)
  }, [])

  const getFingerprint = () => {
    if (fingerprint) {
      return fingerprint
    }

    const generatedFingerprint = window.crypto.randomUUID()

    window.localStorage.setItem('laser-cuts-quote-fingerprint', generatedFingerprint)
    setFingerprint(generatedFingerprint)
    return generatedFingerprint
  }

  const selectPackage = (service: string) => {
    setSelectedService(service)
    document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const submission = parseQuoteSubmission({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        service: formData.get('service'),
        message: formData.get('message'),
        fingerprint:
          (typeof formData.get('fingerprint') === 'string'
            ? formData.get('fingerprint')
            : '') || getFingerprint(),
        honeypot:
          typeof formData.get('website') === 'string'
            ? formData.get('website')
            : '',
      })

      await submitQuote(submission)
      void navigate({ to: '/thank-you' })
    } catch (error) {
      console.error(error)
      alert('Something went wrong. Please call us directly!')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      {/* Top Utility Bar */}
      <div className="bg-green-700 text-white py-2 px-4 sm:px-6 lg:px-8 text-sm font-medium flex justify-center sm:justify-between items-center gap-4 text-center">
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
          <a href={`tel:${BUSINESS_PHONE.replace(/-/g, '')}`} className="hover:text-green-200 transition-colors flex items-center gap-1">
            <span>📞</span> <span className="hidden xs:inline">Call:</span> {phone}
          </a>
          <a href={`mailto:${BUSINESS_EMAIL}`} className="hover:text-green-200 transition-colors flex items-center gap-1">
            <span>✉️</span> <span className="hidden xs:inline">Email:</span> {email}
          </a>
        </div>
        <div className="hidden sm:block font-bold tracking-wide uppercase text-xs">
          Starting at just {BASE_CUT_PRICE} per cut
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded bg-green-600 flex items-center justify-center text-white font-bold italic text-lg shadow-sm border border-green-500/20">L</div>
            <span className="whitespace-nowrap text-base font-black tracking-tighter text-gray-900 uppercase italic sm:text-xl">Laser Cuts Mowing</span>
          </div>
          <div className="flex items-center gap-6">
            <a href={`tel:${BUSINESS_PHONE.replace(/-/g, '')}`} className="hidden md:block text-lg font-bold text-green-700 hover:text-green-800 transition-colors">
              {phone}
            </a>
            <SiteMenu />
            <button 
              onClick={() => document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 transition-all cursor-pointer uppercase tracking-tight"
            >
              Free Quote
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-col">
        {/* Hero Section */}
        <section id="home" className="order-1 relative py-24 flex items-center justify-center bg-gray-900 text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-black opacity-90" />
          </div>
          
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2 text-sm font-black tracking-widest uppercase animate-bounce shadow-lg shadow-green-500/20">
              <span className="text-xl">🔥</span> Special Offer: {NEW_CUSTOMER_PRICE} First Cut
            </div>
            <h1 className="text-5xl font-black tracking-tighter sm:text-8xl mb-6 uppercase italic leading-[0.9]">
              Laser Sharp Cuts <br />
              <span className="text-green-400">Starting at {BASE_CUT_PRICE}</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-300 mb-10 font-medium leading-relaxed">
              Reliable, clean, and affordable lawn mowing in {BUSINESS_LOCATION} and surrounding areas. We treat your yard like our own masterpiece.
            </p>
            <div className="flex flex-col sm:flex-row items-start justify-center gap-6">
              <div className="w-full sm:w-auto flex flex-col gap-3">
                <button 
                  onClick={() => document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full rounded-full bg-green-600 px-12 py-5 text-xl font-black text-white shadow-xl hover:bg-green-700 transition-all scale-105 hover:scale-110 cursor-pointer uppercase tracking-tighter"
                >
                  Get a Free Quote
                </button>
                <button 
                  onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm font-black uppercase tracking-widest text-green-400 hover:text-green-300 transition-colors"
                >
                  View Reference Pictures ↓
                </button>
              </div>
              
              <div className="w-full sm:w-auto flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full rounded-full bg-white px-12 py-5 text-xl font-black text-green-800 shadow-xl transition-all hover:bg-gray-100 uppercase tracking-tighter text-center"
                >
                  Mowing Pricing
                </button>
                <button 
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm font-black uppercase tracking-widest text-gray-300 hover:text-white transition-colors"
                >
                  View special request services ↓
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="order-4 bg-white px-4 py-20 sm:px-6 lg:px-8 border-b">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-yellow-700">
                <span className="text-base">★★★★★</span>
                Recent Reviews
              </div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900 sm:text-5xl">
                Fort Wayne Homeowners Trust Laser Cuts Mowing
              </h2>
              <p className="mt-5 text-lg font-medium leading-relaxed text-gray-600">
                Real feedback from recent customers who wanted clean work, fast communication, and a yard that actually looks finished when we leave.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {featuredReviews.map((review) => (
                <article
                  key={review.name}
                  className="flex h-full flex-col rounded-[32px] border border-gray-200 bg-gray-50 p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-2xl font-black tracking-tight text-gray-900">
                        {review.name}
                      </p>
                      <div className="mt-2 text-sm font-bold uppercase tracking-widest text-yellow-500">
                        <span className="text-base text-yellow-500">★★★★★</span>
                      </div>
                    </div>
                    <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-green-700">
                      Verified
                    </div>
                  </div>

                  <p className="flex-1 text-lg font-medium leading-relaxed text-gray-700">
                    “{review.review}”
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="order-3 border-b bg-gray-50 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-green-700">Residential mowing</p>
              <h2 className="mt-3 text-4xl font-black uppercase italic tracking-tighter text-gray-900 sm:text-5xl">Mowing Services &amp; Pricing</h2>
              <div className="mt-6 rounded-3xl bg-green-600 px-6 py-5 text-white shadow-xl shadow-green-600/20">
                <p className="flex items-center justify-center gap-2 text-xl font-black uppercase tracking-tight">
                  New Customer Special — First Cut {NEW_CUSTOMER_PRICE}
                  <InfoTip label="About the first-cut special" message="For new residential mowing customers with standard-size yards. Final pricing is confirmed after reviewing your property." />
                </p>
                <p className="mt-1 text-sm font-bold text-green-100">New residential mowing customers only. Standard-size yards.</p>
                <button
                  type="button"
                  onClick={() => selectPackage('Basic Cut')}
                  className="mt-4 rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-tight text-green-700 transition hover:bg-green-50"
                >
                  Get My {NEW_CUSTOMER_PRICE} First Cut
                </button>
              </div>
            </div>

            <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch">
              {mowingPackages.map((pkg) => {
                const isPopular = pkg.badge === 'Most Popular'

                return (
                  <article
                    key={pkg.service}
                    className={`relative flex h-full w-full flex-col items-center rounded-[30px] bg-white p-6 text-center shadow-sm transition hover:shadow-xl sm:p-8 sm:hover:-translate-y-1 ${
                      isPopular ? 'border-4 border-green-600 shadow-xl' : 'border border-gray-200'
                    }`}
                  >
                    <div className="mb-5 flex min-h-9 items-center justify-center">
                      {pkg.badge && (
                        <span className={`inline-flex w-fit self-center rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest ${
                          isPopular ? 'bg-green-600 text-white' : 'bg-gray-900 text-white'
                        }`}>
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex min-h-10 items-center justify-center gap-2">
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">{pkg.title}</h3>
                      <span className="text-green-700">
                        <InfoTip label={`About the ${pkg.title} package`} message={pkg.details} />
                      </span>
                    </div>
                    <p className="mt-3 min-h-14 text-base font-medium leading-relaxed text-gray-600">{pkg.description}</p>
                    <div className="mt-6 flex items-baseline justify-center gap-1 text-gray-900">
                      <span className="text-5xl font-black tracking-tighter">{pkg.price}</span>
                      <span className="text-lg font-bold text-gray-500">/ cut</span>
                    </div>
                    <p className="mt-1 flex min-h-10 items-center justify-center gap-2 text-sm font-bold text-gray-500">
                      Starting price for routine residential lawns
                      <span className="text-green-700">
                        <InfoTip label="About starting prices" message="Starting prices apply to standard residential properties. Lawn size, condition, obstacles, access, and requested work can affect the final quote." />
                      </span>
                    </p>
                    <ul className="mx-auto mt-7 flex w-full max-w-md flex-1 flex-col gap-3 pb-8 text-left text-[0.95rem] font-bold leading-snug text-gray-700">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-2"><span className="pt-px text-green-600">✓</span><span>{feature}</span></li>
                      ))}
                    </ul>
                    {pkg.note && <p className="mt-5 rounded-2xl bg-gray-50 p-4 text-center text-sm font-medium leading-relaxed text-gray-600">{pkg.note}</p>}
                    <button
                      type="button"
                      onClick={() => selectPackage(pkg.service)}
                      className={`mt-auto w-full rounded-2xl px-5 py-4 text-base font-black uppercase tracking-tight transition ${
                        isPopular ? 'bg-green-600 text-white shadow-lg shadow-green-600/20 hover:bg-green-700' : 'bg-gray-900 text-white hover:bg-black'
                      }`}
                    >
                      {pkg.buttonLabel}
                    </button>
                  </article>
                )
              })}
            </div>

            <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
              <div className="flex items-center justify-center gap-2 text-center">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Optional Add-ons &amp; Fees</h3>
                <span className="text-green-700">
                  <InfoTip label="About possible additional fees" message="Most regularly maintained lawns stay near their quoted recurring price. These only apply when extra labor, disposal, or specialty work is needed." />
                </span>
              </div>
              <div className="mt-5 divide-y divide-gray-100">
                {addOns.map(([title, price, description]) => (
                  <div key={title} className="flex items-start justify-between gap-3 py-4 text-gray-800">
                    <span className="flex min-w-0 items-center gap-2 font-black">
                      {title}
                      <span className="text-green-700">
                        <InfoTip label={`About ${title}`} message={description} />
                      </span>
                    </span>
                    <span className="max-w-28 shrink-0 text-right text-sm font-black leading-tight text-green-700">{price}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mx-auto mt-8 max-w-4xl text-center text-sm font-medium leading-relaxed text-gray-500">Prices shown are starting prices for standard residential properties receiving routine maintenance. Final pricing depends on lawn size, terrain, obstacles, trimming requirements, property condition, service frequency, access, and requested add-ons. Your exact recurring price will be confirmed before service begins.</p>

            <div className="mx-auto mt-12 max-w-3xl rounded-[32px] bg-gray-900 px-7 py-9 text-center text-white shadow-xl sm:px-10">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">Not Sure Which Option Fits Your Yard?</h3>
              <p className="mx-auto mt-3 max-w-xl text-base font-medium leading-relaxed text-gray-300">Tell us about your property and we&apos;ll recommend the right service.</p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button type="button" onClick={() => document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-2xl bg-green-600 px-8 py-4 text-base font-black uppercase tracking-tight text-white transition hover:bg-green-500">Get a Free Quote</button>
                <a href={`tel:${BUSINESS_PHONE.replace(/-/g, '')}`} className="rounded-2xl bg-white px-8 py-4 text-base font-black uppercase tracking-tight text-green-700 transition hover:bg-green-50">Call {BUSINESS_PHONE}</a>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="order-5 py-32 px-4 sm:px-6 lg:px-8 bg-white border-b">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-green-700">Available By Request</p>
              <h2 className="mt-3 text-4xl font-black uppercase italic tracking-tighter text-gray-900 sm:text-5xl">Special Request Services</h2>
              <p className="mt-5 text-lg font-medium leading-relaxed text-gray-600">Mowing is our main service. Need help with something else outside the regular mowing packages? Request one of these services for a custom quote.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-5xl mx-auto">
              {serviceGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-3xl font-black text-green-700 mb-8 flex items-center gap-3 uppercase italic tracking-tight">
                    <span className="bg-green-100 p-2 rounded-lg">{group.icon}</span> {group.title}
                  </h3>
                  <ul className="space-y-2 text-xl font-bold text-gray-700">
                    {group.services.map(([label, service]) => (
                      <li key={service} className="border-b-2 border-gray-100">
                        <button
                          type="button"
                          onClick={() => selectPackage(service)}
                          className="flex w-full items-center justify-between gap-4 py-4 text-left transition hover:text-green-700"
                        >
                          <span>{label}</span>
                          <span className="text-green-600">✓</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-16 text-center text-gray-500 font-bold italic max-w-2xl mx-auto text-lg leading-relaxed">
              “Don’t see what you need? Send a request and we’ll let you know if we can help.”
            </p>
          </div>
        </section>

        {/* Contact Section - MOVED UP */}
        <section id="quote" className="order-2 py-32 px-4 sm:px-6 lg:px-8 bg-green-600 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-20">
              <h2 className="mb-6 text-4xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl">Get Your Free Quote</h2>
              <div className="mt-10 space-y-6">
                <p className="text-2xl font-black uppercase tracking-tight flex items-center justify-center gap-4">
                    <span>📱</span> Call or Text: <a href={`tel:${BUSINESS_PHONE.replace(/-/g, '')}`} className="underline decoration-white/30 hover:decoration-white transition-all">{phone}</a>
                </p>
                <p className="text-2xl font-black tracking-tight flex items-center justify-center gap-4 break-all sm:break-normal px-4">
                  <span>✉️</span> Email: <a href={`mailto:${BUSINESS_EMAIL}`} className="underline decoration-white/30 hover:decoration-white transition-all text-lg sm:text-2xl">{email}</a>
                </p>
              </div>
            </div>
            
            {submitted ? (
              <div className="bg-white p-16 rounded-[40px] shadow-2xl text-center border-b-[12px] border-green-700 text-gray-900 animate-in zoom-in duration-500">
                <div className="text-7xl mb-6">✅</div>
                <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Request Sent!</h3>
                <p className="text-xl font-bold text-gray-600 mb-10">Trey has received your email and will get back to you shortly.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="bg-green-600 text-white px-12 py-5 rounded-2xl font-black text-xl uppercase tracking-tighter hover:bg-green-700 transition-all shadow-xl"
                >
                  Send Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-10 bg-white p-12 sm:p-20 rounded-[40px] shadow-2xl text-gray-900 border-b-[12px] border-green-700">
                <input name="fingerprint" type="hidden" value={fingerprint} readOnly />
                <input
                  aria-hidden="true"
                  autoComplete="off"
                  className="hidden"
                  name="website"
                  tabIndex={-1}
                  type="text"
                />
                <div className="sm:col-span-2 text-left">
                  <label className="block text-sm font-black text-green-700 uppercase tracking-widest mb-3 ml-2">Your Name</label>
                  <input name="name" required type="text" placeholder="John Doe" className="block w-full rounded-2xl border-4 border-gray-100 bg-gray-50 px-6 py-5 text-xl font-bold focus:border-green-600 focus:bg-white transition-all outline-none" />
                </div>
                <div className="sm:col-span-2 text-left">
                  <label className="block text-sm font-black text-green-700 uppercase tracking-widest mb-3 ml-2">Service Address</label>
                  <input name="address" required type="text" placeholder="123 Main St, Fort Wayne" className="block w-full rounded-2xl border-4 border-gray-100 bg-gray-50 px-6 py-5 text-xl font-bold focus:border-green-600 focus:bg-white transition-all outline-none" />
                </div>
                <div className="text-left">
                  <label className="block text-sm font-black text-green-700 uppercase tracking-widest mb-3 ml-2">Email Address</label>
                  <input name="email" required type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" className="block w-full rounded-2xl border-4 border-gray-100 bg-gray-50 px-6 py-5 text-xl font-bold focus:border-green-600 focus:bg-white transition-all outline-none" />
                </div>
                <div className="text-left">
                  <label className="block text-sm font-black text-green-700 uppercase tracking-widest mb-3 ml-2">Phone Number</label>
                  <input name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="260-442-6772" className="block w-full rounded-2xl border-4 border-gray-100 bg-gray-50 px-6 py-5 text-xl font-bold focus:border-green-600 focus:bg-white transition-all outline-none" />
                </div>
                <div className="sm:col-span-2 text-left">
                  <label className="block text-sm font-black text-green-700 uppercase tracking-widest mb-3 ml-2">Service Needed</label>
                  <select name="service" required value={selectedService} onChange={(event) => setSelectedService(event.target.value)} className="block w-full rounded-2xl border-4 border-gray-100 bg-gray-50 px-6 py-5 text-xl font-bold focus:border-green-600 focus:bg-white transition-all outline-none cursor-pointer appearance-none">
                    <option value="" disabled>Select a service...</option>
                    <optgroup label="Mowing Packages">
                      {quoteServiceValues.slice(0, 2).map((service) => (
                        <option key={service}>{service}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Other Lawn Maintenance">
                      {quoteServiceValues.slice(5, 10).map((service) => (
                        <option key={service}>{service}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Landscaping & More">
                      {quoteServiceValues.slice(10).map((service) => (
                        <option key={service}>{service}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="sm:col-span-2 text-left">
                  <label className="block text-sm font-black text-green-700 uppercase tracking-widest mb-3 ml-2">Additional Details</label>
                  <textarea name="message" required rows={4} placeholder="Tell us about your yard..." className="block w-full rounded-2xl border-4 border-gray-100 bg-gray-50 px-6 py-5 text-xl font-bold focus:border-green-600 focus:bg-white transition-all outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <button 
                    disabled={isSubmitting}
                    type="submit" 
                    className="w-full rounded-2xl bg-green-600 px-6 py-6 text-2xl font-black text-white shadow-2xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tighter"
                  >
                    {isSubmitting ? "Sending..." : "Submit Quote Request"}
                  </button>
                  <p className="mt-6 text-sm text-gray-400 font-bold italic">
                    By submitting, Trey will be notified immediately at {BUSINESS_EMAIL}
                  </p>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Gallery Section - Coming Soon */}
        <section id="gallery" className="order-6 py-32 px-4 sm:px-6 lg:px-8 bg-gray-50 border-b">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-20">
              <h2 className="mb-6 text-4xl font-black uppercase italic tracking-tighter text-gray-900 sm:text-5xl">Recent Work</h2>
              <div className="inline-block bg-green-600 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-6 shadow-lg shadow-green-600/20">
                📷 Reference Photos
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto text-xl font-medium">Take a look at some of our recent transformations in Fort Wayne. We take pride in every yard we service.</p>
              <Link
                to="/gallery"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-black uppercase tracking-widest text-green-700 shadow-lg ring-1 ring-green-100 transition-all hover:-translate-y-0.5 hover:text-green-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-600/30"
              >
                Click to see more work
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {galleryPhotos.map((photo) => (
                <Link
                  key={photo.src}
                  to="/gallery/$category"
                  params={{ category: photo.slug }}
                  className="relative overflow-hidden rounded-[32px] shadow-xl aspect-square border-4 border-white group block focus:outline-none focus:ring-4 focus:ring-green-600/40"
                  aria-label={`Open gallery for ${photo.alt}`}
                >
                  <img 
                    src={photo.src} 
                    alt={photo.alt} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-black uppercase italic tracking-tighter text-xl">{photo.label}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-20 text-center">
              <p className="text-gray-500 font-bold italic text-xl">"Treating every yard like a masterpiece. Real customer photos are added as we complete jobs!"</p>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-gray-900 text-gray-400 py-24 px-4 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="size-14 rounded-xl bg-green-600 flex items-center justify-center text-white font-black italic text-2xl shadow-xl shadow-green-600/20">L</div>
            <span className="text-center text-2xl font-black tracking-tighter text-white uppercase italic sm:text-4xl">Laser Cuts Mowing</span>
          </div>
          <p className="text-white font-black mb-6 tracking-widest text-2xl uppercase italic leading-none">LASERCUTSFW.COM</p>
          <p className="font-bold text-lg text-gray-500 mb-10">© {new Date().getFullYear()} Laser Cuts Mowing. All rights reserved.</p>
          
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-xl font-black uppercase tracking-tighter">
            <a href={`mailto:${email}`} className="hover:text-green-500 transition-colors flex items-center gap-2 text-green-500"><span>✉️</span> Email</a>
            <a href={`tel:${phone.replace(/-/g, '')}`} className="hover:text-green-500 transition-colors flex items-center gap-2 text-green-500"><span>📱</span> Phone</a>
            <span className="text-gray-600 flex items-center gap-2"><span>📍</span> Fort Wayne, IN</span>
          </div>
          
          <div className="mt-20 max-w-2xl text-sm font-bold opacity-30 leading-relaxed uppercase tracking-widest">
            Mowing is our main service. Locally owned and operated by Trey Torres.
            Pricing depends on property size and condition. Laser sharp results every single time.
          </div>
        </div>
      </footer>
    </div>
  )
}
