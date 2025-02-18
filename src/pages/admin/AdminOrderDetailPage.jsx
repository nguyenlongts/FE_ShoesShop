import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminOrderDetailPage = () => {
  const navigate = useNavigate();
  const [orderDetails] = useState({
    products: [
      {
        id: 1,
        name: 'Glay Response Super',
        image: '/product-1.jpg',
        quantity: 4,
        unitPrice: '$xx',
        total: '$4xx'
      }
    ],
    customerInfo: {
      fullName: 'Pham Nguyen',
      email: 'phamnguyen@gmail.com',
      phone: '0909090xxx',
      companyName: 'Nguyen Nguyen',
      streetAddress: 'Mon City, Thanh Xuan',
      townCity: 'Ha Noi',
      country: 'Viet Nam',
      status: 'RECEIVE ORDER'
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium">PRODUCT LIST</h1>
        <button 
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          onClick={() => navigate('/admin/orders')}
        >
          Back
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="bg-pink-50">
                <th className="text-left py-3 px-4">Products</th>
                <th className="text-center py-3 px-4">Quantity</th>
                <th className="text-center py-3 px-4">Unit price</th>
                <th className="text-center py-3 px-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.products.map((product) => (
                <tr key={product.id}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-16 h-16 object-cover"
                      />
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">{product.quantity}</td>
                  <td className="text-center py-4 px-4">{product.unitPrice}</td>
                  <td className="text-center py-4 px-4">{product.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-medium mb-4">Order Infor</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full name:</label>
                <p>{orderDetails.customerInfo.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email:</label>
                <p>{orderDetails.customerInfo.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone:</label>
              <p>{orderDetails.customerInfo.phone}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name:</label>
              <p>{orderDetails.customerInfo.companyName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Street Address:</label>
              <p>{orderDetails.customerInfo.streetAddress}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Town/City:</label>
              <p>{orderDetails.customerInfo.townCity}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Country:</label>
              <p>{orderDetails.customerInfo.country}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status:</label>
              <span className="inline-block px-3 py-1 bg-gray-700 text-white rounded-md text-sm mt-1">
                {orderDetails.customerInfo.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage; 