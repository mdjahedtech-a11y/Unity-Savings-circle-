# 🚀 Deployment Guide (Vercel + Supabase)

Follow these steps to make your Savings Circle app live!

## Part 1: Supabase Setup (Database)

1.  **Create Account & Project**:
    *   Go to [supabase.com](https://supabase.com) and sign up.
    *   Create a new project (e.g., "Savings App").
    *   Save your database password securely.

2.  **Get API Keys**:
    *   Go to **Project Settings** (gear icon) -> **API**.
    *   Copy the `Project URL`.
    *   Copy the `anon` / `public` key.
    *   *Keep these ready for Vercel.*

3.  **Create Tables**:
    *   In your Supabase dashboard, go to the **SQL Editor** (icon with `>_`).
    *   Click **New Query**.
    *   Copy the **entire content** of the file `supabase_schema.sql` from this project.
    *   Paste it into the SQL Editor and click **Run**.
    *   *Success! Your database tables (members, payments) are now ready.*

---

## Part 2: Vercel Deployment (Hosting)

1.  **Push Code to GitHub**:
    *   Create a new repository on GitHub.
    *   Push this project code to that repository.

2.  **Import to Vercel**:
    *   Go to [vercel.com](https://vercel.com) and sign up/login.
    *   Click **Add New...** -> **Project**.
    *   Select your GitHub repository ("Savings Circle").
    *   Click **Import**.

3.  **Configure Environment Variables** (Crucial Step):
    *   In the "Configure Project" screen, look for **Environment Variables**.
    *   Add the following two variables using the keys you got from Supabase:

    | Name | Value |
    |------|-------|
    | `VITE_SUPABASE_URL` | Paste your Supabase Project URL |
    | `VITE_SUPABASE_ANON_KEY` | Paste your Supabase Anon Public Key |

4.  **Deploy**:
    *   Click **Deploy**.
    *   Wait for a minute. Vercel will build your app.
    *   Once done, you will get a live URL (e.g., `https://savings-circle.vercel.app`).

---

## Part 3: Verify

1.  Open your live Vercel URL.
2.  The "Demo Mode" warning should be **GONE**.
3.  Try adding a member. If it works, your app is fully live and connected to the database!

---

## 🇧🇩 বাংলা গাইড (Bengali Guide)

**ধাপ ১: Supabase (ডাটাবেস সেটআপ)**
১. [supabase.com](https://supabase.com)-এ যান এবং একটি প্রজেক্ট খুলুন।
২. **Settings > API** থেকে `Project URL` এবং `anon public key` কপি করে রাখুন।
৩. **SQL Editor**-এ যান, `supabase_schema.sql` ফাইলের সব কোড কপি করে পেস্ট করুন এবং **Run** বাটনে ক্লিক করুন।

**ধাপ ২: Vercel (লাইভ করা)**
১. আপনার কোড GitHub-এ আপলোড করুন।
২. [vercel.com](https://vercel.com)-এ গিয়ে `Add New Project` দিন এবং GitHub থেকে প্রজেক্টটি সিলেক্ট করুন।
৩. **Environment Variables** সেকশনে নিচের দুটি জিনিস বসান:
   - `VITE_SUPABASE_URL`: আপনার সুপাবেস ইউআরএল
   - `VITE_SUPABASE_ANON_KEY`: আপনার সুপাবেস অ্যানন কি
৪. **Deploy** বাটনে ক্লিক করুন।

ব্যাস! আপনার অ্যাপ এখন লাইভ। 🎉
