import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

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

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-slate-900">Your Orders</h1>
      {orders.map((order) => {
        const tracked = getTrackedOrder(order, now);

        return (
          <div key={order.id} className="card space-y-5 p-5">
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
