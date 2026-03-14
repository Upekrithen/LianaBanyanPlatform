-- Allow users to create their own steward profile (application flow)
CREATE POLICY "Users insert own steward profile" ON public.steward_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
