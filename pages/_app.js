import React, { useMemo, useContext } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';

// Import our new Network Provider
import { NetworkProvider, NetworkContext } from '../context/NetworkContext';

import '../styles/globals.css';
require('@solana/wallet-adapter-react-ui/styles.css');


// Create a new component that can access the context
const AppWithProviders = ({ Component, pageProps }) => {
    // Access the endpoint from our NetworkContext
    const { endpoint } = useContext(NetworkContext);
    
    // We don't need the network constant from before, as it's handled by the context
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new TorusWalletAdapter(),
        ],
        [] // Dependency array is now empty
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <Component {...pageProps} />
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}


// The main App component now just wraps everything with the NetworkProvider
function MyApp({ Component, pageProps }) {
  return (
    <NetworkProvider>
        <AppWithProviders Component={Component} pageProps={pageProps} />
    </NetworkProvider>
  )
}

export default MyApp;