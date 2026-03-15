import { Outlet, Navigate } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/reglog" replace />;
  }

  return <Outlet />; // هنا يتم عرض كل الصفحات المحمية
}