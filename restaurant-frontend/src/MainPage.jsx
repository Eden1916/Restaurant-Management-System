import { useEffect, useState } from "react";
import landingImage from "./assets/landingImage.jpg";
import Burger from "./assets/burger.jpg"
import Burger1 from "./assets/burger2.jpg"
import Burger2 from "./assets/burger3.jpg"
import Burger3 from "./assets/burger4.jpg"
import pizza1 from "./assets/pizza1.jpg"
import pizza2 from "./assets/pizza2.jpg"
import pizza3 from "./assets/pizza3.jpg"
import pizza4 from "./assets/pizza4.jpg"
import { useNavigate } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Star, ChefHat, Users, Award } from "lucide-react";
import StarRating from "./components/StarRating";

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function getImageUrl(image_url) {
  if (!image_url) return null;
  if (image_url.startsWith('/uploads/')) return `${API_BASE}${image_url}`;
  return image_url;
}

const localMenuItems = [
  { name: "Burger", price: 600, image: Burger },
  { name: "Burger Special", price: 600, image: Burger1 },
  { name: "Double Burger", price: 700, image: Burger2 },
  { name: "Cheese Burger", price: 650, image: Burger3 },
  { name: "Margherita Pizza", price: 800, image: pizza1 },
  { name: "Pepperoni Pizza", price: 850, image: pizza2 },
  { name: "BBQ Pizza", price: 900, image: pizza3 },
  { name: "Veggie Pizza", price: 780, image: pizza4 },
];

export default function MainPage() {
  const navigate = useNavigate();
  const [dbMenuItems, setDbMenuItems] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/menu`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setDbMenuItems(d); })
      .catch(() => {});

    fetch(`${import.meta.env.VITE_API_URL}/reviews`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setReviews(d.reviews); })
      .catch(() => {});
  }, []);

  const displayItems = dbMenuItems.length > 0 ? dbMenuItems : localMenuItems;
  const visibleItems = showAll ? displayItems : displayItems.slice(0, 8);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  function handleLogin() { navigate("/Login"); }
  function handleSignup() { navigate("/Signup"); }

  function handleReservation() {
    const token = localStorage.getItem("token");
    if (!token) { localStorage.setItem("intendedPage", "/customer/reservations"); navigate("/Login"); return; }
    navigate("/customer/reservations");
  }

  function handleOrderOnline() {
    const token = localStorage.getItem("token");
    if (!token) { localStorage.setItem("intendedPage", "/customer/menu"); navigate("/Login"); return; }
    navigate("/customer/menu");
  }

  return (
    <div className="min-h-screen font-sans">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center bg-white/90 backdrop-blur-sm w-full h-16 z-50 shadow-sm px-4 md:px-8">
        <div className="flex items-center gap-2">
          <ChefHat className="w-7 h-7 text-red-950" />
          <span className="text-xl font-bold text-red-950">Liyu</span>
        </div>
        <ul className="hidden md:flex gap-8 items-center text-sm font-medium">
          <li><button onClick={() => scrollTo("home")} className="hover:text-red-950 transition">Home</button></li>
          <li><button onClick={() => scrollTo("menu")} className="hover:text-red-950 transition">Menu</button></li>
          <li><button onClick={() => scrollTo("reviews")} className="hover:text-red-950 transition">Reviews</button></li>
          <li><button onClick={() => scrollTo("about")} className="hover:text-red-950 transition">About</button></li>
          <li><button onClick={() => scrollTo("contact")} className="hover:text-red-950 transition">Contact</button></li>
        </ul>
        <div className="flex gap-2">
          <button onClick={handleLogin} className="bg-white border border-red-950 text-red-950 rounded-lg px-4 py-1.5 text-sm hover:bg-red-50 transition">Login</button>
          <button onClick={handleSignup} className="bg-red-950 text-white rounded-lg px-4 py-1.5 text-sm hover:bg-red-800 transition">Sign Up</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="relative h-screen flex items-center justify-center">
        <img src={landingImage} alt="Liyu Restaurant" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative text-center text-white px-4 space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold">Liyu Restaurant</h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-xl mx-auto">
            Authentic Ethiopian cuisine with a modern touch
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={handleOrderOnline}
              className="bg-red-950 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-red-800 transition"
            >
              Order Online
            </button>
            <button
              onClick={handleReservation}
              className="bg-white text-red-950 px-8 py-3 rounded-xl text-lg font-semibold hover:bg-gray-100 transition"
            >
              Reserve Table
            </button>
          </div>
        </div>
        <button
          onClick={() => scrollTo("menu")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white animate-bounce"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </section>

      {/* ── MENU ── */}
      <section id="menu" className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-red-950 mb-3">Our Menu</h2>
            <p className="text-gray-500 text-lg">Fresh ingredients, authentic flavors</p>
            <div className="w-16 h-1 bg-red-950 mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleItems.map((item, index) => (
              <div
                key={item.id || index}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition group"
              >
                <div className="relative overflow-hidden h-48">
                  <img
                    src={item.image || getImageUrl(item.image_url)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-red-950 font-bold text-lg">{item.price} ETB</span>
                    <button
                      onClick={handleOrderOnline}
                      className="bg-red-950 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-800 transition"
                    >
                      Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {displayItems.length > 8 && (
            <div className="text-center mt-10">
              <button
                onClick={() => setShowAll(!showAll)}
                className="bg-red-950 text-white px-8 py-3 rounded-xl hover:bg-red-800 transition font-medium"
              >
                {showAll ? "Show Less" : "View Full Menu"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section id="reviews" className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-red-950 mb-3">What Our Customers Say</h2>
            <p className="text-gray-500 text-lg">Real experiences from real guests</p>
            <div className="w-16 h-1 bg-red-950 mx-auto mt-4 rounded-full" />
          </div>

          {reviews.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              <p>No reviews yet — be the first to share your experience!</p>
              <button
                onClick={handleOrderOnline}
                className="mt-4 bg-red-950 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-red-800 transition"
              >
                Order & Review
              </button>
            </div>
          ) : (
            <>
              {/* Average rating */}
              <div className="flex flex-col items-center mb-10">
                <p className="text-6xl font-bold text-red-950">
                  {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                </p>
                <StarRating
                  value={Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)}
                  readonly
                  size="lg"
                />
                <p className="text-gray-500 mt-2">Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
              </div>

              {/* Review cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.slice(0, 6).map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-2xl p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-950 text-white flex items-center justify-center font-bold">
                          {review.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{review.username}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <StarRating value={review.rating} readonly size="sm" />
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm leading-relaxed">"{review.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-red-950 mb-3">About Us</h2>
            <div className="w-16 h-1 bg-red-950 mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800">
                A Taste of Ethiopia, A World of Flavor
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Liyu Restaurant was founded with a passion for sharing the rich and vibrant flavors
                of Ethiopian cuisine. Our chefs bring decades of experience and family recipes passed
                down through generations to create an unforgettable dining experience.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We source the freshest local ingredients and prepare every dish with care, ensuring
                that every meal reflects the warmth and hospitality that Ethiopian culture is known for.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                {[
                  { label: "Years of Experience", value: "10+" },
                  { label: "Menu Items", value: "50+" },
                  { label: "Happy Customers", value: "10K+" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-red-50 rounded-xl p-4 text-center min-w-24">
                    <p className="text-2xl font-bold text-red-950">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: ChefHat, title: "Expert Chefs", desc: "Our chefs are trained in authentic Ethiopian cooking techniques" },
                { icon: Star, title: "Quality Food", desc: "Only the freshest and finest ingredients make it to your plate" },
                { icon: Users, title: "Family Friendly", desc: "A warm environment welcoming guests of all ages" },
                { icon: Award, title: "Award Winning", desc: "Recognized for excellence in Ethiopian cuisine" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="bg-gray-50 rounded-2xl p-5 space-y-2">
                    <div className="w-10 h-10 bg-red-950 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-red-950 mb-3">Contact Us</h2>
            <p className="text-gray-500 text-lg">We'd love to hear from you</p>
            <div className="w-16 h-1 bg-red-950 mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact info */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800">Get In Touch</h3>
              <p className="text-gray-600">
                Have a question or want to make a reservation? Reach out to us through any of the channels below.
              </p>
              {[
                { icon: MapPin, label: "Address", value: "Bole Road, Addis Ababa, Ethiopia" },
                { icon: Phone, label: "Phone", value: "+251 911 234 567" },
                { icon: Mail, label: "Email", value: "info@liyurestaurant.com" },
                { icon: Clock, label: "Hours", value: "Mon–Sun: 8:00 AM – 10:00 PM" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-950 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{item.label}</p>
                      <p className="text-gray-600 text-sm">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Contact form */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h3 className="text-xl font-bold text-red-950 mb-6">Send a Message</h3>
              <form
                onSubmit={(e) => { e.preventDefault(); alert("Message sent! We'll get back to you soon."); e.target.reset(); }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input required placeholder="Abebe"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input required placeholder="Kebede"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" required placeholder="abebe@email.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input required placeholder="Reservation inquiry"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea rows={4} required placeholder="Your message..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950 resize-none" />
                </div>
                <button type="submit"
                  className="w-full bg-red-950 text-white py-3 rounded-xl font-semibold hover:bg-red-800 transition">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-red-950 text-white py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6" />
            <span className="text-xl font-bold">Liyu Restaurant</span>
          </div>
          <p className="text-red-200 text-sm">© 2025 Liyu Restaurant. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-red-200">
            <button onClick={() => scrollTo("menu")} className="hover:text-white transition">Menu</button>
            <button onClick={() => scrollTo("about")} className="hover:text-white transition">About</button>
            <button onClick={() => scrollTo("contact")} className="hover:text-white transition">Contact</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
