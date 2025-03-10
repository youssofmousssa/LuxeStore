
import React, { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/services/firebase";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[]; // Changed from image to images array
  isNew?: boolean;
  isSale?: boolean;
  salePrice?: number;
  categories: string[];
}

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch all products from Firebase
        const products = await getProducts() as Product[];
        
        // Get featured products (first 4)
        setFeaturedProducts(products.slice(0, 4));
        
        // Get new arrivals (filter by new-arrivals category)
        const newProducts = products.filter(product => 
          product.categories && product.categories.includes('new-arrivals')
        ).slice(0, 8);
        
        setNewArrivals(newProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="page-transition">
      {/* Hero Section */}
      <Hero
        title="Elegance in Every Detail"
        subtitle="Discover our latest collection crafted with precision and style."
        ctaText="Explore Collection"
        ctaLink="/women"
      />
      
      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
            <Link 
              to="/women" 
              className="inline-flex items-center text-sm font-medium hover:text-primary transition-colors"
            >
              View All <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="aspect-[4/5] bg-secondary rounded-lg" />
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-4 bg-secondary rounded w-1/4" />
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  images={product.images}
                  isNew={product.categories.includes('new-arrivals')}
                  isSale={product.categories.includes('sale')}
                  salePrice={product.salePrice}
                />
              ))
            ) : (
              <div className="col-span-4 text-center py-12">
                <p className="text-gray-500">
                  No products yet. Add products from the dashboard to see them here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Categories Banner */}
      <section className="py-16 bg-secondary">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              to="/women" 
              className="relative group overflow-hidden rounded-lg aspect-[4/3]"
            >
              <img 
                src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=986&q=80" 
                alt="Women's Collection" 
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">Women</h3>
              </div>
            </Link>
            
            <Link 
              to="/new-arrivals" 
              className="relative group overflow-hidden rounded-lg aspect-[4/3]"
            >
              <img 
                src="https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
                alt="New Arrivals" 
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">New Arrivals</h3>
              </div>
            </Link>
            
            <Link 
              to="/sale" 
              className="relative group overflow-hidden rounded-lg aspect-[4/3]"
            >
              <img 
                src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
                alt="Sale" 
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">Sale</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>
      
      {/* New Arrivals */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">New Arrivals</h2>
            <Link 
              to="/new-arrivals" 
              className="inline-flex items-center text-sm font-medium hover:text-primary transition-colors"
            >
              View All <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="aspect-[4/5] bg-secondary rounded-lg" />
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-4 bg-secondary rounded w-1/4" />
                </div>
              ))
            ) : newArrivals.length > 0 ? (
              newArrivals.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  images={product.images}
                  isNew={true}
                  isSale={product.categories.includes('sale')}
                  salePrice={product.salePrice}
                />
              ))
            ) : (
              <div className="col-span-4 text-center py-12">
                <p className="text-gray-500">
                  No new arrivals yet. Add products with the "New Arrivals" category from the dashboard.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
