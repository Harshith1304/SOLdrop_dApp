import React, { useCallback, useState, useContext, useEffect } from 'react'; // Import useEffect
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount, getMint } from '@solana/spl-token';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'; // NEW: Import Metaplex Metadata
import { NetworkContext } from '../context/NetworkContext';
import { PLATFORM_FEE_WALLET_ADDRESS, PLATFORM_FEE_LAMPORTS } from '../utils/constants';

const AirdropPopup = ({ onClose }) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const { network } = useContext(NetworkContext);

    // --- Existing State ---
    const [tokenMintAddress, setTokenMintAddress] = useState('');
    const [recipientData, setRecipientData] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [overallMessage, setOverallMessage] = useState('');
    const [processedRecipients, setProcessedRecipients] = useState([]);

    // --- NEW STATE FOR OWNED TOKENS ---
    const [ownedTokens, setOwnedTokens] = useState([]);
    const [isFetchingTokens, setIsFetchingTokens] = useState(false);

    // --- NEW: useEffect TO FETCH USER'S TOKENS ---
    useEffect(() => {
        const fetchOwnedTokens = async () => {
            if (!publicKey) return;

            setIsFetchingTokens(true);
            try {
                // Get all token accounts for the connected wallet
                const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                    programId: TOKEN_PROGRAM_ID,
                });

                // Filter out accounts with no balance and NFTs
                const fungibleTokens = tokenAccounts.value.filter(account => {
                    const amount = account.account.data.parsed.info.tokenAmount;
                    return amount.decimals > 0 && parseInt(amount.uiAmountString) > 0;
                });
                
                // Fetch metadata for each token to get its name and symbol
                const tokenData = await Promise.all(fungibleTokens.map(async (acc) => {
                    try {
                        const mint = new PublicKey(acc.account.data.parsed.info.mint);
                        const pda = await Metadata.getPDA(mint);
                        const metadata = await Metadata.fromAccountAddress(connection, pda);
                        
                        return {
                            name: metadata.data.name.replace(/\0/g, ''), // Remove null characters
                            symbol: metadata.data.symbol.replace(/\0/g, ''),
                            mint: mint.toBase58(),
                            balance: acc.account.data.parsed.info.tokenAmount.uiAmountString,
                        }
                    } catch (e) {
                        // Could not fetch metadata, use mint address as a fallback
                        console.warn(`Could not fetch metadata for mint ${acc.account.data.parsed.info.mint}: `, e);
                        return {
                            name: 'Unknown Token',
                            symbol: acc.account.data.parsed.info.mint.slice(0, 6) + '...',
                            mint: acc.account.data.parsed.info.mint,
                            balance: acc.account.data.parsed.info.tokenAmount.uiAmountString,
                        };
                    }
                }));

                setOwnedTokens(tokenData);
            } catch (error) {
                console.error("Failed to fetch owned tokens:", error);
                setOverallMessage("Error: Could not fetch your tokens.");
            } finally {
                setIsFetchingTokens(false);
            }
        };

        fetchOwnedTokens();
    }, [publicKey, connection]);


    // handleAirdrop function remains the same...
    const handleAirdrop = useCallback(async () => { /* ... */ }, [/* ... */]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-xl m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Airdrop Tokens</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Select Token from Wallet or Enter Address</label>
                        <div className="flex items-center space-x-2 mt-1">
                            {/* --- NEW: TOKEN DROPDOWN --- */}
                            <select
                                onChange={(e) => setTokenMintAddress(e.target.value)}
                                disabled={isFetchingTokens || ownedTokens.length === 0}
                                className="w-1/2 p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white disabled:opacity-50"
                            >
                                <option value="">{isFetchingTokens ? "Loading your tokens..." : "Select a token"}</option>
                                {ownedTokens.map((token) => (
                                    <option key={token.mint} value={token.mint}>
                                        {token.name} ({token.symbol})
                                    </option>
                                ))}
                            </select>

                            <span className="text-gray-400">OR</span>

                            <input
                                type="text"
                                value={tokenMintAddress}
                                onChange={(e) => setTokenMintAddress(e.target.value)}
                                placeholder="Paste token mint address"
                                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="recipientData" className="block text-sm font-medium text-gray-300">Recipient Data (Address,Amount per line)</label>
                        <textarea
                            id="recipientData"
                            rows={5}
                            value={recipientData}
                            onChange={(e) => setRecipientData(e.target.value)}
                            placeholder={"RecipientPublicKey1,Amount1\nRecipientPublicKey2,Amount2"}
                            className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                            required
                        />
                    </div>
                </div>

                {/* The rest of the component (fee notification, button, status display) remains the same */}
                {/* ... */}
            </div>
        </div>
    );
};

export default AirdropPopup;