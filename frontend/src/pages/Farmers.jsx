// src/pages/Farmers.jsx — connected to real backend
import { useState, useEffect } from 'react'
import { Star, MapPin, Sprout } from 'lucide-react'
import { farmersAPI } from '../services/api'
import { Link } from 'react-router-dom'

export default function Farmers() {
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    farmersAPI.getAll()
      .then(res => setFarmers(res.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-enter" style={{ paddingTop: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, #EFEBE9 0%, #D7CCC8 100%)', padding: '56px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
            Meet Our Farmers
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            Every vegetable has a face behind it. These are the hands that grow your food.
          </p>
        </div>
      </div>

      <div className="container section">
        {loading && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍🌾</div>
            <p>Loading farmers…</p>
          </div>
        )}

        {error && (
          <div style={{ background: '#FFEBEE', color: '#C62828', padding: 20, borderRadius: 12, textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {farmers.map((f, i) => (
              <div key={f.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 260 }} className="farmer-card-grid">
                  {/* Left color block */}
                  <div style={{
                    background: i % 2 === 0
                      ? 'linear-gradient(160deg, var(--green) 0%, #1B5E20 100%)'
                      : 'linear-gradient(160deg, var(--brown) 0%, #4E342E 100%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', padding: 32, gap: 12
                  }}>
                    <div style={{ fontSize: 56, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👨‍🌾</div>
                    <div style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, textAlign: 'center' }}>{f.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                      <MapPin size={12} /> {f.village}, {f.district}
                    </div>
                    {f.avg_rating && (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 4 }}>
                        <Star size={14} color="#F9A825" fill="#F9A825" />
                        <span style={{ color: 'white', fontWeight: 700 }}>{f.avg_rating}</span>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>({f.total_orders} orders)</span>
                      </div>
                    )}
                    {f.is_verified && (
                      <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {/* Right details */}
                  <div style={{ padding: 32 }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                        <Sprout size={14} color="var(--green)" />
                        {f.years_farming} years farming · {f.land_acres} acres
                      </div>
                    </div>

                    {f.bio && (
                      <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text)', marginBottom: 20, maxWidth: 520 }}>{f.bio}</p>
                    )}

                    {f.speciality && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 8 }}>Speciality</div>
                        <span className="badge badge-green">{f.speciality}</span>
                      </div>
                    )}

                    <Link to="/harvest" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--green)', color: 'white', padding: '8px 18px', borderRadius: 99, fontSize: 13, fontWeight: 600, textDecoration: 'none', marginTop: 8 }}>
                      View crops →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && farmers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍🌾</div>
            <p>No farmers found. Add farmers in your Supabase database.</p>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .farmer-card-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
