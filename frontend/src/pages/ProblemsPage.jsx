import { useEffect, useState, useCallback } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import axiosClient from "../utils/axiosClient"


// ── Icons ────────────────────────────────────────────────────────────
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconCode = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
)
const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const IconFilter = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

// ── Config ───────────────────────────────────────────────────────────
const DIFF = {
  Easy:   { color: "#10B981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)" },
  Medium: { color: "#FFB400", bg: "rgba(255,180,0,0.1)",   border: "rgba(255,180,0,0.25)" },
  Hard:   { color: "#EF4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)" },
}
const FILTERS = ["All", "Easy", "Medium", "Hard"]
const LIMIT = 15

// ── Skeleton ─────────────────────────────────────────────────────────
function SkeletonRow({ i }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "52px 1fr 120px 100px 80px",
      gap: "1rem", alignItems: "center",
      padding: "15px 24px",
      borderBottom: "0.5px solid rgba(255,255,255,0.04)",
    }}>
      {[36, 220, 80, 70, 50].map((w, j) => (
        <div key={j} style={{
          height: "13px", width: `${w}px`, maxWidth: "100%",
          borderRadius: "5px",
          background: "rgba(255,255,255,0.05)",
          animation: "ppShimmer 1.4s ease infinite",
          animationDelay: `${(i * 5 + j) * 0.05}s`,
        }} />
      ))}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────
export default function ProblemsPage() {
  const { isAuthenticated } = useSelector(s => s.auth)

  const [problems, setProblems]   = useState([])
  const [solvedIds, setSolvedIds] = useState(new Set())
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [filter, setFilter]       = useState("All")
  const [search, setSearch]       = useState("")
  const [page, setPage]           = useState(1)
  const [hasMore, setHasMore]     = useState(true)

  // fetch paginated problems — GET /problems?page=&limit=
  const fetchProblems = useCallback(async (pg) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axiosClient.get("/problems/", {
        params: { page: pg, limit: LIMIT },
        withCredentials: true,
      })
      const data = res.data?.data || []
      setProblems(data)
      setHasMore(data.length === LIMIT)
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load problems.")
    } finally {
      setLoading(false)
    }
  }, [])

  // fetch solved — GET /problems/solved
  const fetchSolved = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await axiosClient.get("/problems/solved", { withCredentials: true })
      setSolvedIds(new Set((res.data?.data || []).map(p => p._id)))
    } catch (_) {}
  }, [isAuthenticated])

  useEffect(() => { fetchProblems(page) }, [page])
  useEffect(() => { fetchSolved() }, [fetchSolved])

  // client-side filter + search
  const displayed = problems
    .filter(p => filter === "All" || p.difficulty === filter)
    .filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()))

  const handleFilterChange = (f) => { setFilter(f); setPage(1) }

  // difficulty counts from current page
  const counts = problems.reduce((acc, p) => {
    acc[p.difficulty] = (acc[p.difficulty] || 0) + 1
    return acc
  }, {})

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0c0e11; font-family: 'Outfit', sans-serif; }

        .pp-root { min-height: 100vh; background: #0c0e11; }

        /* ── PAGE HEADER ── */
        .pp-header {
          position: relative; overflow: hidden;
          padding: 3rem 2rem 2.5rem;
          border-bottom: 0.5px solid rgba(255,255,255,0.05);
        }
        .pp-header::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 60% 100% at 0% 50%, rgba(96,165,250,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 80% at 100% 50%, rgba(99,102,241,0.05) 0%, transparent 60%);
        }
        .pp-header-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 36px 36px;
          mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
        }

        .pp-header-inner {
          position: relative; z-index: 1;
          max-width: 960px; margin: 0 auto;
        }

        .pp-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(96,165,250,0.08);
          border: 0.5px solid rgba(96,165,250,0.2);
          border-radius: 100px; padding: 3px 11px;
          font-size: 11px; color: #60A5FA; font-weight: 600;
          letter-spacing: 0.05em; margin-bottom: 0.85rem;
          animation: ppFade 0.4s ease both;
        }

        .pp-title {
          font-size: 30px; font-weight: 800; color: #F1F3F5;
          letter-spacing: -0.8px; margin-bottom: 0.5rem;
          animation: ppFade 0.4s ease 0.05s both;
        }
        .pp-title span {
          background: linear-gradient(90deg, #60A5FA, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .pp-desc {
          font-size: 14px; color: rgba(255,255,255,0.35); margin-bottom: 1.75rem;
          animation: ppFade 0.4s ease 0.1s both;
        }

        /* diff summary pills */
        .pp-diff-summary {
          display: flex; gap: 8px; flex-wrap: wrap;
          animation: ppFade 0.4s ease 0.15s both;
        }
        .pp-diff-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 8px;
          font-size: 12px; font-weight: 600; border: 0.5px solid;
        }
        .pp-diff-pill-dot { width: 7px; height: 7px; border-radius: 50%; }

        /* ── BODY ── */
        .pp-body {
          max-width: 960px; margin: 0 auto;
          padding: 2rem 2rem 5rem;
          animation: ppFade 0.4s ease 0.2s both;
        }

        /* toolbar */
        .pp-toolbar {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 1.25rem; flex-wrap: wrap;
        }

        /* search */
        .pp-search {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 9px; padding: 8px 14px;
          flex: 1; min-width: 200px; max-width: 320px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .pp-search:focus-within {
          border-color: rgba(96,165,250,0.4);
          box-shadow: 0 0 0 3px rgba(96,165,250,0.08);
        }
        .pp-search input {
          background: none; border: none; outline: none;
          color: #F1F3F5; font-size: 13px; font-family: 'Outfit', sans-serif;
          width: 100%; caret-color: #60A5FA;
        }
        .pp-search input::placeholder { color: rgba(255,255,255,0.22); }
        .pp-search-icon { color: rgba(255,255,255,0.25); display: flex; flex-shrink: 0; }

        /* filter tabs */
        .pp-filters { display: flex; gap: 4px; align-items: center; margin-left: auto; }
        .pp-filter-label {
          font-size: 12px; color: rgba(255,255,255,0.2);
          display: flex; align-items: center; gap: 4px; margin-right: 4px;
        }
        .pp-tab {
          padding: 6px 14px; border-radius: 7px; border: 0.5px solid transparent;
          font-size: 13px; font-weight: 500; cursor: pointer;
          font-family: 'Outfit', sans-serif; transition: all 0.15s;
          background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.4);
        }
        .pp-tab:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.7); }
        .pp-tab.t-All    { background: rgba(255,255,255,0.08); color: #F1F3F5; }
        .pp-tab.t-Easy   { background: rgba(16,185,129,0.1); color: #10B981; border-color: rgba(16,185,129,0.25); }
        .pp-tab.t-Medium { background: rgba(255,180,0,0.1);  color: #FFB400; border-color: rgba(255,180,0,0.25); }
        .pp-tab.t-Hard   { background: rgba(239,68,68,0.1);  color: #EF4444; border-color: rgba(239,68,68,0.25); }

        /* result count */
        .pp-result-count {
          font-size: 12px; color: rgba(255,255,255,0.25);
          margin-bottom: 0.75rem;
        }
        .pp-result-count b { color: rgba(255,255,255,0.55); font-weight: 600; }

        /* table */
        .pp-table {
          background: rgba(255,255,255,0.015);
          border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: 14px; overflow: hidden;
        }
        .pp-col { display: grid; gridTemplateColumns: 52px 1fr 120px 100px 80px; gap: 1rem; }

        .pp-thead {
          padding: 10px 24px;
          background: rgba(255,255,255,0.025);
          border-bottom: 0.5px solid rgba(255,255,255,0.06);
          font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,0.22); letter-spacing: 0.08em; text-transform: uppercase;
        }

        .pp-row {
          display: grid; gridTemplateColumns: 52px 1fr 120px 100px 80px;
          gap: 1rem; align-items: center;
          padding: 15px 24px;
          border-bottom: 0.5px solid rgba(255,255,255,0.04);
          text-decoration: none; color: inherit;
          transition: background 0.12s;
          position: relative;
        }
        .pp-row:last-child { border-bottom: none; }
        .pp-row:hover { background: rgba(255,255,255,0.03); }
        .pp-row:hover .pp-solve { color: #60A5FA; }

        /* left accent on hover */
        .pp-row::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0;
          width: 2px; border-radius: 0 2px 2px 0;
          background: #60A5FA; opacity: 0;
          transition: opacity 0.12s;
        }
        .pp-row:hover::before { opacity: 1; }

        .pp-num { font-size: 13px; color: rgba(255,255,255,0.2); font-weight: 500; }

        .pp-name {
          font-size: 14px; font-weight: 500; color: #F1F3F5;
          display: flex; align-items: center; gap: 8px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .pp-solved-badge {
          width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.3);
          display: flex; align-items: center; justify-content: center;
          color: #10B981;
        }

        .pp-badge {
          display: inline-flex; align-items: center;
          padding: 3px 10px; border-radius: 6px;
          font-size: 12px; font-weight: 600; border: 0.5px solid;
          width: fit-content;
        }

        .pp-tags {
          display: flex; gap: 4px; flex-wrap: wrap;
        }
        .pp-tag {
          padding: 2px 8px; border-radius: 5px;
          font-size: 11px; font-weight: 500;
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.35);
          white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis; max-width: 90px;
        }

        .pp-solve {
          display: flex; align-items: center; gap: 5px;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.25);
          transition: color 0.15s;
        }

        /* states */
        .pp-empty {
          text-align: center; padding: 5rem 2rem;
          color: rgba(255,255,255,0.2); font-size: 14px; line-height: 1.7;
        }
        .pp-empty b { color: rgba(255,255,255,0.45); display: block; font-size: 16px; margin-bottom: 6px; }

        .pp-error {
          text-align: center; padding: 4rem 2rem;
          color: #f87171; font-size: 14px;
        }
        .pp-retry {
          margin-top: 12px; padding: 8px 20px; border-radius: 8px;
          background: rgba(239,68,68,0.1); border: 0.5px solid rgba(239,68,68,0.3);
          color: #f87171; font-size: 13px; font-family: 'Outfit', sans-serif;
          cursor: pointer; transition: background 0.15s;
        }
        .pp-retry:hover { background: rgba(239,68,68,0.18); }

        /* pagination */
        .pp-pagination {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 1.5rem; flex-wrap: wrap; gap: 1rem;
        }
        .pp-page-info { font-size: 13px; color: rgba(255,255,255,0.25); }
        .pp-page-info b { color: rgba(255,255,255,0.6); }
        .pp-page-btns { display: flex; gap: 6px; }
        .pp-page-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 5px; padding: 7px 14px; border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
          font-family: 'Outfit', sans-serif;
        }
        .pp-page-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.08); color: #F1F3F5;
          border-color: rgba(255,255,255,0.15);
        }
        .pp-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        @keyframes ppFade {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ppShimmer {
          0%,100% { opacity: 0.4; } 50% { opacity: 0.8; }
        }

        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #0c0e11 inset !important;
          -webkit-text-fill-color: #F1F3F5 !important;
        }
      `}</style>

      <div className="pp-root">
        <Navbar />

        {/* ── PAGE HEADER ── */}
        <div className="pp-header">
          <div className="pp-header-grid" />
          <div className="pp-header-inner">
            <div className="pp-eyebrow">Problem Library</div>
            <h1 className="pp-title">All <span>Problems</span></h1>
            <p className="pp-desc">
              Pick a problem, write your solution, and submit. Track your solved streak as you go.
            </p>

            {/* difficulty summary */}
            {!loading && problems.length > 0 && (
              <div className="pp-diff-summary">
                {["Easy", "Medium", "Hard"].map(d => (
                  <div key={d} className="pp-diff-pill" style={{
                    color: DIFF[d].color, background: DIFF[d].bg, borderColor: DIFF[d].border,
                  }}>
                    <div className="pp-diff-pill-dot" style={{ background: DIFF[d].color }} />
                    {d} · {counts[d] || 0}
                  </div>
                ))}
                {solvedIds.size > 0 && (
                  <div className="pp-diff-pill" style={{
                    color: "#10B981", background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)",
                  }}>
                    ✓ Solved · {solvedIds.size}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="pp-body">

          {/* Toolbar */}
          <div className="pp-toolbar">
            {/* Search */}
            <div className="pp-search">
              <span className="pp-search-icon"><IconSearch /></span>
              <input
                type="text"
                placeholder="Search problems…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="pp-filters">
              <span className="pp-filter-label"><IconFilter /> Difficulty</span>
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`pp-tab ${filter === f ? `t-${f}` : ""}`}
                  onClick={() => handleFilterChange(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Result count */}
          {!loading && !error && (
            <p className="pp-result-count">
              Showing <b>{displayed.length}</b> problem{displayed.length !== 1 ? "s" : ""}
              {filter !== "All" ? ` · ${filter}` : ""}
              {search ? ` matching "${search}"` : ""}
            </p>
          )}

          {/* Table */}
          <div className="pp-table">

            {/* Header */}
            <div className="pp-row pp-thead" style={{ cursor: "default" }}>
              <span>#</span>
              <span>Title</span>
              <span>Difficulty</span>
              <span>Tags</span>
              <span>Solve</span>
            </div>

            {/* Error */}
            {error && (
              <div className="pp-error">
                ⚠ {error}
                <br />
                <button className="pp-retry" onClick={() => fetchProblems(page)}>
                  Retry
                </button>
              </div>
            )}

            {/* Skeletons */}
            {loading && !error && (
              Array.from({ length: LIMIT }).map((_, i) => <SkeletonRow key={i} i={i} />)
            )}

            {/* Empty */}
            {!loading && !error && displayed.length === 0 && (
              <div className="pp-empty">
                <b>No problems found</b>
                {search ? `No results for "${search}"` : `No ${filter} problems on this page.`}
              </div>
            )}

            {/* Rows */}
            {!loading && !error && displayed.map((prob, i) => {
              const diff   = DIFF[prob.difficulty] || DIFF.Easy
              const solved = solvedIds.has(prob._id)
              const idx    = (page - 1) * LIMIT + i + 1
              const tags   = prob.tags || prob.topicTags || []

              return (
                <Link
                  to={`/problems/${prob._id}`}
                  key={prob._id}
                  className="pp-row"
                >
                  <span className="pp-num">{idx}</span>

                  <span className="pp-name">
                    {solved && (
                      <span className="pp-solved-badge"><IconCheck /></span>
                    )}
                    {prob.title}
                  </span>

                  <span>
                    <span className="pp-badge" style={{
                      color: diff.color, background: diff.bg, borderColor: diff.border,
                    }}>
                      {prob.difficulty}
                    </span>
                  </span>

                  <span className="pp-tags">
                    {tags.slice(0, 2).map((t, ti) => (
                      <span key={ti} className="pp-tag">{t}</span>
                    ))}
                  </span>

                  <span className="pp-solve">
                    <IconCode /> Solve
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Pagination */}
          {!loading && !error && (
            <div className="pp-pagination">
              <p className="pp-page-info">
                Page <b>{page}</b>{hasMore ? "" : " · last page"}
              </p>
              <div className="pp-page-btns">
                <button
                  className="pp-page-btn"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <IconChevronLeft /> Prev
                </button>
                <button
                  className="pp-page-btn"
                  disabled={!hasMore}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next <IconChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
