import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [variantsByColor, setVariantsByColor] = useState({});
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);

  // Fetch product variants grouped by color
  const fetchProductVariants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8081/saleShoes/productdetails/product/${id}/variants`);
      
      if (response.data?.result != null) {
        // Group variants by color
        const groupedVariants = {};
        Object.keys(response.data.result).forEach(color => {
          groupedVariants[color] = response.data.result[color];
        });
        setVariantsByColor(groupedVariants);
      } else if (response.data?.result === null) {
        toast.error('Không tìm thấy sản phẩm');
      }
    } catch (error) {
      console.error('Error fetching product variants:', error);
      toast.error('Không thể tải chi tiết sản phẩm');
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (id) {
      fetchProductVariants();
    }
  }, [id]);

  // Toggle variant status
  const toggleVariantStatus = async (variantId) => {
    try {
      const variant = Object.values(variantsByColor)
        .flat()
        .find(v => v.id === variantId);
      
      if (!variant) return;

      const updatedVariant = {
        productId: variant.productId,
        color: variant.color,
        size: variant.size,
        quantity: variant.quantity,
        price: variant.price,
        description: variant.description,
        active: !variant.active
      };

      await axios.patch(`http://localhost:8081/saleShoes/productdetails/${variantId}`, updatedVariant);
      
      // Update local state
      setVariantsByColor(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(color => {
          newState[color] = newState[color].map(v => 
            v.id === variantId ? { ...v, active: !v.active } : v
          );
        });
        return newState;
      });

      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      console.error('Error toggling variant status:', error);
      toast.error('Không thể cập nhật trạng thái');
      fetchProductVariants(); // Refresh data if error
    }
  };

  // Edit Modal Component
  const EditModal = () => {
    const [editForm, setEditForm] = useState({
      price: editingVariant?.price || 0,
      quantity: editingVariant?.quantity || 0
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        // Validate form data
        if (editForm.quantity < 0) {
          toast.error('Số lượng không được âm');
          return;
        }

        if (editForm.price < 0) {
          toast.error('Giá không được âm');
          return;
        }

        const updatedVariant = {
          productId: editingVariant.productId,
          color: editingVariant.color,
          size: editingVariant.size,
          quantity: parseInt(editForm.quantity),
          price: parseFloat(editForm.price),
          description: editingVariant.description,
          active: editingVariant.active
        };

        await axios.patch(
          `http://localhost:8081/saleShoes/productdetails/${editingVariant.id}`, 
          updatedVariant
        );

        // Cập nhật state local
        setVariantsByColor(prev => {
          const newState = { ...prev };
          Object.keys(newState).forEach(color => {
            newState[color] = newState[color].map(v => 
              v.id === editingVariant.id 
                ? { ...v, price: editForm.price, quantity: editForm.quantity }
                : v
            );
          });
          return newState;
        });

        toast.success('Cập nhật thành công');
        setShowEditModal(false);
        setEditingVariant(null);
      } catch (error) {
        console.error('Error updating variant:', error);
        toast.error('Không thể cập nhật biến thể: ' + (error.response?.data?.message || error.message));
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-96">
          <h2 className="text-xl font-bold mb-4">Cập nhật biến thể</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Màu sắc
                </label>
                <input
                  type="text"
                  value={editingVariant?.color}
                  disabled
                  className="mt-1 px-4 py-2 w-full border rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kích thước
                </label>
                <input
                  type="text"
                  value={editingVariant?.size}
                  disabled
                  className="mt-1 px-4 py-2 w-full border rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số lượng
                </label>
                <input
                  type="number"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) })}
                  min="0"
                  className="mt-1 px-4 py-2 w-full border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Giá
                </label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                  min="0"
                  className="mt-1 px-4 py-2 w-full border rounded-md"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
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

  // Add Variant Modal Component
  const AddVariantModal = () => {
    const [variantForm, setVariantForm] = useState({
      selectedColors: [],
      selectedSizes: [],
      quantity: 1,
      price: 0,
      imageUrls: ['']
    });

    const handleAddImageField = () => {
      if (variantForm.imageUrls.length < 3) {
        setVariantForm({
          ...variantForm,
          imageUrls: [...variantForm.imageUrls, '']
        });
      }
    };

    const handleRemoveImageField = (index) => {
      const newImageUrls = variantForm.imageUrls.filter((_, i) => i !== index);
      setVariantForm({
        ...variantForm,
        imageUrls: newImageUrls
      });
    };

    const handleImageUrlChange = (index, value) => {
      const newImageUrls = [...variantForm.imageUrls];
      newImageUrls[index] = value;
      setVariantForm({
        ...variantForm,
        imageUrls: newImageUrls
      });
    };

    const handleColorChange = (colorId) => {
      const isSelected = variantForm.selectedColors.includes(colorId);
      setVariantForm({
        ...variantForm,
        selectedColors: isSelected
          ? variantForm.selectedColors.filter(id => id !== colorId)
          : [...variantForm.selectedColors, colorId]
      });
    };

    const handleSizeChange = (sizeId) => {
      const isSelected = variantForm.selectedSizes.includes(sizeId);
      setVariantForm({
        ...variantForm,
        selectedSizes: isSelected
          ? variantForm.selectedSizes.filter(id => id !== sizeId)
          : [...variantForm.selectedSizes, sizeId]
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        // Validate form data
        if (variantForm.selectedColors.length === 0) {
          toast.error('Vui lòng chọn ít nhất một màu sắc');
          return;
        }

        if (variantForm.selectedSizes.length === 0) {
          toast.error('Vui lòng chọn ít nhất một kích thước');
          return;
        }

        if (variantForm.quantity < 1) {
          toast.error('Số lượng phải lớn hơn 0');
          return;
        }

        if (variantForm.price < 0) {
          toast.error('Giá không được âm');
          return;
        }

        // Tạo các biến thể cho mỗi combination của color và size
        const variants = [];
        for (const colorId of variantForm.selectedColors) {
          for (const sizeId of variantForm.selectedSizes) {
            const selectedColor = colors.find(c => c.id === parseInt(colorId));
            const selectedSize = sizes.find(s => s.id === parseInt(sizeId));

            // Kiểm tra xem combination này đã tồn tại chưa
            const existingVariant = Object.values(variantsByColor)
              .flat()
              .find(v => 
                v.color === selectedColor.name && 
                v.size === selectedSize.name
              );

            if (existingVariant) {
              toast.error(`Biến thể ${selectedColor.name} - ${selectedSize.name} đã tồn tại`);
              continue;
            }

            variants.push({
              productId: parseInt(id),
              color: selectedColor.name,
              size: selectedSize.name,
              quantity: parseInt(variantForm.quantity),
              price: parseFloat(variantForm.price),
              image: variantForm.imageUrls.filter(url => url.trim() !== ''),
              active: true
            });
          }
        }

        // Gửi request tạo các biến thể
        for (const variant of variants) {
          await axios.post('http://localhost:8081/saleShoes/productdetails', variant);
        }

        toast.success('Thêm biến thể thành công');
        setShowAddModal(false);
        fetchProductVariants();
      } catch (error) {
        console.error('Error creating variants:', error);
        toast.error('Không thể thêm biến thể: ' + (error.response?.data?.message || error.message));
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
        <div className="bg-white p-6 rounded-lg w-[500px] my-8">
          <h2 className="text-xl font-bold mb-4">Thêm biến thể mới</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Màu sắc (có thể chọn nhiều)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {colors.map(color => (
                    <label
                      key={color.id}
                      className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={variantForm.selectedColors.includes(color.id.toString())}
                        onChange={() => handleColorChange(color.id.toString())}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{color.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kích thước (có thể chọn nhiều)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {sizes.map(size => (
                    <label
                      key={size.id}
                      className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={variantForm.selectedSizes.includes(size.id.toString())}
                        onChange={() => handleSizeChange(size.id.toString())}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{size.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng trong kho
                  </label>
                  <input
                    type="number"
                    value={variantForm.quantity}
                    onChange={(e) => setVariantForm({ ...variantForm, quantity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-md"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá bán (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={variantForm.price}
                    onChange={(e) => setVariantForm({ ...variantForm, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-md"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link ảnh sản phẩm (tối đa 3 ảnh)
                </label>
                {variantForm.imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      placeholder="Nhập link ảnh"
                      className="flex-1 px-4 py-2 border rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImageField(index)}
                      className="px-2 py-1 text-red-600 hover:text-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {variantForm.imageUrls.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddImageField}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Thêm ảnh
                  </button>
                )}
              </div>

              {variantForm.imageUrls.some(url => url.trim() !== '') && (
                <div className="grid grid-cols-3 gap-2">
                  {variantForm.imageUrls.map((url, index) => (
                    url.trim() !== '' && (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                          onError={(e) => {
                            e.target.src = '/default-product.jpg';
                            toast.error(`Link ảnh ${index + 1} không hợp lệ`);
                          }}
                        />
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-md"
              >
                Thêm
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Thêm useEffect để fetch colors và sizes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [colorsRes, sizesRes] = await Promise.all([
          axios.get('http://localhost:8081/saleShoes/colors'),
          axios.get('http://localhost:8081/saleShoes/sizes')
        ]);

        // Lọc chỉ lấy các item active
        const activeFilter = items => items.filter(item => item.active);

        setColors(activeFilter(colorsRes.data?.result || []));
        setSizes(activeFilter(sizesRes.data?.result || []));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Không thể tải dữ liệu màu sắc và kích thước');
      }
    };

    fetchData();
  }, []);

  // Thêm loading state handler
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium">PRODUCT VARIANTS</h1>
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            onClick={() => setShowAddModal(true)}
          >
            Add Variant
          </button>
          <button 
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            onClick={() => navigate('/admin/products')}
          >
            Back
          </button>
        </div>
      </div>

      {/* Product Variants By Color */}
      {Object.entries(variantsByColor).map(([color, variants]) => (
        <div key={color} className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Màu: {color}</h2>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4">Size</th>
                  <th className="text-center py-3 px-4">Quantity</th>
                  <th className="text-center py-3 px-4">Price</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr key={variant.id} className="border-b">
                    <td className="py-4 px-4">{variant.size}</td>
                    <td className="text-center py-4 px-4">{variant.quantity}</td>
                    <td className="text-center py-4 px-4">
                      {variant.price?.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleVariantStatus(variant.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            variant.active ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              variant.active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2 justify-end">
                        <button 
                          className="p-1 hover:text-blue-600"
                          onClick={() => {
                            setEditingVariant(variant);
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
      ))}

      {/* Add new modal */}
      {showAddModal && <AddVariantModal />}
      {showEditModal && <EditModal />}
    </div>
  );
};

export default AdminProductDetailPage; 