import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getProducts, addProduct, updateProduct, deleteProduct, uploadImage } from "../services/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  categories: string[];
  sizes: string[];
  image: string;
  createdAt?: string;
  updatedAt: string;
}

interface ProductCardProps {
  product: Product;
}

const Dashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState("women");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    categories: [] as string[],
    sizes: ["XS", "S", "M", "L", "XL"],
    image: "",
  });

  useEffect(() => {
    if (currentUser && !isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only administrators can access the dashboard",
      });
      navigate("/");
    }
    
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to access the dashboard",
      });
      navigate("/");
    }
    
    fetchProducts();
  }, [currentUser, isAdmin, navigate, toast]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await getProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? value.replace(/[^0-9.]/g, "") : value,
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => {
      if (prev.categories.includes(category)) {
        return {
          ...prev,
          categories: prev.categories.filter((c) => c !== category),
        };
      } else {
        return {
          ...prev,
          categories: [...prev.categories, category],
        };
      }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      categories: [],
      sizes: ["XS", "S", "M", "L", "XL"],
      image: "",
    });
    setImageFile(null);
    setImagePreview("");
    setIsEditMode(false);
    setCurrentProductId("");
  };

  const openModal = (product?: any) => {
    resetForm();
    
    if (product) {
      setIsEditMode(true);
      setCurrentProductId(product.id);
      setFormData({
        name: product.name || "",
        price: product.price?.toString() || "",
        description: product.description || "",
        categories: product.categories || [],
        sizes: product.sizes || ["XS", "S", "M", "L", "XL"],
        image: product.image || "",
      });
      setImagePreview(product.image || "");
    }
    
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields",
      });
      return;
    }
    
    try {
      let imageUrl = formData.image;
      
      if (imageFile) {
        const timestamp = Date.now();
        const path = `products/${timestamp}_${imageFile.name}`;
        imageUrl = await uploadImage(imageFile, path);
      }
      
      const productData: Omit<Product, 'id'> & { createdAt?: string } = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        categories: formData.categories,
        sizes: formData.sizes,
        image: imageUrl,
        updatedAt: new Date().toISOString(),
      };
      
      if (isEditMode && currentProductId) {
        await updateProduct(currentProductId, productData);
        toast({
          title: "Product Updated",
          description: "Product has been successfully updated",
        });
      } else {
        productData.createdAt = new Date().toISOString();
        await addProduct(productData);
        toast({
          title: "Product Added",
          description: "New product has been successfully added",
        });
      }
      
      fetchProducts();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save product",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        toast({
          title: "Product Deleted",
          description: "Product has been successfully deleted",
        });
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete product",
        });
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    if (activeTab === "all") return true;
    return product.categories?.includes(activeTab);
  });

  if (!currentUser || !isAdmin) {
    return null;
  }

  return (
    <div className="container-custom py-12 page-transition">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="heading-lg">Dashboard</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0" onClick={() => openModal()}>
              <Plus size={18} className="mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Classic White T-Shirt"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  placeholder="29.99"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="A comfortable, everyday t-shirt..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {["women", "new-arrivals", "sale"].map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={formData.categories.includes(category)}
                        onCheckedChange={() => handleCategoryChange(category)}
                      />
                      <Label htmlFor={`category-${category}`} className="capitalize">
                        {category.replace(/-/g, " ")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative w-40 h-40 overflow-hidden rounded-md">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-2 right-2"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                          setFormData((prev) => ({ ...prev, image: "" }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <Label
                        htmlFor="file-upload"
                        className="mt-2 cursor-pointer text-primary text-sm"
                      >
                        Upload Image
                      </Label>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditMode ? "Save Changes" : "Add Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="women" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="women">Women</TabsTrigger>
          <TabsTrigger value="new-arrivals">New Arrivals</TabsTrigger>
          <TabsTrigger value="sale">Sale</TabsTrigger>
          <TabsTrigger value="all">All Products</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <p className="text-center py-12">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="paragraph mb-4">No products found in this category.</p>
              <Button onClick={() => openModal()}>Add Product</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard product={product as any} />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => openModal(product)}
                      className="h-8 w-8"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
