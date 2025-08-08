import { db } from './config';
import { ref, push, get, set, remove, update } from 'firebase/database';
import type { Item, Location, Movement } from '@/lib/types';

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

// --- Item Functions ---
export const getItems = () => fetchData<Item>('items');

export async function createItem(itemData: Omit<Item, 'id'>) {
  try {
    const newItemRef = push(ref(db, 'items'));
    await set(newItemRef, itemData);
    return { ...itemData, id: newItemRef.key };
  } catch (error) {
    console.error("Error creating item:", error);
    return null;
  }
}

export async function updateItem(itemId: string, itemData: Partial<Omit<Item, 'id'>>) {
    try {
        await update(ref(db, `items/${itemId}`), itemData);
        return true;
    } catch (error) {
        console.error("Error updating item:", error);
        return false;
    }
}

export async function deleteItem(itemId: string) {
    try {
        await remove(ref(db, `items/${itemId}`));
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
        // Using update instead of set to avoid removing fields not present in locationData
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
export const getMovements = () => fetchData<Movement>('movements');

export async function createMovement(movementData: Omit<Movement, 'id' | 'movedAt' | 'movedBy'>) {
  try {
    const newMovement: Omit<Movement, 'id'> = {
        ...movementData,
        movedBy: "Admin User", // Placeholder, you might want to pass the current user
        movedAt: new Date().toISOString()
    }

    const newMovementRef = push(ref(db, 'movements'));
    await set(newMovementRef, newMovement);

    // Update item's location
    const itemRef = ref(db, `items/${movementData.itemId}`);
    const itemSnapshot = await get(itemRef);
    if(itemSnapshot.exists()){
       await update(itemRef, { location: movementData.toLocation });
    }

    return { ...newMovement, id: newMovementRef.key };
  } catch (error) {
    console.error("Error creating movement:", error);
    return null;
  }
}
