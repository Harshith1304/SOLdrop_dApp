import React, { useCallback, useState, useContext, useEffect } from 'react';
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

    const [tokenMintAddress, setTokenMintAddress] = useState('');
    const [recipientData, setRecipientData] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [overallMessage, setOverallMessage] = useState('');
    const [processedRecipients, setProcessedRecipients] = useState([]);
    
    const [ownedTokens, setOwnedTokens] = useState([]);
    const [isFetchingTokens, setIsFetchingTokens] = useState(false);

    useEffect(() => {
        const fetchOwnedTokens = async () => {
            if (!publicKey) return;

            setIsFetchingTokens(true);
            try {
                const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                    programId: TOKEN_PROGRAM_ID,
                });

                const fungibleTokens = tokenAccounts.value.filter(account => {
                    const amount = account.account.data.parsed.info.tokenAmount;
                    return amount.decimals > 0 && Number(amount.uiAmount) > 0;
                });
                
                const tokenDataPromises = fungibleTokens.map(async (acc) => {
                    const mintAddress = acc.account.data.parsed.info.mint;
                    const mintPublicKey = new PublicKey(mintAddress);
                    let tokenName = 'Unknown Token';
                    let tokenSymbol = mintAddress.slice(0, 4) + '...';

                    try {
                        const metadataPDA = await Metadata.getPDA(mintPublicKey);
                        const metadataAccount = await connection.getAccountInfo(metadataPDA);
                        if (metadataAccount) {
                            const metadata = await Metadata.fromAccountAddress(connection, metadataPDA);
                            tokenName = metadata.data.name.replace(/\0/g, '');
                            tokenSymbol = metadata.data.symbol.replace(/\0/g, '');
                        }
                    } catch (e) {
                        console.warn(`Could not fetch metadata for mint ${mintAddress}:`, e);
                    }
                    
                    return {
                        name: tokenName,
                        symbol: tokenSymbol,
                        mint: mintAddress,
                        balance: acc.account.data.parsed.info.tokenAmount.uiAmountString,
                    };
                });

                const settledTokenData = await Promise.all(tokenDataPromises);
                setOwnedTokens(settledTokenData);

            } catch (error) {
                console.error("Failed to fetch owned tokens:", error);
                setOverallMessage("Error: Could not fetch your tokens.");
            } finally {
                setIsFetchingTokens(false);
            }
        };

        fetchOwnedTokens();
    }, [publicKey, connection]);

    const handleAirdrop = useCallback(async () => {
        if (!publicKey || !tokenMintAddress || !recipientData) {
            setOverallMessage('Please fill in all fields.');
            return;
        }

        console.log("--- Starting Airdrop ---");
        setIsLoading(true);
        setOverallMessage('Starting airdrop...');
        setProcessedRecipients([]);

        try {
            const mintPublicKey = new PublicKey(tokenMintAddress);
            console.log("Fetching mint info for:", mintPublicKey.toBase58());
            const mintInfo = await getMint(connection, mintPublicKey);
            const decimals = mintInfo.decimals;

            const recipients = recipientData.split('\n').map(line => {
                const [address, amount] = line.split(',').map(s => s.trim());
                if (!address || isNaN(parseFloat(amount))) return null;
                return { address, amount: parseFloat(amount) };
            }).filter(r => r !== null);

            if (recipients.length === 0) {
                throw new Error("No valid recipients found in the data.");
            }
            console.log(`Found ${recipients.length} valid recipients.`);
            
            const sourceATA = await getAssociatedTokenAddress(mintPublicKey, publicKey);
            console.log("Sender's Token Account (ATA):", sourceATA.toBase58());

            const transactions = [];
            let currentTransaction = new Transaction();
            const recipientsPerTx = 10; // Batching to avoid oversized transactions

            for (let i = 0; i < recipients.length; i++) {
                const recipient = recipients[i];
                setOverallMessage(`Processing recipient ${i + 1}/${recipients.length}...`);
                console.log(`Processing ${recipient.address} for ${recipient.amount} tokens.`);

                const recipientPublicKey = new PublicKey(recipient.address);
                const destinationATA = await getAssociatedTokenAddress(mintPublicKey, recipientPublicKey);

                const destinationAccountInfo = await connection.getAccountInfo(destinationATA);
                if (!destinationAccountInfo) {
                    console.log(`Recipient ${recipient.address} does not have a token account. Creating one.`);
                    currentTransaction.add(
                        createAssociatedTokenAccountInstruction(publicKey, destinationATA, recipientPublicKey, mintPublicKey)
                    );
                }
                
                currentTransaction.add(
                    createTransferInstruction(
                        sourceATA,
                        destinationATA,
                        publicKey,
                        BigInt(recipient.amount * Math.pow(10, decimals))
                    )
                );

                if ((i + 1) % recipientsPerTx === 0 || i === recipients.length - 1) {
                    transactions.push(currentTransaction);
                    currentTransaction = new Transaction();
                }
            }

            if (network === 'mainnet-beta' && transactions.length > 0) {
                if (PLATFORM_FEE_WALLET_ADDRESS === "YOUR_WALLET_ADDRESS_HERE" || !PLATFORM_FEE_WALLET_ADDRESS) {
                     throw new Error("Fee recipient address is not configured in utils/constants.js");
                }
                const feeRecipient = new PublicKey(PLATFORM_FEE_WALLET_ADDRESS);
                // Add fee to the first transaction only
                transactions[0].instructions.unshift(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: feeRecipient, lamports: PLATFORM_FEE_LAMPORTS }));
            }
            
            console.log(`Sending ${transactions.length} transaction(s) in total.`);
            setOverallMessage(`Awaiting approval for ${transactions.length} transaction(s)...`);

            const signedTransactions = await sendTransaction(transactions, connection);
            
            setOverallMessage('Transactions sent! Confirming...');
            for (const signature of signedTransactions) {
                await connection.confirmTransaction(signature, 'confirmed');
                console.log("Confirmed transaction:", signature);
            }

            setOverallMessage('Airdrop completed successfully!');
            setProcessedRecipients(recipients.map(r => ({ ...r, status: 'Success' })));

        } catch (error) {
            console.error('Airdrop failed:', error);
            setOverallMessage(`Airdrop failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [publicKey, connection, sendTransaction, tokenMintAddress, recipientData, network]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-xl m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Airdrop Tokens</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Select Token from Wallet or Enter Address</label>
                        <div className="flex items-center space-x-2 mt-1">
                            <select
                                onChange={(e) => setTokenMintAddress(e.target.value)}
                                disabled={isFetchingTokens || ownedTokens.length === 0}
                                className="w-1/2 p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white disabled:opacity-50"
                            >
                                <option value="">{isFetchingTokens ? "Loading your tokens..." : "Select a token"}</option>
                                {ownedTokens.map((token) => (
                                    <option key={token.mint} value={token.mint}>
                                        {token.name} ({token.symbol}) - Bal: {token.balance}
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

                {network === 'mainnet-beta' && (
                    <div className="mt-4 p-2 text-center text-xs rounded bg-yellow-900 text-yellow-200">
                        A platform fee of <strong>{PLATFORM_FEE_LAMPORTS / LAMPORTS_PER_SOL} SOL</strong> will be applied on Mainnet.
                    </div>
                )}
                
                <button onClick={handleAirdrop} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50" disabled={isLoading || !publicKey}>
                    {isLoading ? overallMessage : 'Start Airdrop'}
                </button>
                
                {overallMessage && !isLoading && (
                    <div className="mt-4 p-2 text-center text-sm rounded bg-gray-700">
                        <p>{overallMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default AirdropPopup;