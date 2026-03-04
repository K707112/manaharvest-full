# 🌿 ManaHarvest – React + Vite Frontend

Fresh village vegetables delivered to your home in under 6 hours.

## Tech Stack
- **React 18** + **Vite 5**
- **React Router v6** (client-side routing)
- **Static mock data** (hardcoded in `/src/data/`)
- **Context API** (auth + cart state)
- **Lucide React** (icons)
- **Google Fonts** – Playfair Display + DM Sans

## Pages
| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero, stats, featured farmers, CTA |
| `/harvest` | Today's Harvest | Product grid with search & filter, countdown |
| `/farmers` | Farmers | Farmer profiles with their stories |
| `/subscribe` | Subscription Plans | 3 plans: ₹399 / ₹699 / ₹999 |
| `/track` | Order Tracking | Search by order ID, step timeline |
| `/dashboard` | Customer Dashboard | Orders, subscription, wallet, address |
| `/login` | Login / Sign Up | Login + Register + OTP flow |
| `/cart` | Cart | Cart items, qty, checkout |
| `/batch/:batchId` | Batch Transparency | Farm-to-table journey for any product |

## Setup
```bash
npm install
npm run dev
```

## Demo Credentials
- **Login**: any email + any password (4+ chars)
- **OTP**: any 4 digits
- **Track Order**: try `MH-ORD-2024` or `MH-ORD-2023`
- **Batch Info**: click any Batch ID on the Harvest page (e.g. `MH-0302-TOM`)

## Data
All mock data lives in `src/data/`:
- `products.js` – 8 vegetables with batch IDs, prices, farmer info
- `farmers.js` – 4 farmer profiles with stories
- `subscriptions.js` – 3 subscription plans
- `orders.js` – 2 mock orders + user profile

## Next Steps (when ready)
- Replace mock data with Supabase
- Integrate Razorpay for payments
- Add Google Maps for live delivery tracking
- Build admin panel for farmers/orders
