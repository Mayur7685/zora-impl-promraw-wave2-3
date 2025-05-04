import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccount } from 'wagmi';
import { createCoin } from '@zoralabs/coins-sdk';
import { uploadToPinata } from '@/lib/pinata';

interface CreateCoinProps {
  imageUrl: string;
  metadata: {
    name: string;
    description: string;
    scores: {
      creativity: number;
      promptAdherence: number;
      artisticQuality: number;
      overall: number;
    };
  };
}

export default function CreateCoin({ imageUrl, metadata }: CreateCoinProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [coinName, setCoinName] = useState(metadata.name);
  const [coinSymbol, setCoinSymbol] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  const handleCreateCoin = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!coinName || !coinSymbol) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Upload image to Pinata
      const imageHash = await uploadToPinata(imageUrl);

      // Create coin metadata
      const coinMetadata = {
        name: coinName,
        symbol: coinSymbol,
        description: metadata.description,
        image: `ipfs://${imageHash}`,
        attributes: [
          { trait_type: 'Creativity', value: metadata.scores.creativity },
          { trait_type: 'Prompt Adherence', value: metadata.scores.promptAdherence },
          { trait_type: 'Artistic Quality', value: metadata.scores.artisticQuality },
          { trait_type: 'Overall Score', value: metadata.scores.overall }
        ]
      };

      // Upload metadata to Pinata
      const metadataHash = await uploadToPinata(JSON.stringify(coinMetadata));

      // Create coin using Zora SDK
      const coin = await createCoin({
        name: coinName,
        symbol: coinSymbol,
        metadataURI: `ipfs://${metadataHash}`,
        owner: address,
        initialSupply: '1000000000000000000000000', // 1 million tokens with 18 decimals
      });

      console.log('Coin created:', coin);
      // Handle success (e.g., show success message, redirect to coin page)
    } catch (err) {
      console.error('Error creating coin:', err);
      setError(err instanceof Error ? err.message : 'Failed to create coin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Zora Coin</CardTitle>
        <CardDescription>Turn your artwork into a Zora Coin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="coinName">Coin Name</Label>
          <Input
            id="coinName"
            value={coinName}
            onChange={(e) => setCoinName(e.target.value)}
            placeholder="Enter coin name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="coinSymbol">Coin Symbol</Label>
          <Input
            id="coinSymbol"
            value={coinSymbol}
            onChange={(e) => setCoinSymbol(e.target.value.toUpperCase())}
            placeholder="Enter coin symbol (e.g., ART)"
            maxLength={5}
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <Button
          onClick={handleCreateCoin}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Creating Coin...' : 'Create Coin'}
        </Button>
      </CardContent>
    </Card>
  );
} 