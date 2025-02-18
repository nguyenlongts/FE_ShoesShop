import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const defaultImage = '/path/to/default/image.jpg';

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="aspect-square mb-2 overflow-hidden rounded-lg bg-gray-100">
        <img
          src={product.images?.[0] || defaultImage}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:opacity-75"
        />
      </div>
      <h3 className="text-sm font-semibold text-gray-700">{product.name}</h3>
      <div className="mt-1 text-sm text-gray-500">
        <p>{product.category} - {product.brand}</p>
        <p className="font-medium">{product.price?.toLocaleString('vi-VN')}đ</p>
      </div>
    </Link>
  );
};

export default ProductCard; 