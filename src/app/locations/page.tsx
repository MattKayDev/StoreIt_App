
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  MoreHorizontal,
  Package2,
  PlusCircle,
  Search,
  Settings,
  BarChart3,
  MapPin,
  Trash2,
  FilePenLine,
  History,
  Menu,
  Moon,
  Sun,
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
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from '@/components/ui/label';
import type { Location } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logOut } from '@/lib/firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getLocations, createLocation, updateLocation, deleteLocation } from '@/lib/firebase/database';
import { onAuthStateChanged } from 'firebase/auth';


export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  
  const [isCreateLocationOpen, setCreateLocationOpen] = useState(false);
  const [isEditLocationOpen, setEditLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const { setTheme } = useTheme();


   useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchLocations = async () => {
      const locationsData = await getLocations();
      setLocations(locationsData);
  }

  useEffect(() => {
    setIsMounted(true);
    if (user) {
      fetchLocations();
    }
  }, [user]);

  const handleLogout = async () => {
    const { error } = await logOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out.",
        variant: "destructive"
      });
    } else {
      router.push('/login');
    }
  };

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateLocation = async (name: string) => {
    const newLocation = await createLocation({ name });
    if(newLocation) {
        setLocations(prev => [newLocation, ...prev]);
        toast({
          title: 'Success!',
          description: `Location "${name}" has been created.`,
        });
        setCreateLocationOpen(false);
    } else {
        toast({
            title: 'Error',
            description: 'Failed to create location.',
            variant: 'destructive'
        });
    }
  };
  
  const handleEditLocation = async (name: string) => {
    if (!selectedLocation) return;
    const updatedLocationData = { ...selectedLocation, name };
    const success = await updateLocation(selectedLocation.id, updatedLocationData);
    if(success) {
        setLocations(prev => prev.map(loc => loc.id === selectedLocation.id ? {...loc, name} : loc));
        toast({
          title: 'Success!',
          description: `Location has been updated to "${name}".`,
        });
        setEditLocationOpen(false);
        setSelectedLocation(null);
    } else {
        toast({
            title: 'Error',
            description: 'Failed to update location.',
            variant: 'destructive'
        });
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    const success = await deleteLocation(locationId);
    if(success) {
        setLocations(prev => prev.filter(loc => loc.id !== locationId));
        toast({
          title: 'Location Deleted',
          description: 'The location has been successfully deleted.',
        });
    } else {
        toast({
          title: 'Error',
          description: 'Failed to delete location.',
          variant: 'destructive'
        });
    }
  };

  const getInitials = (displayName: string | null | undefined) => {
    if (!displayName) return 'U';
    const names = displayName.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return displayName[0];
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
              <span className="">StoreIt App</span>
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
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
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
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hidden"
              >
                <BarChart3 className="h-4 w-4" />
                Reports
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hidden"
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
                  <span className="sr-only">StoreIt App</span>
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
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
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
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search locations..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
          <Dialog open={isCreateLocationOpen} onOpenChange={setCreateLocationOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Add Location
              </Button>
            </DialogTrigger>
            <CreateLocationDialogContent onCreate={handleCreateLocation} />
          </Dialog>
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
          <Card>
            <CardHeader>
              <CardTitle>Locations</CardTitle>
              <CardDescription>
                Manage your inventory locations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLocations.map(location => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onSelect={() => {
                                    setSelectedLocation(location);
                                    setEditLocationOpen(true);
                                }}
                            >
                                <FilePenLine className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDeleteLocation(location.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
      <Dialog open={isEditLocationOpen} onOpenChange={setEditLocationOpen}>
        <EditLocationDialogContent 
            location={selectedLocation}
            onEdit={handleEditLocation}
        />
      </Dialog>
    </div>
  );
}

function CreateLocationDialogContent({ onCreate }: { onCreate: (name: string) => void }) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Location name is required.');
      return;
    }
    onCreate(name);
    setName('');
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create New Location</DialogTitle>
        <DialogDescription>
          Enter the name for the new location.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Create Location</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function EditLocationDialogContent({ location, onEdit }: { location: Location | null, onEdit: (name: string) => void }) {
    const [name, setName] = useState('');

    useEffect(() => {
        if(location) {
            setName(location.name);
        }
    }, [location])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            alert('Location name cannot be empty.');
            return;
        }
        onEdit(name);
    }
    
    if(!location) return null;

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Edit Location</DialogTitle>
                <DialogDescription>
                    Update the name for this location.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
                </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save Changes</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
}
