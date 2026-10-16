import { useEffect, useState } from "react";
import DashboardLayout from "../shared/DashboardLayout";
import StarRating from "../components/StarRating";
import { MessageSquare } from "lucide-react";

export default function CustomerReviews() {
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [allReviews, setAllReviews] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Check if user can review
    fetch(`${import.meta.env.VITE_API_URL}/reviews/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setCanReview(d.canReview);
          if (d.existingReview) {
            setExistingReview(d.existingReview);
            setRating(d.existingReview.rating);
            setComment(d.existingReview.comment || "");
          }
        }
      })
      .catch(() => {});

    // Fetch all reviews
    fetch(`${import.meta.env.VITE_API_URL}/reviews`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setAllReviews(d.reviews); })
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) { alert("Please select a star rating"); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setExistingReview(data.review);
        // Refresh reviews list
        fetch(`${import.meta.env.VITE_API_URL}/reviews`)
          .then((r) => r.json())
          .then((d) => { if (d.success) setAllReviews(d.reviews); });
      } else {
        alert(data.error || "Failed to submit review");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const avgRating = allReviews.length
    ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
    : "0.0";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">Reviews</h1>
          <p className="text-gray-500 mt-1">Share your experience with us</p>
        </div>

        {/* Submit review */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {!canReview ? (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">You need to complete an order to leave a review</p>
              <p className="text-sm mt-1">Place an order and come back to share your experience</p>
            </div>
          ) : submitted || existingReview ? (
            <div className="text-center py-6">
              <div className="text-green-600 text-lg font-semibold mb-2">
                {submitted ? "Thank you for your review!" : "Your review"}
              </div>
              <StarRating value={rating} readonly size="lg" />
              {comment && <p className="text-gray-600 mt-3 max-w-md mx-auto">"{comment}"</p>}
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-sm text-red-950 underline"
              >
                Edit review
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
              <h2 className="text-lg font-semibold text-red-950">
                {existingReview ? "Update Your Review" : "Leave a Review"}
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <StarRating value={rating} onChange={setRating} size="lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Experience <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your dining experience..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="bg-red-950 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-800 transition disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>

        {/* All reviews */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-red-950">
              Customer Reviews ({allReviews.length})
            </h2>
            <div className="flex items-center gap-2">
              <StarRating value={Math.round(parseFloat(avgRating))} readonly />
              <span className="font-bold text-gray-800">{avgRating}</span>
            </div>
          </div>

          {allReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No reviews yet — be the first!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-red-950 text-white flex items-center justify-center font-bold text-sm">
                        {review.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{review.username}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <StarRating value={review.rating} readonly size="sm" />
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 text-sm mt-2 ml-12">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
