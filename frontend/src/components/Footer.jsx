import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Phone, Mail, Instagram, MessageCircle, MapPin } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://gydtxzxjmejsdoculytc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5ZHR4enhqbWVqc2RvY3VseXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MjIxODAsImV4cCI6MjA4ODA5ODE4MH0.WtobeYIslYzJRJ-mN_y_jE9JJhG2mc-xpwrFxeHdE24'
)

export default function Footer() {
  const [visitors, setVisitors] = useState(null)

  useEffect(() => {
    const track = async () => {
      try {
        await supabase.rpc('increment_visitors')
        const { data } = await supabase.from('site_stats').select('visitors').eq('id', 'main').single()
        if (data) setVisitors(data.visitors)
      } catch (e) {}
    }
    track()
  }, [])

  return (
    <footer style={{ background: '#1C2B1E', color: 'rgba(255,255,255,0.85)', padding: '56px 0 32px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}
             className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, background: 'var(--green)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={18} color="white" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'white' }}>
                Mana<span style={{ color: '#A5D6A7' }}>Harvest</span>
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', maxWidth: 280, marginBottom: 16 }}>
              Fresh vegetables from Vizag village farms to your home. Harvested today, delivered tomorrow by 10 AM. Zero chemicals, zero middlemen.
            </p>

            {/* Social links */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <a href="https://wa.me/917075573757" target="_blank" rel="noreferrer"
                style={{ width: 38, height: 38, borderRadius: 10, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none' }}>
                <MessageCircle size={16} />
              </a>
              <a href="https://instagram.com/manaharvest" target="_blank" rel="noreferrer"
                style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none' }}>
                <Instagram size={16} />
              </a>
              <a href="mailto:koteswararao1872005@gmail.com"
                style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                <Mail size={16} />
              </a>
            </div>

            {/* FSSAI badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: 8 }}>
              <span style={{ fontSize: 14 }}>🛡️</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>FSSAI Licensed · MSME Registered</span>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#A5D6A7', marginBottom: 16 }}>Shop</p>
            {[
              { to: '/harvest',   l: "Today's Harvest"  },
              { to: '/subscribe', l: 'Weekly Plans'      },
              { to: '/smart-box', l: '🤖 AI Box Builder' },
              { to: '/farmers',   l: 'Our Farmers'       },
              { to: '/track',     l: 'Track Order'       },
            ].map(i => (
              <Link key={i.to} to={i.to} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 10, textDecoration: 'none', transition: 'color .2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                {i.l}
              </Link>
            ))}
          </div>

          {/* Account links */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#A5D6A7', marginBottom: 16 }}>Account</p>
            {[
              { to: '/dashboard', l: 'My Dashboard'     },
              { to: '/dashboard', l: '💰 Loyalty Wallet' },
              { to: '/cart',      l: 'My Cart'           },
              { to: '/contact',   l: 'Contact Us'        },
              { to: '/login',     l: 'Login / Signup'    },
            ].map((i, idx) => (
              <Link key={idx} to={i.to} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 10, textDecoration: 'none', transition: 'color .2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                {i.l}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#A5D6A7', marginBottom: 16 }}>Contact</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="tel:+917075573757" style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                <Phone size={13} /> +91 70755 73757
              </a>
              <a href="mailto:koteswararao1872005@gmail.com" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                <Mail size={13} style={{ marginTop: 2, flexShrink: 0 }} /> koteswararao1872005@gmail.com
              </a>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                <MapPin size={13} style={{ marginTop: 2, flexShrink: 0 }} /> Visakhapatnam, Andhra Pradesh
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.07)', borderRadius: 10, fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8 }}>
                🌾 Order by: 8 PM daily<br />
                🛵 Delivery: Next day by 10 AM<br />
                📞 Support: 6 AM – 8 PM
              </div>
            </div>
          </div>
        </div>

        {/* Plans bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { label: '₹399 Small Box',  color: '#1565C0', to: '/plan-harvest?plan=small'  },
            { label: '₹699 Family Box', color: '#2E7D32', to: '/plan-harvest?plan=medium' },
            { label: '₹999 Large Box',  color: '#795548', to: '/plan-harvest?plan=large'  },
          ].map(p => (
            <Link key={p.label} to={p.to}
              style={{ background: p.color + '22', border: `1px solid ${p.color}44`, color: 'rgba(255,255,255,0.7)', padding: '6px 16px', borderRadius: 99, fontSize: 12, fontWeight: 600, textDecoration: 'none', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = p.color; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = p.color + '22'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}>
              {p.label}
            </Link>
          ))}
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', marginBottom: 20 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.35)', flexWrap: 'wrap', gap: 10 }}>
          <span>© 2026 ManaHarvest. All rights reserved.</span>

          {/* Visitor counter */}
          {visitors && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '5px 14px', borderRadius: 99, color: 'white', fontSize: 12, fontWeight: 600 }}>
              👥 {visitors.toLocaleString('en-IN')} visitors
            </span>
          )}

          <span>Made with ❤️ for Vizag farmers</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-grid > div:first-child { grid-column: 1 / -1; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  )
}