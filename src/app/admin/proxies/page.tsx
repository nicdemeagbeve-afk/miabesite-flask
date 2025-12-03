"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function AdminProxiesPage() {
  const { userId, role, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!userId || role !== 'admin')) {
      router.push('/'); // Redirect non-admin users to home
    }
  }, [authLoading, userId, role, router]);

  if (authLoading || !userId || role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Chargement de l'utilisateur...</p>
      </div>
    );
  }

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