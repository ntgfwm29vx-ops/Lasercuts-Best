export const galleryPhotos = [
  {
    slug: 'mulch-and-planting',
    src: '/gallery/recent-mulch-job.jpeg',
    alt: 'Recent Mulch Job',
    label: 'Mulch & Planting',
    title: 'Mulch & Planting',
  },
  {
    slug: 'before-and-after',
    src: '/gallery/lawn-care-before-after.png',
    alt: 'Before and After Lawn Care',
    label: 'Before & After',
    title: 'Before & After',
  },
  {
    slug: 'weed-spraying',
    src: '/gallery/weed-spraying-before-after.png',
    alt: 'Weed Spraying Before and After',
    label: 'Weed Spraying',
    title: 'Weed Spraying',
  },
  {
    slug: 'tree-care-mulching',
    src: '/gallery/tree-planting-mulch-ring.png',
    alt: 'Tree Planting and Mulch Ring',
    label: 'Tree Care & Mulching',
    title: 'Tree Care & Mulching',
  },
]

export function findGalleryPhoto(slug: string) {
  return galleryPhotos.find((photo) => photo.slug === slug)
}
