import React from 'react'
import { NavLink } from 'react-router-dom'
import styles from './NavButton.module.scss';
import { motion } from 'framer-motion';

interface NavButtonProps {
    link: { to: string, label: string }
}

const NavButton: React.FC<NavButtonProps> = ({ link }) => {
  return (
    <motion.div
        transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
    >
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.activeLink : ""}`
            }
          >
            {link.label}
          </NavLink>
          
    </motion.div>
  )
}

export default NavButton