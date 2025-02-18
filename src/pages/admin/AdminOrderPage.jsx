import { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminOrderPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('This week');
  const [orders] = useState([
    {
      id: '4',
      customer: {
        name: 'Gray Response Super',
        image: '/product-1.jpg'
      },
      address: 'Thanh Xuân, Hà Nội, Việt Nam',
      amount: '$xx',
      status: 'Đang giao hàng',
    },
    {
      id: '3',
      customer: {
        name: 'Gray Response Super',
        image: '/product-1.jpg'
      },
      address: 'Thanh Xuân, Hà Nội, Việt Nam',
      amount: '$xx',
      status: 'Đang giao hàng',
    },
    {
      id: '2',
      customer: {
        name: 'Gray Response Super',
        image: '/product-1.jpg'
      },
      address: 'Thanh Xuân, Hà Nội, Việt Nam',
      amount: '$xx',
      status: 'Đang giao hàng',
    },
    {
      id: '1',
      customer: {
        name: 'Gray Response Super',
        image: '/product-1.jpg'
      },
      address: 'Thanh Xuân, Hà Nội, Việt Nam',
      amount: '$xx',
      status: 'Đang giao hàng',
    }
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium">Order</h1>
        <div className="text-sm text-gray-500">
          View, create, update, delete and manage
        </div>
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
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4">ID</th>
                <th className="text-left py-4">Customer / Products</th>
                <th className="text-left py-4">Address</th>
                <th className="text-left py-4">Amount</th>
                <th className="text-left py-4">Status</th>
                <th className="text-left py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="py-4">{order.id}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={order.customer.image} 
                        alt={order.customer.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <span>{order.customer.name}</span>
                    </div>
                  </td>
                  <td className="py-4">{order.address}</td>
                  <td className="py-4">{order.amount}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <Link 
                      to={`/admin/orders/${order.id}`} 
                      className="text-blue-600 hover:underline"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderPage; 