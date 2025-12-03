"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuthClient } from '@/lib/supabase/auth-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

// Define the form schema using Zod
const loginSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
});

const signupSchema = z.object({
  firstName: z.string().min(1, { message: "Le prénom est requis." }),
  lastName: z.string().min(1, { message: "Le nom est requis." }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
  confirmPassword: z.string().min(6, { message: "Veuillez confirmer votre mot de passe." }),
  acceptTerms: z.boolean().refine(val => val === true, { message: "Vous devez accepter les termes et conditions." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const handleSignIn = async (values: LoginFormValues) => {
    setLoading(true);
    const { error } = await supabaseAuthClient.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Connexion réussie !");
      router.push('/'); // Redirect to home page after login
    }
    setLoading(false);
  };

  const handleSignUp = async (values: SignupFormValues) => {
    setLoading(true);
    const { error: signUpError } = await supabaseAuthClient.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          first_name: values.firstName,
          last_name: values.lastName,
        },
        emailRedirectTo: `${window.location.origin}/confirm-email`, // Redirect to confirmation page
      },
    });

    if (signUpError) {
      toast.error(signUpError.message);
    } else {
      toast.success("Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.");
      router.push('/confirm-email'); // Redirect to a page to enter the confirmation code
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isLoginMode ? "Connexion" : "Inscription"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoginMode ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleSignIn)} className="space-y-4">
                <FormField
                  control={loginForm.control}
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
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="password">Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            {...field}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Se connecter
                </Button>
                <div className="text-center text-sm mt-4">
                  <Link href="/forgot-password" className="text-primary hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(handleSignUp)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={signupForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="firstName">Prénom</FormLabel>
                        <FormControl>
                          <Input id="firstName" placeholder="John" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="lastName">Nom</FormLabel>
                        <FormControl>
                          <Input id="lastName" placeholder="Doe" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={signupForm.control}
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
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="password">Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            {...field}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="confirmPassword">Confirmer le mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="********"
                            {...field}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          J'accepte les <Link href="#" className="text-primary hover:underline">termes et conditions</Link>
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  S'inscrire
                </Button>
              </form>
            </Form>
          )}
          <div className="mt-6 text-center text-sm">
            {isLoginMode ? (
              <>
                Pas encore de compte ?{' '}
                <Button variant="link" onClick={() => setIsLoginMode(false)} className="p-0 h-auto">
                  S'inscrire
                </Button>
              </>
            ) : (
              <>
                Déjà un compte ?{' '}
                <Button variant="link" onClick={() => setIsLoginMode(true)} className="p-0 h-auto">
                  Se connecter
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}