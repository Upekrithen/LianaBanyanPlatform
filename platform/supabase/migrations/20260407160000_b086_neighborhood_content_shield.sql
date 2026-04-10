-- B086: Neighborhood Content Shield — 5-Layer Defense System
-- Prevents neighborhoods from circumventing platform rules via content injection

-- 1. Prohibited patterns table — regex rules by category
CREATE TABLE IF NOT EXISTS neighborhood_prohibited_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN (
    'advertising', 'tracking', 'external_scripts', 'competing_platform',
    'financial_fraud', 'impersonation', 'css_escape', 'platform_bypass'
  )),
  pattern text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL DEFAULT 'block' CHECK (severity IN ('block', 'flag')),
  applies_to text[] NOT NULL DEFAULT ARRAY['description', 'welcome_message', 'custom_css', 'theme_config', 'hero_image_url'],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE neighborhood_prohibited_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY npp_read ON neighborhood_prohibited_patterns FOR SELECT USING (true);
CREATE POLICY npp_admin_insert ON neighborhood_prohibited_patterns FOR INSERT
  WITH CHECK (public.is_admin());
CREATE POLICY npp_admin_update ON neighborhood_prohibited_patterns FOR UPDATE
  USING (public.is_admin());

-- 2. Content shield audit log
CREATE TABLE IF NOT EXISTS neighborhood_content_shield_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id uuid REFERENCES neighborhoods(id),
  submission_id uuid,
  user_id uuid REFERENCES auth.users(id),
  field_name text NOT NULL,
  pattern_id uuid REFERENCES neighborhood_prohibited_patterns(id),
  category text NOT NULL,
  severity text NOT NULL,
  content_hash text NOT NULL,
  blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE neighborhood_content_shield_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY ncsl_admin_read ON neighborhood_content_shield_log FOR SELECT
  USING (public.is_admin());
CREATE POLICY ncsl_insert ON neighborhood_content_shield_log FOR INSERT
  WITH CHECK (true);

-- 3. validate_neighborhood_content() RPC function
CREATE OR REPLACE FUNCTION validate_neighborhood_content(
  p_description text DEFAULT NULL,
  p_welcome_message text DEFAULT NULL,
  p_custom_css text DEFAULT NULL,
  p_theme_config jsonb DEFAULT NULL,
  p_hero_image_url text DEFAULT NULL
)
RETURNS TABLE(
  field_name text,
  category text,
  severity text,
  pattern_id uuid,
  description text
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.field_name,
    npp.category,
    npp.severity,
    npp.id AS pattern_id,
    npp.description
  FROM neighborhood_prohibited_patterns npp
  CROSS JOIN LATERAL (
    VALUES
      ('description', p_description),
      ('welcome_message', p_welcome_message),
      ('custom_css', p_custom_css),
      ('theme_config', p_theme_config::text),
      ('hero_image_url', p_hero_image_url)
  ) AS f(field_name, field_value)
  WHERE npp.is_active = true
    AND f.field_name = ANY(npp.applies_to)
    AND f.field_value IS NOT NULL
    AND f.field_value ~ npp.pattern;
END;
$$;

-- 4. Content shield trigger on neighborhoods
CREATE OR REPLACE FUNCTION trg_neighborhood_content_shield()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_violations RECORD;
  v_has_blocks boolean := false;
  v_block_reasons text[] := ARRAY[]::text[];
BEGIN
  FOR v_violations IN
    SELECT * FROM validate_neighborhood_content(
      NEW.description,
      NEW.welcome_message,
      NEW.custom_css,
      NEW.theme_config,
      NEW.hero_image_url
    )
  LOOP
    INSERT INTO neighborhood_content_shield_log (
      neighborhood_id, user_id, field_name, pattern_id,
      category, severity, content_hash, blocked
    ) VALUES (
      NEW.id, auth.uid(), v_violations.field_name, v_violations.pattern_id,
      v_violations.category, v_violations.severity,
      encode(sha256(COALESCE(
        CASE v_violations.field_name
          WHEN 'description' THEN NEW.description
          WHEN 'welcome_message' THEN NEW.welcome_message
          WHEN 'custom_css' THEN NEW.custom_css
          WHEN 'theme_config' THEN NEW.theme_config::text
          WHEN 'hero_image_url' THEN NEW.hero_image_url
        END, '')::bytea), 'hex'),
      v_violations.severity = 'block'
    );

    IF v_violations.severity = 'block' THEN
      v_has_blocks := true;
      v_block_reasons := array_append(v_block_reasons,
        format('[%s] %s: %s', v_violations.category, v_violations.field_name, v_violations.description));
    END IF;
  END LOOP;

  IF v_has_blocks THEN
    RAISE EXCEPTION 'Content blocked by Content Shield: %', array_to_string(v_block_reasons, '; ')
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS content_shield_neighborhoods ON neighborhoods;
CREATE TRIGGER content_shield_neighborhoods
  BEFORE INSERT OR UPDATE ON neighborhoods
  FOR EACH ROW
  EXECUTE FUNCTION trg_neighborhood_content_shield();

-- 5. Content shield trigger on trunk_mirror_submissions
CREATE OR REPLACE FUNCTION trg_tms_content_shield()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_violations RECORD;
  v_has_blocks boolean := false;
  v_block_reasons text[] := ARRAY[]::text[];
BEGIN
  FOR v_violations IN
    SELECT * FROM validate_neighborhood_content(
      NEW.description,
      NULL,
      NEW.custom_css_draft,
      NEW.theme_config_draft,
      NULL
    )
  LOOP
    INSERT INTO neighborhood_content_shield_log (
      submission_id, user_id, field_name, pattern_id,
      category, severity, content_hash, blocked
    ) VALUES (
      NEW.id, auth.uid(), v_violations.field_name, v_violations.pattern_id,
      v_violations.category, v_violations.severity,
      encode(sha256(COALESCE(
        CASE v_violations.field_name
          WHEN 'description' THEN NEW.description
          WHEN 'custom_css' THEN NEW.custom_css_draft
          WHEN 'theme_config' THEN NEW.theme_config_draft::text
        END, '')::bytea), 'hex'),
      v_violations.severity = 'block'
    );

    IF v_violations.severity = 'block' THEN
      v_has_blocks := true;
      v_block_reasons := array_append(v_block_reasons,
        format('[%s] %s: %s', v_violations.category, v_violations.field_name, v_violations.description));
    END IF;
  END LOOP;

  IF v_has_blocks THEN
    RAISE EXCEPTION 'Content blocked by Content Shield: %', array_to_string(v_block_reasons, '; ')
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS content_shield_tms ON trunk_mirror_submissions;
CREATE TRIGGER content_shield_tms
  BEFORE INSERT OR UPDATE ON trunk_mirror_submissions
  FOR EACH ROW
  EXECUTE FUNCTION trg_tms_content_shield();

-- 6. Immutable platform rules trigger (Cost+20%, 83.3%, no hiding rules)
CREATE OR REPLACE FUNCTION trg_immutable_platform_rules()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.custom_css IS NOT NULL AND (
    NEW.custom_css ~* 'lb-platform-rules-badge' OR
    NEW.custom_css ~* 'display\s*:\s*none' OR
    NEW.custom_css ~* 'visibility\s*:\s*hidden' OR
    NEW.custom_css ~* 'opacity\s*:\s*0[^.]'
  ) THEN
    RAISE EXCEPTION 'Cannot hide platform rules badge via CSS'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS immutable_platform_rules ON neighborhoods;
CREATE TRIGGER immutable_platform_rules
  BEFORE INSERT OR UPDATE ON neighborhoods
  FOR EACH ROW
  EXECUTE FUNCTION trg_immutable_platform_rules();

-- 7. RLS policy for Harper reviewers to update trunk_mirror_submissions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'trunk_mirror_submissions' AND policyname = 'tms_reviewer_update'
  ) THEN
    CREATE POLICY tms_reviewer_update ON trunk_mirror_submissions
      FOR UPDATE USING (public.is_admin());
  END IF;
END $$;

-- 8. Seed initial prohibited patterns
INSERT INTO neighborhood_prohibited_patterns (category, pattern, description, severity, applies_to) VALUES
  -- Advertising
  ('advertising', '(?i)(buy\s+now|limited\s+time\s+offer|act\s+now|free\s+trial|click\s+here\s+to\s+buy)', 'Promotional/advertising language', 'flag', ARRAY['description', 'welcome_message']),
  ('advertising', '(?i)(affiliate|referral\s*=|utm_|click_id|partner_id)', 'Affiliate or tracking parameters', 'block', ARRAY['description', 'welcome_message', 'hero_image_url']),
  ('advertising', '(?i)(adsense|doubleclick|googletag|adsbygoogle)', 'Ad network references', 'block', ARRAY['description', 'welcome_message', 'custom_css', 'theme_config']),
  -- Tracking
  ('tracking', '(?i)(google-analytics|ga\(|gtag|facebook.*pixel|fbq\(|hotjar|mixpanel|segment\.com)', 'External analytics/tracking service', 'block', ARRAY['custom_css', 'theme_config', 'description']),
  ('tracking', '(?i)(beacon|fingerprint|canvas.*fingerprint|supercookie)', 'Browser fingerprinting', 'block', ARRAY['custom_css', 'theme_config']),
  -- External scripts
  ('external_scripts', '<script', 'Script injection attempt', 'block', ARRAY['description', 'welcome_message', 'custom_css', 'theme_config', 'hero_image_url']),
  ('external_scripts', '(?i)(javascript:|on(click|load|error|mouseover)\s*=)', 'Inline JavaScript event handler', 'block', ARRAY['description', 'welcome_message', 'custom_css', 'hero_image_url']),
  ('external_scripts', '(?i)@import\s+url\s*\(', 'CSS @import of external resource', 'block', ARRAY['custom_css']),
  ('external_scripts', '(?i)url\s*\(\s*[''"]?\s*https?://', 'External URL in CSS', 'block', ARRAY['custom_css']),
  -- Competing platforms
  ('competing_platform', '(?i)(shopify\.com|etsy\.com|amazon\.com|ebay\.com|stripe\.com)/(checkout|cart|buy)', 'Link to competing platform checkout', 'block', ARRAY['description', 'welcome_message', 'hero_image_url']),
  -- Financial fraud
  ('financial_fraud', '(?i)(guaranteed\s+(returns?|income|profit)|get\s+rich|earn\s+\$\d{4,}|passive\s+income\s+guaranteed)', 'Misleading financial claims', 'block', ARRAY['description', 'welcome_message']),
  ('financial_fraud', '(?i)(wire\s+transfer|western\s+union|money\s*gram|bitcoin\s+address|crypto\s+wallet|send\s+payment\s+to)', 'Off-platform payment solicitation', 'block', ARRAY['description', 'welcome_message']),
  -- Impersonation
  ('impersonation', '(?i)(official\s+liana\s+banyan|lb\s+verified|lb\s+certified|platform\s+endorsed)', 'Impersonation of official LB status', 'block', ARRAY['description', 'welcome_message']),
  -- CSS escape
  ('css_escape', '(?i)(html\s*\{|body\s*\{|#root\s*\{|\[class\*="lb-"\])', 'CSS selector escaping neighborhood scope', 'block', ARRAY['custom_css']),
  ('css_escape', '(?i)position\s*:\s*fixed', 'Fixed positioning (escapes container)', 'block', ARRAY['custom_css']),
  ('css_escape', '(?i)z-index\s*:\s*([1-9]\d{3,}|[1-9]\d{2}[1-9])', 'z-index above 1000 (reserved for platform UI)', 'block', ARRAY['custom_css']),
  -- Platform bypass
  ('platform_bypass', '(?i)(bypass|circumvent|skip|avoid)\s+(cost\+20|platform\s+fee|lb\s+fee|creator\s+share)', 'Attempting to bypass platform economic rails', 'block', ARRAY['description', 'welcome_message'])
ON CONFLICT DO NOTHING;
