import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import React from "react";
const AdminOrderDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/api/orders/${id}`);
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
  }, [id]);

  const getStatusText = (statusCode) => {
    const statuses = {
      0: "Pending",
      1: "Processing",
      2: "Shipped",
      3: "Delivered",
      4: "Cancelled",
    };
    return statuses[statusCode] || "Unknown";
  };
  const OrderStatusBar = ({ orderDetails, updateOrderStatus, updating }) => {
    const statuses = [
      { id: 0, label: "Đang xác nhận" },
      { id: 1, label: "Đang xử lý đơn hàng" },
      { id: 2, label: "Đang giao hàng" },
      { id: 3, label: "Giao hàng thành công" },
      { id: 4, label: "Huỷ đơn hàng" },
    ];
    const handleStatusClick = (statusId) => {
      setSelectedStatus(statusId);
      setShowConfirm(true);
    };

    const confirmUpdate = () => {
      if (selectedStatus !== null) {
        updateOrderStatus(selectedStatus);
      }
      setShowConfirm(false);
    };
    return (
      <div className="w-full bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Update Order Status</h2>
        <div className="flex w-full items-center mb-8">
          {statuses.map((status, index) => (
            <React.Fragment key={status.id}>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  orderDetails.status === status.id
                    ? getStatusColor(status.id) + " shadow-md"
                    : status.id < orderDetails.status ||
                      orderDetails.status == 3
                    ? "bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
                onClick={() => handleStatusClick(status.id)}
                disabled={
                  updating ||
                  status.id < orderDetails.status ||
                  orderDetails.status == 3
                }
              >
                {status.label}
              </button>

              {/* Connector Line */}
              {index < statuses.length - 1 && (
                <div
                  className={`flex-grow h-1 mx-1 ${
                    status.id < orderDetails.status
                      ? "bg-gray-300 opacity-50"
                      : "bg-gray-300"
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-lg font-semibold mb-4">Confirm Update</h3>
              <p>
                Are you sure you want to update the order status to{" "}
                <strong>{statuses[selectedStatus]?.label}</strong>?
              </p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={confirmUpdate}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  const getStatusColor = (statusCode) => {
    const colors = {
      0: "bg-yellow-100 text-yellow-800",
      1: "bg-blue-100 text-blue-800",
      2: "bg-purple-100 text-purple-800",
      3: "bg-green-100 text-green-800",
      4: "bg-red-100 text-red-800",
    };
    return colors[statusCode] || "bg-gray-100 text-gray-800";
  };

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
  const updateOrderStatus = async (newStatus) => {
    if (orderDetails.status === newStatus) return;
    setUpdating(true);

    try {
      const { data } = await axios.put(
        `${API_URL}/api/orders/update-status`,
        {
          orderId: orderDetails.orderId,
          status: newStatus,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Cập nhật thành công:", data);

      // Cập nhật trạng thái đơn hàng sau khi API trả về thành công
      setOrderDetails((prevDetails) => ({
        ...prevDetails,
        status: newStatus,
      }));
    } catch (error) {
      console.error(
        "Error updating order status:",
        error.response?.data || error.message
      );
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
    }
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
        <h1 className="text-2xl font-medium">ORDER DETAILS</h1>
        <button
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          onClick={() => navigate("/admin/orders")}
        >
          Back
        </button>
      </div>
      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">
            Order #{orderDetails.orderId.substring(0, 8)}
          </h2>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {getStatusText(orderDetails.status)}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Order Date</p>
            <p className="font-medium">{formatDate(orderDetails.createAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="font-medium">
              {orderDetails.totalPrice.toFixed(2)} đ
            </p>
          </div>
        </div>
      </div>
      <OrderStatusBar
        orderDetails={orderDetails}
        updateOrderStatus={updateOrderStatus}
        updating={updating}
      />

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <h2 className="text-xl font-medium mb-4">Ordered Products</h2>
          <table className="w-full">
            <thead>
              <tr className="bg-pink-50">
                <th className="text-left py-3 px-4">Product</th>
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
                          src={`${API_URL}/Uploads/${item.image}`}
                          className="h-full w-full object-cover object-center group-hover:opacity-75"
                        />
                      </div>
                      <div>
                        <span className="block font-medium">
                          {item.productName}
                        </span>
                        <span className="block text-sm text-gray-500">
                          Size: {item.sizeName} | Color: {item.colorName}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">{item.quantity}</td>
                  <td className="text-center py-4 px-4">
                    {item.unitPrice.toFixed(2)} đ
                  </td>
                  <td className="text-center py-4 px-4">
                    {item.total.toFixed(2)} đ
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="border-t">
                <td colSpan="3" className="text-right py-4 px-4 font-medium">
                  Total:
                </td>
                <td className="text-center py-4 px-4 font-medium">
                  {orderDetails.totalPrice.toFixed(2)} đ
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
                User ID:
              </label>
              <p>{orderDetails.userId}</p>
            </div>
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

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status:
              </label>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mt-1">
                {getStatusText(orderDetails.status)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
