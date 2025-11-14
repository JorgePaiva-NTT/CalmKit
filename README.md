# CalmKit

A modern mental health and wellness web application designed to help users manage anxiety, practice mindfulness, and maintain emotional well-being through guided exercises, coaching, and AI-powered support.

## 🌟 Features

### 📊 Dashboard
- Quick access to all tools and features
- Emotion tracking card with visual feedback
- Guided coaching access
- AI chat integration

### 🧘 Guided Coach
- Step-by-step wellness routines
- Timer-based exercises with visual progress
- Multiple coaching sessions:
  - Emergency 30-Second Reset
  - 3-Minute Let Them & Reset
  - Breathing exercises
  - Grounding techniques

### ⚓ Anchors
- Curated collection of grounding phrases
- Organized by categories:
  - Soothing & Grounding
  - Let Them / Acceptance
  - Focus & Presence
  - Self-Compassion
- Quick access during moments of stress

### 📝 Emotion Log
- Track and log your emotional state
- Pre-defined emotion categories with emojis
- Historical view of logged emotions
- Search and filter functionality
- Export data for personal records
- Local storage with offline support

### 💬 AI Chat
- AI-powered conversational support
- Context-aware responses
- Chat history management
- Helpful for processing thoughts and feelings

### 🔐 Authentication
- Secure user authentication
- Protected routes and features
- Token-based session management

## 🛠️ Technology Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 7
- **UI Library**: Material-UI (MUI) 7
- **State Management**: React Context API
- **Local Storage**: Dexie (IndexedDB wrapper)
- **HTTP Client**: Axios
- **Markdown Support**: react-markdown with syntax highlighting
- **Code Quality**: ESLint

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager
- Backend API server (for authentication and AI chat features)

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/JorgePaiva-NTT/CalmKit.git
cd CalmKit
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://your-api-server:port/api
```

## 💻 Usage

### Development Mode
Start the development server with hot module replacement:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Production Build
Build the application for production:
```bash
npm run build
```

### Preview Production Build
Preview the production build locally:
```bash
npm run preview
```

### Linting
Run ESLint to check code quality:
```bash
npm run lint
```

## 📁 Project Structure

```
CalmKit/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── chat/       # Chat feature components
│   │   ├── Anchors.jsx
│   │   ├── Auth.jsx
│   │   ├── Coach.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Export.jsx
│   │   ├── Header.jsx
│   │   ├── Log.jsx
│   │   ├── LogHistory.jsx
│   │   └── NavBar.jsx
│   ├── context/        # React Context providers
│   ├── utils/          # Utility functions and helpers
│   ├── App.jsx         # Main application component
│   ├── calmData.js     # Static data (routines, anchors, emotions)
│   ├── main.jsx        # Application entry point
│   └── ThemeContext.jsx # Theme configuration
├── .env                # Environment variables (not in git)
├── index.html          # HTML entry point
├── package.json        # Project dependencies and scripts
└── vite.config.js      # Vite configuration
```

## 🔧 Configuration

### Environment Variables

- `VITE_API_URL`: Backend API server URL for authentication and AI chat

### Vite Configuration

The project uses Vite as the build tool with React plugin. Configuration can be found in `vite.config.js`.

## 🎯 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code linting |

## ⚠️ Important Disclaimer

**This application is not medical advice.** CalmKit is designed for grounding and reflection purposes only. If you're experiencing a mental health crisis or need professional support, please contact:

- Emergency Services: 911 (US) or your local emergency number
- National Suicide Prevention Lifeline: 988 (US)
- Crisis Text Line: Text HOME to 741741
- Your healthcare provider or mental health professional

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

Built with modern web technologies to provide accessible mental health tools and resources.
