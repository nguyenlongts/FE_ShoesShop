import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const PaymentReturn = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("processing");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        // Parse query parameters from URL
        const queryParams = new URLSearchParams(location.search);
        const vnpResponseCode = queryParams.get("vnp_ResponseCode");

        // Check if payment was successful (00 is success code from VNPay)
        if (vnpResponseCode === "00") {
          setStatus("success");

          // Get pending order from session storage
          const pendingOrderJson = sessionStorage.getItem("pendingOrder");
          if (!pendingOrderJson) {
            toast.error("Không tìm thấy thông tin đơn hàng");
            navigate("/cart");
            return;
          }

          const pendingOrder = JSON.parse(pendingOrderJson);

          // Create the order now that payment is confirmed
          const orderResponse = await axios.post(`${API_URL}/api/orders`, {
            userId: pendingOrder.userId,
            orderItems: pendingOrder.orderItems,
            shippingAddress: pendingOrder.shippingAddress,
            paymentMethod: pendingOrder.paymentMethod,
            paymentStatus: "PAID",
          });

          if (orderResponse.status === 200) {
            const orderId = orderResponse.data;

            // If there was a new address to save
            if (pendingOrder.newAddress) {
              const token = sessionStorage.getItem("token");
              const user = JSON.parse(sessionStorage.getItem("user"));

              await axios.post(
                `${API_URL}/api/address/add`,
                {
                  userId: user.userId,
                  fullAddress: pendingOrder.newAddress,
                  isDefault: pendingOrder.makeDefault,
                },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
            }

            // Clear the pending order from session storage
            sessionStorage.removeItem("pendingOrder");

            // Redirect to success page
            toast.success("Thanh toán thành công và đơn hàng đã được tạo!");
            navigate(`/order-success/${orderId}`);
          }
        } else {
          // Payment failed
          setStatus("failed");
          toast.error("Thanh toán không thành công");
          setTimeout(() => navigate("/cart"), 3000);
        }
      } catch (error) {
        console.error("Error processing payment return:", error);
        setStatus("error");
        toast.error("Có lỗi xảy ra khi xử lý kết quả thanh toán");
        setTimeout(() => navigate("/cart"), 3000);
      } finally {
        setLoading(false);
      }
    };

    processPaymentReturn();
  }, [location, navigate]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      {loading ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Đang xử lý thanh toán...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      ) : (
        <div>
          {status === "success" && (
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Thanh toán thành công!
            </h2>
          )}
          {status === "failed" && (
            <>
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Thanh toán không thành công
              </h2>
              <p className="mb-4">
                Bạn sẽ được chuyển về giỏ hàng sau 3 giây...
              </p>
            </>
          )}
          {status === "error" && (
            <>
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Đã xảy ra lỗi khi xử lý thanh toán
              </h2>
              <p className="mb-4">
                Bạn sẽ được chuyển về giỏ hàng sau 3 giây...
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentReturn;
