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
      <div className="mb-5">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-text-secondary hover:text-foreground text-xs font-medium mb-3 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> {t.admin.allEvents}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-2xl font-bold text-foreground truncate">{event.title}</h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${event.isPublished ? "bg-success/10 text-success" : "bg-subtle text-text-secondary"}`}>
                {event.isPublished ? t.admin.live : t.admin.draft}
              </span>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              {new Date(event.date).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })} · {event.city}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {event.isPublished && (
              <Link href={`/events/${slug}`} target="_blank" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-primary hover:bg-hover transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> {t.common.view}
              </Link>
            )}
            <Link href={`/admin/events/${slug}/edit`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-primary hover:bg-hover transition-colors">
              <Pencil className="w-3.5 h-3.5" /> {t.common.edit}
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <EventTabs slug={slug} />

      {/* Content */}
      <div className="mt-5 sm:mt-6">{children}</div>
    </div>
  );
}
