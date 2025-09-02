import styles from "./Navbar.module.scss";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../app/store";
import api from "../../api/axios";
import { logout } from "../../features/auth";
import { addMessage } from "../../features/message";
import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { staggerContainer } from "../../animations/animations";
import Logo from "../../assets/logo.png";

// Framer Motion Variants
const linkVariants: Variants = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

const underlineVariants: Variants = {
  rest: { scaleX: 0 },
  hover: {
    scaleX: 1,
    transition: {
      duration: 0.3,
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 0.3,
    },
  },
};

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [activePath, setActivePath] = useState(location.pathname);

  const handleLogout = async () => {
    try {
      const response = await api.post("/auth/logout");
      dispatch(logout());
      dispatch(addMessage({ type: "success", text: response.data.message }));
      navigate("/login");
    } catch {
      dispatch(
        addMessage({ type: "error", text: "Logout failed. Please try again." })
      );
    }
  };

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const links = [
    { to: "/", label: "Home" },
    ...(user
      ? [
          { to: "/new-entry", label: "New Entry" },
          { to: "/billing-party", label: "Billing Party" },
          { to: "/lrcopy", label: "LR Copy" },
          { to: "/bill", label: "Bill" },
          { to: "/profile", label: "Profile" },
          { to: "/logout", label: "Logout", onClick: handleLogout },
        ]
      : [
          { to: "/login", label: "Login" },
          { to: "/register", label: "Register" },
        ]),
  ];

  const renderLink = (link: (typeof links)[number]) => {
    const isLogout = link.to === "/logout";
    const isActive = activePath === link.to;

    return (
      <motion.li
        key={link.to}
        className={`${
          isLogout ? styles.logoutButton + " " + styles.navlink : ""
        } ${isActive ? styles.activeLink : ""}`}
        variants={linkVariants}
        initial="rest"
        whileHover="hover"
        animate={isActive ? "hover" : "rest"}
        onClick={isLogout ? link.onClick : undefined}
      >
        {isLogout ? (
          <>
            {link.label}
            <motion.span
              className={styles.underline}
              variants={underlineVariants}
            />
          </>
        ) : (
          <NavLink
            to={link.to}
            end
            onClick={() => setActivePath(link.to)}
            className={styles.navlink}
          >
            {link.label}
            <motion.span
              className={styles.underline}
              variants={underlineVariants}
            />
          </NavLink>
        )}
      </motion.li>
    );
  };

  return (
    <motion.nav
      className={styles.navbar}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.brand}>
        <div className={styles.logo_img}>
          <img src={Logo} alt="Logo" />
        </div>
        <div className={styles.logo}>Divyanshi Road Lines</div>
      </div>

      <motion.ul
        className={styles.links}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {links.map(renderLink)}
      </motion.ul>
    </motion.nav>
  );
};

export default Navbar;
