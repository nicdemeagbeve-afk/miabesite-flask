import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Conditions Générales d'Utilisation (CGU)</h1>
      <p className="mb-6 text-muted-foreground">
        Bienvenue sur Synapse AI. En utilisant nos services, vous acceptez de vous conformer aux présentes conditions.
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
        <h2 className="text-2xl font-semibold mb-4">1. Acceptation des Conditions</h2>
        <p className="text-muted-foreground">
          En accédant et en utilisant les services de Synapse AI, vous reconnaissez avoir lu, compris et accepté d'être lié par les présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Description des Services</h2>
        <p className="text-muted-foreground">
          Synapse AI fournit une plateforme permettant aux vendeurs, entreprises et commerçants d'intégrer un chatbot IA à leurs comptes WhatsApp pour automatiser les réponses, gérer les conversations et améliorer l'engagement client.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Obligations de l'Utilisateur</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li>Vous devez avoir l'âge légal pour conclure un contrat.</li>
          <li>Vous êtes responsable de la confidentialité de vos informations de compte.</li>
          <li>Vous vous engagez à ne pas utiliser les services à des fins illégales ou non autorisées.</li>
          <li>Vous devez respecter les politiques d'utilisation de WhatsApp.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Propriété Intellectuelle</h2>
        <p className="text-muted-foreground">
          Tous les contenus, marques, logos et autres éléments de propriété intellectuelle présents sur la plateforme Synapse AI sont la propriété exclusive de AGBEVE Ayao Nicodème ou de ses concédants de licence.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Limitation de Responsabilité</h2>
        <p className="text-muted-foreground">
          Synapse AI s'efforce d'assurer la disponibilité et la performance de ses services, mais ne peut garantir une absence totale d'interruptions ou d'erreurs. Nous ne serons pas responsables des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser nos services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Modifications des CGU</h2>
        <p className="text-muted-foreground">
          Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les modifications prendront effet dès leur publication sur la plateforme. Il est de votre responsabilité de consulter régulièrement les CGU.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Droit Applicable et Juridiction</h2>
        <p className="text-muted-foreground">
          Les présentes CGU sont régies par le droit togolais. Tout litige relatif à l'interprétation ou à l'exécution des présentes CGU sera soumis aux tribunaux compétents de Lomé, Togo.
        </p>
      </section>

      <p className="text-muted-foreground mt-8">
        Pour toute question concernant ces CGU, veuillez nous contacter.
      </p>
      <p className="text-muted-foreground mt-2">
        Consultez également notre <Link href="/legal/privacy" className="text-primary hover:underline">Politique de Confidentialité</Link>.
      </p>
    </div>
  );
}