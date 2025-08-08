import type { Item, Movement, Location } from '@/lib/types';

// This file is no longer used for data, but is kept for reference or future use.

export const mockLocations: Location[] = [];

export const mockItems: Item[] = [];

export const mockMovements: Omit<Movement,'movedAt'> & {movedAt: Date}[] = [];
