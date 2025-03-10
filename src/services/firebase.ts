
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
  where,
  setDoc 
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

// ImgBB API Key
const IMGBB_API_KEY = "53b224bc4d49e5d351b53ae7b088b085";

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
  images: string[];
  sizes?: string[];
  categories?: string[];
  salePrice?: number;
  salePercentage?: number;
}

// Type for Firestore document data
interface ProductData {
  name: string;
  price: number;
  description?: string;
  images: string[];
  sizes?: string[];
  categories?: string[];
  salePrice?: number;
  salePercentage?: number;
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
        images: data.images || [],
        sizes: data.sizes || [],
        categories: data.categories || [],
        salePrice: data.salePrice,
        salePercentage: data.salePercentage
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
        images: data.images || [],
        sizes: data.sizes || [],
        categories: data.categories || [],
        salePrice: data.salePrice,
        salePercentage: data.salePercentage
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

export const markProductAsSale = async (id: string, salePrice: number) => {
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as ProductData;
      const originalPrice = data.price;
      const salePercentage = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
      
      // Add "sale" category if not already there
      let categories = data.categories || [];
      if (!categories.includes("sale")) {
        categories.push("sale");
      }
      
      await updateDoc(docRef, {
        salePrice,
        salePercentage,
        categories
      });
      
      return true;
    } else {
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error("Error marking product as sale:", error);
    throw error;
  }
};

export const removeProductFromSale = async (id: string) => {
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as ProductData;
      let categories = data.categories || [];
      
      // Remove "sale" category
      categories = categories.filter(cat => cat !== "sale");
      
      await updateDoc(docRef, {
        salePrice: null,
        salePercentage: null,
        categories
      });
      
      return true;
    } else {
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error("Error removing product from sale:", error);
    throw error;
  }
};

// Upload image to ImgBB
export const uploadImage = async (file: File, path: string) => {
  try {
    console.log("Uploading to ImgBB");
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", IMGBB_API_KEY);
    
    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`ImgBB upload failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("ImgBB upload success:", data);
    
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error("ImgBB upload failed");
    }
  } catch (error) {
    console.error("Error uploading image to ImgBB:", error);
    throw error;
  }
};

// Upload multiple images to ImgBB
export const uploadMultipleImages = async (files: File[]) => {
  try {
    const uploadPromises = files.map(file => {
      const timestamp = Date.now();
      const path = `products/${timestamp}_${file.name}`;
      return uploadImage(file, path);
    });
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw error;
  }
};

// Firebase Storage functions (kept as fallback)
export const uploadImageToFirebase = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading to Firebase Storage:", error);
    throw error;
  }
};

export { auth, db, storage };
