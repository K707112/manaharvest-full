// src/pages/SmartBox.jsx — AI Smart Box Builder powered by Claude
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ChevronRight, RefreshCw, ShoppingCart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FAMILY_SIZES = [
  { id: '1-2',  label: '1–2 People',  icon: '👤',  plan: 'small'  },
  { id: '3-4',  label: '3–4 People',  icon: '👨‍👩‍👧',  plan: 'medium' },
  { id: '5+',   label: '5+ People',   icon: '👨‍👩‍👧‍👦', plan: 'large'  },
]

const HEALTH_GOALS = [
  { id: 'weight_loss',    label: 'Weight Loss',     icon: '⚖️'  },
  { id: 'diabetes',       label: 'Diabetes Control', icon: '🩺'  },
  { id: 'immunity',       label: 'Boost Immunity',   icon: '💪'  },
  { id: 'kids_nutrition', label: 'Kids Nutrition',   icon: '👶'  },
  { id: 'heart_health',   label: 'Heart Health',     icon: '❤️'  },
  { id: 'general',        label: 'General Health',   icon: '🌿'  },
]

const CUISINE_PREFS = [
  { id: 'andhra',  label: 'Andhra Style',  icon: '🌶️' },
  { id: 'telangana', label: 'Telangana',   icon: '🍛' },
  { id: 'north',   label: 'North Indian',  icon: '🫓'  },
  { id: 'mixed',   label: 'Mixed',         icon: '🥘'  },
]

const BUDGET_PLANS = [
  { id: 'small',  label: '₹399/week', kg: '12kg', color: '#1565C0' },
  { id: 'medium', label: '₹699/week', kg: '9kg',  color: '#2E7D32' },
  { id: 'large',  label: '₹999/week', kg: '15kg', color: '#795548' },
]

export default function SmartBox() {
  const navigate               = useNavigate()
  const { addToCart }          = useAuth()
  const [step, setStep]        = useState(1)
  const [familySize, setFamilySize]   = useState('')
  const [healthGoal, setHealthGoal]   = useState('')
  const [cuisine, setCuisine]         = useState('')
  const [budget, setBudget]           = useState('medium')
  const [allergies, setAllergies]     = useState('')
  const [loading, setLoading]         = useState(false)
  const [result, setResult]           = useState(null)
  const [error, setError]             = useState('')

  const buildBox = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    const prompt = `You are ManaHarvest's AI vegetable box builder. Based on customer preferences, suggest the perfect weekly vegetable box.

Customer Details:
- Family size: ${familySize}
- Health goal: ${healthGoal}
- Cuisine preference: ${cuisine}
- Budget plan: ${budget} (${BUDGET_PLANS.find(b => b.id === budget)?.label}, ${BUDGET_PLANS.find(b => b.id === budget)?.kg})
- Allergies/dislikes: ${allergies || 'None'}

Available vegetables from Vizag farms: Tomato, Onion, Green Chilli, Spinach (Palak), Beans, Carrot, Ridge Gourd (Beerakaya), Coriander, Garlic, Drumstick (Munagakaya), Methi (Fenugreek), Brinjal (Vankaya), Bitter Gourd (Kakarakaya), Snake Gourd (Potlakaya), Cluster Beans (Goru Chikkudu), Taro Root (Chamadumpa), Cabbage, Cauliflower, Beetroot, Cucumber, Capsicum.

Respond ONLY with a valid JSON object (no markdown, no backticks) in this exact format:
{
  "box_name": "Creative name for this box",
  "tagline": "One line description",
  "vegetables": [
    {"name": "Vegetable name", "qty_kg": 1, "reason": "Why this is perfect for them", "emoji": "🥬", "health_tip": "Specific health benefit"}
  ],
  "total_kg": 12,
  "weekly_meals": ["Meal idea 1", "Meal idea 2", "Meal idea 3"],
  "health_insight": "2-3 sentences about health benefits of this specific combination",
  "tip": "One practical cooking tip for this week's box"
}`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages:   [{ role: 'user', content: prompt }],
        }),
      })

      const data = await response.json()
      const text = data.content?.[0]?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setResult(parsed)
      setStep(4)
    } catch (e) {
      setError('AI is busy right now. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  const addAllToCart = () => {
    result?.vegetables?.forEach(v => {
      addToCart({
        id:    v.name.toLowerCase().replace(/\s/g, '-'),
        name:  v.name,
        emoji: v.emoji || '🌿',
        price: 30,
        qty:   v.qty_kg,
        unit:  'kg',
      })
    })
    navigate('/cart')
  }

  const PLAN = BUDGET_PLANS.find(b => b.id === budget)

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', background: '#FFFBF5' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)', padding: '36px 16px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', padding: '6px 18px', borderRadius: 99, marginBottom: 14 }}>
            <Sparkles size={14} color="#F9A825" />
            <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>POWERED BY CLAUDE AI</span>
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 700, color: 'white', margin: '0 0 10px' }}>
            AI Smart Box Builder 🤖
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
            Tell us about your family and health goals — Claude AI will build your perfect weekly vegetable box!
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {step < 4 && (
        <div style={{ background: 'white', padding: '16px', borderBottom: '1px solid #EFEBE9' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              {['Family', 'Health', 'Cuisine', 'Budget'].map((s, i) => (
                <div key={s} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: step > i + 1 ? '#2E7D32' : step === i + 1 ? '#2E7D32' : '#EFEBE9', color: step >= i + 1 ? 'white' : '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: 12, fontWeight: 700 }}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <div style={{ fontSize: 10, color: step === i + 1 ? '#2E7D32' : '#aaa', fontWeight: step === i + 1 ? 700 : 400 }}>{s}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 4, background: '#EFEBE9', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#2E7D32', borderRadius: 99, width: `${((step - 1) / 3) * 100}%`, transition: 'width .3s' }} />
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '32px 16px' }}>

        {/* STEP 1: Family Size */}
        {step === 1 && (
          <div>
            <h2 style={{ fontWeight: 900, fontSize: 20, color: '#3E2723', marginBottom: 6 }}>How many people in your family?</h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>We'll pick the right quantities for everyone</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {FAMILY_SIZES.map(f => (
                <button key={f.id} onClick={() => setFamilySize(f.id)}
                  style={{ padding: '18px 20px', borderRadius: 14, border: familySize === f.id ? '2px solid #2E7D32' : '1.5px solid #EFEBE9', background: familySize === f.id ? '#E8F5E9' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all .15s' }}>
                  <span style={{ fontSize: 32 }}>{f.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: familySize === f.id ? '#2E7D32' : '#3E2723' }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>Recommended: {BUDGET_PLANS.find(b => b.id === f.plan)?.label} plan</div>
                  </div>
                  {familySize === f.id && <span style={{ marginLeft: 'auto', color: '#2E7D32', fontWeight: 700 }}>✓</span>}
                </button>
              ))}
            </div>
            <button onClick={() => { if (!familySize) { alert('Please select family size'); return } setStep(2) }}
              disabled={!familySize}
              style={{ width: '100%', padding: '15px', borderRadius: 12, border: 'none', background: familySize ? '#2E7D32' : '#ddd', color: 'white', fontWeight: 700, fontSize: 15, cursor: familySize ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: Health Goal */}
        {step === 2 && (
          <div>
            <h2 style={{ fontWeight: 900, fontSize: 20, color: '#3E2723', marginBottom: 6 }}>What's your health goal?</h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>AI will pick vegetables best suited for your goal</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {HEALTH_GOALS.map(h => (
                <button key={h.id} onClick={() => setHealthGoal(h.id)}
                  style={{ padding: '16px', borderRadius: 14, border: healthGoal === h.id ? '2px solid #2E7D32' : '1.5px solid #EFEBE9', background: healthGoal === h.id ? '#E8F5E9' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{h.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: healthGoal === h.id ? '#2E7D32' : '#3E2723' }}>{h.label}</div>
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>ANY ALLERGIES OR VEGETABLES YOU DISLIKE? (Optional)</label>
              <input value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="e.g. bitter gourd, raw onion..."
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #EFEBE9', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#2E7D32'}
                onBlur={e => e.target.style.borderColor = '#EFEBE9'}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #EFEBE9', background: 'white', color: '#555', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>← Back</button>
              <button onClick={() => { if (!healthGoal) { alert('Please select a health goal'); return } setStep(3) }}
                disabled={!healthGoal}
                style={{ flex: 2, padding: '14px', borderRadius: 12, border: 'none', background: healthGoal ? '#2E7D32' : '#ddd', color: 'white', fontWeight: 700, fontSize: 15, cursor: healthGoal ? 'pointer' : 'not-allowed' }}>
                Next <ChevronRight size={18} style={{ display: 'inline', verticalAlign: 'middle' }} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Cuisine + Budget */}
        {step === 3 && (
          <div>
            <h2 style={{ fontWeight: 900, fontSize: 20, color: '#3E2723', marginBottom: 6 }}>Cuisine & Budget</h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>Almost done! Choose your cooking style and plan</p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 10 }}>COOKING STYLE</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {CUISINE_PREFS.map(c => (
                  <button key={c.id} onClick={() => setCuisine(c.id)}
                    style={{ padding: '14px', borderRadius: 12, border: cuisine === c.id ? '2px solid #2E7D32' : '1.5px solid #EFEBE9', background: cuisine === c.id ? '#E8F5E9' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s' }}>
                    <span style={{ fontSize: 22 }}>{c.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: cuisine === c.id ? '#2E7D32' : '#3E2723' }}>{c.label}</span>
                    {cuisine === c.id && <span style={{ marginLeft: 'auto', color: '#2E7D32' }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 10 }}>WEEKLY BUDGET</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {BUDGET_PLANS.map(b => (
                  <button key={b.id} onClick={() => setBudget(b.id)}
                    style={{ padding: '14px 18px', borderRadius: 12, border: budget === b.id ? `2px solid ${b.color}` : '1.5px solid #EFEBE9', background: budget === b.id ? '#F1F8E9' : 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all .15s' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', border: `2px solid ${b.color}`, background: budget === b.id ? b.color : 'white' }} />
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#3E2723' }}>{b.label}</span>
                    </div>
                    <span style={{ fontSize: 13, color: '#888' }}>Up to {b.kg}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #EFEBE9', background: 'white', color: '#555', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>← Back</button>
              <button onClick={() => { if (!cuisine) { alert('Please select cuisine preference'); return } buildBox() }}
                disabled={!cuisine || loading}
                style={{ flex: 2, padding: '14px', borderRadius: 12, border: 'none', background: cuisine ? '#2E7D32' : '#ddd', color: 'white', fontWeight: 700, fontSize: 15, cursor: cuisine ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Sparkles size={16} /> Build My Box!
              </button>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 20, animation: 'spin 2s linear infinite', display: 'inline-block' }}>🤖</div>
            <h3 style={{ fontWeight: 700, fontSize: 18, color: '#3E2723', marginBottom: 10 }}>Claude AI is building your box…</h3>
            <p style={{ color: '#888', fontSize: 13 }}>Analysing your health goals, cuisine preferences and picking the best vegetables from today's harvest!</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
              {['🍅 Checking tomatoes', '🥬 Picking leafy greens', '🥕 Adding roots', '✨ Finalising box'].map((t, i) => (
                <div key={t} style={{ background: '#E8F5E9', color: '#2E7D32', padding: '4px 10px', borderRadius: 99, fontSize: 10, fontWeight: 600 }}>{t}</div>
              ))}
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div style={{ background: '#FFEBEE', borderRadius: 14, padding: '20px', textAlign: 'center', marginTop: 20 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
            <p style={{ color: '#C62828', fontWeight: 600, marginBottom: 16 }}>{error}</p>
            <button onClick={buildBox} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: '#2E7D32', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        )}

        {/* STEP 4: AI Result */}
        {step === 4 && result && (
          <div>
            {/* Box name */}
            <div style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', borderRadius: 20, padding: '24px', marginBottom: 20, textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '4px 14px', borderRadius: 99, marginBottom: 12 }}>
                <Sparkles size={12} color="#F9A825" />
                <span style={{ color: '#F9A825', fontSize: 11, fontWeight: 700 }}>AI GENERATED FOR YOU</span>
              </div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 700, color: 'white', margin: '0 0 8px' }}>{result.box_name}</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '0 0 16px' }}>{result.tagline}</p>
              <div style={{ display: 'inline-flex', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#F9A825', fontWeight: 900, fontSize: 22 }}>{result.total_kg}kg</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Total weight</div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#F9A825', fontWeight: 900, fontSize: 22 }}>{result.vegetables?.length}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Vegetables</div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#F9A825', fontWeight: 900, fontSize: 22 }}>{PLAN?.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Plan</div>
                </div>
              </div>
            </div>

            {/* Vegetables list */}
            <div style={{ background: 'white', borderRadius: 16, padding: '20px', marginBottom: 20, border: '1.5px solid #EFEBE9' }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: '#3E2723', marginBottom: 16 }}>🥬 Your Vegetables</h3>
              {result.vegetables?.map((v, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < result.vegetables.length - 1 ? '1px solid #f5f5f5' : 'none', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{v.emoji || '🌿'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#3E2723' }}>{v.name}</span>
                      <span style={{ fontWeight: 700, color: '#2E7D32', fontSize: 14 }}>{v.qty_kg}kg</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 3 }}>{v.reason}</div>
                    <div style={{ fontSize: 11, color: '#2E7D32', fontWeight: 600 }}>💡 {v.health_tip}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly meals */}
            <div style={{ background: '#FFF8E1', borderRadius: 16, padding: '20px', marginBottom: 20, border: '1px solid #FFE082' }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: '#3E2723', marginBottom: 12 }}>🍳 Meal Ideas This Week</h3>
              {result.weekly_meals?.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: '#F9A825', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ fontSize: 13, color: '#555' }}>{m}</span>
                </div>
              ))}
            </div>

            {/* Health insight */}
            <div style={{ background: '#E8F5E9', borderRadius: 16, padding: '20px', marginBottom: 20, border: '1px solid #C8E6C9' }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: '#2E7D32', marginBottom: 8 }}>🌿 Health Insight</h3>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, margin: '0 0 10px' }}>{result.health_insight}</p>
              <div style={{ background: 'white', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#2E7D32', fontWeight: 600 }}>
                💡 Tip: {result.tip}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <button onClick={() => { setStep(1); setResult(null); setFamilySize(''); setHealthGoal(''); setCuisine('') }}
                style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #EFEBE9', background: 'white', color: '#555', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <RefreshCw size={14} /> Rebuild
              </button>
              <button onClick={addAllToCart}
                style={{ flex: 2, padding: '14px', borderRadius: 12, border: 'none', background: '#2E7D32', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ShoppingCart size={16} /> Add All to Cart →
              </button>
            </div>

            <button onClick={() => navigate(`/plan-harvest?plan=${budget}`)}
              style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1.5px solid #2E7D32', background: 'white', color: '#2E7D32', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Customise This Box Myself →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}