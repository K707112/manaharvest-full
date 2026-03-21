// src/pages/Contact.jsx
import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = () => {
    if (!form.name || !form.phone || !form.message) { alert('Please fill all fields'); return }
    setSent(true)
  }

  return (
    <div className="page-enter" style={{ paddingTop: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', padding: '52px 0', textAlign: 'center', color: 'white' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, marginBottom: 10 }}>Get In Touch</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
            We're here to help. Reach out for any questions about orders, deliveries or subscriptions.
          </p>
        </div>
      </div>

      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, maxWidth: 900, margin: '0 auto' }}>
          {/* Contact Info */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Contact Information</h2>
            {[
              { icon: '📞', label: 'Phone', value: '+91 7075573757', link: 'tel:+917075573757' },
              { icon: '📧', label: 'Email', value: 'hello@manaharvest.in', link: 'mailto:hello@manaharvest.in' },
              { icon: '📍', label: 'Location', value: 'Visakhapatnam, Andhra Pradesh', link: null },
              { icon: '⏰', label: 'Working Hours', value: 'Mon–Sat: 6 AM – 8 PM', link: null },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, background: '#E8F5E9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{item.label}</div>
                  {item.link
                    ? <a href={item.link} style={{ fontWeight: 600, color: 'var(--green)', fontSize: 15 }}>{item.value}</a>
                    : <div style={{ fontWeight: 600, fontSize: 15 }}>{item.value}</div>
                  }
                </div>
              </div>
            ))}

            {/* WhatsApp */}
            <a href="https://wa.me/919618582513" target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#25D366', color: 'white', padding: '14px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none', marginTop: 8 }}>
              <span style={{ fontSize: 20 }}>💬</span> Chat on WhatsApp
            </a>
          </div>

          {/* Contact Form */}
          <div>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: '#E8F5E9', borderRadius: 16 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Message Sent!</h3>
                <p style={{ color: '#555' }}>We'll get back to you within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', phone: '', message: '' }) }}
                  style={{ marginTop: 20, padding: '10px 24px', borderRadius: 99, background: 'var(--green)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                  Send Another
                </button>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Send a Message</h2>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>YOUR NAME</label>
                  <input className="form-input" name="name" value={form.name} onChange={handle} placeholder="e.g. Ravi Kumar" />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>PHONE NUMBER</label>
                  <input className="form-input" name="phone" value={form.phone} onChange={handle} placeholder="+91 98765 43210" />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>MESSAGE</label>
                  <textarea name="message" value={form.message} onChange={handle} rows={4}
                    placeholder="How can we help you?"
                    style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #C8E6C9', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', resize: 'none', fontFamily: 'var(--font-body)' }} />
                </div>
                <button onClick={submit}
                  style={{ width: '100%', padding: '14px', borderRadius: 99, border: 'none', background: 'var(--green)', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  Send Message →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}