// ============================================================
//  GrandInvite – Supabase Database Types (auto-generated style)
//  src/lib/database.types.ts
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      weddings: {
        Row: {
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
          locale: string
          is_active: boolean
          plan: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          bride_name: string
          groom_name: string
          wedding_date: string
          venue_name?: string | null
          venue_address?: string | null
          venue_city?: string | null
          venue_country?: string
          google_maps_url?: string | null
          waze_url?: string | null
          cover_image_url?: string | null
          welcome_message?: string | null
          rsvp_deadline?: string | null
          max_guests?: number
          locale?: string
          is_active?: boolean
          plan?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          slug?: string
          bride_name?: string
          groom_name?: string
          wedding_date?: string
          venue_name?: string | null
          venue_address?: string | null
          venue_city?: string | null
          venue_country?: string
          google_maps_url?: string | null
          waze_url?: string | null
          cover_image_url?: string | null
          welcome_message?: string | null
          rsvp_deadline?: string | null
          max_guests?: number
          locale?: string
          is_active?: boolean
          plan?: string
          updated_at?: string
        }
      }
      event_schedule: {
        Row: {
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
          created_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          event_name: string
          event_date: string
          start_time: string
          end_time?: string | null
          location_name?: string | null
          address?: string | null
          google_maps_url?: string | null
          waze_url?: string | null
          description?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          event_name?: string
          event_date?: string
          start_time?: string
          end_time?: string | null
          location_name?: string | null
          address?: string | null
          google_maps_url?: string | null
          waze_url?: string | null
          description?: string | null
          sort_order?: number
        }
      }
      guests: {
        Row: {
          id: string
          wedding_id: string
          name: string
          email: string | null
          phone: string | null
          adults_count: number
          children_count: number
          dietary_preferences: string | null
          allergies: string | null
          notes: string | null
          rsvp_status: string
          rsvp_submitted_at: string | null
          invitation_sent_at: string | null
          table_number: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          name: string
          email?: string | null
          phone?: string | null
          adults_count?: number
          children_count?: number
          dietary_preferences?: string | null
          allergies?: string | null
          notes?: string | null
          rsvp_status?: string
          rsvp_submitted_at?: string | null
          invitation_sent_at?: string | null
          table_number?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          email?: string | null
          phone?: string | null
          adults_count?: number
          children_count?: number
          dietary_preferences?: string | null
          allergies?: string | null
          notes?: string | null
          rsvp_status?: string
          rsvp_submitted_at?: string | null
          invitation_sent_at?: string | null
          table_number?: number | null
          updated_at?: string
        }
      }
      gallery_photos: {
        Row: {
          id: string
          wedding_id: string
          uploaded_by_name: string | null
          public_url: string
          caption: string | null
          approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          uploaded_by_name?: string | null
          public_url: string
          caption?: string | null
          approved?: boolean
          created_at?: string
        }
        Update: {
          caption?: string | null
          approved?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
