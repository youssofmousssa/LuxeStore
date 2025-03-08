
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, User, Menu, X, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import AuthModal from "./AuthModal";
import Cart from "./Cart";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const location = useLocation();
  const { currentUser, isAdmin } = useAuth();
  const { itemCount } = useCart();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Women", path: "/women" },
    { name: "New Arrivals", path: "/new-arrivals" },
    { name: "Sale", path: "/sale" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    setSearchOpen(false);
  };

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-white/80 backdrop-blur-md shadow-sm py-4" 
            : "bg-transparent py-6"
        )}
      >
        <div className="container-custom flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-xl font-bold tracking-tight"
          >
            LUXE
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative",
                  "after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-primary after:w-0 hover:after:w-full after:transition-all after:duration-300",
                  location.pathname === link.path ? "after:w-full" : ""
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full transition-colors hover:bg-secondary"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            
            {/* User */}
            <button 
              onClick={() => currentUser ? null : setAuthModalOpen(true)}
              className="p-2 rounded-full transition-colors hover:bg-secondary relative"
              aria-label="Account"
            >
              <User size={20} />
              {currentUser && (
                <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </button>
            
            {/* Admin Dashboard Link */}
            {isAdmin && (
              <Link
                to="/dashboard"
                className="hidden md:block text-sm font-medium transition-colors hover:text-primary"
              >
                Dashboard
              </Link>
            )}
            
            {/* Cart */}
            <button 
              onClick={() => setCartOpen(true)}
              className="p-2 rounded-full transition-colors hover:bg-secondary relative"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-full transition-colors hover:bg-secondary"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg border-t animate-slide-in">
            <nav className="container-custom py-6 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-primary py-2",
                    location.pathname === link.path ? "text-primary" : ""
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/dashboard"
                  className="text-lg font-medium transition-colors hover:text-primary py-2"
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <>
          <div className="overlay-blur" onClick={() => setSearchOpen(false)} />
          <div className="fixed top-0 left-0 right-0 z-50 bg-white p-4 shadow-lg animate-slide-in">
            <div className="container-custom">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field w-full py-4 pr-12"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  aria-label="Search"
                >
                  <Search size={20} />
                </button>
              </form>
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-6 top-6"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      {/* Cart Drawer */}
      <Cart open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
};

export default Navbar;
