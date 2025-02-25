import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Password: "",
    UserName: "",
    Email: "",
    ConfirmPassword: "",
    Phone: "",
    Gender: "",
    DoB: "",
    LastName: "",
    FirstName: "",
  });
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    console.log(formData.Email);
    // Email validation
    if (!formData.Email) {
      newErrors.Email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.Email)) {
      newErrors.Email = "Email is invalid";
    }

    // Password validation
    if (!formData.Password) {
      newErrors.Password = "Password is required";
    } else if (formData.Password.length < 6) {
      newErrors.Password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.Password)) {
      newErrors.Password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!formData.ConfirmPassword) {
      newErrors.ConfirmPassword = "Please confirm your password";
    } else if (formData.Password !== formData.ConfirmPassword) {
      newErrors.ConfirmPassword = "Passwords do not match";
    }

    // Username validation
    if (!formData.UserName) {
      newErrors.UserName = "Username is required";
    } else if (formData.UserName.length < 3) {
      newErrors.UserName = "Username must be at least 3 characters";
    }

    // Full name validation
    // if (!formData.fullName) {
    //   newErrors.fullName = 'Full name is required';
    // } else if (formData.fullName.length < 2) {
    //   newErrors.fullName = 'Full name must be at least 2 characters';
    // }

    // // Phone validation
    if (!formData.Phone) {
      newErrors.Phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.Phone)) {
      newErrors.Phone = "Phone number must be 10 digits";
    }

    // // Gender validation
    if (!formData.Gender) {
      newErrors.Gender = "Please select your Gender";
    }

    // // DoB validation
    if (!formData.DoB) {
      newErrors.DoB = "Date of birth is required";
    } else {
      const birthDate = new Date(formData.DoB);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        newErrors.DoB = "You must be at least 13 years old";
      }
    }

    // // Address validation
    if (!formData.Address) {
      newErrors.Address = "Address is required";
    } else if (formData.Address.length < 5) {
      newErrors.Address = "Please enter a complete Address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    if (validateForm()) {
      try {
        setIsSubmitting(true);

        const response = await axios.post(
          "http://localhost:5258/register",
          {
            UserName: formData.UserName.trim(),
            Password: formData.Password,
            Address: formData.Address,
            Gender: formData.Gender,
            DoB: formData.DoB,
            Email: formData.Email,
            Phone: formData.Phone,
            LastName: formData.LastName,
            FirstName: formData.FirstName,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 200) {
          toast.success("Registration successful!");
          setEmailSent(true);
          toast.success(
            "Registration successful! Check your email for verification."
          );
          navigate("/signin");
        } else {
          toast.error("Registration failed. Please try again.");
        }
      } catch (error) {
        console.error("Register error:", error);
        toast.error(error.response?.data?.message || "Registration failed");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      setFormData({
        Email: "",
        Password: "",
        ConfirmPassword: "",
        UserName: "",
        Phone: "",
        Gender: "",
        DoB: "",
        Address: "",
        LastName: "",
        FirstName: "",
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/">
          <img className="mx-auto h-12 w-auto" src="/nike.svg" alt="Nike" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          BECOME A NIKE MEMBER
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create your Nike Member profile and get first access to the very best
          of Nike products, inspiration and community.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!emailSent ? (
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div>
                <label
                  htmlFor="Email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="Email"
                    name="Email"
                    type="Email"
                    autoComplete="Email"
                    required
                    value={formData.Email}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.Email ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                  />
                  {errors.Email && (
                    <p className="mt-2 text-sm text-red-600">{errors.Email}</p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="Password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="Password"
                    type="password"
                    required
                    value={formData.Password}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.Password ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                  />
                  {errors.Password && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.Password}
                    </p>
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="ConfirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="ConfirmPassword"
                    name="ConfirmPassword"
                    type="password"
                    required
                    value={formData.ConfirmPassword}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.ConfirmPassword
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                  />
                  {errors.ConfirmPassword && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.ConfirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* First Name */}
              <div>
                <label
                  htmlFor="FirstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <div className="mt-1">
                  <input
                    id="FirstName"
                    name="FirstName"
                    type="text"
                    required
                    value={formData.FirstName}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.FirstName ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                  />
                  {errors.FirstName && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.FirstName}
                    </p>
                  )}
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="LastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <div className="mt-1">
                  <input
                    id="LastName"
                    name="LastName"
                    type="text"
                    required
                    value={formData.LastName}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.LastName ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                  />
                  {errors.LastName && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.LastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="UserName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="UserName"
                    type="text"
                    required
                    value={formData.UserName}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.UserName ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                  />
                  {errors.UserName && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.UserName}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="Phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="Phone"
                    name="Phone"
                    type="tel"
                    required
                    value={formData.Phone}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.Phone ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                  />
                  {errors.Phone && (
                    <p className="mt-2 text-sm text-red-600">{errors.Phone}</p>
                  )}
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <div className="mt-1 space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="Gender"
                      value="male"
                      checked={formData.Gender === "male"}
                      onChange={handleChange}
                      className="focus:ring-black h-4 w-4 text-black border-gray-300"
                    />
                    <span className="ml-2">Male</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="Gender"
                      value="female"
                      checked={formData.Gender === "female"}
                      onChange={handleChange}
                      className="focus:ring-black h-4 w-4 text-black border-gray-300"
                    />
                    <span className="ml-2">Female</span>
                  </label>
                </div>
                {errors.Gender && (
                  <p className="mt-2 text-sm text-red-600">{errors.Gender}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label
                  htmlFor="DoB"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date of Birth
                </label>
                <div className="mt-1">
                  <input
                    id="DoB"
                    name="DoB"
                    type="date"
                    required
                    value={formData.DoB}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.DoB ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                  />
                  {errors.DoB && (
                    <p className="mt-2 text-sm text-red-600">{errors.DoB}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="Address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <div className="mt-1">
                  <textarea
                    id="Address"
                    name="Address"
                    rows={3}
                    required
                    value={formData.Address}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.Address ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                  />
                  {errors.Address && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.Address}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-black hover:bg-gray-800"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black`}
                >
                  {isSubmitting ? "Processing..." : "JOIN US"}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">
                Verify Your Email
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                We have sent a verification link to your email. Please check
                your inbox and follow the link to activate your account.
              </p>
              <p className="mt-2 text-sm text-gray-600">
                If you did not receive the email, please check your spam folder
                or{" "}
                <button
                  className="text-blue-600 hover:underline"
                  onClick={handleResendVerification}
                >
                  click here to resend.
                </button>
              </p>
            </div>
          )}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already a member?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/signin"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
