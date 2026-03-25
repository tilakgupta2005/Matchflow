-- Run this in the Supabase SQL Editor

-- Create Users table (extends Supabase auth.users optionally, but for simplicity we keep it standalone based on your code)
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('influencer', 'brand', 'admin')),
  avatar TEXT,
  "profileComplete" BOOLEAN DEFAULT false,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  website TEXT
);

-- Create Influencer Profiles table
CREATE TABLE public.influencer_profiles (
  "userId" UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  niches TEXT[] DEFAULT '{}',
  followers INTEGER DEFAULT 0,
  "engagementRate" NUMERIC DEFAULT 0,
  bio TEXT,
  platforms TEXT[] DEFAULT '{}',
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "socialLinks" JSONB DEFAULT '[]'::jsonb,
  "priceStory" JSONB DEFAULT '{"min": 0, "max": 0}'::jsonb,
  "priceShortVideo" JSONB DEFAULT '{"min": 0, "max": 0}'::jsonb,
  "priceLongVideo" JSONB DEFAULT '{"min": 0, "max": 0}'::jsonb,
  "pricePost" JSONB DEFAULT '{"min": 0, "max": 0}'::jsonb,
  country TEXT,
  state TEXT,
  city TEXT
);

-- Create Campaigns table
CREATE TABLE public.campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "brandId" UUID REFERENCES public.users(id) ON DELETE CASCADE,
  "brandName" TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  budget NUMERIC DEFAULT 0,
  category TEXT NOT NULL,
  deliverables TEXT[] DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed')) DEFAULT 'active',
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "productLink" TEXT,
  country TEXT,
  state TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Deals table
CREATE TABLE public.deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "influencerId" UUID REFERENCES public.users(id) ON DELETE CASCADE,
  "influencerName" TEXT NOT NULL,
  "brandId" UUID REFERENCES public.users(id) ON DELETE CASCADE,
  "brandName" TEXT NOT NULL,
  "campaignId" UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  "campaignTitle" TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('requested', 'negotiating', 'locked', 'approved', 'rejected', 'failed')) DEFAULT 'requested',
  amount NUMERIC DEFAULT 0,
  terms JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "userId" UUID REFERENCES public.users(id) ON DELETE CASCADE
);

-- Disable Row Level Security (RLS) temporarily for development
-- (In production, you should enable RLS and add policies)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
