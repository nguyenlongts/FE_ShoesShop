import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [productVariants, setProductVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    images: [],
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const [reviews, setReviews] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedVariant) {
      setQuantity(1);
    }
  }, [selectedVariant]);
  useEffect(() => {
    if (selectedColor) {
      // Find the first variant with the selected color
      const firstVariantWithColor = productVariants.find(
        (variant) => variant.colorName === selectedColor
      );

      if (firstVariantWithColor) {
        setSelectedImage(
          `http://localhost:5258/Uploads/${firstVariantWithColor.imageUrl}`
        );
        const availableSizes = productVariants
          .filter((variant) => variant.colorName === selectedColor)
          .map((variant) => variant.sizeName);

        if (availableSizes.length > 0) {
          setSelectedSize(availableSizes[0]);
        }
      }
    }
  }, [selectedColor, productVariants]);
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // Fetch cả thông tin sản phẩm và variants
        const [productResponse, variantsResponse] = await Promise.all([
          axios.get(`${API_URL}/api/Product/GetByID?id=${id}`),
          axios.get(`${API_URL}/api/ProductDetail/${id}/details`),
          //axios.get(`http://localhost:5258/api/ProductDetail/${id}/details`),
        ]);

        // Xử lý thông tin chung của sản phẩm
        if (productResponse.data) {
          const productData = productResponse.data;
          setProduct({
            id: productData.productId,
            name: productData.name,
            description: productData.description,
            category: productData.categoryName,
            brand: productData.brandName,
            minPrice: productData.basePrice,
            imageUrl: productData.image,
          });
        }

        // Xử lý variants
        if (variantsResponse.data) {
          console.log(variantsResponse.data);
          const variants = variantsResponse.data;
          setProductVariants(variants);

          // Set màu và size mặc định từ variant đầu tiên
          if (variants.length > 0) {
            const uniqueColors = [...new Set(variants.map((v) => v.colorName))];
            const uniqueSizes = [...new Set(variants.map((v) => v.sizeName))];
            console.log(uniqueColors);
            if (uniqueColors.length > 0) setSelectedColor(uniqueColors[0]);
            if (uniqueSizes.length > 0) setSelectedSize(uniqueSizes[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        toast.error("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  useEffect(() => {
    if (selectedColor && selectedSize) {
      const variant = productVariants.find(
        (v) => v.colorName === selectedColor && v.sizeName === selectedSize
      );
      setSelectedVariant(variant);
    }
  }, [selectedColor, selectedSize, productVariants]);

  const getAvailableColors = () => {
    return [...new Set(productVariants.map((variant) => variant.colorName))];
  };

  const getAvailableSizes = () => {
    const sizesForColor = productVariants
      .filter((variant) => variant.colorName === selectedColor)
      .map((variant) => variant.sizeName);
    return [...new Set(sizesForColor)];
  };

  const getUserInfo = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found in sessionStorage");
      toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
      return null;
    }
    const user = sessionStorage.getItem("user");
    const userId = JSON.parse(user).userId;
    console.log(userId);
    try {
      const response = await axios.get(
        `${API_URL}/api/Cart/GetCartById/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      var cartId = response.data?.cartId;

      if (!cartId) {
        console.warn("No cartId found in user info");
      }
      return cartId || null;
    } catch (error) {
      console.error(
        "Error fetching user info:",
        error.response?.data || error.message
      );
      toast.error(cartId);
      return null;
    }
  };

  const addToCart = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));

      if (!user || !user.userId) {
        toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
        navigate("/signin", { state: { from: `/product/${id}` } });
        return;
      }
      const userId = user.userId;
      if (!selectedVariant) {
        toast.error("Vui lòng chọn màu sắc và kích thước");
        return;
      }

      setLoading(true);

      const cartId = await getUserInfo();
      if (!cartId) {
        toast.error("Không tìm thấy giỏ hàng của bạn. Vui lòng thử lại.");
        return;
      }

      const response = await axios.post(`${API_URL}/api/cart/addtocart`, {
        userId,
        productDetailId: selectedVariant.productDetailId,
        quantity,
      });
      if (response.data !== "Thêm thành công") {
        throw new Error("Lỗi từ server");
      }

      toast.success("Đã thêm vào giỏ hàng");
    } catch (error) {
      toast.error("Không thể thêm vào giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const buyNow = async () => {
    try {
      if (!selectedVariant) {
        toast.error("Vui lòng chọn màu sắc và kích thước");
        return;
      }

      setLoading(true);

      await addToCart();

      const orderItem = {
        productId: product.id,
        variantId: selectedVariant.id,
        name: product.name,
        price: selectedVariant.price,
        quantity: quantity,
        image: selectedVariant.image[0],
        color: selectedColor,
        size: selectedSize,
      };

      localStorage.setItem("checkoutItems", JSON.stringify([orderItem]));

      // Chuyển đến trang checkout
      navigate("/checkout");
    } catch (error) {
      console.error("Error processing buy now:", error);
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8081/saleShoes/products/${id}/reviews`
        );
        setReviews(response.data?.result || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    if (product) {
      fetchReviews();
    }
  }, [id, product]);

  useEffect(() => {
    const fetchSizesAndColors = async () => {
      try {
        const sizesResponse = await axios.get(
          `${API_URL}/api/Size/GetAll?pageNumber=1&pageSize=100`
        );
        if (sizesResponse.data.items) {
          setSizes(sizesResponse.data.items);
        }
        const colorsResponse = await axios.get(
          `${API_URL}/api/Color/GetAll?pageNumber=1&pageSize=100`
        );
        if (colorsResponse.data.items) {
          setColors(colorsResponse.data.items);
        }
      } catch (error) {
        console.error("Error fetching sizes and colors:", error);
      }
    };

    fetchSizesAndColors();
  }, []);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const getColorStyle = (color) => {
    const colorMap = {
      Black: "bg-black",
      White: "bg-white border-2",
      Red: "bg-red-600",
      Blue: "bg-blue-600",
      Pink: "bg-pink-400",
      "Black/White": "bg-gradient-to-r from-black to-white",
      "Red/White": "bg-gradient-to-r from-red-600 to-white",
      "Blue/White": "bg-gradient-to-r from-blue-600 to-white",
      "White/Red": "bg-gradient-to-r from-white to-red-600",
      "White/Black": "bg-gradient-to-r from-white to-black",
    };

    return colorMap[color] || "bg-gray-200";
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then((images) => {
      setReviewForm((prev) => ({
        ...prev,
        images: [...prev.images, ...images].slice(0, 3), // Giới hạn 3 ảnh
      }));
    });
  };

  const removeImage = (index) => {
    setReviewForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const submitReview = () => {
    if (!reviewForm.comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    const newReview = {
      id: Date.now(),
      ...reviewForm,
      user: "Khách hàng", // Sau này sẽ lấy từ user đăng nhập
      date: new Date().toISOString(),
      likes: 0,
      productId: id,
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews));

    // Reset form
    setReviewForm({
      rating: 5,
      comment: "",
      images: [],
    });
    setShowReviewForm(false);
    toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");
  };

  const likeReview = (reviewId) => {
    const updatedReviews = reviews.map((review) => {
      if (review.id === reviewId) {
        return { ...review, likes: review.likes + 1 };
      }
      return review;
    });
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews));
  };

  // Tính rating trung bình
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Không tìm thấy sản phẩm</div>
      </div>
    );
  }

  const reviewSection = (
    <div className="mt-12 border-t pt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Đánh giá sản phẩm</h2>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800"
        >
          Viết đánh giá
        </button>
      </div>

      {/* Rating Summary */}
      <div className="flex items-center gap-8 mb-8">
        <div className="text-center">
          <div className="text-4xl font-bold">{averageRating}</div>
          <div className="flex gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-5 h-5 ${
                  star <= averageRating ? "text-yellow-400" : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <div className="text-sm text-gray-500">{reviews.length} đánh giá</div>
        </div>

        {/* Rating Distribution */}
        <div className="flex-grow">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter(
              (review) => review.rating === star
            ).length;
            const percentage =
              reviews.length > 0 ? (count / reviews.length) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-2">
                <div className="text-sm w-8">{star} sao</div>
                <div className="flex-grow bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 rounded-full h-2"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-sm w-12">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 className="font-semibold mb-4">Viết đánh giá của bạn</h3>

          {/* Rating Input */}
          <div className="mb-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() =>
                    setReviewForm((prev) => ({ ...prev, rating: star }))
                  }
                  className={`w-8 h-8 ${
                    star <= reviewForm.rating
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Comment Input */}
          <textarea
            value={reviewForm.comment}
            onChange={(e) =>
              setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
            }
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            className="w-full p-4 border rounded-lg mb-4 min-h-[100px]"
          />

          {/* Image Upload */}
          <div className="mb-4">
            <div className="flex gap-4 mb-2">
              {reviewForm.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Review ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
              {reviewForm.images.length < 3 && (
                <label className="w-20 h-20 border-2 border-dashed rounded flex items-center justify-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </label>
              )}
            </div>
            <p className="text-sm text-gray-500">Tối đa 3 ảnh</p>
          </div>

          <button
            onClick={submitReview}
            className="w-full py-3 bg-black text-white rounded-full hover:bg-gray-800"
          >
            Gửi đánh giá
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6">
            <div className="flex justify-between mb-2">
              <div>
                <span className="font-medium">{review.user}</span>
                <div className="flex gap-1 my-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.date).toLocaleDateString("vi-VN")}
              </span>
            </div>

            <p className="text-gray-700 mb-4">{review.comment}</p>

            {/* Review Images */}
            {review.images.length > 0 && (
              <div className="flex gap-4 mb-4">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
              </div>
            )}

            {/* Like Button */}
            <button
              onClick={() => likeReview(review.id)}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
              <span>{review.likes}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {selectedVariant && selectedVariant.imageUrl ? (
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={`http://localhost:5258/Uploads/${selectedVariant.imageUrl}`}
                alt={product?.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            product?.imageUrl && (
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/path/to/default/image.jpg";
                  }}
                />
              </div>
            )
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product?.name}</h1>
            <p className="text-xl mt-2">
              {selectedVariant
                ? `${selectedVariant.price.toLocaleString("vi-VN")}đ`
                : product?.minPrice
                ? `${product.minPrice.toLocaleString("vi-VN")}đ`
                : "Liên hệ"}
            </p>
          </div>

          {/* Category and Brand */}
          <div className="space-y-2 text-sm text-gray-600">
            {product?.category && <p>Danh mục: {product.category}</p>}
            {product?.brand && <p>Thương hiệu: {product.brand}</p>}
          </div>

          {product?.description && (
            <div>
              <h2 className="font-semibold mb-2">Mô tả</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          {/* Colors */}
          <div>
            <h2 className="font-semibold mb-2">Màu sắc</h2>
            <div className="flex gap-4">
              {getAvailableColors().map((colorName) => (
                <button
                  key={colorName}
                  className={`px-4 py-2 border rounded-lg hover:border-black
                    ${
                      selectedColor === colorName
                        ? "border-black bg-black text-white"
                        : ""
                    }`}
                  onClick={() => setSelectedColor(colorName)}
                >
                  {colorName}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          {selectedColor && (
            <div>
              <h2 className="font-semibold mb-2">Size</h2>
              <div className="grid grid-cols-4 gap-2">
                {getAvailableSizes().map((size) => (
                  <button
                    key={size}
                    className={`px-4 py-2 border rounded-lg hover:border-black
                      ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : ""
                      }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h2 className="font-semibold mb-2">Số lượng</h2>
            <div className="flex items-center gap-4">
              <button
                className="px-3 py-1 border rounded-lg"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                className="px-3 py-1 border rounded-lg"
                onClick={() => {
                  if (
                    selectedVariant &&
                    quantity < selectedVariant.stockQuantity
                  ) {
                    setQuantity(quantity + 1);
                  } else {
                    toast.error("Đã đạt số lượng tối đa");
                  }
                }}
              >
                +
              </button>
            </div>
            {selectedVariant && (
              <p className="text-sm text-gray-500 mt-1">
                Còn {selectedVariant.stockQuantity} sản phẩm
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={addToCart}
              className={`flex-1 py-3 border-2 border-black text-black rounded-full 
                ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-100"
                } 
                transition-colors`}
              disabled={loading || !selectedVariant}
            >
              {loading ? "Đang xử lý..." : "Thêm vào giỏ"}
            </button>
            <button
              onClick={buyNow}
              className={`flex-1 py-3 bg-black text-white rounded-full 
                ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-800"
                } 
                transition-colors`}
              disabled={loading || !selectedVariant}
            >
              {loading ? "Đang xử lý..." : "Mua ngay"}
            </button>
          </div>
        </div>
      </div>

      {/* Giữ nguyên phần review section */}
      {reviewSection}
    </div>
  );
};

export default ProductDetail;
