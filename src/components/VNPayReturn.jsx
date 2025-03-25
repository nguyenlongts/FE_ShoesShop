import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const VnPayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
      const orderId = searchParams.get("orderId");

      if (vnp_ResponseCode === "00") {
        toast.success("Thanh toán thành công!");
        navigate(`/order-success/${orderId}`);
      } else {
        toast.error("Thanh toán thất bại hoặc bị hủy!");
        navigate("/checkout");
      }
    };

    checkPaymentStatus();
  }, [searchParams, navigate]);

  return <div>Đang xử lý thanh toán...</div>;
};

export default VnPayReturn;
