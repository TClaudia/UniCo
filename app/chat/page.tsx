'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AvatarCharacter, AvatarEditor, EMOTIONS,
} from '@/components/avatar/AvatarCharacter'
import type { AvatarConfig, CharacterEmotion } from '@/components/avatar/AvatarCharacter'
import { useChat } from '@/hooks/useChat'
import { getProfile } from '@/lib/storage'

const DEFAULT_CONFIG: AvatarConfig = {
  skinTone: 'medium', hairStyle: 'medium', hairColor: 'black',
  eyeColor: 'brown', outfit: 'suit', accessory: 'glasses', name: 'Alex',
}

const QUICK_ACTIONS = [
  'Vreau să economisesc',
  'Investiții fonduri',
  'Credit imobiliar',
  'Fond de urgență',
  'Transfer rapid',
]

const HISTORY_ITEMS = [
  { label: 'Conversație curentă',          active: true  },
  { label: 'Economii și depozite — ieri',   active: false },
  { label: 'Credit imobiliar — 13 mai',     active: false },
  { label: 'Fonduri de investiții — 10 mai',active: false },
  { label: 'Planificare pensie — 8 mai',    active: false },
]

export default function ChatPage() {
  const router = useRouter()
  const [mounted,         setMounted]         = useState(false)
  const [showHistory,     setShowHistory]     = useState(false)
  const [showAvatarEditor,setShowAvatarEditor]= useState(false)
  const [avatarConfig,    setAvatarConfig]    = useState<AvatarConfig>(DEFAULT_CONFIG)
  const [input,           setInput]           = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)

  const { messages, emotion, isLoading, sendMessage, clearMessages } = useChat()
  const emotionMeta = EMOTIONS[emotion] ?? EMOTIONS.idle

  useEffect(() => {
    setMounted(true)
    if (!getProfile()) { router.push('/onboarding'); return }
    try {
      const s = localStorage.getItem('uc_avatar_config')
      if (s) setAvatarConfig(JSON.parse(s))
    } catch {}
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = useCallback(() => {
    const t = input.trim()
    if (!t || isLoading) return
    setInput('')
    sendMessage(t)
    inputRef.current?.focus()
  }, [input, isLoading, sendMessage])

  const handleKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }, [handleSend])

  const updateConfig = (key: keyof AvatarConfig, value: string) => {
    setAvatarConfig(prev => {
      const next = { ...prev, [key]: value }
      try { localStorage.setItem('uc_avatar_config', JSON.stringify(next)) } catch {}
      return next
    })
  }

  if (!mounted) return null

  return (
    <>
      {/* ── Responsive styles ── */}
      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform:translateY(0); opacity:.4 }
          40%          { transform:translateY(-6px); opacity:1 }
        }
        @keyframes spin { to { transform:rotate(360deg) } }
        * { box-sizing:border-box }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.1); border-radius:2px }
        input::placeholder { color:#9B9A96 }

        /* ── Desktop layout ── */
        .chat-root {
          display:flex; height:100dvh; min-height:600px;
          background:#F8F7F5;
          font-family:'DM Sans','Segoe UI',system-ui,sans-serif;
          overflow:hidden;
        }
        .chat-left  { flex:1 1 0; display:flex; flex-direction:column; background:#FFF; border-right:1px solid #E2E0DC; position:relative; min-width:0 }
        .avatar-panel {
          width:clamp(260px,28%,320px); flex-shrink:0;
          display:flex; flex-direction:column;
          background:linear-gradient(165deg,#1A1A2E 0%,#16213E 60%,#0F3460 100%);
          position:relative; overflow:hidden;
        }
        /* Mobile avatar bar — hidden on desktop */
        .mobile-avatar-bar { display:none }

        /* ── Mobile (<= 720px) ── */
        @media(max-width:720px) {
          .avatar-panel { display:none }
          .mobile-avatar-bar {
            display:flex; align-items:center; gap:12px;
            padding:10px 16px 8px;
            background:linear-gradient(135deg,#1A1A2E,#0F3460);
            flex-shrink:0;
          }
        }
      `}</style>

      <div className="chat-root">

        {/* ══════════════════════════════════════════
            LEFT PANEL — Chat
        ══════════════════════════════════════════ */}
        <div className="chat-left">

          {/* ── Top header ── */}
          <div style={{
            padding:'0 14px', height:58,
            borderBottom:'1px solid #E2E0DC',
            display:'flex', alignItems:'center', gap:8,
            background:'#FFF', flexShrink:0,
          }}>
            {/* Back */}
            <IconBtn onClick={() => router.push('/dashboard')} label="Înapoi">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </IconBtn>

            {/* History */}
            <IconBtn onClick={() => setShowHistory(h => !h)} label="Istoric"
              active={showHistory}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </IconBtn>

            {/* Title */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#1A1A2E', letterSpacing:'-0.2px' }}>
                Uni<span style={{ color:'#E30613' }}>Co</span> — Coach Financiar AI
              </div>
              <div style={{ fontSize:10, color:'#9B9A96', marginTop:1 }}>
                UniCredit Bank România · Securizat
              </div>
            </div>

            {/* Emotion chip */}
            <div style={{
              display:'flex', alignItems:'center', gap:5,
              padding:'3px 9px', borderRadius:20, flexShrink:0,
              background:`${emotionMeta.color}14`,
              border:`1px solid ${emotionMeta.color}30`,
            }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:emotionMeta.color, display:'inline-block' }}/>
              <span style={{ fontSize:10, fontWeight:500, color:emotionMeta.color }}>{emotionMeta.label}</span>
            </div>

            {/* Clear */}
            <IconBtn onClick={clearMessages} label="Conversație nouă" hoverColor="#E30613">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-3.57"/>
              </svg>
            </IconBtn>
          </div>

          {/* ── Mobile avatar banner (hidden on desktop via CSS) ── */}
          <div className="mobile-avatar-bar">
            <AvatarCharacter config={avatarConfig} emotion={emotion} size="sm" />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'#FFF' }}>{avatarConfig.name}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginTop:2 }}>AI Financial Advisor</div>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:4, marginTop:5,
                padding:'2px 8px', borderRadius:20,
                background:`${emotionMeta.color}25`,
                border:`1px solid ${emotionMeta.color}45`,
              }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:emotionMeta.color, display:'inline-block' }}/>
                <span style={{ fontSize:10, color:emotionMeta.color, fontWeight:500 }}>{emotionMeta.label}</span>
              </div>
            </div>
            {/* Edit avatar on mobile */}
            <button
              onClick={() => setShowAvatarEditor(s => !s)}
              style={{
                width:32, height:32, borderRadius:8, border:'none', cursor:'pointer',
                background: showAvatarEditor ? '#E30613' : 'rgba(255,255,255,0.12)',
                color:'#FFF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
              </svg>
            </button>
          </div>

          {/* Mobile avatar editor drawer */}
          <AnimatePresence>
            {showAvatarEditor && (
              <motion.div
                initial={{ height:0, opacity:0 }}
                animate={{ height:'auto', opacity:1 }}
                exit={{ height:0, opacity:0 }}
                style={{
                  background:'linear-gradient(165deg,#1A1A2E,#0F3460)',
                  overflow:'hidden', flexShrink:0,
                }}
              >
                <div style={{ maxHeight:340, overflowY:'auto' }}>
                  <AvatarEditor config={avatarConfig} onChange={updateConfig}
                    onClose={() => setShowAvatarEditor(false)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── History drawer ── */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ x:-280, opacity:0 }}
                animate={{ x:0, opacity:1 }}
                exit={{ x:-280, opacity:0 }}
                transition={{ type:'spring', stiffness:300, damping:30 }}
                style={{
                  position:'absolute', top:58, left:0, zIndex:30,
                  width:252, height:'calc(100% - 58px)',
                  background:'#FFF',
                  boxShadow:'4px 0 24px rgba(0,0,0,0.1)',
                  borderRight:'1px solid #E2E0DC',
                  display:'flex', flexDirection:'column',
                }}
              >
                <div style={{ padding:'13px 16px 9px', borderBottom:'1px solid #F0EFED' }}>
                  <span style={{ fontSize:11, fontWeight:600, color:'#9B9A96', letterSpacing:'0.08em', textTransform:'uppercase' }}>
                    Conversații recente
                  </span>
                </div>
                <div style={{ flex:1, overflowY:'auto' }}>
                  {HISTORY_ITEMS.map((item, i) => (
                    <div key={i}
                      style={{
                        padding:'11px 16px', fontSize:13, cursor:'pointer',
                        color: item.active ? '#E30613' : '#5A5956',
                        background: item.active ? 'rgba(227,6,19,0.05)' : 'transparent',
                        borderLeft: item.active ? '2px solid #E30613' : '2px solid transparent',
                      }}
                      onMouseEnter={e => { if (!item.active)(e.currentTarget as HTMLDivElement).style.background = '#F0EFED' }}
                      onMouseLeave={e => { if (!item.active)(e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
                <div style={{ padding:'12px 16px', borderTop:'1px solid #F0EFED' }}>
                  <button
                    onClick={() => { clearMessages(); setShowHistory(false) }}
                    style={{
                      width:'100%', padding:'8px 12px', borderRadius:8,
                      border:'1px solid #E2E0DC', background:'none',
                      color:'#5A5956', fontSize:12, cursor:'pointer',
                      display:'flex', alignItems:'center', gap:6, justifyContent:'center',
                    }}>
                    + Conversație nouă
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Disclaimer ── */}
          <div style={{
            padding:'5px 16px',
            background:'rgba(245,158,11,0.08)',
            borderBottom:'1px solid rgba(245,158,11,0.18)',
            flexShrink:0,
          }}>
            <p style={{ fontSize:11, color:'#92400e', margin:0, lineHeight:1.5 }}>
              ⚠️ <strong>Informare:</strong> Recomandările AI au caracter informativ și nu constituie consultanță financiară certificată.
            </p>
          </div>

          {/* ── Messages ── */}
          <div style={{
            flex:1, overflowY:'auto', padding:'16px 18px',
            display:'flex', flexDirection:'column', gap:14,
            scrollbarWidth:'thin', scrollbarColor:'#E2E0DC transparent',
          }}>
            {messages.length === 1 && messages[0].id === 'welcome' && (
              <p style={{ textAlign:'center', color:'#9B9A96', fontSize:12, margin:0 }}>
                Folosește sugestiile de mai jos sau scrie propria ta întrebare
              </p>
            )}

            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0 }} transition={{ duration:0.2 }}>
                  <MsgBubble msg={msg} initial={avatarConfig.name[0] ?? 'A'} />
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {isLoading && (
                <motion.div key="typing"
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0 }}
                  style={{ display:'flex', alignItems:'flex-end', gap:8 }}>
                  <AvatarThumb initial={avatarConfig.name[0] ?? 'A'} />
                  <div style={{
                    padding:'11px 15px', borderRadius:'18px 18px 18px 4px',
                    background:'#F0EFED', display:'flex', gap:5, alignItems:'center',
                  }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        width:7, height:7, borderRadius:'50%', background:'#9B9A96',
                        animation:`bounce 1.2s ${i*0.2}s ease-in-out infinite`,
                      }}/>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef}/>
          </div>

          {/* ── Quick actions ── */}
          <div style={{
            padding:'7px 16px 0', display:'flex', gap:6,
            overflowX:'auto', scrollbarWidth:'none', flexShrink:0,
          }}>
            {QUICK_ACTIONS.map(q => (
              <Chip key={q} label={q} onClick={() => { setInput(q); inputRef.current?.focus() }}/>
            ))}
          </div>

          {/* ── Input bar ── */}
          <div style={{ padding:'9px 16px 13px', flexShrink:0 }}>
            <InputBar
              inputRef={inputRef}
              value={input}
              onChange={setInput}
              onKeyDown={handleKey}
              onSend={handleSend}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RIGHT PANEL — Avatar (desktop only via CSS)
        ══════════════════════════════════════════ */}
        <div className="avatar-panel">
          {/* Decorative blobs */}
          <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'rgba(227,6,19,0.10)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:80, left:-40, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }}/>

          {/* Panel header */}
          <div style={{
            padding:'0 16px', height:58, flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'space-between',
            borderBottom:'1px solid rgba(255,255,255,0.07)',
          }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'#FFF', letterSpacing:'0.01em' }}>
                {avatarConfig.name}
              </div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:1 }}>
                AI Financial Advisor
              </div>
            </div>
            <button
              onClick={() => setShowAvatarEditor(s => !s)}
              title="Editează avatarul"
              style={{
                width:32, height:32, borderRadius:8, cursor:'pointer',
                background: showAvatarEditor ? '#E30613' : 'rgba(255,255,255,0.1)',
                border:`1px solid ${showAvatarEditor ? '#E30613' : 'rgba(255,255,255,0.15)'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#FFF', transition:'all 0.2s',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
              </svg>
            </button>
          </div>

          {/* Avatar display */}
          {!showAvatarEditor ? (
            <div style={{
              flex:1, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
              padding:'0 20px 24px', position:'relative',
            }}>
              <AvatarCharacter config={avatarConfig} emotion={emotion} size="lg"/>

              {/* Emotion badge */}
              <div style={{
                marginTop:14, padding:'5px 14px', borderRadius:20,
                background:`${emotionMeta.color}20`,
                border:`1px solid ${emotionMeta.color}40`,
                display:'flex', alignItems:'center', gap:6,
              }}>
                <span style={{
                  width:6, height:6, borderRadius:'50%', display:'inline-block',
                  background:emotionMeta.color, boxShadow:`0 0 7px ${emotionMeta.color}`,
                }}/>
                <span style={{ fontSize:11, fontWeight:500, color:emotionMeta.color, letterSpacing:'0.03em' }}>
                  {emotionMeta.label}
                </span>
              </div>

              {/* Emotion quick-set */}
              <div style={{
                marginTop:14, width:'100%',
                display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:4,
              }}>
                {(Object.entries(EMOTIONS) as [CharacterEmotion, { label:string; color:string }][]).map(([k, v]) => (
                  <button key={k} title={v.label}
                    style={{
                      padding:'5px 2px', borderRadius:6, fontSize:9, fontWeight:500,
                      cursor:'pointer', transition:'all 0.15s',
                      border:`1px solid ${emotion === k ? v.color : 'rgba(255,255,255,0.1)'}`,
                      background: emotion === k ? `${v.color}22` : 'rgba(255,255,255,0.04)',
                      color: emotion === k ? v.color : 'rgba(255,255,255,0.4)',
                    }}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AvatarEditor config={avatarConfig} onChange={updateConfig}
              onClose={() => setShowAvatarEditor(false)} />
          )}
        </div>

      </div>
    </>
  )
}

// ─── Small sub-components ────────────────────────────────────────────────────

function IconBtn({
  onClick, label, active, hoverColor, children,
}: {
  onClick: () => void
  label: string
  active?: boolean
  hoverColor?: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        width:33, height:33, borderRadius:8, border:'none', cursor:'pointer',
        background: active ? '#F0EFED' : 'none',
        display:'flex', alignItems:'center', justifyContent:'center',
        color:'#5A5956', flexShrink:0, transition:'background 0.15s, color 0.15s',
      }}
      onMouseEnter={e => {
        const b = e.currentTarget as HTMLButtonElement
        b.style.background = '#F0EFED'
        if (hoverColor) b.style.color = hoverColor
      }}
      onMouseLeave={e => {
        const b = e.currentTarget as HTMLButtonElement
        b.style.background = active ? '#F0EFED' : 'none'
        b.style.color = '#5A5956'
      }}
    >
      {children}
    </button>
  )
}

function AvatarThumb({ initial }: { initial: string }) {
  return (
    <div style={{
      width:28, height:28, borderRadius:'50%', background:'#E30613',
      display:'flex', alignItems:'center', justifyContent:'center',
      flexShrink:0, fontSize:11, fontWeight:700, color:'#FFF',
    }}>
      {initial}
    </div>
  )
}

function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{
        flexShrink:0, padding:'5px 11px', borderRadius:20,
        border:'1px solid #E2E0DC', background:'#FFF',
        fontSize:12, color:'#5A5956', cursor:'pointer',
        whiteSpace:'nowrap', transition:'all 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='#E30613'; (e.currentTarget as HTMLButtonElement).style.color='#E30613' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='#E2E0DC'; (e.currentTarget as HTMLButtonElement).style.color='#5A5956' }}
    >
      {label}
    </button>
  )
}

interface InputBarProps {
  value: string
  onChange: (v: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onSend: () => void
  isLoading: boolean
  inputRef: React.RefObject<HTMLInputElement>
}
const InputBar = ({ value, onChange, onKeyDown, onSend, isLoading, inputRef }: InputBarProps) => {
  return (
    <div
      style={{
        display:'flex', alignItems:'center', gap:8,
        background:'#F0EFED', borderRadius:26,
        padding:'4px 6px 4px 14px',
        border:'1.5px solid #E2E0DC', transition:'border-color 0.2s',
      }}
      onFocusCapture={e => { (e.currentTarget as HTMLDivElement).style.borderColor='#E30613' }}
      onBlurCapture={e  => { (e.currentTarget as HTMLDivElement).style.borderColor='#E2E0DC' }}
    >
      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Scrie un mesaj..."
        disabled={isLoading}
        style={{
          flex:1, background:'none', border:'none', outline:'none',
          fontSize:14, color:'#1A1A2E',
          fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif",
        }}
      />
      <button
        onClick={onSend}
        disabled={!value.trim() || isLoading}
        style={{
          width:38, height:38, borderRadius:'50%', border:'none',
          background: value.trim() && !isLoading ? '#E30613' : '#D8D6D2',
          cursor: value.trim() && !isLoading ? 'pointer' : 'default',
          display:'flex', alignItems:'center', justifyContent:'center',
          flexShrink:0, transition:'all 0.2s',
        }}>
        {isLoading ? (
          <div style={{
            width:14, height:14, borderRadius:'50%',
            border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#FFF',
            animation:'spin 0.7s linear infinite',
          }}/>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={value.trim() ? '#FFF' : '#9B9A96'}
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        )}
      </button>
    </div>
  )
}

type MsgType = {
  id: string; role: 'user'|'assistant'; content: string;
  product?: string|null;
  cta?: { label:string; url:string; type:string }|null;
  showDisclaimer?: boolean;
}

function MsgBubble({ msg, initial }: { msg: MsgType; initial: string }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display:'flex', flexDirection: isUser ? 'row-reverse' : 'row', alignItems:'flex-end', gap:8 }}>
      {!isUser && <AvatarThumb initial={initial}/>}
      <div style={{
        maxWidth:'74%', display:'flex', flexDirection:'column', gap:6,
        alignItems: isUser ? 'flex-end' : 'flex-start',
      }}>
        {/* Bubble */}
        <div style={{
          padding:'11px 15px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser ? '#1A1A2E' : '#F0EFED',
          color: isUser ? '#FFF' : '#1A1A2E',
          fontSize:14, lineHeight:1.55, letterSpacing:'-0.1px',
        }}>
          {msg.content}
          {!isUser && msg.product && (
            <div style={{ marginTop:8, paddingTop:8, borderTop:'1px solid rgba(0,0,0,0.08)', fontSize:12, color:'#3A7BD5', fontWeight:500 }}>
              📦 {msg.product}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        {!isUser && msg.showDisclaimer && (
          <div style={{
            padding:'7px 11px',
            background:'rgba(245,158,11,0.1)',
            border:'1px solid rgba(245,158,11,0.28)',
            borderRadius:10, fontSize:11, color:'#92400e', lineHeight:1.5,
          }}>
            ⚠️ Recomandare informativă — nu constituie consultanță financiară.
          </div>
        )}

        {/* CTA */}
        {!isUser && msg.cta && (
          <div style={{ display:'flex', flexDirection:'column', gap:5, width:'100%' }}>
            <a href={msg.cta.url} target="_blank" rel="noopener noreferrer"
              style={{
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'#E30613', color:'#FFF', padding:'10px 16px',
                borderRadius:10, fontSize:13, fontWeight:600, textDecoration:'none',
                transition:'opacity 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity='0.88' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity='1'   }}>
              {msg.cta.label} →
            </a>
            <a href="https://www.unicredit.ro/contact.html" target="_blank" rel="noopener noreferrer"
              style={{
                display:'flex', alignItems:'center', justifyContent:'center',
                border:'1px solid #E30613', color:'#E30613',
                padding:'9px 16px', borderRadius:10,
                fontSize:12, fontWeight:500, textDecoration:'none',
              }}>
              👤 Consultă un Specialist Uman
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
