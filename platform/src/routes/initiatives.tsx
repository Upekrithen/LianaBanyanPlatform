import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import { ProtectedRoute, ExplorerRoute } from "@/components/ProtectedRoute";
import { LazyPage } from "./LazyPage";

const InitiativeProjectsPage = lazy(() => import("@/pages/InitiativeProjectsPage"));
const InitiativePage = lazy(() => import("@/pages/InitiativePage"));
const LetsMakeDinnerPage = lazy(() => import("@/pages/LetsMakeDinnerPage"));
const LetsMakeDinnerLanding = lazy(() => import("@/pages/LetsMakeDinnerLanding"));
const LMDReviewerDashboard = lazy(() => import("@/pages/LMDReviewerDashboard"));
const LMDReviewSubmitPage = lazy(() => import("@/pages/LMDReviewSubmitPage"));
const ChefMarketplacePage = lazy(() => import("@/pages/ChefMarketplacePage"));
const ServiceNodeRegistration = lazy(() => import("@/pages/ServiceNodeRegistration"));
const PantryPage = lazy(() => import("@/pages/PantryPage"));
const FamilyTablePage = lazy(() => import("@/pages/FamilyTablePage"));
const GroupCookPage = lazy(() => import("@/pages/GroupCookPage"));
const FamilyTableHubV2Page = lazy(() => import("@/pages/FamilyTableHubV2Page"));
const CookbookPage = lazy(() => import("@/pages/CookbookPage"));
const RestaurantDetailPage = lazy(() => import("@/pages/RestaurantDetailPage"));
const MealPlanBuilder = lazy(() => import("@/pages/MealPlanBuilder"));
const RallyGroupPage = lazy(() => import("@/pages/RallyGroupPage"));
const JukeboxInitiative = lazy(() => import("@/pages/JukeboxInitiative"));
const HarperGuildPage = lazy(() => import("@/pages/HarperGuildPage"));
const VSLPage = lazy(() => import("@/pages/VSLPage"));
const LetsMakeBreadPage = lazy(() => import("@/pages/LetsMakeBreadPage"));
const DidaskoPage = lazy(() => import("@/pages/DidaskoPage"));
const PowerToThePeoplePage = lazy(() => import("@/pages/PowerToThePeoplePage"));
const BrassTacksPage = lazy(() => import("@/pages/BrassTacksPage"));
const LetsGoShoppingPage = lazy(() => import("@/pages/LetsGoShoppingPage"));
const LetsGetGroceriesPage = lazy(() => import("@/pages/LetsGetGroceriesPage"));
const GroceryBoxPage = lazy(() => import("@/pages/GroceryBoxPage"));
const GroceryNodeRegistration = lazy(() => import("@/pages/GroceryNodeRegistration"));
const ProprietaryRecipesPage = lazy(() => import("@/pages/ProprietaryRecipesPage"));
const TasteTesterDashboard = lazy(() => import("@/pages/TasteTesterDashboard"));
const CottageLawPage = lazy(() => import("@/pages/CottageLawPage"));
const DocumentationMarketplacePage = lazy(() => import("@/pages/DocumentationMarketplacePage"));
const LemonLot = lazy(() => import("@/pages/LemonLot"));
const LocalWheels = lazy(() => import("@/pages/LocalWheels"));
const RideshareRoutesPage = lazy(() => import("@/pages/RideshareRoutes"));
const FarmerSupplyChainPage = lazy(() => import("@/pages/FarmerSupplyChainPage"));
const ClassroomPage = lazy(() => import("@/pages/ClassroomPage"));
const TeacherSetupPage = lazy(() => import("@/pages/TeacherSetupPage"));
const PioneerShowcasePage = lazy(() => import("@/pages/PioneerShowcasePage"));
const PioneerProfilePage = lazy(() => import("@/pages/PioneerProfilePage"));
const FreezerNodesPage = lazy(() => import("@/pages/FreezerNodesPage"));
const FreezerNodeSetup = lazy(() => import("@/pages/FreezerNodeSetup"));
const BanyanGalleriesPage = lazy(() => import("@/pages/BanyanGalleriesPage"));
const HearthInitiativePage = lazy(() => import("@/pages/HearthInitiativePage"));
const SpinoutsIndexPage = lazy(() => import("@/pages/SpinoutsIndexPage"));
const SpinoutPage = lazy(() => import("@/pages/SpinoutPage"));
const DefenseKlausSpinoutPage = lazy(() => import("@/pages/DefenseKlausSpinoutPage"));
const BatteryDispatchSpinoutPage = lazy(() => import("@/pages/BatteryDispatchSpinoutPage"));
const StandInTheGapSpinoutPage = lazy(() => import("@/pages/StandInTheGapSpinoutPage"));
const MnemosyneCSpinoutPage = lazy(() => import("@/pages/MnemosyneCSpinoutPage"));
const HarperGuildSpinoutPage = lazy(() => import("@/pages/HarperGuildSpinoutPage"));
// Wave 22 Phase B -- Anchor, CAI Bonfire, Map & Compass deep-builds
const AnchorSpinoutPage = lazy(() => import("@/pages/AnchorSpinoutPage"));
const CaiBonfirePage = lazy(() => import("@/pages/CaiBonfirePage"));
const MapAndCompassPage = lazy(() => import("@/pages/MapAndCompassPage"));
const StewardsGuildPage = lazy(() => import("@/pages/StewardsGuildPage"));
const HealthAccordsPage = lazy(() => import("@/pages/HealthAccordsPage"));
const HouseholdConciergePage = lazy(() => import("@/pages/HouseholdConciergePage"));

export const initiativeRoutes = (
  <>
    <Route path="/initiatives" element={<ExplorerRoute><LazyPage><InitiativeProjectsPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/:slug" element={<ExplorerRoute><LazyPage><InitiativePage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/lets-make-dinner" element={<ExplorerRoute><LazyPage><LetsMakeDinnerPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/lets-make-dinner/about" element={<ExplorerRoute><LazyPage><LetsMakeDinnerLanding /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/lets-make-dinner/reviews" element={<ProtectedRoute><LazyPage><LMDReviewerDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/initiatives/lets-make-dinner/review/:mealId" element={<ProtectedRoute><LazyPage><LMDReviewSubmitPage /></LazyPage></ProtectedRoute>} />
    <Route path="/initiatives/lets-make-dinner/start-node" element={<ExplorerRoute><LazyPage><ServiceNodeRegistration /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/lets-make-dinner/chefs" element={<ExplorerRoute><LazyPage><ChefMarketplacePage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/lets-make-dinner/become-chef" element={<Navigate to="/initiatives/lets-make-dinner/chefs" replace />} />
    <Route path="/initiatives/lets-make-dinner/register-business" element={<Navigate to="/initiatives/lets-make-dinner/start-node" replace />} />
    <Route path="/initiatives/lets-make-dinner/register-kitchen" element={<Navigate to="/initiatives/lets-make-dinner/start-node" replace />} />
    <Route path="/service-node/register" element={<ExplorerRoute><LazyPage><ServiceNodeRegistration /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/the-pantry" element={<ExplorerRoute><LazyPage><PantryPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/the-family-table" element={<Navigate to="/initiatives/family-table" replace />} />
    <Route path="/initiatives/family-table" element={<ExplorerRoute><LazyPage><FamilyTablePage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/family-table/sessions" element={<ExplorerRoute><LazyPage><GroupCookPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/family-table/host-session" element={<Navigate to="/initiatives/family-table/sessions" replace />} />
    <Route path="/initiatives/family-table/start-pod" element={<Navigate to="/initiatives/family-table" replace />} />
    <Route path="/family-table" element={<ProtectedRoute><LazyPage><FamilyTableHubV2Page /></LazyPage></ProtectedRoute>} />
    <Route path="/family-table/meal-plan" element={<ProtectedRoute><LazyPage><MealPlanBuilder /></LazyPage></ProtectedRoute>} />
    <Route path="/cookbook" element={<ExplorerRoute><LazyPage><CookbookPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cookbook/:restaurantId" element={<ExplorerRoute><LazyPage><RestaurantDetailPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/rally-group" element={<ExplorerRoute><LazyPage><RallyGroupPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/jukebox" element={<ExplorerRoute><LazyPage><JukeboxInitiative /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/harper-guild" element={<ExplorerRoute><LazyPage><HarperGuildPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/vsl" element={<ExplorerRoute><LazyPage><VSLPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/lets-make-bread" element={<ExplorerRoute><LazyPage><LetsMakeBreadPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/bread" element={<Navigate to="/initiatives/lets-make-bread" replace />} />
    <Route path="/initiatives/didasko" element={<ExplorerRoute><LazyPage><DidaskoPage /></LazyPage></ExplorerRoute>} />
    <Route path="/classroom" element={<ExplorerRoute><LazyPage><ClassroomPage /></LazyPage></ExplorerRoute>} />
    <Route path="/classroom/setup" element={<ProtectedRoute><LazyPage><TeacherSetupPage /></LazyPage></ProtectedRoute>} />
    <Route path="/pioneers/legacy" element={<ExplorerRoute><LazyPage><PioneerShowcasePage /></LazyPage></ExplorerRoute>} />
    <Route path="/pioneers/:role/:number" element={<ExplorerRoute><LazyPage><PioneerProfilePage /></LazyPage></ExplorerRoute>} />
    <Route path="/freezer-nodes" element={<ExplorerRoute><LazyPage><FreezerNodesPage /></LazyPage></ExplorerRoute>} />
    <Route path="/freezer-nodes/setup" element={<ProtectedRoute><LazyPage><FreezerNodeSetup /></LazyPage></ProtectedRoute>} />
    <Route path="/initiatives/power-to-the-people" element={<ExplorerRoute><LazyPage><PowerToThePeoplePage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/brass-tacks" element={<ExplorerRoute><LazyPage><BrassTacksPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/lets-go-shopping" element={<ExplorerRoute><LazyPage><LetsGoShoppingPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/household-concierge" element={<ExplorerRoute><LazyPage><HouseholdConciergePage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/lets-get-groceries" element={<ExplorerRoute><LazyPage><LetsGetGroceriesPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/lets-get-groceries/box" element={<ExplorerRoute><LazyPage><GroceryBoxPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/lets-get-groceries/start-node" element={<ExplorerRoute><LazyPage><GroceryNodeRegistration /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/recipe-vault" element={<Navigate to="/initiatives/proprietary-recipes" replace />} />
    <Route path="/initiatives/proprietary-recipes" element={<ExplorerRoute><LazyPage><ProprietaryRecipesPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/taste-tester" element={<ExplorerRoute><LazyPage><TasteTesterDashboard /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/cottage-law" element={<ExplorerRoute><LazyPage><CottageLawPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/documentation" element={<ExplorerRoute><LazyPage><DocumentationMarketplacePage /></LazyPage></ExplorerRoute>} />
    <Route path="/lemon-lot" element={<ExplorerRoute><LazyPage><LemonLot /></LazyPage></ExplorerRoute>} />
    <Route path="/local-wheels" element={<ExplorerRoute><LazyPage><LocalWheels /></LazyPage></ExplorerRoute>} />
    <Route path="/rideshare-routes" element={<ExplorerRoute><LazyPage><RideshareRoutesPage /></LazyPage></ExplorerRoute>} />
    <Route path="/farmer-supply-chain" element={<ExplorerRoute><LazyPage><FarmerSupplyChainPage /></LazyPage></ExplorerRoute>} />
    <Route path="/meal-kits" element={<ExplorerRoute><LazyPage><FarmerSupplyChainPage /></LazyPage></ExplorerRoute>} />
    <Route path="/freeze-dried" element={<ExplorerRoute><LazyPage><FarmerSupplyChainPage /></LazyPage></ExplorerRoute>} />
    <Route path="/banyan-galleries" element={<ExplorerRoute><LazyPage><BanyanGalleriesPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/hearth" element={<ExplorerRoute><LazyPage><HearthInitiativePage /></LazyPage></ExplorerRoute>} />
    {/* Wave 6 Phase T — 7 Spinouts index + generic */}
    <Route path="/spinouts" element={<ExplorerRoute><LazyPage><SpinoutsIndexPage /></LazyPage></ExplorerRoute>} />
    {/* Wave 21 Phase beta — Defense Klaus + Battery Dispatch deep-builds (must come before :slug) */}
    <Route path="/spinouts/defense-klaus" element={<ExplorerRoute><LazyPage><DefenseKlausSpinoutPage /></LazyPage></ExplorerRoute>} />
    <Route path="/spinouts/battery-dispatch" element={<ExplorerRoute><LazyPage><BatteryDispatchSpinoutPage /></LazyPage></ExplorerRoute>} />
    {/* Wave 23 Phase beta — Stand in the Gap, MnemosyneC, Harper Guild deep-builds */}
    <Route path="/spinouts/stand-in-the-gap" element={<ExplorerRoute><LazyPage><StandInTheGapSpinoutPage /></LazyPage></ExplorerRoute>} />
    <Route path="/spinouts/mnemosyne-c" element={<ExplorerRoute><LazyPage><MnemosyneCSpinoutPage /></LazyPage></ExplorerRoute>} />
    <Route path="/spinouts/mnemosynec-spinout" element={<ExplorerRoute><LazyPage><MnemosyneCSpinoutPage /></LazyPage></ExplorerRoute>} />
    <Route path="/spinouts/harper-guild" element={<ExplorerRoute><LazyPage><HarperGuildSpinoutPage /></LazyPage></ExplorerRoute>} />
    {/* Wave 22 Phase B — Anchor, CAI Bonfire, Map & Compass deep-builds (before generic :slug) */}
    <Route path="/spinouts/anchor" element={<ExplorerRoute><LazyPage><AnchorSpinoutPage /></LazyPage></ExplorerRoute>} />
    <Route path="/spinouts/anchor-spinout" element={<Navigate to="/spinouts/anchor" replace />} />
    <Route path="/spinouts/cai-bonfire" element={<ExplorerRoute><LazyPage><CaiBonfirePage /></LazyPage></ExplorerRoute>} />
    <Route path="/spinouts/cai-bonfire-spinout" element={<Navigate to="/spinouts/cai-bonfire" replace />} />
    <Route path="/spinouts/map-and-compass" element={<ExplorerRoute><LazyPage><MapAndCompassPage /></LazyPage></ExplorerRoute>} />
    {/* Generic spinout fallback */}
    <Route path="/spinouts/:slug" element={<ExplorerRoute><LazyPage><SpinoutPage /></LazyPage></ExplorerRoute>} />
    {/* Wave 6 Phase V — Stewards Guild */}
    <Route path="/stewards-guild" element={<ExplorerRoute><LazyPage><StewardsGuildPage /></LazyPage></ExplorerRoute>} />
    {/* Wave 15 — Health Accords */}
    <Route path="/initiatives/health-accords" element={<ExplorerRoute><LazyPage><HealthAccordsPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/tatiana-schlossburg-health-accords" element={<Navigate to="/initiatives/health-accords" replace />} />
    <Route path="/initiatives/tatiana-health" element={<Navigate to="/initiatives/health-accords" replace />} />
  </>
);
