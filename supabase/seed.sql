-- Insert Demo Admin
INSERT INTO public.users (id, email, name, role, "profileComplete") 
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@matchflow.com', 'Admin', 'admin', true)
ON CONFLICT (id) DO NOTHING;

-- Insert Mock Brands
INSERT INTO public.users (id, email, name, role, "profileComplete") 
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'marketing@glowup.com', 'GlowUp Skincare', 'brand', true),
  ('22222222-2222-2222-2222-222222222222', 'partnerships@technova.com', 'TechNova', 'brand', true),
  ('33333333-3333-3333-3333-333333333333', 'collab@fitfuel.com', 'FitFuel', 'brand', true)
ON CONFLICT (id) DO NOTHING;

-- Insert Mock Creators
INSERT INTO public.users (id, email, name, role, "profileComplete") 
VALUES 
  ('44444444-4444-4444-4444-444444444444', 'sarah@creator.com', 'Sarah Chen', 'influencer', true),
  ('55555555-5555-5555-5555-555555555555', 'techreviewer@gmail.com', 'Tech Reviewer', 'influencer', true)
ON CONFLICT (id) DO NOTHING;

-- Insert Influencer Profiles
INSERT INTO public.influencer_profiles ("userId", niches, followers, "engagementRate", bio, platforms, "contactEmail", "contactPhone")
VALUES 
  ('44444444-4444-4444-4444-444444444444', ARRAY['Lifestyle', 'Travel'], 125000, 4.2, 'Lifestyle & travel content creator sharing daily inspiration.', ARRAY['Instagram', 'TikTok'], 'sarah@creator.com', '+91 98765 43210'),
  ('55555555-5555-5555-5555-555555555555', ARRAY['Tech', 'Gadgets'], 89000, 5.1, 'Tech reviewer and gadget enthusiast.', ARRAY['YouTube', 'Twitter'], 'techreviewer@gmail.com', '+91 91234 56789')
ON CONFLICT ("userId") DO NOTHING;

-- Insert Campaigns
INSERT INTO public.campaigns (id, "brandId", "brandName", title, description, budget, category, deliverables, status)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'GlowUp Skincare', 'Summer Glow Campaign', 'Looking for beauty & lifestyle influencers.', 5000, 'Beauty', ARRAY['3 Instagram posts', '2 Stories'], 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'TechNova', 'Product Launch Review', 'Need tech reviewers for our upcoming smartphone launch.', 8000, 'Tech', ARRAY['1 YouTube review', '2 Social posts'], 'active'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'FitFuel', 'Fitness Challenge', '30-day fitness challenge campaign.', 3000, 'Fitness', ARRAY['5 TikToks'], 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert Deals
INSERT INTO public.deals (id, "influencerId", "influencerName", "brandId", "brandName", "campaignId", "campaignTitle", status, amount, terms)
VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'Sarah Chen', '11111111-1111-1111-1111-111111111111', 'GlowUp Skincare', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Summer Glow Campaign', 'negotiating', 2500, '{"stories": 2, "shortVideos": 1, "longVideos": 0, "posts": 3, "totalAmount": 2500, "termsNotes": "Content must feature products."}')
ON CONFLICT (id) DO NOTHING;
