'use client'

import { useState } from 'react'
import type { GalleryPhoto } from '@/types'
// ============================================================
//  GrandInvite – Gallery Section Component
//  גלריית תמונות שיתופית עם אפשרות להעלאה
//  src/components/GallerySection.tsx
// ============================================================

import { useState, useRef, useCallback } from 'react'
import type { GalleryPhoto } from '@/types'
import type { Locale } from '@/lib/i18n'

const uploadLabels = {
  fr: {
    title: 'Galerie photos',
    subtitle: 'Partagez vos plus beaux souvenirs',
    uploadBtn: 'Ajouter une photo',
    uploading: 'Envoi en cours...',
    yourName: 'Votre nom (facultatif)',
    caption: 'Légende (facultatif)',
    captionPlaceholder: 'Un beau souvenir...',
    submit: 'Partager',
    cancel: 'Annuler',
    dragDrop: 'Glisser-déposer ou cliquer pour choisir',
    maxSize: 'JPEG, PNG, WebP – 10 Mo max',
    success: 'Photo partagée avec succès !',
    error: 'Erreur lors de l\'envoi.',
    viewMore: 'Voir plus',
  },
  he: {
    title: 'גלריית תמונות',
    subtitle: 'שתפו את הרגעים היפים שלכם',
    uploadBtn: 'הוספת תמונה',
    uploading: 'מעלה...',
    yourName: 'השם שלך (אופציונלי)',
    caption: 'כיתוב (אופציונלי)',
    captionPlaceholder: 'רגע נפלא...',
    submit: 'שיתוף',
    cancel: 'ביטול',
    dragDrop: 'גרור ושחרר או לחץ לבחירה',
    maxSize: 'JPEG, PNG, WebP – עד 10MB',
    success: 'התמונה שותפה בהצלחה!',
    error: 'שגיאה בהעלאה.',
    viewMore: 'הצג עמד',
  },
  en: {
    title: 'Photo Gallery',
    subtitle: 'Share your beautiful moments',
    uploadBtn: 'Add a photo',
    uploading: 'Uploading...',
    yourName: 'Your name (optional)',
    caption: 'Caption (optional)',
    captionPlaceholder: 'A beautiful moment...',
    submit: 'Share',
    cancel: 'Cancel',
    dragDrop: 'Drag & drop or click to choose',
    maxSize: 'JPEG, PNG, WebP – 10 MB max',
    success: 'Photo shared successfully!',
    error: 'Error uploading photo.',
    viewMore: 'View more',
  },
}

interface GallerySectionProps {
  weddingId: string
  locale: Locale
  initialPhotos: GalleryPhoto[]
}

export default function GallerySection({
  weddingId,
  locale,
  initialPhotos,
}: GallerySectionProps) {
  const l = uploadLabels[locale] ?? uploadLabels.fr
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null)
  const [uploaderName, setUploaderName] = useState('')
  const [caption, setCaption] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [visibleCount, setVisibleCount] = useState(9)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    setUploadStatus('idle')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('wedding_id', weddingId)
      if (uploaderName) formData.append('uploaded_by_name', uploaderName)
      if (caption) formData.append('caption', caption)

      const res = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      const { photo } = await res.json()
      setPhotos(prev => [photo, ...prev])
      setUploadStatus('success')

      // reset
      setTimeout(() => {
        setShowUpload(false)
        setSelectedFile(null)
        setPreview(null)
        setUploaderName('')
        setCaption('')
        setUploadStatus('idle')
      }, 2000)
    } catch {
      setUploadStatus('error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="py-16 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="font-cormorant text-3xl font-light text-stone-800 mb-2">
          {l.title}
        </h2>
        <p className="text-stone-400 text-sm">{l.subtitle}</p>
        <div className="h-px w-12 mx-auto mt-4" style={{ background: '#c9a84c' }} />
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {photos.slice(0, visibleCount).map(photo => (
            <button
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-stone-100 hover:opacity-90 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.public_url}
                alt={photo.caption ?? ''}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">{photo.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* View more */}
      {photos.length > visibleCount && (
        <div className="text-center mb-6">
          <button
            onClick={() => setVisibleCount(v => v + 9)}
            className="text-sm text-stone-400 hover:text-stone-600 underline underline-offset-4 transition-colors"
          >
            {l.viewMore}
          </button>
        </div>
      )}

      {/* Upload Button */}
      <div className="text-center">
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border text-sm font-medium transition-all hover:shadow-sm"
          style={{ borderColor: '#c9a84c', color: '#c9a84c' }}
        >
          <span>✦</span>
          {l.uploadBtn}
        </button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-fade-in">
            <h3 className="font-cormorant text-xl font-light text-stone-800 mb-5">
              {l.uploadBtn}
            </h3>

            {/* Upload Status */}
            {uploadStatus === 'success' && (
              <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-green-600 text-sm mb-4">
                {l.success}
              </div>
            )}
            {uploadStatus === 'error' && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-500 text-sm mb-4">
                {l.error}
              </div>
            )}

            {/* Drop Zone */}
            {!preview ? (
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center cursor-pointer hover:border-gold hover:bg-stone-50 transition-all"
              >
                <div className="text-4xl mb-3">📷</div>
                <p className="text-stone-500 text-sm">{l.dragDrop}</p>
                <p className="text-stone-300 text-xs mt-1">{l.maxSize}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden mb-4 aspect-video bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null)
                    setPreview(null)
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 text-stone-600 flex items-center justify-center hover:bg-white transition text-sm"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Fields */}
            <div className="space-y-3 mt-4">
              <input
                type="text"
                value={uploaderName}
                onChange={e => setUploaderName(e.target.value)}
                placeholder={l.yourName}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
              />
              <input
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder={l.captionPlaceholder}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setShowUpload(false)
                  setSelectedFile(null)
                  setPreview(null)
                  setUploaderName('')
                  setCaption('')
                }}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition"
              >
                {l.cancel}
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex-1 py-3 rounded-xl text-white text-sm font-medium transition disabled:opacity-40"
                style={{ background: uploading ? '#a8a29e' : '#c9a84c' }}
              >
                {uploading ? l.uploading : l.submit}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={e => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhoto.public_url}
              alt={selectedPhoto.caption ?? ''}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            {selectedPhoto.caption && (
              <p className="text-white/80 text-sm text-center mt-3">
                {selectedPhoto.caption}
              </p>
            )}
            {selectedPhoto.uploaded_by_name && (
              <p className="text-white/50 text-xs text-center mt-1">
                — {selectedPhoto.uploaded_by_name}
              </p>
            )}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-2xl transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
