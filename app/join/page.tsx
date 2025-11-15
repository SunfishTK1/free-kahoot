'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Users, Loader2, AlertCircle } from 'lucide-react';

function JoinGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledCode = searchParams?.get('code') || '';
  
  const [gameCode, setGameCode] = useState(prefilledCode);
  const [nickname, setNickname] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!gameCode.trim()) {
      setError('Please enter a game code');
      return;
    }
    
    if (!nickname.trim() || nickname.length < 2 || nickname.length > 20) {
      setError('Nickname must be between 2-20 characters');
      return;
    }
    
    // Simple profanity check (basic client-side)
    const profanityList = ['badword1', 'badword2']; // Expand as needed
    const lowerNickname = nickname.toLowerCase();
    if (profanityList.some(word => lowerNickname.includes(word))) {
      setError('Nickname not allowed. Try another name.');
      return;
    }
    
    setIsJoining(true);
    
    try {
      const response = await fetch('/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameCode: gameCode.trim().toUpperCase(),
          nickname: nickname.trim()
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error === 'INVALID_NICKNAME') {
          setError('Nickname not allowed. Try another name.');
        } else if (data.error === 'GAME_NOT_FOUND') {
          setError('Game not found. Check your code and try again.');
        } else if (data.error === 'GAME_FULL') {
          setError('Game is full. Cannot join.');
        } else if (data.error === 'GAME_ENDED') {
          setError('This game has already ended.');
        } else {
          setError(data.message || 'Failed to join game. Please try again.');
        }
        return;
      }
      
      // Successfully joined - redirect to game play page
      router.push(`/play/${data.playerSessionId}`);
      
    } catch (err) {
      console.error('Join error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-full mb-4">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Free Kahoot</h1>
          <p className="text-gray-300">Join a game and test your knowledge!</p>
        </div>

        <Card className="bg-white/10 border-white/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white text-center">Join Game</CardTitle>
            <CardDescription className="text-gray-300 text-center">
              Enter the game code from your host
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              {/* Game Code Input */}
              <div>
                <label htmlFor="gameCode" className="block text-sm font-medium text-gray-300 mb-2">
                  Game Code
                </label>
                <Input
                  id="gameCode"
                  type="text"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  className="bg-slate-700 border-slate-600 text-white text-center text-2xl font-bold tracking-wider uppercase"
                  maxLength={6}
                  required
                  autoFocus={!prefilledCode}
                  disabled={isJoining}
                />
              </div>

              {/* Nickname Input */}
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-2">
                  Your Nickname
                </label>
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-slate-700 border-slate-600 text-white"
                  minLength={2}
                  maxLength={20}
                  required
                  autoFocus={!!prefilledCode}
                  disabled={isJoining}
                />
                <p className="text-xs text-gray-400 mt-1">2-20 characters</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Join Button */}
              <Button
                type="submit"
                disabled={isJoining || !gameCode.trim() || !nickname.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-5 w-5" />
                    Join Game
                  </>
                )}
              </Button>
            </form>

            {/* Info Section */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-400">
                  Don&apos;t have a code? Ask your host to share it!
                </p>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>No login required • Play as guest</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            By joining, you agree to our{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300 underline">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function JoinGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <JoinGameContent />
    </Suspense>
  );
}
