import { useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { applyProductImageFallback, PRODUCT_FALLBACK_IMAGE } from '../utils/images.js';

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart');
      setItems(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.line_total), 0),
    [items]
  );

  const removeItem = async (itemId) => {
    await api.delete(`/cart/${itemId}`);
    fetchCart();
  };

  const placeOrder = async () => {
    await api.post('/orders/place', { paymentMethod: 'cod' });
    fetchCart();
  };

  if (loading) return <Loader text="Loading cart..." />;
  if (!items.length) return <EmptyState title="Your cart is empty" description="Add a few products to continue." />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="card flex flex-col gap-4 p-5 sm:flex-row">
            <img
              src={item.primary_image || PRODUCT_FALLBACK_IMAGE}
              alt={item.title}
              onError={applyProductImageFallback}
              className="h-28 w-28 rounded-2xl object-cover"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-500">Quantity: {item.quantity}</p>
              <p className="mt-2 text-xl font-bold text-slate-900">Rs. {item.line_total}</p>
            </div>
            <button onClick={() => removeItem(item.id)} className="text-sm font-medium text-red-600">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="card h-fit space-y-4 p-5">
        <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>
        <div className="flex justify-between text-slate-600">
          <span>Items total</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <span>{total >= 1000 ? 'Free' : 'Rs. 99.00'}</span>
        </div>
        <div className="border-t border-slate-200 pt-3 text-lg font-bold text-slate-900">
          Grand total: Rs. {(total >= 1000 ? total : total + 99).toFixed(2)}
        </div>
        <button onClick={placeOrder} className="btn-primary w-full">
          Place Order
        </button>
      </div>
    </div>
  );
}
