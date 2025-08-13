# Interactive Portfolio Website with Admin Backend

## Overview

This is a full-stack interactive portfolio website with a secure admin backend. The application allows showcasing case studies and project portfolios through a public-facing website while providing authenticated users with a complete content management system. The architecture supports easy content updates without code changes, featuring drag-and-drop media management, WYSIWYG editing, and responsive design optimized for both desktop and mobile experiences.

## User Preferences

Preferred communication style: Simple, everyday language.
Typography: Inter font family throughout the application.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Styling**: Tailwind CSS with shadcn/ui components for consistent design system
- **Animations**: Framer Motion for smooth transitions and interactive elements
- **Forms**: React Hook Form with Zod validation for robust form handling

### Backend Architecture
- **Server**: Express.js with TypeScript for API endpoints and middleware
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with session-based authentication
- **File Handling**: Multer middleware for file uploads with validation
- **Development**: Vite for hot module replacement and build optimization

### Database Design
- **Users Table**: Stores authenticated user information for admin access
- **Projects Table**: Portfolio items with title, description, content, media, and status
- **Media Table**: File management with metadata and references
- **Contact Submissions**: Form submissions from public visitors
- **Sessions Table**: Secure session storage for authentication

### Authentication & Authorization
- **Replit Auth**: OAuth-based authentication for secure admin access
- **Session Management**: PostgreSQL-backed sessions with configurable TTL
- **Route Protection**: Middleware-based authentication for admin endpoints
- **Authorization Levels**: Public routes for portfolio viewing, protected routes for content management

### Content Management System
- **WYSIWYG Editor**: Rich text editing for project content
- **Media Manager**: Drag-and-drop file uploads with automatic optimization
- **Project Editor**: Form-based creation and editing with real-time preview
- **Status Management**: Draft and published states for content workflow
- **Tag System**: Flexible categorization and filtering capabilities

### API Structure
- **Public API**: `/api/projects/*` for portfolio content retrieval
- **Admin API**: `/api/admin/*` for content management operations
- **Contact API**: `/api/contact` for form submissions
- **Auth API**: `/api/auth/*` for authentication flow
- **Media API**: `/api/admin/media` for file operations

### Responsive Design
- **Mobile-First**: Tailwind CSS breakpoints for all screen sizes
- **Component Library**: shadcn/ui for consistent, accessible components
- **Performance**: Optimized images and lazy loading for fast page loads
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## External Dependencies

### Database & Storage
- **Neon Database**: PostgreSQL hosting with connection pooling
- **Local File Storage**: Multer-based file uploads to server filesystem
- **Session Storage**: Database-backed sessions via connect-pg-simple

### Authentication
- **Replit Auth**: OAuth provider integration for secure admin login
- **OpenID Connect**: Standards-based authentication flow

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Consistent icon library
- **Google Fonts**: Typography with Inter, Architects Daughter, and Geist Mono

### Development Tools
- **Vite**: Build tool with HMR and optimized bundling
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast bundling for production builds
- **Drizzle Kit**: Database migrations and schema management

### Form & Validation
- **Zod**: Runtime type validation for forms and API
- **React Hook Form**: Performance-optimized form handling
- **Date-fns**: Date formatting and manipulation utilities