import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminProxiesPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Gestion des Proxies 🌐</h1>
      <p className="mb-6 text-muted-foreground">
        Gérez les adresses IP et les proxies utilisés par les instances de chatbot.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Proxies</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cette section affichera un tableau des proxies avec leurs statuts de santé et des options de gestion.
            (Fonctionnalité de gestion interne du SaaS).
          </p>
          {/* Placeholder for proxy table */}
          <div className="h-48 bg-muted rounded-md mt-4 flex items-center justify-center text-muted-foreground">
            Tableau des proxies ici
          </div>
        </CardContent>
      </Card>
    </div>
  );
}