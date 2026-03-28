import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useGuilds, useMyGuilds, type Guild } from "@/hooks/useGuilds";
import { Plus, Search, Users, Network, ArrowRight } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  makers: "Makers",
  designers: "Designers",
  farmers: "Farmers",
  drivers: "Drivers",
  tutors: "Tutors",
  captains: "Captains",
  developers: "Developers",
  artists: "Artists",
  other: "Other",
};

export default function Guilds() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: guilds, isLoading } = useGuilds(search || undefined);
  const { data: myGuilds } = useMyGuilds();

  const guildsByType = (type: string) =>
    guilds?.filter((g) => g.guild_type === type) ?? [];
  const types = [...new Set(guilds?.map((g) => g.guild_type) ?? [])];

  return (
    <PortalPageLayout maxWidth="xl" xrayId="guilds-directory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Network className="h-8 w-8 text-purple-600" />
              Guilds
            </h1>
            <p className="text-muted-foreground mt-1">
              Professional groups. Join many — you can be a designer AND a farmer.
            </p>
          </div>
          <Button
            onClick={() => navigate("/guilds/create")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" /> Forge a Guild
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guilds..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* My Guilds */}
        {myGuilds && myGuilds.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">My Guilds</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGuilds.map((m) => (
                <GuildCard
                  key={m.id}
                  guild={m.guild!}
                  isMember
                  onClick={() => navigate(`/guilds/${m.guild?.slug}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Guilds */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({guilds?.length ?? 0})</TabsTrigger>
            {types.map((t) => (
              <TabsTrigger key={t} value={t}>
                {TYPE_LABELS[t] || t} ({guildsByType(t).length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <GuildGrid guilds={guilds} isLoading={isLoading} />
          </TabsContent>
          {types.map((t) => (
            <TabsContent key={t} value={t} className="mt-4">
              <GuildGrid guilds={guildsByType(t)} isLoading={isLoading} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </PortalPageLayout>
  );
}

function GuildCard({
  guild,
  isMember,
  onClick,
}: {
  guild: Guild;
  isMember?: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all group border-l-4"
      style={{ borderLeftColor: guild.color_primary || "#7c3aed" }}
      onClick={onClick}
    >
      {guild.banner_image_url && (
        <div className="h-24 overflow-hidden rounded-t-lg">
          <img
            src={guild.banner_image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{guild.name}</CardTitle>
          <div className="flex gap-1">
            {isMember && <Badge className="bg-purple-100 text-purple-700">Member</Badge>}
            <Badge variant="outline" className="text-xs">
              {TYPE_LABELS[guild.guild_type] || guild.guild_type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {guild.description || "No description yet."}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {guild.member_count} members
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}

function GuildGrid({
  guilds,
  isLoading,
}: {
  guilds: Guild[] | undefined;
  isLoading: boolean;
}) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading guilds...
      </div>
    );
  }

  if (!guilds || guilds.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No guilds found. Be the first to forge one!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {guilds.map((g) => (
        <GuildCard
          key={g.id}
          guild={g}
          onClick={() => navigate(`/guilds/${g.slug}`)}
        />
      ))}
    </div>
  );
}
