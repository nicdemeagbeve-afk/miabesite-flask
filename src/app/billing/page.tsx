"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function BillingPage() {
  const { userId, loading: authLoading } = useAuth();
  const router = useRouter();

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Chargement de l'utilisateur...</p>
      </div>
    );
  }

  if (!userId) {
    router.push('/login');
    return null;
  }

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