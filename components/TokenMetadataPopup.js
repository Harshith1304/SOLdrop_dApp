import React from 'react';

const TokenMetadataPopup = ({ metadataUri, mintAddress, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-lg m-4 text-center">
        <h2 className="text-2xl font-bold text-green-400 mb-4">Token Created Successfully!</h2>
        
        <div className="text-left space-y-2">
            <p className="font-semibold">Mint Address:</p>
            <code className="bg-gray-700 p-2 rounded w-full block break-all text-xs">{mintAddress}</code>
            <p className="font-semibold mt-4">Metadata URI:</p>
            <code className="bg-gray-700 p-2 rounded w-full block break-all text-xs">{metadataUri}</code>
        </div>
        
        <div className="flex space-x-4 mt-6">
            <a 
                href={`https://solscan.io/token/${mintAddress}?cluster=devnet`} // Assumes devnet, you can make this dynamic
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center"
            >
              View on Solscan
            </a>
            <a 
                href={metadataUri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-center"
            >
              View Metadata
            </a>
        </div>
        <button onClick={onClose} className="mt-4 w-full bg-gray-600 hover:bg-gray-700 p-2 rounded">
          Close
        </button>
      </div>
    </div>
  );
};

export default TokenMetadataPopup;