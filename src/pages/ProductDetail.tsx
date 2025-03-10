
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct, Product } from "../services/firebase";
import { useCart } from "../context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart } from "lucide-react";
import ProductImageGallery from "@/components/ProductImageGallery";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [productNotFound, setProductNotFound] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const fetchProductDetails = async () => {
      try {
        if (!id) return;
        setLoading(true);
        
        const productData = await getProduct(id);
        console.log("Product data:", productData);
        setProduct(productData);
        
        // Set the first size as selected by default if sizes are available
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProductNotFound(true);
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
      image: product.images && product.images.length > 0 ? product.images[0] : "",
      selectedSize,
    }, quantity);

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
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

  if (productNotFound || !product) {
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
        {/* Product Image Gallery */}
        <ProductImageGallery 
          images={product?.images || []} 
          productName={product?.name || ""} 
        />

        {/* Product Details */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{product?.name}</h1>
            <div className="mt-2">
              {product?.salePrice ? (
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-medium text-red-600">${product.salePrice.toFixed(2)}</p>
                  <p className="text-lg text-gray-500 line-through">${product?.price.toFixed(2)}</p>
                  {product.salePercentage && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                      {product.salePercentage}% OFF
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-2xl font-medium">${product?.price.toFixed(2)}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="prose">
            <h3 className="text-lg font-medium">Description</h3>
            <p className="text-gray-700">{product?.description || "No description available."}</p>
          </div>

          {/* Sizes */}
          {product?.sizes && product.sizes.length > 0 && (
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
            onClick={() => {
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
                price: product.salePrice || product.price,
                image: product.images && product.images.length > 0 ? product.images[0] : "",
                selectedSize,
              }, quantity);

              toast({
                title: "Added to cart",
                description: `${product.name} has been added to your cart`,
              });
            }}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>

          {/* Share on WhatsApp */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              if (!product) return;
              const message = encodeURIComponent(
                `Check out this product: ${product.name}\n` +
                `Price: $${(product.salePrice || product.price).toFixed(2)}\n` +
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
