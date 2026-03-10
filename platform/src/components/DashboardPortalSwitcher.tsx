import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalAccessCard, AccessLevel } from "./PortalAccessCard";
import { ShoppingBag, Briefcase, Heart, Network } from "lucide-react";
import { toast } from "sonner";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";

interface PortalAccess {
  marketplace: AccessLevel;
  business: AccessLevel;
  nonprofit: AccessLevel;
  network: AccessLevel;
}

export const DashboardPortalSwitcher = () => {
  const { openOnboard } = useSeamlessOnboard();
  const [access, setAccess] = useState<PortalAccess>({
    marketplace: 'browse',
    business: 'locked',
    nonprofit: 'locked',
    network: 'locked'
  });

  useEffect(() => {
    checkPortalAccess();
  }, []);

  const checkPortalAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Not logged in - all portals browseable except marketplace (public)
      setAccess({
        marketplace: 'browse',
        business: 'browse',
        nonprofit: 'browse',
        network: 'browse'
      });
      return;
    }

    // Check if membership stake is paid
    const { data: credits } = await supabase
      .from('user_credits')
      .select('membership_stake_paid')
      .eq('user_id', user.id)
      .single();

    const hasMembershipStake = credits?.membership_stake_paid || false;

    // Check user roles
    const { data: roles } = await supabase
      .from('projects')
      .select('role')
      .eq('user_id', user.id);

    // Check team membership
    const { data: teamMember } = await supabase
      .from('project_member_contracts')
      .select('id')
      .eq('member_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    // Check medallion holder
    const { data: medallion } = await supabase
      .from('member_medallion_collection')
      .select('id')
      .eq('user_id', user.id)
      .eq('medallion_minted', true)
      .maybeSingle();

    // Check B2B contracts
    const { data: credentials } = await supabase
      .from('xml_access_credentials')
      .select('id')
      .eq('is_active', true)
      .maybeSingle();

    const newAccess: PortalAccess = {
      marketplace: 'full', // Always full access for authenticated users
      business: !hasMembershipStake ? 'locked' : teamMember ? 'full' : 'browse',
      nonprofit: !hasMembershipStake ? 'locked' : medallion ? 'full' : 'browse',
      network: !hasMembershipStake ? 'locked' : credentials ? 'full' : 'browse'
    };

    setAccess(newAccess);
  };

  const handleRequestAccess = async (portal: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      openOnboard({ reason: "request access", actionLabel: "Join", membershipIncluded: true });
      return;
    }

    // Insert access request
    const { error } = await supabase
      .from('portal_access_requests')
      .insert({
        user_id: user.id,
        portal_type: portal,
        status: 'pending'
      });

    if (error) {
      toast.error("Failed to submit access request");
      return;
    }

    toast.success(`Access request submitted for ${portal} portal`);
  };

  const portals = [
    {
      title: "Marketplace Portal",
      description: "Discover and back community projects",
      domain: "lianabanyan.com",
      icon: <ShoppingBag className="h-6 w-6 text-primary" />,
      accessLevel: access.marketplace,
      categories: ["Sustainable Products", "Community Projects", "Sponsorship Opportunities"]
    },
    {
      title: "Business Portal",
      description: "Team management, positions, and operations",
      domain: "lianabanyan.biz",
      icon: <Briefcase className="h-6 w-6 text-primary" />,
      accessLevel: access.business,
      categories: ["Open Positions", "Project Teams", "Contract Roles", "Member Resources"]
    },
    {
      title: "Non-Profit Portal",
      description: "Member benefits, loans, and funding pool",
      domain: "lianabanyan.org",
      icon: <Heart className="h-6 w-6 text-primary" />,
      accessLevel: access.nonprofit,
      categories: ["Membership Benefits", "Loan Programs", "EOI Vesting", "Medallion Rewards"]
    },
    {
      title: "Network Portal",
      description: "B2B production, supply chain, and API access",
      domain: "lianabanyan.net",
      icon: <Network className="h-6 w-6 text-primary" />,
      accessLevel: access.network,
      categories: ["Manufacturing Services", "Supply Chain Partners", "XML Lockbox API", "Production Schedules"]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Portal Access</h2>
        <p className="text-muted-foreground">
          Explore different portals based on your role and permissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {portals.map((portal) => (
          <PortalAccessCard
            key={portal.domain}
            {...portal}
            onRequestAccess={() => handleRequestAccess(portal.domain.split('.')[1])}
          />
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-6 space-y-2">
        <h3 className="font-semibold">Access Level Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-green-600">● Full Access:</span>
            <p className="text-muted-foreground">Complete operational access</p>
          </div>
          <div>
            <span className="font-medium text-yellow-600">● Browse Only:</span>
            <p className="text-muted-foreground">Explore and discover services</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">● Request Access:</span>
            <p className="text-muted-foreground">Apply for operational permissions</p>
          </div>
        </div>
      </div>
    </div>
  );
};