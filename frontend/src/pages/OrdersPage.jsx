import { useEffect, useState } from 'react';
import api from '../api/client.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <Loader text="Loading orders..." />;
  if (!orders.length) return <EmptyState title="No orders yet" description="Placed orders will appear here." />;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-slate-900">Your Orders</h1>
      {orders.map((order) => (
        <div key={order.id} className="card grid gap-4 p-5 md:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Order</p>
            <p className="font-semibold">{order.order_number}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
            <p className="font-semibold capitalize">{order.status}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Placed At</p>
            <p className="font-semibold">{new Date(order.placed_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
            <p className="font-semibold">Rs. {order.total_amount}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
