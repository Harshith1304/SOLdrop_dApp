import React, { useState, useEffect } from 'react';
import { getTokensFromLocalStorage } from '../utils/tokenStorage';

const PopupLocalStorageToken = ({ onClose }) => {
  const [createdTokens, setCreatedTokens] = useState([]);

  useEffect(() => {
    setCreatedTokens(getTokensFromLocalStorage());
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-lg m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Previously Created Tokens</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {createdTokens.length > 0 ? (
            createdTokens.map((token, index) => (
              <div key={index} className="bg-gray-700 p-3 rounded">
                <p className="font-bold text-lg">{token.name} ({token.symbol})</p>
                <p className="text-xs text-gray-400">Mint Address:</p>
                <code className="text-xs text-purple-300 break-all">{token.mintAddress}</code>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">You haven't created any tokens yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupLocalStorageToken;