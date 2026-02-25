# 🚀 How to Deploy to Vercel (Make it Public)

To make your app accessible to everyone on the internet (public), follow these steps:

## Prerequisites
1.  **GitHub Account**: You need a GitHub account to store your code.
2.  **Vercel Account**: You need a Vercel account (sign up with GitHub).

## Step 1: Upload Code to GitHub
1.  Go to [GitHub.com](https://github.com) and create a **New Repository**.
2.  Name it (e.g., `savings-circle-app`).
3.  Upload your project files to this repository.
    *   *If you are using a terminal:*
        ```bash
        git init
        git add .
        git commit -m "Initial commit"
        git branch -M main
        git remote add origin <your-github-repo-url>
        git push -u origin main
        ```
    *   *If you are manually uploading:* Use the "Upload files" button on GitHub.

## Step 2: Connect to Vercel
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  You will see your GitHub repository `savings-circle-app`. Click **"Import"**.

## Step 3: Configure Environment Variables (IMPORTANT)
**Do not skip this step.** Your app needs to know about Supabase to work.

1.  In the "Configure Project" screen, scroll down to **"Environment Variables"**.
2.  Add the following variables (copy them from your `.env` file or Supabase dashboard):

    *   **Key:** `VITE_SUPABASE_URL`
    *   **Value:** `https://lisxaisfuzuchmdkjuuk.supabase.co`

    *   **Key:** `VITE_SUPABASE_ANON_KEY`
    *   **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpc3hhaXNmdXp1Y2htZGtqdXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMzIxNjYsImV4cCI6MjA4NzYwODE2Nn0.ofhHlTyj3_Omc_eAgZtvARQUax6_9a9QhQmiaawdQBI`

3.  Click **"Add"** for each one.

## Step 4: Deploy
1.  Click the big **"Deploy"** button.
2.  Wait for about 1-2 minutes.
3.  Once finished, you will see a screen saying "Congratulations!".
4.  Click on the **Domain** link (e.g., `savings-circle-app.vercel.app`).

**🎉 Your app is now live! Share this link with your members.**
