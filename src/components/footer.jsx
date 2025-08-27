// Footer.jsx
import React from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-10">
      {/* Top Sections */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* About Section */}
        <div>
          <h3 className="text-white font-semibold mb-4">Get to Know Us</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">About Us</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
            <li><a href="#" className="hover:text-white">Press Releases</a></li>
            <li><a href="#" className="hover:text-white">iShop Blog</a></li>
          </ul>
        </div>

        {/* Help Section */}
        <div>
          <h3 className="text-white font-semibold mb-4">Help</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">Payments</a></li>
            <li><a href="#" className="hover:text-white">Shipping</a></li>
            <li><a href="#" className="hover:text-white">Cancellation & Returns</a></li>
            <li><a href="#" className="hover:text-white">FAQ</a></li>
          </ul>
        </div>

        {/* Consumer Policy */}
        <div>
          <h3 className="text-white font-semibold mb-4">Consumer Policy</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">Return Policy</a></li>
            <li><a href="#" className="hover:text-white">Terms of Use</a></li>
            <li><a href="#" className="hover:text-white">Security</a></li>
            <li><a href="#" className="hover:text-white">Privacy</a></li>
          </ul>
        </div>

        {/* Social Section */}
        <div>
          <h3 className="text-white font-semibold mb-4">Connect with Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white"><FaFacebook size={20} /></a>
            <a href="#" className="hover:text-white"><FaTwitter size={20} /></a>
            <a href="#" className="hover:text-white"><FaInstagram size={20} /></a>
            <a href="#" className="hover:text-white"><FaYoutube size={20} /></a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700"></div>

      {/* Bottom */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-sm">
        <p>&copy; {new Date().getFullYear()} iShop. All rights reserved.</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6"/>
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/MasterCard_Logo.svg" alt="Mastercard" className="h-6"/>
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6"/>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
