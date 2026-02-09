# Portal Component Mapping

Last updated: 2025-10-14
Auto-generated documentation of component → portal assignments

## Marketplace Portal (.com / :5173)
**Purpose**: Public discovery, investment, product browsing

### Pages
- `/` → Index.tsx (landing/hero)
- `/marketplace` → Marketplace.tsx (product carousels)
- `/projects` → Projects.tsx (project listings)
- `/project/:slug` → ProjectView.tsx
- `/product/:id` → ProductDetail.tsx
- `/portfolio` → Portfolio.tsx
- `/blockchain/:id` → BlockchainExplorer.tsx
- `/medallions` → MedallionViewer.tsx
- `/investment-guide` → InvestmentExplainer.tsx

### Components (Marketplace-specific)
- CircularCategories
- ConversionFlowDiagram
- InvestmentTimeline
- ROICalculator
- VotingDialog
- VotingConfigManager
- ProjectVisualThemeManager
- MedallionBadge
- MedallionUserCard
- BlockchainVerificationBadge
- RealTimeProductStats
- RealTimeUserStats

## Business Portal (.biz / :5174)
**Purpose**: HR, position management, project admin, member services

### Pages
- `/` → Dashboard.tsx (member view)
- `/positions` → ContractPositions.tsx (browse open positions)
- `/manage-positions` → ManagePositions.tsx (HR/Steward manage)
- `/admin-project/:id` → AdminProject.tsx (project owner control)
- `/create-project` → CreateProject.tsx
- `/task-list` → TaskList.tsx
- `/task-log` → TaskLog.tsx
- `/subdomain-manager` → SubdomainManager.tsx
- `/client-api-manager` → ClientAPIManager.tsx
- `/credential-management` → CredentialManagement.tsx
- `/member-resources` → MemberResources.tsx
- `/browse` → BrowseBusiness.tsx (public catalog)

### Components (Business-specific)
- ApplicationReviewManager
- ApplicantDetailDialog
- PositionApplicationDialog
- PositionAssignmentDialog
- PositionDetailDialog
- PositionActivationManager
- ProcessDetailDialog
- ContractAssignmentSimulator
- ContractCompensationConfigManager
- AgentAuditLog
- ProjectTaskList

## Non-Profit Portal (.org / :5175)
**Purpose**: Fund administration, EOI vesting, loans, member benefits

### Pages
- `/` → Dashboard.tsx
- `/funding-pool` → Embedded LBFundingPoolDisplay
- `/eoi-vesting` → Embedded EOIVestingDashboard
- `/gas-tracking` → Embedded BlockchainGasDashboard
- `/member-benefits` → MemberResources.tsx

### Components (Non-Profit-specific)
- LBFundingPoolDisplay
- EOIVestingDashboard
- EOIDashboard
- EOIToggle
- BlockchainGasDashboard
- FailureQueueDashboard
- MilestoneNotifications

## Business Network Portal (.net / :5176)
**Purpose**: B2B production, contracts, supply chain, XML API

### Pages
- `/` → Dashboard.tsx
- `/industry-pricing` → IndustryPricing.tsx
- `/client-api-manager` → ClientAPIManager.tsx
- `/credential-management` → CredentialManagement.tsx
- `/xml-lockbox` → SampleDataXML.tsx
- `/subdomain-manager` → SubdomainManager.tsx
- `/production-schedules` → Placeholder
- `/b2b-contracts` → Placeholder
- `/supply-chain` → Placeholder
- `/manifests` → Placeholder

### Components (Network-specific)
- ProjectCostDashboard
- IndustryPricing components
- ResourceAllocation

## Shared Components (All Portals)
- AppSidebar (portal-aware navigation)
- DashboardPortalSwitcher
- PortalAccessCard
- SyncStatusIndicator
- PWAInstallPrompt
- GlobalRecorderOverlay
- SubdomainRouter
- ProtectedRoute
- WalletConnectButton
- Web3Provider
- ThemeSwitcher
- ImageUpload
- SingleImageUpload

## UI Components (shadcn - All Portals)
All components in `src/components/ui/*` are shared across portals.

## Contexts (Shared)
- AuthContext (unified auth across all portals)
- RecordingContext (dev tooling)

## Notes
- Dashboard.tsx is reused across all portals but shows different data/tabs based on portal
- Some pages like AdminProject exist in multiple portals but serve different use cases
- Cross-portal links use absolute URLs or HardReload to switch between portal apps
