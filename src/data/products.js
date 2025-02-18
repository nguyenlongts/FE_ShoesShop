export const products = {
  "1": {
    id: "1",
    name: "Nike V2K Run",
    category: "Shoes",
    price: 3519000,
    description: "Giày Nike V2K Run với thiết kế hiện đại và công nghệ đệm tiên tiến.",
    colors: ["Black/White", "Red/White", "Blue/White"],
    sizes: [39, 40, 41, 42, 43, 44],
    images: [
      "/images/products/v2k-run.jpg",
      "/images/products/v2k-run-2.jpg",
      "/images/products/v2k-run-3.jpg"
    ],
    brand: "Nike",
    isNew: true
  },
  "2": {
    id: "2",
    name: "Nike Air Force 1 07",
    category: "Men's Shoes",
    price: 2929000,
    description: "Nike Air Force 1 là biểu tượng của phong cách đường phố với thiết kế cổ điển và độ bền cao.",
    colors: ["White", "Black", "White/Red"],
    sizes: [38, 39, 40, 41, 42, 43],
    images: [
      "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/e6da41fa-1be4-4ce5-b89c-22be4f1f02d4/air-force-1-07-shoes-WrLlWX.png",
      "/products/airforce-1-2.jpg",
      "/products/airforce-1-3.jpg"
    ],
    brand: "Nike",
    isNew: false
  },
  "3": {
    id: "3",
    name: "Nike Zoom Vomero 5",
    category: "Women's Shoes",
    price: 4699000,
    description: "Nike Zoom Vomero 5 với công nghệ đệm Zoom Air mang lại cảm giác êm ái tối ưu.",
    colors: ["Blue", "Black", "White"],
    sizes: [36, 37, 38, 39, 40],
    images: [
      "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/fd17b420-b388-4c8a-aaaa-e086a6819b9f/zoom-vomero-5-shoes-qZG4RJ.png",
      "/products/vomero-5-2.jpg",
      "/products/vomero-5-3.jpg"
    ],
    brand: "Nike",
    isNew: true
  },
  "5": {
    id: "5",
    name: "Nike Dunk Low",
    category: "Women's Shoes",
    price: 2929000,
    description: "Nike Dunk Low - Phong cách retro kết hợp với sự thoải mái hiện đại.",
    detailDescription: [
      "Chất liệu da cao cấp",
      "Đế giữa bằng foam nhẹ",
      "Đế ngoài có độ bám tốt",
      "Thiết kế cổ thấp linh hoạt",
      "Lớp lót êm ái"
    ],
    colors: ["White/Black", "Pink", "Blue"],
    sizes: [36, 37, 38, 39, 40],
    images: [
      "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/w2ldynwtyuspv6r5rffj/dunk-low-shoes-N9Vjbn.png"
    ],
    brand: "Nike",
    isNew: false,
    reviews: [
      {
        id: 1,
        user: "Thu Hà",
        rating: 5,
        comment: "Giày đẹp, form vừa vặn",
        date: "2024-03-01"
      }
    ]
  },
  "6": {
    id: "6",
    name: "Nike Air Max 90",
    category: "Men's Shoes",
    price: 3519000,
    description: "Nike Air Max 90 - Biểu tượng của phong cách thể thao cổ điển.",
    detailDescription: [
      "Công nghệ Air Max nguyên bản",
      "Upper kết hợp nhiều chất liệu cao cấp",
      "Đế waffle truyền thống",
      "Đệm foam mềm mại",
      "Logo Swoosh đặc trưng"
    ],
    colors: ["White", "Black/Red", "Blue/White"],
    sizes: [40, 41, 42, 43, 44],
    images: [
      "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/irwu1ye6gg6ieebhgpbe/air-max-90-shoes-kRsBnD.png"
    ],
    brand: "Nike",
    isNew: true,
    reviews: [
      {
        id: 1,
        user: "Minh Tuấn",
        rating: 4,
        comment: "Giày đẹp, đúng form",
        date: "2024-02-28"
      }
    ]
  }
  // Thêm các sản phẩm khác tương tự...
};

// Chuyển đổi object thành array để dễ sử dụng trong HomePage
export const productsArray = Object.values(products); 