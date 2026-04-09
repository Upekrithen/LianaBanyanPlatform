# K144 ADDENDUM — Medallion as Portal Deck Card
## Bishop 036 | March 27, 2026

---

## ADDITIONAL DELIVERABLE: Medallion in Portal Deck Card Grid

The 2nd Second Medallion should appear as a **PortalDeckCard** (3D flip, same component from K123) in these locations:

### 1. NetworkLanding.tsx — Portal Grid
Add a 7th deck card to the existing 6-portal grid:

```
Front: Side A image (ship + gear + quote)
Back: Side B image (ACME screws + QR + "THE 2ND SECOND INDUSTRIAL REVOLUTION")
Click → /2nd-second
Label: "The 2nd Second"
Subtitle: "The Grand Experiment"
```

Use the same `PortalDeckCard` component. The medallion images should be imported as static assets (save the Founder's provided PNGs to `/public/medallion-side-a.png` and `/public/medallion-side-b.png`).

### 2. ChainDashboardPage.tsx (from K144 Deliverable 3)
Already specified — show as reward at chain = 13. Add:
- Grayed version uses the same images with CSS `filter: grayscale(100%) opacity(0.4)`
- Earned version: full color + gold border glow animation
- Flip enabled only when earned

### 3. SecondSecondLanding.tsx (from K143 Deliverable 4)
Add the medallion as the hero visual:
- Large (300px) flippable medallion centered above the title
- Auto-flips once on page load (Side A → Side B → Side A) to show both sides
- Then responds to hover/tap for manual flip

### 4. WelcomeGatePage.tsx (from K131)
Add a new Red Carpet template: `MedallionScan`
- When someone scans the physical medallion's QR code
- Shows the digital medallion flipping, then fades to reveal:
  - "Welcome to The 2nd Second Industrial Revolution"
  - "The Grand Experiment to Save the World"
  - CTA: "Start Building" → /production
  - CTA: "Learn More" → /2nd-second

### 5. CueCardGeneratorV2.tsx (from K143 Deliverable 3)
The "BUILD A FACTORY" and "CANISTER SYSTEM" templates should use the medallion Side B as the card front image, with the user's personalized QR replacing the generic one.

### 6. Member Helm Profile
Add a "Medallions Earned" section to the member's Helm/profile page. The Ship Medallion is the first entry. Future medallions (Guild medallions, Captain medallions, etc.) can follow the same pattern.

---

## IMAGE ASSETS NEEDED

The Founder has provided the two medallion images. Knight should:
1. Save them to `/public/images/medallion-ship-side-a.png` and `/public/images/medallion-2nd-second-side-b.png`
2. Reference them in all components above
3. Use WebP versions if possible for performance (or let Vite handle optimization)

---

**Fold this into K144 build. FOR THE KEEP.**
