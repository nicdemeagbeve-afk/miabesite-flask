import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Politique de Confidentialité</h1>
      <p className="mb-6 text-muted-foreground">
        La présente Politique de Confidentialité décrit comment Synapse AI collecte, utilise et protège vos informations personnelles.
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Informations sur le Projet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-muted-foreground">
          <p><strong>Nom du Projet :</strong> Synapse AI</p>
          <p><strong>Propriétaire :</strong> AGBEVE Ayao Nicodème</p>
          <p><strong>Résidence :</strong> Lomé, Togo</p>
          <p><strong>Cible :</strong> Vendeurs, entreprises et commerçants souhaitant automatiser leur communication WhatsApp via l'IA.</p>
          <p><strong>Hébergement :</strong> VPS via Coolify sur Contabo</p>
          <p><strong>Nom de Domaine :</strong> Fourni par LWS</p>
        </CardContent>
      </Card>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Collecte des Informations</h2>
        <p className="text-muted-foreground">
          Nous collectons les informations que vous nous fournissez directement, telles que votre nom, prénom, adresse e-mail, numéro de téléphone, âge, pays, et les données relatives à votre utilisation de nos services (par exemple, les conversations WhatsApp traitées par l'IA).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Utilisation des Informations</h2>
        <p className="text-muted-foreground">
          Vos informations sont utilisées pour :
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li>Fournir, maintenir et améliorer nos services.</li>
          <li>Personnaliser votre expérience utilisateur.</li>
          <li>Communiquer avec vous concernant votre compte ou nos services.</li>
          <li>Assurer la sécurité de nos services et prévenir la fraude.</li>
          <li>Analyser l'utilisation de nos services à des fins statistiques.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Partage des Informations</h2>
        <p className="text-muted-foreground">
          Nous ne partageons pas vos informations personnelles avec des tiers, sauf dans les cas suivants :
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li>Avec votre consentement explicite.</li>
          <li>Pour se conformer à une obligation légale.</li>
          <li>Avec des fournisseurs de services tiers qui nous aident à exploiter nos services (par exemple, hébergeurs, services d'analyse), sous réserve d'accords de confidentialité stricts.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Sécurité des Données</h2>
        <p className="text-muted-foreground">
          Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations contre l'accès non autorisé, la divulgation, l'altération ou la destruction.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Vos Droits (RGPD)</h2>
        <p className="text-muted-foreground">
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants concernant vos données personnelles :
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li><strong>Droit d'accès :</strong> Vous pouvez demander une copie des données personnelles que nous détenons à votre sujet.</li>
          <li><strong>Droit de rectification :</strong> Vous pouvez demander la correction de données inexactes ou incomplètes.</li>
          <li><strong>Droit à l'effacement ("droit à l'oubli") :</strong> Vous pouvez demander la suppression de vos données personnelles.</li>
          <li><strong>Droit à la limitation du traitement :</strong> Vous pouvez demander la limitation du traitement de vos données.</li>
          <li><strong>Droit à la portabilité des données :</strong> Vous pouvez recevoir vos données dans un format structuré, couramment utilisé et lisible par machine.</li>
          <li><strong>Droit d'opposition :</strong> Vous pouvez vous opposer au traitement de vos données personnelles.</li>
        </ul>
        <p className="text-muted-foreground mt-2">
          Pour exercer ces droits, veuillez nous contacter. Une option de suppression de compte est également disponible dans vos paramètres de profil.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Modifications de la Politique de Confidentialité</h2>
        <p className="text-muted-foreground">
          Nous pouvons mettre à jour cette Politique de Confidentialité de temps à autre. Nous vous informerons de tout changement significatif en publiant la nouvelle politique sur cette page.
        </p>
      </section>

      <p className="text-muted-foreground mt-8">
        Pour toute question concernant cette Politique de Confidentialité, veuillez nous contacter.
      </p>
      <p className="text-muted-foreground mt-2">
        Consultez également nos <Link href="/legal/terms" className="text-primary hover:underline">Conditions Générales d'Utilisation</Link>.
      </p>
    </div>
  );
}