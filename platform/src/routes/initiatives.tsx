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
const FamilyTableHub = lazy(() => import("@/pages/FamilyTableHub"));
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
    <Route path="/initiatives/family-table" element={<ExplorerRoute><LazyPage><FamilyTablePage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/family-table/sessions" element={<ExplorerRoute><LazyPage><GroupCookPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/family-table/host-session" element={<Navigate to="/initiatives/family-table/sessions" replace />} />
    <Route path="/initiatives/family-table/start-pod" element={<Navigate to="/initiatives/family-table" replace />} />
    <Route path="/family-table" element={<ExplorerRoute><LazyPage><FamilyTableHub /></LazyPage></ExplorerRoute>} />
    <Route path="/family-table/meal-plan" element={<ProtectedRoute><LazyPage><MealPlanBuilder /></LazyPage></ProtectedRoute>} />
    <Route path="/cookbook" element={<ExplorerRoute><LazyPage><CookbookPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cookbook/:restaurantId" element={<ExplorerRoute><LazyPage><RestaurantDetailPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/rally-group" element={<ExplorerRoute><LazyPage><RallyGroupPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/jukebox" element={<ExplorerRoute><LazyPage><JukeboxInitiative /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/harper-guild" element={<ExplorerRoute><LazyPage><HarperGuildPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/vsl" element={<ExplorerRoute><LazyPage><VSLPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/bread" element={<ExplorerRoute><LazyPage><LetsMakeBreadPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/didasko" element={<ExplorerRoute><LazyPage><DidaskoPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/power-to-the-people" element={<ExplorerRoute><LazyPage><PowerToThePeoplePage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/brass-tacks" element={<ExplorerRoute><LazyPage><BrassTacksPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/lets-go-shopping" element={<ExplorerRoute><LazyPage><LetsGoShoppingPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/lets-get-groceries" element={<ExplorerRoute><LazyPage><LetsGetGroceriesPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/lets-get-groceries/box" element={<ExplorerRoute><LazyPage><GroceryBoxPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/lets-get-groceries/start-node" element={<ExplorerRoute><LazyPage><GroceryNodeRegistration /></LazyPage></ExplorerRoute>} />
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
  </>
);
