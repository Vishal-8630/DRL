import { Route, Routes, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import NewBillingEntry from "../pages/NewBillingEntry";
import ProtectedRoute from "../components/ProtectedRoute";
import LRCopy from "../pages/LRCopy";
import Bill from "../pages/Bill";
import BillingParty from "../pages/BillingParty";
import NotFound from "../pages/NotFound";
import BillEntry from "../pages/BillEntry";
import VehicleEntry from "../pages/VehicleEntry";
import NewVehicleEntry from "../pages/NewVehicleEntry";
import VehicleEntries from "../pages/VehicleEntries";
import NewBalanceParty from "../pages/NewBalanceParty";
import BalanceParties from "../pages/BalanceParties";
import PartyBalance from "../pages/PartyBalance";
import BillEntries from "../pages/BillEntries";

const billEntryRoutes = [
  { path: "new-entry", element: <NewBillingEntry /> },
  { path: "all-bill-entries", element: <BillEntries /> },
  { path: "lrcopy", element: <LRCopy /> },
  { path: "bill", element: <Bill /> },
  { path: "billing-party", element: <BillingParty /> },
];

const vehicleEntryRoutes = [
  { path: "new-entry", element: <NewVehicleEntry /> },
  { path: "all-vehicle-entries", element: <VehicleEntries /> },
  { path: "new-balance-party", element: <NewBalanceParty /> },
  { path: "all-balance-parties", element: <BalanceParties /> },
  { path: "party-balance", element: <PartyBalance /> }
]

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
        path="/bill-entry"
        element={
          <ProtectedRoute>
            <BillEntry />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="new-entry" replace />} />
        {billEntryRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>

      <Route
        path="/vehicle-entry"
        element={
          <ProtectedRoute>
            <VehicleEntry />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="new-entry" replace />} />
        {vehicleEntryRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
