-- Create reference_tasks table for dynamic task list management
CREATE TABLE public.reference_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_date TEXT,
  priority TEXT NOT NULL,
  dependencies TEXT,
  description TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reference_tasks ENABLE ROW LEVEL SECURITY;

-- Anyone can view reference tasks
CREATE POLICY "Anyone can view reference tasks"
  ON public.reference_tasks
  FOR SELECT
  USING (true);

-- Admins can manage reference tasks
CREATE POLICY "Admins can manage reference tasks"
  ON public.reference_tasks
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_reference_tasks_updated_at
  BEFORE UPDATE ON public.reference_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing static data
INSERT INTO public.reference_tasks (category, status, completed_date, priority, dependencies, description, items, sort_order) VALUES
('5. BLOCKCHAIN INFRASTRUCTURE 🔥', 'completed', '2025-10-13', 'Critical', 'None - Foundation layer', 
 'Core blockchain integration for medallion process, intellectual property protection, and share ownership. Must be implemented first as it underpins the entire token/equity system.',
 '[
   {"id": "5.3", "title": "Wallet Connection", "desc": "RainbowKit multi-wallet integration (MetaMask, Coinbase, etc.) with Base/Base Sepolia support", "completed": true},
   {"id": "5.1", "title": "NFT Integration", "desc": "ERC-1155 multi-token contract + edge function minting pipeline for medallions", "completed": true},
   {"id": "5.2", "title": "Smart Contract Interaction", "desc": "Contract interaction layer with gas estimation and retries; LB pool gas coverage", "completed": true},
   {"id": "5.4", "title": "Token Economics", "desc": "Gas costs funded from LB pool (1%); supply limits per tier; on-chain metadata support", "completed": true},
   {"id": "5.5", "title": "Blockchain Explorer", "desc": "BaseScan links + QR codes for contract, tokens, and transactions with status display", "completed": true}
 ]'::jsonb, 1),

('3. AUTOMATIC DAILY SYNC', 'pending', NULL, 'High', 'None - XML generation exists ✅',
 'Automated system to regenerate XML modules daily, keeping all data current across the platform. Ready to implement immediately.',
 '[
   {"id": "3.1", "title": "Edge Function: Daily Sync Scheduler", "desc": "⚡ READY NOW: Create edge function with cron job to generate XML modules daily", "completed": false},
   {"id": "3.2", "title": "Sync Status Tracking", "desc": "Add last_synced_at and sync_status fields to projects table", "completed": false},
   {"id": "3.3", "title": "Manual Sync Trigger", "desc": "Add \"Sync Now\" button in AdminProject with progress indicator", "completed": false},
   {"id": "3.4", "title": "Sync Conflict Resolution", "desc": "Handle concurrent sync attempts and version conflicts", "completed": false},
   {"id": "3.5", "title": "Notification System", "desc": "Email notifications for sync failures and dashboard alerts", "completed": false}
 ]'::jsonb, 2),

('4. REAL-TIME DYNAMIC CALCULATIONS DISPLAY', 'pending', NULL, 'High', 'Requires: ALTER PUBLICATION supabase_realtime',
 'Live updates showing voting progress, funding metrics, and community activity in real-time. Needs Realtime enabled on production_levels and user_votes tables.',
 '[
   {"id": "4.1", "title": "Real-time Vote/Pledge Updates", "desc": "⚡ NEXT: Enable Realtime, then implement Supabase subscriptions", "completed": false},
   {"id": "4.2", "title": "Dynamic Metrics Display", "desc": "Show current votes, volume discount %, and funding progress", "completed": false},
   {"id": "4.3", "title": "Live Leaderboard", "desc": "Top contributors, products by votes, and recent activity feed", "completed": false},
   {"id": "4.4", "title": "Visual Indicators", "desc": "Progress bars, milestone celebrations, and color-coded status", "completed": false},
   {"id": "4.5", "title": "Performance Optimization", "desc": "Debounce updates, batch changes, and optimize re-renders", "completed": false}
 ]'::jsonb, 3),

('2. PROGRESSIVE WEB APP (PWA) FEATURES', 'pending', NULL, 'Medium', 'Service Worker → Manifest → Other Features',
 'Transform the application into a Progressive Web App for offline functionality and mobile app-like experience. Build incrementally starting with service worker.',
 '[
   {"id": "2.1", "title": "Service Worker Setup", "desc": "⚡ START HERE: Create service worker for offline functionality and background sync", "completed": false},
   {"id": "2.2", "title": "Manifest Configuration", "desc": "Create manifest.json with app metadata, icons, and display settings", "completed": false},
   {"id": "2.3", "title": "Install Prompt", "desc": "Detect PWA capability and show installation prompt", "completed": false},
   {"id": "2.4", "title": "Offline Mode UI", "desc": "Display offline indicator and queue actions for sync", "completed": false},
   {"id": "2.5", "title": "Push Notifications", "desc": "Set up notification service for project updates", "completed": false}
 ]'::jsonb, 4),

('6. MEMBER DASHBOARD ENHANCEMENTS', 'pending', NULL, 'Medium', 'Depends on: Authentication system ✅',
 'Personalized member experience with analytics, social features, and gamification. Can implement progressively after authentication is working.',
 '[
   {"id": "6.1", "title": "Personalized Dashboard", "desc": "⚡ READY: Display subscribed projects, investments, voting history, rewards", "completed": false},
   {"id": "6.2", "title": "Activity Feed", "desc": "Recent votes, project updates, community announcements, recommendations", "completed": false},
   {"id": "6.3", "title": "Analytics & Insights", "desc": "Investment performance charts, growth metrics, ROI projections", "completed": false},
   {"id": "6.4", "title": "Social Features", "desc": "Follow members, share achievements, comments, private messaging", "completed": false},
   {"id": "6.5", "title": "Gamification", "desc": "Achievement badges, reputation points, leaderboards, challenges", "completed": false}
 ]'::jsonb, 5),

('1. SUBDOMAIN STORAGE SYSTEM ✅', 'completed', '2025-10-11', 'High', 'None - Independent system',
 'Public-facing portal infrastructure for projects with custom subdomains, lockbox XML storage, and industry pricing integration. Fully operational.',
 '[
   {"id": "1.1", "title": "Database Setup", "desc": "✅ Tables: project_subdomains, domain_mappings, lockbox_configs with RLS", "completed": true},
   {"id": "1.2", "title": "Subdomain Management UI", "desc": "✅ AdminProject subdomain configuration with validation", "completed": true},
   {"id": "1.3", "title": "SubdomainRouter Enhancement", "desc": "✅ Dynamic routing with custom domain support", "completed": true},
   {"id": "1.4", "title": "Public Portal View", "desc": "✅ Lockbox XML serving with CORS and security policies", "completed": true},
   {"id": "1.5", "title": "DNS & Deployment", "desc": "✅ Wildcard DNS, SSL certificates, industry pricing sync", "completed": true}
 ]'::jsonb, 6);