// central api client — all http calls go through here
// same pattern as services/api.js in Lab 3
//
// every function returns ApiResult<T> — a union type with ok: true or ok: false
// pages check result.ok and handle both cases
// this keeps all the fetch/error handling logic in one place
// if the api url or headers change, we only update this file

import { WorkOrder, PaginatedResult, BulkUploadResult, Status } from '../types/workorder';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export type ApiResult<T> =
  | { ok: true; requestId: string; data: T }
  | { ok: false; requestId: string; error: { code: string; message: string; details?: any[] } };

// base fetch helper — attaches the api key header, parses the response
// returns ApiResult so callers always get a consistent shape back
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY!,
      ...options.headers,
    },
  });

  // 204 No Content — no body to parse (used by DELETE)
  if (res.status === 204) {
    return { ok: true, requestId: 'n/a', data: null as T };
  }

  const json = await res.json();
  if (json.success) return { ok: true, requestId: json.requestId, data: json.data };
  return { ok: false, requestId: json.requestId, error: json.error };
}

export async function listWorkOrders(query: Record<string, string> = {}) {
  const params = new URLSearchParams(query).toString();
  return apiFetch<PaginatedResult<WorkOrder>>(`/api/workorders${params ? `?${params}` : ''}`);
}

export async function getWorkOrder(id: string) {
  return apiFetch<WorkOrder>(`/api/workorders/${id}`);
}

export async function createWorkOrder(payload: Partial<WorkOrder>) {
  return apiFetch<WorkOrder>('/api/workorders', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateWorkOrder(id: string, payload: Partial<WorkOrder>) {
  return apiFetch<WorkOrder>(`/api/workorders/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function changeStatus(id: string, status: Status) {
  return apiFetch<WorkOrder>(`/api/workorders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function deleteWorkOrder(id: string) {
  return apiFetch<null>(`/api/workorders/${id}`, { method: 'DELETE' });
}

export async function bulkUploadCsv(
  file: File,
  signal?: AbortSignal
): Promise<ApiResult<BulkUploadResult>> {
  // FormData for multipart upload — do NOT set Content-Type header manually
  // the browser sets it automatically with the correct boundary string
  // if we set it manually, the boundary won't be there and the server can't parse the file
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE_URL}/api/workorders/bulk-upload`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY! }, // only api key, no Content-Type
    body: form,
    signal,
  });
  const json = await res.json();
  if (json.success) return { ok: true, requestId: json.requestId, data: json.data };
  return { ok: false, requestId: json.requestId, error: json.error };
}
