import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from '@solana/wallet-adapter-wallets';
import { NetworkProvider } from './NetworkContext'; // We'll nest the providers

require('@solana/wallet-adapter-react-ui/styles.css');

const WalletContextProvider = ({ children }) => {
    // The network logic is now self-contained within this component
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new TorusWalletAdapter(),
        ],
        []
    );

    return (
        // We wrap the Wallet-related providers with our NetworkProvider
        <NetworkProvider>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </NetworkProvider>
    );
};

// We also need to get the endpoint from the context here
// so we wrap the main provider in a small component to access it.
import { useContext } from 'react';
import { NetworkContext } from './NetworkContext';

const WalletContextProviderWithEndpoint = ({ children }) => {
    const { endpoint } = useContext(NetworkContext);
    
    // We memoize wallets here as well, based on the endpoint, though it's not strictly necessary
    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new TorusWalletAdapter(),
    ], []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}

// The final export will be a component that contains all providers
const FinalWalletProvider = ({children}) => {
    return (
        <NetworkProvider>
            <WalletContextProviderWithEndpoint>
                {children}
            </WalletContextProviderWithEndpoint>
        </NetworkProvider>
    )
}


export default FinalWalletProvider;