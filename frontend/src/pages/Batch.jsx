import { useParams, Link } from 'react-router-dom';
import { batchDetails } from '../data';

export default function Batch() {
  const { batchId } = useParams();
  const batch = batchDetails[batchId];

  if (!batch) return (
    <div style={{ paddingTop: 'var(--nav-height)', textAlign: 'center', padding: '120px 24px' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
      <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: 8 }}>Batch Not Found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>We couldn't find batch: {batchId}</p>
      <Link to="/harvest" style={{ color: 'var(--green)', fontWeight: 600 }}>← Browse Today's Harvest</Link>
    </div>
  );

  return (
    <div style={{ paddingTop: 'var(--nav-height)' }}>
      <div style={{ background: 'var(--cream)', padding: '48px 0 32px' }}>
        <div className="container">
          <Link to="/harvest" style={{ color: 'var(--green)', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            ← Back to Harvest
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '4rem' }}>{batch.emoji}</span>
            <div>
              <div style={{ background: '#fff', borderRadius: 50, display: 'inline-block', padding: '4px 14px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'monospace' }}>{batch.batchId}</div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: 4 }}>{batch.product} – Batch Report</h1>
              <p style={{ color: 'var(--text-muted)' }}>Harvested {batch.harvestDate} at {batch.harvestTime}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Farm Info */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 20, fontSize: '1.25rem' }}>🏡 Farm Details</h3>
            {[
              { label: 'Farmer', value: batch.farmer },
              { label: 'Village', value: batch.village },
              { label: 'Soil Type', value: batch.soilType },
              { label: 'Water Source', value: batch.waterSource },
              { label: 'Pesticides', value: batch.pesticides },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, textAlign: 'right' }}>{row.value}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {batch.certifications.map(c => (
                <span key={c} style={{ background: 'var(--green-pale)', color: 'var(--green)', borderRadius: 50, padding: '4px 12px', fontSize: '0.78rem', fontWeight: 600 }}>✓ {c}</span>
              ))}
            </div>
          </div>

          {/* Stock Info */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 20, fontSize: '1.25rem' }}>📊 Harvest Stats</h3>
            {[
              { label: 'Total Harvested', value: batch.totalHarvested, color: 'var(--text)' },
              { label: 'Sold', value: batch.sold, color: 'var(--green)' },
              { label: 'Remaining', value: batch.remaining, color: '#E65100' },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
                {s.label !== 'Total Harvested' && (
                  <div style={{ height: 6, background: '#eee', borderRadius: 3 }}>
                    <div style={{
                      height: '100%', background: s.color, borderRadius: 3,
                      width: s.label === 'Sold' ? '65%' : '35%',
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', gridColumn: 'span 1' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 20, fontSize: '1.25rem' }}>⏰ Journey Timeline</h3>
            <div style={{ position: 'relative', paddingLeft: 28 }}>
              <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: 'var(--green-pale)' }} />
              {batch.timeline.map((event, i) => (
                <div key={i} style={{ position: 'relative', marginBottom: 20, paddingLeft: 8 }}>
                  <div style={{
                    position: 'absolute', left: -22, top: 4,
                    width: 12, height: 12, borderRadius: '50%',
                    background: 'var(--green)', border: '2px solid #fff', boxShadow: '0 0 0 2px var(--green)',
                  }} />
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--green)', marginBottom: 2 }}>{event.time}</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{event.event}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
