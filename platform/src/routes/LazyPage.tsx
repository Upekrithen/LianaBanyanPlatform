import { Suspense } from "react";

export function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    }>
      {children}
    </Suspense>
  );
}
