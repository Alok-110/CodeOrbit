import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { registerUser } from "../authSlice"
import { useNavigate } from "react-router"

// ── schema untouched ────────────────────────────────────────────────
const signUpSchema = z.object({
  firstName: z.string().min(2, "Name should have atleast 3 chars"),
  emailId: z.string().email(),
  password: z.string().min(8, "Password should have atleast 8 chars"),
})

// ── SVG Icons ───────────────────────────────────────────────────────
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
)
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)
const IconEyeOpen = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconEyeClosed = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const IconAlert = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg>
)

// ── Floating Label Input ────────────────────────────────────────────
function FloatingInput({ label, error, leftIcon, rightSlot, inputProps }) {
  const [focused, setFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const lifted = focused || hasValue

  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <div style={{
        position: "relative",
        borderRadius: "12px",
        border: `1.5px solid ${error ? "#f87171" : focused ? "#60A5FA" : "rgba(255,255,255,0.07)"}`,
        background: "rgba(255,255,255,0.03)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: focused ? `0 0 0 4px ${error ? "#ef444414" : "#60A5FA14"}` : "none",
      }}>
        {/* left icon */}
        <span style={{
          position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)",
          color: focused ? "#60A5FA" : "rgba(255,255,255,0.25)",
          transition: "color 0.2s", pointerEvents: "none", display: "flex",
        }}>
          {leftIcon}
        </span>

        {/* floating label */}
        <label style={{
          position: "absolute", left: "46px",
          top: lifted ? "7px" : "50%",
          transform: lifted ? "translateY(0) scale(0.73)" : "translateY(-50%)",
          transformOrigin: "left",
          color: error ? "#f87171" : focused ? "#60A5FA" : "rgba(255,255,255,0.3)",
          fontSize: "14px", fontFamily: "'Outfit', sans-serif", fontWeight: 500,
          pointerEvents: "none",
          transition: "all 0.17s cubic-bezier(.4,0,.2,1)",
          whiteSpace: "nowrap",
        }}>
          {label}
        </label>

        <input
          {...inputProps}
          onFocus={e => { setFocused(true); inputProps?.onFocus?.(e) }}
          onBlur={e => { setFocused(false); setHasValue(!!e.target.value); inputProps?.onBlur?.(e) }}
          onChange={e => { setHasValue(!!e.target.value); inputProps?.onChange?.(e) }}
          style={{
            width: "100%", background: "transparent", border: "none", outline: "none",
            color: "#F1F3F5", fontSize: "15px", fontFamily: "'Outfit', sans-serif", fontWeight: 400,
            padding: lifted ? "22px 46px 7px 46px" : "16px 46px 16px 46px",
            boxSizing: "border-box", caretColor: "#60A5FA",
            transition: "padding 0.17s cubic-bezier(.4,0,.2,1)",
          }}
        />

        {rightSlot && (
          <span style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)" }}>
            {rightSlot}
          </span>
        )}
      </div>

      {error && (
        <p style={{
          margin: "5px 0 0 3px", color: "#f87171", fontSize: "12px",
          fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: "5px",
          animation: "errShake 0.3s ease",
        }}>
          <IconAlert /> {error}
        </p>
      )}
    </div>
  )
}

// ── Strength Meter ──────────────────────────────────────────────────
function StrengthMeter({ pw }) {
  if (!pw) return null
  const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)]
  const score = checks.filter(Boolean).length
  const colors = ["#f87171", "#FFB400", "#60A5FA", "#10B981"]
  const labels = ["Weak", "Fair", "Good", "Strong"]
  return (
    <div style={{ marginTop: "-0.4rem", marginBottom: "1rem" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            flex: 1, height: "3px", borderRadius: "99px",
            background: i < score ? colors[score-1] : "rgba(255,255,255,0.07)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <p style={{
        fontSize: "11px", color: colors[score-1], fontWeight: 600,
        letterSpacing: "0.06em", textTransform: "uppercase",
        fontFamily: "'Outfit', sans-serif",
      }}>{labels[score-1]}</p>
    </div>
  )
}

// ── Component ───────────────────────────────────────────────────────
function SignUp() {
  // ── ALL ORIGINAL LOGIC UNTOUCHED ──
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, loading, error } = useSelector(s => s.auth)
  const { register, handleSubmit, formState: { errors }, watch } = useForm({ resolver: zodResolver(signUpSchema) })
  useEffect(() => { if (isAuthenticated) navigate("/") }, [isAuthenticated, navigate])
  const onSubmit = (data) => { dispatch(registerUser(data)) }
  // ── END ORIGINAL LOGIC ──

  const [showPw, setShowPw] = useState(false)
  const pw = watch("password", "")
  const { ref: r1, ...f1 } = register("firstName")
  const { ref: r2, ...f2 } = register("emailId")
  const { ref: r3, ...f3 } = register("password")

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0c0e11; }

        .su-root {
          min-height: 100vh; display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'Outfit', sans-serif;
        }
        @media (max-width: 768px) { .su-left { display: none; } .su-root { grid-template-columns: 1fr; } }

        .su-left {
          position: relative; overflow: hidden;
          background: #111318;
          display: flex; flex-direction: column;
          justify-content: center; padding: 4rem 3.5rem;
        }
        /* gradient fade on the right edge — replaces hard border */
        .su-left::after {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 70% 50% at 10% 20%, rgba(96,165,250,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 60% at 90% 80%, rgba(167,139,250,0.08) 0%, transparent 60%),
            linear-gradient(to right, transparent 70%, #0c0e11 100%);
        }
        .su-left-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 36px 36px;
          mask-image: linear-gradient(to right, black 60%, transparent 100%);
        }

        .brand { position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; margin-bottom: 3.5rem; }
        .brand-icon {
          width: 36px; height: 36px; border-radius: 9px;
          background: linear-gradient(135deg, #60A5FA, #6366f1);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 800; color: #fff;
          box-shadow: 0 0 20px rgba(96,165,250,0.3);
        }
        .brand-name { font-size: 18px; font-weight: 700; color: #F1F3F5; letter-spacing: -0.3px; }
        .brand-name span { color: #FFB400; }

        .left-hl {
          position: relative; z-index: 1;
          font-size: clamp(28px, 2.8vw, 38px);
          font-weight: 800; color: #F1F3F5;
          line-height: 1.15; letter-spacing: -1px;
          margin-bottom: 1.1rem;
          max-width: 300px;
        }
        .left-hl .grad {
          background: linear-gradient(90deg, #60A5FA 0%, #a78bfa 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .left-desc {
          position: relative; z-index: 1;
          font-size: 14px; color: rgba(255,255,255,0.38);
          line-height: 1.7; max-width: 300px; margin-bottom: 2.5rem;
        }

        .left-stats { position: relative; z-index: 1; display: flex; gap: 2.5rem; }
        .ls-num { font-size: 30px; font-weight: 800; color: #F1F3F5; letter-spacing: -1px; line-height: 1; }
        .ls-num b { color: #FFB400; font-weight: 800; }
        .ls-lbl { font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 3px; letter-spacing: 0.04em; }

        /* floating code card */
        .code-card {
          position: absolute; z-index: 1; bottom: 3rem; right: 2rem;
          background: rgba(255,255,255,0.035);
          border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 14px 18px;
          font-family: 'JetBrains Mono', monospace; font-size: 12px;
          color: rgba(255,255,255,0.22); line-height: 1.75;
          backdrop-filter: blur(8px);
          animation: floatAnim 5s ease-in-out infinite alternate;
        }
        @keyframes floatAnim { from { transform: translateY(0); } to { transform: translateY(-10px); } }
        .ck  { color: #60A5FA; } .cf { color: #FFB400; } .cs { color: #10B981; }

        /* accepted badge */
        .accepted-badge {
          position: absolute; z-index: 1; top: 3rem; right: 2.5rem;
          background: rgba(16,185,129,0.1);
          border: 0.5px solid rgba(16,185,129,0.3);
          border-radius: 100px; padding: 6px 14px;
          font-size: 12px; font-weight: 600; color: #10B981;
          display: flex; align-items: center; gap: 6px;
          animation: floatAnim 5s ease-in-out infinite alternate; animation-delay: -2.5s;
        }
        .acc-dot { width: 7px; height: 7px; border-radius: 50%; background: #10B981;
          animation: accPulse 1.5s ease infinite; }
        @keyframes accPulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

        /* RIGHT */
        .su-right {
          background: #0c0e11; display: flex;
          align-items: center; justify-content: center;
          padding: 3rem 2rem; position: relative; overflow-y: auto;
        }
        .su-right::before {
          content: ''; position: fixed;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%);
          bottom: -150px; right: -150px; pointer-events: none;
        }

        .form-box {
          width: 100%; max-width: 390px;
          animation: riseIn 0.5s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes riseIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

        .fh-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(96,165,250,0.08);
          border: 0.5px solid rgba(96,165,250,0.2);
          border-radius: 100px; padding: 4px 13px;
          font-size: 11.5px; color: #60A5FA; font-weight: 600;
          letter-spacing: 0.04em; margin-bottom: 1rem;
        }
        .fh-dot { width: 6px; height: 6px; border-radius: 50%; background: #60A5FA;
          animation: accPulse 2s ease infinite; }

        .fh-title {
          font-size: 26px; font-weight: 800; color: #F1F3F5;
          letter-spacing: -0.6px; line-height: 1.15; margin-bottom: 6px;
        }
        .fh-title .grad {
          background: linear-gradient(90deg, #60A5FA, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .fh-sub { font-size: 13.5px; color: rgba(255,255,255,0.3); margin-bottom: 2rem; }
        .fh-sub a { color: #FFB400; font-weight: 600; text-decoration: none; }
        .fh-sub a:hover { text-decoration: underline; }

        .err-banner {
          background: rgba(239,68,68,0.07);
          border: 0.5px solid rgba(239,68,68,0.35);
          border-radius: 10px; padding: 10px 14px;
          color: #f87171; font-size: 13px; margin-bottom: 1.2rem;
          display: flex; align-items: center; gap: 9px;
          animation: errShake 0.35s ease;
        }
        @keyframes errShake {
          0%,100% { transform:translateX(0); } 20% { transform:translateX(-5px); }
          40% { transform:translateX(5px); } 60% { transform:translateX(-3px); } 80% { transform:translateX(3px); }
        }

        .sub-btn {
          width: 100%; padding: 14px; border: none; border-radius: 12px;
          background: linear-gradient(135deg, #60A5FA 0%, #6366f1 100%);
          color: #fff; font-size: 15px; font-weight: 700;
          font-family: 'Outfit', sans-serif; letter-spacing: 0.01em;
          cursor: pointer; margin-top: 0.2rem;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s;
          box-shadow: 0 0 40px rgba(96,165,250,0.2), 0 4px 20px rgba(0,0,0,0.4);
          position: relative; overflow: hidden;
        }
        .sub-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%);
          pointer-events: none;
        }
        .sub-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 56px rgba(96,165,250,0.3), 0 8px 28px rgba(0,0,0,0.4); }
        .sub-btn:active:not(:disabled) { transform: translateY(0); }
        .sub-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner {
          display: inline-block; width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff;
          border-radius: 50%; animation: spin 0.7s linear infinite;
          vertical-align: middle; margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .toggle-pw {
          background: none; border: none; cursor: pointer; padding: 4px;
          color: rgba(255,255,255,0.25); transition: color 0.2s;
          display: flex; align-items: center;
        }
        .toggle-pw:hover { color: rgba(255,255,255,0.65); }

        .bottom-link {
          text-align: center; margin-top: 1.5rem;
          font-size: 13px; color: rgba(255,255,255,0.28);
        }
        .bottom-link a { color: #60A5FA; font-weight: 500; text-decoration: none; margin-left: 4px; }
        .bottom-link a:hover { text-decoration: underline; }

        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #0c0e11 inset !important;
          -webkit-text-fill-color: #F1F3F5 !important;
        }
      `}</style>

      <div className="su-root">

        {/* LEFT */}
        <div className="su-left">
          <div className="su-left-grid" />
          <div className="brand">
            <div className="brand-icon">LC</div>
            <div className="brand-name">Code<span>Orbit</span></div>
          </div>

          <h1 className="left-hl">
            Master coding.<br />
            <span className="grad">Land your dream offer.</span>
          </h1>
          <p className="left-desc">
            2,500+ problems, real-time contests, and an editorial-quality platform built by developers, for developers.
          </p>

          <div className="left-stats">
            <div><div className="ls-num">2.5<b>k</b></div><div className="ls-lbl">Problems</div></div>
            <div><div className="ls-num">1<b>M+</b></div><div className="ls-lbl">Coders</div></div>
            <div><div className="ls-num">94<b>%</b></div><div className="ls-lbl">Hire rate</div></div>
          </div>

          <div className="accepted-badge">
            <div className="acc-dot" /> Accepted — 48ms, beats 91%
          </div>

          <div className="code-card">
            <div><span className="ck">def</span> <span className="cf">twoSum</span>(nums, target):</div>
            <div>&nbsp;&nbsp;seen = {"{}"}</div>
            <div>&nbsp;&nbsp;<span className="ck">for</span> i, n <span className="ck">in</span> <span className="cf">enumerate</span>(nums):</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">if</span> target - n <span className="ck">in</span> seen:</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">return</span> [seen[target-n], i]</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;seen[n] = i</div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="su-right">
          <div className="form-box">
            <div className="fh-eyebrow"><span className="fh-dot" /> Free forever</div>
            <h2 className="fh-title">Create your <span className="grad">account</span></h2>
            <p className="fh-sub">Already a member? <a href="/login">Sign in</a></p>

            {error && (
              <div className="err-banner">
                <IconAlert />
                {typeof error === "string" ? error : "Something went wrong. Please try again."}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <FloatingInput label="Full name" error={errors.firstName?.message}
                leftIcon={<IconUser />}
                inputProps={{ ...f1, ref: r1, type: "text", autoComplete: "name" }} />

              <FloatingInput label="Email address" error={errors.emailId?.message}
                leftIcon={<IconMail />}
                inputProps={{ ...f2, ref: r2, type: "email", autoComplete: "email" }} />

              <FloatingInput label="Password" error={errors.password?.message}
                leftIcon={<IconLock />}
                inputProps={{ ...f3, ref: r3, type: showPw ? "text" : "password", autoComplete: "new-password" }}
                rightSlot={
                  <button type="button" className="toggle-pw" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                    {showPw ? <IconEyeClosed /> : <IconEyeOpen />}
                  </button>
                }
              />

              <StrengthMeter pw={pw} />

              <button type="submit" className="sub-btn" disabled={loading}>
                {loading && <span className="spinner" />}
                {loading ? "Creating account…" : "Create Account →"}
              </button>
            </form>

            <div className="bottom-link">
              Already have an account? <a href="/login">Sign in</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignUp
