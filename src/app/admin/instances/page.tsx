"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Eye, RefreshCcw, X, Loader2, FileText, RotateCcw, Network } from "lucide-react"; // Updated icons

// Environment variables for API configuration
const API_SERVER_URL = process.env.NEXT_PUBLIC_API_SERVER_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

interface Instance {
  id: string;
  userName: string;
  subscriptionPlan: string; // New field
  creationDate: string;
  apiStatus: "Open" | "Closed";
  lastWebhookPing: string; // New field
  proxyAssociated: string; // New field
}

// NOTE: In a real application, this data would be fetched from a backend API
// that aggregates information about all instances (e.g., from your Supabase `public.instances` table).
// The provided Evolution API does not have an endpoint to list all instances directly.
const mockInstances: Instance[] = Array.from({ length: 50 }, (_, i) => ({
  id: `user-${String(i + 1).padStart(3, "0")}`,
  userName: `Client ${i + 1}`,
  subscriptionPlan: i % 3 === 0 ? "Premium" : i % 2 === 0 ? "Standard" : "Basic",
  creationDate: new Date(Date.now() - i * 86400000).toLocaleDateString("fr-FR"),
  apiStatus: Math.random() > 0.8 ? "Closed" : "Open",
  lastWebhookPing: Math.random() > 0.1 ? "Il y a 5 min" : "Jamais",
  proxyAssociated: `proxy-${String(Math.floor(Math.random() * 10) + 1).padStart(3, "0")}`,
}));

export default function AdminInstancesPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterApiStatus, setFilterApiStatus] = useState<string>("all");
  const [filterWebhookPing, setFilterWebhookPing] = useState<string>("all"); // New filter
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // NOTE: This function simulates fetching instances from a hypothetical backend API.
    // To make this "real", you would need to implement a backend endpoint (e.g., /api/admin/instances)
    // that queries your Supabase `public.instances` table and potentially other data sources
    // to provide a comprehensive list of all instances and their statuses.
    const fetchInstances = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setInstances(mockInstances);
      setLoading(false);
      toast.success("Instances chargées avec succès (données simulées).");
    };
    fetchInstances();
  }, []);

  const handleViewLogs = async (instanceId: string) => {
    setActionLoading(instanceId + "-logs");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      // NOTE: To make this "real", you would need a backend endpoint that provides
      // logs for a specific instance. The Evolution API does not expose a logs endpoint.
      toast.info(`Affichage des logs pour l'instance ${instanceId}. (Fonctionnalité à implémenter, nécessite un endpoint de logs)`);
      // In a real app, this would open a modal or navigate to a log viewer
    } catch (error) {
      toast.error(`Erreur lors de la récupération des logs de ${instanceId}.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleForceReconnect = async (instanceId: string) => {
    if (!API_SERVER_URL || !API_KEY) {
      toast.error("API_SERVER_URL ou API_KEY non configuré dans .env.local");
      return;
    }
    setActionLoading(instanceId + "-reconnect");
    try {
      // Step 1: Delete the existing instance to force a clean reconnect
      const deleteResponse = await fetch(`${API_SERVER_URL}/instance/delete/${instanceId}`, {
        method: 'DELETE',
        headers: {
          'apikey': API_KEY,
        },
      });

      if (!deleteResponse.ok) {
        throw new Error(`HTTP error! status: ${deleteResponse.status}`);
      }
      toast.info(`Instance ${instanceId} supprimée. Recréation en cours...`);

      // Step 2: Simulate recreation and connection.
      // NOTE: A full "real" recreation would involve calling POST /instance/create
      // with appropriate proxy and webhook settings, and then potentially GET /instance/connect
      // to get a new QR code. This would require more complex state management here.
      // For simplicity, we simulate the state change after deletion.
      await new Promise((resolve) => setTimeout(resolve, 3000)); 
      
      setInstances((prev) =>
        prev.map((inst) =>
          inst.id === instanceId ? { ...inst, apiStatus: "Open", lastWebhookPing: "Il y a quelques secondes" } : inst
        )
      );
      toast.success(`Instance ${instanceId} forcée à se reconnecter avec succès.`);
    } catch (error) {
      console.error("Error forcing reconnect:", error);
      toast.error(`Erreur lors de la reconnexion forcée de l'instance ${instanceId}.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeProxy = async (instanceId: string) => {
    if (!API_SERVER_URL || !API_KEY) {
      toast.error("API_SERVER_URL ou API_KEY non configuré dans .env.local");
      return;
    }
    setActionLoading(instanceId + "-proxy");
    try {
      // NOTE: The provided API documentation does not have a direct endpoint
      // to change the proxy of an *existing* instance.
      // In a real scenario, changing a proxy might involve deleting the instance
      // and recreating it with the new proxy, similar to a force reconnect.
      // For now, we will simulate the change in the UI.
      await new Promise((resolve) => setTimeout(resolve, 2000)); 
      const newProxy = `proxy-${String(Math.floor(Math.random() * 10) + 1).padStart(3, "0")}`;
      setInstances((prev) =>
        prev.map((inst) =>
          inst.id === instanceId ? { ...inst, proxyAssociated: newProxy } : inst
        )
      );
      toast.success(`Proxy de l'instance ${instanceId} modifié en ${newProxy}.`);
    } catch (error) {
      console.error("Error changing proxy:", error);
      toast.error(`Erreur lors de la modification du proxy de l'instance ${instanceId}.`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredInstances = instances.filter((instance) => {
    const matchesSearch =
      instance.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.subscriptionPlan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.proxyAssociated.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesApiStatus =
      filterApiStatus === "all" || instance.apiStatus === filterApiStatus;
    const matchesWebhookPing =
      filterWebhookPing === "all" || (filterWebhookPing === "ok" && instance.lastWebhookPing !== "Jamais") || (filterWebhookPing === "nok" && instance.lastWebhookPing === "Jamais");
    return matchesSearch && matchesApiStatus && matchesWebhookPing;
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Gestion des Instances 📱</h1>
      <p className="mb-6 text-muted-foreground">
        Recherchez, diagnostiquez et corrigez les problèmes des instances de chatbot.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Liste Détaillée des Instances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Rechercher par ID, nom, plan ou proxy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterApiStatus} onValueChange={setFilterApiStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut API" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts API</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterWebhookPing} onValueChange={setFilterWebhookPing}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par Ping Webhook" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pings</SelectItem>
                <SelectItem value="ok">OK</SelectItem>
                <SelectItem value="nok">Jamais</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Chargement des instances...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Instance</TableHead>
                    <TableHead>Client / Plan</TableHead>
                    <TableHead>Création</TableHead>
                    <TableHead>Statut API</TableHead>
                    <TableHead>Dernier Ping Webhook</TableHead>
                    <TableHead>Proxy Associé</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstances.length > 0 ? (
                    filteredInstances.map((instance) => (
                      <TableRow key={instance.id}>
                        <TableCell className="font-medium">{instance.id}</TableCell>
                        <TableCell>{instance.userName} / <Badge variant="secondary">{instance.subscriptionPlan}</Badge></TableCell>
                        <TableCell>{instance.creationDate}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              instance.apiStatus === "Open"
                                ? "bg-green-500 hover:bg-green-500/90"
                                : "bg-red-500 hover:bg-red-500/90"
                            }
                          >
                            {instance.apiStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              instance.lastWebhookPing !== "Jamais"
                                ? "bg-green-500 hover:bg-green-500/90"
                                : "bg-orange-500 hover:bg-orange-500/90"
                            }
                          >
                            {instance.lastWebhookPing}
                          </Badge>
                        </TableCell>
                        <TableCell>{instance.proxyAssociated}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewLogs(instance.id)}
                            disabled={actionLoading === instance.id + "-logs"}
                          >
                            {actionLoading === instance.id + "-logs" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleForceReconnect(instance.id)}
                            disabled={actionLoading === instance.id + "-reconnect"}
                          >
                            {actionLoading === instance.id + "-reconnect" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Network className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Modifier le Proxy pour l'instance {instance.id}</DialogTitle>
                                <DialogDescription>
                                  Sélectionnez un nouveau proxy pour cette instance.
                                  (Fonctionnalité de sélection de proxy à implémenter. Note: L'API Evolution ne permet pas de modifier un proxy sur une instance existante sans la recréer.)
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">Annuler</Button>
                                <Button
                                  onClick={() => handleChangeProxy(instance.id)}
                                  disabled={actionLoading === instance.id + "-proxy"}
                                >
                                  {actionLoading === instance.id + "-proxy" ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Network className="mr-2 h-4 w-4" />
                                  )}
                                  Changer Proxy
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Aucune instance trouvée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}