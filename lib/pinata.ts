import axios from 'axios';

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
  console.warn('Pinata API keys are not set. File uploads will not work.');
}

export async function uploadToPinata(data: string | Blob): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error('Pinata API keys are not configured');
  }

  try {
    // Convert base64 image to blob if it's a string
    let fileData = data;
    if (typeof data === 'string' && data.startsWith('data:')) {
      const response = await fetch(data);
      fileData = await response.blob();
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', fileData);

    // Upload to Pinata
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
    });

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw new Error('Failed to upload to Pinata');
  }
}

export async function getPinataUrl(hash: string): Promise<string> {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
} 