import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PaidMemberRoute } from "@/components/PaidMemberRoute";
import { LazyPage } from "./LazyPage";

const CreatorDashboard = lazy(() => import("@/pages/CreatorDashboard"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const ProfileSettings = lazy(() => import("@/pages/ProfileSettings"));
const ContentControlsPage = lazy(() => import("@/pages/ContentControlsPage"));
const BlockchainExplorer = lazy(() => import("@/pages/BlockchainExplorer"));
const MedallionViewer = lazy(() => import("@/pages/MedallionViewer"));
const Withdraw = lazy(() => import("@/pages/Withdraw"));
const ProviderDashboard = lazy(() => import("@/pages/ProviderDashboard"));
const RunnerDashboard = lazy(() => import("@/pages/RunnerDashboard"));
const OnboarderDashboard = lazy(() => import("@/pages/OnboarderDashboard"));
const LBCardV2Page = lazy(() => import("@/pages/LBCardV2Page"));
const ContentShieldV2Page = lazy(() => import("@/pages/ContentShieldV2Page"));
const FundMyCard = lazy(() => import("@/pages/FundMyCard"));
const WarChestPage = lazy(() => import("@/pages/WarChestPage"));
const PayoutsPage = lazy(() => import("@/pages/PayoutsPage"));
const HelmActionsPage = lazy(() => import("@/pages/HelmActionsPage"));
const OutOfBoundsPage = lazy(() => import("@/pages/OutOfBoundsPage"));
const SocialAccountsPage = lazy(() => import("@/pages/SocialAccountsPage"));
const ConnectedServicesPage = lazy(() => import("@/pages/ConnectedServicesPage"));
const GatekeeperInboxPage = lazy(() => import("@/pages/GatekeeperInboxPage"));
const MembershipPage = lazy(() => import("@/pages/MembershipPage"));
const MembershipDashboard = lazy(() => import("@/pages/MembershipDashboard"));
const EarningsDashboard = lazy(() => import("@/pages/EarningsDashboard"));
const MembershipSuccess = lazy(() => import("@/pages/MembershipSuccess"));
const MembershipConfirm = lazy(() => import("@/pages/MembershipConfirm"));
const CalendarPage = lazy(() => import("@/pages/CalendarV2Page"));
const AdaptScore = lazy(() => import("@/pages/AdaptScore"));
const AdaptScoreV2Page = lazy(() => import("@/pages/AdaptScoreV2Page"));
const C20PilotDashboard = lazy(() => import("@/pages/C20PilotDashboard"));
const C20Leaderboard = lazy(() => import("@/pages/C20Leaderboard"));
const XPLeaderboard = lazy(() => import("@/pages/XPLeaderboard"));
const CPlus20Dashboard = lazy(() => import("@/pages/CPlus20Dashboard"));
const XRayBountyDashboard = lazy(() => import("@/pages/XRayBountyDashboard"));
const PiggybackReviewPage = lazy(() => import("@/pages/PiggybackReviewPage"));
const MyPiggybackPage = lazy(() => import("@/pages/MyPiggybackPage"));
const MoneyPenny = lazy(() => import("@/pages/MoneyPenny"));
const MoneypennyBriefing = lazy(() => import("@/pages/MoneypennyBriefing"));
const SpotlightManager = lazy(() => import("@/pages/SpotlightManager"));
const MoneyPennySocial = lazy(() => import("@/pages/MoneyPennySocial"));
const MoneyPennyQA = lazy(() => import("@/pages/MoneyPennyQA"));
const Briefcase = lazy(() => import("@/pages/Briefcase"));
const MemberResources = lazy(() => import("@/pages/MemberResources"));
const DispatchComposePage = lazy(() => import("@/pages/DispatchComposePage"));
const DispatchQueuePage = lazy(() => import("@/pages/DispatchQueuePage"));
const InfluencerSignupPage = lazy(() => import("@/pages/InfluencerSignupPage"));
const BackerElectionPage = lazy(() => import("@/pages/BackerElectionPage"));
const BackerElectionV2Page = lazy(() => import("@/pages/BackerElectionV2Page"));
const DesignDemocracyV2Page = lazy(() => import("@/pages/DesignDemocracyV2Page"));
const WheelsV2Page = lazy(() => import("@/pages/WheelsV2Page"));
const HousingHubV2Page = lazy(() => import("@/pages/HousingHubV2Page"));
const HousingPage = lazy(() => import("@/pages/Housing"));
const PioneerShowcaseV2Page = lazy(() => import("@/pages/PioneerShowcaseV2Page"));
const PioneerShowcasePage = lazy(() => import("@/pages/PioneerShowcasePage"));
const StewardStampDashboard = lazy(() => import("@/pages/StewardStampDashboard"));
const AdminEscrowDashboard = lazy(() => import("@/pages/AdminEscrowDashboard"));
const CueCardCreator = lazy(() => import("@/pages/CueCardCreator"));
const CueCardCreatorDashboard = lazy(() => import("@/pages/CueCardCreatorDashboard"));
const XRayFeedbackAdmin = lazy(() => import("@/pages/XRayFeedbackAdmin"));
const LibrarianDashboardPage = lazy(() => import("@/pages/LibrarianDashboardPage"));
const CompilationDashboardPage = lazy(() => import("@/pages/CompilationDashboardPage"));
const WalletPage = lazy(() => import("@/pages/WalletPage"));
const ColdStartPage = lazy(() => import("@/pages/ColdStartPage"));
const ColdStartPathwayPage = lazy(() => import("@/pages/ColdStartPathwayPage"));
const BountyPhotographyV2Page = lazy(() => import("@/pages/BountyPhotographyV2Page"));
const TrunkMirrorReviewPage = lazy(() => import("@/pages/TrunkMirrorReviewPage"));
const DispatchHealthPage = lazy(() => import("@/pages/v2/ops/DispatchHealthPage"));
const HarperReviewDashboardPage = lazy(() => import("@/pages/v2/governance/HarperReviewDashboardPage"));
const ContentShieldAdminPage = lazy(() => import("@/pages/v2/ops/ContentShieldAdminPage"));
const LetterDispatchPage = lazy(() => import("@/pages/v2/ops/LetterDispatchPage"));
const VehicleWheelsV2Page = lazy(() => import("@/pages/v2/vehicle/WheelsV2Page"));
const RideshareRoutesV2 = lazy(() => import("@/pages/v2/vehicle/RideshareRoutesV2"));
const RouteDetailPage = lazy(() => import("@/pages/v2/vehicle/RouteDetailPage"));
const LemonLotV2 = lazy(() => import("@/pages/v2/vehicle/LemonLotV2"));
const VehicleListingDetail = lazy(() => import("@/pages/v2/vehicle/VehicleListingDetail"));

export const dashboardRoutes = (
  <>
    <Route path="/dashboard" element={<ProtectedRoute><LazyPage><CreatorDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/legacy" element={<ProtectedRoute><LazyPage><Dashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/provider" element={<ProtectedRoute><LazyPage><ProviderDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/runner" element={<ProtectedRoute><LazyPage><RunnerDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/onboarder" element={<ProtectedRoute><LazyPage><OnboarderDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/lb-card" element={<ProtectedRoute><LazyPage><LBCardV2Page /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/lb-card" element={<Navigate to="/lb-card" replace />} />
    <Route path="/content-shield" element={<ProtectedRoute><LazyPage><ContentShieldV2Page /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/fund-card" element={<ProtectedRoute><LazyPage><FundMyCard /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/war-chest" element={<ProtectedRoute><LazyPage><WarChestPage /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/payouts" element={<ProtectedRoute><LazyPage><PayoutsPage /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/payments" element={<ProtectedRoute><LazyPage><PayoutsPage /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/helm" element={<ProtectedRoute><LazyPage><HelmActionsPage /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/oob" element={<ProtectedRoute><LazyPage><OutOfBoundsPage /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/bridges" element={<ProtectedRoute><LazyPage><ConnectedServicesPage /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/gatekeeper" element={<ProtectedRoute><LazyPage><GatekeeperInboxPage /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/membership" element={<ProtectedRoute><LazyPage><MembershipDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/earnings" element={<ProtectedRoute><LazyPage><EarningsDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/bounty-arena" element={<ProtectedRoute><LazyPage><XRayBountyDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/piggyback-review" element={<ProtectedRoute><LazyPage><PiggybackReviewPage /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/my-improvements" element={<ProtectedRoute><LazyPage><MyPiggybackPage /></LazyPage></ProtectedRoute>} />
    <Route path="/portfolio" element={<ProtectedRoute><LazyPage><Portfolio /></LazyPage></ProtectedRoute>} />
    <Route path="/profile-settings" element={<ProtectedRoute><LazyPage><ProfileSettings /></LazyPage></ProtectedRoute>} />
    <Route path="/content-controls" element={<ProtectedRoute><LazyPage><ContentControlsPage /></LazyPage></ProtectedRoute>} />
    <Route path="/settings/social-accounts" element={<ProtectedRoute><LazyPage><SocialAccountsPage /></LazyPage></ProtectedRoute>} />
    <Route path="/blockchain/:projectId" element={<ProtectedRoute><LazyPage><BlockchainExplorer /></LazyPage></ProtectedRoute>} />
    <Route path="/blockchain/overview" element={<ProtectedRoute><LazyPage><BlockchainExplorer /></LazyPage></ProtectedRoute>} />
    <Route path="/medallions" element={<ProtectedRoute><LazyPage><MedallionViewer /></LazyPage></ProtectedRoute>} />
    <Route path="/withdraw" element={<PaidMemberRoute><LazyPage><Withdraw /></LazyPage></PaidMemberRoute>} />
    <Route path="/membership" element={<LazyPage><MembershipPage /></LazyPage>} />
    <Route path="/membership-success" element={<ProtectedRoute><LazyPage><MembershipSuccess /></LazyPage></ProtectedRoute>} />
    <Route path="/membership/confirm" element={<LazyPage><MembershipConfirm /></LazyPage>} />
    <Route path="/calendar" element={<ProtectedRoute><LazyPage><CalendarPage /></LazyPage></ProtectedRoute>} />
    <Route path="/adapt" element={<ProtectedRoute><LazyPage><AdaptScoreV2Page /></LazyPage></ProtectedRoute>} />
    <Route path="/adapt-score" element={<LazyPage><AdaptScore /></LazyPage>} />
    <Route path="/adapt-score/legacy" element={<LazyPage><AdaptScore /></LazyPage>} />
    <Route path="/c20" element={<ProtectedRoute><LazyPage><C20PilotDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/c20-pilot" element={<ProtectedRoute><LazyPage><C20PilotDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/toe-dipping" element={<ProtectedRoute><LazyPage><C20PilotDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/c20/leaderboard" element={<LazyPage><C20Leaderboard /></LazyPage>} />
    <Route path="/reciprocity-leaderboard" element={<LazyPage><C20Leaderboard /></LazyPage>} />
    <Route path="/xp-leaderboard" element={<LazyPage><XPLeaderboard /></LazyPage>} />
    <Route path="/c-plus-20" element={<LazyPage><CPlus20Dashboard /></LazyPage>} />
    <Route path="/eoi-vesting" element={<ProtectedRoute><LazyPage><Portfolio /></LazyPage></ProtectedRoute>} />
    <Route path="/moneypenny" element={<ProtectedRoute><LazyPage><MoneyPenny /></LazyPage></ProtectedRoute>} />
    <Route path="/moneypenny/briefing" element={<ProtectedRoute><LazyPage><MoneypennyBriefing /></LazyPage></ProtectedRoute>} />
    <Route path="/moneypenny/spotlight" element={<ProtectedRoute><LazyPage><SpotlightManager /></LazyPage></ProtectedRoute>} />
    <Route path="/moneypenny/social" element={<ProtectedRoute><LazyPage><MoneyPennySocial /></LazyPage></ProtectedRoute>} />
    <Route path="/moneypenny/qa" element={<ProtectedRoute><LazyPage><MoneyPennyQA /></LazyPage></ProtectedRoute>} />
    <Route path="/briefcase" element={<ProtectedRoute><LazyPage><Briefcase /></LazyPage></ProtectedRoute>} />
    <Route path="/member-resources" element={<ProtectedRoute><LazyPage><MemberResources /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/dispatch" element={<ProtectedRoute><LazyPage><DispatchComposePage /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/dispatch/queue" element={<ProtectedRoute><LazyPage><DispatchQueuePage /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/dispatch/influencer-signup" element={<ProtectedRoute><LazyPage><InfluencerSignupPage /></LazyPage></ProtectedRoute>} />
    <Route path="/backer-election" element={<ProtectedRoute><LazyPage><BackerElectionV2Page /></LazyPage></ProtectedRoute>} />
    <Route path="/backer-election/legacy" element={<ProtectedRoute><LazyPage><BackerElectionPage /></LazyPage></ProtectedRoute>} />
    <Route path="/design-democracy" element={<ProtectedRoute><LazyPage><DesignDemocracyV2Page /></LazyPage></ProtectedRoute>} />
    <Route path="/design-democracy/legacy" element={<Navigate to="/arena" replace />} />
    <Route path="/wheels" element={<ProtectedRoute><LazyPage><WheelsV2Page /></LazyPage></ProtectedRoute>} />
    <Route path="/wheels/legacy" element={<Navigate to="/local-wheels" replace />} />
    <Route path="/housing" element={<ProtectedRoute><LazyPage><HousingHubV2Page /></LazyPage></ProtectedRoute>} />
    <Route path="/housing/legacy" element={<LazyPage><HousingPage /></LazyPage>} />
    <Route path="/pioneers" element={<ProtectedRoute><LazyPage><PioneerShowcaseV2Page /></LazyPage></ProtectedRoute>} />
    <Route path="/pioneers/legacy" element={<ProtectedRoute><LazyPage><PioneerShowcasePage /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/steward/stamps" element={<ProtectedRoute><LazyPage><StewardStampDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/admin/escrow" element={<ProtectedRoute><LazyPage><AdminEscrowDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/universal-remote" element={<Navigate to="/dashboard/dispatch" replace />} />
    <Route path="/dashboard/cue-cards" element={<ProtectedRoute><LazyPage><CueCardCreatorDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/cue-cards/create" element={<ProtectedRoute><LazyPage><CueCardCreator /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/xray-feedback" element={<ProtectedRoute><LazyPage><XRayFeedbackAdmin /></LazyPage></ProtectedRoute>} />
    <Route path="/admin/librarian" element={<ProtectedRoute><LazyPage><LibrarianDashboardPage /></LazyPage></ProtectedRoute>} />
    <Route path="/admin/compilation" element={<ProtectedRoute><LazyPage><CompilationDashboardPage /></LazyPage></ProtectedRoute>} />
    <Route path="/wallet" element={<ProtectedRoute><LazyPage><WalletPage /></LazyPage></ProtectedRoute>} />
    <Route path="/bounty-photography" element={<ProtectedRoute><LazyPage><BountyPhotographyV2Page /></LazyPage></ProtectedRoute>} />
    <Route path="/cold-start" element={<ProtectedRoute><LazyPage><ColdStartPage /></LazyPage></ProtectedRoute>} />
    <Route path="/cold-start/:pathway" element={<ProtectedRoute><LazyPage><ColdStartPathwayPage /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/trunk-mirror-review" element={<ProtectedRoute><LazyPage><TrunkMirrorReviewPage /></LazyPage></ProtectedRoute>} />
    <Route path="/v2/ops/dispatch-health" element={<ProtectedRoute><LazyPage><DispatchHealthPage /></LazyPage></ProtectedRoute>} />
    <Route path="/v2/governance/harper-review" element={<ProtectedRoute><LazyPage><HarperReviewDashboardPage /></LazyPage></ProtectedRoute>} />
    <Route path="/v2/ops/content-shield" element={<ProtectedRoute><LazyPage><ContentShieldAdminPage /></LazyPage></ProtectedRoute>} />
    <Route path="/v2/ops/letter-dispatch" element={<ProtectedRoute><LazyPage><LetterDispatchPage /></LazyPage></ProtectedRoute>} />
    <Route path="/v2/wheels" element={<ProtectedRoute><LazyPage><VehicleWheelsV2Page /></LazyPage></ProtectedRoute>} />
    <Route path="/v2/rideshare" element={<ProtectedRoute><LazyPage><RideshareRoutesV2 /></LazyPage></ProtectedRoute>} />
    <Route path="/v2/rideshare/:routeId" element={<ProtectedRoute><LazyPage><RouteDetailPage /></LazyPage></ProtectedRoute>} />
    <Route path="/v2/lemon-lot" element={<ProtectedRoute><LazyPage><LemonLotV2 /></LazyPage></ProtectedRoute>} />
    <Route path="/v2/lemon-lot/:listingId" element={<ProtectedRoute><LazyPage><VehicleListingDetail /></LazyPage></ProtectedRoute>} />
  </>
);
