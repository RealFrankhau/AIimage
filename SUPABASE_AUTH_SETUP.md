# Supabase Auth Configuration

## Site URL and Redirect URLs

Go to Supabase Dashboard → Authentication → URL Configuration

### Site URL
Set this to your production URL:
- Development: `http://localhost:3000`
- Production: `https://your-domain.vercel.app`

### Redirect URLs
Add the following URLs (one per line):
```
http://localhost:3000/api/auth/callback
https://your-domain.vercel.app/api/auth/callback
http://localhost:3000/dashboard
https://your-domain.vercel.app/dashboard
http://localhost:3000/reset-password
https://your-domain.vercel.app/reset-password
```

## Email Templates

### Confirm Signup
Go to Authentication → Email Templates → Confirm Signup
- Subject: `Confirm your AI Gen Library account`
- Content: Customize as needed, but keep the `{{ .ConfirmationURL }}` placeholder

### Reset Password
Go to Authentication → Email Templates → Reset Password
- Subject: `Reset your AI Gen Library password`
- Content: Customize as needed, but keep the `{{ .ConfirmationURL }}` placeholder

## Disable Public Signups

Go to Authentication → Providers → Email
- **Disable "Enable email signups"** (turn OFF)
- This prevents public registration
- Only the email in `ALLOWED_EMAIL` env var can sign in

## Enable Email Auth Provider

Make sure Email provider is enabled:
- Go to Authentication → Providers
- Ensure "Email" is toggled ON

## Configure Password Requirements

Go to Authentication → Password Security
- Minimum password length: 8
- Require uppercase: Optional
- Require numbers: Optional
- Require special characters: Optional

## Session Settings

Go to Authentication → Session
- Session timeout: 24 hours (or your preference)
- Refresh token rotation: Enabled (recommended)
- Refresh token reuse interval: 10 seconds

## Rate Limiting

Go to Authentication → Rate Limits
- Configure appropriate limits for your use case
- Recommended: 10 requests/hour for password reset, 30/hour for sign in

## Email Provider (Optional)

For production, configure a custom SMTP provider:
1. Go to Authentication → Settings → SMTP Settings
2. Enable "Custom SMTP"
3. Enter your SMTP credentials (SendGrid, Resend, etc.)
4. This ensures reliable email delivery

## Testing Checklist

- [ ] Sign up is disabled (only ALLOWED_EMAIL can access)
- [ ] Sign in works with email/password
- [ ] Forgot password sends reset email
- [ ] Reset password works with email link
- [ ] Session persists across browser refresh
- [ ] Sign out works correctly
- [ ] Unauthorized users are redirected to login
- [ ] Middleware protects all dashboard routes
- [ ] Signed URLs work for image access