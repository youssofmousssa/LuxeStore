
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface HeroProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
  overlayOpacity?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Hero = ({
  title,
  subtitle,
  ctaText = "Shop Now",
  ctaLink = "/women",
  backgroundImage = "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  overlayOpacity = "bg-black/30",
  className,
  size = "lg",
}: HeroProps) => {
  return (
    <div 
      className={cn(
        "relative w-full overflow-hidden",
        size === "sm" && "h-[30vh] min-h-[300px]",
        size === "md" && "h-[50vh] min-h-[400px]",
        size === "lg" && "h-[80vh] min-h-[600px]",
        className
      )}
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={backgroundImage}
          alt="Hero Background"
          className="w-full h-full object-cover object-center"
        />
        <div className={`absolute inset-0 ${overlayOpacity}`} />
      </div>
      
      {/* Content */}
      <div className="relative h-full container-custom flex flex-col justify-center items-start">
        <div className="max-w-md lg:max-w-2xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-lg md:text-xl text-white/90 mb-8">
              {subtitle}
            </p>
          )}
          
          {ctaText && (
            <Link
              to={ctaLink}
              className="inline-flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-opacity-90 transition-all duration-300 group"
            >
              <span>{ctaText}</span>
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
