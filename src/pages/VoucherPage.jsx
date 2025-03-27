import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { vouchers } from "../data/vouchers";

const VoucherPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, used, unused
  const navigate = useNavigate();

  // Kiểm tra voucher sắp hết hạn (còn 7 ngày)
  const isExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  };
  const API_URL = import.meta.env.VITE_API_URL;
  // Copy mã voucher
  const copyVoucherCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Đã sao chép mã voucher!");
  };

  // Lọc voucher
  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch =
      voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all"
        ? true
        : filterStatus === "used"
        ? voucher.isUsed
        : !voucher.isUsed;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Vouchers</h1>

      {/* Search and Filter Controls */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm voucher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-lg flex-grow"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="all">Tất cả</option>
          <option value="unused">Chưa sử dụng</option>
          <option value="used">Đã sử dụng</option>
        </select>
      </div>

      {/* Voucher List */}
      <div className="grid gap-4">
        {filteredVouchers.map((voucher) => (
          <div
            key={voucher.id}
            className={`border rounded-lg p-4 flex justify-between items-center bg-white shadow-sm
                       transition-transform duration-300 hover:scale-[1.02] hover:shadow-md
                       ${voucher.isUsed ? "opacity-60" : ""}`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 text-red-600 font-bold px-4 py-2 rounded">
                  {voucher.discount}% OFF
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{voucher.code}</h3>
                    <button
                      onClick={() => copyVoucherCode(voucher.code)}
                      className="text-blue-600 text-sm hover:text-blue-800"
                    >
                      Copy mã
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm">{voucher.description}</p>
                  {isExpiringSoon(voucher.expiryDate) && (
                    <p className="text-orange-500 text-sm mt-1">
                      Sắp hết hạn! Còn{" "}
                      {Math.ceil(
                        (new Date(voucher.expiryDate) - new Date()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      ngày
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Hết hạn:{" "}
                {new Date(voucher.expiryDate).toLocaleDateString("vi-VN")}
              </p>
              <p className="text-sm text-gray-500">
                Đơn tối thiểu: {voucher.minSpend.toLocaleString("vi-VN")}đ
              </p>
              <span
                className={`text-sm ${
                  voucher.isUsed ? "text-red-500" : "text-green-500"
                }`}
              >
                {voucher.isUsed ? "Đã sử dụng" : "Chưa sử dụng"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoucherPage;
