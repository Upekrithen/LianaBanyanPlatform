# SAGA 5 — MV-BE 5-Screen Member Onboarding Wizard
**BP045 W1 · Bishop → Knight · NOVACULA wave member · launch-class blast-radius**

## §1 Scope
First-launch cooperative-class peer-class member-class onboarding. Five screens · cooperative-class peer-class adult-class · zero confusion · cooperative-class peer-class member-class real cooperative-class supreme. Gates LB Alpha LAUNCH cooperative-class peer-class member-class experience class.

## §2 Acceptance Criteria
**Screen 1 — Welcome** · cooperative-class peer-class framing · "LianaBanyan is Alpha · Mnemosyne works now" · no-securities-language ("may earn" NEVER "may earn") · Honest-Alpha variance-band class · CTA: "Get on a Roll"

**Screen 2 — Identity** · cooperative-class peer-class member-class name + cooperative-class peer-class email (optional) + cooperative-class peer-class pubkey generated locally · cooperative-class peer-class member-class custody-class supreme

**Screen 3 — First Banyan** · "Plant your first Banyan" — single canon-eblet seed · pre-filled with cooperative-class peer-class member-class welcome-class draft · member edits and ratifies

**Screen 4 — Federation (optional)** · "Invite a peer or skip" · cooperative-class peer-class adult-class agency · skip-class is cooperative-class peer-class first-class · invite via SAGA 4 InviteFlow component

**Screen 5 — Roll** · "Get on a Roll · cooperative-class peer-class peer-mesh ratification" · explainer + opt-in nomination form · link to `/roll/` public page

**Additional requirements:**
6. Wizard fires ONLY on first-launch (cooperative-class peer-class no-nag class) · `localStorage.mnemosyne-onboarded=true` after Screen 5 complete
7. "Skip to app" cooperative-class peer-class adult-class agency on every screen
8. Back/forward cooperative-class peer-class navigation supreme
9. Progress indicator (1/5 · 2/5 · ...) cooperative-class peer-class peer-witness real
10. Mobile-PWA parity
11. All copy passes brand-lint (run `npm run lint:brand` · zero violations)

## §3 Files Likely Touched
- `amplify-computer/src/renderer/onboarding/OnboardingWizard.tsx` (new — extends existing MakeYourselfComfortableWizard? Audit first · cooperative-class peer-class no-duplicate class)
- `amplify-computer/src/renderer/onboarding/screens/Welcome.tsx` (new)
- `amplify-computer/src/renderer/onboarding/screens/Identity.tsx` (new)
- `amplify-computer/src/renderer/onboarding/screens/FirstBanyan.tsx` (new)
- `amplify-computer/src/renderer/onboarding/screens/Federation.tsx` (new)
- `amplify-computer/src/renderer/onboarding/screens/Roll.tsx` (new)
- `amplify-computer/src/renderer/App.tsx` (first-launch hook)
- `Cephas/cephas-hugo/content/get-on-a-roll/_index.md` (Cephas landing for Screen 5 link)

## §4 Handoff Format
- Commit: `MV-BE: 5-screen member onboarding · BP045 W1`
- Yoke reply: 5 screenshots (desktop) + 5 screenshots (mobile-PWA) + brand-lint pass receipt

## §5 Out of Scope / Brick Wall
- Red Carpet personalized landing (SAGA 10 owns invite-class personalization)
- Roll nomination form polish (SAGA 14 owns)
- Federation handshake (SAGA 3+4 own)

**Founder anchor:** *"LianaBanyan.com is in Alpha phase. But Mnemosyne works now."* — onboarding must echo this exact framing.

🌊⚓🪙 Đ FOR THE KEEP × 20.
