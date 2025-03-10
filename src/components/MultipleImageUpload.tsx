
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, X, Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultipleImageUploadProps {
  existingImages?: string[];
  onChange: (images: (string | File)[]) => void;
}

const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  existingImages = [],
  onChange,
}) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ file: File | null; url: string }[]>(
    existingImages.map(url => ({ file: null, url }))
  );
  const [errors, setErrors] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Check if we're exceeding 5 images
      if (previews.length + filesArray.length > 5) {
        setErrors([...errors, "You can only upload a maximum of 5 images"]);
        return;
      }
      
      // Create preview URLs
      const newPreviews = filesArray.map(file => ({
        file,
        url: URL.createObjectURL(file)
      }));
      
      // Add to state
      setImageFiles([...imageFiles, ...filesArray]);
      setPreviews([...previews, ...newPreviews]);
      
      // Notify parent component
      const allImages = [
        ...existingImages, 
        ...imageFiles.map(file => file), 
        ...filesArray.map(file => file)
      ];
      onChange(allImages);
      
      // Reset input value
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = [...previews];
    const removed = newPreviews.splice(index, 1)[0];
    setPreviews(newPreviews);
    
    // If it was a file, remove from files array
    if (removed.file) {
      const newFiles = imageFiles.filter(file => file !== removed.file);
      setImageFiles(newFiles);
    }
    
    // If it was an existing image, filter from existingImages
    const isExistingImage = existingImages.includes(removed.url);
    const newExistingImages = isExistingImage 
      ? existingImages.filter(url => url !== removed.url)
      : existingImages;
      
    // Notify parent
    onChange([...newExistingImages, ...imageFiles.filter(file => file !== removed.file)]);
    
    // Revoke object URL to avoid memory leaks
    if (removed.file) {
      URL.revokeObjectURL(removed.url);
    }
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newPreviews = [...previews];
    const [movedItem] = newPreviews.splice(fromIndex, 1);
    newPreviews.splice(toIndex, 0, movedItem);
    setPreviews(newPreviews);
    
    // Update parent with new order
    const newImages = newPreviews.map(preview => {
      if (preview.file) return preview.file;
      return preview.url;
    });
    
    onChange(newImages);
  };

  const handleImageError = (index: number) => {
    const newPreviews = [...previews];
    setErrors([...errors, `Image ${index + 1} failed to load`]);
  };

  return (
    <div className="space-y-4">
      <Label className="block mb-2">Product Images (up to 5)</Label>
      
      {errors.length > 0 && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
          {errors.map((error, i) => (
            <div key={i} className="flex items-center text-sm mb-1">
              <span>{error}</span>
              <button
                className="ml-auto"
                onClick={() => setErrors(errors.filter((_, index) => index !== i))}
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="grid grid-cols-5 gap-3">
        {/* Image previews */}
        {previews.map((preview, index) => (
          <div 
            key={index}
            className={cn(
              "relative aspect-square rounded-md overflow-hidden border border-gray-200 bg-gray-50",
              index === 0 ? "col-span-2 row-span-2" : "col-span-1"
            )}
          >
            <img
              src={preview.url}
              alt={`Product image ${index + 1}`}
              className="w-full h-full object-cover"
              onError={() => handleImageError(index)}
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 p-1 bg-white/80 rounded-full hover:bg-white text-gray-700"
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
            {index !== 0 && (
              <button
                onClick={() => reorderImages(index, 0)}
                className="absolute bottom-1 right-1 p-1 bg-white/80 rounded-full hover:bg-white text-gray-700"
                title="Set as main image"
                aria-label="Set as main image"
              >
                <ImageIcon size={14} />
              </button>
            )}
          </div>
        ))}
        
        {/* Upload button - only show if less than 5 images */}
        {previews.length < 5 && (
          <div className="aspect-square relative border-2 border-dashed border-gray-200 rounded-md flex flex-col items-center justify-center text-gray-400 transition-colors hover:border-gray-300">
            <Upload size={22} />
            <p className="mt-2 text-xs text-center">Upload Image</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Upload images"
            />
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-500 mt-2">
        <p>First image will be used as the main product image</p>
      </div>
    </div>
  );
};

export default MultipleImageUpload;
