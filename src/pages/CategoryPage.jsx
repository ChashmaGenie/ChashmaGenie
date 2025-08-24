import React from 'react';
import { useParams } from 'react-router-dom';
import { products } from '../data/products';
import { Glasses } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function CategoryPage() {
  const { tag } = useParams();
  const filtered = products.filter(p => p.tags && p.tags.includes(tag));
  const title = tag.replace(/-/g, ' ');

  return (
    <div className="container mx-auto px-4">
      <h1 className="flex items-center justify-center gap-2 text-3xl font-extrabold mb-8 text-center text-brand-blue drop-shadow">
        <Glasses size={32} className="text-brand-gold" />
        {title.charAt(0).toUpperCase() + title.slice(1)}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
