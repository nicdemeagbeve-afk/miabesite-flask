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
import { supabaseClient } from '@/lib/supabase/client'; // Import client-side Supabase client

// Environment variables for API configuration
const API_SERVER_URL = process.env.NEXT_PUBLIC_API_SERVER_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// Define the form schema using Zod
const formSchema = z.object({
  mainPrompt: z.string().max(1000, { message: "Le prompt principal ne peut pas dépasser 1000 caractères." }).optional(),
  ignoreGroupMessages: z.boolean().optional(),
  alwaysOnline: z.boolean().optional(),
  rejectCalls: z.boolean().optional(),
  rejectCallMessage: z.string().max(200, { message: "Le message de rejet ne peut pas dépasser 200 caractères." }).optional(),
});

type SettingsFormValues = z.infer<typeof formSchema>;

export default function PromptIaPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Placeholder for a unique user ID. In a real app, this would come from user auth.
  const currentUserId = "user_123"; 
  const currentInstanceId = "user_123"; // Assuming instanceId is same as userId for simplicity

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mainPrompt: "Tu es un assistant IA serviable et amical.", // Default prompt
      ignoreGroupMessages: false,
      alwaysOnline: false,
      rejectCalls: false,
      rejectCallMessage: "Désolé, je ne peux pas prendre d'appels pour le moment. Veuillez envoyer un message.",
    },
  });

  const rejectCallsWatch = form.watch("rejectCalls");
  const mainPromptWatch = form.watch("mainPrompt"); // Watch mainPrompt for character count

  // Fetch initial settings from Evolution API and Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      if (!API_SERVER_URL || !API_KEY) {
        toast.error("API_SERVER_URL ou API_KEY non configuré dans .env.local");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch Evolution API settings
        const evolutionResponse = await fetch(`${API_SERVER_URL}/settings/find/${currentInstanceId}`, {
          headers: {
            'apikey': API_KEY,
          },
        });

        if (!evolutionResponse.ok) {
          throw new Error(`HTTP error! status: ${evolutionResponse.status}`);
        }
        const fetchedEvolutionSettings = await evolutionResponse.json();

        // Fetch Main Prompt from Supabase
        const { data: aiPromptData, error: aiPromptError } = await supabaseClient
          .from('ai_prompts')
          .select('main_prompt')
          .eq('instance_id', currentInstanceId)
          .single();

        if (aiPromptError && aiPromptError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine
          console.error('Error fetching AI prompt from Supabase:', aiPromptError);
          toast.error("Erreur lors du chargement du prompt principal.");
        }

        // Map Evolution API settings and Supabase prompt to form fields
        form.reset({
          mainPrompt: aiPromptData?.main_prompt || "Tu es un assistant IA serviable et amical.",
          ignoreGroupMessages: fetchedEvolutionSettings.groups_ignore,
          alwaysOnline: fetchedEvolutionSettings.always_online,
          rejectCalls: fetchedEvolutionSettings.reject_call,
          rejectCallMessage: fetchedEvolutionSettings.msg_call || "Désolé, je ne peux pas prendre d'appels pour le moment. Veuillez envoyer un message.",
        });
        toast.success("Paramètres de l'IA chargés.");
      } catch (error) {
        console.error("Error fetching AI settings:", error);
        toast.error("Erreur lors du chargement des paramètres de l'IA.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [form, currentInstanceId, currentUserId]); // Added currentUserId to dependencies

  // Save settings to Evolution API and Supabase
  const onSubmit = async (values: SettingsFormValues) => {
    if (!API_SERVER_URL || !API_KEY) {
      toast.error("API_SERVER_URL ou API_KEY non configuré dans .env.local");
      return;
    }

    setIsSaving(true);
    try {
      // Save Evolution API settings
      const evolutionResponse = await fetch(`${API_SERVER_URL}/settings/set/${currentInstanceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
        body: JSON.stringify({
          reject_call: values.rejectCalls,
          msg_call: values.rejectCalls ? values.rejectCallMessage : "",
          groups_ignore: values.ignoreGroupMessages,
          always_online: values.alwaysOnline,
          read_messages: true,
          read_status: false,
          sync_full_history: false,
        }),
      });

      if (!evolutionResponse.ok) {
        throw new Error(`HTTP error! status: ${evolutionResponse.status}`);
      }

      // Save Main Prompt to Supabase
      const { error: upsertPromptError } = await supabaseClient
        .from('ai_prompts')
        .upsert({
          instance_id: currentInstanceId,
          user_id: currentUserId,
          main_prompt: values.mainPrompt,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'instance_id' });

      if (upsertPromptError) {
        console.error('Error saving AI prompt to Supabase:', upsertPromptError);
        toast.error("Erreur lors de la sauvegarde du prompt principal.");
        setIsSaving(false);
        return;
      }

      console.log("Settings saved:", values);
      toast.success("Paramètres de l'IA sauvegardés avec succès !");
    } catch (error) {
      console.error("Error saving AI settings:", error);
      toast.error("Erreur lors de la sauvegarde des paramètres de l'IA.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Prompt & IA 🧠</h1>
      <p className="mb-6 text-muted-foreground">
        C'est ici que vous personnalisez le comportement de votre IA.
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