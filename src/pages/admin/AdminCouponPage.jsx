import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminCouponPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountPercentage: 0,
    minSpend: 0,
    maxDiscount: 0,
    expiryDate: '',
    active: true
  });

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      const response = await axios.get('http://localhost:8081/saleShoes/Coupons/Admin');
      if (response.data?.result) {
        setCoupons(response.data.result);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Không thể tải danh sách mã giảm giá');
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Create coupon
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8081/saleShoes/Coupons', formData);
      toast.success('Tạo mã giảm giá thành công');
      setShowCreateModal(false);
      setFormData({
        code: '',
        description: '',
        discountPercentage: 0,
        minSpend: 0,
        maxDiscount: 0,
        expiryDate: '',
        active: true
      });
      fetchCoupons();
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error('Không thể tạo mã giảm giá');
    }
  };

  // Update coupon
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8081/saleShoes/Coupons/${editingCoupon.id}`, {
        ...formData,
        active: editingCoupon.active
      });
      toast.success('Cập nhật mã giảm giá thành công');
      setShowEditModal(false);
      setEditingCoupon(null);
      setFormData({
        code: '',
        description: '',
        discountPercentage: 0,
        minSpend: 0,
        maxDiscount: 0,
        expiryDate: '',
        active: true
      });
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error('Không thể cập nhật mã giảm giá');
    }
  };

  // Toggle coupon status
  const toggleCouponStatus = async (couponId) => {
    try {
      const coupon = coupons.find(c => c.id === couponId);
      if (!coupon) return;

      await axios.post(`http://localhost:8081/saleShoes/Coupons/moveon/${couponId}`);

      setCoupons(prevCoupons => 
        prevCoupons.map(c => 
          c.id === couponId 
            ? { ...c, active: !c.active }
            : c
        )
      );

      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      toast.error('Không thể cập nhật trạng thái');
      fetchCoupons();
    }
  };

  // Create Modal Component
  const CreateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Tạo mã giảm giá mới</h2>
        <form onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Mã giảm giá"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
          />
          <input
            type="text"
            placeholder="M�� tả"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
          />
          <input
            type="number"
            placeholder="Phần trăm giảm"
            value={formData.discountPercentage}
            onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
            min="0"
            max="100"
          />
          <input
            type="number"
            placeholder="Giá trị đơn hàng tối thiểu"
            value={formData.minSpend}
            onChange={(e) => setFormData({ ...formData, minSpend: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
            min="0"
          />
          <input
            type="number"
            placeholder="Giảm giá tối đa"
            value={formData.maxDiscount}
            onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border rounded-md mb-4"
            required
            min="0"
          />
          <input
            type="datetime-local"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
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

  // Edit Modal Component
  const EditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa mã giảm giá</h2>
        <form onSubmit={handleUpdate}>
          {/* Same form fields as CreateModal */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setEditingCoupon(null);
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
          Quản lý mã giảm giá
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Tạo mới
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <input
            type="text"
            placeholder="Tìm kiếm mã giảm giá..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4">Mã</th>
                <th className="text-left py-4">Mô tả</th>
                <th className="text-center py-4">Giảm giá</th>
                <th className="text-center py-4">Đơn tối thiểu</th>
                <th className="text-center py-4">Giảm tối đa</th>
                <th className="text-center py-4">Hết hạn</th>
                <th className="text-center py-4">Trạng thái</th>
                <th className="text-right py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {coupons
                .filter(coupon => 
                  coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  coupon.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((coupon) => (
                  <tr key={coupon.id} className="border-b">
                    <td className="py-4">{coupon.code}</td>
                    <td className="py-4">{coupon.description}</td>
                    <td className="py-4 text-center">{coupon.discountPercentage}%</td>
                    <td className="py-4 text-center">{coupon.minSpend.toLocaleString()}đ</td>
                    <td className="py-4 text-center">{coupon.maxDiscount.toLocaleString()}đ</td>
                    <td className="py-4 text-center">
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleCouponStatus(coupon.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            coupon.active ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              coupon.active ? 'translate-x-6' : 'translate-x-1'
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
                            setEditingCoupon(coupon);
                            setFormData({
                              code: coupon.code,
                              description: coupon.description,
                              discountPercentage: coupon.discountPercentage,
                              minSpend: coupon.minSpend,
                              maxDiscount: coupon.maxDiscount,
                              expiryDate: coupon.expiryDate,
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

export default AdminCouponPage; 