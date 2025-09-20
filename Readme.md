# Overview

Speak Africa is a voice translation application focused on bidirectional translation between English and Kinyarwanda. The app provides speech-to-text transcription, text translation, and text-to-speech functionality through a modern web interface. It's designed as a mobile-first PWA with an African-themed UI and stores translation history for easy reference.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client uses React with TypeScript and follows a component-based architecture. The UI is built with Tailwind CSS and shadcn/ui components for consistent styling. Routing is handled by Wouter for lightweight navigation. The app uses TanStack Query for server state management and includes custom hooks for audio recording/playback functionality.

Key frontend patterns:
- Mobile-first responsive design with bottom navigation
- Custom hooks for audio operations (recording, playback)
- Form validation using React Hook Form with Zod schemas
- Component composition with Radix UI primitives

## Backend Architecture
The server uses Express.js with TypeScript in ESM format. It follows a modular service architecture with separate concerns for speech processing, translation, and data storage. The API uses RESTful endpoints with proper error handling and request logging middleware.

Core backend services:
- Speech service for audio transcription and synthesis
- Translation service for text conversion between languages
- Storage service with both in-memory and database implementations
- File handling for audio uploads using multer

## Data Storage Solutions
The application uses a dual storage approach:
- PostgreSQL database with Drizzle ORM for production data persistence
- In-memory storage implementation for development/testing
- Shared schema definitions using Drizzle-Zod for type safety
- Database migrations managed through Drizzle Kit

## Authentication and Authorization
Currently implements basic request validation without complex authentication. The system is designed to be extended with proper user authentication and session management as needed.

# External Dependencies

## Database Services
- **PostgreSQL**: Primary database using Neon serverless for cloud deployment
- **Drizzle ORM**: Type-safe database queries and migrations
- **connect-pg-simple**: Session store for PostgreSQL

## AI Services
- **Google Gemini API**: Unified pipeline for speech-to-text transcription, text translation, and text-to-speech synthesis for both English and Kinyarwanda

## UI and Styling
- **Tailwind CSS**: Utility-first styling framework
- **Radix UI**: Headless component primitives
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library

## Audio Processing
- **Web Audio APIs**: Browser-native audio recording and playback
- **MediaRecorder API**: Audio capture functionality
- **Custom audio utilities**: Wrapper classes for recording and playback

## Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Backend bundling for production deployment
- **Replit plugins**: Development environment integration