import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import Entry from "../pages/NewEntry";
import ProtectedRoute from "../components/ProtectedRoute";
import LRCopy from "../pages/LRCopy";
import Bill from "../pages/Bill";
import BillingParty from "../pages/BillingParty";
import NotFound from "../pages/NotFound";

const protectedRoutes = [
  { path: "/profile", element: <Profile /> },
  { path: "/new-entry", element: <Entry /> },
  { path: "/lrcopy", element: <LRCopy /> },
  { path: "/bill", element: <Bill /> },
  { path: "/billing-party", element: <BillingParty /> },
];

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      {protectedRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={<ProtectedRoute>{element}</ProtectedRoute>}
        />
      ))}

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;