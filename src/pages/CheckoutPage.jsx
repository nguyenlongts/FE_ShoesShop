import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ORDER_STATUS } from "../data/orderStatus";
const API_URL = import.meta.env.VITE_API_URL;
const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [appliedVouchers, setAppliedVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const userId = JSON.parse(sessionStorage.getItem("user")).userId;
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: "",
    paymentMethod: "cod", // cod, banking, momo
    addressList: [],
    newAddress: "",
  });

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const total = subtotal + shippingFee;

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        if (!userId) {
          console.error("Lỗi: userId không hợp lệ");
          return;
        }
        const response = await axios.get(
          `${API_URL}/api/Cart/GetAllCartItems?userId=${userId}`
        );

        console.log(response.data); // Kiểm tra data trả về
        setCartItems(response.data);
        console.log(cartItems);
      } catch (error) {
        console.error("Lỗi khi tải giỏ hàng:", error);
      }
    };
    fetchCartItems();
    const savedVouchers = localStorage.getItem("appliedVouchers");
    if (savedVouchers) {
      setAppliedVouchers(JSON.parse(savedVouchers));
    }

    const loadUserInfo = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const user = JSON.parse(sessionStorage.getItem("user"));
        console.log(user.userId);
        if (!token || !user) {
          toast.error("Vui lòng đăng nhập để tiếp tục");
          navigate("/signin");
          return;
        }

        const userResponse = await axios.get(
          `${API_URL}/api/User/UserInfo/${user.userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(userResponse);
        if (userResponse.data) {
          const addressList = userResponse.data.shippingAddress || [];
          setFormData((prev) => ({
            ...prev,
            fullName: userResponse.data.fullName || "",
            email: userResponse.data.email || "",
            phone: userResponse.data.phone || "",
            address: addressList.length > 0 ? addressList[0] : "",
            addressList: addressList,
          }));
        }
      } catch (error) {
        console.error("Error loading user info:", error);
        toast.error("Không thể tải thông tin người dùng");
      }
    };

    loadUserInfo();
  }, [navigate]);

  useEffect(() => {
    const savedCheckoutItems = localStorage.getItem("checkoutItems");
    if (savedCheckoutItems) {
      setCheckoutItems(JSON.parse(savedCheckoutItems));
    } else {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCheckoutItems(JSON.parse(savedCart));
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "address" && value === "new") {
      setShowNewAddressForm(true);
    } else if (name === "address") {
      setShowNewAddressForm(false);
    }
  };

  const handleSavedAddressSelect = async (address) => {
    try {
      // Lấy chi tiết địa chỉ
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8081/saleShoes/addresses/${address.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.result) {
        const addressDetail = response.data.result;
        setFormData((prev) => ({
          ...prev,
          address: addressDetail.address,
          city: addressDetail.province,
          district: addressDetail.district,
          ward: addressDetail.ward,
        }));
        setSelectedProvince(addressDetail.provinceCode);
        setSelectedDistrict(addressDetail.districtCode);
      }
    } catch (error) {
      console.error("Error loading address details:", error);
      toast.error("Không thể tải thông tin địa chỉ");
    }
  };

  const saveNewAddress = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const addressData = {
        userId: user.userId,
        fullAddress: formData.newAddress,
        isDefault: savedAddresses.length === 0 || formData.makeDefault,
      };

      await axios.post("http://localhost:5258/api/address/add", addressData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200 || response.status === 201) {
        toast.success("Đã lưu địa chỉ mới");

        setFormData((prev) => ({
          ...prev,
          addressList: [...prev.addressList, formData.newAddress],
          address: formData.newAddress, // Set the newly created address as selected
        }));
        setShowNewAddressForm(false);
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Không thể lưu địa chỉ");
    }
  };

  const validateForm = () => {
    if (!formData.fullName) {
      toast.error("Vui lòng nhập họ tên");
      return false;
    }
    if (!formData.email) {
      toast.error("Vui lòng nhập email");
      return false;
    }
    if (!formData.phone) {
      toast.error("Vui lòng nhập số điện thoại");
      return false;
    }
    if (!formData.address && (!showNewAddressForm || !formData.newAddress)) {
      toast.error("Vui lòng chọn hoặc nhập địa chỉ giao hàng");
      return false;
    }

    // If new address form is shown, validate that address is entered
    if (showNewAddressForm && !formData.newAddress) {
      toast.error("Vui lòng nhập địa chỉ mới");
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email không hợp lệ");
      return false;
    }

    // Validate phone
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Số điện thoại không hợp lệ");
      return false;
    }

    return true;
  };

  const ConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-medium mb-4">Xác nhận đặt hàng</h3>
        <p className="text-gray-600 mb-6">
          Bạn có chắc chắn muốn đặt đơn hàng này?
          {formData.paymentMethod === "banking" && (
            <span className="block mt-2 text-sm">
              Bạn sẽ được chuyển đến trang thanh toán sau khi xác nhận.
            </span>
          )}
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={processOrder}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );

  const processOrder = async () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    try {
      setLoading(true);

      const orderItems = cartItems.map((item) => ({
        productDetailId: item.productDetailId,
        quantity: item.quantity,
        priceAtOrder: item.price,
      }));

      const shippingAddress = showNewAddressForm
        ? formData.newAddress
        : formData.address;

      const totalAmount = orderItems.reduce(
        (total, item) => total + item.quantity * item.priceAtOrder,
        0
      );

      if (formData.paymentMethod === "banking") {
        try {
          const tempOrderId = Date.now().toString();

          const paymentResponse = await axios.post(
            `${API_URL}/api/VNPay/create-payment`,
            {
              amount: totalAmount,
              orderDescription: `Thanh toán đơn hàng #${tempOrderId}`,
              orderType: "billpayment",
              bankCode: "",
            }
          );

          if (paymentResponse.data?.paymentUrl) {
            sessionStorage.setItem(
              "pendingOrder",
              JSON.stringify({
                userId: user.userId,
                orderItems: orderItems,
                shippingAddress: shippingAddress,
                paymentMethod: formData.paymentMethod,
                newAddress: showNewAddressForm ? formData.newAddress : null,
                makeDefault: formData.makeDefault,
              })
            );

            window.location.href = paymentResponse.data.paymentUrl;
            return;
          }
        } catch (error) {
          console.error("Error processing payment:", error);
          toast.error("Không thể xử lý thanh toán. Vui lòng thử lại sau.");
          setLoading(false);
          setShowConfirmModal(false);
          return;
        }
      } else {
        try {
          const orderResponse = await axios.post(`${API_URL}/api/orders`, {
            userId: user.userId,
            orderItems: orderItems,
            shippingAddress: shippingAddress,
          });

          if (orderResponse.status === 200) {
            const orderId = orderResponse.data;
            if (showNewAddressForm && formData.newAddress) {
              await saveNewAddress();
            }

            try {
              await axios.delete(
                `${API_URL}/api/Cart/ClearCart/${user.userId}`
              );
            } catch (clearCartError) {
              console.error("Error clearing cart:", clearCartError);
              // Continue with order success even if cart clearing fails
            }
            navigate(`/order/${orderId}`);
            toast.success("Đặt hàng thành công!");
          }
        } catch (orderError) {
          console.error("Error creating order:", orderError);
          toast.error(
            orderError.response?.data?.message || "Có lỗi xảy ra khi đặt hàng"
          );
        }
      }
    } catch (error) {
      console.error("Error in checkout process:", error);
      toast.error("Có lỗi xảy ra trong quá trình thanh toán");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (window.confirm("Bạn có muốn lưu địa chỉ này cho lần sau không?")) {
      await saveNewAddress();
    }

    setShowConfirmModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Thông tin giao hàng
              </h2>

              {/* Saved Addresses Section */}
              {savedAddresses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Địa chỉ đã lưu</h3>
                  <div className="space-y-2">
                    {savedAddresses.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => handleSavedAddressSelect(address)}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <p className="font-medium">{address.address}</p>
                        <p className="text-sm text-gray-600">
                          {address.ward}, {address.district}, {address.province}
                        </p>
                        {address.isDefault && (
                          <span className="text-xs text-green-600">
                            Mặc định
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Họ tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Địa chỉ</label>
                  <select
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">Chọn địa chỉ</option>
                    {formData.addressList &&
                      formData.addressList.map((address, index) => (
                        <option key={index} value={address}>
                          {address}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Ghi chú</label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">
                Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleInputChange}
                  />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="banking"
                    checked={formData.paymentMethod === "banking"}
                    onChange={handleInputChange}
                  />
                  <span>Chuyển khoản ngân hàng</span>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="momo"
                    checked={formData.paymentMethod === "momo"}
                    onChange={handleInputChange}
                  />
                  <span>Ví MoMo</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-full text-white
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black hover:bg-gray-800"
                }`}
            >
              {loading ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </form>
        </div>

        {/* Order Summary Section */}
        <div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Đơn hàng của bạn</h2>

            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div
                  key={`${item.productId}-${item.color}-${item.size}`}
                  className="flex gap-4"
                >
                  <img
                    src={`${API_URL}/Uploads/${item.imageUrl}`}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.color} | Size {item.size} | SL: {item.quantity}
                    </p>
                    <p className="font-medium">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span>{shippingFee.toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2 border-t">
                <span>Tổng cộng</span>
                <span>{total.toLocaleString("vi-VN")}₫</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Show confirmation modal */}
      {showConfirmModal && <ConfirmModal />}
    </div>
  );
};

export default CheckoutPage;
