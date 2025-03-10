
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  getProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  markProductAsSale,
  removeProductFromSale,
  uploadMultipleImages,
  Product
} from "../services/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Loader2, AlertCircle, Percent } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import MultipleImageUpload from "@/components/MultipleImageUpload";

const Dashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState("women");
  const [loading, setLoading] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentProductId, setCurrentProductId] = useState("");
  const [uploadImages, setUploadImages] = useState<(string | File)[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [salePrice, setSalePrice] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    categories: ["women"] as string[],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [] as string[],
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
      setProducts(allProducts as Product[]);
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

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData((prev) => {
      if (category === "women" && !checked) {
        return prev;
      }
      
      if (checked) {
        return {
          ...prev,
          categories: [...prev.categories.filter(c => c !== category), category],
        };
      } else {
        return {
          ...prev,
          categories: prev.categories.filter(c => c !== category),
        };
      }
    });
  };

  const handleImagesChange = (images: (string | File)[]) => {
    console.log("Images changed:", images);
    setUploadImages(images);

    // Update form data with any string URLs (existing images)
    const stringUrls = images.filter(img => typeof img === 'string') as string[];
    setFormData(prev => ({
      ...prev,
      images: stringUrls
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      categories: ["women"],
      sizes: ["XS", "S", "M", "L", "XL"],
      images: [],
    });
    setUploadImages([]);
    setIsEditMode(false);
    setCurrentProductId("");
    setUploadError(null);
    setSalePrice("");
  };

  const openProductModal = (product?: Product) => {
    resetForm();
    
    if (product) {
      setIsEditMode(true);
      setCurrentProductId(product.id);
      setFormData({
        name: product.name || "",
        price: product.price?.toString() || "",
        description: product.description || "",
        categories: product.categories || ["women"],
        sizes: product.sizes || ["XS", "S", "M", "L", "XL"],
        images: product.images || [],
      });
      setUploadImages(product.images || []);
    }
    
    setIsProductModalOpen(true);
  };

  const openSaleModal = (product: Product) => {
    setCurrentProductId(product.id);
    setSalePrice(product.salePrice?.toString() || "");
    setIsSaleModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
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
      setIsSaving(true);
      setUploadError(null);
      let productImages = formData.images; // Start with existing image URLs
      
      // Get file objects to upload
      const filesToUpload = uploadImages.filter(img => typeof img !== 'string') as File[];
      
      if (filesToUpload.length > 0) {
        try {
          console.log("Uploading images...");
          const uploadedUrls = await uploadMultipleImages(filesToUpload);
          console.log("Images uploaded successfully:", uploadedUrls);
          
          // Combine existing image URLs with newly uploaded ones
          const existingUrls = uploadImages.filter(img => typeof img === 'string') as string[];
          productImages = [...existingUrls, ...uploadedUrls];
        } catch (error) {
          console.error("Error uploading images:", error);
          setUploadError("Failed to upload images. Please try again.");
          toast({
            variant: "destructive",
            title: "Upload Error",
            description: "Failed to upload product images. You can still save the product with existing images."
          });
        }
      }
      
      const productData: Omit<Product, 'id'> = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        categories: formData.categories,
        sizes: formData.sizes,
        images: productImages,
        updatedAt: new Date().toISOString(),
      };
      
      if (isEditMode && currentProductId) {
        await updateProduct(currentProductId, productData);
        toast({
          title: "Product Updated",
          description: "Product has been successfully updated",
        });
      } else {
        const newProductData = {
          ...productData,
          createdAt: new Date().toISOString()
        };
        await addProduct(newProductData);
        toast({
          title: "Product Added",
          description: "New product has been successfully added",
        });
      }
      
      await fetchProducts(); // Refresh products list
      setIsProductModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save product",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!salePrice || parseFloat(salePrice) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Price",
        description: "Please enter a valid sale price",
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const product = products.find(p => p.id === currentProductId);
      if (!product) {
        throw new Error("Product not found");
      }
      
      const newSalePrice = parseFloat(salePrice);
      
      if (newSalePrice >= product.price) {
        toast({
          variant: "destructive",
          title: "Invalid Sale Price",
          description: "Sale price must be lower than the original price",
        });
        return;
      }
      
      await markProductAsSale(currentProductId, newSalePrice);
      
      toast({
        title: "Product on Sale",
        description: "Product has been successfully marked as on sale",
      });
      
      await fetchProducts(); // Refresh products list
      setIsSaleModalOpen(false);
      setSalePrice("");
      setCurrentProductId("");
    } catch (error) {
      console.error("Error setting product on sale:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to set product on sale",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveFromSale = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this product from sale?")) {
      try {
        await removeProductFromSale(id);
        toast({
          title: "Sale Removed",
          description: "Product has been removed from sale",
        });
        fetchProducts();
      } catch (error) {
        console.error("Error removing product from sale:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove product from sale",
        });
      }
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
    <div className="container mx-auto py-12 px-4 max-w-7xl animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0" onClick={() => openProductModal()}>
              <Plus size={18} className="mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {isEditMode ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleProductSubmit} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Classic White T-Shirt"
                  className="h-11"
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
                  className="h-11"
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
                  rows={4}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Categories</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="category-women"
                      checked={formData.categories.includes("women")}
                      disabled={true}
                    />
                    <Label htmlFor="category-women" className="capitalize">
                      Women (Default)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="category-new-arrivals"
                      checked={formData.categories.includes("new-arrivals")}
                      onCheckedChange={(checked) => 
                        handleCategoryChange("new-arrivals", checked as boolean)
                      }
                    />
                    <Label htmlFor="category-new-arrivals" className="capitalize">
                      New Arrivals
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <MultipleImageUpload
                  existingImages={formData.images}
                  onChange={handleImagesChange}
                />
                {uploadError && (
                  <div className="text-red-500 flex items-center text-sm">
                    <AlertCircle size={16} className="mr-1" />
                    {uploadError}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsProductModalOpen(false);
                    resetForm();
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? "Saving..." : "Adding..."}
                    </>
                  ) : (
                    isEditMode ? "Save Changes" : "Add Product"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Sale Price Modal */}
        <Dialog open={isSaleModalOpen} onOpenChange={setIsSaleModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Set Sale Price</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price ($)</Label>
                <Input
                  id="salePrice"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value.replace(/[^0-9.]/g, ""))}
                  required
                  placeholder="19.99"
                  className="h-11"
                />
                <p className="text-xs text-gray-500">
                  Enter a price lower than the original price to create a sale.
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsSaleModalOpen(false);
                    setSalePrice("");
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting Sale...
                    </>
                  ) : (
                    "Set Sale"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="women" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="women">Women</TabsTrigger>
          <TabsTrigger value="new-arrivals">New Arrivals</TabsTrigger>
          <TabsTrigger value="sale">Sale</TabsTrigger>
          <TabsTrigger value="all">All Products</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-4 text-gray-500">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-500 mb-4">No products found in this category.</p>
              <Button onClick={() => openProductModal()}>
                <Plus size={16} className="mr-2" />
                Add Product
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard 
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    images={product.images}
                    isNew={product.categories.includes('new-arrivals')}
                    isSale={product.categories.includes('sale')}
                    salePrice={product.salePrice}
                    salePercentage={product.salePercentage}
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => openProductModal(product)}
                      className="h-8 w-8 bg-white/90 shadow-sm"
                      title="Edit Product"
                    >
                      <Pencil size={14} />
                    </Button>
                    
                    {product.categories.includes('sale') ? (
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => handleRemoveFromSale(product.id)}
                        className="h-8 w-8 bg-white/90 shadow-sm"
                        title="Remove from Sale"
                      >
                        <Percent size={14} />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => openSaleModal(product)}
                        className="h-8 w-8 bg-white/90 shadow-sm"
                        title="Set Sale Price"
                      >
                        <Percent size={14} />
                      </Button>
                    )}
                    
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                      className="h-8 w-8"
                      title="Delete Product"
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
