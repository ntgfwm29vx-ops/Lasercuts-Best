import { Link, createFileRoute } from '@tanstack/react-router'
import { BUSINESS_NAME } from '../../businessConfig'
import { SiteMenu } from '../components/SiteMenu'
import { findGalleryPhoto, galleryPhotos } from '../galleryPhotos'

export const Route = createFileRoute('/gallery_/$category')({
  head: ({ params }) => {
    const gallery = findGalleryPhoto(params.category)
    const title = gallery ? `${gallery.title} Gallery | Laser Cuts` : 'Gallery | Laser Cuts'

    return {
      meta: [
        {
          title,
        },
        {
          name: 'description',
          content: gallery
            ? `View ${gallery.title.toLowerCase()} project photos for Laser Cuts.`
            : 'View Laser Cuts project photos.',
        },
      ],
    }
  },
  component: CategoryGallery,
})

function CategoryGallery() {
  const { category } = Route.useParams()
  const gallery = findGalleryPhoto(category)

  if (!gallery) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-20 text-center text-gray-950">
        <p className="text-green-700 font-black uppercase tracking-widest mb-4">Project Gallery</p>
        <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-8">Gallery Not Found</h1>
        <Link
          to="/gallery"
          className="inline-flex rounded-full bg-green-600 px-8 py-4 text-base font-black text-white uppercase tracking-tight shadow-xl shadow-green-600/20"
        >
          Choose A Gallery
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3" aria-label="Back to Laser Cuts home">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white font-black italic">L</span>
            <span className="text-xl font-black tracking-tighter uppercase italic">{BUSINESS_NAME}</span>
          </Link>
          <div className="flex items-center gap-3">
            <SiteMenu />
            <Link
              to="/gallery"
              className="rounded-full bg-green-600 px-5 py-3 text-sm font-black text-white uppercase tracking-tight shadow-lg shadow-green-600/20"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <div>
              <p className="text-green-700 font-black uppercase tracking-widest mb-4">Project Gallery</p>
              <h1 className="text-5xl sm:text-7xl font-black uppercase italic tracking-tighter leading-none">
                {gallery.title}
              </h1>
            </div>
          </div>

          <nav aria-label="Gallery shortcuts" className="mb-12">
            <p className="mb-4 text-sm font-black uppercase tracking-widest text-green-700">Jump To</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {galleryPhotos.map((shortcut) => {
                const isCurrent = shortcut.slug === gallery.slug

                return (
                  <Link
                    key={shortcut.slug}
                    to="/gallery/$category"
                    params={{ category: shortcut.slug }}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`group relative overflow-hidden rounded-[24px] border-4 shadow-lg aspect-[4/3] focus:outline-none focus:ring-4 focus:ring-green-600/40 ${
                      isCurrent ? 'border-green-600' : 'border-white'
                    }`}
                  >
                    <img
                      src={shortcut.src}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/45" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <span className="block text-sm sm:text-base font-black uppercase italic tracking-tighter text-white">
                        {shortcut.label}
                      </span>
                      {isCurrent && (
                        <span className="mt-1 inline-flex rounded-full bg-green-600 px-3 py-1 text-[0.65rem] font-black uppercase tracking-tight text-white">
                          Current
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </nav>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <article className="group">
              <div className="relative overflow-hidden rounded-[32px] border-4 border-white bg-white shadow-xl aspect-square">
                <img
                  src={gallery.src}
                  alt={gallery.alt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                  <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">
                    {gallery.label}
                  </h2>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}
