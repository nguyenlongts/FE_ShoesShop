import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Load order from localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const foundOrder = orders.find(o => o.id === orderId);
    if (foundOrder) {
      setOrder(foundOrder);
    }
  }, [orderId]);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Không tìm thấy đơn hàng</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <svg className="w-20 h-20 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4">Đặt hàng thành công!</h1>
        <p className="text-gray-600 mb-8">
          Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là: <span className="font-medium">{order.id}</span>
        </p>

        <div className="bg-gray-50 p-6 rounded-lg text-left mb-8">
          <h2 className="font-semibold mb-4">Thông tin đơn hàng</h2>
          <div className="space-y-2">
            <p>Người nhận: {order.shipping.fullName}</p>
            <p>Số điện thoại: {order.shipping.phone}</p>
            <p>Địa chỉ: {order.shipping.address}, {order.shipping.ward}, {order.shipping.district}, {order.shipping.city}</p>
            <p>Phương thức thanh toán: {
              order.payment.method === 'cod' ? 'Thanh toán khi nhận hàng' :
              order.payment.method === 'banking' ? 'Chuyển khoản ngân hàng' :
              'Ví MoMo'
            }</p>
            <p className="font-medium">Tổng tiền: {order.payment.total.toLocaleString('vi-VN')}₫</p>
          </div>
        </div>

        <div className="space-x-4">
          <Link
            to="/history"
            className="inline-block px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800"
          >
            Xem đơn hàng
          </Link>
          <Link
            to="/"
            className="inline-block px-6 py-3 border border-black rounded-full hover:bg-gray-100"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage; 