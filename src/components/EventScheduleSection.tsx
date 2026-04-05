'use client'
// ============================================================
//  GrandInvite â Event Schedule Section
//  src/components/EventScheduleSection.tsx
// ============================================================

import type { EventSchedule } from '@/types'
import type { Locale } from '@/lib/i18n'

interface Props {
  schedule: EventSchedule[]
  locale: Locale
  t?: Record<string, string>
}

const DEFAULT_LABELS: Record<string, Record<string, string>> = {
  fr: { googleMaps: 'Google Maps', waze: 'Waze' },
  he: { googleMaps: 'Google Maps', waze: 'Waze' },
  en: { googleMaps: 'Google Maps', waze: 'Waze' },
}

export default function EventScheduleSection({ schedule, locale, t }: Props) {
  const labels = t ?? DEFAULT_LABELS[locale] ?? DEFAULT_LABELS.fr
  const timeFormat = (time: string) => {
    const [h, m] = time.split(':')
    return `${h}:${m}`
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(
      locale === 'he' ? 'he-IL' : locale === 'fr' ? 'fr-FR' : 'en-GB',
      { weekday: 'long', day: 'numeric', month: 'long' }
    )

  return (
    <div className="space-y-8">
      {schedule.map((event, idx) => (
        <div
          key={event.id}
          className="flex gap-6 items-start group"
        >
          {/* ×¢××× ×¦××¨ ×××× */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-[#c9a84c] mt-1.5 group-hover:scale-125 transition-transform" />
            {idx < schedule.length - 1 && (
              <div className="w-px flex-1 bg-stone-200 my-2 min-h-[48px]" />
            )}
          </div>

          {/* ×ª××× */}
          <div className="flex-1 pb-8">
            <div className="flex flex-wrap items-baseline gap-3 mb-1">
              <h3 className="font-cormorant text-xl text-stone-800 font-medium">
                {event.event_name}
              </h3>
              <span className="text-[#c9a84c] text-sm font-light">
                {timeFormat(event.start_time)}
                {event.end_time && ` â ${timeFormat(event.end_time)}`}
              </span>
            </div>

            <p className="text-stone-400 text-xs tracking-wide uppercase mb-2">
              {formatDate(event.event_date)}
            </p>

            {event.location_name && (
              <p className="text-stone-600 text-sm mb-1">{event.location_name}</p>
            )}
            {event.address && (
              <p className="text-stone-400 text-xs mb-3">{event.address}</p>
            )}

            {event.description && (
              <p className="text-stone-500 text-sm italic">{event.description}</p>
            )}

            {/* × ×××× */}
            {(event.google_maps_url || event.waze_url) && (
              <div className="flex gap-3 mt-3">
                {event.google_maps_url && (
                  <a
                    href={event.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#c9a84c] hover:underline tracking-wide"
                  >
                    {labels.googleMaps} â
                  </a>
                )}
                {event.waze_url && (
                  <a
                    href={event.waze_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-stone-500 hover:text-stone-700 tracking-wide"
                  >
                    {labels.waze} â
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
