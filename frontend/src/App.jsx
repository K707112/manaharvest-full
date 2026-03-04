import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Home from './pages/Home'
import Login from './pages/Login'
import Harvest from './pages/Harvest'
import Farmers from './pages/Farmers'
import Subscriptions from './pages/Subscriptions'
import Tracking from './pages/Tracking'
import Dashboard from './pages/Dashboard'
import BatchInfo from './pages/BatchInfo'
import Cart from './pages/Cart'
import Admin from './pages/Admin'

function Layout({ children, hideFooter }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {!hideFooter && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/harvest" element={<Layout><Harvest /></Layout>} />
          <Route path="/farmers" element={<Layout><Farmers /></Layout>} />
          <Route path="/subscribe" element={<Layout><Subscriptions /></Layout>} />
          <Route path="/track" element={<Layout><Tracking /></Layout>} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/cart" element={<Layout><Cart /></Layout>} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/batch/:batchId" element={<Layout><BatchInfo /></Layout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
