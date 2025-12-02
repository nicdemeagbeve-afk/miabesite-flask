"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, QrCode, Link as LinkIcon, WifiOff, Trash2, CheckCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Environment variables for API configuration
const API_SERVER_URL = process.env.NEXT_PUBLIC_API_SERVER_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

type ConnectionState = "connected" | "disconnected" | "pending";

export default function WhatsappPage() {
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [isCreatingInstance, setIsCreatingInstance] = useState(false);
  const [isFetchingQr, setIsFetchingQr] = useState(false);
  const [showLinkingCodeInput, setShowLinkingCodeInput] = useState(false);
  const [instanceName, setInstanceName] = useState<string | null>(null);
  const [lastConnectionTime, setLastConnectionTime] = useState<string | null>(null);

  // Placeholder for a unique user ID. In a real app, this would come from user auth.
  const currentInstanceId = "user_123"; 

  const fetchConnectionState = useCallback(async () => {
    if (!API_SERVER_URL || !API_KEY) {
      toast.error("API_SERVER_URL ou API_KEY non configuré dans .env.local");
      return;
    }
    if (!currentInstanceId) return;

    try {
      const response = await fetch(`${API_SERVER_URL}/instance/connectionState/${currentInstanceId}`, {
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
        setInstanceName(currentInstanceId);
        setLastConnectionTime(new Date().toLocaleString("fr-FR"));
      } else if (state === "connecting") {
        setConnectionState("pending");
        setInstanceName(currentInstanceId);
      } else {
        setConnectionState("disconnected");
        setInstanceName(null);
        setLastConnectionTime(null);
      }
    } catch (error) {
      console.error("Error fetching connection state:", error);
      setConnectionState("disconnected");
      setInstanceName(null);
      setLastConnectionTime(null);
      toast.error("Erreur lors de la récupération du statut de connexion.");
    }
  }, [currentInstanceId]);

  const createInstance = async () => {
    if (!API_SERVER_URL || !API_KEY) {
      toast.error("API_SERVER_URL ou API_KEY non configuré dans .env.local");
      return;
    }
    setIsCreatingInstance(true);
    setQrCode(null); // Clear previous QR code
    setLinkingCode(null); // Clear previous linking code

    try {
      const response = await fetch(`${API_SERVER_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
        body: JSON.stringify({
          instanceName: currentInstanceId,
          token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), // Simple random token
          qrcode: true,
          integration: "WHATSAPP-BAILEYS",
          webhook: `https://your-saas-webhook.com/api/webhook/${currentInstanceId}`, // Placeholder webhook URL
          webhook_by_events: true,
          events: ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "CONNECTION_UPDATE"],
          proxy: {
            host: "proxy.example.com", // Placeholder proxy host
            port: "8080", // Placeholder proxy port
            protocol: "http", // Placeholder proxy protocol
            username: "user", // Placeholder proxy username
            password: "pass" // Placeholder proxy password
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success("Instance créée avec succès !");
      setConnectionState("pending");
      setInstanceName(currentInstanceId);
      fetchQrCode(); // Immediately fetch QR code after creation
    } catch (error) {
      console.error("Error creating instance:", error);
      toast.error("Erreur lors de la création de l'instance.");
    } finally {
      setIsCreatingInstance(false);
    }
  };

  const fetchQrCode = useCallback(async () => {
    if (!API_SERVER_URL || !API_KEY) {
      toast.error("API_SERVER_URL ou API_KEY non configuré dans .env.local");
      return;
    }
    if (!currentInstanceId) return;

    setIsFetchingQr(true);
    try {
      const response = await fetch(`${API_SERVER_URL}/instance/connect/${currentInstanceId}`, {
        headers: {
          'apikey': API_KEY,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.base64) {
        setQrCode(`data:image/png;base64,${data.base64}`);
        setLinkingCode(data.pairingCode || null); // API might return pairingCode too
        toast.info("QR Code généré. Scannez-le pour vous connecter.");
      } else if (data.pairingCode) {
        setLinkingCode(data.pairingCode);
        setQrCode(null);
        toast.info("Code de liaison généré. Utilisez-le pour vous connecter.");
      } else {
        toast.info("Aucun QR Code ou code de liaison reçu."); // Changed from toast.warn to toast.info
      }
    } catch (error) {
      console.error("Error fetching QR Code:", error);
      toast.error("Erreur lors de la récupération du QR Code.");
    } finally {
      setIsFetchingQr(false);
    }
  }, [currentInstanceId]);

  const disconnectInstance = async () => {
    if (!API_SERVER_URL || !API_KEY) {
      toast.error("API_SERVER_URL ou API_KEY non configuré dans .env.local");
      return;
    }
    if (!currentInstanceId) return;

    try {
      const response = await fetch(`${API_SERVER_URL}/instance/logout/${currentInstanceId}`, {
        method: 'DELETE',
        headers: {
          'apikey': API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setConnectionState("disconnected");
      setQrCode(null);
      setLinkingCode(null);
      setInstanceName(null);
      setLastConnectionTime(null);
      toast.success("Instance déconnectée temporairement.");
    } catch (error) {
      console.error("Error disconnecting instance:", error);
      toast.error("Erreur lors de la déconnexion de l'instance.");
    }
  };

  const deleteInstance = async () => {
    if (!API_SERVER_URL || !API_KEY) {
      toast.error("API_SERVER_URL ou API_KEY non configuré dans .env.local");
      return;
    }
    if (!currentInstanceId) return;

    try {
      const response = await fetch(`${API_SERVER_URL}/instance/delete/${currentInstanceId}`, {
        method: 'DELETE',
        headers: {
          'apikey': API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setConnectionState("disconnected");
      setQrCode(null);
      setLinkingCode(null);
      setInstanceName(null);
      setLastConnectionTime(null);
      toast.success("Instance supprimée définitivement.");
    } catch (error) {
      console.error("Error deleting instance:", error);
      toast.error("Erreur lors de la suppression de l'instance.");
    }
  };

  useEffect(() => {
    fetchConnectionState();
    const interval = setInterval(() => {
      if (connectionState === "pending" || connectionState === "disconnected") {
        fetchConnectionState();
      }
      if (connectionState === "pending" && !qrCode && !isFetchingQr) {
        fetchQrCode();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [connectionState, qrCode, isFetchingQr, fetchConnectionState, fetchQrCode]);

  const getConnectionBadge = () => {
    switch (connectionState) {
      case "connected":
        return <Badge className="bg-synapse-accent-success hover:bg-synapse-accent-success/90 text-white">Connecté</Badge>;
      case "disconnected":
        return <Badge variant="destructive">Déconnecté</Badge>;
      case "pending":
        return <Badge className="bg-orange-500 hover:bg-orange-500/90 text-white">En attente de scan</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Mon WhatsApp 📱</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Bloc de Statut */}
        <Card>
          <CardHeader>
            <CardTitle>Statut Actuel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              {getConnectionBadge()}
              {connectionState === "pending" && <Loader2 className="h-5 w-5 animate-spin text-orange-500" />}
            </div>
            {instanceName && (
              <p className="text-sm text-muted-foreground">
                Instance: {instanceName} / État: {connectionState === "connected" ? "Ouvert" : "Fermé"}
              </p>
            )}
            {lastConnectionTime && (
              <p className="text-xs text-muted-foreground">
                Dernière connexion: {lastConnectionTime}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Bloc d'Activation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Liez votre compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectionState === "connected" ? (
              <div className="flex items-center gap-2 text-synapse-accent-success font-semibold">
                <CheckCircle className="h-5 w-5" />
                <span>Connexion réussie ! Votre Synapse est en ligne.</span>
              </div>
            ) : (
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  **Préparation :** Sur votre téléphone, ouvrez WhatsApp, allez dans **Paramètres** (ou Réglages) &gt; **Appareils connectés** &gt; **Connecter un appareil**.
                  {/* Placeholder for instruction image */}
                  <div className="mt-2 h-24 w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground text-sm">
                    [Image d'instruction ici]
                  </div>
                </li>
                <li>
                  **Scan :** Scannez le QR Code ci-dessous ou utilisez le code de liaison.
                  {isCreatingInstance || isFetchingQr ? (
                    <div className="flex flex-col items-center gap-2 mt-4">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p>Génération de l'instance / QR Code...</p>
                    </div>
                  ) : qrCode || linkingCode ? (
                    <div className="flex flex-col items-center gap-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="qr-linking-toggle"
                          checked={showLinkingCodeInput}
                          onCheckedChange={setShowLinkingCodeInput}
                        />
                        <Label htmlFor="qr-linking-toggle">Afficher le Code de Liaison</Label>
                      </div>
                      {showLinkingCodeInput ? (
                        <div className="text-center text-2xl font-bold p-4 border rounded-md bg-muted w-fit">
                          {linkingCode || "Chargement..."}
                        </div>
                      ) : (
                        qrCode ? (
                          <img src={qrCode} alt="QR Code" className="w-48 h-48 border p-2 rounded-md" />
                        ) : (
                          <p className="text-muted-foreground">QR Code non disponible, utilisez le code de liaison.</p>
                        )
                      )}
                    </div>
                  ) : (
                    <Button onClick={createInstance} disabled={isCreatingInstance} className="mt-4">
                      {isCreatingInstance ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Création de l'instance...
                        </>
                      ) : (
                        "Générer une nouvelle instance"
                      )}
                    </Button>
                  )}
                </li>
                <li>
                  **Confirmation :** Une fois scanné, votre bot Synapse sera actif !
                </li>
              </ol>
            )}
          </CardContent>
        </Card>

        {/* Bloc de Gestion */}
        {(connectionState === "connected" || connectionState === "pending") && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Actions d'Urgence</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button onClick={disconnectInstance} className="bg-synapse-primary hover:bg-synapse-primary/90 text-white">
                <WifiOff className="mr-2 h-4 w-4" /> Déconnecter temporairement
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer l'Instance Synapse
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmer la Suppression de l'Instance</DialogTitle>
                    <DialogDescription>
                      Êtes-vous sûr de vouloir supprimer définitivement cette instance et toutes ses données ?
                      Cette action est irréversible.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {}}>Annuler</Button>
                    <Button variant="destructive" onClick={deleteInstance}>
                      <Trash2 className="mr-2 h-4 w-4" /> Supprimer Définitivement
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}