
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package2,
  Settings,
  BarChart3,
  MapPin,
  History,
  Menu,
  Download,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { LogEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logOut } from '@/lib/firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getActivityLog } from '@/lib/firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { Badge } from '@/components/ui/badge';


export default function ActivityPage() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
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

  useEffect(() => {
    setIsMounted(true);
    if (user) {
      const fetchLog = async () => {
        const logData = await getActivityLog();
        setLogEntries(logData.map(l => ({ ...l, loggedAt: new Date(l.loggedAt).toISOString() })).sort((a,b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()));
      }
      fetchLog();
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
  
  const handleExportCSV = () => {
    const headers = ["ID", "Timestamp", "Item Name", "Action", "Details", "User"];
    const csvRows = [
      headers.join(','),
      ...logEntries.map(log => [
        log.id,
        new Date(log.loggedAt).toLocaleString(),
        log.itemName,
        log.action,
        `"${log.details?.replace(/"/g, '""') || ''}"`,
        log.loggedBy
      ].join(','))
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "activity_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <MapPin className="h-4 w-4" />
                Locations
              </Link>
              <Link
                href="/activity"
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
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
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <MapPin className="h-5 w-5" />
                  Locations
                </Link>
                <Link
                  href="/activity"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
                >
                  <History className="h-5 w-5" />
                  Activity Log
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1" />
           <Button onClick={handleExportCSV} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
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
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>
                  A log of all item creations, updates, movements, and deletions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ActivityLogTable logEntries={logEntries} />
            </CardContent>
            </Card>
        </main>
      </div>
    </div>
  );
}


function ActivityLogTable({ logEntries }: { logEntries: LogEntry[] }) {
  const formatDate = (date: string) => new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date(date));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden sm:table-cell">Date</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Details</TableHead>
          <TableHead className="hidden md:table-cell">User</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logEntries.map((log) => (
          <TableRow key={log.id}>
             <TableCell className="hidden sm:table-cell">{formatDate(log.loggedAt)}</TableCell>
            <TableCell className="font-medium">{log.itemName}</TableCell>
            <TableCell>
               <Badge 
                  variant={
                    log.action === 'Created' ? 'default' : 
                    log.action === 'Updated' ? 'secondary' : 
                    log.action === 'Moved' ? 'outline' : 
                    'destructive'
                  }
                >
                  {log.action}
                </Badge>
            </TableCell>
            <TableCell>{log.details}</TableCell>
            <TableCell className="hidden md:table-cell">{log.loggedBy}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
