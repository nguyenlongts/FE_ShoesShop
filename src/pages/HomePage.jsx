import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const HomePage = () => {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [pageNumber, setPageNumber] = useState(1); // Số trang hiện tại
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5258/api/Product/GetAllAdmin?pageSize=9&pageNum=1"
      );
      const productsData = response.data.products || [];
      console.log(productsData);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pageSize, pageNumber]);
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setPageNumber(1); // Reset lại trang về 1 khi thay đổi kích thước trang
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
      fetchBrands(newPage);
    }
  };
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
            {showSidebar ? "Hide" : "Show"} Filters
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
              />
            </svg>
          </button>
          <button className="flex items-center gap-2">
            Sort By
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        <div
          className={`transition-all duration-300 ${
            showSidebar ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden"
          }`}
        >
          <Sidebar />
        </div>

        <div
          className={`flex-1 transition-all duration-300 ${
            showSidebar ? "ml-0" : "ml-0"
          }`}
        >
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={{
                    id: product.productId,
                    name: product.name,
                    price: product.basePrice,
                    description: product.description,
                    category: product.categoryName,
                    brand: product.brandName,
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
          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={pageNumber === 1}
              className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md"
            >
              Prev
            </button>
            <span>Page {pageNumber}</span>
            <button
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={pageNumber === totalPages}
              className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
