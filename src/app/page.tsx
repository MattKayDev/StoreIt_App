"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRightLeft,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Package,
  Package2,
  PlusCircle,
  Search,
  Settings,
  User,
  Warehouse,
  BarChart3,
  MapPin,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { mockItems, mockMovements, mockLocations } from '@/data/mock-data';
import { useToast } from '@/hooks/use-toast';
import { logOut } from '@/lib/firebase/auth';

export default function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // State for dialogs
  const [isCreateItemOpen, setCreateItemOpen] = useState(false);
  const [isMoveItemOpen, setMoveItemOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    setItems(mockItems);
    setMovements(mockMovements);
    setLocations(mockLocations);
  }, []);

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
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const handleCreateItem = (newItemData: Omit<Item, 'id'>) => {
    const newItem: Item = {
      id: `item-${Date.now()}`,
      ...newItemData,
    };
    setItems((prev) => [newItem, ...prev]);
    toast({
      title: 'Success!',
      description: `Item "${newItem.name}" has been created.`,
    });
    setCreateItemOpen(false);
  };

  const handleMoveItem = (newLocation: string) => {
    if (!selectedItem) return;

    const newMovement: Movement = {
      id: `move-${Date.now()}`,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      fromLocation: selectedItem.location,
      toLocation: newLocation,
      movedBy: 'Admin User',
      movedAt: new Date(),
    };
    
    setMovements((prev) => [newMovement, ...prev]);
    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id ? { ...item, location: newLocation } : item
      )
    );
    toast({
      title: "Item Moved",
      description: `"${selectedItem.name}" moved to ${newLocation}.`,
    });
    setMoveItemOpen(false);
    setSelectedItem(null);
  };

  if (!isMounted) {
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
          <div className="mt-auto p-4 hidden">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  Contact support for any questions about the inventory system.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
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
            <CreateItemDialogContent onCreate={handleCreateItem} locations={locations} />
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Admin User" />
                  <AvatarFallback>AU</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Tabs defaultValue="inventory">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="movements">Movement Log</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="inventory" className="mt-4">
               <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
                {filteredItems.map((item) => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    onMoveClick={() => {
                      setSelectedItem(item);
                      setMoveItemOpen(true);
                    }}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="movements" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Movement Log</CardTitle>
                  <CardDescription>
                    A log of all item movements within the system.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MovementLogTable movements={movements} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <Dialog open={isMoveItemOpen} onOpenChange={setMoveItemOpen}>
        <MoveItemDialogContent item={selectedItem} onMove={handleMoveItem} locations={locations} />
      </Dialog>
    </div>
  );
}

function ItemCard({ item, onMoveClick }: { item: Item; onMoveClick: () => void }) {
  return (
    <Card className="flex flex-col">
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
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
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

function MovementLogTable({ movements }: { movements: Movement[] }) {
  const formatDate = (date: Date) => new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
  }).format(date);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead className="hidden md:table-cell">Moved By</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((move) => (
          <TableRow key={move.id}>
            <TableCell className="font-medium">{move.itemName}</TableCell>
            <TableCell>{move.fromLocation}</TableCell>
            <TableCell>{move.toLocation}</TableCell>
            <TableCell className="hidden md:table-cell">{move.movedBy}</TableCell>
            <TableCell>{formatDate(move.movedAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CreateItemDialogContent({ onCreate, locations }: { onCreate: (data: Omit<Item, 'id'>) => void; locations: Location[] }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) {
      // Basic validation
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Name and Location are required.",
      })
      return;
    }
    onCreate({ name, description, location });
    // Reset form
    setName('');
    setDescription('');
    setLocation('');
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create New Item</DialogTitle>
        <DialogDescription>
          Fill in the details below to add a new item to your inventory.
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
        </div>
        <DialogFooter>
          <Button type="submit">Create Item</Button>
        </DialogFooter>
      </form>
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
