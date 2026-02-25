// sidebar navigation — links to all main pages
// highlights the active page based on router.pathname
// same sidebar pattern from Lab 3 frontend

import Link from 'next/link';
import { useRouter } from 'next/router';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/workorders', label: 'Work Orders' },
  { href: '/workorders/create', label: 'Create Order' },
  { href: '/data-transfer', label: 'Data Transfer' },
  { href: '/help', label: 'Help' },
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">WorkOrderHub</h1>
        <p className="text-xs text-gray-400 mt-1">Maintenance Management</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          // check if current path starts with the nav item href
          // special case: /workorders/create should highlight "Create Order" not "Work Orders"
          const isActive = item.href === '/workorders'
            ? router.pathname === '/workorders' || router.pathname === '/workorders/[id]'
            : router.pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
