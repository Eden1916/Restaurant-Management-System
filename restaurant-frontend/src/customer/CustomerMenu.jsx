import { useEffect, useState } from "react";
import DashboardLayout from "../shared/DashboardLayout";
import { ShoppingBag, Plus, Minus, Trash2, X, ShoppingCart } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

function getImageUrl(image_url) {
  if (!image_url) return null;
  if (image_url.startsWith('/uploads/')) return `${API_BASE}${image_url}`;
  return image_url;
}

export default function CustomerMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderType, setOrderType] = useState("dine_in");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [specialInstruction, setSpecialInstruction] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/menu`)
      .then((res) => res.json())
      .then((data) => {
        setMenuItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load menu");
        setLoading(false);
      });
  }, []);

  function addToCart(item) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQuantity(id, delta) {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  async function handleCheckout() {
    if (cart.length === 0) return;
    if (orderType === "delivery" && !deliveryAddress) {
      alert("Please enter a delivery address");
      return;
    }

    setCheckingOut(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          items: cart.map((i) => ({
            menu_item_id: i.id,
            quantity: i.quantity,
            price: i.price,
          })),
          total_amount: cartTotal,
          order_type: orderType,
          delivery_address: deliveryAddress || null,
          delivery_phone: deliveryPhone || null,
          special_instruction: specialInstruction || null,
          payment_method: "tele_birr",
        }),
      });

      const data = await res.json();

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert(data.error || "Failed to initiate payment");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-red-950">Menu</h1>
            <p className="text-gray-500 mt-1">Browse and order from our menu</p>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative flex items-center gap-2 bg-red-950 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition"
          >
            <ShoppingCart className="w-5 h-5" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {loading && <div className="text-center py-16 text-gray-400">Loading menu...</div>}
        {error && <div className="bg-red-50 text-red-700 rounded-xl p-4">{error}</div>}
        {!loading && !error && menuItems.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-400 py-16">
            No menu items available
          </div>
        )}

        {/* Menu grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => {
            const cartItem = cart.find((i) => i.id === item.id);
            return (
              <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
                {item.image_url ? (
                  <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-300">
                    No Image
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 flex-1">{item.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-red-950">{item.price} ETB</span>
                    {cartItem ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-full bg-red-100 text-red-950 flex items-center justify-center hover:bg-red-200 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-semibold w-4 text-center">{cartItem.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-full bg-red-950 text-white flex items-center justify-center hover:bg-red-800 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="flex items-center gap-1 bg-red-950 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-800 transition"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-red-950 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Your Cart
              </h2>
              <button onClick={() => setShowCart(false)}>
                <X className="w-5 h-5 text-gray-500 hover:text-red-950" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-red-950 font-semibold">
                          {item.price * item.quantity} ETB
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-full bg-red-100 text-red-950 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-4 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-full bg-red-950 text-white flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Order options */}
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                      <select
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950"
                      >
                        <option value="dine_in">Dine In</option>
                        <option value="takeaway">Takeaway</option>
                        <option value="delivery">Delivery</option>
                      </select>
                    </div>

                    {orderType === "delivery" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                          <input
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="Enter your address"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input
                            value={deliveryPhone}
                            onChange={(e) => setDeliveryPhone(e.target.value)}
                            placeholder="09xxxxxxxx"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                      <textarea
                        rows={2}
                        value={specialInstruction}
                        onChange={(e) => setSpecialInstruction(e.target.value)}
                        placeholder="Any special requests..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Total</span>
                    <span className="text-xl font-bold text-red-950">{cartTotal} ETB</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut}
                    className="w-full bg-red-950 text-white py-3 rounded-xl font-semibold hover:bg-red-800 transition disabled:opacity-60"
                  >
                    {checkingOut ? "Processing..." : "Pay with Telebirr / CBE"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
