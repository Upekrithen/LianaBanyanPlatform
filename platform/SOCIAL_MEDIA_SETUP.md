# Social Media Integration Setup

## Edge Functions Deployed

| Function | Status | Purpose |
|----------|--------|---------|
| `social-post` | ✅ Deployed | Immediate posting to connected accounts |
| `social-oauth-callback` | ✅ Deployed | Handles OAuth token exchange |
| `process-scheduled-posts` | ✅ Deployed | Cron-based scheduled posting |

## Supported Platforms

| Platform | Text Posts | Image Posts | Video Posts | OAuth |
|----------|-----------|-------------|-------------|-------|
| Twitter/X | ✅ | 🔧 Planned | 🔧 Planned | OAuth 2.0 |
| LinkedIn | ✅ | 🔧 Planned | 🔧 Planned | OAuth 2.0 |
| Facebook | ✅ | 🔧 Planned | 🔧 Planned | OAuth 2.0 |
| Bluesky | ✅ | 🔧 Planned | ❌ | App Password |
| TikTok | ❌ | ❌ | ✅ Required | OAuth 2.0 |
| Instagram | ❌ | ✅ Required | ✅ | OAuth 2.0 |
| Threads | ✅ | 🔧 Planned | 🔧 Planned | OAuth 2.0 |

## Secrets Configured

All OAuth credentials are set in Supabase Edge Function secrets:
- `TWITTER_CLIENT_ID` ✅
- `TWITTER_CLIENT_SECRET` ✅
- `LINKEDIN_CLIENT_ID` ✅
- `LINKEDIN_CLIENT_SECRET` ✅
- `FACEBOOK_APP_ID` ✅
- `FACEBOOK_APP_SECRET` ✅
- `SITE_URL` ✅ (https://lianabanyan.com)

**Need to add when available:**
- `TIKTOK_CLIENT_KEY`
- `TIKTOK_CLIENT_SECRET`
- `BLUESKY_SERVICE` (optional, defaults to https://bsky.social)

## Database Tables

| Table | Status |
|-------|--------|
| `member_social_accounts` | ✅ Ready |
| `member_scheduled_posts` | ✅ Ready |

## External Configuration Required

**Universal Callback URL** (add to all platforms):
```
https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/social-oauth-callback
```

### Twitter/X Developer Portal
URL: https://developer.twitter.com/en/portal/dashboard

1. Go to your app settings
2. Add the callback URL above
3. Ensure these permissions are enabled:
   - Read and write
   - Request email from users
4. Enable OAuth 2.0

### LinkedIn Developer Portal
URL: https://www.linkedin.com/developers/apps

1. Go to Auth settings
2. Add the callback URL above
3. Ensure `w_member_social` scope is approved

### Facebook/Meta Developer Portal
URL: https://developers.facebook.com/apps

1. Go to Facebook Login > Settings
2. Add the callback URL above
3. Ensure these permissions are approved:
   - `pages_manage_posts`
   - `pages_read_engagement`

### Instagram (via Facebook App)
URL: https://developers.facebook.com/apps

1. Add Instagram Basic Display product to your app
2. Add the callback URL above
3. Request these permissions:
   - `instagram_basic`
   - `instagram_content_publish` (requires app review)

### TikTok Developer Portal
URL: https://developers.tiktok.com/

1. Create an app with "Login Kit" and "Content Posting API"
2. Add the callback URL above
3. Request these scopes:
   - `user.info.basic`
   - `video.publish`
   - `video.upload`
4. Set these secrets in Supabase:
   ```bash
   npx supabase secrets set TIKTOK_CLIENT_KEY="your_key" TIKTOK_CLIENT_SECRET="your_secret"
   ```

### Threads (via Facebook App)
URL: https://developers.facebook.com/apps

1. Add Threads API product to your app
2. Add the callback URL above
3. Request these permissions:
   - `threads_basic`
   - `threads_content_publish`

### Bluesky
Bluesky uses App Passwords instead of OAuth. Users enter their handle and app password directly.

1. Go to https://bsky.app/settings/app-passwords
2. Create a new app password
3. Use handle + app password in the connection dialog

## How It Works

### Connecting an Account
1. User clicks "Connect Twitter" in Hofund Studio
2. Popup opens to Twitter authorization
3. User approves
4. Twitter redirects to `social-oauth-callback`
5. Edge function exchanges code for token
6. Token stored in `member_social_accounts`
7. Popup closes, UI refreshes

### Posting
1. User types post in Hofund Studio
2. Clicks "Post to Twitter"
3. Frontend calls `postToSocial()` from `socialOAuth.ts`
4. This invokes the `social-post` edge function
5. Edge function retrieves user's stored token
6. Posts to Twitter API
7. Returns success/failure + post URL

### Scheduled Posts
1. User schedules a post
2. Saved to `member_scheduled_posts` table
3. `process-scheduled-posts` runs every 5 minutes (cron)
4. Picks up due posts and sends them

## Testing

### Manual Test (requires login to lianabanyan.com)
1. Go to https://lianabanyan.com/HofundStudio
2. Click "Connect Twitter"
3. Authorize the app
4. Compose a test post
5. Click "Post"

### Via API (for developers)
```bash
# This requires a user's access token, not the anon key
curl -X POST https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/social-post \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"platform":"twitter","text":"Hello from Liana Banyan!"}'
```

## Client-Side Code

The social media functionality is in:
- `platform/src/lib/socialOAuth.ts` - OAuth flows and posting
- `platform/src/pages/HofundStudio.tsx` - UI for composing posts

## Platform Notes

| Platform | Notes |
|----------|-------|
| **TikTok** | Video-only platform. Text posts not supported. Must provide `videoUrl`. |
| **Instagram** | Image/video required. Text-only posts not supported. Must provide `imageUrl`. |
| **Bluesky** | Uses AT Protocol with App Passwords (not OAuth). User enters handle + app password. |
| **Threads** | Supports text posts. Uses same Meta/Facebook app credentials. |

## API Limitations

- **Twitter/X**: 17 tweets/15 min for free tier, 100/day for basic
- **LinkedIn**: 100 posts/day
- **Facebook**: Varies by page
- **TikTok**: 3 videos/day for new apps, increases with approval
- **Instagram**: 25 media objects/day
- **Bluesky**: Rate limits apply but generous for typical use
