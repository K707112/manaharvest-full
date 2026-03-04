// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, usersAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [cart, setCart]       = useState([])
  const [loading, setLoading] = useState(true)

  // On app load: restore session from saved token
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      usersAPI.getProfile()
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const sendOtp = async (phone) => {
    try {
      const res = await authAPI.sendOtp(phone)
      return { success: true, otp: res.otp }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const verifyOtp = async (phone, otp, name) => {
    try {
      const res = await authAPI.verifyOtp(phone, otp, name)
      localStorage.setItem('token', res.tokens.access)
      localStorage.setItem('refresh_token', res.tokens.refresh)
      setUser(res.user)
      return { success: true, isNewUser: res.is_new_user }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const logout = async () => {
    try { await authAPI.logout() } catch (_) {}
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    setCart([])
  }

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { ...product, qty }]
    })
  }

  const removeFromCart = (productId) => setCart(prev => prev.filter(i => i.id !== productId))

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) return removeFromCart(productId)
    setCart(prev => prev.map(i => i.id === productId ? { ...i, qty } : i))
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🌿</div>
          <p style={{ color: '#666' }}>Loading ManaHarvest…</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{
      user, sendOtp, verifyOtp, logout,
      cart, addToCart, removeFromCart, updateCartQty,
      cartCount, cartTotal
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
