import axios from 'axios';

/**
 * Uploads JSON data to Pinata
 * @param {object} jsonData - The JSON object to upload.
 * @returns {Promise<string>} - The IPFS hash (CID) of the uploaded file.
 */
const uploadJSONToPinata = async (jsonData) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

    if (!pinataApiKey || !pinataSecretApiKey) {
        throw new Error("Pinata API keys are not configured in .env.local");
    }

    try {
        const response = await axios.post(url, jsonData, {
            headers: {
                'Content-Type': 'application/json',
                'pinata_api_key': pinataApiKey,
                'pinata_secret_api_key': pinataSecretApiKey,
            },
        });
        return response.data.IpfsHash;
    } catch (error) {
        console.error("Error uploading JSON to Pinata:", error);
        throw error;
    }
};

/**
 * Uploads a file (like an image) to Pinata
 * @param {File} file - The file to upload.
 * @returns {Promise<string>} - The IPFS hash (CID) of the uploaded file.
 */
export const uploadFileToPinata = async (file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

    if (!pinataApiKey || !pinataSecretApiKey) {
        throw new Error("Pinata API keys are not configured in .env.local");
    }

    let data = new FormData();
    data.append('file', file);

    try {
        const response = await axios.post(url, data, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                'pinata_api_key': pinataApiKey,
                'pinata_secret_api_key': pinataSecretApiKey,
            },
        });
        return response.data.IpfsHash;
    } catch (error) {
        console.error("Error uploading file to Pinata:", error);
        throw error;
    }
};

/**
 * Uploads token metadata (image first, then JSON) to Pinata.
 * @param {File} imageFile - The token image file.
 * @param {string} tokenName - The name of the token.
 * @param {string} tokenSymbol - The symbol of the token.
 * @param {string} description - The description of the token.
 * @returns {Promise<string>} - The IPFS URI for the metadata JSON.
 */
export const uploadMetadataToPinata = async (imageFile, tokenName, tokenSymbol, description) => {
    console.log("Uploading image to Pinata...");
    const imageCid = await uploadFileToPinata(imageFile);
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageCid}`;

    console.log("Image uploaded. URI:", imageUrl);
    console.log("Uploading metadata JSON...");

    const metadata = {
        name: tokenName,
        symbol: tokenSymbol,
        description: description,
        image: imageUrl,
        attributes: [], // Add any attributes if needed
        properties: {
            files: [
                {
                    uri: imageUrl,
                    type: imageFile.type,
                },
            ],
            category: 'image',
        },
    };

    const metadataCid = await uploadJSONToPinata(metadata);
    const metadataUri = `https://gateway.pinata.cloud/ipfs/${metadataCid}`;
    
    console.log("Metadata uploaded. URI:", metadataUri);
    return metadataUri;
};