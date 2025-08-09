
import { db } from './config';
import { ref, push, get, set, remove, update, query, orderByChild, equalTo } from 'firebase/database';
import type { Item, Location, LogEntry, Share } from '@/lib/types';
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

async function getSharedWithMeIds(): Promise<string[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];

    const sharesRef = ref(db, 'shares');
    const q = query(sharesRef, orderByChild('shareeEmail'), equalTo(currentUser.email));
    const snapshot = await get(q);

    if (snapshot.exists()) {
        const shares = snapshot.val();
        return Object.values(shares)
            .filter((share: any) => share.status === 'accepted')
            .map((share: any) => share.sharerId);
    }
    return [];
}


// --- Item Functions ---
export async function getItems(): Promise<Item[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];

    const ownedItemsQuery = query(ref(db, 'items'), orderByChild('ownerId'), equalTo(currentUser.uid));
    const ownedItemsSnapshot = await get(ownedItemsQuery);
    let items: Item[] = [];
    if (ownedItemsSnapshot.exists()) {
        const ownedItemsData = ownedItemsSnapshot.val();
        items = Object.keys(ownedItemsData).map(key => ({ ...ownedItemsData[key], id: key }));
    }

    const sharedWithUserIds = await getSharedWithMeIds();
    for (const ownerId of sharedWithUserIds) {
        const sharedItemsQuery = query(ref(db, 'items'), orderByChild('ownerId'), equalTo(ownerId));
        const sharedItemsSnapshot = await get(sharedItemsQuery);
        if (sharedItemsSnapshot.exists()) {
            const sharedItemsData = sharedItemsSnapshot.val();
            const sharedItems = Object.keys(sharedItemsData).map(key => ({ ...sharedItemsData[key], id: key }));
            items = [...items, ...sharedItems];
        }
    }
    
    return items;
};

export async function createItem(itemData: Omit<Item, 'id'|'ownerId'>) {
  try {
    const currentUser = auth.currentUser;
    if(!currentUser) throw new Error("User not authenticated");

    const itemWithOwner = {...itemData, ownerId: currentUser.uid};
    const newItemRef = push(ref(db, 'items'));
    await set(newItemRef, { ...itemWithOwner });
    
    const newItem = { ...itemWithOwner, id: newItemRef.key! };

    await createLogEntry({
        itemId: newItem.id,
        itemName: newItem.name,
        action: 'Created',
        toLocation: newItem.location,
        details: `Item created`,
        ownerId: currentUser.uid,
    });

    return newItem;
  } catch (error) {
    console.error("Error creating item:", error);
    return null;
  }
}

export async function updateItem(itemId: string, itemData: Partial<Omit<Item, 'id' | 'ownerId'>>) {
    try {
        const currentUser = auth.currentUser;
        if(!currentUser) throw new Error("User not authenticated");

        const itemRef = ref(db, `items/${itemId}`);
        const snapshot = await get(itemRef);
        if (!snapshot.exists()) {
            throw new Error("Item to update does not exist.");
        }
        const oldItem = snapshot.val();
        if(oldItem.ownerId !== currentUser.uid) {
            throw new Error("User does not have permission to update this item.");
        }
        
        await update(itemRef, itemData);

        const changes = Object.keys(itemData)
            .filter(key => itemData[key as keyof typeof itemData] !== oldItem[key])
            .map(key => `${key} changed`)
            .join(', ');

        await createLogEntry({
            itemId: itemId,
            itemName: itemData.name || oldItem.name,
            action: 'Updated',
            details: changes || "Item details updated.",
            ownerId: currentUser.uid,
        });

        return true;
    } catch (error) {
        console.error("Error updating item:", error);
        return false;
    }
}

export async function deleteItem(itemId: string) {
    try {
        const currentUser = auth.currentUser;
        if(!currentUser) throw new Error("User not authenticated");

        const itemRef = ref(db, `items/${itemId}`);
        const snapshot = await get(itemRef);
        if (!snapshot.exists()) {
            throw new Error("Item to delete does not exist.");
        }
        const item = snapshot.val();
        if(item.ownerId !== currentUser.uid) {
            throw new Error("User does not have permission to delete this item.");
        }
        
        await remove(itemRef);

        await createLogEntry({
            itemId: itemId,
            itemName: item.name,
            action: 'Deleted',
            fromLocation: item.location,
            details: 'Item permanently deleted.',
            ownerId: currentUser.uid,
        });

        return true;
    } catch (error) {
        console.error("Error deleting item:", error);
        return false;
    }
}

// --- Location Functions ---
export async function getLocations(): Promise<Location[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];

    const ownedQuery = query(ref(db, 'locations'), orderByChild('ownerId'), equalTo(currentUser.uid));
    const ownedSnapshot = await get(ownedQuery);
    let locations: Location[] = [];
    if(ownedSnapshot.exists()){
        const ownedData = ownedSnapshot.val();
        locations = Object.keys(ownedData).map(key => ({...ownedData[key], id: key}));
    }
    
    const sharedWithUserIds = await getSharedWithMeIds();
    for (const ownerId of sharedWithUserIds) {
        const sharedQuery = query(ref(db, 'locations'), orderByChild('ownerId'), equalTo(ownerId));
        const sharedSnapshot = await get(sharedQuery);
        if (sharedSnapshot.exists()) {
             const sharedData = sharedSnapshot.val();
            const sharedLocations = Object.keys(sharedData).map(key => ({...sharedData[key], id: key}));
            locations = [...locations, ...sharedLocations];
        }
    }
    
    return locations;
};

export async function createLocation(locationData: Omit<Location, 'id' | 'ownerId'>) {
  try {
     const currentUser = auth.currentUser;
    if(!currentUser) throw new Error("User not authenticated");
    
    const locationWithOwner = {...locationData, ownerId: currentUser.uid};
    const newLocationRef = push(ref(db, 'locations'));
    await set(newLocationRef, locationWithOwner);
    return { ...locationWithOwner, id: newLocationRef.key };
  } catch (error) {
    console.error("Error creating location:", error);
    return null;
  }
}

export async function updateLocation(locationId: string, locationData: Partial<Location>) {
    try {
        const currentUser = auth.currentUser;
        if(!currentUser) throw new Error("User not authenticated");

        const locRef = ref(db, `locations/${locationId}`);
        const snapshot = await get(locRef);
        if(!snapshot.exists() || snapshot.val().ownerId !== currentUser.uid) {
            throw new Error("Permission denied");
        }
        await update(locRef, locationData);
        return true;
    } catch (error) {
        console.error("Error updating location:", error);
        return false;
    }
}

export async function deleteLocation(locationId: string) {
    try {
        const currentUser = auth.currentUser;
        if(!currentUser) throw new Error("User not authenticated");
        const locRef = ref(db, `locations/${locationId}`);
        const snapshot = await get(locRef);
        if(!snapshot.exists() || snapshot.val().ownerId !== currentUser.uid) {
            throw new Error("Permission denied");
        }
        await remove(locRef);
        return true;
    } catch (error) {
        console.error("Error deleting location:", error);
        return false;
    }
}


// --- Activity Log Functions ---
export async function getActivityLog(): Promise<LogEntry[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];

    const ownedQuery = query(ref(db, 'activity'), orderByChild('ownerId'), equalTo(currentUser.uid));
    const ownedSnapshot = await get(ownedQuery);
    let logs: LogEntry[] = [];
    if(ownedSnapshot.exists()){
        const ownedData = ownedSnapshot.val();
        logs = Object.keys(ownedData).map(key => ({...ownedData[key], id: key}));
    }
    
    const sharedWithUserIds = await getSharedWithMeIds();
    for (const ownerId of sharedWithUserIds) {
        const sharedQuery = query(ref(db, 'activity'), orderByChild('ownerId'), equalTo(ownerId));
        const sharedSnapshot = await get(sharedQuery);
        if (sharedSnapshot.exists()) {
             const sharedData = sharedSnapshot.val();
            const sharedLogs = Object.keys(sharedData).map(key => ({...sharedData[key], id: key}));
            logs = [...logs, ...sharedLogs];
        }
    }

    return logs;
};

export async function createMovement(movementData: {itemId: string, itemName: string, fromLocation: string, toLocation: string}) {
  try {
    const currentUser = auth.currentUser;
    if(!currentUser) throw new Error("User not authenticated");

    const itemRef = ref(db, `items/${movementData.itemId}`);
    const itemSnapshot = await get(itemRef);
    if (!itemSnapshot.exists()) throw new Error("Item not found");
    const item = itemSnapshot.val();

    if(item.ownerId !== currentUser.uid) {
        throw new Error("Permission denied to move item");
    }
    
    await update(itemRef, { location: movementData.toLocation });

    const log = await createLogEntry({
      ...movementData,
      action: 'Moved',
      details: `Moved from ${movementData.fromLocation} to ${movementData.toLocation}`,
      ownerId: currentUser.uid,
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

// --- Sharing Functions ---

export async function createShare(shareeEmail: string): Promise<Share | null> {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) return null;

    // Check if user exists
    const usersRef = ref(db, 'users');
    const q = query(usersRef, orderByChild('email'), equalTo(shareeEmail));
    const userSnapshot = await get(q);
    if (!userSnapshot.exists()) {
        console.error("Attempted to share with a non-existent user.");
        // To provide better feedback, you might want to handle this case in the UI.
        // For now, we'll prevent the share from being created.
        return null;
    }

    const newShare: Omit<Share, 'id'> = {
        sharerId: currentUser.uid,
        sharerEmail: currentUser.email,
        shareeEmail: shareeEmail,
        status: 'pending',
    };
    const shareRef = push(ref(db, 'shares'));
    await set(shareRef, newShare);
    return { ...newShare, id: shareRef.key! };
}

export async function getMyShares(): Promise<Share[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];

    const sharesRef = ref(db, 'shares');
    const q = query(sharesRef, orderByChild('sharerId'), equalTo(currentUser.uid));
    const snapshot = await get(q);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ ...data[key], id: key }));
    }
    return [];
}

export async function getPendingShares(): Promise<Share[]> {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) return [];

    const sharesRef = ref(db, 'shares');
    const q = query(sharesRef, orderByChild('shareeEmail'), equalTo(currentUser.email));
    const snapshot = await get(q);

    if (snapshot.exists()) {
        const data = snapshot.val();
        const pendingShares = Object.keys(data)
            .map(key => ({ ...data[key], id: key }))
            .filter(share => share.status === 'pending');
        return pendingShares;
    }
    return [];
}


export async function acceptShare(shareId: string): Promise<boolean> {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    try {
        const shareRef = ref(db, `shares/${shareId}`);
        const snapshot = await get(shareRef);
        if (snapshot.exists() && snapshot.val().shareeEmail === currentUser.email) {
            await update(shareRef, { status: 'accepted' });
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error accepting share:", error);
        return false;
    }
}

export async function declineShare(shareId: string): Promise<boolean> {
     const currentUser = auth.currentUser;
    if (!currentUser) return false;
    try {
        const shareRef = ref(db, `shares/${shareId}`);
         const snapshot = await get(shareRef);
        if (snapshot.exists() && snapshot.val().shareeEmail === currentUser.email) {
            await remove(shareRef);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error declining share:", error);
        return false;
    }
}


export async function deleteShare(shareId: string): Promise<boolean> {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    try {
        const shareRef = ref(db, `shares/${shareId}`);
        const snapshot = await get(shareRef);
        if (snapshot.exists() && snapshot.val().sharerId === currentUser.uid) {
            await remove(shareRef);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error deleting share:", error);
        return false;
    }
}

// Helper to store user email on signup for share lookups
export async function saveUserEmail(user: any) {
    if(!user || !user.email) return;
    try {
        const userRef = ref(db, `users/${user.uid}`);
        await set(userRef, { email: user.email });
    } catch(error) {
        console.error("Error saving user email", error);
    }
}

    