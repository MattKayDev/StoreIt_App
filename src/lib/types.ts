export interface Item {
  id: string;
  name: string;
  description: string;
  location: string;
}

export interface Movement {
  id: string;
  itemId: string;
  itemName: string;
  fromLocation: string;
  toLocation: string;
  movedBy: string;
  movedAt: string; // Stored as ISO string in DB
}

export interface Location {
    id: string;
    name: string;
}
