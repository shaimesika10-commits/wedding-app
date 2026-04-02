import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

const BUCKET = 'wedding-gallery'
const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED = ['image/jpeg','image/png','image/webp','image/gif']

export async function GET(req: NextRequest) {
  try {
    const wedding_id = new URL(req.url).searchParams.get('wedding_id')
    if (!wedding_id) return NextResponse.json({ error: 'Missing wedding_id' }, { status: 400 })
    const supabase = await createServerSupabaseClient()
    const { data: photos, error } = await supabase.from('gallery_photos').select('*')
      .eq('wedding_id', wedding_id).eq('approved', true).order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ photos })
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const wedding_id = formData.get('wedding_id') as string | null
    const uploaded_by_name = formData.get('uploaded_by_name') as string | null
    const caption = formData.get('caption') as string | null
    if (!file || !wedding_id) return NextResponse.json({ error: 'Missing file or wedding_id' }, { status: 400 })
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large' }, { status: 400 })
    const supabase = await createServerSupabaseClient()
    const { data: wedding } = await supabase.from('weddings').select('id').eq('id', wedding_id).eq('is_active', true).single()
    if (!wedding) return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `${wedding_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, buffer, { contentType: file.type })
    if (uploadError) return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
    const { data: photo, error: dbError } = await supabase.from('gallery_photos').insert({
      wedding_id, uploaded_by_name: uploaded_by_name?.trim() || null,
      public_url: urlData.publicUrl, caption: caption?.trim() || null, approved: true,
    }).select().single()
    if (dbError) return NextResponse.json({ error: 'DB error' }, { status: 500 })
    return NextResponse.json({ photo }, { status: 201 })
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
    const params = new URL(req.url).searchParams
    const photo_id = params.get('photo_id'), wedding_id = params.get('wedding_id')
    if (!photo_id || !wedding_id) return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: wedding } = await supabase.from('weddings').select('id').eq('id', wedding_id).eq('user_id', user.id).single()
    if (!wedding) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { data: photo } = await supabase.from('gallery_photos').select('public_url').eq('id', photo_id).single()
    if (photo?.public_url) {
      const parts = photo.public_url.split(`/${BUCKET}/`)
      if (parts[1]) await supabase.storage.from(BUCKET).remove([parts[1]])
    }
    const { error } = await supabase.from('gallery_photos').delete().eq('id', photo_id).eq('wedding_id', wedding_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
