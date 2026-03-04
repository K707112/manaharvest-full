import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'

export default function Cart() {
  const { cart, removeFromCart, updateCartQty, cartTotal, user } = useAuth()
  const navigate = useNavigate()

  const checkout = () => {
    if (!user) navigate('/login', { state: { from: '/cart' } })
    else alert('Order placed! 🎉 Check your WhatsApp for confirmation.')
  }

  if (cart.length === 0) return (
    <div className="page-enter" style={{ paddingTop: 80, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>🛒</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8 }}>Your cart is empty</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Add some fresh vegetables to get started.</p>
      <Link to="/harvest" className="btn btn-primary">Browse Today's Harvest <ArrowRight size={16} /></Link>
    </div>
  )

  return (
    <div className="page-enter" style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--cream)' }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Your Cart</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }} className="cart-grid">
          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cart.map(item => (
              <div key={item.id} className="card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ fontSize: 40, flexShrink: 0 }}>{item.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{item.farmerName} · {item.village}</div>
                  <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 15 }}>₹{item.price} × {item.qty} = ₹{item.price * item.qty}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => updateCartQty(item.id, item.qty - 1)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => updateCartQty(item.id, item.qty + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Plus size={14} />
                  </button>
                  <button onClick={() => removeFromCart(item.id)} style={{ width: 32, height: 32, borderRadius: 8, background: '#FFEBEE', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 4 }}>
                    <Trash2 size={14} color="#C62828" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card" style={{ padding: 24, position: 'sticky', top: 90 }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>Free</span>
            </div>
            <hr style={{ borderColor: 'var(--border)', margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>
              <span>Total</span>
              <span style={{ color: 'var(--green)', fontFamily: 'var(--font-display)' }}>₹{cartTotal}</span>
            </div>
            <button onClick={checkout} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px 0' }}>
              <ShoppingBag size={16} /> Place Order
            </button>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
              Harvested this morning · Delivered by noon
            </p>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .cart-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
