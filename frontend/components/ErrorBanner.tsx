// error banner — shows error message and requestId from the backend
// dismissable — user can click X to close it
// only renders when there's an error to show
// same pattern as the error display in Lab 3 frontend

interface ErrorBannerProps {
  message: string;
  requestId?: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, requestId, onDismiss }: ErrorBannerProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded p-4 mb-4 flex items-start justify-between">
      <div>
        <p className="text-red-800 font-medium">{message}</p>
        {requestId && (
          <p className="text-red-600 text-xs mt-1">Request ID: {requestId}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-600 ml-4 text-lg leading-none"
      >
        &times;
      </button>
    </div>
  );
}
