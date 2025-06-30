import { Navigate, navigate } from "react-router-dom";
import useAuthStore from "../store/auth.store";

function RedirectAuthenticated({ children }) {
  const { user, isAuthenticated } = useAuthStore();

  let redirect;

  switch (user.role) {
    case "System Admin":
      redirect = "/admin-dashboard";
      break;

    case "Chief CEO":
      redirect = "/sectorial-plan";
      break;

    case "CEO":
      redirect = "/admin";
      break;
    case "Worker":
      redirect = "/admin";
      break;

    case "Minister":
      redirect = "/admin";
      break;

    case "Strategic Unit":
      redirect = "/admin";
      break;

    default:
      toast.error("Unknown role. Access denied.");
  }

  if (isAuthenticated) {
    <Navigate to={`${user.role}`} />;
  }
  return children;
}

export default RedirectAuthenticated;
