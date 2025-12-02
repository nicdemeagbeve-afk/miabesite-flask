"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, QrCode, Link as LinkIcon, WifiOff, Trash2 } from "lucide-react";

type ConnectionState = "connected" | "disconnected" | "pending";

export default function WhatsappPage() {
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [isCreatingInstance, setIsCreatingInstance] = useState(false);
  const [isFetchingQr, setIsFetchingQr] = useState(false);

  // Simulate API calls
  const fetchConnectionState = async () => {
    // GET /instance/connectionState
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const states: ConnectionState[] = ["connected", "disconnected", "pending"];
    setConnectionState(states[Math.floor(Math.random() * states.length)]);
  };

  const createInstance = async () => {
    setIsCreatingInstance(true);
    try {
      // POST /instance/create (silent call)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Instance créée avec succès !");
      setConnectionState("pending"); // Assuming it goes to pending after creation
      // Automatically fetch QR code after instance creation
      fetchQrCode();
    } catch (error) {
      toast.error("Erreur lors de la création de l'instance.");
    } finally {
      setIsCreatingInstance(false);
    }
  };

  const fetchQrCode = async () => {
    setIsFetchingQr(true);
    try {
      // GET /instance/connect/{instance}
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Simulate QR code data
      setQrCode("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=whatsapp-link-data-example");
      setLinkingCode("123-456-789"); // Simulate linking code
      toast.info("QR Code généré. Scannez-le pour vous connecter.");
    } catch (error) {
      toast.error("Erreur lors de la récupération du QR Code.");
    } finally {
      setIsFetchingQr(false);
    }
  };

  const disconnectInstance = async () => {
    try {
      // DELETE /instance/logout
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setConnectionState("disconnected");
      setQrCode(null);
      setLinkingCode(null);
      toast.success("Instance déconnectée.");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion de l'instance.");
    }
  };

  const deleteInstance = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement cette instance et toutes ses données ?")) {
      return;
    }
    try {
      // DELETE /instance/delete
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setConnectionState("disconnected");
      setQrCode(null);
      setLinkingCode(null);
      toast.success("Instance supprimée définitivement.");
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'instance.");
    }
  };

  useEffect(() => {
    fetchConnectionState();
    // Poll for connection state or QR code if pending/disconnected
    const interval = setInterval(() => {
      if (connectionState === "pending" || connectionState === "disconnected") {
        fetchConnectionState();
      }
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [connectionState]);

  const getConnectionBadge = () => {
    switch (connectionState) {
      case "connected":
        return <Badge className="bg-green-500 hover:bg-green-500/90 text-white">Connecté</Badge>;
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
        {/* Statut de Connexion */}
        <Card>
          <CardHeader>
            <CardTitle>Statut de Connexion</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            {getConnectionBadge()}
            {connectionState === "pending" && <Loader2 className="h-5 w-5 animate-spin text-orange-500" />}
          </CardContent>
        </Card>

        {/* Zone d'Activation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activez votre Chatbot Synapse en 3 étapes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2">
              <li>Génération de la Clé.</li>
              <li>Scan du QR Code.</li>
              <li>Bot Actif !</li>
            </ol>
            {connectionState === "disconnected" && (
              <Button onClick={createInstance} disabled={isCreatingInstance}>
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
          </CardContent>
        </Card>

        {/* Bloc QR Code / Code de Liaison */}
        {(connectionState === "pending" || qrCode) && (
          <Card className="flex flex-col items-center justify-center p-6">
            <CardHeader>
              <CardTitle className="text-center">Scannez le QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {isFetchingQr ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p>Génération du QR Code...</p>
                </div>
              ) : qrCode ? (
                <>
                  <img src={qrCode} alt="QR Code" className="w-48 h-48 border p-2 rounded-md" />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="mt-2">
                        <LinkIcon className="mr-2 h-4 w-4" /> Afficher Code de Liaison
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Code de Liaison</DialogTitle>
                        <DialogDescription>
                          Utilisez ce code pour lier votre compte WhatsApp manuellement.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="text-center text-2xl font-bold p-4 border rounded-md bg-muted">
                        {linkingCode || "Chargement..."}
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <p className="text-muted-foreground">QR Code non disponible.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Boutons de Gestion */}
        {(connectionState === "connected" || connectionState === "pending") && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Gestion de l'Instance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button onClick={disconnectInstance} className="bg-blue-500 hover:bg-blue-600 text-white">
                <WifiOff className="mr-2 h-4 w-4" /> Déconnecter l'Instance
              </Button>
              <Button onClick={deleteInstance} variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Supprimer Définitivement
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}