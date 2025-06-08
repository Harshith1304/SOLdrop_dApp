import React from 'react';

const HowToUseStep = () => {
    return (
        <div className="text-center my-16">
            <h2 className="text-3xl font-bold mb-8 text-white">How SOLdrop Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <div className="text-purple-400 text-3xl font-bold mb-2">Step 1</div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Connect Wallet</h3>
                    <p className="text-gray-400">Connect your Solana wallet (like Phantom or Solflare) to the Devnet network.</p>
                </div>
                 <div className="bg-gray-800 p-6 rounded-lg">
                    <div className="text-blue-400 text-3xl font-bold mb-2">Step 2</div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Create Token</h3>
                    <p className="text-gray-400">Click "Create Token", fill in the details like name, symbol, and supply, and approve the transaction.</p>
                </div>
                 <div className="bg-gray-800 p-6 rounded-lg">
                    <div className="text-green-400 text-3xl font-bold mb-2">Step 3</div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Airdrop!</h3>
                    <p className="text-gray-400">Click "Airdrop", enter your new token's mint address, and provide a list of recipients and amounts.</p>
                </div>
            </div>
        </div>
    );
};

export default HowToUseStep;