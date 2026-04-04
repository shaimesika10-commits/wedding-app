'use client'

import { useState } from 'react'
import type { GalleryPhoto } from '@/types'
import type { Locale } from '@/lib/i18n'

const labels = {
  fr: {
    title: 'Galerie photos',
    subtitle: 'Nos plus beaux souvenirs',
    noPhotos: 'Aucune photo pour le moment.',
  },
  he: {
    title: 'גלריית תמונות',
    subtitle: 'הרגעים המיוחדים שלנו',
    noPhotos: 'אין תמונות עדיין.',
  },
  en: {
    title: 'Photo Gallery',
    subtitle: 'Our most beautiful moments',
    noPhotos: 'No photos yet.',
  },
}

interface GallerySectionProps {
  photos: GalleryPhoto[]
  locale: Locale
  couplePhotoUrl?: string | null
}

export default function GallerySection({ photos, locale, couplePhotoUrl }: GallerySectionProps) {
  const l = labels[locale] || labels.fr
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null)

  const allPhotos = couplePhotoUrl
    ? [{ id: 'couple', url: couplePhotoUrl, caption: '', uploaded_by: '', created_at: '' } as GalleryPhoto, ...photos]
    : photos

  return (
    <section className="py-16 px-4" dir={locale === 'he' ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-cormorant text-stone-800 text-center mb-2">{l.title}</h2>
        <p className="text-stone-400 text-center text-sm mb-10 font-montserrat tracking-widest uppercase">{l.subtitle}</p>

        {allPhotos.length === 0 ? (
          <p className="text-center text-stone-400 italic">{l.noPhotos}</p>
        ) : (
          <div className="columns-2 sm:columns-3 gap-3 space-y-3">
            {allPhotos.map((photo) => (
              <div
                key={photo.id}
                className="break-inside-avoid cursor-pointer overflow-hidden rounded group"
                onClick={() => setLightbox(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || ''}
                  className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {photo.caption && (
                  <p className="text-xs text-stone-400 mt-1 px-1 truncate">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {lightbox && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 text-white text-2xl font-light"
              onClick={() => setLightbox(null)}
            >
              &#x2715;
            </button>
            <img
              src={lightbox.url}
              alt={lightbox.caption || ''}
              className="max-h-[90vh] max-w-full object-contain"
              onClick={e => e.stopPropagation()}
            />
            {lightbox.caption && (
              <p className="absolute bottom-8 text-white text-sm text-center px-4">{lightbox.caption}</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
