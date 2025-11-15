'use client';

import { useState, useEffect } from 'react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  questions: { id: string }[];
}

interface Game {
  id: string;
  code: string;
  state: string;
  quiz: { title: string };
  players: { id: string; nickname: string }[];
}

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [activeTab, setActiveTab] = useState('quizzes');
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Free Kahoot</h1>
            <p className="text-sm text-slate-400">Quiz Creation Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Demo Mode</span>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-slate-700 px-4 py-2 rounded hover:bg-slate-600"
            >
              Home
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`py-3 border-b-2 ${activeTab === 'quizzes' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              My Quizzes
            </button>
            <button
              onClick={() => setActiveTab('games')}
              className={`py-3 border-b-2 ${activeTab === 'games' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              My Games
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-3 border-b-2 ${activeTab === 'create' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              Create Quiz
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`py-3 border-b-2 ${activeTab === 'ai' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              AI Quiz Generator
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'quizzes' && <QuizList quizzes={quizzes} onRefresh={loadQuizzes} />}
        {activeTab === 'games' && <GameList games={games} onRefresh={loadGames} />}
        {activeTab === 'create' && <CreateQuiz onCreated={loadQuizzes} />}
        {activeTab === 'ai' && <AIQuizGenerator onCreated={loadQuizzes} />}
      </main>
    </div>
  );
}

function QuizList({ quizzes, onRefresh }: { quizzes: Quiz[], onRefresh: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Quizzes</h2>
        <button
          onClick={onRefresh}
          className="bg-slate-700 px-4 py-2 rounded hover:bg-slate-600"
        >
          Refresh
        </button>
      </div>
      
      {quizzes.length === 0 ? (
        <div className="bg-slate-800 p-8 rounded-lg text-center text-slate-400">
          No quizzes yet. Create your first quiz!
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-slate-800 p-6 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{quiz.title}</h3>
                  <p className="text-slate-400">{quiz.description}</p>
                  <div className="flex gap-4 mt-2 text-sm text-slate-500">
                    <span>{quiz.questions.length} questions</span>
                    <span>Status: {quiz.status}</span>
                    <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700">
                    Host Game
                  </button>
                  <button className="bg-slate-700 px-3 py-1 rounded text-sm hover:bg-slate-600">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GameList({ games, onRefresh }: { games: Game[], onRefresh: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Games</h2>
        <button
          onClick={onRefresh}
          className="bg-slate-700 px-4 py-2 rounded hover:bg-slate-600"
        >
          Refresh
        </button>
      </div>
      
      {games.length === 0 ? (
        <div className="bg-slate-800 p-8 rounded-lg text-center text-slate-400">
          No games yet. Host your first game!
        </div>
      ) : (
        <div className="grid gap-4">
          {games.map((game) => (
            <div key={game.id} className="bg-slate-800 p-6 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Game Code: {game.code}</h3>
                  <p className="text-slate-400">Quiz: {game.quiz.title}</p>
                  <div className="flex gap-4 mt-2 text-sm text-slate-500">
                    <span>Status: {game.state}</span>
                    <span>{game.players.length} players</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-green-600 px-3 py-1 rounded text-sm hover:bg-green-700">
                    Start Game
                  </button>
                  <button className="bg-slate-700 px-3 py-1 rounded text-sm hover:bg-slate-600">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateQuiz({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([{
    prompt: '',
    options: [{ label: '', isCorrect: false }, { label: '', isCorrect: false }]
  }]);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');

  const addQuestion = () => {
    setQuestions([...questions, {
      prompt: '',
      options: [{ label: '', isCorrect: false }, { label: '', isCorrect: false }]
    }]);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push({ label: '', isCorrect: false });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setMessage('');

    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          questions: questions.map(q => ({
            ...q,
            type: 'MC_SINGLE',
            timeLimit: 20,
            points: 1000
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage('✅ Quiz created successfully!');
        setTimeout(() => {
          onCreated();
          setTitle('');
          setDescription('');
          setQuestions([{
            prompt: '',
            options: [{ label: '', isCorrect: false }, { label: '', isCorrect: false }]
          }]);
        }, 1000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to create quiz');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Create Quiz</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-800 p-6 rounded-lg space-y-4">
          <input
            placeholder="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
            required
          />
          <textarea
            placeholder="Quiz Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 h-24"
            required
          />
        </div>

        <div className="space-y-4">
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-slate-800 p-6 rounded-lg space-y-4">
              <input
                placeholder="Question"
                value={question.prompt}
                onChange={(e) => updateQuestion(qIndex, 'prompt', e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                required
              />
              
              <div className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex gap-2">
                    <input
                      placeholder="Option"
                      value={option.label}
                      onChange={(e) => updateOption(qIndex, oIndex, 'label', e.target.value)}
                      className="flex-1 p-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                      required
                    />
                    <label className="flex items-center gap-2 text-slate-300">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={option.isCorrect}
                        onChange={() => {
                          const newQuestions = [...questions];
                          newQuestions[qIndex].options.forEach((opt, i) => {
                            opt.isCorrect = i === oIndex;
                          });
                          setQuestions(newQuestions);
                        }}
                      />
                      Correct
                    </label>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(qIndex)}
                  className="bg-slate-700 px-3 py-1 rounded text-sm hover:bg-slate-600"
                >
                  + Add Option
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={addQuestion}
            className="bg-slate-700 px-4 py-2 rounded hover:bg-slate-600"
          >
            + Add Question
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Quiz'}
          </button>
        </div>
      </form>

      {message && (
        <div className="p-4 bg-slate-800 rounded text-center">
          {message}
        </div>
      )}
    </div>
  );
}

function AIQuizGenerator({ onCreated }: { onCreated: () => void }) {
  const [sourceType, setSourceType] = useState<'url' | 'pdf'>('url');
  const [sourceRef, setSourceRef] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setMessage('');

    try {
      const res = await fetch('/api/ai-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType,
          sourceRef,
          questionCount
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage('✅ AI job created! Quiz will be generated shortly.');
        setTimeout(onCreated, 2000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to create AI job');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">AI Quiz Generator</h2>
      
      <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Source Type</label>
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as 'url' | 'pdf')}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white"
          >
            <option value="url">URL</option>
            <option value="pdf">PDF</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {sourceType === 'url' ? 'Article URL' : 'PDF Content/Text'}
          </label>
          <textarea
            placeholder={sourceType === 'url' ? 'https://example.com/article' : 'Paste your PDF content here...'}
            value={sourceRef}
            onChange={(e) => setSourceRef(e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 h-32"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Number of Questions</label>
          <input
            type="number"
            min="1"
            max="25"
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white"
          />
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50 w-full"
        >
          {isGenerating ? 'Generating Quiz...' : 'Generate Quiz with AI'}
        </button>
      </form>

      {message && (
        <div className="p-4 bg-slate-800 rounded text-center">
          {message}
        </div>
      )}
    </div>
  );
}
