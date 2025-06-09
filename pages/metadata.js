import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Header from '../components/Header';

// Dynamically import the main view with SSR turned off
const MetadataView = dynamic(
  () => import('../components/MetadataView'),
  { ssr: false }
);

const MetadataPage = () => {
    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <Head>
                <title>SOLdrop - Token Metadata</title>
                <meta name="description" content="Inspect SPL Token Metadata on Solana." />
            </Head>
            <Header openTokenCreator={() => {}} openAirdrop={() => {}} />
            <MetadataView />
        </div>
    );
};

export default MetadataPage;