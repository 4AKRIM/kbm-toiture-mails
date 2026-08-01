import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase";

export async function uploadPhotoChantier(
  userId: string,
  chantierId: string,
  file: File
): Promise<{ url: string; path: string }> {
  const path = `users/${userId}/chantiers/${chantierId}/photos/${Date.now()}-${file.name}`;
  const storageRef = ref(getFirebaseStorage(), path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

export async function uploadDocumentChantier(
  userId: string,
  chantierId: string,
  file: File
): Promise<{ url: string; path: string }> {
  const path = `users/${userId}/chantiers/${chantierId}/documents/${Date.now()}-${file.name}`;
  const storageRef = ref(getFirebaseStorage(), path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

export async function supprimerFichier(path: string) {
  await deleteObject(ref(getFirebaseStorage(), path));
}
