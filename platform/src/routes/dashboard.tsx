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
const LBCardPage = lazy(() => import("@/pages/LBCardPage"));
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
const CalendarPage = lazy(() => import("@/pages/Calendar"));
const AdaptScore = lazy(() => import("@/pages/AdaptScore"));
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

export const dashboardRoutes = (
  <>
    <Route path="/dashboard" element={<ProtectedRoute><LazyPage><CreatorDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/legacy" element={<ProtectedRoute><LazyPage><Dashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/provider" element={<ProtectedRoute><LazyPage><ProviderDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/runner" element={<ProtectedRoute><LazyPage><RunnerDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/onboarder" element={<ProtectedRoute><LazyPage><OnboarderDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/dashboard/lb-card" element={<ProtectedRoute><LazyPage><LBCardPage /></LazyPage></ProtectedRoute>} />
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
    <Route path="/adapt-score" element={<LazyPage><AdaptScore /></LazyPage>} />
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
  </>
);
