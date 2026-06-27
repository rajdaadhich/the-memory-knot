import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import LoginRequiredModal from '@/components/LoginRequiredModal';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useUser();
  const navigate = useNavigate();

  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Keep ref of token to check login state in sync
  const tokenRef = useRef<string | null>(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // Sync cart helper
  const syncCart = async (tokenStr: string, currentItems: CartItem[]) => {
    try {
      const itemsToSync = currentItems.map(i => ({ id: i.id, quantity: i.quantity }));
      await api.syncUserCart(tokenStr, itemsToSync);
    } catch (err) {
      console.error("Cart sync failed:", err);
    }
  };

  // Load/Merge cart on auth changes
  useEffect(() => {
    const loadCart = async () => {
      if (token) {
        try {
          // Fetch database cart
          const dbCart = await api.getUserCart(token);
          
          setItems(prevGuestItems => {
            // Merge guest items with database items
            const merged = [...dbCart];
            
            prevGuestItems.forEach(guestItem => {
              const existing = merged.find(item => item.id === guestItem.id);
              if (existing) {
                existing.quantity = Math.max(existing.quantity, guestItem.quantity);
              } else {
                merged.push(guestItem);
              }
            });

            // Sync the merged result back to backend database
            syncCart(token, merged);
            return merged;
          });
        } catch (err) {
          console.error("Failed to load user cart:", err);
        }
      } else {
        // Clear items on logout
        setItems([]);
      }
    };

    loadCart();
  }, [token]);

  // Process pending cart items after successful login
  useEffect(() => {
    if (isAuthenticated && token) {
      const pendingStr = localStorage.getItem('pending_cart_item');
      if (pendingStr) {
        try {
          const pendingItem = JSON.parse(pendingStr);
          localStorage.removeItem('pending_cart_item');

          setItems(prev => {
            const existing = prev.find(i => i.id === pendingItem.id);
            let updated;
            if (existing) {
              updated = prev.map(i => i.id === pendingItem.id ? { ...i, quantity: i.quantity + 1 } : i);
            } else {
              updated = [...prev, { ...pendingItem, quantity: 1 }];
            }
            // Sync to database
            syncCart(token, updated);
            return updated;
          });

          // Open cart drawer and greet
          setIsCartOpen(true);
          toast.success(`${pendingItem.name} added to your cart!`);
        } catch (err) {
          console.error("Error processing pending cart item:", err);
        }
      }
    }
  }, [isAuthenticated, token]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    if (!isAuthenticated) {
      // Save item as pending and open login required modal
      localStorage.setItem('pending_cart_item', JSON.stringify(item));
      setIsLoginModalOpen(true);
      return;
    }

    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      let updated;
      if (existing) {
        updated = prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        updated = [...prev, { ...item, quantity: 1 }];
      }
      if (tokenRef.current) syncCart(tokenRef.current, updated);
      return updated;
    });
    setIsCartOpen(true);
  }, [isAuthenticated]);

  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      const updated = prev.filter(i => i.id !== id);
      if (tokenRef.current) syncCart(tokenRef.current, updated);
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems(prev => {
      let updated;
      if (quantity <= 0) {
        updated = prev.filter(i => i.id !== id);
      } else {
        updated = prev.map(i => i.id === id ? { ...i, quantity } : i);
      }
      if (tokenRef.current) syncCart(tokenRef.current, updated);
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    if (tokenRef.current) syncCart(tokenRef.current, []);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isCartOpen, setIsCartOpen }}>
      {children}
      
      {/* Gated Authentication Pop-Up */}
      <LoginRequiredModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          localStorage.removeItem('pending_cart_item');
        }}
        onConfirm={() => {
          setIsLoginModalOpen(false);
          // Navigate to login with referrer redirect state
          navigate('/login', { state: { from: { pathname: window.location.pathname + window.location.search + window.location.hash } } });
        }}
      />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
