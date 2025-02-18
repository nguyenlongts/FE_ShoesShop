import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const HomePage = () => {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // useEffect(() => {
  //   // Kiểm tra token khi component mount
  //   const token = localStorage.getItem('token');
  //   const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
  //   if (token) {
  //     // Verify token
  //     const verifyToken = async () => {
  //       try {
  //         const response = await axios.post('http://localhost:8081/saleShoes/auth/check', {
  //           token: token
  //         });
          
  //         if (response.data?.result) {
  //           // Kiểm tra nếu là admin thì chuyển đến trang admin
  //           const userRoles = userData.roles || [];
  //           const isAdmin = userRoles.some(role => role === 'ADMIN');
            
  //           if (isAdmin) {
  //             navigate('/admin');
  //           } else {
  //             setUser(userData);
  //           }
  //         } else {
  //           // Token không hợp lệ
  //           localStorage.removeItem('token');
  //           localStorage.removeItem('user');
  //           navigate('/signin');
  //         }
  //       } catch (error) {
  //         console.error('Token verification error:', error);
  //         localStorage.removeItem('token');
  //         localStorage.removeItem('user');
  //         navigate('/signin');
  //       }
  //     };

  //     verifyToken();
  //   }
  // }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8081/saleShoes/products');
        const productsData = response.data?.result || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Add user info if logged in */}
      {user && (
        <div className="mb-4">
          <p>Welcome, {user.fullName}</p>
        </div>
      )}
      
      <div className="flex justify-end items-center mb-8">
        <div className="flex gap-4">
          <button 
            className="flex items-center gap-2 hover:text-gray-700"
            onClick={toggleSidebar}
          >
            {showSidebar ? 'Hide' : 'Show'} Filters
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
            </svg>
          </button>
          <button className="flex items-center gap-2">
            Sort By
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        <div className={`transition-all duration-300 ${
          showSidebar 
            ? 'w-64 opacity-100' 
            : 'w-0 opacity-0 overflow-hidden'
        }`}>
          <Sidebar />
        </div>
        
        <div className={`flex-1 transition-all duration-300 ${
          showSidebar ? 'ml-0' : 'ml-0'
        }`}>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.minPrice,
                    description: product.description,
                    category: product.category?.name,
                    brand: product.brand?.name,
                    images: [product.imageUrl],
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Không có sản phẩm nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 