// src/pages/Login.jsx — updated to use real OTP auth
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Leaf, Phone, ArrowRight, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [mode, setMode] = useState('login')  // login | register | otp
  const [form, setForm] = useState({ name: '', phone: '' })
  const [otp, setOtp]   = useState(['', '', '', '', '', ''])
  const [devOtp, setDevOtp] = useState('')   // shown in dev mode only
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { sendOtp, verifyOtp } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from || '/dashboard'

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Step 1: send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.phone || form.phone.length < 10) { setError('Enter a valid 10-digit mobile number.'); return }
    if (mode === 'register' && !form.name.trim()) { setError('Please enter your name.'); return }
    setLoading(true)
    const res = await sendOtp(form.phone)
    setLoading(false)
    if (res.success) {
      if (res.otp) setDevOtp(res.otp)   // dev mode: backend returns OTP
      setMode('otp')
    } else {
      setError(res.message || 'Failed to send OTP. Try again.')
    }
  }

  // Step 2: verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const otpStr = otp.join('')
    if (otpStr.length < 6) { setError('Enter the 6-digit OTP'); return }
    setLoading(true)
    const res = await verifyOtp(form.phone, otpStr, form.name)
    setLoading(false)
    if (res.success) {
      navigate(from, { replace: true })
    } else {
      setError(res.message || 'Wrong OTP. Please try again.')
    }
  }

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus()
  }

  return (
    <div className="page-enter" style={{ minHeight: '100vh', display: 'flex', background: 'var(--cream)' }}>
      {/* Left branding panel */}
      <div style={{
        flex: 1, background: 'linear-gradient(160deg, var(--green) 0%, #1B5E20 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 56px',
        position: 'relative', overflow: 'hidden'
      }} className="login-left">
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 250, height: 250, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
          <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'white' }}>ManaHarvest</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: 20 }}>
          Fresh vegetables,<br />every morning.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 1.7, marginBottom: 40, maxWidth: 340 }}>
          Join 500+ families who receive farm-fresh produce harvested before sunrise and delivered by noon.
        </p>
        {['No chemicals. No preservatives.', 'Batch transparency on every order.', 'Free replacement if not satisfied.', 'Support 12+ village farmers directly.'].map(t => (
          <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <CheckCircle size={16} color="#A5D6A7" />
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>{t}</span>
          </div>
        ))}
      </div>

      {/* Right form panel */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 48px', background: 'white' }} className="login-right">

        {/* Tab switcher */}
        {mode !== 'otp' && (
          <div style={{ display: 'flex', background: 'var(--cream)', borderRadius: 12, padding: 4, marginBottom: 36 }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', fontWeight: 600,
                fontSize: 14, cursor: 'pointer', transition: 'all .2s',
                background: mode === m ? 'white' : 'transparent',
                color: mode === m ? 'var(--green)' : 'var(--text-muted)',
                boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
              }}>
                {m === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>
        )}

        {/* Login / Register Form */}
        {mode !== 'otp' && (
          <form onSubmit={handleSendOtp}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
              {mode === 'login' ? 'Welcome back!' : 'Join ManaHarvest'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
              {mode === 'login' ? 'Login with your mobile number.' : 'Create your account in 30 seconds.'}
            </p>

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="Your name" value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" type="tel" placeholder="10-digit mobile number" value={form.phone}
                  onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  style={{ paddingLeft: 42 }} />
              </div>
            </div>

            {error && <div style={{ background: '#FFEBEE', color: '#C62828', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Sending OTP…' : <><span>Send OTP</span> <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* OTP Verification */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ width: 56, height: 56, background: 'var(--green-pale)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Phone size={24} color="var(--green)" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Verify Your Number</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>
              We sent a 6-digit OTP to <strong>+91 {form.phone}</strong>.
            </p>
            {devOtp && (
              <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 8, padding: '8px 12px', fontSize: 13, marginBottom: 20, color: '#2E7D32' }}>
                🔧 Dev mode — Your OTP is: <strong style={{ fontFamily: 'monospace', fontSize: 16 }}>{devOtp}</strong>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
              {otp.map((d, i) => (
                <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) document.getElementById(`otp-${i - 1}`)?.focus() }}
                  style={{
                    width: 46, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700,
                    border: `2px solid ${d ? 'var(--green)' : 'var(--border)'}`, borderRadius: 12,
                    background: d ? 'var(--green-pale)' : 'white', color: 'var(--text)',
                    transition: 'all .2s', outline: 'none', fontFamily: 'var(--font-body)'
                  }}
                />
              ))}
            </div>

            {error && <div style={{ background: '#FFEBEE', color: '#C62828', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </button>
            <button type="button" onClick={() => { setMode('login'); setOtp(['', '', '', '', '', '']); setError('') }}
              style={{ display: 'block', margin: '16px auto 0', color: 'var(--text-muted)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>
              ← Change number
            </button>
          </form>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-left { display: none !important; }
          .login-right { max-width: 100% !important; padding: 100px 24px 48px !important; }
        }
      `}</style>
    </div>
  )
}
