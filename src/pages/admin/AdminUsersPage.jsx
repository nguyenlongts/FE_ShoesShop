import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const AdminUsersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });
  const API_URL = import.meta.env.VITE_API_URL;
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      const response = await axios.get(
        `${API_URL}/api/User/GetAll?pageSize=${pageSize}&pageNum=${pageNumber}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.data) {
        setUsers(response.data.items);
        setTotalPages(response.data.totalPages);
      } else {
        throw new Error("Dữ liệu trả về không hợp lệ");
      }
      setLoading(false);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        const isRefreshed = await handleRefreshToken();
        if (isRefreshed) {
          return fetchUsers();
        } else {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
      } else {
        console.error("Lỗi khi tải danh sách người dùng:", error);
        toast.error("Không thể tải danh sách người dùng");
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pageSize, pageNumber]);
  const handleRefreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      const response = await axios.post(`${API_URL}/api/Auth/RefreshToken`, {
        refreshToken: refreshToken,
      });

      if (response.data && response.data.accessToken) {
        sessionStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken); // nếu server trả refreshToken mới
        return true;
      }
    } catch (error) {
      console.error("Lỗi khi làm mới token:", error);
    }

    return false;
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setPageNumber(1);
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
      //fetchUsers(newPage);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (userId) => {
    try {
      const user = users.find((u) => u.userId === userId);
      if (!user) return;
      await axios.put(`${API_URL}/api/user/UpdateStatus?id=${userId}`);

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.userId === userId ? { ...u, isActive: !u.isActive } : u
        )
      );

      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      console.error("Error toggling user status:", error);
      console.log("Error details:", error.response?.data);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật trạng thái"
      );

      fetchUsers();
    }
  };

  const filteredUsers =
    users?.filter(
      (user) =>
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.userId?.toString().includes(searchQuery.toLowerCase())
    ) || [];

  // Modal components
  const CreateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Tạo người dùng mới</h2>
        <form onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
          />
          <input
            type="text"
            placeholder="Họ tên"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium">Users</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
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
              placeholder="Search users..."
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
      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4">ID</th>
                <th className="text-left py-4">Full name</th>
                <th className="text-left py-4">Email</th>
                <th className="text-left py-4">Phone</th>
                <th className="text-center py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr key="loading">
                  <td colSpan="5" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr key="no-data">
                  <td colSpan="5" className="text-center py-4">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userId} className="border-b">
                    <td className="py-4">
                      {user.userId.slice(0, 4) + "..." + user.userId.slice(-4)}
                    </td>
                    <td className="py-4">{user.fullName}</td>
                    <td className="py-4">{user.email}</td>
                    <td className="py-4">{user.phone}</td>
                    <td className="py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleToggleStatus(user.userId)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            user.isActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              user.isActive ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
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
      {showCreateModal && <CreateModal />}
    </div>
  );
};

export default AdminUsersPage;
