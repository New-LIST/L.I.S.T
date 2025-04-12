import { Navigate } from "react-router-dom";
import { getStoredUser } from "../../Authentication/utils/auth";

export default function RootRedirect() {
  const user = getStoredUser();
  const role = user?.role?.toLowerCase();

  if (role === "student") return <Navigate to="/student" replace />;
  return <Navigate to="/dash" replace />;
}
