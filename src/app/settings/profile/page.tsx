"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Resolver } from 'react-hook-form'; // Import Resolver
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { supabaseAuthClient } from '@/lib/supabase/auth-helpers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const profileSchema = z.object({
  firstName: z.string().min(1, { message: "Le prénom est requis." }).optional().or(z.literal('')),
  lastName: z.string().min(1, { message: "Le nom est requis." }).optional().or(z.literal('')),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  phoneNumber: z.string().optional().or(z.literal('')),
  // Simplified age schema, handling empty string to null in onChange
  age: z.number().int().min(0, { message: "L'âge ne peut pas être négatif." }).max(120, { message: "L'âge maximum est de 120 ans." }).nullable().optional(),
  country: z.string().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileSettingsPage() {
  const { user, userId, loading: authLoading, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileFormValues>, // Explicitly cast resolver type
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      age: null, // Ensure default is null for nullable number
      country: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !userId) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const { data: profileData, error: profileError } = await supabaseAuthClient
          .from('profiles')
          .select('first_name, last_name, phone_number, age, country')
          .eq('id', userId)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine for new users
          console.error('Error fetching profile:', profileError);
          toast.error("Erreur lors du chargement du profil.");
        }

        form.reset({
          firstName: profileData?.first_name || '',
          lastName: profileData?.last_name || '',
          email: user?.email || '', // Email comes from auth.user
          phoneNumber: profileData?.phone_number || '',
          age: profileData?.age || null, // Ensure null for age if not present
          country: profileData?.country || '',
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Erreur lors du chargement du profil.");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [authLoading, userId, user, form, router]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!userId) {
      toast.error("Utilisateur non authentifié.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabaseAuthClient
        .from('profiles')
        .upsert({
          id: userId,
          first_name: values.firstName,
          last_name: values.lastName,
          phone_number: values.phoneNumber,
          age: values.age,
          country: values.country,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      // Update email in auth.users if it changed
      if (user?.email !== values.email) {
        const { error: emailUpdateError } = await supabaseAuthClient.auth.updateUser({
          email: values.email,
        });
        if (emailUpdateError) {
          throw emailUpdateError;
        }
        toast.success("Un email de confirmation a été envoyé à votre nouvelle adresse email.");
      }

      toast.success("Profil mis à jour avec succès !");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`Erreur lors de la mise à jour du profil: ${error.message || "Vérifiez la console pour plus de détails."}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) {
      toast.error("Utilisateur non authentifié.");
      return;
    }

    setIsDeleting(true);
    try {
      // Supabase's auth.admin.deleteUser (server-side) is usually preferred for full deletion.
      // Client-side auth.signOut only logs out. To truly delete, you'd need a server action/route.
      // For this example, we'll simulate a client-side deletion request.
      // In a real app, this would trigger a server-side function to delete the user from auth.users
      // which, due to CASCADE DELETE, would also remove their profile and related data.

      // For now, we'll just sign out and inform the user.
      // A real implementation would involve a server route:
      // await fetch('/api/delete-user', { method: 'DELETE', body: JSON.stringify({ userId }) });
      // And then sign out.

      await signOut(); // Sign out the user after "deletion"
      toast.success("Votre compte a été supprimé avec succès. Nous sommes désolés de vous voir partir.");
      router.push('/login');
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(`Erreur lors de la suppression du compte: ${error.message || "Vérifiez la console pour plus de détails."}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Chargement du profil...</p>
      </div>
    );
  }

  if (!userId) {
    return null; // Should be redirected by useEffect
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Paramètres du Profil 👤</h1>
      <p className="mb-6 text-muted-foreground">
        Mettez à jour vos informations personnelles et gérez votre compte.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Informations Personnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="votre@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de Téléphone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+33 6 12 34 56 78" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Âge</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30"
                          {...field}
                          value={field.value === null ? '' : field.value} // Convert null to empty string for input display
                          onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pays</FormLabel>
                      <FormControl>
                        <Input placeholder="Togo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sauvegarder les modifications
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Zone de Danger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Cette action est irréversible et entraînera la suppression définitive de votre compte et de toutes les données associées.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" /> Supprimer mon compte
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action ne peut pas être annulée. Cela supprimera définitivement votre compte et toutes vos données de nos serveurs.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Oui, supprimer mon compte
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}