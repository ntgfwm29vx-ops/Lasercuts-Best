import { Link, createFileRoute } from '@tanstack/react-router'
import { BUSINESS_NAME } from '../../businessConfig'
import { galleryPhotos } from '../galleryPhotos'

export const Route = createFileRoute('/gallery/')({
  head: () => ({
    meta: [
      {
        title: 'Gallery | Laser Cuts',
      },
      {
        name: 'description',
        content: 'Choose a Laser Cuts lawn care or landscaping project gallery.',
      },
    ],
  }),
  component: GalleryIndex,
})

function GalleryIndex() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-950">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3" aria-label="Back to Laser Cuts home">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white font-black italic">L</span>
            <span className="text-xl font-black tracking-tighter uppercase italic">{BUSINESS_NAME}</span>
          </Link>
          <Link
            to="/"
            hash="gallery"
            className="rounded-full bg-green-600 px-5 py-3 text-sm font-black text-white uppercase tracking-tight shadow-lg shadow-green-600/20"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <p className="text-green-700 font-black uppercase tracking-widest mb-4">Project Gallery</p>
            <h1 className="text-5xl sm:text-7xl font-black uppercase italic tracking-tighter leading-none">
              Choose A Gallery
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {galleryPhotos.map((photo) => (
              <Link
                key={photo.slug}
                to="/gallery/$category"
                params={{ category: photo.slug }}
                className="group block focus:outline-none focus:ring-4 focus:ring-green-600/40 rounded-[32px]"
                aria-label={`Open ${photo.title} gallery`}
              >
                <div className="relative overflow-hidden rounded-[32px] border-4 border-white bg-white shadow-xl aspect-square">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                    <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white">
                      {photo.label}
                    </h2>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
