
"use client";

import Link from 'next/link'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/icons'
import { useToast } from '@/hooks/use-toast';
import { signIn, signInWithGoogle, resetPassword } from '@/lib/firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { result, error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Login Failed",
        description: "Please check your email and password.",
        variant: "destructive",
      });
    } else {
       toast({
        title: "Success",
        description: "Logged in successfully.",
      });
      router.push('/');
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { result, error } = await signInWithGoogle();
    if (error) {
       toast({
        title: "Login Failed",
        description: "Could not log in with Google. Please try again.",
        variant: "destructive",
      });
    } else {
        toast({
            title: "Success",
            description: "Logged in successfully.",
        });
        router.push('/');
    }
    setIsLoading(false);
  }

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    const { error } = await resetPassword(email);
    if(error) {
        toast({
            title: "Error",
            description: "Failed to send password reset email.",
            variant: "destructive",
        })
    } else {
        toast({
            title: "Password Reset Email Sent",
            description: "Check your inbox for password reset instructions.",
        })
    }
    setIsLoading(false);
  }


  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4 font-body">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Icons.logo className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="ml-auto inline-block text-sm underline"
                    onClick={handlePasswordReset}
                    disabled={isLoading}
                  >
                    Forgot your password?
                  </Button>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                {isLoading ? 'Please wait...' : 'Login with Google'}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
