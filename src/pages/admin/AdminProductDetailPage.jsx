import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

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
  const [productDetails, setProductDetails] = useState([]);
  const token = sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const [existingVariants, setExistingVariants] = useState([]);

  async function fetchProductDetails(productId) {
    try {
      const response = await axios.get(
        `http://localhost:5258/api/ProductDetail/${productId}/details`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching product details:", error);
      return null;
    }
  }

  useEffect(() => {
    if (id) {
      async function getProductDetails() {
        const data = await fetchProductDetails(id);
        if (data) {
          setProductDetails(data);
        }
      }
      getProductDetails(id);
    }
  }, [id]);
  useEffect(() => {
    async function fetchExistingVariants() {
      const data = await fetchProductDetails(id);
      if (data) {
        setExistingVariants(data);
      }
    }
    if (id) {
      fetchExistingVariants();
    }
  }, [id]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [colorsRes, sizesRes] = await Promise.all([
          axios.get(
            `http://localhost:5258/api/Color/GetAll?pageNumber=1&pageSize=100`
          ),
          axios.get(
            "http://localhost:5258/api/Size/GetAll?pageNumber=1&pageSize=100"
          ),
        ]);

        const activeFilter = (items) => items.filter((item) => item.isActive);
        const filteredColors = activeFilter(colorsRes.data.items || []);
        setColors(filteredColors);

        setSizes(activeFilter(sizesRes.data.items || []));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải dữ liệu màu sắc và kích thước");
      }
    };

    fetchData();
  }, []);
  // Toggle variant status
  const toggleVariantStatus = async (variantId) => {
    try {
      const variant = Object.values(existingVariants)
        .flat()
        .find((v) => v.id === variantId);

      if (!variant) return;

      const updatedVariant = {
        productId: variant.productId,
        color: variant.color,
        size: variant.size,
        quantity: variant.quantity,
        price: variant.price,
        description: variant.description,
        active: !variant.active,
      };

      await axios.patch(
        `http://localhost:8081/saleShoes/productdetails/${variantId}`,
        updatedVariant
      );

      // Update local state
      setVariantsByColor((prev) => {
        const newState = { ...prev };
        Object.keys(newState).forEach((color) => {
          newState[color] = newState[color].map((v) =>
            v.id === variantId ? { ...v, active: !v.active } : v
          );
        });
        return newState;
      });

      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      console.error("Error toggling variant status:", error);
      toast.error("Không thể cập nhật trạng thái");
      fetchProductVariants(); // Refresh data if error
    }
  };

  // Edit Modal Component
  const EditModal = () => {
    const [editForm, setEditForm] = useState({
      price: editingVariant?.price || 0,
      quantity: editingVariant?.quantity || 0,
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        // Validate form data
        if (editForm.quantity < 0) {
          toast.error("Số lượng không được âm");
          return;
        }

        if (editForm.price < 0) {
          toast.error("Giá không được âm");
          return;
        }

        const updatedVariant = {
          productId: editingVariant.productId,
          color: editingVariant.color,
          size: editingVariant.size,
          quantity: parseInt(editForm.quantity),
          price: parseFloat(editForm.price),
          description: editingVariant.description,
          active: editingVariant.active,
        };

        await axios.patch(
          `http://localhost:8081/saleShoes/productdetails/${editingVariant.id}`,
          updatedVariant
        );

        // Cập nhật state local
        setVariantsByColor((prev) => {
          const newState = { ...prev };
          Object.keys(newState).forEach((color) => {
            newState[color] = newState[color].map((v) =>
              v.id === editingVariant.id
                ? { ...v, price: editForm.price, quantity: editForm.quantity }
                : v
            );
          });
          return newState;
        });

        toast.success("Cập nhật thành công");
        setShowEditModal(false);
        setEditingVariant(null);
      } catch (error) {
        console.error("Error updating variant:", error);
        toast.error(
          "Không thể cập nhật biến thể: " +
            (error.response?.data?.message || error.message)
        );
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
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      quantity: parseInt(e.target.value),
                    })
                  }
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
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      price: parseFloat(e.target.value),
                    })
                  }
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
      productId: id,
      selectedColors: [],
      selectedSizes: [],
      quantity: 1,
      price: 0,
      imageUrls: [""],
    });

    const handleAddImageField = () => {
      if (variantForm.imageUrls.length < 3) {
        setVariantForm({
          ...variantForm,
          imageUrls: [...variantForm.imageUrls, ""],
        });
      }
    };
    const handleImageUpload = (e, index) => {
      const file = e.target.files[0];
      if (!file) return;

      const imageUrl = URL.createObjectURL(file); // Tạo URL tạm thời cho ảnh
      setVariantForm((prev) => {
        const newImageUrls = [...prev.imageUrls];
        newImageUrls[index] = imageUrl;
        return { ...prev, imageUrls: newImageUrls };
      });
    };

    const handleRemoveImageField = (index) => {
      const newImageUrls = variantForm.imageUrls.filter((_, i) => i !== index);
      setVariantForm({
        ...variantForm,
        imageUrls: newImageUrls,
      });
    };

    const handleColorChange = (colorId) => {
      const isSelected = variantForm.selectedColors.includes(colorId);
      setVariantForm({
        ...variantForm,
        selectedColors: isSelected
          ? variantForm.selectedColors.filter((id) => id !== colorId)
          : [...variantForm.selectedColors, colorId],
      });
    };

    const handleSizeChange = (sizeId) => {
      const isSelected = variantForm.selectedSizes.includes(sizeId);
      setVariantForm({
        ...variantForm,
        selectedSizes: isSelected
          ? variantForm.selectedSizes.filter((id) => id !== sizeId)
          : [...variantForm.selectedSizes, sizeId],
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        // Validate form data
        if (variantForm.selectedColors.length === 0) {
          toast.error("Vui lòng chọn ít nhất một màu sắc");
          return;
        }

        if (variantForm.selectedSizes.length === 0) {
          toast.error("Vui lòng chọn ít nhất một kích thước");
          return;
        }

        if (variantForm.quantity < 1) {
          toast.error("Số lượng phải lớn hơn 0");
          return;
        }

        if (variantForm.price < 0) {
          toast.error("Giá không được âm");
          return;
        }

        const variants = [];
        for (const colorId of variantForm.selectedColors) {
          for (const sizeId of variantForm.selectedSizes) {
            const selectedColor = colors.find(
              (c) => c.colorId === parseInt(colorId)
            );

            const selectedSize = sizes.find(
              (s) => s.sizeId === parseInt(sizeId)
            );

            const existingVariant = existingVariants.find(
              (v) =>
                v.colorId === selectedColor.colorId &&
                v.sizeId === selectedSize.sizeId
            );

            if (!existingVariant) {
              variants.push({
                productId: parseInt(id),
                colorID: selectedColor.colorId,
                sizeID: selectedSize.sizeId,
                quantity: parseInt(variantForm.quantity),
                price: parseFloat(variantForm.price),
                imageUrls: variantForm.imageUrls.filter(
                  (url) => url.trim() !== ""
                ),
              });
            } else {
              toast.error(
                `Biến thể ${selectedColor.name} - ${selectedSize.name} đã tồn tại`
              );
            }
          }
        }
        if (variants.length > 0) {
          // Gửi request tạo các biến thể
          for (const variant of variants) {
            await axios.post(
              "http://localhost:5258/api/ProductDetail",
              variant,
              {
                headers,
              }
            );
          }
          toast.success("Thêm biến thể thành công");
          const updatedData = await fetchProductDetails(id);
          if (updatedData) {
            setProductDetails(updatedData);
          }

          setShowAddModal(false);
        }
      } catch (error) {
        console.error("Error creating variants:", error);
        toast.error(
          "Không thể thêm biến thể: " +
            (error.response?.data?.message || error.message)
        );
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
                  {colors.map((color) => (
                    <label
                      key={color.colorId}
                      className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={variantForm.selectedColors.includes(
                          color.colorId.toString()
                        )}
                        onChange={() =>
                          handleColorChange(color.colorId.toString())
                        }
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
                  {sizes.map((size) => (
                    <label
                      key={size.sizeId}
                      className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={variantForm.selectedSizes.includes(
                          size.sizeId.toString()
                        )}
                        onChange={() =>
                          handleSizeChange(size.sizeId.toString())
                        }
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
                    onChange={(e) =>
                      setVariantForm({
                        ...variantForm,
                        quantity: parseInt(e.target.value),
                      })
                    }
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
                    onChange={(e) =>
                      setVariantForm({
                        ...variantForm,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border rounded-md"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ảnh sản phẩm (tối đa 3 ảnh)
                </label>
                {variantForm.imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, index)}
                      className="border p-2 rounded-md"
                    />
                    {url && (
                      <img
                        src={url}
                        alt={`Ảnh ${index + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImageField(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Xóa
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
            onClick={() => navigate("/admin/products")}
          >
            Back
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Danh sách sản phẩm</h2>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4">Màu</th>
                <th className="text-left py-3 px-4">Size</th>
                <th className="text-center py-3 px-4">Quantity</th>
                <th className="text-center py-3 px-4">Price</th>
                <th className="text-center py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productDetails.map((product) => (
                <tr key={product.productDetailId} className="border-b">
                  <td className="py-4 px-4">{product.colorName || "N/A"}</td>
                  <td className="py-4 px-4">{product.sizeName || "N/A"}</td>
                  <td className="text-center py-4 px-4">
                    {product.stockQuantity}
                  </td>
                  <td className="text-center py-4 px-4">
                    {product.price?.toLocaleString("vi-VN")}đ
                  </td>
                  <td className="py-4 px-4">
                    <button
                      className="p-1 hover:text-blue-600"
                      onClick={() => console.log("Edit", product)}
                    >
                      ✏️ Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add new modal */}
      {showAddModal && <AddVariantModal />}
      {showEditModal && <EditModal />}
    </div>
  );
};

export default AdminProductDetailPage;
