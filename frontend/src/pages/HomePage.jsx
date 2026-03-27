import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"

// ── Icons ────────────────────────────────────────────────────────────
const IconArrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconZap = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconCode = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
)
const IconTarget = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)
const IconTrendingUp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
)

// ── Static problem preview data ───────────────────────────────────────
const PREVIEW_PROBLEMS = [
  { id: 1, title: "Two Sum",                difficulty: "Easy",   solved: true  },
  { id: 2, title: "Add Two Numbers",        difficulty: "Medium", solved: true  },
  { id: 3, title: "Longest Substring",      difficulty: "Medium", solved: false },
  { id: 4, title: "Median of Two Arrays",   difficulty: "Hard",   solved: false },
  { id: 5, title: "Valid Parentheses",      difficulty: "Easy",   solved: true  },
  { id: 6, title: "Merge K Sorted Lists",   difficulty: "Hard",   solved: false },
]

const DIFF = {
  Easy:   { color: "#10B981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)" },
  Medium: { color: "#FFB400", bg: "rgba(255,180,0,0.1)",   border: "rgba(255,180,0,0.2)"  },
  Hard:   { color: "#EF4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.2)"  },
}

const FEATURES = [
  { icon: <IconCode />,      color: "#60A5FA", bg: "rgba(96,165,250,0.1)",   title: "2,500+ Problems",     desc: "From arrays to dynamic programming — every pattern covered." },
  { icon: <IconTarget />,    color: "#10B981", bg: "rgba(16,185,129,0.1)",   title: "Track Progress",      desc: "Know exactly what you've solved and what to tackle next." },
  { icon: <IconTrendingUp />,color: "#FFB400", bg: "rgba(255,180,0,0.1)",    title: "Climb the Ranks",     desc: "Compete, compare, and rise on the global leaderboard." },
]

// ── Component ─────────────────────────────────────────────────────────
export default function HomePage() {
  const { isAuthenticated, user } = useSelector(s => s.auth)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0c0e11; color: #F1F3F5; font-family: 'Outfit', sans-serif; }

        .hp { min-height: 100vh; background: #0c0e11; overflow-x: hidden; }

        /* ══════════════════════════════════════
           HERO
        ══════════════════════════════════════ */
        .hero {
          position: relative; overflow: hidden;
          padding: 6rem 2rem 5rem;
          text-align: center;
          min-height: 88vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
        }

        /* layered bg */
        .hero-bg {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 90% 70% at 50% -10%, rgba(96,165,250,0.13) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 10% 80%,  rgba(99,102,241,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 70%,  rgba(255,180,0,0.06) 0%, transparent 60%);
        }
        .hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: radial-gradient(ellipse 85% 75% at 50% 30%, black 20%, transparent 75%);
        }
        /* glowing orbs */
        .hero-orb {
          position: absolute; border-radius: 50%;
          filter: blur(90px); pointer-events: none;
          animation: orbDrift 10s ease-in-out infinite alternate;
        }
        .hero-orb-1 { width: 420px; height: 420px; background: rgba(96,165,250,0.07);  top: -100px; left: -80px; animation-delay: 0s; }
        .hero-orb-2 { width: 350px; height: 350px; background: rgba(99,102,241,0.06);  bottom: -80px; right: -60px; animation-delay: -5s; }
        .hero-orb-3 { width: 280px; height: 280px; background: rgba(255,180,0,0.05);   top: 40%; right: 10%; animation-delay: -3s; }
        @keyframes orbDrift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(20px, 15px) scale(1.05); }
        }

        /* hero content */
        .hero-inner { position: relative; z-index: 1; max-width: 780px; }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(96,165,250,0.08);
          border: 0.5px solid rgba(96,165,250,0.22);
          border-radius: 100px; padding: 5px 15px;
          font-size: 12px; color: #60A5FA; font-weight: 600;
          letter-spacing: 0.04em; margin-bottom: 2rem;
          animation: heroUp 0.6s cubic-bezier(.22,1,.36,1) both;
        }
        .hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #60A5FA;
          animation: heroPulse 2s ease infinite;
        }
        @keyframes heroPulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.35;transform:scale(0.75);} }

        .hero-title {
          font-size: clamp(42px, 7vw, 80px);
          font-weight: 900; line-height: 1.0;
          letter-spacing: -3px; margin-bottom: 1.5rem;
          color: #F1F3F5;
          animation: heroUp 0.6s cubic-bezier(.22,1,.36,1) 0.08s both;
        }
        .hero-title .line-blue {
          background: linear-gradient(90deg, #60A5FA 0%, #818cf8 50%, #a78bfa 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-title .line-gold { color: #FFB400; }

        .hero-sub {
          font-size: 17px; color: rgba(255,255,255,0.38);
          line-height: 1.7; max-width: 520px; margin: 0 auto 2.75rem;
          animation: heroUp 0.6s cubic-bezier(.22,1,.36,1) 0.15s both;
        }

        .hero-actions {
          display: flex; align-items: center; justify-content: center; gap: 12px;
          flex-wrap: wrap;
          animation: heroUp 0.6s cubic-bezier(.22,1,.36,1) 0.22s both;
        }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; border-radius: 11px;
          background: linear-gradient(135deg, #60A5FA 0%, #6366f1 100%);
          color: #fff; font-size: 15px; font-weight: 700;
          text-decoration: none; font-family: 'Outfit', sans-serif;
          box-shadow: 0 0 40px rgba(96,165,250,0.28), 0 4px 20px rgba(0,0,0,0.4);
          transition: transform 0.15s, box-shadow 0.15s;
          position: relative; overflow: hidden; border: none; cursor: pointer;
        }
        .btn-primary::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 56px rgba(96,165,250,0.38), 0 8px 28px rgba(0,0,0,0.4); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 24px; border-radius: 11px;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6); font-size: 15px; font-weight: 600;
          text-decoration: none; font-family: 'Outfit', sans-serif;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.07); color: #F1F3F5; border-color: rgba(255,255,255,0.18); }

        /* social proof */
        .hero-proof {
          display: flex; align-items: center; justify-content: center; gap: 20px;
          margin-top: 2.5rem; flex-wrap: wrap;
          animation: heroUp 0.6s cubic-bezier(.22,1,.36,1) 0.28s both;
        }
        .proof-item {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: rgba(255,255,255,0.3); font-weight: 500;
        }
        .proof-item svg { color: #10B981; }
        .proof-divider { width: 1px; height: 16px; background: rgba(255,255,255,0.08); }

        @keyframes heroUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ══════════════════════════════════════
           STATS STRIP
        ══════════════════════════════════════ */
        .stats-strip {
          border-top: 0.5px solid rgba(255,255,255,0.05);
          border-bottom: 0.5px solid rgba(255,255,255,0.05);
          display: flex; justify-content: center;
          animation: heroUp 0.6s ease 0.3s both;
        }
        .stat-cell {
          flex: 1; max-width: 220px; text-align: center;
          padding: 1.5rem 2rem;
          border-right: 0.5px solid rgba(255,255,255,0.05);
          position: relative; overflow: hidden;
        }
        .stat-cell:last-child { border-right: none; }
        .stat-cell::before {
          content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 40%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(96,165,250,0.4), transparent);
        }
        .stat-n {
          font-size: 32px; font-weight: 800; letter-spacing: -1.5px;
          color: #F1F3F5; line-height: 1;
        }
        .stat-n b { color: #FFB400; }
        .stat-l { font-size: 12px; color: rgba(255,255,255,0.28); margin-top: 5px; letter-spacing: 0.04em; }

        /* ══════════════════════════════════════
           PROBLEM PREVIEW
        ══════════════════════════════════════ */
        .preview-section {
          padding: 5rem 2rem;
          max-width: 900px; margin: 0 auto;
        }
        .section-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #FFB400; margin-bottom: 1rem;
        }
        .section-eyebrow span { width: 20px; height: 1px; background: #FFB400; display: inline-block; }
        .section-title {
          font-size: clamp(24px, 3.5vw, 36px); font-weight: 800;
          color: #F1F3F5; letter-spacing: -0.8px; margin-bottom: 0.6rem;
        }
        .section-sub {
          font-size: 14px; color: rgba(255,255,255,0.32);
          margin-bottom: 2.5rem; max-width: 440px;
        }

        /* problem cards */
        .prob-grid {
          display: flex; flex-direction: column; gap: 0;
          background: rgba(255,255,255,0.02);
          border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: 14px; overflow: hidden;
          margin-bottom: 1.5rem;
        }
        .prob-card {
          display: flex; align-items: center; gap: 1rem;
          padding: 14px 20px;
          border-bottom: 0.5px solid rgba(255,255,255,0.04);
          text-decoration: none; color: inherit;
          transition: background 0.12s;
          position: relative; cursor: pointer;
        }
        .prob-card:last-child { border-bottom: none; }
        .prob-card:hover { background: rgba(255,255,255,0.03); }
        .prob-card::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0;
          width: 2px; background: #60A5FA; opacity: 0;
          transition: opacity 0.15s; border-radius: 0 2px 2px 0;
        }
        .prob-card:hover::before { opacity: 1; }

        .prob-num { font-size: 13px; color: rgba(255,255,255,0.18); font-weight: 500; min-width: 28px; }
        .prob-solved {
          width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
          background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3);
          display: flex; align-items: center; justify-content: center; color: #10B981;
        }
        .prob-unsolved {
          width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .prob-title-text {
          flex: 1; font-size: 14px; font-weight: 500; color: #F1F3F5;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .prob-diff {
          padding: 3px 10px; border-radius: 6px;
          font-size: 12px; font-weight: 600; border: 0.5px solid;
          white-space: nowrap;
        }

        .preview-cta {
          display: flex; align-items: center; justify-content: center;
        }
        .btn-explore {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 12px 28px; border-radius: 10px;
          background: rgba(255,180,0,0.08);
          border: 0.5px solid rgba(255,180,0,0.25);
          color: #FFB400; font-size: 14px; font-weight: 700;
          text-decoration: none; font-family: 'Outfit', sans-serif;
          transition: background 0.15s, box-shadow 0.15s, transform 0.15s;
        }
        .btn-explore:hover {
          background: rgba(255,180,0,0.13);
          box-shadow: 0 0 32px rgba(255,180,0,0.15);
          transform: translateY(-1px);
        }

        /* ══════════════════════════════════════
           FEATURES
        ══════════════════════════════════════ */
        .features-section {
          padding: 4rem 2rem 5rem;
          border-top: 0.5px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.01);
        }
        .features-inner { max-width: 900px; margin: 0 auto; }
        .features-header { text-align: center; margin-bottom: 3rem; }

        .features-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }
        .feature-card {
          background: rgba(255,255,255,0.02);
          border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 1.75rem;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
          position: relative; overflow: hidden;
        }
        .feature-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
        }
        .feature-card:hover {
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.035);
          transform: translateY(-2px);
        }
        .feature-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1rem;
        }
        .feature-title {
          font-size: 16px; font-weight: 700; color: #F1F3F5;
          letter-spacing: -0.3px; margin-bottom: 6px;
        }
        .feature-desc { font-size: 13.5px; color: rgba(255,255,255,0.32); line-height: 1.65; }

        /* ══════════════════════════════════════
           CTA BANNER
        ══════════════════════════════════════ */
        .cta-banner {
          margin: 0 2rem 5rem;
          max-width: 860px; margin-left: auto; margin-right: auto;
          background: linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(99,102,241,0.06) 50%, rgba(255,180,0,0.05) 100%);
          border: 0.5px solid rgba(96,165,250,0.15);
          border-radius: 20px; padding: 3.5rem 3rem;
          text-align: center; position: relative; overflow: hidden;
        }
        .cta-banner::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        .cta-title {
          font-size: clamp(22px, 3.5vw, 32px); font-weight: 800;
          color: #F1F3F5; letter-spacing: -0.8px; margin-bottom: 0.75rem;
          position: relative; z-index: 1;
        }
        .cta-title span {
          background: linear-gradient(90deg, #60A5FA, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .cta-sub {
          font-size: 14px; color: rgba(255,255,255,0.35);
          margin-bottom: 2rem; position: relative; z-index: 1;
        }
        .cta-actions { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; position: relative; z-index: 1; }

        /* footer */
        .hp-footer {
          border-top: 0.5px solid rgba(255,255,255,0.05);
          padding: 1.5rem 2rem;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; color: rgba(255,255,255,0.2);
          gap: 6px;
        }
        .hp-footer span { color: #FFB400; font-weight: 600; }
      `}</style>

      <div className="hp">
        <Navbar />

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-grid" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />

          <div className="hero-inner">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              {isAuthenticated ? `Welcome back, ${user?.firstName} 👋` : "Start your coding journey"}
            </div>

            <h1 className="hero-title">
              <span className="line-blue">Code.</span><br />
              Solve. <span className="line-gold">Win.</span>
            </h1>

            <p className="hero-sub">
              Master data structures and algorithms through practice. Build the skills that get you hired at top tech companies.
            </p>

            <div className="hero-actions">
              <Link to="/problems" className="btn-primary">
                Explore Problems <IconArrow />
              </Link>
              {!isAuthenticated && (
                <Link to="/signup" className="btn-ghost">
                  Join for free
                </Link>
              )}
            </div>

            <div className="hero-proof">
              {["2,500+ problems", "Real interviews", "Track your progress"].map((t, i) => (
                <>
                  {i > 0 && <div key={`d${i}`} className="proof-divider" />}
                  <div key={t} className="proof-item">
                    <IconCheck /> {t}
                  </div>
                </>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="stats-strip">
          {[
            { n: <>2.5<b>k</b></>, l: "Problems" },
            { n: <>1<b>M+</b></>,  l: "Developers" },
            { n: <>94<b>%</b></>,  l: "Hire rate"  },
            { n: <><b>#1</b></>,   l: "DSA Platform"},
          ].map((s, i) => (
            <div key={i} className="stat-cell">
              <div className="stat-n">{s.n}</div>
              <div className="stat-l">{s.l}</div>
            </div>
          ))}
        </div>

        {/* ── PROBLEM PREVIEW ── */}
        <section className="preview-section">
          <div className="section-eyebrow">
            <span /> Problem Library <span />
          </div>
          <h2 className="section-title">Everything from Easy to Hard</h2>
          <p className="section-sub">
            Filter by difficulty, track what you've solved, and jump right in.
          </p>

          <div className="prob-grid">
            {PREVIEW_PROBLEMS.map((p, i) => {
              const d = DIFF[p.difficulty]
              return (
                <div key={p.id} className="prob-card">
                  <span className="prob-num">{i + 1}</span>
                  {p.solved
                    ? <div className="prob-solved"><IconCheck /></div>
                    : <div className="prob-unsolved" />
                  }
                  <span className="prob-title-text">{p.title}</span>
                  <span className="prob-diff" style={{ color: d.color, background: d.bg, borderColor: d.border }}>
                    {p.difficulty}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="preview-cta">
            <Link to="/problems" className="btn-explore">
              View all problems <IconArrow />
            </Link>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="features-section">
          <div className="features-inner">
            <div className="features-header">
              <div className="section-eyebrow">
                <span /> Why CodeOrbit <span />
              </div>
              <h2 className="section-title">Built for serious engineers</h2>
              <p className="section-sub" style={{ margin: "0.5rem auto 0", textAlign: "center" }}>
                Everything you need to go from beginner to interview-ready.
              </p>
            </div>

            <div className="features-grid">
              {FEATURES.map((f, i) => (
                <div key={i} className="feature-card">
                  <div className="feature-icon" style={{ background: f.bg, color: f.color }}>
                    {f.icon}
                  </div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        {!isAuthenticated && (
          <div className="cta-banner">
            <h2 className="cta-title">Ready to <span>launch your career?</span></h2>
            <p className="cta-sub">Join thousands of engineers already practicing on CodeOrbit.</p>
            <div className="cta-actions">
              <Link to="/signup" className="btn-primary">Get started free <IconArrow /></Link>
              <Link to="/problems" className="btn-ghost">Browse problems</Link>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <footer className="hp-footer">
          Built with ♥ · <span>CodeOrbit</span> · {new Date().getFullYear()}
        </footer>
      </div>
    </>
  )
}
