import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
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
import type { FormEvent } from 'react'

const siteUrl = import.meta.env.VITE_SITE_URL ?? DEFAULT_SITE_URL
const canonicalUrl = new URL(SITE_PATHS.home, siteUrl).toString()
const ogImageUrl = new URL(SITE_PATHS.ogImage, siteUrl).toString()
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LawnCare',
  name: BUSINESS_NAME,
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
    'Affordable lawn mowing, edging, weed control, mulch, and cleanup services in Fort Wayne and surrounding areas.',
  priceRange: `${NEW_CUSTOMER_PRICE}-${BASE_CUT_PRICE}+`,
}

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title: 'Laser Cuts | Lawn Care in Fort Wayne',
      },
      {
        name: 'description',
        content:
          'Get a fast lawn care quote for mowing, edging, weed control, mulch, and cleanup in Fort Wayne and nearby areas.',
      },
      {
        property: 'og:title',
        content: 'Laser Cuts | Lawn Care in Fort Wayne',
      },
      {
        property: 'og:description',
        content:
          'Reliable, clean, and affordable lawn mowing and outdoor services with simple pricing and quick quote requests.',
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
        content: 'Laser Cuts | Lawn Care in Fort Wayne',
      },
      {
        name: 'twitter:description',
        content:
          'Reliable, clean, and affordable lawn mowing and outdoor services with simple pricing and quick quote requests.',
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
            <span className="text-xl font-black tracking-tighter text-gray-900 uppercase italic">Laser Cuts</span>
          </div>
          <div className="flex items-center gap-6">
            <a href={`tel:${BUSINESS_PHONE.replace(/-/g, '')}`} className="hidden md:block text-lg font-bold text-green-700 hover:text-green-800 transition-colors">
              {phone}
            </a>
            <button 
              onClick={() => document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 transition-all cursor-pointer uppercase tracking-tight"
            >
              Free Quote
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-24 flex items-center justify-center bg-gray-900 text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-black opacity-90" />
          </div>
          
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2 text-sm font-black tracking-widest uppercase animate-bounce shadow-lg shadow-green-500/20">
              <span className="text-xl">🔥</span> Special Offer: $35 First Cut
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
                <a href={`tel:${BUSINESS_PHONE.replace(/-/g, '')}`} className="w-full rounded-full bg-white px-12 py-5 text-xl font-black text-green-800 shadow-xl hover:bg-gray-100 transition-all uppercase tracking-tighter text-center">
                  Call {phone}
                </a>
                <button 
                  onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm font-black uppercase tracking-widest text-gray-300 hover:text-white transition-colors"
                >
                  Get to know me ↓
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-gray-50 py-24 px-4 sm:px-6 lg:px-8 border-b">
          <div className="mx-auto max-w-7xl text-center">
            <div className="mb-16">
              <h2 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter mb-4">Simple Pricing</h2>
              <div className="inline-block rounded-full bg-green-600 px-8 py-3 text-white font-black text-lg shadow-md tracking-tight">
                NEW CUSTOMER SPECIAL: {NEW_CUSTOMER_PRICE} for your first cut! ✂️
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Basic Cut */}
              <div className="relative rounded-3xl border-2 border-gray-200 bg-white p-10 shadow-sm transition-all hover:shadow-xl flex flex-col items-center">
                <div className="mb-6 inline-block rounded-lg bg-green-100 px-4 py-1.5 text-xs font-black text-green-700 uppercase tracking-widest">
                  Most Popular
                </div>
                <h3 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Basic Cut</h3>
                <div className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-5xl font-black tracking-tighter">{BASE_CUT_PRICE}</span>
                  <span className="ml-1 text-xl font-bold text-gray-500 tracking-tight">/cut</span>
                </div>
                <p className="mt-3 text-sm text-gray-500 font-bold italic">*Starting price for standard yards</p>
                <ul className="mt-10 space-y-5 flex-1 w-full text-left max-w-[250px]">
                  <li className="flex items-center gap-4 text-lg font-bold text-gray-700"><span className="text-green-600 text-xl">✓</span> Mowing & Trimming</li>
                  <li className="flex items-center gap-4 text-lg font-bold text-gray-700"><span className="text-green-600 text-xl">✓</span> Blowing off Driveways</li>
                  <li className="flex items-center gap-4 text-lg font-bold text-gray-700"><span className="text-green-600 text-xl">✓</span> Sidewalk Cleanup</li>
                </ul>
                <button 
                  onClick={() => document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' })}
                  className="mt-12 w-full rounded-2xl bg-green-600 py-4 text-white font-black text-xl hover:bg-green-700 transition-all cursor-pointer uppercase tracking-tighter shadow-lg shadow-green-600/20"
                >
                  Get $35 First Cut
                </button>
              </div>

              {/* Premium Cut */}
              <div className="relative rounded-3xl border-4 border-green-600 bg-white p-10 shadow-2xl flex flex-col items-center transform scale-105 sm:scale-110 sm:z-10">
                <div className="absolute top-0 right-10 -translate-y-1/2 rounded-full bg-green-600 px-6 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg">
                  Best Value
                </div>
                <h3 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Premium Cut</h3>
                <div className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-5xl font-black tracking-tighter">$50</span>
                  <span className="ml-1 text-xl font-bold text-gray-500 tracking-tight">/cut</span>
                </div>
                <p className="mt-3 text-sm text-gray-500 font-bold italic">Includes full detailing</p>
                <ul className="mt-10 space-y-5 flex-1 w-full text-left max-w-[250px]">
                  <li className="flex items-center gap-4 text-lg font-bold text-gray-700"><span className="text-green-600 text-xl">✓</span> Everything in Basic</li>
                  <li className="flex items-center gap-4 text-lg font-bold text-gray-700"><span className="text-green-600 text-xl">✓</span> Professional Edging</li>
                  <li className="flex items-center gap-4 text-lg font-bold text-gray-700"><span className="text-green-600 text-xl">✓</span> Bagging Grass Clippings</li>
                  <li className="flex items-center gap-4 text-lg font-bold text-gray-700"><span className="text-green-600 text-xl">✓</span> Full Property Detail</li>
                </ul>
                <button 
                  onClick={() => document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' })}
                  className="mt-12 w-full rounded-2xl bg-gray-900 py-4 text-white font-black text-xl hover:bg-black transition-all cursor-pointer uppercase tracking-tighter shadow-xl"
                >
                  Select Premium
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white border-b">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-5xl font-black text-gray-900 text-center mb-20 uppercase italic tracking-tighter">Full Service List</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-5xl mx-auto">
              <div>
                <h3 className="text-3xl font-black text-green-700 mb-8 flex items-center gap-3 uppercase italic tracking-tight">
                  <span className="bg-green-100 p-2 rounded-lg">🌱</span> Lawn Maintenance
                </h3>
                <ul className="space-y-5 text-xl font-bold text-gray-700">
                  <li className="pb-5 border-b-2 border-gray-100 flex justify-between items-center">
                    <span>Professional Lawn Mowing</span>
                    <span className="text-green-600">✓</span>
                  </li>
                  <li className="pb-5 border-b-2 border-gray-100 flex justify-between items-center">
                    <span>String Trimming / Weed Whacking</span>
                    <span className="text-green-600">✓</span>
                  </li>
                  <li className="pb-5 border-b-2 border-gray-100 flex justify-between items-center">
                    <span>Professional Edging</span>
                    <span className="text-green-600">✓</span>
                  </li>
                  <li className="pb-5 border-b-2 border-gray-100 flex justify-between items-center">
                    <span>Weed Removal & Pulling</span>
                    <span className="text-green-600">✓</span>
                  </li>
                  <li className="pb-5 border-b-2 border-gray-100 flex justify-between items-center">
                    <span>Weed Spraying & Prevention</span>
                    <span className="text-green-600">✓</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-3xl font-black text-green-700 mb-8 flex items-center gap-3 uppercase italic tracking-tight">
                  <span className="bg-green-100 p-2 rounded-lg">🌿</span> Landscaping & More
                </h3>
                <ul className="space-y-5 text-xl font-bold text-gray-700">
                  <li className="pb-5 border-b-2 border-gray-100 flex justify-between items-center">
                    <span>Mulch & Rock Installation</span>
                    <span className="text-green-600">✓</span>
                  </li>
                  <li className="pb-5 border-b-2 border-gray-100 flex justify-between items-center">
                    <span>Planting & Seasonal Flowers</span>
                    <span className="text-green-600">✓</span>
                  </li>
                  <li className="pb-5 border-b-2 border-gray-100 flex justify-between items-center">
                    <span>Shrub & Bush Trimming</span>
                    <span className="text-green-600">✓</span>
                  </li>
                  <li className="pb-5 border-b-2 border-gray-100 flex justify-between items-center">
                    <span>Leaf Cleanup & Removal</span>
                    <span className="text-green-600">✓</span>
                  </li>
                </ul>
              </div>
            </div>
            <p className="mt-16 text-center text-gray-500 font-bold italic max-w-2xl mx-auto text-lg leading-relaxed">
              “Don’t see your service listed? Just ask—we handle most outdoor cleanup and landscaping jobs.”
            </p>
          </div>
        </section>

        {/* Contact Section - MOVED UP */}
        <section id="quote" className="py-32 px-4 sm:px-6 lg:px-8 bg-green-600 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-20">
              <h2 className="text-6xl font-black uppercase italic tracking-tighter mb-6 leading-none">Get Your Free Quote</h2>
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
                  <select name="service" required defaultValue="" className="block w-full rounded-2xl border-4 border-gray-100 bg-gray-50 px-6 py-5 text-xl font-bold focus:border-green-600 focus:bg-white transition-all outline-none cursor-pointer appearance-none">
                    <option value="" disabled>Select a service...</option>
                    <optgroup label="Lawn Maintenance">
                      {quoteServiceValues.slice(0, 7).map((service) => (
                        <option key={service}>{service}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Landscaping & More">
                      {quoteServiceValues.slice(7).map((service) => (
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
        <section id="gallery" className="py-32 px-4 sm:px-6 lg:px-8 bg-gray-50 border-b">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-black text-gray-900 mb-6 uppercase italic tracking-tighter">Recent Work</h2>
              <div className="inline-block bg-green-600 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-6 shadow-lg shadow-green-600/20">
                📷 Reference Photos
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto text-xl font-medium">Take a look at some of our recent transformations in Fort Wayne. We take pride in every yard we service.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="relative overflow-hidden rounded-[32px] shadow-xl aspect-square border-4 border-white group">
                <img 
                  src="https://images.unsplash.com/photo-1599110364868-26407b319625?auto=format&fit=crop&q=80&w=800" 
                  alt="Recent Mulch Job" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-black uppercase italic tracking-tighter text-xl">Mulch & Planting</span>
                </div>
              </div>
              
              <div className="relative overflow-hidden rounded-[32px] shadow-xl aspect-square border-4 border-white group">
                <img 
                  src="https://storage.googleapis.com/multimodal-tool-use-input/7c83f94a-8f55-468c-901b-c743e498c894/input_file_0.png" 
                  alt="Before and After Lawn Care" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-black uppercase italic tracking-tighter text-xl">Before & After</span>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] shadow-xl aspect-square border-4 border-white group">
                <img 
                  src="https://storage.googleapis.com/multimodal-tool-use-input/c4441712-426b-4e01-a53c-1b7774e50882/input_file_0.png" 
                  alt="Weed Spraying Before and After" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-black uppercase italic tracking-tighter text-xl">Weed Spraying</span>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] shadow-xl aspect-square border-4 border-white group">
                <img 
                  src="https://storage.googleapis.com/multimodal-tool-use-input/6f2e8251-512c-491f-a579-2ef539402506/input_file_0.png" 
                  alt="Tree Planting and Mulch Ring" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-black uppercase italic tracking-tighter text-xl">Tree Care & Mulching</span>
                </div>
              </div>
            </div>
            <div className="mt-20 text-center">
              <p className="text-gray-500 font-bold italic text-xl">"Treating every yard like a masterpiece. Real customer photos are added as we complete jobs!"</p>
            </div>
          </div>
        </section>

        {/* Meet Trey Section */}
        <section id="about" className="py-32 px-4 sm:px-6 lg:px-8 bg-white border-b">
          <div className="mx-auto max-w-5xl text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-16 bg-green-50 rounded-[40px] p-10 md:p-20 shadow-xl border-4 border-green-200/50">
              <div className="w-full md:w-2/3">
                <h2 className="text-5xl font-black text-gray-900 uppercase italic tracking-tighter mb-10 leading-none">Meet the Owner</h2>
                <div className="space-y-6 text-xl font-medium text-gray-700 leading-relaxed">
                  <p>
                    <strong className="text-2xl font-black text-green-700 block mb-2 uppercase tracking-tight">My name is Trey Torres.</strong> 
                    I'm a senior at Carroll High School and a future track athlete at the University of Saint Francis.
                  </p>
                  <p>
                    I started this business to save and invest toward my goal of owning Section 8 rental properties here in Fort Wayne. 
                  </p>
                  <p>
                    Earning a full athletic scholarship has allowed me to keep my prices competitive while still delivering high-quality, reliable service. I bring the same hard work and discipline to your lawn that I bring to the track each day.
                  </p>
                </div>
                <div className="mt-12 flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="px-6 py-3 bg-green-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-green-600/20">🏃‍♂️ Track Athlete</div>
                  <div className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-black/20">🎓 Senior @ Carroll</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-24 px-4 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="size-14 rounded-xl bg-green-600 flex items-center justify-center text-white font-black italic text-2xl shadow-xl shadow-green-600/20">L</div>
            <span className="text-4xl font-black tracking-tighter text-white uppercase italic">Laser Cuts</span>
          </div>
          <p className="text-white font-black mb-6 tracking-widest text-2xl uppercase italic leading-none">LASERCUTSFW.COM</p>
          <p className="font-bold text-lg text-gray-500 mb-10">© {new Date().getFullYear()} Laser Cuts Care & Landscaping. All rights reserved.</p>
          
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-xl font-black uppercase tracking-tighter">
            <a href={`mailto:${email}`} className="hover:text-green-500 transition-colors flex items-center gap-2 text-green-500"><span>✉️</span> Email</a>
            <a href={`tel:${phone.replace(/-/g, '')}`} className="hover:text-green-500 transition-colors flex items-center gap-2 text-green-500"><span>📱</span> Phone</a>
            <span className="text-gray-600 flex items-center gap-2"><span>📍</span> Fort Wayne, IN</span>
          </div>
          
          <div className="mt-20 max-w-2xl text-sm font-bold opacity-30 leading-relaxed uppercase tracking-widest">
            Providing reliable and affordable lawn maintenance. Locally owned and operated by Trey Torres.
            Pricing depends on property size and condition. Laser sharp results every single time.
          </div>
        </div>
      </footer>
    </div>
  )
}
