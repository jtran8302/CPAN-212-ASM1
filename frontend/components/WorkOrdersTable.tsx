// work orders table — displays a list of work orders with key columns
// each row links to the detail page for that work order
// status gets a color badge so you can scan the list quickly

import Link from 'next/link';
import { WorkOrder } from '../types/workorder';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
}

// maps status to tailwind color classes for the badge
const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  BLOCKED: 'bg-red-100 text-red-800',
  DONE: 'bg-green-100 text-green-800',
};

// maps priority to tailwind color classes
const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-orange-100 text-orange-700',
  HIGH: 'bg-red-100 text-red-700',
};

export default function WorkOrdersTable({ workOrders }: WorkOrdersTableProps) {
  if (workOrders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No work orders found. Try adjusting your filters or create a new one.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Assignee</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {workOrders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs text-gray-500">
                {/* show first 8 chars of the uuid — enough to identify it */}
                {order.id.substring(0, 8)}...
              </td>
              <td className="px-4 py-3 font-medium text-gray-900">{order.title}</td>
              <td className="px-4 py-3">{order.department}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[order.priority]}`}>
                  {order.priority}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.status]}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">{order.assignee || '—'}</td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/workorders/${order.id}`}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
