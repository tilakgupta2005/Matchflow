# Matchflow ⚡

🚀 **Live Website:** [https://match-ai.vercel.app](https://match-ai.vercel.app)

Matchflow is an AI-powered influencer marketplace connecting brands with the perfect creators using intelligent matching, seamless negotiation, and robust campaign management.

## 🌟 Key Features

- **AI-Powered Matching:** Discover the best creators for campaigns based on targeted criteria and AI analysis.
- **Creator Profiles:** Dedicated creator portfolios and analytics.
- **Brand Dashboards:** Campaign management dashboards for brands to monitor reach and interactions.
- **Secure Authentication & Data:** Integrated with Supabase for secure login, data storage, and Row Level Security (RLS).
- **Responsive & Premium UI:** Built with Shadcn UI, Tailwind CSS, and Framer Motion for a stunning, responsive experience on all devices.

## 🛠️ Technology Stack

- **Frontend Framework:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS, Shadcn UI (Radix UI)
- **State Management & Data Fetching:** React Query, Zustand
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage)
- **Routing:** React Router v6
- **Forms & Validation:** React Hook Form, Zod

## ⚙️ Local Setup Instructions

Follow these steps to run Matchflow locally on your machine.

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `bun`

### 2. Clone the Repository
```bash
git clone <your-repository-url>
cd Matchflow
```

### 3. Install Dependencies
```bash
# Using npm
npm install

# Using bun
bun install
```

### 4. Set Up Environment Variables
Create a file named `.env.local` in the root of the project and add your Supabase credentials:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Start the Development Server
```bash
# Using npm
npm run dev

# Using bun
bun run dev
```
Your application should now be running at `http://localhost:8080`.

## 🚀 Deployment (Vercel)

Matchflow is configured for easy deployment on [Vercel](https://vercel.com/):
1. Import the Git repository in your Vercel dashboard.
2. Vercel will automatically detect **Vite** and configure the proper build command (`npm run build`) and output directory (`dist`).
3. Add the required Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Deploy!

Routing is properly handled to support Single Page Application (SPA) functionality out of the box.

## 📜 License

This project is licensed under the terms of the LICENSE file included in the repository.
