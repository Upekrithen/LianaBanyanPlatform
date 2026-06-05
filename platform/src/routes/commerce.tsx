import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import { ProtectedRoute, ExplorerRoute } from "@/components/ProtectedRoute";
import { LazyPage } from "./LazyPage";

const Marketplace = lazy(() => import("@/pages/MarketplaceV2Page"));
const BrowseMarketplace = lazy(() => import("@/pages/BrowseMarketplace"));
const BrowseBusiness = lazy(() => import("@/pages/BrowseBusiness"));
const BrowseNonprofit = lazy(() => import("@/pages/BrowseNonprofit"));
const BrowseNetwork = lazy(() => import("@/pages/BrowseNetwork"));
const MedallionSwap = lazy(() => import("@/pages/MedallionSwap"));
const MedallionManagement = lazy(() => import("@/pages/MedallionManagement"));
const The2ndSecondPortal = lazy(() => import("@/pages/The2ndSecondPortal"));
const HelpWanted = lazy(() => import("@/pages/HelpWanted"));
const TheFurnace = lazy(() => import("@/pages/TheFurnace"));
const StoreFrontAggregation = lazy(() => import("@/pages/StoreFrontAggregation"));
const MainSquare = lazy(() => import("@/pages/MainSquare"));
const BizKaleidoscope = lazy(() => import("@/pages/BizKaleidoscope"));
const GarageSalesPage = lazy(() => import("@/pages/GarageSalesPage"));
const MatchTrade = lazy(() => import("@/pages/MatchTrade"));
const DesignBattleArena = lazy(() => import("@/pages/DesignBattleArena"));
const EmporiumTemplates = lazy(() => import("@/pages/EmporiumTemplates"));
const ThemeGallery = lazy(() => import("@/pages/ThemeGallery"));
const ThemeEditorPage = lazy(() => import("@/pages/ThemeEditor"));
const ContributionExplainer = lazy(() => import("@/pages/ContributionExplainer"));
const GleanersCorner = lazy(() => import("@/pages/GleanersCorner"));
const ContestDirectory = lazy(() => import("@/pages/ContestDirectory"));
const ContestDetailPage = lazy(() => import("@/pages/ContestDetailPage"));
const ContestEntryPage = lazy(() => import("@/pages/ContestEntryPage"));
const BuyCreditsPage = lazy(() => import("@/pages/BuyCreditsPage"));
const SubscribePage = lazy(() => import("@/pages/SubscribePage"));
const Subscriptions = lazy(() => import("@/pages/Subscriptions"));
const HeraldSubscription = lazy(() => import("@/pages/HeraldSubscription"));
const HeraldSuccess = lazy(() => import("@/pages/HeraldSuccess"));
const SponsorPortal = lazy(() => import("@/pages/SponsorPortal"));
const SponsorshipPage = lazy(() => import("@/pages/SponsorshipPage"));
const SponsorSuccess = lazy(() => import("@/pages/SponsorSuccess"));
const SwoopPage = lazy(() => import("@/pages/SwoopPage"));
const SwoopProjectPage = lazy(() => import("@/pages/SwoopProjectPage"));
const SwoopAdminPage = lazy(() => import("@/pages/SwoopAdminPage"));
const HeroProjectPage = lazy(() => import("@/pages/HeroProjectPage"));
const FinancialTransparencyPage = lazy(() => import("@/pages/FinancialTransparencyPage"));
const StoreTemplates = lazy(() => import("@/pages/StoreTemplates"));
const ShowcasePromotion = lazy(() => import("@/pages/ShowcasePromotion"));
const GhostWorldMall = lazy(() => import("@/pages/GhostWorldMall"));
const CreatorDraftPick = lazy(() => import("@/pages/CreatorDraftPick"));
const MenuPage = lazy(() => import("@/pages/MenuPage"));
const StarterKitPage = lazy(() => import("@/pages/StarterKitPage"));
const DemandSignaling = lazy(() => import("@/pages/DemandSignaling"));
const OrderManifestPage = lazy(() => import("@/pages/OrderManifestPage"));
const CrowdfundingIntegration = lazy(() => import("@/pages/CrowdfundingIntegration"));
const MyPledges = lazy(() => import("@/pages/MyPledges"));
const GuildStakeSuccess = lazy(() => import("@/pages/GuildStakeSuccess"));
const CreditPurchaseSuccess = lazy(() => import("@/pages/CreditPurchaseSuccess"));
const PreOrderSuccess = lazy(() => import("@/pages/PreOrderSuccess"));
const BusinessCampaignDirectory = lazy(() => import("@/pages/BusinessCampaignDirectory"));
const BusinessCampaignDetail = lazy(() => import("@/pages/BusinessCampaignDetail"));
const NominateBusinessPage = lazy(() => import("@/pages/NominateBusinessPage"));
const PitchPacketPage = lazy(() => import("@/pages/PitchPacketPage"));
const DesignAuctionPage = lazy(() => import("@/pages/DesignAuctionPage"));
const StorefrontDetailPage = lazy(() => import("@/pages/StorefrontDetailPage"));
const NeighborhoodBrowserPage = lazy(() => import("@/pages/NeighborhoodBrowserPage"));
const NeighborhoodDetailPage = lazy(() => import("@/pages/NeighborhoodDetailPage"));
const NeighborhoodBuilderPage = lazy(() => import("@/pages/NeighborhoodBuilderPage"));
const TrunkMirrorPage = lazy(() => import("@/pages/TrunkMirrorPage"));
const CityAggregationPage = lazy(() => import("@/pages/CityAggregationPage"));
const CityDirectoryPage = lazy(() => import("@/pages/CityAggregationPage").then(m => ({ default: m.CityDirectoryPage })));
const Arenas = lazy(() => import("@/pages/Arenas"));
const IPRegistration = lazy(() => import("@/pages/IPRegistration"));
const SubscriptionChannelsPage = lazy(() => import("@/pages/SubscriptionChannelsPage"));
const CreateSubscriptionChannelPage = lazy(() => import("@/pages/CreateSubscriptionChannelPage"));
const SubscriptionChannelV2Page = lazy(() => import("@/pages/SubscriptionChannelV2Page"));

// BP072-W9 — Data / Dashboards / Telemetry / Thermometer
const BanyanMetricPage = lazy(() => import("@/pages/BanyanMetricPage"));
const ThermometerPage = lazy(() => import("@/pages/ThermometerPage"));

export const commerceRoutes = (
  <>
    <Route path="/marketplace" element={<ExplorerRoute><LazyPage><Marketplace /></LazyPage></ExplorerRoute>} />
    <Route path="/browse/marketplace" element={<LazyPage><BrowseMarketplace /></LazyPage>} />
    <Route path="/browse/business" element={<ProtectedRoute><LazyPage><BrowseBusiness /></LazyPage></ProtectedRoute>} />
    <Route path="/browse/nonprofit" element={<ProtectedRoute><LazyPage><BrowseNonprofit /></LazyPage></ProtectedRoute>} />
    <Route path="/browse/network" element={<ProtectedRoute><LazyPage><BrowseNetwork /></LazyPage></ProtectedRoute>} />
    <Route path="/ledger" element={<ExplorerRoute><LazyPage><FinancialTransparencyPage /></LazyPage></ExplorerRoute>} />
    <Route path="/transparency" element={<ExplorerRoute><LazyPage><FinancialTransparencyPage /></LazyPage></ExplorerRoute>} />
    <Route path="/transparent-ledger" element={<Navigate to="/ledger" replace />} />
    <Route path="/medallion-swap" element={<ExplorerRoute><LazyPage><MedallionSwap /></LazyPage></ExplorerRoute>} />
    <Route path="/senior-pics" element={<ExplorerRoute><LazyPage><MedallionSwap /></LazyPage></ExplorerRoute>} />
    <Route path="/medallion-management" element={<ProtectedRoute><LazyPage><MedallionManagement /></LazyPage></ProtectedRoute>} />
    <Route path="/the-2nd-second" element={<ExplorerRoute><LazyPage><The2ndSecondPortal /></LazyPage></ExplorerRoute>} />
    <Route path="/help-wanted" element={<LazyPage><HelpWanted /></LazyPage>} />
    <Route path="/marketplace/services" element={<LazyPage><HelpWanted /></LazyPage>} />
    <Route path="/the-furnace" element={<LazyPage><TheFurnace /></LazyPage>} />
    <Route path="/furnace" element={<LazyPage><TheFurnace /></LazyPage>} />
    <Route path="/storefront-aggregation" element={<LazyPage><StoreFrontAggregation /></LazyPage>} />
    <Route path="/biz-aggregation" element={<LazyPage><StoreFrontAggregation /></LazyPage>} />
    <Route path="/storefront/:id" element={<ExplorerRoute><LazyPage><StorefrontDetailPage /></LazyPage></ExplorerRoute>} />
    <Route path="/neighborhoods" element={<ExplorerRoute><LazyPage><NeighborhoodBrowserPage /></LazyPage></ExplorerRoute>} />
    <Route path="/neighborhoods/builder" element={<ProtectedRoute><LazyPage><NeighborhoodBuilderPage /></LazyPage></ProtectedRoute>} />
    <Route path="/neighborhoods/trunk-mirror" element={<ProtectedRoute><LazyPage><TrunkMirrorPage /></LazyPage></ProtectedRoute>} />
    <Route path="/neighborhoods/:slug" element={<ExplorerRoute><LazyPage><NeighborhoodDetailPage /></LazyPage></ExplorerRoute>} />
    <Route path="/marketplace/neighborhoods" element={<ExplorerRoute><LazyPage><NeighborhoodBrowserPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cities" element={<ExplorerRoute><LazyPage><CityDirectoryPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cities/:city" element={<ExplorerRoute><LazyPage><CityAggregationPage /></LazyPage></ExplorerRoute>} />
    <Route path="/marketplace/cities" element={<ExplorerRoute><LazyPage><CityDirectoryPage /></LazyPage></ExplorerRoute>} />
    <Route path="/marketplace/cities/:city" element={<ExplorerRoute><LazyPage><CityAggregationPage /></LazyPage></ExplorerRoute>} />
    <Route path="/main-square" element={<LazyPage><MainSquare /></LazyPage>} />
    <Route path="/kaleidoscope" element={<LazyPage><BizKaleidoscope /></LazyPage>} />
    <Route path="/biz-directory" element={<LazyPage><BizKaleidoscope /></LazyPage>} />
    <Route path="/family-table/garage-sales" element={<LazyPage><GarageSalesPage /></LazyPage>} />
    <Route path="/garage-sales" element={<LazyPage><GarageSalesPage /></LazyPage>} />
    <Route path="/matchtrade" element={<LazyPage><MatchTrade /></LazyPage>} />
    <Route path="/marks-for-marks" element={<LazyPage><MatchTrade /></LazyPage>} />
    <Route path="/arena" element={<ExplorerRoute><LazyPage><DesignBattleArena /></LazyPage></ExplorerRoute>} />
    <Route path="/design-battle" element={<ExplorerRoute><LazyPage><DesignBattleArena /></LazyPage></ExplorerRoute>} />
    <Route path="/battles" element={<ExplorerRoute><LazyPage><DesignBattleArena /></LazyPage></ExplorerRoute>} />
    <Route path="/design/themes" element={<ExplorerRoute><LazyPage><ThemeGallery /></LazyPage></ExplorerRoute>} />
    <Route path="/design/themes/create" element={<ProtectedRoute><LazyPage><ThemeEditorPage /></LazyPage></ProtectedRoute>} />
    <Route path="/emporium/templates" element={<LazyPage><EmporiumTemplates /></LazyPage>} />
    <Route path="/emporium/designs" element={<LazyPage><EmporiumTemplates /></LazyPage>} />
    <Route path="/emporium" element={<LazyPage><EmporiumTemplates /></LazyPage>} />
    <Route path="/sponsorship-guide" element={<ProtectedRoute><LazyPage><ContributionExplainer /></LazyPage></ProtectedRoute>} />
    <Route path="/gleaners-corner" element={<LazyPage><GleanersCorner /></LazyPage>} />
    <Route path="/subscribe" element={<ExplorerRoute><LazyPage><SubscribePage /></LazyPage></ExplorerRoute>} />
    <Route path="/subscriptions" element={<LazyPage><Subscriptions /></LazyPage>} />
    <Route path="/buy-credits" element={<ProtectedRoute><LazyPage><BuyCreditsPage /></LazyPage></ProtectedRoute>} />
    <Route path="/herald" element={<ProtectedRoute><LazyPage><HeraldSubscription /></LazyPage></ProtectedRoute>} />
    <Route path="/herald-subscription" element={<ProtectedRoute><LazyPage><HeraldSubscription /></LazyPage></ProtectedRoute>} />
    <Route path="/herald-success" element={<ProtectedRoute><LazyPage><HeraldSuccess /></LazyPage></ProtectedRoute>} />
    <Route path="/sponsor" element={<LazyPage><SponsorPortal /></LazyPage>} />
    <Route path="/sponsorship" element={<ProtectedRoute><LazyPage><SponsorshipPage /></LazyPage></ProtectedRoute>} />
    <Route path="/cascade" element={<ProtectedRoute><LazyPage><SponsorshipPage /></LazyPage></ProtectedRoute>} />
    <Route path="/johnny-appleseed" element={<LazyPage><SponsorPortal /></LazyPage>} />
    <Route path="/sponsor-success" element={<ProtectedRoute><LazyPage><SponsorSuccess /></LazyPage></ProtectedRoute>} />
    <Route path="/swoop" element={<ExplorerRoute><LazyPage><SwoopPage /></LazyPage></ExplorerRoute>} />
    <Route path="/swoop/:slug" element={<ExplorerRoute><LazyPage><SwoopProjectPage /></LazyPage></ExplorerRoute>} />
    <Route path="/swoop/admin" element={<ProtectedRoute><LazyPage><SwoopAdminPage /></LazyPage></ProtectedRoute>} />
    <Route path="/do-the-swoop" element={<ExplorerRoute><LazyPage><SwoopPage /></LazyPage></ExplorerRoute>} />
    <Route path="/heroes/:slug" element={<ExplorerRoute><LazyPage><HeroProjectPage /></LazyPage></ExplorerRoute>} />
    <Route path="/finances" element={<ExplorerRoute><LazyPage><FinancialTransparencyPage /></LazyPage></ExplorerRoute>} />
    <Route path="/financial-transparency" element={<ExplorerRoute><LazyPage><FinancialTransparencyPage /></LazyPage></ExplorerRoute>} />
    <Route path="/ledgers" element={<ExplorerRoute><LazyPage><FinancialTransparencyPage /></LazyPage></ExplorerRoute>} />
    <Route path="/store-templates" element={<ExplorerRoute><LazyPage><StoreTemplates /></LazyPage></ExplorerRoute>} />
    <Route path="/showcase-promotion" element={<ProtectedRoute><LazyPage><ShowcasePromotion /></LazyPage></ProtectedRoute>} />
    <Route path="/ghost-world/mall" element={<ExplorerRoute><LazyPage><GhostWorldMall /></LazyPage></ExplorerRoute>} />
    <Route path="/creator-draft-pick" element={<ExplorerRoute><LazyPage><CreatorDraftPick /></LazyPage></ExplorerRoute>} />
    <Route path="/menu/:slug" element={<LazyPage><MenuPage /></LazyPage>} />
    <Route path="/starter-kit" element={<ExplorerRoute><LazyPage><StarterKitPage /></LazyPage></ExplorerRoute>} />
    <Route path="/demand" element={<ExplorerRoute><LazyPage><DemandSignaling /></LazyPage></ExplorerRoute>} />
    <Route path="/business/orders" element={<ProtectedRoute><LazyPage><OrderManifestPage /></LazyPage></ProtectedRoute>} />
    <Route path="/crowdfunding" element={<ProtectedRoute><LazyPage><CrowdfundingIntegration /></LazyPage></ProtectedRoute>} />
    <Route path="/my-pledges" element={<ProtectedRoute><LazyPage><MyPledges /></LazyPage></ProtectedRoute>} />
    <Route path="/guild-stake-success" element={<ProtectedRoute><LazyPage><GuildStakeSuccess /></LazyPage></ProtectedRoute>} />
    <Route path="/credit-purchase-success" element={<ProtectedRoute><LazyPage><CreditPurchaseSuccess /></LazyPage></ProtectedRoute>} />
    <Route path="/preorder-success" element={<ProtectedRoute><LazyPage><PreOrderSuccess /></LazyPage></ProtectedRoute>} />
    <Route path="/contests" element={<ExplorerRoute><LazyPage><ContestDirectory /></LazyPage></ExplorerRoute>} />
    <Route path="/contests/:slug" element={<ExplorerRoute><LazyPage><ContestDetailPage /></LazyPage></ExplorerRoute>} />
    <Route path="/contests/:slug/enter" element={<ProtectedRoute><LazyPage><ContestEntryPage /></LazyPage></ProtectedRoute>} />
    <Route path="/campaigns" element={<LazyPage><BusinessCampaignDirectory /></LazyPage>} />
    <Route path="/campaigns/nominate" element={<ProtectedRoute><LazyPage><NominateBusinessPage /></LazyPage></ProtectedRoute>} />
    <Route path="/campaigns/:slug" element={<LazyPage><BusinessCampaignDetail /></LazyPage>} />
    <Route path="/campaigns/:slug/pitch-packet" element={<ProtectedRoute><LazyPage><PitchPacketPage /></LazyPage></ProtectedRoute>} />
    <Route path="/auction" element={<LazyPage><DesignAuctionPage /></LazyPage>} />
    <Route path="/arenas" element={<LazyPage><Arenas /></LazyPage>} />
    <Route path="/areopagus" element={<LazyPage><Arenas /></LazyPage>} />
    <Route path="/crucible" element={<LazyPage><Arenas /></LazyPage>} />
    <Route path="/funding-pool" element={<ProtectedRoute><LazyPage><BrowseNonprofit /></LazyPage></ProtectedRoute>} />
    <Route path="/project-costs" element={<ProtectedRoute><LazyPage><BrowseNetwork /></LazyPage></ProtectedRoute>} />
    <Route path="/ip/register" element={<ProtectedRoute><LazyPage><IPRegistration /></LazyPage></ProtectedRoute>} />
    <Route path="/subscription-channels" element={<LazyPage><SubscriptionChannelsPage /></LazyPage>} />
    <Route path="/subscription-channels/create" element={<ProtectedRoute><LazyPage><CreateSubscriptionChannelPage /></LazyPage></ProtectedRoute>} />
    <Route path="/subscription-channel/:slug" element={<LazyPage><SubscriptionChannelV2Page /></LazyPage>} />

    {/* BP072-W9 — Banyan Metric (C2) + Thermometer (C3) */}
    <Route path="/metrics" element={<LazyPage><BanyanMetricPage /></LazyPage>} />
    <Route path="/thermometer" element={<LazyPage><ThermometerPage /></LazyPage>} />
  </>
);
