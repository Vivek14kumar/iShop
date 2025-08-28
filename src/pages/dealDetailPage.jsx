import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Card,
  CardMedia,
  Typography,
  Chip,
  Button,
  Rating,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useCart } from "../context/cartContext"; // Make sure your context path is correct

export default function DealDetailPage() {
  const { dealId } = useParams();
  const [deal, setDeal] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { addToCart } = useCart(); // useCart context
  const isDealExpired = timeLeft === "Deal Expired";
  const isOutOfStock = deal?.stock <= 0;
  const apiUrl = import.meta.env.VITE_API_URL || "https://ishop-2-f9qp.onrender.com";

  useEffect(() => {
    async function fetchDeal() {
      try {
        const res = await axios.get(`${apiUrl}/api/todaysDeals/${dealId}`);
        setDeal(res.data);
        setSelectedImage(res.data.image || res.data.product.image);
      } catch (err) {
        console.error(err);
      }
    }
    fetchDeal();
  }, [dealId]);

  useEffect(() => {
    if (!deal) return;
    const interval = setInterval(() => {
      const diff = new Date(deal.endDate).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft("Deal Expired");
        clearInterval(interval);
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft(`${d}d ${h}h ${m}m`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [deal]);

  if (!deal) return <p style={{ textAlign: "center", padding: 20 }}>Loading deal...</p>;

  const product = deal.product;
  const finalPrice = Math.floor(deal.price - (deal.price * deal.discount) / 100);

  // CART BUTTON
  const handleAddToCart = () => {
    addToCart({
      _id: deal.product,
      dealId: deal.dealId,     //  Track which deal
      discount: deal.discount, //  Discount %
      name: deal.title,
      price: finalPrice,
      qty: quantity,
      image: selectedImage,
    });
    navigate("/cart"); // Redirect to cart page after adding
  };

  // ====== BUY NOW BUTTON ======
  const handleBuyNow = () => {
    navigate("/buy-now", {
      state: {
        cartItems: [
          {
            _id: deal.product,
            dealId: deal.dealId,     //  Track which deal
            discount: deal.discount, //  Discount %
            name: deal.title,
            price: finalPrice,
            qty: quantity,
            image: selectedImage,
          },
        ],
      },
    });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      {/* Timer Banner */}
      <Box sx={{ bgcolor: "error.main", color: "white", p: 1, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">Today’s Deal</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <AccessTimeIcon fontSize="small" />
          <Typography fontWeight="bold">{timeLeft}</Typography>
        </Box>
      </Box>

      {/* Main Product Section */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
        {/* Left: Image */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardMedia component="img" image={selectedImage} alt={deal.title} sx={{ objectFit: "contain", height: 450 }} />
          </Card>
          <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
            {[deal.image, ...(product.gallery || [])].map((img, idx) =>
              img ? (
                <CardMedia
                  key={idx}
                  component="img"
                  image={img}
                  sx={{ width: 60, height: 60, objectFit: "cover", border: selectedImage === img ? "2px solid #ff9900" : "1px solid #ccc", borderRadius: 1, cursor: "pointer" }}
                  onClick={() => setSelectedImage(img)}
                />
              ) : null
            )}
          </Box>
        </Box>

        {/* Right: Sticky Panel */}
        <Box sx={{ flex: 1, position: { md: "sticky" }, top: 100, alignSelf: "flex-start" }}>
          <Typography variant="h4" fontWeight="bold">{deal.title}</Typography>
          <Rating value={product.rating || 4} readOnly sx={{ mt: 1 }} />
          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <Typography variant="h5" color="error" fontWeight="bold">₹{finalPrice}</Typography>
            <Typography variant="body1" sx={{ textDecoration: "line-through", color: "text.secondary" }}>₹{deal.price}</Typography>
            <Chip label={`${deal.discount}% OFF`} color="success" />
          </Box>

          <Typography
            variant="body1"
            color={deal?.stock < 5 ? "error.main" : "success.main"}
            sx={{ mt: 1 }}
          >
            {deal?.stock <= 0
              ? "Out of Stock"
              : deal?.stock < 5
              ? `Hurry! Only ${deal.stock} left`
              : `In stock: ${deal.stock}`}
          </Typography>

          <Box mt={3} display="flex" flexDirection="column" gap={2}>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#ff9900",
                color: "white",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#e68a00" },
              }}
              onClick={handleAddToCart}
              disabled={isDealExpired}   // disable if deal expired
            >
              Add to Cart
            </Button>
            
            <Button
              variant="contained"
              sx={{
                bgcolor: "#f0c14b",
                color: "#111",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#ddb347" },
              }}
              onClick={handleBuyNow}
              disabled={isDealExpired || isOutOfStock}  //  disable if expired OR out of stock
            >
              Buy Now
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 3 }}>
            {product.shortDescription || "High quality product with best features."}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
