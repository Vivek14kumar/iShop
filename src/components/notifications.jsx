import { useEffect } from "react";
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Function to show toast with optional glow for new orders
const notify = (notif) => {
  const { message, type = "info", isNew = false } = notif;

  toast(message, {
    type,
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    transition: Slide,
    className: isNew
      ? "animate-glow border-l-4 border-yellow-400 bg-yellow-50 text-yellow-800"
      : "",
  });
};

export default function Notifications({ externalNotifications = [] }) {
  useEffect(() => {
    if (!externalNotifications.length) return;

    externalNotifications.forEach((notif) => {
      notify(notif);
    });
  }, [externalNotifications]);

  return (
    <>
      <ToastContainer />
      <style>
        {`
          @keyframes glow {
            0% { box-shadow: 0 0 8px 2px rgba(253, 224, 71, 0.8); }
            50% { box-shadow: 0 0 12px 4px rgba(253, 224, 71, 1); }
            100% { box-shadow: 0 0 8px 2px rgba(253, 224, 71, 0.8); }
          }
          .animate-glow {
            animation: glow 1.5s ease-in-out 1;
          }
        `}
      </style>
    </>
  );
}
