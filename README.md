# CalmKit

A modern mental health and wellness web application designed to help users manage anxiety, practice mindfulness, and maintain emotional well-being through guided exercises, coaching, and AI-powered support.

## 🛠️ Technology Stack

### Core

- **Frontend Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: JavaScript (ES6+)

### UI & Styling

- **UI Library**: Material-UI (MUI) 7
- **Icons**: MUI Icons
- **Styling**: Emotion
- **Charts**: MUI X-Charts

### State & Data

- **State Management**: React Context API
- **HTTP Client**: Axios 1.12
- **Data Visualization**: D3.js 7.9

### Content & Display

- **Markdown**: react-markdown
- **Syntax Highlighting**: react-syntax-highlighter
- **Markdown Extensions**: remark-gfm

### Development

- **Code Quality**: ESLint with React plugins
- **Analytics**: Vercel Analytics (optional)

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

### Data Encryption

Optional end-to-end encryption for sensitive emotion logs:

- Client-side encryption key derivation
- AES-256-GCM encryption
- Keys stored securely with user account

## 🎯 Available Scripts

| Script            | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start development server with HMR |
| `npm run build`   | Build production bundle           |
| `npm run preview` | Preview production build locally  |
| `npm run lint`    | Run ESLint code linting           |

### Environment-Specific Builds

Create multiple `.env` files for different environments:

- `.env.development` - Development settings
- `.env.production` - Production settings
- `.env.staging` - Staging environment

Vite automatically loads the appropriate file based on the mode.

## ⚠️ Important Disclaimer

**This application is not medical advice.** CalmKit is designed for grounding and reflection purposes only. If you're experiencing a mental health crisis or need professional support, please contact:

- Emergency Services: local emergency number
- Your healthcare provider or mental health professional

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Code Style

- Use ESLint configuration provided
- Follow React best practices and hooks rules
- Use functional components with hooks
- Maintain Material-UI theming consistency
- Write descriptive commit messages

## �📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

Built with modern web technologies to provide accessible mental health tools and resources.

### Special Thanks

- **React Team** - For the amazing framework
- **Material-UI Team** - For the comprehensive component library
- **Vite Team** - For the lightning-fast build tool
- **Google Gemini** - For AI-powered conversational support
- **Open Source Community** - For all the amazing tools and libraries
