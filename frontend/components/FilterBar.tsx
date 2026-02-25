// filter bar — dropdowns and search input for filtering work orders
// on change → updates URL query params → parent re-fetches with new params
// storing filters in the URL means the page is shareable and bookmarkable

import { useRouter } from 'next/router';

const DEPARTMENTS = ['', 'FACILITIES', 'IT', 'SECURITY', 'HR'];
const PRIORITIES = ['', 'LOW', 'MEDIUM', 'HIGH'];
const STATUSES = ['', 'NEW', 'IN_PROGRESS', 'BLOCKED', 'DONE'];

export default function FilterBar() {
  const router = useRouter();
  const { status, department, priority, assignee, q } = router.query;

  // updates a single query param and pushes to the router
  // resets page to 1 whenever a filter changes — otherwise you might be on page 5
  // with only 2 results after filtering
  const updateFilter = (key: string, value: string) => {
    const newQuery = { ...router.query, [key]: value, page: '1' };
    // remove empty values from the query string to keep URLs clean
    if (!value) delete newQuery[key];
    router.push({ pathname: '/workorders', query: newQuery }, undefined, { shallow: true });
  };

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <select
        value={(status as string) || ''}
        onChange={(e) => updateFilter('status', e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
      >
        <option value="">All Statuses</option>
        {STATUSES.filter(Boolean).map((s) => (
          <option key={s} value={s}>{s.replace('_', ' ')}</option>
        ))}
      </select>

      <select
        value={(department as string) || ''}
        onChange={(e) => updateFilter('department', e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
      >
        <option value="">All Departments</option>
        {DEPARTMENTS.filter(Boolean).map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select
        value={(priority as string) || ''}
        onChange={(e) => updateFilter('priority', e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
      >
        <option value="">All Priorities</option>
        {PRIORITIES.filter(Boolean).map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Assignee..."
        value={(assignee as string) || ''}
        onChange={(e) => updateFilter('assignee', e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 text-sm w-36"
      />

      <input
        type="text"
        placeholder="Search by title..."
        value={(q as string) || ''}
        onChange={(e) => updateFilter('q', e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 text-sm w-48"
      />
    </div>
  );
}
