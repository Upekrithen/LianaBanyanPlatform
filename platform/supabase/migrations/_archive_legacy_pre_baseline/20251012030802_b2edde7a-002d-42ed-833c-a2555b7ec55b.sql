-- Create voting configs for existing projects that don't have one
INSERT INTO public.project_voting_configs (project_id)
SELECT p.id
FROM public.projects p
LEFT JOIN public.project_voting_configs pvc ON pvc.project_id = p.id
WHERE pvc.id IS NULL
ON CONFLICT (project_id) DO NOTHING;
