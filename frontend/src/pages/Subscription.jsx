import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { plans } from '../data/orders'
import styles from './Subscription.module.css'

export default function Subscription() {
  const [selected, setSelected] = useState('medium')
  const navigate = useNavigate()

  const selectedPlan = plans.find(p => p.id === selected)

  const handleSubscribe = (planId) => {
    navigate(`/harvest?plan=${planId}`)
  }

  return (
    <div className="page" style={{ paddingTop: 80 }}>
      {/* ── HEADER ── */}
      <div style={{ background: 'linear-gradient(135deg, var(--green) 0%, #1B5E20 100%)', padding: '48px 0 40px', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>WEEKLY PLANS</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 700, margin: '16px 0 8px' }}>Pick Your Fresh Box</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
            Curated weekly boxes. Seasonal vegetables. Free replacement if you're ever unhappy.
          </p>
        </div>
      </div>

      <div className="container section">
        {/* ── PLANS GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 40 }}>
          {plans.map(plan => (
            <div key={plan.id} onClick={() => setSelected(plan.id)}
              style={{
                background: plan.highlight ? 'var(--green)' : 'white',
                color: plan.highlight ? 'white' : 'var(--text)',
                border: selected === plan.id ? '3px solid #43A047' : `2px solid ${plan.highlight ? 'transparent' : 'var(--border)'}`,
                borderRadius: 20,
                padding: 28,
                cursor: 'pointer',
                position: 'relative',
                boxShadow: plan.highlight ? '0 8px 40px rgba(46,125,50,0.3)' : 'var(--shadow)',
                transition: 'all .2s',
                transform: plan.highlight ? 'scale(1.03)' : 'scale(1)',
              }}>
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: '#FF8F00', color: 'white', padding: '4px 16px',
                  borderRadius: 99, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap'
                }}>⭐ {plan.badge}</div>
              )}

              <div style={{ fontSize: 36, marginBottom: 12 }}>{plan.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.7, marginBottom: 4, textTransform: 'uppercase' }}>{plan.name}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, marginBottom: 4 }}>
                ₹{plan.price}<span style={{ fontSize: 14, fontWeight: 400, opacity: 0.8 }}>/week</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '16px 0' }}>
                <div style={{ background: plan.highlight ? 'rgba(255,255,255,0.15)' : 'var(--cream)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>{plan.vegetables}</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Vegetables</div>
                </div>
                <div style={{ background: plan.highlight ? 'rgba(255,255,255,0.15)' : 'var(--cream)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>{plan.weightKg}</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Total Weight</div>
                </div>
              </div>

              <ul style={{ listStyle: 'none', marginBottom: 24 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: 13, padding: '5px 0', display: 'flex', alignItems: 'center', gap: 8, opacity: 0.9 }}>
                    <span style={{ color: plan.highlight ? '#A5D6A7' : 'var(--green)', fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={(e) => { e.stopPropagation(); handleSubscribe(plan.id) }}
                style={{
                  width: '100%', padding: '14px', borderRadius: 99, border: 'none',
                  background: plan.highlight ? 'white' : 'var(--green)',
                  color: plan.highlight ? 'var(--green)' : 'white',
                  fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  transition: 'all .2s'
                }}>
                Subscribe Now →
              </button>
            </div>
          ))}
        </div>

        {/* ── GUARANTEE ── */}
        <div style={{ textAlign: 'center', background: 'var(--green-pale)', borderRadius: 16, padding: '24px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🛡️</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>100% Freshness Guarantee</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Free replacement for any unhappy order. No questions asked.</div>
        </div>
      </div>
    </div>
  )
}