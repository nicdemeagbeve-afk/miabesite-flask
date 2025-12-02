export default function BillingPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Facturation 💳</h1>
      <p>Gestion de l'abonnement et des paiements.</p>
      <div className="mt-8 p-6 bg-card rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Détails de l'Abonnement</h2>
        <p className="text-muted-foreground">
          Informations sur l'abonnement actuel et l'historique de facturation.
        </p>
      </div>
    </div>
  );
}