import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import React from "react";
const AdminColorPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [colors, setColors] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [formData, setFormData] = useState({
    colorId: null,
    name: "",
  });
  const [pageNumber, setPageNumber] = useState(1); // Số trang hiện tại
  const [pageSize, setPageSize] = useState(5);

  const token = sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  // Fetch colors
  const fetchColors = async () => {
    try {
      // const token = localStorage.getItem("token"); // Lấy token từ localStorage
      const response = await axios.get(
        `http://localhost:5258/api/Color/GetAll?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
          headers,
        }
      );
      if (response.data) {
        setColors(response.data);
      }
    } catch (error) {
      console.error("Error fetching colors:", error);
      toast.error("Không thể tải danh sách màu sắc");
    }
  };
  useEffect(() => {
    fetchColors();
  }, []);

  // Create color
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `http://localhost:5258/api/color/GetByName?name=${formData.name}`,
        { headers }
      );
      if (response.data) {
        toast.error("Màu sắc đã tồn tại");
        return;
      }
      await axios.post(
        "http://localhost:5258/api/color",
        {
          name: formData.name,
          isActive: true,
        },
        { headers }
      );

      toast.success("Tạo màu sắc thành công");
      setShowCreateModal(false);
      setFormData({ name: "", active: true });
      fetchColors();
    } catch (error) {
      if (error.response && error.response.status === 404) {
        try {
          await axios.post(
            "http://localhost:5258/api/color",
            {
              ...formData,
              isActive: true,
            },
            { headers }
          );

          toast.success("Tạo màu sắc thành công");
          setShowCreateModal(false);
          setFormData({ name: "", active: true });
          fetchColors();
        } catch (postError) {
          console.error("Error creating color:", postError);
          toast.error("Không thể tạo màu sắc");
        }
      } else {
        console.error("Error checking color:", error);
        toast.error("Không thể kiểm tra màu sắc");
      }
    }
  };
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setPageNumber(1); // Reset lại trang về 1 khi thay đổi kích thước trang
  };
  const handlePageChange = (newPageNumber) => {
    setPageNumber(newPageNumber);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPageNumber(1); // Khi tìm kiếm thay đổi, quay lại trang 1
  };
  const toggleColorStatus = async (Id) => {
    try {
      const color = colors.find((c) => c.colorId === Id);

      if (!color) return;

      await axios.post(
        `http://localhost:5258/api/color/ChangeStatus?id=${Id}`,
        {},
        {
          headers,
        }
      );
      setColors(
        colors.map((c) =>
          c.colorId === Id ? { ...c, isActive: !c.isActive } : c
        )
      );

      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      console.error("Error toggling color status:", error);
      console.log("Error details:", error.response?.data);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật trạng thái"
      );
      fetchColors();
    }
  };

  // Modal components
  const CreateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Tạo màu sắc mới</h2>
        <form onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Tên màu sắc"
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
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5258/api/color/Update`,
        {
          colorId: formData.colorId,
          name: formData.name,
        },
        {
          headers,
        }
      );
      toast.success("Cập nhật màu sắc thành công");
      setShowEditModal(false);
      setEditingColor(null);
      setFormData({ colorId: "", name: "" }); // Reset form
      fetchColors();
    } catch (error) {
      console.error("Error updating color:", error);
      toast.error("Không thể cập nhật màu sắc");
    }
  };
  const deleteColor = async (colorId) => {
    try {
      // Gửi yêu cầu xóa tới API
      await axios.delete(
        `http://localhost:5258/api/color/Delete?id=${colorId}`,
        {
          headers,
        }
      );
      toast.success("Xóa màu sắc thành công");
      fetchColors(); // Lấy lại danh sách màu sắc
    } catch (error) {
      console.error("Error deleting color:", error);
      toast.error("Không thể xóa màu sắc");
    }
  };

  const EditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa màu sắc</h2>
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            placeholder="Tên màu sắc"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
            autoFocus
          />
          <input
            type="hidden"
            value={formData.colorId} // Lưu lại colorId nếu bạn cần gửi khi cập nhật
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setEditingColor(null);
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
  React.useEffect(() => {
    fetchColors();
  }, [pageSize, pageNumber]);
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
      <div>
        <label htmlFor="pageSize">Page Size:</label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={handlePageSizeChange}
          className="border p-2 rounded-md"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>
      {/* Colors Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="w-[10%] text-left py-3">#</th>
                <th className="w-[30%] text-center py-3">Name</th>
                <th className="w-[30%] text-center py-3">Status</th>
                <th className="w-[30%] text-center py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {colors
                .filter((color) =>
                  color.name
                    .toLowerCase()
                    .includes(searchQuery.trim().toLowerCase())
                )
                .map((color) => (
                  <tr key={color.colorId} className="border-b">
                    <td className="w-[10%] py-4">{color.colorId}</td>
                    <td className="w-[30%] py-4 text-center">{color.name}</td>
                    <td className="w-[30%] py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleColorStatus(color.colorId)}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                            color.isActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              color.isActive ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          className="p-1 hover:text-blue-600"
                          onClick={() => {
                            setEditingColor(color);
                            setFormData({
                              name: color.name,
                              colorId: color.colorId,
                            });
                            setShowEditModal(true);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-7 h-7"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                        </button>
                        {/* Nút xóa */}
                        <button
                          className="p-1 hover:text-red-600"
                          onClick={() => {
                            deleteColor(color.colorId);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-8 h-8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
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

export default AdminColorPage;
