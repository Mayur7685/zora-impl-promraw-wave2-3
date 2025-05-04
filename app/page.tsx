"use client"

import { useState } from 'react';
import DrawingCanvas from '@/components/drawing-canvas';
import DailyPrompt from '@/components/daily-prompt';
import ScoreDisplay from '@/components/score-display';
import ZoraGallery from '@/components/zora-gallery';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { ConnectWallet } from "@/components/ConnectWallet";

// Dynamically import CreateCoin to avoid SSR issues
const CreateCoin = dynamic(() => import('@/components/create-coin'), {
  ssr: false,
  loading: () => <div>Loading coin creation interface...</div>
});

export default function Home() {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("Loading creative prompt...");
  const [scores, setScores] = useState<{
    creativity: number;
    promptAdherence: number;
    artisticQuality: number;
    overall: number;
    feedback: string;
  } | null>(null);
  const [artworkData, setArtworkData] = useState<{
    name: string;
    description: string;
    scores: {
      creativity: number;
      promptAdherence: number;
      artisticQuality: number;
      overall: number;
    };
  } | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);

  const handlePromptUpdate = (prompt: string) => {
    setCurrentPrompt(prompt);
  };

  const handleScoreUpdate = (newScores: {
    creativity: number;
    promptAdherence: number;
    artisticQuality: number;
    overall: number;
    feedback: string;
  }) => {
    setScores(newScores);
    setHasSubmitted(true);
    
    // Generate artwork data based on scores
    const artworkInfo = {
      name: `Artwork #${Math.floor(Math.random() * 1000)}`,
      description: newScores.feedback,
      scores: {
        creativity: newScores.creativity,
        promptAdherence: newScores.promptAdherence,
        artisticQuality: newScores.artisticQuality,
        overall: newScores.overall
      }
    };
    setArtworkData(artworkInfo);
    
    // Get the canvas image data
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setImageData(dataUrl);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl border-4 border-gray-300 dark:border-gray-700 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Promraw</h1>
              <p className="text-gray-600 dark:text-gray-300">AI prompts. Draw. Create Coins.</p>
            </div>

            <div className="flex justify-center md:justify-end gap-4">
              <ConnectWallet />
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                onClick={() => window.open("https://github.com/yourusername/promraw", "_blank")}
              >
                <Sparkles className="h-4 w-4" />
                Star on GitHub
              </Button>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          {/* Zora Gallery */}
          <ZoraGallery />

          {/* Daily Prompt */}
          <Card className="border-4 border-gray-300 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
            <CardHeader className="bg-gray-200 dark:bg-gray-800">
              <CardTitle className="text-black dark:text-white">Creative Challenge</CardTitle>
              <CardDescription>Create your masterpiece based on the AI prompt</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <DailyPrompt onPromptUpdate={handlePromptUpdate} />
            </CardContent>
          </Card>

          {/* Drawing Canvas */}
          <Card className="border-4 border-gray-300 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
            <CardHeader className="bg-gray-200 dark:bg-gray-800">
              <CardTitle className="text-black dark:text-white">Your Canvas</CardTitle>
              <CardDescription>Draw your interpretation of the prompt</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <DrawingCanvas onScoreUpdate={handleScoreUpdate} prompt={currentPrompt} />
            </CardContent>
          </Card>

          {/* Results and Coin Creation (shown after submission) */}
          {hasSubmitted && scores && artworkData && (
            <>
              {/* Score Display */}
              <Card className="border-4 border-gray-300 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                <CardHeader className="bg-gray-200 dark:bg-gray-800">
                  <CardTitle className="text-black dark:text-white">Your Scores</CardTitle>
                  <CardDescription>AI-generated scores for your artwork</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ScoreDisplay scores={scores} />
                </CardContent>
              </Card>

              {/* Create Coin */}
              <Card className="border-4 border-gray-300 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                <CardHeader className="bg-gray-200 dark:bg-gray-800">
                  <CardTitle className="text-black dark:text-white">Create Zora Coin</CardTitle>
                  <CardDescription>Turn your artwork into a Zora Coin</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <CreateCoin 
                    imageUrl={imageData || ""} 
                    metadata={artworkData}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

