import React, { createContext, useState, useMemo } from 'react';
import { networks } from '../utils/networkConfig';

export const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
    const [network, setNetwork] = useState('devnet'); // Default to Devnet

    const endpoint = useMemo(() => {
        return networks[network]?.endpoint || networks['devnet'].endpoint;
    }, [network]);

    const value = {
        network,
        setNetwork,
        endpoint,
        networkConfig: networks[network],
    };

    return (
        <NetworkContext.Provider value={value}>
            {children}
        </NetworkContext.Provider>
    );
};