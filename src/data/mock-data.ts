import type { Item, Movement, Location } from '@/lib/types';

export const mockLocations: Location[] = [
  { id: 'loc-1', name: 'Warehouse A, Shelf 3' },
  { id: 'loc-2', name: 'Office Storage, Cabinet 2' },
  { id: 'loc-3', name: 'Warehouse B, Rack 1' },
  { id: 'loc-4', name: 'Tech Hub, Desk 5' },
  { id: 'loc-5', name: 'Conference Room Alpha' },
  { id: 'loc-6', name: 'Warehouse A, Pallet 5' },
  { id: 'loc-7', name: 'Office Storage, Cabinet 1' },
  { id: 'loc-8', name: 'IT Closet' },
];

export const mockItems: Item[] = [
  {
    id: 'item-1',
    name: 'Heavy-Duty Laptop',
    description: '15-inch developer laptop with 32GB RAM and 1TB SSD.',
    location: 'Warehouse A, Shelf 3',
  },
  {
    id: 'item-2',
    name: 'Wireless Keyboard',
    description: 'Ergonomic mechanical keyboard, silent switches.',
    location: 'Office Storage, Cabinet 2',
  },
  {
    id: 'item-3',
    name: '4K Monitor',
    description: '27-inch IPS display with high color accuracy.',
    location: 'Warehouse B, Rack 1',
  },
  {
    id: 'item-4',
    name: 'Docking Station',
    description: 'Thunderbolt 4 dock with multiple ports.',
    location: 'Tech Hub, Desk 5',
  },
  {
    id: 'item-5',
    name: 'Projector',
    description: '1080p conference room projector.',
    location: 'Conference Room Alpha',
  },
  {
    id: 'item-6',
    name: 'Office Chairs',
    description: 'Ergonomic mesh back office chairs, set of 4.',
    location: 'Warehouse A, Pallet 5',
  },
  {
    id: 'item-7',
    name: 'Whiteboard Markers',
    description: 'Pack of 50 assorted color whiteboard markers.',
    location: 'Office Storage, Cabinet 1',
  },
    {
    id: 'item-8',
    name: 'Networking Cable',
    description: '100ft Cat-7 ethernet cable spool.',
    location: 'IT Closet',
  },
];

export const mockMovements: Movement[] = [
  {
    id: 'move-1',
    itemId: 'item-2',
    itemName: 'Wireless Keyboard',
    fromLocation: 'Warehouse A, Shelf 4',
    toLocation: 'Office Storage, Cabinet 2',
    movedBy: 'Alice',
    movedAt: new Date('2023-10-26T10:00:00Z'),
  },
  {
    id: 'move-2',
    itemId: 'item-4',
    itemName: 'Docking Station',
    fromLocation: 'Receiving Dock',
    toLocation: 'Tech Hub, Desk 5',
    movedBy: 'Bob',
    movedAt: new Date('2023-10-26T11:30:00Z'),
  },
  {
    id: 'move-3',
    itemId: 'item-5',
    itemName: 'Projector',
    fromLocation: 'Warehouse B, Rack 2',
    toLocation: 'Conference Room Alpha',
    movedBy: 'Charlie',
    movedAt: new Date('2023-10-27T14:00:00Z'),
  },
    {
    id: 'move-4',
    itemId: 'item-1',
    itemName: 'Heavy-Duty Laptop',
    fromLocation: 'Tech Hub, Desk 1',
    toLocation: 'Warehouse A, Shelf 3',
    movedBy: 'Alice',
    movedAt: new Date('2023-10-28T09:15:00Z'),
  },
];

    