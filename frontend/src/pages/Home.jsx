// src/pages/Home.jsx — Premium ManaHarvest Redesign
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Star, Clock, Truck, Leaf, Users, Award } from 'lucide-react'
import { cropsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  { emoji: '🍅', label: 'Tomatoes',  q: 'tomato' },
  { emoji: '🥬', label: 'Leafy',     q: 'spinach' },
  { emoji: '🥕', label: 'Roots',     q: 'carrot' },
  { emoji: '🧅', label: 'Onions',    q: 'onion' },
  { emoji: '🌶️', label: 'Chillies', q: 'chilli' },
  { emoji: '🍆', label: 'Brinjal',   q: 'brinjal' },
  { emoji: '🫛', label: 'Beans',     q: 'beans' },
  { emoji: '🥒', label: 'Gourds',    q: 'gourd' },
]

const PLANS = [
  { id: 'small',  price: 399, label: 'Small Box',  kg: '12kg', color: '#1565C0', bg: '#E3F2FD', icon: '🥬', tag: 'Starter',    items: '12 vegetables' },
  { id: 'medium', price: 699, label: 'Family Box', kg: '9kg',  color: '#2E7D32', bg: '#E8F5E9', icon: '🧺', tag: '⭐ Popular', items: '12 vegetables' },
  { id: 'large',  price: 999, label: 'Big Box',    kg: '15kg', color: '#795548', bg: '#EFEBE9', icon: '🏡', tag: 'Best Value', items: '12 vegetables' },
]

const STEPS = [
  { icon: '📱', step: '01', title: 'Choose Your Plan',       desc: 'Pick ₹399, ₹699 or ₹999 box based on your family size' },
  { icon: '🥬', step: '02', title: 'Select Vegetables',      desc: 'Choose from today\'s fresh harvest — you pick what goes in your box' },
  { icon: '🌾', step: '03', title: 'We Harvest at Dawn',     desc: 'Our farmers harvest your vegetables fresh next morning at 5 AM' },
  { icon: '🛵', step: '04', title: 'Delivered by 10 AM',     desc: 'Fresh from the farm to your doorstep — next morning delivery' },
]

const TESTIMONIALS = [
  { name: 'Padma Lakshmi', area: 'MVP Colony',     text: 'I can taste the difference! These vegetables are so fresh compared to what I used to buy from the market.', rating: 5 },
  { name: 'Ravi Kumar',    area: 'Rushikonda',      text: 'The batch QR code is amazing — I scanned it and saw exactly which farm my tomatoes came from!',             rating: 5 },
  { name: 'Sunita Reddy',  area: 'Seethammadhara', text: 'Best decision for my family. Fresh, healthy and delivered right to my door next morning!',                   rating: 5 },
]

const FARMERS = [
  { name: 'Ramu Yadav',      village: 'Chevella',        crops: 'Tomatoes, Beans',  emoji: '👨‍🌾', years: '15 years farming' },
  { name: 'Chukka Satyarao', village: 'Chinanandipalli', crops: 'Spinach, Methi',   emoji: '🧑‍🌾', years: '20 years farming' },
  { name: 'Lakshmi Devi',    village: 'Pendurthi',       crops: 'Carrots, Onions',  emoji: '👩‍🌾', years: '12 years farming' },
]

// ── Daily countdown to 8 PM cutoff ──
function Countdown() {
  const now  = new Date()
  const next = new Date()
  next.setHours(20, 0, 0, 0) // 8 PM today
  if (now >= next) next.setDate(next.getDate() + 1) // if past 8 PM → count to tomorrow 8 PM
  const diff = Math.max(0, next - now)
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  }
}

// ── Get tomorrow's date string ──
function getTomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function Home() {
  const [crops, setCrops]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [countdown, setCountdown] = useState(Countdown())
  const navigate                  = useNavigate()
  const { user }                  = useAuth()

  useEffect(() => {
    cropsAPI.getAll({ limit: 8 }).then(r => setCrops(r.data || [])).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const t = setInterval(() => setCountdown(Countdown()), 1000)
    return () => clearInterval(t)
  }, [])

  const pad = n => String(n).padStart(2, '0')
  const isPastCutoff = new Date().getHours() >= 20

  return (
    <div style={{ background: '#FFFBF5', paddingTop: 60 }}>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(150deg,#1B5E20 0%,#2E7D32 50%,#33691E 100%)', padding: '48px 16px 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 120, opacity: 0.07 }}>🌾</div>

        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          {/* Live badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '6px 16px', borderRadius: 99, marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, background: '#69F0AE', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>FRESH VEGETABLES · ORDER TODAY · DELIVERED TOMORROW</span>
          </div>

          {/* Headline */}
          <h1 style={{ color: 'white', fontSize: 'clamp(2rem,6vw,3.6rem)', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.1, letterSpacing: -1 }}>
            Farm Fresh Vegetables<br />
            <span style={{ color: '#A5D6A7' }}>From Our Village Farms</span><br />
            To Your Home 🌾
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, margin: '0 0 32px', maxWidth: 500, lineHeight: 1.6 }}>
            Order Today by 8 PM · Harvested Tomorrow 5 AM · Delivered by 10 AM · Direct from Vizag farmers · Zero chemicals · Zero middlemen
          </p>

          {/* Delivery badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F9A825', padding: '8px 18px', borderRadius: 99, marginBottom: 24 }}>
            <span style={{ fontSize: 16 }}>🛵</span>
            <span style={{ color: '#1B5E20', fontWeight: 900, fontSize: 13 }}>
              Order now → Delivered {getTomorrow()} by 10 AM
            </span>
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
            <button onClick={() => navigate('/subscribe')}
              style={{ padding: '16px 32px', borderRadius: 12, border: 'none', background: '#F9A825', color: '#1B5E20', fontWeight: 900, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 20px rgba(249,168,37,0.4)' }}>
              📦 Get Weekly Box
            </button>
            <button onClick={() => navigate('/harvest')}
              style={{ padding: '16px 32px', borderRadius: 12, border: '2px solid rgba(255,255,255,0.4)', background: 'transparent', color: 'white', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
              🌿 Today's Harvest →
            </button>
          </div>

          {/* Countdown */}
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: '16px 20px', display: 'inline-block' }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
              {isPastCutoff ? '⚠️ ORDER CLOSES TOMORROW 8 PM' : '⏰ ORDER CLOSES TODAY AT 8 PM'}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {[
                { v: pad(countdown.h), l: 'HRS'  },
                { v: pad(countdown.m), l: 'MIN'  },
                { v: pad(countdown.s), l: 'SEC'  },
              ].map((t, i) => (
                <div key={t.l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {i > 0 && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 22, fontWeight: 900 }}>:</span>}
                  <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 12px', minWidth: 50, textAlign: 'center' }}>
                    <div style={{ color: 'white', fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{t.v}</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, letterSpacing: 1 }}>{t.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ background: '#5D4037', padding: '14px 16px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 10 }}>
          {[
            { icon: <Users size={16}/>,  value: '500+',  label: 'Happy Families' },
            { icon: <Leaf size={16}/>,   value: '12+',   label: 'Village Farmers' },
            { icon: <Clock size={16}/>,  value: '<6h',   label: 'Farm to Door' },
            { icon: <Award size={16}/>,  value: '100%',  label: 'Fresh Guarantee' },
            { icon: <Truck size={16}/>,  value: 'Free',  label: 'Delivery' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'white' }}>
              <span style={{ color: '#F9A825' }}>{s.icon}</span>
              <span style={{ fontWeight: 900, fontSize: 15 }}>{s.value}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div style={{ background: 'white', padding: '28px 16px', borderBottom: '2px solid #EFEBE9' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 900, fontSize: 20, margin: 0, color: '#3E2723' }}>Shop By Category</h2>
            <button onClick={() => navigate('/harvest')} style={{ background: 'none', border: 'none', color: '#2E7D32', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ChevronRight size={14}/>
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 10 }} className="cat-grid">
            {CATEGORIES.map(c => (
              <button key={c.label} onClick={() => navigate(`/harvest?q=${c.q}`)}
                style={{ background: '#FFFBF5', border: '2px solid #EFEBE9', borderRadius: 14, padding: '14px 4px', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2E7D32'; e.currentTarget.style.background = '#F1F8E9'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#EFEBE9'; e.currentTarget.style.background = '#FFFBF5'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ fontSize: 28, marginBottom: 5 }}>{c.emoji}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#5D4037' }}>{c.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── WEEKLY PLANS ── */}
      <div style={{ padding: '36px 16px', background: '#FFFBF5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '4px 16px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>WEEKLY SUBSCRIPTION</span>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.6rem,4vw,2.4rem)', margin: '12px 0 8px', color: '#3E2723' }}>Choose Your Weekly Box</h2>
            <p style={{ color: '#795548', fontSize: 14 }}>Order any day · Get it next morning by 10 AM · Cancel anytime</p>
            {/* AI Box Builder button */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <button onClick={() => navigate('/smart-box')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 28px', borderRadius: 99, border: '2px solid #2E7D32',
                  background: 'white', color: '#2E7D32', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', boxShadow: '0 2px 12px rgba(46,125,50,0.15)'
                }}>
                🤖 Not sure? Let AI build your perfect box!
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="plans-grid">
            {PLANS.map(p => (
              <div key={p.id}
                style={{ background: 'white', borderRadius: 20, overflow: 'hidden', border: `2px solid ${p.id === 'medium' ? p.color : '#EFEBE9'}`, boxShadow: p.id === 'medium' ? `0 8px 32px ${p.color}33` : '0 2px 12px rgba(0,0,0,0.06)', transform: p.id === 'medium' ? 'scale(1.04)' : 'scale(1)', cursor: 'pointer', transition: 'all .2s' }}
                onMouseEnter={e => { if (p.id !== 'medium') e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { if (p.id !== 'medium') e.currentTarget.style.transform = 'scale(1)' }}>
                <div style={{ background: p.bg, padding: '24px 20px 16px', textAlign: 'center' }}>
                  <span style={{ background: p.color, color: 'white', fontSize: 10, fontWeight: 900, padding: '3px 12px', borderRadius: 99 }}>{p.tag}</span>
                  <div style={{ fontSize: 48, margin: '12px 0 6px' }}>{p.icon}</div>
                  <div style={{ fontWeight: 900, fontSize: 15, color: p.color }}>{p.label}</div>
                </div>
                <div style={{ padding: '18px 20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                    <span style={{ fontWeight: 900, fontSize: 36, color: '#3E2723' }}>₹{p.price}</span>
                    <span style={{ fontSize: 13, color: '#aaa' }}>/week</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>{p.items} · Up to {p.kg}</div>
                  {[`${p.kg} fresh vegetables`, 'Next day delivery by 10 AM', 'Batch QR tracking', 'Free replacement'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 12, color: '#555' }}>
                      <span style={{ color: p.color, fontWeight: 900 }}>✓</span> {f}
                    </div>
                  ))}
                  <button onClick={() => navigate(`/plan-harvest?plan=${p.id}`)}
                    style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: p.color, color: 'white', fontWeight: 900, fontSize: 14, cursor: 'pointer', marginTop: 16 }}>
                    Choose {p.label} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ background: '#3E2723', padding: '48px 16px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ background: 'rgba(249,168,37,0.2)', color: '#F9A825', padding: '4px 16px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>HOW IT WORKS</span>
            <h2 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(1.6rem,4vw,2.4rem)', margin: '12px 0 0' }}>Order Today · Fresh at Door Tomorrow</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }} className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={s.step} style={{ textAlign: 'center', position: 'relative' }}>
                {i < STEPS.length - 1 && <div style={{ position: 'absolute', top: 28, left: '60%', right: '-40%', height: 2, background: 'rgba(249,168,37,0.3)' }} className="step-line" />}
                <div style={{ width: 56, height: 56, background: '#F9A825', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 26, position: 'relative', zIndex: 1 }}>{s.icon}</div>
                <div style={{ color: '#F9A825', fontSize: 10, fontWeight: 900, letterSpacing: 1, marginBottom: 4 }}>STEP {s.step}</div>
                <div style={{ color: 'white', fontWeight: 900, fontSize: 14, marginBottom: 6 }}>{s.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TODAY'S HARVEST ── */}
      <div style={{ padding: '36px 16px', background: '#FFFBF5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
            <div>
              <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>ORDER NOW</span>
              <h2 style={{ fontWeight: 900, fontSize: 22, margin: '8px 0 4px', color: '#3E2723' }}>Available Vegetables 🌾</h2>
              <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Order today · Delivered tomorrow by 10 AM</p>
            </div>
            <button onClick={() => navigate('/harvest')} style={{ background: '#2E7D32', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Order Now →
            </button>
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: 40, fontSize: 40 }}>🌿</div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14 }}>
              {crops.map(crop => (
                <div key={crop.id} onClick={() => navigate('/harvest')}
                  style={{ background: 'white', borderRadius: 14, overflow: 'hidden', border: '1.5px solid #EFEBE9', cursor: 'pointer', transition: 'all .2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  {crop.image_url
                    ? <img src={crop.image_url} alt={crop.name} style={{ width: '100%', height: 110, objectFit: 'cover' }} />
                    : <div style={{ height: 90, background: '#F1F8E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>{crop.emoji || '🌿'}</div>
                  }
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 900, fontSize: 13, color: '#3E2723', marginBottom: 2 }}>{crop.name}</div>
                    <div style={{ fontSize: 10, color: '#aaa', marginBottom: 6 }}>{crop.farmers?.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 900, fontSize: 15, color: '#2E7D32' }}>₹{crop.dynamic_price || crop.price_per_kg}<span style={{ fontSize: 9, color: '#aaa', fontWeight: 400 }}>/kg</span></span>
                      {crop.is_organic && <span style={{ background: '#E8F5E9', color: '#2E7D32', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99 }}>Organic</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── FARMERS ── */}
      <div style={{ background: '#EFEBE9', padding: '36px 16px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{ background: '#D7CCC8', color: '#5D4037', padding: '4px 16px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>OUR FARMERS</span>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.4rem,4vw,2rem)', margin: '12px 0 6px', color: '#3E2723' }}>Meet the Hands Behind Your Food 👨‍🌾</h2>
            <p style={{ color: '#795548', fontSize: 13 }}>Real farmers, real fields, real food</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="farmers-grid">
            {FARMERS.map(f => (
              <div key={f.name} style={{ background: 'white', borderRadius: 16, padding: '24px 20px', textAlign: 'center', border: '1.5px solid #D7CCC8' }}>
                <div style={{ width: 72, height: 72, background: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 36, border: '3px solid #C8E6C9' }}>{f.emoji}</div>
                <div style={{ fontWeight: 900, fontSize: 16, color: '#3E2723', marginBottom: 2 }}>{f.name}</div>
                <div style={{ fontSize: 12, color: '#795548', marginBottom: 4 }}>📍 {f.village}</div>
                <div style={{ fontSize: 11, color: '#aaa', marginBottom: 10 }}>{f.years}</div>
                <div style={{ background: '#F1F8E9', borderRadius: 8, padding: '6px 12px', fontSize: 11, color: '#2E7D32', fontWeight: 700 }}>🌱 {f.crops}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={() => navigate('/farmers')} style={{ background: '#5D4037', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Meet All Farmers →
            </button>
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div style={{ background: '#1B5E20', padding: '36px 16px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '4px 16px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>CUSTOMER LOVE</span>
            <h2 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(1.4rem,4vw,2rem)', margin: '12px 0 0' }}>What Our Customers Say ❤️</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="reviews-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '24px 20px', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} fill="#F9A825" color="#F9A825" />)}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: '#F9A825', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: '#1B5E20' }}>{t.name[0]}</div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>📍 {t.area}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div style={{ background: '#F9A825', padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧺</div>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.4rem,4vw,2.2rem)', color: '#1B5E20', margin: '0 0 10px' }}>
            Order Today · Get Fresh Vegetables Tomorrow!
          </h2>
          <p style={{ color: '#2E7D32', fontSize: 14, marginBottom: 8 }}>
            Join 500+ Vizag families — order by 8 PM, delivered by 10 AM next morning!
          </p>
          <p style={{ color: '#1B5E20', fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
            🛵 Next delivery: {getTomorrow()} by 10 AM
          </p>
          <button onClick={() => navigate('/subscribe')}
            style={{ padding: '16px 40px', borderRadius: 12, border: 'none', background: '#1B5E20', color: 'white', fontWeight: 900, fontSize: 16, cursor: 'pointer' }}>
            Subscribe Now — Starting ₹399/week →
          </button>
        </div>
      </div>

      {/* ── WHATSAPP FLOATING ── */}
      <a href="https://wa.me/917075573757" target="_blank" rel="noreferrer"
        style={{ position: 'fixed', bottom: 80, right: 16, zIndex: 500, width: 56, height: 56, background: '#25D366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,211,102,0.4)', textDecoration: 'none', fontSize: 28 }}>
        💬
      </a>
       {/* ── AI BOX FLOATING ── */}
      <button onClick={() => navigate('/smart-box')}
        style={{ position: 'fixed', bottom: 148, right: 16, zIndex: 500, width: 56, height: 56, background: '#2E7D32', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(46,125,50,0.4)', border: 'none', cursor: 'pointer', fontSize: 26 }}>
        🤖
      </button>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @media (max-width:600px) {
          .cat-grid { grid-template-columns: repeat(4,1fr) !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .plans-grid > div { transform: scale(1) !important; }
          .steps-grid { grid-template-columns: repeat(2,1fr) !important; }
          .step-line { display: none !important; }
          .farmers-grid { grid-template-columns: 1fr !important; }
          .reviews-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width:601px) and (max-width:900px) {
          .plans-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: repeat(2,1fr) !important; }
          .farmers-grid { grid-template-columns: repeat(2,1fr) !important; }
          .reviews-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}