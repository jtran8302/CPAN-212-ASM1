// upload result — shows the summary of a bulk upload response
// displays uploadId, strategy, counts, and a table of row-level errors
// the error table shows row number, field name, and reason — matches the backend format

import { BulkUploadResult } from '../types/workorder';

interface UploadResultProps {
  result: BulkUploadResult;
  requestId: string;
}

export default function UploadResult({ result, requestId }: UploadResultProps) {
  return (
    <div className="bg-white border border-gray-200 rounded p-6 mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Upload Results</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-50 rounded p-3">
          <p className="text-xs text-gray-500">Total Rows</p>
          <p className="text-xl font-bold">{result.totalRows}</p>
        </div>
        <div className="bg-green-50 rounded p-3">
          <p className="text-xs text-green-600">Accepted</p>
          <p className="text-xl font-bold text-green-700">{result.accepted}</p>
        </div>
        <div className="bg-red-50 rounded p-3">
          <p className="text-xs text-red-600">Rejected</p>
          <p className="text-xl font-bold text-red-700">{result.rejected}</p>
        </div>
        <div className="bg-blue-50 rounded p-3">
          <p className="text-xs text-blue-600">Strategy</p>
          <p className="text-sm font-medium text-blue-700">{result.strategy}</p>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-2">
        Upload ID: {result.uploadId}
      </div>
      <div className="text-xs text-gray-500 mb-4">
        Request ID: {requestId}
      </div>

      {/* show error table only if there are errors */}
      {result.errors.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-700 mb-2">Errors</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-red-50 text-red-700 text-xs">
                <tr>
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Field</th>
                  <th className="px-3 py-2">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {result.errors.map((err, i) => (
                  <tr key={i} className="text-xs">
                    <td className="px-3 py-2 text-gray-700">{err.row}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">{err.field}</td>
                    <td className="px-3 py-2 text-red-600">{err.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
