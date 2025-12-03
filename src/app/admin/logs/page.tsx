"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";

interface LogEntry {
  id: number;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
  instanceId?: string;
}

export default function AdminLogsPage() {
  const { userId, role, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!userId || role !== 'admin')) {
      router.push('/'); // Redirect non-admin users to home
    }
  }, [authLoading, userId, role, router]);

  useEffect(() => {
    if (authLoading || !userId || role !== 'admin') {
      setLoading(true);
      return;
    }

    // Simulate fetching initial logs
    const fetchInitialLogs = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      const initialLogs: LogEntry[] = [
        { id: 1, timestamp: new Date().toLocaleString(), level: "INFO", message: "Démarrage du service de logs.", instanceId: "system" },
        { id: 2, timestamp: new Date().toLocaleString(), level: "INFO", message: "Connexion à la base de données Supabase établie.", instanceId: "system" },
        { id: 3, timestamp: new Date().toLocaleString(), level: "INFO", message: "Webhook handler initialisé.", instanceId: "system" },
        { id: 4, timestamp: new Date().toLocaleString(), level: "INFO", message: "Instance user_123 connectée.", instanceId: "user_123" },
        { id: 5, timestamp: new Date().toLocaleString(), level: "INFO", message: "Message reçu de +33612345678.", instanceId: "user_123" },
      ];
      setLogs(initialLogs);
      setLoading(false);
    };

    fetchInitialLogs();

    // Simulate real-time log updates
    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: logs.length + 1,
        timestamp: new Date().toLocaleString(),
        level: Math.random() > 0.9 ? "ERROR" : Math.random() > 0.7 ? "WARN" : "INFO",
        message: `Événement simulé pour l'instance user_${Math.floor(Math.random() * 5) + 1}.`,
        instanceId: `user_${Math.floor(Math.random() * 5) + 1}`,
      };
      setLogs((prevLogs) => [...prevLogs, newLog]);
    }, 3000); // Add a new log every 3 seconds

    return () => clearInterval(interval);
  }, [logs.length, authLoading, userId, role]); // Dependency on logs.length to ensure unique IDs

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
      <h1 className="text-3xl font-bold mb-6">Logs en Temps Réel 📜</h1>
      <p className="mb-6 text-muted-foreground">
        Surveillez l'activité de la plateforme et des instances en temps réel.
        (Note: Ces logs sont simulés. Une implémentation réelle nécessiterait un service backend pour collecter et diffuser les logs, par exemple via des webhooks Evolution API vers une base de données Supabase, puis une API pour les récupérer ici.)
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" /> Flux de Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Chargement des logs...</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] w-full rounded-md border p-4 font-mono text-sm bg-background">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-2 mb-1">
                  <span className="text-muted-foreground flex-shrink-0 w-[150px]">{log.timestamp}</span>
                  <span
                    className={cn(
                      "font-bold flex-shrink-0 w-[60px]",
                      log.level === "INFO" && "text-blue-500",
                      log.level === "WARN" && "text-orange-500",
                      log.level === "ERROR" && "text-red-500"
                    )}
                  >
                    [{log.level}]
                  </span>
                  <span className="text-muted-foreground flex-shrink-0 w-[100px]">{log.instanceId}:</span>
                  <span className="flex-1">{log.message}</span>
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}