// csv upload component — one button does everything: pick file then upload
// the native file input is hidden — clicking the Upload button opens the file picker
// if a file is already selected, clicking Upload sends it to the backend
// this way one button handles both actions, no confusing "Choose File" text
//
// flow: click Upload → file picker opens → select .csv → click Upload again → sends to backend
// after upload: state resets, ready for next file

import { useState, useRef, ChangeEvent } from 'react';
import { bulkUploadCsv, ApiResult } from '../services/api';
import { BulkUploadResult } from '../types/workorder';

interface CsvUploadProps {
  onResult: (result: ApiResult<BulkUploadResult>) => void;
  onError: (message: string, requestId: string) => void;
}

export default function CsvUpload({ onResult, onError }: CsvUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // save the selected file to state when the hidden input fires onChange
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
  };

  // if no file selected yet, open the file picker
  // if a file is already selected, upload it to the backend
  const handleUploadClick = async () => {
    if (!file) {
      // no file yet — trigger the hidden file input to open the picker dialog
      fileInputRef.current?.click();
      return;
    }
    // file exists — send it
    setUploading(true);
    try {
      const result = await bulkUploadCsv(file);
      onResult(result);
    } catch {
      onError('Failed to upload file. Is the backend running?', 'n/a');
    } finally {
      setUploading(false);
      // reset so user can pick a new file for the next upload
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setUploading(false);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white border border-gray-200 rounded p-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Upload CSV File</h3>
      <p className="text-xs text-gray-500 mb-4">
        Select a .csv file with columns: title, description, department, priority, requesterName, assignee
      </p>

      {/* hidden file input — triggered programmatically by the Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        {/* single button: opens file picker if no file, uploads if file is selected */}
        <button
          onClick={handleUploadClick}
          disabled={uploading}
          className="bg-blue-700 text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Uploading...' : file ? `Upload ${file.name}` : 'Select & Upload CSV'}
        </button>
        {file && !uploading && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
