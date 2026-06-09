import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Mentions légales — Qualivoire Connect",
  description: "Mentions légales de la plateforme Qualivoire Connect by Qualivoire.",
};

export default function MentionsPage() {
  return (
    <>
      <Navbar />

      <section className="pt-32 pb-4 text-center" style={{ background: "var(--bg-subtle)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl sm:text-4xl font-black mb-3" style={{ color: "var(--foreground)" }}>
            Mentions légales
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Dernière mise à jour : juin 2026
          </p>
        </div>
      </section>

      <section className="py-16" style={{ background: "var(--background)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <article className="space-y-10">

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>1. Éditeur du site</h2>
              <div
                className="p-5 rounded-xl border"
                style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}
              >
                <dl className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <dt className="font-bold w-48 flex-shrink-0" style={{ color: "var(--foreground)" }}>Dénomination sociale</dt>
                    <dd style={{ color: "var(--muted)" }}>Qualivoire SARL</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-bold w-48 flex-shrink-0" style={{ color: "var(--foreground)" }}>Siège social</dt>
                    <dd style={{ color: "var(--muted)" }}>Cocody, Abidjan, Côte d&apos;Ivoire</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-bold w-48 flex-shrink-0" style={{ color: "var(--foreground)" }}>Forme juridique</dt>
                    <dd style={{ color: "var(--muted)" }}>Société à Responsabilité Limitée (SARL)</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-bold w-48 flex-shrink-0" style={{ color: "var(--foreground)" }}>Activité</dt>
                    <dd style={{ color: "var(--muted)" }}>Conseil, formation et organisation d&apos;événements professionnels</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-bold w-48 flex-shrink-0" style={{ color: "var(--foreground)" }}>Email</dt>
                    <dd style={{ color: "var(--muted)" }}>
                      <a href="mailto:contact@qualivoire.com" style={{ color: "var(--primary)" }}>
                        contact@qualivoire.com
                      </a>
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-bold w-48 flex-shrink-0" style={{ color: "var(--foreground)" }}>Téléphone</dt>
                    <dd style={{ color: "var(--muted)" }}>
                      <a href="tel:+2252722000000" style={{ color: "var(--primary)" }}>
                        +225 27 22 00 00 00
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>2. Directeur de publication</h2>
              <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                Le directeur de publication de la plateforme Qualivoire Connect est le représentant légal
                de Qualivoire SARL.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>3. Hébergement</h2>
              <div
                className="p-5 rounded-xl border"
                style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}
              >
                <dl className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <dt className="font-bold w-48 flex-shrink-0" style={{ color: "var(--foreground)" }}>Hébergeur</dt>
                    <dd style={{ color: "var(--muted)" }}>Vercel Inc.</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-bold w-48 flex-shrink-0" style={{ color: "var(--foreground)" }}>Adresse</dt>
                    <dd style={{ color: "var(--muted)" }}>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-bold w-48 flex-shrink-0" style={{ color: "var(--foreground)" }}>Site web</dt>
                    <dd>
                      <a
                        href="https://vercel.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--primary)" }}
                        className="hover:opacity-80 transition-opacity"
                      >
                        vercel.com
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>4. Contact</h2>
              <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                Pour toute question relative au site Qualivoire Connect, vous pouvez nous contacter par :
              </p>
              <ul className="space-y-2 pl-5 mt-3" style={{ color: "var(--muted)" }}>
                <li className="list-disc">
                  Email :{" "}
                  <a href="mailto:contact@qualivoire.com" style={{ color: "var(--primary)" }}>
                    contact@qualivoire.com
                  </a>
                </li>
                <li className="list-disc">
                  Téléphone :{" "}
                  <a href="tel:+2252722000000" style={{ color: "var(--primary)" }}>
                    +225 27 22 00 00 00
                  </a>
                </li>
                <li className="list-disc">
                  Courrier : Qualivoire SARL, Cocody, Abidjan, Côte d&apos;Ivoire
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>5. Propriété intellectuelle</h2>
              <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                L&apos;ensemble du contenu de la plateforme Qualivoire Connect — textes, images, logos, icônes,
                éléments graphiques, code informatique — est la propriété exclusive de Qualivoire SARL
                ou de ses partenaires et est protégé par les lois en vigueur relatives à la propriété
                intellectuelle en Côte d&apos;Ivoire.
              </p>
              <p className="leading-relaxed mt-3" style={{ color: "var(--muted)" }}>
                Toute reproduction, représentation, modification, publication ou transmission, totale
                ou partielle, par quelque procédé que ce soit, sans l&apos;autorisation écrite de Qualivoire
                SARL, est interdite et constituerait une contrefaçon sanctionnée par les lois
                applicables.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>6. Données personnelles</h2>
              <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                Le traitement des données personnelles collectées sur la plateforme Qualivoire Connect est
                décrit dans notre{" "}
                <a href="/legal/privacy" style={{ color: "var(--primary)" }} className="hover:opacity-80 transition-opacity">
                  Politique de confidentialité
                </a>
                .
              </p>
            </div>

          </article>
        </div>
      </section>

      <Footer />
    </>
  );
}
