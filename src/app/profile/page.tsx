'use client';

import * as React from 'react';
import { useUser, useAuth, useFirestore, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, LogOut, User as UserIcon } from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (user && userRef) {
      setDocumentNonBlocking(
        userRef,
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          lastLogin: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  }, [user, isUserLoading, router, userRef]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: error.message,
      });
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={user.photoURL || undefined} alt="User Avatar" />
            <AvatarFallback>
              {user.email ? user.email.charAt(0).toUpperCase() : <UserIcon />}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="font-headline text-2xl">
            {user.isAnonymous ? 'Guest User' : user.displayName || user.email}
          </CardTitle>
          <CardDescription>{user.isAnonymous ? 'Anonymous session' : user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="rounded-lg border bg-muted p-4 text-sm text-muted-foreground">
             <p><strong>User ID:</strong> {user.uid}</p>
             <p><strong>Last Sign-in:</strong> {new Date(user.metadata.lastSignInTime || Date.now()).toLocaleString()}</p>
             <p><strong>Account Created:</strong> {new Date(user.metadata.creationTime || Date.now()).toLocaleString()}</p>
           </div>

          <Button onClick={handleLogout} variant="destructive" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}