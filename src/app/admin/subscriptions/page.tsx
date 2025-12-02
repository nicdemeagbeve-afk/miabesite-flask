import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSubscriptionsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Gestion des Abonnements 💳</h1>
      <p className="mb-6 text-muted-foreground">
        Gérez les abonnements et les informations de paiement de tous les utilisateurs.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Abonnements Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cette section affichera un tableau des utilisateurs avec leurs statuts d'abonnement,
            dates d'expiration et historique de paiement.
          </p>
          {/* Placeholder for subscriptions table */}
          <div className="h-48 bg-muted rounded-md mt-4 flex items-center justify-center text-muted-foreground">
            Tableau des abonnements ici
          </div>
        </CardContent>
      </Card>
    </div>
  );
}