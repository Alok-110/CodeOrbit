import { useState, useRef, useEffect } from "react"
import axiosClient from "../utils/axiosClient"

// ── Icons ─────────────────────────────────────────────────────────────
const IconSend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const IconOrbo = () => (
  <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" fill="url(#orboGrad)"/>
    <circle cx="11" cy="13" r="3" fill="white" opacity="0.9"/>
    <circle cx="21" cy="13" r="3" fill="white" opacity="0.9"/>
    <circle cx="12" cy="12" r="1.2" fill="#121417"/>
    <circle cx="22" cy="12" r="1.2" fill="#121417"/>
    <circle cx="12.6" cy="11.4" r="0.5" fill="white"/>
    <circle cx="22.6" cy="11.4" r="0.5" fill="white"/>
    <path d="M11 20 Q16 24 21 20" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <defs>
      <linearGradient id="orboGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA"/>
        <stop offset="100%" stopColor="#6366f1"/>
      </linearGradient>
    </defs>
  </svg>
)
const IconUser = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconSpark = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
)
const IconClear = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
  </svg>
)

// ── Suggested prompts ────────────────────────────────────────────────
const SUGGESTIONS = [
  "Why is my solution failing?",
  "What's the time complexity?",
  "Give me a hint",
  "Explain the optimal approach",
]

// ── Simple markdown-like renderer ────────────────────────────────────
function MessageText({ text }) {
  // split on code blocks ```...```
  const parts = text.split(/(```[\s\S]*?```)/g)
  return (
    <div>
      {parts.map((part, i) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const inner = part.slice(3, -3).replace(/^\w+\n/, "")
          return (
            <pre key={i} style={{
              background: "#0c0e11",
              border: "0.5px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "10px 12px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12, color: "#F1F3F5",
              overflowX: "auto", margin: "8px 0",
              lineHeight: 1.65, whiteSpace: "pre-wrap",
            }}>{inner}</pre>
          )
        }
        // inline bold **text**
        const boldParts = part.split(/(\*\*.*?\*\*)/g)
        return (
          <span key={i}>
            {boldParts.map((b, j) =>
              b.startsWith("**") && b.endsWith("**")
                ? <strong key={j} style={{ color: "#F1F3F5", fontWeight: 600 }}>{b.slice(2,-2)}</strong>
                : <span key={j}>{b}</span>
            )}
          </span>
        )
      })}
    </div>
  )
}

// ── Typing dots animation ─────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#60A5FA", opacity: 0.4,
          animation: "orboDot 1.2s ease infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────
export default function OrboAI({ problemId, code, language, problemTitle }) {
  const [messages, setMessages] = useState([
    {
      role: "orbo",
      text: `Hey! I'm **Orbo** 👋\n\nI'm your AI tutor for this problem. I can see your current code and the problem context.\n\nAsk me anything — bugs, hints, complexity analysis, or approach guidance. I won't give away the full solution unless you ask!`,
      id: Date.now(),
    }
  ])
  const [input, setInput]     = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef         = useRef(null)
  const inputRef               = useRef(null)

  // auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return

    setInput("")
    setMessages(prev => [...prev, { role: "user", text: msg, id: Date.now() }])
    setLoading(true)

    try {
      const res = await axiosClient.post("/ai/query/", {
        problemId,
        code,
        language,
        message: msg,
      })
      const reply = res.data?.reply || "Sorry, I couldn't generate a response."
      setMessages(prev => [...prev, { role: "orbo", text: reply, id: Date.now() }])
    } catch (err) {
      const errMsg = err?.response?.data?.error || "Something went wrong. Try again!"
      setMessages(prev => [...prev, { role: "orbo", text: `⚠ ${errMsg}`, id: Date.now(), isError: true }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const clearChat = () => {
    setMessages([{
      role: "orbo",
      text: `Chat cleared! I still have full context of the problem and your code. What would you like to know?`,
      id: Date.now(),
    }])
  }

  return (
    <>
      <style>{`
        @keyframes orboDot {
          0%,100% { opacity: 0.3; transform: translateY(0); }
          50%      { opacity: 1;   transform: translateY(-3px); }
        }
        @keyframes orboMsgIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .orbo-root {
          display: flex; flex-direction: column; height: 100%;
          overflow: hidden; background: #111318;
          font-family: 'Outfit', sans-serif;
        }

        /* header */
        .orbo-header {
          flex-shrink: 0; padding: 12px 16px;
          background: linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(99,102,241,0.06) 100%);
          border-bottom: 0.5px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; gap: 10px;
        }
        .orbo-header-avatar {
          width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg, #60A5FA, #6366f1);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 16px rgba(96,165,250,0.3);
        }
        .orbo-header-info { flex: 1; }
        .orbo-header-name { font-size: 14px; font-weight: 700; color: #F1F3F5; letter-spacing: -0.2px; }
        .orbo-header-sub  { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 1px; display: flex; align-items: center; gap: 4px; }
        .orbo-online-dot  { width: 6px; height: 6px; border-radius: 50%; background: #10B981; animation: orboDot 2s ease infinite; }
        .orbo-clear-btn {
          background: none; border: 0.5px solid rgba(255,255,255,0.08); border-radius: 6px;
          padding: 5px 8px; cursor: pointer; color: rgba(255,255,255,0.3);
          display: flex; align-items: center; gap: 5px; font-size: 11px;
          font-family: 'Outfit', sans-serif; transition: all 0.15s;
        }
        .orbo-clear-btn:hover { border-color: rgba(255,255,255,0.18); color: rgba(255,255,255,0.65); }

        /* context pill */
        .orbo-context {
          flex-shrink: 0; padding: 8px 16px;
          border-bottom: 0.5px solid rgba(255,255,255,0.05);
          display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
        }
        .orbo-ctx-label { font-size: 10px; color: rgba(255,255,255,0.22); font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
        .orbo-ctx-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 8px; border-radius: 5px; font-size: 11px; font-weight: 500;
          background: rgba(96,165,250,0.08); border: 0.5px solid rgba(96,165,250,0.2);
          color: #60A5FA;
        }
        .orbo-ctx-pill.gold { background: rgba(255,180,0,0.08); border-color: rgba(255,180,0,0.2); color: #FFB400; }

        /* messages */
        .orbo-messages {
          flex: 1; overflow-y: auto; padding: 16px 14px;
          display: flex; flex-direction: column; gap: 14px;
          scrollbar-width: thin; scrollbar-color: #2C2F35 transparent;
        }
        .orbo-messages::-webkit-scrollbar { width: 3px; }
        .orbo-messages::-webkit-scrollbar-thumb { background: #2C2F35; border-radius: 3px; }

        /* message bubble */
        .orbo-msg { display: flex; gap: 9px; animation: orboMsgIn 0.25s ease both; }
        .orbo-msg.user { flex-direction: row-reverse; }

        .orbo-msg-avatar {
          width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          margin-top: 2px;
        }
        .orbo-msg-avatar.orbo-av {
          background: linear-gradient(135deg, #60A5FA, #6366f1);
          box-shadow: 0 0 10px rgba(96,165,250,0.25);
        }
        .orbo-msg-avatar.user-av {
          background: rgba(255,180,0,0.12);
          border: 0.5px solid rgba(255,180,0,0.25);
          color: #FFB400;
        }

        .orbo-bubble {
          max-width: 85%; padding: 10px 13px;
          border-radius: 12px; font-size: 13.5px; line-height: 1.7;
          color: rgba(255,255,255,0.75);
        }
        .orbo-bubble.orbo-bub {
          background: #1E1F22;
          border: 0.5px solid rgba(255,255,255,0.07);
          border-top-left-radius: 3px;
        }
        .orbo-bubble.user-bub {
          background: rgba(96,165,250,0.1);
          border: 0.5px solid rgba(96,165,250,0.2);
          border-top-right-radius: 3px;
          color: rgba(255,255,255,0.85);
          text-align: right;
        }
        .orbo-bubble.error-bub {
          background: rgba(239,68,68,0.07);
          border-color: rgba(239,68,68,0.2);
          color: #f87171;
        }

        /* typing indicator */
        .orbo-typing {
          display: flex; gap: 9px; align-items: flex-end;
          animation: orboMsgIn 0.25s ease both;
        }
        .orbo-typing-bubble {
          background: #1E1F22; border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: 12px; border-top-left-radius: 3px;
          padding: 10px 14px;
        }

        /* suggestions */
        .orbo-suggestions {
          flex-shrink: 0; padding: 8px 14px;
          display: flex; gap: 6px; flex-wrap: wrap;
          border-top: 0.5px solid rgba(255,255,255,0.05);
        }
        .orbo-suggestion {
          padding: 4px 11px; border-radius: 100px;
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.08);
          font-size: 11.5px; color: rgba(255,255,255,0.4);
          cursor: pointer; transition: all 0.15s;
          font-family: 'Outfit', sans-serif;
          display: flex; align-items: center; gap: 5px;
        }
        .orbo-suggestion:hover {
          background: rgba(96,165,250,0.08);
          border-color: rgba(96,165,250,0.25);
          color: #60A5FA;
        }

        /* input bar */
        .orbo-input-bar {
          flex-shrink: 0; padding: 10px 14px;
          border-top: 0.5px solid rgba(255,255,255,0.07);
          background: #0f1115;
        }
        .orbo-input-wrap {
          display: flex; align-items: flex-end; gap: 8px;
          background: #1E1F22;
          border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 8px 10px 8px 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .orbo-input-wrap:focus-within {
          border-color: rgba(96,165,250,0.4);
          box-shadow: 0 0 0 3px rgba(96,165,250,0.08);
        }
        .orbo-textarea {
          flex: 1; background: none; border: none; outline: none;
          color: #F1F3F5; font-size: 13px; font-family: 'Outfit', sans-serif;
          resize: none; line-height: 1.5; max-height: 100px;
          scrollbar-width: none; caret-color: #60A5FA;
        }
        .orbo-textarea::placeholder { color: rgba(255,255,255,0.2); }
        .orbo-textarea::-webkit-scrollbar { display: none; }
        .orbo-send-btn {
          width: 30px; height: 30px; border-radius: 8px; border: none;
          background: linear-gradient(135deg, #60A5FA, #6366f1);
          color: #fff; cursor: pointer; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.15s, transform 0.12s;
          box-shadow: 0 0 12px rgba(96,165,250,0.2);
        }
        .orbo-send-btn:hover:not(:disabled) { transform: scale(1.06); }
        .orbo-send-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
        .orbo-input-hint {
          font-size: 10px; color: rgba(255,255,255,0.18);
          text-align: center; margin-top: 6px;
          font-family: 'Outfit', sans-serif;
        }
      `}</style>

      <div className="orbo-root">

        {/* ── HEADER ── */}
        <div className="orbo-header">
          <div className="orbo-header-avatar"><IconOrbo /></div>
          <div className="orbo-header-info">
            <div className="orbo-header-name">Orbo AI</div>
            <div className="orbo-header-sub">
              <span className="orbo-online-dot" /> DSA Tutor · Context-aware
            </div>
          </div>
          <button className="orbo-clear-btn" onClick={clearChat}>
            <IconClear /> Clear
          </button>
        </div>

        {/* ── CONTEXT PILLS ── */}
        <div className="orbo-context">
          <span className="orbo-ctx-label">Context</span>
          {problemTitle && (
            <span className="orbo-ctx-pill"><IconSpark /> {problemTitle.length > 20 ? problemTitle.slice(0,20)+"…" : problemTitle}</span>
          )}
          <span className="orbo-ctx-pill gold">{language || "javascript"}</span>
          <span className="orbo-ctx-pill">{code?.split("\n")?.length || 0} lines</span>
        </div>

        {/* ── MESSAGES ── */}
        <div className="orbo-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`orbo-msg ${msg.role === "user" ? "user" : ""}`}>
              <div className={`orbo-msg-avatar ${msg.role === "user" ? "user-av" : "orbo-av"}`}>
                {msg.role === "user" ? <IconUser /> : <IconOrbo />}
              </div>
              <div className={`orbo-bubble ${msg.role === "user" ? "user-bub" : "orbo-bub"} ${msg.isError ? "error-bub" : ""}`}>
                <MessageText text={msg.text} />
              </div>
            </div>
          ))}

          {/* typing indicator */}
          {loading && (
            <div className="orbo-typing">
              <div className="orbo-msg-avatar orbo-av"><IconOrbo /></div>
              <div className="orbo-typing-bubble"><TypingDots /></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── SUGGESTIONS ── */}
        {messages.length <= 2 && !loading && (
          <div className="orbo-suggestions">
            {SUGGESTIONS.map(s => (
              <button key={s} className="orbo-suggestion" onClick={() => sendMessage(s)}>
                <IconSpark /> {s}
              </button>
            ))}
          </div>
        )}

        {/* ── INPUT ── */}
        <div className="orbo-input-bar">
          <div className="orbo-input-wrap">
            <textarea
              ref={inputRef}
              className="orbo-textarea"
              placeholder="Ask Orbo anything about this problem…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
              onInput={e => {
                e.target.style.height = "auto"
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"
              }}
            />
            <button className="orbo-send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              {loading
                ? <div style={{ width:12, height:12, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"pspSpin 0.7s linear infinite" }} />
                : <IconSend />
              }
            </button>
          </div>
          <div className="orbo-input-hint">Enter to send · Shift+Enter for new line</div>
        </div>

      </div>
    </>
  )
}
