import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../data/products';
import { formatCurrency } from '../utils/utils';
import { Glasses, ArrowLeft, Instagram } from 'lucide-react';

export default function ProductPage() {
  const { productId } = useParams();
  const product = products.find(p => String(p.id) === String(productId));
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation based on mouse position
    const rotateX = ((y - rect.height / 2) / rect.height) * 20;
    const rotateY = ((x - rect.width / 2) / rect.width) * 20;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-sans">
        <h2 className="text-2xl font-bold mb-4 text-brand-purple flex items-center gap-2">
          <Glasses size={28} className="text-brand-gold" />
          Product Not Found
        </h2>
        <Link to="/products" className="text-brand-blue hover:text-brand-purple transition-colors flex items-center gap-2">
          <ArrowLeft size={20} />
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-soft">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image with 3D effect */}
        <div 
          className="relative group perspective-1000"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            ref={imageRef}
            className="relative transition-transform duration-200 ease-out transform-gpu"
            style={{
              transform: `rotateX(${-rotation.x}deg) rotateY(${rotation.y}deg)`,
            }}
          >
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full aspect-square object-cover rounded-xl shadow-soft"
              onError={e => { e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold mb-2 text-brand-dark">
            {product.name}
          </h1>
          <p className="mb-4 text-gray-600 text-lg">{product.description}</p>
          
          {/* Features */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2 text-brand-dark">Features</h2>
            <ul className="list-disc list-inside text-gray-600">
              {product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          {/* Specifications */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-brand-dark">Specifications</h2>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 text-2xl font-bold text-brand-primary">
            {formatCurrency(product.price)}
          </div>

          {/* Instagram CTA Button */}
          <a
            href="https://instagram.com/chashmagenie"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-xl hover:bg-brand-dark transition-colors duration-300 font-semibold mb-6"
          >
            <Instagram size={24} className="text-white" />
            Order on Instagram
          </a>

          {/* Back Link */}
          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-dark transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Products
          </Link>
        </div>
      </div>
    </div>
  );
}
