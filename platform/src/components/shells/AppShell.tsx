import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  pageTitle: string;
  breadcrumbs?: ReactNode;
  rightRail?: ReactNode;
  hero?: ReactNode;
  className?: string;
  xrayBase?: string;
};

export function AppShell({
  children,
  pageTitle,
  breadcrumbs,
  rightRail,
  hero,
  className,
  xrayBase,
}: AppShellProps) {
  return (
    <SidebarProvider defaultOpen>
      <div
        className={cn("min-h-screen w-full bg-background text-foreground", className)}
        data-xray-id={xrayBase ? `${xrayBase}-shell` : undefined}
      >
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <header
              className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur"
              data-xray-id={xrayBase ? `${xrayBase}-header` : undefined}
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <div className="min-w-0">
                  {breadcrumbs ? (
                    <div className="mb-1 text-xs text-muted-foreground">{breadcrumbs}</div>
                  ) : null}
                  <h1 className="truncate text-lg font-semibold sm:text-xl">{pageTitle}</h1>
                </div>
                <SidebarTrigger className="shrink-0" />
              </div>
            </header>

            {hero ? (
              <section
                className="border-b bg-muted/20 px-4 py-4 sm:px-6"
                data-xray-id={xrayBase ? `${xrayBase}-hero` : undefined}
              >
                {hero}
              </section>
            ) : null}

            <div className="flex min-h-0 flex-1">
              <main
                className="min-w-0 flex-1 px-4 py-6 sm:px-6"
                data-xray-id={xrayBase ? `${xrayBase}-main` : undefined}
              >
                {children}
              </main>
              {rightRail ? (
                <aside
                  className="hidden w-80 shrink-0 border-l p-4 xl:block"
                  data-xray-id={xrayBase ? `${xrayBase}-rail` : undefined}
                >
                  {rightRail}
                </aside>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
