import { GlobalBreadcrumbs } from '@/components/GlobalBreadcrumbs';
// import { CompanyIslandProgram } from '@/components/CompanyIslandProgram';

export default function CompanyIsland() {
  return (
    <div className="min-h-screen bg-background">
      <GlobalBreadcrumbs />
      <main className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8">Company Island</h1>
        {/* <CompanyIslandProgram /> */}
      </main>
    </div>
  );
}
