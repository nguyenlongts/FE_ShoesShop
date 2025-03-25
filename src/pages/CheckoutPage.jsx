import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  getProvinces,
  getDistricts,
  getWards,
  calculateShippingFee,
} from "../services/addressApi";
import { ORDER_STATUS } from "../data/orderStatus";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [appliedVouchers, setAppliedVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
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
          `http://localhost:5258/api/Cart/GetAllCartItems?userId=${userId}`
        );

        console.log(response.data); // Kiểm tra data trả về
        setCartItems(response.data);
        console.log(cartItems);
      } catch (error) {
        console.error("Lỗi khi tải giỏ hàng:", error);
      }
    };
    fetchCartItems();
    // Load applied vouchers
    const savedVouchers = localStorage.getItem("appliedVouchers");
    if (savedVouchers) {
      setAppliedVouchers(JSON.parse(savedVouchers));
    }

    //Load user info and saved addresses
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

        // Lấy thông tin user
        const userResponse = await axios.get(
          `http://localhost:5258/api/User/UserInfo/${user.userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(userResponse);
        if (userResponse.data) {
          setFormData((prev) => ({
            ...prev,
            fullName: userResponse.data.fullName || "",
            email: userResponse.data.email || "",
            phone: userResponse.data.phone || "",
          }));

          // Lấy danh sách địa chỉ đã lưu
          const addressesResponse = await axios.get(
            `http://localhost:8081/saleShoes/addresses/user/${user.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (addressesResponse.data?.result) {
            setSavedAddresses(addressesResponse.data.result);
          }
        }
      } catch (error) {
        console.error("Error loading user info:", error);
        toast.error("Không thể tải thông tin người dùng");
      }
    };

    loadUserInfo();
  }, [navigate]);

  useEffect(() => {
    // Load tỉnh/thành phố
    const loadProvinces = async () => {
      try {
        const data = await getProvinces();
        setProvinces(data);
      } catch (error) {
        toast.error("Không thể tải danh sách tỉnh thành");
      }
    };
    loadProvinces();
  }, []);

  useEffect(() => {
    const loadDistricts = async () => {
      if (selectedProvince) {
        try {
          const data = await getDistricts(selectedProvince);
          setDistricts(data);
          setSelectedDistrict("");
          setWards([]);
          const fee = calculateShippingFee(selectedProvince);
          setShippingFee(fee);
        } catch (error) {
          toast.error("Không thể tải danh sách quận huyện");
        }
      }
    };
    loadDistricts();
  }, [selectedProvince]);

  // Load phường/xã khi chọn quận/huyện
  useEffect(() => {
    const loadWards = async () => {
      if (selectedDistrict) {
        try {
          const data = await getWards(selectedDistrict);
          setWards(data);
        } catch (error) {
          toast.error("Không thể tải danh sách phường xã");
        }
      }
    };
    loadWards();
  }, [selectedDistrict]);

  useEffect(() => {
    // Load checkout items
    const savedCheckoutItems = localStorage.getItem("checkoutItems");
    if (savedCheckoutItems) {
      setCheckoutItems(JSON.parse(savedCheckoutItems));
    } else {
      // Nếu không có checkoutItems, lấy từ cart
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
  };

  // Xử lý khi chọn địa chỉ đã lưu
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

  // Lưu địa chỉ mới
  const saveNewAddress = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const addressData = {
        userId: user.id,
        address: `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`,
        provinceCode: selectedProvince,
        districtCode: selectedDistrict,
        wardCode: formData.wardCode,
        isDefault: savedAddresses.length === 0,
      };

      await axios.post(
        "http://localhost:8081/saleShoes/addresses",
        addressData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Đã lưu địa chỉ mới");
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Không thể lưu địa chỉ");
    }
  };

  const validateForm = () => {
    // Kiểm tra các trường bắt buộc
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
    if (!formData.address) {
      toast.error("Vui lòng nhập địa chỉ");
      return false;
    }
    if (!selectedProvince) {
      toast.error("Vui lòng chọn Tỉnh/Thành");
      return false;
    }
    if (!selectedDistrict) {
      toast.error("Vui lòng chọn Quận/Huyện");
      return false;
    }
    if (!formData.ward) {
      toast.error("Vui lòng chọn Phường/Xã");
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

  // Confirmation Modal Component
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
      console.log(orderItems);
      // Tạo địa chỉ giao hàng
      const shippingAddress = `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`;

      const orderResponse = await axios.post(
        "http://localhost:5258/api/orders",
        {
          userId: user.userId,
          orderItems: orderItems,
          shippingAddress: shippingAddress,
        }
      );

      if ((orderResponse.status = 200)) {
        const orderId = orderResponse.data;
        if (localStorage.getItem("token")) {
          await axios.post(
            "http://localhost:8081/saleShoes/users/addresses",
            {
              address: shippingAddress,
              provinceCode: selectedProvince,
              districtCode: selectedDistrict,
              wardCode: formData.ward,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        }

        // Tính tổng tiền của đơn hàng
        const totalAmount = orderItems.reduce(
          (total, item) => total + item.quantity * item.priceAtOrder,
          0
        );

        // Nếu thanh toán bằng banking, chuyển đến trang thanh toán VNPAY
        if (formData.paymentMethod === "banking") {
          const paymentResponse = await axios.post(
            "http://localhost:5258/api/VNPay/create-payment",
            {
              amount: totalAmount,
              orderDescription: `Thanh toán đơn hàng #${orderId}`,
              orderType: "billpayment",
              bankCode: "",
            }
          );

          if (paymentResponse.data?.paymentUrl) {
            window.location.href = paymentResponse.data.paymentUrl;
          }
        }

        // Chuyển đến trang thành công nếu thanh toán COD hoặc nếu không có URL thanh toán
        navigate(`/order-success/${orderId}`);
        toast.success("Đặt hàng thành công!");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi đặt hàng"
      );
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  // Xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Hỏi người dùng có muốn lưu địa chỉ mới không
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
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1">Tỉnh/Thành</label>
                    <select
                      name="province"
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Chọn Tỉnh/Thành</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Quận/Huyện</label>
                    <select
                      name="district"
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      disabled={!selectedProvince}
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Phường/Xã</label>
                    <select
                      name="ward"
                      value={formData.ward}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      disabled={!selectedDistrict}
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    src={`http://localhost:5258/Uploads/${item.imageUrl}`}
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
