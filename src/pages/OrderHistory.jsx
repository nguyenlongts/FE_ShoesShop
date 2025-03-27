import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import OrderTimeline from "../components/OrderTimeline";
import axios from "axios";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const orderStatusMap = {
    0: "Chờ xác nhận",
    1: "Đang xử lý",
    2: "Đang vận chuyển",
    3: "Hoàn thành",
    4: "Đã hủy",
  };
  const fetchOrders = async () => {
    try {
      const user = sessionStorage.getItem("user");
      const userId = JSON.parse(user).userId;
      console.log(userId);
      const response = await axios.get(
        `http://localhost:5258/api/orders/user/${userId}?pageNum=${currentPage}&pageSize=${pageSize}`
      );
      setOrders(response.data.items);
      setTotalPages(response.data.totalPages);
      console.log(orders);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filterStatus]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const filteredOrders = orders.filter((order) =>
    filterStatus === "all" ? true : order.status === parseInt(filterStatus)
  );
  console.log(filteredOrders);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h1>

      <div className="mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="all">Tất cả đơn hàng</option>
          <option value="0">Chờ xử lý</option>
          <option value="1">Đang xử lý</option>
          <option value="2">Đang vận chuyển</option>
          <option value="3">Hoàn thành</option>
          <option value="4">Đã hủy</option>
        </select>
      </div>

      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <Link
            to={`/order/${order.orderId}`}
            key={order.orderId}
            className="block"
          >
            <div
              key={order.orderId}
              className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Đơn hàng #{order.orderId}
                  </h2>
                  <p className="text-gray-600">
                    Ngày đặt:{" "}
                    {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {orderStatusMap[Number(order.status)]}
                  </span>
                  <p className="mt-2 font-semibold">
                    Tổng tiền: {order.totalPrice}đ
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <OrderTimeline
                  status={order.status}
                  timeline={order.timeline || []}
                />
              </div>
            </div>
          </Link>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy đơn hàng nào
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Trang trước
        </button>
        <span className="px-4 py-2">
          Trang {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
};

export default OrderHistory;
