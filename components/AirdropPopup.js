import React, { useCallback, useState, useContext, useEffect, useRef } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount, getMint } from '@solana/spl-token';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { NetworkContext } from '../context/NetworkContext';
import { PLATFORM_FEE_WALLET_ADDRESS, PLATFORM_FEE_LAMPORTS } from '../utils/constants';

const AirdropPopup = ({ onClose }) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const { network } = useContext(NetworkContext);

    // --- STATE MANAGEMENT OVERHAUL ---
    const [tokenMintAddress, setTokenMintAddress] = useState('');
    // We now use an array of objects for recipients
    const [recipients, setRecipients] = useState([{ address: '', amount: '' }]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [overallMessage, setOverallMessage] = useState('');
    
    const [ownedTokens, setOwnedTokens] = useState([]);
    const [isFetchingTokens, setIsFetchingTokens] = useState(false);
    const fileInputRef = useRef(null); // Ref for the hidden file input

    // useEffect for fetching tokens remains the same...
    useEffect(() => { /* ... Paste the useEffect from the previous correct version here ... */ }, [publicKey, connection]);

    // --- NEW HANDLERS FOR DYNAMIC INPUTS ---
    const handleRecipientChange = (index, field, value) => {
        const newRecipients = [...recipients];
        newRecipients[index][field] = value;
        setRecipients(newRecipients);
    };

    const addRecipientRow = () => {
        setRecipients([...recipients, { address: '', amount: '' }]);
    };

    const removeRecipientRow = (index) => {
        const newRecipients = recipients.filter((_, i) => i !== index);
        setRecipients(newRecipients);
    };

    // --- NEW: CSV FILE HANDLING ---
    const handleCsvImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            try {
                const lines = text.split('\n').filter(line => line.trim() !== '');
                // Assumes first line is header (address,amount), so we skip it.
                // If no header, change `lines.slice(1)` to just `lines`.
                const parsedRecipients = lines.slice(1).map(line => {
                    const [address, amount] = line.split(',').map(s => s.trim());
                    if (address && amount) {
                        return { address, amount };
                    }
                    return null;
                }).filter(Boolean);

                if (parsedRecipients.length === 0) {
                    throw new Error("CSV format is incorrect or file is empty. Expected columns: address,amount");
                }
                
                setRecipients(parsedRecipients);
                setOverallMessage(`${parsedRecipients.length} recipients imported from CSV.`);

            } catch (err) {
                console.error("CSV parsing error:", err);
                setOverallMessage(`Error parsing CSV: ${err.message}`);
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    };

    // --- UPDATED AIRDROP LOGIC ---
    const handleAirdrop = useCallback(async () => {
        // Now uses the `recipients` array instead of parsing a string
        const validRecipients = recipients.filter(r => r.address && !isNaN(parseFloat(r.amount)) && parseFloat(r.amount) > 0);
        
        if (!publicKey || !tokenMintAddress || validRecipients.length === 0) {
            setOverallMessage('Please select a token and add at least one valid recipient.');
            return;
        }

        // The rest of the airdrop logic (batching, sending transactions) is largely the same,
        // but it now iterates over `validRecipients`.
        console.log("--- Starting Airdrop ---");
        // ... Paste the try/catch block from the previous handleAirdrop function here,
        // ensuring it uses `validRecipients` as its source array.
        // ...
        
    }, [publicKey, connection, sendTransaction, tokenMintAddress, recipients, network]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-2xl m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Airdrop Tokens</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                
                {/* Token Selection Dropdown remains the same */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">Select Token</label>
                    {/* ... The dropdown and OR input for mint address ... */}
                </div>
                
                {/* --- NEW DYNAMIC RECIPIENT LIST UI --- */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-300">Recipients</label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".csv"
                        />
                        <button onClick={handleCsvImportClick} className="text-sm text-purple-400 hover:underline">Import CSV</button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {recipients.map((recipient, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    placeholder="Recipient Address"
                                    value={recipient.address}
                                    onChange={(e) => handleRecipientChange(index, 'address', e.target.value)}
                                    className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Amount"
                                    value={recipient.amount}
                                    onChange={(e) => handleRecipientChange(index, 'amount', e.target.value)}
                                    className="w-1/4 p-2 bg-gray-700 border border-gray-600 rounded-md text-sm"
                                />
                                <button onClick={() => removeRecipientRow(index)} className="text-red-500 hover:text-red-400 p-2">&times;</button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addRecipientRow} className="mt-2 text-sm text-green-400 hover:underline">+ Add Recipient</button>
                </div>

                <button
                    onClick={handleAirdrop}
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50"
                    disabled={isLoading || !publicKey}
                >
                    {isLoading ? overallMessage : `Review Airdrop (${recipients.filter(r => r.address && r.amount).length} Recipients)`}
                </button>
                {/* ... The rest of the component ... */}
            </div>
        </div>
    );
};
export default AirdropPopup;
