import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import Editor, { loader } from "@monaco-editor/react"
import axiosClient from "../utils/axiosClient.js"
import OrboAI from "../components/OrboAI"

// ─────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────
const IconBack = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IconCode = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
)
const IconFlask = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6m-6 0v8l-4 9h14l-4-9V3"/>
  </svg>
)
const IconTag = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconPlay = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)
const IconSend = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconMemory = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><line x1="8" y1="4" x2="8" y2="20"/><line x1="16" y1="4" x2="16" y2="20"/>
  </svg>
)
const IconBook = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
  </svg>
)
const IconList = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)
const IconSpinner = ({ size = 14, color = "#60A5FA" }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    border: `2px solid ${color}28`, borderTopColor: color,
    animation: "pspSpin 0.7s linear infinite", flexShrink: 0,
  }} />
)

const IconOrboTab = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor"/>
    <circle cx="15.5" cy="10.5" r="1.5" fill="currentColor"/>
    <path d="M8 15.5 Q12 18.5 16 15.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </svg>
)
const LANG_TEMPLATES = {
  javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar solution = function(input) {\n  // Your solution here\n\n};`,
  python:     `class Solution:\n    def solve(self, input):\n        # Your solution here\n        pass`,
  cpp:        `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    auto solve(auto input) {\n        // Your solution here\n    }\n};`,
  java:       `class Solution {\n    public Object solve(Object input) {\n        // Your solution here\n        return null;\n    }\n}`,
}

const LANGUAGES = [
  { label: "JavaScript", value: "javascript" },
  { label: "Python",     value: "python"     },
  { label: "C++",        value: "cpp"        },
  { label: "Java",       value: "java"       },
]

const DIFF_CONFIG = {
  Easy:   { color: "#10B981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)" },
  Medium: { color: "#FFB400", bg: "rgba(255,180,0,0.12)",   border: "rgba(255,180,0,0.3)"  },
  Hard:   { color: "#EF4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)"  },
}

// extension helper
const ext = { javascript: "js", python: "py", cpp: "cpp", java: "java" }

// ─────────────────────────────────────────────────────────────────────
// MONACO THEME — defined once
// ─────────────────────────────────────────────────────────────────────
loader.init().then(monaco => {
  monaco.editor.defineTheme("codeorbit", {
    base: "vs-dark", inherit: true,
    rules: [
      { token: "comment",   foreground: "4a5568", fontStyle: "italic" },
      { token: "keyword",   foreground: "60A5FA", fontStyle: "bold"   },
      { token: "string",    foreground: "10B981"                      },
      { token: "number",    foreground: "FFB400"                      },
      { token: "type",      foreground: "a78bfa"                      },
      { token: "function",  foreground: "93c5fd"                      },
      { token: "variable",  foreground: "F1F3F5"                      },
      { token: "delimiter", foreground: "9CA3AF"                      },
    ],
    colors: {
      "editor.background":                   "#1E1F22",
      "editor.foreground":                   "#F1F3F5",
      "editorLineNumber.foreground":         "#3a3d47",
      "editorLineNumber.activeForeground":   "#60A5FA",
      "editor.lineHighlightBorder":          "#2C2F35",
      "editor.lineHighlightBackground":      "#2C2F3500",
      "editor.selectionBackground":          "#60A5FA33",
      "editor.inactiveSelectionBackground":  "#60A5FA18",
      "editorCursor.foreground":             "#60A5FA",
      "editorWhitespace.foreground":         "#2a2d35",
      "editorIndentGuide.background1":       "#2C2F35",
      "editorIndentGuide.activeBackground1": "#3a3d47",
      "editor.findMatchBackground":          "#FFB40044",
      "editor.findMatchHighlightBackground": "#FFB40022",
      "scrollbarSlider.background":          "#2C2F3560",
      "scrollbarSlider.hoverBackground":     "#3a3d4570",
      "scrollbarSlider.activeBackground":    "#4a4d5580",
      "minimap.background":                  "#1E1F22",
    },
  })
})

// ─────────────────────────────────────────────────────────────────────
// MONACO WRAPPER
// ─────────────────────────────────────────────────────────────────────
function MonacoEditor({ value, onChange, language }) {
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme="codeorbit"
      onChange={val => onChange?.(val ?? "")}
      loading={
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", gap:10, color:"rgba(255,255,255,0.25)", fontSize:13, fontFamily:"'Outfit',sans-serif" }}>
          <IconSpinner /> Loading editor…
        </div>
      }
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
        fontLigatures: true,
        lineNumbers: "on",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
        padding: { top: 16, bottom: 16 },
        renderLineHighlight: "line",
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        folding: true,
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true, indentation: true },
        quickSuggestions: true,
        scrollbar: { verticalScrollbarSize: 5, horizontalScrollbarSize: 5 },
        overviewRulerLanes: 0,
      }}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────
// RESIZABLE DIVIDER
// ─────────────────────────────────────────────────────────────────────
function Divider({ onDrag, orientation = "vertical" }) {
  const dragging = useRef(false)
  const lastPos  = useRef(0)

  const onMouseDown = e => {
    dragging.current = true
    lastPos.current = orientation === "vertical" ? e.clientX : e.clientY
    document.body.style.cursor    = orientation === "vertical" ? "col-resize" : "row-resize"
    document.body.style.userSelect = "none"
  }

  useEffect(() => {
    const onMove = e => {
      if (!dragging.current) return
      const pos  = orientation === "vertical" ? e.clientX : e.clientY
      const diff = pos - lastPos.current
      lastPos.current = pos
      onDrag(diff)
    }
    const onUp = () => {
      dragging.current = false
      document.body.style.cursor     = ""
      document.body.style.userSelect = ""
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup",   onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [onDrag, orientation])

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        flexShrink: 0,
        width:  orientation === "vertical"   ? "5px" : "100%",
        height: orientation === "horizontal" ? "5px" : "100%",
        background: "transparent", cursor: orientation === "vertical" ? "col-resize" : "row-resize",
        position: "relative", zIndex: 10, transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(96,165,250,0.3)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────
// STATUS CONFIG for result display
// ─────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Accepted: { color: "#10B981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.25)", label: "Accepted"            },
  wrong:    { color: "#EF4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",  label: "Wrong Answer"        },
  error:    { color: "#FFB400", bg: "rgba(255,180,0,0.08)",   border: "rgba(255,180,0,0.25)",  label: "Runtime Error"       },
  pending:  { color: "#9CA3AF", bg: "rgba(156,163,175,0.08)", border: "rgba(156,163,175,0.2)", label: "Pending"             },
}

// ─────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────
export default function ProblemSolverPage() {
  // ── params — tab is optional, defaults to "description" ──────────
  const { id, tab = "description" } = useParams()
  const navigate = useNavigate()

  // ── problem fetch (unchanged — only runs on id change) ────────────
  const [problem, setProblem]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [fetchErr, setFetchErr] = useState(null)

  useEffect(() => {
    const go = async () => {
      setLoading(true); setFetchErr(null)
      try {
        const res = await axiosClient.get(`/problems/${id}`)
        setProblem(res.data?.data || res.data)
      } catch (e) {
        setFetchErr(e?.response?.data?.message || "Problem not found.")
      } finally { setLoading(false) }
    }
    go()
  }, [id])  // ← only id, NOT tab — problem never refetches on tab change

  // ── editorial lazy fetch ──────────────────────────────────────────
  const [editorial, setEditorial]         = useState(null)
  const [editorialLoading, setEdLoading]  = useState(false)
  const [editorialErr, setEdErr]          = useState(null)
  const editorialFetched = useRef(false)

  useEffect(() => {
    if (tab !== "editorial" || editorialFetched.current) return
    editorialFetched.current = true
    const go = async () => {
      setEdLoading(true); setEdErr(null)
      try {
        const res = await axiosClient.get(`/problems/${id}/editorial`)
        setEditorial(res.data?.data || res.data)
      } catch (e) {
        setEdErr(e?.response?.data?.message || "No editorial available yet.")
      } finally { setEdLoading(false) }
    }
    go()
  }, [tab, id])  // ← lazy: only fires when tab becomes "editorial"

  // ── submissions lazy fetch ────────────────────────────────────────
  const [submissions, setSubmissions]       = useState([])
  const [subsLoading, setSubsLoading]       = useState(false)
  const [subsErr, setSubsErr]               = useState(null)
  const submissionsFetched = useRef(false)

  useEffect(() => {
    if (tab !== "submissions" || submissionsFetched.current) return
    submissionsFetched.current = true
    const go = async () => {
      setSubsLoading(true); setSubsErr(null)
      try {
        const res = await axiosClient.get(`/problems/${id}/submissions`)
        setSubmissions(res.data?.data || res.data || [])
      } catch (e) {
        setSubsErr(e?.response?.data?.message || "Failed to load submissions.")
      } finally { setSubsLoading(false) }
    }
    go()
  }, [tab, id])  // ← lazy: only fires when tab becomes "submissions"

  // ── editor state ──────────────────────────────────────────────────
  const [language, setLanguage] = useState("javascript")
  const [code, setCode]         = useState(LANG_TEMPLATES.javascript)

  const handleLangChange = lang => { setLanguage(lang); setCode(LANG_TEMPLATES[lang] || "") }

  // ── layout ────────────────────────────────────────────────────────
  const containerRef           = useRef(null)
  const [leftW, setLeftW]      = useState(42)   // percent
  const [bottomH, setBottomH]  = useState(220)  // px

  const handleHorizDrag = useCallback(diff => {
    if (!containerRef.current) return
    const total = containerRef.current.getBoundingClientRect().width
    setLeftW(prev => Math.min(65, Math.max(25, ((prev / 100) * total + diff) / total * 100)))
  }, [])

  const handleVertDrag = useCallback(diff => {
    setBottomH(prev => Math.min(420, Math.max(80, prev - diff)))
  }, [])

  // ── bottom panel tab (testcases vs result) ────────────────────────
  const [bottomTab, setBottomTab] = useState("testcases")
  const [activeCase, setActiveCase] = useState(0)

  // ── run state ─────────────────────────────────────────────────────
  const [running, setRunning]     = useState(false)
  const [runResult, setRunResult] = useState(null)  // array from judge0

  // ── submit state ──────────────────────────────────────────────────
  const [submitting, setSubmitting]   = useState(false)
  const [submitResult, setSubmitResult] = useState(null)

  // ── RUN handler → POST /problems/:id/run ──────────────────────────
  const handleRun = async () => {
    if (running || submitting) return
    setRunning(true)
    setRunResult(null)
    setBottomTab("result")
    try {
      const res = await axiosClient.post(`/problems/${id}/run`, { code, language })
      setRunResult({ type: "run", data: res.data?.data || res.data })
    } catch (e) {
      setRunResult({ type: "run", error: e?.response?.data?.message || "Run failed." })
    } finally { setRunning(false) }
  }

  // ── SUBMIT handler → POST /problems/:id/submit ────────────────────
  const handleSubmit = async () => {
    if (running || submitting) return
    setSubmitting(true)
    setSubmitResult(null)
    setBottomTab("result")
    try {
      const res = await axiosClient.post(`/problems/${id}/submit`, { code, language })
      setSubmitResult(res.data?.data || res.data)
      // reset submissions cache so next visit re-fetches
      submissionsFetched.current = false
      setSubmissions([])
    } catch (e) {
      setSubmitResult({ status: "error", error: e?.response?.data?.message || "Submit failed." })
    } finally { setSubmitting(false) }
  }

  // ── TAB NAVIGATION via URL ────────────────────────────────────────
  const goTab = t => {
    if (t === "description") navigate(`/problems/${id}`)
    else navigate(`/problems/${id}/${t}`)
  }

  const diff  = problem ? (DIFF_CONFIG[problem.difficulty] || DIFF_CONFIG.Easy) : null
  const cases = problem?.visibleTestCases || []

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body { background: #121417; color: #F1F3F5; font-family: 'Outfit', sans-serif; overflow: hidden; }

        .psp-root { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

        /* ── TOPBAR ── */
        .psp-topbar {
          flex-shrink: 0; height: 50px;
          background: #1E1F22;
          border-bottom: 0.5px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; padding: 0 1rem; gap: 0;
          z-index: 50;
        }
        .psp-logo {
          display: flex; align-items: center; gap: 8px;
          text-decoration: none; margin-right: 1rem; flex-shrink: 0;
        }
        .psp-logo-mark {
          width: 28px; height: 28px; border-radius: 8px;
          background: linear-gradient(135deg, #60A5FA, #6366f1);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: #fff;
          box-shadow: 0 0 12px rgba(96,165,250,0.3);
        }
        .psp-logo-text { font-size: 15px; font-weight: 800; color: #F1F3F5; letter-spacing: -0.3px; }
        .psp-logo-text b { color: #FFB400; font-weight: 800; }

        .psp-sep { width: 0.5px; height: 20px; background: rgba(255,255,255,0.1); margin: 0 0.75rem; flex-shrink: 0; }

        .psp-back {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 10px; border-radius: 7px;
          font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.38);
          text-decoration: none; transition: color 0.15s, background 0.15s;
          margin-right: 8px;
        }
        .psp-back:hover { color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.06); }

        .psp-prob-crumb {
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.65);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px;
        }

        .psp-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }

        .psp-lang-select {
          background: #2C2F35; border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 7px; padding: 5px 10px;
          color: #F1F3F5; font-size: 12px; font-weight: 500;
          font-family: 'Outfit', sans-serif; cursor: pointer; outline: none;
          transition: border-color 0.15s;
        }
        .psp-lang-select:hover { border-color: rgba(96,165,250,0.4); }
        .psp-lang-select option { background: #2C2F35; }

        /* run / submit buttons */
        .btn-run {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 16px; border-radius: 8px; border: none; cursor: pointer;
          font-size: 13px; font-weight: 600; font-family: 'Outfit', sans-serif;
          background: #2C2F35; color: #F1F3F5;
          border: 0.5px solid rgba(255,255,255,0.1);
          transition: background 0.15s, border-color 0.15s;
        }
        .btn-run:hover:not(:disabled) { background: #363940; border-color: rgba(255,255,255,0.18); }
        .btn-run:disabled { opacity: 0.45; cursor: not-allowed; }

        .btn-submit {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 18px; border-radius: 8px; border: none; cursor: pointer;
          font-size: 13px; font-weight: 700; font-family: 'Outfit', sans-serif;
          background: linear-gradient(135deg, #10B981, #059669);
          color: #fff;
          box-shadow: 0 0 20px rgba(16,185,129,0.22);
          transition: box-shadow 0.15s, transform 0.12s, opacity 0.15s;
        }
        .btn-submit:hover:not(:disabled) { box-shadow: 0 0 32px rgba(16,185,129,0.35); transform: translateY(-1px); }
        .btn-submit:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

        /* ── BODY ── */
        .psp-body { flex: 1; display: flex; min-height: 0; overflow: hidden; }

        /* ── LEFT PANEL ── */
        .psp-left {
          display: flex; flex-direction: column; flex-shrink: 0;
          background: #1E1F22;
          border-right: 0.5px solid rgba(255,255,255,0.07);
          min-width: 0; overflow: hidden;
        }

        /* left panel tab bar */
        .psp-left-tabs {
          display: flex; align-items: center; flex-shrink: 0;
          height: 42px; padding: 0 0.75rem; gap: 2px;
          background: #1E1F22;
          border-bottom: 0.5px solid rgba(255,255,255,0.07);
        }
        .lt-tab {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 0; border: none; cursor: pointer;
          font-size: 13px; font-weight: 500; font-family: 'Outfit', sans-serif;
          background: none; color: rgba(255,255,255,0.38);
          transition: color 0.15s;
          position: relative; height: 100%;
        }
        .lt-tab::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0;
          height: 2px; background: #60A5FA; border-radius: 2px 2px 0 0;
          opacity: 0; transition: opacity 0.15s;
        }
        .lt-tab:hover { color: rgba(255,255,255,0.7); }
        .lt-tab.active { color: #F1F3F5; }
        .lt-tab.active::after { opacity: 1; }

        .lt-tab.orbo-tab { color: rgba(255,180,0,0.5); }
        .lt-tab.orbo-tab:hover { color: #FFB400; }
        .lt-tab.orbo-tab.active { color: #FFB400; }
        .lt-tab.orbo-tab.active::after { background: #FFB400; }
        .psp-scroll {
          flex: 1; overflow-y: auto; padding: 1.5rem 1.25rem;
          scrollbar-width: thin; scrollbar-color: #2C2F35 transparent;
        }
        .psp-scroll::-webkit-scrollbar { width: 4px; }
        .psp-scroll::-webkit-scrollbar-thumb { background: #2C2F35; border-radius: 4px; }

        /* problem header */
        .prob-num   { font-size: 11px; color: rgba(255,255,255,0.22); font-weight: 500; margin-bottom: 5px; letter-spacing: 0.04em; text-transform: uppercase; }
        .prob-title { font-size: 20px; font-weight: 800; color: #F1F3F5; letter-spacing: -0.5px; margin-bottom: 10px; line-height: 1.2; }
        .prob-meta  { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin-bottom: 1.25rem; }

        .diff-badge { padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; border: 0.5px solid; }
        .topic-tag  {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: 5px; font-size: 11px; font-weight: 500;
          background: rgba(255,255,255,0.05); border: 0.5px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.38);
        }

        .prob-desc { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.85; margin-bottom: 1.75rem; white-space: pre-wrap; }

        .ex-heading { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.45); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 10px; }
        .ex-block {
          background: #2C2F35; border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 13px 15px; margin-bottom: 10px;
          font-family: 'JetBrains Mono', monospace;
        }
        .ex-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.28); letter-spacing: 0.09em; text-transform: uppercase; margin-bottom: 7px; font-family: 'Outfit', sans-serif; }
        .ex-row   { margin-bottom: 5px; display: flex; align-items: flex-start; gap: 8px; }
        .ex-key   { font-size: 12px; color: rgba(255,255,255,0.3); min-width: 52px; font-family: 'Outfit', sans-serif; padding-top: 2px; }
        .ex-val   { font-size: 13px; color: #F1F3F5; background: rgba(255,255,255,0.05); border-radius: 5px; padding: 2px 8px; line-height: 1.5; }
        .ex-note  { margin-top: 8px; font-size: 12px; color: rgba(255,255,255,0.28); font-family: 'Outfit', sans-serif; line-height: 1.6; }
        .ex-note b { color: rgba(255,255,255,0.45); }

        /* editorial */
        .editorial-content { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.85; white-space: pre-wrap; }
        .editorial-code {
          background: #2C2F35; border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 14px 16px; margin: 1rem 0;
          font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #F1F3F5;
          overflow-x: auto; white-space: pre;
        }

        /* submissions table */
        .subs-table { width: 100%; border-collapse: collapse; }
        .subs-th {
          text-align: left; padding: 8px 12px;
          font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.25);
          letter-spacing: 0.07em; text-transform: uppercase;
          border-bottom: 0.5px solid rgba(255,255,255,0.06);
        }
        .subs-td {
          padding: 11px 12px; font-size: 13px; color: rgba(255,255,255,0.6);
          border-bottom: 0.5px solid rgba(255,255,255,0.04);
        }
        .subs-td:first-child { font-weight: 600; }
        .subs-row:last-child td { border-bottom: none; }
        .subs-status {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 2px 9px; border-radius: 5px; font-size: 12px; font-weight: 600; border: 0.5px solid;
        }

        /* ── RIGHT PANEL ── */
        .psp-right { flex: 1; display: flex; flex-direction: column; background: #1E1F22; min-width: 0; min-height: 0; }

        .editor-bar {
          display: flex; align-items: center; gap: 8px; flex-shrink: 0;
          padding: 0 1rem; height: 42px;
          background: #2C2F35; border-bottom: 0.5px solid rgba(255,255,255,0.07);
        }
        .editor-filetab {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.75);
        }
        .editor-filedot { width: 7px; height: 7px; border-radius: 50%; background: #60A5FA; flex-shrink: 0; }
        .editor-lang-pill {
          padding: 2px 8px; border-radius: 5px; font-size: 11px; font-weight: 600;
          background: rgba(96,165,250,0.1); color: #60A5FA; border: 0.5px solid rgba(96,165,250,0.22);
        }

        .editor-area { flex: 1; min-height: 0; overflow: hidden; position: relative; }

        /* ── BOTTOM PANEL ── */
        .psp-bottom {
          flex-shrink: 0; display: flex; flex-direction: column; overflow: hidden;
          background: #121417; border-top: 0.5px solid rgba(255,255,255,0.07);
        }
        .bottom-bar {
          display: flex; align-items: center; flex-shrink: 0;
          height: 40px; padding: 0 1rem; gap: 2px;
          background: #1E1F22; border-bottom: 0.5px solid rgba(255,255,255,0.07);
        }
        .bt-tab {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 11px; border-radius: 0; border: none; cursor: pointer;
          font-size: 12px; font-weight: 500; font-family: 'Outfit', sans-serif;
          background: none; color: rgba(255,255,255,0.35); height: 100%;
          transition: color 0.15s; position: relative;
        }
        .bt-tab::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0;
          height: 2px; background: #60A5FA; border-radius: 2px 2px 0 0; opacity: 0; transition: opacity 0.15s;
        }
        .bt-tab:hover { color: rgba(255,255,255,0.65); }
        .bt-tab.active { color: #F1F3F5; }
        .bt-tab.active::after { opacity: 1; }

        .tc-tabs { display: flex; gap: 6px; padding: 10px 1rem 0; flex-shrink: 0; }
        .tc-tab {
          padding: 4px 14px; border-radius: 6px 6px 0 0; border: none; cursor: pointer;
          font-size: 12px; font-weight: 600; font-family: 'Outfit', sans-serif;
          background: rgba(255,255,255,0.04); border: 0.5px solid rgba(255,255,255,0.07);
          border-bottom: none; color: rgba(255,255,255,0.3); transition: all 0.15s;
        }
        .tc-tab.active { background: #1E1F22; color: #F1F3F5; border-color: rgba(255,255,255,0.1); }

        .tc-body {
          flex: 1; overflow-y: auto; padding: 1rem;
          scrollbar-width: thin; scrollbar-color: #2C2F35 transparent;
        }
        .tc-body::-webkit-scrollbar { width: 4px; }
        .tc-body::-webkit-scrollbar-thumb { background: #2C2F35; border-radius: 4px; }

        .tc-case {
          background: #1E1F22; border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 9px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px;
        }
        .tc-field-label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.28); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 5px; }
        .tc-field-val {
          background: #2C2F35; border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 6px; padding: 7px 10px;
          font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #F1F3F5;
          word-break: break-all;
        }

        /* result panel */
        .result-wrap { padding: 1rem; display: flex; flex-direction: column; gap: 10px; }

        .result-status-card {
          border-radius: 10px; padding: 12px 16px;
          display: flex; align-items: center; gap: 12px; border: 0.5px solid;
        }
        .result-status-label { font-size: 16px; font-weight: 800; letter-spacing: -0.3px; }
        .result-status-sub   { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 2px; }

        .result-stats { display: flex; gap: 8px; }
        .result-stat {
          flex: 1; background: #1E1F22; border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 9px; padding: 10px 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .result-stat-icon { color: rgba(255,255,255,0.3); display: flex; }
        .result-stat-val  { font-size: 15px; font-weight: 700; color: #F1F3F5; }
        .result-stat-lbl  { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 1px; }

        .result-tc-bars { display: flex; flex-direction: column; gap: 4px; }
        .result-tc-bar-wrap { display: flex; align-items: center; gap: 8px; }
        .result-tc-bar-bg { flex: 1; height: 5px; border-radius: 99px; background: rgba(255,255,255,0.07); overflow: hidden; }
        .result-tc-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
        .result-tc-label { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.45); min-width: 80px; text-align: right; }

        .result-error {
          background: rgba(239,68,68,0.06); border: 0.5px solid rgba(239,68,68,0.2);
          border-radius: 8px; padding: 10px 12px;
          font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #f87171;
          white-space: pre-wrap; line-height: 1.6;
        }

        /* run result (judge0 array) */
        .run-cases { display: flex; flex-direction: column; gap: 8px; }
        .run-case {
          background: #1E1F22; border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 9px; padding: 11px 13px;
        }
        .run-case-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .run-case-title  { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); }
        .run-case-badge  { padding: 2px 9px; border-radius: 5px; font-size: 11px; font-weight: 700; border: 0.5px solid; }

        /* shared */
        .psp-loading {
          flex: 1; display: flex; align-items: center; justify-content: center;
          gap: 10px; color: rgba(255,255,255,0.3); font-size: 13px;
        }
        .psp-empty { color: rgba(255,255,255,0.2); font-size: 13px; text-align: center; padding: 2rem; }
        .psp-err   { color: #f87171; font-size: 13px; text-align: center; padding: 2rem; }
        .psp-center-full {
          flex: 1; display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 12px;
        }
        .psp-big-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 2.5px solid rgba(96,165,250,0.15); border-top-color: #60A5FA;
          animation: pspSpin 0.8s linear infinite;
        }
        .psp-retry {
          padding: 7px 18px; border-radius: 8px; border: 0.5px solid rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.08); color: #f87171;
          font-size: 13px; font-family: 'Outfit', sans-serif; cursor: pointer;
        }
        @keyframes pspSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="psp-root">

        {/* ════════════ TOPBAR ════════════ */}
        <div className="psp-topbar">
          <Link to="/" className="psp-logo">
            <div className="psp-logo-mark">◎</div>
            <span className="psp-logo-text">Code<b>Orbit</b></span>
          </Link>
          <div className="psp-sep" />
          <Link to="/problems" className="psp-back"><IconBack /> Problems</Link>
          {problem && <span className="psp-prob-crumb">{problem.title}</span>}

          <div className="psp-topbar-right">
            <select className="psp-lang-select" value={language} onChange={e => handleLangChange(e.target.value)}>
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <button className="btn-run" onClick={handleRun} disabled={running || submitting}>
              {running ? <IconSpinner size={12} color="#9CA3AF" /> : <IconPlay />}
              {running ? "Running…" : "Run"}
            </button>
            <button className="btn-submit" onClick={handleSubmit} disabled={running || submitting}>
              {submitting ? <IconSpinner size={12} color="#fff" /> : <IconSend />}
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </div>

        {/* ════════════ BODY ════════════ */}
        {loading ? (
          <div className="psp-center-full">
            <div className="psp-big-spinner" />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Loading problem…</span>
          </div>
        ) : fetchErr ? (
          <div className="psp-center-full">
            <div style={{ color: "#f87171", fontSize: 14 }}>⚠ {fetchErr}</div>
            <button className="psp-retry" onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <div className="psp-body" ref={containerRef}>

            {/* ════ LEFT PANEL ════ */}
            <div className="psp-left" style={{ width: `${leftW}%` }}>

              {/* URL-driven tab bar */}
              <div className="psp-left-tabs">
                {[
                  { key: "description", label: "Description", icon: <IconCode /> },
                  { key: "editorial",   label: "Editorial",   icon: <IconBook /> },
                  { key: "submissions", label: "Submissions", icon: <IconList /> },
                  { key: "orbo",        label: "Ask Orbo",    icon: <IconOrboTab />, gold: true },
                ].map(t => (
                  <button
                    key={t.key}
                    className={`lt-tab ${tab === t.key ? "active" : ""} ${t.gold ? "orbo-tab" : ""}`}
                    onClick={() => goTab(t.key)}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* ── DESCRIPTION ── */}
              {tab === "description" && (
                <div className="psp-scroll">
                  <div className="prob-num">Problem</div>
                  <div className="prob-title">{problem?.title}</div>
                  <div className="prob-meta">
                    {problem?.difficulty && (
                      <span className="diff-badge" style={{ color: diff.color, background: diff.bg, borderColor: diff.border }}>
                        {problem.difficulty}
                      </span>
                    )}
                    {(problem?.tags || problem?.topicTags || []).map((tag, i) => (
                      <span key={i} className="topic-tag"><IconTag /> {tag}</span>
                    ))}
                  </div>
                  <div className="prob-desc">
                    {problem?.description || problem?.problemStatement || "No description available."}
                  </div>
                  {cases.length > 0 && (
                    <>
                      <div className="ex-heading">Examples</div>
                      {cases.map((tc, i) => (
                        <div key={i} className="ex-block">
                          <div className="ex-label">Example {i + 1}</div>
                          <div className="ex-row">
                            <span className="ex-key">Input</span>
                            <span className="ex-val">{tc.input}</span>
                          </div>
                          <div className="ex-row">
                            <span className="ex-key">Output</span>
                            <span className="ex-val" style={{ color: "#10B981" }}>{tc.output}</span>
                          </div>
                          {tc.explanation && (
                            <div className="ex-note"><b>Explanation: </b>{tc.explanation}</div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* ── EDITORIAL ── */}
              {tab === "editorial" && (
                <div className="psp-scroll">
                  {editorialLoading ? (
                    <div className="psp-loading"><IconSpinner /> Loading editorial…</div>
                  ) : editorialErr ? (
                    <div className="psp-err">⚠ {editorialErr}</div>
                  ) : !editorial ? (
                    <div className="psp-empty">No editorial found.</div>
                  ) : (
                    <>
                      <div className="prob-title" style={{ fontSize: 17, marginBottom: 16 }}>Editorial</div>
                      {editorial.content && (
                        <div className="editorial-content">{editorial.content}</div>
                      )}
                      {editorial.code && (
                        <div className="editorial-code">{editorial.code}</div>
                      )}
                      {/* fallback: render whole object if shape is unknown */}
                      {!editorial.content && !editorial.code && (
                        <pre className="editorial-code">{JSON.stringify(editorial, null, 2)}</pre>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── ORBO AI ── */}
              {tab === "orbo" && (
                <OrboAI
                  problemId={id}
                  code={code}
                  language={language}
                  problemTitle={problem?.title}
                />
              )}
              {tab === "submissions" && (
                <div className="psp-scroll">
                  {subsLoading ? (
                    <div className="psp-loading"><IconSpinner /> Loading submissions…</div>
                  ) : subsErr ? (
                    <div className="psp-err">⚠ {subsErr}</div>
                  ) : submissions.length === 0 ? (
                    <div className="psp-empty">No submissions yet. Write your solution and hit Submit!</div>
                  ) : (
                    <table className="subs-table">
                      <thead>
                        <tr>
                          <th className="subs-th">Status</th>
                          <th className="subs-th">Language</th>
                          <th className="subs-th">Runtime</th>
                          <th className="subs-th">Memory</th>
                          <th className="subs-th">Passed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((s, i) => {
                          const sc = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending
                          return (
                            <tr key={s._id || i} className="subs-row">
                              <td className="subs-td">
                                <span className="subs-status" style={{ color: sc.color, background: sc.bg, borderColor: sc.border }}>
                                  {s.status === "Accepted" && <IconCheck />}
                                  {sc.label}
                                </span>
                              </td>
                              <td className="subs-td" style={{ color: "#60A5FA" }}>{s.language}</td>
                              <td className="subs-td">{s.runtime ? `${(+s.runtime).toFixed(2)}s` : "—"}</td>
                              <td className="subs-td">{s.memory ? `${s.memory} KB` : "—"}</td>
                              <td className="subs-td">{s.testCasesPassed ?? "—"} / {s.testCasesTotal ?? "—"}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

            {/* ════ HORIZONTAL DIVIDER ════ */}
            <Divider onDrag={handleHorizDrag} orientation="vertical" />

            {/* ════ RIGHT PANEL ════ */}
            <div className="psp-right">

              {/* editor bar */}
              <div className="editor-bar">
                <div className="editor-filetab">
                  <span className="editor-filedot" />
                  <IconCode />
                  solution.{ext[language] || "js"}
                </div>
                <span className="editor-lang-pill">{LANGUAGES.find(l => l.value === language)?.label}</span>
              </div>

              {/* monaco */}
              <div className="editor-area">
                <MonacoEditor value={code} onChange={setCode} language={language} />
              </div>

              {/* vertical divider */}
              <Divider onDrag={handleVertDrag} orientation="horizontal" />

              {/* ════ BOTTOM PANEL ════ */}
              <div className="psp-bottom" style={{ height: bottomH }}>

                {/* bottom tab bar */}
                <div className="bottom-bar">
                  <button className={`bt-tab ${bottomTab === "testcases" ? "active" : ""}`} onClick={() => setBottomTab("testcases")}>
                    <IconFlask /> Test Cases
                  </button>
                  <button className={`bt-tab ${bottomTab === "result" ? "active" : ""}`} onClick={() => setBottomTab("result")}>
                    Result
                    {(running || submitting) && <IconSpinner size={10} />}
                  </button>
                </div>

                {/* ── TEST CASES ── */}
                {bottomTab === "testcases" && (
                  <>
                    {cases.length > 0 && (
                      <div className="tc-tabs">
                        {cases.map((_, i) => (
                          <button key={i} className={`tc-tab ${activeCase === i ? "active" : ""}`} onClick={() => setActiveCase(i)}>
                            Case {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="tc-body">
                      {cases.length === 0 ? (
                        <div className="psp-empty">No test cases available.</div>
                      ) : (
                        <div className="tc-case">
                          <div>
                            <div className="tc-field-label">Input</div>
                            <div className="tc-field-val">{cases[activeCase]?.input ?? "—"}</div>
                          </div>
                          <div>
                            <div className="tc-field-label">Expected Output</div>
                            <div className="tc-field-val" style={{ color: "#10B981" }}>{cases[activeCase]?.output ?? "—"}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ── RESULT ── */}
                {bottomTab === "result" && (
                  <div className="tc-body">
                    {/* loading states */}
                    {(running || submitting) && (
                      <div className="psp-loading" style={{ paddingTop: "1rem" }}>
                        <IconSpinner />
                        {running ? "Running against visible test cases…" : "Submitting against all test cases…"}
                      </div>
                    )}

                    {/* ── SUBMIT RESULT ── */}
                    {!running && !submitting && submitResult && (() => {
                      const sc = STATUS_CONFIG[submitResult.status] || STATUS_CONFIG.pending
                      const passed = submitResult.testCasesPassed ?? 0
                      const total  = problem?.visibleTestCases?.length || 0
                      const pct    = total > 0 ? Math.round((passed / total) * 100) : 0

                      return (
                        <div className="result-wrap">
                          {/* status card */}
                          <div className="result-status-card" style={{ background: sc.bg, borderColor: sc.border }}>
                            <div>
                              <div className="result-status-label" style={{ color: sc.color }}>{sc.label}</div>
                              <div className="result-status-sub">
                                {submitResult.status === "Accepted" ? "All test cases passed!" : "Some test cases failed."}
                              </div>
                            </div>
                          </div>

                          {/* stats row */}
                          <div className="result-stats">
                            <div className="result-stat">
                              <div className="result-stat-icon"><IconClock /></div>
                              <div>
                                <div className="result-stat-val">{(+submitResult.runtime || 0).toFixed(2)}s</div>
                                <div className="result-stat-lbl">Runtime</div>
                              </div>
                            </div>
                            <div className="result-stat">
                              <div className="result-stat-icon"><IconMemory /></div>
                              <div>
                                <div className="result-stat-val">{submitResult.memory ?? 0} KB</div>
                                <div className="result-stat-lbl">Memory</div>
                              </div>
                            </div>
                            <div className="result-stat">
                              <div className="result-stat-icon"><IconCheck /></div>
                              <div>
                                <div className="result-stat-val" style={{ color: sc.color }}>{passed}</div>
                                <div className="result-stat-lbl">Cases passed</div>
                              </div>
                            </div>
                          </div>

                          {/* error message */}
                          {submitResult.error && (
                            <div className="result-error">{submitResult.error}</div>
                          )}
                        </div>
                      )
                    })()}

                    {/* ── RUN RESULT ── */}
                    {!running && !submitting && runResult && (() => {
                      if (runResult.error) return (
                        <div className="result-wrap">
                          <div className="result-error">{runResult.error}</div>
                        </div>
                      )
                      const results = Array.isArray(runResult.data) ? runResult.data : []
                      return (
                        <div className="result-wrap">
                          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
                            Run Results — {results.filter(r => r.status_id === 3).length}/{results.length} passed
                          </div>
                          <div className="run-cases">
                            {results.map((r, i) => {
                              const passed = r.status_id === 3
                              const color  = passed ? "#10B981" : "#EF4444"
                              const bg     = passed ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)"
                              const border = passed ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"
                              return (
                                <div key={i} className="run-case">
                                  <div className="run-case-header">
                                    <span className="run-case-title">Case {i + 1}</span>
                                    <span className="run-case-badge" style={{ color, background: bg, borderColor: border }}>
                                      {passed ? "Passed" : "Failed"}
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", gap: 12, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                                    {r.time   && <span><IconClock /> {r.time}s</span>}
                                    {r.memory && <span><IconMemory /> {r.memory} KB</span>}
                                  </div>
                                  {(r.stderr || r.compile_output) && (
                                    <div className="result-error" style={{ marginTop: 8 }}>
                                      {r.stderr || r.compile_output}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}

                    {/* empty state */}
                    {!running && !submitting && !submitResult && !runResult && (
                      <div className="psp-empty">Run or submit your code to see results here.</div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>
        )}
      </div>
    </>
  )
}


