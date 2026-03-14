/**
 * Creator Showcase — Enhanced product card for creator-sourced items
 * Creator name/avatar, "See their work" link, images, Cost+20, "Back this creator" (BandWagon), Medallion tier.
 * data-xray-id: creator-showcase
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, User, Award } from "lucide-react";
import { ProjectBackingFlow } from "@/components/bandwagon";

export interface CreatorShowcaseProps {
  creatorName: string;
  creatorAvatarUrl?: string | null;
  /** Instagram or external profile URL */
  creatorProfileUrl?: string | null;
  productTitle?: string;
  productImageUrls?: string[];
  /** e.g. "Cost+20: $24" */
  priceDisplay?: string;
  projectId?: string;
  projectType?: string;
  currentBackerCount?: number;
  medallionTier?: string;
}

export function CreatorShowcase({
  creatorName,
  creatorAvatarUrl,
  creatorProfileUrl,
  productTitle,
  productImageUrls = [],
  priceDisplay,
  projectId,
  projectType = "creator",
  currentBackerCount = 0,
  medallionTier,
}: CreatorShowcaseProps) {
  return (
    <Card className="overflow-hidden" data-xray-id="creator-showcase">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          {creatorAvatarUrl ? (
            <img
              src={creatorAvatarUrl}
              alt={creatorName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{creatorName}</p>
            {creatorProfileUrl && (
              <a
                href={creatorProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                See their work
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          {medallionTier && (
            <Badge variant="secondary" className="gap-1 shrink-0">
              <Award className="w-3 h-3" />
              {medallionTier}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {productTitle && (
          <p className="text-sm font-medium">{productTitle}</p>
        )}
        {productImageUrls.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {productImageUrls.slice(0, 3).map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="h-24 w-24 rounded-md object-cover shrink-0"
              />
            ))}
          </div>
        )}
        {priceDisplay && (
          <p className="text-sm text-muted-foreground">{priceDisplay}</p>
        )}
        {projectId && (
          <div className="pt-2 border-t">
            <ProjectBackingFlow
              projectId={projectId}
              projectType={projectType}
              projectTitle={productTitle ?? creatorName}
              currentBackerCount={currentBackerCount}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
