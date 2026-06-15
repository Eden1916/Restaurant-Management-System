import { Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./MainPage.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";

// Customer
import CustomerDashboard from "./customer/CustomerDashboard.jsx";
import CustomerOrders from "./customer/CustomerOrders.jsx";
import CustomerMenu from "./customer/CustomerMenu.jsx";
import CustomerReservations from "./customer/CustomerReservations.jsx";

// Admin
import AdminDashboard from "./admin/AdminDashboard.jsx";
import AdminOrders from "./admin/AdminOrders.jsx";
import AdminMenu from "./admin/AdminMenu.jsx";
import AdminReservations from "./admin/AdminReservations.jsx";
import AdminReports from "./admin/AdminReports.jsx";
import AdminUsers from "./admin/AdminUsers.jsx";

// Waiter
import WaiterDashboard from "./waiter/WaiterDashboard.jsx";
import WaiterOrders from "./waiter/WaiterOrders.jsx";
import WaiterReservations from "./waiter/WaiterReservations.jsx";

// Chef
import ChefDashboard from "./chef/ChefDashboard.jsx";
import ChefOrders from "./chef/ChefOrders.jsx";

function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  if (!token || !user.role) return <Navigate to="/Login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/Login" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<MainPage />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Signup" element={<Signup />} />

      {/* Customer */}
      <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/orders" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerOrders /></ProtectedRoute>} />
      <Route path="/customer/menu" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerMenu /></ProtectedRoute>} />
      <Route path="/customer/reservations" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerReservations /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={["admin"]}><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/menu" element={<ProtectedRoute allowedRoles={["admin"]}><AdminMenu /></ProtectedRoute>} />
      <Route path="/admin/reservations" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReservations /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />

      {/* Waiter */}
      <Route path="/waiter/dashboard" element={<ProtectedRoute allowedRoles={["waiter"]}><WaiterDashboard /></ProtectedRoute>} />
      <Route path="/waiter/orders" element={<ProtectedRoute allowedRoles={["waiter"]}><WaiterOrders /></ProtectedRoute>} />
      <Route path="/waiter/reservations" element={<ProtectedRoute allowedRoles={["waiter"]}><WaiterReservations /></ProtectedRoute>} />

      {/* Chef */}
      <Route path="/chef/dashboard" element={<ProtectedRoute allowedRoles={["chef"]}><ChefDashboard /></ProtectedRoute>} />
      <Route path="/chef/orders" element={<ProtectedRoute allowedRoles={["chef"]}><ChefOrders /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
