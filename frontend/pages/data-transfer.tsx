// data transfer page — bulk upload CSV files to create work orders
// CsvUpload component handles file selection and upload
// UploadResult shows the results after upload completes
// always shows requestId from the response

import { useState } from 'react';
import CsvUpload from '../components/CsvUpload';
import UploadResult from '../components/UploadResult';
import ErrorBanner from '../components/ErrorBanner';
import { BulkUploadResult } from '../types/workorder';
import { ApiResult } from '../services/api';

export default function DataTransferPage() {
  const [result, setResult] = useState<{ data: BulkUploadResult; requestId: string } | null>(null);
  const [error, setError] = useState<{ message: string; requestId: string } | null>(null);

  const handleResult = (apiResult: ApiResult<BulkUploadResult>) => {
    if (apiResult.ok) {
      setResult({ data: apiResult.data, requestId: apiResult.requestId });
      setError(null);
    } else {
      setError({ message: apiResult.error.message, requestId: apiResult.requestId });
      setResult(null);
    }
  };

  const handleError = (message: string, requestId: string) => {
    setError({ message, requestId });
    setResult(null);
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

      <CsvUpload onResult={handleResult} onError={handleError} />

      {result && (
        <UploadResult result={result.data} requestId={result.requestId} />
      )}
    </div>
  );
}
