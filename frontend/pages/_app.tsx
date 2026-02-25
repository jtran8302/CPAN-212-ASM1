// _app.tsx — wraps every page with the Layout component
// this is where global styles and the sidebar/topbar get applied
// same pattern as Lab 3 — one place for shared UI

import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
