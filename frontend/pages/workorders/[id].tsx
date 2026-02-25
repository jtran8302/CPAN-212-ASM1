// work order detail page — shows full info, edit form, status transition, and delete
// loads work order by id from the URL param on mount
// sections:
//   1. read-only info (id, department, requester, dates)
//   2. edit form (title, description, priority, assignee)
//   3. StatusTransition component (only shows allowed next statuses)
//   4. delete button with confirmation

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getWorkOrder, updateWorkOrder, changeStatus, deleteWorkOrder } from '../../services/api';
import { WorkOrder, Status } from '../../types/workorder';
import WorkOrderForm from '../../components/WorkOrderForm';
import StatusTransition from '../../components/StatusTransition';
import ErrorBanner from '../../components/ErrorBanner';

export default function WorkOrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [error, setError] = useState<{ message: string; requestId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchOrder = async () => {
    if (!id || typeof id !== 'string') return;
    setLoading(true);
    const result = await getWorkOrder(id);
    if (result.ok) {
      setOrder(result.data);
      setError(null);
    } else {
      setError({ message: result.error.message, requestId: result.requestId });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (router.isReady) fetchOrder();
  }, [id, router.isReady]);

  const handleUpdate = async (data: Partial<WorkOrder>) => {
    if (!id || typeof id !== 'string') return;
    const result = await updateWorkOrder(id, data);
    if (result.ok) {
      setOrder(result.data);
      setError(null);
    } else {
      setError({ message: result.error.message, requestId: result.requestId });
    }
  };

  const handleStatusChange = async (newStatus: Status) => {
    if (!id || typeof id !== 'string') return;
    const result = await changeStatus(id, newStatus);
    if (result.ok) {
      setOrder(result.data);
      setError(null);
    } else {
      setError({ message: result.error.message, requestId: result.requestId });
    }
  };

  const handleDelete = async () => {
    if (!id || typeof id !== 'string') return;
    const result = await deleteWorkOrder(id);
    if (result.ok) {
      router.push('/workorders');
    } else {
      setError({ message: result.error.message, requestId: result.requestId });
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading work order...</div>;
  }

  if (!order) {
    return (
      <div>
        {error && (
          <ErrorBanner
            message={error.message}
            requestId={error.requestId}
            onDismiss={() => setError(null)}
          />
        )}
        <p className="text-gray-500">Work order not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <ErrorBanner
          message={error.message}
          requestId={error.requestId}
          onDismiss={() => setError(null)}
        />
      )}

      {/* read-only info section */}
      <div className="bg-white border border-gray-200 rounded p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Work Order Info</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs">ID</p>
            <p className="font-mono text-xs">{order.id}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Department</p>
            <p>{order.department}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Requester</p>
            <p>{order.requesterName}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Created</p>
            <p>{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Updated</p>
            <p>{new Date(order.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* status transition */}
      <StatusTransition
        currentStatus={order.status}
        onTransition={handleStatusChange}
      />

      {/* edit form — only title, description, priority, assignee are editable */}
      <div className="bg-white border border-gray-200 rounded p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Edit Work Order</h3>
        <WorkOrderForm
          initialData={order}
          onSubmit={handleUpdate}
          isEdit
        />
      </div>

      {/* delete section */}
      <div className="bg-white border border-red-200 rounded p-6">
        <h3 className="text-sm font-medium text-red-700 mb-3">Danger Zone</h3>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700"
          >
            Delete Work Order
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm text-red-700">Are you sure? This cannot be undone.</p>
            <button
              onClick={handleDelete}
              className="bg-red-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-800"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
