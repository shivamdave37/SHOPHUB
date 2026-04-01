import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DemoStoreContext = createContext(null);

const CART_KEY = 'shophub_demo_cart';
const ORDERS_KEY = 'shophub_demo_orders';

export function DemoStoreProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem(CART_KEY);
    const storedOrders = localStorage.getItem(ORDERS_KEY);

    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }

    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  const persistCart = (items) => {
    setCartItems(items);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  };

  const persistOrders = (items) => {
    setOrders(items);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(items));
  };

  const addToCart = (product, quantity = 1) => {
    const qty = Number(quantity);
    const existing = cartItems.find((item) => item.product_id === product.id);

    if (existing) {
      const updatedItems = cartItems.map((item) =>
        item.product_id === product.id
          ? {
              ...item,
              quantity: item.quantity + qty,
              line_total: (item.quantity + qty) * Number(item.unit_price)
            }
          : item
      );
      persistCart(updatedItems);
      return;
    }

    persistCart([
      ...cartItems,
      {
        id: `cart-${product.id}`,
        product_id: product.id,
        title: product.title,
        quantity: qty,
        unit_price: Number(product.price),
        line_total: Number(product.price) * qty,
        primary_image: product.primary_image,
        stock: product.stock,
        category_name: product.category_name
      }
    ]);
  };

  const removeCartItem = (productId) => {
    persistCart(cartItems.filter((item) => item.product_id !== productId));
  };

  const clearCart = () => {
    persistCart([]);
  };

  const placeOrder = ({ paymentMethod, customerName }) => {
    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.line_total), 0);
    const shippingFee = subtotal >= 1000 ? 0 : 99;
    const totalAmount = subtotal + shippingFee;
    const newOrder = {
      id: `order-${Date.now()}`,
      order_number: `ORD-${Date.now()}`,
      status: 'paid',
      payment_method: paymentMethod,
      customer_name: customerName,
      total_amount: totalAmount.toFixed(2),
      placed_at: new Date().toISOString(),
      items: cartItems
    };

    persistOrders([newOrder, ...orders]);
    clearCart();
    return newOrder;
  };

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity), 0),
    [cartItems]
  );

  return (
    <DemoStoreContext.Provider
      value={{
        cartItems,
        orders,
        cartCount,
        addToCart,
        removeCartItem,
        clearCart,
        placeOrder
      }}
    >
      {children}
    </DemoStoreContext.Provider>
  );
}

export function useDemoStore() {
  return useContext(DemoStoreContext);
}
