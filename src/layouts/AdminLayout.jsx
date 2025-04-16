import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useState, useEffect, useLayoutEffect } from "react";
import axios from "axios";
const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    checkAuth();
  }, [location.pathname]);

  const checkAuth = () => {
    setIsLoading(true);
    const token = sessionStorage.getItem("accessToken");

    if (!token) {
      navigate("/signin", { replace: true });
      setIsLoading(false);
      return;
    }

    try {
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/signin", { replace: true });
    }
    setIsLoading(false);
  };
  //   const token = localStorage.getItem("token");
  //   const userStr = localStorage.getItem("user");

  //   if (!token || !userStr) {
  //     navigate("/signin", { replace: true }); // Sử dụng replace để ngăn quay lại bằng nút back
  //     return;
  //   }
  //   try {
  //     const userData = JSON.parse(userStr);
  //     // Kiểm tra thêm tính hợp lệ của user data nếu cần
  //     if (!userData || !userData.id) {
  //       throw new Error("Invalid user data");
  //     }
  //     setUser(userData);
  //     setIsAuthenticated(true);
  //   } catch (error) {
  //     console.error("Error parsing user data:", error);
  //     localStorage.removeItem("token");
  //     localStorage.removeItem("user");
  //     navigate("/signin", { replace: true });
  //   }
  // }, [navigate, location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5258/logout");
    } catch (error) {
      console.error("Lỗi khi logout:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Đăng xuất thành công");
    navigate("/signin", { replace: true });
  };

  const menuItems = [
    {
      title: "User",
      path: "/admin/users",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      ),
      roles: ["ADMIN"],
    },
    {
      title: "Order",
      path: "/admin/orders",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
      ),
      roles: ["ADMIN", "STAFF"],
    },
    {
      title: "Product",
      path: "/admin/products",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
      ),
      roles: ["ADMIN", "STAFF"],
      subItems: [
        { title: "Color", path: "/admin/colors", roles: ["ADMIN", "STAFF"] },
        { title: "Brand", path: "/admin/brands", roles: ["ADMIN", "STAFF"] },
        {
          title: "Category",
          path: "/admin/categories",
          roles: ["ADMIN", "STAFF"],
        },
        { title: "Size", path: "/admin/sizes", roles: ["ADMIN", "STAFF"] },
      ],
    },
    {
      title: "Report",
      path: "/admin/report",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
          />
        </svg>
      ),
      roles: ["ADMIN"],
    },
    {
      title: "Coupon", // Changed from Coupon to Coupons to match the route
      path: "/admin/coupons",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
          />
        </svg>
      ),
      roles: ["ADMIN", "STAFF"], // Added STAFF role to make it visible for staff users too
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });
  console.log(filteredMenuItems);
  if (!isAuthenticated) {
    return null; // hoặc hiển thị màn hình loading
  }
  return (
    <div className="flex h-screen">
      <div className="w-64 bg-white border-r">
        <div className="flex items-center gap-2 px-4 py-6 border-b">
          <img src="/nike-logo.png" alt="Nike Logo" className="w-10" />
          <span className="font-medium">Admin Dashboard</span>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {filteredMenuItems.map((item) => (
              <li key={item.title}>
                {item.subItems ? (
                  <>
                    <Link
                      to={item.path}
                      className={`flex items-center justify-between p-4 text-gray-700 hover:bg-gray-100 ${
                        location.pathname === item.path ? "bg-gray-100" : ""
                      }`}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-2">{item.title}</span>
                      </div>
                    </Link>
                    <ul className="pl-6 bg-gray-50">
                      {item.subItems
                        .filter(
                          (subItem) =>
                            !subItem.roles || subItem.roles.includes(user?.role)
                        )
                        .map((subItem) => (
                          <li key={subItem.title}>
                            <Link
                              to={subItem.path}
                              className={`block p-2 text-gray-600 hover:bg-gray-200 ${
                                location.pathname === subItem.path
                                  ? "bg-gray-200"
                                  : ""
                              }`}
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center p-4 text-gray-700 hover:bg-gray-100 ${
                      location.pathname === item.path ? "bg-gray-100" : ""
                    }`}
                  >
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b">
          <div className="flex justify-between items-center px-8 py-6">
            <h1 className="text-2xl font-medium">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{user?.role}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
