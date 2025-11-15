'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Brain, 
  Users, 
  BarChart, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Clock,
  TrendingUp,
  Award,
  Target,
  Zap,
  Globe,
  Settings,
  LogOut,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  ChevronRight,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  questions: { id: string }[];
  plays?: number;
  averageScore?: number;
}

interface Game {
  id: string;
  code: string;
  state: 'LOBBY' | 'IN_PROGRESS' | 'COMPLETED';
  quiz: { title: string };
  players: { id: string; nickname: string; score: number }[];
  createdAt: string;
  maxPlayers?: number;
}

interface Question {
  prompt: string;
  type: 'MC_SINGLE' | 'TRUE_FALSE';
  timeLimit: number;
  points: number;
  options: { label: string; isCorrect: boolean }[];
}

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Quiz creation state
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    {
      prompt: '',
      type: 'MC_SINGLE',
      timeLimit: 20,
      points: 1000,
      options: [{ label: '', isCorrect: false }, { label: '', isCorrect: false }]
    }
  ]);

  // AI generation state
  const [aiSource, setAiSource] = useState<'url' | 'text'>('url');
  const [aiUrl, setAiUrl] = useState('');
  const [aiText, setAiText] = useState('');
  const [aiQuestionCount, setAiQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadQuizzes();
    loadGames();
  }, []);

  const loadQuizzes = async () => {
    try {
      const res = await fetch('/api/quizzes');
      const data = await res.json();
      if (data.success) {
        setQuizzes(data.data);
      }
    } catch (error) {
      console.error('Failed to load quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGames = async () => {
    try {
      const res = await fetch('/api/games');
      const data = await res.json();
      if (data.success) {
        setGames(data.data);
      }
    } catch (error) {
      console.error('Failed to load games');
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      prompt: '',
      type: 'MC_SINGLE',
      timeLimit: 20,
      points: 1000,
      options: [{ label: '', isCorrect: false }, { label: '', isCorrect: false }]
    }]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const updateQuestion = (questionIndex: number, field: 'prompt', value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: 'label' | 'isCorrect', value: string | boolean) => {
    const newQuestions = [...questions];
    if (field === 'label') {
      newQuestions[questionIndex].options[optionIndex].label = value as string;
    } else {
      newQuestions[questionIndex].options[optionIndex].isCorrect = value as boolean;
    }
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push({ label: '', isCorrect: false });
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
    setQuestions(newQuestions);
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingQuiz(true);
    
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizTitle,
          description: quizDescription,
          questions: questions.map((q, index) => ({
            ...q,
            orderIndex: index
          }))
        })
      });
      
      if (res.ok) {
        setQuizTitle('');
        setQuizDescription('');
        setQuestions([{
          prompt: '',
          type: 'MC_SINGLE',
          timeLimit: 20,
          points: 1000,
          options: [{ label: '', isCorrect: false }, { label: '', isCorrect: false }]
        }]);
        setActiveTab('quizzes');
        loadQuizzes();
      }
    } catch (error) {
      console.error('Failed to create quiz');
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: aiSource,
          sourceRef: aiSource === 'url' ? aiUrl : aiText,
          questionCount: aiQuestionCount
        })
      });
      
      if (res.ok) {
        setAiUrl('');
        setAiText('');
        setActiveTab('quizzes');
        loadQuizzes();
      }
    } catch (error) {
      console.error('Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Brain className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Free Kahoot</h1>
              <p className="text-sm text-slate-400">Quiz Creation Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              Demo Mode
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>
              <LogOut className="h-4 w-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 bg-slate-800 border border-slate-700">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-purple-600">
              <BarChart className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="text-white data-[state=active]:bg-purple-600">
              <Brain className="h-4 w-4 mr-2" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="games" className="text-white data-[state=active]:bg-purple-600">
              <Play className="h-4 w-4 mr-2" />
              Games
            </TabsTrigger>
            <TabsTrigger value="create" className="text-white data-[state=active]:bg-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Create
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-white data-[state=active]:bg-purple-600">
              <Zap className="h-4 w-4 mr-2" />
              AI Generate
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-purple-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total Quizzes</CardTitle>
                  <Brain className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{quizzes.length}</div>
                  <p className="text-xs text-slate-400">+2 from last week</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Active Games</CardTitle>
                  <Play className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{games.filter(g => g.state === 'IN_PROGRESS').length}</div>
                  <p className="text-xs text-slate-400">Currently running</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total Players</CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {games.reduce((acc, game) => acc + game.players.length, 0)}
                  </div>
                  <p className="text-xs text-slate-400">All time</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Avg Score</CardTitle>
                  <Award className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">85%</div>
                  <p className="text-xs text-slate-400">+5% improvement</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Quizzes</CardTitle>
                  <CardDescription>Your latest quiz creations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quizzes.slice(0, 5).map((quiz) => (
                      <div key={quiz.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div>
                          <h4 className="font-medium text-white">{quiz.title}</h4>
                          <p className="text-sm text-slate-400">{quiz.questions.length} questions</p>
                        </div>
                        <Badge variant={quiz.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                          {quiz.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Games</CardTitle>
                  <CardDescription>Latest game sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {games.slice(0, 5).map((game) => (
                      <div key={game.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div>
                          <h4 className="font-medium text-white">{game.quiz.title}</h4>
                          <p className="text-sm text-slate-400">Code: {game.code}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={game.state === 'IN_PROGRESS' ? 'default' : 'secondary'}>
                            {game.state}
                          </Badge>
                          <span className="text-sm text-slate-400">{game.players.length} players</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search quizzes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <Button variant="outline" size="sm" className="border-slate-700 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Button onClick={() => setActiveTab('create')} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                New Quiz
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <Card key={quiz.id} className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white line-clamp-2">{quiz.title}</CardTitle>
                      <Badge variant={quiz.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {quiz.status}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                      <span>{quiz.questions.length} questions</span>
                      <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="border-slate-700 text-white">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-700 text-white">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-700 text-white">
                        <Play className="h-4 w-4 mr-1" />
                        Play
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Games Tab */}
          <TabsContent value="games" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Game Sessions</h2>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Host New Game
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {games.map((game) => (
                <Card key={game.id} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white">{game.quiz.title}</CardTitle>
                      <Badge variant={game.state === 'IN_PROGRESS' ? 'default' : 'secondary'}>
                        {game.state}
                      </Badge>
                    </div>
                    <CardDescription>Game Code: <span className="font-mono text-purple-400">{game.code}</span></CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Players</span>
                        <span className="text-white font-medium">{game.players.length} / {game.maxPlayers || 50}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Started</span>
                        <span className="text-white">{new Date(game.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex -space-x-2">
                        {game.players.slice(0, 8).map((player) => (
                          <div key={player.id} className="w-8 h-8 bg-purple-500 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs text-white font-medium">
                            {player.nickname.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {game.players.length > 8 && (
                          <div className="w-8 h-8 bg-slate-600 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs text-white">
                            +{game.players.length - 8}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {game.state === 'LOBBY' && (
                          <Button className="flex-1 bg-green-600 hover:bg-green-700">
                            <Play className="h-4 w-4 mr-2" />
                            Start Game
                          </Button>
                        )}
                        {game.state === 'IN_PROGRESS' && (
                          <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
                            <Eye className="h-4 w-4 mr-2" />
                            Monitor
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="border-slate-700 text-white">
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Code
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Create Quiz Tab */}
          <TabsContent value="create" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Create New Quiz</CardTitle>
                <CardDescription>Build an engaging quiz with multiple questions</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateQuiz} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Quiz Title</label>
                      <Input
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        placeholder="Enter quiz title..."
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                      <Input
                        value={quizDescription}
                        onChange={(e) => setQuizDescription(e.target.value)}
                        placeholder="Brief description..."
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-white">Questions</h3>
                      <Button type="button" onClick={addQuestion} variant="outline" className="border-slate-600 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>

                    {questions.map((question, questionIndex) => (
                      <Card key={questionIndex} className="bg-slate-700 border-slate-600">
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-white">Question {questionIndex + 1}</CardTitle>
                            {questions.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removeQuestion(questionIndex)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Question Text</label>
                            <Textarea
                              value={question.prompt}
                              onChange={(e) => updateQuestion(questionIndex, 'prompt', e.target.value)}
                              placeholder="Enter your question..."
                              className="bg-slate-600 border-slate-500 text-white"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">Time Limit (seconds)</label>
                              <Input
                                type="number"
                                value={question.timeLimit}
                                onChange={(e) => {
                                  const newQuestions = [...questions];
                                  newQuestions[questionIndex].timeLimit = parseInt(e.target.value);
                                  setQuestions(newQuestions);
                                }}
                                min="10"
                                max="120"
                                className="bg-slate-600 border-slate-500 text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">Points</label>
                              <Input
                                type="number"
                                value={question.points}
                                onChange={(e) => {
                                  const newQuestions = [...questions];
                                  newQuestions[questionIndex].points = parseInt(e.target.value);
                                  setQuestions(newQuestions);
                                }}
                                min="100"
                                max="2000"
                                step="100"
                                className="bg-slate-600 border-slate-500 text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium text-slate-300">Answer Options</label>
                              <Button
                                type="button"
                                onClick={() => addOption(questionIndex)}
                                variant="outline"
                                size="sm"
                                className="border-slate-500 text-white"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Option
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <Input
                                    value={option.label}
                                    onChange={(e) => updateOption(questionIndex, optionIndex, 'label', e.target.value)}
                                    placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                    className="flex-1 bg-slate-600 border-slate-500 text-white"
                                    required
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      const newQuestions = [...questions];
                                      newQuestions[questionIndex].options.forEach((opt, i) => {
                                        opt.isCorrect = i === optionIndex;
                                      });
                                      setQuestions(newQuestions);
                                    }}
                                    variant={option.isCorrect ? "default" : "outline"}
                                    size="sm"
                                    className={option.isCorrect ? "bg-green-600 hover:bg-green-700" : "border-slate-500 text-white"}
                                  >
                                    {option.isCorrect ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2 border-current" />}
                                  </Button>
                                  {question.options.length > 2 && (
                                    <Button
                                      type="button"
                                      onClick={() => removeOption(questionIndex, optionIndex)}
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" className="border-slate-600 text-white">
                      Save as Draft
                    </Button>
                    <Button type="submit" disabled={isCreatingQuiz} className="bg-purple-600 hover:bg-purple-700">
                      {isCreatingQuiz ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Create Quiz
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Generate Tab */}
          <TabsContent value="ai" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">AI Quiz Generator</CardTitle>
                <CardDescription>Generate quizzes automatically using AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex space-x-4">
                  <Button
                    variant={aiSource === 'url' ? 'default' : 'outline'}
                    onClick={() => setAiSource('url')}
                    className={aiSource === 'url' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 text-white'}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    From URL
                  </Button>
                  <Button
                    variant={aiSource === 'text' ? 'default' : 'outline'}
                    onClick={() => setAiSource('text')}
                    className={aiSource === 'text' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 text-white'}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    From Text
                  </Button>
                </div>

                {aiSource === 'url' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Article URL</label>
                    <Input
                      value={aiUrl}
                      onChange={(e) => setAiUrl(e.target.value)}
                      placeholder="https://example.com/article"
                      className="bg-slate-700 border-slate-600 text-white"
                      type="url"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Text Content</label>
                    <Textarea
                      value={aiText}
                      onChange={(e) => setAiText(e.target.value)}
                      placeholder="Paste your text content here..."
                      className="bg-slate-700 border-slate-600 text-white h-32"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Number of Questions: {aiQuestionCount}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    value={aiQuestionCount}
                    onChange={(e) => setAiQuestionCount(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>5</span>
                    <span>25</span>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateQuiz} 
                  disabled={isGenerating || (!aiUrl && !aiText)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Quiz with AI
                    </>
                  )}
                </Button>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">How it works:</h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• AI analyzes your content and extracts key concepts</li>
                    <li>• Generates relevant questions with multiple choice answers</li>
                    <li>• Automatically sets appropriate time limits and points</li>
                    <li>• Creates a complete quiz ready for review and publishing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quiz Performance</CardTitle>
                  <CardDescription>How your quizzes are performing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Total Plays</span>
                      <span className="text-2xl font-bold text-white">1,234</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Average Score</span>
                      <span className="text-2xl font-bold text-green-400">85%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Completion Rate</span>
                      <span className="text-2xl font-bold text-blue-400">92%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Engagement Time</span>
                      <span className="text-2xl font-bold text-purple-400">12m</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Top Performing Quizzes</CardTitle>
                  <CardDescription>Your most popular quizzes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quizzes.slice(0, 5).map((quiz, index) => (
                      <div key={quiz.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-white font-medium">{quiz.title}</p>
                            <p className="text-sm text-slate-400">{quiz.questions.length} questions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{Math.floor(Math.random() * 500) + 100} plays</p>
                          <p className="text-sm text-green-400">{Math.floor(Math.random() * 20) + 80}% avg score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                  <CardDescription>Latest quiz and game activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-3 bg-slate-700 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-white">New game started: Math Basics</p>
                        <p className="text-sm text-slate-400">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-3 bg-slate-700 rounded-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-white">Quiz created: Science Quiz</p>
                        <p className="text-sm text-slate-400">15 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-3 bg-slate-700 rounded-lg">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-white">AI quiz generated from URL</p>
                        <p className="text-sm text-slate-400">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
