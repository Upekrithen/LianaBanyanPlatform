import { ConnectedServices } from '@/components/bridge';

export default function ConnectedServicesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Connected Services</h1>
        <p className="text-muted-foreground mt-1">
          Link your existing shops and services so customers can find you everywhere.
          We send traffic <em>to</em> your other shops — we help you sell more, everywhere.
        </p>
      </div>
      <ConnectedServices />
    </div>
  );
}
