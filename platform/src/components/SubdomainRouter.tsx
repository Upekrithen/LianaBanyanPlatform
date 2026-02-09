import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSubdomainProject } from '@/utils/subdomainRouter';

export const SubdomainRouter = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSubdomain = async () => {
      setIsChecking(true);
      const projectFromSubdomain = await getSubdomainProject();
      
      // If we're on a subdomain and not already on the project page
      if (projectFromSubdomain && !location.pathname.startsWith('/project/')) {
        // Only redirect from root or auth pages
        if (location.pathname === '/' || location.pathname === '/auth') {
          navigate(`/project/${projectFromSubdomain}`, { replace: true });
        }
      }
      setIsChecking(false);
    };

    checkSubdomain();
  }, [navigate, location]);

  // Show nothing while checking to prevent flash of wrong content
  if (isChecking) {
    return null;
  }

  return <>{children}</>;
};
