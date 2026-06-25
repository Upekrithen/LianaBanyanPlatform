# MnemosyneC v0.5.0 — Install + Substrate Awakens Mesh Test

**Hi — here's the order to do this. Don't skip step 2.**

## 1. Install
- Run `MnemosyneC-Setup-0.5.0.exe`
- Click through the installer normally

## 2. CLOSE AND REOPEN MnemosyneC (do not skip)
- After install finishes, completely close the app (X-out + check system tray)
- Wait 5 seconds
- Reopen MnemosyneC
- (This is because Electron auto-update doesn't fully reset the window state — known issue, Founder canon BP083)

## 3. If you see BLANK TABS or nothing loads
- Close MnemosyneC again
- Press `Win+R` → type `%APPDATA%\mnemosynec` → press Enter
- Delete the entire `mnemosynec` folder (lowercase — that's the one)
- Relaunch MnemosyneC
- (This wipes the stuck onboarding state — Founder canon BP083, son's-machine empirical receipt June 12)

## 4. Onboarding screens
- Follow the onboarding tabs in order
- Tab labels in the regular UI (not Advanced)
- When you get to **Test It Out**, that's where Substrate Awakens token flow lives

## 5. Substrate Awakens — Mesh Test
- On the Test It Out tab, look for the **Substrate Awakens** card
- Click "Join Mesh" or similar — exact wording may vary
- The card walks through: get token → enter token → confirm peer presence
- When peer_presence row writes back successfully, you're LIVE on the mesh

## 6. Auto-update from here on
- v0.5.0 will auto-update to whatever Knight ships next
- You don't need to do anything for future versions
- If you ever want to switch update channel: open MnemosyneC → click "Manage update channel →" link → goes to mnemosynec.ai/download#channel

## If anything breaks
- Screenshot what you see
- Send it to Dad
- Don't try to fix it yourself — it's likely a known bug, will save time

That's it. Steps 2 and 3 are the most-skipped — please don't skip them.

— Dad's AI substrate
