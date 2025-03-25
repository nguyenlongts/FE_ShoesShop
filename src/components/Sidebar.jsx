import { useEffect, useState } from "react";
import axios from "axios";

const Sidebar = () => {
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
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

  <div className="mb-8">
    <h3 className="font-medium mb-4">Colors</h3>
    <p className="text-sm text-gray-500 mb-2">Màu sắc</p>
    <div className="grid grid-cols-4 gap-2">
      {colors.length > 0 ? (
        colors.map((color) => {
          const bgColor = colorMap[color.colorName] || "#ccc"; // Nếu không có màu, mặc định xám
          return (
            <div
              key={color.colorId}
              className="flex flex-col items-center gap-1"
            >
              <button
                className="w-8 h-8 rounded-full border border-gray-300 hover:border-black focus:ring-2 focus:ring-black transition"
                style={{ backgroundColor: bgColor }}
                title={color.colorName}
                aria-label={color.name || "Màu không xác định"}
              />
              <span className="text-xs text-gray-500">{color.colorName}</span>
            </div>
          );
        })
      ) : (
        <div className="col-span-4 text-center text-gray-500">
          Không có màu sắc
        </div>
      )}
    </div>
  </div>;

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5258/api/Brand/GetAll?pageNumber=1&pageSize=5"
        );

        if (response.data) {
          const activeBrands = response.data.items.filter(
            (brand) => brand.isActive === true
          );
          setBrands(activeBrands);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    const fetchSizes = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5258/api/Size/GetAll?pageNumber=1&pageSize=5"
        );
        if (response.data) {
          const activeSizes = response.data.items.filter(
            (size) => size.isActive === true
          );
          setSizes(activeSizes);
        }
      } catch (error) {
        console.error("Error fetching sizes:", error);
      }
    };

    const fetchColors = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5258/api/Color/GetAll?pageNumber=1&pageSize=5"
        );
        if (response.data) {
          const activeColors = response.data.items.filter(
            (color) => color.isActive === true
          );
          setColors(activeColors);
        }
      } catch (error) {
        console.error("Error fetching colors:", error);
      }
    };

    fetchBrands();
    fetchSizes();
    fetchColors();
  }, []);

  const priceRanges = [
    {
      label: "Dưới 1.000.000 đ",
      value: "under-1m",
    },
    {
      label: "1.000.000 đ - 2.000.000 đ",
      value: "1m-2m",
    },
    {
      label: "2.000.000 đ - 4.000.000 đ",
      value: "2m-4m",
    },
    {
      label: "4.000.000 đ - 6.000.000 đ",
      value: "4m-6m",
    },
  ];

  return (
    <aside className="w-64 pr-8">
      {/* Price Range */}
      <div className="mb-8">
        <h3 className="font-medium mb-4">Price range</h3>
        <p className="text-sm text-gray-500 mb-2">Khoảng giá</p>
        <ul className="space-y-2">
          {priceRanges.map((range) => (
            <li key={range.value}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm">{range.label}</span>
              </label>
            </li>
          ))}
        </ul>
        <button className="text-sm text-gray-500 mt-2 hover:text-black">
          + Show More
        </button>
      </div>

      {/* Size */}
      <div className="mb-8">
        <h3 className="font-medium mb-4">Size</h3>
        <p className="text-sm text-gray-500 mb-2">Kích thước</p>
        <ul className="space-y-2">
          {sizes.length > 0 ? (
            sizes.map((size) => (
              <li key={size.sizeId}>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm">{size.name}</span>
                </label>
              </li>
            ))
          ) : (
            <li key="no-sizes">Không có kích thước</li>
          )}
        </ul>

        <button className="text-sm text-gray-500 mt-2 hover:text-black">
          + Show More
        </button>
      </div>

      {/* Brand */}
      <div className="mb-8">
        <h3 className="font-medium mb-4">Brand</h3>
        <p className="text-sm text-gray-500 mb-2">Thương hiệu</p>
        <ul className="space-y-2">
          {brands.length > 0 ? (
            brands.map((brand) => (
              <li key={brand.brandID}>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm">{brand.name}</span>
                </label>
              </li>
            ))
          ) : (
            <li key="no-brands">Không có thương hiệu</li>
          )}
        </ul>
      </div>

      {/* Colors */}
      <div className="mb-8">
        <h3 className="font-medium mb-4">Colors</h3>
        <p className="text-sm text-gray-500 mb-2">Màu sắc</p>
        <div className="grid grid-cols-4 gap-2">
          {colors.length > 0 ? (
            colors.map((color) => {
              const bgColor = colorMap[color.name] || "#ccc"; // Nếu không có màu, mặc định xám
              return (
                <div
                  key={color.colorId}
                  className="flex flex-col items-center gap-1"
                >
                  <button
                    className="w-8 h-8 rounded-full border border-gray-300 hover:border-black focus:ring-2 focus:ring-black transition"
                    style={{ backgroundColor: bgColor }}
                    title={color.name}
                    aria-label={color.name || "Màu không xác định"}
                  />
                  <span className="text-xs text-gray-500">
                    {color.colorName}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="col-span-4 text-center text-gray-500">
              Không có màu sắc
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
