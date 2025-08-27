import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const Register = () => {
  const navigate = useNavigate();

  //  Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required("Enter your name"),
    email: Yup.string()
      .email("Enter a valid email")
      .required("Enter your email"),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number")
      .required("Enter your mobile number"),
    password: Yup.string()
      .min(6, "At least 6 characters required")
      .required("Enter your password"),
  });

  // Submit handler
  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      // Trim values before sending
    const cleanedValues = {
      name: values.name.trim(),
      email: values.email.trim(),
      mobile: values.mobile.trim(),
      password: values.password.trim(),
    };

      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        values,
        { withCredentials: true }
      );

      //  Success alert
    Swal.fire({
      icon: "success",
      title: "Registration Successful!",
      text: "Redirecting to login...",
      timer: 2000,
      showConfirmButton: false,
    });
      //  redirect after short delay
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Registration failed",
      });
      //  Error alert
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white border border-gray-300 rounded-md p-6">
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

        <h2 className="text-xl font-semibold mb-4">Create account</h2>

        <Formik
          initialValues={{ name: "", email: "", mobile: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium">Your name</label>
                <Field
                  type="text"
                  name="name"
                  className="w-full p-2 border border-gray-400 rounded-sm"
                  onBlur={(e) => setFieldValue("name", e.target.value.trim())}
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium">Email</label>
                <Field
                  type="email"
                  name="email"
                  className="w-full p-2 border border-gray-400 rounded-sm"
                  onBlur={(e) => setFieldValue("email", e.target.value.trim())}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium">Mobile number</label>
                <Field
                  type="text"
                  name="mobile"
                  placeholder="10-digit mobile number"
                  className="w-full p-2 border border-gray-400 rounded-sm"
                  onBlur={(e) => setFieldValue("mobile", e.target.value.trim())}
                />
                <ErrorMessage
                  name="mobile"
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
                  placeholder="At least 6 characters"
                  className="w-full p-2 border border-gray-400 rounded-sm"
                  onBlur={(e) => setFieldValue("password", e.target.value.trim())}
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Passwords must be at least 6 characters.
                </p>
              </div>

              {/* General error */}
              {errors.general && (
                <div className="text-red-600 text-sm">{errors.general}</div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 rounded-sm"
              >
                {isSubmitting
                  ? "Creating account..."
                  : "Create your Amazon account"}
              </button>
            </Form>
          )}
        </Formik>

        {/* Terms */}
        <p className="text-xs text-gray-600 mt-4">
          By creating an account, you agree to Amazon's{" "}
          <span className="text-blue-600 cursor-pointer">Conditions of Use</span>{" "}
          and{" "}
          <span className="text-blue-600 cursor-pointer">Privacy Notice</span>.
        </p>

        <hr className="my-4" />

        {/* Already have account */}
        <p className="text-sm text-gray-700">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
