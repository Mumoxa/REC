# Private REC workspace

The application requires an authenticated, email-verified member of the configured Talent Tree workspace. Sign-in uses email and password through Supabase Auth. There is no public account-registration path. The GitHub repository remains public at the user's explicit request; this gate does not hide its existing files or public copies.

## Application protections

- Production always requires authentication. Missing Supabase configuration denies access; a demo flag cannot bypass the production gate. Explicit synthetic demo mode is limited to local development over a loopback hostname; public hostnames still require login.
- Next's proxy checks the current user with Auth and queries explicit workspace membership before serving workspace HTML, React Server Component responses, record pages or operational APIs. A filename suffix or route-prefix lookalike cannot bypass the gate.
- Authenticated database reads and writes retain Supabase row-level policies. The database migration below also removes email-only automatic administrator provisioning and revokes anonymous access across canonical tables.
- Passwords are sent to same-origin server endpoints, then to Supabase Auth. Password hashing is handled by Auth. No password, access token or refresh token is returned in application JSON or saved to browser storage. Session cookies are HttpOnly, Secure in production, and SameSite=Lax.
- Browser mutations require a matching Origin. Private responses prohibit browser/CDN caching. Sign-out clears the session, requests cache/storage cleanup and notifies other open workspace tabs. Restored browser-cache pages reload through the server gate.
- Recovery/setup uses an email-verified link, explicit membership and a server-HMAC-signed, session-bound grant with a server-checked 15-minute expiry. An ordinary session alone cannot call the application's password-update endpoint. Successful setup signs out existing sessions and returns to password login.
- `robots.txt`, no-index metadata and response headers discourage indexing. These are supplementary; authentication and database policies enforce access.
- `/api/ingest/run` retains its independent constant-time bearer-key authentication for the existing research publisher. It is not an anonymous data-read endpoint. Static code and brand assets required to render login remain public and contain no workspace records.

## Encryption boundary

HTTPS/TLS protects traffic in deployment; production responses include HSTS. The application accepts HTTPS Supabase endpoints, with HTTP permitted only for a loopback local Supabase/test instance. Supabase provides managed database/storage encryption at rest; this application does not introduce a second field-encryption scheme or change canonical/searchable research records.

This code change does **not** establish a live inspection of the project's storage encryption, backup encryption, provider Auth settings, WAF rules or existing accounts. Those settings require the project's administrator access. Passwords are hashed by Auth, rather than reversibly encrypted. Authorized users necessarily receive readable data; a password gate cannot prevent an authorized user from copying it.

## Required live configuration

The environment currently has no Vercel login or Supabase administrative connection, and provider API access is blocked. These steps have not been applied by the coding environment:

1. Set an optional dedicated 32+ character random server-only `AUTH_PASSWORD_RESET_SECRET` in Vercel. When absent, a signing key is derived from the existing high-entropy `INGEST_API_KEY` using HKDF with a distinct password-reset context; the ingestion credential is unchanged. Recovery fails closed if neither strong server key exists. Rotating the key invalidates pending reset grants.
2. Confirm production Vercel has the existing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `WORKSPACE_SLUG=talent-tree` and server-only `INGEST_API_KEY`. Set `NEXT_PUBLIC_DEMO_MODE=false`; production ignores a true value anyway. Never put a service-role key or other secret in a `NEXT_PUBLIC_*` variable.
3. In Supabase Auth, enable email/password authentication, disable public user signup and require verified email. Enable provider secure-password-change/reauthentication controls. Application grant checks do not restrict direct provider Auth calls made with a stolen valid provider token. Keep provider rate limits enabled; review password-login/recovery abuse controls and Vercel rate limiting for `/api/auth/sign-in` and `/api/auth/recover`. No distributed application rate limiter is claimed by this implementation.
4. Set the Auth Site URL to the canonical `https://rec-phi-weld.vercel.app`. Allow the production recovery callback `https://rec-phi-weld.vercel.app/auth/callback?next=/account/password` (and only deliberate additional application origins). Recovery PKCE links must be opened in the browser that requested them.
5. Set the **Invite user** email link to `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=invite`. Default implicit invitation fragment tokens cannot be read by this server-only callback. Recovery can use the standard `{{ .ConfirmationURL }}` PKCE flow, or the equivalent explicit `token_hash` callback with `type=recovery`.
6. Apply `supabase/migrations/009_private_invited_workspace.sql` after migrations 001–008. It preserves existing memberships, removes the email-triggered ADMIN grant, forces RLS and revokes anonymous table privileges. Confirm existing production RLS policies are applied and test direct anonymous/non-member REST reads independently.
7. Invite each user through Supabase Auth, then add the user's UUID to `workspace_members` for the Talent Tree workspace with ADMIN, RECRUITER or VIEWER as appropriate. A user without this explicit row is rejected. The app never grants membership.
8. Confirm the managed project's database, storage and backup encryption status in the provider controls. Review deployment logs/exports separately; application login does not encrypt files already in the public repository.
9. Verify one invited member can set a password, sign in, use authorized records and sign out on the actual HTTPS deployment; verify a fresh browser and non-member account cannot retrieve records. Existing email-code-only members can use **Forgot password?** to set their first password.

Supabase and Vercel credentials should be connected through their authenticated admin tools, never pasted into chat or committed to this repository.

## Verification

`npm run verify` runs the canonical checks. `npm run test:auth-browser` builds a production app against a loopback-only synthetic provider fixture and uses the real Supabase SDK, cookie adapter and browser. It tests anonymous HTML/RSC/API denial, a deliberately enabled production demo flag, invalid passwords, non-member rejection, successful member login, cookie flags, lack of browser token storage, protected password changes, multi-tab sign-out and recovery/setup/new-password login. It makes no live Auth, email or database changes. This test also runs in App CI.

Synthetic visual QA can still use `NEXT_PUBLIC_DEMO_MODE=true npm run dev`; production builds never offer a demo-login bypass. The earlier frontend/loading smoke suites require this explicit development server. Live provider policies and encryption controls are outside the local fixture's evidence.
