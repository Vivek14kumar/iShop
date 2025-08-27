import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from './productCard';
import API from '../api/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const location = useLocation();

  // Extract category from URL
  const params = new URLSearchParams(location.search);
  const category = params.get('category');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = '/products';
        if (category) {
          url += `?category=${encodeURIComponent(category)}`;
        }

        const res = await API.get(url);
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, [category]); // refetch when category changes

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {category ? `${category}` : 'Products'}
      </h2>

      {/*<input
        type="text"
        placeholder="Search by name..."
        className="w-full border p-2 mb-6 rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />*/}

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
        {filtered.length === 0 && <p>No products found.</p>}
      </div>
    </div>
  );
}
