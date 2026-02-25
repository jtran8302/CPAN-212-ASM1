// top bar — shows the current page title based on router path
// keeps the UI clean by always telling the user where they are

import { useRouter } from 'next/router';

// maps routes to human-readable page titles
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/workorders': 'Work Orders',
  '/workorders/create': 'Create Work Order',
  '/workorders/[id]': 'Work Order Details',
  '/data-transfer': 'Data Transfer',
  '/help': 'Help & Reference',
};

export default function Topbar() {
  const router = useRouter();
  const title = pageTitles[router.pathname] || 'WorkOrderHub';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    </header>
  );
}
