import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DemoStoreContext = createContext(null);

const CART_KEY = 'shophub_demo_cart';
const SAVED_KEY = 'shophub_demo_saved_for_later';
const ORDERS_KEY = 'shophub_demo_orders';
const RECENTLY_VIEWED_KEY = 'shophub_recently_viewed';
const WISHLIST_KEY = 'shophub_wishlist';
const NOTIFICATIONS_KEY = 'shophub_notifications';
const SEARCH_HISTORY_KEY = 'shophub_search_history';
const ADDRESSES_KEY = 'shophub_addresses';
const PRICE_ALERTS_KEY = 'shophub_price_alerts';
const REVIEWS_KEY = 'shophub_demo_reviews';

export function DemoStoreProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);
  const [orders, setOrders] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [reviews, setReviews] = useState({});

  useEffect(() => {
    const storedCart = localStorage.getItem(CART_KEY);
    const storedSavedItems = localStorage.getItem(SAVED_KEY);
    const storedOrders = localStorage.getItem(ORDERS_KEY);
    const storedWishlist = localStorage.getItem(WISHLIST_KEY);
    const storedNotifications = localStorage.getItem(NOTIFICATIONS_KEY);
    const storedSearchHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
    const storedAddresses = localStorage.getItem(ADDRESSES_KEY);
    const storedPriceAlerts = localStorage.getItem(PRICE_ALERTS_KEY);
    const storedReviews = localStorage.getItem(REVIEWS_KEY);

    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }

    if (storedSavedItems) {
      setSavedForLater(JSON.parse(storedSavedItems));
    }

    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }

    const storedRecentlyViewed = localStorage.getItem(RECENTLY_VIEWED_KEY);

    if (storedRecentlyViewed) {
      setRecentlyViewed(JSON.parse(storedRecentlyViewed));
    }

    if (storedWishlist) {
      setWishlistItems(JSON.parse(storedWishlist));
    }

    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }

    if (storedSearchHistory) {
      setSearchHistory(JSON.parse(storedSearchHistory));
    }

    if (storedAddresses) {
      setAddresses(JSON.parse(storedAddresses));
    }

    if (storedPriceAlerts) {
      setPriceAlerts(JSON.parse(storedPriceAlerts));
    }

    if (storedReviews) {
      setReviews(JSON.parse(storedReviews));
    }
  }, []);

  const persistCart = (items) => {
    setCartItems(items);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  };

  const persistSavedForLater = (items) => {
    setSavedForLater(items);
    localStorage.setItem(SAVED_KEY, JSON.stringify(items));
  };

  const persistOrders = (items) => {
    setOrders(items);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(items));
  };

  const persistRecentlyViewed = (items) => {
    setRecentlyViewed(items);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
  };

  const persistWishlist = (items) => {
    setWishlistItems(items);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  };

  const persistNotifications = (items) => {
    setNotifications(items);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(items));
  };

  const persistSearchHistory = (items) => {
    setSearchHistory(items);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items));
  };

  const persistAddresses = (items) => {
    setAddresses(items);
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(items));
  };

  const persistPriceAlerts = (items) => {
    setPriceAlerts(items);
    localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(items));
  };

  const persistReviews = (items) => {
    setReviews(items);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(items));
  };

  const addNotification = (message, kind = 'info') => {
    const nextItems = [
      {
        id: `notice-${Date.now()}`,
        message,
        kind,
        created_at: new Date().toISOString(),
        read: false
      },
      ...notifications
    ].slice(0, 20);

    persistNotifications(nextItems);
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
      addNotification(`${product.title} quantity was updated in your cart.`, 'cart');
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
    addNotification(`${product.title} was added to your cart.`, 'cart');
  };

  const removeCartItem = (productId) => {
    persistCart(cartItems.filter((item) => item.product_id !== productId));
  };

  const moveToSavedForLater = (productId) => {
    const item = cartItems.find((entry) => entry.product_id === productId);

    if (!item) return;

    persistCart(cartItems.filter((entry) => entry.product_id !== productId));
    persistSavedForLater([item, ...savedForLater.filter((entry) => entry.product_id !== productId)]);
    addNotification(`${item.title} was moved to Save for later.`, 'wishlist');
  };

  const moveSavedToCart = (productId) => {
    const item = savedForLater.find((entry) => entry.product_id === productId);

    if (!item) return;

    persistSavedForLater(savedForLater.filter((entry) => entry.product_id !== productId));
    addToCart(
      {
        id: item.product_id,
        title: item.title,
        price: item.unit_price,
        stock: item.stock,
        primary_image: item.primary_image,
        category_name: item.category_name
      },
      item.quantity
    );
  };

  const removeSavedItem = (productId) => {
    persistSavedForLater(savedForLater.filter((entry) => entry.product_id !== productId));
  };

  const clearCart = () => {
    persistCart([]);
  };

  const addAddress = (address) => {
    const nextAddress = {
      id: `address-${Date.now()}`,
      ...address
    };

    const nextItems = [nextAddress, ...addresses];
    persistAddresses(nextItems);
    addNotification('Delivery address saved for faster checkout.', 'order');
    return nextAddress;
  };

  const setPriceAlert = (product, targetPrice) => {
    const alertValue = Number(targetPrice);
    const nextAlerts = [
      ...priceAlerts.filter((item) => item.product_id !== product.id),
      {
        product_id: product.id,
        title: product.title,
        current_price: Number(product.price),
        target_price: alertValue,
        matched: Number(product.price) <= alertValue
      }
    ];

    persistPriceAlerts(nextAlerts);

    if (Number(product.price) <= alertValue) {
      addNotification(`${product.title} is already at or below your target price.`, 'deal');
    }
  };

  const toggleWishlist = (product) => {
    const exists = wishlistItems.some((item) => item.id === product.id);

    if (exists) {
      persistWishlist(wishlistItems.filter((item) => item.id !== product.id));
      addNotification(`${product.title} was removed from your wishlist.`, 'wishlist');
      return false;
    }

    persistWishlist([product, ...wishlistItems.filter((item) => item.id !== product.id)]);
    addNotification(`${product.title} was added to your wishlist.`, 'wishlist');
    return true;
  };

  const markNotificationRead = (id) => {
    persistNotifications(
      notifications.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const clearNotifications = () => {
    persistNotifications([]);
  };

  const addSearchEntry = (term) => {
    const normalized = term.trim();

    if (!normalized) return;

    const nextItems = [normalized, ...searchHistory.filter((item) => item !== normalized)].slice(0, 8);
    persistSearchHistory(nextItems);
  };

  const clearSearchHistory = () => {
    persistSearchHistory([]);
  };

  const placeOrder = ({ paymentMethod, customerName, addressId, couponCode }) => {
    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.line_total), 0);
    const shippingFee = subtotal >= 1000 ? 0 : 99;
    const discountAmount = couponCode?.trim().toUpperCase() === 'SAVE10' ? Math.min(subtotal * 0.1, 500) : 0;
    const totalAmount = subtotal + shippingFee - discountAmount;
    const selectedAddress = addresses.find((item) => item.id === addressId) || null;
    const newOrder = {
      id: `order-${Date.now()}`,
      order_number: `ORD-${Date.now()}`,
      status: paymentMethod === 'cod' ? 'processing' : 'paid',
      payment_method: paymentMethod,
      customer_name: customerName,
      address: selectedAddress,
      discount_amount: discountAmount.toFixed(2),
      total_amount: totalAmount.toFixed(2),
      placed_at: new Date().toISOString(),
      items: cartItems,
      timeline: [
        { label: 'Order placed', done: true },
        { label: paymentMethod === 'cod' ? 'Cash on delivery confirmed' : 'Payment confirmed', done: true },
        { label: 'Packed', done: true },
        { label: 'Shipped', done: false },
        { label: 'Out for delivery', done: false },
        { label: 'Delivered', done: false }
      ]
    };

    persistOrders([newOrder, ...orders]);
    clearCart();
    addNotification(`Order ${newOrder.order_number} was placed successfully.`, 'order');
    return newOrder;
  };

  const cancelOrder = (orderId) => {
    persistOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'cancelled',
              timeline: order.timeline.map((item, index) =>
                index < 2 ? item : { ...item, done: false }
              )
            }
          : order
      )
    );
    addNotification(`Order ${orderId} was cancelled in demo mode.`, 'order');
  };

  const reorderOrder = (orderId) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;

    persistCart(
      order.items.map((item) => ({
        ...item,
        id: `cart-${item.product_id}`
      }))
    );
    addNotification(`Items from ${order.order_number} were added back to cart.`, 'cart');
  };

  const addReview = ({ productId, name, rating, comment }) => {
    const nextItems = {
      ...reviews,
      [productId]: [
        {
          id: `review-${Date.now()}`,
          name,
          rating,
          comment,
          created_at: new Date().toISOString(),
          verifiedPurchase: orders.some((order) =>
            order.items.some((item) => item.product_id === productId)
          )
        },
        ...(reviews[productId] || [])
      ]
    };

    persistReviews(nextItems);
  };

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity), 0),
    [cartItems]
  );

  const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);
  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
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
        savedForLater,
        orders,
        recentlyViewed,
        wishlistItems,
        notifications,
        searchHistory,
        addresses,
        priceAlerts,
        reviews,
        cartCount,
        wishlistCount,
        unreadNotifications,
        addToCart,
        addRecentlyViewed,
        moveToSavedForLater,
        moveSavedToCart,
        removeSavedItem,
        removeCartItem,
        clearCart,
        placeOrder,
        toggleWishlist,
        addSearchEntry,
        clearSearchHistory,
        addAddress,
        setPriceAlert,
        markNotificationRead,
        clearNotifications,
        cancelOrder,
        reorderOrder,
        addReview
      }}
    >
      {children}
    </DemoStoreContext.Provider>
  );
}

export function useDemoStore() {
  return useContext(DemoStoreContext);
}
