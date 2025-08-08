
import { db } from './config';
import { ref, push, get, set, remove, update } from 'firebase/database';
import type { Item, Location, LogEntry } from '@/lib/types';
import { auth } from './config';

// Generic function to fetch data
async function fetchData<T>(path: string): Promise<T[]> {
  try {
    const snapshot = await get(ref(db, path));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ ...data[key], id: key }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return [];
  }
}

// --- Log Entry Functions ---
async function createLogEntry(logData: Omit<LogEntry, 'id' | 'loggedAt' | 'loggedBy'>) {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("User not authenticated to create log entry.");
        }

        const newLog: Omit<LogEntry, 'id'> = {
            ...logData,
            loggedBy: currentUser.displayName || currentUser.email || "Anonymous",
            loggedAt: new Date().toISOString()
        };

        const newLogRef = push(ref(db, 'activity'));
        await set(newLogRef, newLog);
        return { ...newLog, id: newLogRef.key };

    } catch (error) {
        console.error("Error creating log entry:", error);
        return null;
    }
}

// --- Item Functions ---
export const getItems = () => fetchData<Item>('items');

export async function createItem(itemData: Omit<Item, 'id'>) {
  try {
    const newItemRef = push(ref(db, 'items'));
    await set(newItemRef, { ...itemData, id: newItemRef.key });
    
    const newItem = { ...itemData, id: newItemRef.key };

    await createLogEntry({
        itemId: newItem.id,
        itemName: newItem.name,
        action: 'Created',
        toLocation: newItem.location,
        details: `Item created`
    });

    return newItem;
  } catch (error) {
    console.error("Error creating item:", error);
    return null;
  }
}

export async function updateItem(itemId: string, itemData: Partial<Omit<Item, 'id'>>) {
    try {
        const itemRef = ref(db, `items/${itemId}`);
        const snapshot = await get(itemRef);
        if (!snapshot.exists()) {
            throw new Error("Item to update does not exist.");
        }
        const oldItem = snapshot.val();
        
        await update(itemRef, itemData);

        // Find what changed
        const changes = Object.keys(itemData)
            .filter(key => itemData[key as keyof typeof itemData] !== oldItem[key])
            .map(key => `${key} changed`)
            .join(', ');

        await createLogEntry({
            itemId: itemId,
            itemName: itemData.name || oldItem.name,
            action: 'Updated',
            details: changes || "Item details updated."
        });

        return true;
    } catch (error) {
        console.error("Error updating item:", error);
        return false;
    }
}

export async function deleteItem(itemId: string) {
    try {
        const itemRef = ref(db, `items/${itemId}`);
        const snapshot = await get(itemRef);
        if (!snapshot.exists()) {
            throw new Error("Item to delete does not exist.");
        }
        const item = snapshot.val();
        
        await remove(itemRef);

        await createLogEntry({
            itemId: itemId,
            itemName: item.name,
            action: 'Deleted',
            fromLocation: item.location,
            details: 'Item permanently deleted.'
        });

        return true;
    } catch (error) {
        console.error("Error deleting item:", error);
        return false;
    }
}

// --- Location Functions ---
export const getLocations = () => fetchData<Location>('locations');

export async function createLocation(locationData: Omit<Location, 'id'>) {
  try {
    const newLocationRef = push(ref(db, 'locations'));
    await set(newLocationRef, locationData);
    return { ...locationData, id: newLocationRef.key };
  } catch (error) {
    console.error("Error creating location:", error);
    return null;
  }
}

export async function updateLocation(locationId: string, locationData: Partial<Location>) {
    try {
        const locationRef = ref(db, `locations/${locationId}`);
        await update(locationRef, locationData);
        return true;
    } catch (error) {
        console.error("Error updating location:", error);
        return false;
    }
}

export async function deleteLocation(locationId: string) {
    try {
        await remove(ref(db, `locations/${locationId}`));
        return true;
    } catch (error) {
        console.error("Error deleting location:", error);
        return false;
    }
}


// --- Movement Functions ---
export const getActivityLog = () => fetchData<LogEntry>('activity');

export async function createMovement(movementData: {itemId: string, itemName: string, fromLocation: string, toLocation: string}) {
  try {
    
    // Update item's location
    const itemRef = ref(db, `items/${movementData.itemId}`);
    await update(itemRef, { location: movementData.toLocation });

    const log = await createLogEntry({
      ...movementData,
      action: 'Moved',
      details: `Moved from ${movementData.fromLocation} to ${movementData.toLocation}`
    });

    if(!log) {
        throw new Error("Failed to create log entry for movement");
    }

    return log;

  } catch (error) {
    console.error("Error creating movement:", error);
    return null;
  }
}
