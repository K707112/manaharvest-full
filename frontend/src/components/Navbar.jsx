// src/components/Navbar.jsx — Amazon Fresh style
import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, LogOut, Sun, Moon, Menu, X, Leaf } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [query, setQuery]         = useState('')
  const [menuOpen, setMenuOpen]   = useState(false)
  const [cartPop, setCartPop]     = useState(false)
  const { user, logout, cartCount } = useAuth()
  const { isDark, isTelugu, toggleTheme, toggleLang } = useTheme()
  const location  = useLocation()
  const navigate  = useNavigate()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  useEffect(() => {
    if (cartCount > 0) {
      setCartPop(true)
      setTimeout(() => setCartPop(false), 400)
    }
  }, [cartCount])

  const handleSearch = e => {
    e.preventDefault()
    if (query.trim()) navigate(`/harvest?q=${encodeURIComponent(query.trim())}`)
  }

  const NAV_LINKS = [
    { to: '/harvest',   label: "Today's Harvest", te: 'నేటి పంట' },
    { to: '/subscribe', label: 'Weekly Plans',     te: 'వారపు ప్లాన్లు' },
    { to: '/farmers',   label: 'Our Farmers',      te: 'మా రైతులు' },
    { to: '/smart-box', label: '🤖 AI Box',         te: '🤖 AI బాక్స్' },
    { to: '/contact',   label: 'Contact',           te: 'సంప్రదించండి' },
  ]

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'var(--bg-card)' : 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transition: 'all 0.3s',
        height: 'var(--nav-height)',
      }}>
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, background: 'var(--green)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={18} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--green)', lineHeight: 1 }}>
                Mana<span style={{ color: 'var(--brown)' }}>Harvest</span>
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1, lineHeight: 1 }}>FARM FRESH · VIZAG</div>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 500, position: 'relative' }} className="hide-mobile">
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder={isTelugu ? "కూరగాయలు, రైతులు వెతకండి..." : "Search vegetables, farmers..."}
              className="form-input"
              style={{ paddingLeft: 38, height: 40, borderRadius: 8, background: 'var(--bg-secondary)' }} />
          </form>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }} className="hide-mobile">
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to}
                className={isTelugu ? 'telugu' : ''}
                style={{
                  padding: '6px 10px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  color: location.pathname === l.to ? 'var(--green)' : 'var(--text-secondary)',
                  background: location.pathname === l.to ? 'var(--green-pale)' : 'transparent',
                  textDecoration: 'none', whiteSpace: 'nowrap', transition: 'var(--transition)',
                }}>
                {isTelugu && l.te ? l.te : l.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 'auto' }}>

            {/* Telugu toggle */}
            <button onClick={toggleLang} title={isTelugu ? 'Switch to English' : 'తెలుగులో చదవండి'}
              style={{ height: 36, padding: '0 10px', borderRadius: 8, border: '1.5px solid var(--border)', background: isTelugu ? 'var(--saffron-pale)' : 'var(--bg-card)', color: isTelugu ? 'var(--saffron)' : 'var(--text-muted)', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'var(--transition)' }}
              className="hide-mobile">
              {isTelugu ? 'EN' : 'తె'}
            </button>

            {/* Dark mode toggle */}
            <button onClick={toggleTheme}
              style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)' }}
              className="hide-mobile">
              {isDark ? <Sun size={16} color="var(--saffron)" /> : <Moon size={16} />}
            </button>

            {/* Cart */}
            <Link to="/cart" style={{ position: 'relative', textDecoration: 'none' }}>
              <button style={{
                width: 36, height: 36, borderRadius: 8, border: '1.5px solid var(--border)',
                background: 'var(--bg-card)', color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                transform: cartPop ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.2s',
              }}>
                <ShoppingCart size={16} />
              </button>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--green)', color: 'white', borderRadius: 99, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                  <button style={{ height: 36, padding: '0 12px', borderRadius: 8, border: '1.5px solid var(--green)', background: 'var(--green-pale)', color: 'var(--green)', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={14} />
                    <span className="hide-mobile">{user.name?.split(' ')[0]}</span>
                  </button>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" style={{ textDecoration: 'none' }}>
                    <button style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontSize: 16, cursor: 'pointer' }}>🛡️</button>
                  </Link>
                )}
                <button onClick={logout} style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <button className="btn btn-primary btn-sm">
                    {isTelugu ? 'లాగిన్' : 'Login'}
                  </button>
                </Link>
                <Link to="/admin" style={{ textDecoration: 'none' }}>
                  <button style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontSize: 16, cursor: 'pointer' }}>🛡️</button>
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(o => !o)}
              style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              className="hamburger">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.5)' }} onClick={() => setMenuOpen(false)}>
          <div style={{ position: 'absolute', top: 'var(--nav-height)', left: 0, right: 0, background: 'var(--bg-card)', padding: 20, borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
            onClick={e => e.stopPropagation()}>

            {/* Mobile search */}
            <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: 16 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search vegetables..."
                className="form-input" style={{ paddingLeft: 38 }} />
            </form>

            {/* Mobile nav links */}
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to}
                style={{ display: 'block', padding: '12px 14px', borderRadius: 10, fontSize: 15, fontWeight: 500, color: location.pathname === l.to ? 'var(--green)' : 'var(--text-primary)', background: location.pathname === l.to ? 'var(--green-pale)' : 'transparent', textDecoration: 'none', marginBottom: 4 }}>
                {isTelugu && l.te ? l.te : l.label}
              </Link>
            ))}

            <hr style={{ margin: '12px 0', borderColor: 'var(--border)' }} />

            {/* Mobile toggles */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={toggleLang} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid var(--border)', background: isTelugu ? 'var(--saffron-pale)' : 'var(--bg-card)', color: isTelugu ? 'var(--saffron)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}>
                {isTelugu ? '🌐 English' : '🌐 తెలుగు'}
              </button>
              <button onClick={toggleTheme} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}>
                {isDark ? <><Sun size={16} color="var(--saffron)" /> Light</> : <><Moon size={16} /> Dark</>}
              </button>
            </div>

            {/* Mobile user */}
            {user ? (
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <Link to="/dashboard" style={{ flex: 1, textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: 'var(--green)', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <User size={15} /> {user.name?.split(' ')[0]}
                  </button>
                </Link>
                <button onClick={logout} style={{ padding: '11px 16px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: '#C62828', cursor: 'pointer', fontWeight: 600 }}>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" style={{ display: 'block', marginTop: 12, textDecoration: 'none' }}>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>Login / Sign Up</button>
              </Link>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .hamburger   { display: flex !important; }
        }
      `}</style>
    </>
  )
}