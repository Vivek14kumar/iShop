import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import axios from "axios";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    identifier: Yup.string().required("Enter your email or mobile number"),
    password: Yup.string()
      .min(6, "Minimum 6 characters")
      .required("Enter your password"),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://ishop-2-f9qp.onrender.com";
      const res = await axios.post(`${apiUrl}/api/auth/login`, values, { withCredentials: true });

      const { user, token } = res.data;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      login(user);

      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Login failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link to="/" className="text-4xl font-extrabold text-blue-600 tracking-wide">
            iShop
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Welcome Back</h2>

        <Formik
          initialValues={{ identifier: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form className="space-y-5">
              {/* Email / Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email or Mobile Number
                </label>
                <Field
                  type="text"
                  name="identifier"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <ErrorMessage name="identifier" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Field
                  type="password"
                  name="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* General error */}
              {errors.general && (
                <div className="text-red-600 text-sm text-center">{errors.general}</div>
              )}

              {/* Sign-In button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2 rounded-lg shadow-md transition-all"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </Form>
          )}
        </Formik>

        {/* Links */}
        <div className="mt-4 text-sm text-center">
          <Link to="/forgetPassword" className="text-blue-600 hover:underline">
            Forgot your password?
          </Link>
        </div>

        {/* Divider + Register */}
        <div className="my-6 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <Link
          to="/register"
          className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg text-center"
        >
          Create an Account
        </Link>
      </div>
    </div>
  );
}
