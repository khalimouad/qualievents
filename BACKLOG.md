# BACKLOG — improvements to be done later

Captured items intentionally **not** shipped yet. They've been considered, sized,
and consciously deferred. Pick them up when the use case arises or as separate
focused branches.

## Auth (deferred per user instruction)

### Password reset by email
- New `PasswordResetToken` model with HMAC-signed token, single-use, 30-min TTL.
- `POST /api/auth/forgot-password` — accepts an email, sends link; always
  returns 200 to prevent email enumeration.
- `POST /api/auth/reset-password` — validates token, sets new bcrypt hash,
  burns the token.
- New `/admin/forgot-password` and `/admin/reset-password/[token]` pages.
- Existing admin-side "Réinitialiser le mot de passe" (in `/admin/users`) is
  the in-band fallback today.

### 2FA (TOTP) for admins
- `AdminUser.totpSecretEnc` (encrypted via `lib/crypto.ts`), `totpEnabled`.
- Setup flow: QR code (via `qrcode` already in deps) + 6-digit verify before
  enabling. Backup codes table.
- Login flow gains a 2FA challenge step when enabled.
- "Désactiver 2FA" requires re-entering password + a current code.
- Recovery via admin "Réinitialiser 2FA" button (gated by another admin's
  consent in a real org).

## Security defence-in-depth

### CSRF tokens
- Current `SameSite=Lax` cookies already block cross-site POST/PUT/DELETE in
  modern browsers. CSRF tokens add a layer for older browsers + script-injected
  POSTs from same-origin XSS (which we shouldn't have, but defence in depth).
- Approach: double-submit token pattern. Issue an XSRF cookie at session start,
  require the value mirrored in an `x-csrf-token` header on mutating routes.
  All admin client fetches read the cookie and add the header.

### Sentry
- `@sentry/nextjs` wizard install. DSN in `SENTRY_DSN` env var. Auto-source-map
  upload in `next.config.ts`. Wrap server actions / route handlers in
  `withSentry`.
- Breadcrumbs for every Prisma call. Trace newsletter dispatch jobs across
  tick boundaries.

## Productivity

### Custom registration form fields per event
- `CustomFormField` table per event: kind (text|select|checkbox|textarea),
  label, required, options[], sortOrder.
- `Subscriber.customResponses` JSON column.
- Admin "Formulaire d'inscription" tab in the event admin to add/reorder
  fields with the same builder pattern as the newsletter editor.
- Public registration form renders defined fields below the standard ones.

### Speaker / sponsor drag-reorder UI
- Both schemas already have `sortOrder`. Admin UI uses ↑/↓ today; replace with
  drag-and-drop using a small library (`@dnd-kit/sortable` keeps things
  accessible).

### Event categories / tags
- New `EventTag` table + many-to-many. Filterable on the public homepage and
  on `/series/[slug]`.

### Recurring events
- "Recurrence rule" on Event. Background job materialises N copies. Useful for
  weekly webinars.

### Speaker → session linking
- `EventSession.speakerId` FK to `Panelist`. Public programme renders the
  panelist's photo + bio popover when expanded.

### Newsletter open / click tracking
- Tracking pixel on send, link rewriter that proxies via
  `/api/track/[newsletterJobId]/[recipientId]/[urlIndex]`. Stores per-recipient
  open + click counts. Adds A/B testing groundwork.

### Multi-language event pages
- `Event.translations` JSON: `{ "en": { title, description, ... }, "ar": …}`.
  Public page reads from `Accept-Language` (with override via `?lang=`).

### ICS feed for an event series
- Per-event `/api/events/[slug]/calendar` already exists. Add
  `/api/series/[slug]/calendar` that emits a multi-event VCALENDAR for QUALI
  CONNECT-style catalogues — recipients subscribe once and get all 12 stops.

### Apple / Google Wallet badges
- Generate a `.pkpass` per badge. Surface a "Ajouter au Wallet" button on the
  public badge page.

## Performance

### `<Image>` migration
- Replace every `<img>` with `next/image` for automatic AVIF/WebP, lazy
  loading, blur placeholders, CDN. Largest opportunity is the public event
  hero + the gallery.

## Polish

### API documentation
- Generate an OpenAPI 3.1 spec from Zod schemas (when we adopt Zod). Surface
  via `/api/docs`. Useful for external integrators.

### Audit log retention + export
- TTL on `AuditLog` rows (e.g. drop after 365 days) + admin "Exporter en CSV"
  button on the journal page.

### Group booking → CinetPay redirect
- Today paid group bookings stay `pending` and the team issues an invoice
  manually. Wire the booking total into `/api/payments` so the public form
  can also redirect to CinetPay for online card / mobile money payment.

### Refund flow UI for Payments
- "Rembourser" button on a Payment row → CinetPay refund API (when supported)
  + manual mode for offline transfers. Sets `Payment.status = "refunded"` and
  cascades to `GroupBooking.status` when applicable.

### Bulk invitation email
- Today `/admin/.../invitations` exists but no bulk send UI. Reuse the
  newsletter chunked dispatch pattern to send one personalised invitation
  email per row.
