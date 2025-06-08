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
                <Link href="/inspector" legacyBehavior>
                    <a className="text-sm text-gray-300 hover:text-white transition">Inspector</a>
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
                    <select
                        value={network}
                        onChange={(e) => setNetwork(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {Object.keys(networks).map((net) => (
                            <option key={net} value={net}>
                                {networks[net].name}
                            </option>
                        ))}
                    </select>
                </div>
                <WalletMultiButton style={{ backgroundColor: '#6d28d9', fontSize: '14px', height: '38px' }} />
            </nav>
        </header>
    );
};
export default Header;