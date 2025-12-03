"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuthClient } from '@/lib/supabase/auth-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleResetPassword = async (values: ForgotPasswordFormValues) => {
    setLoading(true);
    const { error } = await supabaseAuthClient.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/update-password`, // Redirect to a page where user can set new password
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Un lien de réinitialisation de mot de passe a été envoyé à votre email.");
      form.reset();
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Mot de passe oublié ?</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Envoyer le lien de réinitialisation
              </Button>
              <div className="text-center text-sm mt-4">
                <Link href="/login" className="text-primary hover:underline">
                  Retour à la connexion
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}