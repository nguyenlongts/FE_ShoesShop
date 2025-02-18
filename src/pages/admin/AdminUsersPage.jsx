import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminUsersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    phone: '',
    email: '',
    password: '',
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8081/saleShoes/users');
      if (response.data && response.data.result) {
        setUsers(response.data.result);
      } else {
        setUsers([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
      setUsers([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Create user
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8081/saleShoes/users', formData);
      toast.success('Tạo người dùng thành công');
      setShowCreateModal(false);
      setFormData({ username: '', fullName: '', email: '', password: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Không thể tạo người dùng');
    }
  };

  // Update user
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8081/saleShoes/users/${editingUser.userId}`, {
        ...formData,
        active: editingUser.active
      });
      toast.success('Cập nhật người dùng thành công');
      setShowEditModal(false);
      setEditingUser(null);
      setFormData({ username: '', fullName: '', email: '', password: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Không thể cập nhật người dùng');
    }
  };

  // Toggle user status
  const handleToggleStatus = async (userId) => {
    try {
      const user = users.find(u => u.userId === userId);
      if (!user) return;

      // if (user.active) {
      //   // Nếu đang active thì gọi API delete để deactivate
      //   await axios.delete(`http://localhost:8081/saleShoes/users/${userId}`);
      // } else {
      //   // Nếu đang inactive thì gọi API moveOn để activate
      //   await axios.post(`http://localhost:8081/saleShoes/users/moveon/${userId}`);
      // }

      await axios.post(`http://localhost:8081/saleShoes/users/moveon/${userId}`);

      // Cập nhật state local
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.userId === userId 
            ? { ...u, active: !u.active }
            : u
        )
      );

      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      console.error('Error toggling user status:', error);
      console.log('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
      
      // Fetch lại data nếu có lỗi
      fetchUsers();
    }
  };

  // Filter users based on search query
  const filteredUsers = users?.filter(user =>
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
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
          />
          <input
            type="text"
            placeholder="Họ tên"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

  const EditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa người dùng</h2>
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
          />
          <input
            type="text"
            placeholder="Họ tên"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
          />
          <input
            type="tel"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setEditingUser(null);
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

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4">#</th>
                <th className="text-left py-4">Full name</th>
                <th className="text-left py-4">Email</th>
                <th className="text-left py-4">Phone</th>
                <th className="text-center py-4">Status</th>
                <th className="text-right py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr key="loading">
                  <td colSpan="5" className="text-center py-4">Loading...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr key="no-data">
                  <td colSpan="5" className="text-center py-4">No users found</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userId} className="border-b">
                    <td className="py-4">{user.userId}</td>
                    <td className="py-4">{user.fullName}</td>
                    <td className="py-4">{user.email}</td>
                    <td className="py-4">{user.phone}</td>
                    <td className="py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleToggleStatus(user.userId)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            user.active ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              user.active ? 'translate-x-6' : 'translate-x-1'
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
                            setEditingUser(user);
                            setFormData({
                              username: user.username,
                              fullName: user.fullName,
                              email: user.email,
                              password: '',
                              phone: user.phone
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
                ))
              )}
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

export default AdminUsersPage; 