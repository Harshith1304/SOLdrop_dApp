import React, { useCallback, useState, useContext } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
    TOKEN_PROGRAM_ID,
    MINT_SIZE,
    createInitializeMintInstruction,
    getMinimumBalanceForRentExemptMint,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createMintToInstruction,
} from '@solana/spl-token';
import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata';
import { uploadMetadataToPinata } from '../utils/pinata';
import { NetworkContext } from '../context/NetworkContext';

// --- Define your fee-receiving wallet address directly here ---
// !!! IMPORTANT: REPLACE THIS WITH YOUR OWN WALLET ADDRESS !!!
const FEE_RECIPIENT_ADDRESS = "YOUR_WALLET_ADDRESS_HERE";

/**
 * Final Popup component for creating a new SPL Token.
 * @param {object} props
 * @param {() => void} props.onClose - Function to close the popup.
 * @param {(data: {mintAddress: string, metadataUri: string}) => void} props.onSuccess - Function to call on successful creation.
 */
const PopupTokenCreator = ({ onClose, onSuccess }) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const { network } = useContext(NetworkContext);

    const [tokenName, setTokenName] = useState('');
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [tokenDescription, setTokenDescription] = useState('');
    const [tokenImage, setTokenImage] = useState(null);
    const [decimals, setDecimals] = useState(9);
    const [supply, setSupply] = useState('1000000');
    
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleCreateToken = useCallback(async () => {
        if (!publicKey || !tokenImage) {
            setMessage('Error: Please connect wallet and select a token image.');
            return;
        }
        setIsLoading(true);
        setMessage('1/4: Uploading metadata to IPFS...');

        try {
            const metadataUri = await uploadMetadataToPinata(tokenImage, tokenName, tokenSymbol, tokenDescription);
            setMessage('2/4: Metadata uploaded. Building transaction...');

            const mintKeypair = Keypair.generate();
            const lamports = await getMinimumBalanceForRentExemptMint(connection);
            const metaplexProgramId = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
            const [metadataAddress] = PublicKey.findProgramAddressSync([Buffer.from("metadata"), metaplexProgramId.toBuffer(), mintKeypair.publicKey.toBuffer()], metaplexProgramId);
            const associatedTokenAccount = await getAssociatedTokenAddress(mintKeypair.publicKey, publicKey);
            
            const transaction = new Transaction().add(
                SystemProgram.createAccount({ fromPubkey: publicKey, newAccountPubkey: mintKeypair.publicKey, space: MINT_SIZE, lamports, programId: TOKEN_PROGRAM_ID }),
                createInitializeMintInstruction(mintKeypair.publicKey, decimals, publicKey, publicKey),
                createCreateMetadataAccountV3Instruction({
                    metadata: metadataAddress,
                    mint: mintKeypair.publicKey,
                    mintAuthority: publicKey,
                    payer: publicKey,
                    updateAuthority: publicKey,
                }, {
                    createMetadataAccountArgsV3: {
                        data: { name: tokenName, symbol: tokenSymbol, uri: metadataUri, sellerFeeBasisPoints: 0, creators: null, collection: null, uses: null },
                        isMutable: true,
                        collectionDetails: null,
                    },
                }),
                createAssociatedTokenAccountInstruction(publicKey, associatedTokenAccount, publicKey, mintKeypair.publicKey),
                createMintToInstruction(mintKeypair.publicKey, associatedTokenAccount, publicKey, BigInt(supply) * (10n ** BigInt(decimals)))
            );

            if (network === 'mainnet-beta') {
                if (FEE_RECIPIENT_ADDRESS === "YOUR_WALLET_ADDRESS_HERE" || !FEE_RECIPIENT_ADDRESS) {
                    throw new Error("Fee recipient address is not configured inside PopupTokenCreator.js");
                }
                const feeRecipient = new PublicKey(FEE_RECIPIENT_ADDRESS);
                transaction.add(
                    SystemProgram.transfer({
                        fromPubkey: publicKey,
                        toPubkey: feeRecipient,
                        lamports: 0.1 * LAMPORTS_PER_SOL,
                    })
                );
            }

            setMessage('3/4: Awaiting wallet signature...');
            const txSignature = await sendTransaction(transaction, connection, { signers: [mintKeypair] });
            
            setMessage('4/4: Confirming transaction...');
            await connection.confirmTransaction(txSignature, 'confirmed');

            onSuccess({
                mintAddress: mintKeypair.publicKey.toBase58(),
                metadataUri: metadataUri,
            });
            onClose();

        } catch (error) {
            setMessage(`Error: ${error.message}`);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [publicKey, connection, sendTransaction, network, onSuccess, onClose, tokenName, tokenSymbol, tokenDescription, tokenImage, decimals, supply]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Create a New Token</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Token Name*</label>
                        <input type="text" value={tokenName} onChange={(e) => setTokenName(e.target.value)} placeholder="e.g. SOLdrop Token" className="mt-1 w-full p-2 bg-gray-700 rounded"/>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Symbol*</label>
                        <input type="text" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())} placeholder="e.g. SLDRP" className="mt-1 w-full p-2 bg-gray-700 rounded"/>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Description</label>
                        <input type="text" value={tokenDescription} onChange={(e) => setTokenDescription(e.target.value)} placeholder="A brief description" className="mt-1 w-full p-2 bg-gray-700 rounded"/>
                     </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Token Image*</label>
                        <input type="file" accept="image/png, image/jpeg, image/gif" onChange={(e) => setTokenImage(e.target.files[0])} className="mt-1 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"/>
                     </div>
                     <div>
                        {/* --- THIS IS THE FIX --- */}
                        <label className="block text-sm font-medium text-gray-300">Decimals*</label>
                        <input type="number" value={decimals} onChange={(e) => setDecimals(parseInt(e.target.value))} className="mt-1 w-full p-2 bg-gray-700 rounded"/>
                     </div>
                     <div>
                        {/* --- THIS IS THE FIX --- */}
                        <label className="block text-sm font-medium text-gray-300">Supply*</label>
                        <input type="text" value={supply} onChange={(e) => setSupply(e.target.value.replace(/[^0-9]/g, ''))} placeholder="e.g. 1000000" className="mt-1 w-full p-2 bg-gray-700 rounded"/>
                     </div>
                </div>

                {network === 'mainnet-beta' && (
                    <div className="mt-4 p-2 text-center text-xs rounded bg-yellow-900 text-yellow-200">
                        A platform fee of <strong>0.1 SOL</strong> will be applied on Mainnet.
                    </div>
                )}

                <button onClick={handleCreateToken} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50" disabled={isLoading || !publicKey}>
                    {isLoading ? message : 'Create Token'}
                </button>

                {message && message.startsWith('Error:') && (
                    <div className="mt-4 p-2 text-center text-sm rounded bg-red-900">
                        <p>{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PopupTokenCreator;