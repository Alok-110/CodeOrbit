import { useState, useRef, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { logoutUser } from "../authSlice"

const IconChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconCode = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
)

export default function Navbar() {
  const dispatch    = useDispatch()
  const navigate    = useNavigate()
  const location    = useLocation()
  const { user, isAuthenticated } = useSelector(s => s.auth)

  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const handleLogout = () => { dispatch(logoutUser()); navigate("/login") }
  const initials = user?.firstName ? user.firstName.slice(0, 2).toUpperCase() : "CO"
  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

        .nav-root {
          position: sticky; top: 0; z-index: 100;
          height: 58px;
          background: rgba(12, 14, 17, 0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 0.5px solid rgba(255,255,255,0.06);
          display: flex; align-items: center;
          padding: 0 2rem; gap: 0;
          font-family: 'Outfit', sans-serif;
        }

        .nav-logo {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none; flex-shrink: 0; margin-right: 2rem;
        }
        .nav-logo-mark {
          width: 32px; height: 32px; border-radius: 9px;
          background: linear-gradient(135deg, #60A5FA 0%, #6366f1 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800; color: #fff; flex-shrink: 0;
          box-shadow: 0 0 16px rgba(96,165,250,0.35);
          position: relative; overflow: hidden;
        }
        .nav-logo-mark::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 60%);
        }
        .nav-logo-text {
          font-size: 16px; font-weight: 800; color: #F1F3F5;
          letter-spacing: -0.4px;
        }
        .nav-logo-text span { color: #FFB400; }

        .nav-links { display: flex; align-items: center; gap: 2px; }
        .nav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 13px; border-radius: 8px;
          font-size: 14px; font-weight: 500;
          color: rgba(255,255,255,0.42);
          text-decoration: none;
          transition: color 0.15s, background 0.15s;
          position: relative;
        }
        .nav-link:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.05); }
        .nav-link.active {
          color: #F1F3F5; background: rgba(255,255,255,0.07);
        }
        .nav-link-pip {
          position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
          width: 4px; height: 4px; border-radius: 50%;
          background: #60A5FA; opacity: 0; transition: opacity 0.15s;
        }
        .nav-link.active .nav-link-pip { opacity: 1; }

        .nav-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }

        /* avatar */
        .nav-av-wrap { position: relative; }
        .nav-av-btn {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.09);
          border-radius: 100px; padding: 4px 10px 4px 4px;
          cursor: pointer; transition: background 0.15s, border-color 0.15s;
          font-family: 'Outfit', sans-serif;
        }
        .nav-av-btn:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.16); }
        .nav-av-circle {
          width: 27px; height: 27px; border-radius: 50%;
          background: linear-gradient(135deg, #FFB400, #f59e0b);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #0c0e11; flex-shrink: 0;
        }
        .nav-av-name {
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.7);
          max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .nav-chevron { color: rgba(255,255,255,0.28); display: flex; transition: transform 0.2s; }
        .nav-chevron.open { transform: rotate(180deg); }

        /* dropdown */
        .nav-drop {
          position: absolute; top: calc(100% + 8px); right: 0;
          min-width: 190px;
          background: #16181f;
          border: 0.5px solid rgba(255,255,255,0.09);
          border-radius: 13px; padding: 6px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.55);
          animation: navDropIn 0.15s cubic-bezier(.22,1,.36,1);
          z-index: 200;
        }
        @keyframes navDropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .nav-drop-head {
          padding: 8px 10px 10px;
          border-bottom: 0.5px solid rgba(255,255,255,0.06);
          margin-bottom: 4px;
        }
        .nav-drop-name { font-size: 13px; font-weight: 600; color: #F1F3F5; }
        .nav-drop-email { font-size: 11px; color: rgba(255,255,255,0.28); margin-top: 2px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .nav-drop-item {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 10px; border-radius: 8px;
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.55);
          cursor: pointer; transition: background 0.12s, color 0.12s;
          text-decoration: none; width: 100%; border: none; background: none;
          font-family: 'Outfit', sans-serif; text-align: left;
        }
        .nav-drop-item:hover { background: rgba(255,255,255,0.05); color: #F1F3F5; }
        .nav-drop-item.danger { color: rgba(239,68,68,0.65); }
        .nav-drop-item.danger:hover { background: rgba(239,68,68,0.08); color: #f87171; }
        .nav-drop-divider { height: 0.5px; background: rgba(255,255,255,0.06); margin: 4px 0; }

        .nav-signin {
          padding: 7px 18px; border-radius: 9px;
          background: linear-gradient(135deg, #60A5FA, #6366f1);
          color: #fff; font-size: 13px; font-weight: 600;
          text-decoration: none; font-family: 'Outfit', sans-serif;
          box-shadow: 0 0 20px rgba(96,165,250,0.2);
          transition: box-shadow 0.15s, transform 0.15s;
        }
        .nav-signin:hover { box-shadow: 0 0 32px rgba(96,165,250,0.35); transform: translateY(-1px); }
      `}</style>

      <nav className="nav-root">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="nav-logo-mark">◎</div>
          <span className="nav-logo-text">Code<span>Orbit</span></span>
        </Link>

        {/* Nav links */}
        <div className="nav-links">
          <Link to="/problems" className={`nav-link ${isActive("/problems") ? "active" : ""}`}>
            <IconCode />
            Problems
            <span className="nav-link-pip" />
          </Link>
        </div>

        {/* Right */}
        <div className="nav-right">
          {isAuthenticated ? (
            <div className="nav-av-wrap" ref={dropRef}>
              <button className="nav-av-btn" onClick={() => setDropOpen(v => !v)}>
                <div className="nav-av-circle">{initials}</div>
                <span className="nav-av-name">{user?.firstName || "User"}</span>
                <span className={`nav-chevron ${dropOpen ? "open" : ""}`}><IconChevron /></span>
              </button>

              {dropOpen && (
                <div className="nav-drop">
                  <div className="nav-drop-head">
                    <div className="nav-drop-name">{user?.firstName || "User"}</div>
                    <div className="nav-drop-email">{user?.emailId || ""}</div>
                  </div>
                  <Link to="/profile" className="nav-drop-item" onClick={() => setDropOpen(false)}>
                    <IconUser /> My Profile
                  </Link>
                  <div className="nav-drop-divider" />
                  <button className="nav-drop-item danger" onClick={handleLogout}>
                    <IconLogout /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-signin">Sign In</Link>
          )}
        </div>
      </nav>
    </>
  )
}
