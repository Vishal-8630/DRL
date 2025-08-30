import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import Entry from "../pages/Entry";
import ProtectedRoute from "../components/ProtectedRoute";
import LRCopy from "../pages/LRCopy";
import Bill from "../pages/Bill";
import BillingParty from "../pages/BillingParty";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-entry"
        element={
          <ProtectedRoute>
            <Entry />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lrcopy"
        element={
          <ProtectedRoute>
            <LRCopy />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bill"
        element={
          <ProtectedRoute>
            <Bill />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing-party"
        element={
          <ProtectedRoute>
            <BillingParty />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
