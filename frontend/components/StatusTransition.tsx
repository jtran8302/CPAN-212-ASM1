// status transition component — shows only the allowed next statuses for the current status
// uses ALLOWED_NEXT_STATUSES from types to filter the dropdown options
// the backend is still the authority — if someone somehow sends an invalid transition,
// the backend will reject it with 409. this just makes the UI less confusing

import { useState } from 'react';
import { Status, ALLOWED_NEXT_STATUSES } from '../types/workorder';

interface StatusTransitionProps {
  currentStatus: Status;
  onTransition: (newStatus: Status) => Promise<void>;
}

// maps status to a color for the current status badge
const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  BLOCKED: 'bg-red-100 text-red-800',
  DONE: 'bg-green-100 text-green-800',
};

export default function StatusTransition({ currentStatus, onTransition }: StatusTransitionProps) {
  const allowed = ALLOWED_NEXT_STATUSES[currentStatus];
  const [selected, setSelected] = useState<Status | ''>(allowed[0] || '');
  const [submitting, setSubmitting] = useState(false);

  const handleTransition = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await onTransition(selected);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Status Transition</h3>
      <div className="flex items-center gap-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[currentStatus]}`}>
          {currentStatus.replace('_', ' ')}
        </span>

        {allowed.length > 0 ? (
          <>
            <span className="text-gray-400">&rarr;</span>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value as Status)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
            >
              {allowed.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
            <button
              onClick={handleTransition}
              disabled={submitting || !selected}
              className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Change Status'}
            </button>
          </>
        ) : (
          <span className="text-sm text-gray-500">No further transitions available</span>
        )}
      </div>
    </div>
  );
}
