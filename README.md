# Free Kahoot - AI-Powered Quiz Platform

A comprehensive quiz creation and game hosting platform built with Next.js, TypeScript, and Tailwind CSS. Features AI-powered quiz generation, real-time game hosting, and advanced analytics.

## 🚀 Features

### Core Platform
- **Interactive Quiz Creation** - Build engaging quizzes with multiple choice questions, images, and time limits
- **AI-Powered Generation** - Generate quizzes automatically from URLs, documents, or text content using Azure OpenAI
- **Real-time Game Hosting** - Host live quiz sessions with players joining via game codes
- **Analytics & Insights** - Track performance, view results, and analyze player engagement
- **Modern UI/UX** - Beautiful, responsive interface built with Tailwind CSS and shadcn/ui components

### Dashboard Features
- **Overview Dashboard** - Real-time statistics and activity monitoring
- **Quiz Management** - Create, edit, publish, and manage quizzes
- **Game Sessions** - Host and monitor live quiz games
- **AI Generator** - Intelligent quiz creation from content
- **Analytics** - Detailed performance metrics and insights

### Technical Features
- **Next.js 14** - App Router with server actions and API routes
- **TypeScript** - Full type safety throughout the application
- **Prisma ORM** - Database management with PostgreSQL
- **Tailwind CSS** - Modern, responsive styling
- **shadcn/ui** - High-quality UI components
- **Demo Mode** - Fully functional without authentication

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: shadcn/ui, Radix UI, Lucide Icons
- **AI Integration**: Azure OpenAI
- **Deployment**: Vercel-ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd free-kahoot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables in `.env`:
   ```env
   # Database
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   
   # Authentication
   JWT_SECRET="your-secret-key"
   
   # Azure OpenAI (for AI generation)
   AZURE_API_KEY="your-azure-api-key"
   AZURE_ENDPOINT="your-azure-endpoint"
   AZURE_DEPLOYMENT="your-deployment-name"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   npm run prisma:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎯 Quick Start

The application runs in **Demo Mode** by default, allowing you to explore all features without authentication:

1. **Visit the Homepage** - See the comprehensive landing page with features, pricing, and demos
2. **Access the Dashboard** - Click "Get Started" to enter the full platform
3. **Create Quizzes** - Use the manual builder or AI generator
4. **Host Games** - Create game sessions and share codes with players
5. **View Analytics** - Monitor performance and engagement

## 📚 Project Structure

```
free-kahoot/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── ai-jobs/       # AI generation endpoints
│   │   ├── games/         # Game management
│   │   └── quizzes/       # Quiz management
│   ├── dashboard/         # Main dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── prisma/               # Database schema and migrations
├── src/                  # Source utilities and services
└── public/               # Static assets
```

## 🎨 UI Components

The application uses a comprehensive set of UI components:

- **Button** - Multiple variants and sizes
- **Card** - Content containers with headers
- **Input** - Form inputs with validation
- **Textarea** - Multi-line text inputs
- **Tabs** - Navigation tabs
- **Badge** - Status indicators
- **Alert** - Notification components

## 🔧 API Endpoints

### Quizzes
- `GET /api/quizzes` - List user quizzes
- `POST /api/quizzes` - Create new quiz
- `GET /api/quizzes/[id]` - Get quiz details
- `PUT /api/quizzes/[id]` - Update quiz
- `DELETE /api/quizzes/[id]` - Delete quiz

### Games
- `GET /api/games` - List game sessions
- `POST /api/games` - Create new game
- `GET /api/games/[id]` - Get game details
- `POST /api/games/join` - Join game session

### AI Generation
- `POST /api/ai-jobs` - Start AI quiz generation
- `GET /api/ai-jobs/[id]` - Get generation status

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Configure Environment Variables**
   Add all required environment variables in Vercel dashboard

3. **Deploy**
   ```bash
   npx vercel --prod
   ```

### Build Commands

- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run dev` - Development server

## 🧪 Development

### Database Management
```bash
npx prisma studio     # Open database browser
npx prisma migrate dev # Run migrations
npx prisma generate    # Generate client
```

### Code Quality
```bash
npm run lint          # ESLint check
npm run type-check    # TypeScript check
```

## 🎮 How to Use

### Creating a Quiz
1. Navigate to Dashboard → Create Quiz
2. Enter quiz title and description
3. Add questions with multiple choice answers
4. Set time limits and points
5. Mark correct answers
6. Save or publish the quiz

### AI Generation
1. Go to Dashboard → AI Generate
2. Choose source type (URL or text)
3. Provide content
4. Set question count
5. Generate and review

### Hosting a Game
1. Select a published quiz
2. Click "Host New Game"
3. Share the game code with players
4. Monitor game progress
5. View results after completion

## 🔐 Authentication

The application currently runs in Demo Mode with a pre-configured demo user. Authentication features can be enabled by:

1. Setting up JWT secret
2. Implementing login/register pages
3. Adding authentication middleware
4. Updating API routes to require authentication

## 📊 Analytics

The platform provides comprehensive analytics:
- Quiz performance metrics
- Player engagement tracking
- Completion rates
- Score distributions
- Activity timelines

## 🎨 Customization

### Theming
The application uses Tailwind CSS with a dark theme. Customize colors in:
- `tailwind.config.js` - Theme configuration
- `app/globals.css` - CSS variables

### Components
All UI components are built with shadcn/ui and can be customized in the `components/ui/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the demo implementation

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**
