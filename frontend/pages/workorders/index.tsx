// work orders list page — FilterBar at top, WorkOrdersTable below, pagination at bottom
// all filters and page number are stored in URL query params so the URL is shareable
// re-fetches whenever the URL query changes

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { listWorkOrders } from '../../services/api';
import { WorkOrder } from '../../types/workorder';
import FilterBar from '../../components/FilterBar';
import WorkOrdersTable from '../../components/WorkOrdersTable';
import ErrorBanner from '../../components/ErrorBanner';

export default function WorkOrdersListPage() {
  const router = useRouter();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<{ message: string; requestId: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // current page from query params, defaults to 1
  const page = parseInt((router.query.page as string) || '1');
  const limit = 10;

  useEffect(() => {
    // don't fetch until the router query is ready
    if (!router.isReady) return;

    const fetchData = async () => {
      setLoading(true);
      // pass all query params directly to the API — the backend handles filtering
      const query: Record<string, string> = {};
      for (const [key, value] of Object.entries(router.query)) {
        if (typeof value === 'string' && value) query[key] = value;
      }
      // make sure limit is always set
      if (!query.limit) query.limit = String(limit);

      // try/catch because fetch throws on network errors (backend down, wrong port, etc.)
      // without this the page would show a spinner forever with no error message
      try {
        const result = await listWorkOrders(query);
        if (result.ok) {
          setWorkOrders(result.data.items);
          setTotal(result.data.total);
          setError(null);
        } else {
          setError({ message: result.error.message, requestId: result.requestId });
        }
      } catch {
        setError({ message: 'Could not reach the backend. Is the server running on port 3001?', requestId: 'n/a' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router.query, router.isReady]);

  const totalPages = Math.ceil(total / limit);

  const goToPage = (p: number) => {
    router.push({ pathname: '/workorders', query: { ...router.query, page: String(p) } }, undefined, { shallow: true });
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

      <FilterBar />

      {loading ? (
        <div className="text-gray-500 py-8 text-center">Loading work orders...</div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded">
            <WorkOrdersTable workOrders={workOrders} />
          </div>

          {/* pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
