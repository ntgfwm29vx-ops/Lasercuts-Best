import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { galleryPhotos } from '../galleryPhotos'

const mainLinks = [
  { label: 'Home', href: '/#home' },
  { label: 'Reviews', href: '/#reviews' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Services', href: '/#services' },
  { label: 'Free Quote', href: '/#quote' },
  { label: 'Recent Work', href: '/#gallery' },
  { label: 'Meet Trey', href: '/#about' },
]

export function SiteMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const closeMenu = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeMenu)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('pointerdown', closeMenu)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="Open site menu"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-950 shadow-sm transition hover:border-green-600 hover:text-green-700 focus:outline-none focus:ring-4 focus:ring-green-600/25"
      >
        <span className="grid gap-1.5">
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-1/2 top-14 z-50 w-[calc(100vw-2rem)] max-w-80 -translate-x-1/2 overflow-hidden rounded-[24px] border border-gray-200 bg-white text-gray-950 shadow-2xl sm:left-auto sm:right-0 sm:translate-x-0">
          <div className="border-b border-gray-100 p-3">
            <p className="px-3 py-2 text-xs font-black uppercase tracking-widest text-green-700">Website</p>
            <div className="grid gap-1">
              {mainLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl px-3 py-3 text-sm font-black uppercase tracking-tight transition hover:bg-green-50 hover:text-green-700"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="p-3">
            <p className="px-3 py-2 text-xs font-black uppercase tracking-widest text-green-700">Galleries</p>
            <div className="grid gap-1">
              <Link
                to="/gallery"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl px-3 py-3 text-sm font-black uppercase tracking-tight transition hover:bg-green-50 hover:text-green-700"
              >
                All Galleries
              </Link>
              {galleryPhotos.map((photo) => (
                <Link
                  key={photo.slug}
                  to="/gallery/$category"
                  params={{ category: photo.slug }}
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl px-3 py-3 text-sm font-black uppercase tracking-tight transition hover:bg-green-50 hover:text-green-700"
                >
                  {photo.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
