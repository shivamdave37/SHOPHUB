import EmptyState from '../components/common/EmptyState.jsx';
import { useDemoStore } from '../context/DemoStoreContext.jsx';

export default function OrdersPage() {
  const { orders } = useDemoStore();
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
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Payment</p>
            <p className="font-semibold uppercase">{order.payment_method}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
