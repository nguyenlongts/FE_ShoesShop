import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productsArray } from '../data/products'; // Import products data
import { vouchers } from '../data/vouchers';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVouchers, setAppliedVouchers] = useState([]);
  const [voucherError, setVoucherError] = useState('');
  
  // Tính tổng tiền trước khi áp dụng voucher
  const subtotal = cartItems.reduce((total, item) => 
    total + (item.price * item.quantity), 0
  );

  // Tính tổng giảm giá từ voucher
  const totalDiscount = appliedVouchers.reduce((total, voucher) => 
    total + voucher.discount, 0
  );

  // Tính tổng tiền cuối cùng
  const total = Math.max(0, subtotal - totalDiscount);

  useEffect(() => {
    // Load cart items from localStorage
    const savedCart = localStorage.getItem('cart');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (savedCart && user) {
      // Lọc chỉ lấy các item của user hiện tại
      const allCartItems = JSON.parse(savedCart);
      const userCartItems = allCartItems.filter(item => item.userId === user.id);
      setCartItems(userCartItems);
    }
  }, []);

  // Cập nhật số lượng sản phẩm
  const updateQuantity = (itemIndex, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = [...cartItems];
    updatedCart[itemIndex].quantity = newQuantity;
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeItem = (itemIndex) => {
    const updatedCart = cartItems.filter((_, index) => index !== itemIndex);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleApplyVoucher = () => {
    setVoucherError('');

    if (appliedVouchers.some(v => v.code === voucherCode)) {
      setVoucherError('Voucher đã được sử dụng');
      return;
    }

    const voucher = vouchers.find(v => v.code === voucherCode);
    if (!voucher) {
      setVoucherError('Voucher không hợp lệ');
      return;
    }

    // Kiểm tra điều kiện áp dụng voucher
    if (voucher.minSpend > 0 && subtotal < voucher.minSpend) {
      setVoucherError(`Đơn hàng tối thiểu ${voucher.minSpend.toLocaleString('vi-VN')}₫`);
      return;
    }

    // Kiểm tra hạn sử dụng
    if (new Date(voucher.expiryDate) < new Date()) {
      setVoucherError('Voucher đã hết hạn');
      return;
    }

    setAppliedVouchers([...appliedVouchers, voucher]);
    setVoucherCode('');
  };

  const removeVoucher = (voucherToRemove) => {
    setAppliedVouchers(appliedVouchers.filter(v => v.code !== voucherToRemove.code));
  };

  // Lấy ngẫu nhiên 4 sản phẩm để hiển thị
  const getRandomProducts = (count) => {
    const shuffled = [...productsArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const [recommendedProducts] = useState(getRandomProducts(4));

  // Thêm hàm xử lý thanh toán
  const handleCheckout = () => {
    // Kiểm tra đăng nhập
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      navigate('/signin', { state: { from: '/cart' } }); // Lưu trang trước khi chuyển đến đăng nhập
      return;
    }

    // Kiểm tra giỏ hàng có sản phẩm không
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    // Lưu thông tin giỏ hàng vào localStorage để checkout
    localStorage.setItem('checkoutItems', JSON.stringify(cartItems));
    navigate('/checkout');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Announcement Banner */}
      <div className="bg-gray-100 p-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">FREE DELIVERY</span>
          <span>Applies to orders of 5,000,000₫ or more.</span>
          <Link to="/details" className="underline">View details.</Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        {/* Cart Section */}
        <div className="flex-1">
          <h1 className="text-2xl font-medium mb-6">Giỏ hàng</h1>
          
          {cartItems.length === 0 ? (
            <div className="mb-6">
              <p className="text-lg">Giỏ hàng của bạn đang trống.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item, index) => (
                <div key={`${item.productId}-${item.color}-${item.size}`} 
                     className="flex gap-4 border-b pb-6">
                  <Link to={`/product/${item.productId}`} className="shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                  </Link>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <Link to={`/product/${item.productId}`} 
                              className="font-medium hover:underline">
                          {item.name}
                        </Link>
                        <p className="text-gray-600">
                          Màu: {item.color} | Size: {item.size}
                        </p>
                      </div>
                      <p className="font-medium">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-gray-500 hover:text-black"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!localStorage.getItem('user') && (
            <div className="mt-12">
              <h2 className="text-2xl font-medium mb-4">Favourites</h2>
              <div>
                <p>Want to view your favourites?</p>
                <div className="flex gap-2 mt-2">
                  <Link to="/join" className="underline">Join us</Link>
                  <span>or</span>
                  <Link to="/signin" className="underline">Sign in</Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className="lg:w-96">
          <div className="bg-white p-6">
            <h2 className="text-2xl font-medium mb-6">Tổng đơn hàng</h2>
            
            {/* Subtotal */}
            <div className="flex justify-between mb-4">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString('vi-VN')}₫</span>
            </div>

            {/* Delivery & Handling */}
            <div className="flex justify-between mb-4">
              <span>Phí vận chuyển</span>
              <span>Miễn phí</span>
            </div>

            {/* Voucher Section */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Voucher Code"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                />
                <button
                  onClick={handleApplyVoucher}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-300"
                  disabled={!voucherCode}
                >
                  Apply
                </button>
              </div>
              {voucherError && (
                <p className="text-red-500 text-sm mt-1">{voucherError}</p>
              )}
            </div>

            {/* Applied Vouchers */}
            {appliedVouchers.length > 0 && (
              <div className="mb-4 space-y-2">
                <h3 className="font-medium text-sm">Applied Vouchers:</h3>
                {appliedVouchers.map((voucher) => (
                  <div key={voucher.code} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <div>
                      <p className="font-medium text-sm">{voucher.code}</p>
                      <p className="text-xs text-gray-600">{voucher.description}</p>
                    </div>
                    <button
                      onClick={() => removeVoucher(voucher)}
                      className="text-gray-500 hover:text-black"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Voucher Discounts */}
            {appliedVouchers.map((voucher) => (
              <div key={voucher.code} className="flex justify-between mb-2 text-sm">
                <span>Discount ({voucher.code})</span>
                <span className="text-green-600">-{voucher.discount.toLocaleString()}₫</span>
              </div>
            ))}

            {/* Total */}
            <div className="flex justify-between py-4 border-t border-gray-200">
              <span className="font-medium">Tổng tiền</span>
              <span className="font-medium">{total.toLocaleString('vi-VN')}₫</span>
            </div>

            {/* Checkout Buttons */}
            <div className="space-y-4 mt-6">
              <button 
                onClick={handleCheckout}
                className={`w-full py-4 rounded-full ${
                  cartItems.length > 0 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                disabled={cartItems.length === 0}
              >
                {cartItems.length > 0 ? `Thanh toán (${total.toLocaleString('vi-VN')}₫)` : 'Giỏ hàng trống'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* You Might Also Like Section */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl">Có thể bạn cũng thích</h2>
          <div className="flex gap-2">
            <button className="p-2 rounded-full border hover:border-black">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button className="p-2 rounded-full border hover:border-black">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {recommendedProducts.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`} className="group">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-4">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-gray-600">{product.category}</p>
                <p className="mt-1">{product.price.toLocaleString('vi-VN')}₫</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CartPage; 