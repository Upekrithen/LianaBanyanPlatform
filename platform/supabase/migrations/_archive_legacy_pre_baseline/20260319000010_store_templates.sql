-- ============================================================================
-- Migration: 20260319000010_store_templates.sql
-- Session 40 Task A: Store Templates gallery
-- ============================================================================

CREATE TABLE IF NOT EXISTS store_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  description     text,
  theme_key       text NOT NULL UNIQUE,
  primary_color   text,
  secondary_color text,
  accent_color    text,
  font_family     text,
  layout_type     text CHECK (layout_type IN ('grid', 'list', 'featured')),
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE store_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_templates_select_authenticated" ON store_templates FOR SELECT TO authenticated USING (true);

INSERT INTO store_templates (theme_key, name, description, primary_color, secondary_color, accent_color, font_family, layout_type) VALUES
  ('artisan',       'The Artisan',       'Warm earth tones with a craft-focused layout. Prominent product photos, handmade feel.', '#8B4513', '#DEB887', '#D2691E', 'Georgia, serif', 'featured'),
  ('market_stand',  'The Market Stand',  'Clean and minimal with a farm-market feel. Green accents, fresh and inviting.',          '#2E7D32', '#E8F5E9', '#4CAF50', 'Inter, sans-serif', 'grid'),
  ('workshop',      'The Workshop',      'Industrial maker aesthetic. Dark theme, tool-forward, built for builders.',              '#37474F', '#263238', '#FF6F00', 'Roboto Mono, monospace', 'grid'),
  ('boutique',      'The Boutique',      'Elegant and refined. Light theme with serif fonts, perfect for fashion and lifestyle.',  '#F8F0E3', '#FFFFFF', '#C9A96E', 'Playfair Display, serif', 'featured'),
  ('digital_den',   'The Digital Den',   'Tech-forward with gradient backgrounds. Code-inspired, built for digital creators.',     '#1A1A2E', '#16213E', '#0F3460', 'Source Code Pro, monospace', 'list'),
  ('kitchen_table', 'The Kitchen Table', 'Homey and warm. Food and recipe focus, yellows and oranges, feels like home.',           '#FFF8E1', '#FFECB3', '#FF8F00', 'Nunito, sans-serif', 'grid');
