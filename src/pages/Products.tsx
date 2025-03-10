
import React, { useEffect, useState } from "react";
import { getProducts } from "@/services/firebase";
import ProductCard from "@/components/ProductCard";
import Hero from "@/components/Hero";
import { Filter, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[]; // Changed from image to images
  isNew?: boolean;
  isSale?: boolean;
  salePrice?: number;
  categories: string[];
}

interface ProductsProps {
  category?: string;
}

const Products = ({ category = "all" }: ProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  
  // Category specific settings
  const getCategorySettings = () => {
    switch (category) {
      case "women":
        return {
          title: "Women's Collection",
          subtitle: "Explore our curated selection of women's clothing",
          backgroundImage: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=986&q=80"
        };
      case "new-arrivals":
        return {
          title: "New Arrivals",
          subtitle: "The latest additions to our collection",
          backgroundImage: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
        };
      case "sale":
        return {
          title: "Sale",
          subtitle: "Special offers and discounted items",
          backgroundImage: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
        };
      default:
        return {
          title: "All Products",
          subtitle: "Browse our entire collection",
          backgroundImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
        };
    }
  };
  
  const { title, subtitle, backgroundImage } = getCategorySettings();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch products based on category
        let fetchedProducts;
        if (category === "all") {
          fetchedProducts = await getProducts() as Product[];
        } else {
          fetchedProducts = await getProducts(category) as Product[];
        }
        
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Show empty state instead of sample data
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  // Filter products when search query or filters change
  useEffect(() => {
    const filtered = products.filter(product => {
      // Search query filter
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Price range filter
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      // Size filter (not implemented with actual data yet)
      const matchesSize = selectedSizes.length === 0 || selectedSizes.includes("M"); // Placeholder
      
      return matchesSearch && matchesPrice && matchesSize;
    });
    
    setFilteredProducts(filtered);
  }, [searchQuery, products, priceRange, selectedSizes]);

  // Handle size selection
  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size) 
        : [...prev, size]
    );
  };
  
  return (
    <div className="page-transition">
      <Hero 
        title={title}
        subtitle={subtitle}
        backgroundImage={backgroundImage}
        size="sm"
      />
      
      <div className="container-custom py-12">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <Button 
            variant="outline" 
            className="md:w-auto w-full flex items-center gap-2"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Filter size={16} />
            Filters
          </Button>
          
          <div className="relative w-full md:w-80">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pr-10"
            />
            {searchQuery ? (
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            ) : (
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            )}
          </div>
        </div>
        
        {/* Filters Panel */}
        {filtersOpen && (
          <div className="mb-8 p-6 border rounded-lg bg-background/50 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Price Range */}
              <div>
                <h3 className="font-medium mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Sizes */}
              <div>
                <h3 className="font-medium mb-4">Size</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`size-${size}`}
                        checked={selectedSizes.includes(size)}
                        onCheckedChange={() => toggleSize(size)}
                      />
                      <Label htmlFor={`size-${size}`}>{size}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button 
                variant="outline" 
                className="mr-2"
                onClick={() => {
                  setPriceRange([0, 1000]);
                  setSelectedSizes([]);
                }}
              >
                Reset
              </Button>
              <Button onClick={() => setFiltersOpen(false)}>Apply</Button>
            </div>
          </div>
        )}
        
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>
        
        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="aspect-[4/5] bg-secondary rounded-lg" />
                <div className="h-4 bg-secondary rounded w-3/4" />
                <div className="h-4 bg-secondary rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedSizes.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000 
                ? "Try adjusting your search or filter criteria" 
                : "Add products from the dashboard to see them here"}
            </p>
            {(searchQuery || selectedSizes.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000) && (
              <Button 
                onClick={() => {
                  setSearchQuery("");
                  setPriceRange([0, 1000]);
                  setSelectedSizes([]);
                }}
              >
                Reset All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                images={product.images}
                isNew={category !== "new-arrivals" && product.categories.includes('new-arrivals')}
                isSale={product.categories.includes('sale')}
                salePrice={product.salePrice}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
