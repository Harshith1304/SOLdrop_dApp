// ... All the imports remain the same ...
import Header from '../components/Header';
import React, { useState } from 'react';
// ... other imports

const MetadataPage = () => { // Renamed from Inspector
    // ... All the logic inside the component remains exactly the same
    const { connection } = useConnection();
    const [mintAddress, setMintAddress] = useState('');
    // ... all other states and the handleFetchMetadata function ...

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <Head>
                <title>SOLdrop - Token Metadata</title> {/* Changed Title */}
                <meta name="description" content="Inspect SPL Token Metadata on Solana." />
            </Head>
            {/* We pass dummy functions because this page doesn't open popups */}
            <Header openTokenCreator={() => {}} openAirdrop={() => {}} /> 

            <main className="container mx-auto p-4 py-8">
                <div className="max-w-xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4">Token Metadata</h1> {/* Changed Title */}
                    {/* ... The rest of the JSX remains the same ... */}
                </div>
            </main>
        </div>
    );
};

export default MetadataPage; // Renamed from Inspector
