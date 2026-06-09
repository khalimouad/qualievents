import { notFound } from "next/navigation";
import { Calendar, MapPin, ShieldCheck, ShieldAlert, ShieldOff, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return {
    title: `Vérification ${code} — Qualivoire Connect`,
    description: "Authenticité d'un certificat Qualivoire Connect.",
    robots: { index: false, follow: false },
  };
}

const orgName = process.env.ORG_NAME || "Qualivoire Connect";

export default async function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const upper = code.toUpperCase();

  const cert = await prisma.certification.findUnique({
    where: { verificationCode: upper },
    include: {
      subscriber: { select: { firstName: true, lastName: true } },
      event: { select: { title: true, tagline: true, date: true, endDate: true, city: true, country: true, format: true } },
    },
  });

  if (!cert) notFound();

  const valid = !cert.revoked;
  const isCertified = cert.type === "CERTIFIED";
  const holderName = `${cert.subscriber.firstName} ${cert.subscriber.lastName}`.trim();

  const dateLine = cert.event.endDate
    ? `${new Date(cert.event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} → ${new Date(cert.event.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
    : new Date(cert.event.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <Navbar />
      <section className="min-h-screen bg-background pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Verdict card */}
          <div
            className={`card p-6 sm:p-8 text-center ${
              valid ? "border-success/40 bg-success/5" : "border-danger/40 bg-danger/5"
            }`}
          >
            <div
              className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                valid ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
              }`}
            >
              {valid ? <ShieldCheck className="w-8 h-8" /> : <ShieldOff className="w-8 h-8" />}
            </div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-1 text-text-secondary">
              {valid ? "Document authentique" : "Document révoqué"}
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-foreground">
              {valid
                ? isCertified
                  ? "Certification valide"
                  : "Attestation valide"
                : "Ce certificat n'est plus valide"}
            </h1>

            {valid && cert.issuedAt && (
              <p className="text-text-secondary text-sm mt-2">
                Délivré le {new Date(cert.issuedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}

            {!valid && (
              <p className="text-text-secondary text-sm mt-2">
                L&apos;émetteur a révoqué ce certificat. Contactez l&apos;organisme pour plus d&apos;informations.
              </p>
            )}
          </div>

          {/* Details */}
          <div className="card p-6 sm:p-8 mt-4 space-y-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-semibold mb-1">Titulaire</p>
              <p className="text-2xl font-bold text-foreground">{holderName}</p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-semibold mb-1">
                {isCertified ? "Programme certifiant" : "Événement"}
              </p>
              <p className="text-lg font-semibold text-foreground">{cert.event.title}</p>
              {cert.event.tagline && (
                <p className="text-sm text-text-secondary italic">{cert.event.tagline}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Date</p>
                  <p className="text-sm text-foreground">{dateLine}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                {cert.event.format === "ONLINE" ? (
                  <Globe className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                ) : (
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Lieu</p>
                  <p className="text-sm text-foreground">
                    {cert.event.format === "ONLINE"
                      ? "En ligne"
                      : [cert.event.city, cert.event.country].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            </div>

            {isCertified && (
              <div className="pt-2 border-t border-border flex items-center gap-2">
                {cert.examPassed === true ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" /> Examen réussi
                  </span>
                ) : cert.examPassed === false ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger/10 text-danger text-xs font-semibold uppercase tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5" /> Examen non validé
                  </span>
                ) : (
                  <span className="text-xs text-text-secondary">Statut de l&apos;examen non renseigné</span>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <p className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold mb-1">Code de vérification</p>
              <code className="font-mono text-sm font-bold tracking-widest bg-subtle px-3 py-1.5 rounded-md inline-block select-all">
                {upper}
              </code>
            </div>
          </div>

          <p className="text-center text-xs text-text-secondary mt-6">
            Cette page est délivrée par <strong className="text-foreground">{orgName}</strong> via la plateforme Qualivoire Connect.
            <br />
            Pour toute question, contactez l&apos;organisme émetteur.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
