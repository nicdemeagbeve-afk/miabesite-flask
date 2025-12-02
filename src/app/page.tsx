import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Accueil/Statistiques 📊</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Statistiques Globales</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Vue d'ensemble des performances du bot.</p>
            {/* Placeholder for actual stats */}
            <div className="h-24 bg-muted rounded-md mt-4 flex items-center justify-center text-muted-foreground">
              Graphiques et données ici
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Nombre d'utilisateurs interagissant avec le bot.</p>
            <div className="h-24 bg-muted rounded-md mt-4 flex items-center justify-center text-muted-foreground">
              1000+
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Messages Envoyés</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total des messages traités par le bot.</p>
            <div className="h-24 bg-muted rounded-md mt-4 flex items-center justify-center text-muted-foreground">
              50000+
            </div>
          </CardContent>
        </Card>
      </div>
      <MadeWithDyad />
    </div>
  );
}