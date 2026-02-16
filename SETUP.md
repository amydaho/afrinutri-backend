# Backend Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account
- OpenAI API key

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

**Note**: The project already includes `@nestjs/config` for environment variable management.

### 2. Configure Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Project Settings** > **API**
3. Copy the following values:
   - Project URL → `SUPABASE_URL`
   - `anon` `public` key → `SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Set Up Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run it in the SQL Editor
4. (Optional) Run `supabase/seed.sql` for test data

### 4. Configure Environment Variables

Create a `.env` file in the backend root directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key_here

# Application
PORT=3001
NODE_ENV=development
```

### 5. Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in or create an account
3. Go to **API Keys** section
4. Create a new secret key
5. Copy it to your `.env` file as `OPENAI_API_KEY`

### 6. Start the Development Server

```bash
npm run start:dev
```

The server will start on `http://localhost:3001`

## API Endpoints

### Nutrition Endpoints

- `POST /nutrition/meals` - Create a new meal
- `POST /nutrition/meals/:mealId/ingredients` - Add ingredient to meal
- `GET /nutrition/meals?userId=xxx&date=YYYY-MM-DD` - Get meals by date
- `GET /nutrition/summary?userId=xxx&date=YYYY-MM-DD` - Get nutrition summary
- `PUT /nutrition/summary` - Update nutrition log
- `POST /nutrition/analyze-food` - Analyze food image with AI

### AI Endpoints

- `POST /ai/generate` - Generate AI completion
- `POST /ai/analyze-nutrition` - Analyze nutrition from image

## Database Schema

### Tables

- **users** - User accounts
- **meals** - Meal records (breakfast, lunch, dinner, snack)
- **ingredients** - Ingredients for each meal
- **nutrition_logs** - Daily nutrition summaries
- **food_scans** - AI-analyzed food images

## Tech Stack

- **NestJS** - Backend framework
- **Vercel AI SDK** - AI integration
- **Supabase** - PostgreSQL database
- **TypeScript** - Type safety
- **OpenAI GPT-4** - Vision and text analysis

## Troubleshooting

### TypeScript Errors

If you see import errors, reload the TypeScript server in your IDE or restart the dev server.

### Database Connection Issues

- Verify your Supabase credentials in `.env`
- Check that your Supabase project is active
- Ensure the database schema has been created

### AI Analysis Not Working

- Verify your OpenAI API key is valid
- Check that you have credits in your OpenAI account
- Ensure the image is properly base64 encoded
