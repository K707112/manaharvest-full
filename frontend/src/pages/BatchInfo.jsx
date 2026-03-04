import { useParams, Link } from 'react-router-dom'
import { getProductByBatchId } from '../data/products'
import { getFarmerById } from '../data/farmers'
import { ArrowLeft, Clock, MapPin, Sprout, CheckCircle } from 'lucide-react'

export default function BatchInfo() {
  const { batchId } = useParams()
  const product = getProductByBatchId(batchId)

  if (!product) return (
    <div className="page-enter" style={{ paddingTop: 100, textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8 }}>Batch Not Found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Batch ID {batchId} doesn't exist.</p>
      <Link to="/harvest" className="btn btn-primary">← Back to Harvest</Link>
    </div>
  )

  const farmer = getFarmerById(product.farmerId)
  const timeline = [
    { emoji: '🌱', label: 'Seeds Planted', date: '8 weeks ago', detail: `Traditional desi variety. Soil: Black Cotton (pH 6.8). No synthetic fertilizers.` },
    { emoji: '💧', label: 'Growing Period', date: '2–7 weeks ago', detail: `Irrigated with borewell water. No pesticides applied. Natural composting.` },
    { emoji: '✂️', label: 'Harvested', date: `Today, ${product.harvestTime}`, detail: `Hand-picked at optimum ripeness. ${product.stock + 20}kg total harvest. Batch ${product.batchId}.` },
    { emoji: '⚖️', label: 'Weighed & Packed', date: `Today, ~8:30 AM`, detail: `Each pack weighed and labeled. Quality check: 100% passed. Packed in food-safe boxes.` },
    { emoji: '🚚', label: 'Out for Delivery', date: `Today, ~9:30 AM`, detail: `Delivered by ManaHarvest in insulated bags to maintain freshness.` },
    { emoji: '🏠', label: 'At Your Door', date: `Today, by 1:00 PM`, detail: `Expected delivery window: 9:30 AM – 1:00 PM.` },
  ]

  return (
    <div className="page-enter" style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--cream)' }}>
      <div style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)', padding: '40px 0' }}>
        <div className="container">
          <Link to="/harvest" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 20, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Today's Harvest
          </Link>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 64 }}>{product.emoji}</div>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>BATCH REPORT</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,3vw,2.4rem)', fontWeight: 700, color: 'white', marginBottom: 8 }}>
                {product.name}
              </h1>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.15)', color: 'white', padding: '4px 12px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
                  {product.batchId}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#A5D6A7', fontSize: 13 }}>
                  <Clock size={12} /> Harvested {product.harvestTime} today
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }} className="batch-grid">
          {/* Timeline */}
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Farm-to-Table Journey</h3>
            {timeline.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                {i < timeline.length - 1 && (
                  <div style={{ position: 'absolute', left: 19, top: 40, bottom: 0, width: 2, background: i < 4 ? 'var(--green)' : 'var(--border)', zIndex: 0 }} />
                )}
                <div style={{ width: 40, height: 40, background: i < 4 ? 'var(--green-pale)' : 'var(--cream)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, zIndex: 1, border: `2px solid ${i < 4 ? 'var(--green)' : 'var(--border)'}` }}>
                  {step.emoji}
                </div>
                <div style={{ paddingBottom: 28 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{step.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{step.date}</span>
                    {i < 4 && <CheckCircle size={14} color="var(--green)" />}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Batch stats */}
            <div className="card" style={{ padding: 24 }}>
              <h4 style={{ fontWeight: 600, marginBottom: 16 }}>Batch Details</h4>
              {[
                { label: 'Batch ID', value: product.batchId, mono: true },
                { label: 'Harvest Time', value: product.harvestTime },
                { label: 'Total Harvested', value: `${product.stock + 20}kg` },
                { label: 'Units Left', value: `${product.stock} ${product.unit}` },
                { label: 'Village', value: product.village },
                { label: 'Price', value: `₹${product.price}/${product.unit}` },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, fontFamily: r.mono ? 'monospace' : 'inherit', color: 'var(--text)' }}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Farmer card */}
            {farmer && (
              <div className="card" style={{ padding: 24 }}>
                <h4 style={{ fontWeight: 600, marginBottom: 16 }}>Grown By</h4>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 36 }}>{farmer.emoji}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{farmer.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} /> {farmer.village}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14 }}>
                  {farmer.story.split('.')[0]}.
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {farmer.certifications.map(c => (
                    <span key={c} className="badge badge-green" style={{ fontSize: 11 }}>{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Freshness tags */}
            <div className="card" style={{ padding: 24 }}>
              <h4 style={{ fontWeight: 600, marginBottom: 12 }}>Quality Tags</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {product.freshnessTags.map(t => (
                  <div key={t} style={{ display: 'flex', gap: 6, alignItems: 'center', background: 'var(--green-pale)', borderRadius: 8, padding: '8px 12px' }}>
                    <CheckCircle size={13} color="var(--green)" />
                    <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .batch-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
