import React from 'react';
import dynamic from 'next/dynamic';

// Import the global CSS file
import '../styles/globals.css';

// --- THIS IS THE KEY ---
// We dynamically import our new provider with SSR turned OFF.
// This ensures it only ever runs in the browser.
const WalletContextProvider = dynamic(() => import('../context/WalletContextProvider'), {
    ssr: false,
});


function MyApp({ Component, pageProps }) {
  return (
    // We wrap our entire app with this single, client-side only provider.
    <WalletContextProvider>
        <Component {...pageProps} />
    </WalletContextProvider>
  )
}

export default MyApp;