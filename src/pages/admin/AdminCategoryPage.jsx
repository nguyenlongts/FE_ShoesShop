import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const AdminCategoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    Name: "",
    isActive: true,
  });
  const [pageNumber, setPageNumber] = useState(1); // Số trang hiện tại
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState([]);
  const token = sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5258/api/Category/GetAll",
        {
          headers,
        }
      );
      if (response.data) {
        setCategories(response.data.items);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách danh mục");
    }
  };
  // const fetchCategories = async () => {
  //   try {
  //     const response = await axios.get('http://localhost:8081/saleShoes/categories/admin');
  //     if (response.data?.result) {
  //       setCategories(response.data.result);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching categories:', error);
  //     toast.error('Không thể tải danh sách danh mục');
  //   }
  // };

  useEffect(() => {
    fetchCategories();
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

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5258/api/Category/Create",
        {
          name: formData.name,
          isActive: true,
        },
        { headers }
      );

      toast.success("Tạo danh mục thành công");
      setShowCreateModal(false);
      setFormData({ name: "", active: true });
      fetchCategories();
    } catch (error) {
      // Check if the error is due to category already existing
      if (error.response) {
        if (
          error.response.data &&
          error.response.data.includes("already exists")
        ) {
          toast.error("Danh mục đã tồn tại");
        } else {
          console.error("Error creating category:", error);
          toast.error("Không thể tạo danh mục");
        }
      } else {
        console.error("Network error:", error);
        toast.error("Lỗi kết nối, vui lòng thử lại sau");
      }
    }
  };
  // Create category

  // Update category
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `http://localhost:8081/saleShoes/categories/${editingCategory.id}`,
        {
          ...formData,
          active: editingCategory.active,
        }
      );
      toast.success("Cập nhật danh mục thành công");
      setShowEditModal(false);
      setEditingCategory(null);
      setFormData({ name: "", active: true });
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Không thể cập nhật danh mục");
    }
  };
  const toggleCategoryStatus = async (Id) => {
    try {
      const category = categories.find((c) => c.cateID === Id);
      if (!category) return;
      const response = await fetch(
        `http://localhost:5258/api/Category/UpdateStatus?id=${Id}`,
        {
          method: "PUT",
          headers,
        }
      );
      toast.success("Cập nhật trạng thái thành công");
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi khi cập nhật trạng thái:", errorData);
        return;
      }

      fetchCategories(); // Fetch lại dữ liệu sau khi cập nhật
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };

  // Modal components
  const CreateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Tạo danh mục mới</h2>
        <form onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Tên danh mục"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
            autoFocus
          />
          <div className="flex justify-end gap-2">
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

  const EditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa danh mục</h2>
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            placeholder="Tên danh mục"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setEditingCategory(null);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500">
          View, create, update and manage
        </div>
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
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4">#</th>
                <th className="text-left py-4">Name</th>
                <th className="text-center py-4">Status</th>
                <th className="text-right py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {categories
                .filter((category) =>
                  category.name
                    .toLowerCase()
                    .includes(searchQuery.trim().toLowerCase())
                )
                .map((category) => (
                  <tr key={category.cateID} className="border-b">
                    <td className="py-4">{category.id}</td>
                    <td className="py-4">{category.name}</td>
                    <td className="py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleCategoryStatus(category.cateID)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            category.isActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              category.isActive
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="p-1 hover:text-blue-600"
                          onClick={() => {
                            setEditingCategory(category);
                            setFormData({ name: category.name });
                            setShowEditModal(true);
                          }}
                        >
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
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
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
      {/* Modals */}
      {showCreateModal && <CreateModal />}
      {showEditModal && <EditModal />}
    </div>
  );
};

export default AdminCategoryPage;
