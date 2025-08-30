import styles from "./Navbar.module.scss";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { type AppDispatch, type RootState } from "../../app/store";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import { logout } from "../../features/auth";
import { addMessage } from "../../features/message";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

    const addActiveClass = ({ isActive }: { isActive: boolean }) => isActive ? styles.activeLink : "";

  const handleLogout = async () => {
    try {
      const response = await api.post("/auth/logout");
      dispatch(logout());
      dispatch(addMessage({ type: "success", text: response.data.message }));
      navigate("/login");
    } catch (error) {
      dispatch(
        addMessage({ type: "error", text: "Logout failed. Please try again." })
      );
    }
  };



  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <div className={styles.logo}>Divyanshi Road Lines</div>
      </div>
      <ul className={styles.links}>
        <li>
          <NavLink to="/" className={addActiveClass}>Home</NavLink>
        </li>
        {user ? (
          <>
            <li>
              <NavLink to="/new-entry" className={addActiveClass}>New Entry</NavLink>
            </li>
            <li>
              <NavLink to="/billing-party" className={addActiveClass}>Billing Party</NavLink>
            </li>
            <li>
              <NavLink to="/lrcopy" className={addActiveClass}>LR Copy</NavLink>
            </li>
            <li>
              <NavLink to="/bill" className={addActiveClass}>Bill</NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={addActiveClass}>Profile</NavLink>
            </li>
            <li>
              <a onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </a>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/login" className={addActiveClass}>Login</NavLink>
            </li>
            <li>
              <NavLink to="/register" className={addActiveClass}>Register</NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
