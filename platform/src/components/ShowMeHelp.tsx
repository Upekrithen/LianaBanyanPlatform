/**
 * ShowMeHelp — Transparent overlay frame for contextual help
 * 
 * When OPEN:
 * - Header bar (top), Sidebar (left), Footer bar (bottom) frame the page
 * - Clicking ANY interactive element shows a help dialog FIRST
 * - Dialog has "Go Back" (dismiss) or "Proceed" (do the action)
 * - The actual page content remains visible and the help system intercepts clicks
 * 
 * Features:
 * - "Don't show again" checkbox for repetitive dialog types (e.g., locks)
 * - Context-aware category switching based on current page
 * - Reset dismissed dialogs via Settings
 */

import { useState, useEffect } from 'react';
import { Flame, ChevronDown, X, Save, Share2, Bookmark, Printer, Settings, MessageSquare, RotateCcw, Telescope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// DISMISSED HELP TYPES SYSTEM
// ============================================================================

const DISMISSED_STORAGE_KEY = 'showme-dismissed-help-types';

export type HelpDialogType = 
  | 'lock'           // Lock explanations
  | 'deck-card'      // Deck card explanations
  | 'button'         // Button explanations
  | 'navigation'     // Navigation explanations
  | 'general';       // Default/other

function getDismissedTypes(): Set<HelpDialogType> {
  try {
    const stored = localStorage.getItem(DISMISSED_STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored) as HelpDialogType[]);
    }
  } catch {
    // Ignore parse errors
  }
  return new Set();
}

function saveDismissedTypes(types: Set<HelpDialogType>) {
  localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify([...types]));
}

export function dismissHelpType(type: HelpDialogType) {
  const types = getDismissedTypes();
  types.add(type);
  saveDismissedTypes(types);
}

export function isHelpTypeDismissed(type: HelpDialogType): boolean {
  return getDismissedTypes().has(type);
}

export function resetDismissedTypes() {
  localStorage.removeItem(DISMISSED_STORAGE_KEY);
}

export function getDismissedCount(): number {
  return getDismissedTypes().size;
}

interface Category {
  id: string;
  title: string;
  icon: string;
  topics: { id: string; icon: string; title: string; subtitle: string; content: string; }[];
}

const CATEGORIES: Category[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: '🚀',
    topics: [
      { id: 'welcome', icon: '👋', title: 'Welcome', subtitle: 'How to use Show Me & Help', content: 'With Show Me & Help open, click on anything on the page to learn about it before using it.\n\n**How it works:**\n• Click any button, card, or lock\n• A dialog explains what it does\n• Choose "Go Back" to keep learning, or proceed with the action' },
      { id: 'deck-cards', icon: '🃏', title: 'What are Deck Cards', subtitle: 'Collect, store, and use cards', content: '**Deck Cards are your personal collection.**\n\nEvery major concept, achievement, and tool on the platform is represented by a card. When you unlock a card, it goes into your Deck.\n\n**How cards work:**\n• Each card has 4 corner locks — unlock all 4 to collect it\n• Cards represent concepts, achievements, or tools\n• Your Deck is your personal portfolio of collected cards\n• Some cards are rare (Legendary, Mythic) — collect them all!\n\n**Card types:**\n• 🏛️ **Concept Cards** — Platform principles and ideas\n• 🎯 **Achievement Cards** — Milestones you\'ve reached\n• 🔧 **Tool Cards** — Features you\'ve unlocked\n• ⭐ **Bounty Cards** — Work opportunities\n\n**Tip:** Cards are also Cue Cards — they remind you of key concepts when you need them!' },
      { id: 'crow-feathers', icon: '🪶', title: 'Crow Feathers', subtitle: 'Track your reading progress', content: '**Crow Feathers show how much you\'ve read.**\n\nWhen you read articles and documentation on Cephas (our knowledge base), you\'ll see crow feathers filling up as you scroll.\n\n**How it works:**\n• Empty feathers = unread content\n• Partially filled = you\'ve read some\n• Full feathers = you\'ve read it all\n• Percentage shows exact progress\n\n**Why "Crow Feathers"?**\nCephas means "rock" or "stone" — and crows are known for their intelligence and memory. The feathers represent knowledge gained.\n\n**Benefits:**\n• Resume reading where you left off\n• Track which topics you\'ve mastered\n• Earn achievements for completing sections\n• Your reading progress syncs across devices' },
      { id: 'economics-tour', icon: '📊', title: 'Quick Economics Tour', subtitle: 'The math behind Cost + 20%', content: 'The platform takes only Cost + 20% on every transaction.\n\n**What this means:**\n• On a $500 sale, the creator/worker keeps $416.67 (83.3%)\n• Platform margin is fixed — it can never increase\n• This is locked in the operating agreement' },
      { id: 'drop-beacon', icon: '💡', title: 'Drop Beacon', subtitle: 'Mark your place for later', content: 'Beacons let you mark interesting spots to return to later.\n\n**How to use:**\n• Click "Drop Beacon" when you find something interesting\n• Add a note about why you\'re marking this spot\n• Return to your beacons from your portfolio' },
    ]
  },
  {
    id: 'choose-path',
    title: 'Choose Your Path',
    icon: '⚓',
    topics: [
      { id: 'three-paths', icon: '🧭', title: 'Three Paths', subtitle: 'Overview of your options', content: '**You have three main paths on the platform:**\n\n**🚪 Get a Job**\nFind bounties (tasks) posted by other members. Complete work, earn credits.\n\n**🎭 Build a Business**\nSell products or services with transparent Cost + 20% pricing.\n\n**🌱 Back a Project**\nPreOrder fund innovations or support patent development.\n\n**You can do all three!** Most members start with one and expand over time.' },
      { id: 'path-get-job', icon: '🚪', title: 'Get a Job', subtitle: 'Earn through bounties', content: '**"Not a Job. A Way Out."**\n\nBounties are tasks posted by members who need help. Unlike traditional jobs:\n• No boss, no schedule\n• You choose what to work on\n• Build your portfolio as you go\n• Credits become real income\n\n**Click the "Get a Job" card** to explore available bounties.' },
      { id: 'path-build-biz', icon: '🎭', title: 'Build a Business', subtitle: 'Sell with transparency', content: '**"You have a Play, I have a Stage."**\n\nThe platform provides infrastructure for your business:\n• Transparent pricing (Cost + 20%)\n• Payment processing\n• Customer trust through verification\n• Marketing through the member network\n\n**Click the "Build a Business" card** to start listing.' },
      { id: 'path-back-project', icon: '🌱', title: 'Back a Project', subtitle: 'Fund innovations', content: '**PreOrder Pledge — Back a Patent**\n\nSupport innovations before they exist:\n• Pledge to buy when ready (no payment until delivery)\n• Sponsor patents for licensing participation\n• Help creators validate demand\n\n**Click the "Back a Project" card** to browse projects.' },
    ]
  },
  {
    id: 'get-job',
    title: 'Get a Job',
    icon: '🚪',
    topics: [
      { id: 'not-a-job', icon: '🚪', title: 'Not a Job — A Way Out', subtitle: 'Bounties are different', content: '**"Not a Job. A Way Out."**\n\nBounties aren\'t traditional employment — they\'re opportunities to earn by helping others while building your own path.\n\n**Why "A Way Out"?**\n• No boss, no schedule — you choose what to work on\n• Build a portfolio of completed bounties\n• Earn credits that become real income\n• Create your own business over time\n\n**The door represents:** An exit from traditional employment into cooperative economics.' },
      { id: 'browse-bounties', icon: '🔍', title: 'Browse Bounties', subtitle: 'Find matching work', content: 'Bounties are tasks posted by members who need help.\n\n**Categories include:**\n• Design & Creative — logos, graphics, UI\n• Development & Technical — code, integrations\n• Writing & Content — articles, copy, docs\n• Business Services — consulting, planning\n\n**Each bounty shows:**\n• What needs to be done\n• Credit reward amount\n• Skills required\n• Deadline (if any)' },
      { id: 'apply-bounty', icon: '📝', title: 'Apply with a Proposal', subtitle: 'Show your fit', content: 'When you find a bounty that fits:\n\n**Write a brief proposal** explaining:\n• Your approach to the task\n• Relevant experience or examples\n• Estimated timeline\n\n**Tips:**\n• Be specific about what you\'ll deliver\n• Ask clarifying questions if needed\n• Show enthusiasm for the project' },
      { id: 'complete-earn', icon: '💰', title: 'Complete & Earn', subtitle: 'Deliver quality work', content: 'Once your proposal is accepted:\n\n**Deliver quality work on time**\n• Communicate progress regularly\n• Ask questions early if stuck\n• Submit for review when complete\n\n**Earn credits** when the poster approves your work. Credits can be:\n• Spent on the platform\n• Converted to cash\n• Contributed to projects' },
    ]
  },
  {
    id: 'build-business',
    title: 'Build a Business',
    icon: '🎭',
    topics: [
      { id: 'you-have-play', icon: '🎭', title: 'You Have a Play, I Have a Stage', subtitle: 'The platform supports your vision', content: '**"You have a Play, I have a Stage."**\n\nYou bring your product, service, or idea. The platform provides:\n• Transparent pricing infrastructure\n• Payment processing\n• Customer trust through C+20 verification\n• Marketing through the member network\n\n**The stage metaphor:**\nYour business is the performance. We provide the venue, lighting, and audience. You keep 83.3% of every ticket sale.' },
      { id: 'pick-item', icon: '1️⃣', title: 'Step 1: Pick ONE Item', subtitle: 'Start simple', content: 'Choose a single product or service to try C+20 pricing on. Something simple, low-risk.\n\n**Calculate your true cost** for that item:\n• Materials/ingredients\n• Your labor (hourly rate × time)\n• Overhead share (rent, utilities, tools)\n\n**Why start with one?** Test the waters before diving in.' },
      { id: 'calculate-price', icon: '2️⃣', title: 'Step 2: Calculate Price', subtitle: 'Add exactly 20%', content: 'Take your true cost and add exactly 20%. That\'s your C+20 price.\n\n**Example:**\n• True cost: $100\n• C+20 price: $120\n• You keep: $100 (your cost)\n• Platform: $20 (the +20%)\n\n**Use our Cost Calculator** to verify your numbers and get a C+20 certification badge.' },
      { id: 'list-alongside', icon: '3️⃣', title: 'Step 3: List It', subtitle: 'Offer both options', content: 'Offer the C+20 version alongside your regular pricing. Let customers choose.\n\n**Create a listing** that explains:\n• What the product/service is\n• Your transparent cost breakdown\n• Why you chose C+20 pricing\n\n**Customers appreciate transparency** — many will choose C+20 even if it\'s slightly higher.' },
      { id: 'track-compare', icon: '4️⃣', title: 'Step 4: Track Results', subtitle: 'Compare for 30 days', content: 'Run both prices for 30 days. Track:\n• Which version sells better\n• Customer feedback and questions\n• Your actual costs vs estimates\n\n**Log sales in your dashboard** to see the comparison. Adjust your cost calculations if needed.' },
    ]
  },
  {
    id: 'back-project',
    title: 'Back a Project',
    icon: '🌱',
    topics: [
      { id: 'preorder-pledge', icon: '🎁', title: 'PreOrder Pledge', subtitle: 'Fund before it exists', content: '**PreOrder Pledge — Back a Patent**\n\nThis is how innovation gets funded on the platform.\n\n**PreOrder Pledge:**\nCommit to buy a product/service when it\'s ready. You\'re not paying now — just reserving. This helps creators know there\'s demand before they contribute time.\n\n**Back a Patent:**\nSome innovations are available as fractional patent participation. Participate in the intellectual property and share in licensing revenue.' },
      { id: 'browse-projects', icon: '🔎', title: 'Browse Projects', subtitle: 'Find innovations', content: 'Projects range from physical products to software to services.\n\n**Each project shows:**\n• What they\'re building\n• How much they need to start\n• Current pledge count\n• Creator\'s track record\n\n**Filter by:**\n• Category (tech, food, art, etc.)\n• Funding stage\n• Your interests' },
      { id: 'how-pledges-work', icon: '🤝', title: 'How Pledges Work', subtitle: 'No payment until delivery', content: '**You don\'t pay until the project delivers.**\n\nWhen you pledge:\n1. Your commitment is recorded\n2. Creator sees demand is real\n3. When ready, you\'re notified\n4. Then you complete the purchase\n\n**If project fails:** Your pledge is released, no charge.\n\n**Why this works:** Creators get validation before committing resources. Backers get products they actually want.' },
      { id: 'patent-contribution', icon: '📜', title: 'Patent Sponsorship', subtitle: 'Participate in intellectual property', content: '**Sponsor patents, share in licensing.**\n\nThe platform has 2,097 formal patent claims across 11 provisional applications. Some are available for fractional participation.\n\n**What you get:**\n• Fractional participation in the patent\n• Share of any licensing revenue\n• Voting rights on licensing decisions\n\n**This is real IP sponsorship** — not speculation. Patents are legal property with enforceable rights.' },
    ]
  },
];

export interface HelpDialogData {
  title: string;
  content: string;
  actionLabel?: string;
  onProceed?: () => void;
  // Type for "don't show again" feature - if provided, shows checkbox
  dialogType?: HelpDialogType;
}

// Context types for automatic category switching
export type HelpContext = 
  | 'start-page'      // Main landing page
  | 'action-options'  // Choose your path page
  | 'get-job'         // Get a job section
  | 'build-business'  // Build a business section
  | 'back-project';   // Back a project section

interface ShowMeHelpProps {
  isOpen: boolean;
  onRequestClose: () => void;
  helpDialog: HelpDialogData | null;
  onCloseHelpDialog: () => void;
  onProceedHelpDialog: () => void;
  // Current context - determines which category to show
  currentContext?: HelpContext;
}

export function ShowMeHelp({ isOpen, onRequestClose, helpDialog, onCloseHelpDialog, onProceedHelpDialog, currentContext = 'start-page' }: ShowMeHelpProps) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('getting-started');
  const [activeTopic, setActiveTopic] = useState<string>('welcome');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [topicDialog, setTopicDialog] = useState<{ title: string; content: string } | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [dismissedCount, setDismissedCount] = useState(getDismissedCount());

  // Map context to category
  const contextToCategoryMap: Record<HelpContext, string> = {
    'start-page': 'getting-started',
    'action-options': 'choose-path', // Shows all 3 paths, use choose-path category
    'get-job': 'get-job',
    'build-business': 'build-business',
    'back-project': 'back-project',
  };

  // Update category when context changes
  useEffect(() => {
    const targetCategory = contextToCategoryMap[currentContext];
    if (targetCategory && targetCategory !== activeCategory) {
      setActiveCategory(targetCategory);
      const category = CATEGORIES.find(c => c.id === targetCategory);
      if (category && category.topics.length > 0) {
        setActiveTopic(category.topics[0].id);
      }
    }
  }, [currentContext]);

  // Reset "don't show again" checkbox when dialog changes
  useEffect(() => {
    setDontShowAgain(false);
  }, [helpDialog]);

  // Handle closing dialog with potential dismissal
  function handleCloseWithDismiss() {
    if (dontShowAgain && helpDialog?.dialogType) {
      dismissHelpType(helpDialog.dialogType);
      setDismissedCount(getDismissedCount());
    }
    onCloseHelpDialog();
  }

  // Handle proceeding with potential dismissal
  function handleProceedWithDismiss() {
    if (dontShowAgain && helpDialog?.dialogType) {
      dismissHelpType(helpDialog.dialogType);
      setDismissedCount(getDismissedCount());
    }
    onProceedHelpDialog();
  }

  // Reset all dismissed types
  function handleResetDismissed() {
    resetDismissedTypes();
    setDismissedCount(0);
    setShowSettingsMenu(false);
  }

  if (!isOpen) return null;

  const currentCategory = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
  const topicIndex = currentCategory.topics.findIndex(t => t.id === activeTopic);
  const totalTopics = currentCategory.topics.length;

  const prevTopic = topicIndex > 0 ? currentCategory.topics[topicIndex - 1] : null;
  const nextTopic = topicIndex < totalTopics - 1 ? currentCategory.topics[topicIndex + 1] : null;

  function handleCategoryChange(categoryId: string) {
    setActiveCategory(categoryId);
    const category = CATEGORIES.find(c => c.id === categoryId);
    if (category && category.topics.length > 0) {
      setActiveTopic(category.topics[0].id);
    }
    setCategoryDropdownOpen(false);
  }

  function handleTopicClick(topic: typeof currentCategory.topics[0]) {
    setActiveTopic(topic.id);
    setTopicDialog({ title: topic.title, content: topic.content });
  }

  function handlePrevious() {
    if (prevTopic) {
      setActiveTopic(prevTopic.id);
    } else {
      onRequestClose();
    }
  }

  function handleNext() {
    if (nextTopic) {
      setActiveTopic(nextTopic.id);
    }
  }

  const actionButtons = [
    { icon: Save, label: 'Save', onClick: () => {} },
    { icon: Share2, label: 'Share', onClick: () => {} },
    { icon: Bookmark, label: 'Bookmark', onClick: () => {} },
    { icon: Printer, label: 'Print', onClick: () => {} },
    { icon: Settings, label: 'Settings', onClick: () => setShowSettingsMenu(!showSettingsMenu) },
    { icon: MessageSquare, label: 'Feedback', onClick: () => {} },
    { icon: Telescope, label: "Crow's Nest", onClick: () => { onRequestClose(); navigate('/crows-nest'); } },
  ];

  // Render markdown-style bold
  function renderContent(content: string) {
    return content.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} style={{ margin: '0.4rem 0' }}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} style={{ color: '#f59e0b' }}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  }

  return (
    <>
      {/* Frame container */}
      <div className="showme-help-frame">
        {/* Instruction Banner - at top below header */}
        <div className="showme-help-banner">
          👆 Click on any element to learn about it before using it
        </div>

        {/* Header Bar */}
        <header className="showme-help-header">
          <div className="showme-help-header-left">
            <Flame className="showme-help-flame" />
            <div 
              className="showme-help-category-dropdown"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            >
              <span className="showme-help-category-icon">{currentCategory.icon}</span>
              <span className="showme-help-category-title">{currentCategory.title}</span>
              <ChevronDown className={`showme-help-chevron ${categoryDropdownOpen ? 'open' : ''}`} />
            </div>
            {categoryDropdownOpen && (
              <div className="showme-help-category-menu">
                {CATEGORIES.map((cat) => (
                  <div 
                    key={cat.id}
                    className={`showme-help-category-item ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    <span className="showme-help-category-item-icon">{cat.icon}</span>
                    <span>{cat.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="showme-help-header-center">
            <span className="showme-help-counter">{topicIndex + 1} of {totalTopics}</span>
          </div>
          
          <button className="showme-help-exit" onClick={onRequestClose}>
            <X className="w-4 h-4" />
            Exit
          </button>
        </header>

        {/* Sidebar */}
        <aside className="showme-help-sidebar">
          {currentCategory.topics.map((topic, index) => (
            <button
              key={topic.id}
              className={`showme-help-sidebar-item ${activeTopic === topic.id ? 'active' : ''}`}
              onClick={() => handleTopicClick(topic)}
            >
              <span className="showme-help-item-number">{index + 1}</span>
              <span className="showme-help-item-icon">{topic.icon}</span>
              <div className="showme-help-item-text">
                <div className="showme-help-item-title">{topic.title}</div>
                <div className="showme-help-item-subtitle">{topic.subtitle}</div>
              </div>
            </button>
          ))}
        </aside>

        {/* Footer Bar */}
        <footer className="showme-help-footer">
          <div className="showme-help-footer-left">
            <button className="showme-help-nav-btn prev" onClick={handlePrevious}>
              ← {prevTopic ? 'Previous' : 'Exit'}
            </button>
            <span className="showme-help-nav-label">
              {prevTopic ? prevTopic.title : 'Close Help'}
            </span>
          </div>

          <div className="showme-help-footer-center" style={{ position: 'relative' }}>
            {actionButtons.map((btn, index) => (
              <button
                key={index}
                className={`showme-help-action-btn ${btn.label === 'Settings' && showSettingsMenu ? 'active' : ''}`}
                title={btn.label}
                onClick={btn.onClick}
              >
                <btn.icon className="w-4 h-4" />
                <span className="showme-help-action-label">{btn.label}</span>
              </button>
            ))}
            
            {/* Settings Menu */}
            {showSettingsMenu && (
              <div className="showme-settings-menu">
                <div className="showme-settings-header">
                  <Settings className="w-4 h-4" />
                  <span>Help Settings</span>
                </div>
                <div className="showme-settings-item">
                  <div className="showme-settings-item-info">
                    <span className="showme-settings-item-title">Dismissed Reminders</span>
                    <span className="showme-settings-item-count">{dismissedCount} type{dismissedCount !== 1 ? 's' : ''} hidden</span>
                  </div>
                  <button 
                    className="showme-settings-reset-btn"
                    onClick={handleResetDismissed}
                    disabled={dismissedCount === 0}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset All
                  </button>
                </div>
                <p className="showme-settings-hint">
                  When you check "Don't show again" on help dialogs, they're hidden. Reset to see them all again.
                </p>
              </div>
            )}
          </div>

          <div className="showme-help-footer-right">
            <span className="showme-help-nav-label">
              {nextTopic ? nextTopic.title : ''}
            </span>
            <button 
              className="showme-help-nav-btn next"
              disabled={!nextTopic}
              onClick={handleNext}
            >
              Next →
            </button>
          </div>
        </footer>
      </div>

      {/* Help Dialog - appears when clicking page elements */}
      {helpDialog && (
        <div className="showme-help-dialog-overlay" onClick={handleCloseWithDismiss} onKeyDown={(e) => { if (e.key === 'Escape') handleCloseWithDismiss(); }} role="button" tabIndex={0} aria-label="Close help dialog">
          <div className="showme-help-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="showme-help-dialog-title">{helpDialog.title}</h3>
            <div className="showme-help-dialog-content">
              {renderContent(helpDialog.content)}
            </div>
            
            {/* "Don't show again" checkbox - only for typed dialogs */}
            {helpDialog.dialogType && (
              <label className="showme-help-dismiss-checkbox">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                />
                <span>Don't show {helpDialog.dialogType === 'lock' ? 'lock reminders' : 'this type'} again</span>
              </label>
            )}
            
            <div className="showme-help-dialog-buttons">
              <button 
                className="showme-help-dialog-btn secondary"
                onClick={handleCloseWithDismiss}
              >
                Go Back
              </button>
              {helpDialog.actionLabel && helpDialog.onProceed && (
                <button 
                  className="showme-help-dialog-btn primary"
                  onClick={handleProceedWithDismiss}
                >
                  {helpDialog.actionLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Topic Dialog - appears when clicking sidebar topics */}
      {topicDialog && (
        <div className="showme-help-dialog-overlay" onClick={() => setTopicDialog(null)}>
          <div className="showme-help-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="showme-help-dialog-title">{topicDialog.title}</h3>
            <div className="showme-help-dialog-content">
              {renderContent(topicDialog.content)}
            </div>
            <div className="showme-help-dialog-buttons">
              <button 
                className="showme-help-dialog-btn primary"
                onClick={() => setTopicDialog(null)}
              >
                Ok, Thanks
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ShowMeHelp;
