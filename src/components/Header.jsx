import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import { Menu, ShoppingBag, User } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Header() {
  const { cart } = React.useContext(CartContext);
  const { user, logout } = React.useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-brand-dark shadow-soft sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between py-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">
            ChashmaGenie
          </span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/products"
            className="text-white hover:text-brand-primary transition-colors"
          >
            Shop
          </Link>
          <Link
            to="/category/sun-glasses"
            className="text-white hover:text-brand-primary transition-colors"
          >
            Sun Glasses
          </Link>
          <Link
            to="/category/men"
            className="text-white hover:text-brand-primary transition-colors"
          >
            Men
          </Link>
          <Link
            to="/category/women"
            className="text-white hover:text-brand-primary transition-colors"
          >
            Women
          </Link>
          <Link
            to="/category/lens"
            className="text-white hover:text-brand-primary transition-colors"
          >
            Lens
          </Link>
          <Link
            to="/cart"
            className="text-white hover:text-brand-primary transition-colors relative"
          >
            <ShoppingBag size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-yellow text-brand-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>
          {user ? (
            <button
              onClick={logout}
              className="text-white hover:text-brand-primary transition-colors"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="text-white hover:text-brand-primary transition-colors"
            >
              <User size={20} />
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white hover:text-brand-primary"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={24} />
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-brand-dark py-4 px-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link
                to="/products"
                className="text-white hover:text-brand-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                to="/category/sun-glasses"
                className="text-white hover:text-brand-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Sun Glasses
              </Link>
              <Link
                to="/category/men"
                className="text-white hover:text-brand-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Men
              </Link>
              <Link
                to="/category/women"
                className="text-white hover:text-brand-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Women
              </Link>
              <Link
                to="/category/lens"
                className="text-white hover:text-brand-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Lens
              </Link>
              <Link
                to="/cart"
                className="text-white hover:text-brand-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Cart ({cart.length})
              </Link>
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="text-white hover:text-brand-primary transition-colors text-left"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-white hover:text-brand-primary transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}