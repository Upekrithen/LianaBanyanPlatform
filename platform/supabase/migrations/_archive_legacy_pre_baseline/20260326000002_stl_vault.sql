-- K108: STL Vault + Test Reports for DSS Portal (the2ndsecond.com)

CREATE TABLE IF NOT EXISTS stl_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES catalog_products(id),
  uploader_id UUID NOT NULL REFERENCES auth.users(id),
  filename TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0',
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size_bytes BIGINT,
  category TEXT CHECK (category IN ('terrain','hinge','miniature','building','accessory','tool','component','other')),
  tags JSONB DEFAULT '[]',
  download_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  license TEXT DEFAULT 'cc-by-nc-sa-4.0',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS test_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stl_file_id UUID NOT NULL REFERENCES stl_files(id),
  tester_id UUID NOT NULL REFERENCES auth.users(id),
  maker_id UUID REFERENCES makers(id),
  printer_type TEXT,
  material TEXT,
  settings JSONB,
  result TEXT CHECK (result IN ('success','partial','fail')),
  notes TEXT,
  photos JSONB DEFAULT '[]',
  print_time_minutes INTEGER,
  material_grams NUMERIC(8,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stl_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public STL files visible to all" ON stl_files FOR SELECT USING (is_public = true OR uploader_id = auth.uid());
CREATE POLICY "Uploaders manage own STL" ON stl_files FOR ALL USING (uploader_id = auth.uid());
CREATE POLICY "Test reports visible to all" ON test_reports FOR SELECT USING (true);
CREATE POLICY "Testers manage own reports" ON test_reports FOR ALL USING (tester_id = auth.uid());
