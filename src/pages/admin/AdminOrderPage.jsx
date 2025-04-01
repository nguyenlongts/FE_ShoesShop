import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AdminOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("This week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Processing";
      case 2:
        return "Shipping";
      case 3:
        return "Completed";
      case 4:
        return "Cancelled";
      default:
        return "Unknown";
    }
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
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/orders?pageNum=1&pageSize=10`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        console.log(data);
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium">Order</h1>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 flex gap-4">
              <input
                type="text"
                placeholder="Tìm kiếm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option>This week</option>
                <option>Last week</option>
                <option>This month</option>
                <option>Last month</option>
              </select>
              <select
                defaultValue="Anytime"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option>Anytime</option>
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Evening</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : orders.length === 0 ? (
            <p>No orders found</p>
          ) : (
            <table className="w-full">
              <colgroup>
                <col className="w-auto" />
                <col className="w-1/4" />

                <col className="w-1/4" />
                <col className="w-1/4" />
              </colgroup>
              <thead>
                <tr className="border-b">
                  <th className="text-center py-3 whitespace-nowrap pr-4">
                    ID
                  </th>
                  <th className="text-center py-4">Amount</th>
                  <th className="text-center py-4">Status</th>
                  <th className="text-center py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId} className="border-b">
                    <td className="py-4 whitespace-nowrap pr-4 overflow-hidden text-ellipsis">
                      {order.orderId}
                    </td>

                    <td className="py-4 text-center">{order.totalPrice}</td>
                    <td className="py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </td>

                    <td className="py-4 text-center">
                      <Link
                        to={`/admin/orders/${order.orderId}`}
                        className="text-blue-600 hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderPage;
