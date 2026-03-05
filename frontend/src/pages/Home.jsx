import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Users, Package, Leaf, Star, ChevronRight } from 'lucide-react'
import { products } from '../data/products'
import { farmers } from '../data/farmers'

export default function Home() {
  const featured = products.slice(0, 3)

  return (
    <div className="page-enter">
      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        background: 'linear-gradient(135deg, #F1F8E9 0%, #E8F5E9 50%, #DCEDC8 100%)',
        position: 'relative', overflow: 'hidden', paddingTop: 80
      }}>
        {/* Background shapes */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 500, height: 500, background: 'rgba(46,125,50,0.07)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -60, width: 400, height: 400, background: 'rgba(109,76,65,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '10%', width: 200, height: 200, background: 'rgba(46,125,50,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', padding: '80px 24px' }} >
          <div className="hero-text">
            <div className="badge badge-green" style={{ marginBottom: 20, fontSize: 13 }}>
              <span style={{ width: 8, height: 8, background: '#4CAF50', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Live Harvest Today — 8 Crops Available
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 700, lineHeight: 1.15, color: 'var(--text)', marginBottom: 20 }}>
              Fresh From Our<br />
              <span style={{ color: 'var(--green)' }}>Village Fields</span><br />
              To Your Home
            </h1>
            <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 460, marginBottom: 32 }}>
              Vegetables harvested before 9 AM, at your door by noon. No chemicals. No middlemen. Just honest, fresh produce straight from Telangana's farms.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/harvest" className="btn btn-primary">
                View Today's Harvest <ArrowRight size={16} />
              </Link>
              <Link to="/subscribe" className="btn btn-outline">
                Weekly Box Plans
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 32, marginTop: 40, flexWrap: 'wrap' }}>
              {[
                { icon: <Users size={16} />, value: '12+', label: 'Village Farmers' },
                { icon: <Clock size={16} />, value: '<6h', label: 'Field to Door' },
                { icon: <Package size={16} />, value: '500+', label: 'Happy Families' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', boxShadow: 'var(--shadow)' }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Cards */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }} className="hero-cards">
            {featured.map((p, i) => (
              <div key={p.id} className="card" style={{
                position: i === 0 ? 'relative' : 'absolute',
                top: i === 1 ? 60 : i === 2 ? 20 : 0,
                left: i === 1 ? 30 : i === 2 ? -20 : 0,
                width: 220,
                padding: 20,
                transform: i === 0 ? 'rotate(-2deg)' : i === 1 ? 'rotate(3deg)' : 'rotate(-1deg)',
                zIndex: 3 - i,
                animation: `float${i} 4s ease-in-out infinite`,
              }}>
                <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>{p.emoji}</div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {p.farmerName} · {p.village}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: 16 }}>₹{p.price}/kg</span>
                  <span className="badge badge-green" style={{ fontSize: 11 }}>
                    <Clock size={10} /> {p.harvestTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
              Fresher Than Your Local Market
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
              We pick, pack, and deliver on the same morning. Here's how it works:
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }} className="steps-grid">
            {[
              { emoji: '🌱', step: '5:30 AM', title: 'Farmers Harvest', desc: 'Farmers pick fresh vegetables at dawn based on your orders.' },
              { emoji: '📦', step: '8:00 AM', title: 'Packed & Sorted', desc: 'Each batch is weighed, packed, and tagged with a Batch ID.' },
              { emoji: '🚚', step: '9:30 AM', title: 'Sets Out for Delivery', desc: 'Our delivery team picks up packed boxes from the village.' },
              { emoji: '🏠', step: 'By Noon', title: 'At Your Doorstep', desc: 'Fresh vegetables arrive at your home with the batch receipt.' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: 24, borderRadius: 'var(--radius)', background: 'var(--cream)', position: 'relative' }}>
                {i < 3 && <ChevronRight size={16} style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', color: 'var(--border)', zIndex: 1 }} className="step-arrow" />}
                <div style={{ fontSize: 36, marginBottom: 12 }}>{s.emoji}</div>
                <div className="badge badge-green" style={{ marginBottom: 10, fontSize: 11 }}>{s.step}</div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Farmers */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                The Faces Behind Your Food
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>Real farmers. Real stories. Real trust.</p>
            </div>
            <Link to="/farmers" className="btn btn-outline btn-sm">
              Meet All Farmers <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="farmers-grid">
            {farmers.map(f => (
              <Link key={f.id} to={`/farmers#farmer-${f.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: 20, textAlign: 'center', transition: 'transform .2s, box-shadow .2s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                  <div style={{ width: 60, height: 60, background: 'var(--green-pale)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 12px' }}>{f.emoji}</div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{f.village} · {f.yearsfarming}y</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 12 }}>
                    <Star size={12} color="#F9A825" fill="#F9A825" />
                    <span style={{ fontWeight: 600 }}>{f.rating}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({f.totalOrders})</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '72px 0', background: 'var(--green)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <Leaf size={40} color="rgba(255,255,255,0.3)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 700, color: 'white', marginBottom: 16 }}>
            Get Fresh Vegetables Every Week
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
            Subscribe to a weekly box and never worry about vegetable shopping again. Prices start at ₹399/week.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/subscribe" style={{ background: 'white', color: 'var(--green)', padding: '12px 28px', borderRadius: 99, fontWeight: 600, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              View Subscription Plans <ArrowRight size={16} />
            </Link>
            <Link to="/harvest" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '12px 28px', borderRadius: 99, fontWeight: 600, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8, border: '1.5px solid rgba(255,255,255,0.3)' }}>
              Shop Today's Harvest
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float0 { 0%,100% { transform: rotate(-2deg) translateY(0); } 50% { transform: rotate(-2deg) translateY(-10px); } }
        @keyframes float1 { 0%,100% { transform: rotate(3deg) translateY(0); } 50% { transform: rotate(3deg) translateY(-14px); } }
        @keyframes float2 { 0%,100% { transform: rotate(-1deg) translateY(0); } 50% { transform: rotate(-1deg) translateY(-8px); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

        @media (max-width: 900px) {
          .hero-text { grid-column: 1 / -1 !important; }
          .hero-cards { display: none !important; }
        }
        @media (max-width: 768px) {
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
          .farmers-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .farmers-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}
