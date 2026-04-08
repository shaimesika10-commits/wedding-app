'use client'
// ============================================================
//  GrandInvite – Event Schedule Section
//  Groups events by day, shows day separators
//  src/components/EventScheduleSection.tsx
// ============================================================

import type { EventSchedule } from '@/types'
import type { Locale } from '@/lib/i18n'

interface Props {
  schedule: EventSchedule[]
  locale: Locale
  t?: Record<string, string>
  accentColor?: string
}

export default function EventScheduleSection({ schedule, locale, t, accentColor = '#c9a84c' }: Props) {
  const timeFormat = (time: string) => {
    const [h, m] = time.split(':')
    return `${h}:${m}`
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(
      locale === 'he' ? 'he-IL' : locale === 'fr' ? 'fr-FR' : 'en-GB',
      { weekday: 'long', day: 'numeric', month: 'long' }
    )

  // Group events by date (sorted chronologically)
  const grouped = schedule.reduce<Record<string, EventSchedule[]>>((acc, ev) => {
    const key = ev.event_date
    if (!acc[key]) acc[key] = []
    acc[key].push(ev)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort()

  return (
    <div className="space-y-10">
      {sortedDates.map((date, dayIdx) => {
        const dayEvents = grouped[date].sort((a, b) => a.start_time.localeCompare(b.start_time))

        return (
          <div key={date}>
            {/* Day header — only show if there are multiple days */}
            {sortedDates.length > 1 && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px" style={{ background: `${accentColor}30` }} />
                <span
                  className="text-xs tracking-[0.3em] uppercase font-medium px-3"
                  style={{ color: accentColor }}
                >
                  {formatDate(date)}
                </span>
                <div className="flex-1 h-px" style={{ background: `${accentColor}30` }} />
              </div>
            )}

            {/* Events in this day */}
            <div className="space-y-0">
              {dayEvents.map((event, idx) => (
                <div
                  key={event.id}
                  className="flex gap-6 items-start group"
                >
                  {/* Timeline spine */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 group-hover:scale-125 transition-transform flex-shrink-0"
                      style={{ background: accentColor }}
                    />
                    {idx < dayEvents.length - 1 && (
                      <div className="w-px flex-1 my-2 min-h-[48px]" style={{ background: '#e7e5e4' }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex flex-wrap items-baseline gap-3 mb-1">
                      <h3 className="font-cormorant text-xl text-stone-800 font-medium">
                        {event.event_name}
                      </h3>
                      <span className="text-sm font-light" style={{ color: accentColor }}>
                        {timeFormat(event.start_time)}
                        {event.end_time && ` – ${timeFormat(event.end_time)}`}
                      </span>
                    </div>

                    {/* Show date under event name only when there's a single-day view */}
                    {sortedDates.length === 1 && (
                      <p className="text-stone-400 text-xs tracking-wide uppercase mb-2">
                        {formatDate(event.event_date)}
                      </p>
                    )}

                    {event.location_name && (
                      <p className="text-stone-600 text-sm mb-1">{event.location_name}</p>
                    )}
                    {event.address && (
                      <p className="text-stone-400 text-xs mb-3">{event.address}</p>
                    )}

                    {event.description && (
                      <p className="text-stone-500 text-sm italic">{event.description}</p>
                    )}

                    {/* Navigation */}
                    {(event.google_maps_url || event.waze_url) && (
                      <div className="flex gap-3 mt-3">
                        {event.google_maps_url && (
                          <a
                            href={event.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs hover:underline tracking-wide"
                            style={{ color: accentColor }}
                          >
                            Google Maps ↗
                          </a>
                        )}
                        {event.waze_url && (
                          <a
                            href={event.waze_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-stone-500 hover:text-stone-700 tracking-wide"
                          >
                            Waze ↗
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
