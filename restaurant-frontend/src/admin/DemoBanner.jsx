import { Eye } from "lucide-react";

export default function DemoBanner() {
  if (localStorage.getItem("isDemoAdmin") !== "true") return null;

  return (
    <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-sm px-4 py-2 flex items-center justify-center gap-2">
      <Eye className="w-4 h-4 shrink-0" />
      <span>
        You're viewing a <strong>read-only demo</strong> account. You can explore every
        page, but changes (editing, deleting, role changes) are disabled.
      </span>
    </div>
  );
}