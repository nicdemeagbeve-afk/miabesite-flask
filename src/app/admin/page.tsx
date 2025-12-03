"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListChecks, ServerCog, AlertTriangle, ShieldAlert, ScrollText } from "lucide-react"; // Added ScrollText icon
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function AdminDashboardPage() {
  const { userId, profile, loading: authLoading } = useAuth(); // Changed role to profile
  const router = useRouter();

  // Simulated KPI data
  const activeInstances = 955;
  const totalInstances = 1000;
  const apiErrors = 12;
  const cpuUsage = 75; // in percentage
  const bannedIPs = 0;

  useEffect(() => {
    if (!authLoading && (!userId || profile?.role !== 'admin')) { // Access role via profile?.role
      router.push('/'); // Redirect non-admin users to home
    }
  }, [authLoading, userId, profile?.role, router]); // Dependency on profile?.role

  if (authLoading || !userId || profile?.role !== 'admin') { // Access role via profile?.role
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Chargement de l'utilisateur...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Tableau de Bord Admin 🛡️</h1>
      <p className="mb-6 text-muted-foreground">
        Vue d'overview et gestion des opérations de la plateforme Synapse AI.
      </p>

      {/* KPI Critiques - Santé de la Flotte Synapse */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Instances Actives</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{activeInstances}</p>
            <p className="text-muted-foreground text-sm">sur {totalInstances}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Erreurs API (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{apiErrors}</p>
            <p className="text-muted-foreground text-sm">échecs sendText</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Utilisation RAM/CPU du Cluster</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{cpuUsage}%</div>
            <Progress value={cpuUsage} className="w-full" />
            <p className="text-muted-foreground text-xs mt-1">Moyenne du cluster</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Nombre d'IP Bannies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{bannedIPs}</p>
            <p className="text-muted-foreground text-sm">Le KPI le plus important</p>
          </CardContent>
        </Card>
      </div>

      {/* Cartes d'Alertes - Système d'Alerte */}
      <div className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold">Système d'Alerte</h2>
        {/* Example Alert 1: High severity */}
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Alerte Critique : Déconnexions Massives</AlertTitle>
          <AlertDescription>
            50 instances ont été déconnectées simultanément. Un bannissement de masse est possible. Veuillez vérifier les logs et les proxies.
          </AlertDescription>
        </Alert>
        {/* Example Alert 2: Medium severity */}
        <Alert className="bg-orange-500 text-white">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alerte : Surcharge du Webhook</AlertTitle>
          <AlertDescription>
            Le service de Webhook est surchargé, ce qui peut entraîner des retards dans le traitement des messages.
          </AlertDescription>
        </Alert>
      </div>

      {/* Gestion des Abonnements */}
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

      {/* Supervision des Instances et Gestion des Proxies et Logs */}
      <div className="grid gap-6 md:grid-cols-3"> {/* Changed to 3 columns */}
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
        <Card> {/* New card for Logs */}
          <CardHeader>
            <CardTitle>Logs en Temps Réel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Accédez aux logs système et d'instances pour un diagnostic rapide.
            </p>
            <Button asChild>
              <Link href="/admin/logs">
                <ScrollText className="mr-2 h-4 w-4" /> Voir les Logs
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}