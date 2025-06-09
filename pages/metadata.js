import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// We only dynamically import our main view component here
const MetadataView = dynamic(
  () => import('../components/MetadataView'),
  { 
    ssr: false,
    loading: () => <div className="w-full text-center p-8">Loading Inspector...</div>
  }
);

const MetadataPage = () => {
    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <Head>
                <title>SOLdrop - Token Metadata</title>
                <meta name="description" content="Inspect SPL Token Metadata on Solana." />
            </Head>
            {/* The Header is now REMOVED from this file */}
            <MetadataView />
        </div>
    );
};

export default MetadataPage;