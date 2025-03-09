
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

// Add sample products if they don't exist
export const ensureSampleProducts = async () => {
  try {
    const sampleProducts = [
      {
        id: "1",
        name: "Cotton Oversized T-Shirt",
        price: 49.99,
        description: "Comfortable and stylish oversized t-shirt made from 100% cotton.",
        image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80",
        sizes: ["S", "M", "L", "XL"],
        categories: ["women", "new-arrivals"]
      },
      {
        id: "2",
        name: "Linen Blend Dress",
        price: 89.99,
        description: "Elegant linen blend dress perfect for summer days.",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1483&q=80",
        sizes: ["XS", "S", "M", "L"],
        categories: ["women"]
      },
      {
        id: "3",
        name: "Relaxed Fit Jeans",
        price: 79.99,
        description: "Comfortable relaxed fit jeans with a modern look.",
        image: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80",
        salePrice: 59.99,
        sizes: ["26", "28", "30", "32"],
        categories: ["women", "sale"]
      },
      {
        id: "4",
        name: "Cashmere Sweater",
        price: 149.99,
        description: "Luxurious cashmere sweater for ultimate comfort.",
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1364&q=80",
        sizes: ["S", "M", "L"],
        categories: ["women"]
      }
    ];

    // Check if sample products exist
    for (const product of sampleProducts) {
      const docRef = doc(db, "products", product.id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Create sample product
        const { id, ...productData } = product;
        await setDoc(docRef, productData);
        console.log(`Sample product created: ${product.name}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error ensuring sample products:", error);
    return false;
  }
};

// Products functions
export const getProducts = async (category?: string) => {
  try {
    // First ensure sample products exist
    await ensureSampleProducts();
    
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
    // First ensure sample products exist
    await ensureSampleProducts();
    
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

// Upload image to ImgBB instead of Firebase Storage
export const uploadImage = async (file: File, path: string) => {
  try {
    console.log("Uploading to ImgBB instead of Firebase Storage");
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
