# KNIGHT SESSION 270 — Security Audit: API_KEYS.md Git Exposure
## Bishop B075 | April 4, 2026
## Priority: SECURITY — Handle before next public push

---

## MISSION

Verify that `Asteroid-ProofVault/05_TECHNICAL_SPECS/API_KEYS.md` is not exposed in any git repository and is properly gitignored. This file was flagged during B075 compilation as a potential credential leak.

---

## CONTEXT

During Bishop B075 compilation of Technical Specs, a file named `API_KEYS.md` was identified in the Vault. If this file contains real API credentials and has ever been committed to git, those credentials may be exposed in repository history (even if deleted in later commits, git history preserves them).

Potential impact:
- Supabase service role keys could grant full database access
- Firebase admin keys could grant hosting deployment access
- Third-party API keys (OpenAI, Anthropic, etc.) could incur billing
- OAuth secrets could enable impersonation attacks

---

## STEP 1: Audit File Contents

Read `Asteroid-ProofVault/05_TECHNICAL_SPECS/API_KEYS.md` and determine:
1. Does it contain REAL credentials (actual keys/tokens/secrets)?
2. Or is it a TEMPLATE/reference with placeholder values only?
3. If real credentials: which services are represented?

## STEP 2: Check Git Exposure

```bash
# Check if file is tracked in any git repo
cd /c/Users/Administrator/Documents/LianaBanyanPlatform
git log --all --full-history -- "Asteroid-ProofVault/05_TECHNICAL_SPECS/API_KEYS.md" 2>/dev/null

# Check .gitignore for coverage
cat .gitignore | grep -i -E "api_keys|credentials|secrets|\.env"

# Check if file would be ignored by current gitignore
git check-ignore -v "Asteroid-ProofVault/05_TECHNICAL_SPECS/API_KEYS.md"
```

## STEP 3: Remediation (if exposed)

**If file contains real credentials AND is in git history:**
1. **Rotate all exposed credentials immediately** (Supabase, Firebase, any third-party)
2. Add to .gitignore if not already
3. Remove from git history using `git filter-repo` or BFG Repo-Cleaner
4. Force-push the cleaned history (coordinate with Founder before force-push)
5. Notify any collaborators to re-clone

**If file contains real credentials BUT is properly gitignored:**
1. Verify .gitignore coverage is comprehensive
2. Recommend moving to a non-archived location (e.g., `.env.local` or a password manager)
3. Document that the file should NEVER be committed

**If file is a template/reference with placeholders only:**
1. Verify no hidden credentials in comments or examples
2. Rename to `API_KEYS_TEMPLATE.md` for clarity
3. Confirm .gitignore still covers it

## STEP 4: Report Findings

Produce a security report with:
- File contents classification (real/template)
- Git exposure status (exposed/safe)
- Credentials rotated (yes/no/not-needed)
- .gitignore coverage (adequate/needs-update)
- Recommended next actions

## STEP 5: Broader .gitignore Audit

Also verify these patterns are in .gitignore:
- `.env` and `.env.*`
- `*_SECRET*`, `*_KEY*`, `*_TOKEN*`
- `credentials.json`
- `service-account*.json`
- `firebase-adminsdk*.json`

## ACCEPTANCE CRITERIA

- [ ] API_KEYS.md contents classified (real vs template)
- [ ] Git exposure status determined
- [ ] Any exposed credentials rotated
- [ ] .gitignore updated if needed
- [ ] Security report delivered to Founder

## DO NOT

- Share API_KEYS.md contents in chat or commit messages
- Force-push to main/master without explicit Founder confirmation
- Skip credential rotation if file was ever committed with real keys
- Rename or move API_KEYS.md until audit is complete
