
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  isNew?: boolean;
  isSale?: boolean;
  salePrice?: number;
  className?: string;
}

const ProductCard = ({
  id,
  name,
  price,
  image,
  isNew = false,
  isSale = false,
  salePrice,
  className,
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id,
      name,
      price: isSale && salePrice ? salePrice : price,
      image,
    });
  };

  const handleImageError = () => {
    console.log("Product card image failed to load:", image);
    setImageError(true);
  };

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
