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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'; // Added this import

const confirmEmailSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  token: z.string().min(6, { message: "Le code de confirmation doit contenir 6 chiffres." }).max(6, { message: "Le code de confirmation doit contenir 6 chiffres." }),
});

type ConfirmEmailFormValues = z.infer<typeof confirmEmailSchema>;

export default function ConfirmEmailPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ConfirmEmailFormValues>({
    resolver: zodResolver(confirmEmailSchema),
    defaultValues: {
      email: '',
      token: '',
    },
  });

  const handleConfirmEmail = async (values: ConfirmEmailFormValues) => {
    setLoading(true);
    const { error } = await supabaseAuthClient.auth.verifyOtp({
      email: values.email,
      token: values.token,
      type: 'email',
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Email confirmé avec succès ! Vous pouvez maintenant vous connecter.");
      router.push('/login'); // Redirect to login page after successful confirmation
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Confirmer votre Email</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleConfirmEmail)} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Un code de confirmation a été envoyé à votre adresse email. Veuillez le saisir ci-dessous.
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
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="token">Code de Confirmation</FormLabel>
                    <FormControl>
                      <Input
                        id="token"
                        type="text"
                        placeholder="XXXXXX"
                        maxLength={6}
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
                Confirmer
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}