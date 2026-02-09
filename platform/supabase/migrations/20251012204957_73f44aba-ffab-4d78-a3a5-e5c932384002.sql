-- Add blockchain fields to project_modules
ALTER TABLE public.project_modules
ADD COLUMN previous_hash TEXT,
ADD COLUMN current_hash TEXT,
ADD COLUMN is_verified BOOLEAN DEFAULT true,
ADD COLUMN signed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN tamper_detected BOOLEAN DEFAULT false;

-- Create function to generate SHA-256 hash of module data
CREATE OR REPLACE FUNCTION public.generate_module_hash(
  _xml_data TEXT,
  _previous_hash TEXT,
  _module_version INTEGER,
  _project_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Combine all immutable data and hash it
  RETURN encode(
    digest(
      _project_id::text || 
      _module_version::text || 
      COALESCE(_previous_hash, 'GENESIS') || 
      _xml_data,
      'sha256'
    ),
    'hex'
  );
END;
$$;

-- Create function to verify blockchain integrity
CREATE OR REPLACE FUNCTION public.verify_module_chain(_project_id UUID)
RETURNS TABLE(
  module_id UUID,
  version INTEGER,
  is_valid BOOLEAN,
  expected_hash TEXT,
  actual_hash TEXT,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _module RECORD;
  _expected_hash TEXT;
BEGIN
  FOR _module IN
    SELECT * FROM public.project_modules
    WHERE project_id = _project_id
    ORDER BY module_version ASC
  LOOP
    -- Calculate what the hash should be
    _expected_hash := public.generate_module_hash(
      _module.xml_data,
      _module.previous_hash,
      _module.module_version,
      _module.project_id
    );
    
    -- Check if it matches
    IF _module.current_hash = _expected_hash THEN
      RETURN QUERY SELECT
        _module.id,
        _module.module_version,
        true,
        _expected_hash,
        _module.current_hash,
        NULL::TEXT;
    ELSE
      RETURN QUERY SELECT
        _module.id,
        _module.module_version,
        false,
        _expected_hash,
        _module.current_hash,
        'Hash mismatch detected - potential tampering'::TEXT;
    END IF;
  END LOOP;
END;
$$;

-- Create trigger function to automatically hash new modules
CREATE OR REPLACE FUNCTION public.auto_hash_module()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _prev_hash TEXT;
BEGIN
  -- Get the hash of the previous version
  SELECT current_hash INTO _prev_hash
  FROM public.project_modules
  WHERE project_id = NEW.project_id
    AND module_version = NEW.module_version - 1;
  
  -- Set previous_hash
  NEW.previous_hash := _prev_hash;
  
  -- Generate current hash
  NEW.current_hash := public.generate_module_hash(
    NEW.xml_data,
    NEW.previous_hash,
    NEW.module_version,
    NEW.project_id
  );
  
  -- Mark as verified
  NEW.is_verified := true;
  NEW.signed_at := now();
  NEW.tamper_detected := false;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER hash_module_before_insert
  BEFORE INSERT ON public.project_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_hash_module();

-- Create blockchain audit log table
CREATE TABLE public.blockchain_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.project_modules(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verification_result JSONB,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.blockchain_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit log
CREATE POLICY "Anyone can view blockchain audit logs"
  ON public.blockchain_audit_log
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert audit logs"
  ON public.blockchain_audit_log
  FOR INSERT
  WITH CHECK (true);

-- Create function to log verification events
CREATE OR REPLACE FUNCTION public.log_blockchain_verification(
  _project_id UUID,
  _performed_by UUID,
  _verification_result JSONB,
  _notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id UUID;
BEGIN
  INSERT INTO public.blockchain_audit_log (
    project_id,
    module_id,
    action,
    performed_by,
    verification_result,
    notes
  )
  SELECT
    _project_id,
    (SELECT id FROM public.project_modules WHERE project_id = _project_id ORDER BY module_version DESC LIMIT 1),
    'verification',
    _performed_by,
    _verification_result,
    _notes
  RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;

-- Create public verification endpoint function
CREATE OR REPLACE FUNCTION public.public_verify_project_chain(_project_sku TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _project_id UUID;
  _result JSONB;
  _is_valid BOOLEAN := true;
  _module_count INTEGER;
  _invalid_count INTEGER := 0;
BEGIN
  -- Get project ID from SKU
  SELECT id INTO _project_id
  FROM public.projects
  WHERE project_sku = _project_sku;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Project not found'
    );
  END IF;
  
  -- Get module count
  SELECT COUNT(*) INTO _module_count
  FROM public.project_modules
  WHERE project_id = _project_id;
  
  -- Get verification results
  SELECT jsonb_agg(
    jsonb_build_object(
      'version', v.version,
      'is_valid', v.is_valid,
      'error', v.error_message
    )
  ) INTO _result
  FROM public.verify_module_chain(_project_id) v;
  
  -- Count invalid modules
  SELECT COUNT(*) INTO _invalid_count
  FROM public.verify_module_chain(_project_id)
  WHERE is_valid = false;
  
  _is_valid := (_invalid_count = 0);
  
  RETURN jsonb_build_object(
    'success', true,
    'project_sku', _project_sku,
    'is_valid', _is_valid,
    'total_versions', _module_count,
    'invalid_count', _invalid_count,
    'chain_details', _result,
    'verified_at', now()
  );
END;
$$;