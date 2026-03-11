// src/components/BottomNav.jsx
import { Link, useLocation } from 'react-router-dom'
import { Home, Leaf, ShoppingBag, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const tabs = [
  { to: '/',          icon: Home,        label: 'Home' },
  { to: '/harvest',   icon: Leaf,        label: 'Harvest' },
  { to: '/cart',      icon: ShoppingBag, label: 'Orders' },
  { to: '/dashboard', icon: User,        label: 'Profile' },
]

export default function BottomNav() {
  const location = useLocation()
  const { cartCount } = useAuth()

  return (
    <>
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: 'white', borderTop: '1px solid #eee',
        display: 'flex', alignItems: 'stretch',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)', height: 64,
      }}>
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          const isOrders = label === 'Orders'
          return (
            <Link key={to} to={to} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              textDecoration: 'none',
              color: active ? '#2E7D32' : '#999',
              position: 'relative',
            }}>
              {active && (
                <div style={{
                  position: 'absolute', top: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32, height: 3,
                  borderRadius: '0 0 4px 4px',
                  background: '#2E7D32',
                }} />
              )}
              <div style={{ position: 'relative' }}>
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {isOrders && cartCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -6, right: -8,
                    background: '#E53935', color: 'white',
                    borderRadius: 99, minWidth: 16, height: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 800, padding: '0 3px',
                  }}>{cartCount}</span>
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
            </Link>
          )
        })}
      </nav>
      <div style={{ height: 64 }} />
    </>
  )
}