# Testing Checklist & Quality Assurance

**Last Updated**: 2025-10-17  
**Platform**: Liana Banyan Multi-Portal System  
**Test Environment**: Staging → Production

---

## 🧪 Testing Methodology

### Test Levels
1. **Unit Tests**: Individual component logic (automated)
2. **Integration Tests**: Component interactions (automated + manual)
3. **System Tests**: End-to-end user flows (manual)
4. **Acceptance Tests**: Business requirements validation (manual)
5. **Regression Tests**: Verify no existing features broken (automated + manual)

### Test Environments
- **Local Development**: `localhost:8080`
- **Staging**: `staging-[portal].lianabanyan.com`
- **Production**: `[portal].lianabanyan.com`

### Browsers & Devices
**Desktop**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Mobile**:
- [ ] iOS Safari (iPhone 12+)
- [ ] Android Chrome (Pixel 6+)
- [ ] iOS Safari (iPad)
- [ ] Android Chrome (Tablet)

---

## 🔐 Authentication & Authorization Testing

### User Registration
- [ ] **Sign up with email**: Verify email validation, password strength requirements
- [ ] **Email confirmation**: Check inbox, spam folder, confirmation link works
- [ ] **Duplicate email**: Error message displayed correctly
- [ ] **Weak password**: Validation prevents < 8 characters, no symbols
- [ ] **Auto-confirm enabled**: (Staging only) Users can login immediately after signup

### User Login
- [ ] **Valid credentials**: Successful login, redirect to dashboard
- [ ] **Invalid credentials**: Clear error message, no sensitive info leaked
- [ ] **Forgot password**: Email sent, reset link works, password updated
- [ ] **Session persistence**: User stays logged in after browser close (if selected)
- [ ] **Session timeout**: User logged out after inactivity (if configured)

### Authorization & Roles
- [ ] **Free member**: Access to limited features, credit purchase prompts visible
- [ ] **Paid member**: Access to premium features, no restrictions
- [ ] **Guild member**: Access to guild-specific pages (Guilds, Clans)
- [ ] **Admin**: Access to admin panels (Role Management, Position Management)
- [ ] **Multi-portal access**: User can switch between portals seamlessly

### Profile Management
- [ ] **Update profile**: Name, bio, avatar upload works
- [ ] **Change password**: Old password required, new password validated
- [ ] **Delete account**: Confirmation dialog, data removed correctly
- [ ] **Profile visibility**: Privacy settings respected (public/private)

---

## 🌐 Portal-Specific Testing

### Marketplace Portal (`marketplace.lianabanyan.com`)

#### Browse & Search
- [ ] **Product listings**: Display correctly with images, prices, descriptions
- [ ] **Category filter**: Filter works, results update in real-time
- [ ] **Search functionality**: Returns relevant results, handles typos gracefully
- [ ] **Pagination**: Load more / infinite scroll works
- [ ] **Sort options**: Price (low-high), popularity, newest

#### Product Details
- [ ] **Product page**: Images load, description rendered, price displayed
- [ ] **Add to cart**: Item added, cart count updates
- [ ] **Wave selection**: Multiple waves displayed with pricing, delivery estimates
- [ ] **Stock availability**: Shows "Out of stock" when applicable

#### Checkout & Payments
- [ ] **Cart review**: Items listed, quantities adjustable, subtotal correct
- [ ] **Credit balance check**: Sufficient credits → proceed, insufficient → purchase prompt
- [ ] **Credit purchase flow**: Stripe checkout opens, payment processes, credits added
- [ ] **Order confirmation**: Email sent, order ID generated, receipt available
- [ ] **Transaction history**: Order appears in user's history

---

### Business Portal (`business.lianabanyan.com`)

#### Project Management
- [ ] **Create project**: Form validation, all fields required, submission successful
- [ ] **Edit project**: Changes saved, real-time updates reflected
- [ ] **Delete project**: Confirmation required, project removed
- [ ] **Project visibility**: Public/private settings work correctly
- [ ] **Project categories**: Assign categories, filter by category works

#### Position Management
- [ ] **Create position**: Job title, description, compensation, category set
- [ ] **Activate/deactivate**: Position status toggles, applications enabled/disabled
- [ ] **Application review**: View applicants, approve/reject with feedback
- [ ] **Position assignment**: Assign approved applicant, notification sent

#### Contract Management
- [ ] **Contract creation**: Terms defined, parties selected, signatures required
- [ ] **Contract signing**: Digital signature captured, timestamp recorded
- [ ] **Contract execution**: Payment released upon completion, milestones tracked
- [ ] **Dispute resolution**: Dispute flagged, admin notified, resolution workflow

---

### Network Portal (`network.lianabanyan.com`)

#### Profile & Networking
- [ ] **Profile setup**: Skills, interests, portfolio added
- [ ] **Peer discovery**: Search members by skills, location, interests
- [ ] **Connection requests**: Send, accept, decline works
- [ ] **Messaging**: Direct messages sent/received, notifications work

#### Peer Contracts
- [ ] **Create peer contract**: Terms set, collaborator invited
- [ ] **Contract negotiation**: Both parties can propose edits
- [ ] **Contract approval**: Both parties sign, contract active
- [ ] **Performance tracking**: Milestones logged, reputation updated

---

### Nonprofit Portal (`nonprofit.lianabanyan.com`)

#### Nonprofit Management
- [ ] **Register nonprofit**: Org name, mission, tax ID, documentation upload
- [ ] **Profile verification**: Admin review process, approval/rejection
- [ ] **Donation page**: Stripe integration, donation tiers displayed
- [ ] **Donor tracking**: Donor list, donation amounts, receipts generated

#### Fundraising Campaigns
- [ ] **Create campaign**: Goal set, description, images uploaded
- [ ] **Progress tracking**: Donation totals update in real-time
- [ ] **Campaign updates**: Posts visible to donors
- [ ] **Campaign completion**: Thank you emails sent automatically

---

## 💰 Credit System Testing

### Credit Purchase
- [ ] **Purchase flow**: Select amount, Stripe checkout opens
- [ ] **Payment processing**: Payment succeeds, credits added immediately
- [ ] **Payment failure**: Error handled gracefully, user notified, retry option
- [ ] **Receipt generation**: Email sent with transaction details
- [ ] **Transaction log**: Entry created in member_transactions table

### Credit Usage
- [ ] **Deduct credits**: Marketplace purchase, position application, guild stake
- [ ] **Insufficient credits**: Prompt to purchase more, transaction blocked
- [ ] **Credit balance display**: Real-time updates across all portals
- [ ] **Transaction history**: All credit movements logged with timestamps

### Credit Withdrawal
- [ ] **Request withdrawal**: Form submission, minimum balance enforced
- [ ] **Processing time**: Status updates (pending → processing → completed)
- [ ] **Bank transfer**: Funds arrive within estimated timeframe
- [ ] **Withdrawal limits**: Daily/monthly caps enforced

---

## 🎮 HexIsle Gamification Testing

### Island Navigation
- [ ] **7 Islands displayed**: Harvest, Navigate, Engineer, Battle, Seek, Magic, Train
- [ ] **Island selection**: Click to view details, skills, quests
- [ ] **Locked islands**: Progress requirements shown, locked until prereqs met
- [ ] **Island themes**: Visual assets load, descriptions render

### Skill Progression
- [ ] **XP earning**: Complete tasks → XP awarded → level up
- [ ] **Skill tree**: View skill paths, unlock new abilities
- [ ] **Guild XP**: Team XP pools, shared progression
- [ ] **Leaderboard**: Top players/guilds ranked correctly

### Casual vs. Real Stakes Mode
- [ ] **Casual mode**: Play freely, no real-world impact
- [ ] **Real stakes mode**: Projects mapped to islands, verified XP earned
- [ ] **Mode switching**: Toggle between modes, progress separated

---

## 🏰 Guild & Clan Testing

### Guild Management
- [ ] **Create guild**: Name, description, emblem upload, charter defined
- [ ] **Guild discovery**: Browse guilds, search by category/skills
- [ ] **Join guild**: Request sent, admin approval, member added
- [ ] **Guild roles**: Leader, officer, member permissions enforced
- [ ] **Guild bank**: Credit pool, spending approval, transaction log

### Guild Staking
- [ ] **Stake payment**: Select stake tier ($50, $100, $250, $500, $1000)
- [ ] **Stake confirmation**: Stripe payment, stake recorded, membership activated
- [ ] **Stake benefits**: Access to guild features, voting rights, IP participation
- [ ] **Stake expiration**: Reminders sent, auto-deactivate if not renewed

### Clan System
- [ ] **Create clan**: Sub-guild within guild, specialization defined
- [ ] **Clan missions**: Assign quests, track completion, rewards distributed
- [ ] **Clan charter**: Define rules, voting procedures, leadership structure
- [ ] **Clan competition**: Clan vs. clan challenges, leaderboards

---

## 📊 Admin & Management Testing

### Role Management
- [ ] **Assign roles**: Select user, assign role (admin, moderator, member)
- [ ] **Role permissions**: Verify access control, feature restrictions
- [ ] **Bulk role assignment**: CSV upload, mass role updates

### Position Categories
- [ ] **Create category**: Name, description, icon, active status
- [ ] **Edit category**: Changes saved, positions re-categorized
- [ ] **Delete category**: Confirmation required, positions reassigned

### Analytics Dashboard
- [ ] **User stats**: Total users, active users (DAU/MAU), growth rate
- [ ] **Transaction stats**: Total transactions, volume, average value
- [ ] **Project stats**: Total projects, completion rate, category breakdown
- [ ] **Real-time updates**: Metrics refresh automatically

---

## 🔒 Security Testing

### Input Validation
- [ ] **SQL injection**: Forms sanitized, no raw SQL execution
- [ ] **XSS attacks**: HTML/JS injection blocked
- [ ] **File upload**: Only allowed file types accepted, size limits enforced
- [ ] **CSRF protection**: Tokens validated on state-changing requests

### RLS Policies
- [ ] **User data isolation**: User A cannot access User B's private data
- [ ] **Project visibility**: Private projects hidden from non-members
- [ ] **Admin-only tables**: Non-admins cannot read/write restricted tables
- [ ] **Transaction authorization**: Credit deductions require user ownership

### Authentication Security
- [ ] **Password hashing**: Passwords stored securely (bcrypt/scrypt)
- [ ] **Session hijacking**: Tokens expire, secure cookies enabled
- [ ] **Brute force protection**: Rate limiting on login attempts
- [ ] **2FA (if implemented)**: TOTP codes validated correctly

---

## ⚡ Performance Testing

### Page Load Times
- [ ] **Homepage**: < 2 seconds (desktop), < 3 seconds (mobile)
- [ ] **Dashboard**: < 1.5 seconds (cached user data)
- [ ] **Product listing**: < 2 seconds (with images)
- [ ] **Checkout flow**: < 1 second per step

### API Response Times
- [ ] **GET requests**: < 500ms (database queries)
- [ ] **POST requests**: < 1s (create operations)
- [ ] **Edge functions**: < 2s (external API calls)
- [ ] **Real-time updates**: < 100ms latency

### Stress Testing
- [ ] **100 concurrent users**: No performance degradation
- [ ] **500 concurrent users**: Response times < 2x baseline
- [ ] **1000 concurrent users**: Graceful degradation, no crashes
- [ ] **Database load**: Query performance stable under load

---

## 📱 Mobile & PWA Testing

### Responsive Design
- [ ] **Mobile layout**: All pages render correctly on small screens
- [ ] **Touch targets**: Buttons, links > 44px tap area
- [ ] **Forms**: Input fields accessible, keyboard doesn't obscure fields
- [ ] **Navigation**: Mobile menu functional, easy to use

### PWA Installation
- [ ] **iOS Safari**: "Add to Home Screen" prompt appears
- [ ] **Android Chrome**: Install banner appears
- [ ] **App icon**: Displays correctly on home screen
- [ ] **Splash screen**: Shows during app launch

### Offline Functionality
- [ ] **Service worker**: Caches critical assets
- [ ] **Offline fallback**: User-friendly offline page displayed
- [ ] **Sync on reconnect**: Queued actions execute when online
- [ ] **Notification**: User notified when back online

---

## 🧩 Integration Testing

### Third-Party Services

#### Stripe Integration
- [ ] **Test mode**: Payments processed with test cards
- [ ] **Live mode**: Real payments captured successfully
- [ ] **Webhooks**: Payment events trigger backend updates
- [ ] **Refunds**: Refund flow works, credits adjusted

#### Email Service (Supabase)
- [ ] **Transactional emails**: Sent reliably, templates render correctly
- [ ] **Email deliverability**: Emails not marked as spam
- [ ] **Unsubscribe links**: Opt-out respected, user preferences saved

#### File Storage (Supabase)
- [ ] **Upload**: Files uploaded to correct buckets
- [ ] **Download**: Files retrieved with correct permissions
- [ ] **Deletion**: Files removed, storage quota updated
- [ ] **Public access**: Public files accessible via URL

---

## 🐛 Bug Triage & Reporting

### Bug Severity Levels

**P0 - Blocker**
- System completely unusable
- Data loss or corruption
- Security breach

**P1 - Critical**
- Major feature broken
- Workaround exists but difficult
- High impact on users

**P2 - High**
- Important feature impaired
- Workaround available
- Medium impact

**P3 - Medium**
- Minor feature issue
- Easy workaround
- Low impact

**P4 - Low**
- Cosmetic issues
- No functional impact
- Nice-to-fix

### Bug Report Template
```markdown
**Title**: [Brief description]

**Severity**: P0 | P1 | P2 | P3 | P4

**Environment**:
- Portal: Marketplace | Business | Network | Nonprofit
- Browser: Chrome 120 / Firefox 122 / Safari 17 / etc.
- Device: Desktop | Mobile (iOS/Android)

**Steps to Reproduce**:
1. Navigate to [URL]
2. Click [element]
3. Enter [data]
4. Observe [behavior]

**Expected Behavior**: [What should happen]

**Actual Behavior**: [What actually happens]

**Screenshots**: [Attach if applicable]

**Logs**: [Console errors, network errors]

**Workaround**: [If known]
```

---

## ✅ Test Completion Criteria

### Pre-Staging Deployment
- [ ] 100% of critical paths tested (P0/P1)
- [ ] 80%+ of high-priority features tested (P2)
- [ ] 0 P0 bugs, < 5 P1 bugs
- [ ] All automated tests passing

### Pre-Production Deployment
- [ ] 100% of all features tested
- [ ] 0 P0/P1 bugs, < 10 P2 bugs
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Beta user feedback incorporated

---

## 📝 Test Execution Log

| Test Category | Tested By | Date | Pass/Fail | Notes |
|---------------|-----------|------|-----------|-------|
| Authentication | ___ | ___ | ___ | ___ |
| Marketplace Portal | ___ | ___ | ___ | ___ |
| Business Portal | ___ | ___ | ___ | ___ |
| Network Portal | ___ | ___ | ___ | ___ |
| Nonprofit Portal | ___ | ___ | ___ | ___ |
| Credit System | ___ | ___ | ___ | ___ |
| HexIsle | ___ | ___ | ___ | ___ |
| Guilds & Clans | ___ | ___ | ___ | ___ |
| Admin Tools | ___ | ___ | ___ | ___ |
| Security | ___ | ___ | ___ | ___ |
| Performance | ___ | ___ | ___ | ___ |
| Mobile & PWA | ___ | ___ | ___ | ___ |

---

**Testing Status**: Ready to begin systematic testing phase  
**Next Action**: Assign test categories to team members and schedule testing sprints