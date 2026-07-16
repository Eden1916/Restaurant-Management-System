import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  CalendarDays,
  UtensilsCrossed,
  Users,
  LogOut,
  ChefHat,
  X,
  Star,
} from "lucide-react";
import { authLogout } from "../api/auth";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "waiter", "chef", "customer"],
    paths: {
      admin: "/admin/dashboard",
      waiter: "/waiter/dashboard",
      chef: "/chef/dashboard",
      customer: "/customer/dashboard",
    },
  },
  {
    name: "Orders",
    icon: ShoppingBag,
    roles: ["admin", "waiter", "chef", "customer"],
    paths: {
      admin: "/admin/orders",
      waiter: "/waiter/orders",
      chef: "/chef/orders",
      customer: "/customer/orders",
    },
  },
  {
    name: "Menu",
    icon: UtensilsCrossed,
    roles: ["admin", "customer"],
    paths: {
      admin: "/admin/menu",
      customer: "/customer/menu",
    },
  },
  {
    name: "Reservations",
    icon: CalendarDays,
    roles: ["admin", "waiter", "customer"],
    paths: {
      admin: "/admin/reservations",
      waiter: "/waiter/reservations",
      customer: "/customer/reservations",
    },
  },
  {
    name: "Reviews",
    icon: Star,
    roles: ["customer"],
    paths: {
      customer: "/customer/reviews",
    },
  },
  {
    name: "Reports",
    icon: FileText,
    roles: ["admin"],
    paths: {
      admin: "/admin/reports",
    },
  },
  {
    name: "Users",
    icon: Users,
    roles: ["admin"],
    paths: {
      admin: "/admin/users",
    },
  },
];

export default function SideBar({ role, onClose }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  function handleLogout() {
    authLogout();
    navigate("/Login");
  }

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(role?.toLowerCase())
  );

  return (
    <aside className="flex flex-col h-screen w-64 bg-red-950 text-white fixed left-0 top-0 z-40 shadow-xl">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-red-800">
        <div className="flex items-center gap-2">
          <ChefHat className="w-7 h-7 text-white" />
          <span className="text-xl font-bold tracking-wide">Liyu</span>
        </div>
        {/* Close button — visible on mobile */}
        {onClose && (
          <button onClick={onClose} className="md:hidden text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-red-800">
        <p className="text-sm text-red-200">Logged in as</p>
        <p className="font-semibold truncate">{user.username || "User"}</p>
        <span className="text-xs bg-red-800 px-2 py-0.5 rounded-full capitalize">
          {role || "guest"}
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const path = item.paths[role?.toLowerCase()] || "/";
          return (
            <NavLink
              key={item.name}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-150 text-sm font-medium ${
                  isActive
                    ? "bg-white text-red-950"
                    : "text-red-100 hover:bg-red-800 hover:text-white"
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-red-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-100 hover:bg-red-800 hover:text-white transition-colors duration-150"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
