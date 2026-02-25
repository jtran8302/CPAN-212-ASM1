// reusable work order form — used on both create and edit pages
// validates fields client-side before calling the API
// on create: all fields required. on edit: only changed fields sent
// department is only editable on create — on edit it's locked

import { useState } from 'react';
import InlineError from './InlineError';
import { WorkOrder, Department, Priority } from '../types/workorder';

interface WorkOrderFormProps {
  initialData?: Partial<WorkOrder>;
  onSubmit: (data: Partial<WorkOrder>) => Promise<void>;
  isEdit?: boolean;
}

const DEPARTMENTS: Department[] = ['FACILITIES', 'IT', 'SECURITY', 'HR'];
const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

export default function WorkOrderForm({ initialData = {}, onSubmit, isEdit = false }: WorkOrderFormProps) {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [department, setDepartment] = useState<Department>(initialData.department || 'FACILITIES');
  const [priority, setPriority] = useState<Priority>(initialData.priority || 'MEDIUM');
  const [requesterName, setRequesterName] = useState(initialData.requesterName || '');
  const [assignee, setAssignee] = useState(initialData.assignee || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // client-side validation — mirrors the backend validation rules
  // we validate here too so the user gets instant feedback before a round trip
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title || title.length < 5) errs.title = 'Minimum 5 characters';
    if (!description || description.length < 10) errs.description = 'Minimum 10 characters';
    if (!isEdit && !DEPARTMENTS.includes(department)) errs.department = 'Select a department';
    if (!PRIORITIES.includes(priority)) errs.priority = 'Select a priority';
    if (!isEdit && (!requesterName || requesterName.length < 3)) errs.requesterName = 'Minimum 3 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const data: Partial<WorkOrder> = { title, description, priority, assignee: assignee || undefined };
      // only include department and requesterName on create — not editable after creation
      if (!isEdit) {
        data.department = department;
        data.requesterName = requesterName;
      }
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Short title for the work order"
        />
        <InlineError message={errors.title} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Detailed description of what needs to be done"
        />
        <InlineError message={errors.description} />
      </div>

      {/* department is only shown on create — can't change it after */}
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value as Department)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <InlineError message={errors.department} />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <InlineError message={errors.priority} />
      </div>

      {/* requester name only on create — can't change who requested it */}
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Requester Name</label>
          <input
            type="text"
            value={requesterName}
            onChange={(e) => setRequesterName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Who is requesting this work?"
          />
          <InlineError message={errors.requesterName} />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assignee (optional)</label>
        <input
          type="text"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Who should work on this?"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? 'Saving...' : isEdit ? 'Update Work Order' : 'Create Work Order'}
      </button>
    </form>
  );
}
