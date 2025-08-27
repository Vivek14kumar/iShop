import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [carousel, setCarousel] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch categories, carousel, and deals
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, carRes, dealRes] = await Promise.all([
          fetch("http://localhost:5000/api/categories"),
          fetch("http://localhost:5000/api/carousels"),
          fetch("http://localhost:5000/api/todaysDeals"),
        ]);

        const cats = await catRes.json();
        const cars = await carRes.json();
        const dealsData = await dealRes.json();

        setCategories(cats);
        setCarousel(cars);
        setDeals(dealsData);
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto slide effect
  useEffect(() => {
    if (carousel.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carousel.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [carousel]);

  // Calculate discounted price
  const getFinalPrice = (price, discount) => {
    if (!discount || discount <= 0) return price;
    return (price - (price * discount) / 100).toFixed(2);
  };


  return (
    <div className="bg-gray-100">
      {/* Carousel */}
      <div className="w-full bg-gray-100 flex justify-center">
        <div
          className="relative overflow-hidden shadow-lg w-full"
          style={{
            maxWidth: "1920px",
            aspectRatio: "1920 / 600",
          }}
        >
          {carousel.length > 0 && (
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {carousel.map((c) => (
                <img
                  key={c._id}
                  src={`http://localhost:5000${c.image}`}
                  alt={c.title}
                  className="w-full h-full object-cover"
                />
              ))}
            </div>
          )}

          {/* Slide dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {carousel.map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full cursor-pointer ${
                  currentSlide === index ? "bg-white" : "bg-gray-400"
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg border hover:-translate-y-1 transition"
              >
                <div className="flex items-center justify-center w-full h-32 bg-white">
                  <img
                    src={`http://localhost:5000${category.image}`}
                    alt={category.name}
                    className="max-h-full max-w-full object-contain rounded"
                  />
                </div>
                <h3 className="font-semibold text-lg text-center">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Today’s Deals */}
    <section className="py-12 px-6 max-w-7xl mx-auto">
      {deals.filter((d)=>d.status !== "expired").length === 0 ? null : (
        <>
          <h2 className="text-2xl font-bold mb-6">Today's Deals</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {deals
            .filter((deal) => deal.status !== "expired") // hide expired
            .map((deal) => {
              const DealCard = (
                <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg cursor-pointer relative">
                  {/*Discount badge*/}
                  {deal.discount > 0 &&  (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                      {deal.discount}% OFF
                    </span>
                  )}
                  {/* Product Image */}
                  <div className="flex items-center justify-center w-full h-40 bg-white">
                    <img
                      src={deal.image}
                      alt={deal.title}
                      className="max-h-full max-w-full object-contain rounded"
                    />
    
                     {/* Coming soon overlay */}
                      {deal.status === "upcoming" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg animate-pulse">
                            Coming Soon
                          </span>
                        </div>
                      )}
                  </div>
                  <p className="font-semibold">{deal.title}</p>
                  <p className="text-red-600 font-bold">₹{deal.price}</p>
                </div>
              );
              // If upcoming → show plain div, else → wrap with Link
                return deal.status === "upcoming" ? (
                  <div key={deal._id}>{DealCard}</div>
                ) : (
                  <Link key={deal._id} to={`/todaysDeals/${deal.dealId}`}>
                    {DealCard}
                  </Link>
                );
            })}
          </div>
        </>
      )}
    </section>

    </div>
  );
}
