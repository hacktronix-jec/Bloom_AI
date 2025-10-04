'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
} from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const FormSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState<
    'email' | 'anonymous' | null
  >(null);
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  React.useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/profile');
    }
  }, [user, isUserLoading, router]);

  const handleEmailAuth = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading('email');
    try {
      // First, try to sign in
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: 'Signed In',
        description: 'Welcome back!',
      });
      router.push('/profile');
    } catch (signInError: any) {
      // If sign-in fails because the user doesn't exist, try to sign them up
      if (signInError.code === 'auth/user-not-found') {
        try {
          await createUserWithEmailAndPassword(auth, data.email, data.password);
          toast({
            title: 'Account Created',
            description: 'Welcome! Your account has been created.',
          });
          router.push('/profile');
        } catch (signUpError: any) {
          toast({
            variant: 'destructive',
            title: 'Sign Up Failed',
            description: signUpError.message,
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Sign In Failed',
          description: signInError.message,
        });
      }
    } finally {
      setIsLoading(null);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading('anonymous');
    try {
      await signInAnonymously(auth);
      toast({
        title: 'Signed In Anonymously',
        description: 'You can explore the app as a guest.',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Anonymous Sign In Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(null);
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Welcome to BloomWatch AI
          </CardTitle>
          <CardDescription>
            Sign in or create an account to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEmailAuth)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.com"
                        {...field}
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={!!isLoading}
              >
                {isLoading === 'email' && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign In / Sign Up
              </Button>
            </form>
          </Form>
          <Separator className="my-6" />
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Or continue as a guest
            </p>
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleAnonymousSignIn}
              disabled={!!isLoading}
            >
              {isLoading === 'anonymous' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In Anonymously
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}