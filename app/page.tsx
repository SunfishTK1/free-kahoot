import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-white">Free Kahoot</h1>
          <p className="text-xl text-slate-300">
            AI-powered quiz creation and real-time game hosting
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-slate-800 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-slate-300">
              <div>
                <h3 className="font-semibold text-white mb-2">🎯 Quiz Creation</h3>
                <p className="text-sm">Build quizzes with multiple choice questions</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">🤖 AI Generation</h3>
                <p className="text-sm">Generate quizzes from URLs and content</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">🎮 Real-time Games</h3>
                <p className="text-sm">Host live quiz sessions with players</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">📊 Analytics</h3>
                <p className="text-sm">Track usage and game statistics</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started →
            </Link>
            <Link 
              href="/docs/deployment-vercel" 
              className="bg-slate-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-slate-700 transition-colors"
            >
              View Docs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
