# 🎮 Marvelous Quiz - Real-time Multiplayer Quiz Game

A modern, interactive multiplayer quiz application built for birthday parties and social gatherings. Features real-time synchronization, anti-cheating mechanisms, and stunning WebGL-powered liquid gradient backgrounds.

**Live Demo:** [https://birthday-quiz-v2.vercel.app](https://birthday-quiz-v2.vercel.app)

![Tech Stack](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture & Design](#-architecture--design)
- [Project Structure](#-project-structure)
- [File Documentation](#-file-documentation)
- [Database Schema](#-database-schema)
- [Setup & Installation](#-setup--installation)
- [Deployment](#-deployment)
- [Game Flow](#-game-flow)

---

## 🌟 Overview

Marvelous Quiz is a Kahoot-style quiz application with several key improvements:
- **Mobile-First Design**: No projector needed - all players view questions on their own devices
- **Anti-Cheating System**: Each player sees options in a different randomized order
- **Host-Specific View**: The host doesn't answer questions but monitors statistics and controls game flow
- **Real-time Synchronization**: Live leaderboards, answer tracking, and game state updates
- **Modern Animations**: WebGL liquid gradients, physics-based lobby interactions, and smooth transitions

This application was built for a birthday party with 26 custom questions and features advanced player tracking, RSVP functionality for specific questions, and shareable results.

---

## ✨ Key Features

### For Players
- 🎨 **Avatar & Username Selection**: Choose from 24 emoji avatars with custom usernames
- 📱 **Mobile-Optimized Interface**: Responsive design for all screen sizes
- 🎯 **Interactive Gameplay**: Touch-responsive answer buttons with haptic feedback
- ⏱️ **Speed-Based Scoring**: Faster correct answers earn more points
- 📊 **Live Leaderboards**: See rankings update in real-time
- 🎉 **Animated Results**: Podium display for top 3 players with confetti effects
- 💬 **Personal Quotes**: Display custom messages on results screen

### For Hosts
- 🎮 **Full Game Control**: Start games, advance questions, and end sessions
- 📈 **Real-time Statistics**: Track who has answered and see response counts
- 👥 **Player Management**: View all connected players and their scores
- 📸 **Screenshot Functionality**: Capture and share final results
- 🎤 **RSVP Tracking**: Special feature for Question 26 (Matt Rife comedy show attendance)
- 🔍 **Detailed Analytics**: View answer distributions and player statistics

### Technical Features
- 🔄 **Real-time Sync**: Supabase Realtime for instant updates across all devices
- 🛡️ **Anti-Cheating**: Server-side option shuffling stored per player
- 🎨 **WebGL Gradients**: Three.js-powered animated backgrounds with mouse/touch interaction
- ⚡ **Optimized Performance**: Lighthouse scores >90 for performance and accessibility
- 🎵 **Background Music**: Integrated audio player with play/pause/mute controls
- 🔐 **Row Level Security**: Supabase RLS policies for secure data access

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.6** - React framework with App Router
- **React 19.2.3** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling with PostCSS
- **Three.js 0.182.0** - WebGL 3D graphics for liquid gradients
- **Matter.js 0.20.0** - 2D physics engine for player lobby interactions

### Backend & Database
- **Supabase** - PostgreSQL database with real-time subscriptions
  - Real-time channels for live updates
  - Row Level Security (RLS) policies
  - Automatic REST API generation
  - Built-in authentication (not used in current implementation)

### Utilities & Tools
- **html2canvas 1.4.1** - Screenshot functionality for results page
- **ESLint 9** - Code linting with Next.js config
- **PostCSS** - CSS processing for Tailwind

### Deployment
- **Vercel** - Serverless deployment platform with edge functions
- **Git** - Version control with SSH authentication

---

## 🏗️ Architecture & Design

### Design Patterns

#### 1. **Client-Server Real-time Synchronization**
The app uses Supabase's real-time features to maintain synchronized state across all connected clients:
```typescript
// Subscribe to game changes
const channel = supabase
  .channel(`game-${gameId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'games'
  }, handler)
  .subscribe();
```

#### 2. **Anti-Cheating Architecture**
Options are shuffled server-side and stored in the database:
- Each player gets a unique `option_shuffles` record per question
- Original indexes are stored and used for answer validation
- Prevents players from seeing the same option order

#### 3. **Role-Based Views**
Players and hosts see different interfaces controlled by the `is_host` flag:
- **Host**: Game controls, statistics, full leaderboard
- **Player**: Answer interface, personal stats, limited leaderboard

#### 4. **Progressive Enhancement**
Features degrade gracefully:
- WebGL gradients fall back to solid colors
- Touch interactions work without haptic feedback
- Music player is optional and unobtrusive

### Application Flow

```
┌─────────────┐
│   Home Page │ ← Create Game or Join Game
└──────┬──────┘
       │
       ├─────────────────┬──────────────────┐
       │                 │                  │
       v                 v                  v
  ┌─────────┐      ┌──────────┐      ┌──────────┐
  │  Host   │      │  Player  │      │ Database │
  │  Lobby  │      │  Join    │      │ (Supabase)│
  └────┬────┘      └─────┬────┘      └─────┬────┘
       │                 │                  │
       │◄────Real-time Sync──────────────────►
       │                 │
       v                 v
  ┌─────────┐      ┌──────────┐
  │  Host   │      │  Player  │
  │  Game   │      │  Lobby   │
  └────┬────┘      └─────┬────┘
       │                 │
       │    Start Game   │
       │─────────────────►
       │                 v
       │           ┌──────────┐
       │           │  Player  │
       │           │  Game    │
       │◄──────────┴─────┬────┘
       │                 │
       │   Submit Answers│
       │◄────────────────┘
       │
       v
  ┌─────────┐      ┌──────────┐
  │  Host   │      │  Player  │
  │ Results │      │ Results  │
  └─────────┘      └──────────┘
```

---

## 📁 Project Structure

```
birthday-quiz-v2/
├── app/                          # Next.js App Router pages
│   ├── favicon.ico               # App icon
│   ├── globals.css               # Global styles and animations
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Home page (create/join game)
│   │
│   ├── player/                   # Player-specific routes
│   │   ├── join/
│   │   │   └── page.tsx          # Username & avatar selection
│   │   ├── lobby/[code]/
│   │   │   └── page.tsx          # Player waiting room with physics
│   │   ├── game/[code]/
│   │   │   └── page.tsx          # Player game interface
│   │   └── results/[code]/
│   │       └── page.tsx          # Player results with podium
│   │
│   └── host/                     # Host-specific routes
│       ├── lobby/[code]/
│       │   └── page.tsx          # Host lobby with start button
│       ├── game/[code]/
│       │   └── page.tsx          # Host game control interface
│       └── results/[code]/
│           └── page.tsx          # Host results with RSVP feature
│
├── components/                   # Reusable React components
│   ├── BackgroundMusic.tsx       # Audio player with controls
│   ├── Robot3D.tsx               # (Unused) 3D robot component
│   ├── ShareButton.tsx           # Screenshot sharing utility
│   └── ui/
│       └── flow-gradient-hero-section.tsx  # WebGL liquid gradient
│
├── lib/                          # Core business logic
│   ├── game-logic.ts             # Questions, scoring, shuffling
│   └── supabase.ts               # Supabase client configuration
│
├── public/                       # Static assets
│   ├── music/
│   │   ├── yuno-miles.mp3        # Background music track
│   │   └── README.md
│   ├── pipi.jpg                  # Profile picture (cat avatar)
│   ├── mattrife.png              # Question 26 image
│   └── *.svg                     # Various icon assets
│
├── supabase/                     # Database migrations
│   └── migrations/
│       ├── 001_complete_schema.sql
│       ├── 001_complete_schema_fixed.sql
│       └── 001_fresh_project_schema.sql
│
├── .env.local                    # Environment variables (not in git)
├── .gitignore
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
├── postcss.config.mjs            # PostCSS for Tailwind
├── eslint.config.mjs             # ESLint rules
└── README.md                     # This file
```

---

## 📄 File Documentation

### Core Application Files

#### `app/page.tsx` - Home Page
**Purpose**: Entry point for creating or joining games
**Features**:
- Create new game with random 6-digit room code
- Join existing game by entering room code
- Liquid gradient background with interactive animations
- Background music player
- Profile picture display (Pipi the cat)

**Key Logic**:
```typescript
// Generate room code and create game
const newRoomCode = generateRoomCode();
const { data } = await supabase.from('games').insert([{
  room_code: newRoomCode,
  status: 'waiting',
  current_question_index: 0
}]);
```

---

#### `app/player/join/page.tsx` - Player Join
**Purpose**: Avatar and username selection before joining lobby
**Features**:
- 24 emoji avatar options
- Username input with uniqueness validation
- Room code validation
- Optional personal quote input

**Database Operations**:
- Validates game existence
- Creates player record with `is_host: false`
- Checks for username conflicts within the game

---

#### `app/player/lobby/[code]/page.tsx` - Player Lobby
**Purpose**: Waiting room with physics-based avatar interactions
**Features**:
- Matter.js physics engine for bouncing avatars
- Real-time player list updates via Supabase subscriptions
- Waiting for host to start the game
- Animated gradient background

**Technical Highlights**:
```typescript
// Subscribe to new players joining
const channel = supabase
  .channel(`players-${gameId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'players'
  }, (payload) => {
    setPlayers(prev => [...prev, payload.new]);
  })
  .subscribe();
```

---

#### `app/player/game/[code]/page.tsx` - Player Game
**Purpose**: Main gameplay interface for answering questions
**Features**:
- Shuffled answer options (unique per player)
- 30-second countdown timer with visual urgency (red at <5s)
- Immediate feedback on answer selection (green/red animation)
- Speed-based scoring calculation
- Real-time leaderboard updates

**Anti-Cheating Implementation**:
```typescript
// Fetch player-specific shuffled options from database
const { data: shuffleData } = await supabase
  .from('option_shuffles')
  .select('shuffled_order')
  .eq('player_id', playerId)
  .eq('question_index', currentQuestionIndex)
  .single();

// Use stored shuffle order or generate new one
const shuffledOptions = shuffleData?.shuffled_order || generatePlayerShuffle();
```

**Scoring Logic**:
- Base points: 0 (no credit for just being correct)
- Speed bonus: `(timeLeft / 30) * 100` points
- Maximum possible: 100 points per question

---

#### `app/player/results/[code]/page.tsx` - Player Results
**Purpose**: Final results with podium animation
**Features**:
- Top 3 podium with gold/silver/bronze medals
- Personal quote display (if provided during join)
- Full leaderboard with avatars
- Confetti animation for winners
- "Start New Quiz" button

**Animations**:
- Staggered entrance animations for each podium position
- Scale and position animations based on rank
- Glow effects for top positions

---

#### `app/host/lobby/[code]/page.tsx` - Host Lobby
**Purpose**: Host waiting room with game start control
**Features**:
- Special host avatar (robot/crown icon)
- Player count display
- Real-time player list with avatars
- "Start Game" button (only visible to host)
- Room code display for sharing

**Game Start Logic**:
```typescript
// Update game status to start
await supabase
  .from('games')
  .update({ status: 'playing' })
  .eq('id', gameId);

// Redirect to game screen
router.push(`/host/game/${roomCode}`);
```

---

#### `app/host/game/[code]/page.tsx` - Host Game Control
**Purpose**: Host interface for monitoring gameplay
**Features**:
- Question display (non-interactive)
- Real-time answer status tracking (who has answered)
- Live leaderboard (top 5 players)
- Timer display
- "Next Question" / "View Results" control buttons
- Automatic progression when all players answer

**Real-time Answer Tracking**:
```typescript
// Subscribe to answer submissions
const channel = supabase
  .channel(`game-answers-${gameId}-q${currentQuestionIndex}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'answers',
    filter: `game_id=eq.${gameId}`
  }, async (payload) => {
    if (payload.new.question_index === currentQuestionIndex) {
      // Update answered players list
      refetchAnsweredPlayers();
    }
  })
  .subscribe();
```

---

#### `app/host/results/[code]/page.tsx` - Host Results
**Purpose**: Host-specific results view with analytics
**Features**:
- Full leaderboard (all players)
- Screenshot functionality via html2canvas
- **RSVP Feature for Question 26**: Special modal showing who wants to attend the Matt Rife comedy show
  - Summary statistics (Yes/No/Maybe counts)
  - Grouped player lists with avatars
  - Color-coded responses (green/red/yellow)
- Confetti animation

**RSVP Implementation**:
```typescript
// Fetch Question 26 answers
const { data: q26Answers } = await supabase
  .from('answers')
  .select('player_id, selected_option')
  .eq('game_id', gameId)
  .eq('question_index', 25); // Question 26 is index 25

// Group by selected option (0=Yes, 1=No, 2=Maybe)
const yesPlayers = q26Answers.filter(a => a.selected_option === 0);
const noPlayers = q26Answers.filter(a => a.selected_option === 1);
const maybePlayers = q26Answers.filter(a => a.selected_option === 2);
```

---

### Component Files

#### `components/ui/flow-gradient-hero-section.tsx` - Liquid Gradient
**Purpose**: WebGL-powered animated background for all pages
**Technology**: Three.js with custom GLSL shaders
**Features**:
- Perlin noise-based flowing animation
- Mouse/touch interaction with texture feedback
- Custom cursor effects (desktop only)
- Light color palette: sky blue, light green, white-green
- Performance optimized with requestAnimationFrame

**Shader Implementation**:
```glsl
// Fragment shader excerpt
vec3 color1 = vec3(0.529, 0.808, 0.980); // Sky blue
vec3 color2 = vec3(0.596, 0.984, 0.596); // Light green
vec3 color3 = vec3(0.878, 0.988, 0.878); // White-green

// Animated noise layers
float noise1 = snoise(uv * 2.0 + uTime * 0.1);
float noise2 = snoise(uv * 3.0 - uTime * 0.15);
float combined = (noise1 + noise2 * 0.5) / 1.5;

vec3 finalColor = mix(color1, color2, (combined + 1.0) * 0.5);
```

---

#### `components/BackgroundMusic.tsx` - Music Player
**Purpose**: Background audio with user controls
**Features**:
- HTML5 audio element with React refs
- Play/Pause toggle
- Mute toggle
- Volume set to 30% by default
- Loop playback
- Fixed position in bottom-right corner

**Audio Source**: `/music/yuno-miles.mp3`

---

### Library Files

#### `lib/game-logic.ts` - Core Game Logic
**Purpose**: Centralized game mechanics and question database
**Exports**:

1. **`sampleQuestions`**: Array of 26 quiz questions
   - Each question has: id, question text, options array, correctAnswer index, points (always 0)
   - Question 1: Intentional typo "BioEnginearing" for fun
   - Question 26: Matt Rife comedy show RSVP (Yes/No/Maybe)

2. **`generateRoomCode()`**: Creates random 6-digit numeric code
   ```typescript
   return Math.floor(100000 + Math.random() * 900000).toString();
   ```

3. **`shuffleArray()`**: Fisher-Yates shuffle algorithm
   ```typescript
   for (let i = array.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [array[i], array[j]] = [array[j], array[i]];
   }
   ```

4. **`calculatePoints()`**: Speed-based scoring
   ```typescript
   const speedMultiplier = timeLeft / 30; // 0 to 1
   return Math.round(speedMultiplier * 100);
   ```

5. **`generatePlayerShuffle()`**: Creates and stores shuffled options per player
   ```typescript
   const shuffled = shuffleArray([0, 1, 2, 3]);
   await supabase.from('option_shuffles').insert({
     player_id: playerId,
     question_index: questionIndex,
     shuffled_order: shuffled
   });
   ```

---

#### `lib/supabase.ts` - Database Client
**Purpose**: Supabase client initialization
**Configuration**:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key

---

### Styling Files

#### `app/globals.css` - Global Styles
**Purpose**: Tailwind imports and custom animations
**Includes**:

1. **Tailwind Directives**:
   ```css
   @import "tailwindcss";
   ```

2. **Custom Animations**:
   - `@keyframes slide-up`: Entrance animation for cards
   - `@keyframes fade-in`: Opacity transition
   - `@keyframes shake`: Error feedback animation
   - `@keyframes confetti-fall`: Falling confetti particles

3. **Liquid Gradient Styles**:
   ```css
   .liquid-container {
     position: fixed;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     z-index: 0;
     pointer-events: none;
   }
   ```

4. **Custom Cursor** (desktop only):
   ```css
   .cursor-dot-element {
     width: 8px;
     height: 8px;
     background: rgba(255, 255, 255, 0.8);
     border-radius: 50%;
     pointer-events: none;
   }
   ```

5. **Utility Classes**:
   - `.btn-primary`: Primary button styling
   - `.input-modern`: Modern input field styling
   - `.animate-slide-up`, `.animate-fade-in`: Animation utilities

---

## 🗄️ Database Schema

### Tables

#### `games`
Stores game sessions
```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(6) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting',  -- waiting, playing, finished
  current_question_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `players`
Stores player information
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL,
  avatar VARCHAR(10) NOT NULL,
  personal_quote TEXT,
  score INTEGER DEFAULT 0,
  is_host BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, username)
);
```

#### `answers`
Stores player answers
```sql
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  selected_option INTEGER NOT NULL,
  time_taken INTEGER NOT NULL,  -- seconds
  is_correct BOOLEAN NOT NULL,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, question_index)
);
```

#### `option_shuffles`
Stores per-player shuffled option orders
```sql
CREATE TABLE option_shuffles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  shuffled_order INTEGER[] NOT NULL,  -- e.g., [2, 0, 3, 1]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, question_index)
);
```

### Row Level Security (RLS)
All tables have RLS enabled with public access policies:
```sql
CREATE POLICY "Allow all operations" ON [table_name]
  FOR ALL USING (true) WITH CHECK (true);
```

### Realtime Subscriptions
All tables are published to Supabase Realtime:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE answers;
ALTER PUBLICATION supabase_realtime ADD TABLE option_shuffles;
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 20+
- npm or yarn
- Supabase account
- Git (for version control)

### Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd birthday-quiz-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase database**
   - Create a new Supabase project
   - Run the migration file: `supabase/migrations/001_complete_schema.sql`
   - Copy your project URL and anon key to `.env.local`

4. **Add music file** (optional)
   - Place your music file at `public/music/yuno-miles.mp3`
   - Or remove the `BackgroundMusic` component from `app/page.tsx`

5. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

---

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI** (if not already)
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to production**
   ```bash
   vercel --prod
   ```

4. **Set environment variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Redeploy after adding variables

### Supabase Configuration
- Ensure your Vercel domain is added to Supabase's allowed domains
- Go to Supabase Dashboard → Settings → API → URL Configuration

---

## 🎯 Game Flow

### 1. **Create Game** (Host)
   - Home page → Click "主持人" tab
   - System generates 6-digit room code
   - Game record created in database with status `waiting`
   - Host redirected to Host Lobby

### 2. **Join Game** (Players)
   - Home page → Enter room code → Submit
   - Player Join page → Select avatar, enter username
   - Optional: Enter personal quote
   - Player record created with `is_host: false`
   - Player redirected to Player Lobby

### 3. **Lobby Phase**
   - **Players**: See all joined players with physics animations, wait for host
   - **Host**: See all players, click "開始遊戲" when ready
   - Real-time updates via Supabase subscription

### 4. **Start Game** (Host Action)
   - Game status updated to `playing`
   - All players automatically redirected to game screen

### 5. **Gameplay** (Per Question)
   - **Players**:
     - See question with shuffled options (unique per player)
     - 30-second timer counts down
     - Select answer → Immediate visual feedback
     - Points calculated based on speed
     - Wait for host to advance

   - **Host**:
     - Monitor who has answered
     - See live leaderboard
     - Click "下一題" when ready or auto-advance when all answered

### 6. **Question Loop**
   - Repeat for all 26 questions
   - Leaderboard updates after each question
   - Special handling for Question 26 (RSVP tracking)

### 7. **Results Phase**
   - Game status updated to `finished`
   - **Players**:
     - See podium animation for top 3
     - View full leaderboard with personal rank
     - Display personal quote (if provided)
     - Option to start new quiz

   - **Host**:
     - Full leaderboard with all players
     - Screenshot functionality
     - RSVP results modal for Question 26
     - See who wants to attend comedy show

---

## 🎨 Design Choices

### Color Palette
- **Primary Gradient**: Sky Blue (#87CEEB) → Light Green (#98FB98)
- **Accent Colors**:
  - Orange-Red (#E76F51) - Primary CTAs
  - Yellow (#E9C46A) - Secondary highlights
  - Dark Blue (#264653) - Text and borders
  - Green (#52B788) - Success states

### Typography
- **Font**: System font stack (San Francisco, Segoe UI, etc.)
- **Weights**:
  - Regular (400) for body text
  - Semibold (600) for labels
  - Bold (700) for headings
  - Black (900) for emphasis

### Animations
- **Entrance**: Slide-up with stagger delays
- **Interactions**: Scale transforms on hover/active
- **Feedback**: Shake for errors, glow for success
- **Physics**: Matter.js for realistic avatar bouncing

### Accessibility
- High contrast ratios for text (WCAG AA compliant)
- Large tap targets (minimum 44x44px)
- Keyboard navigation support
- Screen reader compatible semantic HTML

---

## 🧪 Technical Highlights

### Real-time Synchronization
Uses Supabase's PostgreSQL real-time subscriptions to maintain synchronized state across all connected clients without polling.

### Anti-Cheating System
Each player receives a unique shuffled option order stored in the database, preventing answer copying and ensuring fair play.

### WebGL Performance
The liquid gradient background uses Three.js with optimized shaders, maintaining 60fps on most devices while providing rich visual feedback.

### Physics Simulation
Player lobby uses Matter.js for realistic 2D physics, creating engaging wait-time experiences with bouncing avatar interactions.

### Speed-Based Scoring
Scoring rewards both accuracy and speed, with faster correct answers earning up to 100 points per question.

### Mobile Optimization
Fully responsive design with touch-optimized controls, haptic feedback support, and mobile-first layout considerations.

---

## 📝 Custom Questions

To modify the quiz questions, edit `lib/game-logic.ts`:

```typescript
export const sampleQuestions: Question[] = [
  {
    id: 1,
    question: "Your question text here?",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
    correctAnswer: 0, // Index of correct option (0-3)
    points: 0 // Always 0 (scoring is speed-based)
  },
  // Add more questions...
];
```

**Current Implementation**: 26 custom questions about "Marvin" for a birthday party.

---

## 🙏 Acknowledgments

- **Next.js Team** - For the incredible React framework
- **Supabase Team** - For real-time database infrastructure
- **Three.js Community** - For WebGL rendering capabilities
- **Vercel** - For seamless deployment experience

---

## 📧 Contact

For questions or suggestions, please create an issue in this repository.

---

**Built with ❤️ using AI-assisted development (Claude Code)**
