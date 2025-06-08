import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const TokenMetadataPopup = ({ metadataUri, mintAddress, onClose }) => {
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!metadataUri) return;
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(metadataUri);
        if (!response.ok) {
          throw new Error('Failed to fetch metadata from IPFS.');
        }
        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        console.error(err);
        setError('Could not load token metadata.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetadata();
  }, [metadataUri]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-400">Token Created!</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        {isLoading && <div className="text-center p-8">Loading token metadata...</div>}
        {error && <div className="text-center p-8 text-red-400">{error}</div>}
        {metadata && (
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-4 bg-gray-700 p-3 rounded-lg">
                <Image 
                    src={metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
                    alt={metadata.name}
                    width={80}
                    height={80}
                    className="rounded-full"
                    unoptimized
                />
                <div>
                    <h3 className="text-2xl font-bold">{metadata.name}</h3>
                    <p className="text-lg text-gray-400">{metadata.symbol}</p>
                </div>
            </div>
            <div>
                <p className="font-semibold text-gray-400">Description:</p>
                <p>{metadata.description}</p>
            </div>
             <div>
                <p className="font-semibold text-gray-400">Mint Address:</p>
                <code className="bg-gray-900 p-2 rounded w-full block break-all text-xs">{mintAddress}</code>
            </div>
          </div>
        )}
        <div className="flex space-x-4 mt-6">
            <a href={`https://solscan.io/token/${mintAddress}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center">View on Solscan</a>
            <a href={metadataUri} target="_blank" rel="noopener noreferrer" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-center">View Raw Metadata</a>
        </div>
        <button onClick={onClose} className="mt-4 w-full bg-gray-600 hover:bg-gray-700 p-2 rounded">Close</button>
      </div>
    </div>
  );
};
export default TokenMetadataPopup;