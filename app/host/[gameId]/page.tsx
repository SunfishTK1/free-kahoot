'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  SkipForward, 
  StopCircle, 
  Users, 
  Trophy,
  Clock,
  BarChart3,
  Loader2,
  QrCode,
  Copy,
  Check
} from 'lucide-react';

interface GameSession {
  id: string;
  code: string;
  state: 'LOBBY' | 'IN_PROGRESS' | 'COMPLETED' | 'ABORTED';
  currentQuestionIndex: number;
  questionState?: 'INTRO' | 'ACTIVE' | 'RESULTS';
  playerCount: number;
  quizTitle: string;
  totalQuestions: number;
  settings: {
    maxPlayers: number;
    defaultQuestionTime: number;
  };
}

interface Player {
  id: string;
  nickname: string;
  score: number;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED';
}

interface QuestionData {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  timeLimit: number;
  answeredCount?: number;
  answerDistribution?: Record<string, number>;
}

export default function HostGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params?.gameId as string;
  
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch game state
  useEffect(() => {
    if (!gameId) return;
    
    const fetchGameState = async () => {
      try {
        const response = await fetch(`/api/games/${gameId}/state`);
        const data = await response.json();
        
        if (!response.ok) {
          console.error('Failed to load game');
          return;
        }
        
        setGameSession(data.gameSession);
        setPlayers(data.players || []);
        if (data.currentQuestion) {
          setCurrentQuestion(data.currentQuestion);
          setTimeRemaining(data.currentQuestion.timeLimit);
        }
      } catch (err) {
        console.error('Error fetching game state:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGameState();
    
    // Poll for updates (in production, use WebSocket)
    const interval = setInterval(fetchGameState, 1000);
    return () => clearInterval(interval);
  }, [gameId]);

  // Timer countdown
  useEffect(() => {
    if (gameSession?.questionState !== 'ACTIVE' || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          // Auto-transition to results when time expires
          handleEndQuestion();
        }
        return Math.max(0, newTime);
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameSession?.questionState, timeRemaining]);

  // Copy game code
  const handleCopyCode = () => {
    const url = `${window.location.origin}/join?code=${gameSession?.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Start game
  const handleStartGame = async () => {
    setIsTransitioning(true);
    try {
      await fetch(`/api/games/${gameId}/start`, { method: 'POST' });
    } catch (err) {
      console.error('Error starting game:', err);
    } finally {
      setIsTransitioning(false);
    }
  };

  // Next question
  const handleNextQuestion = async () => {
    setIsTransitioning(true);
    try {
      await fetch(`/api/games/${gameId}/next-question`, { method: 'POST' });
    } catch (err) {
      console.error('Error moving to next question:', err);
    } finally {
      setIsTransitioning(false);
    }
  };

  // End question (force close)
  const handleEndQuestion = async () => {
    setIsTransitioning(true);
    try {
      await fetch(`/api/games/${gameId}/end-question`, { method: 'POST' });
    } catch (err) {
      console.error('Error ending question:', err);
    } finally {
      setIsTransitioning(false);
    }
  };

  // Skip question
  const handleSkipQuestion = async () => {
    if (!confirm('Skip this question? No points will be awarded.')) return;
    
    setIsTransitioning(true);
    try {
      await fetch(`/api/games/${gameId}/skip-question`, { method: 'POST' });
    } catch (err) {
      console.error('Error skipping question:', err);
    } finally {
      setIsTransitioning(false);
    }
  };

  // End game
  const handleEndGame = async () => {
    if (!confirm('End the game now? This cannot be undone.')) return;
    
    setIsTransitioning(true);
    try {
      await fetch(`/api/games/${gameId}/end`, { method: 'POST' });
    } catch (err) {
      console.error('Error ending game:', err);
    } finally {
      setIsTransitioning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white text-lg">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Game not found</p>
          <Button onClick={() => router.push('/dashboard')} className="bg-purple-600 hover:bg-purple-700">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Get top 5 players for leaderboard
  const topPlayers = [...players].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">{gameSession.quizTitle}</h1>
            <p className="text-slate-400">
              Question {(gameSession.currentQuestionIndex || 0) + 1} of {gameSession.totalQuestions}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              {gameSession.state}
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Users className="h-4 w-4 mr-1" />
              {gameSession.playerCount} / {gameSession.settings.maxPlayers}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* LOBBY State */}
            {gameSession.state === 'LOBBY' && (
              <>
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-center">Waiting for Players</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-6">
                    <div>
                      <p className="text-slate-400 mb-2">Game Code</p>
                      <div className="text-6xl font-bold text-purple-400 tracking-wider mb-4">
                        {gameSession.code}
                      </div>
                      <Button 
                        onClick={handleCopyCode}
                        variant="outline"
                        className="border-slate-600 text-white"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Join Link
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="flex justify-center">
                      <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                        <QrCode className="h-32 w-32 text-slate-900" />
                      </div>
                    </div>

                    <div className="text-slate-400">
                      <p>Players go to: <span className="text-purple-400 font-mono">yoursite.com/join</span></p>
                    </div>

                    <Button
                      onClick={handleStartGame}
                      disabled={gameSession.playerCount === 0 || isTransitioning}
                      className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                    >
                      {isTransitioning ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Start Game
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {/* IN_PROGRESS State */}
            {gameSession.state === 'IN_PROGRESS' && currentQuestion && (
              <>
                {/* Timer and Question */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-8">
                    {/* Timer */}
                    {gameSession.questionState === 'ACTIVE' && (
                      <div className="flex justify-center mb-6">
                        <div className={`text-6xl font-bold ${timeRemaining <= 5 ? 'text-red-400' : 'text-purple-400'}`}>
                          <Clock className="inline h-12 w-12 mb-2" />
                          <div>{timeRemaining}s</div>
                        </div>
                      </div>
                    )}

                    {/* Question */}
                    <div className="mb-6">
                      <h3 className="text-3xl font-bold text-white text-center mb-4">
                        {currentQuestion.text}
                      </h3>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {currentQuestion.options.map((option, index) => (
                        <div
                          key={option.id}
                          className={`p-6 rounded-lg border-2 ${
                            gameSession.questionState === 'RESULTS' && option.isCorrect
                              ? 'bg-green-500/20 border-green-500'
                              : 'bg-slate-700 border-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white">
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span className="text-white font-medium">{option.text}</span>
                            </div>
                            {gameSession.questionState === 'RESULTS' && currentQuestion.answerDistribution && (
                              <Badge className="bg-purple-500/20 text-purple-300">
                                {currentQuestion.answerDistribution[option.id] || 0}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Answer Stats */}
                    {gameSession.questionState === 'ACTIVE' && (
                      <div className="mt-6 text-center">
                        <p className="text-slate-400">
                          {currentQuestion.answeredCount || 0} / {gameSession.playerCount} answered
                        </p>
                        <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${((currentQuestion.answeredCount || 0) / Math.max(1, gameSession.playerCount)) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Controls */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex space-x-2">
                      {gameSession.questionState === 'ACTIVE' && (
                        <>
                          <Button
                            onClick={handleEndQuestion}
                            disabled={isTransitioning}
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                          >
                            <StopCircle className="h-4 w-4 mr-2" />
                            End Question
                          </Button>
                          <Button
                            onClick={handleSkipQuestion}
                            disabled={isTransitioning}
                            variant="outline"
                            className="border-slate-600 text-white"
                          >
                            <SkipForward className="h-4 w-4 mr-2" />
                            Skip
                          </Button>
                        </>
                      )}

                      {gameSession.questionState === 'RESULTS' && (
                        <Button
                          onClick={handleNextQuestion}
                          disabled={isTransitioning}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          {gameSession.currentQuestionIndex + 1 >= gameSession.totalQuestions ? (
                            <>End Game</>
                          ) : (
                            <>
                              <SkipForward className="h-4 w-4 mr-2" />
                              Next Question
                            </>
                          )}
                        </Button>
                      )}

                      <Button
                        onClick={handleEndGame}
                        disabled={isTransitioning}
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600/20"
                      >
                        End Game
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* COMPLETED State */}
            {gameSession.state === 'COMPLETED' && (
              <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50">
                <CardHeader>
                  <CardTitle className="text-white text-center text-3xl">
                    <Trophy className="inline h-8 w-8 mb-1 mr-2" />
                    Game Complete!
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <p className="text-gray-300 text-lg">
                    Great game! Check the final leaderboard on the right.
                  </p>
                  <div className="flex space-x-4">
                    <Button onClick={() => router.push('/dashboard')} className="flex-1 bg-purple-600 hover:bg-purple-700">
                      Return to Dashboard
                    </Button>
                    <Button variant="outline" className="flex-1 border-slate-600 text-white">
                      Play Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Players & Leaderboard */}
          <div className="space-y-6">
            {/* Player Count */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-400" />
                  Players ({gameSession.playerCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {players.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No players yet</p>
                  ) : (
                    players.slice(0, 20).map((player) => (
                      <div key={player.id} className="flex justify-between items-center p-2 bg-slate-700 rounded">
                        <span className="text-white">{player.nickname}</span>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-purple-500/20 text-purple-300">
                            {player.score}
                          </Badge>
                          <div className={`w-2 h-2 rounded-full ${player.connectionStatus === 'CONNECTED' ? 'bg-green-400' : 'bg-gray-400'}`} />
                        </div>
                      </div>
                    ))
                  )}
                  {players.length > 20 && (
                    <p className="text-slate-400 text-center text-sm">+{players.length - 20} more</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            {topPlayers.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                    Top 5 Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topPlayers.map((player, index) => (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          index === 0 ? 'bg-yellow-500/20 border border-yellow-500/50' :
                          index === 1 ? 'bg-gray-400/20 border border-gray-400/50' :
                          index === 2 ? 'bg-orange-500/20 border border-orange-500/50' :
                          'bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500 text-yellow-900' :
                            index === 1 ? 'bg-gray-400 text-gray-900' :
                            index === 2 ? 'bg-orange-500 text-orange-900' :
                            'bg-slate-600 text-white'
                          }`}>
                            #{index + 1}
                          </div>
                          <span className="text-white font-medium">{player.nickname}</span>
                        </div>
                        <span className="text-white font-bold text-lg">{player.score}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
