import React from 'react';
import { useConnection } from '@solana/wallet-adapter-react';

const NetworkStatus = () => {
    const { connection } = useConnection();
    const endpoint = connection.rpcEndpoint;
    
    let networkName = 'Unknown';
    let networkColor = 'bg-gray-500';

    if (endpoint.includes('mainnet')) {
        networkName = 'Mainnet';
        networkColor = 'bg-red-500';
    } else if (endpoint.includes('devnet')) {
        networkName = 'Devnet';
        networkColor = 'bg-yellow-500 text-black';
    } else if (endpoint.includes('testnet')) {
        networkName = 'Testnet';
        networkColor = 'bg-blue-500';
    } else if (endpoint.includes('localhost') || endpoint.includes('127.0.0.1')) {
        networkName = 'Localhost';
    }

    return (
        <div className={`ml-4 text-xs font-bold px-2 py-1 rounded-full ${networkColor}`}>
            {networkName}
        </div>
    );
};

export default NetworkStatus;