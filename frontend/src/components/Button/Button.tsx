import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Button.module.scss";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  variant?: "primary" | "secondary";
}

const Button: React.FC<ButtonProps> = ({
  type = "button",
  text,
  onClick,
  disabled = false,
  loading = false,
  loadingText = "Loading...",
  className = "",
  variant = "primary",
}) => {
  const variantClass = variant === "primary" ? "primaryBtn" : "secondaryBtn";
  const bgColors = {
    primary: { initial: "rgba(12, 10, 10, 1)", hover: "rgba(12, 10, 10, 0.8)" },
    secondary: {
      initial: "rgba(108,117,125,0.7)",
      hover: "rgba(108,117,125,1)",
    },
  };

  return (
    <div className={styles.buttonContainer}>
      <AnimatePresence>
        <motion.button
          type={type}
          onClick={onClick}
          disabled={disabled || loading}
          className={`${styles[variantClass]} ${styles[className]}`}
          initial={{ backgroundColor: bgColors[variant].initial, opacity: 0.8 }}
          animate={{ opacity: 1 }}
          exit="initial"
          whileHover={{ backgroundColor: bgColors[variant].hover, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{
            duration: 0.3,
            type: "spring",
            stiffness: 400,
            damping: 15,
          }}
        >
          {loading ? loadingText : text}
        </motion.button>
      </AnimatePresence>
    </div>
  );
};

export default Button;
