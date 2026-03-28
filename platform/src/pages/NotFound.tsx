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
          <p className="mb-6 text-sm text-muted-foreground max-w-md mx-auto">
            If you followed a link to get here, please contact us directly — we want to make sure you get where you're going.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/" className="text-primary underline hover:text-primary/80">
              Return to Home
            </Link>
            <span className="hidden sm:inline text-muted-foreground">|</span>
            <a href="mailto:Founder@LianaBanyan.com" className="text-primary underline hover:text-primary/80">
              Email Founder@LianaBanyan.com
            </a>
            <span className="hidden sm:inline text-muted-foreground">|</span>
            <a href="tel:+14065781232" className="text-primary underline hover:text-primary/80">
              Call 406-578-1232
            </a>
          </div>
        </div>
      </div>
    </PortalPageLayout>
  );
};

export default NotFound;
