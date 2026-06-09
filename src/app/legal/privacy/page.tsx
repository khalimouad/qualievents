import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Politique de confidentialité — Qualivoire Connect",
  description: "Politique de confidentialité de Qualivoire Connect by Qualivoire.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />

      <section className="pt-32 pb-4 text-center" style={{ background: "var(--bg-subtle)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl sm:text-4xl font-black mb-3" style={{ color: "var(--foreground)" }}>
            Politique de confidentialité
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
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>1. Introduction</h2>
              <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                Qualivoire Connect, plateforme opérée par Qualivoire SARL, s&apos;engage à protéger la vie
                privée de ses utilisateurs. La présente politique décrit quelles données nous
                collectons, pourquoi nous les collectons et comment nous les utilisons.
              </p>
              <p className="leading-relaxed mt-3" style={{ color: "var(--muted)" }}>
                En utilisant la plateforme Qualivoire Connect, vous acceptez les termes de cette politique
                de confidentialité. Si vous n&apos;êtes pas d&apos;accord, veuillez cesser d&apos;utiliser nos services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>2. Données collectées</h2>
              <p className="leading-relaxed mb-3" style={{ color: "var(--muted)" }}>
                Nous collectons les données suivantes lors de votre utilisation de Qualivoire Connect :
              </p>
              <ul className="space-y-2 pl-5" style={{ color: "var(--muted)" }}>
                <li className="list-disc leading-relaxed">
                  <strong style={{ color: "var(--foreground)" }}>Données d&apos;inscription :</strong> nom complet,
                  adresse email, numéro de téléphone, entreprise ou organisation, poste occupé.
                </li>
                <li className="list-disc leading-relaxed">
                  <strong style={{ color: "var(--foreground)" }}>Données de navigation :</strong> adresse IP,
                  type de navigateur, pages consultées, durée des visites, provenance du trafic.
                </li>
                <li className="list-disc leading-relaxed">
                  <strong style={{ color: "var(--foreground)" }}>Données de paiement :</strong> informations de
                  transaction traitées de manière sécurisée via nos prestataires de paiement (nous ne
                  stockons pas les données de carte bancaire).
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>3. Utilisation des données</h2>
              <p className="leading-relaxed mb-3" style={{ color: "var(--muted)" }}>
                Vos données sont utilisées pour :
              </p>
              <ul className="space-y-2 pl-5" style={{ color: "var(--muted)" }}>
                <li className="list-disc leading-relaxed">Traiter vos inscriptions aux événements et générer vos badges d&apos;accès.</li>
                <li className="list-disc leading-relaxed">Vous envoyer des confirmations, rappels et informations relatives aux événements auxquels vous participez.</li>
                <li className="list-disc leading-relaxed">Vous informer des prochains événements susceptibles de vous intéresser (avec votre consentement).</li>
                <li className="list-disc leading-relaxed">Améliorer la qualité de nos services et de notre plateforme.</li>
                <li className="list-disc leading-relaxed">Respecter nos obligations légales et réglementaires.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>4. Partage des données</h2>
              <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                Nous ne vendons, ne louons ni ne cédons vos données personnelles à des tiers à des fins
                commerciales. Vos données peuvent être partagées uniquement dans les cas suivants :
              </p>
              <ul className="space-y-2 pl-5 mt-3" style={{ color: "var(--muted)" }}>
                <li className="list-disc leading-relaxed">Avec les organisateurs de l&apos;événement auquel vous vous inscrivez (pour la gestion logistique).</li>
                <li className="list-disc leading-relaxed">Avec nos prestataires techniques (hébergement, paiement, envoi d&apos;emails) dans le cadre strict de la fourniture du service.</li>
                <li className="list-disc leading-relaxed">En cas d&apos;obligation légale ou de demande des autorités compétentes.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>5. Conservation des données</h2>
              <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                Vos données personnelles sont conservées pour une durée maximale de <strong style={{ color: "var(--foreground)" }}>2 ans</strong> à
                compter de votre dernière interaction avec la plateforme, sauf obligation légale de
                conservation plus longue. À l&apos;expiration de ce délai, vos données sont supprimées ou
                anonymisées de manière irréversible.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>6. Vos droits (RGPD)</h2>
              <p className="leading-relaxed mb-3" style={{ color: "var(--muted)" }}>
                Conformément aux réglementations applicables en matière de protection des données,
                vous disposez des droits suivants :
              </p>
              <ul className="space-y-2 pl-5" style={{ color: "var(--muted)" }}>
                <li className="list-disc leading-relaxed"><strong style={{ color: "var(--foreground)" }}>Droit d&apos;accès :</strong> obtenir une copie de vos données personnelles que nous détenons.</li>
                <li className="list-disc leading-relaxed"><strong style={{ color: "var(--foreground)" }}>Droit de rectification :</strong> corriger des données inexactes ou incomplètes.</li>
                <li className="list-disc leading-relaxed"><strong style={{ color: "var(--foreground)" }}>Droit à l&apos;effacement :</strong> demander la suppression de vos données dans les conditions prévues par la loi.</li>
                <li className="list-disc leading-relaxed"><strong style={{ color: "var(--foreground)" }}>Droit à la portabilité :</strong> recevoir vos données dans un format structuré et lisible.</li>
                <li className="list-disc leading-relaxed"><strong style={{ color: "var(--foreground)" }}>Droit d&apos;opposition :</strong> vous opposer à certains traitements, notamment à des fins de prospection.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4" style={{ color: "var(--foreground)" }}>7. Contact — Délégué à la Protection des Données</h2>
              <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                Pour exercer vos droits ou pour toute question relative à la protection de vos données
                personnelles, vous pouvez contacter notre Délégué à la Protection des Données (DPO) :
              </p>
              <div
                className="mt-4 p-4 rounded-xl border"
                style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}
              >
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  Email :{" "}
                  <a
                    href="mailto:dpo@qualivoire.com"
                    style={{ color: "var(--primary)" }}
                    className="hover:opacity-80 transition-opacity"
                  >
                    dpo@qualivoire.com
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
