import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const Register = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "https://ishop-2-f9qp.onrender.com";

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required("Enter your name"),
    email: Yup.string().email("Enter a valid email").required("Enter your email"),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number")
      .required("Enter your mobile number"),
    password: Yup.string().min(6, "At least 6 characters required").required("Enter your password"),
  });

  // Submit handler
  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const cleanedValues = {
        name: values.name.trim(),
        email: values.email.trim(),
        mobile: values.mobile.trim(),
        password: values.password.trim(),
      };

      await axios.post(`${apiUrl}/api/auth/register`, cleanedValues, { withCredentials: true });

      Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: "Redirecting to login...",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      setErrors({ general: errorMsg });

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: errorMsg,
      });
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

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Create Your Account</h2>

        <Formik
          initialValues={{ name: "", email: "", mobile: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Field
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Field
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <Field
                  type="text"
                  name="mobile"
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <ErrorMessage name="mobile" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Field
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters.</p>
              </div>

              {/* General error */}
              {errors.general && <div className="text-red-600 text-sm text-center">{errors.general}</div>}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2 rounded-lg shadow-md transition-all"
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </Form>
          )}
        </Formik>

        {/* Terms */}
        <p className="text-xs text-gray-600 mt-4 text-center">
          By creating an account, you agree to iShop’s{" "}
          <span className="text-blue-600 cursor-pointer">Conditions of Use</span> and{" "}
          <span className="text-blue-600 cursor-pointer">Privacy Notice</span>.
        </p>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Already have account */}
        <p className="text-sm text-gray-700 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
