import { Navigate } from "react-router-dom";
import useAuthStore from "../store/auth.store";

function ProtectRoute({ children }) {
  const { isAuthenticated, isCheckingAuth, user } = useAuthStore();

  if (!isAuthenticated && !isCheckingAuth) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectRoute;
