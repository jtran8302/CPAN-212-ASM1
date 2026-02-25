// type definitions for all work order related data
// shared across pages and components — import from here instead of redefining
// ALLOWED_NEXT_STATUSES is used by the frontend to show only valid next transitions
// the backend still validates — this is just so the dropdown doesn't show invalid options

export type Department = 'FACILITIES' | 'IT' | 'SECURITY' | 'HR';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Status = 'NEW' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  department: Department;
  priority: Priority;
  status: Status;
  requesterName: string;
  assignee?: string | null;
  createdAt: string;
  updatedAt: string;
}

// mirrors the backend ALLOWED_TRANSITIONS — used to filter the status dropdown
// backend is still the authority, this just makes the UI less confusing
export const ALLOWED_NEXT_STATUSES: Record<Status, Status[]> = {
  NEW: ['IN_PROGRESS'],
  IN_PROGRESS: ['BLOCKED', 'DONE'],
  BLOCKED: ['IN_PROGRESS'],
  DONE: [],
};

export interface BulkUploadResult {
  uploadId: string;
  strategy: string;
  totalRows: number;
  accepted: number;
  rejected: number;
  errors: Array<{ row: number; field: string; reason: string }>;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}
