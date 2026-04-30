import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';
import { useDemoStore } from '../context/DemoStoreContext.jsx';
import { useEffect, useState } from 'react';

function getTrackedOrder(order, now) {
  if (!order) return null;

  if (order.status === 'cancelled') {
    return {
      status: 'cancelled',
      timeline: order.timeline.map((item, index) => ({ ...item, done: index < 2 }))
    };
  }

  const elapsedSeconds = Math.max(0, Math.floor((now - new Date(order.placed_at).getTime()) / 1000));
  const thresholds = [0, 8, 16, 24, 32, 40];
  const doneCount = thresholds.filter((value) => elapsedSeconds >= value).length;
  const timeline = order.timeline.map((item, index) => ({ ...item, done: index < doneCount }));

  let status = 'processing';
  if (doneCount >= 6) status = 'delivered';
  else if (doneCount >= 5) status = 'out for delivery';
  else if (doneCount >= 4) status = 'shipped';
  else if (doneCount >= 3) status = 'packed';
  else if (order.payment_method !== 'cod') status = 'paid';

  return { status, timeline };
}

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const { orders } = useDemoStore();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    return (
      <EmptyState title="Order not found" description="We could not find that order in the demo tracker.">
        <Link to="/orders" className="btn-primary inline-flex items-center justify-center">
          Back to Orders
        </Link>
      </EmptyState>
    );
  }

  const tracked = getTrackedOrder(order, now);

  return (
    <div className="space-y-6">
      <div className="card space-y-4 border border-brand-accent/20 bg-gradient-to-r from-white to-amber-50 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">Track Your Order</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{order.order_number}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Current status: <span className="font-semibold capitalize text-slate-900">{tracked.status}</span>
            </p>
          </div>
          <Link to="/orders" className="btn-secondary">
            View All Orders
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-6">
          {tracked.timeline.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full ${
                    item.done ? 'bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.15)]' : 'bg-slate-300'
                  }`}
                />
                <p className={`text-sm font-medium ${item.done ? 'text-slate-900' : 'text-slate-400'}`}>{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {order.address && (
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Delivery Address</p>
          <p className="mt-2 font-semibold text-slate-900">{order.address.fullName}</p>
          <p className="text-sm text-slate-600">{order.address.line1}</p>
          <p className="text-sm text-slate-600">
            {order.address.city}, {order.address.state} {order.address.postalCode}
          </p>
        </div>
      )}

      <div className="card p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Placed At</p>
            <p className="font-semibold">{new Date(order.placed_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Payment</p>
            <p className="font-semibold uppercase">{order.payment_method}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Customer</p>
            <p className="font-semibold">{order.customer_name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
            <p className="font-semibold">Rs. {order.total_amount}</p>
          </div>
        </div>

        <div className="mt-5 space-y-2 text-sm text-slate-600">
          {order.items.map((item) => (
            <div key={`${order.id}-${item.product_id}`} className="flex justify-between border-b border-slate-100 pb-2 last:border-0">
              <span>{item.title} x {item.quantity}</span>
              <span>Rs. {item.line_total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
