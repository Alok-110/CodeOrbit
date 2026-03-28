import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import Editor, { loader } from "@monaco-editor/react"
import Navbar from "../components/Navbar"
import axiosClient from "../utils/axiosClient"


// ── Icons ─────────────────────────────────────────────────────────────
const IconBack = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <path d="M9 3h6m-6 0v8l-4 9h14l-4-9V3"/><line x1="9" y1="3" x2="9" y2="11"/><line x1="15" y1="3" x2="15" y2="11"/>
  </svg>
)
const IconTag = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconExpand = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
)

// ── Language templates ────────────────────────────────────────────────
const LANG_TEMPLATES = {
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var solution = function(input) {
  // Your solution here

};`,
  python: `class Solution:
    def solve(self, input):
        # Your solution here
        pass`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    auto solve(auto input) {
        // Your solution here
    }
};`,
  java: `class Solution {
    public Object solve(Object input) {
        // Your solution here
        return null;
    }
}`,
}

const LANGUAGES = [
  { label: "JavaScript", value: "javascript", monaco: "javascript" },
  { label: "Python",     value: "python",     monaco: "python"     },
  { label: "C++",        value: "cpp",        monaco: "cpp"        },
  { label: "Java",       value: "java",       monaco: "java"       },
]

const DIFF_CONFIG = {
  Easy:   { color: "#10B981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)" },
  Medium: { color: "#FFB400", bg: "rgba(255,180,0,0.1)",   border: "rgba(255,180,0,0.25)"  },
  Hard:   { color: "#EF4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)"  },
}

// ── CodeOrbit Monaco theme — defined once on loader ──────────────────
loader.init().then(monaco => {
  monaco.editor.defineTheme("codeorbit", {
    base: "vs-dark",
    inherit: true,
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
      "editor.background":                    "#111318",
      "editor.foreground":                    "#F1F3F5",
      "editorLineNumber.foreground":          "#3a3d47",
      "editorLineNumber.activeForeground":    "#60A5FA",
      "editor.lineHighlightBackground":       "#1a1d2600",
      "editor.lineHighlightBorder":           "#1a1d26",
      "editor.selectionBackground":           "#60A5FA33",
      "editor.inactiveSelectionBackground":   "#60A5FA18",
      "editorCursor.foreground":              "#60A5FA",
      "editorWhitespace.foreground":          "#2a2d35",
      "editorIndentGuide.background1":        "#1e2028",
      "editorIndentGuide.activeBackground1":  "#2a2d38",
      "editor.findMatchBackground":           "#FFB40044",
      "editor.findMatchHighlightBackground":  "#FFB40022",
      "scrollbarSlider.background":           "#2C2F3560",
      "scrollbarSlider.hoverBackground":      "#3a3d4570",
      "scrollbarSlider.activeBackground":     "#4a4d5580",
      "minimap.background":                   "#0f1115",
    },
  })
})

// ── Monaco Editor wrapper ─────────────────────────────────────────────
function MonacoEditor({ value, onChange, language }) {
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme="codeorbit"
      onChange={(val) => onChange?.(val ?? "")}
      loading={
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          height: "100%", gap: 10, color: "rgba(255,255,255,0.25)", fontSize: 13,
          fontFamily: "'Outfit', sans-serif",
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: "50%",
            border: "2px solid rgba(96,165,250,0.2)",
            borderTopColor: "#60A5FA",
            animation: "pspSpin 0.8s linear infinite",
          }} />
          Loading editor…
        </div>
      }
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
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

// ── Resizable Divider ────────────────────────────────────────────────
function Divider({ onDrag, orientation = "vertical" }) {
  const dragging = useRef(false)
  const lastPos  = useRef(0)

  const onMouseDown = (e) => {
    dragging.current = true
    lastPos.current = orientation === "vertical" ? e.clientX : e.clientY
    document.body.style.cursor = orientation === "vertical" ? "col-resize" : "row-resize"
    document.body.style.userSelect = "none"
  }

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging.current) return
      const pos  = orientation === "vertical" ? e.clientX : e.clientY
      const diff = pos - lastPos.current
      lastPos.current = pos
      onDrag(diff)
    }
    const onMouseUp = () => {
      dragging.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [onDrag, orientation])

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        flexShrink: 0,
        width:  orientation === "vertical"   ? "5px" : "100%",
        height: orientation === "horizontal" ? "5px" : "100%",
        background: "transparent",
        cursor: orientation === "vertical" ? "col-resize" : "row-resize",
        position: "relative",
        zIndex: 10,
        transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(96,165,250,0.25)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    />
  )
}

// ── Main Component ────────────────────────────────────────────────────
export default function ProblemSolverPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()

  // data
  const [problem, setProblem]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  // editor state
  const [language, setLanguage]   = useState("javascript")
  const [code, setCode]           = useState(LANG_TEMPLATES.javascript)

  // panel tabs
  const [leftTab, setLeftTab]     = useState("description") // description
  const [bottomTab, setBottomTab] = useState("testcases")   // testcases | result
  const [activeCase, setActiveCase] = useState(0)

  // layout — left panel width %, bottom panel height px
  const containerRef  = useRef(null)
  const [leftW, setLeftW]       = useState(42)   // percent
  const [bottomH, setBottomH]   = useState(200)  // px

  // fetch problem
  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axiosClient.get(`/problems/${id}`)
        setProblem(res.data?.data || res.data)
      } catch (err) {
        setError(err?.response?.data?.message || "Problem not found.")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  // language switch → reset code to template
  const handleLangChange = (lang) => {
    setLanguage(lang)
    setCode(LANG_TEMPLATES[lang] || "")
  }

  // resizable: horizontal divider (left <-> right)
  const handleHorizDrag = useCallback((diff) => {
    if (!containerRef.current) return
    const totalW = containerRef.current.getBoundingClientRect().width
    setLeftW(prev => {
      const newPx = (prev / 100) * totalW + diff
      const newPct = (newPx / totalW) * 100
      return Math.min(65, Math.max(25, newPct))
    })
  }, [])

  // resizable: vertical divider (editor <-> testcases)
  const handleVertDrag = useCallback((diff) => {
    setBottomH(prev => Math.min(400, Math.max(80, prev - diff)))
  }, [])

  const diff   = problem ? (DIFF_CONFIG[problem.difficulty] || DIFF_CONFIG.Easy) : null
  const cases  = problem?.visibleTestCases || []

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body { background: #0c0e11; color: #F1F3F5; font-family: 'Outfit', sans-serif; overflow: hidden; }

        .psp-root { display: flex; flex-direction: column; height: 100vh; background: #0c0e11; overflow: hidden; }

        /* ── TOP BAR ── */
        .psp-topbar {
          flex-shrink: 0;
          height: 48px;
          background: rgba(14,16,20,0.95);
          border-bottom: 0.5px solid rgba(255,255,255,0.06);
          display: flex; align-items: center;
          padding: 0 1rem; gap: 0;
          backdrop-filter: blur(12px);
          z-index: 50;
        }
        .psp-back {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 10px; border-radius: 7px;
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.4);
          text-decoration: none; transition: color 0.15s, background 0.15s;
          margin-right: 12px; font-family: 'Outfit', sans-serif;
        }
        .psp-back:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.05); }

        .psp-logo {
          display: flex; align-items: center; gap: 7px;
          text-decoration: none; margin-right: 1.5rem;
        }
        .psp-logo-mark {
          width: 26px; height: 26px; border-radius: 7px;
          background: linear-gradient(135deg, #60A5FA, #6366f1);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; color: #fff;
        }
        .psp-logo-text { font-size: 14px; font-weight: 800; color: #F1F3F5; letter-spacing: -0.3px; }
        .psp-logo-text span { color: #FFB400; }

        .psp-prob-title {
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.7);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 300px;
        }

        .psp-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }

        .psp-lang-select {
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 7px; padding: 5px 10px;
          color: #F1F3F5; font-size: 12px; font-weight: 500;
          font-family: 'Outfit', sans-serif; cursor: pointer;
          outline: none; transition: border-color 0.15s;
        }
        .psp-lang-select:hover { border-color: rgba(96,165,250,0.4); }
        .psp-lang-select option { background: #1a1d24; }

        /* ── MAIN LAYOUT ── */
        .psp-body {
          flex: 1; display: flex; min-height: 0;
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .psp-left {
          display: flex; flex-direction: column;
          background: #111318;
          border-right: 0.5px solid rgba(255,255,255,0.06);
          min-width: 0; overflow: hidden;
          flex-shrink: 0;
        }

        .psp-panel-tabs {
          display: flex; align-items: center;
          border-bottom: 0.5px solid rgba(255,255,255,0.06);
          padding: 0 1rem; height: 40px; gap: 4px; flex-shrink: 0;
          background: rgba(255,255,255,0.015);
        }
        .psp-tab {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 10px; border-radius: 6px;
          font-size: 12px; font-weight: 500; cursor: pointer; border: none;
          font-family: 'Outfit', sans-serif; transition: all 0.15s;
          background: none; color: rgba(255,255,255,0.35);
        }
        .psp-tab:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.04); }
        .psp-tab.active { color: #F1F3F5; background: rgba(255,255,255,0.07); }

        /* description scroll */
        .psp-desc-scroll {
          flex: 1; overflow-y: auto; padding: 1.5rem;
          scrollbar-width: thin; scrollbar-color: #2C2F35 transparent;
        }
        .psp-desc-scroll::-webkit-scrollbar { width: 4px; }
        .psp-desc-scroll::-webkit-scrollbar-thumb { background: #2C2F35; border-radius: 4px; }

        /* problem header */
        .prob-hd-num { font-size: 12px; color: rgba(255,255,255,0.25); font-weight: 500; margin-bottom: 6px; }
        .prob-hd-title {
          font-size: 20px; font-weight: 800; color: #F1F3F5;
          letter-spacing: -0.5px; margin-bottom: 10px; line-height: 1.2;
        }
        .prob-hd-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 1.25rem; }

        .diff-badge {
          padding: 3px 10px; border-radius: 6px;
          font-size: 12px; font-weight: 700; border: 0.5px solid;
        }
        .topic-tag {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: 5px;
          font-size: 11px; font-weight: 500;
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.4);
        }

        .prob-desc-text {
          font-size: 14px; color: rgba(255,255,255,0.65);
          line-height: 1.8; margin-bottom: 1.75rem;
          white-space: pre-wrap;
        }

        /* examples */
        .example-block {
          background: rgba(255,255,255,0.02);
          border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 14px 16px;
          margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;
        }
        .example-label {
          font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.3);
          letter-spacing: 0.07em; text-transform: uppercase;
          margin-bottom: 8px; font-family: 'Outfit', sans-serif;
        }
        .example-row { margin-bottom: 5px; }
        .example-key { font-size: 12px; color: rgba(255,255,255,0.3); }
        .example-val {
          font-size: 13px; color: #F1F3F5; font-weight: 500;
          background: rgba(255,255,255,0.04); border-radius: 5px;
          padding: 2px 8px; display: inline-block; margin-left: 4px;
        }

        /* ── RIGHT PANEL (editor + testcases) ── */
        .psp-right {
          flex: 1; display: flex; flex-direction: column;
          background: #111318; min-width: 0; min-height: 0;
        }

        /* editor top bar */
        .editor-topbar {
          display: flex; align-items: center; gap: 8px;
          padding: 0 1rem; height: 40px; flex-shrink: 0;
          background: rgba(255,255,255,0.015);
          border-bottom: 0.5px solid rgba(255,255,255,0.06);
        }
        .editor-tab-label {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 500; color: #F1F3F5;
        }
        .editor-tab-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #60A5FA;
        }
        .editor-lang-badge {
          padding: 2px 8px; border-radius: 5px;
          font-size: 11px; font-weight: 600;
          background: rgba(96,165,250,0.1); color: #60A5FA;
          border: 0.5px solid rgba(96,165,250,0.2);
        }

        /* editor area */
        .editor-area {
          flex: 1; min-height: 0; position: relative; overflow: hidden;
        }

        /* bottom panel */
        .psp-bottom {
          flex-shrink: 0; border-top: 0.5px solid rgba(255,255,255,0.06);
          background: #0f1115; display: flex; flex-direction: column;
          overflow: hidden;
        }
        .bottom-topbar {
          display: flex; align-items: center; gap: 4px;
          padding: 0 1rem; height: 40px; flex-shrink: 0;
          border-bottom: 0.5px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.01);
        }
        .bottom-right { margin-left: auto; display: flex; gap: 6px; }

        /* test case tabs */
        .tc-tabs { display: flex; gap: 6px; padding: 10px 1rem 0; flex-shrink: 0; }
        .tc-tab {
          padding: 5px 14px; border-radius: 7px 7px 0 0;
          font-size: 12px; font-weight: 600; cursor: pointer; border: none;
          font-family: 'Outfit', sans-serif; transition: all 0.15s;
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.06);
          border-bottom: none; color: rgba(255,255,255,0.35);
        }
        .tc-tab.active { background: #1a1d26; color: #F1F3F5; border-color: rgba(255,255,255,0.09); }

        .tc-content {
          flex: 1; overflow-y: auto; padding: 1rem;
          scrollbar-width: thin; scrollbar-color: #2C2F35 transparent;
        }
        .tc-content::-webkit-scrollbar { width: 4px; }
        .tc-content::-webkit-scrollbar-thumb { background: #2C2F35; border-radius: 4px; }

        .tc-case {
          background: rgba(255,255,255,0.02);
          border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: 9px; padding: 12px 14px;
        }
        .tc-field { margin-bottom: 8px; }
        .tc-field:last-child { margin-bottom: 0; }
        .tc-field-label {
          font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.28);
          letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 4px;
        }
        .tc-field-val {
          background: #111318; border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 6px; padding: 7px 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px; color: #F1F3F5;
          word-break: break-all;
        }

        /* loading / error */
        .psp-center {
          flex: 1; display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 12px;
        }
        .psp-spinner {
          width: 32px; height: 32px; border-radius: 50%;
          border: 2.5px solid rgba(96,165,250,0.15);
          border-top-color: #60A5FA;
          animation: pspSpin 0.8s linear infinite;
        }
        @keyframes pspSpin { to { transform: rotate(360deg); } }
        .psp-error-text { color: #f87171; font-size: 14px; text-align: center; }
        .psp-retry {
          padding: 7px 18px; border-radius: 8px; border: none; cursor: pointer;
          background: rgba(239,68,68,0.1); border: 0.5px solid rgba(239,68,68,0.3);
          color: #f87171; font-size: 13px; font-family: 'Outfit', sans-serif;
          transition: background 0.15s;
        }
        .psp-retry:hover { background: rgba(239,68,68,0.18); }

        /* empty */
        .psp-empty {
          font-size: 13px; color: rgba(255,255,255,0.2);
          text-align: center; padding: 1.5rem;
        }
      `}</style>

      <div className="psp-root">

        {/* ── TOP BAR ── */}
        <div className="psp-topbar">
          <Link to="/" className="psp-logo">
            <div className="psp-logo-mark">◎</div>
            <span className="psp-logo-text">Code<span>Orbit</span></span>
          </Link>

          <Link to="/problems" className="psp-back">
            <IconBack /> Problems
          </Link>

          {problem && (
            <span className="psp-prob-title">
              {problem.title}
            </span>
          )}

          <div className="psp-topbar-right">
            <select
              className="psp-lang-select"
              value={language}
              onChange={e => handleLangChange(e.target.value)}
            >
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── BODY ── */}
        {loading ? (
          <div className="psp-center">
            <div className="psp-spinner" />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Loading problem…</span>
          </div>
        ) : error ? (
          <div className="psp-center">
            <div className="psp-error-text">⚠ {error}</div>
            <button className="psp-retry" onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <div className="psp-body" ref={containerRef}>

            {/* ── LEFT PANEL — description ── */}
            <div className="psp-left" style={{ width: `${leftW}%` }}>

              {/* tabs */}
              <div className="psp-panel-tabs">
                <button
                  className={`psp-tab ${leftTab === "description" ? "active" : ""}`}
                  onClick={() => setLeftTab("description")}
                >
                  Description
                </button>
              </div>

              {/* description */}
              <div className="psp-desc-scroll">
                <div className="prob-hd-num">Problem #{id?.slice(-4)}</div>
                <div className="prob-hd-title">{problem?.title}</div>

                <div className="prob-hd-meta">
                  {problem?.difficulty && (
                    <span className="diff-badge" style={{
                      color: diff.color, background: diff.bg, borderColor: diff.border,
                    }}>
                      {problem.difficulty}
                    </span>
                  )}
                  {(problem?.tags || problem?.topicTags || []).map((tag, i) => (
                    <span key={i} className="topic-tag">
                      <IconTag /> {tag}
                    </span>
                  ))}
                </div>

                {/* description text */}
                <div className="prob-desc-text">
                  {problem?.description || problem?.problemStatement || "No description available."}
                </div>

                {/* visible test cases as examples */}
                {cases.length > 0 && (
                  <>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)",
                      letterSpacing: "0.04em", marginBottom: "0.75rem",
                    }}>
                      Examples
                    </div>
                    {cases.map((tc, i) => (
                      <div key={i} className="example-block">
                        <div className="example-label">Example {i + 1}</div>
                        <div className="example-row">
                          <span className="example-key">Input</span>
                          <span className="example-val">{tc.input}</span>
                        </div>
                        <div className="example-row">
                          <span className="example-key">Output</span>
                          <span className="example-val" style={{ color: "#10B981" }}>{tc.output}</span>
                        </div>
                        {tc.explanation && (
                          <div style={{
                            marginTop: 8, fontSize: 12,
                            color: "rgba(255,255,255,0.3)",
                            fontFamily: "'Outfit', sans-serif",
                            lineHeight: 1.6,
                          }}>
                            <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Explanation: </span>
                            {tc.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* ── HORIZONTAL DIVIDER ── */}
            <Divider onDrag={handleHorizDrag} orientation="vertical" />

            {/* ── RIGHT PANEL ── */}
            <div className="psp-right">

              {/* editor top bar */}
              <div className="editor-topbar">
                <div className="editor-tab-label">
                  <span className="editor-tab-dot" />
                  <IconCode /> solution.{language === "python" ? "py" : language === "cpp" ? "cpp" : language === "java" ? "java" : "js"}
                </div>
                <span className="editor-lang-badge">
                  {LANGUAGES.find(l => l.value === language)?.label}
                </span>
              </div>

              {/* monaco editor */}
              <div className="editor-area">
                <MonacoEditor
                  value={code}
                  onChange={setCode}
                  language={LANGUAGES.find(l => l.value === language)?.monaco || "javascript"}
                  height="100%"
                />
              </div>

              {/* ── VERTICAL DIVIDER ── */}
              <Divider onDrag={handleVertDrag} orientation="horizontal" />

              {/* ── BOTTOM PANEL — testcases ── */}
              <div className="psp-bottom" style={{ height: bottomH }}>
                <div className="bottom-topbar">
                  <button
                    className={`psp-tab ${bottomTab === "testcases" ? "active" : ""}`}
                    onClick={() => setBottomTab("testcases")}
                  >
                    <IconFlask /> Test Cases
                  </button>
                </div>

                {/* case tabs */}
                {cases.length > 0 && (
                  <div className="tc-tabs">
                    {cases.map((_, i) => (
                      <button
                        key={i}
                        className={`tc-tab ${activeCase === i ? "active" : ""}`}
                        onClick={() => setActiveCase(i)}
                      >
                        Case {i + 1}
                      </button>
                    ))}
                  </div>
                )}

                <div className="tc-content">
                  {cases.length === 0 ? (
                    <div className="psp-empty">No test cases available.</div>
                  ) : (
                    <div className="tc-case">
                      <div className="tc-field">
                        <div className="tc-field-label">Input</div>
                        <div className="tc-field-val">{cases[activeCase]?.input ?? "—"}</div>
                      </div>
                      <div className="tc-field">
                        <div className="tc-field-label">Expected Output</div>
                        <div className="tc-field-val" style={{ color: "#10B981" }}>
                          {cases[activeCase]?.output ?? "—"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
