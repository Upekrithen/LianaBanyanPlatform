import { supabase } from '@/integrations/supabase/client';

export const getSubdomainProject = async (): Promise<string | null> => {
  const hostname = window.location.hostname;
  
  // Skip if localhost or direct IP
  if (hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return null;
  }
  
  // Skip lovable preview domains
  if (hostname.includes('lovable.app')) {
    return null;
  }

  try {
    // First, check if this is a custom domain mapping
    const { data: domainMapping } = await supabase
      .from('project_domain_mappings')
      .select('subdomain_target, project_id, projects(project_sku)')
      .eq('custom_domain', hostname)
      .eq('dns_verified', true)
      .maybeSingle();

    if (domainMapping?.projects) {
      const project = domainMapping.projects as { project_sku: string };
      return project.project_sku;
    }

    // Check for wildcard custom domain (e.g., *.hexisle.com)
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const rootDomain = parts.slice(-2).join('.');
      
      const { data: wildcardMapping } = await supabase
        .from('project_domain_mappings')
        .select('subdomain_target, project_id, projects(project_sku)')
        .eq('custom_domain', rootDomain)
        .eq('dns_verified', true)
        .maybeSingle();

      if (wildcardMapping?.projects) {
        const project = wildcardMapping.projects as { project_sku: string };
        return project.project_sku;
      }
    }

    // Finally, check project_subdomains table
    if (parts.length >= 3) {
      const subdomain = parts[0].toLowerCase();
      
      const { data: subdomainData } = await supabase
        .from('project_subdomains')
        .select('project_id, projects(project_sku)')
        .eq('subdomain', subdomain)
        .eq('is_active', true)
        .maybeSingle();

      if (subdomainData?.projects) {
        const project = subdomainData.projects as { project_sku: string };
        return project.project_sku;
      }
    }

    return null;
  } catch (error) {
    console.error('Error resolving subdomain:', error);
    return null;
  }
};
