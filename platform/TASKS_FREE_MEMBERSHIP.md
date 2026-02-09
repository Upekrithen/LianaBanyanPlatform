# Free 30-Day Membership System - Documentation

## Status: ✅ COMPLETED (2025-10-16)

## Overview
Implemented a free 30-day trial membership system that automatically activates on signup without requiring a credit card. Users receive reminders 7 days before expiration and can extend their membership by clicking a confirmation link in their email.

## Database Schema

### Profiles Table (Extended)
Added the following columns to the `profiles` table:
- `membership_status` - Status: 'active', 'expired', or 'inactive'
- `membership_activated_at` - Timestamp when membership was activated
- `membership_expires_at` - Expiration date (30 days from activation)
- `membership_reminder_sent_at` - Last reminder email timestamp
- `membership_confirmation_token` - Unique token for extending membership

### Database Functions
1. **`activate_free_membership(user_id)`** - Manually activate 30-day membership
2. **`extend_membership(confirmation_token)`** - Extend membership by 30 days via token
3. **`deactivate_expired_memberships()`** - Mark expired memberships (runs daily)
4. **`get_membership_reminder_candidates()`** - Get users needing reminders (7 days before expiration)
5. **`mark_reminder_sent(user_id)`** - Track when reminder was sent

### Triggers
- **`auto_activate_membership_trigger`** - Automatically activates 30-day membership on profile creation

## Edge Functions

### `send-membership-reminders`
- **Purpose**: Send reminder emails to users 7 days before membership expires
- **Schedule**: Should run daily via cron job
- **Functionality**:
  - Fetches users with memberships expiring in 7 days
  - Generates unique confirmation URLs with tokens
  - Sends reminder emails (placeholder for actual email service)
  - Marks reminders as sent

### `confirm-membership`
- **Purpose**: Process membership extension requests
- **Trigger**: User clicks confirmation link in reminder email
- **Functionality**:
  - Validates confirmation token
  - Extends membership by 30 days from current expiration
  - Generates new confirmation token for next cycle
  - Returns success/error response

### `deactivate-expired-memberships`
- **Purpose**: Deactivate memberships that have expired
- **Schedule**: Should run daily via cron job
- **Functionality**:
  - Updates all active memberships with `expires_at < now()` to 'expired' status

## UI Components

### `MembershipStatusCard`
- **Location**: Dashboard
- **Features**:
  - Shows membership status (Active/Expired/Inactive)
  - Displays days remaining with progress bar
  - Warns users 7 days before expiration
  - Shows expiration date
  - Color-coded based on status (green/red/gray)

### `MembershipConfirm`
- **Route**: `/membership/confirm?token=xxx`
- **Purpose**: Confirmation page for extending membership
- **Features**:
  - Validates token automatically on page load
  - Shows loading state during confirmation
  - Displays success message with new expiration date
  - Shows error message for invalid/expired tokens
  - Redirects to dashboard after confirmation

## User Flow

### Initial Signup
1. User signs up (no credit card required)
2. `auto_activate_membership` trigger fires
3. Membership status set to 'active'
4. `membership_expires_at` set to 30 days from now
5. Unique confirmation token generated

### 7 Days Before Expiration
1. `send-membership-reminders` edge function runs daily
2. User receives email with confirmation link
3. Email contains: `https://yourdomain.com/membership/confirm?token={unique_token}`
4. User clicks link and lands on `MembershipConfirm` page

### Extending Membership
1. `MembershipConfirm` page calls `confirm-membership` edge function
2. Token validated against database
3. If valid: membership extended by 30 days
4. New token generated for next cycle
5. Success message shown with new expiration date

### Expiration
1. `deactivate-expired-memberships` runs daily
2. Memberships with `expires_at < now()` marked as 'expired'
3. User sees expired status on dashboard
4. User can sign up again to reactivate

## Configuration Needed

### Cron Jobs (Supabase)
Add these to your Supabase project settings:
```
# Send reminders daily at 9 AM
0 9 * * * send-membership-reminders

# Deactivate expired memberships daily at midnight
0 0 * * * deactivate-expired-memberships
```

### Email Service Integration
The `send-membership-reminders` function currently logs emails but doesn't send them. To integrate:
1. Choose an email service (SendGrid, Resend, AWS SES, etc.)
2. Add service API key to Supabase secrets
3. Replace placeholder code with actual email sending:

```typescript
// Example with Resend
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: candidate.email,
  subject: 'Your LianaBanyan membership expires in 7 days',
  html: `
    <h2>Your membership expires soon!</h2>
    <p>Click below to extend your free membership by 30 days:</p>
    <a href="${confirmUrl}">Extend Membership</a>
  `,
});
```

## Security Features

1. **Token-based confirmation**: Each membership has a unique token that changes after each extension
2. **Token validation**: Tokens must match active memberships to be valid
3. **Automatic expiration**: Memberships expire after 30 days without user action
4. **SECURITY DEFINER functions**: Database operations run with elevated privileges to prevent manipulation
5. **RLS policies**: Profile table has row-level security enabled

## Testing

### Manual Testing Steps
1. Create new user account
2. Check `membership_status = 'active'` in profiles table
3. Verify `membership_expires_at` is 30 days from now
4. Manually call `get_membership_reminder_candidates()` to see if user appears 7+ days before expiration
5. Call `confirm-membership` edge function with token
6. Verify membership extended by 30 days
7. Set `membership_expires_at` to past date
8. Call `deactivate-expired-memberships()`
9. Verify status changed to 'expired'

### Automated Testing (Future)
- Unit tests for database functions
- Integration tests for edge functions
- E2E tests for user flow

## Future Enhancements

1. **Email Templates**: Create branded HTML email templates
2. **SMS Reminders**: Add SMS option for critical reminders
3. **Multiple Reminder Options**: Allow users to set reminder preferences (3 days, 7 days, 14 days)
4. **Pause Membership**: Allow users to pause/resume membership
5. **Analytics Dashboard**: Track activation/expiration rates
6. **A/B Testing**: Test different reminder timings and messaging
7. **Referral Incentives**: Offer extended trial for referrals

## Notes

- No payment processing required for free membership
- System fully automated after email service integration
- Users can extend indefinitely by clicking confirmation links
- No limit on number of extensions (intentional design choice)
- Token regeneration prevents reuse of old confirmation links