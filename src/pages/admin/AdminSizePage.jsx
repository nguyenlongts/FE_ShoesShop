import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const AdminSizePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sizes, setSizes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSize, setEditingSize] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  const [pageNumber, setPageNumber] = useState(1); // Số trang hiện tại
  const [pageSize, setPageSize] = useState(5);

  const token = sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  // Fetch Size
  const fetchSizes = async () => {
    try {
      // const token = localStorage.getItem("token"); // Lấy token từ localStorage
      const response = await axios.get(
        `http://localhost:5258/api/Size/GetAll?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
          headers,
        }
      );
      if (response.data.items) {
        setSizes(response.data.items);
      }
    } catch (error) {
      console.error("Error fetching sizes:", error);
      toast.error("Không thể tải danh sách kích thước");
    }
  };

  useEffect(() => {
    fetchSizes();
  }, [pageSize, pageNumber]);
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setPageNumber(1); // Reset lại trang về 1 khi thay đổi kích thước trang
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
      fetchSizes(newPage);
    }
  };

  // Create size
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      try {
        // Kiểm tra xem màu sắc đã tồn tại hay chưa
        const response = await axios.get(
          `http://localhost:5258/api/Size/GetByName?name=${formData.name}`
        );
        if (response.data?.result) {
          toast.error("Size đã tồn tại");
          return; // Dừng lại nếu đã tồn tại
        }
        // Nếu chưa tồn tại, thực hiện tạo mới
        await axios.post(
          "http://localhost:5258/api/size/",
          {
            ...formData,
            isActive: true,
          },
          { headers }
        );
        toast.success("Tạo kích thước thành công");
        setShowCreateModal(false);
        setFormData({ name: "", active: true });
        fetchSizes();
      } catch (error) {
        if (error.response && error.response.status === 400) {
          // Size không tồn tại, tiếp tục tạo mới
          await axios.post("http://localhost:8081/saleShoes/sizes", {
            ...formData,
            active: true,
          });
          toast.success("Tạo kích thước thành công");
          setShowCreateModal(false);
          setFormData({ name: "", active: true });
          fetchSizes();
        } else {
          // Xử lý lỗi khác
          throw error;
        }
      }
    } catch (error) {
      console.error("Error creating size:", error);
      toast.error("Không thể tạo kích thước");
    }
  };

  // Update size
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `http://localhost:8081/saleShoes/sizes/${editingSize.id}`,
        {
          ...formData,
          active: editingSize.active,
        }
      );
      toast.success("Cập nhật kích thước thành công");
      setShowEditModal(false);
      setEditingSize(null);
      setFormData({ name: "", active: true });
      fetchSizes();
    } catch (error) {
      console.error("Error updating size:", error);
      toast.error("Không thể cập nhật kích thước");
    }
  };

  // Toggle size status
  const toggleSizeStatus = async (sizeId) => {
    try {
      const size = sizes.find((s) => s.id === sizeId);
      if (!size) return;

      if (size.active) {
        // Nếu đang active thì gọi API delete để deactivate
        await axios.delete(`http://localhost:8081/saleShoes/sizes/${sizeId}`);
      } else {
        // Nếu đang inactive thì gọi API moveOn để activate
        await axios.post(
          `http://localhost:8081/saleShoes/sizes/moveon/${sizeId}`
        );
      }

      // Cập nhật state local
      setSizes(
        sizes.map((s) => (s.id === sizeId ? { ...s, active: !s.active } : s))
      );

      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      console.error("Error toggling size status:", error);
      console.log("Error details:", error.response?.data);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật trạng thái"
      );

      // Fetch lại data nếu có lỗi
      fetchSizes();
    }
  };

  // Modal components
  const CreateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Tạo kích thước mới</h2>
        <form onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Tên kích thước"
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
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa kích thước</h2>
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            placeholder="Tên kích thước"
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
                setEditingSize(null);
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

      {/* Sizes Table */}
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
              {sizes
                .filter((size) =>
                  size.name
                    .toLowerCase()
                    .includes(searchQuery.trim().toLowerCase())
                )
                .map((size) => (
                  <tr key={size.id} className="border-b">
                    <td className="py-4">{size.sizeId}</td>
                    <td className="py-4">{size.name}</td>
                    <td className="py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleSizeStatus(size.sizeId)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            size.isActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              size.isActive ? "translate-x-6" : "translate-x-1"
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
                            setEditingSize(size);
                            setFormData({ name: size.name });
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

      {/* Modals */}
      {showCreateModal && <CreateModal />}
      {showEditModal && <EditModal />}
    </div>
  );
};

export default AdminSizePage;
