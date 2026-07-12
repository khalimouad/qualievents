/**
 * Vercel Blob is configured as a private store, so uploaded files can't be
 * fetched directly via their raw blob URL (that requires an Authorization
 * header). Instead every uploaded/generated file is served through our own
 * /api/media/[...path] proxy, which fetches the blob server-side with the
 * BLOB_READ_WRITE_TOKEN and streams it back — publicly, since this content
 * (event photos, badges, invoices, certificates) is meant to be public
 * anyway. Only the pathname is stored/exposed, never the blob token.
 */
export function mediaUrl(pathname: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/api/media/${pathname}`;
}
