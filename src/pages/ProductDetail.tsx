import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct, Product } from "../services/firebase";
import { useCart } from "../context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Image as ImageIcon } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        if (!id) return;
        setLoading(true);
        
        const productData = await getProduct(id);
        console.log("Product data:", productData); // Debug: Log the product data
        setProduct(productData);
        
        // Set the first size as selected by default if sizes are available
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load product details",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, toast]);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      toast({
        variant: "destructive",
        title: "Please select a size",
        description: "You must select a size before adding to cart",
      });
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || "",
      selectedSize,
    }, quantity);

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleImageError = () => {
    console.log("Image failed to load");
    setImageError(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="w-full h-[500px] rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="w-3/4 h-10" />
            <Skeleton className="w-1/4 h-6" />
            <Skeleton className="w-full h-32" />
            <div className="space-y-2">
              <Skeleton className="w-20 h-10" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="w-12 h-10" />
                <Skeleton className="w-12 h-10" />
                <Skeleton className="w-12 h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="w-20 h-6" />
              <div className="flex items-center space-x-2">
                <Skeleton className="w-10 h-10" />
                <Skeleton className="w-10 h-10" />
                <Skeleton className="w-10 h-10" />
              </div>
            </div>
            <Skeleton className="w-full h-12" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto max-w-6xl py-12 px-4 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <p className="mt-4 text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/")} className="mt-6">
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-12 px-4 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-xl bg-gray-50">
          {!imageError && product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-auto object-contain aspect-square"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full aspect-square flex flex-col items-center justify-center bg-gray-100 text-gray-400">
              <ImageIcon size={64} />
              <p className="mt-4">No image available</p>
            </div>
          )}
          {product.categories?.includes("sale") && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Sale
            </div>
          )}
          {product.categories?.includes("new-arrivals") && (
            <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
              New
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl font-medium mt-2">${product.price.toFixed(2)}</p>
          </div>

          {/* Description */}
          <div className="prose">
            <h3 className="text-lg font-medium">Description</h3>
            <p className="text-gray-700">{product.description || "No description available."}</p>
          </div>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 flex items-center justify-center border rounded-md transition-all ${
                      selectedSize === size
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="text-lg font-medium mb-3">Quantity</h3>
            <div className="flex items-center">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center border rounded-l-md"
                disabled={quantity <= 1}
              >
                -
              </button>
              <div className="w-16 h-10 flex items-center justify-center border-t border-b">
                {quantity}
              </div>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center border rounded-r-md"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button 
            className="w-full py-6 text-lg" 
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>

          {/* Share on WhatsApp */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              const message = encodeURIComponent(
                `Check out this product: ${product.name}\n` +
                `Price: $${product.price.toFixed(2)}\n` +
                `Description: ${product.description || "No description available."}\n` +
                `Link: ${window.location.href}`
              );
              window.open(`https://wa.me/?text=${message}`, '_blank');
            }}
          >
            Share on WhatsApp
          </Button>

          {/* Additional Info */}
          <div className="border-t pt-4 mt-6">
            <p className="text-sm text-gray-500">
              Free shipping on orders over $100
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
