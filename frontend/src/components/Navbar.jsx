import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, Leaf, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cartPop, setCartPop] = useState(false)
  const { user, logout, cartCount } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location])

  useEffect(() => {
    if (cartCount > 0) {
      setCartPop(true)
      const t = setTimeout(() => setCartPop(false), 400)
      return () => clearTimeout(t)
    }
  }, [cartCount])

  const links = [
    { to: '/harvest', label: "Today's Harvest" },
    { to: '/farmers', label: 'Our Farmers' },
    { to: '/subscribe', label: 'Subscribe' },
    { to: '/track', label: 'Track Order' },
  ]

  const isActive = (to) => location.pathname === to

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(241,248,233,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #C8E6C9' : '1px solid transparent',
        transition: 'all .3s ease'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: 64, gap: 32 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, background: 'var(--green)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--green)' }}>
              Mana<span style={{ color: 'var(--brown)' }}>Harvest</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', alignItems: 'center' }} className="nav-links">
            {links.map(l => (
              <Link key={l.to} to={l.to} style={{
                padding: '6px 16px', borderRadius: 99, fontSize: 14, fontWeight: 500,
                color: isActive(l.to) ? 'var(--green)' : 'var(--text-muted)',
                background: isActive(l.to) ? 'var(--green-pale)' : 'transparent',
                transition: 'all .2s'
              }}>{l.label}</Link>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="nav-actions">
            {/* Cart */}
            <Link to="/cart" style={{ position: 'relative' }}>
              <button style={{
                width: 40, height: 40, borderRadius: 10, background: 'white',
                border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--text)',
                transform: cartPop ? 'scale(1.2)' : 'scale(1)', transition: 'transform .2s'
              }}>
                <ShoppingCart size={18} />
              </button>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6, background: 'var(--green)',
                  color: 'white', borderRadius: 99, width: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700
                }}>{cartCount}</span>
              )}
            </Link>

            {user ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Link to="/dashboard">
                  <button style={{
                    height: 40, padding: '0 16px', borderRadius: 10, background: 'var(--green-pale)',
                    border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center',
                    gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--green)'
                  }}>
                    <User size={15} />
                    <span className="hide-sm">{user.name.split(' ')[0]}</span>
                  </button>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" title="Admin Panel">
                    <button style={{
                      width: 40, height: 40, borderRadius: 10, background: 'white',
                      border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 18
                    }}>🛡️</button>
                  </Link>
                )}
                <button onClick={logout} style={{
                  width: 40, height: 40, borderRadius: 10, background: 'white',
                  border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'var(--text-muted)'
                }}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Link to="/login">
                  <button className="btn btn-primary btn-sm" style={{ borderRadius: 10 }}>
                    Login
                  </button>
                </Link>
                <Link to="/admin" title="Admin Panel">
                  <button style={{
                    width: 40, height: 40, borderRadius: 10, background: 'white',
                    border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 18
                  }}>🛡️</button>
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setOpen(o => !o)}
              className="hamburger"
              style={{
                width: 40, height: 40, borderRadius: 10, background: 'white',
                border: '1.5px solid var(--border)', display: 'none', alignItems: 'center',
                justifyContent: 'center', color: 'var(--text)'
              }}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, bottom: 0, zIndex: 99,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)'
        }} onClick={() => setOpen(false)}>
          <div style={{
            background: 'white', padding: 24, display: 'flex', flexDirection: 'column', gap: 4
          }} onClick={e => e.stopPropagation()}>
            {links.map(l => (
              <Link key={l.to} to={l.to} style={{
                padding: '14px 16px', borderRadius: 12, fontSize: 16, fontWeight: 500,
                color: isActive(l.to) ? 'var(--green)' : 'var(--text)',
                background: isActive(l.to) ? 'var(--green-pale)' : 'transparent'
              }}>{l.label}</Link>
            ))}
            <hr style={{ margin: '8px 0', borderColor: 'var(--border)' }} />
            {user ? (
              <>
                <Link to="/dashboard" style={{ padding: '14px 16px', borderRadius: 12, fontSize: 16, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={16} /> My Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" style={{ padding: '14px 16px', borderRadius: 12, fontSize: 16, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    🛡️ Admin Panel
                  </Link>
                )}
                <button onClick={logout} style={{ padding: '14px 16px', borderRadius: 12, fontSize: 16, fontWeight: 500, color: '#C62828', background: '#FFEBEE', display: 'flex', alignItems: 'center', gap: 8, border: 'none', width: '100%', cursor: 'pointer' }}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ padding: '14px 16px', borderRadius: 12, fontSize: 16, fontWeight: 600, color: 'white', background: 'var(--green)', textAlign: 'center' }}>
                  Login / Sign Up
                </Link>
                <Link to="/admin" style={{ padding: '14px 16px', borderRadius: 12, fontSize: 16, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  🛡️ Admin Panel
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; }
          .hide-sm { display: none !important; }
        }
      `}</style>
    </>
  )
}