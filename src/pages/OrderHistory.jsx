import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import OrderTimeline from '../components/OrderTimeline';
import { getOrderTimeline } from '../data/orderStatus';

const OrderHistory = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  // Mock data - sau này sẽ được thay thế bằng dữ liệu thật từ API
  const orders = [
    {
      id: "ORD001",
      date: "2024-03-15",
      total: 2500000,
      status: "pending",
      items: [
        {
          id: 1,
          productId: "1",
          name: "Nike Air Max 270",
          color: "Black/White",
          size: "42",
          price: 2500000,
          quantity: 1,
          image: "/products/airmax-270.jpg"
        }
      ],
      timeline: [
        {
          status: 'pending',
          time: null,
          isCompleted: false
        },
        {
          status: 'confirmed',
          time: null,
          isCompleted: false
        },
        {
          status: 'shipping',
          time: null,
          isCompleted: false
        },
        {
          status: 'delivered',
          time: null,
          isCompleted: false
        }
      ]
    },
    {
      id: "ORD002",
      date: "2024-03-10",
      total: 4800000,
      status: "completed",
      items: [
        {
          id: 2,
          productId: "2",
          name: "Nike Air Force 1",
          color: "White",
          size: "41",
          price: 2300000,
          quantity: 1,
          image: "/products/airforce-1.jpg"
        },
        {
          id: 3,
          productId: "3",
          name: "Nike Zoom Fly 5",
          color: "Blue",
          size: "42",
          price: 2500000,
          quantity: 1,
          image: "/products/zoom-fly-5.jpg"
        }
      ],
      timeline: [
        {
          status: 'pending',
          time: null,
          isCompleted: false
        },
        {
          status: 'confirmed',
          time: null,
          isCompleted: false
        },
        {
          status: 'shipping',
          time: null,
          isCompleted: false
        },
        {
          status: 'delivered',
          time: null,
          isCompleted: false
        }
      ]
    }
  ];

  // Hàm thêm vào giỏ hàng
  const addToCart = (item) => {
    // Tạo object sản phẩm để thêm vào giỏ hàng
    const cartItem = {
      productId: item.productId,
      name: item.name,
      price: item.price,
      color: item.color,
      size: item.size,
      quantity: 1,
      image: item.image
    };

    // Lấy giỏ hàng hiện tại từ localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingItemIndex = currentCart.findIndex(
      cartItem => cartItem.productId === item.productId && 
                 cartItem.color === item.color && 
                 cartItem.size === item.size
    );

    if (existingItemIndex !== -1) {
      // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng
      currentCart[existingItemIndex].quantity += 1;
    } else {
      // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
      currentCart.push(cartItem);
    }

    // Lưu giỏ hàng mới vào localStorage
    localStorage.setItem('cart', JSON.stringify(currentCart));
    
    // Hiển thị thông báo
    toast.success('Đã thêm sản phẩm vào giỏ hàng!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Đang xử lý';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' ? true : order.status === filterStatus
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h1>

      {/* Filter Controls */}
      <div className="mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="all">Tất cả đơn hàng</option>
          <option value="pending">Đang xử lý</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <div 
            key={order.id}
            className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold">Đơn hàng #{order.id}</h2>
                <p className="text-gray-600">
                  Ngày đặt: {new Date(order.date).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                <p className="mt-2 font-semibold">
                  Tổng tiền: {order.total.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 border-t pt-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded cursor-pointer"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  />
                  <div className="flex-grow">
                    <h3 
                      className="font-medium hover:text-blue-600 cursor-pointer"
                      onClick={() => navigate(`/product/${item.productId}`)}
                    >
                      {item.name}
                    </h3>
                    <p className="text-gray-600">
                      Màu: {item.color} | Size: {item.size}
                    </p>
                    <p className="text-gray-600">
                      Số lượng: {item.quantity}
                    </p>
                    <p className="font-medium">
                      {item.price.toLocaleString('vi-VN')}đ
                    </p>
                    <button
                      onClick={() => addToCart(item)}
                      className="mt-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm"
                    >
                      Mua lại
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-4">
              <Link
                to={`/order/${order.id}`}
                className="text-blue-600 hover:text-blue-800"
              >
                Xem chi tiết
              </Link>
              {order.status === 'pending' && (
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => {
                    // Thêm logic hủy đơn hàng ở đây
                    alert('Chức năng hủy đơn hàng sẽ được thêm sau');
                  }}
                >
                  Hủy đơn hàng
                </button>
              )}
            </div>

            <div className="mt-4">
              <OrderTimeline 
                status={order.status || 'pending'}
                timeline={order.timeline || []}
              />
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy đơn hàng nào
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory; 