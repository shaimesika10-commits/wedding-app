// ============================================================
//  GrandInvite – Cover Photo Upload API
//  POST /api/wedding/cover-upload
//  Uploads a cover image to Supabase Storage and updates wedding record
//  src/app/api/wedding/cover-upload/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const BUCKET_NAME = 'wedding-covers'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const wedding_id = formData.get('wedding_id') as string | null

    if (!file || !wedding_id) {
      return NextResponse.json({ error: 'Missing file or wedding_id' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG or WebP.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 10 MB.' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Ownership + premium check
    const { data: wedding } = await supabase
      .from('weddings')
      .select('id, plan')
      .eq('id', wedding_id)
      .eq('user_id', user.id)
      .single()
    if (!wedding) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Image upload is a Premium-only feature
    if ((wedding as typeof wedding & { plan?: string }).plan !== 'premium') {
      return NextResponse.json(
        { error: 'premium_required', message: 'Cover image upload requires a Premium plan.' },
        { status: 403 }
      )
    }

    // Build unique file path
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const fileName = `${wedding_id}/cover-${Date.now()}.${ext}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload (upsert so re-uploads overwrite the same slot)
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('Cover upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)
    const publicUrl = urlData.publicUrl

    // Persist URL on wedding record
    const { error: updateError } = await supabase
      .from('weddings')
      .update({ cover_image_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', wedding_id)

    if (updateError) {
      console.error('Wedding cover_image_url update error:', updateError)
      return NextResponse.json({ error: 'Failed to save image URL' }, { status: 500 })
    }

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('Cover upload route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
