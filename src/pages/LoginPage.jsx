import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
const API_URL = "/api";

console.log(API_URL);
const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = ({ target: { name, value } }) => {
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await axios.post(
        `${API_URL}/api/Auth/login`,
        {
          Username: credentials.username.trim(),
          Password: credentials.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept-Charset": "UTF-8",
          },
        }
      );

      if (data?.token) {
        processLoginToken(data.token);
      }
    } catch (error) {
      handleLoginError(error);
    }
  };

  const processLoginToken = (token) => {
    try {
      const payload = jwtDecode(token);

      const isAdmin = payload.role === "admin";
      const isEmailConfirmed = payload.email_confirm.toLowerCase() === "true";

      if (!isEmailConfirmed) {
        toast.error("Vui lòng xác thực email trước khi đăng nhập");
        return;
      }

      const userInfo = {
        username: payload.Username || "",
        email: payload.Email || "",
        phone: payload.Phone || "",
        address: payload.Address || "", // Sẽ không bị lỗi font nữa
        userId: payload.UserId,
        role: isAdmin ? "ADMIN" : "USER",
      };

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(userInfo));

      toast.success("Đăng nhập thành công");
      navigate(isAdmin ? "/admin/dashboard" : "/");
    } catch (error) {
      toast.error("Lỗi xử lý token");
      console.error("Token parsing error:", error);
    }
  };

  const handleLoginError = (error) => {
    const errorData = error.response?.data;
    let errorMessage = "Đăng nhập thất bại";

    if (errorData?.code === 1017) {
      errorMessage = "Tài khoản chưa được xác nhận. Vui lòng kiểm tra email.";
    } else if (errorData?.message === "User is inactive") {
      errorMessage = "Tài khoản đã bị vô hiệu hóa";
    }

    setError(errorMessage);
    toast.error(errorMessage);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/">
          <img className="mx-auto h-12 w-auto" src="/nike.svg" alt="Nike" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          YOUR ACCOUNT FOR EVERYTHING NIKE
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={credentials.username}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Keep me signed in
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-gray-600 hover:text-gray-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              SIGN IN
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Not a Member?
                </span>
              </div>
            </div>

            <Link
              to="/register"
              className="mt-6 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Join Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
