import { useState } from 'react'
import { Check, Leaf } from 'lucide-react'
import { plans } from '../data/subscriptions'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Subscriptions() {
  const [period, setPeriod] = useState('week')
  const [selected, setSelected] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSelect = (planId) => {
    setSelected(planId)
    if (!user) { navigate('/login', { state: { from: '/subscribe' } }); return }
    navigate('/dashboard')
  }

  return (
    <div className="page-enter" style={{ paddingTop: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, #F1F8E9 0%, #E8F5E9 100%)', padding: '56px 0 48px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
            Subscribe & Save
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 480, margin: '0 auto 28px' }}>
            Get fresh vegetables delivered every week. No shopping, no hassle. Cancel anytime.
          </p>
        </div>
      </div>

      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'start' }} className="plans-grid">
          {plans.map(plan => (
            <div key={plan.id} style={{
              background: plan.popular ? plan.color : 'white',
              border: plan.popular ? 'none' : `1.5px solid var(--border)`,
              borderRadius: 20, padding: 32, position: 'relative',
              boxShadow: plan.popular ? '0 20px 60px rgba(46,125,50,.25)' : 'var(--shadow)',
              transform: plan.popular ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform .2s, box-shadow .2s'
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#F9A825', color: 'white', padding: '4px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  ⭐ Most Popular
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: plan.popular ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginBottom: 8 }}>
                  {plan.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700, color: plan.popular ? 'white' : 'var(--text)' }}>₹{plan.price}</span>
                  <span style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', fontSize: 14 }}>/week</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ background: plan.popular ? 'rgba(255,255,255,0.15)' : 'var(--cream)', borderRadius: 10, padding: '8px 14px', flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: plan.popular ? 'white' : 'var(--text)' }}>{plan.vegetables}</div>
                  <div style={{ fontSize: 11, color: plan.popular ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>Vegetables</div>
                </div>
                <div style={{ background: plan.popular ? 'rgba(255,255,255,0.15)' : 'var(--cream)', borderRadius: 10, padding: '8px 14px', flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: plan.popular ? 'white' : 'var(--text)' }}>{plan.weight}</div>
                  <div style={{ fontSize: 11, color: plan.popular ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>Total Weight</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Check size={14} color={plan.popular ? '#A5D6A7' : 'var(--green)'} style={{ marginTop: 3, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: plan.popular ? 'rgba(255,255,255,0.85)' : 'var(--text)', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => handleSelect(plan.id)} style={{
                width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                background: plan.popular ? 'white' : 'var(--green)',
                color: plan.popular ? 'var(--green)' : 'white',
                fontWeight: 700, fontSize: 15, cursor: 'pointer',
                transition: 'opacity .2s'
              }}>
                {user?.subscription?.plan?.toLowerCase().includes(plan.name.split(' ')[0].toLowerCase()) ? 'Current Plan' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div style={{ textAlign: 'center', marginTop: 48, padding: 28, background: 'white', borderRadius: 16, border: '1px solid var(--border)' }}>
          <Leaf size={24} color="var(--green)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
            All plans include batch transparency — you'll know exactly which farm your vegetables came from and when they were harvested. No surprise vegetables, free replacement within 24 hours if something's not fresh.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .plans-grid { grid-template-columns: 1fr !important; max-width: 400px; margin: 0 auto; }
          .plans-grid > div:nth-child(2) { transform: scale(1) !important; }
        }
        @media (max-width: 480px) {
          .plans-grid { max-width: 100%; }
        }
      `}</style>
    </div>
  )
}
