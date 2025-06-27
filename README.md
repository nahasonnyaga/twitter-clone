<br />

![](/.github/assets/presentation.png)

<p align="center">
  Twitter clone built in Next.js + TypeScript + Tailwind CSS using Supabase
</p>

## Preview 🎬

https://user-images.githubusercontent.com/55032197/201472767-9db0177a-79b5-4913-8666-1744102b0ad7.mp4

## Features ✨

- Authentication with Supabase Auth (Google OAuth)
- Strongly typed React components with TypeScript
- Users can add tweets, like, retweet, and reply
- Users can delete tweets, add a tweet to bookmarks, and pin their tweet
- Users can add images and videos to tweets
- Users can follow and unfollow other users
- Users can see their and other followers and the following list
- Users can see all users and the trending list
- Realtime update likes, retweets, and user profile
- Realtime trending data from Twitter API
- User can edit their profile
- Responsive design for mobile, tablet, and desktop
- Users can customize the site color scheme and color background
- All images uploads are stored on Supabase Storage

## Tech 🛠

- [Next.js](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com)
- [SWR](https://swr.vercel.app)
- [Headless UI](https://headlessui.com)
- [React Hot Toast](https://react-hot-toast.com)
- [Framer Motion](https://framer.com)

## Development 💻

Here are the steps to run the project locally.

1. Clone the repository

   ```bash
   git clone https://github.com/ccrsxx/twitter-clone.git
   ```

2. Install dependencies

   ```bash
   npm i
   ```

3. Create a Supabase project at [supabase.com](https://supabase.com)

4. Set up your Supabase project:
   - Go to Settings > API to get your project URL and anon key
   - Enable Google OAuth in Authentication > Providers
   - Run the SQL migrations in the `supabase/migrations` folder in your Supabase SQL editor
   - Create a storage bucket named "images" in Storage

5. Add your Supabase config to `.env.development`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

6. Run the project

   ```bash
   npm run dev
   ```

7. Optional: Add Twitter API credentials for trending data

   ```env
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token
   ```

## Database Schema

The project uses the following Supabase tables:

- **users** - User profiles and settings
- **tweets** - Tweet content and metadata
- **bookmarks** - User bookmarks
- **user_stats** - User interaction statistics

All tables have Row Level Security (RLS) enabled for data protection.

## Deployment

1. Deploy to Vercel or your preferred platform
2. Add environment variables in your deployment platform
3. Your app is ready! 🚀

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.