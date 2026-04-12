'use client'
// ============================================================
//  GrandInvite – AI Invitation Builder Chat Widget
//  src/components/AIInvitationChat.tsx
// ============================================================

import { useState, useEffect, useRef } from 'react'
import type { Locale } from '@/lib/i18n'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

interface GeneratedInvitation {
  welcome_message?: string
  ceremony_time?: string
  reception_time?: string
  dress_code?: string
  additional_info?: string
  rsvp_message?: string
}

interface AIInvitationChatProps {
  locale: Locale
  weddingContext?: Record<string, string>
  onInvitationGenerated?: (invitation: GeneratedInvitation) => void
}

const UI = {
  fr: {
    title: 'Assistant Invitation IA',
    subtitle: 'Décrivez votre rêve, je crée votre invitation',
    placeholder: 'Décrivez votre vision...',
    send: 'Envoyer',
    minimize: 'Réduire',
    expand: 'Ouvrir l\'assistant IA',
    applyBtn: 'Appliquer à mon invitation ✨',
    thinking: 'En train de réfléchir...',
    badge: 'IA',
  },
  he: {
    title: 'עוזר הזמנות AI',
    subtitle: 'תאר/י את החלום שלך, אני אבנה את ההזמנה',
    placeholder: 'תאר/י את החזון שלך...',
    send: 'שלח',
    minimize: 'מזעור',
    expand: 'פתח עוזר AI',
    applyBtn: 'החל על ההזמנה שלי ✨',
    thinking: 'חושב...',
    badge: 'AI',
  },
  en: {
    title: 'AI Invitation Assistant',
    subtitle: 'Describe your dream, I\'ll craft your invitation',
    placeholder: 'Describe your vision...',
    send: 'Send',
    minimize: 'Minimize',
    expand: 'Open AI Assistant',
    applyBtn: 'Apply to my invitation ✨',
    thinking: 'Thinking...',
    badge: 'AI',
  },
}

export default function AIInvitationChat({
  locale,
  weddingContext,
  onInvitationGenerated,
}: AIInvitationChatProps) {
  const l = UI[locale] ?? UI.en
  const isRTL = locale === 'he'

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedInvitation, setGeneratedInvitation] = useState<GeneratedInvitation | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load first message on mount
  useEffect(() => {
    fetch(`/api/ai/invitation-chat?locale=${locale}`)
      .then(r => r.json())
      .then(data => {
        setMessages([{ role: 'assistant', content: data.firstMessage }])
      })
      .catch(() => {})
  }, [locale])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // Add placeholder for assistant response
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }])

    try {
      const response = await fetch('/api/ai/invitation-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          weddingContext,
          locale,
        }),
      })

      const data = await response.json()

      // Replace streaming placeholder with actual reply
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: data.reply ?? '' },
      ])

      if (data.ready && data.invitation) {
        setGeneratedInvitation(data.invitation)
      }
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: locale === 'he'
            ? 'מצטער/ת, אירעה שגיאה. נסה/י שוב.'
            : locale === 'fr'
            ? "Désolé, une erreur s'est produite. Réessayez."
            : 'Sorry, an error occurred. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Minimized button ──────────────────────────────────────
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed top-20 right-4 flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-medium shadow-lg transition-all hover:scale-105 z-40"
        style={{ background: 'linear-gradient(135deg, #c9a84c, #a07830)' }}
        dir="ltr"
      >
        <span style={{ fontSize: '1rem' }}>✨</span>
        <span className="hidden sm:inline">{l.expand}</span>
        <span
          className="px-1.5 py-0.5 rounded-md text-xs font-bold"
          style={{ background: 'rgba(255,255,255,0.25)' }}
        >
          {l.badge}
        </span>
      </button>
    )
  }

  // ── Chat window ───────────────────────────────────────────
  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed top-16 right-4 w-80 md:w-96 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden"
      style={{ height: '520px', maxHeight: 'calc(100vh - 80px)', border: '1px solid rgba(201,168,76,0.2)', background: '#fff' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ background: 'linear-gradient(135deg, #c9a84c, #a07830)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1rem' }}>✨</span>
            <span className="text-white font-medium text-sm">{l.title}</span>
          </div>
          <p className="text-yellow-100 text-xs mt-0.5 opacity-80">{l.subtitle}</p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-white/70 hover:text-white transition text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: '#faf8f5' }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
              style={{
                background: msg.role === 'user' ? '#c9a84c' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#1c1917',
                borderRadius: msg.role === 'user'
                  ? isRTL ? '18px 18px 18px 4px' : '18px 18px 4px 18px'
                  : isRTL ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.isStreaming ? (
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: '#c9a84c', animationDelay: '0ms' }}
                  />
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: '#c9a84c', animationDelay: '150ms' }}
                  />
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: '#c9a84c', animationDelay: '300ms' }}
                  />
                  <span className="text-stone-400 text-xs ms-1">{l.thinking}</span>
                </span>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Generated invitation card */}
      {generatedInvitation && (
        <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-200">
          <p className="text-xs text-yellow-700 font-medium mb-2">
            {locale === 'he' ? '✨ ההזמנה מוכנה!' : locale === 'fr' ? '✨ Invitation générée !' : '✨ Invitation ready!'}
          </p>
          <button
            onClick={() => onInvitationGenerated?.(generatedInvitation)}
            className="w-full py-2 rounded-xl text-white text-xs font-medium tracking-wide"
            style={{ background: '#c9a84c' }}
          >
            {l.applyBtn}
          </button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-stone-100 flex gap-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder={l.placeholder}
          rows={1}
          className="flex-1 px-3 py-2.5 rounded-xl border border-stone-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-500 transition"
          style={{ maxHeight: '80px', overflowY: 'auto' }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: '#c9a84c', minWidth: '60px' }}
        >
          {l.send}
        </button>
      </div>
    </div>
  )
}
