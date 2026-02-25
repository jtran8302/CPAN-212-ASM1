// index page — just redirects to /dashboard
// the real homepage is the dashboard — this avoids a blank page at /

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);
  return null;
}
