import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';
import { useDemoStore } from '../context/DemoStoreContext.jsx';

function getTrackedOrder(order, now) {
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

export default function OrdersPage() {
  const { orders, cancelOrder, reorderOrder } = useDemoStore();
  const [now, setNow] = useState(Date.now());
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeOrderId, setActiveOrderId] = useState(searchParams.get('track') || '');

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const trackedOrderId = searchParams.get('track') || '';
    setActiveOrderId(trackedOrderId || orders[0]?.id || '');
  }, [orders, searchParams]);

  if (!orders.length) {
    return <EmptyState title="No orders yet" description="Placed orders will appear here." />;
  }

  const handleDownloadInvoice = (order) => {
    const lines = [
      `Invoice for ${order.order_number}`,
      `Customer: ${order.customer_name}`,
      `Payment: ${order.payment_method}`,
      `Total: Rs. ${order.total_amount}`,
      '',
      ...order.items.map((item) => `- ${item.title} x${item.quantity} = Rs. ${item.line_total}`)
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${order.order_number}-invoice.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeOrder =
    orders.find((order) => order.id === activeOrderId) ||
    orders[0];

  const activeTracked = activeOrder ? getTrackedOrder(activeOrder, now) : null;

  const handleTrackOrder = (orderId) => {
    setActiveOrderId(orderId);
    setSearchParams({ track: orderId });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-slate-900">Your Orders</h1>
      {activeOrder && activeTracked && (
        <div className="card space-y-4 border border-brand-accent/20 bg-gradient-to-r from-white to-amber-50 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">Track Your Order</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">{activeOrder.order_number}</h2>
              <p className="mt-1 text-sm text-slate-600">
                Current status: <span className="font-semibold capitalize text-slate-900">{activeTracked.status}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTrackOrder(activeOrder.id)}
              className="btn-primary"
            >
              Track Order
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-6">
            {activeTracked.timeline.map((item) => (
              <div key={`active-${item.label}`} className="rounded-2xl border border-slate-200 bg-white p-3">
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
      )}
      {orders.map((order) => {
        const tracked = getTrackedOrder(order, now);

        return (
          <div
            key={order.id}
            className={`card space-y-5 p-5 ${
              order.id === activeOrderId ? 'ring-2 ring-brand-accent/30' : ''
            }`}
          >
            <div className="grid gap-4 md:grid-cols-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Order</p>
                <p className="font-semibold">{order.order_number}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                <p className="font-semibold capitalize">{tracked.status}</p>
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

            {order.address && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Delivery Address</p>
                <p className="font-semibold text-slate-900">{order.address.fullName}</p>
                <p>{order.address.line1}</p>
                <p>
                  {order.address.city}, {order.address.state} {order.address.postalCode}
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Tracking timeline</p>
              <div className="grid gap-3 md:grid-cols-6">
                {tracked.timeline.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        item.done ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    <span className={`text-sm ${item.done ? 'text-slate-900' : 'text-slate-400'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.product_id}`} className="flex justify-between">
                  <span>{item.title} x {item.quantity}</span>
                  <span>Rs. {item.line_total}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => handleTrackOrder(order.id)} className="btn-primary">
                Track Order
              </button>
              <button onClick={() => reorderOrder(order.id)} className="btn-secondary">
                Reorder
              </button>
              <button
                onClick={() => handleDownloadInvoice(order)}
                className="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700"
              >
                Download Invoice
              </button>
              {tracked.status !== 'cancelled' && tracked.status !== 'delivered' && (
                <button
                  onClick={() => cancelOrder(order.id)}
                  className="rounded-xl border border-red-200 px-4 py-2 font-medium text-red-600"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
