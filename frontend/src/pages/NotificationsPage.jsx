import EmptyState from '../components/common/EmptyState.jsx';
import { useDemoStore } from '../context/DemoStoreContext.jsx';

export default function NotificationsPage() {
  const { notifications, markNotificationRead, clearNotifications } = useDemoStore();

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
        {notifications.map((item) => (
          <button
            key={item.id}
            onClick={() => markNotificationRead(item.id)}
            className={`card flex w-full items-start justify-between gap-4 p-4 text-left ${
              item.read ? 'opacity-80' : 'ring-2 ring-amber-200'
            }`}
          >
            <div>
              <p className="font-semibold text-slate-900">{item.message}</p>
              <p className="mt-1 text-sm text-slate-500">
                {new Date(item.created_at).toLocaleString()} · {item.kind}
              </p>
            </div>
            {!item.read && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase text-amber-800">
                New
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
