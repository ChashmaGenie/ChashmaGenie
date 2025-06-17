import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">ChashmaGenie</h3>
            <p className="text-sm text-gray-300">
              Premium eyewear for the discerning customer.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link to="/products" className="text-sm text-gray-300 hover:text-brand-primary transition-colors">
                Shop
              </Link>
              <Link to="/about" className="text-sm text-gray-300 hover:text-brand-primary transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-sm text-gray-300 hover:text-brand-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Social Links */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex justify-center md:justify-end gap-4">
              <a
                href="https://instagram.com/chashmagenie"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-brand-primary transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://facebook.com/chashmagenie"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-brand-primary transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="mailto:info@chashmagenie.com"
                className="text-gray-300 hover:text-brand-primary transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} ChashmaGenie. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
