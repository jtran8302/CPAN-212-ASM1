// inline error — shows a field-level validation error below a form input
// used in WorkOrderForm to show what's wrong with a specific field

interface InlineErrorProps {
  message?: string;
}

export default function InlineError({ message }: InlineErrorProps) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}
