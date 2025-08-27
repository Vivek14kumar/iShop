import React from "react";
import { QRCodeSVG } from "qrcode.react";
import "./shippingLabel.css"; // import CSS for print rules

export default function ShippingLabel({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-[350px]"
        id="shipping-label"
      >
        <h2 className="text-xl font-bold mb-3">Shipping Label</h2>
        <p><b>Order ID:</b> {order.orderId}</p>
        <p><b>Customer:</b> {order.shippingAddress.name}</p>
        <p><b>Phone:</b> {order.shippingAddress.phone}</p>
        <p>
          <b>Address:</b><br />
          {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
          {order.shippingAddress.state} - {order.shippingAddress.pincode}
        </p>
        <p><b>Payment:</b> {order.paymentMethod}</p>
        <p className="font-bold text-green-600 mt-2">
          Total: ₹
          {order.cartItems.reduce(
            (sum, item) => sum + (item.price || 0) * item.quantity,
            0
          )}
        </p>

        {/* QR Code */}
        <div className="mt-4"> {/* "flex justify-center" to put qr code in center */}
         {/* <QRCodeSVG value={order.orderId} size={100} />*/}
         <QRCodeSVG
          value={`
            Order Id: ${order.orderId}
            Name: ${order.shippingAddress.name}
            Email: ${order.userEmail}
            Phone: ${order.shippingAddress.phone}
            Address: ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
          `}
            size={100}        // adjust size as needed
            fgColor="#000"    // QR code color
            bgColor="#fff"    // background color
            level="H"         // high error correction
            title="Customer Shipping Info"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-6 print:hidden">
          <button
            className="bg-gray-400 px-3 py-1 rounded text-white"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="bg-blue-500 px-3 py-1 rounded text-white"
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
