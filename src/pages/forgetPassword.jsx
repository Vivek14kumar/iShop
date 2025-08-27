import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

// Validation schema
const validationSchema = Yup.object({
  emailOrMobile: Yup.string().required("Email or Mobile is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[!@#$%^&*]/, "Password must contain at least one special character")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

export default function ForgotPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordHint, setPasswordHint] = useState("");
  const navigate = useNavigate();

  const calculateStrengthAndHint = (password) => {
    let strength = 0;

    const rules = [
      { test: (p) => p.length >= 6, message: "Minimum 6 characters" },
      { test: (p) => /[A-Z]/.test(p), message: "At least 1 uppercase letter" },
      { test: (p) => /[a-z]/.test(p), message: "At least 1 lowercase letter" },
      { test: (p) => /[0-9]/.test(p), message: "At least 1 number" },
      { test: (p) => /[!@#$%^&*]/.test(p), message: "At least 1 special character (!@#$%^&*)" },
    ];

    // Calculate strength
    rules.forEach((rule) => {
      if (rule.test(password)) strength += 1;
    });

    // Show the first failing requirement as hint
    const firstFailing = rules.find((rule) => !rule.test(password));
    setPasswordHint(firstFailing ? firstFailing.message : "");

    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
      case 3:
        return "bg-yellow-400";
      case 4:
      case 5:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Password reset successfully!");
        setTimeout(() => navigate("/login"), 2000);
        resetForm();
        setPasswordStrength(0);
        setPasswordHint("");
      } else {
        toast.error(data.message || "Error resetting password");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error resetting password");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Reset Password</h2>
        <Formik
          initialValues={{ emailOrMobile: "", password: "", confirmPassword: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form className="flex flex-col gap-4">
              {/* Email or Mobile */}
              <div>
                <label className="block text-sm font-medium">Email or Mobile</label>
                <Field
                  type="text"
                  name="emailOrMobile"
                  placeholder="Enter registered email or mobile"
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
                <ErrorMessage
                  name="emailOrMobile"
                  component="p"
                  className="text-red-500 text-xs"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-sm font-medium">New Password</label>
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter new password"
                  className="mt-1 block w-full border rounded px-3 py-2 pr-10"
                  onChange={(e) => {
                    setFieldValue("password", e.target.value);
                    calculateStrengthAndHint(e.target.value);
                  }}
                  value={values.password}
                />
                <span
                  className="absolute right-3 top-9 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </span>
                <ErrorMessage
                  name="password"
                  component="p"
                  className="text-red-500 text-xs"
                />

                {/* Password Strength Meter */}
                {values.password && (
                  <>
                    <div className="mt-2 h-2 w-full bg-gray-300 rounded">
                      <div
                        className={`h-2 rounded ${getStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>

                    {/* One-by-one password hint */}
                    {passwordHint && (
                      <p className="text-xs text-red-500 mt-1">{passwordHint}</p>
                    )}
                  </>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="block text-sm font-medium">Confirm Password</label>
                <Field
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  className="mt-1 block w-full border rounded px-3 py-2 pr-10"
                />
                <span
                  className="absolute right-3 top-9 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </span>
                <ErrorMessage
                  name="confirmPassword"
                  component="p"
                  className="text-red-500 text-xs"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Reset Password
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
