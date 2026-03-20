/**
 * PortalPageLayout — Unified page wrapper with 60/30/10 portal palettes
 * =====================================================================
 * Every page wraps in this. It reads detectPortal() and applies the correct
 * data-portal attribute so CSS variable overrides kick in automatically.
 * All shadcn/ui components inside inherit the portal's palette.
 *
 * Usage:
 *   <PortalPageLayout title="Why No Ads" maxWidth="lg">
 *     <p className="text-muted-foreground">Content here...</p>
 *   </PortalPageLayout>
 *
 * For immersive pages (games, landing):
 *   <PortalPageLayout variant="immersive">
 *     <FullScreenGame />
 *   </PortalPageLayout>
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { detectPortal } from '@/utils/portalDetector';

interface PortalPageLayoutProps {
  children: React.ReactNode;
  /** Max content width: sm=640px, md=768px, lg=1024px, xl=1280px, full=100% */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Optional page title rendered as consistent h1 */
  title?: string;
  /** Optional subtitle below the title */
  subtitle?: string;
  /** Show a back button in the top-left */
  backButton?: boolean;
  /** data-xray-id for X-Ray Goggles compatibility */
  xrayId?: string;
  /** Immersive mode: no padding, full viewport, for games/landing pages */
  variant?: 'default' | 'immersive';
  /** Additional className on the outer wrapper */
  className?: string;
}

const maxWidthMap = {
  sm: 'max-w-2xl',
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-full',
};

export const PortalPageLayout: React.FC<PortalPageLayoutProps> = ({
  children,
  maxWidth = 'lg',
  title,
  subtitle,
  backButton = false,
  xrayId,
  variant = 'default',
  className = '',
}) => {
  const portal = detectPortal();
  const navigate = useNavigate();

  if (variant === 'immersive') {
    return (
      <div
        data-portal={portal}
        data-xray-id={xrayId}
        className={`min-h-screen bg-background text-foreground ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      data-portal={portal}
      data-xray-id={xrayId}
      className={`min-h-screen bg-background text-foreground ${className}`}
    >
      <div className={`mx-auto px-4 sm:px-6 py-8 sm:py-12 ${maxWidthMap[maxWidth]}`}>
        {/* Back button */}
        {backButton && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
        )}

        {/* Title + subtitle */}
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-lg text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default PortalPageLayout;
