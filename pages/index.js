import React, { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Import all the modular components with the correct, consistent names
import Header from '../components/Header';
import AiWaveHero from '../components/AiWaveHero';
import HowToUseStep from '../components/HowToUseStep';
import AITool from '../components/AITool'; // Ensure this matches your filename
import PopupTokenCreator from '../components/PopupTokenCreator';
import AirdropPopup from '../components/AirdropPopup';
import TokenMetadataPopup from '../components/TokenMetadataPopup';

const PopupLocalStorageToken = dynamic(
  () => import('../components/PopupLocalStorageToken'),
  { ssr: false }
);

const Home = () => {
    const [isTokenCreatorOpen, setTokenCreatorOpen] = useState(false);
    const [isAirdropOpen, setAirdropOpen] = useState(false);
    const [isMetadataPopupOpen, setMetadataPopupOpen] = useState(false);
    const [isStoragePopupOpen, setStoragePopupOpen] = useState(false);
    
    const [popupMetadata, setPopupMetadata] = useState({ mintAddress: '', metadataUri: '' });

    const handleCreationSuccess = (data) => {
        setPopupMetadata({
            mintAddress: data.mintAddress,
            metadataUri: data.metadataUri,
        });
        setMetadataPopupOpen(true);
    };

    return (
        <div className="bg-gray-900 min-h-screen">
            <Head>
                <title>SOLdrop - Create and Airdrop Solana Tokens</title>
                <meta name="description" content="The easiest way to create and airdrop SPL tokens on the Solana blockchain." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header 
                openTokenCreator={() => setTokenCreatorOpen(true)}
                openAirdrop={() => setAirdropOpen(true)}
            />

            <main className="container mx-auto p-4 py-8">
                <AiWaveHero />
                <div className="my-16 max-w-4xl mx-auto">
                     <h2 className="text-3xl font-bold text-center mb-8 text-white">
                        Get Started with Our Tools
                     </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Ensure you are using <AITool />, which matches the import */}
                        <AITool
                            title="Token Creator"
                            description="Design and launch your SPL token with a custom name, symbol, and image."
                            buttonText="Launch Creator"
                            onClick={() => setTokenCreatorOpen(true)}
                        />
                        <AITool
                            title="Token Airdropper"
                            description="Distribute any SPL token to a list of wallet addresses seamlessly and efficiently."
                            buttonText="Launch Airdropper"
                            onClick={() => setAirdropOpen(true)}
                        />
                    </div>
                </div>

                <HowToUseStep />

                <div className="text-center mt-16">
                    <button
                        onClick={() => setStoragePopupOpen(true)}
                        className="text-gray-300 underline hover:text-purple-400 transition"
                    >
                        View tokens you've created on this device
                    </button>
                </div>
            </main>

            <footer className="text-center p-4 text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} SOLdrop. All rights reserved.</p>
            </footer>

            {/* POPUP RENDERING LOGIC */}
            {isTokenCreatorOpen && <PopupTokenCreator onClose={() => setTokenCreatorOpen(false)} onSuccess={handleCreationSuccess} />}
            {isAirdropOpen && <AirdropPopup onClose={() => setAirdropOpen(false)} />}
            {isMetadataPopupOpen && <TokenMetadataPopup mintAddress={popupMetadata.mintAddress} metadataUri={popupMetadata.metadataUri} onClose={() => setMetadataPopupOpen(false)} />}
            {isStoragePopupOpen && <PopupLocalStorageToken onClose={() => setStoragePopupOpen(false)} />}
        </div>
    );
};

export default Home;