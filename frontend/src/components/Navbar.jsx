// src/components/Navbar.jsx
import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Leaf, User, LogOut, X, ShoppingCart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [query, setQuery]         = useState('')
  const { user, logout, cartCount } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/harvest?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.97)' : 'white',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #f0f0f0',
      boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.08)' : 'none',
      transition: 'all .25s',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 16px',
        display: 'flex', alignItems: 'center', height: 60, gap: 12,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #2E7D32, #43A047)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={17} color="white" />
          </div>
          <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 18, color: '#1B5E20', letterSpacing: -0.5 }}>
            Mana<span style={{ color: '#795548' }}>Harvest</span>
          </span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search vegetables, farmers…"
            style={{
              width: '100%', height: 40, paddingLeft: 40, paddingRight: query ? 36 : 16,
              border: '1.5px solid #e8e8e8', borderRadius: 10,
              fontSize: 13, background: '#fafafa', outline: 'none', boxSizing: 'border-box',
              transition: 'border .2s',
              fontFamily: 'inherit',
            }}
            onFocus={e => e.target.style.borderColor = '#2E7D32'}
            onBlur={e => e.target.style.borderColor = '#e8e8e8'}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </form>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }} className="desk-links">
          {[
            { to: '/harvest', label: "Today's Harvest" },
            { to: '/farmers', label: 'Farmers' },
            { to: '/subscribe', label: 'Subscribe' },
            { to: '/contact', label: 'Contact' },
          ].map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              color: location.pathname === l.to ? '#2E7D32' : '#555',
              background: location.pathname === l.to ? '#E8F5E9' : 'transparent',
              textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all .15s',
            }}>{l.label}</Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Cart - desktop only */}
          <Link to="/cart" className="desk-links" style={{ position: 'relative', textDecoration: 'none' }}>
            <button style={{ width: 38, height: 38, borderRadius: 10, background: '#f5f5f5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555' }}>
              <ShoppingCart size={17} />
            </button>
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#2E7D32', color: 'white', borderRadius: 99, width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800 }}>{cartCount}</span>
            )}
          </Link>

          {user ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <button style={{ height: 38, padding: '0 14px', borderRadius: 10, background: '#E8F5E9', border: '1px solid #C8E6C9', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#2E7D32', cursor: 'pointer' }}>
                  <User size={14} />
                  <span className="desk-links">{user.name.split(' ')[0]}</span>
                </button>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" title="Admin">
                  <button style={{ width: 38, height: 38, borderRadius: 10, background: '#f5f5f5', border: 'none', fontSize: 16, cursor: 'pointer' }}>🛡️</button>
                </Link>
              )}
              <button onClick={logout} style={{ width: 38, height: 38, borderRadius: 10, background: '#f5f5f5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888' }}>
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 6 }}>
              <Link to="/login">
                <button style={{ height: 38, padding: '0 16px', borderRadius: 10, background: '#2E7D32', color: 'white', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Login</button>
              </Link>
              <Link to="/admin" title="Admin">
                <button style={{ width: 38, height: 38, borderRadius: 10, background: '#f5f5f5', border: 'none', fontSize: 16, cursor: 'pointer' }}>🛡️</button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desk-links { display: none !important; }
        }
      `}</style>
    </nav>
  )
}