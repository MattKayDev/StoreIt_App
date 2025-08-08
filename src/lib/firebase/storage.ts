import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from './config';

const storage = getStorage(app);

export async function uploadImage(fileAsDataURL: string, itemId: string): Promise<string | null> {
  try {
    const storageRef = ref(storage, `items/${itemId}/${Date.now()}`);
    const snapshot = await uploadString(storageRef, fileAsDataURL, 'data_url');
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

export async function deleteImage(imageUrl: string): Promise<boolean> {
    try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
        return true;
    } catch(error) {
        if ((error as any).code === 'storage/object-not-found') {
            console.warn("Image not found, maybe it was already deleted:", imageUrl);
            return true; // Not a failure from user's perspective
        }
        console.error("Error deleting image:", error);
        return false;
    }
}
