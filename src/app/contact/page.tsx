import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "./ContactForm";
import { MapPin, Mail, Phone, Clock } from "lucide-react";

export const metadata = {
  title: "Contact — Qualivoire Connect",
  description: "Contactez l'équipe Qualivoire Connect pour toute question, demande d'information ou demande d'organisation d'événement.",
};

const CONTACT_INFO = [
  {
    Icon: MapPin,
    label: "Adresse",
    value: "Cocody, Abidjan\nCôte d'Ivoire",
  },
  {
    Icon: Mail,
    label: "Email",
    value: "contact@qualivoire.com",
    href: "mailto:contact@qualivoire.com",
  },
  {
    Icon: Phone,
    label: "Téléphone",
    value: "+225 27 22 00 00 00",
    href: "tel:+2252722000000",
  },
  {
    Icon: Clock,
    label: "Horaires",
    value: "Lun – Ven : 8h – 18h",
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 text-center" style={{ background: "var(--bg-subtle)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-bold uppercase tracking-wider"
            style={{
              background: "rgba(255,122,0,0.12)",
              border: "1px solid rgba(255,122,0,0.28)",
              color: "var(--primary)",
            }}
          >
            Nous écrire
          </div>
          <h1
            className="font-black leading-tight mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--foreground)" }}
          >
            Contactez-nous
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
            Notre équipe est à votre disposition pour répondre à toutes vos questions.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-20" style={{ background: "var(--background)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: form */}
            <ContactForm />

            {/* Right: contact info */}
            <div className="space-y-5">
              <h2 className="text-xl font-black mb-6" style={{ color: "var(--foreground)" }}>
                Informations de contact
              </h2>
              {CONTACT_INFO.map(({ Icon, label, value, href }) => (
                <div
                  key={label}
                  className="rounded-2xl p-6 border flex items-start gap-4"
                  style={{ background: "var(--background)", borderColor: "var(--border)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,122,0,0.10)" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "var(--primary)" }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="text-sm font-semibold transition-colors hover:opacity-80"
                        style={{ color: "var(--foreground)" }}
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold whitespace-pre-line" style={{ color: "var(--foreground)" }}>
                        {value}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Extra note */}
              <div
                className="rounded-2xl p-6 border"
                style={{
                  background: "rgba(255,122,0,0.04)",
                  borderColor: "rgba(255,122,0,0.2)",
                }}
              >
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  Pour les demandes urgentes ou les projets d&apos;événements d&apos;envergure,
                  n&apos;hésitez pas à nous appeler directement. Nous répondons habituellement
                  aux emails dans un délai de 24h ouvrées.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
