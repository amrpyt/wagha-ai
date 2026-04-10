# Plan 01-04 Summary: Settings & Team Management

## Goal
Add account settings, firm settings, and team management features with full Arabic RTL UI.

## What Was Built

### Server Actions (`src/lib/actions/settings.ts`)
- `updateAccount(prevState, formData)` — Update name, email (with email verification flow)
- `changePassword(prevState, formData)` — Verify current password then update
- `updateFirm(prevState, formData)` — Admin-only: name, brand color, logo URL
- `uploadLogo(file)` — Upload firm logo to Supabase Storage, returns public URL
- `inviteTeamMember(prevState, formData)` — Admin-only: create invitation + send Supabase Auth invite email
- `getTeamMembers()` — List all firm members with their auth email
- `getInvitations()` — List pending invitations for the firm

### Pages
- `/settings` — Account settings (name, email, password change)
- `/settings/firm` — Firm settings (admin only): name, brand color, logo
- `/settings/team` — Team management (admin only): invite members, view current members

### Components
- `AccountSettingsForm` — Form with name, email, password change tabs
- `FirmSettingsForm` — Firm name, color picker, logo upload with preview
- `TeamInviteForm` — Email + role dropdown, sends invite via Server Action
- `TeamMemberList` — Shows current team members with role badges

## Key Decisions

1. **Form pattern**: All forms use `useState + useTransition` (NOT `useActionState`) for React 19 compatibility
2. **Admin-only routes**: Firm and team settings check `role === 'admin'` in middleware via Server Component data fetch
3. **Logo upload**: Files uploaded to Supabase Storage bucket `firm-logos`, max 2MB, image-only validation
4. **Invitation flow**: Uses `admin.inviteUserByEmail` with `firm_id` and `role` in user metadata
5. **Type casting**: Supabase join queries use `as unknown as TeamMember[]` to bypass type inference mismatch

## Files Changed
- `src/lib/actions/settings.ts` (new)
- `src/components/settings/AccountSettingsForm.tsx` (new)
- `src/components/settings/FirmSettingsForm.tsx` (new)
- `src/components/settings/TeamInviteForm.tsx` (new)
- `src/components/settings/TeamMemberList.tsx` (new)
- `src/app/settings/page.tsx` (new)
- `src/app/settings/firm/page.tsx` (new)
- `src/app/settings/team/page.tsx` (new)

## Next
Plan 01-05: Billing & Pricing (Paymob payment integration)
