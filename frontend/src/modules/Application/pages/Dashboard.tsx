import { Outlet, Navigate } from "react-router-dom";
import { getStoredUser } from "../../Authentication/utils/auth.ts";
import { menuConfigByRole } from "../config/menuConfigByRole.tsx";
import Header from "../components/Header.tsx";
import Sidebar from "../components/Sidebar.tsx";

export default function Dashboard() {
  const user = getStoredUser();

  if (!user) return <Navigate to="/signin" replace />; // user nie je prihlásený

  const role = user.role?.toLowerCase(); // napr. "Teacher" → "teacher"
  const items = menuConfigByRole[role] || [];

  if (items.length === 0) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>Nemáš prístup k žiadnym modulom.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
    <Sidebar mobileOpen={false} onClose={() => {}} role={role} />
    <div style={{ flexGrow: 1, marginLeft: 240 }}>
      <Header onMenuClick={() => {}} />
      <main style={{ marginTop: "64px", padding: "1rem" }}>
        <Outlet />
      </main>
    </div>
  </div>
  );
}
