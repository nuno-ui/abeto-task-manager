# Abeto Task Manager

A comprehensive task management system built for Operations teams, with full project and task tracking, comments, and activity logging.

## Features

- **Project Management**: Create, edit, and track projects with status, priority, and progress
- **Task Management**: Detailed task breakdown with phases (Discovery → Monitoring)
- **Team Collaboration**: Comments on projects and tasks, activity tracking
- **COO-Friendly**: Designed for operational oversight with stakeholders, acceptance criteria, and success metrics
- **AI Assessment**: Track AI potential for each task

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready

### 2. Run the Database Schema

1. Go to your Supabase project → SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Paste and run it to create all tables, indexes, and policies

### 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Found in Project Settings → API
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Found in Project Settings → API

### 4. Configure Authentication (Optional)

For Google OAuth:
1. Go to Supabase → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials

### 5. Install Dependencies and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (app)/           # Authenticated routes
│   │   ├── dashboard/   # Dashboard page
│   │   ├── projects/    # Projects listing and detail
│   │   └── layout.tsx   # App layout with sidebar
│   ├── auth/            # Auth callback
│   ├── login/           # Login page
│   └── page.tsx         # Root redirect
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components (Sidebar, Header)
│   ├── projects/        # Project components
│   ├── tasks/           # Task components
│   └── comments/        # Comment components
├── lib/
│   ├── supabase/        # Supabase client setup
│   └── utils.ts         # Utility functions
├── types/
│   └── database.ts      # TypeScript types
└── middleware.ts        # Auth middleware
```

## Database Schema

The database includes:

- **teams**: Organization teams (Operations, Technology, Sales, etc.)
- **users**: User profiles with team assignments
- **pillars**: Project categorization (Data Foundation, Knowledge Generation, Human Empowerment)
- **projects**: Main project records
- **tasks**: Detailed task breakdown per project
- **comments**: Threaded comments on projects and tasks
- **activity_log**: Audit trail of all changes

## Deploying to Vercel

1. Push this repo to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## License

Private - Abeto Internal Use
