import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { BUSINESS_NAME } from '../../businessConfig'
import { findGalleryPhoto } from '../galleryPhotos'

type AddedPhoto = {
  id: string
  src: string
  alt: string
}

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
            ? `View and add ${gallery.title.toLowerCase()} project photos for Laser Cuts.`
            : 'View and add Laser Cuts project photos.',
        },
      ],
    }
  },
  component: CategoryGallery,
})

function CategoryGallery() {
  const { category } = Route.useParams()
  const gallery = findGalleryPhoto(category)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [addedPhotos, setAddedPhotos] = useState<AddedPhoto[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [message, setMessage] = useState('')
  const storageKey = `laser-cuts-added-gallery-photos-${category}`

  useEffect(() => {
    const savedPhotos = window.localStorage.getItem(storageKey)

    if (!savedPhotos) return

    try {
      setAddedPhotos(JSON.parse(savedPhotos))
    } catch {
      window.localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  const saveAddedPhotos = (photos: AddedPhoto[]) => {
    setAddedPhotos(photos)
    window.localStorage.setItem(storageKey, JSON.stringify(photos))
  }

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return

    setIsAdding(true)
    setMessage('')

    try {
      const nextPhotos = await Promise.all(
        Array.from(files)
          .filter((file) => file.type.startsWith('image/'))
          .map(async (file) => ({
            id: window.crypto.randomUUID(),
            src: await resizeImage(file),
            alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
          })),
      )

      if (!nextPhotos.length) {
        setMessage('Choose an image file to add.')
        return
      }

      saveAddedPhotos([...nextPhotos, ...addedPhotos])
      setMessage(`${nextPhotos.length} photo${nextPhotos.length === 1 ? '' : 's'} added to this gallery.`)
    } catch {
      setMessage('That image could not be added. Try a smaller photo.')
    } finally {
      setIsAdding(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removePhoto = (photoId: string) => {
    saveAddedPhotos(addedPhotos.filter((photo) => photo.id !== photoId))
  }

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

  const allPhotos = [
    ...addedPhotos.map((photo) => ({ ...photo, label: 'Added Photo', canRemove: true })),
    { ...gallery, id: gallery.src, canRemove: false },
  ]

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3" aria-label="Back to Laser Cuts home">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white font-black italic">L</span>
            <span className="text-xl font-black tracking-tighter uppercase italic">{BUSINESS_NAME}</span>
          </Link>
          <Link
            to="/gallery"
            className="rounded-full bg-green-600 px-5 py-3 text-sm font-black text-white uppercase tracking-tight shadow-lg shadow-green-600/20"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
            <div>
              <p className="text-green-700 font-black uppercase tracking-widest mb-4">Project Gallery</p>
              <h1 className="text-5xl sm:text-7xl font-black uppercase italic tracking-tighter leading-none">
                {gallery.title}
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => addFiles(event.target.files)}
              />
              <button
                type="button"
                disabled={isAdding}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-green-600 px-8 py-4 text-base font-black text-white uppercase tracking-tight shadow-xl shadow-green-600/20 disabled:opacity-60"
              >
                {isAdding ? 'Adding...' : 'Add Photos'}
              </button>
              {addedPhotos.length > 0 && (
                <button
                  type="button"
                  onClick={() => saveAddedPhotos([])}
                  className="rounded-full border-2 border-gray-300 bg-white px-8 py-4 text-base font-black text-gray-900 uppercase tracking-tight"
                >
                  Clear Added
                </button>
              )}
            </div>
          </div>

          {message && (
            <p className="mb-8 rounded-2xl border-2 border-green-100 bg-white px-5 py-4 font-bold text-gray-600">
              {message}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {allPhotos.map((photo) => (
              <article key={photo.id} className="group">
                <div className="relative overflow-hidden rounded-[32px] border-4 border-white bg-white shadow-xl aspect-square">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                    <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">{photo.label}</h2>
                  </div>
                  {photo.canRemove && (
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute right-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xs font-black uppercase tracking-tight text-gray-950 shadow-lg"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

async function resizeImage(file: File) {
  const dataUrl = await readFileAsDataUrl(file)
  const image = await loadImage(dataUrl)
  const maxSize = 1600
  const scale = Math.min(maxSize / image.width, maxSize / image.height, 1)
  const width = Math.round(image.width * scale)
  const height = Math.round(image.height * scale)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas is not available.')
  }

  canvas.width = width
  canvas.height = height
  context.drawImage(image, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', 0.85)
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}
