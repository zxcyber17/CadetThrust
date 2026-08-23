# CADET THRUST 🚀

Official website for Sylhet Cadet College cadets with a cyberpunk neon aesthetic.

## Project Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/zxcyber17/CadetThrust.git
cd CadetThrust
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

4. **Start development server**
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Features

- 🎨 Neon cyberpunk aesthetic with cyan/magenta colors
- 🔐 User authentication with Supabase
- 📝 Registration with admin approval system
- 👤 Cadet profiles with achievement badges (6 slots)
- ⚡ Fast and responsive UI with React + TypeScript
- 🎯 Modern development stack with Vite

## Database Setup

Run these SQL commands in Supabase SQL Editor:

```sql
-- Create auth_users table
CREATE TABLE IF NOT EXISTS auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  cadet_name TEXT NOT NULL,
  cadet_number TEXT UNIQUE NOT NULL,
  house TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  approved BOOLEAN DEFAULT FALSE
);

-- Create cadet_profiles table
CREATE TABLE IF NOT EXISTS cadet_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bio TEXT,
  batch TEXT,
  blood_group TEXT,
  status TEXT CHECK (status IN ('EX-CADET', 'RUNNING CADET')),
  badge_1 TEXT, badge_2 TEXT, badge_3 TEXT,
  badge_4 TEXT, badge_5 TEXT, badge_6 TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create pending_approvals table
CREATE TABLE IF NOT EXISTS pending_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_data JSONB,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);
```

## Available Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
CadetThrust/
├── src/
│   ├── components/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── config/
│   │   └── supabase.ts
│   ├── styles/
│   │   └── neon.css
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Contributors

- **zxcyber17** - Lead Developer

---

**CADET THRUST** - *Excellence through Technology* ⚡
