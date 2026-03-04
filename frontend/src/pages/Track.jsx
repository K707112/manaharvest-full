import { useState } from 'react';
import { orders, statusSteps } from '../data';
import { useApp } from '../context/AppContext';

const statusIndex = { harvesting: 0, packed: 1, out_for_delivery: 2, delivered: 3 };

export default function Track() {
  const { user } = useApp();
  const [query, setQuery] = useState('');
  const [found, setFound] = useState(user ? orders[0] : null);

  const search = () => {
    const order = orders.find(o => o.id.toLowerCase() === query.toLowerCase().trim());
    setFound(order || 'not_found');
  };

  return (
    <div style={{ paddingTop: 'var(--nav-height)' }}>
      <div style={{ background: 'var(--cream)', padding: '48px 0 32px' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 8 }}>Track Your Order 🚚</h1>
          <p style={{ color: 'var(--text-muted)' }}>Know exactly where your vegetables are — from farm to your door</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {/* Search Box */}
        <div style={{ maxWidth: 480, margin: '0 auto 40px', display: 'flex', gap: 10 }}>
          <input
            placeholder="Enter Order ID (e.g. ORD-0012)"
            value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            style={{
              flex: 1, padding: '12px 18px', border: '1.5px solid var(--border)', borderRadius: 50,
              fontSize: '0.95rem', fontFamily: 'var(--font-sans)', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor='var(--green)'}
            onBlur={e => e.target.style.borderColor='var(--border)'}
          />
          <button onClick={search} style={{
            background: 'var(--green)', color: '#fff', borderRadius: 50,
            padding: '12px 24px', fontWeight: 600,
          }}>Track</button>
        </div>

        {found === 'not_found' && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>😔</div>
            <p>Order not found. Please check your Order ID.</p>
          </div>
        )}

        {found && found !== 'not_found' && <OrderCard order={found} />}

        {/* All Orders (if logged in) */}
        {user && orders.length > 1 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: 20 }}>Recent Orders</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {orders.map(o => (
                <div key={o.id} style={{
                  background: '#fff', borderRadius: 16, padding: '20px 24px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
                }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{o.id}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{o.date} · {o.items.length} items · ₹{o.total}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <StatusBadge status={o.status} />
                    <button onClick={() => setFound(o)} style={{
                      background: 'var(--green-pale)', color: 'var(--green)',
                      borderRadius: 50, padding: '6px 16px', fontWeight: 600, fontSize: '0.85rem',
                    }}>View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const currentStep = statusIndex[order.status] ?? 0;
  return (
    <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 8px 40px rgba(46,125,50,0.1)', maxWidth: 700, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: 4 }}>Order {order.id}</h2>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{order.date} · {order.deliveryTime}</div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Progress Steps */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
          {statusSteps.map((step, i) => {
            const done = i <= currentStep;
            const active = i === currentStep;
            return (
              <div key={step} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                {/* Line */}
                {i < statusSteps.length - 1 && (
                  <div style={{
                    position: 'absolute', top: 16, left: '50%', right: '-50%',
                    height: 3, background: i < currentStep ? 'var(--green)' : '#eee',
                    zIndex: 0, transition: 'background 0.5s',
                  }} />
                )}
                {/* Circle */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', margin: '0 auto 8px',
                  background: done ? 'var(--green)' : '#eee',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', zIndex: 1,
                  boxShadow: active ? '0 0 0 4px rgba(46,125,50,0.15)' : 'none',
                  transition: 'background 0.3s, box-shadow 0.3s',
                }}>
                  {done ? <span style={{ color: '#fff', fontSize: '0.9rem' }}>✓</span> : <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ccc' }} />}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: done ? 600 : 400, color: done ? 'var(--green)' : 'var(--text-muted)' }}>{step}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Farm info */}
      <div style={{
        background: 'var(--green-pale)', borderRadius: 12, padding: '14px 18px',
        display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '1.5rem' }}>🚜</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--green)' }}>Harvest at {order.harvestTime}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>by {order.farmName}</div>
        </div>
      </div>

      {/* Items */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ fontWeight: 600, marginBottom: 12 }}>Items</h4>
        {order.items.map(item => (
          <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.9rem' }}>{item.name} <span style={{ color: 'var(--text-muted)' }}>× {item.qty}</span></span>
            <span style={{ fontWeight: 600 }}>₹{item.price}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontWeight: 700 }}>
          <span>Total</span><span style={{ color: 'var(--green)' }}>₹{order.total}</span>
        </div>
      </div>

      {/* Address */}
      <div style={{ background: '#f9f9f9', borderRadius: 10, padding: '12px 16px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
        📍 {order.address}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    out_for_delivery: { label: '🚚 Out for Delivery', bg: '#FFF3E0', color: '#E65100' },
    delivered: { label: '✅ Delivered', bg: '#E8F5E9', color: '#2E7D32' },
    packed: { label: '📦 Packed', bg: '#E3F2FD', color: '#1565C0' },
    harvesting: { label: '🌾 Harvesting', bg: '#F3E5F5', color: '#7B1FA2' },
  };
  const s = map[status] || { label: status, bg: '#eee', color: '#666' };
  return (
    <div style={{ background: s.bg, color: s.color, borderRadius: 50, padding: '6px 14px', fontWeight: 600, fontSize: '0.82rem' }}>
      {s.label}
    </div>
  );
}
