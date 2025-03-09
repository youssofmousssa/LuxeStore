import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, User, LogOut } from "lucide-react";
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
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Women", path: "/women" },
    { name: "New Arrivals", path: "/new-arrivals" },
    { name: "Sale", path: "/sale" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleDropdown = () => {
    if (!currentUser) {
      setAuthModalOpen(true);
    } else {
      setDropdownVisible(!dropdownVisible);
    }
  };

  const userInitial = currentUser?.email.charAt(0).toUpperCase();

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-white/90 backdrop-blur-md shadow-lg py-3" 
            : "bg-white/50 backdrop-blur-sm py-5"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              className="text-2xl font-bold tracking-tight"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600">
                LUXE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium hover:text-primary transition duration-300",
                    location.pathname === link.path && "font-semibold"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* User Dropdown */}
              <div className="relative">
                <button 
                  onClick={toggleDropdown}
                  className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full text-gray-700 hover:bg-gray-300 transition duration-300"
                >
                  {userInitial}
                </button>
                {dropdownVisible && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden transition-transform transform scale-95 opacity-100">
                    <div className="px-4 py-3 bg-gray-100 text-center font-medium text-gray-800 border-b border-gray-200">
                      {currentUser?.email}
                    </div>
                    <Link 
                      to="/dashboard" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-300"
                      onClick={() => setDropdownVisible(false)}
                    >
                      <User className="mr-2" />
                      Dashboard
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition duration-300"
                    >
                      <LogOut className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button 
                onClick={() => setCartOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full relative transition duration-300"
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white rounded-full text-xs flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Hamburger Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-full transition duration-300"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <ul className="md:hidden py-4 space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={cn(
                      "block py-2 px-4 text-base hover:bg-gray-50 rounded-md transition duration-300",
                      location.pathname === link.path && "font-semibold bg-gray-50"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <Cart open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
};

export default Navbar;
