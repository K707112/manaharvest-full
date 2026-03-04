import { createContext, useContext, useState } from 'react';
import { mockUser } from '../data';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null); // null = logged out
  const [cart, setCart] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const login = (email, password) => {
    // Mock login - accept any email/password
    if (email && password) {
      setUser({ ...mockUser, email });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setCart([]);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.id !== productId));
  };

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <AppContext.Provider value={{ user, login, logout, cart, addToCart, removeFromCart, cartCount, cartTotal, mobileMenuOpen, setMobileMenuOpen }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
