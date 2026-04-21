-- Add RLS policies for project owners to manage projects
CREATE POLICY "Project owners can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Project owners can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Project owners can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = owner_id);

-- Add RLS policies for products
CREATE POLICY "Project owners can create products"
  ON public.products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = products.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update products"
  ON public.products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = products.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can delete products"
  ON public.products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = products.project_id
        AND projects.owner_id = auth.uid()
    )
  );

-- Add RLS policies for production levels
CREATE POLICY "Project owners can create production levels"
  ON public.production_levels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.projects ON projects.id = products.project_id
      WHERE products.id = production_levels.product_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update production levels"
  ON public.production_levels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.projects ON projects.id = products.project_id
      WHERE products.id = production_levels.product_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can delete production levels"
  ON public.production_levels FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.projects ON projects.id = products.project_id
      WHERE products.id = production_levels.product_id
        AND projects.owner_id = auth.uid()
    )
  );

-- Add RLS policies for project images
CREATE POLICY "Project owners can manage project images"
  ON public.project_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_images.project_id
        AND projects.owner_id = auth.uid()
    )
  );

-- Add RLS policies for product images
CREATE POLICY "Project owners can manage product images"
  ON public.product_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.projects ON projects.id = products.project_id
      WHERE products.id = product_images.product_id
        AND projects.owner_id = auth.uid()
    )
  );

-- Add RLS policies for project sections
CREATE POLICY "Project owners can manage project sections"
  ON public.project_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_sections.project_id
        AND projects.owner_id = auth.uid()
    )
  );
