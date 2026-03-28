# Matchflow 🚀

Matchflow is a modern, AI-powered marketplace where digital Creators meet their perfect Brand partnerships. The platform provides full end-to-end deal negotiations featuring integrated AI agents, real-time messaging, and secure dual-party term approvals.

## 📖 Description

Built on a robust React and Supabase architecture, Matchflow eliminates the friction of traditional sponsorship outreach. Brands define campaigns, influencers define their rates, and Matchflow facilitates the handshake. The application relies on real-time database subscriptions to establish a fluid negotiation window where both parties must lock and approve finalized terms (deliverables and budget). 

### Key Features
- **Discovery Marketplace:** Brands and Influencers can distinctively browse active campaigns or creator profiles.
- **Dual-Party Approval Logic:** A customized state machine where deals are negotiated via live chat. Both the creator and the brand must manually *"Approve"* previously negotiated terms to switch the deal status from `locked` to `approved`.
- **AI Auto-Negotiation:** By dispatching profile parameters to a webhook hook (like an `n8n` workflow server), custom AI agents can auto-generate negotiation transcripts and immediately propose structured deal terms.
- **Real-Time Data Sync:** Active deal messages and overarching deal statuses updates happen in 100% real-time across users' browsers via Supabase.
- **Role-Based Auth & Dashboards:** Clean routing dividing distinct logic for Creators and Brands based off their primary session metadata.

---

## 🛠️ Tech Stack

- **Frontend Core:** React, Vite, TypeScript
- **Styling:** Tailwind CSS, `shadcn/ui` components, `lucide-react` icons
- **State Management:** Zustand (`src/store/useStore.ts`)
- **Routing:** React Router v6
- **Backend Services:** Supabase (Auth, Postgres DB, Edge Functions / Realtime Channels)
- **AI Logic Processing:** Custom webhook endpoint parsing (via `n8n_workflow.json`)

---

## 📂 Project Structure

```text
Matchflow/
├── public/                 # Static top-level assets (like vercel.json for SPA routing)
├── src/
│   ├── assets/             # Images and illustrative svgs
│   ├── components/         # Shared functional UI blocks (Header, Footer, /ui primitives)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility classes, formatters, and Supabase client setup
│   ├── pages/              # Primary route views (Landing, Auth, Discovery, Negotiation)
│   ├── store/              # Centralized Zustand definition containing API & State logic
│   ├── App.tsx             # Main routing mechanism & wrapper logic
│   └── main.tsx            # Initial React DOM render
├── n8n_workflow.json       # AI Workflow parsing instructions (backend engine context)
├── .env.local              # Local environment file parameters
└── tailwind.config.js      # CSS theming declarations
```

---

## 🚀 Setup & Installation (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- A Supabase project (to supply Database & Authentication layers)
- Local `n8n` or mock API server (to handle the AI auto-negotiation workflow via webhook)

### 2. Clone the Repository
Clone this repository to your local machine:
```bash
git clone https://github.com/tilakgupta2005/Matchflow.git
cd Matchflow
```

### 3. Configure Environment Variables
Create an `.env.local` file inside the root directory and add your secure keys:
```env
VITE_SUPABASE_URL=your-supabase-url-here
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
VITE_NEGOTIATION_WEBHOOK_URL=http://localhost:5678/webhook/brand-negotiation-ai
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Supabase Configuration (CRITICAL)
Your Supabase Postgres DB needs to contain tables aligned with the data models laid out in `useStore.ts` (e.g. `users`, `influencer_profiles`, `deals`, `deal_messages`).
- **Authentication:** Enable email authentication routing.
- **Realtime:** You MUST enable Realtime broadcasting for specific tables. In the Supabase dashboard, go to **Database &rarr; Replication**. Under `supabase_realtime`, enable the toggle for the **`deals`** table and **`deal_messages`** tables. If this is not flipped on, your negotiation chat will lack real-time reactivity!

### 6. Start the Development Server
```bash
npm run dev
```
The application will securely serve on `http://localhost:5173`. Any routing reload issues in deployment environments (like Vercel) are automatically handled by the included `vercel.json` SPA configuration lock.

### 7. Build for Production
To create an optimized production build, run:
```bash
npm run build
```
This generates a `/dist` directory that can be safely hosted on standard CDN platforms like Vercel or Netlify.

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use and modify it as per your needs, provided that you give credit to the original developer.

---

## 👨‍💻 Author / Developer

**[Tilak Gupta](https://tilak-dev.vercel.app)**

[tilakgupta2005@gmail.com](mailto:tilakgupta2005@gmail.com)
