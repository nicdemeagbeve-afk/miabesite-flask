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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Eye, RefreshCcw, X, Loader2 } from "lucide-react";

interface Instance {
  id: string;
  userName: string;
  creationDate: string;
  apiStatus: "Open" | "Closed";
  proxyStatus: "Healthy" | "Unhealthy";
}

const mockInstances: Instance[] = Array.from({ length: 50 }, (_, i) => ({
  id: `inst-${String(i + 1).padStart(3, "0")}`,
  userName: `User ${i + 1}`,
  creationDate: new Date(Date.now() - i * 86400000).toLocaleDateString("fr-FR"),
  apiStatus: Math.random() > 0.8 ? "Closed" : "Open",
  proxyStatus: Math.random() > 0.9 ? "Unhealthy" : "Healthy",
}));

export default function AdminInstancesPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterApiStatus, setFilterApiStatus] = useState<string>("all");
  const [filterProxyStatus, setFilterProxyStatus] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null); // To track loading state for specific actions

  useEffect(() => {
    const fetchInstances = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setInstances(mockInstances);
      setLoading(false);
      toast.success("Instances chargées avec succès.");
    };
    fetchInstances();
  }, []);

  const handleCheckState = async (instanceId: string) => {
    setActionLoading(instanceId + "-check");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      const newStatus = Math.random() > 0.5 ? "Open" : "Closed";
      setInstances((prev) =>
        prev.map((inst) =>
          inst.id === instanceId ? { ...inst, apiStatus: newStatus } : inst
        )
      );
      toast.info(`État de l'instance ${instanceId} vérifié : ${newStatus}`);
    } catch (error) {
      toast.error(`Erreur lors de la vérification de l'état de ${instanceId}.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestartInstance = async (instanceId: string) => {
    setActionLoading(instanceId + "-restart");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      setInstances((prev) =>
        prev.map((inst) =>
          inst.id === instanceId ? { ...inst, apiStatus: "Open" } : inst
        )
      );
      toast.success(`Instance ${instanceId} relancée avec succès.`);
    } catch (error) {
      toast.error(`Erreur lors du redémarrage de l'instance ${instanceId}.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleForceDisconnect = async (instanceId: string) => {
    setActionLoading(instanceId + "-disconnect");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      setInstances((prev) =>
        prev.map((inst) =>
          inst.id === instanceId ? { ...inst, apiStatus: "Closed" } : inst
        )
      );
      toast.success(`Instance ${instanceId} déconnectée de force.`);
    } catch (error) {
      toast.error(`Erreur lors de la déconnexion forcée de l'instance ${instanceId}.`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredInstances = instances.filter((instance) => {
    const matchesSearch =
      instance.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesApiStatus =
      filterApiStatus === "all" || instance.apiStatus === filterApiStatus;
    const matchesProxyStatus =
      filterProxyStatus === "all" || instance.proxyStatus === filterProxyStatus;
    return matchesSearch && matchesApiStatus && matchesProxyStatus;
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Supervision des Instances 📊</h1>
      <p className="mb-6 text-muted-foreground">
        Gérez et diagnostiquez les instances de chatbot WhatsApp.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Instances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Rechercher par ID ou nom d'utilisateur..."
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
            <Select value={filterProxyStatus} onValueChange={setFilterProxyStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut Proxy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts Proxy</SelectItem>
                <SelectItem value="Healthy">Healthy</SelectItem>
                <SelectItem value="Unhealthy">Unhealthy</SelectItem>
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
                    <TableHead>ID</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Création</TableHead>
                    <TableHead>Statut API</TableHead>
                    <TableHead>Statut Proxy</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstances.length > 0 ? (
                    filteredInstances.map((instance) => (
                      <TableRow key={instance.id}>
                        <TableCell className="font-medium">{instance.id}</TableCell>
                        <TableCell>{instance.userName}</TableCell>
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
                              instance.proxyStatus === "Healthy"
                                ? "bg-green-500 hover:bg-green-500/90"
                                : "bg-orange-500 hover:bg-orange-500/90"
                            }
                          >
                            {instance.proxyStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCheckState(instance.id)}
                            disabled={actionLoading === instance.id + "-check"}
                          >
                            {actionLoading === instance.id + "-check" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestartInstance(instance.id)}
                            disabled={actionLoading === instance.id + "-restart"}
                          >
                            {actionLoading === instance.id + "-restart" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCcw className="h-4 w-4" />
                            )}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <X className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirmer la Déconnexion Forcée</DialogTitle>
                                <DialogDescription>
                                  Êtes-vous sûr de vouloir forcer la déconnexion de l'instance {instance.id} ?
                                  Cela pourrait interrompre les services pour l'utilisateur.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">Annuler</Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleForceDisconnect(instance.id)}
                                  disabled={actionLoading === instance.id + "-disconnect"}
                                >
                                  {actionLoading === instance.id + "-disconnect" ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <X className="mr-2 h-4 w-4" />
                                  )}
                                  Déconnecter
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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