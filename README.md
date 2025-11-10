# Next.js 15 Supabase Authentication App

This is a Next.js 15 application with Supabase authentication, including email/password and OAuth providers (GitHub and Google).

## Features

- Email/password authentication (sign up, login, logout)
- OAuth authentication with GitHub and Google
- Protected routes
- Server-side session management
- Responsive UI with Tailwind CSS

## Setup

1. Create a Supabase project at https://supabase.io
2. Copy your Supabase URL and anon key
3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

## OAuth Setup

### GitHub OAuth:
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth app with:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/auth/callback`
3. Add the GitHub client ID and secret to your Supabase project:
   - In Supabase Dashboard: Authentication > Settings > GitHub
   - Enable GitHub sign in
   - Add Client ID and Client Secret

### Google OAuth:
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Create OAuth client ID credentials (Web application)
3. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
4. Add the Google client ID and secret to your Supabase project:
   - In Supabase Dashboard: Authentication > Settings > Google
   - Enable Google sign in
   - Add Client ID and Client Secret

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js and Supabase, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)