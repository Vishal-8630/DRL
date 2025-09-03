import { NavLink, Outlet } from "react-router-dom";
import styles from "./VehicleEntry.module.scss";
import NavButton from "../../components/NavButton/NavButton";

const VehicleEntry = () => {
  const links = [
    { to: "new-entry", label: "New Vehicle Entry" },
    { to: "new-balance-party", label: "New Balance Party" },
    { to: "all-balance-parties", label: "All Balance Parties" },
    { to: "all-vehicle-entries", label: "All Vehicle Entries" },
    { to: "party-balance", label: "Party Balance" },
  ];

  return (
    <div className={styles.vehicleContainer}>
      <div className={styles.links}>
        {links.map((link) => (
          <NavButton link={link} />
        ))}
      </div>

      <div className={styles.outlet}>
        <Outlet />
      </div>
    </div>
  );
};

export default VehicleEntry;