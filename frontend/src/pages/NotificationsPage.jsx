import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';
import { useDemoStore } from '../context/DemoStoreContext.jsx';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, orders, markNotificationRead, clearNotifications } = useDemoStore();

  const getLinkedOrderId = (message) => {
    const matchedNumber = message.match(/ORD-\d+/)?.[0];
    if (!matchedNumber) return '';

    const matchedOrder = orders.find((order) => order.order_number === matchedNumber);
    return matchedOrder?.id || '';
  };

  const handleNotificationClick = (item) => {
    markNotificationRead(item.id);

    if (item.kind === 'order') {
      const orderId = getLinkedOrderId(item.message);
      if (orderId) {
        navigate(`/orders?track=${encodeURIComponent(orderId)}`);
      }
    }
  };

  if (!notifications.length) {
    return (
      <EmptyState
        title="No notifications yet"
        description="Price alerts, order updates, and shopping reminders will appear here."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-slate-600">Track price alerts, order updates, and shopping reminders.</p>
        </div>
        <button onClick={clearNotifications} className="text-sm font-medium text-brand-accent hover:underline">
          Clear all
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((item) => {
          const orderId = item.kind === 'order' ? getLinkedOrderId(item.message) : '';

          return (
            <div
              key={item.id}
              className={`card flex items-start justify-between gap-4 p-4 ${
                item.read ? 'opacity-80' : 'ring-2 ring-amber-200'
              }`}
            >
              <button onClick={() => handleNotificationClick(item)} className="flex-1 text-left">
                <p className="font-semibold text-slate-900">{item.message}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(item.created_at).toLocaleString()} - {item.kind}
                </p>
              </button>
              <div className="flex flex-col items-end gap-2">
                {orderId && (
                  <button
                    type="button"
                    onClick={() => handleNotificationClick(item)}
                    className="rounded-xl bg-brand-accent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white"
                  >
                    Track
                  </button>
                )}
                {!item.read && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase text-amber-800">
                    New
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
