import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Conditions d'utilisation — Qualivoire Connect",
  description: "Conditions générales d'utilisation de la plateforme Qualivoire Connect by Qualivoire.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />

      <section className="pt-32 pb-4 text-center" style={{ background: "var(--bg-subtle)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl sm:text-4xl font-black mb-3" style={{ color: "var(--foreground)" }}>
            Conditions d&apos;utilisation
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
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>1. Acceptation des conditions</h2>
              <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                En accédant à la plateforme Qualivoire Connect et en utilisant ses services, vous acceptez
                pleinement et sans réserve les présentes conditions générales d&apos;utilisation (CGU).
                Si vous n&apos;acceptez pas ces conditions, vous devez cesser immédiatement d&apos;utiliser
                la plateforme.
              </p>
              <p className="leading-relaxed mt-3" style={{ color: "var(--muted)" }}>
                Qualivoire Connect se réserve le droit de modifier ces CGU à tout moment. Les modifications
                prennent effet dès leur publication sur la plateforme. Il vous appartient de consulter
                régulièrement ces conditions.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>2. Description du service</h2>
              <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                Qualivoire Connect est une plateforme numérique de gestion d&apos;événements professionnels
                opérée par Qualivoire SARL. Elle permet :
              </p>
              <ul className="space-y-2 pl-5 mt-3" style={{ color: "var(--muted)" }}>
                <li className="list-disc leading-relaxed">La consultation et l&apos;inscription à des événements professionnels (conférences, séminaires, forums, ateliers).</li>
                <li className="list-disc leading-relaxed">La gestion des inscriptions et des paiements en ligne.</li>
                <li className="list-disc leading-relaxed">La génération de badges d&apos;accès numériques et de certifications.</li>
                <li className="list-disc leading-relaxed">La communication entre organisateurs et participants.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>3. Compte utilisateur</h2>
              <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                Certains services de la plateforme nécessitent la création d&apos;un compte. Vous êtes
                responsable de la confidentialité de vos identifiants de connexion. Vous vous engagez
                à nous notifier immédiatement de toute utilisation non autorisée de votre compte.
              </p>
              <p className="leading-relaxed mt-3" style={{ color: "var(--muted)" }}>
                Qualivoire Connect se réserve le droit de suspendre ou supprimer tout compte en cas de
                violation des présentes CGU.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>4. Règles d&apos;utilisation</h2>
              <p className="leading-relaxed mb-3" style={{ color: "var(--muted)" }}>
                En utilisant Qualivoire Connect, vous vous engagez à ne pas :
              </p>
              <ul className="space-y-2 pl-5" style={{ color: "var(--muted)" }}>
                <li className="list-disc leading-relaxed">Fournir des informations fausses ou trompeuses lors de votre inscription.</li>
                <li className="list-disc leading-relaxed">Utiliser la plateforme à des fins illégales ou non autorisées.</li>
                <li className="list-disc leading-relaxed">Tenter d&apos;accéder à des zones restreintes de la plateforme sans autorisation.</li>
                <li className="list-disc leading-relaxed">Nuire au bon fonctionnement de la plateforme ou de ses serveurs.</li>
                <li className="list-disc leading-relaxed">Revendre ou transférer votre inscription à un tiers sans autorisation préalable.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>5. Propriété intellectuelle</h2>
              <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                L&apos;ensemble des éléments constituant la plateforme Qualivoire Connect (logo, design, textes,
                fonctionnalités, code source) est la propriété exclusive de Qualivoire SARL et est
                protégé par les lois applicables en matière de propriété intellectuelle.
              </p>
              <p className="leading-relaxed mt-3" style={{ color: "var(--muted)" }}>
                Toute reproduction, représentation, modification ou utilisation sans autorisation
                écrite préalable de Qualivoire SARL est strictement interdite.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>6. Limitation de responsabilité</h2>
              <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                Qualivoire Connect met tout en œuvre pour assurer la disponibilité et la fiabilité de sa
                plateforme, mais ne peut garantir un fonctionnement ininterrompu. En cas
                d&apos;interruption de service, Qualivoire Connect ne saurait être tenu responsable des
                préjudices directs ou indirects qui en résulteraient.
              </p>
              <p className="leading-relaxed mt-3" style={{ color: "var(--muted)" }}>
                La responsabilité de Qualivoire Connect est limitée au montant des sommes effectivement
                payées par l&apos;utilisateur pour le service en cause au cours des 12 derniers mois.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>7. Droit applicable</h2>
              <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                Les présentes CGU sont régies par le droit ivoirien et les dispositions pertinentes
                du droit OHADA (Organisation pour l&apos;Harmonisation en Afrique du Droit des Affaires).
                Tout litige relatif à l&apos;interprétation ou à l&apos;exécution des présentes CGU sera soumis
                à la compétence exclusive des tribunaux d&apos;Abidjan, Côte d&apos;Ivoire.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>8. Contact</h2>
              <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                Pour toute question relative aux présentes conditions d&apos;utilisation, vous pouvez
                nous contacter à :
              </p>
              <div
                className="mt-4 p-4 rounded-xl border"
                style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}
              >
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  Email :{" "}
                  <a
                    href="mailto:contact@qualivoire.com"
                    style={{ color: "var(--primary)" }}
                    className="hover:opacity-80 transition-opacity"
                  >
                    contact@qualivoire.com
                  </a>
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                  Qualivoire SARL — Cocody, Abidjan, Côte d&apos;Ivoire
                </p>
              </div>
            </div>

          </article>
        </div>
      </section>

      <Footer />
    </>
  );
}
