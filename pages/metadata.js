import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Header from '../components/Header';

// This dynamically imports the main view with Server-Side Rendering (SSR) turned OFF.
// The loading property provides a fallback while the component is being loaded in the browser.
const MetaDataView = dynamic(
  () => import('../components/MetaDataView'),
  { 
    ssr: false,
    loading: () => <p className="text-center text-gray-400">Loading Inspector...</p>
  }
);

const MetadataPage = () => {
    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <Head>
                <title>SOLdrop - Token Metadata</title>
                <meta name="description" content="Inspect SPL Token Metadata on Solana." />
            </Head>
            {/* We pass dummy functions because this page doesn't need to open popups */}
            <Header openTokenCreator={() => {}} openAirdrop={() => {}} />
            
            <MetadataView />
        </div>
    );
};

export default MetadataPage;