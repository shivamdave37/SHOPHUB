import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DemoStoreContext = createContext(null);

const CART_KEY = 'shophub_demo_cart';
const ORDERS_KEY = 'shophub_demo_orders';
const RECENTLY_VIEWED_KEY = 'shophub_recently_viewed';

export function DemoStoreProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem(CART_KEY);
    const storedOrders = localStorage.getItem(ORDERS_KEY);

    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }

    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }

    const storedRecentlyViewed = localStorage.getItem(RECENTLY_VIEWED_KEY);

    if (storedRecentlyViewed) {
      setRecentlyViewed(JSON.parse(storedRecentlyViewed));
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

  const persistRecentlyViewed = (items) => {
    setRecentlyViewed(items);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
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

  const addRecentlyViewed = (product) => {
    if (!product?.id) return;

    const nextItems = [
      product,
      ...recentlyViewed.filter((item) => item.id !== product.id)
    ].slice(0, 6);

    persistRecentlyViewed(nextItems);
  };

  return (
    <DemoStoreContext.Provider
      value={{
        cartItems,
        orders,
        recentlyViewed,
        cartCount,
        addToCart,
        addRecentlyViewed,
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
