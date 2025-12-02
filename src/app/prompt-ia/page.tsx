"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Define the form schema using Zod
const formSchema = z.object({
  mainPrompt: z
    .string()
    .min(10, { message: "Le prompt principal doit contenir au moins 10 caractères." })
    .max(1000, { message: "Le prompt principal ne peut pas dépasser 1000 caractères." }),
  ignoreCalls: z.boolean().optional(),
  ignoreGroupMessages: z.boolean().optional(),
  alwaysOnline: z.boolean().optional(), // New field
  rejectCalls: z.boolean().optional(), // New field
  rejectCallMessage: z.string().max(200, { message: "Le message de rejet ne peut pas dépasser 200 caractères." }).optional(), // New conditional field
});

type SettingsFormValues = z.infer<typeof formSchema>;

export default function PromptIaPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mainPrompt: "",
      ignoreCalls: false,
      ignoreGroupMessages: false,
      alwaysOnline: false, // Default for new field
      rejectCalls: false, // Default for new field
      rejectCallMessage: "Désolé, je ne peux pas prendre d'appels pour le moment. Veuillez envoyer un message.", // Default for new field
    },
  });

  const mainPromptWatch = form.watch("mainPrompt");
  const rejectCallsWatch = form.watch("rejectCalls");

  // Simulate fetching initial settings
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        // Simulate API call GET /instance/settings
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const fetchedSettings = {
          mainPrompt: "Vous êtes un assistant IA amical et serviable pour Synapse AI. Votre rôle est de répondre aux questions des utilisateurs sur nos services, de les guider à travers le tableau de bord et de fournir un support de base. Soyez concis et précis.",
          ignoreCalls: true,
          ignoreGroupMessages: false,
          alwaysOnline: true,
          rejectCalls: false,
          rejectCallMessage: "Désolé, je ne peux pas prendre d'appels pour le moment. Veuillez envoyer un message.",
        };
        form.reset(fetchedSettings); // Set form values
        toast.success("Paramètres de l'IA chargés.");
      } catch (error) {
        toast.error("Erreur lors du chargement des paramètres de l'IA.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [form]);

  // Simulate saving settings
  const onSubmit = async (values: SettingsFormValues) => {
    setIsSaving(true);
    try {
      // Simulate API call POST /instance/setSettings
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Settings saved:", values);
      toast.success("Paramètres de l'IA sauvegardés avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde des paramètres de l'IA.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Prompt & IA 🧠</h1>
      <p className="mb-6 text-muted-foreground">
        C'est ici que vous personnalisez le comportement de votre IA. Décrivez sa personnalité, son domaine d'expertise et ses règles.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Configuration de l'IA</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Chargement des paramètres...</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="mainPrompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Le Prompt Principal</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez la personnalité de votre bot, son domaine d'expertise et ses règles."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Ce prompt définit la base de la personnalité et des réponses de votre IA.
                        <span className="float-right text-xs text-muted-foreground">
                          {mainPromptWatch?.length || 0} / 1000 caractères
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Règles & Filtres</h3>
                  <FormField
                    control={form.control}
                    name="ignoreCalls"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Ignorer les appels</FormLabel>
                          <FormDescription>
                            Si activé, le bot ignorera les appels entrants sur WhatsApp.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ignoreGroupMessages"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Ignorer les messages de groupe</FormLabel>
                          <FormDescription>
                            Si activé, le bot ne répondra pas aux messages envoyés dans les groupes WhatsApp.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="alwaysOnline"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Toujours en ligne</FormLabel>
                          <FormDescription>
                            Si activé, le bot apparaîtra toujours en ligne sur WhatsApp.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rejectCalls"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Rejeter les appels</FormLabel>
                          <FormDescription>
                            Si activé, le bot rejettera automatiquement les appels entrants.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  {rejectCallsWatch && (
                    <FormField
                      control={form.control}
                      name="rejectCallMessage"
                      render={({ field }) => (
                        <FormItem className="ml-8 mt-4">
                          <FormLabel>Message en cas de rejet d'appel</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ex: Désolé, je ne peux pas prendre d'appels pour le moment. Veuillez envoyer un message."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Ce message sera envoyé lorsque le bot rejettera un appel.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sauvegarde en cours...
                    </>
                  ) : (
                    "Sauvegarder les Paramètres Synapse"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}