import { clusterApiUrl } from '@solana/web3.js';

export const networks = {
    'mainnet-beta': {
        name: 'Mainnet',
        // Use your dedicated RPC URL from .env.local if it exists,
        // otherwise fall back to the public one.
        endpoint: process.env.NEXT_PUBLIC_MAINNET_RPC_HOST || clusterApiUrl('mainnet-beta'),
    },
    'devnet': {
        name: 'Devnet',
        endpoint: clusterApiUrl('devnet'),
    },
    'testnet': {
        name: 'Testnet',
        endpoint: clusterApiUrl('testnet'),
    },
};