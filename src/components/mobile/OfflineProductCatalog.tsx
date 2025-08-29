'use client';

import { Product } from '@/types/product';

interface OfflineProductCatalogProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export default function OfflineProductCatalog({ 
  products, 
  onProductClick 
}: OfflineProductCatalogProps) {
  if (!products.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        No products available offline. Please check your connection.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <div 
          key={product.id}
          className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onProductClick(product)}
        >
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{product.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{product.price} {product.currency}</p>
        </div>
      ))}
    </div>
  );
}
