-- K421 Task 5: Ingest new Tatiana "In Honor Of" file into cephas_content_registry
-- File: Cephas/cephas-hugo/content/tributes/tatiana-schlossberg-health-accords.md
-- Created by Bishop B110 as scaffold awaiting Founder prose pass.
-- send_ready = false until Founder ratifies the scaffold.

-- 1. Expand category constraint to include 'tribute'
ALTER TABLE cephas_content_registry DROP CONSTRAINT IF EXISTS cephas_content_registry_category_check;
ALTER TABLE cephas_content_registry ADD CONSTRAINT cephas_content_registry_category_check
  CHECK (category = ANY(ARRAY[
    'academic_paper','academic','crown_letter','outreach_letter','open_letter',
    'system_design','initiative','innovation','hexisle',
    'article','vault_archive','reference','under_the_hood','founder','pitch',
    'business-plan','fly_on_the_wall','pudding','tribute'
  ]));

-- 2. Insert the new tribute into cephas_content_registry
INSERT INTO cephas_content_registry (slug, title, category, subcategory, style, source_path, implementation_status, bishop_session, content_markdown)
VALUES (
  'tatiana-schlossberg-health-accords',
  'In Honor of Tatiana Schlossberg — The Health Accords',
  'tribute',
  'tributes',
  'pudding',
  'Cephas/cephas-hugo/content/tributes/tatiana-schlossberg-health-accords.md',
  'draft',
  'B110',
  $md$---
title: "In Honor of Tatiana Schlossberg — The Health Accords"
date: 2026-02-02
description: "A second open letter to those who continue her work"
category: "Tributes"
status: "draft — scaffold awaiting Founder prose pass B110"
---

# In Honor of Tatiana Schlossberg — The Health Accords

> An Open Letter to Those Who Continue Her Work

*Scaffold created B110. Awaiting Founder prose pass. See source file for full content.*
$md$
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  source_path = EXCLUDED.source_path,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();

-- 3. Fix K420 helm_content_queue entry to point to correct file
-- K420 migration pointed to the OLD tribute file; correct to the NEW "In Honor Of" file
UPDATE helm_content_queue
SET source_file_path = 'Cephas/cephas-hugo/content/tributes/tatiana-schlossberg-health-accords.md',
    founder_notes = 'B110: scaffold created by Bishop. Awaiting Founder prose pass. Do NOT dispatch until Founder flips send_ready.',
    updated_at = now()
WHERE slug = 'tribute-tatiana-schlossberg-in-honor-of';
