import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubdomainProject } from '@/utils/subdomainRouter';

export const SubdomainRouter = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Safety timeout — never block rendering for more than 3 seconds
    const safetyTimer = setTimeout(() => {
      // Safety timeout — proceeding without subdomain check
      setIsChecking(false);
    }, 3000);

    const checkSubdomain = async () => {
      try {
        setIsChecking(true);
        const projectFromSubdomain = await getSubdomainProject();

        // If we're on a subdomain and not already on the project page
        if (projectFromSubdomain && !window.location.pathname.startsWith('/project/')) {
          // Only redirect from root or auth pages
          if (window.location.pathname === '/' || window.location.pathname === '/auth') {
            navigate(`/project/${projectFromSubdomain}`, { replace: true });
          }
        }
      } catch (err) {
        // Subdomain check failed — proceeding normally
      }
      clearTimeout(safetyTimer);
      setIsChecking(false);
    };

    checkSubdomain();
    return () => clearTimeout(safetyTimer);
    // Only check subdomain once on mount — not on every location change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading indicator while checking to prevent white screen flash
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground">Loading Liana Banyan...</div>
      </div>
    );
  }

  return <>{children}</>;
};
