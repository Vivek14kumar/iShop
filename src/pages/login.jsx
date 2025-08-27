import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import axios from "axios";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Validation schema
  const validationSchema = Yup.object({
    identifier: Yup.string().required("Enter your email or mobile number"),
    password: Yup.string()
      .min(6, "Minimum 6 characters")
      .required("Enter your password"),
  });

  // Handle submit
  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        values,
        { withCredentials: true }
      );

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white border border-gray-300 rounded-md shadow-sm p-4 sm:p-6 max-h-screen overflow-y-auto">

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Link to="/" className="text-3xl font-bold text-yellow-400 whitespace-nowrap">
            iShop
          </Link>
        </div>
        
        {/* Amazon logo 
        <div className="flex justify-center mb-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
            alt="Amazon"
            className="h-8"
          />
        </div>*/}

        <h2 className="text-xl font-semibold mb-4">Sign-In</h2>

        <Formik
          initialValues={{ identifier: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form className="space-y-4">
              {/* Email or Mobile */}
              <div>
                <label className="block text-sm font-medium">
                  Email or mobile phone number
                </label>
                <Field
                  type="text"
                  name="identifier"
                  className="w-full p-2 border border-gray-400 rounded-sm"
                />
                <ErrorMessage
                  name="identifier"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium">Password</label>
                <Field
                  type="password"
                  name="password"
                  className="w-full p-2 border border-gray-400 rounded-sm"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* General error */}
              {errors.general && (
                <div className="text-red-600 text-sm">{errors.general}</div>
              )}

              {/* Sign-In button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 rounded-sm"
              >
                {isSubmitting ? "Signing in..." : "Sign-In"}
              </button>
            </Form>
          )}
        </Formik>

        {/* Help links */}
        <div className="mt-4 text-sm">
          <Link to="/forgetPassword" className="text-blue-600 hover:underline cursor-pointer">
            Forgot your password?
          </Link>
        </div>

        {/* Divider + Create Account */}
        <div className="w-full mt-6 text-center">
          <div className="flex items-center">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-500 text-sm">New to Amazon?</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <Link
            to="/register"
            className="block mt-4 w-full bg-gray-200 hover:bg-gray-300 text-black font-medium py-2 rounded-full"
          >
            Create your Amazon account
          </Link>
        </div>
      </div>
    </div>
  );
}
