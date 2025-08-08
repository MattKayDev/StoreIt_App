
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRightLeft,
  LayoutDashboard,
  MoreHorizontal,
  Package2,
  PlusCircle,
  Search,
  Settings,
  Warehouse,
  BarChart3,
  MapPin,
  Trash2,
  FilePenLine,
  Upload,
  Camera,
  History,
  Menu,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Item, Movement, Location } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { logOut } from '@/lib/firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getItems, getLocations, createItem, createMovement, updateItem, deleteItem } from '@/lib/firebase/database';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { onAuthStateChanged } from 'firebase/auth';


export default function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // State for dialogs
  const [isCreateItemOpen, setCreateItemOpen] = useState(false);
  const [isEditItemOpen, setEditItemOpen] = useState(false);
  const [isMoveItemOpen, setMoveItemOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const { toast } = useToast();

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

  const fetchData = async () => {
    const [itemsData, locationsData] = await Promise.all([
        getItems(),
        getLocations(),
    ]);
    setItems(itemsData.sort((a, b) => a.name.localeCompare(b.name)));
    setLocations(locationsData);
  }

  useEffect(() => {
    setIsMounted(true);
    if (user) {
      fetchData();
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

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const handleCreateItem = async (newItemData: Omit<Item, 'id'>) => {
    const tempItem = await createItem(newItemData);

    if(!tempItem) {
       toast({
            title: 'Error',
            description: 'Failed to create item.',
            variant: 'destructive'
        })
        return;
    }
    
    await fetchData();
    toast({
      title: 'Success!',
      description: `Item "${newItemData.name}" has been created.`,
    });
    setCreateItemOpen(false);
  };

  const handleEditItem = async (itemData: Partial<Omit<Item, 'id'>>) => {
    if (!selectedItem) return;

    const success = await updateItem(selectedItem.id, itemData);
    if (success) {
      await fetchData();
      toast({
        title: 'Success!',
        description: `Item "${selectedItem.name}" has been updated.`,
      });
      setEditItemOpen(false);
      setSelectedItem(null);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update item.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const success = await deleteItem(itemId);
    if (success) {
      await fetchData();
      toast({
        title: 'Item Deleted',
        description: 'The item has been successfully deleted.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete item.',
        variant: 'destructive',
      });
    }
  };


  const handleMoveItem = async (newLocation: string) => {
    if (!selectedItem) return;

    const newMovement = await createMovement({
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      fromLocation: selectedItem.location,
      toLocation: newLocation,
    });
    
    if(newMovement) {
        fetchData(); // Refetch all data to ensure consistency
        toast({
          title: "Item Moved",
          description: `"${selectedItem.name}" moved to ${newLocation}.`,
        });
        setMoveItemOpen(false);
        setSelectedItem(null);
    } else {
         toast({
            title: 'Error',
            description: 'Failed to move item.',
            variant: 'destructive'
        })
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
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
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
                href="/movements"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <History className="h-4 w-4" />
                Movement Log
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
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
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
                  href="/movements"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <History className="h-5 w-5" />
                  Movement Log
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
                  placeholder="Search items..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
           <Dialog open={isCreateItemOpen} onOpenChange={setCreateItemOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <ItemDialogContent 
                onCreate={handleCreateItem} 
                locations={locations} 
                toast={toast}
            />
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
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
           <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onMoveClick={() => {
                  setSelectedItem(item);
                  setMoveItemOpen(true);
                }}
                onEditClick={() => {
                    setSelectedItem(item);
                    setEditItemOpen(true);
                }}
                onDeleteClick={() => handleDeleteItem(item.id)}
              />
            ))}
          </div>
        </main>
      </div>
      <Dialog open={isMoveItemOpen} onOpenChange={setMoveItemOpen}>
        <MoveItemDialogContent item={selectedItem} onMove={handleMoveItem} locations={locations} />
      </Dialog>
      <Dialog open={isEditItemOpen} onOpenChange={(isOpen) => { setEditItemOpen(isOpen); if (!isOpen) setSelectedItem(null); }}>
        <ItemDialogContent 
            item={selectedItem}
            onEdit={handleEditItem} 
            locations={locations}
            toast={toast}
        />
      </Dialog>
    </div>
  );
}

function ItemCard({ item, onMoveClick, onEditClick, onDeleteClick }: { item: Item; onMoveClick: () => void; onEditClick: () => void; onDeleteClick: () => void; }) {
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  
  return (
    <Card className="flex flex-col">
       {item.imageUrl && (
         <Dialog open={isImageModalOpen} onOpenChange={setImageModalOpen}>
            <DialogTrigger asChild>
                <div className="relative w-full h-48 bg-muted rounded-t-lg cursor-pointer">
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg"
                        data-ai-hint="product image"
                    />
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0">
                <DialogHeader>
                    <DialogTitle className="sr-only">{item.name}</DialogTitle>
                </DialogHeader>
                <Image 
                  src={item.imageUrl} 
                  alt={item.name} 
                  width={1200}
                  height={800}
                  className="rounded-lg object-contain"
                />
            </DialogContent>
         </Dialog>
        )}
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription className="flex items-center pt-2">
                    <Warehouse className="mr-2 h-4 w-4" />
                    {item.location}
                </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onSelect={onEditClick}>
                    <FilePenLine className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onDeleteClick} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onMoveClick}>
          <ArrowRightLeft className="mr-2 h-4 w-4" /> Move Item
        </Button>
      </CardFooter>
    </Card>
  );
}

function ItemDialogContent({
  item,
  onCreate,
  onEdit,
  locations,
  toast,
}: {
  item?: Item | null;
  onCreate?: (data: Omit<Item, 'id'>) => void;
  onEdit?: (data: Partial<Omit<Item, 'id'>>) => void;
  locations: Location[];
  toast: (args: any) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isCameraMode, setCameraMode] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isEditMode = !!item;

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description);
      setLocation(item.location);
      setImageUrl(item.imageUrl || null);
    } else {
        setName('');
        setDescription('');
        setLocation('');
        setImageUrl(null);
    }
  }, [item]);

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
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      };
      getCameraPermission();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    }
  }, [isCameraMode, toast]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
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
        setImageUrl(dataUrl);
        setCameraMode(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Name and Location are required.',
      });
      return;
    }

    const itemData = { name, description, location, imageUrl: imageUrl || '' };

    if (isEditMode && onEdit) {
        onEdit(itemData);
    } else if (!isEditMode && onCreate) {
        onCreate(itemData);
    }
  };
  
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{isEditMode ? `Edit "${item.name}"` : 'Create New Item'}</DialogTitle>
        <DialogDescription>
          {isEditMode ? 'Update the details for this item.' : 'Fill in the details below to add a new item.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">Location</Label>
            <Select onValueChange={setLocation} value={location}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                    {locations.map(loc => (
                        <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
            <div className="grid grid-cols-4 items-center gap-4">
                 <Label className="text-right">Image</Label>
                 <div className="col-span-3 flex flex-col gap-2">
                    {imageUrl && <Image src={imageUrl} alt="Item image" width={100} height={100} className="rounded-md object-cover" />}
                    
                    <div className="flex gap-2">
                        {!imageUrl ? (
                        <>
                            <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                                <Upload className="mr-2 h-4 w-4" /> Upload
                            </Button>
                            <input type="file" id="file-upload" accept="image/*" onChange={handleFileChange} className="hidden" />

                            <Button type="button" variant="outline" size="sm" onClick={() => setCameraMode(true)}>
                                <Camera className="mr-2 h-4 w-4" /> Camera
                            </Button>
                        </>
                        ) : (
                            <Button type="button" variant="destructive" size="sm" onClick={handleRemoveImage}>
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                            </Button>
                        )}
                    </div>
                 </div>
            </div>

        </div>
        <DialogFooter>
          <Button type="submit">{isEditMode ? "Save Changes" : "Create Item"}</Button>
        </DialogFooter>
      </form>
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
    </DialogContent>
  );
}


function MoveItemDialogContent({ item, onMove, locations }: { item: Item | null, onMove: (newLocation: string) => void, locations: Location[] }) {
    const [newLocation, setNewLocation] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (item) {
            setNewLocation('');
        }
    }, [item]);
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newLocation) {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "New location is required.",
        });
        return;
      }
      onMove(newLocation);
    };

    if (!item) return null;

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Move "{item.name}"</DialogTitle>
                <DialogDescription>
                    Current location: {item.location}. Select the new location for this item.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="py-4">
                    <Label htmlFor="new-location">New Location</Label>
                     <Select onValueChange={setNewLocation} value={newLocation}>
                        <SelectTrigger id="new-location" className="mt-2">
                            <SelectValue placeholder="Select a new location" />
                        </SelectTrigger>
                        <SelectContent>
                            {locations.filter(loc => loc.name !== item.location).map(loc => (
                                <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button type="submit">Move Item</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}

    
