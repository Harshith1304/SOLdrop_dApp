import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useContext } from 'react';
import { NetworkContext } from '../context/NetworkContext';
import { networks } from '../utils/networkConfig';

const Header = ({ openTokenCreator, openAirdrop }) => {
    const { network, setNetwork } = useContext(NetworkContext);

    // --- THIS IS THE FIX FOR BOTH ISSUES ---
    // We create a state 'isMounted' to prevent server-side rendering of client-only components.
    const [isMounted, setIsMounted] = useState(false);

    // This useEffect hook runs only once in the browser after the component mounts.
    useEffect(() => {
        setIsMounted(true);
    }, []);
    // --- END OF FIX ---


    return (
        <header className="bg-gray-800 shadow-lg text-white p-4 flex justify-between items-center">
            <div className="flex items-center">
                <h1 className="text-2xl font-bold text-purple-400">SOLdrop</h1>
            </div>
            <nav className="flex items-center space-x-4">
                <button
                    onClick={openTokenCreator}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                >
                    Create Token
                </button>
                <button
                    onClick={openAirdrop}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                >
                    Airdrop
                </button>

                {/* --- THIS IS ALSO PART OF THE FIX --- */}
                {/* We only render the wallet button and network switcher if isMounted is true. */}
                {/* This guarantees they won't be rendered on the server, avoiding the mismatch. */}
                {isMounted && (
                    <>
                        <div className="ml-4">
                            <select
                                value={network}
                                onChange={(e) => setNetwork(e.target.value)}
                                className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {Object.keys(networks).map((net) => (
                                    <option key={net} value={net}>
                                        {networks[net].name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <WalletMultiButton style={{ backgroundColor: '#6d28d9' }} />
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;