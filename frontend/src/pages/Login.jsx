// src/pages/Login.jsx — signup without OTP
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Leaf, Phone, ArrowRight, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'

export default function Login() {
  const [mode, setMode]         = useState('login')
  const [form, setForm]         = useState({ name: '', phone: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState('')
  const { loginWithPassword, login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from || '/dashboard'

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ── LOGIN ──
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.phone || form.phone.length < 10) { setError('Enter a valid 10-digit mobile number.'); return }
    if (!form.password) { setError('Enter your password.'); return }
    setLoading(true)
    const res = await loginWithPassword(form.phone, form.password)
    setLoading(false)
    if (res.success) {
      navigate(from, { replace: true })
    } else {
      setError(res.message || 'Wrong phone or password.')
    }
  }

  // ── SIGNUP — no OTP, direct registration ──
  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim())                        { setError('Please enter your name.'); return }
    if (!form.phone || form.phone.length < 10)    { setError('Enter a valid 10-digit mobile number.'); return }
    if (!form.password || form.password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    try {
      // Directly register without OTP
      const res = await authAPI.registerDirect({
        name:     form.name.trim(),
        phone:    form.phone,
        password: form.password,
      })
      if (res.success) {
        // Auto login after signup
        login(res.data.user, res.data.token)
        setSuccess('Account created! Welcome to ManaHarvest 🌿')
        setTimeout(() => navigate(from, { replace: true }), 1000)
      } else {
        setError(res.error?.message || 'Signup failed. Try again.')
      }
    } catch (e) {
      setError(e.message || 'Signup failed. Try again.')
    } finally {
      setLoading(false)
    }
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
        {[
          'No chemicals. No preservatives.',
          'Batch transparency on every order.',
          'Free replacement if not satisfied.',
          'Support 12+ village farmers directly.',
        ].map(t => (
          <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <CheckCircle size={16} color="#A5D6A7" />
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>{t}</span>
          </div>
        ))}
      </div>

      {/* Right form panel */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 48px', background: 'white' }} className="login-right">

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: 'var(--cream)', borderRadius: 12, padding: 4, marginBottom: 36 }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{
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

        {/* ── LOGIN FORM ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Welcome back!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>Login with your phone and password.</p>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" type="tel" placeholder="10-digit mobile number" value={form.phone}
                  onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  style={{ paddingLeft: 42 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={form.password}
                  onChange={e => update('password', e.target.value)}
                  style={{ paddingLeft: 42, paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <div style={{ background: '#FFEBEE', color: '#C62828', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Logging in…' : <><span>Login</span> <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* ── SIGNUP FORM — No OTP ── */}
        {mode === 'register' && (
          <form onSubmit={handleSignup}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Join ManaHarvest</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>Create your account in seconds.</p>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" placeholder="Your name"
                value={form.name} onChange={e => update('name', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" type="tel" placeholder="10-digit mobile number" value={form.phone}
                  onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  style={{ paddingLeft: 42 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={form.password} onChange={e => update('password', e.target.value)}
                  style={{ paddingLeft: 42, paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error   && <div style={{ background: '#FFEBEE', color: '#C62828', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ background: '#E8F5E9', color: '#2E7D32', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{success}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Creating account…' : <><span>Create Account</span> <ArrowRight size={16} /></>}
            </button>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 14 }}>
              No OTP needed — instant signup ✅
            </p>
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