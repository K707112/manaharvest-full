import { useState } from 'react';
import { subscriptionPlans } from '../data';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Plans() {
  const [selected, setSelected] = useState(null);
  const { user } = useApp();
  const navigate = useNavigate();

  const handleSelect = (plan) => {
    if (!user) { navigate('/login'); return; }
    setSelected(plan.id);
  };

  return (
    <div style={{ paddingTop: 'var(--nav-height)' }}>
      <div style={{ background: 'var(--cream)', padding: '48px 0 32px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 8 }}>Weekly Subscription Plans</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>Fresh vegetables every week, curated from seasonal harvests — pause or cancel anytime</p>
        </div>
      </div>

      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
          {subscriptionPlans.map(plan => (
            <div key={plan.id} style={{
              background: plan.popular ? 'var(--green)' : '#fff',
              borderRadius: 24, padding: '32px 28px',
              boxShadow: plan.popular ? '0 20px 60px rgba(46,125,50,0.3)' : '0 4px 20px rgba(0,0,0,0.07)',
              transform: plan.popular ? 'scale(1.03)' : 'scale(1)',
              border: selected === plan.id ? '3px solid #FFC107' : plan.popular ? 'none' : '2px solid var(--border)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              position: 'relative',
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: '#FFC107', color: '#1a1a1a', borderRadius: 50,
                  padding: '4px 16px', fontSize: '0.78rem', fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}>⭐ MOST POPULAR</div>
              )}

              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{plan.emoji}</div>
              <h3 style={{
                fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: 4,
                color: plan.popular ? '#fff' : 'var(--text)',
              }}>{plan.name}</h3>
              <div style={{ color: plan.popular ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20 }}>
                {plan.members}
              </div>

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: '2.8rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: plan.popular ? '#fff' : 'var(--green)' }}>₹{plan.price}</span>
                <span style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', fontSize: '0.9rem' }}>/week</span>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                {[`${plan.vegetables} Veggies`, `${plan.weight}`, 'Free Delivery'].map(t => (
                  <span key={t} style={{
                    borderRadius: 50, padding: '4px 12px', fontSize: '0.78rem', fontWeight: 600,
                    background: plan.popular ? 'rgba(255,255,255,0.15)' : 'var(--green-pale)',
                    color: plan.popular ? '#fff' : 'var(--green)',
                  }}>{t}</span>
                ))}
              </div>

              {/* Features */}
              <div style={{ marginBottom: 28 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ color: plan.popular ? '#A5D6A7' : 'var(--green)', fontSize: '0.9rem', flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: '0.88rem', color: plan.popular ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)' }}>{f}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => handleSelect(plan)} style={{
                width: '100%', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem',
                background: plan.popular ? '#fff' : 'var(--green)',
                color: plan.popular ? 'var(--green)' : '#fff',
                transition: 'opacity 0.2s',
              }}
                onMouseOver={e => e.target.style.opacity='0.9'}
                onMouseOut={e => e.target.style.opacity='1'}
              >
                {selected === plan.id ? '✓ Selected!' : `Start ${plan.name} Plan →`}
              </button>
            </div>
          ))}
        </div>

        {/* Guarantees */}
        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', textAlign: 'center', marginBottom: 32 }}>Our Guarantees</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {[
              { icon: '🔄', title: 'Free Replacement', desc: 'Not satisfied with quality? We replace it, no questions asked.' },
              { icon: '⏸️', title: 'Pause Anytime', desc: 'Going on vacation? Pause your subscription for up to 4 weeks.' },
              { icon: '❌', title: 'Cancel Anytime', desc: 'No lock-in periods. Cancel with one click from your dashboard.' },
              { icon: '🌿', title: 'Always Fresh', desc: 'All vegetables harvested the same morning they reach you.' },
            ].map(g => (
              <div key={g.title} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>{g.icon}</div>
                <h4 style={{ fontFamily: 'var(--font-serif)', marginBottom: 6 }}>{g.title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
