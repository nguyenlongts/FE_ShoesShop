import { useEffect, useState } from 'react';
import axios from 'axios';

const Sidebar = () => {
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get('http://localhost:8081/saleShoes/brands');
        if (response.data && response.data.result) {
          const activeBrands = response.data.result.filter(brand => brand.active);
          setBrands(activeBrands);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    const fetchSizes = async () => {
      try {
        const response = await axios.get('http://localhost:8081/saleShoes/sizes');
        if (response.data && response.data.result) {
          const activeSizes = response.data.result.filter(size => size.active);
          setSizes(activeSizes);
        }
      } catch (error) {
        console.error('Error fetching sizes:', error);
      }
    };

    const fetchColors = async () => {
      try {
        const response = await axios.get('http://localhost:8081/saleShoes/colors');
        if (response.data && response.data.result) {
          const activeColors = response.data.result.filter(color => color.active);
          setColors(activeColors);
        }
      } catch (error) {
        console.error('Error fetching colors:', error);
      }
    };

    fetchBrands();
    fetchSizes();
    fetchColors();
  }, []);

  const priceRanges = [
    {
      label: 'Dưới 1.000.000 đ',
      value: 'under-1m'
    },
    {
      label: '1.000.000 đ - 2.000.000 đ',
      value: '1m-2m'
    },
    {
      label: '2.000.000 đ - 4.000.000 đ',
      value: '2m-4m'
    },
    {
      label: '4.000.000 đ - 6.000.000 đ',
      value: '4m-6m'
    }
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
              <li key={size.id}>
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
      <li key={brand.id}>
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
    colors.map((color) => (
      <div 
        key={color.id}
        className="flex flex-col items-center gap-1"
      >
        <button
          className="w-8 h-8 rounded-full border border-gray-300 hover:border-black"
          style={{ backgroundColor: color.colorCode }}
          title={color.colorName}
        />
        <span className="text-xs text-gray-500">{color.name}</span>
      </div>
    ))
  ) : (
    <div key="no-colors">Không có màu sắc</div>
  )}
</div>

      </div>
    </aside>
  );
};

export default Sidebar;