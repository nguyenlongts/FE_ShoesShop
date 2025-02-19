import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Username: "",
    Password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const loginData = {
      Username: formData.Username.trim(),
      Password: formData.Password,
    };

    try {
      const response = await axios.post(
        "http://localhost:5258/login",
        loginData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data) {
        const token = response.data.token;
        console.log(token);
        handleTokenParsing(token);
      } else {
        handleLoginError("Đăng nhập thất bại");
      }
    } catch (error) {
      handleErrorResponse(error);
    }
  };

  const handleTokenParsing = (token) => {
    try {
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const isAdmin = payload.role === "admin";
      console.log(payload);
      if (isAdmin) {
        handleSuccessfulLogin(token, "ADMIN", "/admin/dashboard");
      } else {
        handleEmailConfirmation(payload, token);
      }
    } catch (tokenError) {
      console.error("Token parsing error:", tokenError);
      handleLoginError("Lỗi xử lý token");
    }
  };

  const handleEmailConfirmation = (payload, token) => {
    const isConfirmed = payload.email_confirm.toLowerCase() === "true";
    console.log("Email confirm: ", isConfirmed);
    if (!isConfirmed) {
      setError("Tài khoản chưa được xác thực");
      toast.error("Vui lòng xác thực email trước khi đăng nhập");
      navigate("/signin");
    } else {
      handleSuccessfulLogin(token, "USER", "/");
    }
  };

  const handleSuccessfulLogin = (token, role, navigateTo) => {
    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        Username: formData.Username,
        token,
        sub: JSON.parse(atob(token.split(".")[1]))?.sub,
        role,
      })
    );
    toast.success("Đăng nhập thành công");
    navigate(navigateTo);
  };

  const handleLoginError = (message) => {
    setError(message);
    toast.error(message);
  };

  const handleErrorResponse = (error) => {
    console.error("Login error:", error);
    console.log("Error response data:", error.response?.data);

    const errorData = error.response?.data;
    if (errorData?.code === 1017) {
      setError("Tài khoản chưa được xác nhận");
      toast.error(
        "Tài khoản chưa được xác nhận. Vui lòng kiểm tra email để xác nhận tài khoản."
      );
    } else if (errorData?.message === "User is inactive") {
      setError("Tài khoản đã bị vô hiệu hóa");
      toast.error("Tài khoản đã bị vô hiệu hóa");
    } else {
      setError(errorData?.message || "Đăng nhập thất bại");
      toast.error("Đăng nhập thất bại");
    }
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
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="Username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="mt-1">
                <input
                  id="Username"
                  name="Username"
                  type="text"
                  required
                  value={formData.Username}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    error ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="Password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="Password"
                  name="Password"
                  type="Password"
                  autoComplete="current-Password"
                  required
                  value={formData.Password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>
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
                  to="/forgot-Password"
                  className="font-medium text-gray-600 hover:text-gray-500"
                >
                  Forgot your Password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                SIGN IN
              </button>
            </div>
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

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Join Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
