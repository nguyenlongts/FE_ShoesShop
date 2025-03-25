import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5258/api/orders/${orderId}`
        );
        console.log(response);
        setOrder(response.data);
      } catch (err) {
        setError("Không thể tải đơn hàng. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Không tìm thấy đơn hàng.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <svg
            className="w-20 h-20 text-green-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4">Đặt hàng thành công!</h1>
        <p className="text-gray-600 mb-8">
          Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là:{" "}
          <span className="font-medium">{order.orderId}</span>
        </p>

        <div className="bg-gray-50 p-6 rounded-lg text-left mb-8">
          <h2 className="font-semibold mb-4">Thông tin đơn hàng</h2>
          <div className="space-y-2">
            <p>Người nhận: {order.fullname}</p>
            <p>Số điện thoại: {order.phoneNumber}</p>
            <p>Địa chỉ: {order.shippingAddress}</p>
            <p>
              Phương thức thanh toán:{" "}
              {order.payment.method === "cod"
                ? "Thanh toán khi nhận hàng"
                : order.payment.method === "banking"
                ? "Chuyển khoản ngân hàng"
                : "Ví MoMo"}
            </p>
            <p className="font-medium">
              Tổng tiền: {order.payment.total.toLocaleString("vi-VN")}₫
            </p>
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
