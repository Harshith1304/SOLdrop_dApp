import React, { useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import Image from 'next/image';

const MetadataView = () => {
    const { connection } = useConnection();
    const [mintAddress, setMintAddress] = useState('');
    const [metadata, setMetadata] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetchMetadata = async () => {
        if (!mintAddress) {
            setError('Please enter a token mint address.');
            return;
        }
        setIsLoading(true);
        setError('');
        setMetadata(null);

        try {
            const mintPublicKey = new PublicKey(mintAddress);
            const metadataPDA = await Metadata.getPDA(mintPublicKey);
            const metadataAccount = await connection.getAccountInfo(metadataPDA);

            if (!metadataAccount) {
                throw new Error("Metadata account not found. This token may not have standard metadata.");
            }

            const metadataFromAccount = await Metadata.fromAccountAddress(connection, metadataPDA);
            
            const uri = metadataFromAccount.data.uri.replace(/\0/g, '');
            if (!uri) throw new Error("Metadata URI is empty.");
            
            const response = await fetch(uri);
            if (!response.ok) {
                throw new Error("Failed to fetch JSON metadata from the URI.");
            }
            const jsonMetadata = await response.json();
            
            setMetadata({
                ...jsonMetadata,
                name: metadataFromAccount.data.name.replace(/\0/g, ''),
                symbol: metadataFromAccount.data.symbol.replace(/\0/g, ''),
                uri: uri,
            });

        } catch (err) {
            console.error(err);
            setError(`Failed to fetch metadata: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="container mx-auto p-4 py-8">
            <div className="max-w-xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-4">SPL Token Inspector</h1>
                <p className="text-gray-400 mb-8">Enter any SPL Token Mint Address to view its on-chain and off-chain metadata.</p>
                <div className="flex space-x-2">
                    <input 
                        type="text"
                        value={mintAddress}
                        onChange={(e) => setMintAddress(e.target.value)}
                        placeholder="Enter Token Mint Address..."
                        className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        onClick={handleFetchMetadata}
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
                    >
                        {isLoading ? 'Loading...' : 'Fetch'}
                    </button>
                </div>
            </div>

            {error && <p className="text-center text-red-400 mt-8">{error}</p>}

            {metadata && (
                <div className="mt-12 max-w-xl mx-auto bg-gray-800 rounded-lg p-6 flex flex-col items-center space-y-4">
                     <Image 
                        src={metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
                        alt={metadata.name}
                        width={128}
                        height={128}
                        className="rounded-full border-4 border-gray-700"
                        unoptimized
                    />
                    <h2 className="text-3xl font-bold">{metadata.name} ({metadata.symbol})</h2>
                    <p className="text-gray-400">{metadata.description}</p>
                    
                    <div className="w-full text-left bg-gray-900 p-4 rounded">
                         <p className="font-semibold text-gray-400">Mint Address:</p>
                         <code className="text-xs text-purple-300 break-all">{mintAddress}</code>
                         <p className="font-semibold text-gray-400 mt-2">Metadata URI:</p>
                         <code className="text-xs text-purple-300 break-all">{metadata.uri}</code>
                    </div>
                </div>
            )}
        </main>
    );
};

export default MetadataView;
