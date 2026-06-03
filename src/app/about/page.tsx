import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STATS = [
  { value: "500+", label: "Participants" },
  { value: "20+", label: "Événements" },
  { value: "10+", label: "Pays africains" },
  { value: "98%", label: "Satisfaction" },
];

const VALUES = [
  {
    title: "Excellence",
    description:
      "Chaque événement que nous accompagnons reflète les plus hauts standards de qualité, depuis la conception jusqu'à l'exécution.",
    icon: "⭐",
  },
  {
    title: "Proximité africaine",
    description:
      "Ancrés en Côte d'Ivoire, nous comprenons les réalités du continent et adaptons nos solutions aux contextes locaux.",
    icon: "🌍",
  },
  {
    title: "Innovation",
    description:
      "Nous adoptons les outils digitaux les plus efficaces pour rendre vos événements accessibles, modernes et mémorables.",
    icon: "💡",
  },
  {
    title: "Impact",
    description:
      "Au-delà de l'événementiel, nous œuvrons pour un véritable transfert de connaissances et un développement professionnel durable.",
    icon: "🚀",
  },
];

const COUNTRIES = [
  "Côte d'Ivoire",
  "Sénégal",
  "Mali",
  "Burkina Faso",
  "Guinée",
  "Cameroun",
  "Congo",
  "Gabon",
  "Togo",
  "Bénin",
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section
        className="pt-32 pb-20 text-center"
        style={{ background: "var(--bg-subtle)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
            style={{
              background: "rgba(255,122,0,0.1)",
              color: "var(--primary)",
            }}
          >
            À propos de QualiEvents
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6" style={{ color: "var(--foreground)" }}>
            Bâtir l&apos;excellence,{" "}
            <span style={{ color: "var(--primary)" }}>événement par événement</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--muted)" }}>
            QualiEvents est la plateforme événementielle de Qualivoire — conçue pour rendre les
            événements professionnels en Afrique plus accessibles, plus digitaux et plus impactants.
          </p>
        </div>
      </section>

      {/* Notre mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <span
                className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5"
                style={{ background: "rgba(255,122,0,0.1)", color: "var(--primary)" }}
              >
                Notre mission
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mb-6" style={{ color: "var(--foreground)" }}>
                Connecter les professionnels africains autour du savoir
              </h2>
              <div className="space-y-4" style={{ color: "var(--muted)" }}>
                <p className="leading-relaxed">
                  QualiEvents a pour vocation de connecter les professionnels africains autour des
                  thématiques de qualité, de management et de développement industriel. Nous croyons
                  que l&apos;excellence se construit collectivement, à travers des rencontres et des échanges
                  de haut niveau.
                </p>
                <p className="leading-relaxed">
                  Notre plateforme facilite le transfert de connaissances à travers le continent, en
                  proposant des conférences, des formations, des forums et des ateliers qui répondent
                  aux besoins réels des organisations africaines.
                </p>
                <p className="leading-relaxed">
                  En promouvant la culture de la qualité et du management performant, nous contribuons
                  à la compétitivité des entreprises africaines sur la scène internationale.
                </p>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-6 border text-center"
                  style={{ background: "var(--background)", borderColor: "var(--border)" }}
                >
                  <div className="text-4xl font-black mb-2" style={{ color: "var(--primary)" }}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Qui sommes-nous */}
      <section className="py-20" style={{ background: "var(--bg-subtle)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5"
            style={{ background: "rgba(255,122,0,0.1)", color: "var(--primary)" }}
          >
            Qui sommes-nous
          </span>
          <h2 className="text-3xl sm:text-4xl font-black mb-6" style={{ color: "var(--foreground)" }}>
            Qualivoire, l&apos;expertise au service de l&apos;Afrique
          </h2>
          <div className="space-y-4 text-left" style={{ color: "var(--muted)" }}>
            <p className="leading-relaxed">
              <strong style={{ color: "var(--foreground)" }}>Qualivoire</strong> est un cabinet de conseil et de formation
              spécialisé dans le management de la qualité, la sécurité, la santé et l&apos;environnement
              (HSE), le management industriel et le développement professionnel. Basés à Cocody,
              Abidjan, nous accompagnons les entreprises africaines dans leur démarche d&apos;excellence
              opérationnelle.
            </p>
            <p className="leading-relaxed">
              Face à la demande croissante d&apos;événements professionnels de qualité sur le continent,{" "}
              <strong style={{ color: "var(--foreground)" }}>QualiEvents</strong> est né de la volonté de Qualivoire de rendre
              ses événements accessibles, professionnels et pleinement digitaux. La plateforme
              centralise l&apos;inscription, la gestion des participants, la billetterie et la communication,
              offrant une expérience fluide aux organisateurs comme aux participants.
            </p>
          </div>
        </div>
      </section>

      {/* Nos valeurs */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5"
              style={{ background: "rgba(255,122,0,0.1)", color: "var(--primary)" }}
            >
              Nos valeurs
            </span>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: "var(--foreground)" }}>
              Ce qui nous guide au quotidien
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl p-6 border"
                style={{ background: "var(--background)", borderColor: "var(--border)" }}
              >
                <div className="text-3xl mb-4">{value.icon}</div>
                <h3 className="text-lg font-black mb-3" style={{ color: "var(--foreground)" }}>
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notre présence */}
      <section className="py-20" style={{ background: "var(--bg-subtle)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5"
              style={{ background: "rgba(255,122,0,0.1)", color: "var(--primary)" }}
            >
              Notre présence
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "var(--foreground)" }}>
              De Abidjan à travers le continent
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
              QualiEvents est actif dans 10 pays africains, avec Abidjan comme hub principal pour
              l&apos;Afrique de l&apos;Ouest.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {COUNTRIES.map((country) => (
              <span
                key={country}
                className="px-4 py-2 rounded-xl text-sm font-semibold border"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                {country}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "var(--foreground)" }}>
            Organisez votre prochain événement
          </h2>
          <p className="mb-8 leading-relaxed" style={{ color: "var(--muted)" }}>
            Rejoignez les organisations qui font confiance à QualiEvents pour leurs conférences,
            formations et forums professionnels en Afrique.
          </p>
          <Link
            href="/host"
            className="px-6 py-3 rounded-xl text-sm font-bold text-white inline-flex items-center gap-2 transition-all hover:opacity-90"
            style={{ background: "var(--primary)" }}
          >
            Soumettre une demande
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
