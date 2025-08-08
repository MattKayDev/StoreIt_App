
"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import {
  LayoutDashboard,
  Package2,
  Settings,
  History,
  MapPin,
  Menu,
  Upload,
  Camera,
  Trash2,
  Moon,
  Sun,
  Share2,
  Check,
  X,
  Send,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { logOut, updateUserProfile, updateUserPassword } from '@/lib/firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { Share } from '@/lib/types';
import { createShare, getMyShares, getPendingShares, acceptShare, declineShare, deleteShare } from '@/lib/firebase/database';
import { Badge } from '@/components/ui/badge';


export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [myShares, setMyShares] = useState<Share[]>([]);
  const [pendingShares, setPendingShares] = useState<Share[]>([]);
  const [shareEmail, setShareEmail] = useState("");

  const [isCameraMode, setCameraMode] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setTheme } = useTheme();


  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setPhotoURL(currentUser.photoURL || null);
        fetchShares(currentUser);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchShares = async (currentUser: any) => {
      if(!currentUser) return;
      const [mySharesData, pendingSharesData] = await Promise.all([
          getMyShares(),
          getPendingShares(),
      ]);
      setMyShares(mySharesData);
      setPendingShares(pendingSharesData);
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return name[0];
  };

  const handleLogout = async () => {
    await logOut();
    router.push('/login');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await updateUserProfile({ displayName, photoURL });
    if (error) {
      toast({ title: "Error updating profile", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
       // Force a reload of the user to get the latest data
      await auth.currentUser?.reload();
      setUser({ ...auth.currentUser });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if(newPassword.length < 6) {
        toast({ title: "Password must be at least 6 characters long.", variant: "destructive" });
        return;
    }
    const { error } = await updateUserPassword(newPassword);
    if (error) {
       toast({ title: "Error changing password", description: "Please log out and log back in to change your password.", variant: "destructive" });
    } else {
      toast({ title: "Password Changed", description: "Your password has been successfully changed." });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  useEffect(() => {
    if (isCameraMode) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
        }
      };
      getCameraPermission();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    }
  }, [isCameraMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        setPhotoURL(dataUrl);
        setCameraMode(false);
      }
    }
  };

    const handleShare = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shareEmail) {
            toast({ title: "Email required", description: "Please enter an email to share with.", variant: "destructive" });
            return;
        }
        if (shareEmail === user.email) {
            toast({ title: "Cannot share with yourself", variant: "destructive" });
            return;
        }
        const result = await createShare(shareEmail);
        if (result) {
            toast({ title: "Invitation Sent", description: `An invitation has been sent to ${shareEmail}.` });
            setShareEmail('');
            fetchShares(user);
        } else {
            toast({ title: "Error", description: "Failed to send invitation.", variant: "destructive" });
        }
    };

    const handleAcceptShare = async (shareId: string) => {
        const success = await acceptShare(shareId);
        if (success) {
            toast({ title: "Share Accepted", description: "You can now access the shared items." });
            fetchShares(user);
        } else {
            toast({ title: "Error", description: "Failed to accept share.", variant: "destructive" });
        }
    };

    const handleDeclineShare = async (shareId: string) => {
        const success = await declineShare(shareId);
        if (success) {
            toast({ title: "Share Declined" });
            fetchShares(user);
        } else {
            toast({ title: "Error", description: "Failed to decline share.", variant: "destructive" });
        }
    };

    const handleDeleteShare = async (shareId: string) => {
        const success = await deleteShare(shareId);
        if (success) {
            toast({ title: "Share Revoked" });
            fetchShares(user);
        } else {
            toast({ title: "Error", description: "Failed to revoke share.", variant: "destructive" });
        }
    };

  if (!isMounted || !user) {
    return null; // or a loading spinner
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6 text-primary" />
              <span className="">InvenTrack</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/locations"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <MapPin className="h-4 w-4" />
                Locations
              </Link>
              <Link
                href="/activity"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <History className="h-4 w-4" />
                Activity Log
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <SheetHeader>
                <SheetTitle className="sr-only">Main Menu</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-2 text-lg font-medium">
                 <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Package2 className="h-6 w-6 text-primary" />
                  <span className="sr-only">InvenTrack</span>
                </Link>
                <Link
                  href="/"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/locations"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <MapPin className="h-5 w-5" />
                  Locations
                </Link>
                <Link
                  href="/activity"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <History className="h-5 w-5" />
                  Activity Log
                </Link>
                 <Link
                  href="/settings"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1" />
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push('/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onSelect={() => setTheme('light')}>Light</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setTheme('dark')}>Dark</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setTheme('system')}>System</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="grid gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Manage Sharing</CardTitle>
                        <CardDescription>Share your items and locations with other users or manage pending invitations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {pendingShares.length > 0 && (
                            <div className="space-y-2">
                                <Label>Pending Invitations</Label>
                                <div className="space-y-2 rounded-lg border p-2">
                                    {pendingShares.map(share => (
                                        <div key={share.id} className="flex items-center justify-between">
                                            <p className="text-sm">Invitation from <span className="font-medium">{share.sharerEmail}</span></p>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleAcceptShare(share.id)}><Check className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDeclineShare(share.id)}><X className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Share with a new user</Label>
                             <form onSubmit={handleShare} className="flex gap-2">
                                <Input type="email" placeholder="Enter user's email" value={shareEmail} onChange={e => setShareEmail(e.target.value)} />
                                <Button type="submit">
                                    <Send className="mr-2 h-4 w-4" /> Share
                                </Button>
                            </form>
                        </div>

                        <div className="space-y-2">
                           <Label>Currently Sharing With</Label>
                           {myShares.length > 0 ? (
                            <div className="space-y-2 rounded-lg border p-2">
                                {myShares.map(share => (
                                    <div key={share.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">{share.shareeEmail}</p>
                                            <Badge variant={share.status === 'pending' ? 'secondary' : 'default'}>{share.status}</Badge>
                                        </div>
                                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDeleteShare(share.id)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                            </div>
                           ) : <p className="text-sm text-muted-foreground">You are not currently sharing your items with anyone.</p> }
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Update your display name and profile picture.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Display Name</Label>
                                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Profile Picture</Label>
                                <div className="flex items-center gap-4">
                                     <Avatar className="h-20 w-20">
                                        <AvatarImage src={photoURL || undefined} />
                                        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('photo-upload')?.click()}>
                                            <Upload className="mr-2 h-4 w-4" /> Upload
                                        </Button>
                                        <input type="file" id="photo-upload" accept="image/*" onChange={handleFileChange} className="hidden" />

                                        <Button type="button" variant="outline" size="sm" onClick={() => setCameraMode(true)}>
                                            <Camera className="mr-2 h-4 w-4" /> Camera
                                        </Button>
                                        {photoURL && (
                                            <Button type="button" variant="destructive" size="sm" onClick={() => setPhotoURL(null)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Remove
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                             <Button type="submit">Save Profile</Button>
                        </form>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your account password. After a successful change, you will be logged out.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                            </div>
                             <Button type="submit">Change Password</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
      </div>

       <Dialog open={isCameraMode} onOpenChange={setCameraMode}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Take a picture</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
                <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted />
                {hasCameraPermission === false && (
                    <Alert variant="destructive">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access to use this feature.
                        </AlertDescription>
                    </Alert>
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>
            <DialogFooter>
                <Button onClick={handleCapture} disabled={!hasCameraPermission}>Take Photo</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
