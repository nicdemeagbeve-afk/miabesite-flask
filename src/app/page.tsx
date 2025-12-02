"use client";

import { useState, useEffect, useCallback } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ActivityChart } from "@/components/charts/activity-chart";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Import toast

// Environment variables for API configuration
const API_SERVER_URL = process.env.NEXT_PUBLIC_API_SERVER_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

type ConnectionState = "connected" | "disconnected" | "pending";

export default function HomePage() {
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [quotaUsed, setQuotaUsed] = useState(45);
  const totalQuota = 50000;
  const messagesProcessed = 15450;
  const responseRate = 98.5;
  const avgResponseTime = 1.2;
  const instanceName = "user_123"; // Assuming a fixed instance for the home page

  const router = useRouter();

  const fetchConnectionState = useCallback(async () => {
    if (!API_SERVER_URL || !API_KEY) {
      toast.error("API_SERVER_URL ou API_KEY non configuré dans .env.local");
      return;
    }
    if (!instanceName) return;

    try {
      const response = await fetch(`${API_SERVER_URL}/instance/connectionState/${instanceName}`, {
        headers: {
          'apikey': API_KEY,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const state = data.instance?.state;
      if (state === "open") {
        setConnectionState("connected");
      } else if (state === "connecting") {
        setConnectionState("pending");
      } else {
        setConnectionState("disconnected");
      }
    } catch (error) {
      console.error("Error fetching connection state:", error);
      setConnectionState("disconnected");
      toast.error("Erreur lors de la récupération du statut de connexion de l'instance.");
    }
  }, [instanceName]);

  useEffect(() => {
    fetchConnectionState();
    // Simulate progress bar update
    const progressInterval = setInterval(() => {
      setQuotaUsed((prev) => (prev < 90 ? prev + 1 : 90)); // Max 90% for demo
    }, 1000);

    const connectionInterval = setInterval(() => {
      fetchConnectionState();
    }, 10000); // Refresh connection state every 10 seconds

    return () => {
      clearInterval(progressInterval);
      clearInterval(connectionInterval);
    };
  }, [fetchConnectionState]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Accueil/Statistiques 📊</h1>

      {/* Notifications */}
      {connectionState === "disconnected" && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attention : Instance Déconnectée</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            Votre bot est actuellement déconnecté. Veuillez le reconnecter pour reprendre les services.
            <Button onClick={() => router.push("/whatsapp")} className="ml-4">
              Reconnecter
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {connectionState === "connected" && (
        <Alert className="mb-6 bg-synapse-accent-success text-white">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Votre bot est actif !</AlertTitle>
          <AlertDescription>
            Votre instance WhatsApp est connectée et fonctionne normalement.
          </AlertDescription>
        </Alert>
      )}
      {connectionState === "pending" && (
        <Alert className="mb-6 bg-orange-500 text-white">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Connexion en attente</AlertTitle>
          <AlertDescription>
            Votre instance WhatsApp est en cours de connexion. Veuillez vérifier la page "Mon WhatsApp".
            <Button onClick={() => router.push("/whatsapp")} className="ml-4">
              Voir le statut
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Synthèse de Performance */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Réponse IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseRate}%</div>
            <p className="text-xs text-muted-foreground">
              des messages sont traités par l'IA
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Traités (30 jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messagesProcessed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              total sur le dernier mois
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps de Réponse Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}s</div>
            <p className="text-xs text-muted-foreground">
              pour les réponses de l'IA
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statut & Ressources */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Santé de l'Instance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Badge
                className={
                  connectionState === "connected"
                    ? "bg-synapse-accent-success hover:bg-synapse-accent-success/90 text-white"
                    : connectionState === "pending"
                    ? "bg-orange-500 hover:bg-orange-500/90 text-white"
                    : "bg-destructive hover:bg-destructive/90 text-white"
                }
              >
                {connectionState === "connected" ? "Actif" : connectionState === "pending" ? "En attente" : "Déconnecté"}
              </Badge>
              <span className="text-sm text-muted-foreground">Instance: {instanceName}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Quota de messages mensuels ({quotaUsed}% utilisé)
            </p>
            <Progress value={quotaUsed} className="w-full" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(totalQuota * (quotaUsed / 100))} / {totalQuota.toLocaleString()} messages utilisés
            </p>
          </CardContent>
        </Card>

        {/* Graphique Clé */}
        <Card>
          <CardHeader>
            <CardTitle>Activité des Chats (7 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ActivityChart />
            </div>
          </CardContent>
        </Card>
      </div>

      <MadeWithDyad />
    </div>
  );
}