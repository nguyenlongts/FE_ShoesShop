import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import React from "react";

const OrderDetail = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        console.log(data);
        setOrderDetails(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Chuyển đổi status code sang text
  const getStatusText = (statusCode) => {
    const statuses = {
      0: "Đang xác nhận",
      1: "Đang chuẩn bị hàng",
      2: "Đang giao",
      3: "Thành công",
      4: "Đã huỷ",
    };
    return statuses[statusCode] || "Unknown";
  };

  // Cập nhật trạng thái đơn hàng
  const updateOrderStatus = async () => {
    setUpdating(true);
    try {
      // Gọi API cập nhật trạng thái đơn hàng thành "Đã hủy" (status = 4)
      const response = await axios.put(`${API_URL}/api/orders/update-status`, {
        status: 4,
        orderId: orderId,
      });

      if (response.status === 200) {
        // Cập nhật thành công, cập nhật trạng thái trên UI
        setOrderDetails((prev) => ({
          ...prev,
          status: 4,
        }));
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to cancel the order. Please try again.");
    } finally {
      setUpdating(false);
      setShowConfirm(false);
    }
  };

  const getStatusColor = (statusCode) => {
    const colors = {
      0: "bg-yellow-100 text-yellow-800", // Pending
      1: "bg-blue-100 text-blue-800", // Processing
      2: "bg-purple-100 text-purple-800", // Shipped
      3: "bg-green-100 text-green-800", // Delivered
      4: "bg-red-100 text-red-800", // Cancelled
    };
    return colors[statusCode] || "bg-gray-100 text-gray-800";
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Kiểm tra xem đơn hàng có thể hủy được không
  const canCancelOrder = (status) => {
    // Chỉ cho phép hủy đơn khi đơn đang ở trạng thái chờ xác nhận (0) hoặc đang xử lý (1)
    return status === 0 || status === 1;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (!orderDetails) {
    return <div className="text-center py-8">Order not found</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium">Chi tiết đơn hàng</h1>
        <button
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          onClick={() => navigate("/history")}
        >
          Trở về
        </button>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">
            Đơn hàng #{orderDetails.orderId}
          </h2>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(
              orderDetails.status
            )}`}
          >
            {getStatusText(orderDetails.status)}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Ngày đặt hàng</p>
            <p className="font-medium">{formatDate(orderDetails.createAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tổng tiền</p>
            <p className="font-medium">{orderDetails.totalPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Cancel Order Button */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">Order Actions</h2>
          {canCancelOrder(orderDetails.status) ? (
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500"
              onClick={() => setShowConfirm(true)}
              disabled={updating || orderDetails.status === 4}
            >
              Huỷ đơn hàng
            </button>
          ) : (
            <p className="text-gray-500">
              {orderDetails.status === 4
                ? "This order has been cancelled."
                : "This order can no longer be cancelled."}
            </p>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <h2 className="text-xl font-medium mb-4">Ordered Products</h2>
          <table className="w-full">
            <thead>
              <tr className="bg-pink-50">
                <th className="text-left py-3 px-4">Product ID</th>
                <th className="text-center py-3 px-4">Quantity</th>
                <th className="text-center py-3 px-4">Unit Price</th>
                <th className="text-center py-3 px-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.orderItems.map((item) => (
                <tr key={item.orderItemId}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                        <img
                          src={`http://localhost:5258/Uploads/${item.productDetail.imageUrl}`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span>Product #{item.productDetail.productDetailId}</span>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">{item.quantity}</td>
                  <td className="text-center py-4 px-4">{item.unitPrice}</td>
                  <td className="text-center py-4 px-4">{item.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t">
                <td colSpan="3" className="text-right py-4 px-4 font-medium">
                  Total:
                </td>
                <td className="text-center py-4 px-4 font-medium">
                  ${orderDetails.totalPrice.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-medium mb-4">Shipping Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                UserName:
              </label>
              <p>{orderDetails.fullname}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Shipping Address:
              </label>
              <p>{orderDetails.shippingAddress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Cancellation</h3>
            <p>
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={updateOrderStatus}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
                disabled={updating}
              >
                {updating ? "Processing..." : "Yes, Cancel Order"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                disabled={updating}
              >
                No, Keep Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
