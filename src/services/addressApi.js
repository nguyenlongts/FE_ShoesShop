const API_URL = 'https://provinces.open-api.vn/api';

export const getProvinces = async () => {
  const response = await fetch(`${API_URL}/p`);
  return response.json();
};

export const getDistricts = async (provinceCode) => {
  const response = await fetch(`${API_URL}/p/${provinceCode}?depth=2`);
  const data = await response.json();
  return data.districts;
};

export const getWards = async (districtCode) => {
  const response = await fetch(`${API_URL}/d/${districtCode}?depth=2`);
  const data = await response.json();
  return data.wards;
};

// Tính phí ship dựa trên khu vực
export const calculateShippingFee = (provinceCode) => {
  // Phí ship cơ bản
  const baseFee = 30000;

  // Các tỉnh/thành phố có phí ship cao hơn
  const highFeeProvinces = ['01', '79', '48']; // Hà Nội, HCM, Đà Nẵng
  const mediumFeeProvinces = ['31', '92', '33']; // Hải Phòng, Cần Thơ, Hưng Yên

  if (highFeeProvinces.includes(provinceCode)) {
    return baseFee;
  } else if (mediumFeeProvinces.includes(provinceCode)) {
    return baseFee + 10000;
  } else {
    return baseFee + 20000;
  }
}; 