// src/pages/Subscriptions.jsx
import { useNavigate } from 'react-router-dom'

const PLANS = [
  {
    id: 'small', price: 399, name: 'Small Family', icon: '🥬',
    vegetables: 7, maxKg: 5, color: '#1565C0', bg: '#E3F2FD',
    features: ['7 seasonal vegetables', '4–5 kg total weight', 'Weekly Monday delivery', 'Free replacement guarantee', 'Batch transparency'],
  },
  {
    id: 'medium', price: 699, name: 'Medium Family', icon: '🧺', badge: 'Most Popular',
    vegetables: 9, maxKg: 9, color: '#2E7D32', bg: '#E8F5E9',
    features: ['9 seasonal vegetables', '8–9 kg total weight', 'Weekly Monday delivery', 'Free replacement guarantee', 'WhatsApp order updates', 'Bonus herb bunch every week'],
  },
  {
    id: 'large', price: 999, name: 'Large Family', icon: '🏡',
    vegetables: 10, maxKg: 15, color: '#6A1B9A', bg: '#F3E5F5',
    features: ['10+ seasonal vegetables', '14–15 kg total weight', 'Weekly Monday delivery', 'Priority customer support', 'Farmer meet-and-greet invite', 'Early access to new produce'],
  },
]

export default function Subscriptions() {
  const navigate = useNavigate()

  return (
    <div className="page-enter" style={{ paddingTop: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', padding: '52px 0 44px', textAlign: 'center', color: 'white' }}>
        <div className="container">
          <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>WEEKLY PLANS</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, margin: '16px 0 10px' }}>Pick Your Fresh Box</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
            Farm-fresh vegetables every week. Select a plan and choose what you want from today's harvest.
          </p>
        </div>
      </div>

      <div className="container section">
        {/* Plans Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 48 }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: 'white', borderRadius: 24, overflow: 'hidden',
              boxShadow: plan.badge ? '0 8px 40px rgba(46,125,50,0.2)' : '0 2px 16px rgba(0,0,0,0.08)',
              border: plan.badge ? `2px solid ${plan.color}` : '1px solid #eee',
              transform: plan.badge ? 'scale(1.03)' : 'scale(1)',
              position: 'relative', transition: 'all .2s',
            }}>
              {plan.badge && (
                <div style={{ background: '#FF8F00', color: 'white', textAlign: 'center', padding: '8px', fontSize: 12, fontWeight: 700 }}>
                  ⭐ {plan.badge}
                </div>
              )}
              <div style={{ background: plan.bg, padding: '28px 28px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>{plan.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: plan.color, textTransform: 'uppercase', marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 800, color: plan.color, lineHeight: 1 }}>
                  ₹{plan.price}<span style={{ fontSize: 14, fontWeight: 400, color: '#888' }}>/week</span>
                </div>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 22, color: plan.color }}>{plan.vegetables}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>Vegetables</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 22, color: plan.color }}>{plan.maxKg}kg</div>
                    <div style={{ fontSize: 11, color: '#888' }}>Max Weight</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '20px 28px 28px' }}>
                <ul style={{ listStyle: 'none', marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ fontSize: 13, padding: '5px 0', display: 'flex', alignItems: 'center', gap: 8, color: '#444' }}>
                      <span style={{ color: plan.color, fontWeight: 700, fontSize: 15 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(`/plan-harvest?plan=${plan.id}`)}
                  style={{
                    width: '100%', padding: '15px', borderRadius: 99, border: 'none',
                    background: plan.color, color: 'white',
                    fontWeight: 700, fontSize: 15, cursor: 'pointer',
                    boxShadow: `0 4px 16px ${plan.color}44`,
                    transition: 'all .2s',
                  }}>
                  Choose ₹{plan.price} Plan →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div style={{ textAlign: 'center', background: '#F1F8E9', borderRadius: 16, padding: 28, border: '1px solid #C8E6C9' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🛡️</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>100% Freshness Guarantee</div>
          <div style={{ color: '#666', fontSize: 14 }}>Free replacement for any unhappy order. No questions asked.</div>
        </div>
      </div>
    </div>
  )
}