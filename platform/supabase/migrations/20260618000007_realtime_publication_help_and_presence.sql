-- Add help_messages + peer_presence to supabase_realtime publication
-- so Pipeline tab Realtime subscribe actually receives CDC events.
-- Without this, channel.subscribe() silently times out forever.
-- Migration: 20260618000007 · BP086 · SEG-I1

ALTER PUBLICATION supabase_realtime ADD TABLE public.help_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.peer_presence;
