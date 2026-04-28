import { prisma } from "./prisma";
import { getClientIp } from "./rateLimit";
import { logger } from "./logger";

export interface AuditEntry {
  /** Dot-namespaced action key, e.g. "event.delete", "user.create". */
  action: string;
  /** Optional human-readable target, e.g. "Event:contactexpo". */
  resource?: string | null;
  /** Optional context — anything that helps debugging or compliance. */
  metadata?: Record<string, unknown> | null;
  /** Override the actor (defaults to inferred from the request session). */
  actor?: { id?: string | null; email?: string | null } | null;
}

/**
 * Append-only log. Failures are swallowed with a console.error so the audit
 * write never fails the user's actual request — auditing is best-effort.
 */
export async function audit(req: Request | null, entry: AuditEntry): Promise<void> {
  try {
    const ip = req ? getClientIp(req) : null;
    const userAgent = req?.headers.get("user-agent") || null;

    let actorId = entry.actor?.id ?? null;
    let actorEmail = entry.actor?.email ?? null;

    // If no explicit actor provided, try to resolve the admin from the cookie.
    if (!actorId && !actorEmail && req) {
      try {
        const { getSession } = await import("./requireRole");
        const session = getSession(req);
        if (session) {
          actorId = session.userId;
          // best-effort: pull the email from DB so we keep a record after the user is deleted
          const user = await prisma.adminUser.findUnique({
            where: { id: session.userId },
            select: { email: true },
          });
          actorEmail = user?.email ?? null;
        }
      } catch {
        // session decoding failure → leave actor null
      }
    }

    await prisma.auditLog.create({
      data: {
        actorId,
        actorEmail,
        action: entry.action,
        resource: entry.resource ?? null,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        ip,
        userAgent,
      },
    });
  } catch (err) {
    logger.error("audit", "write failed", { error: err, action: entry.action });
  }
}
