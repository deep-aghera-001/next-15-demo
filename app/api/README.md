# API Routes

This directory contains API routes for server-side interactions with Supabase.

## Structure

- `/api/users` - User management (admin only)
- `/api/profiles` - Profile management
- `/api/protected` - Example of protected routes

## Authentication

- Routes under `/api/users` use the service role key and should only be called by admins
- Routes under `/api/protected` require user authentication
- Other routes can be public or have custom authentication logic

## Security

- Never expose the service role key to the client
- Always validate and sanitize input data
- Use appropriate error handling

## Setup

1. Obtain your Supabase service role key from your Supabase project dashboard (Settings > API)
2. Replace `your-service-role-key-here` in `.env.local` with your actual service role key
3. Restart the development server