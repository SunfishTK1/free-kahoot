'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, CheckCircle, XCircle, Trophy, Users, Loader2, Clock } from 'lucide-react';

interface GameState {
  state: 'LOBBY' | 'IN_PROGRESS' | 'COMPLETED' | 'ABORTED';
  currentQuestionIndex: number;
  questionState: 'INTRO' | 'ACTIVE' | 'RESULTS';
  playerCount: number;
  nickname: string;
  score: number;
  rank?: number;
}

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  timeLimit: number;
}

interface QuestionResult {
  correct: boolean;
  correctOptionId: string;
  pointsAwarded: number;
}

export default function PlayerGamePage() {
  const params = useParams();
  const playerSessionId = params?.playerSessionId as string;
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [questionResult, setQuestionResult] = useState<QuestionResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch game state
  useEffect(() => {
    if (!playerSessionId) return;
    
    const fetchGameState = async () => {
      try {
        const response = await fetch(`/api/games/player/${playerSessionId}/state`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.message || 'Failed to load game');
          return;
        }
        
        setGameState(data.gameState);
        if (data.currentQuestion) {
          setCurrentQuestion(data.currentQuestion);
          setTimeRemaining(data.currentQuestion.timeLimit);
        }
      } catch (err) {
        console.error('Error fetching game state:', err);
        setError('Connection error. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGameState();
    
    // Poll for updates (in production, use WebSocket)
    const interval = setInterval(fetchGameState, 2000);
    return () => clearInterval(interval);
  }, [playerSessionId]);

  // Timer countdown
  useEffect(() => {
    if (gameState?.questionState !== 'ACTIVE' || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState?.questionState, timeRemaining]);

  // Submit answer
  const handleAnswerSubmit = async (optionId: string) => {
    if (hasAnswered || !currentQuestion) return;
    
    setSelectedOption(optionId);
    setHasAnswered(true);
    
    try {
      const response = await fetch(`/api/games/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerSessionId,
          questionId: currentQuestion.id,
          selectedOptionId: optionId
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'RECORDED') {
        // Answer recorded successfully
        console.log('Answer recorded');
      } else if (data.status === 'TOO_LATE') {
        setError('Time expired - answer not recorded');
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer');
    }
  };

  // Reset for new question
  useEffect(() => {
    if (gameState?.questionState === 'ACTIVE') {
      setSelectedOption(null);
      setHasAnswered(false);
      setQuestionResult(null);
      setError('');
    } else if (gameState?.questionState === 'RESULTS' && currentQuestion) {
      // Fetch results
      fetchQuestionResult();
    }
  }, [gameState?.questionState, gameState?.currentQuestionIndex]);

  const fetchQuestionResult = async () => {
    try {
      const response = await fetch(`/api/games/player/${playerSessionId}/results`);
      const data = await response.json();
      if (response.ok && data.lastQuestionResult) {
        setQuestionResult(data.lastQuestionResult);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error && !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 border-white/20 backdrop-blur-md p-8 text-center">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-purple-400" />
            <span className="text-white font-medium">{gameState?.nickname}</span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              {gameState?.playerCount} players
            </Badge>
            <div className="text-right">
              <div className="text-sm text-gray-400">Score</div>
              <div className="text-2xl font-bold text-white">{gameState?.score || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-4xl mx-auto p-4">
        {/* LOBBY State */}
        {gameState?.state === 'LOBBY' && (
          <div className="mt-20 text-center">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md p-12">
              <Loader2 className="h-16 w-16 animate-spin text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Waiting for host to start...</h2>
              <p className="text-gray-300 text-lg mb-6">
                You&apos;re #{gameState.playerCount} to join!
              </p>
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span>{gameState.playerCount} players in the game</span>
              </div>
            </Card>
          </div>
        )}

        {/* IN_PROGRESS State */}
        {gameState?.state === 'IN_PROGRESS' && (
          <>
            {/* INTRO State */}
            {gameState.questionState === 'INTRO' && (
              <div className="mt-20 text-center">
                <Card className="bg-white/10 border-white/20 backdrop-blur-md p-12">
                  <h2 className="text-4xl font-bold text-white mb-4">Get Ready!</h2>
                  <p className="text-gray-300 text-xl">Next question coming up...</p>
                </Card>
              </div>
            )}

            {/* ACTIVE State - Question */}
            {gameState.questionState === 'ACTIVE' && currentQuestion && (
              <div className="mt-8 space-y-6">
                {/* Timer */}
                <div className="flex justify-center">
                  <Card className={`p-4 ${timeRemaining <= 5 ? 'bg-red-500/20 border-red-500/50' : 'bg-white/10 border-white/20'} backdrop-blur-md`}>
                    <div className="flex items-center space-x-3">
                      <Clock className={`h-6 w-6 ${timeRemaining <= 5 ? 'text-red-400' : 'text-purple-400'}`} />
                      <span className={`text-3xl font-bold ${timeRemaining <= 5 ? 'text-red-300' : 'text-white'}`}>
                        {timeRemaining}s
                      </span>
                    </div>
                  </Card>
                </div>

                {/* Question Text */}
                <Card className="bg-white/10 border-white/20 backdrop-blur-md p-8">
                  <h3 className="text-2xl font-semibold text-white text-center mb-2">
                    Question {(gameState.currentQuestionIndex || 0) + 1}
                  </h3>
                  <p className="text-xl text-gray-200 text-center">
                    {currentQuestion.text}
                  </p>
                </Card>

                {/* Answer Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={option.id}
                      onClick={() => handleAnswerSubmit(option.id)}
                      disabled={hasAnswered || timeRemaining === 0}
                      className={`h-24 text-lg font-semibold relative ${
                        selectedOption === option.id
                          ? 'bg-purple-600 hover:bg-purple-700 ring-4 ring-purple-400'
                          : 'bg-slate-700 hover:bg-slate-600'
                      } ${hasAnswered ? 'cursor-not-allowed' : ''}`}
                    >
                      <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-white">{option.text}</span>
                      {selectedOption === option.id && (
                        <CheckCircle className="absolute top-2 right-2 h-6 w-6 text-green-400" />
                      )}
                    </Button>
                  ))}
                </div>

                {/* Status Message */}
                {hasAnswered && (
                  <div className="text-center p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                    <p className="text-green-300 font-medium">Answer submitted! Waiting for others...</p>
                  </div>
                )}

                {error && (
                  <div className="text-center p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-300">{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* RESULTS State */}
            {gameState.questionState === 'RESULTS' && questionResult && (
              <div className="mt-12 text-center">
                <Card className={`p-12 ${questionResult.correct ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'} backdrop-blur-md`}>
                  {questionResult.correct ? (
                    <>
                      <CheckCircle className="h-24 w-24 text-green-400 mx-auto mb-6" />
                      <h2 className="text-4xl font-bold text-white mb-4">Correct!</h2>
                      <p className="text-2xl text-green-300 mb-4">
                        +{questionResult.pointsAwarded} points
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-24 w-24 text-red-400 mx-auto mb-6" />
                      <h2 className="text-4xl font-bold text-white mb-4">Incorrect</h2>
                      <p className="text-xl text-gray-300 mb-4">
                        Better luck on the next one!
                      </p>
                    </>
                  )}
                  <div className="mt-6 text-gray-300">
                    <p className="text-lg">Current Score: <span className="font-bold text-white">{gameState?.score}</span></p>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}

        {/* COMPLETED State - Final Results */}
        {gameState?.state === 'COMPLETED' && (
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 backdrop-blur-md p-12">
              <Trophy className="h-24 w-24 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
              {gameState.rank && (
                <p className="text-3xl text-yellow-300 mb-4">
                  You finished #{gameState.rank}
                </p>
              )}
              <div className="text-2xl text-white mb-6">
                Final Score: <span className="font-bold">{gameState.score}</span>
              </div>
              <p className="text-gray-300 text-lg">
                Great job! Thanks for playing!
              </p>
            </Card>
          </div>
        )}

        {/* ABORTED State */}
        {gameState?.state === 'ABORTED' && (
          <div className="mt-20 text-center">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md p-12">
              <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Game Cancelled</h2>
              <p className="text-gray-300 text-lg">
                The host has ended this game.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
