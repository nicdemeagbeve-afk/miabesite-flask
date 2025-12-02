import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListChecks, ServerCog } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Tableau de Bord Admin 🛡️</h1>
      <p className="mb-6 text-muted-foreground">
        Vue d'ensemble et gestion des opérations de la plateforme Synapse AI.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Instances Actives</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">850</p>
            <p className="text-muted-foreground">sur 1000</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Taux de Déconnexion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">5%</p>
            <p className="text-muted-foreground">par jour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Consommation CPU</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">65%</p>
            <p className="text-muted-foreground">Moyenne du cluster</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Gestion des Abonnements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Accédez à la liste complète des utilisateurs, gérez les abonnements et les statuts de paiement.
          </p>
          <Button asChild>
            <Link href="/admin/subscriptions">
              <ListChecks className="mr-2 h-4 w-4" /> Gérer les Abonnements
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Supervision des Instances</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Surveillez l'état de toutes les instances, diagnostiquez et effectuez des actions de secours.
            </p>
            <Button asChild>
              <Link href="/admin/instances">
                <ServerCog className="mr-2 h-4 w-4" /> Voir les Instances
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Proxies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Gérez les adresses IP et les proxies utilisés par les instances.
            </p>
            <Button asChild>
              <Link href="/admin/proxies">
                <ServerCog className="mr-2 h-4 w-4" /> Gérer les Proxies
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}