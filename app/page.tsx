'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Brain, Users, BarChart, Zap, Shield, Globe, Code, ChevronRight, Star, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const [activeDemo, setActiveDemo] = useState<'create' | 'play' | 'ai'>('create');

  const features = [
    {
      icon: <Play className="h-6 w-6" />,
      title: 'Interactive Quiz Creation',
      description: 'Build engaging quizzes with multiple choice questions, images, and time limits.',
      color: 'text-blue-500'
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'AI-Powered Generation',
      description: 'Generate quizzes automatically from URLs, documents, or text content.',
      color: 'text-purple-500'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Real-time Game Hosting',
      description: 'Host live quiz sessions with players joining via game codes.',
      color: 'text-green-500'
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: 'Analytics & Insights',
      description: 'Track performance, view results, and analyze player engagement.',
      color: 'text-orange-500'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Lightning Fast',
      description: 'Built on Next.js for optimal performance and instant responses.',
      color: 'text-yellow-500'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime guarantee.',
      color: 'text-red-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Education Director',
      content: 'Free Kahoot transformed how we conduct training sessions. The AI generation saves hours!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Team Lead',
      content: 'The real-time features are incredible. Our team loves the competitive learning aspect.',
      rating: 5
    },
    {
      name: 'Emily Davis',
      role: 'Content Creator',
      content: 'Perfect for creating engaging content. The platform is intuitive and powerful.',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        'Up to 10 players per game',
        '5 quizzes per month',
        'Basic analytics',
        'Community support'
      ],
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$29',
      description: 'For professionals and teams',
      features: [
        'Up to 100 players per game',
        'Unlimited quizzes',
        'Advanced analytics',
        'AI quiz generation',
        'Priority support',
        'Custom branding'
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: [
        'Unlimited players',
        'Unlimited everything',
        'White-label solution',
        'Dedicated account manager',
        'SLA guarantee',
        'Custom integrations'
      ],
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold text-white">Free Kahoot</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#demo" className="text-gray-300 hover:text-white transition-colors">Demo</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <Link href="/dashboard">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Get Started <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30">
            🚀 AI-Powered Quiz Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Create Engaging Quizzes
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> in Seconds</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform your content into interactive learning experiences. 
            Build quizzes manually or let AI generate them from your documents and URLs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3">
                Start Creating Free
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-3">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Create Amazing Quizzes
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powerful features designed for educators, content creators, and teams.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <CardHeader>
                  <div className={`${feature.color} mb-4`}>{feature.icon}</div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              See It in Action
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Try our interactive demos and experience the power of AI-powered quiz creation.
            </p>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 rounded-lg p-1 inline-flex">
              <Button
                variant={activeDemo === 'create' ? 'default' : 'ghost'}
                onClick={() => setActiveDemo('create')}
                className="text-white"
              >
                Create Quiz
              </Button>
              <Button
                variant={activeDemo === 'play' ? 'default' : 'ghost'}
                onClick={() => setActiveDemo('play')}
                className="text-white"
              >
                Play Game
              </Button>
              <Button
                variant={activeDemo === 'ai' ? 'default' : 'ghost'}
                onClick={() => setActiveDemo('ai')}
                className="text-white"
              >
                AI Generation
              </Button>
            </div>
          </div>

          <Card className="bg-slate-800/50 border-white/10 max-w-4xl mx-auto">
            <CardContent className="p-8">
              {activeDemo === 'create' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-white">Interactive Quiz Builder</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Quiz Title"
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                    />
                    <textarea
                      placeholder="Quiz Description"
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 h-24"
                    />
                    <div className="bg-slate-700 p-4 rounded">
                      <h4 className="text-white font-medium mb-2">Question 1</h4>
                      <input
                        type="text"
                        placeholder="Enter your question..."
                        className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 mb-2"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Option A"
                          className="p-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400"
                        />
                        <input
                          type="text"
                          placeholder="Option B"
                          className="p-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400"
                        />
                      </div>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Create Quiz Demo
                    </Button>
                  </div>
                </div>
              )}
              
              {activeDemo === 'play' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-white">Game Lobby</h3>
                  <div className="text-center py-8">
                    <div className="text-6xl font-bold text-purple-400 mb-4">GAME-123</div>
                    <p className="text-gray-300 mb-6">Share this code with players to join</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-green-400">3 players joined</span>
                      </div>
                      <div className="flex -space-x-2 justify-center">
                        <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-slate-800"></div>
                        <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-slate-800"></div>
                        <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-slate-800"></div>
                      </div>
                    </div>
                    <Button className="mt-6 bg-green-600 hover:bg-green-700">
                      Start Game
                    </Button>
                  </div>
                </div>
              )}
              
              {activeDemo === 'ai' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-white">AI Quiz Generator</h3>
                  <div className="space-y-4">
                    <select className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white">
                      <option>Article URL</option>
                      <option>PDF Document</option>
                      <option>Text Content</option>
                    </select>
                    <input
                      type="url"
                      placeholder="https://example.com/article"
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Number of Questions: 10
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="25"
                        defaultValue="10"
                        className="w-full"
                      />
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Brain className="mr-2 h-4 w-4" />
                      Generate Quiz with AI
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Start free, upgrade when you need more power.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`bg-white/5 border-white/10 backdrop-blur-sm ${plan.highlighted ? 'ring-2 ring-purple-500 bg-purple-500/10' : ''}`}>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-white">
                    {plan.price}
                    {plan.price !== 'Custom' && <span className="text-lg text-gray-400">/month</span>}
                  </div>
                  <CardDescription className="text-gray-300">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                  <Button className={`w-full mt-6 ${plan.highlighted ? 'bg-purple-600 hover:bg-purple-700' : 'bg-white/10 hover:bg-white/20'}`}>
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Loved by Thousands of Users
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              See what our customers have to say about Free Kahoot.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">&ldquo;{testimonial.content}&rdquo;</p>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Create Amazing Quizzes?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of educators and teams using Free Kahoot to create engaging learning experiences.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3">
              Get Started Free <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/50 backdrop-blur-sm py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-purple-400" />
                <span className="text-lg font-bold text-white">Free Kahoot</span>
              </div>
              <p className="text-gray-400 text-sm">
                The ultimate AI-powered quiz platform for educators and teams.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Free Kahoot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
