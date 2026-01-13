# MindSync - Mental Health Wellness App

MindSync helps students and young professionals manage stress and anxiety with personalized mood tracking and science-backed micro-activities.

## Project info

**URL**: https://lovable.dev/projects/bb9b58af-2289-4839-bfd9-e50b74d68378

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/bb9b58af-2289-4839-bfd9-e50b74d68378) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables (see Environment Setup below)
cp .env.example .env
# Edit .env with your actual API keys

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Environment Setup

This project requires several API keys to function properly. Follow these steps:

1. **Copy the environment template:**
   ```sh
   cp .env.example .env
   ```

2. **Get your API keys:**

   - **Supabase** (Required for authentication & database):
     - Go to [Supabase Dashboard](https://supabase.com/dashboard)
     - Create a new project or use existing one
     - Go to Settings > API
     - Copy the Project URL, Project ID, and anon/public key

   - **Google Gemini AI** (Required for chatbot):
     - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
     - Create a new API key
     - Copy the API key

   - **Spotify API** (Optional - for music integration):
     - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
     - Create a new app
     - Copy Client ID and Client Secret

   - **OpenWeather API** (Optional - for weather insights):
     - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
     - Get your free API key

3. **Update your `.env` file** with the actual values:
   ```env
   VITE_SUPABASE_PROJECT_ID="your_actual_project_id"
   VITE_SUPABASE_PUBLISHABLE_KEY="your_actual_anon_key"
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_GEMINI_API_KEY="your_actual_gemini_key"
   # ... other keys
   ```

⚠️ **Important**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/bb9b58af-2289-4839-bfd9-e50b74d68378) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
