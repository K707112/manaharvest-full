import { useState } from 'react'
import { plans } from '../data/orders'
import styles from './Subscription.module.css'

export default function Subscription() {
  const [selected, setSelected] = useState('medium')
  const [step, setStep] = useState(1) // 1: plans, 2: details, 3: confirm
  const [form, setForm] = useState({ name: '', phone: '', address: '', slot: 'morning' })

  const selectedPlan = plans.find(p => p.id === selected)

  const handleInput = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  return (
    <div className="page">
      {/* ── HEADER ── */}
      <div className={styles.pageHeader}>
        <span className="tag">Weekly Plans</span>
        <h1 className={styles.pageTitle}>Pick Your<br />Fresh Box</h1>
        <p>Curated weekly boxes. Seasonal vegetables. Free replacement if you're ever unhappy.</p>
      </div>

      {/* ── STEP INDICATOR ── */}
      <div className={styles.steps}>
        {['Choose Plan', 'Your Details', 'Confirm'].map((s, i) => (
          <div key={s} className={`${styles.step} ${step > i + 1 ? styles.stepDone : ''} ${step === i + 1 ? styles.stepActive : ''}`}>
            <div className={styles.stepNum}>{step > i + 1 ? '✓' : i + 1}</div>
            <span className={styles.stepLabel}>{s}</span>
            {i < 2 && <div className={styles.stepLine} />}
          </div>
        ))}
      </div>

      {/* ── STEP 1: PLANS ── */}
      {step === 1 && (
        <div className="section">
          <div className={styles.plansGrid}>
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`${styles.planCard} ${selected === plan.id ? styles.planSelected : ''} ${plan.highlight ? styles.planFeatured : ''}`}
                onClick={() => setSelected(plan.id)}
              >
                {plan.badge && <div className={styles.planBadge}>{plan.badge}</div>}
                <div className={styles.planIcon}>{plan.icon}</div>
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.planPrice}>
                  ₹{plan.price}<span>/week</span>
                </div>
                <div className={styles.planMeta}>
                  {plan.vegetables} vegetables · ~{plan.weightKg} kg
                </div>
                <ul className={styles.planFeatures}>
                  {plan.features.map(f => (
                    <li key={f}><span className={styles.checkmark}>✓</span>{f}</li>
                  ))}
                </ul>
                <div className={`${styles.selectIndicator} ${selected === plan.id ? styles.selectIndicatorActive : ''}`}>
                  {selected === plan.id ? '✅ Selected' : 'Select Plan'}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.bottomBar}>
            <div className={styles.selectedSummary}>
              Selected: <strong>{selectedPlan.icon} {selectedPlan.name}</strong> — ₹{selectedPlan.price}/week
            </div>
            <button className="btn btn-primary" onClick={() => setStep(2)} style={{ fontSize: '1rem', padding: '15px 40px' }}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: DETAILS ── */}
      {step === 2 && (
        <div className="section">
          <div className={styles.formWrap}>
            <h2 style={{ color: 'var(--green-dark)', marginBottom: 8 }}>Your Delivery Details</h2>
            <p style={{ marginBottom: 32 }}>We'll deliver your {selectedPlan.name} every week.</p>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input className={styles.input} name="name" value={form.name} onChange={handleInput} placeholder="e.g. Arjun Reddy" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <input className={styles.input} name="phone" value={form.phone} onChange={handleInput} placeholder="+91 98765 43210" />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Delivery Address</label>
              <textarea className={styles.textarea} name="address" value={form.address} onChange={handleInput} placeholder="Flat no, Building, Street, Area, City, PIN" rows={3} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Preferred Delivery Slot</label>
              <div className={styles.slotGrid}>
                {[
                  { id: 'morning', label: '🌅 Morning', sub: '7 AM – 10 AM' },
                  { id: 'noon', label: '☀️ Afternoon', sub: '12 PM – 3 PM' },
                  { id: 'evening', label: '🌇 Evening', sub: '5 PM – 8 PM' },
                ].map(slot => (
                  <button
                    key={slot.id}
                    className={`${styles.slotBtn} ${form.slot === slot.id ? styles.slotActive : ''}`}
                    onClick={() => setForm(f => ({ ...f, slot: slot.id }))}
                  >
                    <span className={styles.slotLabel}>{slot.label}</span>
                    <span className={styles.slotSub}>{slot.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formBtns}>
              <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)} style={{ fontSize: '1rem', padding: '15px 40px' }}>
                Review Order →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: CONFIRM ── */}
      {step === 3 && (
        <div className="section">
          <div className={styles.confirmWrap}>
            <h2 style={{ color: 'var(--green-dark)', marginBottom: 24 }}>Order Summary</h2>

            <div className={styles.confirmCard}>
              <div className={styles.confirmRow}>
                <span>Plan</span>
                <strong>{selectedPlan.icon} {selectedPlan.name}</strong>
              </div>
              <div className={styles.confirmRow}>
                <span>Delivery</span>
                <strong>Every {form.slot === 'morning' ? 'Morning (7–10 AM)' : form.slot === 'noon' ? 'Afternoon (12–3 PM)' : 'Evening (5–8 PM)'}</strong>
              </div>
              <div className={styles.confirmRow}>
                <span>Address</span>
                <strong>{form.address || 'Not provided'}</strong>
              </div>
              <div className={`${styles.confirmRow} ${styles.confirmTotal}`}>
                <span>Weekly Total</span>
                <strong style={{ color: 'var(--green)', fontSize: '1.3rem' }}>₹{selectedPlan.price}</strong>
              </div>
            </div>

            <div className={styles.guarantee}>
              🛡️ 100% freshness guarantee. Free replacement for any unhappy order.
            </div>

            <div className={styles.paymentLabel}>Pay via</div>
            <div className={styles.paymentBtns}>
              {['UPI / GPay', 'Debit / Credit Card', 'Net Banking'].map(m => (
                <button key={m} className={styles.payBtn}>{m}</button>
              ))}
            </div>

            <div className={styles.formBtns}>
              <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
              <button
                className="btn btn-primary"
                style={{ fontSize: '1rem', padding: '15px 40px' }}
                onClick={() => alert('🎉 Order placed! Welcome to ManaHarvest. (Payment integration coming soon)')}
              >
                🌿 Start My Fresh Plan — ₹{selectedPlan.price}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
