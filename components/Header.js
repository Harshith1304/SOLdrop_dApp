import React, { useContext } from 'react';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { NetworkContext } from '../context/NetworkContext';
import { networks } from '../utils/networkConfig';

const Header = ({ openTokenCreator, openAirdrop }) => {
    const { network, setNetwork } = useContext(NetworkContext);

    return (
        <header className="bg-gray-800 shadow-lg text-white p-4 flex justify-between items-center">
            <div className="flex items-center">
                <Link href="/" legacyBehavior>
                    <a className="text-2xl font-bold text-purple-400 hover:opacity-80">SOLdrop</a>
                </Link>
            </div>
            <nav className="flex items-center space-x-2 sm:space-x-4">
                {/* --- THIS IS THE CHANGE --- */}
                <Link href="/metadata" passHref>
                    <a className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out text-sm">
                        Metadata
                    </a>
                </Link>
                
                <button
                    onClick={openTokenCreator}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out text-sm"
                >
                    Create
                </button>
                <button
                    onClick={openAirdrop}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out text-sm"
                >
                    Airdrop
                </button>
                
                <div className="ml-2">
                    {/* ... The select dropdown ... */}
                </div>
                <WalletMultiButton style={{ backgroundColor: '#6d28d9', fontSize: '14px', height: '38px' }} />
            </nav>
        </header>
    );
};

export default Header;
