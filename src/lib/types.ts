export interface Item {
  id: string;
  name: string;
  description: string;
  location: string;
  imageUrl?: string;
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
}


export interface Location {
    id: string;
    name: string;
}
