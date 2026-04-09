import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalSearch } from "@/components/GlobalSearch";
import { User, PanelRightOpen, PanelRightClose, X } from "lucide-react";
import { detectPortal } from "@/utils/portalDetector";
import { cn } from "@/lib/utils";

interface FocusShellProps {
  children: ReactNode;
  /** Show workspace drawer toggle (default true) */
  drawer?: boolean;
  /** Additional className on outermost wrapper */
  className?: string;
}

export function FocusShell({ children, drawer = true, className }: FocusShellProps) {
  const { user } = useAuth();
  const portal = detectPortal();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div
      data-portal={portal}
      data-shell="focus"
      className={cn("min-h-screen bg-slate-950 text-slate-100 flex flex-col", className)}
    >
      {/* Slim Focus Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-950/90 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-lg font-bold tracking-wide">
            <span className="text-white">Liana</span>{" "}
            <span className="text-green-400">Banyan</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <GlobalSearch />
          {user ? (
            <Link
              to="/profile-settings"
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline truncate max-w-[120px]">
                {user.email?.split("@")[0] || "Account"}
              </span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="text-sm text-green-400 hover:text-green-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          )}
          {drawer && (
            <button
              onClick={() => setDrawerOpen((o) => !o)}
              className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={drawerOpen ? "Close workspace" : "Open workspace"}
            >
              {drawerOpen ? (
                <PanelRightClose className="w-5 h-5" />
              ) : (
                <PanelRightOpen className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main canvas */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Workspace Drawer */}
        {drawer && (
          <>
            {drawerOpen && (
              <div
                className="fixed inset-0 bg-black/40 z-40 xl:hidden"
                onClick={() => setDrawerOpen(false)}
              />
            )}
            <aside
              className={cn(
                "fixed right-0 top-0 h-full w-[380px] max-w-[90vw] z-50 bg-slate-900 border-l border-white/10 shadow-2xl",
                "transform transition-transform duration-300 ease-in-out",
                drawerOpen ? "translate-x-0" : "translate-x-full"
              )}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-sm font-semibold text-slate-300">Workspace</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100%-48px)]">
                <DrawerSection title="Essentials">
                  <DrawerLink to="/dashboard" label="Dashboard" />
                  <DrawerLink to="/membership" label="Membership" />
                  <DrawerLink to="/wallet" label="Wallet" />
                  <DrawerLink to="/portfolio" label="Portfolio" />
                </DrawerSection>
                <DrawerSection title="Initiatives">
                  <DrawerLink to="/cue-cards/campaigns" label="Cue Cards" />
                  <DrawerLink to="/marketplace" label="Marketplace" />
                  <DrawerLink to="/ghost" label="Ghost World" />
                  <DrawerLink to="/captain/dashboard" label="Captain" />
                </DrawerSection>
                <DrawerSection title="Tools">
                  <DrawerLink to="/buy-credits" label="Buy Credits" />
                  <DrawerLink to="/moneypenny" label="MoneyPenny" />
                  <DrawerLink to="/calendar" label="Calendar" />
                  <DrawerLink to="/contact" label="Contact" />
                </DrawerSection>
              </nav>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}

function DrawerSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-2">{title}</h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function DrawerLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="block px-3 py-2 rounded-md text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
    >
      {label}
    </Link>
  );
}
