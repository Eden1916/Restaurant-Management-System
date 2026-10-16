import { useState } from "react";
import { Star } from "lucide-react";

export default function StarRating({ value = 0, onChange, readonly = false, size = "md" }) {
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === "lg" ? "w-8 h-8" : size === "sm" ? "w-4 h-4" : "w-6 h-6";

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition"}`}
        >
          <Star
            className={`${sizeClass} ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-gray-300"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}
