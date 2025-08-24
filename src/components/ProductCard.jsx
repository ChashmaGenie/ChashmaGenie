import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/utils';

const ProductCard = memo(({ product }) => (
  <div className="bg-white rounded-xl shadow-soft hover:shadow-glow transition-shadow duration-300 flex flex-col overflow-hidden">
    <div className="border-t-2 border-brand-gold" />
    <div className="p-4">
      <div className="h-48 w-full mb-4">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-48 object-cover rounded-lg mb-4"
          onError={e => { e.target.src = 'https://via.placeholder.com/200x150?text=No+Image'; }}
        />
      </div>
      <h2 className="text-xl font-semibold mb-2 text-brand-darkText">{product.name}</h2>
      <p className="text-brand-darkText/70 flex-1 mb-4">{product.description}</p>
      <div className="mt-auto">
        <div className="text-lg font-bold text-brand-primary mb-3">
          {formatCurrency(product.price)}
        </div>
        <Link
          to={`/products/${product.id}`}
          className="w-full inline-flex justify-center items-center px-4 py-2 bg-brand-primary text-brand-lightText rounded-xl hover:bg-white hover:text-brand-primary border-2 border-transparent hover:border-brand-primary transition-colors duration-300"
        >
          View Details
        </Link>
      </div>
    </div>
  </div>
));

export default ProductCard;
