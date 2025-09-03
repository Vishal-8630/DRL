import { Outlet } from "react-router-dom";
import styles from "./BillEntry.module.scss";
import NavButton from "../../components/NavButton/NavButton";

const BillEntry = () => {
  const links = [
    { to: "new-entry", label: "New Bill Entry" },
    { to: "all-bill-entries", label: "All Bill Entries" },
    { to: "lrcopy", label: "LR Copy" },
    { to: "bill", label: "Bill" },
    { to: "billing-party", label: "Billing Party" },
  ];

  return (
    <div className={styles.billEntryContainer}>
      <div className={styles.links}>
        {links.map((link) => (
          <NavButton link={link} />
        ))}
      </div>

      <div className={styles.outlet}>
        <Outlet /> {/* Child route component renders here */}
      </div>
    </div>
  );
};

export default BillEntry;