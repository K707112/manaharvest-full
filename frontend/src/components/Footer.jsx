import { Link } from 'react-router-dom'
import { Leaf, Phone, Mail, Instagram, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ background: '#1C2B1E', color: 'rgba(255,255,255,0.85)', padding: '56px 0 32px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}
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
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', maxWidth: 280, marginBottom: 20 }}>
              Fresh vegetables from village fields to your home in under 6 hours. Supporting 12+ farmers across india.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { icon: <MessageCircle size={16} />, label: 'WhatsApp' },
                { icon: <Instagram size={16} />, label: 'Instagram' },
                { icon: <Mail size={16} />, label: 'Email' },
              ].map(s => (
                <button key={s.label} title={s.label} style={{
                  width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.1)',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.7)', cursor: 'pointer'
                }}>{s.icon}</button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#A5D6A7', marginBottom: 16 }}>Quick Links</p>
            {[
              { to: '/harvest', l: "Today's Harvest" },
              { to: '/farmers', l: 'Meet Our Farmers' },
              { to: '/subscribe', l: 'Subscribe' },
              { to: '/track', l: 'Track Order' },
              { to: '/dashboard', l: 'My Dashboard' },
            ].map(i => (
              <Link key={i.to} to={i.to} style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 10, transition: 'color .2s' }}
                onMouseEnter={e => e.target.style.color='white'}
                onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.6)'}
              >{i.l}</Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#A5D6A7', marginBottom: 16 }}>Contact</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                <Phone size={14} /> +91 7075573757
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                <Mail size={14} /> koteswararao1872005@gmail.com
              </div>
              <div style={{ marginTop: 8, padding: 12, background: 'rgba(255,255,255,0.07)', borderRadius: 10, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                🕐 Harvest Window: 5:30 AM – 9:00 AM<br />
                🚚 Delivery: 9:30 AM – 1:00 PM daily
              </div>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', marginBottom: 24 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap', gap: 8 }}>
          <span>© 2026 ManaHarvest. All rights reserved.</span>
          <span>Made with ❤️ for village farmers of india</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
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
