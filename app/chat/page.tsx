'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AvatarEngine, AvatarStyle, AVATAR_EMOTION_META } from '@/components/avatar/AvatarEngine'
import { useChat } from '@/hooks/useChat'
import { getProfile } from '@/lib/storage'
import { getConversations, deleteConversation, StoredConversation } from '@/lib/storage'
import type { AvatarEmotion } from '@/types'

interface ChatAvatarStyle {
  name: string
  primaryColor?: string
}

const DEFAULT_STYLE: ChatAvatarStyle = { name: 'Alex' }

const QUICK_ACTIONS = [
  'Vreau să economisesc',
  'Investiții fonduri',
  'Credit imobiliar',
  'Fond de urgență',
  'Transfer rapid',
]

const PALETTE: { name: string; value: string | undefined }[] = [
  { name: 'Auto (după stare)', value: undefined },
  { name: 'Roșu UniCredit',   value: '#E2001A' },
  { name: 'Albastru',         value: '#0066CC' },
  { name: 'Verde',            value: '#00A862' },
  { name: 'Amber',            value: '#F5A623' },
  { name: 'Navy',             value: '#1A2535' },
  { name: 'Violet',           value: '#7B2D8B' },
  { name: 'Roz',              value: '#D63384' },
]

function formatTime(iso?: string): string {
  const d = iso ? new Date(iso) : new Date()
  return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
}

function formatHistoryDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'Azi'
  if (diffDays === 1) return 'Ieri'
  return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })
}

export default function ChatPage() {
  const router = useRouter()
  const [mounted,          setMounted]          = useState(false)
  const [showHistory,      setShowHistory]      = useState(false)
  const [showAvatarEditor, setShowAvatarEditor] = useState(false)
  const [avatarStyle,      setAvatarStyle]      = useState<ChatAvatarStyle>(DEFAULT_STYLE)
  const [input,            setInput]            = useState('')
  const [conversations,    setConversations]    = useState<StoredConversation[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)

  const { messages, emotion, isLoading, currentConversationId, sendMessage, clearMessages, loadConversation } = useChat()
  const emotionMeta = AVATAR_EMOTION_META[emotion as AvatarEmotion] ?? AVATAR_EMOTION_META.happy

  const refreshHistory = useCallback(() => setConversations(getConversations()), [])

  useEffect(() => {
    setMounted(true)
    if (!getProfile()) { router.push('/onboarding'); return }
    try {
      const s = localStorage.getItem('uc_avatar_style')
      if (s) setAvatarStyle(JSON.parse(s))
    } catch {}
    refreshHistory()
  }, [router, refreshHistory])

  useEffect(() => { refreshHistory() }, [messages, refreshHistory])

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

  const updateStyle = useCallback(<K extends keyof ChatAvatarStyle>(key: K, value: ChatAvatarStyle[K]) => {
    setAvatarStyle(prev => {
      const next = { ...prev, [key]: value }
      try { localStorage.setItem('uc_avatar_style', JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const handleNewChat = useCallback(() => {
    clearMessages()
    setShowHistory(false)
    refreshHistory()
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [clearMessages, refreshHistory])

  const handleLoadConversation = useCallback((conv: StoredConversation) => {
    loadConversation(conv)
    setShowHistory(false)
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [loadConversation])

  const handleDeleteConversation = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteConversation(id)
    refreshHistory()
    if (currentConversationId === id) clearMessages()
  }, [currentConversationId, clearMessages, refreshHistory])

  const engineStyle: AvatarStyle = {
    primaryColor: avatarStyle.primaryColor,
    name: avatarStyle.name,
  }

  if (!mounted) return null

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform:translateY(0); opacity:.4 }
          40%          { transform:translateY(-6px); opacity:1 }
        }
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(227,6,19,0.25) }
          50%      { box-shadow: 0 0 0 8px rgba(227,6,19,0) }
        }
        * { box-sizing:border-box }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.1); border-radius:2px }
        ::-webkit-scrollbar-track { background:transparent }
        input::placeholder { color:#9B9A96 }

        .chat-root {
          display:flex; height:100dvh; min-height:600px;
          background:#F0EFED;
          font-family:'DM Sans','Segoe UI',system-ui,sans-serif;
          overflow:hidden;
        }

        .chat-left {
          flex:1 1 0; display:flex; flex-direction:column;
          background:#FAFAF8; border-right:1px solid rgba(0,0,0,0.06);
          position:relative; min-width:0;
          box-shadow: 2px 0 24px rgba(0,0,0,0.04);
        }

        .avatar-panel {
          width:clamp(260px,28%,320px); flex-shrink:0;
          display:flex; flex-direction:column;
          background:linear-gradient(160deg,#0F1923 0%,#1A2535 45%,#0D2137 100%);
          position:relative; overflow:hidden;
        }
        .avatar-panel::before {
          content:''; position:absolute; top:-80px; right:-80px;
          width:280px; height:280px; border-radius:50%;
          background:radial-gradient(circle, rgba(227,6,19,0.18) 0%, transparent 70%);
          pointer-events:none;
        }
        .avatar-panel::after {
          content:''; position:absolute; bottom:60px; left:-60px;
          width:200px; height:200px; border-radius:50%;
          background:radial-gradient(circle, rgba(58,123,213,0.12) 0%, transparent 70%);
          pointer-events:none;
        }

        .mobile-avatar-bar { display:none }

        @media(max-width:720px) {
          .avatar-panel { display:none }
          .chat-root { background:#FFF }
          .chat-left { box-shadow:none; border-right:none }
          .mobile-avatar-bar {
            display:flex; align-items:center; gap:12px;
            padding:10px 16px 8px;
            background:linear-gradient(135deg,#0F1923,#0D2137);
            flex-shrink:0;
          }
        }
      `}</style>

      <div className="chat-root">

        {/* ══ LEFT PANEL — Chat ══ */}
        <div className="chat-left">

          {/* Top header */}
          <div style={{
            padding:'0 14px', height:60,
            borderBottom:'1px solid rgba(0,0,0,0.06)',
            display:'flex', alignItems:'center', gap:8,
            background:'rgba(255,255,255,0.95)',
            backdropFilter:'blur(8px)',
            flexShrink:0,
            position:'relative', zIndex:10,
          }}>
            <IconBtn onClick={() => router.push('/dashboard')} label="Înapoi">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </IconBtn>

            <IconBtn onClick={() => setShowHistory(h => !h)} label="Istoric" active={showHistory}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="15" y2="12"/>
                <line x1="3" y1="18" x2="18" y2="18"/>
              </svg>
            </IconBtn>

            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#0F1923', letterSpacing:'-0.2px' }}>
                Uni<span style={{ color:'#E30613' }}>Co</span>
                <span style={{ fontWeight:400, color:'#9B9A96', marginLeft:6, fontSize:13 }}>Coach Financiar AI</span>
              </div>
              <div style={{ fontSize:10, color:'#B0AEA8', marginTop:1, letterSpacing:'0.02em' }}>
                UniCredit Bank România · Securizat SSL
              </div>
            </div>

            {/* Active emotion chip */}
            <AnimatePresence mode="wait">
              <motion.div
                key={emotion}
                initial={{ opacity:0, scale:0.9 }}
                animate={{ opacity:1, scale:1 }}
                exit={{ opacity:0, scale:0.9 }}
                style={{
                  display:'flex', alignItems:'center', gap:5,
                  padding:'4px 10px', borderRadius:20, flexShrink:0,
                  background:`${emotionMeta.color}12`,
                  border:`1px solid ${emotionMeta.color}28`,
                }}>
                <span style={{
                  width:6, height:6, borderRadius:'50%', background:emotionMeta.color,
                  display:'inline-block', animation:'pulseGlow 2s infinite',
                }}/>
                <span style={{ fontSize:10, fontWeight:600, color:emotionMeta.color }}>{emotionMeta.label}</span>
              </motion.div>
            </AnimatePresence>

            <IconBtn onClick={handleNewChat} label="Conversație nouă" hoverColor="#E30613">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </IconBtn>
          </div>

          {/* Mobile avatar banner */}
          <div className="mobile-avatar-bar">
            <AvatarEngine emotion={emotion as AvatarEmotion} size="sm" avatarStyle={engineStyle} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'#FFF' }}>{avatarStyle.name}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:2 }}>AI Financial Advisor</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={emotion}
                  initial={{ opacity:0 }} animate={{ opacity:1 }}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:4, marginTop:5,
                    padding:'2px 8px', borderRadius:20,
                    background:`${emotionMeta.color}25`,
                    border:`1px solid ${emotionMeta.color}45`,
                  }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:emotionMeta.color, display:'inline-block' }}/>
                  <span style={{ fontSize:10, color:emotionMeta.color, fontWeight:500 }}>{emotionMeta.label}</span>
                </motion.div>
              </AnimatePresence>
            </div>
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
                style={{ background:'linear-gradient(165deg,#0F1923,#0D2137)', overflow:'hidden', flexShrink:0 }}
              >
                <div style={{ maxHeight:300, overflowY:'auto' }}>
                  <AvatarEngineEditor
                    avatarStyle={avatarStyle}
                    onChangeName={n => updateStyle('name', n)}
                    onChangeColor={c => updateStyle('primaryColor', c)}
                    onClose={() => setShowAvatarEditor(false)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History drawer */}
          <AnimatePresence>
            {showHistory && (
              <>
                <motion.div
                  initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  onClick={() => setShowHistory(false)}
                  style={{
                    position:'absolute', inset:0, zIndex:25,
                    background:'rgba(0,0,0,0.18)', backdropFilter:'blur(2px)',
                    top:60,
                  }}
                />
                <motion.div
                  initial={{ x:-280, opacity:0 }}
                  animate={{ x:0, opacity:1 }}
                  exit={{ x:-280, opacity:0 }}
                  transition={{ type:'spring', stiffness:320, damping:32 }}
                  style={{
                    position:'absolute', top:60, left:0, zIndex:30,
                    width:268, height:'calc(100% - 60px)',
                    background:'#FFF',
                    boxShadow:'6px 0 32px rgba(0,0,0,0.12)',
                    borderRight:'1px solid rgba(0,0,0,0.06)',
                    display:'flex', flexDirection:'column',
                  }}
                >
                  <div style={{
                    padding:'14px 16px 10px',
                    borderBottom:'1px solid #F0EFED',
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                  }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'#9B9A96', letterSpacing:'0.08em', textTransform:'uppercase' }}>
                      Conversații
                    </span>
                    <button
                      onClick={handleNewChat}
                      style={{
                        padding:'4px 10px', borderRadius:8,
                        border:'1px solid #E30613', background:'none',
                        color:'#E30613', fontSize:11, fontWeight:600, cursor:'pointer',
                        display:'flex', alignItems:'center', gap:5,
                      }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Nou
                    </button>
                  </div>

                  <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
                    {conversations.length === 0 ? (
                      <div style={{ padding:'24px 16px', textAlign:'center', color:'#B0AEA8', fontSize:13 }}>
                        <div style={{ fontSize:24, marginBottom:8 }}>💬</div>
                        Nicio conversație salvată încă.<br />Trimite primul mesaj!
                      </div>
                    ) : conversations.map(conv => (
                      <HistoryItem
                        key={conv.id}
                        conv={conv}
                        isActive={conv.id === currentConversationId}
                        onClick={() => handleLoadConversation(conv)}
                        onDelete={(e) => handleDeleteConversation(conv.id, e)}
                      />
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Disclaimer */}
          <div style={{
            padding:'5px 16px',
            background:'rgba(245,158,11,0.07)',
            borderBottom:'1px solid rgba(245,158,11,0.15)',
            flexShrink:0,
          }}>
            <p style={{ fontSize:11, color:'#92400E', margin:0, lineHeight:1.5 }}>
              ⚠️ <strong>Informare:</strong> Recomandările AI au caracter informativ și nu constituie consultanță financiară certificată.
            </p>
          </div>

          {/* Messages */}
          <div style={{
            flex:1, overflowY:'auto', padding:'20px 20px 8px',
            display:'flex', flexDirection:'column', gap:16,
            scrollbarWidth:'thin', scrollbarColor:'rgba(0,0,0,0.1) transparent',
          }}>
            {messages.length === 1 && messages[0].id === 'welcome' && (
              <motion.p
                initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ textAlign:'center', color:'#B0AEA8', fontSize:12, margin:'8px 0 0' }}>
                Folosește sugestiile de mai jos sau scrie propria ta întrebare
              </motion.p>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div key={msg.id}
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0 }} transition={{ duration:0.2, ease:'easeOut' }}>
                  <MsgBubble
                    msg={msg}
                    avatarStyle={engineStyle}
                    emotion={emotion as AvatarEmotion}
                    showAvatar={msg.role === 'assistant' && (idx === 0 || messages[idx-1]?.role !== 'assistant')}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {isLoading && (
                <motion.div key="typing"
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0 }}
                  style={{ display:'flex', alignItems:'flex-end', gap:10 }}>
                  <AvatarEngine emotion="thinking" size="xs" avatarStyle={{ primaryColor: avatarStyle.primaryColor }} />
                  <div style={{
                    padding:'12px 16px', borderRadius:'18px 18px 18px 4px',
                    background:'#F0EFED',
                    display:'flex', gap:5, alignItems:'center',
                    boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
                  }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        width:7, height:7, borderRadius:'50%', background:'#C0BEB8',
                        animation:`bounce 1.3s ${i*0.22}s ease-in-out infinite`,
                      }}/>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef}/>
          </div>

          {/* Quick actions */}
          <div style={{
            padding:'8px 20px 0',
            display:'flex', gap:7,
            overflowX:'auto', scrollbarWidth:'none',
            flexShrink:0,
          }}>
            {QUICK_ACTIONS.map(q => (
              <Chip key={q} label={q} onClick={() => {
                setInput(q)
                inputRef.current?.focus()
              }}/>
            ))}
          </div>

          {/* Input bar */}
          <div style={{ padding:'10px 20px 16px', flexShrink:0 }}>
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

        {/* ══ RIGHT PANEL — Avatar (desktop only) ══ */}
        <div className="avatar-panel">

          {/* Panel header */}
          <div style={{
            padding:'0 18px', height:60, flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'space-between',
            borderBottom:'1px solid rgba(255,255,255,0.06)',
            position:'relative', zIndex:1,
          }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#FFF', letterSpacing:'-0.2px' }}>
                {avatarStyle.name}
                <span style={{ fontSize:11, fontWeight:400, color:'rgba(255,255,255,0.4)', marginLeft:7 }}>AI Coach</span>
              </div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:2, letterSpacing:'0.03em' }}>
                UniCredit Bank România
              </div>
            </div>
            <button
              onClick={() => setShowAvatarEditor(s => !s)}
              title="Personalizează avatarul"
              style={{
                width:34, height:34, borderRadius:9, cursor:'pointer',
                background: showAvatarEditor ? '#E30613' : 'rgba(255,255,255,0.08)',
                border:`1px solid ${showAvatarEditor ? '#E30613' : 'rgba(255,255,255,0.12)'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#FFF', transition:'all 0.2s',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
              </svg>
            </button>
          </div>

          {/* Avatar display or editor */}
          <AnimatePresence mode="wait">
            {!showAvatarEditor ? (
              <motion.div
                key="avatar-display"
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{
                  flex:1, display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center',
                  padding:'0 24px 32px', position:'relative', zIndex:1,
                }}
              >
                {/* Avatar with subtle drop shadow */}
                <div style={{ position:'relative', marginBottom:4 }}>
                  <div style={{
                    position:'absolute', bottom:-20, left:'50%', transform:'translateX(-50%)',
                    width:100, height:16, borderRadius:'50%',
                    background:'rgba(0,0,0,0.3)', filter:'blur(10px)',
                  }}/>
                  <AvatarEngine
                    emotion={emotion as AvatarEmotion}
                    size="xl"
                    avatarStyle={engineStyle}
                  />
                </div>

                {/* Active emotion badge – only current state, no grid */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={emotion}
                    initial={{ opacity:0, y:6, scale:0.95 }}
                    animate={{ opacity:1, y:0,  scale:1    }}
                    exit={{ opacity:0, y:-6, scale:0.95 }}
                    transition={{ duration:0.25 }}
                    style={{
                      marginTop:22, padding:'7px 20px', borderRadius:24,
                      background:`${emotionMeta.color}18`,
                      border:`1px solid ${emotionMeta.color}38`,
                      display:'flex', alignItems:'center', gap:8,
                      backdropFilter:'blur(4px)',
                    }}>
                    <span style={{
                      width:8, height:8, borderRadius:'50%', display:'inline-block',
                      background:emotionMeta.color, boxShadow:`0 0 8px ${emotionMeta.color}`,
                      animation:'pulseGlow 2s infinite',
                    }}/>
                    <span style={{ fontSize:13, fontWeight:600, color:emotionMeta.color, letterSpacing:'0.03em' }}>
                      {emotionMeta.label}
                    </span>
                  </motion.div>
                </AnimatePresence>

                {/* Divider */}
                <div style={{ width:'100%', height:1, background:'rgba(255,255,255,0.06)', margin:'20px 0 14px' }}/>

                {/* Stats */}
                <div style={{ display:'flex', gap:8, width:'100%' }}>
                  {[
                    { label:'Mesaje',      value: messages.filter(m=>m.id!=='welcome').length },
                    { label:'Conversații', value: conversations.length },
                  ].map(s => (
                    <div key={s.label} style={{
                      flex:1, padding:'10px 8px', borderRadius:10,
                      background:'rgba(255,255,255,0.05)',
                      border:'1px solid rgba(255,255,255,0.08)',
                      textAlign:'center',
                    }}>
                      <div style={{ fontSize:18, fontWeight:700, color:'#FFF' }}>{s.value}</div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="avatar-editor"
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{ flex:1, overflowY:'auto', position:'relative', zIndex:1 }}
              >
                {/* Live preview while editing */}
                <div style={{ display:'flex', justifyContent:'center', padding:'20px 0 8px' }}>
                  <AvatarEngine
                    emotion={emotion as AvatarEmotion}
                    size="lg"
                    avatarStyle={engineStyle}
                  />
                </div>
                <AvatarEngineEditor
                  avatarStyle={avatarStyle}
                  onChangeName={n => updateStyle('name', n)}
                  onChangeColor={c => updateStyle('primaryColor', c)}
                  onClose={() => setShowAvatarEditor(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AvatarEngineEditor({
  avatarStyle,
  onChangeName,
  onChangeColor,
  onClose,
}: {
  avatarStyle: ChatAvatarStyle
  onChangeName: (name: string) => void
  onChangeColor: (color: string | undefined) => void
  onClose: () => void
}) {
  return (
    <div style={{ padding:'8px 20px 24px' }}>
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16,
        paddingTop:4,
      }}>
        <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.08em', textTransform:'uppercase' }}>
          Personalizare
        </span>
        <button onClick={onClose} style={{
          background:'none', border:'none', cursor:'pointer',
          color:'rgba(255,255,255,0.4)', fontSize:16, lineHeight:1,
          padding:'2px 4px', borderRadius:4,
        }}>✕</button>
      </div>

      {/* Name */}
      <label style={{ fontSize:11, color:'rgba(255,255,255,0.45)', display:'block', marginBottom:6, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600 }}>
        Nume
      </label>
      <input
        type="text"
        value={avatarStyle.name}
        onChange={e => onChangeName(e.target.value)}
        maxLength={20}
        style={{
          width:'100%', padding:'9px 12px', marginBottom:18,
          background:'rgba(255,255,255,0.07)',
          border:'1px solid rgba(255,255,255,0.12)',
          borderRadius:9, color:'#FFF', fontSize:13,
          outline:'none', fontFamily:'inherit',
          transition:'border-color 0.2s',
        }}
        onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.3)')}
        onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
      />

      {/* Colour palette */}
      <label style={{ fontSize:11, color:'rgba(255,255,255,0.45)', display:'block', marginBottom:10, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600 }}>
        Culoare față
      </label>
      <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
        {PALETTE.map(p => {
          const isSelected = p.value === avatarStyle.primaryColor
          return (
            <button
              key={p.name}
              onClick={() => onChangeColor(p.value)}
              title={p.name}
              style={{
                width:34, height:34, borderRadius:'50%', cursor:'pointer',
                background: p.value
                  ? p.value
                  : 'conic-gradient(#E2001A 0%, #0066CC 33%, #00A862 66%, #E2001A 100%)',
                border: isSelected
                  ? '3px solid #FFF'
                  : '2px solid rgba(255,255,255,0.18)',
                transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                transition:'all 0.15s',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}
            >
              {!p.value && (
                <span style={{ fontSize:11, lineHeight:1 }}>✨</span>
              )}
            </button>
          )
        })}
      </div>
      <p style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:8, marginBottom:0 }}>
        ✨ Auto folosește culoarea stării emoționale curente
      </p>
    </div>
  )
}

function HistoryItem({
  conv, isActive, onClick, onDelete,
}: {
  conv: StoredConversation
  isActive: boolean
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding:'10px 16px', fontSize:13, cursor:'pointer',
        display:'flex', alignItems:'flex-start', gap:8,
        color: isActive ? '#E30613' : '#5A5956',
        background: isActive ? 'rgba(227,6,19,0.05)' : hover ? '#F8F7F5' : 'transparent',
        borderLeft: `2px solid ${isActive ? '#E30613' : 'transparent'}`,
        transition:'all 0.15s',
      }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{
          fontWeight: isActive ? 600 : 500,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          fontSize:13,
        }}>
          {conv.title}
        </div>
        <div style={{ fontSize:11, color:'#B0AEA8', marginTop:3 }}>
          {formatHistoryDate(conv.updatedAt)} · {conv.messages.filter(m=>m.role==='user').length} mesaje
        </div>
      </div>
      {hover && (
        <button
          onClick={onDelete}
          style={{
            background:'none', border:'none', cursor:'pointer', padding:'2px 4px',
            color:'#C0BEB8', flexShrink:0, borderRadius:4,
            display:'flex', alignItems:'center',
          }}
          title="Șterge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </button>
      )}
    </div>
  )
}

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
        width:34, height:34, borderRadius:8, border:'none', cursor:'pointer',
        background: active ? '#F0EFED' : 'none',
        display:'flex', alignItems:'center', justifyContent:'center',
        color:'#6A6866', flexShrink:0, transition:'background 0.15s, color 0.15s',
      }}
      onMouseEnter={e => {
        const b = e.currentTarget as HTMLButtonElement
        b.style.background = '#F0EFED'
        if (hoverColor) b.style.color = hoverColor
      }}
      onMouseLeave={e => {
        const b = e.currentTarget as HTMLButtonElement
        b.style.background = active ? '#F0EFED' : 'none'
        b.style.color = '#6A6866'
      }}
    >
      {children}
    </button>
  )
}

function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{
        flexShrink:0, padding:'6px 13px', borderRadius:20,
        border:'1px solid rgba(0,0,0,0.1)', background:'#FFF',
        fontSize:12, color:'#6A6866', cursor:'pointer',
        whiteSpace:'nowrap', transition:'all 0.15s',
        boxShadow:'0 1px 3px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => {
        const b = e.currentTarget as HTMLButtonElement
        b.style.borderColor='#E30613'
        b.style.color='#E30613'
        b.style.background='rgba(227,6,19,0.04)'
      }}
      onMouseLeave={e => {
        const b = e.currentTarget as HTMLButtonElement
        b.style.borderColor='rgba(0,0,0,0.1)'
        b.style.color='#6A6866'
        b.style.background='#FFF'
      }}
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

function InputBar({ value, onChange, onKeyDown, onSend, isLoading, inputRef }: InputBarProps) {
  return (
    <div
      style={{
        display:'flex', alignItems:'center', gap:8,
        background:'#FFF', borderRadius:28,
        padding:'5px 5px 5px 16px',
        border:'1.5px solid rgba(0,0,0,0.1)',
        boxShadow:'0 2px 12px rgba(0,0,0,0.07)',
        transition:'border-color 0.2s, box-shadow 0.2s',
      }}
      onFocusCapture={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor='#E30613'
        el.style.boxShadow='0 2px 12px rgba(227,6,19,0.12)'
      }}
      onBlurCapture={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor='rgba(0,0,0,0.1)'
        el.style.boxShadow='0 2px 12px rgba(0,0,0,0.07)'
      }}
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
          fontSize:14, color:'#1A1A2E', lineHeight:1.4,
          fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif",
        }}
      />
      <button
        onClick={onSend}
        disabled={!value.trim() || isLoading}
        style={{
          width:40, height:40, borderRadius:'50%', border:'none',
          background: value.trim() && !isLoading
            ? 'linear-gradient(135deg,#E30613,#B5001A)'
            : '#E8E6E2',
          cursor: value.trim() && !isLoading ? 'pointer' : 'default',
          display:'flex', alignItems:'center', justifyContent:'center',
          flexShrink:0, transition:'all 0.2s',
          boxShadow: value.trim() && !isLoading ? '0 3px 10px rgba(227,6,19,0.35)' : 'none',
        }}>
        {isLoading ? (
          <div style={{
            width:15, height:15, borderRadius:'50%',
            border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#FFF',
            animation:'spin 0.7s linear infinite',
          }}/>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={value.trim() ? '#FFF' : '#B0AEA8'}
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
  timestamp?: string;
}

function MsgBubble({
  msg, avatarStyle, emotion, showAvatar,
}: {
  msg: MsgType
  avatarStyle: AvatarStyle
  emotion: AvatarEmotion
  showAvatar: boolean
}) {
  const isUser = msg.role === 'user'

  return (
    <div style={{ display:'flex', flexDirection: isUser ? 'row-reverse' : 'row', alignItems:'flex-end', gap:10 }}>
      {!isUser && (
        showAvatar
          ? <AvatarEngine emotion={emotion} size="xs" avatarStyle={{ primaryColor: avatarStyle.primaryColor }} />
          : <div style={{ width:32, flexShrink:0 }}/>
      )}
      <div style={{
        maxWidth:'72%', display:'flex', flexDirection:'column', gap:6,
        alignItems: isUser ? 'flex-end' : 'flex-start',
      }}>
        <div style={{
          padding:'12px 16px',
          borderRadius: isUser ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
          background: isUser
            ? 'linear-gradient(135deg,#1A2535,#0F1923)'
            : '#F0EFED',
          color: isUser ? '#FFF' : '#1A2535',
          fontSize:14, lineHeight:1.6, letterSpacing:'-0.1px',
          boxShadow: isUser
            ? '0 3px 12px rgba(15,25,35,0.2)'
            : '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          {msg.content}
          {!isUser && msg.product && (
            <div style={{
              marginTop:10, paddingTop:10,
              borderTop:'1px solid rgba(0,0,0,0.07)',
              fontSize:12, color:'#3A7BD5', fontWeight:600,
              display:'flex', alignItems:'center', gap:5,
            }}>
              <span style={{ fontSize:14 }}>📦</span>
              {msg.product.replace(/_/g, ' ')}
            </div>
          )}
        </div>

        <div style={{ fontSize:10, color:'#C0BEB8', padding:'0 4px' }}>
          {formatTime()}
        </div>

        {!isUser && msg.showDisclaimer && (
          <div style={{
            padding:'8px 12px',
            background:'rgba(245,158,11,0.08)',
            border:'1px solid rgba(245,158,11,0.22)',
            borderRadius:12, fontSize:11, color:'#92400E', lineHeight:1.55,
          }}>
            ⚠️ Recomandare informativă — nu constituie consultanță financiară.
          </div>
        )}

        {!isUser && msg.cta && (
          <div style={{ display:'flex', flexDirection:'column', gap:6, width:'100%' }}>
            <a href={msg.cta.url} target="_blank" rel="noopener noreferrer"
              style={{
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                background:'linear-gradient(135deg,#E30613,#B5001A)',
                color:'#FFF', padding:'11px 18px',
                borderRadius:12, fontSize:13, fontWeight:700, textDecoration:'none',
                boxShadow:'0 3px 12px rgba(227,6,19,0.3)',
                transition:'opacity 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.opacity='0.9'
                ;(e.currentTarget as HTMLAnchorElement).style.transform='translateY(-1px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.opacity='1'
                ;(e.currentTarget as HTMLAnchorElement).style.transform='translateY(0)'
              }}>
              {msg.cta.label} →
            </a>
            <a href="https://www.unicredit.ro/contact.html" target="_blank" rel="noopener noreferrer"
              style={{
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                border:'1.5px solid rgba(227,6,19,0.3)', color:'#E30613',
                padding:'10px 18px', borderRadius:12,
                fontSize:12, fontWeight:500, textDecoration:'none',
                transition:'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background='rgba(227,6,19,0.05)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background='transparent'
              }}>
              👤 Consultă un Specialist Uman
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
