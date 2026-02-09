-- Fix the generate_project_module_xml function to have proper search_path
CREATE OR REPLACE FUNCTION public.generate_project_module_xml(p_project_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  xml_output TEXT;
  project_data RECORD;
BEGIN
  -- Get comprehensive project data
  SELECT 
    p.id,
    p.project_sku,
    p.name,
    p.description,
    p.detailed_description,
    p.created_at,
    json_agg(
      json_build_object(
        'product_id', prod.id,
        'product_sku', prod.product_sku,
        'name', prod.name,
        'description', prod.description,
        'details', prod.details,
        'production_levels', (
          SELECT json_agg(
            json_build_object(
              'level_number', pl.level_number,
              'level_name', pl.level_name,
              'units_count', pl.units_count,
              'unit_price', pl.unit_price,
              'votes_needed', pl.votes_needed,
              'current_votes', pl.current_votes
            )
          )
          FROM public.production_levels pl
          WHERE pl.product_id = prod.id
        )
      )
    ) as products
  INTO project_data
  FROM public.projects p
  LEFT JOIN public.products prod ON prod.project_id = p.id
  WHERE p.id = p_project_id
  GROUP BY p.id;
  
  -- Build XML structure
  xml_output := '<?xml version="1.0" encoding="UTF-8"?>' || chr(10);
  xml_output := xml_output || '<ProjectModule>' || chr(10);
  xml_output := xml_output || '  <ProjectSKU>' || COALESCE(project_data.project_sku, 'PENDING') || '</ProjectSKU>' || chr(10);
  xml_output := xml_output || '  <ProjectName>' || xmlescape(project_data.name) || '</ProjectName>' || chr(10);
  xml_output := xml_output || '  <Description>' || xmlescape(COALESCE(project_data.description, '')) || '</Description>' || chr(10);
  xml_output := xml_output || '  <DetailedDescription>' || xmlescape(COALESCE(project_data.detailed_description, '')) || '</DetailedDescription>' || chr(10);
  xml_output := xml_output || '  <CreatedAt>' || project_data.created_at::text || '</CreatedAt>' || chr(10);
  xml_output := xml_output || '  <Products>' || COALESCE(project_data.products::text, '[]') || '</Products>' || chr(10);
  xml_output := xml_output || '</ProjectModule>';
  
  RETURN xml_output;
END;
$$;