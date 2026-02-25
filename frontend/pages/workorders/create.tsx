// create work order page — shows WorkOrderForm with all fields
// on success → redirects to the new work order's detail page
// on error → shows ErrorBanner with error message and requestId

import { useState } from 'react';
import { useRouter } from 'next/router';
import { createWorkOrder } from '../../services/api';
import { WorkOrder } from '../../types/workorder';
import WorkOrderForm from '../../components/WorkOrderForm';
import ErrorBanner from '../../components/ErrorBanner';

export default function CreateWorkOrderPage() {
  const router = useRouter();
  const [error, setError] = useState<{ message: string; requestId: string } | null>(null);

  const handleSubmit = async (data: Partial<WorkOrder>) => {
    const result = await createWorkOrder(data);
    if (result.ok) {
      // redirect to the new work order's detail page
      router.push(`/workorders/${result.data.id}`);
    } else {
      setError({ message: result.error.message, requestId: result.requestId });
    }
  };

  return (
    <div>
      {error && (
        <ErrorBanner
          message={error.message}
          requestId={error.requestId}
          onDismiss={() => setError(null)}
        />
      )}
      <WorkOrderForm onSubmit={handleSubmit} />
    </div>
  );
}
