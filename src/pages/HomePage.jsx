import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import banner from '../assets/banner.png';

export default function HomePage() {
  return (
    <div className="min-h-[80vh] bg-brand-background">
      {/* Hero Section */}
      <div className="relative w-full h-[300px] md:h-[400px] bg-brand-primary flex items-center justify-center shadow-soft">
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={banner} 
            alt="ChashmaGenie Banner"
            className="max-h-full w-auto object-contain"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4 text-brand-darkText">Welcome to ChashmaGenie!</h2>
        <p className="mb-6 text-lg text-brand-darkText/80">
          Discover the best glasses and lenses at premium prices.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-dark transition-colors font-bold text-lg"
        >
          <ShoppingBag size={22} />
          Shop Now
        </Link>
      </div>
    </div>
  );
}
