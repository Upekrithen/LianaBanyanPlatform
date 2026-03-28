import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useTribes, useMyTribes, type Tribe } from "@/hooks/useTribes";
import { Plus, Search, Users, Flame, ArrowRight } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  family: "Family",
  neighborhood: "Neighborhood",
  interest: "Interest",
  cultural: "Cultural",
  hybrid: "Hybrid",
};

export default function Tribes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: tribes, isLoading } = useTribes(search || undefined);
  const { data: myTribes } = useMyTribes();

  const tribesByType = (type: string) =>
    tribes?.filter((t) => t.tribe_type === type) ?? [];
  const types = [...new Set(tribes?.map((t) => t.tribe_type).filter(Boolean) ?? [])];

  return (
    <PortalPageLayout maxWidth="xl" xrayId="tribes-directory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Flame className="h-8 w-8 text-amber-600" />
              Tribes
            </h1>
            <p className="text-muted-foreground mt-1">
              Personal groups. Family, neighborhoods, interests — join as many as you like.
            </p>
          </div>
          <Button
            onClick={() => navigate("/tribes/create")}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="h-4 w-4 mr-2" /> Gather a Tribe
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tribes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* My Tribes */}
        {myTribes && myTribes.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">My Tribes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTribes.map((m) => (
                <TribeCard
                  key={m.id}
                  tribe={m.tribe!}
                  isMember
                  onClick={() => navigate(`/tribes/${m.tribe?.slug}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Tribes */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({tribes?.length ?? 0})</TabsTrigger>
            {types.map((t) => (
              <TabsTrigger key={t} value={t}>
                {TYPE_LABELS[t] || t} ({tribesByType(t).length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <TribeGrid tribes={tribes} isLoading={isLoading} />
          </TabsContent>
          {types.map((t) => (
            <TabsContent key={t} value={t} className="mt-4">
              <TribeGrid tribes={tribesByType(t)} isLoading={isLoading} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </PortalPageLayout>
  );
}

function TribeCard({
  tribe,
  isMember,
  onClick,
}: {
  tribe: Tribe;
  isMember?: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all group border-l-4"
      style={{ borderLeftColor: tribe.color_primary || "#d97706" }}
      onClick={onClick}
    >
      {tribe.banner_url && (
        <div className="h-24 overflow-hidden rounded-t-lg">
          <img
            src={tribe.banner_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{tribe.name}</CardTitle>
          <div className="flex gap-1">
            {isMember && <Badge className="bg-amber-100 text-amber-700">Member</Badge>}
            {tribe.tribe_type && (
              <Badge variant="outline" className="text-xs">
                {TYPE_LABELS[tribe.tribe_type] || tribe.tribe_type}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {tribe.description || "No description yet."}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {tribe.member_count} members
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}

function TribeGrid({
  tribes,
  isLoading,
}: {
  tribes: Tribe[] | undefined;
  isLoading: boolean;
}) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading tribes...
      </div>
    );
  }

  if (!tribes || tribes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No tribes found. Be the first to gather one!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tribes.map((t) => (
        <TribeCard
          key={t.id}
          tribe={t}
          onClick={() => navigate(`/tribes/${t.slug}`)}
        />
      ))}
    </div>
  );
}
