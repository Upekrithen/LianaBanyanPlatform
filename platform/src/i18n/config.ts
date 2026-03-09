import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        projects: 'Projects',
        marketplace: 'Marketplace',
        about: 'About',
        contact: 'Contact',
        dashboard: 'Dashboard',
        profile: 'Profile',
        settings: 'Settings',
        logout: 'Logout',
        login: 'Login'
      },
      // Common
      common: {
        welcome: 'Welcome',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        update: 'Update',
        search: 'Search',
        filter: 'Filter',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        confirm: 'Confirm',
        close: 'Close'
      },
      // Projects
      projects: {
        title: 'Projects',
        create: 'Create Project',
        myProjects: 'My Projects',
        description: 'Description',
        status: 'Status',
        owner: 'Owner',
        createdAt: 'Created At'
      },
      // Marketplace
      marketplace: {
        title: 'Marketplace',
        browse: 'Browse Products',
        categories: 'Categories',
        featured: 'Featured',
        newArrivals: 'New Arrivals',
        addToCart: 'Add to Cart',
        buyNow: 'Buy Now'
      },
      // Theme & Language
      preferences: {
        title: 'Preferences',
        description: 'Customize your experience with theme and language settings.',
        theme: 'Theme',
        language: 'Language',
        changeTheme: 'Change Theme',
        changeLanguage: 'Change Language'
      },
      // Dashboard
      dashboard: {
        title: 'Dashboard',
        myDashboard: 'My Dashboard',
        portalAccess: 'Portal Access',
        membership: 'Membership',
        credits: 'My Credits',
        creditsAvailable: 'available',
        useCredits: 'Use your credits to vote on production levels',
        noCredits: 'Accept a project invitation to receive credits',
        guildProgression: 'Guild Progression',
        eoi: 'Expression of Interest',
        overview: 'Overview',
        marketplace: 'Marketplace',
        browseProjects: 'Browse new, trending, and funded projects',
        viewAllProjects: 'View all crowdfunding projects',
        myPortfolio: 'My Portfolio',
        trackInvestments: 'Track your contributions and votes',
        myMedallions: 'My Medallions',
        viewBadges: 'View your project badges and tokens',
        adminTools: 'Admin & Member Tools',
        roles: 'Roles',
        externalServices: 'External Services'
      },
      // Credits
      credits: {
        title: 'Credits',
        purchase: 'Purchase Credits',
        available: 'Available Credits',
        total: 'Total Credits',
        used: 'Used Credits',
        earned: 'Earned Credits',
        contribution: 'Contribution Credits',
        bonus: 'Bonus Credits',
        history: 'Credit History',
        purchasePackage: 'Purchase Package',
        selectAmount: 'Select Amount'
      },
      // Guild System
      guild: {
        title: 'Guild',
        progression: 'Guild Progression',
        currentTier: 'Current Tier',
        currentClass: 'Current Class',
        stakeRequired: 'Stake Required',
        apprentice: 'Apprentice',
        journeyman: 'Journeyman',
        master: 'Master',
        payStake: 'Pay Stake',
        unlockNext: 'Unlock Next Class',
        profitPercentage: 'Revenue Percentage',
        contracts: 'Contracts Completed',
        reputation: 'Reputation'
      },
      // Forms
      forms: {
        name: 'Name',
        description: 'Description',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        submit: 'Submit',
        required: 'Required',
        optional: 'Optional',
        pleaseWait: 'Please wait...',
        processing: 'Processing...'
      },
      // Create Project
      createProject: {
        title: 'Create New Project',
        projectName: 'Project Name',
        projectDescription: 'Project Description',
        detailedDescription: 'Detailed Description',
        category: 'Category',
        targetAmount: 'Target Amount',
        deadline: 'Deadline',
        submit: 'Create Project',
        cancel: 'Cancel',
        success: 'Project created successfully!',
        error: 'Failed to create project'
      },
      // Membership
      membership: {
        title: 'Membership',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive',
        expired: 'Expired',
        stake: 'Membership Stake',
        payStake: 'Pay Membership Stake',
        expiresOn: 'Expires on',
        renewMembership: 'Renew Membership'
      },
      // External Services
      externalServices: {
        title: 'External Services',
        description: 'Manage your external service platform accounts',
        addService: 'Add Service Link',
        platform: 'Platform',
        profileUrl: 'Profile URL',
        username: 'Username',
        rateRange: 'Rate Range',
        verified: 'Verified',
        pending: 'Pending',
        flagged: 'Flagged',
        remove: 'Remove',
        compliance: 'Compliance Warning',
        complianceMessage: 'If you hire another LB member through an external service, you must pay LB scale rates.'
      },
      // Messages & Notifications
      messages: {
        success: 'Success!',
        error: 'Error',
        warning: 'Warning',
        info: 'Information',
        confirmDelete: 'Are you sure you want to delete this?',
        confirmAction: 'Are you sure you want to proceed?',
        loadingData: 'Loading data...',
        noData: 'No data available',
        tryAgain: 'Please try again'
      },
      // Projects Page
      projectsPage: {
        title: 'Projects',
        back: 'Back',
        signOut: 'Sign Out',
        loading: 'Loading projects...',
        noProjects: 'No projects found',
        viewProject: 'View Project',
        createdAt: 'Created',
        fundingProgress: 'Funding Progress'
      },
      // Marketplace Page
      marketplacePage: {
        title: 'Marketplace',
        subtitle: 'Discover and back innovative projects',
        newProjects: 'New Projects',
        trendingProjects: 'Trending Projects',
        fundedProjects: 'Successfully Funded',
        last24h: 'Last 24 Hours',
        last72h: 'Last 72 Hours',
        lastWeek: 'Last Week',
        viewAll: 'View All',
        votes: 'votes',
        fundingGoal: 'Funding Goal',
        funded: 'Funded',
        backers: 'Backers'
      },
      // Create Project Page
      createProjectPage: {
        title: 'Create New Project',
        subtitle: 'Launch your crowdfunding campaign',
        back: 'Back to Dashboard',
        projectDetails: 'Project Details',
        projectName: 'Project Name',
        projectNamePlaceholder: 'Enter project name',
        tagline: 'Tagline',
        taglinePlaceholder: 'Short catchy description',
        description: 'Description',
        descriptionPlaceholder: 'Describe your project',
        detailedDescription: 'Detailed Description',
        detailedDescriptionPlaceholder: 'Full project details',
        products: 'Products',
        addProduct: 'Add Product',
        productName: 'Product Name',
        productDescription: 'Product Description',
        productDetails: 'Product Details',
        productSku: 'Product SKU',
        productImages: 'Product Images',
        uploadImages: 'Upload Images',
        productionLevels: 'Production Levels',
        addLevel: 'Add Production Level',
        levelName: 'Level Name',
        unitsCount: 'Units Count',
        unitPrice: 'Unit Price',
        votesNeeded: 'Votes Needed',
        remove: 'Remove',
        projectSections: 'Project Sections',
        addSection: 'Add Section',
        sectionTitle: 'Section Title',
        sectionDescription: 'Section Description',
        videoUrl: 'Video URL',
        sectionImages: 'Section Images',
        createProject: 'Create Project',
        creating: 'Creating...',
        cancel: 'Cancel',
        successMessage: 'Project created successfully!',
        errorMessage: 'Failed to create project'
      },
      // Guild Progression
      guildProgression: {
        title: 'Guild Progression',
        currentTier: 'Current Tier',
        currentClass: 'Current Class',
        profitShare: 'Revenue Percentage',
        experience: 'Experience',
        hours: 'hours',
        contracts: 'Contracts Completed',
        stakeRequired: 'Stake Required',
        stakePaid: 'Stake Paid',
        payStake: 'Pay Stake',
        unlockNext: 'Unlock Next Class',
        lockedTier: 'Locked Tier',
        apprentice: 'Apprentice',
        journeyman: 'Journeyman',
        master: 'Master',
        captain: 'Captain of Industry',
        processing: 'Processing...',
        paymentInNewTab: 'Complete payment in the new tab',
        progressToNext: 'Progress to Next Level'
      },
      // Membership Payment
      membershipPayment: {
        title: 'LB Membership',
        active: 'LB Membership Active',
        inactive: 'LB Membership Required',
        fullAccess: 'You have full access to all LianaBanyan portals',
        unlockAccess: 'Unlock access to',
        businessPortal: 'Business Portal - Position & HR management',
        networkPortal: 'Network Portal - B2B production & contracts',
        nonprofitPortal: 'Non-Profit Portal - Fund admin & member benefits',
        oneTimeFee: 'One-time fee',
        payNow: 'Pay Now',
        processing: 'Processing...'
      },
      // Contract Positions
      contractPositions: {
        title: 'Contract Positions',
        back: 'Back',
        selectCategory: 'Select Category',
        viewAllPositions: 'View All Positions',
        applyForPosition: 'Apply for Position',
        apply: 'Apply',
        viewDetails: 'View Details',
        simulateAssignment: 'Simulate Assignment',
        compensation: 'Compensation',
        equity: 'Participation',
        cash: 'Credits',
        creditsReserved: 'Credits Reserved',
        requiredStage: 'Required Stage',
        negotiatedRate: 'Negotiated Rate',
        noPositions: 'No positions available yet',
        loading: 'Loading positions...'
      },
      // Toast Messages
      toast: {
        paymentSuccess: 'Payment processed successfully',
        paymentError: 'Failed to process payment',
        applicationSubmitted: 'Application submitted',
        applicationError: 'Failed to submit application',
        dataLoaded: 'Data loaded',
        dataError: 'Failed to load data',
        saveSuccess: 'Changes saved',
        saveError: 'Failed to save',
        deleteSuccess: 'Deleted successfully',
        deleteError: 'Failed to delete',
        checkoutCreated: 'Redirecting to payment...',
        completePayment: 'Complete payment in the new tab',
        success: {
          saved: "Changes saved successfully",
          created: "Created successfully",
          updated: "Updated successfully",
          deleted: "Deleted successfully",
        },
        error: {
          generic: "Something went wrong",
          network: "Network error. Please try again.",
          unauthorized: "You don't have permission to do this",
          notFound: "Item not found",
        }
      },
      portfolio: {
        title: "My Projects",
        subtitle: "View and manage your contributions",
        tabs: {
          overview: "Overview",
          investments: "Contributions",
          returns: "Activity",
          history: "History"
        },
        stats: {
          totalInvested: "Total Contributed",
          currentValue: "Current Value",
          totalReturn: "Service Value",
          activeInvestments: "Active Projects"
        },
        table: {
          project: "Project",
          amount: "Amount",
          date: "Date",
          status: "Status",
          return: "Value"
        },
        empty: "No contributions yet",
        emptyDescription: "Start backing projects to see them here"
      },
      profileSettings: {
        title: "Profile Settings",
        subtitle: "Manage your account settings and preferences",
        sections: {
          general: "General",
          security: "Security",
          notifications: "Notifications",
          privacy: "Privacy"
        },
        general: {
          displayName: "Display Name",
          email: "Email",
          bio: "Bio",
          location: "Location",
          website: "Website",
          avatar: "Profile Picture"
        },
        security: {
          changePassword: "Change Password",
          currentPassword: "Current Password",
          newPassword: "New Password",
          confirmPassword: "Confirm Password",
          twoFactor: "Two-Factor Authentication",
          enable2FA: "Enable 2FA",
          disable2FA: "Disable 2FA"
        },
        notifications: {
          email: "Email Notifications",
          push: "Push Notifications",
          projectUpdates: "Project Updates",
          messages: "Messages",
          marketing: "Marketing Emails"
        },
        privacy: {
          profileVisibility: "Profile Visibility",
          showEmail: "Show Email",
          showActivity: "Show Activity",
          searchable: "Searchable Profile"
        }
      },
      clans: {
        title: "Clans",
        subtitle: "Collaborative groups for shared projects",
        createClan: "Create Clan",
        joinClan: "Join Clan",
        myClan: "My Clan",
        explore: "Explore Clans",
        members: "Members",
        projects: "Projects",
        charter: "Charter",
        agreements: "Agreements",
        stats: {
          totalMembers: "Total Members",
          activeProjects: "Active Projects",
          completedProjects: "Completed",
          reputation: "Reputation"
        },
        form: {
          name: "Clan Name",
          description: "Description",
          mission: "Mission Statement",
          values: "Core Values",
          rules: "Rules",
          requirements: "Membership Requirements"
        },
        empty: "No clans found",
        emptyDescription: "Create or join a clan to get started"
      },
      guilds: {
        title: "Guilds",
        subtitle: "Professional guilds for skilled members",
        myGuild: "My Guild",
        explore: "Explore Guilds",
        stake: "Stake",
        benefits: "Benefits",
        requirements: "Requirements",
        progression: {
          title: "Guild Progression",
          currentTier: "Current Tier",
          nextTier: "Next Tier",
          progress: "Progress",
          requirements: "Requirements to Advance"
        },
        tiers: {
          apprentice: "Apprentice",
          journeyman: "Journeyman",
          expert: "Expert",
          master: "Master"
        },
        stats: {
          members: "Members",
          avgReputation: "Avg Reputation",
          activeContracts: "Active Contracts",
          completionRate: "Completion Rate"
        },
        empty: "No guilds available",
        emptyDescription: "Guilds will be available soon"
      },
      reputation: {
        title: "Reputation Profile",
        subtitle: "Your trust score and achievements",
        score: "Reputation Score",
        rank: "Rank",
        achievements: "Achievements",
        stats: {
          projectsCompleted: "Projects Completed",
          onTimeDelivery: "On-Time Delivery",
          qualityRating: "Quality Rating",
          responseTime: "Response Time"
        },
        reviewsData: {
          given: "Reviews Given",
          received: "Reviews Received",
          positive: "Positive",
          neutral: "Neutral",
          negative: "Negative"
        },
        badgesList: {
          earlyAdopter: "Early Adopter",
          topContributor: "Top Contributor",
          reliablePartner: "Reliable Partner",
          qualityFocus: "Quality Focus"
        },
        empty: "No reputation data yet",
        emptyDescription: "Complete projects to build your reputation"
      },
      ipRegistration: {
        title: "IP Registration",
        subtitle: "Register and protect your intellectual property",
        register: "Register IP",
        myIP: "My IP Assets",
        tiers: "Protection Tiers",
        form: {
          title: "IP Asset Title",
          description: "Description",
          type: "Type",
          category: "Category",
          tier: "Protection Tier"
        },
        types: {
          patent: "Patent",
          trademark: "Trademark",
          copyright: "Copyright",
          trade_secret: "Trade Secret",
          design: "Design"
        },
        tierFeatures: {
          basic: {
            feature1: "Basic registration",
            feature2: "Public record",
            feature3: "Email support"
          },
          standard: {
            feature1: "Enhanced registration",
            feature2: "Private or public record",
            feature3: "Priority support",
            feature4: "Legal templates"
          },
          premium: {
            feature1: "Full legal protection",
            feature2: "Private record",
            feature3: "24/7 support",
            feature4: "Legal consultation",
            feature5: "Monitoring service"
          },
          enterprise: {
            feature1: "Maximum protection",
            feature2: "Dedicated account manager",
            feature3: "Custom legal services",
            feature4: "Global monitoring",
            feature5: "Priority dispute resolution"
          }
        },
        status: {
          pending: "Pending",
          approved: "Approved",
          rejected: "Rejected",
          active: "Active",
          expired: "Expired"
        },
        empty: "No IP assets registered",
        emptyDescription: "Register your first IP asset to get started"
      },
      auth: {
        title: "Welcome",
        signIn: "Sign In",
        signUp: "Sign Up",
        email: "Email",
        password: "Password",
        fullName: "Full Name",
        forgotPassword: "Forgot Password?",
        resetPassword: "Reset Password",
        sendResetLink: "Send Reset Link",
        backToLogin: "Back to Login",
        alreadyHaveAccount: "Already have an account?",
        dontHaveAccount: "Don't have an account?",
        enterEmail: "Enter your email",
        enterPassword: "Enter your password",
        enterFullName: "Enter your full name",
        signInButton: "Sign In",
        signUpButton: "Sign Up",
        signingIn: "Signing in...",
        signingUp: "Signing up...",
        validation: {
          invalidEmail: "Invalid email address",
          passwordTooShort: "Password must be at least 6 characters",
          enterFullName: "Please enter your full name"
        },
        success: {
          signIn: "Signed in successfully",
          signUp: "Account created! Check your email to verify.",
          resetSent: "Password reset link sent to your email"
        },
        error: {
          signIn: "Failed to sign in",
          signUp: "Failed to sign up",
          resetPassword: "Failed to send reset link"
        }
      },
      browseBusiness: {
        title: "Browse Positions",
        subtitle: "Find contract positions and employment opportunities",
        positionCategories: "Position Categories",
        technical: {
          title: "Technical Roles",
          description: "Development, engineering, and tech positions"
        },
        creative: {
          title: "Creative Positions",
          description: "Design, content, and creative services"
        },
        operations: {
          title: "Operations & Management",
          description: "HR, project management, operations"
        },
        trades: {
          title: "Skilled Trades",
          description: "Manufacturing, production, hands-on work"
        },
        growth: {
          title: "Growth & Marketing",
          description: "Sales, marketing, business development"
        },
        hr: {
          title: "Human Resources",
          description: "Talent acquisition and people operations"
        },
        openings: "openings",
        avgEquity: "Avg Participation",
        viewPositions: "View Positions"
      },
      browseMarketplace: {
        title: "Browse Marketplace",
        subtitle: "Discover products and sponsorship opportunities",
        sustainable: {
          title: "Sustainable Products",
          description: "Eco-friendly goods and services"
        },
        community: {
          title: "Community Projects",
          description: "Local initiatives and developments"
        },
        investment: {
          title: "Sponsorship Opportunities",
          description: "Back projects and join the cooperative"
        },
        featured: {
          title: "Featured Products",
          description: "Top-rated community offerings"
        },
        items: "items",
        trending: "Trending",
        explore: "Explore"
      },
      browseNetwork: {
        title: "Browse Network",
        subtitle: "Connect with production partners and service providers",
        manufacturing: {
          title: "Manufacturing Services",
          description: "Production capacity and capabilities"
        },
        supplyChain: {
          title: "Supply Chain Partners",
          description: "Logistics and fulfillment services"
        },
        scheduling: {
          title: "Production Scheduling",
          description: "Capacity planning and coordination"
        },
        api: {
          title: "XML Lockbox API",
          description: "Blockchain-verified data exchange"
        },
        pricing: {
          title: "Industry Pricing",
          description: "Real-time market pricing data"
        },
        integration: {
          title: "Network Integration",
          description: "Connect your systems to the network"
        },
        providers: "providers",
        viewServices: "View Services"
      },
      browseNonprofit: {
        title: "Member Benefits",
        subtitle: "Explore membership perks and community programs",
        tiers: {
          title: "Membership Tiers",
          description: "Medallion-based benefits and perks"
        },
        loans: {
          title: "Loan Programs",
          description: "Low-interest community loans"
        },
        eoi: {
          title: "EOI Vesting",
          description: "Expression of Interest conversion to membership"
        },
        rewards: {
          title: "Medallion Rewards",
          description: "Blockchain-verified membership tokens"
        },
        subsidies: {
          title: "Gas Subsidies",
          description: "Transaction costs covered by funding pool"
        },
        fundingPool: {
          title: "LB Funding Pool",
          description: "33% of medallion sales fund member benefits"
        },
        learnMore: "Learn More"
      },
      adminProject: {
        title: "Admin Project Management",
        subtitle: "Manage projects, funding, and team invitations",
        tabs: {
          overview: "Overview",
          funding: "Funding",
          invitations: "Invitations",
          tasks: "Tasks",
          themes: "Themes",
          blockchain: "Blockchain",
          resources: "Resources",
          voting: "Voting",
          compensation: "Compensation",
          applications: "Applications",
          positions: "Positions"
        },
        selectProject: "Select Project",
        noProjects: "No projects found",
        createFirst: "Create your first project",
        fundingPot: "Funding Pot",
        currentAmount: "Current Amount",
        addFunds: "Add Funds",
        amount: "Amount",
        inviteTeam: "Invite Team Member",
        credits: "Credits",
        sendInvite: "Send Invite",
        pending: "Pending",
        accepted: "Accepted",
        rejected: "Rejected",
        loading: "Loading...",
        success: "Success",
        error: "Error"
      },
      roleManagement: {
        title: "Role Management",
        subtitle: "Manage user roles and permissions",
        searchUser: "Search by email",
        selectUser: "Select User",
        selectRole: "Select Role",
        assignRole: "Assign Role",
        removeRole: "Remove Role",
        roles: {
          admin: "Admin",
          project_owner: "Project Owner",
          user: "User"
        },
        currentRoles: "Current Roles",
        noRoles: "No roles assigned",
        adminOnly: "Admin access required",
        loading: "Loading users..."
      },
      simulator: {
        title: "Project Simulator",
        subtitle: "Calculate scenarios and generate reports",
        scenarioName: "Scenario Name",
        saveScenario: "Save Scenario",
        loadScenario: "Load Scenario",
        projectName: "Project Name",
        productName: "Product Name",
        unitsCount: "Units Count",
        unitPrice: "Unit Price",
        volumeDiscount: "Volume Discount",
        equityPercentage: "Participation %",
        cashPercentage: "Credit %",
        votesNeeded: "Votes Needed",
        calculate: "Calculate",
        results: "Results",
        totalRevenue: "Total Revenue",
        discountedRevenue: "Discounted Revenue",
        equityValue: "Participation Value",
        cashValue: "Cash Value",
        pricePerUnit: "Price Per Unit",
        downloadReport: "Download Report",
        generateXML: "Generate XML"
      },
      managePositions: {
        title: "Manage Positions",
        subtitle: "Create and manage contract positions",
        createPosition: "Create Position",
        editPosition: "Edit Position",
        deletePosition: "Delete Position",
        positionTitle: "Position Title",
        category: "Category",
        stage: "Stage",
        description: "Description",
        requirements: "Requirements",
        compensation: "Compensation",
        equity: "Participation",
        cash: "Credits",
        credits: "Credits",
        duration: "Duration",
        active: "Active",
        inactive: "Inactive",
        applicants: "Applicants",
        viewApplications: "View Applications",
        noPositions: "No positions yet",
        createFirst: "Create your first position"
      },
      investmentExplainer: {
        title: "Sponsorship Guide",
        subtitle: "How pledges become cooperative membership and service credits",
        tabs: {
          overview: "Overview",
          conversion: "How It Works",
          calculator: "Service Calculator",
          scenarios: "Scenarios"
        },
        howItWorks: "How It Works",
        step1: {
          title: "Kickstarter Pledge",
          description: "Back a project on Kickstarter"
        },
        step2: {
          title: "EOI Conversion",
          description: "Pledge converts to Expression of Interest"
        },
        step3: {
          title: "Daily Vesting",
          description: "1% converts to membership participation daily"
        },
        step4: {
          title: "Full Membership",
          description: "Full cooperative membership after 100 days"
        },
        benefits: "Membership Benefits",
        earlyAccess: "Early access to products",
        equityGrowth: "Cooperative participation growth",
        communityVoting: "Community voting rights",
        exclusivePerks: "Exclusive member perks",
        calculateReturn: "Calculate Your Allocation",
        investmentAmount: "Pledge Amount",
        projectedGrowth: "Projected Growth",
        timeframe: "Timeframe",
        estimatedValue: "Estimated Value"
      }
    }
  },
  es: {
    translation: {
      // Navegación
      nav: {
        home: 'Inicio',
        projects: 'Proyectos',
        marketplace: 'Mercado',
        about: 'Acerca de',
        contact: 'Contacto',
        dashboard: 'Panel',
        profile: 'Perfil',
        settings: 'Configuración',
        logout: 'Cerrar sesión',
        login: 'Iniciar sesión'
      },
      // Común
      common: {
        welcome: 'Bienvenido',
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        create: 'Crear',
        update: 'Actualizar',
        search: 'Buscar',
        filter: 'Filtrar',
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        confirm: 'Confirmar',
        close: 'Cerrar'
      },
      // Proyectos
      projects: {
        title: 'Proyectos',
        create: 'Crear Proyecto',
        myProjects: 'Mis Proyectos',
        description: 'Descripción',
        status: 'Estado',
        owner: 'Propietario',
        createdAt: 'Creado el'
      },
      // Mercado
      marketplace: {
        title: 'Mercado',
        browse: 'Explorar Productos',
        categories: 'Categorías',
        featured: 'Destacados',
        newArrivals: 'Novedades',
        addToCart: 'Añadir al Carrito',
        buyNow: 'Comprar Ahora'
      },
      // Tema e Idioma
      preferences: {
        title: 'Preferencias',
        description: 'Personaliza tu experiencia con ajustes de tema e idioma.',
        theme: 'Tema',
        language: 'Idioma',
        changeTheme: 'Cambiar Tema',
        changeLanguage: 'Cambiar Idioma'
      },
      // Panel de Control
      dashboard: {
        title: 'Panel',
        myDashboard: 'Mi Panel',
        portalAccess: 'Acceso a Portales',
        membership: 'Membresía',
        credits: 'Mis Créditos',
        creditsAvailable: 'disponibles',
        useCredits: 'Usa tus créditos para votar en niveles de producción',
        noCredits: 'Acepta una invitación de proyecto para recibir créditos',
        guildProgression: 'Progresión del Gremio',
        eoi: 'Expresión de Interés',
        overview: 'Resumen',
        marketplace: 'Mercado',
        browseProjects: 'Explorar proyectos nuevos, tendencias y financiados',
        viewAllProjects: 'Ver todos los proyectos de crowdfunding',
        myPortfolio: 'Mi Portafolio',
        trackInvestments: 'Seguir tus contribuciones y votos',
        myMedallions: 'Mis Medallones',
        viewBadges: 'Ver tus insignias y tokens de proyecto',
        adminTools: 'Herramientas de Admin y Miembros',
        roles: 'Roles',
        externalServices: 'Servicios Externos'
      },
      // Créditos
      credits: {
        title: 'Créditos',
        purchase: 'Comprar Créditos',
        available: 'Créditos Disponibles',
        total: 'Créditos Totales',
        used: 'Créditos Usados',
        earned: 'Créditos Ganados',
        contribution: 'Créditos de Contribución',
        bonus: 'Créditos Bonus',
        history: 'Historial de Créditos',
        purchasePackage: 'Comprar Paquete',
        selectAmount: 'Seleccionar Cantidad'
      },
      // Sistema de Gremio
      guild: {
        title: 'Gremio',
        progression: 'Progresión del Gremio',
        currentTier: 'Nivel Actual',
        currentClass: 'Clase Actual',
        stakeRequired: 'Apuesta Requerida',
        apprentice: 'Aprendiz',
        journeyman: 'Oficial',
        master: 'Maestro',
        payStake: 'Pagar Apuesta',
        unlockNext: 'Desbloquear Siguiente Clase',
        profitPercentage: 'Porcentaje de Ingresos',
        contracts: 'Contratos Completados',
        reputation: 'Reputación'
      },
      // Formularios
      forms: {
        name: 'Nombre',
        description: 'Descripción',
        email: 'Correo',
        password: 'Contraseña',
        confirmPassword: 'Confirmar Contraseña',
        submit: 'Enviar',
        required: 'Requerido',
        optional: 'Opcional',
        pleaseWait: 'Por favor espera...',
        processing: 'Procesando...'
      },
      // Crear Proyecto
      createProject: {
        title: 'Crear Nuevo Proyecto',
        projectName: 'Nombre del Proyecto',
        projectDescription: 'Descripción del Proyecto',
        detailedDescription: 'Descripción Detallada',
        category: 'Categoría',
        targetAmount: 'Cantidad Objetivo',
        deadline: 'Fecha Límite',
        submit: 'Crear Proyecto',
        cancel: 'Cancelar',
        success: '¡Proyecto creado exitosamente!',
        error: 'Error al crear proyecto'
      },
      // Membresía
      membership: {
        title: 'Membresía',
        status: 'Estado',
        active: 'Activa',
        inactive: 'Inactiva',
        expired: 'Expirada',
        stake: 'Apuesta de Membresía',
        payStake: 'Pagar Apuesta de Membresía',
        expiresOn: 'Expira el',
        renewMembership: 'Renovar Membresía'
      },
      // Servicios Externos
      externalServices: {
        title: 'Servicios Externos',
        description: 'Administra tus cuentas de plataformas de servicios externos',
        addService: 'Agregar Enlace de Servicio',
        platform: 'Plataforma',
        profileUrl: 'URL del Perfil',
        username: 'Usuario',
        rateRange: 'Rango de Tarifa',
        verified: 'Verificado',
        pending: 'Pendiente',
        flagged: 'Marcado',
        remove: 'Eliminar',
        compliance: 'Advertencia de Cumplimiento',
        complianceMessage: 'Si contratas a otro miembro de LB a través de un servicio externo, debes pagar las tarifas de escala de LB.'
      },
      // Mensajes y Notificaciones
      messages: {
        success: '¡Éxito!',
        error: 'Error',
        warning: 'Advertencia',
        info: 'Información',
        confirmDelete: '¿Estás seguro de que quieres eliminar esto?',
        confirmAction: '¿Estás seguro de que quieres continuar?',
        loadingData: 'Cargando datos...',
        noData: 'No hay datos disponibles',
        tryAgain: 'Por favor intenta de nuevo'
      },
      // Página de Proyectos
      projectsPage: {
        title: 'Proyectos',
        back: 'Atrás',
        signOut: 'Cerrar Sesión',
        loading: 'Cargando proyectos...',
        noProjects: 'No se encontraron proyectos',
        viewProject: 'Ver Proyecto',
        createdAt: 'Creado',
        fundingProgress: 'Progreso de Financiamiento'
      },
      // Página de Mercado
      marketplacePage: {
        title: 'Mercado',
        subtitle: 'Descubre y apoya proyectos innovadores',
        newProjects: 'Nuevos Proyectos',
        trendingProjects: 'Proyectos en Tendencia',
        fundedProjects: 'Financiados Exitosamente',
        last24h: 'Últimas 24 Horas',
        last72h: 'Últimas 72 Horas',
        lastWeek: 'Última Semana',
        viewAll: 'Ver Todos',
        votes: 'votos',
        fundingGoal: 'Meta de Financiamiento',
        funded: 'Financiado',
        backers: 'Patrocinadores'
      },
      // Página de Crear Proyecto
      createProjectPage: {
        title: 'Crear Nuevo Proyecto',
        subtitle: 'Lanza tu campaña de crowdfunding',
        back: 'Volver al Panel',
        projectDetails: 'Detalles del Proyecto',
        projectName: 'Nombre del Proyecto',
        projectNamePlaceholder: 'Ingresa el nombre del proyecto',
        tagline: 'Eslogan',
        taglinePlaceholder: 'Descripción breve y atractiva',
        description: 'Descripción',
        descriptionPlaceholder: 'Describe tu proyecto',
        detailedDescription: 'Descripción Detallada',
        detailedDescriptionPlaceholder: 'Detalles completos del proyecto',
        products: 'Productos',
        addProduct: 'Agregar Producto',
        productName: 'Nombre del Producto',
        productDescription: 'Descripción del Producto',
        productDetails: 'Detalles del Producto',
        productSku: 'SKU del Producto',
        productImages: 'Imágenes del Producto',
        uploadImages: 'Subir Imágenes',
        productionLevels: 'Niveles de Producción',
        addLevel: 'Agregar Nivel de Producción',
        levelName: 'Nombre del Nivel',
        unitsCount: 'Cantidad de Unidades',
        unitPrice: 'Precio Unitario',
        votesNeeded: 'Votos Necesarios',
        remove: 'Eliminar',
        projectSections: 'Secciones del Proyecto',
        addSection: 'Agregar Sección',
        sectionTitle: 'Título de Sección',
        sectionDescription: 'Descripción de Sección',
        videoUrl: 'URL de Video',
        sectionImages: 'Imágenes de Sección',
        createProject: 'Crear Proyecto',
        creating: 'Creando...',
        cancel: 'Cancelar',
        successMessage: '¡Proyecto creado exitosamente!',
        errorMessage: 'Error al crear proyecto'
      },
      // Guild Progression
      guildProgression: {
        title: 'Progresión del Gremio',
        currentTier: 'Nivel Actual',
        currentClass: 'Clase Actual',
        profitShare: 'Porcentaje de Ingresos',
        experience: 'Experiencia',
        hours: 'horas',
        contracts: 'Contratos Completados',
        stakeRequired: 'Apuesta Requerida',
        stakePaid: 'Apuesta Pagada',
        payStake: 'Pagar Apuesta',
        unlockNext: 'Desbloquear Siguiente Clase',
        lockedTier: 'Nivel Bloqueado',
        apprentice: 'Aprendiz',
        journeyman: 'Oficial',
        master: 'Maestro',
        captain: 'Capitán de Industria',
        processing: 'Procesando...',
        paymentInNewTab: 'Completa el pago en la nueva pestaña',
        progressToNext: 'Progreso al Siguiente Nivel'
      },
      // Membership Payment
      membershipPayment: {
        title: 'Membresía LB',
        active: 'Membresía LB Activa',
        inactive: 'Membresía LB Requerida',
        fullAccess: 'Tienes acceso completo a todos los portales de LianaBanyan',
        unlockAccess: 'Desbloquea acceso a',
        businessPortal: 'Portal de Negocios - Gestión de posiciones y RRHH',
        networkPortal: 'Portal de Red - Producción B2B y contratos',
        nonprofitPortal: 'Portal Sin Fines de Lucro - Administración de fondos y beneficios',
        oneTimeFee: 'Una sola vez',
        payNow: 'Pagar Ahora',
        processing: 'Procesando...'
      },
      // Contract Positions
      contractPositions: {
        title: 'Posiciones de Contrato',
        back: 'Atrás',
        selectCategory: 'Seleccionar Categoría',
        viewAllPositions: 'Ver Todas las Posiciones',
        applyForPosition: 'Aplicar a Posición',
        apply: 'Aplicar',
        viewDetails: 'Ver Detalles',
        simulateAssignment: 'Simular Asignación',
        compensation: 'Compensación',
        equity: 'Participación',
        cash: 'Efectivo',
        creditsReserved: 'Créditos Reservados',
        requiredStage: 'Etapa Requerida',
        negotiatedRate: 'Tarifa Negociada',
        noPositions: 'No hay posiciones disponibles aún',
        loading: 'Cargando posiciones...'
      },
      // Toast Messages
      toast: {
        paymentSuccess: 'Pago procesado exitosamente',
        paymentError: 'Error al procesar el pago',
        applicationSubmitted: 'Solicitud enviada',
        applicationError: 'Error al enviar solicitud',
        dataLoaded: 'Datos cargados',
        dataError: 'Error al cargar datos',
        saveSuccess: 'Cambios guardados',
        saveError: 'Error al guardar',
        deleteSuccess: 'Eliminado exitosamente',
        deleteError: 'Error al eliminar',
        checkoutCreated: 'Redirigiendo a pago...',
        completePayment: 'Completa el pago en la nueva pestaña',
        success: {
          saved: "Cambios guardados exitosamente",
          created: "Creado exitosamente",
          updated: "Actualizado exitosamente",
          deleted: "Eliminado exitosamente",
        },
        error: {
          generic: "Algo salió mal",
          network: "Error de red. Inténtalo de nuevo.",
          unauthorized: "No tienes permiso para hacer esto",
          notFound: "Elemento no encontrado",
        }
      },
      portfolio: {
        title: "Portafolio",
        subtitle: "Ver y gestionar tus contribuciones",
        tabs: {
          overview: "Resumen",
          investments: "Contribuciones",
          returns: "Actividad",
          history: "Historial"
        },
        stats: {
          totalInvested: "Total Contribuido",
          currentValue: "Valor Actual",
          totalReturn: "Valor de Servicio",
          activeInvestments: "Proyectos Activos"
        },
        table: {
          project: "Proyecto",
          amount: "Monto",
          date: "Fecha",
          status: "Estado",
          return: "Valor"
        },
        empty: "Aún no hay contribuciones",
        emptyDescription: "Comienza a respaldar proyectos para verlos aquí"
      },
      profileSettings: {
        title: "Configuración de Perfil",
        subtitle: "Gestiona tu cuenta y preferencias",
        sections: {
          general: "General",
          security: "Seguridad",
          notifications: "Notificaciones",
          privacy: "Privacidad"
        },
        general: {
          displayName: "Nombre de Usuario",
          email: "Correo Electrónico",
          bio: "Biografía",
          location: "Ubicación",
          website: "Sitio Web",
          avatar: "Foto de Perfil"
        },
        security: {
          changePassword: "Cambiar Contraseña",
          currentPassword: "Contraseña Actual",
          newPassword: "Nueva Contraseña",
          confirmPassword: "Confirmar Contraseña",
          twoFactor: "Autenticación de Dos Factores",
          enable2FA: "Activar 2FA",
          disable2FA: "Desactivar 2FA"
        },
        notifications: {
          email: "Notificaciones por Correo",
          push: "Notificaciones Push",
          projectUpdates: "Actualizaciones de Proyectos",
          messages: "Mensajes",
          marketing: "Correos de Marketing"
        },
        privacy: {
          profileVisibility: "Visibilidad del Perfil",
          showEmail: "Mostrar Correo",
          showActivity: "Mostrar Actividad",
          searchable: "Perfil Buscable"
        }
      },
      clans: {
        title: "Clanes",
        subtitle: "Grupos colaborativos para proyectos compartidos",
        createClan: "Crear Clan",
        joinClan: "Unirse a Clan",
        myClan: "Mi Clan",
        explore: "Explorar Clanes",
        members: "Miembros",
        projects: "Proyectos",
        charter: "Carta",
        agreements: "Acuerdos",
        stats: {
          totalMembers: "Total de Miembros",
          activeProjects: "Proyectos Activos",
          completedProjects: "Completados",
          reputation: "Reputación"
        },
        form: {
          name: "Nombre del Clan",
          description: "Descripción",
          mission: "Declaración de Misión",
          values: "Valores Fundamentales",
          rules: "Reglas",
          requirements: "Requisitos de Membresía"
        },
        empty: "No se encontraron clanes",
        emptyDescription: "Crea o únete a un clan para comenzar"
      },
      guilds: {
        title: "Gremios",
        subtitle: "Gremios profesionales para miembros especializados",
        myGuild: "Mi Gremio",
        explore: "Explorar Gremios",
        stake: "Apostar",
        benefits: "Beneficios",
        requirements: "Requisitos",
        progression: {
          title: "Progresión del Gremio",
          currentTier: "Nivel Actual",
          nextTier: "Siguiente Nivel",
          stakeRequired: "Apuesta Requerida",
          experienceRequired: "Experiencia Requerida",
          totalPaid: "Total Pagado",
          unlock: "Desbloquear",
          locked: "Bloqueado",
          progress: "Progreso"
        },
        stats: {
          members: "Miembros",
          avgReputation: "Reputación Promedio",
          activeContracts: "Contratos Activos",
          completionRate: "Tasa de Finalización"
        },
        empty: "No hay gremios disponibles",
        emptyDescription: "Los gremios estarán disponibles pronto"
      },
      hexisle: {
        title: "HexIsle",
        subtitle: "Tu progresión de habilidades a través de 7 islas",
        dashboard: "Tablero de Progresión",
        islands: "Islas",
        skills: "Habilidades",
        casual: "Modo Casual",
        realStakes: "Modo de Participación Real",
        verified: "Progreso Verificado",
        unlocked: "Desbloqueado",
        locked: "Bloqueado"
      },
      peerContracts: {
        title: "Contratos Entre Pares",
        subtitle: "Acuerdos de colaboración directa entre miembros",
        createContract: "Crear Contrato",
        myContracts: "Mis Contratos",
        active: "Activos",
        completed: "Completados",
        pending: "Pendientes"
      },
      reputation: {
        title: "Perfil de Reputación",
        subtitle: "Tu puntuación de confianza y logros",
        score: "Puntuación de Reputación",
        rank: "Rango",
        achievements: "Logros",
        stats: {
          projectsCompleted: "Proyectos Completados",
          onTimeDelivery: "Entrega a Tiempo",
          qualityRating: "Calificación de Calidad",
          responseTime: "Tiempo de Respuesta"
        },
        reviewsData: {
          given: "Reseñas Dadas",
          received: "Reseñas Recibidas",
          positive: "Positivas",
          neutral: "Neutrales",
          negative: "Negativas"
        },
        badgesList: {
          earlyAdopter: "Adoptador Temprano",
          topContributor: "Mejor Contribuidor",
          reliablePartner: "Socio Confiable",
          qualityFocus: "Enfoque en Calidad"
        },
        empty: "Aún no hay datos de reputación",
        emptyDescription: "Completa proyectos para construir tu reputación"
      },
      ipRegistration: {
        title: "Registro de PI",
        subtitle: "Registra y protege tu propiedad intelectual",
        register: "Registrar PI",
        myIP: "Mis Activos de PI",
        tiers: "Niveles de Protección",
        form: {
          title: "Título del Activo de PI",
          description: "Descripción",
          type: "Tipo",
          category: "Categoría",
          tier: "Nivel de Protección"
        },
        types: {
          patent: "Patente",
          trademark: "Marca Registrada",
          copyright: "Derechos de Autor",
          trade_secret: "Secreto Comercial",
          design: "Diseño"
        },
        tierFeatures: {
          basic: {
            feature1: "Registro básico",
            feature2: "Registro público",
            feature3: "Soporte por correo"
          },
          standard: {
            feature1: "Registro mejorado",
            feature2: "Registro privado o público",
            feature3: "Soporte prioritario",
            feature4: "Plantillas legales"
          },
          premium: {
            feature1: "Protección legal completa",
            feature2: "Registro privado",
            feature3: "Soporte 24/7",
            feature4: "Consulta legal",
            feature5: "Servicio de monitoreo"
          },
          enterprise: {
            feature1: "Protección máxima",
            feature2: "Gerente de cuenta dedicado",
            feature3: "Servicios legales personalizados",
            feature4: "Monitoreo global",
            feature5: "Resolución prioritaria de disputas"
          }
        },
        status: {
          pending: "Pendiente",
          approved: "Aprobado",
          rejected: "Rechazado",
          active: "Activo",
          expired: "Expirado"
        },
        empty: "No hay activos de PI registrados",
        emptyDescription: "Registra tu primer activo de PI para comenzar"
      },
      auth: {
        title: "Bienvenido",
        signIn: "Iniciar Sesión",
        signUp: "Registrarse",
        email: "Correo",
        password: "Contraseña",
        fullName: "Nombre Completo",
        forgotPassword: "¿Olvidaste tu contraseña?",
        resetPassword: "Restablecer Contraseña",
        sendResetLink: "Enviar Enlace",
        backToLogin: "Volver al Inicio",
        alreadyHaveAccount: "¿Ya tienes cuenta?",
        dontHaveAccount: "¿No tienes cuenta?",
        enterEmail: "Ingresa tu correo",
        enterPassword: "Ingresa tu contraseña",
        enterFullName: "Ingresa tu nombre completo",
        signInButton: "Iniciar Sesión",
        signUpButton: "Registrarse",
        signingIn: "Iniciando sesión...",
        signingUp: "Registrando...",
        validation: {
          invalidEmail: "Correo inválido",
          passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
          enterFullName: "Por favor ingresa tu nombre completo"
        },
        success: {
          signIn: "Sesión iniciada exitosamente",
          signUp: "¡Cuenta creada! Verifica tu correo.",
          resetSent: "Enlace de restablecimiento enviado a tu correo"
        },
        error: {
          signIn: "Error al iniciar sesión",
          signUp: "Error al registrarse",
          resetPassword: "Error al enviar el enlace"
        }
      },
      browseBusiness: {
        title: "Explorar Posiciones",
        subtitle: "Encuentra posiciones de contrato y oportunidades de empleo",
        positionCategories: "Categorías de Posiciones",
        technical: {
          title: "Roles Técnicos",
          description: "Desarrollo, ingeniería y posiciones técnicas"
        },
        creative: {
          title: "Posiciones Creativas",
          description: "Diseño, contenido y servicios creativos"
        },
        operations: {
          title: "Operaciones y Gestión",
          description: "RRHH, gestión de proyectos, operaciones"
        },
        trades: {
          title: "Oficios Especializados",
          description: "Manufactura, producción, trabajo manual"
        },
        growth: {
          title: "Crecimiento y Marketing",
          description: "Ventas, marketing, desarrollo empresarial"
        },
        hr: {
          title: "Recursos Humanos",
          description: "Adquisición de talento y operaciones de personal"
        },
        openings: "vacantes",
        avgEquity: "Participación Promedio",
        viewPositions: "Ver Posiciones"
      },
      browseMarketplace: {
        title: "Explorar Mercado",
        subtitle: "Descubre productos y oportunidades de patrocinio",
        sustainable: {
          title: "Productos Sostenibles",
          description: "Bienes y servicios ecológicos"
        },
        community: {
          title: "Proyectos Comunitarios",
          description: "Iniciativas y desarrollos locales"
        },
        investment: {
          title: "Oportunidades de Patrocinio",
          description: "Respalda proyectos y participa en la cooperativa"
        },
        featured: {
          title: "Productos Destacados",
          description: "Ofertas comunitarias mejor calificadas"
        },
        items: "artículos",
        trending: "En Tendencia",
        explore: "Explorar"
      },
      browseNetwork: {
        title: "Explorar Red",
        subtitle: "Conecta con socios de producción y proveedores de servicios",
        manufacturing: {
          title: "Servicios de Manufactura",
          description: "Capacidad y capacidades de producción"
        },
        supplyChain: {
          title: "Socios de Cadena de Suministro",
          description: "Servicios de logística y cumplimiento"
        },
        scheduling: {
          title: "Programación de Producción",
          description: "Planificación y coordinación de capacidad"
        },
        api: {
          title: "API XML Lockbox",
          description: "Intercambio de datos verificado por blockchain"
        },
        pricing: {
          title: "Precios de Industria",
          description: "Datos de precios de mercado en tiempo real"
        },
        integration: {
          title: "Integración de Red",
          description: "Conecta tus sistemas a la red"
        },
        providers: "proveedores",
        viewServices: "Ver Servicios"
      },
      browseNonprofit: {
        title: "Beneficios de Miembros",
        subtitle: "Explora ventajas de membresía y programas comunitarios",
        tiers: {
          title: "Niveles de Membresía",
          description: "Beneficios y ventajas basadas en medallones"
        },
        loans: {
          title: "Programas de Préstamos",
          description: "Préstamos comunitarios de bajo interés"
        },
        eoi: {
          title: "Vesting EOI",
          description: "Conversión de Expresión de Interés a participación"
        },
        rewards: {
          title: "Recompensas de Medallones",
          description: "Tokens de membresía verificados por blockchain"
        },
        subsidies: {
          title: "Subsidios de Gas",
          description: "Costos de transacción cubiertos por el fondo"
        },
        fundingPool: {
          title: "Fondo de Financiamiento LB",
          description: "33% de ventas de medallones financian beneficios"
        },
        learnMore: "Saber Más"
      },
      adminProject: {
        title: "Gestión de Proyecto Admin",
        subtitle: "Administra proyectos, financiamiento e invitaciones",
        tabs: {
          overview: "Resumen",
          funding: "Financiamiento",
          invitations: "Invitaciones",
          tasks: "Tareas",
          themes: "Temas",
          blockchain: "Blockchain",
          resources: "Recursos",
          voting: "Votación",
          compensation: "Compensación",
          applications: "Solicitudes",
          positions: "Posiciones"
        },
        selectProject: "Seleccionar Proyecto",
        noProjects: "No se encontraron proyectos",
        createFirst: "Crea tu primer proyecto",
        fundingPot: "Fondo de Financiamiento",
        currentAmount: "Cantidad Actual",
        addFunds: "Agregar Fondos",
        amount: "Cantidad",
        inviteTeam: "Invitar Miembro del Equipo",
        credits: "Créditos",
        sendInvite: "Enviar Invitación",
        pending: "Pendiente",
        accepted: "Aceptado",
        rejected: "Rechazado",
        loading: "Cargando...",
        success: "Éxito",
        error: "Error"
      },
      roleManagement: {
        title: "Gestión de Roles",
        subtitle: "Administra roles y permisos de usuarios",
        searchUser: "Buscar por correo",
        selectUser: "Seleccionar Usuario",
        selectRole: "Seleccionar Rol",
        assignRole: "Asignar Rol",
        removeRole: "Eliminar Rol",
        roles: {
          admin: "Admin",
          project_owner: "Propietario de Proyecto",
          user: "Usuario"
        },
        currentRoles: "Roles Actuales",
        noRoles: "Sin roles asignados",
        adminOnly: "Acceso de admin requerido",
        loading: "Cargando usuarios..."
      },
      simulator: {
        title: "Simulador de Proyectos",
        subtitle: "Calcula escenarios y genera reportes",
        scenarioName: "Nombre del Escenario",
        saveScenario: "Guardar Escenario",
        loadScenario: "Cargar Escenario",
        projectName: "Nombre del Proyecto",
        productName: "Nombre del Producto",
        unitsCount: "Cantidad de Unidades",
        unitPrice: "Precio Unitario",
        volumeDiscount: "Descuento por Volumen",
        equityPercentage: "% Participación",
        cashPercentage: "% Efectivo",
        votesNeeded: "Votos Necesarios",
        calculate: "Calcular",
        results: "Resultados",
        totalRevenue: "Ingresos Totales",
        discountedRevenue: "Ingresos con Descuento",
        equityValue: "Valor de Participación",
        cashValue: "Valor en Efectivo",
        pricePerUnit: "Precio por Unidad",
        downloadReport: "Descargar Reporte",
        generateXML: "Generar XML"
      },
      managePositions: {
        title: "Gestionar Posiciones",
        subtitle: "Crea y administra posiciones de contrato",
        createPosition: "Crear Posición",
        editPosition: "Editar Posición",
        deletePosition: "Eliminar Posición",
        positionTitle: "Título de Posición",
        category: "Categoría",
        stage: "Etapa",
        description: "Descripción",
        requirements: "Requisitos",
        compensation: "Compensación",
        equity: "Participación",
        cash: "Efectivo",
        credits: "Créditos",
        duration: "Duración",
        active: "Activa",
        inactive: "Inactiva",
        applicants: "Solicitantes",
        viewApplications: "Ver Solicitudes",
        noPositions: "Aún no hay posiciones",
        createFirst: "Crea tu primera posición"
      },
      investmentExplainer: {
        title: "Guía de Patrocinio",
        subtitle: "Cómo los respaldos se convierten en participación cooperativa",
        tabs: {
          overview: "Resumen",
          conversion: "Flujo de Conversión",
          calculator: "Calculadora de Servicio",
          scenarios: "Escenarios"
        },
        howItWorks: "Cómo Funciona",
        step1: {
          title: "Respaldo Kickstarter",
          description: "Respalda un proyecto en Kickstarter"
        },
        step2: {
          title: "Conversión EOI",
          description: "El respaldo se convierte en Expresión de Interés"
        },
        step3: {
          title: "Vesting Diario",
          description: "1% se convierte en participación diariamente"
        },
        step4: {
          title: "Membresía Completa",
          description: "Participación completa después de 100 días"
        },
        benefits: "Beneficios de Membresía",
        earlyAccess: "Acceso anticipado a productos",
        equityGrowth: "Crecimiento de participación cooperativa",
        communityVoting: "Derechos de votación comunitaria",
        exclusivePerks: "Beneficios exclusivos de miembros",
        calculateReturn: "Calcula Tu Asignación",
        investmentAmount: "Cantidad de Patrocinio",
        projectedGrowth: "Crecimiento Proyectado",
        timeframe: "Marco de Tiempo",
        estimatedValue: "Valor Estimado"
      }
    }
  },
  // Add more languages as needed
  fr: {
    translation: {
      nav: {
        home: 'Accueil',
        projects: 'Projets',
        marketplace: 'Marché',
        about: 'À propos',
        contact: 'Contact',
        dashboard: 'Tableau de bord',
        profile: 'Profil',
        settings: 'Paramètres',
        logout: 'Déconnexion',
        login: 'Connexion'
      },
      common: {
        welcome: 'Bienvenue',
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        create: 'Créer',
        update: 'Mettre à jour',
        search: 'Rechercher',
        filter: 'Filtrer',
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
        confirm: 'Confirmer',
        close: 'Fermer'
      },
      projects: {
        title: 'Projets',
        create: 'Créer un projet',
        myProjects: 'Mes projets',
        description: 'Description',
        status: 'Statut',
        owner: 'Propriétaire',
        createdAt: 'Créé le'
      },
      marketplace: {
        title: 'Marché',
        browse: 'Parcourir les produits',
        categories: 'Catégories',
        featured: 'En vedette',
        newArrivals: 'Nouveautés',
        addToCart: 'Ajouter au panier',
        buyNow: 'Acheter maintenant'
      },
      preferences: {
        title: 'Préférences',
        description: 'Personnalisez votre expérience avec les paramètres de thème et de langue.',
        theme: 'Thème',
        language: 'Langue',
        changeTheme: 'Changer de thème',
        changeLanguage: 'Changer de langue'
      },
      // Tableau de Bord
      dashboard: {
        title: 'Tableau de bord',
        myDashboard: 'Mon Tableau de bord',
        portalAccess: 'Accès aux Portails',
        membership: 'Adhésion',
        credits: 'Mes Crédits',
        creditsAvailable: 'disponibles',
        useCredits: 'Utilisez vos crédits pour voter sur les niveaux de production',
        noCredits: 'Acceptez une invitation de projet pour recevoir des crédits',
        guildProgression: 'Progression de Guilde',
        eoi: 'Expression d\'Intérêt',
        overview: 'Aperçu',
        marketplace: 'Marché',
        browseProjects: 'Parcourir les projets nouveaux, tendances et financés',
        viewAllProjects: 'Voir tous les projets de crowdfunding',
        myPortfolio: 'Mon Portefeuille',
        trackInvestments: 'Suivre vos contributions et votes',
        myMedallions: 'Mes Médaillons',
        viewBadges: 'Voir vos badges et jetons de projet',
        adminTools: 'Outils Admin et Membres',
        roles: 'Rôles',
        externalServices: 'Services Externes'
      },
      // Crédits
      credits: {
        title: 'Crédits',
        purchase: 'Acheter des Crédits',
        available: 'Crédits Disponibles',
        total: 'Crédits Totaux',
        used: 'Crédits Utilisés',
        earned: 'Crédits Gagnés',
        contribution: 'Crédits de Contribution',
        bonus: 'Crédits Bonus',
        history: 'Historique des Crédits',
        purchasePackage: 'Acheter un Forfait',
        selectAmount: 'Sélectionner le Montant'
      },
      // Système de Guilde
      guild: {
        title: 'Guilde',
        progression: 'Progression de Guilde',
        currentTier: 'Niveau Actuel',
        currentClass: 'Classe Actuelle',
        stakeRequired: 'Mise Requise',
        apprentice: 'Apprenti',
        journeyman: 'Compagnon',
        master: 'Maître',
        payStake: 'Payer la Mise',
        unlockNext: 'Débloquer la Prochaine Classe',
        profitPercentage: 'Pourcentage de Revenus',
        contracts: 'Contrats Complétés',
        reputation: 'Réputation'
      },
      // Formulaires
      forms: {
        name: 'Nom',
        description: 'Description',
        email: 'Email',
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le Mot de passe',
        submit: 'Soumettre',
        required: 'Requis',
        optional: 'Optionnel',
        pleaseWait: 'Veuillez patienter...',
        processing: 'Traitement...'
      },
      // Créer un Projet
      createProject: {
        title: 'Créer un Nouveau Projet',
        projectName: 'Nom du Projet',
        projectDescription: 'Description du Projet',
        detailedDescription: 'Description Détaillée',
        category: 'Catégorie',
        targetAmount: 'Montant Cible',
        deadline: 'Date Limite',
        submit: 'Créer le Projet',
        cancel: 'Annuler',
        success: 'Projet créé avec succès !',
        error: 'Échec de la création du projet'
      },
      // Adhésion
      membership: {
        title: 'Adhésion',
        status: 'Statut',
        active: 'Active',
        inactive: 'Inactive',
        expired: 'Expirée',
        stake: 'Mise d\'Adhésion',
        payStake: 'Payer la Mise d\'Adhésion',
        expiresOn: 'Expire le',
        renewMembership: 'Renouveler l\'Adhésion'
      },
      // Services Externes
      externalServices: {
        title: 'Services Externes',
        description: 'Gérez vos comptes de plateformes de services externes',
        addService: 'Ajouter un Lien de Service',
        platform: 'Plateforme',
        profileUrl: 'URL du Profil',
        username: 'Nom d\'utilisateur',
        rateRange: 'Fourchette de Tarif',
        verified: 'Vérifié',
        pending: 'En attente',
        flagged: 'Signalé',
        remove: 'Supprimer',
        compliance: 'Avertissement de Conformité',
        complianceMessage: 'Si vous embauchez un autre membre LB via un service externe, vous devez payer les tarifs d\'échelle LB.'
      },
      // Messages et Notifications
      messages: {
        success: 'Succès !',
        error: 'Erreur',
        warning: 'Avertissement',
        info: 'Information',
        confirmDelete: 'Êtes-vous sûr de vouloir supprimer ceci ?',
        confirmAction: 'Êtes-vous sûr de vouloir continuer ?',
        loadingData: 'Chargement des données...',
        noData: 'Aucune donnée disponible',
        tryAgain: 'Veuillez réessayer'
      },
      // Page Projets
      projectsPage: {
        title: 'Projets',
        back: 'Retour',
        signOut: 'Déconnexion',
        loading: 'Chargement des projets...',
        noProjects: 'Aucun projet trouvé',
        viewProject: 'Voir le Projet',
        createdAt: 'Créé',
        fundingProgress: 'Progrès du Financement'
      },
      // Page Marché
      marketplacePage: {
        title: 'Marché',
        subtitle: 'Découvrez et soutenez des projets innovants',
        newProjects: 'Nouveaux Projets',
        trendingProjects: 'Projets Tendances',
        fundedProjects: 'Financés avec Succès',
        last24h: 'Dernières 24 Heures',
        last72h: 'Dernières 72 Heures',
        lastWeek: 'Dernière Semaine',
        viewAll: 'Voir Tout',
        votes: 'votes',
        fundingGoal: 'Objectif de Financement',
        funded: 'Financé',
        backers: 'Contributeurs'
      },
      // Page Créer un Projet
      createProjectPage: {
        title: 'Créer un Nouveau Projet',
        subtitle: 'Lancez votre campagne de financement participatif',
        back: 'Retour au Tableau de bord',
        projectDetails: 'Détails du Projet',
        projectName: 'Nom du Projet',
        projectNamePlaceholder: 'Entrez le nom du projet',
        tagline: 'Slogan',
        taglinePlaceholder: 'Description courte et accrocheuse',
        description: 'Description',
        descriptionPlaceholder: 'Décrivez votre projet',
        detailedDescription: 'Description Détaillée',
        detailedDescriptionPlaceholder: 'Détails complets du projet',
        products: 'Produits',
        addProduct: 'Ajouter un Produit',
        productName: 'Nom du Produit',
        productDescription: 'Description du Produit',
        productDetails: 'Détails du Produit',
        productSku: 'SKU du Produit',
        productImages: 'Images du Produit',
        uploadImages: 'Télécharger des Images',
        productionLevels: 'Niveaux de Production',
        addLevel: 'Ajouter un Niveau de Production',
        levelName: 'Nom du Niveau',
        unitsCount: 'Nombre d\'Unités',
        unitPrice: 'Prix Unitaire',
        votesNeeded: 'Votes Nécessaires',
        remove: 'Supprimer',
        projectSections: 'Sections du Projet',
        addSection: 'Ajouter une Section',
        sectionTitle: 'Titre de Section',
        sectionDescription: 'Description de Section',
        videoUrl: 'URL de Vidéo',
        sectionImages: 'Images de Section',
        createProject: 'Créer le Projet',
        creating: 'Création...',
        cancel: 'Annuler',
        successMessage: 'Projet créé avec succès !',
        errorMessage: 'Échec de la création du projet'
      },
      // Progression de Guilde
      guildProgression: {
        title: 'Progression de Guilde',
        currentTier: 'Niveau Actuel',
        currentClass: 'Classe Actuelle',
        profitShare: 'Pourcentage de Revenus',
        experience: 'Expérience',
        hours: 'heures',
        contracts: 'Contrats Complétés',
        stakeRequired: 'Mise Requise',
        stakePaid: 'Mise Payée',
        payStake: 'Payer la Mise',
        unlockNext: 'Débloquer la Prochaine Classe',
        lockedTier: 'Niveau Verrouillé',
        apprentice: 'Apprenti',
        journeyman: 'Compagnon',
        master: 'Maître',
        captain: 'Capitaine d\'Industrie',
        processing: 'Traitement...',
        paymentInNewTab: 'Complétez le paiement dans le nouvel onglet',
        progressToNext: 'Progrès vers le Prochain Niveau'
      },
      // Paiement d\'Adhésion
      membershipPayment: {
        title: 'Adhésion LB',
        active: 'Adhésion LB Active',
        inactive: 'Adhésion LB Requise',
        fullAccess: 'Vous avez un accès complet à tous les portails LianaBanyan',
        unlockAccess: 'Débloquez l\'accès à',
        businessPortal: 'Portail Entreprise - Gestion des positions et RH',
        networkPortal: 'Portail Réseau - Production B2B et contrats',
        nonprofitPortal: 'Portail à But Non Lucratif - Administration des fonds et avantages',
        oneTimeFee: 'Frais uniques',
        payNow: 'Payer Maintenant',
        processing: 'Traitement...'
      },
      // Positions Contractuelles
      contractPositions: {
        title: 'Positions Contractuelles',
        back: 'Retour',
        selectCategory: 'Sélectionner une Catégorie',
        viewAllPositions: 'Voir Toutes les Positions',
        applyForPosition: 'Postuler',
        apply: 'Postuler',
        viewDetails: 'Voir les Détails',
        simulateAssignment: 'Simuler l\'Attribution',
        compensation: 'Rémunération',
        equity: 'Participation',
        cash: 'Argent',
        creditsReserved: 'Crédits Réservés',
        requiredStage: 'Étape Requise',
        negotiatedRate: 'Tarif Négocié',
        noPositions: 'Aucune position disponible pour le moment',
        loading: 'Chargement des positions...'
      },
      // Messages Toast
      toast: {
        paymentSuccess: 'Paiement traité avec succès',
        paymentError: 'Erreur lors du traitement du paiement',
        applicationSubmitted: 'Candidature soumise',
        applicationError: 'Erreur lors de la soumission',
        dataLoaded: 'Données chargées',
        dataError: 'Erreur lors du chargement des données',
        saveSuccess: 'Modifications enregistrées',
        saveError: 'Erreur lors de l\'enregistrement',
        deleteSuccess: 'Supprimé avec succès',
        deleteError: 'Erreur lors de la suppression',
        checkoutCreated: 'Redirection vers le paiement...',
        completePayment: 'Complétez le paiement dans le nouvel onglet',
        success: {
          saved: "Modifications enregistrées avec succès",
          created: "Créé avec succès",
          updated: "Mis à jour avec succès",
          deleted: "Supprimé avec succès",
        },
        error: {
          generic: "Quelque chose s'est mal passé",
          network: "Erreur réseau. Veuillez réessayer.",
          unauthorized: "Vous n'avez pas la permission de faire cela",
          notFound: "Élément non trouvé",
        }
      },
      portfolio: {
        title: "Portefeuille",
        subtitle: "Voir et gérer vos contributions",
        tabs: {
          overview: "Aperçu",
          investments: "Contributions",
          returns: "Activité",
          history: "Historique"
        },
        stats: {
          totalInvested: "Total Contribué",
          currentValue: "Valeur Actuelle",
          totalReturn: "Valeur de Service",
          activeInvestments: "Projets Actifs"
        },
        table: {
          project: "Projet",
          amount: "Montant",
          date: "Date",
          status: "Statut",
          return: "Valeur"
        },
        empty: "Aucune contribution pour le moment",
        emptyDescription: "Commencez à contribuer dans des projets pour les voir ici"
      },
      profileSettings: {
        title: "Paramètres du Profil",
        subtitle: "Gérer votre compte et préférences",
        sections: {
          general: "Général",
          security: "Sécurité",
          notifications: "Notifications",
          privacy: "Confidentialité"
        },
        general: {
          displayName: "Nom d'Affichage",
          email: "Email",
          bio: "Biographie",
          location: "Localisation",
          website: "Site Web",
          avatar: "Photo de Profil"
        },
        security: {
          changePassword: "Changer le Mot de Passe",
          currentPassword: "Mot de Passe Actuel",
          newPassword: "Nouveau Mot de Passe",
          confirmPassword: "Confirmer le Mot de Passe",
          twoFactor: "Authentification à Deux Facteurs",
          enable2FA: "Activer 2FA",
          disable2FA: "Désactiver 2FA"
        },
        notifications: {
          email: "Notifications par Email",
          push: "Notifications Push",
          projectUpdates: "Mises à Jour des Projets",
          messages: "Messages",
          marketing: "Emails Marketing"
        },
        privacy: {
          profileVisibility: "Visibilité du Profil",
          showEmail: "Afficher l'Email",
          showActivity: "Afficher l'Activité",
          searchable: "Profil Recherchable"
        }
      },
      clans: {
        title: "Clans",
        subtitle: "Groupes collaboratifs pour projets partagés",
        createClan: "Créer un Clan",
        joinClan: "Rejoindre un Clan",
        myClan: "Mon Clan",
        explore: "Explorer les Clans",
        members: "Membres",
        projects: "Projets",
        charter: "Charte",
        agreements: "Accords",
        stats: {
          totalMembers: "Total des Membres",
          activeProjects: "Projets Actifs",
          completedProjects: "Terminés",
          reputation: "Réputation"
        },
        form: {
          name: "Nom du Clan",
          description: "Description",
          mission: "Déclaration de Mission",
          values: "Valeurs Fondamentales",
          rules: "Règles",
          requirements: "Exigences d'Adhésion"
        },
        empty: "Aucun clan trouvé",
        emptyDescription: "Créez ou rejoignez un clan pour commencer"
      },
      guilds: {
        title: "Guildes",
        subtitle: "Guildes professionnelles pour membres qualifiés",
        myGuild: "Ma Guilde",
        explore: "Explorer les Guildes",
        stake: "Mise",
        benefits: "Avantages",
        requirements: "Exigences",
        progression: {
          title: "Progression de Guilde",
          currentTier: "Niveau Actuel",
          nextTier: "Niveau Suivant",
          stakeRequired: "Mise Requise",
          experienceRequired: "Expérience Requise",
          totalPaid: "Total Payé",
          unlock: "Déverrouiller",
          locked: "Verrouillé",
          progress: "Progrès"
        },
        stats: {
          members: "Membres",
          avgReputation: "Réputation Moyenne",
          activeContracts: "Contrats Actifs",
          completionRate: "Taux de Réussite"
        },
        empty: "Aucune guilde disponible",
        emptyDescription: "Les guildes seront bientôt disponibles"
      },
      hexisle: {
        title: "HexIsle",
        subtitle: "Votre progression de compétences à travers 7 îles",
        dashboard: "Tableau de Progression",
        islands: "Îles",
        skills: "Compétences",
        casual: "Mode Décontracté",
        realStakes: "Mode Enjeux Réels",
        verified: "Progrès Vérifié",
        unlocked: "Déverrouillé",
        locked: "Verrouillé"
      },
      peerContracts: {
        title: "Contrats Entre Pairs",
        subtitle: "Accords de collaboration directe entre membres",
        createContract: "Créer un Contrat",
        myContracts: "Mes Contrats",
        active: "Actifs",
        completed: "Terminés",
        pending: "En Attente"
      },
      reputation: {
        title: "Profil de Réputation",
        subtitle: "Votre score de confiance et réalisations",
        score: "Score de Réputation",
        rank: "Rang",
        achievements: "Réalisations",
        stats: {
          projectsCompleted: "Projets Terminés",
          onTimeDelivery: "Livraison à Temps",
          qualityRating: "Note de Qualité",
          responseTime: "Temps de Réponse"
        },
        reviewsData: {
          given: "Avis Donnés",
          received: "Avis Reçus",
          positive: "Positifs",
          neutral: "Neutres",
          negative: "Négatifs"
        },
        badgesList: {
          earlyAdopter: "Adopteur Précoce",
          topContributor: "Meilleur Contributeur",
          reliablePartner: "Partenaire Fiable",
          qualityFocus: "Focus Qualité"
        },
        empty: "Aucune donnée de réputation pour le moment",
        emptyDescription: "Terminez des projets pour construire votre réputation"
      },
      ipRegistration: {
        title: "Enregistrement de PI",
        subtitle: "Enregistrez et protégez votre propriété intellectuelle",
        register: "Enregistrer PI",
        myIP: "Mes Actifs PI",
        tiers: "Niveaux de Protection",
        form: {
          title: "Titre de l'Actif PI",
          description: "Description",
          type: "Type",
          category: "Catégorie",
          tier: "Niveau de Protection"
        },
        types: {
          patent: "Brevet",
          trademark: "Marque Déposée",
          copyright: "Droit d'Auteur",
          trade_secret: "Secret Commercial",
          design: "Design"
        },
        tierFeatures: {
          basic: {
            feature1: "Enregistrement de base",
            feature2: "Registre public",
            feature3: "Support par email"
          },
          standard: {
            feature1: "Enregistrement amélioré",
            feature2: "Registre privé ou public",
            feature3: "Support prioritaire",
            feature4: "Modèles juridiques"
          },
          premium: {
            feature1: "Protection juridique complète",
            feature2: "Registre privé",
            feature3: "Support 24/7",
            feature4: "Consultation juridique",
            feature5: "Service de surveillance"
          },
          enterprise: {
            feature1: "Protection maximale",
            feature2: "Gestionnaire de compte dédié",
            feature3: "Services juridiques personnalisés",
            feature4: "Surveillance mondiale",
            feature5: "Résolution prioritaire des litiges"
          }
        },
        status: {
          pending: "En Attente",
          approved: "Approuvé",
          rejected: "Rejeté",
          active: "Actif",
          expired: "Expiré"
        },
        empty: "Aucun actif PI enregistré",
        emptyDescription: "Enregistrez votre premier actif PI pour commencer"
      },
      auth: {
        title: "Bienvenue",
        signIn: "Se Connecter",
        signUp: "S'Inscrire",
        email: "Email",
        password: "Mot de Passe",
        fullName: "Nom Complet",
        forgotPassword: "Mot de passe oublié?",
        resetPassword: "Réinitialiser le Mot de Passe",
        sendResetLink: "Envoyer le Lien",
        backToLogin: "Retour à la Connexion",
        alreadyHaveAccount: "Vous avez déjà un compte?",
        dontHaveAccount: "Vous n'avez pas de compte?",
        enterEmail: "Entrez votre email",
        enterPassword: "Entrez votre mot de passe",
        enterFullName: "Entrez votre nom complet",
        signInButton: "Se Connecter",
        signUpButton: "S'Inscrire",
        signingIn: "Connexion...",
        signingUp: "Inscription...",
        validation: {
          invalidEmail: "Email invalide",
          passwordTooShort: "Le mot de passe doit contenir au moins 6 caractères",
          enterFullName: "Veuillez entrer votre nom complet"
        },
        success: {
          signIn: "Connexion réussie",
          signUp: "Compte créé! Vérifiez votre email.",
          resetSent: "Lien de réinitialisation envoyé à votre email"
        },
        error: {
          signIn: "Échec de la connexion",
          signUp: "Échec de l'inscription",
          resetPassword: "Échec de l'envoi du lien"
        }
      },
      browseBusiness: {
        title: "Parcourir les Postes",
        subtitle: "Trouvez des postes contractuels et des opportunités d'emploi",
        positionCategories: "Catégories de Postes",
        technical: {
          title: "Rôles Techniques",
          description: "Développement, ingénierie et postes techniques"
        },
        creative: {
          title: "Postes Créatifs",
          description: "Design, contenu et services créatifs"
        },
        operations: {
          title: "Opérations et Gestion",
          description: "RH, gestion de projets, opérations"
        },
        trades: {
          title: "Métiers Spécialisés",
          description: "Fabrication, production, travail manuel"
        },
        growth: {
          title: "Croissance et Marketing",
          description: "Ventes, marketing, développement commercial"
        },
        hr: {
          title: "Ressources Humaines",
          description: "Acquisition de talents et opérations du personnel"
        },
        openings: "postes",
        avgEquity: "Participation Moyenne",
        viewPositions: "Voir les Postes"
      },
      browseMarketplace: {
        title: "Parcourir le Marché",
        subtitle: "Découvrez des produits et opportunités de parrainage",
        sustainable: {
          title: "Produits Durables",
          description: "Biens et services écologiques"
        },
        community: {
          title: "Projets Communautaires",
          description: "Initiatives et développements locaux"
        },
        investment: {
          title: "Opportunités de Parrainage",
          description: "Soutenez des projets et rejoignez la coopérative"
        },
        featured: {
          title: "Produits en Vedette",
          description: "Offres communautaires les mieux notées"
        },
        items: "articles",
        trending: "Tendance",
        explore: "Explorer"
      },
      browseNetwork: {
        title: "Parcourir le Réseau",
        subtitle: "Connectez-vous avec des partenaires de production et prestataires",
        manufacturing: {
          title: "Services de Fabrication",
          description: "Capacité et capacités de production"
        },
        supplyChain: {
          title: "Partenaires de Chaîne d'Approvisionnement",
          description: "Services de logistique et d'exécution"
        },
        scheduling: {
          title: "Planification de Production",
          description: "Planification et coordination de capacité"
        },
        api: {
          title: "API XML Lockbox",
          description: "Échange de données vérifié par blockchain"
        },
        pricing: {
          title: "Tarification Industrielle",
          description: "Données de tarification du marché en temps réel"
        },
        integration: {
          title: "Intégration Réseau",
          description: "Connectez vos systèmes au réseau"
        },
        providers: "prestataires",
        viewServices: "Voir les Services"
      },
      browseNonprofit: {
        title: "Avantages Membres",
        subtitle: "Explorez les avantages d'adhésion et programmes communautaires",
        tiers: {
          title: "Niveaux d'Adhésion",
          description: "Avantages basés sur les médaillons"
        },
        loans: {
          title: "Programmes de Prêts",
          description: "Prêts communautaires à faible taux"
        },
        eoi: {
          title: "Acquisition EOI",
          description: "Conversion d'Expression d'Intérêt en participation"
        },
        rewards: {
          title: "Récompenses Médaillons",
          description: "Jetons d'adhésion vérifiés par blockchain"
        },
        subsidies: {
          title: "Subventions de Gas",
          description: "Coûts de transaction couverts par le fonds"
        },
        fundingPool: {
          title: "Pool de Financement LB",
          description: "33% des ventes de médaillons financent les avantages"
        },
        learnMore: "En Savoir Plus"
      },
      adminProject: {
        title: "Gestion de Projet Admin",
        subtitle: "Gérer projets, financement et invitations",
        tabs: {
          overview: "Aperçu",
          funding: "Financement",
          invitations: "Invitations",
          tasks: "Tâches",
          themes: "Thèmes",
          blockchain: "Blockchain",
          resources: "Ressources",
          voting: "Vote",
          compensation: "Compensation",
          applications: "Candidatures",
          positions: "Postes"
        },
        selectProject: "Sélectionner un Projet",
        noProjects: "Aucun projet trouvé",
        createFirst: "Créez votre premier projet",
        fundingPot: "Pot de Financement",
        currentAmount: "Montant Actuel",
        addFunds: "Ajouter des Fonds",
        amount: "Montant",
        inviteTeam: "Inviter un Membre",
        credits: "Crédits",
        sendInvite: "Envoyer l'Invitation",
        pending: "En Attente",
        accepted: "Accepté",
        rejected: "Rejeté",
        loading: "Chargement...",
        success: "Succès",
        error: "Erreur"
      },
      roleManagement: {
        title: "Gestion des Rôles",
        subtitle: "Gérer les rôles et permissions des utilisateurs",
        searchUser: "Rechercher par email",
        selectUser: "Sélectionner Utilisateur",
        selectRole: "Sélectionner Rôle",
        assignRole: "Attribuer Rôle",
        removeRole: "Supprimer Rôle",
        roles: {
          admin: "Admin",
          project_owner: "Propriétaire de Projet",
          user: "Utilisateur"
        },
        currentRoles: "Rôles Actuels",
        noRoles: "Aucun rôle attribué",
        adminOnly: "Accès admin requis",
        loading: "Chargement des utilisateurs..."
      },
      simulator: {
        title: "Simulateur de Projet",
        subtitle: "Calculer scénarios et générer rapports",
        scenarioName: "Nom du Scénario",
        saveScenario: "Sauvegarder Scénario",
        loadScenario: "Charger Scénario",
        projectName: "Nom du Projet",
        productName: "Nom du Produit",
        unitsCount: "Nombre d'Unités",
        unitPrice: "Prix Unitaire",
        volumeDiscount: "Remise Volume",
        equityPercentage: "% Participation",
        cashPercentage: "% Argent",
        votesNeeded: "Votes Nécessaires",
        calculate: "Calculer",
        results: "Résultats",
        totalRevenue: "Revenu Total",
        discountedRevenue: "Revenu avec Remise",
        equityValue: "Valeur de Participation",
        cashValue: "Valeur en Argent",
        pricePerUnit: "Prix par Unité",
        downloadReport: "Télécharger Rapport",
        generateXML: "Générer XML"
      },
      managePositions: {
        title: "Gérer les Postes",
        subtitle: "Créer et gérer les postes contractuels",
        createPosition: "Créer Poste",
        editPosition: "Modifier Poste",
        deletePosition: "Supprimer Poste",
        positionTitle: "Titre du Poste",
        category: "Catégorie",
        stage: "Étape",
        description: "Description",
        requirements: "Exigences",
        compensation: "Compensation",
        equity: "Participation",
        cash: "Argent",
        credits: "Crédits",
        duration: "Durée",
        active: "Actif",
        inactive: "Inactif",
        applicants: "Candidats",
        viewApplications: "Voir Candidatures",
        noPositions: "Aucun poste pour le moment",
        createFirst: "Créez votre premier poste"
      },
      investmentExplainer: {
        title: "Guide de Parrainage",
        subtitle: "Comment les promesses deviennent participation coopérative",
        tabs: {
          overview: "Aperçu",
          conversion: "Flux de Conversion",
          calculator: "Calculateur de Service",
          scenarios: "Scénarios"
        },
        howItWorks: "Comment Ça Marche",
        step1: {
          title: "Promesse Kickstarter",
          description: "Soutenez un projet sur Kickstarter"
        },
        step2: {
          title: "Conversion EOI",
          description: "La promesse devient Expression d'Intérêt"
        },
        step3: {
          title: "Acquisition Quotidienne",
          description: "1% se convertit en participation quotidiennement"
        },
        step4: {
          title: "Adhésion Complète",
          description: "Participation complète après 100 jours"
        },
        benefits: "Avantages de Parrainage",
        earlyAccess: "Accès anticipé aux produits",
        equityGrowth: "Croissance de la participation coopérative",
        communityVoting: "Droits de vote communautaire",
        exclusivePerks: "Avantages exclusifs membres",
        calculateReturn: "Calculez Votre Allocation",
        investmentAmount: "Montant de Parrainage",
        projectedGrowth: "Croissance Projetée",
        timeframe: "Période",
        estimatedValue: "Valeur Estimée"
      }
    }
  }
};

// Domain-based language detection
const getDefaultLanguageFromDomain = (): string => {
  const hostname = window.location.hostname.toLowerCase();
  
  // Spanish domains
  if (hostname.includes('hexislo.com') || hostname.includes('elsegundosegundo.com')) {
    return 'es';
  }
  
  // Default to English
  return 'en';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getDefaultLanguageFromDomain(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
