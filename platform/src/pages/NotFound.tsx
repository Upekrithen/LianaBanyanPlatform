import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useBuilderModeSafe } from '@/components/builder/BuilderModeContext';
import { Glasses } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();
  const { toggleBuilderMode, isBuilderModeActive } = useBuilderModeSafe();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PortalPageLayout xrayId="not-found">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-lg mx-auto px-4">
          <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
          <p className="mb-2 text-xl text-muted-foreground">Page not found</p>
          <p className="mb-6 text-sm text-muted-foreground">
            If you followed a link to get here, let us know so we can fix it.
          </p>
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={toggleBuilderMode}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition-colors"
            >
              <Glasses className="w-5 h-5" />
              {isBuilderModeActive ? "X-Ray Active — Draw & Report" : "Report This Issue"}
            </button>
            <p className="text-xs text-muted-foreground/70 max-w-xs">
              Opens X-Ray Goggles — screenshot the problem, draw on it, and send us a message.
            </p>
            <Link to="/" className="text-primary underline hover:text-primary/80 text-sm mt-2">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </PortalPageLayout>
  );
};

export default NotFound;
