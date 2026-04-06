// ============================================================
//  GrandInvite – TypeScript Types
// ============================================================

export type Locale = 'fr' | 'he' | 'en'

export type RSVPStatus = 'confirmed' | 'declined' | 'pending'

export interface Wedding {
    id: string
    user_id: string
    slug: string
    bride_name: string
    groom_name: string
    wedding_date: string
    venue_name: string | null
    venue_address: string | null
    venue_city: string | null
    venue_country: string
    google_maps_url: string | null
    waze_url: string | null
    cover_image_url: string | null
    welcome_message: string | null
    rsvp_deadline: string | null
    max_guests: number
    font_style: string | null
    layout_style: string | null
    guest_pin: string | null
    locale: Locale
    is_active: boolean
    plan: 'free' | 'premium'
    created_at: string
    updated_at: string
    event_schedule?: EventSchedule[]
}

export interface EventSchedule {
    id: string
    wedding_id: string
    event_name: string
    event_date: string
    start_time: string
    end_time: string | null
    location_name: string | null
    address: string | null
    google_maps_url: string | null
    waze_url: string | null
    description: string | null
    sort_order: number
}

export interface Guest {
    id: string
    wedding_id: string
    name: string
    email: string | null
    phone: string | null
    adults_count: number
    children_count: number
    dietary_preferences: string | null
    allergies: string | null
    notes: string | null            // שדה 'אחר / הערות נוספות'
  rsvp_status: RSVPStatus
    rsvp_submitted_at: string | null
    invitation_sent_at: string | null
    table_number: number | null
    created_at: string
    updated_at: string
}

export interface RSVPFormData {
    name: string
    email?: string
    phone?: string
    adults_count: number
    children_count: number
    dietary_preferences?: string
    allergies?: string
    notes?: string                  // שדה 'אחר / הערות נוספות'
  rsvp_status: 'confirmed' | 'declined'
}

export interface GalleryPhoto {
    id: string
    wedding_id: string
    uploaded_by_name: string | null
    public_url: string
    caption: string | null
    approved: boolean
    created_at: string
}
