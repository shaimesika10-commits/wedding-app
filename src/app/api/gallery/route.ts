// ===========================================================
//  GrandInvite – Gallery API Route
//  POST /api/gallery  → העלאת תמונה  ל-Supabase Storage
//  GET  /api/gallery?wedding_id=xxx → רשימת תמונה
//  src/app/api/gallery/route.ts
// ===========================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const BUCKET_NAME = 'wedding-gallery'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
// ── GET – רשימת תמונות ──────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const wedding_id = searchParams.get('wedding_id')

    if (!wedding_id) {
      return NextResponse.json(
        { error: 'Missing wedding_id' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data: photos, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .eq('wedding_id', wedding_id)
      .eq('approved', true)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ photos })
  } catch (err) {
    console.error('Gallery GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
// ── POST – פעלאת  תמונה ──────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const wedding_id = formData.get('wedding_id') as string | null
    const uploaded_by_name = formData.get('uploaded_by_name') as string | null
    const caption = formData.get('caption') as string | null

    if (!file || !wedding_id) {
      return NextResponse.json(
        { error: 'Missing file or wedding_id' },
        { status: 400 }
      )
    }

    // Validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // וידוא שהחתונה  קייקה ופעילה
    const { data: wedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('id', wedding_id)
      .eq('is_active', true)
      .single()

    if (!wedding) {
      return NextResponse.json(
        { error: 'Wedding not found or inactive' },
        { status: 404 }
      )
    }

    // ימירת ייח חיקודי
    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `${wedding_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // העלאה  ל-Storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      )
    }

    // ייקת URL ציבורי
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    // שמירה ב-DB
    const { data: photo, error: dbError } = await supabase
      .from('gallery_photos')
      .insert({
        wedding_id,
        uploaded_by_name: uploaded_by_name?.trim() || null,
        public_url: urlData.publicUrl,
        caption: caption?.trim() || null,
        approved: true,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Gallery DB insert error:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ photo }, { status: 201 })
  } catch (err) {
    console.error('Gallery POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
// ── DELETE – מחיקת תמונה (מאקור בלבד) ───────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const photo_id = searchParams.get('photo_id')
    const wedding_id = searchParams.get('wedding_id')

    if (!photo_id || !wedding_id) {
      return NextResponse.json(
        { error: 'Missing photo_id or wedding_id' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: wedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('id', wedding_id)
      .eq('user_id', user.id)
      .single()

    if (!wedding) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: photo } = await supabase
      .from('gallery_photos')
      .select('public_url')
      .eq('id', photo_id)
      .eq('wedding_id', wedding_id)
      .single()

    if (photo?.public_url) {
      const urlParts = photo.public_url.split(`/${BUCKET_NAME}/`)
      if (urlParts[1]) {
        await supabase.storage.from(BUCKET_NAME).remove([urlParts[1]])
      }
    }

    const { error } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('id', photo_id)
      .eq('wedding_id', wedding_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Gallery DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
