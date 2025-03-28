import { useEffect, useState } from "react";
import axios from "axios";

const Sidebar = ({ onFilterSubmit }) => {
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedFilters, setSelectedFilters] = useState({
    brands: [],
    sizes: [],
    colors: [],
    priceRange: "",
  });

  const colorMap = {
    Đỏ: "#FF0000",
    "Xanh dương": "#0000FF",
    "Xanh lá": "#008000",
    Vàng: "#FFFF00",
    Cam: "#FFA500",
    Tím: "#800080",
    Hồng: "#FFC0CB",
    Trắng: "#FFFFFF",
    Đen: "#000000",
    Xám: "#808080",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandRes, sizeRes, colorRes] = await Promise.all([
          axios.get(
            "http://localhost:5258/api/Brand/GetAll?pageNumber=1&pageSize=10"
          ),
          axios.get(
            "http://localhost:5258/api/Size/GetAll?pageNumber=1&pageSize=10"
          ),
          axios.get(
            "http://localhost:5258/api/Color/GetAll?pageNumber=1&pageSize=10"
          ),
        ]);

        setBrands(brandRes.data.items.filter((b) => b.isActive));
        setSizes(sizeRes.data.items.filter((s) => s.isActive));
        setColors(colorRes.data.items.filter((c) => c.isActive));
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (type, value) => {
    setSelectedFilters((prevFilters) => {
      if (type === "priceRange") {
        return { ...prevFilters, priceRange: value };
      }

      const currentSelectedItems = prevFilters[type];
      const isCurrentlySelected = currentSelectedItems.includes(value);

      // If already selected, remove it; if not selected, add it
      const updatedItems = isCurrentlySelected
        ? currentSelectedItems.filter((item) => item !== value)
        : [...currentSelectedItems, value];

      return {
        ...prevFilters,
        [type]: updatedItems,
      };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/Product/Filter`, {
        brands: selectedFilters.brands,
        sizes: selectedFilters.sizes,
        colors: selectedFilters.colors,
        priceRange: selectedFilters.priceRange,
        page: 1,
        pageSize: 10,
      });
      if (typeof onFilterSubmit === "function") {
        onFilterSubmit(response.data.products); // Gửi kết quả lên `HomePage`
      } else {
        console.error("onFilterSubmit is not a function");
      }
    } catch (error) {
      console.error("Lỗi khi lọc sản phẩm:", error);
    }
    setLoading(false);
  };

  const priceRanges = [
    { label: "Dưới 1.000.000 đ", value: "under-1m" },
    { label: "1.000.000 đ - 2.000.000 đ", value: "1m-2m" },
    { label: "2.000.000 đ - 4.000.000 đ", value: "2m-4m" },
    { label: "4.000.000 đ - 6.000.000 đ", value: "4m-6m" },
  ];

  return (
    <aside className="w-64 pr-8">
      {/* Price Range */}
      <div className="mb-8">
        <h3 className="font-medium mb-4">Khoảng giá</h3>
        <ul className="space-y-2">
          {priceRanges.map((range) => (
            <li key={range.value}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="priceRange"
                  className="rounded border-gray-300"
                  onChange={() => handleFilterChange("priceRange", range.value)}
                  checked={selectedFilters.priceRange === range.value}
                />
                <span className="text-sm">{range.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Size */}
      <div className="mb-8">
        <h3 className="font-medium mb-4">Kích thước</h3>
        <ul className="space-y-2">
          {sizes.map((size) => (
            <li key={size.sizeId}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  onChange={() => handleFilterChange("sizes", size.sizeId)}
                  checked={selectedFilters.sizes.includes(size.sizeId)}
                />
                <span className="text-sm">{size.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Brand */}
      <div className="mb-8">
        <h3 className="font-medium mb-4">Thương hiệu</h3>
        <ul className="space-y-2">
          {brands.map((brand) => (
            <li key={brand.brandID}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  onChange={() => handleFilterChange("brands", brand.brandID)}
                  checked={selectedFilters.brands.includes(brand.brandID)}
                />
                <span className="text-sm">{brand.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Colors */}
      <div className="mb-8">
        <h3 className="font-medium mb-4">Màu sắc</h3>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => {
            const bgColor = colorMap[color.name] || "#ccc";
            return (
              <div key={color.colorId} className="flex flex-col items-center">
                <button
                  className={`w-8 h-8 rounded-full border ${
                    selectedFilters.colors.includes(color.colorId)
                      ? "border-black"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: bgColor }}
                  onClick={() => handleFilterChange("colors", color.colorId)}
                />
                <span className="text-xs text-gray-500">{color.name}</span>
              </div>
            );
          })}
        </div>
      </div>
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Đang tải..." : "Lọc sản phẩm"}
      </button>
    </aside>
  );
};

export default Sidebar;
