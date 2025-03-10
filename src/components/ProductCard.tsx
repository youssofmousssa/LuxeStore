
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  images: string[]; // Changed from image to images array
  isNew?: boolean;
  isSale?: boolean;
  salePrice?: number;
  className?: string;
}

const ProductCard = ({
  id,
  name,
  price,
  images,
  isNew = false,
  isSale = false,
  salePrice,
  className,
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();

  const image = images && images.length > 0 ? images[currentImageIndex] : "";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id,
      name,
      price: isSale && salePrice ? salePrice : price,
      image: images && images.length > 0 ? images[0] : "",
    });
  };

  const handleImageError = () => {
    console.log("Product card image failed to load:", image);
    setImageError(true);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images && images.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images && images.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    }
  };

  // Check if this product has multiple images
  const hasMultipleImages = images && images.length > 1;

  return (
    <Link
      to={`/product/${id}`}
      className={cn(
        "group block relative rounded-lg overflow-hidden hover-scale",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="aspect-[4/5] w-full overflow-hidden bg-secondary relative">
        {!imageError && image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
            <ImageIcon size={48} />
            <p className="mt-2 text-sm">No image</p>
          </div>
        )}
        
        {/* Image Navigation Arrows - Only show if multiple images */}
        {hasMultipleImages && isHovered && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 hover:bg-white shadow-sm text-gray-700"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 hover:bg-white shadow-sm text-gray-700"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
        
        {/* Image Indicators - Only show if multiple images */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <div 
                key={index}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  currentImageIndex === index ? "bg-white scale-125" : "bg-white/50"
                )}
              />
            ))}
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {isNew && (
            <span className="inline-block bg-black text-white text-xs font-medium px-2 py-1 rounded">
              NEW
            </span>
          )}
          
          {isSale && (
            <span className="inline-block bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
              SALE
            </span>
          )}
        </div>
        
        {/* Actions */}
        <div 
          className={cn(
            "absolute right-2 top-2 flex flex-col gap-2 transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <button 
            className="p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart size={18} />
          </button>
        </div>
        
        {/* Quick add to cart */}
        <div 
          className={cn(
            "absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 bg-white text-black py-2 rounded-full font-medium hover:bg-white/90 transition-colors"
          >
            <ShoppingBag size={16} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="mt-3 text-left">
        <h3 className="text-sm font-medium">{name}</h3>
        <div className="mt-1 flex items-center">
          {isSale && salePrice ? (
            <>
              <span className="text-sm font-medium">${salePrice.toFixed(2)}</span>
              <span className="ml-2 text-sm text-gray-500 line-through">${price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-sm font-medium">${price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
