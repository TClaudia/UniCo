import { useState, useEffect, useRef, useCallback } from "react";

const COLORS = {
  red: "#E30613",
  navy: "#1A1A2E",
  navyLight: "#252545",
  white: "#FFFFFF",
  offWhite: "#F8F7F5",
  gray100: "#F0EFED",
  gray200: "#E2E0DC",
  gray400: "#9B9A96",
  gray600: "#5A5956",
  accent: "#FF6B35",
};

const SKIN_TONES = [
  { id: "light", color: "#FDDBB4", name: "Deschis" },
  { id: "medium", color: "#D4956A", name: "Mediu" },
  { id: "tan", color: "#C07B4E", name: "Bronzat" },
  { id: "dark", color: "#7D4E2A", name: "Închis" },
  { id: "deep", color: "#4A2810", name: "Profund" },
];

const HAIR_STYLES = [
  { id: "short", name: "Scurt" },
  { id: "medium", name: "Mediu" },
  { id: "long", name: "Lung" },
  { id: "curly", name: "Creț" },
  { id: "bun", name: "Coc" },
];

const HAIR_COLORS = [
  { id: "black", color: "#1A1A1A", name: "Negru" },
  { id: "brown", color: "#6B3D1E", name: "Castaniu" },
  { id: "blonde", color: "#D4AA50", name: "Blond" },
  { id: "red", color: "#B83A2E", name: "Roșcat" },
  { id: "gray", color: "#888888", name: "Gri" },
  { id: "white", color: "#E8E8E8", name: "Alb" },
];

const EYE_STYLES = [
  { id: "round", name: "Rotunzi" },
  { id: "almond", name: "Migdală" },
  { id: "wide", name: "Largi" },
];

const EYE_COLORS = [
  { id: "brown", color: "#6B4226", name: "Căprui" },
  { id: "blue", color: "#3A7BD5", name: "Albaștri" },
  { id: "green", color: "#2E8B57", name: "Verzi" },
  { id: "hazel", color: "#8B7355", name: "Căprui-verzi" },
];

const OUTFITS = [
  { id: "suit", name: "Costum" },
  { id: "smart", name: "Smart Casual" },
  { id: "business", name: "Business" },
];

const ACCESSORIES = [
  { id: "none", name: "Niciunul" },
  { id: "glasses", name: "Ochelari" },
  { id: "earrings", name: "Cercei" },
  { id: "tie", name: "Cravată" },
];

const EMOTIONS = {
  idle: { label: "Inactiv", color: "#9B9A96" },
  listening: { label: "Ascultă", color: "#3A7BD5" },
  thinking: { label: "Gândește", color: "#7B5EA7" },
  typing: { label: "Scrie", color: "#2E8B57" },
  idea: { label: "Idee!", color: "#D4AA50" },
  happy: { label: "Bucuros", color: "#E30613" },
  empathetic: { label: "Empatic", color: "#5BBCD6" },
  alert: { label: "Alertă", color: "#FF6B35" },
};

function AvatarSVG({ config, emotion, blinkPhase, breathPhase }) {
  const skin = SKIN_TONES.find(s => s.id === config.skinTone)?.color || "#FDDBB4";
  const hairColor = HAIR_COLORS.find(h => h.id === config.hairColor)?.color || "#1A1A1A";
  const eyeColor = EYE_COLORS.find(e => e.id === config.eyeColor)?.color || "#6B4226";
  const breathOffset = Math.sin(breathPhase) * 1.5;
  const isBlinking = blinkPhase > 0.85;
  const eyeH = isBlinking ? 1 : (emotion === "wide" || emotion === "idea" ? 9 : 7);

  const getEyebrows = () => {
    if (emotion === "thinking") return { leftY: 72, rightY: 68, curve: true };
    if (emotion === "empathetic") return { leftY: 70, rightY: 70, worried: true };
    if (emotion === "alert") return { leftY: 68, rightY: 68, stern: true };
    if (emotion === "happy") return { leftY: 73, rightY: 73, happy: true };
    return { leftY: 72, rightY: 72 };
  };

  const getMouth = () => {
    if (emotion === "happy" || emotion === "idea") return "smile";
    if (emotion === "empathetic") return "gentle";
    if (emotion === "alert") return "firm";
    if (emotion === "thinking") return "neutral-think";
    return "neutral";
  };

  const eyebrows = getEyebrows();
  const mouth = getMouth();

  const getEyeGaze = () => {
    if (emotion === "thinking") return { dx: 4, dy: -3 };
    if (emotion === "typing") return { dx: -5, dy: 6 };
    if (emotion === "listening") return { dx: 0, dy: 0 };
    if (emotion === "idea") return { dx: 0, dy: -2 };
    return { dx: 0, dy: 0 };
  };

  const gaze = getEyeGaze();

  return (
    <svg
      viewBox="0 0 200 260"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", overflow: "visible" }}
    >
      <defs>
        <clipPath id="face-clip">
          <ellipse cx="100" cy="115" rx="52" ry="60" />
        </clipPath>
        <clipPath id="hair-back">
          <rect x="40" y="55" width="120" height="130" />
        </clipPath>
        <radialGradient id="skin-grad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor={skin} stopOpacity="1" />
          <stop offset="100%" stopColor={skin} stopOpacity="0.85" />
        </radialGradient>
        <filter id="soft-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Body */}
      <g transform={`translate(0, ${breathOffset})`}>
        {config.outfit === "suit" && (
          <g>
            <ellipse cx="100" cy="230" rx="65" ry="45" fill={COLORS.navy} />
            <rect x="35" y="195" width="130" height="70" rx="12" fill={COLORS.navy} />
            <rect x="88" y="175" width="24" height="55" rx="2" fill="#FFFFFF" opacity="0.15" />
            <rect x="93" y="175" width="14" height="55" rx="1" fill={COLORS.red} opacity="0.8" />
            <rect x="35" y="195" width="30" height="55" rx="8" fill="#162035" />
            <rect x="135" y="195" width="30" height="55" rx="8" fill="#162035" />
            <rect x="82" y="175" width="36" height="8" rx="2" fill="#F0EFED" />
          </g>
        )}
        {config.outfit === "smart" && (
          <g>
            <ellipse cx="100" cy="230" rx="65" ry="45" fill="#4A5568" />
            <rect x="35" y="195" width="130" height="70" rx="12" fill="#4A5568" />
            <rect x="35" y="195" width="30" height="55" rx="8" fill="#3A4556" />
            <rect x="135" y="195" width="30" height="55" rx="8" fill="#3A4556" />
            <rect x="80" y="175" width="40" height="8" rx="2" fill="#E2E0DC" />
          </g>
        )}
        {config.outfit === "business" && (
          <g>
            <ellipse cx="100" cy="230" rx="65" ry="45" fill={COLORS.red} opacity="0.85" />
            <rect x="35" y="195" width="130" height="70" rx="12" fill={COLORS.red} opacity="0.85" />
            <rect x="35" y="195" width="30" height="55" rx="8" fill="#B80510" opacity="0.9" />
            <rect x="135" y="195" width="30" height="55" rx="8" fill="#B80510" opacity="0.9" />
            <rect x="80" y="175" width="40" height="8" rx="2" fill="#FFFFFF" opacity="0.3" />
          </g>
        )}

        {/* Neck */}
        <rect x="86" y="162" width="28" height="22" rx="8" fill={skin} />

        {/* Head */}
        <g filter="url(#soft-shadow)">
          <ellipse cx="100" cy="115" rx="54" ry="62" fill="url(#skin-grad)" />
        </g>

        {/* Hair back */}
        {config.hairStyle === "long" && (
          <ellipse cx="100" cy="100" rx="60" ry="72" fill={hairColor} clipPath="url(#hair-back)" />
        )}
        {config.hairStyle === "curly" && (
          <g>
            {[60,72,84,96,108,120,132,144].map((x,i) => (
              <circle key={i} cx={x} cy={52 + (i%2)*6} r={10} fill={hairColor} opacity="0.9" />
            ))}
          </g>
        )}

        {/* Ears */}
        <ellipse cx="46" cy="118" rx="8" ry="11" fill={skin} />
        <ellipse cx="154" cy="118" rx="8" ry="11" fill={skin} />
        <ellipse cx="46" cy="118" rx="5" ry="7" fill={skin} opacity="0.6" />
        <ellipse cx="154" cy="118" rx="5" ry="7" fill={skin} opacity="0.6" />

        {/* Earrings */}
        {config.accessory === "earrings" && (
          <g>
            <circle cx="46" cy="128" r="4" fill="#D4AA50" />
            <circle cx="154" cy="128" r="4" fill="#D4AA50" />
          </g>
        )}

        {/* Hair */}
        {config.hairStyle === "short" && (
          <ellipse cx="100" cy="72" rx="52" ry="28" fill={hairColor} />
        )}
        {config.hairStyle === "medium" && (
          <g>
            <ellipse cx="100" cy="70" rx="52" ry="26" fill={hairColor} />
            <rect x="48" y="75" width="16" height="30" rx="8" fill={hairColor} />
            <rect x="136" y="75" width="16" height="30" rx="8" fill={hairColor} />
          </g>
        )}
        {config.hairStyle === "long" && (
          <g>
            <ellipse cx="100" cy="70" rx="52" ry="26" fill={hairColor} />
            <rect x="46" y="75" width="16" height="70" rx="8" fill={hairColor} />
            <rect x="138" y="75" width="16" height="70" rx="8" fill={hairColor} />
          </g>
        )}
        {config.hairStyle === "curly" && (
          <ellipse cx="100" cy="65" rx="56" ry="32" fill={hairColor} />
        )}
        {config.hairStyle === "bun" && (
          <g>
            <ellipse cx="100" cy="75" rx="50" ry="22" fill={hairColor} />
            <circle cx="100" cy="56" r="16" fill={hairColor} />
          </g>
        )}

        {/* Forehead highlight */}
        <ellipse cx="100" cy="95" rx="20" ry="12" fill="#FFFFFF" opacity="0.08" />

        {/* Eyebrows */}
        <g stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" fill="none">
          {eyebrows.worried ? (
            <>
              <path d={`M 70 ${eyebrows.leftY} Q 80 ${eyebrows.leftY-5} 90 ${eyebrows.leftY}`} />
              <path d={`M 110 ${eyebrows.rightY} Q 120 ${eyebrows.rightY-5} 130 ${eyebrows.rightY}`} />
            </>
          ) : eyebrows.stern ? (
            <>
              <line x1="68" y1={eyebrows.leftY+3} x2="90" y2={eyebrows.leftY-3} />
              <line x1="110" y1={eyebrows.rightY-3} x2="132" y2={eyebrows.rightY+3} />
            </>
          ) : (
            <>
              <path d={`M 70 ${eyebrows.leftY} Q 80 ${eyebrows.leftY-4} 90 ${eyebrows.leftY}`} />
              <path d={`M 110 ${eyebrows.rightY} Q 120 ${eyebrows.rightY-4} 130 ${eyebrows.rightY}`} />
            </>
          )}
        </g>

        {/* Eyes */}
        <g transform={`translate(${gaze.dx}, ${gaze.dy})`}>
          {/* Left eye */}
          <g>
            <ellipse cx="80" cy="108" rx="11" ry={isBlinking ? 1.5 : (emotion === "idea" ? 10 : 8)} fill="#FFFFFF" />
            {!isBlinking && <ellipse cx={80} cy="108" rx="6" ry="6" fill={eyeColor} />}
            {!isBlinking && <circle cx={80} cy="108" r="3.5" fill="#1A1A1A" />}
            {!isBlinking && <circle cx={82} cy="106" r="1.5" fill="#FFFFFF" />}
            {emotion === "idea" && !isBlinking && (
              <g>
                <circle cx="73" cy="100" r="3" fill="#FFE066" opacity="0.9" />
                <circle cx="90" cy="99" r="2" fill="#FFE066" opacity="0.7" />
              </g>
            )}
          </g>
          {/* Right eye */}
          <g>
            <ellipse cx="120" cy="108" rx="11" ry={isBlinking ? 1.5 : (emotion === "idea" ? 10 : 8)} fill="#FFFFFF" />
            {!isBlinking && <ellipse cx={120} cy="108" rx="6" ry="6" fill={eyeColor} />}
            {!isBlinking && <circle cx={120} cy="108" r="3.5" fill="#1A1A1A" />}
            {!isBlinking && <circle cx={122} cy="106" r="1.5" fill="#FFFFFF" />}
            {emotion === "idea" && !isBlinking && (
              <g>
                <circle cx="113" cy="100" r="3" fill="#FFE066" opacity="0.9" />
                <circle cx="130" cy="99" r="2" fill="#FFE066" opacity="0.7" />
              </g>
            )}
          </g>
        </g>

        {/* Glasses */}
        {(config.accessory === "glasses" || emotion === "thinking") && (
          <g stroke={emotion === "thinking" ? "#3A7BD5" : hairColor} strokeWidth="1.8" fill="none" opacity={emotion === "thinking" ? 1 : 0.9}>
            <rect x="67" y="100" width="28" height="18" rx="6" />
            <rect x="105" y="100" width="28" height="18" rx="6" />
            <line x1="95" y1="109" x2="105" y2="109" />
            <line x1="48" y1="107" x2="67" y2="107" />
            <line x1="133" y1="107" x2="152" y2="107" />
            {emotion === "thinking" && (
              <>
                <rect x="67" y="100" width="28" height="18" rx="6" fill="#3A7BD5" opacity="0.08" />
                <rect x="105" y="100" width="28" height="18" rx="6" fill="#3A7BD5" opacity="0.08" />
              </>
            )}
          </g>
        )}

        {/* Nose */}
        <g fill="none" stroke={skin} strokeWidth="1.5" opacity="0.5">
          <path d="M 96 118 Q 92 130 96 136 Q 100 139 104 136 Q 108 130 104 118" />
        </g>

        {/* Cheek blush */}
        {(emotion === "happy" || emotion === "idea") && (
          <>
            <ellipse cx="68" cy="126" rx="10" ry="6" fill={COLORS.red} opacity="0.12" />
            <ellipse cx="132" cy="126" rx="10" ry="6" fill={COLORS.red} opacity="0.12" />
          </>
        )}

        {/* Mouth */}
        {mouth === "smile" && (
          <path d="M 82 144 Q 100 158 118 144" stroke="#8B5E3C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}
        {mouth === "gentle" && (
          <path d="M 85 146 Q 100 151 115 146" stroke="#8B5E3C" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
        {mouth === "firm" && (
          <line x1="84" y1="146" x2="116" y2="146" stroke="#8B5E3C" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {mouth === "neutral-think" && (
          <path d="M 86 147 Q 100 144 114 147" stroke="#8B5E3C" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
        {mouth === "neutral" && (
          <path d="M 86 146 Q 100 150 114 146" stroke="#8B5E3C" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        {/* Tie */}
        {config.accessory === "tie" && (
          <g>
            <polygon points="100,170 95,180 100,195 105,180" fill={COLORS.red} />
            <polygon points="100,165 93,172 107,172" fill="#B80510" />
          </g>
        )}

        {/* Dynamic accessories by emotion */}
        {emotion === "idea" && (
          <g>
            <g transform="translate(135, 55)">
              <rect x="-18" y="-15" width="36" height="30" rx="4" fill={COLORS.navy} opacity="0.9" />
              <polyline points="-12,8 -6,0 2,5 10,-6" stroke="#00E5B0" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <line x1="-12" y1="10" x2="12" y2="10" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />
              <line x1="-12" y1="4" x2="12" y2="4" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />
              <circle cx="10" cy="-6" r="3" fill="#FFE066" opacity="0.9" />
            </g>
            <path d="M 130 60 Q 128 80 125 90" stroke="#3A7BD5" strokeWidth="1" fill="none" strokeDasharray="3,2" opacity="0.5" />
          </g>
        )}

        {emotion === "alert" && (
          <g transform="translate(148, 95)">
            <polygon points="0,-14 14,14 -14,14" fill="#FF6B35" opacity="0.95" />
            <text x="0" y="8" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#FFFFFF">!</text>
          </g>
        )}

        {emotion === "thinking" && (
          <g>
            <circle cx="148" cy="75" r="6" fill="#7B5EA7" opacity="0.3">
              <animate attributeName="r" values="6;9;6" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="160" cy="62" r="4" fill="#7B5EA7" opacity="0.2">
              <animate attributeName="r" values="4;6;4" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.05;0.2" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
            </circle>
            <circle cx="168" cy="50" r="3" fill="#7B5EA7" opacity="0.15">
              <animate attributeName="r" values="3;5;3" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
      </g>
    </svg>
  );
}

const INITIAL_MESSAGES = [
  {
    id: 1,
    from: "bot",
    text: "Bună ziua! Sunt Alex, asistentul tău financiar UniCredit. Cum te pot ajuta astăzi?",
    time: "09:41",
    emotion: "happy",
  },
];

const SAMPLE_RESPONSES = {
  transfer: {
    text: "Am inițiat transferul de 500 RON. Totul arată excelent! Transferul va fi procesat în câteva secunde. 🎉",
    emotion: "happy",
  },
  card: {
    text: "Înțeleg situația și îmi pare rău că ai trecut prin asta. Am blocat cardul tău imediat pentru a-l proteja. Te voi ajuta să obții un card de înlocuire.",
    emotion: "empathetic",
  },
  fraud: {
    text: "Atenție! Am detectat activitate suspectă pe contul tău. Îți recomand să verifici imediat tranzacțiile și să schimbi PIN-ul.",
    emotion: "alert",
  },
  invest: {
    text: "Excelentă alegere! Pe baza profilului tău financiar, îți recomand un portofoliu diversificat. Iată datele principale...",
    emotion: "idea",
  },
  default: {
    text: "Înțeleg. Lasă-mă să analizez situația și să-ți ofer cea mai bună soluție pentru nevoile tale financiare.",
    emotion: "thinking",
  },
};

function getResponseForMessage(text) {
  const lower = text.toLowerCase();
  if (lower.includes("transfer") || lower.includes("plată") || lower.includes("plata")) return SAMPLE_RESPONSES.transfer;
  if (lower.includes("card pierdut") || lower.includes("furat") || lower.includes("blocat")) return SAMPLE_RESPONSES.card;
  if (lower.includes("fraud") || lower.includes("suspect") || lower.includes("neautorizat")) return SAMPLE_RESPONSES.fraud;
  if (lower.includes("investiție") || lower.includes("investitie") || lower.includes("economii") || lower.includes("portofoliu")) return SAMPLE_RESPONSES.invest;
  return SAMPLE_RESPONSES.default;
}

function EditorSection({ label, children }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)",
        letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 7,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

export default function UniCoChat() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [emotion, setEmotion] = useState("idle");
  const [isTypingBot, setIsTypingBot] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [blinkPhase, setBlinkPhase] = useState(0);
  const [breathPhase, setBreathPhase] = useState(0);
  const [activeTab, setActiveTab] = useState("appearance");
  const [avatarConfig, setAvatarConfig] = useState({
    skinTone: "medium",
    hairStyle: "medium",
    hairColor: "black",
    eyeStyle: "almond",
    eyeColor: "brown",
    outfit: "suit",
    accessory: "glasses",
    name: "Alex",
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let t = 0;
    const interval = setInterval(() => {
      t += 0.05;
      setBreathPhase(t);
      setBlinkPhase(prev => {
        const next = prev + 0.02;
        return next > 1 ? 0 : next;
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTypingBot]);

  useEffect(() => {
    if (emotion === "idle") return;
    if (["happy", "empathetic", "alert", "idea"].includes(emotion)) {
      const t = setTimeout(() => setEmotion("idle"), 5000);
      return () => clearTimeout(t);
    }
  }, [emotion]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: Date.now(), from: "user", text, time: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }) };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setEmotion("listening");

    setTimeout(() => {
      setEmotion("thinking");
      setIsTypingBot(true);
      const delay = 1500 + Math.random() * 1000;
      setTimeout(() => {
        setEmotion("typing");
        setTimeout(() => {
          const response = getResponseForMessage(text);
          const botMsg = {
            id: Date.now() + 1,
            from: "bot",
            text: response.text,
            time: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
            emotion: response.emotion,
          };
          setMessages(m => [...m, botMsg]);
          setIsTypingBot(false);
          setEmotion(response.emotion);
        }, 800);
      }, delay);
    }, 400);
  }, [input]);

  const updateConfig = (key, value) => {
    setAvatarConfig(c => ({ ...c, [key]: value }));
  };

  const currentEmotion = EMOTIONS[emotion] || EMOTIONS.idle;

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      minHeight: 600,
      background: COLORS.offWhite,
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      overflow: "hidden",
    }}>
      {/* LEFT PANEL - Chat */}
      <div style={{
        flex: "0 0 70%",
        display: "flex",
        flexDirection: "column",
        background: COLORS.white,
        borderRight: `1px solid ${COLORS.gray200}`,
        position: "relative",
      }}>
        {/* Header */}
        <div style={{
          padding: "0 20px",
          height: 64,
          borderBottom: `1px solid ${COLORS.gray200}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: COLORS.white,
          flexShrink: 0,
        }}>
          <button
            onClick={() => setShowHistory(h => !h)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              width: 36, height: 36, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: COLORS.gray600,
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = COLORS.gray100}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
            aria-label="Meniu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: COLORS.navy, letterSpacing: "-0.2px" }}>
              Uni<span style={{ color: COLORS.red }}>Co</span> — Asistent Financiar
            </div>
            <div style={{ fontSize: 11, color: COLORS.gray400, marginTop: 1 }}>Ecosistem UniCredit · Securizat SSL</div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 20,
            background: `${currentEmotion.color}14`,
            border: `1px solid ${currentEmotion.color}30`,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: currentEmotion.color }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: currentEmotion.color }}>{currentEmotion.label}</span>
          </div>
        </div>

        {/* History Drawer */}
        {showHistory && (
          <div style={{
            position: "absolute", top: 64, left: 0, zIndex: 20,
            width: 260, background: COLORS.white,
            boxShadow: "4px 0 24px rgba(0,0,0,0.1)",
            borderRight: `1px solid ${COLORS.gray200}`,
            height: "calc(100% - 64px)",
            padding: "16px 0",
          }}>
            <div style={{ padding: "0 16px 12px", fontSize: 11, fontWeight: 600, color: COLORS.gray400, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Conversații recente
            </div>
            {["Verificare sold — azi", "Transfer Radu M. — 14 mai", "Blocare card — 12 mai", "Investiții fonduri — 10 mai"].map((item, i) => (
              <div key={i} style={{
                padding: "10px 16px", fontSize: 13, color: i === 0 ? COLORS.red : COLORS.gray600,
                cursor: "pointer", transition: "background 0.1s",
                background: i === 0 ? `${COLORS.red}08` : "none",
                borderLeft: i === 0 ? `2px solid ${COLORS.red}` : "2px solid transparent",
              }}
                onMouseEnter={e => { if (i !== 0) e.currentTarget.style.background = COLORS.gray100; }}
                onMouseLeave={e => { if (i !== 0) e.currentTarget.style.background = "none"; }}
              >
                {item}
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          scrollbarWidth: "thin",
          scrollbarColor: `${COLORS.gray200} transparent`,
        }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: "flex",
              flexDirection: msg.from === "user" ? "row-reverse" : "row",
              alignItems: "flex-end",
              gap: 10,
            }}>
              {msg.from === "bot" && (
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: COLORS.red,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#fff",
                }}>
                  {avatarConfig.name[0]}
                </div>
              )}
              <div style={{
                maxWidth: "72%",
              }}>
                <div style={{
                  padding: "11px 16px",
                  borderRadius: msg.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: msg.from === "user" ? COLORS.navy : COLORS.gray100,
                  color: msg.from === "user" ? COLORS.white : COLORS.navy,
                  fontSize: 14,
                  lineHeight: 1.55,
                  letterSpacing: "-0.1px",
                }}>
                  {msg.text}
                </div>
                <div style={{
                  fontSize: 10, color: COLORS.gray400, marginTop: 4,
                  textAlign: msg.from === "user" ? "right" : "left",
                  paddingLeft: msg.from === "bot" ? 4 : 0,
                  paddingRight: msg.from === "user" ? 4 : 0,
                }}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
          {isTypingBot && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: COLORS.red,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#fff",
              }}>
                {avatarConfig.name[0]}
              </div>
              <div style={{
                padding: "12px 18px",
                borderRadius: "18px 18px 18px 4px",
                background: COLORS.gray100,
                display: "flex", gap: 5, alignItems: "center",
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: COLORS.gray400,
                    animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div style={{
          padding: "8px 20px 0",
          display: "flex", gap: 8, flexWrap: "nowrap", overflowX: "auto",
          scrollbarWidth: "none",
        }}>
          {["Transfer rapid", "Card pierdut", "Investiții", "Detectez activitate suspectă"].map(q => (
            <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
              style={{
                flexShrink: 0, padding: "6px 12px",
                borderRadius: 20,
                border: `1px solid ${COLORS.gray200}`,
                background: COLORS.white,
                fontSize: 12, color: COLORS.gray600,
                cursor: "pointer", whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.color = COLORS.red; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.gray200; e.currentTarget.style.color = COLORS.gray600; }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: "12px 20px 16px", flexShrink: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: COLORS.gray100,
            borderRadius: 26,
            padding: "4px 6px 4px 16px",
            border: `1px solid ${COLORS.gray200}`,
            transition: "border-color 0.2s",
          }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.gray400, padding: "6px", display: "flex", alignItems: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              onFocus={() => { if (emotion === "idle") setEmotion("listening"); }}
              onBlur={() => { if (emotion === "listening") setEmotion("idle"); }}
              placeholder="Scrie un mesaj..."
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontSize: 14, color: COLORS.navy,
              }}
            />
            <button style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.gray400, padding: "6px", display: "flex", alignItems: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" /></svg>
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: input.trim() ? COLORS.red : COLORS.gray200,
                border: "none", cursor: input.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Avatar */}
      <div style={{
        flex: "0 0 30%",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(165deg, ${COLORS.navy} 0%, #16213E 60%, #0F3460 100%)`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background decoration */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 200, height: 200, borderRadius: "50%",
          background: `${COLORS.red}12`,
        }} />
        <div style={{
          position: "absolute", bottom: 80, left: -40,
          width: 160, height: 160, borderRadius: "50%",
          background: "#FFFFFF06",
        }} />

        {/* Header */}
        <div style={{
          padding: "14px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", letterSpacing: "0.01em" }}>
              {avatarConfig.name}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>AI Financial Advisor</div>
          </div>
          <button
            onClick={() => setShowAvatarEditor(s => !s)}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: showAvatarEditor ? COLORS.red : "rgba(255,255,255,0.1)",
              border: `1px solid ${showAvatarEditor ? COLORS.red : "rgba(255,255,255,0.15)"}`,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
              color: "#FFFFFF",
            }}
            aria-label="Editează avatarul"
            title="Editează avatarul"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </button>
        </div>

        {/* Avatar Display */}
        {!showAvatarEditor && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "0 20px 20px",
            position: "relative",
          }}>
            <div style={{
              width: "100%", maxWidth: 200, aspectRatio: "3/4",
              filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.4))",
            }}>
              <AvatarSVG
                config={avatarConfig}
                emotion={emotion}
                blinkPhase={blinkPhase}
                breathPhase={breathPhase}
              />
            </div>

            {/* Emotion badge */}
            <div style={{
              marginTop: 12,
              padding: "6px 14px",
              borderRadius: 20,
              background: `${currentEmotion.color}20`,
              border: `1px solid ${currentEmotion.color}40`,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: currentEmotion.color,
                boxShadow: `0 0 8px ${currentEmotion.color}`,
              }} />
              <span style={{ fontSize: 11, fontWeight: 500, color: currentEmotion.color, letterSpacing: "0.03em" }}>
                {currentEmotion.label}
              </span>
            </div>

            {/* Emotion quick-set */}
            <div style={{
              marginTop: 16, width: "100%",
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4,
            }}>
              {Object.entries(EMOTIONS).map(([key, val]) => (
                <button key={key} onClick={() => setEmotion(key)}
                  title={val.label}
                  style={{
                    padding: "5px 2px",
                    borderRadius: 6,
                    border: `1px solid ${emotion === key ? val.color : "rgba(255,255,255,0.1)"}`,
                    background: emotion === key ? `${val.color}25` : "rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    fontSize: 9, color: emotion === key ? val.color : "rgba(255,255,255,0.4)",
                    fontWeight: 500,
                    transition: "all 0.15s",
                  }}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Avatar Editor */}
        {showAvatarEditor && (
          <div style={{
            flex: 1, overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.1) transparent",
          }}>
            {/* Preview thumb */}
            <div style={{
              display: "flex", justifyContent: "center",
              padding: "12px 0 0",
            }}>
              <div style={{ width: 80, height: 100, filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.4))" }}>
                <AvatarSVG config={avatarConfig} emotion="happy" blinkPhase={0.3} breathPhase={0} />
              </div>
            </div>

            {/* Name Input */}
            <div style={{ padding: "8px 16px 0" }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Numele asistentului
              </label>
              <input
                value={avatarConfig.name}
                onChange={e => updateConfig("name", e.target.value)}
                maxLength={16}
                style={{
                  display: "block", width: "100%", marginTop: 6,
                  padding: "7px 10px", borderRadius: 8,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#FFFFFF", fontSize: 13, outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", padding: "10px 16px 0", gap: 4 }}>
              {["appearance", "outfit"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1, padding: "6px 4px",
                    borderRadius: 7,
                    border: "none",
                    background: activeTab === tab ? COLORS.red : "rgba(255,255,255,0.07)",
                    color: "#FFFFFF", fontSize: 11, fontWeight: 500,
                    cursor: "pointer", transition: "background 0.15s",
                  }}
                >
                  {tab === "appearance" ? "Aspect" : "Outfit"}
                </button>
              ))}
            </div>

            <div style={{ padding: "12px 16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              {activeTab === "appearance" && (
                <>
                  <EditorSection label="Culoarea pielii">
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {SKIN_TONES.map(s => (
                        <button key={s.id} onClick={() => updateConfig("skinTone", s.id)} title={s.name}
                          style={{
                            width: 26, height: 26, borderRadius: "50%",
                            background: s.color, border: `2px solid ${avatarConfig.skinTone === s.id ? "#FFFFFF" : "transparent"}`,
                            cursor: "pointer", transition: "transform 0.1s, border 0.1s",
                            transform: avatarConfig.skinTone === s.id ? "scale(1.2)" : "scale(1)",
                          }} />
                      ))}
                    </div>
                  </EditorSection>

                  <EditorSection label="Culoarea ochilor">
                    <div style={{ display: "flex", gap: 6 }}>
                      {EYE_COLORS.map(c => (
                        <button key={c.id} onClick={() => updateConfig("eyeColor", c.id)} title={c.name}
                          style={{
                            width: 22, height: 22, borderRadius: "50%",
                            background: c.color, border: `2px solid ${avatarConfig.eyeColor === c.id ? "#FFFFFF" : "transparent"}`,
                            cursor: "pointer", transition: "transform 0.1s",
                            transform: avatarConfig.eyeColor === c.id ? "scale(1.2)" : "scale(1)",
                          }} />
                      ))}
                    </div>
                  </EditorSection>

                  <EditorSection label="Stilul părului">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {HAIR_STYLES.map(h => (
                        <button key={h.id} onClick={() => updateConfig("hairStyle", h.id)}
                          style={{
                            padding: "4px 9px", borderRadius: 20,
                            border: `1px solid ${avatarConfig.hairStyle === h.id ? COLORS.red : "rgba(255,255,255,0.15)"}`,
                            background: avatarConfig.hairStyle === h.id ? `${COLORS.red}30` : "rgba(255,255,255,0.05)",
                            color: avatarConfig.hairStyle === h.id ? "#FFFFFF" : "rgba(255,255,255,0.55)",
                            fontSize: 11, cursor: "pointer", transition: "all 0.15s",
                          }}
                        >
                          {h.name}
                        </button>
                      ))}
                    </div>
                  </EditorSection>

                  <EditorSection label="Culoarea părului">
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {HAIR_COLORS.map(c => (
                        <button key={c.id} onClick={() => updateConfig("hairColor", c.id)} title={c.name}
                          style={{
                            width: 22, height: 22, borderRadius: "50%",
                            background: c.color,
                            border: `2px solid ${avatarConfig.hairColor === c.id ? "#FFFFFF" : "rgba(255,255,255,0.2)"}`,
                            cursor: "pointer", transition: "transform 0.1s",
                            transform: avatarConfig.hairColor === c.id ? "scale(1.2)" : "scale(1)",
                          }} />
                      ))}
                    </div>
                  </EditorSection>
                </>
              )}

              {activeTab === "outfit" && (
                <>
                  <EditorSection label="Ținută">
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {OUTFITS.map(o => (
                        <button key={o.id} onClick={() => updateConfig("outfit", o.id)}
                          style={{
                            padding: "8px 12px", borderRadius: 8, textAlign: "left",
                            border: `1px solid ${avatarConfig.outfit === o.id ? COLORS.red : "rgba(255,255,255,0.1)"}`,
                            background: avatarConfig.outfit === o.id ? `${COLORS.red}20` : "rgba(255,255,255,0.04)",
                            color: avatarConfig.outfit === o.id ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                            fontSize: 12, cursor: "pointer", transition: "all 0.15s",
                            display: "flex", alignItems: "center", gap: 8,
                          }}
                        >
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: avatarConfig.outfit === o.id ? COLORS.red : "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                          {o.name}
                        </button>
                      ))}
                    </div>
                  </EditorSection>

                  <EditorSection label="Accesoriu">
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {ACCESSORIES.map(a => (
                        <button key={a.id} onClick={() => updateConfig("accessory", a.id)}
                          style={{
                            padding: "8px 12px", borderRadius: 8, textAlign: "left",
                            border: `1px solid ${avatarConfig.accessory === a.id ? COLORS.red : "rgba(255,255,255,0.1)"}`,
                            background: avatarConfig.accessory === a.id ? `${COLORS.red}20` : "rgba(255,255,255,0.04)",
                            color: avatarConfig.accessory === a.id ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                            fontSize: 12, cursor: "pointer", transition: "all 0.15s",
                            display: "flex", alignItems: "center", gap: 8,
                          }}
                        >
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: avatarConfig.accessory === a.id ? COLORS.red : "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                          {a.name}
                        </button>
                      ))}
                    </div>
                  </EditorSection>
                </>
              )}

              <button
                onClick={() => setShowAvatarEditor(false)}
                style={{
                  padding: "10px", borderRadius: 10,
                  background: COLORS.red, border: "none",
                  color: "#FFFFFF", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", transition: "opacity 0.15s",
                  marginTop: 4,
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                ✓ Salvează Avatarul
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 2px; }
        input::placeholder { color: #9B9A96; }
      `}</style>
    </div>
  );
}

