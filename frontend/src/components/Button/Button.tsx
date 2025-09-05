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

  return (
    <div className={styles.buttonContainer}>
      <AnimatePresence>
        <motion.button
          type={type}
          onClick={onClick}
          disabled={disabled || loading}
          className={`${styles[variantClass]} ${styles[className]}`}
          whileHover={{ scale: 1.05 }}
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
