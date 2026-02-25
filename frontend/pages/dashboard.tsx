// dashboard page — shows KPI counts by status and a kanban-like board view
// loads all work orders on mount and computes counts client-side
// each work order card is clickable — goes to /workorders/[id]
// if API fails, shows ErrorBanner with the requestId

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listWorkOrders } from '../services/api';
import { WorkOrder, Status } from '../types/workorder';
import ErrorBanner from '../components/ErrorBanner';

// the four statuses shown as columns on the dashboard
const STATUS_COLUMNS: { status: Status; label: string; color: string; bg: string }[] = [
  { status: 'NEW', label: 'New', color: 'text-blue-800', bg: 'bg-blue-50 border-blue-200' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'text-yellow-800', bg: 'bg-yellow-50 border-yellow-200' },
  { status: 'BLOCKED', label: 'Blocked', color: 'text-red-800', bg: 'bg-red-50 border-red-200' },
  { status: 'DONE', label: 'Done', color: 'text-green-800', bg: 'bg-green-50 border-green-200' },
];

export default function Dashboard() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [error, setError] = useState<{ message: string; requestId: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      // try/catch is needed because fetch itself can throw on network errors
      // (connection refused, DNS failure, backend not running, etc.)
      // without this, a thrown error would skip setLoading(false) and the page
      // would hang on "Loading dashboard..." forever with no error message
      try {
        // fetch with a large limit so we get all work orders for the dashboard
        const result = await listWorkOrders({ limit: '1000' });
        if (result.ok) {
          setWorkOrders(result.data.items);
        } else {
          setError({ message: result.error.message, requestId: result.requestId });
        }
      } catch {
        // network-level failure — fetch threw instead of returning a response
        setError({ message: 'Could not reach the backend. Is the server running on port 3001?', requestId: 'n/a' });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // group work orders by status for the columns
  const grouped = STATUS_COLUMNS.map((col) => ({
    ...col,
    orders: workOrders.filter((o) => o.status === col.status),
  }));

  if (loading) {
    return <div className="text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div>
      {error && (
        <ErrorBanner
          message={error.message}
          requestId={error.requestId}
          onDismiss={() => setError(null)}
        />
      )}

      {/* KPI summary cards — one per status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {grouped.map((col) => (
          <div key={col.status} className={`border rounded p-4 ${col.bg}`}>
            <p className={`text-xs font-medium ${col.color} uppercase`}>{col.label}</p>
            <p className="text-3xl font-bold mt-1">{col.orders.length}</p>
          </div>
        ))}
      </div>

      {/* total count */}
      <div className="mb-6 text-sm text-gray-500">
        Total work orders: {workOrders.length}
      </div>

      {/* board view — 4 columns, one per status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {grouped.map((col) => (
          <div key={col.status}>
            <h3 className={`text-sm font-semibold ${col.color} mb-2 uppercase`}>
              {col.label} ({col.orders.length})
            </h3>
            <div className="space-y-2">
              {col.orders.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No work orders</p>
              ) : (
                col.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/workorders/${order.id}`}
                    className="block bg-white border border-gray-200 rounded p-3 hover:shadow-sm transition-shadow"
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">{order.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{order.department} &middot; {order.priority}</p>
                    {order.assignee && (
                      <p className="text-xs text-gray-400 mt-1">Assigned: {order.assignee}</p>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
