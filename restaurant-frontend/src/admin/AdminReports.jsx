import DashboardLayout from "../shared/DashboardLayout";
import { FileText, TrendingUp, ShoppingBag, Users } from "lucide-react";
import {useState, useEffect} from "react";
export default function AdminReports() {

  const [stats, setStats] = useState({revenue:0, orders:0, customers:0})
  const token = localStorage.getItem("token");


    useEffect(() => {
        //fetch revenue & orders count
      fetch(`${import.meta.env.VITE_API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  .then((r) => r.json())
  .then((d) => {
    if(d.success){
      const totalRevenue = d.orders.filter(order => order.payment_status === "completed").reduce((sum, order) => sum + (parseFloat(order.total_amount) || parseFloat(order.total_price) || 0), 0)
      setStats((s) =>({ ...s, revenue: totalRevenue.toFixed(2), orders:d.orders.length}))
      
    }
  })
  .catch(() => {})

  //fetch customer count
  fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
    headers: {Authorization : `Bearer ${token}`}
  })
  .then((r) => r.json())
  .then((d) => {
    if(d.success) {
      const customers = d.users.filter(User => User.role === "customer")
      setStats((s) => ({ ...s, user: customers.length}))
    }
  })

    })
  
  const reportCards = [
    { label: "Total Revenue", value: stats.revenue, icon: TrendingUp, color: "bg-green-500" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingBag, color: "bg-blue-500" },
    { label: "Total Customers", value: stats.user, icon: Users, color: "bg-red-950" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">Reports</h1>
          <p className="text-gray-500 mt-1">Restaurant performance overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {reportCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white rounded-xl shadow-sm p-5">
                <div className={`${card.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 text-center py-16 text-gray-400">
          <FileText className="w-14 h-14 mx-auto mb-3 opacity-30" />
          <p>Detailed reports coming soon</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
