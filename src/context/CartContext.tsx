
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
  // Add these properties to match what Cart.tsx and other files expect
  cart: CartItem[];
  removeFromCart: (item: CartItem) => void;
  updateQuantity: (item: CartItem, quantity: number) => void;
  addToCart: (item: CartItem) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart data:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        
        toast({
          title: "Cart updated",
          description: `${item.name} quantity increased.`,
        });
        
        return updatedItems;
      } else {
        // Add new item
        toast({
          title: "Item added",
          description: `${item.name} added to your cart.`,
        });
        
        return [...prevItems, { ...item, quantity }];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems(prevItems => {
      const item = prevItems.find(i => i.id === id);
      const filteredItems = prevItems.filter(i => i.id !== id);
      
      if (item) {
        toast({
          title: "Item removed",
          description: `${item.name} removed from your cart.`,
        });
      }
      
      return filteredItems;
    });
  };

  const updateQuantity = (idOrItem: string | CartItem, quantity: number) => {
    if (quantity <= 0) {
      if (typeof idOrItem === 'string') {
        removeItem(idOrItem);
      } else {
        removeItem(idOrItem.id);
      }
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => {
        const itemId = typeof idOrItem === 'string' ? idOrItem : idOrItem.id;
        return item.id === itemId ? { ...item, quantity } : item;
      })
    );
  };

  // Alias functions to match what's expected in other components
  const addToCart = (item: CartItem) => {
    const { quantity, ...itemWithoutQuantity } = item;
    addItem(itemWithoutQuantity, quantity);
  };

  const removeFromCart = (item: CartItem) => {
    removeItem(item.id);
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  const total = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    total,
    // Add the aliases for the other components
    cart: items,
    removeFromCart,
    addToCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
