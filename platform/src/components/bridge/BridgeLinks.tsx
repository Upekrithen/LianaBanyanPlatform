import { ExternalLink } from 'lucide-react';
import { useCreatorBridges, type CreatorBridge } from '@/hooks/useCreatorBridges';

const SERVICE_ICONS: Record<string, string> = {
  etsy: '/icons/etsy.svg',
  shopify: '/icons/shopify.svg',
  square: '/icons/square.svg',
  instagram_shop: '/icons/instagram.svg',
};

const SERVICE_LABELS: Record<string, string> = {
  etsy: 'Etsy', shopify: 'Shopify', square: 'Square', stripe: 'Stripe',
  paypal: 'PayPal', website: 'Website', instagram_shop: 'Instagram Shop',
  facebook_marketplace: 'Facebook Marketplace',
};

interface BridgeLinksProps {
  creatorId: string;
}

export function BridgeLinks({ creatorId }: BridgeLinksProps) {
  const { data: bridges = [], isLoading } = useCreatorBridges(creatorId);

  if (isLoading || bridges.length === 0) return null;

  return (
    <div className="py-3 border-t">
      <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Also available on</p>
      <div className="flex flex-wrap gap-3">
        {bridges.map((bridge: CreatorBridge) => (
          <a
            key={bridge.id}
            href={bridge.service_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {SERVICE_ICONS[bridge.service_type] ? (
              <img src={SERVICE_ICONS[bridge.service_type]} alt="" className="w-4 h-4" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <ExternalLink className="w-3.5 h-3.5" />
            )}
            <span>{bridge.display_name || SERVICE_LABELS[bridge.service_type] || bridge.service_type}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
