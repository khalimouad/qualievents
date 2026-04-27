import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import EventTabs from "./tabs";
import { t } from "@/lib/i18n";

export default async function EventAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { title: true, slug: true, isPublished: true, date: true, city: true },
  });

  if (!event) notFound();

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-text-secondary hover:text-foreground text-xs font-medium mb-2 transition-colors">
          <ArrowLeft className="w-3 h-3" /> {t.admin.allEvents}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{event.title}</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              {new Date(event.date).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })} · {event.city}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${event.isPublished ? "bg-success/10 text-success" : "bg-subtle text-text-secondary"}`}>
              {event.isPublished ? t.admin.live : t.admin.draft}
            </span>
            {event.isPublished && (
              <Link href={`/events/${slug}`} target="_blank" className="flex items-center gap-1 text-[11px] text-text-secondary hover:text-primary font-medium transition-colors">
                <ExternalLink className="w-3 h-3" /> {t.common.view}
              </Link>
            )}
            <Link href={`/admin/events/${slug}/edit`} className="flex items-center gap-1 text-[11px] text-text-secondary hover:text-primary font-medium transition-colors">
              <Pencil className="w-3 h-3" /> {t.common.edit}
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <EventTabs slug={slug} />

      {/* Content */}
      <div className="mt-4">{children}</div>
    </div>
  );
}
