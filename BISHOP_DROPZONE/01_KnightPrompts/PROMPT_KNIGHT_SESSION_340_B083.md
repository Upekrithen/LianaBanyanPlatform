# K340: hexisle.lianabanyan.com DNS + Custom Domain Setup
# Priority: HIGH — domain is currently NXDOMAIN

## Objective
Attach custom domain hexisle.lianabanyan.com to the Firebase hosting site 'hexisle'.

## Current State
- Firebase site 'hexisle' exists (confirmed: firebase hosting:sites:list)
- Default URL https://hexisle.web.app works and serves correct content
- hexisle.lianabanyan.com returns NXDOMAIN — no DNS record exists

## Steps
1. Run: firebase hosting:channel:list --site hexisle (check for existing channels)
2. In Firebase Console > Hosting > hexisle > Custom domains
3. Add hexisle.lianabanyan.com
4. Follow DNS instructions (likely CNAME hexisle.lianabanyan.com → hexisle.web.app)
5. Or if using Cloudflare/other DNS: add the A records Firebase provides
6. Wait for SSL certificate provisioning
7. Verify: nslookup hexisle.lianabanyan.com resolves
8. Verify: https://hexisle.lianabanyan.com loads correctly

## Also check these domains while at it:
- lianabanyan.com (should be working)
- the2ndsecond.com
- hexisle.com / hexislo.com
- upekrithen.com

## Validation
- nslookup hexisle.lianabanyan.com returns valid A/CNAME record
- https://hexisle.lianabanyan.com loads HexIsle content
- SSL certificate valid
