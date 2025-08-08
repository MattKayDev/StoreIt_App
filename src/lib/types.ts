export interface Item {
  id: string;
  name: string;
  description: string;
  location: string;
  imageUrl?: string;
  ownerId: string;
}

export type LogAction = 'Created' | 'Updated' | 'Moved' | 'Deleted';

export interface LogEntry {
  id: string;
  itemId: string;
  itemName: string;
  action: LogAction;
  fromLocation?: string;
  toLocation?: string;
  details?: string;
  loggedBy: string;
  loggedAt: string; // Stored as ISO string in DB
  ownerId: string;
}


export interface Location {
  id: string;
  name:string;
  ownerId: string;
}

export interface Share {
    id: string;
    sharerId: string;
    sharerEmail: string;
    shareeEmail: string;
    status: 'pending' | 'accepted';
}
