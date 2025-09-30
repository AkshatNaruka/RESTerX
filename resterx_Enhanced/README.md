# RESTerX - React/Next.js Version

This is the enhanced React version of RESTerX, built with Next.js 14, React 18, TypeScript, and modern UI components.

## Features

- ⚡ **Built with Next.js 14**: Server-side rendering and optimal performance
- ⚛️ **React 18**: Latest React features and improvements
- 🎨 **Modern UI**: Powered by Radix UI and Tailwind CSS
- 🔧 **TypeScript**: Type-safe development
- 📱 **Responsive Design**: Works seamlessly on all devices
- 🌗 **Dark/Light Mode**: Built-in theme switching
- 💾 **Local Storage**: All data stored client-side for privacy
- 🚀 **Code Generation**: Generate API calls in multiple languages
- 📚 **Collections**: Organize your API requests
- 🔑 **Environment Variables**: Manage different environments
- ⌨️ **Keyboard Shortcuts**: Boost your productivity

## Getting Started

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

```bash
npm run build
npm start
```

## Deploy to Vercel

The easiest way to deploy this app is to use Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AkshatNaruka/RESTerX&project-name=resterx&repository-name=resterx&root-directory=resterx_Enhanced)

Or manually:

```bash
npm i -g vercel
vercel
```

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **State Management**: React Hooks

## Project Structure

```
resterx_Enhanced/
├── app/                  # Next.js app directory
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main page component
│   └── globals.css      # Global styles
├── components/          # Reusable components
│   └── ui/             # UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── public/             # Static assets
└── styles/             # Additional styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

This app runs entirely client-side and doesn't require any environment variables. All data is stored in browser localStorage.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the [MIT License](../LICENSE).
