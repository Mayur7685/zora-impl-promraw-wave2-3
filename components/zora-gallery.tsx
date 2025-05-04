import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getPinataUrl } from '@/lib/pinata';
import { getCoins } from '@zoralabs/coins-sdk';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  metadataURI: string;
  owner: string;
  createdAt: string;
  metadata?: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: number;
    }>;
  };
}

export default function ZoraGallery() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch coins using Zora SDK
      const response = await getCoins({
        limit: 12, // Show latest 12 coins
        orderBy: 'createdAt',
        orderDirection: 'desc'
      });

      // Fetch metadata for each coin
      const coinsWithMetadata = await Promise.all(
        response.map(async (coin) => {
          try {
            const metadataResponse = await fetch(coin.metadataURI.replace('ipfs://', 'https://ipfs.io/ipfs/'));
            const metadata = await metadataResponse.json();
            return { ...coin, metadata };
          } catch (err) {
            console.error(`Error fetching metadata for coin ${coin.id}:`, err);
            return coin;
          }
        })
      );

      setCoins(coinsWithMetadata);
    } catch (err) {
      console.error('Error fetching coins:', err);
      setError('Failed to load coins');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-4 border-gray-300 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gray-200 dark:bg-gray-800">
          <CardTitle className="text-black dark:text-white">Zora Gallery</CardTitle>
          <CardDescription>Loading latest coins...</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-4 border-gray-300 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gray-200 dark:bg-gray-800">
          <CardTitle className="text-black dark:text-white">Zora Gallery</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-4 border-gray-300 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
      <CardHeader className="bg-gray-200 dark:bg-gray-800">
        <CardTitle className="text-black dark:text-white">Zora Gallery</CardTitle>
        <CardDescription>Latest coins created on Zora</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coins.map((coin) => (
            <Card key={coin.id} className="overflow-hidden border-2 border-gray-200 dark:border-gray-700">
              <div className="aspect-square relative">
                {coin.metadata?.image ? (
                  <img
                    src={coin.metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                    alt={coin.metadata.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{coin.metadata?.name || coin.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {coin.metadata?.description || 'No description available'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {coin.metadata?.attributes?.map((attr, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
                    >
                      {attr.trait_type}: {attr.value}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 