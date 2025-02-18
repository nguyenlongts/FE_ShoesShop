import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminProductPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    active: true
  });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8081/saleShoes/products/admin');
      if (response.data?.result) {
        setProducts(response.data.result);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch brands and categories
  const fetchBrandsAndCategories = async () => {
    try {
      const [brandsRes, categoriesRes] = await Promise.all([
        axios.get('http://localhost:8081/saleShoes/brands'),
        axios.get('http://localhost:8081/saleShoes/categories')
      ]);
      setBrands(brandsRes.data?.result || []);
      setCategories(categoriesRes.data?.result || []);
    } catch (error) {
      console.error('Error fetching brands or categories:', error);
      toast.error('Không thể tải dữ liệu thương hiệu hoặc danh mục');
    }
  };

  useEffect(() => {
    fetchBrandsAndCategories();
  }, []);

  // Toggle product status
  const toggleProductStatus = async (productId) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      if (!product.active) {
        // Nếu đang inactive thì gọi API moveOn để activate
        await axios.post(`http://localhost:8081/saleShoes/products/moveon/${productId}`);
      } else {
        // Nếu đang active thì gọi API delete để deactivate
        await axios.delete(`http://localhost:8081/saleShoes/products/${productId}`);
      }

      // Cập nhật UI sau khi API thành công
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productId 
            ? { ...p, active: !p.active }
            : p
        )
      );

      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error('Không thể cập nhật trạng thái');
      // Fetch lại data nếu có lỗi để đồng bộ với DB
      fetchProducts();
    }
  };

  // Create product modal
  const CreateModal = () => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        // Validate form data
        if (!formData.name.trim()) {
          toast.error('Tên sản phẩm không được để trống');
          return;
        }

        if (!formData.brand) {
          toast.error('Vui lòng chọn thương hiệu');
          return;
        }

        if (!formData.category) {
          toast.error('Vui lòng chọn danh mục');
          return;
        }

        const response = await axios.get(`http://localhost:8081/saleShoes/products/name/${formData.name}`);
        if (response.data?.result.length > 0) {
          toast.error('Sản phẩm đã tồn tại');
          return;
        }

        const newProduct = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          brand: {
            id: formData.brand,
            name: brands.find(b => b.id === formData.brand)?.name || "" // Lấy tên từ danh sách brands
          },
          category: {
            id: formData.category,
            name: categories.find(c => c.id === formData.category)?.name || "" // Lấy tên từ danh sách categories
          },
          active: true
        };
        

        await axios.post('http://localhost:8081/saleShoes/products', newProduct);
        toast.success('Tạo sản phẩm thành công');
        setShowCreateModal(false);
        setFormData({ name: '', description: '', brand: '', category: '', active: true });
        fetchProducts();
      } catch (error) {
        console.error('Error creating product:', error);
        toast.error(error.response?.data?.message || 'Không thể tạo sản phẩm');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-96">
          <h2 className="text-xl font-bold mb-4">Tạo sản phẩm mới</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Tên sản phẩm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-md"
              required
              autoFocus
            />
            <textarea
              placeholder="Mô tả"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-md"
              
            />
            <select
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-4 py-2 border rounded-md"
              required
            >
              <option value="">Chọn thương hiệu</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-md"
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-md"
              >
                Tạo
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Edit product modal
  const EditModal = () => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const updatedProduct = {
          name: formData.name,
          description: formData.description,
          brand: formData.brand,
          category: formData.category,
          active: formData.active
        };

        await axios.patch(`http://localhost:8081/saleShoes/products/${editingProduct.id}`, updatedProduct);
        toast.success('Cập nhật sản phẩm thành công');
        setShowEditModal(false);
        setEditingProduct(null);
        setFormData({ name: '', description: '', brand: '', category: '', active: true });
        fetchProducts();
      } catch (error) {
        console.error('Error updating product:', error);
        toast.error('Không thể cập nhật sản phẩm');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-96">
          <h2 className="text-xl font-bold mb-4">Chỉnh sửa sản phẩm</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Tên sản phẩm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
            <textarea
              placeholder="Mô tả"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-md"
            />
            <select
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-4 py-2 border rounded-md"
              required
            >
              <option value="">Chọn thương hiệu</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-md"
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 border rounded-md"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-md"
              >
                Cập nhật
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500">View, create, update and manage</div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Create
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4">ID</th>
                <th className="text-left py-4">Name</th>
                <th className="text-left py-4">Brand</th>
                <th className="text-left py-4">Category</th>
                <th className="text-center py-4">Status</th>
                <th className="text-right py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter(product => 
                  product.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
                )
                .map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="py-4">{product.id}</td>
                  <td className="py-4">{product.name}</td>
                  <td className="py-4">{product.brand?.name}</td>
                  <td className="py-4">{product.category?.name}</td>
                  <td className="py-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleProductStatus(product.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          product.active ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            product.active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        className="text-blue-600 hover:underline"
                        onClick={() => navigate(`/admin/products/${product.id}`)}
                      >
                        Details
                      </button>
                      <button 
                        className="p-1 hover:text-blue-600"
                        onClick={() => {
                          setEditingProduct(product);
                          setFormData({
                            name: product.name,
                            description: product.description,
                            brand: product.brand.id,
                            category: product.category.id,
                            active: product.active
                          });
                          setShowEditModal(true);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && <CreateModal />}
      {showEditModal && <EditModal />}
    </div>
  );
};

export default AdminProductPage;