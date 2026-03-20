import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PortalPageLayout xrayId="not-found">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <Link to="/" className="text-primary underline hover:text-primary/80">
            Return to Home
          </Link>
        </div>
      </div>
    </PortalPageLayout>
  );
};

export default NotFound;
