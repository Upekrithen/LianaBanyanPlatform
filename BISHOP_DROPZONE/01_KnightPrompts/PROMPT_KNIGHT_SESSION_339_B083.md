# K339: SEC Language Audit Pass
# Priority: CRITICAL — must complete before any external publication

## Objective
Scan ALL user-facing strings in platform/src/ for SEC-prohibited language and fix.

## Prohibited Words (in member benefit context)
- "equity" (when describing what members GET)
- "investment" / "invest" (when describing platform participation) 
- "securities" (when describing Credits/Marks/Joules)
- "dividend" / "dividends"
- "return on investment" / "ROI" (except in paper titles)
- "shareholder" / "shares" (in financial context)

## Safe Replacements
- equity → earned benefit, contribution credit, platform benefit
- invest → support, contribute, back
- securities → platform credits (closed-loop)
- dividend → surplus distribution, credit bonus
- ROI → contribution impact
- shareholder → member, contributor

## KEEP AS-IS
- SEC disclaimers that say "NOT equity" or "NOT securities" — those are correct
- Academic paper titles referencing external research
- Comparative analysis ("unlike traditional equity models...")

## Process
1. grep -r for each prohibited word in platform/src/
2. Read each file for context
3. Fix only user-facing strings (not variable names)
4. Run npm run build after each batch
5. Run full build at end

## Validation
- npm run build passes
- No prohibited words remain in user-facing copy (confirmed via grep)
- All SEC disclaimers still intact
