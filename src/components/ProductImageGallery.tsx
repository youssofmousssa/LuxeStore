
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ 
  images, 
  productName 
}) => {
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbnailErrors, setThumbnailErrors] = useState<boolean[]>(Array(images.length).fill(false));

  const handleMainImageError = () => {
    console.log("Main image failed to load");
    setMainImageError(true);
  };

  const handleThumbnailError = (index: number) => {
    console.log(`Thumbnail ${index} failed to load`);
    setThumbnailErrors(prev => {
      const newErrors = [...prev];
      newErrors[index] = true;
      return newErrors;
    });
  };

  const nextImage = () => {
    if (images.length > 1) {
      setMainImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setMainImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const selectImage = (index: number) => {
    setMainImageIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative rounded-xl overflow-hidden bg-gray-50 aspect-square">
        {!mainImageError && images[mainImageIndex] ? (
          <img
            src={images[mainImageIndex]}
            alt={`${productName} - view ${mainImageIndex + 1}`}
            className="w-full h-full object-contain"
            onError={handleMainImageError}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
            <ImageIcon size={64} />
            <p className="mt-4">No image available</p>
          </div>
        )}

        {/* Navigation buttons - only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-md text-gray-700 transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-md text-gray-700 transition-all"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails - only render if multiple images */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={cn(
                "relative min-w-[70px] h-[70px] rounded-md overflow-hidden border-2 transition-all",
                mainImageIndex === index 
                  ? "border-black" 
                  : "border-transparent hover:border-gray-300"
              )}
            >
              {!thumbnailErrors[index] && image ? (
                <img
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleThumbnailError(index)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <ImageIcon size={20} />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
