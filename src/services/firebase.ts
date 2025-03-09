
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAmP7ARruGI5SZQQF-cEToikvXbS2h7luo",
  authDomain: "shop-aacdf.firebaseapp.com",
  projectId: "shop-aacdf",
  storageBucket: "shop-aacdf.appspot.com",
  messagingSenderId: "993022703979",
  appId: "1:993022703979:web:efa0d6b774c13f1ff7742e",
  measurementId: "G-SF9KTBHWP6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Auth functions
export const loginUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

// Define Product interface
export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  sizes?: string[];
  categories?: string[];
}

// Type for Firestore document data
interface ProductData {
  name: string;
  price: number;
  description?: string;
  image?: string;
  sizes?: string[];
  categories?: string[];
}

// Products functions
export const getProducts = async (category?: string) => {
  try {
    let q;
    if (category) {
      q = query(collection(db, "products"), where("categories", "array-contains", category));
    } else {
      q = collection(db, "products");
    }
    
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => {
      const data = doc.data() as ProductData;
      return {
        id: doc.id,
        name: data.name || "",
        price: data.price || 0,
        description: data.description || "",
        image: data.image || "",
        sizes: data.sizes || [],
        categories: data.categories || []
      } as Product;
    });
    
    return products;
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};

export const getProduct = async (id: string) => {
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as ProductData;
      return {
        id: docSnap.id,
        name: data.name || "",
        price: data.price || 0,
        description: data.description || "",
        image: data.image || "",
        sizes: data.sizes || [],
        categories: data.categories || []
      } as Product;
    } else {
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
};

export const addProduct = async (productData: any) => {
  try {
    const docRef = await addDoc(collection(db, "products"), productData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: any) => {
  try {
    const docRef = doc(db, "products", id);
    await updateDoc(docRef, productData);
    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, "products", id));
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Storage functions
export const uploadImage = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

export { auth, db, storage };
