// src/services/api.js
// Central file for all backend API calls

const BASE = (import.meta.env.VITE_API_URL || 'https://manaharvest-full.vercel.app/api/v1')


// ── Core request helper ─────────────────────────────────────
async function request(path, options = {}) {
  const token = localStorage.getItem('token')

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Request failed (${res.status})`)
  }

  return res.json()
}

// ── Auth ────────────────────────────────────────────────────
export const authAPI = {
  sendOtp:          (phone, isSignup = true) => request('/auth/otp/send',    { method: 'POST', body: JSON.stringify({ phone, isLogin: !isSignup }) }),
  verifyOtp:        (phone, otp, name, password) => request('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ phone, otp, name, password }) }),
  loginWithPassword:(phone, password) => request('/auth/login',              { method: 'POST', body: JSON.stringify({ phone, password }) }),
  registerDirect:   (data) => request('/auth/register',                      { method: 'POST', body: JSON.stringify(data) }),
  logout:           () => request('/auth/logout',                             { method: 'POST' }),
  refresh:          (refresh_token) => request('/auth/token/refresh',         { method: 'POST', body: JSON.stringify({ refresh_token }) }),
}

// ── Crops / Harvest ─────────────────────────────────────────
export const cropsAPI = {
  getAll:      (params = {})  => {
    const q = new URLSearchParams(params).toString()
    return request(`/crops${q ? '?' + q : ''}`)
  },
  getOne:      (id)           => request(`/crops/${id}`),
  getBatch:    (batchId)      => request(`/crops/batch/${batchId}`),
  search:      (q)            => request(`/crops/search?q=${encodeURIComponent(q)}`),
  incrementView: (id)         => request(`/crops/${id}/view`, { method: 'POST' }),
}

// ── Farmers ─────────────────────────────────────────────────
export const farmersAPI = {
  getAll:     ()    => request('/farmers'),
  getOne:     (id)  => request(`/farmers/${id}`),
  getCrops:   (id)  => request(`/farmers/${id}/crops`),
}

// ── Orders ──────────────────────────────────────────────────
export const ordersAPI = {
  getAll:     ()          => request('/orders'),
  getOne:     (id)        => request(`/orders/${id}`),
  create:     (data)      => request('/orders',              { method: 'POST',   body: JSON.stringify(data) }),
  cancel:     (id)        => request(`/orders/${id}/cancel`, { method: 'PATCH' }),
  reorder:    (id)        => request(`/orders/${id}/reorder`,{ method: 'POST' }),
}

// ── Tracking ────────────────────────────────────────────────
export const trackingAPI = {
  track:      (orderNumber) => request(`/tracking/${orderNumber}`),
  history:    (orderNumber) => request(`/tracking/${orderNumber}/history`),
}

// ── Subscriptions ───────────────────────────────────────────
export const subscriptionsAPI = {
  getMine:    ()      => request('/subscriptions/me'),
  create:     (data)  => request('/subscriptions',              { method: 'POST',   body: JSON.stringify(data) }),
  update:     (id, d) => request(`/subscriptions/${id}`,        { method: 'PATCH',  body: JSON.stringify(d) }),
  pause:      (id, d) => request(`/subscriptions/${id}/pause`,  { method: 'POST',   body: JSON.stringify(d) }),
  cancel:     (id)    => request(`/subscriptions/${id}`,        { method: 'DELETE' }),
}

// ── Users / Profile ─────────────────────────────────────────
export const usersAPI = {
  getProfile:     ()      => request('/users/me'),
  updateProfile:  (data)  => request('/users/me',              { method: 'PATCH', body: JSON.stringify(data) }),
  getWallet:      ()      => request('/users/me/wallet'),
  getAddresses:   ()      => request('/users/me/addresses'),
  addAddress:     (data)  => request('/users/me/addresses',    { method: 'POST',  body: JSON.stringify(data) }),
}

// ── Recommendations ─────────────────────────────────────────
export const recommendAPI = {
  get:        (exclude = []) => request(`/recommendations${exclude.length ? '?exclude=' + exclude.join(',') : ''}`),
  trackEvent: (data)         => request('/recommendations/events', { method: 'POST', body: JSON.stringify(data) }),
}
